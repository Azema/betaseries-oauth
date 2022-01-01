/* eslint-disable no-undef */
'use strict';

/**
 *
 * @param {IGrunt} grunt
 */
module.exports = function(grunt) {
    // On définit les fins de ligne en mode linux
    grunt.util.linefeed = '\n';

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
        }
    });
    grunt.loadNpmTasks('grunt-contrib-cssmin');
};