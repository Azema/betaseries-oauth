/* eslint-disable no-undef */
'use strict';

var path = require('path');

/**
 *
 * @param {IGrunt} grunt
 */
module.exports = function(grunt) {
    // On définit les fins de ligne en mode linux
    grunt.util.linefeed = '\n';

    grunt.registerTask('build', ['cssmin', 'uglify', 'sri', 'version']);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        cssmin: {
            target: {
                files: [{
                    expand: true,
                    cwd: 'css',
                    src: ['*.css', '!*.min.css'],
                    dest: 'css',
                    ext: '.min.css'
                }]
            }
        },
        uglify: {
            target: {
                options: {
                    sourceMap: false
                },
                files: [{
                    expand: true,
                    cwd: 'js',
                    src: ['*.js', '!*.min.js'],
                    dest: 'js',
                    ext: '.min.js'
                }]
            }
        },
        sri: {
            dist: {
                options: {
                    algorithm: 'sha384'
                },
                src: ['css/*.min.css', 'js/*.min.js'],
                dest: ['./sri.sha384', './config/betaseries/manifest.json']
            }
        },
        version: {
            v: '<%= pkg.version %>'
        }
    });
    grunt.registerMultiTask('sri', 'Calcule le SRI des fichiers statiques', function() {
        if (!this.data.src || !this.data.dest) {
            grunt.log.error("Veuillez fournir les paramètres 'src' et 'dest' à la tâche");
            return false;
        }
        const crypto = require('crypto');
        const options = this.options({
            algorithm: 'sha384'
        });
        const calcHash = (url, algorithm) => {
            const fileContent = grunt.file.read(url);

            // openssl dgst -sha384 -binary file.js | openssl base64 -A
            return crypto.createHash(algorithm).update(fileContent).digest('base64');
        };
        const changeSri = function(filename, dest, sri) {
            grunt.verbose.writeln('Change SRI in ' + dest);
            if (!grunt.file.exists(dest)) {
                grunt.log.error(`Le fichier de destination (${dest}) n'existe pas.`);
                return;
            }
            if (dest === './sri.sha384') {
                const reg = new RegExp(`^${filename}:\\s.*$`, 'm');
                grunt.verbose.writeln(`filename: ${filename}, dest: ${dest}, reg: ${reg}, sri: ${sri}`);
                let content = grunt.file.read(dest)
                            .replace(reg, `${filename}: ${sri}`);
                if (content.length <= 0) {
                    grunt.log.error('Erreur durant le remplacement du hash dans le fichier ' + dest);
                    return;
                }
                grunt.file.write(dest, content);
            } else if (dest === './config/betaseries/manifest.json') {
                const reg = new RegExp(`"${filename}":\\s".*"$`, 'm');
                grunt.verbose.writeln(`filename: ${filename}, dest: ${dest}, reg: ${reg}, sri: ${sri}`);
                let content = grunt.file.read(dest)
                            .replace(reg, `"${filename}": "${sri}"`);
                if (content.length <= 0) {
                    grunt.log.error('Erreur durant le remplacement du hash dans le fichier ' + dest);
                    return;
                }
                grunt.file.write(dest, content);
            }
        };
        this.files.forEach(
            /**
             * @param {grunt.file.IFilesConfig} f
             */
            function(f) {
                f.src.filter(function(filepath) {
                    // Warn on and remove invalid source files (if nonull was set).
                    if (!grunt.file.exists(filepath)) {
                        grunt.log.warn('Source file "' + filepath + '" not found.');
                        return false;
                    }
                    return true;
                }).map((filepath) => {
                    grunt.verbose.writeln('filepath: ' + filepath);
                    const hash = calcHash(filepath, options.algorithm);
                    grunt.verbose.writeln('hash: ' + hash);
                    const sri = `${options.algorithm}-${hash}`;
                    if (f.dest instanceof Array) {
                        for (let d = 0; d < f.dest.length; d++) {
                            changeSri(path.basename(filepath), f.dest[d], sri);
                        }
                    } else {
                        changeSri(path.basename(filepath), f.dest, sri);
                    }
                });
            }
        );
    });
    grunt.registerMultiTask('version', 'Remplace le numéro de version du manifest par celui du package', function() {
        const version = this.data;
        if (!version || version.length <= 0) {
            grunt.log.error('Le paramètre "v" est requis');
            return false;
        }
        function incrementVersion(numero) {
            let minor = parseInt(numero.split('.').pop(), 10);
            return numero.replace(/\d+$/, ++minor);
        }
        const filepaths = [
            path.resolve('./package.json'),
            path.resolve('./config/betaseries/manifest.json')
        ];
        const numero = incrementVersion(version);
        for (let p = 0; p < filepaths.length; p++) {
            grunt.verbose.writeln('Change Version in ' + filepaths[p]);
            if (!grunt.file.exists(filepaths[p])) {
                grunt.log.error(`Le fichier de destination (${filepaths[p]}) n'existe pas.`);
                continue;
            }
            let content = grunt.file.read(filepaths[p])
                        .replace(/"version":(\s+)"[0-9.]*"/, `"version":$1"${numero}"`);
            grunt.file.write(filepaths[p], content);
        }
    });
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
};