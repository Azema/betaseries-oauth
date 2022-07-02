/*! betaseries_userscript - v1.4.2 - 2022-07-02
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

class Character {
    /**
     * @type {string} Nom de l'acteur/actrice
     */
    actor;
    /**
     * @type {string} Description du rôle
     */
    description;
    /**
     * @type {boolean} Invité ?
     */
    guest;
    /**
     * @type {number} Identifiant de l'acteur
     */
    id;
    /**
     * @type {string} Nom du personnage
     */
    name;
    /**
     * @type {string} URL de l'image du personnage
     */
    picture;
    /**
     * @type {string} Type de rôle du personnage dans le média
     */
    role;
    /**
     * @type {number} Identifiant de la série
     */
    show_id;
    /**
     * @type {number} Identifiant du film
     */
    movie_id;
    /**
     * @type {number} Identifiant de l'objet Person correspondant à l'acteur
     */
    person_id;
    constructor(data) {
        this.actor = data.actor || '';
        this.picture = data.picture || '';
        this.name = data.name || '';
        this.guest = !!data.guest || false;
        this.id = (data.id !== undefined) ? parseInt(data.id, 10) : 0;
        this.description = data.description || '';
        this.role = data.role || '';
        this.show_id = (data.show_id !== undefined) ? parseInt(data.show_id, 10) : 0;
        this.movie_id = (data.movie_id !== undefined) ? parseInt(data.movie_id, 10) : 0;
        this.person_id = (data.person_id !== undefined) ? parseInt(data.person_id, 10) : 0;
    }
}
class personMedia {
    show;
    movie;
    role;
    type;
    constructor(data, type) {
        if (type === MediaType.show) {
            this.show = new Show(data.show);
        }
        else if (type === MediaType.movie) {
            this.movie = new Movie(data.movie);
        }
        this.role = data.name;
        this.type = type;
    }
    get media() {
        if (this.type === MediaType.show) {
            return this.show;
        }
        else if (this.type === MediaType.movie) {
            return this.movie;
        }
    }
}
class Person {
    /**
     * Récupère les données d'un acteur à partir de son identifiant et retourne un objet Person
     * @param   {number} personId - L'identifiant de l'acteur / actrice
     * @returns {Promise<Person | null>}
     */
    static fetch(personId) {
        return Base.callApi(HTTP_VERBS.GET, 'persons', 'person', { id: personId })
            .then(data => { return data ? new Person(data.person) : null; });
    }
    /**
     * @type {number} Identifiant de l'acteur / actrice
     */
    id;
    /**
     * @type {string} Nom de l'acteur
     */
    name;
    /**
     * @type {Date} Date de naissance
     */
    birthday;
    /**
     * @type {Date} Date de décès
     */
    deathday;
    /**
     * @type {string} Description
     */
    description;
    /**
     * @type {personMedia} Dernier média enregistré sur BetaSeries
     */
    last;
    /**
     * @type {Array<personMedia>} Tableau des séries dans lesquelles à joué l'acteur
     */
    shows;
    /**
     * @type {Array<personMedia>} Tableau des films dans lesquels a joué l'acteur
     */
    movies;
    constructor(data) {
        this.id = (data.id !== undefined) ? parseInt(data.id, 10) : 0;
        this.name = data.name || '';
        this.birthday = data.birthday ? new Date(data.birthday) : null;
        this.deathday = data.deathday ? new Date(data.deathday) : null;
        this.description = data.description || '';
        this.shows = [];
        for (let s = 0; s < data.shows.length; s++) {
            this.shows.push(new personMedia(data.shows[s], MediaType.show));
        }
        this.movies = [];
        for (let m = 0; m < data.movies.length; m++) {
            this.movies.push(new personMedia(data.movies[m], MediaType.movie));
        }
        if (data.last?.show) {
            this.last = new personMedia(data.last, MediaType.show);
        }
        else if (data.last?.movie) {
            this.last = new personMedia(data.last, MediaType.movie);
        }
    }
}

/* interface JQuery<TElement = HTMLElement> extends Iterable<TElement> {
    popover?(params: any): this;
} */
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
class CommentsBS {
    /*************************************************/
    /*                  STATIC                       */
    /*************************************************/
    /**
     * Types d'évenements gérés par cette classe
     * @type {Array}
     */
    static EventTypes = [
        'update',
        'save',
        'add',
        'added',
        'delete',
        'show'
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
        return Base.callApi(HTTP_VERBS.POST, 'comments', 'comment', params)
            .then((data) => {
            const comment = new CommentBS(data.comment, media.comments);
            media.comments.addComment(comment);
            media.comments.is_subscribed = true;
            return comment;
        })
            .catch(err => {
            Base.notification('Commentaire', "Erreur durant l'ajout d'un commentaire");
            console.error(err);
        });
    }
    /*************************************************/
    /*                  PROPERTIES                   */
    /*************************************************/
    /**
     * @type {Array<CommentBS>} Tableau des commentaires
     */
    comments;
    /**
     * @type {number} Nombre total de commentaires du média
     */
    nbComments;
    /**
     * @type {boolean} Indique si le membre à souscrit aux alertes commentaires du média
     */
    is_subscribed;
    /**
     * @type {string} Indique si les commentaires sont ouverts ou fermés
     */
    status;
    /**
     * @type {Base} Le média auquel sont associés les commentaires
     * @private
     */
    _parent;
    /**
     * @type {Array<CustomEvent>} Tableau des events déclarés par la fonction loadEvents
     * @private
     */
    _events;
    /**
     * @type {object} Objet contenant les fonctions à l'écoute des changements
     * @private
     */
    _listeners;
    /**
     * @type {OrderComments} Ordre de tri des commentaires et des réponses
     */
    _order;
    /*************************************************/
    /*                  METHODS                      */
    /*************************************************/
    constructor(nbComments, media) {
        this.comments = [];
        this._parent = media;
        this.is_subscribed = false;
        this.status = MediaStatusComments.OPEN;
        this.nbComments = nbComments;
        this._order = OrderComments.DESC;
        this._initListeners();
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
     * Initialize le tableau des écouteurs d'évènements
     * @returns {Base}
     * @private
     */
    _initListeners() {
        this._listeners = {};
        const EvtTypes = CommentsBS.EventTypes;
        for (let e = 0; e < EvtTypes.length; e++) {
            this._listeners[EvtTypes[e]] = [];
        }
        return this;
    }
    /**
     * Permet d'ajouter un listener sur un type d'évenement
     * @param  {EventTypes} name - Le type d'évenement
     * @param  {Function}   fn   - La fonction à appeler
     * @return {Base} L'instance du média
     */
    addListener(name, fn, ...args) {
        // On vérifie que le type d'event est pris en charge
        if (CommentsBS.EventTypes.indexOf(name) < 0) {
            throw new Error(`${name} ne fait pas partit des events gérés par cette classe`);
        }
        if (this._listeners[name] === undefined) {
            this._listeners[name] = [];
        }
        for (const func in this._listeners[name]) {
            if (func.toString() == fn.toString()) {
                if (Base.debug)
                    console.warn('Cette fonction est déjà présente pour event[%s]', name);
                return;
            }
        }
        if (args.length > 0) {
            this._listeners[name].push({ fn: fn, args: args });
        }
        else {
            this._listeners[name].push(fn);
        }
        if (Base.debug)
            console.log('Base[%s] add Listener on event %s', this.constructor.name, name, this._listeners[name]);
        return this;
    }
    /**
     * Permet de supprimer un listener sur un type d'évenement
     * @param  {string}   name - Le type d'évenement
     * @param  {Function} fn   - La fonction qui était appelée
     * @return {Base} L'instance du média
     */
    removeListener(name, fn) {
        if (this._listeners[name] !== undefined) {
            for (let l = 0; l < this._listeners[name].length; l++) {
                if ((typeof this._listeners[name][l] === 'function' && this._listeners[name][l].toString() === fn.toString()) ||
                    this._listeners[name][l].fn.toString() == fn.toString()) {
                    this._listeners[name].splice(l, 1);
                }
            }
        }
        return this;
    }
    /**
     * Appel les listeners pour un type d'évenement
     * @param  {EventTypes} name - Le type d'évenement
     * @return {Base} L'instance du média
     */
    _callListeners(name) {
        if (this._listeners[name] !== undefined && this._listeners[name].length > 0) {
            const event = new CustomEvent('betaseries', { detail: { name: name } });
            if (Base.debug)
                console.log('Comments call %d Listeners on event %s', this._listeners[name].length, name);
            for (let l = 0; l < this._listeners[name].length; l++) {
                if (typeof this._listeners[name][l] === 'function') {
                    this._listeners[name][l].call(this, event, this);
                }
                else {
                    this._listeners[name][l].fn.apply(this, this._listeners[name][l].args);
                }
            }
        }
        return this;
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
            Base.callApi(HTTP_VERBS.GET, 'comments', 'comments', params)
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
                Base.notification('Récupération des commentaires', "Une erreur est apparue durant la récupération des commentaires");
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
        if (Base.debug)
            console.log('addComment order: %s - method: %s', this.order, method.name);
        if (data instanceof CommentBS) {
            method.call(this.comments, data);
        }
        else {
            method.call(this.comments, new CommentBS(data, this));
        }
        this.nbComments++;
        this.media.nbComments++;
        if (Base.debug)
            console.log('addComment listeners', this._listeners);
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
        const data = await Base.callApi(HTTP_VERBS.GET, 'comments', 'replies', { id: commentId, order });
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
            if (Base.debug)
                console.log('Base ', { length: self.comments.length, nbComments: self.nbComments });
            if (self.comments.length <= 0 && self.nbComments > 0) {
                if (Base.debug)
                    console.log('Base fetchComments call');
                promise = self.fetchComments(nbpp);
            }
            promise.then(async () => {
                let comment, template = `
                        <div data-media-type="${self._parent.mediaType.singular}"
                            data-media-id="${self._parent.id}"
                            class="displayFlex flexDirectionColumn"
                            style="margin-top: 2px; min-height: 0">`;
                if (Base.userIdentified()) {
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
                        if (Base.debug)
                            console.log('Comments render getTemplate fetchReplies');
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
                            ${Base.trans("timeline.comments.display_more")}
                            <i class="fa fa-cog fa-spin fa-2x fa-fw" style="display:none;margin-left:15px;vertical-align:middle;"></i>
                            <span class="sr-only">Loading...</span>
                        </button>`;
                }
                template += '</div>'; // Close div.comments
                if (self.isOpen() && Base.userIdentified()) {
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
        $btnClose.click(() => {
            funcPopup.hidePopup();
            $popup.removeAttr('data-popin-type');
        });
        this._events.push({ elt: $btnClose, event: 'click' });
        const $btnAllReplies = $container.find('.toggleAllReplies');
        $btnAllReplies.click((e) => {
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
                    <svg fill="${Base.theme == 'dark' ? 'rgba(255, 255, 255, .5)' : '#333'}" width="14" height="16" style="position: relative; top: 1px; left: -1px;">
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
                            <path fill="${Base.theme == 'dark' ? 'rgba(255, 255, 255, .5)' : '#333'}" d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32v-.68c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68c-2.87.68-4.5 3.24-4.5 6.32v5l-2 2v1h16v-1l-2-2z"></path>
                        </g>
                    </svg>
                `);
            }
        }
        $btnSubscribe.click((e) => {
            e.stopPropagation();
            e.preventDefault();
            if (!Base.userIdentified()) {
                faceboxDisplay('inscription', {}, () => { });
                return;
            }
            const $btn = $(e.currentTarget);
            const params = { type: self._parent.mediaType.singular, id: self._parent.id };
            if ($btn.hasClass('active')) {
                Base.callApi(HTTP_VERBS.DELETE, 'comments', 'subscription', params)
                    .then(() => {
                    self.is_subscribed = false;
                    displaySubscription($btn);
                });
            }
            else {
                Base.callApi(HTTP_VERBS.POST, 'comments', 'subscription', params)
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
            $btnSpoiler.click((e) => {
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
        $btnThumb.click(async (e) => {
            e.stopPropagation();
            e.preventDefault();
            if (!Base.userIdentified()) {
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
            Base.callApi(verb, 'comments', 'thumb', params)
                .then((data) => {
                comment.thumbs = parseInt(data.comment.thumbs, 10);
                comment.thumbed = data.comment.thumbed ? parseInt(data.comment.thumbed, 10) : 0;
                comment.updateRenderThumbs(vote);
            })
                .catch(err => {
                const msg = err.text !== undefined ? err.text : err;
                Base.notification('Thumb commentaire', "Une erreur est apparue durant le vote: " + msg);
            });
        });
        this._events.push({ elt: $btnThumb, event: 'click' });
        /**
         * On affiche/masque les options du commentaire
         */
        const $btnOptions = $container.find('.btnToggleOptions');
        $btnOptions.click((e) => {
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
        $btnSend.click(async (e) => {
            e.stopPropagation();
            e.preventDefault();
            if (!Base.userIdentified()) {
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
        $textarea.keypress((e) => {
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
        $baliseSpoiler.click(() => {
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
        $btnReplies.click((e) => {
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
                $btn.find('.btnText').text(Base.trans("comment.hide_answers"));
                $btn.find('svg').attr('style', 'transition: transform 200ms ease 0s; transform: rotate(180deg);');
                $btn.attr('data-toggle', '1');
            }
            else {
                // On masque
                $replies.fadeOut('fast');
                $btn.find('.btnText').text(Base.trans("comment.button.reply", { "%count%": $replies.length.toString() }, $replies.length));
                $btn.find('svg').attr('style', 'transition: transform 200ms ease 0s;');
                $btn.attr('data-toggle', '0');
            }
        });
        this._events.push({ elt: $btnReplies, event: 'click' });
        const $btnResponse = $container.find('.btnResponse');
        /**
         * Permet de créer une réponse à un commentaire
         */
        $btnResponse.click(async (e) => {
            e.stopPropagation();
            e.preventDefault();
            if (!Base.userIdentified()) {
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
        $btnMore.click((e) => {
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
        $btnEdit.click(async (e) => {
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
        $btnDelete.click(async (e) => {
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
            $btnYes.click((e) => {
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
            $btnNo.click((e) => {
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
    cleanEvents(onComplete = Base.noop) {
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
        if (Base.debug)
            console.log('CommentsBS render');
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
        $contentReact.empty().append(`<div class="title" id="dialog-title" tabindex="0">${Base.trans("blog.title.comments")}</div>`);
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
        let hideMsg = '';
        if (comment.text.length > 210)
            hideMsg = '<span class="u-colorWhiteOpacity05 u-show-fulltext positionRelative zIndex1"></span><span class="sr-only">' + comment.text.substring(210) + '</span>';
        const avatar = comment.avatar || 'https://img.betaseries.com/NkUiybcFbxbsT_EnzkGza980XP0=/42x42/smart/https%3A%2F%2Fwww.betaseries.com%2Fimages%2Fsite%2Favatar-default.png';
        const template = `
            <div class="slide_flex">
                <div class="slide__comment positionRelative u-insideBorderOpacity u-insideBorderOpacity--01" data-comment-id="${comment.id}">
                    <p>${headMsg} ${hideMsg}</p>
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
                                <span class="stars">${Note.renderStars(comment.user_note, comment.user_id === Base.userId ? 'blue' : '')}</span>
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
        return Base.callApi(HTTP_VERBS.GET, 'comments', 'comments', params)
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

class CommentBS {
    /*************************************************/
    /*                  STATIC                       */
    /*************************************************/
    /**
     * Types d'évenements gérés par cette classe
     * @type {Array}
     */
    static EventTypes = [
        'update',
        'save',
        'add',
        'delete',
        'show',
        'hide'
    ];
    /**
     * Contient le nom des classes CSS utilisées pour le rendu du commentaire
     * @type Obj
     */
    static classNamesCSS = { reply: 'it_i3', actions: 'it_i1', comment: 'it_ix' };
    /*************************************************/
    /*                  PROPERTIES                   */
    /*************************************************/
    id;
    /**
     * Référence du média, pour créer l'URL (type.titleUrl)
     */
    reference;
    /**
     * Type de média
     */
    type;
    /**
     * Identifiant du média
     */
    ref_id;
    /**
     * Identifiant du membre du commentaire
     */
    user_id;
    /**
     * Login du membre du commentaire
     */
    login;
    /**
     * URL de l'avatar du membre du commentaire
     */
    avatar;
    /**
     * Date de création du commentaire
     */
    date;
    /**
     * Contenu du commentaire
     */
    text;
    /**
     * Index du commentaire dans la liste des commentaires du média
     */
    inner_id;
    /**
     * Index du commentaire dont celui-ci est une réponse
     */
    in_reply_to;
    /**
     * Identifiant du commentaire dont celui-ci est une réponse
     */
    in_reply_id;
    /**
     * Informations sur le membre du commentaire original
     */
    in_reply_user;
    /**
     * Note du membre pour le média
     */
    user_note;
    /**
     * Votes pour ce commentaire
     */
    thumbs;
    /**
     * Vote du membre connecté
     */
    thumbed;
    /**
     * Nombre de réponse à ce commentaires
     */
    nbReplies;
    /**
     * Les réponses au commentaire
     * @type {Array<CommentBS>}
     */
    replies;
    /**
     * Message de l'administration
     */
    from_admin;
    /**
     * ???
     */
    user_rank;
    /**
     * @type {CommentsBS} La collection de commentaires
     */
    _parent;
    /**
     * @type {Array<CustomEvent>} Liste des events déclarés par la fonction loadEvents
     */
    _events;
    /**
     * @type {object} Objet contenant les fonctions à l'écoute des changements
     * @private
     */
    _listeners;
    constructor(data, parent) {
        this._parent = parent;
        return this.fill(data)._initListeners();
    }
    /**
     * Remplit l'objet CommentBS avec les données provenant de l'API
     * @param   {Obj} data - Les données provenant de l'API
     * @returns {CommentBS}
     */
    fill(data) {
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
        this.in_reply_id = parseInt(data.in_reply_id, 10);
        this.in_reply_user = data.in_reply_user;
        this.user_note = data.user_note ? parseInt(data.user_note, 10) : 0;
        this.thumbs = parseInt(data.thumbs, 10);
        this.thumbed = data.thumbed ? parseInt(data.thumbed, 10) : 0;
        this.nbReplies = parseInt(data.replies, 10);
        this.replies = [];
        this.from_admin = data.from_admin;
        this.user_rank = data.user_rank;
        return this;
    }
    /**
     * Initialize le tableau des écouteurs d'évènements
     * @returns {Base}
     * @private
     */
    _initListeners() {
        this._listeners = {};
        const EvtTypes = CommentBS.EventTypes;
        for (let e = 0; e < EvtTypes.length; e++) {
            this._listeners[EvtTypes[e]] = [];
        }
        return this;
    }
    /**
     * Permet d'ajouter un listener sur un type d'évenement
     * @param  {EventTypes} name - Le type d'évenement
     * @param  {Function}   fn   - La fonction à appeler
     * @return {Base} L'instance du média
     */
    addListener(name, fn, ...args) {
        // On vérifie que le type d'event est pris en charge
        if (!CommentBS.EventTypes.includes(name)) {
            throw new Error(`${name} ne fait pas partit des events gérés par cette classe`);
        }
        if (this._listeners[name] === undefined) {
            this._listeners[name] = [];
        }
        for (const func in this._listeners[name]) {
            if (func.toString() == fn.toString()) {
                if (Base.debug)
                    console.warn('Cette fonction est déjà présente pour event[%s]', name);
                return;
            }
        }
        if (args.length > 0) {
            this._listeners[name].push({ fn: fn, args: args });
        }
        else {
            this._listeners[name].push(fn);
        }
        if (Base.debug)
            console.log('Base[%s] add Listener on event %s', this.constructor.name, name, this._listeners[name]);
        return this;
    }
    /**
     * Permet de supprimer un listener sur un type d'évenement
     * @param  {string}   name - Le type d'évenement
     * @param  {Function} fn   - La fonction qui était appelée
     * @return {Base} L'instance du média
     */
    removeListener(name, fn) {
        if (this._listeners[name] !== undefined) {
            for (let l = 0; l < this._listeners[name].length; l++) {
                if ((typeof this._listeners[name][l] === 'function' && this._listeners[name][l].toString() === fn.toString()) ||
                    this._listeners[name][l].fn.toString() == fn.toString()) {
                    this._listeners[name].splice(l, 1);
                }
            }
        }
        return this;
    }
    /**
     * Appel les listeners pour un type d'évenement
     * @param  {EventTypes} name - Le type d'évenement
     * @return {Base} L'instance du média
     */
    _callListeners(name) {
        if (this._listeners[name] !== undefined && this._listeners[name].length > 0) {
            const event = new CustomEvent('betaseries', { detail: { name: name } });
            if (Base.debug)
                console.log('Comment call %d Listeners on event %s', this._listeners[name].length, name);
            for (let l = 0; l < this._listeners[name].length; l++) {
                if (typeof this._listeners[name][l] === 'function') {
                    this._listeners[name][l].call(this, event, this);
                }
                else {
                    this._listeners[name][l].fn.apply(this, this._listeners[name][l].args);
                }
            }
        }
        return this;
    }
    /**
     * Récupère les réponses du commentaire
     * @param   {OrderComments} order - Ordre de tri des réponses
     * @returns {Promise<CommentBS>}
     */
    async fetchReplies(order = OrderComments.ASC) {
        if (this.nbReplies <= 0)
            return this;
        const data = await Base.callApi(HTTP_VERBS.GET, 'comments', 'replies', { id: this.id, order });
        this.replies = [];
        if (data.comments) {
            for (let c = 0; c < data.comments.length; c++) {
                this.replies.push(new CommentBS(data.comments[c], this));
            }
        }
        return this;
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
        return Base.callApi(HTTP_VERBS.POST, 'comments', 'comment', params)
            .then((data) => {
            return self.fill(data.comment);
        });
    }
    /**
     * Supprime le commentaire sur l'API
     * @returns
     */
    delete() {
        const self = this;
        const promises = [];
        if (this.nbReplies > 0) {
            for (let r = 0; r < this.replies.length; r++) {
                promises.push(Base.callApi(HTTP_VERBS.DELETE, 'comments', 'comment', { id: this.replies[r].id }));
            }
        }
        Promise.all(promises).then(() => {
            Base.callApi(HTTP_VERBS.DELETE, 'comments', 'comment', { id: this.id })
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
     * Renvoie la template HTML pour l'affichage d'un commentaire
     * @param   {CommentBS} comment Le commentaire à afficher
     * @returns {string}
     */
    static getTemplateComment(comment) {
        let text = new Option(comment.text).innerHTML;
        if (/@\w+/.test(text)) {
            text = text.replace(/@(\w+)/g, '<a href="/membre/$1" class="mainLink mainLink--regular">@$1</a>');
        }
        const spoiler = /\[spoiler\]/.test(text);
        const btnSpoiler = spoiler ? `<button type="button" class="btn-reset mainLink view-spoiler">${Base.trans("comment.button.display_spoiler")}</button>` : '';
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
                </span>&nbsp;<span class="btnText">${Base.trans("comment.hide_answers")}</span>
            </button>` : '';
        let templateOptions = `
            <a href="/messages/nouveau?login=${comment.login}" class="mainLink">Envoyer un message</a>
            <span class="mainLink">∙</span>
            <button type="button" class="btn-reset mainLink btnSignal">Signaler</button>
        `;
        if (comment.user_id === Base.userId) {
            templateOptions = `
                <button type="button" class="btn-reset mainLink btnEditComment">Éditer</button>
                <span class="mainLink">∙</span>
                <button type="button" class="btn-reset mainLink btnDeleteComment">Supprimer</button>
            `;
        }
        let btnResponse = `<span class="mainLink">&nbsp;∙&nbsp;</span><button type="button" class="btn-reset mainLink mainLink--regular btnResponse" ${!Base.userIdentified() ? 'style="display:none;"' : ''}>${Base.trans("timeline.comment.reply")}</button>`;
        if (isReply)
            btnResponse = '';
        return `
            <div class="comment ${className}positionRelative ${CommentBS.classNamesCSS.comment}" data-comment-id="${comment.id}" ${comment.in_reply_to > 0 ? 'data-comment-reply="' + comment.in_reply_to + '"' : ''} data-comment-inner="${comment.inner_id}">
                <div class="media">
                    <div class="media-left">
                        <a href="/membre/${comment.login}" class="avatar">
                            <img src="https://api.betaseries.com/pictures/members?key=${Base.userKey}&amp;id=${comment.user_id}&amp;width=64&amp;height=64&amp;placeholder=png" width="32" height="32" alt="Profil de ${comment.login}">
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
                                    ${Note.renderStars(comment.user_note, comment.user_id === Base.userId ? 'blue' : '')}
                                </span>
                                <div class="it_iv">
                                    <button type="button" class="btn-reset btnToggleOptions">
                                        <span class="svgContainer">
                                            <svg width="4" height="16" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="transform: rotate(90deg);">
                                                <defs>
                                                    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" id="svgthreedots"></path>
                                                </defs>
                                                <use fill="${Base.theme === 'dark' ? "rgba(255, 255, 255, .5)" : "#333"}" fill-rule="nonzero" xlink:href="#svgthreedots" transform="translate(-10 -4)"></use>
                                            </svg>
                                        </span>
                                    </button>
                                </div>
                            </div>
                            <div class="options-options options-comment" style="display:none;">
                                ${templateOptions}
                                <button type="button" class="btn-reset btnToggleOptions">
                                    <span class="svgContainer">
                                        <svg fill="${Base.theme === 'dark' ? "rgba(255, 255, 255, .5)" : "#333"}" width="9" height="9" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg">
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
        const login = Base.userIdentified() ? currentLogin : '';
        let replyTo = '', placeholder = Base.trans("timeline.comment.write");
        if (comment) {
            replyTo = ` data-reply-to="${comment.id}"`;
            placeholder = "Ecrivez une réponse à ce commentaire";
        }
        return `
            <div class="writing">
                <div class="media">
                    <div class="media-left">
                        <div class="avatar">
                            <img src="https://api.betaseries.com/pictures/members?key=${Base.userKey}&amp;id=${Base.userId}&amp;width=32&amp;height=32&amp;placeholder=png" width="32" height="32" alt="Profil de ${login}">
                        </div>
                    </div>
                    <div class="media-body">
                        <form class="gz_g1">
                            <textarea rows="2" placeholder="${placeholder}" class="form-control"${replyTo}></textarea>
                            <button class="btn-reset sendComment" disabled="" aria-label="${Base.trans("comment.send.label")}" title="${Base.trans("comment.send.label")}">
                                <span class="svgContainer" style="width: 16px; height: 16px;">
                                    <svg fill="${Base.theme === 'dark' ? "#fff" : "#333"}" width="15" height="12" xmlns="http://www.w3.org/2000/svg">
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
        // if (Base.debug) console.log('renderThumbs: ', {val, vote, result, text});
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
     * @returns {CommentBS | void} La réponse
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
        $btnClose.click(() => {
            funcPopup.hidePopup();
            $popup.removeAttr('data-popin-type');
        });
        this._events.push({ elt: $btnClose, event: 'click' });
        const $btnReport = $container.find('.btnSignal');
        $btnReport.click(async (e) => {
            e.stopPropagation();
            e.preventDefault();
            const $comment = $(e.currentTarget).parents('.comment');
            const comment = await getObjComment($comment);
            const $contentHtml = $container.parents('.popin-content').find('.popin-content-html');
            $contentHtml.empty().append(CommentBS.getTemplateReport(comment));
            $contentHtml.find('button.js-close-popupalert.btn-blue2').click((e) => {
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
                    <svg fill="${Base.theme == 'dark' ? 'rgba(255, 255, 255, .5)' : '#333'}" width="14" height="16" style="position: relative; top: 1px; left: -1px;">
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
                            <path fill="${Base.theme == 'dark' ? 'rgba(255, 255, 255, .5)' : '#333'}" d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32v-.68c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68c-2.87.68-4.5 3.24-4.5 6.32v5l-2 2v1h16v-1l-2-2z"></path>
                        </g>
                    </svg>
                `);
            }
        }
        $btnSubscribe.click((e) => {
            e.stopPropagation();
            e.preventDefault();
            if (!Base.userIdentified()) {
                faceboxDisplay('inscription', {}, () => { });
                return;
            }
            const $btn = $(e.currentTarget);
            const params = { type: self.getCollectionComments().media.mediaType.singular, id: self.getCollectionComments().media.id };
            if ($btn.hasClass('active')) {
                Base.callApi(HTTP_VERBS.DELETE, 'comments', 'subscription', params)
                    .then(() => {
                    self.getCollectionComments().is_subscribed = false;
                    displaySubscription($btn);
                });
            }
            else {
                Base.callApi(HTTP_VERBS.POST, 'comments', 'subscription', params)
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
            $prevCmt.click((e) => {
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
            $nextCmt.click((e) => {
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
            $btnSpoiler.click((e) => {
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
        $btnThumb.click((e) => {
            e.stopPropagation();
            e.preventDefault();
            if (!Base.userIdentified()) {
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
            Base.callApi(verb, 'comments', 'thumb', params)
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
                Base.notification('Vote commentaire', "Une erreur est apparue durant le vote: " + msg);
            });
        });
        this._events.push({ elt: $btnThumb, event: 'click' });
        /**
         * On affiche/masque les options du commentaire
         */
        const $btnOptions = $container.find('.btnToggleOptions');
        // if (Base.debug) console.log('Comment loadEvents toggleOptions.length', $btnOptions.length);
        $btnOptions.click((e) => {
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
        $btnSend.click(async (e) => {
            e.stopPropagation();
            e.preventDefault();
            if (!Base.userIdentified()) {
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
        $textarea.keypress((e) => {
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
        $baliseSpoiler.click(() => {
            const $textarea = $popup.find('textarea');
            if (/\[spoiler\]/.test($textarea.val())) {
                return;
            }
            const text = '[spoiler]' + $textarea.val() + '[/spoiler]';
            $textarea.val(text);
        });
        this._events.push({ elt: $baliseSpoiler, event: 'click' });
        const $btnReplies = $container.find('.comments .toggleReplies');
        $btnReplies.click((e) => {
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
                $btn.find('.btnText').text(Base.trans("comment.hide_answers"));
                $btn.find('svg').attr('style', 'transition: transform 200ms ease 0s; transform: rotate(180deg);');
                $btn.data('toggle', '1');
            }
            else {
                // On masque
                $replies.nextAll('.sub').fadeOut('fast');
                $replies.fadeOut('fast');
                $btn.find('.btnText').text(Base.trans("comment.button.reply", { "%count%": $replies.length.toString() }, $replies.length));
                $btn.find('svg').attr('style', 'transition: transform 200ms ease 0s;');
                $btn.data('toggle', '0');
            }
        });
        this._events.push({ elt: $btnReplies, event: 'click' });
        const $btnResponse = $container.find('.btnResponse');
        $btnResponse.click(async (e) => {
            e.stopPropagation();
            e.preventDefault();
            if (!Base.userIdentified()) {
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
        $btnEdit.click((e) => {
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
        $btnDelete.click((e) => {
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
            $btnYes.click((e) => {
                e.stopPropagation();
                e.preventDefault();
                self.delete();
                $btnClose.trigger('click');
            });
            $btnNo.click((e) => {
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
     * @param   {Function} onComplete - Fonction de callback
     * @returns {void}
     */
    cleanEvents(onComplete = Base.noop) {
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
        $contentReact.empty().append(`<div class="title" id="dialog-title" tabindex="0">${Base.trans("blog.title.comments")}</div>`);
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
        if (Base.userIdentified()) {
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
        if (this.getCollectionComments().isOpen() && Base.userIdentified()) {
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
                nav += ' <i class="fa fa-chevron-circle-left prev-comment" aria-hidden="true" title="Commentaire précédent"></i>';
            }
            if (!self._parent.isLast(self.id)) {
                nav += '  <i class="fa fa-chevron-circle-right next-comment" aria-hidden="true" title="Commentaire suivant"></i>';
            }
            $title.append(Base.trans("blog.title.comments") + nav);
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
     * @returns {Promise<void | CommentBS>}
     */
    sendReply(text) {
        const self = this;
        const params = {
            type: this.getCollectionComments().media.mediaType.singular,
            id: this.getCollectionComments().media.id,
            in_reply_to: this.inner_id,
            text: text
        };
        return Base.callApi(HTTP_VERBS.POST, 'comments', 'comment', params)
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
            Base.notification('Commentaire', "Erreur durant l'ajout d'un commentaire");
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
                            self._parent.updatePropRenderNote();
                    }
                }
            };
            Object.defineProperty(this, propKey, descriptor);
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
        const votes = 'vote' + (this.total > 1 ? 's' : ''), 
        // On met en forme le nombre de votes
        total = new Intl.NumberFormat('fr-FR', { style: 'decimal', useGrouping: true }).format(this.total), 
        // On limite le nombre de chiffre après la virgule
        note = this.mean.toFixed(2);
        let toString = `${total} ${votes} : ${note} / 5`;
        // On ajoute la note du membre connecté, si il a voté
        if (Base.userIdentified() && this.user > 0) {
            toString += `, votre note: ${this.user}`;
        }
        return toString;
    }
    /**
     * Crée une popup avec 5 étoiles pour noter le média
     */
    createPopupForVote(cb = Base.noop) {
        if (Base.debug)
            console.log('objNote createPopupForVote');
        // La popup et ses éléments
        const self = this, $popup = jQuery('#popin-dialog'), $contentHtmlElement = $popup.find(".popin-content-html"), $contentReact = $popup.find('.popin-content-reactmodule'), $closeButtons = $popup.find(".js-close-popupalert"), hidePopup = () => {
            if (Base.debug)
                console.log('objNote createPopupForVote hidePopup');
            $popup.attr('aria-hidden', 'true');
            $contentHtmlElement.find(".button-set").show();
            $contentHtmlElement.hide();
            // On désactive les events
            $text.find('.star-svg').off('mouseenter').off('mouseleave').off('click');
        }, showPopup = () => {
            if (Base.debug)
                console.log('objNote createPopupForVote showPopup');
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
                    self._parent.changeTitleNote(true);
                    self._parent._callListeners(EventTypes.NOTE);
                    if (cb)
                        cb.call(self);
                }
                else {
                    Base.notification('Erreur Vote', "Une erreur s'est produite durant le vote");
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
     */
    updateStars(elt = null) {
        elt = elt || jQuery('.blockInformations__metadatas .js-render-stars', this._parent.elt);
        let color = '';
        const $stars = elt.find('.star-svg use');
        const result = $($stars.get(0)).attr('xlink:href').match(/(grey|blue)/);
        if (result) {
            color = result[0];
        }
        let className;
        for (let s = 0; s < 5; s++) {
            className = Note.getTypeSvg(this.mean, s);
            // className = (this.mean <= s) ? StarTypes.EMPTY : (this.mean < s + 1) ? (this.mean >= s + 0.5) ? StarTypes.HALF : StarTypes.EMPTY : StarTypes.FULL;
            $($stars.get(s)).attr('xlink:href', `#icon-star${color}-${className}`);
        }
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
class User {
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
    constructor(data) {
        this.archived = (data.archived !== undefined) ? !!data.archived : false;
        this.downloaded = (data.downloaded !== undefined) ? !!data.downloaded : false;
        this.favorited = (data.favorited !== undefined) ? !!data.favorited : false;
        this.friends_want_to_watch = data.friends_want_to_watch || [];
        this.friends_watched = data.friends_watched || [];
        this.hidden = (data.hidden !== undefined) ? !!data.hidden : false;
        this.last = data.last || '';
        this.mail = (data.mail !== undefined) ? !!data.mail : false;
        this.next = null;
        if (data.next !== undefined) {
            this.next = new Next(data.next);
        }
        this.profile = data.profile || '';
        this.remaining = data.remaining || 0;
        this.seen = !!data.seen || false;
        this.status = (data.status !== undefined) ? parseInt(data.status, 10) : 0;
        this.tags = data.tags || '';
        this.twitter = !!data.twitter || false;
    }
    compare(data) {
        const props = Object.getOwnPropertyNames(this);
        for (const prop of props) {
            if (typeof this[prop] !== 'object' && Object.hasOwn(data, prop) && this[prop] != data[prop]) {
                return true;
            }
        }
        return false;
    }
}

function ExceptionIdentification(message) {
    this.message = message;
    this.name = "ExceptionIdentification";
}
var NetworkState;
(function (NetworkState) {
    NetworkState[NetworkState["offline"] = 0] = "offline";
    NetworkState[NetworkState["online"] = 1] = "online";
})(NetworkState = NetworkState || (NetworkState = {}));
var MediaType;
(function (MediaType) {
    MediaType["show"] = "show";
    MediaType["movie"] = "movie";
    MediaType["episode"] = "episode";
})(MediaType = MediaType || (MediaType = {}));
var EventTypes;
(function (EventTypes) {
    EventTypes["UPDATE"] = "update";
    EventTypes["SAVE"] = "save";
    EventTypes["ADD"] = "add";
    EventTypes["ADDED"] = "added";
    EventTypes["REMOVE"] = "remove";
    EventTypes["NOTE"] = "note";
    EventTypes["ARCHIVE"] = "archive";
    EventTypes["UNARCHIVE"] = "unarchive";
    EventTypes["SHOW"] = "show";
    EventTypes["HIDE"] = "hide";
})(EventTypes = EventTypes || (EventTypes = {}));
var HTTP_VERBS;
(function (HTTP_VERBS) {
    HTTP_VERBS["GET"] = "GET";
    HTTP_VERBS["POST"] = "POST";
    HTTP_VERBS["PUT"] = "PUT";
    HTTP_VERBS["DELETE"] = "DELETE";
    HTTP_VERBS["OPTIONS"] = "OPTIONS";
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
function isNull(val) {
    return val === null || val === undefined;
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
     * @param   {any} fn - Fonction callback de référence
     * @param   {any[]} funcs - Tableau des fonctions
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
     * Tableau des fonctions callback de type **then**
     * @type {Array<(data: Obj) => void>}
     */
    thenQueue;
    /**
     * Tableau des fonctions callback de type **catch**
     * @type {Array<(reason: any) => void>}
     */
    catchQueue;
    /**
     * Tableau des fonctions callback de type **finally**
     * @type {Array<() => void>}
     */
    finallyQueue;
    /**
     * Fonction qui sera executée lors de l'appel à la méthode **launch** {@see FakePromise.launch}
     * @type {() => Promise<Obj>}
     */
    promiseFunc;
    /**
     * Constructor
     * @param   {() => Promise<Obj>} [func] - Fonction promise qui sera executée plus tard
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
     * @param   {() => Promise<Obj>} func Fonction promise qui sera executée plus tard
     * @returns {FakePromise}
     */
    setFunction(func) {
        this.promiseFunc = func;
        return this;
    }
    /**
     * Simule un objet promise et stocke les fonctions pour plus tard
     * @param   {(data: Obj) => void} onfulfilled - Fonction appelée lorsque la promesse est tenue
     * @param   {(reason: any) => PromiseLike<never>} [onrejected] - Fonction appelée lorsque la promesse est rejetée
     * @returns {FakePromise}
     */
    then(onfulfilled, onrejected) {
        if (onfulfilled && !FakePromise.fnAlreadyInclude(onfulfilled, this.thenQueue)) {
            this.thenQueue.push(onfulfilled);
        }
        if (onrejected && !FakePromise.fnAlreadyInclude(onrejected, this.catchQueue)) {
            this.catchQueue.push(onrejected);
        }
        return this;
    }
    /**
     * Simule un objet promise et stocke les fonctions pour plus tard
     * @param   {(reason: any) => void | PromiseLike<void>} [onrejected] - Fonction appelée lorsque la promesse est rejetée
     * @returns {FakePromise}
     */
    catch(onrejected) {
        if (onrejected && !FakePromise.fnAlreadyInclude(onrejected, this.catchQueue)) {
            this.catchQueue.push(onrejected);
        }
        return this;
    }
    /**
     * Simule un objet promise et stocke les fonctions pour plus tard
     * @param   {() => void} [onfinally] - Fonction appelée lorsque la promesse est terminée
     * @returns {FakePromise}
     */
    finally(onfinally) {
        if (!onfinally && FakePromise.fnAlreadyInclude(onfinally, this.finallyQueue)) {
            this.finallyQueue.push(onfinally);
        }
        return this;
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
                    return;
                }
            }
        })
            .catch(err => {
            const catchs = this.catchQueue;
            for (let c = catchs.length; c >= 0; c--) {
                if (typeof catchs[c] === 'function') {
                    catchs[c](err);
                    return;
                }
            }
        })
            .finally(() => {
            const finallies = this.finallyQueue;
            for (let f = finallies.length; f >= 0; f--) {
                if (typeof finallies[f] === 'function') {
                    finallies[f]();
                    return;
                }
            }
        });
    }
}
class Base {
    /*
                    STATIC
    */
    /**
     * Flag de debug pour le dev
     * @static
     * @type {boolean}
     */
    static debug = false;
    /**
     * L'objet cache du script pour stocker les données
     * @static
     * @type {CacheUS}
     */
    static cache = null;
    /**
     * Objet contenant les informations de l'API
     * @static
     * @type {Obj}
     */
    static api = {
        "url": 'https://api.betaseries.com',
        "versions": { "current": '3.0', "last": '3.0' },
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
     * @see Base.authenticate
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
    static userIdentified = () => { return false; };
    /**
     * Fonction vide
     * @type {Function}
     */
    static noop = () => { };
    /**
     * Fonction de traduction de chaînes de caractères
     * @param   {String}  msg  - Identifiant de la chaîne à traduire
     * @param   {Obj}     [params] - Variables utilisées dans la traduction {"%key%"": value}
     * @param   {number}  [count=1] - Nombre d'éléments pour la version plural
     * @returns {string}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static trans = (msg, params, count = 1) => { return msg; };
    /**
     * Contient les infos sur les différentes classification TV et cinéma
     * @type {Ratings}
     */
    static ratings = null;
    static gm_funcs = {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        getValue: (key, defaultValue) => { return defaultValue; },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        setValue: (key, val) => { }
    };
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
                        src="${Base.serverOauthUrl}/index.html"
                        style="background:white;margin:auto;">
                </iframe>
                </div>'
            `);
        }
        return new Promise((resolve, reject) => {
            function receiveMessage(event) {
                const origin = new URL(Base.serverOauthUrl).origin;
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
        if (Base.api && Base.api.resources.indexOf(resource) === -1) {
            throw new Error(`Ressource (${resource}) inconnue dans l'API.`);
        }
        if (!Base.userKey) {
            Base.notification('Call API', `La clé API doit être renseignée`);
            throw new Error('userKey are required');
        }
        if (!Base.token && resource in Base.api.tokenRequired &&
            action in Base.api.tokenRequired[resource] &&
            Base.api.tokenRequired[resource][action].indexOf(type) !== 1) {
            Base.notification('Call API', `Identification requise pour cet appel: ${type} ${resource}/${action}`);
            // Identification required
            throw new ExceptionIdentification("Identification required");
        }
        let check = false;
        let display = true;
        // On vérifie si on doit afficher les infos de requêtes dans la console
        if (Base.api.notDisplay.indexOf(resource + action) >= 0) {
            display = false;
        }
        else {
            Base.showLoader();
        }
        // Les en-têtes pour l'API
        const myHeaders = {
            'Accept': 'application/json',
            'X-BetaSeries-Version': Base.api.versions.current,
            'X-BetaSeries-Token': Base.token,
            'X-BetaSeries-Key': Base.userKey
        }, checkKeys = Object.keys(Base.api.check);
        if (Base.debug && display) {
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
                Base.hideLoader();
            });
        }
        // Vérification de l'état du réseau, doit être placé après la gestion du cache
        if (Base.networkState === NetworkState.offline) {
            const key = type + resource + action;
            if (Base.__networkQueue[key]) {
                return Base.__networkQueue[key];
            }
            else {
                const promise = new FakePromise(() => {
                    return Base.callApi(type, resource, action, args, force)
                        .then(data => data)
                        .catch(err => err);
                });
                Base.__networkQueue[key] = promise;
                return Base.__networkQueue[key];
            }
        }
        // On check si on doit vérifier la validité du token
        // (https://www.betaseries.com/bugs/api/461)
        if (Base.userIdentified() && checkKeys.indexOf(resource) !== -1 &&
            Base.api.check[resource].indexOf(action) !== -1) {
            check = true;
        }
        function fetchUri(resolve, reject) {
            const initFetch = {
                method: type,
                headers: myHeaders,
                mode: 'cors',
                cache: 'no-cache'
            };
            let uri = `${Base.api.url}/${resource}/${action}`;
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
            fetch(uri, initFetch).then(response => {
                Base.counter++; // Incrément du compteur de requêtes à l'API
                if (Base.debug && (display || response.status !== 200))
                    console.log('fetch (%s %s) response status: %d', type, uri, response.status);
                // On récupère les données et les transforme en objet
                response.json().then((data) => {
                    if (Base.debug && (display || response.status !== 200))
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
                        Base.hideLoader();
                        return;
                    }
                    // On gère les erreurs réseau
                    if (!response.ok) {
                        console.error('Fetch erreur network', response);
                        reject(response);
                        Base.hideLoader();
                        return;
                    }
                    resolve(data);
                    Base.hideLoader();
                });
            }).catch(error => {
                if (Base.debug)
                    console.log('Il y a eu un problème avec l\'opération fetch: ' + error.message);
                console.error(error);
                reject(error.message);
                Base.hideLoader();
            });
        }
        return new Promise((resolve, reject) => {
            if (check) {
                const paramsFetch = {
                    method: 'GET',
                    headers: myHeaders,
                    mode: 'cors',
                    cache: 'no-cache'
                };
                if (Base.debug && display)
                    console.info('%ccall /members/is_active', 'color:#1d6fb2');
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
                Base.setPropValue(obj[tab][index], key, val);
            }
            else if (/\[.*\]$/.test(path)) {
                const tab = path.replace(/\[.+\]$/, '');
                const index = path.replace(/^.*\[/, '').replace(/\]$/, '');
                Base.setPropValue(obj[tab][index], key, val);
            }
            else {
                Base.setPropValue(obj[path], key, val);
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
    static relatedProps = {};
    static selectorsCSS = {};
    /**
     * Etat du réseau
     * @type {NetworkState}
     */
    static networkState = NetworkState.online;
    /**
     * Stockage des appels à l'API lorsque le réseau est offline
     * @type {Record<string, FakePromise>}
     */
    static __networkQueue = {};
    /**
     * Modifie la variable de l'état du réseau
     * Et gère les promesses d'appels à l'API lorsque le réseau est online
     * @param {NetworkState} state - Etat du réseau
     */
    static changeNetworkState(state) {
        this.networkState = state;
        if (state === NetworkState.online && Object.keys(this.__networkQueue).length > 0) {
            const keys = Reflect.ownKeys(this.__networkQueue);
            for (const key of keys) {
                const promise = this.__networkQueue[key].launch();
                promise.finally(() => delete this.__networkQueue[key]);
            }
            this.__networkQueue = {};
        }
    }
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
    /**
     * @type {boolean} Flag d'initialisation de l'objet, nécessaire pour les methodes fill and compare
     */
    __initial;
    /**
     * @type {Record<string, Changes} Stocke les changements des propriétés de l'objet
     */
    __changes;
    /**
     * @type {Array<string>} Tableau des propriétés énumerables de l'objet
     */
    __props;
    /**
     * @type {JQuery<HTMLElement>} Element HTML de référence du média
     */
    __elt;
    /**
     * @type {object} Contient les écouteurs d'évènements de l'objet
     */
    __listeners;
    /*
                    METHODS
    */
    constructor(data) {
        if (!(data instanceof Object)) {
            throw new Error("data is not an object");
        }
        this.__initial = true;
        this.__changes = {};
        this.characters = [];
        this.__elt = null;
        this.__props = ['characters', 'comments', 'mediaType'];
        this._initListeners();
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
     * @param  {Obj} data - Les données provenant de l'API
     * @returns {Base}
     * @virtual
     */
    fill(data) {
        const self = this;
        for (const propKey in this.constructor.relatedProps) {
            if (!Reflect.has(data, propKey))
                continue;
            const relatedProp = this.constructor.relatedProps[propKey];
            const dataProp = data[propKey];
            let descriptor;
            if (this.__initial) {
                descriptor = {
                    configurable: true,
                    enumerable: true,
                    get: () => {
                        return self['_' + relatedProp.key];
                    },
                    set: (newValue) => {
                        if (self.__initial) {
                            self['_' + relatedProp.key] = newValue;
                            return;
                        }
                        const oldValue = self['_' + relatedProp.key];
                        if (oldValue === newValue) {
                            return;
                        }
                        else if (Array.isArray(oldValue) && oldValue.length === newValue.length) {
                            let diff = false;
                            for (let i = 0, _len = oldValue.length; i < _len; i++) {
                                if (oldValue[i] !== newValue[i]) {
                                    diff = true;
                                    break;
                                }
                            }
                            if (!diff)
                                return;
                        }
                        else if (typeof newValue === 'object') {
                            // console.log('fill setter[%s]', relatedProp.key, {oldValue, newValue});
                            let changed = false;
                            const keysNew = Reflect.ownKeys(newValue)
                                .filter((key) => !key.startsWith('_'));
                            for (let k = 0, _len = keysNew.length; k < _len; k++) {
                                if (oldValue[keysNew[k]] !== newValue[keysNew[k]]) {
                                    changed = true;
                                    break;
                                }
                            }
                            if (!changed)
                                return;
                        }
                        self['_' + relatedProp.key] = newValue;
                        if (!self.__initial) {
                            self.__changes[relatedProp.key] = { oldValue, newValue };
                            self.updatePropRender(relatedProp.key);
                        }
                    }
                };
            }
            let setValue = false, value = undefined;
            switch (relatedProp.type) {
                case 'string':
                    value = String(dataProp);
                    setValue = true;
                    break;
                case 'number':
                    value = (!isNull(dataProp)) ? parseInt(dataProp, 10) : null;
                    setValue = true;
                    break;
                case 'boolean':
                case 'bool':
                    value = !!dataProp;
                    setValue = true;
                    break;
                case 'date':
                    value = new Date(dataProp);
                    setValue = true;
                    break;
                case 'object':
                    value = Object.assign({}, dataProp);
                    setValue = true;
                    break;
                case 'array': {
                    value = dataProp;
                    setValue = true;
                    break;
                }
                default: {
                    if (typeof relatedProp.type === 'function' && dataProp) {
                        // if (Base.debug) console.log('fill type function', {type: relatedProp.type, dataProp});
                        value = Reflect.construct(relatedProp.type, [dataProp]);
                        if (value && Reflect.has(value, 'parent')) {
                            value.parent = self;
                        }
                        setValue = true;
                    }
                    break;
                }
            }
            if (!setValue && value == undefined && Reflect.has(relatedProp, 'default')) {
                value = relatedProp.default;
                setValue = true;
            }
            if (setValue) {
                if (typeof relatedProp.transform === 'function') {
                    const dataToTransform = (dataProp != undefined) ? dataProp : data;
                    value = relatedProp.transform(this, dataToTransform);
                }
                // if (Base.debug) console.log('Base.fill descriptor[%s]', propKey, relatedProp, value);
                if (this.__initial) {
                    Object.defineProperty(this, relatedProp.key, descriptor);
                    Reflect.set(this, relatedProp.key, value);
                    this.__props.push(relatedProp.key);
                }
                else {
                    this[relatedProp.key] = value;
                }
            }
        }
        if (this.__initial) {
            this.__props.sort();
            this.__initial = false;
        }
        return this.save();
    }
    _initRender() {
        if (!this.elt)
            return;
        this.changeTitleNote(true);
        this.decodeTitle();
        this.objNote.updateStars();
    }
    /**
     * Met à jour le rendu HTML des propriétés de l'objet
     * si un sélecteur CSS exite pour la propriété (cf. Class.selectorCSS)
     * Méthode appelée automatiquement par le setter de la propriété
     * @see Show.selectorsCSS
     * @param   {string} propKey - La propriété de l'objet à mettre à jour
     * @returns {void}
     */
    updatePropRender(propKey) {
        if (!this.elt)
            return;
        const fnPropKey = 'updatePropRender' + propKey.camelCase().upperFirst();
        // if (Base.debug) console.log('updatePropRender', propKey, fnPropKey);
        if (Reflect.has(this, fnPropKey)) {
            // if (Base.debug) console.log('updatePropRender Reflect has method');
            this[fnPropKey]();
        }
        else if (Reflect.has(this.constructor.selectorsCSS, propKey)) {
            // if (Base.debug) console.log('updatePropRender default');
            const selectorCSS = this.constructor.selectorsCSS[propKey];
            jQuery(selectorCSS).text(this[propKey].toString());
            delete this.__changes[propKey];
        }
    }
    updatePropRenderNote() {
        if (Base.debug)
            console.log('updatePropRenderNote');
        this.objNote.updateStars();
        this.changeTitleNote(true);
        this._callListeners(EventTypes.NOTE);
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
        //if (Base.debug) console.log('Base[%s] add Listener on event %s', this.constructor.name, name);
        // On vérifie que le type d'event est pris en charge
        if (this.constructor.EventTypes.indexOf(name) < 0) {
            throw new Error(`${name} ne fait pas partit des events gérés par cette classe`);
        }
        if (this.__listeners[name] === undefined) {
            this.__listeners[name] = [];
        }
        for (const func in this.__listeners[name]) {
            if (func.toString() == fn.toString())
                return;
        }
        if (args.length > 0) {
            this.__listeners[name].push({ fn: fn, args: args });
        }
        else {
            this.__listeners[name].push(fn);
        }
        if (Base.debug)
            console.log('Base[%s] add Listener on event %s', this.constructor.name, name, this.__listeners[name]);
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
                if ((typeof this.__listeners[name][l] === 'function' && this.__listeners[name][l].toString() === fn.toString()) ||
                    this.__listeners[name][l].fn.toString() == fn.toString()) {
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
        // if (Base.debug) console.log('Base[%s] call Listeners of event %s', this.constructor.name, name, this.__listeners);
        if (this.constructor.EventTypes.indexOf(name) >= 0 && this.__listeners[name].length > 0) {
            if (Base.debug)
                console.log('Base[%s] call %d Listeners on event %s', this.constructor.name, this.__listeners[name].length, name, this.__listeners);
            const event = new CustomEvent('betaseries', { detail: { name: name } });
            for (let l = 0; l < this.__listeners[name].length; l++) {
                if (typeof this.__listeners[name][l] === 'function') {
                    this.__listeners[name][l].call(this, event, this);
                }
                else {
                    this.__listeners[name][l].fn.apply(this, this.__listeners[name][l].args);
                }
            }
        }
        return this;
    }
    /**
     * Méthode d'initialisation de l'objet
     * @returns {Promise<Base>}
     */
    init() {
        if (this.elt) {
            this.comments = new CommentsBS(this.nbComments, this);
        }
        return new Promise(resolve => resolve(this));
    }
    /**
     * Sauvegarde l'objet en cache
     * @return {Base} L'instance du média
     */
    save() {
        if (Base.cache instanceof CacheUS) {
            Base.cache.set(this.mediaType.plural, this.id, this);
            this._callListeners(EventTypes.SAVE);
        }
        return this;
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
        const $elt = this.elt.find('.blockInformations__title'), title = $elt.text();
        if (/&#/.test(title)) {
            $elt.text($('<textarea />').html(title).text());
        }
        return this;
    }
    /**
     * Ajoute le nombre de votes, à la note, dans l'attribut title de la balise
     * contenant la représentation de la note du média
     *
     * @param  {boolean} [change=true] - Indique si on doit changer l'attribut title du DOMElement
     * @return {string} Le titre modifié de la note
     */
    changeTitleNote(change = true) {
        const $elt = this.elt.find('.js-render-stars');
        if (this.objNote.mean <= 0 || this.objNote.total <= 0) {
            if (change)
                $elt.attr('title', 'Aucun vote');
            return;
        }
        const title = this.objNote.toString();
        if (change) {
            $elt.attr('title', title);
        }
        return title;
    }
    /**
     * Ajoute le vote du membre connecté pour le média
     * @param   {number} note - Note du membre connecté pour le média
     * @returns {Promise<boolean>}
     */
    addVote(note) {
        const self = this;
        return new Promise((resolve, reject) => {
            Base.callApi(HTTP_VERBS.POST, this.mediaType.plural, 'note', { id: this.id, note: note })
                .then((data) => {
                self.fill(data[this.mediaType.singular])._callListeners(EventTypes.NOTE);
                resolve(true);
            })
                .catch(err => {
                Base.notification('Erreur de vote', 'Une erreur s\'est produite lors de l\'envoi de la note: ' + err);
                reject(err);
            });
        });
    }
    /**
     * *fetchCharacters* - Récupère les acteurs du média
     * @abstract
     * @returns {Promise<this>}
     */
    fetchCharacters() {
        throw new Error('Method abstract');
    }
    /**
     * *getCharacter* - Retourne un personnage à partir de son identifiant
     * @param   {number} id - Identifiant du personnage
     * @returns {Character | null}
     */
    getCharacter(id) {
        for (const actor of this.characters) {
            if (actor.id === id)
                return actor;
        }
        return null;
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

/* eslint-disable @typescript-eslint/no-explicit-any */
class Media extends Base {
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
     * @type {number} Nombre de membres ayant ce média sur leur compte
     */
    followers;
    /**
     * @type {Array<string>} Les genres attribués à ce média
     */
    genres;
    /**
     * @type {string} Identifiant IMDB
     */
    imdb_id;
    /**
     * @type {string} Langue originale du média
     */
    language;
    /**
     * @type {number} Durée du média en minutes
     */
    duration;
    /**
     * @type {string} Titre original du média
     */
    original_title;
    /**
     * @type {Array<Similar>} Tableau des médias similaires
     */
    similars;
    /**
     * @type {number} Nombre de médias similaires
     */
    nbSimilars;
    /**
     * @type {boolean} Indique si le média se trouve sur le compte du membre connecté
     */
    in_account;
    /**
     * @type {string} slug - Identifiant du média servant pour l'URL
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
            const override = await Base.gm_funcs.getValue('override', { shows: {}, movies: {} });
            if (override[type.overrideType][this.id] === undefined)
                override[type.overrideType][this.id] = {};
            override[type.overrideType][this.id][prop] = value;
            let path = type.propsAllowedOverride[prop].path;
            if (type.propsAllowedOverride[prop].params) {
                override[type.overrideType][this.id][prop] = { value, params };
                path = Base.replaceParams(path, type.propsAllowedOverride[prop].params, params);
                console.log('override', { prop, value, params, path });
            }
            Base.setPropValue(this, path, value);
            await Base.gm_funcs.setValue('override', override);
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
        const override = await Base.gm_funcs.getValue('override', { shows: {}, movies: {} });
        console.log('_overrideProps override', override);
        if (override[overrideType][this.id]) {
            console.log('_overrideProps override found', override[overrideType][this.id]);
            for (const prop in override[overrideType][this.id]) {
                let path = type.propsAllowedOverride[prop].path;
                let value = override[overrideType][this.id][prop];
                if (type.propsAllowedOverride[prop].params && typeof override[overrideType][this.id][prop] === 'object') {
                    value = override[overrideType][this.id][prop].value;
                    const params = override[overrideType][this.id][prop].params;
                    path = Base.replaceParams(path, type.propsAllowedOverride[prop].params, params);
                }
                console.log('_overrideProps prop[%s]', prop, { path, value });
                Base.setPropValue(this, path, value);
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
        const proxy = Base.serverBaseUrl + '/proxy/';
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
                // console.log('_getTvdbUrl response', res);
                if (res.ok) {
                    return res.json();
                }
                return rej();
            }).then(data => {
                // console.log('_getTvdbUrl data', data);
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
/** @enum {number} */
var Picked;
(function (Picked) {
    Picked[Picked["none"] = 0] = "none";
    Picked[Picked["banner"] = 1] = "banner";
    Picked[Picked["show"] = 2] = "show";
})(Picked = Picked || (Picked = {}));
/**
 * Classe représentant une image
 * @class
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
            Base.callApi(HTTP_VERBS.GET, 'platforms', 'list', { country })
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
 * @implements {implShow, implAddNote}
 */
class Show extends Media {
    /***************************************************/
    /*                      STATIC                     */
    /***************************************************/
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
        if (Array.isArray(obj.seasons) && obj.seasons.length === data.length) {
            return obj.seasons;
        }
        const seasons = [];
        for (let s = 0; s < data.length; s++) {
            seasons.push(new Season(data[s], obj));
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
        return new Promise((resolve, reject) => {
            Base.callApi('GET', 'shows', 'display', params, force)
                .then(data => resolve(new Show(data.show, jQuery('.blockInformations'))))
                .catch(err => reject(err));
        });
    }
    /**
     * fetchLastSeen - Méthode static retournant les 10 dernières séries vues par le membre
     * @static
     * @param  {number}  [limit = 10]  Le nombre limite de séries retournées
     * @return {Promise<Show>}         Une promesse avec les séries
     */
    static fetchLastSeen(limit = 10) {
        return new Promise((resolve, reject) => {
            Base.callApi(HTTP_VERBS.GET, 'shows', 'member', { order: 'last_seen', limit })
                .then((data) => {
                const shows = [];
                for (let s = 0; s < data.shows.length; s++) {
                    shows.push(new Show(data.shows[s]));
                }
                resolve(shows);
            })
                .catch(err => reject(err));
        });
    }
    /**
     * Méthode static servant à récupérer plusieurs séries sur l'API BS
     * @static
     * @param  {Array<number>} ids - Les identifiants des séries recherchées
     * @return {Promise<Array<Show>>}
     */
    static fetchMulti(ids) {
        return new Promise((resolve, reject) => {
            Base.callApi(HTTP_VERBS.GET, 'shows', 'display', { id: ids.join(',') })
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
                resolve(shows);
            })
                .catch(err => reject(err));
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
     * @type {object} Contient les alias de la série
     */
    aliases;
    /**
     * @type {string} Année de création de la série
     */
    creation;
    /**
     * @type {string} Pays d'origine de la série
     */
    country;
    /**
     * @type {number} Pointeur vers la saison courante
     */
    _currentSeason;
    /**
     * @type {Images} Contient les URLs d'accès aux images de la série
     */
    images;
    /**
     * @type {boolean} Indique si la série se trouve dans les séries à voir
     */
    markToSee;
    /**
     * @type {number} Nombre total d'épisodes dans la série
     */
    nbEpisodes;
    /**
     * @type {number} Nombre de saisons dans la série
     */
    nbSeasons;
    /**
     * @type {string} Chaîne TV ayant produit la série
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
     * @type {string} Code de classification TV parental
     */
    rating;
    /**
     * @type {Array<Person>} Tableau des acteurs de la série
     */
    persons;
    /**
     * @type {Array<Picture>} Tableau des images uploadées par les membres
     */
    pictures;
    /**
     * @type {Platforms} Plateformes de diffusion
     */
    platforms;
    /**
     * @type {Array<Season>} Tableau des saisons de la série
     */
    seasons;
    /**
     * @type {Showrunner}
     */
    showrunner;
    /**
     * @type {Array<string>} Tableau des liens sociaux de la série
     */
    social_links;
    /**
     * @type {string} Status de la série sur le compte du membre
     */
    status;
    /**
     * @type {number} Identifiant TheTVDB de la série
     */
    thetvdb_id;
    /**
     * @type {object} Contient les URLs des posters disponibles pour la série
     */
    _posters;
    /***************************************************/
    /*                      METHODS                    */
    /***************************************************/
    /**
     * Constructeur de la classe Show
     * @param   {Obj} data - Les données du média
     * @param   {JQuery<HTMLElement>} element - Le DOMElement associé au média
     * @returns {Media}
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
            promises.push(super.init());
            return Promise.all(promises).then(() => this);
        }
        return super.init();
    }
    /**
     * Récupère les données de la série sur l'API
     * @param  {boolean} [force=true]   Indique si on utilise les données en cache
     * @return {Promise<*>}             Les données de la série
     */
    fetch(force = true) {
        const self = this;
        if (this.__fetches.show)
            return this.__fetches.show;
        this.__fetches.show = Base.callApi('GET', 'shows', 'display', { id: this.id }, force)
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
        this.__fetches.seasons = Base.callApi(HTTP_VERBS.GET, 'shows', 'seasons', params, force)
            .then((data) => {
            self.seasons = [];
            if (data?.seasons?.length <= 0) {
                return self;
            }
            let seasonNumber;
            for (let s = 0; s < data.seasons.length; s++) {
                seasonNumber = parseInt(data.seasons[s].number, 10);
                self.seasons[seasonNumber - 1] = new Season(data.seasons[s], this);
            }
            return self;
        }).finally(() => delete self.__fetches.seasons);
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
        this.__fetches.characters = Base.callApi(HTTP_VERBS.GET, 'shows', 'characters', { thetvdb_id: this.thetvdb_id })
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
        this.__fetches.persons = Base.callApi(HTTP_VERBS.GET, 'persons', 'show', { id: this.id })
            .then(data => {
            this.persons = [];
            if (data.persons) {
                for (let p = 0; p < data.persons.length; p++) {
                    self.persons.push(new Person(data.persons[p]));
                }
            }
            return self;
        }).finally(() => delete self.__fetches.persons);
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
        const toSee = await Base.gm_funcs.getValue('toSee', {});
        return toSee[this.id] !== undefined;
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
            Base.callApi('POST', 'shows', 'show', { id: self.id })
                .then(data => {
                self.fill(data.show);
                self._callListeners(EventTypes.ADD);
                self.save();
                resolve(self);
            }, err => {
                // Si la série est déjà sur le compte du membre
                if (err.code !== undefined && err.code === 2003) {
                    self.update(true).then((show) => {
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
            Base.callApi('DELETE', 'shows', 'show', { id: self.id })
                .then(data => {
                self.fill(data.show);
                self._callListeners(EventTypes.REMOVE);
                self.save();
                resolve(self);
            }, err => {
                // Si la série n'est plus sur le compte du membre
                if (err.code !== undefined && err.code === 2004) {
                    self.update(true).then((show) => {
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
            Media.callApi('POST', 'shows', 'archive', { id: self.id })
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
            Media.callApi('DELETE', 'shows', 'archive', { id: self.id })
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
            Media.callApi('POST', 'shows', 'favorite', { id: self.id })
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
            Media.callApi('DELETE', 'shows', 'favorite', { id: self.id })
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
     * @param  {Boolean}  [force=false]     Forcer la récupération des données sur l'API
     * @param  {Callback} [cb = Base.noop]  Fonction de callback
     * @return {Promise<Show>}              Promesse (Show)
     */
    update(force = false, cb = Base.noop) {
        const self = this;
        return Base.callApi('GET', 'shows', 'display', { id: self.id }, force)
            .then(data => {
            self.fill(data.show).save();
            self.updateRender(() => {
                cb();
                self._callListeners(EventTypes.UPDATE);
            });
            return self;
        })
            .catch(err => {
            Media.notification('Erreur de récupération de la ressource Show', 'Show update: ' + err);
            cb();
        });
    }
    /**
     * Met à jour le rendu de la barre de progression
     * et du prochain épisode
     * @param  {Callback} [cb=Base.noop] Fonction de callback
     * @return {void}
     */
    updateRender(cb = Base.noop) {
        const self = this;
        this.updateProgressBar();
        this.updateNextEpisode();
        this.updateArchived();
        this.updateNote();
        const note = this.objNote;
        if (Base.debug) {
            console.log('Next ID et status', {
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
                if (Base.debug)
                    console.log('Série terminée, popup confirmation archivage');
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
                if (Base.debug)
                    console.log('Proposition de voter pour la série');
                promise.then(() => {
                    let retourCallback = false;
                    // eslint-disable-next-line no-undef
                    new PopupAlert({
                        title: Base.trans("popin.note.title.show"),
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
        if (Base.debug)
            console.log('updateProgressBar');
        // On met à jour la barre de progression
        jQuery('.progressBarShow').css('width', this.user.status.toFixed(1) + '%');
    }
    /**
     * Simule un clic sur le bouton d'archivage de la série sur la page Web
     */
    updateArchived() {
        if (Base.debug)
            console.log('Show updateArchived');
        const $btnArchive = jQuery('#reactjs-show-actions button.btn-archive');
        if (this.isArchived() && $btnArchive.length > 0) {
            $btnArchive.trigger('click');
        }
    }
    updateNote() {
        if (Base.debug)
            console.log('Show updateNote');
        if (this.objNote.user) {
            this._callListeners(EventTypes.NOTE);
        }
    }
    /**
     * Met à jour le bloc du prochain épisode à voir
     * @param   {Callback} [cb=noop] Fonction de callback
     * @returns {void}
     */
    updateNextEpisode(cb = Base.noop) {
        if (Base.debug)
            console.log('updateNextEpisode');
        const self = this;
        const $nextEpisode = jQuery('a.blockNextEpisode');
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
            if (Base.debug)
                console.log('nextEpisode et show.user.next OK', this.user, next);
            // Modifier l'image
            const $img = $nextEpisode.find('img'), $remaining = $nextEpisode.find('.remaining div'), $parent = $img.parent('div'), height = $img.attr('height'), width = $img.attr('width'), src = `${Base.api.url}/pictures/episodes?key=${Base.userKey}&id=${next.id}&width=${width}&height=${height}`;
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
            if (Base.debug)
                console.log('No nextEpisode et show.user.next OK', this.user);
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
            const height = 70, width = 124, src = `${Base.api.url}/pictures/episodes?key=${Base.userKey}&id=${res.user.next.id}&width=${width}&height=${height}`, serieTitle = res.resource_url.split('/').pop();
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
                    <div class="label">${Base.trans('show.button.add.label')}</div>
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
                if (Base.debug)
                    console.groupCollapsed('AddShow');
                const done = function () {
                    // On met à jour les boutons Archiver et Favori
                    changeBtnAdd(self);
                    // On met à jour le bloc du prochain épisode à voir
                    self.updateNextEpisode(function () {
                        self._callListeners(EventTypes.ADDED);
                        if (Base.debug)
                            console.groupEnd();
                    });
                };
                self.addToAccount()
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
                    ${Base.trans("popup.suggest_show.title", { '%title%': "une série" })}</button>`;
                jQuery('#similars h2.blockTitle').after(btnAddSimilars);
                // self.addNumberVoters();
                // On supprime le btn ToSeeLater
                self.elt.find('.blockInformations__action .btnMarkToSee').parent().remove();
                self.elt.find('.blockInformations__title .fa-clock-o').remove();
                const toSee = await Base.gm_funcs.getValue('toSee', {});
                if (toSee[self.id] !== undefined) {
                    delete toSee[self.id];
                    Base.gm_funcs.setValue('toSee', toSee);
                }
            }
            self.addEventBtnsArchiveAndFavoris();
            self.deleteShowClick();
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
                                <div class="label">${Base.trans('show.button.add.label')}</div>
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
                                if (Base.debug)
                                    console.log('clean episode %d', e, update);
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
                        title: Base.trans("popup.delete_show_success.title"),
                        text: Base.trans("popup.delete_show_success.text", { "%title%": self.title }),
                        yes: Base.trans("popup.delete_show_success.yes"),
                        callback_yes: afterNotif
                    });
                };
                // Supprimer la série du compte utilisateur
                // eslint-disable-next-line no-undef
                new PopupAlert({
                    title: Base.trans("popup.delete_show.title", { "%title%": self.title }),
                    text: Base.trans("popup.delete_show.text", { "%title%": self.title }),
                    callback_yes: function () {
                        if (Base.debug)
                            console.groupCollapsed('delete show');
                        self.removeFromAccount()
                            .then(done, err => {
                            if (err && err.code !== undefined && err.code === 2004) {
                                done();
                                if (Base.debug)
                                    console.groupEnd();
                                return;
                            }
                            Media.notification('Erreur de suppression de la série', err);
                            if (Base.debug)
                                console.groupEnd();
                        });
                    },
                    callback_no: Base.noop
                });
            });
        }
    }
    /**
     * Ajoute le bouton toSee dans les actions de la série
     * @sync
     */
    async addBtnToSee() {
        if (this.elt.find('.btnMarkToSee').length > 0)
            return;
        const self = this;
        const btnHTML = `
            <div class="blockInformations__action">
                <button class="btn-reset btn-transparent btnMarkToSee" type="button" title="Ajouter la série aux séries à voir">
                    <i class="fa fa-clock-o" aria-hidden="true"></i>
                </button>
                <div class="label">A voir</div>
            </div>`;
        const toggleToSeeShow = async (showId) => {
            const storeToSee = await Base.gm_funcs.getValue('toSee', {});
            let toSee;
            if (storeToSee[showId] === undefined) {
                storeToSee[showId] = true;
                toSee = true;
            }
            else {
                delete storeToSee[showId];
                toSee = false;
            }
            Base.gm_funcs.setValue('toSee', storeToSee);
            return toSee;
        };
        this.elt.find('.blockInformations__actions').last().append(btnHTML);
        const $btn = this.elt.find('.blockInformations__action .btnMarkToSee');
        $btn.on('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            const $btn = jQuery(e.currentTarget);
            const toSee = toggleToSeeShow(self.id);
            if (toSee) {
                $btn.find('i.fa').css('color', 'var(--body_background)');
                $btn.attr('title', 'Retirer la série des séries à voir');
                self.elt.find('.blockInformations__title').append('<i class="fa fa-clock-o" aria-hidden="true" style="font-size:0.6em;margin-left:5px;vertical-align:middle;" title="Série à voir plus tard"></i>');
            }
            else {
                $btn.find('i.fa').css('color', 'var(--default-color)');
                $btn.attr('title', 'Ajouter la série aux séries à voir');
                self.elt.find('.blockInformations__title .fa').remove();
            }
            $btn.blur();
        });
        const toSee = await Base.gm_funcs.getValue('toSee', {});
        if (toSee[this.id] !== undefined) {
            $btn.find('i.fa').css('color', 'var(--body_background)');
            $btn.attr('title', 'Retirer la série des séries à voir');
            self.elt.find('.blockInformations__title').append('<i class="fa fa-clock-o" aria-hidden="true" style="font-size:0.6em;" title="Série à voir plus tard"></i>');
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
            if (Base.debug)
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
                    if (Base.debug)
                        console.groupEnd();
                }, err => {
                    Base.notification('Erreur de favoris de la série', err);
                    if (Base.debug)
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
            const rating = Base.ratings[this.rating] !== undefined ? Base.ratings[this.rating] : null;
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
     * @param   {number} seasonNumber Le numéro de la saison courante (commence à 1)
     * @returns {Show}  L'instance de la série
     * @throws  {Error} if seasonNumber is out of range of seasons
     */
    setCurrentSeason(seasonNumber) {
        if (seasonNumber <= 0 || seasonNumber > this.seasons.length) {
            throw new Error("seasonNumber is out of range of seasons");
        }
        this._currentSeason = seasonNumber - 1;
        return this;
    }
    /**
     * Retourne la saison courante
     * @return {Season}
     */
    get currentSeason() {
        return this.seasons[this._currentSeason];
    }
    /**
     * Retourne l'objet Season correspondant au numéro de saison fournit en paramètre
     * @param   {number} seasonNumber - Numéro de saison (base: 1)
     * @returns {Season}
     */
    getSeason(seasonNumber) {
        if (Base.debug)
            console.log('getSeason: ', seasonNumber);
        for (let s = 0; s < this.seasons.length; s++) {
            if (this.seasons[s].number == seasonNumber) {
                return this.seasons[s];
            }
        }
        return null;
    }
    /**
     * Retourne une image, si disponible, en fonction du format désiré
     * @param  {string = Images.formats.poster} format   Le format de l'image désiré
     * @return {Promise<string>}                         L'URL de l'image
     */
    getDefaultImage(format = Images.formats.poster) {
        const proxy = Base.serverBaseUrl + '/posters';
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
                if (Base.debug)
                    console.log('getDefaultImage poster', this.images.poster);
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
        const proxy = Base.serverBaseUrl + '/posters';
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
                // console.log('getAllPosters url', url);
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
        sale_date: { key: "sale_date", type: 'date' },
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
            Base.callApi('GET', 'movies', 'movie', params, force)
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
            Base.callApi(HTTP_VERBS.GET, 'movies', 'search', { title }, force)
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
        if (!Base.userIdentified() || this.user.status === state) {
            if (Base.debug)
                console.info('User not identified or state is equal with user status');
            return Promise.resolve(this);
        }
        return Base.callApi(HTTP_VERBS.POST, this.mediaType.plural, 'movie', { id: this.id, state: state })
            .then((data) => {
            self.fill(data.movie);
            return this;
        })
            .catch(err => {
            console.warn("Erreur ajout film sur compte", err);
            Base.notification('Ajout du film', "Erreur lors de l'ajout du film sur votre compte");
            return this;
        });
    }
    /**
     * Retourne une image, si disponible, en fonction du format désiré
     * @param  {string = Images.formats.poster} format   Le format de l'image désiré
     * @return {Promise<string>}                         L'URL de l'image
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
                    const api_key = Base.themoviedb_api_user_key;
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
        this.__fetches.characters = Base.callApi(HTTP_VERBS.GET, 'movies', 'characters', { id: this.id }, true)
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
            const api_key = Base.themoviedb_api_user_key;
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
     * @type {number} - L'identifiant du subtitle
     */
    id;
    /**
     * @type {string} - La langue du subtitle
     */
    language;
    /**
     * @type {string} - La source du subtitle
     */
    source;
    /**
     * @type {number} - La qualité du subtitle
     */
    quality;
    /**
     * @type {string} - Le nom du fichier du subtitle
     */
    file;
    /**
     * @type {string} - L'URL d'accès au subtitle
     */
    url;
    /**
     * @type {Date} - Date de mise en ligne
     */
    date;
    episode;
    show;
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
var SortTypeSubtitles;
(function (SortTypeSubtitles) {
    SortTypeSubtitles["LANGUAGE"] = "language";
    SortTypeSubtitles["SOURCE"] = "source";
    SortTypeSubtitles["QUALITY"] = "quality";
    SortTypeSubtitles["DATE"] = "date";
})(SortTypeSubtitles = SortTypeSubtitles || (SortTypeSubtitles = {}));
var SubtitleTypes;
(function (SubtitleTypes) {
    SubtitleTypes["EPISODE"] = "episode";
    SubtitleTypes["SEASON"] = "season";
    SubtitleTypes["SHOW"] = "show";
})(SubtitleTypes = SubtitleTypes || (SubtitleTypes = {}));
var SubtitleLanguages;
(function (SubtitleLanguages) {
    SubtitleLanguages["ALL"] = "all";
    SubtitleLanguages["VOVF"] = "vovf";
    SubtitleLanguages["VO"] = "vo";
    SubtitleLanguages["VF"] = "vf";
})(SubtitleLanguages = SubtitleLanguages || (SubtitleLanguages = {}));
class Subtitles {
    /**
     * @type {Array<Subtitle>} - Collection de subtitles
     */
    subtitles;
    /**
     * Récupère et retourne une collection de subtitles
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
        return Base.callApi(HTTP_VERBS.GET, 'subtitles', type, params)
            .then((data) => {
            return new Subtitles(data.subtitles);
        });
    }
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

class Season {
    /**
     * @type {number} Numéro de la saison dans la série
     */
    number;
    /**
     * @type {Array<Episode>} Tableau des épisodes de la saison
     */
    episodes;
    /**
     * Nombre d'épisodes dans la saison
     * @type {number}
     */
    nbEpisodes;
    /**
     * @type {boolean} Possède des sous-titres
     */
    has_subtitles;
    /**
     * @type {boolean} Saison pas vu
     */
    hidden;
    /**
     * @type {string} URL de l'image
     */
    _image;
    /**
     * @type {boolean} Saison vu
     */
    seen;
    /**
     * @type {Show} L'objet Show auquel est rattaché la saison
     */
    _show;
    /**
     * @type {JQuery<HTMLElement>} Le DOMElement jQuery correspondant à la saison
     */
    __elt;
    /**
     * Objet contenant les promesses en attente des méthodes fetchXXX
     * @type {Record<string, Promise<Season>>}
     */
    __fetches;
    /**
     * Constructeur de la classe Season
     * @param   {Obj}   data    Les données provenant de l'API
     * @param   {Show}  show    L'objet Show contenant la saison
     * @returns {Season}
     */
    constructor(data, show) {
        this.__fetches = {};
        this.number = parseInt(data.number, 10);
        this._show = show;
        this.episodes = [];
        this.has_subtitles = !!data.has_subtitles || false;
        this.hidden = !!data.hidden || false;
        this.seen = !!data.seen || false;
        this.image = data.image || null;
        // document.querySelector("#seasons > div > div.positionRelative > div > div:nth-child(2)")
        this.__elt = jQuery(`#seasons .slides_flex .slide_flex:nth-child(${this.number.toString()})`);
        if (data.episodes && data.episodes instanceof Array && data.episodes[0] instanceof Episode) {
            this.episodes = data.episodes;
        }
        else if (data.episodes && typeof data.episodes === 'number') {
            this.nbEpisodes = data.episodes;
        }
        return this._initRender();
    }
    /**
     * Initialise le rendu HTML de la saison
     * @returns {Seasons}
     */
    _initRender() {
        if (!this.__elt) {
            return this;
        }
        if (this.seen && jQuery('.checkSeen', this.__elt).length <= 0) {
            jQuery('.slide__image img', this.__elt).before('<div class="checkSeen"></div>');
        }
        else if (this.hidden && jQuery('.hideIcon', this.__elt).length <= 0) {
            jQuery('.slide__image img', this.__elt).before('<div class="hideIcon"></div>');
        }
    }
    /**
     * Retourne le nombre d'épisodes dans la saison
     * @returns {number}
     */
    get length() {
        return this.episodes.length;
    }
    /**
     * Setter pour l'attribut image
     * @param {string} src - L'URL d'accès à l'image
     */
    set image(src) {
        this._image = src;
        if (src) {
            const $imgs = jQuery('#seasons .slide_flex .slide__image img');
            if ($imgs.length >= this.number) {
                $($imgs.get(this.number - 1)).attr('src', src);
            }
        }
    }
    /**
     * Getter pour l'attribut image
     * @returns {string}
     */
    get image() {
        return this._image;
    }
    /**
     * Récupère les épisodes de la saison sur l'API
     * @returns {Promise<Season>}
     */
    fetchEpisodes() {
        if (!this.number || this.number <= 0) {
            throw new Error('season number incorrect');
        }
        if (this.__fetches.episodes)
            return this.__fetches.episodes;
        const self = this;
        const params = {
            id: self._show.id,
            season: self.number
        };
        this.__fetches.episodes = Base.callApi('GET', 'shows', 'episodes', params, true)
            .then((data) => {
            self.episodes = [];
            for (let e = 0; e < data.episodes.length; e++) {
                const selector = `#episodes .slides_flex .slide_flex:nth-child(${e + 1})`;
                self.episodes.push(new Episode(data.episodes[e], self, jQuery(selector)));
            }
            return self;
        })
            .finally(() => delete self.__fetches.episodes);
        return this.__fetches.episodes;
    }
    checkEpisodes() {
        if (!this.number || this.number <= 0) {
            throw new Error('season number incorrect');
        }
        if (this.__fetches.episodes)
            return this.__fetches.episodes;
        const self = this;
        const params = {
            id: self._show.id,
            season: self.number
        };
        this.__fetches.episodes = Base.callApi('GET', 'shows', 'episodes', params, true)
            .then((data) => {
            for (let e = 0; e < data.episodes.length; e++) {
                if (self.episodes.length <= e) {
                    const selector = `#episodes .slides_flex .slide_flex:nth-child(${e + 1})`;
                    self.episodes.push(new Episode(data.episodes[e], self, jQuery(selector)));
                }
                else {
                    self.episodes[e].fill(data.episodes[e]);
                }
            }
            return self;
        })
            .finally(() => delete self.__fetches.episodes);
        return this.__fetches.episodes;
    }
    /**
     * Cette méthode permet de passer tous les épisodes de la saison en statut **seen**
     * @returns {Promise<Season>}
     */
    watched() {
        const self = this;
        const params = { id: this.episodes[this.length - 1].id, bulk: true };
        return Base.callApi(HTTP_VERBS.POST, 'episodes', 'watched', params)
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
        return Base.callApi(HTTP_VERBS.POST, 'seasons', 'hide', params)
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
     * @param {Function} cb Function de callback
     * @returns {Season}
     */
    updateShow(cb = Base.noop) {
        this._show.update(true).then(cb);
        return this;
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
        if (Base.debug)
            console.log('Season updateRender', { lenEpisodes, lenSpecials, lenNotSpecials, lenSeen });
        /**
         * Met à jour la vignette de la saison courante
         * et change de saison, si il y en a une suivante
         */
        const seasonViewed = function () {
            // On check la saison
            self.__elt.find('.slide__image').prepend('<div class="checkSeen"></div>');
            if (Base.debug)
                console.log('Tous les épisodes de la saison ont été vus', self.__elt, self.__elt.next());
            // Si il y a une saison suivante, on la sélectionne
            if (self.__elt.next('.slide_flex').length > 0) {
                if (Base.debug)
                    console.log('Il y a une autre saison');
                self.__elt.removeClass('slide--current');
                self.__elt.next('.slide_flex').find('.slide__image').trigger('click');
            }
            self.__elt
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
            const $checkSeen = this.__elt.find('.checkSeen');
            if ($checkSeen.length > 0) {
                $checkSeen.remove();
                if (!self.__elt.hasClass('slide--notSeen')) {
                    self.__elt
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

class Episode extends Base {
    static selectorsCSS = {};
    static relatedProps = {
        // data: Obj => object: Show
        characters: { key: "characters", type: 'array', default: [] },
        code: { key: "code", type: 'string', default: '' },
        comments: { key: "nbComments", type: 'number', default: 0 },
        date: { key: "date", type: 'date', default: null },
        description: { key: "description", type: 'string', default: '' },
        episode: { key: "episode", type: 'number', default: 0 },
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
        return Base.callApi(HTTP_VERBS.GET, 'episodes', 'display', { id: epId })
            .then((data) => {
            return new Episode(data.episode, null, jQuery('.blockInformations'));
        });
    }
    /**
     * @type {Season} L'objet Season contenant l'épisode
     */
    _season;
    /**
     * @type {string} Le code de l'épisode SXXEXX
     */
    code;
    /**
     * @type {Date} La date de sortie de l'épisode
     */
    date;
    /**
     * @type {string}
     */
    director;
    /**
     * @type {number} Le numéro de l'épisode dans la saison
     */
    episode;
    /**
     * @type {number} Le numéro de l'épisode dans la série
     */
    global;
    /**
     * @type {number} Le numéro de la saison
     */
    numSeason;
    /**
     * @type {Array<Platform_link>} Les plateformes de diffusion
     */
    platform_links;
    /**
     * @type {ReleasesSvod}
     */
    releasesSvod;
    /**
     * @type {number} Nombre de membres de BS à avoir vu l'épisode
     */
    seen_total;
    /**
     * @type {boolean} Indique si il s'agit d'un épisode spécial
     */
    special;
    /**
     * @type {Array<Subtitle>} Tableau des sous-titres dispo sur BS
     */
    subtitles;
    /**
     * @type {number} Identifiant de l'épisode sur thetvdb.com
     */
    thetvdb_id;
    /**
     * @type {Array<WatchedBy>} Tableau des amis ayant vu l'épisode
     */
    watched_by;
    /**
     * @type {Array<string>} Tableau des scénaristes de l'épisode
     */
    writers;
    /**
     * @type {string} Identifiant de la vidéo sur Youtube
     */
    youtube_id;
    __fetches;
    /**
     * Constructeur de la classe Episode
     * @param   {Obj}       data    Les données provenant de l'API
     * @param   {Season}    season  L'objet Season contenant l'épisode
     * @returns {Episode}
     */
    constructor(data, season, elt) {
        super(data);
        this.__fetches = {};
        this._season = season;
        this.mediaType = { singular: MediaType.episode, plural: 'episodes', className: Episode };
        if (elt) {
            this.elt = elt;
        }
        return this.fill(data)._initRender();
    }
    _initRender() {
        if (!this.elt) {
            return this;
        }
        if (this._season) {
            this.initCheckSeen(this.episode - 1);
            this.addAttrTitle().addPopup();
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
        delete this.__changes.user;
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
        const $vignette = jQuery('.slide__image', this.elt);
        if ($vignette.length > 0) {
            const funcPlacement = (_tip, elt) => {
                //if (Base.debug) console.log('funcPlacement', tip, $(tip).width());
                const rect = elt.getBoundingClientRect(), width = $(window).width(), sizePopover = 320;
                return ((rect.left + rect.width + sizePopover) > width) ? 'left' : 'right';
            };
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
                                data-special="${this.special ? '1' : '0'}"
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
            $checkSeen.data('special', this.special ? '1' : '0');
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
                        yes: Base.trans('popup.yes'),
                        no: Base.trans('popup.no'),
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
            Base.callApi(method, 'episodes', 'watched', args)
                .then((data) => {
                if (Base.debug)
                    console.log('updateStatus %s episodes/watched', method, data);
                // Si un épisode est vu et que la série n'a pas été ajoutée
                // au compte du membre connecté
                if (!self._season.showInAccount() && data.episode.show.in_account) {
                    self._season.addShowToAccount();
                }
                // On met à jour l'objet Episode
                if (method === HTTP_VERBS.POST && response && pos) {
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
                    // .updateRender(status, true)
                    ._callListeners(EventTypes.UPDATE)
                    ._season
                    .updateRender()
                    .updateShow(() => {
                    // Si il reste des épisodes à voir, on scroll
                    const $notSeen = jQuery('#episodes .slide_flex.slide--notSeen');
                    if ($notSeen.length > 0) {
                        jQuery('#episodes .slides_flex').get(0).scrollLeft =
                            $notSeen.get(0).offsetLeft - 69;
                    }
                    self.toggleSpinner(false);
                });
            })
                .catch(err => {
                if (Base.debug)
                    console.error('updateStatus error %s', err);
                if (err && err == 'changeStatus') {
                    if (Base.debug)
                        console.log('updateStatus error %s changeStatus', method);
                    self.user.seen = (status === 'seen') ? true : false;
                    self.updateRender(status)
                        ._season
                        .updateRender()
                        .updateShow(() => {
                        self.toggleSpinner(false);
                    });
                }
                else {
                    self.toggleSpinner(false);
                    Base.notification('Erreur de modification d\'un épisode', 'updateStatus: ' + err);
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
        if (Base.debug)
            console.log('changeStatus', { elt: $elt, status: newStatus, update: update });
        if (newStatus === 'seen') {
            $elt.css('background', ''); // On ajoute le check dans la case à cocher
            $elt.addClass('seen'); // On ajoute la classe 'seen'
            $elt.attr('title', Base.trans("member_shows.remove"));
            // On supprime le voile masquant sur la vignette pour voir l'image de l'épisode
            $elt.parents('div.slide__image').first().find('img').removeAttr('style');
            $elt.parents('div.slide_flex').first().removeClass('slide--notSeen');
        }
        else if (newStatus === 'notSeen') {
            $elt.css('background', 'rgba(13,21,28,.2)'); // On enlève le check dans la case à cocher
            $elt.removeClass('seen'); // On supprime la classe 'seen'
            $elt.attr('title', Base.trans("member_shows.markas"));
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
            // if (Base.debug) console.log('toggleSpinner');
            if (Base.debug)
                console.groupEnd();
        }
        else {
            if (Base.debug)
                console.groupCollapsed('episode checkSeen');
            // if (Base.debug) console.log('toggleSpinner');
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
            return res(`${Base.api.url}/pictures/episodes?id=${this.id}`);
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
        this.__fetches.characters = Base.callApi(HTTP_VERBS.GET, 'episodes', 'characters', { id: this.id }, true)
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

class Similar extends Media {
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
        return Base.callApi('GET', this.mediaType.plural, action, { id: this.id }, force);
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
            $slideImg.prepend(`<img src="${Base.serverBaseUrl}/img/viewed.png" class="bandViewed"/>`);
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
            `<i class="fa fa-wrench popover-wrench"
                aria-hidden="true"
                style="margin-left:5px;cursor:pointer;"
                data-id="${self.id}"
                data-type="${self.mediaType.singular}">
            </i>`);
        $title.find('.popover-wrench').click((e) => {
            e.stopPropagation();
            e.preventDefault();
            //if (debug) console.log('Popover Wrench', eltId, self);
            this.fetch().then(function (data) {
                // eslint-disable-next-line no-undef
                dialog.setContent(renderjson.set_show_to_level(2)(data[self.mediaType.singular]));
                dialog.setCounter(Base.counter.toString());
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
    getContentPopup() {
        const self = this;
        //if (debug) console.log('similars tempContentPopup', objRes);
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
            const status = `<i class="fa fa-${this.status.toLowerCase() == 'ended' ? 'ban' : 'spinner'}" title="Statut ${this.status.toLowerCase() == 'ended' ? 'terminé' : 'en cours'}" aria-hidden="true"></i>`;
            const seen = (this.user.status > 0) ? 'Vu à <strong>' + this.user.status + '%</strong>' : 'Pas vu';
            template += `<p>
                <strong>${this.nbSeasons}</strong> saison${(this.nbSeasons > 1 ? 's' : '')},
                <strong>${this.nbEpisodes}</strong> <i class="fa fa-film" title="épisodes" aria-hidden="true"></i>, `;
            if (this.objNote.total > 0) {
                template += `<strong>${this.objNote.total}</strong> votes`;
                if (this.objNote.user > 0) {
                    template += `, votre note: ${this.objNote.user}`;
                }
            }
            else {
                template += 'Aucun vote';
            }
            template += `<span style="margin-left:5px;"><strong>${self.nbComments}</strong> <i class="fa fa-comment" title="commentaires" aria-hidden="true"></i></span>`;
            if (!this.in_account) {
                template += `<span style="margin-left:5px;">
                    <a href="javascript:;" class="addShow"><i class="fa fa-plus" title="Ajouter" aria-hidden="true"></i></a> -
                    <a href="javascript:;" class="toSeeShow" data-show-id="${self.id}"><i class="fa fa-clock-o" title="A voir" aria-hidden="true"></i></a>
                </span>`;
            }
            template += '</p>';
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
            template += `<span style="margin-left:5px;"><strong>${self.nbComments}</strong> <i class="fa fa-comment" title="commentaires" aria-hidden="true"></i></span>`;
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
        // if (Base.debug) console.log('getTitlePopup', this);
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
                    <i class="fa fa-refresh" aria-hidden="true"></i>
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
                const proxy = Base.serverBaseUrl + '/posters/';
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
            if (Base.themoviedb_api_user_key.length <= 0)
                return;
            const uriApiTmdb = `https://api.themoviedb.org/3/movie/${this.tmdb_id}?api_key=${Base.themoviedb_api_user_key}&language=fr-FR`;
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
        return Base.callApi(verb, this.mediaType.plural, this.mediaType.singular, params)
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
            Base.notification('Change State Similar', 'Erreur lors du changement de statut: ' + err.toString());
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

// eslint-disable-next-line no-unused-vars
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
        const objUpAuto = await Base.gm_funcs.getValue('objUpAuto', {});
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
        const objUpAuto = await Base.gm_funcs.getValue('objUpAuto', {});
        const obj = {
            status: this._status,
            auto: this._auto,
            interval: this._interval
        };
        objUpAuto[this._showId] = obj;
        Base.gm_funcs.setValue('objUpAuto', objUpAuto);
        this._exist = true;
        this.changeColorBtn();
        return this;
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
        this.stop();
        const objUpAuto = await Base.gm_funcs.getValue('objUpAuto', {});
        if (objUpAuto[this._showId] !== undefined) {
            delete objUpAuto[this._showId];
            Base.gm_funcs.setValue('objUpAuto', objUpAuto);
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
            if (Base.debug)
                console.log('close interval updateEpisodeListAuto');
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
                if (Base.debug)
                    console.log('close old interval timer');
                clearInterval(this._timer);
            }
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
        const now = new Date();
        this._lastUpdate = Date.now();
        if (Base.debug) {
            console.log('%s update episode list', `[${now.format('datetime')}]`);
        }
        jQuery('#episodes .updateEpisodes').trigger('click');
        if (!this.status) {
            this.status = true;
        }
        // if (Base.debug) console.log('UpdateAuto setInterval objShow', Object.assign({}, this));
        if (!this.auto || this.show.user.remaining <= 0) {
            if (Base.debug)
                console.log('Arrêt de la mise à jour auto des épisodes');
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

var DaysOfWeek;
(function (DaysOfWeek) {
    DaysOfWeek["monday"] = "lundi";
    DaysOfWeek["tuesday"] = "mardi";
    DaysOfWeek["wednesday"] = "mercredi";
    DaysOfWeek["thursday"] = "jeudi";
    DaysOfWeek["friday"] = "vendredi";
    DaysOfWeek["saturday"] = "samedi";
    DaysOfWeek["sunday"] = "dimanche";
})(DaysOfWeek || (DaysOfWeek = {}));
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
class Options {
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
    /**
     * Retourne les infos du membre connecté
     * @returns {Promise<Member>} Une instance du membre connecté
     */
    static fetch() {
        const params = {};
        if (Base.userId !== null) {
            params.id = Base.userId;
        }
        return Base.callApi(HTTP_VERBS.GET, 'members', 'infos', params)
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
     * @type {number} Identifiant du membre
     */
    id;
    /**
     * @type {number} Identifiant Facebook ?
     */
    fb_id;
    /**
     * @type {string} Login du membre
     */
    login;
    /**
     * @type {number} Points d'expérience
     */
    xp;
    /**
     * @type {string} Locale utiliser par le membre
     */
    locale;
    /**
     * @type {number} ?
     */
    cached;
    /**
     * @type {string} URL de l'avatar du membre
     */
    avatar;
    /**
     * @type {string} URL de la bannière du membre
     */
    profile_banner;
    /**
     * @type {boolean} ?
     */
    in_account;
    /**
     * @type {boolean} Membre Administrateur ?
     */
    is_admin;
    /**
     * @type {number} Année d'inscription
     */
    subscription;
    /**
     * @type {boolean} Indique si l'adresse mail a été validée
     */
    valid_email;
    /**
     * @type {Array<string>} ?
     */
    screeners;
    /**
     * @type {string} Login Twitter
     */
    twitterLogin;
    /**
     * @type {Stats} Les statistiques du membre
     */
    stats;
    /**
     * @type {Options} Les options de paramétrage du membre
     */
    options;
    /**
     * @type {NotificationList} Tableau des notifications du membre
     */
    notifications;
    /*
                    METHODS
     */
    /**
     * Constructeur de la classe Membre
     * @param data Les données provenant de l'API
     * @returns {Member}
     */
    constructor(data) {
        this.id = parseInt(data.id, 10);
        this.fb_id = parseInt(data.fb_id, 10);
        this.login = data.login;
        this.xp = parseInt(data.xp, 10);
        this.locale = data.locale;
        this.cached = parseInt(data.cached, 10);
        this.avatar = data.avatar;
        this.profile_banner = data.profile_banner;
        this.in_account = !!data.in_account;
        this.is_admin = !!data.is_admin;
        this.subscription = parseInt(data.subscription, 10);
        this.valid_email = !!data.valid_email;
        this.screeners = data.screeners;
        this.twitterLogin = data.twitterLogin;
        this.stats = new Stats(data.stats);
        this.options = new Options(data.options);
        this.checkNotifs();
    }
    checkNotifs() {
        /**
         * Fonction de traitement de récupération des notifications du membre
         * Alerte le membre de nouvelles notifications à l'aide d'un badge sur l'icone Bell dans le header
         */
        const fetchNotifs = () => {
            NotificationList.fetch(50).then(notifs => {
                this.notifications = notifs;
                const $badge = jQuery('#menuUnseenNotifications');
                if (notifs.new.length > 0) {
                    if ($badge.length <= 0) {
                        // Alerter le membre de nouvelles notifications
                        jQuery('.menu-wrapper .js-iconNotifications').append(`<i class="unread-count unread-notifications" id="menuUnseenNotifications">${notifs.new.length}</i>`);
                    }
                    else {
                        $badge.text(notifs.new.length);
                    }
                    jQuery('.menu-icon--bell').removeClass('has-notifications');
                }
                else if ($badge.length > 0) {
                    $badge.remove();
                }
            });
        };
        // On met à jour les notifications toutes les 5 minutes
        setInterval(fetchNotifs, 300000);
        fetchNotifs();
    }
    /**
     * renderNotifications - Affiche les notifications du membre
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
        { key: 'url', type: 'string', fn: null, default: '' },
        { key: 'title', type: 'string', fn: null, default: '' },
        { key: 'code', type: 'string', fn: null, default: '' },
        { key: 'show_title', type: 'string', fn: null, default: '' },
        { key: 'picture', type: 'string', fn: null, default: '' },
        { key: 'season', type: 'number', fn: parseInt, default: 0 },
        { key: 'name', type: 'string', fn: null, default: '' },
        { key: 'xp', type: 'number', fn: parseInt, default: 0 },
        { key: 'user', type: 'string', fn: null, default: '' },
        { key: 'user_id', type: 'number', fn: parseInt, default: 0 },
        { key: 'user_picture', type: 'string', fn: null, default: 'https://img.betaseries.com/5gtv-uQY0aSPqDtcyu7rhHLcu6Q=/40x40/smart/https%3A%2F%2Fwww.betaseries.com%2Fimages%2Fsite%2Flogo-64x64.png' },
        { key: 'type', type: 'string', fn: null, default: '' },
        { key: 'type_id', type: 'number', fn: parseInt, default: 0 }
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
        let prop, val;
        for (let p = 0; p < NotifPayload.props.length; p++) {
            prop = NotifPayload.props[p];
            val = NotifPayload.props[p].default;
            // eslint-disable-next-line no-prototype-builtins
            if (data && data.hasOwnProperty(prop.key)) {
                val = data[prop.key];
                if (prop.fn !== null) {
                    val = prop.fn(val, 10);
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
        return Base.callApi(HTTP_VERBS.GET, 'members', 'notifications', params)
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
    old;
    new;
    seen;
    constructor() {
        this.old = [];
        this.new = [];
        this.seen = false;
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
        const category = (notif.seen === null) ? 'new' : 'old';
        this[category].push(notif);
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
        }
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
    _offset;
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
            throw new Error("Value of parameter 'limit' is out of range (1-100)");
        }
        this._limit = limit;
    }
    get offset() {
        return this._offset;
    }
    set offset(offset) {
        if (offset <= 0 || offset > 100) {
            throw new Error("Value of parameter 'offset' is out of range (1-100)");
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
    static searchShows(params) {
        const result = {
            shows: [],
            total: 0,
            locale: 'fr',
            limit: params.limit,
            page: params.offset
        };
        return Base.callApi(HTTP_VERBS.GET, 'search', 'shows', params.toRequest())
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
        return Base.callApi(HTTP_VERBS.GET, 'search', 'movies', params.toRequest())
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
        Base.callApi('GET', this.mediaType.plural, 'similars', { id: this.id, details: true }, true)
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
