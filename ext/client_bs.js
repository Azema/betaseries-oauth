window.BS = {
    /**
     * Méthdoe abstraite pour la récupération des infos de la série
     * sur la page Web du player
     * @abstract
     * @return {Object} Les données pour retrouver les infos de la série
     */
    getInfosSerie: function() {
        throw new Error('Method abstract');
    },
    /**
     * Flag de debug du script
     * @type {Boolean}
     */
    debug: true,
    /**
     * Fonction de récupération des données stockées
     * @type {Function}
     */
    getValue: function() {},
    /**
     * Fonction de sauvegarde des données à stocker
     * @type {Function}
     */
    setValue: function() {},
    /**
     * Fonction de notification
     * @type {Function}
     */
    notification: function() {},
    /**
     * Identifiant du player
     * @type {String}
     */
    playerId: '',
    /**
     * Token de l'API BetaSeries
     * @type {String}
     */
    betaseries_api_user_token: '',
    /**
     * URL du serveur d'authentification pour l'API BetaSeries
     * @type {String}
     */
    serverBaseUrl: 'https://azema.github.io/betaseries-oauth',
    /**
     * Clé d'authentification de l'API BetaSeries
     * @type {String}
     */
    betaseries_api_user_key: '45028a0b0d3c',
    /**
     * Données concernant l'API BetaSeries
     * @type {Object}
     */
    api: {
        base: 'https://api.betaseries.com',
        versions: {current: '3.0', last: '3.0'},
        resources: [ // Les ressources disponibles dans l'API
            'badges', 'comments', 'episodes', 'friends', 'members', 'messages',
            'movies', 'news', 'oauth', 'pictures', 'planning', 'platforms',
            'polls', 'reports', 'search', 'seasons', 'shows', 'subtitles',
            'timeline'
        ],
        check: { // Les endpoints qui nécessite de vérifier la volidité du token
            episodes: ['display', 'list', 'search'],
            movies  : ['list', 'movie', 'search', 'similars'],
            search  : ['all', 'movies', 'shows'],
            shows   : ['display', 'episodes', 'list', 'search', 'similars']
        }
    },
    /**
     * Données de la série
     * @type {Object}
     */
    serie: {},
    /**
     * Fonction d'initialisation de l'objet BS
     * @param  {Object} data Toutes les données d'initialisation
     * @return {void}
     */
    init: function(data) {
        const keys = Object.keys(data);
        for (let k = 0; k < keys.length; k++) {
            if (BS.hasOwnProperty(keys[k])) {
                BS[keys[k]] = data[keys[k]];
            }
        }
        BS.betaseries_api_user_token = localStorage.getItem('betaseries_api_user_token');
    },
    /**
     * Fonction servant à sauter l'intro de la série
     * @param  {Number} intro La durée de l'intro
     * @return {void}
     */
    skipIntro: function(intro) {
        if (intro <= 0 || BS.playerId.length <= 0) return;
        const video = document.getElementById(BS.playerId);
        if (video) {
            if (Number.isInteger(intro) || (serie.episode % 2 !== 0)) {
                video.addEventListener('play', (event) => {
                    if (BS.debug) console.log('skipIntro: ', intro);
                    if (video.currentTime == 0) video.currentTime = intro;
                });
            }
        }
    },
    /**
     * Fonction servant à vérifier, dans une durée limitée, le retour
     * de la fonction check passée en paramètre
     *
     * @param  {Function}   check    La fonction de vérification de la présence du noeud
     * @param  {Function}   cb       La fonction de callback
     * @param  {Number}     timeout  La durée du timeout en secondes
     * @param  {Number}     interval L'intervalle de temps des vérifications en ms
     * @return {void}
     */
    waitPresent: function(check, cb, timeout = 2, interval = 50) {
        let loopMax = (timeout * 1000) / interval;
        let timer = setInterval(() => {
            if (--loopMax <= 0) {
                console.warn('waitPresent timeout');
                clearInterval(timer);
                return cb('error');
            }
            if (!check()) return;
            clearInterval(timer);
            return cb();
        }, interval);
    },
    /**
     * Fonction servant à attendre la présence d'un noeud dans le document
     *
     * @param  {string}   selector Le sélecteur CSS
     * @param  {Function} cb       La fonction de callback
     * @param  {Number}   timeout  La durée du timeout en secondes
     * @param  {Number}   interval L'intervalle de temps des vérifications en ms
     * @return {void}
     */
    waitDomPresent: function(selector, cb, timeout = 2, interval = 50) {
        const check = function() {
            return document.querySelectorAll(selector).length > 0;
        }
        BS.waitPresent(check, (err) => {
            if (err) {
                console.warn('Timeout waitDomPresent: %s', selector);
                return;
            }
            cb();
        }, timeout, interval);
    },
    /**
     * Fonction de recherche des données de la série sur l'API BetaSeries
     * @return {void}
     */
    findSerie: function() {
        let serie = BS.serie = BS.getInfosSerie();
        if (serie.title === null || serie.saison === null || serie.episode === null) {
            BS.notification({
                title: 'BetaSeries research',
                text: "Infos non récupérées (cf. console)",
                timeout: 5
            });
            if (BS.debug) console.warn('Infos non récupérées (' + JSON.stringify(serie) + ')');
            return;
        }
        /**
         * Fonction recherchant l'identifiant de l'épisode
         * @param  {Number} showId L'identifiant de la série
         * @return {void}
         */
        function getEpisode(showId) {
            BS.callBetaSeries('GET', 'shows', 'episodes', {id: showId, season: serie.saison, episode: serie.episode})
                .then(data => {
                if (data.episodes.length <= 0) {
                    BS.notification({
                        title: 'BetaSeries research',
                        text: `L'épisode (S${serie.saison}E${serie.episode}) n'a pas été trouvé sur BetaSeries`,
                        timeout: 5
                    });
                    console.warn("L'épisode n'a pas été trouvé, étrange!", serie);
                    return;
                }
                serie.episodeId = data.episodes[0].id;
                if (BS.debug) console.log('L\'identifiant de l\'épisode a été trouvé', serie);
            });
        }

        const resultSearch = BS.searchSerieByName(serie.title);
        if (resultSearch != null) {
            if (BS.debug) console.log('L\'identifiant de la série est déjà enregistré', resultSearch);
            serie.showId = resultSearch.id;
            getEpisode(serie.showId);
            BS.skipIntro(resultSearch.intro);
        } else {
            // Retrouver l'ID de la serie et de l'épisode
            BS.callBetaSeries('GET', 'shows', 'search', {title: encodeURIComponent(serie.title)})
            .then(data => {
                if (BS.debug) console.log('Search serie by title on API BetaSeries');
                let showId = null;
                if (data.shows.length <= 0) {
                    BS.notification({
                        title: 'BetaSeries research',
                        text: 'La série n\'a pas été trouvée sur BetaSeries',
                        timeout: 5
                    });
                    if (BS.debug) console.warn('La série n\'a pas été trouvée sur BetaSeries');
                    const msg = 'La série n\'a pas été trouvée sur BetaSeries.\nAvez-vous l\'identifiant ?';
                    let resultPrompt = window.prompt(msg);
                    if (resultPrompt != null && resultPrompt.length > 0) {
                        showId = parseInt(resultPrompt, 10);
                        const resultID = searchSerieById(showId);
                        if (resultID && serie.title != resultID.title) {
                            console.log('Le titre de la série est différent {title: %s, alias: %s}', resultID.title, serie.title);
                            saveSerie(showId, resultID.title, [serie.title]);
                        }
                    }
                }
                else if (data.shows.length > 1) {
                    let msg = 'Quelle série choisissez-vous (ID show) ?\n',
                        showIds = [],
                        resultID = null;
                    for (let s = 0; s < data.shows.length; s++) {
                        resultID = BS.searchSerieById(data.shows[s].id);
                        if (resultID && window.confirm(`L'identifiant de la série est il bien le ${data.shows[s].id}`)) {
                            showId = data.shows[s].id;
                            if (serie.title != resultID.title) {
                                saveSerie(data.shows[s].id, resultID.title, [serie.title]);
                            }
                            break;
                        }
                        msg += `\t${data.shows[s].id}: ${data.shows[s].title}\n`;
                        showIds.push(data.shows[s].id);
                    }
                    if (showId == null) {
                        let indice = parseInt(window.prompt(msg, data.shows[0].id), 10);
                        if (Number.isNaN(indice)) {
                            BS.notification({
                                title: "Response Error",
                                text: "L'identifiant fournit n'est pas correct",
                                timeout: 5
                            });
                            return;
                        }
                        showId = indice;
                        if (!showId || showIds.indexOf(showId) === -1) {
                            BS.notification({
                                title: 'BetaSeries research',
                                text: "L'ID de la série proposé ne correspond pas à ceux trouvés sur BetaSeries",
                                timeout: 5
                            });
                            if (showIds.indexOf(showId) === -1) {
                                if (!window.confirm('L\'identifiant ne correspond pas à ceux trouvés.\nEtes vous sur ('+showId+') ?')) {
                                    console.warn("L'ID de la série proposé ne correspond pas à ceux trouvés sur BetaSeries", showId, showIds);
                                    return;
                                }
                            } else {
                                console.warn("L'ID de la série proposé ne correspond pas à ceux trouvés sur BetaSeries", showId, showIds);
                                return;
                            }
                        }
                        const result = BS.searchSerieById(showId);
                        if (BS.debug) console.log('searchSerieById', result);
                        if (result) {
                            if (serie.title != result.title) {
                                if (BS.debug) console.log('Le titre de la série est différent {title: %s, alias: %s}', result.title, serie.title);
                                BS.saveSerie(showId, result.title, [serie.title]);
                            }
                        }
                        showId = parseInt(showId, 10);
                    }
                } else {
                    showId = data.shows[0].id;
                }
                if (!showId) {
                    console.warn("L'ID de la série n'a pas été récupéré sur BetaSeries");
                    return;
                }
                serie.showId = showId;
                let result = BS.searchSerieById(showId);
                if (!result) {
                    result = BS.saveSerie(showId, serie.title, []);
                } else if (result.title != serie.title) {
                    result = BS.saveSerie(showId, result.title, [serie.title], result.intro);
                }
                getEpisode(showId);
                BS.skipIntro(result.intro);
            });
        }
    },
    /**
     * Recherche une série par son nom
     * @param  {string} title Le titre de la série
     * @return {Object}       L'objet contenant les infos de la série
     */
    searchSerieByName: function(title) {
        const shows = BS.getValue('showIdsSaved', {});
        let keys = Object.keys(shows);
        for (let key of keys) {
            if (shows[key].title == title || shows[key].alias.indexOf(title) >= 0) {
                return shows[key];
            }
        }
        return null;
    },
    /**
     * Recherche une série par son ID
     * @param  {number} id L'identifiant de la série
     * @return {Object}    L'objet contenant les infos de la série
     */
    searchSerieById: function(id) {
        const shows = BS.getValue('showIdsSaved', {});
        if (Object.keys(shows).includes(id.toString())) {
            return shows[id];
        }
        return null;
    },
    /**
     * Enregistre les infos de la série
     * @param  {number} id          L'identifiant de la série
     * @param  {string} title       Le titre de la série
     * @param  {Array}  [alias=[]]  Tableau des alias de la série
     * @param  {Number} [intro=0]   Durée de l'intro de la série
     * @return {Object}             L'objet contenant les infos de la série
     */
    saveSerie: function(id, title, alias = [], intro = 0) {
        //console.log('saveSerie params: ', {id, title, alias, intro});
        const showIdsSaved = BS.getValue('showIdsSaved', {});
        if (id == null || title == null) {
            console.warn("L'identifiant ou le titre de la série sont nul.", {id, title});
            return;
        }
        const result = BS.searchSerieById(id);
        if (result) {
            alias = result.alias.concat(alias);
            if (intro === 0) {
                intro = result.intro;
            }
        }
        showIdsSaved[id] = {id, title, alias, intro};
        BS.setValue('showIdsSaved', showIdsSaved);
        //console.log('saveSerie', showIdsSaved[id]);
        return showIdsSaved[id];
    },
    /**
     * Authentification à l'API de BetaSeries
     * @return {Promise<string>} Le message d'authentification
     */
    authenticate: function() {
        if (window.fullscreen) {
            console.log('window fullscreen true');
            let wait = function(resolve) {
                if (!window.fullScrenn) {
                    resolve(authenticate());
                } else {
                    setTimeout(wait, 10000, resolve);
                }
            };

            // TODO: mettre en attente l'authentification jusqu'à la sortie du mode fullscreen
            return new Promise(resolve => {
                setTimeout(wait, 10000, resolve);
            });
        }
        if (BS.debug) console.log('authenticate');
        let container = document.createElement('div');
        container.id = 'containerIframe';
        container.style = 'position:fixed;top:80px;left:0;width:100%;height:400px;margin:auto;text-align:center;z-index:1000;';
        let frame = document.createElement('iframe');
        frame.id = 'userscript';
        frame.title = 'connexion à BetaSeries';
        frame.width = '50%';
        frame.height = '400';
        frame.src = BS.serverBaseUrl + "/index.html";
        frame.style = "background:white;margin:auto;";
        container.appendChild(frame);
        document.body.appendChild(container);
        return new Promise((resolve, reject) => {
            window.addEventListener("message", receiveMessage, false);
            function receiveMessage(event) {
                const origin = new URL(BS.serverBaseUrl).origin;
                // if (BS.debug) console.log('receiveMessage', event);
                if (event.origin !== origin) {
                    //if (BS.debug) console.error('receiveMessage {origin: %s}', event.origin, event);
                    reject('event.origin is not %s', origin);
                    return;
                }
                let msg = event.data.message;
                if (msg === 'access_token') {
                    BS.betaseries_api_user_token = event.data.value;
                    localStorage.setItem('betaseries_api_user_token', BS.betaseries_api_user_token);
                    document.getElementById('containerIframe').remove();
                    resolve(msg);
                    window.removeEventListener("message", receiveMessage, false);
                } else {
                    if (BS.debug) console.error('Erreur de récuperation du token', event);
                    // reject(event.data);
                    // window.removeEventListener("message", receiveMessage, false);
                    //notification('Erreur de récupération du token', 'Pas de message');
                }
            }
        });
    },
    /**
     * Fonction d'appel à l'API de BetaSeries
     * @param  {string} type     Le verbe HTTP (GET, POST, etc...)
     * @param  {string} resource Le type de ressource
     * @param  {string} method   L'action appelée sur la ressource
     * @param  {Array}  args     Les paramètres à passer à l'appel
     * @return {Promise<Object>} Les données retournées par l'API
     */
    callBetaSeries: function(type, resource, method, args) {
        if (BS.api.resources.indexOf(resource) === -1) {
            throw new Error(`Ressource (${resource}) inconnue dans l\'API.`);
        }
        let check = false,
            // Les en-têtes pour l'API
            myHeaders = {
                'Accept'                : 'application/json',
                'X-BetaSeries-Version'  : BS.api.versions.current,
                'X-BetaSeries-Token'    : BS.betaseries_api_user_token,
                'X-BetaSeries-Key'      : BS.betaseries_api_user_key
            },
            checkKeys = Object.keys(BS.api.check);

        if (BS.debug) {
            console.log('callBetaSeries', {
                type: type,
                resource: resource,
                method: method,
                args: args
            });
        }

        // On check si on doit vérifier la validité du token
        // (https://www.betaseries.com/bugs/api/461)
        if ((checkKeys.indexOf(resource) !== -1 &&
            BS.api.check[resource].indexOf(method) !== -1) ||
            (resource === 'members' && method === 'is_active'))
        {
            check = true;
        }

        return new Promise((resolve, reject) => {
            if (check) {
                let paramsFetch = {
                    method: 'GET',
                    headers: myHeaders,
                    mode: 'cors',
                    cache: 'no-cache'
                };
                if (BS.debug) console.info('%ccall /members/is_active', 'color:blue');
                fetch(`${BS.api.base}/members/is_active`, paramsFetch).then(resp => {
                    if ( ! resp.ok) {
                        // Appel de l'authentification pour obtenir un token valide
                        BS.authenticate().then(() => {
                            if (resource === 'members' && method === 'is_active') {
                                resolve();
                                return;
                            }
                            fetchUri(resolve, reject);
                        }).catch(err => reject(err) );
                        return;
                    } else {
                        if (resource === 'members' && method === 'is_active') {
                            resolve();
                            return;
                        }
                        fetchUri(resolve, reject);
                    }
                }).catch(error => {
                    if (BS.debug) console.log('Il y a eu un problème avec l\'opération fetch: ' + error.message);
                    console.error(error);
                    reject(error.message);
                });
            } else {
                fetchUri(resolve, reject);
            }
        });
        function fetchUri(resolve, reject) {
            let uri = `${BS.api.base}/${resource}/${method}`,
                initFetch = { // objet qui contient les paramètres de la requête
                    method: type,
                    headers: myHeaders,
                    mode: 'cors',
                    cache: 'no-cache'
                },
                keys = Object.keys(args);
            // On crée l'URL de la requête de type GET avec les paramètres
            if (type === 'GET' && keys.length > 0) {
                let params = [];
                for (let key of keys) {
                    params.push(key + '=' + args[key]);
                }
                uri += '?' + params.join('&');
            } else if (keys.length > 0) {
                initFetch.body = new URLSearchParams(args);
            }

            fetch(uri, initFetch).then(response => {
                if (BS.debug) console.log('fetch (%s %s) response status: %d', type, uri, response.status);
                // On récupère les données et les transforme en objet
                response.json().then((data) => {
                    if (BS.debug) console.log('fetch (%s %s) data', type, uri, data);
                    // On gère le retour d'erreurs de l'API
                    if (data.hasOwnProperty('errors') && data.errors.length > 0) {
                        const code = data.errors[0].code,
                              text = data.errors[0].text;
                        if (code === 2005 ||
                            (response.status === 400 && code === 0 &&
                                text === "L'utilisateur a déjà marqué cet épisode comme vu."))
                        {
                            reject('changeStatus');
                        } else if (code == 2001) {
                            // Appel de l'authentification pour obtenir un token valide
                            BS.authenticate().then(() => {
                                BS.callBetaSeries(type, resource, method, args)
                                .then((data) => resolve(data), (err) => reject(err));
                            }, (err) => {
                                reject(err);
                            });
                        } else {
                            reject(JSON.stringify(data.errors[0]));
                        }
                        return;
                    }
                    resolve(data);
                    return;
                });
                // On gère les erreurs réseau
                if (!response.ok) {
                    console.error('Fetch erreur network', response);
                    reject(response);
                    return;
                }
            }).catch(error => {
                if (BS.debug) console.log('Il y a eu un problème avec l\'opération fetch: ' + error.message);
                console.error(error);
                reject(error.message);
            });
        }
    }
};