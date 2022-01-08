/*! betaseries_userscript - v1.1.6 - 2022-01-08
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
        this.actor = data.actor || '';
        this.picture = data.picture || '';
        this.name = data.name || '';
        this.guest = data.guest || false;
        this.id = (data.id !== undefined) ? parseInt(data.id, 10) : 0;
        this.description = data.description || null;
        this.role = data.role || '';
        this.show_id = (data.show_id !== undefined) ? parseInt(data.show_id, 10) : 0;
        this.movie_id = (data.movie_id !== undefined) ? parseInt(data.movie_id, 10) : 0;
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

/* interface JQuery<TElement = HTMLElement> extends Iterable<TElement> {
    popover?(params: any): this;
} */
var OrderComments;
(function (OrderComments) {
    OrderComments["DESC"] = "desc";
    OrderComments["ASC"] = "asc";
})(OrderComments = OrderComments || (OrderComments = {}));
;
var MediaStatusComments;
(function (MediaStatusComments) {
    MediaStatusComments["OPEN"] = "open";
    MediaStatusComments["CLOSED"] = "close";
})(MediaStatusComments = MediaStatusComments || (MediaStatusComments = {}));
;
class CommentsBS {
    /*************************************************/
    /*                  STATIC                       */
    /*************************************************/
    /**
     * Types d'évenements gérés par cette classe
     * @type {Array}
     */
    static EventTypes = new Array('update', 'save', 'add', 'delete');
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
        this.comments = new Array();
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
            this._listeners[EvtTypes[e]] = new Array();
        }
        return this;
    }
    /**
     * Permet d'ajouter un listener sur un type d'évenement
     * @param  {EventTypes} name - Le type d'évenement
     * @param  {Function}   fn   - La fonction à appeler
     * @return {Base} L'instance du média
     */
    addListener(name, fn) {
        // On vérifie que le type d'event est pris en charge
        if (this.constructor.EventTypes.indexOf(name) < 0) {
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
     * @param  {string}   name - Le type d'évenement
     * @param  {Function} fn   - La fonction qui était appelée
     * @return {Base} L'instance du média
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
     * @param  {EventTypes} name - Le type d'évenement
     * @return {Base} L'instance du média
     */
    _callListeners(name) {
        const event = new CustomEvent('betaseries', { detail: { name: name } });
        if (this._listeners[name] !== undefined && this._listeners[name].length > 0) {
            if (Base.debug)
                console.log('Comments call %d Listeners on event %s', this._listeners[name].length, name);
            for (let l = 0; l < this._listeners[name].length; l++) {
                this._listeners[name][l].call(this, event, this);
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
            let params = {
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
                        self.comments = new Array();
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
     * @param   {any} data - Les données du commentaire provenant de l'API
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
    async fetchReplies(commentId, order = OrderComments.DESC) {
        if (order !== this.order) {
            this.order = order;
        }
        const data = await Base.callApi(HTTP_VERBS.GET, 'comments', 'replies', { id: commentId, order: this.order });
        const replies = new Array();
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
                    template += CommentBS.getTemplateComment(comment, true);
                    // Si le commentaires à des réponses et qu'elles ne sont pas chargées
                    if (comment.nbReplies > 0 && comment.replies.length <= 0) {
                        // On récupère les réponses
                        if (Base.debug)
                            console.log('Comments render getTemplate fetchReplies');
                        comment.replies = await self.fetchReplies(comment.id);
                        // On ajoute un boutton pour afficher/masquer les réponses
                    }
                    for (let r = 0; r < comment.replies.length; r++) {
                        template += CommentBS.getTemplateComment(comment.replies[r], true);
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
     * Ajoute les évènements sur les commentaires lors du rendu
     * @param   {JQuery<HTMLElement>} $container - Le conteneur des éléments d'affichage
     * @param   {number} nbpp - Le nombre de commentaires à récupérer sur l'API
     * @param   {Obj} funcPopup - Objet des fonctions d'affichage/ de masquage de la popup
     * @returns {void}
     */
    loadEvents($container, nbpp, funcPopup) {
        // Tableau servant à contenir les events créer pour pouvoir les supprimer plus tard
        this._events = new Array();
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
                faceboxDisplay('inscription', {}, function () { });
                return;
            }
            const $btn = $(e.currentTarget);
            let params = { type: self._parent.mediaType.singular, id: self._parent.id };
            if ($btn.hasClass('active')) {
                Base.callApi(HTTP_VERBS.DELETE, 'comments', 'subscription', params)
                    .then((data) => {
                    self.is_subscribed = false;
                    displaySubscription($btn);
                });
            }
            else {
                Base.callApi(HTTP_VERBS.POST, 'comments', 'subscription', params)
                    .then((data) => {
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
                $(e.currentTarget).prev('span.comment-text').fadeIn();
                $(e.currentTarget).fadeOut();
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
                faceboxDisplay('inscription', {}, function () { });
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
                faceboxDisplay('inscription', {}, function () { });
                return;
            }
            const $textarea = $(e.currentTarget).siblings('textarea');
            if ($textarea.val().length > 0) {
                const action = $textarea.data('action');
                const msg = $textarea.val();
                let comment;
                if ($textarea.data('replyTo')) {
                    comment = self.getComment(parseInt($textarea.data('replyTo'), 10));
                    comment.sendReply($textarea.val());
                    $textarea.val('');
                    $textarea.siblings('button').attr('disabled', 'true');
                }
                else if (action && action === 'edit') {
                    const cmtId = parseInt($textarea.data('commentId'), 10);
                    const $comment = jQuery(e.currentTarget).parents('.writing').prev('.comments').find(`.comment[data-comment-id="${cmtId.toString()}"]`);
                    const comment = await getObjComment($comment);
                    comment.edit(msg).then((comment) => {
                        $comment.find('.comment-text').text(comment.text);
                    });
                }
                else {
                    CommentsBS.sendComment(self._parent, $textarea.val())
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
        $baliseSpoiler.click((e) => {
            const $textarea = $popup.find('textarea');
            if (/\[spoiler\]/.test($textarea.val())) {
                return;
            }
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
            const $btn = $(e.currentTarget);
            const state = $btn.data('toggle'); // 0: Etat masqué, 1: Etat affiché
            const $comment = $btn.parents('.comment');
            const inner = $comment.data('commentInner');
            const $replies = $comment.parents('.comments').find(`.comment[data-comment-reply="${inner}"]`);
            if (state == '0') {
                // On affiche
                $replies.fadeIn('fast');
                $btn.find('.btnText').text(Base.trans("comment.hide_answers"));
                $btn.find('svg').attr('style', 'transition: transform 200ms ease 0s; transform: rotate(180deg);');
                $btn.data('toggle', '1');
            }
            else {
                // On masque
                $replies.fadeOut('fast');
                $btn.find('.btnText').text(Base.trans("comment.button.reply", { "%count%": $replies.length.toString() }, $replies.length));
                $btn.find('svg').attr('style', 'transition: transform 200ms ease 0s;');
                $btn.data('toggle', '0');
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
                faceboxDisplay('inscription', {}, function () { });
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
                let template = '', comment, firstCmtId = self.comments[oldLastCmtIndex + 1].id;
                for (let c = oldLastCmtIndex + 1; c < self.comments.length; c++) {
                    comment = self.comments[c];
                    template += CommentBS.getTemplateComment(comment, true);
                    // Si le commentaires à des réponses et qu'elles ne sont pas chargées
                    if (comment.nbReplies > 0 && comment.replies.length <= 0) {
                        // On récupère les réponses
                        comment.replies = await self.fetchReplies(comment.id);
                        // On ajoute un boutton pour afficher/masquer les réponses
                    }
                    for (let r = 0; r < comment.replies.length; r++) {
                        template += CommentBS.getTemplateComment(comment.replies[r], true);
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
            let template = `
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
                $comment.remove();
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
        this._events = new Array();
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
        const headMsg = comment.text.substring(0, 275);
        let hideMsg = '';
        if (comment.text.length > 275)
            hideMsg = '<span class="u-colorWhiteOpacity05 u-show-fulltext positionRelative zIndex1"></span><span class="sr-only">' + comment.text.substring(275) + '</span>';
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
                                <img class="js-lazy-image u-opacityBackground js-lazy-image--handled fade-in" src="${avatar}" width="42" height="42" alt="avatar de ${comment.login}" />
                            </a>
                        </span>
                        <div class="media-body">
                            <div class="displayFlex alignItemsCenter">
                                ${comment.login}
                                <span class="stars">${Note.renderStars(comment.user_note, comment.user_id === Base.userId ? 'blue' : '')}</span>
                            </div>
                            <div>
                                <time class="u-colorWhiteOpacity05" style="font-size: 14px;">
                                    ${moment(comment.date).format('DD MMMM YYYY')}
                                </time>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
        jQuery('#comments .slides_flex').prepend(template);
        // On met à jour le nombre de commentaires
        jQuery('#comments .blockTitle').text(jQuery('#comments .blockTitle').text().replace(/\d+/, this.nbComments.toString()));
        this._callListeners(EventTypes.ADD);
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
            let notes = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
            const userIds = new Array();
            for (let c = 0; c < comments.length; c++) {
                // Pour éviter les doublons
                if (!userIds.includes(comments[c].user_id)) {
                    userIds.push(comments[c].user_id);
                    notes[comments[c].user_note]++;
                }
            }
            const buildline = function (index, notes) {
                const percent = (notes[index] * 100) / comments.length;
                return `<tr class="histogram-row">
                    <td class="nowrap">${index} étoile${index > 1 ? 's' : ''}</td>
                    <td class="span10">
                        <div class="meter" role="progressbar" aria-valuenow="${percent.toFixed(0)}%">
                            <div class="meter-filled" style="width: ${percent.toFixed(0)}%"></div>
                        </div>
                    </td>
                    <td class="nowrap">${percent.toFixed(0)}%</td>
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
                    <div class="size-base">${comments.length} évaluation${comments.length > 1 ? 's' : ''} parmis les commentaires</div>
                    <div class="size-base average">Note moyenne globale: ${self._parent.objNote.mean.toFixed(2)}</div>
                    <div><table><tbody>`;
            for (let i = 5; i > 0; i--) {
                template += buildline(i, notes);
            }
            return template + '</tbody></table></div>';
        });
    }
}

class CommentBS {
    /**
     * Contient le nom des classes CSS utilisées pour le rendu du commentaire
     * @type Obj
     */
    static classNamesCSS = { reply: 'it_i3', actions: 'it_i1', comment: 'it_ix' };
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
    constructor(data, parent) {
        this._parent = parent;
        return this.fill(data);
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
        this.replies = new Array();
        this.from_admin = data.from_admin;
        this.user_rank = data.user_rank;
        return this;
    }
    /**
     * Récupère les réponses du commentaire
     * @param   {OrderComments} order - Ordre de tri des réponses
     * @returns {Promise<CommentBS>}
     */
    async fetchReplies(order = OrderComments.DESC) {
        if (this.nbReplies <= 0)
            return this;
        const data = await Base.callApi(HTTP_VERBS.GET, 'comments', 'replies', { id: this.id, order: order });
        this.replies = new Array();
        if (data.comments) {
            for (let c = 0; c < data.comments.length; c++) {
                this.replies.push(new CommentBS(data.comments[c], this._parent));
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
        Base.callApi(HTTP_VERBS.DELETE, 'comments', 'comment', { id: this.id })
            .then((data) => {
            if (self._parent instanceof CommentsBS) {
                self._parent.removeComment(self.id);
            }
            else if (self._parent instanceof CommentBS) {
                self._parent.removeReply(self.id);
            }
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
    static getTemplateComment(comment, all = false) {
        const text = new Option(comment.text).innerHTML;
        const spoiler = /\[spoiler\]/.test(text);
        let btnSpoiler = spoiler ? `<button type="button" class="btn-reset mainLink view-spoiler" style="vertical-align: 0px;">${Base.trans("comment.button.display_spoiler")}</button>` : '';
        // let classNames = {reply: 'iv_i5', actions: 'iv_i3', comment: 'iv_iz'};
        let classNames = { reply: 'it_i3', actions: 'it_i1', comment: 'it_ix' };
        let className = (comment.in_reply_to > 0) ? classNames.reply + ' reply' : '';
        let btnToggleReplies = comment.nbReplies > 0 ? `
            <button type="button" class="btn-reset mainLink mainLink--regular toggleReplies" style="margin-top: 2px; margin-bottom: -3px;" data-toggle="1">
                <span class="svgContainer" style="display: inline-flex; height: 16px; width: 16px;">
                    <svg width="8" height="6" xmlns="http://www.w3.org/2000/svg" style="transition: transform 200ms ease 0s; transform: rotate(180deg);">
                        <path d="M4 5.667l4-4-.94-.94L4 3.78.94.727l-.94.94z" fill="#54709D" fill-rule="nonzero"></path>
                    </svg>
                </span>&nbsp;<span class="btnText">${Base.trans("comment.hide_answers")}</span>
            </button>` : '';
        let templateOptions = `
            <a href="/messages/nouveau?login=${comment.login}" class="mainLink">Envoyer un message</a>
            <span class="mainLink">&nbsp;∙&nbsp;</span>
            <button type="button" class="btn-reset mainLink btnSignal" style="vertical-align: 0px;">Signaler</button>
        `;
        if (comment.user_id === Base.userId) {
            templateOptions = `
                <button type="button" class="btn-reset mainLink btnEditComment">Éditer</button>
                <span class="mainLink">&nbsp;∙&nbsp;</span>
                <button type="button" class="btn-reset mainLink btnDeleteComment">Supprimer</button>
            `;
        }
        return `
            <div class="comment ${className} positionRelative ${CommentBS.classNamesCSS.comment}" data-comment-id="${comment.id}" ${comment.in_reply_to > 0 ? 'data-comment-reply="' + comment.in_reply_to + '"' : ''} data-comment-inner="${comment.inner_id}">
                <div class="media">
                    <div class="media-left">
                        <a href="/membre/${comment.login}" class="avatar">
                            <img src="https://api.betaseries.com/pictures/members?key=${Base.userKey}&amp;id=${comment.user_id}&amp;width=64&amp;height=64&amp;placeholder=png" width="32" height="32" alt="Profil de ${comment.login}">
                        </a>
                    </div>
                    <div class="media-body">
                        <a href="/membre/${comment.login}">
                            <span class="mainLink">${comment.login}</span>&nbsp;
                            <span class="mainLink mainLink--regular">&nbsp;</span>
                        </a>
                        <span style="${spoiler ? 'display:none;' : ''}" class="comment-text">${text}</span>
                        ${btnSpoiler}
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
                                <strong class="mainLink thumbs" style="margin-left: 5px;">${comment.thumbs > 0 ? '+' + comment.thumbs : (comment.thumbs < 0) ? '-' + comment.thumbs : comment.thumbs}</strong>
                                <span class="mainLink">&nbsp;∙&nbsp;</span>
                                <button type="button" class="btn-reset mainLink mainLink--regular btnResponse" style="vertical-align: 0px;${!Base.userIdentified() ? 'display:none;' : ''}">${Base.trans("timeline.comment.reply")}</button>
                                <a href="#c_1269819" class="mainTime">
                                    <span class="mainLink">&nbsp;∙&nbsp;</span>
                                    Le ${ /* eslint-disable-line no-undef */typeof moment !== 'undefined' ? moment(comment.date).format('DD/MM/YYYY HH:mm') : comment.date.toString()}
                                </a>
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
                                <button type="button" class="btn-reset btnToggleOptions" style="margin-left: 4px;">
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
     * @returns {string}
     */
    static getTemplateWriting() {
        const login = Base.userIdentified() ? currentLogin : '';
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
                            <textarea rows="2" placeholder="${Base.trans("timeline.comment.write")}" class="form-control"></textarea>
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
        this._events = new Array();
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
                faceboxDisplay('inscription', {}, function () { });
                return;
            }
            const $btn = $(e.currentTarget);
            let params = { type: self.getCollectionComments().media.mediaType.singular, id: self.getCollectionComments().media.id };
            if ($btn.hasClass('active')) {
                Base.callApi(HTTP_VERBS.DELETE, 'comments', 'subscription', params)
                    .then((data) => {
                    self.getCollectionComments().is_subscribed = false;
                    displaySubscription($btn);
                });
            }
            else {
                Base.callApi(HTTP_VERBS.POST, 'comments', 'subscription', params)
                    .then((data) => {
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
                $(e.currentTarget).prev('span.comment-text').fadeIn();
                $(e.currentTarget).fadeOut();
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
                faceboxDisplay('inscription', {}, function () { });
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
                faceboxDisplay('inscription', {}, function () { });
                return;
            }
            const $textarea = $(e.currentTarget).siblings('textarea');
            if ($textarea.val().length > 0) {
                const replyId = parseInt($textarea.data('replyTo'), 10);
                const action = $textarea.data('action');
                const cmtId = parseInt($textarea.data('commentId'), 10);
                const msg = $textarea.val();
                if (replyId && replyId == self.id) {
                    self.sendReply(msg).then(comment => {
                        if (comment) {
                            let template = CommentBS.getTemplateComment(comment);
                            $container.find('.comments').append(template);
                        }
                    });
                }
                else if (replyId) {
                    const reply = await self.getReply(replyId);
                    if (reply) {
                        reply.sendReply(msg).then(comment => {
                            if (comment) {
                                let template = CommentBS.getTemplateComment(comment);
                                $container.find(`.comments .comment[data-comment-id="${reply.id}"]`)
                                    .after(template);
                            }
                        });
                    }
                    else {
                        // Allo Houston, on a un problème
                    }
                }
                else if (action === 'edit') {
                    self.edit(msg);
                    const $parent = $(e.currentTarget).parents('.writing').siblings('.comments').children('.comment');
                    $parent.find('.comment-text').text(self.text);
                }
                else {
                    CommentsBS.sendComment(self.getCollectionComments().media, msg).then((comment) => {
                        self.getCollectionComments().addToPage(comment.id);
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
        $baliseSpoiler.click((e) => {
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
                $replies.fadeIn('fast');
                $btn.find('.btnText').text(Base.trans("comment.hide_answers"));
                $btn.find('svg').attr('style', 'transition: transform 200ms ease 0s; transform: rotate(180deg);');
                $btn.data('toggle', '1');
            }
            else {
                // On masque
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
                faceboxDisplay('inscription', {}, function () { });
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
            let template = `
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
            const replies = await this.getCollectionComments().fetchReplies(this.id);
            if (replies && replies.length > 0) {
                this.replies = replies;
            }
        }
        for (let r = this.replies.length - 1; r >= 0; r--) {
            template += CommentBS.getTemplateComment(this.replies[r]);
        }
        template += '</div>';
        if (this.getCollectionComments().isOpen() && Base.userIdentified()) {
            template += CommentBS.getTemplateWriting();
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
            $title.append(Base.trans("blog.title.comments") + ' <i class="fa fa-chevron-circle-left prev-comment" aria-hidden="true"></i> <i class="fa fa-chevron-circle-right next-comment" aria-hidden="true"></i>');
            // On ajoute les templates HTML du commentaire,
            // des réponses et du formulaire de d'écriture
            $contentReact.append(template);
            $contentReact.fadeIn();
            // On active les boutons de l'affichage du commentaire
            self.loadEvents($contentReact, { hidePopup, showPopup });
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
    total;
    mean;
    user;
    _parent;
    constructor(data, parent) {
        this.total = parseInt(data.total, 10);
        this.mean = parseFloat(data.mean);
        this.user = parseInt(data.user, 10);
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
        const _this = this, $popup = jQuery('#popin-dialog'), $contentHtmlElement = $popup.find(".popin-content-html"), $contentReact = $popup.find('.popin-content-reactmodule'), $title = $contentHtmlElement.find(".title"), $text = $popup.find("p"), $closeButtons = $popup.find(".js-close-popupalert"), hidePopup = () => {
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
        $text.find('.star-svg').mouseenter((e) => {
            const note = parseInt($(e.currentTarget).data('number'), 10);
            updateStars(e, note);
        });
        $text.find('.star-svg').mouseleave((e) => {
            updateStars(e, _this.user);
        });
        $text.find('.star-svg').click((e) => {
            const note = parseInt(jQuery(e.currentTarget).data('number'), 10), $stars = jQuery(e.currentTarget).parent().find('.star-svg');
            // On supprime les events
            $stars.off('mouseenter').off('mouseleave');
            _this._parent.addVote(note)
                .then((result) => {
                hidePopup();
                if (result) {
                    // TODO: Mettre à jour la note du média
                    _this._parent.changeTitleNote(true);
                    if (cb)
                        cb.call(_this);
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
     * Met à jour l'affichage de la note
     */
    updateStars(elt = null) {
        elt = elt || jQuery('.blockInformations__metadatas .js-render-stars');
        const $stars = elt.find('.star-svg use');
        let className;
        for (let s = 0; s < 5; s++) {
            className = (this.mean <= s) ? StarTypes.EMPTY : (this.mean < s + 1) ? StarTypes.HALF : StarTypes.FULL;
            $($stars.get(s)).attr('xlink:href', `#icon-star-${className}`);
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
        Array.from({
            length: 5
        }, (_index, number) => {
            typeSvg = note <= number ? 'empty' : (note < number + 1) ? 'half' : 'full';
            template += `
                <svg viewBox="0 0 100 100" class="star-svg">
                    <use xmlns:xlink="http://www.w3.org/1999/xlink"
                        xlink:href="#icon-star${color}-${typeSvg}">
                    </use>
                </svg>
            `;
        });
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
        this.id = (data.id !== undefined) ? parseInt(data.id, 10) : NaN;
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
        this.archived = !!data.archived || false;
        this.downloaded = !!data.downloaded || false;
        this.favorited = !!data.favorited || false;
        this.friends_want_to_watch = data.friends_want_to_watch || [];
        this.friends_watched = data.friends_watched || [];
        this.hidden = !!data.hidden || false;
        this.last = data.last || '';
        this.mail = !!data.mail || false;
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
}

function ExceptionIdentification(message) {
    this.message = message;
    this.name = "ExceptionIdentification";
}
var MediaType;
(function (MediaType) {
    MediaType["show"] = "show";
    MediaType["movie"] = "movie";
    MediaType["episode"] = "episode";
})(MediaType = MediaType || (MediaType = {}));
;
var EventTypes;
(function (EventTypes) {
    EventTypes["UPDATE"] = "update";
    EventTypes["SAVE"] = "save";
    EventTypes["ADD"] = "add";
    EventTypes["REMOVE"] = "remove";
    EventTypes["NOTE"] = "note";
    EventTypes["ARCHIVE"] = "archive";
    EventTypes["UNARCHIVE"] = "unarchive";
})(EventTypes = EventTypes || (EventTypes = {}));
;
var HTTP_VERBS;
(function (HTTP_VERBS) {
    HTTP_VERBS["GET"] = "GET";
    HTTP_VERBS["POST"] = "POST";
    HTTP_VERBS["PUT"] = "PUT";
    HTTP_VERBS["DELETE"] = "DELETE";
    HTTP_VERBS["OPTIONS"] = "OPTIONS";
})(HTTP_VERBS = HTTP_VERBS || (HTTP_VERBS = {}));
;
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
     * @type {Obj}
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
        },
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
     * Indique le theme d'affichage du site Web (light or dark)
     * @type {string}
     */
    static theme = 'light';
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
     * @param   {String}  msg  - Identifiant de la chaîne à traduire
     * @param   {Obj}     [params={}] - Variables utilisées dans la traduction {"%key%"": value}
     * @param   {number}  [count=1] - Nombre d'éléments pour la version plural
     * @returns {string}
     */
    // eslint-disable-next-line no-unused-vars
    static trans = function (msg, params = {}, count = 1) { };
    /**
     * Contient les infos sur les différentes classification TV et cinéma
     * @type {Ratings}
     */
    static ratings = null;
    /**
     * Types d'évenements gérés par cette classe
     * @type {Array}
     */
    static EventTypes = new Array(EventTypes.UPDATE, EventTypes.SAVE, EventTypes.NOTE);
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
     * @param  {String}   type - Type de methode d'appel Ajax (GET, POST, PUT, DELETE)
     * @param  {String}   resource - La ressource de l'API (ex: shows, seasons, episodes...)
     * @param  {String}   action - L'action à appliquer sur la ressource (ex: search, list...)
     * @param  {Obj}      args - Un objet (clef, valeur) à transmettre dans la requête
     * @param  {bool}     [force=false] - Indique si on doit utiliser le cache ou non (Par défaut: false)
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
    nbComments;
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
        this._initListeners();
        return this;
    }
    /**
     * Remplit l'objet avec les données fournit en paramètre
     * @param  {Obj} data - Les données provenant de l'API
     * @returns {Base}
     * @virtual
     */
    fill(data) {
        this.id = parseInt(data.id, 10);
        this.characters = [];
        if (data.characters && data.characters instanceof Array) {
            for (let c = 0; c < data.characters.length; c++) {
                this.characters.push(new Character(data.characters[c]));
            }
        }
        this.nbComments = data.comments ? parseInt(data.comments, 10) : 0;
        this.comments = new CommentsBS(this.nbComments, this);
        this.objNote = (data.note) ? new Note(data.note, this) : new Note(data.notes, this);
        this.resource_url = data.resource_url;
        this.title = data.title;
        this.user = new User(data.user);
        this.description = data.description;
        return this;
    }
    /**
     * Initialize le tableau des écouteurs d'évènements
     * @returns {Base}
     * @sealed
     */
    _initListeners() {
        this._listeners = {};
        const EvtTypes = this.constructor.EventTypes;
        for (let e = 0; e < EvtTypes.length; e++) {
            this._listeners[EvtTypes[e]] = new Array();
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
    addListener(name, fn) {
        // On vérifie que le type d'event est pris en charge
        if (this.constructor.EventTypes.indexOf(name) < 0) {
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
     * @param  {string}   name - Le type d'évenement
     * @param  {Function} fn   - La fonction qui était appelée
     * @return {Base} L'instance du média
     * @sealed
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
     * @param  {EventTypes} name - Le type d'évenement
     * @return {Base} L'instance du média
     * @sealed
     */
    _callListeners(name) {
        const event = new CustomEvent('betaseries', { detail: { name: name } });
        if (this._listeners[name] !== undefined && this._listeners[name].length > 0) {
            if (Base.debug)
                console.log('Base call %d Listeners on event %s', this._listeners[name].length, name);
            for (let l = 0; l < this._listeners[name].length; l++) {
                this._listeners[name][l].call(this, event, this);
            }
        }
        return this;
    }
    init() { }
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
     * Retourne le DOMElement correspondant au média
     * @returns {JQuery} Le DOMElement jQuery
     */
    get elt() {
        return this._elt;
    }
    /**
     * Définit le DOMElement de référence pour ce média
     * @param  {JQuery} elt - DOMElement auquel est rattaché le média
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
     * Décode le titre de la page
     * @return {Base} L'instance du média
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
     * @param  {Boolean} [change=true] - Indique si on doit changer l'attribut title du DOMElement
     * @return {String} Le titre modifié de la note
     */
    changeTitleNote(change = true) {
        const $elt = this.elt.find('.js-render-stars');
        if (this.objNote.mean <= 0 || this.objNote.total <= 0) {
            if (change)
                $elt.attr('title', 'Aucun vote');
            return;
        }
        let title = this.objNote.toString();
        if (change) {
            $elt.attr('title', title);
        }
        return title;
    }
    /**
     * Ajoute le nombre de votes à la note de la ressource
     * @return {Base} L'instance du média
     */
    addNumberVoters() {
        const _this = this;
        const votes = $('.stars.js-render-stars'); // ElementHTML ayant pour attribut le titre avec la note de la série
        let title = this.changeTitleNote(true);
        // if (Base.debug) console.log('addNumberVoters - title: %s', title);
        // On ajoute un observer sur l'attribut title de la note, en cas de changement lors d'un vote
        new MutationObserver((mutationsList) => {
            const changeTitleMutation = () => {
                // On met à jour le nombre de votants, ainsi que la note du membre connecté
                const upTitle = _this.changeTitleNote(false);
                // if (Base.debug) console.log('Observer upTitle: %s', upTitle);
                // On évite une boucle infinie
                if (upTitle !== title) {
                    votes.attr('title', upTitle);
                    title = upTitle;
                }
            };
            let mutation;
            for (mutation of mutationsList) {
                // On vérifie si le titre a été modifié
                // @TODO: A tester
                if (!/vote/.test(mutation.target.nodeValue) && mutation.target.nodeValue != title) {
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
    /**
     * Ajoute une note au média
     * @param   {number} note - Note du membre connecté pour le média
     * @returns {Promise<boolean>}
     */
    addVote(note) {
        const _this = this;
        return new Promise((resolve, reject) => {
            Base.callApi(HTTP_VERBS.POST, this.mediaType.plural, 'note', { id: this.id, note: note })
                .then((data) => {
                _this.fill(data[this.mediaType.singular])._callListeners(EventTypes.NOTE);
                resolve(true);
            })
                .catch(err => {
                Base.notification('Erreur de vote', 'Une erreur s\'est produite lors de l\'envoi de la note: ' + err);
                reject(err);
            });
        });
    }
}

class Media extends Base {
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
    length;
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
    _in_account;
    /**
     * @type {string} slug - Identifiant du média servant pour l'URL
     */
    slug;
    /**
     * Constructeur de la classe Media
     * @param   {Obj} data - Les données du média
     * @param   {JQuery<HTMLElement>} [element] - Le DOMElement associé au média
     * @returns {Media}
     */
    constructor(data, element) {
        super(data);
        if (element)
            this.elt = element;
        return this;
    }
    /**
     * Remplit l'objet avec les données fournit en paramètre
     * @param  {Obj} data Les données provenant de l'API
     * @returns {Media}
     * @override
     */
    fill(data) {
        this.followers = parseInt(data.followers, 10);
        this.imdb_id = data.imdb_id;
        this.language = data.language;
        this.length = parseInt(data.length, 10);
        this.original_title = data.original_title;
        if (!this.similars || this.similars.length <= 0) {
            this.similars = new Array();
        }
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
        this.in_account = !!data.in_account;
        this.slug = data.slug;
        super.fill(data);
        return this;
    }
    /**
     * Indique si le média est enregistré sur le compte du membre
     * @returns {boolean}
     */
    get in_account() {
        return this._in_account;
    }
    /**
     * Définit si le média est enregistré sur le compte du membre
     * @param {boolean} i Flag
     */
    set in_account(i) {
        this._in_account = !!i;
        this.save();
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
var Picked;
(function (Picked) {
    Picked[Picked["none"] = 0] = "none";
    Picked[Picked["banner"] = 1] = "banner";
    Picked[Picked["show"] = 2] = "show";
})(Picked = Picked || (Picked = {}));
// eslint-disable-next-line no-unused-vars
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
        this.id = data.id ? parseInt(data.id, 10) : null;
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
     * Types d'évenements gérés par cette classe
     * @type {Array}
     */
    static EventTypes = new Array(EventTypes.UPDATE, EventTypes.SAVE, EventTypes.ADD, EventTypes.REMOVE, EventTypes.NOTE, EventTypes.ARCHIVE, EventTypes.UNARCHIVE);
    /**
     * Méthode static servant à récupérer une série sur l'API BS
     * @param  {Obj} params - Critères de recherche de la série
     * @param  {boolean} [force=false] - Indique si on utilise le cache ou non
     * @return {Promise<Show>}
     * @private
     */
    static _fetch(params, force = false) {
        return new Promise((resolve, reject) => {
            Base.callApi('GET', 'shows', 'display', params, force)
                .then(data => resolve(new Show(data.show, jQuery('.blockInformations'))))
                .catch(err => reject(err));
        });
    }
    /**
     * Méthode static servant à récupérer plusieurs séries sur l'API BS
     * @param  {Array<number>} ids - Les identifiants des séries recherchées
     * @return {Promise<Array<Show>>}
     */
    static fetchMulti(ids) {
        return new Promise((resolve, reject) => {
            Base.callApi(HTTP_VERBS.GET, 'shows', 'display', { id: ids.join(',') })
                .then((data) => {
                const shows = Array();
                if (ids.length > 1) {
                    for (let s = 0; s < data.shows.length; s++) {
                        shows.push(new Show(data.shows[s], jQuery('.blockInformations')));
                    }
                }
                else {
                    shows.push(new Show(data.show, jQuery('.blockInformations')));
                }
                resolve(shows);
            })
                .catch(err => reject(err));
        });
    }
    /**
     * Methode static servant à récupérer une série par son identifiant BS
     * @param  {number} id - L'identifiant de la série
     * @param  {boolean} [force=false] - Indique si on utilise le cache ou non
     * @return {Promise<Show>}
     */
    static fetch(id, force = false) {
        return this._fetch({ id: id }, force);
    }
    /**
     * Methode static servant à récupérer une série par son identifiant TheTVDB
     * @param  {number} id - L'identifiant TheTVDB de la série
     * @param  {boolean} [force=false] - Indique si on utilise le cache ou non
     * @return {Promise<Show>}
     */
    static fetchByTvdb(id, force = false) {
        return this._fetch({ thetvdb_id: id }, force);
    }
    /**
     * Méthode static servant à récupérer une série par son identifiant URL
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
     * @type {Season} Pointeur vers la saison courante
     */
    currentSeason;
    /**
     * @type {Images} Contient les URLs d'accès aux images de la série
     */
    images;
    /**
     * @type {number} Nombre total d'épisodes dans la série
     */
    nbEpisodes;
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
        return this.fill(data);
    }
    /**
     * Initialise l'objet lors de sa construction et après son remplissage
     * @returns {Show}
     */
    init() {
        // On gère l'ajout et la suppression de la série dans le compte utilisateur
        if (this.in_account) {
            this.deleteShowClick();
        }
        else {
            this.addShowClick();
        }
        return this;
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
        const _this = this;
        return new Promise((resolve, reject) => {
            Media.callApi('POST', 'shows', 'archive', { id: _this.id })
                .then(data => {
                _this.fill(data.show);
                _this.save();
                _this._callListeners(EventTypes.ARCHIVE);
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
                _this._callListeners(EventTypes.UNARCHIVE);
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
        const self = this;
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
        if (this.user.remaining === 0 && this.in_account) {
            let promise = new Promise(resolve => { return resolve(void 0); });
            // On propose d'archiver si la série n'est plus en production
            if (this.in_account && this.isEnded() && !this.isArchived()) {
                if (Base.debug)
                    console.log('Série terminée, popup confirmation archivage');
                promise = new Promise(resolve => {
                    // eslint-disable-next-line no-undef
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
                            if (retourCallback)
                                self.objNote.createPopupForVote();
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
        if ($nextEpisode.length > 0 && this.user.next && !isNaN(this.user.next.id)) {
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
        const self = this;
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
                    changeBtnAdd(self);
                    // On met à jour le bloc du prochain épisode à voir
                    self.updateNextEpisode(function () {
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
                self.addNumberVoters();
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
                        _this.user.next.id = NaN;
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
                        });
                        // On doit supprimer le bouton pour noter le média
                        const $stars = jQuery('.blockInformations__metadatas .js-render-stars');
                        $stars.parent().replaceWith(`
                        <span class="stars js-render-stars">
                        ${$stars.html()}
                        </span>`);
                        _this.elt = $('.blockInformations');
                        _this.addNumberVoters();
                        _this.addShowClick();
                    };
                    // eslint-disable-next-line no-undef
                    new PopupAlert({
                        title: Base.trans("popup.delete_show_success.title"),
                        text: Base.trans("popup.delete_show_success.text", { "%title%": _this.title }),
                        yes: Base.trans("popup.delete_show_success.yes"),
                        callback_yes: afterNotif
                    });
                };
                // Supprimer la série du compte utilisateur
                // eslint-disable-next-line no-undef
                new PopupAlert({
                    title: Base.trans("popup.delete_show.title", { "%title%": _this.title }),
                    text: Base.trans("popup.delete_show.text", { "%title%": _this.title }),
                    callback_yes: function () {
                        if (Base.debug)
                            console.groupCollapsed('delete show');
                        _this.removeFromAccount()
                            .then(() => done(), err => {
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
     * @param   {number} seasonNumber Le numéro de la saison courante (commence à 1)
     * @returns {Show}  L'instance de la série
     * @throws  {Error} if seasonNumber is out of range of seasons
     */
    setCurrentSeason(seasonNumber) {
        if (seasonNumber <= 0 || seasonNumber > this.seasons.length) {
            throw new Error("seasonNumber is out of range of seasons");
        }
        this.currentSeason = this.seasons[seasonNumber - 1];
        return this;
    }
}

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
                .then(data => resolve(new Movie(data.movie, jQuery('.blockInformations'))))
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
        super(data, element);
        return this.fill(data);
    }
    /**
     * Remplit l'objet avec les données fournit en paramètre
     * @param  {any} data Les données provenant de l'API
     * @returns {Movie}
     * @override
     */
    fill(data) {
        if (data.user.in_account !== undefined) {
            data.in_account = data.user.in_account;
            delete data.user.in_account;
        }
        data.description = data.synopsis;
        delete data.synopsis;
        data.slug = data.url;
        delete data.url;
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
        this.mediaType = { singular: MediaType.movie, plural: 'movies', className: Movie };
        super.fill(data);
        return this.save();
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
        const _this = this;
        if (!Base.userIdentified() || this.user.status === state) {
            if (Base.debug)
                console.info('User not identified or state is equal with user status');
            return Promise.resolve(this);
        }
        return Base.callApi(HTTP_VERBS.POST, this.mediaType.plural, 'movie', { id: this.id, state: state })
            .then((data) => {
            _this.fill(data.movie);
            return this;
        })
            .catch(err => {
            console.warn("Erreur ajout film sur compte", err);
            Base.notification('Ajout du film', "Erreur lors de l'ajout du film sur votre compte");
            return this;
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
;
var SubtitleTypes;
(function (SubtitleTypes) {
    SubtitleTypes["EPISODE"] = "episode";
    SubtitleTypes["SEASON"] = "season";
    SubtitleTypes["SHOW"] = "show";
})(SubtitleTypes = SubtitleTypes || (SubtitleTypes = {}));
;
var SubtitleLanguages;
(function (SubtitleLanguages) {
    SubtitleLanguages["ALL"] = "all";
    SubtitleLanguages["VOVF"] = "vovf";
    SubtitleLanguages["VO"] = "vo";
    SubtitleLanguages["VF"] = "vf";
})(SubtitleLanguages = SubtitleLanguages || (SubtitleLanguages = {}));
;
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
        this.subtitles = new Array();
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
     * @type {Show} L'objet Show auquel est rattaché la saison
     */
    _show;
    /**
     * @type {JQuery<HTMLElement>} Le DOMElement jQuery correspondant à la saison
     */
    _elt;
    /**
     * Constructeur de la classe Season
     * @param   {Obj}   data    Les données provenant de l'API
     * @param   {Show}  show    L'objet Show contenant la saison
     * @returns {Season}
     */
    constructor(data, show) {
        this.number = parseInt(data.number, 10);
        this._show = show;
        // document.querySelector("#seasons > div > div.positionRelative > div > div:nth-child(2)")
        this._elt = jQuery(`#seasons .slides_flex .slide_flex:nth-child(${this.number.toString()})`);
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
                    _this.episodes.push(new Episode(data.episodes[e], _this));
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
            self._elt.find('.slide__image').prepend('<div class="checkSeen"></div>');
            self._elt
                .removeClass('slide--notSeen')
                .addClass('slide--seen');
            if (Base.debug)
                console.log('Tous les épisodes de la saison ont été vus');
            // Si il y a une saison suivante, on la sélectionne
            if (self._elt.next().length > 0) {
                if (Base.debug)
                    console.log('Il y a une autre saison');
                self.changeCurrentSeason(self.number + 1);
                self._elt.removeClass('slide--current');
                self._elt.next().trigger('click');
            }
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
            const $checkSeen = this._elt.find('.checkSeen');
            if ($checkSeen.length > 0) {
                $checkSeen.remove();
                if (!self._elt.hasClass('slide--notSeen')) {
                    self._elt
                        .addClass('slide--notSeen')
                        .removeClass('slide--seen');
                }
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
}

class Episode extends Base {
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
    /**
     * Constructeur de la classe Episode
     * @param   {Obj}       data    Les données provenant de l'API
     * @param   {Season}    season  L'objet Season contenant l'épisode
     * @returns {Episode}
     */
    constructor(data, season) {
        super(data);
        this._season = season;
        return this.fill(data);
    }
    /**
     * Remplit l'objet avec les données fournit en paramètre
     * @param  {any} data Les données provenant de l'API
     * @returns {Episode}
     * @override
     */
    fill(data) {
        this.code = data.code;
        this.date = new Date(data.date);
        this.director = data.director;
        this.episode = parseInt(data.episode, 10);
        this.global = parseInt(data.global, 10);
        this.numSeason = parseInt(data.season, 10);
        this.platform_links = data.platform_links;
        this.releasesSvod = data.releasesSvod;
        this.seen_total = (data.seen_total !== null) ? parseInt(data.seen_total, 10) : 0;
        this.special = data.special === 1 ? true : false;
        this.subtitles = new Subtitles(data.subtitles || []);
        this.thetvdb_id = parseInt(data.thetvdb_id, 10);
        this.watched_by = data.watched_by;
        this.writers = data.writers;
        this.youtube_id = data.youtube_id;
        this.mediaType = { singular: MediaType.episode, plural: 'episodes', className: Episode };
        super.fill(data);
        return this.save();
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
        const _this = this;
        const pos = this.elt.find('.checkSeen').data('pos');
        let promise = new Promise(resolve => { resolve(false); });
        let args = { id: this.id, bulk: true };
        this.toggleSpinner(true);
        if (method === HTTP_VERBS.POST) {
            let createPromise = () => {
                return new Promise(resolve => {
                    // eslint-disable-next-line no-undef
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
        promise.then((response) => {
            if (method === HTTP_VERBS.POST && !response) {
                args.bulk = false; // Flag pour ne pas mettre les épisodes précédents comme vus automatiquement
            }
            Base.callApi(method, 'episodes', 'watched', args).then((data) => {
                if (Base.debug)
                    console.log('updateStatus %s episodes/watched', method, data);
                // Si un épisode est vu et que la série n'a pas été ajoutée
                // au compte du membre connecté
                if (!_this._season.showInAccount() && data.episode.show.in_account) {
                    _this._season.addShowToAccount();
                }
                // On met à jour l'objet Episode
                if (method === HTTP_VERBS.POST && response && pos) {
                    const $vignettes = jQuery('#episodes .slide_flex');
                    let episode = null;
                    for (let e = 0; e < pos; e++) {
                        episode = _this._season.episodes[e];
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
                    ._callListeners(EventTypes.UPDATE)
                    ._season.updateShow(() => {
                    _this.toggleSpinner(false);
                });
            })
                .catch(err => {
                if (Base.debug)
                    console.error('updateStatus error %s', err);
                if (err && err == 'changeStatus') {
                    if (Base.debug)
                        console.log('updateStatus error %s changeStatus', method);
                    _this.updateRender(status);
                    if (status === 'seen') {
                        _this.user.seen = true;
                    }
                    else {
                        _this.user.seen = false;
                    }
                    _this.toggleSpinner(false);
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
        else {
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
        this._season.updateRender();
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
    nbSeasons;
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
     * @override
     */
    fill(data) {
        if (this.mediaType.singular === MediaType.show) {
            this.aliases = data.aliases;
            this.creation = data.creation;
            this.country = data.country;
            this.images = null;
            if (data.images !== undefined && data.images !== null) {
                this.images = new Images(data.images);
            }
            this.nbEpisodes = parseInt(data.episodes, 10);
            this.network = data.network;
            this.next_trailer = data.next_trailer;
            this.next_trailer_host = data.next_trailer_host;
            this.rating = data.rating;
            this.platforms = null;
            if (data.platforms !== undefined && data.platforms !== null) {
                this.platforms = new Platforms(data.platforms);
            }
            this.seasons = new Array();
            this.nbSeasons = parseInt(data.seasons, 10);
            this.showrunner = null;
            if (data.showrunner !== undefined && data.showrunner !== null) {
                this.showrunner = new Showrunner(data.showrunner);
            }
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
            if (data.url !== undefined) {
                data.slug = data.url;
                delete data.url;
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
            //if (debug) console.log('Popover Wrench', eltId, self);
            this.fetch().then(function (data) {
                // eslint-disable-next-line no-undef
                dialog.setContent(renderjson.set_show_to_level(2)(data[_this.mediaType.singular]));
                dialog.setCounter(Base.counter.toString());
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
            template += `<p><strong>${this.nbSeasons}</strong> saison${(this.nbSeasons > 1 ? 's' : '')}, <strong>${this.nbEpisodes}</strong> épisodes, `;
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
        const _this = this;
        let params = { id: this.id };
        let verb = HTTP_VERBS.POST;
        if (state === -1 && this.mediaType.singular === MediaType.movie) {
            verb = HTTP_VERBS.DELETE;
        }
        else if (this.mediaType.singular === MediaType.movie) {
            params.state = state;
        }
        return Base.callApi(verb, this.mediaType.plural, this.mediaType.singular, params)
            .then((data) => {
            _this.fill(data[_this.mediaType.singular]);
            // En attente de la résolution du bug https://www.betaseries.com/bugs/api/462
            if (verb === HTTP_VERBS.DELETE) {
                _this.in_account = false;
                _this.user.status = -1;
                _this.save();
            }
            return _this;
        })
            .catch(err => {
            console.warn('Erreur changeState similar', err);
            Base.notification('Change State Similar', 'Erreur lors du changement de statut: ' + err.toString());
            return _this;
        });
    }
    /**
     * Ajoute une note au média
     * @param   {number} note Note du membre connecté pour le média
     * @returns {Promise<boolean>}
     */
    // eslint-disable-next-line no-unused-vars
    addVote(note) {
        throw new Error('On ne vote pas pour un similar');
    }
}

// eslint-disable-next-line no-unused-vars
class UpdateAuto {
    static getValue = function (name, defaultVal) {
        return Base.cache.getOrDefault(DataTypesCache.updates, 'updateAuto', defaultVal);
    };
    static setValue = function (name, val) {
        Base.cache.set(DataTypesCache.updates, 'updateAuto', val);
    };
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
        if (UpdateAuto.instance) {
            return UpdateAuto.instance;
        }
        this._show = show;
        this._showId = show.id;
        let objUpAuto = UpdateAuto.getValue('objUpAuto', {});
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
    /**
     * Retourne l'instance de l'objet de mise à jour auto des épisodes
     * @param   {Show} s - L'objet de la série
     * @returns {UpdateAuto}
     */
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
        let objUpAuto = UpdateAuto.getValue('objUpAuto', {});
        let obj = {
            status: this._status,
            auto: this._auto,
            interval: this._interval
        };
        objUpAuto[this._showId] = obj;
        UpdateAuto.setValue('objUpAuto', objUpAuto);
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
        let objUpAuto = UpdateAuto.getValue('objUpAuto', {});
        if (objUpAuto[this._showId] !== undefined) {
            delete objUpAuto[this._showId];
            UpdateAuto.setValue('objUpAuto', objUpAuto);
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
            if (this._timer) {
                if (Base.debug)
                    console.log('close old interval timer');
                clearInterval(this._timer);
            }
            const _this = this;
            this.status = true;
            const run = function () {
                // if (debug) console.log('UpdateAuto setInterval objShow', Object.assign({}, _this._objShow));
                if (!_this._auto || _this._show.user.remaining <= 0) {
                    if (Base.debug)
                        console.log('Arrêt de la mise à jour auto des épisodes');
                    _this.stop();
                    return;
                }
                if (Base.debug) {
                    let prefix = '';
                    if (typeof moment !== 'undefined') {
                        const now = new Date();
                        // eslint-disable-next-line no-undef
                        prefix = '[' + moment(now).format('DD/MM/YY HH:mm') + ']: ';
                    }
                    console.log('%supdate episode list', prefix);
                }
                const btnUpEpisodeList = $('.updateEpisodes');
                if (btnUpEpisodeList.length > 0) {
                    btnUpEpisodeList.trigger('click');
                    if (!_this._status) {
                        _this.status = true;
                    }
                }
            };
            run();
            this._timer = setInterval(run, (this._interval * 60) * 1000);
        }
        return this;
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
        for (let key in Object.keys(data)) {
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
        for (let key in Object.keys(data)) {
            this[key] = data[key];
        }
    }
}
/* eslint-disable-next-line no-unused-vars */
class Member {
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
    }
    /**
     * Retourne les infos du membre connecté
     * @returns {Promise<Member>} Une instance du membre connecté
     */
    static fetch() {
        let params = {};
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
}

/**
 * Remplit l'objet avec les données fournit en paramètre
 * @param  {Obj} data Les données provenant de l'API
 * @returns {Show}
 * @override
 */
Show.prototype.fill = function (data) {
    this.aliases = data.aliases;
    this.creation = data.creation;
    this.country = data.country;
    this.images = null;
    if (data.images !== undefined && data.images != null) {
        this.images = new Images(data.images);
    }
    this.nbEpisodes = parseInt(data.episodes, 10);
    this.network = data.network;
    this.next_trailer = data.next_trailer;
    this.next_trailer_host = data.next_trailer_host;
    this.rating = data.rating;
    this.platforms = null;
    if (data.platforms !== undefined && data.platforms != null) {
        this.platforms = new Platforms(data.platforms);
    }
    if (this.id == null && this.seasons == null) {
        this.seasons = new Array();
        for (let s = 0; s < data.seasons_details.length; s++) {
            this.seasons.push(new Season(data.seasons_details[s], this));
        }
    }
    this.showrunner = null;
    if (data.showrunner !== undefined && data.showrunner != null) {
        this.showrunner = new Showrunner(data.showrunner);
    }
    this.social_links = data.social_links;
    this.status = data.status;
    this.thetvdb_id = parseInt(data.thetvdb_id, 10);
    this.pictures = null;
    this.mediaType = { singular: MediaType.show, plural: 'shows', className: Show };
    Media.prototype.fill.call(this, data);
    return this.save();
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
