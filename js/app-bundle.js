/*! betaseries_userscript - v1.5.94 - 2022-07-15
 * https://github.com/Azema/betaseries
 * Copyright (c) 2022 Azema;
 * Licensed Apache-2.0
 */
"use strict";

var DataTypesCache;
(function (DataTypesCache) {
    DataTypesCache["shows"] = "shows";
    DataTypesCache["episodes"] = "episodes";
    DataTypesCache["movies"] = "movies";
    DataTypesCache["members"] = "members";
    DataTypesCache["updates"] = "updateAuto";
    DataTypesCache["db"] = "db";
})(DataTypesCache = DataTypesCache || (DataTypesCache = {}));
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
     * @returns {CacheUS}
     */
    _init() {
        this._data = {};
        this._data[DataTypesCache.shows] = {};
        this._data[DataTypesCache.episodes] = {};
        this._data[DataTypesCache.movies] = {};
        this._data[DataTypesCache.members] = {};
        this._data[DataTypesCache.db] = {};
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
     * @returns {CacheUS}
     */
    clear(type = null) {
        // On nettoie juste un type de ressource
        if (type && this._data[type] !== undefined) {
            for (const key in this._data[type]) {
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
     * @returns {CacheUS}
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
     * @returns {CacheUS}
     */
    remove(type, key) {
        if (this.has(type, key)) {
            delete this._data[type][key];
        }
        return this;
    }
}

/**
 * Code source original @link https://github.com/debug-js/debug
 */
/**
 * Retourne le nombre de millisecondes sous forme de durée
 * @param   {number} ms
 * @returns {string}
 */
function humanize(ms) {
    const s = 1000;
    const m = s * 60;
    const h = m * 60;
    const d = h * 24;
    const msAbs = Math.abs(ms);
    if (msAbs >= d) {
        return `${Math.round(ms / d)}d`;
    }
    if (msAbs >= h) {
        return `${Math.round(ms / h)}h`;
    }
    if (msAbs >= m) {
        return `${Math.round(ms / m)}m`;
    }
    if (msAbs >= s) {
        return `${Math.round(ms / s)}s`;
    }
    return `${ms}ms`;
}
/**
 * Colorize log arguments if enabled.
 *
 * @api public
 * @this {Debug}
 */
function formatArgs(args) {
    /** @type {Debug} */
    const self = this;
    // console.log('formatArgs args[0]: ', args[0]);
    if (!self.useColors) {
        args[0] = `${self.namespace} ${args[0]}`;
        if (self.time)
            args[0] += ' +' + humanize(self.diff);
        return;
    }
    const c = 'color: ' + self.color, cInherit = 'color:inherit', indexesColor = []; // Stocke les index de position des flags de style du message original
    let flagColor = false;
    // On vérifie la présence de flag style dans le message original
    if (/%c/.test(args[0])) {
        flagColor = true;
        let index = 0;
        args[0].replace(/%[a-zA-Z%]/g, (match) => {
            if (match === '%%') {
                return;
            }
            index++;
            if (match === '%c') {
                indexesColor.push(index + 2); // On tient compte des ajouts
            }
        });
        if ((indexesColor.length % 2) !== 0) {
            // Il n'y a pas de flagColor de fermeture
            args[0] += '%c';
            indexesColor.push(++index + 2);
            args.splice(index, 0, cInherit);
        }
        // console.log('formatArgs: flagColor found', {indexesColor});
    }
    args[0] = `%c${self.namespace}%c ${args[0]}`;
    if (Debug.displayTime)
        args[0] += '%c +' + humanize(self.diff) + '%c';
    // On ajoute les styles dans les le tableaux des arguments
    let index = 0, indexColor = 0;
    args[0].replace(/%[a-zA-Z%]/g, (match) => {
        if (match === '%%') {
            return;
        }
        index++;
        if (match === '%c' && (!flagColor || (flagColor && !indexesColor.includes(index)))) {
            indexColor++;
            args.splice(index, 0, (indexColor % 2 === 1) ? c : cInherit);
        }
    });
    // return args;
}
/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */
const useColors = () => {
    // NB: In an Electron preload script, document will be defined but not fully
    // initialized. Since we know we're in Chrome, we'll just detect this case
    // explicitly
    if (typeof window !== 'undefined' && window.process &&
        (window.process['type'] === 'renderer' || window.process['__nwjs'])) {
        return true;
    }
    const ua = navigator?.userAgent;
    // Internet Explorer and Edge do not support colors.
    if (typeof navigator !== 'undefined' && ua &&
        /(edge|trident)\/(\d+)/.test(ua.toLowerCase())) {
        return false;
    }
    // Is webkit? http://stackoverflow.com/a/16459606/376773
    // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
    return ((typeof document !== 'undefined' && document.documentElement && document.documentElement.style &&
        document.documentElement.style['WebkitAppearance']) ||
        // Is firebug? http://stackoverflow.com/a/398120/376773
        (typeof window !== 'undefined' && window.console && (window.console['firebug'] ||
            (window.console['exception'] && window.console.table))) ||
        // Is firefox >= v31?
        // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
        (typeof navigator !== 'undefined' && ua &&
            /firefox\/(\d+)/.test(ua.toLowerCase()) && parseInt(RegExp.$1, 10) >= 31) ||
        // Double check webkit in userAgent just in case we are in a worker
        (typeof navigator !== 'undefined' && ua && /applewebkit\/(\d+)/.test(ua.toLowerCase())));
};
/**
 * Classe de log pour l'affichage dans le browser
 * @class
 */
class Debug {
    /**
     * Tableau des codes couleurs pour le Web
     * @type {string[]}
     */
    static colors = [
        '#0000CC',
        '#0000FF',
        '#0033CC',
        '#0033FF',
        '#0066CC',
        '#0066FF',
        '#0099CC',
        '#0099FF',
        '#00CC00',
        '#00CC33',
        '#00CC66',
        '#00CC99',
        '#00CCCC',
        '#00CCFF',
        '#3300CC',
        '#3300FF',
        '#3333CC',
        '#3333FF',
        '#3366CC',
        '#3366FF',
        '#3399CC',
        '#3399FF',
        '#33CC00',
        '#33CC33',
        '#33CC66',
        '#33CC99',
        '#33CCCC',
        '#33CCFF',
        '#6600CC',
        '#6600FF',
        '#6633CC',
        '#6633FF',
        '#66CC00',
        '#66CC33',
        '#9900CC',
        '#9900FF',
        '#9933CC',
        '#9933FF',
        '#99CC00',
        '#99CC33',
        '#CC0000',
        '#CC0033',
        '#CC0066',
        '#CC0099',
        '#CC00CC',
        '#CC00FF',
        '#CC3300',
        '#CC3333',
        '#CC3366',
        '#CC3399',
        '#CC33CC',
        '#CC33FF',
        '#CC6600',
        '#CC6633',
        '#CC9900',
        '#CC9933',
        '#CCCC00',
        '#CCCC33',
        '#FF0000',
        '#FF0033',
        '#FF0066',
        '#FF0099',
        '#FF00CC',
        '#FF00FF',
        '#FF3300',
        '#FF3333',
        '#FF3366',
        '#FF3399',
        '#FF33CC',
        '#FF33FF',
        '#FF6600',
        '#FF6633',
        '#FF9900',
        '#FF9933',
        '#FFCC00',
        '#FFCC33'
    ];
    /************************************/
    /*              Static              */
    /************************************/
    /**
     * Tableau des namespaces qui seront affichés
     * @type {RegExp[]}
     */
    static names;
    /**
     * Tableau des namespaces qui ne seront pas affichés
     * @type {RegExp[]}
     */
    static skips;
    /**
     * @type {Storage}
     */
    static storage = localStorage;
    /**
     * Chaine contenant les namespaces à afficher ou pas
     * @type {string}
     */
    static namespaces;
    /**
     * Delimiter des sous namespaces
     * @type {string}
     */
    static delimiter = ':';
    /**
     * Flag qui indique si on doit afficher ou non la durée entre 2 logs
     * @type {boolean}
     */
    static displayTime = false;
    /**
     * Invokes `console.debug()` when available.
     * No-op when `console.debug` is not a "function".
     * If `console.debug` is not available, falls back
     * to `console.log`.
     *
     * @api public
     * @type {Function}
     */
    static _debug = console.debug || console.log;
    static _log = console.log;
    static _info = console.info;
    /**
     * Save `namespaces`.
     *
     * @param {String} namespaces
     * @returns {void}
     * @api private
     * @static
     */
    static save(namespaces) {
        try {
            if (namespaces) {
                Debug.storage.setItem('debug', namespaces);
            }
            else {
                Debug.storage.removeItem('debug');
            }
        }
        catch (error) {
            // Swallow
            // XXX (@Qix-) should we be logging these?
        }
    }
    /**
     * Load `namespaces`.
     *
     * @return {String} returns the previously persisted debug modes
     * @api private
     * @static
     */
    static load() {
        let r;
        try {
            r = Debug.storage.getItem('debug');
        }
        catch (error) {
            // Swallow
            // XXX (@Qix-) should we be logging these?
            r = '';
        }
        return r;
    }
    /**
     * Enables a debug mode by namespaces. This can include modes
     * separated by a colon and wildcards.
     *
     * @param {String} namespaces
     * @returns {void}
     * @api public
     */
    static enable(namespaces) {
        Debug.save(namespaces);
        Debug.namespaces = namespaces;
        Debug.names = [];
        Debug.skips = [];
        const split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
        const len = split.length;
        for (let i = 0; i < len; i++) {
            if (!split[i]) {
                // ignore empty strings
                continue;
            }
            namespaces = split[i].replace(/\*/g, '.*?');
            if (namespaces[0] === '-') {
                Debug.skips.push(new RegExp('^' + namespaces.slice(1) + '$'));
            }
            else {
                Debug.names.push(new RegExp('^' + namespaces + '$'));
            }
        }
    }
    /**
     * Disable debug output.
     *
     * @return {String} namespaces
     * @api public
     */
    static disable() {
        const namespaces = [
            ...Debug.names.map(Debug.toNamespace),
            ...Debug.skips.map(Debug.toNamespace).map(namespace => '-' + namespace)
        ].join(',');
        Debug.enable('');
        return namespaces;
    }
    /**
     * Convert regexp to namespace
     *
     * @param {RegExp} regxep
     * @return {String} namespace
     * @api private
     */
    static toNamespace(regexp) {
        return regexp.toString()
            .substring(2, regexp.toString().length - 2)
            .replace(/\.\*\?$/, '*');
    }
    /**
     * Returns true if the given mode name is enabled, false otherwise.
     *
     * @param {String} name
     * @return {Boolean}
     * @api public
     * @static
     */
    static ns_enabled(name) {
        if (name[name.length - 1] === '*') {
            return true;
        }
        let i, len;
        for (i = 0, len = Debug.skips.length; i < len; i++) {
            if (Debug.skips[i].test(name)) {
                return false;
            }
        }
        for (i = 0, len = Debug.names.length; i < len; i++) {
            if (Debug.names[i].test(name)) {
                return true;
            }
        }
        return false;
    }
    /**
     * Coerce `val`.
     *
     * @param {Mixed} val
     * @return {Mixed}
     * @api private
     */
    static coerce(val) {
        if (val instanceof Error) {
            return val.stack || val.message;
        }
        return val;
    }
    /**
     * Map of special "%n" handling functions, for the debug "format" argument.
     *
     * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
     * @type {Object.<string, Function>}
     */
    static formatters = {
        /**
         * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
         */
        j: function (v) {
            try {
                return JSON.stringify(v);
            }
            catch (error) {
                return '[UnexpectedJSONParseError]: ' + error.message;
            }
        }
    };
    /**
     * Selects a color for a debug namespace
     * @param {String} namespace The namespace string for the debug instance to be colored
     * @return {String} An ANSI color code for the given namespace
     * @api private
     */
    static selectColor(namespace) {
        let hash = 0;
        for (let i = 0; i < namespace.length; i++) {
            hash = ((hash << 5) - hash) + namespace.charCodeAt(i);
            hash |= 0; // Convert to 32bit integer
        }
        return Debug.colors[Math.abs(hash) % Debug.colors.length];
    }
    /**
     * Ajoute un formatter dans le tableau des formatters
     * @param   {string} letter - La lettre servant de flag dans le message (sans le percent) (ex: %d)
     * @param   {Function} fn - La fonction appliquée à la valeur correspondante
     * @returns {void}
     * @throws  {Error}
     */
    static addFormatter(letter, fn) {
        // On supprime le prefix '%' si il y est
        if (/^%/.test(letter))
            letter = letter.substring(1);
        const letterFormatters = Object.keys(Debug.formatters);
        if (letterFormatters.includes(letter)) {
            throw new Error(`this letter(${letter}) of formatter already exists`);
        }
        Debug.formatters[letter] = fn;
    }
    /************************************/
    /*          Properties              */
    /************************************/
    /**
     * Namespace de l'instance
     * @type {string}
     */
    namespace;
    /**
     * Nombre de milliseconds depuis le précédent log
     * @type {number}
     */
    prevTime;
    /**
     * Durée entre 2 logs en milliseconds
     * @type {number}
     */
    diff;
    /**
     * Surcharge de l'affichage du namespace au niveau de l'instance
     * @type {boolean}
     */
    enableOverride = undefined;
    /**
     * Surcharge de l'affichage du temps entre 2 logs au niveau de l'instance
     * @type {boolean}
     */
    timeOverride = undefined;
    /**
     * Stockage de la règle d'affichage des namespaces
     * @type {string}
     */
    namespacesCache;
    /**
     * Stockage de l'autorisation ou non d'afficher les logs du namespace
     * @type {boolean}
     */
    enabledCache;
    /**
     * Flag indiquant si l'instance peut utiliser des couleurs
     * @type {boolean}
     */
    useColors;
    /**
     * Stockage de la couleur du namespace
     * @type {string}
     */
    color;
    constructor(namespace) {
        this.useColors = useColors();
        this.color = Debug.selectColor(namespace);
        this.namespace = namespace;
        return this;
    }
    get enabled() {
        if (this.enableOverride !== undefined) {
            return this.enableOverride;
        }
        if (this.namespacesCache !== Debug.namespaces) {
            this.namespacesCache = Debug.namespaces;
            this.enabledCache = Debug.ns_enabled(this.namespace);
        }
        return this.enabledCache;
    }
    set enabled(v) {
        this.enableOverride = !!v;
    }
    get time() {
        if (this.timeOverride !== undefined) {
            return this.timeOverride;
        }
        return Debug.displayTime;
    }
    set time(v) {
        this.timeOverride = !!v;
    }
    _prepareLog(args) {
        const self = this;
        if (Debug.displayTime) {
            // Set `diff` timestamp
            const curr = Date.now();
            const ms = curr - (this.prevTime || curr);
            self.diff = ms;
            // self['prev'] = this.prevTime;
            // self['curr'] = curr;
            this.prevTime = curr;
        }
        args[0] = Debug.coerce(args[0]);
        if (typeof args[0] !== 'string') {
            // Anything else let's inspect with %O
            args.unshift('%O');
        }
        // Apply any `formatters` transformations
        let index = 0;
        args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
            // If we encounter an escaped % then don't increase the array index
            if (match === '%%') {
                return '%';
            }
            index++;
            const formatter = Debug.formatters[format];
            if (typeof formatter === 'function') {
                const val = args[index];
                match = formatter.call(self, val);
                // Now we need to remove `args[index]` since it's inlined in the `format`
                args.splice(index, 1);
                index--;
            }
            return match;
        });
        // Apply env-specific formatting (colors, etc.)
        formatArgs.call(self, args);
        return args;
    }
    get fnDebug() {
        return this.debug.bind(this);
    }
    debug(...args) {
        // Disabled?
        try {
            if (!this.enabled) {
                return;
            }
        }
        catch (err) {
            console.error('Error debug check enabled', this, err);
        }
        Debug._debug.apply(this, this._prepareLog(args));
    }
    get fnLog() {
        return this.log.bind(this);
    }
    log(...args) {
        // Disabled?
        try {
            if (!this.enabled) {
                return;
            }
        }
        catch (err) {
            console.log('Error log check enabled', this, err);
        }
        Debug._log.apply(this, this._prepareLog(args));
    }
    get fnInfo() {
        return this.info.bind(this);
    }
    info(...args) {
        // Disabled?
        try {
            if (!this.enabled) {
                return;
            }
        }
        catch (err) {
            console.log('Error log check enabled', this, err);
        }
        Debug._info.apply(this, this._prepareLog(args));
    }
    /**
     * Retourne un nouveau `Debug` avec un namespace étendu
     * @param   {string} namespace
     * @param   {string} [delimiter]
     * @returns {Debug}
     */
    extend(namespace, delimiter = Debug.delimiter) {
        if (typeof namespace !== 'string' || namespace.length <= 0) {
            throw new Error('namespace must be a string not empty');
        }
        return new Debug([this.namespace, namespace].join(delimiter));
    }
}

/**
 * Un objet Error, type ExceptionIdentification
 * @param {string} message - Le message d'erreur
 */
function ExceptionIdentification(message) {
    this.message = message;
    this.name = "ExceptionIdentification";
}
/**
 * NetworkState
 * @enum
 * @alias NetworkState
 */
var NetworkState;
(function (NetworkState) {
    NetworkState[NetworkState["offline"] = 0] = "offline";
    NetworkState[NetworkState["online"] = 1] = "online";
})(NetworkState = NetworkState || (NetworkState = {}));
/**
 * EventTypes
 * @enum
 * @alias EventTypes
 */
var EventTypes;
(function (EventTypes) {
    EventTypes["ADD"] = "add";
    EventTypes["ADDED"] = "added";
    EventTypes["ARCHIVE"] = "archive";
    EventTypes["DELETE"] = "delete";
    EventTypes["HIDE"] = "hide";
    EventTypes["NEW"] = "new";
    EventTypes["NOTE"] = "note";
    EventTypes["REMOVE"] = "remove";
    EventTypes["SAVE"] = "save";
    EventTypes["SEEN"] = "seen";
    EventTypes["SHOW"] = "show";
    EventTypes["UNARCHIVE"] = "unarchive";
    EventTypes["UPDATE"] = "update";
})(EventTypes = EventTypes || (EventTypes = {}));
/**
 * HTTP_VERBS
 * @enum
 * @alias HTTP_VERBS
 */
var HTTP_VERBS;
(function (HTTP_VERBS) {
    HTTP_VERBS["GET"] = "GET";
    HTTP_VERBS["POST"] = "POST";
    HTTP_VERBS["PUT"] = "PUT";
    HTTP_VERBS["DELETE"] = "DELETE";
    HTTP_VERBS["OPTIONS"] = "OPTIONS";
    HTTP_VERBS["HEAD"] = "HEAD";
})(HTTP_VERBS = HTTP_VERBS || (HTTP_VERBS = {}));
function objToArr(obj, data) {
    if (data instanceof Array)
        return data;
    const values = [];
    for (const key in data) {
        values.push(data[key]);
    }
    return values;
}
/**
 * Fonction servant à vérifier si une variable existe et si elle est nulle
 * @param val - Valeur à vérifier
 * @returns {boolean}
 */
function isNull(val) {
    return val === null || val === undefined;
}
/**
 * Fonction pour les requêtes fetch avec un timeout
 * @param   {URL | RequestInfo} request - URL à appeler
 * @param   {RequestInit} [opts = {}] - Options de la requête
 * @param   {number} [timeout = 30] - Durée en secondes du timeout de la requête
 * @returns {FetchTimeout}
 */
function fetchTimeout(request, opts = {}, timeout = 30) {
    const controller = new AbortController();
    opts.signal = controller.signal;
    return {
        abort: () => controller.abort(),
        ready: () => {
            const timer = setTimeout(() => controller.abort(), timeout * 1000);
            return fetch(request, opts).then((resp) => {
                if (timer)
                    clearTimeout(timer);
                return resp;
            });
        }
    };
}
/**
 * Fonction servant à vérifier l'état du réseau
 * @param {number} [milliseconds = 0] - Durée avant la prochaine vérification
 */
function checkNetwork(milliseconds = 0) {
    const request = `${UsBetaSeries.serverOauthUrl}/index.html`;
    const init = {
        method: HTTP_VERBS.HEAD,
        mode: 'cors',
        cache: 'no-cache',
    };
    const timeout = 5;
    /**
     * Transforme des secondes en durée heures, minutes, secondes
     * @param seconds - La durée en secondes
     * @returns {string}
     */
    const duration = function (seconds) {
        if (seconds < 60) {
            return `${seconds.toString()} secondes`;
        }
        let minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        seconds -= (minutes * 60);
        let duration = '';
        if (hours > 0) {
            minutes -= (hours * 60);
            duration += `${hours.toString()} heure${hours > 1 ? 's' : ''} `;
        }
        duration += `${minutes.toString()} min. ${seconds.toString()} sec.`;
        return duration;
    };
    fetchTimeout(request, init, timeout).ready()
        .then((response) => {
        if (response.ok) {
            if (UsBetaSeries.networkTimeout) {
                clearTimeout(UsBetaSeries.networkTimeout);
                UsBetaSeries.networkTimeout = null;
            }
            UsBetaSeries.changeNetworkState(NetworkState.online);
            UsBetaSeries.debug('Network is come back');
        }
    }).catch(err => {
        milliseconds += (milliseconds === 0) ? 1000 : 10000;
        if (err.message.toLowerCase() !== 'failed to fetch') {
            console.error('checkNetwork catch: ', err);
        }
        UsBetaSeries.logger.log('checkNetwork: Fetch aborted (next check in: %s)', duration(milliseconds / 1000));
        UsBetaSeries.networkTimeout = setTimeout(checkNetwork, milliseconds, milliseconds);
    });
}
/**
 * FakePromise - Classe servant à simuler une promesse
 * d'appel à l'API lorsque le réseau est offline et
 * de réaliser le souhait lorsque le réseau est online
 * @class
 */
class FakePromise {
    /**
     * Permet de vérifier si la fonction se trouve déjà dans le
     * tableau des fonctions callback
     * @static
     * @param   {Function} fn - Fonction callback de référence
     * @param   {Function[]} funcs - Tableau des fonctions
     * @returns {boolean}
     */
    static fnAlreadyInclude(fn, funcs) {
        const strFn = fn.toString();
        for (let t = 0; t < funcs.length; t++) {
            if (funcs[t].toString() === strFn) {
                return true;
            }
        }
        return false;
    }
    /**
     * @callback thenCallback
     * @param   {Obj} data - Les données
     * @returns {void}
     */
    /**
     * @callback catchCallback
     * @param   {?(string | Error)} reason - La raison de l'échec
     * @returns {(void | PromiseLike<never>)}
     */
    /**
     * @callback finallyCallback
     * @returns {void}
     */
    /**
     * Tableau des fonctions callback de type **then**
     * @type {thenCallback[]}
     */
    thenQueue;
    /**
     * Tableau des fonctions callback de type **catch**
     * @type {catchCallback[]}
     */
    catchQueue;
    /**
     * Tableau des fonctions callback de type **finally**
     * @type {finallyCallback[]}
     */
    finallyQueue;
    /**
     * @callback apiCallback
     * @param   {?string} reason - Une raison d'échec
     * @returns {Promise<Obj>}
     */
    /**
     * Fonction qui sera executée lors de l'appel à la méthode **launch**
     * @see FakePromise.launch
     * @type {apiCallback}
     */
    promiseFunc;
    /**
     * Constructor
     * @param   {apiCallback} [func] - Fonction promise qui sera executée plus tard
     * @returns {FakePromise}
     */
    constructor(func) {
        this.thenQueue = [];
        this.catchQueue = [];
        this.finallyQueue = [];
        this.promiseFunc = func;
        return this;
    }
    /**
     * Permet de définir la fonction qui retourne la vraie promesse
     * @param   {apiCallback} func - Fonction promise qui sera executée plus tard
     * @returns {FakePromise}
     */
    setFunction(func) {
        this.promiseFunc = func;
        return this;
    }
    /**
     * Simule un objet promise et stocke les fonctions pour plus tard
     * @param   {thenCallback} onfulfilled - Fonction appelée lorsque la promesse est tenue
     * @param   {?catchCallback} onrejected - Fonction appelée lorsque la promesse est rejetée
     * @returns {FakePromise}
     */
    then(onfulfilled, onrejected) {
        if (onfulfilled /*  && !FakePromise.fnAlreadyInclude(onfulfilled, this.thenQueue) */) {
            this.thenQueue.push(onfulfilled);
        }
        if (onrejected /*  && !FakePromise.fnAlreadyInclude(onrejected, this.catchQueue) */) {
            this.catchQueue.push(onrejected);
        }
        return this;
    }
    /**
     * Simule un objet promise et stocke les fonctions pour plus tard
     * @param   {catchCallback} onrejected - Fonction appelée lorsque la promesse est rejetée
     * @returns {FakePromise}
     */
    catch(onrejected) {
        return this.then(null, onrejected);
    }
    /**
     * Simule un objet promise et stocke les fonctions pour plus tard
     * @param   {finallyCallback} onfinally - Fonction appelée lorsque la promesse est terminée
     * @returns {FakePromise}
     */
    finally(onfinally) {
        if (onfinally /*  && FakePromise.fnAlreadyInclude(onfinally, this.finallyQueue) */) {
            this.finallyQueue.push(onfinally);
        }
        return this;
    }
    /**
     * Rejet de la promise
     * @param reason - Le raison du rejet de la promise
     * @returns {Promise<void>}
     */
    reject(reason) {
        return this.promiseFunc(reason)
            .catch(() => {
            const catchs = this.catchQueue;
            for (let c = catchs.length; c >= 0; c--) {
                if (typeof catchs[c] === 'function') {
                    catchs[c](reason);
                    // return;
                }
            }
        })
            .finally(() => {
            const finallies = this.finallyQueue;
            for (let f = finallies.length; f >= 0; f--) {
                if (typeof finallies[f] === 'function') {
                    finallies[f]();
                    // return;
                }
            }
        });
    }
    /**
     * Permet de lancer la fonction qui retourne la vraie promesse
     * ainsi que d'appliquer les fonctions (then, catch et finally) précédemment stockées
     * @returns {Promise<any>}
     */
    launch() {
        return this.promiseFunc()
            .then((data) => {
            const thens = this.thenQueue;
            for (let t = thens.length; t >= 0; t--) {
                if (typeof thens[t] === 'function') {
                    thens[t](data);
                    // return;
                }
            }
        })
            .catch(err => {
            const catchs = this.catchQueue;
            for (let c = catchs.length; c >= 0; c--) {
                if (typeof catchs[c] === 'function') {
                    catchs[c](err);
                    // return;
                }
            }
        })
            .finally(() => {
            const finallies = this.finallyQueue;
            for (let f = finallies.length; f >= 0; f--) {
                if (typeof finallies[f] === 'function') {
                    finallies[f]();
                    // return;
                }
            }
        });
    }
}
/**
 * Classe de base contenant essentiellement des propriétés et des méthodes statiques
 * @class
 * @abstract
 */
class Base {
    /**
     * Types d'évenements gérés par cette classe
     * @type {Array}
     */
    static EventTypes = [
        EventTypes.UPDATE,
        EventTypes.SAVE,
        EventTypes.NOTE
    ];
    /**
     * Contient les écouteurs d'évènements de l'objet
     * @type {object}
     */
    __listeners;
    /**
     * Constructor
     * @param data - Les données provenant de l'API
     * @returns {Base}
     */
    constructor(data) {
        if (!(data instanceof Object)) {
            throw new Error("data is not an object");
        }
        this._initListeners();
        return this;
    }
    /**
     * Initialize le tableau des écouteurs d'évènements
     * @returns {Base}
     * @sealed
     */
    _initListeners() {
        this.__listeners = {};
        const EvtTypes = this.constructor.EventTypes;
        for (let e = 0; e < EvtTypes.length; e++) {
            this.__listeners[EvtTypes[e]] = [];
        }
        return this;
    }
    /**
     * Permet d'ajouter un listener sur un type d'évenement
     * @param  {EventTypes} name - Le type d'évenement
     * @param  {Function}   fn   - La fonction à appeler
     * @return {Base} L'instance du média
     * @sealed
     */
    addListener(name, fn, ...args) {
        const logger = UsBetaSeries.logger.extend('listeners');
        logger.debug('Base[%s] add Listener on event %s', this.constructor.name, name);
        // On vérifie que le type d'event est pris en charge
        if (this.constructor.EventTypes.indexOf(name) < 0) {
            throw new Error(`${name} ne fait pas partit des events gérés par cette classe`);
        }
        if (isNull(this.__listeners[name])) {
            this.__listeners[name] = [];
        }
        for (const func of this.__listeners[name]) {
            if (typeof func === 'function' && func.toString() == fn.toString())
                return;
        }
        this.__listeners[name].push((args.length <= 0) ? fn : { fn, args });
        logger.debug('Base[%s] add Listener on event %s', this.constructor.name, name, this.__listeners[name]);
        return this;
    }
    /**
     * Permet d'ajouter un listener sur plusieurs types d'évenements
     * @param  {EventTypes[]} names -   Le type d'évenement
     * @param  {Function} fn -          La fonction à appeler
     * @param  {any[]} [args] -         Paramètres optionnels
     * @return {Base} L'instance du média
     * @sealed
     */
    addListeners(names, fn, ...args) {
        try {
            for (const name of names) {
                this.addListener(name, fn, args);
            }
        }
        catch (err) {
            console.warn('Base.addListeners error', err);
        }
        return this;
    }
    /**
     * Permet de supprimer un listener sur un type d'évenement
     * @param  {string}   name - Le type d'évenement
     * @param  {Function} fn   - La fonction qui était appelée
     * @return {Base} L'instance du média
     * @sealed
     */
    removeListener(name, fn) {
        if (this.__listeners[name] !== undefined) {
            for (let l = 0; l < this.__listeners[name].length; l++) {
                if ((typeof this.__listeners[name][l] === 'function' &&
                    this.__listeners[name][l].toString() === fn.toString()) ||
                    (typeof this.__listeners[name][l] === 'object' &&
                        typeof this.__listeners[name][l].fn === 'function' &&
                        this.__listeners[name][l].fn.toString() == fn.toString())) {
                    this.__listeners[name].splice(l, 1);
                }
            }
        }
        return this;
    }
    /**
     * Appel les listeners pour un type d'évenement
     * @param  {EventTypes} name - Le type d'évenement
     * @return {Base} L'instance du média
     * @sealed
     */
    _callListeners(name) {
        // UsBetaSeries.debug.extend('listeners')('Base[%s] call Listeners of event %s', this.constructor.name, name, this.__listeners);
        if (this.constructor.EventTypes.indexOf(name) >= 0 && this.__listeners[name].length > 0) {
            const logger = UsBetaSeries.logger.extend('listeners');
            logger.debug('Base[%s] call %d Listeners on event %s', this.constructor.name, this.__listeners[name].length, name, this.__listeners);
            const event = new CustomEvent('betaseries', {
                detail: {
                    name
                }
            });
            for (let l = 0; l < this.__listeners[name].length; l++) {
                if (typeof this.__listeners[name][l] === 'function') {
                    this.__listeners[name][l].call(this, event, this);
                }
                else {
                    const args = this.__listeners[name][l].args;
                    this.__listeners[name][l].fn.apply(this, [event, this].concat(args));
                }
            }
        }
        return this;
    }
    /**
     * Check if this emitter has `event` handlers.
     *
     * @param event - Le type d'évènement
     * @returns {boolean}
     */
    hasListeners(event) {
        return !!this.__listeners[event].length;
    }
    /**
     * Listen on the given `event` with `fn`.
     * @param   {EventTypes} event - Le type d'évènement à écouter
     * @param   {fnListener} fn - La fonction callback
     * @param   {...*} args - les paramètres supplémentaires à ajouter à la function callback
     * @returns {Base}
     */
    on(event, fn, ...args) {
        return this.addListener(event, fn, args);
    }
    /**
     * Remove all registered callbacks for `event`.
     * @param   {EventTypes} name - Le type d'évènement dont l'écoute est annulée
     * @returns {Base}
     */
    off(name) {
        if (this.constructor.EventTypes.indexOf(name) < 0) {
            throw new Error(`${name} ne fait pas partit des events gérés par cette classe`);
        }
        if (!isNull(this.__listeners[name])) {
            delete this.__listeners[name];
        }
        return this;
    }
    /**
     * Adds an `event` listener that will be invoked a single
     * time then automatically removed.
     * @param {EventTypes} event - Le type d'évènement à écouter
     * @param {fnListener} fn - La fonction callback
     * @param {...*} argsOnce - les paramètres supplémentaires à ajouter à la function callback
     * @returns {Base}
     */
    once(event, fn, ...argsOnce) {
        function on(...args) {
            this.removeEventListener(event, on);
            fn.apply(this, args);
        }
        on.fn = fn;
        this.on(event, on, argsOnce);
        return this;
    }
    /**
     * Emit `event`.
     * @param  {EventTypes} event - Le type d'évenement
     * @return {Base} L'instance du média
     */
    emit(event) {
        return this._callListeners(event);
    }
}
/**
 * Classe principale du projet, contenant toutes les propriétés et méthodes statiques
 * @class
 */
class UsBetaSeries {
    static setDebug = Debug;
    /*
                    STATIC
     */
    static logger = new UsBetaSeries.setDebug('BS');
    /**
     * Flag de debug pour le dev
     * @static
     * @type {Function}
     */
    static debug = UsBetaSeries.logger.fnDebug;
    /**
     * L'objet cache du script pour stocker les données
     * @static
     * @type {CacheUS}
     */
    static cache = null;
    /**
     * Objet contenant les modèles de routes du site BetaSeries
     * @type {Object.<string, string>}
     */
    static routes = {};
    /**
     * Génère une route à partir de son type et des données fournit en paramètre
     * @param   {string} routeType - Type de route à générer (doit être une clé de l'objet UsBetaSeries.routes)
     * @param   {object} [data = {}] - L'objet contenant les données à remplacer dans la route
     * @returns {string} La route générée
     * @throws  {Error} Si la donnée de remplacement n'est pas trouvée
     */
    static generateRoute(routeType, data = {}) {
        // UsBetaSeries.debug('UsBetaSeries.generateRoute', {routeType, data, routes: this.routes});
        if (isNull(this.routes[routeType]) || isNull(data))
            return null;
        let route = this.routes[routeType], found;
        // UsBetaSeries.debug('UsBetaSeries.generateRoute model route: %s', route);
        const reg = /\{(\w+)\}/;
        while (!isNull(found = route.match(reg))) {
            // UsBetaSeries.debug('UsBetaSeries.generateRoute while route: %s', route, found);
            if (isNull(data[found[1]])) {
                // UsBetaSeries.debug('UsBetaSeries.generateRoute while data not found', route, data[found[1]]);
                throw new Error(`UsBetaSeries.generateRoute data[${found[1]}] not found`);
            }
            route = route.replace(reg, data[found[1]]);
        }
        // UsBetaSeries.debug('UsBetaSeries.generateRoute return route: %s', route);
        return route;
    }
    /**
     * Objet contenant les informations de l'API
     * @static
     * @type {Obj}
     */
    static api = {
        "url": 'https://api.betaseries.com',
        "versions": {
            "current": '3.0',
            "last": '3.0'
        },
        "resources": [
            'badges', 'comments', 'episodes', 'friends', 'members', 'messages',
            'movies', 'news', 'oauth', 'persons', 'pictures', 'planning',
            'platforms', 'polls', 'reports', 'search', 'seasons', 'shows',
            'subtitles', 'timeline'
        ],
        "check": {
            "episodes": ['display', 'list', 'search', 'watched'],
            "members": ['notifications'],
            "movies": ['list', 'movie', 'search', 'similars'],
            "search": ['all', 'movies', 'shows'],
            "shows": ['display', 'episodes', 'list', 'member', 'search', 'similars']
        },
        "notDisplay": ['membersnotifications'],
        "tokenRequired": {
            "comments": {
                "close": ['POST'],
                "comment": ['POST', 'DELETE'],
                "comment_event": ['POST'],
                "open": ['POST'],
                "subscription": ['POST', 'DELETE'],
                "thumb": ['POST', 'DELETE']
            },
            "episodes": {
                "downloaded": ['POST', 'DELETE'],
                "hidden": ['POST', 'DELETE'],
                "latest": ['GET'],
                "list": ['GET'],
                "next": ['GET'],
                "note": ['POST', 'DELETE'],
                "scraper": ['GET'],
                "search": ['GET'],
                "unrated": ['GET'],
                "watched": ['POST', 'DELETE'],
            },
            "members": {
                "avatar": ['POST', 'DELETE'],
                "banner": ['POST', 'DELETE'],
                "delete": ['POST'],
                "destroy": ['POST'],
                "email": ['GET', 'POST'],
                "facebook": ['POST'],
                "is_active": ['GET'],
                "lametric": ['GET'],
                "locale": ['GET'],
                "notification": ['DELETE'],
                "notifications": ['GET'],
                "option": ['POST'],
                "options": ['GET'],
                "password": ['POST'],
                "sync": ['POST'],
                "twitter": ['POST', 'DELETE'],
            },
            "movies": {
                "favorite": ['POST', 'DELETE'],
                "movie": ['POST', 'DELETE'],
                "note": ['POST', 'DELETE'],
                "scraper": ['GET'],
            },
            "platforms": {
                "service": ['POST', 'DELETE']
            },
            "shows": {
                "archive": ['POST', 'DELETE'],
                "favorite": ['POST', 'DELETE'],
                "note": ['POST', 'DELETE'],
                "recommendation": ['POST', 'DELETE', 'PUT'],
                "recommendations": ['GET'],
                "show": ['POST', 'DELETE'],
                "tags": ['POST'],
                "unrated": ['GET'],
            },
            "subtitles": {
                "report": ['POST']
            }
        }
    };
    /**
     * Le token d'authentification de l'API BetaSeries
     * @static
     * @type {String}
     */
    static token = null;
    /**
     * La clé d'utilisation de l'API BetaSeries
     * @static
     * @type {String}
     */
    static userKey = null;
    /**
     * L'identifiant du membre connecté
     * @static
     * @type {Number}
     */
    static userId = null;
    /**
     * Infos du membre, si il est connecté
     * @static
     * @type {Member}
     */
    static member = null;
    /**
     * Clé d'authentification pour l'API TheMovieDB
     * @static
     * @type {string}
     */
    static themoviedb_api_user_key = null;
    /**
     * Compteur d'appels à l'API
     * @static
     * @type {Number}
     */
    static counter = 0;
    /**
     * L'URL de base du serveur contenant les ressources statiques
     * et les proxy
     * @static
     * @type {String}
     */
    static serverBaseUrl = '';
    /**
     * L'URL de base du serveur pour l'authentification
     * @static
     * @see UsBetaSeries.authenticate
     * @type {String}
     */
    static serverOauthUrl = '';
    /**
     * Indique le theme d'affichage du site Web (light or dark)
     * @static
     * @type {string}
     */
    static theme = 'light';
    /**
     * Fonction de notification sur la page Web
     * @type {Function}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static notification = (title, text) => { };
    /**
     * Fonction pour vérifier que le membre est connecté
     * @type {Function}
     */
    static userIdentified = () => {
        return !isNull(this.token) && !isNull(this.userId);
    };
    /**
     * Fonction vide
     * @type {Function}
     */
    static noop = () => { };
    /**
     * Fonction de traduction de chaînes de caractères
     * @param   {String}  msg  - Identifiant de la chaîne à traduire
     * @param   {Obj}     [params] - Variables utilisées dans la traduction \{"%key%"": value\}
     * @param   {number}  [count=1] - Nombre d'éléments pour la version plural
     * @returns {string}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static trans = (msg, params, count = 1) => {
        return msg;
    };
    /**
     * Contient les infos sur les différentes classification TV et cinéma
     * @type {Ratings}
     */
    static ratings = null;
    static gm_funcs = {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        getValue: (key, defaultValue) => {
            return defaultValue;
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        setValue: (key, val) => { }
    };
    /**
     * bsModule contient la correspondance entre les noms de classe et l'objet Function\
     * Cela sert aux méthodes getInstance et checkClassname
     * @static
     * @type {Record<string, any>}
     */
    static bsModule = {};
    /**
     * getInstance - fonction servant à instancier un objet à partir de son nom de classe
     * et de paramètres
     * @static
     * @param   {string} className - Le nom de la classe à instancier
     * @param   {Array} [args = []] - Les paramètres à fournir au constructeur
     * @returns {any} L'objet instancié
     * @throws Error
     */
    static getInstance;
    /**
     * checkClassname - Fonction servant à vérifier si la classe est connue
     * et peut être instanciée
     * @static
     * @param   {string} className - Le nom de classe à vérifier
     * @returns {boolean}
     */
    static checkClassname;
    /**
     * Méthode servant à afficher le loader sur la page Web
     * @static
     */
    static showLoader() {
        jQuery('#loader-bg').show();
    }
    /**
     * Méthode servant à masque le loader sur la page Web
     * @static
     */
    static hideLoader() {
        jQuery('#loader-bg').hide();
    }
    /**
     * Fonction d'authentification à l'API BetaSeries
     * @static
     * @return {Promise}
     */
    static authenticate() {
        UsBetaSeries.debug('authenticate');
        if (jQuery('#containerIframe').length <= 0) {
            jQuery('body').append(`
                    <div id="containerIframe">
                    <iframe id="userscript"
                            name="userscript"
                            title="Connexion à BetaSeries"
                            width="50%"
                            height="400"
                            src="${UsBetaSeries.serverOauthUrl}/index.html"
                            style="background:white;margin:auto;">
                    </iframe>
                    </div>'
                `);
        }
        return new Promise((resolve, reject) => {
            function receiveMessage(event) {
                const origin = new URL(UsBetaSeries.serverOauthUrl).origin;
                // UsBetaSeries.debug('receiveMessage', event);
                if (event.origin !== origin) {
                    console.error('receiveMessage {origin: %s}', event.origin, event);
                    reject(`event.origin is not ${origin}`);
                    return;
                }
                if (event.data.message === 'access_token') {
                    UsBetaSeries.token = event.data.value;
                    $('#containerIframe').remove();
                    resolve(event.data.message);
                    window.removeEventListener("message", receiveMessage, false);
                }
                else {
                    console.error('Erreur de récuperation du token', event);
                    reject(event.data);
                    UsBetaSeries.notification('Erreur de récupération du token', 'Pas de message');
                    window.removeEventListener("message", receiveMessage, false);
                }
            }
            window.addEventListener("message", receiveMessage, false);
        });
    }
    /**
     * Flag indiquant qu'une demande d'authentification est en cours
     * @type {boolean}
     * @private
     */
    static __checkAuthenticate = false;
    /**
     * Nombre de timeout consécutifs lors des appels à l'API
     * @type {number}
     * @private
     * @static
     */
    static __nbNetTimeout = 0;
    static __maxTimeout = 2;
    /**
     * Durée du timeout des requêtes à l'API exprimé en secondes
     * @type {number}
     */
    static timeoutRequests = 30;
    /**
     * Fonction servant à appeler l'API de BetaSeries
     * @static
     * @param  {String}   type - Type de methode d'appel Ajax (GET, POST, PUT, DELETE)
     * @param  {String}   resource - La ressource de l'API (ex: shows, seasons, episodes...)
     * @param  {String}   action - L'action à appliquer sur la ressource (ex: search, list...)
     * @param  {Obj}      args - Un objet (clef, valeur) à transmettre dans la requête
     * @param  {bool}     [force=false] - Indique si on doit forcer l'appel à l'API ou
     * si on peut utiliser le cache (Par défaut: false)
     * @return {Promise<Obj>} Les données provenant de l'API
     * @throws Error
     */
    static callApi(type, resource, action, args, force = false) {
        if (UsBetaSeries.api && UsBetaSeries.api.resources.indexOf(resource) === -1) {
            throw new Error(`Ressource (${resource}) inconnue dans l'API.`);
        }
        if (!UsBetaSeries.userKey) {
            UsBetaSeries.notification('Call API', `La clé API doit être renseignée`);
            throw new Error('userKey are required');
        }
        if (!UsBetaSeries.token && resource in UsBetaSeries.api.tokenRequired &&
            action in UsBetaSeries.api.tokenRequired[resource] &&
            UsBetaSeries.api.tokenRequired[resource][action].indexOf(type) !== 1) {
            UsBetaSeries.notification('Call API', `Identification requise pour cet appel: ${type} ${resource}/${action}`);
            // Identification required
            throw new ExceptionIdentification("Identification required");
        }
        const logger = (new UsBetaSeries.setDebug('BS:API'));
        let check = false;
        let display = true;
        // On vérifie si on doit afficher les infos de requêtes dans la console
        if (UsBetaSeries.api.notDisplay.indexOf(resource + action) >= 0) {
            display = false;
        }
        else {
            UsBetaSeries.showLoader();
        }
        // Les en-têtes pour l'API
        const myHeaders = {
            'Accept': 'application/json',
            'X-BetaSeries-Version': UsBetaSeries.api.versions.current,
            'X-BetaSeries-Token': UsBetaSeries.token,
            'X-BetaSeries-Key': UsBetaSeries.userKey
        }, checkKeys = Object.keys(UsBetaSeries.api.check);
        if (display) {
            logger.debug('parameters', {
                type: type,
                resource: resource,
                action: action,
                args: args,
                force: force
            });
        }
        // On retourne la ressource en cache si elle y est présente
        if (UsBetaSeries.cache && !force && type === 'GET' && args && 'id' in args &&
            UsBetaSeries.cache.has(resource, args.id)) {
            //logger.debug('UsBetaSeries.callApi retourne la ressource du cache (%s: %d)', resource, args.id);
            return new Promise((resolve) => {
                resolve(UsBetaSeries.cache.get(resource, args.id));
                UsBetaSeries.hideLoader();
            });
        }
        // Vérification de l'état du réseau, doit être placé après la gestion du cache
        if (UsBetaSeries.__networkState === NetworkState.offline) {
            const key = type + resource + action;
            if (!isNull(UsBetaSeries.__networkQueue[key])) {
                UsBetaSeries.__networkQueue[key].reject('another request called');
            }
            const promise = new FakePromise((reason) => {
                if (reason && reason.length > 0) {
                    return Promise.reject(reason);
                }
                return UsBetaSeries.callApi(type, resource, action, args, force)
                    .then(data => data)
                    .catch(err => err);
            });
            UsBetaSeries.__networkQueue[key] = promise;
            return promise;
        }
        // On check si on doit vérifier la validité du token
        // (https://www.betaseries.com/bugs/api/461)
        if (UsBetaSeries.userIdentified() && checkKeys.indexOf(resource) !== -1 &&
            UsBetaSeries.api.check[resource].indexOf(action) !== -1) {
            check = true;
            if (UsBetaSeries.__checkAuthenticate) {
                logger.debug('authenticate in progress');
                return new Promise((res, rej) => {
                    let loop = 0;
                    const checkAuthenticate = function checkAuthenticate() {
                        logger.debug('checkAuthenticate(%d) for %s %s/%s', ++loop, type, resource, action);
                        if (UsBetaSeries.__checkAuthenticate && UsBetaSeries.__networkState === NetworkState.online) {
                            setTimeout(checkAuthenticate, 1000);
                        }
                        else if (UsBetaSeries.__networkState === NetworkState.offline) {
                            UsBetaSeries.__checkAuthenticate = false;
                            rej('network offline');
                        }
                        else if (UsBetaSeries.__networkState === NetworkState.online) {
                            UsBetaSeries.callApi(type, resource, action, args, force)
                                .then(data => res(data))
                                .catch(err => rej(err));
                        }
                        else {
                            logger.debug('checkAuthenticate - condition unknown', { checkAuthenticate: UsBetaSeries.__checkAuthenticate });
                        }
                    };
                    checkAuthenticate();
                });
            }
        }
        /**
         * Appel à l'API
         * @param {function} resolve - Fonction appelée en cas de succès
         * @param {function} reject - Fonction appelée en cas d'échec
         */
        function fetchUri(resolve, reject) {
            const initFetch = {
                method: type,
                headers: myHeaders,
                mode: 'cors',
                cache: 'no-cache'
            };
            let uri = `${UsBetaSeries.api.url}/${resource}/${action}`;
            const keys = Object.keys(args);
            // On crée l'URL de la requête de type GET avec les paramètres
            if (type === 'GET' && keys.length > 0) {
                const params = [];
                for (const key of keys) {
                    params.push(key + '=' + encodeURIComponent(args[key]));
                }
                uri += '?' + params.join('&');
            }
            else if (keys.length > 0) {
                initFetch.body = new URLSearchParams(args);
            }
            fetchTimeout(uri, initFetch, UsBetaSeries.timeoutRequests).ready()
                .then(response => {
                UsBetaSeries.__nbNetTimeout = 0;
                UsBetaSeries.counter++; // Incrément du compteur de requêtes à l'API
                if (display || response.status !== 200)
                    //logger.debug('fetchUri (%s %s) response status: %d', type, uri, response.status);
                    // On récupère les données et les transforme en objet
                    response.json().then((data) => {
                        if (display || response.status !== 200)
                            logger.debug('fetchUri (%s %s) data', type, uri, data);
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
                                UsBetaSeries.authenticate().then(() => {
                                    UsBetaSeries.callApi(type, resource, action, args, force)
                                        .then(data => resolve(data), err => reject(err));
                                }, (err) => {
                                    reject(err);
                                });
                            }
                            else {
                                reject(data.errors[0]);
                            }
                            UsBetaSeries.hideLoader();
                            return;
                        }
                        // On gère les erreurs réseau
                        if (!response.ok) {
                            console.error('Fetch erreur network', response);
                            reject(response);
                            UsBetaSeries.hideLoader();
                            return;
                        }
                        resolve(data);
                        UsBetaSeries.hideLoader();
                    });
            }).catch(error => {
                console.warn('fetchUri catch (%s: %s/%s)', type, resource, action);
                if (error.name === 'AbortError') {
                    if (++UsBetaSeries.__nbNetTimeout > UsBetaSeries.__maxTimeout) {
                        logger.debug('%d timeout consecutifs, Network state to offline', UsBetaSeries.__nbNetTimeout);
                        UsBetaSeries.changeNetworkState(NetworkState.offline, true);
                    }
                    logger.debug('AbortError Timeout(nb retry: %d) fetchUri', UsBetaSeries.__nbNetTimeout);
                    return;
                }
                console.warn('fetchUri error: ' + error.message);
                console.error(error);
                reject(error);
            }).finally(() => {
                UsBetaSeries.hideLoader();
            });
        }
        return new Promise((resolve, reject) => {
            if (check) {
                UsBetaSeries.__checkAuthenticate = true;
                const paramsFetch = {
                    method: HTTP_VERBS.GET,
                    headers: myHeaders,
                    mode: 'cors',
                    cache: 'no-cache'
                };
                if (display)
                    logger.info('%ccall /members/is_active', 'color:#ffc107');
                fetchTimeout(`${UsBetaSeries.api.url}/members/is_active`, paramsFetch, UsBetaSeries.timeoutRequests).ready()
                    .then((resp) => {
                    UsBetaSeries.__nbNetTimeout = 0;
                    UsBetaSeries.counter++; // Incrément du compteur de requêtes à l'API
                    if (!resp.ok && resp.status === 400) {
                        logger.debug('authenticate for %s: %s/%s', type, resource, action);
                        // Appel de l'authentification pour obtenir un token valide
                        UsBetaSeries.authenticate().then(() => {
                            // On met à jour le token pour le prochain appel à l'API
                            myHeaders['X-BetaSeries-Token'] = UsBetaSeries.token;
                            UsBetaSeries.__checkAuthenticate = false;
                            fetchUri(resolve, reject);
                        }).catch(err => reject(err));
                        return;
                    }
                    else if (!resp.ok) {
                        reject(resp.statusText);
                        return;
                    }
                    UsBetaSeries.__checkAuthenticate = false;
                    fetchUri(resolve, reject);
                }).catch(error => {
                    UsBetaSeries.__checkAuthenticate = false;
                    console.warn('fetch members/is_active catch');
                    if (error.name === 'AbortError') {
                        if (++UsBetaSeries.__nbNetTimeout > UsBetaSeries.__maxTimeout) {
                            logger.debug('%d timeout consecutifs, Network state to offline', UsBetaSeries.__nbNetTimeout);
                            UsBetaSeries.changeNetworkState(NetworkState.offline, true);
                        }
                        logger.debug('AbortError Timeout(nb retry: %d) members/is_active', UsBetaSeries.__nbNetTimeout);
                        return;
                    }
                    else if (error.message.toLowerCase() === 'failed to fetch') {
                        logger.debug('On déclare le réseau hors ligne. Le retour du réseau sera testé régulièrement.');
                        UsBetaSeries.changeNetworkState(NetworkState.offline, true);
                    }
                    else {
                        logger.debug('Il y a eu un problème avec l\'opération fetch: ' + error.message);
                    }
                    console.error(error);
                    reject(error);
                })
                    .finally(() => {
                    UsBetaSeries.__checkAuthenticate = false;
                });
            }
            else {
                fetchUri(resolve, reject);
            }
        });
    }
    /**
     * *setPropValue* - Permet de modifier la valeur d'une propriété dans un objet,
     * ou dans un sous objet de manière dynamique
     * @param obj - Objet à modifier
     * @param key - chemin d'accès à la propriété à modifier
     * @param val - Nouvelle valeur de la propriété
     */
    static setPropValue(obj, key, val) {
        if (key.indexOf('.') >= 0) {
            const data = key.split('.');
            const path = data.shift();
            key = data.join('.');
            // On verifie si il s'agit d'un element de tableau
            if (/\[\d+\]$/.test(path)) {
                // On récupère le tableau et on laisse l'index
                const tab = path.replace(/\[\d+\]$/, '');
                const index = parseInt(path.replace(/[^\d]*/, ''), 10);
                UsBetaSeries.setPropValue(obj[tab][index], key, val);
            }
            else if (/\[.*\]$/.test(path)) {
                const tab = path.replace(/\[.+\]$/, '');
                const index = path.replace(/^.*\[/, '').replace(/\]$/, '');
                UsBetaSeries.setPropValue(obj[tab][index], key, val);
            }
            else {
                UsBetaSeries.setPropValue(obj[path], key, val);
            }
        }
        else if (/\[.*\]$/.test(key)) {
            const tab = key.replace(/\[.+\]$/, '');
            const index = key.replace(/^.*\[/, '').replace(/\]$/, '');
            obj[tab][index] = val;
        }
        else {
            obj[key] = val;
        }
    }
    /**
     * *replaceParams* - Permet de remplacer des paramètres par des valeurs dans une chaîne de caractères
     * @param   {string} path -   Chaine à modifier avec les valeurs
     * @param   {object} params - Objet contenant les paramètres autorisés et leur type
     * @param   {object} data -   Objet contenant les valeurs des paramètres
     * @returns {string}
     */
    static replaceParams(path, params, data) {
        const keys = Object.keys(params);
        for (let k = 0; k < keys.length; k++) {
            const key = keys[k];
            const type = params[key];
            if (data[key] === undefined) {
                throw new Error(`Parameter[${key}] missing`);
            }
            let param = data[key];
            if (type == 'number') {
                param = parseInt(param, 10);
            }
            else if (type == 'string') {
                param = String(param);
            }
            const reg = new RegExp(`#${key}#`, 'g');
            path = path.replace(reg, param);
        }
        return path;
    }
    /**
     * Etat du réseau
     * @type {NetworkState}
     */
    static __networkState = NetworkState.online;
    /**
     * Contient l'identifiant du timer de vérification du réseau
     * @type {number}
     */
    static networkTimeout;
    /**
     * Stockage des appels à l'API lorsque le réseau est offline
     * @type {Object.<string, FakePromise>}
     */
    static __networkQueue = {};
    /**
     * Objet contenant les fonctions à exécuter lors des changements de d'état du réseau
     * @type {NetworkStateEvents}
     */
    static networkStateEventsFn = {
        offline: () => { },
        online: () => { }
    };
    /**
     * Modifie la variable de l'état du réseau
     * Et gère les promesses d'appels à l'API lorsque le réseau est online
     * @param {NetworkState} state - Etat du réseau
     * @param {boolean} [testNetwork = false] - Flag demandant de vérifier l'état du réseau régulièrement
     */
    static changeNetworkState(state, testNetwork = false) {
        this.__networkState = state;
        if (typeof UsBetaSeries.networkStateEventsFn[NetworkState[state]] === 'function') {
            UsBetaSeries.networkStateEventsFn[NetworkState[state]]();
        }
        if (state === NetworkState.online && Object.keys(this.__networkQueue).length > 0) {
            const keys = Reflect.ownKeys(this.__networkQueue);
            for (const key of keys) {
                this.__networkQueue[key].launch();
                // promise.finally(() => delete this.__networkQueue[key as string]);
            }
        }
        else if (state === NetworkState.offline) {
            this.__networkQueue = {};
            if (testNetwork) {
                checkNetwork();
            }
        }
    }
}
/*
 * Date Format 1.2.3
 * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
 * MIT license
 *
 * Includes enhancements by Scott Trenda <scott.trenda.net>
 * and Kris Kowal <cixar.com/~kris.kowal/>
 *
 * Accepts a date, a mask, or a date and a mask.
 * Returns a formatted version of the given date.
 * The date defaults to the current date/time.
 * The mask defaults to dateFormat.masks.default.
 */
const dateFormat = function () {
    const token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g, timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g, timezoneClip = /[^-+\dA-Z]/g, pad = (val, len = 2) => String(val).padStart(len, '0');
    // Some common format strings
    const masks = {
        "default": "ddd dd mmm yyyy HH:MM:ss",
        datetime: "dd/mm/yyyy HH:MM",
        shortDate: "d/m/yy",
        mediumDate: "d mmm yyyy",
        longDate: "d mmmm yyyy",
        fullDate: "dddd, d mmmm yyyy",
        shortTime: "h:MM TT",
        mediumTime: "h:MM:ss TT",
        longTime: "h:MM:ss TT Z",
        isoDate: "yyyy-mm-dd",
        isoTime: "HH:MM:ss",
        isoDateTime: "yyyy-mm-dd'T'HH:MM:ss",
        isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
    };
    // Internationalization strings
    const i18n = {
        dayNames: {
            abr: ["Dim.", "Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam."],
            full: ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"]
        },
        monthNames: {
            abr: ["Jan.", "Fev.", "Mar.", "Avr.", "Mai", "Juin", "Juil.", "Août", "Sept.", "Oct.", "Nov.", "Dec."],
            full: [
                "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet",
                "Août", "Septembre", "Octobre", "Novembre", "Décembre"
            ]
        }
    };
    // Regexes and supporting functions are cached through closure
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return function (date, mask, utc) {
        // const dF = dateFormat;
        // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
        if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
            mask = date;
            date = undefined;
        }
        // Passing date through Date applies Date.parse, if necessary
        date = date ? new Date(date) : new Date;
        if (isNaN(date))
            throw TypeError("invalid date");
        mask = String(masks[mask] || mask || masks["default"]);
        // Allow setting the utc argument via the mask
        if (mask.slice(0, 4) == "UTC:") {
            mask = mask.slice(4);
            utc = true;
        }
        const _ = utc ? "getUTC" : "get", d = date[_ + "Date"](), D = date[_ + "Day"](), m = date[_ + "Month"](), y = date[_ + "FullYear"](), H = date[_ + "Hours"](), M = date[_ + "Minutes"](), s = date[_ + "Seconds"](), L = date[_ + "Milliseconds"](), o = utc ? 0 : date.getTimezoneOffset(), flags = {
            d: d,
            dd: pad(d),
            ddd: i18n.dayNames.abr[D],
            dddd: i18n.dayNames.full[D],
            m: m + 1,
            mm: pad(m + 1),
            mmm: i18n.monthNames.abr[m],
            mmmm: i18n.monthNames.full[m],
            yy: String(y).slice(2),
            yyyy: y,
            h: H % 12 || 12,
            hh: pad(H % 12 || 12),
            H: H,
            HH: pad(H),
            M: M,
            MM: pad(M),
            s: s,
            ss: pad(s),
            l: pad(L, 3),
            L: pad(L > 99 ? Math.round(L / 10) : L),
            t: H < 12 ? "a" : "p",
            tt: H < 12 ? "am" : "pm",
            T: H < 12 ? "A" : "P",
            TT: H < 12 ? "AM" : "PM",
            Z: utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
            o: (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4)
        };
        return mask.replace(token, function ($0) {
            return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
        });
    };
}();
const calculDuration = function () {
    const dayOfYear = (date) => {
        const ref = new Date(date.getFullYear(), 0, 0);
        return Math.floor((date.getTime() - ref.getTime()) / 86400000);
    };
    const i18n = {
        yesterday: 'Hier',
        dayBeforeYesterday: 'Avant-hier',
        longTime: 'Il y a longtemps',
        days: 'Il y a %days% jours',
        hours: 'Il y a %hours% heures',
        minutes: 'Il y a %minutes% minutes'
    };
    return function (date) {
        const now = new Date();
        const days = Math.round(dayOfYear(now) - dayOfYear(date));
        if (days > 0) {
            if (days === 1) {
                return i18n.yesterday;
            }
            else if (days === 2) {
                return i18n.dayBeforeYesterday;
            }
            else if (days > 30) {
                return i18n.longTime;
            }
            return i18n.days.replace('%days%', days.toString());
        }
        else {
            const minutes = Math.round((now.getTime() - date.getTime()) / 60000);
            const hours = Math.round((now.getTime() - date.getTime()) / 3600000);
            if (hours === 0 && minutes > 0) {
                return i18n.minutes.replace('%minutes%', minutes.toString());
            }
            else if (hours > 0) {
                return i18n.hours.replace('%hours%', hours.toString());
            }
        }
    };
}();
const upperFirst = function () {
    return function (word) {
        return word.charAt(0).toUpperCase() + word.slice(1);
    };
}();
const camelCase = function () {
    return function (words) {
        return words
            // eslint-disable-next-line no-useless-escape
            .replace(/[.,\/#!$%\^&\*;:][{}=\-_`~()]/g, '_')
            .replace(/[^a-zA-Z_]/g, '')
            .split('_')
            .reduce((result, word, index) => {
            return result + (index ? word.upperFirst() : word.toLowerCase());
        }, '');
    };
}();
// For convenience...
Date.prototype.format = function (mask, utc = false) {
    return dateFormat(this, mask, utc);
};
Date.prototype.duration = function () {
    return calculDuration(this);
};
String.prototype.upperFirst = function () {
    return upperFirst(this);
};
String.prototype.camelCase = function () {
    return camelCase(this);
};

/**
 * RenderHtml - Classe abstraite des éléments ayant un rendu HTML sur la page Web
 * @class
 * @abstract
 * @extends Base
 * @implements {implRenderHtml}
 * @implements {implFillDecorator}
 */
class RenderHtml extends Base {
    static logger = new UsBetaSeries.setDebug('RenderHtml');
    static debug = RenderHtml.logger.debug.bind(RenderHtml.logger);
    static relatedProps = {};
    static selectorsCSS = {};
    /**
     * Decorators de la classe
     * @type {Object.<string, AbstractDecorator>}
     */
    __decorators = {
        fill: new FillDecorator(this)
    };
    /**
     * Element HTML de référence du média
     * @type {JQuery<HTMLElement>}
     */
    __elt;
    /**
     * Flag d'initialisation de l'objet, nécessaire pour les methodes fill and compare
     * @type {boolean}
     */
    __initial = true;
    /**
     * Stocke les changements des propriétés de l'objet
     * @type {Object.<string, Changes>}
     */
    __changes = {};
    /**
     * Tableau des propriétés énumerables de l'objet
     * @type {Array<string>}
     */
    __props = [];
    /*
                    METHODS
    */
    constructor(data, elt) {
        super(data);
        if (elt)
            this.__elt = elt;
        this.__initial = true;
        this.__changes = {};
        this.__props = [];
        return this;
    }
    /**
     * Symbol.Iterator - Methode Iterator pour les boucles for..of
     * @returns {object}
     */
    [Symbol.iterator]() {
        const self = this;
        return {
            pos: 0,
            props: self.__props,
            next() {
                if (this.pos < this.props.length) {
                    const item = { value: this.props[this.pos], done: false };
                    this.pos++;
                    return item;
                }
                else {
                    this.pos = 0;
                    return { value: null, done: true };
                }
            }
        };
    }
    /**
     * Remplit l'objet avec les données fournit en paramètre
     * @param   {Obj} data - Les données provenant de l'API
     * @returns {RenderHtml}
     */
    fill(data) {
        try {
            return this.__decorators.fill.fill.call(this, data);
        }
        catch (err) {
            console.error(err);
        }
    }
    /**
     * Met à jour le rendu HTML des propriétés de l'objet,
     * si un sélecteur CSS exite pour la propriété fournit en paramètre\
     * **Méthode appelée automatiquement par le setter de la propriété**
     * @see Show.selectorsCSS
     * @param   {string} propKey - La propriété de l'objet à mettre à jour
     * @returns {void}
     */
    updatePropRender(propKey) {
        try {
            this.__decorators.fill.updatePropRender.call(this, propKey);
        }
        catch (err) {
            console.error(err);
        }
    }
    /**
     * Retourne l'objet sous forme d'objet simple, sans référence circulaire,
     * pour la méthode JSON.stringify
     * @returns {object}
     */
    toJSON() {
        const obj = {};
        for (const key of this.__props) {
            obj[key] = this[key];
        }
        return obj;
    }
    /**
     * Indique si cet objet a été modifié
     * @returns {boolean}
     */
    isModified() {
        return Object.keys(this.__changes).length > 0;
    }
    /**
     * Retourne les changements apportés à cet objet
     * @returns {Record<string, Changes>}
     */
    getChanges() {
        return this.__changes;
    }
    /**
     * Indique si la propriété passée en paramètre a été modifiée
     * @param   {string} propKey - La propriété ayant potentiellement été modifiée
     * @returns {boolean}
     */
    hasChange(propKey) {
        if (!this.__props.includes(propKey)) {
            throw new Error(`Property[${propKey}] not exists in this object(${this.constructor.name})`);
        }
        return Reflect.has(this.__changes, propKey);
    }
    /**
     * Retourne l'objet Changes correspondant aux changements apportés à la propriété passée en paramètre
     * @param   {string} propKey - La propriété ayant été modifiée
     * @returns {Changes} L'objet Changes correspondant aux changement
     */
    getChange(propKey) {
        if (!this.__props.includes(propKey)) {
            throw new Error(`Property[${propKey}] not exists in this object(${this.constructor.name})`);
        }
        return this.__changes[propKey];
    }
    /**
     * Retourne le DOMElement de référence du média
     * @returns {JQuery<HTMLElement>} Le DOMElement jQuery
     */
    get elt() {
        return this.__elt;
    }
    /**
     * Définit le DOMElement de référence du média\
     * Nécessaire **uniquement** pour le média principal de la page Web\
     * Il sert à mettre à jour les données du média sur la page Web
     * @param  {JQuery<HTMLElement>} elt - DOMElement auquel est rattaché le média
     */
    set elt(elt) {
        this.__elt = elt;
    }
}

class Character {
    static logger = new UsBetaSeries.setDebug('Character');
    static debug = Character.logger.debug.bind(Character.logger);
    static relatedProps = {
        "actor": { key: "actor", type: 'string' },
        // "description": {key: "description", type: 'string'},
        // "guest": {key: "guest", type: 'boolean', default: false},
        // "id": {key: "id", type: 'number'},
        "name": { key: "name", type: 'string' },
        "picture": { key: "picture", type: 'string' },
        // "role": {key: "role", type: 'string'},
        "show_id": { key: "show_id", type: 'number' },
        "movie_id": { key: "movie_id", type: 'number' },
        "person_id": { key: "person_id", type: 'number' }
    };
    /**
     * Nom de l'acteur/actrice
     * @type {string}
     */
    actor;
    /**
     * Nom du personnage
     * @type {string}
     */
    name;
    /**
     * URL de l'image du personnage
     * @type {string}
     */
    picture;
    /**
     * Identifiant de la série
     * @type {number}
     */
    show_id;
    /**
     * Identifiant du film
     * @type {number}
     */
    movie_id;
    /**
     * Identifiant de l'objet Person correspondant à l'acteur
     * @type {number}
     */
    person_id;
    __decorators = {
        fill: new FillDecorator(this)
    };
    __elt;
    __initial = true;
    __changes = {};
    __props = [];
    person;
    constructor(data) {
        return this.fill(data)._initRender();
    }
    _initRender() {
        if (!this.elt) {
            const self = this;
            const $actors = jQuery('#actors .slides_flex .slide_flex');
            $actors.each((_, elt) => {
                let title = jQuery('.slide__title', elt).text().trim();
                if (/&nbsp;/g.test(title)) {
                    title = title.replace(/&nbsp;/g, '');
                }
                if (title == this.actor) {
                    Character.debug('Character._initRender: actor found', { actor: this.actor, title });
                    self.elt = jQuery(elt);
                    self.elt.attr('data-person-id', this.person_id);
                    return false;
                }
            });
        }
        return this;
    }
    get elt() {
        return this.__elt;
    }
    set elt(elt) {
        this.__elt = elt;
    }
    /**
     * Remplit l'objet avec les données fournit en paramètre
     * @param   {Obj} data - Les données provenant de l'API
     * @returns {Character}
     */
    fill(data) {
        try {
            return this.__decorators.fill.fill.call(this, data);
        }
        catch (err) {
            console.error(err);
        }
    }
    /**
     * Met à jour le rendu HTML des propriétés de l'objet,
     * si un sélecteur CSS exite pour la propriété fournit en paramètre\
     * **Méthode appelée automatiquement par le setter de la propriété**
     * @see Show.selectorsCSS
     * @param   {string} propKey - La propriété de l'objet à mettre à jour
     * @returns {void}
     */
    updatePropRender(propKey) {
        try {
            this.__decorators.fill.updatePropRender.call(this, propKey);
        }
        catch (err) {
            console.error(err);
        }
    }
    /**
     * Retourne l'objet sous forme d'objet simple, sans référence circulaire,
     * pour la méthode JSON.stringify
     * @returns {object}
     */
    toJSON() {
        const obj = {};
        for (const key of this.__props) {
            obj[key] = this[key];
        }
        return obj;
    }
    fetchPerson() {
        return Person.fetch(this.person_id)
            .then((person) => {
            if (person instanceof Person) {
                this.person = person;
            }
            return this.person;
        }).catch(err => {
            console.error('Character.fetchPerson error: ', err);
            return null;
        });
    }
}
class PersonMedia {
    static relatedProps = {
        "id": { key: "id", type: 'number' },
        "thetvdb_id": { key: "thetvdb_id", type: 'number' },
        "imdb_id": { key: "imdb_id", type: 'string' },
        "themoviedb_id": { key: "tmdb_id", type: 'number' },
        "tmdb_id": { key: "tmdb_id", type: 'number' },
        "title": { key: "title", type: 'string' },
        "seasons": { key: "seasons", type: 'number' },
        "episodes": { key: "episodes", type: 'number' },
        "followers": { key: "followers", type: 'number' },
        "creation": { key: "creation", type: 'number' },
        "production_year": { key: "creation", type: 'number' },
        "slug": { key: "slug", type: 'string' },
        "url": { key: "slug", type: 'string' },
        "poster": { key: "poster", type: 'string' },
    };
    id;
    thetvdb_id;
    imdb_id;
    tmdb_id;
    title;
    seasons;
    episodes;
    followers;
    creation;
    slug;
    poster;
    __initial;
    __changes;
    __props;
    elt;
    __decorators = {
        "fill": new FillDecorator(this)
    };
    constructor(data) {
        this.fill(data);
    }
    /**
     * Remplit l'objet avec les données fournit en paramètre
     * @param   {Obj} data - Les données provenant de l'API
     * @returns {Person}
     */
    fill(data) {
        try {
            return this.__decorators.fill.fill.call(this, data);
        }
        catch (err) {
            console.error(err);
        }
    }
    /**
     * Met à jour le rendu HTML des propriétés de l'objet,
     * si un sélecteur CSS exite pour la propriété fournit en paramètre\
     * **Méthode appelée automatiquement par le setter de la propriété**
     * @see Show.selectorsCSS
     * @param   {string} propKey - La propriété de l'objet à mettre à jour
     * @returns {void}
     */
    updatePropRender(propKey) {
        try {
            this.__decorators.fill.updatePropRender.call(this, propKey);
        }
        catch (err) {
            console.error(err);
        }
    }
    /**
     * Retourne l'objet sous forme d'objet simple, sans référence circulaire,
     * pour la méthode JSON.stringify
     * @returns {object}
     */
    toJSON() {
        const obj = {};
        for (const key of this.__props) {
            obj[key] = this[key];
        }
        return obj;
    }
}
class PersonMedias {
    media;
    role;
    type;
    constructor(data, type) {
        if (type === MediaType.show) {
            this.media = new PersonMedia(data.show);
        }
        else if (type === MediaType.movie) {
            this.media = new PersonMedia(data.movie);
        }
        this.role = data.name;
        this.type = type;
    }
    /**
     * Retourne le lien absolu du média
     * @returns {string}
     */
    createLink() {
        return UsBetaSeries.generateRoute(this.type, this.media);
    }
    /**
     * Retourne la représentation du média et de l'acteur
     * @returns {string}
     */
    getTemplate() {
        return `<div class="card" style="width: 18rem;">
            <img data-src="${this.media.poster}" alt="Affiche" class="js-lazy-image img-thumbnail card-img-top"/>
            <div class="card-body">
                <h5 class="card-title">(${this.media.creation}) ${this.media.title}</h5>
                <p class="card-text"><u>Personnage:</u> ${this.role}</p>
                <a href="${this.createLink()}" target="_blank" class="btn btn-primary">Voir la fiche ${this.type === MediaType.show ? 'de la série' : 'du film'}</a>
            </div>
        </div>`;
    }
}
class Person {
    static logger = new UsBetaSeries.setDebug('Person');
    static debug = Character.logger.debug.bind(Character.logger);
    static relatedProps = {
        "id": { key: "id", type: 'number' },
        "name": { key: "name", type: 'string' },
        "birthday": { key: "birthday", type: 'date' },
        "deathday": { key: "deathday", type: 'date' },
        "description": { key: "description", type: 'string' },
        "shows": { key: "shows", type: 'other', default: [], transform(obj, data) {
                if (Array.isArray(obj.shows) && obj.shows.length === data.length) {
                    return obj.shows;
                }
                const shows = [];
                for (let s = 0, _len = data.length; s < _len; s++) {
                    shows.push(new PersonMedias(data[s], MediaType.show));
                }
                return shows;
            } },
        "movies": { key: "movies", type: 'other', default: [], transform(obj, data) {
                if (Array.isArray(obj.movies) && obj.movies.length === data.length) {
                    return obj.movies;
                }
                const movies = [];
                for (let s = 0, _len = data.length; s < _len; s++) {
                    movies.push(new PersonMedias(data[s], MediaType.movie));
                }
                return movies;
            } },
        "last": { key: "last", type: PersonMedias, transform(obj, data) {
                if (data instanceof PersonMedias)
                    return data;
                if (data && data.show) {
                    return new PersonMedias(data, MediaType.show);
                }
                else if (data && data.movie) {
                    return new PersonMedias(data, MediaType.movie);
                }
                return null;
            } }
    };
    static selectorsCSS = {
        "name": ".slide__title"
    };
    /**
     * Récupère les données d'un acteur à partir de son identifiant et retourne un objet Person
     * @param   {number} personId - L'identifiant de l'acteur / actrice
     * @returns {Promise<Person | null>}
     */
    static fetch(personId) {
        return UsBetaSeries.callApi(HTTP_VERBS.GET, 'persons', 'person', { id: personId })
            .then(data => { return data ? new Person(data.person) : null; });
    }
    /**
     * Identifiant de l'acteur / actrice
     * @type {number}
     */
    id;
    /**
     * Nom de l'acteur
     * @type {string}
     */
    name;
    /**
     * Date de naissance
     * @type {Date}
     */
    birthday;
    /**
     * Date de décès
     * @type {Date}
     */
    deathday;
    /**
     * Description
     * @type {string}
     */
    description;
    /**
     * Dernier média enregistré sur BetaSeries
     * @type {PersonMedias}
     */
    last;
    /**
     * Tableau des séries dans lesquelles à joué l'acteur
     * @type {Array<PersonMedias>}
     */
    shows;
    /**
     * Tableau des films dans lesquels a joué l'acteur
     * @type {Array<PersonMedias>}
     */
    movies;
    __initial = true;
    __changes = {};
    __props = [];
    __decorators = {
        "fill": new FillDecorator(this)
    };
    __elt;
    constructor(data) {
        return this.fill(data)._initRender();
    }
    _initRender() {
        if (!this.elt)
            return this;
    }
    get elt() {
        return this.__elt;
    }
    set elt(elt) {
        this.__elt = elt;
    }
    /**
     * Remplit l'objet avec les données fournit en paramètre
     * @param   {Obj} data - Les données provenant de l'API
     * @returns {Person}
     */
    fill(data) {
        try {
            return this.__decorators.fill.fill.call(this, data);
        }
        catch (err) {
            console.error(err);
        }
    }
    /**
     * Met à jour le rendu HTML des propriétés de l'objet,
     * si un sélecteur CSS exite pour la propriété fournit en paramètre\
     * **Méthode appelée automatiquement par le setter de la propriété**
     * @see Show.selectorsCSS
     * @param   {string} propKey - La propriété de l'objet à mettre à jour
     * @returns {void}
     */
    updatePropRender(propKey) {
        try {
            this.__decorators.fill.updatePropRender.call(this, propKey);
        }
        catch (err) {
            console.error(err);
        }
    }
    /**
     * Retourne l'objet sous forme d'objet simple, sans référence circulaire,
     * pour la méthode JSON.stringify
     * @returns {object}
     */
    toJSON() {
        const obj = {};
        for (const key of this.__props) {
            obj[key] = this[key];
        }
        return obj;
    }
}

var OrderComments;
(function (OrderComments) {
    OrderComments["DESC"] = "desc";
    OrderComments["ASC"] = "asc";
})(OrderComments = OrderComments || (OrderComments = {}));
var MediaStatusComments;
(function (MediaStatusComments) {
    MediaStatusComments["OPEN"] = "open";
    MediaStatusComments["CLOSED"] = "close";
})(MediaStatusComments = MediaStatusComments || (MediaStatusComments = {}));
class CommentsBS extends Base {
    /*************************************************/
    /*                  STATIC                       */
    /*************************************************/
    static logger = new UsBetaSeries.setDebug('Comments');
    static debug = CommentsBS.logger.debug.bind(CommentsBS.logger);
    /**
     * Types d'évenements gérés par cette classe
     * @type {Array}
     */
    static EventTypes = [
        EventTypes.UPDATE,
        EventTypes.SAVE,
        EventTypes.ADD,
        EventTypes.ADDED,
        EventTypes.DELETE,
        EventTypes.SHOW
    ];
    /**
     * Envoie une réponse de ce commentaire à l'API
     * @param   {Base} media - Le média correspondant à la collection
     * @param   {string} text - Le texte de la réponse
     * @returns {Promise<void | CommentBS>}
     */
    static sendComment(media, text) {
        const params = {
            type: media.mediaType.singular,
            id: media.id,
            text: text
        };
        return UsBetaSeries.callApi(HTTP_VERBS.POST, 'comments', 'comment', params)
            .then((data) => {
            const comment = new CommentBS(data.comment, media.comments);
            media.comments.addComment(comment);
            media.comments.is_subscribed = true;
            return comment;
        })
            .catch(err => {
            UsBetaSeries.notification('Commentaire', "Erreur durant l'ajout d'un commentaire");
            console.error(err);
        });
    }
    /*************************************************/
    /*                  PROPERTIES                   */
    /*************************************************/
    /**
     * Tableau des commentaires
     * @type {CommentBS[]}
     */
    comments;
    /**
     * Nombre total de commentaires du média
     * @type {number}
     */
    nbComments;
    /**
     * Indique si le membre à souscrit aux alertes commentaires du média
     * @type {boolean}
     */
    is_subscribed;
    /**
     * Indique si les commentaires sont ouverts ou fermés
     * @type {string}
     */
    status;
    /**
     * Le média auquel sont associés les commentaires
     * @type {Base}
     * @private
     */
    _parent;
    /**
     * Tableau des events déclarés par la fonction loadEvents
     * @type {Array<CustomEvent>}
     * @private
     */
    _events;
    /**
     * Ordre de tri des commentaires et des réponses
     * @type {OrderComments}
     */
    _order;
    /**
     * Indique si la collection est affiché ou non
     * @type {boolean}
     */
    _display = false;
    /*************************************************/
    /*                  METHODS                      */
    /*************************************************/
    constructor(nbComments, media) {
        super({});
        this.comments = [];
        this._parent = media;
        this.is_subscribed = false;
        this.status = MediaStatusComments.OPEN;
        this.nbComments = nbComments;
        this._order = OrderComments.DESC;
        return this;
    }
    /**
     * Initialise la collection de commentaires
     */
    init() {
        const self = this;
        const addCommentId = function () {
            const $vignettes = jQuery('#comments .slides_flex .slide_flex .slide__comment');
            let vignette;
            for (let v = 0; v < $vignettes.length; v++) {
                vignette = jQuery($vignettes.get(v));
                vignette.attr('data-comment-id', self.comments[v].id);
            }
        };
        if (this.comments.length <= 0 && this.nbComments > 0) {
            const $vignettes = jQuery('#comments .slides_flex .slide_flex');
            this.fetchComments($vignettes.length)
                .then(addCommentId);
        }
        else {
            addCommentId();
        }
    }
    /**
     * Retourne l'objet sous forme d'objet simple, sans référence circulaire,
     * pour la méthode JSON.stringify
     * @returns {object}
     */
    toJSON() {
        const obj = {};
        const keys = Reflect.ownKeys(this)
            .filter((key) => !key.startsWith('_'));
        for (const key of keys) {
            obj[key] = this[key];
        }
        return obj;
    }
    get parent() {
        return this._parent;
    }
    set parent(media) {
        if (!(media instanceof MediaBase)) {
            throw new TypeError('Parameter "media" in setter parent must be an instance of MediaBase');
        }
        this._parent = media;
    }
    /**
     * Retourne la taille de la collection
     * @readonly
     */
    get length() {
        return this.comments.length;
    }
    /**
     * Retourne le média auxquels sont associés les commentaires
     * @readonly
     */
    get media() {
        return this._parent;
    }
    /**
     * Retourne l'ordre de tri des commentaires
     * @returns {OrderComments}
     */
    get order() {
        return this._order;
    }
    /**
     * Définit l'ordre de tri des commentaires
     * @param {OrderComments} o - Ordre de tri
     */
    set order(o) {
        this._order = o;
    }
    /**
     * Récupère les commentaires du média sur l'API
     * @param   {number} [nbpp=50] - Le nombre de commentaires à récupérer
     * @param   {number} [since=0] - L'identifiant du dernier commentaire reçu
     * @param   {OrderComments} [order='desc'] - Ordre de tri des commentaires
     * @returns {Promise<CommentsBS>}
     */
    fetchComments(nbpp = 50, since = 0, order = OrderComments.DESC) {
        if (order !== this._order) {
            this.order = order;
        }
        const self = this;
        return new Promise((resolve, reject) => {
            const params = {
                type: self._parent.mediaType.singular,
                id: self._parent.id,
                nbpp: nbpp,
                replies: 0,
                order: self.order
            };
            if (since > 0) {
                params.since_id = since;
            }
            UsBetaSeries.callApi(HTTP_VERBS.GET, 'comments', 'comments', params)
                .then((data) => {
                if (data.comments !== undefined) {
                    if (since <= 0) {
                        self.comments = [];
                    }
                    for (let c = 0; c < data.comments.length; c++) {
                        self.comments.push(new CommentBS(data.comments[c], self));
                        // self.addComment(data.comments[c]);
                    }
                }
                self.nbComments = parseInt(data.total, 10);
                self.is_subscribed = !!data.is_subscribed;
                self.status = data.status;
                resolve(self);
            })
                .catch(err => {
                console.warn('fetchComments', err);
                UsBetaSeries.notification('Récupération des commentaires', "Une erreur est apparue durant la récupération des commentaires");
                reject(err);
            });
        });
    }
    /**
     * Ajoute un commentaire à la collection
     * /!\ (Ne l'ajoute pas sur l'API) /!\
     * @param   {Obj} data - Les données du commentaire provenant de l'API
     * @returns {CommentsBS}
     */
    addComment(data) {
        const method = this.order == OrderComments.DESC ? Array.prototype.unshift : Array.prototype.push;
        CommentsBS.debug('addComment order: %s - method: %s', this.order, method.name);
        if (data instanceof CommentBS) {
            method.call(this.comments, data);
        }
        else {
            method.call(this.comments, new CommentBS(data, this));
        }
        this.nbComments++;
        this.media.nbComments++;
        this._callListeners(EventTypes.ADD);
        return this;
    }
    /**
     * Retire un commentaire de la collection
     * /!\ (Ne le supprime pas sur l'API) /!\
     * @param   {number} cmtId - L'identifiant du commentaire à retirer
     * @returns {CommentsBS}
     */
    removeComment(cmtId) {
        for (let c = 0; c < this.comments.length; c++) {
            if (this.comments[c].id === cmtId) {
                this.comments.splice(c, 1);
                // retire le commentaire de la liste des commentaires
                this.removeFromPage(cmtId);
                this.nbComments--;
                this.media.nbComments--;
                this._callListeners('delete');
                break;
            }
        }
        return this;
    }
    /**
     * Indique si il s'agit du premier commentaire
     * @param cmtId - L'identifiant du commentaire
     * @returns {boolean}
     */
    isFirst(cmtId) {
        return this.comments[0].id === cmtId;
    }
    /**
     * Indique si il s'agit du dernier commentaire
     * @param cmtId - L'identifiant du commentaire
     * @returns {boolean}
     */
    isLast(cmtId) {
        return this.comments[this.comments.length - 1].id === cmtId;
    }
    /**
     * Indique si on peut écrire des commentaires sur ce média
     * @returns {boolean}
     */
    isOpen() {
        return this.status === MediaStatusComments.OPEN;
    }
    /**
     * Retourne le commentaire correspondant à l'ID fournit en paramètre
     * @param   {number} cId - L'identifiant du commentaire
     * @returns {CommentBS|void}
     */
    getComment(cId) {
        for (let c = 0; c < this.comments.length; c++) {
            if (this.comments[c].id === cId) {
                return this.comments[c];
            }
        }
        return null;
    }
    /**
     * Retourne le commentaire précédent celui fournit en paramètre
     * @param   {number} cId - L'identifiant du commentaire
     * @returns {CommentBS|null}
     */
    getPrevComment(cId) {
        for (let c = 0; c < this.comments.length; c++) {
            if (this.comments[c].id === cId && c > 0) {
                return this.comments[c - 1];
            }
        }
        return null;
    }
    /**
     * Retourne le commentaire suivant celui fournit en paramètre
     * @param   {number} cId - L'identifiant du commentaire
     * @returns {CommentBS|null}
     */
    getNextComment(cId) {
        const len = this.comments.length;
        for (let c = 0; c < this.comments.length; c++) {
            // TODO: Vérifier que tous les commentaires ont été récupérer
            if (this.comments[c].id === cId && c < len - 1) {
                return this.comments[c + 1];
            }
        }
        return null;
    }
    /**
     * Retourne les réponses d'un commentaire
     * @param   {number} commentId - Identifiant du commentaire original
     * @param   {OrderComments} [order='desc'] - Ordre de tri des réponses
     * @returns {Promise<Array<CommentBS>>} Tableau des réponses
     */
    async fetchReplies(commentId, order = OrderComments.ASC) {
        const data = await UsBetaSeries.callApi(HTTP_VERBS.GET, 'comments', 'replies', { id: commentId, order });
        const replies = [];
        if (data.comments) {
            for (let c = 0; c < data.comments.length; c++) {
                replies.push(new CommentBS(data.comments[c], this));
            }
        }
        return replies;
    }
    /**
     * Modifie le nombre de votes et le vote du membre pour un commentaire
     * @param   {number} commentId - Identifiant du commentaire
     * @param   {number} thumbs - Nombre de votes
     * @param   {number} thumbed - Le vote du membre connecté
     * @returns {boolean}
     */
    changeThumbs(commentId, thumbs, thumbed) {
        for (let c = 0; c < this.comments.length; c++) {
            if (this.comments[c].id === commentId) {
                this.comments[c].thumbs = thumbs;
                this.comments[c].thumbed = thumbed;
                return true;
            }
        }
        return false;
    }
    /**
     * Retourne la template pour l'affichage de l'ensemble des commentaires
     * @param   {number} nbpp - Le nombre de commentaires à récupérer
     * @returns {Promise<string>} La template
     */
    async getTemplate(nbpp) {
        const self = this;
        return new Promise((resolve, reject) => {
            let promise = Promise.resolve(self);
            CommentsBS.debug('Base ', { length: self.comments.length, nbComments: self.nbComments });
            if (self.comments.length <= 0 && self.nbComments > 0) {
                CommentsBS.debug('Base fetchComments call');
                promise = self.fetchComments(nbpp);
            }
            promise.then(async () => {
                let comment, template = `
                        <div data-media-type="${self._parent.mediaType.singular}"
                            data-media-id="${self._parent.id}"
                            class="displayFlex flexDirectionColumn"
                            style="margin-top: 2px; min-height: 0">`;
                if (UsBetaSeries.userIdentified()) {
                    template += `
                    <button type="button" class="btn-reset btnSubscribe" style="position: absolute; top: 3px; right: 31px; padding: 8px;">
                        <span class="svgContainer">
                            <svg></svg>
                        </span>
                    </button>`;
                }
                template += '<div class="comments overflowYScroll">';
                for (let c = 0; c < self.comments.length; c++) {
                    comment = self.comments[c];
                    template += CommentBS.getTemplateComment(comment);
                    // Si le commentaires à des réponses et qu'elles ne sont pas chargées
                    if (comment.nbReplies > 0 && comment.replies.length <= 0) {
                        // On récupère les réponses
                        CommentsBS.debug('Comments render getTemplate fetchReplies');
                        await comment.fetchReplies();
                        // On ajoute un boutton pour afficher/masquer les réponses
                    }
                    for (let r = 0; r < comment.replies.length; r++) {
                        template += CommentBS.getTemplateComment(comment.replies[r]);
                    }
                }
                // On ajoute le bouton pour voir plus de commentaires
                if (self.comments.length < self.nbComments) {
                    template += `
                        <button type="button" class="btn-reset btn-greyBorder moreComments" style="margin-top: 10px; width: 100%;">
                            ${UsBetaSeries.trans("timeline.comments.display_more")}
                            <i class="fa-solid fa-cog fa-spin fa-2x" style="display:none;margin-left:15px;vertical-align:middle;"></i>
                            <span class="sr-only">Loading...</span>
                        </button>`;
                }
                template += '</div>'; // Close div.comments
                if (self.isOpen() && UsBetaSeries.userIdentified()) {
                    template += CommentBS.getTemplateWriting();
                }
                resolve(template + '</div>');
            })
                .catch(err => {
                reject(err);
            });
        });
    }
    /**
     * Retourne un tableau contenant les logins des commentaires
     * @returns {Array<string>}
     */
    getLogins() {
        const users = [];
        for (let c = 0; c < this.comments.length; c++) {
            if (!users.includes(this.comments[c].login)) {
                users.push(this.comments[c].login);
            }
        }
        return users;
    }
    /**
     * Met à jour le nombre de commentaires sur la page
     */
    updateCounter() {
        const $counter = jQuery('#comments .blockTitle');
        $counter.text($counter.text().replace(/\d+/, this.nbComments.toString()));
    }
    /**
     * Ajoute les évènements sur les commentaires lors du rendu
     * @param   {JQuery<HTMLElement>} $container - Le conteneur des éléments d'affichage
     * @param   {number} nbpp - Le nombre de commentaires à récupérer sur l'API
     * @param   {Obj} funcPopup - Objet des fonctions d'affichage/ de masquage de la popup
     * @returns {void}
     */
    loadEvents($container, nbpp, funcPopup) {
        // Tableau servant à contenir les events créer pour pouvoir les supprimer plus tard
        this._events = [];
        const self = this;
        const $popup = jQuery('#popin-dialog');
        const $btnClose = jQuery("#popin-showClose");
        /**
         * Retourne l'objet CommentBS associé au DOMElement fournit en paramètre
         * @param   {JQuery<HTMLElement>} $comment - Le DOMElement contenant le commentaire
         * @returns {Promise<CommentBS>}
         */
        const getObjComment = async function ($comment) {
            const commentId = parseInt($comment.data('commentId'), 10);
            let comment;
            // Si il s'agit d'une réponse, il nous faut le commentaire parent
            if ($comment.hasClass('reply')) {
                let $parent = $comment.prev();
                while ($parent.hasClass('reply')) {
                    $parent = $parent.prev();
                }
                const parentId = parseInt($parent.data('commentId'), 10);
                if (commentId == parentId) {
                    comment = self.getComment(commentId);
                }
                else {
                    const cmtParent = self.getComment(parentId);
                    comment = await cmtParent.getReply(commentId);
                }
            }
            else {
                comment = self.getComment(commentId);
            }
            return comment;
        };
        // On ajoute les templates HTML du commentaire,
        // des réponses et du formulaire de d'écriture
        // On active le bouton de fermeture de la popup
        $btnClose.on('click', () => {
            funcPopup.hidePopup();
            $popup.removeAttr('data-popin-type');
        });
        this._events.push({ elt: $btnClose, event: 'click' });
        const $btnAllReplies = $container.find('.toggleAllReplies');
        $btnAllReplies.on('click', (e) => {
            const $btn = jQuery(e.currentTarget);
            const stateReplies = $btn.attr('data-toggle'); // 0: Etat masqué, 1: Etat affiché
            const $btnReplies = $container.find(`.toggleReplies[data-toggle="${stateReplies}"]`);
            if (stateReplies == '1') {
                $btnReplies.trigger('click');
                $btn.attr('data-toggle', '0');
                $btn.text('Afficher toutes les réponses');
            }
            else {
                $btnReplies.trigger('click');
                $btn.attr('data-toggle', '1');
                $btn.text('Masquer toutes les réponses');
            }
        });
        this._events.push({ elt: $btnAllReplies, event: 'click' });
        const $btnSubscribe = $container.find('.btnSubscribe');
        /**
         * Met à jour l'affichage du bouton de souscription
         * des alertes de nouveaux commentaires
         * @param   {JQuery<HTMLElement>} $btn - L'élément jQuery correspondant au bouton de souscription
         * @returns {void}
         */
        function displaySubscription($btn) {
            if (!self.is_subscribed) {
                $btn.removeClass('active');
                $btn.attr('title', "Recevoir les commentaires par e-mail");
                $btn.find('svg').replaceWith(`
                    <svg fill="${UsBetaSeries.theme == 'dark' ? 'rgba(255, 255, 255, .5)' : '#333'}" width="14" height="16" style="position: relative; top: 1px; left: -1px;">
                        <path fill-rule="nonzero" d="M13.176 13.284L3.162 2.987 1.046.812 0 1.854l2.306 2.298v.008c-.428.812-.659 1.772-.659 2.806v4.103L0 12.709v.821h11.307l1.647 1.641L14 14.13l-.824-.845zM6.588 16c.914 0 1.647-.73 1.647-1.641H4.941c0 .91.733 1.641 1.647 1.641zm4.941-6.006v-3.02c0-2.527-1.35-4.627-3.705-5.185V1.23C7.824.55 7.272 0 6.588 0c-.683 0-1.235.55-1.235 1.23v.559c-.124.024-.239.065-.346.098a2.994 2.994 0 0 0-.247.09h-.008c-.008 0-.008 0-.017.009-.19.073-.379.164-.56.254 0 0-.008 0-.008.008l7.362 7.746z"></path>
                    </svg>
                `);
            }
            else if (self.is_subscribed) {
                $btn.addClass('active');
                $btn.attr('title', "Ne plus recevoir les commentaires par e-mail");
                $btn.find('svg').replaceWith(`
                    <svg width="20" height="22" viewBox="0 0 20 22" style="width: 17px;">
                        <g transform="translate(-4)" fill="none">
                            <path d="M0 0h24v24h-24z"></path>
                            <path fill="${UsBetaSeries.theme == 'dark' ? 'rgba(255, 255, 255, .5)' : '#333'}" d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32v-.68c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68c-2.87.68-4.5 3.24-4.5 6.32v5l-2 2v1h16v-1l-2-2z"></path>
                        </g>
                    </svg>
                `);
            }
        }
        $btnSubscribe.on('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            if (!UsBetaSeries.userIdentified()) {
                faceboxDisplay('inscription', {}, () => { });
                return;
            }
            const $btn = $(e.currentTarget);
            const params = { type: self._parent.mediaType.singular, id: self._parent.id };
            if ($btn.hasClass('active')) {
                UsBetaSeries.callApi(HTTP_VERBS.DELETE, 'comments', 'subscription', params)
                    .then(() => {
                    self.is_subscribed = false;
                    displaySubscription($btn);
                });
            }
            else {
                UsBetaSeries.callApi(HTTP_VERBS.POST, 'comments', 'subscription', params)
                    .then(() => {
                    self.is_subscribed = true;
                    displaySubscription($btn);
                });
            }
        });
        displaySubscription($btnSubscribe);
        this._events.push({ elt: $btnSubscribe, event: 'click' });
        // On active le lien pour afficher le spoiler
        const $btnSpoiler = $container.find('.view-spoiler');
        if ($btnSpoiler.length > 0) {
            $btnSpoiler.on('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                const $btn = jQuery(e.currentTarget);
                const $spoiler = $btn.next('.comment-text').find('.spoiler');
                if ($spoiler.is(':visible')) {
                    $spoiler.fadeOut('fast');
                    $btn.text('Voir le spoiler');
                }
                else {
                    $spoiler.fadeIn('fast');
                    $btn.text('Cacher le spoiler');
                }
            });
        }
        this._events.push({ elt: $btnSpoiler, event: 'click' });
        /**
         * Ajoutons les events pour:
         *  - btnUpVote: Voter pour ce commentaire
         *  - btnDownVote: Voter contre ce commentaire
         */
        const $btnThumb = $container.find('.comments .comment .btnThumb');
        $btnThumb.on('click', async (e) => {
            e.stopPropagation();
            e.preventDefault();
            if (!UsBetaSeries.userIdentified()) {
                faceboxDisplay('inscription', {}, () => { });
                return;
            }
            const $btn = jQuery(e.currentTarget);
            const $comment = $btn.parents('.comment');
            const commentId = parseInt($comment.data('commentId'), 10);
            let comment;
            // Si il s'agit d'une réponse, il nous faut le commentaire parent
            if ($comment.hasClass('reply')) {
                let $parent = $comment.prev();
                while ($parent.hasClass('reply')) {
                    $parent = $parent.prev();
                }
                const parentId = parseInt($parent.data('commentId'), 10);
                if (commentId == parentId) {
                    comment = this.getComment(commentId);
                }
                else {
                    const cmtParent = this.getComment(parentId);
                    comment = await cmtParent.getReply(commentId);
                }
            }
            else {
                comment = this.getComment(commentId);
            }
            let verb = HTTP_VERBS.POST;
            const vote = $btn.hasClass('btnUpVote') ? 1 : -1;
            let params = { id: commentId, type: vote, switch: false };
            // On a déjà voté
            if (comment.thumbed == vote) {
                verb = HTTP_VERBS.DELETE;
                params = { id: commentId };
            }
            else if (comment.thumbed != 0) {
                console.warn("Le vote est impossible. Annuler votre vote et recommencer");
                return;
            }
            UsBetaSeries.callApi(verb, 'comments', 'thumb', params)
                .then((data) => {
                comment.thumbs = parseInt(data.comment.thumbs, 10);
                comment.thumbed = data.comment.thumbed ? parseInt(data.comment.thumbed, 10) : 0;
                comment.updateRenderThumbs(vote);
            })
                .catch(err => {
                const msg = err.text !== undefined ? err.text : err;
                UsBetaSeries.notification('Thumb commentaire', "Une erreur est apparue durant le vote: " + msg);
            });
        });
        this._events.push({ elt: $btnThumb, event: 'click' });
        /**
         * On affiche/masque les options du commentaire
         */
        const $btnOptions = $container.find('.btnToggleOptions');
        $btnOptions.on('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            jQuery(e.currentTarget).parents('.actionsCmt').first()
                .find('.options-comment').each((_index, elt) => {
                const $elt = jQuery(elt);
                if ($elt.is(':visible')) {
                    $elt.hide();
                }
                else {
                    $elt.show();
                }
            });
        });
        this._events.push({ elt: $btnOptions, event: 'click' });
        /**
         * On envoie la réponse à ce commentaire à l'API
         */
        const $btnSend = $container.find('.sendComment');
        $btnSend.on('click', async (e) => {
            e.stopPropagation();
            e.preventDefault();
            if (!UsBetaSeries.userIdentified()) {
                faceboxDisplay('inscription', {}, () => { });
                return;
            }
            const getNodeCmt = function (cmtId) {
                return jQuery(e.currentTarget).parents('.writing').prev('.comments').find(`.comment[data-comment-id="${cmtId.toString()}"]`);
            };
            const $textarea = $(e.currentTarget).siblings('textarea');
            if ($textarea.val().length > 0) {
                const action = $textarea.data('action');
                const msg = $textarea.val();
                let comment;
                let promise;
                if ($textarea.data('replyTo')) {
                    const cmtId = parseInt($textarea.data('replyTo'), 10);
                    comment = self.getComment(cmtId);
                    const $comment = getNodeCmt(cmtId);
                    promise = comment.sendReply($textarea.val()).then((reply) => {
                        if (reply instanceof CommentBS) {
                            $textarea.val('');
                            $textarea.siblings('button').attr('disabled', 'true');
                            $textarea.removeAttr('data-reply-to');
                            const template = CommentBS.getTemplateComment(reply);
                            if ($comment.next('.comment').hasClass('reply')) {
                                let $next = $comment.next('.comment');
                                let $prev;
                                while ($next.hasClass('reply')) {
                                    $prev = $next;
                                    $next = $next.next('.comment');
                                }
                                $prev.after(template);
                            }
                            else {
                                $comment.after(template);
                            }
                        }
                    });
                }
                else if (action && action === 'edit') {
                    const cmtId = parseInt($textarea.data('commentId'), 10);
                    let $comment = getNodeCmt(cmtId);
                    const comment = await getObjComment($comment);
                    promise = comment.edit(msg).then((comment) => {
                        $comment.find('.comment-text').text(comment.text);
                        $comment = jQuery(`#comments .slide_flex .slide__comment[data-comment-id="${cmtId}"]`);
                        $comment.find('p').text(comment.text);
                        $textarea.removeAttr('data-action');
                        $textarea.removeAttr('data-comment-id');
                        $textarea.val('');
                        $textarea.siblings('button').attr('disabled', 'true');
                    });
                }
                else {
                    promise = CommentsBS.sendComment(self._parent, $textarea.val())
                        .then((comment) => {
                        if (comment) {
                            $textarea.val('');
                            $textarea.siblings('button').attr('disabled', 'true');
                            const $comments = $textarea.parents('.writing').prev('.comments');
                            if (this.order === OrderComments.DESC) {
                                $comments.prepend(CommentBS.getTemplateComment(comment));
                            }
                            else {
                                $comments.append(CommentBS.getTemplateComment(comment));
                            }
                            $comments.find(`.comment[data-comment-id="${comment.id}"]`).get(0).scrollIntoView();
                            self.addToPage(comment.id);
                        }
                    });
                }
                promise.then(() => {
                    self.cleanEvents(() => {
                        self.loadEvents($container, nbpp, funcPopup);
                    });
                });
            }
        });
        this._events.push({ elt: $btnSend, event: 'click' });
        /**
         * On active / desactive le bouton d'envoi du commentaire
         * en fonction du contenu du textarea
         */
        const $textarea = $container.find('textarea');
        $textarea.on('keypress', (e) => {
            const $textarea = $(e.currentTarget);
            if ($textarea.val().length > 0) {
                $textarea.siblings('button').removeAttr('disabled');
            }
            else {
                $textarea.siblings('button').attr('disabled', 'true');
            }
        });
        this._events.push({ elt: $textarea, event: 'keypress' });
        /**
         * On ajoute les balises SPOILER au message dans le textarea
         */
        const $baliseSpoiler = $container.find('.baliseSpoiler');
        /**
         * Permet d'englober le texte du commentaire en écriture
         * avec les balises [spoiler]...[/spoiler]
         */
        $baliseSpoiler.on('click', () => {
            const $textarea = $popup.find('textarea');
            if (/\[spoiler\]/.test($textarea.val())) {
                return;
            }
            // TODO: Gérer la balise spoiler sur une zone de texte sélectionnée
            const text = '[spoiler]' + $textarea.val() + '[/spoiler]';
            $textarea.val(text);
        });
        this._events.push({ elt: $baliseSpoiler, event: 'click' });
        const $btnReplies = $container.find('.comments .toggleReplies');
        /**
         * Affiche/masque les réponses d'un commentaire
         */
        $btnReplies.on('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            const $btn = jQuery(e.currentTarget);
            const state = $btn.attr('data-toggle'); // 0: Etat masqué, 1: Etat affiché
            const $comment = $btn.parents('.comment');
            const inner = $comment.data('commentInner');
            const $replies = $comment.parents('.comments').find(`.comment[data-comment-reply="${inner}"]`);
            if (state == '0') {
                // On affiche
                $replies.fadeIn('fast');
                $btn.find('.btnText').text(UsBetaSeries.trans("comment.hide_answers"));
                $btn.find('svg').attr('style', 'transition: transform 200ms ease 0s; transform: rotate(180deg);');
                $btn.attr('data-toggle', '1');
            }
            else {
                // On masque
                $replies.fadeOut('fast');
                $btn.find('.btnText').text(UsBetaSeries.trans("comment.button.reply", { "%count%": $replies.length.toString() }, $replies.length));
                $btn.find('svg').attr('style', 'transition: transform 200ms ease 0s;');
                $btn.attr('data-toggle', '0');
            }
        });
        this._events.push({ elt: $btnReplies, event: 'click' });
        const $btnResponse = $container.find('.btnResponse');
        /**
         * Permet de créer une réponse à un commentaire
         */
        $btnResponse.on('click', async (e) => {
            e.stopPropagation();
            e.preventDefault();
            if (!UsBetaSeries.userIdentified()) {
                faceboxDisplay('inscription', {}, () => { });
                return;
            }
            const $btn = $(e.currentTarget);
            const $comment = $btn.parents('.comment');
            const comment = await getObjComment($comment);
            $container.find('textarea')
                .val('@' + comment.login)
                .attr('data-reply-to', comment.id);
        });
        this._events.push({ elt: $btnResponse, event: 'click' });
        const $btnMore = $container.find('.moreComments');
        /**
         * Permet d'afficher plus de commentaires
         */
        $btnMore.on('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            const $btn = jQuery(e.currentTarget);
            if (self.comments.length >= self.nbComments) {
                $btn.hide();
                return;
            }
            const $loader = $btn.find('.fa-spin');
            $loader.show();
            const lastCmtId = self.comments[self.comments.length - 1].id;
            const oldLastCmtIndex = self.comments.length - 1;
            self.fetchComments(nbpp, lastCmtId).then(async () => {
                let template = '', comment;
                const firstCmtId = self.comments[oldLastCmtIndex + 1].id;
                for (let c = oldLastCmtIndex + 1; c < self.comments.length; c++) {
                    comment = self.comments[c];
                    template += CommentBS.getTemplateComment(comment);
                    // Si le commentaires à des réponses et qu'elles ne sont pas chargées
                    if (comment.nbReplies > 0 && comment.replies.length <= 0) {
                        // On récupère les réponses
                        comment.replies = await self.fetchReplies(comment.id);
                        // On ajoute un boutton pour afficher/masquer les réponses
                    }
                    for (let r = 0; r < comment.replies.length; r++) {
                        template += CommentBS.getTemplateComment(comment.replies[r]);
                    }
                }
                $btn.before(template);
                jQuery(`.comment[data-comment-id="${firstCmtId.toString()}"]`).get(0).scrollIntoView();
                self.cleanEvents(() => {
                    self.loadEvents($container, nbpp, funcPopup);
                });
                if (self.comments.length >= self.nbComments) {
                    $btn.hide();
                }
            }).finally(() => {
                $loader.hide();
            });
        });
        this._events.push({ elt: $btnMore, event: 'click' });
        const $btnEdit = $container.find('.btnEditComment');
        $btnEdit.on('click', async (e) => {
            e.stopPropagation();
            e.preventDefault();
            const $comment = jQuery(e.currentTarget).parents('.comment');
            const commentId = parseInt($comment.data('commentId'), 10);
            const comment = await getObjComment($comment);
            $textarea.val(comment.text);
            $textarea.attr('data-action', 'edit');
            $textarea.attr('data-comment-id', commentId);
        });
        this._events.push({ elt: $btnEdit, event: 'click' });
        const $btnDelete = $container.find('.btnDeleteComment');
        $btnDelete.on('click', async (e) => {
            e.stopPropagation();
            e.preventDefault();
            const $comment = jQuery(e.currentTarget).parents('.comment');
            const $options = jQuery(e.currentTarget).parents('.options-options');
            const template = `
                <div class="options-delete">
                    <span class="mainTime">Supprimer mon commentaire :</span>
                    <button type="button" class="btn-reset fontWeight700 btnYes" style="vertical-align: 0px; padding-left: 10px; padding-right: 10px; color: rgb(208, 2, 27);">Oui</button>
                    <button type="button" class="btn-reset mainLink btnNo" style="vertical-align: 0px;">Non</button>
                </div>
            `;
            $options.hide().after(template);
            const $btnYes = $comment.find('.options-delete .btnYes');
            const $btnNo = $comment.find('.options-delete .btnNo');
            const comment = await getObjComment($comment);
            $btnYes.on('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                comment.delete();
                let $next = $comment.next('.comment');
                let $prev;
                while ($next.hasClass('reply')) {
                    $prev = $next;
                    $next = $next.next('.comment');
                    $prev.remove();
                }
                $comment.remove();
                self.updateCounter();
            });
            $btnNo.on('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                $comment.find('.options-delete').remove();
                $options.show();
                $btnYes.off('click');
                $btnNo.off('click');
            });
        });
        this._events.push({ elt: $btnDelete, event: 'click' });
        this._callListeners(EventTypes.SHOW);
    }
    /**
     * Nettoie les events créer par la fonction loadEvents
     * @param   {Function} onComplete - Fonction de callback
     * @returns {void}
     */
    cleanEvents(onComplete = UsBetaSeries.noop) {
        if (this._events && this._events.length > 0) {
            let data;
            for (let e = 0; e < this._events.length; e++) {
                data = this._events[e];
                if (data.elt.length > 0)
                    data.elt.off(data.event);
            }
        }
        this._events = [];
        onComplete();
    }
    /**
     * Gère l'affichage de l'ensemble des commentaires
     * @returns {void}
     */
    render() {
        CommentsBS.debug('CommentsBS render');
        // La popup et ses éléments
        const self = this, $popup = jQuery('#popin-dialog'), $contentHtmlElement = $popup.find(".popin-content-html"), $contentReact = $popup.find('.popin-content-reactmodule'), $closeButtons = $popup.find("#popin-showClose"), hidePopup = () => {
            document.body.style.overflow = "visible";
            document.body.style.paddingRight = "";
            $popup.attr('aria-hidden', 'true');
            $popup.find("#popupalertyes").show();
            $popup.find("#popupalertno").show();
            $contentHtmlElement.hide();
            $contentReact.empty();
            self.cleanEvents();
        }, showPopup = () => {
            document.body.style.overflow = "hidden";
            document.body.style.paddingRight = getScrollbarWidth() + "px";
            $popup.find("#popupalertyes").hide();
            $popup.find("#popupalertno").hide();
            $contentHtmlElement.hide();
            $contentReact.show();
            $closeButtons.show();
            $popup.attr('aria-hidden', 'false');
        };
        // On ajoute le loader dans la popup et on l'affiche
        $contentReact.empty().append(`<div class="title" id="dialog-title" tabindex="0">${UsBetaSeries.trans("blog.title.comments")}</div>`);
        const $title = $contentReact.find('.title');
        $title.append(`<button type="button" class="btn-primary toggleAllReplies" data-toggle="1" style="border-radius:4px;margin-left:10px;">Cacher toutes les réponses</button>`);
        let templateLoader = `
            <div class="loaderCmt">
                <svg class="sr-only">
                    <defs>
                        <clipPath id="placeholder">
                            <path d="M50 25h160v8H50v-8zm0-18h420v8H50V7zM20 40C8.954 40 0 31.046 0 20S8.954 0 20 0s20 8.954 20 20-8.954 20-20 20z"></path>
                        </clipPath>
                    </defs>
                </svg>
        `;
        for (let l = 0; l < 4; l++) {
            templateLoader += `
                <div class="er_ex null"><div class="ComponentPlaceholder er_et " style="height: 40px;"></div></div>`;
        }
        $contentReact.append(templateLoader + '</div>');
        showPopup();
        const nbCmts = 20; // Nombre de commentaires à récupérer sur l'API
        self.getTemplate(nbCmts).then((template) => {
            // On définit le type d'affichage de la popup
            $popup.attr('data-popin-type', 'comments');
            // On masque le loader pour ajouter les données à afficher
            $contentReact.fadeOut('fast', () => {
                $contentReact.find('.loaderCmt').remove();
                $contentReact.append(template);
                $contentReact.fadeIn();
                self.cleanEvents();
                self.loadEvents($contentReact, nbCmts, { hidePopup, showPopup });
            });
        });
    }
    /**
     * Ajoute un commentaire dans la liste des commentaires de la page
     * @param {number} cmtId - L'identifiant du commentaire
     */
    addToPage(cmtId) {
        const comment = this.getComment(cmtId);
        const headMsg = comment.text.substring(0, 210);
        const isSpoiler = comment.isSpoiler();
        let hideMsg = '';
        if (comment.text.length > 210) {
            hideMsg = '<span class="u-colorWhiteOpacity05 u-show-fulltext positionRelative zIndex1"></span><span class="sr-only">' + comment.text.substring(210) + '</span>';
        }
        let message = `<p>${headMsg} ${hideMsg}</p>`;
        if (isSpoiler) {
            message = `<button class="btn-reset spoilerWrapper js-display-spoiler">
                <span class="spoiler__inner">
                    <span class="fake-p">
                        Ce commentaire contient un spoiler.
                    </span>
                    <span class="btn-semiTransparent">
                        ${UsBetaSeries.trans("show.comment.show_spoiler")}
                    </span>
                </span>
            </button>
            <p>${headMsg}</p>`;
        }
        const avatar = comment.avatar || 'https://img.betaseries.com/NkUiybcFbxbsT_EnzkGza980XP0=/42x42/smart/https%3A%2F%2Fwww.betaseries.com%2Fimages%2Fsite%2Favatar-default.png';
        const template = `
            <div class="slide_flex">
                <div class="slide__comment positionRelative u-insideBorderOpacity u-insideBorderOpacity--01" data-comment-id="${comment.id}">
                    ${message}
                    <button type="button" class="btn-reset js-popup-comments zIndex10" data-comment-id="${comment.id}"></button>
                </div>
                <div class="slide__author">
                    <div class="media">
                        <span class="media-left avatar">
                            <a href="https://www.betaseries.com/membre/${comment.login}">
                                <img class="u-opacityBackground" src="${avatar}" width="42" height="42" alt="avatar de ${comment.login}" />
                            </a>
                        </span>
                        <div class="media-body">
                            <div class="displayFlex alignItemsCenter">
                                ${comment.login}
                                <span class="stars">${Note.renderStars(comment.user_note, comment.user_id === UsBetaSeries.userId ? 'blue' : '')}</span>
                            </div>
                            <div>
                                <time class="u-colorWhiteOpacity05" style="font-size: 14px;">
                                    ${comment.date.format('dd mmmm yyyy')}
                                </time>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
        jQuery('#comments .slides_flex').prepend(template);
        // On met à jour le nombre de commentaires
        jQuery('#comments .blockTitle').text(jQuery('#comments .blockTitle').text().replace(/\d+/, this._parent.nbComments.toString()));
        this._callListeners(EventTypes.ADDED);
    }
    /**
     * Supprime un commentaire dans la liste des commentaires de la page
     * @param {number} cmtId - L'identifiant du commentaire
     */
    removeFromPage(cmtId) {
        const $vignette = jQuery(`#comments .slides_flex .slide__comment[data-comment-id="${cmtId}"]`);
        $vignette.parents('.slide_flex').remove();
    }
    /**
     * Retourne la template affichant les notes associés aux commentaires
     * @returns {string} La template affichant les évaluations des commentaires
     */
    showEvaluations() {
        const self = this;
        const params = {
            type: this.media.mediaType.singular,
            id: this.media.id,
            replies: 1,
            nbpp: this.media.nbComments
        };
        return UsBetaSeries.callApi(HTTP_VERBS.GET, 'comments', 'comments', params)
            .then((data) => {
            let comments = data.comments || [];
            comments = comments.filter((comment) => { return comment.user_note > 0; });
            const notes = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
            const userIds = [];
            let nbEvaluations = 0;
            for (let c = 0; c < comments.length; c++) {
                // Pour éviter les doublons
                if (!userIds.includes(comments[c].user_id)) {
                    userIds.push(comments[c].user_id);
                    nbEvaluations++;
                    notes[comments[c].user_note]++;
                }
            }
            const buildline = function (index, notes) {
                const percent = nbEvaluations > 0 ? (notes[index] * 100) / nbEvaluations : 0;
                return `<tr class="histogram-row">
                    <td class="nowrap">${index} étoile${index > 1 ? 's' : ''}</td>
                    <td class="span10">
                        <div class="meter" role="progressbar" aria-valuenow="${percent.toFixed(1)}%">
                            <div class="meter-filled" style="width: ${percent.toFixed(1)}%"></div>
                        </div>
                    </td>
                    <td class="nowrap">${percent.toFixed(1)}%</td>
                </tr>`;
            };
            /*
             * Construction de la template
             *  - Le nombre de notes
             *  - La note moyenne
             *  - Les barres de progression par note
             */
            let template = `
                <div class="evaluations">
                    <div class="size-base">${this.media.objNote.total} évaluation${this.media.objNote.total > 1 ? 's' : ''} dont ${nbEvaluations} parmis les commentaires</div>
                    <div class="size-base average">Note globale: <strong>${self._parent.objNote.mean.toFixed(2)}</strong></div>
                    <div><table><tbody>`;
            for (let i = 5; i > 0; i--) {
                template += buildline(i, notes);
            }
            return template + '</tbody></table><p class="alert alert-info"><small>Les pourcentages sont calculés uniquement sur les évaluations dans les commentaires.</small></p></div>';
        });
    }
}

/**
 * TypeDisplayComment
 * @memberof CommentBS
 * @enum
 * @alias TypeDisplayComment
 */
var TypeDisplayComment;
(function (TypeDisplayComment) {
    TypeDisplayComment[TypeDisplayComment["hidden"] = 0] = "hidden";
    TypeDisplayComment[TypeDisplayComment["page"] = 1] = "page";
    TypeDisplayComment[TypeDisplayComment["collection"] = 2] = "collection";
    TypeDisplayComment[TypeDisplayComment["alone"] = 3] = "alone"; // Affiché seul
})(TypeDisplayComment = TypeDisplayComment || (TypeDisplayComment = {}));
/**
 * CommentBS - Classe servant à manipuler les commentaires provenant de l'API BetaSeries
 * @class
 * @extends Base
 * @implements {implFillDecorator}
 */
class CommentBS extends Base {
    /*************************************************/
    /*                  STATIC                       */
    /*************************************************/
    static logger = new UsBetaSeries.setDebug('Comments:Comment');
    static debug = CommentBS.logger.debug.bind(CommentBS.logger);
    /**
     * @type {Object.<string, RelatedProp>}
     */
    static relatedProps = {
        id: { key: "id", type: "number" },
        reference: { key: "reference", type: "string" },
        type: { key: "type", type: "string" },
        ref_id: { key: "ref_id", type: 'number' },
        user_id: { key: 'user_id', type: 'number' },
        login: { key: "login", type: "string" },
        avatar: { key: "avatar", type: "string" },
        date: { key: "date", type: 'date' },
        text: { key: "text", type: "string" },
        inner_id: { key: "inner_id", type: 'number' },
        in_reply_to: { key: "in_reply_to", type: 'number' },
        in_reply_id: { key: "in_reply_id", type: 'number' },
        in_reply_user: { key: "in_reply_user", type: "object" },
        user_note: { key: "user_note", type: 'number', default: 0 },
        thumbs: { key: "thumbs", type: 'number' },
        thumbed: { key: "thumbed", type: 'number', default: 0 },
        replies: { key: "nbReplies", type: 'number', default: 0 },
        from_admin: { key: "from_admin", type: 'boolean', default: false },
        user_rank: { key: "user_rank", type: 'string' },
    };
    /**
     * Types d'évenements gérés par cette classe
     * @type {EventTypes[]}
     */
    static EventTypes = [
        EventTypes.UPDATE,
        EventTypes.SAVE,
        EventTypes.ADD,
        EventTypes.SHOW,
        EventTypes.HIDE,
        EventTypes.DELETE
    ];
    /**
     * Contient le nom des classes CSS utilisées pour le rendu du commentaire
     * @type {Obj}
     */
    static classNamesCSS = { reply: 'it_i3', actions: 'it_i1', comment: 'it_ix' };
    /*************************************************/
    /*                  PROPERTIES                   */
    /*************************************************/
    /**
     * Identifiant du commentaire
     * @type {number}
     */
    id;
    /**
     * Référence du média, pour créer l'URL (type.titleUrl)
     * @type {string}
     */
    reference;
    /**
     * Type de média
     * @type {string}
     */
    type;
    /**
     * Identifiant du média
     * @type {number}
     */
    ref_id;
    /**
     * Identifiant du membre du commentaire
     * @type {number}
     */
    user_id;
    /**
     * Login du membre du commentaire
     * @type {string}
     */
    login;
    /**
     * URL de l'avatar du membre du commentaire
     * @type {string}
     */
    avatar;
    /**
     * Date de création du commentaire
     * @type {Date}
     */
    date;
    /**
     * Contenu du commentaire
     * @type {string}
     */
    text;
    /**
     * Index du commentaire dans la liste des commentaires du média
     * @type {number}
     */
    inner_id;
    /**
     * Index du commentaire dont celui-ci est une réponse
     * @type {number}
     */
    in_reply_to;
    /**
     * Identifiant du commentaire dont celui-ci est une réponse
     * @type {number}
     */
    in_reply_id;
    /**
     * Informations sur le membre du commentaire original
     * @type {ReplyUser}
     */
    in_reply_user;
    /**
     * Note du membre pour le média
     * @type {number}
     */
    user_note;
    /**
     * Votes pour ce commentaire
     * @type {number}
     */
    thumbs;
    /**
     * Vote du membre connecté
     * @type {number}
     */
    thumbed;
    /**
     * Nombre de réponse à ce commentaires
     * @type {number}
     */
    nbReplies;
    /**
     * Les réponses au commentaire
     * @type {CommentBS[]}
     */
    replies;
    /**
     * Message de l'administration
     * @type {boolean}
     */
    from_admin;
    /**
     * ???
     * @type {string}
     */
    user_rank;
    /**
     * Indique le type d'affichage en cours du commentaire
     * @type {TypeDisplayComment}
     */
    _typeDisplay = TypeDisplayComment.hidden;
    /**
     * La collection de commentaires
     * @type {CommentsBS}
     */
    _parent;
    /**
     * Liste des events déclarés par la fonction loadEvents
     * @type {CustomEvent[]}
     */
    _events;
    /**
     * Decorators de la classe
     * @type {Object.<string, AbstractDecorator>}
     */
    __decorators = {
        fill: new FillDecorator(this)
    };
    /**
     * Element HTML de référence du commentaire
     * @type {JQuery<HTMLElement>}
     */
    __elt;
    /**
     * Flag d'initialisation de l'objet, nécessaire pour la methode fill
     * @type {boolean}
     */
    __initial = true;
    /**
     * Stocke les changements des propriétés de l'objet
     * @type {Object.<string, Changes>}
     */
    __changes = {};
    /**
     * Tableau des propriétés énumerables de l'objet
     * @type {string[]}
     */
    __props = [];
    constructor(data, parent) {
        super(data);
        this._parent = parent;
        this.replies = [];
        return this.fill(data).init();
    }
    /**
     * Initialise l'objet CommentBS
     * @returns {CommentBS}
     */
    init() {
        const selectorCSS = `#comments .slides_flex .slide_flex .slide__comment[data-comment-id="${this.id}"]`;
        const $comment = jQuery(selectorCSS);
        if ($comment.length > 0) {
            this.elt = $comment.parents('.slide_flex');
        }
        return this;
    }
    get elt() {
        return this.__elt;
    }
    set elt(elt) {
        this.__elt = elt;
    }
    get parent() {
        return this._parent;
    }
    set parent(par) {
        if (!(par instanceof CommentsBS) && !(par instanceof CommentBS)) {
            throw new TypeError('Paremeter "parent" must be an instance of CommentsBS or CommentBS');
        }
        this._parent = par;
    }
    /**
     * Remplit l'objet avec les données fournit en paramètre
     * @param   {Obj} data - Les données provenant de l'API
     * @returns {CommentBS}
     * @see FillDecorator.fill
     */
    fill(data) {
        try {
            return this.__decorators.fill.fill.call(this, data);
        }
        catch (err) {
            console.error(err);
        }
    }
    /**
     * Met à jour le rendu HTML des propriétés de l'objet,
     * si un sélecteur CSS exite pour la propriété fournit en paramètre\
     * **Méthode appelée automatiquement par le setter de la propriété**
     * @see Show.selectorsCSS
     * @param   {string} propKey - La propriété de l'objet à mettre à jour
     * @returns {void}
     */
    updatePropRender(propKey) {
        try {
            this.__decorators.fill.updatePropRender.call(this, propKey);
        }
        catch (err) {
            console.error(err);
        }
    }
    /**
     * Retourne l'objet sous forme d'objet simple, sans référence circulaire,
     * pour la méthode JSON.stringify
     * @returns {object}
     */
    toJSON() {
        const obj = {};
        for (const key of this.__props) {
            obj[key] = this[key];
        }
        return obj;
    }
    /**
     * Récupère les réponses du commentaire
     * @param   {OrderComments} order - Ordre de tri des réponses
     * @returns {Promise<CommentBS>}
     */
    async fetchReplies(order = OrderComments.ASC) {
        if (this.nbReplies <= 0)
            return this;
        const data = await UsBetaSeries.callApi(HTTP_VERBS.GET, 'comments', 'replies', { id: this.id, order }, true);
        // this.replies = [];
        if (data.comments) {
            for (let c = 0, _len = data.comments.length; c < _len; c++) {
                if (this.replies[c] && this.replies[c].id == data.comments[c].id) {
                    this.replies[c].fill(data.comments[c]);
                }
                else {
                    // TODO: créer une fonction Array.insertAt pour insérer un élément
                    // dans un tableau à une position donnée et déplacer le reste du tableau
                    this.replies.push(new CommentBS(data.comments[c], this));
                }
            }
        }
        return this;
    }
    /**
     * Permet de trier les réponses du commentaires selon l'ordre passé en paramètre
     * @param   {OrderComments} [order='asc'] - Ordre de tri des réponses
     * @returns {CommentBS[]}
     */
    sortReplies(order = OrderComments.ASC) {
        this.replies.sort((cmtA, cmtB) => {
            if (order === OrderComments.ASC) {
                return (cmtA.inner_id < cmtB.inner_id) ? -1 : cmtA.inner_id > cmtB.inner_id ? 1 : 0;
            }
            else {
                return (cmtB.inner_id < cmtA.inner_id) ? -1 : cmtB.inner_id > cmtA.inner_id ? 1 : 0;
            }
        });
        return this.replies;
    }
    /**
     * Modifie le texte du commentaire
     * @param   {string} msg - Le nouveau message du commentaire
     * @returns {CommentBS}
     */
    edit(msg) {
        const self = this;
        this.text = msg;
        const params = {
            edit_id: this.id,
            text: msg
        };
        return UsBetaSeries.callApi(HTTP_VERBS.POST, 'comments', 'comment', params)
            .then((data) => {
            return self.fill(data.comment);
        });
    }
    /**
     * Supprime le commentaire sur l'API
     * @returns {void}
     */
    delete() {
        const self = this;
        const promises = [];
        if (this.nbReplies > 0) {
            for (let r = 0; r < this.replies.length; r++) {
                promises.push(UsBetaSeries.callApi(HTTP_VERBS.DELETE, 'comments', 'comment', { id: this.replies[r].id }));
            }
        }
        Promise.all(promises).then(() => {
            UsBetaSeries.callApi(HTTP_VERBS.DELETE, 'comments', 'comment', { id: this.id })
                .then(() => {
                if (self._parent instanceof CommentsBS) {
                    self._parent.removeComment(self.id);
                }
                else if (self._parent instanceof CommentBS) {
                    self._parent.removeReply(self.id);
                }
                self.getCollectionComments().nbComments = self.getCollectionComments().nbComments - (promises.length + 1);
            });
        });
    }
    /**
     * Indique si le commentaire est le premier de la liste
     * @returns {boolean}
     */
    isFirst() {
        return this._parent.isFirst(this.id);
    }
    /**
     * Indique si le commentaire est le dernier de la liste
     * @returns {boolean}
     */
    isLast() {
        return this._parent.isLast(this.id);
    }
    /**
     * Indique si le message est un spoiler
     * @returns {boolean}
     */
    isSpoiler() {
        return /\[spoiler\]/.test(this.text);
    }
    /**
     * Renvoie la template HTML pour l'affichage d'un commentaire
     * @param   {CommentBS} comment Le commentaire à afficher
     * @returns {string}
     */
    static getTemplateComment(comment) {
        let text = new Option(comment.text).innerHTML;
        if (/@\w+/.test(text)) {
            text = text.replace(/@(\w+)/g, '<a href="/membre/$1" class="mainLink mainLink--regular">@$1</a>');
        }
        const btnSpoiler = comment.isSpoiler() ? `<button type="button" class="btn-reset mainLink view-spoiler">${UsBetaSeries.trans("comment.button.display_spoiler")}</button>` : '';
        text = text.replace(/\[spoiler\](.*)\[\/spoiler\]/g, '<span class="spoiler" style="display:none">$1</span>');
        // let classNames = {reply: 'iv_i5', actions: 'iv_i3', comment: 'iv_iz'};
        // const classNames = {reply: 'it_i3', actions: 'it_i1', comment: 'it_ix'};
        const isReply = comment.in_reply_to > 0 ? true : false;
        const className = isReply ? CommentBS.classNamesCSS.reply + ' reply ' : '';
        const btnToggleReplies = comment.nbReplies > 0 ? `
            <button type="button" class="btn-reset mainLink mainLink--regular toggleReplies" data-toggle="1">
                <span class="svgContainer">
                    <svg width="8" height="6" xmlns="http://www.w3.org/2000/svg" style="transition: transform 200ms ease 0s; transform: rotate(180deg);">
                        <path d="M4 5.667l4-4-.94-.94L4 3.78.94.727l-.94.94z" fill="#54709D" fill-rule="nonzero"></path>
                    </svg>
                </span>&nbsp;<span class="btnText">${UsBetaSeries.trans("comment.hide_answers")}</span>
            </button>` : '';
        let templateOptions = `
            <a href="/messages/nouveau?login=${comment.login}" class="mainLink">Envoyer un message</a>
            <span class="mainLink">∙</span>
            <button type="button" class="btn-reset mainLink btnSignal">Signaler</button>
        `;
        if (comment.user_id === UsBetaSeries.userId) {
            templateOptions = `
                <button type="button" class="btn-reset mainLink btnEditComment">Éditer</button>
                <span class="mainLink">∙</span>
                <button type="button" class="btn-reset mainLink btnDeleteComment">Supprimer</button>
            `;
        }
        let btnResponse = `<span class="mainLink">&nbsp;∙&nbsp;</span><button type="button" class="btn-reset mainLink mainLink--regular btnResponse" ${!UsBetaSeries.userIdentified() ? 'style="display:none;"' : ''}>${UsBetaSeries.trans("timeline.comment.reply")}</button>`;
        if (isReply)
            btnResponse = '';
        return `
            <div class="comment ${className}positionRelative ${CommentBS.classNamesCSS.comment}" data-comment-id="${comment.id}" ${comment.in_reply_to > 0 ? 'data-comment-reply="' + comment.in_reply_to + '"' : ''} data-comment-inner="${comment.inner_id}">
                <div class="media">
                    <div class="media-left">
                        <a href="/membre/${comment.login}" class="avatar">
                            <img src="https://api.betaseries.com/pictures/members?key=${UsBetaSeries.userKey}&amp;id=${comment.user_id}&amp;width=64&amp;height=64&amp;placeholder=png" width="32" height="32" alt="Profil de ${comment.login}">
                        </a>
                    </div>
                    <div class="media-body">
                        <a href="/membre/${comment.login}">
                            <span class="mainLink">${comment.login}</span>
                        </a>
                        ${btnSpoiler}
                        <span class="comment-text">${text}</span>
                        <div class="${CommentBS.classNamesCSS.actions} actionsCmt">
                            <div class="options-main options-comment">
                                <button type="button" class="btn-reset btnUpVote btnThumb" title="+1 pour ce commentaire">
                                    <svg data-disabled="false" class="SvgLike" fill="#fff" width="16" height="14" viewBox="0 0 16 14" xmlns="http://www.w3.org/2000/svg">
                                        <g fill="${comment.thumbed > 0 ? '#FFAC3B' : 'inherit'}" fill-rule="nonzero">
                                            <path fill="#fff" fill-rule="evenodd" d="M.67 6h2.73v8h-2.73v-8zm14.909.67c0-.733-.614-1.333-1.364-1.333h-4.302l.648-3.047.02-.213c0-.273-.116-.527-.3-.707l-.723-.7-4.486 4.393c-.252.24-.402.573-.402.94v6.667c0 .733.614 1.333 1.364 1.333h6.136c.566 0 1.05-.333 1.255-.813l2.059-4.7c.061-.153.095-.313.095-.487v-1.273l-.007-.007.007-.053z"></path>
                                            <path class="SvgLikeStroke" stroke="#54709D" d="M1.17 6.5v7h1.73v-7h-1.73zm13.909.142c-.016-.442-.397-.805-.863-.805h-4.92l.128-.604.639-2.99.018-.166c0-.13-.055-.257-.148-.348l-.373-.361-4.144 4.058c-.158.151-.247.355-.247.578v6.667c0 .455.387.833.864.833h6.136c.355 0 .664-.204.797-.514l2.053-4.685c.04-.1.06-.198.06-.301v-1.063l-.034-.034.034-.265z"></path>
                                        </g>
                                    </svg>
                                </button>
                                <button type="button" class="btn-reset btnDownVote btnThumb" title="-1 pour ce commentaire">
                                    <svg data-disabled="false" class="SvgLike" fill="#fff" width="16" height="14" viewBox="0 0 16 14" xmlns="http://www.w3.org/2000/svg" style="transform: rotate(180deg) scaleX(-1); margin-left: 4px; vertical-align: -4px;">
                                        <g fill="${comment.thumbed < 0 ? '#FFAC3B' : 'inherit'}" fill-rule="nonzero">
                                            <path fill="#fff" fill-rule="evenodd" d="M.67 6h2.73v8h-2.73v-8zm14.909.67c0-.733-.614-1.333-1.364-1.333h-4.302l.648-3.047.02-.213c0-.273-.116-.527-.3-.707l-.723-.7-4.486 4.393c-.252.24-.402.573-.402.94v6.667c0 .733.614 1.333 1.364 1.333h6.136c.566 0 1.05-.333 1.255-.813l2.059-4.7c.061-.153.095-.313.095-.487v-1.273l-.007-.007.007-.053z"></path>
                                            <path class="SvgLikeStroke" stroke="#54709D" d="M1.17 6.5v7h1.73v-7h-1.73zm13.909.142c-.016-.442-.397-.805-.863-.805h-4.92l.128-.604.639-2.99.018-.166c0-.13-.055-.257-.148-.348l-.373-.361-4.144 4.058c-.158.151-.247.355-.247.578v6.667c0 .455.387.833.864.833h6.136c.355 0 .664-.204.797-.514l2.053-4.685c.04-.1.06-.198.06-.301v-1.063l-.034-.034.034-.265z"></path>
                                        </g>
                                    </svg>
                                </button>
                                <strong class="mainLink thumbs${comment.thumbs < 0 ? ' negative' : comment.thumbs > 0 ? ' positive' : ''}">${comment.thumbs > 0 ? '+' + comment.thumbs : comment.thumbs}</strong>
                                ${btnResponse}
                                <span class="mainLink">∙</span>
                                <span class="mainTime">Le ${comment.date.format('dd/mm/yyyy HH:MM')}</span>
                                <span class="stars" title="${comment.user_note} / 5">
                                    ${Note.renderStars(comment.user_note, comment.user_id === UsBetaSeries.userId ? 'blue' : '')}
                                </span>
                                <div class="it_iv">
                                    <button type="button" class="btn-reset btnToggleOptions">
                                        <span class="svgContainer">
                                            <svg width="4" height="16" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="transform: rotate(90deg);">
                                                <defs>
                                                    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" id="svgthreedots"></path>
                                                </defs>
                                                <use fill="${UsBetaSeries.theme === 'dark' ? "rgba(255, 255, 255, .5)" : "#333"}" fill-rule="nonzero" xlink:href="#svgthreedots" transform="translate(-10 -4)"></use>
                                            </svg>
                                        </span>
                                    </button>
                                </div>
                            </div>
                            <div class="options-options options-comment" style="display:none;">
                                ${templateOptions}
                                <button type="button" class="btn-reset btnToggleOptions">
                                    <span class="svgContainer">
                                        <svg fill="${UsBetaSeries.theme === 'dark' ? "rgba(255, 255, 255, .5)" : "#333"}" width="9" height="9" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M14 1.41l-1.41-1.41-5.59 5.59-5.59-5.59-1.41 1.41 5.59 5.59-5.59 5.59 1.41 1.41 5.59-5.59 5.59 5.59 1.41-1.41-5.59-5.59z"></path>
                                        </svg>
                                    </span>
                                </button>
                            </div>
                        </div>
                        ${btnToggleReplies}
                    </div>
                </div>
            </div>
        `;
    }
    /**
     * Renvoie la template HTML pour l'écriture d'un commentaire
     * @param   {CommentBS} [comment?] - L'objet commentaire sur lequel envoyé les réponses
     * @returns {string}
     */
    static getTemplateWriting(comment) {
        const login = UsBetaSeries.userIdentified() ? currentLogin : '';
        let replyTo = '', placeholder = UsBetaSeries.trans("timeline.comment.write");
        if (comment) {
            replyTo = ` data-reply-to="${comment.id}"`;
            placeholder = "Ecrivez une réponse à ce commentaire";
        }
        return `
            <div class="writing">
                <div class="media">
                    <div class="media-left">
                        <div class="avatar">
                            <img src="https://api.betaseries.com/pictures/members?key=${UsBetaSeries.userKey}&amp;id=${UsBetaSeries.userId}&amp;width=32&amp;height=32&amp;placeholder=png" width="32" height="32" alt="Profil de ${login}">
                        </div>
                    </div>
                    <div class="media-body">
                        <form class="gz_g1">
                            <textarea rows="2" placeholder="${placeholder}" class="form-control"${replyTo}></textarea>
                            <button class="btn-reset sendComment" disabled="" aria-label="${UsBetaSeries.trans("comment.send.label")}" title="${UsBetaSeries.trans("comment.send.label")}">
                                <span class="svgContainer" style="width: 16px; height: 16px;">
                                    <svg fill="${UsBetaSeries.theme === 'dark' ? "#fff" : "#333"}" width="15" height="12" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M.34 12l13.993-6L.34 0 .333 4.667l10 1.333-10 1.333z"></path>
                                    </svg>
                                </span>
                            </button>
                        </form>
                        <p class="mainTime">Utilisez la balise <span class="baliseSpoiler" title="Ajouter la balise spoiler à votre commentaire">[spoiler]…[/spoiler]</span> pour masquer le contenu pouvant spoiler les lecteurs.</p>
                    </div>
                </div>
            </div>
        `;
    }
    /**
     * Renvoie la template HTML pour l'écriture d'un signalement de commentaire
     * @param   {CommentBS} [comment] - L'objet commentaire à signaler
     * @returns {string}
     */
    static getTemplateReport(comment) {
        return `
            <form class="form-middle" method="POST" action="/apps/report.php">
                <fieldset>
                    <div class="title" id="dialog-title" tabindex="0">Signaler un commentaire</div>
                    <p>Vous êtes sur le point de signaler un commentaire, veuillez indiquer ci-dessous la raison de ce signalement.</p>
                    <div>
                        <textarea class="form-control" name="texte"></textarea>
                    </div>
                    <div class="button-set">
                        <button class="js-close-popupalert btn-reset btn-btn btn-blue2" type="submit" id="popupalertyes">Signaler le contenu</button>
                    </div>
                </fieldset>
                <input type="hidden" name="id" value="${comment.id}">
                <input type="hidden" name="type" value="comment">
            </form>`;
    }
    /**
     * Retourne le login du commentaire et des réponses
     * @returns {string[]}
     */
    getLogins() {
        const users = [];
        users.push(this.login);
        for (let r = 0; r < this.replies.length; r++) {
            if (!users.includes(this.replies[r].login)) {
                users.push(this.replies[r].login);
            }
        }
        return users;
    }
    /**
     * Met à jour le rendu des votes de ce commentaire
     * @param   {number} vote Le vote
     * @returns {void}
     */
    updateRenderThumbs(vote = 0) {
        const $thumbs = jQuery(`.comments .comment[data-comment-id="${this.id}"] .thumbs`);
        const val = parseInt($thumbs.text(), 10);
        const result = (vote == this.thumbed) ? val + vote : val - vote;
        const text = result > 0 ? `+${result}` : result.toString();
        // if (BetaSeries.debug) CommentBS.debug('renderThumbs: ', {val, vote, result, text});
        $thumbs.text(text);
        if (this.thumbed == 0) {
            // On supprime la couleur de remplissage des icones de vote
            $thumbs.siblings('.btnThumb').find('g').attr('fill', 'inherited');
            return;
        }
        // On affiche le vote en remplissant l'icone correspondant d'une couleur jaune
        const $btnVote = this.thumbed > 0 ? $thumbs.siblings('.btnThumb.btnUpVote') : $thumbs.siblings('.btnThumb.btnDownVote');
        $btnVote.find('g').attr('fill', '#FFAC3B');
    }
    /**
     * Indique si le comment fournit en paramètre fait parti des réponses
     * @param   {number} commentId L'identifiant de la réponse
     * @returns {boolean}
     */
    async isReply(commentId) {
        if (this.replies.length <= 0 && this.nbReplies <= 0)
            return false;
        else if (this.replies.length <= 0) {
            await this.fetchReplies();
        }
        for (let r = 0; r < this.replies.length; r++) {
            if (this.replies[r].id == commentId) {
                return true;
            }
        }
        return false;
    }
    /**
     * Retourne la réponse correspondant à l'identifiant fournit
     * @param   {number} commentId L'identifiant de la réponse
     * @returns {Promise<(CommentBS | void)>} La réponse
     */
    async getReply(commentId) {
        if (this.replies.length <= 0 && this.nbReplies <= 0)
            return null;
        else if (this.replies.length <= 0) {
            await this.fetchReplies();
        }
        for (let r = 0; r < this.replies.length; r++) {
            if (this.replies[r].id == commentId) {
                return this.replies[r];
            }
        }
        return null;
    }
    /**
     * Supprime une réponse
     * @param   {number} cmtId - L'identifiant de la réponse
     * @returns {boolean}
     */
    removeReply(cmtId) {
        for (let r = 0; r < this.replies.length; r++) {
            if (this.replies[r].id == cmtId) {
                this.replies.splice(r, 1);
                return true;
            }
        }
        return false;
    }
    /**
     * Retourne l'objet CommentsBS
     * @returns {CommentsBS}
     */
    getCollectionComments() {
        if (this._parent instanceof CommentsBS) {
            return this._parent;
        }
        else if (this._parent instanceof CommentBS) {
            return this._parent._parent;
        }
        return null;
    }
    /**
     * Ajoute les évènements sur les commentaires lors du rendu
     * @param   {JQuery<HTMLElement>} $container - Le conteneur des éléments d'affichage
     * @param   {Obj} funcPopup - Objet des fonctions d'affichage/ de masquage de la popup
     * @returns {void}
     */
    loadEvents($container, funcPopup) {
        this._events = [];
        const self = this;
        const $popup = jQuery('#popin-dialog');
        const $btnClose = jQuery("#popin-showClose");
        const $title = $container.find('.title');
        /**
         * Retourne l'objet CommentBS associé au DOMElement fournit en paramètre
         * @param   {JQuery<HTMLElement>} $comment - Le DOMElement contenant le commentaire
         * @returns {Promise<CommentBS>}
         */
        const getObjComment = async function ($comment) {
            const commentId = parseInt($comment.data('commentId'), 10);
            if (commentId === self.id)
                return self;
            else if (self.isReply(commentId))
                return await self.getReply(commentId);
            else
                return self.getCollectionComments().getComment(commentId);
        };
        $btnClose.on('click', () => {
            funcPopup.hidePopup();
            $popup.removeAttr('data-popin-type');
        });
        this._events.push({ elt: $btnClose, event: 'click' });
        const $btnReport = $container.find('.btnSignal');
        $btnReport.on('click', async (e) => {
            e.stopPropagation();
            e.preventDefault();
            const $comment = $(e.currentTarget).parents('.comment');
            const comment = await getObjComment($comment);
            const $contentHtml = $container.parents('.popin-content').find('.popin-content-html');
            $contentHtml.empty().append(CommentBS.getTemplateReport(comment));
            $contentHtml.find('button.js-close-popupalert.btn-blue2').on('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                const $form = $contentHtml.find('form');
                const paramsFetch = {
                    method: 'POST',
                    cache: 'no-cache',
                    body: new URLSearchParams($form.serialize())
                };
                fetch('/apps/report.php', paramsFetch)
                    .then(() => {
                    $contentHtml.hide();
                    $container.show();
                })
                    .catch(() => {
                    $contentHtml.hide();
                    $container.show();
                });
            });
            $container.hide();
            $contentHtml.show();
        });
        this._events.push({ elt: $btnReport, event: 'click' });
        const $btnSubscribe = $container.find('.btnSubscribe');
        /**
         * Met à jour l'affichage du bouton de souscription
         * des alertes de nouveaux commentaires
         * @param   {JQuery<HTMLElement>} $btn - L'élément jQuery correspondant au bouton de souscription
         * @returns {void}
         */
        function displaySubscription($btn) {
            const collection = self.getCollectionComments();
            if (!collection.is_subscribed) {
                $btn.removeClass('active');
                $btn.attr('title', "Recevoir les commentaires par e-mail");
                $btn.find('svg').replaceWith(`
                    <svg fill="${UsBetaSeries.theme == 'dark' ? 'rgba(255, 255, 255, .5)' : '#333'}" width="14" height="16" style="position: relative; top: 1px; left: -1px;">
                        <path fill-rule="nonzero" d="M13.176 13.284L3.162 2.987 1.046.812 0 1.854l2.306 2.298v.008c-.428.812-.659 1.772-.659 2.806v4.103L0 12.709v.821h11.307l1.647 1.641L14 14.13l-.824-.845zM6.588 16c.914 0 1.647-.73 1.647-1.641H4.941c0 .91.733 1.641 1.647 1.641zm4.941-6.006v-3.02c0-2.527-1.35-4.627-3.705-5.185V1.23C7.824.55 7.272 0 6.588 0c-.683 0-1.235.55-1.235 1.23v.559c-.124.024-.239.065-.346.098a2.994 2.994 0 0 0-.247.09h-.008c-.008 0-.008 0-.017.009-.19.073-.379.164-.56.254 0 0-.008 0-.008.008l7.362 7.746z"></path>
                    </svg>
                `);
            }
            else if (collection.is_subscribed) {
                $btn.addClass('active');
                $btn.attr('title', "Ne plus recevoir les commentaires par e-mail");
                $btn.find('svg').replaceWith(`
                    <svg width="20" height="22" viewBox="0 0 20 22" style="width: 17px;">
                        <g transform="translate(-4)" fill="none">
                            <path d="M0 0h24v24h-24z"></path>
                            <path fill="${UsBetaSeries.theme == 'dark' ? 'rgba(255, 255, 255, .5)' : '#333'}" d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32v-.68c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68c-2.87.68-4.5 3.24-4.5 6.32v5l-2 2v1h16v-1l-2-2z"></path>
                        </g>
                    </svg>
                `);
            }
        }
        $btnSubscribe.on('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            if (!UsBetaSeries.userIdentified()) {
                faceboxDisplay('inscription', {}, () => { });
                return;
            }
            const $btn = $(e.currentTarget);
            const params = { type: self.getCollectionComments().media.mediaType.singular, id: self.getCollectionComments().media.id };
            if ($btn.hasClass('active')) {
                UsBetaSeries.callApi(HTTP_VERBS.DELETE, 'comments', 'subscription', params)
                    .then(() => {
                    self.getCollectionComments().is_subscribed = false;
                    displaySubscription($btn);
                });
            }
            else {
                UsBetaSeries.callApi(HTTP_VERBS.POST, 'comments', 'subscription', params)
                    .then(() => {
                    self.getCollectionComments().is_subscribed = true;
                    displaySubscription($btn);
                });
            }
        });
        displaySubscription($btnSubscribe);
        this._events.push({ elt: $btnSubscribe, event: 'click' });
        // On récupère le bouton de navigation 'précédent'
        const $prevCmt = $title.find('.prev-comment');
        // Si le commentaire est le premier de la liste
        // on ne l'active pas
        if (this.isFirst()) {
            $prevCmt.css('color', 'grey').css('cursor', 'initial');
        }
        else {
            // On active le btn précédent
            $prevCmt.on('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                // Il faut tout nettoyer, comme pour la fermeture
                self.cleanEvents();
                // Il faut demander au parent d'afficher le commentaire précédent
                self.getCollectionComments().getPrevComment(self.id).render();
            });
            this._events.push({ elt: $prevCmt, event: 'click' });
        }
        const $nextCmt = $title.find('.next-comment');
        // Si le commentaire est le dernier de la liste
        // on ne l'active pas
        if (this.isLast()) {
            $nextCmt.css('color', 'grey').css('cursor', 'initial');
        }
        else {
            // On active le btn suivant
            $nextCmt.on('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                // Il faut tout nettoyer, comme pour la fermeture
                self.cleanEvents();
                // Il faut demander au parent d'afficher le commentaire suivant
                self.getCollectionComments().getNextComment(self.id).render();
            });
            this._events.push({ elt: $nextCmt, event: 'click' });
        }
        // On active le lien pour afficher le spoiler
        const $btnSpoiler = $container.find('.view-spoiler');
        if ($btnSpoiler.length > 0) {
            $btnSpoiler.on('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                const $btn = jQuery(e.currentTarget);
                const $spoiler = $btn.next('.comment-text').find('.spoiler');
                if ($spoiler.is(':visible')) {
                    $spoiler.fadeOut('fast');
                    $btn.text('Voir le spoiler');
                }
                else {
                    $spoiler.fadeIn('fast');
                    $btn.text('Cacher le spoiler');
                }
            });
            this._events.push({ elt: $btnSpoiler, event: 'click' });
        }
        /**
         * Ajoutons les events pour:
         *  - btnUpVote: Voter pour ce commentaire
         *  - btnDownVote: Voter contre ce commentaire
         */
        const $btnThumb = $container.find('.comments .comment .btnThumb');
        $btnThumb.on('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            if (!UsBetaSeries.userIdentified()) {
                faceboxDisplay('inscription', {}, () => { });
                return;
            }
            const $btn = jQuery(e.currentTarget);
            const commentId = parseInt($btn.parents('.comment').data('commentId'), 10);
            let verb = HTTP_VERBS.POST;
            const vote = $btn.hasClass('btnUpVote') ? 1 : -1;
            let params = { id: commentId, type: vote, switch: false };
            // On a déjà voté
            if (self.thumbed == vote) {
                verb = HTTP_VERBS.DELETE;
                params = { id: commentId };
            }
            else if (self.thumbed != 0) {
                console.warn("Le vote est impossible. Annuler votre vote et recommencer");
                return;
            }
            UsBetaSeries.callApi(verb, 'comments', 'thumb', params)
                .then(async (data) => {
                if (commentId == self.id) {
                    self.thumbs = parseInt(data.comment.thumbs, 10);
                    self.thumbed = data.comment.thumbed ? parseInt(data.comment.thumbed, 10) : 0;
                    self.updateRenderThumbs(vote);
                }
                else if (await self.isReply(commentId)) {
                    const reply = await self.getReply(commentId);
                    reply.thumbs = parseInt(data.comment.thumbs, 10);
                    reply.thumbed = data.comment.thumbed ? parseInt(data.comment.thumbed, 10) : 0;
                    reply.updateRenderThumbs(vote);
                }
                else {
                    // Demander au parent d'incrémenter les thumbs du commentaire
                    const thumbed = data.comment.thumbed ? parseInt(data.comment.thumbed, 10) : 0;
                    self.getCollectionComments().changeThumbs(commentId, data.comment.thumbs, thumbed);
                }
                // Petite animation pour le nombre de votes
                $btn.siblings('strong.thumbs')
                    .css('animation', '1s ease 0s 1 normal forwards running backgroundFadeOut');
            })
                .catch(err => {
                const msg = err.text !== undefined ? err.text : err;
                UsBetaSeries.notification('Vote commentaire', "Une erreur est apparue durant le vote: " + msg);
            });
        });
        this._events.push({ elt: $btnThumb, event: 'click' });
        /**
         * On affiche/masque les options du commentaire
         */
        const $btnOptions = $container.find('.btnToggleOptions');
        // if (BetaSeries.debug) CommentBS.debug('Comment loadEvents toggleOptions.length', $btnOptions.length);
        $btnOptions.on('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            jQuery(e.currentTarget).parents(`.${CommentBS.classNamesCSS.actions}`).first()
                .find('.options-comment').each((_index, elt) => {
                const $elt = jQuery(elt);
                if ($elt.is(':visible')) {
                    $elt.hide();
                }
                else {
                    $elt.show();
                }
            });
        });
        this._events.push({ elt: $btnOptions, event: 'click' });
        /**
         * On envoie la réponse à ce commentaire à l'API
         */
        const $btnSend = $container.find('.sendComment');
        $btnSend.on('click', async (e) => {
            e.stopPropagation();
            e.preventDefault();
            if (!UsBetaSeries.userIdentified()) {
                faceboxDisplay('inscription', {}, () => { });
                return;
            }
            const $textarea = $(e.currentTarget).siblings('textarea');
            if ($textarea.val().length > 0) {
                const replyId = parseInt($textarea.data('replyTo'), 10);
                const action = $textarea.data('action');
                const msg = $textarea.val();
                if (replyId && replyId == self.id) {
                    self.sendReply(msg).then(comment => {
                        if (comment) {
                            const template = CommentBS.getTemplateComment(comment);
                            $container.find('.comments').append(template);
                            $textarea.removeAttr('data-reply-to');
                            self.cleanEvents(() => {
                                self.loadEvents($container, funcPopup);
                            });
                        }
                    });
                }
                else if (replyId) {
                    const reply = await self.getReply(replyId);
                    if (reply) {
                        reply.sendReply(msg).then(comment => {
                            if (comment) {
                                const template = CommentBS.getTemplateComment(comment);
                                $container.find(`.comments .comment[data-comment-id="${reply.id}"]`)
                                    .after(template);
                                $textarea.removeAttr('data-reply-to');
                                self.cleanEvents(() => {
                                    self.loadEvents($container, funcPopup);
                                });
                            }
                        });
                    }
                    else {
                        // Allo Houston, on a un problème
                    }
                }
                else if (action === 'edit') {
                    self.edit(msg).then(() => {
                        const cmtId = parseInt($textarea.data('commentId'), 10);
                        let $comment = $(e.currentTarget).parents('.writing').siblings('.comments').children(`.comment[data-comment-id="${cmtId.toString()}"]`);
                        $comment.find('.comment-text').text(self.text);
                        $comment = jQuery(`#comments .slide_flex .slide__comment[data-comment-id="${cmtId}"]`);
                        $comment.find('p').text(msg);
                        $textarea.removeAttr('data-action').removeAttr('data-comment-id');
                    });
                }
                else {
                    CommentsBS.sendComment(self.getCollectionComments().media, msg).then((comment) => {
                        self.getCollectionComments().addToPage(comment.id);
                        self.cleanEvents(() => {
                            self.loadEvents($container, funcPopup);
                        });
                    });
                }
                $textarea.val('');
                $textarea.siblings('button').attr('disabled', 'true');
            }
        });
        this._events.push({ elt: $btnSend, event: 'click' });
        /**
         * On active / desactive le bouton d'envoi du commentaire
         * en fonction du contenu du textarea
         */
        const $textarea = $container.find('textarea');
        $textarea.on('keypress', (e) => {
            const $textarea = $(e.currentTarget);
            if ($textarea.val().length > 0) {
                $textarea.siblings('button').removeAttr('disabled');
            }
            else {
                $textarea.siblings('button').attr('disabled', 'true');
            }
        });
        this._events.push({ elt: $textarea, event: 'keypress' });
        /**
         * On ajoute les balises SPOILER au message dans le textarea
         */
        const $baliseSpoiler = $container.find('.baliseSpoiler');
        $baliseSpoiler.on('click', () => {
            const $textarea = $popup.find('textarea');
            if (/\[spoiler\]/.test($textarea.val())) {
                return;
            }
            const text = '[spoiler]' + $textarea.val() + '[/spoiler]';
            $textarea.val(text);
        });
        this._events.push({ elt: $baliseSpoiler, event: 'click' });
        const $btnReplies = $container.find('.comments .toggleReplies');
        $btnReplies.on('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            const $btn = $(e.currentTarget);
            const state = $btn.data('toggle'); // 0: Etat masqué, 1: Etat affiché
            const $comment = $btn.parents('.comment');
            const inner = $comment.data('commentInner');
            const $replies = $comment.parents('.comments').find(`.comment[data-comment-reply="${inner}"]`);
            if (state == '0') {
                // On affiche
                $replies.nextAll('.sub').fadeIn('fast');
                $replies.fadeIn('fast');
                $btn.find('.btnText').text(UsBetaSeries.trans("comment.hide_answers"));
                $btn.find('svg').attr('style', 'transition: transform 200ms ease 0s; transform: rotate(180deg);');
                $btn.data('toggle', '1');
            }
            else {
                // On masque
                $replies.nextAll('.sub').fadeOut('fast');
                $replies.fadeOut('fast');
                $btn.find('.btnText').text(UsBetaSeries.trans("comment.button.reply", { "%count%": $replies.length.toString() }, $replies.length));
                $btn.find('svg').attr('style', 'transition: transform 200ms ease 0s;');
                $btn.data('toggle', '0');
            }
        });
        this._events.push({ elt: $btnReplies, event: 'click' });
        const $btnResponse = $container.find('.btnResponse');
        $btnResponse.on('click', async (e) => {
            e.stopPropagation();
            e.preventDefault();
            if (!UsBetaSeries.userIdentified()) {
                faceboxDisplay('inscription', {}, () => { });
                return;
            }
            const $btn = $(e.currentTarget);
            const $comment = $btn.parents('.comment');
            const comment = await getObjComment($comment);
            $container.find('textarea')
                .val('@' + comment.login)
                .attr('data-reply-to', comment.id);
        });
        this._events.push({ elt: $btnResponse, event: 'click' });
        const $btnEdit = $container.find('.btnEditComment');
        $btnEdit.on('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            const $parent = $(e.currentTarget).parents('.comment');
            const commentId = parseInt($parent.data('commentId'), 10);
            $textarea.val(self.text);
            $textarea.attr('data-action', 'edit');
            $textarea.attr('data-comment-id', commentId);
        });
        this._events.push({ elt: $btnEdit, event: 'click' });
        const $btnDelete = $container.find('.btnDeleteComment');
        $btnDelete.on('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            const $parent = $(e.currentTarget).parents('.comment');
            const $options = $(e.currentTarget).parents('.options-options');
            const template = `
                <div class="options-delete">
                    <span class="mainTime">Supprimer mon commentaire :</span>
                    <button type="button" class="btn-reset fontWeight700 btnYes" style="vertical-align: 0px; padding-left: 10px; padding-right: 10px; color: rgb(208, 2, 27);">Oui</button>
                    <button type="button" class="btn-reset mainLink btnNo" style="vertical-align: 0px;">Non</button>
                </div>
            `;
            $options.hide().after(template);
            const $btnYes = $parent.find('.options-delete .btnYes');
            const $btnNo = $parent.find('.options-delete .btnNo');
            $btnYes.on('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                self.delete();
                $btnClose.trigger('click');
            });
            $btnNo.on('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                $parent.find('.options-delete').remove();
                $options.show();
                $btnYes.off('click');
                $btnNo.off('click');
            });
        });
        this._events.push({ elt: $btnDelete, event: 'click' });
    }
    /**
     * Nettoie les events créer par la fonction loadEvents
     * @param   {Callback} onComplete - Fonction de callback
     * @returns {void}
     */
    cleanEvents(onComplete = UsBetaSeries.noop) {
        if (this._events && this._events.length > 0) {
            let data;
            for (let e = 0; e < this._events.length; e++) {
                data = this._events[e];
                data.elt.off(data.event);
            }
        }
        onComplete();
    }
    /**
     * Affiche le commentaire dans une dialogbox
     */
    async render() {
        // La popup et ses éléments
        const self = this, $popup = jQuery('#popin-dialog'), $contentHtml = $popup.find(".popin-content-html"), $contentReact = $popup.find('.popin-content-reactmodule'), $closeButtons = $popup.find("#popin-showClose"), hidePopup = () => {
            document.body.style.overflow = "visible";
            document.body.style.paddingRight = "";
            $popup.attr('aria-hidden', 'true');
            $popup.find("#popupalertyes").show();
            $popup.find("#popupalertno").show();
            $contentReact.empty();
            $contentHtml.hide();
            self.cleanEvents();
            self._callListeners(EventTypes.HIDE);
        }, showPopup = () => {
            document.body.style.overflow = "hidden";
            document.body.style.paddingRight = getScrollbarWidth() + "px";
            $popup.find("#popupalertyes").hide();
            $popup.find("#popupalertno").hide();
            $contentHtml.hide();
            $contentReact.show();
            $closeButtons.show();
            $popup.attr('aria-hidden', 'false');
        };
        // On ajoute le loader dans la popup et on l'affiche
        $contentReact.empty().append(`<div class="title" id="dialog-title" tabindex="0">${UsBetaSeries.trans("blog.title.comments")}</div>`);
        let $title = $contentReact.find('.title');
        let templateLoader = `
            <div class="loaderCmt">
                <svg class="sr-only">
                    <defs>
                        <clipPath id="placeholder">
                            <path d="M50 25h160v8H50v-8zm0-18h420v8H50V7zM20 40C8.954 40 0 31.046 0 20S8.954 0 20 0s20 8.954 20 20-8.954 20-20 20z"></path>
                        </clipPath>
                    </defs>
                </svg>
        `;
        for (let l = 0; l < 4; l++) {
            templateLoader += `
                <div class="er_ex null">
                    <div class="ComponentPlaceholder er_et" style="height: 40px;"></div>
                </div>`;
        }
        $contentReact.append(templateLoader + '</div>');
        showPopup();
        let template = `
            <div data-media-type="${self.getCollectionComments().media.mediaType.singular}"
                            data-media-id="${self.getCollectionComments().media.id}"
                            class="displayFlex flexDirectionColumn"
                            style="margin-top: 2px; min-height: 0">`;
        if (UsBetaSeries.userIdentified()) {
            template += `<button type="button" class="btn-reset btnSubscribe" style="position: absolute; top: 3px; right: 31px; padding: 8px;">
                <span class="svgContainer">
                    <svg></svg>
                </span>
            </button>`;
        }
        template += '<div class="comments overflowYScroll">' + CommentBS.getTemplateComment(this);
        // Récupération des réponses sur l'API
        // On ajoute les réponses, par ordre décroissant à la template
        if (this.nbReplies > 0 && this.replies.length <= 0) {
            await this.fetchReplies();
        }
        for (let r = 0; r < this.replies.length; r++) {
            template += CommentBS.getTemplateComment(this.replies[r]);
        }
        template += '</div>';
        if (this.getCollectionComments().isOpen() && UsBetaSeries.userIdentified()) {
            template += CommentBS.getTemplateWriting(self);
        }
        template += '</div>';
        // On définit le type d'affichage de la popup
        $popup.attr('data-popin-type', 'comments');
        $contentReact.fadeOut('fast', () => {
            $contentReact.find('.loaderCmt').remove();
            // On affiche le titre de la popup
            // avec des boutons pour naviguer
            $contentReact.empty().append(`<div class="title" id="dialog-title" tabindex="0"></div>`);
            $title = $contentReact.find('.title');
            let nav = '';
            if (!self._parent.isFirst(self.id)) {
                nav += ' <i class="fa-solid fa-circle-chevron-left prev-comment" aria-hidden="true" title="Commentaire précédent"></i>';
            }
            if (!self._parent.isLast(self.id)) {
                nav += '  <i class="fa-solid fa-circle-chevron-right next-comment" aria-hidden="true" title="Commentaire suivant"></i>';
            }
            $title.append(UsBetaSeries.trans("blog.title.comments") + nav);
            // On ajoute les templates HTML du commentaire,
            // des réponses et du formulaire de d'écriture
            $contentReact.append(template);
            $contentReact.fadeIn();
            // On active les boutons de l'affichage du commentaire
            self.loadEvents($contentReact, { hidePopup, showPopup });
            self._callListeners(EventTypes.SHOW);
        });
    }
    /**
     * Envoie une réponse de ce commentaire à l'API
     * @param   {string} text        Le texte de la réponse
     * @returns {Promise<(void | CommentBS)>}
     */
    sendReply(text) {
        const self = this;
        const params = {
            type: this.getCollectionComments().media.mediaType.singular,
            id: this.getCollectionComments().media.id,
            in_reply_to: this.inner_id,
            text: text
        };
        return UsBetaSeries.callApi(HTTP_VERBS.POST, 'comments', 'comment', params)
            .then((data) => {
            const comment = new CommentBS(data.comment, self);
            const method = self.getCollectionComments().order === OrderComments.DESC ? Array.prototype.unshift : Array.prototype.push;
            method.call(self.replies, comment);
            self.nbReplies++;
            self.getCollectionComments().nbComments++;
            self.getCollectionComments().is_subscribed = true;
            return comment;
        })
            .catch(err => {
            UsBetaSeries.notification('Commentaire', "Erreur durant l'ajout d'un commentaire");
            console.error(err);
        });
    }
}

var StarTypes;
(function (StarTypes) {
    StarTypes["EMPTY"] = "empty";
    StarTypes["HALF"] = "half";
    StarTypes["FULL"] = "full";
    StarTypes["DISABLE"] = "disable";
})(StarTypes || (StarTypes = {}));
class Note {
    static logger = new UsBetaSeries.setDebug('Note');
    static debug = Note.logger.debug.bind(Note.logger);
    /**
     * Nombre de votes
     * @type {number}
     */
    total;
    /**
     * Note moyenne du média
     * @type {number}
     */
    mean;
    /**
     * Note du membre connecté
     * @type {number}
     */
    user;
    /**
     * Media de référence
     * @type {Base}
     */
    _parent;
    __initial;
    __changes = {};
    constructor(data, parent) {
        this.__initial = true;
        this._parent = parent ? parent : null;
        return this.fill(data);
    }
    fill(data) {
        const self = this;
        const fnTransform = {
            total: parseInt,
            user: parseInt,
            mean: parseFloat
        };
        for (const propKey of Object.keys(fnTransform)) {
            if (self.__initial) {
                const descriptor = {
                    configurable: true,
                    enumerable: true,
                    get: () => {
                        return self['_' + propKey];
                    },
                    set: (newValue) => {
                        const oldValue = self['_' + propKey];
                        if (oldValue === newValue)
                            return;
                        self['_' + propKey] = newValue;
                        if (!self.__initial) {
                            self.__changes[propKey] = { oldValue, newValue };
                            if (self._parent)
                                self._parent.updatePropRenderObjNote();
                        }
                    }
                };
                Object.defineProperty(this, propKey, descriptor);
            }
            const value = fnTransform[propKey](data[propKey]);
            Reflect.set(this, propKey, value);
        }
        this.__initial = false;
        return this;
    }
    get parent() {
        return this._parent;
    }
    set parent(parent) {
        if (!(parent instanceof MediaBase)) {
            throw new TypeError('Parameter "parent" must be an instance of MediaBase');
        }
        this._parent = parent;
    }
    /**
     * Retourne la note moyenne sous forme de pourcentage
     * @returns {number} La note sous forme de pourcentage
     */
    getPercentage() {
        return Math.round(((this.mean / 5) * 100) / 10) * 10;
    }
    /**
     * Retourne l'objet Note sous forme de chaine
     * @returns {string}
     */
    toString() {
        let locale = 'fr-FR';
        if (UsBetaSeries.member) {
            locale = UsBetaSeries.member.locale;
        }
        const votes = 'vote' + (this.total > 1 ? 's' : ''), 
        // On met en forme le nombre de votes
        total = new Intl.NumberFormat(locale, { style: 'decimal', useGrouping: true }).format(this.total), 
        // On limite le nombre de chiffre après la virgule
        note = this.mean.toFixed(2);
        let toString = `${total} ${votes} : ${note} / 5`;
        // On ajoute la note du membre connecté, si il a voté
        if (UsBetaSeries.userIdentified() && this.user > 0) {
            toString += `, votre note: ${this.user}`;
        }
        return toString;
    }
    /**
     * Retourne l'objet sous forme d'objet simple, sans référence circulaire,
     * pour la méthode JSON.stringify
     * @returns {object}
     */
    toJSON() {
        return {
            total: this.total,
            mean: this.mean,
            user: this.user
        };
    }
    /**
     * Crée une popup avec 5 étoiles pour noter le média
     * @param {Callback} cb - Fonction callback
     */
    createPopupForVote(cb = UsBetaSeries.noop) {
        Note.debug('objNote createPopupForVote');
        // La popup et ses éléments
        const self = this, $popup = jQuery('#popin-dialog'), $contentHtmlElement = $popup.find(".popin-content-html"), $contentReact = $popup.find('.popin-content-reactmodule'), $closeButtons = $popup.find(".js-close-popupalert"), hidePopup = () => {
            Note.debug('objNote createPopupForVote hidePopup');
            $popup.attr('aria-hidden', 'true');
            $contentHtmlElement.find(".button-set").show();
            $contentHtmlElement.hide();
            // On désactive les events
            $text.find('.star-svg').off('mouseenter').off('mouseleave').off('click');
        }, showPopup = () => {
            Note.debug('objNote createPopupForVote showPopup');
            $contentHtmlElement.find(".button-set").hide();
            $contentHtmlElement.show();
            $contentReact.hide();
            $closeButtons.show();
            $popup.attr('aria-hidden', 'false');
        };
        let $text = $popup.find("p"), $title = $contentHtmlElement.find(".title");
        // On vérifie que la popup est masquée
        hidePopup();
        // Ajouter les étoiles
        let template = '<div style="display: flex; justify-content: center; margin-bottom: 15px;"><div role="button" tabindex="0" class="stars btn-reset">', className;
        for (let i = 1; i <= 5; i++) {
            className = this.user <= i - 1 ? StarTypes.EMPTY : StarTypes.FULL;
            template += `
                <svg viewBox="0 0 100 100" class="star-svg" data-number="${i}" style="width: 30px; height: 30px;">
                    <use xlink:href="#icon-starblue-${className}"></use>
                </svg>`;
        }
        if ($text.length <= 0) {
            $contentHtmlElement.replaceWith(`
                <div class="popin-content-html">
                    <div class="title" id="dialog-title" tabindex="0"></div>
                    <div class="popin-content-ajax">
                        <p></p>
                    </div>
                </div>`);
            $text = $contentHtmlElement.find('p');
            $title = $contentHtmlElement.find(".title");
        }
        // On vide la popup et on ajoute les étoiles
        $text.empty().append(template + '</div></div>');
        let title = 'Noter ';
        switch (this._parent.mediaType.singular) {
            case MediaType.show:
                title += 'la série';
                break;
            case MediaType.movie:
                title += 'le film';
                break;
            case MediaType.episode:
                title += "l'épisode";
                break;
            default:
                break;
        }
        $title.empty().text(title);
        $closeButtons.click(() => {
            hidePopup();
            $popup.removeAttr('data-popin-type');
        });
        // On ajoute les events sur les étoiles
        const updateStars = function (evt, note) {
            const $stars = jQuery(evt.currentTarget).parent().find('.star-svg use');
            let className;
            for (let s = 0; s < 5; s++) {
                className = (s <= note - 1) ? StarTypes.FULL : StarTypes.EMPTY;
                $($stars.get(s)).attr('xlink:href', `#icon-starblue-${className}`);
            }
        };
        const $stars = $text.find('.star-svg');
        $stars.mouseenter((e) => {
            const note = parseInt($(e.currentTarget).data('number'), 10);
            updateStars(e, note);
        });
        $stars.mouseleave((e) => {
            updateStars(e, self.user);
        });
        $stars.click((e) => {
            const note = parseInt(jQuery(e.currentTarget).data('number'), 10), $stars = jQuery(e.currentTarget).parent().find('.star-svg');
            // On supprime les events
            $stars.off('mouseenter').off('mouseleave');
            self._parent.addVote(note)
                .then((result) => {
                hidePopup();
                if (result) {
                    // TODO: Mettre à jour la note du média
                    self._parent.changeTitleNote();
                    self._parent._callListeners(EventTypes.NOTE);
                    if (cb)
                        cb.call(self);
                }
                else {
                    UsBetaSeries.notification('Erreur Vote', "Une erreur s'est produite durant le vote");
                }
            })
                .catch(() => hidePopup());
        });
        // On affiche la popup
        showPopup();
    }
    /**
     * Retourne le type d'étoile en fonction de la note et de l'indice
     * de comparaison
     * @param  {number} note   La note du media
     * @param  {number} indice L'indice de comparaison
     * @return {string}        Le type d'étoile
     */
    static getTypeSvg(note, indice) {
        let typeSvg = StarTypes.EMPTY;
        if (note <= indice) {
            typeSvg = StarTypes.EMPTY;
        }
        else if (note < indice + 1) {
            if (note > indice + 0.25) {
                typeSvg = StarTypes.HALF;
            }
            else if (note > indice + 0.75) {
                typeSvg = StarTypes.FULL;
            }
        }
        else {
            typeSvg = StarTypes.FULL;
        }
        return typeSvg;
    }
    /**
     * Met à jour l'affichage de la note
     * @param   {JQuery<HTMLElement>} [$elt] - Element HTML contenant les étoiles représentant la note
     * @returns {Note}
     */
    updateStars($elt) {
        $elt = $elt || jQuery('.blockInformations__metadatas .js-render-stars', this._parent.elt);
        if (!$elt || $elt.length <= 0)
            return this;
        let color = '';
        const $stars = jQuery('.star-svg use', $elt);
        const result = $($stars.get(0)).attr('xlink:href').match(/(grey|blue)/);
        if (result) {
            color = result[0];
        }
        for (let s = 0; s < 5; s++) {
            const className = Note.getTypeSvg(this.mean, s);
            $($stars.get(s)).attr('xlink:href', `#icon-star${color}-${className}`);
        }
        return this;
    }
    /**
     * Met à jour l'attribut title de l'élément HTML représentant la note
     * @param   {JQuery<HTMLElement>} [$elt] - Element HTML contenant les étoiles représentant la note
     * @returns {Note}
     */
    updateAttrTitle($elt) {
        $elt = $elt || jQuery('.blockInformations__metadatas .js-render-stars', this._parent.elt);
        if (!$elt || $elt.length <= 0)
            return this;
        if (this.mean <= 0 || this.total <= 0) {
            $elt.attr('title', 'Aucun vote');
            return this;
        }
        $elt.attr('title', this.toString());
        return this;
    }
    /**
     * Retourne la template pour l'affichage d'une note sous forme d'étoiles
     * @param   {number} [note=0] - La note à afficher
     * @param   {string} [color] - La couleur des étoiles
     * @returns {string}
     */
    static renderStars(note = 0, color = '') {
        let typeSvg, template = '';
        if (note == 0) {
            color = 'grey';
        }
        for (let s = 0; s < 5; s++) {
            typeSvg = Note.getTypeSvg(note, s);
            template += `
                <svg viewBox="0 0 100 100" class="star-svg">
                    <use xmlns:xlink="http://www.w3.org/1999/xlink"
                        xlink:href="#icon-star${color}-${typeSvg}">
                    </use>
                </svg>
            `;
        }
        return template;
    }
}

/**
 * Next
 * @class
 * @memberof User
 */
class Next {
    id;
    code;
    date;
    title;
    image;
    constructor(data) {
        this.id = (data.id != undefined) ? parseInt(data.id, 10) : NaN;
        this.code = data.code;
        this.date = new Date(data.date) || null;
        this.title = data.title;
        this.image = data.image;
    }
}
/**
 * User
 * @class
 * @extends RenderHtml
 */
class User extends RenderHtml {
    static logger = new UsBetaSeries.setDebug('User');
    static debug = User.logger.debug.bind(User.logger);
    /**
     * Objet contenant les relations entre les données de l'API BS et la classe User
     * @type {Record<string, RelatedProp>}
     * @static
     */
    static relatedProps = {
        archived: { key: "archived", type: 'boolean', default: false },
        downloaded: { key: "downloaded", type: 'boolean', default: false },
        favorited: { key: "favorited", type: 'boolean', default: false },
        friends_want_to_watch: { key: "friends_want_to_watch", type: 'array', default: [] },
        friends_watching: { key: "friends_watched", type: 'array', default: [] },
        hidden: { key: "hidden", type: 'boolean', default: false },
        last: { key: 'last', type: 'string', default: '' },
        mail: { key: "mail", type: 'boolean', default: false },
        next: { key: "next", type: Next },
        profile: { key: 'profile', type: 'string', default: '' },
        remaining: { key: "remaining", type: 'number', default: 0 },
        seen: { key: "seen", type: 'boolean', default: false },
        status: { key: "status", type: 'number', default: 0 },
        tags: { key: 'tags', type: 'string', default: '' },
        twitter: { key: "twitter", type: 'boolean', default: false }
    };
    static selectorsCSS = {};
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
    /**
     * Constructeur de la classe User
     * @param   {Obj} data - Les données de l'objet
     * @returns {User}
     */
    constructor(data) {
        super(data, null);
        return this.fill(data)._initRender();
    }
    /**
     * Initialise le rendu HTML de la saison
     * @returns {User}
     */
    _initRender() {
        return this;
    }
}

var MediaType;
(function (MediaType) {
    MediaType["show"] = "show";
    MediaType["movie"] = "movie";
    MediaType["episode"] = "episode";
})(MediaType = MediaType || (MediaType = {}));
class MediaBase extends RenderHtml {
    static logger = new UsBetaSeries.setDebug('Media');
    static debug = MediaBase.logger.debug.bind(MediaBase.logger);
    /*
                    PROPERTIES
    */
    /** @type {string} */
    description;
    /** @type {number} */
    nbComments;
    /** @type {number} */
    id;
    /** @type {Note} */
    objNote;
    /** @type {string} */
    resource_url;
    /** @type {string} */
    title;
    /** @type {User} */
    user;
    /** @type {Array<Character>} */
    characters;
    /** @type {CommentsBS} */
    comments;
    /** @type {MediaTypes} */
    mediaType;
    constructor(data, elt) {
        super(data, elt);
        this.characters = [];
        this.__props = ['characters', 'comments', 'mediaType'];
        return this;
    }
    /**
     * Initialisation du rendu HTML
     * @returns {MediaBase}
     */
    _initRender() {
        if (!this.elt)
            return this;
        // MediaBase.debug('Base._initRender', this);
        this.objNote
            .updateAttrTitle()
            .updateStars();
        this.decodeTitle();
        return this;
    }
    /**
     * Met à jour les informations de la note du média sur la page Web
     */
    updatePropRenderObjNote() {
        if (!this.elt)
            return;
        MediaBase.debug('updatePropRenderObjNote');
        this.objNote
            .updateStars()
            .updateAttrTitle();
        this._callListeners(EventTypes.NOTE);
        delete this.__changes.objNote;
    }
    /**
     * Met à jour le titre du média sur la page Web
     */
    updatePropRenderTitle() {
        if (!this.elt)
            return;
        const $title = jQuery(this.constructor.selectorsCSS.title);
        if (/&#/.test(this.title)) {
            $title.text($('<textarea />').html(this.title).text());
        }
        else {
            $title.text(this.title);
        }
        delete this.__changes.title;
    }
    /**
     * Méthode d'initialisation de l'objet
     * @returns {Promise<MediaBase>}
     */
    init() {
        if (this.elt) {
            this.comments = new CommentsBS(this.nbComments, this);
        }
        this.save();
        return new Promise(resolve => resolve(this));
    }
    /**
     * Sauvegarde l'objet en cache
     * @return {MediaBase} L'instance du média
     */
    save() {
        if (UsBetaSeries.cache instanceof CacheUS) {
            UsBetaSeries.cache.set(this.mediaType.plural, this.id, this);
            this._callListeners(EventTypes.SAVE);
        }
        return this;
    }
    /**
     * Retourne le nombre d'acteurs référencés dans ce média
     * @returns {number}
     */
    get nbCharacters() {
        return this.characters.length;
    }
    /**
     * Décode le titre de la page
     * @return {Base} L'instance du média
     */
    decodeTitle() {
        if (!this.elt)
            return this;
        let $elt = jQuery('.blockInformations__title', this.elt);
        if (this.constructor.selectorsCSS.title) {
            $elt = jQuery(this.constructor.selectorsCSS.title);
        }
        const title = $elt.text();
        if (/&#/.test(title)) {
            $elt.text($('<textarea />').html(title).text());
        }
        return this;
    }
    /**
     * Ajoute le nombre de votes, à la note du média, dans l'attribut title de la balise
     * contenant la représentation de la note du média
     *
     * @return {void}
     */
    changeTitleNote() {
        if (!this.elt)
            return;
        const $elt = jQuery('.js-render-stars', this.elt);
        if (this.objNote.mean <= 0 || this.objNote.total <= 0) {
            $elt.attr('title', 'Aucun vote');
            return;
        }
        $elt.attr('title', this.objNote.toString());
    }
    /**
     * Ajoute le vote du membre connecté pour le média
     * @param   {number} note - Note du membre connecté pour le média
     * @returns {Promise<boolean>}
     */
    addVote(note) {
        const self = this;
        // return new Promise((resolve, reject) => {
        return UsBetaSeries.callApi(HTTP_VERBS.POST, this.mediaType.plural, 'note', { id: this.id, note: note })
            .then((data) => {
            self.fill(data[this.mediaType.singular]);
            return this.objNote.user == note;
        })
            .catch(err => {
            UsBetaSeries.notification('Erreur de vote', 'Une erreur s\'est produite lors de l\'envoi de la note: ' + err);
            return false;
        });
        // });
    }
    /**
     * *fetchCharacters* - Récupère les acteurs du média
     * @abstract
     * @returns {Promise<MediaBase>}
     */
    fetchCharacters() {
        throw new Error('Method abstract');
    }
    /**
     * *getCharacter* - Retourne un personnage à partir de son identifiant
     * @param   {number} id - Identifiant de l'actor
     * @returns {Character | null}
     */
    getCharacter(id) {
        for (const actor of this.characters) {
            if (actor.person_id === id)
                return actor;
        }
        return null;
    }
}
class Media extends MediaBase {
    /***************************************************/
    /*                      STATIC                     */
    /***************************************************/
    static propsAllowedOverride = {};
    static overrideType;
    static selectorsCSS = {
        genres: '.blockInformations .blockInformations__details li:nth-child(#n#) span',
        duration: '.blockInformations .blockInformations__details li:nth-child(#n#) span'
    };
    /**
     * Méthode static servant à récupérer un média sur l'API BS
     * @param  {Obj} params - Critères de recherche du média
     * @param  {boolean} [force=false] - Indique si on utilise le cache ou non
     * @return {Promise<Show>}
     * @protected
     * @abstract
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static _fetch(params, force) {
        throw new Error("Abstract Static Method");
    }
    /**
     * Methode static servant à récupérer un média par son identifiant IMDB
     * @param  {number} id - L'identifiant IMDB du média
     * @param  {boolean} [force=false] - Indique si on utilise le cache ou non
     * @return {Promise<Media>}
     */
    static fetchByImdb(id, force = false) {
        return this._fetch({ imdb_id: id }, force);
    }
    /***************************************************/
    /*                  PROPERTIES                     */
    /***************************************************/
    /**
     * Nombre de membres ayant ce média sur leur compte
     * @type {number}
     */
    followers;
    /**
     * Les genres attribués à ce média
     * @type {string[]}
     */
    genres;
    /**
     * Identifiant IMDB
     * @type {string}
     */
    imdb_id;
    /**
     * Langue originale du média
     * @type {string}
     */
    language;
    /**
     * Durée du média en minutes
     * @type {number}
     */
    duration;
    /**
     * Titre original du média
     * @type {string}
     */
    original_title;
    /**
     * Tableau des médias similaires
     * @type {Similar[]}
     */
    similars;
    /**
     * Nombre de médias similaires
     * @type {number}
     */
    nbSimilars;
    /**
     * Indique si le média se trouve sur le compte du membre connecté
     * @type {boolean}
     */
    in_account;
    /**
     * Identifiant du média servant pour l'URL
     * @type {string}
     */
    slug;
    __fetches;
    /**
     * Constructeur de la classe Media
     * Le DOMElement est nécessaire que pour le média principal sur la page Web
     * @param   {Obj} data - Les données du média
     * @param   {JQuery<HTMLElement>} [element] - Le DOMElement de référence du média
     * @returns {Media}
     */
    constructor(data, element) {
        super(data);
        if (element)
            this.elt = element;
        this.__fetches = {};
        this.similars = [];
        this.genres = [];
        return this;
    }
    /**
     * Initialise l'objet lors de sa construction et après son remplissage
     * @returns {Promise<Media>}
     */
    init() {
        if (this.elt) {
            return super.init().then(() => {
                this._overrideProps();
                return this;
            });
        }
        return super.init();
    }
    updatePropRenderGenres() {
        const $genres = jQuery(Media.selectorsCSS.genres);
        if ($genres.length > 0) {
            $genres.text(this.genres.join(', '));
        }
        delete this.__changes.genres;
    }
    /**
     * Retourne les similars associés au media
     * @return {Promise<Media>}
     */
    fetchSimilars() {
        return new Promise(resolve => resolve(this));
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
    /**
     * override - Permet de surcharger des propriétés de l'objet, parmis celles autorisées,
     * et de stocker les nouvelles valeurs
     * @see Show.propsAllowedOverride
     * @param   {string} prop - Nom de la propriété à modifier
     * @param   {string} value - Nouvelle valeur de la propriété
     * @param   {object} [params] - Optional: paramètres à fournir pour modifier le path de la propriété
     * @returns {Promise<boolean>}
     */
    async override(prop, value, params) {
        const type = this.constructor;
        if (type.propsAllowedOverride[prop]) {
            const override = await UsBetaSeries.gm_funcs.getValue('override', { shows: {}, movies: {} });
            if (override[type.overrideType][this.id] === undefined)
                override[type.overrideType][this.id] = {};
            override[type.overrideType][this.id][prop] = value;
            let path = type.propsAllowedOverride[prop].path;
            if (type.propsAllowedOverride[prop].params) {
                override[type.overrideType][this.id][prop] = { value, params };
                path = UsBetaSeries.replaceParams(path, type.propsAllowedOverride[prop].params, params);
                MediaBase.debug('override', { prop, value, params, path });
            }
            UsBetaSeries.setPropValue(this, path, value);
            await UsBetaSeries.gm_funcs.setValue('override', override);
            return true;
        }
        return false;
    }
    /**
     * _overrideProps - Permet de restaurer les valeurs personalisées dans l'objet
     * @see Show.propsAllowedOverride
     * @private
     * @returns {Promise<Media>}
     */
    async _overrideProps() {
        const type = this.constructor;
        const overrideType = type.overrideType;
        const override = await UsBetaSeries.gm_funcs.getValue('override', { shows: {}, movies: {} });
        MediaBase.debug('_overrideProps override', override);
        if (Reflect.has(override[overrideType], this.id)) {
            MediaBase.debug('_overrideProps override found', override[overrideType][this.id]);
            for (const prop in override[overrideType][this.id]) {
                let path = type.propsAllowedOverride[prop].path;
                let value = override[overrideType][this.id][prop];
                if (type.propsAllowedOverride[prop].params && typeof override[overrideType][this.id][prop] === 'object') {
                    value = override[overrideType][this.id][prop].value;
                    const params = override[overrideType][this.id][prop].params;
                    path = UsBetaSeries.replaceParams(path, type.propsAllowedOverride[prop].params, params);
                }
                MediaBase.debug('_overrideProps prop[%s]', prop, { path, value });
                UsBetaSeries.setPropValue(this, path, value);
            }
        }
        return this;
    }
    /**
     * Retourne l'URL de la page de la série à partir de son identifiant tvdb
     * @param   {number} tvdb_id - Identifiant TheTvDB
     * @returns {Promise<string>}
     */
    _getTvdbUrl(tvdb_id) {
        const proxy = UsBetaSeries.serverBaseUrl + '/proxy/';
        const initFetch = {
            method: 'GET',
            headers: {
                'origin': 'https://www.betaseries.com',
                'x-requested-with': '',
                'Accept': 'application/json'
            },
            mode: 'cors',
            cache: 'no-cache'
        };
        return new Promise((res, rej) => {
            fetch(`${proxy}?tab=series&id=${tvdb_id}`, initFetch)
                .then(res => {
                MediaBase.debug('_getTvdbUrl response', res);
                if (res.ok) {
                    return res.json();
                }
                return rej();
            }).then(data => {
                MediaBase.debug('_getTvdbUrl data', data);
                if (data) {
                    res(data.url);
                }
                else {
                    rej();
                }
            });
        });
    }
}

/**
 * Classe représentant les différentes images d'une série
 * @class
 * @memberof Show
 */
class Images {
    /**
     * Les formats des images
     * @static
     * @type {object}
     */
    static formats = {
        poster: 'poster',
        wide: 'wide'
    };
    /**
     * Contructeur
     * @param {Obj} data - Les données de l'objet
     */
    constructor(data) {
        this.show = data.show;
        this.banner = data.banner;
        this.box = data.box;
        this.poster = data.poster;
        this._local = {
            show: this.show,
            banner: this.banner,
            box: this.box,
            poster: this.poster
        };
    }
    /** @type {string} */
    show;
    /** @type {string} */
    banner;
    /** @type {string} */
    box;
    /** @type {string} */
    poster;
    /** @type {object} */
    _local;
}
/**
 * Picked
 * @memberof Show
 * @enum {number}
 * @alias Picked
 */
var Picked;
(function (Picked) {
    Picked[Picked["none"] = 0] = "none";
    Picked[Picked["banner"] = 1] = "banner";
    Picked[Picked["show"] = 2] = "show";
})(Picked = Picked || (Picked = {}));
/**
 * Classe représentant une image
 * @class
 * @memberof Show
 */
class Picture {
    /**
     * Contructeur
     * @param {Obj} data - Les données de l'objet
     */
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
    /** @type {number} */
    id;
    /** @type {number} */
    show_id;
    /** @type {number} */
    login_id;
    /** @type {string} */
    url;
    /** @type {number} */
    width;
    /** @type {number} */
    height;
    /** @type {Date} */
    date;
    /** @type {Picked} */
    picked;
}
/**
 * Classe représentant une plateforme de diffusion
 * @class
 * @memberof Show
 */
class Platform {
    /**
     * Contructeur
     * @param {Obj} data - Les données de l'objet
     */
    constructor(data) {
        this.id = parseInt(data.id, 10);
        this.name = data.name;
        this.tag = data.tag;
        this.link_url = data.link_url;
        this.available = data.available;
        this.logo = data.logo;
        this.partner = !data.partner || false;
    }
    /**
     * Identifiant de la plateforme
     * @type {number}
     */
    id;
    /**
     * Nom de la plateforme
     * @type {string}
     */
    name;
    /** @type {string} */
    tag;
    /**
     * Lien URL d'accès au média sur la plateforme
     * @type {string}
     */
    link_url;
    /** @type {object} */
    available;
    /**
     * URL du logo de la plateforme
     * @type {string}
     */
    logo;
    /**
     * Flag de partenariat avec la plateforme
     * @type {boolean}
     */
    partner;
}
/**
 * Classe représentant les différentes plateformes de diffusion
 * sous deux types de plateformes
 * @class
 * @memberof Show
 */
class PlatformList {
    /** @type {Array<Platform>} */
    svod;
    /** @type {Array<Platform>} */
    vod;
    /** @type {string} */
    country;
    /**
     * Les types de plateformes
     * @type {Obj}
     * @static
     */
    static types = {
        svod: 'svod',
        vod: 'vod'
    };
    /**
     * fetchPlatforms - Récupère la liste des plateformes sur l'API
     * @static
     * @param  {string}                [country = 'us'] - Le pays concerné par les plateformes
     * @return {Promise<PlatformList>}                    L'objet contenant les différentes plateformes
     */
    static fetchPlatforms(country = 'us') {
        return new Promise((resolve, reject) => {
            UsBetaSeries.callApi(HTTP_VERBS.GET, 'platforms', 'list', { country })
                .then((data) => {
                resolve(new PlatformList(data.platforms, country));
            })
                .catch(err => reject(err));
        });
    }
    /**
     * Contructeur
     * @param {Obj}     data -      Les données de l'objet
     * @param {string}  country -   Le pays correspondant aux plateformes
     */
    constructor(data, country = 'fr') {
        if (data.svod) {
            this.svod = [];
            for (let s = 0; s < data.svod.length; s++) {
                this.svod.push(new Platform(data.svod[s]));
            }
            this.svod.sort(function (a, b) {
                if (a.name < b.name)
                    return -1;
                else if (a.name > b.name)
                    return 1;
                else
                    return 0;
            });
        }
        if (data.vod) {
            this.vod = [];
            for (let v = 0; v < data.vod.length; v++) {
                this.vod.push(new Platform(data.vod[v]));
            }
            this.vod.sort(function (a, b) {
                if (a.name < b.name)
                    return -1;
                else if (a.name > b.name)
                    return 1;
                else
                    return 0;
            });
        }
        this.country = country;
    }
    /**
     * Retourne les plateformes sous forme d'éléments HTML Option
     * @param  {string}           [type = 'svod'] -     Le type de plateformes souhaité
     * @param  {Array<number>}    [exclude = null] -    Les identifiants des plateformes à exclure
     * @return {string}                                 Les options sous forme de chaîne
     */
    renderHtmlOptions(type = 'svod', exclude = null) {
        let options = '';
        if (type === PlatformList.types.svod) {
            const svod = this.svod.filter(elt => {
                return exclude.indexOf(elt.id) === -1;
            });
            for (let s = 0; s < svod.length; s++) {
                options += `<option value="${svod[s].id}" data-src="${svod[s].logo}">${svod[s].name}</option>`;
            }
        }
        else if (type === PlatformList.types.vod) {
            const vod = this.vod.filter(elt => {
                return exclude.indexOf(elt.id) === -1;
            });
            for (let v = 0; v < vod.length; v++) {
                options += `<option value="${vod[v].id}" data-src="${vod[v].logo}">${vod[v].name}</option>`;
            }
        }
        return options;
    }
}
/**
 * Classe représentant les différentes plateformes de diffusion d'un média
 * @class
 * @memberof Show
 */
class Platforms {
    /**
     * Contructeur
     * @param {Obj} data - Les données de l'objet
     */
    constructor(data) {
        this.svods = [];
        if (data?.svods && data?.svods instanceof Array) {
            for (let s = 0; s < data.svods.length; s++) {
                this.svods.push(new Platform(data.svods[s]));
            }
        }
        if (data?.svod) {
            this.svod = new Platform(data.svod);
        }
        this.vod = [];
        if (data?.vod && data?.vod instanceof Array) {
            for (let v = 0; v < data.vod.length; v++) {
                this.vod.push(new Platform(data.vod[v]));
            }
        }
    }
    /** @type {Array<Platform>} */
    svods;
    /** @type {Platform} */
    svod;
    /** @type {Array<Platform>} */
    vod;
}
/**
 * Class représentant un ShowRunner
 * @class
 * @memberof Show
 */
class Showrunner {
    /**
     * Contructeur
     * @param {Obj} data - Les données de l'objet
     */
    constructor(data) {
        this.id = data.id ? parseInt(data.id, 10) : null;
        this.name = data.name;
        this.picture = data.picture;
    }
    /** @type {number} */
    id;
    /** @type {string} */
    name;
    /** @type {string} */
    picture;
}
/**
 * Class representing a Show
 * @class
 * @extends Media
 * @implements {implShow}
 * @implements {implAddNote}
 */
class Show extends Media {
    /***************************************************/
    /*                      STATIC                     */
    /***************************************************/
    static logger = new UsBetaSeries.setDebug('Media:Show');
    static debug = Show.logger.debug.bind(Show.logger);
    /**
     * Types d'évenements gérés par cette classe
     * @type {Array}
     * @static
     */
    static EventTypes = [
        EventTypes.UPDATE,
        EventTypes.SAVE,
        EventTypes.ADD,
        EventTypes.ADDED,
        EventTypes.REMOVE,
        EventTypes.NOTE,
        EventTypes.ARCHIVE,
        EventTypes.UNARCHIVE
    ];
    /**
     * Propriétés pouvant être surchargées
     * @type {object}
     */
    static propsAllowedOverride = {
        poster: { path: 'images.poster' },
        season: { path: 'seasons[#season#].image', params: { season: 'number' } }
    };
    /**
     * Type de surcharge
     * Nécessaire pour la classe parente
     * @static
     * @type {string}
     */
    static overrideType = 'shows';
    /**
     * Les différents sélecteurs CSS des propriétés de l'objet
     * @static
     * @type {Record<string, string>}
     */
    static selectorsCSS = {
        title: '.blockInformations h1.blockInformations__title',
        description: '.blockInformations p.blockInformations__synopsis',
        creation: '.blockInformations .blockInformations__metadatas time',
        followers: '.blockInformations .blockInformations__metadatas span.u-colorWhiteOpacity05.textAlignCenter:nth-of-type(2)',
        nbSeasons: '.blockInformations .blockInformations__metadatas span.u-colorWhiteOpacity05.textAlignCenter:nth-of-type(3)',
        nbEpisodes: '.blockInformations .blockInformations__metadatas span.u-colorWhiteOpacity05.textAlignCenter:nth-of-type(4)',
        country: '.blockInformations .blockInformations__details li:nth-child(#n#) a',
        genres: '.blockInformations .blockInformations__details li:nth-child(#n#) span',
        duration: '.blockInformations .blockInformations__details li:nth-child(#n#) span',
        status: '.blockInformations .blockInformations__details li:nth-child(#n#) span',
        network: '.blockInformations .blockInformations__details li:nth-child(#n#) span',
        showrunner: '.blockInformations .blockInformations__details li:nth-child(#n#) span',
        /*rating: '#rating',
        seasons: '#seasons',
        episodes: '#episodes',
        comments: '#comments',
        characters: '#actors',
        similars: '#similars'*/
    };
    /**
     * Objet contenant les informations de relations entre les propriétés des objets de l'API
     * et les proriétés de cette classe.
     * Sert à la construction de l'objet
     * @static
     * @type {Record<string, RelatedProp>}
     */
    static relatedProps = {
        // data: Obj => object: Show
        aliases: { key: "aliases", type: 'object', default: {} },
        comments: { key: "nbComments", type: 'number', default: 0 },
        country: { key: "country", type: 'string', default: '' },
        creation: { key: "creation", type: 'number', default: 0 },
        description: { key: "description", type: 'string', default: '' },
        episodes: { key: "nbEpisodes", type: 'number', default: 0 },
        followers: { key: "followers", type: 'number', default: 0 },
        genres: { key: "genres", type: 'array', transform: objToArr, default: [] },
        id: { key: "id", type: 'number' },
        images: { key: "images", type: Images },
        imdb_id: { key: "imdb_id", type: 'string', default: '' },
        in_account: { key: "in_account", type: 'boolean', default: false },
        language: { key: "language", type: 'string', default: '' },
        length: { key: "duration", type: 'number', default: 0 },
        network: { key: "network", type: 'string', default: '' },
        next_trailer: { key: "next_trailer", type: 'string', default: '' },
        next_trailer_host: { key: "next_trailer_host", type: 'string', default: '' },
        notes: { key: "objNote", type: Note },
        original_title: { key: "original_title", type: 'string', default: '' },
        platforms: { key: "platforms", type: Platforms },
        rating: { key: "rating", type: 'string', default: '' },
        resource_url: { key: "resource_url", type: 'string', default: '' },
        seasons: { key: "nbSeasons", type: 'number', default: 0 },
        seasons_details: { key: "seasons", type: "array", transform: Show.seasonsDetailsToSeasons },
        showrunner: { key: "showrunner", type: Showrunner },
        similars: { key: "nbSimilars", type: 'number', default: 0 },
        slug: { key: 'slug', type: 'string', default: '' },
        social_links: { key: "social_links", type: 'array', default: [] },
        status: { key: "status", type: "string", default: '' },
        thetvdb_id: { key: "thetvdb_id", type: 'number', default: 0 },
        themoviedb_id: { key: "tmdb_id", type: 'number', default: 0 },
        title: { key: "title", type: 'string', default: '' },
        user: { key: "user", type: User }
    };
    /**
     * Fonction statique servant à construire un tableau d'objets Season
     * à partir des données de l'API
     * @static
     * @param   {Show} obj - L'objet Show
     * @param   {Obj} data - Les données provenant de l'API
     * @returns {Array<Season>}
     */
    static seasonsDetailsToSeasons(obj, data) {
        if (!obj.elt)
            return [];
        if (Array.isArray(obj.seasons) && obj.seasons.length === data.length) {
            return obj.seasons;
        }
        const seasons = new Array(data.length);
        for (let s = 0; s < data.length; s++) {
            seasons[data[s].number - 1] = new Season(data[s], obj);
        }
        return seasons;
    }
    /**
     * Méthode static servant à récupérer une série sur l'API BS
     * @static
     * @private
     * @param  {Obj} params - Critères de recherche de la série
     * @param  {boolean} [force=false] - Indique si on utilise le cache ou non
     * @return {Promise<Show>}
     */
    static _fetch(params, force = false) {
        return UsBetaSeries.callApi('GET', 'shows', 'display', params, force)
            .then(data => {
            try {
                const show = new Show(data.show, jQuery('.blockInformations'));
                // Show.debug('Show::_fetch', show);
                return show;
            }
            catch (err) {
                console.error('Show::_fetch', err);
                throw err;
            }
        });
    }
    /**
     * fetchLastSeen - Méthode static retournant les 10 dernières séries vues par le membre
     * @static
     * @param  {number}  [limit = 10]  Le nombre limite de séries retournées
     * @return {Promise<Show>}         Une promesse avec les séries
     */
    static fetchLastSeen(limit = 10) {
        return UsBetaSeries.callApi(HTTP_VERBS.GET, 'shows', 'member', { order: 'last_seen', limit })
            .then((data) => {
            const shows = [];
            for (let s = 0; s < data.shows.length; s++) {
                shows.push(new Show(data.shows[s]));
            }
            return shows;
        });
    }
    /**
     * Méthode static servant à récupérer plusieurs séries sur l'API BS
     * @static
     * @param  {Array<number>} ids - Les identifiants des séries recherchées
     * @return {Promise<Array<Show>>}
     */
    static fetchMulti(ids) {
        return UsBetaSeries.callApi(HTTP_VERBS.GET, 'shows', 'display', { id: ids.join(',') })
            .then((data) => {
            const shows = [];
            if (ids.length > 1) {
                for (let s = 0; s < data.shows.length; s++) {
                    shows.push(new Show(data.shows[s]));
                }
            }
            else {
                shows.push(new Show(data.show));
            }
            return shows;
        });
    }
    /**
     * Methode static servant à récupérer une série par son identifiant BS
     * @static
     * @param  {number} id - L'identifiant de la série
     * @param  {boolean} [force=false] - Indique si on utilise le cache ou non
     * @return {Promise<Show>}
     */
    static fetch(id, force = false) {
        return Show._fetch({ id }, force);
    }
    /**
     * Methode static servant à récupérer une série par son identifiant TheTVDB
     * @static
     * @param  {number} id - L'identifiant TheTVDB de la série
     * @param  {boolean} [force=false] - Indique si on utilise le cache ou non
     * @return {Promise<Show>}
     */
    static fetchByTvdb(id, force = false) {
        return this._fetch({ thetvdb_id: id }, force);
    }
    /**
     * Méthode static servant à récupérer une série par son identifiant URL
     * @static
     * @param   {string} url - Identifiant URL (slug) de la série recherchée
     * @param   {boolean} force - Indique si on doit ignorer les données dans le cache
     * @returns {Promise<Show>}
     */
    static fetchByUrl(url, force = true) {
        return this._fetch({ url: url }, force);
    }
    /***************************************************/
    /*                  PROPERTIES                     */
    /***************************************************/
    /**
     * Contient les alias de la série
     * @type {object}
     */
    aliases;
    /**
     * Année de création de la série
     * @type {string}
     */
    creation;
    /**
     * Pays d'origine de la série
     * @type {string}
     */
    country;
    /**
     * Pointeur vers la saison courante
     * @type {number}
     */
    _currentSeason;
    /**
     * Contient les URLs d'accès aux images de la série
     * @type {Images}
     */
    images;
    /**
     * Indique si la série se trouve dans les séries à voir
     * @type {boolean}
     */
    markToSee;
    /**
     * Nombre total d'épisodes dans la série
     * @type {number}
     */
    nbEpisodes;
    /**
     * Nombre de saisons dans la série
     * @type {number}
     */
    nbSeasons;
    /**
     * Chaîne TV ayant produit la série
     * @type {string}
     */
    network;
    /**
     * @type {string}
     */
    next_trailer;
    /**
     * @type {string}
     */
    next_trailer_host;
    /**
     * Code de classification TV parental
     * @type {string}
     */
    rating;
    /**
     * Tableau des acteurs de la série
     * @type {Person[]}
     */
    persons;
    /**
     * Tableau des images uploadées par les membres
     * @type {Picture[]}
     */
    pictures;
    /**
     * Plateformes de diffusion
     * @type {Platforms}
     */
    platforms;
    /**
     * Tableau des saisons de la série
     * @type {Season[]}
     */
    seasons;
    /**
     * @type {Showrunner}
     */
    showrunner;
    /**
     * Tableau des liens sociaux de la série
     * @type {string[]}
     */
    social_links;
    /**
     * Statut de la série (en cours ou terminée)
     * @type {string}
     */
    status;
    /**
     * Identifiant TheTVDB de la série
     * @type {number}
     */
    thetvdb_id;
    /**
     * Contient les URLs des posters disponibles pour la série
     * @type {object}
     */
    _posters;
    /***************************************************/
    /*                      METHODS                    */
    /***************************************************/
    /**
     * Constructeur de la classe Show
     * @param   {Obj} data - Les données du média
     * @param   {JQuery<HTMLElement>} [element] - Le DOMElement associé au média
     * @returns {Show}
     */
    constructor(data, element) {
        super(data, element);
        this.__fetches = {};
        this._posters = null;
        this.persons = [];
        this.seasons = [];
        this.mediaType = { singular: MediaType.show, plural: 'shows', className: Show };
        return this.fill(data)._initRender();
    }
    /**
     * Initialise l'objet après sa construction et son remplissage
     * @returns {Promise<Show>}
     */
    init() {
        if (this.elt) {
            const promises = [];
            promises.push(this.fetchSeasons().then(() => {
                // On gère l'ajout et la suppression de la série dans le compte utilisateur
                if (this.in_account) {
                    this.deleteShowClick();
                }
                else {
                    this.addShowClick();
                }
                return this;
            }));
            promises.push(this.fetchCharacters());
            promises.push(super.init());
            return Promise.all(promises).then(() => this);
        }
        return super.init();
    }
    /**
     * Initialisation du rendu HTML
     * Sert à définir les sélecteurs CSS et ajouter, si nécessaire, des balises HTML supplémentaires
     * Seulement si la propriété {@link Show.elt} est définie
     * @returns {Show}
     */
    _initRender() {
        if (!this.elt) {
            return this;
        }
        super._initRender();
        // title
        const $title = jQuery(Show.selectorsCSS.title);
        if ($title.length > 0) {
            const title = $title.text();
            $title.empty().append(`<span class="title">${title}</span>`);
            Show.selectorsCSS.title += ' span.title';
        }
        const $details = jQuery('.blockInformations__details li', this.elt);
        for (let d = 0, _len = $details.length; d < _len; d++) {
            const $li = jQuery($details.get(d));
            if ($li.get(0).classList.length <= 0) {
                const title = $li.find('strong').text().trim().toLowerCase();
                switch (title) {
                    case 'pays':
                        Show.selectorsCSS.country = Show.selectorsCSS.country.replace('#n#', (d + 1).toString());
                        break;
                    case 'genres':
                        Media.selectorsCSS.genres = Media.selectorsCSS.genres.replace('#n#', (d + 1).toString());
                        Show.selectorsCSS.genres = Show.selectorsCSS.genres.replace('#n#', (d + 1).toString());
                        break;
                    case 'durée d’un épisode': {
                        Show.selectorsCSS.duration = Show.selectorsCSS.duration.replace('#n#', (d + 1).toString());
                        const $span = jQuery(Show.selectorsCSS.duration);
                        const value = $span.text().trim();
                        const minutes = value.substring(0, value.indexOf(' '));
                        const text = value.substring(value.indexOf(' '));
                        $span.empty().append(`<span class="time">${minutes}</span>${text}`);
                        Show.selectorsCSS.duration += ' span.time';
                        Media.selectorsCSS.duration = Show.selectorsCSS.duration;
                        break;
                    }
                    case 'statut':
                        Show.selectorsCSS.status = Show.selectorsCSS.status.replace('#n#', (d + 1).toString());
                        break;
                    case 'chaîne':
                        Show.selectorsCSS.network = Show.selectorsCSS.network.replace('#n#', (d + 1).toString());
                        break;
                    case 'showrunner':
                        Show.selectorsCSS.showrunner = Show.selectorsCSS.showrunner.replace('#n#', (d + 1).toString());
                        break;
                    default:
                        break;
                }
            }
        }
        return this;
    }
    /**
     * Met à jour le nombre de followers sur la page Web
     */
    updatePropRenderFollowers() {
        const $followers = jQuery(Show.selectorsCSS.followers);
        if ($followers.length > 0) {
            let text = `${this.followers.toString()} membre${this.followers > 1 ? 's' : ''}`;
            $followers.attr('title', text);
            if (this.followers >= 1000) {
                const thousand = Math.round(this.followers / 1000);
                text = `${thousand.toString()}K membres`;
            }
            $followers.text(text);
        }
        delete this.__changes.followers;
    }
    /**
     * Met à jour le nombre de saisons sur la page Web
     */
    updatePropRenderNbSeasons() {
        const $seasons = jQuery(Show.selectorsCSS.nbSeasons);
        if ($seasons.length > 0) {
            $seasons.text(`${this.nbSeasons.toString()} saison${this.nbSeasons > 1 ? 's' : ''}`);
        }
        delete this.__changes.nbSeasons;
    }
    /**
     * Met à jour le nombre d'épisodes sur la page Web
     */
    updatePropRenderNbEpisodes() {
        const $episodes = jQuery(Show.selectorsCSS.nbEpisodes);
        if ($episodes.length > 0) {
            $episodes.text(`${this.nbEpisodes.toString()} épisode${this.nbEpisodes > 1 ? 's' : ''}`);
        }
        delete this.__changes.nbEpisodes;
    }
    /**
     * Met à jour le statut de la série sur la page Web
     */
    updatePropRenderStatus() {
        const $status = jQuery(Show.selectorsCSS.status);
        if ($status.length > 0) {
            let text = 'Terminée';
            if (this.status.toLowerCase() === 'continuing') {
                text = 'En cours';
            }
            $status.text(text);
        }
        delete this.__changes.status;
    }
    /**
     * Met à jour la durée d'un épisode sur la page Web
     */
    updatePropRenderDuration() {
        const $duration = jQuery(Show.selectorsCSS.duration);
        if ($duration.length > 0) {
            $duration.text(this.duration.toString());
        }
    }
    /**
     * Récupère les données de la série sur l'API
     * @param  {boolean} [force=true]   Indique si on utilise les données en cache
     * @return {Promise<Obj>}             Les données de la série
     */
    fetch(force = true) {
        const self = this;
        if (this.__fetches.show)
            return this.__fetches.show;
        this.__fetches.show = UsBetaSeries.callApi('GET', 'shows', 'display', { id: this.id }, force)
            .then((data) => {
            return data;
        }).finally(() => delete self.__fetches.show);
        return this.__fetches.show;
    }
    /**
     * Récupère les saisons de la série
     * @returns {Promise<Show>}
     */
    fetchSeasons() {
        const self = this;
        if (this.__fetches.seasons)
            return this.__fetches.seasons;
        const params = { thetvdb_id: this.thetvdb_id };
        let force = false;
        if (this.thetvdb_id <= 0) {
            delete params.thetvdb_id;
            params.id = this.id;
            force = true;
        }
        this.__fetches.seasons = UsBetaSeries.callApi(HTTP_VERBS.GET, 'shows', 'seasons', params, force)
            .then((data) => {
            if (data?.seasons?.length <= 0) {
                delete self.__fetches.seasons;
                return self;
            }
            if (Array.isArray(self.seasons)) {
                for (let s = 0; s < data.seasons.length; s++) {
                    const seasonNumber = parseInt(data.seasons[s].number, 10);
                    const season = self.seasons[seasonNumber - 1];
                    season.fill(data.seasons[s]);
                }
            }
            else {
                self.seasons = new Array(data.seasons.length);
                for (let s = 0; s < data.seasons.length; s++) {
                    const seasonNumber = parseInt(data.seasons[s].number, 10);
                    self.seasons[seasonNumber - 1] = new Season(data.seasons[s], this);
                }
            }
            delete self.__fetches.seasons;
            return self;
        })
            .catch(err => {
            delete self.__fetches.seasons;
            console.warn('Show.fetchSeasons catch', err);
        })
            .finally(() => delete self.__fetches.seasons);
        return this.__fetches.seasons;
    }
    /**
     * Récupère les personnages de la série
     * @override
     * @returns {Promise<Show>}
     */
    fetchCharacters() {
        const self = this;
        if (this.__fetches.characters)
            return this.__fetches.characters;
        this.__fetches.characters = UsBetaSeries.callApi(HTTP_VERBS.GET, 'shows', 'characters', { thetvdb_id: this.thetvdb_id })
            .then((data) => {
            self.characters = [];
            if (data?.characters?.length <= 0) {
                return self;
            }
            for (let c = 0; c < data.characters.length; c++) {
                self.characters.push(new Character(data.characters[c]));
            }
            return self;
        })
            .catch(err => {
            console.warn('Show.fetchCharacters catch', err);
        })
            .finally(() => delete self.__fetches.characters);
        return this.__fetches.characters;
    }
    /**
     * Retourne le personnage associé au nom d'acteur de la série
     * @param   {String} name - Nom de l'acteur
     * @returns {Character | null}
     */
    getCharacterByName(name) {
        const comp = name.toLocaleLowerCase();
        for (const actor of this.characters) {
            if (actor.actor.toLocaleLowerCase() === comp)
                return actor;
        }
        return null;
    }
    /**
     * Récupère les acteurs sur l'API BetaSeries
     * @returns {Promise<Show>}
     */
    fetchPersons() {
        const self = this;
        if (this.__fetches.persons)
            return this.__fetches.persons;
        this.__fetches.persons = UsBetaSeries.callApi(HTTP_VERBS.GET, 'persons', 'show', { id: this.id })
            .then(data => {
            this.persons = [];
            if (data.persons) {
                for (let p = 0; p < data.persons.length; p++) {
                    self.persons.push(new Person(data.persons[p]));
                }
            }
            delete self.__fetches.persons;
            return self;
        })
            .catch(err => {
            delete self.__fetches.persons;
            console.warn('Show.fetchPersons catch', err);
        })
            .finally(() => delete self.__fetches.persons);
        return this.__fetches.persons;
    }
    /**
     * Récupère les acteurs sur l'API BetaSeries à partir
     * des personnages de la série
     * @async
     * @returns {Promise<Show>}
     */
    async fetchPersonsFromCharacters() {
        const self = this;
        if (this.characters.length <= 0) {
            await this.fetchCharacters();
        }
        const promises = [];
        for (let c = 0; c < self.characters.length; c++) {
            promises.push(Person.fetch(self.characters[c].person_id));
        }
        return Promise.all(promises).then((persons) => {
            for (let p = 0; p < persons.length; p++) {
                if (persons[p])
                    self.persons.push(persons[p]);
            }
            return self;
        });
    }
    /**
     * Retourne un acteur en le cherchant par son nom
     * @param   {String} name - Nom de l'acteur
     * @returns {Person | null}
     */
    getPersonByName(name) {
        const comp = name.toLowerCase();
        for (const actor of this.persons) {
            if (actor.name.toLowerCase() === comp)
                return actor;
        }
        return null;
    }
    /**
     * Retourne un acteur en le cherchant par son ID
     * @param   {number} id - Identifiant de l'acteur
     * @returns {Person | null}
     */
    getPersonById(id) {
        for (const actor of this.persons) {
            if (actor.id === id)
                return actor;
        }
        return null;
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
     * isMarkToSee - Indique si la série se trouve dans les séries à voir
     * @async
     * @returns {boolean}
     */
    async isMarkedToSee() {
        const toSee = await UsBetaSeries.gm_funcs.getValue('toSee', []);
        return !(0, isNull)(toSee[this.id]);
    }
    /**
     * Supprime l'identifant de la liste des séries à voir,
     * si elle y est présente
     * @returns {void}
     */
    async removeFromToSee() {
        const toSee = await UsBetaSeries.gm_funcs.getValue('toSee', []);
        const index = toSee.indexOf(this.id);
        if (index >= 0) {
            toSee.splice(index, 1);
            UsBetaSeries.gm_funcs.setValue('toSee', toSee);
        }
    }
    /**
     * addToAccount - Ajout la série sur le compte du membre connecté
     * @return {Promise<Show>} Promise of show
     */
    addToAccount() {
        const self = this;
        if (this.in_account)
            return new Promise(resolve => resolve(self));
        return new Promise((resolve, reject) => {
            UsBetaSeries.callApi('POST', 'shows', 'show', { id: self.id })
                .then(data => {
                self.fill(data.show);
                self.removeFromToSee();
                self._callListeners(EventTypes.ADD);
                self.save();
                resolve(self);
            }, err => {
                // Si la série est déjà sur le compte du membre
                if (err.code !== undefined && err.code === 2003) {
                    self.update().then((show) => {
                        return resolve(show);
                    });
                }
                reject(err);
            });
        });
    }
    /**
     * Remove Show from account member
     * @return {Promise<Show>} Promise of show
     */
    removeFromAccount() {
        const self = this;
        if (!this.in_account)
            return new Promise(resolve => resolve(self));
        return new Promise((resolve, reject) => {
            UsBetaSeries.callApi('DELETE', 'shows', 'show', { id: self.id })
                .then(data => {
                self.fill(data.show);
                self._callListeners(EventTypes.REMOVE);
                self.save();
                resolve(self);
            }, err => {
                // Si la série n'est plus sur le compte du membre
                if (err.code !== undefined && err.code === 2004) {
                    self.update().then((show) => {
                        return resolve(show);
                    });
                }
                reject(err);
            });
        });
    }
    /**
     * Archive la série
     * @return {Promise<Show>} Promise of show
     */
    archive() {
        const self = this;
        return new Promise((resolve, reject) => {
            UsBetaSeries.callApi('POST', 'shows', 'archive', { id: self.id })
                .then(data => {
                self.fill(data.show);
                self.save();
                self._callListeners(EventTypes.ARCHIVE);
                resolve(self);
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
        const self = this;
        return new Promise((resolve, reject) => {
            UsBetaSeries.callApi('DELETE', 'shows', 'archive', { id: self.id })
                .then(data => {
                self.fill(data.show);
                self.save();
                self._callListeners(EventTypes.UNARCHIVE);
                resolve(self);
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
        const self = this;
        return new Promise((resolve, reject) => {
            UsBetaSeries.callApi('POST', 'shows', 'favorite', { id: self.id })
                .then(data => {
                self.fill(data.show);
                self.save();
                resolve(self);
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
        const self = this;
        return new Promise((resolve, reject) => {
            UsBetaSeries.callApi('DELETE', 'shows', 'favorite', { id: self.id })
                .then(data => {
                self.fill(data.show);
                self.save();
                resolve(self);
            }, err => {
                reject(err);
            });
        });
    }
    /**
     * Met à jour les données de la série
     * @param  {Callback} [cb = BetaSeries.noop]  Fonction de callback
     * @return {Promise<Show>}              Promesse (Show)
     */
    update(cb = UsBetaSeries.noop) {
        const self = this;
        return UsBetaSeries.callApi('GET', 'shows', 'display', { id: self.id }, true)
            .then(data => {
            if (data.show) {
                self.fill(data.show).save();
                self.updateRender(() => {
                    if (typeof cb === 'function')
                        cb();
                    self._callListeners(EventTypes.UPDATE);
                });
            }
            return self;
        })
            .catch(err => {
            UsBetaSeries.notification('Erreur de récupération de la ressource Show', 'Show update: ' + err);
            if (typeof cb === 'function')
                cb();
        });
    }
    /**
     * Met à jour le rendu de la barre de progression
     * et du prochain épisode
     * @param  {Callback} [cb=BetaSeries.noop] Fonction de callback
     * @return {void}
     */
    updateRender(cb = UsBetaSeries.noop) {
        if (!this.elt)
            return;
        const self = this;
        this.updateProgressBar();
        this.updateNextEpisode();
        this.updateArchived();
        // this.updateNote();
        const note = this.objNote;
        if (Show.logger.enabled) {
            Show.debug('Next ID et status', {
                next: this.user.next.id,
                status: this.status,
                archived: this.user.archived,
                note_user: note.user
            });
        }
        // Si il n'y a plus d'épisodes à regarder
        if (this.user.remaining === 0 && this.in_account && this.currentSeason.seen) {
            let promise = new Promise(resolve => { return resolve(void 0); });
            // On propose d'archiver si la série n'est plus en production
            if (this.isEnded() && !this.isArchived()) {
                Show.debug('Série terminée, popup proposition archivage');
                promise = new Promise(resolve => {
                    // eslint-disable-next-line no-undef
                    new PopupAlert({
                        title: 'Archivage de la série',
                        text: 'Voulez-vous archiver cette série terminée ?',
                        callback_yes: function () {
                            jQuery('#reactjs-show-actions button.btn-archive', this.elt).trigger('click');
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
                Show.debug('Proposition de voter pour la série');
                promise.then(() => {
                    let retourCallback = false;
                    // eslint-disable-next-line no-undef
                    new PopupAlert({
                        title: UsBetaSeries.trans("popin.note.title.show"),
                        text: "Voulez-vous noter la série ?",
                        callback_yes: function () {
                            // jQuery('.blockInformations__metadatas > button').trigger('click');
                            retourCallback = true;
                            return true;
                        },
                        callback_no: function () {
                            return true;
                        },
                        onClose: function () {
                            if (retourCallback) {
                                self.objNote.updateStars();
                                self.objNote.createPopupForVote();
                            }
                        }
                    });
                });
            }
            promise.then(() => {
                cb();
            });
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
        Show.debug('updateProgressBar');
        // On met à jour la barre de progression
        jQuery('.progressBarShow').css('width', this.user.status.toFixed(1) + '%');
    }
    /**
     * Simule un clic sur le bouton d'archivage de la série sur la page Web
     */
    updateArchived() {
        if (!this.elt)
            return;
        Show.debug('Show updateArchived');
        const $btnArchive = jQuery('#reactjs-show-actions button.btn-archive', this.elt);
        if (this.isArchived() && $btnArchive.length > 0) {
            $btnArchive.trigger('click');
        }
    }
    /**
     * Met à jour le bloc du prochain épisode à voir
     * @param   {Callback} [cb=noop] Fonction de callback
     * @returns {void}
     */
    updateNextEpisode(cb = UsBetaSeries.noop) {
        if (!this.elt)
            return;
        Show.debug('updateNextEpisode');
        const self = this;
        const $nextEpisode = jQuery('a.blockNextEpisode', this.elt);
        /**
         * Retourne le nombre total d'épisodes non vus dans la série
         * @return {string} le nombre total d'épisodes non vus
         */
        const getNbEpisodesUnwatchedTotal = function () {
            let nbEpisodes = 0;
            for (let s = 0; s < self.seasons.length; s++) {
                nbEpisodes += self.seasons[s].getNbEpisodesUnwatched();
            }
            return nbEpisodes.toString();
        };
        if ($nextEpisode.length > 0 && this.user.next && !isNaN(this.user.next.id)) {
            const seasonNext = parseInt(this.user.next.code.match(/S\d+/)[0].replace('S', ''), 10);
            let next = this.user.next;
            const episode = this.currentSeason?.getNextEpisodeUnwatched();
            if (seasonNext < this.currentSeason?.number && episode) {
                next = new Next({
                    id: episode.id,
                    code: episode.code,
                    date: episode.date,
                    title: episode.title,
                    image: ''
                });
            }
            Show.debug('nextEpisode et show.user.next OK', this.user, next);
            // Modifier l'image
            const $img = $nextEpisode.find('img'), $remaining = $nextEpisode.find('.remaining div'), $parent = $img.parent('div'), height = $img.attr('height'), width = $img.attr('width'), src = `${UsBetaSeries.api.url}/pictures/episodes?key=${UsBetaSeries.userKey}&id=${next.id}&width=${width}&height=${height}`;
            $img.remove();
            $parent.append(`<img data-src="${src}" class="js-lazy-image" height="${height}" width="${width}" />`);
            // Modifier le titre
            $nextEpisode.find('.titleEpisode').text(`${next.code.toUpperCase()} - ${next.title}`);
            // Modifier le lien
            $nextEpisode.attr('href', $nextEpisode.attr('href').replace(/s\d{2}e\d{2}/, next.code.toLowerCase()));
            // Modifier le nombre d'épisodes restants
            $remaining.text($remaining.text().trim().replace(/^\d+/, getNbEpisodesUnwatchedTotal()));
        }
        else if ($nextEpisode.length <= 0 && this.user.next && !isNaN(this.user.next.id)) {
            Show.debug('No nextEpisode et show.user.next OK', this.user);
            buildNextEpisode(this);
        }
        else if (!this.user.next || isNaN(this.user.next.id)) {
            $nextEpisode.remove();
        }
        cb();
        /**
         * Construit une vignette pour le prochain épisode à voir
         * @param  {Show} res  Objet API show
         * @return {void}
         */
        function buildNextEpisode(res) {
            const height = 70, width = 124, src = `${UsBetaSeries.api.url}/pictures/episodes?key=${UsBetaSeries.userKey}&id=${res.user.next.id}&width=${width}&height=${height}`, serieTitle = res.resource_url.split('/').pop();
            jQuery('.blockInformations__actions').last().after(`<a href="/episode/${serieTitle}/${res.user.next.code.toLowerCase()}" class="blockNextEpisode media">
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
                        <div class="u-colorWhiteOpacity05">${getNbEpisodesUnwatchedTotal()} épisode${(res.user.remaining > 1) ? 's' : ''} à regarder</div>
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
        const self = this;
        const vignettes = $('#episodes .slide__image');
        // Vérifier si le membre a ajouter la série à son compte
        if (!this.in_account) {
            // Remplacer le DOMElement supprime l'eventHandler
            jQuery('#reactjs-show-actions').html(`
                <div class="blockInformations__action">
                    <button class="btn-reset btn-transparent btn-add" type="button">
                        <span class="svgContainer">
                            <svg fill="#0D151C" width="14" height="14" xmlns="http://www.w3.org/2000/svg">
                            <path d="M14 8H8v6H6V8H0V6h6V0h2v6h6z" fill-rule="nonzero"></path>
                            </svg>
                        </span>
                    </button>
                    <div class="label">${UsBetaSeries.trans('show.button.add.label')}</div>
                </div>`);
            this.addBtnToSee();
            const title = this.title.replace(/"/g, '\\"').replace(/'/g, "\\'");
            const templateOpts = `<a class="header-navigation-item" href="javascript:;" onclick="showUpdate('${title}', ${this.id}, '0')">Demander une mise à jour</a>`;
            jQuery('.blockInformations__action .dropdown-menu.header-navigation[aria-labelledby="dropdownOptions"]')
                .append(templateOpts);
            // On ajoute un event click pour masquer les vignettes
            jQuery('#reactjs-show-actions > div > button').off('click').one('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                if (Show.logger.enabled)
                    console.groupCollapsed('AddShow');
                const done = function () {
                    // On met à jour les boutons Archiver et Favori
                    changeBtnAdd(self);
                    // On met à jour le bloc du prochain épisode à voir
                    self.updateNextEpisode(function () {
                        self._callListeners(EventTypes.ADDED);
                        if (Show.logger.enabled)
                            console.groupEnd();
                    });
                };
                self.addToAccount()
                    .then(() => done(), err => {
                    if (err && err.code !== undefined && err.code === 2003) {
                        done();
                        return;
                    }
                    UsBetaSeries.notification('Erreur d\'ajout de la série', err);
                    if (Show.logger.enabled)
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
        async function changeBtnAdd(show) {
            const $optionsLinks = jQuery('.blockInformations__action .dropdown-menu a.header-navigation-item');
            if ($optionsLinks.length <= 3) {
                const react_id = jQuery('script[id^="/reactjs/"]').get(0).id.split('.')[1], urlShow = show.resource_url.substring(location.origin.length), title = show.title.replace(/"/g, '\\"').replace(/'/g, "\\'");
                let templateOpts = `
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
                        <a class="header-navigation-item" href="webcal://www.betaseries.com/cal/i${urlShow}">Planning iCal de la série</a>

                        <form class="autocomplete js-autocomplete-form header-navigation-item">
                            <button type="reset" class="btn-reset fontWeight700 js-autocomplete-show" style="color: inherit">Recommander la série</button>
                            <div class="autocomplete__toShow" hidden="">
                                <input placeholder="Nom d'un ami" type="text" class="autocomplete__input js-search-friends">
                                <div class="autocomplete__response js-display-response"></div>
                            </div>
                        </form>
                        <script>
                            new SearchFriend({url: document.querySelector("[data-show-url]").dataset.showUrl});
                        </script>
                        <a class="header-navigation-item" href="javascript:;">Supprimer de mes séries</a>`;
                if ($optionsLinks.length === 2) {
                    templateOpts = `<a class="header-navigation-item" href="${urlShow}/actions">Vos actions sur la série</a>` + templateOpts;
                }
                jQuery('.blockInformations__action .dropdown-menu.header-navigation[aria-labelledby="dropdownOptions"]')
                    .append(templateOpts);
            }
            // On remplace le bouton Ajouter par les boutons Archiver et Favoris
            const divs = jQuery('#reactjs-show-actions > div');
            if (divs.length === 1) {
                const $reactjs = jQuery('#reactjs-show-actions');
                $reactjs
                    .empty()
                    .append(`
                        <div class="displayFlex alignItemsFlexStart"
                                id="reactjs-show-actions"
                                data-show-id="${show.id}"
                                data-user-hasarchived="${show.user.archived ? '1' : ''}"
                                data-show-inaccount="1"
                                data-user-id="${UsBetaSeries.userId}"
                                data-show-favorised="${show.user.favorited ? '1' : ''}">
                            <div class="blockInformations__action">
                                <button class="btn-reset btn-transparent btn-archive" type="button">
                                    <span class="svgContainer">
                                    <svg fill="#0d151c" height="16" width="16" xmlns="http://www.w3.org/2000/svg">
                                        <path d="m16 8-1.41-1.41-5.59 5.58v-12.17h-2v12.17l-5.58-5.59-1.42 1.42 8 8z"></path>
                                    </svg>
                                    </span>
                                </button>
                                <div class="label">${UsBetaSeries.trans('show.button.archive.label')}</div>
                            </div>
                            <div class="blockInformations__action">
                                <button class="btn-reset btn-transparent btn-favoris" type="button">
                                    <span class="svgContainer">
                                    <svg fill="#FFF" width="20" height="19" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M14.5 0c-1.74 0-3.41.81-4.5 2.09C8.91.81 7.24 0 5.5 0 2.42 0 0 2.42 0 5.5c0 3.78 3.4 6.86 8.55 11.54L10 18.35l1.45-1.32C16.6 12.36 20 9.28 20 5.5 20 2.42 17.58 0 14.5 0zm-4.4 15.55l-.1.1-.1-.1C5.14 11.24 2 8.39 2 5.5 2 3.5 3.5 2 5.5 2c1.54 0 3.04.99 3.57 2.36h1.87C11.46 2.99 12.96 2 14.5 2c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"></path>
                                    </svg>
                                    </span>
                                </button>
                                <div class="label">${UsBetaSeries.trans('show.button.favorite.label')}</div>
                            </div>
                        </div>`);
                // On ofusque l'image des épisodes non-vu
                let vignette;
                for (let v = 0; v < vignettes.length; v++) {
                    vignette = $(vignettes.get(v));
                    if (vignette.find('.seen').length <= 0) {
                        vignette.find('img.js-lazy-image').attr('style', 'filter: blur(5px);');
                    }
                }
                // On doit ajouter le bouton pour noter le média
                const $stars = jQuery('.blockInformations__metadatas .js-render-stars');
                $stars.replaceWith(`
                    <button type="button" class="btn-reset fontSize0">
                        <span class="stars js-render-stars">
                            ${$stars.html()}
                        </span>
                    </button>`);
                self.elt = $('.blockInformations');
                const btnAddSimilars = `<button
                    type="button"
                    class="btn-reset blockTitle-subtitle u-colorWhiteOpacity05"
                >
                    ${UsBetaSeries.trans("popup.suggest_show.title", { '%title%': "une série" })}</button>`;
                jQuery('#similars h2.blockTitle').after(btnAddSimilars);
                // self.addNumberVoters();
                // On supprime le btn ToSeeLater
                self.elt.find('.blockInformations__action .btnMarkToSee').parent().remove();
                self.elt.find('.blockInformations__title .fa-clock').remove();
                const toSee = await UsBetaSeries.gm_funcs.getValue('toSee', {});
                if (toSee[self.id] !== undefined) {
                    delete toSee[self.id];
                    UsBetaSeries.gm_funcs.setValue('toSee', toSee);
                }
            }
            self.addEventBtnsArchiveAndFavoris();
            self.deleteShowClick();
        }
        if (trigEpisode) {
            this.update().then(show => {
                changeBtnAdd(show);
            });
        }
    }
    /**
     * Gère la suppression de la série du compte utilisateur
     * @returns {void}
     */
    deleteShowClick() {
        const self = this;
        const $optionsLinks = $('#dropdownOptions').siblings('.dropdown-menu').children('a.header-navigation-item');
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
                        self.user.status = 0;
                        self.user.archived = false;
                        self.user.favorited = false;
                        self.user.remaining = 0;
                        self.user.last = "S00E00";
                        self.user.next.id = NaN;
                        self.save();
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
                                <div class="label">${UsBetaSeries.trans('show.button.add.label')}</div>
                            </div>`);
                        // On supprime les items du menu Options
                        $optionsLinks.first().siblings().each((i, e) => { $(e).remove(); });
                        // Nettoyage de l'affichage des épisodes
                        const checks = jQuery('#episodes .slide_flex');
                        let promise, update = false; // Flag pour l'update de l'affichage
                        if (self.currentSeason.episodes && self.currentSeason.episodes.length > 0) {
                            promise = new Promise(resolve => resolve(self.currentSeason));
                        }
                        else {
                            promise = self.currentSeason.fetchEpisodes();
                        }
                        promise.then((season) => {
                            for (let e = 0; e < season.episodes.length; e++) {
                                if (season.episodes[e].elt === null) {
                                    season.episodes[e].elt = $(checks.get(e));
                                }
                                if (e === season.episodes.length - 1)
                                    update = true;
                                Show.debug('clean episode %d', e, update);
                                season.episodes[e].updateRender('notSeen', update);
                            }
                        });
                        // On doit supprimer le bouton pour noter le média
                        const $stars = jQuery('.blockInformations__metadatas .js-render-stars');
                        $stars.parent().replaceWith(`
                            <span class="stars js-render-stars">
                                ${$stars.html()}
                            </span>`);
                        self.elt = $('.blockInformations');
                        // self.addNumberVoters();
                        self.addBtnToSee();
                        self.addShowClick();
                        self.updateProgressBar();
                        self.updateNextEpisode();
                    };
                    // eslint-disable-next-line no-undef
                    new PopupAlert({
                        title: UsBetaSeries.trans("popup.delete_show_success.title"),
                        text: UsBetaSeries.trans("popup.delete_show_success.text", { "%title%": self.title }),
                        yes: UsBetaSeries.trans("popup.delete_show_success.yes"),
                        callback_yes: afterNotif
                    });
                };
                // Supprimer la série du compte utilisateur
                // eslint-disable-next-line no-undef
                new PopupAlert({
                    title: UsBetaSeries.trans("popup.delete_show.title", { "%title%": self.title }),
                    text: UsBetaSeries.trans("popup.delete_show.text", { "%title%": self.title }),
                    callback_yes: function () {
                        if (Show.logger.enabled)
                            console.groupCollapsed('delete show');
                        self.removeFromAccount()
                            .then(done, err => {
                            if (err && err.code !== undefined && err.code === 2004) {
                                done();
                                if (Show.logger.enabled)
                                    console.groupEnd();
                                return;
                            }
                            UsBetaSeries.notification('Erreur de suppression de la série', err);
                            if (Show.logger.enabled)
                                console.groupEnd();
                        });
                    },
                    callback_no: UsBetaSeries.noop
                });
            });
        }
    }
    /**
     * Ajoute le bouton toSee dans les actions de la série
     * @sync
     */
    async addBtnToSee() {
        Show.debug('Show.addBtnToSee');
        const self = this;
        let $btn = this.elt.find('.blockInformations__action .btnMarkToSee');
        if ($btn.length <= 0) {
            const btnHTML = `
                <div class="blockInformations__action">
                    <button class="btn-reset btn-transparent btnMarkToSee" type="button" title="Ajouter la série aux séries à voir">
                        <i class="fa-solid fa-clock" aria-hidden="true"></i>
                    </button>
                    <div class="label">A voir</div>
                </div>`;
            this.elt.find('.blockInformations__actions').last().append(btnHTML);
            $btn = this.elt.find('.blockInformations__action .btnMarkToSee');
            $btn.on('click', async (e) => {
                e.stopPropagation();
                e.preventDefault();
                const $btn = jQuery(e.currentTarget);
                const toSee = await toggleToSeeShow(self.id);
                if (toSee) {
                    $btn.find('i.fa-solid').css('color', 'var(--body_background)');
                    $btn.attr('title', 'Retirer la série des séries à voir');
                    self.elt.find('.blockInformations__title').append('<i class="fa-solid fa-clock" aria-hidden="true" style="font-size:0.6em;margin-left:5px;vertical-align:middle;" title="Série à voir plus tard"></i>');
                }
                else {
                    $btn.find('i.fa-solid').css('color', 'var(--default-color)');
                    $btn.attr('title', 'Ajouter la série aux séries à voir');
                    self.elt.find('.blockInformations__title .fa-solid').remove();
                }
                $btn.blur();
            });
        }
        const toggleToSeeShow = async (showId) => {
            const storeToSee = await UsBetaSeries.gm_funcs.getValue('toSee', []);
            const toSee = storeToSee.includes(showId);
            if (!toSee) {
                storeToSee.push(showId);
            }
            else {
                storeToSee.splice(storeToSee.indexOf(showId), 1);
            }
            UsBetaSeries.gm_funcs.setValue('toSee', storeToSee);
            return toSee;
        };
        const toSee = await UsBetaSeries.gm_funcs.getValue('toSee', []);
        if (toSee.includes(this.id)) {
            $btn.find('i.fa-solid').css('color', 'var(--body_background)');
            $btn.attr('title', 'Retirer la série des séries à voir');
            self.elt.find('.blockInformations__title').append('<i class="fa-solid fa-clock" aria-hidden="true" style="font-size:0.6em;" title="Série à voir plus tard"></i>');
        }
    }
    /**
     * Ajoute un eventHandler sur les boutons Archiver et Favoris
     * @returns {void}
     */
    addEventBtnsArchiveAndFavoris() {
        const self = this;
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
            if (Show.logger.enabled)
                console.groupCollapsed('show-archive');
            // Met à jour le bouton d'archivage de la série
            function updateBtnArchive(promise, transform, label, notif) {
                promise.then(() => {
                    const $parent = $(e.currentTarget).parent();
                    $('span', e.currentTarget).css('transform', transform);
                    $('.label', $parent).text(UsBetaSeries.trans(label));
                    if (Show.logger.enabled)
                        console.groupEnd();
                }, err => {
                    UsBetaSeries.notification(notif, err);
                    if (Show.logger.enabled)
                        console.groupEnd();
                });
            }
            if (!self.isArchived()) {
                updateBtnArchive(self.archive(), 'rotate(180deg)', 'show.button.unarchive.label', 'Erreur d\'archivage de la série');
            }
            else {
                updateBtnArchive(self.unarchive(), 'rotate(0deg)', 'show.button.archive.label', 'Erreur désarchivage de la série');
            }
        });
        // Event bouton Favoris
        $btnFavoris.off('click').click((e) => {
            e.stopPropagation();
            e.preventDefault();
            if (Show.logger.enabled)
                console.groupCollapsed('show-favoris');
            if (!self.isFavorite()) {
                self.favorite()
                    .then(() => {
                    jQuery(e.currentTarget).children('span').replaceWith(`
                            <span class="svgContainer">
                            <svg width="21" height="19" xmlns="http://www.w3.org/2000/svg">
                                <path d="M15.156.91a5.887 5.887 0 0 0-4.406 2.026A5.887 5.887 0 0 0 6.344.909C3.328.91.958 3.256.958 6.242c0 3.666 3.33 6.653 8.372 11.19l1.42 1.271 1.42-1.28c5.042-4.528 8.372-7.515 8.372-11.18 0-2.987-2.37-5.334-5.386-5.334z"></path>
                            </svg>
                            </span>`);
                    if (Show.logger.enabled)
                        console.groupEnd();
                }, err => {
                    UsBetaSeries.notification('Erreur de favoris de la série', err);
                    if (Show.logger.enabled)
                        console.groupEnd();
                });
            }
            else {
                self.unfavorite()
                    .then(() => {
                    $(e.currentTarget).children('span').replaceWith(`
                            <span class="svgContainer">
                            <svg fill="#FFF" width="20" height="19" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14.5 0c-1.74 0-3.41.81-4.5 2.09C8.91.81 7.24 0 5.5 0 2.42 0 0 2.42 0 5.5c0 3.78 3.4 6.86 8.55 11.54L10 18.35l1.45-1.32C16.6 12.36 20 9.28 20 5.5 20 2.42 17.58 0 14.5 0zm-4.4 15.55l-.1.1-.1-.1C5.14 11.24 2 8.39 2 5.5 2 3.5 3.5 2 5.5 2c1.54 0 3.04.99 3.57 2.36h1.87C11.46 2.99 12.96 2 14.5 2c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"></path>
                            </svg>
                            </span>`);
                    if (Show.logger.enabled)
                        console.groupEnd();
                }, err => {
                    UsBetaSeries.notification('Erreur de favoris de la série', err);
                    if (Show.logger.enabled)
                        console.groupEnd();
                });
            }
        });
    }
    /**
     * Ajoute la classification dans les détails de la ressource
     */
    addRating() {
        Show.debug('addRating');
        if (this.rating) {
            const rating = UsBetaSeries.ratings[this.rating] !== undefined ? UsBetaSeries.ratings[this.rating] : null;
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
     * @param   {number} seasonNumber - Le numéro de la saison courante (commence à 1)
     * @returns {Show}  L'instance de la série
     * @throws  {Error} if seasonNumber is out of range of seasons
     */
    setCurrentSeason(seasonNumber) {
        if (seasonNumber <= 0 || seasonNumber > this.seasons.length) {
            throw new RangeError(`seasonNumber[${seasonNumber}] is out of range of seasons(length: ${this.seasons.length})`);
        }
        this._currentSeason = seasonNumber - 1;
        return this;
    }
    /**
     * Retourne la saison courante
     * @return {Season}
     */
    get currentSeason() {
        if (!this._currentSeason)
            this._currentSeason = 0;
        return this.seasons[this._currentSeason];
    }
    /**
     * Retourne l'objet Season correspondant au numéro de saison fournit en paramètre
     * @param   {number} seasonNumber - Numéro de saison (base: 1)
     * @returns {Season}
     */
    getSeason(seasonNumber) {
        Show.debug('Show.getSeason: seasonNumber(%d)', seasonNumber);
        if (seasonNumber <= 0 || seasonNumber > this.seasons.length) {
            throw new RangeError(`seasonNumber[${seasonNumber}] is out of range of seasons(length: ${this.seasons.length})`);
        }
        return this.seasons[seasonNumber - 1];
    }
    /**
     * Retourne une image, si disponible, en fonction du format désiré
     * @param  {string} [format = Images.formats.poster] -  Le format de l'image désiré
     * @return {Promise<string>}                         L'URL de l'image
     */
    getDefaultImage(format = Images.formats.poster) {
        const proxy = UsBetaSeries.serverBaseUrl + '/posters';
        const initFetch = {
            method: 'GET',
            headers: {
                'origin': 'https://www.betaseries.com',
                'x-requested-with': ''
            },
            mode: 'cors',
            cache: 'no-cache'
        };
        return new Promise((res, rej) => {
            if (format === Images.formats.poster) {
                Show.debug('Show.getDefaultImage poster', this.images.poster);
                if (this.images.poster)
                    res(this.images.poster);
                else {
                    this._getTvdbUrl(this.thetvdb_id).then(url => {
                        if (!url)
                            return res('');
                        const urlTvdb = new URL(url);
                        fetch(`${proxy}${urlTvdb.pathname}`, initFetch)
                            .then((resp) => {
                            if (resp.ok) {
                                return resp.text();
                            }
                            return null;
                        }).then(html => {
                            if (html == null) {
                                return rej('HTML error');
                            }
                            const parser = new DOMParser();
                            const doc = parser.parseFromString(html, 'text/html');
                            const link = doc.querySelector('.container .row a[rel="artwork_posters"]');
                            if (link)
                                res(link.href.replace('original', 'w500'));
                            rej('poster not found');
                        }).catch(err => rej(err));
                    });
                }
            }
            else if (format === Images.formats.wide) {
                if (this.images.show !== null)
                    res(this.images.show);
                else if (this.images.box !== null)
                    res(this.images.box);
                else {
                    this._getTvdbUrl(this.thetvdb_id).then(url => {
                        if (!url)
                            return res('');
                        const urlTvdb = new URL(url);
                        fetch(`${proxy}${urlTvdb.pathname}`, initFetch)
                            .then((resp) => {
                            if (resp.ok) {
                                return resp.text();
                            }
                            return null;
                        }).then(html => {
                            if (html == null) {
                                return rej('HTML error');
                            }
                            const parser = new DOMParser();
                            const doc = parser.parseFromString(html, 'text/html');
                            const link = doc.querySelector('.container .row a[rel="artwork_backgrounds"]');
                            if (link)
                                res(link.href.replace('original', 'w500'));
                            rej('image not found');
                        }).catch(err => rej(err));
                    });
                }
            }
        });
    }
    /**
     * Récupère et retourne les différentes affiches disponibles
     * @returns {object}
     */
    getAllPosters() {
        if (this._posters) {
            return new Promise(res => res(this._posters));
        }
        const proxy = UsBetaSeries.serverBaseUrl + '/posters';
        const initFetch = {
            method: 'GET',
            headers: {
                'origin': 'https://www.betaseries.com',
                'x-requested-with': ''
            },
            mode: 'cors',
            cache: 'no-cache'
        };
        return new Promise((res, rej) => {
            const posters = {};
            if (this.images?._local.poster)
                posters['local'] = [this.images._local.poster];
            this._getTvdbUrl(this.thetvdb_id).then(url => {
                // Show.debug('getAllPosters url', url);
                if (!url)
                    return res(posters);
                const urlTvdb = new URL(url);
                fetch(`${proxy}${urlTvdb.pathname}/artwork/posters`, initFetch)
                    .then((resp) => {
                    if (resp.ok) {
                        return resp.text();
                    }
                    return null;
                }).then(html => {
                    if (html == null) {
                        return rej('HTML error');
                    }
                    posters['TheTVDB'] = [];
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, 'text/html');
                    const imgs = doc.querySelectorAll('a.thumbnail img');
                    for (let l = 0; l < imgs.length; l++) {
                        posters['TheTVDB'].push(imgs[l].dataset.src);
                    }
                    this._posters = posters;
                    res(posters);
                }).catch(err => rej(err));
            });
        });
    }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
var MovieStatus;
(function (MovieStatus) {
    MovieStatus[MovieStatus["TOSEE"] = 0] = "TOSEE";
    MovieStatus[MovieStatus["SEEN"] = 1] = "SEEN";
    MovieStatus[MovieStatus["DONTWANTTOSEE"] = 2] = "DONTWANTTOSEE";
})(MovieStatus = MovieStatus || (MovieStatus = {}));
// eslint-disable-next-line no-unused-vars
class Movie extends Media {
    /***************************************************/
    /*                      STATIC                     */
    /***************************************************/
    static logger = new UsBetaSeries.setDebug('Media:Movie');
    static debug = Movie.logger.debug.bind(Movie.logger);
    static propsAllowedOverride = {
        poster: { path: 'poster' }
    };
    static overrideType = 'movies';
    static selectorsCSS = {
        title: '.blockInformations h1.blockInformations__title',
        description: '.blockInformations p.blockInformations__description',
        tagline: '.blockInformations p.blockInformations__tagline',
        release_date: '.blockInformations .blockInformations__metadatas time',
        followers: '.blockInformations .blockInformations__metadatas span.u-colorWhiteOpacity05',
        director: '.blockInformations .blockInformations__details li:nth-child(#n#) sapn',
        duration: '.blockInformations .blockInformations__details li:nth-child(#n#) span',
        genres: '.blockInformations .blockInformations__details li:nth-child(#n#) span',
        language: '.blockInformations .blockInformations__details li:nth-child(#n#) span',
        /*comments: '#comments',
        characters: '#actors',
        similars: '#similars'*/
    };
    static relatedProps = {
        // data: Obj => object: Show
        backdrop: { key: "backdrop", type: 'string', default: '' },
        comments: { key: "nbComments", type: 'number', default: 0 },
        director: { key: "director", type: 'string', default: '' },
        followers: { key: "followers", type: 'number', default: 0 },
        genres: { key: "genres", type: 'array', default: [] },
        id: { key: "id", type: 'number' },
        imdb_id: { key: "imdb_id", type: 'string', default: '' },
        in_account: { key: "in_account", type: 'boolean', default: false },
        language: { key: "language", type: 'string', default: '' },
        length: { key: "duration", type: 'number', default: 0 },
        notes: { key: "objNote", type: Note },
        original_release_date: { key: "original_release_date", type: 'date' },
        original_title: { key: "original_title", type: 'string', default: '' },
        other_title: { key: "other_title", type: 'object', default: {} },
        platform_links: { key: "platforms", type: 'array', default: [] },
        poster: { key: "poster", type: 'string', default: '' },
        production_year: { key: "production_year", type: 'number', default: 0 },
        release_date: { key: "release_date", type: 'date' },
        resource_url: { key: "resource_url", type: 'string', default: '' },
        sale_date: { key: "sale_date", type: 'date', default: null },
        similars: { key: "nbSimilars", type: 'number', default: 0 },
        synopsis: { key: "description", type: 'string', default: '' },
        tagline: { key: "tagline", type: 'string', default: '' },
        title: { key: "title", type: 'string', default: '' },
        tmdb_id: { key: "tmdb_id", type: 'number', default: 0 },
        trailer: { key: "trailer", type: 'string', default: '' },
        url: { key: 'slug', type: 'string', default: '' },
        user: { key: "user", type: User }
    };
    /**
     * Méthode static servant à récupérer un film sur l'API BS
     * @param  {Obj} params - Critères de recherche du film
     * @param  {boolean} [force=false] - Indique si on utilise le cache ou non
     * @return {Promise<Show>}
     * @private
     */
    static _fetch(params, force = false) {
        return new Promise((resolve, reject) => {
            UsBetaSeries.callApi('GET', 'movies', 'movie', params, force)
                .then(data => resolve(new Movie(data.movie, jQuery('.blockInformations'))))
                .catch(err => reject(err));
        });
    }
    /**
     * Methode static servant à retourner un objet show
     * à partir de son ID
     * @param  {number} id             L'identifiant de la série
     * @param  {boolean} [force=false] Indique si on utilise le cache ou non
     * @return {Promise<Movie>}
     */
    static fetch(id, force = false) {
        return Movie._fetch({ id }, force);
    }
    /**
     * Méthode static servant à récupérer un film sur l'API BS à partir
     * de son identifiant TheMovieDB
     * @param id - Identifiant du film sur TheMovieDB
     * @param force - Indique si on utilise le cache ou non
     * @returns {Promise<Movie>}
     */
    static fetchByTmdb(id, force = false) {
        return this._fetch({ tmdb_id: id }, force);
    }
    static search(title, force = false) {
        return new Promise((resolve, reject) => {
            UsBetaSeries.callApi(HTTP_VERBS.GET, 'movies', 'search', { title }, force)
                .then(data => { resolve(new Movie(data.movies[0])); })
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
    _posters;
    _local;
    /***************************************************/
    /*                      METHODS                    */
    /***************************************************/
    /**
     * Constructeur de la classe Movie
     * @param   {Obj} data - Les données du média
     * @param   {JQuery<HTMLElement>} element - Le DOMElement associé au média
     * @returns {Media}
     */
    constructor(data, element) {
        data.in_account = data.user?.in_account;
        super(data, element);
        this._local = { poster: null };
        this.platform_links = [];
        this.mediaType = { singular: MediaType.movie, plural: 'movies', className: Movie };
        return this.fill(data)._initRender();
    }
    _initRender() {
        if (!this.elt) {
            return;
        }
        super._initRender();
        // title
        const $title = jQuery(Movie.selectorsCSS.title);
        if ($title.length > 0) {
            const title = $title.text();
            $title.empty().append(`<span class="title">${title}</span>`);
            Movie.selectorsCSS.title += ' span.title';
        }
        const $synopsis = jQuery('.blockInformations .blockInformations__synopsis');
        if ($synopsis.length === 2) {
            $synopsis.first().addClass('blockInformations__tagline');
            $synopsis.last().addClass('blockInformations__description');
        }
        else {
            $synopsis.first().addClass('blockInformations__description');
        }
        const $details = jQuery('.blockInformations__details li', this.elt);
        for (let d = 0, _len = $details.length; d < _len; d++) {
            const $li = jQuery($details.get(d));
            if ($li.get(0).classList.length <= 0) {
                const title = $li.find('strong').text().trim().toLowerCase();
                switch (title) {
                    case 'réalisateur':
                        Movie.selectorsCSS.director = Movie.selectorsCSS.director.replace('#n#', (d + 1).toString());
                        break;
                    case 'genres':
                        Media.selectorsCSS.genres = Media.selectorsCSS.genres.replace('#n#', (d + 1).toString());
                        Movie.selectorsCSS.genres = Movie.selectorsCSS.genres.replace('#n#', (d + 1).toString());
                        break;
                    case 'durée': {
                        Media.selectorsCSS.duration = Media.selectorsCSS.duration.replace('#n#', (d + 1).toString());
                        Movie.selectorsCSS.duration = Movie.selectorsCSS.duration.replace('#n#', (d + 1).toString());
                        break;
                    }
                    case 'langue':
                        Movie.selectorsCSS.language = Movie.selectorsCSS.language.replace('#n#', (d + 1).toString());
                        break;
                    default:
                        break;
                }
            }
        }
        return this;
    }
    updatePropRenderFollowers() {
        const $followers = jQuery(Movie.selectorsCSS.followers);
        if ($followers.length > 0) {
            let text = `${this.followers.toString()} membre${this.followers > 1 ? 's' : ''}`;
            $followers.attr('title', text);
            if (this.followers >= 1000) {
                const thousand = Math.round(this.followers / 1000);
                text = `${thousand.toString()}K membres`;
            }
            $followers.text(text);
        }
        delete this.__changes.followers;
    }
    // release_date
    updatePropRenderReleaseDate() {
        const $releaseDate = jQuery(Movie.selectorsCSS.release_date);
        if ($releaseDate.length > 0) {
            $releaseDate.text(this.release_date.format('dd mmmm yyyy'));
        }
        delete this.__changes.release_date;
    }
    updatePropRenderDuration() {
        const $duration = jQuery(Movie.selectorsCSS.duration);
        if ($duration.length > 0) {
            let minutes = this.duration / 60;
            let hours = minutes / 60;
            let text = '';
            if (hours >= 1) {
                hours = Math.floor(hours);
                minutes = ((minutes / 60) - hours) * 60;
                text += `${hours.toString()} heure${hours > 1 ? 's' : ''} `;
            }
            text += `${minutes.toFixed().padStart(2, '0')} minutes`;
            $duration.text(text);
        }
    }
    /**
     * Définit le film, sur le compte du membre connecté, comme "vu"
     * @returns {Promise<Movie>}
     */
    markAsView() {
        return this.changeStatus(MovieStatus.SEEN);
    }
    /**
     * Définit le film, sur le compte du membre connecté, comme "à voir"
     * @returns {Promise<Movie>}
     */
    markToSee() {
        return this.changeStatus(MovieStatus.TOSEE);
    }
    /**
     * Définit le film, sur le compte du membre connecté, comme "ne pas voir"
     * @returns {Promise<Movie>}
     */
    markDontWantToSee() {
        return this.changeStatus(MovieStatus.DONTWANTTOSEE);
    }
    /**
     * Modifie le statut du film sur le compte du membre connecté
     * @param   {number} state     Le nouveau statut du film
     * @returns {Promise<Movie>}    L'instance du film
     */
    changeStatus(state) {
        const self = this;
        if (!UsBetaSeries.userIdentified() || this.user.status === state) {
            console.info('User not identified or state is equal with user status');
            return Promise.resolve(this);
        }
        return UsBetaSeries.callApi(HTTP_VERBS.POST, this.mediaType.plural, 'movie', { id: this.id, state: state })
            .then((data) => {
            self.fill(data.movie);
            return this;
        })
            .catch(err => {
            console.warn("Erreur ajout film sur compte", err);
            UsBetaSeries.notification('Ajout du film', "Erreur lors de l'ajout du film sur votre compte");
            return this;
        });
    }
    /**
     * Retourne une image, si disponible, en fonction du format désiré
     * @param  {string} [format = Images.formats.poster] - Le format de l'image désiré
     * @return {Promise<string>} L'URL de l'image
     */
    getDefaultImage(format = 'poster') {
        const initFetch = {
            method: 'GET',
            mode: 'cors',
            cache: 'no-cache'
        };
        return new Promise((res, rej) => {
            if (format === 'poster') {
                if (this.poster)
                    res(this.poster);
                else {
                    const baseImgTmdb = 'https://image.tmdb.org/t/p/w500';
                    const api_key = UsBetaSeries.themoviedb_api_user_key;
                    const uri = `https://api.themoviedb.org/3/movie/${this.tmdb_id}?api_key=${api_key}&language=fr`;
                    // https://api.themoviedb.org/3/movie/961330?api_key=e506df46268747316e82bbd38c1a1439&language=fr
                    fetch(uri, initFetch)
                        .then((resp) => {
                        if (resp.ok) {
                            return resp.json();
                        }
                        return null;
                    }).then(data => {
                        if (data == null) {
                            return rej('Response JSON error');
                        }
                        else if (data.poster)
                            res(baseImgTmdb + data.poster);
                        else
                            rej('no data poster');
                    }).catch(err => rej(err));
                }
            }
        });
    }
    /**
     * Récupère les personnages du film
     * @returns {Promise<this>}
     */
    fetchCharacters() {
        const self = this;
        if (this.__fetches.characters)
            return this.__fetches.characters;
        this.__fetches.characters = UsBetaSeries.callApi(HTTP_VERBS.GET, 'movies', 'characters', { id: this.id }, true)
            .then((data) => {
            self.characters = [];
            if (data?.characters?.length <= 0) {
                return self;
            }
            for (let c = 0; c < data.characters.length; c++) {
                self.characters.push(new Character(data.characters[c]));
            }
            return self;
        }).finally(() => delete this.__fetches.characters);
        return this.__fetches.characters;
    }
    /**
     * Retourne une collection d'affiche, si trouvées sur l'API theMovieDb
     * @returns {Promise<Object>}
     */
    getAllPosters() {
        if (this._posters) {
            return new Promise(res => res(this._posters));
        }
        const initFetch = {
            method: 'GET',
            mode: 'cors',
            cache: 'no-cache'
        };
        return new Promise((res, rej) => {
            const posters = {};
            if (this.poster)
                posters['local'] = [this._local.poster];
            const baseImgTmdb = 'https://image.tmdb.org/t/p/w500';
            const api_key = UsBetaSeries.themoviedb_api_user_key;
            const uri = `https://api.themoviedb.org/3/movie/${this.tmdb_id}/images?api_key=${api_key}`;
            // https://api.themoviedb.org/3/movie/961330?api_key=e506df46268747316e82bbd38c1a1439&language=fr
            fetch(uri, initFetch)
                .then((resp) => {
                if (resp.ok) {
                    return resp.json();
                }
                return null;
            }).then(data => {
                if (data == null) {
                    return rej('Response JSON error');
                }
                else if (data.posters && data.posters.length > 0) {
                    posters['TheMovieDB'] = [];
                    for (let p = 0; p < data.posters.length; p++) {
                        posters['TheMovieDB'].push(baseImgTmdb + data.posters[p].file_path);
                    }
                }
                this._posters = posters;
                res(posters);
            }).catch(err => rej(err));
        });
    }
}

class Subtitle {
    /**
     * L'identifiant du subtitle
     * @type {number}
     */
    id;
    /**
     * La langue du subtitle
     * @type {string}
     */
    language;
    /**
     * La source du subtitle
     * @type {string}
     */
    source;
    /**
     * La qualité du subtitle
     * @type {number}
     */
    quality;
    /**
     * Le nom du fichier du subtitle
     * @type {string}
     */
    file;
    /**
     * L'URL d'accès au subtitle
     * @type {string}
     */
    url;
    /**
     * Date de mise en ligne
     * @type {Date}
     */
    date;
    /**
     * Identifiant ou numéro de l'épisode
     * @type {number}
     */
    episode;
    /**
     * Identifiant de la série
     * @type {number}
     */
    show;
    /**
     * Numéro de saison
     * @type {number}
     */
    season;
    constructor(data) {
        this.id = parseInt(data.id, 10);
        this.language = data.language;
        this.source = data.source;
        this.quality = parseInt(data.quality, 10);
        this.file = data.file;
        this.url = data.url;
        this.date = new Date(data.date);
        this.show = parseInt(data.show_id, 10);
        this.episode = parseInt(data.episode_id, 10);
        this.season = parseInt(data.season, 10);
    }
}
/**
 * SortTypeSubtitles
 * @enum
 * @memberof Subtitles
 * @alias SortTypeSubtitles
 */
var SortTypeSubtitles;
(function (SortTypeSubtitles) {
    SortTypeSubtitles["LANGUAGE"] = "language";
    SortTypeSubtitles["SOURCE"] = "source";
    SortTypeSubtitles["QUALITY"] = "quality";
    SortTypeSubtitles["DATE"] = "date";
})(SortTypeSubtitles = SortTypeSubtitles || (SortTypeSubtitles = {}));
/**
 * SubtitleTypes
 * @enum
 * @memberof Subtitles
 * @alias SubtitleTypes
 */
var SubtitleTypes;
(function (SubtitleTypes) {
    SubtitleTypes["EPISODE"] = "episode";
    SubtitleTypes["SEASON"] = "season";
    SubtitleTypes["SHOW"] = "show";
})(SubtitleTypes = SubtitleTypes || (SubtitleTypes = {}));
/**
 * SubtitleLanguages
 * @enum
 * @memberof Subtitles
 * @alias SubtitleLanguages
 */
var SubtitleLanguages;
(function (SubtitleLanguages) {
    SubtitleLanguages["ALL"] = "all";
    SubtitleLanguages["VOVF"] = "vovf";
    SubtitleLanguages["VO"] = "vo";
    SubtitleLanguages["VF"] = "vf";
})(SubtitleLanguages = SubtitleLanguages || (SubtitleLanguages = {}));
/**
 * Subtitles - Classe collection de sous-titres
 * @class
 */
class Subtitles {
    static logger = new UsBetaSeries.setDebug('Subtitles');
    static debug = Subtitles.logger.debug.bind(Subtitles.logger);
    /**
     * Collection de subtitles
     * @type {Subtitle[]}
     */
    subtitles;
    /**
     * Récupère et retourne une collection de subtitles
     * @static
     * @param   {SubtitleTypes} type - Type de média
     * @param   {ParamsFetchSubtitles} ids - Les identifiants de recherche
     * @param   {SubtitleLanguages} language - La langue des subtitles recherchés
     * @returns {Promise<Subtitles>}
     */
    static fetch(type, ids, language = SubtitleLanguages.ALL) {
        const params = { id: ids.id, language: language };
        if (type === SubtitleTypes.SEASON) {
            params.season = ids.season;
        }
        return UsBetaSeries.callApi(HTTP_VERBS.GET, 'subtitles', type, params)
            .then((data) => {
            return new Subtitles(data.subtitles);
        });
    }
    /**
     * Constructor
     * @param  {Obj} data - Les données
     * @return {Subtitles}
     */
    constructor(data) {
        this.subtitles = [];
        if (data && data.length > 0) {
            for (let s = 0; s < data.length; s++) {
                this.subtitles.push(new Subtitle(data[s]));
            }
        }
    }
    /**
     * Permet de trier les subtitles
     * @param   {SortTypeSubtitles} by - Le type de tri
     * @returns {Array<Subtitle>}
     */
    sortBy(by) {
        const funcCompare = (elt1, elt2) => {
            if (elt1[by] > elt2[by])
                return 1;
            else if (elt1[by] < elt2[by])
                return -1;
            else
                return 0;
        };
        return this.subtitles.sort(funcCompare);
    }
}

class Season extends RenderHtml {
    static logger = new UsBetaSeries.setDebug('Show:Season');
    static debug = Season.logger.debug.bind(Season.logger);
    /**
     * Les différents sélecteurs CSS des propriétés de l'objet
     * @static
     * @type {Record<string, string>}
     */
    static selectorsCSS = {
        title: 'div.slide__title',
        nbEpisodes: 'div.slide__infos',
        image: 'div.slide__image img',
        seen: '.checkSeen',
        hidden: '.hideIcon'
    };
    /**
     * Objet contenant les informations de relations entre les propriétés des objets de l'API
     * et les proriétés de cette classe.
     * Sert à la construction de l'objet
     * @static
     * @type {Record<string, RelatedProp>}
     */
    static relatedProps = {
        // data: Obj => object: Season
        number: { key: "number", type: 'number', default: 0 },
        episodes: { key: "nbEpisodes", type: 'number', default: 0 },
        seen: { key: 'seen', type: 'boolean', default: false },
        hidden: { key: 'hidden', type: 'boolean', default: false },
        image: { key: 'image', type: 'string' },
        has_subtitles: { key: "has_subtitles", type: 'boolean', default: false }
    };
    /**
     * Numéro de la saison dans la série
     * @type {number}
     */
    number;
    /**
     * Tableau des épisodes de la saison
     * @type {Array<Episode>}
     */
    episodes;
    /**
     * Nombre d'épisodes dans la saison
     * @type {number}
     */
    nbEpisodes;
    /**
     * Possède des sous-titres
     * @type {boolean}
     */
    has_subtitles;
    /**
     * Indique si la saison est indiquée comme ignorée par le membre
     * @type {boolean}
     */
    hidden;
    /**
     * URL de l'image
     * @type {string}
     */
    image;
    /**
     * Indique si le membre a vu la saison complète
     * @type {boolean}
     */
    seen;
    /**
     * L'objet Show auquel est rattaché la saison
     * @type {Show}
     */
    _show;
    /**
     * Objet contenant les promesses en attente des méthodes fetchXXX
     * @type {Object.<string, Promise<Season>>}
     */
    __fetches = {};
    /**
     * Constructeur de la classe Season
     * @param   {Obj}   data    Les données provenant de l'API
     * @param   {Show}  show    L'objet Show contenant la saison
     * @returns {Season}
     */
    constructor(data, show) {
        const number = (data.number) ? parseInt(data.number, 10) : null;
        // Si le parent Show à son HTMLElement de déclaré, alors on déclare celui de la saison
        const elt = (number && show.elt) ? jQuery(`#seasons .slides_flex .slide_flex:nth-child(${number.toString()})`) : null;
        super(data, elt);
        this._show = show;
        this.episodes = [];
        return this.fill(data)._initRender();
    }
    /**
     * Initialise le rendu HTML de la saison
     * @returns {Seasons}
     */
    _initRender() {
        if (!this.elt)
            return this;
        this.elt
            .attr('data-number', this.number)
            .attr('data-seen', this.seen ? '1' : '0')
            .attr('data-hidden', this.hidden ? '1' : '0')
            .attr('data-episodes', this.nbEpisodes);
        const $nbEpisode = jQuery(Season.selectorsCSS.nbEpisodes, this.elt);
        const $spanNbEpisodes = jQuery(Season.selectorsCSS.nbEpisodes + ' span.nbEpisodes', this.elt);
        Season.debug('Season._initRender', $nbEpisode, $spanNbEpisodes);
        if ($nbEpisode.length > 0 && $spanNbEpisodes.length <= 0) {
            $nbEpisode.empty().append(`<span class="nbEpisodes">${this.nbEpisodes}</span> épisodes`);
        }
        const $img = jQuery(Season.selectorsCSS.image, this.elt);
        const $checkSeen = jQuery(Season.selectorsCSS.seen, this.elt);
        const $hidden = jQuery(Season.selectorsCSS.hidden, this.elt);
        if (this.seen && $checkSeen.length <= 0) {
            $img.before('<div class="checkSeen"></div>');
        }
        else if (this.hidden && $hidden.length <= 0) {
            $img.before('<div class="hideIcon"></div>');
        }
        return this;
    }
    /**
     * Mise à jour du nombre d'épisodes de la saison sur la page Web
     * @returns {void}
     */
    updatePropRenderNbepisodes() {
        if (!this.elt)
            return;
        const $nbEpisode = jQuery(Season.selectorsCSS.nbEpisodes + ' span.nbEpisodes', this.elt);
        if ($nbEpisode.length > 0) {
            $nbEpisode.text(this.nbEpisodes);
        }
    }
    /**
     * Mise à jour de l'image de la saison sur la page Web
     * @returns {void}
     */
    updatePropRenderImage() {
        if (!this.elt)
            return;
        // Si image est null, on récupère celle de la série
        if ((0, isNull)(this.image) && !(0, isNull)(this._show.images.poster)) {
            this.image = this._show.images.poster;
            return;
        }
        // Si celle de la série est null, on ne fait rien
        else if ((0, isNull)(this.image)) {
            return;
        }
        const $img = jQuery(Season.selectorsCSS.image, this.elt);
        if ($img.length > 0 && $img.attr('src') != this.image) {
            $img.attr('src', this.image);
        }
        return;
    }
    /**
     * Retourne le nombre d'épisodes dans la saison
     * @returns {number}
     */
    get length() {
        return this.episodes.length;
    }
    /**
     * Récupère les épisodes de la saison sur l'API
     * @returns {Promise<Season>}
     */
    fetchEpisodes() {
        if (!this.number || this.number <= 0) {
            throw new Error('season number incorrect');
        }
        if (this.__fetches.fepisodes)
            return this.__fetches.fepisodes;
        const self = this;
        const params = {
            id: self._show.id,
            season: self.number
        };
        this.__fetches.fepisodes = UsBetaSeries.callApi('GET', 'shows', 'episodes', params, true)
            .then((data) => {
            if ((0, isNull)(self.episodes) || self.episodes.length <= 0) {
                self.episodes = new Array(data.episodes.length);
                for (let e = 0; e < data.episodes.length; e++) {
                    const selector = `#episodes .slides_flex .slide_flex:nth-child(${e + 1})`;
                    self.episodes[e] = new Episode(data.episodes[e], self, jQuery(selector));
                }
            }
            else {
                for (let e = 0; e < data.episodes.length; e++) {
                    // const selector = `#episodes .slides_flex .slide_flex:nth-child(${e+1})`;
                    const episode = self.getEpisode(data.episodes[e].id);
                    if (episode) {
                        episode.fill(data.episodes[e]);
                    }
                    else {
                        Season.debug('Season.checkEpisodes: episode(pos: %d) unknown', e, data.episodes[e]);
                        const selector = `#episodes .slides_flex .slide_flex:nth-child(${e + 1})`;
                        self.episodes.push(new Episode(data.episodes[e], self, jQuery(selector)));
                    }
                }
            }
            delete self.__fetches.fepisodes;
            return self;
        })
            .catch(err => {
            delete self.__fetches.fepisodes;
            console.warn('Season.fetchEpisodes error', err);
            return self;
        });
        return this.__fetches.fepisodes;
    }
    /**
     * Vérifie et met à jour les épisodes de la saison
     * @returns {Promise<Season>}
     */
    /* checkEpisodes(): Promise<Season> {
        if (!this.number || this.number <= 0) {
            throw new Error('season number incorrect');
        }
        if (this.__fetches.cepisodes) return this.__fetches.cepisodes;
        const self = this;
        const params = {
            id: self._show.id,
            season: self.number
        };
        this.__fetches.cepisodes = UsBetaSeries.callApi('GET', 'shows', 'episodes', params, true)
            .then((data: Obj) => {
                if (isNull(self.episodes) || self.episodes.length <= 0) {
                    self.episodes = [data.episodes.length];
                    for (let e = 0; e < data.episodes.length; e++) {
                        const selector = `#episodes .slides_flex .slide_flex:nth-child(${e+1})`;
                        self.episodes.push(new Episode(data.episodes[e], self, jQuery(selector)));
                    }
                } else {
                    for (let e = 0; e < data.episodes.length; e++) {
                        // const selector = `#episodes .slides_flex .slide_flex:nth-child(${e+1})`;
                        const episode = self.getEpisode(data.episodes[e].id);
                        if (episode) {
                            episode.fill(data.episodes[e]);
                        } else {
                            Season.debug('Season.checkEpisodes: episode(pos: %d) unknown', e, data.episodes[e]);
                            const selector = `#episodes .slides_flex .slide_flex:nth-child(${e+1})`;
                            self.episodes.push(new Episode(data.episodes[e], self, jQuery(selector)));
                        }
                    }
                }
                delete self.__fetches.cepisodes;
                return self;
            })
            .catch(err => {
                console.warn('Season.checkEpisodes error', err);
                delete self.__fetches.cepisodes;
                return self;
            });

        return this.__fetches.cepisodes as Promise<Season>;
    } */
    /**
     * Cette méthode permet de passer tous les épisodes de la saison en statut **seen**
     * @returns {Promise<Season>}
     */
    watched() {
        const self = this;
        const params = { id: this.episodes[this.length - 1].id, bulk: true };
        return UsBetaSeries.callApi(HTTP_VERBS.POST, 'episodes', 'watched', params)
            .then(() => {
            let update = false;
            for (let e = 0; e < self.episodes.length; e++) {
                if (e == self.episodes.length - 1)
                    update = true;
                self.episodes[e].user.seen = true;
                self.episodes[e].updateRender('seen', update);
            }
            return self;
        });
    }
    /**
     * Cette méthode permet de passer tous les épisodes de la saison en statut **hidden**
     * @returns {Promise<Season>}
     */
    hide() {
        const self = this;
        const params = { id: this._show.id, season: this.number };
        return UsBetaSeries.callApi(HTTP_VERBS.POST, 'seasons', 'hide', params)
            .then(() => {
            self.hidden = true;
            jQuery(`#seasons .slide_flex:nth-child(${self.number}) .slide__image`).prepend('<div class="checkSeen"></div><div class="hideIcon"></div>');
            let update = false;
            for (let e = 0; e < self.episodes.length; e++) {
                if (e == self.episodes.length - 1)
                    update = true;
                self.episodes[e].user.hidden = true;
                self.episodes[e].updateRender('hidden', update);
            }
            return self;
        });
    }
    /**
     * Retourne l'épisode correspondant à l'identifiant fournit
     * @param  {number} id
     * @returns {Episode | null}
     */
    getEpisode(id) {
        for (let e = 0; e < this.episodes.length; e++) {
            if (this.episodes[e].id === id) {
                return this.episodes[e];
            }
        }
        return null;
    }
    /**
     * Retourne le nombre d'épisodes vus
     * @returns {number} Le nombre d'épisodes vus dans la saison
     */
    getNbEpisodesSeen() {
        let nbEpisodesSeen = 0;
        for (let e = 0; e < this.episodes.length; e++) {
            if (this.episodes[e].user.seen)
                nbEpisodesSeen++;
        }
        return nbEpisodesSeen;
    }
    /**
     * Retourne le nombre d'épisodes non vus
     * @returns {number} Le nombre d'épisodes non vus dans la saison
     */
    getNbEpisodesUnwatched() {
        let nbEpisodes = 0;
        if (this.episodes.length <= 0 && !this.seen)
            return this.nbEpisodes;
        else if (this.episodes.length <= 0 || this.hidden)
            return 0;
        for (let e = 0; e < this.episodes.length; e++) {
            if (!this.episodes[e].user.seen)
                nbEpisodes++;
        }
        return nbEpisodes;
    }
    /**
     * Retourne le nombre d'épisodes spéciaux
     * @returns {number} Le nombre d'épisodes spéciaux
     */
    getNbEpisodesSpecial() {
        let nbEpisodesSpecial = 0;
        for (let e = 0; e < this.episodes.length; e++) {
            if (this.episodes[e].special)
                nbEpisodesSpecial++;
        }
        return nbEpisodesSpecial;
    }
    /**
     * Met à jour l'objet Show
     * @returns {Promise<Show>}
     */
    updateShow() {
        return this._show.update();
    }
    /**
     * Vérifie la modification des épisodes et met à jour le rendu HTML, ainsi que la série
     * @returns {Promise<Season>}
     */
    update() {
        const self = this;
        return this.fetchEpisodes().then(() => {
            Season.debug('Season.update: episodes', self.episodes);
            for (const episode of self.episodes) {
                Season.debug('Season.update: check episode changes', episode);
                if (episode.isModified()) {
                    Season.debug('Season.update changed true', self);
                    return self.updateRender()
                        .updateShow().then(() => self);
                }
            }
            Season.debug('Season.update no changes');
            return self;
        }).catch(err => {
            console.error(err);
            UsBetaSeries.notification('Erreur de mise à jour des épisodes', 'Season update: ' + err);
        });
    }
    /**
     * Change le statut visuel de la saison sur le site
     * @return {Season}
     */
    updateRender() {
        const self = this;
        const lenEpisodes = this.episodes.length;
        const lenSpecials = this.getNbEpisodesSpecial();
        const lenNotSpecials = lenEpisodes - lenSpecials;
        const lenSeen = self.getNbEpisodesSeen();
        Season.debug('Season.updateRender', { lenEpisodes, lenSpecials, lenNotSpecials, lenSeen });
        /**
         * Met à jour la vignette de la saison courante
         * et change de saison, si il y en a une suivante
         */
        const seasonViewed = function () {
            // On check la saison
            self.elt.find('.slide__image').prepend('<div class="checkSeen"></div>');
            Season.debug('Season.updateRender: Tous les épisodes de la saison ont été vus', self.elt, self.elt.next());
            // Si il y a une saison suivante, on la sélectionne
            if (self.elt.next('.slide_flex').length > 0) {
                Season.debug('Season.updateRender: Il y a une autre saison');
                self.elt.removeClass('slide--current');
                self.elt.next('.slide_flex').find('.slide__image').trigger('click');
            }
            self.elt
                .removeClass('slide--notSeen')
                .addClass('slide--seen');
            self.seen = true;
        };
        // Si tous les épisodes de la saison ont été vus
        if (lenSeen === lenEpisodes) {
            seasonViewed();
        }
        // Si tous les épisodes de la saison, hors spéciaux, ont été vus
        else if (lenSpecials > 0 && lenSeen === lenNotSpecials) {
            // eslint-disable-next-line no-undef
            new PopupAlert({
                title: 'Fin de la saison',
                text: 'Tous les épisodes de la saison, hors spéciaux, ont été vu.<br/>Voulez-vous passer à la saison suivante ?',
                callback_yes: () => {
                    seasonViewed();
                },
                callback_no: () => {
                    return true;
                }
            });
        }
        else {
            const $checkSeen = this.elt.find('.checkSeen');
            if ($checkSeen.length > 0) {
                $checkSeen.remove();
                if (!self.elt.hasClass('slide--notSeen')) {
                    self.elt
                        .addClass('slide--notSeen')
                        .removeClass('slide--seen');
                }
            }
            // On scroll jusqu'au premier épisode non vu
            const $epNotSeen = jQuery('#episodes .slide_flex.slide--notSeen');
            if ($epNotSeen.length > 0) {
                jQuery('#episodes .slides_flex').get(0).scrollLeft = $epNotSeen.get(0).offsetLeft - 69;
            }
        }
        return this;
    }
    /**
     * Modifie la saison courante de l'objet Show
     * @param   {number} seasonNumber Le numéro de la saison
     * @returns {Season}
     */
    changeCurrentSeason(seasonNumber) {
        this._show.setCurrentSeason(seasonNumber);
        return this;
    }
    /**
     * Indique si la série est sur le compte du membre connecté
     * @returns {boolean}
     */
    showInAccount() {
        return this._show.in_account;
    }
    /**
     * Définit la série comme étant sur le compte du membre connecté
     * @returns {Season}
     */
    addShowToAccount() {
        this._show.in_account = true;
        return this;
    }
    /**
     * Retourne le prochain épisode non vu
     * @return {Episode} Le prochain épisode non vu
     */
    getNextEpisodeUnwatched() {
        for (let e = 0; e < this.episodes.length; e++) {
            if (!this.episodes[e].user.seen)
                return this.episodes[e];
        }
        return null;
    }
}

class Episode extends MediaBase {
    static logger = new UsBetaSeries.setDebug('Episode');
    static debug = Episode.logger.debug.bind(Episode.logger);
    static selectorsCSS = {};
    static relatedProps = {
        // data: Obj => object: Show
        characters: { key: "characters", type: 'array', default: [] },
        code: { key: "code", type: 'string', default: '' },
        comments: { key: "nbComments", type: 'number', default: 0 },
        date: { key: "date", type: 'date', default: null },
        description: { key: "description", type: 'string', default: '' },
        episode: { key: "number", type: 'number', default: 0 },
        global: { key: "global", type: 'number', default: 0 },
        id: { key: "id", type: 'number' },
        note: { key: "objNote", type: Note },
        platform_links: { key: "platform_links", type: 'array', default: [] },
        resource_url: { key: "resource_url", type: 'string', default: '' },
        season: { key: "numSeason", type: 'number', default: 0 },
        seen_total: { key: "seen_total", type: 'number', default: 0 },
        special: { key: "special", type: 'boolean', default: false },
        subtitles: { key: "subtitles", type: 'array', default: [] },
        thetvdb_id: { key: "thetvdb_id", type: 'number', default: 0 },
        title: { key: "title", type: 'string', default: '' },
        user: { key: "user", type: User },
        youtube_id: { key: "youtube_id", type: 'string', default: '' }
    };
    static fetch(epId) {
        return UsBetaSeries.callApi(HTTP_VERBS.GET, 'episodes', 'display', { id: epId })
            .then((data) => {
            return new Episode(data.episode, null, jQuery('.blockInformations'));
        });
    }
    /**
     * L'objet Season contenant l'épisode
     * @type {Season}
     */
    _season;
    /**
     * Le code de l'épisode SXXEXX
     * @type {string}
     */
    code;
    /**
     * La date de sortie de l'épisode
     * @type {Date}
     */
    date;
    /**
     * @type {string}
     */
    director;
    /**
     * Le numéro de l'épisode dans la saison
     * @type {number}
     */
    number;
    /**
     * Le numéro de l'épisode dans la série
     * @type {number}
     */
    global;
    /**
     * Le numéro de la saison
     * @type {number}
     */
    numSeason;
    /**
     * Les plateformes de diffusion
     * @type {Platform_link[]}
     */
    platform_links;
    /**
     * @type {ReleasesSvod}
     */
    releasesSvod;
    /**
     * Nombre de membres de BS à avoir vu l'épisode
     * @type {number}
     */
    seen_total;
    /**
     * Indique si il s'agit d'un épisode spécial
     * @type {boolean}
     */
    special;
    /**
     * Tableau des sous-titres dispo sur BS
     * @type {Subtitle[]}
     */
    subtitles;
    /**
     * Identifiant de l'épisode sur thetvdb.com
     * @type {number}
     */
    thetvdb_id;
    /**
     * Tableau des amis ayant vu l'épisode
     * @type {WatchedBy[]}
     */
    watched_by;
    /**
     * Tableau des scénaristes de l'épisode
     * @type {string[]}
     */
    writers;
    /**
     * Identifiant de la vidéo sur Youtube
     * @type {string}
     */
    youtube_id;
    /**
     * Les requêtes en cours
     * @type {Object.<string, Promise<Episode>>}
     */
    __fetches;
    /**
     * Constructeur de la classe Episode
     * @param   {Obj}       data    Les données provenant de l'API
     * @param   {Season}    season  L'objet Season contenant l'épisode
     * @returns {Episode}
     */
    constructor(data, season, elt) {
        super(data, elt);
        this.__fetches = {};
        this._season = season;
        this.mediaType = { singular: MediaType.episode, plural: 'episodes', className: Episode };
        return this.fill(data)._initRender();
    }
    _initRender() {
        if (!this.elt) {
            return this;
        }
        if (this._season) {
            this.initCheckSeen(this.number - 1);
            this.addAttrTitle().addPopup();
            this.elt
                .attr('data-id', this.id)
                .attr('data-code', this.code)
                .attr('data-note-user', this.objNote.user)
                .attr('data-number', this.number)
                .attr('data-season', this.numSeason)
                .attr('data-special', this.special ? '1' : '0');
        }
        else {
            super._initRender();
        }
    }
    /**
     * Mise à jour de l'information du statut de visionnage de l'épisode
     * @returns {void}
     */
    updatePropRenderUser() {
        if (!this.elt)
            return;
        // TODO: comportement différent entre un épisode d'une saison et la page Episode
        if (this.season) {
            const $elt = this.elt.find('.checkSeen');
            if (this.user.seen && !$elt.hasClass('seen')) {
                this.updateRender('seen');
            }
            else if (!this.user.seen && $elt.hasClass('seen')) {
                this.updateRender('notSeen');
            }
            else if (this.user.hidden && jQuery('.hideIcon', this.elt).length <= 0) {
                this.updateRender('hidden');
            }
        }
        else {
            // Cocher/Décocher la case 'Vu'
            const $elt = jQuery('#reactjs-episode-actions', this.elt);
            const dataSeen = $elt.data('episodeUserHasSeen');
            if ((this.user.seen && dataSeen.length <= 0) ||
                (!this.user.seen && dataSeen === '1')) {
                this.updateBtnSeen();
            }
        }
        delete this.__changes.user;
    }
    updateBtnSeen() {
        if (!this.elt || this.season)
            return;
        const templatesBtnSvg = {
            seen: `<svg fill="#54709D" width="17.6" height="13.4" viewBox="2 3 12 10" xmlns="http://www.w3.org/2000/svg"><path fill="inherit" d="M6 10.78l-2.78-2.78-.947.94 3.727 3.727 8-8-.94-.94z"></path></svg>`,
            notSeen: `<svg fill="#FFF" width="18" height="18" xmlns="http://www.w3.org/2000/svg"><path d="M16 2v14H2V2h14zm0-2H2C.9 0 0 .9 0 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V2c0-1.1-.9-2-2-2z" fill-rule="nonzero"></path></svg>`
        };
        const $elt = jQuery('#reactjs-episode-actions');
        const $svg = jQuery('button svg', $elt);
        const dataSeen = $elt.data('episodeUserHasSeen');
        if (this.user.seen && dataSeen.length <= 0) {
            $svg.replaceWith(templatesBtnSvg.seen);
        }
        else if (!this.user.seen && dataSeen === '1') {
            $svg.replaceWith(templatesBtnSvg.notSeen);
        }
    }
    /**
     * Retourne l'objet Season associé à l'épisode
     * @returns {Season | null}
     */
    get season() {
        return this._season;
    }
    /**
     * Associe l'objet Season à l'épisode
     * @param {Season} saison - L'objet Season à associer à l'objet épisode
     */
    set season(saison) {
        this._season = this.season;
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
     * Ajoute la popup de description sur la vignette de l'épisode\
     * Ne fonctionne que si l'épisode fait partit d'une saison, sur la page d'une série
     * @returns {Episode}
     */
    addPopup() {
        if (!this.elt || !this._season) {
            return this;
        }
        const funcPlacement = (_tip, elt) => {
            const rect = elt.getBoundingClientRect(), width = jQuery(window).width(), sizePopover = 320;
            return ((rect.left + rect.width + sizePopover) > width) ? 'left' : 'right';
        };
        const $vignette = jQuery('.slide__image', this.elt);
        if ($vignette.length > 0) {
            const description = (this.description.length > 350) ?
                this.description.substring(0, 350) + '…' :
                (this.description.length <= 0) ? 'Aucune description' : this.description;
            $vignette.popover({
                container: $vignette.get(0),
                delay: { "show": 500, "hide": 100 },
                html: true,
                content: `<p>${description}</p>`,
                placement: funcPlacement,
                title: `<div><span style="color: var(--link_color);">Episode ${this.code}</span><div class="stars-outer note"><div class="stars-inner" style="width:${this.objNote.getPercentage()}%;" title="${this.objNote.toString()}"></div></div></div>`,
                trigger: 'hover',
                boundary: 'window'
            });
        }
        return this;
    }
    /**
     * Met à jour le DOMElement .checkSeen avec les
     * données de l'épisode (id, pos, special)
     * @param  {number} pos  La position de l'épisode dans la liste
     * @return {Episode}
     */
    initCheckSeen(pos) {
        const $checkbox = jQuery('.checkSeen', this.elt);
        if ($checkbox.length > 0 && this.user.seen) {
            // On ajoute l'attribut ID et la classe 'seen' à la case 'checkSeen' de l'épisode déjà vu
            $checkbox.attr('id', 'episode-' + this.id);
            $checkbox.attr('data-id', this.id);
            $checkbox.attr('data-pos', pos);
            $checkbox.attr('data-special', this.special ? '1' : '0');
            $checkbox.attr('title', UsBetaSeries.trans("member_shows.remove"));
            $checkbox.addClass('seen');
        }
        else if ($checkbox.length <= 0 && !this.user.seen && !this.user.hidden) {
            // On ajoute la case à cocher pour permettre d'indiquer l'épisode comme vu
            this.elt.find('.slide__image')
                .append(`<div id="episode-${this.id}"
                                class="checkSeen"
                                data-id="${this.id}"
                                data-pos="${pos}"
                                data-special="${this.special ? '1' : '0'}"
                                style="background: rgba(13,21,28,.2);"
                                title="${UsBetaSeries.trans("member_shows.markas")}"></div>`);
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
            Episode.debug('ajout de l\'attribut ID à l\'élément "checkSeen"');
            // On ajoute l'attribut ID
            $checkSeen.attr('id', 'episode-' + this.id);
            $checkSeen.data('id', this.id);
            $checkSeen.data('pos', pos);
            $checkSeen.data('special', this.special ? '1' : '0');
        }
        // if (BetaSeries.debug) Episode.debug('updateCheckSeen', {seen: this.user.seen, elt: this.elt, checkSeen: $checkSeen.length, classSeen: $checkSeen.hasClass('seen'), pos: pos, Episode: this});
        // Si le membre a vu l'épisode et qu'il n'est pas indiqué, on change le statut
        if (this.user.seen && $checkSeen.length > 0 && !$checkSeen.hasClass('seen')) {
            Episode.debug('Changement du statut (seen) de l\'épisode %s', this.code);
            this.updateRender('seen', false);
            changed = true;
        }
        // Si le membre n'a pas vu l'épisode et qu'il n'est pas indiqué, on change le statut
        else if (!this.user.seen && $checkSeen.length > 0 && $checkSeen.hasClass('seen')) {
            Episode.debug('Changement du statut (notSeen) de l\'épisode %s', this.code);
            this.updateRender('notSeen', false);
            changed = true;
        }
        else if (this.user.hidden && $checkSeen.length > 0) {
            $checkSeen.remove();
            this.updateRender('hidden', false);
            changed = true;
        }
        this.updateTitle();
        return changed;
    }
    /**
     * Met à jour le titre de l'épisode sur la page de la série
     * @returns {void}
     */
    updateTitle() {
        const $title = this.elt.find('.slide__title');
        if (`${this.code.toUpperCase()} - ${this.title}` !== $title.text().trim()) {
            $title.text(`${this.code.toUpperCase()} - ${this.title}`);
        }
    }
    /**
     * Définit le film, sur le compte du membre connecté, comme "vu"
     * @returns {void}
     */
    markAsView() {
        this.updateStatus('seen', HTTP_VERBS.POST);
    }
    /**
     * Définit le film, sur le compte du membre connecté, comme "non vu"
     * @returns {void}
     */
    markAsUnview() {
        this.updateStatus('unseen', HTTP_VERBS.DELETE);
    }
    /**
     * Modifie le statut d'un épisode sur l'API
     * @param  {String} status    Le nouveau statut de l'épisode
     * @param  {String} method    Verbe HTTP utilisé pour la requête à l'API
     * @return {void}
     */
    updateStatus(status, method) {
        const self = this;
        const pos = this.elt.find('.checkSeen').data('pos');
        const args = { id: this.id, bulk: true };
        let promise = new Promise(resolve => { resolve(false); });
        this.toggleSpinner(true);
        if (method === HTTP_VERBS.POST) {
            const createPromise = () => {
                return new Promise(resolve => {
                    // eslint-disable-next-line no-undef
                    new PopupAlert({
                        title: 'Episodes vus',
                        contentHtml: '<p>Doit-on cocher les épisodes précédents comme vu ?</p>',
                        yes: UsBetaSeries.trans('popup.yes'),
                        no: UsBetaSeries.trans('popup.no'),
                        callback_yes: () => {
                            resolve(true);
                        },
                        callback_no: () => {
                            resolve(false);
                        }
                    });
                    const btnNo = jQuery('#popin-dialog #popupalertno'), btnYes = jQuery('#popin-dialog #popupalertyes');
                    btnNo.attr('tabIndex', 0).focus();
                    btnYes.attr('tabIndex', 0).show();
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
        promise.then((response) => {
            if (method === HTTP_VERBS.POST && !response) {
                args.bulk = false; // Flag pour ne pas mettre les épisodes précédents comme vus automatiquement
            }
            UsBetaSeries.callApi(method, 'episodes', 'watched', args)
                .then((data) => {
                Episode.debug('updateStatus %s episodes/watched', method, data);
                // Si un épisode est vu et que la série n'a pas été ajoutée
                // au compte du membre connecté
                if (self._season && !self._season.showInAccount() && data.episode.show.in_account) {
                    self._season.addShowToAccount();
                }
                // On met à jour l'objet Episode
                if (self._season && method === HTTP_VERBS.POST && response && pos) {
                    const $vignettes = jQuery('#episodes .slide_flex');
                    let episode = null;
                    for (let e = 0; e < pos; e++) {
                        episode = self._season.episodes[e];
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
                self
                    .fill(data.episode)
                    /**
                     * L'update du rendu HTML se fait automatiquement avec les setter
                     * définient dans la méthode Base.fill, via les méthodes **updatePropRenderXXX**
                     * @see Base.fill
                     * @see Base.updatePropRender
                     */
                    ._callListeners(EventTypes.UPDATE);
                if (self.season) {
                    self.season.updateRender()
                        .updateShow().then(() => {
                        // Si il reste des épisodes à voir, on scroll
                        const $notSeen = jQuery('#episodes .slide_flex.slide--notSeen');
                        if ($notSeen.length > 0) {
                            jQuery('#episodes .slides_flex').get(0).scrollLeft =
                                $notSeen.get(0).offsetLeft - 69;
                        }
                        self.toggleSpinner(false);
                    });
                }
            })
                .catch(err => {
                console.error('updateStatus error %s', err);
                if (err && err == 'changeStatus') {
                    Episode.debug('updateStatus error %s changeStatus', method);
                    self.user.seen = (status === 'seen') ? true : false;
                    self.updateRender(status);
                    if (self.season) {
                        self._season
                            .updateRender()
                            .updateShow().then(() => {
                            self.toggleSpinner(false);
                        });
                    }
                }
                else {
                    self.toggleSpinner(false);
                    UsBetaSeries.notification('Erreur de modification d\'un épisode', 'updateStatus: ' + err);
                }
            });
        });
    }
    /**
     * Change le statut visuel de la vignette sur le site
     * @param  {String} newStatus     Le nouveau statut de l'épisode (seen, notSeen, hidden)
     * @param  {bool}   [update=true] Mise à jour de la ressource en cache et des éléments d'affichage
     * @return {Episode}
     */
    updateRender(newStatus, update = true) {
        const $elt = this.elt.find('.checkSeen');
        Episode.debug('Episode.changeStatus (season: %d, episode: %d, statut: %s)', this.season.number, this.number, newStatus, { elt: $elt, update: update });
        if (newStatus === 'seen') {
            $elt.css('background', ''); // On ajoute le check dans la case à cocher
            $elt.addClass('seen'); // On ajoute la classe 'seen'
            $elt.attr('title', UsBetaSeries.trans("member_shows.remove"));
            // On supprime le voile masquant sur la vignette pour voir l'image de l'épisode
            $elt.parents('div.slide__image').first().find('img').removeAttr('style');
            $elt.parents('div.slide_flex').first().removeClass('slide--notSeen');
        }
        else if (newStatus === 'notSeen') {
            $elt.css('background', 'rgba(13,21,28,.2)'); // On enlève le check dans la case à cocher
            $elt.removeClass('seen'); // On supprime la classe 'seen'
            $elt.attr('title', UsBetaSeries.trans("member_shows.markas"));
            // On remet le voile masquant sur la vignette de l'épisode
            $elt.parents('div.slide__image').first()
                .find('img')
                .attr('style', 'filter: blur(5px);');
            const contVignette = $elt.parents('div.slide_flex').first();
            if (!contVignette.hasClass('slide--notSeen')) {
                contVignette.addClass('slide--notSeen');
            }
        }
        else if (newStatus === 'hidden') {
            $elt.removeClass('seen');
            $elt.parents('.slide__image')
                .append('<div class="hideIcon"></div>')
                .attr('style', 'filter: blur(5px);');
        }
        return this;
    }
    /**
     * Affiche/masque le spinner de modification de l'épisode
     *
     * @param  {boolean}  display  Le flag indiquant si afficher ou masquer
     * @return {Episode}
     */
    toggleSpinner(display) {
        if (!display) {
            jQuery('.spinner').remove();
            // if (BetaSeries.debug) Episode.debug('toggleSpinner');
            if (Episode.logger.enabled)
                console.groupEnd();
        }
        else {
            if (Episode.logger.enabled)
                console.groupCollapsed('episode checkSeen');
            // if (BetaSeries.debug) Episode.debug('toggleSpinner');
            this.elt.find('.slide__image').first().prepend(`
                <div class="spinner">
                    <div class="spinner-item"></div>
                    <div class="spinner-item"></div>
                    <div class="spinner-item"></div>
                </div>`);
        }
        return this;
    }
    /**
     * Retourne une image, si disponible, en fonction du format désiré
     * @return {Promise<string>}                         L'URL de l'image
     */
    getDefaultImage() {
        /*const proxy = Base.serverBaseUrl + '/proxy/';
        const initFetch: RequestInit = { // objet qui contient les paramètres de la requête
            method: 'GET',
            headers: {
                'origin': 'https://www.betaseries.com',
                'x-requested-with': ''
            },
            mode: 'cors',
            cache: 'no-cache'
        };*/
        return new Promise((res) => {
            return res(`${UsBetaSeries.api.url}/pictures/episodes?id=${this.id}`);
            /*else {
                fetch(`${proxy}https://thetvdb.com/?tab=series&id=${this.thetvdb_id}`, initFetch)
                .then((resp: Response) => {
                    if (resp.ok) {
                        return resp.text();
                    }
                    return null;
                }).then(html => {
                    if (html == null) {
                        return rej('HTML error');
                    }
                    const parser = new DOMParser();
                    const doc: Document = parser.parseFromString(html, 'text/html');
                    const link: HTMLLinkElement = doc.querySelector('.container .row a[rel="artwork_backgrounds"]');
                    res(link.href.replace('original', 'w500'));
                }).catch(err => rej(err));
            }*/
        });
    }
    /**
     * Récupère les personnages de l'épisode
     * @returns {Promise<this>}
     */
    fetchCharacters() {
        const self = this;
        if (this.__fetches.characters)
            return this.__fetches.characters;
        this.__fetches.characters = UsBetaSeries.callApi(HTTP_VERBS.GET, 'episodes', 'characters', { id: this.id }, true)
            .then((data) => {
            self.characters = [];
            if (data?.characters?.length <= 0) {
                return self;
            }
            for (let c = 0; c < data.characters.length; c++) {
                self.characters.push(new Character(data.characters[c]));
            }
            return self;
        }).finally(() => delete self.__fetches.characters);
        return this.__fetches.characters;
    }
}

/**
 * Similar
 * @class
 * @extends Media
 * @implements {implShow}
 * @implements {implMovie}
 */
class Similar extends Media {
    static logger = new UsBetaSeries.setDebug('Similar');
    static debug = Similar.logger.debug.bind(Similar.logger);
    static relatedProps = {};
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
    nbSeasons;
    showrunner;
    social_links;
    status;
    thetvdb_id;
    persons;
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
     * @override
     */
    fill(data) {
        if (this.mediaType.singular === MediaType.show) {
            Similar.relatedProps = Show.relatedProps;
            this.seasons = [];
            this.persons = [];
        }
        else if (this.mediaType.singular === MediaType.movie) {
            Similar.relatedProps = Movie.relatedProps;
            this.platform_links = [];
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
        return UsBetaSeries.callApi('GET', this.mediaType.plural, action, { id: this.id }, force);
    }
    /**
     * Ajoute le bandeau Viewed sur le poster du similar
     * @return {Similar}
     */
    addViewed() {
        const $slideImg = this.elt.find('a.slide__image');
        // Si la série a été vue ou commencée
        if (this.user.status &&
            ((this.mediaType.singular === MediaType.movie && this.user.status === 1) ||
                (this.mediaType.singular === MediaType.show && this.user.status > 0))) {
            // On ajoute le bandeau "Viewed"
            $slideImg.prepend(`<img src="${UsBetaSeries.serverBaseUrl}/img/viewed.png" class="bandViewed"/>`);
        }
        // On ajoute des infos pour la recherche du similar pour les popups
        $slideImg
            .attr('data-id', this.id)
            .attr('data-type', this.mediaType.singular);
        return this;
    }
    /**
     * Ajoute l'icône wrench à côté du titre du similar
     * pour permettre de visualiser les données du similar
     * @param   {implDialog} dialog L'objet Dialog pour afficher les données
     * @returns {Similar}
     */
    wrench(dialog) {
        const $title = this.elt.find('.slide__title'), self = this;
        $title.html($title.html() +
            `<i class="fa-solid fa-wrench popover-wrench"
                aria-hidden="true"
                style="margin-left:5px;cursor:pointer;"
                data-id="${self.id}"
                data-type="${self.mediaType.singular}">
            </i>`);
        $title.find('.popover-wrench').click((e) => {
            e.stopPropagation();
            e.preventDefault();
            //if (debug) Similar.debug('Popover Wrench', eltId, self);
            this.fetch().then(function (data) {
                // eslint-disable-next-line no-undef
                dialog.setContent(renderjson.set_show_to_level(2)(data[self.mediaType.singular]));
                dialog.setCounter(UsBetaSeries.counter.toString());
                dialog.setTitle('Données du similar');
                dialog.show();
            });
        });
        return this;
    }
    /**
     * Retourne le contenu HTML pour la popup
     * de présentation du similar
     * @return {string}
     */
    async getContentPopup() {
        const self = this;
        //if (debug) Similar.debug('similars tempContentPopup', objRes);
        let description = this.description;
        if (description.length > 200) {
            description = description.substring(0, 200) + '…';
        }
        let template = '';
        function _renderCreation() {
            let html = '';
            if (self.creation || self.country || self.production_year) {
                html += '<p>';
                if (self.production_year) {
                    html += `<u>Production:</u> <strong>${self.production_year}</strong>`;
                }
                if (self.country) {
                    html += `<u>Pays:</u> <strong>${self.country}</strong>`;
                }
                if (self.creation) {
                    html += `<span style="margin-left:5px;">${self.creation}</span>`;
                }
                html += '</p>';
            }
            return html;
        }
        function _renderGenres() {
            if (self.genres && self.genres.length > 0) {
                return '<p><u>Genres:</u> ' + self.genres.join(', ') + '</p>';
            }
            return '';
        }
        template = '<div>';
        if (this.mediaType.singular === MediaType.show) {
            const status = `<i class="fa-solid fa-${this.status.toLowerCase() == 'ended' ? 'octagon-exclamation' : 'spinner'}" title="Statut ${this.status.toLowerCase() == 'ended' ? 'terminé' : 'en cours'}" aria-hidden="true"></i>`;
            const seen = (this.user.status > 0) ? 'Vu à <strong>' + this.user.status + '%</strong>' : 'Pas vu';
            template += `<p>
                <strong>${this.nbSeasons}</strong> saison${(this.nbSeasons > 1 ? 's' : '')},
                <strong>${this.nbEpisodes}</strong> <i class="fa-solid fa-films" title="épisodes" aria-hidden="true"></i>, `;
            if (this.objNote.total > 0) {
                template += `<strong>${this.objNote.total}</strong> votes`;
                if (this.objNote.user > 0) {
                    template += `, votre note: ${this.objNote.user}`;
                }
            }
            else {
                template += 'Aucun vote';
            }
            template += `<span style="margin-left:5px;"><strong>${self.nbComments}</strong> <i class="fa-solid fa-comments" title="commentaires" aria-hidden="true"></i></span>`;
            if (!this.in_account) {
                template += `<span style="margin-left:5px;">
                    <a href="javascript:;" class="addShow"><i class="fa-solid fa-plus" title="Ajouter" aria-hidden="true"></i></a> -`;
                const storeToSee = await UsBetaSeries.gm_funcs.getValue('toSee', []);
                const toSee = storeToSee.includes(this.id);
                if (toSee) {
                    template += `<a href="javascript:;" class="toSeeShow" data-show-id="${self.id}">
                        <i class="fa-solid fa-clock-rotate-left" title="Ne plus voir" aria-hidden="true"></i>
                    </a></span>`;
                }
                else {
                    template += `<a href="javascript:;" class="toSeeShow" data-show-id="${self.id}">
                        <i class="fa-solid fa-user-clock" title="A voir" aria-hidden="true"></i>
                    </a></span>`;
                }
            }
            template += '</p>';
            template += _renderGenres();
            template += _renderCreation();
            let archived = '';
            if (this.user.status > 0 && this.user.archived === true) {
                archived = ', Archivée: <i class="fa-solid fa-circle-check" aria-hidden="true"></i>';
            }
            else if (this.user.status > 0) {
                archived = ', Archivée: <i class="fa-solid fa-circle" aria-hidden="true"></i>';
            }
            if (this.showrunner && this.showrunner.name.length > 0) {
                template += `<p><u>Show Runner:</u> <strong>${this.showrunner.name}</strong></p>`;
            }
            template += `<p><u>Statut:</u> ${status}, ${seen}${archived}</p>`;
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
            template += `<span style="margin-left:5px;"><strong>${self.nbComments}</strong> <i class="fa-solid fa-comments" title="commentaires" aria-hidden="true"></i></span>`;
            template += '</p>';
            // Ajouter une case à cocher pour l'état "Vu"
            template += `<p><label for="seen">Vu</label>
                <input type="radio" class="movie movieSeen" name="movieState" value="1" data-movie="${this.id}" ${this.user.status === 1 ? 'checked' : ''} style="margin-right:5px;vertical-align:middle;"></input>`;
            // Ajouter une case à cocher pour l'état "A voir"
            template += `<label for="mustSee">A voir</label>
                <input type="radio" class="movie movieMustSee" name="movieState" value="0" data-movie="${this.id}" ${this.user.status === 0 ? 'checked' : ''} style="margin-right:5px;vertical-align:middle;"></input>`;
            // Ajouter une case à cocher pour l'état "Ne pas voir"
            template += `<label for="notSee">Ne pas voir</label>
                <input type="radio" class="movie movieNotSee" name="movieState" value="2" data-movie="${this.id}"  ${this.user.status === 2 ? 'checked' : ''} style="vertical-align:middle;"></input>`;
            template += `<button class="btn btn-danger reset" style="margin-left:10px;padding:2px 5px;${this.user.status < 0 ? 'display:none;' : ''}">Reset</button></p>`;
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
        // if (BetaSeries.debug) Similar.debug('getTitlePopup', this);
        let title = this.title;
        if (this.objNote.total > 0) {
            title += ' <span style="font-size: 0.8em;color:var(--link_color);">' +
                this.objNote.mean.toFixed(2) + ' / 5</span>';
        }
        if (this.mediaType.singular === MediaType.show)
            title += ` <span style="float:right;">
                <a href="http://www.thetvdb.com/?tab=series&id=${this.thetvdb_id}" target="_blank" title="Lien vers la page de TheTVDB">
                    <img src="https://thetvdb.com/images/logo.svg" width="40px" />
                </a>
                <a href="javascript:;" onclick="showUpdate('${this.title}', ${this.id}, '0')" style="margin-left:5px; color:var(--default_color);" title="Mettre à jour les données venant de TheTVDB">
                    <i class="fa-solid fa-arrows-rotate" aria-hidden="true"></i>
                </a>
            </span>`;
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
        const $img = this.elt.find('img.js-lazy-image'), self = this;
        if ($img.length > 0) {
            return this;
        }
        if (this.mediaType.singular === MediaType.show) {
            if (this.images.poster !== null) {
                // On tente de remplacer le block div 404 par une image
                this.elt.find('div.block404').replaceWith(`
                    <img class="u-opacityBackground fade-in"
                            width="125"
                            height="188"
                            alt="Affiche de la série ${this.title}"
                            src="${this.images.poster}"/>`);
            }
            else {
                const proxy = UsBetaSeries.serverBaseUrl + '/posters/';
                const initFetch = {
                    method: 'GET',
                    headers: {
                        'origin': 'https://www.betaseries.com',
                        'x-requested-with': 'userscript-bs'
                    },
                    mode: 'cors',
                    cache: 'no-cache'
                };
                this._getTvdbUrl(this.thetvdb_id).then(url => {
                    if (!url)
                        return;
                    const urlTvdb = new URL(url);
                    fetch(`${proxy}${urlTvdb.pathname}`, initFetch)
                        .then((resp) => {
                        if (resp.ok) {
                            return resp.text();
                        }
                        return null;
                    }).then(html => {
                        if (html == null)
                            return;
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(html, 'text/html');
                        const link = doc.querySelector('.container .row a[rel="artwork_posters"]');
                        if (link) {
                            this.elt.find('div.block404').replaceWith(`
                                <img class="u-opacityBackground fade-in"
                                        width="125"
                                        height="188"
                                        alt="Affiche de la série ${self.title}"
                                        src="${link.href}"/>`);
                        }
                    });
                });
            }
        }
        else if (this.mediaType.singular === MediaType.movie && this.tmdb_id && this.tmdb_id > 0) {
            if (UsBetaSeries.themoviedb_api_user_key.length <= 0)
                return;
            const uriApiTmdb = `https://api.themoviedb.org/3/movie/${this.tmdb_id}?api_key=${UsBetaSeries.themoviedb_api_user_key}&language=fr-FR`;
            fetch(uriApiTmdb).then(response => {
                if (!response.ok)
                    return null;
                return response.json();
            }).then(data => {
                if (data !== null && data.poster_path !== undefined && data.poster_path !== null) {
                    self.elt.find('div.block404').replaceWith(`
                        <img class="u-opacityBackground fade-in"
                                width="125"
                                height="188"
                                alt="Poster de ${self.title}"
                                src="https://image.tmdb.org/t/p/original${data.poster_path}"/>`);
                }
            });
        }
        return this;
    }
    /**
     * Add Show to account member
     * @return {Promise<Similar>} Promise of show
     */
    addToAccount(state = 0) {
        if (this.in_account)
            return Promise.resolve(this);
        return this.changeState(state);
    }
    /**
     * Modifie le statut du similar
     * @param   {number} state Le nouveau statut du similar
     * @returns {Promise<Similar>}
     */
    changeState(state) {
        if (state < -1 || state > 2) {
            throw new Error("Parameter state is incorrect: " + state.toString());
        }
        const self = this;
        const params = { id: this.id };
        let verb = HTTP_VERBS.POST;
        if (state === -1 && this.mediaType.singular === MediaType.movie) {
            verb = HTTP_VERBS.DELETE;
        }
        else if (this.mediaType.singular === MediaType.movie) {
            params.state = state;
        }
        return UsBetaSeries.callApi(verb, this.mediaType.plural, this.mediaType.singular, params)
            .then((data) => {
            self.fill(data[self.mediaType.singular]);
            // En attente de la résolution du bug https://www.betaseries.com/bugs/api/462
            if (verb === HTTP_VERBS.DELETE) {
                self.in_account = false;
                self.user.status = -1;
                self.save();
            }
            return self;
        })
            .catch(err => {
            console.warn('Erreur changeState similar', err);
            UsBetaSeries.notification('Change State Similar', 'Erreur lors du changement de statut: ' + err.toString());
            return self;
        });
    }
    /**
     * Ajoute une note au média
     * @param   {number} note Note du membre connecté pour le média
     * @returns {Promise<boolean>}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    addVote(note) {
        throw new Error('On ne vote pas pour un similar');
    }
}

class UpdateAuto {
    static logger = new UsBetaSeries.setDebug('UpdateAuto');
    static debug = UpdateAuto.logger.debug.bind(UpdateAuto.logger);
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
    /**
     * Objet Show contenant les infos de la série
     * @type {Show}
     */
    _show;
    /**
     * Identifiant de la série
     * @type {number}
     */
    _showId;
    /**
     * Flag indiquant si une config updateAuto existe déjà
     * en mémoire
     * @type {boolean}
     */
    _exist;
    /**
     * Etat de la tâche de mise à jour
     * @type {boolean}
     */
    _status;
    /**
     * Flag indiquant si la mise à jour doit être lancée automatiquement
     * @type {boolean}
     */
    _auto;
    /**
     * Intervalle des mises à jour
     * @type {number}
     */
    _interval;
    /**
     * Timer des mises à jour
     * @type {NodeJS.Timer}
     */
    _timer;
    /**
     * DateTime de la dernière mise à jour
     * @type {Date}
     */
    _lastUpdate;
    /**
     * Constructeur privé, modèle Singleton
     * @private
     * @param {Show} show - L'objet Show sur lequel faire les mises à jour
     * @returns {UpdateAuto} L'instance de mise à jour
     */
    constructor(show) {
        if (UpdateAuto.instance) {
            return UpdateAuto.instance;
        }
        this._show = show;
        this._showId = show.id;
        return this;
    }
    async _init() {
        const objUpAuto = await UsBetaSeries.gm_funcs.getValue('objUpAuto', {});
        this._exist = false;
        this._lastUpdate = null;
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
    /**
     * Retourne l'instance de l'objet de mise à jour auto des épisodes
     * @static
     * @param   {Show} [s] - L'objet de la série
     * @returns {UpdateAuto}
     */
    static getInstance(s) {
        if (!UpdateAuto.instance && s) {
            UpdateAuto.instance = new UpdateAuto(s);
            return this.instance._init();
        }
        else if (!UpdateAuto.instance && !s) {
            return Promise.reject('Parameter Show required');
        }
        return Promise.resolve(UpdateAuto.instance);
    }
    /**
     * _save - Sauvegarde les options de la tâche d'update
     * auto dans l'espace de stockage de Tampermonkey
     *
     * @private
     * @return {UpdateAuto} L'instance unique UpdateAuto
     */
    async _save() {
        const objUpAuto = await UsBetaSeries.gm_funcs.getValue('objUpAuto', {});
        const obj = {
            status: this._status,
            auto: this._auto,
            interval: this._interval
        };
        objUpAuto[this._showId] = obj;
        UsBetaSeries.gm_funcs.setValue('objUpAuto', objUpAuto);
        this._exist = true;
        this.changeColorBtn();
        return this;
    }
    /**
     * Retourne l'objet sous forme d'objet simple, sans référence circulaire,
     * pour la méthode JSON.stringify
     * @returns {object}
     */
    toJSON() {
        return {
            status: this.status,
            auto: this.auto,
            interval: this.interval
        };
    }
    /**
     * Retourne l'objet Show associé
     * @returns {Show}
     */
    get show() {
        return this._show;
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
        if (typeof status !== 'boolean') {
            throw new TypeError(`UpdateAuto.set status: Parameter type error. Required type: boolean`);
        }
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
        if (typeof auto !== 'boolean') {
            throw new TypeError(`UpdateAuto.set auto: Parameter type error. Required type: boolean`);
        }
        this._auto = auto;
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
        if (typeof val !== 'number') {
            throw new TypeError(`UpdateAuto.set interval: Parameter type error. Required type: number`);
        }
        this._interval = val;
    }
    /**
     * Retourne la date de la dernière mise à jour éffectuée
     * @return {Date} La date de la dernière mise à jour
     */
    get lastUpdate() {
        return this._lastUpdate;
    }
    /**
     * changeColorBtn - Modifie la couleur du bouton d'update
     * des épisodes sur la page Web
     *
     * @return {UpdateAuto} L'instance unique UpdateAuto
     */
    changeColorBtn() {
        let color = '#fff'; // Status unknown
        if (!this._exist) {
            // The task doesn't exists
            color = '#6c757d'; // grey
        }
        else if (this._status && this._auto) {
            // The task running
            color = '#28a745'; // green
        }
        else if (this._auto && !this._status) {
            // The task configured but not launched
            color = '#fd7e14'; // orange
        }
        else if (!this._auto && !this._status) {
            // The task not configured and not launched
            color = '#dc3545'; // red
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
        if (!this.status) {
            UpdateAuto.debug('%cUpdateAuto%c: task stop (%cnot started%c)', 'color:#fd7e14', 'color:inherit', 'color:#dc3545', 'color:inherit');
            return this;
        }
        UpdateAuto.debug('%cUpdateAuto%c: task stop', 'color:#fd7e14', 'color:inherit');
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
        this._lastUpdate = null;
        this.changeColorBtn();
        return this;
    }
    /**
     * delete - Supprime les options d'update auto
     * de la série de l'espace de stockage
     *
     * @return {UpdateAuto} L'instance unique UpdateAuto
     */
    async delete() {
        if (!this._exist) {
            UpdateAuto.debug('%cUpdateAuto%c: task delete (%cnot exists%c)', 'color:#dc3545', 'color:inherit', 'color:#fd7e14', 'color:inherit');
            return Promise.resolve(this);
        }
        UpdateAuto.debug('%cUpdateAuto%c: task delete', 'color:#dc3545', 'color:inherit');
        this.stop();
        const objUpAuto = await UsBetaSeries.gm_funcs.getValue('objUpAuto', {});
        if (objUpAuto[this._showId] !== undefined) {
            delete objUpAuto[this._showId];
            UsBetaSeries.gm_funcs.setValue('objUpAuto', objUpAuto);
            this._auto = false;
            this._interval = 0;
            this._exist = false;
            this.changeColorBtn();
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
        if (this.status && (!this.auto || this.interval <= 0)) {
            UpdateAuto.debug('close interval updateEpisodeListAuto');
            return this.stop();
        }
        // Si les options modifiées pour lancer
        else if (this.auto && this.interval > 0) {
            if (this._show.user.remaining <= 0) {
                // Si il reste des épisodes non vus dans la saison courante
                if (this._show.currentSeason.getNbEpisodesUnwatched() > 0) {
                    // On check une dernière fois
                    this._tick();
                }
                // On arrête la mise à jour automatique
                this.stop();
                return this;
            }
            if (this._timer) {
                UpdateAuto.debug('close old interval timer');
                clearInterval(this._timer);
            }
            UpdateAuto.debug('%cUpdateAuto%c: task launch', 'color:#28a745', 'color:inherit');
            if (!this.status)
                this.status = true;
            this._tick();
            this._timer = setInterval(this._tick.bind(this), (this.interval * 60) * 1000);
            this.changeColorBtn();
        }
        return this;
    }
    /**
     * _tick: Fonction Tick pour la mise à jour des épisodes à intervalle régulère
     * @private
     * @returns {void}
     */
    _tick() {
        this._lastUpdate = Date.now();
        UpdateAuto.debug('[%s] UpdateAuto tick', (new Date).format('datetime'));
        jQuery('#episodes .updateEpisodes').trigger('click');
        if (!this.status) {
            this.status = true;
        }
        // if (BetaSeries.debug) UpdateAuto.debug('UpdateAuto setInterval objShow', Object.assign({}, this));
        if (!this.auto || this.show.user.remaining <= 0) {
            UpdateAuto.debug('Arrêt de la mise à jour auto des épisodes');
            this.stop();
        }
    }
    /**
     * Retourne le temps restant avant le prochain update
     * sous forme mm:ss
     * @returns {string}
     */
    remaining() {
        if (this._lastUpdate == null)
            return 'not running';
        const elapsedTime = Date.now() - this._lastUpdate;
        const remainingTime = Math.floor((((this._interval * 60) * 1000) - elapsedTime) / 1000);
        const minutes = Math.floor(remainingTime / 60);
        const seconds = remainingTime - minutes * 60;
        return minutes.toString() + ':' + ((seconds < 10) ? '0' + seconds.toString() : seconds.toString());
    }
}

/**
 * DaysOfWeek
 * @enum
 * @memberof Stats
 * @alias DaysOfWeek
 */
var DaysOfWeek;
(function (DaysOfWeek) {
    DaysOfWeek["monday"] = "lundi";
    DaysOfWeek["tuesday"] = "mardi";
    DaysOfWeek["wednesday"] = "mercredi";
    DaysOfWeek["thursday"] = "jeudi";
    DaysOfWeek["friday"] = "vendredi";
    DaysOfWeek["saturday"] = "samedi";
    DaysOfWeek["sunday"] = "dimanche";
})(DaysOfWeek = DaysOfWeek || (DaysOfWeek = {}));
/**
 * Stats
 * @class
 * @memberof Member
 */
class Stats {
    friends;
    shows;
    seasons;
    episodes;
    comments;
    progress;
    episodes_to_watch;
    time_on_tv;
    time_to_spend;
    movies;
    badges;
    member_since_days;
    friends_of_friends;
    episodes_per_month;
    favorite_day;
    five_stars_percent;
    four_five_stars_total;
    streak_days;
    favorite_genre;
    written_words;
    without_days;
    shows_finished;
    shows_current;
    shows_to_watch;
    shows_abandoned;
    movies_to_watch;
    time_on_movies;
    time_to_spend_movies;
    constructor(data) {
        for (const key in Object.keys(data)) {
            this[key] = data[key];
        }
    }
}
/**
 * OptionsMember
 * @class
 * @memberof Member
 */
class OptionsMember {
    downloaded;
    notation;
    timelag;
    global;
    specials;
    episodes_tri;
    friendship;
    country;
    language;
    mail_mois;
    mail_hebdo;
    notification_news;
    twitter_auto;
    constructor(data) {
        for (const key in Object.keys(data)) {
            this[key] = data[key];
        }
    }
}
/* eslint-disable-next-line no-unused-vars */
class Member {
    /*
                    STATIC
     */
    static logger = new UsBetaSeries.setDebug('Member');
    static debug = Member.logger.debug.bind(Member.logger);
    static relatedProps = {
        "id": { key: "id", type: 'number' },
        "fb_id": { key: "fb_id", type: 'number' },
        "login": { key: "login", type: 'string' },
        "xp": { key: "xp", type: 'number' },
        "locale": { key: "locale", type: 'string' },
        "cached": { key: "cached", type: 'number' },
        "avatar": { key: "avatar", type: 'string' },
        "profile_banner": { key: "profile_banner", type: 'string' },
        "in_account": { key: "in_account", type: 'boolean' },
        "is_admin": { key: "is_admin", type: 'boolean', default: false },
        "subscription": { key: "subscription", type: 'number' },
        "valid_email": { key: "valid_email", type: 'boolean', default: false },
        "screeners": { key: "screeners", type: 'array<string>', default: [] },
        "twitterLogin": { key: "twitterLogin", type: 'string' },
        "stats": { key: "stats", type: Stats },
        "options": { key: "options", type: OptionsMember }
    };
    /**
     * Retourne les infos du membre connecté
     * @returns {Promise<Member>} Une instance du membre connecté
     */
    static fetch() {
        const params = {};
        if (UsBetaSeries.userId !== null) {
            params.id = UsBetaSeries.userId;
        }
        return UsBetaSeries.callApi(HTTP_VERBS.GET, 'members', 'infos', params)
            .then((data) => {
            return new Member(data.member);
        })
            .catch(err => {
            console.warn('Erreur lors de la récupération des infos du membre', err);
            throw new Error("Erreur de récupération du membre");
        });
    }
    /*
                    PROPERTIES
     */
    /**
     * Identifiant du membre
     * @type {number}
     */
    id;
    /**
     * Identifiant Facebook ?
     * @type {number}
     */
    fb_id;
    /**
     * Login du membre
     * @type {string}
     */
    login;
    /**
     * Points d'expérience
     * @type {number}
     */
    xp;
    /**
     * Locale utiliser par le membre
     * @type {string}
     */
    locale;
    /**
     * ???
     * @type {number}
     */
    cached;
    /**
     * URL de l'avatar du membre
     * @type {string}
     */
    avatar;
    /**
     * URL de la bannière du membre
     * @type {string}
     */
    profile_banner;
    /**
     * ???
     * @type {boolean}
     */
    in_account;
    /**
     * Membre Administrateur ?
     * @type {boolean}
     */
    is_admin;
    /**
     * Année d'inscription
     * @type {number}
     */
    subscription;
    /**
     * Indique si l'adresse mail a été validée
     * @type {boolean}
     */
    valid_email;
    /**
     * ???
     * @type {string[]}
     */
    screeners;
    /**
     * Login Twitter
     * @type {string}
     */
    twitterLogin;
    /**
     * Les statistiques du membre
     * @type {Stats}
     */
    stats;
    /**
     * Les options de paramétrage du membre
     * @type {OptionsMember}
     */
    options;
    /**
     * Tableau des notifications du membre
     * @type {NotificationList}
     */
    _notifications;
    __decorators = {
        fill: new FillDecorator(this)
    };
    __initial = true;
    __changes = {};
    __props = [];
    elt;
    /*
                    METHODS
     */
    /**
     * Constructeur de la classe Membre
     * @param data Les données provenant de l'API
     * @returns {Member}
     */
    constructor(data) {
        this.notifications = new NotificationList();
        return this.fill(data);
    }
    get notifications() {
        return this._notifications;
    }
    /**
     * Définit la propriété `notifications` et lui ajoute un listener sur l'event SEEN
     * @param  {NotificationList} list - La liste des notifications
     * @throws {TypeError}
     */
    set notifications(list) {
        if (!(list instanceof NotificationList)) {
            throw new TypeError("Property notifications must be an instance of NotificationList");
        }
        this._notifications = list;
        /**
         *
         * @param {CustomEvent} event
         * @this NotificationList
         */
        const addBadgeNotifs = function (event) {
            Member.debug('NotificationList.setter notifications - function addBadgeNotifs', event, this);
            if (jQuery('.menu-icon--bell').length > 0) {
                jQuery('.menu-icon--bell').replaceWith(`<span class="menu-icon menu-icon-bell fa-solid fa-bell"></span>`);
            }
            const $bell = jQuery('.menu-item.js-growl-container .menu-icon-bell');
            const $badge = jQuery('#menuUnseenNotifications');
            if (this.hasNew()) {
                if ($badge.length <= 0) {
                    // Alerter le membre de nouvelles notifications
                    jQuery('.menu-wrapper .js-iconNotifications').append(`<i class="unread-count unread-notifications" id="menuUnseenNotifications">${this.new.length}</i>`);
                }
                else {
                    $badge.text(this.new.length);
                }
            }
            else if ($badge.length > 0) {
                $badge.remove();
            }
            $bell.toggleClass('fa-shake', this.hasNew());
        };
        const removeBadgeNotifs = function (event) {
            Member.debug('NotificationList.setter notifications - function removeBadgeNotifs', event, this);
            jQuery('#menuUnseenNotifications').remove();
            jQuery('.menu-item.js-growl-container .menu-icon-bell').removeClass('fa-shake');
            localStorage.setItem('notifications', JSON.stringify(this));
        };
        this._notifications
            .on(EventTypes.NEW, addBadgeNotifs)
            .on(EventTypes.SEEN, removeBadgeNotifs);
    }
    /**
     * Remplit l'objet avec les données fournit en paramètre
     * @param   {Obj} data - Les données provenant de l'API
     * @returns {Member}
     */
    fill(data) {
        try {
            return this.__decorators.fill.fill.call(this, data);
        }
        catch (err) {
            console.error(err);
        }
    }
    /**
     * Met à jour le rendu HTML des propriétés de l'objet,
     * si un sélecteur CSS exite pour la propriété fournit en paramètre\
     * **Méthode appelée automatiquement par le setter de la propriété**
     * @see Show.selectorsCSS
     * @param   {string} propKey - La propriété de l'objet à mettre à jour
     * @returns {void}
     */
    updatePropRender(propKey) {
        try {
            this.__decorators.fill.updatePropRender.call(this, propKey);
        }
        catch (err) {
            console.error(err);
        }
    }
    /**
     * Retourne l'objet sous forme d'objet simple, sans référence circulaire,
     * pour la méthode JSON.stringify
     * @returns {object}
     */
    toJSON() {
        const obj = {};
        for (const key of this.__props) {
            obj[key] = this[key];
        }
        return obj;
    }
    checkNotifs() {
        /**
         * Fonction de traitement de récupération des notifications du membre
         * Alerte le membre de nouvelles notifications à l'aide d'un badge sur l'icone Bell dans le header
         */
        const fetchNotifs = () => {
            NotificationList.fetch(50).then(notifs => {
                this.notifications = notifs;
            });
        };
        // On met à jour les notifications toutes les 5 minutes
        setInterval(fetchNotifs, 300000);
        fetchNotifs();
    }
    addNotifications(notifs) {
        if ((0, isNull)(this.notifications)) {
            this.notifications = new NotificationList();
        }
        for (let n = 0, _len = notifs.length; n < _len; n++) {
            this.notifications.add(new NotificationBS(notifs[n]));
        }
        this.notifications.sort();
    }
    /**
     * renderNotifications - Affiche les notifications du membre sur la page Web
     * @returns {void}
     */
    renderNotifications() {
        const $growl = jQuery('#growl'), $loader = jQuery('#growl .notifications__loader'), $deleteAll = jQuery('#growl .notification.notification--delete-all'), $notifNew = jQuery('#growl .js-notificationsNew-list'), $notifOld = jQuery('#growl .js-notificationsOld-list'), $lists = jQuery('#growl .notificationsList'), $notifs = {
            'old': $notifOld,
            'new': $notifNew
        };
        // On vide les listes de notifications pour commencer
        $notifNew.empty();
        $notifOld.empty();
        $deleteAll.hide(); // On masque la partie actions de suppression
        $lists.hide(); // On masque les listes de notifications
        // On affiche le conteneur de listes de notifications et le loader
        $growl.addClass('visible');
        $loader.show();
        // On ajoute les notifications aux conteneurs
        for (const key of this.notifications) {
            for (let n = 0; n < this.notifications[key].length; n++) {
                $notifs[key].append(this.notifications[key][n].render());
            }
            // On affiche la liste, si il y a du contenu
            if (this.notifications[key].length > 0) {
                $notifs[key].parents('.notificationsList').show();
            }
        }
        // On masque le loader
        $loader.hide();
        if (this.notifications.length > 0) {
            // On affiche la partie actions de suppression
            $deleteAll.show();
            // On passe toutes les nouvelles notifications en anciennes (déjà vues)
            if (this.notifications.new.length > 0) {
                this.notifications.seen = true;
            }
            jQuery('#menuUnseenNotifications').remove();
        }
    }
}

/*
{
    "id": 1733094685,
    "type": "episode",
    "ref_id": "2688065",
    "text": "Nouvel \u00e9pisode : HPI S02E06 - S comme Italie\ufeff",
    "html": "Nouvel \u00e9pisode : <a href=\"\/serie\/hpi\">HPI<\/a> S02E06 - <a href=\"\/episode\/hpi\/s02e06\">S comme Italie<\/a>\ufeff",
    "date": "2022-06-02 03:21:02",
    "seen": "2022-06-02 09:39:25",
    "payload": {
        "title": "S comme Italie",
        "code": "S02E06",
        "show_title": "HPI",
        "picture": "https:\/\/pictures.betaseries.com\/banners\/episodes\/387368\/a8f59c7993bc92134626899f38a7e830.jpg",
        "url": "https:\/\/www.betaseries.com\/episode\/hpi\/s02e06"
    }
},
*/
/**
 * Les différents types de notifications
 */
var NotifTypes;
(function (NotifTypes) {
    NotifTypes["episode"] = "episode";
    NotifTypes["reportNew"] = "report_new";
    NotifTypes["reportTreated"] = "report_treated";
    NotifTypes["xpMany"] = "xp_many";
    NotifTypes["bugResolved"] = "bug_resolved";
    NotifTypes["bugCommented"] = "bug_commented";
    NotifTypes["poll"] = "poll";
    NotifTypes["season"] = "season";
    NotifTypes["comment"] = "comment";
    NotifTypes["badge"] = "badge";
    NotifTypes["banner"] = "banner";
    NotifTypes["character"] = "character";
    NotifTypes["movie"] = "movie";
    NotifTypes["forum"] = "forum";
    NotifTypes["friend"] = "friend";
    NotifTypes["message"] = "message";
    NotifTypes["quizz"] = "quizz";
    NotifTypes["recommend"] = "recommend";
    NotifTypes["site"] = "site";
    NotifTypes["subtitles"] = "subtitles";
    NotifTypes["video"] = "video";
})(NotifTypes = NotifTypes || (NotifTypes = {}));
/**
 * Classe NotifPayload
 * Contient les data de l'objet Payload dans les notifications
 * @class NotifPayload
 */
class NotifPayload {
    /**
     * Tableau des différentes propriétés de la classe NotifPayload
     * avec leur type, leur valeur par défaut et leur fonction de traitement
     */
    static props = [
        { key: 'url', type: 'string', default: '' },
        { key: 'title', type: 'string', default: '' },
        { key: 'code', type: 'string', default: '' },
        { key: 'show_title', type: 'string', default: '' },
        { key: 'picture', type: 'string', default: '' },
        { key: 'season', type: 'number', default: 0 },
        { key: 'name', type: 'string', default: '' },
        { key: 'xp', type: 'number', default: 0 },
        { key: 'user', type: 'string', default: '' },
        { key: 'user_id', type: 'number', default: 0 },
        { key: 'user_picture', type: 'string', default: 'https://img.betaseries.com/5gtv-uQY0aSPqDtcyu7rhHLcu6Q=/40x40/smart/https%3A%2F%2Fwww.betaseries.com%2Fimages%2Fsite%2Flogo-64x64.png' },
        { key: 'type', type: 'string', default: '' },
        { key: 'type_id', type: 'number', default: 0 }
    ];
    url; // all
    title; // season, episode, comment
    code; // episode
    show_title; // episode
    picture; // badge, episode, season, comment
    season; // season
    name; // badge
    xp; // xp_many
    user; // report_treated, comment
    user_id; // report_treated, comment
    user_picture; // report_treated, comment
    type; // comment
    type_id; // comment
    constructor(data) {
        if (!data)
            return this;
        let prop, val;
        for (let p = 0, _len = NotifPayload.props.length; p < _len; p++) {
            prop = NotifPayload.props[p];
            val = NotifPayload.props[p].default;
            // eslint-disable-next-line no-prototype-builtins
            if (Reflect.has(data, prop.key) && !(0, isNull)(data[prop.key])) {
                if (prop.type === 'string') {
                    val = String(data[prop.key]).trim();
                }
                else {
                    val = parseInt(data[prop.key], 10);
                }
            }
            this[prop.key] = val;
        }
    }
}
/**
 * Classe NotificationList
 * Contient les notifications anciennes et nouvelles
 * @class NotificationList
 */
class NotificationList {
    static logger = new UsBetaSeries.setDebug('Notification');
    static debug = NotificationList.logger.debug.bind(NotificationList.logger);
    static EventTypes = [
        EventTypes.SEEN,
        EventTypes.NEW
    ];
    /**
     * Retourne les notifications du membre
     * @param   {number} [nb = 10] Nombre de notifications à récupérer
     * @returns {Promise<NotificationList>}
     */
    static fetch(nb = 20) {
        const params = {
            all: true,
            sort: 'DESC',
            number: nb
        };
        return UsBetaSeries.callApi(HTTP_VERBS.GET, 'members', 'notifications', params)
            .then((data) => {
            const notifications = new NotificationList();
            for (let n = 0; n < data.notifications.length; n++) {
                notifications.add(new NotificationBS(data.notifications[n]));
            }
            return notifications;
        }) /*
        .catch(err => {
            console.warn('Erreur de récupération des notifications du membre', err);
            return new NotificationList();
        }) */;
    }
    static fromJSON(notifs) {
        const list = new NotificationList();
        for (const type of ['new', 'old']) {
            for (let n = 0, _len = notifs[type].length; n < _len; n++) {
                list.add(notifs[type][n]);
            }
        }
        if (!(0, isNull)(notifs.seen)) {
            list.seen = notifs.seen;
        }
        return list;
    }
    old;
    new;
    seen;
    __decorators = {
        emitter: new EmitterDecorator(this)
    };
    constructor() {
        this.old = [];
        this.new = [];
        this.seen = false;
    }
    hasListeners(event) {
        return this.__decorators.emitter.hasListeners(event);
    }
    on(event, fn) {
        return this.__decorators.emitter.on(event, fn);
    }
    off(event, fn) {
        return this.__decorators.emitter.off(event, fn);
    }
    once(event, fn) {
        return this.__decorators.emitter.once(event, fn);
    }
    emit(event) {
        return this.__decorators.emitter.emit(event);
    }
    /**
     * Symbol Iterator pour pouvoir itérer sur l'objet dans les boucles for
     */
    *[Symbol.iterator]() {
        yield "new";
        yield "old";
    }
    /**
     * length - Retourne le nombre total de notifications
     * @returns {number}
     */
    get length() {
        return this.old.length + this.new.length;
    }
    /**
     * add - Ajoute une notification
     * @param {NotificationBS} notif La notification à ajouter
     */
    add(notif) {
        if (!(notif instanceof NotificationBS)) {
            notif = new NotificationBS(notif);
        }
        const category = (notif.seen === null) ? 'new' : 'old';
        this[category].push(notif);
        if (category === 'new')
            this.emit(EventTypes.NEW);
    }
    /**
     * Tri les tableaux des notifications en ordre DESC
     * @returns {NotificationList}
     */
    sort() {
        const sortNotifs = (a, b) => {
            if ((0, isNull)(a) || (0, isNull)(b))
                return 0;
            if (a.date.getTime() > b.date.getTime())
                return -1;
            else if (a.date.getTime() < b.date.getTime())
                return 1;
            return 0;
        };
        this.new.sort(sortNotifs);
        this.old.sort(sortNotifs);
        return this;
    }
    /**
     * markAllAsSeen - Met à jour les nouvelles notifications en ajoutant
     * la date à la propriété seen et en déplacant les notifs dans le
     * tableau old
     */
    markAllAsSeen() {
        if (this.seen && this.new.length > 0) {
            for (let n = this.new.length - 1; n >= 0; n--) {
                this.new[n].seen = new Date();
                this.old.unshift(this.new[n]);
            }
            this.new = [];
            this.seen = false;
            this.emit(EventTypes.SEEN);
        }
    }
    getLastId() {
        if (this.new.length > 0) {
            return this.new[0].id;
        }
        else if (this.old.length > 0) {
            return this.old[0].id;
        }
        return null;
    }
    hasNew() {
        return this.new.length > 0;
    }
    toJSON() {
        return {
            'new': this.new,
            'old': this.old,
            'seen': this.seen
        };
    }
}
/**
 * Classe NotificationBS
 * Définit l'objet Notification reçu de l'API BetaSeries
 * @class NotificationBS
 */
class NotificationBS {
    /**
     * Identifiant de la notification
     * @type {number}
     */
    id;
    /**
     * Type de notification
     * @type {NotifTypes}
     */
    type;
    /**
     * Identifiant correspondant à l'objet définit par le type de notification
     * @type {number}
     */
    ref_id;
    /**
     * Texte brut de la notification
     * @type {string}
     */
    text;
    /**
     * Version HTML du texte de la notification
     * @type {string}
     */
    html;
    /**
     * Date de création de la notification
     * @type {Date}
     */
    date;
    /**
     * Date à laquelle le membre à vu la notification
     * @type {Date}
     */
    seen;
    /**
     * Payload - contient les données de référence liées à la notification
     */
    payload; // sauf report_new
    constructor(data) {
        this.id = parseInt(data.id, 10);
        this.type = NotifTypes[String(data.type).camelCase()];
        this.ref_id = parseInt(data.ref_id, 10);
        this.text = data.text;
        this.html = data.html;
        this.date = new Date(data.date);
        this.seen = data.seen != null ? new Date(data.seen) : null;
        this.payload = new NotifPayload(data.payload);
    }
    render() {
        if (0 === this.text.length)
            return null;
        let link;
        if (this.payload.user.length > 0) {
            link = `<a
                    href="https://www.betaseries.com/membre/${this.payload.user}"
                    target="_blank" class="avatar" data-displaylink="1"
                    >
                <img src="${this.payload.user_picture}" width="40" height="40" alt="avatar" />
            </a>`;
        }
        else {
            link = `<span class="avatar"><img src="${this.payload.user_picture}" width="40" height="40" alt="avatar" /></span>`;
        }
        const img = (this.payload.picture?.length > 0) ?
            `<div class="notification__image alignSelfFlexStart" data-displayimage="1"}"><img src="${this.payload.picture}" alt="image ${this.type}" height="38" width="38" /></div>` : '';
        return `
            <div
                class="notification${this.seen == null ? ' notification--unread' : ''}"
                id="i${this.id.toString()}"
                data-ref-id="${this.ref_id.toString()}"
                data-type="${this.type}"
            >
                <div class="media">
                    <div class="media-left">${link}</div>
                    <div class="media-body">
                        <div class="displayFlex">
                            <div class="notification__text alignSelfFlexStart">
                                <p>${this.html}</p>
                                <div class="notification__datas">
                                    <span class="mainTime" title="${this.date.format('datetime')}">${this.date.duration()}</span>
                                    <button type="button" class="btn-reset" onclick="deleteNotification('${this.id.toString()}');"><span class="mainTime">∙</span> Masquer</button>
                                </div>
                            </div>
                            ${img}
                        </div>
                    </div>
                </div>
            </div>`.trim();
    }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
class ParamsSearchAbstract {
    static valuesAllowed = {};
    static valuesDefault;
    static separator = ',';
    text;
    _limit;
    _offset; // numero de page
    genres;
    _diffusions;
    svods;
    _tri;
    _autres;
    _fields;
    constructor() {
        this._diffusions = [];
        this._fields = [];
        this._limit = ParamsSearchAbstract.valuesDefault.limit;
        this._offset = ParamsSearchAbstract.valuesDefault.offset;
        this._tri = ParamsSearchAbstract.valuesDefault.tri;
        this.genres = [];
        this.svods = [];
    }
    get limit() {
        return this._limit;
    }
    set limit(limit) {
        if (limit <= 0 || limit > 100) {
            throw new RangeError("Value of parameter 'limit' is out of range (1-100)");
        }
        this._limit = limit;
    }
    get offset() {
        return this._offset;
    }
    set offset(offset) {
        if (offset <= 0 || offset > 100) {
            throw new RangeError("Value of parameter 'offset' is out of range (1-100)");
        }
        this._offset = offset;
    }
    get diffusions() {
        return this._diffusions;
    }
    set diffusions(diff) {
        const allowed = this.constructor.valuesAllowed.diffusions;
        this._diffusions = diff.filter(val => {
            if (!allowed.includes(val)) {
                throw new Error(`Value(${val}) of parameter 'diffusions' is not allowed`);
            }
            return true;
        });
    }
    get tri() {
        return this._tri;
    }
    set tri(val) {
        const allowed = this.constructor.valuesAllowed.tri;
        let key = val;
        let sort = null;
        if (val.indexOf('-') > 0) {
            key = val.split('-')[0];
            sort = val.split('-')[1];
        }
        if (!allowed.includes(key)) {
            throw new Error("Value of parameter 'tri' is not allowed");
        }
        if (sort && !['asc', 'desc'].includes(sort)) {
            throw new Error("Value of parameter 'sort' is not allowed");
        }
        this._tri = (sort) ? key + '-' + sort : key;
    }
    get fields() {
        return this._fields;
    }
    set fields(values) {
        const allowed = this.constructor.valuesAllowed.fields;
        this._fields = values.filter(val => {
            if (!allowed.includes(val)) {
                throw new Error(`Value(${val}) of parameter 'fields' is not allowed`);
            }
            return true;
        });
    }
    get autres() {
        return this._autres;
    }
    set autres(value) {
        const allowed = this.constructor.valuesAllowed.autres;
        if (!allowed.includes(value)) {
            throw new Error("Value of parameter 'autres' is not allowed");
        }
        this._autres = value;
    }
}
class ParamsSearchShows extends ParamsSearchAbstract {
    static valuesAllowed = {
        diffusions: ['semaine', 'fini', 'encours'],
        duration: ['1-19', '20-30', '31-40', '41-50', '51-60', '61'],
        tri: ['nom', 'suivis', 'id', 'note', 'popularite', 'release'],
        autres: ['new', 'mine'],
        fields: ['id', 'following', 'release_date', 'poster', 'svods', 'slug', 'title']
    };
    _duration;
    _creations;
    _pays;
    chaines;
    constructor() {
        super();
        this._creations = [];
        this._pays = [];
    }
    getDurationAllowed() {
        return ParamsSearchShows.valuesAllowed.duration;
    }
    get duration() {
        return this._duration;
    }
    set duration(val) {
        if (!ParamsSearchShows.valuesAllowed.duration.includes(val)) {
            throw new Error("Value of parameter 'duration' is not allowed");
        }
        this._duration = val;
    }
    get creations() {
        return this._creations;
    }
    set creations(values) {
        this._creations = values.filter(val => {
            if (val <= 1900 || val > 2100) {
                throw new Error(`Value(${val.toString()}) of parameter 'creations' is out of range`);
            }
            return true;
        });
    }
    get pays() {
        return this._pays;
    }
    set pays(values) {
        const reg = /^\w{2}$/;
        this._pays = values
            .map(val => val.toLowerCase())
            .filter(val => {
            if (!reg.test(val)) {
                throw new Error(`Value(${val}) of parameter 'pays' is not allowed`);
            }
            return true;
        });
    }
    toRequest() {
        const params = {};
        if (this.text && this.text.length > 0) {
            params.text = this.text;
        }
        params.limit = this._limit;
        params.offset = this._offset;
        if (this.genres && this.genres.length > 0) {
            params.genres = this.genres.join(ParamsSearchAbstract.separator);
        }
        if (this._diffusions && this._diffusions.length > 0) {
            params.diffusions = this._diffusions.join(ParamsSearchAbstract.separator);
        }
        if (this._duration && this._duration.length > 0) {
            params.duration = this._duration;
        }
        if (this.svods && this.svods.length > 0) {
            params.svods = this.svods.join(ParamsSearchAbstract.separator);
        }
        if (this._creations && this._creations.length > 0) {
            params.creations = this._creations.join(ParamsSearchAbstract.separator);
        }
        if (this._pays && this._pays.length > 0) {
            params.pays = this._pays.join(ParamsSearchAbstract.separator);
        }
        if (this.chaines && this.chaines.length > 0) {
            params.chaines = this.chaines.join(ParamsSearchAbstract.separator);
        }
        if (this._tri && this._tri.length > 0) {
            params.tri = this._tri;
        }
        if (this._autres && this._autres.length > 0) {
            params.autres = this._autres;
        }
        if (this._fields && this._fields.length > 0) {
            params.fields = this._fields.join(ParamsSearchAbstract.separator);
        }
        return params;
    }
}
class ParamsSearchMovies extends ParamsSearchAbstract {
    static valuesAllowed = {
        diffusions: ['none', 'salles', 'vente'],
        tri: ['nom', 'ajout', 'id', 'note', 'popularite', 'release'],
        autres: ['new', 'seen', 'unseen', 'wishlist'],
        fields: ['id', 'release_date', 'poster', 'svods', 'slug', 'title']
    };
    _releases;
    casting;
    constructor() {
        super();
        this._releases = [];
    }
    get releases() {
        return this._releases;
    }
    set releases(values) {
        this._releases = values.filter(val => {
            if (val <= 1900 || val > 2100) {
                throw new Error(`Value(${val.toString()}) of parameter 'releases' is out of range`);
            }
            return true;
        });
    }
    toRequest() {
        const params = {};
        if (this.text && this.text.length > 0) {
            params.text = this.text;
        }
        params.limit = this._limit;
        params.offset = this._offset;
        if (this.genres && this.genres.length > 0) {
            params.genres = this.genres.join(ParamsSearchAbstract.separator);
        }
        if (this._diffusions && this._diffusions.length > 0) {
            params.diffusions = this._diffusions.join(ParamsSearchAbstract.separator);
        }
        if (this.casting && this.casting.length > 0) {
            params.casting = this.casting;
        }
        if (this.svods && this.svods.length > 0) {
            params.svods = this.svods.join(ParamsSearchAbstract.separator);
        }
        if (this._releases && this._releases.length > 0) {
            params.releases = this._releases.join(ParamsSearchAbstract.separator);
        }
        if (this._tri && this._tri.length > 0) {
            params.tri = this._tri;
        }
        if (this._autres && this._autres.length > 0) {
            params.autres = this._autres;
        }
        if (this._fields && this._fields.length > 0) {
            params.fields = this._fields.join(ParamsSearchAbstract.separator);
        }
        return params;
    }
}
class Search {
    static logger = new UsBetaSeries.setDebug('Search');
    static debug = Search.logger.debug.bind(Search.logger);
    static searchShows(params) {
        const result = {
            shows: [],
            total: 0,
            locale: 'fr',
            limit: params.limit,
            page: params.offset
        };
        return UsBetaSeries.callApi(HTTP_VERBS.GET, 'search', 'shows', params.toRequest())
            .then((data) => {
            const keys = Object.keys(result);
            for (const key in data) {
                if (keys.indexOf(key) >= 0)
                    result[key] = data[key];
            }
            return result;
        });
    }
    static getShowIds(params) {
        params.fields = ['id'];
        return this.searchShows(params).then((result) => {
            const ids = [];
            for (const show in result.shows) {
                ids.push(result.shows[show].id);
            }
            return ids;
        });
    }
    static searchMovies(params) {
        const result = {
            movies: [],
            total: 0,
            locale: 'fr',
            limit: params.limit,
            page: params.offset
        };
        return UsBetaSeries.callApi(HTTP_VERBS.GET, 'search', 'movies', params.toRequest())
            .then((data) => {
            const keys = Object.keys(result);
            for (const key in data) {
                if (keys.indexOf(key) >= 0)
                    result[key] = data[key];
            }
            return result;
        });
    }
}

/*
 *              Class Decorators
 *
 * type ClassDecorator = <TFunction extends Function>(target: TFunction) => TFunction | void;
 */
/*
 *              Property Decorators
 *
 * type PropertyDecorator = (target: Object, propertyKey: string | symbol) => void;
 */
/*
 *              Method Decorators
 *
 * Descriptor keys:
 *  - value
 *  - writable
 *  - enumerable
 *  - configurable
 *
 * type MethodDecorator = <T>(
 *   target: Object,
 *   propertyKey: string | symbol,
 *   descriptor: TypedPropertyDescriptor<T>
 * ) => TypedPropertyDescriptor<T> | void;
 */
/*
 *              Accessor Decorators
 *
 * Descriptor keys:
 *  - get
 *  - set
 *  - enumerable
 *  - configurable
 *
 * type MethodDecorator = <T>(
 *   target: Object,
 *   propertyKey: string | symbol,
 *   descriptor: TypedPropertyDescriptor<T>
 * ) => TypedPropertyDescriptor<T> | void;
 */
function validateType(target, propertyKey, descriptor) {
    const original = descriptor.set;
    const type = Reflect.getMetadata('design:type', target, propertyKey);
    descriptor.set = function (value) {
        if (!(value instanceof type)) {
            throw new TypeError(`Parameter type error. Required type: ${type.name}`);
        }
        return original.call(this, { ...value });
    };
}
/********************************************************************************/
/*                          Custom Decorators                                   */
/********************************************************************************/
/*
 *              Abstract Decorator
 */
/**
 * AbstractDecorator - Classe abstraite des decorators
 * @class
 * @abstract
 */
class AbstractDecorator {
    static logger = new UsBetaSeries.setDebug('Decorators');
    static debug = AbstractDecorator.logger.debug.bind(AbstractDecorator.logger);
    __target;
    constructor(target) {
        this.__target = target;
        return this;
    }
    get target() {
        return this.__target;
    }
    set target(target) {
        this.__target = target;
    }
}
/**
 * Classe FillDecorator permet d'ajouter des méthodes à d'autres classes
 * Ces méthodes servent à peupler un objet de classe
 * @class
 * @extends AbstractDecorator
 */
class FillDecorator extends AbstractDecorator {
    /**
     * Constructor
     * @param   {implFillDecorator} target - La classe utilisant le décorateur
     * @returns {FillDecorator}
     */
    constructor(target) {
        super(target);
        return this;
    }
    /**
     * Remplit l'objet avec les données fournit en paramètre
     * @param   {Obj} data - Les données provenant de l'API
     * @returns {implFillDecorator}
     */
    fill(data) {
        const self = this;
        const classStatic = self.constructor;
        if (typeof data !== 'object') {
            const err = new TypeError(classStatic.name + '.fill data is not an object: ' + typeof data);
            console.error(err);
            throw err;
        }
        // Check property static "relatedProps"
        if (!classStatic.relatedProps) {
            const err = new Error(classStatic.name + ".fill, property static 'relatedProp' are required");
            console.error(err);
            throw err;
        }
        const checkTypeValue = (target, key, type, value, relatedProp) => {
            // console.warn('FillDecorator.fill checkTypeValue', {key, type, value});
            const typeNV = typeof value;
            const oldValue = target['_' + key];
            const hasDefault = Reflect.has(relatedProp, 'default');
            const hasTransform = Reflect.has(relatedProp, 'transform');
            if (!(0, isNull)(value) && hasTransform && typeof relatedProp.transform === 'function') {
                value = relatedProp.transform(target, value);
            }
            else if ((0, isNull)(value) && hasDefault) {
                value = relatedProp.default;
            }
            if ((0, isNull)(oldValue) && (0, isNull)(value))
                return undefined;
            let subType = null;
            if (typeof type === 'string' && /^array<\w+>$/.test(type)) {
                subType = type.match(/<(\w+)>$/)[1];
                AbstractDecorator.debug('FillDecorator.fill for (%s.%s) type: array - subType: %s', self.constructor.name, key, subType, value);
            }
            switch (type) {
                case 'string':
                    value = (!(0, isNull)(value)) ? String(value).trim() : hasDefault ? relatedProp.default : null;
                    if (oldValue === value)
                        return undefined;
                    break;
                case 'number':
                    if (!(0, isNull)(value) && !hasTransform && typeNV === 'string') {
                        value = parseInt(value, 10);
                    }
                    else if ((0, isNull)(value) && hasDefault) {
                        value = relatedProp.default;
                    }
                    if (oldValue === value)
                        return undefined;
                    break;
                case 'boolean':
                    switch (typeof value) {
                        case 'string':
                            if (value.toLowerCase() === 'true' || value === '1') {
                                value = true;
                            }
                            else if (value.toLowerCase() === 'false' || value === '1') {
                                value = false;
                            }
                            break;
                        case 'number':
                        default:
                            value = !!value;
                            break;
                    }
                    value = (typeof value === 'boolean') ? value : hasDefault ? relatedProp.default : null;
                    if (oldValue === value)
                        return undefined;
                    break;
                case 'array': {
                    if (!(0, isNull)(subType) && Array.isArray(value)) {
                        const data = [];
                        let isClass = false;
                        if (UsBetaSeries.checkClassname(subType)) {
                            isClass = true;
                        }
                        for (let d = 0, _len = value.length; d < _len; d++) {
                            let subVal = value[d];
                            if (isClass)
                                subVal = UsBetaSeries.getInstance(subType, [value[d]]);
                            data.push(subVal);
                        }
                        value = data;
                    }
                    else {
                        if (self.__initial || !Array.isArray(oldValue))
                            return value;
                    }
                    let diff = false;
                    for (let i = 0, _len = oldValue.length; i < _len; i++) {
                        if (oldValue[i] !== value[i]) {
                            diff = true;
                            break;
                        }
                    }
                    if (!diff)
                        return undefined;
                    break;
                }
                case 'date': {
                    if (typeof value === 'string' && value === '0000-00-00') {
                        return null;
                    }
                    if (typeNV !== 'number' && !(value instanceof Date) &&
                        (typeNV === 'string' && Number.isNaN(Date.parse(value)))) {
                        throw new TypeError(`Invalid value for key "${key}". Expected type (Date | Number | string) but got ${JSON.stringify(value)}`);
                    }
                    if (typeNV === 'number' || typeNV === 'string')
                        value = new Date(value);
                    if (oldValue instanceof Date && value.getTime() === oldValue.getTime()) {
                        return undefined;
                    }
                    break;
                }
                case 'object':
                default: {
                    if (typeNV === 'object' && type === 'object') {
                        value = (!(0, isNull)(value)) ? Object.assign({}, value) : hasDefault ? relatedProp.default : null;
                    }
                    else if (typeof type === 'function' && !(0, isNull)(value) && !(value instanceof type)) {
                        // if (BetaSeries.debug) AbstractDecorator.debug('FillDecorator.fill: type Function for [%s.%s]', classStatic.name, key, {type, value});
                        // value = Reflect.construct(type, [value]);
                        value = new (type)(value);
                        if (typeof value === 'object' && Reflect.has(value, 'parent')) {
                            value.parent = target;
                        }
                    }
                    if (self.__initial || (0, isNull)(oldValue))
                        return value;
                    let changed = false;
                    try {
                        // if (BetaSeries.debug) AbstractDecorator.debug('comparaison d\'objets', {typeOld: typeof oldValue, oldValue, typeNew: typeof value, value});
                        if (((0, isNull)(oldValue) && !(0, isNull)(value)) ||
                            (!(0, isNull)(oldValue) && (0, isNull)(value))) {
                            changed = true;
                        }
                        else if (typeof value === 'object' && !(0, isNull)(value)) {
                            if (JSON.stringify(oldValue) !== JSON.stringify(value)) {
                                AbstractDecorator.debug('compare objects with JSON.stringify and are differents', { oldValue, value });
                                changed = true;
                            }
                        }
                        if (!changed)
                            return undefined;
                    }
                    catch (err) {
                        console.warn('FillDecorator.fill => checkTypeValue: error setter[%s.%s]', target.constructor.name, key, { oldValue, value });
                        throw err;
                    }
                }
            }
            if (type === 'date') {
                type = Date;
            }
            else if (type === 'other' && hasTransform) {
                return value;
            }
            if ((typeof type === 'string' && typeof value !== type) ||
                (typeof type === 'function' && !(value instanceof type))) {
                throw new TypeError(`Invalid value for key "${target.constructor.name}.${key}". Expected type "${(typeof type === 'string') ? type : JSON.stringify(type)}" but got "${typeof value}"`);
            }
            return value;
        };
        // AbstractDecorator.debug('FillDecorator.fill target: %s', self.constructor.name, data, (self.constructor as typeof RenderHtml).relatedProps);
        // On reinitialise les changements de l'objet
        self.__changes = {};
        for (const propKey in self.constructor.relatedProps) {
            if (!Reflect.has(data, propKey))
                continue;
            /** relatedProp contient les infos de la propriété @see RelatedProp */
            const relatedProp = self.constructor.relatedProps[propKey];
            // dataProp contient les données provenant de l'API
            const dataProp = data[propKey];
            // Le descripteur de la propriété, utilisé lors de l'initialisation de l'objet
            let descriptor;
            if (self.__initial) {
                descriptor = {
                    configurable: true,
                    enumerable: true,
                    get: () => {
                        return self['_' + relatedProp.key];
                    },
                    set: (newValue) => {
                        // On vérifie le type et on modifie, si nécessaire, la valeur
                        // pour la rendre conforme au type définit (ex: number => Date or object => Note)
                        const value = checkTypeValue(self, relatedProp.key, relatedProp.type, newValue, relatedProp);
                        // Lors de l'initialisation, on set directement la valeur
                        if (self.__initial) {
                            self['_' + relatedProp.key] = value;
                            return;
                        }
                        // On récupère l'ancienne valeur pour identifier le changement
                        const oldValue = self['_' + relatedProp.key];
                        // Si value est undefined, alors pas de modification de valeur
                        if (value === undefined) {
                            // AbstractDecorator.debug('FillDecorator.fill setter[%s.%s] not changed', self.constructor.name, relatedProp.key, relatedProp.type, {newValue, oldValue, relatedProp});
                            return;
                        }
                        AbstractDecorator.debug('FillDecorator.fill setter[%s.%s] value changed', self.constructor.name, relatedProp.key, { type: relatedProp.type, newValue, oldValue, value, relatedProp });
                        // On set la nouvelle valeur
                        self['_' + relatedProp.key] = value;
                        // On stocke le changement de valeurs
                        self.__changes[relatedProp.key] = { oldValue, newValue };
                        // On appelle la methode de mise à jour du rendu HTML pour la propriété
                        this.updatePropRender(relatedProp.key);
                    }
                };
            }
            // if (BetaSeries.debug) AbstractDecorator.debug('FillDecorator.fill descriptor[%s.%s]', this.constructor.name, relatedProp.key, {relatedProp, dataProp, descriptor});
            // Lors de l'initialisation, on définit la propriété de l'objet
            // et on ajoute le nom de la propriété dans le tableau __props
            if (self.__initial) {
                Object.defineProperty(self, relatedProp.key, descriptor);
                self.__props.push(relatedProp.key);
            }
            // On set la valeur
            self[relatedProp.key] = dataProp;
        }
        // Fin de l'initialisation
        if (self.__initial) {
            self.__props.sort();
            self.__initial = false;
        }
        return self;
    }
    /**
     * Met à jour le rendu HTML des propriétés de l'objet,
     * si un sélecteur CSS exite pour la propriété fournit en paramètre\
     * **Méthode appelée automatiquement par le setter de la propriété**
     * @see Show.selectorsCSS
     * @param   {string} propKey - La propriété de l'objet à mettre à jour
     * @returns {void}
     */
    updatePropRender(propKey) {
        const self = this;
        if (!self.elt || !self.__props.includes(propKey))
            return;
        const fnPropKey = 'updatePropRender' + propKey.camelCase().upperFirst();
        const classStatic = self.constructor;
        AbstractDecorator.debug('FillDecorator.updatePropRender(%s.%s)', classStatic.name, propKey, fnPropKey);
        if (Reflect.has(self, fnPropKey)) {
            AbstractDecorator.debug('FillDecorator.updatePropRender call method: %s.%s', classStatic.name, fnPropKey);
            self[fnPropKey]();
        }
        else if (classStatic.selectorsCSS && classStatic.selectorsCSS[propKey]) {
            AbstractDecorator.debug('FillDecorator.updatePropRender default method: class: %s - selector: %s', classStatic.name, classStatic.selectorsCSS[propKey]);
            const selectorCSS = classStatic.selectorsCSS[propKey];
            jQuery(selectorCSS, self.elt).text(self[propKey].toString());
            delete self.__changes[propKey];
        }
    }
}
class EmitterDecorator extends AbstractDecorator {
    /**
     * Les fonctions callback
     * @type {Object.<string, fnEmitter[]>}
     */
    __callbacks;
    /**
     * EmiiterDecorator
     * @param target - La classe implémentant l'interface implEmitterDecorator
     * @returns {EmitterDecorator}
     * @throws {Error}
     */
    constructor(target) {
        super(target);
        if (!Reflect.has(target.constructor, 'EventTypes')) {
            throw new Error(`Class: ${target.constructor.name} must have a static property "EventTypes"`);
        }
        this.__callbacks = {};
        return this;
    }
    /**
     * Check if this emitter has `event` handlers.
     *
     * @param {EventTypes} event
     * @return {Boolean}
     */
    hasListeners(event) {
        return !!this.__callbacks[event].length;
    }
    /**
     * Listen on the given `event` with `fn`.
     * @param   {EventTypes} event - Le nom de l'évènement sur lequel déclenché le callback
     * @param   {fnEmitter} fn - La fonction callback
     * @returns {implEmitterDecorator}
     */
    on(event, fn) {
        //AbstractDecorator.debug('EmitterDecorator[%s] method(on) event %s', this.constructor.name, event);
        // On vérifie que le type d'event est pris en charge
        if ((this.target.constructor).EventTypes.indexOf(event) < 0) {
            throw new Error(`EmitterDecorator.on: ${event} ne fait pas partit des events gérés par la classe ${this.target.constructor.name}`);
        }
        this.__callbacks = this.__callbacks || {};
        this.__callbacks[event] = this.__callbacks[event] || [];
        for (const func of this.__callbacks[event]) {
            if (typeof func === 'function' && func.toString() == fn.toString())
                return this.target;
        }
        this.__callbacks[event].push(fn);
        if (UsBetaSeries.debug)
            AbstractDecorator.debug('EmitterDecorator.on[%s] addEventListener on event %s', this.target.constructor.name, event, this.__callbacks[event]);
        return this.target;
    }
    /**
     * Remove the given callback for `event` or all
     * registered callbacks.
     *
     * @param {EventTypes} event
     * @param {fnEmitter} [fn]
     * @return {implEmitterDecorator}
     */
    off(event, fn) {
        this.__callbacks = this.__callbacks || {};
        // all
        if ((0, isNull)(event) && (0, isNull)(fn)) {
            this.__callbacks = {};
            return this.target;
        }
        // specific event
        const callbacks = this.__callbacks[event];
        if (!callbacks)
            return this.target;
        // remove all handlers
        if ((0, isNull)(fn)) {
            delete this.__callbacks[event];
            return this.target;
        }
        // remove specific handler
        let cb;
        for (let i = 0; i < callbacks.length; i++) {
            cb = callbacks[i];
            if (cb === fn || cb.fn === fn) {
                callbacks.splice(i, 1);
                break;
            }
        }
        // Remove event specific arrays for event types that no
        // one is subscribed for to avoid memory leak.
        if (callbacks.length === 0) {
            delete this.__callbacks[event];
        }
        return this.target;
    }
    /**
     * Adds an `event` listener that will be invoked a single
     * time then automatically removed.
     *
     * @param {EventTypes} event
     * @param {fnEmitter} fn
     * @return {implEmitterDecorator}
     */
    once(event, fn) {
        /**
         * function that runs a single time
         * @param {...*} args
         */
        const on = (...args) => {
            AbstractDecorator.debug('EmiiterDecorator.once => on called');
            this.off(event, on); // delete callback when called (emit play with a copy of callbacks)
            // args.unshift(new CustomEvent('betaseries', { detail: { event }}));
            fn.apply(this.target, args);
        };
        on.fn = fn;
        this.on(event, on);
        return this.target;
    }
    /**
     * Emit `event` with the given args.
     *
     * @param {EventTypes} event
     * @param {...*} args
     * @return {implEmitterDecorator}
     */
    emit(event, ...args) {
        if (UsBetaSeries.debug)
            AbstractDecorator.debug('EmiiterDecorator.emit[%s] call Listeners of event %s', this.target.constructor.name, event, this.__callbacks);
        this.__callbacks = this.__callbacks || {};
        let callbacks = this.__callbacks[event];
        if (callbacks) {
            args.unshift(new CustomEvent('betaseries', { detail: { event } }));
            callbacks = callbacks.slice(0); // copy of callbacks (see: EmitterDecorator.once)
            for (let i = 0, len = callbacks.length; i < len; ++i) {
                callbacks[i].apply(this.target, args);
            }
        }
        return this.target;
    }
}

/**
 * Retourne les similars associés au media
 * @return {Promise<Media>}
 */
Media.prototype.fetchSimilars = function () {
    const self = this;
    if (this.__fetches.similars)
        return this.__fetches.similars;
    this.similars = [];
    this.__fetches.similars = new Promise((resolve, reject) => {
        UsBetaSeries.callApi('GET', this.mediaType.plural, 'similars', { id: this.id, details: true }, true)
            .then(data => {
            if (data.similars) {
                for (let s = 0; s < data.similars.length; s++) {
                    self.similars.push(new Similar(data.similars[s][self.mediaType.singular], self.mediaType));
                }
            }
            self.save();
            resolve(self);
            delete self.__fetches.similars;
        }, err => {
            reject(err);
            delete self.__fetches.similars;
        });
    });
    return this.__fetches.similars;
};
/**
 * bsModule contient la correspondance entre les noms de classe et l'objet Function\
 * Cela sert aux méthodes getInstance et checkClassname
 * @static
 * @type {Record<string, any>}
 */
UsBetaSeries.bsModule = {
    "Base": Base,
    "CacheUS": CacheUS,
    "Character": Character,
    "CommentBS": CommentBS,
    "CommentsBS": CommentsBS,
    "Episode": Episode,
    "Images": Images,
    "Media": Media,
    "MediaBase": MediaBase,
    "Member": Member,
    "Movie": Movie,
    "Next": Next,
    "Note": Note,
    "NotificationBS": NotificationBS,
    "NotificationList": NotificationList,
    "NotifPayload": NotifPayload,
    "Options": OptionsMember,
    "Person": Person,
    "PersonMedia": PersonMedia,
    "PersonMedias": PersonMedias,
    "Picture": Picture,
    "Platform": Platform,
    "PlatformList": PlatformList,
    "ParamsSearchMovies": ParamsSearchMovies,
    "ParamsSearchShows": ParamsSearchShows,
    "Platforms": Platforms,
    "RenderHtml": RenderHtml,
    "Search": Search,
    "Season": Season,
    "Show": Show,
    "Showrunner": Showrunner,
    "Similar": Similar,
    "Stats": Stats,
    "Subtitle": Subtitle,
    "UpdateAuto": UpdateAuto,
    "User": User
};
/**
 * getInstance - fonction servant à instancier un objet à partir de son nom de classe
 * et de paramètres
 * @static
 * @param   {string} className - Le nom de la classe à instancier
 * @param   {Array} [args = []] - Les paramètres à fournir au constructeur
 * @returns {any} L'objet instancié
 * @throws Error
 */
UsBetaSeries.getInstance = (className, ...args) => {
    // TODO: Handle Null and invalid className arguments
    if (typeof UsBetaSeries.bsModule[className] !== undefined) {
        return new UsBetaSeries.bsModule[className](args);
    }
    else {
        throw new Error("Class not found: " + className);
    }
};
/**
 * checkClassname - Fonction servant à vérifier si la classe est connue
 * et peut être instanciée
 * @static
 * @param   {string} className - Le nom de classe à vérifier
 * @returns {boolean}
 */
UsBetaSeries.checkClassname = (className) => {
    return typeof UsBetaSeries.bsModule[className] !== undefined;
};
