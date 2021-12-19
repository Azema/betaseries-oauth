/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/Base.ts":
/*!*********************!*\
  !*** ./src/Base.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Base = exports.HTTP_VERBS = exports.EventTypes = exports.MediaType = void 0;
const Cache_1 = __webpack_require__(/*! ./Cache */ "./src/Cache.ts");
const Character_1 = __webpack_require__(/*! ./Character */ "./src/Character.ts");
const Comment_1 = __webpack_require__(/*! ./Comment */ "./src/Comment.ts");
const Note_1 = __webpack_require__(/*! ./Note */ "./src/Note.ts");
const User_1 = __webpack_require__(/*! ./User */ "./src/User.ts");
var MediaType;
(function (MediaType) {
    MediaType["show"] = "show";
    MediaType["movie"] = "movie";
    MediaType["episode"] = "episode";
})(MediaType = exports.MediaType || (exports.MediaType = {}));
var EventTypes;
(function (EventTypes) {
    EventTypes[EventTypes["UPDATE"] = 0] = "UPDATE";
    EventTypes[EventTypes["SAVE"] = 1] = "SAVE";
})(EventTypes = exports.EventTypes || (exports.EventTypes = {}));
var HTTP_VERBS;
(function (HTTP_VERBS) {
    HTTP_VERBS["GET"] = "GET";
    HTTP_VERBS["POST"] = "POST";
    HTTP_VERBS["PUT"] = "PUT";
    HTTP_VERBS["DELETE"] = "DELETE";
    HTTP_VERBS["OPTIONS"] = "OPTIONS";
})(HTTP_VERBS = exports.HTTP_VERBS || (exports.HTTP_VERBS = {}));
class Base {
    /*
                    STATIC
    */
    /**
     * Flag de debug pour le dev
     * @type {boolean}
     */
    static debug = false;
    /**
     * L'objet cache du script pour stocker les données
     * @type {CacheUS}
     */
    static cache = null;
    /**
     * Objet contenant les informations de l'API
     * @type {*}
     */
    static api = {
        "url": 'https://api.betaseries.com',
        "versions": { "current": '3.0', "last": '3.0' },
        "resources": [
            'badges', 'comments', 'episodes', 'friends', 'members', 'messages',
            'movies', 'news', 'oauth', 'pictures', 'planning', 'platforms',
            'polls', 'reports', 'search', 'seasons', 'shows', 'subtitles',
            'timeline'
        ],
        "check": {
            "episodes": ['display', 'list', 'search'],
            "movies": ['list', 'movie', 'search', 'similars'],
            "search": ['all', 'movies', 'shows'],
            "shows": ['display', 'episodes', 'list', 'search', 'similars']
        }
    };
    /**
     * Le token d'authentification de l'API
     * @type {String}
     */
    static token = null;
    /**
     * La clé d'utilisation de l'API
     * @type {String}
     */
    static userKey = null;
    /**
     * L'identifiant du membre connecté
     * @type {Number}
     */
    static userId = null;
    /**
     * Clé pour l'API TheMovieDB
     * @type {string}
     */
    static themoviedb_api_user_key = null;
    /**
     * Le nombre d'appels à l'API
     * @type {Number}
     */
    static counter = 0;
    /**
     * L'URL de base du serveur contenant les ressources statiques
     * @type {String}
     */
    static serverBaseUrl = '';
    /**
     * Fonction de notification sur la page Web
     * @type {Function}
     */
    static notification = function () { };
    /**
     * Fonction pour vérifier que le membre est connecté
     * @type {Function}
     */
    static userIdentified = function () { };
    /**
     * Fonction vide
     * @type {Function}
     */
    static noop = function () { };
    /**
     * Fonction de traduction de chaînes de caractères
     * @param   {String}  msg     Identifiant de la chaîne à traduire
     * @param   {*[]}     args    Autres paramètres
     * @returns {string}
     */
    static trans = function (msg, ...args) { };
    /**
     * Contient les infos sur les différentes classification TV et cinéma
     * @type {Ratings}
     */
    static ratings = null;
    /**
     * Types d'évenements gérés par cette classe
     * @type {Array}
     */
    static EventTypes = new Array(EventTypes.UPDATE, EventTypes.SAVE);
    /**
     * Fonction d'authentification sur l'API BetaSeries
     *
     * @return {Promise}
     */
    static authenticate() {
        if (Base.debug)
            console.log('authenticate');
        if (jQuery('#containerIframe').length <= 0) {
            jQuery('body').append(`
                <div id="containerIframe">
                <iframe id="userscript"
                        name="userscript"
                        title="Connexion à BetaSeries"
                        width="50%"
                        height="400"
                        src="${Base.serverBaseUrl}/index.html"
                        style="background:white;margin:auto;">
                </iframe>
                </div>'
            `);
        }
        return new Promise((resolve, reject) => {
            function receiveMessage(event) {
                const origin = new URL(Base.serverBaseUrl).origin;
                // if (debug) console.log('receiveMessage', event);
                if (event.origin !== origin) {
                    if (Base.debug)
                        console.error('receiveMessage {origin: %s}', event.origin, event);
                    reject(`event.origin is not ${origin}`);
                    return;
                }
                if (event.data.message === 'access_token') {
                    Base.token = event.data.value;
                    $('#containerIframe').remove();
                    resolve(event.data.message);
                    window.removeEventListener("message", receiveMessage, false);
                }
                else {
                    console.error('Erreur de récuperation du token', event);
                    reject(event.data);
                    Base.notification('Erreur de récupération du token', 'Pas de message');
                    window.removeEventListener("message", receiveMessage, false);
                }
            }
            window.addEventListener("message", receiveMessage, false);
        });
    }
    /**
     * Fonction servant à appeler l'API de BetaSeries
     *
     * @param  {String}   type              Type de methode d'appel Ajax (GET, POST, PUT, DELETE)
     * @param  {String}   resource          La ressource de l'API (ex: shows, seasons, episodes...)
     * @param  {String}   action            L'action à appliquer sur la ressource (ex: search, list...)
     * @param  {*}        args              Un objet (clef, valeur) à transmettre dans la requête
     * @param  {bool}     [force=false]     Indique si on doit utiliser le cache ou non (Par défaut: false)
     * @return {Promise}
     */
    static callApi(type, resource, action, args, force = false) {
        if (Base.api && Base.api.resources.indexOf(resource) === -1) {
            throw new Error(`Ressource (${resource}) inconnue dans l'API.`);
        }
        if (!Base.token || !Base.userKey) {
            throw new Error('Token and userKey are required');
        }
        let check = false, 
        // Les en-têtes pour l'API
        myHeaders = {
            'Accept': 'application/json',
            'X-BetaSeries-Version': Base.api.versions.current,
            'X-BetaSeries-Token': Base.token,
            'X-BetaSeries-Key': Base.userKey
        }, checkKeys = Object.keys(Base.api.check);
        if (Base.debug) {
            console.log('Base.callApi', {
                type: type,
                resource: resource,
                action: action,
                args: args,
                force: force
            });
        }
        // On retourne la ressource en cache si elle y est présente
        if (Base.cache && !force && type === 'GET' && args && 'id' in args &&
            Base.cache.has(resource, args.id)) {
            //if (debug) console.log('Base.callApi retourne la ressource du cache (%s: %d)', resource, args.id);
            return new Promise((resolve) => {
                resolve(Base.cache.get(resource, args.id));
            });
        }
        // On check si on doit vérifier la validité du token
        // (https://www.betaseries.com/bugs/api/461)
        if (Base.userIdentified() && checkKeys.indexOf(resource) !== -1 &&
            Base.api.check[resource].indexOf(action) !== -1) {
            check = true;
        }
        function fetchUri(resolve, reject) {
            let initFetch = {
                method: type,
                headers: myHeaders,
                mode: 'cors',
                cache: 'no-cache'
            };
            let uri = `${Base.api.url}/${resource}/${action}`;
            const keys = Object.keys(args);
            // On crée l'URL de la requête de type GET avec les paramètres
            if (type === 'GET' && keys.length > 0) {
                let params = [];
                for (let key of keys) {
                    params.push(key + '=' + encodeURIComponent(args[key]));
                }
                uri += '?' + params.join('&');
            }
            else if (keys.length > 0) {
                initFetch.body = new URLSearchParams(args);
            }
            fetch(uri, initFetch).then(response => {
                Base.counter++; // Incrément du compteur de requêtes à l'API
                if (Base.debug)
                    console.log('fetch (%s %s) response status: %d', type, uri, response.status);
                // On récupère les données et les transforme en objet
                response.json().then((data) => {
                    if (Base.debug)
                        console.log('fetch (%s %s) data', type, uri, data);
                    // On gère le retour d'erreurs de l'API
                    if (data.errors !== undefined && data.errors.length > 0) {
                        const code = data.errors[0].code, text = data.errors[0].text;
                        if (code === 2005 ||
                            (response.status === 400 && code === 0 &&
                                text === "L'utilisateur a déjà marqué cet épisode comme vu.")) {
                            reject('changeStatus');
                        }
                        else if (code == 2001) {
                            // Appel de l'authentification pour obtenir un token valide
                            Base.authenticate().then(() => {
                                Base.callApi(type, resource, action, args, force)
                                    .then(data => resolve(data), err => reject(err));
                            }, (err) => {
                                reject(err);
                            });
                        }
                        else {
                            reject(data.errors[0]);
                        }
                        return;
                    }
                    // On gère les erreurs réseau
                    if (!response.ok) {
                        console.error('Fetch erreur network', response);
                        reject(response);
                        return;
                    }
                    resolve(data);
                });
            }).catch(error => {
                if (Base.debug)
                    console.log('Il y a eu un problème avec l\'opération fetch: ' + error.message);
                console.error(error);
                reject(error.message);
            });
        }
        return new Promise((resolve, reject) => {
            if (check) {
                let paramsFetch = {
                    method: 'GET',
                    headers: myHeaders,
                    mode: 'cors',
                    cache: 'no-cache'
                };
                if (Base.debug)
                    console.info('%ccall /members/is_active', 'color:blue');
                fetch(`${Base.api.url}/members/is_active`, paramsFetch).then(resp => {
                    Base.counter++; // Incrément du compteur de requêtes à l'API
                    if (!resp.ok) {
                        // Appel de l'authentification pour obtenir un token valide
                        Base.authenticate().then(() => {
                            // On met à jour le token pour le prochain appel à l'API
                            myHeaders['X-BetaSeries-Token'] = Base.token;
                            fetchUri(resolve, reject);
                        }).catch(err => reject(err));
                        return;
                    }
                    fetchUri(resolve, reject);
                }).catch(error => {
                    if (Base.debug)
                        console.log('Il y a eu un problème avec l\'opération fetch: ' + error.message);
                    console.error(error);
                    reject(error.message);
                });
            }
            else {
                fetchUri(resolve, reject);
            }
        });
    }
    /*
                    PROPERTIES
    */
    description;
    characters;
    comments;
    id;
    objNote;
    resource_url;
    title;
    user;
    mediaType;
    _elt;
    _listeners;
    /*
                    METHODS
    */
    constructor(data) {
        if (!(data instanceof Object)) {
            throw new Error("data is not an object");
        }
        this._initListeners()
            .fill(data);
        return this;
    }
    /**
     * Remplit l'objet avec les données fournit en paramètre
     * @param  {Obj} data Les données provenant de l'API
     * @returns this
     */
    fill(data) {
        this.id = parseInt(data.id, 10);
        this.characters = [];
        if (data.characters && data.characters instanceof Array) {
            for (let c = 0; c < data.characters.length; c++) {
                this.characters.push(new Character_1.Character(data.characters[c]));
            }
        }
        this.comments = [];
        if (data.comments && data.comments instanceof Array) {
            for (let c = 0; c < data.comments.length; c++) {
                this.comments.push(new Comment_1.CommentBS(data.comments[c]));
            }
        }
        this.objNote = (data.note) ? new Note_1.Note(data.note) : new Note_1.Note(data.notes);
        this.resource_url = data.resource_url;
        this.title = data.title;
        this.user = new User_1.User(data.user);
        this.description = data.description;
        this.save();
        return this;
    }
    /**
     * Initialize le tableau des écouteurs d'évènements
     * @returns this
     */
    _initListeners() {
        this._listeners = {};
        for (let e = 0; e < Base.EventTypes.length; e++) {
            this._listeners[Base.EventTypes[e]] = new Array();
        }
        return this;
    }
    /**
     * Permet d'ajouter un listener sur un type d'évenement
     * @param  {string}   name Le type d'évenement
     * @param  {Function} fn   La fonction à appeler
     * @return {this}          L'instance du média
     */
    addListener(name, fn) {
        // On vérifie que le type d'event est pris en charge
        if (Base.EventTypes.indexOf(name) < 0) {
            throw new Error(`${name} ne fait pas partit des events gérés par cette classe`);
        }
        if (this._listeners[name] === undefined) {
            this._listeners[name] = new Array();
        }
        this._listeners[name].push(fn);
        return this;
    }
    /**
     * Permet de supprimer un listener sur un type d'évenement
     * @param  {string}   name Le type d'évenement
     * @param  {Function} fn   La fonction qui était appelée
     * @return {Base}          L'instance du média
     */
    removeListener(name, fn) {
        if (this._listeners[name] !== undefined) {
            for (let l = 0; l < this._listeners[name].length; l++) {
                if (this._listeners[name][l] === fn)
                    this._listeners[name].splice(l, 1);
            }
        }
        return this;
    }
    /**
     * Appel les listeners pour un type d'évenement
     * @param  {string} name Le type d'évenement
     * @return {Show}        L'instance Show
     */
    _callListeners(name) {
        if (this._listeners[name] !== undefined) {
            for (let l = 0; l < this._listeners[name].length; l++) {
                this._listeners[name][l].call(this, this);
            }
        }
        return this;
    }
    /**
     * Sauvegarde l'objet en cache
     * @return this
     */
    save() {
        if (Base.cache instanceof Cache_1.CacheUS) {
            Base.cache.set(this.mediaType.plural, this.id, this);
            this._callListeners(EventTypes.SAVE);
        }
        return this;
    }
    /**
     * Retourne le DOMElement correspondant au média
     * @returns {JQuery} Le DOMElement jQuery
     */
    get elt() {
        return this._elt;
    }
    /**
     * Définit le DOMElement de référence pour ce média
     * @param  {JQuery} elt DOMElement auquel est rattaché le média
     */
    set elt(elt) {
        this._elt = elt;
    }
    /**
     * Retourne le nombre d'acteurs référencés dans ce média
     * @returns {number}
     */
    get nbCharacters() {
        return this.characters.length;
    }
    /**
     * Retourne le nombre de commentaires pour ce média
     * @returns number
     */
    get nbComments() {
        return this.comments.length;
    }
    /**
     * Décode le titre de la page
     * @return {Base} This
     */
    decodeTitle() {
        let $elt = this.elt.find('.blockInformations__title'), title = $elt.text();
        if (/&#/.test(title)) {
            $elt.text($('<textarea />').html(title).text());
        }
        return this;
    }
    /**
     * Ajoute le nombre de votes à la note dans l'attribut title de la balise
     * contenant la représentation de la note de la ressource
     *
     * @param  {Boolean} change  Indique si on doit changer l'attribut title du DOMElement
     * @return {String}         Le titre modifié de la note
     */
    changeTitleNote(change = true) {
        const $elt = this.elt.find('.js-render-stars');
        if (this.objNote.mean <= 0 || this.objNote.total <= 0) {
            if (change)
                $elt.attr('title', 'Aucun vote');
            return;
        }
        const votes = 'vote' + (this.objNote.total > 1 ? 's' : ''), 
        // On met en forme le nombre de votes
        total = new Intl.NumberFormat('fr-FR', { style: 'decimal', useGrouping: true })
            .format(this.objNote.total), 
        // On limite le nombre de chiffre après la virgule
        note = this.objNote.mean.toFixed(1);
        let title = `${total} ${votes} : ${note} / 5`;
        // On ajoute la note du membre connecté, si il a voté
        if (Base.userIdentified() && this.objNote.user > 0) {
            title += `, votre note: ${this.objNote.user}`;
        }
        if (change) {
            $elt.attr('title', title);
        }
        return title;
    }
    /**
     * Ajoute le nombre de votes à la note de la ressource
     * @return {Base}
     */
    addNumberVoters() {
        const _this = this;
        const votes = $('.stars.js-render-stars'); // ElementHTML ayant pour attribut le titre avec la note de la série
        if (Base.debug)
            console.log('addNumberVoters');
        // if (debug) console.log('addNumberVoters Media.callApi', data);
        const title = this.changeTitleNote(true);
        // On ajoute un observer sur l'attribut title de la note, en cas de changement lors d'un vote
        new MutationObserver((mutationsList) => {
            const changeTitleMutation = () => {
                // On met à jour le nombre de votants, ainsi que la note du membre connecté
                const upTitle = _this.changeTitleNote(false);
                // On évite une boucle infinie
                if (upTitle !== title) {
                    votes.attr('title', upTitle);
                }
            };
            let mutation;
            for (mutation of mutationsList) {
                // On vérifie si le titre a été modifié
                // @TODO: A tester
                if (!/vote/.test(mutation.target.nodeValue)) {
                    changeTitleMutation();
                }
            }
        }).observe(votes.get(0), {
            attributes: true,
            childList: false,
            characterData: false,
            subtree: false,
            attributeFilter: ['title']
        });
        return this;
    }
}
exports.Base = Base;


/***/ }),

/***/ "./src/Cache.ts":
/*!**********************!*\
  !*** ./src/Cache.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CacheUS = exports.DataTypesCache = void 0;
var DataTypesCache;
(function (DataTypesCache) {
    DataTypesCache["shows"] = "shows";
    DataTypesCache["episodes"] = "episodes";
    DataTypesCache["movies"] = "movies";
    DataTypesCache["members"] = "members";
})(DataTypesCache = exports.DataTypesCache || (exports.DataTypesCache = {}));
/**
 * @class Gestion du Cache pour le script
 */
class CacheUS {
    _data;
    constructor() {
        return this._init();
    }
    /**
     * Initialize le cache pour chaque type
     * @returns this
     */
    _init() {
        this._data[DataTypesCache.shows] = {};
        this._data[DataTypesCache.episodes] = {};
        this._data[DataTypesCache.movies] = {};
        this._data[DataTypesCache.members] = {};
        return this;
    }
    /**
     * Returns an Array of all currently set keys.
     * @returns {Array} cache keys
     */
    keys(type = null) {
        if (!type)
            return Object.keys(this._data);
        return Object.keys(this._data[type]);
    }
    /**
     * Checks if a key is currently set in the cache.
     * @param {DataTypesCache}  type Le type de ressource
     * @param {String|number}   key  the key to look for
     * @returns {boolean} true if set, false otherwise
     */
    has(type, key) {
        return (this._data[type] !== undefined && this._data[type][key] !== undefined);
    }
    /**
     * Clears all cache entries.
     * @param   {DataTypesCache} [type=null] Le type de ressource à nettoyer
     * @returns this
     */
    clear(type = null) {
        // On nettoie juste un type de ressource
        if (type && this._data[type] !== undefined) {
            for (let key in this._data[type]) {
                delete this._data[type][key];
            }
        }
        // On nettoie l'ensemble du cache
        else {
            this._init();
        }
        return this;
    }
    /**
     * Gets the cache entry for the given key.
     * @param {DataTypesCache}  type Le type de ressource
     * @param {String|number}   key  the cache key
     * @returns {*} the cache entry if set, or undefined otherwise
     */
    get(type, key) {
        if (this.has(type, key)) {
            return this._data[type][key];
        }
        return null;
    }
    /**
     * Returns the cache entry if set, or a default value otherwise.
     * @param {DataTypesCache}  type Le type de ressource
     * @param {String|number}   key  the key to retrieve
     * @param {*}               def  the default value to return if unset
     * @returns {*} the cache entry if set, or the default value provided.
     */
    getOrDefault(type, key, def) {
        return this.has(type, key) ? this.get(type, key) : def;
    }
    /**
     * Sets a cache entry with the provided key and value.
     * @param {DataTypesCache}  type  Le type de ressource
     * @param {String|number}   key   the key to set
     * @param {*}               value the value to set
     * @returns this
     */
    set(type, key, value) {
        if (this._data[type] !== undefined) {
            this._data[type][key] = value;
        }
        return this;
    }
    /**
     * Removes the cache entry for the given key.
     * @param {DataTypesCache}  type  Le type de ressource
     * @param {String|number}   key the key to remove
     * @returns this
     */
    remove(type, key) {
        if (this.has(type, key)) {
            delete this._data[type][key];
        }
        return this;
    }
}
exports.CacheUS = CacheUS;


/***/ }),

/***/ "./src/Character.ts":
/*!**************************!*\
  !*** ./src/Character.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Character = void 0;
class Character {
    constructor(data) {
        this.actor = data.actor;
        this.picture = data.picture;
        this.name = data.name;
        this.guest = data.guest;
        this.id = parseInt(data.id, 10);
        this.description = data.description;
        this.role = data.role;
        this.show_id = parseInt(data.show_id, 10);
        this.movie_id = parseInt(data.movie_id, 10);
    }
    actor;
    description;
    guest;
    id;
    name;
    picture;
    role;
    show_id;
    movie_id;
}
exports.Character = Character;


/***/ }),

/***/ "./src/Comment.ts":
/*!************************!*\
  !*** ./src/Comment.ts ***!
  \************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CommentBS = void 0;
class CommentBS {
    constructor(data) {
        this.id = parseInt(data.id, 10);
        this.reference = data.reference;
        this.type = data.type;
        this.ref_id = parseInt(data.ref_id, 10);
        this.user_id = parseInt(data.user_id, 10);
        this.login = data.login;
        this.avatar = data.avatar;
        this.date = new Date(data.date);
        this.text = data.text;
        this.inner_id = parseInt(data.inner_id, 10);
        this.in_reply_to = parseInt(data.in_reply_to, 10);
        this.user_note = parseInt(data.user_note, 10);
    }
    id;
    reference;
    type;
    ref_id;
    user_id;
    login;
    avatar;
    date;
    text;
    inner_id;
    in_reply_to;
    user_note;
}
exports.CommentBS = CommentBS;


/***/ }),

/***/ "./src/Episode.ts":
/*!************************!*\
  !*** ./src/Episode.ts ***!
  \************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Episode = exports.Season = void 0;
const Base_1 = __webpack_require__(/*! ./Base */ "./src/Base.ts");
const Cache_1 = __webpack_require__(/*! ./Cache */ "./src/Cache.ts");
const Show_1 = __webpack_require__(/*! ./Show */ "./src/Show.ts");
const Subtitle_1 = __webpack_require__(/*! ./Subtitle */ "./src/Subtitle.ts");
class Season {
    number;
    episodes;
    _show;
    constructor(data, show) {
        this.number = parseInt(data.number, 10);
        this._show = show;
        if (data.episodes && data.episodes instanceof Array && data.episodes[0] instanceof Episode) {
            this.episodes = data.episodes;
        }
        return this;
    }
    /**
     * Récupère les épisodes de la saison sur l'API
     * @returns {Promise<Season>}
     */
    fetchEpisodes() {
        if (!this.number || this.number <= 0) {
            throw new Error('season number incorrect');
        }
        const _this = this;
        return new Promise((resolve, reject) => {
            Base_1.Base.callApi('GET', 'shows', 'episodes', { id: _this._show.id, season: _this.number }, true)
                .then(data => {
                _this.episodes = [];
                for (let e = 0; e < data.episodes.length; e++) {
                    _this.episodes.push(new Episode(data.episodes[e], _this._show));
                }
                resolve(_this);
            }, err => {
                reject(err);
            });
        });
    }
    /**
     * Retourne l'épisode correspondant à l'identifiant fournit
     * @param  {number} id
     * @returns {Episode}
     */
    getEpisode(id) {
        for (let e = 0; e < this.episodes.length; e++) {
            if (this.episodes[e].id === id) {
                return this.episodes[e];
            }
        }
        return null;
    }
}
exports.Season = Season;
class Episode extends Base_1.Base {
    code;
    date;
    episode;
    global;
    season;
    platform_links;
    seen_total;
    show;
    special;
    subtitles;
    thetvdb_id;
    youtube_id;
    constructor(data, show) {
        super(data);
        this.show = show;
        return this.fill(data);
    }
    /**
     * Remplit l'objet avec les données fournit en paramètre
     * @param  {any} data Les données provenant de l'API
     * @returns {Episode}
     */
    fill(data) {
        this.code = data.code;
        this.date = new Date(data.date);
        this.episode = parseInt(data.episode, 10);
        this.global = parseInt(data.global, 10);
        this.season = parseInt(data.season, 10);
        this.platform_links = data.platform_links;
        this.seen_total = parseInt(data.seen_total, 10);
        this.special = data.special === 1 ? true : false;
        this.subtitles = new Array();
        for (let s = 0; s < data.subtitles.length; s++) {
            this.subtitles.push(new Subtitle_1.Subtitle(data.subtitles[s]));
        }
        this.thetvdb_id = parseInt(data.thetvdb_id, 10);
        this.youtube_id = data.youtube_id;
        this.mediaType = { singular: Base_1.MediaType.episode, plural: 'episodes', className: Episode };
        super.fill(data);
        return this;
    }
    /**
     * Ajoute le titre de l'épisode à l'attribut Title
     * du DOMElement correspondant au titre de l'épisode
     * sur la page Web
     *
     * @return {Episode} L'épisode
     */
    addAttrTitle() {
        // Ajout de l'attribut title pour obtenir le nom complet de l'épisode, lorsqu'il est tronqué
        if (this.elt)
            this.elt.find('.slide__title').attr('title', this.title);
        return this;
    }
    /**
     * Met à jour le DOMElement .checkSeen avec les
     * données de l'épisode (id, pos, special)
     * @param  {number} pos  La position de l'épisode dans la liste
     * @return {Episode}
     */
    initCheckSeen(pos) {
        const $checkbox = this.elt.find('.checkSeen');
        if ($checkbox.length > 0 && this.user.seen) {
            // On ajoute l'attribut ID et la classe 'seen' à la case 'checkSeen' de l'épisode déjà vu
            $checkbox.attr('id', 'episode-' + this.id);
            $checkbox.attr('data-id', this.id);
            $checkbox.attr('data-pos', pos);
            $checkbox.attr('data-special', this.special ? '1' : '0');
            $checkbox.attr('title', Base_1.Base.trans("member_shows.remove"));
            $checkbox.addClass('seen');
        }
        else if ($checkbox.length <= 0 && !this.user.seen && !this.user.hidden) {
            // On ajoute la case à cocher pour permettre d'indiquer l'épisode comme vu
            this.elt.find('.slide__image')
                .append(`<div id="episode-${this.id}"
                                class="checkSeen"
                                data-id="${this.id}"
                                data-pos="${pos}"
                                data-special="${this.special}"
                                style="background: rgba(13,21,28,.2);"
                                title="${Base_1.Base.trans("member_shows.markas")}"></div>`);
            this.elt.find('.slide__image img.js-lazy-image').attr('style', 'filter: blur(5px);');
        }
        else if ($checkbox.length > 0 && this.user.hidden) {
            $checkbox.remove();
        }
        return this;
    }
    /**
     * Met à jour les infos de la vignette et appelle la fonction d'update du rendu
     * @param  {number} pos La position de l'épisode dans la liste
     * @return {boolean}    Indique si il y a eu un changement
     */
    updateCheckSeen(pos) {
        const $checkSeen = this.elt.find('.checkSeen');
        let changed = false;
        if ($checkSeen.length > 0 && $checkSeen.attr('id') === undefined) {
            if (Base_1.Base.debug)
                console.log('ajout de l\'attribut ID à l\'élément "checkSeen"');
            // On ajoute l'attribut ID
            $checkSeen.attr('id', 'episode-' + this.id);
            $checkSeen.data('id', this.id);
            $checkSeen.data('pos', pos);
        }
        // if (Base.debug) console.log('updateCheckSeen', {seen: this.user.seen, elt: this.elt, checkSeen: $checkSeen.length, classSeen: $checkSeen.hasClass('seen'), pos: pos, Episode: this});
        // Si le membre a vu l'épisode et qu'il n'est pas indiqué, on change le statut
        if (this.user.seen && $checkSeen.length > 0 && !$checkSeen.hasClass('seen')) {
            if (Base_1.Base.debug)
                console.log('Changement du statut (seen) de l\'épisode %s', this.code);
            this.updateRender('seen', false);
            changed = true;
        }
        // Si le membre n'a pas vu l'épisode et qu'il n'est pas indiqué, on change le statut
        else if (!this.user.seen && $checkSeen.length > 0 && $checkSeen.hasClass('seen')) {
            if (Base_1.Base.debug)
                console.log('Changement du statut (notSeen) de l\'épisode %s', this.code);
            this.updateRender('notSeen', false);
            changed = true;
        }
        else if (this.user.hidden && $checkSeen.length > 0) {
            $checkSeen.remove();
            changed = true;
        }
        return changed;
    }
    /**
     * Retourne le code HTML du titre de la popup
     * pour l'affichage de la description
     * @return {string}
     */
    getTitlePopup() {
        return `<span style="color: var(--link_color);">Synopsis épisode ${this.code}</span>`;
    }
    /**
     * Modifie le statut d'un épisode sur l'API
     * @param  {String} status    Le nouveau statut de l'épisode
     * @param  {String} method    Verbe HTTP utilisé pour la requête à l'API
     * @return {void}
     */
    updateStatus(status, method) {
        const _this = this;
        const pos = this.elt.find('.checkSeen').data('pos');
        let promise = new Promise(resolve => { resolve(false); });
        let args = { id: this.id, bulk: true };
        if (method === Base_1.HTTP_VERBS.POST) {
            let createPromise = () => {
                return new Promise(resolve => {
                    new PopupAlert({
                        title: 'Episodes vus',
                        text: 'Doit-on cocher les épisodes précédents comme vu ?',
                        callback_yes: () => {
                            resolve(true);
                        },
                        callback_no: () => {
                            resolve(false);
                        }
                    });
                });
            };
            const $vignettes = jQuery('#episodes .checkSeen');
            // On verifie si les épisodes précédents ont bien été indiqués comme vu
            for (let v = 0; v < pos; v++) {
                if (!$($vignettes.get(v)).hasClass('seen')) {
                    promise = createPromise();
                    break;
                }
            }
        }
        promise.then(response => {
            if (method === Base_1.HTTP_VERBS.POST && !response) {
                args.bulk = false; // Flag pour ne pas mettre les épisodes précédents comme vus automatiquement
            }
            Base_1.Base.callApi(method, 'episodes', 'watched', args).then(data => {
                if (Base_1.Base.debug)
                    console.log('updateStatus %s episodes/watched', method, data);
                if (!(_this.show instanceof Show_1.Show) && Base_1.Base.cache.has(Cache_1.DataTypesCache.shows, data.show.id)) {
                    _this.show = Base_1.Base.cache.get(Cache_1.DataTypesCache.shows, data.show.id);
                }
                // Si un épisode est vu et que la série n'a pas été ajoutée
                // au compte du membre connecté
                if (!_this.show.in_account && data.episode.show.in_account) {
                    _this.show.in_account = true;
                    _this.show
                        .save()
                        .addShowClick(true);
                }
                // On met à jour l'objet Episode
                if (method === Base_1.HTTP_VERBS.POST && response && pos) {
                    const $vignettes = jQuery('#episodes .slide_flex');
                    let episode = null;
                    for (let e = 0; e < pos; e++) {
                        episode = _this.show.currentSeason.episodes[e];
                        if (episode.elt === null) {
                            episode.elt = jQuery($vignettes.get(e));
                        }
                        if (!episode.user.seen) {
                            episode.user.seen = true;
                            episode
                                .updateRender('seen', false)
                                .save();
                        }
                    }
                }
                _this
                    .fill(data.episode)
                    .updateRender(status, true)
                    .save()
                    ._callListeners(Base_1.EventTypes.UPDATE);
            })
                .catch(err => {
                if (Base_1.Base.debug)
                    console.error('updateStatus error %s', err);
                if (err && err == 'changeStatus') {
                    if (Base_1.Base.debug)
                        console.log('updateStatus error %s changeStatus', method);
                    _this.updateRender(status);
                }
                else {
                    _this.toggleSpinner(false);
                    Base_1.Base.notification('Erreur de modification d\'un épisode', 'updateStatus: ' + err);
                }
            });
        });
    }
    /**
     * Change le statut visuel de la vignette sur le site
     * @param  {String} newStatus     Le nouveau statut de l'épisode
     * @param  {bool}   [update=true] Mise à jour de la ressource en cache et des éléments d'affichage
     * @return {Episode}
     */
    updateRender(newStatus, update = true) {
        const _this = this;
        const $elt = this.elt.find('.checkSeen');
        const lenEpisodes = jQuery('#episodes .checkSeen').length;
        const lenNotSpecial = jQuery('#episodes .checkSeen[data-special="0"]').length;
        if (Base_1.Base.debug)
            console.log('changeStatus', { elt: $elt, status: newStatus, update: update });
        if (newStatus === 'seen') {
            $elt.css('background', ''); // On ajoute le check dans la case à cocher
            $elt.addClass('seen'); // On ajoute la classe 'seen'
            $elt.attr('title', Base_1.Base.trans("member_shows.remove"));
            // On supprime le voile masquant sur la vignette pour voir l'image de l'épisode
            $elt.parent('div.slide__image').find('img').removeAttr('style');
            $elt.parents('div.slide_flex').removeClass('slide--notSeen');
            const moveSeason = function () {
                const slideCurrent = jQuery('#seasons div.slide--current');
                // On check la saison
                slideCurrent.find('.slide__image').prepend('<div class="checkSeen"></div>');
                slideCurrent
                    .removeClass('slide--notSeen')
                    .addClass('slide--seen');
                if (Base_1.Base.debug)
                    console.log('Tous les épisodes de la saison ont été vus', slideCurrent);
                // Si il y a une saison suivante, on la sélectionne
                if (slideCurrent.next().length > 0) {
                    if (Base_1.Base.debug)
                        console.log('Il y a une autre saison');
                    slideCurrent.next().trigger('click');
                    let seasonNumber = _this.show.currentSeason.number + 1;
                    _this.show.setCurrentSeason(seasonNumber);
                    slideCurrent
                        .removeClass('slide--current');
                }
            };
            const lenSeen = jQuery('#episodes .seen').length;
            //if (Base.debug) console.log('Episode.updateRender', {lenEpisodes: lenEpisodes, lenNotSpecial: lenNotSpecial, lenSeen: lenSeen});
            // Si tous les épisodes de la saison ont été vus
            if (lenSeen === lenEpisodes) {
                moveSeason();
            }
            else if (lenSeen === lenNotSpecial) {
                new PopupAlert({
                    title: 'Fin de la saison',
                    text: 'Tous les épisodes de la saison, hors spéciaux, ont été vu.<br/>Voulez-vous passer à la saison suivante ?',
                    callback_yes: () => {
                        moveSeason();
                    },
                    callback_no: () => {
                        return true;
                    }
                });
            }
        }
        else {
            $elt.css('background', 'rgba(13,21,28,.2)'); // On enlève le check dans la case à cocher
            $elt.removeClass('seen'); // On supprime la classe 'seen'
            $elt.attr('title', Base_1.Base.trans("member_shows.markas"));
            // On remet le voile masquant sur la vignette de l'épisode
            $elt.parent('div.slide__image')
                .find('img')
                .attr('style', 'filter: blur(5px);');
            const contVignette = $elt.parents('div.slide_flex');
            if (!contVignette.hasClass('slide--notSeen')) {
                contVignette.addClass('slide--notSeen');
            }
            if (jQuery('#episodes .seen').length < lenEpisodes) {
                const $seasonCurrent = jQuery('#seasons div.slide--current');
                $seasonCurrent.find('.checkSeen').remove();
                $seasonCurrent
                    .removeClass('slide--seen')
                    .addClass('slide--notSeen');
            }
        }
        if (update) {
            if (this.show instanceof Show_1.Show) {
                this.show.update(true).then(() => {
                    _this.toggleSpinner(false);
                });
            }
            else {
                console.warn('Episode.show is not an instance of class Show', this);
            }
        }
        return this;
    }
    /**
     * Affiche/masque le spinner de modification des épisodes
     *
     * @param  {boolean}  display  Le flag indiquant si afficher ou masquer
     * @return {Episode}
     */
    toggleSpinner(display) {
        if (!display) {
            jQuery('.spinner').remove();
            if (Base_1.Base.debug)
                console.log('toggleSpinner');
            if (Base_1.Base.debug)
                console.groupEnd();
        }
        else {
            if (Base_1.Base.debug)
                console.groupCollapsed('episode checkSeen');
            if (Base_1.Base.debug)
                console.log('toggleSpinner');
            this.elt.find('.slide__image').prepend(`
                <div class="spinner">
                    <div class="spinner-item"></div>
                    <div class="spinner-item"></div>
                    <div class="spinner-item"></div>
                </div>`);
        }
        return this;
    }
}
exports.Episode = Episode;


/***/ }),

/***/ "./src/Media.ts":
/*!**********************!*\
  !*** ./src/Media.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Media = void 0;
const Base_1 = __webpack_require__(/*! ./Base */ "./src/Base.ts");
class Media extends Base_1.Base {
    followers;
    genres;
    imdb_id;
    language;
    length;
    original_title;
    similars;
    in_account;
    fetchSimilars;
    constructor(data) {
        super(data);
        return this.fill(data);
    }
    /**
     * Remplit l'objet avec les données fournit en paramètre
     * @param  {Obj} data Les données provenant de l'API
     * @returns {Media}
     */
    fill(data) {
        this.followers = parseInt(data.followers, 10);
        this.imdb_id = data.imdb_id;
        this.language = data.language;
        this.length = parseInt(data.length, 10);
        this.original_title = data.original_title;
        if (data.similars && data.similars instanceof Array) {
            this.similars = data.similars;
        }
        this.genres = new Array();
        if (data.genres && data.genres instanceof Array) {
            this.genres = data.genres;
        }
        else if (data.genres instanceof Object) {
            for (let g in data.genres) {
                this.genres.push(data.genres[g]);
            }
        }
        this.in_account = data.in_account;
        super.fill(data);
        return this;
    }
    /**
     * Retourne le nombre de similars
     * @returns {number} Le nombre de similars
     */
    get nbSimilars() {
        return this.similars.length;
    }
    /**
     * Retourne le similar correspondant à l'identifiant
     * @abstract
     * @param  {number} id      L'identifiant du similar
     * @return {Similar|void}   Le similar ou null
     */
    getSimilar(id) {
        if (!this.similars)
            return null;
        for (let s = 0; s < this.similars.length; s++) {
            if (this.similars[s].id === id) {
                return this.similars[s];
            }
        }
        return null;
    }
}
exports.Media = Media;


/***/ }),

/***/ "./src/Movie.ts":
/*!**********************!*\
  !*** ./src/Movie.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Movie = void 0;
const Base_1 = __webpack_require__(/*! ./Base */ "./src/Base.ts");
const Media_1 = __webpack_require__(/*! ./Media */ "./src/Media.ts");
class Movie extends Media_1.Media {
    /***************************************************/
    /*                      STATIC                     */
    /***************************************************/
    /**
     * Methode static servant à retourner un objet show
     * à partir de son ID
     * @param  {number} id             L'identifiant de la série
     * @param  {boolean} [force=false] Indique si on utilise le cache ou non
     * @return {Promise<Movie>}
     */
    static fetch(id, force = false) {
        return new Promise((resolve, reject) => {
            Base_1.Base.callApi('GET', 'movies', 'movie', { id: id }, force)
                .then(data => resolve(new Movie(data, jQuery('.blockInformations'))))
                .catch(err => reject(err));
        });
    }
    /***************************************************/
    /*                  PROPERTIES                     */
    /***************************************************/
    backdrop;
    director;
    original_release_date;
    other_title;
    platform_links;
    poster;
    production_year;
    release_date;
    sale_date;
    tagline;
    tmdb_id;
    trailer;
    url;
    /***************************************************/
    /*                      METHODS                    */
    /***************************************************/
    constructor(data, element) {
        if (data.user.in_account !== undefined) {
            data.in_account = data.user.in_account;
            delete data.user.in_account;
        }
        super(data);
        this.elt = element;
        return this.fill(data);
    }
    /**
     * Remplit l'objet avec les données fournit en paramètre
     * @param  {any} data Les données provenant de l'API
     * @returns {Movie}
     */
    fill(data) {
        if (data.user.in_account !== undefined) {
            data.in_account = data.user.in_account;
            delete data.user.in_account;
        }
        this.backdrop = data.backdrop;
        this.director = data.director;
        this.original_release_date = new Date(data.original_release_date);
        this.other_title = data.other_title;
        this.platform_links = data.platform_links;
        this.poster = data.poster;
        this.production_year = parseInt(data.production_year);
        this.release_date = new Date(data.release_date);
        this.sale_date = new Date(data.sale_date);
        this.tagline = data.tagline;
        this.tmdb_id = parseInt(data.tmdb_id);
        this.trailer = data.trailer;
        this.url = data.url;
        this.mediaType = { singular: Base_1.MediaType.movie, plural: 'movies', className: Movie };
        super.fill(data);
        return this;
    }
}
exports.Movie = Movie;


/***/ }),

/***/ "./src/Note.ts":
/*!*********************!*\
  !*** ./src/Note.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Note = void 0;
class Note {
    constructor(data) {
        this.total = parseInt(data.total, 10);
        this.mean = parseInt(data.mean, 10);
        this.user = parseInt(data.user, 10);
    }
    total;
    mean;
    user;
    getPercentage() {
        return Math.round(((this.mean / 5) * 100) / 10) * 10;
    }
    toString() {
        const votes = 'vote' + (this.total > 1 ? 's' : ''), 
        // On met en forme le nombre de votes
        total = new Intl.NumberFormat('fr-FR', { style: 'decimal', useGrouping: true }).format(this.total), 
        // On limite le nombre de chiffre après la virgule
        note = this.mean.toFixed(1);
        let toString = `${total} ${votes} : ${note} / 5`;
        // On ajoute la note du membre connecté, si il a voté
        if (this.user > 0) {
            toString += `, votre note: ${this.user}`;
        }
        return toString;
    }
}
exports.Note = Note;


/***/ }),

/***/ "./src/Show.ts":
/*!*********************!*\
  !*** ./src/Show.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Show = exports.Showrunner = exports.Platforms = exports.Platform = exports.Picture = exports.Picked = exports.Images = void 0;
const Base_1 = __webpack_require__(/*! ./Base */ "./src/Base.ts");
const Media_1 = __webpack_require__(/*! ./Media */ "./src/Media.ts");
class Images {
    constructor(data) {
        this.show = data.show;
        this.banner = data.banner;
        this.box = data.box;
        this.poster = data.poster;
    }
    show;
    banner;
    box;
    poster;
}
exports.Images = Images;
var Picked;
(function (Picked) {
    Picked[Picked["none"] = 0] = "none";
    Picked[Picked["banner"] = 1] = "banner";
    Picked[Picked["show"] = 2] = "show";
})(Picked = exports.Picked || (exports.Picked = {}));
class Picture {
    constructor(data) {
        this.id = parseInt(data.id, 10);
        this.show_id = parseInt(data.show_id, 10);
        this.login_id = parseInt(data.login_id, 10);
        this.url = data.url;
        this.width = parseInt(data.width, 10);
        this.height = parseInt(data.height, 10);
        this.date = new Date(data.date);
        this.picked = data.picked;
    }
    id;
    show_id;
    login_id;
    url;
    width;
    height;
    date;
    picked;
}
exports.Picture = Picture;
class Platform {
    constructor(data) {
        this.id = parseInt(data.id, 10);
        this.name = data.name;
        this.tag = data.tag;
        this.link_url = data.link_url;
        this.available = data.available;
        this.logo = data.logo;
    }
    id;
    name;
    tag;
    link_url;
    available;
    logo;
}
exports.Platform = Platform;
class Platforms {
    constructor(data) {
        if (data.svods && data.svods instanceof Array) {
            this.svods = new Array();
            for (let s = 0; s < data.svods.length; s++) {
                this.svods.push(new Platform(data.svods[s]));
            }
        }
        if (data.svod) {
            this.svod = new Platform(data.svod);
        }
    }
    svods;
    svod;
}
exports.Platforms = Platforms;
class Showrunner {
    constructor(data) {
        this.id = parseInt(data.id, 10);
        this.name = data.name;
        this.picture = data.picture;
    }
    id;
    name;
    picture;
}
exports.Showrunner = Showrunner;
class Show extends Media_1.Media {
    /***************************************************/
    /*                      STATIC                     */
    /***************************************************/
    /**
     * Methode static servant à retourner un objet show
     * à partir de son ID
     * @param  {number} id             L'identifiant de la série
     * @param  {boolean} [force=false] Indique si on utilise le cache ou non
     * @return {Promise<Show>}
     */
    static fetch(id, force = false) {
        return new Promise((resolve, reject) => {
            Base_1.Base.callApi('GET', 'shows', 'display', { id: id }, force)
                .then(data => resolve(new Show(data, jQuery('.blockInformations'))))
                .catch(err => reject(err));
        });
    }
    /***************************************************/
    /*                  PROPERTIES                     */
    /***************************************************/
    aliases;
    creation;
    country;
    currentSeason;
    images;
    nbEpisodes;
    network;
    next_trailer;
    next_trailer_host;
    rating;
    pictures;
    platforms;
    seasons;
    showrunner;
    social_links;
    status;
    thetvdb_id;
    /***************************************************/
    /*                      METHODS                    */
    /***************************************************/
    constructor(data, element) {
        super(data);
        this.elt = element;
        return this.fill(data);
    }
    /**
     * Récupère les données de la série sur l'API
     * @param  {boolean} [force=true]   Indique si on utilise les données en cache
     * @return {Promise<*>}             Les données de la série
     */
    fetch(force = true) {
        return Base_1.Base.callApi('GET', 'shows', 'display', { id: this.id }, force);
    }
    /**
     * isEnded - Indique si la série est terminée
     *
     * @return {boolean}  Terminée ou non
     */
    isEnded() {
        return (this.status.toLowerCase() === 'ended') ? true : false;
    }
    /**
     * isArchived - Indique si la série est archivée
     *
     * @return {boolean}  Archivée ou non
     */
    isArchived() {
        return this.user.archived;
    }
    /**
     * isFavorite - Indique si la série est dans les favoris
     *
     * @returns {boolean}
     */
    isFavorite() {
        return this.user.favorited;
    }
    /**
     * addToAccount - Ajout la série sur le compte du membre connecté
     * @return {Promise<Show>} Promise of show
     */
    addToAccount() {
        const _this = this;
        if (this.in_account)
            return new Promise(resolve => resolve(_this));
        return new Promise((resolve, reject) => {
            Base_1.Base.callApi('POST', 'shows', 'show', { id: _this.id })
                .then(data => {
                _this.fill(data.show);
                _this.save();
                resolve(_this);
            }, err => {
                reject(err);
            });
        });
    }
    /**
     * Remove Show from account member
     * @return {Promise<Show>} Promise of show
     */
    removeFromAccount() {
        const _this = this;
        if (!this.in_account)
            return new Promise(resolve => resolve(_this));
        return new Promise((resolve, reject) => {
            Base_1.Base.callApi('DELETE', 'shows', 'show', { id: _this.id })
                .then(data => {
                _this.fill(data.show);
                _this.save();
                resolve(this);
            }, err => {
                reject(err);
            });
        });
    }
    /**
     * Archive la série
     * @return {Promise<Show>} Promise of show
     */
    archive() {
        const _this = this;
        return new Promise((resolve, reject) => {
            Media_1.Media.callApi('POST', 'shows', 'archive', { id: _this.id })
                .then(data => {
                _this.fill(data.show);
                _this.save();
                resolve(_this);
            }, err => {
                reject(err);
            });
        });
    }
    /**
     * Désarchive la série
     * @return {Promise<Show>} Promise of show
     */
    unarchive() {
        const _this = this;
        return new Promise((resolve, reject) => {
            Media_1.Media.callApi('DELETE', 'shows', 'archive', { id: _this.id })
                .then(data => {
                _this.fill(data.show);
                _this.save();
                resolve(_this);
            }, err => {
                reject(err);
            });
        });
    }
    /**
     * Ajoute la série aux favoris
     * @return {Promise<Show>} Promise of show
     */
    favorite() {
        const _this = this;
        return new Promise((resolve, reject) => {
            Media_1.Media.callApi('POST', 'shows', 'favorite', { id: _this.id })
                .then(data => {
                _this.fill(data.show);
                _this.save();
                resolve(_this);
            }, err => {
                reject(err);
            });
        });
    }
    /**
     * Supprime la série des favoris
     * @return {Promise<Show>} Promise of show
     */
    unfavorite() {
        const _this = this;
        return new Promise((resolve, reject) => {
            Media_1.Media.callApi('DELETE', 'shows', 'favorite', { id: _this.id })
                .then(data => {
                _this.fill(data.show);
                _this.save();
                resolve(_this);
            }, err => {
                reject(err);
            });
        });
    }
    /**
     * Met à jour les données de la série
     * @param  {Boolean}  [force=false] Forcer la récupération des données sur l'API
     * @param  {Function} [cb=noop]     Fonction de callback
     * @return {Promise<Show>}          Promesse (Show)
     */
    update(force = false, cb = Base_1.Base.noop) {
        const _this = this;
        return new Promise((resolve, reject) => {
            _this.fetch(force).then(data => {
                _this.fill(data.show);
                _this.save();
                _this.updateRender(() => {
                    resolve(_this);
                    cb();
                    _this._callListeners(Base_1.EventTypes.UPDATE);
                });
            })
                .catch(err => {
                Media_1.Media.notification('Erreur de récupération de la ressource Show', 'Show update: ' + err);
                reject(err);
                cb();
            });
        });
    }
    /**
     * Met à jour le rendu de la barre de progression
     * et du prochain épisode
     * @param  {Function} cb Fonction de callback
     * @return {void}
     */
    updateRender(cb = Base_1.Base.noop) {
        this.updateProgressBar();
        this.updateNextEpisode();
        let note = this.objNote;
        if (Base_1.Base.debug) {
            console.log('Next ID et status', {
                next: this.user.next.id,
                status: this.status,
                archived: this.user.archived,
                note_user: note.user
            });
        }
        // Si il n'y a plus d'épisodes à regarder
        if (this.user.remaining === 0) {
            let promise = new Promise(resolve => { return resolve(void 0); });
            // On propose d'archiver si la série n'est plus en production
            if (this.in_account && this.isEnded() && !this.isArchived()) {
                if (Base_1.Base.debug)
                    console.log('Série terminée, popup confirmation archivage');
                promise = new Promise(resolve => {
                    new PopupAlert({
                        title: 'Archivage de la série',
                        text: 'Voulez-vous archiver cette série terminée ?',
                        callback_yes: function () {
                            jQuery('#reactjs-show-actions button.btn-archive').trigger('click');
                            resolve(void 0);
                        },
                        callback_no: function () {
                            resolve(void 0);
                            return true;
                        }
                    });
                });
            }
            // On propose de noter la série
            if (note.user === 0) {
                if (Base_1.Base.debug)
                    console.log('Proposition de voter pour la série');
                promise.then(() => {
                    new PopupAlert({
                        title: Base_1.Base.trans("popin.note.title.show"),
                        text: "Voulez-vous noter la série ?",
                        callback_yes: function () {
                            jQuery('.blockInformations__metadatas .js-render-stars').trigger('click');
                            return true;
                        },
                        callback_no: function () {
                            return true;
                        }
                    });
                });
            }
            promise.then(() => { cb(); });
        }
        else {
            cb();
        }
    }
    /**
     * Met à jour la barre de progression de visionnage de la série
     * @return {void}
     */
    updateProgressBar() {
        if (Base_1.Base.debug)
            console.log('updateProgressBar');
        // On met à jour la barre de progression
        jQuery('.progressBarShow').css('width', this.user.status.toFixed(1) + '%');
    }
    /**
     * Met à jour le bloc du prochain épisode à voir
     * @param   {Function} [cb=noop] Fonction de callback
     * @returns {void}
     */
    updateNextEpisode(cb = Base_1.Base.noop) {
        if (Base_1.Base.debug)
            console.log('updateNextEpisode');
        const $nextEpisode = jQuery('a.blockNextEpisode');
        if ($nextEpisode.length > 0 && this.user.next && this.user.next.id !== null) {
            if (Base_1.Base.debug)
                console.log('nextEpisode et show.user.next OK', this.user);
            // Modifier l'image
            const $img = $nextEpisode.find('img'), $remaining = $nextEpisode.find('.remaining div'), $parent = $img.parent('div'), height = $img.attr('height'), width = $img.attr('width'), next = this.user.next, src = `${Base_1.Base.api.url}/pictures/episodes?key=${Base_1.Base.userKey}&id=${next.id}&width=${width}&height=${height}`;
            $img.remove();
            $parent.append(`<img src="${src}" height="${height}" width="${width}" />`);
            // Modifier le titre
            $nextEpisode.find('.titleEpisode').text(`${next.code.toUpperCase()} - ${next.title}`);
            // Modifier le lien
            $nextEpisode.attr('href', $nextEpisode.attr('href').replace(/s\d{2}e\d{2}/, next.code.toLowerCase()));
            // Modifier le nombre d'épisodes restants
            $remaining.text($remaining.text().trim().replace(/^\d+/, this.user.remaining.toString()));
        }
        else if ($nextEpisode.length <= 0 && this.user.next && this.user.next.id !== null) {
            if (Base_1.Base.debug)
                console.log('No nextEpisode et show.user.next OK', this.user);
            buildNextEpisode(this);
        }
        else if (!this.user.next || this.user.next.id === null) {
            $nextEpisode.remove();
        }
        cb();
        /**
         * Construit une vignette pour le prochain épisode à voir
         * @param  {Show} res  Objet API show
         * @return {void}
         */
        function buildNextEpisode(res) {
            const height = 70, width = 124, src = `${Base_1.Base.api.url}/pictures/episodes?key=${Base_1.Base.userKey}&id=${res.user.next.id}&width=${width}&height=${height}`, serieTitle = res.resource_url.split('/').pop();
            jQuery('.blockInformations__actions').after(`<a href="/episode/${serieTitle}/${res.user.next.code.toLowerCase()}" class="blockNextEpisode media">
                    <div class="media-left">
                    <div class="u-insideBorderOpacity u-insideBorderOpacity--01">
                        <img src="${src}" width="${width}" height="${height}">
                    </div>
                    </div>
                    <div class="media-body">
                    <div class="title">
                        <strong>Prochain épisode à regarder</strong>
                    </div>
                    <div class="titleEpisode">
                        ${res.user.next.code.toUpperCase()} - ${res.user.next.title}
                    </div>
                    <div class="remaining">
                        <div class="u-colorWhiteOpacity05">${res.user.remaining} épisode${(res.user.remaining > 1) ? 's' : ''} à regarder</div>
                    </div>
                    </div>
                </a>`);
        }
    }
    /**
     * On gère l'ajout de la série dans le compte utilisateur
     *
     * @param   {boolean} trigEpisode Flag indiquant si l'appel vient d'un episode vu ou du bouton
     * @returns {void}
     */
    addShowClick(trigEpisode = false) {
        const _this = this;
        const vignettes = $('#episodes .slide__image');
        // Vérifier si le membre a ajouter la série à son compte
        if (!this.in_account) {
            // Remplacer le DOMElement supprime l'eventHandler
            jQuery('#reactjs-show-actions').html(`
                <div class="blockInformations__action">
                    <button class="btn-reset btn-transparent" type="button">
                    <span class="svgContainer">
                        <svg fill="#0D151C" width="14" height="14" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 8H8v6H6V8H0V6h6V0h2v6h6z" fill-rule="nonzero"></path>
                        </svg>
                    </span>
                    </button>
                    <div class="label">Ajouter</div>
                </div>`);
            // On ajoute un event click pour masquer les vignettes
            jQuery('#reactjs-show-actions > div > button').off('click').one('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                if (Base_1.Base.debug)
                    console.groupCollapsed('AddShow');
                const done = function () {
                    // On met à jour les boutons Archiver et Favori
                    changeBtnAdd(_this);
                    // On met à jour le bloc du prochain épisode à voir
                    _this.updateNextEpisode(function () {
                        if (Base_1.Base.debug)
                            console.groupEnd();
                    });
                };
                _this.addToAccount()
                    .then(() => done(), err => {
                    if (err && err.code !== undefined && err.code === 2003) {
                        done();
                        return;
                    }
                    Base_1.Base.notification('Erreur d\'ajout de la série', err);
                    if (Base_1.Base.debug)
                        console.groupEnd();
                });
            });
        }
        /**
         * Ajoute les items du menu Options, ainsi que les boutons Archiver et Favoris
         * et on ajoute un voile sur les images des épisodes non-vu
         *
         * @param  {Show} show L'objet de type Show
         * @return {void}
         */
        function changeBtnAdd(show) {
            let $optionsLinks = $('#dropdownOptions').siblings('.dropdown-menu').children('a.header-navigation-item');
            if ($optionsLinks.length <= 2) {
                let react_id = jQuery('script[id^="/reactjs/"]').get(0).id.split('.')[1], urlShow = show.resource_url.substring(location.origin.length), title = show.title.replace(/"/g, '\\"').replace(/'/g, "\\'"), templateOpts = `
                            <button type="button" class="btn-reset header-navigation-item" onclick="new PopupAlert({
                            showClose: true,
                            type: "popin-subtitles",
                            reactModuleId: "reactjs-subtitles",
                            params: {
                                mediaId: "${show.id}",
                                type: "show",
                                titlePopin: "${title}";
                            },
                            callback: function() {
                                loadRecommendationModule('subtitles');
                                //addScript("/reactjs/subtitles.${react_id}.js", "module-reactjs-subtitles");
                            },
                            });">Sous-titres</button>
                            <a class="header-navigation-item" href="javascript:;" onclick="reportItem(${show.id}, 'show');">Signaler un problème</a>
                            <a class="header-navigation-item" href="javascript:;" onclick="showUpdate('${title}', ${show.id}, '0')">Demander une mise à jour</a>
                            <a class="header-navigation-item" href="webcal://www.betaseries.com/cal/i${urlShow}">Planning iCal de la série</a>

                            <form class="autocomplete js-autocomplete-form header-navigation-item">
                            <button type="reset" class="btn-reset fontWeight700 js-autocomplete-show" style="color: inherit">Recommander la série</button>
                            <div class="autocomplete__toShow" hidden="">
                                <input placeholder="Nom d'un ami" type="text" class="autocomplete__input js-search-friends">
                                <div class="autocomplete__response js-display-response"></div>
                            </div>
                            </form>
                            <a class="header-navigation-item" href="javascript:;">Supprimer de mes séries</a>`;
                if ($optionsLinks.length === 1) {
                    templateOpts = `<a class="header-navigation-item" href="${urlShow}/actions">Vos actions sur la série</a>` + templateOpts;
                }
                jQuery('#dropdownOptions').siblings('.dropdown-menu.header-navigation')
                    .append(templateOpts);
            }
            // On remplace le bouton Ajouter par les boutons Archiver et Favoris
            const divs = jQuery('#reactjs-show-actions > div');
            if (divs.length === 1) {
                jQuery('#reactjs-show-actions').remove();
                let $container = jQuery('.blockInformations__actions'), method = 'prepend';
                // Si le bouton VOD est présent, on place les boutons après
                if ($('#dropdownWatchOn').length > 0) {
                    $container = jQuery('#dropdownWatchOn').parent();
                    method = 'after';
                }
                $container[method](`
                        <div class="displayFlex alignItemsFlexStart"
                                id="reactjs-show-actions"
                                data-show-id="${show.id}"
                                data-user-hasarchived="${show.user.archived ? '1' : ''}"
                                data-show-inaccount="1"
                                data-user-id="${Base_1.Base.userId}"
                                data-show-favorised="${show.user.favorited ? '1' : ''}">
                            <div class="blockInformations__action">
                            <button class="btn-reset btn-transparent btn-archive" type="button">
                                <span class="svgContainer">
                                <svg fill="#0d151c" height="16" width="16" xmlns="http://www.w3.org/2000/svg">
                                    <path d="m16 8-1.41-1.41-5.59 5.58v-12.17h-2v12.17l-5.58-5.59-1.42 1.42 8 8z"></path>
                                </svg>
                                </span>
                            </button>
                            <div class="label">${Base_1.Base.trans('show.button.archive.label')}</div>
                            </div>
                            <div class="blockInformations__action">
                            <button class="btn-reset btn-transparent btn-favoris" type="button">
                                <span class="svgContainer">
                                <svg fill="#FFF" width="20" height="19" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M14.5 0c-1.74 0-3.41.81-4.5 2.09C8.91.81 7.24 0 5.5 0 2.42 0 0 2.42 0 5.5c0 3.78 3.4 6.86 8.55 11.54L10 18.35l1.45-1.32C16.6 12.36 20 9.28 20 5.5 20 2.42 17.58 0 14.5 0zm-4.4 15.55l-.1.1-.1-.1C5.14 11.24 2 8.39 2 5.5 2 3.5 3.5 2 5.5 2c1.54 0 3.04.99 3.57 2.36h1.87C11.46 2.99 12.96 2 14.5 2c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"></path>
                                </svg>
                                </span>
                            </button>
                            <div class="label">${Base_1.Base.trans('show.button.favorite.label')}</div>
                            </div>
                        </div>`);
                show.elt = jQuery('reactjs-show-actions');
                // On ofusque l'image des épisodes non-vu
                let vignette;
                for (let v = 0; v < vignettes.length; v++) {
                    vignette = $(vignettes.get(v));
                    if (vignette.find('.seen').length <= 0) {
                        vignette.find('img.js-lazy-image').attr('style', 'filter: blur(5px);');
                    }
                }
            }
            _this.addEventBtnsArchiveAndFavoris();
            _this.deleteShowClick();
        }
        if (trigEpisode) {
            this.update(true).then(show => {
                changeBtnAdd(show);
            });
        }
    }
    /**
     * Gère la suppression de la série du compte utilisateur
     * @returns {void}
     */
    deleteShowClick() {
        const _this = this;
        let $optionsLinks = $('#dropdownOptions').siblings('.dropdown-menu').children('a.header-navigation-item');
        // Le menu Options est au complet
        if (this.in_account && $optionsLinks.length > 2) {
            this.addEventBtnsArchiveAndFavoris();
            // Gestion de la suppression de la série du compte utilisateur
            $optionsLinks.last().removeAttr('onclick').off('click').on('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                const done = function () {
                    const afterNotif = function () {
                        // On nettoie les propriétés servant à l'update de l'affichage
                        _this.user.status = 0;
                        _this.user.archived = false;
                        _this.user.favorited = false;
                        _this.user.remaining = 0;
                        _this.user.last = "S00E00";
                        _this.user.next.id = null;
                        _this.save();
                        // On remet le bouton Ajouter
                        jQuery('#reactjs-show-actions').html(`
                            <div class="blockInformations__action">
                                <button class="btn-reset btn-transparent btn-add" type="button">
                                <span class="svgContainer">
                                    <svg fill="#0D151C" width="14" height="14" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M14 8H8v6H6V8H0V6h6V0h2v6h6z" fill-rule="nonzero"></path>
                                    </svg>
                                </span>
                                </button>
                                <div class="label">${Base_1.Base.trans('show.button.add.label')}</div>
                            </div>`);
                        // On supprime les items du menu Options
                        $optionsLinks.first().siblings().each((i, e) => { $(e).remove(); });
                        // Nettoyage de l'affichage des épisodes
                        const checks = jQuery('#episodes .slide_flex');
                        let promise, update = false; // Flag pour l'update de l'affichage
                        if (_this.currentSeason.episodes && _this.currentSeason.episodes.length > 0) {
                            promise = new Promise(resolve => resolve(_this.currentSeason));
                        }
                        else {
                            promise = _this.currentSeason.fetchEpisodes();
                        }
                        promise.then((season) => {
                            for (let e = 0; e < season.episodes.length; e++) {
                                if (season.episodes[e].elt === null) {
                                    season.episodes[e].elt = $(checks.get(e));
                                }
                                if (e === season.episodes.length - 1)
                                    update = true;
                                if (Base_1.Base.debug)
                                    console.log('clean episode %d', e, update);
                                season.episodes[e].updateRender('notSeen', update);
                            }
                            _this.addShowClick();
                        });
                    };
                    new PopupAlert({
                        title: Base_1.Base.trans("popup.delete_show_success.title"),
                        text: Base_1.Base.trans("popup.delete_show_success.text", { "%title%": _this.title }),
                        yes: Base_1.Base.trans("popup.delete_show_success.yes"),
                        callback_yes: afterNotif
                    });
                };
                // Supprimer la série du compte utilisateur
                new PopupAlert({
                    title: Base_1.Base.trans("popup.delete_show.title", { "%title%": _this.title }),
                    text: Base_1.Base.trans("popup.delete_show.text", { "%title%": _this.title }),
                    callback_yes: function () {
                        _this.removeFromAccount()
                            .then(() => done(), err => {
                            if (err && err.code !== undefined && err.code === 2004) {
                                done();
                                return;
                            }
                            Media_1.Media.notification('Erreur de suppression de la série', err);
                        });
                    },
                    callback_no: function () { }
                });
            });
        }
    }
    /**
     * Ajoute un eventHandler sur les boutons Archiver et Favoris
     * @returns {void}
     */
    addEventBtnsArchiveAndFavoris() {
        const _this = this;
        let $btnArchive = jQuery('#reactjs-show-actions button.btn-archive'), $btnFavoris = jQuery('#reactjs-show-actions button.btn-favoris');
        if ($btnArchive.length === 0 || $btnFavoris.length === 0) {
            $('#reactjs-show-actions button:first').addClass('btn-archive');
            $btnArchive = jQuery('#reactjs-show-actions button.btn-archive');
            $('#reactjs-show-actions button:last').addClass('btn-favoris');
            $btnFavoris = jQuery('#reactjs-show-actions button.btn-favoris');
        }
        // Event bouton Archiver
        $btnArchive.off('click').click((e) => {
            e.stopPropagation();
            e.preventDefault();
            if (Base_1.Base.debug)
                console.groupCollapsed('show-archive');
            // Met à jour le bouton d'archivage de la série
            function updateBtnArchive(promise, transform, label, notif) {
                promise.then(() => {
                    const $parent = $(e.currentTarget).parent();
                    $('span', e.currentTarget).css('transform', transform);
                    $('.label', $parent).text(Base_1.Base.trans(label));
                    if (Base_1.Base.debug)
                        console.groupEnd();
                }, err => {
                    Base_1.Base.notification(notif, err);
                    if (Base_1.Base.debug)
                        console.groupEnd();
                });
            }
            if (!_this.isArchived()) {
                updateBtnArchive(_this.archive(), 'rotate(180deg)', 'show.button.unarchive.label', 'Erreur d\'archivage de la série');
            }
            else {
                updateBtnArchive(_this.unarchive(), 'rotate(0deg)', 'show.button.archive.label', 'Erreur désarchivage de la série');
            }
        });
        // Event bouton Favoris
        $btnFavoris.off('click').click((e) => {
            e.stopPropagation();
            e.preventDefault();
            if (Base_1.Base.debug)
                console.groupCollapsed('show-favoris');
            if (!_this.isFavorite()) {
                _this.favorite()
                    .then(() => {
                    jQuery(e.currentTarget).children('span').replaceWith(`
                            <span class="svgContainer">
                            <svg width="21" height="19" xmlns="http://www.w3.org/2000/svg">
                                <path d="M15.156.91a5.887 5.887 0 0 0-4.406 2.026A5.887 5.887 0 0 0 6.344.909C3.328.91.958 3.256.958 6.242c0 3.666 3.33 6.653 8.372 11.19l1.42 1.271 1.42-1.28c5.042-4.528 8.372-7.515 8.372-11.18 0-2.987-2.37-5.334-5.386-5.334z"></path>
                            </svg>
                            </span>`);
                    if (Base_1.Base.debug)
                        console.groupEnd();
                }, err => {
                    Base_1.Base.notification('Erreur de favoris de la série', err);
                    if (Base_1.Base.debug)
                        console.groupEnd();
                });
            }
            else {
                _this.unfavorite()
                    .then(() => {
                    $(e.currentTarget).children('span').replaceWith(`
                            <span class="svgContainer">
                            <svg fill="#FFF" width="20" height="19" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14.5 0c-1.74 0-3.41.81-4.5 2.09C8.91.81 7.24 0 5.5 0 2.42 0 0 2.42 0 5.5c0 3.78 3.4 6.86 8.55 11.54L10 18.35l1.45-1.32C16.6 12.36 20 9.28 20 5.5 20 2.42 17.58 0 14.5 0zm-4.4 15.55l-.1.1-.1-.1C5.14 11.24 2 8.39 2 5.5 2 3.5 3.5 2 5.5 2c1.54 0 3.04.99 3.57 2.36h1.87C11.46 2.99 12.96 2 14.5 2c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"></path>
                            </svg>
                            </span>`);
                    if (Base_1.Base.debug)
                        console.groupEnd();
                }, err => {
                    Base_1.Base.notification('Erreur de favoris de la série', err);
                    if (Base_1.Base.debug)
                        console.groupEnd();
                });
            }
        });
    }
    /**
     * Ajoute la classification dans les détails de la ressource
     */
    addRating() {
        if (Base_1.Base.debug)
            console.log('addRating');
        if (this.rating) {
            let rating = Base_1.Base.ratings[this.rating] !== undefined ? Base_1.Base.ratings[this.rating] : null;
            if (rating !== null) {
                // On ajoute la classification
                jQuery('.blockInformations__details')
                    .append(`<li id="rating"><strong>Classification</strong>
                        <img src="${rating.img}" title="${rating.title}"/>
                    </li>`);
            }
        }
    }
    /**
     * Définit la saison courante
     * @param   {number} seasonNumber Le numéro de la saison courante
     * @returns {Show}  L'instance de la série
     * @throws  {Error} if seasonNumber is out of range of seasons
     */
    setCurrentSeason(seasonNumber) {
        if (seasonNumber < 0 || seasonNumber >= this.seasons.length) {
            throw new Error("seasonNumber is out of range of seasons");
        }
        this.currentSeason = this.seasons[seasonNumber];
        return this;
    }
}
exports.Show = Show;


/***/ }),

/***/ "./src/Similar.ts":
/*!************************!*\
  !*** ./src/Similar.ts ***!
  \************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Similar = void 0;
const Base_1 = __webpack_require__(/*! ./Base */ "./src/Base.ts");
const Media_1 = __webpack_require__(/*! ./Media */ "./src/Media.ts");
const Show_1 = __webpack_require__(/*! ./Show */ "./src/Show.ts");
class Similar extends Media_1.Media {
    /* Interface implMovie */
    backdrop;
    director;
    original_release_date;
    other_title;
    platform_links;
    poster;
    production_year;
    release_date;
    sale_date;
    tagline;
    tmdb_id;
    trailer;
    url;
    /* Interface implShow */
    aliases;
    creation;
    country;
    images;
    nbEpisodes;
    network;
    next_trailer;
    next_trailer_host;
    rating;
    pictures;
    platforms;
    seasons;
    showrunner;
    social_links;
    status;
    thetvdb_id;
    constructor(data, type) {
        if (type.singular === Base_1.MediaType.movie) {
            data.in_account = data.user.in_account;
            delete data.user.in_account;
            data.description = data.synopsis;
            delete data.synopsis;
        }
        super(data);
        this.mediaType = type;
        return this.fill(data);
    }
    /**
     * Remplit l'objet avec les données fournit en paramètre
     * @param  {Obj} data Les données provenant de l'API
     * @returns {Similar}
     */
    fill(data) {
        if (this.mediaType.singular === Base_1.MediaType.show) {
            this.aliases = data.aliases;
            this.creation = data.creation;
            this.country = data.country;
            this.images = new Show_1.Images(data.images);
            this.nbEpisodes = parseInt(data.episodes, 10);
            this.network = data.network;
            this.next_trailer = data.next_trailer;
            this.next_trailer_host = data.next_trailer_host;
            this.rating = data.rating;
            this.platforms = new Show_1.Platforms(data.platforms);
            this.seasons = new Array();
            this.showrunner = new Show_1.Showrunner(data.showrunner);
            this.social_links = data.social_links;
            this.status = data.status;
            this.thetvdb_id = parseInt(data.thetvdb_id, 10);
            this.pictures = new Array();
        }
        else if (this.mediaType.singular === Base_1.MediaType.movie) {
            if (data.user.in_account !== undefined) {
                data.in_account = data.user.in_account;
                delete data.user.in_account;
            }
            if (data.synopsis !== undefined) {
                data.description = data.synopsis;
                delete data.synopsis;
            }
            this.backdrop = data.backdrop;
            this.director = data.director;
            this.original_release_date = new Date(data.original_release_date);
            this.other_title = data.other_title;
            this.platform_links = data.platform_links;
            this.poster = data.poster;
            this.production_year = parseInt(data.production_year);
            this.release_date = new Date(data.release_date);
            this.sale_date = new Date(data.sale_date);
            this.tagline = data.tagline;
            this.tmdb_id = parseInt(data.tmdb_id);
            this.trailer = data.trailer;
            this.url = data.url;
        }
        super.fill(data);
        return this;
    }
    /**
     * Récupère les données de la série sur l'API
     * @param  {boolean} [force=true]   Indique si on utilise les données en cache
     * @return {Promise<*>}             Les données de la série
     */
    fetch(force = true) {
        let action = 'display';
        if (this.mediaType.singular === Base_1.MediaType.movie) {
            action = 'movie';
        }
        return Base_1.Base.callApi('GET', this.mediaType.plural, action, { id: this.id }, force);
    }
    /**
     * Ajoute le bandeau Viewed sur le poster du similar
     * @return {Similar}
     */
    addViewed() {
        // Si la série a été vue ou commencée
        if (this.user.status &&
            ((this.mediaType.singular === Base_1.MediaType.movie && this.user.status === 1) ||
                (this.mediaType.singular === Base_1.MediaType.show && this.user.status > 0))) {
            // On ajoute le bandeau "Viewed"
            this.elt.find('a.slide__image').prepend(`<img src="${Base_1.Base.serverBaseUrl}/img/viewed.png" class="bandViewed"/>`);
        }
        return this;
    }
    /**
     * Ajoute l'icône wrench à côté du titre du similar
     * pour permettre de visualiser les données du similar
     * @return {Similar}
     */
    wrench() {
        const $title = this.elt.find('.slide__title'), _this = this;
        $title.html($title.html() +
            `<i class="fa fa-wrench popover-wrench"
                aria-hidden="true"
                style="margin-left:5px;cursor:pointer;"
                data-id="${_this.id}"
                data-type="${_this.mediaType.singular}">
            </i>`);
        $title.find('.popover-wrench').click((e) => {
            e.stopPropagation();
            e.preventDefault();
            const $dataRes = $('#dialog-resource .data-resource'), // DOMElement contenant le rendu JSON de la ressource
            html = document.documentElement;
            const onShow = function () {
                html.style.overflowY = 'hidden';
                jQuery('#dialog-resource')
                    .css('z-index', '1005')
                    .css('overflow', 'scroll');
            };
            const onHide = function () {
                html.style.overflowY = '';
                jQuery('#dialog-resource')
                    .css('z-index', '0')
                    .css('overflow', 'none');
            };
            //if (debug) console.log('Popover Wrench', eltId, self);
            this.fetch().then(function (data) {
                $dataRes.empty().append(renderjson.set_show_to_level(2)(data[_this.mediaType.singular]));
                jQuery('#dialog-resource-title span.counter').empty().text('(' + Base_1.Base.counter + ' appels API)');
                jQuery('#dialog-resource').show(400, onShow);
                jQuery('#dialog-resource .close').click((e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    jQuery('#dialog-resource').hide(400, onHide);
                });
            });
        });
        return this;
    }
    /**
     * Retourne le contenu HTML pour la popup
     * de présentation du similar
     * @return {string}
     */
    getContentPopup() {
        const _this = this;
        //if (debug) console.log('similars tempContentPopup', objRes);
        let description = this.description;
        if (description.length > 200) {
            description = description.substring(0, 200) + '…';
        }
        let template = '';
        function _renderCreation() {
            let html = '';
            if (_this.creation || _this.country || _this.production_year) {
                html += '<p>';
                if (_this.creation) {
                    html += `<u>Création:</u> <strong>${_this.creation}</strong>`;
                }
                if (_this.production_year) {
                    html += `<u>Production:</u> <strong>${_this.production_year}</strong>`;
                }
                if (_this.country) {
                    html += `, <u>Pays:</u> <strong>${_this.country}</strong>`;
                }
                html += '</p>';
            }
            return html;
        }
        function _renderGenres() {
            if (_this.genres && _this.genres.length > 0) {
                return '<p><u>Genres:</u> ' + _this.genres.join(', ') + '</p>';
            }
            return '';
        }
        template = '<div>';
        if (this.mediaType.singular === Base_1.MediaType.show) {
            const status = this.status.toLowerCase() == 'ended' ? 'Terminée' : 'En cours';
            const seen = (this.user.status > 0) ? 'Vu à <strong>' + this.user.status + '%</strong>' : 'Pas vu';
            template += `<p><strong>${this.seasons.length}</strong> saison${(this.seasons.length > 1 ? 's' : '')}, <strong>${this.nbEpisodes}</strong> épisodes, `;
            if (this.objNote.total > 0) {
                template += `<strong>${this.objNote.total}</strong> votes`;
                if (this.objNote.user > 0) {
                    template += `, votre note: ${this.objNote.user}`;
                }
                template += '</p>';
            }
            else {
                template += 'Aucun vote</p>';
            }
            if (!this.in_account) {
                template += '<p><a href="javascript:;" class="addShow">Ajouter</a></p>';
            }
            template += _renderGenres();
            template += _renderCreation();
            let archived = '';
            if (this.user.status > 0 && this.user.archived === true) {
                archived = ', Archivée: <i class="fa fa-check-circle-o" aria-hidden="true"></i>';
            }
            else if (this.user.status > 0) {
                archived = ', Archivée: <i class="fa fa-circle-o" aria-hidden="true"></i>';
            }
            if (this.showrunner && this.showrunner.name.length > 0) {
                template += `<p><u>Show Runner:</u> <strong>${this.showrunner.name}</strong></p>`;
            }
            template += `<p><u>Statut:</u> <strong>${status}</strong>, ${seen}${archived}</p>`;
        }
        // movie
        else {
            template += '<p>';
            if (this.objNote.total > 0) {
                template += `<strong>${this.objNote.total}</strong> votes`;
                if (this.objNote.user > 0) {
                    template += `, votre note: ${this.objNote.user}`;
                }
            }
            else {
                template += 'Aucun vote';
            }
            template += '</p>';
            // Ajouter une case à cocher pour l'état "Vu"
            template += `<p><label for="seen">Vu</label>
                <input type="checkbox" class="movie movieSeen" name="seen" data-movie="${this.id}" ${this.user.status === 1 ? 'checked' : ''} style="margin-right:5px;"></input>`;
            // Ajouter une case à cocher pour l'état "A voir"
            template += `<label for="mustSee">A voir</label>
                <input type="checkbox" class="movie movieMustSee" name="mustSee" data-movie="${this.id}" ${this.user.status === 0 ? 'checked' : ''} style="margin-right:5px;"></input>`;
            // Ajouter une case à cocher pour l'état "Ne pas voir"
            template += `<label for="notSee">Ne pas voir</label>
                <input type="checkbox" class="movie movieNotSee" name="notSee" data-movie="${this.id}"  ${this.user.status === 2 ? 'checked' : ''}></input></p>`;
            template += _renderGenres();
            template += _renderCreation();
            if (this.director) {
                template += `<p><u>Réalisateur:</u> <strong>${this.director}</strong></p>`;
            }
        }
        return template + `<p>${description}</p></div>`;
    }
    /**
     * Retourne le contenu HTML du titre de la popup
     * @return {string}
     */
    getTitlePopup() {
        if (Base_1.Base.debug)
            console.log('getTitlePopup', this);
        let title = this.title;
        if (this.objNote.total > 0) {
            title += ' <span style="font-size: 0.8em;color:#000;">' +
                this.objNote.mean.toFixed(2) + ' / 5</span>';
        }
        return title;
    }
    /**
     * Met à jour l'attribut title de la note du similar
     * @param  {Boolean} change Indique si il faut modifier l'attribut
     * @return {string}         La valeur modifiée de l'attribut title
     */
    updateTitleNote(change = true) {
        const $elt = this.elt.find('.stars-outer');
        if (this.objNote.mean <= 0 || this.objNote.total <= 0) {
            if (change)
                $elt.attr('title', 'Aucun vote');
            return '';
        }
        const title = this.objNote.toString();
        if (change) {
            $elt.attr('title', title);
        }
        return title;
    }
    /**
     * Ajoute la note, sous forme d'étoiles, du similar sous son titre
     * @return {Similar}
     */
    renderStars() {
        // On ajoute le code HTML pour le rendu de la note
        this.elt.find('.slide__title').after('<div class="stars-outer"><div class="stars-inner"></div></div>');
        this.updateTitleNote();
        this.elt.find('.stars-inner').width(this.objNote.getPercentage() + '%');
        return this;
    }
    /**
     * Vérifie la présence de l'image du similar
     * et tente d'en trouver une si celle-ci n'est pas présente
     * @return {Similar}
     */
    checkImg() {
        const $img = this.elt.find('img.js-lazy-image'), _this = this;
        if ($img.length <= 0) {
            if (this.mediaType.singular === Base_1.MediaType.show && this.thetvdb_id && this.thetvdb_id > 0) {
                // On tente de remplacer le block div 404 par une image
                this.elt.find('div.block404').replaceWith(`
                    <img class="u-opacityBackground fade-in"
                            width="125"
                            height="188"
                            alt="Poster de ${this.title}"
                            src="https://artworks.thetvdb.com/banners/posters/${this.thetvdb_id}-1.jpg"/>`);
            }
            else if (this.mediaType.singular === Base_1.MediaType.movie && this.tmdb_id && this.tmdb_id > 0) {
                if (Base_1.Base.themoviedb_api_user_key.length <= 0)
                    return;
                const uriApiTmdb = `https://api.themoviedb.org/3/movie/${this.tmdb_id}?api_key=${Base_1.Base.themoviedb_api_user_key}&language=fr-FR`;
                fetch(uriApiTmdb).then(response => {
                    if (!response.ok)
                        return null;
                    return response.json();
                }).then(data => {
                    if (data !== null && data.poster_path !== undefined && data.poster_path !== null) {
                        _this.elt.find('div.block404').replaceWith(`
                            <img class="u-opacityBackground fade-in"
                                    width="125"
                                    height="188"
                                    alt="Poster de ${_this.title}"
                                    src="https://image.tmdb.org/t/p/original${data.poster_path}"/>`);
                    }
                });
            }
        }
        return this;
    }
    /**
     * Add Show to account member
     * @return {Promise<Similar>} Promise of show
     */
    addToAccount(state = 0) {
        const _this = this;
        if (this.in_account)
            return new Promise(resolve => resolve(_this));
        let params = { id: this.id };
        if (this.mediaType.singular === Base_1.MediaType.movie) {
            params.state = state;
        }
        return new Promise((resolve, reject) => {
            Base_1.Base.callApi('POST', _this.mediaType.plural, _this.mediaType.singular, params)
                .then(data => {
                _this.fill(data[_this.mediaType.singular]).save();
                resolve(_this);
            }, err => {
                reject(err);
            });
        });
    }
}
exports.Similar = Similar;


/***/ }),

/***/ "./src/Subtitle.ts":
/*!*************************!*\
  !*** ./src/Subtitle.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Subtitle = void 0;
class Subtitle {
    constructor(data) {
        this.id = parseInt(data.id, 10);
        this.language = data.language;
        this.source = data.source;
        this.quality = parseInt(data.quality, 10);
        this.file = data.file;
        this.url = data.url;
        this.date = new Date(data.date);
    }
    id;
    language;
    source;
    quality;
    file;
    url;
    date;
}
exports.Subtitle = Subtitle;


/***/ }),

/***/ "./src/UpdateAuto.ts":
/*!***************************!*\
  !*** ./src/UpdateAuto.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UpdateAuto = void 0;
const Base_1 = __webpack_require__(/*! ./Base */ "./src/Base.ts");
class UpdateAuto {
    static instance;
    static intervals = [
        { val: 0, label: 'Jamais' },
        { val: 1, label: '1 min.' },
        { val: 5, label: '5 min.' },
        { val: 10, label: '10 min.' },
        { val: 15, label: '15 min.' },
        { val: 30, label: '30 min.' },
        { val: 45, label: '45 min.' },
        { val: 60, label: '60 min.' }
    ];
    _show;
    _showId;
    _exist;
    _status;
    _auto;
    _interval;
    _timer;
    constructor(show) {
        this._show = show;
        this._showId = show.id;
        let objUpAuto = GM_getValue('objUpAuto');
        this._exist = false;
        if (objUpAuto[this._showId] !== undefined) {
            this._exist = true;
            this._status = objUpAuto[this._showId].status;
            this._auto = objUpAuto[this._showId].auto;
            this._interval = objUpAuto[this._showId].interval;
        }
        else {
            this._status = false; // Statut de la tâche d'update
            this._auto = false; // Autorise l'activation de la tâche d'update des épisodes
            this._interval = 0; // Intervalle de temps entre les mises à jour
        }
        this.changeColorBtn();
        return this;
    }
    static getInstance(s) {
        if (!UpdateAuto.instance) {
            UpdateAuto.instance = new UpdateAuto(s);
        }
        return UpdateAuto.instance;
    }
    /**
     * _save - Sauvegarde les options de la tâche d'update
     * auto dans l'espace de stockage de Tampermonkey
     *
     * @return {UpdateAuto} L'instance unique UpdateAuto
     */
    _save() {
        let objUpAuto = GM_getValue('objUpAuto');
        let obj = {
            status: this._status,
            auto: this._auto,
            interval: this._interval
        };
        objUpAuto[this._showId] = obj;
        GM_setValue('objUpAuto', objUpAuto);
        this._exist = true;
        this.changeColorBtn();
        return this;
    }
    /**
     * get status - Retourne le statut de la tâche d'update auto
     * des épisodes
     *
     * @return {boolean}  Le statut
     */
    get status() {
        return this._status;
    }
    /**
     * set status - Modifie le statut de la tâche d'update auto
     * des épisodes
     *
     * @param  {boolean} status Le statut de la tâche
     */
    set status(status) {
        this._status = status;
        this._save();
    }
    /**
     * get auto - Flag indiquant l'autorisation de pouvoir lancer
     * la tâche d'update auto
     *
     * @return {boolean}  Flag d'autorisation
     */
    get auto() {
        return this._auto;
    }
    /**
     * set auto - Modifie l'autorisation de lancer la tâche
     * d'update auto
     *
     * @param  {boolean} auto Le flag
     */
    set auto(auto) {
        this._auto = auto;
        this._save();
    }
    /**
     * get interval - Retourne l'intervalle de temps entre
     * chaque update auto
     *
     * @return {number}  L'intervalle de temps en minutes
     */
    get interval() {
        return this._interval;
    }
    /**
     * set interval - Définit l'intervalle de temps, en minutes,
     * entre chaque update auto
     *
     * @param  {number} val L'intervalle de temps en minutes
     */
    set interval(val) {
        this._interval = val;
        this._save();
    }
    /**
     * changeColorBtn - Modifie la couleur du bouton d'update
     * des épisodes sur la page Web
     *
     * @return {UpdateAuto} L'instance unique UpdateAuto
     */
    changeColorBtn() {
        let color = '#fff';
        if (!this._exist) {
            color = '#6c757d'; // grey
        }
        else if (this._status && this._auto) {
            color = 'green';
        }
        else if (this._auto && !this._status) {
            color = 'orange';
        }
        else if (!this._auto && !this._status) {
            color = 'red';
        }
        $('.updateEpisodes').css('color', color);
        return this;
    }
    /**
     * stop - Permet de stopper la tâche d'update auto et
     * aussi de modifier le flag et l'intervalle en fonction
     * de l'état de la série
     *
     * @return {UpdateAuto} L'instance unique UpdateAuto
     */
    stop() {
        if (this._show.user.remaining <= 0 && this._show.isEnded()) {
            this._auto = false;
            this._interval = 0;
        }
        else if (this._show.user.remaining <= 0) {
            this._auto = false;
        }
        this.status = false;
        clearInterval(this._timer);
        this._timer = null;
        return this;
    }
    /**
     * delete - Supprime les options d'update auto
     * de la série de l'espace de stockage
     *
     * @return {UpdateAuto} L'instance unique UpdateAuto
     */
    delete() {
        this.stop();
        let objUpAuto = GM_getValue('objUpAuto');
        if (objUpAuto[this._showId] !== undefined) {
            delete objUpAuto[this._showId];
            GM_setValue('objUpAuto', objUpAuto);
        }
        return this;
    }
    /**
     * launch - Permet de lancer la tâche d'update auto
     * des épisodes
     *
     * @return {UpdateAuto} L'instance unique UpdateAuto
     */
    launch() {
        // Si les options sont modifiées pour arrêter la tâche
        // et que le statut est en cours
        if (this._status && (!this._auto || this._interval <= 0)) {
            if (Base_1.Base.debug)
                console.log('close interval updateEpisodeListAuto');
            return this.stop();
        }
        // Si les options modifiées pour lancer
        else if (this._auto && this._interval > 0) {
            if (this._show.user.remaining <= 0) {
                this.stop();
                return this;
            }
            this.status = true;
            if (this._timer) {
                if (Base_1.Base.debug)
                    console.log('close old interval timer');
                clearInterval(this._timer);
            }
            const _this = this;
            this._timer = setInterval(function () {
                // if (debug) console.log('UpdateAuto setInterval objShow', Object.assign({}, _this._objShow));
                if (!_this._auto || _this._show.user.remaining <= 0) {
                    if (Base_1.Base.debug)
                        console.log('Arrêt de la mise à jour auto des épisodes');
                    _this.stop();
                    return;
                }
                if (Base_1.Base.debug)
                    console.log('update episode list');
                const btnUpEpisodeList = $('.updateEpisodes');
                if (btnUpEpisodeList.length > 0) {
                    btnUpEpisodeList.trigger('click');
                    if (!_this._status) {
                        _this.status = true;
                    }
                }
            }, (this._interval * 60) * 1000);
        }
        return this;
    }
}
exports.UpdateAuto = UpdateAuto;


/***/ }),

/***/ "./src/User.ts":
/*!*********************!*\
  !*** ./src/User.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.User = void 0;
class Next {
    constructor(data) {
        this.id = parseInt(data.id, 10);
        this.code = data.code;
        this.date = new Date(data.date);
        this.title = data.title;
        this.image = data.image;
    }
    id;
    code;
    date;
    title;
    image;
}
class User {
    constructor(data) {
        this.archived = data.archived;
        this.downloaded = data.downloaded;
        this.favorited = data.favorited;
        this.friends_want_to_watch = data.friends_want_to_watch;
        this.friends_watched = data.friends_watched;
        this.hidden = data.hidden;
        this.last = data.last;
        this.mail = data.mail;
        this.next = new Next(data.next);
        this.profile = data.profile;
        this.remaining = data.remaining;
        this.seen = data.seen;
        this.status = parseInt(data.status, 10);
        this.tags = data.tags;
        this.twitter = data.twitter;
    }
    archived;
    downloaded;
    favorited;
    friends_want_to_watch;
    friends_watched;
    hidden;
    last;
    mail;
    next;
    profile;
    remaining;
    seen;
    status;
    tags;
    twitter;
}
exports.User = User;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
const Cache_1 = __webpack_require__(/*! ./Cache */ "./src/Cache.ts");
const Base_1 = __webpack_require__(/*! ./Base */ "./src/Base.ts");
const Media_1 = __webpack_require__(/*! ./Media */ "./src/Media.ts");
const Show_1 = __webpack_require__(/*! ./Show */ "./src/Show.ts");
const Movie_1 = __webpack_require__(/*! ./Movie */ "./src/Movie.ts");
const Episode_1 = __webpack_require__(/*! ./Episode */ "./src/Episode.ts");
const Similar_1 = __webpack_require__(/*! ./Similar */ "./src/Similar.ts");
const UpdateAuto_1 = __webpack_require__(/*! ./UpdateAuto */ "./src/UpdateAuto.ts");
'use strict';
/************************************************************************************************/
/*                               PARAMETRES A MODIFIER                                          */
/************************************************************************************************/
let betaseries_api_user_token = '';
/* Ajouter ici votre clé d'API BetaSeries (Demande de clé API: https://www.betaseries.com/api/) */
let betaseries_api_user_key = '';
/* Ajouter ici votre clé d'API V3 à themoviedb */
let themoviedb_api_user_key = '';
/* Ajouter ici l'URL de base de votre serveur distribuant les CSS, IMG et JS */
const serverBaseUrl = 'https://azema.github.io/betaseries-oauth';
/************************************************************************************************/
/**
 * Remplit l'objet avec les données fournit en paramètre
 * @param  {Obj} data Les données provenant de l'API
 * @returns {Show}
 */
Show_1.Show.prototype.fill = function (data) {
    this.aliases = data.aliases;
    this.creation = data.creation;
    this.country = data.country;
    this.images = new Show_1.Images(data.images);
    this.nbEpisodes = parseInt(data.episodes, 10);
    this.network = data.network;
    this.next_trailer = data.next_trailer;
    this.next_trailer_host = data.next_trailer_host;
    this.rating = data.rating;
    this.platforms = new Show_1.Platforms(data.platforms);
    this.seasons = new Array();
    for (let s = 0; s < data.seasons_details.length; s++) {
        this.seasons.push(new Episode_1.Season(data.seasons_details[s], this));
    }
    this.showrunner = new Show_1.Showrunner(data.showrunner);
    this.social_links = data.social_links;
    this.status = data.status;
    this.thetvdb_id = parseInt(data.thetvdb_id, 10);
    this.pictures = new Array();
    this.mediaType = { singular: Base_1.MediaType.show, plural: 'shows', className: Show_1.Show };
    Media_1.Media.prototype.fill.call(this, data);
    return this;
};
/**
 * Retourne les similars associés au media
 * @abstract
 * @return {Promise<Media>}
 */
Media_1.Media.prototype.fetchSimilars = function () {
    const _this = this;
    this.similars = [];
    return new Promise((resolve, reject) => {
        Base_1.Base.callApi('GET', this.mediaType.plural, 'similars', { id: this.id, details: true }, true)
            .then(data => {
            if (data.similars.length > 0) {
                for (let s = 0; s < data.similars.length; s++) {
                    _this.similars.push(new Similar_1.Similar(data.similars[s][_this.mediaType.singular], _this.mediaType));
                }
            }
            _this.save();
            resolve(_this);
        }, err => {
            reject(err);
        });
    });
};
(function ($) {
    const debug = false, url = location.pathname, noop = function () { }, regexUser = new RegExp('^/membre/[A-Za-z0-9]*$'), 
    // Objet contenant les scripts et feuilles de style utilisées par le userscript
    scriptsAndStyles = {
        "moment": {
            type: 'script',
            id: 'jsmomment',
            src: 'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js',
            integrity: 'sha512-qTXRIMyZIFb8iQcfjXWCO8+M5Tbc38Qi5WzdPOYZHIlZpzBHG3L3by84BBBOiRGiEb7KKtAOAs5qYdUiZiQNNQ=='
        },
        "localefr": {
            type: 'script',
            id: 'jslocalefr',
            src: 'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/locale/fr.min.js',
            integrity: 'sha512-RAt2+PIRwJiyjWpzvvhKAG2LEdPpQhTgWfbEkFDCo8wC4rFYh5GQzJBVIFDswwaEDEYX16GEE/4fpeDNr7OIZw=='
        },
        "popover": {
            type: 'style',
            id: 'csspopover',
            href: `${serverBaseUrl}/css/popover.min.css`,
            integrity: 'sha384-0+WYbwjuMdB+tkwXZjC24CjnKegI87PHNRai4K6AXIKTgpetZCQJ9dNVqJ5dUnpg'
        },
        "bootstrap": {
            type: 'script',
            id: 'jsbootstrap',
            src: 'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js',
            integrity: 'sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl'
        },
        "tablecss": {
            type: 'style',
            id: 'tablecss',
            href: `${serverBaseUrl}/css/table.min.css`,
            integrity: 'sha384-83x9kix7Q4F8l4FQwGfdbntFyjmZu3F1fB8IAfWdH4cNFiXYqAVrVArnil0rkc1p'
        },
        "stylehome": {
            type: 'style',
            id: 'stylehome',
            href: `${serverBaseUrl}/css/style.min.css`,
            integrity: 'sha384-z4aam29xkOKmgpOUGhk9kS8/SutkQeUtEBBXm2NYiZFc2CJSvH5hothze+P0/dz8'
        },
        "awesome": {
            type: 'style',
            id: 'awesome',
            href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css',
            integrity: 'sha512-SfTiTlX6kk+qitfevl/7LibUOeJWlt9rbyDn92a1DqWOw9vWG2MFoays0sgObmWazO5BQPiFucnnEAjpAB+/Sw=='
        }
    }, 
    // URI des images et description des classifications TV et films
    ratings = {
        'D-10': {
            img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Moins10.svg/30px-Moins10.svg.png',
            title: "Déconseillé au moins de 10 ans"
        },
        'D-12': {
            img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Moins12.svg/30px-Moins12.svg.png',
            title: 'Déconseillé au moins de 12 ans'
        },
        'D-16': {
            img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Moins16.svg/30px-Moins16.svg.png',
            title: 'Déconseillé au moins de 16 ans'
        },
        'D-18': {
            img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Moins18.svg/30px-Moins18.svg.png',
            title: 'Ce programme est uniquement réservé aux adultes'
        },
        'TV-Y': {
            img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/TV-Y_icon.svg/50px-TV-Y_icon.svg.png',
            title: 'Ce programme est évalué comme étant approprié aux enfants'
        },
        'TV-Y7': {
            img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/TV-Y7_icon.svg/50px-TV-Y7_icon.svg.png',
            title: 'Ce programme est désigné pour les enfants âgés de 7 ans et plus'
        },
        'TV-G': {
            img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/TV-G_icon.svg/50px-TV-G_icon.svg.png',
            title: 'La plupart des parents peuvent considérer ce programme comme approprié pour les enfants'
        },
        'TV-PG': {
            img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/TV-PG_icon.svg/50px-TV-PG_icon.svg.png',
            title: 'Ce programme contient des éléments que les parents peuvent considérer inappropriés pour les enfants'
        },
        'TV-14': {
            img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/TV-14_icon.svg/50px-TV-14_icon.svg.png',
            title: 'Ce programme est déconseillé aux enfants de moins de 14 ans'
        },
        'TV-MA': {
            img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/TV-MA_icon.svg/50px-TV-MA_icon.svg.png',
            title: 'Ce programme est uniquement réservé aux adultes'
        },
        'G': {
            img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/RATED_G.svg/30px-RATED_G.svg.png',
            title: 'Tous publics'
        },
        'PG': {
            img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/RATED_PG.svg/54px-RATED_PG.svg.png',
            title: 'Accord parental souhaitable'
        },
        'PG-13': {
            img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/RATED_PG-13.svg/95px-RATED_PG-13.svg.png',
            title: 'Accord parental recommandé, film déconseillé aux moins de 13 ans'
        },
        'R': {
            img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/RATED_R.svg/40px-RATED_R.svg.png',
            title: 'Les enfants de moins de 17 ans doivent être accompagnés d\'un adulte'
        },
        'NC-17': {
            img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Nc-17.svg/85px-Nc-17.svg.png',
            title: 'Interdit aux enfants de 17 ans et moins'
        }
    };
    let timer, timerUA, currentUser, cache, dialog, fnLazy;
    /* Initialize the cache */
    cache = new Cache_1.CacheUS();
    /**
     * Paramétrage de la super classe abstraite Base
     */
    Base_1.Base.debug = debug;
    Base_1.Base.cache = cache;
    Base_1.Base.notification = notification;
    Base_1.Base.userIdentified = userIdentified;
    Base_1.Base.token = betaseries_api_user_token;
    Base_1.Base.userKey = betaseries_api_user_key;
    Base_1.Base.userId = betaseries_user_id;
    Base_1.Base.trans = trans;
    Base_1.Base.ratings = ratings;
    Base_1.Base.themoviedb_api_user_key = themoviedb_api_user_key;
    Base_1.Base.serverBaseUrl = serverBaseUrl;
    // On affiche la version du script
    if (debug)
        console.log('UserScript BetaSeries v%s', GM_info.script.version);
    // Ajout des feuilles de styles pour le userscript
    addScriptAndLink(['awesome', 'stylehome']);
    if (typeof lazyLoad === 'undefined') {
        let notLoop = 0;
        let timerLazy = setInterval(function () {
            // Pour eviter une boucle infinie
            if (++notLoop >= 20) {
                clearInterval(timerLazy);
                // Ca ne fera pas le job, mais ça ne déclenchera pas d'erreur
                fnLazy = { init: function () { console.warn('fake lazyLoad'); } };
                return;
            }
            if (typeof lazyLoad !== 'undefined') {
                fnLazy = new lazyLoad({});
                clearInterval(timerLazy);
                timerLazy = null;
            }
        }, 500);
    }
    else {
        fnLazy = new lazyLoad({});
    }
    checkApiVersion();
    // Fonctions appeler pour les pages des series, des films et des episodes
    if (/^\/(serie|film|episode)\/.*/.test(url)) {
        // On récupère d'abord la ressource courante pour instancier un objet Media
        getResource(true).then((objRes) => {
            if (debug)
                console.log('objet resource Media(%s)', objRes.constructor.name, objRes);
            if (debug)
                addBtnDev(); // On ajoute le bouton de Dev
            removeAds(); // On retire les pubs
            similarsViewed(objRes); // On s'occupe des ressources similaires
            objRes.decodeTitle(); // On décode le titre de la ressource
            objRes.addNumberVoters(); // On ajoute le nombre de votes à la note
            upgradeSynopsis(); // On améliore le fonctionnement de l'affichage du synopsis
            if (/^\/serie\//.test(url)) {
                objRes.addRating(); // On ajoute la classification TV de la ressource courante
                // On ajoute la gestion des épisodes
                waitSeasonsAndEpisodesLoaded(() => upgradeEpisodes(objRes));
            }
        });
    }
    // Fonctions appeler pour la page de gestion des series
    else if (/^\/membre\/.*\/series$/.test(url)) {
        addStatusToGestionSeries();
    }
    // Fonctions appeler sur la page des membres
    else if ((regexUser.test(url) || /^\/membre\/[A-Za-z0-9]*\/amis$/.test(url)) && userIdentified()) {
        if (regexUser.test(url)) {
            // On récupère les infos du membre connecté
            getMember()
                .then(function (member) {
                currentUser = member;
                let login = url.split('/')[2];
                // On ajoute la fonction de comparaison des membres
                if (currentUser && login != currentUser.login) {
                    compareMembers();
                }
            });
        }
        else {
            searchFriends();
        }
    }
    // Fonctions appeler sur les pages des méthodes de l'API
    else if (/^\/api/.test(url)) {
        if (/\/methodes/.test(url)) {
            sommaireDevApi();
        }
        else if (/\/console/.test(url)) {
            updateApiConsole();
        }
    }
    // Fonctions appeler sur les pages des séries
    else if (/^\/series\//.test(url)) {
        if (debug)
            console.log('Page des séries');
        waitPagination();
        seriesFilterPays();
        if (/agenda/.test(url)) {
            let countTimer = 0;
            timerUA = setInterval(function () {
                if (++countTimer > 50) {
                    clearInterval(timerUA);
                    notification('Erreur Update Agenda', 'Le timer de chargement a dépassé le temps max autorisé.');
                    return;
                }
                updateAgenda();
            }, 1000);
        }
    }
    // On observe l'espace lié à la recherche de séries ou de films, en haut de page.
    // Afin de modifier quelque peu le résultat, pour pouvoir lire l'intégralité du titre
    const observer = new MutationObserver(mutationsList => {
        let updateTitle = (i, e) => { if (isTruncated(e)) {
            $(e).parents('a').attr('title', $(e).text());
        } };
        for (let mutation of mutationsList) {
            if (mutation.type == 'childList' && mutation.addedNodes.length === 1) {
                let node = mutation.addedNodes[0], $node = $(node);
                if ($node.hasClass('col-md-4')) {
                    $('.mainLink', $node).each(updateTitle);
                }
                else if ($node.hasClass('js-searchResult')) {
                    let title = $('.mainLink', $node).get(0);
                    if (isTruncated(title)) {
                        $node.attr('title', $(title).text());
                    }
                }
            }
        }
    });
    observer.observe(document.getElementById('reactjs-header-search'), { childList: true, subtree: true });
    /**
     * Verifie si l'élément est tronqué, généralement, du texte
     * @params {Object} Objet DOMElement
     * @return {boolean}
     */
    function isTruncated(el) {
        return el.scrollWidth > el.clientWidth;
    }
    /**
     * Verifie si l'utilisateur est connecté
     * @return {boolean}
     */
    function userIdentified() {
        return typeof betaseries_api_user_token !== 'undefined';
    }
    /**
     * Cette fonction vérifie la dernière version de l'API
     */
    function checkApiVersion() {
        fetch(location.origin + '/api/versions').then((resp) => {
            if (!resp.ok) {
                return '';
            }
            return resp.text();
        }).then(html => {
            if (html && html.length > 0) {
                // Convert the HTML string into a document object
                let parser = new DOMParser(), doc = parser.parseFromString(html, 'text/html');
                // $('.maincontent > ul > li > strong').last().text().trim().split(' ')[1]
                const latest = doc.querySelector('.maincontent > ul > li:last-child > strong').textContent.split(' ')[1].trim(), lastF = parseFloat(latest);
                if (!Number.isNaN(lastF) && lastF > parseFloat(Media_1.Media.api.versions.last)) {
                    window.alert("L'API possède une nouvelle version: " + latest);
                }
            }
        });
    }
    /**
     * Permet d'afficher les messages d'erreur liés au script
     *
     * @param {String} title Le titre du message
     * @param {String} text  Le texte du message
     * @return {void}
     */
    function notification(title, text) {
        // GM_notification(details, ondone), GM_notification(text, title, image, onclick)
        let notifContainer = $('.userscript-notifications');
        // On ajoute notre zone de notifications
        if ($('.userscript-notifications').length <= 0) {
            $('#fb-root').after('<div class="userscript-notifications"><h3><span class="title"></span><i class="fa fa-times" aria-hidden="true"></i></h3><p class="text"></p></div>');
            notifContainer = $('.userscript-notifications');
            $('.userscript-notifications .fa-times').click(() => {
                $('.userscript-notifications').slideUp();
            });
        }
        notifContainer.hide();
        $('.userscript-notifications .title').html(title);
        $('.userscript-notifications .text').html(text);
        notifContainer.slideDown().delay(5000).slideUp();
    }
    /**
     * addScriptAndLink - Permet d'ajouter un script ou un link sur la page Web
     *
     * @param  {String|String[]} name Le ou les identifiants des éléments à charger
     * @return {void}
     */
    function addScriptAndLink(name) {
        if (name instanceof Array) {
            if (name.length > 1) {
                for (let n = 0; n < name.length; n++) {
                    addScriptAndLink(name[n]);
                }
                return;
            }
            else {
                name = name[0];
            }
        }
        // On vérifie que le nom est connu
        if (!scriptsAndStyles || !(name in scriptsAndStyles)) {
            throw new Error(`${name} ne fait pas partit des données de scripts ou de styles`);
        }
        let element, data = scriptsAndStyles[name];
        if (data.type === 'script') {
            // https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js
            element = `
                <script src="${data.src}"
                        id="${data.id}"
                        integrity="${data.integrity}"
                        crossorigin="anonymous" referrerpolicy="no-referrer">
                </script>`;
        }
        else if (data.type === 'style') {
            element = `
                <link rel="stylesheet"
                      id="${data.id}"
                      href="${data.href}"
                      integrity="${data.integrity}"
                      crossorigin="anonymous" referrerpolicy="no-referrer" />`;
        }
        $('head').append(element);
    }
    /**
     * Fonction modifiant le fonctionnement du filtre pays
     * pour permettre d'ajouter plusieurs pays sur la page des séries
     * @return {void}
     */
    function seriesFilterPays() {
        if (url.split('/').pop() == 'agenda')
            return;
        let $input = $('.filter-container-others-countries input');
        // Supprimer l'attribut onclick de l'input other-countries
        $input.removeAttr('onchange');
        $input.on('change', function () {
            let hasSelect = $('option[value="' + $input.val() + '"]'), btnTemp = '<button type="button" class="btn-reset btn-btn filter-btn active" id="' +
                hasSelect.attr("id") + '" onclick="searchOption(this);">' +
                hasSelect.attr("value") + '</button>';
            $('#pays > button').last().after(btnTemp);
            deleteFilterOthersCountries();
            countFilter("pays");
        });
        const baseUrl = generate_route("shows");
        let hash = url.substring(baseUrl.length);
        if (hash.length === 0) {
            return;
        }
        const data = hash.split('/');
        if (!data.find((el) => el.match(/^tri-|sort-/g))) {
            data.push(CONSTANTE_FILTER.tri + "-" + CONSTANTE_SORT.popularite);
        }
        for (let i in data) {
            const splitData = data[i].split('-'), filter = splitData.shift(), dataFilter = decodeURIComponent(splitData.join('-'));
            if (filter && dataFilter &&
                (filter === CONSTANTE_FILTER.paspays || filter === CONSTANTE_FILTER.pays)) {
                const hasActive = filter === CONSTANTE_FILTER.pays, hasButton = $("#left #pays > button#" + dataFilter.toUpperCase()), optionExist = $('datalist[id="other-countries"] option[id="' + dataFilter.toUpperCase() + '"]');
                if (hasButton.length <= 0 && optionExist) {
                    let btnTemp = '<button type="button" class="btn-reset btn-btn filter-btn' + (hasActive ? ' active' : ' hactive') +
                        '" id="' + dataFilter.toUpperCase() + '" onclick="searchOption(this);">' +
                        optionExist.attr('value') + '</button>';
                    $('#pays > button').last().after(btnTemp);
                    optionExist.remove();
                    deleteFilterOthersCountries();
                    countFilter("pays");
                }
            }
        }
        function countFilter(target) {
            const current = $('#count_' + target);
            if (current.length > 0) {
                let len = $('#pays > button.hactive, #pays > button.active').length, display = 'none';
                current.text(len);
                if (len >= 1) {
                    display = 'block';
                }
                current.css('display', display);
                hideButtonReset();
            }
        }
    }
    /**
     * Fonction d'ajout d'un paginateur en haut de liste des séries
     * @return {void}
     */
    function waitPagination() {
        let loaded = false;
        // On attend la présence du paginateur
        let timerSeries = setInterval(() => {
            if ($('#pagination-shows').length < 1)
                return;
            clearInterval(timerSeries);
            // On copie colle le paginateur en haut de la liste des séries
            $('#results-shows').prepend($('#pagination-shows').clone(true, true));
            // On observe les modifications dans le noeud du paginateur
            $('#results-shows').on('DOMSubtreeModified', '#pagination-shows', function () {
                if (!loaded) {
                    waitPagination();
                    loaded = true;
                }
            });
        }, 500);
    }
    /**
     * Ajoute des améliorations sur la page de la console de l'API
     */
    function updateApiConsole() {
        // Listener sur le btn nouveau paramètre
        $('div.form-group button.btn-btn.btn--blue').prop('onclick', null).off('click').click((e, key) => {
            e.stopPropagation();
            e.preventDefault();
            if (debug)
                console.log('nouveau parametre handler', key);
            // On ajoute une nouvelle ligne de paramètre
            newApiParameter();
            // On insère la clé du paramètre, si elle est présente
            if (key) {
                $('input.name:last').val(key);
                $('input.form-control:last').focus();
            }
            addRemoveParamToConsole();
        });
        // Listener sur la liste des méthodes
        $('#method').on('change', () => {
            // On supprime tous les paramètres existants
            $('#api-params .remove').remove();
            // En attente de la documentation de l'API
            timer = setInterval(() => {
                if ($('#doc code').length <= 0)
                    return;
                clearInterval(timer); // On supprime le timer
                let paramsDoc = $('#doc > ul > li > code');
                if (debug)
                    console.log('paramsDoc', paramsDoc);
                paramsDoc.css('cursor', 'pointer');
                // On ajoute la clé du paramètre dans une nouvelle ligne de paramètre
                paramsDoc.click((e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    $('div.form-group button.btn-btn.btn--blue').trigger('click', [$(e.currentTarget).text().trim()]);
                });
            }, 500);
        });
        // Ajoute un cadenas vérouillé au paramètre 'Version' non-modifiable
        $('.api-params:first').append('<i class="fa fa-lock fa-2x" style="margin-left: 10px;vertical-align:middle;cursor:not-allowed;" aria-hidden="true"></i>');
        addRemoveParamToConsole();
        addToggleShowResult();
        /**
         * On ajoute un bouton pour supprimer la ligne d'un paramètre
         */
        function addRemoveParamToConsole() {
            let elts = $('.api-params:not(.remove):not(.lock):not(:first)');
            elts
                .append('<i class="remove-input fa fa-minus-circle fa-2x" style="margin-left: 10px;vertical-align:middle;cursor:pointer;" aria-hidden="true"></i>')
                .append('<i class="lock-param fa fa-unlock fa-2x" style="margin-left: 10px;vertical-align:middle;cursor:pointer;" aria-hidden="true"></i>')
                .addClass('remove');
            $('.remove-input').click((e) => {
                $(e.currentTarget).parent('.api-params').remove();
            });
            $('.lock-param', elts).click((e) => {
                e.stopPropagation();
                e.preventDefault();
                let self = $(e.currentTarget);
                if (debug)
                    console.log('lock-param', self, self.hasClass('fa-unlock'));
                if (self.hasClass('fa-unlock')) {
                    self.removeClass('fa-unlock').addClass('fa-lock');
                    self.parent('.api-params').removeClass('remove').addClass('lock');
                }
                else {
                    self.removeClass('fa-lock').addClass('fa-unlock');
                    self.parent('.api-params').addClass('remove').removeClass('lock');
                }
            });
        }
        function addToggleShowResult() {
            let $result = $('#result');
            // On ajoute un titre pour la section de résultat de la requête
            $result.before('<h2>Résultat de la requête <span class="toggle" style="margin-left:10px;"><i class="fa fa-chevron-circle-down" aria-hidden="true"></i></span></h2>');
            $('.toggle').click(() => {
                // On réalise un toggle sur la section de résultat et on modifie l'icône du chevron
                $result.toggle(400, () => {
                    if ($result.is(':hidden')) {
                        $('.toggle i').removeClass('fa-chevron-circle-up').addClass('fa-chevron-circle-down');
                    }
                    else {
                        $('.toggle i').removeClass('fa-chevron-circle-down').addClass('fa-chevron-circle-up');
                    }
                });
            });
            // On modifie le sens du chevron lors du lancement d'une requête
            $('button.is-full').click(() => {
                $('.toggle i').removeClass('fa-chevron-circle-down').addClass('fa-chevron-circle-up');
            });
        }
    }
    /*
     * Ajoute un sommaire sur les pages de documentation des méthodes de l'API
     * Le sommaire est constitué des liens vers les fonctions des méthodes.
     */
    function sommaireDevApi() {
        if (debug)
            console.log('build sommaire');
        let titles = $('.maincontent h2'), methods = {};
        // Ajout du style CSS pour les tables
        addScriptAndLink('tablecss');
        /**
         * Construit une cellule de table HTML pour une methode
         *
         * @param  {String} verb Le verbe HTTP utilisé par la fonction
         * @param  {String} key  L'identifiant de la fonction
         * @return {String}
         */
        function buildCell(verb, key) {
            let cell = '<td>';
            if (verb in methods[key]) {
                cell += `<i data-id="${methods[key][verb].id}" 
                            class="linkSommaire fa fa-check fa-2x" 
                            title="${methods[key][verb].title}"></i>`;
            }
            return cell + '</td>';
        }
        /**
         * Construit une ligne de table HTML pour une fonction
         *
         * @param  {String} key L'identifiant de la fonction
         * @return {String}     La ligne HTML
         */
        function buildRow(key) {
            let row = `<tr><th scope="row" class="fonction">${methods[key].title}</th>`;
            row += buildCell('GET', key);
            row += buildCell('POST', key);
            row += buildCell('PUT', key);
            row += buildCell('DELETE', key);
            return row + '</tr>';
        }
        /**
         * Fabrique la table HTML du sommaire
         * @return {Object} L'objet jQuery de la table HTML
         */
        function buildTable() {
            let $table = $(`
                <div id="sommaire" class="table-responsive" style="display:none;">
                    <table class="table table-dark table-striped table-bordered">
                        <thead class="thead-dark">
                            <tr>
                                <th colspan="5" scope="col" class="col-lg-12 liTitle">Sommaire</th>
                            </tr>
                            <tr>
                                <th scope="col" class="col-lg-3">Fonction</th>
                                <th scope="col" class="col-lg-2">GET</th>
                                <th scope="col" class="col-lg-2">POST</th>
                                <th scope="col" class="col-lg-2">PUT</th>
                                <th scope="col" class="col-lg-2">DELETE</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>`), $tbody = $table.find('tbody');
            for (let key in methods) {
                $tbody.append(buildRow(key));
            }
            return $table;
        }
        for (let t = 0; t < titles.length; t++) {
            // ajouter les ID aux titres des methodes, ainsi qu'un chevron pour renvoyer au sommaire
            let $title = $(titles.get(t)), id = $title.text().trim().toLowerCase().replace(/ /, '_').replace(/\//, '-'), txt = $title.text().trim().split(' ')[1], desc = $title.next('p').text(), key = txt.toLowerCase().replace(/\//, ''), verb = $title.text().trim().split(' ')[0].toUpperCase();
            $title.attr('id', id);
            $title.append('<i class="fa fa-chevron-circle-up" aria-hidden="true" title="Retour au sommaire"></i>');
            if (!(key in methods))
                methods[key] = { title: txt };
            methods[key][verb] = { id: id, title: desc };
        }
        // Construire un sommaire des fonctions
        //if (debug) console.log('methods', methods);
        $('.maincontent h1').after(buildTable());
        $('#sommaire').fadeIn();
        $('.linkSommaire').click((e) => {
            e.stopPropagation();
            e.preventDefault();
            $('#' + $(e.currentTarget).data('id')).get(0).scrollIntoView(true);
        });
        $('.fa-chevron-circle-up').click(function (e) {
            e.stopPropagation();
            e.preventDefault();
            document.getElementById('sommaire').scrollIntoView(true);
        });
    }
    /**
     * Ajoute un bouton pour le dev pour afficher les données de la ressource
     * dans une modal
     */
    function addBtnDev() {
        const btnHTML = '<div class="blockInformations__action"><button class="btn-reset btn-transparent" type="button" style="height:44px;width:64px;"><i class="fa fa-wrench" aria-hidden="true" style="font-size:1.5em;"></i></button><div class="label">Dev</div></div>', dialogHTML = `
              <style>
                .dialog-container .close {
                  float: right;
                  font-size: 1.5rem;
                  font-weight: 700;
                  line-height: 1;
                  color: #fff;
                  text-shadow: 0 1px 0 #fff;
                  opacity: .5;
                  margin-right: 20px;
                }
                .dialog-container .close:hover {color: #000;text-decoration: none;}
                .dialog-container .close:not(:disabled):hover, .close:not(:disabled):focus {opacity: .75;}
                .dialog-container button.close {padding: 0;background-color: transparent;border: 0;}
                .dialog-container .counter {font-size:0.8em;}
              </style>
                <div
                  class="dialog dialog-container table-dark"
                  id="dialog-resource"
                  aria-labelledby="dialog-resource-title"
                  style="display:none;"
                >
                  <div class="dialog-overlay"></div>
                  <div class="dialog-content" role="document" style="width: 80%;">
                    <h1 id="dialog-resource-title">Données de la ressource
                        <span class="counter"></span>
                        <button type = "button"
                                class = "close"
                                aria-label = "Close"
                                title = "Fermer la boîte de dialogue">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </h1>
                    <div class="data-resource content"></div>
                  </div>
                </div>`;
        $('.blockInformations__actions').append(btnHTML);
        $('body').append(dialogHTML);
        let $dialog = $('#dialog-resource');
        const html = document.documentElement;
        const onShow = function () {
            html.style.overflowY = 'hidden';
            $('#dialog-resource')
                .css('z-index', '1005')
                .css('overflow', 'scroll');
        };
        const onHide = function () {
            html.style.overflowY = '';
            $('#dialog-resource')
                .css('z-index', '0')
                .css('overflow', 'none');
        };
        $('.blockInformations__actions .fa-wrench').parent().click((e) => {
            e.stopPropagation();
            e.preventDefault();
            let type = getApiResource(location.pathname.split('/')[1]), // Indique de quel type de ressource il s'agit
            $dataRes = $('#dialog-resource .data-resource'); // DOMElement contenant le rendu JSON de la ressource
            getResourceData().then(function (data) {
                // if (debug) console.log('addBtnDev promise return', data);
                $dataRes.empty().append(renderjson.set_show_to_level(2)(data[type.singular]));
                $('#dialog-resource-title span.counter').empty().text('(' + Media_1.Media.counter + ' appels API)');
                $dialog.show(400, onShow);
            }, (err) => {
                notification('Erreur de récupération de la ressource', 'addBtnDev: ' + err);
            });
        });
        $('.dialog button.close').click(function (e) {
            e.stopPropagation();
            e.preventDefault();
            $dialog.hide(400, onHide);
        });
    }
    /**
     * Cette fonction permet de retourner la ressource principale sous forme d'objet
     * @param  {boolean} [nocache=false] Flag indiquant si il faut utiliser les données en cache
     * @param  {number}  [id=null]       Identifiant de la ressource
     * @return {Promise<Base>}
     */
    function getResource(nocache = false, id = null) {
        const type = getApiResource(location.pathname.split('/')[1]), // Indique de quel type de ressource il s'agit
        fonction = type.singular === 'show' || type.singular === 'episode' ? 'display' : 'movie'; // Indique la fonction à appeler en fonction de la ressource
        id = (id === null) ? getResourceId() : id;
        if (debug)
            console.log('getResource{id: %d, nocache: %s, type: %s}', id, ((nocache) ? 'true' : 'false'), type.singular);
        return new Promise((resolve, reject) => {
            Base_1.Base.callApi('GET', type.plural, fonction, { 'id': id }, nocache)
                .then(data => {
                resolve(new type.class(data[type.singular]));
            }, err => {
                reject(err);
            });
        });
    }
    /**
     * Cette fonction permet de récupérer les données API de la ressource principale
     * @param  {boolean} [nocache=true]  Flag indiquant si il faut utiliser les données en cache
     * @param  {number}  [id=null]       Identifiant de la ressource
     * @return {Promise<Object>}
     */
    function getResourceData(nocache = true, id = null) {
        const type = getApiResource(location.pathname.split('/')[1]), // Indique de quel type de ressource il s'agit
        fonction = type.singular == 'show' || type.singular == 'episode' ? 'display' : 'movie'; // Indique la fonction à appeler en fonction de la ressource
        id = (id === null) ? getResourceId() : id;
        if (debug)
            console.log('getResourceData{id: %d, nocache: %s, type: %s}', id, ((nocache) ? 'true' : 'false'), type.singular);
        return Base_1.Base.callApi('GET', type.plural, fonction, { 'id': id }, nocache);
    }
    /**
     * Retourne la ressource associée au type de page
     *
     * @param  {String} pageType    Le type de page consultée
     * @return {Object} Retourne le nom de la ressource API au singulier et au pluriel
     */
    function getApiResource(pageType) {
        let methods = {
            'serie': { singular: 'show', plural: 'shows', "class": Show_1.Show },
            'film': { singular: 'movie', plural: 'movies', "class": Movie_1.Movie },
            'episode': { singular: 'episode', plural: 'episodes', "class": Episode_1.Episode }
        };
        if (pageType in methods) {
            return methods[pageType];
        }
        return null;
    }
    /**
     * Retourne l'identifiant de la ressource de la page
     * @return {number} L'identifiant de la ressource
     */
    function getResourceId() {
        const type = getApiResource(url.split('/')[1]), // Le type de ressource
        eltActions = $(`#reactjs-${type.singular}-actions`); // Le noeud contenant l'ID
        return (eltActions.length === 1) ? parseInt(eltActions.data(`${type.singular}-id`), 10) : 0;
    }
    /**
     * Retourne les infos d'un membre
     *
     * @param {Number}   id    Identifiant du membre (par défaut: le membre connecté)
     * @return {Promise} Le membre
     */
    function getMember(id = null) {
        // On vérifie que l'utilisateur est connecté et que la clé d'API est renseignée
        if (!userIdentified() || betaseries_api_user_key === '')
            return;
        let args = {};
        if (id)
            args.id = id;
        return new Promise((resolve) => {
            Base_1.Base.callApi('GET', 'members', 'infos', args)
                .then(data => {
                // On retourne les infos du membre
                resolve(data.member);
            }, (err) => {
                notification('Erreur de récupération d\'un membre', 'getMember: ' + err);
            });
        });
    }
    /**
     * Compare le membre courant avec un autre membre
     */
    function compareMembers() {
        let id = parseInt($('#temps').data('loginid'), 10);
        getMember(id).
            then(function (member) {
            let otherMember = member;
            const dialogHTML = `
                <div
                  class="dialog dialog-container table-dark"
                  id="dialog-compare"
                  aria-hidden="true"
                  aria-labelledby="dialog-compare-title"
                >
                  <div class="dialog-overlay" data-a11y-dialog-hide></div>
                  <div class="dialog-content" role="document">
                    <button
                      data-a11y-dialog-hide
                      class="dialog-close"
                      aria-label="Fermer cette boîte de dialogue"
                    >
                      <i class="fa fa-times" aria-hidden="true"></i>
                    </button>

                    <h1 id="dialog-compare-title">Comparaison des membres</h1>

                    <div id="compare" class="table-responsive-lg">
                      <table class="table table-dark table-striped">
                        <thead>
                          <tr>
                            <th scope="col" class="col-lg-5">Infos</th>
                            <th scope="col" class="col-lg-3">Vous</th>
                            <th scope="col" class="other-user col-lg-3"></th>
                          </tr>
                        </thead>
                        <tbody>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>`, trads = {
                "id": 'ID',
                "login": "Login",
                "xp": 'Pts d\'expérience',
                "subscription": 'Année d\'inscription',
                stats: {
                    "friends": 'Amis',
                    "shows": 'Séries',
                    "seasons": 'Saisons',
                    "episodes": 'Episodes',
                    "comments": 'Commentaires',
                    "progress": 'Progression de visionnage',
                    "episodes_to_watch": 'Nb d\'épisodes à regarder',
                    "time_on_tv": 'Temps devant la TV',
                    "time_to_spend": 'Temps restant devant des séries à regarder',
                    "movies": 'Nb de films',
                    "badges": 'Nb de badges',
                    "member_since_days": 'Membre depuis (jours)',
                    "friends_of_friends": 'Les amis du réseau étendu',
                    "episodes_per_month": 'Nb d\'épisodes par mois',
                    "favorite_day": 'Jour favori',
                    "five_stars_percent": '% de votes 5 étoiles',
                    "four-five_stars_total": 'Nb de votes 4 ou 5 étoiles',
                    "streak_days": 'Nb de jours consécutifs à regarder des épisodes',
                    "favorite_genre": 'Genre favori',
                    "written_words": 'Nb de mots écrits sur BetaSeries',
                    "without_days": 'Nb jours d\'abstinence',
                    "shows_finished": 'Nb de séries terminées',
                    "shows_current": 'Nb de séries en cours',
                    "shows_to_watch": 'Nb de séries à voir',
                    "shows_abandoned": 'Nb de séries abandonnées',
                    "movies_to_watch": 'Nb de films à voir',
                    "time_on_movies": 'Temps devant les films',
                    "time_to_spend_movies": 'Temps restant devant les films à regarder'
                }
            };
            addScriptAndLink('tablecss');
            $('body').append(dialogHTML);
            //if (debug) console.log(currentUser, otherMember, trads);
            for (const [key, value] of Object.entries(trads)) {
                if (typeof value == 'object') {
                    for (const [subkey, subvalue] of Object.entries(trads[key])) {
                        if (/time/.test(subkey)) {
                            currentUser[key][subkey] = humanizeDuration((currentUser[key][subkey] * 60 * 1000), { language: currentUser.locale });
                            otherMember[key][subkey] = humanizeDuration((otherMember[key][subkey] * 60 * 1000), { language: currentUser.locale });
                        }
                        $('#dialog-compare table tbody').append('<tr><td>' + subvalue + '</td><td>' + currentUser[key][subkey] + '</td><td>' + otherMember[key][subkey] + '</td></tr>');
                    }
                }
                else {
                    $('#dialog-compare table tbody').append('<tr><td>' + value + '</td><td>' + currentUser[key] + '</td><td>' + otherMember[key] + '</td></tr>');
                }
            }
            $('.other-user').append(otherMember.login);
            const dialog = new A11yDialog(document.querySelector('#dialog-compare')), html = document.documentElement;
            $('#stats_container h1')
                .css('display', 'inline-block')
                .after('<button type="button" class="button blue" data-a11y-dialog-show="dialog-compare">Se comparer à ce membre</button>');
            $('button.button.blue').click(function (e) {
                e.stopPropagation();
                e.preventDefault();
                dialog.show();
            });
            dialog
                .on('show', function () {
                html.style.overflowY = 'hidden';
                $('#dialog-compare').css('z-index', '1005').css('overflow', 'scroll');
                $('.dialog-close').click(function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    dialog.hide();
                });
            })
                .on('hide', function () {
                html.style.overflowY = '';
                $('#dialog-compare').css('z-index', '0').css('overflow', 'none');
                $('.dialog-close').off('click');
            });
        });
    }
    /**
     * Ajoute un champ de recherche sur la page des amis d'un membre
     * @return {void}
     */
    function searchFriends() {
        // Ajouter un champ de recherche
        $('.maincontent h1').append('<input id="searchFriends" placeholder="Recherche d\'amis" list="friendsdata" autocomplete="off"/>' +
            '<i class="fa fa-times clearSearch" aria-hidden="true" style="display:none;" title="Effacer la recherche"></i>');
        // Recuperer les identifiants et liens des membres
        let $links = $('.timeline-item .infos a'), objFriends = {}, idFriends = [], datalist = '<datalist id="friendsdata">';
        // On recupere les infos des amis
        for (let i = 0; i < $links.length; i++) {
            let elt = $($links.get(i)), text = elt.text().trim();
            objFriends[text.toLowerCase()] = { link: elt.attr('href'), name: text };
        }
        // On stocke les identifiants dans un tableau que l'on tri
        idFriends = Object.keys(objFriends);
        idFriends.sort();
        // On build la liste des amis pour alimenter le champ de recherche
        for (let i = 0; i < idFriends.length; i++) {
            datalist += '<option value="' + objFriends[idFriends[i]].name + '"/>';
        }
        $('.maincontent').append(datalist + '</datalist>');
        // On affiche toute la liste des amis
        viewMoreFriends();
        const $inpSearchFriends = $('#searchFriends');
        $inpSearchFriends.on('keypress', () => {
            if ($inpSearchFriends.val().toString().trim().length > 0) {
                $('.clearSearch').show();
            }
        });
        $inpSearchFriends.on('input', () => {
            let val = $inpSearchFriends.val().toString().trim().toLowerCase();
            if (debug)
                console.log('Search Friends: ' + val, idFriends.indexOf(val), objFriends[val]);
            if (val === '' || idFriends.indexOf(val) === -1) {
                $('.timeline-item').show();
                if (val === '') {
                    $('.clearSearch').hide();
                }
                return;
            }
            $('.clearSearch').show();
            $('.timeline-item').hide();
            if (debug)
                console.log('Item: ', $('.timeline-item .infos a[href="' + objFriends[val].link + '"]'));
            $('.timeline-item .infos a[href="' + objFriends[val].link + '"]').parents('.timeline-item').show();
        });
        $('.clearSearch').click(() => {
            $('#searchFriends').val('');
            $('.timeline-item').show();
            $('.clearSearch').hide();
        });
    }
    /**
     * Masque les pubs
     */
    function removeAds() {
        setTimeout(function () {
            $('script[src*="securepubads"]').remove();
            $('script[src*="static-od.com"]').remove();
            $('script[src*="ad.doubleclick.net"]').remove();
            $('script[src*="sddan.com"]').remove();
        }, 500);
        $('.parent-ad-desktop').attr('style', 'display: none !important');
        setInterval(function () {
            let $frame;
            $('iframe[name!="userscript"]').each((i, elt) => {
                $frame = $(elt);
                if (!$frame.hasClass('embed-responsive-item')) {
                    $frame.remove();
                }
            });
        }, 1000);
        $('.blockPartner').attr('style', 'display: none !important');
        //$('.breadcrumb').hide();
    }
    /**
     * Améliore l'affichage de la description de la ressource
     *
     * @return {void}
     */
    function upgradeSynopsis() {
        let $span = $('.blockInformations__synopsis span'), $btnMore = $('a.js-show-fulltext');
        if ($btnMore.length <= 0) {
            return;
        }
        // On ajoute le bouton Moins et son event click
        $span.append('<button role="button" class="u-colorWhiteOpacity05 js-show-truncatetext textTransformUpperCase cursorPointer"></button>');
        const $btnLess = $('button.js-show-truncatetext');
        $btnLess.click((e) => {
            e.stopPropagation();
            e.preventDefault();
            if ($span.hasClass('sr-only'))
                return;
            // Toggle display synopsis
            $btnMore.show();
            $span.addClass('sr-only');
        });
        // On remplace le lien Plus par un bouton
        $btnMore.replaceWith('<button role="button" class="u-colorWhiteOpacity05 js-show-fulltext textTransformUpperCase cursorPointer"></button>');
        $btnMore = $('button.js-show-fulltext');
        $btnMore.on('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            if (!$span.hasClass('sr-only'))
                return;
            $btnMore.hide();
            $span.removeClass('sr-only');
        });
    }
    /**
     * Patiente le temps du chargment des saisons et des épisodes
     * @param  {Function} cb Fonction de callback en cas de success
     * @param  {Function} cb Fonction de callback en cas d'error
     * @return {void}
     */
    function waitSeasonsAndEpisodesLoaded(successCb, errorCb = Base_1.Base.noop) {
        let waitEpisodes = 0;
        // On ajoute un timer interval en attendant que les saisons et les épisodes soient chargés
        timer = setInterval(function () {
            // On évite une boucle infinie
            if (++waitEpisodes >= 100) {
                clearInterval(timer);
                notification('Wait Episodes List', 'Les vignettes des saisons et des épisodes n\'ont pas été trouvées.');
                errorCb('timeout');
                return;
            }
            let len = parseInt($('#seasons .slide--current .slide__infos').text(), 10), $episodes = $('#episodes .slide_flex');
            // On vérifie que les saisons et les episodes soient chargés sur la page
            if ($episodes.length <= 0 || $episodes.length < len) {
                if (debug)
                    console.log('waitSeasonsAndEpisodesLoaded: En attente du chargement des vignettes');
                return;
            }
            if (debug)
                console.log('waitSeasonsAndEpisodesLoaded, nbVignettes (%d, %d)', $episodes.length, len);
            clearInterval(timer);
            successCb();
        }, 500);
    }
    /**
     * Gère la mise à jour auto des épisodes de la saison courante
     * @param  {Show} show L'objet de type Show
     * @return {void}
     */
    function updateAutoEpisodeList(show) {
        let objUpAuto = UpdateAuto_1.UpdateAuto.getInstance(show);
        /**
         * Fonction retournant le contenu de la Popup des options update
         * de la liste des épisodes
         * @return {String} Contenu HTML de la PopUp des options update
         */
        const contentUp = function () {
            const intervals = UpdateAuto_1.UpdateAuto.intervals;
            let contentUpdate = `
                    <style>
                        .alert {
                          position: relative;
                          padding: 0.75rem 1.25rem;
                          margin-bottom: 1rem;
                          border: 1px solid transparent;
                          border-radius: 0.25rem;
                        }
                        .alert-info {
                          color: #0c5460;
                          background-color: #d1ecf1;
                          border-color: #bee5eb;
                        }
                        .alert-warning {
                          color: #856404;
                          background-color: #fff3cd;
                          border-color: #ffeeba;
                        }
                    </style>
                    <form id="optionsUpdateEpisodeList">
                      <div class="form-group form-check">
                        <input type="checkbox"
                               class="form-check-input"
                               id="updateEpisodeListAuto"
                               ${objUpAuto.auto ? ' checked="true"' : ''}
                               ${!show.in_account ? ' disabled="true"' : ''}>
                        <label class="form-check-label"
                               for="updateEpisodeListAuto">Activer la mise à jour auto des épisodes</label>
                      </div>
                      <div class="form-group">
                        <label for="updateEpisodeListTime">Fréquence de mise à jour</label>
                        <select class="form-control"
                                id="updateEpisodeListTime"
                                ${!show.in_account ? ' disabled="true"' : ''}>`;
            for (let i = 0; i < intervals.length; i++) {
                contentUpdate += `<option value="${intervals[i].val}"
                    ${objUpAuto.interval === intervals[i].val ? 'selected="true"' : ''}>
                    ${intervals[i].label}</option>`;
            }
            contentUpdate += `</select></div>
                    ${!show.in_account ? '<div class="form-group"><p class="alert alert-warning">Veuillez ajouter la série avant de pouvoir activer cette fonctionnalité.</p></div>' : ''}
                    <button type="submit" class="btn btn-primary"${!show.in_account ? ' disabled="true"' : ''}>Sauver</button>
                    <button type="button" class="close btn btn-danger">Annuler</button>
                </form>`;
            return contentUpdate;
        };
        /**
         * Fonction retournant le titre de la Popup des options pour l'update
         * de la liste des épisodes de la saison courante
         * @param  {UpdateAuto} objUpAuto
         * @return {String} Contenu HTML du titre de la PopUp des options update
         */
        const titlePopup = function (objUpAuto) {
            const className = (objUpAuto && objUpAuto.status) ? 'success' : 'secondary', label = (objUpAuto && objUpAuto.status) ? 'running' : 'not running', help = "Cette fonctionnalité permet de mettre à jour les épisodes de la saison courante, à une fréquence choisie.";
            return `<style>
                        .optionsUpAuto .close {
                            position: absolute;
                            right: 5px;
                            border: none;
                            background: transparent;
                            font-size: 1.5em;
                            top: 0;
                        }
                        .optionsUpAuto .close:hover {border: none;outline: none;}
                        .optionsUpAuto .close:focus {border: none;outline: none;}
                    </style>
                    <div class="optionsUpAuto" style="color:#000;">Options de mise à jour
                      <span class="badge badge-pill badge-${className}"${objUpAuto.status ? 'title="Arrêter la tâche en cours"' : ''}>${label}</span>
                      <button type="button" class="close" aria-label="Close" title="Fermer">
                        <span aria-hidden="true">&times;</span>
                      </button>
                      <i class="fa fa-question-circle" style="color:blue;margin-left:5px;" aria-hidden="true" title="${help}"></i>
                    </div>`;
        };
        // On relance l'update auto des épisodes au chargement de la page
        if (show.in_account && show.user.remaining > 0 && objUpAuto.status) {
            objUpAuto.launch();
        }
        else if (objUpAuto.status) {
            objUpAuto.stop();
        }
        let notLoop = 0;
        let intTime = setInterval(function () {
            if (++notLoop >= 20) {
                clearInterval(intTime);
                return;
            }
            if (typeof bootstrap === 'undefined' || typeof bootstrap.Popover !== 'function') {
                return;
            }
            else
                clearInterval(intTime);
            if (debug)
                console.log('Loading popover updateEpisodes');
            $('#updateEpisodeList .updateElement').popover({
                container: $('#updateEpisodeList'),
                // delay: { "show": 500, "hide": 100 },
                html: true,
                content: contentUp,
                placement: 'right',
                title: ' ',
                trigger: 'manual',
                boundary: 'window'
            });
            let timeoutHover = null;
            $('#updateEpisodeList .updateElement').hover(
            // In
            function (e) {
                e.stopPropagation();
                timeoutHover = setTimeout(function () {
                    $('#updateEpisodeList .updateElement').popover('show');
                }, 500);
            }, 
            // Out
            function (e) {
                e.stopPropagation();
                clearTimeout(timeoutHover);
            });
            // On ferme et désactive les autres popups lorsque celle des options est ouverte
            $('#updateEpisodeList .updateElement').on('show.bs.popover', function () {
                const $updateElement = $('#episodes .slide__image');
                $updateElement.popover('hide');
                $updateElement.popover('disable');
            });
            // On réactive les autres popus lorsque celle des options se ferme
            // Et on supprime les listeners de la popup
            $('#updateEpisodeList .updateElement').on('hide.bs.popover', function () {
                $('#episodes .slide__image').popover('enable');
                $('.optionsUpAuto .badge').css('cursor', 'initial').off('click');
                $('#updateEpisodeList button.close').off('click');
                $('#optionsUpdateEpisodeList button.btn-primary').off('click');
            });
            $('#updateEpisodeList .updateElement').on('shown.bs.popover', function () {
                $('#updateEpisodeList .popover-header').html(titlePopup(objUpAuto));
                if (objUpAuto.status) {
                    $('.optionsUpAuto .badge').css('cursor', 'pointer').click(e => {
                        e.stopPropagation();
                        e.preventDefault();
                        const $badge = $(e.currentTarget);
                        if ($badge.hasClass('badge-success')) {
                            // On arrête la tâche d'update auto
                            objUpAuto.stop();
                        }
                    });
                }
                $('#updateEpisodeList button.close').click((e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    $('#updateEpisodeList .updateElement').popover('hide');
                });
                $('#optionsUpdateEpisodeList button.btn-primary').click((e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    let checkAuto = $('#updateEpisodeListAuto').is(':checked'), intervalAuto = parseInt($('#updateEpisodeListTime').val().toString(), 10);
                    if (objUpAuto.auto !== checkAuto)
                        objUpAuto.auto = checkAuto;
                    if (objUpAuto.interval != intervalAuto)
                        objUpAuto.interval = intervalAuto;
                    if (debug)
                        console.log('updateEpisodeList submit', objUpAuto);
                    objUpAuto.launch();
                    $('#updateEpisodeList .updateElement').popover('hide');
                });
            });
        }, 500);
    }
    /**
     * Ajoute un bouton Vu sur la vignette d'un épisode
     * @param {Show} res L'objet Show de l'API
     */
    function upgradeEpisodes(res) {
        // On vérifie que l'utilisateur est connecté et que la clé d'API est renseignée
        if (!userIdentified() || betaseries_api_user_key === '')
            return;
        const seasons = $('#seasons .slide_flex');
        let vignettes = getVignettes();
        if (debug)
            console.log('Nb seasons: %d, nb vignettes: %d', seasons.length, vignettes.length);
        /*
         * Ajoute une écoute sur l'objet Show, sur l'évenement UPDATE,
         * pour mettre à jour l'update auto des épisodes
         */
        res.addListener(Base_1.EventTypes.UPDATE, function (show) {
            if (debug)
                console.log('Listener called');
            // Si il n'y a plus d'épisodes à regarder sur la série
            if (show.user.remaining <= 0) {
                let objUpAuto = UpdateAuto_1.UpdateAuto.getInstance(show);
                // Si la série est terminée
                if (show.isEnded()) {
                    // On supprime la série des options d'update
                    objUpAuto.delete();
                }
                else {
                    // On désactive la mise à jour auto
                    objUpAuto.stop();
                }
            }
        });
        // On ajoute les cases à cocher sur les vignettes courantes
        addCheckSeen();
        // Ajoute les cases à cocher sur les vignettes des épisodes
        function addCheckSeen() {
            vignettes = getVignettes();
            const seasonNum = parseInt($('#seasons div[role="button"].slide--current .slide__title').text().match(/\d+/).shift(), 10);
            res.setCurrentSeason(seasonNum);
            let promise = res.currentSeason.fetchEpisodes(); // Contient la promesse de récupérer les épisodes de la saison courante
            // On ajoute le CSS et le Javascript pour les popup
            if ($('#csspopover').length === 0 && $('#jsbootstrap').length === 0) {
                addScriptAndLink(['popover', 'bootstrap']);
            }
            /**
             * Retourne la position de la popup par rapport à l'image du similar
             * @param  {Object} _tip Unknown
             * @param  {Object} elt Le DOM Element du lien du similar
             * @return {String}     La position de la popup
             */
            let funcPlacement = (_tip, elt) => {
                //if (debug) console.log('funcPlacement', tip, $(tip).width());
                let rect = elt.getBoundingClientRect(), width = $(window).width(), sizePopover = 320;
                return ((rect.left + rect.width + sizePopover) > width) ? 'left' : 'right';
            };
            // On ajoute la description des épisodes dans des Popup
            promise.then(() => {
                let intTime = setInterval(function () {
                    if (typeof bootstrap === 'undefined' || typeof bootstrap.Popover !== 'function') {
                        return;
                    }
                    else
                        clearInterval(intTime);
                    if (debug)
                        console.log('Add synopsis episode');
                    let $vignette, objEpisode, description;
                    for (let v = 0; v < vignettes.length; v++) {
                        $vignette = $(vignettes.get(v));
                        objEpisode = res.currentSeason.episodes[v];
                        objEpisode.elt = $vignette.parents('.slide_flex');
                        objEpisode.save();
                        description = objEpisode.description;
                        if (description.length > 350) {
                            description = description.substring(0, 350) + '…';
                        }
                        else if (description.length <= 0) {
                            description = 'Aucune description';
                        }
                        // Ajout de l'attribut title pour obtenir le nom complet de l'épisode, lorsqu'il est tronqué
                        objEpisode.addAttrTitle();
                        objEpisode.initCheckSeen(v);
                        // Ajoute la synopsis de l'épisode au survol de la vignette
                        $vignette.popover({
                            container: $vignette,
                            delay: { "show": 500, "hide": 100 },
                            html: true,
                            content: `<p>${description}</p>`,
                            placement: funcPlacement,
                            title: ' ',
                            trigger: 'hover',
                            boundary: 'window'
                        });
                    }
                    $('#episodes .slide__image').on('shown.bs.popover', function () {
                        const $checkSeen = $(this).find('.checkSeen'), episodeId = parseInt($checkSeen.data('id'), 10), episode = res.currentSeason.getEpisode(episodeId);
                        if (!episode) {
                            console.warn('episode title popup', episodeId, res);
                        }
                        $('#episodes .slide__image .popover-header').html(episode.getTitlePopup());
                    });
                    // On ajoute un event click sur la case 'checkSeen'
                    $('#episodes .checkSeen').click(function (e) {
                        e.stopPropagation();
                        e.preventDefault();
                        const $elt = $(e.currentTarget), episodeId = parseInt($elt.data('id'), 10), episode = res.currentSeason.getEpisode(episodeId);
                        if (debug)
                            console.log('click checkSeen', episode, res);
                        episode.toggleSpinner(true);
                        // On vérifie si l'épisode a déjà été vu
                        if ($elt.hasClass('seen')) {
                            // On demande à l'enlever des épisodes vus
                            episode.updateStatus('notSeen', Base_1.HTTP_VERBS.DELETE);
                        }
                        // Sinon, on l'ajoute aux épisodes vus
                        else {
                            episode.updateStatus('seen', Base_1.HTTP_VERBS.POST);
                        }
                    });
                    // On ajoute un effet au survol de la case 'checkSeen'
                    $('#episodes .checkSeen').hover(
                    // IN
                    (e) => {
                        $(e.currentTarget)
                            .siblings('.overflowHidden')
                            .find('img.js-lazy-image')
                            .css('transform', 'scale(1.2)');
                        $(e.currentTarget)
                            .parent('.slide__image')
                            .popover('hide');
                    }, 
                    // OUT
                    (e) => {
                        $(e.currentTarget)
                            .siblings('.overflowHidden')
                            .find('img.js-lazy-image')
                            .css('transform', 'scale(1.0)');
                        $(e.currentTarget)
                            .parent('.slide__image')
                            .popover('show');
                    });
                }, 500);
            });
            // Ajouter un bouton de mise à jour des épisodes de la saison courante
            if ($('#updateEpisodeList').length < 1) {
                $('#episodes .blockTitles').prepend(`
                    <style>#updateEpisodeList .popover {left: 65px; top: 40px;}</style>
                    <div id="updateEpisodeList" class="updateElements">
                      <i class="fa fa-refresh fa-2x updateEpisodes updateElement finish"
                         title="Mise à jour des épisodes de la saison"
                         style="margin-right:10px;"
                         aria-hidden="true"></i>
                    </div>`);
                // On ajoute l'update auto des épisodes de la saison courante
                updateAutoEpisodeList(res);
                // On ajoute la gestion de l'event click sur le bouton
                $('.updateEpisodes').click((e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (debug)
                        console.groupCollapsed('updateEpisodes');
                    // On ferme la popup des options d'update auto
                    $('#updateEpisodeList .updateElement').popover('hide');
                    const self = $(e.currentTarget);
                    self.removeClass('finish');
                    // Le numéro de la saison courante
                    const seasonNum = $('#seasons .slide_flex.slide--current .slide__title').text().match(/\d+/).shift();
                    res.currentSeason.fetchEpisodes().then(() => {
                        // if (debug) console.log('after fetchEpisodes', Object.assign({}, objShow));
                        vignettes = getVignettes();
                        // len = getNbVignettes();
                        let $vignette, objEpisode, changed = false, retour;
                        for (let v = 0; v < vignettes.length; v++) {
                            $vignette = $(vignettes.get(v)); // DOMElement jQuery de l'image de l'épisode
                            objEpisode = res.currentSeason.episodes[v];
                            objEpisode.elt = $vignette.parents('.slide_flex'); // Données de l'épisode
                            //if (debug) console.log('Episode ID', getEpisodeId($vignette), episode.id);
                            retour = objEpisode.updateCheckSeen(v);
                            if (!changed) {
                                changed = retour;
                            }
                        }
                        // On met à jour les éléments, seulement si il y a eu des modifications
                        if (changed) {
                            if (debug)
                                console.log('updateEpisodes changed true', res);
                            // Si il reste des épisodes à voir, on scroll
                            if ($('#episodes .slide_flex.slide--notSeen').length > 0) {
                                $('#episodes .slides_flex').get(0).scrollLeft =
                                    $('#episodes .slide_flex.slide--notSeen').get(0).offsetLeft - 69;
                            }
                            res.update(true).then(() => {
                                self.addClass('finish');
                                fnLazy.init(); // On affiche les images lazyload
                                if (debug)
                                    console.groupEnd(); // On clos le groupe de console
                            }, err => {
                                notification('Erreur de récupération de la ressource Show', 'Show update: ' + err);
                                self.addClass('finish');
                                console.warn('Show update error', err);
                                if (debug)
                                    console.groupEnd(); // On clos le groupe de console
                            });
                        }
                        else {
                            if (debug)
                                console.log('updateEpisodes no changes');
                            self.addClass('finish'); // On arrete l'animation de mise à jour
                            if (debug)
                                console.groupEnd(); // On clos le groupe de console
                        }
                    }, (err) => {
                        self.addClass('finish');
                        if (debug)
                            console.groupEnd();
                        notification('Erreur de mise à jour des épisodes', 'updateEpisodeList: ' + err);
                    });
                });
            }
        }
        // On ajoute un event sur le changement de saison
        seasons.click(() => {
            if (debug)
                console.groupCollapsed('season click');
            $('#episodes .checkSeen').off('click');
            // On attend que les vignettes de la saison choisie soient chargées
            waitSeasonsAndEpisodesLoaded(() => {
                addCheckSeen();
                if (debug)
                    console.groupEnd();
            }, () => {
                console.error('Season click Timeout');
                if (debug)
                    console.groupEnd();
            });
        });
        // On active les menus dropdown
        $('.dropdown-toggle').dropdown();
        // On gère l'ajout et la suppression de la série dans le compte utilisateur
        if (res.in_account) {
            res.deleteShowClick();
        }
        else {
            res.addShowClick();
        }
        // On récupère les vignettes des épisodes
        function getVignettes() {
            return $('#episodes .slide__image');
        }
    }
    /**
     * Modifie le fonctionnement d'ajout d'un similar
     *
     * @param  {Object}   $elt          L'élément DOMElement jQuery
     * @param  {Number[]} [objSimilars] Un tableau des identifiants des similars actuels
     * @return {void}
     */
    function replaceSuggestSimilarHandler($elt, objSimilars = []) {
        // On vérifie que l'utilisateur est connecté et que la clé d'API est renseignée
        if (!userIdentified() || betaseries_api_user_key === '' || !/(serie|film)/.test(url))
            return;
        if (debug)
            console.log('replaceSuggestSimilarHandler');
        const type = getApiResource(url.split('/')[1]), // Le type de ressource
        resId = getResourceId(); // Identifiant de la ressource
        // Gestion d'ajout d'un similar
        $elt.removeAttr('onclick').click(() => {
            new PopupAlert({
                showClose: true,
                type: 'popin-suggestshow',
                params: {
                    id: resId
                },
                callback: function () {
                    $("#similaire_id_search").focus().on("keyup", (e) => {
                        let search = $(e.currentTarget).val().toString();
                        if (search.length > 0 && e.which != 40 && e.which != 38) {
                            Base_1.Base.callApi('GET', 'search', type.plural, { autres: 'mine', text: search })
                                .then((data) => {
                                const medias = data[type.plural];
                                $("#search_results .title").remove();
                                $("#search_results .item").remove();
                                let media;
                                for (let s = 0; s < medias.length; s++) {
                                    media = medias[s];
                                    if (objSimilars.indexOf(media.id) !== -1) {
                                        continue;
                                    } // Similar déjà proposé
                                    $('#search_results').append(`
                                        <div class="item">
                                          <p><span data-id="${media.id}" style="cursor:pointer;">${media.title}</span></p>
                                        </div>`);
                                }
                                $('#search_results .item span').click((e) => {
                                    autocompleteSimilar(e.currentTarget);
                                });
                            }, (err) => {
                                notification('Ajout d\'un similar', 'Erreur requête Search: ' + err);
                            });
                        }
                        else if (e.which != 40 && e.which != 38) {
                            $("#search_results").empty();
                            $("#similaire_id_search").off("keydown");
                        }
                    });
                    $("#similaire_id_search").off('keydown').on('keydown', (e) => {
                        const current_item = $("#search_results .item.hl");
                        switch (e.which) {
                            /* Flèche du bas */
                            case 40:
                                if (current_item.length === 0) {
                                    $("#search_results .item:first").addClass("hl");
                                }
                                else {
                                    let next_item = $("#search_results .item.hl").next("div");
                                    if (next_item.attr("class") === "title") {
                                        next_item = next_item.next("div");
                                    }
                                    current_item.removeClass("hl");
                                    next_item.addClass("hl");
                                }
                                break;
                            /* Flèche du haut */
                            case 38:
                                if (current_item.length !== 0) {
                                    let prev_item = $("#search_results .item.hl").prev("div");
                                    if (prev_item.attr("class") == "title") {
                                        prev_item = prev_item.prev("div");
                                    }
                                    current_item.removeClass("hl");
                                    prev_item.addClass("hl");
                                }
                                break;
                            /* Touche Entrée */
                            case 13:
                                if (debug)
                                    console.log('current_item', current_item);
                                if (current_item.length !== 0) {
                                    autocompleteSimilar(current_item.find("span"));
                                }
                                break;
                            /* Touche Echap */
                            case 27:
                                $("#search_results").empty();
                                $("input[name=similaire_id_search]").val("").trigger("blur");
                                break;
                        }
                    });
                }
            });
            function autocompleteSimilar(el) {
                let titre = $(el).html(), id = $(el).data("id");
                titre = titre.replace(/&amp;/g, "&");
                $("#search_results .item").remove();
                $("#search_results .title").remove();
                $("#similaire_id_search").val(titre).trigger("blur");
                $("input[name=similaire_id]").val(id);
                $('#popin-dialog .popin-content-html > form > div.button-set > button').focus();
                //$("input[name=notes_url]").trigger("focus");
            }
        });
    }
    /**
     * Vérifie si les séries/films similaires ont été vues
     * Nécessite que l'utilisateur soit connecté et que la clé d'API soit renseignée
     * @param {Media} res La ressource de l'API
     */
    function similarsViewed(res) {
        // On vérifie que l'utilisateur est connecté et que la clé d'API est renseignée
        if (!userIdentified() || betaseries_api_user_key === '' || !/(serie|film)/.test(url))
            return;
        console.groupCollapsed('similarsViewed');
        let $similars = $('#similars .slide__title'), // Les titres des ressources similaires
        len = $similars.length; // Le nombre de similaires
        if (debug)
            console.log('nb similars: %d', len, res.nbSimilars);
        // On sort si il n'y a aucun similars ou si il s'agit de la vignette d'ajout
        if (len <= 0 || (len === 1 && $($similars.parent().get(0)).find('button').length === 1)) {
            $('.updateSimilars').addClass('finish');
            replaceSuggestSimilarHandler($('#similars div.slides_flex div.slide_flex div.slide__image > button'));
            console.groupEnd();
            return;
        }
        /*
         * On ajoute un bouton de mise à jour des similars
         * et on vérifie qu'il n'existe pas déjà
         */
        if ($('#updateSimilarsBlock').length < 1) {
            // On ajoute les ressources CSS et JS nécessaires
            if ($('#csspopover').length <= 0 && $('#jsbootstrap').length <= 0) {
                addScriptAndLink(['popover', 'bootstrap']);
            }
            // On ajoute le bouton de mise à jour des similaires
            $('#similars .blockTitles').append(`
                <div id="updateSimilarsBlock" class="updateElements" style="margin-left:10px;">
                  <img src="${serverBaseUrl}/img/update.png"
                       class="updateSimilars updateElement"
                       title="Mise à jour des similaires vus"/>
                </div>`);
            // Si le bouton d'ajout de similaire n'est pas présent
            // et que la ressource est dans le compte de l'utilisateur, on ajoute le bouton
            if ($('#similars button.blockTitle-subtitle').length === 0 && res.in_account === true) {
                $('#similars .blockTitle')
                    .after(`<button type="button"
                                    class="btn-reset blockTitle-subtitle u-colorWhiteOpacity05">
                                        Suggérer une série
                            </button>`);
            }
            // On ajoute la gestion de l'event click sur le bouton d'update des similars
            $('.updateSimilars').click(function (e) {
                e.stopPropagation();
                e.preventDefault();
                $(this).removeClass('finish');
                // On supprime les bandeaux Viewed
                $('.bandViewed').remove();
                // On supprime les notes
                $('.stars-outer').remove();
                $('.fa-wrench').off('click').remove();
                // On supprime les popovers
                $('#similars a.slide__image').each((i, elt) => {
                    $(elt).popover('dispose');
                });
                // On met à jour les series/films similaires
                similarsViewed(res);
            });
        }
        let objSimilars = [];
        res.fetchSimilars().then(function (res) {
            let intTime = setInterval(function () {
                if (typeof bootstrap === 'undefined' || typeof bootstrap.Popover !== 'function') {
                    return;
                }
                else
                    clearInterval(intTime);
                /**
                 * Retourne la position de la popup par rapport à l'image du similar
                 * @param  {Object}         _tip Unknown
                 * @param  {HTMLElement}    elt  Le DOM Element du lien du similar
                 * @return {String}              La position de la popup
                 */
                let funcPlacement = (_tip, elt) => {
                    //if (debug) console.log('funcPlacement', tip, $(tip).width());
                    let rect = elt.getBoundingClientRect(), width = $(window).width(), sizePopover = 320;
                    return ((rect.left + rect.width + sizePopover) > width) ? 'left' : 'right';
                };
                for (let s = 0; s < res.similars.length; s++) {
                    objSimilars.push(res.similars[s].id);
                    let $elt = $($similars.get(s)), $link = $elt.siblings('a'), similar = res.similars[s];
                    similar.elt = $elt.parents('.slide_flex');
                    similar.save();
                    // similar = new Similar(resource, $elt.parents('.slide_flex'), type);
                    // On décode le titre du similar
                    similar.decodeTitle();
                    // On ajoute l'icone pour visualiser les data JSON du similar
                    if (debug) {
                        similar.wrench();
                    }
                    similar
                        // On vérifie la présence de l'image du similar
                        .checkImg()
                        // On ajoute le bandeau viewed sur le similar
                        .addViewed()
                        // On ajoute le code HTML pour le rendu de la note
                        .renderStars();
                    // On ajoute la popover sur le similar
                    $link.popover({
                        container: $link,
                        delay: { "show": 250, "hide": 100 },
                        html: true,
                        content: ' ',
                        placement: funcPlacement,
                        title: ' ',
                        trigger: 'hover',
                        fallbackPlacement: ['left', 'right']
                    });
                }
                // Event à l'ouverture de la Popover
                $('#similars a.slide__image').on('shown.bs.popover', function () {
                    const $wrench = $(this).parent().find('.popover-wrench'), resId = parseInt($wrench.data('id'), 10), type = $wrench.data('type'), objSimilar = res.getSimilar(resId);
                    $('.popover-header').html(objSimilar.getTitlePopup());
                    $('.popover-body').html(objSimilar.getContentPopup());
                    // On gère les modifs sur les cases à cocher de l'état d'un film similar
                    if (type === Base_1.MediaType.movie) {
                        $('input.movie').change((e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            const $elt = $(e.currentTarget);
                            let state = 0;
                            if (debug)
                                console.log('input.movie change', $elt);
                            if ($elt.is(':checked') && $elt.hasClass('movieSeen')) {
                                state = 1;
                            }
                            else if (($elt.is(':checked') && $elt.hasClass('movieMustSee')) ||
                                (!$elt.is(':checked') && $elt.hasClass('movieSeen'))) {
                                state = 0;
                            }
                            else if ($elt.is(':checked') && $elt.hasClass('movieNotSee')) {
                                state = 2;
                            }
                            $('input.movie:not(.' + $elt.get(0).classList[1] + ')').each((i, e) => {
                                $(e).prop("checked", false);
                            });
                            objSimilar.addToAccount(state).then(similar => {
                                if (state === 1) {
                                    $elt.parents('a').prepend(`<img src="${serverBaseUrl}/img/viewed.png" class="bandViewed"/>`);
                                }
                                else if ($elt.parents('a').find('.bandViewed').length > 0) {
                                    $elt.parents('a').find('.bandViewed').remove();
                                }
                                if (debug)
                                    console.log('movie mustSee/seen OK', similar);
                            }, err => {
                                console.warn('movie mustSee/seen KO', err);
                            });
                        });
                    }
                    // On gère le click sur le lien d'ajout de la série similar sur le compte de l'utilisateur
                    else if (type === Base_1.MediaType.show) {
                        $('.popover .addShow').click((e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            objSimilar.addToAccount().then(() => {
                                const para = $(e.currentTarget).parent('p');
                                $(e.currentTarget).remove();
                                para.text('<span style="color:var(--link-color)">La série a bien été ajoutée à votre compte</span>').delay(2000).fadeIn(400);
                            }, err => {
                                console.error('Popover addShow error', err);
                            });
                        });
                    }
                    // On gère le placement de la Popover par rapport à l'image du similar
                    let popover = $('.popover'), img = popover.siblings('img.js-lazy-image'), placement = $('.popover').attr('x-placement'), space = 0;
                    if (placement == 'left') {
                        space = popover.width() + (img.width() / 2) + 5;
                        popover.css('left', `-${space}px`);
                    }
                });
                $('.updateSimilars').addClass('finish');
                console.groupEnd();
            }, 500);
        }, (err) => {
            notification('Erreur de récupération des similars', 'similarsViewed: ' + err);
        });
        replaceSuggestSimilarHandler($('#similars button.blockTitle-subtitle'), objSimilars);
    }
    /**
     * Permet de mettre à jour la liste des épisodes à voir
     * sur la page de l'agenda
     * @return {void}
     */
    function updateAgenda() {
        // Identifier les informations des épisodes à voir
        // Les containers
        let $containersEpisode = $('#reactjs-episodes-to-watch .ComponentEpisodeContainer'), len = $containersEpisode.length, currentShowIds = {};
        // En attente du chargement des épisodes
        if (len > 0) {
            if (debug)
                console.log('updateAgenda - nb containers: %d', len);
            clearInterval(timerUA);
        }
        else {
            if (debug)
                console.log('updateAgenda en attente');
            return;
        }
        const params = {
            limit: 1,
            order: 'smart',
            showsLimit: len,
            released: 1,
            specials: false,
            subtitles: 'all'
        };
        Base_1.Base.callApi('GET', 'episodes', 'list', params)
            .then((data) => {
            for (let t = 0; t < len; t++) {
                $($containersEpisode.get(t))
                    .data('showId', data.shows[t].id)
                    .data('code', data.shows[t].unseen[0].code.toLowerCase());
                currentShowIds[data.shows[t].id] = { code: data.shows[t].unseen[0].code.toLowerCase() };
                //if (debug) console.log('title: %s - code: %s', title, episode);
            }
        });
        if ($('.updateElements').length === 0) {
            // On ajoute le bouton de mise à jour des similaires
            $('.maintitle > div:nth-child(1)').after(`
                <div class="updateElements">
                  <img src="${serverBaseUrl}/img/update.png" width="20" class="updateEpisodes updateElement finish" title="Mise à jour des similaires vus"/>
                </div>
            `);
            addScriptAndLink('moment');
            setTimeout(() => {
                addScriptAndLink('localefr');
            }, 250);
            $('.updateEpisodes').click((e) => {
                e.stopPropagation();
                e.preventDefault();
                if (debug)
                    console.groupCollapsed('Agenda updateEpisodes');
                $containersEpisode = $('#reactjs-episodes-to-watch .ComponentEpisodeContainer');
                const self = $(e.currentTarget), len = $containersEpisode.length;
                self.removeClass('finish');
                let countIntTime = 0;
                Media_1.Media.callApi('GET', 'episodes', 'list', { limit: 1, order: 'smart', showsLimit: len, released: 1, specials: false, subtitles: 'all' })
                    .then((data) => {
                    let intTime = setInterval(function () {
                        if (++countIntTime > 60) {
                            clearInterval(intTime);
                            self.addClass('finish');
                            notification('Erreur de mise à jour des épisodes', 'updateAgenda: updateEpisodes.click interval time over');
                            if (debug)
                                console.groupEnd();
                            return;
                        }
                        if (typeof moment !== 'function') {
                            return;
                        }
                        else
                            clearInterval(intTime);
                        moment.locale('fr');
                        let newShowIds = {}, show;
                        if (debug)
                            console.log('updateAgenda updateEpisodes', data);
                        for (let s = 0; s < data.shows.length; s++) {
                            show = data.shows[s];
                            newShowIds[show.id] = { code: show.unseen[0].code.toLowerCase() };
                            if (currentShowIds[show.id] === undefined) {
                                if (debug)
                                    console.log('Une nouvelle série est arrivée', show);
                                // Il s'agit d'une nouvelle série
                                // TODO Ajouter un nouveau container
                                let newContainer = $(buildContainer(show.unseen[0]));
                                renderNote(show.unseen[0].note.mean, newContainer);
                                $($containersEpisode.get(s)).parent().after(newContainer);
                            }
                        }
                        if (debug)
                            console.log('Iteration principale');
                        let container, unseen;
                        // Itération principale sur les containers
                        for (let e = 0; e < len; e++) {
                            container = $($containersEpisode.get(e));
                            unseen = null;
                            // Si la serie n'est plus dans la liste
                            if (newShowIds[container.data('showId')] === undefined) {
                                if (debug)
                                    console.log('La série %d ne fait plus partie de la liste', container.data('showId'));
                                container.parent().remove();
                                continue;
                            }
                            if (container.data('showId') == data.shows[e].id) {
                                unseen = data.shows[e].unseen[0];
                            }
                            else {
                                for (let u = 0; u < len; u++) {
                                    if (container.data('showId') == data.shows[u].id) {
                                        unseen = data.shows[u].unseen[0];
                                        break;
                                    }
                                }
                            }
                            if (unseen && container.data('code') !== unseen.code.toLowerCase()) {
                                if (debug)
                                    console.log('Episode à mettre à jour', unseen);
                                // Mettre à jour l'épisode
                                let mainLink = $('a.mainLink', container), text = unseen.code + ' - ' + unseen.title;
                                // On met à jour le titre et le lien de l'épisode
                                mainLink.attr('href', mainLink.attr('href').replace(/s\d{2}e\d{2}/, unseen.code.toLowerCase()));
                                mainLink.attr('title', `Accéder à la fiche de l'épisode ${text}`);
                                mainLink.text(text);
                                // On met à jour la date de sortie
                                $('.date .mainTime', container).text(moment(unseen.date).format('D MMMM YYYY'));
                                // On met à jour la synopsis
                                $('.m_s p.m_ay', container).html(unseen.description);
                                // On met à jour la barre de progression
                                $('.media-left > .m_ab > .m_ag', container).css('width', String(unseen.show.progress) + '%');
                                // On met à jour la note
                                renderNote(unseen.note.mean, container);
                            }
                            else {
                                console.log('Episode Show unchanged', unseen);
                            }
                        }
                        fnLazy.init();
                        self.addClass('finish');
                        if (debug)
                            console.groupEnd();
                    }, 500);
                }, (err) => {
                    notification('Erreur de mise à jour des épisodes', 'updateAgenda: ' + err);
                    if (debug)
                        console.groupEnd();
                });
            });
        }
        /**
         * Permet d'afficher une note avec des étoiles
         * @param  {Number} note      La note à afficher
         * @param  {Object} container DOMElement contenant la note à afficher
         * @return {void}
         */
        function renderNote(note, container) {
            const renderStars = $('.date .stars', container);
            if (renderStars.length <= 0) {
                return;
            }
            renderStars.empty();
            renderStars.attr('title', `${parseFloat(note).toFixed(1)} / 5`);
            let typeSvg;
            Array.from({
                length: 5
            }, (index, number) => {
                typeSvg = note <= number ? "empty" : (note < number + 1) ? 'half' : "full";
                renderStars.append(`
                    <svg viewBox="0 0 100 100" class="star-svg">
                      <use xmlns:xlink="http://www.w3.org/1999/xlink"
                           xlink:href="#icon-star-${typeSvg}">
                      </use>
                    </svg>
                `);
            });
        }
        /**
         * Permet de construire le container d'un episode
         * @param  {Object} unseen Correspond à l'objet Episode non vu
         * @return {String}
         */
        function buildContainer(unseen) {
            let description = unseen.description;
            if (description.length <= 0) {
                description = 'Aucune description';
            }
            else if (description.length > 145) {
                description = description.substring(0, 145) + '…';
            }
            const urlShow = unseen.resource_url.replace('episode', 'serie').replace(/\/s\d{2}e\d{2}$/, '');
            let template = `
            <div class="a6_ba displayFlex justifyContentSpaceBetween" style="opacity: 1; transition: opacity 300ms ease-out 0s, transform;">
              <div class="a6_a8 ComponentEpisodeContainer media">
                <div class="media-left">
                  <img class="js-lazy-image greyBorder a6_a2" data-src="https://api.betaseries.com/pictures/shows?key=${betaseries_api_user_key}&id=${unseen.show.id}&width=119&height=174" width="119" height="174" alt="Affiche de la série ${unseen.show.title}">
                </div>
                <div class="a6_bc media-body alignSelfStretch displayFlex flexDirectionColumn">
                  <div class="media">
                    <div class="media-body minWidth0 alignSelfStretch displayFlex flexDirectionColumn alignItemsFlexStart">
                      <a class="a6_bp displayBlock nd" href="${urlShow}" title="${trans("agenda.episodes_watch.show_link_title", { title: unseen.show.title })}">
                        <strong>${unseen.show.title}</strong>
                      </a>
                      <a class="a6_bp a6_ak mainLink displayBlock nd" href="${unseen.resource_url}" title="${trans("agenda.episodes_watch.episode_link_title", { code: unseen.code.toUpperCase(), title: unseen.title })}">${unseen.code.toUpperCase()} - ${unseen.title}</a>
                      <div class="date displayFlex a6_bv">
                        <time class="mainTime">${moment(unseen.date).format('D MMMM YYYY')}</time>
                        <span class="stars" title=""></span>
                      </div>
                    </div>
                    <div class="a6_bh media-right" data-tour="step: 6; title: ${trans("tourguide.series-agenda.6.title")}; content: ${trans("tourguide.series-agenda.6.content")};">
                      <div class="displayFlex alignItemsCenter">
                        <button type="button" class="btn-reset alignSelfCenter ij_il ij_in"></button>
                      </div>
                    </div>
                  </div>
                  <p class="a6_bt" style="margin: 11px 0px 10px;">${description}</p>
                  <div class="media">
                    <div class="media-left alignSelfCenter">
                      <div class="a6_bj">
                        <div class="a6_bn" style="width: ${unseen.show.progress}%;"></div>
                      </div>
                    </div>
                    <div class="media-body alignSelfCenter displayFlex flexDirectionColumn alignItemsFlexStart">
                      <span class="a6_bl">${secondsToDhms(unseen.show.minutes_remaining * 60)} (${unseen.show.remaining} ép.)</span>
                    </div>
                  </div>
                  <div class="media" style="margin-top: 9px;">
                    <div class="media-body alignSelfCenter">
                      <div class="listAvatars listAvatars--small marginTopAuto">${watchedAvatar(unseen.watched_by)}</div>
                    </div>
                    <div class="a6_aq media-right alignSelfCenter positionRelative" data-tour="step: 5; title: Masquer un épisode; content: Si vous le souhaitez, choisissez de masquer cet épisode de votre liste d’épisodes à regarder ou retrouvez-en les sous-titres.;">
                      <div class="displayFlex">`;
            if (unseen.subtitles.length > 0) {
                template += `
                        <div class="svgContainer a6_0">
                          <svg class="SvgSubtitles" width="20" height="16" viewBox="0 0 20 16" xmlns="http://www.w3.org/2000/svg">
                            <g fill="none">
                              <path d="M2.083.751c2.389-.501 5.028-.751 7.917-.751 2.939 0 5.619.259 8.04.778.75.161 1.342.736 1.524 1.481.29 1.188.435 3.102.435 5.742s-.145 4.554-.435 5.742c-.182.745-.774 1.32-1.524 1.481-2.421.518-5.101.778-8.04.778-2.89 0-5.529-.25-7.917-.751-.734-.154-1.321-.706-1.519-1.43-.376-1.375-.564-3.315-.564-5.819s.188-4.443.564-5.819c.198-.724.784-1.276 1.519-1.43z"></path>
                              <path class="SvgSubtitles__stroke" stroke="#C1E1FA" d="M2.237 1.485c-.459.096-.825.441-.949.894-.356 1.3-.538 3.178-.538 5.621 0 2.443.182 4.321.538 5.621.124.452.49.797.949.894 2.336.49 4.923.735 7.763.735 2.889 0 5.516-.254 7.883-.761.469-.1.839-.46.953-.926.273-1.116.414-2.979.414-5.564 0-2.584-.141-4.447-.414-5.563-.114-.466-.484-.825-.953-.926-2.367-.507-4.995-.761-7.883-.761-2.84 0-5.428.246-7.763.735z"></path>
                              <path class="SvgSubtitles__fill" fill="#C1E1FA" d="M4 7h12v2h-12zm2 3h8v2h-8z"></path>
                            </g>
                          </svg>
                        </div>`;
            }
            template += `
                      </div>
                    </div>
                    <div class="media-right alignSelfCenter positionRelative" style="min-height: 24px;">
                      <div class="positionRelative">
                        <div class="btn-group">
                          <button id="dropdownSubtitle-8899" role="button" aria-haspopup="true" aria-expanded="false" type="button" class="a6_as btn-reset dropdown-toggle -toggle btn btn-default">
                            <span class="svgContainer">
                              <svg fill="#999" width="4" height="16" viewBox="0 0 4 16" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" fill-rule="nonzero" fill="inherit"></path>
                              </svg>
                            </span>
                            <span class="caret"></span>
                          </button>
                          <ul role="menu" class="-menu" aria-labelledby="dropdownSubtitle-8899"></ul>
                        </div>
                        <div class="dropdown-menu dropdown-menu--topRight ho_hy" aria-labelledby="dropdownSubtitle-8899" style="top: 0px;">
                          <div class="sousTitres">
                            <div class="ho_hu">
                              <button type="button" class="ho_g btn-reset btn-btn btn--grey">Ne pas regarder cet épisode</button>
                              <button type="button" class="ho_g btn-reset btn-btn btn-blue2">J'ai récupéré cet épisode</button>
                            </div>
                            ${renderSubtitles(unseen)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            `;
            return template;
            function watchedAvatar(friends) {
                let template = '', friend;
                for (let f = 0; f < friends.length; f++) {
                    friend = friends[f];
                    template += `
                        <a href="/membre/${friend.login}" class="listAvatar">
                          <img class="js-lazy-image" data-src="https://api.betaseries.com/pictures/members?key=${betaseries_api_user_key}&id=${friend.id}&width=24&height=24&placeholder=png" width="24" height="24" alt="Avatar de ${friend.login}">
                        </a>`;
                }
                return template;
            }
            function secondsToDhms(seconds) {
                seconds = Number(seconds);
                const d = Math.floor(seconds / (3600 * 24)), h = Math.floor(seconds % (3600 * 24) / 3600), m = Math.floor(seconds % 3600 / 60);
                //s = Math.floor(seconds % 60);
                let dDisplay = d > 0 ? d + ' j ' : '', hDisplay = h > 0 ? h + ' h ' : '', mDisplay = m >= 0 && d <= 0 ? m + ' min' : '';
                //sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
                return dDisplay + hDisplay + mDisplay;
            }
            function renderSubtitles(unseen) {
                if (unseen.subtitles.length <= 0)
                    return '';
                let template = `
                <div>
                  <div class="ho_gh ComponentTitleDropdown">Sous-titres de l'épisode</div>
                  <div style="display: grid; row-gap: 5px;">
                    <div class="maxHeight280px overflowYScroll">
                      <div>`;
                for (let st = 0; st < unseen.subtitles.length; st++) {
                    let subtitle = unseen.subtitles[st];
                    if (st > 0)
                        template += '<div style="margin-top: 5px;">';
                    template += `
                        <div style="align-items: center; display: flex; justify-content: flex-start;">
                          <div class="svgContainer">
                            <svg class="SvgPertinence" fill="#EEE" width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                              <rect fill="${subtitle.quality >= 1 ? '#999' : 'inherit'}" x="0" y="10" width="4" height="6"></rect>
                              <rect fill="${subtitle.quality >= 3 ? '#999' : 'inherit'}" x="6" y="5" width="4" height="11"></rect>
                              <rect fill="${subtitle.quality >= 5 ? '#999' : 'inherit'}" x="12" y="0" width="4" height="16"></rect>
                            </svg>
                          </div>
                          <div class="ComponentLang" style="border: 1px solid currentcolor; border-radius: 4px; color: rgb(51, 51, 51); flex-shrink: 0; font-size: 10px; font-weight: 700; height: 18px; line-height: 17px; margin: 0px 10px 0px 5px; min-width: 22px; padding: 0px 3px; text-align: center;">${subtitle.language}</div>
                          <div class="minWidth0" style="flex-grow: 1;">
                            <a href="${subtitle.url}" class="displayBlock mainLink nd" title="Provenance : ${subtitle.source} / ${subtitle.file} / Ajouté le ${moment(subtitle.date).format('DD/MM/YYYY')}" style="max-width: 365px; margin: 0px; font-size: 12px;">
                              ${ellipsisSubtitles(subtitle)}
                            </a>
                          </div>
                          <button title="Signaler ce sous-titre" type="button" class="btn-reset" onclick="srtInaccurate(${subtitle.id});">
                            <span class="svgContainer">
                              <svg fill="#eee" width="22" height="19" viewBox="0 0 22 19" xmlns="http://www.w3.org/2000/svg">
                                <path d="M0 19h22l-11-19-11 19zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" fill-rule="nonzero" fill="inherit"></path>
                              </svg>
                            </span>
                          </button>
                        </div>
                        `;
                }
                template += `
                      </div>
                    </div>
                  </div>
                </div>
                `;
                function ellipsisSubtitles(subtitle) {
                    let subtitleName = subtitle.file, LIMIT_ELLIPSIS = 50;
                    if (subtitleName.length <= LIMIT_ELLIPSIS) {
                        return `<div class="nd displayInlineBlock">${subtitleName}</div>`;
                    }
                    let LENGTH_LAST_ELLIPSIS = 45;
                    return `
                      <div>
                        <div class="nd displayInlineBlock" style="max-width: 40px;">${subtitleName}</div>
                        <div class="nd displayInlineBlock">${subtitleName.slice(-LENGTH_LAST_ELLIPSIS)}</div>
                      </div>
                    `;
                }
                return template;
            }
        }
    }
    /**
     * Ajoute le statut de la série sur la page de gestion des séries de l'utilisateur
     */
    function addStatusToGestionSeries() {
        // On vérifie que l'utilisateur est connecté et que la clé d'API est renseignée
        if (!userIdentified() || betaseries_api_user_key === '')
            return;
        const $series = $('#member_shows div.showItem.cf');
        if ($series.length <= 0)
            return;
        $series.each(function (_index, serie) {
            let id = parseInt($(serie).data('id'), 10), infos = $(serie).find('.infos');
            Show_1.Show.fetch(id).then(function (show) {
                infos.append(`<br>Statut: ${(show.isEnded()) ? 'Terminée' : 'En cours'}`);
            }, (err) => {
                notification('Erreur de modification d\'une série', 'addStatusToGestionSeries: ' + err);
            });
        });
    }
})(jQuery);

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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LGVBQWUsY0FBYywyQ0FBMkMsMkJBQTJCLGFBQWEsZ0JBQWdCO0FBQ2xRLGdDQUFnQztBQUNoQztBQUNBO0FBQ0EsMEhBQTBILFlBQVksRUFBRTtBQUN4STtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxRUFBcUUsYUFBYTtBQUNsRjtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtGQUFrRixJQUFJLGFBQWE7QUFDbkcsNkRBQTZELDBDQUEwQztBQUN2RztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNENBQTRDLDJDQUEyQztBQUN2RixhQUFhO0FBQ2I7QUFDQSxhQUFhO0FBQ2IsU0FBUztBQUNUO0FBQ0EsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovLy8uL3NyYy9CYXNlLnRzIiwid2VicGFjazovLy8uL3NyYy9DYWNoZS50cyIsIndlYnBhY2s6Ly8vLi9zcmMvQ2hhcmFjdGVyLnRzIiwid2VicGFjazovLy8uL3NyYy9Db21tZW50LnRzIiwid2VicGFjazovLy8uL3NyYy9FcGlzb2RlLnRzIiwid2VicGFjazovLy8uL3NyYy9NZWRpYS50cyIsIndlYnBhY2s6Ly8vLi9zcmMvTW92aWUudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL05vdGUudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL1Nob3cudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL1NpbWlsYXIudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL1N1YnRpdGxlLnRzIiwid2VicGFjazovLy8uL3NyYy9VcGRhdGVBdXRvLnRzIiwid2VicGFjazovLy8uL3NyYy9Vc2VyLnRzIiwid2VicGFjazovLy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly8vLi9zcmMvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxuZXhwb3J0cy5CYXNlID0gZXhwb3J0cy5IVFRQX1ZFUkJTID0gZXhwb3J0cy5FdmVudFR5cGVzID0gZXhwb3J0cy5NZWRpYVR5cGUgPSB2b2lkIDA7XHJcbmNvbnN0IENhY2hlXzEgPSByZXF1aXJlKFwiLi9DYWNoZVwiKTtcclxuY29uc3QgQ2hhcmFjdGVyXzEgPSByZXF1aXJlKFwiLi9DaGFyYWN0ZXJcIik7XHJcbmNvbnN0IENvbW1lbnRfMSA9IHJlcXVpcmUoXCIuL0NvbW1lbnRcIik7XHJcbmNvbnN0IE5vdGVfMSA9IHJlcXVpcmUoXCIuL05vdGVcIik7XHJcbmNvbnN0IFVzZXJfMSA9IHJlcXVpcmUoXCIuL1VzZXJcIik7XHJcbnZhciBNZWRpYVR5cGU7XHJcbihmdW5jdGlvbiAoTWVkaWFUeXBlKSB7XHJcbiAgICBNZWRpYVR5cGVbXCJzaG93XCJdID0gXCJzaG93XCI7XHJcbiAgICBNZWRpYVR5cGVbXCJtb3ZpZVwiXSA9IFwibW92aWVcIjtcclxuICAgIE1lZGlhVHlwZVtcImVwaXNvZGVcIl0gPSBcImVwaXNvZGVcIjtcclxufSkoTWVkaWFUeXBlID0gZXhwb3J0cy5NZWRpYVR5cGUgfHwgKGV4cG9ydHMuTWVkaWFUeXBlID0ge30pKTtcclxudmFyIEV2ZW50VHlwZXM7XHJcbihmdW5jdGlvbiAoRXZlbnRUeXBlcykge1xyXG4gICAgRXZlbnRUeXBlc1tFdmVudFR5cGVzW1wiVVBEQVRFXCJdID0gMF0gPSBcIlVQREFURVwiO1xyXG4gICAgRXZlbnRUeXBlc1tFdmVudFR5cGVzW1wiU0FWRVwiXSA9IDFdID0gXCJTQVZFXCI7XHJcbn0pKEV2ZW50VHlwZXMgPSBleHBvcnRzLkV2ZW50VHlwZXMgfHwgKGV4cG9ydHMuRXZlbnRUeXBlcyA9IHt9KSk7XHJcbnZhciBIVFRQX1ZFUkJTO1xyXG4oZnVuY3Rpb24gKEhUVFBfVkVSQlMpIHtcclxuICAgIEhUVFBfVkVSQlNbXCJHRVRcIl0gPSBcIkdFVFwiO1xyXG4gICAgSFRUUF9WRVJCU1tcIlBPU1RcIl0gPSBcIlBPU1RcIjtcclxuICAgIEhUVFBfVkVSQlNbXCJQVVRcIl0gPSBcIlBVVFwiO1xyXG4gICAgSFRUUF9WRVJCU1tcIkRFTEVURVwiXSA9IFwiREVMRVRFXCI7XHJcbiAgICBIVFRQX1ZFUkJTW1wiT1BUSU9OU1wiXSA9IFwiT1BUSU9OU1wiO1xyXG59KShIVFRQX1ZFUkJTID0gZXhwb3J0cy5IVFRQX1ZFUkJTIHx8IChleHBvcnRzLkhUVFBfVkVSQlMgPSB7fSkpO1xyXG5jbGFzcyBCYXNlIHtcclxuICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgICAgU1RBVElDXHJcbiAgICAqL1xyXG4gICAgLyoqXHJcbiAgICAgKiBGbGFnIGRlIGRlYnVnIHBvdXIgbGUgZGV2XHJcbiAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cclxuICAgICAqL1xyXG4gICAgc3RhdGljIGRlYnVnID0gZmFsc2U7XHJcbiAgICAvKipcclxuICAgICAqIEwnb2JqZXQgY2FjaGUgZHUgc2NyaXB0IHBvdXIgc3RvY2tlciBsZXMgZG9ubsOpZXNcclxuICAgICAqIEB0eXBlIHtDYWNoZVVTfVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgY2FjaGUgPSBudWxsO1xyXG4gICAgLyoqXHJcbiAgICAgKiBPYmpldCBjb250ZW5hbnQgbGVzIGluZm9ybWF0aW9ucyBkZSBsJ0FQSVxyXG4gICAgICogQHR5cGUgeyp9XHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBhcGkgPSB7XHJcbiAgICAgICAgXCJ1cmxcIjogJ2h0dHBzOi8vYXBpLmJldGFzZXJpZXMuY29tJyxcclxuICAgICAgICBcInZlcnNpb25zXCI6IHsgXCJjdXJyZW50XCI6ICczLjAnLCBcImxhc3RcIjogJzMuMCcgfSxcclxuICAgICAgICBcInJlc291cmNlc1wiOiBbXHJcbiAgICAgICAgICAgICdiYWRnZXMnLCAnY29tbWVudHMnLCAnZXBpc29kZXMnLCAnZnJpZW5kcycsICdtZW1iZXJzJywgJ21lc3NhZ2VzJyxcclxuICAgICAgICAgICAgJ21vdmllcycsICduZXdzJywgJ29hdXRoJywgJ3BpY3R1cmVzJywgJ3BsYW5uaW5nJywgJ3BsYXRmb3JtcycsXHJcbiAgICAgICAgICAgICdwb2xscycsICdyZXBvcnRzJywgJ3NlYXJjaCcsICdzZWFzb25zJywgJ3Nob3dzJywgJ3N1YnRpdGxlcycsXHJcbiAgICAgICAgICAgICd0aW1lbGluZSdcclxuICAgICAgICBdLFxyXG4gICAgICAgIFwiY2hlY2tcIjoge1xyXG4gICAgICAgICAgICBcImVwaXNvZGVzXCI6IFsnZGlzcGxheScsICdsaXN0JywgJ3NlYXJjaCddLFxyXG4gICAgICAgICAgICBcIm1vdmllc1wiOiBbJ2xpc3QnLCAnbW92aWUnLCAnc2VhcmNoJywgJ3NpbWlsYXJzJ10sXHJcbiAgICAgICAgICAgIFwic2VhcmNoXCI6IFsnYWxsJywgJ21vdmllcycsICdzaG93cyddLFxyXG4gICAgICAgICAgICBcInNob3dzXCI6IFsnZGlzcGxheScsICdlcGlzb2RlcycsICdsaXN0JywgJ3NlYXJjaCcsICdzaW1pbGFycyddXHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogTGUgdG9rZW4gZCdhdXRoZW50aWZpY2F0aW9uIGRlIGwnQVBJXHJcbiAgICAgKiBAdHlwZSB7U3RyaW5nfVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgdG9rZW4gPSBudWxsO1xyXG4gICAgLyoqXHJcbiAgICAgKiBMYSBjbMOpIGQndXRpbGlzYXRpb24gZGUgbCdBUElcclxuICAgICAqIEB0eXBlIHtTdHJpbmd9XHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyB1c2VyS2V5ID0gbnVsbDtcclxuICAgIC8qKlxyXG4gICAgICogTCdpZGVudGlmaWFudCBkdSBtZW1icmUgY29ubmVjdMOpXHJcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgdXNlcklkID0gbnVsbDtcclxuICAgIC8qKlxyXG4gICAgICogQ2zDqSBwb3VyIGwnQVBJIFRoZU1vdmllREJcclxuICAgICAqIEB0eXBlIHtzdHJpbmd9XHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyB0aGVtb3ZpZWRiX2FwaV91c2VyX2tleSA9IG51bGw7XHJcbiAgICAvKipcclxuICAgICAqIExlIG5vbWJyZSBkJ2FwcGVscyDDoCBsJ0FQSVxyXG4gICAgICogQHR5cGUge051bWJlcn1cclxuICAgICAqL1xyXG4gICAgc3RhdGljIGNvdW50ZXIgPSAwO1xyXG4gICAgLyoqXHJcbiAgICAgKiBMJ1VSTCBkZSBiYXNlIGR1IHNlcnZldXIgY29udGVuYW50IGxlcyByZXNzb3VyY2VzIHN0YXRpcXVlc1xyXG4gICAgICogQHR5cGUge1N0cmluZ31cclxuICAgICAqL1xyXG4gICAgc3RhdGljIHNlcnZlckJhc2VVcmwgPSAnJztcclxuICAgIC8qKlxyXG4gICAgICogRm9uY3Rpb24gZGUgbm90aWZpY2F0aW9uIHN1ciBsYSBwYWdlIFdlYlxyXG4gICAgICogQHR5cGUge0Z1bmN0aW9ufVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgbm90aWZpY2F0aW9uID0gZnVuY3Rpb24gKCkgeyB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBGb25jdGlvbiBwb3VyIHbDqXJpZmllciBxdWUgbGUgbWVtYnJlIGVzdCBjb25uZWN0w6lcclxuICAgICAqIEB0eXBlIHtGdW5jdGlvbn1cclxuICAgICAqL1xyXG4gICAgc3RhdGljIHVzZXJJZGVudGlmaWVkID0gZnVuY3Rpb24gKCkgeyB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBGb25jdGlvbiB2aWRlXHJcbiAgICAgKiBAdHlwZSB7RnVuY3Rpb259XHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBub29wID0gZnVuY3Rpb24gKCkgeyB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBGb25jdGlvbiBkZSB0cmFkdWN0aW9uIGRlIGNoYcOubmVzIGRlIGNhcmFjdMOocmVzXHJcbiAgICAgKiBAcGFyYW0gICB7U3RyaW5nfSAgbXNnICAgICBJZGVudGlmaWFudCBkZSBsYSBjaGHDrm5lIMOgIHRyYWR1aXJlXHJcbiAgICAgKiBAcGFyYW0gICB7KltdfSAgICAgYXJncyAgICBBdXRyZXMgcGFyYW3DqHRyZXNcclxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyB0cmFucyA9IGZ1bmN0aW9uIChtc2csIC4uLmFyZ3MpIHsgfTtcclxuICAgIC8qKlxyXG4gICAgICogQ29udGllbnQgbGVzIGluZm9zIHN1ciBsZXMgZGlmZsOpcmVudGVzIGNsYXNzaWZpY2F0aW9uIFRWIGV0IGNpbsOpbWFcclxuICAgICAqIEB0eXBlIHtSYXRpbmdzfVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgcmF0aW5ncyA9IG51bGw7XHJcbiAgICAvKipcclxuICAgICAqIFR5cGVzIGQnw6l2ZW5lbWVudHMgZ8OpcsOpcyBwYXIgY2V0dGUgY2xhc3NlXHJcbiAgICAgKiBAdHlwZSB7QXJyYXl9XHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBFdmVudFR5cGVzID0gbmV3IEFycmF5KEV2ZW50VHlwZXMuVVBEQVRFLCBFdmVudFR5cGVzLlNBVkUpO1xyXG4gICAgLyoqXHJcbiAgICAgKiBGb25jdGlvbiBkJ2F1dGhlbnRpZmljYXRpb24gc3VyIGwnQVBJIEJldGFTZXJpZXNcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJuIHtQcm9taXNlfVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgYXV0aGVudGljYXRlKCkge1xyXG4gICAgICAgIGlmIChCYXNlLmRlYnVnKVxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnYXV0aGVudGljYXRlJyk7XHJcbiAgICAgICAgaWYgKGpRdWVyeSgnI2NvbnRhaW5lcklmcmFtZScpLmxlbmd0aCA8PSAwKSB7XHJcbiAgICAgICAgICAgIGpRdWVyeSgnYm9keScpLmFwcGVuZChgXHJcbiAgICAgICAgICAgICAgICA8ZGl2IGlkPVwiY29udGFpbmVySWZyYW1lXCI+XHJcbiAgICAgICAgICAgICAgICA8aWZyYW1lIGlkPVwidXNlcnNjcmlwdFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU9XCJ1c2Vyc2NyaXB0XCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU9XCJDb25uZXhpb24gw6AgQmV0YVNlcmllc1wiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoPVwiNTAlXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0PVwiNDAwXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3JjPVwiJHtCYXNlLnNlcnZlckJhc2VVcmx9L2luZGV4Lmh0bWxcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHlsZT1cImJhY2tncm91bmQ6d2hpdGU7bWFyZ2luOmF1dG87XCI+XHJcbiAgICAgICAgICAgICAgICA8L2lmcmFtZT5cclxuICAgICAgICAgICAgICAgIDwvZGl2PidcclxuICAgICAgICAgICAgYCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIHJlY2VpdmVNZXNzYWdlKGV2ZW50KSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBvcmlnaW4gPSBuZXcgVVJMKEJhc2Uuc2VydmVyQmFzZVVybCkub3JpZ2luO1xyXG4gICAgICAgICAgICAgICAgLy8gaWYgKGRlYnVnKSBjb25zb2xlLmxvZygncmVjZWl2ZU1lc3NhZ2UnLCBldmVudCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQub3JpZ2luICE9PSBvcmlnaW4pIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoQmFzZS5kZWJ1ZylcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcigncmVjZWl2ZU1lc3NhZ2Uge29yaWdpbjogJXN9JywgZXZlbnQub3JpZ2luLCBldmVudCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGBldmVudC5vcmlnaW4gaXMgbm90ICR7b3JpZ2lufWApO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChldmVudC5kYXRhLm1lc3NhZ2UgPT09ICdhY2Nlc3NfdG9rZW4nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgQmFzZS50b2tlbiA9IGV2ZW50LmRhdGEudmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgJCgnI2NvbnRhaW5lcklmcmFtZScpLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZXZlbnQuZGF0YS5tZXNzYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgcmVjZWl2ZU1lc3NhZ2UsIGZhbHNlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0VycmV1ciBkZSByw6ljdXBlcmF0aW9uIGR1IHRva2VuJywgZXZlbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChldmVudC5kYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICBCYXNlLm5vdGlmaWNhdGlvbignRXJyZXVyIGRlIHLDqWN1cMOpcmF0aW9uIGR1IHRva2VuJywgJ1BhcyBkZSBtZXNzYWdlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIHJlY2VpdmVNZXNzYWdlLCBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIHJlY2VpdmVNZXNzYWdlLCBmYWxzZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIEZvbmN0aW9uIHNlcnZhbnQgw6AgYXBwZWxlciBsJ0FQSSBkZSBCZXRhU2VyaWVzXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtICB7U3RyaW5nfSAgIHR5cGUgICAgICAgICAgICAgIFR5cGUgZGUgbWV0aG9kZSBkJ2FwcGVsIEFqYXggKEdFVCwgUE9TVCwgUFVULCBERUxFVEUpXHJcbiAgICAgKiBAcGFyYW0gIHtTdHJpbmd9ICAgcmVzb3VyY2UgICAgICAgICAgTGEgcmVzc291cmNlIGRlIGwnQVBJIChleDogc2hvd3MsIHNlYXNvbnMsIGVwaXNvZGVzLi4uKVxyXG4gICAgICogQHBhcmFtICB7U3RyaW5nfSAgIGFjdGlvbiAgICAgICAgICAgIEwnYWN0aW9uIMOgIGFwcGxpcXVlciBzdXIgbGEgcmVzc291cmNlIChleDogc2VhcmNoLCBsaXN0Li4uKVxyXG4gICAgICogQHBhcmFtICB7Kn0gICAgICAgIGFyZ3MgICAgICAgICAgICAgIFVuIG9iamV0IChjbGVmLCB2YWxldXIpIMOgIHRyYW5zbWV0dHJlIGRhbnMgbGEgcmVxdcOqdGVcclxuICAgICAqIEBwYXJhbSAge2Jvb2x9ICAgICBbZm9yY2U9ZmFsc2VdICAgICBJbmRpcXVlIHNpIG9uIGRvaXQgdXRpbGlzZXIgbGUgY2FjaGUgb3Ugbm9uIChQYXIgZMOpZmF1dDogZmFsc2UpXHJcbiAgICAgKiBAcmV0dXJuIHtQcm9taXNlfVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgY2FsbEFwaSh0eXBlLCByZXNvdXJjZSwgYWN0aW9uLCBhcmdzLCBmb3JjZSA9IGZhbHNlKSB7XHJcbiAgICAgICAgaWYgKEJhc2UuYXBpICYmIEJhc2UuYXBpLnJlc291cmNlcy5pbmRleE9mKHJlc291cmNlKSA9PT0gLTEpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBSZXNzb3VyY2UgKCR7cmVzb3VyY2V9KSBpbmNvbm51ZSBkYW5zIGwnQVBJLmApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIUJhc2UudG9rZW4gfHwgIUJhc2UudXNlcktleSkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Rva2VuIGFuZCB1c2VyS2V5IGFyZSByZXF1aXJlZCcpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgY2hlY2sgPSBmYWxzZSwgXHJcbiAgICAgICAgLy8gTGVzIGVuLXTDqnRlcyBwb3VyIGwnQVBJXHJcbiAgICAgICAgbXlIZWFkZXJzID0ge1xyXG4gICAgICAgICAgICAnQWNjZXB0JzogJ2FwcGxpY2F0aW9uL2pzb24nLFxyXG4gICAgICAgICAgICAnWC1CZXRhU2VyaWVzLVZlcnNpb24nOiBCYXNlLmFwaS52ZXJzaW9ucy5jdXJyZW50LFxyXG4gICAgICAgICAgICAnWC1CZXRhU2VyaWVzLVRva2VuJzogQmFzZS50b2tlbixcclxuICAgICAgICAgICAgJ1gtQmV0YVNlcmllcy1LZXknOiBCYXNlLnVzZXJLZXlcclxuICAgICAgICB9LCBjaGVja0tleXMgPSBPYmplY3Qua2V5cyhCYXNlLmFwaS5jaGVjayk7XHJcbiAgICAgICAgaWYgKEJhc2UuZGVidWcpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ0Jhc2UuY2FsbEFwaScsIHtcclxuICAgICAgICAgICAgICAgIHR5cGU6IHR5cGUsXHJcbiAgICAgICAgICAgICAgICByZXNvdXJjZTogcmVzb3VyY2UsXHJcbiAgICAgICAgICAgICAgICBhY3Rpb246IGFjdGlvbixcclxuICAgICAgICAgICAgICAgIGFyZ3M6IGFyZ3MsXHJcbiAgICAgICAgICAgICAgICBmb3JjZTogZm9yY2VcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIE9uIHJldG91cm5lIGxhIHJlc3NvdXJjZSBlbiBjYWNoZSBzaSBlbGxlIHkgZXN0IHByw6lzZW50ZVxyXG4gICAgICAgIGlmIChCYXNlLmNhY2hlICYmICFmb3JjZSAmJiB0eXBlID09PSAnR0VUJyAmJiBhcmdzICYmICdpZCcgaW4gYXJncyAmJlxyXG4gICAgICAgICAgICBCYXNlLmNhY2hlLmhhcyhyZXNvdXJjZSwgYXJncy5pZCkpIHtcclxuICAgICAgICAgICAgLy9pZiAoZGVidWcpIGNvbnNvbGUubG9nKCdCYXNlLmNhbGxBcGkgcmV0b3VybmUgbGEgcmVzc291cmNlIGR1IGNhY2hlICglczogJWQpJywgcmVzb3VyY2UsIGFyZ3MuaWQpO1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcclxuICAgICAgICAgICAgICAgIHJlc29sdmUoQmFzZS5jYWNoZS5nZXQocmVzb3VyY2UsIGFyZ3MuaWQpKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIE9uIGNoZWNrIHNpIG9uIGRvaXQgdsOpcmlmaWVyIGxhIHZhbGlkaXTDqSBkdSB0b2tlblxyXG4gICAgICAgIC8vIChodHRwczovL3d3dy5iZXRhc2VyaWVzLmNvbS9idWdzL2FwaS80NjEpXHJcbiAgICAgICAgaWYgKEJhc2UudXNlcklkZW50aWZpZWQoKSAmJiBjaGVja0tleXMuaW5kZXhPZihyZXNvdXJjZSkgIT09IC0xICYmXHJcbiAgICAgICAgICAgIEJhc2UuYXBpLmNoZWNrW3Jlc291cmNlXS5pbmRleE9mKGFjdGlvbikgIT09IC0xKSB7XHJcbiAgICAgICAgICAgIGNoZWNrID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZnVuY3Rpb24gZmV0Y2hVcmkocmVzb2x2ZSwgcmVqZWN0KSB7XHJcbiAgICAgICAgICAgIGxldCBpbml0RmV0Y2ggPSB7XHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6IHR5cGUsXHJcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiBteUhlYWRlcnMsXHJcbiAgICAgICAgICAgICAgICBtb2RlOiAnY29ycycsXHJcbiAgICAgICAgICAgICAgICBjYWNoZTogJ25vLWNhY2hlJ1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBsZXQgdXJpID0gYCR7QmFzZS5hcGkudXJsfS8ke3Jlc291cmNlfS8ke2FjdGlvbn1gO1xyXG4gICAgICAgICAgICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXMoYXJncyk7XHJcbiAgICAgICAgICAgIC8vIE9uIGNyw6llIGwnVVJMIGRlIGxhIHJlcXXDqnRlIGRlIHR5cGUgR0VUIGF2ZWMgbGVzIHBhcmFtw6h0cmVzXHJcbiAgICAgICAgICAgIGlmICh0eXBlID09PSAnR0VUJyAmJiBrZXlzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIGxldCBwYXJhbXMgPSBbXTtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGtleSBvZiBrZXlzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGFyYW1zLnB1c2goa2V5ICsgJz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KGFyZ3Nba2V5XSkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdXJpICs9ICc/JyArIHBhcmFtcy5qb2luKCcmJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoa2V5cy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBpbml0RmV0Y2guYm9keSA9IG5ldyBVUkxTZWFyY2hQYXJhbXMoYXJncyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZmV0Y2godXJpLCBpbml0RmV0Y2gpLnRoZW4ocmVzcG9uc2UgPT4ge1xyXG4gICAgICAgICAgICAgICAgQmFzZS5jb3VudGVyKys7IC8vIEluY3LDqW1lbnQgZHUgY29tcHRldXIgZGUgcmVxdcOqdGVzIMOgIGwnQVBJXHJcbiAgICAgICAgICAgICAgICBpZiAoQmFzZS5kZWJ1ZylcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnZmV0Y2ggKCVzICVzKSByZXNwb25zZSBzdGF0dXM6ICVkJywgdHlwZSwgdXJpLCByZXNwb25zZS5zdGF0dXMpO1xyXG4gICAgICAgICAgICAgICAgLy8gT24gcsOpY3Vww6hyZSBsZXMgZG9ubsOpZXMgZXQgbGVzIHRyYW5zZm9ybWUgZW4gb2JqZXRcclxuICAgICAgICAgICAgICAgIHJlc3BvbnNlLmpzb24oKS50aGVuKChkYXRhKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKEJhc2UuZGVidWcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdmZXRjaCAoJXMgJXMpIGRhdGEnLCB0eXBlLCB1cmksIGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIE9uIGfDqHJlIGxlIHJldG91ciBkJ2VycmV1cnMgZGUgbCdBUElcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YS5lcnJvcnMgIT09IHVuZGVmaW5lZCAmJiBkYXRhLmVycm9ycy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvZGUgPSBkYXRhLmVycm9yc1swXS5jb2RlLCB0ZXh0ID0gZGF0YS5lcnJvcnNbMF0udGV4dDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvZGUgPT09IDIwMDUgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChyZXNwb25zZS5zdGF0dXMgPT09IDQwMCAmJiBjb2RlID09PSAwICYmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dCA9PT0gXCJMJ3V0aWxpc2F0ZXVyIGEgZMOpasOgIG1hcnF1w6kgY2V0IMOpcGlzb2RlIGNvbW1lIHZ1LlwiKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KCdjaGFuZ2VTdGF0dXMnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChjb2RlID09IDIwMDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEFwcGVsIGRlIGwnYXV0aGVudGlmaWNhdGlvbiBwb3VyIG9idGVuaXIgdW4gdG9rZW4gdmFsaWRlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBCYXNlLmF1dGhlbnRpY2F0ZSgpLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEJhc2UuY2FsbEFwaSh0eXBlLCByZXNvdXJjZSwgYWN0aW9uLCBhcmdzLCBmb3JjZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZGF0YSA9PiByZXNvbHZlKGRhdGEpLCBlcnIgPT4gcmVqZWN0KGVycikpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgKGVycikgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoZGF0YS5lcnJvcnNbMF0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gT24gZ8OocmUgbGVzIGVycmV1cnMgcsOpc2VhdVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignRmV0Y2ggZXJyZXVyIG5ldHdvcmsnLCByZXNwb25zZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChyZXNwb25zZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShkYXRhKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KS5jYXRjaChlcnJvciA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoQmFzZS5kZWJ1ZylcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnSWwgeSBhIGV1IHVuIHByb2Jsw6htZSBhdmVjIGxcXCdvcMOpcmF0aW9uIGZldGNoOiAnICsgZXJyb3IubWVzc2FnZSk7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcclxuICAgICAgICAgICAgICAgIHJlamVjdChlcnJvci5tZXNzYWdlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChjaGVjaykge1xyXG4gICAgICAgICAgICAgICAgbGV0IHBhcmFtc0ZldGNoID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXHJcbiAgICAgICAgICAgICAgICAgICAgaGVhZGVyczogbXlIZWFkZXJzLFxyXG4gICAgICAgICAgICAgICAgICAgIG1vZGU6ICdjb3JzJyxcclxuICAgICAgICAgICAgICAgICAgICBjYWNoZTogJ25vLWNhY2hlJ1xyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIGlmIChCYXNlLmRlYnVnKVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuaW5mbygnJWNjYWxsIC9tZW1iZXJzL2lzX2FjdGl2ZScsICdjb2xvcjpibHVlJyk7XHJcbiAgICAgICAgICAgICAgICBmZXRjaChgJHtCYXNlLmFwaS51cmx9L21lbWJlcnMvaXNfYWN0aXZlYCwgcGFyYW1zRmV0Y2gpLnRoZW4ocmVzcCA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgQmFzZS5jb3VudGVyKys7IC8vIEluY3LDqW1lbnQgZHUgY29tcHRldXIgZGUgcmVxdcOqdGVzIMOgIGwnQVBJXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFyZXNwLm9rKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEFwcGVsIGRlIGwnYXV0aGVudGlmaWNhdGlvbiBwb3VyIG9idGVuaXIgdW4gdG9rZW4gdmFsaWRlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIEJhc2UuYXV0aGVudGljYXRlKCkudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBPbiBtZXQgw6Agam91ciBsZSB0b2tlbiBwb3VyIGxlIHByb2NoYWluIGFwcGVsIMOgIGwnQVBJXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBteUhlYWRlcnNbJ1gtQmV0YVNlcmllcy1Ub2tlbiddID0gQmFzZS50b2tlbjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZldGNoVXJpKHJlc29sdmUsIHJlamVjdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLmNhdGNoKGVyciA9PiByZWplY3QoZXJyKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZmV0Y2hVcmkocmVzb2x2ZSwgcmVqZWN0KTtcclxuICAgICAgICAgICAgICAgIH0pLmNhdGNoKGVycm9yID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoQmFzZS5kZWJ1ZylcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0lsIHkgYSBldSB1biBwcm9ibMOobWUgYXZlYyBsXFwnb3DDqXJhdGlvbiBmZXRjaDogJyArIGVycm9yLm1lc3NhZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnJvci5tZXNzYWdlKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZmV0Y2hVcmkocmVzb2x2ZSwgcmVqZWN0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgLypcclxuICAgICAgICAgICAgICAgICAgICBQUk9QRVJUSUVTXHJcbiAgICAqL1xyXG4gICAgZGVzY3JpcHRpb247XHJcbiAgICBjaGFyYWN0ZXJzO1xyXG4gICAgY29tbWVudHM7XHJcbiAgICBpZDtcclxuICAgIG9iak5vdGU7XHJcbiAgICByZXNvdXJjZV91cmw7XHJcbiAgICB0aXRsZTtcclxuICAgIHVzZXI7XHJcbiAgICBtZWRpYVR5cGU7XHJcbiAgICBfZWx0O1xyXG4gICAgX2xpc3RlbmVycztcclxuICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgICAgTUVUSE9EU1xyXG4gICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKGRhdGEpIHtcclxuICAgICAgICBpZiAoIShkYXRhIGluc3RhbmNlb2YgT2JqZWN0KSkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJkYXRhIGlzIG5vdCBhbiBvYmplY3RcIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2luaXRMaXN0ZW5lcnMoKVxyXG4gICAgICAgICAgICAuZmlsbChkYXRhKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogUmVtcGxpdCBsJ29iamV0IGF2ZWMgbGVzIGRvbm7DqWVzIGZvdXJuaXQgZW4gcGFyYW3DqHRyZVxyXG4gICAgICogQHBhcmFtICB7T2JqfSBkYXRhIExlcyBkb25uw6llcyBwcm92ZW5hbnQgZGUgbCdBUElcclxuICAgICAqIEByZXR1cm5zIHRoaXNcclxuICAgICAqL1xyXG4gICAgZmlsbChkYXRhKSB7XHJcbiAgICAgICAgdGhpcy5pZCA9IHBhcnNlSW50KGRhdGEuaWQsIDEwKTtcclxuICAgICAgICB0aGlzLmNoYXJhY3RlcnMgPSBbXTtcclxuICAgICAgICBpZiAoZGF0YS5jaGFyYWN0ZXJzICYmIGRhdGEuY2hhcmFjdGVycyBpbnN0YW5jZW9mIEFycmF5KSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGMgPSAwOyBjIDwgZGF0YS5jaGFyYWN0ZXJzLmxlbmd0aDsgYysrKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNoYXJhY3RlcnMucHVzaChuZXcgQ2hhcmFjdGVyXzEuQ2hhcmFjdGVyKGRhdGEuY2hhcmFjdGVyc1tjXSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuY29tbWVudHMgPSBbXTtcclxuICAgICAgICBpZiAoZGF0YS5jb21tZW50cyAmJiBkYXRhLmNvbW1lbnRzIGluc3RhbmNlb2YgQXJyYXkpIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgYyA9IDA7IGMgPCBkYXRhLmNvbW1lbnRzLmxlbmd0aDsgYysrKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbW1lbnRzLnB1c2gobmV3IENvbW1lbnRfMS5Db21tZW50QlMoZGF0YS5jb21tZW50c1tjXSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMub2JqTm90ZSA9IChkYXRhLm5vdGUpID8gbmV3IE5vdGVfMS5Ob3RlKGRhdGEubm90ZSkgOiBuZXcgTm90ZV8xLk5vdGUoZGF0YS5ub3Rlcyk7XHJcbiAgICAgICAgdGhpcy5yZXNvdXJjZV91cmwgPSBkYXRhLnJlc291cmNlX3VybDtcclxuICAgICAgICB0aGlzLnRpdGxlID0gZGF0YS50aXRsZTtcclxuICAgICAgICB0aGlzLnVzZXIgPSBuZXcgVXNlcl8xLlVzZXIoZGF0YS51c2VyKTtcclxuICAgICAgICB0aGlzLmRlc2NyaXB0aW9uID0gZGF0YS5kZXNjcmlwdGlvbjtcclxuICAgICAgICB0aGlzLnNhdmUoKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogSW5pdGlhbGl6ZSBsZSB0YWJsZWF1IGRlcyDDqWNvdXRldXJzIGQnw6l2w6huZW1lbnRzXHJcbiAgICAgKiBAcmV0dXJucyB0aGlzXHJcbiAgICAgKi9cclxuICAgIF9pbml0TGlzdGVuZXJzKCkge1xyXG4gICAgICAgIHRoaXMuX2xpc3RlbmVycyA9IHt9O1xyXG4gICAgICAgIGZvciAobGV0IGUgPSAwOyBlIDwgQmFzZS5FdmVudFR5cGVzLmxlbmd0aDsgZSsrKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2xpc3RlbmVyc1tCYXNlLkV2ZW50VHlwZXNbZV1dID0gbmV3IEFycmF5KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBQZXJtZXQgZCdham91dGVyIHVuIGxpc3RlbmVyIHN1ciB1biB0eXBlIGQnw6l2ZW5lbWVudFxyXG4gICAgICogQHBhcmFtICB7c3RyaW5nfSAgIG5hbWUgTGUgdHlwZSBkJ8OpdmVuZW1lbnRcclxuICAgICAqIEBwYXJhbSAge0Z1bmN0aW9ufSBmbiAgIExhIGZvbmN0aW9uIMOgIGFwcGVsZXJcclxuICAgICAqIEByZXR1cm4ge3RoaXN9ICAgICAgICAgIEwnaW5zdGFuY2UgZHUgbcOpZGlhXHJcbiAgICAgKi9cclxuICAgIGFkZExpc3RlbmVyKG5hbWUsIGZuKSB7XHJcbiAgICAgICAgLy8gT24gdsOpcmlmaWUgcXVlIGxlIHR5cGUgZCdldmVudCBlc3QgcHJpcyBlbiBjaGFyZ2VcclxuICAgICAgICBpZiAoQmFzZS5FdmVudFR5cGVzLmluZGV4T2YobmFtZSkgPCAwKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgJHtuYW1lfSBuZSBmYWl0IHBhcyBwYXJ0aXQgZGVzIGV2ZW50cyBnw6lyw6lzIHBhciBjZXR0ZSBjbGFzc2VgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuX2xpc3RlbmVyc1tuYW1lXSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2xpc3RlbmVyc1tuYW1lXSA9IG5ldyBBcnJheSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9saXN0ZW5lcnNbbmFtZV0ucHVzaChmbik7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFBlcm1ldCBkZSBzdXBwcmltZXIgdW4gbGlzdGVuZXIgc3VyIHVuIHR5cGUgZCfDqXZlbmVtZW50XHJcbiAgICAgKiBAcGFyYW0gIHtzdHJpbmd9ICAgbmFtZSBMZSB0eXBlIGQnw6l2ZW5lbWVudFxyXG4gICAgICogQHBhcmFtICB7RnVuY3Rpb259IGZuICAgTGEgZm9uY3Rpb24gcXVpIMOpdGFpdCBhcHBlbMOpZVxyXG4gICAgICogQHJldHVybiB7QmFzZX0gICAgICAgICAgTCdpbnN0YW5jZSBkdSBtw6lkaWFcclxuICAgICAqL1xyXG4gICAgcmVtb3ZlTGlzdGVuZXIobmFtZSwgZm4pIHtcclxuICAgICAgICBpZiAodGhpcy5fbGlzdGVuZXJzW25hbWVdICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgbCA9IDA7IGwgPCB0aGlzLl9saXN0ZW5lcnNbbmFtZV0ubGVuZ3RoOyBsKyspIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9saXN0ZW5lcnNbbmFtZV1bbF0gPT09IGZuKVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2xpc3RlbmVyc1tuYW1lXS5zcGxpY2UobCwgMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIEFwcGVsIGxlcyBsaXN0ZW5lcnMgcG91ciB1biB0eXBlIGQnw6l2ZW5lbWVudFxyXG4gICAgICogQHBhcmFtICB7c3RyaW5nfSBuYW1lIExlIHR5cGUgZCfDqXZlbmVtZW50XHJcbiAgICAgKiBAcmV0dXJuIHtTaG93fSAgICAgICAgTCdpbnN0YW5jZSBTaG93XHJcbiAgICAgKi9cclxuICAgIF9jYWxsTGlzdGVuZXJzKG5hbWUpIHtcclxuICAgICAgICBpZiAodGhpcy5fbGlzdGVuZXJzW25hbWVdICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgbCA9IDA7IGwgPCB0aGlzLl9saXN0ZW5lcnNbbmFtZV0ubGVuZ3RoOyBsKyspIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2xpc3RlbmVyc1tuYW1lXVtsXS5jYWxsKHRoaXMsIHRoaXMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBTYXV2ZWdhcmRlIGwnb2JqZXQgZW4gY2FjaGVcclxuICAgICAqIEByZXR1cm4gdGhpc1xyXG4gICAgICovXHJcbiAgICBzYXZlKCkge1xyXG4gICAgICAgIGlmIChCYXNlLmNhY2hlIGluc3RhbmNlb2YgQ2FjaGVfMS5DYWNoZVVTKSB7XHJcbiAgICAgICAgICAgIEJhc2UuY2FjaGUuc2V0KHRoaXMubWVkaWFUeXBlLnBsdXJhbCwgdGhpcy5pZCwgdGhpcyk7XHJcbiAgICAgICAgICAgIHRoaXMuX2NhbGxMaXN0ZW5lcnMoRXZlbnRUeXBlcy5TQVZFKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFJldG91cm5lIGxlIERPTUVsZW1lbnQgY29ycmVzcG9uZGFudCBhdSBtw6lkaWFcclxuICAgICAqIEByZXR1cm5zIHtKUXVlcnl9IExlIERPTUVsZW1lbnQgalF1ZXJ5XHJcbiAgICAgKi9cclxuICAgIGdldCBlbHQoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2VsdDtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogRMOpZmluaXQgbGUgRE9NRWxlbWVudCBkZSByw6lmw6lyZW5jZSBwb3VyIGNlIG3DqWRpYVxyXG4gICAgICogQHBhcmFtICB7SlF1ZXJ5fSBlbHQgRE9NRWxlbWVudCBhdXF1ZWwgZXN0IHJhdHRhY2jDqSBsZSBtw6lkaWFcclxuICAgICAqL1xyXG4gICAgc2V0IGVsdChlbHQpIHtcclxuICAgICAgICB0aGlzLl9lbHQgPSBlbHQ7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFJldG91cm5lIGxlIG5vbWJyZSBkJ2FjdGV1cnMgcsOpZsOpcmVuY8OpcyBkYW5zIGNlIG3DqWRpYVxyXG4gICAgICogQHJldHVybnMge251bWJlcn1cclxuICAgICAqL1xyXG4gICAgZ2V0IG5iQ2hhcmFjdGVycygpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jaGFyYWN0ZXJzLmxlbmd0aDtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogUmV0b3VybmUgbGUgbm9tYnJlIGRlIGNvbW1lbnRhaXJlcyBwb3VyIGNlIG3DqWRpYVxyXG4gICAgICogQHJldHVybnMgbnVtYmVyXHJcbiAgICAgKi9cclxuICAgIGdldCBuYkNvbW1lbnRzKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNvbW1lbnRzLmxlbmd0aDtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogRMOpY29kZSBsZSB0aXRyZSBkZSBsYSBwYWdlXHJcbiAgICAgKiBAcmV0dXJuIHtCYXNlfSBUaGlzXHJcbiAgICAgKi9cclxuICAgIGRlY29kZVRpdGxlKCkge1xyXG4gICAgICAgIGxldCAkZWx0ID0gdGhpcy5lbHQuZmluZCgnLmJsb2NrSW5mb3JtYXRpb25zX190aXRsZScpLCB0aXRsZSA9ICRlbHQudGV4dCgpO1xyXG4gICAgICAgIGlmICgvJiMvLnRlc3QodGl0bGUpKSB7XHJcbiAgICAgICAgICAgICRlbHQudGV4dCgkKCc8dGV4dGFyZWEgLz4nKS5odG1sKHRpdGxlKS50ZXh0KCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogQWpvdXRlIGxlIG5vbWJyZSBkZSB2b3RlcyDDoCBsYSBub3RlIGRhbnMgbCdhdHRyaWJ1dCB0aXRsZSBkZSBsYSBiYWxpc2VcclxuICAgICAqIGNvbnRlbmFudCBsYSByZXByw6lzZW50YXRpb24gZGUgbGEgbm90ZSBkZSBsYSByZXNzb3VyY2VcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gIHtCb29sZWFufSBjaGFuZ2UgIEluZGlxdWUgc2kgb24gZG9pdCBjaGFuZ2VyIGwnYXR0cmlidXQgdGl0bGUgZHUgRE9NRWxlbWVudFxyXG4gICAgICogQHJldHVybiB7U3RyaW5nfSAgICAgICAgIExlIHRpdHJlIG1vZGlmacOpIGRlIGxhIG5vdGVcclxuICAgICAqL1xyXG4gICAgY2hhbmdlVGl0bGVOb3RlKGNoYW5nZSA9IHRydWUpIHtcclxuICAgICAgICBjb25zdCAkZWx0ID0gdGhpcy5lbHQuZmluZCgnLmpzLXJlbmRlci1zdGFycycpO1xyXG4gICAgICAgIGlmICh0aGlzLm9iak5vdGUubWVhbiA8PSAwIHx8IHRoaXMub2JqTm90ZS50b3RhbCA8PSAwKSB7XHJcbiAgICAgICAgICAgIGlmIChjaGFuZ2UpXHJcbiAgICAgICAgICAgICAgICAkZWx0LmF0dHIoJ3RpdGxlJywgJ0F1Y3VuIHZvdGUnKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCB2b3RlcyA9ICd2b3RlJyArICh0aGlzLm9iak5vdGUudG90YWwgPiAxID8gJ3MnIDogJycpLCBcclxuICAgICAgICAvLyBPbiBtZXQgZW4gZm9ybWUgbGUgbm9tYnJlIGRlIHZvdGVzXHJcbiAgICAgICAgdG90YWwgPSBuZXcgSW50bC5OdW1iZXJGb3JtYXQoJ2ZyLUZSJywgeyBzdHlsZTogJ2RlY2ltYWwnLCB1c2VHcm91cGluZzogdHJ1ZSB9KVxyXG4gICAgICAgICAgICAuZm9ybWF0KHRoaXMub2JqTm90ZS50b3RhbCksIFxyXG4gICAgICAgIC8vIE9uIGxpbWl0ZSBsZSBub21icmUgZGUgY2hpZmZyZSBhcHLDqHMgbGEgdmlyZ3VsZVxyXG4gICAgICAgIG5vdGUgPSB0aGlzLm9iak5vdGUubWVhbi50b0ZpeGVkKDEpO1xyXG4gICAgICAgIGxldCB0aXRsZSA9IGAke3RvdGFsfSAke3ZvdGVzfSA6ICR7bm90ZX0gLyA1YDtcclxuICAgICAgICAvLyBPbiBham91dGUgbGEgbm90ZSBkdSBtZW1icmUgY29ubmVjdMOpLCBzaSBpbCBhIHZvdMOpXHJcbiAgICAgICAgaWYgKEJhc2UudXNlcklkZW50aWZpZWQoKSAmJiB0aGlzLm9iak5vdGUudXNlciA+IDApIHtcclxuICAgICAgICAgICAgdGl0bGUgKz0gYCwgdm90cmUgbm90ZTogJHt0aGlzLm9iak5vdGUudXNlcn1gO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoY2hhbmdlKSB7XHJcbiAgICAgICAgICAgICRlbHQuYXR0cigndGl0bGUnLCB0aXRsZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aXRsZTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogQWpvdXRlIGxlIG5vbWJyZSBkZSB2b3RlcyDDoCBsYSBub3RlIGRlIGxhIHJlc3NvdXJjZVxyXG4gICAgICogQHJldHVybiB7QmFzZX1cclxuICAgICAqL1xyXG4gICAgYWRkTnVtYmVyVm90ZXJzKCkge1xyXG4gICAgICAgIGNvbnN0IF90aGlzID0gdGhpcztcclxuICAgICAgICBjb25zdCB2b3RlcyA9ICQoJy5zdGFycy5qcy1yZW5kZXItc3RhcnMnKTsgLy8gRWxlbWVudEhUTUwgYXlhbnQgcG91ciBhdHRyaWJ1dCBsZSB0aXRyZSBhdmVjIGxhIG5vdGUgZGUgbGEgc8OpcmllXHJcbiAgICAgICAgaWYgKEJhc2UuZGVidWcpXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdhZGROdW1iZXJWb3RlcnMnKTtcclxuICAgICAgICAvLyBpZiAoZGVidWcpIGNvbnNvbGUubG9nKCdhZGROdW1iZXJWb3RlcnMgTWVkaWEuY2FsbEFwaScsIGRhdGEpO1xyXG4gICAgICAgIGNvbnN0IHRpdGxlID0gdGhpcy5jaGFuZ2VUaXRsZU5vdGUodHJ1ZSk7XHJcbiAgICAgICAgLy8gT24gYWpvdXRlIHVuIG9ic2VydmVyIHN1ciBsJ2F0dHJpYnV0IHRpdGxlIGRlIGxhIG5vdGUsIGVuIGNhcyBkZSBjaGFuZ2VtZW50IGxvcnMgZCd1biB2b3RlXHJcbiAgICAgICAgbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKG11dGF0aW9uc0xpc3QpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgY2hhbmdlVGl0bGVNdXRhdGlvbiA9ICgpID0+IHtcclxuICAgICAgICAgICAgICAgIC8vIE9uIG1ldCDDoCBqb3VyIGxlIG5vbWJyZSBkZSB2b3RhbnRzLCBhaW5zaSBxdWUgbGEgbm90ZSBkdSBtZW1icmUgY29ubmVjdMOpXHJcbiAgICAgICAgICAgICAgICBjb25zdCB1cFRpdGxlID0gX3RoaXMuY2hhbmdlVGl0bGVOb3RlKGZhbHNlKTtcclxuICAgICAgICAgICAgICAgIC8vIE9uIMOpdml0ZSB1bmUgYm91Y2xlIGluZmluaWVcclxuICAgICAgICAgICAgICAgIGlmICh1cFRpdGxlICE9PSB0aXRsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZvdGVzLmF0dHIoJ3RpdGxlJywgdXBUaXRsZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGxldCBtdXRhdGlvbjtcclxuICAgICAgICAgICAgZm9yIChtdXRhdGlvbiBvZiBtdXRhdGlvbnNMaXN0KSB7XHJcbiAgICAgICAgICAgICAgICAvLyBPbiB2w6lyaWZpZSBzaSBsZSB0aXRyZSBhIMOpdMOpIG1vZGlmacOpXHJcbiAgICAgICAgICAgICAgICAvLyBAVE9ETzogQSB0ZXN0ZXJcclxuICAgICAgICAgICAgICAgIGlmICghL3ZvdGUvLnRlc3QobXV0YXRpb24udGFyZ2V0Lm5vZGVWYWx1ZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBjaGFuZ2VUaXRsZU11dGF0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KS5vYnNlcnZlKHZvdGVzLmdldCgwKSwge1xyXG4gICAgICAgICAgICBhdHRyaWJ1dGVzOiB0cnVlLFxyXG4gICAgICAgICAgICBjaGlsZExpc3Q6IGZhbHNlLFxyXG4gICAgICAgICAgICBjaGFyYWN0ZXJEYXRhOiBmYWxzZSxcclxuICAgICAgICAgICAgc3VidHJlZTogZmFsc2UsXHJcbiAgICAgICAgICAgIGF0dHJpYnV0ZUZpbHRlcjogWyd0aXRsZSddXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5CYXNlID0gQmFzZTtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxuZXhwb3J0cy5DYWNoZVVTID0gZXhwb3J0cy5EYXRhVHlwZXNDYWNoZSA9IHZvaWQgMDtcclxudmFyIERhdGFUeXBlc0NhY2hlO1xyXG4oZnVuY3Rpb24gKERhdGFUeXBlc0NhY2hlKSB7XHJcbiAgICBEYXRhVHlwZXNDYWNoZVtcInNob3dzXCJdID0gXCJzaG93c1wiO1xyXG4gICAgRGF0YVR5cGVzQ2FjaGVbXCJlcGlzb2Rlc1wiXSA9IFwiZXBpc29kZXNcIjtcclxuICAgIERhdGFUeXBlc0NhY2hlW1wibW92aWVzXCJdID0gXCJtb3ZpZXNcIjtcclxuICAgIERhdGFUeXBlc0NhY2hlW1wibWVtYmVyc1wiXSA9IFwibWVtYmVyc1wiO1xyXG59KShEYXRhVHlwZXNDYWNoZSA9IGV4cG9ydHMuRGF0YVR5cGVzQ2FjaGUgfHwgKGV4cG9ydHMuRGF0YVR5cGVzQ2FjaGUgPSB7fSkpO1xyXG4vKipcclxuICogQGNsYXNzIEdlc3Rpb24gZHUgQ2FjaGUgcG91ciBsZSBzY3JpcHRcclxuICovXHJcbmNsYXNzIENhY2hlVVMge1xyXG4gICAgX2RhdGE7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5faW5pdCgpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBJbml0aWFsaXplIGxlIGNhY2hlIHBvdXIgY2hhcXVlIHR5cGVcclxuICAgICAqIEByZXR1cm5zIHRoaXNcclxuICAgICAqL1xyXG4gICAgX2luaXQoKSB7XHJcbiAgICAgICAgdGhpcy5fZGF0YVtEYXRhVHlwZXNDYWNoZS5zaG93c10gPSB7fTtcclxuICAgICAgICB0aGlzLl9kYXRhW0RhdGFUeXBlc0NhY2hlLmVwaXNvZGVzXSA9IHt9O1xyXG4gICAgICAgIHRoaXMuX2RhdGFbRGF0YVR5cGVzQ2FjaGUubW92aWVzXSA9IHt9O1xyXG4gICAgICAgIHRoaXMuX2RhdGFbRGF0YVR5cGVzQ2FjaGUubWVtYmVyc10gPSB7fTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhbiBBcnJheSBvZiBhbGwgY3VycmVudGx5IHNldCBrZXlzLlxyXG4gICAgICogQHJldHVybnMge0FycmF5fSBjYWNoZSBrZXlzXHJcbiAgICAgKi9cclxuICAgIGtleXModHlwZSA9IG51bGwpIHtcclxuICAgICAgICBpZiAoIXR5cGUpXHJcbiAgICAgICAgICAgIHJldHVybiBPYmplY3Qua2V5cyh0aGlzLl9kYXRhKTtcclxuICAgICAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcy5fZGF0YVt0eXBlXSk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIENoZWNrcyBpZiBhIGtleSBpcyBjdXJyZW50bHkgc2V0IGluIHRoZSBjYWNoZS5cclxuICAgICAqIEBwYXJhbSB7RGF0YVR5cGVzQ2FjaGV9ICB0eXBlIExlIHR5cGUgZGUgcmVzc291cmNlXHJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ3xudW1iZXJ9ICAga2V5ICB0aGUga2V5IHRvIGxvb2sgZm9yXHJcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSBpZiBzZXQsIGZhbHNlIG90aGVyd2lzZVxyXG4gICAgICovXHJcbiAgICBoYXModHlwZSwga2V5KSB7XHJcbiAgICAgICAgcmV0dXJuICh0aGlzLl9kYXRhW3R5cGVdICE9PSB1bmRlZmluZWQgJiYgdGhpcy5fZGF0YVt0eXBlXVtrZXldICE9PSB1bmRlZmluZWQpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBDbGVhcnMgYWxsIGNhY2hlIGVudHJpZXMuXHJcbiAgICAgKiBAcGFyYW0gICB7RGF0YVR5cGVzQ2FjaGV9IFt0eXBlPW51bGxdIExlIHR5cGUgZGUgcmVzc291cmNlIMOgIG5ldHRveWVyXHJcbiAgICAgKiBAcmV0dXJucyB0aGlzXHJcbiAgICAgKi9cclxuICAgIGNsZWFyKHR5cGUgPSBudWxsKSB7XHJcbiAgICAgICAgLy8gT24gbmV0dG9pZSBqdXN0ZSB1biB0eXBlIGRlIHJlc3NvdXJjZVxyXG4gICAgICAgIGlmICh0eXBlICYmIHRoaXMuX2RhdGFbdHlwZV0gIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBrZXkgaW4gdGhpcy5fZGF0YVt0eXBlXSkge1xyXG4gICAgICAgICAgICAgICAgZGVsZXRlIHRoaXMuX2RhdGFbdHlwZV1ba2V5XTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBPbiBuZXR0b2llIGwnZW5zZW1ibGUgZHUgY2FjaGVcclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogR2V0cyB0aGUgY2FjaGUgZW50cnkgZm9yIHRoZSBnaXZlbiBrZXkuXHJcbiAgICAgKiBAcGFyYW0ge0RhdGFUeXBlc0NhY2hlfSAgdHlwZSBMZSB0eXBlIGRlIHJlc3NvdXJjZVxyXG4gICAgICogQHBhcmFtIHtTdHJpbmd8bnVtYmVyfSAgIGtleSAgdGhlIGNhY2hlIGtleVxyXG4gICAgICogQHJldHVybnMgeyp9IHRoZSBjYWNoZSBlbnRyeSBpZiBzZXQsIG9yIHVuZGVmaW5lZCBvdGhlcndpc2VcclxuICAgICAqL1xyXG4gICAgZ2V0KHR5cGUsIGtleSkge1xyXG4gICAgICAgIGlmICh0aGlzLmhhcyh0eXBlLCBrZXkpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9kYXRhW3R5cGVdW2tleV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBjYWNoZSBlbnRyeSBpZiBzZXQsIG9yIGEgZGVmYXVsdCB2YWx1ZSBvdGhlcndpc2UuXHJcbiAgICAgKiBAcGFyYW0ge0RhdGFUeXBlc0NhY2hlfSAgdHlwZSBMZSB0eXBlIGRlIHJlc3NvdXJjZVxyXG4gICAgICogQHBhcmFtIHtTdHJpbmd8bnVtYmVyfSAgIGtleSAgdGhlIGtleSB0byByZXRyaWV2ZVxyXG4gICAgICogQHBhcmFtIHsqfSAgICAgICAgICAgICAgIGRlZiAgdGhlIGRlZmF1bHQgdmFsdWUgdG8gcmV0dXJuIGlmIHVuc2V0XHJcbiAgICAgKiBAcmV0dXJucyB7Kn0gdGhlIGNhY2hlIGVudHJ5IGlmIHNldCwgb3IgdGhlIGRlZmF1bHQgdmFsdWUgcHJvdmlkZWQuXHJcbiAgICAgKi9cclxuICAgIGdldE9yRGVmYXVsdCh0eXBlLCBrZXksIGRlZikge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmhhcyh0eXBlLCBrZXkpID8gdGhpcy5nZXQodHlwZSwga2V5KSA6IGRlZjtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogU2V0cyBhIGNhY2hlIGVudHJ5IHdpdGggdGhlIHByb3ZpZGVkIGtleSBhbmQgdmFsdWUuXHJcbiAgICAgKiBAcGFyYW0ge0RhdGFUeXBlc0NhY2hlfSAgdHlwZSAgTGUgdHlwZSBkZSByZXNzb3VyY2VcclxuICAgICAqIEBwYXJhbSB7U3RyaW5nfG51bWJlcn0gICBrZXkgICB0aGUga2V5IHRvIHNldFxyXG4gICAgICogQHBhcmFtIHsqfSAgICAgICAgICAgICAgIHZhbHVlIHRoZSB2YWx1ZSB0byBzZXRcclxuICAgICAqIEByZXR1cm5zIHRoaXNcclxuICAgICAqL1xyXG4gICAgc2V0KHR5cGUsIGtleSwgdmFsdWUpIHtcclxuICAgICAgICBpZiAodGhpcy5fZGF0YVt0eXBlXSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2RhdGFbdHlwZV1ba2V5XSA9IHZhbHVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogUmVtb3ZlcyB0aGUgY2FjaGUgZW50cnkgZm9yIHRoZSBnaXZlbiBrZXkuXHJcbiAgICAgKiBAcGFyYW0ge0RhdGFUeXBlc0NhY2hlfSAgdHlwZSAgTGUgdHlwZSBkZSByZXNzb3VyY2VcclxuICAgICAqIEBwYXJhbSB7U3RyaW5nfG51bWJlcn0gICBrZXkgdGhlIGtleSB0byByZW1vdmVcclxuICAgICAqIEByZXR1cm5zIHRoaXNcclxuICAgICAqL1xyXG4gICAgcmVtb3ZlKHR5cGUsIGtleSkge1xyXG4gICAgICAgIGlmICh0aGlzLmhhcyh0eXBlLCBrZXkpKSB7XHJcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl9kYXRhW3R5cGVdW2tleV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMuQ2FjaGVVUyA9IENhY2hlVVM7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbmV4cG9ydHMuQ2hhcmFjdGVyID0gdm9pZCAwO1xyXG5jbGFzcyBDaGFyYWN0ZXIge1xyXG4gICAgY29uc3RydWN0b3IoZGF0YSkge1xyXG4gICAgICAgIHRoaXMuYWN0b3IgPSBkYXRhLmFjdG9yO1xyXG4gICAgICAgIHRoaXMucGljdHVyZSA9IGRhdGEucGljdHVyZTtcclxuICAgICAgICB0aGlzLm5hbWUgPSBkYXRhLm5hbWU7XHJcbiAgICAgICAgdGhpcy5ndWVzdCA9IGRhdGEuZ3Vlc3Q7XHJcbiAgICAgICAgdGhpcy5pZCA9IHBhcnNlSW50KGRhdGEuaWQsIDEwKTtcclxuICAgICAgICB0aGlzLmRlc2NyaXB0aW9uID0gZGF0YS5kZXNjcmlwdGlvbjtcclxuICAgICAgICB0aGlzLnJvbGUgPSBkYXRhLnJvbGU7XHJcbiAgICAgICAgdGhpcy5zaG93X2lkID0gcGFyc2VJbnQoZGF0YS5zaG93X2lkLCAxMCk7XHJcbiAgICAgICAgdGhpcy5tb3ZpZV9pZCA9IHBhcnNlSW50KGRhdGEubW92aWVfaWQsIDEwKTtcclxuICAgIH1cclxuICAgIGFjdG9yO1xyXG4gICAgZGVzY3JpcHRpb247XHJcbiAgICBndWVzdDtcclxuICAgIGlkO1xyXG4gICAgbmFtZTtcclxuICAgIHBpY3R1cmU7XHJcbiAgICByb2xlO1xyXG4gICAgc2hvd19pZDtcclxuICAgIG1vdmllX2lkO1xyXG59XHJcbmV4cG9ydHMuQ2hhcmFjdGVyID0gQ2hhcmFjdGVyO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG5leHBvcnRzLkNvbW1lbnRCUyA9IHZvaWQgMDtcclxuY2xhc3MgQ29tbWVudEJTIHtcclxuICAgIGNvbnN0cnVjdG9yKGRhdGEpIHtcclxuICAgICAgICB0aGlzLmlkID0gcGFyc2VJbnQoZGF0YS5pZCwgMTApO1xyXG4gICAgICAgIHRoaXMucmVmZXJlbmNlID0gZGF0YS5yZWZlcmVuY2U7XHJcbiAgICAgICAgdGhpcy50eXBlID0gZGF0YS50eXBlO1xyXG4gICAgICAgIHRoaXMucmVmX2lkID0gcGFyc2VJbnQoZGF0YS5yZWZfaWQsIDEwKTtcclxuICAgICAgICB0aGlzLnVzZXJfaWQgPSBwYXJzZUludChkYXRhLnVzZXJfaWQsIDEwKTtcclxuICAgICAgICB0aGlzLmxvZ2luID0gZGF0YS5sb2dpbjtcclxuICAgICAgICB0aGlzLmF2YXRhciA9IGRhdGEuYXZhdGFyO1xyXG4gICAgICAgIHRoaXMuZGF0ZSA9IG5ldyBEYXRlKGRhdGEuZGF0ZSk7XHJcbiAgICAgICAgdGhpcy50ZXh0ID0gZGF0YS50ZXh0O1xyXG4gICAgICAgIHRoaXMuaW5uZXJfaWQgPSBwYXJzZUludChkYXRhLmlubmVyX2lkLCAxMCk7XHJcbiAgICAgICAgdGhpcy5pbl9yZXBseV90byA9IHBhcnNlSW50KGRhdGEuaW5fcmVwbHlfdG8sIDEwKTtcclxuICAgICAgICB0aGlzLnVzZXJfbm90ZSA9IHBhcnNlSW50KGRhdGEudXNlcl9ub3RlLCAxMCk7XHJcbiAgICB9XHJcbiAgICBpZDtcclxuICAgIHJlZmVyZW5jZTtcclxuICAgIHR5cGU7XHJcbiAgICByZWZfaWQ7XHJcbiAgICB1c2VyX2lkO1xyXG4gICAgbG9naW47XHJcbiAgICBhdmF0YXI7XHJcbiAgICBkYXRlO1xyXG4gICAgdGV4dDtcclxuICAgIGlubmVyX2lkO1xyXG4gICAgaW5fcmVwbHlfdG87XHJcbiAgICB1c2VyX25vdGU7XHJcbn1cclxuZXhwb3J0cy5Db21tZW50QlMgPSBDb21tZW50QlM7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbmV4cG9ydHMuRXBpc29kZSA9IGV4cG9ydHMuU2Vhc29uID0gdm9pZCAwO1xyXG5jb25zdCBCYXNlXzEgPSByZXF1aXJlKFwiLi9CYXNlXCIpO1xyXG5jb25zdCBDYWNoZV8xID0gcmVxdWlyZShcIi4vQ2FjaGVcIik7XHJcbmNvbnN0IFNob3dfMSA9IHJlcXVpcmUoXCIuL1Nob3dcIik7XHJcbmNvbnN0IFN1YnRpdGxlXzEgPSByZXF1aXJlKFwiLi9TdWJ0aXRsZVwiKTtcclxuY2xhc3MgU2Vhc29uIHtcclxuICAgIG51bWJlcjtcclxuICAgIGVwaXNvZGVzO1xyXG4gICAgX3Nob3c7XHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhLCBzaG93KSB7XHJcbiAgICAgICAgdGhpcy5udW1iZXIgPSBwYXJzZUludChkYXRhLm51bWJlciwgMTApO1xyXG4gICAgICAgIHRoaXMuX3Nob3cgPSBzaG93O1xyXG4gICAgICAgIGlmIChkYXRhLmVwaXNvZGVzICYmIGRhdGEuZXBpc29kZXMgaW5zdGFuY2VvZiBBcnJheSAmJiBkYXRhLmVwaXNvZGVzWzBdIGluc3RhbmNlb2YgRXBpc29kZSkge1xyXG4gICAgICAgICAgICB0aGlzLmVwaXNvZGVzID0gZGF0YS5lcGlzb2RlcztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFLDqWN1cMOocmUgbGVzIMOpcGlzb2RlcyBkZSBsYSBzYWlzb24gc3VyIGwnQVBJXHJcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZTxTZWFzb24+fVxyXG4gICAgICovXHJcbiAgICBmZXRjaEVwaXNvZGVzKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5udW1iZXIgfHwgdGhpcy5udW1iZXIgPD0gMCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3NlYXNvbiBudW1iZXIgaW5jb3JyZWN0Jyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IF90aGlzID0gdGhpcztcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICBCYXNlXzEuQmFzZS5jYWxsQXBpKCdHRVQnLCAnc2hvd3MnLCAnZXBpc29kZXMnLCB7IGlkOiBfdGhpcy5fc2hvdy5pZCwgc2Vhc29uOiBfdGhpcy5udW1iZXIgfSwgdHJ1ZSlcclxuICAgICAgICAgICAgICAgIC50aGVuKGRhdGEgPT4ge1xyXG4gICAgICAgICAgICAgICAgX3RoaXMuZXBpc29kZXMgPSBbXTtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGUgPSAwOyBlIDwgZGF0YS5lcGlzb2Rlcy5sZW5ndGg7IGUrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIF90aGlzLmVwaXNvZGVzLnB1c2gobmV3IEVwaXNvZGUoZGF0YS5lcGlzb2Rlc1tlXSwgX3RoaXMuX3Nob3cpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJlc29sdmUoX3RoaXMpO1xyXG4gICAgICAgICAgICB9LCBlcnIgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmVqZWN0KGVycik7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXRvdXJuZSBsJ8OpcGlzb2RlIGNvcnJlc3BvbmRhbnQgw6AgbCdpZGVudGlmaWFudCBmb3Vybml0XHJcbiAgICAgKiBAcGFyYW0gIHtudW1iZXJ9IGlkXHJcbiAgICAgKiBAcmV0dXJucyB7RXBpc29kZX1cclxuICAgICAqL1xyXG4gICAgZ2V0RXBpc29kZShpZCkge1xyXG4gICAgICAgIGZvciAobGV0IGUgPSAwOyBlIDwgdGhpcy5lcGlzb2Rlcy5sZW5ndGg7IGUrKykge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5lcGlzb2Rlc1tlXS5pZCA9PT0gaWQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmVwaXNvZGVzW2VdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMuU2Vhc29uID0gU2Vhc29uO1xyXG5jbGFzcyBFcGlzb2RlIGV4dGVuZHMgQmFzZV8xLkJhc2Uge1xyXG4gICAgY29kZTtcclxuICAgIGRhdGU7XHJcbiAgICBlcGlzb2RlO1xyXG4gICAgZ2xvYmFsO1xyXG4gICAgc2Vhc29uO1xyXG4gICAgcGxhdGZvcm1fbGlua3M7XHJcbiAgICBzZWVuX3RvdGFsO1xyXG4gICAgc2hvdztcclxuICAgIHNwZWNpYWw7XHJcbiAgICBzdWJ0aXRsZXM7XHJcbiAgICB0aGV0dmRiX2lkO1xyXG4gICAgeW91dHViZV9pZDtcclxuICAgIGNvbnN0cnVjdG9yKGRhdGEsIHNob3cpIHtcclxuICAgICAgICBzdXBlcihkYXRhKTtcclxuICAgICAgICB0aGlzLnNob3cgPSBzaG93O1xyXG4gICAgICAgIHJldHVybiB0aGlzLmZpbGwoZGF0YSk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFJlbXBsaXQgbCdvYmpldCBhdmVjIGxlcyBkb25uw6llcyBmb3Vybml0IGVuIHBhcmFtw6h0cmVcclxuICAgICAqIEBwYXJhbSAge2FueX0gZGF0YSBMZXMgZG9ubsOpZXMgcHJvdmVuYW50IGRlIGwnQVBJXHJcbiAgICAgKiBAcmV0dXJucyB7RXBpc29kZX1cclxuICAgICAqL1xyXG4gICAgZmlsbChkYXRhKSB7XHJcbiAgICAgICAgdGhpcy5jb2RlID0gZGF0YS5jb2RlO1xyXG4gICAgICAgIHRoaXMuZGF0ZSA9IG5ldyBEYXRlKGRhdGEuZGF0ZSk7XHJcbiAgICAgICAgdGhpcy5lcGlzb2RlID0gcGFyc2VJbnQoZGF0YS5lcGlzb2RlLCAxMCk7XHJcbiAgICAgICAgdGhpcy5nbG9iYWwgPSBwYXJzZUludChkYXRhLmdsb2JhbCwgMTApO1xyXG4gICAgICAgIHRoaXMuc2Vhc29uID0gcGFyc2VJbnQoZGF0YS5zZWFzb24sIDEwKTtcclxuICAgICAgICB0aGlzLnBsYXRmb3JtX2xpbmtzID0gZGF0YS5wbGF0Zm9ybV9saW5rcztcclxuICAgICAgICB0aGlzLnNlZW5fdG90YWwgPSBwYXJzZUludChkYXRhLnNlZW5fdG90YWwsIDEwKTtcclxuICAgICAgICB0aGlzLnNwZWNpYWwgPSBkYXRhLnNwZWNpYWwgPT09IDEgPyB0cnVlIDogZmFsc2U7XHJcbiAgICAgICAgdGhpcy5zdWJ0aXRsZXMgPSBuZXcgQXJyYXkoKTtcclxuICAgICAgICBmb3IgKGxldCBzID0gMDsgcyA8IGRhdGEuc3VidGl0bGVzLmxlbmd0aDsgcysrKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc3VidGl0bGVzLnB1c2gobmV3IFN1YnRpdGxlXzEuU3VidGl0bGUoZGF0YS5zdWJ0aXRsZXNbc10pKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy50aGV0dmRiX2lkID0gcGFyc2VJbnQoZGF0YS50aGV0dmRiX2lkLCAxMCk7XHJcbiAgICAgICAgdGhpcy55b3V0dWJlX2lkID0gZGF0YS55b3V0dWJlX2lkO1xyXG4gICAgICAgIHRoaXMubWVkaWFUeXBlID0geyBzaW5ndWxhcjogQmFzZV8xLk1lZGlhVHlwZS5lcGlzb2RlLCBwbHVyYWw6ICdlcGlzb2RlcycsIGNsYXNzTmFtZTogRXBpc29kZSB9O1xyXG4gICAgICAgIHN1cGVyLmZpbGwoZGF0YSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIEFqb3V0ZSBsZSB0aXRyZSBkZSBsJ8OpcGlzb2RlIMOgIGwnYXR0cmlidXQgVGl0bGVcclxuICAgICAqIGR1IERPTUVsZW1lbnQgY29ycmVzcG9uZGFudCBhdSB0aXRyZSBkZSBsJ8OpcGlzb2RlXHJcbiAgICAgKiBzdXIgbGEgcGFnZSBXZWJcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJuIHtFcGlzb2RlfSBMJ8OpcGlzb2RlXHJcbiAgICAgKi9cclxuICAgIGFkZEF0dHJUaXRsZSgpIHtcclxuICAgICAgICAvLyBBam91dCBkZSBsJ2F0dHJpYnV0IHRpdGxlIHBvdXIgb2J0ZW5pciBsZSBub20gY29tcGxldCBkZSBsJ8OpcGlzb2RlLCBsb3JzcXUnaWwgZXN0IHRyb25xdcOpXHJcbiAgICAgICAgaWYgKHRoaXMuZWx0KVxyXG4gICAgICAgICAgICB0aGlzLmVsdC5maW5kKCcuc2xpZGVfX3RpdGxlJykuYXR0cigndGl0bGUnLCB0aGlzLnRpdGxlKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogTWV0IMOgIGpvdXIgbGUgRE9NRWxlbWVudCAuY2hlY2tTZWVuIGF2ZWMgbGVzXHJcbiAgICAgKiBkb25uw6llcyBkZSBsJ8OpcGlzb2RlIChpZCwgcG9zLCBzcGVjaWFsKVxyXG4gICAgICogQHBhcmFtICB7bnVtYmVyfSBwb3MgIExhIHBvc2l0aW9uIGRlIGwnw6lwaXNvZGUgZGFucyBsYSBsaXN0ZVxyXG4gICAgICogQHJldHVybiB7RXBpc29kZX1cclxuICAgICAqL1xyXG4gICAgaW5pdENoZWNrU2Vlbihwb3MpIHtcclxuICAgICAgICBjb25zdCAkY2hlY2tib3ggPSB0aGlzLmVsdC5maW5kKCcuY2hlY2tTZWVuJyk7XHJcbiAgICAgICAgaWYgKCRjaGVja2JveC5sZW5ndGggPiAwICYmIHRoaXMudXNlci5zZWVuKSB7XHJcbiAgICAgICAgICAgIC8vIE9uIGFqb3V0ZSBsJ2F0dHJpYnV0IElEIGV0IGxhIGNsYXNzZSAnc2Vlbicgw6AgbGEgY2FzZSAnY2hlY2tTZWVuJyBkZSBsJ8OpcGlzb2RlIGTDqWrDoCB2dVxyXG4gICAgICAgICAgICAkY2hlY2tib3guYXR0cignaWQnLCAnZXBpc29kZS0nICsgdGhpcy5pZCk7XHJcbiAgICAgICAgICAgICRjaGVja2JveC5hdHRyKCdkYXRhLWlkJywgdGhpcy5pZCk7XHJcbiAgICAgICAgICAgICRjaGVja2JveC5hdHRyKCdkYXRhLXBvcycsIHBvcyk7XHJcbiAgICAgICAgICAgICRjaGVja2JveC5hdHRyKCdkYXRhLXNwZWNpYWwnLCB0aGlzLnNwZWNpYWwgPyAnMScgOiAnMCcpO1xyXG4gICAgICAgICAgICAkY2hlY2tib3guYXR0cigndGl0bGUnLCBCYXNlXzEuQmFzZS50cmFucyhcIm1lbWJlcl9zaG93cy5yZW1vdmVcIikpO1xyXG4gICAgICAgICAgICAkY2hlY2tib3guYWRkQ2xhc3MoJ3NlZW4nKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoJGNoZWNrYm94Lmxlbmd0aCA8PSAwICYmICF0aGlzLnVzZXIuc2VlbiAmJiAhdGhpcy51c2VyLmhpZGRlbikge1xyXG4gICAgICAgICAgICAvLyBPbiBham91dGUgbGEgY2FzZSDDoCBjb2NoZXIgcG91ciBwZXJtZXR0cmUgZCdpbmRpcXVlciBsJ8OpcGlzb2RlIGNvbW1lIHZ1XHJcbiAgICAgICAgICAgIHRoaXMuZWx0LmZpbmQoJy5zbGlkZV9faW1hZ2UnKVxyXG4gICAgICAgICAgICAgICAgLmFwcGVuZChgPGRpdiBpZD1cImVwaXNvZGUtJHt0aGlzLmlkfVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJjaGVja1NlZW5cIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEtaWQ9XCIke3RoaXMuaWR9XCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLXBvcz1cIiR7cG9zfVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS1zcGVjaWFsPVwiJHt0aGlzLnNwZWNpYWx9XCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZT1cImJhY2tncm91bmQ6IHJnYmEoMTMsMjEsMjgsLjIpO1wiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU9XCIke0Jhc2VfMS5CYXNlLnRyYW5zKFwibWVtYmVyX3Nob3dzLm1hcmthc1wiKX1cIj48L2Rpdj5gKTtcclxuICAgICAgICAgICAgdGhpcy5lbHQuZmluZCgnLnNsaWRlX19pbWFnZSBpbWcuanMtbGF6eS1pbWFnZScpLmF0dHIoJ3N0eWxlJywgJ2ZpbHRlcjogYmx1cig1cHgpOycpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICgkY2hlY2tib3gubGVuZ3RoID4gMCAmJiB0aGlzLnVzZXIuaGlkZGVuKSB7XHJcbiAgICAgICAgICAgICRjaGVja2JveC5yZW1vdmUoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIE1ldCDDoCBqb3VyIGxlcyBpbmZvcyBkZSBsYSB2aWduZXR0ZSBldCBhcHBlbGxlIGxhIGZvbmN0aW9uIGQndXBkYXRlIGR1IHJlbmR1XHJcbiAgICAgKiBAcGFyYW0gIHtudW1iZXJ9IHBvcyBMYSBwb3NpdGlvbiBkZSBsJ8OpcGlzb2RlIGRhbnMgbGEgbGlzdGVcclxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59ICAgIEluZGlxdWUgc2kgaWwgeSBhIGV1IHVuIGNoYW5nZW1lbnRcclxuICAgICAqL1xyXG4gICAgdXBkYXRlQ2hlY2tTZWVuKHBvcykge1xyXG4gICAgICAgIGNvbnN0ICRjaGVja1NlZW4gPSB0aGlzLmVsdC5maW5kKCcuY2hlY2tTZWVuJyk7XHJcbiAgICAgICAgbGV0IGNoYW5nZWQgPSBmYWxzZTtcclxuICAgICAgICBpZiAoJGNoZWNrU2Vlbi5sZW5ndGggPiAwICYmICRjaGVja1NlZW4uYXR0cignaWQnKSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIGlmIChCYXNlXzEuQmFzZS5kZWJ1ZylcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdham91dCBkZSBsXFwnYXR0cmlidXQgSUQgw6AgbFxcJ8OpbMOpbWVudCBcImNoZWNrU2VlblwiJyk7XHJcbiAgICAgICAgICAgIC8vIE9uIGFqb3V0ZSBsJ2F0dHJpYnV0IElEXHJcbiAgICAgICAgICAgICRjaGVja1NlZW4uYXR0cignaWQnLCAnZXBpc29kZS0nICsgdGhpcy5pZCk7XHJcbiAgICAgICAgICAgICRjaGVja1NlZW4uZGF0YSgnaWQnLCB0aGlzLmlkKTtcclxuICAgICAgICAgICAgJGNoZWNrU2Vlbi5kYXRhKCdwb3MnLCBwb3MpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBpZiAoQmFzZS5kZWJ1ZykgY29uc29sZS5sb2coJ3VwZGF0ZUNoZWNrU2VlbicsIHtzZWVuOiB0aGlzLnVzZXIuc2VlbiwgZWx0OiB0aGlzLmVsdCwgY2hlY2tTZWVuOiAkY2hlY2tTZWVuLmxlbmd0aCwgY2xhc3NTZWVuOiAkY2hlY2tTZWVuLmhhc0NsYXNzKCdzZWVuJyksIHBvczogcG9zLCBFcGlzb2RlOiB0aGlzfSk7XHJcbiAgICAgICAgLy8gU2kgbGUgbWVtYnJlIGEgdnUgbCfDqXBpc29kZSBldCBxdSdpbCBuJ2VzdCBwYXMgaW5kaXF1w6ksIG9uIGNoYW5nZSBsZSBzdGF0dXRcclxuICAgICAgICBpZiAodGhpcy51c2VyLnNlZW4gJiYgJGNoZWNrU2Vlbi5sZW5ndGggPiAwICYmICEkY2hlY2tTZWVuLmhhc0NsYXNzKCdzZWVuJykpIHtcclxuICAgICAgICAgICAgaWYgKEJhc2VfMS5CYXNlLmRlYnVnKVxyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0NoYW5nZW1lbnQgZHUgc3RhdHV0IChzZWVuKSBkZSBsXFwnw6lwaXNvZGUgJXMnLCB0aGlzLmNvZGUpO1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVJlbmRlcignc2VlbicsIGZhbHNlKTtcclxuICAgICAgICAgICAgY2hhbmdlZCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIFNpIGxlIG1lbWJyZSBuJ2EgcGFzIHZ1IGwnw6lwaXNvZGUgZXQgcXUnaWwgbidlc3QgcGFzIGluZGlxdcOpLCBvbiBjaGFuZ2UgbGUgc3RhdHV0XHJcbiAgICAgICAgZWxzZSBpZiAoIXRoaXMudXNlci5zZWVuICYmICRjaGVja1NlZW4ubGVuZ3RoID4gMCAmJiAkY2hlY2tTZWVuLmhhc0NsYXNzKCdzZWVuJykpIHtcclxuICAgICAgICAgICAgaWYgKEJhc2VfMS5CYXNlLmRlYnVnKVxyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0NoYW5nZW1lbnQgZHUgc3RhdHV0IChub3RTZWVuKSBkZSBsXFwnw6lwaXNvZGUgJXMnLCB0aGlzLmNvZGUpO1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVJlbmRlcignbm90U2VlbicsIGZhbHNlKTtcclxuICAgICAgICAgICAgY2hhbmdlZCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHRoaXMudXNlci5oaWRkZW4gJiYgJGNoZWNrU2Vlbi5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICRjaGVja1NlZW4ucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIGNoYW5nZWQgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gY2hhbmdlZDtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogUmV0b3VybmUgbGUgY29kZSBIVE1MIGR1IHRpdHJlIGRlIGxhIHBvcHVwXHJcbiAgICAgKiBwb3VyIGwnYWZmaWNoYWdlIGRlIGxhIGRlc2NyaXB0aW9uXHJcbiAgICAgKiBAcmV0dXJuIHtzdHJpbmd9XHJcbiAgICAgKi9cclxuICAgIGdldFRpdGxlUG9wdXAoKSB7XHJcbiAgICAgICAgcmV0dXJuIGA8c3BhbiBzdHlsZT1cImNvbG9yOiB2YXIoLS1saW5rX2NvbG9yKTtcIj5TeW5vcHNpcyDDqXBpc29kZSAke3RoaXMuY29kZX08L3NwYW4+YDtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogTW9kaWZpZSBsZSBzdGF0dXQgZCd1biDDqXBpc29kZSBzdXIgbCdBUElcclxuICAgICAqIEBwYXJhbSAge1N0cmluZ30gc3RhdHVzICAgIExlIG5vdXZlYXUgc3RhdHV0IGRlIGwnw6lwaXNvZGVcclxuICAgICAqIEBwYXJhbSAge1N0cmluZ30gbWV0aG9kICAgIFZlcmJlIEhUVFAgdXRpbGlzw6kgcG91ciBsYSByZXF1w6p0ZSDDoCBsJ0FQSVxyXG4gICAgICogQHJldHVybiB7dm9pZH1cclxuICAgICAqL1xyXG4gICAgdXBkYXRlU3RhdHVzKHN0YXR1cywgbWV0aG9kKSB7XHJcbiAgICAgICAgY29uc3QgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgIGNvbnN0IHBvcyA9IHRoaXMuZWx0LmZpbmQoJy5jaGVja1NlZW4nKS5kYXRhKCdwb3MnKTtcclxuICAgICAgICBsZXQgcHJvbWlzZSA9IG5ldyBQcm9taXNlKHJlc29sdmUgPT4geyByZXNvbHZlKGZhbHNlKTsgfSk7XHJcbiAgICAgICAgbGV0IGFyZ3MgPSB7IGlkOiB0aGlzLmlkLCBidWxrOiB0cnVlIH07XHJcbiAgICAgICAgaWYgKG1ldGhvZCA9PT0gQmFzZV8xLkhUVFBfVkVSQlMuUE9TVCkge1xyXG4gICAgICAgICAgICBsZXQgY3JlYXRlUHJvbWlzZSA9ICgpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBuZXcgUG9wdXBBbGVydCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiAnRXBpc29kZXMgdnVzJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogJ0RvaXQtb24gY29jaGVyIGxlcyDDqXBpc29kZXMgcHLDqWPDqWRlbnRzIGNvbW1lIHZ1ID8nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFja195ZXM6ICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrX25vOiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGZhbHNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGNvbnN0ICR2aWduZXR0ZXMgPSBqUXVlcnkoJyNlcGlzb2RlcyAuY2hlY2tTZWVuJyk7XHJcbiAgICAgICAgICAgIC8vIE9uIHZlcmlmaWUgc2kgbGVzIMOpcGlzb2RlcyBwcsOpY8OpZGVudHMgb250IGJpZW4gw6l0w6kgaW5kaXF1w6lzIGNvbW1lIHZ1XHJcbiAgICAgICAgICAgIGZvciAobGV0IHYgPSAwOyB2IDwgcG9zOyB2KyspIHtcclxuICAgICAgICAgICAgICAgIGlmICghJCgkdmlnbmV0dGVzLmdldCh2KSkuaGFzQ2xhc3MoJ3NlZW4nKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHByb21pc2UgPSBjcmVhdGVQcm9taXNlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcHJvbWlzZS50aGVuKHJlc3BvbnNlID0+IHtcclxuICAgICAgICAgICAgaWYgKG1ldGhvZCA9PT0gQmFzZV8xLkhUVFBfVkVSQlMuUE9TVCAmJiAhcmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIGFyZ3MuYnVsayA9IGZhbHNlOyAvLyBGbGFnIHBvdXIgbmUgcGFzIG1ldHRyZSBsZXMgw6lwaXNvZGVzIHByw6ljw6lkZW50cyBjb21tZSB2dXMgYXV0b21hdGlxdWVtZW50XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgQmFzZV8xLkJhc2UuY2FsbEFwaShtZXRob2QsICdlcGlzb2RlcycsICd3YXRjaGVkJywgYXJncykudGhlbihkYXRhID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChCYXNlXzEuQmFzZS5kZWJ1ZylcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygndXBkYXRlU3RhdHVzICVzIGVwaXNvZGVzL3dhdGNoZWQnLCBtZXRob2QsIGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgaWYgKCEoX3RoaXMuc2hvdyBpbnN0YW5jZW9mIFNob3dfMS5TaG93KSAmJiBCYXNlXzEuQmFzZS5jYWNoZS5oYXMoQ2FjaGVfMS5EYXRhVHlwZXNDYWNoZS5zaG93cywgZGF0YS5zaG93LmlkKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIF90aGlzLnNob3cgPSBCYXNlXzEuQmFzZS5jYWNoZS5nZXQoQ2FjaGVfMS5EYXRhVHlwZXNDYWNoZS5zaG93cywgZGF0YS5zaG93LmlkKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIFNpIHVuIMOpcGlzb2RlIGVzdCB2dSBldCBxdWUgbGEgc8OpcmllIG4nYSBwYXMgw6l0w6kgYWpvdXTDqWVcclxuICAgICAgICAgICAgICAgIC8vIGF1IGNvbXB0ZSBkdSBtZW1icmUgY29ubmVjdMOpXHJcbiAgICAgICAgICAgICAgICBpZiAoIV90aGlzLnNob3cuaW5fYWNjb3VudCAmJiBkYXRhLmVwaXNvZGUuc2hvdy5pbl9hY2NvdW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuc2hvdy5pbl9hY2NvdW50ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICBfdGhpcy5zaG93XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5zYXZlKClcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmFkZFNob3dDbGljayh0cnVlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIE9uIG1ldCDDoCBqb3VyIGwnb2JqZXQgRXBpc29kZVxyXG4gICAgICAgICAgICAgICAgaWYgKG1ldGhvZCA9PT0gQmFzZV8xLkhUVFBfVkVSQlMuUE9TVCAmJiByZXNwb25zZSAmJiBwb3MpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCAkdmlnbmV0dGVzID0galF1ZXJ5KCcjZXBpc29kZXMgLnNsaWRlX2ZsZXgnKTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgZXBpc29kZSA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgZSA9IDA7IGUgPCBwb3M7IGUrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlcGlzb2RlID0gX3RoaXMuc2hvdy5jdXJyZW50U2Vhc29uLmVwaXNvZGVzW2VdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXBpc29kZS5lbHQgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVwaXNvZGUuZWx0ID0galF1ZXJ5KCR2aWduZXR0ZXMuZ2V0KGUpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWVwaXNvZGUudXNlci5zZWVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcGlzb2RlLnVzZXIuc2VlbiA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcGlzb2RlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnVwZGF0ZVJlbmRlcignc2VlbicsIGZhbHNlKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5zYXZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBfdGhpc1xyXG4gICAgICAgICAgICAgICAgICAgIC5maWxsKGRhdGEuZXBpc29kZSlcclxuICAgICAgICAgICAgICAgICAgICAudXBkYXRlUmVuZGVyKHN0YXR1cywgdHJ1ZSlcclxuICAgICAgICAgICAgICAgICAgICAuc2F2ZSgpXHJcbiAgICAgICAgICAgICAgICAgICAgLl9jYWxsTGlzdGVuZXJzKEJhc2VfMS5FdmVudFR5cGVzLlVQREFURSk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAuY2F0Y2goZXJyID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChCYXNlXzEuQmFzZS5kZWJ1ZylcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCd1cGRhdGVTdGF0dXMgZXJyb3IgJXMnLCBlcnIpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGVyciAmJiBlcnIgPT0gJ2NoYW5nZVN0YXR1cycpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoQmFzZV8xLkJhc2UuZGVidWcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCd1cGRhdGVTdGF0dXMgZXJyb3IgJXMgY2hhbmdlU3RhdHVzJywgbWV0aG9kKTtcclxuICAgICAgICAgICAgICAgICAgICBfdGhpcy51cGRhdGVSZW5kZXIoc3RhdHVzKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIF90aGlzLnRvZ2dsZVNwaW5uZXIoZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIEJhc2VfMS5CYXNlLm5vdGlmaWNhdGlvbignRXJyZXVyIGRlIG1vZGlmaWNhdGlvbiBkXFwndW4gw6lwaXNvZGUnLCAndXBkYXRlU3RhdHVzOiAnICsgZXJyKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIENoYW5nZSBsZSBzdGF0dXQgdmlzdWVsIGRlIGxhIHZpZ25ldHRlIHN1ciBsZSBzaXRlXHJcbiAgICAgKiBAcGFyYW0gIHtTdHJpbmd9IG5ld1N0YXR1cyAgICAgTGUgbm91dmVhdSBzdGF0dXQgZGUgbCfDqXBpc29kZVxyXG4gICAgICogQHBhcmFtICB7Ym9vbH0gICBbdXBkYXRlPXRydWVdIE1pc2Ugw6Agam91ciBkZSBsYSByZXNzb3VyY2UgZW4gY2FjaGUgZXQgZGVzIMOpbMOpbWVudHMgZCdhZmZpY2hhZ2VcclxuICAgICAqIEByZXR1cm4ge0VwaXNvZGV9XHJcbiAgICAgKi9cclxuICAgIHVwZGF0ZVJlbmRlcihuZXdTdGF0dXMsIHVwZGF0ZSA9IHRydWUpIHtcclxuICAgICAgICBjb25zdCBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgY29uc3QgJGVsdCA9IHRoaXMuZWx0LmZpbmQoJy5jaGVja1NlZW4nKTtcclxuICAgICAgICBjb25zdCBsZW5FcGlzb2RlcyA9IGpRdWVyeSgnI2VwaXNvZGVzIC5jaGVja1NlZW4nKS5sZW5ndGg7XHJcbiAgICAgICAgY29uc3QgbGVuTm90U3BlY2lhbCA9IGpRdWVyeSgnI2VwaXNvZGVzIC5jaGVja1NlZW5bZGF0YS1zcGVjaWFsPVwiMFwiXScpLmxlbmd0aDtcclxuICAgICAgICBpZiAoQmFzZV8xLkJhc2UuZGVidWcpXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdjaGFuZ2VTdGF0dXMnLCB7IGVsdDogJGVsdCwgc3RhdHVzOiBuZXdTdGF0dXMsIHVwZGF0ZTogdXBkYXRlIH0pO1xyXG4gICAgICAgIGlmIChuZXdTdGF0dXMgPT09ICdzZWVuJykge1xyXG4gICAgICAgICAgICAkZWx0LmNzcygnYmFja2dyb3VuZCcsICcnKTsgLy8gT24gYWpvdXRlIGxlIGNoZWNrIGRhbnMgbGEgY2FzZSDDoCBjb2NoZXJcclxuICAgICAgICAgICAgJGVsdC5hZGRDbGFzcygnc2VlbicpOyAvLyBPbiBham91dGUgbGEgY2xhc3NlICdzZWVuJ1xyXG4gICAgICAgICAgICAkZWx0LmF0dHIoJ3RpdGxlJywgQmFzZV8xLkJhc2UudHJhbnMoXCJtZW1iZXJfc2hvd3MucmVtb3ZlXCIpKTtcclxuICAgICAgICAgICAgLy8gT24gc3VwcHJpbWUgbGUgdm9pbGUgbWFzcXVhbnQgc3VyIGxhIHZpZ25ldHRlIHBvdXIgdm9pciBsJ2ltYWdlIGRlIGwnw6lwaXNvZGVcclxuICAgICAgICAgICAgJGVsdC5wYXJlbnQoJ2Rpdi5zbGlkZV9faW1hZ2UnKS5maW5kKCdpbWcnKS5yZW1vdmVBdHRyKCdzdHlsZScpO1xyXG4gICAgICAgICAgICAkZWx0LnBhcmVudHMoJ2Rpdi5zbGlkZV9mbGV4JykucmVtb3ZlQ2xhc3MoJ3NsaWRlLS1ub3RTZWVuJyk7XHJcbiAgICAgICAgICAgIGNvbnN0IG1vdmVTZWFzb24gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBzbGlkZUN1cnJlbnQgPSBqUXVlcnkoJyNzZWFzb25zIGRpdi5zbGlkZS0tY3VycmVudCcpO1xyXG4gICAgICAgICAgICAgICAgLy8gT24gY2hlY2sgbGEgc2Fpc29uXHJcbiAgICAgICAgICAgICAgICBzbGlkZUN1cnJlbnQuZmluZCgnLnNsaWRlX19pbWFnZScpLnByZXBlbmQoJzxkaXYgY2xhc3M9XCJjaGVja1NlZW5cIj48L2Rpdj4nKTtcclxuICAgICAgICAgICAgICAgIHNsaWRlQ3VycmVudFxyXG4gICAgICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcygnc2xpZGUtLW5vdFNlZW4nKVxyXG4gICAgICAgICAgICAgICAgICAgIC5hZGRDbGFzcygnc2xpZGUtLXNlZW4nKTtcclxuICAgICAgICAgICAgICAgIGlmIChCYXNlXzEuQmFzZS5kZWJ1ZylcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnVG91cyBsZXMgw6lwaXNvZGVzIGRlIGxhIHNhaXNvbiBvbnQgw6l0w6kgdnVzJywgc2xpZGVDdXJyZW50KTtcclxuICAgICAgICAgICAgICAgIC8vIFNpIGlsIHkgYSB1bmUgc2Fpc29uIHN1aXZhbnRlLCBvbiBsYSBzw6lsZWN0aW9ubmVcclxuICAgICAgICAgICAgICAgIGlmIChzbGlkZUN1cnJlbnQubmV4dCgpLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoQmFzZV8xLkJhc2UuZGVidWcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdJbCB5IGEgdW5lIGF1dHJlIHNhaXNvbicpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNsaWRlQ3VycmVudC5uZXh0KCkudHJpZ2dlcignY2xpY2snKTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgc2Vhc29uTnVtYmVyID0gX3RoaXMuc2hvdy5jdXJyZW50U2Vhc29uLm51bWJlciArIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuc2hvdy5zZXRDdXJyZW50U2Vhc29uKHNlYXNvbk51bWJlcik7XHJcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVDdXJyZW50XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcygnc2xpZGUtLWN1cnJlbnQnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgY29uc3QgbGVuU2VlbiA9IGpRdWVyeSgnI2VwaXNvZGVzIC5zZWVuJykubGVuZ3RoO1xyXG4gICAgICAgICAgICAvL2lmIChCYXNlLmRlYnVnKSBjb25zb2xlLmxvZygnRXBpc29kZS51cGRhdGVSZW5kZXInLCB7bGVuRXBpc29kZXM6IGxlbkVwaXNvZGVzLCBsZW5Ob3RTcGVjaWFsOiBsZW5Ob3RTcGVjaWFsLCBsZW5TZWVuOiBsZW5TZWVufSk7XHJcbiAgICAgICAgICAgIC8vIFNpIHRvdXMgbGVzIMOpcGlzb2RlcyBkZSBsYSBzYWlzb24gb250IMOpdMOpIHZ1c1xyXG4gICAgICAgICAgICBpZiAobGVuU2VlbiA9PT0gbGVuRXBpc29kZXMpIHtcclxuICAgICAgICAgICAgICAgIG1vdmVTZWFzb24oKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChsZW5TZWVuID09PSBsZW5Ob3RTcGVjaWFsKSB7XHJcbiAgICAgICAgICAgICAgICBuZXcgUG9wdXBBbGVydCh7XHJcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6ICdGaW4gZGUgbGEgc2Fpc29uJyxcclxuICAgICAgICAgICAgICAgICAgICB0ZXh0OiAnVG91cyBsZXMgw6lwaXNvZGVzIGRlIGxhIHNhaXNvbiwgaG9ycyBzcMOpY2lhdXgsIG9udCDDqXTDqSB2dS48YnIvPlZvdWxlei12b3VzIHBhc3NlciDDoCBsYSBzYWlzb24gc3VpdmFudGUgPycsXHJcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tfeWVzOiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vdmVTZWFzb24oKTtcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrX25vOiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAkZWx0LmNzcygnYmFja2dyb3VuZCcsICdyZ2JhKDEzLDIxLDI4LC4yKScpOyAvLyBPbiBlbmzDqHZlIGxlIGNoZWNrIGRhbnMgbGEgY2FzZSDDoCBjb2NoZXJcclxuICAgICAgICAgICAgJGVsdC5yZW1vdmVDbGFzcygnc2VlbicpOyAvLyBPbiBzdXBwcmltZSBsYSBjbGFzc2UgJ3NlZW4nXHJcbiAgICAgICAgICAgICRlbHQuYXR0cigndGl0bGUnLCBCYXNlXzEuQmFzZS50cmFucyhcIm1lbWJlcl9zaG93cy5tYXJrYXNcIikpO1xyXG4gICAgICAgICAgICAvLyBPbiByZW1ldCBsZSB2b2lsZSBtYXNxdWFudCBzdXIgbGEgdmlnbmV0dGUgZGUgbCfDqXBpc29kZVxyXG4gICAgICAgICAgICAkZWx0LnBhcmVudCgnZGl2LnNsaWRlX19pbWFnZScpXHJcbiAgICAgICAgICAgICAgICAuZmluZCgnaW1nJylcclxuICAgICAgICAgICAgICAgIC5hdHRyKCdzdHlsZScsICdmaWx0ZXI6IGJsdXIoNXB4KTsnKTtcclxuICAgICAgICAgICAgY29uc3QgY29udFZpZ25ldHRlID0gJGVsdC5wYXJlbnRzKCdkaXYuc2xpZGVfZmxleCcpO1xyXG4gICAgICAgICAgICBpZiAoIWNvbnRWaWduZXR0ZS5oYXNDbGFzcygnc2xpZGUtLW5vdFNlZW4nKSkge1xyXG4gICAgICAgICAgICAgICAgY29udFZpZ25ldHRlLmFkZENsYXNzKCdzbGlkZS0tbm90U2VlbicpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChqUXVlcnkoJyNlcGlzb2RlcyAuc2VlbicpLmxlbmd0aCA8IGxlbkVwaXNvZGVzKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCAkc2Vhc29uQ3VycmVudCA9IGpRdWVyeSgnI3NlYXNvbnMgZGl2LnNsaWRlLS1jdXJyZW50Jyk7XHJcbiAgICAgICAgICAgICAgICAkc2Vhc29uQ3VycmVudC5maW5kKCcuY2hlY2tTZWVuJykucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICAkc2Vhc29uQ3VycmVudFxyXG4gICAgICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcygnc2xpZGUtLXNlZW4nKVxyXG4gICAgICAgICAgICAgICAgICAgIC5hZGRDbGFzcygnc2xpZGUtLW5vdFNlZW4nKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodXBkYXRlKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnNob3cgaW5zdGFuY2VvZiBTaG93XzEuU2hvdykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zaG93LnVwZGF0ZSh0cnVlKS50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBfdGhpcy50b2dnbGVTcGlubmVyKGZhbHNlKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdFcGlzb2RlLnNob3cgaXMgbm90IGFuIGluc3RhbmNlIG9mIGNsYXNzIFNob3cnLCB0aGlzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogQWZmaWNoZS9tYXNxdWUgbGUgc3Bpbm5lciBkZSBtb2RpZmljYXRpb24gZGVzIMOpcGlzb2Rlc1xyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSAge2Jvb2xlYW59ICBkaXNwbGF5ICBMZSBmbGFnIGluZGlxdWFudCBzaSBhZmZpY2hlciBvdSBtYXNxdWVyXHJcbiAgICAgKiBAcmV0dXJuIHtFcGlzb2RlfVxyXG4gICAgICovXHJcbiAgICB0b2dnbGVTcGlubmVyKGRpc3BsYXkpIHtcclxuICAgICAgICBpZiAoIWRpc3BsYXkpIHtcclxuICAgICAgICAgICAgalF1ZXJ5KCcuc3Bpbm5lcicpLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICBpZiAoQmFzZV8xLkJhc2UuZGVidWcpXHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygndG9nZ2xlU3Bpbm5lcicpO1xyXG4gICAgICAgICAgICBpZiAoQmFzZV8xLkJhc2UuZGVidWcpXHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmdyb3VwRW5kKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAoQmFzZV8xLkJhc2UuZGVidWcpXHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmdyb3VwQ29sbGFwc2VkKCdlcGlzb2RlIGNoZWNrU2VlbicpO1xyXG4gICAgICAgICAgICBpZiAoQmFzZV8xLkJhc2UuZGVidWcpXHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygndG9nZ2xlU3Bpbm5lcicpO1xyXG4gICAgICAgICAgICB0aGlzLmVsdC5maW5kKCcuc2xpZGVfX2ltYWdlJykucHJlcGVuZChgXHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwic3Bpbm5lclwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzcGlubmVyLWl0ZW1cIj48L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwic3Bpbm5lci1pdGVtXCI+PC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInNwaW5uZXItaXRlbVwiPjwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+YCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMuRXBpc29kZSA9IEVwaXNvZGU7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbmV4cG9ydHMuTWVkaWEgPSB2b2lkIDA7XHJcbmNvbnN0IEJhc2VfMSA9IHJlcXVpcmUoXCIuL0Jhc2VcIik7XHJcbmNsYXNzIE1lZGlhIGV4dGVuZHMgQmFzZV8xLkJhc2Uge1xyXG4gICAgZm9sbG93ZXJzO1xyXG4gICAgZ2VucmVzO1xyXG4gICAgaW1kYl9pZDtcclxuICAgIGxhbmd1YWdlO1xyXG4gICAgbGVuZ3RoO1xyXG4gICAgb3JpZ2luYWxfdGl0bGU7XHJcbiAgICBzaW1pbGFycztcclxuICAgIGluX2FjY291bnQ7XHJcbiAgICBmZXRjaFNpbWlsYXJzO1xyXG4gICAgY29uc3RydWN0b3IoZGF0YSkge1xyXG4gICAgICAgIHN1cGVyKGRhdGEpO1xyXG4gICAgICAgIHJldHVybiB0aGlzLmZpbGwoZGF0YSk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFJlbXBsaXQgbCdvYmpldCBhdmVjIGxlcyBkb25uw6llcyBmb3Vybml0IGVuIHBhcmFtw6h0cmVcclxuICAgICAqIEBwYXJhbSAge09ian0gZGF0YSBMZXMgZG9ubsOpZXMgcHJvdmVuYW50IGRlIGwnQVBJXHJcbiAgICAgKiBAcmV0dXJucyB7TWVkaWF9XHJcbiAgICAgKi9cclxuICAgIGZpbGwoZGF0YSkge1xyXG4gICAgICAgIHRoaXMuZm9sbG93ZXJzID0gcGFyc2VJbnQoZGF0YS5mb2xsb3dlcnMsIDEwKTtcclxuICAgICAgICB0aGlzLmltZGJfaWQgPSBkYXRhLmltZGJfaWQ7XHJcbiAgICAgICAgdGhpcy5sYW5ndWFnZSA9IGRhdGEubGFuZ3VhZ2U7XHJcbiAgICAgICAgdGhpcy5sZW5ndGggPSBwYXJzZUludChkYXRhLmxlbmd0aCwgMTApO1xyXG4gICAgICAgIHRoaXMub3JpZ2luYWxfdGl0bGUgPSBkYXRhLm9yaWdpbmFsX3RpdGxlO1xyXG4gICAgICAgIGlmIChkYXRhLnNpbWlsYXJzICYmIGRhdGEuc2ltaWxhcnMgaW5zdGFuY2VvZiBBcnJheSkge1xyXG4gICAgICAgICAgICB0aGlzLnNpbWlsYXJzID0gZGF0YS5zaW1pbGFycztcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5nZW5yZXMgPSBuZXcgQXJyYXkoKTtcclxuICAgICAgICBpZiAoZGF0YS5nZW5yZXMgJiYgZGF0YS5nZW5yZXMgaW5zdGFuY2VvZiBBcnJheSkge1xyXG4gICAgICAgICAgICB0aGlzLmdlbnJlcyA9IGRhdGEuZ2VucmVzO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChkYXRhLmdlbnJlcyBpbnN0YW5jZW9mIE9iamVjdCkge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBnIGluIGRhdGEuZ2VucmVzKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmdlbnJlcy5wdXNoKGRhdGEuZ2VucmVzW2ddKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmluX2FjY291bnQgPSBkYXRhLmluX2FjY291bnQ7XHJcbiAgICAgICAgc3VwZXIuZmlsbChkYXRhKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogUmV0b3VybmUgbGUgbm9tYnJlIGRlIHNpbWlsYXJzXHJcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBMZSBub21icmUgZGUgc2ltaWxhcnNcclxuICAgICAqL1xyXG4gICAgZ2V0IG5iU2ltaWxhcnMoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc2ltaWxhcnMubGVuZ3RoO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXRvdXJuZSBsZSBzaW1pbGFyIGNvcnJlc3BvbmRhbnQgw6AgbCdpZGVudGlmaWFudFxyXG4gICAgICogQGFic3RyYWN0XHJcbiAgICAgKiBAcGFyYW0gIHtudW1iZXJ9IGlkICAgICAgTCdpZGVudGlmaWFudCBkdSBzaW1pbGFyXHJcbiAgICAgKiBAcmV0dXJuIHtTaW1pbGFyfHZvaWR9ICAgTGUgc2ltaWxhciBvdSBudWxsXHJcbiAgICAgKi9cclxuICAgIGdldFNpbWlsYXIoaWQpIHtcclxuICAgICAgICBpZiAoIXRoaXMuc2ltaWxhcnMpXHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIGZvciAobGV0IHMgPSAwOyBzIDwgdGhpcy5zaW1pbGFycy5sZW5ndGg7IHMrKykge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5zaW1pbGFyc1tzXS5pZCA9PT0gaWQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNpbWlsYXJzW3NdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMuTWVkaWEgPSBNZWRpYTtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxuZXhwb3J0cy5Nb3ZpZSA9IHZvaWQgMDtcclxuY29uc3QgQmFzZV8xID0gcmVxdWlyZShcIi4vQmFzZVwiKTtcclxuY29uc3QgTWVkaWFfMSA9IHJlcXVpcmUoXCIuL01lZGlhXCIpO1xyXG5jbGFzcyBNb3ZpZSBleHRlbmRzIE1lZGlhXzEuTWVkaWEge1xyXG4gICAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cclxuICAgIC8qICAgICAgICAgICAgICAgICAgICAgIFNUQVRJQyAgICAgICAgICAgICAgICAgICAgICovXHJcbiAgICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG4gICAgLyoqXHJcbiAgICAgKiBNZXRob2RlIHN0YXRpYyBzZXJ2YW50IMOgIHJldG91cm5lciB1biBvYmpldCBzaG93XHJcbiAgICAgKiDDoCBwYXJ0aXIgZGUgc29uIElEXHJcbiAgICAgKiBAcGFyYW0gIHtudW1iZXJ9IGlkICAgICAgICAgICAgIEwnaWRlbnRpZmlhbnQgZGUgbGEgc8OpcmllXHJcbiAgICAgKiBAcGFyYW0gIHtib29sZWFufSBbZm9yY2U9ZmFsc2VdIEluZGlxdWUgc2kgb24gdXRpbGlzZSBsZSBjYWNoZSBvdSBub25cclxuICAgICAqIEByZXR1cm4ge1Byb21pc2U8TW92aWU+fVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgZmV0Y2goaWQsIGZvcmNlID0gZmFsc2UpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICBCYXNlXzEuQmFzZS5jYWxsQXBpKCdHRVQnLCAnbW92aWVzJywgJ21vdmllJywgeyBpZDogaWQgfSwgZm9yY2UpXHJcbiAgICAgICAgICAgICAgICAudGhlbihkYXRhID0+IHJlc29sdmUobmV3IE1vdmllKGRhdGEsIGpRdWVyeSgnLmJsb2NrSW5mb3JtYXRpb25zJykpKSlcclxuICAgICAgICAgICAgICAgIC5jYXRjaChlcnIgPT4gcmVqZWN0KGVycikpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cclxuICAgIC8qICAgICAgICAgICAgICAgICAgUFJPUEVSVElFUyAgICAgICAgICAgICAgICAgICAgICovXHJcbiAgICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG4gICAgYmFja2Ryb3A7XHJcbiAgICBkaXJlY3RvcjtcclxuICAgIG9yaWdpbmFsX3JlbGVhc2VfZGF0ZTtcclxuICAgIG90aGVyX3RpdGxlO1xyXG4gICAgcGxhdGZvcm1fbGlua3M7XHJcbiAgICBwb3N0ZXI7XHJcbiAgICBwcm9kdWN0aW9uX3llYXI7XHJcbiAgICByZWxlYXNlX2RhdGU7XHJcbiAgICBzYWxlX2RhdGU7XHJcbiAgICB0YWdsaW5lO1xyXG4gICAgdG1kYl9pZDtcclxuICAgIHRyYWlsZXI7XHJcbiAgICB1cmw7XHJcbiAgICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG4gICAgLyogICAgICAgICAgICAgICAgICAgICAgTUVUSE9EUyAgICAgICAgICAgICAgICAgICAgKi9cclxuICAgIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhLCBlbGVtZW50KSB7XHJcbiAgICAgICAgaWYgKGRhdGEudXNlci5pbl9hY2NvdW50ICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgZGF0YS5pbl9hY2NvdW50ID0gZGF0YS51c2VyLmluX2FjY291bnQ7XHJcbiAgICAgICAgICAgIGRlbGV0ZSBkYXRhLnVzZXIuaW5fYWNjb3VudDtcclxuICAgICAgICB9XHJcbiAgICAgICAgc3VwZXIoZGF0YSk7XHJcbiAgICAgICAgdGhpcy5lbHQgPSBlbGVtZW50O1xyXG4gICAgICAgIHJldHVybiB0aGlzLmZpbGwoZGF0YSk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFJlbXBsaXQgbCdvYmpldCBhdmVjIGxlcyBkb25uw6llcyBmb3Vybml0IGVuIHBhcmFtw6h0cmVcclxuICAgICAqIEBwYXJhbSAge2FueX0gZGF0YSBMZXMgZG9ubsOpZXMgcHJvdmVuYW50IGRlIGwnQVBJXHJcbiAgICAgKiBAcmV0dXJucyB7TW92aWV9XHJcbiAgICAgKi9cclxuICAgIGZpbGwoZGF0YSkge1xyXG4gICAgICAgIGlmIChkYXRhLnVzZXIuaW5fYWNjb3VudCAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIGRhdGEuaW5fYWNjb3VudCA9IGRhdGEudXNlci5pbl9hY2NvdW50O1xyXG4gICAgICAgICAgICBkZWxldGUgZGF0YS51c2VyLmluX2FjY291bnQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuYmFja2Ryb3AgPSBkYXRhLmJhY2tkcm9wO1xyXG4gICAgICAgIHRoaXMuZGlyZWN0b3IgPSBkYXRhLmRpcmVjdG9yO1xyXG4gICAgICAgIHRoaXMub3JpZ2luYWxfcmVsZWFzZV9kYXRlID0gbmV3IERhdGUoZGF0YS5vcmlnaW5hbF9yZWxlYXNlX2RhdGUpO1xyXG4gICAgICAgIHRoaXMub3RoZXJfdGl0bGUgPSBkYXRhLm90aGVyX3RpdGxlO1xyXG4gICAgICAgIHRoaXMucGxhdGZvcm1fbGlua3MgPSBkYXRhLnBsYXRmb3JtX2xpbmtzO1xyXG4gICAgICAgIHRoaXMucG9zdGVyID0gZGF0YS5wb3N0ZXI7XHJcbiAgICAgICAgdGhpcy5wcm9kdWN0aW9uX3llYXIgPSBwYXJzZUludChkYXRhLnByb2R1Y3Rpb25feWVhcik7XHJcbiAgICAgICAgdGhpcy5yZWxlYXNlX2RhdGUgPSBuZXcgRGF0ZShkYXRhLnJlbGVhc2VfZGF0ZSk7XHJcbiAgICAgICAgdGhpcy5zYWxlX2RhdGUgPSBuZXcgRGF0ZShkYXRhLnNhbGVfZGF0ZSk7XHJcbiAgICAgICAgdGhpcy50YWdsaW5lID0gZGF0YS50YWdsaW5lO1xyXG4gICAgICAgIHRoaXMudG1kYl9pZCA9IHBhcnNlSW50KGRhdGEudG1kYl9pZCk7XHJcbiAgICAgICAgdGhpcy50cmFpbGVyID0gZGF0YS50cmFpbGVyO1xyXG4gICAgICAgIHRoaXMudXJsID0gZGF0YS51cmw7XHJcbiAgICAgICAgdGhpcy5tZWRpYVR5cGUgPSB7IHNpbmd1bGFyOiBCYXNlXzEuTWVkaWFUeXBlLm1vdmllLCBwbHVyYWw6ICdtb3ZpZXMnLCBjbGFzc05hbWU6IE1vdmllIH07XHJcbiAgICAgICAgc3VwZXIuZmlsbChkYXRhKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxufVxyXG5leHBvcnRzLk1vdmllID0gTW92aWU7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbmV4cG9ydHMuTm90ZSA9IHZvaWQgMDtcclxuY2xhc3MgTm90ZSB7XHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhKSB7XHJcbiAgICAgICAgdGhpcy50b3RhbCA9IHBhcnNlSW50KGRhdGEudG90YWwsIDEwKTtcclxuICAgICAgICB0aGlzLm1lYW4gPSBwYXJzZUludChkYXRhLm1lYW4sIDEwKTtcclxuICAgICAgICB0aGlzLnVzZXIgPSBwYXJzZUludChkYXRhLnVzZXIsIDEwKTtcclxuICAgIH1cclxuICAgIHRvdGFsO1xyXG4gICAgbWVhbjtcclxuICAgIHVzZXI7XHJcbiAgICBnZXRQZXJjZW50YWdlKCkge1xyXG4gICAgICAgIHJldHVybiBNYXRoLnJvdW5kKCgodGhpcy5tZWFuIC8gNSkgKiAxMDApIC8gMTApICogMTA7XHJcbiAgICB9XHJcbiAgICB0b1N0cmluZygpIHtcclxuICAgICAgICBjb25zdCB2b3RlcyA9ICd2b3RlJyArICh0aGlzLnRvdGFsID4gMSA/ICdzJyA6ICcnKSwgXHJcbiAgICAgICAgLy8gT24gbWV0IGVuIGZvcm1lIGxlIG5vbWJyZSBkZSB2b3Rlc1xyXG4gICAgICAgIHRvdGFsID0gbmV3IEludGwuTnVtYmVyRm9ybWF0KCdmci1GUicsIHsgc3R5bGU6ICdkZWNpbWFsJywgdXNlR3JvdXBpbmc6IHRydWUgfSkuZm9ybWF0KHRoaXMudG90YWwpLCBcclxuICAgICAgICAvLyBPbiBsaW1pdGUgbGUgbm9tYnJlIGRlIGNoaWZmcmUgYXByw6hzIGxhIHZpcmd1bGVcclxuICAgICAgICBub3RlID0gdGhpcy5tZWFuLnRvRml4ZWQoMSk7XHJcbiAgICAgICAgbGV0IHRvU3RyaW5nID0gYCR7dG90YWx9ICR7dm90ZXN9IDogJHtub3RlfSAvIDVgO1xyXG4gICAgICAgIC8vIE9uIGFqb3V0ZSBsYSBub3RlIGR1IG1lbWJyZSBjb25uZWN0w6ksIHNpIGlsIGEgdm90w6lcclxuICAgICAgICBpZiAodGhpcy51c2VyID4gMCkge1xyXG4gICAgICAgICAgICB0b1N0cmluZyArPSBgLCB2b3RyZSBub3RlOiAke3RoaXMudXNlcn1gO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdG9TdHJpbmc7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5Ob3RlID0gTm90ZTtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxuZXhwb3J0cy5TaG93ID0gZXhwb3J0cy5TaG93cnVubmVyID0gZXhwb3J0cy5QbGF0Zm9ybXMgPSBleHBvcnRzLlBsYXRmb3JtID0gZXhwb3J0cy5QaWN0dXJlID0gZXhwb3J0cy5QaWNrZWQgPSBleHBvcnRzLkltYWdlcyA9IHZvaWQgMDtcclxuY29uc3QgQmFzZV8xID0gcmVxdWlyZShcIi4vQmFzZVwiKTtcclxuY29uc3QgTWVkaWFfMSA9IHJlcXVpcmUoXCIuL01lZGlhXCIpO1xyXG5jbGFzcyBJbWFnZXMge1xyXG4gICAgY29uc3RydWN0b3IoZGF0YSkge1xyXG4gICAgICAgIHRoaXMuc2hvdyA9IGRhdGEuc2hvdztcclxuICAgICAgICB0aGlzLmJhbm5lciA9IGRhdGEuYmFubmVyO1xyXG4gICAgICAgIHRoaXMuYm94ID0gZGF0YS5ib3g7XHJcbiAgICAgICAgdGhpcy5wb3N0ZXIgPSBkYXRhLnBvc3RlcjtcclxuICAgIH1cclxuICAgIHNob3c7XHJcbiAgICBiYW5uZXI7XHJcbiAgICBib3g7XHJcbiAgICBwb3N0ZXI7XHJcbn1cclxuZXhwb3J0cy5JbWFnZXMgPSBJbWFnZXM7XHJcbnZhciBQaWNrZWQ7XHJcbihmdW5jdGlvbiAoUGlja2VkKSB7XHJcbiAgICBQaWNrZWRbUGlja2VkW1wibm9uZVwiXSA9IDBdID0gXCJub25lXCI7XHJcbiAgICBQaWNrZWRbUGlja2VkW1wiYmFubmVyXCJdID0gMV0gPSBcImJhbm5lclwiO1xyXG4gICAgUGlja2VkW1BpY2tlZFtcInNob3dcIl0gPSAyXSA9IFwic2hvd1wiO1xyXG59KShQaWNrZWQgPSBleHBvcnRzLlBpY2tlZCB8fCAoZXhwb3J0cy5QaWNrZWQgPSB7fSkpO1xyXG5jbGFzcyBQaWN0dXJlIHtcclxuICAgIGNvbnN0cnVjdG9yKGRhdGEpIHtcclxuICAgICAgICB0aGlzLmlkID0gcGFyc2VJbnQoZGF0YS5pZCwgMTApO1xyXG4gICAgICAgIHRoaXMuc2hvd19pZCA9IHBhcnNlSW50KGRhdGEuc2hvd19pZCwgMTApO1xyXG4gICAgICAgIHRoaXMubG9naW5faWQgPSBwYXJzZUludChkYXRhLmxvZ2luX2lkLCAxMCk7XHJcbiAgICAgICAgdGhpcy51cmwgPSBkYXRhLnVybDtcclxuICAgICAgICB0aGlzLndpZHRoID0gcGFyc2VJbnQoZGF0YS53aWR0aCwgMTApO1xyXG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gcGFyc2VJbnQoZGF0YS5oZWlnaHQsIDEwKTtcclxuICAgICAgICB0aGlzLmRhdGUgPSBuZXcgRGF0ZShkYXRhLmRhdGUpO1xyXG4gICAgICAgIHRoaXMucGlja2VkID0gZGF0YS5waWNrZWQ7XHJcbiAgICB9XHJcbiAgICBpZDtcclxuICAgIHNob3dfaWQ7XHJcbiAgICBsb2dpbl9pZDtcclxuICAgIHVybDtcclxuICAgIHdpZHRoO1xyXG4gICAgaGVpZ2h0O1xyXG4gICAgZGF0ZTtcclxuICAgIHBpY2tlZDtcclxufVxyXG5leHBvcnRzLlBpY3R1cmUgPSBQaWN0dXJlO1xyXG5jbGFzcyBQbGF0Zm9ybSB7XHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhKSB7XHJcbiAgICAgICAgdGhpcy5pZCA9IHBhcnNlSW50KGRhdGEuaWQsIDEwKTtcclxuICAgICAgICB0aGlzLm5hbWUgPSBkYXRhLm5hbWU7XHJcbiAgICAgICAgdGhpcy50YWcgPSBkYXRhLnRhZztcclxuICAgICAgICB0aGlzLmxpbmtfdXJsID0gZGF0YS5saW5rX3VybDtcclxuICAgICAgICB0aGlzLmF2YWlsYWJsZSA9IGRhdGEuYXZhaWxhYmxlO1xyXG4gICAgICAgIHRoaXMubG9nbyA9IGRhdGEubG9nbztcclxuICAgIH1cclxuICAgIGlkO1xyXG4gICAgbmFtZTtcclxuICAgIHRhZztcclxuICAgIGxpbmtfdXJsO1xyXG4gICAgYXZhaWxhYmxlO1xyXG4gICAgbG9nbztcclxufVxyXG5leHBvcnRzLlBsYXRmb3JtID0gUGxhdGZvcm07XHJcbmNsYXNzIFBsYXRmb3JtcyB7XHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhKSB7XHJcbiAgICAgICAgaWYgKGRhdGEuc3ZvZHMgJiYgZGF0YS5zdm9kcyBpbnN0YW5jZW9mIEFycmF5KSB7XHJcbiAgICAgICAgICAgIHRoaXMuc3ZvZHMgPSBuZXcgQXJyYXkoKTtcclxuICAgICAgICAgICAgZm9yIChsZXQgcyA9IDA7IHMgPCBkYXRhLnN2b2RzLmxlbmd0aDsgcysrKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnN2b2RzLnB1c2gobmV3IFBsYXRmb3JtKGRhdGEuc3ZvZHNbc10pKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZGF0YS5zdm9kKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc3ZvZCA9IG5ldyBQbGF0Zm9ybShkYXRhLnN2b2QpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHN2b2RzO1xyXG4gICAgc3ZvZDtcclxufVxyXG5leHBvcnRzLlBsYXRmb3JtcyA9IFBsYXRmb3JtcztcclxuY2xhc3MgU2hvd3J1bm5lciB7XHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhKSB7XHJcbiAgICAgICAgdGhpcy5pZCA9IHBhcnNlSW50KGRhdGEuaWQsIDEwKTtcclxuICAgICAgICB0aGlzLm5hbWUgPSBkYXRhLm5hbWU7XHJcbiAgICAgICAgdGhpcy5waWN0dXJlID0gZGF0YS5waWN0dXJlO1xyXG4gICAgfVxyXG4gICAgaWQ7XHJcbiAgICBuYW1lO1xyXG4gICAgcGljdHVyZTtcclxufVxyXG5leHBvcnRzLlNob3dydW5uZXIgPSBTaG93cnVubmVyO1xyXG5jbGFzcyBTaG93IGV4dGVuZHMgTWVkaWFfMS5NZWRpYSB7XHJcbiAgICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG4gICAgLyogICAgICAgICAgICAgICAgICAgICAgU1RBVElDICAgICAgICAgICAgICAgICAgICAgKi9cclxuICAgIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXHJcbiAgICAvKipcclxuICAgICAqIE1ldGhvZGUgc3RhdGljIHNlcnZhbnQgw6AgcmV0b3VybmVyIHVuIG9iamV0IHNob3dcclxuICAgICAqIMOgIHBhcnRpciBkZSBzb24gSURcclxuICAgICAqIEBwYXJhbSAge251bWJlcn0gaWQgICAgICAgICAgICAgTCdpZGVudGlmaWFudCBkZSBsYSBzw6lyaWVcclxuICAgICAqIEBwYXJhbSAge2Jvb2xlYW59IFtmb3JjZT1mYWxzZV0gSW5kaXF1ZSBzaSBvbiB1dGlsaXNlIGxlIGNhY2hlIG91IG5vblxyXG4gICAgICogQHJldHVybiB7UHJvbWlzZTxTaG93Pn1cclxuICAgICAqL1xyXG4gICAgc3RhdGljIGZldGNoKGlkLCBmb3JjZSA9IGZhbHNlKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgQmFzZV8xLkJhc2UuY2FsbEFwaSgnR0VUJywgJ3Nob3dzJywgJ2Rpc3BsYXknLCB7IGlkOiBpZCB9LCBmb3JjZSlcclxuICAgICAgICAgICAgICAgIC50aGVuKGRhdGEgPT4gcmVzb2x2ZShuZXcgU2hvdyhkYXRhLCBqUXVlcnkoJy5ibG9ja0luZm9ybWF0aW9ucycpKSkpXHJcbiAgICAgICAgICAgICAgICAuY2F0Y2goZXJyID0+IHJlamVjdChlcnIpKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXHJcbiAgICAvKiAgICAgICAgICAgICAgICAgIFBST1BFUlRJRVMgICAgICAgICAgICAgICAgICAgICAqL1xyXG4gICAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cclxuICAgIGFsaWFzZXM7XHJcbiAgICBjcmVhdGlvbjtcclxuICAgIGNvdW50cnk7XHJcbiAgICBjdXJyZW50U2Vhc29uO1xyXG4gICAgaW1hZ2VzO1xyXG4gICAgbmJFcGlzb2RlcztcclxuICAgIG5ldHdvcms7XHJcbiAgICBuZXh0X3RyYWlsZXI7XHJcbiAgICBuZXh0X3RyYWlsZXJfaG9zdDtcclxuICAgIHJhdGluZztcclxuICAgIHBpY3R1cmVzO1xyXG4gICAgcGxhdGZvcm1zO1xyXG4gICAgc2Vhc29ucztcclxuICAgIHNob3dydW5uZXI7XHJcbiAgICBzb2NpYWxfbGlua3M7XHJcbiAgICBzdGF0dXM7XHJcbiAgICB0aGV0dmRiX2lkO1xyXG4gICAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cclxuICAgIC8qICAgICAgICAgICAgICAgICAgICAgIE1FVEhPRFMgICAgICAgICAgICAgICAgICAgICovXHJcbiAgICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG4gICAgY29uc3RydWN0b3IoZGF0YSwgZWxlbWVudCkge1xyXG4gICAgICAgIHN1cGVyKGRhdGEpO1xyXG4gICAgICAgIHRoaXMuZWx0ID0gZWxlbWVudDtcclxuICAgICAgICByZXR1cm4gdGhpcy5maWxsKGRhdGEpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBSw6ljdXDDqHJlIGxlcyBkb25uw6llcyBkZSBsYSBzw6lyaWUgc3VyIGwnQVBJXHJcbiAgICAgKiBAcGFyYW0gIHtib29sZWFufSBbZm9yY2U9dHJ1ZV0gICBJbmRpcXVlIHNpIG9uIHV0aWxpc2UgbGVzIGRvbm7DqWVzIGVuIGNhY2hlXHJcbiAgICAgKiBAcmV0dXJuIHtQcm9taXNlPCo+fSAgICAgICAgICAgICBMZXMgZG9ubsOpZXMgZGUgbGEgc8OpcmllXHJcbiAgICAgKi9cclxuICAgIGZldGNoKGZvcmNlID0gdHJ1ZSkge1xyXG4gICAgICAgIHJldHVybiBCYXNlXzEuQmFzZS5jYWxsQXBpKCdHRVQnLCAnc2hvd3MnLCAnZGlzcGxheScsIHsgaWQ6IHRoaXMuaWQgfSwgZm9yY2UpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBpc0VuZGVkIC0gSW5kaXF1ZSBzaSBsYSBzw6lyaWUgZXN0IHRlcm1pbsOpZVxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59ICBUZXJtaW7DqWUgb3Ugbm9uXHJcbiAgICAgKi9cclxuICAgIGlzRW5kZWQoKSB7XHJcbiAgICAgICAgcmV0dXJuICh0aGlzLnN0YXR1cy50b0xvd2VyQ2FzZSgpID09PSAnZW5kZWQnKSA/IHRydWUgOiBmYWxzZTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogaXNBcmNoaXZlZCAtIEluZGlxdWUgc2kgbGEgc8OpcmllIGVzdCBhcmNoaXbDqWVcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJuIHtib29sZWFufSAgQXJjaGl2w6llIG91IG5vblxyXG4gICAgICovXHJcbiAgICBpc0FyY2hpdmVkKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnVzZXIuYXJjaGl2ZWQ7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIGlzRmF2b3JpdGUgLSBJbmRpcXVlIHNpIGxhIHPDqXJpZSBlc3QgZGFucyBsZXMgZmF2b3Jpc1xyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAgICovXHJcbiAgICBpc0Zhdm9yaXRlKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnVzZXIuZmF2b3JpdGVkO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBhZGRUb0FjY291bnQgLSBBam91dCBsYSBzw6lyaWUgc3VyIGxlIGNvbXB0ZSBkdSBtZW1icmUgY29ubmVjdMOpXHJcbiAgICAgKiBAcmV0dXJuIHtQcm9taXNlPFNob3c+fSBQcm9taXNlIG9mIHNob3dcclxuICAgICAqL1xyXG4gICAgYWRkVG9BY2NvdW50KCkge1xyXG4gICAgICAgIGNvbnN0IF90aGlzID0gdGhpcztcclxuICAgICAgICBpZiAodGhpcy5pbl9hY2NvdW50KVxyXG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiByZXNvbHZlKF90aGlzKSk7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgQmFzZV8xLkJhc2UuY2FsbEFwaSgnUE9TVCcsICdzaG93cycsICdzaG93JywgeyBpZDogX3RoaXMuaWQgfSlcclxuICAgICAgICAgICAgICAgIC50aGVuKGRhdGEgPT4ge1xyXG4gICAgICAgICAgICAgICAgX3RoaXMuZmlsbChkYXRhLnNob3cpO1xyXG4gICAgICAgICAgICAgICAgX3RoaXMuc2F2ZSgpO1xyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShfdGhpcyk7XHJcbiAgICAgICAgICAgIH0sIGVyciA9PiB7XHJcbiAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFJlbW92ZSBTaG93IGZyb20gYWNjb3VudCBtZW1iZXJcclxuICAgICAqIEByZXR1cm4ge1Byb21pc2U8U2hvdz59IFByb21pc2Ugb2Ygc2hvd1xyXG4gICAgICovXHJcbiAgICByZW1vdmVGcm9tQWNjb3VudCgpIHtcclxuICAgICAgICBjb25zdCBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgaWYgKCF0aGlzLmluX2FjY291bnQpXHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHJlc29sdmUoX3RoaXMpKTtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICBCYXNlXzEuQmFzZS5jYWxsQXBpKCdERUxFVEUnLCAnc2hvd3MnLCAnc2hvdycsIHsgaWQ6IF90aGlzLmlkIH0pXHJcbiAgICAgICAgICAgICAgICAudGhlbihkYXRhID0+IHtcclxuICAgICAgICAgICAgICAgIF90aGlzLmZpbGwoZGF0YS5zaG93KTtcclxuICAgICAgICAgICAgICAgIF90aGlzLnNhdmUoKTtcclxuICAgICAgICAgICAgICAgIHJlc29sdmUodGhpcyk7XHJcbiAgICAgICAgICAgIH0sIGVyciA9PiB7XHJcbiAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIEFyY2hpdmUgbGEgc8OpcmllXHJcbiAgICAgKiBAcmV0dXJuIHtQcm9taXNlPFNob3c+fSBQcm9taXNlIG9mIHNob3dcclxuICAgICAqL1xyXG4gICAgYXJjaGl2ZSgpIHtcclxuICAgICAgICBjb25zdCBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgTWVkaWFfMS5NZWRpYS5jYWxsQXBpKCdQT1NUJywgJ3Nob3dzJywgJ2FyY2hpdmUnLCB7IGlkOiBfdGhpcy5pZCB9KVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oZGF0YSA9PiB7XHJcbiAgICAgICAgICAgICAgICBfdGhpcy5maWxsKGRhdGEuc2hvdyk7XHJcbiAgICAgICAgICAgICAgICBfdGhpcy5zYXZlKCk7XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKF90aGlzKTtcclxuICAgICAgICAgICAgfSwgZXJyID0+IHtcclxuICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogRMOpc2FyY2hpdmUgbGEgc8OpcmllXHJcbiAgICAgKiBAcmV0dXJuIHtQcm9taXNlPFNob3c+fSBQcm9taXNlIG9mIHNob3dcclxuICAgICAqL1xyXG4gICAgdW5hcmNoaXZlKCkge1xyXG4gICAgICAgIGNvbnN0IF90aGlzID0gdGhpcztcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICBNZWRpYV8xLk1lZGlhLmNhbGxBcGkoJ0RFTEVURScsICdzaG93cycsICdhcmNoaXZlJywgeyBpZDogX3RoaXMuaWQgfSlcclxuICAgICAgICAgICAgICAgIC50aGVuKGRhdGEgPT4ge1xyXG4gICAgICAgICAgICAgICAgX3RoaXMuZmlsbChkYXRhLnNob3cpO1xyXG4gICAgICAgICAgICAgICAgX3RoaXMuc2F2ZSgpO1xyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShfdGhpcyk7XHJcbiAgICAgICAgICAgIH0sIGVyciA9PiB7XHJcbiAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIEFqb3V0ZSBsYSBzw6lyaWUgYXV4IGZhdm9yaXNcclxuICAgICAqIEByZXR1cm4ge1Byb21pc2U8U2hvdz59IFByb21pc2Ugb2Ygc2hvd1xyXG4gICAgICovXHJcbiAgICBmYXZvcml0ZSgpIHtcclxuICAgICAgICBjb25zdCBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgTWVkaWFfMS5NZWRpYS5jYWxsQXBpKCdQT1NUJywgJ3Nob3dzJywgJ2Zhdm9yaXRlJywgeyBpZDogX3RoaXMuaWQgfSlcclxuICAgICAgICAgICAgICAgIC50aGVuKGRhdGEgPT4ge1xyXG4gICAgICAgICAgICAgICAgX3RoaXMuZmlsbChkYXRhLnNob3cpO1xyXG4gICAgICAgICAgICAgICAgX3RoaXMuc2F2ZSgpO1xyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShfdGhpcyk7XHJcbiAgICAgICAgICAgIH0sIGVyciA9PiB7XHJcbiAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFN1cHByaW1lIGxhIHPDqXJpZSBkZXMgZmF2b3Jpc1xyXG4gICAgICogQHJldHVybiB7UHJvbWlzZTxTaG93Pn0gUHJvbWlzZSBvZiBzaG93XHJcbiAgICAgKi9cclxuICAgIHVuZmF2b3JpdGUoKSB7XHJcbiAgICAgICAgY29uc3QgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIE1lZGlhXzEuTWVkaWEuY2FsbEFwaSgnREVMRVRFJywgJ3Nob3dzJywgJ2Zhdm9yaXRlJywgeyBpZDogX3RoaXMuaWQgfSlcclxuICAgICAgICAgICAgICAgIC50aGVuKGRhdGEgPT4ge1xyXG4gICAgICAgICAgICAgICAgX3RoaXMuZmlsbChkYXRhLnNob3cpO1xyXG4gICAgICAgICAgICAgICAgX3RoaXMuc2F2ZSgpO1xyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShfdGhpcyk7XHJcbiAgICAgICAgICAgIH0sIGVyciA9PiB7XHJcbiAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIE1ldCDDoCBqb3VyIGxlcyBkb25uw6llcyBkZSBsYSBzw6lyaWVcclxuICAgICAqIEBwYXJhbSAge0Jvb2xlYW59ICBbZm9yY2U9ZmFsc2VdIEZvcmNlciBsYSByw6ljdXDDqXJhdGlvbiBkZXMgZG9ubsOpZXMgc3VyIGwnQVBJXHJcbiAgICAgKiBAcGFyYW0gIHtGdW5jdGlvbn0gW2NiPW5vb3BdICAgICBGb25jdGlvbiBkZSBjYWxsYmFja1xyXG4gICAgICogQHJldHVybiB7UHJvbWlzZTxTaG93Pn0gICAgICAgICAgUHJvbWVzc2UgKFNob3cpXHJcbiAgICAgKi9cclxuICAgIHVwZGF0ZShmb3JjZSA9IGZhbHNlLCBjYiA9IEJhc2VfMS5CYXNlLm5vb3ApIHtcclxuICAgICAgICBjb25zdCBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgX3RoaXMuZmV0Y2goZm9yY2UpLnRoZW4oZGF0YSA9PiB7XHJcbiAgICAgICAgICAgICAgICBfdGhpcy5maWxsKGRhdGEuc2hvdyk7XHJcbiAgICAgICAgICAgICAgICBfdGhpcy5zYXZlKCk7XHJcbiAgICAgICAgICAgICAgICBfdGhpcy51cGRhdGVSZW5kZXIoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoX3RoaXMpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNiKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuX2NhbGxMaXN0ZW5lcnMoQmFzZV8xLkV2ZW50VHlwZXMuVVBEQVRFKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmNhdGNoKGVyciA9PiB7XHJcbiAgICAgICAgICAgICAgICBNZWRpYV8xLk1lZGlhLm5vdGlmaWNhdGlvbignRXJyZXVyIGRlIHLDqWN1cMOpcmF0aW9uIGRlIGxhIHJlc3NvdXJjZSBTaG93JywgJ1Nob3cgdXBkYXRlOiAnICsgZXJyKTtcclxuICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xyXG4gICAgICAgICAgICAgICAgY2IoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIE1ldCDDoCBqb3VyIGxlIHJlbmR1IGRlIGxhIGJhcnJlIGRlIHByb2dyZXNzaW9uXHJcbiAgICAgKiBldCBkdSBwcm9jaGFpbiDDqXBpc29kZVxyXG4gICAgICogQHBhcmFtICB7RnVuY3Rpb259IGNiIEZvbmN0aW9uIGRlIGNhbGxiYWNrXHJcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxyXG4gICAgICovXHJcbiAgICB1cGRhdGVSZW5kZXIoY2IgPSBCYXNlXzEuQmFzZS5ub29wKSB7XHJcbiAgICAgICAgdGhpcy51cGRhdGVQcm9ncmVzc0JhcigpO1xyXG4gICAgICAgIHRoaXMudXBkYXRlTmV4dEVwaXNvZGUoKTtcclxuICAgICAgICBsZXQgbm90ZSA9IHRoaXMub2JqTm90ZTtcclxuICAgICAgICBpZiAoQmFzZV8xLkJhc2UuZGVidWcpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ05leHQgSUQgZXQgc3RhdHVzJywge1xyXG4gICAgICAgICAgICAgICAgbmV4dDogdGhpcy51c2VyLm5leHQuaWQsXHJcbiAgICAgICAgICAgICAgICBzdGF0dXM6IHRoaXMuc3RhdHVzLFxyXG4gICAgICAgICAgICAgICAgYXJjaGl2ZWQ6IHRoaXMudXNlci5hcmNoaXZlZCxcclxuICAgICAgICAgICAgICAgIG5vdGVfdXNlcjogbm90ZS51c2VyXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBTaSBpbCBuJ3kgYSBwbHVzIGQnw6lwaXNvZGVzIMOgIHJlZ2FyZGVyXHJcbiAgICAgICAgaWYgKHRoaXMudXNlci5yZW1haW5pbmcgPT09IDApIHtcclxuICAgICAgICAgICAgbGV0IHByb21pc2UgPSBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHsgcmV0dXJuIHJlc29sdmUodm9pZCAwKTsgfSk7XHJcbiAgICAgICAgICAgIC8vIE9uIHByb3Bvc2UgZCdhcmNoaXZlciBzaSBsYSBzw6lyaWUgbidlc3QgcGx1cyBlbiBwcm9kdWN0aW9uXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmluX2FjY291bnQgJiYgdGhpcy5pc0VuZGVkKCkgJiYgIXRoaXMuaXNBcmNoaXZlZCgpKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoQmFzZV8xLkJhc2UuZGVidWcpXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1PDqXJpZSB0ZXJtaW7DqWUsIHBvcHVwIGNvbmZpcm1hdGlvbiBhcmNoaXZhZ2UnKTtcclxuICAgICAgICAgICAgICAgIHByb21pc2UgPSBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBuZXcgUG9wdXBBbGVydCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiAnQXJjaGl2YWdlIGRlIGxhIHPDqXJpZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6ICdWb3VsZXotdm91cyBhcmNoaXZlciBjZXR0ZSBzw6lyaWUgdGVybWluw6llID8nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFja195ZXM6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGpRdWVyeSgnI3JlYWN0anMtc2hvdy1hY3Rpb25zIGJ1dHRvbi5idG4tYXJjaGl2ZScpLnRyaWdnZXIoJ2NsaWNrJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHZvaWQgMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrX25vOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHZvaWQgMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gT24gcHJvcG9zZSBkZSBub3RlciBsYSBzw6lyaWVcclxuICAgICAgICAgICAgaWYgKG5vdGUudXNlciA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKEJhc2VfMS5CYXNlLmRlYnVnKVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdQcm9wb3NpdGlvbiBkZSB2b3RlciBwb3VyIGxhIHPDqXJpZScpO1xyXG4gICAgICAgICAgICAgICAgcHJvbWlzZS50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBuZXcgUG9wdXBBbGVydCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBCYXNlXzEuQmFzZS50cmFucyhcInBvcGluLm5vdGUudGl0bGUuc2hvd1wiKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogXCJWb3VsZXotdm91cyBub3RlciBsYSBzw6lyaWUgP1wiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFja195ZXM6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGpRdWVyeSgnLmJsb2NrSW5mb3JtYXRpb25zX19tZXRhZGF0YXMgLmpzLXJlbmRlci1zdGFycycpLnRyaWdnZXIoJ2NsaWNrJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tfbm86IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBwcm9taXNlLnRoZW4oKCkgPT4geyBjYigpOyB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGNiKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBNZXQgw6Agam91ciBsYSBiYXJyZSBkZSBwcm9ncmVzc2lvbiBkZSB2aXNpb25uYWdlIGRlIGxhIHPDqXJpZVxyXG4gICAgICogQHJldHVybiB7dm9pZH1cclxuICAgICAqL1xyXG4gICAgdXBkYXRlUHJvZ3Jlc3NCYXIoKSB7XHJcbiAgICAgICAgaWYgKEJhc2VfMS5CYXNlLmRlYnVnKVxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygndXBkYXRlUHJvZ3Jlc3NCYXInKTtcclxuICAgICAgICAvLyBPbiBtZXQgw6Agam91ciBsYSBiYXJyZSBkZSBwcm9ncmVzc2lvblxyXG4gICAgICAgIGpRdWVyeSgnLnByb2dyZXNzQmFyU2hvdycpLmNzcygnd2lkdGgnLCB0aGlzLnVzZXIuc3RhdHVzLnRvRml4ZWQoMSkgKyAnJScpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBNZXQgw6Agam91ciBsZSBibG9jIGR1IHByb2NoYWluIMOpcGlzb2RlIMOgIHZvaXJcclxuICAgICAqIEBwYXJhbSAgIHtGdW5jdGlvbn0gW2NiPW5vb3BdIEZvbmN0aW9uIGRlIGNhbGxiYWNrXHJcbiAgICAgKiBAcmV0dXJucyB7dm9pZH1cclxuICAgICAqL1xyXG4gICAgdXBkYXRlTmV4dEVwaXNvZGUoY2IgPSBCYXNlXzEuQmFzZS5ub29wKSB7XHJcbiAgICAgICAgaWYgKEJhc2VfMS5CYXNlLmRlYnVnKVxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygndXBkYXRlTmV4dEVwaXNvZGUnKTtcclxuICAgICAgICBjb25zdCAkbmV4dEVwaXNvZGUgPSBqUXVlcnkoJ2EuYmxvY2tOZXh0RXBpc29kZScpO1xyXG4gICAgICAgIGlmICgkbmV4dEVwaXNvZGUubGVuZ3RoID4gMCAmJiB0aGlzLnVzZXIubmV4dCAmJiB0aGlzLnVzZXIubmV4dC5pZCAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICBpZiAoQmFzZV8xLkJhc2UuZGVidWcpXHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnbmV4dEVwaXNvZGUgZXQgc2hvdy51c2VyLm5leHQgT0snLCB0aGlzLnVzZXIpO1xyXG4gICAgICAgICAgICAvLyBNb2RpZmllciBsJ2ltYWdlXHJcbiAgICAgICAgICAgIGNvbnN0ICRpbWcgPSAkbmV4dEVwaXNvZGUuZmluZCgnaW1nJyksICRyZW1haW5pbmcgPSAkbmV4dEVwaXNvZGUuZmluZCgnLnJlbWFpbmluZyBkaXYnKSwgJHBhcmVudCA9ICRpbWcucGFyZW50KCdkaXYnKSwgaGVpZ2h0ID0gJGltZy5hdHRyKCdoZWlnaHQnKSwgd2lkdGggPSAkaW1nLmF0dHIoJ3dpZHRoJyksIG5leHQgPSB0aGlzLnVzZXIubmV4dCwgc3JjID0gYCR7QmFzZV8xLkJhc2UuYXBpLnVybH0vcGljdHVyZXMvZXBpc29kZXM/a2V5PSR7QmFzZV8xLkJhc2UudXNlcktleX0maWQ9JHtuZXh0LmlkfSZ3aWR0aD0ke3dpZHRofSZoZWlnaHQ9JHtoZWlnaHR9YDtcclxuICAgICAgICAgICAgJGltZy5yZW1vdmUoKTtcclxuICAgICAgICAgICAgJHBhcmVudC5hcHBlbmQoYDxpbWcgc3JjPVwiJHtzcmN9XCIgaGVpZ2h0PVwiJHtoZWlnaHR9XCIgd2lkdGg9XCIke3dpZHRofVwiIC8+YCk7XHJcbiAgICAgICAgICAgIC8vIE1vZGlmaWVyIGxlIHRpdHJlXHJcbiAgICAgICAgICAgICRuZXh0RXBpc29kZS5maW5kKCcudGl0bGVFcGlzb2RlJykudGV4dChgJHtuZXh0LmNvZGUudG9VcHBlckNhc2UoKX0gLSAke25leHQudGl0bGV9YCk7XHJcbiAgICAgICAgICAgIC8vIE1vZGlmaWVyIGxlIGxpZW5cclxuICAgICAgICAgICAgJG5leHRFcGlzb2RlLmF0dHIoJ2hyZWYnLCAkbmV4dEVwaXNvZGUuYXR0cignaHJlZicpLnJlcGxhY2UoL3NcXGR7Mn1lXFxkezJ9LywgbmV4dC5jb2RlLnRvTG93ZXJDYXNlKCkpKTtcclxuICAgICAgICAgICAgLy8gTW9kaWZpZXIgbGUgbm9tYnJlIGQnw6lwaXNvZGVzIHJlc3RhbnRzXHJcbiAgICAgICAgICAgICRyZW1haW5pbmcudGV4dCgkcmVtYWluaW5nLnRleHQoKS50cmltKCkucmVwbGFjZSgvXlxcZCsvLCB0aGlzLnVzZXIucmVtYWluaW5nLnRvU3RyaW5nKCkpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoJG5leHRFcGlzb2RlLmxlbmd0aCA8PSAwICYmIHRoaXMudXNlci5uZXh0ICYmIHRoaXMudXNlci5uZXh0LmlkICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIGlmIChCYXNlXzEuQmFzZS5kZWJ1ZylcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdObyBuZXh0RXBpc29kZSBldCBzaG93LnVzZXIubmV4dCBPSycsIHRoaXMudXNlcik7XHJcbiAgICAgICAgICAgIGJ1aWxkTmV4dEVwaXNvZGUodGhpcyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKCF0aGlzLnVzZXIubmV4dCB8fCB0aGlzLnVzZXIubmV4dC5pZCA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAkbmV4dEVwaXNvZGUucmVtb3ZlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNiKCk7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQ29uc3RydWl0IHVuZSB2aWduZXR0ZSBwb3VyIGxlIHByb2NoYWluIMOpcGlzb2RlIMOgIHZvaXJcclxuICAgICAgICAgKiBAcGFyYW0gIHtTaG93fSByZXMgIE9iamV0IEFQSSBzaG93XHJcbiAgICAgICAgICogQHJldHVybiB7dm9pZH1cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBidWlsZE5leHRFcGlzb2RlKHJlcykge1xyXG4gICAgICAgICAgICBjb25zdCBoZWlnaHQgPSA3MCwgd2lkdGggPSAxMjQsIHNyYyA9IGAke0Jhc2VfMS5CYXNlLmFwaS51cmx9L3BpY3R1cmVzL2VwaXNvZGVzP2tleT0ke0Jhc2VfMS5CYXNlLnVzZXJLZXl9JmlkPSR7cmVzLnVzZXIubmV4dC5pZH0md2lkdGg9JHt3aWR0aH0maGVpZ2h0PSR7aGVpZ2h0fWAsIHNlcmllVGl0bGUgPSByZXMucmVzb3VyY2VfdXJsLnNwbGl0KCcvJykucG9wKCk7XHJcbiAgICAgICAgICAgIGpRdWVyeSgnLmJsb2NrSW5mb3JtYXRpb25zX19hY3Rpb25zJykuYWZ0ZXIoYDxhIGhyZWY9XCIvZXBpc29kZS8ke3NlcmllVGl0bGV9LyR7cmVzLnVzZXIubmV4dC5jb2RlLnRvTG93ZXJDYXNlKCl9XCIgY2xhc3M9XCJibG9ja05leHRFcGlzb2RlIG1lZGlhXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1lZGlhLWxlZnRcIj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidS1pbnNpZGVCb3JkZXJPcGFjaXR5IHUtaW5zaWRlQm9yZGVyT3BhY2l0eS0tMDFcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGltZyBzcmM9XCIke3NyY31cIiB3aWR0aD1cIiR7d2lkdGh9XCIgaGVpZ2h0PVwiJHtoZWlnaHR9XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1lZGlhLWJvZHlcIj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidGl0bGVcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHN0cm9uZz5Qcm9jaGFpbiDDqXBpc29kZSDDoCByZWdhcmRlcjwvc3Ryb25nPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0aXRsZUVwaXNvZGVcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgJHtyZXMudXNlci5uZXh0LmNvZGUudG9VcHBlckNhc2UoKX0gLSAke3Jlcy51c2VyLm5leHQudGl0bGV9XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInJlbWFpbmluZ1wiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidS1jb2xvcldoaXRlT3BhY2l0eTA1XCI+JHtyZXMudXNlci5yZW1haW5pbmd9IMOpcGlzb2RlJHsocmVzLnVzZXIucmVtYWluaW5nID4gMSkgPyAncycgOiAnJ30gw6AgcmVnYXJkZXI8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDwvYT5gKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIE9uIGfDqHJlIGwnYWpvdXQgZGUgbGEgc8OpcmllIGRhbnMgbGUgY29tcHRlIHV0aWxpc2F0ZXVyXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtICAge2Jvb2xlYW59IHRyaWdFcGlzb2RlIEZsYWcgaW5kaXF1YW50IHNpIGwnYXBwZWwgdmllbnQgZCd1biBlcGlzb2RlIHZ1IG91IGR1IGJvdXRvblxyXG4gICAgICogQHJldHVybnMge3ZvaWR9XHJcbiAgICAgKi9cclxuICAgIGFkZFNob3dDbGljayh0cmlnRXBpc29kZSA9IGZhbHNlKSB7XHJcbiAgICAgICAgY29uc3QgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgIGNvbnN0IHZpZ25ldHRlcyA9ICQoJyNlcGlzb2RlcyAuc2xpZGVfX2ltYWdlJyk7XHJcbiAgICAgICAgLy8gVsOpcmlmaWVyIHNpIGxlIG1lbWJyZSBhIGFqb3V0ZXIgbGEgc8OpcmllIMOgIHNvbiBjb21wdGVcclxuICAgICAgICBpZiAoIXRoaXMuaW5fYWNjb3VudCkge1xyXG4gICAgICAgICAgICAvLyBSZW1wbGFjZXIgbGUgRE9NRWxlbWVudCBzdXBwcmltZSBsJ2V2ZW50SGFuZGxlclxyXG4gICAgICAgICAgICBqUXVlcnkoJyNyZWFjdGpzLXNob3ctYWN0aW9ucycpLmh0bWwoYFxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImJsb2NrSW5mb3JtYXRpb25zX19hY3Rpb25cIj5cclxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiYnRuLXJlc2V0IGJ0bi10cmFuc3BhcmVudFwiIHR5cGU9XCJidXR0b25cIj5cclxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInN2Z0NvbnRhaW5lclwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8c3ZnIGZpbGw9XCIjMEQxNTFDXCIgd2lkdGg9XCIxNFwiIGhlaWdodD1cIjE0XCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPVwiTTE0IDhIOHY2SDZWOEgwVjZoNlYwaDJ2Nmg2elwiIGZpbGwtcnVsZT1cIm5vbnplcm9cIj48L3BhdGg+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvc3ZnPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibGFiZWxcIj5Bam91dGVyPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5gKTtcclxuICAgICAgICAgICAgLy8gT24gYWpvdXRlIHVuIGV2ZW50IGNsaWNrIHBvdXIgbWFzcXVlciBsZXMgdmlnbmV0dGVzXHJcbiAgICAgICAgICAgIGpRdWVyeSgnI3JlYWN0anMtc2hvdy1hY3Rpb25zID4gZGl2ID4gYnV0dG9uJykub2ZmKCdjbGljaycpLm9uZSgnY2xpY2snLCAoZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgIGlmIChCYXNlXzEuQmFzZS5kZWJ1ZylcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmdyb3VwQ29sbGFwc2VkKCdBZGRTaG93Jyk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBkb25lID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIE9uIG1ldCDDoCBqb3VyIGxlcyBib3V0b25zIEFyY2hpdmVyIGV0IEZhdm9yaVxyXG4gICAgICAgICAgICAgICAgICAgIGNoYW5nZUJ0bkFkZChfdGhpcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gT24gbWV0IMOgIGpvdXIgbGUgYmxvYyBkdSBwcm9jaGFpbiDDqXBpc29kZSDDoCB2b2lyXHJcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMudXBkYXRlTmV4dEVwaXNvZGUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoQmFzZV8xLkJhc2UuZGVidWcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmdyb3VwRW5kKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgX3RoaXMuYWRkVG9BY2NvdW50KClcclxuICAgICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiBkb25lKCksIGVyciA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVyciAmJiBlcnIuY29kZSAhPT0gdW5kZWZpbmVkICYmIGVyci5jb2RlID09PSAyMDAzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvbmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBCYXNlXzEuQmFzZS5ub3RpZmljYXRpb24oJ0VycmV1ciBkXFwnYWpvdXQgZGUgbGEgc8OpcmllJywgZXJyKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoQmFzZV8xLkJhc2UuZGVidWcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZ3JvdXBFbmQoKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQWpvdXRlIGxlcyBpdGVtcyBkdSBtZW51IE9wdGlvbnMsIGFpbnNpIHF1ZSBsZXMgYm91dG9ucyBBcmNoaXZlciBldCBGYXZvcmlzXHJcbiAgICAgICAgICogZXQgb24gYWpvdXRlIHVuIHZvaWxlIHN1ciBsZXMgaW1hZ2VzIGRlcyDDqXBpc29kZXMgbm9uLXZ1XHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0gIHtTaG93fSBzaG93IEwnb2JqZXQgZGUgdHlwZSBTaG93XHJcbiAgICAgICAgICogQHJldHVybiB7dm9pZH1cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBjaGFuZ2VCdG5BZGQoc2hvdykge1xyXG4gICAgICAgICAgICBsZXQgJG9wdGlvbnNMaW5rcyA9ICQoJyNkcm9wZG93bk9wdGlvbnMnKS5zaWJsaW5ncygnLmRyb3Bkb3duLW1lbnUnKS5jaGlsZHJlbignYS5oZWFkZXItbmF2aWdhdGlvbi1pdGVtJyk7XHJcbiAgICAgICAgICAgIGlmICgkb3B0aW9uc0xpbmtzLmxlbmd0aCA8PSAyKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgcmVhY3RfaWQgPSBqUXVlcnkoJ3NjcmlwdFtpZF49XCIvcmVhY3Rqcy9cIl0nKS5nZXQoMCkuaWQuc3BsaXQoJy4nKVsxXSwgdXJsU2hvdyA9IHNob3cucmVzb3VyY2VfdXJsLnN1YnN0cmluZyhsb2NhdGlvbi5vcmlnaW4ubGVuZ3RoKSwgdGl0bGUgPSBzaG93LnRpdGxlLnJlcGxhY2UoL1wiL2csICdcXFxcXCInKS5yZXBsYWNlKC8nL2csIFwiXFxcXCdcIiksIHRlbXBsYXRlT3B0cyA9IGBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuLXJlc2V0IGhlYWRlci1uYXZpZ2F0aW9uLWl0ZW1cIiBvbmNsaWNrPVwibmV3IFBvcHVwQWxlcnQoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hvd0Nsb3NlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJwb3Bpbi1zdWJ0aXRsZXNcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlYWN0TW9kdWxlSWQ6IFwicmVhY3Rqcy1zdWJ0aXRsZXNcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lZGlhSWQ6IFwiJHtzaG93LmlkfVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFwic2hvd1wiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlUG9waW46IFwiJHt0aXRsZX1cIjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjazogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9hZFJlY29tbWVuZGF0aW9uTW9kdWxlKCdzdWJ0aXRsZXMnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2FkZFNjcmlwdChcIi9yZWFjdGpzL3N1YnRpdGxlcy4ke3JlYWN0X2lkfS5qc1wiLCBcIm1vZHVsZS1yZWFjdGpzLXN1YnRpdGxlc1wiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcIj5Tb3VzLXRpdHJlczwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGEgY2xhc3M9XCJoZWFkZXItbmF2aWdhdGlvbi1pdGVtXCIgaHJlZj1cImphdmFzY3JpcHQ6O1wiIG9uY2xpY2s9XCJyZXBvcnRJdGVtKCR7c2hvdy5pZH0sICdzaG93Jyk7XCI+U2lnbmFsZXIgdW4gcHJvYmzDqG1lPC9hPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGEgY2xhc3M9XCJoZWFkZXItbmF2aWdhdGlvbi1pdGVtXCIgaHJlZj1cImphdmFzY3JpcHQ6O1wiIG9uY2xpY2s9XCJzaG93VXBkYXRlKCcke3RpdGxlfScsICR7c2hvdy5pZH0sICcwJylcIj5EZW1hbmRlciB1bmUgbWlzZSDDoCBqb3VyPC9hPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGEgY2xhc3M9XCJoZWFkZXItbmF2aWdhdGlvbi1pdGVtXCIgaHJlZj1cIndlYmNhbDovL3d3dy5iZXRhc2VyaWVzLmNvbS9jYWwvaSR7dXJsU2hvd31cIj5QbGFubmluZyBpQ2FsIGRlIGxhIHPDqXJpZTwvYT5cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Zm9ybSBjbGFzcz1cImF1dG9jb21wbGV0ZSBqcy1hdXRvY29tcGxldGUtZm9ybSBoZWFkZXItbmF2aWdhdGlvbi1pdGVtXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJyZXNldFwiIGNsYXNzPVwiYnRuLXJlc2V0IGZvbnRXZWlnaHQ3MDAganMtYXV0b2NvbXBsZXRlLXNob3dcIiBzdHlsZT1cImNvbG9yOiBpbmhlcml0XCI+UmVjb21tYW5kZXIgbGEgc8OpcmllPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYXV0b2NvbXBsZXRlX190b1Nob3dcIiBoaWRkZW49XCJcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgcGxhY2Vob2xkZXI9XCJOb20gZCd1biBhbWlcIiB0eXBlPVwidGV4dFwiIGNsYXNzPVwiYXV0b2NvbXBsZXRlX19pbnB1dCBqcy1zZWFyY2gtZnJpZW5kc1wiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJhdXRvY29tcGxldGVfX3Jlc3BvbnNlIGpzLWRpc3BsYXktcmVzcG9uc2VcIj48L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9mb3JtPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGEgY2xhc3M9XCJoZWFkZXItbmF2aWdhdGlvbi1pdGVtXCIgaHJlZj1cImphdmFzY3JpcHQ6O1wiPlN1cHByaW1lciBkZSBtZXMgc8OpcmllczwvYT5gO1xyXG4gICAgICAgICAgICAgICAgaWYgKCRvcHRpb25zTGlua3MubGVuZ3RoID09PSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVPcHRzID0gYDxhIGNsYXNzPVwiaGVhZGVyLW5hdmlnYXRpb24taXRlbVwiIGhyZWY9XCIke3VybFNob3d9L2FjdGlvbnNcIj5Wb3MgYWN0aW9ucyBzdXIgbGEgc8OpcmllPC9hPmAgKyB0ZW1wbGF0ZU9wdHM7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBqUXVlcnkoJyNkcm9wZG93bk9wdGlvbnMnKS5zaWJsaW5ncygnLmRyb3Bkb3duLW1lbnUuaGVhZGVyLW5hdmlnYXRpb24nKVxyXG4gICAgICAgICAgICAgICAgICAgIC5hcHBlbmQodGVtcGxhdGVPcHRzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBPbiByZW1wbGFjZSBsZSBib3V0b24gQWpvdXRlciBwYXIgbGVzIGJvdXRvbnMgQXJjaGl2ZXIgZXQgRmF2b3Jpc1xyXG4gICAgICAgICAgICBjb25zdCBkaXZzID0galF1ZXJ5KCcjcmVhY3Rqcy1zaG93LWFjdGlvbnMgPiBkaXYnKTtcclxuICAgICAgICAgICAgaWYgKGRpdnMubGVuZ3RoID09PSAxKSB7XHJcbiAgICAgICAgICAgICAgICBqUXVlcnkoJyNyZWFjdGpzLXNob3ctYWN0aW9ucycpLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgbGV0ICRjb250YWluZXIgPSBqUXVlcnkoJy5ibG9ja0luZm9ybWF0aW9uc19fYWN0aW9ucycpLCBtZXRob2QgPSAncHJlcGVuZCc7XHJcbiAgICAgICAgICAgICAgICAvLyBTaSBsZSBib3V0b24gVk9EIGVzdCBwcsOpc2VudCwgb24gcGxhY2UgbGVzIGJvdXRvbnMgYXByw6hzXHJcbiAgICAgICAgICAgICAgICBpZiAoJCgnI2Ryb3Bkb3duV2F0Y2hPbicpLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAkY29udGFpbmVyID0galF1ZXJ5KCcjZHJvcGRvd25XYXRjaE9uJykucGFyZW50KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kID0gJ2FmdGVyJztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICRjb250YWluZXJbbWV0aG9kXShgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkaXNwbGF5RmxleCBhbGlnbkl0ZW1zRmxleFN0YXJ0XCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZD1cInJlYWN0anMtc2hvdy1hY3Rpb25zXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLXNob3ctaWQ9XCIke3Nob3cuaWR9XCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLXVzZXItaGFzYXJjaGl2ZWQ9XCIke3Nob3cudXNlci5hcmNoaXZlZCA/ICcxJyA6ICcnfVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS1zaG93LWluYWNjb3VudD1cIjFcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEtdXNlci1pZD1cIiR7QmFzZV8xLkJhc2UudXNlcklkfVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS1zaG93LWZhdm9yaXNlZD1cIiR7c2hvdy51c2VyLmZhdm9yaXRlZCA/ICcxJyA6ICcnfVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImJsb2NrSW5mb3JtYXRpb25zX19hY3Rpb25cIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJidG4tcmVzZXQgYnRuLXRyYW5zcGFyZW50IGJ0bi1hcmNoaXZlXCIgdHlwZT1cImJ1dHRvblwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwic3ZnQ29udGFpbmVyXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHN2ZyBmaWxsPVwiIzBkMTUxY1wiIGhlaWdodD1cIjE2XCIgd2lkdGg9XCIxNlwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHBhdGggZD1cIm0xNiA4LTEuNDEtMS40MS01LjU5IDUuNTh2LTEyLjE3aC0ydjEyLjE3bC01LjU4LTUuNTktMS40MiAxLjQyIDggOHpcIj48L3BhdGg+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zdmc+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibGFiZWxcIj4ke0Jhc2VfMS5CYXNlLnRyYW5zKCdzaG93LmJ1dHRvbi5hcmNoaXZlLmxhYmVsJyl9PC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJibG9ja0luZm9ybWF0aW9uc19fYWN0aW9uXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiYnRuLXJlc2V0IGJ0bi10cmFuc3BhcmVudCBidG4tZmF2b3Jpc1wiIHR5cGU9XCJidXR0b25cIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInN2Z0NvbnRhaW5lclwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzdmcgZmlsbD1cIiNGRkZcIiB3aWR0aD1cIjIwXCIgaGVpZ2h0PVwiMTlcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9XCJNMTQuNSAwYy0xLjc0IDAtMy40MS44MS00LjUgMi4wOUM4LjkxLjgxIDcuMjQgMCA1LjUgMCAyLjQyIDAgMCAyLjQyIDAgNS41YzAgMy43OCAzLjQgNi44NiA4LjU1IDExLjU0TDEwIDE4LjM1bDEuNDUtMS4zMkMxNi42IDEyLjM2IDIwIDkuMjggMjAgNS41IDIwIDIuNDIgMTcuNTggMCAxNC41IDB6bS00LjQgMTUuNTVsLS4xLjEtLjEtLjFDNS4xNCAxMS4yNCAyIDguMzkgMiA1LjUgMiAzLjUgMy41IDIgNS41IDJjMS41NCAwIDMuMDQuOTkgMy41NyAyLjM2aDEuODdDMTEuNDYgMi45OSAxMi45NiAyIDE0LjUgMmMyIDAgMy41IDEuNSAzLjUgMy41IDAgMi44OS0zLjE0IDUuNzQtNy45IDEwLjA1elwiPjwvcGF0aD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3N2Zz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJsYWJlbFwiPiR7QmFzZV8xLkJhc2UudHJhbnMoJ3Nob3cuYnV0dG9uLmZhdm9yaXRlLmxhYmVsJyl9PC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+YCk7XHJcbiAgICAgICAgICAgICAgICBzaG93LmVsdCA9IGpRdWVyeSgncmVhY3Rqcy1zaG93LWFjdGlvbnMnKTtcclxuICAgICAgICAgICAgICAgIC8vIE9uIG9mdXNxdWUgbCdpbWFnZSBkZXMgw6lwaXNvZGVzIG5vbi12dVxyXG4gICAgICAgICAgICAgICAgbGV0IHZpZ25ldHRlO1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgdiA9IDA7IHYgPCB2aWduZXR0ZXMubGVuZ3RoOyB2KyspIHtcclxuICAgICAgICAgICAgICAgICAgICB2aWduZXR0ZSA9ICQodmlnbmV0dGVzLmdldCh2KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZpZ25ldHRlLmZpbmQoJy5zZWVuJykubGVuZ3RoIDw9IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmlnbmV0dGUuZmluZCgnaW1nLmpzLWxhenktaW1hZ2UnKS5hdHRyKCdzdHlsZScsICdmaWx0ZXI6IGJsdXIoNXB4KTsnKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgX3RoaXMuYWRkRXZlbnRCdG5zQXJjaGl2ZUFuZEZhdm9yaXMoKTtcclxuICAgICAgICAgICAgX3RoaXMuZGVsZXRlU2hvd0NsaWNrKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0cmlnRXBpc29kZSkge1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZSh0cnVlKS50aGVuKHNob3cgPT4ge1xyXG4gICAgICAgICAgICAgICAgY2hhbmdlQnRuQWRkKHNob3cpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIEfDqHJlIGxhIHN1cHByZXNzaW9uIGRlIGxhIHPDqXJpZSBkdSBjb21wdGUgdXRpbGlzYXRldXJcclxuICAgICAqIEByZXR1cm5zIHt2b2lkfVxyXG4gICAgICovXHJcbiAgICBkZWxldGVTaG93Q2xpY2soKSB7XHJcbiAgICAgICAgY29uc3QgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgIGxldCAkb3B0aW9uc0xpbmtzID0gJCgnI2Ryb3Bkb3duT3B0aW9ucycpLnNpYmxpbmdzKCcuZHJvcGRvd24tbWVudScpLmNoaWxkcmVuKCdhLmhlYWRlci1uYXZpZ2F0aW9uLWl0ZW0nKTtcclxuICAgICAgICAvLyBMZSBtZW51IE9wdGlvbnMgZXN0IGF1IGNvbXBsZXRcclxuICAgICAgICBpZiAodGhpcy5pbl9hY2NvdW50ICYmICRvcHRpb25zTGlua3MubGVuZ3RoID4gMikge1xyXG4gICAgICAgICAgICB0aGlzLmFkZEV2ZW50QnRuc0FyY2hpdmVBbmRGYXZvcmlzKCk7XHJcbiAgICAgICAgICAgIC8vIEdlc3Rpb24gZGUgbGEgc3VwcHJlc3Npb24gZGUgbGEgc8OpcmllIGR1IGNvbXB0ZSB1dGlsaXNhdGV1clxyXG4gICAgICAgICAgICAkb3B0aW9uc0xpbmtzLmxhc3QoKS5yZW1vdmVBdHRyKCdvbmNsaWNrJykub2ZmKCdjbGljaycpLm9uKCdjbGljaycsIChlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZG9uZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBhZnRlck5vdGlmID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBPbiBuZXR0b2llIGxlcyBwcm9wcmnDqXTDqXMgc2VydmFudCDDoCBsJ3VwZGF0ZSBkZSBsJ2FmZmljaGFnZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy51c2VyLnN0YXR1cyA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLnVzZXIuYXJjaGl2ZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMudXNlci5mYXZvcml0ZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMudXNlci5yZW1haW5pbmcgPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy51c2VyLmxhc3QgPSBcIlMwMEUwMFwiO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy51c2VyLm5leHQuaWQgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5zYXZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIE9uIHJlbWV0IGxlIGJvdXRvbiBBam91dGVyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGpRdWVyeSgnI3JlYWN0anMtc2hvdy1hY3Rpb25zJykuaHRtbChgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYmxvY2tJbmZvcm1hdGlvbnNfX2FjdGlvblwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJidG4tcmVzZXQgYnRuLXRyYW5zcGFyZW50IGJ0bi1hZGRcIiB0eXBlPVwiYnV0dG9uXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJzdmdDb250YWluZXJcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHN2ZyBmaWxsPVwiIzBEMTUxQ1wiIHdpZHRoPVwiMTRcIiBoZWlnaHQ9XCIxNFwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHBhdGggZD1cIk0xNCA4SDh2Nkg2VjhIMFY2aDZWMGgydjZoNnpcIiBmaWxsLXJ1bGU9XCJub256ZXJvXCI+PC9wYXRoPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3N2Zz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImxhYmVsXCI+JHtCYXNlXzEuQmFzZS50cmFucygnc2hvdy5idXR0b24uYWRkLmxhYmVsJyl9PC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5gKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gT24gc3VwcHJpbWUgbGVzIGl0ZW1zIGR1IG1lbnUgT3B0aW9uc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkb3B0aW9uc0xpbmtzLmZpcnN0KCkuc2libGluZ3MoKS5lYWNoKChpLCBlKSA9PiB7ICQoZSkucmVtb3ZlKCk7IH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBOZXR0b3lhZ2UgZGUgbCdhZmZpY2hhZ2UgZGVzIMOpcGlzb2Rlc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjaGVja3MgPSBqUXVlcnkoJyNlcGlzb2RlcyAuc2xpZGVfZmxleCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcHJvbWlzZSwgdXBkYXRlID0gZmFsc2U7IC8vIEZsYWcgcG91ciBsJ3VwZGF0ZSBkZSBsJ2FmZmljaGFnZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoX3RoaXMuY3VycmVudFNlYXNvbi5lcGlzb2RlcyAmJiBfdGhpcy5jdXJyZW50U2Vhc29uLmVwaXNvZGVzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb21pc2UgPSBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHJlc29sdmUoX3RoaXMuY3VycmVudFNlYXNvbikpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvbWlzZSA9IF90aGlzLmN1cnJlbnRTZWFzb24uZmV0Y2hFcGlzb2RlcygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb21pc2UudGhlbigoc2Vhc29uKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBlID0gMDsgZSA8IHNlYXNvbi5lcGlzb2Rlcy5sZW5ndGg7IGUrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzZWFzb24uZXBpc29kZXNbZV0uZWx0ID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlYXNvbi5lcGlzb2Rlc1tlXS5lbHQgPSAkKGNoZWNrcy5nZXQoZSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZSA9PT0gc2Vhc29uLmVwaXNvZGVzLmxlbmd0aCAtIDEpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKEJhc2VfMS5CYXNlLmRlYnVnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnY2xlYW4gZXBpc29kZSAlZCcsIGUsIHVwZGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2Vhc29uLmVwaXNvZGVzW2VdLnVwZGF0ZVJlbmRlcignbm90U2VlbicsIHVwZGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5hZGRTaG93Q2xpY2soKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICBuZXcgUG9wdXBBbGVydCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBCYXNlXzEuQmFzZS50cmFucyhcInBvcHVwLmRlbGV0ZV9zaG93X3N1Y2Nlc3MudGl0bGVcIiksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6IEJhc2VfMS5CYXNlLnRyYW5zKFwicG9wdXAuZGVsZXRlX3Nob3dfc3VjY2Vzcy50ZXh0XCIsIHsgXCIldGl0bGUlXCI6IF90aGlzLnRpdGxlIH0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB5ZXM6IEJhc2VfMS5CYXNlLnRyYW5zKFwicG9wdXAuZGVsZXRlX3Nob3dfc3VjY2Vzcy55ZXNcIiksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrX3llczogYWZ0ZXJOb3RpZlxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIC8vIFN1cHByaW1lciBsYSBzw6lyaWUgZHUgY29tcHRlIHV0aWxpc2F0ZXVyXHJcbiAgICAgICAgICAgICAgICBuZXcgUG9wdXBBbGVydCh7XHJcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IEJhc2VfMS5CYXNlLnRyYW5zKFwicG9wdXAuZGVsZXRlX3Nob3cudGl0bGVcIiwgeyBcIiV0aXRsZSVcIjogX3RoaXMudGl0bGUgfSksXHJcbiAgICAgICAgICAgICAgICAgICAgdGV4dDogQmFzZV8xLkJhc2UudHJhbnMoXCJwb3B1cC5kZWxldGVfc2hvdy50ZXh0XCIsIHsgXCIldGl0bGUlXCI6IF90aGlzLnRpdGxlIH0pLFxyXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrX3llczogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5yZW1vdmVGcm9tQWNjb3VudCgpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiBkb25lKCksIGVyciA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXJyICYmIGVyci5jb2RlICE9PSB1bmRlZmluZWQgJiYgZXJyLmNvZGUgPT09IDIwMDQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb25lKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTWVkaWFfMS5NZWRpYS5ub3RpZmljYXRpb24oJ0VycmV1ciBkZSBzdXBwcmVzc2lvbiBkZSBsYSBzw6lyaWUnLCBlcnIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrX25vOiBmdW5jdGlvbiAoKSB7IH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIEFqb3V0ZSB1biBldmVudEhhbmRsZXIgc3VyIGxlcyBib3V0b25zIEFyY2hpdmVyIGV0IEZhdm9yaXNcclxuICAgICAqIEByZXR1cm5zIHt2b2lkfVxyXG4gICAgICovXHJcbiAgICBhZGRFdmVudEJ0bnNBcmNoaXZlQW5kRmF2b3JpcygpIHtcclxuICAgICAgICBjb25zdCBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgbGV0ICRidG5BcmNoaXZlID0galF1ZXJ5KCcjcmVhY3Rqcy1zaG93LWFjdGlvbnMgYnV0dG9uLmJ0bi1hcmNoaXZlJyksICRidG5GYXZvcmlzID0galF1ZXJ5KCcjcmVhY3Rqcy1zaG93LWFjdGlvbnMgYnV0dG9uLmJ0bi1mYXZvcmlzJyk7XHJcbiAgICAgICAgaWYgKCRidG5BcmNoaXZlLmxlbmd0aCA9PT0gMCB8fCAkYnRuRmF2b3Jpcy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgJCgnI3JlYWN0anMtc2hvdy1hY3Rpb25zIGJ1dHRvbjpmaXJzdCcpLmFkZENsYXNzKCdidG4tYXJjaGl2ZScpO1xyXG4gICAgICAgICAgICAkYnRuQXJjaGl2ZSA9IGpRdWVyeSgnI3JlYWN0anMtc2hvdy1hY3Rpb25zIGJ1dHRvbi5idG4tYXJjaGl2ZScpO1xyXG4gICAgICAgICAgICAkKCcjcmVhY3Rqcy1zaG93LWFjdGlvbnMgYnV0dG9uOmxhc3QnKS5hZGRDbGFzcygnYnRuLWZhdm9yaXMnKTtcclxuICAgICAgICAgICAgJGJ0bkZhdm9yaXMgPSBqUXVlcnkoJyNyZWFjdGpzLXNob3ctYWN0aW9ucyBidXR0b24uYnRuLWZhdm9yaXMnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gRXZlbnQgYm91dG9uIEFyY2hpdmVyXHJcbiAgICAgICAgJGJ0bkFyY2hpdmUub2ZmKCdjbGljaycpLmNsaWNrKChlKSA9PiB7XHJcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgaWYgKEJhc2VfMS5CYXNlLmRlYnVnKVxyXG4gICAgICAgICAgICAgICAgY29uc29sZS5ncm91cENvbGxhcHNlZCgnc2hvdy1hcmNoaXZlJyk7XHJcbiAgICAgICAgICAgIC8vIE1ldCDDoCBqb3VyIGxlIGJvdXRvbiBkJ2FyY2hpdmFnZSBkZSBsYSBzw6lyaWVcclxuICAgICAgICAgICAgZnVuY3Rpb24gdXBkYXRlQnRuQXJjaGl2ZShwcm9taXNlLCB0cmFuc2Zvcm0sIGxhYmVsLCBub3RpZikge1xyXG4gICAgICAgICAgICAgICAgcHJvbWlzZS50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCAkcGFyZW50ID0gJChlLmN1cnJlbnRUYXJnZXQpLnBhcmVudCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICQoJ3NwYW4nLCBlLmN1cnJlbnRUYXJnZXQpLmNzcygndHJhbnNmb3JtJywgdHJhbnNmb3JtKTtcclxuICAgICAgICAgICAgICAgICAgICAkKCcubGFiZWwnLCAkcGFyZW50KS50ZXh0KEJhc2VfMS5CYXNlLnRyYW5zKGxhYmVsKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKEJhc2VfMS5CYXNlLmRlYnVnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmdyb3VwRW5kKCk7XHJcbiAgICAgICAgICAgICAgICB9LCBlcnIgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIEJhc2VfMS5CYXNlLm5vdGlmaWNhdGlvbihub3RpZiwgZXJyKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoQmFzZV8xLkJhc2UuZGVidWcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZ3JvdXBFbmQoKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICghX3RoaXMuaXNBcmNoaXZlZCgpKSB7XHJcbiAgICAgICAgICAgICAgICB1cGRhdGVCdG5BcmNoaXZlKF90aGlzLmFyY2hpdmUoKSwgJ3JvdGF0ZSgxODBkZWcpJywgJ3Nob3cuYnV0dG9uLnVuYXJjaGl2ZS5sYWJlbCcsICdFcnJldXIgZFxcJ2FyY2hpdmFnZSBkZSBsYSBzw6lyaWUnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHVwZGF0ZUJ0bkFyY2hpdmUoX3RoaXMudW5hcmNoaXZlKCksICdyb3RhdGUoMGRlZyknLCAnc2hvdy5idXR0b24uYXJjaGl2ZS5sYWJlbCcsICdFcnJldXIgZMOpc2FyY2hpdmFnZSBkZSBsYSBzw6lyaWUnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vIEV2ZW50IGJvdXRvbiBGYXZvcmlzXHJcbiAgICAgICAgJGJ0bkZhdm9yaXMub2ZmKCdjbGljaycpLmNsaWNrKChlKSA9PiB7XHJcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgaWYgKEJhc2VfMS5CYXNlLmRlYnVnKVxyXG4gICAgICAgICAgICAgICAgY29uc29sZS5ncm91cENvbGxhcHNlZCgnc2hvdy1mYXZvcmlzJyk7XHJcbiAgICAgICAgICAgIGlmICghX3RoaXMuaXNGYXZvcml0ZSgpKSB7XHJcbiAgICAgICAgICAgICAgICBfdGhpcy5mYXZvcml0ZSgpXHJcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGpRdWVyeShlLmN1cnJlbnRUYXJnZXQpLmNoaWxkcmVuKCdzcGFuJykucmVwbGFjZVdpdGgoYFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJzdmdDb250YWluZXJcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzdmcgd2lkdGg9XCIyMVwiIGhlaWdodD1cIjE5XCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9XCJNMTUuMTU2LjkxYTUuODg3IDUuODg3IDAgMCAwLTQuNDA2IDIuMDI2QTUuODg3IDUuODg3IDAgMCAwIDYuMzQ0LjkwOUMzLjMyOC45MS45NTggMy4yNTYuOTU4IDYuMjQyYzAgMy42NjYgMy4zMyA2LjY1MyA4LjM3MiAxMS4xOWwxLjQyIDEuMjcxIDEuNDItMS4yOGM1LjA0Mi00LjUyOCA4LjM3Mi03LjUxNSA4LjM3Mi0xMS4xOCAwLTIuOTg3LTIuMzctNS4zMzQtNS4zODYtNS4zMzR6XCI+PC9wYXRoPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zdmc+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+YCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKEJhc2VfMS5CYXNlLmRlYnVnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmdyb3VwRW5kKCk7XHJcbiAgICAgICAgICAgICAgICB9LCBlcnIgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIEJhc2VfMS5CYXNlLm5vdGlmaWNhdGlvbignRXJyZXVyIGRlIGZhdm9yaXMgZGUgbGEgc8OpcmllJywgZXJyKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoQmFzZV8xLkJhc2UuZGVidWcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZ3JvdXBFbmQoKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgX3RoaXMudW5mYXZvcml0ZSgpXHJcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICQoZS5jdXJyZW50VGFyZ2V0KS5jaGlsZHJlbignc3BhbicpLnJlcGxhY2VXaXRoKGBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwic3ZnQ29udGFpbmVyXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3ZnIGZpbGw9XCIjRkZGXCIgd2lkdGg9XCIyMFwiIGhlaWdodD1cIjE5XCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9XCJNMTQuNSAwYy0xLjc0IDAtMy40MS44MS00LjUgMi4wOUM4LjkxLjgxIDcuMjQgMCA1LjUgMCAyLjQyIDAgMCAyLjQyIDAgNS41YzAgMy43OCAzLjQgNi44NiA4LjU1IDExLjU0TDEwIDE4LjM1bDEuNDUtMS4zMkMxNi42IDEyLjM2IDIwIDkuMjggMjAgNS41IDIwIDIuNDIgMTcuNTggMCAxNC41IDB6bS00LjQgMTUuNTVsLS4xLjEtLjEtLjFDNS4xNCAxMS4yNCAyIDguMzkgMiA1LjUgMiAzLjUgMy41IDIgNS41IDJjMS41NCAwIDMuMDQuOTkgMy41NyAyLjM2aDEuODdDMTEuNDYgMi45OSAxMi45NiAyIDE0LjUgMmMyIDAgMy41IDEuNSAzLjUgMy41IDAgMi44OS0zLjE0IDUuNzQtNy45IDEwLjA1elwiPjwvcGF0aD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3ZnPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPmApO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChCYXNlXzEuQmFzZS5kZWJ1ZylcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5ncm91cEVuZCgpO1xyXG4gICAgICAgICAgICAgICAgfSwgZXJyID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBCYXNlXzEuQmFzZS5ub3RpZmljYXRpb24oJ0VycmV1ciBkZSBmYXZvcmlzIGRlIGxhIHPDqXJpZScsIGVycik7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKEJhc2VfMS5CYXNlLmRlYnVnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmdyb3VwRW5kKCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBBam91dGUgbGEgY2xhc3NpZmljYXRpb24gZGFucyBsZXMgZMOpdGFpbHMgZGUgbGEgcmVzc291cmNlXHJcbiAgICAgKi9cclxuICAgIGFkZFJhdGluZygpIHtcclxuICAgICAgICBpZiAoQmFzZV8xLkJhc2UuZGVidWcpXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdhZGRSYXRpbmcnKTtcclxuICAgICAgICBpZiAodGhpcy5yYXRpbmcpIHtcclxuICAgICAgICAgICAgbGV0IHJhdGluZyA9IEJhc2VfMS5CYXNlLnJhdGluZ3NbdGhpcy5yYXRpbmddICE9PSB1bmRlZmluZWQgPyBCYXNlXzEuQmFzZS5yYXRpbmdzW3RoaXMucmF0aW5nXSA6IG51bGw7XHJcbiAgICAgICAgICAgIGlmIChyYXRpbmcgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIC8vIE9uIGFqb3V0ZSBsYSBjbGFzc2lmaWNhdGlvblxyXG4gICAgICAgICAgICAgICAgalF1ZXJ5KCcuYmxvY2tJbmZvcm1hdGlvbnNfX2RldGFpbHMnKVxyXG4gICAgICAgICAgICAgICAgICAgIC5hcHBlbmQoYDxsaSBpZD1cInJhdGluZ1wiPjxzdHJvbmc+Q2xhc3NpZmljYXRpb248L3N0cm9uZz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGltZyBzcmM9XCIke3JhdGluZy5pbWd9XCIgdGl0bGU9XCIke3JhdGluZy50aXRsZX1cIi8+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9saT5gKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogRMOpZmluaXQgbGEgc2Fpc29uIGNvdXJhbnRlXHJcbiAgICAgKiBAcGFyYW0gICB7bnVtYmVyfSBzZWFzb25OdW1iZXIgTGUgbnVtw6lybyBkZSBsYSBzYWlzb24gY291cmFudGVcclxuICAgICAqIEByZXR1cm5zIHtTaG93fSAgTCdpbnN0YW5jZSBkZSBsYSBzw6lyaWVcclxuICAgICAqIEB0aHJvd3MgIHtFcnJvcn0gaWYgc2Vhc29uTnVtYmVyIGlzIG91dCBvZiByYW5nZSBvZiBzZWFzb25zXHJcbiAgICAgKi9cclxuICAgIHNldEN1cnJlbnRTZWFzb24oc2Vhc29uTnVtYmVyKSB7XHJcbiAgICAgICAgaWYgKHNlYXNvbk51bWJlciA8IDAgfHwgc2Vhc29uTnVtYmVyID49IHRoaXMuc2Vhc29ucy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwic2Vhc29uTnVtYmVyIGlzIG91dCBvZiByYW5nZSBvZiBzZWFzb25zXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmN1cnJlbnRTZWFzb24gPSB0aGlzLnNlYXNvbnNbc2Vhc29uTnVtYmVyXTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxufVxyXG5leHBvcnRzLlNob3cgPSBTaG93O1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG5leHBvcnRzLlNpbWlsYXIgPSB2b2lkIDA7XHJcbmNvbnN0IEJhc2VfMSA9IHJlcXVpcmUoXCIuL0Jhc2VcIik7XHJcbmNvbnN0IE1lZGlhXzEgPSByZXF1aXJlKFwiLi9NZWRpYVwiKTtcclxuY29uc3QgU2hvd18xID0gcmVxdWlyZShcIi4vU2hvd1wiKTtcclxuY2xhc3MgU2ltaWxhciBleHRlbmRzIE1lZGlhXzEuTWVkaWEge1xyXG4gICAgLyogSW50ZXJmYWNlIGltcGxNb3ZpZSAqL1xyXG4gICAgYmFja2Ryb3A7XHJcbiAgICBkaXJlY3RvcjtcclxuICAgIG9yaWdpbmFsX3JlbGVhc2VfZGF0ZTtcclxuICAgIG90aGVyX3RpdGxlO1xyXG4gICAgcGxhdGZvcm1fbGlua3M7XHJcbiAgICBwb3N0ZXI7XHJcbiAgICBwcm9kdWN0aW9uX3llYXI7XHJcbiAgICByZWxlYXNlX2RhdGU7XHJcbiAgICBzYWxlX2RhdGU7XHJcbiAgICB0YWdsaW5lO1xyXG4gICAgdG1kYl9pZDtcclxuICAgIHRyYWlsZXI7XHJcbiAgICB1cmw7XHJcbiAgICAvKiBJbnRlcmZhY2UgaW1wbFNob3cgKi9cclxuICAgIGFsaWFzZXM7XHJcbiAgICBjcmVhdGlvbjtcclxuICAgIGNvdW50cnk7XHJcbiAgICBpbWFnZXM7XHJcbiAgICBuYkVwaXNvZGVzO1xyXG4gICAgbmV0d29yaztcclxuICAgIG5leHRfdHJhaWxlcjtcclxuICAgIG5leHRfdHJhaWxlcl9ob3N0O1xyXG4gICAgcmF0aW5nO1xyXG4gICAgcGljdHVyZXM7XHJcbiAgICBwbGF0Zm9ybXM7XHJcbiAgICBzZWFzb25zO1xyXG4gICAgc2hvd3J1bm5lcjtcclxuICAgIHNvY2lhbF9saW5rcztcclxuICAgIHN0YXR1cztcclxuICAgIHRoZXR2ZGJfaWQ7XHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhLCB0eXBlKSB7XHJcbiAgICAgICAgaWYgKHR5cGUuc2luZ3VsYXIgPT09IEJhc2VfMS5NZWRpYVR5cGUubW92aWUpIHtcclxuICAgICAgICAgICAgZGF0YS5pbl9hY2NvdW50ID0gZGF0YS51c2VyLmluX2FjY291bnQ7XHJcbiAgICAgICAgICAgIGRlbGV0ZSBkYXRhLnVzZXIuaW5fYWNjb3VudDtcclxuICAgICAgICAgICAgZGF0YS5kZXNjcmlwdGlvbiA9IGRhdGEuc3lub3BzaXM7XHJcbiAgICAgICAgICAgIGRlbGV0ZSBkYXRhLnN5bm9wc2lzO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzdXBlcihkYXRhKTtcclxuICAgICAgICB0aGlzLm1lZGlhVHlwZSA9IHR5cGU7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZmlsbChkYXRhKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogUmVtcGxpdCBsJ29iamV0IGF2ZWMgbGVzIGRvbm7DqWVzIGZvdXJuaXQgZW4gcGFyYW3DqHRyZVxyXG4gICAgICogQHBhcmFtICB7T2JqfSBkYXRhIExlcyBkb25uw6llcyBwcm92ZW5hbnQgZGUgbCdBUElcclxuICAgICAqIEByZXR1cm5zIHtTaW1pbGFyfVxyXG4gICAgICovXHJcbiAgICBmaWxsKGRhdGEpIHtcclxuICAgICAgICBpZiAodGhpcy5tZWRpYVR5cGUuc2luZ3VsYXIgPT09IEJhc2VfMS5NZWRpYVR5cGUuc2hvdykge1xyXG4gICAgICAgICAgICB0aGlzLmFsaWFzZXMgPSBkYXRhLmFsaWFzZXM7XHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRpb24gPSBkYXRhLmNyZWF0aW9uO1xyXG4gICAgICAgICAgICB0aGlzLmNvdW50cnkgPSBkYXRhLmNvdW50cnk7XHJcbiAgICAgICAgICAgIHRoaXMuaW1hZ2VzID0gbmV3IFNob3dfMS5JbWFnZXMoZGF0YS5pbWFnZXMpO1xyXG4gICAgICAgICAgICB0aGlzLm5iRXBpc29kZXMgPSBwYXJzZUludChkYXRhLmVwaXNvZGVzLCAxMCk7XHJcbiAgICAgICAgICAgIHRoaXMubmV0d29yayA9IGRhdGEubmV0d29yaztcclxuICAgICAgICAgICAgdGhpcy5uZXh0X3RyYWlsZXIgPSBkYXRhLm5leHRfdHJhaWxlcjtcclxuICAgICAgICAgICAgdGhpcy5uZXh0X3RyYWlsZXJfaG9zdCA9IGRhdGEubmV4dF90cmFpbGVyX2hvc3Q7XHJcbiAgICAgICAgICAgIHRoaXMucmF0aW5nID0gZGF0YS5yYXRpbmc7XHJcbiAgICAgICAgICAgIHRoaXMucGxhdGZvcm1zID0gbmV3IFNob3dfMS5QbGF0Zm9ybXMoZGF0YS5wbGF0Zm9ybXMpO1xyXG4gICAgICAgICAgICB0aGlzLnNlYXNvbnMgPSBuZXcgQXJyYXkoKTtcclxuICAgICAgICAgICAgdGhpcy5zaG93cnVubmVyID0gbmV3IFNob3dfMS5TaG93cnVubmVyKGRhdGEuc2hvd3J1bm5lcik7XHJcbiAgICAgICAgICAgIHRoaXMuc29jaWFsX2xpbmtzID0gZGF0YS5zb2NpYWxfbGlua3M7XHJcbiAgICAgICAgICAgIHRoaXMuc3RhdHVzID0gZGF0YS5zdGF0dXM7XHJcbiAgICAgICAgICAgIHRoaXMudGhldHZkYl9pZCA9IHBhcnNlSW50KGRhdGEudGhldHZkYl9pZCwgMTApO1xyXG4gICAgICAgICAgICB0aGlzLnBpY3R1cmVzID0gbmV3IEFycmF5KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHRoaXMubWVkaWFUeXBlLnNpbmd1bGFyID09PSBCYXNlXzEuTWVkaWFUeXBlLm1vdmllKSB7XHJcbiAgICAgICAgICAgIGlmIChkYXRhLnVzZXIuaW5fYWNjb3VudCAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICBkYXRhLmluX2FjY291bnQgPSBkYXRhLnVzZXIuaW5fYWNjb3VudDtcclxuICAgICAgICAgICAgICAgIGRlbGV0ZSBkYXRhLnVzZXIuaW5fYWNjb3VudDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoZGF0YS5zeW5vcHNpcyAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICBkYXRhLmRlc2NyaXB0aW9uID0gZGF0YS5zeW5vcHNpcztcclxuICAgICAgICAgICAgICAgIGRlbGV0ZSBkYXRhLnN5bm9wc2lzO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuYmFja2Ryb3AgPSBkYXRhLmJhY2tkcm9wO1xyXG4gICAgICAgICAgICB0aGlzLmRpcmVjdG9yID0gZGF0YS5kaXJlY3RvcjtcclxuICAgICAgICAgICAgdGhpcy5vcmlnaW5hbF9yZWxlYXNlX2RhdGUgPSBuZXcgRGF0ZShkYXRhLm9yaWdpbmFsX3JlbGVhc2VfZGF0ZSk7XHJcbiAgICAgICAgICAgIHRoaXMub3RoZXJfdGl0bGUgPSBkYXRhLm90aGVyX3RpdGxlO1xyXG4gICAgICAgICAgICB0aGlzLnBsYXRmb3JtX2xpbmtzID0gZGF0YS5wbGF0Zm9ybV9saW5rcztcclxuICAgICAgICAgICAgdGhpcy5wb3N0ZXIgPSBkYXRhLnBvc3RlcjtcclxuICAgICAgICAgICAgdGhpcy5wcm9kdWN0aW9uX3llYXIgPSBwYXJzZUludChkYXRhLnByb2R1Y3Rpb25feWVhcik7XHJcbiAgICAgICAgICAgIHRoaXMucmVsZWFzZV9kYXRlID0gbmV3IERhdGUoZGF0YS5yZWxlYXNlX2RhdGUpO1xyXG4gICAgICAgICAgICB0aGlzLnNhbGVfZGF0ZSA9IG5ldyBEYXRlKGRhdGEuc2FsZV9kYXRlKTtcclxuICAgICAgICAgICAgdGhpcy50YWdsaW5lID0gZGF0YS50YWdsaW5lO1xyXG4gICAgICAgICAgICB0aGlzLnRtZGJfaWQgPSBwYXJzZUludChkYXRhLnRtZGJfaWQpO1xyXG4gICAgICAgICAgICB0aGlzLnRyYWlsZXIgPSBkYXRhLnRyYWlsZXI7XHJcbiAgICAgICAgICAgIHRoaXMudXJsID0gZGF0YS51cmw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHN1cGVyLmZpbGwoZGF0YSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFLDqWN1cMOocmUgbGVzIGRvbm7DqWVzIGRlIGxhIHPDqXJpZSBzdXIgbCdBUElcclxuICAgICAqIEBwYXJhbSAge2Jvb2xlYW59IFtmb3JjZT10cnVlXSAgIEluZGlxdWUgc2kgb24gdXRpbGlzZSBsZXMgZG9ubsOpZXMgZW4gY2FjaGVcclxuICAgICAqIEByZXR1cm4ge1Byb21pc2U8Kj59ICAgICAgICAgICAgIExlcyBkb25uw6llcyBkZSBsYSBzw6lyaWVcclxuICAgICAqL1xyXG4gICAgZmV0Y2goZm9yY2UgPSB0cnVlKSB7XHJcbiAgICAgICAgbGV0IGFjdGlvbiA9ICdkaXNwbGF5JztcclxuICAgICAgICBpZiAodGhpcy5tZWRpYVR5cGUuc2luZ3VsYXIgPT09IEJhc2VfMS5NZWRpYVR5cGUubW92aWUpIHtcclxuICAgICAgICAgICAgYWN0aW9uID0gJ21vdmllJztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIEJhc2VfMS5CYXNlLmNhbGxBcGkoJ0dFVCcsIHRoaXMubWVkaWFUeXBlLnBsdXJhbCwgYWN0aW9uLCB7IGlkOiB0aGlzLmlkIH0sIGZvcmNlKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogQWpvdXRlIGxlIGJhbmRlYXUgVmlld2VkIHN1ciBsZSBwb3N0ZXIgZHUgc2ltaWxhclxyXG4gICAgICogQHJldHVybiB7U2ltaWxhcn1cclxuICAgICAqL1xyXG4gICAgYWRkVmlld2VkKCkge1xyXG4gICAgICAgIC8vIFNpIGxhIHPDqXJpZSBhIMOpdMOpIHZ1ZSBvdSBjb21tZW5jw6llXHJcbiAgICAgICAgaWYgKHRoaXMudXNlci5zdGF0dXMgJiZcclxuICAgICAgICAgICAgKCh0aGlzLm1lZGlhVHlwZS5zaW5ndWxhciA9PT0gQmFzZV8xLk1lZGlhVHlwZS5tb3ZpZSAmJiB0aGlzLnVzZXIuc3RhdHVzID09PSAxKSB8fFxyXG4gICAgICAgICAgICAgICAgKHRoaXMubWVkaWFUeXBlLnNpbmd1bGFyID09PSBCYXNlXzEuTWVkaWFUeXBlLnNob3cgJiYgdGhpcy51c2VyLnN0YXR1cyA+IDApKSkge1xyXG4gICAgICAgICAgICAvLyBPbiBham91dGUgbGUgYmFuZGVhdSBcIlZpZXdlZFwiXHJcbiAgICAgICAgICAgIHRoaXMuZWx0LmZpbmQoJ2Euc2xpZGVfX2ltYWdlJykucHJlcGVuZChgPGltZyBzcmM9XCIke0Jhc2VfMS5CYXNlLnNlcnZlckJhc2VVcmx9L2ltZy92aWV3ZWQucG5nXCIgY2xhc3M9XCJiYW5kVmlld2VkXCIvPmApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogQWpvdXRlIGwnaWPDtG5lIHdyZW5jaCDDoCBjw7R0w6kgZHUgdGl0cmUgZHUgc2ltaWxhclxyXG4gICAgICogcG91ciBwZXJtZXR0cmUgZGUgdmlzdWFsaXNlciBsZXMgZG9ubsOpZXMgZHUgc2ltaWxhclxyXG4gICAgICogQHJldHVybiB7U2ltaWxhcn1cclxuICAgICAqL1xyXG4gICAgd3JlbmNoKCkge1xyXG4gICAgICAgIGNvbnN0ICR0aXRsZSA9IHRoaXMuZWx0LmZpbmQoJy5zbGlkZV9fdGl0bGUnKSwgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgICR0aXRsZS5odG1sKCR0aXRsZS5odG1sKCkgK1xyXG4gICAgICAgICAgICBgPGkgY2xhc3M9XCJmYSBmYS13cmVuY2ggcG9wb3Zlci13cmVuY2hcIlxyXG4gICAgICAgICAgICAgICAgYXJpYS1oaWRkZW49XCJ0cnVlXCJcclxuICAgICAgICAgICAgICAgIHN0eWxlPVwibWFyZ2luLWxlZnQ6NXB4O2N1cnNvcjpwb2ludGVyO1wiXHJcbiAgICAgICAgICAgICAgICBkYXRhLWlkPVwiJHtfdGhpcy5pZH1cIlxyXG4gICAgICAgICAgICAgICAgZGF0YS10eXBlPVwiJHtfdGhpcy5tZWRpYVR5cGUuc2luZ3VsYXJ9XCI+XHJcbiAgICAgICAgICAgIDwvaT5gKTtcclxuICAgICAgICAkdGl0bGUuZmluZCgnLnBvcG92ZXItd3JlbmNoJykuY2xpY2soKGUpID0+IHtcclxuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICBjb25zdCAkZGF0YVJlcyA9ICQoJyNkaWFsb2ctcmVzb3VyY2UgLmRhdGEtcmVzb3VyY2UnKSwgLy8gRE9NRWxlbWVudCBjb250ZW5hbnQgbGUgcmVuZHUgSlNPTiBkZSBsYSByZXNzb3VyY2VcclxuICAgICAgICAgICAgaHRtbCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcclxuICAgICAgICAgICAgY29uc3Qgb25TaG93ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgaHRtbC5zdHlsZS5vdmVyZmxvd1kgPSAnaGlkZGVuJztcclxuICAgICAgICAgICAgICAgIGpRdWVyeSgnI2RpYWxvZy1yZXNvdXJjZScpXHJcbiAgICAgICAgICAgICAgICAgICAgLmNzcygnei1pbmRleCcsICcxMDA1JylcclxuICAgICAgICAgICAgICAgICAgICAuY3NzKCdvdmVyZmxvdycsICdzY3JvbGwnKTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgY29uc3Qgb25IaWRlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgaHRtbC5zdHlsZS5vdmVyZmxvd1kgPSAnJztcclxuICAgICAgICAgICAgICAgIGpRdWVyeSgnI2RpYWxvZy1yZXNvdXJjZScpXHJcbiAgICAgICAgICAgICAgICAgICAgLmNzcygnei1pbmRleCcsICcwJylcclxuICAgICAgICAgICAgICAgICAgICAuY3NzKCdvdmVyZmxvdycsICdub25lJyk7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIC8vaWYgKGRlYnVnKSBjb25zb2xlLmxvZygnUG9wb3ZlciBXcmVuY2gnLCBlbHRJZCwgc2VsZik7XHJcbiAgICAgICAgICAgIHRoaXMuZmV0Y2goKS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAkZGF0YVJlcy5lbXB0eSgpLmFwcGVuZChyZW5kZXJqc29uLnNldF9zaG93X3RvX2xldmVsKDIpKGRhdGFbX3RoaXMubWVkaWFUeXBlLnNpbmd1bGFyXSkpO1xyXG4gICAgICAgICAgICAgICAgalF1ZXJ5KCcjZGlhbG9nLXJlc291cmNlLXRpdGxlIHNwYW4uY291bnRlcicpLmVtcHR5KCkudGV4dCgnKCcgKyBCYXNlXzEuQmFzZS5jb3VudGVyICsgJyBhcHBlbHMgQVBJKScpO1xyXG4gICAgICAgICAgICAgICAgalF1ZXJ5KCcjZGlhbG9nLXJlc291cmNlJykuc2hvdyg0MDAsIG9uU2hvdyk7XHJcbiAgICAgICAgICAgICAgICBqUXVlcnkoJyNkaWFsb2ctcmVzb3VyY2UgLmNsb3NlJykuY2xpY2soKGUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgICAgICBqUXVlcnkoJyNkaWFsb2ctcmVzb3VyY2UnKS5oaWRlKDQwMCwgb25IaWRlKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogUmV0b3VybmUgbGUgY29udGVudSBIVE1MIHBvdXIgbGEgcG9wdXBcclxuICAgICAqIGRlIHByw6lzZW50YXRpb24gZHUgc2ltaWxhclxyXG4gICAgICogQHJldHVybiB7c3RyaW5nfVxyXG4gICAgICovXHJcbiAgICBnZXRDb250ZW50UG9wdXAoKSB7XHJcbiAgICAgICAgY29uc3QgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgIC8vaWYgKGRlYnVnKSBjb25zb2xlLmxvZygnc2ltaWxhcnMgdGVtcENvbnRlbnRQb3B1cCcsIG9ialJlcyk7XHJcbiAgICAgICAgbGV0IGRlc2NyaXB0aW9uID0gdGhpcy5kZXNjcmlwdGlvbjtcclxuICAgICAgICBpZiAoZGVzY3JpcHRpb24ubGVuZ3RoID4gMjAwKSB7XHJcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uID0gZGVzY3JpcHRpb24uc3Vic3RyaW5nKDAsIDIwMCkgKyAn4oCmJztcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHRlbXBsYXRlID0gJyc7XHJcbiAgICAgICAgZnVuY3Rpb24gX3JlbmRlckNyZWF0aW9uKCkge1xyXG4gICAgICAgICAgICBsZXQgaHRtbCA9ICcnO1xyXG4gICAgICAgICAgICBpZiAoX3RoaXMuY3JlYXRpb24gfHwgX3RoaXMuY291bnRyeSB8fCBfdGhpcy5wcm9kdWN0aW9uX3llYXIpIHtcclxuICAgICAgICAgICAgICAgIGh0bWwgKz0gJzxwPic7XHJcbiAgICAgICAgICAgICAgICBpZiAoX3RoaXMuY3JlYXRpb24pIHtcclxuICAgICAgICAgICAgICAgICAgICBodG1sICs9IGA8dT5DcsOpYXRpb246PC91PiA8c3Ryb25nPiR7X3RoaXMuY3JlYXRpb259PC9zdHJvbmc+YDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChfdGhpcy5wcm9kdWN0aW9uX3llYXIpIHtcclxuICAgICAgICAgICAgICAgICAgICBodG1sICs9IGA8dT5Qcm9kdWN0aW9uOjwvdT4gPHN0cm9uZz4ke190aGlzLnByb2R1Y3Rpb25feWVhcn08L3N0cm9uZz5gO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKF90aGlzLmNvdW50cnkpIHtcclxuICAgICAgICAgICAgICAgICAgICBodG1sICs9IGAsIDx1PlBheXM6PC91PiA8c3Ryb25nPiR7X3RoaXMuY291bnRyeX08L3N0cm9uZz5gO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaHRtbCArPSAnPC9wPic7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGh0bWw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZ1bmN0aW9uIF9yZW5kZXJHZW5yZXMoKSB7XHJcbiAgICAgICAgICAgIGlmIChfdGhpcy5nZW5yZXMgJiYgX3RoaXMuZ2VucmVzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAnPHA+PHU+R2VucmVzOjwvdT4gJyArIF90aGlzLmdlbnJlcy5qb2luKCcsICcpICsgJzwvcD4nO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiAnJztcclxuICAgICAgICB9XHJcbiAgICAgICAgdGVtcGxhdGUgPSAnPGRpdj4nO1xyXG4gICAgICAgIGlmICh0aGlzLm1lZGlhVHlwZS5zaW5ndWxhciA9PT0gQmFzZV8xLk1lZGlhVHlwZS5zaG93KSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHN0YXR1cyA9IHRoaXMuc3RhdHVzLnRvTG93ZXJDYXNlKCkgPT0gJ2VuZGVkJyA/ICdUZXJtaW7DqWUnIDogJ0VuIGNvdXJzJztcclxuICAgICAgICAgICAgY29uc3Qgc2VlbiA9ICh0aGlzLnVzZXIuc3RhdHVzID4gMCkgPyAnVnUgw6AgPHN0cm9uZz4nICsgdGhpcy51c2VyLnN0YXR1cyArICclPC9zdHJvbmc+JyA6ICdQYXMgdnUnO1xyXG4gICAgICAgICAgICB0ZW1wbGF0ZSArPSBgPHA+PHN0cm9uZz4ke3RoaXMuc2Vhc29ucy5sZW5ndGh9PC9zdHJvbmc+IHNhaXNvbiR7KHRoaXMuc2Vhc29ucy5sZW5ndGggPiAxID8gJ3MnIDogJycpfSwgPHN0cm9uZz4ke3RoaXMubmJFcGlzb2Rlc308L3N0cm9uZz4gw6lwaXNvZGVzLCBgO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5vYmpOb3RlLnRvdGFsID4gMCkge1xyXG4gICAgICAgICAgICAgICAgdGVtcGxhdGUgKz0gYDxzdHJvbmc+JHt0aGlzLm9iak5vdGUudG90YWx9PC9zdHJvbmc+IHZvdGVzYDtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9iak5vdGUudXNlciA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZSArPSBgLCB2b3RyZSBub3RlOiAke3RoaXMub2JqTm90ZS51c2VyfWA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZSArPSAnPC9wPic7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZSArPSAnQXVjdW4gdm90ZTwvcD4nO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5pbl9hY2NvdW50KSB7XHJcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZSArPSAnPHA+PGEgaHJlZj1cImphdmFzY3JpcHQ6O1wiIGNsYXNzPVwiYWRkU2hvd1wiPkFqb3V0ZXI8L2E+PC9wPic7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGVtcGxhdGUgKz0gX3JlbmRlckdlbnJlcygpO1xyXG4gICAgICAgICAgICB0ZW1wbGF0ZSArPSBfcmVuZGVyQ3JlYXRpb24oKTtcclxuICAgICAgICAgICAgbGV0IGFyY2hpdmVkID0gJyc7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnVzZXIuc3RhdHVzID4gMCAmJiB0aGlzLnVzZXIuYXJjaGl2ZWQgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgICAgIGFyY2hpdmVkID0gJywgQXJjaGl2w6llOiA8aSBjbGFzcz1cImZhIGZhLWNoZWNrLWNpcmNsZS1vXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+PC9pPic7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAodGhpcy51c2VyLnN0YXR1cyA+IDApIHtcclxuICAgICAgICAgICAgICAgIGFyY2hpdmVkID0gJywgQXJjaGl2w6llOiA8aSBjbGFzcz1cImZhIGZhLWNpcmNsZS1vXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+PC9pPic7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHRoaXMuc2hvd3J1bm5lciAmJiB0aGlzLnNob3dydW5uZXIubmFtZS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZSArPSBgPHA+PHU+U2hvdyBSdW5uZXI6PC91PiA8c3Ryb25nPiR7dGhpcy5zaG93cnVubmVyLm5hbWV9PC9zdHJvbmc+PC9wPmA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGVtcGxhdGUgKz0gYDxwPjx1PlN0YXR1dDo8L3U+IDxzdHJvbmc+JHtzdGF0dXN9PC9zdHJvbmc+LCAke3NlZW59JHthcmNoaXZlZH08L3A+YDtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gbW92aWVcclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGVtcGxhdGUgKz0gJzxwPic7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm9iak5vdGUudG90YWwgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZSArPSBgPHN0cm9uZz4ke3RoaXMub2JqTm90ZS50b3RhbH08L3N0cm9uZz4gdm90ZXNgO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub2JqTm90ZS51c2VyID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlICs9IGAsIHZvdHJlIG5vdGU6ICR7dGhpcy5vYmpOb3RlLnVzZXJ9YDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRlbXBsYXRlICs9ICdBdWN1biB2b3RlJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0ZW1wbGF0ZSArPSAnPC9wPic7XHJcbiAgICAgICAgICAgIC8vIEFqb3V0ZXIgdW5lIGNhc2Ugw6AgY29jaGVyIHBvdXIgbCfDqXRhdCBcIlZ1XCJcclxuICAgICAgICAgICAgdGVtcGxhdGUgKz0gYDxwPjxsYWJlbCBmb3I9XCJzZWVuXCI+VnU8L2xhYmVsPlxyXG4gICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJjaGVja2JveFwiIGNsYXNzPVwibW92aWUgbW92aWVTZWVuXCIgbmFtZT1cInNlZW5cIiBkYXRhLW1vdmllPVwiJHt0aGlzLmlkfVwiICR7dGhpcy51c2VyLnN0YXR1cyA9PT0gMSA/ICdjaGVja2VkJyA6ICcnfSBzdHlsZT1cIm1hcmdpbi1yaWdodDo1cHg7XCI+PC9pbnB1dD5gO1xyXG4gICAgICAgICAgICAvLyBBam91dGVyIHVuZSBjYXNlIMOgIGNvY2hlciBwb3VyIGwnw6l0YXQgXCJBIHZvaXJcIlxyXG4gICAgICAgICAgICB0ZW1wbGF0ZSArPSBgPGxhYmVsIGZvcj1cIm11c3RTZWVcIj5BIHZvaXI8L2xhYmVsPlxyXG4gICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJjaGVja2JveFwiIGNsYXNzPVwibW92aWUgbW92aWVNdXN0U2VlXCIgbmFtZT1cIm11c3RTZWVcIiBkYXRhLW1vdmllPVwiJHt0aGlzLmlkfVwiICR7dGhpcy51c2VyLnN0YXR1cyA9PT0gMCA/ICdjaGVja2VkJyA6ICcnfSBzdHlsZT1cIm1hcmdpbi1yaWdodDo1cHg7XCI+PC9pbnB1dD5gO1xyXG4gICAgICAgICAgICAvLyBBam91dGVyIHVuZSBjYXNlIMOgIGNvY2hlciBwb3VyIGwnw6l0YXQgXCJOZSBwYXMgdm9pclwiXHJcbiAgICAgICAgICAgIHRlbXBsYXRlICs9IGA8bGFiZWwgZm9yPVwibm90U2VlXCI+TmUgcGFzIHZvaXI8L2xhYmVsPlxyXG4gICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJjaGVja2JveFwiIGNsYXNzPVwibW92aWUgbW92aWVOb3RTZWVcIiBuYW1lPVwibm90U2VlXCIgZGF0YS1tb3ZpZT1cIiR7dGhpcy5pZH1cIiAgJHt0aGlzLnVzZXIuc3RhdHVzID09PSAyID8gJ2NoZWNrZWQnIDogJyd9PjwvaW5wdXQ+PC9wPmA7XHJcbiAgICAgICAgICAgIHRlbXBsYXRlICs9IF9yZW5kZXJHZW5yZXMoKTtcclxuICAgICAgICAgICAgdGVtcGxhdGUgKz0gX3JlbmRlckNyZWF0aW9uKCk7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmRpcmVjdG9yKSB7XHJcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZSArPSBgPHA+PHU+UsOpYWxpc2F0ZXVyOjwvdT4gPHN0cm9uZz4ke3RoaXMuZGlyZWN0b3J9PC9zdHJvbmc+PC9wPmA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRlbXBsYXRlICsgYDxwPiR7ZGVzY3JpcHRpb259PC9wPjwvZGl2PmA7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFJldG91cm5lIGxlIGNvbnRlbnUgSFRNTCBkdSB0aXRyZSBkZSBsYSBwb3B1cFxyXG4gICAgICogQHJldHVybiB7c3RyaW5nfVxyXG4gICAgICovXHJcbiAgICBnZXRUaXRsZVBvcHVwKCkge1xyXG4gICAgICAgIGlmIChCYXNlXzEuQmFzZS5kZWJ1ZylcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ2dldFRpdGxlUG9wdXAnLCB0aGlzKTtcclxuICAgICAgICBsZXQgdGl0bGUgPSB0aGlzLnRpdGxlO1xyXG4gICAgICAgIGlmICh0aGlzLm9iak5vdGUudG90YWwgPiAwKSB7XHJcbiAgICAgICAgICAgIHRpdGxlICs9ICcgPHNwYW4gc3R5bGU9XCJmb250LXNpemU6IDAuOGVtO2NvbG9yOiMwMDA7XCI+JyArXHJcbiAgICAgICAgICAgICAgICB0aGlzLm9iak5vdGUubWVhbi50b0ZpeGVkKDIpICsgJyAvIDU8L3NwYW4+JztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRpdGxlO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBNZXQgw6Agam91ciBsJ2F0dHJpYnV0IHRpdGxlIGRlIGxhIG5vdGUgZHUgc2ltaWxhclxyXG4gICAgICogQHBhcmFtICB7Qm9vbGVhbn0gY2hhbmdlIEluZGlxdWUgc2kgaWwgZmF1dCBtb2RpZmllciBsJ2F0dHJpYnV0XHJcbiAgICAgKiBAcmV0dXJuIHtzdHJpbmd9ICAgICAgICAgTGEgdmFsZXVyIG1vZGlmacOpZSBkZSBsJ2F0dHJpYnV0IHRpdGxlXHJcbiAgICAgKi9cclxuICAgIHVwZGF0ZVRpdGxlTm90ZShjaGFuZ2UgPSB0cnVlKSB7XHJcbiAgICAgICAgY29uc3QgJGVsdCA9IHRoaXMuZWx0LmZpbmQoJy5zdGFycy1vdXRlcicpO1xyXG4gICAgICAgIGlmICh0aGlzLm9iak5vdGUubWVhbiA8PSAwIHx8IHRoaXMub2JqTm90ZS50b3RhbCA8PSAwKSB7XHJcbiAgICAgICAgICAgIGlmIChjaGFuZ2UpXHJcbiAgICAgICAgICAgICAgICAkZWx0LmF0dHIoJ3RpdGxlJywgJ0F1Y3VuIHZvdGUnKTtcclxuICAgICAgICAgICAgcmV0dXJuICcnO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCB0aXRsZSA9IHRoaXMub2JqTm90ZS50b1N0cmluZygpO1xyXG4gICAgICAgIGlmIChjaGFuZ2UpIHtcclxuICAgICAgICAgICAgJGVsdC5hdHRyKCd0aXRsZScsIHRpdGxlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRpdGxlO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBBam91dGUgbGEgbm90ZSwgc291cyBmb3JtZSBkJ8OpdG9pbGVzLCBkdSBzaW1pbGFyIHNvdXMgc29uIHRpdHJlXHJcbiAgICAgKiBAcmV0dXJuIHtTaW1pbGFyfVxyXG4gICAgICovXHJcbiAgICByZW5kZXJTdGFycygpIHtcclxuICAgICAgICAvLyBPbiBham91dGUgbGUgY29kZSBIVE1MIHBvdXIgbGUgcmVuZHUgZGUgbGEgbm90ZVxyXG4gICAgICAgIHRoaXMuZWx0LmZpbmQoJy5zbGlkZV9fdGl0bGUnKS5hZnRlcignPGRpdiBjbGFzcz1cInN0YXJzLW91dGVyXCI+PGRpdiBjbGFzcz1cInN0YXJzLWlubmVyXCI+PC9kaXY+PC9kaXY+Jyk7XHJcbiAgICAgICAgdGhpcy51cGRhdGVUaXRsZU5vdGUoKTtcclxuICAgICAgICB0aGlzLmVsdC5maW5kKCcuc3RhcnMtaW5uZXInKS53aWR0aCh0aGlzLm9iak5vdGUuZ2V0UGVyY2VudGFnZSgpICsgJyUnKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogVsOpcmlmaWUgbGEgcHLDqXNlbmNlIGRlIGwnaW1hZ2UgZHUgc2ltaWxhclxyXG4gICAgICogZXQgdGVudGUgZCdlbiB0cm91dmVyIHVuZSBzaSBjZWxsZS1jaSBuJ2VzdCBwYXMgcHLDqXNlbnRlXHJcbiAgICAgKiBAcmV0dXJuIHtTaW1pbGFyfVxyXG4gICAgICovXHJcbiAgICBjaGVja0ltZygpIHtcclxuICAgICAgICBjb25zdCAkaW1nID0gdGhpcy5lbHQuZmluZCgnaW1nLmpzLWxhenktaW1hZ2UnKSwgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgIGlmICgkaW1nLmxlbmd0aCA8PSAwKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm1lZGlhVHlwZS5zaW5ndWxhciA9PT0gQmFzZV8xLk1lZGlhVHlwZS5zaG93ICYmIHRoaXMudGhldHZkYl9pZCAmJiB0aGlzLnRoZXR2ZGJfaWQgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBPbiB0ZW50ZSBkZSByZW1wbGFjZXIgbGUgYmxvY2sgZGl2IDQwNCBwYXIgdW5lIGltYWdlXHJcbiAgICAgICAgICAgICAgICB0aGlzLmVsdC5maW5kKCdkaXYuYmxvY2s0MDQnKS5yZXBsYWNlV2l0aChgXHJcbiAgICAgICAgICAgICAgICAgICAgPGltZyBjbGFzcz1cInUtb3BhY2l0eUJhY2tncm91bmQgZmFkZS1pblwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aD1cIjEyNVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ9XCIxODhcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWx0PVwiUG9zdGVyIGRlICR7dGhpcy50aXRsZX1cIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3JjPVwiaHR0cHM6Ly9hcnR3b3Jrcy50aGV0dmRiLmNvbS9iYW5uZXJzL3Bvc3RlcnMvJHt0aGlzLnRoZXR2ZGJfaWR9LTEuanBnXCIvPmApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMubWVkaWFUeXBlLnNpbmd1bGFyID09PSBCYXNlXzEuTWVkaWFUeXBlLm1vdmllICYmIHRoaXMudG1kYl9pZCAmJiB0aGlzLnRtZGJfaWQgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoQmFzZV8xLkJhc2UudGhlbW92aWVkYl9hcGlfdXNlcl9rZXkubGVuZ3RoIDw9IDApXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdXJpQXBpVG1kYiA9IGBodHRwczovL2FwaS50aGVtb3ZpZWRiLm9yZy8zL21vdmllLyR7dGhpcy50bWRiX2lkfT9hcGlfa2V5PSR7QmFzZV8xLkJhc2UudGhlbW92aWVkYl9hcGlfdXNlcl9rZXl9Jmxhbmd1YWdlPWZyLUZSYDtcclxuICAgICAgICAgICAgICAgIGZldGNoKHVyaUFwaVRtZGIpLnRoZW4ocmVzcG9uc2UgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghcmVzcG9uc2Uub2spXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5qc29uKCk7XHJcbiAgICAgICAgICAgICAgICB9KS50aGVuKGRhdGEgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChkYXRhICE9PSBudWxsICYmIGRhdGEucG9zdGVyX3BhdGggIT09IHVuZGVmaW5lZCAmJiBkYXRhLnBvc3Rlcl9wYXRoICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLmVsdC5maW5kKCdkaXYuYmxvY2s0MDQnKS5yZXBsYWNlV2l0aChgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aW1nIGNsYXNzPVwidS1vcGFjaXR5QmFja2dyb3VuZCBmYWRlLWluXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg9XCIxMjVcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ9XCIxODhcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbHQ9XCJQb3N0ZXIgZGUgJHtfdGhpcy50aXRsZX1cIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcmM9XCJodHRwczovL2ltYWdlLnRtZGIub3JnL3QvcC9vcmlnaW5hbCR7ZGF0YS5wb3N0ZXJfcGF0aH1cIi8+YCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIEFkZCBTaG93IHRvIGFjY291bnQgbWVtYmVyXHJcbiAgICAgKiBAcmV0dXJuIHtQcm9taXNlPFNpbWlsYXI+fSBQcm9taXNlIG9mIHNob3dcclxuICAgICAqL1xyXG4gICAgYWRkVG9BY2NvdW50KHN0YXRlID0gMCkge1xyXG4gICAgICAgIGNvbnN0IF90aGlzID0gdGhpcztcclxuICAgICAgICBpZiAodGhpcy5pbl9hY2NvdW50KVxyXG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiByZXNvbHZlKF90aGlzKSk7XHJcbiAgICAgICAgbGV0IHBhcmFtcyA9IHsgaWQ6IHRoaXMuaWQgfTtcclxuICAgICAgICBpZiAodGhpcy5tZWRpYVR5cGUuc2luZ3VsYXIgPT09IEJhc2VfMS5NZWRpYVR5cGUubW92aWUpIHtcclxuICAgICAgICAgICAgcGFyYW1zLnN0YXRlID0gc3RhdGU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIEJhc2VfMS5CYXNlLmNhbGxBcGkoJ1BPU1QnLCBfdGhpcy5tZWRpYVR5cGUucGx1cmFsLCBfdGhpcy5tZWRpYVR5cGUuc2luZ3VsYXIsIHBhcmFtcylcclxuICAgICAgICAgICAgICAgIC50aGVuKGRhdGEgPT4ge1xyXG4gICAgICAgICAgICAgICAgX3RoaXMuZmlsbChkYXRhW190aGlzLm1lZGlhVHlwZS5zaW5ndWxhcl0pLnNhdmUoKTtcclxuICAgICAgICAgICAgICAgIHJlc29sdmUoX3RoaXMpO1xyXG4gICAgICAgICAgICB9LCBlcnIgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmVqZWN0KGVycik7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMuU2ltaWxhciA9IFNpbWlsYXI7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbmV4cG9ydHMuU3VidGl0bGUgPSB2b2lkIDA7XHJcbmNsYXNzIFN1YnRpdGxlIHtcclxuICAgIGNvbnN0cnVjdG9yKGRhdGEpIHtcclxuICAgICAgICB0aGlzLmlkID0gcGFyc2VJbnQoZGF0YS5pZCwgMTApO1xyXG4gICAgICAgIHRoaXMubGFuZ3VhZ2UgPSBkYXRhLmxhbmd1YWdlO1xyXG4gICAgICAgIHRoaXMuc291cmNlID0gZGF0YS5zb3VyY2U7XHJcbiAgICAgICAgdGhpcy5xdWFsaXR5ID0gcGFyc2VJbnQoZGF0YS5xdWFsaXR5LCAxMCk7XHJcbiAgICAgICAgdGhpcy5maWxlID0gZGF0YS5maWxlO1xyXG4gICAgICAgIHRoaXMudXJsID0gZGF0YS51cmw7XHJcbiAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUoZGF0YS5kYXRlKTtcclxuICAgIH1cclxuICAgIGlkO1xyXG4gICAgbGFuZ3VhZ2U7XHJcbiAgICBzb3VyY2U7XHJcbiAgICBxdWFsaXR5O1xyXG4gICAgZmlsZTtcclxuICAgIHVybDtcclxuICAgIGRhdGU7XHJcbn1cclxuZXhwb3J0cy5TdWJ0aXRsZSA9IFN1YnRpdGxlO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG5leHBvcnRzLlVwZGF0ZUF1dG8gPSB2b2lkIDA7XHJcbmNvbnN0IEJhc2VfMSA9IHJlcXVpcmUoXCIuL0Jhc2VcIik7XHJcbmNsYXNzIFVwZGF0ZUF1dG8ge1xyXG4gICAgc3RhdGljIGluc3RhbmNlO1xyXG4gICAgc3RhdGljIGludGVydmFscyA9IFtcclxuICAgICAgICB7IHZhbDogMCwgbGFiZWw6ICdKYW1haXMnIH0sXHJcbiAgICAgICAgeyB2YWw6IDEsIGxhYmVsOiAnMSBtaW4uJyB9LFxyXG4gICAgICAgIHsgdmFsOiA1LCBsYWJlbDogJzUgbWluLicgfSxcclxuICAgICAgICB7IHZhbDogMTAsIGxhYmVsOiAnMTAgbWluLicgfSxcclxuICAgICAgICB7IHZhbDogMTUsIGxhYmVsOiAnMTUgbWluLicgfSxcclxuICAgICAgICB7IHZhbDogMzAsIGxhYmVsOiAnMzAgbWluLicgfSxcclxuICAgICAgICB7IHZhbDogNDUsIGxhYmVsOiAnNDUgbWluLicgfSxcclxuICAgICAgICB7IHZhbDogNjAsIGxhYmVsOiAnNjAgbWluLicgfVxyXG4gICAgXTtcclxuICAgIF9zaG93O1xyXG4gICAgX3Nob3dJZDtcclxuICAgIF9leGlzdDtcclxuICAgIF9zdGF0dXM7XHJcbiAgICBfYXV0bztcclxuICAgIF9pbnRlcnZhbDtcclxuICAgIF90aW1lcjtcclxuICAgIGNvbnN0cnVjdG9yKHNob3cpIHtcclxuICAgICAgICB0aGlzLl9zaG93ID0gc2hvdztcclxuICAgICAgICB0aGlzLl9zaG93SWQgPSBzaG93LmlkO1xyXG4gICAgICAgIGxldCBvYmpVcEF1dG8gPSBHTV9nZXRWYWx1ZSgnb2JqVXBBdXRvJyk7XHJcbiAgICAgICAgdGhpcy5fZXhpc3QgPSBmYWxzZTtcclxuICAgICAgICBpZiAob2JqVXBBdXRvW3RoaXMuX3Nob3dJZF0gIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICB0aGlzLl9leGlzdCA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMuX3N0YXR1cyA9IG9ialVwQXV0b1t0aGlzLl9zaG93SWRdLnN0YXR1cztcclxuICAgICAgICAgICAgdGhpcy5fYXV0byA9IG9ialVwQXV0b1t0aGlzLl9zaG93SWRdLmF1dG87XHJcbiAgICAgICAgICAgIHRoaXMuX2ludGVydmFsID0gb2JqVXBBdXRvW3RoaXMuX3Nob3dJZF0uaW50ZXJ2YWw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLl9zdGF0dXMgPSBmYWxzZTsgLy8gU3RhdHV0IGRlIGxhIHTDomNoZSBkJ3VwZGF0ZVxyXG4gICAgICAgICAgICB0aGlzLl9hdXRvID0gZmFsc2U7IC8vIEF1dG9yaXNlIGwnYWN0aXZhdGlvbiBkZSBsYSB0w6JjaGUgZCd1cGRhdGUgZGVzIMOpcGlzb2Rlc1xyXG4gICAgICAgICAgICB0aGlzLl9pbnRlcnZhbCA9IDA7IC8vIEludGVydmFsbGUgZGUgdGVtcHMgZW50cmUgbGVzIG1pc2VzIMOgIGpvdXJcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5jaGFuZ2VDb2xvckJ0bigpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgc3RhdGljIGdldEluc3RhbmNlKHMpIHtcclxuICAgICAgICBpZiAoIVVwZGF0ZUF1dG8uaW5zdGFuY2UpIHtcclxuICAgICAgICAgICAgVXBkYXRlQXV0by5pbnN0YW5jZSA9IG5ldyBVcGRhdGVBdXRvKHMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gVXBkYXRlQXV0by5pbnN0YW5jZTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogX3NhdmUgLSBTYXV2ZWdhcmRlIGxlcyBvcHRpb25zIGRlIGxhIHTDomNoZSBkJ3VwZGF0ZVxyXG4gICAgICogYXV0byBkYW5zIGwnZXNwYWNlIGRlIHN0b2NrYWdlIGRlIFRhbXBlcm1vbmtleVxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm4ge1VwZGF0ZUF1dG99IEwnaW5zdGFuY2UgdW5pcXVlIFVwZGF0ZUF1dG9cclxuICAgICAqL1xyXG4gICAgX3NhdmUoKSB7XHJcbiAgICAgICAgbGV0IG9ialVwQXV0byA9IEdNX2dldFZhbHVlKCdvYmpVcEF1dG8nKTtcclxuICAgICAgICBsZXQgb2JqID0ge1xyXG4gICAgICAgICAgICBzdGF0dXM6IHRoaXMuX3N0YXR1cyxcclxuICAgICAgICAgICAgYXV0bzogdGhpcy5fYXV0byxcclxuICAgICAgICAgICAgaW50ZXJ2YWw6IHRoaXMuX2ludGVydmFsXHJcbiAgICAgICAgfTtcclxuICAgICAgICBvYmpVcEF1dG9bdGhpcy5fc2hvd0lkXSA9IG9iajtcclxuICAgICAgICBHTV9zZXRWYWx1ZSgnb2JqVXBBdXRvJywgb2JqVXBBdXRvKTtcclxuICAgICAgICB0aGlzLl9leGlzdCA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5jaGFuZ2VDb2xvckJ0bigpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBnZXQgc3RhdHVzIC0gUmV0b3VybmUgbGUgc3RhdHV0IGRlIGxhIHTDomNoZSBkJ3VwZGF0ZSBhdXRvXHJcbiAgICAgKiBkZXMgw6lwaXNvZGVzXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn0gIExlIHN0YXR1dFxyXG4gICAgICovXHJcbiAgICBnZXQgc3RhdHVzKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zdGF0dXM7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIHNldCBzdGF0dXMgLSBNb2RpZmllIGxlIHN0YXR1dCBkZSBsYSB0w6JjaGUgZCd1cGRhdGUgYXV0b1xyXG4gICAgICogZGVzIMOpcGlzb2Rlc1xyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSAge2Jvb2xlYW59IHN0YXR1cyBMZSBzdGF0dXQgZGUgbGEgdMOiY2hlXHJcbiAgICAgKi9cclxuICAgIHNldCBzdGF0dXMoc3RhdHVzKSB7XHJcbiAgICAgICAgdGhpcy5fc3RhdHVzID0gc3RhdHVzO1xyXG4gICAgICAgIHRoaXMuX3NhdmUoKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogZ2V0IGF1dG8gLSBGbGFnIGluZGlxdWFudCBsJ2F1dG9yaXNhdGlvbiBkZSBwb3V2b2lyIGxhbmNlclxyXG4gICAgICogbGEgdMOiY2hlIGQndXBkYXRlIGF1dG9cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJuIHtib29sZWFufSAgRmxhZyBkJ2F1dG9yaXNhdGlvblxyXG4gICAgICovXHJcbiAgICBnZXQgYXV0bygpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fYXV0bztcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogc2V0IGF1dG8gLSBNb2RpZmllIGwnYXV0b3Jpc2F0aW9uIGRlIGxhbmNlciBsYSB0w6JjaGVcclxuICAgICAqIGQndXBkYXRlIGF1dG9cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gIHtib29sZWFufSBhdXRvIExlIGZsYWdcclxuICAgICAqL1xyXG4gICAgc2V0IGF1dG8oYXV0bykge1xyXG4gICAgICAgIHRoaXMuX2F1dG8gPSBhdXRvO1xyXG4gICAgICAgIHRoaXMuX3NhdmUoKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogZ2V0IGludGVydmFsIC0gUmV0b3VybmUgbCdpbnRlcnZhbGxlIGRlIHRlbXBzIGVudHJlXHJcbiAgICAgKiBjaGFxdWUgdXBkYXRlIGF1dG9cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJuIHtudW1iZXJ9ICBMJ2ludGVydmFsbGUgZGUgdGVtcHMgZW4gbWludXRlc1xyXG4gICAgICovXHJcbiAgICBnZXQgaW50ZXJ2YWwoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ludGVydmFsO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBzZXQgaW50ZXJ2YWwgLSBEw6lmaW5pdCBsJ2ludGVydmFsbGUgZGUgdGVtcHMsIGVuIG1pbnV0ZXMsXHJcbiAgICAgKiBlbnRyZSBjaGFxdWUgdXBkYXRlIGF1dG9cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gIHtudW1iZXJ9IHZhbCBMJ2ludGVydmFsbGUgZGUgdGVtcHMgZW4gbWludXRlc1xyXG4gICAgICovXHJcbiAgICBzZXQgaW50ZXJ2YWwodmFsKSB7XHJcbiAgICAgICAgdGhpcy5faW50ZXJ2YWwgPSB2YWw7XHJcbiAgICAgICAgdGhpcy5fc2F2ZSgpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBjaGFuZ2VDb2xvckJ0biAtIE1vZGlmaWUgbGEgY291bGV1ciBkdSBib3V0b24gZCd1cGRhdGVcclxuICAgICAqIGRlcyDDqXBpc29kZXMgc3VyIGxhIHBhZ2UgV2ViXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybiB7VXBkYXRlQXV0b30gTCdpbnN0YW5jZSB1bmlxdWUgVXBkYXRlQXV0b1xyXG4gICAgICovXHJcbiAgICBjaGFuZ2VDb2xvckJ0bigpIHtcclxuICAgICAgICBsZXQgY29sb3IgPSAnI2ZmZic7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9leGlzdCkge1xyXG4gICAgICAgICAgICBjb2xvciA9ICcjNmM3NTdkJzsgLy8gZ3JleVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh0aGlzLl9zdGF0dXMgJiYgdGhpcy5fYXV0bykge1xyXG4gICAgICAgICAgICBjb2xvciA9ICdncmVlbic7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHRoaXMuX2F1dG8gJiYgIXRoaXMuX3N0YXR1cykge1xyXG4gICAgICAgICAgICBjb2xvciA9ICdvcmFuZ2UnO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICghdGhpcy5fYXV0byAmJiAhdGhpcy5fc3RhdHVzKSB7XHJcbiAgICAgICAgICAgIGNvbG9yID0gJ3JlZCc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgICQoJy51cGRhdGVFcGlzb2RlcycpLmNzcygnY29sb3InLCBjb2xvcik7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIHN0b3AgLSBQZXJtZXQgZGUgc3RvcHBlciBsYSB0w6JjaGUgZCd1cGRhdGUgYXV0byBldFxyXG4gICAgICogYXVzc2kgZGUgbW9kaWZpZXIgbGUgZmxhZyBldCBsJ2ludGVydmFsbGUgZW4gZm9uY3Rpb25cclxuICAgICAqIGRlIGwnw6l0YXQgZGUgbGEgc8OpcmllXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybiB7VXBkYXRlQXV0b30gTCdpbnN0YW5jZSB1bmlxdWUgVXBkYXRlQXV0b1xyXG4gICAgICovXHJcbiAgICBzdG9wKCkge1xyXG4gICAgICAgIGlmICh0aGlzLl9zaG93LnVzZXIucmVtYWluaW5nIDw9IDAgJiYgdGhpcy5fc2hvdy5pc0VuZGVkKCkpIHtcclxuICAgICAgICAgICAgdGhpcy5fYXV0byA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLl9pbnRlcnZhbCA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHRoaXMuX3Nob3cudXNlci5yZW1haW5pbmcgPD0gMCkge1xyXG4gICAgICAgICAgICB0aGlzLl9hdXRvID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc3RhdHVzID0gZmFsc2U7XHJcbiAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGlzLl90aW1lcik7XHJcbiAgICAgICAgdGhpcy5fdGltZXIgPSBudWxsO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBkZWxldGUgLSBTdXBwcmltZSBsZXMgb3B0aW9ucyBkJ3VwZGF0ZSBhdXRvXHJcbiAgICAgKiBkZSBsYSBzw6lyaWUgZGUgbCdlc3BhY2UgZGUgc3RvY2thZ2VcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJuIHtVcGRhdGVBdXRvfSBMJ2luc3RhbmNlIHVuaXF1ZSBVcGRhdGVBdXRvXHJcbiAgICAgKi9cclxuICAgIGRlbGV0ZSgpIHtcclxuICAgICAgICB0aGlzLnN0b3AoKTtcclxuICAgICAgICBsZXQgb2JqVXBBdXRvID0gR01fZ2V0VmFsdWUoJ29ialVwQXV0bycpO1xyXG4gICAgICAgIGlmIChvYmpVcEF1dG9bdGhpcy5fc2hvd0lkXSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIGRlbGV0ZSBvYmpVcEF1dG9bdGhpcy5fc2hvd0lkXTtcclxuICAgICAgICAgICAgR01fc2V0VmFsdWUoJ29ialVwQXV0bycsIG9ialVwQXV0byk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBsYXVuY2ggLSBQZXJtZXQgZGUgbGFuY2VyIGxhIHTDomNoZSBkJ3VwZGF0ZSBhdXRvXHJcbiAgICAgKiBkZXMgw6lwaXNvZGVzXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybiB7VXBkYXRlQXV0b30gTCdpbnN0YW5jZSB1bmlxdWUgVXBkYXRlQXV0b1xyXG4gICAgICovXHJcbiAgICBsYXVuY2goKSB7XHJcbiAgICAgICAgLy8gU2kgbGVzIG9wdGlvbnMgc29udCBtb2RpZmnDqWVzIHBvdXIgYXJyw6p0ZXIgbGEgdMOiY2hlXHJcbiAgICAgICAgLy8gZXQgcXVlIGxlIHN0YXR1dCBlc3QgZW4gY291cnNcclxuICAgICAgICBpZiAodGhpcy5fc3RhdHVzICYmICghdGhpcy5fYXV0byB8fCB0aGlzLl9pbnRlcnZhbCA8PSAwKSkge1xyXG4gICAgICAgICAgICBpZiAoQmFzZV8xLkJhc2UuZGVidWcpXHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnY2xvc2UgaW50ZXJ2YWwgdXBkYXRlRXBpc29kZUxpc3RBdXRvJyk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnN0b3AoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gU2kgbGVzIG9wdGlvbnMgbW9kaWZpw6llcyBwb3VyIGxhbmNlclxyXG4gICAgICAgIGVsc2UgaWYgKHRoaXMuX2F1dG8gJiYgdGhpcy5faW50ZXJ2YWwgPiAwKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9zaG93LnVzZXIucmVtYWluaW5nIDw9IDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc3RvcCgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5zdGF0dXMgPSB0cnVlO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5fdGltZXIpIHtcclxuICAgICAgICAgICAgICAgIGlmIChCYXNlXzEuQmFzZS5kZWJ1ZylcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnY2xvc2Ugb2xkIGludGVydmFsIHRpbWVyJyk7XHJcbiAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKHRoaXMuX3RpbWVyKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgICAgIHRoaXMuX3RpbWVyID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgLy8gaWYgKGRlYnVnKSBjb25zb2xlLmxvZygnVXBkYXRlQXV0byBzZXRJbnRlcnZhbCBvYmpTaG93JywgT2JqZWN0LmFzc2lnbih7fSwgX3RoaXMuX29ialNob3cpKTtcclxuICAgICAgICAgICAgICAgIGlmICghX3RoaXMuX2F1dG8gfHwgX3RoaXMuX3Nob3cudXNlci5yZW1haW5pbmcgPD0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChCYXNlXzEuQmFzZS5kZWJ1ZylcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0FycsOqdCBkZSBsYSBtaXNlIMOgIGpvdXIgYXV0byBkZXMgw6lwaXNvZGVzJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuc3RvcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChCYXNlXzEuQmFzZS5kZWJ1ZylcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygndXBkYXRlIGVwaXNvZGUgbGlzdCcpO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgYnRuVXBFcGlzb2RlTGlzdCA9ICQoJy51cGRhdGVFcGlzb2RlcycpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGJ0blVwRXBpc29kZUxpc3QubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGJ0blVwRXBpc29kZUxpc3QudHJpZ2dlcignY2xpY2snKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIV90aGlzLl9zdGF0dXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuc3RhdHVzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sICh0aGlzLl9pbnRlcnZhbCAqIDYwKSAqIDEwMDApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxufVxyXG5leHBvcnRzLlVwZGF0ZUF1dG8gPSBVcGRhdGVBdXRvO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG5leHBvcnRzLlVzZXIgPSB2b2lkIDA7XHJcbmNsYXNzIE5leHQge1xyXG4gICAgY29uc3RydWN0b3IoZGF0YSkge1xyXG4gICAgICAgIHRoaXMuaWQgPSBwYXJzZUludChkYXRhLmlkLCAxMCk7XHJcbiAgICAgICAgdGhpcy5jb2RlID0gZGF0YS5jb2RlO1xyXG4gICAgICAgIHRoaXMuZGF0ZSA9IG5ldyBEYXRlKGRhdGEuZGF0ZSk7XHJcbiAgICAgICAgdGhpcy50aXRsZSA9IGRhdGEudGl0bGU7XHJcbiAgICAgICAgdGhpcy5pbWFnZSA9IGRhdGEuaW1hZ2U7XHJcbiAgICB9XHJcbiAgICBpZDtcclxuICAgIGNvZGU7XHJcbiAgICBkYXRlO1xyXG4gICAgdGl0bGU7XHJcbiAgICBpbWFnZTtcclxufVxyXG5jbGFzcyBVc2VyIHtcclxuICAgIGNvbnN0cnVjdG9yKGRhdGEpIHtcclxuICAgICAgICB0aGlzLmFyY2hpdmVkID0gZGF0YS5hcmNoaXZlZDtcclxuICAgICAgICB0aGlzLmRvd25sb2FkZWQgPSBkYXRhLmRvd25sb2FkZWQ7XHJcbiAgICAgICAgdGhpcy5mYXZvcml0ZWQgPSBkYXRhLmZhdm9yaXRlZDtcclxuICAgICAgICB0aGlzLmZyaWVuZHNfd2FudF90b193YXRjaCA9IGRhdGEuZnJpZW5kc193YW50X3RvX3dhdGNoO1xyXG4gICAgICAgIHRoaXMuZnJpZW5kc193YXRjaGVkID0gZGF0YS5mcmllbmRzX3dhdGNoZWQ7XHJcbiAgICAgICAgdGhpcy5oaWRkZW4gPSBkYXRhLmhpZGRlbjtcclxuICAgICAgICB0aGlzLmxhc3QgPSBkYXRhLmxhc3Q7XHJcbiAgICAgICAgdGhpcy5tYWlsID0gZGF0YS5tYWlsO1xyXG4gICAgICAgIHRoaXMubmV4dCA9IG5ldyBOZXh0KGRhdGEubmV4dCk7XHJcbiAgICAgICAgdGhpcy5wcm9maWxlID0gZGF0YS5wcm9maWxlO1xyXG4gICAgICAgIHRoaXMucmVtYWluaW5nID0gZGF0YS5yZW1haW5pbmc7XHJcbiAgICAgICAgdGhpcy5zZWVuID0gZGF0YS5zZWVuO1xyXG4gICAgICAgIHRoaXMuc3RhdHVzID0gcGFyc2VJbnQoZGF0YS5zdGF0dXMsIDEwKTtcclxuICAgICAgICB0aGlzLnRhZ3MgPSBkYXRhLnRhZ3M7XHJcbiAgICAgICAgdGhpcy50d2l0dGVyID0gZGF0YS50d2l0dGVyO1xyXG4gICAgfVxyXG4gICAgYXJjaGl2ZWQ7XHJcbiAgICBkb3dubG9hZGVkO1xyXG4gICAgZmF2b3JpdGVkO1xyXG4gICAgZnJpZW5kc193YW50X3RvX3dhdGNoO1xyXG4gICAgZnJpZW5kc193YXRjaGVkO1xyXG4gICAgaGlkZGVuO1xyXG4gICAgbGFzdDtcclxuICAgIG1haWw7XHJcbiAgICBuZXh0O1xyXG4gICAgcHJvZmlsZTtcclxuICAgIHJlbWFpbmluZztcclxuICAgIHNlZW47XHJcbiAgICBzdGF0dXM7XHJcbiAgICB0YWdzO1xyXG4gICAgdHdpdHRlcjtcclxufVxyXG5leHBvcnRzLlVzZXIgPSBVc2VyO1xyXG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxuY29uc3QgQ2FjaGVfMSA9IHJlcXVpcmUoXCIuL0NhY2hlXCIpO1xyXG5jb25zdCBCYXNlXzEgPSByZXF1aXJlKFwiLi9CYXNlXCIpO1xyXG5jb25zdCBNZWRpYV8xID0gcmVxdWlyZShcIi4vTWVkaWFcIik7XHJcbmNvbnN0IFNob3dfMSA9IHJlcXVpcmUoXCIuL1Nob3dcIik7XHJcbmNvbnN0IE1vdmllXzEgPSByZXF1aXJlKFwiLi9Nb3ZpZVwiKTtcclxuY29uc3QgRXBpc29kZV8xID0gcmVxdWlyZShcIi4vRXBpc29kZVwiKTtcclxuY29uc3QgU2ltaWxhcl8xID0gcmVxdWlyZShcIi4vU2ltaWxhclwiKTtcclxuY29uc3QgVXBkYXRlQXV0b18xID0gcmVxdWlyZShcIi4vVXBkYXRlQXV0b1wiKTtcclxuJ3VzZSBzdHJpY3QnO1xyXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG4vKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBQQVJBTUVUUkVTIEEgTU9ESUZJRVIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqL1xyXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG5sZXQgYmV0YXNlcmllc19hcGlfdXNlcl90b2tlbiA9ICcnO1xyXG4vKiBBam91dGVyIGljaSB2b3RyZSBjbMOpIGQnQVBJIEJldGFTZXJpZXMgKERlbWFuZGUgZGUgY2zDqSBBUEk6IGh0dHBzOi8vd3d3LmJldGFzZXJpZXMuY29tL2FwaS8pICovXHJcbmxldCBiZXRhc2VyaWVzX2FwaV91c2VyX2tleSA9ICcnO1xyXG4vKiBBam91dGVyIGljaSB2b3RyZSBjbMOpIGQnQVBJIFYzIMOgIHRoZW1vdmllZGIgKi9cclxubGV0IHRoZW1vdmllZGJfYXBpX3VzZXJfa2V5ID0gJyc7XHJcbi8qIEFqb3V0ZXIgaWNpIGwnVVJMIGRlIGJhc2UgZGUgdm90cmUgc2VydmV1ciBkaXN0cmlidWFudCBsZXMgQ1NTLCBJTUcgZXQgSlMgKi9cclxuY29uc3Qgc2VydmVyQmFzZVVybCA9ICdodHRwczovL2F6ZW1hLmdpdGh1Yi5pby9iZXRhc2VyaWVzLW9hdXRoJztcclxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cclxuLyoqXHJcbiAqIFJlbXBsaXQgbCdvYmpldCBhdmVjIGxlcyBkb25uw6llcyBmb3Vybml0IGVuIHBhcmFtw6h0cmVcclxuICogQHBhcmFtICB7T2JqfSBkYXRhIExlcyBkb25uw6llcyBwcm92ZW5hbnQgZGUgbCdBUElcclxuICogQHJldHVybnMge1Nob3d9XHJcbiAqL1xyXG5TaG93XzEuU2hvdy5wcm90b3R5cGUuZmlsbCA9IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICB0aGlzLmFsaWFzZXMgPSBkYXRhLmFsaWFzZXM7XHJcbiAgICB0aGlzLmNyZWF0aW9uID0gZGF0YS5jcmVhdGlvbjtcclxuICAgIHRoaXMuY291bnRyeSA9IGRhdGEuY291bnRyeTtcclxuICAgIHRoaXMuaW1hZ2VzID0gbmV3IFNob3dfMS5JbWFnZXMoZGF0YS5pbWFnZXMpO1xyXG4gICAgdGhpcy5uYkVwaXNvZGVzID0gcGFyc2VJbnQoZGF0YS5lcGlzb2RlcywgMTApO1xyXG4gICAgdGhpcy5uZXR3b3JrID0gZGF0YS5uZXR3b3JrO1xyXG4gICAgdGhpcy5uZXh0X3RyYWlsZXIgPSBkYXRhLm5leHRfdHJhaWxlcjtcclxuICAgIHRoaXMubmV4dF90cmFpbGVyX2hvc3QgPSBkYXRhLm5leHRfdHJhaWxlcl9ob3N0O1xyXG4gICAgdGhpcy5yYXRpbmcgPSBkYXRhLnJhdGluZztcclxuICAgIHRoaXMucGxhdGZvcm1zID0gbmV3IFNob3dfMS5QbGF0Zm9ybXMoZGF0YS5wbGF0Zm9ybXMpO1xyXG4gICAgdGhpcy5zZWFzb25zID0gbmV3IEFycmF5KCk7XHJcbiAgICBmb3IgKGxldCBzID0gMDsgcyA8IGRhdGEuc2Vhc29uc19kZXRhaWxzLmxlbmd0aDsgcysrKSB7XHJcbiAgICAgICAgdGhpcy5zZWFzb25zLnB1c2gobmV3IEVwaXNvZGVfMS5TZWFzb24oZGF0YS5zZWFzb25zX2RldGFpbHNbc10sIHRoaXMpKTtcclxuICAgIH1cclxuICAgIHRoaXMuc2hvd3J1bm5lciA9IG5ldyBTaG93XzEuU2hvd3J1bm5lcihkYXRhLnNob3dydW5uZXIpO1xyXG4gICAgdGhpcy5zb2NpYWxfbGlua3MgPSBkYXRhLnNvY2lhbF9saW5rcztcclxuICAgIHRoaXMuc3RhdHVzID0gZGF0YS5zdGF0dXM7XHJcbiAgICB0aGlzLnRoZXR2ZGJfaWQgPSBwYXJzZUludChkYXRhLnRoZXR2ZGJfaWQsIDEwKTtcclxuICAgIHRoaXMucGljdHVyZXMgPSBuZXcgQXJyYXkoKTtcclxuICAgIHRoaXMubWVkaWFUeXBlID0geyBzaW5ndWxhcjogQmFzZV8xLk1lZGlhVHlwZS5zaG93LCBwbHVyYWw6ICdzaG93cycsIGNsYXNzTmFtZTogU2hvd18xLlNob3cgfTtcclxuICAgIE1lZGlhXzEuTWVkaWEucHJvdG90eXBlLmZpbGwuY2FsbCh0aGlzLCBkYXRhKTtcclxuICAgIHJldHVybiB0aGlzO1xyXG59O1xyXG4vKipcclxuICogUmV0b3VybmUgbGVzIHNpbWlsYXJzIGFzc29jacOpcyBhdSBtZWRpYVxyXG4gKiBAYWJzdHJhY3RcclxuICogQHJldHVybiB7UHJvbWlzZTxNZWRpYT59XHJcbiAqL1xyXG5NZWRpYV8xLk1lZGlhLnByb3RvdHlwZS5mZXRjaFNpbWlsYXJzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgY29uc3QgX3RoaXMgPSB0aGlzO1xyXG4gICAgdGhpcy5zaW1pbGFycyA9IFtdO1xyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICBCYXNlXzEuQmFzZS5jYWxsQXBpKCdHRVQnLCB0aGlzLm1lZGlhVHlwZS5wbHVyYWwsICdzaW1pbGFycycsIHsgaWQ6IHRoaXMuaWQsIGRldGFpbHM6IHRydWUgfSwgdHJ1ZSlcclxuICAgICAgICAgICAgLnRoZW4oZGF0YSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChkYXRhLnNpbWlsYXJzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IHMgPSAwOyBzIDwgZGF0YS5zaW1pbGFycy5sZW5ndGg7IHMrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIF90aGlzLnNpbWlsYXJzLnB1c2gobmV3IFNpbWlsYXJfMS5TaW1pbGFyKGRhdGEuc2ltaWxhcnNbc11bX3RoaXMubWVkaWFUeXBlLnNpbmd1bGFyXSwgX3RoaXMubWVkaWFUeXBlKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgX3RoaXMuc2F2ZSgpO1xyXG4gICAgICAgICAgICByZXNvbHZlKF90aGlzKTtcclxuICAgICAgICB9LCBlcnIgPT4ge1xyXG4gICAgICAgICAgICByZWplY3QoZXJyKTtcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG59O1xyXG4oZnVuY3Rpb24gKCQpIHtcclxuICAgIGNvbnN0IGRlYnVnID0gZmFsc2UsIHVybCA9IGxvY2F0aW9uLnBhdGhuYW1lLCBub29wID0gZnVuY3Rpb24gKCkgeyB9LCByZWdleFVzZXIgPSBuZXcgUmVnRXhwKCdeL21lbWJyZS9bQS1aYS16MC05XSokJyksIFxyXG4gICAgLy8gT2JqZXQgY29udGVuYW50IGxlcyBzY3JpcHRzIGV0IGZldWlsbGVzIGRlIHN0eWxlIHV0aWxpc8OpZXMgcGFyIGxlIHVzZXJzY3JpcHRcclxuICAgIHNjcmlwdHNBbmRTdHlsZXMgPSB7XHJcbiAgICAgICAgXCJtb21lbnRcIjoge1xyXG4gICAgICAgICAgICB0eXBlOiAnc2NyaXB0JyxcclxuICAgICAgICAgICAgaWQ6ICdqc21vbW1lbnQnLFxyXG4gICAgICAgICAgICBzcmM6ICdodHRwczovL2NkbmpzLmNsb3VkZmxhcmUuY29tL2FqYXgvbGlicy9tb21lbnQuanMvMi4yOS4xL21vbWVudC5taW4uanMnLFxyXG4gICAgICAgICAgICBpbnRlZ3JpdHk6ICdzaGE1MTItcVRYUklNeVpJRmI4aVFjZmpYV0NPOCtNNVRiYzM4UWk1V3pkUE9ZWkhJbFpwekJIRzNMM2J5ODRCQkJPaVJHaUViN0tLdEFPQXM1cVlkVWlaaVFOTlE9PSdcclxuICAgICAgICB9LFxyXG4gICAgICAgIFwibG9jYWxlZnJcIjoge1xyXG4gICAgICAgICAgICB0eXBlOiAnc2NyaXB0JyxcclxuICAgICAgICAgICAgaWQ6ICdqc2xvY2FsZWZyJyxcclxuICAgICAgICAgICAgc3JjOiAnaHR0cHM6Ly9jZG5qcy5jbG91ZGZsYXJlLmNvbS9hamF4L2xpYnMvbW9tZW50LmpzLzIuMjkuMS9sb2NhbGUvZnIubWluLmpzJyxcclxuICAgICAgICAgICAgaW50ZWdyaXR5OiAnc2hhNTEyLVJBdDIrUElSd0ppeWpXcHp2dmhLQUcyTEVkUHBRaFRnV2ZiRWtGRENvOHdDNHJGWWg1R1F6SkJWSUZEc3d3YUVERVlYMTZHRUUvNGZwZUROcjdPSVp3PT0nXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcInBvcG92ZXJcIjoge1xyXG4gICAgICAgICAgICB0eXBlOiAnc3R5bGUnLFxyXG4gICAgICAgICAgICBpZDogJ2Nzc3BvcG92ZXInLFxyXG4gICAgICAgICAgICBocmVmOiBgJHtzZXJ2ZXJCYXNlVXJsfS9jc3MvcG9wb3Zlci5taW4uY3NzYCxcclxuICAgICAgICAgICAgaW50ZWdyaXR5OiAnc2hhMzg0LTArV1lid2p1TWRCK3Rrd1haakMyNENqbktlZ0k4N1BITlJhaTRLNkFYSUtUZ3BldFpDUUo5ZE5WcUo1ZFVucGcnXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcImJvb3RzdHJhcFwiOiB7XHJcbiAgICAgICAgICAgIHR5cGU6ICdzY3JpcHQnLFxyXG4gICAgICAgICAgICBpZDogJ2pzYm9vdHN0cmFwJyxcclxuICAgICAgICAgICAgc3JjOiAnaHR0cHM6Ly9tYXhjZG4uYm9vdHN0cmFwY2RuLmNvbS9ib290c3RyYXAvNC4wLjAvanMvYm9vdHN0cmFwLm1pbi5qcycsXHJcbiAgICAgICAgICAgIGludGVncml0eTogJ3NoYTM4NC1KWlI2U3Blamg0VTAyZDhqT3Q2dkxFSGZlL0pRR2lSUlNRUXhTZkZXcGkxTXF1VmRBeWpVYXI1Kzc2UFZDbVlsJ1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCJ0YWJsZWNzc1wiOiB7XHJcbiAgICAgICAgICAgIHR5cGU6ICdzdHlsZScsXHJcbiAgICAgICAgICAgIGlkOiAndGFibGVjc3MnLFxyXG4gICAgICAgICAgICBocmVmOiBgJHtzZXJ2ZXJCYXNlVXJsfS9jc3MvdGFibGUubWluLmNzc2AsXHJcbiAgICAgICAgICAgIGludGVncml0eTogJ3NoYTM4NC04M3g5a2l4N1E0RjhsNEZRd0dmZGJudEZ5am1adTNGMWZCOElBZldkSDRjTkZpWFlxQVZyVkFybmlsMHJrYzFwJ1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCJzdHlsZWhvbWVcIjoge1xyXG4gICAgICAgICAgICB0eXBlOiAnc3R5bGUnLFxyXG4gICAgICAgICAgICBpZDogJ3N0eWxlaG9tZScsXHJcbiAgICAgICAgICAgIGhyZWY6IGAke3NlcnZlckJhc2VVcmx9L2Nzcy9zdHlsZS5taW4uY3NzYCxcclxuICAgICAgICAgICAgaW50ZWdyaXR5OiAnc2hhMzg0LXo0YWFtMjl4a09LbWdwT1VHaGs5a1M4L1N1dGtRZVV0RUJCWG0yTllpWkZjMkNKU3ZINWhvdGh6ZStQMC9kejgnXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcImF3ZXNvbWVcIjoge1xyXG4gICAgICAgICAgICB0eXBlOiAnc3R5bGUnLFxyXG4gICAgICAgICAgICBpZDogJ2F3ZXNvbWUnLFxyXG4gICAgICAgICAgICBocmVmOiAnaHR0cHM6Ly9jZG5qcy5jbG91ZGZsYXJlLmNvbS9hamF4L2xpYnMvZm9udC1hd2Vzb21lLzQuNy4wL2Nzcy9mb250LWF3ZXNvbWUubWluLmNzcycsXHJcbiAgICAgICAgICAgIGludGVncml0eTogJ3NoYTUxMi1TZlRpVGxYNmtrK3FpdGZldmwvN0xpYlVPZUpXbHQ5cmJ5RG45MmExRHFXT3c5dldHMk1Gb2F5czBzZ09ibVdhek81QlFQaUZ1Y25uRUFqcEFCKy9Tdz09J1xyXG4gICAgICAgIH1cclxuICAgIH0sIFxyXG4gICAgLy8gVVJJIGRlcyBpbWFnZXMgZXQgZGVzY3JpcHRpb24gZGVzIGNsYXNzaWZpY2F0aW9ucyBUViBldCBmaWxtc1xyXG4gICAgcmF0aW5ncyA9IHtcclxuICAgICAgICAnRC0xMCc6IHtcclxuICAgICAgICAgICAgaW1nOiAnaHR0cHM6Ly91cGxvYWQud2lraW1lZGlhLm9yZy93aWtpcGVkaWEvY29tbW9ucy90aHVtYi9iL2JmL01vaW5zMTAuc3ZnLzMwcHgtTW9pbnMxMC5zdmcucG5nJyxcclxuICAgICAgICAgICAgdGl0bGU6IFwiRMOpY29uc2VpbGzDqSBhdSBtb2lucyBkZSAxMCBhbnNcIlxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgJ0QtMTInOiB7XHJcbiAgICAgICAgICAgIGltZzogJ2h0dHBzOi8vdXBsb2FkLndpa2ltZWRpYS5vcmcvd2lraXBlZGlhL2NvbW1vbnMvdGh1bWIvYi9iNS9Nb2luczEyLnN2Zy8zMHB4LU1vaW5zMTIuc3ZnLnBuZycsXHJcbiAgICAgICAgICAgIHRpdGxlOiAnRMOpY29uc2VpbGzDqSBhdSBtb2lucyBkZSAxMiBhbnMnXHJcbiAgICAgICAgfSxcclxuICAgICAgICAnRC0xNic6IHtcclxuICAgICAgICAgICAgaW1nOiAnaHR0cHM6Ly91cGxvYWQud2lraW1lZGlhLm9yZy93aWtpcGVkaWEvY29tbW9ucy90aHVtYi8yLzI5L01vaW5zMTYuc3ZnLzMwcHgtTW9pbnMxNi5zdmcucG5nJyxcclxuICAgICAgICAgICAgdGl0bGU6ICdEw6ljb25zZWlsbMOpIGF1IG1vaW5zIGRlIDE2IGFucydcclxuICAgICAgICB9LFxyXG4gICAgICAgICdELTE4Jzoge1xyXG4gICAgICAgICAgICBpbWc6ICdodHRwczovL3VwbG9hZC53aWtpbWVkaWEub3JnL3dpa2lwZWRpYS9jb21tb25zL3RodW1iLzIvMmQvTW9pbnMxOC5zdmcvMzBweC1Nb2luczE4LnN2Zy5wbmcnLFxyXG4gICAgICAgICAgICB0aXRsZTogJ0NlIHByb2dyYW1tZSBlc3QgdW5pcXVlbWVudCByw6lzZXJ2w6kgYXV4IGFkdWx0ZXMnXHJcbiAgICAgICAgfSxcclxuICAgICAgICAnVFYtWSc6IHtcclxuICAgICAgICAgICAgaW1nOiAnaHR0cHM6Ly91cGxvYWQud2lraW1lZGlhLm9yZy93aWtpcGVkaWEvY29tbW9ucy90aHVtYi8yLzI1L1RWLVlfaWNvbi5zdmcvNTBweC1UVi1ZX2ljb24uc3ZnLnBuZycsXHJcbiAgICAgICAgICAgIHRpdGxlOiAnQ2UgcHJvZ3JhbW1lIGVzdCDDqXZhbHXDqSBjb21tZSDDqXRhbnQgYXBwcm9wcmnDqSBhdXggZW5mYW50cydcclxuICAgICAgICB9LFxyXG4gICAgICAgICdUVi1ZNyc6IHtcclxuICAgICAgICAgICAgaW1nOiAnaHR0cHM6Ly91cGxvYWQud2lraW1lZGlhLm9yZy93aWtpcGVkaWEvY29tbW9ucy90aHVtYi81LzVhL1RWLVk3X2ljb24uc3ZnLzUwcHgtVFYtWTdfaWNvbi5zdmcucG5nJyxcclxuICAgICAgICAgICAgdGl0bGU6ICdDZSBwcm9ncmFtbWUgZXN0IGTDqXNpZ27DqSBwb3VyIGxlcyBlbmZhbnRzIMOiZ8OpcyBkZSA3IGFucyBldCBwbHVzJ1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgJ1RWLUcnOiB7XHJcbiAgICAgICAgICAgIGltZzogJ2h0dHBzOi8vdXBsb2FkLndpa2ltZWRpYS5vcmcvd2lraXBlZGlhL2NvbW1vbnMvdGh1bWIvNS81ZS9UVi1HX2ljb24uc3ZnLzUwcHgtVFYtR19pY29uLnN2Zy5wbmcnLFxyXG4gICAgICAgICAgICB0aXRsZTogJ0xhIHBsdXBhcnQgZGVzIHBhcmVudHMgcGV1dmVudCBjb25zaWTDqXJlciBjZSBwcm9ncmFtbWUgY29tbWUgYXBwcm9wcmnDqSBwb3VyIGxlcyBlbmZhbnRzJ1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgJ1RWLVBHJzoge1xyXG4gICAgICAgICAgICBpbWc6ICdodHRwczovL3VwbG9hZC53aWtpbWVkaWEub3JnL3dpa2lwZWRpYS9jb21tb25zL3RodW1iLzkvOWEvVFYtUEdfaWNvbi5zdmcvNTBweC1UVi1QR19pY29uLnN2Zy5wbmcnLFxyXG4gICAgICAgICAgICB0aXRsZTogJ0NlIHByb2dyYW1tZSBjb250aWVudCBkZXMgw6lsw6ltZW50cyBxdWUgbGVzIHBhcmVudHMgcGV1dmVudCBjb25zaWTDqXJlciBpbmFwcHJvcHJpw6lzIHBvdXIgbGVzIGVuZmFudHMnXHJcbiAgICAgICAgfSxcclxuICAgICAgICAnVFYtMTQnOiB7XHJcbiAgICAgICAgICAgIGltZzogJ2h0dHBzOi8vdXBsb2FkLndpa2ltZWRpYS5vcmcvd2lraXBlZGlhL2NvbW1vbnMvdGh1bWIvYy9jMy9UVi0xNF9pY29uLnN2Zy81MHB4LVRWLTE0X2ljb24uc3ZnLnBuZycsXHJcbiAgICAgICAgICAgIHRpdGxlOiAnQ2UgcHJvZ3JhbW1lIGVzdCBkw6ljb25zZWlsbMOpIGF1eCBlbmZhbnRzIGRlIG1vaW5zIGRlIDE0IGFucydcclxuICAgICAgICB9LFxyXG4gICAgICAgICdUVi1NQSc6IHtcclxuICAgICAgICAgICAgaW1nOiAnaHR0cHM6Ly91cGxvYWQud2lraW1lZGlhLm9yZy93aWtpcGVkaWEvY29tbW9ucy90aHVtYi8zLzM0L1RWLU1BX2ljb24uc3ZnLzUwcHgtVFYtTUFfaWNvbi5zdmcucG5nJyxcclxuICAgICAgICAgICAgdGl0bGU6ICdDZSBwcm9ncmFtbWUgZXN0IHVuaXF1ZW1lbnQgcsOpc2VydsOpIGF1eCBhZHVsdGVzJ1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgJ0cnOiB7XHJcbiAgICAgICAgICAgIGltZzogJ2h0dHBzOi8vdXBsb2FkLndpa2ltZWRpYS5vcmcvd2lraXBlZGlhL2NvbW1vbnMvdGh1bWIvMC8wNS9SQVRFRF9HLnN2Zy8zMHB4LVJBVEVEX0cuc3ZnLnBuZycsXHJcbiAgICAgICAgICAgIHRpdGxlOiAnVG91cyBwdWJsaWNzJ1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgJ1BHJzoge1xyXG4gICAgICAgICAgICBpbWc6ICdodHRwczovL3VwbG9hZC53aWtpbWVkaWEub3JnL3dpa2lwZWRpYS9jb21tb25zL3RodW1iL2IvYmMvUkFURURfUEcuc3ZnLzU0cHgtUkFURURfUEcuc3ZnLnBuZycsXHJcbiAgICAgICAgICAgIHRpdGxlOiAnQWNjb3JkIHBhcmVudGFsIHNvdWhhaXRhYmxlJ1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgJ1BHLTEzJzoge1xyXG4gICAgICAgICAgICBpbWc6ICdodHRwczovL3VwbG9hZC53aWtpbWVkaWEub3JnL3dpa2lwZWRpYS9jb21tb25zL3RodW1iL2MvYzAvUkFURURfUEctMTMuc3ZnLzk1cHgtUkFURURfUEctMTMuc3ZnLnBuZycsXHJcbiAgICAgICAgICAgIHRpdGxlOiAnQWNjb3JkIHBhcmVudGFsIHJlY29tbWFuZMOpLCBmaWxtIGTDqWNvbnNlaWxsw6kgYXV4IG1vaW5zIGRlIDEzIGFucydcclxuICAgICAgICB9LFxyXG4gICAgICAgICdSJzoge1xyXG4gICAgICAgICAgICBpbWc6ICdodHRwczovL3VwbG9hZC53aWtpbWVkaWEub3JnL3dpa2lwZWRpYS9jb21tb25zL3RodW1iLzcvN2UvUkFURURfUi5zdmcvNDBweC1SQVRFRF9SLnN2Zy5wbmcnLFxyXG4gICAgICAgICAgICB0aXRsZTogJ0xlcyBlbmZhbnRzIGRlIG1vaW5zIGRlIDE3IGFucyBkb2l2ZW50IMOqdHJlIGFjY29tcGFnbsOpcyBkXFwndW4gYWR1bHRlJ1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgJ05DLTE3Jzoge1xyXG4gICAgICAgICAgICBpbWc6ICdodHRwczovL3VwbG9hZC53aWtpbWVkaWEub3JnL3dpa2lwZWRpYS9jb21tb25zL3RodW1iLzUvNTAvTmMtMTcuc3ZnLzg1cHgtTmMtMTcuc3ZnLnBuZycsXHJcbiAgICAgICAgICAgIHRpdGxlOiAnSW50ZXJkaXQgYXV4IGVuZmFudHMgZGUgMTcgYW5zIGV0IG1vaW5zJ1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBsZXQgdGltZXIsIHRpbWVyVUEsIGN1cnJlbnRVc2VyLCBjYWNoZSwgZGlhbG9nLCBmbkxhenk7XHJcbiAgICAvKiBJbml0aWFsaXplIHRoZSBjYWNoZSAqL1xyXG4gICAgY2FjaGUgPSBuZXcgQ2FjaGVfMS5DYWNoZVVTKCk7XHJcbiAgICAvKipcclxuICAgICAqIFBhcmFtw6l0cmFnZSBkZSBsYSBzdXBlciBjbGFzc2UgYWJzdHJhaXRlIEJhc2VcclxuICAgICAqL1xyXG4gICAgQmFzZV8xLkJhc2UuZGVidWcgPSBkZWJ1ZztcclxuICAgIEJhc2VfMS5CYXNlLmNhY2hlID0gY2FjaGU7XHJcbiAgICBCYXNlXzEuQmFzZS5ub3RpZmljYXRpb24gPSBub3RpZmljYXRpb247XHJcbiAgICBCYXNlXzEuQmFzZS51c2VySWRlbnRpZmllZCA9IHVzZXJJZGVudGlmaWVkO1xyXG4gICAgQmFzZV8xLkJhc2UudG9rZW4gPSBiZXRhc2VyaWVzX2FwaV91c2VyX3Rva2VuO1xyXG4gICAgQmFzZV8xLkJhc2UudXNlcktleSA9IGJldGFzZXJpZXNfYXBpX3VzZXJfa2V5O1xyXG4gICAgQmFzZV8xLkJhc2UudXNlcklkID0gYmV0YXNlcmllc191c2VyX2lkO1xyXG4gICAgQmFzZV8xLkJhc2UudHJhbnMgPSB0cmFucztcclxuICAgIEJhc2VfMS5CYXNlLnJhdGluZ3MgPSByYXRpbmdzO1xyXG4gICAgQmFzZV8xLkJhc2UudGhlbW92aWVkYl9hcGlfdXNlcl9rZXkgPSB0aGVtb3ZpZWRiX2FwaV91c2VyX2tleTtcclxuICAgIEJhc2VfMS5CYXNlLnNlcnZlckJhc2VVcmwgPSBzZXJ2ZXJCYXNlVXJsO1xyXG4gICAgLy8gT24gYWZmaWNoZSBsYSB2ZXJzaW9uIGR1IHNjcmlwdFxyXG4gICAgaWYgKGRlYnVnKVxyXG4gICAgICAgIGNvbnNvbGUubG9nKCdVc2VyU2NyaXB0IEJldGFTZXJpZXMgdiVzJywgR01faW5mby5zY3JpcHQudmVyc2lvbik7XHJcbiAgICAvLyBBam91dCBkZXMgZmV1aWxsZXMgZGUgc3R5bGVzIHBvdXIgbGUgdXNlcnNjcmlwdFxyXG4gICAgYWRkU2NyaXB0QW5kTGluayhbJ2F3ZXNvbWUnLCAnc3R5bGVob21lJ10pO1xyXG4gICAgaWYgKHR5cGVvZiBsYXp5TG9hZCA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICBsZXQgbm90TG9vcCA9IDA7XHJcbiAgICAgICAgbGV0IHRpbWVyTGF6eSA9IHNldEludGVydmFsKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgLy8gUG91ciBldml0ZXIgdW5lIGJvdWNsZSBpbmZpbmllXHJcbiAgICAgICAgICAgIGlmICgrK25vdExvb3AgPj0gMjApIHtcclxuICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodGltZXJMYXp5KTtcclxuICAgICAgICAgICAgICAgIC8vIENhIG5lIGZlcmEgcGFzIGxlIGpvYiwgbWFpcyDDp2EgbmUgZMOpY2xlbmNoZXJhIHBhcyBkJ2VycmV1clxyXG4gICAgICAgICAgICAgICAgZm5MYXp5ID0geyBpbml0OiBmdW5jdGlvbiAoKSB7IGNvbnNvbGUud2FybignZmFrZSBsYXp5TG9hZCcpOyB9IH07XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBsYXp5TG9hZCAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgICAgIGZuTGF6eSA9IG5ldyBsYXp5TG9hZCh7fSk7XHJcbiAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKHRpbWVyTGF6eSk7XHJcbiAgICAgICAgICAgICAgICB0aW1lckxhenkgPSBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSwgNTAwKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIGZuTGF6eSA9IG5ldyBsYXp5TG9hZCh7fSk7XHJcbiAgICB9XHJcbiAgICBjaGVja0FwaVZlcnNpb24oKTtcclxuICAgIC8vIEZvbmN0aW9ucyBhcHBlbGVyIHBvdXIgbGVzIHBhZ2VzIGRlcyBzZXJpZXMsIGRlcyBmaWxtcyBldCBkZXMgZXBpc29kZXNcclxuICAgIGlmICgvXlxcLyhzZXJpZXxmaWxtfGVwaXNvZGUpXFwvLiovLnRlc3QodXJsKSkge1xyXG4gICAgICAgIC8vIE9uIHLDqWN1cMOocmUgZCdhYm9yZCBsYSByZXNzb3VyY2UgY291cmFudGUgcG91ciBpbnN0YW5jaWVyIHVuIG9iamV0IE1lZGlhXHJcbiAgICAgICAgZ2V0UmVzb3VyY2UodHJ1ZSkudGhlbigob2JqUmVzKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChkZWJ1ZylcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdvYmpldCByZXNvdXJjZSBNZWRpYSglcyknLCBvYmpSZXMuY29uc3RydWN0b3IubmFtZSwgb2JqUmVzKTtcclxuICAgICAgICAgICAgaWYgKGRlYnVnKVxyXG4gICAgICAgICAgICAgICAgYWRkQnRuRGV2KCk7IC8vIE9uIGFqb3V0ZSBsZSBib3V0b24gZGUgRGV2XHJcbiAgICAgICAgICAgIHJlbW92ZUFkcygpOyAvLyBPbiByZXRpcmUgbGVzIHB1YnNcclxuICAgICAgICAgICAgc2ltaWxhcnNWaWV3ZWQob2JqUmVzKTsgLy8gT24gcydvY2N1cGUgZGVzIHJlc3NvdXJjZXMgc2ltaWxhaXJlc1xyXG4gICAgICAgICAgICBvYmpSZXMuZGVjb2RlVGl0bGUoKTsgLy8gT24gZMOpY29kZSBsZSB0aXRyZSBkZSBsYSByZXNzb3VyY2VcclxuICAgICAgICAgICAgb2JqUmVzLmFkZE51bWJlclZvdGVycygpOyAvLyBPbiBham91dGUgbGUgbm9tYnJlIGRlIHZvdGVzIMOgIGxhIG5vdGVcclxuICAgICAgICAgICAgdXBncmFkZVN5bm9wc2lzKCk7IC8vIE9uIGFtw6lsaW9yZSBsZSBmb25jdGlvbm5lbWVudCBkZSBsJ2FmZmljaGFnZSBkdSBzeW5vcHNpc1xyXG4gICAgICAgICAgICBpZiAoL15cXC9zZXJpZVxcLy8udGVzdCh1cmwpKSB7XHJcbiAgICAgICAgICAgICAgICBvYmpSZXMuYWRkUmF0aW5nKCk7IC8vIE9uIGFqb3V0ZSBsYSBjbGFzc2lmaWNhdGlvbiBUViBkZSBsYSByZXNzb3VyY2UgY291cmFudGVcclxuICAgICAgICAgICAgICAgIC8vIE9uIGFqb3V0ZSBsYSBnZXN0aW9uIGRlcyDDqXBpc29kZXNcclxuICAgICAgICAgICAgICAgIHdhaXRTZWFzb25zQW5kRXBpc29kZXNMb2FkZWQoKCkgPT4gdXBncmFkZUVwaXNvZGVzKG9ialJlcykpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICAvLyBGb25jdGlvbnMgYXBwZWxlciBwb3VyIGxhIHBhZ2UgZGUgZ2VzdGlvbiBkZXMgc2VyaWVzXHJcbiAgICBlbHNlIGlmICgvXlxcL21lbWJyZVxcLy4qXFwvc2VyaWVzJC8udGVzdCh1cmwpKSB7XHJcbiAgICAgICAgYWRkU3RhdHVzVG9HZXN0aW9uU2VyaWVzKCk7XHJcbiAgICB9XHJcbiAgICAvLyBGb25jdGlvbnMgYXBwZWxlciBzdXIgbGEgcGFnZSBkZXMgbWVtYnJlc1xyXG4gICAgZWxzZSBpZiAoKHJlZ2V4VXNlci50ZXN0KHVybCkgfHwgL15cXC9tZW1icmVcXC9bQS1aYS16MC05XSpcXC9hbWlzJC8udGVzdCh1cmwpKSAmJiB1c2VySWRlbnRpZmllZCgpKSB7XHJcbiAgICAgICAgaWYgKHJlZ2V4VXNlci50ZXN0KHVybCkpIHtcclxuICAgICAgICAgICAgLy8gT24gcsOpY3Vww6hyZSBsZXMgaW5mb3MgZHUgbWVtYnJlIGNvbm5lY3TDqVxyXG4gICAgICAgICAgICBnZXRNZW1iZXIoKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKG1lbWJlcikge1xyXG4gICAgICAgICAgICAgICAgY3VycmVudFVzZXIgPSBtZW1iZXI7XHJcbiAgICAgICAgICAgICAgICBsZXQgbG9naW4gPSB1cmwuc3BsaXQoJy8nKVsyXTtcclxuICAgICAgICAgICAgICAgIC8vIE9uIGFqb3V0ZSBsYSBmb25jdGlvbiBkZSBjb21wYXJhaXNvbiBkZXMgbWVtYnJlc1xyXG4gICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRVc2VyICYmIGxvZ2luICE9IGN1cnJlbnRVc2VyLmxvZ2luKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29tcGFyZU1lbWJlcnMoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBzZWFyY2hGcmllbmRzKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLy8gRm9uY3Rpb25zIGFwcGVsZXIgc3VyIGxlcyBwYWdlcyBkZXMgbcOpdGhvZGVzIGRlIGwnQVBJXHJcbiAgICBlbHNlIGlmICgvXlxcL2FwaS8udGVzdCh1cmwpKSB7XHJcbiAgICAgICAgaWYgKC9cXC9tZXRob2Rlcy8udGVzdCh1cmwpKSB7XHJcbiAgICAgICAgICAgIHNvbW1haXJlRGV2QXBpKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKC9cXC9jb25zb2xlLy50ZXN0KHVybCkpIHtcclxuICAgICAgICAgICAgdXBkYXRlQXBpQ29uc29sZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8vIEZvbmN0aW9ucyBhcHBlbGVyIHN1ciBsZXMgcGFnZXMgZGVzIHPDqXJpZXNcclxuICAgIGVsc2UgaWYgKC9eXFwvc2VyaWVzXFwvLy50ZXN0KHVybCkpIHtcclxuICAgICAgICBpZiAoZGVidWcpXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdQYWdlIGRlcyBzw6lyaWVzJyk7XHJcbiAgICAgICAgd2FpdFBhZ2luYXRpb24oKTtcclxuICAgICAgICBzZXJpZXNGaWx0ZXJQYXlzKCk7XHJcbiAgICAgICAgaWYgKC9hZ2VuZGEvLnRlc3QodXJsKSkge1xyXG4gICAgICAgICAgICBsZXQgY291bnRUaW1lciA9IDA7XHJcbiAgICAgICAgICAgIHRpbWVyVUEgPSBzZXRJbnRlcnZhbChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoKytjb3VudFRpbWVyID4gNTApIHtcclxuICAgICAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKHRpbWVyVUEpO1xyXG4gICAgICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbignRXJyZXVyIFVwZGF0ZSBBZ2VuZGEnLCAnTGUgdGltZXIgZGUgY2hhcmdlbWVudCBhIGTDqXBhc3PDqSBsZSB0ZW1wcyBtYXggYXV0b3Jpc8OpLicpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHVwZGF0ZUFnZW5kYSgpO1xyXG4gICAgICAgICAgICB9LCAxMDAwKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvLyBPbiBvYnNlcnZlIGwnZXNwYWNlIGxpw6kgw6AgbGEgcmVjaGVyY2hlIGRlIHPDqXJpZXMgb3UgZGUgZmlsbXMsIGVuIGhhdXQgZGUgcGFnZS5cclxuICAgIC8vIEFmaW4gZGUgbW9kaWZpZXIgcXVlbHF1ZSBwZXUgbGUgcsOpc3VsdGF0LCBwb3VyIHBvdXZvaXIgbGlyZSBsJ2ludMOpZ3JhbGl0w6kgZHUgdGl0cmVcclxuICAgIGNvbnN0IG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIobXV0YXRpb25zTGlzdCA9PiB7XHJcbiAgICAgICAgbGV0IHVwZGF0ZVRpdGxlID0gKGksIGUpID0+IHsgaWYgKGlzVHJ1bmNhdGVkKGUpKSB7XHJcbiAgICAgICAgICAgICQoZSkucGFyZW50cygnYScpLmF0dHIoJ3RpdGxlJywgJChlKS50ZXh0KCkpO1xyXG4gICAgICAgIH0gfTtcclxuICAgICAgICBmb3IgKGxldCBtdXRhdGlvbiBvZiBtdXRhdGlvbnNMaXN0KSB7XHJcbiAgICAgICAgICAgIGlmIChtdXRhdGlvbi50eXBlID09ICdjaGlsZExpc3QnICYmIG11dGF0aW9uLmFkZGVkTm9kZXMubGVuZ3RoID09PSAxKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbm9kZSA9IG11dGF0aW9uLmFkZGVkTm9kZXNbMF0sICRub2RlID0gJChub2RlKTtcclxuICAgICAgICAgICAgICAgIGlmICgkbm9kZS5oYXNDbGFzcygnY29sLW1kLTQnKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICQoJy5tYWluTGluaycsICRub2RlKS5lYWNoKHVwZGF0ZVRpdGxlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKCRub2RlLmhhc0NsYXNzKCdqcy1zZWFyY2hSZXN1bHQnKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB0aXRsZSA9ICQoJy5tYWluTGluaycsICRub2RlKS5nZXQoMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzVHJ1bmNhdGVkKHRpdGxlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkbm9kZS5hdHRyKCd0aXRsZScsICQodGl0bGUpLnRleHQoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBvYnNlcnZlci5vYnNlcnZlKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZWFjdGpzLWhlYWRlci1zZWFyY2gnKSwgeyBjaGlsZExpc3Q6IHRydWUsIHN1YnRyZWU6IHRydWUgfSk7XHJcbiAgICAvKipcclxuICAgICAqIFZlcmlmaWUgc2kgbCfDqWzDqW1lbnQgZXN0IHRyb25xdcOpLCBnw6luw6lyYWxlbWVudCwgZHUgdGV4dGVcclxuICAgICAqIEBwYXJhbXMge09iamVjdH0gT2JqZXQgRE9NRWxlbWVudFxyXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn1cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gaXNUcnVuY2F0ZWQoZWwpIHtcclxuICAgICAgICByZXR1cm4gZWwuc2Nyb2xsV2lkdGggPiBlbC5jbGllbnRXaWR0aDtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogVmVyaWZpZSBzaSBsJ3V0aWxpc2F0ZXVyIGVzdCBjb25uZWN0w6lcclxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59XHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIHVzZXJJZGVudGlmaWVkKCkge1xyXG4gICAgICAgIHJldHVybiB0eXBlb2YgYmV0YXNlcmllc19hcGlfdXNlcl90b2tlbiAhPT0gJ3VuZGVmaW5lZCc7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIENldHRlIGZvbmN0aW9uIHbDqXJpZmllIGxhIGRlcm5pw6hyZSB2ZXJzaW9uIGRlIGwnQVBJXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGNoZWNrQXBpVmVyc2lvbigpIHtcclxuICAgICAgICBmZXRjaChsb2NhdGlvbi5vcmlnaW4gKyAnL2FwaS92ZXJzaW9ucycpLnRoZW4oKHJlc3ApID0+IHtcclxuICAgICAgICAgICAgaWYgKCFyZXNwLm9rKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJyc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHJlc3AudGV4dCgpO1xyXG4gICAgICAgIH0pLnRoZW4oaHRtbCA9PiB7XHJcbiAgICAgICAgICAgIGlmIChodG1sICYmIGh0bWwubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgLy8gQ29udmVydCB0aGUgSFRNTCBzdHJpbmcgaW50byBhIGRvY3VtZW50IG9iamVjdFxyXG4gICAgICAgICAgICAgICAgbGV0IHBhcnNlciA9IG5ldyBET01QYXJzZXIoKSwgZG9jID0gcGFyc2VyLnBhcnNlRnJvbVN0cmluZyhodG1sLCAndGV4dC9odG1sJyk7XHJcbiAgICAgICAgICAgICAgICAvLyAkKCcubWFpbmNvbnRlbnQgPiB1bCA+IGxpID4gc3Ryb25nJykubGFzdCgpLnRleHQoKS50cmltKCkuc3BsaXQoJyAnKVsxXVxyXG4gICAgICAgICAgICAgICAgY29uc3QgbGF0ZXN0ID0gZG9jLnF1ZXJ5U2VsZWN0b3IoJy5tYWluY29udGVudCA+IHVsID4gbGk6bGFzdC1jaGlsZCA+IHN0cm9uZycpLnRleHRDb250ZW50LnNwbGl0KCcgJylbMV0udHJpbSgpLCBsYXN0RiA9IHBhcnNlRmxvYXQobGF0ZXN0KTtcclxuICAgICAgICAgICAgICAgIGlmICghTnVtYmVyLmlzTmFOKGxhc3RGKSAmJiBsYXN0RiA+IHBhcnNlRmxvYXQoTWVkaWFfMS5NZWRpYS5hcGkudmVyc2lvbnMubGFzdCkpIHtcclxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuYWxlcnQoXCJMJ0FQSSBwb3Nzw6hkZSB1bmUgbm91dmVsbGUgdmVyc2lvbjogXCIgKyBsYXRlc3QpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFBlcm1ldCBkJ2FmZmljaGVyIGxlcyBtZXNzYWdlcyBkJ2VycmV1ciBsacOpcyBhdSBzY3JpcHRcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gdGl0bGUgTGUgdGl0cmUgZHUgbWVzc2FnZVxyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHRleHQgIExlIHRleHRlIGR1IG1lc3NhZ2VcclxuICAgICAqIEByZXR1cm4ge3ZvaWR9XHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIG5vdGlmaWNhdGlvbih0aXRsZSwgdGV4dCkge1xyXG4gICAgICAgIC8vIEdNX25vdGlmaWNhdGlvbihkZXRhaWxzLCBvbmRvbmUpLCBHTV9ub3RpZmljYXRpb24odGV4dCwgdGl0bGUsIGltYWdlLCBvbmNsaWNrKVxyXG4gICAgICAgIGxldCBub3RpZkNvbnRhaW5lciA9ICQoJy51c2Vyc2NyaXB0LW5vdGlmaWNhdGlvbnMnKTtcclxuICAgICAgICAvLyBPbiBham91dGUgbm90cmUgem9uZSBkZSBub3RpZmljYXRpb25zXHJcbiAgICAgICAgaWYgKCQoJy51c2Vyc2NyaXB0LW5vdGlmaWNhdGlvbnMnKS5sZW5ndGggPD0gMCkge1xyXG4gICAgICAgICAgICAkKCcjZmItcm9vdCcpLmFmdGVyKCc8ZGl2IGNsYXNzPVwidXNlcnNjcmlwdC1ub3RpZmljYXRpb25zXCI+PGgzPjxzcGFuIGNsYXNzPVwidGl0bGVcIj48L3NwYW4+PGkgY2xhc3M9XCJmYSBmYS10aW1lc1wiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPjwvaT48L2gzPjxwIGNsYXNzPVwidGV4dFwiPjwvcD48L2Rpdj4nKTtcclxuICAgICAgICAgICAgbm90aWZDb250YWluZXIgPSAkKCcudXNlcnNjcmlwdC1ub3RpZmljYXRpb25zJyk7XHJcbiAgICAgICAgICAgICQoJy51c2Vyc2NyaXB0LW5vdGlmaWNhdGlvbnMgLmZhLXRpbWVzJykuY2xpY2soKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgJCgnLnVzZXJzY3JpcHQtbm90aWZpY2F0aW9ucycpLnNsaWRlVXAoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG5vdGlmQ29udGFpbmVyLmhpZGUoKTtcclxuICAgICAgICAkKCcudXNlcnNjcmlwdC1ub3RpZmljYXRpb25zIC50aXRsZScpLmh0bWwodGl0bGUpO1xyXG4gICAgICAgICQoJy51c2Vyc2NyaXB0LW5vdGlmaWNhdGlvbnMgLnRleHQnKS5odG1sKHRleHQpO1xyXG4gICAgICAgIG5vdGlmQ29udGFpbmVyLnNsaWRlRG93bigpLmRlbGF5KDUwMDApLnNsaWRlVXAoKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogYWRkU2NyaXB0QW5kTGluayAtIFBlcm1ldCBkJ2Fqb3V0ZXIgdW4gc2NyaXB0IG91IHVuIGxpbmsgc3VyIGxhIHBhZ2UgV2ViXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtICB7U3RyaW5nfFN0cmluZ1tdfSBuYW1lIExlIG91IGxlcyBpZGVudGlmaWFudHMgZGVzIMOpbMOpbWVudHMgw6AgY2hhcmdlclxyXG4gICAgICogQHJldHVybiB7dm9pZH1cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gYWRkU2NyaXB0QW5kTGluayhuYW1lKSB7XHJcbiAgICAgICAgaWYgKG5hbWUgaW5zdGFuY2VvZiBBcnJheSkge1xyXG4gICAgICAgICAgICBpZiAobmFtZS5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBuID0gMDsgbiA8IG5hbWUubGVuZ3RoOyBuKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBhZGRTY3JpcHRBbmRMaW5rKG5hbWVbbl0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbmFtZSA9IG5hbWVbMF07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gT24gdsOpcmlmaWUgcXVlIGxlIG5vbSBlc3QgY29ubnVcclxuICAgICAgICBpZiAoIXNjcmlwdHNBbmRTdHlsZXMgfHwgIShuYW1lIGluIHNjcmlwdHNBbmRTdHlsZXMpKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgJHtuYW1lfSBuZSBmYWl0IHBhcyBwYXJ0aXQgZGVzIGRvbm7DqWVzIGRlIHNjcmlwdHMgb3UgZGUgc3R5bGVzYCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBlbGVtZW50LCBkYXRhID0gc2NyaXB0c0FuZFN0eWxlc1tuYW1lXTtcclxuICAgICAgICBpZiAoZGF0YS50eXBlID09PSAnc2NyaXB0Jykge1xyXG4gICAgICAgICAgICAvLyBodHRwczovL2NkbmpzLmNsb3VkZmxhcmUuY29tL2FqYXgvbGlicy9tb21lbnQuanMvMi4yOS4xL21vbWVudC5taW4uanNcclxuICAgICAgICAgICAgZWxlbWVudCA9IGBcclxuICAgICAgICAgICAgICAgIDxzY3JpcHQgc3JjPVwiJHtkYXRhLnNyY31cIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZD1cIiR7ZGF0YS5pZH1cIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbnRlZ3JpdHk9XCIke2RhdGEuaW50ZWdyaXR5fVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNyb3Nzb3JpZ2luPVwiYW5vbnltb3VzXCIgcmVmZXJyZXJwb2xpY3k9XCJuby1yZWZlcnJlclwiPlxyXG4gICAgICAgICAgICAgICAgPC9zY3JpcHQ+YDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoZGF0YS50eXBlID09PSAnc3R5bGUnKSB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQgPSBgXHJcbiAgICAgICAgICAgICAgICA8bGluayByZWw9XCJzdHlsZXNoZWV0XCJcclxuICAgICAgICAgICAgICAgICAgICAgIGlkPVwiJHtkYXRhLmlkfVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICBocmVmPVwiJHtkYXRhLmhyZWZ9XCJcclxuICAgICAgICAgICAgICAgICAgICAgIGludGVncml0eT1cIiR7ZGF0YS5pbnRlZ3JpdHl9XCJcclxuICAgICAgICAgICAgICAgICAgICAgIGNyb3Nzb3JpZ2luPVwiYW5vbnltb3VzXCIgcmVmZXJyZXJwb2xpY3k9XCJuby1yZWZlcnJlclwiIC8+YDtcclxuICAgICAgICB9XHJcbiAgICAgICAgJCgnaGVhZCcpLmFwcGVuZChlbGVtZW50KTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogRm9uY3Rpb24gbW9kaWZpYW50IGxlIGZvbmN0aW9ubmVtZW50IGR1IGZpbHRyZSBwYXlzXHJcbiAgICAgKiBwb3VyIHBlcm1ldHRyZSBkJ2Fqb3V0ZXIgcGx1c2lldXJzIHBheXMgc3VyIGxhIHBhZ2UgZGVzIHPDqXJpZXNcclxuICAgICAqIEByZXR1cm4ge3ZvaWR9XHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIHNlcmllc0ZpbHRlclBheXMoKSB7XHJcbiAgICAgICAgaWYgKHVybC5zcGxpdCgnLycpLnBvcCgpID09ICdhZ2VuZGEnKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgbGV0ICRpbnB1dCA9ICQoJy5maWx0ZXItY29udGFpbmVyLW90aGVycy1jb3VudHJpZXMgaW5wdXQnKTtcclxuICAgICAgICAvLyBTdXBwcmltZXIgbCdhdHRyaWJ1dCBvbmNsaWNrIGRlIGwnaW5wdXQgb3RoZXItY291bnRyaWVzXHJcbiAgICAgICAgJGlucHV0LnJlbW92ZUF0dHIoJ29uY2hhbmdlJyk7XHJcbiAgICAgICAgJGlucHV0Lm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGxldCBoYXNTZWxlY3QgPSAkKCdvcHRpb25bdmFsdWU9XCInICsgJGlucHV0LnZhbCgpICsgJ1wiXScpLCBidG5UZW1wID0gJzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuLXJlc2V0IGJ0bi1idG4gZmlsdGVyLWJ0biBhY3RpdmVcIiBpZD1cIicgK1xyXG4gICAgICAgICAgICAgICAgaGFzU2VsZWN0LmF0dHIoXCJpZFwiKSArICdcIiBvbmNsaWNrPVwic2VhcmNoT3B0aW9uKHRoaXMpO1wiPicgK1xyXG4gICAgICAgICAgICAgICAgaGFzU2VsZWN0LmF0dHIoXCJ2YWx1ZVwiKSArICc8L2J1dHRvbj4nO1xyXG4gICAgICAgICAgICAkKCcjcGF5cyA+IGJ1dHRvbicpLmxhc3QoKS5hZnRlcihidG5UZW1wKTtcclxuICAgICAgICAgICAgZGVsZXRlRmlsdGVyT3RoZXJzQ291bnRyaWVzKCk7XHJcbiAgICAgICAgICAgIGNvdW50RmlsdGVyKFwicGF5c1wiKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBjb25zdCBiYXNlVXJsID0gZ2VuZXJhdGVfcm91dGUoXCJzaG93c1wiKTtcclxuICAgICAgICBsZXQgaGFzaCA9IHVybC5zdWJzdHJpbmcoYmFzZVVybC5sZW5ndGgpO1xyXG4gICAgICAgIGlmIChoYXNoLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGRhdGEgPSBoYXNoLnNwbGl0KCcvJyk7XHJcbiAgICAgICAgaWYgKCFkYXRhLmZpbmQoKGVsKSA9PiBlbC5tYXRjaCgvXnRyaS18c29ydC0vZykpKSB7XHJcbiAgICAgICAgICAgIGRhdGEucHVzaChDT05TVEFOVEVfRklMVEVSLnRyaSArIFwiLVwiICsgQ09OU1RBTlRFX1NPUlQucG9wdWxhcml0ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAobGV0IGkgaW4gZGF0YSkge1xyXG4gICAgICAgICAgICBjb25zdCBzcGxpdERhdGEgPSBkYXRhW2ldLnNwbGl0KCctJyksIGZpbHRlciA9IHNwbGl0RGF0YS5zaGlmdCgpLCBkYXRhRmlsdGVyID0gZGVjb2RlVVJJQ29tcG9uZW50KHNwbGl0RGF0YS5qb2luKCctJykpO1xyXG4gICAgICAgICAgICBpZiAoZmlsdGVyICYmIGRhdGFGaWx0ZXIgJiZcclxuICAgICAgICAgICAgICAgIChmaWx0ZXIgPT09IENPTlNUQU5URV9GSUxURVIucGFzcGF5cyB8fCBmaWx0ZXIgPT09IENPTlNUQU5URV9GSUxURVIucGF5cykpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGhhc0FjdGl2ZSA9IGZpbHRlciA9PT0gQ09OU1RBTlRFX0ZJTFRFUi5wYXlzLCBoYXNCdXR0b24gPSAkKFwiI2xlZnQgI3BheXMgPiBidXR0b24jXCIgKyBkYXRhRmlsdGVyLnRvVXBwZXJDYXNlKCkpLCBvcHRpb25FeGlzdCA9ICQoJ2RhdGFsaXN0W2lkPVwib3RoZXItY291bnRyaWVzXCJdIG9wdGlvbltpZD1cIicgKyBkYXRhRmlsdGVyLnRvVXBwZXJDYXNlKCkgKyAnXCJdJyk7XHJcbiAgICAgICAgICAgICAgICBpZiAoaGFzQnV0dG9uLmxlbmd0aCA8PSAwICYmIG9wdGlvbkV4aXN0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGJ0blRlbXAgPSAnPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4tcmVzZXQgYnRuLWJ0biBmaWx0ZXItYnRuJyArIChoYXNBY3RpdmUgPyAnIGFjdGl2ZScgOiAnIGhhY3RpdmUnKSArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdcIiBpZD1cIicgKyBkYXRhRmlsdGVyLnRvVXBwZXJDYXNlKCkgKyAnXCIgb25jbGljaz1cInNlYXJjaE9wdGlvbih0aGlzKTtcIj4nICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uRXhpc3QuYXR0cigndmFsdWUnKSArICc8L2J1dHRvbj4nO1xyXG4gICAgICAgICAgICAgICAgICAgICQoJyNwYXlzID4gYnV0dG9uJykubGFzdCgpLmFmdGVyKGJ0blRlbXApO1xyXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbkV4aXN0LnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZUZpbHRlck90aGVyc0NvdW50cmllcygpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvdW50RmlsdGVyKFwicGF5c1wiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBmdW5jdGlvbiBjb3VudEZpbHRlcih0YXJnZXQpIHtcclxuICAgICAgICAgICAgY29uc3QgY3VycmVudCA9ICQoJyNjb3VudF8nICsgdGFyZ2V0KTtcclxuICAgICAgICAgICAgaWYgKGN1cnJlbnQubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGxlbiA9ICQoJyNwYXlzID4gYnV0dG9uLmhhY3RpdmUsICNwYXlzID4gYnV0dG9uLmFjdGl2ZScpLmxlbmd0aCwgZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICAgICAgICAgIGN1cnJlbnQudGV4dChsZW4pO1xyXG4gICAgICAgICAgICAgICAgaWYgKGxlbiA+PSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheSA9ICdibG9jayc7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50LmNzcygnZGlzcGxheScsIGRpc3BsYXkpO1xyXG4gICAgICAgICAgICAgICAgaGlkZUJ1dHRvblJlc2V0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIEZvbmN0aW9uIGQnYWpvdXQgZCd1biBwYWdpbmF0ZXVyIGVuIGhhdXQgZGUgbGlzdGUgZGVzIHPDqXJpZXNcclxuICAgICAqIEByZXR1cm4ge3ZvaWR9XHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIHdhaXRQYWdpbmF0aW9uKCkge1xyXG4gICAgICAgIGxldCBsb2FkZWQgPSBmYWxzZTtcclxuICAgICAgICAvLyBPbiBhdHRlbmQgbGEgcHLDqXNlbmNlIGR1IHBhZ2luYXRldXJcclxuICAgICAgICBsZXQgdGltZXJTZXJpZXMgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XHJcbiAgICAgICAgICAgIGlmICgkKCcjcGFnaW5hdGlvbi1zaG93cycpLmxlbmd0aCA8IDEpXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodGltZXJTZXJpZXMpO1xyXG4gICAgICAgICAgICAvLyBPbiBjb3BpZSBjb2xsZSBsZSBwYWdpbmF0ZXVyIGVuIGhhdXQgZGUgbGEgbGlzdGUgZGVzIHPDqXJpZXNcclxuICAgICAgICAgICAgJCgnI3Jlc3VsdHMtc2hvd3MnKS5wcmVwZW5kKCQoJyNwYWdpbmF0aW9uLXNob3dzJykuY2xvbmUodHJ1ZSwgdHJ1ZSkpO1xyXG4gICAgICAgICAgICAvLyBPbiBvYnNlcnZlIGxlcyBtb2RpZmljYXRpb25zIGRhbnMgbGUgbm9ldWQgZHUgcGFnaW5hdGV1clxyXG4gICAgICAgICAgICAkKCcjcmVzdWx0cy1zaG93cycpLm9uKCdET01TdWJ0cmVlTW9kaWZpZWQnLCAnI3BhZ2luYXRpb24tc2hvd3MnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWxvYWRlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHdhaXRQYWdpbmF0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9hZGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSwgNTAwKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogQWpvdXRlIGRlcyBhbcOpbGlvcmF0aW9ucyBzdXIgbGEgcGFnZSBkZSBsYSBjb25zb2xlIGRlIGwnQVBJXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIHVwZGF0ZUFwaUNvbnNvbGUoKSB7XHJcbiAgICAgICAgLy8gTGlzdGVuZXIgc3VyIGxlIGJ0biBub3V2ZWF1IHBhcmFtw6h0cmVcclxuICAgICAgICAkKCdkaXYuZm9ybS1ncm91cCBidXR0b24uYnRuLWJ0bi5idG4tLWJsdWUnKS5wcm9wKCdvbmNsaWNrJywgbnVsbCkub2ZmKCdjbGljaycpLmNsaWNrKChlLCBrZXkpID0+IHtcclxuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICBpZiAoZGVidWcpXHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnbm91dmVhdSBwYXJhbWV0cmUgaGFuZGxlcicsIGtleSk7XHJcbiAgICAgICAgICAgIC8vIE9uIGFqb3V0ZSB1bmUgbm91dmVsbGUgbGlnbmUgZGUgcGFyYW3DqHRyZVxyXG4gICAgICAgICAgICBuZXdBcGlQYXJhbWV0ZXIoKTtcclxuICAgICAgICAgICAgLy8gT24gaW5zw6hyZSBsYSBjbMOpIGR1IHBhcmFtw6h0cmUsIHNpIGVsbGUgZXN0IHByw6lzZW50ZVxyXG4gICAgICAgICAgICBpZiAoa2V5KSB7XHJcbiAgICAgICAgICAgICAgICAkKCdpbnB1dC5uYW1lOmxhc3QnKS52YWwoa2V5KTtcclxuICAgICAgICAgICAgICAgICQoJ2lucHV0LmZvcm0tY29udHJvbDpsYXN0JykuZm9jdXMoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBhZGRSZW1vdmVQYXJhbVRvQ29uc29sZSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vIExpc3RlbmVyIHN1ciBsYSBsaXN0ZSBkZXMgbcOpdGhvZGVzXHJcbiAgICAgICAgJCgnI21ldGhvZCcpLm9uKCdjaGFuZ2UnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIE9uIHN1cHByaW1lIHRvdXMgbGVzIHBhcmFtw6h0cmVzIGV4aXN0YW50c1xyXG4gICAgICAgICAgICAkKCcjYXBpLXBhcmFtcyAucmVtb3ZlJykucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIC8vIEVuIGF0dGVudGUgZGUgbGEgZG9jdW1lbnRhdGlvbiBkZSBsJ0FQSVxyXG4gICAgICAgICAgICB0aW1lciA9IHNldEludGVydmFsKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmICgkKCcjZG9jIGNvZGUnKS5sZW5ndGggPD0gMClcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKHRpbWVyKTsgLy8gT24gc3VwcHJpbWUgbGUgdGltZXJcclxuICAgICAgICAgICAgICAgIGxldCBwYXJhbXNEb2MgPSAkKCcjZG9jID4gdWwgPiBsaSA+IGNvZGUnKTtcclxuICAgICAgICAgICAgICAgIGlmIChkZWJ1ZylcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygncGFyYW1zRG9jJywgcGFyYW1zRG9jKTtcclxuICAgICAgICAgICAgICAgIHBhcmFtc0RvYy5jc3MoJ2N1cnNvcicsICdwb2ludGVyJyk7XHJcbiAgICAgICAgICAgICAgICAvLyBPbiBham91dGUgbGEgY2zDqSBkdSBwYXJhbcOodHJlIGRhbnMgdW5lIG5vdXZlbGxlIGxpZ25lIGRlIHBhcmFtw6h0cmVcclxuICAgICAgICAgICAgICAgIHBhcmFtc0RvYy5jbGljaygoZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICQoJ2Rpdi5mb3JtLWdyb3VwIGJ1dHRvbi5idG4tYnRuLmJ0bi0tYmx1ZScpLnRyaWdnZXIoJ2NsaWNrJywgWyQoZS5jdXJyZW50VGFyZ2V0KS50ZXh0KCkudHJpbSgpXSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSwgNTAwKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAvLyBBam91dGUgdW4gY2FkZW5hcyB2w6lyb3VpbGzDqSBhdSBwYXJhbcOodHJlICdWZXJzaW9uJyBub24tbW9kaWZpYWJsZVxyXG4gICAgICAgICQoJy5hcGktcGFyYW1zOmZpcnN0JykuYXBwZW5kKCc8aSBjbGFzcz1cImZhIGZhLWxvY2sgZmEtMnhcIiBzdHlsZT1cIm1hcmdpbi1sZWZ0OiAxMHB4O3ZlcnRpY2FsLWFsaWduOm1pZGRsZTtjdXJzb3I6bm90LWFsbG93ZWQ7XCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+PC9pPicpO1xyXG4gICAgICAgIGFkZFJlbW92ZVBhcmFtVG9Db25zb2xlKCk7XHJcbiAgICAgICAgYWRkVG9nZ2xlU2hvd1Jlc3VsdCgpO1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIE9uIGFqb3V0ZSB1biBib3V0b24gcG91ciBzdXBwcmltZXIgbGEgbGlnbmUgZCd1biBwYXJhbcOodHJlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gYWRkUmVtb3ZlUGFyYW1Ub0NvbnNvbGUoKSB7XHJcbiAgICAgICAgICAgIGxldCBlbHRzID0gJCgnLmFwaS1wYXJhbXM6bm90KC5yZW1vdmUpOm5vdCgubG9jayk6bm90KDpmaXJzdCknKTtcclxuICAgICAgICAgICAgZWx0c1xyXG4gICAgICAgICAgICAgICAgLmFwcGVuZCgnPGkgY2xhc3M9XCJyZW1vdmUtaW5wdXQgZmEgZmEtbWludXMtY2lyY2xlIGZhLTJ4XCIgc3R5bGU9XCJtYXJnaW4tbGVmdDogMTBweDt2ZXJ0aWNhbC1hbGlnbjptaWRkbGU7Y3Vyc29yOnBvaW50ZXI7XCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+PC9pPicpXHJcbiAgICAgICAgICAgICAgICAuYXBwZW5kKCc8aSBjbGFzcz1cImxvY2stcGFyYW0gZmEgZmEtdW5sb2NrIGZhLTJ4XCIgc3R5bGU9XCJtYXJnaW4tbGVmdDogMTBweDt2ZXJ0aWNhbC1hbGlnbjptaWRkbGU7Y3Vyc29yOnBvaW50ZXI7XCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+PC9pPicpXHJcbiAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoJ3JlbW92ZScpO1xyXG4gICAgICAgICAgICAkKCcucmVtb3ZlLWlucHV0JykuY2xpY2soKGUpID0+IHtcclxuICAgICAgICAgICAgICAgICQoZS5jdXJyZW50VGFyZ2V0KS5wYXJlbnQoJy5hcGktcGFyYW1zJykucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAkKCcubG9jay1wYXJhbScsIGVsdHMpLmNsaWNrKChlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgbGV0IHNlbGYgPSAkKGUuY3VycmVudFRhcmdldCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGVidWcpXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2xvY2stcGFyYW0nLCBzZWxmLCBzZWxmLmhhc0NsYXNzKCdmYS11bmxvY2snKSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoc2VsZi5oYXNDbGFzcygnZmEtdW5sb2NrJykpIHtcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLnJlbW92ZUNsYXNzKCdmYS11bmxvY2snKS5hZGRDbGFzcygnZmEtbG9jaycpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYucGFyZW50KCcuYXBpLXBhcmFtcycpLnJlbW92ZUNsYXNzKCdyZW1vdmUnKS5hZGRDbGFzcygnbG9jaycpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5yZW1vdmVDbGFzcygnZmEtbG9jaycpLmFkZENsYXNzKCdmYS11bmxvY2snKTtcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLnBhcmVudCgnLmFwaS1wYXJhbXMnKS5hZGRDbGFzcygncmVtb3ZlJykucmVtb3ZlQ2xhc3MoJ2xvY2snKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZ1bmN0aW9uIGFkZFRvZ2dsZVNob3dSZXN1bHQoKSB7XHJcbiAgICAgICAgICAgIGxldCAkcmVzdWx0ID0gJCgnI3Jlc3VsdCcpO1xyXG4gICAgICAgICAgICAvLyBPbiBham91dGUgdW4gdGl0cmUgcG91ciBsYSBzZWN0aW9uIGRlIHLDqXN1bHRhdCBkZSBsYSByZXF1w6p0ZVxyXG4gICAgICAgICAgICAkcmVzdWx0LmJlZm9yZSgnPGgyPlLDqXN1bHRhdCBkZSBsYSByZXF1w6p0ZSA8c3BhbiBjbGFzcz1cInRvZ2dsZVwiIHN0eWxlPVwibWFyZ2luLWxlZnQ6MTBweDtcIj48aSBjbGFzcz1cImZhIGZhLWNoZXZyb24tY2lyY2xlLWRvd25cIiBhcmlhLWhpZGRlbj1cInRydWVcIj48L2k+PC9zcGFuPjwvaDI+Jyk7XHJcbiAgICAgICAgICAgICQoJy50b2dnbGUnKS5jbGljaygoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvLyBPbiByw6lhbGlzZSB1biB0b2dnbGUgc3VyIGxhIHNlY3Rpb24gZGUgcsOpc3VsdGF0IGV0IG9uIG1vZGlmaWUgbCdpY8O0bmUgZHUgY2hldnJvblxyXG4gICAgICAgICAgICAgICAgJHJlc3VsdC50b2dnbGUoNDAwLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCRyZXN1bHQuaXMoJzpoaWRkZW4nKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcudG9nZ2xlIGknKS5yZW1vdmVDbGFzcygnZmEtY2hldnJvbi1jaXJjbGUtdXAnKS5hZGRDbGFzcygnZmEtY2hldnJvbi1jaXJjbGUtZG93bicpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnLnRvZ2dsZSBpJykucmVtb3ZlQ2xhc3MoJ2ZhLWNoZXZyb24tY2lyY2xlLWRvd24nKS5hZGRDbGFzcygnZmEtY2hldnJvbi1jaXJjbGUtdXAnKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIC8vIE9uIG1vZGlmaWUgbGUgc2VucyBkdSBjaGV2cm9uIGxvcnMgZHUgbGFuY2VtZW50IGQndW5lIHJlcXXDqnRlXHJcbiAgICAgICAgICAgICQoJ2J1dHRvbi5pcy1mdWxsJykuY2xpY2soKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgJCgnLnRvZ2dsZSBpJykucmVtb3ZlQ2xhc3MoJ2ZhLWNoZXZyb24tY2lyY2xlLWRvd24nKS5hZGRDbGFzcygnZmEtY2hldnJvbi1jaXJjbGUtdXAnKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLypcclxuICAgICAqIEFqb3V0ZSB1biBzb21tYWlyZSBzdXIgbGVzIHBhZ2VzIGRlIGRvY3VtZW50YXRpb24gZGVzIG3DqXRob2RlcyBkZSBsJ0FQSVxyXG4gICAgICogTGUgc29tbWFpcmUgZXN0IGNvbnN0aXR1w6kgZGVzIGxpZW5zIHZlcnMgbGVzIGZvbmN0aW9ucyBkZXMgbcOpdGhvZGVzLlxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBzb21tYWlyZURldkFwaSgpIHtcclxuICAgICAgICBpZiAoZGVidWcpXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdidWlsZCBzb21tYWlyZScpO1xyXG4gICAgICAgIGxldCB0aXRsZXMgPSAkKCcubWFpbmNvbnRlbnQgaDInKSwgbWV0aG9kcyA9IHt9O1xyXG4gICAgICAgIC8vIEFqb3V0IGR1IHN0eWxlIENTUyBwb3VyIGxlcyB0YWJsZXNcclxuICAgICAgICBhZGRTY3JpcHRBbmRMaW5rKCd0YWJsZWNzcycpO1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIENvbnN0cnVpdCB1bmUgY2VsbHVsZSBkZSB0YWJsZSBIVE1MIHBvdXIgdW5lIG1ldGhvZGVcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSAge1N0cmluZ30gdmVyYiBMZSB2ZXJiZSBIVFRQIHV0aWxpc8OpIHBhciBsYSBmb25jdGlvblxyXG4gICAgICAgICAqIEBwYXJhbSAge1N0cmluZ30ga2V5ICBMJ2lkZW50aWZpYW50IGRlIGxhIGZvbmN0aW9uXHJcbiAgICAgICAgICogQHJldHVybiB7U3RyaW5nfVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIGJ1aWxkQ2VsbCh2ZXJiLCBrZXkpIHtcclxuICAgICAgICAgICAgbGV0IGNlbGwgPSAnPHRkPic7XHJcbiAgICAgICAgICAgIGlmICh2ZXJiIGluIG1ldGhvZHNba2V5XSkge1xyXG4gICAgICAgICAgICAgICAgY2VsbCArPSBgPGkgZGF0YS1pZD1cIiR7bWV0aG9kc1trZXldW3ZlcmJdLmlkfVwiIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJsaW5rU29tbWFpcmUgZmEgZmEtY2hlY2sgZmEtMnhcIiBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlPVwiJHttZXRob2RzW2tleV1bdmVyYl0udGl0bGV9XCI+PC9pPmA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGNlbGwgKyAnPC90ZD4nO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBDb25zdHJ1aXQgdW5lIGxpZ25lIGRlIHRhYmxlIEhUTUwgcG91ciB1bmUgZm9uY3Rpb25cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSAge1N0cmluZ30ga2V5IEwnaWRlbnRpZmlhbnQgZGUgbGEgZm9uY3Rpb25cclxuICAgICAgICAgKiBAcmV0dXJuIHtTdHJpbmd9ICAgICBMYSBsaWduZSBIVE1MXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gYnVpbGRSb3coa2V5KSB7XHJcbiAgICAgICAgICAgIGxldCByb3cgPSBgPHRyPjx0aCBzY29wZT1cInJvd1wiIGNsYXNzPVwiZm9uY3Rpb25cIj4ke21ldGhvZHNba2V5XS50aXRsZX08L3RoPmA7XHJcbiAgICAgICAgICAgIHJvdyArPSBidWlsZENlbGwoJ0dFVCcsIGtleSk7XHJcbiAgICAgICAgICAgIHJvdyArPSBidWlsZENlbGwoJ1BPU1QnLCBrZXkpO1xyXG4gICAgICAgICAgICByb3cgKz0gYnVpbGRDZWxsKCdQVVQnLCBrZXkpO1xyXG4gICAgICAgICAgICByb3cgKz0gYnVpbGRDZWxsKCdERUxFVEUnLCBrZXkpO1xyXG4gICAgICAgICAgICByZXR1cm4gcm93ICsgJzwvdHI+JztcclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRmFicmlxdWUgbGEgdGFibGUgSFRNTCBkdSBzb21tYWlyZVxyXG4gICAgICAgICAqIEByZXR1cm4ge09iamVjdH0gTCdvYmpldCBqUXVlcnkgZGUgbGEgdGFibGUgSFRNTFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIGJ1aWxkVGFibGUoKSB7XHJcbiAgICAgICAgICAgIGxldCAkdGFibGUgPSAkKGBcclxuICAgICAgICAgICAgICAgIDxkaXYgaWQ9XCJzb21tYWlyZVwiIGNsYXNzPVwidGFibGUtcmVzcG9uc2l2ZVwiIHN0eWxlPVwiZGlzcGxheTpub25lO1wiPlxyXG4gICAgICAgICAgICAgICAgICAgIDx0YWJsZSBjbGFzcz1cInRhYmxlIHRhYmxlLWRhcmsgdGFibGUtc3RyaXBlZCB0YWJsZS1ib3JkZXJlZFwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8dGhlYWQgY2xhc3M9XCJ0aGVhZC1kYXJrXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dHI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRoIGNvbHNwYW49XCI1XCIgc2NvcGU9XCJjb2xcIiBjbGFzcz1cImNvbC1sZy0xMiBsaVRpdGxlXCI+U29tbWFpcmU8L3RoPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90cj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0cj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGggc2NvcGU9XCJjb2xcIiBjbGFzcz1cImNvbC1sZy0zXCI+Rm9uY3Rpb248L3RoPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aCBzY29wZT1cImNvbFwiIGNsYXNzPVwiY29sLWxnLTJcIj5HRVQ8L3RoPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aCBzY29wZT1cImNvbFwiIGNsYXNzPVwiY29sLWxnLTJcIj5QT1NUPC90aD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGggc2NvcGU9XCJjb2xcIiBjbGFzcz1cImNvbC1sZy0yXCI+UFVUPC90aD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGggc2NvcGU9XCJjb2xcIiBjbGFzcz1cImNvbC1sZy0yXCI+REVMRVRFPC90aD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdHI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdGhlYWQ+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDx0Ym9keT48L3Rib2R5PlxyXG4gICAgICAgICAgICAgICAgICAgIDwvdGFibGU+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5gKSwgJHRib2R5ID0gJHRhYmxlLmZpbmQoJ3Rib2R5Jyk7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGtleSBpbiBtZXRob2RzKSB7XHJcbiAgICAgICAgICAgICAgICAkdGJvZHkuYXBwZW5kKGJ1aWxkUm93KGtleSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiAkdGFibGU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAobGV0IHQgPSAwOyB0IDwgdGl0bGVzLmxlbmd0aDsgdCsrKSB7XHJcbiAgICAgICAgICAgIC8vIGFqb3V0ZXIgbGVzIElEIGF1eCB0aXRyZXMgZGVzIG1ldGhvZGVzLCBhaW5zaSBxdSd1biBjaGV2cm9uIHBvdXIgcmVudm95ZXIgYXUgc29tbWFpcmVcclxuICAgICAgICAgICAgbGV0ICR0aXRsZSA9ICQodGl0bGVzLmdldCh0KSksIGlkID0gJHRpdGxlLnRleHQoKS50cmltKCkudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC8gLywgJ18nKS5yZXBsYWNlKC9cXC8vLCAnLScpLCB0eHQgPSAkdGl0bGUudGV4dCgpLnRyaW0oKS5zcGxpdCgnICcpWzFdLCBkZXNjID0gJHRpdGxlLm5leHQoJ3AnKS50ZXh0KCksIGtleSA9IHR4dC50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoL1xcLy8sICcnKSwgdmVyYiA9ICR0aXRsZS50ZXh0KCkudHJpbSgpLnNwbGl0KCcgJylbMF0udG9VcHBlckNhc2UoKTtcclxuICAgICAgICAgICAgJHRpdGxlLmF0dHIoJ2lkJywgaWQpO1xyXG4gICAgICAgICAgICAkdGl0bGUuYXBwZW5kKCc8aSBjbGFzcz1cImZhIGZhLWNoZXZyb24tY2lyY2xlLXVwXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCIgdGl0bGU9XCJSZXRvdXIgYXUgc29tbWFpcmVcIj48L2k+Jyk7XHJcbiAgICAgICAgICAgIGlmICghKGtleSBpbiBtZXRob2RzKSlcclxuICAgICAgICAgICAgICAgIG1ldGhvZHNba2V5XSA9IHsgdGl0bGU6IHR4dCB9O1xyXG4gICAgICAgICAgICBtZXRob2RzW2tleV1bdmVyYl0gPSB7IGlkOiBpZCwgdGl0bGU6IGRlc2MgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gQ29uc3RydWlyZSB1biBzb21tYWlyZSBkZXMgZm9uY3Rpb25zXHJcbiAgICAgICAgLy9pZiAoZGVidWcpIGNvbnNvbGUubG9nKCdtZXRob2RzJywgbWV0aG9kcyk7XHJcbiAgICAgICAgJCgnLm1haW5jb250ZW50IGgxJykuYWZ0ZXIoYnVpbGRUYWJsZSgpKTtcclxuICAgICAgICAkKCcjc29tbWFpcmUnKS5mYWRlSW4oKTtcclxuICAgICAgICAkKCcubGlua1NvbW1haXJlJykuY2xpY2soKGUpID0+IHtcclxuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAkKCcjJyArICQoZS5jdXJyZW50VGFyZ2V0KS5kYXRhKCdpZCcpKS5nZXQoMCkuc2Nyb2xsSW50b1ZpZXcodHJ1ZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnLmZhLWNoZXZyb24tY2lyY2xlLXVwJykuY2xpY2soZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc29tbWFpcmUnKS5zY3JvbGxJbnRvVmlldyh0cnVlKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogQWpvdXRlIHVuIGJvdXRvbiBwb3VyIGxlIGRldiBwb3VyIGFmZmljaGVyIGxlcyBkb25uw6llcyBkZSBsYSByZXNzb3VyY2VcclxuICAgICAqIGRhbnMgdW5lIG1vZGFsXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGFkZEJ0bkRldigpIHtcclxuICAgICAgICBjb25zdCBidG5IVE1MID0gJzxkaXYgY2xhc3M9XCJibG9ja0luZm9ybWF0aW9uc19fYWN0aW9uXCI+PGJ1dHRvbiBjbGFzcz1cImJ0bi1yZXNldCBidG4tdHJhbnNwYXJlbnRcIiB0eXBlPVwiYnV0dG9uXCIgc3R5bGU9XCJoZWlnaHQ6NDRweDt3aWR0aDo2NHB4O1wiPjxpIGNsYXNzPVwiZmEgZmEtd3JlbmNoXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCIgc3R5bGU9XCJmb250LXNpemU6MS41ZW07XCI+PC9pPjwvYnV0dG9uPjxkaXYgY2xhc3M9XCJsYWJlbFwiPkRldjwvZGl2PjwvZGl2PicsIGRpYWxvZ0hUTUwgPSBgXHJcbiAgICAgICAgICAgICAgPHN0eWxlPlxyXG4gICAgICAgICAgICAgICAgLmRpYWxvZy1jb250YWluZXIgLmNsb3NlIHtcclxuICAgICAgICAgICAgICAgICAgZmxvYXQ6IHJpZ2h0O1xyXG4gICAgICAgICAgICAgICAgICBmb250LXNpemU6IDEuNXJlbTtcclxuICAgICAgICAgICAgICAgICAgZm9udC13ZWlnaHQ6IDcwMDtcclxuICAgICAgICAgICAgICAgICAgbGluZS1oZWlnaHQ6IDE7XHJcbiAgICAgICAgICAgICAgICAgIGNvbG9yOiAjZmZmO1xyXG4gICAgICAgICAgICAgICAgICB0ZXh0LXNoYWRvdzogMCAxcHggMCAjZmZmO1xyXG4gICAgICAgICAgICAgICAgICBvcGFjaXR5OiAuNTtcclxuICAgICAgICAgICAgICAgICAgbWFyZ2luLXJpZ2h0OiAyMHB4O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLmRpYWxvZy1jb250YWluZXIgLmNsb3NlOmhvdmVyIHtjb2xvcjogIzAwMDt0ZXh0LWRlY29yYXRpb246IG5vbmU7fVxyXG4gICAgICAgICAgICAgICAgLmRpYWxvZy1jb250YWluZXIgLmNsb3NlOm5vdCg6ZGlzYWJsZWQpOmhvdmVyLCAuY2xvc2U6bm90KDpkaXNhYmxlZCk6Zm9jdXMge29wYWNpdHk6IC43NTt9XHJcbiAgICAgICAgICAgICAgICAuZGlhbG9nLWNvbnRhaW5lciBidXR0b24uY2xvc2Uge3BhZGRpbmc6IDA7YmFja2dyb3VuZC1jb2xvcjogdHJhbnNwYXJlbnQ7Ym9yZGVyOiAwO31cclxuICAgICAgICAgICAgICAgIC5kaWFsb2ctY29udGFpbmVyIC5jb3VudGVyIHtmb250LXNpemU6MC44ZW07fVxyXG4gICAgICAgICAgICAgIDwvc3R5bGU+XHJcbiAgICAgICAgICAgICAgICA8ZGl2XHJcbiAgICAgICAgICAgICAgICAgIGNsYXNzPVwiZGlhbG9nIGRpYWxvZy1jb250YWluZXIgdGFibGUtZGFya1wiXHJcbiAgICAgICAgICAgICAgICAgIGlkPVwiZGlhbG9nLXJlc291cmNlXCJcclxuICAgICAgICAgICAgICAgICAgYXJpYS1sYWJlbGxlZGJ5PVwiZGlhbG9nLXJlc291cmNlLXRpdGxlXCJcclxuICAgICAgICAgICAgICAgICAgc3R5bGU9XCJkaXNwbGF5Om5vbmU7XCJcclxuICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRpYWxvZy1vdmVybGF5XCI+PC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkaWFsb2ctY29udGVudFwiIHJvbGU9XCJkb2N1bWVudFwiIHN0eWxlPVwid2lkdGg6IDgwJTtcIj5cclxuICAgICAgICAgICAgICAgICAgICA8aDEgaWQ9XCJkaWFsb2ctcmVzb3VyY2UtdGl0bGVcIj5Eb25uw6llcyBkZSBsYSByZXNzb3VyY2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJjb3VudGVyXCI+PC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGUgPSBcImJ1dHRvblwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3MgPSBcImNsb3NlXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmlhLWxhYmVsID0gXCJDbG9zZVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGUgPSBcIkZlcm1lciBsYSBib8OudGUgZGUgZGlhbG9ndWVcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPiZ0aW1lczs8L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvaDE+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRhdGEtcmVzb3VyY2UgY29udGVudFwiPjwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDwvZGl2PmA7XHJcbiAgICAgICAgJCgnLmJsb2NrSW5mb3JtYXRpb25zX19hY3Rpb25zJykuYXBwZW5kKGJ0bkhUTUwpO1xyXG4gICAgICAgICQoJ2JvZHknKS5hcHBlbmQoZGlhbG9nSFRNTCk7XHJcbiAgICAgICAgbGV0ICRkaWFsb2cgPSAkKCcjZGlhbG9nLXJlc291cmNlJyk7XHJcbiAgICAgICAgY29uc3QgaHRtbCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcclxuICAgICAgICBjb25zdCBvblNob3cgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGh0bWwuc3R5bGUub3ZlcmZsb3dZID0gJ2hpZGRlbic7XHJcbiAgICAgICAgICAgICQoJyNkaWFsb2ctcmVzb3VyY2UnKVxyXG4gICAgICAgICAgICAgICAgLmNzcygnei1pbmRleCcsICcxMDA1JylcclxuICAgICAgICAgICAgICAgIC5jc3MoJ292ZXJmbG93JywgJ3Njcm9sbCcpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgY29uc3Qgb25IaWRlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBodG1sLnN0eWxlLm92ZXJmbG93WSA9ICcnO1xyXG4gICAgICAgICAgICAkKCcjZGlhbG9nLXJlc291cmNlJylcclxuICAgICAgICAgICAgICAgIC5jc3MoJ3otaW5kZXgnLCAnMCcpXHJcbiAgICAgICAgICAgICAgICAuY3NzKCdvdmVyZmxvdycsICdub25lJyk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICAkKCcuYmxvY2tJbmZvcm1hdGlvbnNfX2FjdGlvbnMgLmZhLXdyZW5jaCcpLnBhcmVudCgpLmNsaWNrKChlKSA9PiB7XHJcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgbGV0IHR5cGUgPSBnZXRBcGlSZXNvdXJjZShsb2NhdGlvbi5wYXRobmFtZS5zcGxpdCgnLycpWzFdKSwgLy8gSW5kaXF1ZSBkZSBxdWVsIHR5cGUgZGUgcmVzc291cmNlIGlsIHMnYWdpdFxyXG4gICAgICAgICAgICAkZGF0YVJlcyA9ICQoJyNkaWFsb2ctcmVzb3VyY2UgLmRhdGEtcmVzb3VyY2UnKTsgLy8gRE9NRWxlbWVudCBjb250ZW5hbnQgbGUgcmVuZHUgSlNPTiBkZSBsYSByZXNzb3VyY2VcclxuICAgICAgICAgICAgZ2V0UmVzb3VyY2VEYXRhKCkudGhlbihmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgLy8gaWYgKGRlYnVnKSBjb25zb2xlLmxvZygnYWRkQnRuRGV2IHByb21pc2UgcmV0dXJuJywgZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAkZGF0YVJlcy5lbXB0eSgpLmFwcGVuZChyZW5kZXJqc29uLnNldF9zaG93X3RvX2xldmVsKDIpKGRhdGFbdHlwZS5zaW5ndWxhcl0pKTtcclxuICAgICAgICAgICAgICAgICQoJyNkaWFsb2ctcmVzb3VyY2UtdGl0bGUgc3Bhbi5jb3VudGVyJykuZW1wdHkoKS50ZXh0KCcoJyArIE1lZGlhXzEuTWVkaWEuY291bnRlciArICcgYXBwZWxzIEFQSSknKTtcclxuICAgICAgICAgICAgICAgICRkaWFsb2cuc2hvdyg0MDAsIG9uU2hvdyk7XHJcbiAgICAgICAgICAgIH0sIChlcnIpID0+IHtcclxuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbignRXJyZXVyIGRlIHLDqWN1cMOpcmF0aW9uIGRlIGxhIHJlc3NvdXJjZScsICdhZGRCdG5EZXY6ICcgKyBlcnIpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKCcuZGlhbG9nIGJ1dHRvbi5jbG9zZScpLmNsaWNrKGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgJGRpYWxvZy5oaWRlKDQwMCwgb25IaWRlKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogQ2V0dGUgZm9uY3Rpb24gcGVybWV0IGRlIHJldG91cm5lciBsYSByZXNzb3VyY2UgcHJpbmNpcGFsZSBzb3VzIGZvcm1lIGQnb2JqZXRcclxuICAgICAqIEBwYXJhbSAge2Jvb2xlYW59IFtub2NhY2hlPWZhbHNlXSBGbGFnIGluZGlxdWFudCBzaSBpbCBmYXV0IHV0aWxpc2VyIGxlcyBkb25uw6llcyBlbiBjYWNoZVxyXG4gICAgICogQHBhcmFtICB7bnVtYmVyfSAgW2lkPW51bGxdICAgICAgIElkZW50aWZpYW50IGRlIGxhIHJlc3NvdXJjZVxyXG4gICAgICogQHJldHVybiB7UHJvbWlzZTxCYXNlPn1cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gZ2V0UmVzb3VyY2Uobm9jYWNoZSA9IGZhbHNlLCBpZCA9IG51bGwpIHtcclxuICAgICAgICBjb25zdCB0eXBlID0gZ2V0QXBpUmVzb3VyY2UobG9jYXRpb24ucGF0aG5hbWUuc3BsaXQoJy8nKVsxXSksIC8vIEluZGlxdWUgZGUgcXVlbCB0eXBlIGRlIHJlc3NvdXJjZSBpbCBzJ2FnaXRcclxuICAgICAgICBmb25jdGlvbiA9IHR5cGUuc2luZ3VsYXIgPT09ICdzaG93JyB8fCB0eXBlLnNpbmd1bGFyID09PSAnZXBpc29kZScgPyAnZGlzcGxheScgOiAnbW92aWUnOyAvLyBJbmRpcXVlIGxhIGZvbmN0aW9uIMOgIGFwcGVsZXIgZW4gZm9uY3Rpb24gZGUgbGEgcmVzc291cmNlXHJcbiAgICAgICAgaWQgPSAoaWQgPT09IG51bGwpID8gZ2V0UmVzb3VyY2VJZCgpIDogaWQ7XHJcbiAgICAgICAgaWYgKGRlYnVnKVxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnZ2V0UmVzb3VyY2V7aWQ6ICVkLCBub2NhY2hlOiAlcywgdHlwZTogJXN9JywgaWQsICgobm9jYWNoZSkgPyAndHJ1ZScgOiAnZmFsc2UnKSwgdHlwZS5zaW5ndWxhcik7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgQmFzZV8xLkJhc2UuY2FsbEFwaSgnR0VUJywgdHlwZS5wbHVyYWwsIGZvbmN0aW9uLCB7ICdpZCc6IGlkIH0sIG5vY2FjaGUpXHJcbiAgICAgICAgICAgICAgICAudGhlbihkYXRhID0+IHtcclxuICAgICAgICAgICAgICAgIHJlc29sdmUobmV3IHR5cGUuY2xhc3MoZGF0YVt0eXBlLnNpbmd1bGFyXSkpO1xyXG4gICAgICAgICAgICB9LCBlcnIgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmVqZWN0KGVycik7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBDZXR0ZSBmb25jdGlvbiBwZXJtZXQgZGUgcsOpY3Vww6lyZXIgbGVzIGRvbm7DqWVzIEFQSSBkZSBsYSByZXNzb3VyY2UgcHJpbmNpcGFsZVxyXG4gICAgICogQHBhcmFtICB7Ym9vbGVhbn0gW25vY2FjaGU9dHJ1ZV0gIEZsYWcgaW5kaXF1YW50IHNpIGlsIGZhdXQgdXRpbGlzZXIgbGVzIGRvbm7DqWVzIGVuIGNhY2hlXHJcbiAgICAgKiBAcGFyYW0gIHtudW1iZXJ9ICBbaWQ9bnVsbF0gICAgICAgSWRlbnRpZmlhbnQgZGUgbGEgcmVzc291cmNlXHJcbiAgICAgKiBAcmV0dXJuIHtQcm9taXNlPE9iamVjdD59XHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGdldFJlc291cmNlRGF0YShub2NhY2hlID0gdHJ1ZSwgaWQgPSBudWxsKSB7XHJcbiAgICAgICAgY29uc3QgdHlwZSA9IGdldEFwaVJlc291cmNlKGxvY2F0aW9uLnBhdGhuYW1lLnNwbGl0KCcvJylbMV0pLCAvLyBJbmRpcXVlIGRlIHF1ZWwgdHlwZSBkZSByZXNzb3VyY2UgaWwgcydhZ2l0XHJcbiAgICAgICAgZm9uY3Rpb24gPSB0eXBlLnNpbmd1bGFyID09ICdzaG93JyB8fCB0eXBlLnNpbmd1bGFyID09ICdlcGlzb2RlJyA/ICdkaXNwbGF5JyA6ICdtb3ZpZSc7IC8vIEluZGlxdWUgbGEgZm9uY3Rpb24gw6AgYXBwZWxlciBlbiBmb25jdGlvbiBkZSBsYSByZXNzb3VyY2VcclxuICAgICAgICBpZCA9IChpZCA9PT0gbnVsbCkgPyBnZXRSZXNvdXJjZUlkKCkgOiBpZDtcclxuICAgICAgICBpZiAoZGVidWcpXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdnZXRSZXNvdXJjZURhdGF7aWQ6ICVkLCBub2NhY2hlOiAlcywgdHlwZTogJXN9JywgaWQsICgobm9jYWNoZSkgPyAndHJ1ZScgOiAnZmFsc2UnKSwgdHlwZS5zaW5ndWxhcik7XHJcbiAgICAgICAgcmV0dXJuIEJhc2VfMS5CYXNlLmNhbGxBcGkoJ0dFVCcsIHR5cGUucGx1cmFsLCBmb25jdGlvbiwgeyAnaWQnOiBpZCB9LCBub2NhY2hlKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogUmV0b3VybmUgbGEgcmVzc291cmNlIGFzc29jacOpZSBhdSB0eXBlIGRlIHBhZ2VcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gIHtTdHJpbmd9IHBhZ2VUeXBlICAgIExlIHR5cGUgZGUgcGFnZSBjb25zdWx0w6llXHJcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9IFJldG91cm5lIGxlIG5vbSBkZSBsYSByZXNzb3VyY2UgQVBJIGF1IHNpbmd1bGllciBldCBhdSBwbHVyaWVsXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGdldEFwaVJlc291cmNlKHBhZ2VUeXBlKSB7XHJcbiAgICAgICAgbGV0IG1ldGhvZHMgPSB7XHJcbiAgICAgICAgICAgICdzZXJpZSc6IHsgc2luZ3VsYXI6ICdzaG93JywgcGx1cmFsOiAnc2hvd3MnLCBcImNsYXNzXCI6IFNob3dfMS5TaG93IH0sXHJcbiAgICAgICAgICAgICdmaWxtJzogeyBzaW5ndWxhcjogJ21vdmllJywgcGx1cmFsOiAnbW92aWVzJywgXCJjbGFzc1wiOiBNb3ZpZV8xLk1vdmllIH0sXHJcbiAgICAgICAgICAgICdlcGlzb2RlJzogeyBzaW5ndWxhcjogJ2VwaXNvZGUnLCBwbHVyYWw6ICdlcGlzb2RlcycsIFwiY2xhc3NcIjogRXBpc29kZV8xLkVwaXNvZGUgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgaWYgKHBhZ2VUeXBlIGluIG1ldGhvZHMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG1ldGhvZHNbcGFnZVR5cGVdO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogUmV0b3VybmUgbCdpZGVudGlmaWFudCBkZSBsYSByZXNzb3VyY2UgZGUgbGEgcGFnZVxyXG4gICAgICogQHJldHVybiB7bnVtYmVyfSBMJ2lkZW50aWZpYW50IGRlIGxhIHJlc3NvdXJjZVxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBnZXRSZXNvdXJjZUlkKCkge1xyXG4gICAgICAgIGNvbnN0IHR5cGUgPSBnZXRBcGlSZXNvdXJjZSh1cmwuc3BsaXQoJy8nKVsxXSksIC8vIExlIHR5cGUgZGUgcmVzc291cmNlXHJcbiAgICAgICAgZWx0QWN0aW9ucyA9ICQoYCNyZWFjdGpzLSR7dHlwZS5zaW5ndWxhcn0tYWN0aW9uc2ApOyAvLyBMZSBub2V1ZCBjb250ZW5hbnQgbCdJRFxyXG4gICAgICAgIHJldHVybiAoZWx0QWN0aW9ucy5sZW5ndGggPT09IDEpID8gcGFyc2VJbnQoZWx0QWN0aW9ucy5kYXRhKGAke3R5cGUuc2luZ3VsYXJ9LWlkYCksIDEwKSA6IDA7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFJldG91cm5lIGxlcyBpbmZvcyBkJ3VuIG1lbWJyZVxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSAgIGlkICAgIElkZW50aWZpYW50IGR1IG1lbWJyZSAocGFyIGTDqWZhdXQ6IGxlIG1lbWJyZSBjb25uZWN0w6kpXHJcbiAgICAgKiBAcmV0dXJuIHtQcm9taXNlfSBMZSBtZW1icmVcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gZ2V0TWVtYmVyKGlkID0gbnVsbCkge1xyXG4gICAgICAgIC8vIE9uIHbDqXJpZmllIHF1ZSBsJ3V0aWxpc2F0ZXVyIGVzdCBjb25uZWN0w6kgZXQgcXVlIGxhIGNsw6kgZCdBUEkgZXN0IHJlbnNlaWduw6llXHJcbiAgICAgICAgaWYgKCF1c2VySWRlbnRpZmllZCgpIHx8IGJldGFzZXJpZXNfYXBpX3VzZXJfa2V5ID09PSAnJylcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIGxldCBhcmdzID0ge307XHJcbiAgICAgICAgaWYgKGlkKVxyXG4gICAgICAgICAgICBhcmdzLmlkID0gaWQ7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XHJcbiAgICAgICAgICAgIEJhc2VfMS5CYXNlLmNhbGxBcGkoJ0dFVCcsICdtZW1iZXJzJywgJ2luZm9zJywgYXJncylcclxuICAgICAgICAgICAgICAgIC50aGVuKGRhdGEgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy8gT24gcmV0b3VybmUgbGVzIGluZm9zIGR1IG1lbWJyZVxyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShkYXRhLm1lbWJlcik7XHJcbiAgICAgICAgICAgIH0sIChlcnIpID0+IHtcclxuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbignRXJyZXVyIGRlIHLDqWN1cMOpcmF0aW9uIGRcXCd1biBtZW1icmUnLCAnZ2V0TWVtYmVyOiAnICsgZXJyKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIENvbXBhcmUgbGUgbWVtYnJlIGNvdXJhbnQgYXZlYyB1biBhdXRyZSBtZW1icmVcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gY29tcGFyZU1lbWJlcnMoKSB7XHJcbiAgICAgICAgbGV0IGlkID0gcGFyc2VJbnQoJCgnI3RlbXBzJykuZGF0YSgnbG9naW5pZCcpLCAxMCk7XHJcbiAgICAgICAgZ2V0TWVtYmVyKGlkKS5cclxuICAgICAgICAgICAgdGhlbihmdW5jdGlvbiAobWVtYmVyKSB7XHJcbiAgICAgICAgICAgIGxldCBvdGhlck1lbWJlciA9IG1lbWJlcjtcclxuICAgICAgICAgICAgY29uc3QgZGlhbG9nSFRNTCA9IGBcclxuICAgICAgICAgICAgICAgIDxkaXZcclxuICAgICAgICAgICAgICAgICAgY2xhc3M9XCJkaWFsb2cgZGlhbG9nLWNvbnRhaW5lciB0YWJsZS1kYXJrXCJcclxuICAgICAgICAgICAgICAgICAgaWQ9XCJkaWFsb2ctY29tcGFyZVwiXHJcbiAgICAgICAgICAgICAgICAgIGFyaWEtaGlkZGVuPVwidHJ1ZVwiXHJcbiAgICAgICAgICAgICAgICAgIGFyaWEtbGFiZWxsZWRieT1cImRpYWxvZy1jb21wYXJlLXRpdGxlXCJcclxuICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRpYWxvZy1vdmVybGF5XCIgZGF0YS1hMTF5LWRpYWxvZy1oaWRlPjwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGlhbG9nLWNvbnRlbnRcIiByb2xlPVwiZG9jdW1lbnRcIj5cclxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXHJcbiAgICAgICAgICAgICAgICAgICAgICBkYXRhLWExMXktZGlhbG9nLWhpZGVcclxuICAgICAgICAgICAgICAgICAgICAgIGNsYXNzPVwiZGlhbG9nLWNsb3NlXCJcclxuICAgICAgICAgICAgICAgICAgICAgIGFyaWEtbGFiZWw9XCJGZXJtZXIgY2V0dGUgYm/DrnRlIGRlIGRpYWxvZ3VlXCJcclxuICAgICAgICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8aSBjbGFzcz1cImZhIGZhLXRpbWVzXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+PC9pPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxyXG5cclxuICAgICAgICAgICAgICAgICAgICA8aDEgaWQ9XCJkaWFsb2ctY29tcGFyZS10aXRsZVwiPkNvbXBhcmFpc29uIGRlcyBtZW1icmVzPC9oMT5cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBpZD1cImNvbXBhcmVcIiBjbGFzcz1cInRhYmxlLXJlc3BvbnNpdmUtbGdcIj5cclxuICAgICAgICAgICAgICAgICAgICAgIDx0YWJsZSBjbGFzcz1cInRhYmxlIHRhYmxlLWRhcmsgdGFibGUtc3RyaXBlZFwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8dGhlYWQ+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHRyPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRoIHNjb3BlPVwiY29sXCIgY2xhc3M9XCJjb2wtbGctNVwiPkluZm9zPC90aD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aCBzY29wZT1cImNvbFwiIGNsYXNzPVwiY29sLWxnLTNcIj5Wb3VzPC90aD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aCBzY29wZT1cImNvbFwiIGNsYXNzPVwib3RoZXItdXNlciBjb2wtbGctM1wiPjwvdGg+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC90cj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC90aGVhZD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHRib2R5PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L3Rib2R5PlxyXG4gICAgICAgICAgICAgICAgICAgICAgPC90YWJsZT5cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5gLCB0cmFkcyA9IHtcclxuICAgICAgICAgICAgICAgIFwiaWRcIjogJ0lEJyxcclxuICAgICAgICAgICAgICAgIFwibG9naW5cIjogXCJMb2dpblwiLFxyXG4gICAgICAgICAgICAgICAgXCJ4cFwiOiAnUHRzIGRcXCdleHDDqXJpZW5jZScsXHJcbiAgICAgICAgICAgICAgICBcInN1YnNjcmlwdGlvblwiOiAnQW5uw6llIGRcXCdpbnNjcmlwdGlvbicsXHJcbiAgICAgICAgICAgICAgICBzdGF0czoge1xyXG4gICAgICAgICAgICAgICAgICAgIFwiZnJpZW5kc1wiOiAnQW1pcycsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJzaG93c1wiOiAnU8OpcmllcycsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJzZWFzb25zXCI6ICdTYWlzb25zJyxcclxuICAgICAgICAgICAgICAgICAgICBcImVwaXNvZGVzXCI6ICdFcGlzb2RlcycsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJjb21tZW50c1wiOiAnQ29tbWVudGFpcmVzJyxcclxuICAgICAgICAgICAgICAgICAgICBcInByb2dyZXNzXCI6ICdQcm9ncmVzc2lvbiBkZSB2aXNpb25uYWdlJyxcclxuICAgICAgICAgICAgICAgICAgICBcImVwaXNvZGVzX3RvX3dhdGNoXCI6ICdOYiBkXFwnw6lwaXNvZGVzIMOgIHJlZ2FyZGVyJyxcclxuICAgICAgICAgICAgICAgICAgICBcInRpbWVfb25fdHZcIjogJ1RlbXBzIGRldmFudCBsYSBUVicsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJ0aW1lX3RvX3NwZW5kXCI6ICdUZW1wcyByZXN0YW50IGRldmFudCBkZXMgc8OpcmllcyDDoCByZWdhcmRlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJtb3ZpZXNcIjogJ05iIGRlIGZpbG1zJyxcclxuICAgICAgICAgICAgICAgICAgICBcImJhZGdlc1wiOiAnTmIgZGUgYmFkZ2VzJyxcclxuICAgICAgICAgICAgICAgICAgICBcIm1lbWJlcl9zaW5jZV9kYXlzXCI6ICdNZW1icmUgZGVwdWlzIChqb3VycyknLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiZnJpZW5kc19vZl9mcmllbmRzXCI6ICdMZXMgYW1pcyBkdSByw6lzZWF1IMOpdGVuZHUnLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiZXBpc29kZXNfcGVyX21vbnRoXCI6ICdOYiBkXFwnw6lwaXNvZGVzIHBhciBtb2lzJyxcclxuICAgICAgICAgICAgICAgICAgICBcImZhdm9yaXRlX2RheVwiOiAnSm91ciBmYXZvcmknLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiZml2ZV9zdGFyc19wZXJjZW50XCI6ICclIGRlIHZvdGVzIDUgw6l0b2lsZXMnLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiZm91ci1maXZlX3N0YXJzX3RvdGFsXCI6ICdOYiBkZSB2b3RlcyA0IG91IDUgw6l0b2lsZXMnLFxyXG4gICAgICAgICAgICAgICAgICAgIFwic3RyZWFrX2RheXNcIjogJ05iIGRlIGpvdXJzIGNvbnPDqWN1dGlmcyDDoCByZWdhcmRlciBkZXMgw6lwaXNvZGVzJyxcclxuICAgICAgICAgICAgICAgICAgICBcImZhdm9yaXRlX2dlbnJlXCI6ICdHZW5yZSBmYXZvcmknLFxyXG4gICAgICAgICAgICAgICAgICAgIFwid3JpdHRlbl93b3Jkc1wiOiAnTmIgZGUgbW90cyDDqWNyaXRzIHN1ciBCZXRhU2VyaWVzJyxcclxuICAgICAgICAgICAgICAgICAgICBcIndpdGhvdXRfZGF5c1wiOiAnTmIgam91cnMgZFxcJ2Fic3RpbmVuY2UnLFxyXG4gICAgICAgICAgICAgICAgICAgIFwic2hvd3NfZmluaXNoZWRcIjogJ05iIGRlIHPDqXJpZXMgdGVybWluw6llcycsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJzaG93c19jdXJyZW50XCI6ICdOYiBkZSBzw6lyaWVzIGVuIGNvdXJzJyxcclxuICAgICAgICAgICAgICAgICAgICBcInNob3dzX3RvX3dhdGNoXCI6ICdOYiBkZSBzw6lyaWVzIMOgIHZvaXInLFxyXG4gICAgICAgICAgICAgICAgICAgIFwic2hvd3NfYWJhbmRvbmVkXCI6ICdOYiBkZSBzw6lyaWVzIGFiYW5kb25uw6llcycsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJtb3ZpZXNfdG9fd2F0Y2hcIjogJ05iIGRlIGZpbG1zIMOgIHZvaXInLFxyXG4gICAgICAgICAgICAgICAgICAgIFwidGltZV9vbl9tb3ZpZXNcIjogJ1RlbXBzIGRldmFudCBsZXMgZmlsbXMnLFxyXG4gICAgICAgICAgICAgICAgICAgIFwidGltZV90b19zcGVuZF9tb3ZpZXNcIjogJ1RlbXBzIHJlc3RhbnQgZGV2YW50IGxlcyBmaWxtcyDDoCByZWdhcmRlcidcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgYWRkU2NyaXB0QW5kTGluaygndGFibGVjc3MnKTtcclxuICAgICAgICAgICAgJCgnYm9keScpLmFwcGVuZChkaWFsb2dIVE1MKTtcclxuICAgICAgICAgICAgLy9pZiAoZGVidWcpIGNvbnNvbGUubG9nKGN1cnJlbnRVc2VyLCBvdGhlck1lbWJlciwgdHJhZHMpO1xyXG4gICAgICAgICAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyh0cmFkcykpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IFtzdWJrZXksIHN1YnZhbHVlXSBvZiBPYmplY3QuZW50cmllcyh0cmFkc1trZXldKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoL3RpbWUvLnRlc3Qoc3Via2V5KSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudFVzZXJba2V5XVtzdWJrZXldID0gaHVtYW5pemVEdXJhdGlvbigoY3VycmVudFVzZXJba2V5XVtzdWJrZXldICogNjAgKiAxMDAwKSwgeyBsYW5ndWFnZTogY3VycmVudFVzZXIubG9jYWxlIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3RoZXJNZW1iZXJba2V5XVtzdWJrZXldID0gaHVtYW5pemVEdXJhdGlvbigob3RoZXJNZW1iZXJba2V5XVtzdWJrZXldICogNjAgKiAxMDAwKSwgeyBsYW5ndWFnZTogY3VycmVudFVzZXIubG9jYWxlIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJyNkaWFsb2ctY29tcGFyZSB0YWJsZSB0Ym9keScpLmFwcGVuZCgnPHRyPjx0ZD4nICsgc3VidmFsdWUgKyAnPC90ZD48dGQ+JyArIGN1cnJlbnRVc2VyW2tleV1bc3Via2V5XSArICc8L3RkPjx0ZD4nICsgb3RoZXJNZW1iZXJba2V5XVtzdWJrZXldICsgJzwvdGQ+PC90cj4nKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAkKCcjZGlhbG9nLWNvbXBhcmUgdGFibGUgdGJvZHknKS5hcHBlbmQoJzx0cj48dGQ+JyArIHZhbHVlICsgJzwvdGQ+PHRkPicgKyBjdXJyZW50VXNlcltrZXldICsgJzwvdGQ+PHRkPicgKyBvdGhlck1lbWJlcltrZXldICsgJzwvdGQ+PC90cj4nKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAkKCcub3RoZXItdXNlcicpLmFwcGVuZChvdGhlck1lbWJlci5sb2dpbik7XHJcbiAgICAgICAgICAgIGNvbnN0IGRpYWxvZyA9IG5ldyBBMTF5RGlhbG9nKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNkaWFsb2ctY29tcGFyZScpKSwgaHRtbCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcclxuICAgICAgICAgICAgJCgnI3N0YXRzX2NvbnRhaW5lciBoMScpXHJcbiAgICAgICAgICAgICAgICAuY3NzKCdkaXNwbGF5JywgJ2lubGluZS1ibG9jaycpXHJcbiAgICAgICAgICAgICAgICAuYWZ0ZXIoJzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnV0dG9uIGJsdWVcIiBkYXRhLWExMXktZGlhbG9nLXNob3c9XCJkaWFsb2ctY29tcGFyZVwiPlNlIGNvbXBhcmVyIMOgIGNlIG1lbWJyZTwvYnV0dG9uPicpO1xyXG4gICAgICAgICAgICAkKCdidXR0b24uYnV0dG9uLmJsdWUnKS5jbGljayhmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgIGRpYWxvZy5zaG93KCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBkaWFsb2dcclxuICAgICAgICAgICAgICAgIC5vbignc2hvdycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGh0bWwuc3R5bGUub3ZlcmZsb3dZID0gJ2hpZGRlbic7XHJcbiAgICAgICAgICAgICAgICAkKCcjZGlhbG9nLWNvbXBhcmUnKS5jc3MoJ3otaW5kZXgnLCAnMTAwNScpLmNzcygnb3ZlcmZsb3cnLCAnc2Nyb2xsJyk7XHJcbiAgICAgICAgICAgICAgICAkKCcuZGlhbG9nLWNsb3NlJykuY2xpY2soZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgICAgICBkaWFsb2cuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAub24oJ2hpZGUnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBodG1sLnN0eWxlLm92ZXJmbG93WSA9ICcnO1xyXG4gICAgICAgICAgICAgICAgJCgnI2RpYWxvZy1jb21wYXJlJykuY3NzKCd6LWluZGV4JywgJzAnKS5jc3MoJ292ZXJmbG93JywgJ25vbmUnKTtcclxuICAgICAgICAgICAgICAgICQoJy5kaWFsb2ctY2xvc2UnKS5vZmYoJ2NsaWNrJyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBBam91dGUgdW4gY2hhbXAgZGUgcmVjaGVyY2hlIHN1ciBsYSBwYWdlIGRlcyBhbWlzIGQndW4gbWVtYnJlXHJcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBzZWFyY2hGcmllbmRzKCkge1xyXG4gICAgICAgIC8vIEFqb3V0ZXIgdW4gY2hhbXAgZGUgcmVjaGVyY2hlXHJcbiAgICAgICAgJCgnLm1haW5jb250ZW50IGgxJykuYXBwZW5kKCc8aW5wdXQgaWQ9XCJzZWFyY2hGcmllbmRzXCIgcGxhY2Vob2xkZXI9XCJSZWNoZXJjaGUgZFxcJ2FtaXNcIiBsaXN0PVwiZnJpZW5kc2RhdGFcIiBhdXRvY29tcGxldGU9XCJvZmZcIi8+JyArXHJcbiAgICAgICAgICAgICc8aSBjbGFzcz1cImZhIGZhLXRpbWVzIGNsZWFyU2VhcmNoXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCIgc3R5bGU9XCJkaXNwbGF5Om5vbmU7XCIgdGl0bGU9XCJFZmZhY2VyIGxhIHJlY2hlcmNoZVwiPjwvaT4nKTtcclxuICAgICAgICAvLyBSZWN1cGVyZXIgbGVzIGlkZW50aWZpYW50cyBldCBsaWVucyBkZXMgbWVtYnJlc1xyXG4gICAgICAgIGxldCAkbGlua3MgPSAkKCcudGltZWxpbmUtaXRlbSAuaW5mb3MgYScpLCBvYmpGcmllbmRzID0ge30sIGlkRnJpZW5kcyA9IFtdLCBkYXRhbGlzdCA9ICc8ZGF0YWxpc3QgaWQ9XCJmcmllbmRzZGF0YVwiPic7XHJcbiAgICAgICAgLy8gT24gcmVjdXBlcmUgbGVzIGluZm9zIGRlcyBhbWlzXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCAkbGlua3MubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IGVsdCA9ICQoJGxpbmtzLmdldChpKSksIHRleHQgPSBlbHQudGV4dCgpLnRyaW0oKTtcclxuICAgICAgICAgICAgb2JqRnJpZW5kc1t0ZXh0LnRvTG93ZXJDYXNlKCldID0geyBsaW5rOiBlbHQuYXR0cignaHJlZicpLCBuYW1lOiB0ZXh0IH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIE9uIHN0b2NrZSBsZXMgaWRlbnRpZmlhbnRzIGRhbnMgdW4gdGFibGVhdSBxdWUgbCdvbiB0cmlcclxuICAgICAgICBpZEZyaWVuZHMgPSBPYmplY3Qua2V5cyhvYmpGcmllbmRzKTtcclxuICAgICAgICBpZEZyaWVuZHMuc29ydCgpO1xyXG4gICAgICAgIC8vIE9uIGJ1aWxkIGxhIGxpc3RlIGRlcyBhbWlzIHBvdXIgYWxpbWVudGVyIGxlIGNoYW1wIGRlIHJlY2hlcmNoZVxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaWRGcmllbmRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGRhdGFsaXN0ICs9ICc8b3B0aW9uIHZhbHVlPVwiJyArIG9iakZyaWVuZHNbaWRGcmllbmRzW2ldXS5uYW1lICsgJ1wiLz4nO1xyXG4gICAgICAgIH1cclxuICAgICAgICAkKCcubWFpbmNvbnRlbnQnKS5hcHBlbmQoZGF0YWxpc3QgKyAnPC9kYXRhbGlzdD4nKTtcclxuICAgICAgICAvLyBPbiBhZmZpY2hlIHRvdXRlIGxhIGxpc3RlIGRlcyBhbWlzXHJcbiAgICAgICAgdmlld01vcmVGcmllbmRzKCk7XHJcbiAgICAgICAgY29uc3QgJGlucFNlYXJjaEZyaWVuZHMgPSAkKCcjc2VhcmNoRnJpZW5kcycpO1xyXG4gICAgICAgICRpbnBTZWFyY2hGcmllbmRzLm9uKCdrZXlwcmVzcycsICgpID0+IHtcclxuICAgICAgICAgICAgaWYgKCRpbnBTZWFyY2hGcmllbmRzLnZhbCgpLnRvU3RyaW5nKCkudHJpbSgpLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICQoJy5jbGVhclNlYXJjaCcpLnNob3coKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICRpbnBTZWFyY2hGcmllbmRzLm9uKCdpbnB1dCcsICgpID0+IHtcclxuICAgICAgICAgICAgbGV0IHZhbCA9ICRpbnBTZWFyY2hGcmllbmRzLnZhbCgpLnRvU3RyaW5nKCkudHJpbSgpLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgICAgIGlmIChkZWJ1ZylcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdTZWFyY2ggRnJpZW5kczogJyArIHZhbCwgaWRGcmllbmRzLmluZGV4T2YodmFsKSwgb2JqRnJpZW5kc1t2YWxdKTtcclxuICAgICAgICAgICAgaWYgKHZhbCA9PT0gJycgfHwgaWRGcmllbmRzLmluZGV4T2YodmFsKSA9PT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICQoJy50aW1lbGluZS1pdGVtJykuc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHZhbCA9PT0gJycpIHtcclxuICAgICAgICAgICAgICAgICAgICAkKCcuY2xlYXJTZWFyY2gnKS5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgJCgnLmNsZWFyU2VhcmNoJykuc2hvdygpO1xyXG4gICAgICAgICAgICAkKCcudGltZWxpbmUtaXRlbScpLmhpZGUoKTtcclxuICAgICAgICAgICAgaWYgKGRlYnVnKVxyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0l0ZW06ICcsICQoJy50aW1lbGluZS1pdGVtIC5pbmZvcyBhW2hyZWY9XCInICsgb2JqRnJpZW5kc1t2YWxdLmxpbmsgKyAnXCJdJykpO1xyXG4gICAgICAgICAgICAkKCcudGltZWxpbmUtaXRlbSAuaW5mb3MgYVtocmVmPVwiJyArIG9iakZyaWVuZHNbdmFsXS5saW5rICsgJ1wiXScpLnBhcmVudHMoJy50aW1lbGluZS1pdGVtJykuc2hvdygpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoJy5jbGVhclNlYXJjaCcpLmNsaWNrKCgpID0+IHtcclxuICAgICAgICAgICAgJCgnI3NlYXJjaEZyaWVuZHMnKS52YWwoJycpO1xyXG4gICAgICAgICAgICAkKCcudGltZWxpbmUtaXRlbScpLnNob3coKTtcclxuICAgICAgICAgICAgJCgnLmNsZWFyU2VhcmNoJykuaGlkZSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBNYXNxdWUgbGVzIHB1YnNcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gcmVtb3ZlQWRzKCkge1xyXG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAkKCdzY3JpcHRbc3JjKj1cInNlY3VyZXB1YmFkc1wiXScpLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAkKCdzY3JpcHRbc3JjKj1cInN0YXRpYy1vZC5jb21cIl0nKS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgJCgnc2NyaXB0W3NyYyo9XCJhZC5kb3VibGVjbGljay5uZXRcIl0nKS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgJCgnc2NyaXB0W3NyYyo9XCJzZGRhbi5jb21cIl0nKS5yZW1vdmUoKTtcclxuICAgICAgICB9LCA1MDApO1xyXG4gICAgICAgICQoJy5wYXJlbnQtYWQtZGVza3RvcCcpLmF0dHIoJ3N0eWxlJywgJ2Rpc3BsYXk6IG5vbmUgIWltcG9ydGFudCcpO1xyXG4gICAgICAgIHNldEludGVydmFsKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgbGV0ICRmcmFtZTtcclxuICAgICAgICAgICAgJCgnaWZyYW1lW25hbWUhPVwidXNlcnNjcmlwdFwiXScpLmVhY2goKGksIGVsdCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgJGZyYW1lID0gJChlbHQpO1xyXG4gICAgICAgICAgICAgICAgaWYgKCEkZnJhbWUuaGFzQ2xhc3MoJ2VtYmVkLXJlc3BvbnNpdmUtaXRlbScpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJGZyYW1lLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9LCAxMDAwKTtcclxuICAgICAgICAkKCcuYmxvY2tQYXJ0bmVyJykuYXR0cignc3R5bGUnLCAnZGlzcGxheTogbm9uZSAhaW1wb3J0YW50Jyk7XHJcbiAgICAgICAgLy8kKCcuYnJlYWRjcnVtYicpLmhpZGUoKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogQW3DqWxpb3JlIGwnYWZmaWNoYWdlIGRlIGxhIGRlc2NyaXB0aW9uIGRlIGxhIHJlc3NvdXJjZVxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm4ge3ZvaWR9XHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIHVwZ3JhZGVTeW5vcHNpcygpIHtcclxuICAgICAgICBsZXQgJHNwYW4gPSAkKCcuYmxvY2tJbmZvcm1hdGlvbnNfX3N5bm9wc2lzIHNwYW4nKSwgJGJ0bk1vcmUgPSAkKCdhLmpzLXNob3ctZnVsbHRleHQnKTtcclxuICAgICAgICBpZiAoJGJ0bk1vcmUubGVuZ3RoIDw9IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBPbiBham91dGUgbGUgYm91dG9uIE1vaW5zIGV0IHNvbiBldmVudCBjbGlja1xyXG4gICAgICAgICRzcGFuLmFwcGVuZCgnPGJ1dHRvbiByb2xlPVwiYnV0dG9uXCIgY2xhc3M9XCJ1LWNvbG9yV2hpdGVPcGFjaXR5MDUganMtc2hvdy10cnVuY2F0ZXRleHQgdGV4dFRyYW5zZm9ybVVwcGVyQ2FzZSBjdXJzb3JQb2ludGVyXCI+PC9idXR0b24+Jyk7XHJcbiAgICAgICAgY29uc3QgJGJ0bkxlc3MgPSAkKCdidXR0b24uanMtc2hvdy10cnVuY2F0ZXRleHQnKTtcclxuICAgICAgICAkYnRuTGVzcy5jbGljaygoZSkgPT4ge1xyXG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIGlmICgkc3Bhbi5oYXNDbGFzcygnc3Itb25seScpKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAvLyBUb2dnbGUgZGlzcGxheSBzeW5vcHNpc1xyXG4gICAgICAgICAgICAkYnRuTW9yZS5zaG93KCk7XHJcbiAgICAgICAgICAgICRzcGFuLmFkZENsYXNzKCdzci1vbmx5Jyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgLy8gT24gcmVtcGxhY2UgbGUgbGllbiBQbHVzIHBhciB1biBib3V0b25cclxuICAgICAgICAkYnRuTW9yZS5yZXBsYWNlV2l0aCgnPGJ1dHRvbiByb2xlPVwiYnV0dG9uXCIgY2xhc3M9XCJ1LWNvbG9yV2hpdGVPcGFjaXR5MDUganMtc2hvdy1mdWxsdGV4dCB0ZXh0VHJhbnNmb3JtVXBwZXJDYXNlIGN1cnNvclBvaW50ZXJcIj48L2J1dHRvbj4nKTtcclxuICAgICAgICAkYnRuTW9yZSA9ICQoJ2J1dHRvbi5qcy1zaG93LWZ1bGx0ZXh0Jyk7XHJcbiAgICAgICAgJGJ0bk1vcmUub24oJ2NsaWNrJywgKGUpID0+IHtcclxuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICBpZiAoISRzcGFuLmhhc0NsYXNzKCdzci1vbmx5JykpXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICRidG5Nb3JlLmhpZGUoKTtcclxuICAgICAgICAgICAgJHNwYW4ucmVtb3ZlQ2xhc3MoJ3NyLW9ubHknKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogUGF0aWVudGUgbGUgdGVtcHMgZHUgY2hhcmdtZW50IGRlcyBzYWlzb25zIGV0IGRlcyDDqXBpc29kZXNcclxuICAgICAqIEBwYXJhbSAge0Z1bmN0aW9ufSBjYiBGb25jdGlvbiBkZSBjYWxsYmFjayBlbiBjYXMgZGUgc3VjY2Vzc1xyXG4gICAgICogQHBhcmFtICB7RnVuY3Rpb259IGNiIEZvbmN0aW9uIGRlIGNhbGxiYWNrIGVuIGNhcyBkJ2Vycm9yXHJcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiB3YWl0U2Vhc29uc0FuZEVwaXNvZGVzTG9hZGVkKHN1Y2Nlc3NDYiwgZXJyb3JDYiA9IEJhc2VfMS5CYXNlLm5vb3ApIHtcclxuICAgICAgICBsZXQgd2FpdEVwaXNvZGVzID0gMDtcclxuICAgICAgICAvLyBPbiBham91dGUgdW4gdGltZXIgaW50ZXJ2YWwgZW4gYXR0ZW5kYW50IHF1ZSBsZXMgc2Fpc29ucyBldCBsZXMgw6lwaXNvZGVzIHNvaWVudCBjaGFyZ8Opc1xyXG4gICAgICAgIHRpbWVyID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAvLyBPbiDDqXZpdGUgdW5lIGJvdWNsZSBpbmZpbmllXHJcbiAgICAgICAgICAgIGlmICgrK3dhaXRFcGlzb2RlcyA+PSAxMDApIHtcclxuICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodGltZXIpO1xyXG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uKCdXYWl0IEVwaXNvZGVzIExpc3QnLCAnTGVzIHZpZ25ldHRlcyBkZXMgc2Fpc29ucyBldCBkZXMgw6lwaXNvZGVzIG5cXCdvbnQgcGFzIMOpdMOpIHRyb3V2w6llcy4nKTtcclxuICAgICAgICAgICAgICAgIGVycm9yQ2IoJ3RpbWVvdXQnKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBsZXQgbGVuID0gcGFyc2VJbnQoJCgnI3NlYXNvbnMgLnNsaWRlLS1jdXJyZW50IC5zbGlkZV9faW5mb3MnKS50ZXh0KCksIDEwKSwgJGVwaXNvZGVzID0gJCgnI2VwaXNvZGVzIC5zbGlkZV9mbGV4Jyk7XHJcbiAgICAgICAgICAgIC8vIE9uIHbDqXJpZmllIHF1ZSBsZXMgc2Fpc29ucyBldCBsZXMgZXBpc29kZXMgc29pZW50IGNoYXJnw6lzIHN1ciBsYSBwYWdlXHJcbiAgICAgICAgICAgIGlmICgkZXBpc29kZXMubGVuZ3RoIDw9IDAgfHwgJGVwaXNvZGVzLmxlbmd0aCA8IGxlbikge1xyXG4gICAgICAgICAgICAgICAgaWYgKGRlYnVnKVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCd3YWl0U2Vhc29uc0FuZEVwaXNvZGVzTG9hZGVkOiBFbiBhdHRlbnRlIGR1IGNoYXJnZW1lbnQgZGVzIHZpZ25ldHRlcycpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChkZWJ1ZylcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCd3YWl0U2Vhc29uc0FuZEVwaXNvZGVzTG9hZGVkLCBuYlZpZ25ldHRlcyAoJWQsICVkKScsICRlcGlzb2Rlcy5sZW5ndGgsIGxlbik7XHJcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodGltZXIpO1xyXG4gICAgICAgICAgICBzdWNjZXNzQ2IoKTtcclxuICAgICAgICB9LCA1MDApO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBHw6hyZSBsYSBtaXNlIMOgIGpvdXIgYXV0byBkZXMgw6lwaXNvZGVzIGRlIGxhIHNhaXNvbiBjb3VyYW50ZVxyXG4gICAgICogQHBhcmFtICB7U2hvd30gc2hvdyBMJ29iamV0IGRlIHR5cGUgU2hvd1xyXG4gICAgICogQHJldHVybiB7dm9pZH1cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gdXBkYXRlQXV0b0VwaXNvZGVMaXN0KHNob3cpIHtcclxuICAgICAgICBsZXQgb2JqVXBBdXRvID0gVXBkYXRlQXV0b18xLlVwZGF0ZUF1dG8uZ2V0SW5zdGFuY2Uoc2hvdyk7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRm9uY3Rpb24gcmV0b3VybmFudCBsZSBjb250ZW51IGRlIGxhIFBvcHVwIGRlcyBvcHRpb25zIHVwZGF0ZVxyXG4gICAgICAgICAqIGRlIGxhIGxpc3RlIGRlcyDDqXBpc29kZXNcclxuICAgICAgICAgKiBAcmV0dXJuIHtTdHJpbmd9IENvbnRlbnUgSFRNTCBkZSBsYSBQb3BVcCBkZXMgb3B0aW9ucyB1cGRhdGVcclxuICAgICAgICAgKi9cclxuICAgICAgICBjb25zdCBjb250ZW50VXAgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGludGVydmFscyA9IFVwZGF0ZUF1dG9fMS5VcGRhdGVBdXRvLmludGVydmFscztcclxuICAgICAgICAgICAgbGV0IGNvbnRlbnRVcGRhdGUgPSBgXHJcbiAgICAgICAgICAgICAgICAgICAgPHN0eWxlPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuYWxlcnQge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiAwLjc1cmVtIDEuMjVyZW07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbWFyZ2luLWJvdHRvbTogMXJlbTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBib3JkZXI6IDFweCBzb2xpZCB0cmFuc3BhcmVudDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBib3JkZXItcmFkaXVzOiAwLjI1cmVtO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hbGVydC1pbmZvIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xvcjogIzBjNTQ2MDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZDFlY2YxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlci1jb2xvcjogI2JlZTVlYjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuYWxlcnQtd2FybmluZyB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6ICM4NTY0MDQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogI2ZmZjNjZDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBib3JkZXItY29sb3I6ICNmZmVlYmE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICA8L3N0eWxlPlxyXG4gICAgICAgICAgICAgICAgICAgIDxmb3JtIGlkPVwib3B0aW9uc1VwZGF0ZUVwaXNvZGVMaXN0XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZm9ybS1ncm91cCBmb3JtLWNoZWNrXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJmb3JtLWNoZWNrLWlucHV0XCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkPVwidXBkYXRlRXBpc29kZUxpc3RBdXRvXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICR7b2JqVXBBdXRvLmF1dG8gPyAnIGNoZWNrZWQ9XCJ0cnVlXCInIDogJyd9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkeyFzaG93LmluX2FjY291bnQgPyAnIGRpc2FibGVkPVwidHJ1ZVwiJyA6ICcnfT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzPVwiZm9ybS1jaGVjay1sYWJlbFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3I9XCJ1cGRhdGVFcGlzb2RlTGlzdEF1dG9cIj5BY3RpdmVyIGxhIG1pc2Ugw6Agam91ciBhdXRvIGRlcyDDqXBpc29kZXM8L2xhYmVsPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZm9ybS1ncm91cFwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8bGFiZWwgZm9yPVwidXBkYXRlRXBpc29kZUxpc3RUaW1lXCI+RnLDqXF1ZW5jZSBkZSBtaXNlIMOgIGpvdXI8L2xhYmVsPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8c2VsZWN0IGNsYXNzPVwiZm9ybS1jb250cm9sXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZD1cInVwZGF0ZUVwaXNvZGVMaXN0VGltZVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHshc2hvdy5pbl9hY2NvdW50ID8gJyBkaXNhYmxlZD1cInRydWVcIicgOiAnJ30+YDtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbnRlcnZhbHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGNvbnRlbnRVcGRhdGUgKz0gYDxvcHRpb24gdmFsdWU9XCIke2ludGVydmFsc1tpXS52YWx9XCJcclxuICAgICAgICAgICAgICAgICAgICAke29ialVwQXV0by5pbnRlcnZhbCA9PT0gaW50ZXJ2YWxzW2ldLnZhbCA/ICdzZWxlY3RlZD1cInRydWVcIicgOiAnJ30+XHJcbiAgICAgICAgICAgICAgICAgICAgJHtpbnRlcnZhbHNbaV0ubGFiZWx9PC9vcHRpb24+YDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb250ZW50VXBkYXRlICs9IGA8L3NlbGVjdD48L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAkeyFzaG93LmluX2FjY291bnQgPyAnPGRpdiBjbGFzcz1cImZvcm0tZ3JvdXBcIj48cCBjbGFzcz1cImFsZXJ0IGFsZXJ0LXdhcm5pbmdcIj5WZXVpbGxleiBham91dGVyIGxhIHPDqXJpZSBhdmFudCBkZSBwb3V2b2lyIGFjdGl2ZXIgY2V0dGUgZm9uY3Rpb25uYWxpdMOpLjwvcD48L2Rpdj4nIDogJyd9XHJcbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwic3VibWl0XCIgY2xhc3M9XCJidG4gYnRuLXByaW1hcnlcIiR7IXNob3cuaW5fYWNjb3VudCA/ICcgZGlzYWJsZWQ9XCJ0cnVlXCInIDogJyd9PlNhdXZlcjwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiY2xvc2UgYnRuIGJ0bi1kYW5nZXJcIj5Bbm51bGVyPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICA8L2Zvcm0+YDtcclxuICAgICAgICAgICAgcmV0dXJuIGNvbnRlbnRVcGRhdGU7XHJcbiAgICAgICAgfTtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBGb25jdGlvbiByZXRvdXJuYW50IGxlIHRpdHJlIGRlIGxhIFBvcHVwIGRlcyBvcHRpb25zIHBvdXIgbCd1cGRhdGVcclxuICAgICAgICAgKiBkZSBsYSBsaXN0ZSBkZXMgw6lwaXNvZGVzIGRlIGxhIHNhaXNvbiBjb3VyYW50ZVxyXG4gICAgICAgICAqIEBwYXJhbSAge1VwZGF0ZUF1dG99IG9ialVwQXV0b1xyXG4gICAgICAgICAqIEByZXR1cm4ge1N0cmluZ30gQ29udGVudSBIVE1MIGR1IHRpdHJlIGRlIGxhIFBvcFVwIGRlcyBvcHRpb25zIHVwZGF0ZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGNvbnN0IHRpdGxlUG9wdXAgPSBmdW5jdGlvbiAob2JqVXBBdXRvKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGNsYXNzTmFtZSA9IChvYmpVcEF1dG8gJiYgb2JqVXBBdXRvLnN0YXR1cykgPyAnc3VjY2VzcycgOiAnc2Vjb25kYXJ5JywgbGFiZWwgPSAob2JqVXBBdXRvICYmIG9ialVwQXV0by5zdGF0dXMpID8gJ3J1bm5pbmcnIDogJ25vdCBydW5uaW5nJywgaGVscCA9IFwiQ2V0dGUgZm9uY3Rpb25uYWxpdMOpIHBlcm1ldCBkZSBtZXR0cmUgw6Agam91ciBsZXMgw6lwaXNvZGVzIGRlIGxhIHNhaXNvbiBjb3VyYW50ZSwgw6AgdW5lIGZyw6lxdWVuY2UgY2hvaXNpZS5cIjtcclxuICAgICAgICAgICAgcmV0dXJuIGA8c3R5bGU+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5vcHRpb25zVXBBdXRvIC5jbG9zZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByaWdodDogNXB4O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyOiBub25lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogdHJhbnNwYXJlbnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb250LXNpemU6IDEuNWVtO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9wOiAwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5vcHRpb25zVXBBdXRvIC5jbG9zZTpob3ZlciB7Ym9yZGVyOiBub25lO291dGxpbmU6IG5vbmU7fVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAub3B0aW9uc1VwQXV0byAuY2xvc2U6Zm9jdXMge2JvcmRlcjogbm9uZTtvdXRsaW5lOiBub25lO31cclxuICAgICAgICAgICAgICAgICAgICA8L3N0eWxlPlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJvcHRpb25zVXBBdXRvXCIgc3R5bGU9XCJjb2xvcjojMDAwO1wiPk9wdGlvbnMgZGUgbWlzZSDDoCBqb3VyXHJcbiAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImJhZGdlIGJhZGdlLXBpbGwgYmFkZ2UtJHtjbGFzc05hbWV9XCIke29ialVwQXV0by5zdGF0dXMgPyAndGl0bGU9XCJBcnLDqnRlciBsYSB0w6JjaGUgZW4gY291cnNcIicgOiAnJ30+JHtsYWJlbH08L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImNsb3NlXCIgYXJpYS1sYWJlbD1cIkNsb3NlXCIgdGl0bGU9XCJGZXJtZXJcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gYXJpYS1oaWRkZW49XCJ0cnVlXCI+JnRpbWVzOzwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPGkgY2xhc3M9XCJmYSBmYS1xdWVzdGlvbi1jaXJjbGVcIiBzdHlsZT1cImNvbG9yOmJsdWU7bWFyZ2luLWxlZnQ6NXB4O1wiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIHRpdGxlPVwiJHtoZWxwfVwiPjwvaT5cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5gO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgLy8gT24gcmVsYW5jZSBsJ3VwZGF0ZSBhdXRvIGRlcyDDqXBpc29kZXMgYXUgY2hhcmdlbWVudCBkZSBsYSBwYWdlXHJcbiAgICAgICAgaWYgKHNob3cuaW5fYWNjb3VudCAmJiBzaG93LnVzZXIucmVtYWluaW5nID4gMCAmJiBvYmpVcEF1dG8uc3RhdHVzKSB7XHJcbiAgICAgICAgICAgIG9ialVwQXV0by5sYXVuY2goKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAob2JqVXBBdXRvLnN0YXR1cykge1xyXG4gICAgICAgICAgICBvYmpVcEF1dG8uc3RvcCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgbm90TG9vcCA9IDA7XHJcbiAgICAgICAgbGV0IGludFRpbWUgPSBzZXRJbnRlcnZhbChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmICgrK25vdExvb3AgPj0gMjApIHtcclxuICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaW50VGltZSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBib290c3RyYXAgPT09ICd1bmRlZmluZWQnIHx8IHR5cGVvZiBib290c3RyYXAuUG9wb3ZlciAhPT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaW50VGltZSk7XHJcbiAgICAgICAgICAgIGlmIChkZWJ1ZylcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdMb2FkaW5nIHBvcG92ZXIgdXBkYXRlRXBpc29kZXMnKTtcclxuICAgICAgICAgICAgJCgnI3VwZGF0ZUVwaXNvZGVMaXN0IC51cGRhdGVFbGVtZW50JykucG9wb3Zlcih7XHJcbiAgICAgICAgICAgICAgICBjb250YWluZXI6ICQoJyN1cGRhdGVFcGlzb2RlTGlzdCcpLFxyXG4gICAgICAgICAgICAgICAgLy8gZGVsYXk6IHsgXCJzaG93XCI6IDUwMCwgXCJoaWRlXCI6IDEwMCB9LFxyXG4gICAgICAgICAgICAgICAgaHRtbDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGNvbnRlbnRVcCxcclxuICAgICAgICAgICAgICAgIHBsYWNlbWVudDogJ3JpZ2h0JyxcclxuICAgICAgICAgICAgICAgIHRpdGxlOiAnICcsXHJcbiAgICAgICAgICAgICAgICB0cmlnZ2VyOiAnbWFudWFsJyxcclxuICAgICAgICAgICAgICAgIGJvdW5kYXJ5OiAnd2luZG93J1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgbGV0IHRpbWVvdXRIb3ZlciA9IG51bGw7XHJcbiAgICAgICAgICAgICQoJyN1cGRhdGVFcGlzb2RlTGlzdCAudXBkYXRlRWxlbWVudCcpLmhvdmVyKFxyXG4gICAgICAgICAgICAvLyBJblxyXG4gICAgICAgICAgICBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgICAgIHRpbWVvdXRIb3ZlciA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICQoJyN1cGRhdGVFcGlzb2RlTGlzdCAudXBkYXRlRWxlbWVudCcpLnBvcG92ZXIoJ3Nob3cnKTtcclxuICAgICAgICAgICAgICAgIH0sIDUwMCk7XHJcbiAgICAgICAgICAgIH0sIFxyXG4gICAgICAgICAgICAvLyBPdXRcclxuICAgICAgICAgICAgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dEhvdmVyKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIC8vIE9uIGZlcm1lIGV0IGTDqXNhY3RpdmUgbGVzIGF1dHJlcyBwb3B1cHMgbG9yc3F1ZSBjZWxsZSBkZXMgb3B0aW9ucyBlc3Qgb3V2ZXJ0ZVxyXG4gICAgICAgICAgICAkKCcjdXBkYXRlRXBpc29kZUxpc3QgLnVwZGF0ZUVsZW1lbnQnKS5vbignc2hvdy5icy5wb3BvdmVyJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgJHVwZGF0ZUVsZW1lbnQgPSAkKCcjZXBpc29kZXMgLnNsaWRlX19pbWFnZScpO1xyXG4gICAgICAgICAgICAgICAgJHVwZGF0ZUVsZW1lbnQucG9wb3ZlcignaGlkZScpO1xyXG4gICAgICAgICAgICAgICAgJHVwZGF0ZUVsZW1lbnQucG9wb3ZlcignZGlzYWJsZScpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgLy8gT24gcsOpYWN0aXZlIGxlcyBhdXRyZXMgcG9wdXMgbG9yc3F1ZSBjZWxsZSBkZXMgb3B0aW9ucyBzZSBmZXJtZVxyXG4gICAgICAgICAgICAvLyBFdCBvbiBzdXBwcmltZSBsZXMgbGlzdGVuZXJzIGRlIGxhIHBvcHVwXHJcbiAgICAgICAgICAgICQoJyN1cGRhdGVFcGlzb2RlTGlzdCAudXBkYXRlRWxlbWVudCcpLm9uKCdoaWRlLmJzLnBvcG92ZXInLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAkKCcjZXBpc29kZXMgLnNsaWRlX19pbWFnZScpLnBvcG92ZXIoJ2VuYWJsZScpO1xyXG4gICAgICAgICAgICAgICAgJCgnLm9wdGlvbnNVcEF1dG8gLmJhZGdlJykuY3NzKCdjdXJzb3InLCAnaW5pdGlhbCcpLm9mZignY2xpY2snKTtcclxuICAgICAgICAgICAgICAgICQoJyN1cGRhdGVFcGlzb2RlTGlzdCBidXR0b24uY2xvc2UnKS5vZmYoJ2NsaWNrJyk7XHJcbiAgICAgICAgICAgICAgICAkKCcjb3B0aW9uc1VwZGF0ZUVwaXNvZGVMaXN0IGJ1dHRvbi5idG4tcHJpbWFyeScpLm9mZignY2xpY2snKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICQoJyN1cGRhdGVFcGlzb2RlTGlzdCAudXBkYXRlRWxlbWVudCcpLm9uKCdzaG93bi5icy5wb3BvdmVyJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgJCgnI3VwZGF0ZUVwaXNvZGVMaXN0IC5wb3BvdmVyLWhlYWRlcicpLmh0bWwodGl0bGVQb3B1cChvYmpVcEF1dG8pKTtcclxuICAgICAgICAgICAgICAgIGlmIChvYmpVcEF1dG8uc3RhdHVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJCgnLm9wdGlvbnNVcEF1dG8gLmJhZGdlJykuY3NzKCdjdXJzb3InLCAncG9pbnRlcicpLmNsaWNrKGUgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0ICRiYWRnZSA9ICQoZS5jdXJyZW50VGFyZ2V0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCRiYWRnZS5oYXNDbGFzcygnYmFkZ2Utc3VjY2VzcycpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBPbiBhcnLDqnRlIGxhIHTDomNoZSBkJ3VwZGF0ZSBhdXRvXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvYmpVcEF1dG8uc3RvcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAkKCcjdXBkYXRlRXBpc29kZUxpc3QgYnV0dG9uLmNsb3NlJykuY2xpY2soKGUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgICAgICAkKCcjdXBkYXRlRXBpc29kZUxpc3QgLnVwZGF0ZUVsZW1lbnQnKS5wb3BvdmVyKCdoaWRlJyk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICQoJyNvcHRpb25zVXBkYXRlRXBpc29kZUxpc3QgYnV0dG9uLmJ0bi1wcmltYXJ5JykuY2xpY2soKGUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgY2hlY2tBdXRvID0gJCgnI3VwZGF0ZUVwaXNvZGVMaXN0QXV0bycpLmlzKCc6Y2hlY2tlZCcpLCBpbnRlcnZhbEF1dG8gPSBwYXJzZUludCgkKCcjdXBkYXRlRXBpc29kZUxpc3RUaW1lJykudmFsKCkudG9TdHJpbmcoKSwgMTApO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChvYmpVcEF1dG8uYXV0byAhPT0gY2hlY2tBdXRvKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvYmpVcEF1dG8uYXV0byA9IGNoZWNrQXV0bztcclxuICAgICAgICAgICAgICAgICAgICBpZiAob2JqVXBBdXRvLmludGVydmFsICE9IGludGVydmFsQXV0bylcclxuICAgICAgICAgICAgICAgICAgICAgICAgb2JqVXBBdXRvLmludGVydmFsID0gaW50ZXJ2YWxBdXRvO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChkZWJ1ZylcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3VwZGF0ZUVwaXNvZGVMaXN0IHN1Ym1pdCcsIG9ialVwQXV0byk7XHJcbiAgICAgICAgICAgICAgICAgICAgb2JqVXBBdXRvLmxhdW5jaCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICQoJyN1cGRhdGVFcGlzb2RlTGlzdCAudXBkYXRlRWxlbWVudCcpLnBvcG92ZXIoJ2hpZGUnKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9LCA1MDApO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBBam91dGUgdW4gYm91dG9uIFZ1IHN1ciBsYSB2aWduZXR0ZSBkJ3VuIMOpcGlzb2RlXHJcbiAgICAgKiBAcGFyYW0ge1Nob3d9IHJlcyBMJ29iamV0IFNob3cgZGUgbCdBUElcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gdXBncmFkZUVwaXNvZGVzKHJlcykge1xyXG4gICAgICAgIC8vIE9uIHbDqXJpZmllIHF1ZSBsJ3V0aWxpc2F0ZXVyIGVzdCBjb25uZWN0w6kgZXQgcXVlIGxhIGNsw6kgZCdBUEkgZXN0IHJlbnNlaWduw6llXHJcbiAgICAgICAgaWYgKCF1c2VySWRlbnRpZmllZCgpIHx8IGJldGFzZXJpZXNfYXBpX3VzZXJfa2V5ID09PSAnJylcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIGNvbnN0IHNlYXNvbnMgPSAkKCcjc2Vhc29ucyAuc2xpZGVfZmxleCcpO1xyXG4gICAgICAgIGxldCB2aWduZXR0ZXMgPSBnZXRWaWduZXR0ZXMoKTtcclxuICAgICAgICBpZiAoZGVidWcpXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdOYiBzZWFzb25zOiAlZCwgbmIgdmlnbmV0dGVzOiAlZCcsIHNlYXNvbnMubGVuZ3RoLCB2aWduZXR0ZXMubGVuZ3RoKTtcclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIEFqb3V0ZSB1bmUgw6ljb3V0ZSBzdXIgbCdvYmpldCBTaG93LCBzdXIgbCfDqXZlbmVtZW50IFVQREFURSxcclxuICAgICAgICAgKiBwb3VyIG1ldHRyZSDDoCBqb3VyIGwndXBkYXRlIGF1dG8gZGVzIMOpcGlzb2Rlc1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHJlcy5hZGRMaXN0ZW5lcihCYXNlXzEuRXZlbnRUeXBlcy5VUERBVEUsIGZ1bmN0aW9uIChzaG93KSB7XHJcbiAgICAgICAgICAgIGlmIChkZWJ1ZylcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdMaXN0ZW5lciBjYWxsZWQnKTtcclxuICAgICAgICAgICAgLy8gU2kgaWwgbid5IGEgcGx1cyBkJ8OpcGlzb2RlcyDDoCByZWdhcmRlciBzdXIgbGEgc8OpcmllXHJcbiAgICAgICAgICAgIGlmIChzaG93LnVzZXIucmVtYWluaW5nIDw9IDApIHtcclxuICAgICAgICAgICAgICAgIGxldCBvYmpVcEF1dG8gPSBVcGRhdGVBdXRvXzEuVXBkYXRlQXV0by5nZXRJbnN0YW5jZShzaG93KTtcclxuICAgICAgICAgICAgICAgIC8vIFNpIGxhIHPDqXJpZSBlc3QgdGVybWluw6llXHJcbiAgICAgICAgICAgICAgICBpZiAoc2hvdy5pc0VuZGVkKCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBPbiBzdXBwcmltZSBsYSBzw6lyaWUgZGVzIG9wdGlvbnMgZCd1cGRhdGVcclxuICAgICAgICAgICAgICAgICAgICBvYmpVcEF1dG8uZGVsZXRlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBPbiBkw6lzYWN0aXZlIGxhIG1pc2Ugw6Agam91ciBhdXRvXHJcbiAgICAgICAgICAgICAgICAgICAgb2JqVXBBdXRvLnN0b3AoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vIE9uIGFqb3V0ZSBsZXMgY2FzZXMgw6AgY29jaGVyIHN1ciBsZXMgdmlnbmV0dGVzIGNvdXJhbnRlc1xyXG4gICAgICAgIGFkZENoZWNrU2VlbigpO1xyXG4gICAgICAgIC8vIEFqb3V0ZSBsZXMgY2FzZXMgw6AgY29jaGVyIHN1ciBsZXMgdmlnbmV0dGVzIGRlcyDDqXBpc29kZXNcclxuICAgICAgICBmdW5jdGlvbiBhZGRDaGVja1NlZW4oKSB7XHJcbiAgICAgICAgICAgIHZpZ25ldHRlcyA9IGdldFZpZ25ldHRlcygpO1xyXG4gICAgICAgICAgICBjb25zdCBzZWFzb25OdW0gPSBwYXJzZUludCgkKCcjc2Vhc29ucyBkaXZbcm9sZT1cImJ1dHRvblwiXS5zbGlkZS0tY3VycmVudCAuc2xpZGVfX3RpdGxlJykudGV4dCgpLm1hdGNoKC9cXGQrLykuc2hpZnQoKSwgMTApO1xyXG4gICAgICAgICAgICByZXMuc2V0Q3VycmVudFNlYXNvbihzZWFzb25OdW0pO1xyXG4gICAgICAgICAgICBsZXQgcHJvbWlzZSA9IHJlcy5jdXJyZW50U2Vhc29uLmZldGNoRXBpc29kZXMoKTsgLy8gQ29udGllbnQgbGEgcHJvbWVzc2UgZGUgcsOpY3Vww6lyZXIgbGVzIMOpcGlzb2RlcyBkZSBsYSBzYWlzb24gY291cmFudGVcclxuICAgICAgICAgICAgLy8gT24gYWpvdXRlIGxlIENTUyBldCBsZSBKYXZhc2NyaXB0IHBvdXIgbGVzIHBvcHVwXHJcbiAgICAgICAgICAgIGlmICgkKCcjY3NzcG9wb3ZlcicpLmxlbmd0aCA9PT0gMCAmJiAkKCcjanNib290c3RyYXAnKS5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgIGFkZFNjcmlwdEFuZExpbmsoWydwb3BvdmVyJywgJ2Jvb3RzdHJhcCddKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvKipcclxuICAgICAgICAgICAgICogUmV0b3VybmUgbGEgcG9zaXRpb24gZGUgbGEgcG9wdXAgcGFyIHJhcHBvcnQgw6AgbCdpbWFnZSBkdSBzaW1pbGFyXHJcbiAgICAgICAgICAgICAqIEBwYXJhbSAge09iamVjdH0gX3RpcCBVbmtub3duXHJcbiAgICAgICAgICAgICAqIEBwYXJhbSAge09iamVjdH0gZWx0IExlIERPTSBFbGVtZW50IGR1IGxpZW4gZHUgc2ltaWxhclxyXG4gICAgICAgICAgICAgKiBAcmV0dXJuIHtTdHJpbmd9ICAgICBMYSBwb3NpdGlvbiBkZSBsYSBwb3B1cFxyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgbGV0IGZ1bmNQbGFjZW1lbnQgPSAoX3RpcCwgZWx0KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvL2lmIChkZWJ1ZykgY29uc29sZS5sb2coJ2Z1bmNQbGFjZW1lbnQnLCB0aXAsICQodGlwKS53aWR0aCgpKTtcclxuICAgICAgICAgICAgICAgIGxldCByZWN0ID0gZWx0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLCB3aWR0aCA9ICQod2luZG93KS53aWR0aCgpLCBzaXplUG9wb3ZlciA9IDMyMDtcclxuICAgICAgICAgICAgICAgIHJldHVybiAoKHJlY3QubGVmdCArIHJlY3Qud2lkdGggKyBzaXplUG9wb3ZlcikgPiB3aWR0aCkgPyAnbGVmdCcgOiAncmlnaHQnO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAvLyBPbiBham91dGUgbGEgZGVzY3JpcHRpb24gZGVzIMOpcGlzb2RlcyBkYW5zIGRlcyBQb3B1cFxyXG4gICAgICAgICAgICBwcm9taXNlLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgbGV0IGludFRpbWUgPSBzZXRJbnRlcnZhbChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBib290c3RyYXAgPT09ICd1bmRlZmluZWQnIHx8IHR5cGVvZiBib290c3RyYXAuUG9wb3ZlciAhPT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRUaW1lKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZGVidWcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdBZGQgc3lub3BzaXMgZXBpc29kZScpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCAkdmlnbmV0dGUsIG9iakVwaXNvZGUsIGRlc2NyaXB0aW9uO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IHYgPSAwOyB2IDwgdmlnbmV0dGVzLmxlbmd0aDsgdisrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICR2aWduZXR0ZSA9ICQodmlnbmV0dGVzLmdldCh2KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9iakVwaXNvZGUgPSByZXMuY3VycmVudFNlYXNvbi5lcGlzb2Rlc1t2XTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgb2JqRXBpc29kZS5lbHQgPSAkdmlnbmV0dGUucGFyZW50cygnLnNsaWRlX2ZsZXgnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgb2JqRXBpc29kZS5zYXZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uID0gb2JqRXBpc29kZS5kZXNjcmlwdGlvbjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRlc2NyaXB0aW9uLmxlbmd0aCA+IDM1MCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb24gPSBkZXNjcmlwdGlvbi5zdWJzdHJpbmcoMCwgMzUwKSArICfigKYnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGRlc2NyaXB0aW9uLmxlbmd0aCA8PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbiA9ICdBdWN1bmUgZGVzY3JpcHRpb24nO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEFqb3V0IGRlIGwnYXR0cmlidXQgdGl0bGUgcG91ciBvYnRlbmlyIGxlIG5vbSBjb21wbGV0IGRlIGwnw6lwaXNvZGUsIGxvcnNxdSdpbCBlc3QgdHJvbnF1w6lcclxuICAgICAgICAgICAgICAgICAgICAgICAgb2JqRXBpc29kZS5hZGRBdHRyVGl0bGUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgb2JqRXBpc29kZS5pbml0Q2hlY2tTZWVuKHYpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBBam91dGUgbGEgc3lub3BzaXMgZGUgbCfDqXBpc29kZSBhdSBzdXJ2b2wgZGUgbGEgdmlnbmV0dGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHZpZ25ldHRlLnBvcG92ZXIoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyOiAkdmlnbmV0dGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxheTogeyBcInNob3dcIjogNTAwLCBcImhpZGVcIjogMTAwIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBodG1sOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudDogYDxwPiR7ZGVzY3JpcHRpb259PC9wPmAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwbGFjZW1lbnQ6IGZ1bmNQbGFjZW1lbnQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogJyAnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJpZ2dlcjogJ2hvdmVyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvdW5kYXJ5OiAnd2luZG93J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgJCgnI2VwaXNvZGVzIC5zbGlkZV9faW1hZ2UnKS5vbignc2hvd24uYnMucG9wb3ZlcicsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgJGNoZWNrU2VlbiA9ICQodGhpcykuZmluZCgnLmNoZWNrU2VlbicpLCBlcGlzb2RlSWQgPSBwYXJzZUludCgkY2hlY2tTZWVuLmRhdGEoJ2lkJyksIDEwKSwgZXBpc29kZSA9IHJlcy5jdXJyZW50U2Vhc29uLmdldEVwaXNvZGUoZXBpc29kZUlkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFlcGlzb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ2VwaXNvZGUgdGl0bGUgcG9wdXAnLCBlcGlzb2RlSWQsIHJlcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnI2VwaXNvZGVzIC5zbGlkZV9faW1hZ2UgLnBvcG92ZXItaGVhZGVyJykuaHRtbChlcGlzb2RlLmdldFRpdGxlUG9wdXAoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gT24gYWpvdXRlIHVuIGV2ZW50IGNsaWNrIHN1ciBsYSBjYXNlICdjaGVja1NlZW4nXHJcbiAgICAgICAgICAgICAgICAgICAgJCgnI2VwaXNvZGVzIC5jaGVja1NlZW4nKS5jbGljayhmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0ICRlbHQgPSAkKGUuY3VycmVudFRhcmdldCksIGVwaXNvZGVJZCA9IHBhcnNlSW50KCRlbHQuZGF0YSgnaWQnKSwgMTApLCBlcGlzb2RlID0gcmVzLmN1cnJlbnRTZWFzb24uZ2V0RXBpc29kZShlcGlzb2RlSWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGVidWcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnY2xpY2sgY2hlY2tTZWVuJywgZXBpc29kZSwgcmVzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXBpc29kZS50b2dnbGVTcGlubmVyKHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBPbiB2w6lyaWZpZSBzaSBsJ8OpcGlzb2RlIGEgZMOpasOgIMOpdMOpIHZ1XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICgkZWx0Lmhhc0NsYXNzKCdzZWVuJykpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE9uIGRlbWFuZGUgw6AgbCdlbmxldmVyIGRlcyDDqXBpc29kZXMgdnVzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcGlzb2RlLnVwZGF0ZVN0YXR1cygnbm90U2VlbicsIEJhc2VfMS5IVFRQX1ZFUkJTLkRFTEVURSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gU2lub24sIG9uIGwnYWpvdXRlIGF1eCDDqXBpc29kZXMgdnVzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXBpc29kZS51cGRhdGVTdGF0dXMoJ3NlZW4nLCBCYXNlXzEuSFRUUF9WRVJCUy5QT1NUKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIE9uIGFqb3V0ZSB1biBlZmZldCBhdSBzdXJ2b2wgZGUgbGEgY2FzZSAnY2hlY2tTZWVuJ1xyXG4gICAgICAgICAgICAgICAgICAgICQoJyNlcGlzb2RlcyAuY2hlY2tTZWVuJykuaG92ZXIoXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gSU5cclxuICAgICAgICAgICAgICAgICAgICAoZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKGUuY3VycmVudFRhcmdldClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5zaWJsaW5ncygnLm92ZXJmbG93SGlkZGVuJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5maW5kKCdpbWcuanMtbGF6eS1pbWFnZScpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuY3NzKCd0cmFuc2Zvcm0nLCAnc2NhbGUoMS4yKScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKGUuY3VycmVudFRhcmdldClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5wYXJlbnQoJy5zbGlkZV9faW1hZ2UnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnBvcG92ZXIoJ2hpZGUnKTtcclxuICAgICAgICAgICAgICAgICAgICB9LCBcclxuICAgICAgICAgICAgICAgICAgICAvLyBPVVRcclxuICAgICAgICAgICAgICAgICAgICAoZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKGUuY3VycmVudFRhcmdldClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5zaWJsaW5ncygnLm92ZXJmbG93SGlkZGVuJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5maW5kKCdpbWcuanMtbGF6eS1pbWFnZScpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuY3NzKCd0cmFuc2Zvcm0nLCAnc2NhbGUoMS4wKScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKGUuY3VycmVudFRhcmdldClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5wYXJlbnQoJy5zbGlkZV9faW1hZ2UnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnBvcG92ZXIoJ3Nob3cnKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0sIDUwMCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAvLyBBam91dGVyIHVuIGJvdXRvbiBkZSBtaXNlIMOgIGpvdXIgZGVzIMOpcGlzb2RlcyBkZSBsYSBzYWlzb24gY291cmFudGVcclxuICAgICAgICAgICAgaWYgKCQoJyN1cGRhdGVFcGlzb2RlTGlzdCcpLmxlbmd0aCA8IDEpIHtcclxuICAgICAgICAgICAgICAgICQoJyNlcGlzb2RlcyAuYmxvY2tUaXRsZXMnKS5wcmVwZW5kKGBcclxuICAgICAgICAgICAgICAgICAgICA8c3R5bGU+I3VwZGF0ZUVwaXNvZGVMaXN0IC5wb3BvdmVyIHtsZWZ0OiA2NXB4OyB0b3A6IDQwcHg7fTwvc3R5bGU+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBpZD1cInVwZGF0ZUVwaXNvZGVMaXN0XCIgY2xhc3M9XCJ1cGRhdGVFbGVtZW50c1wiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPGkgY2xhc3M9XCJmYSBmYS1yZWZyZXNoIGZhLTJ4IHVwZGF0ZUVwaXNvZGVzIHVwZGF0ZUVsZW1lbnQgZmluaXNoXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlPVwiTWlzZSDDoCBqb3VyIGRlcyDDqXBpc29kZXMgZGUgbGEgc2Fpc29uXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlPVwibWFyZ2luLXJpZ2h0OjEwcHg7XCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPjwvaT5cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5gKTtcclxuICAgICAgICAgICAgICAgIC8vIE9uIGFqb3V0ZSBsJ3VwZGF0ZSBhdXRvIGRlcyDDqXBpc29kZXMgZGUgbGEgc2Fpc29uIGNvdXJhbnRlXHJcbiAgICAgICAgICAgICAgICB1cGRhdGVBdXRvRXBpc29kZUxpc3QocmVzKTtcclxuICAgICAgICAgICAgICAgIC8vIE9uIGFqb3V0ZSBsYSBnZXN0aW9uIGRlIGwnZXZlbnQgY2xpY2sgc3VyIGxlIGJvdXRvblxyXG4gICAgICAgICAgICAgICAgJCgnLnVwZGF0ZUVwaXNvZGVzJykuY2xpY2soKGUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZGVidWcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZ3JvdXBDb2xsYXBzZWQoJ3VwZGF0ZUVwaXNvZGVzJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gT24gZmVybWUgbGEgcG9wdXAgZGVzIG9wdGlvbnMgZCd1cGRhdGUgYXV0b1xyXG4gICAgICAgICAgICAgICAgICAgICQoJyN1cGRhdGVFcGlzb2RlTGlzdCAudXBkYXRlRWxlbWVudCcpLnBvcG92ZXIoJ2hpZGUnKTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBzZWxmID0gJChlLmN1cnJlbnRUYXJnZXQpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYucmVtb3ZlQ2xhc3MoJ2ZpbmlzaCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIExlIG51bcOpcm8gZGUgbGEgc2Fpc29uIGNvdXJhbnRlXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2Vhc29uTnVtID0gJCgnI3NlYXNvbnMgLnNsaWRlX2ZsZXguc2xpZGUtLWN1cnJlbnQgLnNsaWRlX190aXRsZScpLnRleHQoKS5tYXRjaCgvXFxkKy8pLnNoaWZ0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzLmN1cnJlbnRTZWFzb24uZmV0Y2hFcGlzb2RlcygpLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBpZiAoZGVidWcpIGNvbnNvbGUubG9nKCdhZnRlciBmZXRjaEVwaXNvZGVzJywgT2JqZWN0LmFzc2lnbih7fSwgb2JqU2hvdykpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2aWduZXR0ZXMgPSBnZXRWaWduZXR0ZXMoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gbGVuID0gZ2V0TmJWaWduZXR0ZXMoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0ICR2aWduZXR0ZSwgb2JqRXBpc29kZSwgY2hhbmdlZCA9IGZhbHNlLCByZXRvdXI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IHYgPSAwOyB2IDwgdmlnbmV0dGVzLmxlbmd0aDsgdisrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkdmlnbmV0dGUgPSAkKHZpZ25ldHRlcy5nZXQodikpOyAvLyBET01FbGVtZW50IGpRdWVyeSBkZSBsJ2ltYWdlIGRlIGwnw6lwaXNvZGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9iakVwaXNvZGUgPSByZXMuY3VycmVudFNlYXNvbi5lcGlzb2Rlc1t2XTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9iakVwaXNvZGUuZWx0ID0gJHZpZ25ldHRlLnBhcmVudHMoJy5zbGlkZV9mbGV4Jyk7IC8vIERvbm7DqWVzIGRlIGwnw6lwaXNvZGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vaWYgKGRlYnVnKSBjb25zb2xlLmxvZygnRXBpc29kZSBJRCcsIGdldEVwaXNvZGVJZCgkdmlnbmV0dGUpLCBlcGlzb2RlLmlkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldG91ciA9IG9iakVwaXNvZGUudXBkYXRlQ2hlY2tTZWVuKHYpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFjaGFuZ2VkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hhbmdlZCA9IHJldG91cjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBPbiBtZXQgw6Agam91ciBsZXMgw6lsw6ltZW50cywgc2V1bGVtZW50IHNpIGlsIHkgYSBldSBkZXMgbW9kaWZpY2F0aW9uc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2hhbmdlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRlYnVnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCd1cGRhdGVFcGlzb2RlcyBjaGFuZ2VkIHRydWUnLCByZXMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU2kgaWwgcmVzdGUgZGVzIMOpcGlzb2RlcyDDoCB2b2lyLCBvbiBzY3JvbGxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICgkKCcjZXBpc29kZXMgLnNsaWRlX2ZsZXguc2xpZGUtLW5vdFNlZW4nKS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJCgnI2VwaXNvZGVzIC5zbGlkZXNfZmxleCcpLmdldCgwKS5zY3JvbGxMZWZ0ID1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJCgnI2VwaXNvZGVzIC5zbGlkZV9mbGV4LnNsaWRlLS1ub3RTZWVuJykuZ2V0KDApLm9mZnNldExlZnQgLSA2OTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcy51cGRhdGUodHJ1ZSkudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5hZGRDbGFzcygnZmluaXNoJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm5MYXp5LmluaXQoKTsgLy8gT24gYWZmaWNoZSBsZXMgaW1hZ2VzIGxhenlsb2FkXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRlYnVnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmdyb3VwRW5kKCk7IC8vIE9uIGNsb3MgbGUgZ3JvdXBlIGRlIGNvbnNvbGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIGVyciA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uKCdFcnJldXIgZGUgcsOpY3Vww6lyYXRpb24gZGUgbGEgcmVzc291cmNlIFNob3cnLCAnU2hvdyB1cGRhdGU6ICcgKyBlcnIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuYWRkQ2xhc3MoJ2ZpbmlzaCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignU2hvdyB1cGRhdGUgZXJyb3InLCBlcnIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkZWJ1ZylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5ncm91cEVuZCgpOyAvLyBPbiBjbG9zIGxlIGdyb3VwZSBkZSBjb25zb2xlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkZWJ1ZylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygndXBkYXRlRXBpc29kZXMgbm8gY2hhbmdlcycpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5hZGRDbGFzcygnZmluaXNoJyk7IC8vIE9uIGFycmV0ZSBsJ2FuaW1hdGlvbiBkZSBtaXNlIMOgIGpvdXJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkZWJ1ZylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmdyb3VwRW5kKCk7IC8vIE9uIGNsb3MgbGUgZ3JvdXBlIGRlIGNvbnNvbGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0sIChlcnIpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5hZGRDbGFzcygnZmluaXNoJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkZWJ1ZylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZ3JvdXBFbmQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uKCdFcnJldXIgZGUgbWlzZSDDoCBqb3VyIGRlcyDDqXBpc29kZXMnLCAndXBkYXRlRXBpc29kZUxpc3Q6ICcgKyBlcnIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gT24gYWpvdXRlIHVuIGV2ZW50IHN1ciBsZSBjaGFuZ2VtZW50IGRlIHNhaXNvblxyXG4gICAgICAgIHNlYXNvbnMuY2xpY2soKCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoZGVidWcpXHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmdyb3VwQ29sbGFwc2VkKCdzZWFzb24gY2xpY2snKTtcclxuICAgICAgICAgICAgJCgnI2VwaXNvZGVzIC5jaGVja1NlZW4nKS5vZmYoJ2NsaWNrJyk7XHJcbiAgICAgICAgICAgIC8vIE9uIGF0dGVuZCBxdWUgbGVzIHZpZ25ldHRlcyBkZSBsYSBzYWlzb24gY2hvaXNpZSBzb2llbnQgY2hhcmfDqWVzXHJcbiAgICAgICAgICAgIHdhaXRTZWFzb25zQW5kRXBpc29kZXNMb2FkZWQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgYWRkQ2hlY2tTZWVuKCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGVidWcpXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5ncm91cEVuZCgpO1xyXG4gICAgICAgICAgICB9LCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdTZWFzb24gY2xpY2sgVGltZW91dCcpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGRlYnVnKVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZ3JvdXBFbmQoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgLy8gT24gYWN0aXZlIGxlcyBtZW51cyBkcm9wZG93blxyXG4gICAgICAgICQoJy5kcm9wZG93bi10b2dnbGUnKS5kcm9wZG93bigpO1xyXG4gICAgICAgIC8vIE9uIGfDqHJlIGwnYWpvdXQgZXQgbGEgc3VwcHJlc3Npb24gZGUgbGEgc8OpcmllIGRhbnMgbGUgY29tcHRlIHV0aWxpc2F0ZXVyXHJcbiAgICAgICAgaWYgKHJlcy5pbl9hY2NvdW50KSB7XHJcbiAgICAgICAgICAgIHJlcy5kZWxldGVTaG93Q2xpY2soKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJlcy5hZGRTaG93Q2xpY2soKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gT24gcsOpY3Vww6hyZSBsZXMgdmlnbmV0dGVzIGRlcyDDqXBpc29kZXNcclxuICAgICAgICBmdW5jdGlvbiBnZXRWaWduZXR0ZXMoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAkKCcjZXBpc29kZXMgLnNsaWRlX19pbWFnZScpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogTW9kaWZpZSBsZSBmb25jdGlvbm5lbWVudCBkJ2Fqb3V0IGQndW4gc2ltaWxhclxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSAge09iamVjdH0gICAkZWx0ICAgICAgICAgIEwnw6lsw6ltZW50IERPTUVsZW1lbnQgalF1ZXJ5XHJcbiAgICAgKiBAcGFyYW0gIHtOdW1iZXJbXX0gW29ialNpbWlsYXJzXSBVbiB0YWJsZWF1IGRlcyBpZGVudGlmaWFudHMgZGVzIHNpbWlsYXJzIGFjdHVlbHNcclxuICAgICAqIEByZXR1cm4ge3ZvaWR9XHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIHJlcGxhY2VTdWdnZXN0U2ltaWxhckhhbmRsZXIoJGVsdCwgb2JqU2ltaWxhcnMgPSBbXSkge1xyXG4gICAgICAgIC8vIE9uIHbDqXJpZmllIHF1ZSBsJ3V0aWxpc2F0ZXVyIGVzdCBjb25uZWN0w6kgZXQgcXVlIGxhIGNsw6kgZCdBUEkgZXN0IHJlbnNlaWduw6llXHJcbiAgICAgICAgaWYgKCF1c2VySWRlbnRpZmllZCgpIHx8IGJldGFzZXJpZXNfYXBpX3VzZXJfa2V5ID09PSAnJyB8fCAhLyhzZXJpZXxmaWxtKS8udGVzdCh1cmwpKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgaWYgKGRlYnVnKVxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygncmVwbGFjZVN1Z2dlc3RTaW1pbGFySGFuZGxlcicpO1xyXG4gICAgICAgIGNvbnN0IHR5cGUgPSBnZXRBcGlSZXNvdXJjZSh1cmwuc3BsaXQoJy8nKVsxXSksIC8vIExlIHR5cGUgZGUgcmVzc291cmNlXHJcbiAgICAgICAgcmVzSWQgPSBnZXRSZXNvdXJjZUlkKCk7IC8vIElkZW50aWZpYW50IGRlIGxhIHJlc3NvdXJjZVxyXG4gICAgICAgIC8vIEdlc3Rpb24gZCdham91dCBkJ3VuIHNpbWlsYXJcclxuICAgICAgICAkZWx0LnJlbW92ZUF0dHIoJ29uY2xpY2snKS5jbGljaygoKSA9PiB7XHJcbiAgICAgICAgICAgIG5ldyBQb3B1cEFsZXJ0KHtcclxuICAgICAgICAgICAgICAgIHNob3dDbG9zZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHR5cGU6ICdwb3Bpbi1zdWdnZXN0c2hvdycsXHJcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHtcclxuICAgICAgICAgICAgICAgICAgICBpZDogcmVzSWRcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBjYWxsYmFjazogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICQoXCIjc2ltaWxhaXJlX2lkX3NlYXJjaFwiKS5mb2N1cygpLm9uKFwia2V5dXBcIiwgKGUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHNlYXJjaCA9ICQoZS5jdXJyZW50VGFyZ2V0KS52YWwoKS50b1N0cmluZygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2VhcmNoLmxlbmd0aCA+IDAgJiYgZS53aGljaCAhPSA0MCAmJiBlLndoaWNoICE9IDM4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBCYXNlXzEuQmFzZS5jYWxsQXBpKCdHRVQnLCAnc2VhcmNoJywgdHlwZS5wbHVyYWwsIHsgYXV0cmVzOiAnbWluZScsIHRleHQ6IHNlYXJjaCB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKChkYXRhKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbWVkaWFzID0gZGF0YVt0eXBlLnBsdXJhbF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJChcIiNzZWFyY2hfcmVzdWx0cyAudGl0bGVcIikucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJChcIiNzZWFyY2hfcmVzdWx0cyAuaXRlbVwiKS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgbWVkaWE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgcyA9IDA7IHMgPCBtZWRpYXMubGVuZ3RoOyBzKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVkaWEgPSBtZWRpYXNbc107XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvYmpTaW1pbGFycy5pbmRleE9mKG1lZGlhLmlkKSAhPT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IC8vIFNpbWlsYXIgZMOpasOgIHByb3Bvc8OpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoJyNzZWFyY2hfcmVzdWx0cycpLmFwcGVuZChgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiaXRlbVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cD48c3BhbiBkYXRhLWlkPVwiJHttZWRpYS5pZH1cIiBzdHlsZT1cImN1cnNvcjpwb2ludGVyO1wiPiR7bWVkaWEudGl0bGV9PC9zcGFuPjwvcD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PmApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKCcjc2VhcmNoX3Jlc3VsdHMgLml0ZW0gc3BhbicpLmNsaWNrKChlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF1dG9jb21wbGV0ZVNpbWlsYXIoZS5jdXJyZW50VGFyZ2V0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIChlcnIpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub3RpZmljYXRpb24oJ0Fqb3V0IGRcXCd1biBzaW1pbGFyJywgJ0VycmV1ciByZXF1w6p0ZSBTZWFyY2g6ICcgKyBlcnIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoZS53aGljaCAhPSA0MCAmJiBlLndoaWNoICE9IDM4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKFwiI3NlYXJjaF9yZXN1bHRzXCIpLmVtcHR5KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKFwiI3NpbWlsYWlyZV9pZF9zZWFyY2hcIikub2ZmKFwia2V5ZG93blwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICQoXCIjc2ltaWxhaXJlX2lkX3NlYXJjaFwiKS5vZmYoJ2tleWRvd24nKS5vbigna2V5ZG93bicsIChlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRfaXRlbSA9ICQoXCIjc2VhcmNoX3Jlc3VsdHMgLml0ZW0uaGxcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN3aXRjaCAoZS53aGljaCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLyogRmzDqGNoZSBkdSBiYXMgKi9cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgNDA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRfaXRlbS5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJChcIiNzZWFyY2hfcmVzdWx0cyAuaXRlbTpmaXJzdFwiKS5hZGRDbGFzcyhcImhsXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG5leHRfaXRlbSA9ICQoXCIjc2VhcmNoX3Jlc3VsdHMgLml0ZW0uaGxcIikubmV4dChcImRpdlwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5leHRfaXRlbS5hdHRyKFwiY2xhc3NcIikgPT09IFwidGl0bGVcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV4dF9pdGVtID0gbmV4dF9pdGVtLm5leHQoXCJkaXZcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudF9pdGVtLnJlbW92ZUNsYXNzKFwiaGxcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5leHRfaXRlbS5hZGRDbGFzcyhcImhsXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8qIEZsw6hjaGUgZHUgaGF1dCAqL1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAzODpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudF9pdGVtLmxlbmd0aCAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgcHJldl9pdGVtID0gJChcIiNzZWFyY2hfcmVzdWx0cyAuaXRlbS5obFwiKS5wcmV2KFwiZGl2XCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocHJldl9pdGVtLmF0dHIoXCJjbGFzc1wiKSA9PSBcInRpdGxlXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByZXZfaXRlbSA9IHByZXZfaXRlbS5wcmV2KFwiZGl2XCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRfaXRlbS5yZW1vdmVDbGFzcyhcImhsXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmV2X2l0ZW0uYWRkQ2xhc3MoXCJobFwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvKiBUb3VjaGUgRW50csOpZSAqL1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAxMzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGVidWcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdjdXJyZW50X2l0ZW0nLCBjdXJyZW50X2l0ZW0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50X2l0ZW0ubGVuZ3RoICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF1dG9jb21wbGV0ZVNpbWlsYXIoY3VycmVudF9pdGVtLmZpbmQoXCJzcGFuXCIpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvKiBUb3VjaGUgRWNoYXAgKi9cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMjc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJChcIiNzZWFyY2hfcmVzdWx0c1wiKS5lbXB0eSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoXCJpbnB1dFtuYW1lPXNpbWlsYWlyZV9pZF9zZWFyY2hdXCIpLnZhbChcIlwiKS50cmlnZ2VyKFwiYmx1clwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgZnVuY3Rpb24gYXV0b2NvbXBsZXRlU2ltaWxhcihlbCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHRpdHJlID0gJChlbCkuaHRtbCgpLCBpZCA9ICQoZWwpLmRhdGEoXCJpZFwiKTtcclxuICAgICAgICAgICAgICAgIHRpdHJlID0gdGl0cmUucmVwbGFjZSgvJmFtcDsvZywgXCImXCIpO1xyXG4gICAgICAgICAgICAgICAgJChcIiNzZWFyY2hfcmVzdWx0cyAuaXRlbVwiKS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgICQoXCIjc2VhcmNoX3Jlc3VsdHMgLnRpdGxlXCIpLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgJChcIiNzaW1pbGFpcmVfaWRfc2VhcmNoXCIpLnZhbCh0aXRyZSkudHJpZ2dlcihcImJsdXJcIik7XHJcbiAgICAgICAgICAgICAgICAkKFwiaW5wdXRbbmFtZT1zaW1pbGFpcmVfaWRdXCIpLnZhbChpZCk7XHJcbiAgICAgICAgICAgICAgICAkKCcjcG9waW4tZGlhbG9nIC5wb3Bpbi1jb250ZW50LWh0bWwgPiBmb3JtID4gZGl2LmJ1dHRvbi1zZXQgPiBidXR0b24nKS5mb2N1cygpO1xyXG4gICAgICAgICAgICAgICAgLy8kKFwiaW5wdXRbbmFtZT1ub3Rlc191cmxdXCIpLnRyaWdnZXIoXCJmb2N1c1wiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBWw6lyaWZpZSBzaSBsZXMgc8Opcmllcy9maWxtcyBzaW1pbGFpcmVzIG9udCDDqXTDqSB2dWVzXHJcbiAgICAgKiBOw6ljZXNzaXRlIHF1ZSBsJ3V0aWxpc2F0ZXVyIHNvaXQgY29ubmVjdMOpIGV0IHF1ZSBsYSBjbMOpIGQnQVBJIHNvaXQgcmVuc2VpZ27DqWVcclxuICAgICAqIEBwYXJhbSB7TWVkaWF9IHJlcyBMYSByZXNzb3VyY2UgZGUgbCdBUElcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gc2ltaWxhcnNWaWV3ZWQocmVzKSB7XHJcbiAgICAgICAgLy8gT24gdsOpcmlmaWUgcXVlIGwndXRpbGlzYXRldXIgZXN0IGNvbm5lY3TDqSBldCBxdWUgbGEgY2zDqSBkJ0FQSSBlc3QgcmVuc2VpZ27DqWVcclxuICAgICAgICBpZiAoIXVzZXJJZGVudGlmaWVkKCkgfHwgYmV0YXNlcmllc19hcGlfdXNlcl9rZXkgPT09ICcnIHx8ICEvKHNlcmllfGZpbG0pLy50ZXN0KHVybCkpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBjb25zb2xlLmdyb3VwQ29sbGFwc2VkKCdzaW1pbGFyc1ZpZXdlZCcpO1xyXG4gICAgICAgIGxldCAkc2ltaWxhcnMgPSAkKCcjc2ltaWxhcnMgLnNsaWRlX190aXRsZScpLCAvLyBMZXMgdGl0cmVzIGRlcyByZXNzb3VyY2VzIHNpbWlsYWlyZXNcclxuICAgICAgICBsZW4gPSAkc2ltaWxhcnMubGVuZ3RoOyAvLyBMZSBub21icmUgZGUgc2ltaWxhaXJlc1xyXG4gICAgICAgIGlmIChkZWJ1ZylcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ25iIHNpbWlsYXJzOiAlZCcsIGxlbiwgcmVzLm5iU2ltaWxhcnMpO1xyXG4gICAgICAgIC8vIE9uIHNvcnQgc2kgaWwgbid5IGEgYXVjdW4gc2ltaWxhcnMgb3Ugc2kgaWwgcydhZ2l0IGRlIGxhIHZpZ25ldHRlIGQnYWpvdXRcclxuICAgICAgICBpZiAobGVuIDw9IDAgfHwgKGxlbiA9PT0gMSAmJiAkKCRzaW1pbGFycy5wYXJlbnQoKS5nZXQoMCkpLmZpbmQoJ2J1dHRvbicpLmxlbmd0aCA9PT0gMSkpIHtcclxuICAgICAgICAgICAgJCgnLnVwZGF0ZVNpbWlsYXJzJykuYWRkQ2xhc3MoJ2ZpbmlzaCcpO1xyXG4gICAgICAgICAgICByZXBsYWNlU3VnZ2VzdFNpbWlsYXJIYW5kbGVyKCQoJyNzaW1pbGFycyBkaXYuc2xpZGVzX2ZsZXggZGl2LnNsaWRlX2ZsZXggZGl2LnNsaWRlX19pbWFnZSA+IGJ1dHRvbicpKTtcclxuICAgICAgICAgICAgY29uc29sZS5ncm91cEVuZCgpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogT24gYWpvdXRlIHVuIGJvdXRvbiBkZSBtaXNlIMOgIGpvdXIgZGVzIHNpbWlsYXJzXHJcbiAgICAgICAgICogZXQgb24gdsOpcmlmaWUgcXUnaWwgbidleGlzdGUgcGFzIGTDqWrDoFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGlmICgkKCcjdXBkYXRlU2ltaWxhcnNCbG9jaycpLmxlbmd0aCA8IDEpIHtcclxuICAgICAgICAgICAgLy8gT24gYWpvdXRlIGxlcyByZXNzb3VyY2VzIENTUyBldCBKUyBuw6ljZXNzYWlyZXNcclxuICAgICAgICAgICAgaWYgKCQoJyNjc3Nwb3BvdmVyJykubGVuZ3RoIDw9IDAgJiYgJCgnI2pzYm9vdHN0cmFwJykubGVuZ3RoIDw9IDApIHtcclxuICAgICAgICAgICAgICAgIGFkZFNjcmlwdEFuZExpbmsoWydwb3BvdmVyJywgJ2Jvb3RzdHJhcCddKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBPbiBham91dGUgbGUgYm91dG9uIGRlIG1pc2Ugw6Agam91ciBkZXMgc2ltaWxhaXJlc1xyXG4gICAgICAgICAgICAkKCcjc2ltaWxhcnMgLmJsb2NrVGl0bGVzJykuYXBwZW5kKGBcclxuICAgICAgICAgICAgICAgIDxkaXYgaWQ9XCJ1cGRhdGVTaW1pbGFyc0Jsb2NrXCIgY2xhc3M9XCJ1cGRhdGVFbGVtZW50c1wiIHN0eWxlPVwibWFyZ2luLWxlZnQ6MTBweDtcIj5cclxuICAgICAgICAgICAgICAgICAgPGltZyBzcmM9XCIke3NlcnZlckJhc2VVcmx9L2ltZy91cGRhdGUucG5nXCJcclxuICAgICAgICAgICAgICAgICAgICAgICBjbGFzcz1cInVwZGF0ZVNpbWlsYXJzIHVwZGF0ZUVsZW1lbnRcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgIHRpdGxlPVwiTWlzZSDDoCBqb3VyIGRlcyBzaW1pbGFpcmVzIHZ1c1wiLz5cclxuICAgICAgICAgICAgICAgIDwvZGl2PmApO1xyXG4gICAgICAgICAgICAvLyBTaSBsZSBib3V0b24gZCdham91dCBkZSBzaW1pbGFpcmUgbidlc3QgcGFzIHByw6lzZW50XHJcbiAgICAgICAgICAgIC8vIGV0IHF1ZSBsYSByZXNzb3VyY2UgZXN0IGRhbnMgbGUgY29tcHRlIGRlIGwndXRpbGlzYXRldXIsIG9uIGFqb3V0ZSBsZSBib3V0b25cclxuICAgICAgICAgICAgaWYgKCQoJyNzaW1pbGFycyBidXR0b24uYmxvY2tUaXRsZS1zdWJ0aXRsZScpLmxlbmd0aCA9PT0gMCAmJiByZXMuaW5fYWNjb3VudCA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgJCgnI3NpbWlsYXJzIC5ibG9ja1RpdGxlJylcclxuICAgICAgICAgICAgICAgICAgICAuYWZ0ZXIoYDxidXR0b24gdHlwZT1cImJ1dHRvblwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzPVwiYnRuLXJlc2V0IGJsb2NrVGl0bGUtc3VidGl0bGUgdS1jb2xvcldoaXRlT3BhY2l0eTA1XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTdWdnw6lyZXIgdW5lIHPDqXJpZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+YCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gT24gYWpvdXRlIGxhIGdlc3Rpb24gZGUgbCdldmVudCBjbGljayBzdXIgbGUgYm91dG9uIGQndXBkYXRlIGRlcyBzaW1pbGFyc1xyXG4gICAgICAgICAgICAkKCcudXBkYXRlU2ltaWxhcnMnKS5jbGljayhmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoJ2ZpbmlzaCcpO1xyXG4gICAgICAgICAgICAgICAgLy8gT24gc3VwcHJpbWUgbGVzIGJhbmRlYXV4IFZpZXdlZFxyXG4gICAgICAgICAgICAgICAgJCgnLmJhbmRWaWV3ZWQnKS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgIC8vIE9uIHN1cHByaW1lIGxlcyBub3Rlc1xyXG4gICAgICAgICAgICAgICAgJCgnLnN0YXJzLW91dGVyJykucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICAkKCcuZmEtd3JlbmNoJykub2ZmKCdjbGljaycpLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgLy8gT24gc3VwcHJpbWUgbGVzIHBvcG92ZXJzXHJcbiAgICAgICAgICAgICAgICAkKCcjc2ltaWxhcnMgYS5zbGlkZV9faW1hZ2UnKS5lYWNoKChpLCBlbHQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAkKGVsdCkucG9wb3ZlcignZGlzcG9zZScpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAvLyBPbiBtZXQgw6Agam91ciBsZXMgc2VyaWVzL2ZpbG1zIHNpbWlsYWlyZXNcclxuICAgICAgICAgICAgICAgIHNpbWlsYXJzVmlld2VkKHJlcyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgb2JqU2ltaWxhcnMgPSBbXTtcclxuICAgICAgICByZXMuZmV0Y2hTaW1pbGFycygpLnRoZW4oZnVuY3Rpb24gKHJlcykge1xyXG4gICAgICAgICAgICBsZXQgaW50VGltZSA9IHNldEludGVydmFsKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgYm9vdHN0cmFwID09PSAndW5kZWZpbmVkJyB8fCB0eXBlb2YgYm9vdHN0cmFwLlBvcG92ZXIgIT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRUaW1lKTtcclxuICAgICAgICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICAgICAgICogUmV0b3VybmUgbGEgcG9zaXRpb24gZGUgbGEgcG9wdXAgcGFyIHJhcHBvcnQgw6AgbCdpbWFnZSBkdSBzaW1pbGFyXHJcbiAgICAgICAgICAgICAgICAgKiBAcGFyYW0gIHtPYmplY3R9ICAgICAgICAgX3RpcCBVbmtub3duXHJcbiAgICAgICAgICAgICAgICAgKiBAcGFyYW0gIHtIVE1MRWxlbWVudH0gICAgZWx0ICBMZSBET00gRWxlbWVudCBkdSBsaWVuIGR1IHNpbWlsYXJcclxuICAgICAgICAgICAgICAgICAqIEByZXR1cm4ge1N0cmluZ30gICAgICAgICAgICAgIExhIHBvc2l0aW9uIGRlIGxhIHBvcHVwXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIGxldCBmdW5jUGxhY2VtZW50ID0gKF90aXAsIGVsdCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vaWYgKGRlYnVnKSBjb25zb2xlLmxvZygnZnVuY1BsYWNlbWVudCcsIHRpcCwgJCh0aXApLndpZHRoKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCByZWN0ID0gZWx0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLCB3aWR0aCA9ICQod2luZG93KS53aWR0aCgpLCBzaXplUG9wb3ZlciA9IDMyMDtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKChyZWN0LmxlZnQgKyByZWN0LndpZHRoICsgc2l6ZVBvcG92ZXIpID4gd2lkdGgpID8gJ2xlZnQnIDogJ3JpZ2h0JztcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBzID0gMDsgcyA8IHJlcy5zaW1pbGFycy5sZW5ndGg7IHMrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIG9ialNpbWlsYXJzLnB1c2gocmVzLnNpbWlsYXJzW3NdLmlkKTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgJGVsdCA9ICQoJHNpbWlsYXJzLmdldChzKSksICRsaW5rID0gJGVsdC5zaWJsaW5ncygnYScpLCBzaW1pbGFyID0gcmVzLnNpbWlsYXJzW3NdO1xyXG4gICAgICAgICAgICAgICAgICAgIHNpbWlsYXIuZWx0ID0gJGVsdC5wYXJlbnRzKCcuc2xpZGVfZmxleCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNpbWlsYXIuc2F2ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIHNpbWlsYXIgPSBuZXcgU2ltaWxhcihyZXNvdXJjZSwgJGVsdC5wYXJlbnRzKCcuc2xpZGVfZmxleCcpLCB0eXBlKTtcclxuICAgICAgICAgICAgICAgICAgICAvLyBPbiBkw6ljb2RlIGxlIHRpdHJlIGR1IHNpbWlsYXJcclxuICAgICAgICAgICAgICAgICAgICBzaW1pbGFyLmRlY29kZVRpdGxlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gT24gYWpvdXRlIGwnaWNvbmUgcG91ciB2aXN1YWxpc2VyIGxlcyBkYXRhIEpTT04gZHUgc2ltaWxhclxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChkZWJ1Zykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzaW1pbGFyLndyZW5jaCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBzaW1pbGFyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIE9uIHbDqXJpZmllIGxhIHByw6lzZW5jZSBkZSBsJ2ltYWdlIGR1IHNpbWlsYXJcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmNoZWNrSW1nKClcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gT24gYWpvdXRlIGxlIGJhbmRlYXUgdmlld2VkIHN1ciBsZSBzaW1pbGFyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hZGRWaWV3ZWQoKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBPbiBham91dGUgbGUgY29kZSBIVE1MIHBvdXIgbGUgcmVuZHUgZGUgbGEgbm90ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAucmVuZGVyU3RhcnMoKTtcclxuICAgICAgICAgICAgICAgICAgICAvLyBPbiBham91dGUgbGEgcG9wb3ZlciBzdXIgbGUgc2ltaWxhclxyXG4gICAgICAgICAgICAgICAgICAgICRsaW5rLnBvcG92ZXIoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250YWluZXI6ICRsaW5rLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWxheTogeyBcInNob3dcIjogMjUwLCBcImhpZGVcIjogMTAwIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGh0bWw6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6ICcgJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGxhY2VtZW50OiBmdW5jUGxhY2VtZW50LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogJyAnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0cmlnZ2VyOiAnaG92ZXInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmYWxsYmFja1BsYWNlbWVudDogWydsZWZ0JywgJ3JpZ2h0J11cclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIEV2ZW50IMOgIGwnb3V2ZXJ0dXJlIGRlIGxhIFBvcG92ZXJcclxuICAgICAgICAgICAgICAgICQoJyNzaW1pbGFycyBhLnNsaWRlX19pbWFnZScpLm9uKCdzaG93bi5icy5wb3BvdmVyJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0ICR3cmVuY2ggPSAkKHRoaXMpLnBhcmVudCgpLmZpbmQoJy5wb3BvdmVyLXdyZW5jaCcpLCByZXNJZCA9IHBhcnNlSW50KCR3cmVuY2guZGF0YSgnaWQnKSwgMTApLCB0eXBlID0gJHdyZW5jaC5kYXRhKCd0eXBlJyksIG9ialNpbWlsYXIgPSByZXMuZ2V0U2ltaWxhcihyZXNJZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJCgnLnBvcG92ZXItaGVhZGVyJykuaHRtbChvYmpTaW1pbGFyLmdldFRpdGxlUG9wdXAoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgJCgnLnBvcG92ZXItYm9keScpLmh0bWwob2JqU2ltaWxhci5nZXRDb250ZW50UG9wdXAoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gT24gZ8OocmUgbGVzIG1vZGlmcyBzdXIgbGVzIGNhc2VzIMOgIGNvY2hlciBkZSBsJ8OpdGF0IGQndW4gZmlsbSBzaW1pbGFyXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGUgPT09IEJhc2VfMS5NZWRpYVR5cGUubW92aWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnaW5wdXQubW92aWUnKS5jaGFuZ2UoKGUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCAkZWx0ID0gJChlLmN1cnJlbnRUYXJnZXQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHN0YXRlID0gMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkZWJ1ZylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnaW5wdXQubW92aWUgY2hhbmdlJywgJGVsdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoJGVsdC5pcygnOmNoZWNrZWQnKSAmJiAkZWx0Lmhhc0NsYXNzKCdtb3ZpZVNlZW4nKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlID0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKCgkZWx0LmlzKCc6Y2hlY2tlZCcpICYmICRlbHQuaGFzQ2xhc3MoJ21vdmllTXVzdFNlZScpKSB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICghJGVsdC5pcygnOmNoZWNrZWQnKSAmJiAkZWx0Lmhhc0NsYXNzKCdtb3ZpZVNlZW4nKSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZSA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmICgkZWx0LmlzKCc6Y2hlY2tlZCcpICYmICRlbHQuaGFzQ2xhc3MoJ21vdmllTm90U2VlJykpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZSA9IDI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKCdpbnB1dC5tb3ZpZTpub3QoLicgKyAkZWx0LmdldCgwKS5jbGFzc0xpc3RbMV0gKyAnKScpLmVhY2goKGksIGUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKGUpLnByb3AoXCJjaGVja2VkXCIsIGZhbHNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JqU2ltaWxhci5hZGRUb0FjY291bnQoc3RhdGUpLnRoZW4oc2ltaWxhciA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHN0YXRlID09PSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRlbHQucGFyZW50cygnYScpLnByZXBlbmQoYDxpbWcgc3JjPVwiJHtzZXJ2ZXJCYXNlVXJsfS9pbWcvdmlld2VkLnBuZ1wiIGNsYXNzPVwiYmFuZFZpZXdlZFwiLz5gKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoJGVsdC5wYXJlbnRzKCdhJykuZmluZCgnLmJhbmRWaWV3ZWQnKS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRlbHQucGFyZW50cygnYScpLmZpbmQoJy5iYW5kVmlld2VkJykucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkZWJ1ZylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ21vdmllIG11c3RTZWUvc2VlbiBPSycsIHNpbWlsYXIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgZXJyID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ21vdmllIG11c3RTZWUvc2VlbiBLTycsIGVycik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIC8vIE9uIGfDqHJlIGxlIGNsaWNrIHN1ciBsZSBsaWVuIGQnYWpvdXQgZGUgbGEgc8OpcmllIHNpbWlsYXIgc3VyIGxlIGNvbXB0ZSBkZSBsJ3V0aWxpc2F0ZXVyXHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAodHlwZSA9PT0gQmFzZV8xLk1lZGlhVHlwZS5zaG93KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJy5wb3BvdmVyIC5hZGRTaG93JykuY2xpY2soKGUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvYmpTaW1pbGFyLmFkZFRvQWNjb3VudCgpLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHBhcmEgPSAkKGUuY3VycmVudFRhcmdldCkucGFyZW50KCdwJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJChlLmN1cnJlbnRUYXJnZXQpLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmEudGV4dCgnPHNwYW4gc3R5bGU9XCJjb2xvcjp2YXIoLS1saW5rLWNvbG9yKVwiPkxhIHPDqXJpZSBhIGJpZW4gw6l0w6kgYWpvdXTDqWUgw6Agdm90cmUgY29tcHRlPC9zcGFuPicpLmRlbGF5KDIwMDApLmZhZGVJbig0MDApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgZXJyID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdQb3BvdmVyIGFkZFNob3cgZXJyb3InLCBlcnIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAvLyBPbiBnw6hyZSBsZSBwbGFjZW1lbnQgZGUgbGEgUG9wb3ZlciBwYXIgcmFwcG9ydCDDoCBsJ2ltYWdlIGR1IHNpbWlsYXJcclxuICAgICAgICAgICAgICAgICAgICBsZXQgcG9wb3ZlciA9ICQoJy5wb3BvdmVyJyksIGltZyA9IHBvcG92ZXIuc2libGluZ3MoJ2ltZy5qcy1sYXp5LWltYWdlJyksIHBsYWNlbWVudCA9ICQoJy5wb3BvdmVyJykuYXR0cigneC1wbGFjZW1lbnQnKSwgc3BhY2UgPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwbGFjZW1lbnQgPT0gJ2xlZnQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNwYWNlID0gcG9wb3Zlci53aWR0aCgpICsgKGltZy53aWR0aCgpIC8gMikgKyA1O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3BvdmVyLmNzcygnbGVmdCcsIGAtJHtzcGFjZX1weGApO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgJCgnLnVwZGF0ZVNpbWlsYXJzJykuYWRkQ2xhc3MoJ2ZpbmlzaCcpO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5ncm91cEVuZCgpO1xyXG4gICAgICAgICAgICB9LCA1MDApO1xyXG4gICAgICAgIH0sIChlcnIpID0+IHtcclxuICAgICAgICAgICAgbm90aWZpY2F0aW9uKCdFcnJldXIgZGUgcsOpY3Vww6lyYXRpb24gZGVzIHNpbWlsYXJzJywgJ3NpbWlsYXJzVmlld2VkOiAnICsgZXJyKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXBsYWNlU3VnZ2VzdFNpbWlsYXJIYW5kbGVyKCQoJyNzaW1pbGFycyBidXR0b24uYmxvY2tUaXRsZS1zdWJ0aXRsZScpLCBvYmpTaW1pbGFycyk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFBlcm1ldCBkZSBtZXR0cmUgw6Agam91ciBsYSBsaXN0ZSBkZXMgw6lwaXNvZGVzIMOgIHZvaXJcclxuICAgICAqIHN1ciBsYSBwYWdlIGRlIGwnYWdlbmRhXHJcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiB1cGRhdGVBZ2VuZGEoKSB7XHJcbiAgICAgICAgLy8gSWRlbnRpZmllciBsZXMgaW5mb3JtYXRpb25zIGRlcyDDqXBpc29kZXMgw6Agdm9pclxyXG4gICAgICAgIC8vIExlcyBjb250YWluZXJzXHJcbiAgICAgICAgbGV0ICRjb250YWluZXJzRXBpc29kZSA9ICQoJyNyZWFjdGpzLWVwaXNvZGVzLXRvLXdhdGNoIC5Db21wb25lbnRFcGlzb2RlQ29udGFpbmVyJyksIGxlbiA9ICRjb250YWluZXJzRXBpc29kZS5sZW5ndGgsIGN1cnJlbnRTaG93SWRzID0ge307XHJcbiAgICAgICAgLy8gRW4gYXR0ZW50ZSBkdSBjaGFyZ2VtZW50IGRlcyDDqXBpc29kZXNcclxuICAgICAgICBpZiAobGVuID4gMCkge1xyXG4gICAgICAgICAgICBpZiAoZGVidWcpXHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygndXBkYXRlQWdlbmRhIC0gbmIgY29udGFpbmVyczogJWQnLCBsZW4pO1xyXG4gICAgICAgICAgICBjbGVhckludGVydmFsKHRpbWVyVUEpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKGRlYnVnKVxyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3VwZGF0ZUFnZW5kYSBlbiBhdHRlbnRlJyk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgcGFyYW1zID0ge1xyXG4gICAgICAgICAgICBsaW1pdDogMSxcclxuICAgICAgICAgICAgb3JkZXI6ICdzbWFydCcsXHJcbiAgICAgICAgICAgIHNob3dzTGltaXQ6IGxlbixcclxuICAgICAgICAgICAgcmVsZWFzZWQ6IDEsXHJcbiAgICAgICAgICAgIHNwZWNpYWxzOiBmYWxzZSxcclxuICAgICAgICAgICAgc3VidGl0bGVzOiAnYWxsJ1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgQmFzZV8xLkJhc2UuY2FsbEFwaSgnR0VUJywgJ2VwaXNvZGVzJywgJ2xpc3QnLCBwYXJhbXMpXHJcbiAgICAgICAgICAgIC50aGVuKChkYXRhKSA9PiB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHQgPSAwOyB0IDwgbGVuOyB0KyspIHtcclxuICAgICAgICAgICAgICAgICQoJGNvbnRhaW5lcnNFcGlzb2RlLmdldCh0KSlcclxuICAgICAgICAgICAgICAgICAgICAuZGF0YSgnc2hvd0lkJywgZGF0YS5zaG93c1t0XS5pZClcclxuICAgICAgICAgICAgICAgICAgICAuZGF0YSgnY29kZScsIGRhdGEuc2hvd3NbdF0udW5zZWVuWzBdLmNvZGUudG9Mb3dlckNhc2UoKSk7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50U2hvd0lkc1tkYXRhLnNob3dzW3RdLmlkXSA9IHsgY29kZTogZGF0YS5zaG93c1t0XS51bnNlZW5bMF0uY29kZS50b0xvd2VyQ2FzZSgpIH07XHJcbiAgICAgICAgICAgICAgICAvL2lmIChkZWJ1ZykgY29uc29sZS5sb2coJ3RpdGxlOiAlcyAtIGNvZGU6ICVzJywgdGl0bGUsIGVwaXNvZGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgaWYgKCQoJy51cGRhdGVFbGVtZW50cycpLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAvLyBPbiBham91dGUgbGUgYm91dG9uIGRlIG1pc2Ugw6Agam91ciBkZXMgc2ltaWxhaXJlc1xyXG4gICAgICAgICAgICAkKCcubWFpbnRpdGxlID4gZGl2Om50aC1jaGlsZCgxKScpLmFmdGVyKGBcclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ1cGRhdGVFbGVtZW50c1wiPlxyXG4gICAgICAgICAgICAgICAgICA8aW1nIHNyYz1cIiR7c2VydmVyQmFzZVVybH0vaW1nL3VwZGF0ZS5wbmdcIiB3aWR0aD1cIjIwXCIgY2xhc3M9XCJ1cGRhdGVFcGlzb2RlcyB1cGRhdGVFbGVtZW50IGZpbmlzaFwiIHRpdGxlPVwiTWlzZSDDoCBqb3VyIGRlcyBzaW1pbGFpcmVzIHZ1c1wiLz5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICBgKTtcclxuICAgICAgICAgICAgYWRkU2NyaXB0QW5kTGluaygnbW9tZW50Jyk7XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgYWRkU2NyaXB0QW5kTGluaygnbG9jYWxlZnInKTtcclxuICAgICAgICAgICAgfSwgMjUwKTtcclxuICAgICAgICAgICAgJCgnLnVwZGF0ZUVwaXNvZGVzJykuY2xpY2soKGUpID0+IHtcclxuICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGVidWcpXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5ncm91cENvbGxhcHNlZCgnQWdlbmRhIHVwZGF0ZUVwaXNvZGVzJyk7XHJcbiAgICAgICAgICAgICAgICAkY29udGFpbmVyc0VwaXNvZGUgPSAkKCcjcmVhY3Rqcy1lcGlzb2Rlcy10by13YXRjaCAuQ29tcG9uZW50RXBpc29kZUNvbnRhaW5lcicpO1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc2VsZiA9ICQoZS5jdXJyZW50VGFyZ2V0KSwgbGVuID0gJGNvbnRhaW5lcnNFcGlzb2RlLmxlbmd0aDtcclxuICAgICAgICAgICAgICAgIHNlbGYucmVtb3ZlQ2xhc3MoJ2ZpbmlzaCcpO1xyXG4gICAgICAgICAgICAgICAgbGV0IGNvdW50SW50VGltZSA9IDA7XHJcbiAgICAgICAgICAgICAgICBNZWRpYV8xLk1lZGlhLmNhbGxBcGkoJ0dFVCcsICdlcGlzb2RlcycsICdsaXN0JywgeyBsaW1pdDogMSwgb3JkZXI6ICdzbWFydCcsIHNob3dzTGltaXQ6IGxlbiwgcmVsZWFzZWQ6IDEsIHNwZWNpYWxzOiBmYWxzZSwgc3VidGl0bGVzOiAnYWxsJyB9KVxyXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKChkYXRhKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGludFRpbWUgPSBzZXRJbnRlcnZhbChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICgrK2NvdW50SW50VGltZSA+IDYwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKGludFRpbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5hZGRDbGFzcygnZmluaXNoJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub3RpZmljYXRpb24oJ0VycmV1ciBkZSBtaXNlIMOgIGpvdXIgZGVzIMOpcGlzb2RlcycsICd1cGRhdGVBZ2VuZGE6IHVwZGF0ZUVwaXNvZGVzLmNsaWNrIGludGVydmFsIHRpbWUgb3ZlcicpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRlYnVnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZ3JvdXBFbmQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIG1vbWVudCAhPT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaW50VGltZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vbWVudC5sb2NhbGUoJ2ZyJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBuZXdTaG93SWRzID0ge30sIHNob3c7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkZWJ1ZylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCd1cGRhdGVBZ2VuZGEgdXBkYXRlRXBpc29kZXMnLCBkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgcyA9IDA7IHMgPCBkYXRhLnNob3dzLmxlbmd0aDsgcysrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaG93ID0gZGF0YS5zaG93c1tzXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld1Nob3dJZHNbc2hvdy5pZF0gPSB7IGNvZGU6IHNob3cudW5zZWVuWzBdLmNvZGUudG9Mb3dlckNhc2UoKSB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRTaG93SWRzW3Nob3cuaWRdID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGVidWcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdVbmUgbm91dmVsbGUgc8OpcmllIGVzdCBhcnJpdsOpZScsIHNob3cpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIElsIHMnYWdpdCBkJ3VuZSBub3V2ZWxsZSBzw6lyaWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBUT0RPIEFqb3V0ZXIgdW4gbm91dmVhdSBjb250YWluZXJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgbmV3Q29udGFpbmVyID0gJChidWlsZENvbnRhaW5lcihzaG93LnVuc2VlblswXSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbmRlck5vdGUoc2hvdy51bnNlZW5bMF0ubm90ZS5tZWFuLCBuZXdDb250YWluZXIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoJGNvbnRhaW5lcnNFcGlzb2RlLmdldChzKSkucGFyZW50KCkuYWZ0ZXIobmV3Q29udGFpbmVyKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGVidWcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnSXRlcmF0aW9uIHByaW5jaXBhbGUnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNvbnRhaW5lciwgdW5zZWVuO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJdMOpcmF0aW9uIHByaW5jaXBhbGUgc3VyIGxlcyBjb250YWluZXJzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGUgPSAwOyBlIDwgbGVuOyBlKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lciA9ICQoJGNvbnRhaW5lcnNFcGlzb2RlLmdldChlKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1bnNlZW4gPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU2kgbGEgc2VyaWUgbidlc3QgcGx1cyBkYW5zIGxhIGxpc3RlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3U2hvd0lkc1tjb250YWluZXIuZGF0YSgnc2hvd0lkJyldID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGVidWcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdMYSBzw6lyaWUgJWQgbmUgZmFpdCBwbHVzIHBhcnRpZSBkZSBsYSBsaXN0ZScsIGNvbnRhaW5lci5kYXRhKCdzaG93SWQnKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyLnBhcmVudCgpLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvbnRhaW5lci5kYXRhKCdzaG93SWQnKSA9PSBkYXRhLnNob3dzW2VdLmlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdW5zZWVuID0gZGF0YS5zaG93c1tlXS51bnNlZW5bMF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCB1ID0gMDsgdSA8IGxlbjsgdSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb250YWluZXIuZGF0YSgnc2hvd0lkJykgPT0gZGF0YS5zaG93c1t1XS5pZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdW5zZWVuID0gZGF0YS5zaG93c1t1XS51bnNlZW5bMF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh1bnNlZW4gJiYgY29udGFpbmVyLmRhdGEoJ2NvZGUnKSAhPT0gdW5zZWVuLmNvZGUudG9Mb3dlckNhc2UoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkZWJ1ZylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0VwaXNvZGUgw6AgbWV0dHJlIMOgIGpvdXInLCB1bnNlZW4pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE1ldHRyZSDDoCBqb3VyIGwnw6lwaXNvZGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgbWFpbkxpbmsgPSAkKCdhLm1haW5MaW5rJywgY29udGFpbmVyKSwgdGV4dCA9IHVuc2Vlbi5jb2RlICsgJyAtICcgKyB1bnNlZW4udGl0bGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gT24gbWV0IMOgIGpvdXIgbGUgdGl0cmUgZXQgbGUgbGllbiBkZSBsJ8OpcGlzb2RlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFpbkxpbmsuYXR0cignaHJlZicsIG1haW5MaW5rLmF0dHIoJ2hyZWYnKS5yZXBsYWNlKC9zXFxkezJ9ZVxcZHsyfS8sIHVuc2Vlbi5jb2RlLnRvTG93ZXJDYXNlKCkpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYWluTGluay5hdHRyKCd0aXRsZScsIGBBY2PDqWRlciDDoCBsYSBmaWNoZSBkZSBsJ8OpcGlzb2RlICR7dGV4dH1gKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYWluTGluay50ZXh0KHRleHQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE9uIG1ldCDDoCBqb3VyIGxhIGRhdGUgZGUgc29ydGllXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJCgnLmRhdGUgLm1haW5UaW1lJywgY29udGFpbmVyKS50ZXh0KG1vbWVudCh1bnNlZW4uZGF0ZSkuZm9ybWF0KCdEIE1NTU0gWVlZWScpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBPbiBtZXQgw6Agam91ciBsYSBzeW5vcHNpc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoJy5tX3MgcC5tX2F5JywgY29udGFpbmVyKS5odG1sKHVuc2Vlbi5kZXNjcmlwdGlvbik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gT24gbWV0IMOgIGpvdXIgbGEgYmFycmUgZGUgcHJvZ3Jlc3Npb25cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKCcubWVkaWEtbGVmdCA+IC5tX2FiID4gLm1fYWcnLCBjb250YWluZXIpLmNzcygnd2lkdGgnLCBTdHJpbmcodW5zZWVuLnNob3cucHJvZ3Jlc3MpICsgJyUnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBPbiBtZXQgw6Agam91ciBsYSBub3RlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVuZGVyTm90ZSh1bnNlZW4ubm90ZS5tZWFuLCBjb250YWluZXIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0VwaXNvZGUgU2hvdyB1bmNoYW5nZWQnLCB1bnNlZW4pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZuTGF6eS5pbml0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuYWRkQ2xhc3MoJ2ZpbmlzaCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGVidWcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmdyb3VwRW5kKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSwgNTAwKTtcclxuICAgICAgICAgICAgICAgIH0sIChlcnIpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBub3RpZmljYXRpb24oJ0VycmV1ciBkZSBtaXNlIMOgIGpvdXIgZGVzIMOpcGlzb2RlcycsICd1cGRhdGVBZ2VuZGE6ICcgKyBlcnIpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChkZWJ1ZylcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5ncm91cEVuZCgpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBQZXJtZXQgZCdhZmZpY2hlciB1bmUgbm90ZSBhdmVjIGRlcyDDqXRvaWxlc1xyXG4gICAgICAgICAqIEBwYXJhbSAge051bWJlcn0gbm90ZSAgICAgIExhIG5vdGUgw6AgYWZmaWNoZXJcclxuICAgICAgICAgKiBAcGFyYW0gIHtPYmplY3R9IGNvbnRhaW5lciBET01FbGVtZW50IGNvbnRlbmFudCBsYSBub3RlIMOgIGFmZmljaGVyXHJcbiAgICAgICAgICogQHJldHVybiB7dm9pZH1cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiByZW5kZXJOb3RlKG5vdGUsIGNvbnRhaW5lcikge1xyXG4gICAgICAgICAgICBjb25zdCByZW5kZXJTdGFycyA9ICQoJy5kYXRlIC5zdGFycycsIGNvbnRhaW5lcik7XHJcbiAgICAgICAgICAgIGlmIChyZW5kZXJTdGFycy5sZW5ndGggPD0gMCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJlbmRlclN0YXJzLmVtcHR5KCk7XHJcbiAgICAgICAgICAgIHJlbmRlclN0YXJzLmF0dHIoJ3RpdGxlJywgYCR7cGFyc2VGbG9hdChub3RlKS50b0ZpeGVkKDEpfSAvIDVgKTtcclxuICAgICAgICAgICAgbGV0IHR5cGVTdmc7XHJcbiAgICAgICAgICAgIEFycmF5LmZyb20oe1xyXG4gICAgICAgICAgICAgICAgbGVuZ3RoOiA1XHJcbiAgICAgICAgICAgIH0sIChpbmRleCwgbnVtYmVyKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0eXBlU3ZnID0gbm90ZSA8PSBudW1iZXIgPyBcImVtcHR5XCIgOiAobm90ZSA8IG51bWJlciArIDEpID8gJ2hhbGYnIDogXCJmdWxsXCI7XHJcbiAgICAgICAgICAgICAgICByZW5kZXJTdGFycy5hcHBlbmQoYFxyXG4gICAgICAgICAgICAgICAgICAgIDxzdmcgdmlld0JveD1cIjAgMCAxMDAgMTAwXCIgY2xhc3M9XCJzdGFyLXN2Z1wiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPHVzZSB4bWxuczp4bGluaz1cImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmtcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICB4bGluazpocmVmPVwiI2ljb24tc3Rhci0ke3R5cGVTdmd9XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8L3VzZT5cclxuICAgICAgICAgICAgICAgICAgICA8L3N2Zz5cclxuICAgICAgICAgICAgICAgIGApO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUGVybWV0IGRlIGNvbnN0cnVpcmUgbGUgY29udGFpbmVyIGQndW4gZXBpc29kZVxyXG4gICAgICAgICAqIEBwYXJhbSAge09iamVjdH0gdW5zZWVuIENvcnJlc3BvbmQgw6AgbCdvYmpldCBFcGlzb2RlIG5vbiB2dVxyXG4gICAgICAgICAqIEByZXR1cm4ge1N0cmluZ31cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBidWlsZENvbnRhaW5lcih1bnNlZW4pIHtcclxuICAgICAgICAgICAgbGV0IGRlc2NyaXB0aW9uID0gdW5zZWVuLmRlc2NyaXB0aW9uO1xyXG4gICAgICAgICAgICBpZiAoZGVzY3JpcHRpb24ubGVuZ3RoIDw9IDApIHtcclxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uID0gJ0F1Y3VuZSBkZXNjcmlwdGlvbic7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoZGVzY3JpcHRpb24ubGVuZ3RoID4gMTQ1KSB7XHJcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbiA9IGRlc2NyaXB0aW9uLnN1YnN0cmluZygwLCAxNDUpICsgJ+KApic7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgdXJsU2hvdyA9IHVuc2Vlbi5yZXNvdXJjZV91cmwucmVwbGFjZSgnZXBpc29kZScsICdzZXJpZScpLnJlcGxhY2UoL1xcL3NcXGR7Mn1lXFxkezJ9JC8sICcnKTtcclxuICAgICAgICAgICAgbGV0IHRlbXBsYXRlID0gYFxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYTZfYmEgZGlzcGxheUZsZXgganVzdGlmeUNvbnRlbnRTcGFjZUJldHdlZW5cIiBzdHlsZT1cIm9wYWNpdHk6IDE7IHRyYW5zaXRpb246IG9wYWNpdHkgMzAwbXMgZWFzZS1vdXQgMHMsIHRyYW5zZm9ybTtcIj5cclxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYTZfYTggQ29tcG9uZW50RXBpc29kZUNvbnRhaW5lciBtZWRpYVwiPlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1lZGlhLWxlZnRcIj5cclxuICAgICAgICAgICAgICAgICAgPGltZyBjbGFzcz1cImpzLWxhenktaW1hZ2UgZ3JleUJvcmRlciBhNl9hMlwiIGRhdGEtc3JjPVwiaHR0cHM6Ly9hcGkuYmV0YXNlcmllcy5jb20vcGljdHVyZXMvc2hvd3M/a2V5PSR7YmV0YXNlcmllc19hcGlfdXNlcl9rZXl9JmlkPSR7dW5zZWVuLnNob3cuaWR9JndpZHRoPTExOSZoZWlnaHQ9MTc0XCIgd2lkdGg9XCIxMTlcIiBoZWlnaHQ9XCIxNzRcIiBhbHQ9XCJBZmZpY2hlIGRlIGxhIHPDqXJpZSAke3Vuc2Vlbi5zaG93LnRpdGxlfVwiPlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYTZfYmMgbWVkaWEtYm9keSBhbGlnblNlbGZTdHJldGNoIGRpc3BsYXlGbGV4IGZsZXhEaXJlY3Rpb25Db2x1bW5cIj5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1lZGlhXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1lZGlhLWJvZHkgbWluV2lkdGgwIGFsaWduU2VsZlN0cmV0Y2ggZGlzcGxheUZsZXggZmxleERpcmVjdGlvbkNvbHVtbiBhbGlnbkl0ZW1zRmxleFN0YXJ0XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8YSBjbGFzcz1cImE2X2JwIGRpc3BsYXlCbG9jayBuZFwiIGhyZWY9XCIke3VybFNob3d9XCIgdGl0bGU9XCIke3RyYW5zKFwiYWdlbmRhLmVwaXNvZGVzX3dhdGNoLnNob3dfbGlua190aXRsZVwiLCB7IHRpdGxlOiB1bnNlZW4uc2hvdy50aXRsZSB9KX1cIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHN0cm9uZz4ke3Vuc2Vlbi5zaG93LnRpdGxlfTwvc3Ryb25nPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPC9hPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPGEgY2xhc3M9XCJhNl9icCBhNl9hayBtYWluTGluayBkaXNwbGF5QmxvY2sgbmRcIiBocmVmPVwiJHt1bnNlZW4ucmVzb3VyY2VfdXJsfVwiIHRpdGxlPVwiJHt0cmFucyhcImFnZW5kYS5lcGlzb2Rlc193YXRjaC5lcGlzb2RlX2xpbmtfdGl0bGVcIiwgeyBjb2RlOiB1bnNlZW4uY29kZS50b1VwcGVyQ2FzZSgpLCB0aXRsZTogdW5zZWVuLnRpdGxlIH0pfVwiPiR7dW5zZWVuLmNvZGUudG9VcHBlckNhc2UoKX0gLSAke3Vuc2Vlbi50aXRsZX08L2E+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGF0ZSBkaXNwbGF5RmxleCBhNl9idlwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8dGltZSBjbGFzcz1cIm1haW5UaW1lXCI+JHttb21lbnQodW5zZWVuLmRhdGUpLmZvcm1hdCgnRCBNTU1NIFlZWVknKX08L3RpbWU+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwic3RhcnNcIiB0aXRsZT1cIlwiPjwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJhNl9iaCBtZWRpYS1yaWdodFwiIGRhdGEtdG91cj1cInN0ZXA6IDY7IHRpdGxlOiAke3RyYW5zKFwidG91cmd1aWRlLnNlcmllcy1hZ2VuZGEuNi50aXRsZVwiKX07IGNvbnRlbnQ6ICR7dHJhbnMoXCJ0b3VyZ3VpZGUuc2VyaWVzLWFnZW5kYS42LmNvbnRlbnRcIil9O1wiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRpc3BsYXlGbGV4IGFsaWduSXRlbXNDZW50ZXJcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4tcmVzZXQgYWxpZ25TZWxmQ2VudGVyIGlqX2lsIGlqX2luXCI+PC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDxwIGNsYXNzPVwiYTZfYnRcIiBzdHlsZT1cIm1hcmdpbjogMTFweCAwcHggMTBweDtcIj4ke2Rlc2NyaXB0aW9ufTwvcD5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1lZGlhXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1lZGlhLWxlZnQgYWxpZ25TZWxmQ2VudGVyXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYTZfYmpcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImE2X2JuXCIgc3R5bGU9XCJ3aWR0aDogJHt1bnNlZW4uc2hvdy5wcm9ncmVzc30lO1wiPjwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1lZGlhLWJvZHkgYWxpZ25TZWxmQ2VudGVyIGRpc3BsYXlGbGV4IGZsZXhEaXJlY3Rpb25Db2x1bW4gYWxpZ25JdGVtc0ZsZXhTdGFydFwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJhNl9ibFwiPiR7c2Vjb25kc1RvRGhtcyh1bnNlZW4uc2hvdy5taW51dGVzX3JlbWFpbmluZyAqIDYwKX0gKCR7dW5zZWVuLnNob3cucmVtYWluaW5nfSDDqXAuKTwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtZWRpYVwiIHN0eWxlPVwibWFyZ2luLXRvcDogOXB4O1wiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtZWRpYS1ib2R5IGFsaWduU2VsZkNlbnRlclwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImxpc3RBdmF0YXJzIGxpc3RBdmF0YXJzLS1zbWFsbCBtYXJnaW5Ub3BBdXRvXCI+JHt3YXRjaGVkQXZhdGFyKHVuc2Vlbi53YXRjaGVkX2J5KX08L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYTZfYXEgbWVkaWEtcmlnaHQgYWxpZ25TZWxmQ2VudGVyIHBvc2l0aW9uUmVsYXRpdmVcIiBkYXRhLXRvdXI9XCJzdGVwOiA1OyB0aXRsZTogTWFzcXVlciB1biDDqXBpc29kZTsgY29udGVudDogU2kgdm91cyBsZSBzb3VoYWl0ZXosIGNob2lzaXNzZXogZGUgbWFzcXVlciBjZXQgw6lwaXNvZGUgZGUgdm90cmUgbGlzdGUgZOKAmcOpcGlzb2RlcyDDoCByZWdhcmRlciBvdSByZXRyb3V2ZXotZW4gbGVzIHNvdXMtdGl0cmVzLjtcIj5cclxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkaXNwbGF5RmxleFwiPmA7XHJcbiAgICAgICAgICAgIGlmICh1bnNlZW4uc3VidGl0bGVzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIHRlbXBsYXRlICs9IGBcclxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInN2Z0NvbnRhaW5lciBhNl8wXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHN2ZyBjbGFzcz1cIlN2Z1N1YnRpdGxlc1wiIHdpZHRoPVwiMjBcIiBoZWlnaHQ9XCIxNlwiIHZpZXdCb3g9XCIwIDAgMjAgMTZcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZyBmaWxsPVwibm9uZVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPVwiTTIuMDgzLjc1MWMyLjM4OS0uNTAxIDUuMDI4LS43NTEgNy45MTctLjc1MSAyLjkzOSAwIDUuNjE5LjI1OSA4LjA0Ljc3OC43NS4xNjEgMS4zNDIuNzM2IDEuNTI0IDEuNDgxLjI5IDEuMTg4LjQzNSAzLjEwMi40MzUgNS43NDJzLS4xNDUgNC41NTQtLjQzNSA1Ljc0MmMtLjE4Mi43NDUtLjc3NCAxLjMyLTEuNTI0IDEuNDgxLTIuNDIxLjUxOC01LjEwMS43NzgtOC4wNC43NzgtMi44OSAwLTUuNTI5LS4yNS03LjkxNy0uNzUxLS43MzQtLjE1NC0xLjMyMS0uNzA2LTEuNTE5LTEuNDMtLjM3Ni0xLjM3NS0uNTY0LTMuMzE1LS41NjQtNS44MTlzLjE4OC00LjQ0My41NjQtNS44MTljLjE5OC0uNzI0Ljc4NC0xLjI3NiAxLjUxOS0xLjQzelwiPjwvcGF0aD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHBhdGggY2xhc3M9XCJTdmdTdWJ0aXRsZXNfX3N0cm9rZVwiIHN0cm9rZT1cIiNDMUUxRkFcIiBkPVwiTTIuMjM3IDEuNDg1Yy0uNDU5LjA5Ni0uODI1LjQ0MS0uOTQ5Ljg5NC0uMzU2IDEuMy0uNTM4IDMuMTc4LS41MzggNS42MjEgMCAyLjQ0My4xODIgNC4zMjEuNTM4IDUuNjIxLjEyNC40NTIuNDkuNzk3Ljk0OS44OTQgMi4zMzYuNDkgNC45MjMuNzM1IDcuNzYzLjczNSAyLjg4OSAwIDUuNTE2LS4yNTQgNy44ODMtLjc2MS40NjktLjEuODM5LS40Ni45NTMtLjkyNi4yNzMtMS4xMTYuNDE0LTIuOTc5LjQxNC01LjU2NCAwLTIuNTg0LS4xNDEtNC40NDctLjQxNC01LjU2My0uMTE0LS40NjYtLjQ4NC0uODI1LS45NTMtLjkyNi0yLjM2Ny0uNTA3LTQuOTk1LS43NjEtNy44ODMtLjc2MS0yLjg0IDAtNS40MjguMjQ2LTcuNzYzLjczNXpcIj48L3BhdGg+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwYXRoIGNsYXNzPVwiU3ZnU3VidGl0bGVzX19maWxsXCIgZmlsbD1cIiNDMUUxRkFcIiBkPVwiTTQgN2gxMnYyaC0xMnptMiAzaDh2MmgtOHpcIj48L3BhdGg+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2c+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zdmc+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PmA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGVtcGxhdGUgKz0gYFxyXG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1lZGlhLXJpZ2h0IGFsaWduU2VsZkNlbnRlciBwb3NpdGlvblJlbGF0aXZlXCIgc3R5bGU9XCJtaW4taGVpZ2h0OiAyNHB4O1wiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInBvc2l0aW9uUmVsYXRpdmVcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImJ0bi1ncm91cFwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gaWQ9XCJkcm9wZG93blN1YnRpdGxlLTg4OTlcIiByb2xlPVwiYnV0dG9uXCIgYXJpYS1oYXNwb3B1cD1cInRydWVcIiBhcmlhLWV4cGFuZGVkPVwiZmFsc2VcIiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJhNl9hcyBidG4tcmVzZXQgZHJvcGRvd24tdG9nZ2xlIC10b2dnbGUgYnRuIGJ0bi1kZWZhdWx0XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInN2Z0NvbnRhaW5lclwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3ZnIGZpbGw9XCIjOTk5XCIgd2lkdGg9XCI0XCIgaGVpZ2h0PVwiMTZcIiB2aWV3Qm94PVwiMCAwIDQgMTZcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHBhdGggZD1cIk0yIDRjMS4xIDAgMi0uOSAyLTJzLS45LTItMi0yLTIgLjktMiAyIC45IDIgMiAyem0wIDJjLTEuMSAwLTIgLjktMiAycy45IDIgMiAyIDItLjkgMi0yLS45LTItMi0yem0wIDZjLTEuMSAwLTIgLjktMiAycy45IDIgMiAyIDItLjkgMi0yLS45LTItMi0yelwiIGZpbGwtcnVsZT1cIm5vbnplcm9cIiBmaWxsPVwiaW5oZXJpdFwiPjwvcGF0aD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zdmc+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImNhcmV0XCI+PC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDx1bCByb2xlPVwibWVudVwiIGNsYXNzPVwiLW1lbnVcIiBhcmlhLWxhYmVsbGVkYnk9XCJkcm9wZG93blN1YnRpdGxlLTg4OTlcIj48L3VsPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRyb3Bkb3duLW1lbnUgZHJvcGRvd24tbWVudS0tdG9wUmlnaHQgaG9faHlcIiBhcmlhLWxhYmVsbGVkYnk9XCJkcm9wZG93blN1YnRpdGxlLTg4OTlcIiBzdHlsZT1cInRvcDogMHB4O1wiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzb3VzVGl0cmVzXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiaG9faHVcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJob19nIGJ0bi1yZXNldCBidG4tYnRuIGJ0bi0tZ3JleVwiPk5lIHBhcyByZWdhcmRlciBjZXQgw6lwaXNvZGU8L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJob19nIGJ0bi1yZXNldCBidG4tYnRuIGJ0bi1ibHVlMlwiPkonYWkgcsOpY3Vww6lyw6kgY2V0IMOpcGlzb2RlPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICR7cmVuZGVyU3VidGl0bGVzKHVuc2Vlbil9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICBgO1xyXG4gICAgICAgICAgICByZXR1cm4gdGVtcGxhdGU7XHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIHdhdGNoZWRBdmF0YXIoZnJpZW5kcykge1xyXG4gICAgICAgICAgICAgICAgbGV0IHRlbXBsYXRlID0gJycsIGZyaWVuZDtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGYgPSAwOyBmIDwgZnJpZW5kcy5sZW5ndGg7IGYrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGZyaWVuZCA9IGZyaWVuZHNbZl07XHJcbiAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGUgKz0gYFxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8YSBocmVmPVwiL21lbWJyZS8ke2ZyaWVuZC5sb2dpbn1cIiBjbGFzcz1cImxpc3RBdmF0YXJcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICA8aW1nIGNsYXNzPVwianMtbGF6eS1pbWFnZVwiIGRhdGEtc3JjPVwiaHR0cHM6Ly9hcGkuYmV0YXNlcmllcy5jb20vcGljdHVyZXMvbWVtYmVycz9rZXk9JHtiZXRhc2VyaWVzX2FwaV91c2VyX2tleX0maWQ9JHtmcmllbmQuaWR9JndpZHRoPTI0JmhlaWdodD0yNCZwbGFjZWhvbGRlcj1wbmdcIiB3aWR0aD1cIjI0XCIgaGVpZ2h0PVwiMjRcIiBhbHQ9XCJBdmF0YXIgZGUgJHtmcmllbmQubG9naW59XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvYT5gO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRlbXBsYXRlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIHNlY29uZHNUb0RobXMoc2Vjb25kcykge1xyXG4gICAgICAgICAgICAgICAgc2Vjb25kcyA9IE51bWJlcihzZWNvbmRzKTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGQgPSBNYXRoLmZsb29yKHNlY29uZHMgLyAoMzYwMCAqIDI0KSksIGggPSBNYXRoLmZsb29yKHNlY29uZHMgJSAoMzYwMCAqIDI0KSAvIDM2MDApLCBtID0gTWF0aC5mbG9vcihzZWNvbmRzICUgMzYwMCAvIDYwKTtcclxuICAgICAgICAgICAgICAgIC8vcyA9IE1hdGguZmxvb3Ioc2Vjb25kcyAlIDYwKTtcclxuICAgICAgICAgICAgICAgIGxldCBkRGlzcGxheSA9IGQgPiAwID8gZCArICcgaiAnIDogJycsIGhEaXNwbGF5ID0gaCA+IDAgPyBoICsgJyBoICcgOiAnJywgbURpc3BsYXkgPSBtID49IDAgJiYgZCA8PSAwID8gbSArICcgbWluJyA6ICcnO1xyXG4gICAgICAgICAgICAgICAgLy9zRGlzcGxheSA9IHMgPiAwID8gcyArIChzID09IDEgPyBcIiBzZWNvbmRcIiA6IFwiIHNlY29uZHNcIikgOiBcIlwiO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGREaXNwbGF5ICsgaERpc3BsYXkgKyBtRGlzcGxheTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmdW5jdGlvbiByZW5kZXJTdWJ0aXRsZXModW5zZWVuKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodW5zZWVuLnN1YnRpdGxlcy5sZW5ndGggPD0gMClcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJyc7XHJcbiAgICAgICAgICAgICAgICBsZXQgdGVtcGxhdGUgPSBgXHJcbiAgICAgICAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiaG9fZ2ggQ29tcG9uZW50VGl0bGVEcm9wZG93blwiPlNvdXMtdGl0cmVzIGRlIGwnw6lwaXNvZGU8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT1cImRpc3BsYXk6IGdyaWQ7IHJvdy1nYXA6IDVweDtcIj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibWF4SGVpZ2h0MjgwcHggb3ZlcmZsb3dZU2Nyb2xsXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2PmA7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBzdCA9IDA7IHN0IDwgdW5zZWVuLnN1YnRpdGxlcy5sZW5ndGg7IHN0KyspIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgc3VidGl0bGUgPSB1bnNlZW4uc3VidGl0bGVzW3N0XTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc3QgPiAwKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZSArPSAnPGRpdiBzdHlsZT1cIm1hcmdpbi10b3A6IDVweDtcIj4nO1xyXG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlICs9IGBcclxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT1cImFsaWduLWl0ZW1zOiBjZW50ZXI7IGRpc3BsYXk6IGZsZXg7IGp1c3RpZnktY29udGVudDogZmxleC1zdGFydDtcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwic3ZnQ29udGFpbmVyXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3ZnIGNsYXNzPVwiU3ZnUGVydGluZW5jZVwiIGZpbGw9XCIjRUVFXCIgd2lkdGg9XCIxNlwiIGhlaWdodD1cIjE2XCIgdmlld0JveD1cIjAgMCAxNiAxNlwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHJlY3QgZmlsbD1cIiR7c3VidGl0bGUucXVhbGl0eSA+PSAxID8gJyM5OTknIDogJ2luaGVyaXQnfVwiIHg9XCIwXCIgeT1cIjEwXCIgd2lkdGg9XCI0XCIgaGVpZ2h0PVwiNlwiPjwvcmVjdD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHJlY3QgZmlsbD1cIiR7c3VidGl0bGUucXVhbGl0eSA+PSAzID8gJyM5OTknIDogJ2luaGVyaXQnfVwiIHg9XCI2XCIgeT1cIjVcIiB3aWR0aD1cIjRcIiBoZWlnaHQ9XCIxMVwiPjwvcmVjdD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHJlY3QgZmlsbD1cIiR7c3VidGl0bGUucXVhbGl0eSA+PSA1ID8gJyM5OTknIDogJ2luaGVyaXQnfVwiIHg9XCIxMlwiIHk9XCIwXCIgd2lkdGg9XCI0XCIgaGVpZ2h0PVwiMTZcIj48L3JlY3Q+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3N2Zz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiQ29tcG9uZW50TGFuZ1wiIHN0eWxlPVwiYm9yZGVyOiAxcHggc29saWQgY3VycmVudGNvbG9yOyBib3JkZXItcmFkaXVzOiA0cHg7IGNvbG9yOiByZ2IoNTEsIDUxLCA1MSk7IGZsZXgtc2hyaW5rOiAwOyBmb250LXNpemU6IDEwcHg7IGZvbnQtd2VpZ2h0OiA3MDA7IGhlaWdodDogMThweDsgbGluZS1oZWlnaHQ6IDE3cHg7IG1hcmdpbjogMHB4IDEwcHggMHB4IDVweDsgbWluLXdpZHRoOiAyMnB4OyBwYWRkaW5nOiAwcHggM3B4OyB0ZXh0LWFsaWduOiBjZW50ZXI7XCI+JHtzdWJ0aXRsZS5sYW5ndWFnZX08L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibWluV2lkdGgwXCIgc3R5bGU9XCJmbGV4LWdyb3c6IDE7XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YSBocmVmPVwiJHtzdWJ0aXRsZS51cmx9XCIgY2xhc3M9XCJkaXNwbGF5QmxvY2sgbWFpbkxpbmsgbmRcIiB0aXRsZT1cIlByb3ZlbmFuY2UgOiAke3N1YnRpdGxlLnNvdXJjZX0gLyAke3N1YnRpdGxlLmZpbGV9IC8gQWpvdXTDqSBsZSAke21vbWVudChzdWJ0aXRsZS5kYXRlKS5mb3JtYXQoJ0REL01NL1lZWVknKX1cIiBzdHlsZT1cIm1heC13aWR0aDogMzY1cHg7IG1hcmdpbjogMHB4OyBmb250LXNpemU6IDEycHg7XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICR7ZWxsaXBzaXNTdWJ0aXRsZXMoc3VidGl0bGUpfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9hPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gdGl0bGU9XCJTaWduYWxlciBjZSBzb3VzLXRpdHJlXCIgdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuLXJlc2V0XCIgb25jbGljaz1cInNydEluYWNjdXJhdGUoJHtzdWJ0aXRsZS5pZH0pO1wiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJzdmdDb250YWluZXJcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHN2ZyBmaWxsPVwiI2VlZVwiIHdpZHRoPVwiMjJcIiBoZWlnaHQ9XCIxOVwiIHZpZXdCb3g9XCIwIDAgMjIgMTlcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHBhdGggZD1cIk0wIDE5aDIybC0xMS0xOS0xMSAxOXptMTItM2gtMnYtMmgydjJ6bTAtNGgtMnYtNGgydjR6XCIgZmlsbC1ydWxlPVwibm9uemVyb1wiIGZpbGw9XCJpbmhlcml0XCI+PC9wYXRoPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3N2Zz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZSArPSBgXHJcbiAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIGA7XHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBlbGxpcHNpc1N1YnRpdGxlcyhzdWJ0aXRsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBzdWJ0aXRsZU5hbWUgPSBzdWJ0aXRsZS5maWxlLCBMSU1JVF9FTExJUFNJUyA9IDUwO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzdWJ0aXRsZU5hbWUubGVuZ3RoIDw9IExJTUlUX0VMTElQU0lTKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBgPGRpdiBjbGFzcz1cIm5kIGRpc3BsYXlJbmxpbmVCbG9ja1wiPiR7c3VidGl0bGVOYW1lfTwvZGl2PmA7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBMRU5HVEhfTEFTVF9FTExJUFNJUyA9IDQ1O1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBgXHJcbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibmQgZGlzcGxheUlubGluZUJsb2NrXCIgc3R5bGU9XCJtYXgtd2lkdGg6IDQwcHg7XCI+JHtzdWJ0aXRsZU5hbWV9PC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJuZCBkaXNwbGF5SW5saW5lQmxvY2tcIj4ke3N1YnRpdGxlTmFtZS5zbGljZSgtTEVOR1RIX0xBU1RfRUxMSVBTSVMpfTwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgYDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiB0ZW1wbGF0ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogQWpvdXRlIGxlIHN0YXR1dCBkZSBsYSBzw6lyaWUgc3VyIGxhIHBhZ2UgZGUgZ2VzdGlvbiBkZXMgc8OpcmllcyBkZSBsJ3V0aWxpc2F0ZXVyXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGFkZFN0YXR1c1RvR2VzdGlvblNlcmllcygpIHtcclxuICAgICAgICAvLyBPbiB2w6lyaWZpZSBxdWUgbCd1dGlsaXNhdGV1ciBlc3QgY29ubmVjdMOpIGV0IHF1ZSBsYSBjbMOpIGQnQVBJIGVzdCByZW5zZWlnbsOpZVxyXG4gICAgICAgIGlmICghdXNlcklkZW50aWZpZWQoKSB8fCBiZXRhc2VyaWVzX2FwaV91c2VyX2tleSA9PT0gJycpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBjb25zdCAkc2VyaWVzID0gJCgnI21lbWJlcl9zaG93cyBkaXYuc2hvd0l0ZW0uY2YnKTtcclxuICAgICAgICBpZiAoJHNlcmllcy5sZW5ndGggPD0gMClcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICRzZXJpZXMuZWFjaChmdW5jdGlvbiAoX2luZGV4LCBzZXJpZSkge1xyXG4gICAgICAgICAgICBsZXQgaWQgPSBwYXJzZUludCgkKHNlcmllKS5kYXRhKCdpZCcpLCAxMCksIGluZm9zID0gJChzZXJpZSkuZmluZCgnLmluZm9zJyk7XHJcbiAgICAgICAgICAgIFNob3dfMS5TaG93LmZldGNoKGlkKS50aGVuKGZ1bmN0aW9uIChzaG93KSB7XHJcbiAgICAgICAgICAgICAgICBpbmZvcy5hcHBlbmQoYDxicj5TdGF0dXQ6ICR7KHNob3cuaXNFbmRlZCgpKSA/ICdUZXJtaW7DqWUnIDogJ0VuIGNvdXJzJ31gKTtcclxuICAgICAgICAgICAgfSwgKGVycikgPT4ge1xyXG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uKCdFcnJldXIgZGUgbW9kaWZpY2F0aW9uIGRcXCd1bmUgc8OpcmllJywgJ2FkZFN0YXR1c1RvR2VzdGlvblNlcmllczogJyArIGVycik7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59KShqUXVlcnkpO1xyXG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=