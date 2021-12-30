/*! betaseries_userscript - v1.1.5 - 2021-12-30
 * https://github.com/Azema/betaseries
 * Copyright (c) 2021 Azema;
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
var CacheUS = /** @class */ (function () {
    function CacheUS() {
        return this._init();
    }
    /**
     * Initialize le cache pour chaque type
     * @returns this
     */
    CacheUS.prototype._init = function () {
        this._data = {};
        this._data[DataTypesCache.shows] = {};
        this._data[DataTypesCache.episodes] = {};
        this._data[DataTypesCache.movies] = {};
        this._data[DataTypesCache.members] = {};
        return this;
    };
    /**
     * Returns an Array of all currently set keys.
     * @returns {Array} cache keys
     */
    CacheUS.prototype.keys = function (type) {
        if (type === void 0) { type = null; }
        if (!type)
            return Object.keys(this._data);
        return Object.keys(this._data[type]);
    };
    /**
     * Checks if a key is currently set in the cache.
     * @param {DataTypesCache}  type Le type de ressource
     * @param {String|number}   key  the key to look for
     * @returns {boolean} true if set, false otherwise
     */
    CacheUS.prototype.has = function (type, key) {
        return (this._data[type] !== undefined && this._data[type][key] !== undefined);
    };
    /**
     * Clears all cache entries.
     * @param   {DataTypesCache} [type=null] Le type de ressource à nettoyer
     * @returns this
     */
    CacheUS.prototype.clear = function (type) {
        if (type === void 0) { type = null; }
        // On nettoie juste un type de ressource
        if (type && this._data[type] !== undefined) {
            for (var key in this._data[type]) {
                delete this._data[type][key];
            }
        }
        // On nettoie l'ensemble du cache
        else {
            this._init();
        }
        return this;
    };
    /**
     * Gets the cache entry for the given key.
     * @param {DataTypesCache}  type Le type de ressource
     * @param {String|number}   key  the cache key
     * @returns {*} the cache entry if set, or undefined otherwise
     */
    CacheUS.prototype.get = function (type, key) {
        if (this.has(type, key)) {
            return this._data[type][key];
        }
        return null;
    };
    /**
     * Returns the cache entry if set, or a default value otherwise.
     * @param {DataTypesCache}  type Le type de ressource
     * @param {String|number}   key  the key to retrieve
     * @param {*}               def  the default value to return if unset
     * @returns {*} the cache entry if set, or the default value provided.
     */
    CacheUS.prototype.getOrDefault = function (type, key, def) {
        return this.has(type, key) ? this.get(type, key) : def;
    };
    /**
     * Sets a cache entry with the provided key and value.
     * @param {DataTypesCache}  type  Le type de ressource
     * @param {String|number}   key   the key to set
     * @param {*}               value the value to set
     * @returns this
     */
    CacheUS.prototype.set = function (type, key, value) {
        if (this._data[type] !== undefined) {
            this._data[type][key] = value;
        }
        return this;
    };
    /**
     * Removes the cache entry for the given key.
     * @param {DataTypesCache}  type  Le type de ressource
     * @param {String|number}   key the key to remove
     * @returns this
     */
    CacheUS.prototype.remove = function (type, key) {
        if (this.has(type, key)) {
            delete this._data[type][key];
        }
        return this;
    };
    return CacheUS;
}());

var Character = /** @class */ (function () {
    function Character(data) {
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
    return Character;
}());

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var MediaStatusComments;
(function (MediaStatusComments) {
    MediaStatusComments["OPEN"] = "open";
    MediaStatusComments["CLOSED"] = "close";
})(MediaStatusComments = MediaStatusComments || (MediaStatusComments = {}));
var CommentsBS = /** @class */ (function () {
    /*************************************************/
    /*                  METHODS                      */
    /*************************************************/
    function CommentsBS(nbComments, media) {
        this.comments = new Array();
        this._parent = media;
        this.is_subscribed = false;
        this.status = MediaStatusComments.OPEN;
        this.nbComments = nbComments;
    }
    /*************************************************/
    /*                  STATIC                       */
    /*************************************************/
    /**
     * Envoie une réponse de ce commentaire à l'API
     * @param   {Base} media - Le média correspondant à la collection
     * @param   {string} text - Le texte de la réponse
     * @returns {Promise<void | CommentBS>}
     */
    CommentsBS.sendComment = function (media, text) {
        var _this = this;
        var params = {
            type: media.mediaType.singular,
            id: media.id,
            text: text
        };
        return Base_1.Base.callApi(Base_1.HTTP_VERBS.POST, 'comments', 'comment', params)
            .then(function (data) {
            var comment = new Comment_1.CommentBS(data.comment, media.comments, media);
            media.comments.addComment(comment);
            media.comments.nbComments++;
            return comment;
        })
            .catch(function (err) {
            Base_1.Base.notification('Commentaire', "Erreur durant l'ajout d'un commentaire");
            console.error(err);
        });
    };
    Object.defineProperty(CommentsBS.prototype, "length", {
        /**
         * Retourne la taille de la collection
         * @readonly
         */
        get: function () {
            return this.comments.length;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Récupère les commentaires du média sur l'API
     * @param   {number} [nbpp=50] - Le nombre de commentaires à récupérer
     * @param   {number} [since=0] - L'identifiant du dernier commentaire reçu
     * @returns {Promise<CommentsBS>}
     */
    CommentsBS.prototype.fetchComments = function (nbpp, since) {
        if (nbpp === void 0) { nbpp = 50; }
        if (since === void 0) { since = 0; }
        var self = this;
        return new Promise(function (resolve, reject) {
            var params = {
                type: self._parent.mediaType.singular,
                id: self._parent.id,
                nbpp: nbpp,
                replies: 0,
                order: 'desc'
            };
            if (since > 0) {
                params.since_id = since;
            }
            Base_1.Base.callApi(Base_1.HTTP_VERBS.GET, 'comments', 'comments', params)
                .then(function (data) {
                if (data.comments !== undefined) {
                    if (since <= 0) {
                        self.comments = new Array();
                    }
                    for (var c = 0; c < data.comments.length; c++) {
                        self.addComment(data.comments[c]);
                    }
                }
                self.nbComments = parseInt(data.total, 10);
                self.is_subscribed = !!data.is_subscribed;
                self.status = data.status;
                resolve(self);
            })
                .catch(function (err) {
                console.warn('fetchComments', err);
                Base_1.Base.notification('Récupération des commentaires', "Une erreur est apparue durant la récupération des commentaires");
                reject(err);
            });
        });
    };
    /**
     * Ajoute un commentaire à la collection
     * @param   {Obj} data - Les données du commentaire provenant de l'API
     * @returns {CommentsBS}
     */
    CommentsBS.prototype.addComment = function (data) {
        if (data instanceof Comment_1.CommentBS) {
            this.comments.push(data);
        }
        else {
            this.comments.push(new Comment_1.CommentBS(data, this, this._parent));
        }
        return this;
    };
    /**
     * Retire un commentaire de la collection
     * /!\ (Ne le supprime pas sur l'API) /!\
     * @param   {number} cmtId - L'identifiant du commentaire à retirer
     * @returns {CommentsBS}
     */
    CommentsBS.prototype.removeComment = function (cmtId) {
        for (var c = 0; c < this.comments.length; c++) {
            if (this.comments[c].id === cmtId) {
                this.comments.splice(c, 1);
                break;
            }
        }
        return this;
    };
    /**
     * Indique si il s'agit du premier commentaire
     * @param cmtId - L'identifiant du commentaire
     * @returns {boolean}
     */
    CommentsBS.prototype.isFirst = function (cmtId) {
        return this.comments[0].id === cmtId;
    };
    /**
     * Indique si il s'agit du dernier commentaire
     * @param cmtId - L'identifiant du commentaire
     * @returns {boolean}
     */
    CommentsBS.prototype.isLast = function (cmtId) {
        return this.comments[this.comments.length - 1].id === cmtId;
    };
    /**
     * Indique si on peut écrire des commentaires sur ce média
     * @returns {boolean}
     */
    CommentsBS.prototype.isOpen = function () {
        return this.status === MediaStatusComments.OPEN;
    };
    /**
     * Retourne le commentaire correspondant à l'ID fournit en paramètre
     * @param   {number} cId - L'identifiant du commentaire
     * @returns {CommentBS|void}
     */
    CommentsBS.prototype.getComment = function (cId) {
        for (var c = 0; c < this.comments.length; c++) {
            if (this.comments[c].id === cId) {
                return this.comments[c];
            }
        }
        return null;
    };
    /**
     * Retourne le commentaire précédent celui fournit en paramètre
     * @param   {number} cId - L'identifiant du commentaire
     * @returns {CommentBS|null}
     */
    CommentsBS.prototype.getPrevComment = function (cId) {
        for (var c = 0; c < this.comments.length; c++) {
            if (this.comments[c].id === cId && c > 0) {
                return this.comments[c - 1];
            }
        }
        return null;
    };
    /**
     * Retourne le commentaire suivant celui fournit en paramètre
     * @param   {number} cId - L'identifiant du commentaire
     * @returns {CommentBS|null}
     */
    CommentsBS.prototype.getNextComment = function (cId) {
        var len = this.comments.length;
        for (var c = 0; c < this.comments.length; c++) {
            // TODO: Vérifier que tous les commentaires ont été récupérer
            if (this.comments[c].id === cId && c < len - 1) {
                return this.comments[c + 1];
            }
        }
        return null;
    };
    /**
     * Retourne les réponses d'un commentaire
     * @param   {number} commentId - Identifiant du commentaire original
     * @returns {Promise<Array<CommentBS>>} Tableau des réponses
     */
    CommentsBS.prototype.fetchReplies = function (commentId) {
        return __awaiter(this, void 0, void 0, function () {
            var data, replies, c;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Base_1.Base.callApi(Base_1.HTTP_VERBS.GET, 'comments', 'replies', { id: commentId, order: 'desc' })];
                    case 1:
                        data = _a.sent();
                        replies = new Array();
                        if (data.comments) {
                            for (c = 0; c < data.comments.length; c++) {
                                replies.push(new Comment_1.CommentBS(data.comments[c], this, this._parent));
                            }
                        }
                        return [2 /*return*/, replies];
                }
            });
        });
    };
    /**
     * Modifie le nombre de votes et le vote du membre pour un commentaire
     * @param   {number} commentId - Identifiant du commentaire
     * @param   {number} thumbs - Nombre de votes
     * @param   {number} thumbed - Le vote du membre connecté
     * @returns {boolean}
     */
    CommentsBS.prototype.changeThumbs = function (commentId, thumbs, thumbed) {
        for (var c = 0; c < this.comments.length; c++) {
            if (this.comments[c].id === commentId) {
                this.comments[c].thumbs = thumbs;
                this.comments[c].thumbed = thumbed;
                return true;
            }
        }
        return false;
    };
    /**
     * Retourne la template pour l'affichage de l'ensemble des commentaires
     * @param   {number} nbpp - Le nombre de commentaires à récupérer
     * @returns {Promise<string>} La template
     */
    CommentsBS.prototype.getTemplate = function (nbpp) {
        return __awaiter(this, void 0, void 0, function () {
            var self;
            var _this_1 = this;
            return __generator(this, function (_a) {
                self = this;
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var promise = Promise.resolve(self);
                        if (Base_1.Base.debug)
                            console.log('Base ', { length: self.comments.length, nbComments: self.nbComments });
                        if (self.comments.length <= 0 && self.nbComments > 0) {
                            if (Base_1.Base.debug)
                                console.log('Base fetchComments call');
                            promise = self.fetchComments(nbpp);
                        }
                        var comment, template = "\n                    <div data-media-type=\"".concat(self._parent.mediaType.singular, "\"\n                         data-media-id=\"").concat(self._parent.id, "\"\n                         class=\"displayFlex flexDirectionColumn\"\n                         style=\"margin-top: 2px; min-height: 0\">");
                        if (Base_1.Base.userIdentified()) {
                            template += "\n                <button type=\"button\" class=\"btn-reset btnSubscribe\" style=\"position: absolute; top: 3px; right: 31px; padding: 8px;\">\n                    <span class=\"svgContainer\">\n                        <svg></svg>\n                    </span>\n                </button>";
                        }
                        template += '<div class="comments overflowYScroll">';
                        promise.then(function () { return __awaiter(_this_1, void 0, void 0, function () {
                            var c, _a, r;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        c = 0;
                                        _b.label = 1;
                                    case 1:
                                        if (!(c < self.comments.length)) return [3 /*break*/, 5];
                                        comment = self.comments[c];
                                        template += Comment_1.CommentBS.getTemplateComment(comment, true);
                                        if (!(comment.nbReplies > 0 && comment.replies.length <= 0)) return [3 /*break*/, 3];
                                        // On récupère les réponses
                                        _a = comment;
                                        return [4 /*yield*/, self.fetchReplies(comment.id)];
                                    case 2:
                                        // On récupère les réponses
                                        _a.replies = _b.sent();
                                        _b.label = 3;
                                    case 3:
                                        for (r = 0; r < comment.replies.length; r++) {
                                            template += Comment_1.CommentBS.getTemplateComment(comment.replies[r], true);
                                        }
                                        _b.label = 4;
                                    case 4:
                                        c++;
                                        return [3 /*break*/, 1];
                                    case 5:
                                        // On ajoute le bouton pour voir plus de commentaires
                                        if (self.comments.length < self.nbComments) {
                                            template += "<button type=\"button\" class=\"btn-reset btn-greyBorder moreComments\" style=\"margin-top: 10px; width: 100%;\">".concat(Base_1.Base.trans("timeline.comments.display_more"), "<i class=\"fa fa-cog fa-spin fa-2x fa-fw\" style=\"display:none;margin-left:15px;vertical-align:middle;\"></i><span class=\"sr-only\">Loading...</span></button>");
                                        }
                                        template + '</div>';
                                        if (self.isOpen() && Base_1.Base.userIdentified()) {
                                            template += Comment_1.CommentBS.getTemplateWriting();
                                        }
                                        resolve(template + '</div>');
                                        return [2 /*return*/];
                                }
                            });
                        }); })
                            .catch(function (err) {
                            reject(err);
                        });
                    })];
            });
        });
    };
    /**
     * Ajoute les évènements sur les commentaires lors du rendu
     * @param   {JQuery<HTMLElement>} $container - Le conteneur des éléments d'affichage
     * @param   {number} nbpp - Le nombre de commentaires à récupérer sur l'API
     * @param   {Obj} funcPopup - Objet des fonctions d'affichage/ de masquage de la popup
     * @returns {void}
     */
    CommentsBS.prototype.loadEvents = function ($container, nbpp, funcPopup) {
        var _this_1 = this;
        // Tableau servant à contenir les events créer pour pouvoir les supprimer plus tard
        this._events = new Array();
        var self = this;
        var $popup = jQuery('#popin-dialog');
        var $btnClose = jQuery("#popin-showClose");
        // On ajoute les templates HTML du commentaire,
        // des réponses et du formulaire de d'écriture
        // On active le bouton de fermeture de la popup
        $btnClose.click(function () {
            funcPopup.hidePopup();
            $popup.removeAttr('data-popin-type');
        });
        this._events.push({ elt: $btnClose, event: 'click' });
        var $btnSubscribe = $container.find('.btnSubscribe');
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
                $btn.find('svg').replaceWith("\n                    <svg fill=\"".concat(Base_1.Base.theme == 'dark' ? 'rgba(255, 255, 255, .5)' : '#333', "\" width=\"14\" height=\"16\" style=\"position: relative; top: 1px; left: -1px;\">\n                        <path fill-rule=\"nonzero\" d=\"M13.176 13.284L3.162 2.987 1.046.812 0 1.854l2.306 2.298v.008c-.428.812-.659 1.772-.659 2.806v4.103L0 12.709v.821h11.307l1.647 1.641L14 14.13l-.824-.845zM6.588 16c.914 0 1.647-.73 1.647-1.641H4.941c0 .91.733 1.641 1.647 1.641zm4.941-6.006v-3.02c0-2.527-1.35-4.627-3.705-5.185V1.23C7.824.55 7.272 0 6.588 0c-.683 0-1.235.55-1.235 1.23v.559c-.124.024-.239.065-.346.098a2.994 2.994 0 0 0-.247.09h-.008c-.008 0-.008 0-.017.009-.19.073-.379.164-.56.254 0 0-.008 0-.008.008l7.362 7.746z\"></path>\n                    </svg>\n                "));
            }
            else if (self.is_subscribed) {
                $btn.addClass('active');
                $btn.attr('title', "Ne plus recevoir les commentaires par e-mail");
                $btn.find('svg').replaceWith("\n                    <svg width=\"20\" height=\"22\" viewBox=\"0 0 20 22\" style=\"width: 17px;\">\n                        <g transform=\"translate(-4)\" fill=\"none\">\n                            <path d=\"M0 0h24v24h-24z\"></path>\n                            <path fill=\"".concat(Base_1.Base.theme == 'dark' ? 'rgba(255, 255, 255, .5)' : '#333', "\" d=\"M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32v-.68c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68c-2.87.68-4.5 3.24-4.5 6.32v5l-2 2v1h16v-1l-2-2z\"></path>\n                        </g>\n                    </svg>\n                "));
            }
        }
        $btnSubscribe.click(function (e) {
            e.stopPropagation();
            e.preventDefault();
            if (!Base_1.Base.userIdentified()) {
                faceboxDisplay('inscription', {}, function () { });
                return;
            }
            var $btn = $(e.currentTarget);
            var params = { type: self._parent.mediaType.singular, id: self._parent.id };
            if ($btn.hasClass('active')) {
                Base_1.Base.callApi(Base_1.HTTP_VERBS.DELETE, 'comments', 'subscription', params)
                    .then(function (data) {
                    self.is_subscribed = false;
                    displaySubscription($btn);
                });
            }
            else {
                Base_1.Base.callApi(Base_1.HTTP_VERBS.POST, 'comments', 'subscription', params)
                    .then(function (data) {
                    self.is_subscribed = true;
                    displaySubscription($btn);
                });
            }
        });
        displaySubscription($btnSubscribe);
        this._events.push({ elt: $btnSubscribe, event: 'click' });
        // On active le lien pour afficher le spoiler
        var $btnSpoiler = $container.find('.view-spoiler');
        if ($btnSpoiler.length > 0) {
            $btnSpoiler.click(function (e) {
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
        var $btnThumb = $container.find('.comments .comment .btnThumb');
        $btnThumb.click(function (e) {
            e.stopPropagation();
            e.preventDefault();
            if (!Base_1.Base.userIdentified()) {
                faceboxDisplay('inscription', {}, function () { });
                return;
            }
            var $btn = jQuery(e.currentTarget);
            var $comment = $btn.parents('.comment');
            var commentId = parseInt($comment.data('commentId'), 10);
            var comment;
            // Si il s'agit d'une réponse, il nous faut le commentaire parent
            if ($comment.hasClass('reply')) {
                var $parent = $comment.prev();
                while ($parent.hasClass('reply')) {
                    $parent = $parent.prev();
                }
                var parentId = parseInt($parent.data('commentId'), 10);
                if (commentId == parentId) {
                    comment = _this_1.getComment(commentId);
                }
                else {
                    var cmtParent = _this_1.getComment(parentId);
                    comment = cmtParent.getReply(commentId);
                }
            }
            else {
                comment = _this_1.getComment(commentId);
            }
            var verb = Base_1.HTTP_VERBS.POST;
            var vote = $btn.hasClass('btnUpVote') ? 1 : -1;
            var params = { id: commentId, type: vote, switch: false };
            // On a déjà voté
            if (comment.thumbed == vote) {
                verb = Base_1.HTTP_VERBS.DELETE;
                params = { id: commentId };
            }
            else if (comment.thumbed != 0) {
                console.warn("Le vote est impossible. Annuler votre vote et recommencer");
                return;
            }
            Base_1.Base.callApi(verb, 'comments', 'thumb', params)
                .then(function (data) {
                comment.thumbs = parseInt(data.comment.thumbs, 10);
                comment.thumbed = data.comment.thumbed ? parseInt(data.comment.thumbed, 10) : 0;
                comment.updateRenderThumbs(vote);
            })
                .catch(function (err) {
                var msg = err.text !== undefined ? err.text : err;
                Base_1.Base.notification('Thumb commentaire', "Une erreur est apparue durant le vote: " + msg);
            });
        });
        this._events.push({ elt: $btnThumb, event: 'click' });
        /**
         * On affiche/masque les options du commentaire
         */
        var $btnOptions = $container.find('.btnToggleOptions');
        $btnOptions.click(function (e) {
            e.stopPropagation();
            e.preventDefault();
            jQuery(e.currentTarget).parents('.actionsCmt').first()
                .find('.options-comment').each(function (_index, elt) {
                var $elt = jQuery(elt);
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
        var $btnSend = $container.find('.sendComment');
        $btnSend.click(function (e) {
            e.stopPropagation();
            e.preventDefault();
            if (!Base_1.Base.userIdentified()) {
                faceboxDisplay('inscription', {}, function () { });
                return;
            }
            var $textarea = $(e.currentTarget).siblings('textarea');
            if ($textarea.val().length > 0) {
                var comment = void 0;
                if ($textarea.data('replyTo')) {
                    comment = self.getComment(parseInt($textarea.data('replyTo'), 10));
                    comment.reply($textarea.val());
                }
                else {
                    CommentsBS.sendComment(self._parent, $textarea.val())
                        .then(function (comment) {
                        if (comment) {
                            $textarea.val('');
                            $textarea.parents('.writing').siblings('.comments').append(Comment_1.CommentBS.getTemplateComment(comment));
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
        var $textarea = $container.find('textarea');
        $textarea.keypress(function (e) {
            var $textarea = $(e.currentTarget);
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
        var $baliseSpoiler = $container.find('.baliseSpoiler');
        /**
         * Permet d'englober le texte du commentaire en écriture
         * avec les balises [spoiler]...[/spoiler]
         */
        $baliseSpoiler.click(function (e) {
            var $textarea = $popup.find('textarea');
            if (/\[spoiler\]/.test($textarea.val())) {
                return;
            }
            var text = '[spoiler]' + $textarea.val() + '[/spoiler]';
            $textarea.val(text);
        });
        this._events.push({ elt: $baliseSpoiler, event: 'click' });
        var $btnReplies = $container.find('.comments .toggleReplies');
        /**
         * Affiche/masque les réponses d'un commentaire
         */
        $btnReplies.click(function (e) {
            e.stopPropagation();
            e.preventDefault();
            var $btn = $(e.currentTarget);
            var state = $btn.data('toggle'); // 0: Etat masqué, 1: Etat affiché
            var $comment = $btn.parents('.comment');
            var inner = $comment.data('commentInner');
            var $replies = $comment.parents('.comments').find(".comment[data-comment-reply=\"".concat(inner, "\"]"));
            if (state == '0') {
                // On affiche
                $replies.fadeIn('fast');
                $btn.find('.btnText').text(Base_1.Base.trans("comment.hide_answers"));
                $btn.find('svg').attr('style', 'transition: transform 200ms ease 0s; transform: rotate(180deg);');
                $btn.data('toggle', '1');
            }
            else {
                // On masque
                $replies.fadeOut('fast');
                $btn.find('.btnText').text(Base_1.Base.trans("comment.button.reply", { "%count%": $replies.length.toString() }, $replies.length));
                $btn.find('svg').attr('style', 'transition: transform 200ms ease 0s;');
                $btn.data('toggle', '0');
            }
        });
        this._events.push({ elt: $btnReplies, event: 'click' });
        var $btnResponse = $container.find('.btnResponse');
        /**
         * Permet de créer une réponse à un commentaire
         */
        $btnResponse.click(function (e) {
            e.stopPropagation();
            e.preventDefault();
            if (!Base_1.Base.userIdentified()) {
                faceboxDisplay('inscription', {}, function () { });
                return;
            }
            var $btn = $(e.currentTarget);
            var $comment = $btn.parents('.comment');
            var commentId = parseInt($comment.data('commentId'), 10);
            var comment;
            // Si il s'agit d'une réponse, il nous faut le commentaire parent
            if ($comment.hasClass('iv_i5') || $comment.hasClass('it_i3')) {
                var $parent = $comment.siblings('.comment:not(.iv_i5)').first();
                var parentId = parseInt($parent.data('commentId'), 10);
                if (commentId == parentId) {
                    comment = _this_1.getComment(commentId);
                }
                else {
                    var cmtParent = _this_1.getComment(parentId);
                    comment = cmtParent.getReply(commentId);
                }
            }
            else {
                comment = _this_1.getComment(commentId);
            }
            $container.find('textarea')
                .val('@' + comment.login)
                .attr('data-reply-to', comment.id);
        });
        this._events.push({ elt: $btnResponse, event: 'click' });
        var $btnMore = $container.find('.moreComments');
        /**
         * Permet d'afficher plus de commentaires
         */
        $btnMore.click(function (e) {
            e.stopPropagation();
            e.preventDefault();
            var $btn = jQuery(e.currentTarget);
            if (self.comments.length >= self.nbComments) {
                $btn.hide();
                return;
            }
            var $loader = $btn.find('.fa-spin');
            $loader.show();
            var lastCmtId = self.comments[self.comments.length - 1].id;
            var oldLastCmtIndex = self.comments.length - 1;
            self.fetchComments(nbpp, lastCmtId).then(function () { return __awaiter(_this_1, void 0, void 0, function () {
                var template, comment, firstCmtId, c, _a, r;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            template = '', firstCmtId = self.comments[oldLastCmtIndex + 1].id;
                            c = oldLastCmtIndex + 1;
                            _b.label = 1;
                        case 1:
                            if (!(c < self.comments.length)) return [3 /*break*/, 5];
                            comment = self.comments[c];
                            template += Comment_1.CommentBS.getTemplateComment(comment, true);
                            if (!(comment.nbReplies > 0 && comment.replies.length <= 0)) return [3 /*break*/, 3];
                            // On récupère les réponses
                            _a = comment;
                            return [4 /*yield*/, self.fetchReplies(comment.id)];
                        case 2:
                            // On récupère les réponses
                            _a.replies = _b.sent();
                            _b.label = 3;
                        case 3:
                            for (r = 0; r < comment.replies.length; r++) {
                                template += Comment_1.CommentBS.getTemplateComment(comment.replies[r], true);
                            }
                            _b.label = 4;
                        case 4:
                            c++;
                            return [3 /*break*/, 1];
                        case 5:
                            $btn.before(template);
                            jQuery(".comment[data-comment-id=\"".concat(firstCmtId.toString(), "\"]")).get(0).scrollIntoView();
                            self.cleanEvents(self.loadEvents);
                            if (self.comments.length >= self.nbComments) {
                                $btn.hide();
                            }
                            return [2 /*return*/];
                    }
                });
            }); }).finally(function () {
                $loader.hide();
            });
        });
        this._events.push({ elt: $btnMore, event: 'click' });
    };
    /**
     * Nettoie les events créer par la fonction loadEvents
     * @param   {Function} onComplete - Fonction de callback
     * @returns {void}
     */
    CommentsBS.prototype.cleanEvents = function (onComplete) {
        if (onComplete === void 0) { onComplete = Base_1.Base.noop; }
        if (this._events && this._events.length > 0) {
            var data = void 0;
            for (var e = 0; e < this._events.length; e++) {
                data = this._events[e];
                data.elt.off(data.event);
            }
        }
        onComplete();
    };
    /**
     * Gère l'affichage de l'ensemble des commentaires
     * @returns {void}
     */
    CommentsBS.prototype.render = function () {
        if (Base_1.Base.debug)
            console.log('CommentsBS render');
        // La popup et ses éléments
        var self = this, $popup = jQuery('#popin-dialog'), $contentHtmlElement = $popup.find(".popin-content-html"), $contentReact = $popup.find('.popin-content-reactmodule'), $closeButtons = $popup.find("#popin-showClose"), hidePopup = function () {
            document.body.style.overflow = "visible";
            document.body.style.paddingRight = "";
            $popup.attr('aria-hidden', 'true');
            $popup.find("#popupalertyes").show();
            $popup.find("#popupalertno").show();
            $contentHtmlElement.hide();
            $contentReact.empty();
            self.cleanEvents();
        }, showPopup = function () {
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
        $contentReact.empty().append("<div class=\"title\" id=\"dialog-title\" tabindex=\"0\">".concat(Base_1.Base.trans("blog.title.comments"), "</div>"));
        var $title = $contentReact.find('.title');
        var templateLoader = "\n            <div class=\"loaderCmt\">\n                <svg class=\"sr-only\">\n                    <defs>\n                        <clipPath id=\"placeholder\">\n                            <path d=\"M50 25h160v8H50v-8zm0-18h420v8H50V7zM20 40C8.954 40 0 31.046 0 20S8.954 0 20 0s20 8.954 20 20-8.954 20-20 20z\"></path>\n                        </clipPath>\n                    </defs>\n                </svg>\n        ";
        for (var l = 0; l < 4; l++) {
            templateLoader += "\n                <div class=\"er_ex null\"><div class=\"ComponentPlaceholder er_et \" style=\"height: 40px;\"></div></div>";
        }
        $contentReact.append(templateLoader + '</div>');
        showPopup();
        var nbCmts = 20; // Nombre de commentaires à récupérer sur l'API
        self.getTemplate(nbCmts).then(function (template) {
            // On définit le type d'affichage de la popup
            $popup.attr('data-popin-type', 'comments');
            // On masque le loader pour ajouter les données à afficher
            $contentReact.fadeOut('fast', function () {
                $contentReact.find('.loaderCmt').remove();
                $contentReact.append(template);
                $contentReact.fadeIn();
                self.loadEvents($contentReact, nbCmts, { hidePopup: hidePopup, showPopup: showPopup });
            });
        });
    };
    return CommentsBS;
}());

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var CommentBS = /** @class */ (function () {
    function CommentBS(data, parent, media) {
        this._parent = parent;
        this._media = media;
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
    }
    /**
     * Indique si le commentaire est le premier de la liste
     * @returns {boolean}
     */
    CommentBS.prototype.isFirst = function () {
        return this._parent.isFirst(this.id);
    };
    /**
     * Indique si le commentaire est le dernier de la liste
     * @returns {boolean}
     */
    CommentBS.prototype.isLast = function () {
        return this._parent.isLast(this.id);
    };
    /**
     * Permet d'afficher une note avec des étoiles
     * @param   {number} note    La note à afficher
     * @returns {string}
     */
    CommentBS._renderNote = function (note) {
        var typeSvg, template = '';
        note = note || 0;
        Array.from({
            length: 5
        }, function (_index, number) {
            typeSvg = note <= number ? "empty" : (note < number + 1) ? 'half' : "full";
            template += "\n                <svg viewBox=\"0 0 100 100\" class=\"star-svg\">\n                    <use xmlns:xlink=\"http://www.w3.org/1999/xlink\"\n                        xlink:href=\"#icon-star-".concat(typeSvg, "\">\n                    </use>\n                </svg>\n            ");
        });
        return template;
    };
    /**
     * Renvoie la template HTML pour l'affichage d'un commentaire
     * @param   {CommentBS} comment Le commentaire à afficher
     * @returns {string}
     */
    CommentBS.getTemplateComment = function (comment, all) {
        if (all === void 0) { all = false; }
        var text = new Option(comment.text).innerHTML;
        var spoiler = /\[spoiler\]/.test(text);
        var btnSpoiler = spoiler ? "<button type=\"button\" class=\"btn-reset mainLink view-spoiler\" style=\"vertical-align: 0px;\">".concat(Base_1.Base.trans("comment.button.display_spoiler"), "</button>") : '';
        // let classNames = {reply: 'iv_i5', actions: 'iv_i3', comment: 'iv_iz'};
        var classNames = { reply: 'it_i3', actions: 'it_i1', comment: 'it_ix' };
        var className = (comment.in_reply_to > 0) ? classNames.reply + ' reply' : '';
        var btnToggleReplies = comment.nbReplies > 0 ? "\n        <button type=\"button\" class=\"btn-reset mainLink mainLink--regular toggleReplies\" style=\"margin-top: 2px; margin-bottom: -3px;\" data-toggle=\"1\">\n            <span class=\"svgContainer\" style=\"display: inline-flex; height: 16px; width: 16px;\">\n                <svg width=\"8\" height=\"6\" xmlns=\"http://www.w3.org/2000/svg\" style=\"transition: transform 200ms ease 0s; transform: rotate(180deg);\">\n                    <path d=\"M4 5.667l4-4-.94-.94L4 3.78.94.727l-.94.94z\" fill=\"#54709D\" fill-rule=\"nonzero\"></path>\n                </svg>\n            </span>&nbsp;<span class=\"btnText\">".concat(Base_1.Base.trans("comment.hide_answers"), "</span>\n        </button>") : '';
        return "\n            <div class=\"comment ".concat(className, " positionRelative ").concat(CommentBS.classNamesCSS.comment, "\" data-comment-id=\"").concat(comment.id, "\" ").concat(comment.in_reply_to > 0 ? 'data-comment-reply="' + comment.in_reply_to + '"' : '', " data-comment-inner=\"").concat(comment.inner_id, "\">\n                <div class=\"media\">\n                    <div class=\"media-left\">\n                        <a href=\"/membre/").concat(comment.login, "\" class=\"avatar\">\n                            <img src=\"https://api.betaseries.com/pictures/members?key=").concat(Base_1.Base.userKey, "&amp;id=").concat(comment.user_id, "&amp;width=64&amp;height=64&amp;placeholder=png\" width=\"32\" height=\"32\" alt=\"Profil de ").concat(comment.login, "\">\n                        </a>\n                    </div>\n                    <div class=\"media-body\">\n                        <a href=\"/membre/").concat(comment.login, "\">\n                            <span class=\"mainLink\">").concat(comment.login, "</span>&nbsp;\n                            <span class=\"mainLink mainLink--regular\">&nbsp;</span>\n                        </a>\n                        <span style=\"").concat(spoiler ? 'display:none;' : '', "\" class=\"comment-text\">").concat(text, "</span>\n                        ").concat(btnSpoiler, "\n                        <div class=\"").concat(CommentBS.classNamesCSS.actions, " actionsCmt\">\n                            <div class=\"options-main options-comment\">\n                                <button type=\"button\" class=\"btn-reset btnUpVote btnThumb\" title=\"+1 pour ce commentaire\">\n                                    <svg data-disabled=\"false\" class=\"SvgLike\" fill=\"#fff\" width=\"16\" height=\"14\" viewBox=\"0 0 16 14\" xmlns=\"http://www.w3.org/2000/svg\">\n                                        <g fill=\"").concat(comment.thumbed > 0 ? '#FFAC3B' : 'inherit', "\" fill-rule=\"nonzero\">\n                                            <path fill=\"#fff\" fill-rule=\"evenodd\" d=\"M.67 6h2.73v8h-2.73v-8zm14.909.67c0-.733-.614-1.333-1.364-1.333h-4.302l.648-3.047.02-.213c0-.273-.116-.527-.3-.707l-.723-.7-4.486 4.393c-.252.24-.402.573-.402.94v6.667c0 .733.614 1.333 1.364 1.333h6.136c.566 0 1.05-.333 1.255-.813l2.059-4.7c.061-.153.095-.313.095-.487v-1.273l-.007-.007.007-.053z\"></path>\n                                            <path class=\"SvgLikeStroke\" stroke=\"#54709D\" d=\"M1.17 6.5v7h1.73v-7h-1.73zm13.909.142c-.016-.442-.397-.805-.863-.805h-4.92l.128-.604.639-2.99.018-.166c0-.13-.055-.257-.148-.348l-.373-.361-4.144 4.058c-.158.151-.247.355-.247.578v6.667c0 .455.387.833.864.833h6.136c.355 0 .664-.204.797-.514l2.053-4.685c.04-.1.06-.198.06-.301v-1.063l-.034-.034.034-.265z\"></path>\n                                        </g>\n                                    </svg>\n                                </button>\n                                <button type=\"button\" class=\"btn-reset btnDownVote btnThumb\" title=\"-1 pour ce commentaire\">\n                                    <svg data-disabled=\"false\" class=\"SvgLike\" fill=\"#fff\" width=\"16\" height=\"14\" viewBox=\"0 0 16 14\" xmlns=\"http://www.w3.org/2000/svg\" style=\"transform: rotate(180deg) scaleX(-1); margin-left: 4px; vertical-align: -4px;\">\n                                        <g fill=\"").concat(comment.thumbed < 0 ? '#FFAC3B' : 'inherit', "\" fill-rule=\"nonzero\">\n                                            <path fill=\"#fff\" fill-rule=\"evenodd\" d=\"M.67 6h2.73v8h-2.73v-8zm14.909.67c0-.733-.614-1.333-1.364-1.333h-4.302l.648-3.047.02-.213c0-.273-.116-.527-.3-.707l-.723-.7-4.486 4.393c-.252.24-.402.573-.402.94v6.667c0 .733.614 1.333 1.364 1.333h6.136c.566 0 1.05-.333 1.255-.813l2.059-4.7c.061-.153.095-.313.095-.487v-1.273l-.007-.007.007-.053z\"></path>\n                                            <path class=\"SvgLikeStroke\" stroke=\"#54709D\" d=\"M1.17 6.5v7h1.73v-7h-1.73zm13.909.142c-.016-.442-.397-.805-.863-.805h-4.92l.128-.604.639-2.99.018-.166c0-.13-.055-.257-.148-.348l-.373-.361-4.144 4.058c-.158.151-.247.355-.247.578v6.667c0 .455.387.833.864.833h6.136c.355 0 .664-.204.797-.514l2.053-4.685c.04-.1.06-.198.06-.301v-1.063l-.034-.034.034-.265z\"></path>\n                                        </g>\n                                    </svg>\n                                </button>\n                                <strong class=\"mainLink thumbs\" style=\"margin-left: 5px;\">").concat(comment.thumbs > 0 ? '+' + comment.thumbs : (comment.thumbs < 0) ? '-' + comment.thumbs : comment.thumbs, "</strong>\n                                <span class=\"mainLink\">&nbsp;\u2219&nbsp;</span>\n                                <button type=\"button\" class=\"btn-reset mainLink mainLink--regular btnResponse\" style=\"vertical-align: 0px;").concat(!Base_1.Base.userIdentified() ? 'display:none;' : '', "\">").concat(Base_1.Base.trans("timeline.comment.reply"), "</button>\n                                <a href=\"#c_1269819\" class=\"mainTime\">\n                                    <span class=\"mainLink\">&nbsp;\u2219&nbsp;</span>\n                                    Le ").concat(/* eslint-disable-line no-undef */ typeof moment !== 'undefined' ? moment(comment.date).format('DD/MM/YYYY HH:mm') : comment.date.toString(), "\n                                </a>\n                                <span class=\"stars\" title=\"").concat(comment.user_note, " / 5\">\n                                    ").concat(CommentBS._renderNote(comment.user_note), "\n                                </span>\n                                <div class=\"it_iv\">\n                                    <button type=\"button\" class=\"btn-reset btnToggleOptions\">\n                                        <span class=\"svgContainer\">\n                                            <svg width=\"4\" height=\"16\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" style=\"transform: rotate(90deg);\">\n                                                <defs>\n                                                    <path d=\"M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z\" id=\"svgthreedots\"></path>\n                                                </defs>\n                                                <use fill=\"").concat(Base_1.Base.theme === 'dark' ? "rgba(255, 255, 255, .5)" : "#333", "\" fill-rule=\"nonzero\" xlink:href=\"#svgthreedots\" transform=\"translate(-10 -4)\"></use>\n                                            </svg>\n                                        </span>\n                                    </button>\n                                </div>\n                            </div>\n                            <div class=\"options-options options-comment\" style=\"display:none;\">\n                                <a href=\"/messages/nouveau?login=").concat(comment.login, "\" class=\"mainLink\">Envoyer un message</a>\n                                <span class=\"mainLink\">&nbsp;\u2219&nbsp;</span>\n                                <button type=\"button\" class=\"btn-reset mainLink btnSignal\" style=\"vertical-align: 0px;\">Signaler</button>\n                                <button type=\"button\" class=\"btn-reset btnToggleOptions\" style=\"margin-left: 4px;\">\n                                    <span class=\"svgContainer\">\n                                        <svg fill=\"").concat(Base_1.Base.theme === 'dark' ? "rgba(255, 255, 255, .5)" : "#333", "\" width=\"9\" height=\"9\" viewBox=\"0 0 14 14\" xmlns=\"http://www.w3.org/2000/svg\">\n                                            <path d=\"M14 1.41l-1.41-1.41-5.59 5.59-5.59-5.59-1.41 1.41 5.59 5.59-5.59 5.59 1.41 1.41 5.59-5.59 5.59 5.59 1.41-1.41-5.59-5.59z\"></path>\n                                        </svg>\n                                    </span>\n                                </button>\n                            </div>\n                        </div>\n                        ").concat(btnToggleReplies, "\n                    </div>\n                </div>\n            </div>\n        ");
    };
    /**
     * Renvoie la template HTML pour l'écriture d'un commentaire
     * @returns {string}
     */
    CommentBS.getTemplateWriting = function () {
        var login = Base_1.Base.userIdentified() ? currentLogin : '';
        return "\n            <div class=\"writing\">\n                <div class=\"media\">\n                    <div class=\"media-left\">\n                        <div class=\"avatar\">\n                            <img src=\"https://api.betaseries.com/pictures/members?key=".concat(Base_1.Base.userKey, "&amp;id=").concat(Base_1.Base.userId, "&amp;width=32&amp;height=32&amp;placeholder=png\" width=\"32\" height=\"32\" alt=\"Profil de ").concat(login, "\">\n                        </div>\n                    </div>\n                    <div class=\"media-body\">\n                        <form class=\"gz_g1\">\n                            <textarea rows=\"2\" placeholder=\"").concat(Base_1.Base.trans("timeline.comment.write"), "\" class=\"form-control\"></textarea>\n                            <button class=\"btn-reset sendComment\" disabled=\"\" aria-label=\"").concat(Base_1.Base.trans("comment.send.label"), "\" title=\"").concat(Base_1.Base.trans("comment.send.label"), "\">\n                                <span class=\"svgContainer\" style=\"width: 16px; height: 16px;\">\n                                    <svg fill=\"").concat(Base_1.Base.theme === 'dark' ? "#fff" : "#333", "\" width=\"15\" height=\"12\" xmlns=\"http://www.w3.org/2000/svg\">\n                                        <path d=\"M.34 12l13.993-6L.34 0 .333 4.667l10 1.333-10 1.333z\"></path>\n                                    </svg>\n                                </span>\n                            </button>\n                        </form>\n                        <p class=\"mainTime\">Utilisez la balise <span class=\"baliseSpoiler\" title=\"Ajouter la balise spoiler \u00E0 votre commentaire\">[spoiler]\u2026[/spoiler]</span> pour masquer le contenu pouvant spoiler les lecteurs.</p>\n                    </div>\n                </div>\n            </div>\n        ");
    };
    /**
     * Met à jour le rendu des votes de ce commentaire
     * @param   {number} vote Le vote
     * @returns {void}
     */
    CommentBS.prototype.updateRenderThumbs = function (vote) {
        if (vote === void 0) { vote = 0; }
        var $thumbs = jQuery(".comments .comment[data-comment-id=\"".concat(this.id, "\"] .thumbs"));
        var val = parseInt($thumbs.text(), 10);
        var result = (vote == this.thumbed) ? val + vote : val - vote;
        var text = result > 0 ? "+".concat(result) : result.toString();
        // if (Base.debug) console.log('renderThumbs: ', {val, vote, result, text});
        $thumbs.text(text);
        if (this.thumbed == 0) {
            // On supprime la couleur de remplissage des icones de vote
            $thumbs.siblings('.btnThumb').find('g').attr('fill', 'inherited');
            return;
        }
        // On affiche le vote en remplissant l'icone correspondant d'une couleur jaune
        var $btnVote = this.thumbed > 0 ? $thumbs.siblings('.btnThumb.btnUpVote') : $thumbs.siblings('.btnThumb.btnDownVote');
        $btnVote.find('g').attr('fill', '#FFAC3B');
    };
    /**
     * Indique si le comment fournit en paramètre fait parti des réponses
     * @param   {number} commentId L'identifiant de la réponse
     * @returns {boolean}
     */
    CommentBS.prototype.isReply = function (commentId) {
        if (this.replies.length <= 0)
            return false;
        for (var r = 0; r < this.replies.length; r++) {
            if (this.replies[r].id == commentId) {
                return true;
            }
        }
        return false;
    };
    /**
     * Retourne la réponse correspondant à l'identifiant fournit
     * @param   {number} commentId L'identifiant de la réponse
     * @returns {CommentBS} La réponse
     */
    CommentBS.prototype.getReply = function (commentId) {
        for (var r = 0; r < this.replies.length; r++) {
            if (this.replies[r].id == commentId) {
                return this.replies[r];
            }
        }
        return null;
    };
    /**
     * Ajoute les évènements sur les commentaires lors du rendu
     * @param   {JQuery<HTMLElement>} $container - Le conteneur des éléments d'affichage
     * @param   {Obj} funcPopup - Objet des fonctions d'affichage/ de masquage de la popup
     * @returns {void}
     */
    CommentBS.prototype.loadEvents = function ($container, funcPopup) {
        this._events = new Array();
        var self = this;
        var $popup = jQuery('#popin-dialog');
        var $btnClose = jQuery("#popin-showClose");
        var $title = $container.find('.title');
        $btnClose.click(function () {
            funcPopup.hidePopup();
            $popup.removeAttr('data-popin-type');
        });
        this._events.push({ elt: $btnClose, event: 'click' });
        var $btnSubscribe = $container.find('.btnSubscribe');
        /**
         * Met à jour l'affichage du bouton de souscription
         * des alertes de nouveaux commentaires
         * @param   {JQuery<HTMLElement>} $btn - L'élément jQuery correspondant au bouton de souscription
         * @returns {void}
         */
        function displaySubscription($btn) {
            if (!self._parent.is_subscribed) {
                $btn.removeClass('active');
                $btn.attr('title', "Recevoir les commentaires par e-mail");
                $btn.find('svg').replaceWith("\n                    <svg fill=\"".concat(Base_1.Base.theme == 'dark' ? 'rgba(255, 255, 255, .5)' : '#333', "\" width=\"14\" height=\"16\" style=\"position: relative; top: 1px; left: -1px;\">\n                        <path fill-rule=\"nonzero\" d=\"M13.176 13.284L3.162 2.987 1.046.812 0 1.854l2.306 2.298v.008c-.428.812-.659 1.772-.659 2.806v4.103L0 12.709v.821h11.307l1.647 1.641L14 14.13l-.824-.845zM6.588 16c.914 0 1.647-.73 1.647-1.641H4.941c0 .91.733 1.641 1.647 1.641zm4.941-6.006v-3.02c0-2.527-1.35-4.627-3.705-5.185V1.23C7.824.55 7.272 0 6.588 0c-.683 0-1.235.55-1.235 1.23v.559c-.124.024-.239.065-.346.098a2.994 2.994 0 0 0-.247.09h-.008c-.008 0-.008 0-.017.009-.19.073-.379.164-.56.254 0 0-.008 0-.008.008l7.362 7.746z\"></path>\n                    </svg>\n                "));
            }
            else if (self._parent.is_subscribed) {
                $btn.addClass('active');
                $btn.attr('title', "Ne plus recevoir les commentaires par e-mail");
                $btn.find('svg').replaceWith("\n                    <svg width=\"20\" height=\"22\" viewBox=\"0 0 20 22\" style=\"width: 17px;\">\n                        <g transform=\"translate(-4)\" fill=\"none\">\n                            <path d=\"M0 0h24v24h-24z\"></path>\n                            <path fill=\"".concat(Base_1.Base.theme == 'dark' ? 'rgba(255, 255, 255, .5)' : '#333', "\" d=\"M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32v-.68c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68c-2.87.68-4.5 3.24-4.5 6.32v5l-2 2v1h16v-1l-2-2z\"></path>\n                        </g>\n                    </svg>\n                "));
            }
        }
        $btnSubscribe.click(function (e) {
            e.stopPropagation();
            e.preventDefault();
            if (!Base_1.Base.userIdentified()) {
                faceboxDisplay('inscription', {}, function () { });
                return;
            }
            var $btn = $(e.currentTarget);
            var params = { type: self._media.mediaType.singular, id: self._media.id };
            if ($btn.hasClass('active')) {
                Base_1.Base.callApi(Base_1.HTTP_VERBS.DELETE, 'comments', 'subscription', params)
                    .then(function (data) {
                    self._parent.is_subscribed = false;
                    displaySubscription($btn);
                });
            }
            else {
                Base_1.Base.callApi(Base_1.HTTP_VERBS.POST, 'comments', 'subscription', params)
                    .then(function (data) {
                    self._parent.is_subscribed = true;
                    displaySubscription($btn);
                });
            }
        });
        displaySubscription($btnSubscribe);
        this._events.push({ elt: $btnSubscribe, event: 'click' });
        // On récupère le bouton de navigation 'précédent'
        var $prevCmt = $title.find('.prev-comment');
        // Si le commentaire est le premier de la liste
        // on ne l'active pas
        if (this.isFirst()) {
            $prevCmt.css('color', 'grey').css('cursor', 'initial');
        }
        else {
            // On active le btn précédent
            $prevCmt.click(function (e) {
                e.stopPropagation();
                e.preventDefault();
                // Il faut tout nettoyer, comme pour la fermeture
                self.cleanEvents();
                // Il faut demander au parent d'afficher le commentaire précédent
                self._parent.getPrevComment(self.id).render();
            });
            this._events.push({ elt: $prevCmt, event: 'click' });
        }
        var $nextCmt = $title.find('.next-comment');
        // Si le commentaire est le dernier de la liste
        // on ne l'active pas
        if (this.isLast()) {
            $nextCmt.css('color', 'grey').css('cursor', 'initial');
        }
        else {
            // On active le btn suivant
            $nextCmt.click(function (e) {
                e.stopPropagation();
                e.preventDefault();
                // Il faut tout nettoyer, comme pour la fermeture
                self.cleanEvents();
                // Il faut demander au parent d'afficher le commentaire suivant
                self._parent.getNextComment(self.id).render();
            });
            this._events.push({ elt: $nextCmt, event: 'click' });
        }
        // On active le lien pour afficher le spoiler
        var $btnSpoiler = $container.find('.view-spoiler');
        if ($btnSpoiler.length > 0) {
            $btnSpoiler.click(function (e) {
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
        var $btnThumb = $container.find('.comments .comment .btnThumb');
        $btnThumb.click(function (e) {
            e.stopPropagation();
            e.preventDefault();
            if (!Base_1.Base.userIdentified()) {
                faceboxDisplay('inscription', {}, function () { });
                return;
            }
            var $btn = jQuery(e.currentTarget);
            var commentId = parseInt($btn.parents('.comment').data('commentId'), 10);
            var verb = Base_1.HTTP_VERBS.POST;
            var vote = $btn.hasClass('btnUpVote') ? 1 : -1;
            var params = { id: commentId, type: vote, switch: false };
            // On a déjà voté
            if (self.thumbed == vote) {
                verb = Base_1.HTTP_VERBS.DELETE;
                params = { id: commentId };
            }
            else if (self.thumbed != 0) {
                console.warn("Le vote est impossible. Annuler votre vote et recommencer");
                return;
            }
            Base_1.Base.callApi(verb, 'comments', 'thumb', params)
                .then(function (data) {
                if (commentId == self.id) {
                    self.thumbs = parseInt(data.comment.thumbs, 10);
                    self.thumbed = data.comment.thumbed ? parseInt(data.comment.thumbed, 10) : 0;
                    self.updateRenderThumbs(vote);
                }
                else if (self.isReply(commentId)) {
                    var reply = self.getReply(commentId);
                    reply.thumbs = parseInt(data.comment.thumbs, 10);
                    reply.thumbed = data.comment.thumbed ? parseInt(data.comment.thumbed, 10) : 0;
                    reply.updateRenderThumbs(vote);
                }
                else {
                    // Demander au parent d'incrémenter les thumbs du commentaire
                    var thumbed = data.comment.thumbed ? parseInt(data.comment.thumbed, 10) : 0;
                    self._parent.changeThumbs(commentId, data.comment.thumbs, thumbed);
                }
                // Petite animation pour le nombre de votes
                $btn.siblings('strong.thumbs')
                    .css('animation', '1s ease 0s 1 normal forwards running backgroundFadeOut');
            })
                .catch(function (err) {
                var msg = err.text !== undefined ? err.text : err;
                Base_1.Base.notification('Vote commentaire', "Une erreur est apparue durant le vote: " + msg);
            });
        });
        this._events.push({ elt: $btnThumb, event: 'click' });
        /**
         * On affiche/masque les options du commentaire
         */
        var $btnOptions = $container.find('.btnToggleOptions');
        if (Base_1.Base.debug)
            console.log('Comment loadEvents toggleOptions.length', $btnOptions.length);
        $btnOptions.click(function (e) {
            e.stopPropagation();
            e.preventDefault();
            jQuery(e.currentTarget).parents(".".concat(CommentBS.classNamesCSS.actions)).first()
                .find('.options-comment').each(function (_index, elt) {
                var $elt = jQuery(elt);
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
        var $btnSend = $container.find('.sendComment');
        $btnSend.click(function (e) {
            e.stopPropagation();
            e.preventDefault();
            if (!Base_1.Base.userIdentified()) {
                faceboxDisplay('inscription', {}, function () { });
                return;
            }
            var $textarea = $(e.currentTarget).siblings('textarea');
            if ($textarea.val().length > 0) {
                var replyId = parseInt($textarea.data('replyTo'), 10);
                var msg = $textarea.val();
                if (replyId && replyId == self.id) {
                    self.reply(msg).then(function (comment) {
                        if (comment) {
                            var template = CommentBS.getTemplateComment(comment);
                            $container.find('.comments').append(template);
                        }
                    });
                }
                else if (replyId) {
                    var reply_1 = self.getReply(replyId);
                    if (reply_1) {
                        reply_1.reply(msg).then(function (comment) {
                            if (comment) {
                                var template = CommentBS.getTemplateComment(comment);
                                $container.find(".comments .comment[data-comment-id=\"".concat(reply_1.id, "\"]"))
                                    .after(template);
                            }
                        });
                    }
                    else {
                        // Allo Houston, on a un problème
                    }
                }
                else {
                    Comments_1.CommentsBS.sendComment(self._media, msg);
                }
                $textarea.val('');
            }
        });
        this._events.push({ elt: $btnSend, event: 'click' });
        /**
         * On active / desactive le bouton d'envoi du commentaire
         * en fonction du contenu du textarea
         */
        var $textarea = $container.find('textarea');
        $textarea.keypress(function (e) {
            var $textarea = $(e.currentTarget);
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
        var $baliseSpoiler = $container.find('.baliseSpoiler');
        $baliseSpoiler.click(function (e) {
            var $textarea = $popup.find('textarea');
            if (/\[spoiler\]/.test($textarea.val())) {
                return;
            }
            var text = '[spoiler]' + $textarea.val() + '[/spoiler]';
            $textarea.val(text);
        });
        this._events.push({ elt: $baliseSpoiler, event: 'click' });
        var $btnReplies = $container.find('.comments .toggleReplies');
        $btnReplies.click(function (e) {
            e.stopPropagation();
            e.preventDefault();
            var $btn = $(e.currentTarget);
            var state = $btn.data('toggle'); // 0: Etat masqué, 1: Etat affiché
            var $comment = $btn.parents('.comment');
            var inner = $comment.data('commentInner');
            var $replies = $comment.parents('.comments').find(".comment[data-comment-reply=\"".concat(inner, "\"]"));
            if (state == '0') {
                // On affiche
                $replies.fadeIn('fast');
                $btn.find('.btnText').text(Base_1.Base.trans("comment.hide_answers"));
                $btn.find('svg').attr('style', 'transition: transform 200ms ease 0s; transform: rotate(180deg);');
                $btn.data('toggle', '1');
            }
            else {
                // On masque
                $replies.fadeOut('fast');
                $btn.find('.btnText').text(Base_1.Base.trans("comment.button.reply", { "%count%": $replies.length.toString() }));
                $btn.find('svg').attr('style', 'transition: transform 200ms ease 0s;');
                $btn.data('toggle', '0');
            }
        });
        this._events.push({ elt: $btnReplies, event: 'click' });
        var $btnResponse = $container.find('.btnResponse');
        $btnResponse.click(function (e) {
            e.stopPropagation();
            e.preventDefault();
            if (!Base_1.Base.userIdentified()) {
                faceboxDisplay('inscription', {}, function () { });
                return;
            }
            var $btn = $(e.currentTarget);
            var $comment = $btn.parents('.comment');
            var commentId = parseInt($comment.data('commentId'), 10);
            var comment;
            // Si il s'agit d'une réponse, il nous faut le commentaire parent
            if ($comment.hasClass('iv_i5') || $comment.hasClass('it_i3')) {
                var $parent = $comment.siblings('.comment:not(.iv_i5)').first();
                var parentId = parseInt($parent.data('commentId'), 10);
                if (commentId == parentId) {
                    comment = self._parent.getComment(commentId);
                }
                else {
                    var cmtParent = self._parent.getComment(parentId);
                    comment = cmtParent.getReply(commentId);
                }
            }
            else {
                comment = self._parent.getComment(commentId);
            }
            $container.find('textarea')
                .val('@' + comment.login)
                .attr('data-reply-to', comment.id);
        });
        this._events.push({ elt: $btnResponse, event: 'click' });
    };
    /**
     * Nettoie les events créer par la fonction loadEvents
     * @param   {Function} onComplete - Fonction de callback
     * @returns {void}
     */
    CommentBS.prototype.cleanEvents = function (onComplete) {
        if (onComplete === void 0) { onComplete = Base_1.Base.noop; }
        if (this._events && this._events.length > 0) {
            var data = void 0;
            for (var e = 0; e < this._events.length; e++) {
                data = this._events[e];
                data.elt.off(data.event);
            }
        }
        onComplete();
    };
    /**
     * Affiche le commentaire dans une dialogbox
     */
    CommentBS.prototype.render = function () {
        return __awaiter(this, void 0, void 0, function () {
            var self, $popup, $contentHtml, $contentReact, $closeButtons, hidePopup, showPopup, $title, templateLoader, l, template, replies, r;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        self = this, $popup = jQuery('#popin-dialog'), $contentHtml = $popup.find(".popin-content-html"), $contentReact = $popup.find('.popin-content-reactmodule'), $closeButtons = $popup.find("#popin-showClose"), hidePopup = function () {
                            document.body.style.overflow = "visible";
                            document.body.style.paddingRight = "";
                            $popup.attr('aria-hidden', 'true');
                            $popup.find("#popupalertyes").show();
                            $popup.find("#popupalertno").show();
                            $contentReact.empty();
                            $contentHtml.hide();
                            self.cleanEvents();
                        }, showPopup = function () {
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
                        $contentReact.empty().append("<div class=\"title\" id=\"dialog-title\" tabindex=\"0\">".concat(Base_1.Base.trans("blog.title.comments"), "</div>"));
                        $title = $contentReact.find('.title');
                        templateLoader = "\n            <div class=\"loaderCmt\">\n                <svg class=\"sr-only\">\n                    <defs>\n                        <clipPath id=\"placeholder\">\n                            <path d=\"M50 25h160v8H50v-8zm0-18h420v8H50V7zM20 40C8.954 40 0 31.046 0 20S8.954 0 20 0s20 8.954 20 20-8.954 20-20 20z\"></path>\n                        </clipPath>\n                    </defs>\n                </svg>\n        ";
                        for (l = 0; l < 4; l++) {
                            templateLoader += "\n                <div class=\"er_ex null\">\n                    <div class=\"ComponentPlaceholder er_et\" style=\"height: 40px;\"></div>\n                </div>";
                        }
                        $contentReact.append(templateLoader + '</div>');
                        showPopup();
                        template = "\n            <div data-media-type=\"".concat(self._media.mediaType.singular, "\"\n                            data-media-id=\"").concat(self._media.id, "\"\n                            class=\"displayFlex flexDirectionColumn\"\n                            style=\"margin-top: 2px; min-height: 0\">");
                        if (Base_1.Base.userIdentified()) {
                            template += "<button type=\"button\" class=\"btn-reset btnSubscribe\" style=\"position: absolute; top: 3px; right: 31px; padding: 8px;\">\n                <span class=\"svgContainer\">\n                    <svg></svg>\n                </span>\n            </button>";
                        }
                        template += '<div class="comments overflowYScroll">' + CommentBS.getTemplateComment(this);
                        if (!(this.nbReplies > 0 && this.replies.length <= 0)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._parent.fetchReplies(this.id)];
                    case 1:
                        replies = _a.sent();
                        if (replies && replies.length > 0) {
                            this.replies = replies;
                        }
                        _a.label = 2;
                    case 2:
                        for (r = this.replies.length - 1; r >= 0; r--) {
                            template += CommentBS.getTemplateComment(this.replies[r]);
                        }
                        template += '</div>';
                        if (this._parent.isOpen() && Base_1.Base.userIdentified()) {
                            template += CommentBS.getTemplateWriting();
                        }
                        template += '</div>';
                        // On définit le type d'affichage de la popup
                        $popup.attr('data-popin-type', 'comments');
                        $contentReact.fadeOut('fast', function () {
                            $contentReact.find('.loaderCmt').remove();
                            // On affiche le titre de la popup
                            // avec des boutons pour naviguer
                            $contentReact.empty().append("<div class=\"title\" id=\"dialog-title\" tabindex=\"0\"></div>");
                            $title = $contentReact.find('.title');
                            $title.append(Base_1.Base.trans("blog.title.comments") + ' <i class="fa fa-chevron-circle-left prev-comment" aria-hidden="true"></i> <i class="fa fa-chevron-circle-right next-comment" aria-hidden="true"></i>');
                            // On ajoute les templates HTML du commentaire,
                            // des réponses et du formulaire de d'écriture
                            $contentReact.append(template);
                            $contentReact.fadeIn();
                            // On active les boutons de l'affichage du commentaire
                            self.loadEvents($contentReact, { hidePopup: hidePopup, showPopup: showPopup });
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Envoie une réponse de ce commentaire à l'API
     * @param   {string} text        Le texte de la réponse
     * @returns {Promise<void | CommentBS>}
     */
    CommentBS.prototype.reply = function (text) {
        var _this = this;
        var params = {
            type: this._media.mediaType.singular,
            id: this._media.id,
            in_reply_to: this.inner_id,
            text: text
        };
        return Base_1.Base.callApi(Base_1.HTTP_VERBS.POST, 'comments', 'comment', params)
            .then(function (data) {
            var comment = new CommentBS(data.comment, _this._parent, _this._media);
            _this.replies.push(comment);
            // _this._parent.comments.push(comment);
            return comment;
        })
            .catch(function (err) {
            Base_1.Base.notification('Commentaire', "Erreur durant l'ajout d'un commentaire");
            console.error(err);
        });
    };
    /**
     * Contient le nom des classes CSS utilisées pour le rendu du commentaire
     * @type Obj
     */
    CommentBS.classNamesCSS = { reply: 'it_i3', actions: 'it_i1', comment: 'it_ix' };
    return CommentBS;
}());

var StarTypes;
(function (StarTypes) {
    StarTypes["EMPTY"] = "empty";
    StarTypes["HALF"] = "half";
    StarTypes["FULL"] = "full";
    StarTypes["DISABLE"] = "disable";
})(StarTypes || (StarTypes = {}));
var Note = /** @class */ (function () {
    function Note(data, parent) {
        this.total = parseInt(data.total, 10);
        this.mean = parseFloat(data.mean);
        this.user = parseInt(data.user, 10);
        this._parent = parent;
    }
    /**
     * Retourne la note moyenne sous forme de pourcentage
     * @returns {number} La note sous forme de pourcentage
     */
    Note.prototype.getPercentage = function () {
        return Math.round(((this.mean / 5) * 100) / 10) * 10;
    };
    /**
     * Retourne l'objet Note sous forme de chaine
     * @returns {string}
     */
    Note.prototype.toString = function () {
        var votes = 'vote' + (this.total > 1 ? 's' : ''), 
        // On met en forme le nombre de votes
        total = new Intl.NumberFormat('fr-FR', { style: 'decimal', useGrouping: true }).format(this.total), 
        // On limite le nombre de chiffre après la virgule
        note = this.mean.toFixed(2);
        var toString = "".concat(total, " ").concat(votes, " : ").concat(note, " / 5");
        // On ajoute la note du membre connecté, si il a voté
        if (this.user > 0) {
            toString += ", votre note: ".concat(this.user);
        }
        return toString;
    };
    /**
     * Crée une popup avec 5 étoiles pour noter le média
     */
    Note.prototype.createPopupForVote = function () {
        if (Base_1.Base.debug)
            console.log('objNote createPopupForVote');
        // La popup et ses éléments
        var _this = this, $popup = jQuery('#popin-dialog'), $contentHtmlElement = $popup.find(".popin-content-html"), $contentReact = $popup.find('.popin-content-reactmodule'), $title = $contentHtmlElement.find(".title"), $text = $popup.find("p"), $closeButtons = $popup.find(".js-close-popupalert"), hidePopup = function () {
            if (Base_1.Base.debug)
                console.log('objNote createPopupForVote hidePopup');
            $popup.attr('aria-hidden', 'true');
            $contentHtmlElement.find(".button-set").show();
            $contentHtmlElement.hide();
            // On désactive les events
            $text.find('.star-svg').off('mouseenter').off('mouseleave').off('click');
        }, showPopup = function () {
            if (Base_1.Base.debug)
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
        var template = '<div style="display: flex; justify-content: center; margin-bottom: 15px;"><div role="button" tabindex="0" class="stars btn-reset">', className;
        for (var i = 1; i <= 5; i++) {
            className = this.user <= i - 1 ? StarTypes.EMPTY : StarTypes.FULL;
            template += "\n                <svg viewBox=\"0 0 100 100\" class=\"star-svg\" data-number=\"".concat(i, "\" style=\"width: 30px; height: 30px;\">\n                    <use xlink:href=\"#icon-starblue-").concat(className, "\"></use>\n                </svg>");
        }
        // On vide la popup et on ajoute les étoiles
        $text.empty().append(template + '</div></div>');
        var title = 'Noter ';
        switch (this._parent.mediaType.singular) {
            case Base_1.MediaType.show:
                title += 'la série';
                break;
            case Base_1.MediaType.movie:
                title += 'le film';
                break;
            case Base_1.MediaType.episode:
                title += "l'épisode";
                break;
            default:
                break;
        }
        $title.empty().text(title);
        $closeButtons.click(function () {
            hidePopup();
            $popup.removeAttr('data-popin-type');
        });
        // On ajoute les events sur les étoiles
        var updateStars = function (evt, note) {
            var $stars = jQuery(evt.currentTarget).parent().find('.star-svg use');
            var className;
            for (var s = 0; s < 5; s++) {
                className = (s <= note - 1) ? StarTypes.FULL : StarTypes.EMPTY;
                $($stars.get(s)).attr('xlink:href', "#icon-starblue-".concat(className));
            }
        };
        $text.find('.star-svg').mouseenter(function (e) {
            var note = parseInt($(e.currentTarget).data('number'), 10);
            updateStars(e, note);
        });
        $text.find('.star-svg').mouseleave(function (e) {
            updateStars(e, _this.user);
        });
        $text.find('.star-svg').click(function (e) {
            var note = parseInt(jQuery(e.currentTarget).data('number'), 10), $stars = jQuery(e.currentTarget).parent().find('.star-svg');
            // On supprime les events
            $stars.off('mouseenter').off('mouseleave');
            _this._parent.addVote(note)
                .then(function (result) {
                hidePopup();
                if (result) {
                    // TODO: Mettre à jour la note du média
                    _this._parent.changeTitleNote(true);
                }
                else {
                    Base_1.Base.notification('Erreur Vote', "Une erreur s'est produite durant le vote");
                }
            })
                .catch(function () { return hidePopup(); });
        });
        // On affiche la popup
        showPopup();
    };
    /**
     * Met à jour l'affichage de la note
     */
    Note.prototype.updateStars = function (elt) {
        if (elt === void 0) { elt = null; }
        elt = elt || jQuery('.blockInformations__metadatas .js-render-stars');
        var $stars = elt.find('.star-svg use');
        var className;
        for (var s = 0; s < 5; s++) {
            className = (this.mean <= s) ? StarTypes.EMPTY : (this.mean < s + 1) ? StarTypes.HALF : StarTypes.FULL;
            $($stars.get(s)).attr('xlink:href', "#icon-star-".concat(className));
        }
    };
    /**
     * Retourne la template pour l'affichage d'une note sous forme d'étoiles
     * @param   {number} [note=0] - La note à afficher
     * @param   {string} [color] - La couleur des étoiles
     * @returns {string}
     */
    Note.renderStars = function (note, color) {
        if (note === void 0) { note = 0; }
        if (color === void 0) { color = ''; }
        var typeSvg, template = '';
        Array.from({
            length: 5
        }, function (_index, number) {
            typeSvg = note <= number ? "empty" : (note < number + 1) ? 'half' : "full";
            template += "\n                <svg viewBox=\"0 0 100 100\" class=\"star-svg\">\n                    <use xmlns:xlink=\"http://www.w3.org/1999/xlink\"\n                        xlink:href=\"#icon-star".concat(color, "-").concat(typeSvg, "\">\n                    </use>\n                </svg>\n            ");
        });
        return template;
    };
    return Note;
}());

var Next = /** @class */ (function () {
    function Next(data) {
        this.id = (data.id !== undefined) ? parseInt(data.id, 10) : NaN;
        this.code = data.code;
        this.date = new Date(data.date);
        this.title = data.title;
        this.image = data.image;
    }
    return Next;
}());
var User = /** @class */ (function () {
    function User(data) {
        this.archived = data.archived || false;
        this.downloaded = data.downloaded || false;
        this.favorited = data.favorited || false;
        this.friends_want_to_watch = data.friends_want_to_watch || [];
        this.friends_watched = data.friends_watched || [];
        this.hidden = data.hidden || false;
        this.last = data.last || '';
        this.mail = data.mail || false;
        this.next = null;
        if (data.next !== undefined) {
            this.next = new Next(data.next);
        }
        this.profile = data.profile || '';
        this.remaining = data.remaining || 0;
        this.seen = data.seen || false;
        this.status = (data.status !== undefined) ? parseInt(data.status, 10) : 0;
        this.tags = data.tags || '';
        this.twitter = data.twitter || false;
    }
    return User;
}());

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
var EventTypes;
(function (EventTypes) {
    EventTypes["UPDATE"] = "update";
    EventTypes["SAVE"] = "save";
    EventTypes["ADD"] = "add";
    EventTypes["REMOVE"] = "remove";
    EventTypes["NOTE"] = "note";
})(EventTypes = EventTypes || (EventTypes = {}));
var HTTP_VERBS;
(function (HTTP_VERBS) {
    HTTP_VERBS["GET"] = "GET";
    HTTP_VERBS["POST"] = "POST";
    HTTP_VERBS["PUT"] = "PUT";
    HTTP_VERBS["DELETE"] = "DELETE";
    HTTP_VERBS["OPTIONS"] = "OPTIONS";
})(HTTP_VERBS = HTTP_VERBS || (HTTP_VERBS = {}));
var Base = /** @class */ (function () {
    /*
                    METHODS
    */
    function Base(data) {
        if (!(data instanceof Object)) {
            throw new Error("data is not an object");
        }
        this._initListeners();
        return this;
    }
    /**
     * Fonction d'authentification sur l'API BetaSeries
     *
     * @return {Promise}
     */
    Base.authenticate = function () {
        if (Base.debug)
            console.log('authenticate');
        if (jQuery('#containerIframe').length <= 0) {
            jQuery('body').append("\n                <div id=\"containerIframe\">\n                <iframe id=\"userscript\"\n                        name=\"userscript\"\n                        title=\"Connexion \u00E0 BetaSeries\"\n                        width=\"50%\"\n                        height=\"400\"\n                        src=\"".concat(Base.serverBaseUrl, "/index.html\"\n                        style=\"background:white;margin:auto;\">\n                </iframe>\n                </div>'\n            "));
        }
        return new Promise(function (resolve, reject) {
            function receiveMessage(event) {
                var origin = new URL(Base.serverBaseUrl).origin;
                // if (debug) console.log('receiveMessage', event);
                if (event.origin !== origin) {
                    if (Base.debug)
                        console.error('receiveMessage {origin: %s}', event.origin, event);
                    reject("event.origin is not ".concat(origin));
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
    };
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
    Base.callApi = function (type, resource, action, args, force) {
        if (force === void 0) { force = false; }
        if (Base.api && Base.api.resources.indexOf(resource) === -1) {
            throw new Error("Ressource (".concat(resource, ") inconnue dans l'API."));
        }
        if (!Base.userKey) {
            Base.notification('Call API', "La cl\u00E9 API doit \u00EAtre renseign\u00E9e");
            throw new Error('userKey are required');
        }
        if (!Base.token && resource in Base.api.tokenRequired &&
            action in Base.api.tokenRequired[resource] &&
            Base.api.tokenRequired[resource][action].indexOf(type) !== 1) {
            Base.notification('Call API', "Identification requise pour cet appel: ".concat(type, " ").concat(resource, "/").concat(action));
            // Identification required
            throw new ExceptionIdentification("Identification required");
        }
        var check = false, 
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
            return new Promise(function (resolve) {
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
            var initFetch = {
                method: type,
                headers: myHeaders,
                mode: 'cors',
                cache: 'no-cache'
            };
            var uri = "".concat(Base.api.url, "/").concat(resource, "/").concat(action);
            var keys = Object.keys(args);
            // On crée l'URL de la requête de type GET avec les paramètres
            if (type === 'GET' && keys.length > 0) {
                var params = [];
                for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
                    var key = keys_1[_i];
                    params.push(key + '=' + encodeURIComponent(args[key]));
                }
                uri += '?' + params.join('&');
            }
            else if (keys.length > 0) {
                initFetch.body = new URLSearchParams(args);
            }
            fetch(uri, initFetch).then(function (response) {
                Base.counter++; // Incrément du compteur de requêtes à l'API
                if (Base.debug)
                    console.log('fetch (%s %s) response status: %d', type, uri, response.status);
                // On récupère les données et les transforme en objet
                response.json().then(function (data) {
                    if (Base.debug)
                        console.log('fetch (%s %s) data', type, uri, data);
                    // On gère le retour d'erreurs de l'API
                    if (data.errors !== undefined && data.errors.length > 0) {
                        var code = data.errors[0].code, text = data.errors[0].text;
                        if (code === 2005 ||
                            (response.status === 400 && code === 0 &&
                                text === "L'utilisateur a déjà marqué cet épisode comme vu.")) {
                            reject('changeStatus');
                        }
                        else if (code == 2001) {
                            // Appel de l'authentification pour obtenir un token valide
                            Base.authenticate().then(function () {
                                Base.callApi(type, resource, action, args, force)
                                    .then(function (data) { return resolve(data); }, function (err) { return reject(err); });
                            }, function (err) {
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
            }).catch(function (error) {
                if (Base.debug)
                    console.log('Il y a eu un problème avec l\'opération fetch: ' + error.message);
                console.error(error);
                reject(error.message);
            });
        }
        return new Promise(function (resolve, reject) {
            if (check) {
                var paramsFetch = {
                    method: 'GET',
                    headers: myHeaders,
                    mode: 'cors',
                    cache: 'no-cache'
                };
                if (Base.debug)
                    console.info('%ccall /members/is_active', 'color:blue');
                fetch("".concat(Base.api.url, "/members/is_active"), paramsFetch).then(function (resp) {
                    Base.counter++; // Incrément du compteur de requêtes à l'API
                    if (!resp.ok) {
                        // Appel de l'authentification pour obtenir un token valide
                        Base.authenticate().then(function () {
                            // On met à jour le token pour le prochain appel à l'API
                            myHeaders['X-BetaSeries-Token'] = Base.token;
                            fetchUri(resolve, reject);
                        }).catch(function (err) { return reject(err); });
                        return;
                    }
                    fetchUri(resolve, reject);
                }).catch(function (error) {
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
    };
    /**
     * Remplit l'objet avec les données fournit en paramètre
     * @param  {Obj} data - Les données provenant de l'API
     * @returns {Base}
     * @virtual
     */
    Base.prototype.fill = function (data) {
        this.id = parseInt(data.id, 10);
        this.characters = [];
        if (data.characters && data.characters instanceof Array) {
            for (var c = 0; c < data.characters.length; c++) {
                this.characters.push(new Character_1.Character(data.characters[c]));
            }
        }
        var nbComments = data.comments ? parseInt(data.comments, 10) : 0;
        this.comments = new Comments_1.CommentsBS(nbComments, this);
        this.objNote = (data.note) ? new Note_1.Note(data.note, this) : new Note_1.Note(data.notes, this);
        this.resource_url = data.resource_url;
        this.title = data.title;
        this.user = new User_1.User(data.user);
        this.description = data.description;
        return this;
    };
    Object.defineProperty(Base.prototype, "nbComments", {
        /**
         * Retourne le nombre de commentaires pour ce média sur l'API
         * @readonly
         */
        get: function () {
            return this.comments.nbComments;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Initialize le tableau des écouteurs d'évènements
     * @returns {Base}
     * @sealed
     */
    Base.prototype._initListeners = function () {
        this._listeners = {};
        var EvtTypes = this.constructor.EventTypes;
        for (var e = 0; e < EvtTypes.length; e++) {
            this._listeners[EvtTypes[e]] = new Array();
        }
        return this;
    };
    /**
     * Permet d'ajouter un listener sur un type d'évenement
     * @param  {EventTypes} name - Le type d'évenement
     * @param  {Function}   fn   - La fonction à appeler
     * @return {Base} L'instance du média
     * @sealed
     */
    Base.prototype.addListener = function (name, fn) {
        // On vérifie que le type d'event est pris en charge
        if (this.constructor.EventTypes.indexOf(name) < 0) {
            throw new Error("".concat(name, " ne fait pas partit des events g\u00E9r\u00E9s par cette classe"));
        }
        if (this._listeners[name] === undefined) {
            this._listeners[name] = new Array();
        }
        this._listeners[name].push(fn);
        return this;
    };
    /**
     * Permet de supprimer un listener sur un type d'évenement
     * @param  {string}   name - Le type d'évenement
     * @param  {Function} fn   - La fonction qui était appelée
     * @return {Base} L'instance du média
     * @sealed
     */
    Base.prototype.removeListener = function (name, fn) {
        if (this._listeners[name] !== undefined) {
            for (var l = 0; l < this._listeners[name].length; l++) {
                if (this._listeners[name][l] === fn)
                    this._listeners[name].splice(l, 1);
            }
        }
        return this;
    };
    /**
     * Appel les listeners pour un type d'évenement
     * @param  {EventTypes} name - Le type d'évenement
     * @return {Base} L'instance du média
     * @sealed
     */
    Base.prototype._callListeners = function (name) {
        if (this._listeners[name] !== undefined) {
            for (var l = 0; l < this._listeners[name].length; l++) {
                this._listeners[name][l].call(this, this);
            }
        }
        return this;
    };
    /**
     * Sauvegarde l'objet en cache
     * @return {Base} L'instance du média
     */
    Base.prototype.save = function () {
        if (Base.cache instanceof Cache_1.CacheUS) {
            Base.cache.set(this.mediaType.plural, this.id, this);
            this._callListeners(EventTypes.SAVE);
        }
        return this;
    };
    Object.defineProperty(Base.prototype, "elt", {
        /**
         * Retourne le DOMElement correspondant au média
         * @returns {JQuery} Le DOMElement jQuery
         */
        get: function () {
            return this._elt;
        },
        /**
         * Définit le DOMElement de référence pour ce média
         * @param  {JQuery} elt - DOMElement auquel est rattaché le média
         */
        set: function (elt) {
            this._elt = elt;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Base.prototype, "nbCharacters", {
        /**
         * Retourne le nombre d'acteurs référencés dans ce média
         * @returns {number}
         */
        get: function () {
            return this.characters.length;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Décode le titre de la page
     * @return {Base} L'instance du média
     */
    Base.prototype.decodeTitle = function () {
        var $elt = this.elt.find('.blockInformations__title'), title = $elt.text();
        if (/&#/.test(title)) {
            $elt.text($('<textarea />').html(title).text());
        }
        return this;
    };
    /**
     * Ajoute le nombre de votes à la note dans l'attribut title de la balise
     * contenant la représentation de la note de la ressource
     *
     * @param  {Boolean} [change=true] - Indique si on doit changer l'attribut title du DOMElement
     * @return {String} Le titre modifié de la note
     */
    Base.prototype.changeTitleNote = function (change) {
        if (change === void 0) { change = true; }
        var $elt = this.elt.find('.js-render-stars');
        if (this.objNote.mean <= 0 || this.objNote.total <= 0) {
            if (change)
                $elt.attr('title', 'Aucun vote');
            return;
        }
        var votes = 'vote' + (this.objNote.total > 1 ? 's' : ''), 
        // On met en forme le nombre de votes
        total = new Intl.NumberFormat('fr-FR', { style: 'decimal', useGrouping: true })
            .format(this.objNote.total), 
        // On limite le nombre de chiffre après la virgule
        note = this.objNote.mean.toFixed(1);
        var title = "".concat(total, " ").concat(votes, " : ").concat(note, " / 5");
        // On ajoute la note du membre connecté, si il a voté
        if (Base.userIdentified() && this.objNote.user > 0) {
            title += ", votre note: ".concat(this.objNote.user);
        }
        if (change) {
            $elt.attr('title', title);
        }
        return title;
    };
    /**
     * Ajoute le nombre de votes à la note de la ressource
     * @return {Base} L'instance du média
     */
    Base.prototype.addNumberVoters = function () {
        var _this = this;
        var votes = $('.stars.js-render-stars'); // ElementHTML ayant pour attribut le titre avec la note de la série
        var title = this.changeTitleNote(true);
        // if (Base.debug) console.log('addNumberVoters - title: %s', title);
        // On ajoute un observer sur l'attribut title de la note, en cas de changement lors d'un vote
        new MutationObserver(function (mutationsList) {
            var changeTitleMutation = function () {
                // On met à jour le nombre de votants, ainsi que la note du membre connecté
                var upTitle = _this.changeTitleNote(false);
                // if (Base.debug) console.log('Observer upTitle: %s', upTitle);
                // On évite une boucle infinie
                if (upTitle !== title) {
                    votes.attr('title', upTitle);
                    title = upTitle;
                }
            };
            var mutation;
            for (var _i = 0, mutationsList_1 = mutationsList; _i < mutationsList_1.length; _i++) {
                mutation = mutationsList_1[_i];
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
    };
    /**
     * Ajoute une note au média
     * @param   {number} note - Note du membre connecté pour le média
     * @returns {Promise<boolean>}
     */
    Base.prototype.addVote = function (note) {
        var _this_1 = this;
        var _this = this;
        return new Promise(function (resolve, reject) {
            Base.callApi(HTTP_VERBS.POST, _this_1.mediaType.plural, 'note', { id: _this_1.id, note: note })
                .then(function (data) {
                _this.fill(data[_this_1.mediaType.singular])._callListeners(EventTypes.NOTE);
                resolve(true);
            })
                .catch(function (err) {
                Base.notification('Erreur de vote', 'Une erreur s\'est produite lors de l\'envoi de la note: ' + err);
                reject(err);
            });
        });
    };
    /*
                    STATIC
    */
    /**
     * Flag de debug pour le dev
     * @type {boolean}
     */
    Base.debug = false;
    /**
     * L'objet cache du script pour stocker les données
     * @type {CacheUS}
     */
    Base.cache = null;
    /**
     * Objet contenant les informations de l'API
     * @type {*}
     */
    Base.api = {
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
    Base.token = null;
    /**
     * La clé d'utilisation de l'API
     * @type {String}
     */
    Base.userKey = null;
    /**
     * L'identifiant du membre connecté
     * @type {Number}
     */
    Base.userId = null;
    /**
     * Clé pour l'API TheMovieDB
     * @type {string}
     */
    Base.themoviedb_api_user_key = null;
    /**
     * Le nombre d'appels à l'API
     * @type {Number}
     */
    Base.counter = 0;
    /**
     * L'URL de base du serveur contenant les ressources statiques
     * @type {String}
     */
    Base.serverBaseUrl = '';
    /**
     * Indique le theme d'affichage du site Web (light or dark)
     * @type {string}
     */
    Base.theme = 'light';
    /**
     * Fonction de notification sur la page Web
     * @type {Function}
     */
    Base.notification = function () { };
    /**
     * Fonction pour vérifier que le membre est connecté
     * @type {Function}
     */
    Base.userIdentified = function () { };
    /**
     * Fonction vide
     * @type {Function}
     */
    Base.noop = function () { };
    /**
     * Fonction de traduction de chaînes de caractères
     * @param   {String}  msg  - Identifiant de la chaîne à traduire
     * @param   {Obj}     [params={}] - Variables utilisées dans la traduction {"%key%"": value}
     * @param   {number}  [count=1] - Nombre d'éléments pour la version plural
     * @returns {string}
     */
    // eslint-disable-next-line no-unused-vars
    Base.trans = function (msg, params, count) {
        if (params === void 0) { params = {}; }
        if (count === void 0) { count = 1; }
    };
    /**
     * Contient les infos sur les différentes classification TV et cinéma
     * @type {Ratings}
     */
    Base.ratings = null;
    /**
     * Types d'évenements gérés par cette classe
     * @type {Array}
     */
    Base.EventTypes = new Array(EventTypes.UPDATE, EventTypes.SAVE);
    return Base;
}());

var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Media = /** @class */ (function (_super) {
    __extends(Media, _super);
    function Media(data) {
        var _this = _super.call(this, data) || this;
        return _this;
    }
    /**
     * Remplit l'objet avec les données fournit en paramètre
     * @param  {Obj} data Les données provenant de l'API
     * @returns {Media}
     * @override
     */
    Media.prototype.fill = function (data) {
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
            for (var g in data.genres) {
                this.genres.push(data.genres[g]);
            }
        }
        this.in_account = data.in_account;
        _super.prototype.fill.call(this, data);
        return this;
    };
    Object.defineProperty(Media.prototype, "in_account", {
        /**
         * Indique si le média est enregistré sur le compte du membre
         * @returns {boolean}
         */
        get: function () {
            return this._in_account;
        },
        /**
         * Définit si le média est enregistré sur le compte du membre
         * @param {boolean} i Flag
         */
        set: function (i) {
            this._in_account = !!i;
            this.save();
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Retourne les similars associés au media
     * @return {Promise<Media>}
     */
    Media.prototype.fetchSimilars = function () {
        var _this = this;
        return new Promise(function (resolve) { return resolve(_this); });
    };
    /**
     * Retourne le similar correspondant à l'identifiant
     * @abstract
     * @param  {number} id      L'identifiant du similar
     * @return {Similar|void}   Le similar ou null
     */
    Media.prototype.getSimilar = function (id) {
        if (!this.similars)
            return null;
        for (var s = 0; s < this.similars.length; s++) {
            if (this.similars[s].id === id) {
                return this.similars[s];
            }
        }
        return null;
    };
    return Media;
}(Base_1.Base));

var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Images = /** @class */ (function () {
    function Images(data) {
        this.show = data.show;
        this.banner = data.banner;
        this.box = data.box;
        this.poster = data.poster;
    }
    return Images;
}());
var Picked;
(function (Picked) {
    Picked[Picked["none"] = 0] = "none";
    Picked[Picked["banner"] = 1] = "banner";
    Picked[Picked["show"] = 2] = "show";
})(Picked = Picked || (Picked = {}));
// eslint-disable-next-line no-unused-vars
var Picture = /** @class */ (function () {
    function Picture(data) {
        this.id = parseInt(data.id, 10);
        this.show_id = parseInt(data.show_id, 10);
        this.login_id = parseInt(data.login_id, 10);
        this.url = data.url;
        this.width = parseInt(data.width, 10);
        this.height = parseInt(data.height, 10);
        this.date = new Date(data.date);
        this.picked = data.picked;
    }
    return Picture;
}());
var Platform = /** @class */ (function () {
    function Platform(data) {
        this.id = parseInt(data.id, 10);
        this.name = data.name;
        this.tag = data.tag;
        this.link_url = data.link_url;
        this.available = data.available;
        this.logo = data.logo;
    }
    return Platform;
}());
var Platforms = /** @class */ (function () {
    function Platforms(data) {
        if (data.svods && data.svods instanceof Array) {
            this.svods = new Array();
            for (var s = 0; s < data.svods.length; s++) {
                this.svods.push(new Platform(data.svods[s]));
            }
        }
        if (data.svod) {
            this.svod = new Platform(data.svod);
        }
    }
    return Platforms;
}());
var Showrunner = /** @class */ (function () {
    function Showrunner(data) {
        this.id = data.id ? parseInt(data.id, 10) : null;
        this.name = data.name;
        this.picture = data.picture;
    }
    return Showrunner;
}());
var Show = /** @class */ (function (_super) {
    __extends(Show, _super);
    /***************************************************/
    /*                      METHODS                    */
    /***************************************************/
    function Show(data, element) {
        var _this_1 = _super.call(this, data) || this;
        _this_1.elt = element;
        return _this_1.fill(data)._init();
    }
    /**
     * Methode static servant à retourner un objet show
     * à partir de son ID
     * @param  {number} id             L'identifiant de la série
     * @param  {boolean} [force=false] Indique si on utilise le cache ou non
     * @return {Promise<Show>}
     */
    Show.fetch = function (id, force) {
        if (force === void 0) { force = false; }
        return new Promise(function (resolve, reject) {
            Base_1.Base.callApi('GET', 'shows', 'display', { id: id }, force)
                .then(function (data) { return resolve(new Show(data, jQuery('.blockInformations'))); })
                .catch(function (err) { return reject(err); });
        });
    };
    /**
     * Initialise l'objet lors de sa construction et après son remplissage
     * @returns {Show}
     */
    Show.prototype._init = function () {
        // On gère l'ajout et la suppression de la série dans le compte utilisateur
        if (this.in_account) {
            this.deleteShowClick();
        }
        else {
            this.addShowClick();
        }
        return this;
    };
    /**
     * Récupère les données de la série sur l'API
     * @param  {boolean} [force=true]   Indique si on utilise les données en cache
     * @return {Promise<*>}             Les données de la série
     */
    Show.prototype.fetch = function (force) {
        if (force === void 0) { force = true; }
        return Base_1.Base.callApi('GET', 'shows', 'display', { id: this.id }, force);
    };
    /**
     * isEnded - Indique si la série est terminée
     *
     * @return {boolean}  Terminée ou non
     */
    Show.prototype.isEnded = function () {
        return (this.status.toLowerCase() === 'ended') ? true : false;
    };
    /**
     * isArchived - Indique si la série est archivée
     *
     * @return {boolean}  Archivée ou non
     */
    Show.prototype.isArchived = function () {
        return this.user.archived;
    };
    /**
     * isFavorite - Indique si la série est dans les favoris
     *
     * @returns {boolean}
     */
    Show.prototype.isFavorite = function () {
        return this.user.favorited;
    };
    /**
     * addToAccount - Ajout la série sur le compte du membre connecté
     * @return {Promise<Show>} Promise of show
     */
    Show.prototype.addToAccount = function () {
        var _this = this;
        if (this.in_account)
            return new Promise(function (resolve) { return resolve(_this); });
        return new Promise(function (resolve, reject) {
            Base_1.Base.callApi('POST', 'shows', 'show', { id: _this.id })
                .then(function (data) {
                _this.fill(data.show);
                _this._callListeners(Base_1.EventTypes.ADD);
                _this.save();
                resolve(_this);
            }, function (err) {
                reject(err);
            });
        });
    };
    /**
     * Remove Show from account member
     * @return {Promise<Show>} Promise of show
     */
    Show.prototype.removeFromAccount = function () {
        var _this_1 = this;
        var _this = this;
        if (!this.in_account)
            return new Promise(function (resolve) { return resolve(_this); });
        return new Promise(function (resolve, reject) {
            Base_1.Base.callApi('DELETE', 'shows', 'show', { id: _this.id })
                .then(function (data) {
                _this.fill(data.show);
                _this._callListeners(Base_1.EventTypes.REMOVE);
                _this.save();
                resolve(_this_1);
            }, function (err) {
                reject(err);
            });
        });
    };
    /**
     * Archive la série
     * @return {Promise<Show>} Promise of show
     */
    Show.prototype.archive = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            Media_1.Media.callApi('POST', 'shows', 'archive', { id: _this.id })
                .then(function (data) {
                _this.fill(data.show);
                _this.save();
                resolve(_this);
            }, function (err) {
                reject(err);
            });
        });
    };
    /**
     * Désarchive la série
     * @return {Promise<Show>} Promise of show
     */
    Show.prototype.unarchive = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            Media_1.Media.callApi('DELETE', 'shows', 'archive', { id: _this.id })
                .then(function (data) {
                _this.fill(data.show);
                _this.save();
                resolve(_this);
            }, function (err) {
                reject(err);
            });
        });
    };
    /**
     * Ajoute la série aux favoris
     * @return {Promise<Show>} Promise of show
     */
    Show.prototype.favorite = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            Media_1.Media.callApi('POST', 'shows', 'favorite', { id: _this.id })
                .then(function (data) {
                _this.fill(data.show);
                _this.save();
                resolve(_this);
            }, function (err) {
                reject(err);
            });
        });
    };
    /**
     * Supprime la série des favoris
     * @return {Promise<Show>} Promise of show
     */
    Show.prototype.unfavorite = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            Media_1.Media.callApi('DELETE', 'shows', 'favorite', { id: _this.id })
                .then(function (data) {
                _this.fill(data.show);
                _this.save();
                resolve(_this);
            }, function (err) {
                reject(err);
            });
        });
    };
    /**
     * Met à jour les données de la série
     * @param  {Boolean}  [force=false] Forcer la récupération des données sur l'API
     * @param  {Function} [cb=noop]     Fonction de callback
     * @return {Promise<Show>}          Promesse (Show)
     */
    Show.prototype.update = function (force, cb) {
        if (force === void 0) { force = false; }
        if (cb === void 0) { cb = Base_1.Base.noop; }
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.fetch(force).then(function (data) {
                _this.fill(data.show);
                _this.updateRender(function () {
                    resolve(_this);
                    cb();
                    _this._callListeners(Base_1.EventTypes.UPDATE);
                });
            })
                .catch(function (err) {
                Media_1.Media.notification('Erreur de récupération de la ressource Show', 'Show update: ' + err);
                reject(err);
                cb();
            });
        });
    };
    /**
     * Met à jour le rendu de la barre de progression
     * et du prochain épisode
     * @param  {Function} cb Fonction de callback
     * @return {void}
     */
    Show.prototype.updateRender = function (cb) {
        if (cb === void 0) { cb = Base_1.Base.noop; }
        var self = this;
        this.updateProgressBar();
        this.updateNextEpisode();
        var note = this.objNote;
        if (Base_1.Base.debug) {
            console.log('Next ID et status', {
                next: this.user.next.id,
                status: this.status,
                archived: this.user.archived,
                note_user: note.user
            });
        }
        // Si il n'y a plus d'épisodes à regarder
        if (this.user.remaining === 0 && this.in_account) {
            var promise = new Promise(function (resolve) { return resolve(void 0); });
            // On propose d'archiver si la série n'est plus en production
            if (this.in_account && this.isEnded() && !this.isArchived()) {
                if (Base_1.Base.debug)
                    console.log('Série terminée, popup confirmation archivage');
                promise = new Promise(function (resolve) {
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
                if (Base_1.Base.debug)
                    console.log('Proposition de voter pour la série');
                promise.then(function () {
                    var retourCallback = false;
                    // eslint-disable-next-line no-undef
                    new PopupAlert({
                        title: Base_1.Base.trans("popin.note.title.show"),
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
            promise.then(function () { cb(); });
        }
        else {
            cb();
        }
    };
    /**
     * Met à jour la barre de progression de visionnage de la série
     * @return {void}
     */
    Show.prototype.updateProgressBar = function () {
        if (Base_1.Base.debug)
            console.log('updateProgressBar');
        // On met à jour la barre de progression
        jQuery('.progressBarShow').css('width', this.user.status.toFixed(1) + '%');
    };
    /**
     * Met à jour le bloc du prochain épisode à voir
     * @param   {Function} [cb=noop] Fonction de callback
     * @returns {void}
     */
    Show.prototype.updateNextEpisode = function (cb) {
        if (cb === void 0) { cb = Base_1.Base.noop; }
        if (Base_1.Base.debug)
            console.log('updateNextEpisode');
        var $nextEpisode = jQuery('a.blockNextEpisode');
        if ($nextEpisode.length > 0 && this.user.next && !isNaN(this.user.next.id)) {
            if (Base_1.Base.debug)
                console.log('nextEpisode et show.user.next OK', this.user);
            // Modifier l'image
            var $img = $nextEpisode.find('img'), $remaining = $nextEpisode.find('.remaining div'), $parent = $img.parent('div'), height = $img.attr('height'), width = $img.attr('width'), next = this.user.next, src = "".concat(Base_1.Base.api.url, "/pictures/episodes?key=").concat(Base_1.Base.userKey, "&id=").concat(next.id, "&width=").concat(width, "&height=").concat(height);
            $img.remove();
            $parent.append("<img src=\"".concat(src, "\" height=\"").concat(height, "\" width=\"").concat(width, "\" />"));
            // Modifier le titre
            $nextEpisode.find('.titleEpisode').text("".concat(next.code.toUpperCase(), " - ").concat(next.title));
            // Modifier le lien
            $nextEpisode.attr('href', $nextEpisode.attr('href').replace(/s\d{2}e\d{2}/, next.code.toLowerCase()));
            // Modifier le nombre d'épisodes restants
            $remaining.text($remaining.text().trim().replace(/^\d+/, this.user.remaining.toString()));
        }
        else if ($nextEpisode.length <= 0 && this.user.next && !isNaN(this.user.next.id)) {
            if (Base_1.Base.debug)
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
            var height = 70, width = 124, src = "".concat(Base_1.Base.api.url, "/pictures/episodes?key=").concat(Base_1.Base.userKey, "&id=").concat(res.user.next.id, "&width=").concat(width, "&height=").concat(height), serieTitle = res.resource_url.split('/').pop();
            jQuery('.blockInformations__actions').after("<a href=\"/episode/".concat(serieTitle, "/").concat(res.user.next.code.toLowerCase(), "\" class=\"blockNextEpisode media\">\n                    <div class=\"media-left\">\n                    <div class=\"u-insideBorderOpacity u-insideBorderOpacity--01\">\n                        <img src=\"").concat(src, "\" width=\"").concat(width, "\" height=\"").concat(height, "\">\n                    </div>\n                    </div>\n                    <div class=\"media-body\">\n                    <div class=\"title\">\n                        <strong>Prochain \u00E9pisode \u00E0 regarder</strong>\n                    </div>\n                    <div class=\"titleEpisode\">\n                        ").concat(res.user.next.code.toUpperCase(), " - ").concat(res.user.next.title, "\n                    </div>\n                    <div class=\"remaining\">\n                        <div class=\"u-colorWhiteOpacity05\">").concat(res.user.remaining, " \u00E9pisode").concat((res.user.remaining > 1) ? 's' : '', " \u00E0 regarder</div>\n                    </div>\n                    </div>\n                </a>"));
        }
    };
    /**
     * On gère l'ajout de la série dans le compte utilisateur
     *
     * @param   {boolean} trigEpisode Flag indiquant si l'appel vient d'un episode vu ou du bouton
     * @returns {void}
     */
    Show.prototype.addShowClick = function (trigEpisode) {
        if (trigEpisode === void 0) { trigEpisode = false; }
        var _this = this;
        var vignettes = $('#episodes .slide__image');
        // Vérifier si le membre a ajouter la série à son compte
        if (!this.in_account) {
            // Remplacer le DOMElement supprime l'eventHandler
            jQuery('#reactjs-show-actions').html("\n                <div class=\"blockInformations__action\">\n                    <button class=\"btn-reset btn-transparent\" type=\"button\">\n                    <span class=\"svgContainer\">\n                        <svg fill=\"#0D151C\" width=\"14\" height=\"14\" xmlns=\"http://www.w3.org/2000/svg\">\n                        <path d=\"M14 8H8v6H6V8H0V6h6V0h2v6h6z\" fill-rule=\"nonzero\"></path>\n                        </svg>\n                    </span>\n                    </button>\n                    <div class=\"label\">Ajouter</div>\n                </div>");
            // On ajoute un event click pour masquer les vignettes
            jQuery('#reactjs-show-actions > div > button').off('click').one('click', function (e) {
                e.stopPropagation();
                e.preventDefault();
                if (Base_1.Base.debug)
                    console.groupCollapsed('AddShow');
                var done = function () {
                    // On met à jour les boutons Archiver et Favori
                    changeBtnAdd(_this);
                    // On met à jour le bloc du prochain épisode à voir
                    _this.updateNextEpisode(function () {
                        if (Base_1.Base.debug)
                            console.groupEnd();
                    });
                };
                _this.addToAccount()
                    .then(function () { return done(); }, function (err) {
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
            var $optionsLinks = $('#dropdownOptions').siblings('.dropdown-menu').children('a.header-navigation-item');
            if ($optionsLinks.length <= 2) {
                var react_id = jQuery('script[id^="/reactjs/"]').get(0).id.split('.')[1], urlShow = show.resource_url.substring(location.origin.length), title = show.title.replace(/"/g, '\\"').replace(/'/g, "\\'"), templateOpts = "\n                            <button type=\"button\" class=\"btn-reset header-navigation-item\" onclick=\"new PopupAlert({\n                            showClose: true,\n                            type: \"popin-subtitles\",\n                            reactModuleId: \"reactjs-subtitles\",\n                            params: {\n                                mediaId: \"".concat(show.id, "\",\n                                type: \"show\",\n                                titlePopin: \"").concat(title, "\";\n                            },\n                            callback: function() {\n                                loadRecommendationModule('subtitles');\n                                //addScript(\"/reactjs/subtitles.").concat(react_id, ".js\", \"module-reactjs-subtitles\");\n                            },\n                            });\">Sous-titres</button>\n                            <a class=\"header-navigation-item\" href=\"javascript:;\" onclick=\"reportItem(").concat(show.id, ", 'show');\">Signaler un probl\u00E8me</a>\n                            <a class=\"header-navigation-item\" href=\"javascript:;\" onclick=\"showUpdate('").concat(title, "', ").concat(show.id, ", '0')\">Demander une mise \u00E0 jour</a>\n                            <a class=\"header-navigation-item\" href=\"webcal://www.betaseries.com/cal/i").concat(urlShow, "\">Planning iCal de la s\u00E9rie</a>\n\n                            <form class=\"autocomplete js-autocomplete-form header-navigation-item\">\n                            <button type=\"reset\" class=\"btn-reset fontWeight700 js-autocomplete-show\" style=\"color: inherit\">Recommander la s\u00E9rie</button>\n                            <div class=\"autocomplete__toShow\" hidden=\"\">\n                                <input placeholder=\"Nom d'un ami\" type=\"text\" class=\"autocomplete__input js-search-friends\">\n                                <div class=\"autocomplete__response js-display-response\"></div>\n                            </div>\n                            </form>\n                            <a class=\"header-navigation-item\" href=\"javascript:;\">Supprimer de mes s\u00E9ries</a>");
                if ($optionsLinks.length === 1) {
                    templateOpts = "<a class=\"header-navigation-item\" href=\"".concat(urlShow, "/actions\">Vos actions sur la s\u00E9rie</a>") + templateOpts;
                }
                jQuery('#dropdownOptions').siblings('.dropdown-menu.header-navigation')
                    .append(templateOpts);
            }
            // On remplace le bouton Ajouter par les boutons Archiver et Favoris
            var divs = jQuery('#reactjs-show-actions > div');
            if (divs.length === 1) {
                jQuery('#reactjs-show-actions').remove();
                var $container = jQuery('.blockInformations__actions'), method = 'prepend';
                // Si le bouton VOD est présent, on place les boutons après
                if ($('#dropdownWatchOn').length > 0) {
                    $container = jQuery('#dropdownWatchOn').parent();
                    method = 'after';
                }
                $container[method]("\n                        <div class=\"displayFlex alignItemsFlexStart\"\n                                id=\"reactjs-show-actions\"\n                                data-show-id=\"".concat(show.id, "\"\n                                data-user-hasarchived=\"").concat(show.user.archived ? '1' : '', "\"\n                                data-show-inaccount=\"1\"\n                                data-user-id=\"").concat(Base_1.Base.userId, "\"\n                                data-show-favorised=\"").concat(show.user.favorited ? '1' : '', "\">\n                            <div class=\"blockInformations__action\">\n                            <button class=\"btn-reset btn-transparent btn-archive\" type=\"button\">\n                                <span class=\"svgContainer\">\n                                <svg fill=\"#0d151c\" height=\"16\" width=\"16\" xmlns=\"http://www.w3.org/2000/svg\">\n                                    <path d=\"m16 8-1.41-1.41-5.59 5.58v-12.17h-2v12.17l-5.58-5.59-1.42 1.42 8 8z\"></path>\n                                </svg>\n                                </span>\n                            </button>\n                            <div class=\"label\">").concat(Base_1.Base.trans('show.button.archive.label'), "</div>\n                            </div>\n                            <div class=\"blockInformations__action\">\n                            <button class=\"btn-reset btn-transparent btn-favoris\" type=\"button\">\n                                <span class=\"svgContainer\">\n                                <svg fill=\"#FFF\" width=\"20\" height=\"19\" xmlns=\"http://www.w3.org/2000/svg\">\n                                    <path d=\"M14.5 0c-1.74 0-3.41.81-4.5 2.09C8.91.81 7.24 0 5.5 0 2.42 0 0 2.42 0 5.5c0 3.78 3.4 6.86 8.55 11.54L10 18.35l1.45-1.32C16.6 12.36 20 9.28 20 5.5 20 2.42 17.58 0 14.5 0zm-4.4 15.55l-.1.1-.1-.1C5.14 11.24 2 8.39 2 5.5 2 3.5 3.5 2 5.5 2c1.54 0 3.04.99 3.57 2.36h1.87C11.46 2.99 12.96 2 14.5 2c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z\"></path>\n                                </svg>\n                                </span>\n                            </button>\n                            <div class=\"label\">").concat(Base_1.Base.trans('show.button.favorite.label'), "</div>\n                            </div>\n                        </div>"));
                show.elt = jQuery('reactjs-show-actions');
                // On ofusque l'image des épisodes non-vu
                var vignette = void 0;
                for (var v = 0; v < vignettes.length; v++) {
                    vignette = $(vignettes.get(v));
                    if (vignette.find('.seen').length <= 0) {
                        vignette.find('img.js-lazy-image').attr('style', 'filter: blur(5px);');
                    }
                }
                // On doit ajouter le bouton pour noter le média
                var $stars = jQuery('.blockInformations__metadatas .js-render-stars');
                $stars.replaceWith("\n                    <button type=\"button\" class=\"btn-reset fontSize0\">\n                        <span class=\"stars js-render-stars\">\n                            ".concat($stars.html(), "\n                        </span>\n                    </button>"));
                _this.elt = $('.blockInformations');
                _this.addNumberVoters();
            }
            _this.addEventBtnsArchiveAndFavoris();
            _this.deleteShowClick();
        }
        if (trigEpisode) {
            this.update(true).then(function (show) {
                changeBtnAdd(show);
            });
        }
    };
    /**
     * Gère la suppression de la série du compte utilisateur
     * @returns {void}
     */
    Show.prototype.deleteShowClick = function () {
        var _this = this;
        var $optionsLinks = $('#dropdownOptions').siblings('.dropdown-menu').children('a.header-navigation-item');
        // Le menu Options est au complet
        if (this.in_account && $optionsLinks.length > 2) {
            this.addEventBtnsArchiveAndFavoris();
            // Gestion de la suppression de la série du compte utilisateur
            $optionsLinks.last().removeAttr('onclick').off('click').on('click', function (e) {
                e.stopPropagation();
                e.preventDefault();
                var done = function () {
                    var afterNotif = function () {
                        // On nettoie les propriétés servant à l'update de l'affichage
                        _this.user.status = 0;
                        _this.user.archived = false;
                        _this.user.favorited = false;
                        _this.user.remaining = 0;
                        _this.user.last = "S00E00";
                        _this.user.next.id = NaN;
                        _this.save();
                        // On remet le bouton Ajouter
                        jQuery('#reactjs-show-actions').html("\n                            <div class=\"blockInformations__action\">\n                                <button class=\"btn-reset btn-transparent btn-add\" type=\"button\">\n                                <span class=\"svgContainer\">\n                                    <svg fill=\"#0D151C\" width=\"14\" height=\"14\" xmlns=\"http://www.w3.org/2000/svg\">\n                                    <path d=\"M14 8H8v6H6V8H0V6h6V0h2v6h6z\" fill-rule=\"nonzero\"></path>\n                                    </svg>\n                                </span>\n                                </button>\n                                <div class=\"label\">".concat(Base_1.Base.trans('show.button.add.label'), "</div>\n                            </div>"));
                        // On supprime les items du menu Options
                        $optionsLinks.first().siblings().each(function (i, e) { $(e).remove(); });
                        // Nettoyage de l'affichage des épisodes
                        var checks = jQuery('#episodes .slide_flex');
                        var promise, update = false; // Flag pour l'update de l'affichage
                        if (_this.currentSeason.episodes && _this.currentSeason.episodes.length > 0) {
                            promise = new Promise(function (resolve) { return resolve(_this.currentSeason); });
                        }
                        else {
                            promise = _this.currentSeason.fetchEpisodes();
                        }
                        promise.then(function (season) {
                            for (var e_1 = 0; e_1 < season.episodes.length; e_1++) {
                                if (season.episodes[e_1].elt === null) {
                                    season.episodes[e_1].elt = $(checks.get(e_1));
                                }
                                if (e_1 === season.episodes.length - 1)
                                    update = true;
                                if (Base_1.Base.debug)
                                    console.log('clean episode %d', e_1, update);
                                season.episodes[e_1].updateRender('notSeen', update);
                            }
                        });
                        // On doit supprimer le bouton pour noter le média
                        var $stars = jQuery('.blockInformations__metadatas .js-render-stars');
                        $stars.parent().replaceWith("\n                        <span class=\"stars js-render-stars\">\n                        ".concat($stars.html(), "\n                        </span>"));
                        _this.elt = $('.blockInformations');
                        _this.addNumberVoters();
                        _this.addShowClick();
                    };
                    // eslint-disable-next-line no-undef
                    new PopupAlert({
                        title: Base_1.Base.trans("popup.delete_show_success.title"),
                        text: Base_1.Base.trans("popup.delete_show_success.text", { "%title%": _this.title }),
                        yes: Base_1.Base.trans("popup.delete_show_success.yes"),
                        callback_yes: afterNotif
                    });
                };
                // Supprimer la série du compte utilisateur
                // eslint-disable-next-line no-undef
                new PopupAlert({
                    title: Base_1.Base.trans("popup.delete_show.title", { "%title%": _this.title }),
                    text: Base_1.Base.trans("popup.delete_show.text", { "%title%": _this.title }),
                    callback_yes: function () {
                        if (Base_1.Base.debug)
                            console.groupCollapsed('delete show');
                        _this.removeFromAccount()
                            .then(function () { return done(); }, function (err) {
                            if (err && err.code !== undefined && err.code === 2004) {
                                done();
                                if (Base_1.Base.debug)
                                    console.groupEnd();
                                return;
                            }
                            Media_1.Media.notification('Erreur de suppression de la série', err);
                            if (Base_1.Base.debug)
                                console.groupEnd();
                        });
                    },
                    callback_no: function () { }
                });
            });
        }
    };
    /**
     * Ajoute un eventHandler sur les boutons Archiver et Favoris
     * @returns {void}
     */
    Show.prototype.addEventBtnsArchiveAndFavoris = function () {
        var _this = this;
        var $btnArchive = jQuery('#reactjs-show-actions button.btn-archive'), $btnFavoris = jQuery('#reactjs-show-actions button.btn-favoris');
        if ($btnArchive.length === 0 || $btnFavoris.length === 0) {
            $('#reactjs-show-actions button:first').addClass('btn-archive');
            $btnArchive = jQuery('#reactjs-show-actions button.btn-archive');
            $('#reactjs-show-actions button:last').addClass('btn-favoris');
            $btnFavoris = jQuery('#reactjs-show-actions button.btn-favoris');
        }
        // Event bouton Archiver
        $btnArchive.off('click').click(function (e) {
            e.stopPropagation();
            e.preventDefault();
            if (Base_1.Base.debug)
                console.groupCollapsed('show-archive');
            // Met à jour le bouton d'archivage de la série
            function updateBtnArchive(promise, transform, label, notif) {
                promise.then(function () {
                    var $parent = $(e.currentTarget).parent();
                    $('span', e.currentTarget).css('transform', transform);
                    $('.label', $parent).text(Base_1.Base.trans(label));
                    if (Base_1.Base.debug)
                        console.groupEnd();
                }, function (err) {
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
        $btnFavoris.off('click').click(function (e) {
            e.stopPropagation();
            e.preventDefault();
            if (Base_1.Base.debug)
                console.groupCollapsed('show-favoris');
            if (!_this.isFavorite()) {
                _this.favorite()
                    .then(function () {
                    jQuery(e.currentTarget).children('span').replaceWith("\n                            <span class=\"svgContainer\">\n                            <svg width=\"21\" height=\"19\" xmlns=\"http://www.w3.org/2000/svg\">\n                                <path d=\"M15.156.91a5.887 5.887 0 0 0-4.406 2.026A5.887 5.887 0 0 0 6.344.909C3.328.91.958 3.256.958 6.242c0 3.666 3.33 6.653 8.372 11.19l1.42 1.271 1.42-1.28c5.042-4.528 8.372-7.515 8.372-11.18 0-2.987-2.37-5.334-5.386-5.334z\"></path>\n                            </svg>\n                            </span>");
                    if (Base_1.Base.debug)
                        console.groupEnd();
                }, function (err) {
                    Base_1.Base.notification('Erreur de favoris de la série', err);
                    if (Base_1.Base.debug)
                        console.groupEnd();
                });
            }
            else {
                _this.unfavorite()
                    .then(function () {
                    $(e.currentTarget).children('span').replaceWith("\n                            <span class=\"svgContainer\">\n                            <svg fill=\"#FFF\" width=\"20\" height=\"19\" xmlns=\"http://www.w3.org/2000/svg\">\n                                <path d=\"M14.5 0c-1.74 0-3.41.81-4.5 2.09C8.91.81 7.24 0 5.5 0 2.42 0 0 2.42 0 5.5c0 3.78 3.4 6.86 8.55 11.54L10 18.35l1.45-1.32C16.6 12.36 20 9.28 20 5.5 20 2.42 17.58 0 14.5 0zm-4.4 15.55l-.1.1-.1-.1C5.14 11.24 2 8.39 2 5.5 2 3.5 3.5 2 5.5 2c1.54 0 3.04.99 3.57 2.36h1.87C11.46 2.99 12.96 2 14.5 2c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z\"></path>\n                            </svg>\n                            </span>");
                    if (Base_1.Base.debug)
                        console.groupEnd();
                }, function (err) {
                    Base_1.Base.notification('Erreur de favoris de la série', err);
                    if (Base_1.Base.debug)
                        console.groupEnd();
                });
            }
        });
    };
    /**
     * Ajoute la classification dans les détails de la ressource
     */
    Show.prototype.addRating = function () {
        if (Base_1.Base.debug)
            console.log('addRating');
        if (this.rating) {
            var rating = Base_1.Base.ratings[this.rating] !== undefined ? Base_1.Base.ratings[this.rating] : null;
            if (rating !== null) {
                // On ajoute la classification
                jQuery('.blockInformations__details')
                    .append("<li id=\"rating\"><strong>Classification</strong>\n                        <img src=\"".concat(rating.img, "\" title=\"").concat(rating.title, "\"/>\n                    </li>"));
            }
        }
    };
    /**
     * Définit la saison courante
     * @param   {number} seasonNumber Le numéro de la saison courante (commence à 1)
     * @returns {Show}  L'instance de la série
     * @throws  {Error} if seasonNumber is out of range of seasons
     */
    Show.prototype.setCurrentSeason = function (seasonNumber) {
        if (seasonNumber <= 0 || seasonNumber > this.seasons.length) {
            throw new Error("seasonNumber is out of range of seasons");
        }
        this.currentSeason = this.seasons[seasonNumber - 1];
        return this;
    };
    /***************************************************/
    /*                      STATIC                     */
    /***************************************************/
    /**
     * Types d'évenements gérés par cette classe
     * @type {Array}
     */
    Show.EventTypes = new Array(Base_1.EventTypes.UPDATE, Base_1.EventTypes.SAVE, Base_1.EventTypes.ADD, Base_1.EventTypes.REMOVE);
    return Show;
}(Media_1.Media));

var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var MovieStatus;
(function (MovieStatus) {
    MovieStatus[MovieStatus["TOSEE"] = 0] = "TOSEE";
    MovieStatus[MovieStatus["SEEN"] = 1] = "SEEN";
    MovieStatus[MovieStatus["DONTWANTTOSEE"] = 2] = "DONTWANTTOSEE";
})(MovieStatus = MovieStatus || (MovieStatus = {}));
// eslint-disable-next-line no-unused-vars
var Movie = /** @class */ (function (_super) {
    __extends(Movie, _super);
    /***************************************************/
    /*                      METHODS                    */
    /***************************************************/
    function Movie(data, element) {
        var _this_1 = this;
        if (data.user.in_account !== undefined) {
            data.in_account = data.user.in_account;
            delete data.user.in_account;
        }
        _this_1 = _super.call(this, data) || this;
        _this_1.elt = element;
        return _this_1.fill(data);
    }
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
    Movie.fetch = function (id, force) {
        if (force === void 0) { force = false; }
        return new Promise(function (resolve, reject) {
            Base_1.Base.callApi('GET', 'movies', 'movie', { id: id }, force)
                .then(function (data) { return resolve(new Movie(data, jQuery('.blockInformations'))); })
                .catch(function (err) { return reject(err); });
        });
    };
    /**
     * Remplit l'objet avec les données fournit en paramètre
     * @param  {any} data Les données provenant de l'API
     * @returns {Movie}
     * @override
     */
    Movie.prototype.fill = function (data) {
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
        _super.prototype.fill.call(this, data);
        return this.save();
    };
    /*
    Bouton Vu: $(`.blockInformations__action .label:contains("${Base.trans('film.button.watched.label')}")`).siblings('button')
    Bouton A voir: $(`.blockInformations__action .label:contains("${Base.trans('film.button.to_watch.label')}")`).siblings('button')
    Bouton Favori: $(`.blockInformations__action .label:contains("${Base.trans('film.button.favorite.label')}")`).siblings('button')
    */
    /**
     * Définit le film, sur le compte du membre connecté, comme "vu"
     * @returns {Promise<Movie>}
     */
    Movie.prototype.markAsView = function () {
        return this.changeStatus(MovieStatus.SEEN);
    };
    /**
     * Définit le film, sur le compte du membre connecté, comme "à voir"
     * @returns {Promise<Movie>}
     */
    Movie.prototype.markToSee = function () {
        return this.changeStatus(MovieStatus.TOSEE);
    };
    /**
     * Définit le film, sur le compte du membre connecté, comme "ne pas voir"
     * @returns {Promise<Movie>}
     */
    Movie.prototype.markDontWantToSee = function () {
        return this.changeStatus(MovieStatus.DONTWANTTOSEE);
    };
    /**
     * Modifie le statut du film sur le compte du membre connecté
     * @param   {number} state     Le nouveau statut du film
     * @returns {Promise<Movie>}    L'instance du film
     */
    Movie.prototype.changeStatus = function (state) {
        var _this_1 = this;
        var _this = this;
        if (!Base_1.Base.userIdentified() || this.user.status === state) {
            if (Base_1.Base.debug)
                console.info('User not identified or state is equal with user status');
            return Promise.resolve(this);
        }
        return Base_1.Base.callApi(Base_1.HTTP_VERBS.POST, this.mediaType.plural, 'movie', { id: this.id, state: state })
            .then(function (data) {
            _this.fill(data.movie);
            return _this_1;
        })
            .catch(function (err) {
            console.warn("Erreur ajout film sur compte", err);
            Base_1.Base.notification('Ajout du film', "Erreur lors de l'ajout du film sur votre compte");
            return _this_1;
        });
    };
    return Movie;
}(Media_1.Media));

var Subtitle = /** @class */ (function () {
    function Subtitle(data) {
        this.id = parseInt(data.id, 10);
        this.language = data.language;
        this.source = data.source;
        this.quality = parseInt(data.quality, 10);
        this.file = data.file;
        this.url = data.url;
        this.date = new Date(data.date);
    }
    return Subtitle;
}());

var Season = /** @class */ (function () {
    /**
     * Constructeur de la classe Season
     * @param   {Obj}   data    Les données provenant de l'API
     * @param   {Show}  show    L'objet Show contenant la saison
     * @returns {Season}
     */
    function Season(data, show) {
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
    Season.prototype.fetchEpisodes = function () {
        if (!this.number || this.number <= 0) {
            throw new Error('season number incorrect');
        }
        var _this = this;
        return new Promise(function (resolve, reject) {
            Base_1.Base.callApi('GET', 'shows', 'episodes', { id: _this._show.id, season: _this.number }, true)
                .then(function (data) {
                _this.episodes = [];
                for (var e = 0; e < data.episodes.length; e++) {
                    _this.episodes.push(new Episode_1.Episode(data.episodes[e], _this));
                }
                resolve(_this);
            }, function (err) {
                reject(err);
            });
        });
    };
    /**
     * Retourne l'épisode correspondant à l'identifiant fournit
     * @param  {number} id
     * @returns {Episode}
     */
    Season.prototype.getEpisode = function (id) {
        for (var e = 0; e < this.episodes.length; e++) {
            if (this.episodes[e].id === id) {
                return this.episodes[e];
            }
        }
        return null;
    };
    /**
     * Retourne le nombre d'épisodes vus
     * @returns {number} Le nombre d'épisodes vus dans la saison
     */
    Season.prototype.getNbEpisodesSeen = function () {
        var nbEpisodesSeen = 0;
        for (var e = 0; e < this.episodes.length; e++) {
            if (this.episodes[e].user.seen)
                nbEpisodesSeen++;
        }
        return nbEpisodesSeen;
    };
    /**
     * Retourne le nombre d'épisodes spéciaux
     * @returns {number} Le nombre d'épisodes spéciaux
     */
    Season.prototype.getNbEpisodesSpecial = function () {
        var nbEpisodesSpecial = 0;
        for (var e = 0; e < this.episodes.length; e++) {
            if (this.episodes[e].special)
                nbEpisodesSpecial++;
        }
        return nbEpisodesSpecial;
    };
    /**
     * Met à jour l'objet Show
     * @param {Function} cb Function de callback
     * @returns {Season}
     */
    Season.prototype.updateShow = function (cb) {
        if (cb === void 0) { cb = Base_1.Base.noop; }
        this._show.update(true).then(cb);
        return this;
    };
    /**
     * Modifie la saison courante de l'objet Show
     * @param   {number} seasonNumber Le numéro de la saison
     * @returns {Season}
     */
    Season.prototype.changeCurrentSeason = function (seasonNumber) {
        this._show.setCurrentSeason(seasonNumber);
        return this;
    };
    /**
     * Indique si la série est sur le compte du membre connecté
     * @returns {boolean}
     */
    Season.prototype.showInAccount = function () {
        return this._show.in_account;
    };
    /**
     * Définit la série comme étant sur le compte du membre connecté
     * @returns {Season}
     */
    Season.prototype.addShowToAccount = function () {
        this._show.in_account = true;
        return this;
    };
    return Season;
}());

var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Episode = /** @class */ (function (_super) {
    __extends(Episode, _super);
    /**
     * Constructeur de la classe Episode
     * @param   {Obj}       data    Les données provenant de l'API
     * @param   {Season}    season  L'objet Season contenant l'épisode
     * @returns {Episode}
     */
    function Episode(data, season) {
        var _this_1 = _super.call(this, data) || this;
        _this_1._season = season;
        return _this_1.fill(data);
    }
    /**
     * Remplit l'objet avec les données fournit en paramètre
     * @param  {any} data Les données provenant de l'API
     * @returns {Episode}
     * @override
     */
    Episode.prototype.fill = function (data) {
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
        this.subtitles = new Array();
        if (data.subtitles !== undefined) {
            for (var s = 0; s < data.subtitles.length; s++) {
                this.subtitles.push(new Subtitle_1.Subtitle(data.subtitles[s]));
            }
        }
        this.thetvdb_id = parseInt(data.thetvdb_id, 10);
        this.watched_by = data.watched_by;
        this.writers = data.writers;
        this.youtube_id = data.youtube_id;
        this.mediaType = { singular: Base_1.MediaType.episode, plural: 'episodes', className: Episode };
        _super.prototype.fill.call(this, data);
        return this.save();
    };
    /**
     * Ajoute le titre de l'épisode à l'attribut Title
     * du DOMElement correspondant au titre de l'épisode
     * sur la page Web
     *
     * @return {Episode} L'épisode
     */
    Episode.prototype.addAttrTitle = function () {
        // Ajout de l'attribut title pour obtenir le nom complet de l'épisode, lorsqu'il est tronqué
        if (this.elt)
            this.elt.find('.slide__title').attr('title', this.title);
        return this;
    };
    /**
     * Met à jour le DOMElement .checkSeen avec les
     * données de l'épisode (id, pos, special)
     * @param  {number} pos  La position de l'épisode dans la liste
     * @return {Episode}
     */
    Episode.prototype.initCheckSeen = function (pos) {
        var $checkbox = this.elt.find('.checkSeen');
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
                .append("<div id=\"episode-".concat(this.id, "\"\n                                class=\"checkSeen\"\n                                data-id=\"").concat(this.id, "\"\n                                data-pos=\"").concat(pos, "\"\n                                data-special=\"").concat(this.special ? '1' : '0', "\"\n                                style=\"background: rgba(13,21,28,.2);\"\n                                title=\"").concat(Base_1.Base.trans("member_shows.markas"), "\"></div>"));
            this.elt.find('.slide__image img.js-lazy-image').attr('style', 'filter: blur(5px);');
        }
        else if ($checkbox.length > 0 && this.user.hidden) {
            $checkbox.remove();
        }
        return this;
    };
    /**
     * Met à jour les infos de la vignette et appelle la fonction d'update du rendu
     * @param  {number} pos La position de l'épisode dans la liste
     * @return {boolean}    Indique si il y a eu un changement
     */
    Episode.prototype.updateCheckSeen = function (pos) {
        var $checkSeen = this.elt.find('.checkSeen');
        var changed = false;
        if ($checkSeen.length > 0 && $checkSeen.attr('id') === undefined) {
            if (Base_1.Base.debug)
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
    };
    /**
     * Retourne le code HTML du titre de la popup
     * pour l'affichage de la description
     * @return {string}
     */
    Episode.prototype.getTitlePopup = function () {
        return "<span style=\"color: var(--link_color);\">Synopsis \u00E9pisode ".concat(this.code, "</span>");
    };
    /**
     * Modifie le statut d'un épisode sur l'API
     * @param  {String} status    Le nouveau statut de l'épisode
     * @param  {String} method    Verbe HTTP utilisé pour la requête à l'API
     * @return {void}
     */
    Episode.prototype.updateStatus = function (status, method) {
        var _this = this;
        var pos = this.elt.find('.checkSeen').data('pos');
        var promise = new Promise(function (resolve) { resolve(false); });
        var args = { id: this.id, bulk: true };
        this.toggleSpinner(true);
        if (method === Base_1.HTTP_VERBS.POST) {
            var createPromise = function () {
                return new Promise(function (resolve) {
                    // eslint-disable-next-line no-undef
                    new PopupAlert({
                        title: 'Episodes vus',
                        text: 'Doit-on cocher les épisodes précédents comme vu ?',
                        callback_yes: function () {
                            resolve(true);
                        },
                        callback_no: function () {
                            resolve(false);
                        }
                    });
                });
            };
            var $vignettes = jQuery('#episodes .checkSeen');
            // On verifie si les épisodes précédents ont bien été indiqués comme vu
            for (var v = 0; v < pos; v++) {
                if (!$($vignettes.get(v)).hasClass('seen')) {
                    promise = createPromise();
                    break;
                }
            }
        }
        promise.then(function (response) {
            if (method === Base_1.HTTP_VERBS.POST && !response) {
                args.bulk = false; // Flag pour ne pas mettre les épisodes précédents comme vus automatiquement
            }
            Base_1.Base.callApi(method, 'episodes', 'watched', args).then(function (data) {
                if (Base_1.Base.debug)
                    console.log('updateStatus %s episodes/watched', method, data);
                // Si un épisode est vu et que la série n'a pas été ajoutée
                // au compte du membre connecté
                if (!_this._season.showInAccount() && data.episode.show.in_account) {
                    _this._season.addShowToAccount();
                }
                // On met à jour l'objet Episode
                if (method === Base_1.HTTP_VERBS.POST && response && pos) {
                    var $vignettes = jQuery('#episodes .slide_flex');
                    var episode = null;
                    for (var e = 0; e < pos; e++) {
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
                    ._callListeners(Base_1.EventTypes.UPDATE)
                    .save()
                    ._season.updateShow();
            })
                .catch(function (err) {
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
    };
    /**
     * Change le statut visuel de la vignette sur le site
     * @param  {String} newStatus     Le nouveau statut de l'épisode
     * @param  {bool}   [update=true] Mise à jour de la ressource en cache et des éléments d'affichage
     * @return {Episode}
     */
    Episode.prototype.updateRender = function (newStatus, update) {
        if (update === void 0) { update = true; }
        var _this = this;
        var $elt = this.elt.find('.checkSeen');
        var lenEpisodes = _this._season.episodes.length;
        var lenNotSpecial = lenEpisodes - _this._season.getNbEpisodesSpecial();
        if (Base_1.Base.debug)
            console.log('changeStatus', { elt: $elt, status: newStatus, update: update });
        if (newStatus === 'seen') {
            $elt.css('background', ''); // On ajoute le check dans la case à cocher
            $elt.addClass('seen'); // On ajoute la classe 'seen'
            $elt.attr('title', Base_1.Base.trans("member_shows.remove"));
            // On supprime le voile masquant sur la vignette pour voir l'image de l'épisode
            $elt.parents('div.slide__image').first().find('img').removeAttr('style');
            $elt.parents('div.slide_flex').first().removeClass('slide--notSeen');
            var moveSeason_1 = function (cb) {
                if (cb === void 0) { cb = Base_1.Base.noop; }
                var slideCurrent = jQuery('#seasons div.slide--current');
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
                    var seasonNumber = _this._season.number + 1;
                    _this._season.changeCurrentSeason(seasonNumber);
                    slideCurrent.next().trigger('click');
                    slideCurrent.removeClass('slide--current');
                }
                return cb();
            };
            var lenSeen = _this._season.getNbEpisodesSeen();
            if (Base_1.Base.debug)
                console.log('Episode.updateRender', { lenEpisodes: lenEpisodes, lenNotSpecial: lenNotSpecial, lenSeen: lenSeen });
            // Si tous les épisodes de la saison ont été vus
            if (lenSeen === lenEpisodes) {
                moveSeason_1();
            }
            else if (lenSeen === lenNotSpecial) {
                // eslint-disable-next-line no-undef
                new PopupAlert({
                    title: 'Fin de la saison',
                    text: 'Tous les épisodes de la saison, hors spéciaux, ont été vu.<br/>Voulez-vous passer à la saison suivante ?',
                    callback_yes: function () {
                        moveSeason_1();
                    },
                    callback_no: function () {
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
            $elt.parents('div.slide__image').first()
                .find('img')
                .attr('style', 'filter: blur(5px);');
            var contVignette = $elt.parents('div.slide_flex').first();
            if (!contVignette.hasClass('slide--notSeen')) {
                contVignette.addClass('slide--notSeen');
            }
            var lenSeen = _this._season.getNbEpisodesSeen();
            if (lenSeen < lenEpisodes) {
                var $seasonCurrent = jQuery('#seasons div.slide--current');
                $seasonCurrent.find('.checkSeen').remove();
                $seasonCurrent
                    .removeClass('slide--seen')
                    .addClass('slide--notSeen');
            }
        }
        this.toggleSpinner(false);
        return this;
    };
    /**
     * Affiche/masque le spinner de modification de l'épisode
     *
     * @param  {boolean}  display  Le flag indiquant si afficher ou masquer
     * @return {Episode}
     */
    Episode.prototype.toggleSpinner = function (display) {
        if (!display) {
            jQuery('.spinner').remove();
            // if (Base.debug) console.log('toggleSpinner');
            if (Base_1.Base.debug)
                console.groupEnd();
        }
        else {
            if (Base_1.Base.debug)
                console.groupCollapsed('episode checkSeen');
            // if (Base.debug) console.log('toggleSpinner');
            this.elt.find('.slide__image').first().prepend("\n                <div class=\"spinner\">\n                    <div class=\"spinner-item\"></div>\n                    <div class=\"spinner-item\"></div>\n                    <div class=\"spinner-item\"></div>\n                </div>");
        }
        return this;
    };
    return Episode;
}(Base_1.Base));

var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Similar = /** @class */ (function (_super) {
    __extends(Similar, _super);
    function Similar(data, type) {
        var _this_1 = this;
        if (type.singular === Base_1.MediaType.movie) {
            data.in_account = data.user.in_account;
            delete data.user.in_account;
            data.description = data.synopsis;
            delete data.synopsis;
        }
        _this_1 = _super.call(this, data) || this;
        _this_1.mediaType = type;
        return _this_1.fill(data);
    }
    /**
     * Remplit l'objet avec les données fournit en paramètre
     * @param  {Obj} data Les données provenant de l'API
     * @returns {Similar}
     * @override
     */
    Similar.prototype.fill = function (data) {
        if (this.mediaType.singular === Base_1.MediaType.show) {
            this.aliases = data.aliases;
            this.creation = data.creation;
            this.country = data.country;
            this.images = null;
            if (data.images !== undefined && data.images !== null) {
                this.images = new Show_1.Images(data.images);
            }
            this.nbEpisodes = parseInt(data.episodes, 10);
            this.network = data.network;
            this.next_trailer = data.next_trailer;
            this.next_trailer_host = data.next_trailer_host;
            this.rating = data.rating;
            this.platforms = null;
            if (data.platforms !== undefined && data.platforms !== null) {
                this.platforms = new Show_1.Platforms(data.platforms);
            }
            this.seasons = new Array();
            this.nbSeasons = parseInt(data.seasons, 10);
            this.showrunner = null;
            if (data.showrunner !== undefined && data.showrunner !== null) {
                this.showrunner = new Show_1.Showrunner(data.showrunner);
            }
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
        _super.prototype.fill.call(this, data);
        return this;
    };
    /**
     * Récupère les données de la série sur l'API
     * @param  {boolean} [force=true]   Indique si on utilise les données en cache
     * @return {Promise<*>}             Les données de la série
     */
    Similar.prototype.fetch = function (force) {
        if (force === void 0) { force = true; }
        var action = 'display';
        if (this.mediaType.singular === Base_1.MediaType.movie) {
            action = 'movie';
        }
        return Base_1.Base.callApi('GET', this.mediaType.plural, action, { id: this.id }, force);
    };
    /**
     * Ajoute le bandeau Viewed sur le poster du similar
     * @return {Similar}
     */
    Similar.prototype.addViewed = function () {
        var $slideImg = this.elt.find('a.slide__image');
        // Si la série a été vue ou commencée
        if (this.user.status &&
            ((this.mediaType.singular === Base_1.MediaType.movie && this.user.status === 1) ||
                (this.mediaType.singular === Base_1.MediaType.show && this.user.status > 0))) {
            // On ajoute le bandeau "Viewed"
            $slideImg.prepend("<img src=\"".concat(Base_1.Base.serverBaseUrl, "/img/viewed.png\" class=\"bandViewed\"/>"));
        }
        // On ajoute des infos pour la recherche du similar pour les popups
        $slideImg
            .attr('data-id', this.id)
            .attr('data-type', this.mediaType.singular);
        return this;
    };
    /**
     * Ajoute l'icône wrench à côté du titre du similar
     * pour permettre de visualiser les données du similar
     * @param   {implDialog} dialog L'objet Dialog pour afficher les données
     * @returns {Similar}
     */
    Similar.prototype.wrench = function (dialog) {
        var _this_1 = this;
        var $title = this.elt.find('.slide__title'), _this = this;
        $title.html($title.html() +
            "<i class=\"fa fa-wrench popover-wrench\"\n                aria-hidden=\"true\"\n                style=\"margin-left:5px;cursor:pointer;\"\n                data-id=\"".concat(_this.id, "\"\n                data-type=\"").concat(_this.mediaType.singular, "\">\n            </i>"));
        $title.find('.popover-wrench').click(function (e) {
            e.stopPropagation();
            e.preventDefault();
            //if (debug) console.log('Popover Wrench', eltId, self);
            _this_1.fetch().then(function (data) {
                // eslint-disable-next-line no-undef
                dialog.setContent(renderjson.set_show_to_level(2)(data[_this.mediaType.singular]));
                dialog.setCounter(Base_1.Base.counter.toString());
                dialog.show();
            });
        });
        return this;
    };
    /**
     * Retourne le contenu HTML pour la popup
     * de présentation du similar
     * @return {string}
     */
    Similar.prototype.getContentPopup = function () {
        var _this = this;
        //if (debug) console.log('similars tempContentPopup', objRes);
        var description = this.description;
        if (description.length > 200) {
            description = description.substring(0, 200) + '…';
        }
        var template = '';
        function _renderCreation() {
            var html = '';
            if (_this.creation || _this.country || _this.production_year) {
                html += '<p>';
                if (_this.creation) {
                    html += "<u>Cr\u00E9ation:</u> <strong>".concat(_this.creation, "</strong>");
                }
                if (_this.production_year) {
                    html += "<u>Production:</u> <strong>".concat(_this.production_year, "</strong>");
                }
                if (_this.country) {
                    html += ", <u>Pays:</u> <strong>".concat(_this.country, "</strong>");
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
            var status_1 = this.status.toLowerCase() == 'ended' ? 'Terminée' : 'En cours';
            var seen = (this.user.status > 0) ? 'Vu à <strong>' + this.user.status + '%</strong>' : 'Pas vu';
            template += "<p><strong>".concat(this.nbSeasons, "</strong> saison").concat((this.nbSeasons > 1 ? 's' : ''), ", <strong>").concat(this.nbEpisodes, "</strong> \u00E9pisodes, ");
            if (this.objNote.total > 0) {
                template += "<strong>".concat(this.objNote.total, "</strong> votes");
                if (this.objNote.user > 0) {
                    template += ", votre note: ".concat(this.objNote.user);
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
            var archived = '';
            if (this.user.status > 0 && this.user.archived === true) {
                archived = ', Archivée: <i class="fa fa-check-circle-o" aria-hidden="true"></i>';
            }
            else if (this.user.status > 0) {
                archived = ', Archivée: <i class="fa fa-circle-o" aria-hidden="true"></i>';
            }
            if (this.showrunner && this.showrunner.name.length > 0) {
                template += "<p><u>Show Runner:</u> <strong>".concat(this.showrunner.name, "</strong></p>");
            }
            template += "<p><u>Statut:</u> <strong>".concat(status_1, "</strong>, ").concat(seen).concat(archived, "</p>");
        }
        // movie
        else {
            template += '<p>';
            if (this.objNote.total > 0) {
                template += "<strong>".concat(this.objNote.total, "</strong> votes");
                if (this.objNote.user > 0) {
                    template += ", votre note: ".concat(this.objNote.user);
                }
            }
            else {
                template += 'Aucun vote';
            }
            template += '</p>';
            // Ajouter une case à cocher pour l'état "Vu"
            template += "<p><label for=\"seen\">Vu</label>\n                <input type=\"radio\" class=\"movie movieSeen\" name=\"movieState\" value=\"1\" data-movie=\"".concat(this.id, "\" ").concat(this.user.status === 1 ? 'checked' : '', " style=\"margin-right:5px;vertical-align:middle;\"></input>");
            // Ajouter une case à cocher pour l'état "A voir"
            template += "<label for=\"mustSee\">A voir</label>\n                <input type=\"radio\" class=\"movie movieMustSee\" name=\"movieState\" value=\"0\" data-movie=\"".concat(this.id, "\" ").concat(this.user.status === 0 ? 'checked' : '', " style=\"margin-right:5px;vertical-align:middle;\"></input>");
            // Ajouter une case à cocher pour l'état "Ne pas voir"
            template += "<label for=\"notSee\">Ne pas voir</label>\n                <input type=\"radio\" class=\"movie movieNotSee\" name=\"movieState\" value=\"2\" data-movie=\"".concat(this.id, "\"  ").concat(this.user.status === 2 ? 'checked' : '', " style=\"vertical-align:middle;\"></input>");
            template += "<button class=\"btn btn-danger reset\" style=\"margin-left:10px;padding:2px 5px;".concat(this.user.status < 0 ? 'display:none;' : '', "\">Reset</button></p>");
            template += _renderGenres();
            template += _renderCreation();
            if (this.director) {
                template += "<p><u>R\u00E9alisateur:</u> <strong>".concat(this.director, "</strong></p>");
            }
        }
        return template + "<p>".concat(description, "</p></div>");
    };
    /**
     * Retourne le contenu HTML du titre de la popup
     * @return {string}
     */
    Similar.prototype.getTitlePopup = function () {
        // if (Base.debug) console.log('getTitlePopup', this);
        var title = this.title;
        if (this.objNote.total > 0) {
            title += ' <span style="font-size: 0.8em;color:#000;">' +
                this.objNote.mean.toFixed(2) + ' / 5</span>';
        }
        return title;
    };
    /**
     * Met à jour l'attribut title de la note du similar
     * @param  {Boolean} change Indique si il faut modifier l'attribut
     * @return {string}         La valeur modifiée de l'attribut title
     */
    Similar.prototype.updateTitleNote = function (change) {
        if (change === void 0) { change = true; }
        var $elt = this.elt.find('.stars-outer');
        if (this.objNote.mean <= 0 || this.objNote.total <= 0) {
            if (change)
                $elt.attr('title', 'Aucun vote');
            return '';
        }
        var title = this.objNote.toString();
        if (change) {
            $elt.attr('title', title);
        }
        return title;
    };
    /**
     * Ajoute la note, sous forme d'étoiles, du similar sous son titre
     * @return {Similar}
     */
    Similar.prototype.renderStars = function () {
        // On ajoute le code HTML pour le rendu de la note
        this.elt.find('.slide__title').after('<div class="stars-outer"><div class="stars-inner"></div></div>');
        this.updateTitleNote();
        this.elt.find('.stars-inner').width(this.objNote.getPercentage() + '%');
        return this;
    };
    /**
     * Vérifie la présence de l'image du similar
     * et tente d'en trouver une si celle-ci n'est pas présente
     * @return {Similar}
     */
    Similar.prototype.checkImg = function () {
        var $img = this.elt.find('img.js-lazy-image'), _this = this;
        if ($img.length <= 0) {
            if (this.mediaType.singular === Base_1.MediaType.show && this.thetvdb_id && this.thetvdb_id > 0) {
                // On tente de remplacer le block div 404 par une image
                this.elt.find('div.block404').replaceWith("\n                    <img class=\"u-opacityBackground fade-in\"\n                            width=\"125\"\n                            height=\"188\"\n                            alt=\"Poster de ".concat(this.title, "\"\n                            src=\"https://artworks.thetvdb.com/banners/posters/").concat(this.thetvdb_id, "-1.jpg\"/>"));
            }
            else if (this.mediaType.singular === Base_1.MediaType.movie && this.tmdb_id && this.tmdb_id > 0) {
                if (Base_1.Base.themoviedb_api_user_key.length <= 0)
                    return;
                var uriApiTmdb = "https://api.themoviedb.org/3/movie/".concat(this.tmdb_id, "?api_key=").concat(Base_1.Base.themoviedb_api_user_key, "&language=fr-FR");
                fetch(uriApiTmdb).then(function (response) {
                    if (!response.ok)
                        return null;
                    return response.json();
                }).then(function (data) {
                    if (data !== null && data.poster_path !== undefined && data.poster_path !== null) {
                        _this.elt.find('div.block404').replaceWith("\n                            <img class=\"u-opacityBackground fade-in\"\n                                    width=\"125\"\n                                    height=\"188\"\n                                    alt=\"Poster de ".concat(_this.title, "\"\n                                    src=\"https://image.tmdb.org/t/p/original").concat(data.poster_path, "\"/>"));
                    }
                });
            }
        }
        return this;
    };
    /**
     * Add Show to account member
     * @return {Promise<Similar>} Promise of show
     */
    Similar.prototype.addToAccount = function (state) {
        if (state === void 0) { state = 0; }
        if (this.in_account)
            return Promise.resolve(this);
        return this.changeState(state);
    };
    /**
     * Modifie le statut du similar
     * @param   {number} state Le nouveau statut du similar
     * @returns {Promise<Similar>}
     */
    Similar.prototype.changeState = function (state) {
        if (state < -1 || state > 2) {
            throw new Error("Parameter state is incorrect: " + state.toString());
        }
        var _this = this;
        var params = { id: this.id };
        var verb = Base_1.HTTP_VERBS.POST;
        if (state === -1 && this.mediaType.singular === Base_1.MediaType.movie) {
            verb = Base_1.HTTP_VERBS.DELETE;
        }
        else if (this.mediaType.singular === Base_1.MediaType.movie) {
            params.state = state;
        }
        return Base_1.Base.callApi(verb, this.mediaType.plural, this.mediaType.singular, params)
            .then(function (data) {
            _this.fill(data[_this.mediaType.singular]);
            // En attente de la résolution du bug https://www.betaseries.com/bugs/api/462
            if (verb === Base_1.HTTP_VERBS.DELETE) {
                _this.in_account = false;
                _this.user.status = -1;
                _this.save();
            }
            return _this;
        })
            .catch(function (err) {
            console.warn('Erreur changeState similar', err);
            Base_1.Base.notification('Change State Similar', 'Erreur lors du changement de statut: ' + err.toString());
            return _this;
        });
    };
    /**
     * Ajoute une note au média
     * @param   {number} note Note du membre connecté pour le média
     * @returns {Promise<boolean>}
     */
    // eslint-disable-next-line no-unused-vars
    Similar.prototype.addVote = function (note) {
        throw new Error('On ne vote pas pour un similar');
    };
    return Similar;
}(Media_1.Media));

// eslint-disable-next-line no-unused-vars
var UpdateAuto = /** @class */ (function () {
    function UpdateAuto(show) {
        if (UpdateAuto.instance) {
            return UpdateAuto.instance;
        }
        this._show = show;
        this._showId = show.id;
        var objUpAuto = UpdateAuto.getValue('objUpAuto', {});
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
    UpdateAuto.getInstance = function (s) {
        if (!UpdateAuto.instance) {
            UpdateAuto.instance = new UpdateAuto(s);
        }
        return UpdateAuto.instance;
    };
    /**
     * _save - Sauvegarde les options de la tâche d'update
     * auto dans l'espace de stockage de Tampermonkey
     *
     * @return {UpdateAuto} L'instance unique UpdateAuto
     */
    UpdateAuto.prototype._save = function () {
        var objUpAuto = UpdateAuto.getValue('objUpAuto', {});
        var obj = {
            status: this._status,
            auto: this._auto,
            interval: this._interval
        };
        objUpAuto[this._showId] = obj;
        UpdateAuto.setValue('objUpAuto', objUpAuto);
        this._exist = true;
        this.changeColorBtn();
        return this;
    };
    Object.defineProperty(UpdateAuto.prototype, "show", {
        /**
         * Retourne l'objet Show associé
         * @returns {Show}
         */
        get: function () {
            return this._show;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(UpdateAuto.prototype, "status", {
        /**
         * get status - Retourne le statut de la tâche d'update auto
         * des épisodes
         *
         * @return {boolean}  Le statut
         */
        get: function () {
            return this._status;
        },
        /**
         * set status - Modifie le statut de la tâche d'update auto
         * des épisodes
         *
         * @param  {boolean} status Le statut de la tâche
         */
        set: function (status) {
            this._status = status;
            this._save();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(UpdateAuto.prototype, "auto", {
        /**
         * get auto - Flag indiquant l'autorisation de pouvoir lancer
         * la tâche d'update auto
         *
         * @return {boolean}  Flag d'autorisation
         */
        get: function () {
            return this._auto;
        },
        /**
         * set auto - Modifie l'autorisation de lancer la tâche
         * d'update auto
         *
         * @param  {boolean} auto Le flag
         */
        set: function (auto) {
            this._auto = auto;
            this._save();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(UpdateAuto.prototype, "interval", {
        /**
         * get interval - Retourne l'intervalle de temps entre
         * chaque update auto
         *
         * @return {number}  L'intervalle de temps en minutes
         */
        get: function () {
            return this._interval;
        },
        /**
         * set interval - Définit l'intervalle de temps, en minutes,
         * entre chaque update auto
         *
         * @param  {number} val L'intervalle de temps en minutes
         */
        set: function (val) {
            this._interval = val;
            this._save();
        },
        enumerable: false,
        configurable: true
    });
    /**
     * changeColorBtn - Modifie la couleur du bouton d'update
     * des épisodes sur la page Web
     *
     * @return {UpdateAuto} L'instance unique UpdateAuto
     */
    UpdateAuto.prototype.changeColorBtn = function () {
        var color = '#fff';
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
    };
    /**
     * stop - Permet de stopper la tâche d'update auto et
     * aussi de modifier le flag et l'intervalle en fonction
     * de l'état de la série
     *
     * @return {UpdateAuto} L'instance unique UpdateAuto
     */
    UpdateAuto.prototype.stop = function () {
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
    };
    /**
     * delete - Supprime les options d'update auto
     * de la série de l'espace de stockage
     *
     * @return {UpdateAuto} L'instance unique UpdateAuto
     */
    UpdateAuto.prototype.delete = function () {
        this.stop();
        var objUpAuto = UpdateAuto.getValue('objUpAuto', {});
        if (objUpAuto[this._showId] !== undefined) {
            delete objUpAuto[this._showId];
            UpdateAuto.setValue('objUpAuto', objUpAuto);
        }
        return this;
    };
    /**
     * launch - Permet de lancer la tâche d'update auto
     * des épisodes
     *
     * @return {UpdateAuto} L'instance unique UpdateAuto
     */
    UpdateAuto.prototype.launch = function () {
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
            var _this_1 = this;
            this._timer = setInterval(function () {
                // if (debug) console.log('UpdateAuto setInterval objShow', Object.assign({}, _this._objShow));
                if (!_this_1._auto || _this_1._show.user.remaining <= 0) {
                    if (Base_1.Base.debug)
                        console.log('Arrêt de la mise à jour auto des épisodes');
                    _this_1.stop();
                    return;
                }
                if (Base_1.Base.debug) {
                    var prefix = '';
                    if (typeof moment !== 'undefined') {
                        var now = new Date();
                        // eslint-disable-next-line no-undef
                        prefix = '[' + moment(now).format('DD/MM/YY HH:mm') + ']: ';
                    }
                    console.log('%supdate episode list', prefix);
                }
                var btnUpEpisodeList = $('.updateEpisodes');
                if (btnUpEpisodeList.length > 0) {
                    btnUpEpisodeList.trigger('click');
                    if (!_this_1._status) {
                        _this_1.status = true;
                    }
                }
            }, (this._interval * 60) * 1000);
        }
        return this;
    };
    UpdateAuto.getValue = function (name, defaultVal) {
        return Base_1.Base.cache.getOrDefault(Cache_1.DataTypesCache.updates, 'updateAuto', defaultVal);
    };
    UpdateAuto.setValue = function (name, val) {
        Base_1.Base.cache.set(Cache_1.DataTypesCache.updates, 'updateAuto', val);
    };
    UpdateAuto.intervals = [
        { val: 0, label: 'Jamais' },
        { val: 1, label: '1 min.' },
        { val: 5, label: '5 min.' },
        { val: 10, label: '10 min.' },
        { val: 15, label: '15 min.' },
        { val: 30, label: '30 min.' },
        { val: 45, label: '45 min.' },
        { val: 60, label: '60 min.' }
    ];
    return UpdateAuto;
}());

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
var Stats = /** @class */ (function () {
    function Stats(data) {
        for (var key in Object.keys(data)) {
            this[key] = data[key];
        }
    }
    return Stats;
}());
var Options = /** @class */ (function () {
    function Options(data) {
        for (var key in Object.keys(data)) {
            this[key] = data[key];
        }
    }
    return Options;
}());
/* eslint-disable-next-line no-unused-vars */
var Member = /** @class */ (function () {
    /**
     * Constructeur de la classe Membre
     * @param data Les données provenant de l'API
     * @returns {Member}
     */
    function Member(data) {
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
    Member.fetch = function () {
        var params = {};
        if (Base_1.Base.userId !== null) {
            params.id = Base_1.Base.userId;
        }
        return Base_1.Base.callApi(Base_1.HTTP_VERBS.GET, 'members', 'infos', params)
            .then(function (data) {
            return new Member(data.member);
        })
            .catch(function (err) {
            console.warn('Erreur lors de la récupération des infos du membre', err);
            throw new Error("Erreur de récupération du membre");
        });
    };
    return Member;
}());

/**
 * Remplit l'objet avec les données fournit en paramètre
 * @param  {Obj} data Les données provenant de l'API
 * @returns {Show}
 * @override
 */
Show_1.Show.prototype.fill = function (data) {
    this.aliases = data.aliases;
    this.creation = data.creation;
    this.country = data.country;
    this.images = null;
    if (data.images !== undefined && data.images != null) {
        this.images = new Show_1.Images(data.images);
    }
    this.nbEpisodes = parseInt(data.episodes, 10);
    this.network = data.network;
    this.next_trailer = data.next_trailer;
    this.next_trailer_host = data.next_trailer_host;
    this.rating = data.rating;
    this.platforms = null;
    if (data.platforms !== undefined && data.platforms != null) {
        this.platforms = new Show_1.Platforms(data.platforms);
    }
    if (this.id == null && this.seasons == null) {
        this.seasons = new Array();
        for (var s = 0; s < data.seasons_details.length; s++) {
            this.seasons.push(new Season_1.Season(data.seasons_details[s], this));
        }
    }
    this.showrunner = null;
    if (data.showrunner !== undefined && data.showrunner != null) {
        this.showrunner = new Show_1.Showrunner(data.showrunner);
    }
    this.social_links = data.social_links;
    this.status = data.status;
    this.thetvdb_id = parseInt(data.thetvdb_id, 10);
    this.pictures = null;
    this.mediaType = { singular: Base_1.MediaType.show, plural: 'shows', className: Show_1.Show };
    Media_1.Media.prototype.fill.call(this, data);
    return this.save();
};
/**
 * Retourne les similars associés au media
 * @return {Promise<Media>}
 */
Media_1.Media.prototype.fetchSimilars = function () {
    var _this_1 = this;
    var _this = this;
    this.similars = [];
    return new Promise(function (resolve, reject) {
        Base_1.Base.callApi('GET', _this_1.mediaType.plural, 'similars', { id: _this_1.id, details: true }, true)
            .then(function (data) {
            if (data.similars) {
                for (var s = 0; s < data.similars.length; s++) {
                    _this.similars.push(new Similar_1.Similar(data.similars[s][_this.mediaType.singular], _this.mediaType));
                }
            }
            _this.save();
            resolve(_this);
        }, function (err) {
            reject(err);
        });
    });
};
