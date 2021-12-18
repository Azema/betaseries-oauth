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
//namespace BS {
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
//}


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
//}


/***/ }),

/***/ "./src/Character.ts":
/*!**************************!*\
  !*** ./src/Character.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Character = void 0;
// namespace BS {
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
// }


/***/ }),

/***/ "./src/Comment.ts":
/*!************************!*\
  !*** ./src/Comment.ts ***!
  \************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CommentBS = void 0;
// namespace BS {
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
// }


/***/ }),

/***/ "./src/Episode.ts":
/*!************************!*\
  !*** ./src/Episode.ts ***!
  \************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Episode = void 0;
// namespace BS {
const Base_1 = __webpack_require__(/*! ./Base */ "./src/Base.ts");
const Cache_1 = __webpack_require__(/*! ./Cache */ "./src/Cache.ts");
const Show_1 = __webpack_require__(/*! ./Show */ "./src/Show.ts");
const Subtitle_1 = __webpack_require__(/*! ./Subtitle */ "./src/Subtitle.ts");
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
// }


/***/ }),

/***/ "./src/Media.ts":
/*!**********************!*\
  !*** ./src/Media.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Media = void 0;
// namespace BS {
const Base_1 = __webpack_require__(/*! ./Base */ "./src/Base.ts");
const Similar_1 = __webpack_require__(/*! ./Similar */ "./src/Similar.ts");
class Media extends Base_1.Base {
    followers;
    genres;
    imdb_id;
    language;
    length;
    original_title;
    similars;
    in_account;
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
     * Retourne les similars associés au media
     * @abstract
     * @return {Promise<Media>}
     */
    fetchSimilars() {
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
// }


/***/ }),

/***/ "./src/Movie.ts":
/*!**********************!*\
  !*** ./src/Movie.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Movie = void 0;
// namespace BS {
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
// }


/***/ }),

/***/ "./src/Note.ts":
/*!*********************!*\
  !*** ./src/Note.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Note = void 0;
// namespace BS {
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
// }


/***/ }),

/***/ "./src/Show.ts":
/*!*********************!*\
  !*** ./src/Show.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Show = exports.Showrunner = exports.Season = exports.Platforms = exports.Platform = exports.Picture = exports.Picked = exports.Images = void 0;
// namespace BS {
const Base_1 = __webpack_require__(/*! ./Base */ "./src/Base.ts");
const Media_1 = __webpack_require__(/*! ./Media */ "./src/Media.ts");
const Episode_1 = __webpack_require__(/*! ./Episode */ "./src/Episode.ts");
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
class Season {
    number;
    episodes;
    _show;
    constructor(data, show) {
        this.number = parseInt(data.number, 10);
        this._show = show;
        if (data.episodes && data.episodes instanceof Array && data.episodes[0] instanceof Episode_1.Episode) {
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
                    _this.episodes.push(new Episode_1.Episode(data.episodes[e], _this._show));
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
     * Remplit l'objet avec les données fournit en paramètre
     * @param  {Obj} data Les données provenant de l'API
     * @returns {Show}
     */
    fill(data) {
        this.aliases = data.aliases;
        this.creation = data.creation;
        this.country = data.country;
        this.images = new Images(data.images);
        this.nbEpisodes = parseInt(data.episodes, 10);
        this.network = data.network;
        this.next_trailer = data.next_trailer;
        this.next_trailer_host = data.next_trailer_host;
        this.rating = data.rating;
        this.platforms = new Platforms(data.platforms);
        this.seasons = new Array();
        for (let s = 0; s < data.seasons_details.length; s++) {
            this.seasons.push(new Season(data.seasons_details[s], this));
        }
        this.showrunner = new Showrunner(data.showrunner);
        this.social_links = data.social_links;
        this.status = data.status;
        this.thetvdb_id = parseInt(data.thetvdb_id, 10);
        this.pictures = new Array();
        this.mediaType = { singular: Base_1.MediaType.show, plural: 'shows', className: Show };
        super.fill(data);
        return this;
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
// }


/***/ }),

/***/ "./src/Similar.ts":
/*!************************!*\
  !*** ./src/Similar.ts ***!
  \************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Similar = void 0;
// namespace BS {
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
            for (let s = 0; s < data.seasons_details.length; s++) {
                this.seasons.push(new Show_1.Season(data.seasons_details[s], this));
            }
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
// }


/***/ }),

/***/ "./src/Subtitle.ts":
/*!*************************!*\
  !*** ./src/Subtitle.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Subtitle = void 0;
// namespace BS {
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
// }


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
// namespace BS {
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
// }


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
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
const Base_1 = __webpack_require__(/*! ./Base */ "./src/Base.ts");
const Cache_1 = __webpack_require__(/*! ./Cache */ "./src/Cache.ts");
const Show_1 = __webpack_require__(/*! ./Show */ "./src/Show.ts");
const Movie_1 = __webpack_require__(/*! ./Movie */ "./src/Movie.ts");
const Episode_1 = __webpack_require__(/*! ./Episode */ "./src/Episode.ts");
const Media_1 = __webpack_require__(/*! ./Media */ "./src/Media.ts");
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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O0FBQ3ZGLDRDQUE0QywyQ0FBMkM7QUFDdkY7QUFDQTtBQUNBLDRGQUE0RixvQkFBb0Isd0JBQXdCLGdCQUFnQixpQkFBaUIsa0JBQWtCLGNBQWMsbUJBQW1CLDBCQUEwQixpQkFBaUIsa0JBQWtCLG1CQUFtQixJQUFJLGtCQUFrQjtBQUNsVSxxRUFBcUU7QUFDckUsdUNBQXVDLGFBQWEseURBQXlELGlCQUFpQixJQUFJLGVBQWUsY0FBYywyQ0FBMkMsMkJBQTJCLGFBQWEsZ0JBQWdCO0FBQ2xRLGdDQUFnQztBQUNoQztBQUNBO0FBQ0EsMEhBQTBILFlBQVksRUFBRTtBQUN4STtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxRUFBcUUsYUFBYTtBQUNsRjtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtGQUFrRixJQUFJLGFBQWE7QUFDbkcsNkRBQTZELDBDQUEwQztBQUN2RztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNENBQTRDLDJDQUEyQztBQUN2RixhQUFhO0FBQ2I7QUFDQSxhQUFhO0FBQ2IsU0FBUztBQUNUO0FBQ0EsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovLy8uL3NyYy9CYXNlLnRzIiwid2VicGFjazovLy8uL3NyYy9DYWNoZS50cyIsIndlYnBhY2s6Ly8vLi9zcmMvQ2hhcmFjdGVyLnRzIiwid2VicGFjazovLy8uL3NyYy9Db21tZW50LnRzIiwid2VicGFjazovLy8uL3NyYy9FcGlzb2RlLnRzIiwid2VicGFjazovLy8uL3NyYy9NZWRpYS50cyIsIndlYnBhY2s6Ly8vLi9zcmMvTW92aWUudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL05vdGUudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL1Nob3cudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL1NpbWlsYXIudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL1N1YnRpdGxlLnRzIiwid2VicGFjazovLy8uL3NyYy9VcGRhdGVBdXRvLnRzIiwid2VicGFjazovLy8uL3NyYy9Vc2VyLnRzIiwid2VicGFjazovLy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly8vLi9zcmMvbWFpbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG5leHBvcnRzLkJhc2UgPSBleHBvcnRzLkhUVFBfVkVSQlMgPSBleHBvcnRzLkV2ZW50VHlwZXMgPSBleHBvcnRzLk1lZGlhVHlwZSA9IHZvaWQgMDtcclxuLy9uYW1lc3BhY2UgQlMge1xyXG5jb25zdCBDYWNoZV8xID0gcmVxdWlyZShcIi4vQ2FjaGVcIik7XHJcbmNvbnN0IENoYXJhY3Rlcl8xID0gcmVxdWlyZShcIi4vQ2hhcmFjdGVyXCIpO1xyXG5jb25zdCBDb21tZW50XzEgPSByZXF1aXJlKFwiLi9Db21tZW50XCIpO1xyXG5jb25zdCBOb3RlXzEgPSByZXF1aXJlKFwiLi9Ob3RlXCIpO1xyXG5jb25zdCBVc2VyXzEgPSByZXF1aXJlKFwiLi9Vc2VyXCIpO1xyXG52YXIgTWVkaWFUeXBlO1xyXG4oZnVuY3Rpb24gKE1lZGlhVHlwZSkge1xyXG4gICAgTWVkaWFUeXBlW1wic2hvd1wiXSA9IFwic2hvd1wiO1xyXG4gICAgTWVkaWFUeXBlW1wibW92aWVcIl0gPSBcIm1vdmllXCI7XHJcbiAgICBNZWRpYVR5cGVbXCJlcGlzb2RlXCJdID0gXCJlcGlzb2RlXCI7XHJcbn0pKE1lZGlhVHlwZSA9IGV4cG9ydHMuTWVkaWFUeXBlIHx8IChleHBvcnRzLk1lZGlhVHlwZSA9IHt9KSk7XHJcbnZhciBFdmVudFR5cGVzO1xyXG4oZnVuY3Rpb24gKEV2ZW50VHlwZXMpIHtcclxuICAgIEV2ZW50VHlwZXNbRXZlbnRUeXBlc1tcIlVQREFURVwiXSA9IDBdID0gXCJVUERBVEVcIjtcclxuICAgIEV2ZW50VHlwZXNbRXZlbnRUeXBlc1tcIlNBVkVcIl0gPSAxXSA9IFwiU0FWRVwiO1xyXG59KShFdmVudFR5cGVzID0gZXhwb3J0cy5FdmVudFR5cGVzIHx8IChleHBvcnRzLkV2ZW50VHlwZXMgPSB7fSkpO1xyXG52YXIgSFRUUF9WRVJCUztcclxuKGZ1bmN0aW9uIChIVFRQX1ZFUkJTKSB7XHJcbiAgICBIVFRQX1ZFUkJTW1wiR0VUXCJdID0gXCJHRVRcIjtcclxuICAgIEhUVFBfVkVSQlNbXCJQT1NUXCJdID0gXCJQT1NUXCI7XHJcbiAgICBIVFRQX1ZFUkJTW1wiUFVUXCJdID0gXCJQVVRcIjtcclxuICAgIEhUVFBfVkVSQlNbXCJERUxFVEVcIl0gPSBcIkRFTEVURVwiO1xyXG4gICAgSFRUUF9WRVJCU1tcIk9QVElPTlNcIl0gPSBcIk9QVElPTlNcIjtcclxufSkoSFRUUF9WRVJCUyA9IGV4cG9ydHMuSFRUUF9WRVJCUyB8fCAoZXhwb3J0cy5IVFRQX1ZFUkJTID0ge30pKTtcclxuY2xhc3MgQmFzZSB7XHJcbiAgICAvKlxyXG4gICAgICAgICAgICAgICAgICAgIFNUQVRJQ1xyXG4gICAgKi9cclxuICAgIC8qKlxyXG4gICAgICogRmxhZyBkZSBkZWJ1ZyBwb3VyIGxlIGRldlxyXG4gICAgICogQHR5cGUge2Jvb2xlYW59XHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBkZWJ1ZyA9IGZhbHNlO1xyXG4gICAgLyoqXHJcbiAgICAgKiBMJ29iamV0IGNhY2hlIGR1IHNjcmlwdCBwb3VyIHN0b2NrZXIgbGVzIGRvbm7DqWVzXHJcbiAgICAgKiBAdHlwZSB7Q2FjaGVVU31cclxuICAgICAqL1xyXG4gICAgc3RhdGljIGNhY2hlID0gbnVsbDtcclxuICAgIC8qKlxyXG4gICAgICogT2JqZXQgY29udGVuYW50IGxlcyBpbmZvcm1hdGlvbnMgZGUgbCdBUElcclxuICAgICAqIEB0eXBlIHsqfVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgYXBpID0ge1xyXG4gICAgICAgIFwidXJsXCI6ICdodHRwczovL2FwaS5iZXRhc2VyaWVzLmNvbScsXHJcbiAgICAgICAgXCJ2ZXJzaW9uc1wiOiB7IFwiY3VycmVudFwiOiAnMy4wJywgXCJsYXN0XCI6ICczLjAnIH0sXHJcbiAgICAgICAgXCJyZXNvdXJjZXNcIjogW1xyXG4gICAgICAgICAgICAnYmFkZ2VzJywgJ2NvbW1lbnRzJywgJ2VwaXNvZGVzJywgJ2ZyaWVuZHMnLCAnbWVtYmVycycsICdtZXNzYWdlcycsXHJcbiAgICAgICAgICAgICdtb3ZpZXMnLCAnbmV3cycsICdvYXV0aCcsICdwaWN0dXJlcycsICdwbGFubmluZycsICdwbGF0Zm9ybXMnLFxyXG4gICAgICAgICAgICAncG9sbHMnLCAncmVwb3J0cycsICdzZWFyY2gnLCAnc2Vhc29ucycsICdzaG93cycsICdzdWJ0aXRsZXMnLFxyXG4gICAgICAgICAgICAndGltZWxpbmUnXHJcbiAgICAgICAgXSxcclxuICAgICAgICBcImNoZWNrXCI6IHtcclxuICAgICAgICAgICAgXCJlcGlzb2Rlc1wiOiBbJ2Rpc3BsYXknLCAnbGlzdCcsICdzZWFyY2gnXSxcclxuICAgICAgICAgICAgXCJtb3ZpZXNcIjogWydsaXN0JywgJ21vdmllJywgJ3NlYXJjaCcsICdzaW1pbGFycyddLFxyXG4gICAgICAgICAgICBcInNlYXJjaFwiOiBbJ2FsbCcsICdtb3ZpZXMnLCAnc2hvd3MnXSxcclxuICAgICAgICAgICAgXCJzaG93c1wiOiBbJ2Rpc3BsYXknLCAnZXBpc29kZXMnLCAnbGlzdCcsICdzZWFyY2gnLCAnc2ltaWxhcnMnXVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIExlIHRva2VuIGQnYXV0aGVudGlmaWNhdGlvbiBkZSBsJ0FQSVxyXG4gICAgICogQHR5cGUge1N0cmluZ31cclxuICAgICAqL1xyXG4gICAgc3RhdGljIHRva2VuID0gbnVsbDtcclxuICAgIC8qKlxyXG4gICAgICogTGEgY2zDqSBkJ3V0aWxpc2F0aW9uIGRlIGwnQVBJXHJcbiAgICAgKiBAdHlwZSB7U3RyaW5nfVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgdXNlcktleSA9IG51bGw7XHJcbiAgICAvKipcclxuICAgICAqIEwnaWRlbnRpZmlhbnQgZHUgbWVtYnJlIGNvbm5lY3TDqVxyXG4gICAgICogQHR5cGUge051bWJlcn1cclxuICAgICAqL1xyXG4gICAgc3RhdGljIHVzZXJJZCA9IG51bGw7XHJcbiAgICAvKipcclxuICAgICAqIENsw6kgcG91ciBsJ0FQSSBUaGVNb3ZpZURCXHJcbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgdGhlbW92aWVkYl9hcGlfdXNlcl9rZXkgPSBudWxsO1xyXG4gICAgLyoqXHJcbiAgICAgKiBMZSBub21icmUgZCdhcHBlbHMgw6AgbCdBUElcclxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBjb3VudGVyID0gMDtcclxuICAgIC8qKlxyXG4gICAgICogTCdVUkwgZGUgYmFzZSBkdSBzZXJ2ZXVyIGNvbnRlbmFudCBsZXMgcmVzc291cmNlcyBzdGF0aXF1ZXNcclxuICAgICAqIEB0eXBlIHtTdHJpbmd9XHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBzZXJ2ZXJCYXNlVXJsID0gJyc7XHJcbiAgICAvKipcclxuICAgICAqIEZvbmN0aW9uIGRlIG5vdGlmaWNhdGlvbiBzdXIgbGEgcGFnZSBXZWJcclxuICAgICAqIEB0eXBlIHtGdW5jdGlvbn1cclxuICAgICAqL1xyXG4gICAgc3RhdGljIG5vdGlmaWNhdGlvbiA9IGZ1bmN0aW9uICgpIHsgfTtcclxuICAgIC8qKlxyXG4gICAgICogRm9uY3Rpb24gcG91ciB2w6lyaWZpZXIgcXVlIGxlIG1lbWJyZSBlc3QgY29ubmVjdMOpXHJcbiAgICAgKiBAdHlwZSB7RnVuY3Rpb259XHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyB1c2VySWRlbnRpZmllZCA9IGZ1bmN0aW9uICgpIHsgfTtcclxuICAgIC8qKlxyXG4gICAgICogRm9uY3Rpb24gdmlkZVxyXG4gICAgICogQHR5cGUge0Z1bmN0aW9ufVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgbm9vcCA9IGZ1bmN0aW9uICgpIHsgfTtcclxuICAgIC8qKlxyXG4gICAgICogRm9uY3Rpb24gZGUgdHJhZHVjdGlvbiBkZSBjaGHDrm5lcyBkZSBjYXJhY3TDqHJlc1xyXG4gICAgICogQHBhcmFtICAge1N0cmluZ30gIG1zZyAgICAgSWRlbnRpZmlhbnQgZGUgbGEgY2hhw65uZSDDoCB0cmFkdWlyZVxyXG4gICAgICogQHBhcmFtICAgeypbXX0gICAgIGFyZ3MgICAgQXV0cmVzIHBhcmFtw6h0cmVzXHJcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgdHJhbnMgPSBmdW5jdGlvbiAobXNnLCAuLi5hcmdzKSB7IH07XHJcbiAgICAvKipcclxuICAgICAqIENvbnRpZW50IGxlcyBpbmZvcyBzdXIgbGVzIGRpZmbDqXJlbnRlcyBjbGFzc2lmaWNhdGlvbiBUViBldCBjaW7DqW1hXHJcbiAgICAgKiBAdHlwZSB7UmF0aW5nc31cclxuICAgICAqL1xyXG4gICAgc3RhdGljIHJhdGluZ3MgPSBudWxsO1xyXG4gICAgLyoqXHJcbiAgICAgKiBUeXBlcyBkJ8OpdmVuZW1lbnRzIGfDqXLDqXMgcGFyIGNldHRlIGNsYXNzZVxyXG4gICAgICogQHR5cGUge0FycmF5fVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgRXZlbnRUeXBlcyA9IG5ldyBBcnJheShFdmVudFR5cGVzLlVQREFURSwgRXZlbnRUeXBlcy5TQVZFKTtcclxuICAgIC8qKlxyXG4gICAgICogRm9uY3Rpb24gZCdhdXRoZW50aWZpY2F0aW9uIHN1ciBsJ0FQSSBCZXRhU2VyaWVzXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybiB7UHJvbWlzZX1cclxuICAgICAqL1xyXG4gICAgc3RhdGljIGF1dGhlbnRpY2F0ZSgpIHtcclxuICAgICAgICBpZiAoQmFzZS5kZWJ1ZylcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ2F1dGhlbnRpY2F0ZScpO1xyXG4gICAgICAgIGlmIChqUXVlcnkoJyNjb250YWluZXJJZnJhbWUnKS5sZW5ndGggPD0gMCkge1xyXG4gICAgICAgICAgICBqUXVlcnkoJ2JvZHknKS5hcHBlbmQoYFxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgaWQ9XCJjb250YWluZXJJZnJhbWVcIj5cclxuICAgICAgICAgICAgICAgICAgICA8aWZyYW1lIGlkPVwidXNlcnNjcmlwdFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lPVwidXNlcnNjcmlwdFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZT1cIkNvbm5leGlvbiDDoCBCZXRhU2VyaWVzXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoPVwiNTAlXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodD1cIjQwMFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcmM9XCIke0Jhc2Uuc2VydmVyQmFzZVVybH0vaW5kZXguaHRtbFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZT1cImJhY2tncm91bmQ6d2hpdGU7bWFyZ2luOmF1dG87XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9pZnJhbWU+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+J1xyXG4gICAgICAgICAgICAgICAgYCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIHJlY2VpdmVNZXNzYWdlKGV2ZW50KSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBvcmlnaW4gPSBuZXcgVVJMKEJhc2Uuc2VydmVyQmFzZVVybCkub3JpZ2luO1xyXG4gICAgICAgICAgICAgICAgLy8gaWYgKGRlYnVnKSBjb25zb2xlLmxvZygncmVjZWl2ZU1lc3NhZ2UnLCBldmVudCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQub3JpZ2luICE9PSBvcmlnaW4pIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoQmFzZS5kZWJ1ZylcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcigncmVjZWl2ZU1lc3NhZ2Uge29yaWdpbjogJXN9JywgZXZlbnQub3JpZ2luLCBldmVudCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGBldmVudC5vcmlnaW4gaXMgbm90ICR7b3JpZ2lufWApO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChldmVudC5kYXRhLm1lc3NhZ2UgPT09ICdhY2Nlc3NfdG9rZW4nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgQmFzZS50b2tlbiA9IGV2ZW50LmRhdGEudmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgJCgnI2NvbnRhaW5lcklmcmFtZScpLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZXZlbnQuZGF0YS5tZXNzYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgcmVjZWl2ZU1lc3NhZ2UsIGZhbHNlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0VycmV1ciBkZSByw6ljdXBlcmF0aW9uIGR1IHRva2VuJywgZXZlbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChldmVudC5kYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICBCYXNlLm5vdGlmaWNhdGlvbignRXJyZXVyIGRlIHLDqWN1cMOpcmF0aW9uIGR1IHRva2VuJywgJ1BhcyBkZSBtZXNzYWdlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIHJlY2VpdmVNZXNzYWdlLCBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIHJlY2VpdmVNZXNzYWdlLCBmYWxzZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIEZvbmN0aW9uIHNlcnZhbnQgw6AgYXBwZWxlciBsJ0FQSSBkZSBCZXRhU2VyaWVzXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtICB7U3RyaW5nfSAgIHR5cGUgICAgICAgICAgICAgIFR5cGUgZGUgbWV0aG9kZSBkJ2FwcGVsIEFqYXggKEdFVCwgUE9TVCwgUFVULCBERUxFVEUpXHJcbiAgICAgKiBAcGFyYW0gIHtTdHJpbmd9ICAgcmVzb3VyY2UgICAgICAgICAgTGEgcmVzc291cmNlIGRlIGwnQVBJIChleDogc2hvd3MsIHNlYXNvbnMsIGVwaXNvZGVzLi4uKVxyXG4gICAgICogQHBhcmFtICB7U3RyaW5nfSAgIGFjdGlvbiAgICAgICAgICAgIEwnYWN0aW9uIMOgIGFwcGxpcXVlciBzdXIgbGEgcmVzc291cmNlIChleDogc2VhcmNoLCBsaXN0Li4uKVxyXG4gICAgICogQHBhcmFtICB7Kn0gICAgICAgIGFyZ3MgICAgICAgICAgICAgIFVuIG9iamV0IChjbGVmLCB2YWxldXIpIMOgIHRyYW5zbWV0dHJlIGRhbnMgbGEgcmVxdcOqdGVcclxuICAgICAqIEBwYXJhbSAge2Jvb2x9ICAgICBbZm9yY2U9ZmFsc2VdICAgICBJbmRpcXVlIHNpIG9uIGRvaXQgdXRpbGlzZXIgbGUgY2FjaGUgb3Ugbm9uIChQYXIgZMOpZmF1dDogZmFsc2UpXHJcbiAgICAgKiBAcmV0dXJuIHtQcm9taXNlfVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgY2FsbEFwaSh0eXBlLCByZXNvdXJjZSwgYWN0aW9uLCBhcmdzLCBmb3JjZSA9IGZhbHNlKSB7XHJcbiAgICAgICAgaWYgKEJhc2UuYXBpICYmIEJhc2UuYXBpLnJlc291cmNlcy5pbmRleE9mKHJlc291cmNlKSA9PT0gLTEpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBSZXNzb3VyY2UgKCR7cmVzb3VyY2V9KSBpbmNvbm51ZSBkYW5zIGwnQVBJLmApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIUJhc2UudG9rZW4gfHwgIUJhc2UudXNlcktleSkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Rva2VuIGFuZCB1c2VyS2V5IGFyZSByZXF1aXJlZCcpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgY2hlY2sgPSBmYWxzZSwgXHJcbiAgICAgICAgLy8gTGVzIGVuLXTDqnRlcyBwb3VyIGwnQVBJXHJcbiAgICAgICAgbXlIZWFkZXJzID0ge1xyXG4gICAgICAgICAgICAnQWNjZXB0JzogJ2FwcGxpY2F0aW9uL2pzb24nLFxyXG4gICAgICAgICAgICAnWC1CZXRhU2VyaWVzLVZlcnNpb24nOiBCYXNlLmFwaS52ZXJzaW9ucy5jdXJyZW50LFxyXG4gICAgICAgICAgICAnWC1CZXRhU2VyaWVzLVRva2VuJzogQmFzZS50b2tlbixcclxuICAgICAgICAgICAgJ1gtQmV0YVNlcmllcy1LZXknOiBCYXNlLnVzZXJLZXlcclxuICAgICAgICB9LCBjaGVja0tleXMgPSBPYmplY3Qua2V5cyhCYXNlLmFwaS5jaGVjayk7XHJcbiAgICAgICAgaWYgKEJhc2UuZGVidWcpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ0Jhc2UuY2FsbEFwaScsIHtcclxuICAgICAgICAgICAgICAgIHR5cGU6IHR5cGUsXHJcbiAgICAgICAgICAgICAgICByZXNvdXJjZTogcmVzb3VyY2UsXHJcbiAgICAgICAgICAgICAgICBhY3Rpb246IGFjdGlvbixcclxuICAgICAgICAgICAgICAgIGFyZ3M6IGFyZ3MsXHJcbiAgICAgICAgICAgICAgICBmb3JjZTogZm9yY2VcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIE9uIHJldG91cm5lIGxhIHJlc3NvdXJjZSBlbiBjYWNoZSBzaSBlbGxlIHkgZXN0IHByw6lzZW50ZVxyXG4gICAgICAgIGlmIChCYXNlLmNhY2hlICYmICFmb3JjZSAmJiB0eXBlID09PSAnR0VUJyAmJiBhcmdzICYmICdpZCcgaW4gYXJncyAmJlxyXG4gICAgICAgICAgICBCYXNlLmNhY2hlLmhhcyhyZXNvdXJjZSwgYXJncy5pZCkpIHtcclxuICAgICAgICAgICAgLy9pZiAoZGVidWcpIGNvbnNvbGUubG9nKCdCYXNlLmNhbGxBcGkgcmV0b3VybmUgbGEgcmVzc291cmNlIGR1IGNhY2hlICglczogJWQpJywgcmVzb3VyY2UsIGFyZ3MuaWQpO1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcclxuICAgICAgICAgICAgICAgIHJlc29sdmUoQmFzZS5jYWNoZS5nZXQocmVzb3VyY2UsIGFyZ3MuaWQpKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIE9uIGNoZWNrIHNpIG9uIGRvaXQgdsOpcmlmaWVyIGxhIHZhbGlkaXTDqSBkdSB0b2tlblxyXG4gICAgICAgIC8vIChodHRwczovL3d3dy5iZXRhc2VyaWVzLmNvbS9idWdzL2FwaS80NjEpXHJcbiAgICAgICAgaWYgKEJhc2UudXNlcklkZW50aWZpZWQoKSAmJiBjaGVja0tleXMuaW5kZXhPZihyZXNvdXJjZSkgIT09IC0xICYmXHJcbiAgICAgICAgICAgIEJhc2UuYXBpLmNoZWNrW3Jlc291cmNlXS5pbmRleE9mKGFjdGlvbikgIT09IC0xKSB7XHJcbiAgICAgICAgICAgIGNoZWNrID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZnVuY3Rpb24gZmV0Y2hVcmkocmVzb2x2ZSwgcmVqZWN0KSB7XHJcbiAgICAgICAgICAgIGxldCBpbml0RmV0Y2ggPSB7XHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6IHR5cGUsXHJcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiBteUhlYWRlcnMsXHJcbiAgICAgICAgICAgICAgICBtb2RlOiAnY29ycycsXHJcbiAgICAgICAgICAgICAgICBjYWNoZTogJ25vLWNhY2hlJ1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBsZXQgdXJpID0gYCR7QmFzZS5hcGkudXJsfS8ke3Jlc291cmNlfS8ke2FjdGlvbn1gO1xyXG4gICAgICAgICAgICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXMoYXJncyk7XHJcbiAgICAgICAgICAgIC8vIE9uIGNyw6llIGwnVVJMIGRlIGxhIHJlcXXDqnRlIGRlIHR5cGUgR0VUIGF2ZWMgbGVzIHBhcmFtw6h0cmVzXHJcbiAgICAgICAgICAgIGlmICh0eXBlID09PSAnR0VUJyAmJiBrZXlzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIGxldCBwYXJhbXMgPSBbXTtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGtleSBvZiBrZXlzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGFyYW1zLnB1c2goa2V5ICsgJz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KGFyZ3Nba2V5XSkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdXJpICs9ICc/JyArIHBhcmFtcy5qb2luKCcmJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoa2V5cy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBpbml0RmV0Y2guYm9keSA9IG5ldyBVUkxTZWFyY2hQYXJhbXMoYXJncyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZmV0Y2godXJpLCBpbml0RmV0Y2gpLnRoZW4ocmVzcG9uc2UgPT4ge1xyXG4gICAgICAgICAgICAgICAgQmFzZS5jb3VudGVyKys7IC8vIEluY3LDqW1lbnQgZHUgY29tcHRldXIgZGUgcmVxdcOqdGVzIMOgIGwnQVBJXHJcbiAgICAgICAgICAgICAgICBpZiAoQmFzZS5kZWJ1ZylcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnZmV0Y2ggKCVzICVzKSByZXNwb25zZSBzdGF0dXM6ICVkJywgdHlwZSwgdXJpLCByZXNwb25zZS5zdGF0dXMpO1xyXG4gICAgICAgICAgICAgICAgLy8gT24gcsOpY3Vww6hyZSBsZXMgZG9ubsOpZXMgZXQgbGVzIHRyYW5zZm9ybWUgZW4gb2JqZXRcclxuICAgICAgICAgICAgICAgIHJlc3BvbnNlLmpzb24oKS50aGVuKChkYXRhKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKEJhc2UuZGVidWcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdmZXRjaCAoJXMgJXMpIGRhdGEnLCB0eXBlLCB1cmksIGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIE9uIGfDqHJlIGxlIHJldG91ciBkJ2VycmV1cnMgZGUgbCdBUElcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YS5lcnJvcnMgIT09IHVuZGVmaW5lZCAmJiBkYXRhLmVycm9ycy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvZGUgPSBkYXRhLmVycm9yc1swXS5jb2RlLCB0ZXh0ID0gZGF0YS5lcnJvcnNbMF0udGV4dDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvZGUgPT09IDIwMDUgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChyZXNwb25zZS5zdGF0dXMgPT09IDQwMCAmJiBjb2RlID09PSAwICYmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dCA9PT0gXCJMJ3V0aWxpc2F0ZXVyIGEgZMOpasOgIG1hcnF1w6kgY2V0IMOpcGlzb2RlIGNvbW1lIHZ1LlwiKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KCdjaGFuZ2VTdGF0dXMnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChjb2RlID09IDIwMDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEFwcGVsIGRlIGwnYXV0aGVudGlmaWNhdGlvbiBwb3VyIG9idGVuaXIgdW4gdG9rZW4gdmFsaWRlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBCYXNlLmF1dGhlbnRpY2F0ZSgpLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEJhc2UuY2FsbEFwaSh0eXBlLCByZXNvdXJjZSwgYWN0aW9uLCBhcmdzLCBmb3JjZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZGF0YSA9PiByZXNvbHZlKGRhdGEpLCBlcnIgPT4gcmVqZWN0KGVycikpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgKGVycikgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoZGF0YS5lcnJvcnNbMF0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gT24gZ8OocmUgbGVzIGVycmV1cnMgcsOpc2VhdVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignRmV0Y2ggZXJyZXVyIG5ldHdvcmsnLCByZXNwb25zZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChyZXNwb25zZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShkYXRhKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KS5jYXRjaChlcnJvciA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoQmFzZS5kZWJ1ZylcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnSWwgeSBhIGV1IHVuIHByb2Jsw6htZSBhdmVjIGxcXCdvcMOpcmF0aW9uIGZldGNoOiAnICsgZXJyb3IubWVzc2FnZSk7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcclxuICAgICAgICAgICAgICAgIHJlamVjdChlcnJvci5tZXNzYWdlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChjaGVjaykge1xyXG4gICAgICAgICAgICAgICAgbGV0IHBhcmFtc0ZldGNoID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXHJcbiAgICAgICAgICAgICAgICAgICAgaGVhZGVyczogbXlIZWFkZXJzLFxyXG4gICAgICAgICAgICAgICAgICAgIG1vZGU6ICdjb3JzJyxcclxuICAgICAgICAgICAgICAgICAgICBjYWNoZTogJ25vLWNhY2hlJ1xyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIGlmIChCYXNlLmRlYnVnKVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuaW5mbygnJWNjYWxsIC9tZW1iZXJzL2lzX2FjdGl2ZScsICdjb2xvcjpibHVlJyk7XHJcbiAgICAgICAgICAgICAgICBmZXRjaChgJHtCYXNlLmFwaS51cmx9L21lbWJlcnMvaXNfYWN0aXZlYCwgcGFyYW1zRmV0Y2gpLnRoZW4ocmVzcCA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgQmFzZS5jb3VudGVyKys7IC8vIEluY3LDqW1lbnQgZHUgY29tcHRldXIgZGUgcmVxdcOqdGVzIMOgIGwnQVBJXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFyZXNwLm9rKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEFwcGVsIGRlIGwnYXV0aGVudGlmaWNhdGlvbiBwb3VyIG9idGVuaXIgdW4gdG9rZW4gdmFsaWRlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIEJhc2UuYXV0aGVudGljYXRlKCkudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBPbiBtZXQgw6Agam91ciBsZSB0b2tlbiBwb3VyIGxlIHByb2NoYWluIGFwcGVsIMOgIGwnQVBJXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBteUhlYWRlcnNbJ1gtQmV0YVNlcmllcy1Ub2tlbiddID0gQmFzZS50b2tlbjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZldGNoVXJpKHJlc29sdmUsIHJlamVjdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLmNhdGNoKGVyciA9PiByZWplY3QoZXJyKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZmV0Y2hVcmkocmVzb2x2ZSwgcmVqZWN0KTtcclxuICAgICAgICAgICAgICAgIH0pLmNhdGNoKGVycm9yID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoQmFzZS5kZWJ1ZylcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0lsIHkgYSBldSB1biBwcm9ibMOobWUgYXZlYyBsXFwnb3DDqXJhdGlvbiBmZXRjaDogJyArIGVycm9yLm1lc3NhZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnJvci5tZXNzYWdlKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZmV0Y2hVcmkocmVzb2x2ZSwgcmVqZWN0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgLypcclxuICAgICAgICAgICAgICAgICAgICBQUk9QRVJUSUVTXHJcbiAgICAqL1xyXG4gICAgZGVzY3JpcHRpb247XHJcbiAgICBjaGFyYWN0ZXJzO1xyXG4gICAgY29tbWVudHM7XHJcbiAgICBpZDtcclxuICAgIG9iak5vdGU7XHJcbiAgICByZXNvdXJjZV91cmw7XHJcbiAgICB0aXRsZTtcclxuICAgIHVzZXI7XHJcbiAgICBtZWRpYVR5cGU7XHJcbiAgICBfZWx0O1xyXG4gICAgX2xpc3RlbmVycztcclxuICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgICAgTUVUSE9EU1xyXG4gICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKGRhdGEpIHtcclxuICAgICAgICBpZiAoIShkYXRhIGluc3RhbmNlb2YgT2JqZWN0KSkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJkYXRhIGlzIG5vdCBhbiBvYmplY3RcIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2luaXRMaXN0ZW5lcnMoKVxyXG4gICAgICAgICAgICAuZmlsbChkYXRhKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogUmVtcGxpdCBsJ29iamV0IGF2ZWMgbGVzIGRvbm7DqWVzIGZvdXJuaXQgZW4gcGFyYW3DqHRyZVxyXG4gICAgICogQHBhcmFtICB7T2JqfSBkYXRhIExlcyBkb25uw6llcyBwcm92ZW5hbnQgZGUgbCdBUElcclxuICAgICAqIEByZXR1cm5zIHRoaXNcclxuICAgICAqL1xyXG4gICAgZmlsbChkYXRhKSB7XHJcbiAgICAgICAgdGhpcy5pZCA9IHBhcnNlSW50KGRhdGEuaWQsIDEwKTtcclxuICAgICAgICB0aGlzLmNoYXJhY3RlcnMgPSBbXTtcclxuICAgICAgICBpZiAoZGF0YS5jaGFyYWN0ZXJzICYmIGRhdGEuY2hhcmFjdGVycyBpbnN0YW5jZW9mIEFycmF5KSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGMgPSAwOyBjIDwgZGF0YS5jaGFyYWN0ZXJzLmxlbmd0aDsgYysrKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNoYXJhY3RlcnMucHVzaChuZXcgQ2hhcmFjdGVyXzEuQ2hhcmFjdGVyKGRhdGEuY2hhcmFjdGVyc1tjXSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuY29tbWVudHMgPSBbXTtcclxuICAgICAgICBpZiAoZGF0YS5jb21tZW50cyAmJiBkYXRhLmNvbW1lbnRzIGluc3RhbmNlb2YgQXJyYXkpIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgYyA9IDA7IGMgPCBkYXRhLmNvbW1lbnRzLmxlbmd0aDsgYysrKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbW1lbnRzLnB1c2gobmV3IENvbW1lbnRfMS5Db21tZW50QlMoZGF0YS5jb21tZW50c1tjXSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMub2JqTm90ZSA9IChkYXRhLm5vdGUpID8gbmV3IE5vdGVfMS5Ob3RlKGRhdGEubm90ZSkgOiBuZXcgTm90ZV8xLk5vdGUoZGF0YS5ub3Rlcyk7XHJcbiAgICAgICAgdGhpcy5yZXNvdXJjZV91cmwgPSBkYXRhLnJlc291cmNlX3VybDtcclxuICAgICAgICB0aGlzLnRpdGxlID0gZGF0YS50aXRsZTtcclxuICAgICAgICB0aGlzLnVzZXIgPSBuZXcgVXNlcl8xLlVzZXIoZGF0YS51c2VyKTtcclxuICAgICAgICB0aGlzLmRlc2NyaXB0aW9uID0gZGF0YS5kZXNjcmlwdGlvbjtcclxuICAgICAgICB0aGlzLnNhdmUoKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogSW5pdGlhbGl6ZSBsZSB0YWJsZWF1IGRlcyDDqWNvdXRldXJzIGQnw6l2w6huZW1lbnRzXHJcbiAgICAgKiBAcmV0dXJucyB0aGlzXHJcbiAgICAgKi9cclxuICAgIF9pbml0TGlzdGVuZXJzKCkge1xyXG4gICAgICAgIHRoaXMuX2xpc3RlbmVycyA9IHt9O1xyXG4gICAgICAgIGZvciAobGV0IGUgPSAwOyBlIDwgQmFzZS5FdmVudFR5cGVzLmxlbmd0aDsgZSsrKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2xpc3RlbmVyc1tCYXNlLkV2ZW50VHlwZXNbZV1dID0gbmV3IEFycmF5KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBQZXJtZXQgZCdham91dGVyIHVuIGxpc3RlbmVyIHN1ciB1biB0eXBlIGQnw6l2ZW5lbWVudFxyXG4gICAgICogQHBhcmFtICB7c3RyaW5nfSAgIG5hbWUgTGUgdHlwZSBkJ8OpdmVuZW1lbnRcclxuICAgICAqIEBwYXJhbSAge0Z1bmN0aW9ufSBmbiAgIExhIGZvbmN0aW9uIMOgIGFwcGVsZXJcclxuICAgICAqIEByZXR1cm4ge3RoaXN9ICAgICAgICAgIEwnaW5zdGFuY2UgZHUgbcOpZGlhXHJcbiAgICAgKi9cclxuICAgIGFkZExpc3RlbmVyKG5hbWUsIGZuKSB7XHJcbiAgICAgICAgLy8gT24gdsOpcmlmaWUgcXVlIGxlIHR5cGUgZCdldmVudCBlc3QgcHJpcyBlbiBjaGFyZ2VcclxuICAgICAgICBpZiAoQmFzZS5FdmVudFR5cGVzLmluZGV4T2YobmFtZSkgPCAwKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgJHtuYW1lfSBuZSBmYWl0IHBhcyBwYXJ0aXQgZGVzIGV2ZW50cyBnw6lyw6lzIHBhciBjZXR0ZSBjbGFzc2VgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuX2xpc3RlbmVyc1tuYW1lXSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2xpc3RlbmVyc1tuYW1lXSA9IG5ldyBBcnJheSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9saXN0ZW5lcnNbbmFtZV0ucHVzaChmbik7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFBlcm1ldCBkZSBzdXBwcmltZXIgdW4gbGlzdGVuZXIgc3VyIHVuIHR5cGUgZCfDqXZlbmVtZW50XHJcbiAgICAgKiBAcGFyYW0gIHtzdHJpbmd9ICAgbmFtZSBMZSB0eXBlIGQnw6l2ZW5lbWVudFxyXG4gICAgICogQHBhcmFtICB7RnVuY3Rpb259IGZuICAgTGEgZm9uY3Rpb24gcXVpIMOpdGFpdCBhcHBlbMOpZVxyXG4gICAgICogQHJldHVybiB7QmFzZX0gICAgICAgICAgTCdpbnN0YW5jZSBkdSBtw6lkaWFcclxuICAgICAqL1xyXG4gICAgcmVtb3ZlTGlzdGVuZXIobmFtZSwgZm4pIHtcclxuICAgICAgICBpZiAodGhpcy5fbGlzdGVuZXJzW25hbWVdICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgbCA9IDA7IGwgPCB0aGlzLl9saXN0ZW5lcnNbbmFtZV0ubGVuZ3RoOyBsKyspIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9saXN0ZW5lcnNbbmFtZV1bbF0gPT09IGZuKVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2xpc3RlbmVyc1tuYW1lXS5zcGxpY2UobCwgMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIEFwcGVsIGxlcyBsaXN0ZW5lcnMgcG91ciB1biB0eXBlIGQnw6l2ZW5lbWVudFxyXG4gICAgICogQHBhcmFtICB7c3RyaW5nfSBuYW1lIExlIHR5cGUgZCfDqXZlbmVtZW50XHJcbiAgICAgKiBAcmV0dXJuIHtTaG93fSAgICAgICAgTCdpbnN0YW5jZSBTaG93XHJcbiAgICAgKi9cclxuICAgIF9jYWxsTGlzdGVuZXJzKG5hbWUpIHtcclxuICAgICAgICBpZiAodGhpcy5fbGlzdGVuZXJzW25hbWVdICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgbCA9IDA7IGwgPCB0aGlzLl9saXN0ZW5lcnNbbmFtZV0ubGVuZ3RoOyBsKyspIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2xpc3RlbmVyc1tuYW1lXVtsXS5jYWxsKHRoaXMsIHRoaXMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBTYXV2ZWdhcmRlIGwnb2JqZXQgZW4gY2FjaGVcclxuICAgICAqIEByZXR1cm4gdGhpc1xyXG4gICAgICovXHJcbiAgICBzYXZlKCkge1xyXG4gICAgICAgIGlmIChCYXNlLmNhY2hlIGluc3RhbmNlb2YgQ2FjaGVfMS5DYWNoZVVTKSB7XHJcbiAgICAgICAgICAgIEJhc2UuY2FjaGUuc2V0KHRoaXMubWVkaWFUeXBlLnBsdXJhbCwgdGhpcy5pZCwgdGhpcyk7XHJcbiAgICAgICAgICAgIHRoaXMuX2NhbGxMaXN0ZW5lcnMoRXZlbnRUeXBlcy5TQVZFKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFJldG91cm5lIGxlIERPTUVsZW1lbnQgY29ycmVzcG9uZGFudCBhdSBtw6lkaWFcclxuICAgICAqIEByZXR1cm5zIHtKUXVlcnl9IExlIERPTUVsZW1lbnQgalF1ZXJ5XHJcbiAgICAgKi9cclxuICAgIGdldCBlbHQoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2VsdDtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogRMOpZmluaXQgbGUgRE9NRWxlbWVudCBkZSByw6lmw6lyZW5jZSBwb3VyIGNlIG3DqWRpYVxyXG4gICAgICogQHBhcmFtICB7SlF1ZXJ5fSBlbHQgRE9NRWxlbWVudCBhdXF1ZWwgZXN0IHJhdHRhY2jDqSBsZSBtw6lkaWFcclxuICAgICAqL1xyXG4gICAgc2V0IGVsdChlbHQpIHtcclxuICAgICAgICB0aGlzLl9lbHQgPSBlbHQ7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFJldG91cm5lIGxlIG5vbWJyZSBkJ2FjdGV1cnMgcsOpZsOpcmVuY8OpcyBkYW5zIGNlIG3DqWRpYVxyXG4gICAgICogQHJldHVybnMge251bWJlcn1cclxuICAgICAqL1xyXG4gICAgZ2V0IG5iQ2hhcmFjdGVycygpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jaGFyYWN0ZXJzLmxlbmd0aDtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogUmV0b3VybmUgbGUgbm9tYnJlIGRlIGNvbW1lbnRhaXJlcyBwb3VyIGNlIG3DqWRpYVxyXG4gICAgICogQHJldHVybnMgbnVtYmVyXHJcbiAgICAgKi9cclxuICAgIGdldCBuYkNvbW1lbnRzKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNvbW1lbnRzLmxlbmd0aDtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogRMOpY29kZSBsZSB0aXRyZSBkZSBsYSBwYWdlXHJcbiAgICAgKiBAcmV0dXJuIHtCYXNlfSBUaGlzXHJcbiAgICAgKi9cclxuICAgIGRlY29kZVRpdGxlKCkge1xyXG4gICAgICAgIGxldCAkZWx0ID0gdGhpcy5lbHQuZmluZCgnLmJsb2NrSW5mb3JtYXRpb25zX190aXRsZScpLCB0aXRsZSA9ICRlbHQudGV4dCgpO1xyXG4gICAgICAgIGlmICgvJiMvLnRlc3QodGl0bGUpKSB7XHJcbiAgICAgICAgICAgICRlbHQudGV4dCgkKCc8dGV4dGFyZWEgLz4nKS5odG1sKHRpdGxlKS50ZXh0KCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogQWpvdXRlIGxlIG5vbWJyZSBkZSB2b3RlcyDDoCBsYSBub3RlIGRhbnMgbCdhdHRyaWJ1dCB0aXRsZSBkZSBsYSBiYWxpc2VcclxuICAgICAqIGNvbnRlbmFudCBsYSByZXByw6lzZW50YXRpb24gZGUgbGEgbm90ZSBkZSBsYSByZXNzb3VyY2VcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gIHtCb29sZWFufSBjaGFuZ2UgIEluZGlxdWUgc2kgb24gZG9pdCBjaGFuZ2VyIGwnYXR0cmlidXQgdGl0bGUgZHUgRE9NRWxlbWVudFxyXG4gICAgICogQHJldHVybiB7U3RyaW5nfSAgICAgICAgIExlIHRpdHJlIG1vZGlmacOpIGRlIGxhIG5vdGVcclxuICAgICAqL1xyXG4gICAgY2hhbmdlVGl0bGVOb3RlKGNoYW5nZSA9IHRydWUpIHtcclxuICAgICAgICBjb25zdCAkZWx0ID0gdGhpcy5lbHQuZmluZCgnLmpzLXJlbmRlci1zdGFycycpO1xyXG4gICAgICAgIGlmICh0aGlzLm9iak5vdGUubWVhbiA8PSAwIHx8IHRoaXMub2JqTm90ZS50b3RhbCA8PSAwKSB7XHJcbiAgICAgICAgICAgIGlmIChjaGFuZ2UpXHJcbiAgICAgICAgICAgICAgICAkZWx0LmF0dHIoJ3RpdGxlJywgJ0F1Y3VuIHZvdGUnKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCB2b3RlcyA9ICd2b3RlJyArICh0aGlzLm9iak5vdGUudG90YWwgPiAxID8gJ3MnIDogJycpLCBcclxuICAgICAgICAvLyBPbiBtZXQgZW4gZm9ybWUgbGUgbm9tYnJlIGRlIHZvdGVzXHJcbiAgICAgICAgdG90YWwgPSBuZXcgSW50bC5OdW1iZXJGb3JtYXQoJ2ZyLUZSJywgeyBzdHlsZTogJ2RlY2ltYWwnLCB1c2VHcm91cGluZzogdHJ1ZSB9KVxyXG4gICAgICAgICAgICAuZm9ybWF0KHRoaXMub2JqTm90ZS50b3RhbCksIFxyXG4gICAgICAgIC8vIE9uIGxpbWl0ZSBsZSBub21icmUgZGUgY2hpZmZyZSBhcHLDqHMgbGEgdmlyZ3VsZVxyXG4gICAgICAgIG5vdGUgPSB0aGlzLm9iak5vdGUubWVhbi50b0ZpeGVkKDEpO1xyXG4gICAgICAgIGxldCB0aXRsZSA9IGAke3RvdGFsfSAke3ZvdGVzfSA6ICR7bm90ZX0gLyA1YDtcclxuICAgICAgICAvLyBPbiBham91dGUgbGEgbm90ZSBkdSBtZW1icmUgY29ubmVjdMOpLCBzaSBpbCBhIHZvdMOpXHJcbiAgICAgICAgaWYgKEJhc2UudXNlcklkZW50aWZpZWQoKSAmJiB0aGlzLm9iak5vdGUudXNlciA+IDApIHtcclxuICAgICAgICAgICAgdGl0bGUgKz0gYCwgdm90cmUgbm90ZTogJHt0aGlzLm9iak5vdGUudXNlcn1gO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoY2hhbmdlKSB7XHJcbiAgICAgICAgICAgICRlbHQuYXR0cigndGl0bGUnLCB0aXRsZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aXRsZTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogQWpvdXRlIGxlIG5vbWJyZSBkZSB2b3RlcyDDoCBsYSBub3RlIGRlIGxhIHJlc3NvdXJjZVxyXG4gICAgICogQHJldHVybiB7QmFzZX1cclxuICAgICAqL1xyXG4gICAgYWRkTnVtYmVyVm90ZXJzKCkge1xyXG4gICAgICAgIGNvbnN0IF90aGlzID0gdGhpcztcclxuICAgICAgICBjb25zdCB2b3RlcyA9ICQoJy5zdGFycy5qcy1yZW5kZXItc3RhcnMnKTsgLy8gRWxlbWVudEhUTUwgYXlhbnQgcG91ciBhdHRyaWJ1dCBsZSB0aXRyZSBhdmVjIGxhIG5vdGUgZGUgbGEgc8OpcmllXHJcbiAgICAgICAgaWYgKEJhc2UuZGVidWcpXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdhZGROdW1iZXJWb3RlcnMnKTtcclxuICAgICAgICAvLyBpZiAoZGVidWcpIGNvbnNvbGUubG9nKCdhZGROdW1iZXJWb3RlcnMgTWVkaWEuY2FsbEFwaScsIGRhdGEpO1xyXG4gICAgICAgIGNvbnN0IHRpdGxlID0gdGhpcy5jaGFuZ2VUaXRsZU5vdGUodHJ1ZSk7XHJcbiAgICAgICAgLy8gT24gYWpvdXRlIHVuIG9ic2VydmVyIHN1ciBsJ2F0dHJpYnV0IHRpdGxlIGRlIGxhIG5vdGUsIGVuIGNhcyBkZSBjaGFuZ2VtZW50IGxvcnMgZCd1biB2b3RlXHJcbiAgICAgICAgbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKG11dGF0aW9uc0xpc3QpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgY2hhbmdlVGl0bGVNdXRhdGlvbiA9ICgpID0+IHtcclxuICAgICAgICAgICAgICAgIC8vIE9uIG1ldCDDoCBqb3VyIGxlIG5vbWJyZSBkZSB2b3RhbnRzLCBhaW5zaSBxdWUgbGEgbm90ZSBkdSBtZW1icmUgY29ubmVjdMOpXHJcbiAgICAgICAgICAgICAgICBjb25zdCB1cFRpdGxlID0gX3RoaXMuY2hhbmdlVGl0bGVOb3RlKGZhbHNlKTtcclxuICAgICAgICAgICAgICAgIC8vIE9uIMOpdml0ZSB1bmUgYm91Y2xlIGluZmluaWVcclxuICAgICAgICAgICAgICAgIGlmICh1cFRpdGxlICE9PSB0aXRsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZvdGVzLmF0dHIoJ3RpdGxlJywgdXBUaXRsZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGxldCBtdXRhdGlvbjtcclxuICAgICAgICAgICAgZm9yIChtdXRhdGlvbiBvZiBtdXRhdGlvbnNMaXN0KSB7XHJcbiAgICAgICAgICAgICAgICAvLyBPbiB2w6lyaWZpZSBzaSBsZSB0aXRyZSBhIMOpdMOpIG1vZGlmacOpXHJcbiAgICAgICAgICAgICAgICAvLyBAVE9ETzogQSB0ZXN0ZXJcclxuICAgICAgICAgICAgICAgIGlmICghL3ZvdGUvLnRlc3QobXV0YXRpb24udGFyZ2V0Lm5vZGVWYWx1ZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBjaGFuZ2VUaXRsZU11dGF0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KS5vYnNlcnZlKHZvdGVzLmdldCgwKSwge1xyXG4gICAgICAgICAgICBhdHRyaWJ1dGVzOiB0cnVlLFxyXG4gICAgICAgICAgICBjaGlsZExpc3Q6IGZhbHNlLFxyXG4gICAgICAgICAgICBjaGFyYWN0ZXJEYXRhOiBmYWxzZSxcclxuICAgICAgICAgICAgc3VidHJlZTogZmFsc2UsXHJcbiAgICAgICAgICAgIGF0dHJpYnV0ZUZpbHRlcjogWyd0aXRsZSddXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5CYXNlID0gQmFzZTtcclxuLy99XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbmV4cG9ydHMuQ2FjaGVVUyA9IGV4cG9ydHMuRGF0YVR5cGVzQ2FjaGUgPSB2b2lkIDA7XHJcbnZhciBEYXRhVHlwZXNDYWNoZTtcclxuKGZ1bmN0aW9uIChEYXRhVHlwZXNDYWNoZSkge1xyXG4gICAgRGF0YVR5cGVzQ2FjaGVbXCJzaG93c1wiXSA9IFwic2hvd3NcIjtcclxuICAgIERhdGFUeXBlc0NhY2hlW1wiZXBpc29kZXNcIl0gPSBcImVwaXNvZGVzXCI7XHJcbiAgICBEYXRhVHlwZXNDYWNoZVtcIm1vdmllc1wiXSA9IFwibW92aWVzXCI7XHJcbiAgICBEYXRhVHlwZXNDYWNoZVtcIm1lbWJlcnNcIl0gPSBcIm1lbWJlcnNcIjtcclxufSkoRGF0YVR5cGVzQ2FjaGUgPSBleHBvcnRzLkRhdGFUeXBlc0NhY2hlIHx8IChleHBvcnRzLkRhdGFUeXBlc0NhY2hlID0ge30pKTtcclxuLyoqXHJcbiAqIEBjbGFzcyBHZXN0aW9uIGR1IENhY2hlIHBvdXIgbGUgc2NyaXB0XHJcbiAqL1xyXG5jbGFzcyBDYWNoZVVTIHtcclxuICAgIF9kYXRhO1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2luaXQoKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogSW5pdGlhbGl6ZSBsZSBjYWNoZSBwb3VyIGNoYXF1ZSB0eXBlXHJcbiAgICAgKiBAcmV0dXJucyB0aGlzXHJcbiAgICAgKi9cclxuICAgIF9pbml0KCkge1xyXG4gICAgICAgIHRoaXMuX2RhdGFbRGF0YVR5cGVzQ2FjaGUuc2hvd3NdID0ge307XHJcbiAgICAgICAgdGhpcy5fZGF0YVtEYXRhVHlwZXNDYWNoZS5lcGlzb2Rlc10gPSB7fTtcclxuICAgICAgICB0aGlzLl9kYXRhW0RhdGFUeXBlc0NhY2hlLm1vdmllc10gPSB7fTtcclxuICAgICAgICB0aGlzLl9kYXRhW0RhdGFUeXBlc0NhY2hlLm1lbWJlcnNdID0ge307XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYW4gQXJyYXkgb2YgYWxsIGN1cnJlbnRseSBzZXQga2V5cy5cclxuICAgICAqIEByZXR1cm5zIHtBcnJheX0gY2FjaGUga2V5c1xyXG4gICAgICovXHJcbiAgICBrZXlzKHR5cGUgPSBudWxsKSB7XHJcbiAgICAgICAgaWYgKCF0eXBlKVxyXG4gICAgICAgICAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcy5fZGF0YSk7XHJcbiAgICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMuX2RhdGFbdHlwZV0pO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBDaGVja3MgaWYgYSBrZXkgaXMgY3VycmVudGx5IHNldCBpbiB0aGUgY2FjaGUuXHJcbiAgICAgKiBAcGFyYW0ge0RhdGFUeXBlc0NhY2hlfSAgdHlwZSBMZSB0eXBlIGRlIHJlc3NvdXJjZVxyXG4gICAgICogQHBhcmFtIHtTdHJpbmd8bnVtYmVyfSAgIGtleSAgdGhlIGtleSB0byBsb29rIGZvclxyXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgaWYgc2V0LCBmYWxzZSBvdGhlcndpc2VcclxuICAgICAqL1xyXG4gICAgaGFzKHR5cGUsIGtleSkge1xyXG4gICAgICAgIHJldHVybiAodGhpcy5fZGF0YVt0eXBlXSAhPT0gdW5kZWZpbmVkICYmIHRoaXMuX2RhdGFbdHlwZV1ba2V5XSAhPT0gdW5kZWZpbmVkKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogQ2xlYXJzIGFsbCBjYWNoZSBlbnRyaWVzLlxyXG4gICAgICogQHBhcmFtICAge0RhdGFUeXBlc0NhY2hlfSBbdHlwZT1udWxsXSBMZSB0eXBlIGRlIHJlc3NvdXJjZSDDoCBuZXR0b3llclxyXG4gICAgICogQHJldHVybnMgdGhpc1xyXG4gICAgICovXHJcbiAgICBjbGVhcih0eXBlID0gbnVsbCkge1xyXG4gICAgICAgIC8vIE9uIG5ldHRvaWUganVzdGUgdW4gdHlwZSBkZSByZXNzb3VyY2VcclxuICAgICAgICBpZiAodHlwZSAmJiB0aGlzLl9kYXRhW3R5cGVdICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgZm9yIChsZXQga2V5IGluIHRoaXMuX2RhdGFbdHlwZV0pIHtcclxuICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl9kYXRhW3R5cGVdW2tleV07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gT24gbmV0dG9pZSBsJ2Vuc2VtYmxlIGR1IGNhY2hlXHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIEdldHMgdGhlIGNhY2hlIGVudHJ5IGZvciB0aGUgZ2l2ZW4ga2V5LlxyXG4gICAgICogQHBhcmFtIHtEYXRhVHlwZXNDYWNoZX0gIHR5cGUgTGUgdHlwZSBkZSByZXNzb3VyY2VcclxuICAgICAqIEBwYXJhbSB7U3RyaW5nfG51bWJlcn0gICBrZXkgIHRoZSBjYWNoZSBrZXlcclxuICAgICAqIEByZXR1cm5zIHsqfSB0aGUgY2FjaGUgZW50cnkgaWYgc2V0LCBvciB1bmRlZmluZWQgb3RoZXJ3aXNlXHJcbiAgICAgKi9cclxuICAgIGdldCh0eXBlLCBrZXkpIHtcclxuICAgICAgICBpZiAodGhpcy5oYXModHlwZSwga2V5KSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZGF0YVt0eXBlXVtrZXldO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgY2FjaGUgZW50cnkgaWYgc2V0LCBvciBhIGRlZmF1bHQgdmFsdWUgb3RoZXJ3aXNlLlxyXG4gICAgICogQHBhcmFtIHtEYXRhVHlwZXNDYWNoZX0gIHR5cGUgTGUgdHlwZSBkZSByZXNzb3VyY2VcclxuICAgICAqIEBwYXJhbSB7U3RyaW5nfG51bWJlcn0gICBrZXkgIHRoZSBrZXkgdG8gcmV0cmlldmVcclxuICAgICAqIEBwYXJhbSB7Kn0gICAgICAgICAgICAgICBkZWYgIHRoZSBkZWZhdWx0IHZhbHVlIHRvIHJldHVybiBpZiB1bnNldFxyXG4gICAgICogQHJldHVybnMgeyp9IHRoZSBjYWNoZSBlbnRyeSBpZiBzZXQsIG9yIHRoZSBkZWZhdWx0IHZhbHVlIHByb3ZpZGVkLlxyXG4gICAgICovXHJcbiAgICBnZXRPckRlZmF1bHQodHlwZSwga2V5LCBkZWYpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5oYXModHlwZSwga2V5KSA/IHRoaXMuZ2V0KHR5cGUsIGtleSkgOiBkZWY7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFNldHMgYSBjYWNoZSBlbnRyeSB3aXRoIHRoZSBwcm92aWRlZCBrZXkgYW5kIHZhbHVlLlxyXG4gICAgICogQHBhcmFtIHtEYXRhVHlwZXNDYWNoZX0gIHR5cGUgIExlIHR5cGUgZGUgcmVzc291cmNlXHJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ3xudW1iZXJ9ICAga2V5ICAgdGhlIGtleSB0byBzZXRcclxuICAgICAqIEBwYXJhbSB7Kn0gICAgICAgICAgICAgICB2YWx1ZSB0aGUgdmFsdWUgdG8gc2V0XHJcbiAgICAgKiBAcmV0dXJucyB0aGlzXHJcbiAgICAgKi9cclxuICAgIHNldCh0eXBlLCBrZXksIHZhbHVlKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2RhdGFbdHlwZV0gIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICB0aGlzLl9kYXRhW3R5cGVdW2tleV0gPSB2YWx1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFJlbW92ZXMgdGhlIGNhY2hlIGVudHJ5IGZvciB0aGUgZ2l2ZW4ga2V5LlxyXG4gICAgICogQHBhcmFtIHtEYXRhVHlwZXNDYWNoZX0gIHR5cGUgIExlIHR5cGUgZGUgcmVzc291cmNlXHJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ3xudW1iZXJ9ICAga2V5IHRoZSBrZXkgdG8gcmVtb3ZlXHJcbiAgICAgKiBAcmV0dXJucyB0aGlzXHJcbiAgICAgKi9cclxuICAgIHJlbW92ZSh0eXBlLCBrZXkpIHtcclxuICAgICAgICBpZiAodGhpcy5oYXModHlwZSwga2V5KSkge1xyXG4gICAgICAgICAgICBkZWxldGUgdGhpcy5fZGF0YVt0eXBlXVtrZXldO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxufVxyXG5leHBvcnRzLkNhY2hlVVMgPSBDYWNoZVVTO1xyXG4vL31cclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxuZXhwb3J0cy5DaGFyYWN0ZXIgPSB2b2lkIDA7XHJcbi8vIG5hbWVzcGFjZSBCUyB7XHJcbmNsYXNzIENoYXJhY3RlciB7XHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhKSB7XHJcbiAgICAgICAgdGhpcy5hY3RvciA9IGRhdGEuYWN0b3I7XHJcbiAgICAgICAgdGhpcy5waWN0dXJlID0gZGF0YS5waWN0dXJlO1xyXG4gICAgICAgIHRoaXMubmFtZSA9IGRhdGEubmFtZTtcclxuICAgICAgICB0aGlzLmd1ZXN0ID0gZGF0YS5ndWVzdDtcclxuICAgICAgICB0aGlzLmlkID0gcGFyc2VJbnQoZGF0YS5pZCwgMTApO1xyXG4gICAgICAgIHRoaXMuZGVzY3JpcHRpb24gPSBkYXRhLmRlc2NyaXB0aW9uO1xyXG4gICAgICAgIHRoaXMucm9sZSA9IGRhdGEucm9sZTtcclxuICAgICAgICB0aGlzLnNob3dfaWQgPSBwYXJzZUludChkYXRhLnNob3dfaWQsIDEwKTtcclxuICAgICAgICB0aGlzLm1vdmllX2lkID0gcGFyc2VJbnQoZGF0YS5tb3ZpZV9pZCwgMTApO1xyXG4gICAgfVxyXG4gICAgYWN0b3I7XHJcbiAgICBkZXNjcmlwdGlvbjtcclxuICAgIGd1ZXN0O1xyXG4gICAgaWQ7XHJcbiAgICBuYW1lO1xyXG4gICAgcGljdHVyZTtcclxuICAgIHJvbGU7XHJcbiAgICBzaG93X2lkO1xyXG4gICAgbW92aWVfaWQ7XHJcbn1cclxuZXhwb3J0cy5DaGFyYWN0ZXIgPSBDaGFyYWN0ZXI7XHJcbi8vIH1cclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxuZXhwb3J0cy5Db21tZW50QlMgPSB2b2lkIDA7XHJcbi8vIG5hbWVzcGFjZSBCUyB7XHJcbmNsYXNzIENvbW1lbnRCUyB7XHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhKSB7XHJcbiAgICAgICAgdGhpcy5pZCA9IHBhcnNlSW50KGRhdGEuaWQsIDEwKTtcclxuICAgICAgICB0aGlzLnJlZmVyZW5jZSA9IGRhdGEucmVmZXJlbmNlO1xyXG4gICAgICAgIHRoaXMudHlwZSA9IGRhdGEudHlwZTtcclxuICAgICAgICB0aGlzLnJlZl9pZCA9IHBhcnNlSW50KGRhdGEucmVmX2lkLCAxMCk7XHJcbiAgICAgICAgdGhpcy51c2VyX2lkID0gcGFyc2VJbnQoZGF0YS51c2VyX2lkLCAxMCk7XHJcbiAgICAgICAgdGhpcy5sb2dpbiA9IGRhdGEubG9naW47XHJcbiAgICAgICAgdGhpcy5hdmF0YXIgPSBkYXRhLmF2YXRhcjtcclxuICAgICAgICB0aGlzLmRhdGUgPSBuZXcgRGF0ZShkYXRhLmRhdGUpO1xyXG4gICAgICAgIHRoaXMudGV4dCA9IGRhdGEudGV4dDtcclxuICAgICAgICB0aGlzLmlubmVyX2lkID0gcGFyc2VJbnQoZGF0YS5pbm5lcl9pZCwgMTApO1xyXG4gICAgICAgIHRoaXMuaW5fcmVwbHlfdG8gPSBwYXJzZUludChkYXRhLmluX3JlcGx5X3RvLCAxMCk7XHJcbiAgICAgICAgdGhpcy51c2VyX25vdGUgPSBwYXJzZUludChkYXRhLnVzZXJfbm90ZSwgMTApO1xyXG4gICAgfVxyXG4gICAgaWQ7XHJcbiAgICByZWZlcmVuY2U7XHJcbiAgICB0eXBlO1xyXG4gICAgcmVmX2lkO1xyXG4gICAgdXNlcl9pZDtcclxuICAgIGxvZ2luO1xyXG4gICAgYXZhdGFyO1xyXG4gICAgZGF0ZTtcclxuICAgIHRleHQ7XHJcbiAgICBpbm5lcl9pZDtcclxuICAgIGluX3JlcGx5X3RvO1xyXG4gICAgdXNlcl9ub3RlO1xyXG59XHJcbmV4cG9ydHMuQ29tbWVudEJTID0gQ29tbWVudEJTO1xyXG4vLyB9XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbmV4cG9ydHMuRXBpc29kZSA9IHZvaWQgMDtcclxuLy8gbmFtZXNwYWNlIEJTIHtcclxuY29uc3QgQmFzZV8xID0gcmVxdWlyZShcIi4vQmFzZVwiKTtcclxuY29uc3QgQ2FjaGVfMSA9IHJlcXVpcmUoXCIuL0NhY2hlXCIpO1xyXG5jb25zdCBTaG93XzEgPSByZXF1aXJlKFwiLi9TaG93XCIpO1xyXG5jb25zdCBTdWJ0aXRsZV8xID0gcmVxdWlyZShcIi4vU3VidGl0bGVcIik7XHJcbmNsYXNzIEVwaXNvZGUgZXh0ZW5kcyBCYXNlXzEuQmFzZSB7XHJcbiAgICBjb2RlO1xyXG4gICAgZGF0ZTtcclxuICAgIGVwaXNvZGU7XHJcbiAgICBnbG9iYWw7XHJcbiAgICBzZWFzb247XHJcbiAgICBwbGF0Zm9ybV9saW5rcztcclxuICAgIHNlZW5fdG90YWw7XHJcbiAgICBzaG93O1xyXG4gICAgc3BlY2lhbDtcclxuICAgIHN1YnRpdGxlcztcclxuICAgIHRoZXR2ZGJfaWQ7XHJcbiAgICB5b3V0dWJlX2lkO1xyXG4gICAgY29uc3RydWN0b3IoZGF0YSwgc2hvdykge1xyXG4gICAgICAgIHN1cGVyKGRhdGEpO1xyXG4gICAgICAgIHRoaXMuc2hvdyA9IHNob3c7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZmlsbChkYXRhKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogUmVtcGxpdCBsJ29iamV0IGF2ZWMgbGVzIGRvbm7DqWVzIGZvdXJuaXQgZW4gcGFyYW3DqHRyZVxyXG4gICAgICogQHBhcmFtICB7YW55fSBkYXRhIExlcyBkb25uw6llcyBwcm92ZW5hbnQgZGUgbCdBUElcclxuICAgICAqIEByZXR1cm5zIHtFcGlzb2RlfVxyXG4gICAgICovXHJcbiAgICBmaWxsKGRhdGEpIHtcclxuICAgICAgICB0aGlzLmNvZGUgPSBkYXRhLmNvZGU7XHJcbiAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUoZGF0YS5kYXRlKTtcclxuICAgICAgICB0aGlzLmVwaXNvZGUgPSBwYXJzZUludChkYXRhLmVwaXNvZGUsIDEwKTtcclxuICAgICAgICB0aGlzLmdsb2JhbCA9IHBhcnNlSW50KGRhdGEuZ2xvYmFsLCAxMCk7XHJcbiAgICAgICAgdGhpcy5zZWFzb24gPSBwYXJzZUludChkYXRhLnNlYXNvbiwgMTApO1xyXG4gICAgICAgIHRoaXMucGxhdGZvcm1fbGlua3MgPSBkYXRhLnBsYXRmb3JtX2xpbmtzO1xyXG4gICAgICAgIHRoaXMuc2Vlbl90b3RhbCA9IHBhcnNlSW50KGRhdGEuc2Vlbl90b3RhbCwgMTApO1xyXG4gICAgICAgIHRoaXMuc3BlY2lhbCA9IGRhdGEuc3BlY2lhbCA9PT0gMSA/IHRydWUgOiBmYWxzZTtcclxuICAgICAgICB0aGlzLnN1YnRpdGxlcyA9IG5ldyBBcnJheSgpO1xyXG4gICAgICAgIGZvciAobGV0IHMgPSAwOyBzIDwgZGF0YS5zdWJ0aXRsZXMubGVuZ3RoOyBzKyspIHtcclxuICAgICAgICAgICAgdGhpcy5zdWJ0aXRsZXMucHVzaChuZXcgU3VidGl0bGVfMS5TdWJ0aXRsZShkYXRhLnN1YnRpdGxlc1tzXSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnRoZXR2ZGJfaWQgPSBwYXJzZUludChkYXRhLnRoZXR2ZGJfaWQsIDEwKTtcclxuICAgICAgICB0aGlzLnlvdXR1YmVfaWQgPSBkYXRhLnlvdXR1YmVfaWQ7XHJcbiAgICAgICAgdGhpcy5tZWRpYVR5cGUgPSB7IHNpbmd1bGFyOiBCYXNlXzEuTWVkaWFUeXBlLmVwaXNvZGUsIHBsdXJhbDogJ2VwaXNvZGVzJywgY2xhc3NOYW1lOiBFcGlzb2RlIH07XHJcbiAgICAgICAgc3VwZXIuZmlsbChkYXRhKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogQWpvdXRlIGxlIHRpdHJlIGRlIGwnw6lwaXNvZGUgw6AgbCdhdHRyaWJ1dCBUaXRsZVxyXG4gICAgICogZHUgRE9NRWxlbWVudCBjb3JyZXNwb25kYW50IGF1IHRpdHJlIGRlIGwnw6lwaXNvZGVcclxuICAgICAqIHN1ciBsYSBwYWdlIFdlYlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm4ge0VwaXNvZGV9IEwnw6lwaXNvZGVcclxuICAgICAqL1xyXG4gICAgYWRkQXR0clRpdGxlKCkge1xyXG4gICAgICAgIC8vIEFqb3V0IGRlIGwnYXR0cmlidXQgdGl0bGUgcG91ciBvYnRlbmlyIGxlIG5vbSBjb21wbGV0IGRlIGwnw6lwaXNvZGUsIGxvcnNxdSdpbCBlc3QgdHJvbnF1w6lcclxuICAgICAgICBpZiAodGhpcy5lbHQpXHJcbiAgICAgICAgICAgIHRoaXMuZWx0LmZpbmQoJy5zbGlkZV9fdGl0bGUnKS5hdHRyKCd0aXRsZScsIHRoaXMudGl0bGUpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBNZXQgw6Agam91ciBsZSBET01FbGVtZW50IC5jaGVja1NlZW4gYXZlYyBsZXNcclxuICAgICAqIGRvbm7DqWVzIGRlIGwnw6lwaXNvZGUgKGlkLCBwb3MsIHNwZWNpYWwpXHJcbiAgICAgKiBAcGFyYW0gIHtudW1iZXJ9IHBvcyAgTGEgcG9zaXRpb24gZGUgbCfDqXBpc29kZSBkYW5zIGxhIGxpc3RlXHJcbiAgICAgKiBAcmV0dXJuIHtFcGlzb2RlfVxyXG4gICAgICovXHJcbiAgICBpbml0Q2hlY2tTZWVuKHBvcykge1xyXG4gICAgICAgIGNvbnN0ICRjaGVja2JveCA9IHRoaXMuZWx0LmZpbmQoJy5jaGVja1NlZW4nKTtcclxuICAgICAgICBpZiAoJGNoZWNrYm94Lmxlbmd0aCA+IDAgJiYgdGhpcy51c2VyLnNlZW4pIHtcclxuICAgICAgICAgICAgLy8gT24gYWpvdXRlIGwnYXR0cmlidXQgSUQgZXQgbGEgY2xhc3NlICdzZWVuJyDDoCBsYSBjYXNlICdjaGVja1NlZW4nIGRlIGwnw6lwaXNvZGUgZMOpasOgIHZ1XHJcbiAgICAgICAgICAgICRjaGVja2JveC5hdHRyKCdpZCcsICdlcGlzb2RlLScgKyB0aGlzLmlkKTtcclxuICAgICAgICAgICAgJGNoZWNrYm94LmF0dHIoJ2RhdGEtaWQnLCB0aGlzLmlkKTtcclxuICAgICAgICAgICAgJGNoZWNrYm94LmF0dHIoJ2RhdGEtcG9zJywgcG9zKTtcclxuICAgICAgICAgICAgJGNoZWNrYm94LmF0dHIoJ2RhdGEtc3BlY2lhbCcsIHRoaXMuc3BlY2lhbCA/ICcxJyA6ICcwJyk7XHJcbiAgICAgICAgICAgICRjaGVja2JveC5hdHRyKCd0aXRsZScsIEJhc2VfMS5CYXNlLnRyYW5zKFwibWVtYmVyX3Nob3dzLnJlbW92ZVwiKSk7XHJcbiAgICAgICAgICAgICRjaGVja2JveC5hZGRDbGFzcygnc2VlbicpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICgkY2hlY2tib3gubGVuZ3RoIDw9IDAgJiYgIXRoaXMudXNlci5zZWVuICYmICF0aGlzLnVzZXIuaGlkZGVuKSB7XHJcbiAgICAgICAgICAgIC8vIE9uIGFqb3V0ZSBsYSBjYXNlIMOgIGNvY2hlciBwb3VyIHBlcm1ldHRyZSBkJ2luZGlxdWVyIGwnw6lwaXNvZGUgY29tbWUgdnVcclxuICAgICAgICAgICAgdGhpcy5lbHQuZmluZCgnLnNsaWRlX19pbWFnZScpXHJcbiAgICAgICAgICAgICAgICAuYXBwZW5kKGA8ZGl2IGlkPVwiZXBpc29kZS0ke3RoaXMuaWR9XCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzPVwiY2hlY2tTZWVuXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEtaWQ9XCIke3RoaXMuaWR9XCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEtcG9zPVwiJHtwb3N9XCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEtc3BlY2lhbD1cIiR7dGhpcy5zcGVjaWFsfVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZT1cImJhY2tncm91bmQ6IHJnYmEoMTMsMjEsMjgsLjIpO1wiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZT1cIiR7QmFzZV8xLkJhc2UudHJhbnMoXCJtZW1iZXJfc2hvd3MubWFya2FzXCIpfVwiPjwvZGl2PmApO1xyXG4gICAgICAgICAgICB0aGlzLmVsdC5maW5kKCcuc2xpZGVfX2ltYWdlIGltZy5qcy1sYXp5LWltYWdlJykuYXR0cignc3R5bGUnLCAnZmlsdGVyOiBibHVyKDVweCk7Jyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKCRjaGVja2JveC5sZW5ndGggPiAwICYmIHRoaXMudXNlci5oaWRkZW4pIHtcclxuICAgICAgICAgICAgJGNoZWNrYm94LnJlbW92ZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogTWV0IMOgIGpvdXIgbGVzIGluZm9zIGRlIGxhIHZpZ25ldHRlIGV0IGFwcGVsbGUgbGEgZm9uY3Rpb24gZCd1cGRhdGUgZHUgcmVuZHVcclxuICAgICAqIEBwYXJhbSAge251bWJlcn0gcG9zIExhIHBvc2l0aW9uIGRlIGwnw6lwaXNvZGUgZGFucyBsYSBsaXN0ZVxyXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn0gICAgSW5kaXF1ZSBzaSBpbCB5IGEgZXUgdW4gY2hhbmdlbWVudFxyXG4gICAgICovXHJcbiAgICB1cGRhdGVDaGVja1NlZW4ocG9zKSB7XHJcbiAgICAgICAgY29uc3QgJGNoZWNrU2VlbiA9IHRoaXMuZWx0LmZpbmQoJy5jaGVja1NlZW4nKTtcclxuICAgICAgICBsZXQgY2hhbmdlZCA9IGZhbHNlO1xyXG4gICAgICAgIGlmICgkY2hlY2tTZWVuLmxlbmd0aCA+IDAgJiYgJGNoZWNrU2Vlbi5hdHRyKCdpZCcpID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgaWYgKEJhc2VfMS5CYXNlLmRlYnVnKVxyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2Fqb3V0IGRlIGxcXCdhdHRyaWJ1dCBJRCDDoCBsXFwnw6lsw6ltZW50IFwiY2hlY2tTZWVuXCInKTtcclxuICAgICAgICAgICAgLy8gT24gYWpvdXRlIGwnYXR0cmlidXQgSURcclxuICAgICAgICAgICAgJGNoZWNrU2Vlbi5hdHRyKCdpZCcsICdlcGlzb2RlLScgKyB0aGlzLmlkKTtcclxuICAgICAgICAgICAgJGNoZWNrU2Vlbi5kYXRhKCdpZCcsIHRoaXMuaWQpO1xyXG4gICAgICAgICAgICAkY2hlY2tTZWVuLmRhdGEoJ3BvcycsIHBvcyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGlmIChCYXNlLmRlYnVnKSBjb25zb2xlLmxvZygndXBkYXRlQ2hlY2tTZWVuJywge3NlZW46IHRoaXMudXNlci5zZWVuLCBlbHQ6IHRoaXMuZWx0LCBjaGVja1NlZW46ICRjaGVja1NlZW4ubGVuZ3RoLCBjbGFzc1NlZW46ICRjaGVja1NlZW4uaGFzQ2xhc3MoJ3NlZW4nKSwgcG9zOiBwb3MsIEVwaXNvZGU6IHRoaXN9KTtcclxuICAgICAgICAvLyBTaSBsZSBtZW1icmUgYSB2dSBsJ8OpcGlzb2RlIGV0IHF1J2lsIG4nZXN0IHBhcyBpbmRpcXXDqSwgb24gY2hhbmdlIGxlIHN0YXR1dFxyXG4gICAgICAgIGlmICh0aGlzLnVzZXIuc2VlbiAmJiAkY2hlY2tTZWVuLmxlbmd0aCA+IDAgJiYgISRjaGVja1NlZW4uaGFzQ2xhc3MoJ3NlZW4nKSkge1xyXG4gICAgICAgICAgICBpZiAoQmFzZV8xLkJhc2UuZGVidWcpXHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQ2hhbmdlbWVudCBkdSBzdGF0dXQgKHNlZW4pIGRlIGxcXCfDqXBpc29kZSAlcycsIHRoaXMuY29kZSk7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlUmVuZGVyKCdzZWVuJywgZmFsc2UpO1xyXG4gICAgICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gU2kgbGUgbWVtYnJlIG4nYSBwYXMgdnUgbCfDqXBpc29kZSBldCBxdSdpbCBuJ2VzdCBwYXMgaW5kaXF1w6ksIG9uIGNoYW5nZSBsZSBzdGF0dXRcclxuICAgICAgICBlbHNlIGlmICghdGhpcy51c2VyLnNlZW4gJiYgJGNoZWNrU2Vlbi5sZW5ndGggPiAwICYmICRjaGVja1NlZW4uaGFzQ2xhc3MoJ3NlZW4nKSkge1xyXG4gICAgICAgICAgICBpZiAoQmFzZV8xLkJhc2UuZGVidWcpXHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQ2hhbmdlbWVudCBkdSBzdGF0dXQgKG5vdFNlZW4pIGRlIGxcXCfDqXBpc29kZSAlcycsIHRoaXMuY29kZSk7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlUmVuZGVyKCdub3RTZWVuJywgZmFsc2UpO1xyXG4gICAgICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAodGhpcy51c2VyLmhpZGRlbiAmJiAkY2hlY2tTZWVuLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgJGNoZWNrU2Vlbi5yZW1vdmUoKTtcclxuICAgICAgICAgICAgY2hhbmdlZCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBjaGFuZ2VkO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXRvdXJuZSBsZSBjb2RlIEhUTUwgZHUgdGl0cmUgZGUgbGEgcG9wdXBcclxuICAgICAqIHBvdXIgbCdhZmZpY2hhZ2UgZGUgbGEgZGVzY3JpcHRpb25cclxuICAgICAqIEByZXR1cm4ge3N0cmluZ31cclxuICAgICAqL1xyXG4gICAgZ2V0VGl0bGVQb3B1cCgpIHtcclxuICAgICAgICByZXR1cm4gYDxzcGFuIHN0eWxlPVwiY29sb3I6IHZhcigtLWxpbmtfY29sb3IpO1wiPlN5bm9wc2lzIMOpcGlzb2RlICR7dGhpcy5jb2RlfTwvc3Bhbj5gO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBNb2RpZmllIGxlIHN0YXR1dCBkJ3VuIMOpcGlzb2RlIHN1ciBsJ0FQSVxyXG4gICAgICogQHBhcmFtICB7U3RyaW5nfSBzdGF0dXMgICAgTGUgbm91dmVhdSBzdGF0dXQgZGUgbCfDqXBpc29kZVxyXG4gICAgICogQHBhcmFtICB7U3RyaW5nfSBtZXRob2QgICAgVmVyYmUgSFRUUCB1dGlsaXPDqSBwb3VyIGxhIHJlcXXDqnRlIMOgIGwnQVBJXHJcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxyXG4gICAgICovXHJcbiAgICB1cGRhdGVTdGF0dXMoc3RhdHVzLCBtZXRob2QpIHtcclxuICAgICAgICBjb25zdCBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgY29uc3QgcG9zID0gdGhpcy5lbHQuZmluZCgnLmNoZWNrU2VlbicpLmRhdGEoJ3BvcycpO1xyXG4gICAgICAgIGxldCBwcm9taXNlID0gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7IHJlc29sdmUoZmFsc2UpOyB9KTtcclxuICAgICAgICBsZXQgYXJncyA9IHsgaWQ6IHRoaXMuaWQsIGJ1bGs6IHRydWUgfTtcclxuICAgICAgICBpZiAobWV0aG9kID09PSBCYXNlXzEuSFRUUF9WRVJCUy5QT1NUKSB7XHJcbiAgICAgICAgICAgIGxldCBjcmVhdGVQcm9taXNlID0gKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBQb3B1cEFsZXJ0KHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6ICdFcGlzb2RlcyB2dXMnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiAnRG9pdC1vbiBjb2NoZXIgbGVzIMOpcGlzb2RlcyBwcsOpY8OpZGVudHMgY29tbWUgdnUgPycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrX3llczogKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tfbm86ICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgY29uc3QgJHZpZ25ldHRlcyA9IGpRdWVyeSgnI2VwaXNvZGVzIC5jaGVja1NlZW4nKTtcclxuICAgICAgICAgICAgLy8gT24gdmVyaWZpZSBzaSBsZXMgw6lwaXNvZGVzIHByw6ljw6lkZW50cyBvbnQgYmllbiDDqXTDqSBpbmRpcXXDqXMgY29tbWUgdnVcclxuICAgICAgICAgICAgZm9yIChsZXQgdiA9IDA7IHYgPCBwb3M7IHYrKykge1xyXG4gICAgICAgICAgICAgICAgaWYgKCEkKCR2aWduZXR0ZXMuZ2V0KHYpKS5oYXNDbGFzcygnc2VlbicpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcHJvbWlzZSA9IGNyZWF0ZVByb21pc2UoKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBwcm9taXNlLnRoZW4ocmVzcG9uc2UgPT4ge1xyXG4gICAgICAgICAgICBpZiAobWV0aG9kID09PSBCYXNlXzEuSFRUUF9WRVJCUy5QT1NUICYmICFyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgYXJncy5idWxrID0gZmFsc2U7IC8vIEZsYWcgcG91ciBuZSBwYXMgbWV0dHJlIGxlcyDDqXBpc29kZXMgcHLDqWPDqWRlbnRzIGNvbW1lIHZ1cyBhdXRvbWF0aXF1ZW1lbnRcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBCYXNlXzEuQmFzZS5jYWxsQXBpKG1ldGhvZCwgJ2VwaXNvZGVzJywgJ3dhdGNoZWQnLCBhcmdzKS50aGVuKGRhdGEgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKEJhc2VfMS5CYXNlLmRlYnVnKVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCd1cGRhdGVTdGF0dXMgJXMgZXBpc29kZXMvd2F0Y2hlZCcsIG1ldGhvZCwgZGF0YSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoIShfdGhpcy5zaG93IGluc3RhbmNlb2YgU2hvd18xLlNob3cpICYmIEJhc2VfMS5CYXNlLmNhY2hlLmhhcyhDYWNoZV8xLkRhdGFUeXBlc0NhY2hlLnNob3dzLCBkYXRhLnNob3cuaWQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuc2hvdyA9IEJhc2VfMS5CYXNlLmNhY2hlLmdldChDYWNoZV8xLkRhdGFUeXBlc0NhY2hlLnNob3dzLCBkYXRhLnNob3cuaWQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8gU2kgdW4gw6lwaXNvZGUgZXN0IHZ1IGV0IHF1ZSBsYSBzw6lyaWUgbidhIHBhcyDDqXTDqSBham91dMOpZVxyXG4gICAgICAgICAgICAgICAgLy8gYXUgY29tcHRlIGR1IG1lbWJyZSBjb25uZWN0w6lcclxuICAgICAgICAgICAgICAgIGlmICghX3RoaXMuc2hvdy5pbl9hY2NvdW50ICYmIGRhdGEuZXBpc29kZS5zaG93LmluX2FjY291bnQpIHtcclxuICAgICAgICAgICAgICAgICAgICBfdGhpcy5zaG93LmluX2FjY291bnQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIF90aGlzLnNob3dcclxuICAgICAgICAgICAgICAgICAgICAgICAgLnNhdmUoKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuYWRkU2hvd0NsaWNrKHRydWUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8gT24gbWV0IMOgIGpvdXIgbCdvYmpldCBFcGlzb2RlXHJcbiAgICAgICAgICAgICAgICBpZiAobWV0aG9kID09PSBCYXNlXzEuSFRUUF9WRVJCUy5QT1NUICYmIHJlc3BvbnNlICYmIHBvcykge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0ICR2aWduZXR0ZXMgPSBqUXVlcnkoJyNlcGlzb2RlcyAuc2xpZGVfZmxleCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBlcGlzb2RlID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBlID0gMDsgZSA8IHBvczsgZSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVwaXNvZGUgPSBfdGhpcy5zaG93LmN1cnJlbnRTZWFzb24uZXBpc29kZXNbZV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlcGlzb2RlLmVsdCA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXBpc29kZS5lbHQgPSBqUXVlcnkoJHZpZ25ldHRlcy5nZXQoZSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghZXBpc29kZS51c2VyLnNlZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVwaXNvZGUudXNlci5zZWVuID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVwaXNvZGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudXBkYXRlUmVuZGVyKCdzZWVuJywgZmFsc2UpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnNhdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIF90aGlzXHJcbiAgICAgICAgICAgICAgICAgICAgLmZpbGwoZGF0YS5lcGlzb2RlKVxyXG4gICAgICAgICAgICAgICAgICAgIC51cGRhdGVSZW5kZXIoc3RhdHVzLCB0cnVlKVxyXG4gICAgICAgICAgICAgICAgICAgIC5zYXZlKClcclxuICAgICAgICAgICAgICAgICAgICAuX2NhbGxMaXN0ZW5lcnMoQmFzZV8xLkV2ZW50VHlwZXMuVVBEQVRFKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5jYXRjaChlcnIgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKEJhc2VfMS5CYXNlLmRlYnVnKVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ3VwZGF0ZVN0YXR1cyBlcnJvciAlcycsIGVycik7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXJyICYmIGVyciA9PSAnY2hhbmdlU3RhdHVzJykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChCYXNlXzEuQmFzZS5kZWJ1ZylcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3VwZGF0ZVN0YXR1cyBlcnJvciAlcyBjaGFuZ2VTdGF0dXMnLCBtZXRob2QpO1xyXG4gICAgICAgICAgICAgICAgICAgIF90aGlzLnVwZGF0ZVJlbmRlcihzdGF0dXMpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMudG9nZ2xlU3Bpbm5lcihmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgQmFzZV8xLkJhc2Uubm90aWZpY2F0aW9uKCdFcnJldXIgZGUgbW9kaWZpY2F0aW9uIGRcXCd1biDDqXBpc29kZScsICd1cGRhdGVTdGF0dXM6ICcgKyBlcnIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogQ2hhbmdlIGxlIHN0YXR1dCB2aXN1ZWwgZGUgbGEgdmlnbmV0dGUgc3VyIGxlIHNpdGVcclxuICAgICAqIEBwYXJhbSAge1N0cmluZ30gbmV3U3RhdHVzICAgICBMZSBub3V2ZWF1IHN0YXR1dCBkZSBsJ8OpcGlzb2RlXHJcbiAgICAgKiBAcGFyYW0gIHtib29sfSAgIFt1cGRhdGU9dHJ1ZV0gTWlzZSDDoCBqb3VyIGRlIGxhIHJlc3NvdXJjZSBlbiBjYWNoZSBldCBkZXMgw6lsw6ltZW50cyBkJ2FmZmljaGFnZVxyXG4gICAgICogQHJldHVybiB7RXBpc29kZX1cclxuICAgICAqL1xyXG4gICAgdXBkYXRlUmVuZGVyKG5ld1N0YXR1cywgdXBkYXRlID0gdHJ1ZSkge1xyXG4gICAgICAgIGNvbnN0IF90aGlzID0gdGhpcztcclxuICAgICAgICBjb25zdCAkZWx0ID0gdGhpcy5lbHQuZmluZCgnLmNoZWNrU2VlbicpO1xyXG4gICAgICAgIGNvbnN0IGxlbkVwaXNvZGVzID0galF1ZXJ5KCcjZXBpc29kZXMgLmNoZWNrU2VlbicpLmxlbmd0aDtcclxuICAgICAgICBjb25zdCBsZW5Ob3RTcGVjaWFsID0galF1ZXJ5KCcjZXBpc29kZXMgLmNoZWNrU2VlbltkYXRhLXNwZWNpYWw9XCIwXCJdJykubGVuZ3RoO1xyXG4gICAgICAgIGlmIChCYXNlXzEuQmFzZS5kZWJ1ZylcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ2NoYW5nZVN0YXR1cycsIHsgZWx0OiAkZWx0LCBzdGF0dXM6IG5ld1N0YXR1cywgdXBkYXRlOiB1cGRhdGUgfSk7XHJcbiAgICAgICAgaWYgKG5ld1N0YXR1cyA9PT0gJ3NlZW4nKSB7XHJcbiAgICAgICAgICAgICRlbHQuY3NzKCdiYWNrZ3JvdW5kJywgJycpOyAvLyBPbiBham91dGUgbGUgY2hlY2sgZGFucyBsYSBjYXNlIMOgIGNvY2hlclxyXG4gICAgICAgICAgICAkZWx0LmFkZENsYXNzKCdzZWVuJyk7IC8vIE9uIGFqb3V0ZSBsYSBjbGFzc2UgJ3NlZW4nXHJcbiAgICAgICAgICAgICRlbHQuYXR0cigndGl0bGUnLCBCYXNlXzEuQmFzZS50cmFucyhcIm1lbWJlcl9zaG93cy5yZW1vdmVcIikpO1xyXG4gICAgICAgICAgICAvLyBPbiBzdXBwcmltZSBsZSB2b2lsZSBtYXNxdWFudCBzdXIgbGEgdmlnbmV0dGUgcG91ciB2b2lyIGwnaW1hZ2UgZGUgbCfDqXBpc29kZVxyXG4gICAgICAgICAgICAkZWx0LnBhcmVudCgnZGl2LnNsaWRlX19pbWFnZScpLmZpbmQoJ2ltZycpLnJlbW92ZUF0dHIoJ3N0eWxlJyk7XHJcbiAgICAgICAgICAgICRlbHQucGFyZW50cygnZGl2LnNsaWRlX2ZsZXgnKS5yZW1vdmVDbGFzcygnc2xpZGUtLW5vdFNlZW4nKTtcclxuICAgICAgICAgICAgY29uc3QgbW92ZVNlYXNvbiA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHNsaWRlQ3VycmVudCA9IGpRdWVyeSgnI3NlYXNvbnMgZGl2LnNsaWRlLS1jdXJyZW50Jyk7XHJcbiAgICAgICAgICAgICAgICAvLyBPbiBjaGVjayBsYSBzYWlzb25cclxuICAgICAgICAgICAgICAgIHNsaWRlQ3VycmVudC5maW5kKCcuc2xpZGVfX2ltYWdlJykucHJlcGVuZCgnPGRpdiBjbGFzcz1cImNoZWNrU2VlblwiPjwvZGl2PicpO1xyXG4gICAgICAgICAgICAgICAgc2xpZGVDdXJyZW50XHJcbiAgICAgICAgICAgICAgICAgICAgLnJlbW92ZUNsYXNzKCdzbGlkZS0tbm90U2VlbicpXHJcbiAgICAgICAgICAgICAgICAgICAgLmFkZENsYXNzKCdzbGlkZS0tc2VlbicpO1xyXG4gICAgICAgICAgICAgICAgaWYgKEJhc2VfMS5CYXNlLmRlYnVnKVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdUb3VzIGxlcyDDqXBpc29kZXMgZGUgbGEgc2Fpc29uIG9udCDDqXTDqSB2dXMnLCBzbGlkZUN1cnJlbnQpO1xyXG4gICAgICAgICAgICAgICAgLy8gU2kgaWwgeSBhIHVuZSBzYWlzb24gc3VpdmFudGUsIG9uIGxhIHPDqWxlY3Rpb25uZVxyXG4gICAgICAgICAgICAgICAgaWYgKHNsaWRlQ3VycmVudC5uZXh0KCkubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChCYXNlXzEuQmFzZS5kZWJ1ZylcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0lsIHkgYSB1bmUgYXV0cmUgc2Fpc29uJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVDdXJyZW50Lm5leHQoKS50cmlnZ2VyKCdjbGljaycpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBzZWFzb25OdW1iZXIgPSBfdGhpcy5zaG93LmN1cnJlbnRTZWFzb24ubnVtYmVyICsgMTtcclxuICAgICAgICAgICAgICAgICAgICBfdGhpcy5zaG93LnNldEN1cnJlbnRTZWFzb24oc2Vhc29uTnVtYmVyKTtcclxuICAgICAgICAgICAgICAgICAgICBzbGlkZUN1cnJlbnRcclxuICAgICAgICAgICAgICAgICAgICAgICAgLnJlbW92ZUNsYXNzKCdzbGlkZS0tY3VycmVudCcpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBjb25zdCBsZW5TZWVuID0galF1ZXJ5KCcjZXBpc29kZXMgLnNlZW4nKS5sZW5ndGg7XHJcbiAgICAgICAgICAgIC8vaWYgKEJhc2UuZGVidWcpIGNvbnNvbGUubG9nKCdFcGlzb2RlLnVwZGF0ZVJlbmRlcicsIHtsZW5FcGlzb2RlczogbGVuRXBpc29kZXMsIGxlbk5vdFNwZWNpYWw6IGxlbk5vdFNwZWNpYWwsIGxlblNlZW46IGxlblNlZW59KTtcclxuICAgICAgICAgICAgLy8gU2kgdG91cyBsZXMgw6lwaXNvZGVzIGRlIGxhIHNhaXNvbiBvbnQgw6l0w6kgdnVzXHJcbiAgICAgICAgICAgIGlmIChsZW5TZWVuID09PSBsZW5FcGlzb2Rlcykge1xyXG4gICAgICAgICAgICAgICAgbW92ZVNlYXNvbigpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKGxlblNlZW4gPT09IGxlbk5vdFNwZWNpYWwpIHtcclxuICAgICAgICAgICAgICAgIG5ldyBQb3B1cEFsZXJ0KHtcclxuICAgICAgICAgICAgICAgICAgICB0aXRsZTogJ0ZpbiBkZSBsYSBzYWlzb24nLFxyXG4gICAgICAgICAgICAgICAgICAgIHRleHQ6ICdUb3VzIGxlcyDDqXBpc29kZXMgZGUgbGEgc2Fpc29uLCBob3JzIHNww6ljaWF1eCwgb250IMOpdMOpIHZ1Ljxici8+Vm91bGV6LXZvdXMgcGFzc2VyIMOgIGxhIHNhaXNvbiBzdWl2YW50ZSA/JyxcclxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFja195ZXM6ICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbW92ZVNlYXNvbigpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tfbm86ICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICRlbHQuY3NzKCdiYWNrZ3JvdW5kJywgJ3JnYmEoMTMsMjEsMjgsLjIpJyk7IC8vIE9uIGVubMOodmUgbGUgY2hlY2sgZGFucyBsYSBjYXNlIMOgIGNvY2hlclxyXG4gICAgICAgICAgICAkZWx0LnJlbW92ZUNsYXNzKCdzZWVuJyk7IC8vIE9uIHN1cHByaW1lIGxhIGNsYXNzZSAnc2VlbidcclxuICAgICAgICAgICAgJGVsdC5hdHRyKCd0aXRsZScsIEJhc2VfMS5CYXNlLnRyYW5zKFwibWVtYmVyX3Nob3dzLm1hcmthc1wiKSk7XHJcbiAgICAgICAgICAgIC8vIE9uIHJlbWV0IGxlIHZvaWxlIG1hc3F1YW50IHN1ciBsYSB2aWduZXR0ZSBkZSBsJ8OpcGlzb2RlXHJcbiAgICAgICAgICAgICRlbHQucGFyZW50KCdkaXYuc2xpZGVfX2ltYWdlJylcclxuICAgICAgICAgICAgICAgIC5maW5kKCdpbWcnKVxyXG4gICAgICAgICAgICAgICAgLmF0dHIoJ3N0eWxlJywgJ2ZpbHRlcjogYmx1cig1cHgpOycpO1xyXG4gICAgICAgICAgICBjb25zdCBjb250VmlnbmV0dGUgPSAkZWx0LnBhcmVudHMoJ2Rpdi5zbGlkZV9mbGV4Jyk7XHJcbiAgICAgICAgICAgIGlmICghY29udFZpZ25ldHRlLmhhc0NsYXNzKCdzbGlkZS0tbm90U2VlbicpKSB7XHJcbiAgICAgICAgICAgICAgICBjb250VmlnbmV0dGUuYWRkQ2xhc3MoJ3NsaWRlLS1ub3RTZWVuJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGpRdWVyeSgnI2VwaXNvZGVzIC5zZWVuJykubGVuZ3RoIDwgbGVuRXBpc29kZXMpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0ICRzZWFzb25DdXJyZW50ID0galF1ZXJ5KCcjc2Vhc29ucyBkaXYuc2xpZGUtLWN1cnJlbnQnKTtcclxuICAgICAgICAgICAgICAgICRzZWFzb25DdXJyZW50LmZpbmQoJy5jaGVja1NlZW4nKS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgICRzZWFzb25DdXJyZW50XHJcbiAgICAgICAgICAgICAgICAgICAgLnJlbW92ZUNsYXNzKCdzbGlkZS0tc2VlbicpXHJcbiAgICAgICAgICAgICAgICAgICAgLmFkZENsYXNzKCdzbGlkZS0tbm90U2VlbicpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh1cGRhdGUpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuc2hvdyBpbnN0YW5jZW9mIFNob3dfMS5TaG93KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNob3cudXBkYXRlKHRydWUpLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIF90aGlzLnRvZ2dsZVNwaW5uZXIoZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ0VwaXNvZGUuc2hvdyBpcyBub3QgYW4gaW5zdGFuY2Ugb2YgY2xhc3MgU2hvdycsIHRoaXMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBBZmZpY2hlL21hc3F1ZSBsZSBzcGlubmVyIGRlIG1vZGlmaWNhdGlvbiBkZXMgw6lwaXNvZGVzXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtICB7Ym9vbGVhbn0gIGRpc3BsYXkgIExlIGZsYWcgaW5kaXF1YW50IHNpIGFmZmljaGVyIG91IG1hc3F1ZXJcclxuICAgICAqIEByZXR1cm4ge0VwaXNvZGV9XHJcbiAgICAgKi9cclxuICAgIHRvZ2dsZVNwaW5uZXIoZGlzcGxheSkge1xyXG4gICAgICAgIGlmICghZGlzcGxheSkge1xyXG4gICAgICAgICAgICBqUXVlcnkoJy5zcGlubmVyJykucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIGlmIChCYXNlXzEuQmFzZS5kZWJ1ZylcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCd0b2dnbGVTcGlubmVyJyk7XHJcbiAgICAgICAgICAgIGlmIChCYXNlXzEuQmFzZS5kZWJ1ZylcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZ3JvdXBFbmQoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGlmIChCYXNlXzEuQmFzZS5kZWJ1ZylcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZ3JvdXBDb2xsYXBzZWQoJ2VwaXNvZGUgY2hlY2tTZWVuJyk7XHJcbiAgICAgICAgICAgIGlmIChCYXNlXzEuQmFzZS5kZWJ1ZylcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCd0b2dnbGVTcGlubmVyJyk7XHJcbiAgICAgICAgICAgIHRoaXMuZWx0LmZpbmQoJy5zbGlkZV9faW1hZ2UnKS5wcmVwZW5kKGBcclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwic3Bpbm5lclwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwic3Bpbm5lci1pdGVtXCI+PC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzcGlubmVyLWl0ZW1cIj48L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInNwaW5uZXItaXRlbVwiPjwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PmApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxufVxyXG5leHBvcnRzLkVwaXNvZGUgPSBFcGlzb2RlO1xyXG4vLyB9XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbmV4cG9ydHMuTWVkaWEgPSB2b2lkIDA7XHJcbi8vIG5hbWVzcGFjZSBCUyB7XHJcbmNvbnN0IEJhc2VfMSA9IHJlcXVpcmUoXCIuL0Jhc2VcIik7XHJcbmNvbnN0IFNpbWlsYXJfMSA9IHJlcXVpcmUoXCIuL1NpbWlsYXJcIik7XHJcbmNsYXNzIE1lZGlhIGV4dGVuZHMgQmFzZV8xLkJhc2Uge1xyXG4gICAgZm9sbG93ZXJzO1xyXG4gICAgZ2VucmVzO1xyXG4gICAgaW1kYl9pZDtcclxuICAgIGxhbmd1YWdlO1xyXG4gICAgbGVuZ3RoO1xyXG4gICAgb3JpZ2luYWxfdGl0bGU7XHJcbiAgICBzaW1pbGFycztcclxuICAgIGluX2FjY291bnQ7XHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhKSB7XHJcbiAgICAgICAgc3VwZXIoZGF0YSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZmlsbChkYXRhKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogUmVtcGxpdCBsJ29iamV0IGF2ZWMgbGVzIGRvbm7DqWVzIGZvdXJuaXQgZW4gcGFyYW3DqHRyZVxyXG4gICAgICogQHBhcmFtICB7T2JqfSBkYXRhIExlcyBkb25uw6llcyBwcm92ZW5hbnQgZGUgbCdBUElcclxuICAgICAqIEByZXR1cm5zIHtNZWRpYX1cclxuICAgICAqL1xyXG4gICAgZmlsbChkYXRhKSB7XHJcbiAgICAgICAgdGhpcy5mb2xsb3dlcnMgPSBwYXJzZUludChkYXRhLmZvbGxvd2VycywgMTApO1xyXG4gICAgICAgIHRoaXMuaW1kYl9pZCA9IGRhdGEuaW1kYl9pZDtcclxuICAgICAgICB0aGlzLmxhbmd1YWdlID0gZGF0YS5sYW5ndWFnZTtcclxuICAgICAgICB0aGlzLmxlbmd0aCA9IHBhcnNlSW50KGRhdGEubGVuZ3RoLCAxMCk7XHJcbiAgICAgICAgdGhpcy5vcmlnaW5hbF90aXRsZSA9IGRhdGEub3JpZ2luYWxfdGl0bGU7XHJcbiAgICAgICAgaWYgKGRhdGEuc2ltaWxhcnMgJiYgZGF0YS5zaW1pbGFycyBpbnN0YW5jZW9mIEFycmF5KSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2ltaWxhcnMgPSBkYXRhLnNpbWlsYXJzO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmdlbnJlcyA9IG5ldyBBcnJheSgpO1xyXG4gICAgICAgIGlmIChkYXRhLmdlbnJlcyAmJiBkYXRhLmdlbnJlcyBpbnN0YW5jZW9mIEFycmF5KSB7XHJcbiAgICAgICAgICAgIHRoaXMuZ2VucmVzID0gZGF0YS5nZW5yZXM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKGRhdGEuZ2VucmVzIGluc3RhbmNlb2YgT2JqZWN0KSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGcgaW4gZGF0YS5nZW5yZXMpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZ2VucmVzLnB1c2goZGF0YS5nZW5yZXNbZ10pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuaW5fYWNjb3VudCA9IGRhdGEuaW5fYWNjb3VudDtcclxuICAgICAgICBzdXBlci5maWxsKGRhdGEpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXRvdXJuZSBsZSBub21icmUgZGUgc2ltaWxhcnNcclxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IExlIG5vbWJyZSBkZSBzaW1pbGFyc1xyXG4gICAgICovXHJcbiAgICBnZXQgbmJTaW1pbGFycygpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5zaW1pbGFycy5sZW5ndGg7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFJldG91cm5lIGxlcyBzaW1pbGFycyBhc3NvY2nDqXMgYXUgbWVkaWFcclxuICAgICAqIEBhYnN0cmFjdFxyXG4gICAgICogQHJldHVybiB7UHJvbWlzZTxNZWRpYT59XHJcbiAgICAgKi9cclxuICAgIGZldGNoU2ltaWxhcnMoKSB7XHJcbiAgICAgICAgY29uc3QgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgIHRoaXMuc2ltaWxhcnMgPSBbXTtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICBCYXNlXzEuQmFzZS5jYWxsQXBpKCdHRVQnLCB0aGlzLm1lZGlhVHlwZS5wbHVyYWwsICdzaW1pbGFycycsIHsgaWQ6IHRoaXMuaWQsIGRldGFpbHM6IHRydWUgfSwgdHJ1ZSlcclxuICAgICAgICAgICAgICAgIC50aGVuKGRhdGEgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKGRhdGEuc2ltaWxhcnMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IHMgPSAwOyBzIDwgZGF0YS5zaW1pbGFycy5sZW5ndGg7IHMrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5zaW1pbGFycy5wdXNoKG5ldyBTaW1pbGFyXzEuU2ltaWxhcihkYXRhLnNpbWlsYXJzW3NdW190aGlzLm1lZGlhVHlwZS5zaW5ndWxhcl0sIF90aGlzLm1lZGlhVHlwZSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIF90aGlzLnNhdmUoKTtcclxuICAgICAgICAgICAgICAgIHJlc29sdmUoX3RoaXMpO1xyXG4gICAgICAgICAgICB9LCBlcnIgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmVqZWN0KGVycik7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXRvdXJuZSBsZSBzaW1pbGFyIGNvcnJlc3BvbmRhbnQgw6AgbCdpZGVudGlmaWFudFxyXG4gICAgICogQGFic3RyYWN0XHJcbiAgICAgKiBAcGFyYW0gIHtudW1iZXJ9IGlkICAgICAgTCdpZGVudGlmaWFudCBkdSBzaW1pbGFyXHJcbiAgICAgKiBAcmV0dXJuIHtTaW1pbGFyfHZvaWR9ICAgTGUgc2ltaWxhciBvdSBudWxsXHJcbiAgICAgKi9cclxuICAgIGdldFNpbWlsYXIoaWQpIHtcclxuICAgICAgICBpZiAoIXRoaXMuc2ltaWxhcnMpXHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIGZvciAobGV0IHMgPSAwOyBzIDwgdGhpcy5zaW1pbGFycy5sZW5ndGg7IHMrKykge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5zaW1pbGFyc1tzXS5pZCA9PT0gaWQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNpbWlsYXJzW3NdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMuTWVkaWEgPSBNZWRpYTtcclxuLy8gfVxyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG5leHBvcnRzLk1vdmllID0gdm9pZCAwO1xyXG4vLyBuYW1lc3BhY2UgQlMge1xyXG5jb25zdCBCYXNlXzEgPSByZXF1aXJlKFwiLi9CYXNlXCIpO1xyXG5jb25zdCBNZWRpYV8xID0gcmVxdWlyZShcIi4vTWVkaWFcIik7XHJcbmNsYXNzIE1vdmllIGV4dGVuZHMgTWVkaWFfMS5NZWRpYSB7XHJcbiAgICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG4gICAgLyogICAgICAgICAgICAgICAgICAgICAgU1RBVElDICAgICAgICAgICAgICAgICAgICAgKi9cclxuICAgIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXHJcbiAgICAvKipcclxuICAgICAqIE1ldGhvZGUgc3RhdGljIHNlcnZhbnQgw6AgcmV0b3VybmVyIHVuIG9iamV0IHNob3dcclxuICAgICAqIMOgIHBhcnRpciBkZSBzb24gSURcclxuICAgICAqIEBwYXJhbSAge251bWJlcn0gaWQgICAgICAgICAgICAgTCdpZGVudGlmaWFudCBkZSBsYSBzw6lyaWVcclxuICAgICAqIEBwYXJhbSAge2Jvb2xlYW59IFtmb3JjZT1mYWxzZV0gSW5kaXF1ZSBzaSBvbiB1dGlsaXNlIGxlIGNhY2hlIG91IG5vblxyXG4gICAgICogQHJldHVybiB7UHJvbWlzZTxNb3ZpZT59XHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBmZXRjaChpZCwgZm9yY2UgPSBmYWxzZSkge1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIEJhc2VfMS5CYXNlLmNhbGxBcGkoJ0dFVCcsICdtb3ZpZXMnLCAnbW92aWUnLCB7IGlkOiBpZCB9LCBmb3JjZSlcclxuICAgICAgICAgICAgICAgIC50aGVuKGRhdGEgPT4gcmVzb2x2ZShuZXcgTW92aWUoZGF0YSwgalF1ZXJ5KCcuYmxvY2tJbmZvcm1hdGlvbnMnKSkpKVxyXG4gICAgICAgICAgICAgICAgLmNhdGNoKGVyciA9PiByZWplY3QoZXJyKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG4gICAgLyogICAgICAgICAgICAgICAgICBQUk9QRVJUSUVTICAgICAgICAgICAgICAgICAgICAgKi9cclxuICAgIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXHJcbiAgICBiYWNrZHJvcDtcclxuICAgIGRpcmVjdG9yO1xyXG4gICAgb3JpZ2luYWxfcmVsZWFzZV9kYXRlO1xyXG4gICAgb3RoZXJfdGl0bGU7XHJcbiAgICBwbGF0Zm9ybV9saW5rcztcclxuICAgIHBvc3RlcjtcclxuICAgIHByb2R1Y3Rpb25feWVhcjtcclxuICAgIHJlbGVhc2VfZGF0ZTtcclxuICAgIHNhbGVfZGF0ZTtcclxuICAgIHRhZ2xpbmU7XHJcbiAgICB0bWRiX2lkO1xyXG4gICAgdHJhaWxlcjtcclxuICAgIHVybDtcclxuICAgIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXHJcbiAgICAvKiAgICAgICAgICAgICAgICAgICAgICBNRVRIT0RTICAgICAgICAgICAgICAgICAgICAqL1xyXG4gICAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cclxuICAgIGNvbnN0cnVjdG9yKGRhdGEsIGVsZW1lbnQpIHtcclxuICAgICAgICBpZiAoZGF0YS51c2VyLmluX2FjY291bnQgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICBkYXRhLmluX2FjY291bnQgPSBkYXRhLnVzZXIuaW5fYWNjb3VudDtcclxuICAgICAgICAgICAgZGVsZXRlIGRhdGEudXNlci5pbl9hY2NvdW50O1xyXG4gICAgICAgIH1cclxuICAgICAgICBzdXBlcihkYXRhKTtcclxuICAgICAgICB0aGlzLmVsdCA9IGVsZW1lbnQ7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZmlsbChkYXRhKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogUmVtcGxpdCBsJ29iamV0IGF2ZWMgbGVzIGRvbm7DqWVzIGZvdXJuaXQgZW4gcGFyYW3DqHRyZVxyXG4gICAgICogQHBhcmFtICB7YW55fSBkYXRhIExlcyBkb25uw6llcyBwcm92ZW5hbnQgZGUgbCdBUElcclxuICAgICAqIEByZXR1cm5zIHtNb3ZpZX1cclxuICAgICAqL1xyXG4gICAgZmlsbChkYXRhKSB7XHJcbiAgICAgICAgaWYgKGRhdGEudXNlci5pbl9hY2NvdW50ICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgZGF0YS5pbl9hY2NvdW50ID0gZGF0YS51c2VyLmluX2FjY291bnQ7XHJcbiAgICAgICAgICAgIGRlbGV0ZSBkYXRhLnVzZXIuaW5fYWNjb3VudDtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5iYWNrZHJvcCA9IGRhdGEuYmFja2Ryb3A7XHJcbiAgICAgICAgdGhpcy5kaXJlY3RvciA9IGRhdGEuZGlyZWN0b3I7XHJcbiAgICAgICAgdGhpcy5vcmlnaW5hbF9yZWxlYXNlX2RhdGUgPSBuZXcgRGF0ZShkYXRhLm9yaWdpbmFsX3JlbGVhc2VfZGF0ZSk7XHJcbiAgICAgICAgdGhpcy5vdGhlcl90aXRsZSA9IGRhdGEub3RoZXJfdGl0bGU7XHJcbiAgICAgICAgdGhpcy5wbGF0Zm9ybV9saW5rcyA9IGRhdGEucGxhdGZvcm1fbGlua3M7XHJcbiAgICAgICAgdGhpcy5wb3N0ZXIgPSBkYXRhLnBvc3RlcjtcclxuICAgICAgICB0aGlzLnByb2R1Y3Rpb25feWVhciA9IHBhcnNlSW50KGRhdGEucHJvZHVjdGlvbl95ZWFyKTtcclxuICAgICAgICB0aGlzLnJlbGVhc2VfZGF0ZSA9IG5ldyBEYXRlKGRhdGEucmVsZWFzZV9kYXRlKTtcclxuICAgICAgICB0aGlzLnNhbGVfZGF0ZSA9IG5ldyBEYXRlKGRhdGEuc2FsZV9kYXRlKTtcclxuICAgICAgICB0aGlzLnRhZ2xpbmUgPSBkYXRhLnRhZ2xpbmU7XHJcbiAgICAgICAgdGhpcy50bWRiX2lkID0gcGFyc2VJbnQoZGF0YS50bWRiX2lkKTtcclxuICAgICAgICB0aGlzLnRyYWlsZXIgPSBkYXRhLnRyYWlsZXI7XHJcbiAgICAgICAgdGhpcy51cmwgPSBkYXRhLnVybDtcclxuICAgICAgICB0aGlzLm1lZGlhVHlwZSA9IHsgc2luZ3VsYXI6IEJhc2VfMS5NZWRpYVR5cGUubW92aWUsIHBsdXJhbDogJ21vdmllcycsIGNsYXNzTmFtZTogTW92aWUgfTtcclxuICAgICAgICBzdXBlci5maWxsKGRhdGEpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMuTW92aWUgPSBNb3ZpZTtcclxuLy8gfVxyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG5leHBvcnRzLk5vdGUgPSB2b2lkIDA7XHJcbi8vIG5hbWVzcGFjZSBCUyB7XHJcbmNsYXNzIE5vdGUge1xyXG4gICAgY29uc3RydWN0b3IoZGF0YSkge1xyXG4gICAgICAgIHRoaXMudG90YWwgPSBwYXJzZUludChkYXRhLnRvdGFsLCAxMCk7XHJcbiAgICAgICAgdGhpcy5tZWFuID0gcGFyc2VJbnQoZGF0YS5tZWFuLCAxMCk7XHJcbiAgICAgICAgdGhpcy51c2VyID0gcGFyc2VJbnQoZGF0YS51c2VyLCAxMCk7XHJcbiAgICB9XHJcbiAgICB0b3RhbDtcclxuICAgIG1lYW47XHJcbiAgICB1c2VyO1xyXG4gICAgZ2V0UGVyY2VudGFnZSgpIHtcclxuICAgICAgICByZXR1cm4gTWF0aC5yb3VuZCgoKHRoaXMubWVhbiAvIDUpICogMTAwKSAvIDEwKSAqIDEwO1xyXG4gICAgfVxyXG4gICAgdG9TdHJpbmcoKSB7XHJcbiAgICAgICAgY29uc3Qgdm90ZXMgPSAndm90ZScgKyAodGhpcy50b3RhbCA+IDEgPyAncycgOiAnJyksIFxyXG4gICAgICAgIC8vIE9uIG1ldCBlbiBmb3JtZSBsZSBub21icmUgZGUgdm90ZXNcclxuICAgICAgICB0b3RhbCA9IG5ldyBJbnRsLk51bWJlckZvcm1hdCgnZnItRlInLCB7IHN0eWxlOiAnZGVjaW1hbCcsIHVzZUdyb3VwaW5nOiB0cnVlIH0pLmZvcm1hdCh0aGlzLnRvdGFsKSwgXHJcbiAgICAgICAgLy8gT24gbGltaXRlIGxlIG5vbWJyZSBkZSBjaGlmZnJlIGFwcsOocyBsYSB2aXJndWxlXHJcbiAgICAgICAgbm90ZSA9IHRoaXMubWVhbi50b0ZpeGVkKDEpO1xyXG4gICAgICAgIGxldCB0b1N0cmluZyA9IGAke3RvdGFsfSAke3ZvdGVzfSA6ICR7bm90ZX0gLyA1YDtcclxuICAgICAgICAvLyBPbiBham91dGUgbGEgbm90ZSBkdSBtZW1icmUgY29ubmVjdMOpLCBzaSBpbCBhIHZvdMOpXHJcbiAgICAgICAgaWYgKHRoaXMudXNlciA+IDApIHtcclxuICAgICAgICAgICAgdG9TdHJpbmcgKz0gYCwgdm90cmUgbm90ZTogJHt0aGlzLnVzZXJ9YDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRvU3RyaW5nO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMuTm90ZSA9IE5vdGU7XHJcbi8vIH1cclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxuZXhwb3J0cy5TaG93ID0gZXhwb3J0cy5TaG93cnVubmVyID0gZXhwb3J0cy5TZWFzb24gPSBleHBvcnRzLlBsYXRmb3JtcyA9IGV4cG9ydHMuUGxhdGZvcm0gPSBleHBvcnRzLlBpY3R1cmUgPSBleHBvcnRzLlBpY2tlZCA9IGV4cG9ydHMuSW1hZ2VzID0gdm9pZCAwO1xyXG4vLyBuYW1lc3BhY2UgQlMge1xyXG5jb25zdCBCYXNlXzEgPSByZXF1aXJlKFwiLi9CYXNlXCIpO1xyXG5jb25zdCBNZWRpYV8xID0gcmVxdWlyZShcIi4vTWVkaWFcIik7XHJcbmNvbnN0IEVwaXNvZGVfMSA9IHJlcXVpcmUoXCIuL0VwaXNvZGVcIik7XHJcbmNsYXNzIEltYWdlcyB7XHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhKSB7XHJcbiAgICAgICAgdGhpcy5zaG93ID0gZGF0YS5zaG93O1xyXG4gICAgICAgIHRoaXMuYmFubmVyID0gZGF0YS5iYW5uZXI7XHJcbiAgICAgICAgdGhpcy5ib3ggPSBkYXRhLmJveDtcclxuICAgICAgICB0aGlzLnBvc3RlciA9IGRhdGEucG9zdGVyO1xyXG4gICAgfVxyXG4gICAgc2hvdztcclxuICAgIGJhbm5lcjtcclxuICAgIGJveDtcclxuICAgIHBvc3RlcjtcclxufVxyXG5leHBvcnRzLkltYWdlcyA9IEltYWdlcztcclxudmFyIFBpY2tlZDtcclxuKGZ1bmN0aW9uIChQaWNrZWQpIHtcclxuICAgIFBpY2tlZFtQaWNrZWRbXCJub25lXCJdID0gMF0gPSBcIm5vbmVcIjtcclxuICAgIFBpY2tlZFtQaWNrZWRbXCJiYW5uZXJcIl0gPSAxXSA9IFwiYmFubmVyXCI7XHJcbiAgICBQaWNrZWRbUGlja2VkW1wic2hvd1wiXSA9IDJdID0gXCJzaG93XCI7XHJcbn0pKFBpY2tlZCA9IGV4cG9ydHMuUGlja2VkIHx8IChleHBvcnRzLlBpY2tlZCA9IHt9KSk7XHJcbmNsYXNzIFBpY3R1cmUge1xyXG4gICAgY29uc3RydWN0b3IoZGF0YSkge1xyXG4gICAgICAgIHRoaXMuaWQgPSBwYXJzZUludChkYXRhLmlkLCAxMCk7XHJcbiAgICAgICAgdGhpcy5zaG93X2lkID0gcGFyc2VJbnQoZGF0YS5zaG93X2lkLCAxMCk7XHJcbiAgICAgICAgdGhpcy5sb2dpbl9pZCA9IHBhcnNlSW50KGRhdGEubG9naW5faWQsIDEwKTtcclxuICAgICAgICB0aGlzLnVybCA9IGRhdGEudXJsO1xyXG4gICAgICAgIHRoaXMud2lkdGggPSBwYXJzZUludChkYXRhLndpZHRoLCAxMCk7XHJcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBwYXJzZUludChkYXRhLmhlaWdodCwgMTApO1xyXG4gICAgICAgIHRoaXMuZGF0ZSA9IG5ldyBEYXRlKGRhdGEuZGF0ZSk7XHJcbiAgICAgICAgdGhpcy5waWNrZWQgPSBkYXRhLnBpY2tlZDtcclxuICAgIH1cclxuICAgIGlkO1xyXG4gICAgc2hvd19pZDtcclxuICAgIGxvZ2luX2lkO1xyXG4gICAgdXJsO1xyXG4gICAgd2lkdGg7XHJcbiAgICBoZWlnaHQ7XHJcbiAgICBkYXRlO1xyXG4gICAgcGlja2VkO1xyXG59XHJcbmV4cG9ydHMuUGljdHVyZSA9IFBpY3R1cmU7XHJcbmNsYXNzIFBsYXRmb3JtIHtcclxuICAgIGNvbnN0cnVjdG9yKGRhdGEpIHtcclxuICAgICAgICB0aGlzLmlkID0gcGFyc2VJbnQoZGF0YS5pZCwgMTApO1xyXG4gICAgICAgIHRoaXMubmFtZSA9IGRhdGEubmFtZTtcclxuICAgICAgICB0aGlzLnRhZyA9IGRhdGEudGFnO1xyXG4gICAgICAgIHRoaXMubGlua191cmwgPSBkYXRhLmxpbmtfdXJsO1xyXG4gICAgICAgIHRoaXMuYXZhaWxhYmxlID0gZGF0YS5hdmFpbGFibGU7XHJcbiAgICAgICAgdGhpcy5sb2dvID0gZGF0YS5sb2dvO1xyXG4gICAgfVxyXG4gICAgaWQ7XHJcbiAgICBuYW1lO1xyXG4gICAgdGFnO1xyXG4gICAgbGlua191cmw7XHJcbiAgICBhdmFpbGFibGU7XHJcbiAgICBsb2dvO1xyXG59XHJcbmV4cG9ydHMuUGxhdGZvcm0gPSBQbGF0Zm9ybTtcclxuY2xhc3MgUGxhdGZvcm1zIHtcclxuICAgIGNvbnN0cnVjdG9yKGRhdGEpIHtcclxuICAgICAgICBpZiAoZGF0YS5zdm9kcyAmJiBkYXRhLnN2b2RzIGluc3RhbmNlb2YgQXJyYXkpIHtcclxuICAgICAgICAgICAgdGhpcy5zdm9kcyA9IG5ldyBBcnJheSgpO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBzID0gMDsgcyA8IGRhdGEuc3ZvZHMubGVuZ3RoOyBzKyspIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc3ZvZHMucHVzaChuZXcgUGxhdGZvcm0oZGF0YS5zdm9kc1tzXSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChkYXRhLnN2b2QpIHtcclxuICAgICAgICAgICAgdGhpcy5zdm9kID0gbmV3IFBsYXRmb3JtKGRhdGEuc3ZvZCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgc3ZvZHM7XHJcbiAgICBzdm9kO1xyXG59XHJcbmV4cG9ydHMuUGxhdGZvcm1zID0gUGxhdGZvcm1zO1xyXG5jbGFzcyBTZWFzb24ge1xyXG4gICAgbnVtYmVyO1xyXG4gICAgZXBpc29kZXM7XHJcbiAgICBfc2hvdztcclxuICAgIGNvbnN0cnVjdG9yKGRhdGEsIHNob3cpIHtcclxuICAgICAgICB0aGlzLm51bWJlciA9IHBhcnNlSW50KGRhdGEubnVtYmVyLCAxMCk7XHJcbiAgICAgICAgdGhpcy5fc2hvdyA9IHNob3c7XHJcbiAgICAgICAgaWYgKGRhdGEuZXBpc29kZXMgJiYgZGF0YS5lcGlzb2RlcyBpbnN0YW5jZW9mIEFycmF5ICYmIGRhdGEuZXBpc29kZXNbMF0gaW5zdGFuY2VvZiBFcGlzb2RlXzEuRXBpc29kZSkge1xyXG4gICAgICAgICAgICB0aGlzLmVwaXNvZGVzID0gZGF0YS5lcGlzb2RlcztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFLDqWN1cMOocmUgbGVzIMOpcGlzb2RlcyBkZSBsYSBzYWlzb24gc3VyIGwnQVBJXHJcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZTxTZWFzb24+fVxyXG4gICAgICovXHJcbiAgICBmZXRjaEVwaXNvZGVzKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5udW1iZXIgfHwgdGhpcy5udW1iZXIgPD0gMCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3NlYXNvbiBudW1iZXIgaW5jb3JyZWN0Jyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IF90aGlzID0gdGhpcztcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICBCYXNlXzEuQmFzZS5jYWxsQXBpKCdHRVQnLCAnc2hvd3MnLCAnZXBpc29kZXMnLCB7IGlkOiBfdGhpcy5fc2hvdy5pZCwgc2Vhc29uOiBfdGhpcy5udW1iZXIgfSwgdHJ1ZSlcclxuICAgICAgICAgICAgICAgIC50aGVuKGRhdGEgPT4ge1xyXG4gICAgICAgICAgICAgICAgX3RoaXMuZXBpc29kZXMgPSBbXTtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGUgPSAwOyBlIDwgZGF0YS5lcGlzb2Rlcy5sZW5ndGg7IGUrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIF90aGlzLmVwaXNvZGVzLnB1c2gobmV3IEVwaXNvZGVfMS5FcGlzb2RlKGRhdGEuZXBpc29kZXNbZV0sIF90aGlzLl9zaG93KSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKF90aGlzKTtcclxuICAgICAgICAgICAgfSwgZXJyID0+IHtcclxuICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogUmV0b3VybmUgbCfDqXBpc29kZSBjb3JyZXNwb25kYW50IMOgIGwnaWRlbnRpZmlhbnQgZm91cm5pdFxyXG4gICAgICogQHBhcmFtICB7bnVtYmVyfSBpZFxyXG4gICAgICogQHJldHVybnMge0VwaXNvZGV9XHJcbiAgICAgKi9cclxuICAgIGdldEVwaXNvZGUoaWQpIHtcclxuICAgICAgICBmb3IgKGxldCBlID0gMDsgZSA8IHRoaXMuZXBpc29kZXMubGVuZ3RoOyBlKyspIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuZXBpc29kZXNbZV0uaWQgPT09IGlkKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5lcGlzb2Rlc1tlXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxufVxyXG5leHBvcnRzLlNlYXNvbiA9IFNlYXNvbjtcclxuY2xhc3MgU2hvd3J1bm5lciB7XHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhKSB7XHJcbiAgICAgICAgdGhpcy5pZCA9IHBhcnNlSW50KGRhdGEuaWQsIDEwKTtcclxuICAgICAgICB0aGlzLm5hbWUgPSBkYXRhLm5hbWU7XHJcbiAgICAgICAgdGhpcy5waWN0dXJlID0gZGF0YS5waWN0dXJlO1xyXG4gICAgfVxyXG4gICAgaWQ7XHJcbiAgICBuYW1lO1xyXG4gICAgcGljdHVyZTtcclxufVxyXG5leHBvcnRzLlNob3dydW5uZXIgPSBTaG93cnVubmVyO1xyXG5jbGFzcyBTaG93IGV4dGVuZHMgTWVkaWFfMS5NZWRpYSB7XHJcbiAgICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG4gICAgLyogICAgICAgICAgICAgICAgICAgICAgU1RBVElDICAgICAgICAgICAgICAgICAgICAgKi9cclxuICAgIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXHJcbiAgICAvKipcclxuICAgICAqIE1ldGhvZGUgc3RhdGljIHNlcnZhbnQgw6AgcmV0b3VybmVyIHVuIG9iamV0IHNob3dcclxuICAgICAqIMOgIHBhcnRpciBkZSBzb24gSURcclxuICAgICAqIEBwYXJhbSAge251bWJlcn0gaWQgICAgICAgICAgICAgTCdpZGVudGlmaWFudCBkZSBsYSBzw6lyaWVcclxuICAgICAqIEBwYXJhbSAge2Jvb2xlYW59IFtmb3JjZT1mYWxzZV0gSW5kaXF1ZSBzaSBvbiB1dGlsaXNlIGxlIGNhY2hlIG91IG5vblxyXG4gICAgICogQHJldHVybiB7UHJvbWlzZTxTaG93Pn1cclxuICAgICAqL1xyXG4gICAgc3RhdGljIGZldGNoKGlkLCBmb3JjZSA9IGZhbHNlKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgQmFzZV8xLkJhc2UuY2FsbEFwaSgnR0VUJywgJ3Nob3dzJywgJ2Rpc3BsYXknLCB7IGlkOiBpZCB9LCBmb3JjZSlcclxuICAgICAgICAgICAgICAgIC50aGVuKGRhdGEgPT4gcmVzb2x2ZShuZXcgU2hvdyhkYXRhLCBqUXVlcnkoJy5ibG9ja0luZm9ybWF0aW9ucycpKSkpXHJcbiAgICAgICAgICAgICAgICAuY2F0Y2goZXJyID0+IHJlamVjdChlcnIpKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXHJcbiAgICAvKiAgICAgICAgICAgICAgICAgIFBST1BFUlRJRVMgICAgICAgICAgICAgICAgICAgICAqL1xyXG4gICAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cclxuICAgIGFsaWFzZXM7XHJcbiAgICBjcmVhdGlvbjtcclxuICAgIGNvdW50cnk7XHJcbiAgICBjdXJyZW50U2Vhc29uO1xyXG4gICAgaW1hZ2VzO1xyXG4gICAgbmJFcGlzb2RlcztcclxuICAgIG5ldHdvcms7XHJcbiAgICBuZXh0X3RyYWlsZXI7XHJcbiAgICBuZXh0X3RyYWlsZXJfaG9zdDtcclxuICAgIHJhdGluZztcclxuICAgIHBpY3R1cmVzO1xyXG4gICAgcGxhdGZvcm1zO1xyXG4gICAgc2Vhc29ucztcclxuICAgIHNob3dydW5uZXI7XHJcbiAgICBzb2NpYWxfbGlua3M7XHJcbiAgICBzdGF0dXM7XHJcbiAgICB0aGV0dmRiX2lkO1xyXG4gICAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cclxuICAgIC8qICAgICAgICAgICAgICAgICAgICAgIE1FVEhPRFMgICAgICAgICAgICAgICAgICAgICovXHJcbiAgICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG4gICAgY29uc3RydWN0b3IoZGF0YSwgZWxlbWVudCkge1xyXG4gICAgICAgIHN1cGVyKGRhdGEpO1xyXG4gICAgICAgIHRoaXMuZWx0ID0gZWxlbWVudDtcclxuICAgICAgICByZXR1cm4gdGhpcy5maWxsKGRhdGEpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBSZW1wbGl0IGwnb2JqZXQgYXZlYyBsZXMgZG9ubsOpZXMgZm91cm5pdCBlbiBwYXJhbcOodHJlXHJcbiAgICAgKiBAcGFyYW0gIHtPYmp9IGRhdGEgTGVzIGRvbm7DqWVzIHByb3ZlbmFudCBkZSBsJ0FQSVxyXG4gICAgICogQHJldHVybnMge1Nob3d9XHJcbiAgICAgKi9cclxuICAgIGZpbGwoZGF0YSkge1xyXG4gICAgICAgIHRoaXMuYWxpYXNlcyA9IGRhdGEuYWxpYXNlcztcclxuICAgICAgICB0aGlzLmNyZWF0aW9uID0gZGF0YS5jcmVhdGlvbjtcclxuICAgICAgICB0aGlzLmNvdW50cnkgPSBkYXRhLmNvdW50cnk7XHJcbiAgICAgICAgdGhpcy5pbWFnZXMgPSBuZXcgSW1hZ2VzKGRhdGEuaW1hZ2VzKTtcclxuICAgICAgICB0aGlzLm5iRXBpc29kZXMgPSBwYXJzZUludChkYXRhLmVwaXNvZGVzLCAxMCk7XHJcbiAgICAgICAgdGhpcy5uZXR3b3JrID0gZGF0YS5uZXR3b3JrO1xyXG4gICAgICAgIHRoaXMubmV4dF90cmFpbGVyID0gZGF0YS5uZXh0X3RyYWlsZXI7XHJcbiAgICAgICAgdGhpcy5uZXh0X3RyYWlsZXJfaG9zdCA9IGRhdGEubmV4dF90cmFpbGVyX2hvc3Q7XHJcbiAgICAgICAgdGhpcy5yYXRpbmcgPSBkYXRhLnJhdGluZztcclxuICAgICAgICB0aGlzLnBsYXRmb3JtcyA9IG5ldyBQbGF0Zm9ybXMoZGF0YS5wbGF0Zm9ybXMpO1xyXG4gICAgICAgIHRoaXMuc2Vhc29ucyA9IG5ldyBBcnJheSgpO1xyXG4gICAgICAgIGZvciAobGV0IHMgPSAwOyBzIDwgZGF0YS5zZWFzb25zX2RldGFpbHMubGVuZ3RoOyBzKyspIHtcclxuICAgICAgICAgICAgdGhpcy5zZWFzb25zLnB1c2gobmV3IFNlYXNvbihkYXRhLnNlYXNvbnNfZGV0YWlsc1tzXSwgdGhpcykpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnNob3dydW5uZXIgPSBuZXcgU2hvd3J1bm5lcihkYXRhLnNob3dydW5uZXIpO1xyXG4gICAgICAgIHRoaXMuc29jaWFsX2xpbmtzID0gZGF0YS5zb2NpYWxfbGlua3M7XHJcbiAgICAgICAgdGhpcy5zdGF0dXMgPSBkYXRhLnN0YXR1cztcclxuICAgICAgICB0aGlzLnRoZXR2ZGJfaWQgPSBwYXJzZUludChkYXRhLnRoZXR2ZGJfaWQsIDEwKTtcclxuICAgICAgICB0aGlzLnBpY3R1cmVzID0gbmV3IEFycmF5KCk7XHJcbiAgICAgICAgdGhpcy5tZWRpYVR5cGUgPSB7IHNpbmd1bGFyOiBCYXNlXzEuTWVkaWFUeXBlLnNob3csIHBsdXJhbDogJ3Nob3dzJywgY2xhc3NOYW1lOiBTaG93IH07XHJcbiAgICAgICAgc3VwZXIuZmlsbChkYXRhKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogUsOpY3Vww6hyZSBsZXMgZG9ubsOpZXMgZGUgbGEgc8OpcmllIHN1ciBsJ0FQSVxyXG4gICAgICogQHBhcmFtICB7Ym9vbGVhbn0gW2ZvcmNlPXRydWVdICAgSW5kaXF1ZSBzaSBvbiB1dGlsaXNlIGxlcyBkb25uw6llcyBlbiBjYWNoZVxyXG4gICAgICogQHJldHVybiB7UHJvbWlzZTwqPn0gICAgICAgICAgICAgTGVzIGRvbm7DqWVzIGRlIGxhIHPDqXJpZVxyXG4gICAgICovXHJcbiAgICBmZXRjaChmb3JjZSA9IHRydWUpIHtcclxuICAgICAgICByZXR1cm4gQmFzZV8xLkJhc2UuY2FsbEFwaSgnR0VUJywgJ3Nob3dzJywgJ2Rpc3BsYXknLCB7IGlkOiB0aGlzLmlkIH0sIGZvcmNlKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogaXNFbmRlZCAtIEluZGlxdWUgc2kgbGEgc8OpcmllIGVzdCB0ZXJtaW7DqWVcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJuIHtib29sZWFufSAgVGVybWluw6llIG91IG5vblxyXG4gICAgICovXHJcbiAgICBpc0VuZGVkKCkge1xyXG4gICAgICAgIHJldHVybiAodGhpcy5zdGF0dXMudG9Mb3dlckNhc2UoKSA9PT0gJ2VuZGVkJykgPyB0cnVlIDogZmFsc2U7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIGlzQXJjaGl2ZWQgLSBJbmRpcXVlIHNpIGxhIHPDqXJpZSBlc3QgYXJjaGl2w6llXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn0gIEFyY2hpdsOpZSBvdSBub25cclxuICAgICAqL1xyXG4gICAgaXNBcmNoaXZlZCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy51c2VyLmFyY2hpdmVkO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBpc0Zhdm9yaXRlIC0gSW5kaXF1ZSBzaSBsYSBzw6lyaWUgZXN0IGRhbnMgbGVzIGZhdm9yaXNcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgICAqL1xyXG4gICAgaXNGYXZvcml0ZSgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy51c2VyLmZhdm9yaXRlZDtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogYWRkVG9BY2NvdW50IC0gQWpvdXQgbGEgc8OpcmllIHN1ciBsZSBjb21wdGUgZHUgbWVtYnJlIGNvbm5lY3TDqVxyXG4gICAgICogQHJldHVybiB7UHJvbWlzZTxTaG93Pn0gUHJvbWlzZSBvZiBzaG93XHJcbiAgICAgKi9cclxuICAgIGFkZFRvQWNjb3VudCgpIHtcclxuICAgICAgICBjb25zdCBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgaWYgKHRoaXMuaW5fYWNjb3VudClcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4gcmVzb2x2ZShfdGhpcykpO1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIEJhc2VfMS5CYXNlLmNhbGxBcGkoJ1BPU1QnLCAnc2hvd3MnLCAnc2hvdycsIHsgaWQ6IF90aGlzLmlkIH0pXHJcbiAgICAgICAgICAgICAgICAudGhlbihkYXRhID0+IHtcclxuICAgICAgICAgICAgICAgIF90aGlzLmZpbGwoZGF0YS5zaG93KTtcclxuICAgICAgICAgICAgICAgIF90aGlzLnNhdmUoKTtcclxuICAgICAgICAgICAgICAgIHJlc29sdmUoX3RoaXMpO1xyXG4gICAgICAgICAgICB9LCBlcnIgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmVqZWN0KGVycik7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBSZW1vdmUgU2hvdyBmcm9tIGFjY291bnQgbWVtYmVyXHJcbiAgICAgKiBAcmV0dXJuIHtQcm9taXNlPFNob3c+fSBQcm9taXNlIG9mIHNob3dcclxuICAgICAqL1xyXG4gICAgcmVtb3ZlRnJvbUFjY291bnQoKSB7XHJcbiAgICAgICAgY29uc3QgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgIGlmICghdGhpcy5pbl9hY2NvdW50KVxyXG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiByZXNvbHZlKF90aGlzKSk7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgQmFzZV8xLkJhc2UuY2FsbEFwaSgnREVMRVRFJywgJ3Nob3dzJywgJ3Nob3cnLCB7IGlkOiBfdGhpcy5pZCB9KVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oZGF0YSA9PiB7XHJcbiAgICAgICAgICAgICAgICBfdGhpcy5maWxsKGRhdGEuc2hvdyk7XHJcbiAgICAgICAgICAgICAgICBfdGhpcy5zYXZlKCk7XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKHRoaXMpO1xyXG4gICAgICAgICAgICB9LCBlcnIgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmVqZWN0KGVycik7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBBcmNoaXZlIGxhIHPDqXJpZVxyXG4gICAgICogQHJldHVybiB7UHJvbWlzZTxTaG93Pn0gUHJvbWlzZSBvZiBzaG93XHJcbiAgICAgKi9cclxuICAgIGFyY2hpdmUoKSB7XHJcbiAgICAgICAgY29uc3QgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIE1lZGlhXzEuTWVkaWEuY2FsbEFwaSgnUE9TVCcsICdzaG93cycsICdhcmNoaXZlJywgeyBpZDogX3RoaXMuaWQgfSlcclxuICAgICAgICAgICAgICAgIC50aGVuKGRhdGEgPT4ge1xyXG4gICAgICAgICAgICAgICAgX3RoaXMuZmlsbChkYXRhLnNob3cpO1xyXG4gICAgICAgICAgICAgICAgX3RoaXMuc2F2ZSgpO1xyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShfdGhpcyk7XHJcbiAgICAgICAgICAgIH0sIGVyciA9PiB7XHJcbiAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIETDqXNhcmNoaXZlIGxhIHPDqXJpZVxyXG4gICAgICogQHJldHVybiB7UHJvbWlzZTxTaG93Pn0gUHJvbWlzZSBvZiBzaG93XHJcbiAgICAgKi9cclxuICAgIHVuYXJjaGl2ZSgpIHtcclxuICAgICAgICBjb25zdCBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgTWVkaWFfMS5NZWRpYS5jYWxsQXBpKCdERUxFVEUnLCAnc2hvd3MnLCAnYXJjaGl2ZScsIHsgaWQ6IF90aGlzLmlkIH0pXHJcbiAgICAgICAgICAgICAgICAudGhlbihkYXRhID0+IHtcclxuICAgICAgICAgICAgICAgIF90aGlzLmZpbGwoZGF0YS5zaG93KTtcclxuICAgICAgICAgICAgICAgIF90aGlzLnNhdmUoKTtcclxuICAgICAgICAgICAgICAgIHJlc29sdmUoX3RoaXMpO1xyXG4gICAgICAgICAgICB9LCBlcnIgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmVqZWN0KGVycik7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBBam91dGUgbGEgc8OpcmllIGF1eCBmYXZvcmlzXHJcbiAgICAgKiBAcmV0dXJuIHtQcm9taXNlPFNob3c+fSBQcm9taXNlIG9mIHNob3dcclxuICAgICAqL1xyXG4gICAgZmF2b3JpdGUoKSB7XHJcbiAgICAgICAgY29uc3QgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIE1lZGlhXzEuTWVkaWEuY2FsbEFwaSgnUE9TVCcsICdzaG93cycsICdmYXZvcml0ZScsIHsgaWQ6IF90aGlzLmlkIH0pXHJcbiAgICAgICAgICAgICAgICAudGhlbihkYXRhID0+IHtcclxuICAgICAgICAgICAgICAgIF90aGlzLmZpbGwoZGF0YS5zaG93KTtcclxuICAgICAgICAgICAgICAgIF90aGlzLnNhdmUoKTtcclxuICAgICAgICAgICAgICAgIHJlc29sdmUoX3RoaXMpO1xyXG4gICAgICAgICAgICB9LCBlcnIgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmVqZWN0KGVycik7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBTdXBwcmltZSBsYSBzw6lyaWUgZGVzIGZhdm9yaXNcclxuICAgICAqIEByZXR1cm4ge1Byb21pc2U8U2hvdz59IFByb21pc2Ugb2Ygc2hvd1xyXG4gICAgICovXHJcbiAgICB1bmZhdm9yaXRlKCkge1xyXG4gICAgICAgIGNvbnN0IF90aGlzID0gdGhpcztcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICBNZWRpYV8xLk1lZGlhLmNhbGxBcGkoJ0RFTEVURScsICdzaG93cycsICdmYXZvcml0ZScsIHsgaWQ6IF90aGlzLmlkIH0pXHJcbiAgICAgICAgICAgICAgICAudGhlbihkYXRhID0+IHtcclxuICAgICAgICAgICAgICAgIF90aGlzLmZpbGwoZGF0YS5zaG93KTtcclxuICAgICAgICAgICAgICAgIF90aGlzLnNhdmUoKTtcclxuICAgICAgICAgICAgICAgIHJlc29sdmUoX3RoaXMpO1xyXG4gICAgICAgICAgICB9LCBlcnIgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmVqZWN0KGVycik7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBNZXQgw6Agam91ciBsZXMgZG9ubsOpZXMgZGUgbGEgc8OpcmllXHJcbiAgICAgKiBAcGFyYW0gIHtCb29sZWFufSAgW2ZvcmNlPWZhbHNlXSBGb3JjZXIgbGEgcsOpY3Vww6lyYXRpb24gZGVzIGRvbm7DqWVzIHN1ciBsJ0FQSVxyXG4gICAgICogQHBhcmFtICB7RnVuY3Rpb259IFtjYj1ub29wXSAgICAgRm9uY3Rpb24gZGUgY2FsbGJhY2tcclxuICAgICAqIEByZXR1cm4ge1Byb21pc2U8U2hvdz59ICAgICAgICAgIFByb21lc3NlIChTaG93KVxyXG4gICAgICovXHJcbiAgICB1cGRhdGUoZm9yY2UgPSBmYWxzZSwgY2IgPSBCYXNlXzEuQmFzZS5ub29wKSB7XHJcbiAgICAgICAgY29uc3QgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIF90aGlzLmZldGNoKGZvcmNlKS50aGVuKGRhdGEgPT4ge1xyXG4gICAgICAgICAgICAgICAgX3RoaXMuZmlsbChkYXRhLnNob3cpO1xyXG4gICAgICAgICAgICAgICAgX3RoaXMuc2F2ZSgpO1xyXG4gICAgICAgICAgICAgICAgX3RoaXMudXBkYXRlUmVuZGVyKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKF90aGlzKTtcclxuICAgICAgICAgICAgICAgICAgICBjYigpO1xyXG4gICAgICAgICAgICAgICAgICAgIF90aGlzLl9jYWxsTGlzdGVuZXJzKEJhc2VfMS5FdmVudFR5cGVzLlVQREFURSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5jYXRjaChlcnIgPT4ge1xyXG4gICAgICAgICAgICAgICAgTWVkaWFfMS5NZWRpYS5ub3RpZmljYXRpb24oJ0VycmV1ciBkZSByw6ljdXDDqXJhdGlvbiBkZSBsYSByZXNzb3VyY2UgU2hvdycsICdTaG93IHVwZGF0ZTogJyArIGVycik7XHJcbiAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcclxuICAgICAgICAgICAgICAgIGNiKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBNZXQgw6Agam91ciBsZSByZW5kdSBkZSBsYSBiYXJyZSBkZSBwcm9ncmVzc2lvblxyXG4gICAgICogZXQgZHUgcHJvY2hhaW4gw6lwaXNvZGVcclxuICAgICAqIEBwYXJhbSAge0Z1bmN0aW9ufSBjYiBGb25jdGlvbiBkZSBjYWxsYmFja1xyXG4gICAgICogQHJldHVybiB7dm9pZH1cclxuICAgICAqL1xyXG4gICAgdXBkYXRlUmVuZGVyKGNiID0gQmFzZV8xLkJhc2Uubm9vcCkge1xyXG4gICAgICAgIHRoaXMudXBkYXRlUHJvZ3Jlc3NCYXIoKTtcclxuICAgICAgICB0aGlzLnVwZGF0ZU5leHRFcGlzb2RlKCk7XHJcbiAgICAgICAgbGV0IG5vdGUgPSB0aGlzLm9iak5vdGU7XHJcbiAgICAgICAgaWYgKEJhc2VfMS5CYXNlLmRlYnVnKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdOZXh0IElEIGV0IHN0YXR1cycsIHtcclxuICAgICAgICAgICAgICAgIG5leHQ6IHRoaXMudXNlci5uZXh0LmlkLFxyXG4gICAgICAgICAgICAgICAgc3RhdHVzOiB0aGlzLnN0YXR1cyxcclxuICAgICAgICAgICAgICAgIGFyY2hpdmVkOiB0aGlzLnVzZXIuYXJjaGl2ZWQsXHJcbiAgICAgICAgICAgICAgICBub3RlX3VzZXI6IG5vdGUudXNlclxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gU2kgaWwgbid5IGEgcGx1cyBkJ8OpcGlzb2RlcyDDoCByZWdhcmRlclxyXG4gICAgICAgIGlmICh0aGlzLnVzZXIucmVtYWluaW5nID09PSAwKSB7XHJcbiAgICAgICAgICAgIGxldCBwcm9taXNlID0gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7IHJldHVybiByZXNvbHZlKHZvaWQgMCk7IH0pO1xyXG4gICAgICAgICAgICAvLyBPbiBwcm9wb3NlIGQnYXJjaGl2ZXIgc2kgbGEgc8OpcmllIG4nZXN0IHBsdXMgZW4gcHJvZHVjdGlvblxyXG4gICAgICAgICAgICBpZiAodGhpcy5pbl9hY2NvdW50ICYmIHRoaXMuaXNFbmRlZCgpICYmICF0aGlzLmlzQXJjaGl2ZWQoKSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKEJhc2VfMS5CYXNlLmRlYnVnKVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdTw6lyaWUgdGVybWluw6llLCBwb3B1cCBjb25maXJtYXRpb24gYXJjaGl2YWdlJyk7XHJcbiAgICAgICAgICAgICAgICBwcm9taXNlID0gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFBvcHVwQWxlcnQoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogJ0FyY2hpdmFnZSBkZSBsYSBzw6lyaWUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiAnVm91bGV6LXZvdXMgYXJjaGl2ZXIgY2V0dGUgc8OpcmllIHRlcm1pbsOpZSA/JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tfeWVzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBqUXVlcnkoJyNyZWFjdGpzLXNob3ctYWN0aW9ucyBidXR0b24uYnRuLWFyY2hpdmUnKS50cmlnZ2VyKCdjbGljaycpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh2b2lkIDApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFja19ubzogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh2b2lkIDApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIE9uIHByb3Bvc2UgZGUgbm90ZXIgbGEgc8OpcmllXHJcbiAgICAgICAgICAgIGlmIChub3RlLnVzZXIgPT09IDApIHtcclxuICAgICAgICAgICAgICAgIGlmIChCYXNlXzEuQmFzZS5kZWJ1ZylcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnUHJvcG9zaXRpb24gZGUgdm90ZXIgcG91ciBsYSBzw6lyaWUnKTtcclxuICAgICAgICAgICAgICAgIHByb21pc2UudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFBvcHVwQWxlcnQoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogQmFzZV8xLkJhc2UudHJhbnMoXCJwb3Bpbi5ub3RlLnRpdGxlLnNob3dcIiksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6IFwiVm91bGV6LXZvdXMgbm90ZXIgbGEgc8OpcmllID9cIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tfeWVzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBqUXVlcnkoJy5ibG9ja0luZm9ybWF0aW9uc19fbWV0YWRhdGFzIC5qcy1yZW5kZXItc3RhcnMnKS50cmlnZ2VyKCdjbGljaycpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrX25vOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcHJvbWlzZS50aGVuKCgpID0+IHsgY2IoKTsgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBjYigpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogTWV0IMOgIGpvdXIgbGEgYmFycmUgZGUgcHJvZ3Jlc3Npb24gZGUgdmlzaW9ubmFnZSBkZSBsYSBzw6lyaWVcclxuICAgICAqIEByZXR1cm4ge3ZvaWR9XHJcbiAgICAgKi9cclxuICAgIHVwZGF0ZVByb2dyZXNzQmFyKCkge1xyXG4gICAgICAgIGlmIChCYXNlXzEuQmFzZS5kZWJ1ZylcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ3VwZGF0ZVByb2dyZXNzQmFyJyk7XHJcbiAgICAgICAgLy8gT24gbWV0IMOgIGpvdXIgbGEgYmFycmUgZGUgcHJvZ3Jlc3Npb25cclxuICAgICAgICBqUXVlcnkoJy5wcm9ncmVzc0JhclNob3cnKS5jc3MoJ3dpZHRoJywgdGhpcy51c2VyLnN0YXR1cy50b0ZpeGVkKDEpICsgJyUnKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogTWV0IMOgIGpvdXIgbGUgYmxvYyBkdSBwcm9jaGFpbiDDqXBpc29kZSDDoCB2b2lyXHJcbiAgICAgKiBAcGFyYW0gICB7RnVuY3Rpb259IFtjYj1ub29wXSBGb25jdGlvbiBkZSBjYWxsYmFja1xyXG4gICAgICogQHJldHVybnMge3ZvaWR9XHJcbiAgICAgKi9cclxuICAgIHVwZGF0ZU5leHRFcGlzb2RlKGNiID0gQmFzZV8xLkJhc2Uubm9vcCkge1xyXG4gICAgICAgIGlmIChCYXNlXzEuQmFzZS5kZWJ1ZylcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ3VwZGF0ZU5leHRFcGlzb2RlJyk7XHJcbiAgICAgICAgY29uc3QgJG5leHRFcGlzb2RlID0galF1ZXJ5KCdhLmJsb2NrTmV4dEVwaXNvZGUnKTtcclxuICAgICAgICBpZiAoJG5leHRFcGlzb2RlLmxlbmd0aCA+IDAgJiYgdGhpcy51c2VyLm5leHQgJiYgdGhpcy51c2VyLm5leHQuaWQgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgaWYgKEJhc2VfMS5CYXNlLmRlYnVnKVxyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ25leHRFcGlzb2RlIGV0IHNob3cudXNlci5uZXh0IE9LJywgdGhpcy51c2VyKTtcclxuICAgICAgICAgICAgLy8gTW9kaWZpZXIgbCdpbWFnZVxyXG4gICAgICAgICAgICBjb25zdCAkaW1nID0gJG5leHRFcGlzb2RlLmZpbmQoJ2ltZycpLCAkcmVtYWluaW5nID0gJG5leHRFcGlzb2RlLmZpbmQoJy5yZW1haW5pbmcgZGl2JyksICRwYXJlbnQgPSAkaW1nLnBhcmVudCgnZGl2JyksIGhlaWdodCA9ICRpbWcuYXR0cignaGVpZ2h0JyksIHdpZHRoID0gJGltZy5hdHRyKCd3aWR0aCcpLCBuZXh0ID0gdGhpcy51c2VyLm5leHQsIHNyYyA9IGAke0Jhc2VfMS5CYXNlLmFwaS51cmx9L3BpY3R1cmVzL2VwaXNvZGVzP2tleT0ke0Jhc2VfMS5CYXNlLnVzZXJLZXl9JmlkPSR7bmV4dC5pZH0md2lkdGg9JHt3aWR0aH0maGVpZ2h0PSR7aGVpZ2h0fWA7XHJcbiAgICAgICAgICAgICRpbWcucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICRwYXJlbnQuYXBwZW5kKGA8aW1nIHNyYz1cIiR7c3JjfVwiIGhlaWdodD1cIiR7aGVpZ2h0fVwiIHdpZHRoPVwiJHt3aWR0aH1cIiAvPmApO1xyXG4gICAgICAgICAgICAvLyBNb2RpZmllciBsZSB0aXRyZVxyXG4gICAgICAgICAgICAkbmV4dEVwaXNvZGUuZmluZCgnLnRpdGxlRXBpc29kZScpLnRleHQoYCR7bmV4dC5jb2RlLnRvVXBwZXJDYXNlKCl9IC0gJHtuZXh0LnRpdGxlfWApO1xyXG4gICAgICAgICAgICAvLyBNb2RpZmllciBsZSBsaWVuXHJcbiAgICAgICAgICAgICRuZXh0RXBpc29kZS5hdHRyKCdocmVmJywgJG5leHRFcGlzb2RlLmF0dHIoJ2hyZWYnKS5yZXBsYWNlKC9zXFxkezJ9ZVxcZHsyfS8sIG5leHQuY29kZS50b0xvd2VyQ2FzZSgpKSk7XHJcbiAgICAgICAgICAgIC8vIE1vZGlmaWVyIGxlIG5vbWJyZSBkJ8OpcGlzb2RlcyByZXN0YW50c1xyXG4gICAgICAgICAgICAkcmVtYWluaW5nLnRleHQoJHJlbWFpbmluZy50ZXh0KCkudHJpbSgpLnJlcGxhY2UoL15cXGQrLywgdGhpcy51c2VyLnJlbWFpbmluZy50b1N0cmluZygpKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKCRuZXh0RXBpc29kZS5sZW5ndGggPD0gMCAmJiB0aGlzLnVzZXIubmV4dCAmJiB0aGlzLnVzZXIubmV4dC5pZCAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICBpZiAoQmFzZV8xLkJhc2UuZGVidWcpXHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnTm8gbmV4dEVwaXNvZGUgZXQgc2hvdy51c2VyLm5leHQgT0snLCB0aGlzLnVzZXIpO1xyXG4gICAgICAgICAgICBidWlsZE5leHRFcGlzb2RlKHRoaXMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICghdGhpcy51c2VyLm5leHQgfHwgdGhpcy51c2VyLm5leHQuaWQgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgJG5leHRFcGlzb2RlLnJlbW92ZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjYigpO1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIENvbnN0cnVpdCB1bmUgdmlnbmV0dGUgcG91ciBsZSBwcm9jaGFpbiDDqXBpc29kZSDDoCB2b2lyXHJcbiAgICAgICAgICogQHBhcmFtICB7U2hvd30gcmVzICBPYmpldCBBUEkgc2hvd1xyXG4gICAgICAgICAqIEByZXR1cm4ge3ZvaWR9XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gYnVpbGROZXh0RXBpc29kZShyZXMpIHtcclxuICAgICAgICAgICAgY29uc3QgaGVpZ2h0ID0gNzAsIHdpZHRoID0gMTI0LCBzcmMgPSBgJHtCYXNlXzEuQmFzZS5hcGkudXJsfS9waWN0dXJlcy9lcGlzb2Rlcz9rZXk9JHtCYXNlXzEuQmFzZS51c2VyS2V5fSZpZD0ke3Jlcy51c2VyLm5leHQuaWR9JndpZHRoPSR7d2lkdGh9JmhlaWdodD0ke2hlaWdodH1gLCBzZXJpZVRpdGxlID0gcmVzLnJlc291cmNlX3VybC5zcGxpdCgnLycpLnBvcCgpO1xyXG4gICAgICAgICAgICBqUXVlcnkoJy5ibG9ja0luZm9ybWF0aW9uc19fYWN0aW9ucycpLmFmdGVyKGA8YSBocmVmPVwiL2VwaXNvZGUvJHtzZXJpZVRpdGxlfS8ke3Jlcy51c2VyLm5leHQuY29kZS50b0xvd2VyQ2FzZSgpfVwiIGNsYXNzPVwiYmxvY2tOZXh0RXBpc29kZSBtZWRpYVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibWVkaWEtbGVmdFwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidS1pbnNpZGVCb3JkZXJPcGFjaXR5IHUtaW5zaWRlQm9yZGVyT3BhY2l0eS0tMDFcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbWcgc3JjPVwiJHtzcmN9XCIgd2lkdGg9XCIke3dpZHRofVwiIGhlaWdodD1cIiR7aGVpZ2h0fVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtZWRpYS1ib2R5XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0aXRsZVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHN0cm9uZz5Qcm9jaGFpbiDDqXBpc29kZSDDoCByZWdhcmRlcjwvc3Ryb25nPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInRpdGxlRXBpc29kZVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHtyZXMudXNlci5uZXh0LmNvZGUudG9VcHBlckNhc2UoKX0gLSAke3Jlcy51c2VyLm5leHQudGl0bGV9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwicmVtYWluaW5nXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidS1jb2xvcldoaXRlT3BhY2l0eTA1XCI+JHtyZXMudXNlci5yZW1haW5pbmd9IMOpcGlzb2RlJHsocmVzLnVzZXIucmVtYWluaW5nID4gMSkgPyAncycgOiAnJ30gw6AgcmVnYXJkZXI8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDwvYT5gKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIE9uIGfDqHJlIGwnYWpvdXQgZGUgbGEgc8OpcmllIGRhbnMgbGUgY29tcHRlIHV0aWxpc2F0ZXVyXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtICAge2Jvb2xlYW59IHRyaWdFcGlzb2RlIEZsYWcgaW5kaXF1YW50IHNpIGwnYXBwZWwgdmllbnQgZCd1biBlcGlzb2RlIHZ1IG91IGR1IGJvdXRvblxyXG4gICAgICogQHJldHVybnMge3ZvaWR9XHJcbiAgICAgKi9cclxuICAgIGFkZFNob3dDbGljayh0cmlnRXBpc29kZSA9IGZhbHNlKSB7XHJcbiAgICAgICAgY29uc3QgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgIGNvbnN0IHZpZ25ldHRlcyA9ICQoJyNlcGlzb2RlcyAuc2xpZGVfX2ltYWdlJyk7XHJcbiAgICAgICAgLy8gVsOpcmlmaWVyIHNpIGxlIG1lbWJyZSBhIGFqb3V0ZXIgbGEgc8OpcmllIMOgIHNvbiBjb21wdGVcclxuICAgICAgICBpZiAoIXRoaXMuaW5fYWNjb3VudCkge1xyXG4gICAgICAgICAgICAvLyBSZW1wbGFjZXIgbGUgRE9NRWxlbWVudCBzdXBwcmltZSBsJ2V2ZW50SGFuZGxlclxyXG4gICAgICAgICAgICBqUXVlcnkoJyNyZWFjdGpzLXNob3ctYWN0aW9ucycpLmh0bWwoYFxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJibG9ja0luZm9ybWF0aW9uc19fYWN0aW9uXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiYnRuLXJlc2V0IGJ0bi10cmFuc3BhcmVudFwiIHR5cGU9XCJidXR0b25cIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJzdmdDb250YWluZXJcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICA8c3ZnIGZpbGw9XCIjMEQxNTFDXCIgd2lkdGg9XCIxNFwiIGhlaWdodD1cIjE0XCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHBhdGggZD1cIk0xNCA4SDh2Nkg2VjhIMFY2aDZWMGgydjZoNnpcIiBmaWxsLXJ1bGU9XCJub256ZXJvXCI+PC9wYXRoPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3ZnPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJsYWJlbFwiPkFqb3V0ZXI8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5gKTtcclxuICAgICAgICAgICAgLy8gT24gYWpvdXRlIHVuIGV2ZW50IGNsaWNrIHBvdXIgbWFzcXVlciBsZXMgdmlnbmV0dGVzXHJcbiAgICAgICAgICAgIGpRdWVyeSgnI3JlYWN0anMtc2hvdy1hY3Rpb25zID4gZGl2ID4gYnV0dG9uJykub2ZmKCdjbGljaycpLm9uZSgnY2xpY2snLCAoZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgIGlmIChCYXNlXzEuQmFzZS5kZWJ1ZylcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmdyb3VwQ29sbGFwc2VkKCdBZGRTaG93Jyk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBkb25lID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIE9uIG1ldCDDoCBqb3VyIGxlcyBib3V0b25zIEFyY2hpdmVyIGV0IEZhdm9yaVxyXG4gICAgICAgICAgICAgICAgICAgIGNoYW5nZUJ0bkFkZChfdGhpcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gT24gbWV0IMOgIGpvdXIgbGUgYmxvYyBkdSBwcm9jaGFpbiDDqXBpc29kZSDDoCB2b2lyXHJcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMudXBkYXRlTmV4dEVwaXNvZGUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoQmFzZV8xLkJhc2UuZGVidWcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmdyb3VwRW5kKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgX3RoaXMuYWRkVG9BY2NvdW50KClcclxuICAgICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiBkb25lKCksIGVyciA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVyciAmJiBlcnIuY29kZSAhPT0gdW5kZWZpbmVkICYmIGVyci5jb2RlID09PSAyMDAzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvbmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBCYXNlXzEuQmFzZS5ub3RpZmljYXRpb24oJ0VycmV1ciBkXFwnYWpvdXQgZGUgbGEgc8OpcmllJywgZXJyKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoQmFzZV8xLkJhc2UuZGVidWcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZ3JvdXBFbmQoKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQWpvdXRlIGxlcyBpdGVtcyBkdSBtZW51IE9wdGlvbnMsIGFpbnNpIHF1ZSBsZXMgYm91dG9ucyBBcmNoaXZlciBldCBGYXZvcmlzXHJcbiAgICAgICAgICogZXQgb24gYWpvdXRlIHVuIHZvaWxlIHN1ciBsZXMgaW1hZ2VzIGRlcyDDqXBpc29kZXMgbm9uLXZ1XHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0gIHtTaG93fSBzaG93IEwnb2JqZXQgZGUgdHlwZSBTaG93XHJcbiAgICAgICAgICogQHJldHVybiB7dm9pZH1cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBjaGFuZ2VCdG5BZGQoc2hvdykge1xyXG4gICAgICAgICAgICBsZXQgJG9wdGlvbnNMaW5rcyA9ICQoJyNkcm9wZG93bk9wdGlvbnMnKS5zaWJsaW5ncygnLmRyb3Bkb3duLW1lbnUnKS5jaGlsZHJlbignYS5oZWFkZXItbmF2aWdhdGlvbi1pdGVtJyk7XHJcbiAgICAgICAgICAgIGlmICgkb3B0aW9uc0xpbmtzLmxlbmd0aCA8PSAyKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgcmVhY3RfaWQgPSBqUXVlcnkoJ3NjcmlwdFtpZF49XCIvcmVhY3Rqcy9cIl0nKS5nZXQoMCkuaWQuc3BsaXQoJy4nKVsxXSwgdXJsU2hvdyA9IHNob3cucmVzb3VyY2VfdXJsLnN1YnN0cmluZyhsb2NhdGlvbi5vcmlnaW4ubGVuZ3RoKSwgdGl0bGUgPSBzaG93LnRpdGxlLnJlcGxhY2UoL1wiL2csICdcXFxcXCInKS5yZXBsYWNlKC8nL2csIFwiXFxcXCdcIiksIHRlbXBsYXRlT3B0cyA9IGBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4tcmVzZXQgaGVhZGVyLW5hdmlnYXRpb24taXRlbVwiIG9uY2xpY2s9XCJuZXcgUG9wdXBBbGVydCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hvd0Nsb3NlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFwicG9waW4tc3VidGl0bGVzXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVhY3RNb2R1bGVJZDogXCJyZWFjdGpzLXN1YnRpdGxlc1wiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVkaWFJZDogXCIke3Nob3cuaWR9XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBcInNob3dcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlUG9waW46IFwiJHt0aXRsZX1cIjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvYWRSZWNvbW1lbmRhdGlvbk1vZHVsZSgnc3VidGl0bGVzJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2FkZFNjcmlwdChcIi9yZWFjdGpzL3N1YnRpdGxlcy4ke3JlYWN0X2lkfS5qc1wiLCBcIm1vZHVsZS1yZWFjdGpzLXN1YnRpdGxlc1wiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcIj5Tb3VzLXRpdHJlczwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YSBjbGFzcz1cImhlYWRlci1uYXZpZ2F0aW9uLWl0ZW1cIiBocmVmPVwiamF2YXNjcmlwdDo7XCIgb25jbGljaz1cInJlcG9ydEl0ZW0oJHtzaG93LmlkfSwgJ3Nob3cnKTtcIj5TaWduYWxlciB1biBwcm9ibMOobWU8L2E+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxhIGNsYXNzPVwiaGVhZGVyLW5hdmlnYXRpb24taXRlbVwiIGhyZWY9XCJqYXZhc2NyaXB0OjtcIiBvbmNsaWNrPVwic2hvd1VwZGF0ZSgnJHt0aXRsZX0nLCAke3Nob3cuaWR9LCAnMCcpXCI+RGVtYW5kZXIgdW5lIG1pc2Ugw6Agam91cjwvYT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGEgY2xhc3M9XCJoZWFkZXItbmF2aWdhdGlvbi1pdGVtXCIgaHJlZj1cIndlYmNhbDovL3d3dy5iZXRhc2VyaWVzLmNvbS9jYWwvaSR7dXJsU2hvd31cIj5QbGFubmluZyBpQ2FsIGRlIGxhIHPDqXJpZTwvYT5cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxmb3JtIGNsYXNzPVwiYXV0b2NvbXBsZXRlIGpzLWF1dG9jb21wbGV0ZS1mb3JtIGhlYWRlci1uYXZpZ2F0aW9uLWl0ZW1cIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJyZXNldFwiIGNsYXNzPVwiYnRuLXJlc2V0IGZvbnRXZWlnaHQ3MDAganMtYXV0b2NvbXBsZXRlLXNob3dcIiBzdHlsZT1cImNvbG9yOiBpbmhlcml0XCI+UmVjb21tYW5kZXIgbGEgc8OpcmllPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImF1dG9jb21wbGV0ZV9fdG9TaG93XCIgaGlkZGVuPVwiXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgcGxhY2Vob2xkZXI9XCJOb20gZCd1biBhbWlcIiB0eXBlPVwidGV4dFwiIGNsYXNzPVwiYXV0b2NvbXBsZXRlX19pbnB1dCBqcy1zZWFyY2gtZnJpZW5kc1wiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImF1dG9jb21wbGV0ZV9fcmVzcG9uc2UganMtZGlzcGxheS1yZXNwb25zZVwiPjwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Zvcm0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxhIGNsYXNzPVwiaGVhZGVyLW5hdmlnYXRpb24taXRlbVwiIGhyZWY9XCJqYXZhc2NyaXB0OjtcIj5TdXBwcmltZXIgZGUgbWVzIHPDqXJpZXM8L2E+YDtcclxuICAgICAgICAgICAgICAgIGlmICgkb3B0aW9uc0xpbmtzLmxlbmd0aCA9PT0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlT3B0cyA9IGA8YSBjbGFzcz1cImhlYWRlci1uYXZpZ2F0aW9uLWl0ZW1cIiBocmVmPVwiJHt1cmxTaG93fS9hY3Rpb25zXCI+Vm9zIGFjdGlvbnMgc3VyIGxhIHPDqXJpZTwvYT5gICsgdGVtcGxhdGVPcHRzO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgalF1ZXJ5KCcjZHJvcGRvd25PcHRpb25zJykuc2libGluZ3MoJy5kcm9wZG93bi1tZW51LmhlYWRlci1uYXZpZ2F0aW9uJylcclxuICAgICAgICAgICAgICAgICAgICAuYXBwZW5kKHRlbXBsYXRlT3B0cyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gT24gcmVtcGxhY2UgbGUgYm91dG9uIEFqb3V0ZXIgcGFyIGxlcyBib3V0b25zIEFyY2hpdmVyIGV0IEZhdm9yaXNcclxuICAgICAgICAgICAgY29uc3QgZGl2cyA9IGpRdWVyeSgnI3JlYWN0anMtc2hvdy1hY3Rpb25zID4gZGl2Jyk7XHJcbiAgICAgICAgICAgIGlmIChkaXZzLmxlbmd0aCA9PT0gMSkge1xyXG4gICAgICAgICAgICAgICAgalF1ZXJ5KCcjcmVhY3Rqcy1zaG93LWFjdGlvbnMnKS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgIGxldCAkY29udGFpbmVyID0galF1ZXJ5KCcuYmxvY2tJbmZvcm1hdGlvbnNfX2FjdGlvbnMnKSwgbWV0aG9kID0gJ3ByZXBlbmQnO1xyXG4gICAgICAgICAgICAgICAgLy8gU2kgbGUgYm91dG9uIFZPRCBlc3QgcHLDqXNlbnQsIG9uIHBsYWNlIGxlcyBib3V0b25zIGFwcsOoc1xyXG4gICAgICAgICAgICAgICAgaWYgKCQoJyNkcm9wZG93bldhdGNoT24nKS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJGNvbnRhaW5lciA9IGpRdWVyeSgnI2Ryb3Bkb3duV2F0Y2hPbicpLnBhcmVudCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZCA9ICdhZnRlcic7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAkY29udGFpbmVyW21ldGhvZF0oYFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRpc3BsYXlGbGV4IGFsaWduSXRlbXNGbGV4U3RhcnRcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZD1cInJlYWN0anMtc2hvdy1hY3Rpb25zXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS1zaG93LWlkPVwiJHtzaG93LmlkfVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEtdXNlci1oYXNhcmNoaXZlZD1cIiR7c2hvdy51c2VyLmFyY2hpdmVkID8gJzEnIDogJyd9XCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS1zaG93LWluYWNjb3VudD1cIjFcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLXVzZXItaWQ9XCIke0Jhc2VfMS5CYXNlLnVzZXJJZH1cIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLXNob3ctZmF2b3Jpc2VkPVwiJHtzaG93LnVzZXIuZmF2b3JpdGVkID8gJzEnIDogJyd9XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJibG9ja0luZm9ybWF0aW9uc19fYWN0aW9uXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0bi1yZXNldCBidG4tdHJhbnNwYXJlbnQgYnRuLWFyY2hpdmVcIiB0eXBlPVwiYnV0dG9uXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInN2Z0NvbnRhaW5lclwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3ZnIGZpbGw9XCIjMGQxNTFjXCIgaGVpZ2h0PVwiMTZcIiB3aWR0aD1cIjE2XCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9XCJtMTYgOC0xLjQxLTEuNDEtNS41OSA1LjU4di0xMi4xN2gtMnYxMi4xN2wtNS41OC01LjU5LTEuNDIgMS40MiA4IDh6XCI+PC9wYXRoPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3N2Zz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibGFiZWxcIj4ke0Jhc2VfMS5CYXNlLnRyYW5zKCdzaG93LmJ1dHRvbi5hcmNoaXZlLmxhYmVsJyl9PC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYmxvY2tJbmZvcm1hdGlvbnNfX2FjdGlvblwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJidG4tcmVzZXQgYnRuLXRyYW5zcGFyZW50IGJ0bi1mYXZvcmlzXCIgdHlwZT1cImJ1dHRvblwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJzdmdDb250YWluZXJcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHN2ZyBmaWxsPVwiI0ZGRlwiIHdpZHRoPVwiMjBcIiBoZWlnaHQ9XCIxOVwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPVwiTTE0LjUgMGMtMS43NCAwLTMuNDEuODEtNC41IDIuMDlDOC45MS44MSA3LjI0IDAgNS41IDAgMi40MiAwIDAgMi40MiAwIDUuNWMwIDMuNzggMy40IDYuODYgOC41NSAxMS41NEwxMCAxOC4zNWwxLjQ1LTEuMzJDMTYuNiAxMi4zNiAyMCA5LjI4IDIwIDUuNSAyMCAyLjQyIDE3LjU4IDAgMTQuNSAwem0tNC40IDE1LjU1bC0uMS4xLS4xLS4xQzUuMTQgMTEuMjQgMiA4LjM5IDIgNS41IDIgMy41IDMuNSAyIDUuNSAyYzEuNTQgMCAzLjA0Ljk5IDMuNTcgMi4zNmgxLjg3QzExLjQ2IDIuOTkgMTIuOTYgMiAxNC41IDJjMiAwIDMuNSAxLjUgMy41IDMuNSAwIDIuODktMy4xNCA1Ljc0LTcuOSAxMC4wNXpcIj48L3BhdGg+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3ZnPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJsYWJlbFwiPiR7QmFzZV8xLkJhc2UudHJhbnMoJ3Nob3cuYnV0dG9uLmZhdm9yaXRlLmxhYmVsJyl9PC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+YCk7XHJcbiAgICAgICAgICAgICAgICBzaG93LmVsdCA9IGpRdWVyeSgncmVhY3Rqcy1zaG93LWFjdGlvbnMnKTtcclxuICAgICAgICAgICAgICAgIC8vIE9uIG9mdXNxdWUgbCdpbWFnZSBkZXMgw6lwaXNvZGVzIG5vbi12dVxyXG4gICAgICAgICAgICAgICAgbGV0IHZpZ25ldHRlO1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgdiA9IDA7IHYgPCB2aWduZXR0ZXMubGVuZ3RoOyB2KyspIHtcclxuICAgICAgICAgICAgICAgICAgICB2aWduZXR0ZSA9ICQodmlnbmV0dGVzLmdldCh2KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZpZ25ldHRlLmZpbmQoJy5zZWVuJykubGVuZ3RoIDw9IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmlnbmV0dGUuZmluZCgnaW1nLmpzLWxhenktaW1hZ2UnKS5hdHRyKCdzdHlsZScsICdmaWx0ZXI6IGJsdXIoNXB4KTsnKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgX3RoaXMuYWRkRXZlbnRCdG5zQXJjaGl2ZUFuZEZhdm9yaXMoKTtcclxuICAgICAgICAgICAgX3RoaXMuZGVsZXRlU2hvd0NsaWNrKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0cmlnRXBpc29kZSkge1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZSh0cnVlKS50aGVuKHNob3cgPT4ge1xyXG4gICAgICAgICAgICAgICAgY2hhbmdlQnRuQWRkKHNob3cpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIEfDqHJlIGxhIHN1cHByZXNzaW9uIGRlIGxhIHPDqXJpZSBkdSBjb21wdGUgdXRpbGlzYXRldXJcclxuICAgICAqIEByZXR1cm5zIHt2b2lkfVxyXG4gICAgICovXHJcbiAgICBkZWxldGVTaG93Q2xpY2soKSB7XHJcbiAgICAgICAgY29uc3QgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgIGxldCAkb3B0aW9uc0xpbmtzID0gJCgnI2Ryb3Bkb3duT3B0aW9ucycpLnNpYmxpbmdzKCcuZHJvcGRvd24tbWVudScpLmNoaWxkcmVuKCdhLmhlYWRlci1uYXZpZ2F0aW9uLWl0ZW0nKTtcclxuICAgICAgICAvLyBMZSBtZW51IE9wdGlvbnMgZXN0IGF1IGNvbXBsZXRcclxuICAgICAgICBpZiAodGhpcy5pbl9hY2NvdW50ICYmICRvcHRpb25zTGlua3MubGVuZ3RoID4gMikge1xyXG4gICAgICAgICAgICB0aGlzLmFkZEV2ZW50QnRuc0FyY2hpdmVBbmRGYXZvcmlzKCk7XHJcbiAgICAgICAgICAgIC8vIEdlc3Rpb24gZGUgbGEgc3VwcHJlc3Npb24gZGUgbGEgc8OpcmllIGR1IGNvbXB0ZSB1dGlsaXNhdGV1clxyXG4gICAgICAgICAgICAkb3B0aW9uc0xpbmtzLmxhc3QoKS5yZW1vdmVBdHRyKCdvbmNsaWNrJykub2ZmKCdjbGljaycpLm9uKCdjbGljaycsIChlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZG9uZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBhZnRlck5vdGlmID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBPbiBuZXR0b2llIGxlcyBwcm9wcmnDqXTDqXMgc2VydmFudCDDoCBsJ3VwZGF0ZSBkZSBsJ2FmZmljaGFnZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy51c2VyLnN0YXR1cyA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLnVzZXIuYXJjaGl2ZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMudXNlci5mYXZvcml0ZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMudXNlci5yZW1haW5pbmcgPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy51c2VyLmxhc3QgPSBcIlMwMEUwMFwiO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy51c2VyLm5leHQuaWQgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5zYXZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIE9uIHJlbWV0IGxlIGJvdXRvbiBBam91dGVyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGpRdWVyeSgnI3JlYWN0anMtc2hvdy1hY3Rpb25zJykuaHRtbChgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImJsb2NrSW5mb3JtYXRpb25zX19hY3Rpb25cIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJidG4tcmVzZXQgYnRuLXRyYW5zcGFyZW50IGJ0bi1hZGRcIiB0eXBlPVwiYnV0dG9uXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwic3ZnQ29udGFpbmVyXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHN2ZyBmaWxsPVwiIzBEMTUxQ1wiIHdpZHRoPVwiMTRcIiBoZWlnaHQ9XCIxNFwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9XCJNMTQgOEg4djZINlY4SDBWNmg2VjBoMnY2aDZ6XCIgZmlsbC1ydWxlPVwibm9uemVyb1wiPjwvcGF0aD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3N2Zz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibGFiZWxcIj4ke0Jhc2VfMS5CYXNlLnRyYW5zKCdzaG93LmJ1dHRvbi5hZGQubGFiZWwnKX08L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5gKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gT24gc3VwcHJpbWUgbGVzIGl0ZW1zIGR1IG1lbnUgT3B0aW9uc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkb3B0aW9uc0xpbmtzLmZpcnN0KCkuc2libGluZ3MoKS5lYWNoKChpLCBlKSA9PiB7ICQoZSkucmVtb3ZlKCk7IH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBOZXR0b3lhZ2UgZGUgbCdhZmZpY2hhZ2UgZGVzIMOpcGlzb2Rlc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjaGVja3MgPSBqUXVlcnkoJyNlcGlzb2RlcyAuc2xpZGVfZmxleCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcHJvbWlzZSwgdXBkYXRlID0gZmFsc2U7IC8vIEZsYWcgcG91ciBsJ3VwZGF0ZSBkZSBsJ2FmZmljaGFnZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoX3RoaXMuY3VycmVudFNlYXNvbi5lcGlzb2RlcyAmJiBfdGhpcy5jdXJyZW50U2Vhc29uLmVwaXNvZGVzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb21pc2UgPSBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHJlc29sdmUoX3RoaXMuY3VycmVudFNlYXNvbikpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvbWlzZSA9IF90aGlzLmN1cnJlbnRTZWFzb24uZmV0Y2hFcGlzb2RlcygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb21pc2UudGhlbigoc2Vhc29uKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBlID0gMDsgZSA8IHNlYXNvbi5lcGlzb2Rlcy5sZW5ndGg7IGUrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzZWFzb24uZXBpc29kZXNbZV0uZWx0ID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlYXNvbi5lcGlzb2Rlc1tlXS5lbHQgPSAkKGNoZWNrcy5nZXQoZSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZSA9PT0gc2Vhc29uLmVwaXNvZGVzLmxlbmd0aCAtIDEpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKEJhc2VfMS5CYXNlLmRlYnVnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnY2xlYW4gZXBpc29kZSAlZCcsIGUsIHVwZGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2Vhc29uLmVwaXNvZGVzW2VdLnVwZGF0ZVJlbmRlcignbm90U2VlbicsIHVwZGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5hZGRTaG93Q2xpY2soKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICBuZXcgUG9wdXBBbGVydCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBCYXNlXzEuQmFzZS50cmFucyhcInBvcHVwLmRlbGV0ZV9zaG93X3N1Y2Nlc3MudGl0bGVcIiksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6IEJhc2VfMS5CYXNlLnRyYW5zKFwicG9wdXAuZGVsZXRlX3Nob3dfc3VjY2Vzcy50ZXh0XCIsIHsgXCIldGl0bGUlXCI6IF90aGlzLnRpdGxlIH0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB5ZXM6IEJhc2VfMS5CYXNlLnRyYW5zKFwicG9wdXAuZGVsZXRlX3Nob3dfc3VjY2Vzcy55ZXNcIiksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrX3llczogYWZ0ZXJOb3RpZlxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIC8vIFN1cHByaW1lciBsYSBzw6lyaWUgZHUgY29tcHRlIHV0aWxpc2F0ZXVyXHJcbiAgICAgICAgICAgICAgICBuZXcgUG9wdXBBbGVydCh7XHJcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IEJhc2VfMS5CYXNlLnRyYW5zKFwicG9wdXAuZGVsZXRlX3Nob3cudGl0bGVcIiwgeyBcIiV0aXRsZSVcIjogX3RoaXMudGl0bGUgfSksXHJcbiAgICAgICAgICAgICAgICAgICAgdGV4dDogQmFzZV8xLkJhc2UudHJhbnMoXCJwb3B1cC5kZWxldGVfc2hvdy50ZXh0XCIsIHsgXCIldGl0bGUlXCI6IF90aGlzLnRpdGxlIH0pLFxyXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrX3llczogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5yZW1vdmVGcm9tQWNjb3VudCgpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiBkb25lKCksIGVyciA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXJyICYmIGVyci5jb2RlICE9PSB1bmRlZmluZWQgJiYgZXJyLmNvZGUgPT09IDIwMDQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb25lKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTWVkaWFfMS5NZWRpYS5ub3RpZmljYXRpb24oJ0VycmV1ciBkZSBzdXBwcmVzc2lvbiBkZSBsYSBzw6lyaWUnLCBlcnIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrX25vOiBmdW5jdGlvbiAoKSB7IH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIEFqb3V0ZSB1biBldmVudEhhbmRsZXIgc3VyIGxlcyBib3V0b25zIEFyY2hpdmVyIGV0IEZhdm9yaXNcclxuICAgICAqIEByZXR1cm5zIHt2b2lkfVxyXG4gICAgICovXHJcbiAgICBhZGRFdmVudEJ0bnNBcmNoaXZlQW5kRmF2b3JpcygpIHtcclxuICAgICAgICBjb25zdCBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgbGV0ICRidG5BcmNoaXZlID0galF1ZXJ5KCcjcmVhY3Rqcy1zaG93LWFjdGlvbnMgYnV0dG9uLmJ0bi1hcmNoaXZlJyksICRidG5GYXZvcmlzID0galF1ZXJ5KCcjcmVhY3Rqcy1zaG93LWFjdGlvbnMgYnV0dG9uLmJ0bi1mYXZvcmlzJyk7XHJcbiAgICAgICAgaWYgKCRidG5BcmNoaXZlLmxlbmd0aCA9PT0gMCB8fCAkYnRuRmF2b3Jpcy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgJCgnI3JlYWN0anMtc2hvdy1hY3Rpb25zIGJ1dHRvbjpmaXJzdCcpLmFkZENsYXNzKCdidG4tYXJjaGl2ZScpO1xyXG4gICAgICAgICAgICAkYnRuQXJjaGl2ZSA9IGpRdWVyeSgnI3JlYWN0anMtc2hvdy1hY3Rpb25zIGJ1dHRvbi5idG4tYXJjaGl2ZScpO1xyXG4gICAgICAgICAgICAkKCcjcmVhY3Rqcy1zaG93LWFjdGlvbnMgYnV0dG9uOmxhc3QnKS5hZGRDbGFzcygnYnRuLWZhdm9yaXMnKTtcclxuICAgICAgICAgICAgJGJ0bkZhdm9yaXMgPSBqUXVlcnkoJyNyZWFjdGpzLXNob3ctYWN0aW9ucyBidXR0b24uYnRuLWZhdm9yaXMnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gRXZlbnQgYm91dG9uIEFyY2hpdmVyXHJcbiAgICAgICAgJGJ0bkFyY2hpdmUub2ZmKCdjbGljaycpLmNsaWNrKChlKSA9PiB7XHJcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgaWYgKEJhc2VfMS5CYXNlLmRlYnVnKVxyXG4gICAgICAgICAgICAgICAgY29uc29sZS5ncm91cENvbGxhcHNlZCgnc2hvdy1hcmNoaXZlJyk7XHJcbiAgICAgICAgICAgIC8vIE1ldCDDoCBqb3VyIGxlIGJvdXRvbiBkJ2FyY2hpdmFnZSBkZSBsYSBzw6lyaWVcclxuICAgICAgICAgICAgZnVuY3Rpb24gdXBkYXRlQnRuQXJjaGl2ZShwcm9taXNlLCB0cmFuc2Zvcm0sIGxhYmVsLCBub3RpZikge1xyXG4gICAgICAgICAgICAgICAgcHJvbWlzZS50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCAkcGFyZW50ID0gJChlLmN1cnJlbnRUYXJnZXQpLnBhcmVudCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICQoJ3NwYW4nLCBlLmN1cnJlbnRUYXJnZXQpLmNzcygndHJhbnNmb3JtJywgdHJhbnNmb3JtKTtcclxuICAgICAgICAgICAgICAgICAgICAkKCcubGFiZWwnLCAkcGFyZW50KS50ZXh0KEJhc2VfMS5CYXNlLnRyYW5zKGxhYmVsKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKEJhc2VfMS5CYXNlLmRlYnVnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmdyb3VwRW5kKCk7XHJcbiAgICAgICAgICAgICAgICB9LCBlcnIgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIEJhc2VfMS5CYXNlLm5vdGlmaWNhdGlvbihub3RpZiwgZXJyKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoQmFzZV8xLkJhc2UuZGVidWcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZ3JvdXBFbmQoKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICghX3RoaXMuaXNBcmNoaXZlZCgpKSB7XHJcbiAgICAgICAgICAgICAgICB1cGRhdGVCdG5BcmNoaXZlKF90aGlzLmFyY2hpdmUoKSwgJ3JvdGF0ZSgxODBkZWcpJywgJ3Nob3cuYnV0dG9uLnVuYXJjaGl2ZS5sYWJlbCcsICdFcnJldXIgZFxcJ2FyY2hpdmFnZSBkZSBsYSBzw6lyaWUnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHVwZGF0ZUJ0bkFyY2hpdmUoX3RoaXMudW5hcmNoaXZlKCksICdyb3RhdGUoMGRlZyknLCAnc2hvdy5idXR0b24uYXJjaGl2ZS5sYWJlbCcsICdFcnJldXIgZMOpc2FyY2hpdmFnZSBkZSBsYSBzw6lyaWUnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vIEV2ZW50IGJvdXRvbiBGYXZvcmlzXHJcbiAgICAgICAgJGJ0bkZhdm9yaXMub2ZmKCdjbGljaycpLmNsaWNrKChlKSA9PiB7XHJcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgaWYgKEJhc2VfMS5CYXNlLmRlYnVnKVxyXG4gICAgICAgICAgICAgICAgY29uc29sZS5ncm91cENvbGxhcHNlZCgnc2hvdy1mYXZvcmlzJyk7XHJcbiAgICAgICAgICAgIGlmICghX3RoaXMuaXNGYXZvcml0ZSgpKSB7XHJcbiAgICAgICAgICAgICAgICBfdGhpcy5mYXZvcml0ZSgpXHJcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGpRdWVyeShlLmN1cnJlbnRUYXJnZXQpLmNoaWxkcmVuKCdzcGFuJykucmVwbGFjZVdpdGgoYFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInN2Z0NvbnRhaW5lclwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzdmcgd2lkdGg9XCIyMVwiIGhlaWdodD1cIjE5XCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHBhdGggZD1cIk0xNS4xNTYuOTFhNS44ODcgNS44ODcgMCAwIDAtNC40MDYgMi4wMjZBNS44ODcgNS44ODcgMCAwIDAgNi4zNDQuOTA5QzMuMzI4LjkxLjk1OCAzLjI1Ni45NTggNi4yNDJjMCAzLjY2NiAzLjMzIDYuNjUzIDguMzcyIDExLjE5bDEuNDIgMS4yNzEgMS40Mi0xLjI4YzUuMDQyLTQuNTI4IDguMzcyLTcuNTE1IDguMzcyLTExLjE4IDAtMi45ODctMi4zNy01LjMzNC01LjM4Ni01LjMzNHpcIj48L3BhdGg+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zdmc+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5gKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoQmFzZV8xLkJhc2UuZGVidWcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZ3JvdXBFbmQoKTtcclxuICAgICAgICAgICAgICAgIH0sIGVyciA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgQmFzZV8xLkJhc2Uubm90aWZpY2F0aW9uKCdFcnJldXIgZGUgZmF2b3JpcyBkZSBsYSBzw6lyaWUnLCBlcnIpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChCYXNlXzEuQmFzZS5kZWJ1ZylcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5ncm91cEVuZCgpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBfdGhpcy51bmZhdm9yaXRlKClcclxuICAgICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgJChlLmN1cnJlbnRUYXJnZXQpLmNoaWxkcmVuKCdzcGFuJykucmVwbGFjZVdpdGgoYFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInN2Z0NvbnRhaW5lclwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzdmcgZmlsbD1cIiNGRkZcIiB3aWR0aD1cIjIwXCIgaGVpZ2h0PVwiMTlcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPVwiTTE0LjUgMGMtMS43NCAwLTMuNDEuODEtNC41IDIuMDlDOC45MS44MSA3LjI0IDAgNS41IDAgMi40MiAwIDAgMi40MiAwIDUuNWMwIDMuNzggMy40IDYuODYgOC41NSAxMS41NEwxMCAxOC4zNWwxLjQ1LTEuMzJDMTYuNiAxMi4zNiAyMCA5LjI4IDIwIDUuNSAyMCAyLjQyIDE3LjU4IDAgMTQuNSAwem0tNC40IDE1LjU1bC0uMS4xLS4xLS4xQzUuMTQgMTEuMjQgMiA4LjM5IDIgNS41IDIgMy41IDMuNSAyIDUuNSAyYzEuNTQgMCAzLjA0Ljk5IDMuNTcgMi4zNmgxLjg3QzExLjQ2IDIuOTkgMTIuOTYgMiAxNC41IDJjMiAwIDMuNSAxLjUgMy41IDMuNSAwIDIuODktMy4xNCA1Ljc0LTcuOSAxMC4wNXpcIj48L3BhdGg+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zdmc+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5gKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoQmFzZV8xLkJhc2UuZGVidWcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZ3JvdXBFbmQoKTtcclxuICAgICAgICAgICAgICAgIH0sIGVyciA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgQmFzZV8xLkJhc2Uubm90aWZpY2F0aW9uKCdFcnJldXIgZGUgZmF2b3JpcyBkZSBsYSBzw6lyaWUnLCBlcnIpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChCYXNlXzEuQmFzZS5kZWJ1ZylcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5ncm91cEVuZCgpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogQWpvdXRlIGxhIGNsYXNzaWZpY2F0aW9uIGRhbnMgbGVzIGTDqXRhaWxzIGRlIGxhIHJlc3NvdXJjZVxyXG4gICAgICovXHJcbiAgICBhZGRSYXRpbmcoKSB7XHJcbiAgICAgICAgaWYgKEJhc2VfMS5CYXNlLmRlYnVnKVxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnYWRkUmF0aW5nJyk7XHJcbiAgICAgICAgaWYgKHRoaXMucmF0aW5nKSB7XHJcbiAgICAgICAgICAgIGxldCByYXRpbmcgPSBCYXNlXzEuQmFzZS5yYXRpbmdzW3RoaXMucmF0aW5nXSAhPT0gdW5kZWZpbmVkID8gQmFzZV8xLkJhc2UucmF0aW5nc1t0aGlzLnJhdGluZ10gOiBudWxsO1xyXG4gICAgICAgICAgICBpZiAocmF0aW5nICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBPbiBham91dGUgbGEgY2xhc3NpZmljYXRpb25cclxuICAgICAgICAgICAgICAgIGpRdWVyeSgnLmJsb2NrSW5mb3JtYXRpb25zX19kZXRhaWxzJylcclxuICAgICAgICAgICAgICAgICAgICAuYXBwZW5kKGA8bGkgaWQ9XCJyYXRpbmdcIj48c3Ryb25nPkNsYXNzaWZpY2F0aW9uPC9zdHJvbmc+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aW1nIHNyYz1cIiR7cmF0aW5nLmltZ31cIiB0aXRsZT1cIiR7cmF0aW5nLnRpdGxlfVwiLz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9saT5gKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogRMOpZmluaXQgbGEgc2Fpc29uIGNvdXJhbnRlXHJcbiAgICAgKiBAcGFyYW0gICB7bnVtYmVyfSBzZWFzb25OdW1iZXIgTGUgbnVtw6lybyBkZSBsYSBzYWlzb24gY291cmFudGVcclxuICAgICAqIEByZXR1cm5zIHtTaG93fSAgTCdpbnN0YW5jZSBkZSBsYSBzw6lyaWVcclxuICAgICAqIEB0aHJvd3MgIHtFcnJvcn0gaWYgc2Vhc29uTnVtYmVyIGlzIG91dCBvZiByYW5nZSBvZiBzZWFzb25zXHJcbiAgICAgKi9cclxuICAgIHNldEN1cnJlbnRTZWFzb24oc2Vhc29uTnVtYmVyKSB7XHJcbiAgICAgICAgaWYgKHNlYXNvbk51bWJlciA8IDAgfHwgc2Vhc29uTnVtYmVyID49IHRoaXMuc2Vhc29ucy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwic2Vhc29uTnVtYmVyIGlzIG91dCBvZiByYW5nZSBvZiBzZWFzb25zXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmN1cnJlbnRTZWFzb24gPSB0aGlzLnNlYXNvbnNbc2Vhc29uTnVtYmVyXTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxufVxyXG5leHBvcnRzLlNob3cgPSBTaG93O1xyXG4vLyB9XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbmV4cG9ydHMuU2ltaWxhciA9IHZvaWQgMDtcclxuLy8gbmFtZXNwYWNlIEJTIHtcclxuY29uc3QgQmFzZV8xID0gcmVxdWlyZShcIi4vQmFzZVwiKTtcclxuY29uc3QgTWVkaWFfMSA9IHJlcXVpcmUoXCIuL01lZGlhXCIpO1xyXG5jb25zdCBTaG93XzEgPSByZXF1aXJlKFwiLi9TaG93XCIpO1xyXG5jbGFzcyBTaW1pbGFyIGV4dGVuZHMgTWVkaWFfMS5NZWRpYSB7XHJcbiAgICAvKiBJbnRlcmZhY2UgaW1wbE1vdmllICovXHJcbiAgICBiYWNrZHJvcDtcclxuICAgIGRpcmVjdG9yO1xyXG4gICAgb3JpZ2luYWxfcmVsZWFzZV9kYXRlO1xyXG4gICAgb3RoZXJfdGl0bGU7XHJcbiAgICBwbGF0Zm9ybV9saW5rcztcclxuICAgIHBvc3RlcjtcclxuICAgIHByb2R1Y3Rpb25feWVhcjtcclxuICAgIHJlbGVhc2VfZGF0ZTtcclxuICAgIHNhbGVfZGF0ZTtcclxuICAgIHRhZ2xpbmU7XHJcbiAgICB0bWRiX2lkO1xyXG4gICAgdHJhaWxlcjtcclxuICAgIHVybDtcclxuICAgIC8qIEludGVyZmFjZSBpbXBsU2hvdyAqL1xyXG4gICAgYWxpYXNlcztcclxuICAgIGNyZWF0aW9uO1xyXG4gICAgY291bnRyeTtcclxuICAgIGltYWdlcztcclxuICAgIG5iRXBpc29kZXM7XHJcbiAgICBuZXR3b3JrO1xyXG4gICAgbmV4dF90cmFpbGVyO1xyXG4gICAgbmV4dF90cmFpbGVyX2hvc3Q7XHJcbiAgICByYXRpbmc7XHJcbiAgICBwaWN0dXJlcztcclxuICAgIHBsYXRmb3JtcztcclxuICAgIHNlYXNvbnM7XHJcbiAgICBzaG93cnVubmVyO1xyXG4gICAgc29jaWFsX2xpbmtzO1xyXG4gICAgc3RhdHVzO1xyXG4gICAgdGhldHZkYl9pZDtcclxuICAgIGNvbnN0cnVjdG9yKGRhdGEsIHR5cGUpIHtcclxuICAgICAgICBpZiAodHlwZS5zaW5ndWxhciA9PT0gQmFzZV8xLk1lZGlhVHlwZS5tb3ZpZSkge1xyXG4gICAgICAgICAgICBkYXRhLmluX2FjY291bnQgPSBkYXRhLnVzZXIuaW5fYWNjb3VudDtcclxuICAgICAgICAgICAgZGVsZXRlIGRhdGEudXNlci5pbl9hY2NvdW50O1xyXG4gICAgICAgICAgICBkYXRhLmRlc2NyaXB0aW9uID0gZGF0YS5zeW5vcHNpcztcclxuICAgICAgICAgICAgZGVsZXRlIGRhdGEuc3lub3BzaXM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHN1cGVyKGRhdGEpO1xyXG4gICAgICAgIHRoaXMubWVkaWFUeXBlID0gdHlwZTtcclxuICAgICAgICByZXR1cm4gdGhpcy5maWxsKGRhdGEpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBSZW1wbGl0IGwnb2JqZXQgYXZlYyBsZXMgZG9ubsOpZXMgZm91cm5pdCBlbiBwYXJhbcOodHJlXHJcbiAgICAgKiBAcGFyYW0gIHtPYmp9IGRhdGEgTGVzIGRvbm7DqWVzIHByb3ZlbmFudCBkZSBsJ0FQSVxyXG4gICAgICogQHJldHVybnMge1NpbWlsYXJ9XHJcbiAgICAgKi9cclxuICAgIGZpbGwoZGF0YSkge1xyXG4gICAgICAgIGlmICh0aGlzLm1lZGlhVHlwZS5zaW5ndWxhciA9PT0gQmFzZV8xLk1lZGlhVHlwZS5zaG93KSB7XHJcbiAgICAgICAgICAgIHRoaXMuYWxpYXNlcyA9IGRhdGEuYWxpYXNlcztcclxuICAgICAgICAgICAgdGhpcy5jcmVhdGlvbiA9IGRhdGEuY3JlYXRpb247XHJcbiAgICAgICAgICAgIHRoaXMuY291bnRyeSA9IGRhdGEuY291bnRyeTtcclxuICAgICAgICAgICAgdGhpcy5pbWFnZXMgPSBuZXcgU2hvd18xLkltYWdlcyhkYXRhLmltYWdlcyk7XHJcbiAgICAgICAgICAgIHRoaXMubmJFcGlzb2RlcyA9IHBhcnNlSW50KGRhdGEuZXBpc29kZXMsIDEwKTtcclxuICAgICAgICAgICAgdGhpcy5uZXR3b3JrID0gZGF0YS5uZXR3b3JrO1xyXG4gICAgICAgICAgICB0aGlzLm5leHRfdHJhaWxlciA9IGRhdGEubmV4dF90cmFpbGVyO1xyXG4gICAgICAgICAgICB0aGlzLm5leHRfdHJhaWxlcl9ob3N0ID0gZGF0YS5uZXh0X3RyYWlsZXJfaG9zdDtcclxuICAgICAgICAgICAgdGhpcy5yYXRpbmcgPSBkYXRhLnJhdGluZztcclxuICAgICAgICAgICAgdGhpcy5wbGF0Zm9ybXMgPSBuZXcgU2hvd18xLlBsYXRmb3JtcyhkYXRhLnBsYXRmb3Jtcyk7XHJcbiAgICAgICAgICAgIHRoaXMuc2Vhc29ucyA9IG5ldyBBcnJheSgpO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBzID0gMDsgcyA8IGRhdGEuc2Vhc29uc19kZXRhaWxzLmxlbmd0aDsgcysrKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlYXNvbnMucHVzaChuZXcgU2hvd18xLlNlYXNvbihkYXRhLnNlYXNvbnNfZGV0YWlsc1tzXSwgdGhpcykpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuc2hvd3J1bm5lciA9IG5ldyBTaG93XzEuU2hvd3J1bm5lcihkYXRhLnNob3dydW5uZXIpO1xyXG4gICAgICAgICAgICB0aGlzLnNvY2lhbF9saW5rcyA9IGRhdGEuc29jaWFsX2xpbmtzO1xyXG4gICAgICAgICAgICB0aGlzLnN0YXR1cyA9IGRhdGEuc3RhdHVzO1xyXG4gICAgICAgICAgICB0aGlzLnRoZXR2ZGJfaWQgPSBwYXJzZUludChkYXRhLnRoZXR2ZGJfaWQsIDEwKTtcclxuICAgICAgICAgICAgdGhpcy5waWN0dXJlcyA9IG5ldyBBcnJheSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh0aGlzLm1lZGlhVHlwZS5zaW5ndWxhciA9PT0gQmFzZV8xLk1lZGlhVHlwZS5tb3ZpZSkge1xyXG4gICAgICAgICAgICBpZiAoZGF0YS51c2VyLmluX2FjY291bnQgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgZGF0YS5pbl9hY2NvdW50ID0gZGF0YS51c2VyLmluX2FjY291bnQ7XHJcbiAgICAgICAgICAgICAgICBkZWxldGUgZGF0YS51c2VyLmluX2FjY291bnQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGRhdGEuc3lub3BzaXMgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgZGF0YS5kZXNjcmlwdGlvbiA9IGRhdGEuc3lub3BzaXM7XHJcbiAgICAgICAgICAgICAgICBkZWxldGUgZGF0YS5zeW5vcHNpcztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmJhY2tkcm9wID0gZGF0YS5iYWNrZHJvcDtcclxuICAgICAgICAgICAgdGhpcy5kaXJlY3RvciA9IGRhdGEuZGlyZWN0b3I7XHJcbiAgICAgICAgICAgIHRoaXMub3JpZ2luYWxfcmVsZWFzZV9kYXRlID0gbmV3IERhdGUoZGF0YS5vcmlnaW5hbF9yZWxlYXNlX2RhdGUpO1xyXG4gICAgICAgICAgICB0aGlzLm90aGVyX3RpdGxlID0gZGF0YS5vdGhlcl90aXRsZTtcclxuICAgICAgICAgICAgdGhpcy5wbGF0Zm9ybV9saW5rcyA9IGRhdGEucGxhdGZvcm1fbGlua3M7XHJcbiAgICAgICAgICAgIHRoaXMucG9zdGVyID0gZGF0YS5wb3N0ZXI7XHJcbiAgICAgICAgICAgIHRoaXMucHJvZHVjdGlvbl95ZWFyID0gcGFyc2VJbnQoZGF0YS5wcm9kdWN0aW9uX3llYXIpO1xyXG4gICAgICAgICAgICB0aGlzLnJlbGVhc2VfZGF0ZSA9IG5ldyBEYXRlKGRhdGEucmVsZWFzZV9kYXRlKTtcclxuICAgICAgICAgICAgdGhpcy5zYWxlX2RhdGUgPSBuZXcgRGF0ZShkYXRhLnNhbGVfZGF0ZSk7XHJcbiAgICAgICAgICAgIHRoaXMudGFnbGluZSA9IGRhdGEudGFnbGluZTtcclxuICAgICAgICAgICAgdGhpcy50bWRiX2lkID0gcGFyc2VJbnQoZGF0YS50bWRiX2lkKTtcclxuICAgICAgICAgICAgdGhpcy50cmFpbGVyID0gZGF0YS50cmFpbGVyO1xyXG4gICAgICAgICAgICB0aGlzLnVybCA9IGRhdGEudXJsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzdXBlci5maWxsKGRhdGEpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBSw6ljdXDDqHJlIGxlcyBkb25uw6llcyBkZSBsYSBzw6lyaWUgc3VyIGwnQVBJXHJcbiAgICAgKiBAcGFyYW0gIHtib29sZWFufSBbZm9yY2U9dHJ1ZV0gICBJbmRpcXVlIHNpIG9uIHV0aWxpc2UgbGVzIGRvbm7DqWVzIGVuIGNhY2hlXHJcbiAgICAgKiBAcmV0dXJuIHtQcm9taXNlPCo+fSAgICAgICAgICAgICBMZXMgZG9ubsOpZXMgZGUgbGEgc8OpcmllXHJcbiAgICAgKi9cclxuICAgIGZldGNoKGZvcmNlID0gdHJ1ZSkge1xyXG4gICAgICAgIGxldCBhY3Rpb24gPSAnZGlzcGxheSc7XHJcbiAgICAgICAgaWYgKHRoaXMubWVkaWFUeXBlLnNpbmd1bGFyID09PSBCYXNlXzEuTWVkaWFUeXBlLm1vdmllKSB7XHJcbiAgICAgICAgICAgIGFjdGlvbiA9ICdtb3ZpZSc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBCYXNlXzEuQmFzZS5jYWxsQXBpKCdHRVQnLCB0aGlzLm1lZGlhVHlwZS5wbHVyYWwsIGFjdGlvbiwgeyBpZDogdGhpcy5pZCB9LCBmb3JjZSk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIEFqb3V0ZSBsZSBiYW5kZWF1IFZpZXdlZCBzdXIgbGUgcG9zdGVyIGR1IHNpbWlsYXJcclxuICAgICAqIEByZXR1cm4ge1NpbWlsYXJ9XHJcbiAgICAgKi9cclxuICAgIGFkZFZpZXdlZCgpIHtcclxuICAgICAgICAvLyBTaSBsYSBzw6lyaWUgYSDDqXTDqSB2dWUgb3UgY29tbWVuY8OpZVxyXG4gICAgICAgIGlmICh0aGlzLnVzZXIuc3RhdHVzICYmXHJcbiAgICAgICAgICAgICgodGhpcy5tZWRpYVR5cGUuc2luZ3VsYXIgPT09IEJhc2VfMS5NZWRpYVR5cGUubW92aWUgJiYgdGhpcy51c2VyLnN0YXR1cyA9PT0gMSkgfHxcclxuICAgICAgICAgICAgICAgICh0aGlzLm1lZGlhVHlwZS5zaW5ndWxhciA9PT0gQmFzZV8xLk1lZGlhVHlwZS5zaG93ICYmIHRoaXMudXNlci5zdGF0dXMgPiAwKSkpIHtcclxuICAgICAgICAgICAgLy8gT24gYWpvdXRlIGxlIGJhbmRlYXUgXCJWaWV3ZWRcIlxyXG4gICAgICAgICAgICB0aGlzLmVsdC5maW5kKCdhLnNsaWRlX19pbWFnZScpLnByZXBlbmQoYDxpbWcgc3JjPVwiJHtCYXNlXzEuQmFzZS5zZXJ2ZXJCYXNlVXJsfS9pbWcvdmlld2VkLnBuZ1wiIGNsYXNzPVwiYmFuZFZpZXdlZFwiLz5gKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIEFqb3V0ZSBsJ2ljw7RuZSB3cmVuY2ggw6AgY8O0dMOpIGR1IHRpdHJlIGR1IHNpbWlsYXJcclxuICAgICAqIHBvdXIgcGVybWV0dHJlIGRlIHZpc3VhbGlzZXIgbGVzIGRvbm7DqWVzIGR1IHNpbWlsYXJcclxuICAgICAqIEByZXR1cm4ge1NpbWlsYXJ9XHJcbiAgICAgKi9cclxuICAgIHdyZW5jaCgpIHtcclxuICAgICAgICBjb25zdCAkdGl0bGUgPSB0aGlzLmVsdC5maW5kKCcuc2xpZGVfX3RpdGxlJyksIF90aGlzID0gdGhpcztcclxuICAgICAgICAkdGl0bGUuaHRtbCgkdGl0bGUuaHRtbCgpICtcclxuICAgICAgICAgICAgYDxpIGNsYXNzPVwiZmEgZmEtd3JlbmNoIHBvcG92ZXItd3JlbmNoXCJcclxuICAgICAgICAgICAgICAgICAgYXJpYS1oaWRkZW49XCJ0cnVlXCJcclxuICAgICAgICAgICAgICAgICAgc3R5bGU9XCJtYXJnaW4tbGVmdDo1cHg7Y3Vyc29yOnBvaW50ZXI7XCJcclxuICAgICAgICAgICAgICAgICAgZGF0YS1pZD1cIiR7X3RoaXMuaWR9XCJcclxuICAgICAgICAgICAgICAgICAgZGF0YS10eXBlPVwiJHtfdGhpcy5tZWRpYVR5cGUuc2luZ3VsYXJ9XCI+XHJcbiAgICAgICAgICAgICAgIDwvaT5gKTtcclxuICAgICAgICAkdGl0bGUuZmluZCgnLnBvcG92ZXItd3JlbmNoJykuY2xpY2soKGUpID0+IHtcclxuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICBjb25zdCAkZGF0YVJlcyA9ICQoJyNkaWFsb2ctcmVzb3VyY2UgLmRhdGEtcmVzb3VyY2UnKSwgLy8gRE9NRWxlbWVudCBjb250ZW5hbnQgbGUgcmVuZHUgSlNPTiBkZSBsYSByZXNzb3VyY2VcclxuICAgICAgICAgICAgaHRtbCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcclxuICAgICAgICAgICAgY29uc3Qgb25TaG93ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgaHRtbC5zdHlsZS5vdmVyZmxvd1kgPSAnaGlkZGVuJztcclxuICAgICAgICAgICAgICAgIGpRdWVyeSgnI2RpYWxvZy1yZXNvdXJjZScpXHJcbiAgICAgICAgICAgICAgICAgICAgLmNzcygnei1pbmRleCcsICcxMDA1JylcclxuICAgICAgICAgICAgICAgICAgICAuY3NzKCdvdmVyZmxvdycsICdzY3JvbGwnKTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgY29uc3Qgb25IaWRlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgaHRtbC5zdHlsZS5vdmVyZmxvd1kgPSAnJztcclxuICAgICAgICAgICAgICAgIGpRdWVyeSgnI2RpYWxvZy1yZXNvdXJjZScpXHJcbiAgICAgICAgICAgICAgICAgICAgLmNzcygnei1pbmRleCcsICcwJylcclxuICAgICAgICAgICAgICAgICAgICAuY3NzKCdvdmVyZmxvdycsICdub25lJyk7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIC8vaWYgKGRlYnVnKSBjb25zb2xlLmxvZygnUG9wb3ZlciBXcmVuY2gnLCBlbHRJZCwgc2VsZik7XHJcbiAgICAgICAgICAgIHRoaXMuZmV0Y2goKS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAkZGF0YVJlcy5lbXB0eSgpLmFwcGVuZChyZW5kZXJqc29uLnNldF9zaG93X3RvX2xldmVsKDIpKGRhdGFbX3RoaXMubWVkaWFUeXBlLnNpbmd1bGFyXSkpO1xyXG4gICAgICAgICAgICAgICAgalF1ZXJ5KCcjZGlhbG9nLXJlc291cmNlLXRpdGxlIHNwYW4uY291bnRlcicpLmVtcHR5KCkudGV4dCgnKCcgKyBCYXNlXzEuQmFzZS5jb3VudGVyICsgJyBhcHBlbHMgQVBJKScpO1xyXG4gICAgICAgICAgICAgICAgalF1ZXJ5KCcjZGlhbG9nLXJlc291cmNlJykuc2hvdyg0MDAsIG9uU2hvdyk7XHJcbiAgICAgICAgICAgICAgICBqUXVlcnkoJyNkaWFsb2ctcmVzb3VyY2UgLmNsb3NlJykuY2xpY2soKGUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgICAgICBqUXVlcnkoJyNkaWFsb2ctcmVzb3VyY2UnKS5oaWRlKDQwMCwgb25IaWRlKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogUmV0b3VybmUgbGUgY29udGVudSBIVE1MIHBvdXIgbGEgcG9wdXBcclxuICAgICAqIGRlIHByw6lzZW50YXRpb24gZHUgc2ltaWxhclxyXG4gICAgICogQHJldHVybiB7c3RyaW5nfVxyXG4gICAgICovXHJcbiAgICBnZXRDb250ZW50UG9wdXAoKSB7XHJcbiAgICAgICAgY29uc3QgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgIC8vaWYgKGRlYnVnKSBjb25zb2xlLmxvZygnc2ltaWxhcnMgdGVtcENvbnRlbnRQb3B1cCcsIG9ialJlcyk7XHJcbiAgICAgICAgbGV0IGRlc2NyaXB0aW9uID0gdGhpcy5kZXNjcmlwdGlvbjtcclxuICAgICAgICBpZiAoZGVzY3JpcHRpb24ubGVuZ3RoID4gMjAwKSB7XHJcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uID0gZGVzY3JpcHRpb24uc3Vic3RyaW5nKDAsIDIwMCkgKyAn4oCmJztcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHRlbXBsYXRlID0gJyc7XHJcbiAgICAgICAgZnVuY3Rpb24gX3JlbmRlckNyZWF0aW9uKCkge1xyXG4gICAgICAgICAgICBsZXQgaHRtbCA9ICcnO1xyXG4gICAgICAgICAgICBpZiAoX3RoaXMuY3JlYXRpb24gfHwgX3RoaXMuY291bnRyeSB8fCBfdGhpcy5wcm9kdWN0aW9uX3llYXIpIHtcclxuICAgICAgICAgICAgICAgIGh0bWwgKz0gJzxwPic7XHJcbiAgICAgICAgICAgICAgICBpZiAoX3RoaXMuY3JlYXRpb24pIHtcclxuICAgICAgICAgICAgICAgICAgICBodG1sICs9IGA8dT5DcsOpYXRpb246PC91PiA8c3Ryb25nPiR7X3RoaXMuY3JlYXRpb259PC9zdHJvbmc+YDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChfdGhpcy5wcm9kdWN0aW9uX3llYXIpIHtcclxuICAgICAgICAgICAgICAgICAgICBodG1sICs9IGA8dT5Qcm9kdWN0aW9uOjwvdT4gPHN0cm9uZz4ke190aGlzLnByb2R1Y3Rpb25feWVhcn08L3N0cm9uZz5gO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKF90aGlzLmNvdW50cnkpIHtcclxuICAgICAgICAgICAgICAgICAgICBodG1sICs9IGAsIDx1PlBheXM6PC91PiA8c3Ryb25nPiR7X3RoaXMuY291bnRyeX08L3N0cm9uZz5gO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaHRtbCArPSAnPC9wPic7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGh0bWw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZ1bmN0aW9uIF9yZW5kZXJHZW5yZXMoKSB7XHJcbiAgICAgICAgICAgIGlmIChfdGhpcy5nZW5yZXMgJiYgX3RoaXMuZ2VucmVzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAnPHA+PHU+R2VucmVzOjwvdT4gJyArIF90aGlzLmdlbnJlcy5qb2luKCcsICcpICsgJzwvcD4nO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiAnJztcclxuICAgICAgICB9XHJcbiAgICAgICAgdGVtcGxhdGUgPSAnPGRpdj4nO1xyXG4gICAgICAgIGlmICh0aGlzLm1lZGlhVHlwZS5zaW5ndWxhciA9PT0gQmFzZV8xLk1lZGlhVHlwZS5zaG93KSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHN0YXR1cyA9IHRoaXMuc3RhdHVzLnRvTG93ZXJDYXNlKCkgPT0gJ2VuZGVkJyA/ICdUZXJtaW7DqWUnIDogJ0VuIGNvdXJzJztcclxuICAgICAgICAgICAgY29uc3Qgc2VlbiA9ICh0aGlzLnVzZXIuc3RhdHVzID4gMCkgPyAnVnUgw6AgPHN0cm9uZz4nICsgdGhpcy51c2VyLnN0YXR1cyArICclPC9zdHJvbmc+JyA6ICdQYXMgdnUnO1xyXG4gICAgICAgICAgICB0ZW1wbGF0ZSArPSBgPHA+PHN0cm9uZz4ke3RoaXMuc2Vhc29ucy5sZW5ndGh9PC9zdHJvbmc+IHNhaXNvbiR7KHRoaXMuc2Vhc29ucy5sZW5ndGggPiAxID8gJ3MnIDogJycpfSwgPHN0cm9uZz4ke3RoaXMubmJFcGlzb2Rlc308L3N0cm9uZz4gw6lwaXNvZGVzLCBgO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5vYmpOb3RlLnRvdGFsID4gMCkge1xyXG4gICAgICAgICAgICAgICAgdGVtcGxhdGUgKz0gYDxzdHJvbmc+JHt0aGlzLm9iak5vdGUudG90YWx9PC9zdHJvbmc+IHZvdGVzYDtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9iak5vdGUudXNlciA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZSArPSBgLCB2b3RyZSBub3RlOiAke3RoaXMub2JqTm90ZS51c2VyfWA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZSArPSAnPC9wPic7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZSArPSAnQXVjdW4gdm90ZTwvcD4nO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5pbl9hY2NvdW50KSB7XHJcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZSArPSAnPHA+PGEgaHJlZj1cImphdmFzY3JpcHQ6O1wiIGNsYXNzPVwiYWRkU2hvd1wiPkFqb3V0ZXI8L2E+PC9wPic7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGVtcGxhdGUgKz0gX3JlbmRlckdlbnJlcygpO1xyXG4gICAgICAgICAgICB0ZW1wbGF0ZSArPSBfcmVuZGVyQ3JlYXRpb24oKTtcclxuICAgICAgICAgICAgbGV0IGFyY2hpdmVkID0gJyc7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnVzZXIuc3RhdHVzID4gMCAmJiB0aGlzLnVzZXIuYXJjaGl2ZWQgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgICAgIGFyY2hpdmVkID0gJywgQXJjaGl2w6llOiA8aSBjbGFzcz1cImZhIGZhLWNoZWNrLWNpcmNsZS1vXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+PC9pPic7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAodGhpcy51c2VyLnN0YXR1cyA+IDApIHtcclxuICAgICAgICAgICAgICAgIGFyY2hpdmVkID0gJywgQXJjaGl2w6llOiA8aSBjbGFzcz1cImZhIGZhLWNpcmNsZS1vXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+PC9pPic7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHRoaXMuc2hvd3J1bm5lciAmJiB0aGlzLnNob3dydW5uZXIubmFtZS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZSArPSBgPHA+PHU+U2hvdyBSdW5uZXI6PC91PiA8c3Ryb25nPiR7dGhpcy5zaG93cnVubmVyLm5hbWV9PC9zdHJvbmc+PC9wPmA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGVtcGxhdGUgKz0gYDxwPjx1PlN0YXR1dDo8L3U+IDxzdHJvbmc+JHtzdGF0dXN9PC9zdHJvbmc+LCAke3NlZW59JHthcmNoaXZlZH08L3A+YDtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gbW92aWVcclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGVtcGxhdGUgKz0gJzxwPic7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm9iak5vdGUudG90YWwgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZSArPSBgPHN0cm9uZz4ke3RoaXMub2JqTm90ZS50b3RhbH08L3N0cm9uZz4gdm90ZXNgO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub2JqTm90ZS51c2VyID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlICs9IGAsIHZvdHJlIG5vdGU6ICR7dGhpcy5vYmpOb3RlLnVzZXJ9YDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRlbXBsYXRlICs9ICdBdWN1biB2b3RlJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0ZW1wbGF0ZSArPSAnPC9wPic7XHJcbiAgICAgICAgICAgIC8vIEFqb3V0ZXIgdW5lIGNhc2Ugw6AgY29jaGVyIHBvdXIgbCfDqXRhdCBcIlZ1XCJcclxuICAgICAgICAgICAgdGVtcGxhdGUgKz0gYDxwPjxsYWJlbCBmb3I9XCJzZWVuXCI+VnU8L2xhYmVsPlxyXG4gICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiBjbGFzcz1cIm1vdmllIG1vdmllU2VlblwiIG5hbWU9XCJzZWVuXCIgZGF0YS1tb3ZpZT1cIiR7dGhpcy5pZH1cIiAke3RoaXMudXNlci5zdGF0dXMgPT09IDEgPyAnY2hlY2tlZCcgOiAnJ30gc3R5bGU9XCJtYXJnaW4tcmlnaHQ6NXB4O1wiPjwvaW5wdXQ+YDtcclxuICAgICAgICAgICAgLy8gQWpvdXRlciB1bmUgY2FzZSDDoCBjb2NoZXIgcG91ciBsJ8OpdGF0IFwiQSB2b2lyXCJcclxuICAgICAgICAgICAgdGVtcGxhdGUgKz0gYDxsYWJlbCBmb3I9XCJtdXN0U2VlXCI+QSB2b2lyPC9sYWJlbD5cclxuICAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgY2xhc3M9XCJtb3ZpZSBtb3ZpZU11c3RTZWVcIiBuYW1lPVwibXVzdFNlZVwiIGRhdGEtbW92aWU9XCIke3RoaXMuaWR9XCIgJHt0aGlzLnVzZXIuc3RhdHVzID09PSAwID8gJ2NoZWNrZWQnIDogJyd9IHN0eWxlPVwibWFyZ2luLXJpZ2h0OjVweDtcIj48L2lucHV0PmA7XHJcbiAgICAgICAgICAgIC8vIEFqb3V0ZXIgdW5lIGNhc2Ugw6AgY29jaGVyIHBvdXIgbCfDqXRhdCBcIk5lIHBhcyB2b2lyXCJcclxuICAgICAgICAgICAgdGVtcGxhdGUgKz0gYDxsYWJlbCBmb3I9XCJub3RTZWVcIj5OZSBwYXMgdm9pcjwvbGFiZWw+XHJcbiAgICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJjaGVja2JveFwiIGNsYXNzPVwibW92aWUgbW92aWVOb3RTZWVcIiBuYW1lPVwibm90U2VlXCIgZGF0YS1tb3ZpZT1cIiR7dGhpcy5pZH1cIiAgJHt0aGlzLnVzZXIuc3RhdHVzID09PSAyID8gJ2NoZWNrZWQnIDogJyd9PjwvaW5wdXQ+PC9wPmA7XHJcbiAgICAgICAgICAgIHRlbXBsYXRlICs9IF9yZW5kZXJHZW5yZXMoKTtcclxuICAgICAgICAgICAgdGVtcGxhdGUgKz0gX3JlbmRlckNyZWF0aW9uKCk7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmRpcmVjdG9yKSB7XHJcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZSArPSBgPHA+PHU+UsOpYWxpc2F0ZXVyOjwvdT4gPHN0cm9uZz4ke3RoaXMuZGlyZWN0b3J9PC9zdHJvbmc+PC9wPmA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRlbXBsYXRlICsgYDxwPiR7ZGVzY3JpcHRpb259PC9wPjwvZGl2PmA7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFJldG91cm5lIGxlIGNvbnRlbnUgSFRNTCBkdSB0aXRyZSBkZSBsYSBwb3B1cFxyXG4gICAgICogQHJldHVybiB7c3RyaW5nfVxyXG4gICAgICovXHJcbiAgICBnZXRUaXRsZVBvcHVwKCkge1xyXG4gICAgICAgIGlmIChCYXNlXzEuQmFzZS5kZWJ1ZylcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ2dldFRpdGxlUG9wdXAnLCB0aGlzKTtcclxuICAgICAgICBsZXQgdGl0bGUgPSB0aGlzLnRpdGxlO1xyXG4gICAgICAgIGlmICh0aGlzLm9iak5vdGUudG90YWwgPiAwKSB7XHJcbiAgICAgICAgICAgIHRpdGxlICs9ICcgPHNwYW4gc3R5bGU9XCJmb250LXNpemU6IDAuOGVtO2NvbG9yOiMwMDA7XCI+JyArXHJcbiAgICAgICAgICAgICAgICB0aGlzLm9iak5vdGUubWVhbi50b0ZpeGVkKDIpICsgJyAvIDU8L3NwYW4+JztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRpdGxlO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBNZXQgw6Agam91ciBsJ2F0dHJpYnV0IHRpdGxlIGRlIGxhIG5vdGUgZHUgc2ltaWxhclxyXG4gICAgICogQHBhcmFtICB7Qm9vbGVhbn0gY2hhbmdlIEluZGlxdWUgc2kgaWwgZmF1dCBtb2RpZmllciBsJ2F0dHJpYnV0XHJcbiAgICAgKiBAcmV0dXJuIHtzdHJpbmd9ICAgICAgICAgTGEgdmFsZXVyIG1vZGlmacOpZSBkZSBsJ2F0dHJpYnV0IHRpdGxlXHJcbiAgICAgKi9cclxuICAgIHVwZGF0ZVRpdGxlTm90ZShjaGFuZ2UgPSB0cnVlKSB7XHJcbiAgICAgICAgY29uc3QgJGVsdCA9IHRoaXMuZWx0LmZpbmQoJy5zdGFycy1vdXRlcicpO1xyXG4gICAgICAgIGlmICh0aGlzLm9iak5vdGUubWVhbiA8PSAwIHx8IHRoaXMub2JqTm90ZS50b3RhbCA8PSAwKSB7XHJcbiAgICAgICAgICAgIGlmIChjaGFuZ2UpXHJcbiAgICAgICAgICAgICAgICAkZWx0LmF0dHIoJ3RpdGxlJywgJ0F1Y3VuIHZvdGUnKTtcclxuICAgICAgICAgICAgcmV0dXJuICcnO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCB0aXRsZSA9IHRoaXMub2JqTm90ZS50b1N0cmluZygpO1xyXG4gICAgICAgIGlmIChjaGFuZ2UpIHtcclxuICAgICAgICAgICAgJGVsdC5hdHRyKCd0aXRsZScsIHRpdGxlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRpdGxlO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBBam91dGUgbGEgbm90ZSwgc291cyBmb3JtZSBkJ8OpdG9pbGVzLCBkdSBzaW1pbGFyIHNvdXMgc29uIHRpdHJlXHJcbiAgICAgKiBAcmV0dXJuIHtTaW1pbGFyfVxyXG4gICAgICovXHJcbiAgICByZW5kZXJTdGFycygpIHtcclxuICAgICAgICAvLyBPbiBham91dGUgbGUgY29kZSBIVE1MIHBvdXIgbGUgcmVuZHUgZGUgbGEgbm90ZVxyXG4gICAgICAgIHRoaXMuZWx0LmZpbmQoJy5zbGlkZV9fdGl0bGUnKS5hZnRlcignPGRpdiBjbGFzcz1cInN0YXJzLW91dGVyXCI+PGRpdiBjbGFzcz1cInN0YXJzLWlubmVyXCI+PC9kaXY+PC9kaXY+Jyk7XHJcbiAgICAgICAgdGhpcy51cGRhdGVUaXRsZU5vdGUoKTtcclxuICAgICAgICB0aGlzLmVsdC5maW5kKCcuc3RhcnMtaW5uZXInKS53aWR0aCh0aGlzLm9iak5vdGUuZ2V0UGVyY2VudGFnZSgpICsgJyUnKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogVsOpcmlmaWUgbGEgcHLDqXNlbmNlIGRlIGwnaW1hZ2UgZHUgc2ltaWxhclxyXG4gICAgICogZXQgdGVudGUgZCdlbiB0cm91dmVyIHVuZSBzaSBjZWxsZS1jaSBuJ2VzdCBwYXMgcHLDqXNlbnRlXHJcbiAgICAgKiBAcmV0dXJuIHtTaW1pbGFyfVxyXG4gICAgICovXHJcbiAgICBjaGVja0ltZygpIHtcclxuICAgICAgICBjb25zdCAkaW1nID0gdGhpcy5lbHQuZmluZCgnaW1nLmpzLWxhenktaW1hZ2UnKSwgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgIGlmICgkaW1nLmxlbmd0aCA8PSAwKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm1lZGlhVHlwZS5zaW5ndWxhciA9PT0gQmFzZV8xLk1lZGlhVHlwZS5zaG93ICYmIHRoaXMudGhldHZkYl9pZCAmJiB0aGlzLnRoZXR2ZGJfaWQgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBPbiB0ZW50ZSBkZSByZW1wbGFjZXIgbGUgYmxvY2sgZGl2IDQwNCBwYXIgdW5lIGltYWdlXHJcbiAgICAgICAgICAgICAgICB0aGlzLmVsdC5maW5kKCdkaXYuYmxvY2s0MDQnKS5yZXBsYWNlV2l0aChgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxpbWcgY2xhc3M9XCJ1LW9wYWNpdHlCYWNrZ3JvdW5kIGZhZGUtaW5cIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoPVwiMTI1XCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ9XCIxODhcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFsdD1cIlBvc3RlciBkZSAke3RoaXMudGl0bGV9XCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcmM9XCJodHRwczovL2FydHdvcmtzLnRoZXR2ZGIuY29tL2Jhbm5lcnMvcG9zdGVycy8ke3RoaXMudGhldHZkYl9pZH0tMS5qcGdcIi8+YCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAodGhpcy5tZWRpYVR5cGUuc2luZ3VsYXIgPT09IEJhc2VfMS5NZWRpYVR5cGUubW92aWUgJiYgdGhpcy50bWRiX2lkICYmIHRoaXMudG1kYl9pZCA+IDApIHtcclxuICAgICAgICAgICAgICAgIGlmIChCYXNlXzEuQmFzZS50aGVtb3ZpZWRiX2FwaV91c2VyX2tleS5sZW5ndGggPD0gMClcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICBjb25zdCB1cmlBcGlUbWRiID0gYGh0dHBzOi8vYXBpLnRoZW1vdmllZGIub3JnLzMvbW92aWUvJHt0aGlzLnRtZGJfaWR9P2FwaV9rZXk9JHtCYXNlXzEuQmFzZS50aGVtb3ZpZWRiX2FwaV91c2VyX2tleX0mbGFuZ3VhZ2U9ZnItRlJgO1xyXG4gICAgICAgICAgICAgICAgZmV0Y2godXJpQXBpVG1kYikudGhlbihyZXNwb25zZSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFyZXNwb25zZS5vaylcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmpzb24oKTtcclxuICAgICAgICAgICAgICAgIH0pLnRoZW4oZGF0YSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRhdGEgIT09IG51bGwgJiYgZGF0YS5wb3N0ZXJfcGF0aCAhPT0gdW5kZWZpbmVkICYmIGRhdGEucG9zdGVyX3BhdGggIT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuZWx0LmZpbmQoJ2Rpdi5ibG9jazQwNCcpLnJlcGxhY2VXaXRoKGBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aW1nIGNsYXNzPVwidS1vcGFjaXR5QmFja2dyb3VuZCBmYWRlLWluXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoPVwiMTI1XCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodD1cIjE4OFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbHQ9XCJQb3N0ZXIgZGUgJHtfdGhpcy50aXRsZX1cIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3JjPVwiaHR0cHM6Ly9pbWFnZS50bWRiLm9yZy90L3Avb3JpZ2luYWwke2RhdGEucG9zdGVyX3BhdGh9XCIvPmApO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBBZGQgU2hvdyB0byBhY2NvdW50IG1lbWJlclxyXG4gICAgICogQHJldHVybiB7UHJvbWlzZTxTaW1pbGFyPn0gUHJvbWlzZSBvZiBzaG93XHJcbiAgICAgKi9cclxuICAgIGFkZFRvQWNjb3VudChzdGF0ZSA9IDApIHtcclxuICAgICAgICBjb25zdCBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgaWYgKHRoaXMuaW5fYWNjb3VudClcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4gcmVzb2x2ZShfdGhpcykpO1xyXG4gICAgICAgIGxldCBwYXJhbXMgPSB7IGlkOiB0aGlzLmlkIH07XHJcbiAgICAgICAgaWYgKHRoaXMubWVkaWFUeXBlLnNpbmd1bGFyID09PSBCYXNlXzEuTWVkaWFUeXBlLm1vdmllKSB7XHJcbiAgICAgICAgICAgIHBhcmFtcy5zdGF0ZSA9IHN0YXRlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICBCYXNlXzEuQmFzZS5jYWxsQXBpKCdQT1NUJywgX3RoaXMubWVkaWFUeXBlLnBsdXJhbCwgX3RoaXMubWVkaWFUeXBlLnNpbmd1bGFyLCBwYXJhbXMpXHJcbiAgICAgICAgICAgICAgICAudGhlbihkYXRhID0+IHtcclxuICAgICAgICAgICAgICAgIF90aGlzLmZpbGwoZGF0YVtfdGhpcy5tZWRpYVR5cGUuc2luZ3VsYXJdKS5zYXZlKCk7XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKF90aGlzKTtcclxuICAgICAgICAgICAgfSwgZXJyID0+IHtcclxuICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufVxyXG5leHBvcnRzLlNpbWlsYXIgPSBTaW1pbGFyO1xyXG4vLyB9XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbmV4cG9ydHMuU3VidGl0bGUgPSB2b2lkIDA7XHJcbi8vIG5hbWVzcGFjZSBCUyB7XHJcbmNsYXNzIFN1YnRpdGxlIHtcclxuICAgIGNvbnN0cnVjdG9yKGRhdGEpIHtcclxuICAgICAgICB0aGlzLmlkID0gcGFyc2VJbnQoZGF0YS5pZCwgMTApO1xyXG4gICAgICAgIHRoaXMubGFuZ3VhZ2UgPSBkYXRhLmxhbmd1YWdlO1xyXG4gICAgICAgIHRoaXMuc291cmNlID0gZGF0YS5zb3VyY2U7XHJcbiAgICAgICAgdGhpcy5xdWFsaXR5ID0gcGFyc2VJbnQoZGF0YS5xdWFsaXR5LCAxMCk7XHJcbiAgICAgICAgdGhpcy5maWxlID0gZGF0YS5maWxlO1xyXG4gICAgICAgIHRoaXMudXJsID0gZGF0YS51cmw7XHJcbiAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUoZGF0YS5kYXRlKTtcclxuICAgIH1cclxuICAgIGlkO1xyXG4gICAgbGFuZ3VhZ2U7XHJcbiAgICBzb3VyY2U7XHJcbiAgICBxdWFsaXR5O1xyXG4gICAgZmlsZTtcclxuICAgIHVybDtcclxuICAgIGRhdGU7XHJcbn1cclxuZXhwb3J0cy5TdWJ0aXRsZSA9IFN1YnRpdGxlO1xyXG4vLyB9XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbmV4cG9ydHMuVXBkYXRlQXV0byA9IHZvaWQgMDtcclxuY29uc3QgQmFzZV8xID0gcmVxdWlyZShcIi4vQmFzZVwiKTtcclxuY2xhc3MgVXBkYXRlQXV0byB7XHJcbiAgICBzdGF0aWMgaW5zdGFuY2U7XHJcbiAgICBzdGF0aWMgaW50ZXJ2YWxzID0gW1xyXG4gICAgICAgIHsgdmFsOiAwLCBsYWJlbDogJ0phbWFpcycgfSxcclxuICAgICAgICB7IHZhbDogMSwgbGFiZWw6ICcxIG1pbi4nIH0sXHJcbiAgICAgICAgeyB2YWw6IDUsIGxhYmVsOiAnNSBtaW4uJyB9LFxyXG4gICAgICAgIHsgdmFsOiAxMCwgbGFiZWw6ICcxMCBtaW4uJyB9LFxyXG4gICAgICAgIHsgdmFsOiAxNSwgbGFiZWw6ICcxNSBtaW4uJyB9LFxyXG4gICAgICAgIHsgdmFsOiAzMCwgbGFiZWw6ICczMCBtaW4uJyB9LFxyXG4gICAgICAgIHsgdmFsOiA0NSwgbGFiZWw6ICc0NSBtaW4uJyB9LFxyXG4gICAgICAgIHsgdmFsOiA2MCwgbGFiZWw6ICc2MCBtaW4uJyB9XHJcbiAgICBdO1xyXG4gICAgX3Nob3c7XHJcbiAgICBfc2hvd0lkO1xyXG4gICAgX2V4aXN0O1xyXG4gICAgX3N0YXR1cztcclxuICAgIF9hdXRvO1xyXG4gICAgX2ludGVydmFsO1xyXG4gICAgX3RpbWVyO1xyXG4gICAgY29uc3RydWN0b3Ioc2hvdykge1xyXG4gICAgICAgIHRoaXMuX3Nob3cgPSBzaG93O1xyXG4gICAgICAgIHRoaXMuX3Nob3dJZCA9IHNob3cuaWQ7XHJcbiAgICAgICAgbGV0IG9ialVwQXV0byA9IEdNX2dldFZhbHVlKCdvYmpVcEF1dG8nKTtcclxuICAgICAgICB0aGlzLl9leGlzdCA9IGZhbHNlO1xyXG4gICAgICAgIGlmIChvYmpVcEF1dG9bdGhpcy5fc2hvd0lkXSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2V4aXN0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5fc3RhdHVzID0gb2JqVXBBdXRvW3RoaXMuX3Nob3dJZF0uc3RhdHVzO1xyXG4gICAgICAgICAgICB0aGlzLl9hdXRvID0gb2JqVXBBdXRvW3RoaXMuX3Nob3dJZF0uYXV0bztcclxuICAgICAgICAgICAgdGhpcy5faW50ZXJ2YWwgPSBvYmpVcEF1dG9bdGhpcy5fc2hvd0lkXS5pbnRlcnZhbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3N0YXR1cyA9IGZhbHNlOyAvLyBTdGF0dXQgZGUgbGEgdMOiY2hlIGQndXBkYXRlXHJcbiAgICAgICAgICAgIHRoaXMuX2F1dG8gPSBmYWxzZTsgLy8gQXV0b3Jpc2UgbCdhY3RpdmF0aW9uIGRlIGxhIHTDomNoZSBkJ3VwZGF0ZSBkZXMgw6lwaXNvZGVzXHJcbiAgICAgICAgICAgIHRoaXMuX2ludGVydmFsID0gMDsgLy8gSW50ZXJ2YWxsZSBkZSB0ZW1wcyBlbnRyZSBsZXMgbWlzZXMgw6Agam91clxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmNoYW5nZUNvbG9yQnRuKCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgZ2V0SW5zdGFuY2Uocykge1xyXG4gICAgICAgIGlmICghVXBkYXRlQXV0by5pbnN0YW5jZSkge1xyXG4gICAgICAgICAgICBVcGRhdGVBdXRvLmluc3RhbmNlID0gbmV3IFVwZGF0ZUF1dG8ocyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBVcGRhdGVBdXRvLmluc3RhbmNlO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBfc2F2ZSAtIFNhdXZlZ2FyZGUgbGVzIG9wdGlvbnMgZGUgbGEgdMOiY2hlIGQndXBkYXRlXHJcbiAgICAgKiBhdXRvIGRhbnMgbCdlc3BhY2UgZGUgc3RvY2thZ2UgZGUgVGFtcGVybW9ua2V5XHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybiB7VXBkYXRlQXV0b30gTCdpbnN0YW5jZSB1bmlxdWUgVXBkYXRlQXV0b1xyXG4gICAgICovXHJcbiAgICBfc2F2ZSgpIHtcclxuICAgICAgICBsZXQgb2JqVXBBdXRvID0gR01fZ2V0VmFsdWUoJ29ialVwQXV0bycpO1xyXG4gICAgICAgIGxldCBvYmogPSB7XHJcbiAgICAgICAgICAgIHN0YXR1czogdGhpcy5fc3RhdHVzLFxyXG4gICAgICAgICAgICBhdXRvOiB0aGlzLl9hdXRvLFxyXG4gICAgICAgICAgICBpbnRlcnZhbDogdGhpcy5faW50ZXJ2YWxcclxuICAgICAgICB9O1xyXG4gICAgICAgIG9ialVwQXV0b1t0aGlzLl9zaG93SWRdID0gb2JqO1xyXG4gICAgICAgIEdNX3NldFZhbHVlKCdvYmpVcEF1dG8nLCBvYmpVcEF1dG8pO1xyXG4gICAgICAgIHRoaXMuX2V4aXN0ID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLmNoYW5nZUNvbG9yQnRuKCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIGdldCBzdGF0dXMgLSBSZXRvdXJuZSBsZSBzdGF0dXQgZGUgbGEgdMOiY2hlIGQndXBkYXRlIGF1dG9cclxuICAgICAqIGRlcyDDqXBpc29kZXNcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJuIHtib29sZWFufSAgTGUgc3RhdHV0XHJcbiAgICAgKi9cclxuICAgIGdldCBzdGF0dXMoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3N0YXR1cztcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogc2V0IHN0YXR1cyAtIE1vZGlmaWUgbGUgc3RhdHV0IGRlIGxhIHTDomNoZSBkJ3VwZGF0ZSBhdXRvXHJcbiAgICAgKiBkZXMgw6lwaXNvZGVzXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtICB7Ym9vbGVhbn0gc3RhdHVzIExlIHN0YXR1dCBkZSBsYSB0w6JjaGVcclxuICAgICAqL1xyXG4gICAgc2V0IHN0YXR1cyhzdGF0dXMpIHtcclxuICAgICAgICB0aGlzLl9zdGF0dXMgPSBzdGF0dXM7XHJcbiAgICAgICAgdGhpcy5fc2F2ZSgpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBnZXQgYXV0byAtIEZsYWcgaW5kaXF1YW50IGwnYXV0b3Jpc2F0aW9uIGRlIHBvdXZvaXIgbGFuY2VyXHJcbiAgICAgKiBsYSB0w6JjaGUgZCd1cGRhdGUgYXV0b1xyXG4gICAgICpcclxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59ICBGbGFnIGQnYXV0b3Jpc2F0aW9uXHJcbiAgICAgKi9cclxuICAgIGdldCBhdXRvKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9hdXRvO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBzZXQgYXV0byAtIE1vZGlmaWUgbCdhdXRvcmlzYXRpb24gZGUgbGFuY2VyIGxhIHTDomNoZVxyXG4gICAgICogZCd1cGRhdGUgYXV0b1xyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSAge2Jvb2xlYW59IGF1dG8gTGUgZmxhZ1xyXG4gICAgICovXHJcbiAgICBzZXQgYXV0byhhdXRvKSB7XHJcbiAgICAgICAgdGhpcy5fYXV0byA9IGF1dG87XHJcbiAgICAgICAgdGhpcy5fc2F2ZSgpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBnZXQgaW50ZXJ2YWwgLSBSZXRvdXJuZSBsJ2ludGVydmFsbGUgZGUgdGVtcHMgZW50cmVcclxuICAgICAqIGNoYXF1ZSB1cGRhdGUgYXV0b1xyXG4gICAgICpcclxuICAgICAqIEByZXR1cm4ge251bWJlcn0gIEwnaW50ZXJ2YWxsZSBkZSB0ZW1wcyBlbiBtaW51dGVzXHJcbiAgICAgKi9cclxuICAgIGdldCBpbnRlcnZhbCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5faW50ZXJ2YWw7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIHNldCBpbnRlcnZhbCAtIETDqWZpbml0IGwnaW50ZXJ2YWxsZSBkZSB0ZW1wcywgZW4gbWludXRlcyxcclxuICAgICAqIGVudHJlIGNoYXF1ZSB1cGRhdGUgYXV0b1xyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSAge251bWJlcn0gdmFsIEwnaW50ZXJ2YWxsZSBkZSB0ZW1wcyBlbiBtaW51dGVzXHJcbiAgICAgKi9cclxuICAgIHNldCBpbnRlcnZhbCh2YWwpIHtcclxuICAgICAgICB0aGlzLl9pbnRlcnZhbCA9IHZhbDtcclxuICAgICAgICB0aGlzLl9zYXZlKCk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIGNoYW5nZUNvbG9yQnRuIC0gTW9kaWZpZSBsYSBjb3VsZXVyIGR1IGJvdXRvbiBkJ3VwZGF0ZVxyXG4gICAgICogZGVzIMOpcGlzb2RlcyBzdXIgbGEgcGFnZSBXZWJcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJuIHtVcGRhdGVBdXRvfSBMJ2luc3RhbmNlIHVuaXF1ZSBVcGRhdGVBdXRvXHJcbiAgICAgKi9cclxuICAgIGNoYW5nZUNvbG9yQnRuKCkge1xyXG4gICAgICAgIGxldCBjb2xvciA9ICcjZmZmJztcclxuICAgICAgICBpZiAoIXRoaXMuX2V4aXN0KSB7XHJcbiAgICAgICAgICAgIGNvbG9yID0gJyM2Yzc1N2QnOyAvLyBncmV5XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHRoaXMuX3N0YXR1cyAmJiB0aGlzLl9hdXRvKSB7XHJcbiAgICAgICAgICAgIGNvbG9yID0gJ2dyZWVuJztcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAodGhpcy5fYXV0byAmJiAhdGhpcy5fc3RhdHVzKSB7XHJcbiAgICAgICAgICAgIGNvbG9yID0gJ29yYW5nZSc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKCF0aGlzLl9hdXRvICYmICF0aGlzLl9zdGF0dXMpIHtcclxuICAgICAgICAgICAgY29sb3IgPSAncmVkJztcclxuICAgICAgICB9XHJcbiAgICAgICAgJCgnLnVwZGF0ZUVwaXNvZGVzJykuY3NzKCdjb2xvcicsIGNvbG9yKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogc3RvcCAtIFBlcm1ldCBkZSBzdG9wcGVyIGxhIHTDomNoZSBkJ3VwZGF0ZSBhdXRvIGV0XHJcbiAgICAgKiBhdXNzaSBkZSBtb2RpZmllciBsZSBmbGFnIGV0IGwnaW50ZXJ2YWxsZSBlbiBmb25jdGlvblxyXG4gICAgICogZGUgbCfDqXRhdCBkZSBsYSBzw6lyaWVcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJuIHtVcGRhdGVBdXRvfSBMJ2luc3RhbmNlIHVuaXF1ZSBVcGRhdGVBdXRvXHJcbiAgICAgKi9cclxuICAgIHN0b3AoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX3Nob3cudXNlci5yZW1haW5pbmcgPD0gMCAmJiB0aGlzLl9zaG93LmlzRW5kZWQoKSkge1xyXG4gICAgICAgICAgICB0aGlzLl9hdXRvID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMuX2ludGVydmFsID0gMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAodGhpcy5fc2hvdy51c2VyLnJlbWFpbmluZyA8PSAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2F1dG8gPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zdGF0dXMgPSBmYWxzZTtcclxuICAgICAgICBjbGVhckludGVydmFsKHRoaXMuX3RpbWVyKTtcclxuICAgICAgICB0aGlzLl90aW1lciA9IG51bGw7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIGRlbGV0ZSAtIFN1cHByaW1lIGxlcyBvcHRpb25zIGQndXBkYXRlIGF1dG9cclxuICAgICAqIGRlIGxhIHPDqXJpZSBkZSBsJ2VzcGFjZSBkZSBzdG9ja2FnZVxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm4ge1VwZGF0ZUF1dG99IEwnaW5zdGFuY2UgdW5pcXVlIFVwZGF0ZUF1dG9cclxuICAgICAqL1xyXG4gICAgZGVsZXRlKCkge1xyXG4gICAgICAgIHRoaXMuc3RvcCgpO1xyXG4gICAgICAgIGxldCBvYmpVcEF1dG8gPSBHTV9nZXRWYWx1ZSgnb2JqVXBBdXRvJyk7XHJcbiAgICAgICAgaWYgKG9ialVwQXV0b1t0aGlzLl9zaG93SWRdICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgZGVsZXRlIG9ialVwQXV0b1t0aGlzLl9zaG93SWRdO1xyXG4gICAgICAgICAgICBHTV9zZXRWYWx1ZSgnb2JqVXBBdXRvJywgb2JqVXBBdXRvKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIGxhdW5jaCAtIFBlcm1ldCBkZSBsYW5jZXIgbGEgdMOiY2hlIGQndXBkYXRlIGF1dG9cclxuICAgICAqIGRlcyDDqXBpc29kZXNcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJuIHtVcGRhdGVBdXRvfSBMJ2luc3RhbmNlIHVuaXF1ZSBVcGRhdGVBdXRvXHJcbiAgICAgKi9cclxuICAgIGxhdW5jaCgpIHtcclxuICAgICAgICAvLyBTaSBsZXMgb3B0aW9ucyBzb250IG1vZGlmacOpZXMgcG91ciBhcnLDqnRlciBsYSB0w6JjaGVcclxuICAgICAgICAvLyBldCBxdWUgbGUgc3RhdHV0IGVzdCBlbiBjb3Vyc1xyXG4gICAgICAgIGlmICh0aGlzLl9zdGF0dXMgJiYgKCF0aGlzLl9hdXRvIHx8IHRoaXMuX2ludGVydmFsIDw9IDApKSB7XHJcbiAgICAgICAgICAgIGlmIChCYXNlXzEuQmFzZS5kZWJ1ZylcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdjbG9zZSBpbnRlcnZhbCB1cGRhdGVFcGlzb2RlTGlzdEF1dG8nKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3RvcCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBTaSBsZXMgb3B0aW9ucyBtb2RpZmnDqWVzIHBvdXIgbGFuY2VyXHJcbiAgICAgICAgZWxzZSBpZiAodGhpcy5fYXV0byAmJiB0aGlzLl9pbnRlcnZhbCA+IDApIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX3Nob3cudXNlci5yZW1haW5pbmcgPD0gMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zdG9wKCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnN0YXR1cyA9IHRydWU7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl90aW1lcikge1xyXG4gICAgICAgICAgICAgICAgaWYgKEJhc2VfMS5CYXNlLmRlYnVnKVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdjbG9zZSBvbGQgaW50ZXJ2YWwgdGltZXInKTtcclxuICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy5fdGltZXIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IF90aGlzID0gdGhpcztcclxuICAgICAgICAgICAgdGhpcy5fdGltZXIgPSBzZXRJbnRlcnZhbChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBpZiAoZGVidWcpIGNvbnNvbGUubG9nKCdVcGRhdGVBdXRvIHNldEludGVydmFsIG9ialNob3cnLCBPYmplY3QuYXNzaWduKHt9LCBfdGhpcy5fb2JqU2hvdykpO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFfdGhpcy5fYXV0byB8fCBfdGhpcy5fc2hvdy51c2VyLnJlbWFpbmluZyA8PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKEJhc2VfMS5CYXNlLmRlYnVnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQXJyw6p0IGRlIGxhIG1pc2Ugw6Agam91ciBhdXRvIGRlcyDDqXBpc29kZXMnKTtcclxuICAgICAgICAgICAgICAgICAgICBfdGhpcy5zdG9wKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKEJhc2VfMS5CYXNlLmRlYnVnKVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCd1cGRhdGUgZXBpc29kZSBsaXN0Jyk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBidG5VcEVwaXNvZGVMaXN0ID0gJCgnLnVwZGF0ZUVwaXNvZGVzJyk7XHJcbiAgICAgICAgICAgICAgICBpZiAoYnRuVXBFcGlzb2RlTGlzdC5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYnRuVXBFcGlzb2RlTGlzdC50cmlnZ2VyKCdjbGljaycpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghX3RoaXMuX3N0YXR1cykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5zdGF0dXMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSwgKHRoaXMuX2ludGVydmFsICogNjApICogMTAwMCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMuVXBkYXRlQXV0byA9IFVwZGF0ZUF1dG87XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbmV4cG9ydHMuVXNlciA9IHZvaWQgMDtcclxuLy8gbmFtZXNwYWNlIEJTIHtcclxuY2xhc3MgTmV4dCB7XHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhKSB7XHJcbiAgICAgICAgdGhpcy5pZCA9IHBhcnNlSW50KGRhdGEuaWQsIDEwKTtcclxuICAgICAgICB0aGlzLmNvZGUgPSBkYXRhLmNvZGU7XHJcbiAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUoZGF0YS5kYXRlKTtcclxuICAgICAgICB0aGlzLnRpdGxlID0gZGF0YS50aXRsZTtcclxuICAgICAgICB0aGlzLmltYWdlID0gZGF0YS5pbWFnZTtcclxuICAgIH1cclxuICAgIGlkO1xyXG4gICAgY29kZTtcclxuICAgIGRhdGU7XHJcbiAgICB0aXRsZTtcclxuICAgIGltYWdlO1xyXG59XHJcbmNsYXNzIFVzZXIge1xyXG4gICAgY29uc3RydWN0b3IoZGF0YSkge1xyXG4gICAgICAgIHRoaXMuYXJjaGl2ZWQgPSBkYXRhLmFyY2hpdmVkO1xyXG4gICAgICAgIHRoaXMuZG93bmxvYWRlZCA9IGRhdGEuZG93bmxvYWRlZDtcclxuICAgICAgICB0aGlzLmZhdm9yaXRlZCA9IGRhdGEuZmF2b3JpdGVkO1xyXG4gICAgICAgIHRoaXMuZnJpZW5kc193YW50X3RvX3dhdGNoID0gZGF0YS5mcmllbmRzX3dhbnRfdG9fd2F0Y2g7XHJcbiAgICAgICAgdGhpcy5mcmllbmRzX3dhdGNoZWQgPSBkYXRhLmZyaWVuZHNfd2F0Y2hlZDtcclxuICAgICAgICB0aGlzLmhpZGRlbiA9IGRhdGEuaGlkZGVuO1xyXG4gICAgICAgIHRoaXMubGFzdCA9IGRhdGEubGFzdDtcclxuICAgICAgICB0aGlzLm1haWwgPSBkYXRhLm1haWw7XHJcbiAgICAgICAgdGhpcy5uZXh0ID0gbmV3IE5leHQoZGF0YS5uZXh0KTtcclxuICAgICAgICB0aGlzLnByb2ZpbGUgPSBkYXRhLnByb2ZpbGU7XHJcbiAgICAgICAgdGhpcy5yZW1haW5pbmcgPSBkYXRhLnJlbWFpbmluZztcclxuICAgICAgICB0aGlzLnNlZW4gPSBkYXRhLnNlZW47XHJcbiAgICAgICAgdGhpcy5zdGF0dXMgPSBwYXJzZUludChkYXRhLnN0YXR1cywgMTApO1xyXG4gICAgICAgIHRoaXMudGFncyA9IGRhdGEudGFncztcclxuICAgICAgICB0aGlzLnR3aXR0ZXIgPSBkYXRhLnR3aXR0ZXI7XHJcbiAgICB9XHJcbiAgICBhcmNoaXZlZDtcclxuICAgIGRvd25sb2FkZWQ7XHJcbiAgICBmYXZvcml0ZWQ7XHJcbiAgICBmcmllbmRzX3dhbnRfdG9fd2F0Y2g7XHJcbiAgICBmcmllbmRzX3dhdGNoZWQ7XHJcbiAgICBoaWRkZW47XHJcbiAgICBsYXN0O1xyXG4gICAgbWFpbDtcclxuICAgIG5leHQ7XHJcbiAgICBwcm9maWxlO1xyXG4gICAgcmVtYWluaW5nO1xyXG4gICAgc2VlbjtcclxuICAgIHN0YXR1cztcclxuICAgIHRhZ3M7XHJcbiAgICB0d2l0dGVyO1xyXG59XHJcbmV4cG9ydHMuVXNlciA9IFVzZXI7XHJcbi8vIH1cclxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIlwidXNlIHN0cmljdFwiO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbmNvbnN0IEJhc2VfMSA9IHJlcXVpcmUoXCIuL0Jhc2VcIik7XHJcbmNvbnN0IENhY2hlXzEgPSByZXF1aXJlKFwiLi9DYWNoZVwiKTtcclxuY29uc3QgU2hvd18xID0gcmVxdWlyZShcIi4vU2hvd1wiKTtcclxuY29uc3QgTW92aWVfMSA9IHJlcXVpcmUoXCIuL01vdmllXCIpO1xyXG5jb25zdCBFcGlzb2RlXzEgPSByZXF1aXJlKFwiLi9FcGlzb2RlXCIpO1xyXG5jb25zdCBNZWRpYV8xID0gcmVxdWlyZShcIi4vTWVkaWFcIik7XHJcbmNvbnN0IFVwZGF0ZUF1dG9fMSA9IHJlcXVpcmUoXCIuL1VwZGF0ZUF1dG9cIik7XHJcbid1c2Ugc3RyaWN0JztcclxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cclxuLyogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUEFSQU1FVFJFUyBBIE1PRElGSUVSICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKi9cclxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cclxubGV0IGJldGFzZXJpZXNfYXBpX3VzZXJfdG9rZW4gPSAnJztcclxuLyogQWpvdXRlciBpY2kgdm90cmUgY2zDqSBkJ0FQSSBCZXRhU2VyaWVzIChEZW1hbmRlIGRlIGNsw6kgQVBJOiBodHRwczovL3d3dy5iZXRhc2VyaWVzLmNvbS9hcGkvKSAqL1xyXG5sZXQgYmV0YXNlcmllc19hcGlfdXNlcl9rZXkgPSAnJztcclxuLyogQWpvdXRlciBpY2kgdm90cmUgY2zDqSBkJ0FQSSBWMyDDoCB0aGVtb3ZpZWRiICovXHJcbmxldCB0aGVtb3ZpZWRiX2FwaV91c2VyX2tleSA9ICcnO1xyXG4vKiBBam91dGVyIGljaSBsJ1VSTCBkZSBiYXNlIGRlIHZvdHJlIHNlcnZldXIgZGlzdHJpYnVhbnQgbGVzIENTUywgSU1HIGV0IEpTICovXHJcbmNvbnN0IHNlcnZlckJhc2VVcmwgPSAnaHR0cHM6Ly9hemVtYS5naXRodWIuaW8vYmV0YXNlcmllcy1vYXV0aCc7XHJcbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXHJcbihmdW5jdGlvbiAoJCkge1xyXG4gICAgY29uc3QgZGVidWcgPSBmYWxzZSwgdXJsID0gbG9jYXRpb24ucGF0aG5hbWUsIG5vb3AgPSBmdW5jdGlvbiAoKSB7IH0sIHJlZ2V4VXNlciA9IG5ldyBSZWdFeHAoJ14vbWVtYnJlL1tBLVphLXowLTldKiQnKSwgXHJcbiAgICAvLyBPYmpldCBjb250ZW5hbnQgbGVzIHNjcmlwdHMgZXQgZmV1aWxsZXMgZGUgc3R5bGUgdXRpbGlzw6llcyBwYXIgbGUgdXNlcnNjcmlwdFxyXG4gICAgc2NyaXB0c0FuZFN0eWxlcyA9IHtcclxuICAgICAgICBcIm1vbWVudFwiOiB7XHJcbiAgICAgICAgICAgIHR5cGU6ICdzY3JpcHQnLFxyXG4gICAgICAgICAgICBpZDogJ2pzbW9tbWVudCcsXHJcbiAgICAgICAgICAgIHNyYzogJ2h0dHBzOi8vY2RuanMuY2xvdWRmbGFyZS5jb20vYWpheC9saWJzL21vbWVudC5qcy8yLjI5LjEvbW9tZW50Lm1pbi5qcycsXHJcbiAgICAgICAgICAgIGludGVncml0eTogJ3NoYTUxMi1xVFhSSU15WklGYjhpUWNmalhXQ084K001VGJjMzhRaTVXemRQT1laSElsWnB6QkhHM0wzYnk4NEJCQk9pUkdpRWI3S0t0QU9BczVxWWRVaVppUU5OUT09J1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCJsb2NhbGVmclwiOiB7XHJcbiAgICAgICAgICAgIHR5cGU6ICdzY3JpcHQnLFxyXG4gICAgICAgICAgICBpZDogJ2pzbG9jYWxlZnInLFxyXG4gICAgICAgICAgICBzcmM6ICdodHRwczovL2NkbmpzLmNsb3VkZmxhcmUuY29tL2FqYXgvbGlicy9tb21lbnQuanMvMi4yOS4xL2xvY2FsZS9mci5taW4uanMnLFxyXG4gICAgICAgICAgICBpbnRlZ3JpdHk6ICdzaGE1MTItUkF0MitQSVJ3Sml5aldwenZ2aEtBRzJMRWRQcFFoVGdXZmJFa0ZEQ284d0M0ckZZaDVHUXpKQlZJRkRzd3dhRURFWVgxNkdFRS80ZnBlRE5yN09JWnc9PSdcclxuICAgICAgICB9LFxyXG4gICAgICAgIFwicG9wb3ZlclwiOiB7XHJcbiAgICAgICAgICAgIHR5cGU6ICdzdHlsZScsXHJcbiAgICAgICAgICAgIGlkOiAnY3NzcG9wb3ZlcicsXHJcbiAgICAgICAgICAgIGhyZWY6IGAke3NlcnZlckJhc2VVcmx9L2Nzcy9wb3BvdmVyLm1pbi5jc3NgLFxyXG4gICAgICAgICAgICBpbnRlZ3JpdHk6ICdzaGEzODQtMCtXWWJ3anVNZEIrdGt3WFpqQzI0Q2puS2VnSTg3UEhOUmFpNEs2QVhJS1RncGV0WkNRSjlkTlZxSjVkVW5wZydcclxuICAgICAgICB9LFxyXG4gICAgICAgIFwiYm9vdHN0cmFwXCI6IHtcclxuICAgICAgICAgICAgdHlwZTogJ3NjcmlwdCcsXHJcbiAgICAgICAgICAgIGlkOiAnanNib290c3RyYXAnLFxyXG4gICAgICAgICAgICBzcmM6ICdodHRwczovL21heGNkbi5ib290c3RyYXBjZG4uY29tL2Jvb3RzdHJhcC80LjAuMC9qcy9ib290c3RyYXAubWluLmpzJyxcclxuICAgICAgICAgICAgaW50ZWdyaXR5OiAnc2hhMzg0LUpaUjZTcGVqaDRVMDJkOGpPdDZ2TEVIZmUvSlFHaVJSU1FReFNmRldwaTFNcXVWZEF5alVhcjUrNzZQVkNtWWwnXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcInRhYmxlY3NzXCI6IHtcclxuICAgICAgICAgICAgdHlwZTogJ3N0eWxlJyxcclxuICAgICAgICAgICAgaWQ6ICd0YWJsZWNzcycsXHJcbiAgICAgICAgICAgIGhyZWY6IGAke3NlcnZlckJhc2VVcmx9L2Nzcy90YWJsZS5taW4uY3NzYCxcclxuICAgICAgICAgICAgaW50ZWdyaXR5OiAnc2hhMzg0LTgzeDlraXg3UTRGOGw0RlF3R2ZkYm50RnlqbVp1M0YxZkI4SUFmV2RINGNORmlYWXFBVnJWQXJuaWwwcmtjMXAnXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcInN0eWxlaG9tZVwiOiB7XHJcbiAgICAgICAgICAgIHR5cGU6ICdzdHlsZScsXHJcbiAgICAgICAgICAgIGlkOiAnc3R5bGVob21lJyxcclxuICAgICAgICAgICAgaHJlZjogYCR7c2VydmVyQmFzZVVybH0vY3NzL3N0eWxlLm1pbi5jc3NgLFxyXG4gICAgICAgICAgICBpbnRlZ3JpdHk6ICdzaGEzODQtejRhYW0yOXhrT0ttZ3BPVUdoazlrUzgvU3V0a1FlVXRFQkJYbTJOWWlaRmMyQ0pTdkg1aG90aHplK1AwL2R6OCdcclxuICAgICAgICB9LFxyXG4gICAgICAgIFwiYXdlc29tZVwiOiB7XHJcbiAgICAgICAgICAgIHR5cGU6ICdzdHlsZScsXHJcbiAgICAgICAgICAgIGlkOiAnYXdlc29tZScsXHJcbiAgICAgICAgICAgIGhyZWY6ICdodHRwczovL2NkbmpzLmNsb3VkZmxhcmUuY29tL2FqYXgvbGlicy9mb250LWF3ZXNvbWUvNC43LjAvY3NzL2ZvbnQtYXdlc29tZS5taW4uY3NzJyxcclxuICAgICAgICAgICAgaW50ZWdyaXR5OiAnc2hhNTEyLVNmVGlUbFg2a2srcWl0ZmV2bC83TGliVU9lSldsdDlyYnlEbjkyYTFEcVdPdzl2V0cyTUZvYXlzMHNnT2JtV2F6TzVCUVBpRnVjbm5FQWpwQUIrL1N3PT0nXHJcbiAgICAgICAgfVxyXG4gICAgfSwgXHJcbiAgICAvLyBVUkkgZGVzIGltYWdlcyBldCBkZXNjcmlwdGlvbiBkZXMgY2xhc3NpZmljYXRpb25zIFRWIGV0IGZpbG1zXHJcbiAgICByYXRpbmdzID0ge1xyXG4gICAgICAgICdELTEwJzoge1xyXG4gICAgICAgICAgICBpbWc6ICdodHRwczovL3VwbG9hZC53aWtpbWVkaWEub3JnL3dpa2lwZWRpYS9jb21tb25zL3RodW1iL2IvYmYvTW9pbnMxMC5zdmcvMzBweC1Nb2luczEwLnN2Zy5wbmcnLFxyXG4gICAgICAgICAgICB0aXRsZTogXCJEw6ljb25zZWlsbMOpIGF1IG1vaW5zIGRlIDEwIGFuc1wiXHJcbiAgICAgICAgfSxcclxuICAgICAgICAnRC0xMic6IHtcclxuICAgICAgICAgICAgaW1nOiAnaHR0cHM6Ly91cGxvYWQud2lraW1lZGlhLm9yZy93aWtpcGVkaWEvY29tbW9ucy90aHVtYi9iL2I1L01vaW5zMTIuc3ZnLzMwcHgtTW9pbnMxMi5zdmcucG5nJyxcclxuICAgICAgICAgICAgdGl0bGU6ICdEw6ljb25zZWlsbMOpIGF1IG1vaW5zIGRlIDEyIGFucydcclxuICAgICAgICB9LFxyXG4gICAgICAgICdELTE2Jzoge1xyXG4gICAgICAgICAgICBpbWc6ICdodHRwczovL3VwbG9hZC53aWtpbWVkaWEub3JnL3dpa2lwZWRpYS9jb21tb25zL3RodW1iLzIvMjkvTW9pbnMxNi5zdmcvMzBweC1Nb2luczE2LnN2Zy5wbmcnLFxyXG4gICAgICAgICAgICB0aXRsZTogJ0TDqWNvbnNlaWxsw6kgYXUgbW9pbnMgZGUgMTYgYW5zJ1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgJ0QtMTgnOiB7XHJcbiAgICAgICAgICAgIGltZzogJ2h0dHBzOi8vdXBsb2FkLndpa2ltZWRpYS5vcmcvd2lraXBlZGlhL2NvbW1vbnMvdGh1bWIvMi8yZC9Nb2luczE4LnN2Zy8zMHB4LU1vaW5zMTguc3ZnLnBuZycsXHJcbiAgICAgICAgICAgIHRpdGxlOiAnQ2UgcHJvZ3JhbW1lIGVzdCB1bmlxdWVtZW50IHLDqXNlcnbDqSBhdXggYWR1bHRlcydcclxuICAgICAgICB9LFxyXG4gICAgICAgICdUVi1ZJzoge1xyXG4gICAgICAgICAgICBpbWc6ICdodHRwczovL3VwbG9hZC53aWtpbWVkaWEub3JnL3dpa2lwZWRpYS9jb21tb25zL3RodW1iLzIvMjUvVFYtWV9pY29uLnN2Zy81MHB4LVRWLVlfaWNvbi5zdmcucG5nJyxcclxuICAgICAgICAgICAgdGl0bGU6ICdDZSBwcm9ncmFtbWUgZXN0IMOpdmFsdcOpIGNvbW1lIMOpdGFudCBhcHByb3ByacOpIGF1eCBlbmZhbnRzJ1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgJ1RWLVk3Jzoge1xyXG4gICAgICAgICAgICBpbWc6ICdodHRwczovL3VwbG9hZC53aWtpbWVkaWEub3JnL3dpa2lwZWRpYS9jb21tb25zL3RodW1iLzUvNWEvVFYtWTdfaWNvbi5zdmcvNTBweC1UVi1ZN19pY29uLnN2Zy5wbmcnLFxyXG4gICAgICAgICAgICB0aXRsZTogJ0NlIHByb2dyYW1tZSBlc3QgZMOpc2lnbsOpIHBvdXIgbGVzIGVuZmFudHMgw6Jnw6lzIGRlIDcgYW5zIGV0IHBsdXMnXHJcbiAgICAgICAgfSxcclxuICAgICAgICAnVFYtRyc6IHtcclxuICAgICAgICAgICAgaW1nOiAnaHR0cHM6Ly91cGxvYWQud2lraW1lZGlhLm9yZy93aWtpcGVkaWEvY29tbW9ucy90aHVtYi81LzVlL1RWLUdfaWNvbi5zdmcvNTBweC1UVi1HX2ljb24uc3ZnLnBuZycsXHJcbiAgICAgICAgICAgIHRpdGxlOiAnTGEgcGx1cGFydCBkZXMgcGFyZW50cyBwZXV2ZW50IGNvbnNpZMOpcmVyIGNlIHByb2dyYW1tZSBjb21tZSBhcHByb3ByacOpIHBvdXIgbGVzIGVuZmFudHMnXHJcbiAgICAgICAgfSxcclxuICAgICAgICAnVFYtUEcnOiB7XHJcbiAgICAgICAgICAgIGltZzogJ2h0dHBzOi8vdXBsb2FkLndpa2ltZWRpYS5vcmcvd2lraXBlZGlhL2NvbW1vbnMvdGh1bWIvOS85YS9UVi1QR19pY29uLnN2Zy81MHB4LVRWLVBHX2ljb24uc3ZnLnBuZycsXHJcbiAgICAgICAgICAgIHRpdGxlOiAnQ2UgcHJvZ3JhbW1lIGNvbnRpZW50IGRlcyDDqWzDqW1lbnRzIHF1ZSBsZXMgcGFyZW50cyBwZXV2ZW50IGNvbnNpZMOpcmVyIGluYXBwcm9wcmnDqXMgcG91ciBsZXMgZW5mYW50cydcclxuICAgICAgICB9LFxyXG4gICAgICAgICdUVi0xNCc6IHtcclxuICAgICAgICAgICAgaW1nOiAnaHR0cHM6Ly91cGxvYWQud2lraW1lZGlhLm9yZy93aWtpcGVkaWEvY29tbW9ucy90aHVtYi9jL2MzL1RWLTE0X2ljb24uc3ZnLzUwcHgtVFYtMTRfaWNvbi5zdmcucG5nJyxcclxuICAgICAgICAgICAgdGl0bGU6ICdDZSBwcm9ncmFtbWUgZXN0IGTDqWNvbnNlaWxsw6kgYXV4IGVuZmFudHMgZGUgbW9pbnMgZGUgMTQgYW5zJ1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgJ1RWLU1BJzoge1xyXG4gICAgICAgICAgICBpbWc6ICdodHRwczovL3VwbG9hZC53aWtpbWVkaWEub3JnL3dpa2lwZWRpYS9jb21tb25zL3RodW1iLzMvMzQvVFYtTUFfaWNvbi5zdmcvNTBweC1UVi1NQV9pY29uLnN2Zy5wbmcnLFxyXG4gICAgICAgICAgICB0aXRsZTogJ0NlIHByb2dyYW1tZSBlc3QgdW5pcXVlbWVudCByw6lzZXJ2w6kgYXV4IGFkdWx0ZXMnXHJcbiAgICAgICAgfSxcclxuICAgICAgICAnRyc6IHtcclxuICAgICAgICAgICAgaW1nOiAnaHR0cHM6Ly91cGxvYWQud2lraW1lZGlhLm9yZy93aWtpcGVkaWEvY29tbW9ucy90aHVtYi8wLzA1L1JBVEVEX0cuc3ZnLzMwcHgtUkFURURfRy5zdmcucG5nJyxcclxuICAgICAgICAgICAgdGl0bGU6ICdUb3VzIHB1YmxpY3MnXHJcbiAgICAgICAgfSxcclxuICAgICAgICAnUEcnOiB7XHJcbiAgICAgICAgICAgIGltZzogJ2h0dHBzOi8vdXBsb2FkLndpa2ltZWRpYS5vcmcvd2lraXBlZGlhL2NvbW1vbnMvdGh1bWIvYi9iYy9SQVRFRF9QRy5zdmcvNTRweC1SQVRFRF9QRy5zdmcucG5nJyxcclxuICAgICAgICAgICAgdGl0bGU6ICdBY2NvcmQgcGFyZW50YWwgc291aGFpdGFibGUnXHJcbiAgICAgICAgfSxcclxuICAgICAgICAnUEctMTMnOiB7XHJcbiAgICAgICAgICAgIGltZzogJ2h0dHBzOi8vdXBsb2FkLndpa2ltZWRpYS5vcmcvd2lraXBlZGlhL2NvbW1vbnMvdGh1bWIvYy9jMC9SQVRFRF9QRy0xMy5zdmcvOTVweC1SQVRFRF9QRy0xMy5zdmcucG5nJyxcclxuICAgICAgICAgICAgdGl0bGU6ICdBY2NvcmQgcGFyZW50YWwgcmVjb21tYW5kw6ksIGZpbG0gZMOpY29uc2VpbGzDqSBhdXggbW9pbnMgZGUgMTMgYW5zJ1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgJ1InOiB7XHJcbiAgICAgICAgICAgIGltZzogJ2h0dHBzOi8vdXBsb2FkLndpa2ltZWRpYS5vcmcvd2lraXBlZGlhL2NvbW1vbnMvdGh1bWIvNy83ZS9SQVRFRF9SLnN2Zy80MHB4LVJBVEVEX1Iuc3ZnLnBuZycsXHJcbiAgICAgICAgICAgIHRpdGxlOiAnTGVzIGVuZmFudHMgZGUgbW9pbnMgZGUgMTcgYW5zIGRvaXZlbnQgw6p0cmUgYWNjb21wYWduw6lzIGRcXCd1biBhZHVsdGUnXHJcbiAgICAgICAgfSxcclxuICAgICAgICAnTkMtMTcnOiB7XHJcbiAgICAgICAgICAgIGltZzogJ2h0dHBzOi8vdXBsb2FkLndpa2ltZWRpYS5vcmcvd2lraXBlZGlhL2NvbW1vbnMvdGh1bWIvNS81MC9OYy0xNy5zdmcvODVweC1OYy0xNy5zdmcucG5nJyxcclxuICAgICAgICAgICAgdGl0bGU6ICdJbnRlcmRpdCBhdXggZW5mYW50cyBkZSAxNyBhbnMgZXQgbW9pbnMnXHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIGxldCB0aW1lciwgdGltZXJVQSwgY3VycmVudFVzZXIsIGNhY2hlLCBkaWFsb2csIGZuTGF6eTtcclxuICAgIC8qIEluaXRpYWxpemUgdGhlIGNhY2hlICovXHJcbiAgICBjYWNoZSA9IG5ldyBDYWNoZV8xLkNhY2hlVVMoKTtcclxuICAgIC8qKlxyXG4gICAgICogUGFyYW3DqXRyYWdlIGRlIGxhIHN1cGVyIGNsYXNzZSBhYnN0cmFpdGUgQmFzZVxyXG4gICAgICovXHJcbiAgICBCYXNlXzEuQmFzZS5kZWJ1ZyA9IGRlYnVnO1xyXG4gICAgQmFzZV8xLkJhc2UuY2FjaGUgPSBjYWNoZTtcclxuICAgIEJhc2VfMS5CYXNlLm5vdGlmaWNhdGlvbiA9IG5vdGlmaWNhdGlvbjtcclxuICAgIEJhc2VfMS5CYXNlLnVzZXJJZGVudGlmaWVkID0gdXNlcklkZW50aWZpZWQ7XHJcbiAgICBCYXNlXzEuQmFzZS50b2tlbiA9IGJldGFzZXJpZXNfYXBpX3VzZXJfdG9rZW47XHJcbiAgICBCYXNlXzEuQmFzZS51c2VyS2V5ID0gYmV0YXNlcmllc19hcGlfdXNlcl9rZXk7XHJcbiAgICBCYXNlXzEuQmFzZS51c2VySWQgPSBiZXRhc2VyaWVzX3VzZXJfaWQ7XHJcbiAgICBCYXNlXzEuQmFzZS50cmFucyA9IHRyYW5zO1xyXG4gICAgQmFzZV8xLkJhc2UucmF0aW5ncyA9IHJhdGluZ3M7XHJcbiAgICBCYXNlXzEuQmFzZS50aGVtb3ZpZWRiX2FwaV91c2VyX2tleSA9IHRoZW1vdmllZGJfYXBpX3VzZXJfa2V5O1xyXG4gICAgQmFzZV8xLkJhc2Uuc2VydmVyQmFzZVVybCA9IHNlcnZlckJhc2VVcmw7XHJcbiAgICAvLyBPbiBhZmZpY2hlIGxhIHZlcnNpb24gZHUgc2NyaXB0XHJcbiAgICBpZiAoZGVidWcpXHJcbiAgICAgICAgY29uc29sZS5sb2coJ1VzZXJTY3JpcHQgQmV0YVNlcmllcyB2JXMnLCBHTV9pbmZvLnNjcmlwdC52ZXJzaW9uKTtcclxuICAgIC8vIEFqb3V0IGRlcyBmZXVpbGxlcyBkZSBzdHlsZXMgcG91ciBsZSB1c2Vyc2NyaXB0XHJcbiAgICBhZGRTY3JpcHRBbmRMaW5rKFsnYXdlc29tZScsICdzdHlsZWhvbWUnXSk7XHJcbiAgICBpZiAodHlwZW9mIGxhenlMb2FkID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgIGxldCBub3RMb29wID0gMDtcclxuICAgICAgICBsZXQgdGltZXJMYXp5ID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAvLyBQb3VyIGV2aXRlciB1bmUgYm91Y2xlIGluZmluaWVcclxuICAgICAgICAgICAgaWYgKCsrbm90TG9vcCA+PSAyMCkge1xyXG4gICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCh0aW1lckxhenkpO1xyXG4gICAgICAgICAgICAgICAgLy8gQ2EgbmUgZmVyYSBwYXMgbGUgam9iLCBtYWlzIMOnYSBuZSBkw6ljbGVuY2hlcmEgcGFzIGQnZXJyZXVyXHJcbiAgICAgICAgICAgICAgICBmbkxhenkgPSB7IGluaXQ6IGZ1bmN0aW9uICgpIHsgY29uc29sZS53YXJuKCdmYWtlIGxhenlMb2FkJyk7IH0gfTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGxhenlMb2FkICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICAgICAgZm5MYXp5ID0gbmV3IGxhenlMb2FkKHt9KTtcclxuICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodGltZXJMYXp5KTtcclxuICAgICAgICAgICAgICAgIHRpbWVyTGF6eSA9IG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LCA1MDApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgZm5MYXp5ID0gbmV3IGxhenlMb2FkKHt9KTtcclxuICAgIH1cclxuICAgIGNoZWNrQXBpVmVyc2lvbigpO1xyXG4gICAgLy8gRm9uY3Rpb25zIGFwcGVsZXIgcG91ciBsZXMgcGFnZXMgZGVzIHNlcmllcywgZGVzIGZpbG1zIGV0IGRlcyBlcGlzb2Rlc1xyXG4gICAgaWYgKC9eXFwvKHNlcmllfGZpbG18ZXBpc29kZSlcXC8uKi8udGVzdCh1cmwpKSB7XHJcbiAgICAgICAgLy8gT24gcsOpY3Vww6hyZSBkJ2Fib3JkIGxhIHJlc3NvdXJjZSBjb3VyYW50ZSBwb3VyIGluc3RhbmNpZXIgdW4gb2JqZXQgTWVkaWFcclxuICAgICAgICBnZXRSZXNvdXJjZSh0cnVlKS50aGVuKChvYmpSZXMpID0+IHtcclxuICAgICAgICAgICAgaWYgKGRlYnVnKVxyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ29iamV0IHJlc291cmNlIE1lZGlhKCVzKScsIG9ialJlcy5jb25zdHJ1Y3Rvci5uYW1lLCBvYmpSZXMpO1xyXG4gICAgICAgICAgICBpZiAoZGVidWcpXHJcbiAgICAgICAgICAgICAgICBhZGRCdG5EZXYoKTsgLy8gT24gYWpvdXRlIGxlIGJvdXRvbiBkZSBEZXZcclxuICAgICAgICAgICAgcmVtb3ZlQWRzKCk7IC8vIE9uIHJldGlyZSBsZXMgcHVic1xyXG4gICAgICAgICAgICBzaW1pbGFyc1ZpZXdlZChvYmpSZXMpOyAvLyBPbiBzJ29jY3VwZSBkZXMgcmVzc291cmNlcyBzaW1pbGFpcmVzXHJcbiAgICAgICAgICAgIG9ialJlcy5kZWNvZGVUaXRsZSgpOyAvLyBPbiBkw6ljb2RlIGxlIHRpdHJlIGRlIGxhIHJlc3NvdXJjZVxyXG4gICAgICAgICAgICBvYmpSZXMuYWRkTnVtYmVyVm90ZXJzKCk7IC8vIE9uIGFqb3V0ZSBsZSBub21icmUgZGUgdm90ZXMgw6AgbGEgbm90ZVxyXG4gICAgICAgICAgICB1cGdyYWRlU3lub3BzaXMoKTsgLy8gT24gYW3DqWxpb3JlIGxlIGZvbmN0aW9ubmVtZW50IGRlIGwnYWZmaWNoYWdlIGR1IHN5bm9wc2lzXHJcbiAgICAgICAgICAgIGlmICgvXlxcL3NlcmllXFwvLy50ZXN0KHVybCkpIHtcclxuICAgICAgICAgICAgICAgIG9ialJlcy5hZGRSYXRpbmcoKTsgLy8gT24gYWpvdXRlIGxhIGNsYXNzaWZpY2F0aW9uIFRWIGRlIGxhIHJlc3NvdXJjZSBjb3VyYW50ZVxyXG4gICAgICAgICAgICAgICAgLy8gT24gYWpvdXRlIGxhIGdlc3Rpb24gZGVzIMOpcGlzb2Rlc1xyXG4gICAgICAgICAgICAgICAgd2FpdFNlYXNvbnNBbmRFcGlzb2Rlc0xvYWRlZCgoKSA9PiB1cGdyYWRlRXBpc29kZXMob2JqUmVzKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIC8vIEZvbmN0aW9ucyBhcHBlbGVyIHBvdXIgbGEgcGFnZSBkZSBnZXN0aW9uIGRlcyBzZXJpZXNcclxuICAgIGVsc2UgaWYgKC9eXFwvbWVtYnJlXFwvLipcXC9zZXJpZXMkLy50ZXN0KHVybCkpIHtcclxuICAgICAgICBhZGRTdGF0dXNUb0dlc3Rpb25TZXJpZXMoKTtcclxuICAgIH1cclxuICAgIC8vIEZvbmN0aW9ucyBhcHBlbGVyIHN1ciBsYSBwYWdlIGRlcyBtZW1icmVzXHJcbiAgICBlbHNlIGlmICgocmVnZXhVc2VyLnRlc3QodXJsKSB8fCAvXlxcL21lbWJyZVxcL1tBLVphLXowLTldKlxcL2FtaXMkLy50ZXN0KHVybCkpICYmIHVzZXJJZGVudGlmaWVkKCkpIHtcclxuICAgICAgICBpZiAocmVnZXhVc2VyLnRlc3QodXJsKSkge1xyXG4gICAgICAgICAgICAvLyBPbiByw6ljdXDDqHJlIGxlcyBpbmZvcyBkdSBtZW1icmUgY29ubmVjdMOpXHJcbiAgICAgICAgICAgIGdldE1lbWJlcigpXHJcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAobWVtYmVyKSB7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50VXNlciA9IG1lbWJlcjtcclxuICAgICAgICAgICAgICAgIGxldCBsb2dpbiA9IHVybC5zcGxpdCgnLycpWzJdO1xyXG4gICAgICAgICAgICAgICAgLy8gT24gYWpvdXRlIGxhIGZvbmN0aW9uIGRlIGNvbXBhcmFpc29uIGRlcyBtZW1icmVzXHJcbiAgICAgICAgICAgICAgICBpZiAoY3VycmVudFVzZXIgJiYgbG9naW4gIT0gY3VycmVudFVzZXIubG9naW4pIHtcclxuICAgICAgICAgICAgICAgICAgICBjb21wYXJlTWVtYmVycygpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHNlYXJjaEZyaWVuZHMoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvLyBGb25jdGlvbnMgYXBwZWxlciBzdXIgbGVzIHBhZ2VzIGRlcyBtw6l0aG9kZXMgZGUgbCdBUElcclxuICAgIGVsc2UgaWYgKC9eXFwvYXBpLy50ZXN0KHVybCkpIHtcclxuICAgICAgICBpZiAoL1xcL21ldGhvZGVzLy50ZXN0KHVybCkpIHtcclxuICAgICAgICAgICAgc29tbWFpcmVEZXZBcGkoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoL1xcL2NvbnNvbGUvLnRlc3QodXJsKSkge1xyXG4gICAgICAgICAgICB1cGRhdGVBcGlDb25zb2xlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLy8gRm9uY3Rpb25zIGFwcGVsZXIgc3VyIGxlcyBwYWdlcyBkZXMgc8Opcmllc1xyXG4gICAgZWxzZSBpZiAoL15cXC9zZXJpZXNcXC8vLnRlc3QodXJsKSkge1xyXG4gICAgICAgIGlmIChkZWJ1ZylcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ1BhZ2UgZGVzIHPDqXJpZXMnKTtcclxuICAgICAgICB3YWl0UGFnaW5hdGlvbigpO1xyXG4gICAgICAgIHNlcmllc0ZpbHRlclBheXMoKTtcclxuICAgICAgICBpZiAoL2FnZW5kYS8udGVzdCh1cmwpKSB7XHJcbiAgICAgICAgICAgIGxldCBjb3VudFRpbWVyID0gMDtcclxuICAgICAgICAgICAgdGltZXJVQSA9IHNldEludGVydmFsKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGlmICgrK2NvdW50VGltZXIgPiA1MCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodGltZXJVQSk7XHJcbiAgICAgICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uKCdFcnJldXIgVXBkYXRlIEFnZW5kYScsICdMZSB0aW1lciBkZSBjaGFyZ2VtZW50IGEgZMOpcGFzc8OpIGxlIHRlbXBzIG1heCBhdXRvcmlzw6kuJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdXBkYXRlQWdlbmRhKCk7XHJcbiAgICAgICAgICAgIH0sIDEwMDApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8vIE9uIG9ic2VydmUgbCdlc3BhY2UgbGnDqSDDoCBsYSByZWNoZXJjaGUgZGUgc8OpcmllcyBvdSBkZSBmaWxtcywgZW4gaGF1dCBkZSBwYWdlLlxyXG4gICAgLy8gQWZpbiBkZSBtb2RpZmllciBxdWVscXVlIHBldSBsZSByw6lzdWx0YXQsIHBvdXIgcG91dm9pciBsaXJlIGwnaW50w6lncmFsaXTDqSBkdSB0aXRyZVxyXG4gICAgY29uc3Qgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihtdXRhdGlvbnNMaXN0ID0+IHtcclxuICAgICAgICBsZXQgdXBkYXRlVGl0bGUgPSAoaSwgZSkgPT4geyBpZiAoaXNUcnVuY2F0ZWQoZSkpIHtcclxuICAgICAgICAgICAgJChlKS5wYXJlbnRzKCdhJykuYXR0cigndGl0bGUnLCAkKGUpLnRleHQoKSk7XHJcbiAgICAgICAgfSB9O1xyXG4gICAgICAgIGZvciAobGV0IG11dGF0aW9uIG9mIG11dGF0aW9uc0xpc3QpIHtcclxuICAgICAgICAgICAgaWYgKG11dGF0aW9uLnR5cGUgPT0gJ2NoaWxkTGlzdCcgJiYgbXV0YXRpb24uYWRkZWROb2Rlcy5sZW5ndGggPT09IDEpIHtcclxuICAgICAgICAgICAgICAgIGxldCBub2RlID0gbXV0YXRpb24uYWRkZWROb2Rlc1swXSwgJG5vZGUgPSAkKG5vZGUpO1xyXG4gICAgICAgICAgICAgICAgaWYgKCRub2RlLmhhc0NsYXNzKCdjb2wtbWQtNCcpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJCgnLm1haW5MaW5rJywgJG5vZGUpLmVhY2godXBkYXRlVGl0bGUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoJG5vZGUuaGFzQ2xhc3MoJ2pzLXNlYXJjaFJlc3VsdCcpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHRpdGxlID0gJCgnLm1haW5MaW5rJywgJG5vZGUpLmdldCgwKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaXNUcnVuY2F0ZWQodGl0bGUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRub2RlLmF0dHIoJ3RpdGxlJywgJCh0aXRsZSkudGV4dCgpKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuICAgIG9ic2VydmVyLm9ic2VydmUoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlYWN0anMtaGVhZGVyLXNlYXJjaCcpLCB7IGNoaWxkTGlzdDogdHJ1ZSwgc3VidHJlZTogdHJ1ZSB9KTtcclxuICAgIC8qKlxyXG4gICAgICogVmVyaWZpZSBzaSBsJ8OpbMOpbWVudCBlc3QgdHJvbnF1w6ksIGfDqW7DqXJhbGVtZW50LCBkdSB0ZXh0ZVxyXG4gICAgICogQHBhcmFtcyB7T2JqZWN0fSBPYmpldCBET01FbGVtZW50XHJcbiAgICAgKiBAcmV0dXJuIHtib29sZWFufVxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBpc1RydW5jYXRlZChlbCkge1xyXG4gICAgICAgIHJldHVybiBlbC5zY3JvbGxXaWR0aCA+IGVsLmNsaWVudFdpZHRoO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBWZXJpZmllIHNpIGwndXRpbGlzYXRldXIgZXN0IGNvbm5lY3TDqVxyXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn1cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gdXNlcklkZW50aWZpZWQoKSB7XHJcbiAgICAgICAgcmV0dXJuIHR5cGVvZiBiZXRhc2VyaWVzX2FwaV91c2VyX3Rva2VuICE9PSAndW5kZWZpbmVkJztcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogQ2V0dGUgZm9uY3Rpb24gdsOpcmlmaWUgbGEgZGVybmnDqHJlIHZlcnNpb24gZGUgbCdBUElcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gY2hlY2tBcGlWZXJzaW9uKCkge1xyXG4gICAgICAgIGZldGNoKGxvY2F0aW9uLm9yaWdpbiArICcvYXBpL3ZlcnNpb25zJykudGhlbigocmVzcCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoIXJlc3Aub2spIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAnJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gcmVzcC50ZXh0KCk7XHJcbiAgICAgICAgfSkudGhlbihodG1sID0+IHtcclxuICAgICAgICAgICAgaWYgKGh0bWwgJiYgaHRtbC5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBDb252ZXJ0IHRoZSBIVE1MIHN0cmluZyBpbnRvIGEgZG9jdW1lbnQgb2JqZWN0XHJcbiAgICAgICAgICAgICAgICBsZXQgcGFyc2VyID0gbmV3IERPTVBhcnNlcigpLCBkb2MgPSBwYXJzZXIucGFyc2VGcm9tU3RyaW5nKGh0bWwsICd0ZXh0L2h0bWwnKTtcclxuICAgICAgICAgICAgICAgIC8vICQoJy5tYWluY29udGVudCA+IHVsID4gbGkgPiBzdHJvbmcnKS5sYXN0KCkudGV4dCgpLnRyaW0oKS5zcGxpdCgnICcpWzFdXHJcbiAgICAgICAgICAgICAgICBjb25zdCBsYXRlc3QgPSBkb2MucXVlcnlTZWxlY3RvcignLm1haW5jb250ZW50ID4gdWwgPiBsaTpsYXN0LWNoaWxkID4gc3Ryb25nJykudGV4dENvbnRlbnQuc3BsaXQoJyAnKVsxXS50cmltKCksIGxhc3RGID0gcGFyc2VGbG9hdChsYXRlc3QpO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFOdW1iZXIuaXNOYU4obGFzdEYpICYmIGxhc3RGID4gcGFyc2VGbG9hdChNZWRpYV8xLk1lZGlhLmFwaS52ZXJzaW9ucy5sYXN0KSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5hbGVydChcIkwnQVBJIHBvc3PDqGRlIHVuZSBub3V2ZWxsZSB2ZXJzaW9uOiBcIiArIGxhdGVzdCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogUGVybWV0IGQnYWZmaWNoZXIgbGVzIG1lc3NhZ2VzIGQnZXJyZXVyIGxpw6lzIGF1IHNjcmlwdFxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSB0aXRsZSBMZSB0aXRyZSBkdSBtZXNzYWdlXHJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gdGV4dCAgTGUgdGV4dGUgZHUgbWVzc2FnZVxyXG4gICAgICogQHJldHVybiB7dm9pZH1cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gbm90aWZpY2F0aW9uKHRpdGxlLCB0ZXh0KSB7XHJcbiAgICAgICAgLy8gR01fbm90aWZpY2F0aW9uKGRldGFpbHMsIG9uZG9uZSksIEdNX25vdGlmaWNhdGlvbih0ZXh0LCB0aXRsZSwgaW1hZ2UsIG9uY2xpY2spXHJcbiAgICAgICAgbGV0IG5vdGlmQ29udGFpbmVyID0gJCgnLnVzZXJzY3JpcHQtbm90aWZpY2F0aW9ucycpO1xyXG4gICAgICAgIC8vIE9uIGFqb3V0ZSBub3RyZSB6b25lIGRlIG5vdGlmaWNhdGlvbnNcclxuICAgICAgICBpZiAoJCgnLnVzZXJzY3JpcHQtbm90aWZpY2F0aW9ucycpLmxlbmd0aCA8PSAwKSB7XHJcbiAgICAgICAgICAgICQoJyNmYi1yb290JykuYWZ0ZXIoJzxkaXYgY2xhc3M9XCJ1c2Vyc2NyaXB0LW5vdGlmaWNhdGlvbnNcIj48aDM+PHNwYW4gY2xhc3M9XCJ0aXRsZVwiPjwvc3Bhbj48aSBjbGFzcz1cImZhIGZhLXRpbWVzXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+PC9pPjwvaDM+PHAgY2xhc3M9XCJ0ZXh0XCI+PC9wPjwvZGl2PicpO1xyXG4gICAgICAgICAgICBub3RpZkNvbnRhaW5lciA9ICQoJy51c2Vyc2NyaXB0LW5vdGlmaWNhdGlvbnMnKTtcclxuICAgICAgICAgICAgJCgnLnVzZXJzY3JpcHQtbm90aWZpY2F0aW9ucyAuZmEtdGltZXMnKS5jbGljaygoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAkKCcudXNlcnNjcmlwdC1ub3RpZmljYXRpb25zJykuc2xpZGVVcCgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbm90aWZDb250YWluZXIuaGlkZSgpO1xyXG4gICAgICAgICQoJy51c2Vyc2NyaXB0LW5vdGlmaWNhdGlvbnMgLnRpdGxlJykuaHRtbCh0aXRsZSk7XHJcbiAgICAgICAgJCgnLnVzZXJzY3JpcHQtbm90aWZpY2F0aW9ucyAudGV4dCcpLmh0bWwodGV4dCk7XHJcbiAgICAgICAgbm90aWZDb250YWluZXIuc2xpZGVEb3duKCkuZGVsYXkoNTAwMCkuc2xpZGVVcCgpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBhZGRTY3JpcHRBbmRMaW5rIC0gUGVybWV0IGQnYWpvdXRlciB1biBzY3JpcHQgb3UgdW4gbGluayBzdXIgbGEgcGFnZSBXZWJcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gIHtTdHJpbmd8U3RyaW5nW119IG5hbWUgTGUgb3UgbGVzIGlkZW50aWZpYW50cyBkZXMgw6lsw6ltZW50cyDDoCBjaGFyZ2VyXHJcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBhZGRTY3JpcHRBbmRMaW5rKG5hbWUpIHtcclxuICAgICAgICBpZiAobmFtZSBpbnN0YW5jZW9mIEFycmF5KSB7XHJcbiAgICAgICAgICAgIGlmIChuYW1lLmxlbmd0aCA+IDEpIHtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IG4gPSAwOyBuIDwgbmFtZS5sZW5ndGg7IG4rKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGFkZFNjcmlwdEFuZExpbmsobmFtZVtuXSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBuYW1lID0gbmFtZVswXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBPbiB2w6lyaWZpZSBxdWUgbGUgbm9tIGVzdCBjb25udVxyXG4gICAgICAgIGlmICghc2NyaXB0c0FuZFN0eWxlcyB8fCAhKG5hbWUgaW4gc2NyaXB0c0FuZFN0eWxlcykpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGAke25hbWV9IG5lIGZhaXQgcGFzIHBhcnRpdCBkZXMgZG9ubsOpZXMgZGUgc2NyaXB0cyBvdSBkZSBzdHlsZXNgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGVsZW1lbnQsIGRhdGEgPSBzY3JpcHRzQW5kU3R5bGVzW25hbWVdO1xyXG4gICAgICAgIGlmIChkYXRhLnR5cGUgPT09ICdzY3JpcHQnKSB7XHJcbiAgICAgICAgICAgIC8vIGh0dHBzOi8vY2RuanMuY2xvdWRmbGFyZS5jb20vYWpheC9saWJzL21vbWVudC5qcy8yLjI5LjEvbW9tZW50Lm1pbi5qc1xyXG4gICAgICAgICAgICBlbGVtZW50ID0gYFxyXG4gICAgICAgICAgICAgICAgPHNjcmlwdCBzcmM9XCIke2RhdGEuc3JjfVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkPVwiJHtkYXRhLmlkfVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGludGVncml0eT1cIiR7ZGF0YS5pbnRlZ3JpdHl9XCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3Jvc3NvcmlnaW49XCJhbm9ueW1vdXNcIiByZWZlcnJlcnBvbGljeT1cIm5vLXJlZmVycmVyXCI+XHJcbiAgICAgICAgICAgICAgICA8L3NjcmlwdD5gO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChkYXRhLnR5cGUgPT09ICdzdHlsZScpIHtcclxuICAgICAgICAgICAgZWxlbWVudCA9IGBcclxuICAgICAgICAgICAgICAgIDxsaW5rIHJlbD1cInN0eWxlc2hlZXRcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgaWQ9XCIke2RhdGEuaWR9XCJcclxuICAgICAgICAgICAgICAgICAgICAgIGhyZWY9XCIke2RhdGEuaHJlZn1cIlxyXG4gICAgICAgICAgICAgICAgICAgICAgaW50ZWdyaXR5PVwiJHtkYXRhLmludGVncml0eX1cIlxyXG4gICAgICAgICAgICAgICAgICAgICAgY3Jvc3NvcmlnaW49XCJhbm9ueW1vdXNcIiByZWZlcnJlcnBvbGljeT1cIm5vLXJlZmVycmVyXCIgLz5gO1xyXG4gICAgICAgIH1cclxuICAgICAgICAkKCdoZWFkJykuYXBwZW5kKGVsZW1lbnQpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBGb25jdGlvbiBtb2RpZmlhbnQgbGUgZm9uY3Rpb25uZW1lbnQgZHUgZmlsdHJlIHBheXNcclxuICAgICAqIHBvdXIgcGVybWV0dHJlIGQnYWpvdXRlciBwbHVzaWV1cnMgcGF5cyBzdXIgbGEgcGFnZSBkZXMgc8Opcmllc1xyXG4gICAgICogQHJldHVybiB7dm9pZH1cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gc2VyaWVzRmlsdGVyUGF5cygpIHtcclxuICAgICAgICBpZiAodXJsLnNwbGl0KCcvJykucG9wKCkgPT0gJ2FnZW5kYScpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBsZXQgJGlucHV0ID0gJCgnLmZpbHRlci1jb250YWluZXItb3RoZXJzLWNvdW50cmllcyBpbnB1dCcpO1xyXG4gICAgICAgIC8vIFN1cHByaW1lciBsJ2F0dHJpYnV0IG9uY2xpY2sgZGUgbCdpbnB1dCBvdGhlci1jb3VudHJpZXNcclxuICAgICAgICAkaW5wdXQucmVtb3ZlQXR0cignb25jaGFuZ2UnKTtcclxuICAgICAgICAkaW5wdXQub24oJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgbGV0IGhhc1NlbGVjdCA9ICQoJ29wdGlvblt2YWx1ZT1cIicgKyAkaW5wdXQudmFsKCkgKyAnXCJdJyksIGJ0blRlbXAgPSAnPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4tcmVzZXQgYnRuLWJ0biBmaWx0ZXItYnRuIGFjdGl2ZVwiIGlkPVwiJyArXHJcbiAgICAgICAgICAgICAgICBoYXNTZWxlY3QuYXR0cihcImlkXCIpICsgJ1wiIG9uY2xpY2s9XCJzZWFyY2hPcHRpb24odGhpcyk7XCI+JyArXHJcbiAgICAgICAgICAgICAgICBoYXNTZWxlY3QuYXR0cihcInZhbHVlXCIpICsgJzwvYnV0dG9uPic7XHJcbiAgICAgICAgICAgICQoJyNwYXlzID4gYnV0dG9uJykubGFzdCgpLmFmdGVyKGJ0blRlbXApO1xyXG4gICAgICAgICAgICBkZWxldGVGaWx0ZXJPdGhlcnNDb3VudHJpZXMoKTtcclxuICAgICAgICAgICAgY291bnRGaWx0ZXIoXCJwYXlzXCIpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGNvbnN0IGJhc2VVcmwgPSBnZW5lcmF0ZV9yb3V0ZShcInNob3dzXCIpO1xyXG4gICAgICAgIGxldCBoYXNoID0gdXJsLnN1YnN0cmluZyhiYXNlVXJsLmxlbmd0aCk7XHJcbiAgICAgICAgaWYgKGhhc2gubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgZGF0YSA9IGhhc2guc3BsaXQoJy8nKTtcclxuICAgICAgICBpZiAoIWRhdGEuZmluZCgoZWwpID0+IGVsLm1hdGNoKC9edHJpLXxzb3J0LS9nKSkpIHtcclxuICAgICAgICAgICAgZGF0YS5wdXNoKENPTlNUQU5URV9GSUxURVIudHJpICsgXCItXCIgKyBDT05TVEFOVEVfU09SVC5wb3B1bGFyaXRlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yIChsZXQgaSBpbiBkYXRhKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHNwbGl0RGF0YSA9IGRhdGFbaV0uc3BsaXQoJy0nKSwgZmlsdGVyID0gc3BsaXREYXRhLnNoaWZ0KCksIGRhdGFGaWx0ZXIgPSBkZWNvZGVVUklDb21wb25lbnQoc3BsaXREYXRhLmpvaW4oJy0nKSk7XHJcbiAgICAgICAgICAgIGlmIChmaWx0ZXIgJiYgZGF0YUZpbHRlciAmJlxyXG4gICAgICAgICAgICAgICAgKGZpbHRlciA9PT0gQ09OU1RBTlRFX0ZJTFRFUi5wYXNwYXlzIHx8IGZpbHRlciA9PT0gQ09OU1RBTlRFX0ZJTFRFUi5wYXlzKSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaGFzQWN0aXZlID0gZmlsdGVyID09PSBDT05TVEFOVEVfRklMVEVSLnBheXMsIGhhc0J1dHRvbiA9ICQoXCIjbGVmdCAjcGF5cyA+IGJ1dHRvbiNcIiArIGRhdGFGaWx0ZXIudG9VcHBlckNhc2UoKSksIG9wdGlvbkV4aXN0ID0gJCgnZGF0YWxpc3RbaWQ9XCJvdGhlci1jb3VudHJpZXNcIl0gb3B0aW9uW2lkPVwiJyArIGRhdGFGaWx0ZXIudG9VcHBlckNhc2UoKSArICdcIl0nKTtcclxuICAgICAgICAgICAgICAgIGlmIChoYXNCdXR0b24ubGVuZ3RoIDw9IDAgJiYgb3B0aW9uRXhpc3QpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgYnRuVGVtcCA9ICc8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0bi1yZXNldCBidG4tYnRuIGZpbHRlci1idG4nICsgKGhhc0FjdGl2ZSA/ICcgYWN0aXZlJyA6ICcgaGFjdGl2ZScpICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ1wiIGlkPVwiJyArIGRhdGFGaWx0ZXIudG9VcHBlckNhc2UoKSArICdcIiBvbmNsaWNrPVwic2VhcmNoT3B0aW9uKHRoaXMpO1wiPicgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25FeGlzdC5hdHRyKCd2YWx1ZScpICsgJzwvYnV0dG9uPic7XHJcbiAgICAgICAgICAgICAgICAgICAgJCgnI3BheXMgPiBidXR0b24nKS5sYXN0KCkuYWZ0ZXIoYnRuVGVtcCk7XHJcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uRXhpc3QucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlRmlsdGVyT3RoZXJzQ291bnRyaWVzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgY291bnRGaWx0ZXIoXCJwYXlzXCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZ1bmN0aW9uIGNvdW50RmlsdGVyKHRhcmdldCkge1xyXG4gICAgICAgICAgICBjb25zdCBjdXJyZW50ID0gJCgnI2NvdW50XycgKyB0YXJnZXQpO1xyXG4gICAgICAgICAgICBpZiAoY3VycmVudC5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbGVuID0gJCgnI3BheXMgPiBidXR0b24uaGFjdGl2ZSwgI3BheXMgPiBidXR0b24uYWN0aXZlJykubGVuZ3RoLCBkaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgICAgICAgICAgY3VycmVudC50ZXh0KGxlbik7XHJcbiAgICAgICAgICAgICAgICBpZiAobGVuID49IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5ID0gJ2Jsb2NrJztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGN1cnJlbnQuY3NzKCdkaXNwbGF5JywgZGlzcGxheSk7XHJcbiAgICAgICAgICAgICAgICBoaWRlQnV0dG9uUmVzZXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogRm9uY3Rpb24gZCdham91dCBkJ3VuIHBhZ2luYXRldXIgZW4gaGF1dCBkZSBsaXN0ZSBkZXMgc8Opcmllc1xyXG4gICAgICogQHJldHVybiB7dm9pZH1cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gd2FpdFBhZ2luYXRpb24oKSB7XHJcbiAgICAgICAgbGV0IGxvYWRlZCA9IGZhbHNlO1xyXG4gICAgICAgIC8vIE9uIGF0dGVuZCBsYSBwcsOpc2VuY2UgZHUgcGFnaW5hdGV1clxyXG4gICAgICAgIGxldCB0aW1lclNlcmllcyA9IHNldEludGVydmFsKCgpID0+IHtcclxuICAgICAgICAgICAgaWYgKCQoJyNwYWdpbmF0aW9uLXNob3dzJykubGVuZ3RoIDwgMSlcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCh0aW1lclNlcmllcyk7XHJcbiAgICAgICAgICAgIC8vIE9uIGNvcGllIGNvbGxlIGxlIHBhZ2luYXRldXIgZW4gaGF1dCBkZSBsYSBsaXN0ZSBkZXMgc8Opcmllc1xyXG4gICAgICAgICAgICAkKCcjcmVzdWx0cy1zaG93cycpLnByZXBlbmQoJCgnI3BhZ2luYXRpb24tc2hvd3MnKS5jbG9uZSh0cnVlLCB0cnVlKSk7XHJcbiAgICAgICAgICAgIC8vIE9uIG9ic2VydmUgbGVzIG1vZGlmaWNhdGlvbnMgZGFucyBsZSBub2V1ZCBkdSBwYWdpbmF0ZXVyXHJcbiAgICAgICAgICAgICQoJyNyZXN1bHRzLXNob3dzJykub24oJ0RPTVN1YnRyZWVNb2RpZmllZCcsICcjcGFnaW5hdGlvbi1zaG93cycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGlmICghbG9hZGVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgd2FpdFBhZ2luYXRpb24oKTtcclxuICAgICAgICAgICAgICAgICAgICBsb2FkZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9LCA1MDApO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBBam91dGUgZGVzIGFtw6lsaW9yYXRpb25zIHN1ciBsYSBwYWdlIGRlIGxhIGNvbnNvbGUgZGUgbCdBUElcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gdXBkYXRlQXBpQ29uc29sZSgpIHtcclxuICAgICAgICAvLyBMaXN0ZW5lciBzdXIgbGUgYnRuIG5vdXZlYXUgcGFyYW3DqHRyZVxyXG4gICAgICAgICQoJ2Rpdi5mb3JtLWdyb3VwIGJ1dHRvbi5idG4tYnRuLmJ0bi0tYmx1ZScpLnByb3AoJ29uY2xpY2snLCBudWxsKS5vZmYoJ2NsaWNrJykuY2xpY2soKGUsIGtleSkgPT4ge1xyXG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIGlmIChkZWJ1ZylcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdub3V2ZWF1IHBhcmFtZXRyZSBoYW5kbGVyJywga2V5KTtcclxuICAgICAgICAgICAgLy8gT24gYWpvdXRlIHVuZSBub3V2ZWxsZSBsaWduZSBkZSBwYXJhbcOodHJlXHJcbiAgICAgICAgICAgIG5ld0FwaVBhcmFtZXRlcigpO1xyXG4gICAgICAgICAgICAvLyBPbiBpbnPDqHJlIGxhIGNsw6kgZHUgcGFyYW3DqHRyZSwgc2kgZWxsZSBlc3QgcHLDqXNlbnRlXHJcbiAgICAgICAgICAgIGlmIChrZXkpIHtcclxuICAgICAgICAgICAgICAgICQoJ2lucHV0Lm5hbWU6bGFzdCcpLnZhbChrZXkpO1xyXG4gICAgICAgICAgICAgICAgJCgnaW5wdXQuZm9ybS1jb250cm9sOmxhc3QnKS5mb2N1cygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGFkZFJlbW92ZVBhcmFtVG9Db25zb2xlKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgLy8gTGlzdGVuZXIgc3VyIGxhIGxpc3RlIGRlcyBtw6l0aG9kZXNcclxuICAgICAgICAkKCcjbWV0aG9kJykub24oJ2NoYW5nZScsICgpID0+IHtcclxuICAgICAgICAgICAgLy8gT24gc3VwcHJpbWUgdG91cyBsZXMgcGFyYW3DqHRyZXMgZXhpc3RhbnRzXHJcbiAgICAgICAgICAgICQoJyNhcGktcGFyYW1zIC5yZW1vdmUnKS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgLy8gRW4gYXR0ZW50ZSBkZSBsYSBkb2N1bWVudGF0aW9uIGRlIGwnQVBJXHJcbiAgICAgICAgICAgIHRpbWVyID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKCQoJyNkb2MgY29kZScpLmxlbmd0aCA8PSAwKVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodGltZXIpOyAvLyBPbiBzdXBwcmltZSBsZSB0aW1lclxyXG4gICAgICAgICAgICAgICAgbGV0IHBhcmFtc0RvYyA9ICQoJyNkb2MgPiB1bCA+IGxpID4gY29kZScpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGRlYnVnKVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdwYXJhbXNEb2MnLCBwYXJhbXNEb2MpO1xyXG4gICAgICAgICAgICAgICAgcGFyYW1zRG9jLmNzcygnY3Vyc29yJywgJ3BvaW50ZXInKTtcclxuICAgICAgICAgICAgICAgIC8vIE9uIGFqb3V0ZSBsYSBjbMOpIGR1IHBhcmFtw6h0cmUgZGFucyB1bmUgbm91dmVsbGUgbGlnbmUgZGUgcGFyYW3DqHRyZVxyXG4gICAgICAgICAgICAgICAgcGFyYW1zRG9jLmNsaWNrKChlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJCgnZGl2LmZvcm0tZ3JvdXAgYnV0dG9uLmJ0bi1idG4uYnRuLS1ibHVlJykudHJpZ2dlcignY2xpY2snLCBbJChlLmN1cnJlbnRUYXJnZXQpLnRleHQoKS50cmltKCldKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9LCA1MDApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vIEFqb3V0ZSB1biBjYWRlbmFzIHbDqXJvdWlsbMOpIGF1IHBhcmFtw6h0cmUgJ1ZlcnNpb24nIG5vbi1tb2RpZmlhYmxlXHJcbiAgICAgICAgJCgnLmFwaS1wYXJhbXM6Zmlyc3QnKS5hcHBlbmQoJzxpIGNsYXNzPVwiZmEgZmEtbG9jayBmYS0yeFwiIHN0eWxlPVwibWFyZ2luLWxlZnQ6IDEwcHg7dmVydGljYWwtYWxpZ246bWlkZGxlO2N1cnNvcjpub3QtYWxsb3dlZDtcIiBhcmlhLWhpZGRlbj1cInRydWVcIj48L2k+Jyk7XHJcbiAgICAgICAgYWRkUmVtb3ZlUGFyYW1Ub0NvbnNvbGUoKTtcclxuICAgICAgICBhZGRUb2dnbGVTaG93UmVzdWx0KCk7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogT24gYWpvdXRlIHVuIGJvdXRvbiBwb3VyIHN1cHByaW1lciBsYSBsaWduZSBkJ3VuIHBhcmFtw6h0cmVcclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBhZGRSZW1vdmVQYXJhbVRvQ29uc29sZSgpIHtcclxuICAgICAgICAgICAgbGV0IGVsdHMgPSAkKCcuYXBpLXBhcmFtczpub3QoLnJlbW92ZSk6bm90KC5sb2NrKTpub3QoOmZpcnN0KScpO1xyXG4gICAgICAgICAgICBlbHRzXHJcbiAgICAgICAgICAgICAgICAuYXBwZW5kKCc8aSBjbGFzcz1cInJlbW92ZS1pbnB1dCBmYSBmYS1taW51cy1jaXJjbGUgZmEtMnhcIiBzdHlsZT1cIm1hcmdpbi1sZWZ0OiAxMHB4O3ZlcnRpY2FsLWFsaWduOm1pZGRsZTtjdXJzb3I6cG9pbnRlcjtcIiBhcmlhLWhpZGRlbj1cInRydWVcIj48L2k+JylcclxuICAgICAgICAgICAgICAgIC5hcHBlbmQoJzxpIGNsYXNzPVwibG9jay1wYXJhbSBmYSBmYS11bmxvY2sgZmEtMnhcIiBzdHlsZT1cIm1hcmdpbi1sZWZ0OiAxMHB4O3ZlcnRpY2FsLWFsaWduOm1pZGRsZTtjdXJzb3I6cG9pbnRlcjtcIiBhcmlhLWhpZGRlbj1cInRydWVcIj48L2k+JylcclxuICAgICAgICAgICAgICAgIC5hZGRDbGFzcygncmVtb3ZlJyk7XHJcbiAgICAgICAgICAgICQoJy5yZW1vdmUtaW5wdXQnKS5jbGljaygoZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgJChlLmN1cnJlbnRUYXJnZXQpLnBhcmVudCgnLmFwaS1wYXJhbXMnKS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICQoJy5sb2NrLXBhcmFtJywgZWx0cykuY2xpY2soKGUpID0+IHtcclxuICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICBsZXQgc2VsZiA9ICQoZS5jdXJyZW50VGFyZ2V0KTtcclxuICAgICAgICAgICAgICAgIGlmIChkZWJ1ZylcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnbG9jay1wYXJhbScsIHNlbGYsIHNlbGYuaGFzQ2xhc3MoJ2ZhLXVubG9jaycpKTtcclxuICAgICAgICAgICAgICAgIGlmIChzZWxmLmhhc0NsYXNzKCdmYS11bmxvY2snKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYucmVtb3ZlQ2xhc3MoJ2ZhLXVubG9jaycpLmFkZENsYXNzKCdmYS1sb2NrJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5wYXJlbnQoJy5hcGktcGFyYW1zJykucmVtb3ZlQ2xhc3MoJ3JlbW92ZScpLmFkZENsYXNzKCdsb2NrJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLnJlbW92ZUNsYXNzKCdmYS1sb2NrJykuYWRkQ2xhc3MoJ2ZhLXVubG9jaycpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYucGFyZW50KCcuYXBpLXBhcmFtcycpLmFkZENsYXNzKCdyZW1vdmUnKS5yZW1vdmVDbGFzcygnbG9jaycpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZnVuY3Rpb24gYWRkVG9nZ2xlU2hvd1Jlc3VsdCgpIHtcclxuICAgICAgICAgICAgbGV0ICRyZXN1bHQgPSAkKCcjcmVzdWx0Jyk7XHJcbiAgICAgICAgICAgIC8vIE9uIGFqb3V0ZSB1biB0aXRyZSBwb3VyIGxhIHNlY3Rpb24gZGUgcsOpc3VsdGF0IGRlIGxhIHJlcXXDqnRlXHJcbiAgICAgICAgICAgICRyZXN1bHQuYmVmb3JlKCc8aDI+UsOpc3VsdGF0IGRlIGxhIHJlcXXDqnRlIDxzcGFuIGNsYXNzPVwidG9nZ2xlXCIgc3R5bGU9XCJtYXJnaW4tbGVmdDoxMHB4O1wiPjxpIGNsYXNzPVwiZmEgZmEtY2hldnJvbi1jaXJjbGUtZG93blwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPjwvaT48L3NwYW4+PC9oMj4nKTtcclxuICAgICAgICAgICAgJCgnLnRvZ2dsZScpLmNsaWNrKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIC8vIE9uIHLDqWFsaXNlIHVuIHRvZ2dsZSBzdXIgbGEgc2VjdGlvbiBkZSByw6lzdWx0YXQgZXQgb24gbW9kaWZpZSBsJ2ljw7RuZSBkdSBjaGV2cm9uXHJcbiAgICAgICAgICAgICAgICAkcmVzdWx0LnRvZ2dsZSg0MDAsICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoJHJlc3VsdC5pcygnOmhpZGRlbicpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJy50b2dnbGUgaScpLnJlbW92ZUNsYXNzKCdmYS1jaGV2cm9uLWNpcmNsZS11cCcpLmFkZENsYXNzKCdmYS1jaGV2cm9uLWNpcmNsZS1kb3duJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcudG9nZ2xlIGknKS5yZW1vdmVDbGFzcygnZmEtY2hldnJvbi1jaXJjbGUtZG93bicpLmFkZENsYXNzKCdmYS1jaGV2cm9uLWNpcmNsZS11cCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgLy8gT24gbW9kaWZpZSBsZSBzZW5zIGR1IGNoZXZyb24gbG9ycyBkdSBsYW5jZW1lbnQgZCd1bmUgcmVxdcOqdGVcclxuICAgICAgICAgICAgJCgnYnV0dG9uLmlzLWZ1bGwnKS5jbGljaygoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAkKCcudG9nZ2xlIGknKS5yZW1vdmVDbGFzcygnZmEtY2hldnJvbi1jaXJjbGUtZG93bicpLmFkZENsYXNzKCdmYS1jaGV2cm9uLWNpcmNsZS11cCcpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKlxyXG4gICAgICogQWpvdXRlIHVuIHNvbW1haXJlIHN1ciBsZXMgcGFnZXMgZGUgZG9jdW1lbnRhdGlvbiBkZXMgbcOpdGhvZGVzIGRlIGwnQVBJXHJcbiAgICAgKiBMZSBzb21tYWlyZSBlc3QgY29uc3RpdHXDqSBkZXMgbGllbnMgdmVycyBsZXMgZm9uY3Rpb25zIGRlcyBtw6l0aG9kZXMuXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIHNvbW1haXJlRGV2QXBpKCkge1xyXG4gICAgICAgIGlmIChkZWJ1ZylcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ2J1aWxkIHNvbW1haXJlJyk7XHJcbiAgICAgICAgbGV0IHRpdGxlcyA9ICQoJy5tYWluY29udGVudCBoMicpLCBtZXRob2RzID0ge307XHJcbiAgICAgICAgLy8gQWpvdXQgZHUgc3R5bGUgQ1NTIHBvdXIgbGVzIHRhYmxlc1xyXG4gICAgICAgIGFkZFNjcmlwdEFuZExpbmsoJ3RhYmxlY3NzJyk7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQ29uc3RydWl0IHVuZSBjZWxsdWxlIGRlIHRhYmxlIEhUTUwgcG91ciB1bmUgbWV0aG9kZVxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtICB7U3RyaW5nfSB2ZXJiIExlIHZlcmJlIEhUVFAgdXRpbGlzw6kgcGFyIGxhIGZvbmN0aW9uXHJcbiAgICAgICAgICogQHBhcmFtICB7U3RyaW5nfSBrZXkgIEwnaWRlbnRpZmlhbnQgZGUgbGEgZm9uY3Rpb25cclxuICAgICAgICAgKiBAcmV0dXJuIHtTdHJpbmd9XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gYnVpbGRDZWxsKHZlcmIsIGtleSkge1xyXG4gICAgICAgICAgICBsZXQgY2VsbCA9ICc8dGQ+JztcclxuICAgICAgICAgICAgaWYgKHZlcmIgaW4gbWV0aG9kc1trZXldKSB7XHJcbiAgICAgICAgICAgICAgICBjZWxsICs9IGA8aSBkYXRhLWlkPVwiJHttZXRob2RzW2tleV1bdmVyYl0uaWR9XCIgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzcz1cImxpbmtTb21tYWlyZSBmYSBmYS1jaGVjayBmYS0yeFwiIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU9XCIke21ldGhvZHNba2V5XVt2ZXJiXS50aXRsZX1cIj48L2k+YDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gY2VsbCArICc8L3RkPic7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIENvbnN0cnVpdCB1bmUgbGlnbmUgZGUgdGFibGUgSFRNTCBwb3VyIHVuZSBmb25jdGlvblxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtICB7U3RyaW5nfSBrZXkgTCdpZGVudGlmaWFudCBkZSBsYSBmb25jdGlvblxyXG4gICAgICAgICAqIEByZXR1cm4ge1N0cmluZ30gICAgIExhIGxpZ25lIEhUTUxcclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBidWlsZFJvdyhrZXkpIHtcclxuICAgICAgICAgICAgbGV0IHJvdyA9IGA8dHI+PHRoIHNjb3BlPVwicm93XCIgY2xhc3M9XCJmb25jdGlvblwiPiR7bWV0aG9kc1trZXldLnRpdGxlfTwvdGg+YDtcclxuICAgICAgICAgICAgcm93ICs9IGJ1aWxkQ2VsbCgnR0VUJywga2V5KTtcclxuICAgICAgICAgICAgcm93ICs9IGJ1aWxkQ2VsbCgnUE9TVCcsIGtleSk7XHJcbiAgICAgICAgICAgIHJvdyArPSBidWlsZENlbGwoJ1BVVCcsIGtleSk7XHJcbiAgICAgICAgICAgIHJvdyArPSBidWlsZENlbGwoJ0RFTEVURScsIGtleSk7XHJcbiAgICAgICAgICAgIHJldHVybiByb3cgKyAnPC90cj4nO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBGYWJyaXF1ZSBsYSB0YWJsZSBIVE1MIGR1IHNvbW1haXJlXHJcbiAgICAgICAgICogQHJldHVybiB7T2JqZWN0fSBMJ29iamV0IGpRdWVyeSBkZSBsYSB0YWJsZSBIVE1MXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gYnVpbGRUYWJsZSgpIHtcclxuICAgICAgICAgICAgbGV0ICR0YWJsZSA9ICQoYFxyXG4gICAgICAgICAgICAgICAgPGRpdiBpZD1cInNvbW1haXJlXCIgY2xhc3M9XCJ0YWJsZS1yZXNwb25zaXZlXCIgc3R5bGU9XCJkaXNwbGF5Om5vbmU7XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPHRhYmxlIGNsYXNzPVwidGFibGUgdGFibGUtZGFyayB0YWJsZS1zdHJpcGVkIHRhYmxlLWJvcmRlcmVkXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDx0aGVhZCBjbGFzcz1cInRoZWFkLWRhcmtcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0cj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGggY29sc3Bhbj1cIjVcIiBzY29wZT1cImNvbFwiIGNsYXNzPVwiY29sLWxnLTEyIGxpVGl0bGVcIj5Tb21tYWlyZTwvdGg+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RyPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRyPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aCBzY29wZT1cImNvbFwiIGNsYXNzPVwiY29sLWxnLTNcIj5Gb25jdGlvbjwvdGg+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRoIHNjb3BlPVwiY29sXCIgY2xhc3M9XCJjb2wtbGctMlwiPkdFVDwvdGg+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRoIHNjb3BlPVwiY29sXCIgY2xhc3M9XCJjb2wtbGctMlwiPlBPU1Q8L3RoPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aCBzY29wZT1cImNvbFwiIGNsYXNzPVwiY29sLWxnLTJcIj5QVVQ8L3RoPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aCBzY29wZT1cImNvbFwiIGNsYXNzPVwiY29sLWxnLTJcIj5ERUxFVEU8L3RoPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90cj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC90aGVhZD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHRib2R5PjwvdGJvZHk+XHJcbiAgICAgICAgICAgICAgICAgICAgPC90YWJsZT5cclxuICAgICAgICAgICAgICAgIDwvZGl2PmApLCAkdGJvZHkgPSAkdGFibGUuZmluZCgndGJvZHknKTtcclxuICAgICAgICAgICAgZm9yIChsZXQga2V5IGluIG1ldGhvZHMpIHtcclxuICAgICAgICAgICAgICAgICR0Ym9keS5hcHBlbmQoYnVpbGRSb3coa2V5KSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuICR0YWJsZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yIChsZXQgdCA9IDA7IHQgPCB0aXRsZXMubGVuZ3RoOyB0KyspIHtcclxuICAgICAgICAgICAgLy8gYWpvdXRlciBsZXMgSUQgYXV4IHRpdHJlcyBkZXMgbWV0aG9kZXMsIGFpbnNpIHF1J3VuIGNoZXZyb24gcG91ciByZW52b3llciBhdSBzb21tYWlyZVxyXG4gICAgICAgICAgICBsZXQgJHRpdGxlID0gJCh0aXRsZXMuZ2V0KHQpKSwgaWQgPSAkdGl0bGUudGV4dCgpLnRyaW0oKS50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoLyAvLCAnXycpLnJlcGxhY2UoL1xcLy8sICctJyksIHR4dCA9ICR0aXRsZS50ZXh0KCkudHJpbSgpLnNwbGl0KCcgJylbMV0sIGRlc2MgPSAkdGl0bGUubmV4dCgncCcpLnRleHQoKSwga2V5ID0gdHh0LnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvXFwvLywgJycpLCB2ZXJiID0gJHRpdGxlLnRleHQoKS50cmltKCkuc3BsaXQoJyAnKVswXS50b1VwcGVyQ2FzZSgpO1xyXG4gICAgICAgICAgICAkdGl0bGUuYXR0cignaWQnLCBpZCk7XHJcbiAgICAgICAgICAgICR0aXRsZS5hcHBlbmQoJzxpIGNsYXNzPVwiZmEgZmEtY2hldnJvbi1jaXJjbGUtdXBcIiBhcmlhLWhpZGRlbj1cInRydWVcIiB0aXRsZT1cIlJldG91ciBhdSBzb21tYWlyZVwiPjwvaT4nKTtcclxuICAgICAgICAgICAgaWYgKCEoa2V5IGluIG1ldGhvZHMpKVxyXG4gICAgICAgICAgICAgICAgbWV0aG9kc1trZXldID0geyB0aXRsZTogdHh0IH07XHJcbiAgICAgICAgICAgIG1ldGhvZHNba2V5XVt2ZXJiXSA9IHsgaWQ6IGlkLCB0aXRsZTogZGVzYyB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBDb25zdHJ1aXJlIHVuIHNvbW1haXJlIGRlcyBmb25jdGlvbnNcclxuICAgICAgICAvL2lmIChkZWJ1ZykgY29uc29sZS5sb2coJ21ldGhvZHMnLCBtZXRob2RzKTtcclxuICAgICAgICAkKCcubWFpbmNvbnRlbnQgaDEnKS5hZnRlcihidWlsZFRhYmxlKCkpO1xyXG4gICAgICAgICQoJyNzb21tYWlyZScpLmZhZGVJbigpO1xyXG4gICAgICAgICQoJy5saW5rU29tbWFpcmUnKS5jbGljaygoZSkgPT4ge1xyXG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICQoJyMnICsgJChlLmN1cnJlbnRUYXJnZXQpLmRhdGEoJ2lkJykpLmdldCgwKS5zY3JvbGxJbnRvVmlldyh0cnVlKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKCcuZmEtY2hldnJvbi1jaXJjbGUtdXAnKS5jbGljayhmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzb21tYWlyZScpLnNjcm9sbEludG9WaWV3KHRydWUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBBam91dGUgdW4gYm91dG9uIHBvdXIgbGUgZGV2IHBvdXIgYWZmaWNoZXIgbGVzIGRvbm7DqWVzIGRlIGxhIHJlc3NvdXJjZVxyXG4gICAgICogZGFucyB1bmUgbW9kYWxcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gYWRkQnRuRGV2KCkge1xyXG4gICAgICAgIGNvbnN0IGJ0bkhUTUwgPSAnPGRpdiBjbGFzcz1cImJsb2NrSW5mb3JtYXRpb25zX19hY3Rpb25cIj48YnV0dG9uIGNsYXNzPVwiYnRuLXJlc2V0IGJ0bi10cmFuc3BhcmVudFwiIHR5cGU9XCJidXR0b25cIiBzdHlsZT1cImhlaWdodDo0NHB4O3dpZHRoOjY0cHg7XCI+PGkgY2xhc3M9XCJmYSBmYS13cmVuY2hcIiBhcmlhLWhpZGRlbj1cInRydWVcIiBzdHlsZT1cImZvbnQtc2l6ZToxLjVlbTtcIj48L2k+PC9idXR0b24+PGRpdiBjbGFzcz1cImxhYmVsXCI+RGV2PC9kaXY+PC9kaXY+JywgZGlhbG9nSFRNTCA9IGBcclxuICAgICAgICAgICAgICA8c3R5bGU+XHJcbiAgICAgICAgICAgICAgICAuZGlhbG9nLWNvbnRhaW5lciAuY2xvc2Uge1xyXG4gICAgICAgICAgICAgICAgICBmbG9hdDogcmlnaHQ7XHJcbiAgICAgICAgICAgICAgICAgIGZvbnQtc2l6ZTogMS41cmVtO1xyXG4gICAgICAgICAgICAgICAgICBmb250LXdlaWdodDogNzAwO1xyXG4gICAgICAgICAgICAgICAgICBsaW5lLWhlaWdodDogMTtcclxuICAgICAgICAgICAgICAgICAgY29sb3I6ICNmZmY7XHJcbiAgICAgICAgICAgICAgICAgIHRleHQtc2hhZG93OiAwIDFweCAwICNmZmY7XHJcbiAgICAgICAgICAgICAgICAgIG9wYWNpdHk6IC41O1xyXG4gICAgICAgICAgICAgICAgICBtYXJnaW4tcmlnaHQ6IDIwcHg7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAuZGlhbG9nLWNvbnRhaW5lciAuY2xvc2U6aG92ZXIge2NvbG9yOiAjMDAwO3RleHQtZGVjb3JhdGlvbjogbm9uZTt9XHJcbiAgICAgICAgICAgICAgICAuZGlhbG9nLWNvbnRhaW5lciAuY2xvc2U6bm90KDpkaXNhYmxlZCk6aG92ZXIsIC5jbG9zZTpub3QoOmRpc2FibGVkKTpmb2N1cyB7b3BhY2l0eTogLjc1O31cclxuICAgICAgICAgICAgICAgIC5kaWFsb2ctY29udGFpbmVyIGJ1dHRvbi5jbG9zZSB7cGFkZGluZzogMDtiYWNrZ3JvdW5kLWNvbG9yOiB0cmFuc3BhcmVudDtib3JkZXI6IDA7fVxyXG4gICAgICAgICAgICAgICAgLmRpYWxvZy1jb250YWluZXIgLmNvdW50ZXIge2ZvbnQtc2l6ZTowLjhlbTt9XHJcbiAgICAgICAgICAgICAgPC9zdHlsZT5cclxuICAgICAgICAgICAgICAgIDxkaXZcclxuICAgICAgICAgICAgICAgICAgY2xhc3M9XCJkaWFsb2cgZGlhbG9nLWNvbnRhaW5lciB0YWJsZS1kYXJrXCJcclxuICAgICAgICAgICAgICAgICAgaWQ9XCJkaWFsb2ctcmVzb3VyY2VcIlxyXG4gICAgICAgICAgICAgICAgICBhcmlhLWxhYmVsbGVkYnk9XCJkaWFsb2ctcmVzb3VyY2UtdGl0bGVcIlxyXG4gICAgICAgICAgICAgICAgICBzdHlsZT1cImRpc3BsYXk6bm9uZTtcIlxyXG4gICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGlhbG9nLW92ZXJsYXlcIj48L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRpYWxvZy1jb250ZW50XCIgcm9sZT1cImRvY3VtZW50XCIgc3R5bGU9XCJ3aWR0aDogODAlO1wiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxoMSBpZD1cImRpYWxvZy1yZXNvdXJjZS10aXRsZVwiPkRvbm7DqWVzIGRlIGxhIHJlc3NvdXJjZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImNvdW50ZXJcIj48L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZSA9IFwiYnV0dG9uXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzcyA9IFwiY2xvc2VcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyaWEtbGFiZWwgPSBcIkNsb3NlXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZSA9IFwiRmVybWVyIGxhIGJvw650ZSBkZSBkaWFsb2d1ZVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gYXJpYS1oaWRkZW49XCJ0cnVlXCI+JnRpbWVzOzwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9oMT5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGF0YS1yZXNvdXJjZSBjb250ZW50XCI+PC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+YDtcclxuICAgICAgICAkKCcuYmxvY2tJbmZvcm1hdGlvbnNfX2FjdGlvbnMnKS5hcHBlbmQoYnRuSFRNTCk7XHJcbiAgICAgICAgJCgnYm9keScpLmFwcGVuZChkaWFsb2dIVE1MKTtcclxuICAgICAgICBsZXQgJGRpYWxvZyA9ICQoJyNkaWFsb2ctcmVzb3VyY2UnKTtcclxuICAgICAgICBjb25zdCBodG1sID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xyXG4gICAgICAgIGNvbnN0IG9uU2hvdyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaHRtbC5zdHlsZS5vdmVyZmxvd1kgPSAnaGlkZGVuJztcclxuICAgICAgICAgICAgJCgnI2RpYWxvZy1yZXNvdXJjZScpXHJcbiAgICAgICAgICAgICAgICAuY3NzKCd6LWluZGV4JywgJzEwMDUnKVxyXG4gICAgICAgICAgICAgICAgLmNzcygnb3ZlcmZsb3cnLCAnc2Nyb2xsJyk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBjb25zdCBvbkhpZGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGh0bWwuc3R5bGUub3ZlcmZsb3dZID0gJyc7XHJcbiAgICAgICAgICAgICQoJyNkaWFsb2ctcmVzb3VyY2UnKVxyXG4gICAgICAgICAgICAgICAgLmNzcygnei1pbmRleCcsICcwJylcclxuICAgICAgICAgICAgICAgIC5jc3MoJ292ZXJmbG93JywgJ25vbmUnKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgICQoJy5ibG9ja0luZm9ybWF0aW9uc19fYWN0aW9ucyAuZmEtd3JlbmNoJykucGFyZW50KCkuY2xpY2soKGUpID0+IHtcclxuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICBsZXQgdHlwZSA9IGdldEFwaVJlc291cmNlKGxvY2F0aW9uLnBhdGhuYW1lLnNwbGl0KCcvJylbMV0pLCAvLyBJbmRpcXVlIGRlIHF1ZWwgdHlwZSBkZSByZXNzb3VyY2UgaWwgcydhZ2l0XHJcbiAgICAgICAgICAgICRkYXRhUmVzID0gJCgnI2RpYWxvZy1yZXNvdXJjZSAuZGF0YS1yZXNvdXJjZScpOyAvLyBET01FbGVtZW50IGNvbnRlbmFudCBsZSByZW5kdSBKU09OIGRlIGxhIHJlc3NvdXJjZVxyXG4gICAgICAgICAgICBnZXRSZXNvdXJjZURhdGEoKS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBpZiAoZGVidWcpIGNvbnNvbGUubG9nKCdhZGRCdG5EZXYgcHJvbWlzZSByZXR1cm4nLCBkYXRhKTtcclxuICAgICAgICAgICAgICAgICRkYXRhUmVzLmVtcHR5KCkuYXBwZW5kKHJlbmRlcmpzb24uc2V0X3Nob3dfdG9fbGV2ZWwoMikoZGF0YVt0eXBlLnNpbmd1bGFyXSkpO1xyXG4gICAgICAgICAgICAgICAgJCgnI2RpYWxvZy1yZXNvdXJjZS10aXRsZSBzcGFuLmNvdW50ZXInKS5lbXB0eSgpLnRleHQoJygnICsgTWVkaWFfMS5NZWRpYS5jb3VudGVyICsgJyBhcHBlbHMgQVBJKScpO1xyXG4gICAgICAgICAgICAgICAgJGRpYWxvZy5zaG93KDQwMCwgb25TaG93KTtcclxuICAgICAgICAgICAgfSwgKGVycikgPT4ge1xyXG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uKCdFcnJldXIgZGUgcsOpY3Vww6lyYXRpb24gZGUgbGEgcmVzc291cmNlJywgJ2FkZEJ0bkRldjogJyArIGVycik7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoJy5kaWFsb2cgYnV0dG9uLmNsb3NlJykuY2xpY2soZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAkZGlhbG9nLmhpZGUoNDAwLCBvbkhpZGUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBDZXR0ZSBmb25jdGlvbiBwZXJtZXQgZGUgcmV0b3VybmVyIGxhIHJlc3NvdXJjZSBwcmluY2lwYWxlIHNvdXMgZm9ybWUgZCdvYmpldFxyXG4gICAgICogQHBhcmFtICB7Ym9vbGVhbn0gW25vY2FjaGU9ZmFsc2VdIEZsYWcgaW5kaXF1YW50IHNpIGlsIGZhdXQgdXRpbGlzZXIgbGVzIGRvbm7DqWVzIGVuIGNhY2hlXHJcbiAgICAgKiBAcGFyYW0gIHtudW1iZXJ9ICBbaWQ9bnVsbF0gICAgICAgSWRlbnRpZmlhbnQgZGUgbGEgcmVzc291cmNlXHJcbiAgICAgKiBAcmV0dXJuIHtQcm9taXNlPEJhc2U+fVxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBnZXRSZXNvdXJjZShub2NhY2hlID0gZmFsc2UsIGlkID0gbnVsbCkge1xyXG4gICAgICAgIGNvbnN0IHR5cGUgPSBnZXRBcGlSZXNvdXJjZShsb2NhdGlvbi5wYXRobmFtZS5zcGxpdCgnLycpWzFdKSwgLy8gSW5kaXF1ZSBkZSBxdWVsIHR5cGUgZGUgcmVzc291cmNlIGlsIHMnYWdpdFxyXG4gICAgICAgIGZvbmN0aW9uID0gdHlwZS5zaW5ndWxhciA9PT0gJ3Nob3cnIHx8IHR5cGUuc2luZ3VsYXIgPT09ICdlcGlzb2RlJyA/ICdkaXNwbGF5JyA6ICdtb3ZpZSc7IC8vIEluZGlxdWUgbGEgZm9uY3Rpb24gw6AgYXBwZWxlciBlbiBmb25jdGlvbiBkZSBsYSByZXNzb3VyY2VcclxuICAgICAgICBpZCA9IChpZCA9PT0gbnVsbCkgPyBnZXRSZXNvdXJjZUlkKCkgOiBpZDtcclxuICAgICAgICBpZiAoZGVidWcpXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdnZXRSZXNvdXJjZXtpZDogJWQsIG5vY2FjaGU6ICVzLCB0eXBlOiAlc30nLCBpZCwgKChub2NhY2hlKSA/ICd0cnVlJyA6ICdmYWxzZScpLCB0eXBlLnNpbmd1bGFyKTtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICBCYXNlXzEuQmFzZS5jYWxsQXBpKCdHRVQnLCB0eXBlLnBsdXJhbCwgZm9uY3Rpb24sIHsgJ2lkJzogaWQgfSwgbm9jYWNoZSlcclxuICAgICAgICAgICAgICAgIC50aGVuKGRhdGEgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShuZXcgdHlwZS5jbGFzcyhkYXRhW3R5cGUuc2luZ3VsYXJdKSk7XHJcbiAgICAgICAgICAgIH0sIGVyciA9PiB7XHJcbiAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIENldHRlIGZvbmN0aW9uIHBlcm1ldCBkZSByw6ljdXDDqXJlciBsZXMgZG9ubsOpZXMgQVBJIGRlIGxhIHJlc3NvdXJjZSBwcmluY2lwYWxlXHJcbiAgICAgKiBAcGFyYW0gIHtib29sZWFufSBbbm9jYWNoZT10cnVlXSAgRmxhZyBpbmRpcXVhbnQgc2kgaWwgZmF1dCB1dGlsaXNlciBsZXMgZG9ubsOpZXMgZW4gY2FjaGVcclxuICAgICAqIEBwYXJhbSAge251bWJlcn0gIFtpZD1udWxsXSAgICAgICBJZGVudGlmaWFudCBkZSBsYSByZXNzb3VyY2VcclxuICAgICAqIEByZXR1cm4ge1Byb21pc2U8T2JqZWN0Pn1cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gZ2V0UmVzb3VyY2VEYXRhKG5vY2FjaGUgPSB0cnVlLCBpZCA9IG51bGwpIHtcclxuICAgICAgICBjb25zdCB0eXBlID0gZ2V0QXBpUmVzb3VyY2UobG9jYXRpb24ucGF0aG5hbWUuc3BsaXQoJy8nKVsxXSksIC8vIEluZGlxdWUgZGUgcXVlbCB0eXBlIGRlIHJlc3NvdXJjZSBpbCBzJ2FnaXRcclxuICAgICAgICBmb25jdGlvbiA9IHR5cGUuc2luZ3VsYXIgPT0gJ3Nob3cnIHx8IHR5cGUuc2luZ3VsYXIgPT0gJ2VwaXNvZGUnID8gJ2Rpc3BsYXknIDogJ21vdmllJzsgLy8gSW5kaXF1ZSBsYSBmb25jdGlvbiDDoCBhcHBlbGVyIGVuIGZvbmN0aW9uIGRlIGxhIHJlc3NvdXJjZVxyXG4gICAgICAgIGlkID0gKGlkID09PSBudWxsKSA/IGdldFJlc291cmNlSWQoKSA6IGlkO1xyXG4gICAgICAgIGlmIChkZWJ1ZylcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ2dldFJlc291cmNlRGF0YXtpZDogJWQsIG5vY2FjaGU6ICVzLCB0eXBlOiAlc30nLCBpZCwgKChub2NhY2hlKSA/ICd0cnVlJyA6ICdmYWxzZScpLCB0eXBlLnNpbmd1bGFyKTtcclxuICAgICAgICByZXR1cm4gQmFzZV8xLkJhc2UuY2FsbEFwaSgnR0VUJywgdHlwZS5wbHVyYWwsIGZvbmN0aW9uLCB7ICdpZCc6IGlkIH0sIG5vY2FjaGUpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXRvdXJuZSBsYSByZXNzb3VyY2UgYXNzb2Npw6llIGF1IHR5cGUgZGUgcGFnZVxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSAge1N0cmluZ30gcGFnZVR5cGUgICAgTGUgdHlwZSBkZSBwYWdlIGNvbnN1bHTDqWVcclxuICAgICAqIEByZXR1cm4ge09iamVjdH0gUmV0b3VybmUgbGUgbm9tIGRlIGxhIHJlc3NvdXJjZSBBUEkgYXUgc2luZ3VsaWVyIGV0IGF1IHBsdXJpZWxcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gZ2V0QXBpUmVzb3VyY2UocGFnZVR5cGUpIHtcclxuICAgICAgICBsZXQgbWV0aG9kcyA9IHtcclxuICAgICAgICAgICAgJ3NlcmllJzogeyBzaW5ndWxhcjogJ3Nob3cnLCBwbHVyYWw6ICdzaG93cycsIFwiY2xhc3NcIjogU2hvd18xLlNob3cgfSxcclxuICAgICAgICAgICAgJ2ZpbG0nOiB7IHNpbmd1bGFyOiAnbW92aWUnLCBwbHVyYWw6ICdtb3ZpZXMnLCBcImNsYXNzXCI6IE1vdmllXzEuTW92aWUgfSxcclxuICAgICAgICAgICAgJ2VwaXNvZGUnOiB7IHNpbmd1bGFyOiAnZXBpc29kZScsIHBsdXJhbDogJ2VwaXNvZGVzJywgXCJjbGFzc1wiOiBFcGlzb2RlXzEuRXBpc29kZSB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICBpZiAocGFnZVR5cGUgaW4gbWV0aG9kcykge1xyXG4gICAgICAgICAgICByZXR1cm4gbWV0aG9kc1twYWdlVHlwZV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXRvdXJuZSBsJ2lkZW50aWZpYW50IGRlIGxhIHJlc3NvdXJjZSBkZSBsYSBwYWdlXHJcbiAgICAgKiBAcmV0dXJuIHtudW1iZXJ9IEwnaWRlbnRpZmlhbnQgZGUgbGEgcmVzc291cmNlXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGdldFJlc291cmNlSWQoKSB7XHJcbiAgICAgICAgY29uc3QgdHlwZSA9IGdldEFwaVJlc291cmNlKHVybC5zcGxpdCgnLycpWzFdKSwgLy8gTGUgdHlwZSBkZSByZXNzb3VyY2VcclxuICAgICAgICBlbHRBY3Rpb25zID0gJChgI3JlYWN0anMtJHt0eXBlLnNpbmd1bGFyfS1hY3Rpb25zYCk7IC8vIExlIG5vZXVkIGNvbnRlbmFudCBsJ0lEXHJcbiAgICAgICAgcmV0dXJuIChlbHRBY3Rpb25zLmxlbmd0aCA9PT0gMSkgPyBwYXJzZUludChlbHRBY3Rpb25zLmRhdGEoYCR7dHlwZS5zaW5ndWxhcn0taWRgKSwgMTApIDogMDtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogUmV0b3VybmUgbGVzIGluZm9zIGQndW4gbWVtYnJlXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9ICAgaWQgICAgSWRlbnRpZmlhbnQgZHUgbWVtYnJlIChwYXIgZMOpZmF1dDogbGUgbWVtYnJlIGNvbm5lY3TDqSlcclxuICAgICAqIEByZXR1cm4ge1Byb21pc2V9IExlIG1lbWJyZVxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBnZXRNZW1iZXIoaWQgPSBudWxsKSB7XHJcbiAgICAgICAgLy8gT24gdsOpcmlmaWUgcXVlIGwndXRpbGlzYXRldXIgZXN0IGNvbm5lY3TDqSBldCBxdWUgbGEgY2zDqSBkJ0FQSSBlc3QgcmVuc2VpZ27DqWVcclxuICAgICAgICBpZiAoIXVzZXJJZGVudGlmaWVkKCkgfHwgYmV0YXNlcmllc19hcGlfdXNlcl9rZXkgPT09ICcnKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgbGV0IGFyZ3MgPSB7fTtcclxuICAgICAgICBpZiAoaWQpXHJcbiAgICAgICAgICAgIGFyZ3MuaWQgPSBpZDtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcclxuICAgICAgICAgICAgQmFzZV8xLkJhc2UuY2FsbEFwaSgnR0VUJywgJ21lbWJlcnMnLCAnaW5mb3MnLCBhcmdzKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oZGF0YSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvLyBPbiByZXRvdXJuZSBsZXMgaW5mb3MgZHUgbWVtYnJlXHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKGRhdGEubWVtYmVyKTtcclxuICAgICAgICAgICAgfSwgKGVycikgPT4ge1xyXG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uKCdFcnJldXIgZGUgcsOpY3Vww6lyYXRpb24gZFxcJ3VuIG1lbWJyZScsICdnZXRNZW1iZXI6ICcgKyBlcnIpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogQ29tcGFyZSBsZSBtZW1icmUgY291cmFudCBhdmVjIHVuIGF1dHJlIG1lbWJyZVxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBjb21wYXJlTWVtYmVycygpIHtcclxuICAgICAgICBsZXQgaWQgPSBwYXJzZUludCgkKCcjdGVtcHMnKS5kYXRhKCdsb2dpbmlkJyksIDEwKTtcclxuICAgICAgICBnZXRNZW1iZXIoaWQpLlxyXG4gICAgICAgICAgICB0aGVuKGZ1bmN0aW9uIChtZW1iZXIpIHtcclxuICAgICAgICAgICAgbGV0IG90aGVyTWVtYmVyID0gbWVtYmVyO1xyXG4gICAgICAgICAgICBjb25zdCBkaWFsb2dIVE1MID0gYFxyXG4gICAgICAgICAgICAgICAgPGRpdlxyXG4gICAgICAgICAgICAgICAgICBjbGFzcz1cImRpYWxvZyBkaWFsb2ctY29udGFpbmVyIHRhYmxlLWRhcmtcIlxyXG4gICAgICAgICAgICAgICAgICBpZD1cImRpYWxvZy1jb21wYXJlXCJcclxuICAgICAgICAgICAgICAgICAgYXJpYS1oaWRkZW49XCJ0cnVlXCJcclxuICAgICAgICAgICAgICAgICAgYXJpYS1sYWJlbGxlZGJ5PVwiZGlhbG9nLWNvbXBhcmUtdGl0bGVcIlxyXG4gICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGlhbG9nLW92ZXJsYXlcIiBkYXRhLWExMXktZGlhbG9nLWhpZGU+PC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkaWFsb2ctY29udGVudFwiIHJvbGU9XCJkb2N1bWVudFwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxidXR0b25cclxuICAgICAgICAgICAgICAgICAgICAgIGRhdGEtYTExeS1kaWFsb2ctaGlkZVxyXG4gICAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJkaWFsb2ctY2xvc2VcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgYXJpYS1sYWJlbD1cIkZlcm1lciBjZXR0ZSBib8OudGUgZGUgZGlhbG9ndWVcIlxyXG4gICAgICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAgICAgIDxpIGNsYXNzPVwiZmEgZmEtdGltZXNcIiBhcmlhLWhpZGRlbj1cInRydWVcIj48L2k+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIDxoMSBpZD1cImRpYWxvZy1jb21wYXJlLXRpdGxlXCI+Q29tcGFyYWlzb24gZGVzIG1lbWJyZXM8L2gxPlxyXG5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGlkPVwiY29tcGFyZVwiIGNsYXNzPVwidGFibGUtcmVzcG9uc2l2ZS1sZ1wiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPHRhYmxlIGNsYXNzPVwidGFibGUgdGFibGUtZGFyayB0YWJsZS1zdHJpcGVkXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDx0aGVhZD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICA8dHI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGggc2NvcGU9XCJjb2xcIiBjbGFzcz1cImNvbC1sZy01XCI+SW5mb3M8L3RoPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRoIHNjb3BlPVwiY29sXCIgY2xhc3M9XCJjb2wtbGctM1wiPlZvdXM8L3RoPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRoIHNjb3BlPVwiY29sXCIgY2xhc3M9XCJvdGhlci11c2VyIGNvbC1sZy0zXCI+PC90aD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RyPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L3RoZWFkPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8dGJvZHk+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdGJvZHk+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8L3RhYmxlPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDwvZGl2PmAsIHRyYWRzID0ge1xyXG4gICAgICAgICAgICAgICAgXCJpZFwiOiAnSUQnLFxyXG4gICAgICAgICAgICAgICAgXCJsb2dpblwiOiBcIkxvZ2luXCIsXHJcbiAgICAgICAgICAgICAgICBcInhwXCI6ICdQdHMgZFxcJ2V4cMOpcmllbmNlJyxcclxuICAgICAgICAgICAgICAgIFwic3Vic2NyaXB0aW9uXCI6ICdBbm7DqWUgZFxcJ2luc2NyaXB0aW9uJyxcclxuICAgICAgICAgICAgICAgIHN0YXRzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJmcmllbmRzXCI6ICdBbWlzJyxcclxuICAgICAgICAgICAgICAgICAgICBcInNob3dzXCI6ICdTw6lyaWVzJyxcclxuICAgICAgICAgICAgICAgICAgICBcInNlYXNvbnNcIjogJ1NhaXNvbnMnLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiZXBpc29kZXNcIjogJ0VwaXNvZGVzJyxcclxuICAgICAgICAgICAgICAgICAgICBcImNvbW1lbnRzXCI6ICdDb21tZW50YWlyZXMnLFxyXG4gICAgICAgICAgICAgICAgICAgIFwicHJvZ3Jlc3NcIjogJ1Byb2dyZXNzaW9uIGRlIHZpc2lvbm5hZ2UnLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiZXBpc29kZXNfdG9fd2F0Y2hcIjogJ05iIGRcXCfDqXBpc29kZXMgw6AgcmVnYXJkZXInLFxyXG4gICAgICAgICAgICAgICAgICAgIFwidGltZV9vbl90dlwiOiAnVGVtcHMgZGV2YW50IGxhIFRWJyxcclxuICAgICAgICAgICAgICAgICAgICBcInRpbWVfdG9fc3BlbmRcIjogJ1RlbXBzIHJlc3RhbnQgZGV2YW50IGRlcyBzw6lyaWVzIMOgIHJlZ2FyZGVyJyxcclxuICAgICAgICAgICAgICAgICAgICBcIm1vdmllc1wiOiAnTmIgZGUgZmlsbXMnLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiYmFkZ2VzXCI6ICdOYiBkZSBiYWRnZXMnLFxyXG4gICAgICAgICAgICAgICAgICAgIFwibWVtYmVyX3NpbmNlX2RheXNcIjogJ01lbWJyZSBkZXB1aXMgKGpvdXJzKScsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJmcmllbmRzX29mX2ZyaWVuZHNcIjogJ0xlcyBhbWlzIGR1IHLDqXNlYXUgw6l0ZW5kdScsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJlcGlzb2Rlc19wZXJfbW9udGhcIjogJ05iIGRcXCfDqXBpc29kZXMgcGFyIG1vaXMnLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiZmF2b3JpdGVfZGF5XCI6ICdKb3VyIGZhdm9yaScsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJmaXZlX3N0YXJzX3BlcmNlbnRcIjogJyUgZGUgdm90ZXMgNSDDqXRvaWxlcycsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJmb3VyLWZpdmVfc3RhcnNfdG90YWxcIjogJ05iIGRlIHZvdGVzIDQgb3UgNSDDqXRvaWxlcycsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJzdHJlYWtfZGF5c1wiOiAnTmIgZGUgam91cnMgY29uc8OpY3V0aWZzIMOgIHJlZ2FyZGVyIGRlcyDDqXBpc29kZXMnLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiZmF2b3JpdGVfZ2VucmVcIjogJ0dlbnJlIGZhdm9yaScsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJ3cml0dGVuX3dvcmRzXCI6ICdOYiBkZSBtb3RzIMOpY3JpdHMgc3VyIEJldGFTZXJpZXMnLFxyXG4gICAgICAgICAgICAgICAgICAgIFwid2l0aG91dF9kYXlzXCI6ICdOYiBqb3VycyBkXFwnYWJzdGluZW5jZScsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJzaG93c19maW5pc2hlZFwiOiAnTmIgZGUgc8OpcmllcyB0ZXJtaW7DqWVzJyxcclxuICAgICAgICAgICAgICAgICAgICBcInNob3dzX2N1cnJlbnRcIjogJ05iIGRlIHPDqXJpZXMgZW4gY291cnMnLFxyXG4gICAgICAgICAgICAgICAgICAgIFwic2hvd3NfdG9fd2F0Y2hcIjogJ05iIGRlIHPDqXJpZXMgw6Agdm9pcicsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJzaG93c19hYmFuZG9uZWRcIjogJ05iIGRlIHPDqXJpZXMgYWJhbmRvbm7DqWVzJyxcclxuICAgICAgICAgICAgICAgICAgICBcIm1vdmllc190b193YXRjaFwiOiAnTmIgZGUgZmlsbXMgw6Agdm9pcicsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJ0aW1lX29uX21vdmllc1wiOiAnVGVtcHMgZGV2YW50IGxlcyBmaWxtcycsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJ0aW1lX3RvX3NwZW5kX21vdmllc1wiOiAnVGVtcHMgcmVzdGFudCBkZXZhbnQgbGVzIGZpbG1zIMOgIHJlZ2FyZGVyJ1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBhZGRTY3JpcHRBbmRMaW5rKCd0YWJsZWNzcycpO1xyXG4gICAgICAgICAgICAkKCdib2R5JykuYXBwZW5kKGRpYWxvZ0hUTUwpO1xyXG4gICAgICAgICAgICAvL2lmIChkZWJ1ZykgY29uc29sZS5sb2coY3VycmVudFVzZXIsIG90aGVyTWVtYmVyLCB0cmFkcyk7XHJcbiAgICAgICAgICAgIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKHRyYWRzKSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgW3N1YmtleSwgc3VidmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKHRyYWRzW2tleV0pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICgvdGltZS8udGVzdChzdWJrZXkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50VXNlcltrZXldW3N1YmtleV0gPSBodW1hbml6ZUR1cmF0aW9uKChjdXJyZW50VXNlcltrZXldW3N1YmtleV0gKiA2MCAqIDEwMDApLCB7IGxhbmd1YWdlOiBjdXJyZW50VXNlci5sb2NhbGUgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdGhlck1lbWJlcltrZXldW3N1YmtleV0gPSBodW1hbml6ZUR1cmF0aW9uKChvdGhlck1lbWJlcltrZXldW3N1YmtleV0gKiA2MCAqIDEwMDApLCB7IGxhbmd1YWdlOiBjdXJyZW50VXNlci5sb2NhbGUgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnI2RpYWxvZy1jb21wYXJlIHRhYmxlIHRib2R5JykuYXBwZW5kKCc8dHI+PHRkPicgKyBzdWJ2YWx1ZSArICc8L3RkPjx0ZD4nICsgY3VycmVudFVzZXJba2V5XVtzdWJrZXldICsgJzwvdGQ+PHRkPicgKyBvdGhlck1lbWJlcltrZXldW3N1YmtleV0gKyAnPC90ZD48L3RyPicpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICQoJyNkaWFsb2ctY29tcGFyZSB0YWJsZSB0Ym9keScpLmFwcGVuZCgnPHRyPjx0ZD4nICsgdmFsdWUgKyAnPC90ZD48dGQ+JyArIGN1cnJlbnRVc2VyW2tleV0gKyAnPC90ZD48dGQ+JyArIG90aGVyTWVtYmVyW2tleV0gKyAnPC90ZD48L3RyPicpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICQoJy5vdGhlci11c2VyJykuYXBwZW5kKG90aGVyTWVtYmVyLmxvZ2luKTtcclxuICAgICAgICAgICAgY29uc3QgZGlhbG9nID0gbmV3IEExMXlEaWFsb2coZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2RpYWxvZy1jb21wYXJlJykpLCBodG1sID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xyXG4gICAgICAgICAgICAkKCcjc3RhdHNfY29udGFpbmVyIGgxJylcclxuICAgICAgICAgICAgICAgIC5jc3MoJ2Rpc3BsYXknLCAnaW5saW5lLWJsb2NrJylcclxuICAgICAgICAgICAgICAgIC5hZnRlcignPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidXR0b24gYmx1ZVwiIGRhdGEtYTExeS1kaWFsb2ctc2hvdz1cImRpYWxvZy1jb21wYXJlXCI+U2UgY29tcGFyZXIgw6AgY2UgbWVtYnJlPC9idXR0b24+Jyk7XHJcbiAgICAgICAgICAgICQoJ2J1dHRvbi5idXR0b24uYmx1ZScpLmNsaWNrKGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgZGlhbG9nLnNob3coKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGRpYWxvZ1xyXG4gICAgICAgICAgICAgICAgLm9uKCdzaG93JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgaHRtbC5zdHlsZS5vdmVyZmxvd1kgPSAnaGlkZGVuJztcclxuICAgICAgICAgICAgICAgICQoJyNkaWFsb2ctY29tcGFyZScpLmNzcygnei1pbmRleCcsICcxMDA1JykuY3NzKCdvdmVyZmxvdycsICdzY3JvbGwnKTtcclxuICAgICAgICAgICAgICAgICQoJy5kaWFsb2ctY2xvc2UnKS5jbGljayhmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGRpYWxvZy5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5vbignaGlkZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGh0bWwuc3R5bGUub3ZlcmZsb3dZID0gJyc7XHJcbiAgICAgICAgICAgICAgICAkKCcjZGlhbG9nLWNvbXBhcmUnKS5jc3MoJ3otaW5kZXgnLCAnMCcpLmNzcygnb3ZlcmZsb3cnLCAnbm9uZScpO1xyXG4gICAgICAgICAgICAgICAgJCgnLmRpYWxvZy1jbG9zZScpLm9mZignY2xpY2snKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIEFqb3V0ZSB1biBjaGFtcCBkZSByZWNoZXJjaGUgc3VyIGxhIHBhZ2UgZGVzIGFtaXMgZCd1biBtZW1icmVcclxuICAgICAqIEByZXR1cm4ge3ZvaWR9XHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIHNlYXJjaEZyaWVuZHMoKSB7XHJcbiAgICAgICAgLy8gQWpvdXRlciB1biBjaGFtcCBkZSByZWNoZXJjaGVcclxuICAgICAgICAkKCcubWFpbmNvbnRlbnQgaDEnKS5hcHBlbmQoJzxpbnB1dCBpZD1cInNlYXJjaEZyaWVuZHNcIiBwbGFjZWhvbGRlcj1cIlJlY2hlcmNoZSBkXFwnYW1pc1wiIGxpc3Q9XCJmcmllbmRzZGF0YVwiIGF1dG9jb21wbGV0ZT1cIm9mZlwiLz4nICtcclxuICAgICAgICAgICAgJzxpIGNsYXNzPVwiZmEgZmEtdGltZXMgY2xlYXJTZWFyY2hcIiBhcmlhLWhpZGRlbj1cInRydWVcIiBzdHlsZT1cImRpc3BsYXk6bm9uZTtcIiB0aXRsZT1cIkVmZmFjZXIgbGEgcmVjaGVyY2hlXCI+PC9pPicpO1xyXG4gICAgICAgIC8vIFJlY3VwZXJlciBsZXMgaWRlbnRpZmlhbnRzIGV0IGxpZW5zIGRlcyBtZW1icmVzXHJcbiAgICAgICAgbGV0ICRsaW5rcyA9ICQoJy50aW1lbGluZS1pdGVtIC5pbmZvcyBhJyksIG9iakZyaWVuZHMgPSB7fSwgaWRGcmllbmRzID0gW10sIGRhdGFsaXN0ID0gJzxkYXRhbGlzdCBpZD1cImZyaWVuZHNkYXRhXCI+JztcclxuICAgICAgICAvLyBPbiByZWN1cGVyZSBsZXMgaW5mb3MgZGVzIGFtaXNcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8ICRsaW5rcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgZWx0ID0gJCgkbGlua3MuZ2V0KGkpKSwgdGV4dCA9IGVsdC50ZXh0KCkudHJpbSgpO1xyXG4gICAgICAgICAgICBvYmpGcmllbmRzW3RleHQudG9Mb3dlckNhc2UoKV0gPSB7IGxpbms6IGVsdC5hdHRyKCdocmVmJyksIG5hbWU6IHRleHQgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gT24gc3RvY2tlIGxlcyBpZGVudGlmaWFudHMgZGFucyB1biB0YWJsZWF1IHF1ZSBsJ29uIHRyaVxyXG4gICAgICAgIGlkRnJpZW5kcyA9IE9iamVjdC5rZXlzKG9iakZyaWVuZHMpO1xyXG4gICAgICAgIGlkRnJpZW5kcy5zb3J0KCk7XHJcbiAgICAgICAgLy8gT24gYnVpbGQgbGEgbGlzdGUgZGVzIGFtaXMgcG91ciBhbGltZW50ZXIgbGUgY2hhbXAgZGUgcmVjaGVyY2hlXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpZEZyaWVuZHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgZGF0YWxpc3QgKz0gJzxvcHRpb24gdmFsdWU9XCInICsgb2JqRnJpZW5kc1tpZEZyaWVuZHNbaV1dLm5hbWUgKyAnXCIvPic7XHJcbiAgICAgICAgfVxyXG4gICAgICAgICQoJy5tYWluY29udGVudCcpLmFwcGVuZChkYXRhbGlzdCArICc8L2RhdGFsaXN0PicpO1xyXG4gICAgICAgIC8vIE9uIGFmZmljaGUgdG91dGUgbGEgbGlzdGUgZGVzIGFtaXNcclxuICAgICAgICB2aWV3TW9yZUZyaWVuZHMoKTtcclxuICAgICAgICBjb25zdCAkaW5wU2VhcmNoRnJpZW5kcyA9ICQoJyNzZWFyY2hGcmllbmRzJyk7XHJcbiAgICAgICAgJGlucFNlYXJjaEZyaWVuZHMub24oJ2tleXByZXNzJywgKCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoJGlucFNlYXJjaEZyaWVuZHMudmFsKCkudG9TdHJpbmcoKS50cmltKCkubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgJCgnLmNsZWFyU2VhcmNoJykuc2hvdygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJGlucFNlYXJjaEZyaWVuZHMub24oJ2lucHV0JywgKCkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgdmFsID0gJGlucFNlYXJjaEZyaWVuZHMudmFsKCkudG9TdHJpbmcoKS50cmltKCkudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICAgICAgaWYgKGRlYnVnKVxyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1NlYXJjaCBGcmllbmRzOiAnICsgdmFsLCBpZEZyaWVuZHMuaW5kZXhPZih2YWwpLCBvYmpGcmllbmRzW3ZhbF0pO1xyXG4gICAgICAgICAgICBpZiAodmFsID09PSAnJyB8fCBpZEZyaWVuZHMuaW5kZXhPZih2YWwpID09PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgJCgnLnRpbWVsaW5lLWl0ZW0nKS5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICBpZiAodmFsID09PSAnJykge1xyXG4gICAgICAgICAgICAgICAgICAgICQoJy5jbGVhclNlYXJjaCcpLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAkKCcuY2xlYXJTZWFyY2gnKS5zaG93KCk7XHJcbiAgICAgICAgICAgICQoJy50aW1lbGluZS1pdGVtJykuaGlkZSgpO1xyXG4gICAgICAgICAgICBpZiAoZGVidWcpXHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnSXRlbTogJywgJCgnLnRpbWVsaW5lLWl0ZW0gLmluZm9zIGFbaHJlZj1cIicgKyBvYmpGcmllbmRzW3ZhbF0ubGluayArICdcIl0nKSk7XHJcbiAgICAgICAgICAgICQoJy50aW1lbGluZS1pdGVtIC5pbmZvcyBhW2hyZWY9XCInICsgb2JqRnJpZW5kc1t2YWxdLmxpbmsgKyAnXCJdJykucGFyZW50cygnLnRpbWVsaW5lLWl0ZW0nKS5zaG93KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnLmNsZWFyU2VhcmNoJykuY2xpY2soKCkgPT4ge1xyXG4gICAgICAgICAgICAkKCcjc2VhcmNoRnJpZW5kcycpLnZhbCgnJyk7XHJcbiAgICAgICAgICAgICQoJy50aW1lbGluZS1pdGVtJykuc2hvdygpO1xyXG4gICAgICAgICAgICAkKCcuY2xlYXJTZWFyY2gnKS5oaWRlKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIE1hc3F1ZSBsZXMgcHVic1xyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiByZW1vdmVBZHMoKSB7XHJcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICQoJ3NjcmlwdFtzcmMqPVwic2VjdXJlcHViYWRzXCJdJykucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICQoJ3NjcmlwdFtzcmMqPVwic3RhdGljLW9kLmNvbVwiXScpLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAkKCdzY3JpcHRbc3JjKj1cImFkLmRvdWJsZWNsaWNrLm5ldFwiXScpLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAkKCdzY3JpcHRbc3JjKj1cInNkZGFuLmNvbVwiXScpLnJlbW92ZSgpO1xyXG4gICAgICAgIH0sIDUwMCk7XHJcbiAgICAgICAgJCgnLnBhcmVudC1hZC1kZXNrdG9wJykuYXR0cignc3R5bGUnLCAnZGlzcGxheTogbm9uZSAhaW1wb3J0YW50Jyk7XHJcbiAgICAgICAgc2V0SW50ZXJ2YWwoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBsZXQgJGZyYW1lO1xyXG4gICAgICAgICAgICAkKCdpZnJhbWVbbmFtZSE9XCJ1c2Vyc2NyaXB0XCJdJykuZWFjaCgoaSwgZWx0KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAkZnJhbWUgPSAkKGVsdCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoISRmcmFtZS5oYXNDbGFzcygnZW1iZWQtcmVzcG9uc2l2ZS1pdGVtJykpIHtcclxuICAgICAgICAgICAgICAgICAgICAkZnJhbWUucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0sIDEwMDApO1xyXG4gICAgICAgICQoJy5ibG9ja1BhcnRuZXInKS5hdHRyKCdzdHlsZScsICdkaXNwbGF5OiBub25lICFpbXBvcnRhbnQnKTtcclxuICAgICAgICAvLyQoJy5icmVhZGNydW1iJykuaGlkZSgpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBBbcOpbGlvcmUgbCdhZmZpY2hhZ2UgZGUgbGEgZGVzY3JpcHRpb24gZGUgbGEgcmVzc291cmNlXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybiB7dm9pZH1cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gdXBncmFkZVN5bm9wc2lzKCkge1xyXG4gICAgICAgIGxldCAkc3BhbiA9ICQoJy5ibG9ja0luZm9ybWF0aW9uc19fc3lub3BzaXMgc3BhbicpLCAkYnRuTW9yZSA9ICQoJ2EuanMtc2hvdy1mdWxsdGV4dCcpO1xyXG4gICAgICAgIGlmICgkYnRuTW9yZS5sZW5ndGggPD0gMCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIE9uIGFqb3V0ZSBsZSBib3V0b24gTW9pbnMgZXQgc29uIGV2ZW50IGNsaWNrXHJcbiAgICAgICAgJHNwYW4uYXBwZW5kKCc8YnV0dG9uIHJvbGU9XCJidXR0b25cIiBjbGFzcz1cInUtY29sb3JXaGl0ZU9wYWNpdHkwNSBqcy1zaG93LXRydW5jYXRldGV4dCB0ZXh0VHJhbnNmb3JtVXBwZXJDYXNlIGN1cnNvclBvaW50ZXJcIj48L2J1dHRvbj4nKTtcclxuICAgICAgICBjb25zdCAkYnRuTGVzcyA9ICQoJ2J1dHRvbi5qcy1zaG93LXRydW5jYXRldGV4dCcpO1xyXG4gICAgICAgICRidG5MZXNzLmNsaWNrKChlKSA9PiB7XHJcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgaWYgKCRzcGFuLmhhc0NsYXNzKCdzci1vbmx5JykpXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIC8vIFRvZ2dsZSBkaXNwbGF5IHN5bm9wc2lzXHJcbiAgICAgICAgICAgICRidG5Nb3JlLnNob3coKTtcclxuICAgICAgICAgICAgJHNwYW4uYWRkQ2xhc3MoJ3NyLW9ubHknKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAvLyBPbiByZW1wbGFjZSBsZSBsaWVuIFBsdXMgcGFyIHVuIGJvdXRvblxyXG4gICAgICAgICRidG5Nb3JlLnJlcGxhY2VXaXRoKCc8YnV0dG9uIHJvbGU9XCJidXR0b25cIiBjbGFzcz1cInUtY29sb3JXaGl0ZU9wYWNpdHkwNSBqcy1zaG93LWZ1bGx0ZXh0IHRleHRUcmFuc2Zvcm1VcHBlckNhc2UgY3Vyc29yUG9pbnRlclwiPjwvYnV0dG9uPicpO1xyXG4gICAgICAgICRidG5Nb3JlID0gJCgnYnV0dG9uLmpzLXNob3ctZnVsbHRleHQnKTtcclxuICAgICAgICAkYnRuTW9yZS5vbignY2xpY2snLCAoZSkgPT4ge1xyXG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIGlmICghJHNwYW4uaGFzQ2xhc3MoJ3NyLW9ubHknKSlcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgJGJ0bk1vcmUuaGlkZSgpO1xyXG4gICAgICAgICAgICAkc3Bhbi5yZW1vdmVDbGFzcygnc3Itb25seScpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBQYXRpZW50ZSBsZSB0ZW1wcyBkdSBjaGFyZ21lbnQgZGVzIHNhaXNvbnMgZXQgZGVzIMOpcGlzb2Rlc1xyXG4gICAgICogQHBhcmFtICB7RnVuY3Rpb259IGNiIEZvbmN0aW9uIGRlIGNhbGxiYWNrIGVuIGNhcyBkZSBzdWNjZXNzXHJcbiAgICAgKiBAcGFyYW0gIHtGdW5jdGlvbn0gY2IgRm9uY3Rpb24gZGUgY2FsbGJhY2sgZW4gY2FzIGQnZXJyb3JcclxuICAgICAqIEByZXR1cm4ge3ZvaWR9XHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIHdhaXRTZWFzb25zQW5kRXBpc29kZXNMb2FkZWQoc3VjY2Vzc0NiLCBlcnJvckNiID0gQmFzZV8xLkJhc2Uubm9vcCkge1xyXG4gICAgICAgIGxldCB3YWl0RXBpc29kZXMgPSAwO1xyXG4gICAgICAgIC8vIE9uIGFqb3V0ZSB1biB0aW1lciBpbnRlcnZhbCBlbiBhdHRlbmRhbnQgcXVlIGxlcyBzYWlzb25zIGV0IGxlcyDDqXBpc29kZXMgc29pZW50IGNoYXJnw6lzXHJcbiAgICAgICAgdGltZXIgPSBzZXRJbnRlcnZhbChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIC8vIE9uIMOpdml0ZSB1bmUgYm91Y2xlIGluZmluaWVcclxuICAgICAgICAgICAgaWYgKCsrd2FpdEVwaXNvZGVzID49IDEwMCkge1xyXG4gICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCh0aW1lcik7XHJcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb24oJ1dhaXQgRXBpc29kZXMgTGlzdCcsICdMZXMgdmlnbmV0dGVzIGRlcyBzYWlzb25zIGV0IGRlcyDDqXBpc29kZXMgblxcJ29udCBwYXMgw6l0w6kgdHJvdXbDqWVzLicpO1xyXG4gICAgICAgICAgICAgICAgZXJyb3JDYigndGltZW91dCcpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxldCBsZW4gPSBwYXJzZUludCgkKCcjc2Vhc29ucyAuc2xpZGUtLWN1cnJlbnQgLnNsaWRlX19pbmZvcycpLnRleHQoKSwgMTApLCAkZXBpc29kZXMgPSAkKCcjZXBpc29kZXMgLnNsaWRlX2ZsZXgnKTtcclxuICAgICAgICAgICAgLy8gT24gdsOpcmlmaWUgcXVlIGxlcyBzYWlzb25zIGV0IGxlcyBlcGlzb2RlcyBzb2llbnQgY2hhcmfDqXMgc3VyIGxhIHBhZ2VcclxuICAgICAgICAgICAgaWYgKCRlcGlzb2Rlcy5sZW5ndGggPD0gMCB8fCAkZXBpc29kZXMubGVuZ3RoIDwgbGVuKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGVidWcpXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3dhaXRTZWFzb25zQW5kRXBpc29kZXNMb2FkZWQ6IEVuIGF0dGVudGUgZHUgY2hhcmdlbWVudCBkZXMgdmlnbmV0dGVzJyk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGRlYnVnKVxyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3dhaXRTZWFzb25zQW5kRXBpc29kZXNMb2FkZWQsIG5iVmlnbmV0dGVzICglZCwgJWQpJywgJGVwaXNvZGVzLmxlbmd0aCwgbGVuKTtcclxuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCh0aW1lcik7XHJcbiAgICAgICAgICAgIHN1Y2Nlc3NDYigpO1xyXG4gICAgICAgIH0sIDUwMCk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIEfDqHJlIGxhIG1pc2Ugw6Agam91ciBhdXRvIGRlcyDDqXBpc29kZXMgZGUgbGEgc2Fpc29uIGNvdXJhbnRlXHJcbiAgICAgKiBAcGFyYW0gIHtTaG93fSBzaG93IEwnb2JqZXQgZGUgdHlwZSBTaG93XHJcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiB1cGRhdGVBdXRvRXBpc29kZUxpc3Qoc2hvdykge1xyXG4gICAgICAgIGxldCBvYmpVcEF1dG8gPSBVcGRhdGVBdXRvXzEuVXBkYXRlQXV0by5nZXRJbnN0YW5jZShzaG93KTtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBGb25jdGlvbiByZXRvdXJuYW50IGxlIGNvbnRlbnUgZGUgbGEgUG9wdXAgZGVzIG9wdGlvbnMgdXBkYXRlXHJcbiAgICAgICAgICogZGUgbGEgbGlzdGUgZGVzIMOpcGlzb2Rlc1xyXG4gICAgICAgICAqIEByZXR1cm4ge1N0cmluZ30gQ29udGVudSBIVE1MIGRlIGxhIFBvcFVwIGRlcyBvcHRpb25zIHVwZGF0ZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGNvbnN0IGNvbnRlbnRVcCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgY29uc3QgaW50ZXJ2YWxzID0gVXBkYXRlQXV0b18xLlVwZGF0ZUF1dG8uaW50ZXJ2YWxzO1xyXG4gICAgICAgICAgICBsZXQgY29udGVudFVwZGF0ZSA9IGBcclxuICAgICAgICAgICAgICAgICAgICA8c3R5bGU+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hbGVydCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IHJlbGF0aXZlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6IDAuNzVyZW0gMS4yNXJlbTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBtYXJnaW4tYm90dG9tOiAxcmVtO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlcjogMXB4IHNvbGlkIHRyYW5zcGFyZW50O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDAuMjVyZW07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgLmFsZXJ0LWluZm8ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yOiAjMGM1NDYwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQtY29sb3I6ICNkMWVjZjE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyLWNvbG9yOiAjYmVlNWViO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hbGVydC13YXJuaW5nIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xvcjogIzg1NjQwNDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmM2NkO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlci1jb2xvcjogI2ZmZWViYTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIDwvc3R5bGU+XHJcbiAgICAgICAgICAgICAgICAgICAgPGZvcm0gaWQ9XCJvcHRpb25zVXBkYXRlRXBpc29kZUxpc3RcIj5cclxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmb3JtLWdyb3VwIGZvcm0tY2hlY2tcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJjaGVja2JveFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzcz1cImZvcm0tY2hlY2staW5wdXRcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ9XCJ1cGRhdGVFcGlzb2RlTGlzdEF1dG9cIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHtvYmpVcEF1dG8uYXV0byA/ICcgY2hlY2tlZD1cInRydWVcIicgOiAnJ31cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICR7IXNob3cuaW5fYWNjb3VudCA/ICcgZGlzYWJsZWQ9XCJ0cnVlXCInIDogJyd9PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3M9XCJmb3JtLWNoZWNrLWxhYmVsXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvcj1cInVwZGF0ZUVwaXNvZGVMaXN0QXV0b1wiPkFjdGl2ZXIgbGEgbWlzZSDDoCBqb3VyIGF1dG8gZGVzIMOpcGlzb2RlczwvbGFiZWw+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmb3JtLWdyb3VwXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbCBmb3I9XCJ1cGRhdGVFcGlzb2RlTGlzdFRpbWVcIj5GcsOpcXVlbmNlIGRlIG1pc2Ugw6Agam91cjwvbGFiZWw+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxzZWxlY3QgY2xhc3M9XCJmb3JtLWNvbnRyb2xcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkPVwidXBkYXRlRXBpc29kZUxpc3RUaW1lXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkeyFzaG93LmluX2FjY291bnQgPyAnIGRpc2FibGVkPVwidHJ1ZVwiJyA6ICcnfT5gO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGludGVydmFscy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgY29udGVudFVwZGF0ZSArPSBgPG9wdGlvbiB2YWx1ZT1cIiR7aW50ZXJ2YWxzW2ldLnZhbH1cIlxyXG4gICAgICAgICAgICAgICAgICAgICR7b2JqVXBBdXRvLmludGVydmFsID09PSBpbnRlcnZhbHNbaV0udmFsID8gJ3NlbGVjdGVkPVwidHJ1ZVwiJyA6ICcnfT5cclxuICAgICAgICAgICAgICAgICAgICAke2ludGVydmFsc1tpXS5sYWJlbH08L29wdGlvbj5gO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnRlbnRVcGRhdGUgKz0gYDwvc2VsZWN0PjwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICR7IXNob3cuaW5fYWNjb3VudCA/ICc8ZGl2IGNsYXNzPVwiZm9ybS1ncm91cFwiPjxwIGNsYXNzPVwiYWxlcnQgYWxlcnQtd2FybmluZ1wiPlZldWlsbGV6IGFqb3V0ZXIgbGEgc8OpcmllIGF2YW50IGRlIHBvdXZvaXIgYWN0aXZlciBjZXR0ZSBmb25jdGlvbm5hbGl0w6kuPC9wPjwvZGl2PicgOiAnJ31cclxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJzdWJtaXRcIiBjbGFzcz1cImJ0biBidG4tcHJpbWFyeVwiJHshc2hvdy5pbl9hY2NvdW50ID8gJyBkaXNhYmxlZD1cInRydWVcIicgOiAnJ30+U2F1dmVyPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJjbG9zZSBidG4gYnRuLWRhbmdlclwiPkFubnVsZXI8L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgIDwvZm9ybT5gO1xyXG4gICAgICAgICAgICByZXR1cm4gY29udGVudFVwZGF0ZTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEZvbmN0aW9uIHJldG91cm5hbnQgbGUgdGl0cmUgZGUgbGEgUG9wdXAgZGVzIG9wdGlvbnMgcG91ciBsJ3VwZGF0ZVxyXG4gICAgICAgICAqIGRlIGxhIGxpc3RlIGRlcyDDqXBpc29kZXMgZGUgbGEgc2Fpc29uIGNvdXJhbnRlXHJcbiAgICAgICAgICogQHBhcmFtICB7VXBkYXRlQXV0b30gb2JqVXBBdXRvXHJcbiAgICAgICAgICogQHJldHVybiB7U3RyaW5nfSBDb250ZW51IEhUTUwgZHUgdGl0cmUgZGUgbGEgUG9wVXAgZGVzIG9wdGlvbnMgdXBkYXRlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgY29uc3QgdGl0bGVQb3B1cCA9IGZ1bmN0aW9uIChvYmpVcEF1dG8pIHtcclxuICAgICAgICAgICAgY29uc3QgY2xhc3NOYW1lID0gKG9ialVwQXV0byAmJiBvYmpVcEF1dG8uc3RhdHVzKSA/ICdzdWNjZXNzJyA6ICdzZWNvbmRhcnknLCBsYWJlbCA9IChvYmpVcEF1dG8gJiYgb2JqVXBBdXRvLnN0YXR1cykgPyAncnVubmluZycgOiAnbm90IHJ1bm5pbmcnLCBoZWxwID0gXCJDZXR0ZSBmb25jdGlvbm5hbGl0w6kgcGVybWV0IGRlIG1ldHRyZSDDoCBqb3VyIGxlcyDDqXBpc29kZXMgZGUgbGEgc2Fpc29uIGNvdXJhbnRlLCDDoCB1bmUgZnLDqXF1ZW5jZSBjaG9pc2llLlwiO1xyXG4gICAgICAgICAgICByZXR1cm4gYDxzdHlsZT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLm9wdGlvbnNVcEF1dG8gLmNsb3NlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJpZ2h0OiA1cHg7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBib3JkZXI6IG5vbmU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiB0cmFuc3BhcmVudDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnQtc2l6ZTogMS41ZW07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b3A6IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgLm9wdGlvbnNVcEF1dG8gLmNsb3NlOmhvdmVyIHtib3JkZXI6IG5vbmU7b3V0bGluZTogbm9uZTt9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5vcHRpb25zVXBBdXRvIC5jbG9zZTpmb2N1cyB7Ym9yZGVyOiBub25lO291dGxpbmU6IG5vbmU7fVxyXG4gICAgICAgICAgICAgICAgICAgIDwvc3R5bGU+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm9wdGlvbnNVcEF1dG9cIiBzdHlsZT1cImNvbG9yOiMwMDA7XCI+T3B0aW9ucyBkZSBtaXNlIMOgIGpvdXJcclxuICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiYmFkZ2UgYmFkZ2UtcGlsbCBiYWRnZS0ke2NsYXNzTmFtZX1cIiR7b2JqVXBBdXRvLnN0YXR1cyA/ICd0aXRsZT1cIkFycsOqdGVyIGxhIHTDomNoZSBlbiBjb3Vyc1wiJyA6ICcnfT4ke2xhYmVsfTwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiY2xvc2VcIiBhcmlhLWxhYmVsPVwiQ2xvc2VcIiB0aXRsZT1cIkZlcm1lclwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBhcmlhLWhpZGRlbj1cInRydWVcIj4mdGltZXM7PC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8aSBjbGFzcz1cImZhIGZhLXF1ZXN0aW9uLWNpcmNsZVwiIHN0eWxlPVwiY29sb3I6Ymx1ZTttYXJnaW4tbGVmdDo1cHg7XCIgYXJpYS1oaWRkZW49XCJ0cnVlXCIgdGl0bGU9XCIke2hlbHB9XCI+PC9pPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PmA7XHJcbiAgICAgICAgfTtcclxuICAgICAgICAvLyBPbiByZWxhbmNlIGwndXBkYXRlIGF1dG8gZGVzIMOpcGlzb2RlcyBhdSBjaGFyZ2VtZW50IGRlIGxhIHBhZ2VcclxuICAgICAgICBpZiAoc2hvdy5pbl9hY2NvdW50ICYmIHNob3cudXNlci5yZW1haW5pbmcgPiAwICYmIG9ialVwQXV0by5zdGF0dXMpIHtcclxuICAgICAgICAgICAgb2JqVXBBdXRvLmxhdW5jaCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChvYmpVcEF1dG8uc3RhdHVzKSB7XHJcbiAgICAgICAgICAgIG9ialVwQXV0by5zdG9wKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBub3RMb29wID0gMDtcclxuICAgICAgICBsZXQgaW50VGltZSA9IHNldEludGVydmFsKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKCsrbm90TG9vcCA+PSAyMCkge1xyXG4gICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRUaW1lKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGJvb3RzdHJhcCA9PT0gJ3VuZGVmaW5lZCcgfHwgdHlwZW9mIGJvb3RzdHJhcC5Qb3BvdmVyICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRUaW1lKTtcclxuICAgICAgICAgICAgaWYgKGRlYnVnKVxyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0xvYWRpbmcgcG9wb3ZlciB1cGRhdGVFcGlzb2RlcycpO1xyXG4gICAgICAgICAgICAkKCcjdXBkYXRlRXBpc29kZUxpc3QgLnVwZGF0ZUVsZW1lbnQnKS5wb3BvdmVyKHtcclxuICAgICAgICAgICAgICAgIGNvbnRhaW5lcjogJCgnI3VwZGF0ZUVwaXNvZGVMaXN0JyksXHJcbiAgICAgICAgICAgICAgICAvLyBkZWxheTogeyBcInNob3dcIjogNTAwLCBcImhpZGVcIjogMTAwIH0sXHJcbiAgICAgICAgICAgICAgICBodG1sOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgY29udGVudDogY29udGVudFVwLFxyXG4gICAgICAgICAgICAgICAgcGxhY2VtZW50OiAncmlnaHQnLFxyXG4gICAgICAgICAgICAgICAgdGl0bGU6ICcgJyxcclxuICAgICAgICAgICAgICAgIHRyaWdnZXI6ICdtYW51YWwnLFxyXG4gICAgICAgICAgICAgICAgYm91bmRhcnk6ICd3aW5kb3cnXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBsZXQgdGltZW91dEhvdmVyID0gbnVsbDtcclxuICAgICAgICAgICAgJCgnI3VwZGF0ZUVwaXNvZGVMaXN0IC51cGRhdGVFbGVtZW50JykuaG92ZXIoXHJcbiAgICAgICAgICAgIC8vIEluXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgdGltZW91dEhvdmVyID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJCgnI3VwZGF0ZUVwaXNvZGVMaXN0IC51cGRhdGVFbGVtZW50JykucG9wb3Zlcignc2hvdycpO1xyXG4gICAgICAgICAgICAgICAgfSwgNTAwKTtcclxuICAgICAgICAgICAgfSwgXHJcbiAgICAgICAgICAgIC8vIE91dFxyXG4gICAgICAgICAgICBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SG92ZXIpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgLy8gT24gZmVybWUgZXQgZMOpc2FjdGl2ZSBsZXMgYXV0cmVzIHBvcHVwcyBsb3JzcXVlIGNlbGxlIGRlcyBvcHRpb25zIGVzdCBvdXZlcnRlXHJcbiAgICAgICAgICAgICQoJyN1cGRhdGVFcGlzb2RlTGlzdCAudXBkYXRlRWxlbWVudCcpLm9uKCdzaG93LmJzLnBvcG92ZXInLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCAkdXBkYXRlRWxlbWVudCA9ICQoJyNlcGlzb2RlcyAuc2xpZGVfX2ltYWdlJyk7XHJcbiAgICAgICAgICAgICAgICAkdXBkYXRlRWxlbWVudC5wb3BvdmVyKCdoaWRlJyk7XHJcbiAgICAgICAgICAgICAgICAkdXBkYXRlRWxlbWVudC5wb3BvdmVyKCdkaXNhYmxlJyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAvLyBPbiByw6lhY3RpdmUgbGVzIGF1dHJlcyBwb3B1cyBsb3JzcXVlIGNlbGxlIGRlcyBvcHRpb25zIHNlIGZlcm1lXHJcbiAgICAgICAgICAgIC8vIEV0IG9uIHN1cHByaW1lIGxlcyBsaXN0ZW5lcnMgZGUgbGEgcG9wdXBcclxuICAgICAgICAgICAgJCgnI3VwZGF0ZUVwaXNvZGVMaXN0IC51cGRhdGVFbGVtZW50Jykub24oJ2hpZGUuYnMucG9wb3ZlcicsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICQoJyNlcGlzb2RlcyAuc2xpZGVfX2ltYWdlJykucG9wb3ZlcignZW5hYmxlJyk7XHJcbiAgICAgICAgICAgICAgICAkKCcub3B0aW9uc1VwQXV0byAuYmFkZ2UnKS5jc3MoJ2N1cnNvcicsICdpbml0aWFsJykub2ZmKCdjbGljaycpO1xyXG4gICAgICAgICAgICAgICAgJCgnI3VwZGF0ZUVwaXNvZGVMaXN0IGJ1dHRvbi5jbG9zZScpLm9mZignY2xpY2snKTtcclxuICAgICAgICAgICAgICAgICQoJyNvcHRpb25zVXBkYXRlRXBpc29kZUxpc3QgYnV0dG9uLmJ0bi1wcmltYXJ5Jykub2ZmKCdjbGljaycpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgJCgnI3VwZGF0ZUVwaXNvZGVMaXN0IC51cGRhdGVFbGVtZW50Jykub24oJ3Nob3duLmJzLnBvcG92ZXInLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAkKCcjdXBkYXRlRXBpc29kZUxpc3QgLnBvcG92ZXItaGVhZGVyJykuaHRtbCh0aXRsZVBvcHVwKG9ialVwQXV0bykpO1xyXG4gICAgICAgICAgICAgICAgaWYgKG9ialVwQXV0by5zdGF0dXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAkKCcub3B0aW9uc1VwQXV0byAuYmFkZ2UnKS5jc3MoJ2N1cnNvcicsICdwb2ludGVyJykuY2xpY2soZSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgJGJhZGdlID0gJChlLmN1cnJlbnRUYXJnZXQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoJGJhZGdlLmhhc0NsYXNzKCdiYWRnZS1zdWNjZXNzJykpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE9uIGFycsOqdGUgbGEgdMOiY2hlIGQndXBkYXRlIGF1dG9cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9ialVwQXV0by5zdG9wKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICQoJyN1cGRhdGVFcGlzb2RlTGlzdCBidXR0b24uY2xvc2UnKS5jbGljaygoZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICQoJyN1cGRhdGVFcGlzb2RlTGlzdCAudXBkYXRlRWxlbWVudCcpLnBvcG92ZXIoJ2hpZGUnKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgJCgnI29wdGlvbnNVcGRhdGVFcGlzb2RlTGlzdCBidXR0b24uYnRuLXByaW1hcnknKS5jbGljaygoZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBjaGVja0F1dG8gPSAkKCcjdXBkYXRlRXBpc29kZUxpc3RBdXRvJykuaXMoJzpjaGVja2VkJyksIGludGVydmFsQXV0byA9IHBhcnNlSW50KCQoJyN1cGRhdGVFcGlzb2RlTGlzdFRpbWUnKS52YWwoKS50b1N0cmluZygpLCAxMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9ialVwQXV0by5hdXRvICE9PSBjaGVja0F1dG8pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9ialVwQXV0by5hdXRvID0gY2hlY2tBdXRvO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChvYmpVcEF1dG8uaW50ZXJ2YWwgIT0gaW50ZXJ2YWxBdXRvKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvYmpVcEF1dG8uaW50ZXJ2YWwgPSBpbnRlcnZhbEF1dG87XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRlYnVnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygndXBkYXRlRXBpc29kZUxpc3Qgc3VibWl0Jywgb2JqVXBBdXRvKTtcclxuICAgICAgICAgICAgICAgICAgICBvYmpVcEF1dG8ubGF1bmNoKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJCgnI3VwZGF0ZUVwaXNvZGVMaXN0IC51cGRhdGVFbGVtZW50JykucG9wb3ZlcignaGlkZScpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0sIDUwMCk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIEFqb3V0ZSB1biBib3V0b24gVnUgc3VyIGxhIHZpZ25ldHRlIGQndW4gw6lwaXNvZGVcclxuICAgICAqIEBwYXJhbSB7U2hvd30gcmVzIEwnb2JqZXQgU2hvdyBkZSBsJ0FQSVxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiB1cGdyYWRlRXBpc29kZXMocmVzKSB7XHJcbiAgICAgICAgLy8gT24gdsOpcmlmaWUgcXVlIGwndXRpbGlzYXRldXIgZXN0IGNvbm5lY3TDqSBldCBxdWUgbGEgY2zDqSBkJ0FQSSBlc3QgcmVuc2VpZ27DqWVcclxuICAgICAgICBpZiAoIXVzZXJJZGVudGlmaWVkKCkgfHwgYmV0YXNlcmllc19hcGlfdXNlcl9rZXkgPT09ICcnKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgY29uc3Qgc2Vhc29ucyA9ICQoJyNzZWFzb25zIC5zbGlkZV9mbGV4Jyk7XHJcbiAgICAgICAgbGV0IHZpZ25ldHRlcyA9IGdldFZpZ25ldHRlcygpO1xyXG4gICAgICAgIGlmIChkZWJ1ZylcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ05iIHNlYXNvbnM6ICVkLCBuYiB2aWduZXR0ZXM6ICVkJywgc2Vhc29ucy5sZW5ndGgsIHZpZ25ldHRlcy5sZW5ndGgpO1xyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogQWpvdXRlIHVuZSDDqWNvdXRlIHN1ciBsJ29iamV0IFNob3csIHN1ciBsJ8OpdmVuZW1lbnQgVVBEQVRFLFxyXG4gICAgICAgICAqIHBvdXIgbWV0dHJlIMOgIGpvdXIgbCd1cGRhdGUgYXV0byBkZXMgw6lwaXNvZGVzXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcmVzLmFkZExpc3RlbmVyKEJhc2VfMS5FdmVudFR5cGVzLlVQREFURSwgZnVuY3Rpb24gKHNob3cpIHtcclxuICAgICAgICAgICAgaWYgKGRlYnVnKVxyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0xpc3RlbmVyIGNhbGxlZCcpO1xyXG4gICAgICAgICAgICAvLyBTaSBpbCBuJ3kgYSBwbHVzIGQnw6lwaXNvZGVzIMOgIHJlZ2FyZGVyIHN1ciBsYSBzw6lyaWVcclxuICAgICAgICAgICAgaWYgKHNob3cudXNlci5yZW1haW5pbmcgPD0gMCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IG9ialVwQXV0byA9IFVwZGF0ZUF1dG9fMS5VcGRhdGVBdXRvLmdldEluc3RhbmNlKHNob3cpO1xyXG4gICAgICAgICAgICAgICAgLy8gU2kgbGEgc8OpcmllIGVzdCB0ZXJtaW7DqWVcclxuICAgICAgICAgICAgICAgIGlmIChzaG93LmlzRW5kZWQoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIE9uIHN1cHByaW1lIGxhIHPDqXJpZSBkZXMgb3B0aW9ucyBkJ3VwZGF0ZVxyXG4gICAgICAgICAgICAgICAgICAgIG9ialVwQXV0by5kZWxldGUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIE9uIGTDqXNhY3RpdmUgbGEgbWlzZSDDoCBqb3VyIGF1dG9cclxuICAgICAgICAgICAgICAgICAgICBvYmpVcEF1dG8uc3RvcCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgLy8gT24gYWpvdXRlIGxlcyBjYXNlcyDDoCBjb2NoZXIgc3VyIGxlcyB2aWduZXR0ZXMgY291cmFudGVzXHJcbiAgICAgICAgYWRkQ2hlY2tTZWVuKCk7XHJcbiAgICAgICAgLy8gQWpvdXRlIGxlcyBjYXNlcyDDoCBjb2NoZXIgc3VyIGxlcyB2aWduZXR0ZXMgZGVzIMOpcGlzb2Rlc1xyXG4gICAgICAgIGZ1bmN0aW9uIGFkZENoZWNrU2VlbigpIHtcclxuICAgICAgICAgICAgdmlnbmV0dGVzID0gZ2V0VmlnbmV0dGVzKCk7XHJcbiAgICAgICAgICAgIGNvbnN0IHNlYXNvbk51bSA9IHBhcnNlSW50KCQoJyNzZWFzb25zIGRpdltyb2xlPVwiYnV0dG9uXCJdLnNsaWRlLS1jdXJyZW50IC5zbGlkZV9fdGl0bGUnKS50ZXh0KCkubWF0Y2goL1xcZCsvKS5zaGlmdCgpLCAxMCk7XHJcbiAgICAgICAgICAgIHJlcy5zZXRDdXJyZW50U2Vhc29uKHNlYXNvbk51bSk7XHJcbiAgICAgICAgICAgIGxldCBwcm9taXNlID0gcmVzLmN1cnJlbnRTZWFzb24uZmV0Y2hFcGlzb2RlcygpOyAvLyBDb250aWVudCBsYSBwcm9tZXNzZSBkZSByw6ljdXDDqXJlciBsZXMgw6lwaXNvZGVzIGRlIGxhIHNhaXNvbiBjb3VyYW50ZVxyXG4gICAgICAgICAgICAvLyBPbiBham91dGUgbGUgQ1NTIGV0IGxlIEphdmFzY3JpcHQgcG91ciBsZXMgcG9wdXBcclxuICAgICAgICAgICAgaWYgKCQoJyNjc3Nwb3BvdmVyJykubGVuZ3RoID09PSAwICYmICQoJyNqc2Jvb3RzdHJhcCcpLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgYWRkU2NyaXB0QW5kTGluayhbJ3BvcG92ZXInLCAnYm9vdHN0cmFwJ10pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICAgKiBSZXRvdXJuZSBsYSBwb3NpdGlvbiBkZSBsYSBwb3B1cCBwYXIgcmFwcG9ydCDDoCBsJ2ltYWdlIGR1IHNpbWlsYXJcclxuICAgICAgICAgICAgICogQHBhcmFtICB7T2JqZWN0fSBfdGlwIFVua25vd25cclxuICAgICAgICAgICAgICogQHBhcmFtICB7T2JqZWN0fSBlbHQgTGUgRE9NIEVsZW1lbnQgZHUgbGllbiBkdSBzaW1pbGFyXHJcbiAgICAgICAgICAgICAqIEByZXR1cm4ge1N0cmluZ30gICAgIExhIHBvc2l0aW9uIGRlIGxhIHBvcHVwXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICBsZXQgZnVuY1BsYWNlbWVudCA9IChfdGlwLCBlbHQpID0+IHtcclxuICAgICAgICAgICAgICAgIC8vaWYgKGRlYnVnKSBjb25zb2xlLmxvZygnZnVuY1BsYWNlbWVudCcsIHRpcCwgJCh0aXApLndpZHRoKCkpO1xyXG4gICAgICAgICAgICAgICAgbGV0IHJlY3QgPSBlbHQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksIHdpZHRoID0gJCh3aW5kb3cpLndpZHRoKCksIHNpemVQb3BvdmVyID0gMzIwO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICgocmVjdC5sZWZ0ICsgcmVjdC53aWR0aCArIHNpemVQb3BvdmVyKSA+IHdpZHRoKSA/ICdsZWZ0JyA6ICdyaWdodCc7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIC8vIE9uIGFqb3V0ZSBsYSBkZXNjcmlwdGlvbiBkZXMgw6lwaXNvZGVzIGRhbnMgZGVzIFBvcHVwXHJcbiAgICAgICAgICAgIHByb21pc2UudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBsZXQgaW50VGltZSA9IHNldEludGVydmFsKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGJvb3RzdHJhcCA9PT0gJ3VuZGVmaW5lZCcgfHwgdHlwZW9mIGJvb3RzdHJhcC5Qb3BvdmVyICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKGludFRpbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChkZWJ1ZylcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0FkZCBzeW5vcHNpcyBlcGlzb2RlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0ICR2aWduZXR0ZSwgb2JqRXBpc29kZSwgZGVzY3JpcHRpb247XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgdiA9IDA7IHYgPCB2aWduZXR0ZXMubGVuZ3RoOyB2KyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHZpZ25ldHRlID0gJCh2aWduZXR0ZXMuZ2V0KHYpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgb2JqRXBpc29kZSA9IHJlcy5jdXJyZW50U2Vhc29uLmVwaXNvZGVzW3ZdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBvYmpFcGlzb2RlLmVsdCA9ICR2aWduZXR0ZS5wYXJlbnRzKCcuc2xpZGVfZmxleCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBvYmpFcGlzb2RlLnNhdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb24gPSBvYmpFcGlzb2RlLmRlc2NyaXB0aW9uO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGVzY3JpcHRpb24ubGVuZ3RoID4gMzUwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbiA9IGRlc2NyaXB0aW9uLnN1YnN0cmluZygwLCAzNTApICsgJ+KApic7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoZGVzY3JpcHRpb24ubGVuZ3RoIDw9IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uID0gJ0F1Y3VuZSBkZXNjcmlwdGlvbic7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQWpvdXQgZGUgbCdhdHRyaWJ1dCB0aXRsZSBwb3VyIG9idGVuaXIgbGUgbm9tIGNvbXBsZXQgZGUgbCfDqXBpc29kZSwgbG9yc3F1J2lsIGVzdCB0cm9ucXXDqVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvYmpFcGlzb2RlLmFkZEF0dHJUaXRsZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBvYmpFcGlzb2RlLmluaXRDaGVja1NlZW4odik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEFqb3V0ZSBsYSBzeW5vcHNpcyBkZSBsJ8OpcGlzb2RlIGF1IHN1cnZvbCBkZSBsYSB2aWduZXR0ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAkdmlnbmV0dGUucG9wb3Zlcih7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250YWluZXI6ICR2aWduZXR0ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGF5OiB7IFwic2hvd1wiOiA1MDAsIFwiaGlkZVwiOiAxMDAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGh0bWw6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OiBgPHA+JHtkZXNjcmlwdGlvbn08L3A+YCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlbWVudDogZnVuY1BsYWNlbWVudCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiAnICcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmlnZ2VyOiAnaG92ZXInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYm91bmRhcnk6ICd3aW5kb3cnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAkKCcjZXBpc29kZXMgLnNsaWRlX19pbWFnZScpLm9uKCdzaG93bi5icy5wb3BvdmVyJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCAkY2hlY2tTZWVuID0gJCh0aGlzKS5maW5kKCcuY2hlY2tTZWVuJyksIGVwaXNvZGVJZCA9IHBhcnNlSW50KCRjaGVja1NlZW4uZGF0YSgnaWQnKSwgMTApLCBlcGlzb2RlID0gcmVzLmN1cnJlbnRTZWFzb24uZ2V0RXBpc29kZShlcGlzb2RlSWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWVwaXNvZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignZXBpc29kZSB0aXRsZSBwb3B1cCcsIGVwaXNvZGVJZCwgcmVzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcjZXBpc29kZXMgLnNsaWRlX19pbWFnZSAucG9wb3Zlci1oZWFkZXInKS5odG1sKGVwaXNvZGUuZ2V0VGl0bGVQb3B1cCgpKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAvLyBPbiBham91dGUgdW4gZXZlbnQgY2xpY2sgc3VyIGxhIGNhc2UgJ2NoZWNrU2VlbidcclxuICAgICAgICAgICAgICAgICAgICAkKCcjZXBpc29kZXMgLmNoZWNrU2VlbicpLmNsaWNrKGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgJGVsdCA9ICQoZS5jdXJyZW50VGFyZ2V0KSwgZXBpc29kZUlkID0gcGFyc2VJbnQoJGVsdC5kYXRhKCdpZCcpLCAxMCksIGVwaXNvZGUgPSByZXMuY3VycmVudFNlYXNvbi5nZXRFcGlzb2RlKGVwaXNvZGVJZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkZWJ1ZylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdjbGljayBjaGVja1NlZW4nLCBlcGlzb2RlLCByZXMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlcGlzb2RlLnRvZ2dsZVNwaW5uZXIodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIE9uIHbDqXJpZmllIHNpIGwnw6lwaXNvZGUgYSBkw6lqw6Agw6l0w6kgdnVcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCRlbHQuaGFzQ2xhc3MoJ3NlZW4nKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gT24gZGVtYW5kZSDDoCBsJ2VubGV2ZXIgZGVzIMOpcGlzb2RlcyB2dXNcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVwaXNvZGUudXBkYXRlU3RhdHVzKCdub3RTZWVuJywgQmFzZV8xLkhUVFBfVkVSQlMuREVMRVRFKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBTaW5vbiwgb24gbCdham91dGUgYXV4IMOpcGlzb2RlcyB2dXNcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcGlzb2RlLnVwZGF0ZVN0YXR1cygnc2VlbicsIEJhc2VfMS5IVFRQX1ZFUkJTLlBPU1QpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gT24gYWpvdXRlIHVuIGVmZmV0IGF1IHN1cnZvbCBkZSBsYSBjYXNlICdjaGVja1NlZW4nXHJcbiAgICAgICAgICAgICAgICAgICAgJCgnI2VwaXNvZGVzIC5jaGVja1NlZW4nKS5ob3ZlcihcclxuICAgICAgICAgICAgICAgICAgICAvLyBJTlxyXG4gICAgICAgICAgICAgICAgICAgIChlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQoZS5jdXJyZW50VGFyZ2V0KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnNpYmxpbmdzKCcub3ZlcmZsb3dIaWRkZW4nKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmZpbmQoJ2ltZy5qcy1sYXp5LWltYWdlJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5jc3MoJ3RyYW5zZm9ybScsICdzY2FsZSgxLjIpJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQoZS5jdXJyZW50VGFyZ2V0KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnBhcmVudCgnLnNsaWRlX19pbWFnZScpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAucG9wb3ZlcignaGlkZScpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sIFxyXG4gICAgICAgICAgICAgICAgICAgIC8vIE9VVFxyXG4gICAgICAgICAgICAgICAgICAgIChlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQoZS5jdXJyZW50VGFyZ2V0KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnNpYmxpbmdzKCcub3ZlcmZsb3dIaWRkZW4nKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmZpbmQoJ2ltZy5qcy1sYXp5LWltYWdlJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5jc3MoJ3RyYW5zZm9ybScsICdzY2FsZSgxLjApJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQoZS5jdXJyZW50VGFyZ2V0KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnBhcmVudCgnLnNsaWRlX19pbWFnZScpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAucG9wb3Zlcignc2hvdycpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSwgNTAwKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIC8vIEFqb3V0ZXIgdW4gYm91dG9uIGRlIG1pc2Ugw6Agam91ciBkZXMgw6lwaXNvZGVzIGRlIGxhIHNhaXNvbiBjb3VyYW50ZVxyXG4gICAgICAgICAgICBpZiAoJCgnI3VwZGF0ZUVwaXNvZGVMaXN0JykubGVuZ3RoIDwgMSkge1xyXG4gICAgICAgICAgICAgICAgJCgnI2VwaXNvZGVzIC5ibG9ja1RpdGxlcycpLnByZXBlbmQoYFxyXG4gICAgICAgICAgICAgICAgICAgIDxzdHlsZT4jdXBkYXRlRXBpc29kZUxpc3QgLnBvcG92ZXIge2xlZnQ6IDY1cHg7IHRvcDogNDBweDt9PC9zdHlsZT5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGlkPVwidXBkYXRlRXBpc29kZUxpc3RcIiBjbGFzcz1cInVwZGF0ZUVsZW1lbnRzXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8aSBjbGFzcz1cImZhIGZhLXJlZnJlc2ggZmEtMnggdXBkYXRlRXBpc29kZXMgdXBkYXRlRWxlbWVudCBmaW5pc2hcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU9XCJNaXNlIMOgIGpvdXIgZGVzIMOpcGlzb2RlcyBkZSBsYSBzYWlzb25cIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU9XCJtYXJnaW4tcmlnaHQ6MTBweDtcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgYXJpYS1oaWRkZW49XCJ0cnVlXCI+PC9pPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PmApO1xyXG4gICAgICAgICAgICAgICAgLy8gT24gYWpvdXRlIGwndXBkYXRlIGF1dG8gZGVzIMOpcGlzb2RlcyBkZSBsYSBzYWlzb24gY291cmFudGVcclxuICAgICAgICAgICAgICAgIHVwZGF0ZUF1dG9FcGlzb2RlTGlzdChyZXMpO1xyXG4gICAgICAgICAgICAgICAgLy8gT24gYWpvdXRlIGxhIGdlc3Rpb24gZGUgbCdldmVudCBjbGljayBzdXIgbGUgYm91dG9uXHJcbiAgICAgICAgICAgICAgICAkKCcudXBkYXRlRXBpc29kZXMnKS5jbGljaygoZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChkZWJ1ZylcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5ncm91cENvbGxhcHNlZCgndXBkYXRlRXBpc29kZXMnKTtcclxuICAgICAgICAgICAgICAgICAgICAvLyBPbiBmZXJtZSBsYSBwb3B1cCBkZXMgb3B0aW9ucyBkJ3VwZGF0ZSBhdXRvXHJcbiAgICAgICAgICAgICAgICAgICAgJCgnI3VwZGF0ZUVwaXNvZGVMaXN0IC51cGRhdGVFbGVtZW50JykucG9wb3ZlcignaGlkZScpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHNlbGYgPSAkKGUuY3VycmVudFRhcmdldCk7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5yZW1vdmVDbGFzcygnZmluaXNoJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gTGUgbnVtw6lybyBkZSBsYSBzYWlzb24gY291cmFudGVcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBzZWFzb25OdW0gPSAkKCcjc2Vhc29ucyAuc2xpZGVfZmxleC5zbGlkZS0tY3VycmVudCAuc2xpZGVfX3RpdGxlJykudGV4dCgpLm1hdGNoKC9cXGQrLykuc2hpZnQoKTtcclxuICAgICAgICAgICAgICAgICAgICByZXMuY3VycmVudFNlYXNvbi5mZXRjaEVwaXNvZGVzKCkudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlmIChkZWJ1ZykgY29uc29sZS5sb2coJ2FmdGVyIGZldGNoRXBpc29kZXMnLCBPYmplY3QuYXNzaWduKHt9LCBvYmpTaG93KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZpZ25ldHRlcyA9IGdldFZpZ25ldHRlcygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBsZW4gPSBnZXROYlZpZ25ldHRlcygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgJHZpZ25ldHRlLCBvYmpFcGlzb2RlLCBjaGFuZ2VkID0gZmFsc2UsIHJldG91cjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgdiA9IDA7IHYgPCB2aWduZXR0ZXMubGVuZ3RoOyB2KyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICR2aWduZXR0ZSA9ICQodmlnbmV0dGVzLmdldCh2KSk7IC8vIERPTUVsZW1lbnQgalF1ZXJ5IGRlIGwnaW1hZ2UgZGUgbCfDqXBpc29kZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JqRXBpc29kZSA9IHJlcy5jdXJyZW50U2Vhc29uLmVwaXNvZGVzW3ZdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JqRXBpc29kZS5lbHQgPSAkdmlnbmV0dGUucGFyZW50cygnLnNsaWRlX2ZsZXgnKTsgLy8gRG9ubsOpZXMgZGUgbCfDqXBpc29kZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9pZiAoZGVidWcpIGNvbnNvbGUubG9nKCdFcGlzb2RlIElEJywgZ2V0RXBpc29kZUlkKCR2aWduZXR0ZSksIGVwaXNvZGUuaWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0b3VyID0gb2JqRXBpc29kZS51cGRhdGVDaGVja1NlZW4odik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWNoYW5nZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGFuZ2VkID0gcmV0b3VyO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIE9uIG1ldCDDoCBqb3VyIGxlcyDDqWzDqW1lbnRzLCBzZXVsZW1lbnQgc2kgaWwgeSBhIGV1IGRlcyBtb2RpZmljYXRpb25zXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGFuZ2VkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGVidWcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3VwZGF0ZUVwaXNvZGVzIGNoYW5nZWQgdHJ1ZScsIHJlcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTaSBpbCByZXN0ZSBkZXMgw6lwaXNvZGVzIMOgIHZvaXIsIG9uIHNjcm9sbFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCQoJyNlcGlzb2RlcyAuc2xpZGVfZmxleC5zbGlkZS0tbm90U2VlbicpLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKCcjZXBpc29kZXMgLnNsaWRlc19mbGV4JykuZ2V0KDApLnNjcm9sbExlZnQgPVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKCcjZXBpc29kZXMgLnNsaWRlX2ZsZXguc2xpZGUtLW5vdFNlZW4nKS5nZXQoMCkub2Zmc2V0TGVmdCAtIDY5O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzLnVwZGF0ZSh0cnVlKS50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmFkZENsYXNzKCdmaW5pc2gnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmbkxhenkuaW5pdCgpOyAvLyBPbiBhZmZpY2hlIGxlcyBpbWFnZXMgbGF6eWxvYWRcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGVidWcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZ3JvdXBFbmQoKTsgLy8gT24gY2xvcyBsZSBncm91cGUgZGUgY29uc29sZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgZXJyID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub3RpZmljYXRpb24oJ0VycmV1ciBkZSByw6ljdXDDqXJhdGlvbiBkZSBsYSByZXNzb3VyY2UgU2hvdycsICdTaG93IHVwZGF0ZTogJyArIGVycik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5hZGRDbGFzcygnZmluaXNoJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdTaG93IHVwZGF0ZSBlcnJvcicsIGVycik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRlYnVnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmdyb3VwRW5kKCk7IC8vIE9uIGNsb3MgbGUgZ3JvdXBlIGRlIGNvbnNvbGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRlYnVnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCd1cGRhdGVFcGlzb2RlcyBubyBjaGFuZ2VzJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmFkZENsYXNzKCdmaW5pc2gnKTsgLy8gT24gYXJyZXRlIGwnYW5pbWF0aW9uIGRlIG1pc2Ugw6Agam91clxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRlYnVnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZ3JvdXBFbmQoKTsgLy8gT24gY2xvcyBsZSBncm91cGUgZGUgY29uc29sZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSwgKGVycikgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmFkZENsYXNzKCdmaW5pc2gnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRlYnVnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5ncm91cEVuZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBub3RpZmljYXRpb24oJ0VycmV1ciBkZSBtaXNlIMOgIGpvdXIgZGVzIMOpcGlzb2RlcycsICd1cGRhdGVFcGlzb2RlTGlzdDogJyArIGVycik7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBPbiBham91dGUgdW4gZXZlbnQgc3VyIGxlIGNoYW5nZW1lbnQgZGUgc2Fpc29uXHJcbiAgICAgICAgc2Vhc29ucy5jbGljaygoKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChkZWJ1ZylcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZ3JvdXBDb2xsYXBzZWQoJ3NlYXNvbiBjbGljaycpO1xyXG4gICAgICAgICAgICAkKCcjZXBpc29kZXMgLmNoZWNrU2VlbicpLm9mZignY2xpY2snKTtcclxuICAgICAgICAgICAgLy8gT24gYXR0ZW5kIHF1ZSBsZXMgdmlnbmV0dGVzIGRlIGxhIHNhaXNvbiBjaG9pc2llIHNvaWVudCBjaGFyZ8OpZXNcclxuICAgICAgICAgICAgd2FpdFNlYXNvbnNBbmRFcGlzb2Rlc0xvYWRlZCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBhZGRDaGVja1NlZW4oKTtcclxuICAgICAgICAgICAgICAgIGlmIChkZWJ1ZylcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmdyb3VwRW5kKCk7XHJcbiAgICAgICAgICAgIH0sICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1NlYXNvbiBjbGljayBUaW1lb3V0Jyk7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGVidWcpXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5ncm91cEVuZCgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAvLyBPbiBhY3RpdmUgbGVzIG1lbnVzIGRyb3Bkb3duXHJcbiAgICAgICAgJCgnLmRyb3Bkb3duLXRvZ2dsZScpLmRyb3Bkb3duKCk7XHJcbiAgICAgICAgLy8gT24gZ8OocmUgbCdham91dCBldCBsYSBzdXBwcmVzc2lvbiBkZSBsYSBzw6lyaWUgZGFucyBsZSBjb21wdGUgdXRpbGlzYXRldXJcclxuICAgICAgICBpZiAocmVzLmluX2FjY291bnQpIHtcclxuICAgICAgICAgICAgcmVzLmRlbGV0ZVNob3dDbGljaygpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmVzLmFkZFNob3dDbGljaygpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBPbiByw6ljdXDDqHJlIGxlcyB2aWduZXR0ZXMgZGVzIMOpcGlzb2Rlc1xyXG4gICAgICAgIGZ1bmN0aW9uIGdldFZpZ25ldHRlcygpIHtcclxuICAgICAgICAgICAgcmV0dXJuICQoJyNlcGlzb2RlcyAuc2xpZGVfX2ltYWdlJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBNb2RpZmllIGxlIGZvbmN0aW9ubmVtZW50IGQnYWpvdXQgZCd1biBzaW1pbGFyXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtICB7T2JqZWN0fSAgICRlbHQgICAgICAgICAgTCfDqWzDqW1lbnQgRE9NRWxlbWVudCBqUXVlcnlcclxuICAgICAqIEBwYXJhbSAge051bWJlcltdfSBbb2JqU2ltaWxhcnNdIFVuIHRhYmxlYXUgZGVzIGlkZW50aWZpYW50cyBkZXMgc2ltaWxhcnMgYWN0dWVsc1xyXG4gICAgICogQHJldHVybiB7dm9pZH1cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gcmVwbGFjZVN1Z2dlc3RTaW1pbGFySGFuZGxlcigkZWx0LCBvYmpTaW1pbGFycyA9IFtdKSB7XHJcbiAgICAgICAgLy8gT24gdsOpcmlmaWUgcXVlIGwndXRpbGlzYXRldXIgZXN0IGNvbm5lY3TDqSBldCBxdWUgbGEgY2zDqSBkJ0FQSSBlc3QgcmVuc2VpZ27DqWVcclxuICAgICAgICBpZiAoIXVzZXJJZGVudGlmaWVkKCkgfHwgYmV0YXNlcmllc19hcGlfdXNlcl9rZXkgPT09ICcnIHx8ICEvKHNlcmllfGZpbG0pLy50ZXN0KHVybCkpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBpZiAoZGVidWcpXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdyZXBsYWNlU3VnZ2VzdFNpbWlsYXJIYW5kbGVyJyk7XHJcbiAgICAgICAgY29uc3QgdHlwZSA9IGdldEFwaVJlc291cmNlKHVybC5zcGxpdCgnLycpWzFdKSwgLy8gTGUgdHlwZSBkZSByZXNzb3VyY2VcclxuICAgICAgICByZXNJZCA9IGdldFJlc291cmNlSWQoKTsgLy8gSWRlbnRpZmlhbnQgZGUgbGEgcmVzc291cmNlXHJcbiAgICAgICAgLy8gR2VzdGlvbiBkJ2Fqb3V0IGQndW4gc2ltaWxhclxyXG4gICAgICAgICRlbHQucmVtb3ZlQXR0cignb25jbGljaycpLmNsaWNrKCgpID0+IHtcclxuICAgICAgICAgICAgbmV3IFBvcHVwQWxlcnQoe1xyXG4gICAgICAgICAgICAgICAgc2hvd0Nsb3NlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgdHlwZTogJ3BvcGluLXN1Z2dlc3RzaG93JyxcclxuICAgICAgICAgICAgICAgIHBhcmFtczoge1xyXG4gICAgICAgICAgICAgICAgICAgIGlkOiByZXNJZFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGNhbGxiYWNrOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJChcIiNzaW1pbGFpcmVfaWRfc2VhcmNoXCIpLmZvY3VzKCkub24oXCJrZXl1cFwiLCAoZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgc2VhcmNoID0gJChlLmN1cnJlbnRUYXJnZXQpLnZhbCgpLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzZWFyY2gubGVuZ3RoID4gMCAmJiBlLndoaWNoICE9IDQwICYmIGUud2hpY2ggIT0gMzgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEJhc2VfMS5CYXNlLmNhbGxBcGkoJ0dFVCcsICdzZWFyY2gnLCB0eXBlLnBsdXJhbCwgeyBhdXRyZXM6ICdtaW5lJywgdGV4dDogc2VhcmNoIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKGRhdGEpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBtZWRpYXMgPSBkYXRhW3R5cGUucGx1cmFsXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKFwiI3NlYXJjaF9yZXN1bHRzIC50aXRsZVwiKS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKFwiI3NlYXJjaF9yZXN1bHRzIC5pdGVtXCIpLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBtZWRpYTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBzID0gMDsgcyA8IG1lZGlhcy5sZW5ndGg7IHMrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZWRpYSA9IG1lZGlhc1tzXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG9ialNpbWlsYXJzLmluZGV4T2YobWVkaWEuaWQpICE9PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gLy8gU2ltaWxhciBkw6lqw6AgcHJvcG9zw6lcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJCgnI3NlYXJjaF9yZXN1bHRzJykuYXBwZW5kKGBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJpdGVtXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwPjxzcGFuIGRhdGEtaWQ9XCIke21lZGlhLmlkfVwiIHN0eWxlPVwiY3Vyc29yOnBvaW50ZXI7XCI+JHttZWRpYS50aXRsZX08L3NwYW4+PC9wPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+YCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoJyNzZWFyY2hfcmVzdWx0cyAuaXRlbSBzcGFuJykuY2xpY2soKGUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXV0b2NvbXBsZXRlU2ltaWxhcihlLmN1cnJlbnRUYXJnZXQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgKGVycikgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbignQWpvdXQgZFxcJ3VuIHNpbWlsYXInLCAnRXJyZXVyIHJlcXXDqnRlIFNlYXJjaDogJyArIGVycik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChlLndoaWNoICE9IDQwICYmIGUud2hpY2ggIT0gMzgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoXCIjc2VhcmNoX3Jlc3VsdHNcIikuZW1wdHkoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoXCIjc2ltaWxhaXJlX2lkX3NlYXJjaFwiKS5vZmYoXCJrZXlkb3duXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgJChcIiNzaW1pbGFpcmVfaWRfc2VhcmNoXCIpLm9mZigna2V5ZG93bicpLm9uKCdrZXlkb3duJywgKGUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY3VycmVudF9pdGVtID0gJChcIiNzZWFyY2hfcmVzdWx0cyAuaXRlbS5obFwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChlLndoaWNoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvKiBGbMOoY2hlIGR1IGJhcyAqL1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSA0MDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudF9pdGVtLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKFwiI3NlYXJjaF9yZXN1bHRzIC5pdGVtOmZpcnN0XCIpLmFkZENsYXNzKFwiaGxcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgbmV4dF9pdGVtID0gJChcIiNzZWFyY2hfcmVzdWx0cyAuaXRlbS5obFwiKS5uZXh0KFwiZGl2XCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV4dF9pdGVtLmF0dHIoXCJjbGFzc1wiKSA9PT0gXCJ0aXRsZVwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXh0X2l0ZW0gPSBuZXh0X2l0ZW0ubmV4dChcImRpdlwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50X2l0ZW0ucmVtb3ZlQ2xhc3MoXCJobFwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV4dF9pdGVtLmFkZENsYXNzKFwiaGxcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLyogRmzDqGNoZSBkdSBoYXV0ICovXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDM4OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50X2l0ZW0ubGVuZ3RoICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwcmV2X2l0ZW0gPSAkKFwiI3NlYXJjaF9yZXN1bHRzIC5pdGVtLmhsXCIpLnByZXYoXCJkaXZcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwcmV2X2l0ZW0uYXR0cihcImNsYXNzXCIpID09IFwidGl0bGVcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJldl9pdGVtID0gcHJldl9pdGVtLnByZXYoXCJkaXZcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudF9pdGVtLnJlbW92ZUNsYXNzKFwiaGxcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByZXZfaXRlbS5hZGRDbGFzcyhcImhsXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8qIFRvdWNoZSBFbnRyw6llICovXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDEzOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkZWJ1ZylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2N1cnJlbnRfaXRlbScsIGN1cnJlbnRfaXRlbSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRfaXRlbS5sZW5ndGggIT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXV0b2NvbXBsZXRlU2ltaWxhcihjdXJyZW50X2l0ZW0uZmluZChcInNwYW5cIikpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8qIFRvdWNoZSBFY2hhcCAqL1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAyNzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKFwiI3NlYXJjaF9yZXN1bHRzXCIpLmVtcHR5KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJChcImlucHV0W25hbWU9c2ltaWxhaXJlX2lkX3NlYXJjaF1cIikudmFsKFwiXCIpLnRyaWdnZXIoXCJibHVyXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBmdW5jdGlvbiBhdXRvY29tcGxldGVTaW1pbGFyKGVsKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdGl0cmUgPSAkKGVsKS5odG1sKCksIGlkID0gJChlbCkuZGF0YShcImlkXCIpO1xyXG4gICAgICAgICAgICAgICAgdGl0cmUgPSB0aXRyZS5yZXBsYWNlKC8mYW1wOy9nLCBcIiZcIik7XHJcbiAgICAgICAgICAgICAgICAkKFwiI3NlYXJjaF9yZXN1bHRzIC5pdGVtXCIpLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgJChcIiNzZWFyY2hfcmVzdWx0cyAudGl0bGVcIikucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICAkKFwiI3NpbWlsYWlyZV9pZF9zZWFyY2hcIikudmFsKHRpdHJlKS50cmlnZ2VyKFwiYmx1clwiKTtcclxuICAgICAgICAgICAgICAgICQoXCJpbnB1dFtuYW1lPXNpbWlsYWlyZV9pZF1cIikudmFsKGlkKTtcclxuICAgICAgICAgICAgICAgICQoJyNwb3Bpbi1kaWFsb2cgLnBvcGluLWNvbnRlbnQtaHRtbCA+IGZvcm0gPiBkaXYuYnV0dG9uLXNldCA+IGJ1dHRvbicpLmZvY3VzKCk7XHJcbiAgICAgICAgICAgICAgICAvLyQoXCJpbnB1dFtuYW1lPW5vdGVzX3VybF1cIikudHJpZ2dlcihcImZvY3VzXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFbDqXJpZmllIHNpIGxlcyBzw6lyaWVzL2ZpbG1zIHNpbWlsYWlyZXMgb250IMOpdMOpIHZ1ZXNcclxuICAgICAqIE7DqWNlc3NpdGUgcXVlIGwndXRpbGlzYXRldXIgc29pdCBjb25uZWN0w6kgZXQgcXVlIGxhIGNsw6kgZCdBUEkgc29pdCByZW5zZWlnbsOpZVxyXG4gICAgICogQHBhcmFtIHtNZWRpYX0gcmVzIExhIHJlc3NvdXJjZSBkZSBsJ0FQSVxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBzaW1pbGFyc1ZpZXdlZChyZXMpIHtcclxuICAgICAgICAvLyBPbiB2w6lyaWZpZSBxdWUgbCd1dGlsaXNhdGV1ciBlc3QgY29ubmVjdMOpIGV0IHF1ZSBsYSBjbMOpIGQnQVBJIGVzdCByZW5zZWlnbsOpZVxyXG4gICAgICAgIGlmICghdXNlcklkZW50aWZpZWQoKSB8fCBiZXRhc2VyaWVzX2FwaV91c2VyX2tleSA9PT0gJycgfHwgIS8oc2VyaWV8ZmlsbSkvLnRlc3QodXJsKSlcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIGNvbnNvbGUuZ3JvdXBDb2xsYXBzZWQoJ3NpbWlsYXJzVmlld2VkJyk7XHJcbiAgICAgICAgbGV0ICRzaW1pbGFycyA9ICQoJyNzaW1pbGFycyAuc2xpZGVfX3RpdGxlJyksIC8vIExlcyB0aXRyZXMgZGVzIHJlc3NvdXJjZXMgc2ltaWxhaXJlc1xyXG4gICAgICAgIGxlbiA9ICRzaW1pbGFycy5sZW5ndGg7IC8vIExlIG5vbWJyZSBkZSBzaW1pbGFpcmVzXHJcbiAgICAgICAgaWYgKGRlYnVnKVxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnbmIgc2ltaWxhcnM6ICVkJywgbGVuLCByZXMubmJTaW1pbGFycyk7XHJcbiAgICAgICAgLy8gT24gc29ydCBzaSBpbCBuJ3kgYSBhdWN1biBzaW1pbGFycyBvdSBzaSBpbCBzJ2FnaXQgZGUgbGEgdmlnbmV0dGUgZCdham91dFxyXG4gICAgICAgIGlmIChsZW4gPD0gMCB8fCAobGVuID09PSAxICYmICQoJHNpbWlsYXJzLnBhcmVudCgpLmdldCgwKSkuZmluZCgnYnV0dG9uJykubGVuZ3RoID09PSAxKSkge1xyXG4gICAgICAgICAgICAkKCcudXBkYXRlU2ltaWxhcnMnKS5hZGRDbGFzcygnZmluaXNoJyk7XHJcbiAgICAgICAgICAgIHJlcGxhY2VTdWdnZXN0U2ltaWxhckhhbmRsZXIoJCgnI3NpbWlsYXJzIGRpdi5zbGlkZXNfZmxleCBkaXYuc2xpZGVfZmxleCBkaXYuc2xpZGVfX2ltYWdlID4gYnV0dG9uJykpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmdyb3VwRW5kKCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBPbiBham91dGUgdW4gYm91dG9uIGRlIG1pc2Ugw6Agam91ciBkZXMgc2ltaWxhcnNcclxuICAgICAgICAgKiBldCBvbiB2w6lyaWZpZSBxdSdpbCBuJ2V4aXN0ZSBwYXMgZMOpasOgXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgaWYgKCQoJyN1cGRhdGVTaW1pbGFyc0Jsb2NrJykubGVuZ3RoIDwgMSkge1xyXG4gICAgICAgICAgICAvLyBPbiBham91dGUgbGVzIHJlc3NvdXJjZXMgQ1NTIGV0IEpTIG7DqWNlc3NhaXJlc1xyXG4gICAgICAgICAgICBpZiAoJCgnI2Nzc3BvcG92ZXInKS5sZW5ndGggPD0gMCAmJiAkKCcjanNib290c3RyYXAnKS5sZW5ndGggPD0gMCkge1xyXG4gICAgICAgICAgICAgICAgYWRkU2NyaXB0QW5kTGluayhbJ3BvcG92ZXInLCAnYm9vdHN0cmFwJ10pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIE9uIGFqb3V0ZSBsZSBib3V0b24gZGUgbWlzZSDDoCBqb3VyIGRlcyBzaW1pbGFpcmVzXHJcbiAgICAgICAgICAgICQoJyNzaW1pbGFycyAuYmxvY2tUaXRsZXMnKS5hcHBlbmQoYFxyXG4gICAgICAgICAgICAgICAgPGRpdiBpZD1cInVwZGF0ZVNpbWlsYXJzQmxvY2tcIiBjbGFzcz1cInVwZGF0ZUVsZW1lbnRzXCIgc3R5bGU9XCJtYXJnaW4tbGVmdDoxMHB4O1wiPlxyXG4gICAgICAgICAgICAgICAgICA8aW1nIHNyYz1cIiR7c2VydmVyQmFzZVVybH0vaW1nL3VwZGF0ZS5wbmdcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgIGNsYXNzPVwidXBkYXRlU2ltaWxhcnMgdXBkYXRlRWxlbWVudFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU9XCJNaXNlIMOgIGpvdXIgZGVzIHNpbWlsYWlyZXMgdnVzXCIvPlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+YCk7XHJcbiAgICAgICAgICAgIC8vIFNpIGxlIGJvdXRvbiBkJ2Fqb3V0IGRlIHNpbWlsYWlyZSBuJ2VzdCBwYXMgcHLDqXNlbnRcclxuICAgICAgICAgICAgLy8gZXQgcXVlIGxhIHJlc3NvdXJjZSBlc3QgZGFucyBsZSBjb21wdGUgZGUgbCd1dGlsaXNhdGV1ciwgb24gYWpvdXRlIGxlIGJvdXRvblxyXG4gICAgICAgICAgICBpZiAoJCgnI3NpbWlsYXJzIGJ1dHRvbi5ibG9ja1RpdGxlLXN1YnRpdGxlJykubGVuZ3RoID09PSAwICYmIHJlcy5pbl9hY2NvdW50ID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAkKCcjc2ltaWxhcnMgLmJsb2NrVGl0bGUnKVxyXG4gICAgICAgICAgICAgICAgICAgIC5hZnRlcihgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJidG4tcmVzZXQgYmxvY2tUaXRsZS1zdWJ0aXRsZSB1LWNvbG9yV2hpdGVPcGFjaXR5MDVcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFN1Z2fDqXJlciB1bmUgc8OpcmllXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5gKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBPbiBham91dGUgbGEgZ2VzdGlvbiBkZSBsJ2V2ZW50IGNsaWNrIHN1ciBsZSBib3V0b24gZCd1cGRhdGUgZGVzIHNpbWlsYXJzXHJcbiAgICAgICAgICAgICQoJy51cGRhdGVTaW1pbGFycycpLmNsaWNrKGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcygnZmluaXNoJyk7XHJcbiAgICAgICAgICAgICAgICAvLyBPbiBzdXBwcmltZSBsZXMgYmFuZGVhdXggVmlld2VkXHJcbiAgICAgICAgICAgICAgICAkKCcuYmFuZFZpZXdlZCcpLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgLy8gT24gc3VwcHJpbWUgbGVzIG5vdGVzXHJcbiAgICAgICAgICAgICAgICAkKCcuc3RhcnMtb3V0ZXInKS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgICQoJy5mYS13cmVuY2gnKS5vZmYoJ2NsaWNrJykucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICAvLyBPbiBzdXBwcmltZSBsZXMgcG9wb3ZlcnNcclxuICAgICAgICAgICAgICAgICQoJyNzaW1pbGFycyBhLnNsaWRlX19pbWFnZScpLmVhY2goKGksIGVsdCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICQoZWx0KS5wb3BvdmVyKCdkaXNwb3NlJyk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIC8vIE9uIG1ldCDDoCBqb3VyIGxlcyBzZXJpZXMvZmlsbXMgc2ltaWxhaXJlc1xyXG4gICAgICAgICAgICAgICAgc2ltaWxhcnNWaWV3ZWQocmVzKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBvYmpTaW1pbGFycyA9IFtdO1xyXG4gICAgICAgIHJlcy5mZXRjaFNpbWlsYXJzKCkudGhlbihmdW5jdGlvbiAocmVzKSB7XHJcbiAgICAgICAgICAgIGxldCBpbnRUaW1lID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBib290c3RyYXAgPT09ICd1bmRlZmluZWQnIHx8IHR5cGVvZiBib290c3RyYXAuUG9wb3ZlciAhPT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKGludFRpbWUpO1xyXG4gICAgICAgICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgICAgICAgKiBSZXRvdXJuZSBsYSBwb3NpdGlvbiBkZSBsYSBwb3B1cCBwYXIgcmFwcG9ydCDDoCBsJ2ltYWdlIGR1IHNpbWlsYXJcclxuICAgICAgICAgICAgICAgICAqIEBwYXJhbSAge09iamVjdH0gICAgICAgICBfdGlwIFVua25vd25cclxuICAgICAgICAgICAgICAgICAqIEBwYXJhbSAge0hUTUxFbGVtZW50fSAgICBlbHQgIExlIERPTSBFbGVtZW50IGR1IGxpZW4gZHUgc2ltaWxhclxyXG4gICAgICAgICAgICAgICAgICogQHJldHVybiB7U3RyaW5nfSAgICAgICAgICAgICAgTGEgcG9zaXRpb24gZGUgbGEgcG9wdXBcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgbGV0IGZ1bmNQbGFjZW1lbnQgPSAoX3RpcCwgZWx0KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9pZiAoZGVidWcpIGNvbnNvbGUubG9nKCdmdW5jUGxhY2VtZW50JywgdGlwLCAkKHRpcCkud2lkdGgoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJlY3QgPSBlbHQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksIHdpZHRoID0gJCh3aW5kb3cpLndpZHRoKCksIHNpemVQb3BvdmVyID0gMzIwO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoKHJlY3QubGVmdCArIHJlY3Qud2lkdGggKyBzaXplUG9wb3ZlcikgPiB3aWR0aCkgPyAnbGVmdCcgOiAncmlnaHQnO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IHMgPSAwOyBzIDwgcmVzLnNpbWlsYXJzLmxlbmd0aDsgcysrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgb2JqU2ltaWxhcnMucHVzaChyZXMuc2ltaWxhcnNbc10uaWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCAkZWx0ID0gJCgkc2ltaWxhcnMuZ2V0KHMpKSwgJGxpbmsgPSAkZWx0LnNpYmxpbmdzKCdhJyksIHNpbWlsYXIgPSByZXMuc2ltaWxhcnNbc107XHJcbiAgICAgICAgICAgICAgICAgICAgc2ltaWxhci5lbHQgPSAkZWx0LnBhcmVudHMoJy5zbGlkZV9mbGV4Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgc2ltaWxhci5zYXZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gc2ltaWxhciA9IG5ldyBTaW1pbGFyKHJlc291cmNlLCAkZWx0LnBhcmVudHMoJy5zbGlkZV9mbGV4JyksIHR5cGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIE9uIGTDqWNvZGUgbGUgdGl0cmUgZHUgc2ltaWxhclxyXG4gICAgICAgICAgICAgICAgICAgIHNpbWlsYXIuZGVjb2RlVGl0bGUoKTtcclxuICAgICAgICAgICAgICAgICAgICAvLyBPbiBham91dGUgbCdpY29uZSBwb3VyIHZpc3VhbGlzZXIgbGVzIGRhdGEgSlNPTiBkdSBzaW1pbGFyXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRlYnVnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpbWlsYXIud3JlbmNoKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHNpbWlsYXJcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gT24gdsOpcmlmaWUgbGEgcHLDqXNlbmNlIGRlIGwnaW1hZ2UgZHUgc2ltaWxhclxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuY2hlY2tJbWcoKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBPbiBham91dGUgbGUgYmFuZGVhdSB2aWV3ZWQgc3VyIGxlIHNpbWlsYXJcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmFkZFZpZXdlZCgpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIE9uIGFqb3V0ZSBsZSBjb2RlIEhUTUwgcG91ciBsZSByZW5kdSBkZSBsYSBub3RlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5yZW5kZXJTdGFycygpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIE9uIGFqb3V0ZSBsYSBwb3BvdmVyIHN1ciBsZSBzaW1pbGFyXHJcbiAgICAgICAgICAgICAgICAgICAgJGxpbmsucG9wb3Zlcih7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lcjogJGxpbmssXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlbGF5OiB7IFwic2hvd1wiOiAyNTAsIFwiaGlkZVwiOiAxMDAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaHRtbDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudDogJyAnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwbGFjZW1lbnQ6IGZ1bmNQbGFjZW1lbnQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiAnICcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyaWdnZXI6ICdob3ZlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZhbGxiYWNrUGxhY2VtZW50OiBbJ2xlZnQnLCAncmlnaHQnXVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8gRXZlbnQgw6AgbCdvdXZlcnR1cmUgZGUgbGEgUG9wb3ZlclxyXG4gICAgICAgICAgICAgICAgJCgnI3NpbWlsYXJzIGEuc2xpZGVfX2ltYWdlJykub24oJ3Nob3duLmJzLnBvcG92ZXInLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgJHdyZW5jaCA9ICQodGhpcykucGFyZW50KCkuZmluZCgnLnBvcG92ZXItd3JlbmNoJyksIHJlc0lkID0gcGFyc2VJbnQoJHdyZW5jaC5kYXRhKCdpZCcpLCAxMCksIHR5cGUgPSAkd3JlbmNoLmRhdGEoJ3R5cGUnKSwgb2JqU2ltaWxhciA9IHJlcy5nZXRTaW1pbGFyKHJlc0lkKTtcclxuICAgICAgICAgICAgICAgICAgICAkKCcucG9wb3Zlci1oZWFkZXInKS5odG1sKG9ialNpbWlsYXIuZ2V0VGl0bGVQb3B1cCgpKTtcclxuICAgICAgICAgICAgICAgICAgICAkKCcucG9wb3Zlci1ib2R5JykuaHRtbChvYmpTaW1pbGFyLmdldENvbnRlbnRQb3B1cCgpKTtcclxuICAgICAgICAgICAgICAgICAgICAvLyBPbiBnw6hyZSBsZXMgbW9kaWZzIHN1ciBsZXMgY2FzZXMgw6AgY29jaGVyIGRlIGwnw6l0YXQgZCd1biBmaWxtIHNpbWlsYXJcclxuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZSA9PT0gQmFzZV8xLk1lZGlhVHlwZS5tb3ZpZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCdpbnB1dC5tb3ZpZScpLmNoYW5nZSgoZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0ICRlbHQgPSAkKGUuY3VycmVudFRhcmdldCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgc3RhdGUgPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRlYnVnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdpbnB1dC5tb3ZpZSBjaGFuZ2UnLCAkZWx0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICgkZWx0LmlzKCc6Y2hlY2tlZCcpICYmICRlbHQuaGFzQ2xhc3MoJ21vdmllU2VlbicpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUgPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoKCRlbHQuaXMoJzpjaGVja2VkJykgJiYgJGVsdC5oYXNDbGFzcygnbW92aWVNdXN0U2VlJykpIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCEkZWx0LmlzKCc6Y2hlY2tlZCcpICYmICRlbHQuaGFzQ2xhc3MoJ21vdmllU2VlbicpKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlID0gMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKCRlbHQuaXMoJzpjaGVja2VkJykgJiYgJGVsdC5oYXNDbGFzcygnbW92aWVOb3RTZWUnKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlID0gMjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoJ2lucHV0Lm1vdmllOm5vdCguJyArICRlbHQuZ2V0KDApLmNsYXNzTGlzdFsxXSArICcpJykuZWFjaCgoaSwgZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoZSkucHJvcChcImNoZWNrZWRcIiwgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvYmpTaW1pbGFyLmFkZFRvQWNjb3VudChzdGF0ZSkudGhlbihzaW1pbGFyID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3RhdGUgPT09IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJGVsdC5wYXJlbnRzKCdhJykucHJlcGVuZChgPGltZyBzcmM9XCIke3NlcnZlckJhc2VVcmx9L2ltZy92aWV3ZWQucG5nXCIgY2xhc3M9XCJiYW5kVmlld2VkXCIvPmApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmICgkZWx0LnBhcmVudHMoJ2EnKS5maW5kKCcuYmFuZFZpZXdlZCcpLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJGVsdC5wYXJlbnRzKCdhJykuZmluZCgnLmJhbmRWaWV3ZWQnKS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRlYnVnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnbW92aWUgbXVzdFNlZS9zZWVuIE9LJywgc2ltaWxhcik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBlcnIgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignbW92aWUgbXVzdFNlZS9zZWVuIEtPJywgZXJyKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gT24gZ8OocmUgbGUgY2xpY2sgc3VyIGxlIGxpZW4gZCdham91dCBkZSBsYSBzw6lyaWUgc2ltaWxhciBzdXIgbGUgY29tcHRlIGRlIGwndXRpbGlzYXRldXJcclxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmICh0eXBlID09PSBCYXNlXzEuTWVkaWFUeXBlLnNob3cpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnLnBvcG92ZXIgLmFkZFNob3cnKS5jbGljaygoZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9ialNpbWlsYXIuYWRkVG9BY2NvdW50KCkudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcGFyYSA9ICQoZS5jdXJyZW50VGFyZ2V0KS5wYXJlbnQoJ3AnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKGUuY3VycmVudFRhcmdldCkucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyYS50ZXh0KCc8c3BhbiBzdHlsZT1cImNvbG9yOnZhcigtLWxpbmstY29sb3IpXCI+TGEgc8OpcmllIGEgYmllbiDDqXTDqSBham91dMOpZSDDoCB2b3RyZSBjb21wdGU8L3NwYW4+JykuZGVsYXkoMjAwMCkuZmFkZUluKDQwMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBlcnIgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1BvcG92ZXIgYWRkU2hvdyBlcnJvcicsIGVycik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIC8vIE9uIGfDqHJlIGxlIHBsYWNlbWVudCBkZSBsYSBQb3BvdmVyIHBhciByYXBwb3J0IMOgIGwnaW1hZ2UgZHUgc2ltaWxhclxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBwb3BvdmVyID0gJCgnLnBvcG92ZXInKSwgaW1nID0gcG9wb3Zlci5zaWJsaW5ncygnaW1nLmpzLWxhenktaW1hZ2UnKSwgcGxhY2VtZW50ID0gJCgnLnBvcG92ZXInKS5hdHRyKCd4LXBsYWNlbWVudCcpLCBzcGFjZSA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBsYWNlbWVudCA9PSAnbGVmdCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3BhY2UgPSBwb3BvdmVyLndpZHRoKCkgKyAoaW1nLndpZHRoKCkgLyAyKSArIDU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvcG92ZXIuY3NzKCdsZWZ0JywgYC0ke3NwYWNlfXB4YCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAkKCcudXBkYXRlU2ltaWxhcnMnKS5hZGRDbGFzcygnZmluaXNoJyk7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmdyb3VwRW5kKCk7XHJcbiAgICAgICAgICAgIH0sIDUwMCk7XHJcbiAgICAgICAgfSwgKGVycikgPT4ge1xyXG4gICAgICAgICAgICBub3RpZmljYXRpb24oJ0VycmV1ciBkZSByw6ljdXDDqXJhdGlvbiBkZXMgc2ltaWxhcnMnLCAnc2ltaWxhcnNWaWV3ZWQ6ICcgKyBlcnIpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJlcGxhY2VTdWdnZXN0U2ltaWxhckhhbmRsZXIoJCgnI3NpbWlsYXJzIGJ1dHRvbi5ibG9ja1RpdGxlLXN1YnRpdGxlJyksIG9ialNpbWlsYXJzKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogUGVybWV0IGRlIG1ldHRyZSDDoCBqb3VyIGxhIGxpc3RlIGRlcyDDqXBpc29kZXMgw6Agdm9pclxyXG4gICAgICogc3VyIGxhIHBhZ2UgZGUgbCdhZ2VuZGFcclxuICAgICAqIEByZXR1cm4ge3ZvaWR9XHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIHVwZGF0ZUFnZW5kYSgpIHtcclxuICAgICAgICAvLyBJZGVudGlmaWVyIGxlcyBpbmZvcm1hdGlvbnMgZGVzIMOpcGlzb2RlcyDDoCB2b2lyXHJcbiAgICAgICAgLy8gTGVzIGNvbnRhaW5lcnNcclxuICAgICAgICBsZXQgJGNvbnRhaW5lcnNFcGlzb2RlID0gJCgnI3JlYWN0anMtZXBpc29kZXMtdG8td2F0Y2ggLkNvbXBvbmVudEVwaXNvZGVDb250YWluZXInKSwgbGVuID0gJGNvbnRhaW5lcnNFcGlzb2RlLmxlbmd0aCwgY3VycmVudFNob3dJZHMgPSB7fTtcclxuICAgICAgICAvLyBFbiBhdHRlbnRlIGR1IGNoYXJnZW1lbnQgZGVzIMOpcGlzb2Rlc1xyXG4gICAgICAgIGlmIChsZW4gPiAwKSB7XHJcbiAgICAgICAgICAgIGlmIChkZWJ1ZylcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCd1cGRhdGVBZ2VuZGEgLSBuYiBjb250YWluZXJzOiAlZCcsIGxlbik7XHJcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodGltZXJVQSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAoZGVidWcpXHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygndXBkYXRlQWdlbmRhIGVuIGF0dGVudGUnKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBwYXJhbXMgPSB7XHJcbiAgICAgICAgICAgIGxpbWl0OiAxLFxyXG4gICAgICAgICAgICBvcmRlcjogJ3NtYXJ0JyxcclxuICAgICAgICAgICAgc2hvd3NMaW1pdDogbGVuLFxyXG4gICAgICAgICAgICByZWxlYXNlZDogMSxcclxuICAgICAgICAgICAgc3BlY2lhbHM6IGZhbHNlLFxyXG4gICAgICAgICAgICBzdWJ0aXRsZXM6ICdhbGwnXHJcbiAgICAgICAgfTtcclxuICAgICAgICBCYXNlXzEuQmFzZS5jYWxsQXBpKCdHRVQnLCAnZXBpc29kZXMnLCAnbGlzdCcsIHBhcmFtcylcclxuICAgICAgICAgICAgLnRoZW4oKGRhdGEpID0+IHtcclxuICAgICAgICAgICAgZm9yIChsZXQgdCA9IDA7IHQgPCBsZW47IHQrKykge1xyXG4gICAgICAgICAgICAgICAgJCgkY29udGFpbmVyc0VwaXNvZGUuZ2V0KHQpKVxyXG4gICAgICAgICAgICAgICAgICAgIC5kYXRhKCdzaG93SWQnLCBkYXRhLnNob3dzW3RdLmlkKVxyXG4gICAgICAgICAgICAgICAgICAgIC5kYXRhKCdjb2RlJywgZGF0YS5zaG93c1t0XS51bnNlZW5bMF0uY29kZS50b0xvd2VyQ2FzZSgpKTtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRTaG93SWRzW2RhdGEuc2hvd3NbdF0uaWRdID0geyBjb2RlOiBkYXRhLnNob3dzW3RdLnVuc2VlblswXS5jb2RlLnRvTG93ZXJDYXNlKCkgfTtcclxuICAgICAgICAgICAgICAgIC8vaWYgKGRlYnVnKSBjb25zb2xlLmxvZygndGl0bGU6ICVzIC0gY29kZTogJXMnLCB0aXRsZSwgZXBpc29kZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBpZiAoJCgnLnVwZGF0ZUVsZW1lbnRzJykubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgIC8vIE9uIGFqb3V0ZSBsZSBib3V0b24gZGUgbWlzZSDDoCBqb3VyIGRlcyBzaW1pbGFpcmVzXHJcbiAgICAgICAgICAgICQoJy5tYWludGl0bGUgPiBkaXY6bnRoLWNoaWxkKDEpJykuYWZ0ZXIoYFxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInVwZGF0ZUVsZW1lbnRzXCI+XHJcbiAgICAgICAgICAgICAgICAgIDxpbWcgc3JjPVwiJHtzZXJ2ZXJCYXNlVXJsfS9pbWcvdXBkYXRlLnBuZ1wiIHdpZHRoPVwiMjBcIiBjbGFzcz1cInVwZGF0ZUVwaXNvZGVzIHVwZGF0ZUVsZW1lbnQgZmluaXNoXCIgdGl0bGU9XCJNaXNlIMOgIGpvdXIgZGVzIHNpbWlsYWlyZXMgdnVzXCIvPlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIGApO1xyXG4gICAgICAgICAgICBhZGRTY3JpcHRBbmRMaW5rKCdtb21lbnQnKTtcclxuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBhZGRTY3JpcHRBbmRMaW5rKCdsb2NhbGVmcicpO1xyXG4gICAgICAgICAgICB9LCAyNTApO1xyXG4gICAgICAgICAgICAkKCcudXBkYXRlRXBpc29kZXMnKS5jbGljaygoZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgIGlmIChkZWJ1ZylcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmdyb3VwQ29sbGFwc2VkKCdBZ2VuZGEgdXBkYXRlRXBpc29kZXMnKTtcclxuICAgICAgICAgICAgICAgICRjb250YWluZXJzRXBpc29kZSA9ICQoJyNyZWFjdGpzLWVwaXNvZGVzLXRvLXdhdGNoIC5Db21wb25lbnRFcGlzb2RlQ29udGFpbmVyJyk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBzZWxmID0gJChlLmN1cnJlbnRUYXJnZXQpLCBsZW4gPSAkY29udGFpbmVyc0VwaXNvZGUubGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgc2VsZi5yZW1vdmVDbGFzcygnZmluaXNoJyk7XHJcbiAgICAgICAgICAgICAgICBsZXQgY291bnRJbnRUaW1lID0gMDtcclxuICAgICAgICAgICAgICAgIE1lZGlhXzEuTWVkaWEuY2FsbEFwaSgnR0VUJywgJ2VwaXNvZGVzJywgJ2xpc3QnLCB7IGxpbWl0OiAxLCBvcmRlcjogJ3NtYXJ0Jywgc2hvd3NMaW1pdDogbGVuLCByZWxlYXNlZDogMSwgc3BlY2lhbHM6IGZhbHNlLCBzdWJ0aXRsZXM6ICdhbGwnIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oKGRhdGEpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgaW50VGltZSA9IHNldEludGVydmFsKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCsrY291bnRJbnRUaW1lID4gNjApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaW50VGltZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmFkZENsYXNzKCdmaW5pc2gnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbignRXJyZXVyIGRlIG1pc2Ugw6Agam91ciBkZXMgw6lwaXNvZGVzJywgJ3VwZGF0ZUFnZW5kYTogdXBkYXRlRXBpc29kZXMuY2xpY2sgaW50ZXJ2YWwgdGltZSBvdmVyJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGVidWcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5ncm91cEVuZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgbW9tZW50ICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRUaW1lKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbW9tZW50LmxvY2FsZSgnZnInKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG5ld1Nob3dJZHMgPSB7fSwgc2hvdztcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRlYnVnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3VwZGF0ZUFnZW5kYSB1cGRhdGVFcGlzb2RlcycsIGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBzID0gMDsgcyA8IGRhdGEuc2hvd3MubGVuZ3RoOyBzKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNob3cgPSBkYXRhLnNob3dzW3NdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3U2hvd0lkc1tzaG93LmlkXSA9IHsgY29kZTogc2hvdy51bnNlZW5bMF0uY29kZS50b0xvd2VyQ2FzZSgpIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudFNob3dJZHNbc2hvdy5pZF0gPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkZWJ1ZylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1VuZSBub3V2ZWxsZSBzw6lyaWUgZXN0IGFycml2w6llJywgc2hvdyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWwgcydhZ2l0IGQndW5lIG5vdXZlbGxlIHPDqXJpZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRPRE8gQWpvdXRlciB1biBub3V2ZWF1IGNvbnRhaW5lclxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBuZXdDb250YWluZXIgPSAkKGJ1aWxkQ29udGFpbmVyKHNob3cudW5zZWVuWzBdKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVuZGVyTm90ZShzaG93LnVuc2VlblswXS5ub3RlLm1lYW4sIG5ld0NvbnRhaW5lcik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJCgkY29udGFpbmVyc0VwaXNvZGUuZ2V0KHMpKS5wYXJlbnQoKS5hZnRlcihuZXdDb250YWluZXIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkZWJ1ZylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdJdGVyYXRpb24gcHJpbmNpcGFsZScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgY29udGFpbmVyLCB1bnNlZW47XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEl0w6lyYXRpb24gcHJpbmNpcGFsZSBzdXIgbGVzIGNvbnRhaW5lcnNcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgZSA9IDA7IGUgPCBsZW47IGUrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyID0gJCgkY29udGFpbmVyc0VwaXNvZGUuZ2V0KGUpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVuc2VlbiA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTaSBsYSBzZXJpZSBuJ2VzdCBwbHVzIGRhbnMgbGEgbGlzdGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdTaG93SWRzW2NvbnRhaW5lci5kYXRhKCdzaG93SWQnKV0gPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkZWJ1ZylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0xhIHPDqXJpZSAlZCBuZSBmYWl0IHBsdXMgcGFydGllIGRlIGxhIGxpc3RlJywgY29udGFpbmVyLmRhdGEoJ3Nob3dJZCcpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250YWluZXIucGFyZW50KCkucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29udGFpbmVyLmRhdGEoJ3Nob3dJZCcpID09IGRhdGEuc2hvd3NbZV0uaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1bnNlZW4gPSBkYXRhLnNob3dzW2VdLnVuc2VlblswXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IHUgPSAwOyB1IDwgbGVuOyB1KyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvbnRhaW5lci5kYXRhKCdzaG93SWQnKSA9PSBkYXRhLnNob3dzW3VdLmlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1bnNlZW4gPSBkYXRhLnNob3dzW3VdLnVuc2VlblswXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHVuc2VlbiAmJiBjb250YWluZXIuZGF0YSgnY29kZScpICE9PSB1bnNlZW4uY29kZS50b0xvd2VyQ2FzZSgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRlYnVnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnRXBpc29kZSDDoCBtZXR0cmUgw6Agam91cicsIHVuc2Vlbik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTWV0dHJlIMOgIGpvdXIgbCfDqXBpc29kZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBtYWluTGluayA9ICQoJ2EubWFpbkxpbmsnLCBjb250YWluZXIpLCB0ZXh0ID0gdW5zZWVuLmNvZGUgKyAnIC0gJyArIHVuc2Vlbi50aXRsZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBPbiBtZXQgw6Agam91ciBsZSB0aXRyZSBldCBsZSBsaWVuIGRlIGwnw6lwaXNvZGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYWluTGluay5hdHRyKCdocmVmJywgbWFpbkxpbmsuYXR0cignaHJlZicpLnJlcGxhY2UoL3NcXGR7Mn1lXFxkezJ9LywgdW5zZWVuLmNvZGUudG9Mb3dlckNhc2UoKSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1haW5MaW5rLmF0dHIoJ3RpdGxlJywgYEFjY8OpZGVyIMOgIGxhIGZpY2hlIGRlIGwnw6lwaXNvZGUgJHt0ZXh0fWApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1haW5MaW5rLnRleHQodGV4dCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gT24gbWV0IMOgIGpvdXIgbGEgZGF0ZSBkZSBzb3J0aWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKCcuZGF0ZSAubWFpblRpbWUnLCBjb250YWluZXIpLnRleHQobW9tZW50KHVuc2Vlbi5kYXRlKS5mb3JtYXQoJ0QgTU1NTSBZWVlZJykpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE9uIG1ldCDDoCBqb3VyIGxhIHN5bm9wc2lzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJCgnLm1fcyBwLm1fYXknLCBjb250YWluZXIpLmh0bWwodW5zZWVuLmRlc2NyaXB0aW9uKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBPbiBtZXQgw6Agam91ciBsYSBiYXJyZSBkZSBwcm9ncmVzc2lvblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoJy5tZWRpYS1sZWZ0ID4gLm1fYWIgPiAubV9hZycsIGNvbnRhaW5lcikuY3NzKCd3aWR0aCcsIFN0cmluZyh1bnNlZW4uc2hvdy5wcm9ncmVzcykgKyAnJScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE9uIG1ldCDDoCBqb3VyIGxhIG5vdGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW5kZXJOb3RlKHVuc2Vlbi5ub3RlLm1lYW4sIGNvbnRhaW5lcik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnRXBpc29kZSBTaG93IHVuY2hhbmdlZCcsIHVuc2Vlbik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZm5MYXp5LmluaXQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5hZGRDbGFzcygnZmluaXNoJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkZWJ1ZylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZ3JvdXBFbmQoKTtcclxuICAgICAgICAgICAgICAgICAgICB9LCA1MDApO1xyXG4gICAgICAgICAgICAgICAgfSwgKGVycikgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbignRXJyZXVyIGRlIG1pc2Ugw6Agam91ciBkZXMgw6lwaXNvZGVzJywgJ3VwZGF0ZUFnZW5kYTogJyArIGVycik7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRlYnVnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmdyb3VwRW5kKCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFBlcm1ldCBkJ2FmZmljaGVyIHVuZSBub3RlIGF2ZWMgZGVzIMOpdG9pbGVzXHJcbiAgICAgICAgICogQHBhcmFtICB7TnVtYmVyfSBub3RlICAgICAgTGEgbm90ZSDDoCBhZmZpY2hlclxyXG4gICAgICAgICAqIEBwYXJhbSAge09iamVjdH0gY29udGFpbmVyIERPTUVsZW1lbnQgY29udGVuYW50IGxhIG5vdGUgw6AgYWZmaWNoZXJcclxuICAgICAgICAgKiBAcmV0dXJuIHt2b2lkfVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIHJlbmRlck5vdGUobm90ZSwgY29udGFpbmVyKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHJlbmRlclN0YXJzID0gJCgnLmRhdGUgLnN0YXJzJywgY29udGFpbmVyKTtcclxuICAgICAgICAgICAgaWYgKHJlbmRlclN0YXJzLmxlbmd0aCA8PSAwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmVuZGVyU3RhcnMuZW1wdHkoKTtcclxuICAgICAgICAgICAgcmVuZGVyU3RhcnMuYXR0cigndGl0bGUnLCBgJHtwYXJzZUZsb2F0KG5vdGUpLnRvRml4ZWQoMSl9IC8gNWApO1xyXG4gICAgICAgICAgICBsZXQgdHlwZVN2ZztcclxuICAgICAgICAgICAgQXJyYXkuZnJvbSh7XHJcbiAgICAgICAgICAgICAgICBsZW5ndGg6IDVcclxuICAgICAgICAgICAgfSwgKGluZGV4LCBudW1iZXIpID0+IHtcclxuICAgICAgICAgICAgICAgIHR5cGVTdmcgPSBub3RlIDw9IG51bWJlciA/IFwiZW1wdHlcIiA6IChub3RlIDwgbnVtYmVyICsgMSkgPyAnaGFsZicgOiBcImZ1bGxcIjtcclxuICAgICAgICAgICAgICAgIHJlbmRlclN0YXJzLmFwcGVuZChgXHJcbiAgICAgICAgICAgICAgICAgICAgPHN2ZyB2aWV3Qm94PVwiMCAwIDEwMCAxMDBcIiBjbGFzcz1cInN0YXItc3ZnXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8dXNlIHhtbG5zOnhsaW5rPVwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGlua1wiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHhsaW5rOmhyZWY9XCIjaWNvbi1zdGFyLSR7dHlwZVN2Z31cIj5cclxuICAgICAgICAgICAgICAgICAgICAgIDwvdXNlPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvc3ZnPlxyXG4gICAgICAgICAgICAgICAgYCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBQZXJtZXQgZGUgY29uc3RydWlyZSBsZSBjb250YWluZXIgZCd1biBlcGlzb2RlXHJcbiAgICAgICAgICogQHBhcmFtICB7T2JqZWN0fSB1bnNlZW4gQ29ycmVzcG9uZCDDoCBsJ29iamV0IEVwaXNvZGUgbm9uIHZ1XHJcbiAgICAgICAgICogQHJldHVybiB7U3RyaW5nfVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIGJ1aWxkQ29udGFpbmVyKHVuc2Vlbikge1xyXG4gICAgICAgICAgICBsZXQgZGVzY3JpcHRpb24gPSB1bnNlZW4uZGVzY3JpcHRpb247XHJcbiAgICAgICAgICAgIGlmIChkZXNjcmlwdGlvbi5sZW5ndGggPD0gMCkge1xyXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb24gPSAnQXVjdW5lIGRlc2NyaXB0aW9uJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChkZXNjcmlwdGlvbi5sZW5ndGggPiAxNDUpIHtcclxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uID0gZGVzY3JpcHRpb24uc3Vic3RyaW5nKDAsIDE0NSkgKyAn4oCmJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCB1cmxTaG93ID0gdW5zZWVuLnJlc291cmNlX3VybC5yZXBsYWNlKCdlcGlzb2RlJywgJ3NlcmllJykucmVwbGFjZSgvXFwvc1xcZHsyfWVcXGR7Mn0kLywgJycpO1xyXG4gICAgICAgICAgICBsZXQgdGVtcGxhdGUgPSBgXHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJhNl9iYSBkaXNwbGF5RmxleCBqdXN0aWZ5Q29udGVudFNwYWNlQmV0d2VlblwiIHN0eWxlPVwib3BhY2l0eTogMTsgdHJhbnNpdGlvbjogb3BhY2l0eSAzMDBtcyBlYXNlLW91dCAwcywgdHJhbnNmb3JtO1wiPlxyXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJhNl9hOCBDb21wb25lbnRFcGlzb2RlQ29udGFpbmVyIG1lZGlhXCI+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibWVkaWEtbGVmdFwiPlxyXG4gICAgICAgICAgICAgICAgICA8aW1nIGNsYXNzPVwianMtbGF6eS1pbWFnZSBncmV5Qm9yZGVyIGE2X2EyXCIgZGF0YS1zcmM9XCJodHRwczovL2FwaS5iZXRhc2VyaWVzLmNvbS9waWN0dXJlcy9zaG93cz9rZXk9JHtiZXRhc2VyaWVzX2FwaV91c2VyX2tleX0maWQ9JHt1bnNlZW4uc2hvdy5pZH0md2lkdGg9MTE5JmhlaWdodD0xNzRcIiB3aWR0aD1cIjExOVwiIGhlaWdodD1cIjE3NFwiIGFsdD1cIkFmZmljaGUgZGUgbGEgc8OpcmllICR7dW5zZWVuLnNob3cudGl0bGV9XCI+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJhNl9iYyBtZWRpYS1ib2R5IGFsaWduU2VsZlN0cmV0Y2ggZGlzcGxheUZsZXggZmxleERpcmVjdGlvbkNvbHVtblwiPlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibWVkaWFcIj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibWVkaWEtYm9keSBtaW5XaWR0aDAgYWxpZ25TZWxmU3RyZXRjaCBkaXNwbGF5RmxleCBmbGV4RGlyZWN0aW9uQ29sdW1uIGFsaWduSXRlbXNGbGV4U3RhcnRcIj5cclxuICAgICAgICAgICAgICAgICAgICAgIDxhIGNsYXNzPVwiYTZfYnAgZGlzcGxheUJsb2NrIG5kXCIgaHJlZj1cIiR7dXJsU2hvd31cIiB0aXRsZT1cIiR7dHJhbnMoXCJhZ2VuZGEuZXBpc29kZXNfd2F0Y2guc2hvd19saW5rX3RpdGxlXCIsIHsgdGl0bGU6IHVuc2Vlbi5zaG93LnRpdGxlIH0pfVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8c3Ryb25nPiR7dW5zZWVuLnNob3cudGl0bGV9PC9zdHJvbmc+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8L2E+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8YSBjbGFzcz1cImE2X2JwIGE2X2FrIG1haW5MaW5rIGRpc3BsYXlCbG9jayBuZFwiIGhyZWY9XCIke3Vuc2Vlbi5yZXNvdXJjZV91cmx9XCIgdGl0bGU9XCIke3RyYW5zKFwiYWdlbmRhLmVwaXNvZGVzX3dhdGNoLmVwaXNvZGVfbGlua190aXRsZVwiLCB7IGNvZGU6IHVuc2Vlbi5jb2RlLnRvVXBwZXJDYXNlKCksIHRpdGxlOiB1bnNlZW4udGl0bGUgfSl9XCI+JHt1bnNlZW4uY29kZS50b1VwcGVyQ2FzZSgpfSAtICR7dW5zZWVuLnRpdGxlfTwvYT5cclxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkYXRlIGRpc3BsYXlGbGV4IGE2X2J2XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDx0aW1lIGNsYXNzPVwibWFpblRpbWVcIj4ke21vbWVudCh1bnNlZW4uZGF0ZSkuZm9ybWF0KCdEIE1NTU0gWVlZWScpfTwvdGltZT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJzdGFyc1wiIHRpdGxlPVwiXCI+PC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImE2X2JoIG1lZGlhLXJpZ2h0XCIgZGF0YS10b3VyPVwic3RlcDogNjsgdGl0bGU6ICR7dHJhbnMoXCJ0b3VyZ3VpZGUuc2VyaWVzLWFnZW5kYS42LnRpdGxlXCIpfTsgY29udGVudDogJHt0cmFucyhcInRvdXJndWlkZS5zZXJpZXMtYWdlbmRhLjYuY29udGVudFwiKX07XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGlzcGxheUZsZXggYWxpZ25JdGVtc0NlbnRlclwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0bi1yZXNldCBhbGlnblNlbGZDZW50ZXIgaWpfaWwgaWpfaW5cIj48L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPHAgY2xhc3M9XCJhNl9idFwiIHN0eWxlPVwibWFyZ2luOiAxMXB4IDBweCAxMHB4O1wiPiR7ZGVzY3JpcHRpb259PC9wPlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibWVkaWFcIj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibWVkaWEtbGVmdCBhbGlnblNlbGZDZW50ZXJcIj5cclxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJhNl9ialwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYTZfYm5cIiBzdHlsZT1cIndpZHRoOiAke3Vuc2Vlbi5zaG93LnByb2dyZXNzfSU7XCI+PC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibWVkaWEtYm9keSBhbGlnblNlbGZDZW50ZXIgZGlzcGxheUZsZXggZmxleERpcmVjdGlvbkNvbHVtbiBhbGlnbkl0ZW1zRmxleFN0YXJ0XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImE2X2JsXCI+JHtzZWNvbmRzVG9EaG1zKHVuc2Vlbi5zaG93Lm1pbnV0ZXNfcmVtYWluaW5nICogNjApfSAoJHt1bnNlZW4uc2hvdy5yZW1haW5pbmd9IMOpcC4pPC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1lZGlhXCIgc3R5bGU9XCJtYXJnaW4tdG9wOiA5cHg7XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1lZGlhLWJvZHkgYWxpZ25TZWxmQ2VudGVyXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibGlzdEF2YXRhcnMgbGlzdEF2YXRhcnMtLXNtYWxsIG1hcmdpblRvcEF1dG9cIj4ke3dhdGNoZWRBdmF0YXIodW5zZWVuLndhdGNoZWRfYnkpfTwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJhNl9hcSBtZWRpYS1yaWdodCBhbGlnblNlbGZDZW50ZXIgcG9zaXRpb25SZWxhdGl2ZVwiIGRhdGEtdG91cj1cInN0ZXA6IDU7IHRpdGxlOiBNYXNxdWVyIHVuIMOpcGlzb2RlOyBjb250ZW50OiBTaSB2b3VzIGxlIHNvdWhhaXRleiwgY2hvaXNpc3NleiBkZSBtYXNxdWVyIGNldCDDqXBpc29kZSBkZSB2b3RyZSBsaXN0ZSBk4oCZw6lwaXNvZGVzIMOgIHJlZ2FyZGVyIG91IHJldHJvdXZlei1lbiBsZXMgc291cy10aXRyZXMuO1wiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRpc3BsYXlGbGV4XCI+YDtcclxuICAgICAgICAgICAgaWYgKHVuc2Vlbi5zdWJ0aXRsZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgdGVtcGxhdGUgKz0gYFxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwic3ZnQ29udGFpbmVyIGE2XzBcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICA8c3ZnIGNsYXNzPVwiU3ZnU3VidGl0bGVzXCIgd2lkdGg9XCIyMFwiIGhlaWdodD1cIjE2XCIgdmlld0JveD1cIjAgMCAyMCAxNlwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxnIGZpbGw9XCJub25lXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9XCJNMi4wODMuNzUxYzIuMzg5LS41MDEgNS4wMjgtLjc1MSA3LjkxNy0uNzUxIDIuOTM5IDAgNS42MTkuMjU5IDguMDQuNzc4Ljc1LjE2MSAxLjM0Mi43MzYgMS41MjQgMS40ODEuMjkgMS4xODguNDM1IDMuMTAyLjQzNSA1Ljc0MnMtLjE0NSA0LjU1NC0uNDM1IDUuNzQyYy0uMTgyLjc0NS0uNzc0IDEuMzItMS41MjQgMS40ODEtMi40MjEuNTE4LTUuMTAxLjc3OC04LjA0Ljc3OC0yLjg5IDAtNS41MjktLjI1LTcuOTE3LS43NTEtLjczNC0uMTU0LTEuMzIxLS43MDYtMS41MTktMS40My0uMzc2LTEuMzc1LS41NjQtMy4zMTUtLjU2NC01LjgxOXMuMTg4LTQuNDQzLjU2NC01LjgxOWMuMTk4LS43MjQuNzg0LTEuMjc2IDEuNTE5LTEuNDN6XCI+PC9wYXRoPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cGF0aCBjbGFzcz1cIlN2Z1N1YnRpdGxlc19fc3Ryb2tlXCIgc3Ryb2tlPVwiI0MxRTFGQVwiIGQ9XCJNMi4yMzcgMS40ODVjLS40NTkuMDk2LS44MjUuNDQxLS45NDkuODk0LS4zNTYgMS4zLS41MzggMy4xNzgtLjUzOCA1LjYyMSAwIDIuNDQzLjE4MiA0LjMyMS41MzggNS42MjEuMTI0LjQ1Mi40OS43OTcuOTQ5Ljg5NCAyLjMzNi40OSA0LjkyMy43MzUgNy43NjMuNzM1IDIuODg5IDAgNS41MTYtLjI1NCA3Ljg4My0uNzYxLjQ2OS0uMS44MzktLjQ2Ljk1My0uOTI2LjI3My0xLjExNi40MTQtMi45NzkuNDE0LTUuNTY0IDAtMi41ODQtLjE0MS00LjQ0Ny0uNDE0LTUuNTYzLS4xMTQtLjQ2Ni0uNDg0LS44MjUtLjk1My0uOTI2LTIuMzY3LS41MDctNC45OTUtLjc2MS03Ljg4My0uNzYxLTIuODQgMC01LjQyOC4yNDYtNy43NjMuNzM1elwiPjwvcGF0aD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHBhdGggY2xhc3M9XCJTdmdTdWJ0aXRsZXNfX2ZpbGxcIiBmaWxsPVwiI0MxRTFGQVwiIGQ9XCJNNCA3aDEydjJoLTEyem0yIDNoOHYyaC04elwiPjwvcGF0aD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L3N2Zz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+YDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0ZW1wbGF0ZSArPSBgXHJcbiAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibWVkaWEtcmlnaHQgYWxpZ25TZWxmQ2VudGVyIHBvc2l0aW9uUmVsYXRpdmVcIiBzdHlsZT1cIm1pbi1oZWlnaHQ6IDI0cHg7XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwicG9zaXRpb25SZWxhdGl2ZVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYnRuLWdyb3VwXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBpZD1cImRyb3Bkb3duU3VidGl0bGUtODg5OVwiIHJvbGU9XCJidXR0b25cIiBhcmlhLWhhc3BvcHVwPVwidHJ1ZVwiIGFyaWEtZXhwYW5kZWQ9XCJmYWxzZVwiIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImE2X2FzIGJ0bi1yZXNldCBkcm9wZG93bi10b2dnbGUgLXRvZ2dsZSBidG4gYnRuLWRlZmF1bHRcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwic3ZnQ29udGFpbmVyXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzdmcgZmlsbD1cIiM5OTlcIiB3aWR0aD1cIjRcIiBoZWlnaHQ9XCIxNlwiIHZpZXdCb3g9XCIwIDAgNCAxNlwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPVwiTTIgNGMxLjEgMCAyLS45IDItMnMtLjktMi0yLTItMiAuOS0yIDIgLjkgMiAyIDJ6bTAgMmMtMS4xIDAtMiAuOS0yIDJzLjkgMiAyIDIgMi0uOSAyLTItLjktMi0yLTJ6bTAgNmMtMS4xIDAtMiAuOS0yIDJzLjkgMiAyIDIgMi0uOSAyLTItLjktMi0yLTJ6XCIgZmlsbC1ydWxlPVwibm9uemVyb1wiIGZpbGw9XCJpbmhlcml0XCI+PC9wYXRoPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3N2Zz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiY2FyZXRcIj48L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHVsIHJvbGU9XCJtZW51XCIgY2xhc3M9XCItbWVudVwiIGFyaWEtbGFiZWxsZWRieT1cImRyb3Bkb3duU3VidGl0bGUtODg5OVwiPjwvdWw+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZHJvcGRvd24tbWVudSBkcm9wZG93bi1tZW51LS10b3BSaWdodCBob19oeVwiIGFyaWEtbGFiZWxsZWRieT1cImRyb3Bkb3duU3VidGl0bGUtODg5OVwiIHN0eWxlPVwidG9wOiAwcHg7XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInNvdXNUaXRyZXNcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJob19odVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImhvX2cgYnRuLXJlc2V0IGJ0bi1idG4gYnRuLS1ncmV5XCI+TmUgcGFzIHJlZ2FyZGVyIGNldCDDqXBpc29kZTwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImhvX2cgYnRuLXJlc2V0IGJ0bi1idG4gYnRuLWJsdWUyXCI+SidhaSByw6ljdXDDqXLDqSBjZXQgw6lwaXNvZGU8L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHtyZW5kZXJTdWJ0aXRsZXModW5zZWVuKX1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIGA7XHJcbiAgICAgICAgICAgIHJldHVybiB0ZW1wbGF0ZTtcclxuICAgICAgICAgICAgZnVuY3Rpb24gd2F0Y2hlZEF2YXRhcihmcmllbmRzKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdGVtcGxhdGUgPSAnJywgZnJpZW5kO1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgZiA9IDA7IGYgPCBmcmllbmRzLmxlbmd0aDsgZisrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZnJpZW5kID0gZnJpZW5kc1tmXTtcclxuICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZSArPSBgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxhIGhyZWY9XCIvbWVtYnJlLyR7ZnJpZW5kLmxvZ2lufVwiIGNsYXNzPVwibGlzdEF2YXRhclwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxpbWcgY2xhc3M9XCJqcy1sYXp5LWltYWdlXCIgZGF0YS1zcmM9XCJodHRwczovL2FwaS5iZXRhc2VyaWVzLmNvbS9waWN0dXJlcy9tZW1iZXJzP2tleT0ke2JldGFzZXJpZXNfYXBpX3VzZXJfa2V5fSZpZD0ke2ZyaWVuZC5pZH0md2lkdGg9MjQmaGVpZ2h0PTI0JnBsYWNlaG9sZGVyPXBuZ1wiIHdpZHRoPVwiMjRcIiBoZWlnaHQ9XCIyNFwiIGFsdD1cIkF2YXRhciBkZSAke2ZyaWVuZC5sb2dpbn1cIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9hPmA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGVtcGxhdGU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZnVuY3Rpb24gc2Vjb25kc1RvRGhtcyhzZWNvbmRzKSB7XHJcbiAgICAgICAgICAgICAgICBzZWNvbmRzID0gTnVtYmVyKHNlY29uZHMpO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZCA9IE1hdGguZmxvb3Ioc2Vjb25kcyAvICgzNjAwICogMjQpKSwgaCA9IE1hdGguZmxvb3Ioc2Vjb25kcyAlICgzNjAwICogMjQpIC8gMzYwMCksIG0gPSBNYXRoLmZsb29yKHNlY29uZHMgJSAzNjAwIC8gNjApO1xyXG4gICAgICAgICAgICAgICAgLy9zID0gTWF0aC5mbG9vcihzZWNvbmRzICUgNjApO1xyXG4gICAgICAgICAgICAgICAgbGV0IGREaXNwbGF5ID0gZCA+IDAgPyBkICsgJyBqICcgOiAnJywgaERpc3BsYXkgPSBoID4gMCA/IGggKyAnIGggJyA6ICcnLCBtRGlzcGxheSA9IG0gPj0gMCAmJiBkIDw9IDAgPyBtICsgJyBtaW4nIDogJyc7XHJcbiAgICAgICAgICAgICAgICAvL3NEaXNwbGF5ID0gcyA+IDAgPyBzICsgKHMgPT0gMSA/IFwiIHNlY29uZFwiIDogXCIgc2Vjb25kc1wiKSA6IFwiXCI7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZERpc3BsYXkgKyBoRGlzcGxheSArIG1EaXNwbGF5O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIHJlbmRlclN1YnRpdGxlcyh1bnNlZW4pIHtcclxuICAgICAgICAgICAgICAgIGlmICh1bnNlZW4uc3VidGl0bGVzLmxlbmd0aCA8PSAwKVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAnJztcclxuICAgICAgICAgICAgICAgIGxldCB0ZW1wbGF0ZSA9IGBcclxuICAgICAgICAgICAgICAgIDxkaXY+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJob19naCBDb21wb25lbnRUaXRsZURyb3Bkb3duXCI+U291cy10aXRyZXMgZGUgbCfDqXBpc29kZTwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPVwiZGlzcGxheTogZ3JpZDsgcm93LWdhcDogNXB4O1wiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtYXhIZWlnaHQyODBweCBvdmVyZmxvd1lTY3JvbGxcIj5cclxuICAgICAgICAgICAgICAgICAgICAgIDxkaXY+YDtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IHN0ID0gMDsgc3QgPCB1bnNlZW4uc3VidGl0bGVzLmxlbmd0aDsgc3QrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBzdWJ0aXRsZSA9IHVuc2Vlbi5zdWJ0aXRsZXNbc3RdO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzdCA+IDApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlICs9ICc8ZGl2IHN0eWxlPVwibWFyZ2luLXRvcDogNXB4O1wiPic7XHJcbiAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGUgKz0gYFxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPVwiYWxpZ24taXRlbXM6IGNlbnRlcjsgZGlzcGxheTogZmxleDsganVzdGlmeS1jb250ZW50OiBmbGV4LXN0YXJ0O1wiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzdmdDb250YWluZXJcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzdmcgY2xhc3M9XCJTdmdQZXJ0aW5lbmNlXCIgZmlsbD1cIiNFRUVcIiB3aWR0aD1cIjE2XCIgaGVpZ2h0PVwiMTZcIiB2aWV3Qm94PVwiMCAwIDE2IDE2XCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cmVjdCBmaWxsPVwiJHtzdWJ0aXRsZS5xdWFsaXR5ID49IDEgPyAnIzk5OScgOiAnaW5oZXJpdCd9XCIgeD1cIjBcIiB5PVwiMTBcIiB3aWR0aD1cIjRcIiBoZWlnaHQ9XCI2XCI+PC9yZWN0PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cmVjdCBmaWxsPVwiJHtzdWJ0aXRsZS5xdWFsaXR5ID49IDMgPyAnIzk5OScgOiAnaW5oZXJpdCd9XCIgeD1cIjZcIiB5PVwiNVwiIHdpZHRoPVwiNFwiIGhlaWdodD1cIjExXCI+PC9yZWN0PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cmVjdCBmaWxsPVwiJHtzdWJ0aXRsZS5xdWFsaXR5ID49IDUgPyAnIzk5OScgOiAnaW5oZXJpdCd9XCIgeD1cIjEyXCIgeT1cIjBcIiB3aWR0aD1cIjRcIiBoZWlnaHQ9XCIxNlwiPjwvcmVjdD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3ZnPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJDb21wb25lbnRMYW5nXCIgc3R5bGU9XCJib3JkZXI6IDFweCBzb2xpZCBjdXJyZW50Y29sb3I7IGJvcmRlci1yYWRpdXM6IDRweDsgY29sb3I6IHJnYig1MSwgNTEsIDUxKTsgZmxleC1zaHJpbms6IDA7IGZvbnQtc2l6ZTogMTBweDsgZm9udC13ZWlnaHQ6IDcwMDsgaGVpZ2h0OiAxOHB4OyBsaW5lLWhlaWdodDogMTdweDsgbWFyZ2luOiAwcHggMTBweCAwcHggNXB4OyBtaW4td2lkdGg6IDIycHg7IHBhZGRpbmc6IDBweCAzcHg7IHRleHQtYWxpZ246IGNlbnRlcjtcIj4ke3N1YnRpdGxlLmxhbmd1YWdlfTwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtaW5XaWR0aDBcIiBzdHlsZT1cImZsZXgtZ3JvdzogMTtcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxhIGhyZWY9XCIke3N1YnRpdGxlLnVybH1cIiBjbGFzcz1cImRpc3BsYXlCbG9jayBtYWluTGluayBuZFwiIHRpdGxlPVwiUHJvdmVuYW5jZSA6ICR7c3VidGl0bGUuc291cmNlfSAvICR7c3VidGl0bGUuZmlsZX0gLyBBam91dMOpIGxlICR7bW9tZW50KHN1YnRpdGxlLmRhdGUpLmZvcm1hdCgnREQvTU0vWVlZWScpfVwiIHN0eWxlPVwibWF4LXdpZHRoOiAzNjVweDsgbWFyZ2luOiAwcHg7IGZvbnQtc2l6ZTogMTJweDtcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHtlbGxpcHNpc1N1YnRpdGxlcyhzdWJ0aXRsZSl9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2E+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiB0aXRsZT1cIlNpZ25hbGVyIGNlIHNvdXMtdGl0cmVcIiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4tcmVzZXRcIiBvbmNsaWNrPVwic3J0SW5hY2N1cmF0ZSgke3N1YnRpdGxlLmlkfSk7XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInN2Z0NvbnRhaW5lclwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3ZnIGZpbGw9XCIjZWVlXCIgd2lkdGg9XCIyMlwiIGhlaWdodD1cIjE5XCIgdmlld0JveD1cIjAgMCAyMiAxOVwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPVwiTTAgMTloMjJsLTExLTE5LTExIDE5em0xMi0zaC0ydi0yaDJ2MnptMC00aC0ydi00aDJ2NHpcIiBmaWxsLXJ1bGU9XCJub256ZXJvXCIgZmlsbD1cImluaGVyaXRcIj48L3BhdGg+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3ZnPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgYDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRlbXBsYXRlICs9IGBcclxuICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgYDtcclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGVsbGlwc2lzU3VidGl0bGVzKHN1YnRpdGxlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHN1YnRpdGxlTmFtZSA9IHN1YnRpdGxlLmZpbGUsIExJTUlUX0VMTElQU0lTID0gNTA7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN1YnRpdGxlTmFtZS5sZW5ndGggPD0gTElNSVRfRUxMSVBTSVMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGA8ZGl2IGNsYXNzPVwibmQgZGlzcGxheUlubGluZUJsb2NrXCI+JHtzdWJ0aXRsZU5hbWV9PC9kaXY+YDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IExFTkdUSF9MQVNUX0VMTElQU0lTID0gNDU7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGBcclxuICAgICAgICAgICAgICAgICAgICAgIDxkaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJuZCBkaXNwbGF5SW5saW5lQmxvY2tcIiBzdHlsZT1cIm1heC13aWR0aDogNDBweDtcIj4ke3N1YnRpdGxlTmFtZX08L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm5kIGRpc3BsYXlJbmxpbmVCbG9ja1wiPiR7c3VidGl0bGVOYW1lLnNsaWNlKC1MRU5HVEhfTEFTVF9FTExJUFNJUyl9PC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICBgO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRlbXBsYXRlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBBam91dGUgbGUgc3RhdHV0IGRlIGxhIHPDqXJpZSBzdXIgbGEgcGFnZSBkZSBnZXN0aW9uIGRlcyBzw6lyaWVzIGRlIGwndXRpbGlzYXRldXJcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gYWRkU3RhdHVzVG9HZXN0aW9uU2VyaWVzKCkge1xyXG4gICAgICAgIC8vIE9uIHbDqXJpZmllIHF1ZSBsJ3V0aWxpc2F0ZXVyIGVzdCBjb25uZWN0w6kgZXQgcXVlIGxhIGNsw6kgZCdBUEkgZXN0IHJlbnNlaWduw6llXHJcbiAgICAgICAgaWYgKCF1c2VySWRlbnRpZmllZCgpIHx8IGJldGFzZXJpZXNfYXBpX3VzZXJfa2V5ID09PSAnJylcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIGNvbnN0ICRzZXJpZXMgPSAkKCcjbWVtYmVyX3Nob3dzIGRpdi5zaG93SXRlbS5jZicpO1xyXG4gICAgICAgIGlmICgkc2VyaWVzLmxlbmd0aCA8PSAwKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgJHNlcmllcy5lYWNoKGZ1bmN0aW9uIChfaW5kZXgsIHNlcmllKSB7XHJcbiAgICAgICAgICAgIGxldCBpZCA9IHBhcnNlSW50KCQoc2VyaWUpLmRhdGEoJ2lkJyksIDEwKSwgaW5mb3MgPSAkKHNlcmllKS5maW5kKCcuaW5mb3MnKTtcclxuICAgICAgICAgICAgU2hvd18xLlNob3cuZmV0Y2goaWQpLnRoZW4oZnVuY3Rpb24gKHNob3cpIHtcclxuICAgICAgICAgICAgICAgIGluZm9zLmFwcGVuZChgPGJyPlN0YXR1dDogJHsoc2hvdy5pc0VuZGVkKCkpID8gJ1Rlcm1pbsOpZScgOiAnRW4gY291cnMnfWApO1xyXG4gICAgICAgICAgICB9LCAoZXJyKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb24oJ0VycmV1ciBkZSBtb2RpZmljYXRpb24gZFxcJ3VuZSBzw6lyaWUnLCAnYWRkU3RhdHVzVG9HZXN0aW9uU2VyaWVzOiAnICsgZXJyKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn0pKGpRdWVyeSk7XHJcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==