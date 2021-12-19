'use strict';

const DataTypesCache = {
    shows: 'shows',
    episodes: 'episodes',
    movies: 'movies',
    members: 'members'
};
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
        this._data = {};
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
const MediaType = {
    show: 'show',
    movie: 'movie',
    episode: 'episode'
};
const EventTypes = [
    {UPDATE: 'UPDATE'},
    {SAVE: 'SAVE'}
];
const HTTP_VERBS = {
    "GET": "GET",
    "POST": "POST",
    "PUT": "PUT",
    "DELETE": "DELETE",
    "OPTIONS": "OPTIONS"
};
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
                this.characters.push(new Character(data.characters[c]));
            }
        }
        this.comments = [];
        if (data.comments && data.comments instanceof Array) {
            for (let c = 0; c < data.comments.length; c++) {
                this.comments.push(new CommentBS(data.comments[c]));
            }
        }
        this.objNote = (data.note) ? new Note(data.note) : new Note(data.notes);
        this.resource_url = data.resource_url;
        this.title = data.title;
        this.user = new User(data.user);
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
        if (Base.cache instanceof CacheUS) {
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
class Media extends Base {
    followers;
    genres;
    imdb_id;
    language;
    length;
    original_title;
    similars;
    nbSimilars;
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
        this.similars = new Array();
        this.nbSimilars = 0;
        if (data.similars && data.similars instanceof Array) {
            this.similars = data.similars;
            this.nbSimilars = this.similars.length;
        }
        else if (data.similars) {
            this.nbSimilars = parseInt(data.similars);
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
const Picked = [
    {"none": "none"},
    {"banner": "banner"},
    {"show": "show"}
];
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
class Show extends Media {
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
            Base.callApi('GET', 'shows', 'display', { id: id }, force)
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
        return Base.callApi('GET', 'shows', 'display', { id: this.id }, force);
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
            Base.callApi('POST', 'shows', 'show', { id: _this.id })
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
            Base.callApi('DELETE', 'shows', 'show', { id: _this.id })
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
            Media.callApi('POST', 'shows', 'archive', { id: _this.id })
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
            Media.callApi('DELETE', 'shows', 'archive', { id: _this.id })
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
            Media.callApi('POST', 'shows', 'favorite', { id: _this.id })
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
            Media.callApi('DELETE', 'shows', 'favorite', { id: _this.id })
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
    update(force = false, cb = Base.noop) {
        const _this = this;
        return new Promise((resolve, reject) => {
            _this.fetch(force).then(data => {
                _this.fill(data.show);
                _this.save();
                _this.updateRender(() => {
                    resolve(_this);
                    cb();
                    _this._callListeners(EventTypes.UPDATE);
                });
            })
                .catch(err => {
                Media.notification('Erreur de récupération de la ressource Show', 'Show update: ' + err);
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
    updateRender(cb = Base.noop) {
        this.updateProgressBar();
        this.updateNextEpisode();
        let note = this.objNote;
        if (Base.debug) {
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
                if (Base.debug)
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
                if (Base.debug)
                    console.log('Proposition de voter pour la série');
                promise.then(() => {
                    new PopupAlert({
                        title: Base.trans("popin.note.title.show"),
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
        if (Base.debug)
            console.log('updateProgressBar');
        // On met à jour la barre de progression
        jQuery('.progressBarShow').css('width', this.user.status.toFixed(1) + '%');
    }
    /**
     * Met à jour le bloc du prochain épisode à voir
     * @param   {Function} [cb=noop] Fonction de callback
     * @returns {void}
     */
    updateNextEpisode(cb = Base.noop) {
        if (Base.debug)
            console.log('updateNextEpisode');
        const $nextEpisode = jQuery('a.blockNextEpisode');
        if ($nextEpisode.length > 0 && this.user.next && this.user.next.id !== null) {
            if (Base.debug)
                console.log('nextEpisode et show.user.next OK', this.user);
            // Modifier l'image
            const $img = $nextEpisode.find('img'), $remaining = $nextEpisode.find('.remaining div'), $parent = $img.parent('div'), height = $img.attr('height'), width = $img.attr('width'), next = this.user.next, src = `${Base.api.url}/pictures/episodes?key=${Base.userKey}&id=${next.id}&width=${width}&height=${height}`;
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
            if (Base.debug)
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
            const height = 70, width = 124, src = `${Base.api.url}/pictures/episodes?key=${Base.userKey}&id=${res.user.next.id}&width=${width}&height=${height}`, serieTitle = res.resource_url.split('/').pop();
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
                if (Base.debug)
                    console.groupCollapsed('AddShow');
                const done = function () {
                    // On met à jour les boutons Archiver et Favori
                    changeBtnAdd(_this);
                    // On met à jour le bloc du prochain épisode à voir
                    _this.updateNextEpisode(function () {
                        if (Base.debug)
                            console.groupEnd();
                    });
                };
                _this.addToAccount()
                    .then(() => done(), err => {
                    if (err && err.code !== undefined && err.code === 2003) {
                        done();
                        return;
                    }
                    Base.notification('Erreur d\'ajout de la série', err);
                    if (Base.debug)
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
                                data-user-id="${Base.userId}"
                                data-show-favorised="${show.user.favorited ? '1' : ''}">
                            <div class="blockInformations__action">
                            <button class="btn-reset btn-transparent btn-archive" type="button">
                                <span class="svgContainer">
                                <svg fill="#0d151c" height="16" width="16" xmlns="http://www.w3.org/2000/svg">
                                    <path d="m16 8-1.41-1.41-5.59 5.58v-12.17h-2v12.17l-5.58-5.59-1.42 1.42 8 8z"></path>
                                </svg>
                                </span>
                            </button>
                            <div class="label">${Base.trans('show.button.archive.label')}</div>
                            </div>
                            <div class="blockInformations__action">
                            <button class="btn-reset btn-transparent btn-favoris" type="button">
                                <span class="svgContainer">
                                <svg fill="#FFF" width="20" height="19" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M14.5 0c-1.74 0-3.41.81-4.5 2.09C8.91.81 7.24 0 5.5 0 2.42 0 0 2.42 0 5.5c0 3.78 3.4 6.86 8.55 11.54L10 18.35l1.45-1.32C16.6 12.36 20 9.28 20 5.5 20 2.42 17.58 0 14.5 0zm-4.4 15.55l-.1.1-.1-.1C5.14 11.24 2 8.39 2 5.5 2 3.5 3.5 2 5.5 2c1.54 0 3.04.99 3.57 2.36h1.87C11.46 2.99 12.96 2 14.5 2c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"></path>
                                </svg>
                                </span>
                            </button>
                            <div class="label">${Base.trans('show.button.favorite.label')}</div>
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
                                <div class="label">${Base.trans('show.button.add.label')}</div>
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
                                if (Base.debug)
                                    console.log('clean episode %d', e, update);
                                season.episodes[e].updateRender('notSeen', update);
                            }
                            _this.addShowClick();
                        });
                    };
                    new PopupAlert({
                        title: Base.trans("popup.delete_show_success.title"),
                        text: Base.trans("popup.delete_show_success.text", { "%title%": _this.title }),
                        yes: Base.trans("popup.delete_show_success.yes"),
                        callback_yes: afterNotif
                    });
                };
                // Supprimer la série du compte utilisateur
                new PopupAlert({
                    title: Base.trans("popup.delete_show.title", { "%title%": _this.title }),
                    text: Base.trans("popup.delete_show.text", { "%title%": _this.title }),
                    callback_yes: function () {
                        _this.removeFromAccount()
                            .then(() => done(), err => {
                            if (err && err.code !== undefined && err.code === 2004) {
                                done();
                                return;
                            }
                            Media.notification('Erreur de suppression de la série', err);
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
            if (Base.debug)
                console.groupCollapsed('show-archive');
            // Met à jour le bouton d'archivage de la série
            function updateBtnArchive(promise, transform, label, notif) {
                promise.then(() => {
                    const $parent = $(e.currentTarget).parent();
                    $('span', e.currentTarget).css('transform', transform);
                    $('.label', $parent).text(Base.trans(label));
                    if (Base.debug)
                        console.groupEnd();
                }, err => {
                    Base.notification(notif, err);
                    if (Base.debug)
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
            if (Base.debug)
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
                    if (Base.debug)
                        console.groupEnd();
                }, err => {
                    Base.notification('Erreur de favoris de la série', err);
                    if (Base.debug)
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
                    if (Base.debug)
                        console.groupEnd();
                }, err => {
                    Base.notification('Erreur de favoris de la série', err);
                    if (Base.debug)
                        console.groupEnd();
                });
            }
        });
    }
    /**
     * Ajoute la classification dans les détails de la ressource
     */
    addRating() {
        if (Base.debug)
            console.log('addRating');
        if (this.rating) {
            let rating = Base.ratings[this.rating] !== undefined ? Base.ratings[this.rating] : null;
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
class Movie extends Media {
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
            Base.callApi('GET', 'movies', 'movie', { id: id }, force)
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
        this.mediaType = { singular: MediaType.movie, plural: 'movies', className: Movie };
        super.fill(data);
        return this;
    }
}
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
class Season {
    number;
    episodes;
    _show;
    constructor(data, show) {
        this.number = parseInt(data.number, 10);
        this._show = show;
        this.episodes = new Array();
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
            Base.callApi('GET', 'shows', 'episodes', { id: _this._show.id, season: _this.number }, true)
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
class Episode extends Base {
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
            this.subtitles.push(new Subtitle(data.subtitles[s]));
        }
        this.thetvdb_id = parseInt(data.thetvdb_id, 10);
        this.youtube_id = data.youtube_id;
        this.mediaType = { singular: MediaType.episode, plural: 'episodes', className: Episode };
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
            $checkbox.attr('title', Base.trans("member_shows.remove"));
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
                                title="${Base.trans("member_shows.markas")}"></div>`);
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
            if (Base.debug)
                console.log('ajout de l\'attribut ID à l\'élément "checkSeen"');
            // On ajoute l'attribut ID
            $checkSeen.attr('id', 'episode-' + this.id);
            $checkSeen.data('id', this.id);
            $checkSeen.data('pos', pos);
        }
        // if (Base.debug) console.log('updateCheckSeen', {seen: this.user.seen, elt: this.elt, checkSeen: $checkSeen.length, classSeen: $checkSeen.hasClass('seen'), pos: pos, Episode: this});
        // Si le membre a vu l'épisode et qu'il n'est pas indiqué, on change le statut
        if (this.user.seen && $checkSeen.length > 0 && !$checkSeen.hasClass('seen')) {
            if (Base.debug)
                console.log('Changement du statut (seen) de l\'épisode %s', this.code);
            this.updateRender('seen', false);
            changed = true;
        }
        // Si le membre n'a pas vu l'épisode et qu'il n'est pas indiqué, on change le statut
        else if (!this.user.seen && $checkSeen.length > 0 && $checkSeen.hasClass('seen')) {
            if (Base.debug)
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
        if (method === HTTP_VERBS.POST) {
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
            if (method === HTTP_VERBS.POST && !response) {
                args.bulk = false; // Flag pour ne pas mettre les épisodes précédents comme vus automatiquement
            }
            Base.callApi(method, 'episodes', 'watched', args).then(data => {
                if (Base.debug)
                    console.log('updateStatus %s episodes/watched', method, data);
                if (!(_this.show instanceof Show) && Base.cache.has(DataTypesCache.shows, data.show.id)) {
                    _this.show = Base.cache.get(DataTypesCache.shows, data.show.id);
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
                if (method === HTTP_VERBS.POST && response && pos) {
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
                    ._callListeners(EventTypes.UPDATE);
            })
                .catch(err => {
                if (Base.debug)
                    console.error('updateStatus error %s', err);
                if (err && err == 'changeStatus') {
                    if (Base.debug)
                        console.log('updateStatus error %s changeStatus', method);
                    _this.updateRender(status);
                }
                else {
                    _this.toggleSpinner(false);
                    Base.notification('Erreur de modification d\'un épisode', 'updateStatus: ' + err);
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
        if (Base.debug)
            console.log('changeStatus', { elt: $elt, status: newStatus, update: update });
        if (newStatus === 'seen') {
            $elt.css('background', ''); // On ajoute le check dans la case à cocher
            $elt.addClass('seen'); // On ajoute la classe 'seen'
            $elt.attr('title', Base.trans("member_shows.remove"));
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
                if (Base.debug)
                    console.log('Tous les épisodes de la saison ont été vus', slideCurrent);
                // Si il y a une saison suivante, on la sélectionne
                if (slideCurrent.next().length > 0) {
                    if (Base.debug)
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
            $elt.attr('title', Base.trans("member_shows.markas"));
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
            if (this.show instanceof Show) {
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
            if (Base.debug)
                console.log('toggleSpinner');
            if (Base.debug)
                console.groupEnd();
        }
        else {
            if (Base.debug)
                console.groupCollapsed('episode checkSeen');
            if (Base.debug)
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
class Similar extends Media {
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
        if (type.singular === MediaType.movie) {
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
        if (this.mediaType.singular === MediaType.show) {
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
            this.showrunner = new Showrunner(data.showrunner);
            this.social_links = data.social_links;
            this.status = data.status;
            this.thetvdb_id = parseInt(data.thetvdb_id, 10);
            this.pictures = new Array();
        }
        else if (this.mediaType.singular === MediaType.movie) {
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
        if (this.mediaType.singular === MediaType.movie) {
            action = 'movie';
        }
        return Base.callApi('GET', this.mediaType.plural, action, { id: this.id }, force);
    }
    /**
     * Ajoute le bandeau Viewed sur le poster du similar
     * @return {Similar}
     */
    addViewed() {
        // Si la série a été vue ou commencée
        if (this.user.status &&
            ((this.mediaType.singular === MediaType.movie && this.user.status === 1) ||
                (this.mediaType.singular === MediaType.show && this.user.status > 0))) {
            // On ajoute le bandeau "Viewed"
            this.elt.find('a.slide__image').prepend(`<img src="${Base.serverBaseUrl}/img/viewed.png" class="bandViewed"/>`);
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
                jQuery('#dialog-resource-title span.counter').empty().text('(' + Base.counter + ' appels API)');
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
        if (this.mediaType.singular === MediaType.show) {
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
        if (Base.debug)
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
            if (this.mediaType.singular === MediaType.show && this.thetvdb_id && this.thetvdb_id > 0) {
                // On tente de remplacer le block div 404 par une image
                this.elt.find('div.block404').replaceWith(`
                    <img class="u-opacityBackground fade-in"
                            width="125"
                            height="188"
                            alt="Poster de ${this.title}"
                            src="https://artworks.thetvdb.com/banners/posters/${this.thetvdb_id}-1.jpg"/>`);
            }
            else if (this.mediaType.singular === MediaType.movie && this.tmdb_id && this.tmdb_id > 0) {
                if (Base.themoviedb_api_user_key.length <= 0)
                    return;
                const uriApiTmdb = `https://api.themoviedb.org/3/movie/${this.tmdb_id}?api_key=${Base.themoviedb_api_user_key}&language=fr-FR`;
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
        if (this.mediaType.singular === MediaType.movie) {
            params.state = state;
        }
        return new Promise((resolve, reject) => {
            Base.callApi('POST', _this.mediaType.plural, _this.mediaType.singular, params)
                .then(data => {
                _this.fill(data[_this.mediaType.singular]).save();
                resolve(_this);
            }, err => {
                reject(err);
            });
        });
    }
}
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
            if (Base.debug)
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
                if (Base.debug)
                    console.log('close old interval timer');
                clearInterval(this._timer);
            }
            const _this = this;
            this._timer = setInterval(function () {
                // if (debug) console.log('UpdateAuto setInterval objShow', Object.assign({}, _this._objShow));
                if (!_this._auto || _this._show.user.remaining <= 0) {
                    if (Base.debug)
                        console.log('Arrêt de la mise à jour auto des épisodes');
                    _this.stop();
                    return;
                }
                if (Base.debug)
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
/**
 * Remplit l'objet avec les données fournit en paramètre
 * @param  {Obj} data Les données provenant de l'API
 * @returns {Show}
 */
Show.prototype.fill = function (data) {
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
    this.mediaType = { singular: MediaType.show, plural: 'shows', className: Show };
    Media.prototype.fill.call(this, data);
    return this;
};
/**
 * Retourne les similars associés au media
 * @return {Promise<Media>}
 */
Media.prototype.fetchSimilars = function () {
    const _this = this;
    this.similars = [];
    return new Promise((resolve, reject) => {
        Base.callApi('GET', this.mediaType.plural, 'similars', { id: this.id, details: true }, true)
            .then(data => {
            if (data.similars) {
                for (let s = 0; s < data.similars.length; s++) {
                    _this.similars.push(new Similar(data.similars[s][_this.mediaType.singular], _this.mediaType));
                }
            }
            _this.save();
            resolve(_this);
        }, err => {
            reject(err);
        });
    });
};