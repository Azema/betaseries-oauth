(function (root, factory) {
    if (typeof exports === "object") {
        module.exports = factory(root);
    } else if (typeof define === "function" && define.amd) {
        define([], factory);
    } else {
        root.BS = factory(root);
    }
}) (typeof global !== "undefined" ? global : this.window || this.global, function (root) {

    "use strict";

    if (typeof define === "function" && define.amd){
        root = window;
    }
    /**
     * Fonction vide et anonyme
     */
    const noop = () => {};
    /**
     * Options par défaut de la classe BS
     */
    const defaults = {
        debug: false,
        getValue: noop,
        setValue: noop,
        notification: noop,
        serverBaseUrl: 'https://azema.github.io/betaseries-oauth',
        betaseries_api_user_key: '',
        platform: '',
        playerId: '',
        serie: {
            title:null,
            saison:null,
            episode: null,
            showId: null,
            episodeId: null,
            watched: false,
            country: null,
            platform: {showId: null}
        }
    }

    function BS(options) {
        this.settings = Object.assign({}, defaults, options || {});
        this.init();
    }

    BS.prototype = {
        /**
         * Méthdoe abstraite pour la récupération des infos de la série
         * sur la page Web du player
         * @abstract
         * @return {Object} Les données pour retrouver les infos de la série
         */
        getInfosSerie: function() {
            throw new Error('Method abstract');
        },
        noop: noop,
        /**
         * Token de l'API BetaSeries
         * @type {String}
         */
        betaseries_api_user_token: '',
        /**
         * Données concernant l'API BetaSeries
         * @type {Object}
         */
        api: {
            base: 'https://api.betaseries.com',
            versions: {current: '3.0', last: '3.0'},
            resources: [ // Les ressources disponibles dans l'API
                'badges', 'comments', 'episodes', 'friends', 'members', 'messages',
                'movies', 'news', 'oauth', 'persons', 'pictures', 'planning', 'platforms',
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
         * Tableau des events
         * @type {Object}
         */
        events: {
            skipIntro: false,
            message: false,
            executed: {skipIntro: false}
        },
        platforms: {
            viki: {country: 'kr'}
        },
        settings: {},
        /**
         * Fonction d'initialisation de l'objet BS
         * @param  {Object} options Toutes les données d'initialisation
         * @return {void}
         */
        init: function() {
            const self = this;
            for (let k of Object.keys(this.settings)) {
                Object.defineProperty(this, k, {
                    value: self.settings[k],
                    writable: true
                });
            }
            if (!this.settings.betaseries_api_user_key || this.settings.betaseries_api_user_key.length <= 0) {
                throw new Error('API BetaSeries Key is missing in options');
            }
            this.betaseries_api_user_token = localStorage.getItem('betaseries_api_user_token');
            // console.log('BS object', this);
        },
        _reinit: function() {
            this.events.skipIntro = false;
            this.events.message = false;
            this.events.executed.skipIntro = false;
            this.serie = this.getSerieBlank();
        },
        /**
         * getPlayer - Retourne le NodeElement du player video
         * @return {HTMLElement} Le noeud video
         */
        getPlayer: function() {
            return document.getElementById(this.settings.playerId);
        },
        /**
         * Retourne un objet serie vierge
         * @return {Object} L'objet serie vierge
         */
        getSerieBlank: function() {
            return Object.assign({}, defaults.serie);
        },
        /**
         * Fonction servant à sauter l'intro de la série
         * @param  {Number} intro La durée de l'intro
         * @return {void}
         */
        skipIntro: function(intro) {
            if (this.debug) console.log('skipIntro', {intro, playerId: this.playerId, event: this.events.skipIntro});
            if (intro <= 0 || this.playerId.length <= 0 || this.events.skipIntro) return;
            const video = this.getPlayer();
            if (this.debug) console.log('skipIntro video', video);
            const self = this;
            const _run = (video) => {
                if (video.currentTime <= 5 && !self.events.executed.skipIntro) {
                    self.events.executed.skipIntro = true;
                    if (this.debug) console.log('Event skipIntro: ', intro);
                    if (typeof video.fastSeek === 'function') video.fastSeek(intro);
                    video.currentTime = intro;
                }
            };
            if (video) {
                if (Number.isInteger(intro) || (this.serie.episode % 2 !== 0)) {
                    video.addEventListener('play', () => _run(video));
                    video.addEventListener('playing', () => _run(video));
                    this.events.skipIntro = true;
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
            this.waitPresent(check, (err) => {
                if (err) {
                    console.warn('Timeout waitDomPresent: %s', selector);
                    return;
                }
                cb();
            }, timeout, interval);
        },
        /**
         * getBSUrl - Récupère et retourne l'URL de la page de la série sur le site BetaSeries
         * @param  {number} id -    L'identifiant BetaSeries de la série
         * @param  {string} title - Le titre de la série
         * @return {string | null}       L'URL de la page de la série sur BetaSeries
         */
        getBSUrl: function(id, title) {
            let resultSearch = this.searchSerieById(id);
            if (resultSearch !== null) {
                const idBS = resultSearch.id;
                return this.callBetaSeries('GET', 'shows', 'display', {id: idBS})
                    .then(data => {
                        if (data && data.show) {
                            return data.show.slug;
                        }
                        return null;
                    });
            }
            const country = this.platforms[this.platform].country;
            const params = {text: encodeURIComponent(title), pays: country, limit: 10};
            return this.callBetaSeries('GET', 'search', 'shows', params)
                .then(data => {
                    console.log('callBetaSeries ', data);
                    if (data.total != 1 || data.errors.length > 0) {
                        return null;
                    }
                    return data.shows[0].slug;
                });
        },
        /**
         * Fonction de recherche des données de la série sur l'API BetaSeries
         * @return {void}
         */
        findSerie: async function(cb = this.noop) {
            if (this.debug) console.log('findSerie');
            const self = this;
            this._reinit();
            /**
             * Objet contenant les infos sur la série
             * @type {Object}
             */
            const result = await this.getInfosSerie();
            let serie = this.serie = Object.assign(this.serie, result);
            if (serie == null || serie.title == null || serie.saison == null || serie.episode == null) {
                this.notification({
                    title: 'BetaSeries research',
                    text: "Infos non récupérées (cf. console)",
                    timeout: 5
                });
                if (this.debug) console.warn('Infos non récupérées (' + JSON.stringify(serie) + ')');
                return cb();
            }
            /**
             * Fonction recherchant l'identifiant de l'épisode
             * @param  {Number} showId L'identifiant de la série
             * @return {Promise<void>}
             */
            function getEpisode(showId) {
                if (self.debug) console.log('getEpisode[%d]', showId);
                const params = {
                    id: showId,
                    season: serie.saison,
                    episode: serie.episode
                };
                return self.callBetaSeries('GET', 'shows', 'episodes', params)
                .then(data => {
                    if (data.episodes.length <= 0) {
                        self.notification({
                            title: 'BetaSeries research',
                            text: `L'épisode (S${serie.saison}E${serie.episode}) n'a pas été trouvé sur BetaSeries`,
                            timeout: 5
                        });
                        console.warn("L'épisode n'a pas été trouvé, étrange!", serie);
                        return null;
                    }
                    serie.episodeId = data.episodes[0].id;
                    if (data.episodes[0].user.seen) {
                        serie.watched = true;
                        if (self.debug) console.log('Cet épisode a déjà été vu');
                        if (self.settings.selBtnNext === undefined ||
                            (self.settings.selBtnNext && document.querySelector(self.settings.selBtnNext)))
                        {
                            if (window.confirm('Voulez-vous passer à l\'épisode suivant ?')) {
                                document.querySelector('div.vkp-left-control button.vkp-next-button').click();
                            }
                        }
                    }
                    if (self.debug) console.log('L\'identifiant de l\'épisode a été trouvé', serie);
                    return serie.episodeId;
                });
            }
            let resultSearch = serie.platform.showId ? this.searchSerieById(serie.platform.showId) : this.searchSerieByName(serie.title);
            if (resultSearch != null) {
                if (this.debug) console.log('L\'identifiant de la série est déjà enregistré', resultSearch);
                serie.showId = resultSearch.id;
                getEpisode(serie.showId).finally(cb);
                this.skipIntro(resultSearch.intro);
            } else {
                // Retrouver l'ID de la serie et de l'épisode
                const country = serie.country || this.platforms[this.platform].country;
                const params = {text: encodeURIComponent(serie.title), pays: country, limit: 10};
                this.callBetaSeries('GET', 'search', 'shows', params)
                .then(data => {
                    if (self.debug) console.log('Search serie by title on API BetaSeries');
                    let showId = null;
                    if (data.total <= 0) {
                        self.notification({
                            title: 'BetaSeries research',
                            text: 'La série n\'a pas été trouvée sur BetaSeries',
                            timeout: 5
                        });
                        if (self.debug) console.warn('La série n\'a pas été trouvée sur BetaSeries');
                        const msg = 'La série n\'a pas été trouvée sur BetaSeries.\nAvez-vous l\'identifiant ?';
                        let resultPrompt = window.prompt(msg);
                        if (resultPrompt != null && resultPrompt.length > 0) {
                            showId = parseInt(resultPrompt, 10);
                            const resultID = self.searchSerieByIdBS(showId);
                            if (resultID && serie.title != resultID.title) {
                                console.log('Le titre de la série est différent {title: %s, alias: %s}', resultID.title, serie.title);
                                self.saveSerie(serie.platform.showId, showId, resultID.title, [serie.title]);
                            }
                        }
                    }
                    else if (data.total > 1) {
                        let msg = 'Quelle série choisissez-vous (ID show) ?\n',
                            showIds = [],
                            resultID = null;
                        for (let s = 0; s < data.shows.length; s++) {
                            resultID = self.searchSerieByIdBS(data.shows[s].id);
                            if (resultID && window.confirm(`L'identifiant de la série est il bien le ${data.shows[s].id}`)) {
                                showId = data.shows[s].id;
                                if (serie.title != resultID.title) {
                                    self.saveSerie(serie.platform.showId, data.shows[s].id, resultID.title, [serie.title]);
                                }
                                break;
                            }
                            msg += `\t${data.shows[s].id}: ${data.shows[s].title}\n`;
                            showIds.push(data.shows[s].id);
                        }
                        if (showId == null) {
                            let indice = parseInt(window.prompt(msg, data.shows[0].id), 10);
                            if (Number.isNaN(indice)) {
                                self.notification({
                                    title: "Response Error",
                                    text: "L'identifiant fournit n'est pas correct",
                                    timeout: 5
                                });
                                return;
                            }
                            showId = indice;
                            if (!showId || showIds.indexOf(showId) === -1) {
                                self.notification({
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
                            const result = self.searchSerieByIdBS(showId);
                            if (self.debug) console.log('searchSerieByIdBS', result);
                            if (result) {
                                if (serie.title != result.title) {
                                    if (self.debug) console.log('Le titre de la série est différent {title: %s, alias: %s}', result.title, serie.title);
                                    self.saveSerie(serie.platform.showId, showId, result.title, [serie.title]);
                                }
                            }
                            showId = parseInt(showId, 10);
                        }
                    } else {
                        showId = data.shows[0].id;
                    }
                    if (!showId) {
                        console.warn("L'ID de la série n'a pas été récupéré sur BetaSeries");
                        return cb();
                    }
                    serie.showId = showId;
                    let result = self.searchSerieByIdBS(showId);
                    if (!result) {
                        result = self.saveSerie(serie.platform.showId, showId, serie.title, []);
                    } else if (result.title != serie.title) {
                        result = self.saveSerie(serie.platform.showId, showId, result.title, [serie.title], result.intro);
                    }
                    getEpisode(showId).finally(cb);
                    self.skipIntro(result.intro);
                    // Vérifier
                });
            }
        },
        /**
         * Recherche une série par son nom
         * @param  {string} title Le titre de la série
         * @return {Object}       L'objet contenant les infos de la série
         */
        searchSerieByName: function(title) {
            const shows = this.getValue('showIdsSaved', {});
            let keys = Object.keys(shows);
            for (let key of keys) {
                if (shows[key].title == title || shows[key].alias.indexOf(title) >= 0) {
                    return shows[key];
                }
            }
            return null;
        },
        /**
         * Recherche une série par son ID BetaSeries
         * @param  {number} id  L'identifiant de la série sur BetaSeries
         * @return {Object}       L'objet contenant les infos de la série
         */
        searchSerieByIdBS: function(id) {
            const shows = this.getValue('showIdsSaved', {});
            let keys = Object.keys(shows);
            for (let key of keys) {
                if (shows[key].id == id) {
                    return shows[key];
                }
            }
            return null;
        },
        /**
         * Recherche une série par son ID Viki
         * @param  {number} id L'identifiant de la série
         * @return {Object}    L'objet contenant les infos de la série
         */
        searchSerieById: function(id) {
            const shows = this.getValue('showIdsSaved', {});
            if (Object.keys(shows).includes(id.toString())) {
                return shows[id];
            }
            return null;
        },
        /**
         * Enregistre les infos de la série
         * @param  {number} platformId  L'identifiant de la série sur Viki
         * @param  {number} BSid        L'identifiant de la série sur BetaSeries
         * @param  {string} title       Le titre de la série
         * @param  {Array}  [alias=[]]  Tableau des alias de la série
         * @param  {Number} [intro=-1]  Durée de l'intro de la série
         * @return {Object}             L'objet contenant les infos de la série
         */
        saveSerie: function(platformId, BSid, title, alias = [], intro = -1) {
            //console.log('saveSerie params: ', {id, title, alias, intro});
            const showIdsSaved = this.getValue('showIdsSaved', {});
            if (platformId == null || BSid == null || title == null) {
                console.warn("L'identifiant ou le titre de la série sont nul.", {platformId, BSid, title});
                return;
            }
            const result = this.searchSerieById(platformId);
            if (result) {
                alias = result.alias.concat(alias);
                if (intro === -1) {
                    intro = result.intro;
                }
            }
            if (intro === -1) intro = 0;
            showIdsSaved[platformId] = {id: BSid, title, alias, intro};
            this.setValue('showIdsSaved', showIdsSaved);
            let showsWatched = this.getValue('showsWatched', []);
            if (showsWatched.indexOf(platformId) < 0) {
                showsWatched.unshift(platformId);
                this.setValue('showsWatched', showsWatched);
            }
            //console.log('saveSerie', showIdsSaved[id]);
            return showIdsSaved[platformId];
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
                        resolve(this.authenticate());
                    } else {
                        setTimeout(wait, 10000, resolve);
                    }
                };

                // TODO: mettre en attente l'authentification jusqu'à la sortie du mode fullscreen
                return new Promise(resolve => {
                    setTimeout(wait, 10000, resolve);
                });
            }
            if (this.debug) console.log('authenticate');
            let container = document.createElement('div');
            container.id = 'containerIframe';
            container.style = 'position:fixed;top:80px;left:0;width:100%;height:400px;margin:auto;text-align:center;z-index:1000;';
            let frame = document.createElement('iframe');
            frame.id = 'userscript';
            frame.title = 'connexion à BetaSeries';
            frame.width = '50%';
            frame.height = '400';
            frame.src = this.serverBaseUrl + "/index.html";
            frame.style = "background:white;margin:auto;";
            container.appendChild(frame);
            document.body.appendChild(container);
            return new Promise((resolve, reject) => {
                window.addEventListener("message", receiveMessage, false);
                this.events.message = true;
                function receiveMessage(event) {
                    const origin = new URL(this.serverBaseUrl).origin;
                    // if (this.debug) console.log('receiveMessage', event);
                    if (event.origin !== origin) {
                        //if (this.debug) console.error('receiveMessage {origin: %s}', event.origin, event);
                        reject('event.origin is not %s', origin);
                        return;
                    }
                    let msg = event.data.message;
                    if (msg === 'access_token') {
                        this.betaseries_api_user_token = event.data.value;
                        localStorage.setItem('betaseries_api_user_token', this.betaseries_api_user_token);
                        document.getElementById('containerIframe').remove();
                        resolve(msg);
                        window.removeEventListener("message", receiveMessage, false);
                        this.events.message = false;
                    } else {
                        if (this.debug) console.error('Erreur de récuperation du token', event);
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
            if (this.api.resources.indexOf(resource) === -1) {
                throw new Error(`Ressource (${resource}) inconnue dans l'API.`);
            }
            const self = this;
            let check = false,
                // Les en-têtes pour l'API
                myHeaders = {
                    'Accept'                : 'application/json',
                    'X-BetaSeries-Version'  : this.api.versions.current,
                    'X-BetaSeries-Token'    : this.betaseries_api_user_token,
                    'X-BetaSeries-Key'      : this.betaseries_api_user_key
                },
                checkKeys = Object.keys(this.api.check);

            if (this.debug) {
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
                this.api.check[resource].indexOf(method) !== -1) ||
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
                    if (self.debug) console.info('%ccall /members/is_active', 'color:blue');
                    fetch(`${self.api.base}/members/is_active`, paramsFetch).then(resp => {
                        if ( ! resp.ok) {
                            // Appel de l'authentification pour obtenir un token valide
                            self.authenticate().then(() => {
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
                        if (self.debug) console.log('Il y a eu un problème avec l\'opération fetch: ' + error.message);
                        console.error(error);
                        reject(error.message);
                    });
                } else {
                    fetchUri(resolve, reject);
                }
            });
            function fetchUri(resolve, reject) {
                let uri = `${self.api.base}/${resource}/${method}`,
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
                    if (self.debug) console.log('fetch (%s %s) response status: %d', type, uri, response.status);
                    // On récupère les données et les transforme en objet
                    response.json().then((data) => {
                        if (self.debug) console.log('fetch (%s %s) data', type, uri, data);
                        // On gère le retour d'erreurs de l'API
                        if (Object.prototype.hasOwnProperty.call(data, "errors") && data.errors.length > 0) {
                            const code = data.errors[0].code,
                                text = data.errors[0].text;
                            if (code === 2005 ||
                                (response.status === 400 && code === 0 &&
                                    text === "L'utilisateur a déjà marqué cet épisode comme vu."))
                            {
                                reject('alreadyMarked');
                            } else if (code == 2001) {
                                // Appel de l'authentification pour obtenir un token valide
                                self.authenticate().then(() => {
                                    self.callBetaSeries(type, resource, method, args)
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
                    if (self.debug) console.log('Il y a eu un problème avec l\'opération fetch: ' + error.message);
                    console.error(error);
                    reject(error.message);
                });
            }
        }
    };

    root.BS = function(options) {
        return new BS(options);
    };

    return BS;
});