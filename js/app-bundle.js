/*! betaseries_userscript - v1.1.2 - 2021-12-23
 * https://github.com/Azema/betaseries
 * Copyright (c) 2021 Azema;
 * Licensed Apache-2.0 License
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
class CacheUS {
    _data;
    constructor() {
        return this._init();
    }
    _init() {
        this._data = {};
        this._data[DataTypesCache.shows] = {};
        this._data[DataTypesCache.episodes] = {};
        this._data[DataTypesCache.movies] = {};
        this._data[DataTypesCache.members] = {};
        return this;
    }
    keys(type = null) {
        if (!type)
            return Object.keys(this._data);
        return Object.keys(this._data[type]);
    }
    has(type, key) {
        return (this._data[type] !== undefined && this._data[type][key] !== undefined);
    }
    clear(type = null) {
        if (type && this._data[type] !== undefined) {
            for (let key in this._data[type]) {
                delete this._data[type][key];
            }
        }
        else {
            this._init();
        }
        return this;
    }
    get(type, key) {
        if (this.has(type, key)) {
            return this._data[type][key];
        }
        return null;
    }
    getOrDefault(type, key, def) {
        return this.has(type, key) ? this.get(type, key) : def;
    }
    set(type, key, value) {
        if (this._data[type] !== undefined) {
            this._data[type][key] = value;
        }
        return this;
    }
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

class CommentBS {
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
    in_reply_id;
    in_reply_user;
    user_note;
    thumbs;
    thumbed;
    nbReplies;
    replies;
    from_admin;
    user_rank;
    first;
    last;
    _parent;
    constructor(data, parent) {
        this._parent = parent;
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
        this.user_note = parseInt(data.user_note, 10);
        this.thumbs = parseInt(data.thumbs, 10);
        this.thumbed = data.thumbed;
        this.nbReplies = parseInt(data.replies, 10);
        this.replies = new Array();
        this.from_admin = data.from_admin;
        this.user_rank = data.user_rank;
        this.first = !!data.first;
        this.last = !!data.last;
    }
    display() {
        const _this = this, $popup = jQuery('#popin-dialog'), $contentHtmlElement = $popup.find(".popin-content-html"), $contentReact = $popup.find('.popin-content-reactmodule'), $title = $contentHtmlElement.find(".title"), $text = $popup.find("p"), $closeButtons = $popup.find("#popin-showClose"), hidePopup = () => {
            $popup.attr('aria-hidden', 'true');
            $popup.find("#popupalertyes").show();
            $popup.find("#popupalertno").show();
            $contentHtmlElement.hide();
            $popup.find('.comments .comment .btnThumb').off('click');
            $popup.find('.btnToggleOptions').off('click');
        }, showPopup = () => {
            $popup.find("#popupalertyes").hide();
            $popup.find("#popupalertno").hide();
            $contentHtmlElement.show();
            $contentReact.hide();
            $closeButtons.show();
            $popup.attr('aria-hidden', 'false');
        };
        hidePopup();
        function renderNote(note) {
            let typeSvg, template = '';
            Array.from({
                length: 5
            }, (_index, number) => {
                typeSvg = note <= number ? "empty" : (note < number + 1) ? 'half' : "full";
                template += `
                    <svg viewBox="0 0 100 100" class="star-svg">
                      <use xmlns:xlink="http://www.w3.org/1999/xlink"
                           xlink:href="#icon-star-${typeSvg}">
                      </use>
                    </svg>
                `;
            });
            return template;
        }
        function templateComment(comment) {
            let spoiler = /\[spoiler\]/.test(comment.text);
            let className = (comment.in_reply_to !== 0) ? 'iv_i5' : '';
            return `
                <div class="comment ${className} positionRelative iv_iz" style="animation: 3s ease 0s 1 normal forwards running backgroundFadeOut;">
                    <div class="media">
                        <div class="media-left">
                            <a href="/membre/${comment.login}" class="avatar">
                                <img src="https://api.betaseries.com/pictures/members?key=${Base.userKey}&amp;id=${comment.user_id}&amp;width=64&amp;height=64&amp;placeholder=png" width="32" height="32" alt="">
                            </a>
                        </div>
                        <div class="media-body">
                            <a href="/membre/${comment.login}">
                                <span class="mainLink">${comment.login}</span>&nbsp;
                                <span class="mainLink mainLink--regular">&nbsp;</span>
                            </a>
                            <span style="line-height: 15px; word-break: break-word;${spoiler ? 'display:none;' : ''}" class="comment-text">${comment.text}</span>
                            ${spoiler ? '<button type="button" class="btn-reset mainLink view-spoiler" style="vertical-align: 0px;">Voir le spoiler</button>' : ''}
                            <div class="iv_i3">
                                <div class="options-main options-comment" data-commentId="${comment.id}">
                                    <button type="button" class="btn-reset btnUpVote btnThumb">
                                        <svg data-disabled="false" class="SvgLike" fill="#fff" width="16" height="14" viewBox="0 0 16 14" xmlns="http://www.w3.org/2000/svg">
                                            <g fill="inherit" fill-rule="nonzero">
                                                <path fill="#fff" fill-rule="evenodd" d="M.67 6h2.73v8h-2.73v-8zm14.909.67c0-.733-.614-1.333-1.364-1.333h-4.302l.648-3.047.02-.213c0-.273-.116-.527-.3-.707l-.723-.7-4.486 4.393c-.252.24-.402.573-.402.94v6.667c0 .733.614 1.333 1.364 1.333h6.136c.566 0 1.05-.333 1.255-.813l2.059-4.7c.061-.153.095-.313.095-.487v-1.273l-.007-.007.007-.053z"></path>
                                                <path class="SvgLikeStroke" stroke="#54709D" d="M1.17 6.5v7h1.73v-7h-1.73zm13.909.142c-.016-.442-.397-.805-.863-.805h-4.92l.128-.604.639-2.99.018-.166c0-.13-.055-.257-.148-.348l-.373-.361-4.144 4.058c-.158.151-.247.355-.247.578v6.667c0 .455.387.833.864.833h6.136c.355 0 .664-.204.797-.514l2.053-4.685c.04-.1.06-.198.06-.301v-1.063l-.034-.034.034-.265z"></path>
                                            </g>
                                        </svg>
                                    </button>
                                    <button type="button" class="btn-reset btnDownVote btnThumb">
                                        <svg data-disabled="false" class="SvgLike" fill="#fff" width="16" height="14" viewBox="0 0 16 14" xmlns="http://www.w3.org/2000/svg" style="transform: rotate(180deg) scaleX(-1); margin-left: 4px; vertical-align: -4px;">
                                            <g fill="inherit" fill-rule="nonzero">
                                                <path fill="#fff" fill-rule="evenodd" d="M.67 6h2.73v8h-2.73v-8zm14.909.67c0-.733-.614-1.333-1.364-1.333h-4.302l.648-3.047.02-.213c0-.273-.116-.527-.3-.707l-.723-.7-4.486 4.393c-.252.24-.402.573-.402.94v6.667c0 .733.614 1.333 1.364 1.333h6.136c.566 0 1.05-.333 1.255-.813l2.059-4.7c.061-.153.095-.313.095-.487v-1.273l-.007-.007.007-.053z"></path>
                                                <path class="SvgLikeStroke" stroke="#54709D" d="M1.17 6.5v7h1.73v-7h-1.73zm13.909.142c-.016-.442-.397-.805-.863-.805h-4.92l.128-.604.639-2.99.018-.166c0-.13-.055-.257-.148-.348l-.373-.361-4.144 4.058c-.158.151-.247.355-.247.578v6.667c0 .455.387.833.864.833h6.136c.355 0 .664-.204.797-.514l2.053-4.685c.04-.1.06-.198.06-.301v-1.063l-.034-.034.034-.265z"></path>
                                            </g>
                                        </svg>
                                    </button>
                                    <strong class="mainLink" style="margin-left: 5px;">${comment.nbReplies > 0 ? '+' + comment.nbReplies : (comment.nbReplies < 0) ? '-' + comment.nbReplies : comment.nbReplies}</strong>
                                    <span class="mainLink">&nbsp;∙&nbsp;</span>
                                    <button type="button" class="btn-reset mainLink mainLink--regular btnResponse" style="vertical-align: 0px;">Répondre</button>
                                    <a href="#c_1269819" class="mainTime">
                                        <span class="mainLink">&nbsp;∙&nbsp;</span>
                                        Le ${typeof moment !== 'undefined' ? moment(comment.date).format('D MM YYYY HH:mm') : comment.date.toString()}
                                    </a>
                                    <span class="stars" title="${comment.user_note} / 5">
                                        ${renderNote(comment.user_note)}
                                    </span>
                                    <div class="iv_ix">
                                        <button type="button" class="btn-reset btnToggleOptions">
                                            <span class="svgContainer">
                                                <svg width="4" height="16" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="transform: rotate(90deg);">
                                                    <defs>
                                                        <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" id="svgthreedots"></path>
                                                    </defs>
                                                    <use fill="rgba(255, 255, 255, .5)" fill-rule="nonzero" xlink:href="#svgthreedots" transform="translate(-10 -4)"></use>
                                                </svg>
                                            </span>
                                        </button>
                                    </div>
                                </div>
                                <div class="options-options options-comment" style="display:none;">
                                    <a href="/messages/nouveau?login=${comment.login}" class="mainLink">Envoyer un message</a>
                                    <span class="mainLink">&nbsp;∙&nbsp;</span>
                                    <button type="button" class="btn-reset mainLink btnSignal" style="vertical-align: 0px;">Signaler</button>
                                    <button type="button" class="btn-reset btnToggleOptions" style="margin-left: 4px;">
                                        <span class="svgContainer">
                                            <svg fill="#333" width="9" height="9" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M14 1.41l-1.41-1.41-5.59 5.59-5.59-5.59-1.41 1.41 5.59 5.59-5.59 5.59 1.41 1.41 5.59-5.59 5.59 5.59 1.41-1.41-5.59-5.59z"></path>
                                            </svg>
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
        let template = '<div class="comments overflowYScroll" style="margin-bottom: 0px;">';
        template += templateComment(this);
        let promise = Promise.resolve(true);
        if (this.nbReplies > 0 && this.replies.length <= 0) {
            promise = this._parent.fetchRepliesOfComment(this.id)
                .then((replies) => {
                _this.replies = replies;
                for (let r = 0; r < replies.length; r++) {
                    template += templateComment(replies[r]);
                }
                return true;
            });
        }
        else if (this.nbReplies > 0) {
            for (let r = 0; r < this.replies.length; r++) {
                template += templateComment(this.replies[r]);
            }
        }
        promise.then(() => {
            $popup.attr('data-popin-type', 'comments');
            $title.empty().append('Commentaires <i class="fa fa-chevron-circle-left prev-comment" aria-hidden="true"></i> <i class="fa fa-chevron-circle-right next-comment" aria-hidden="true"></i>');
            $text.empty().append(template + '</div>');
            $closeButtons.click(() => {
                hidePopup();
                $popup.removeAttr('data-popin-type');
            });
            const $prevCmt = $title.find('.prev-comment');
            if (this.first) {
                $prevCmt.css('color', 'grey').css('cursor', 'initial');
            }
            else {
                $prevCmt.click((e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    $popup.find('.comments .comment .btnThumb').off('click');
                    $popup.find('.btnToggleOptions').off('click');
                    $popup.find('i.fa').off('click');
                    _this._parent.getPrevComment(_this.id).display();
                });
            }
            const $nextCmt = $title.find('.next-comment');
            if (this.last) {
                $nextCmt.css('color', 'grey').css('cursor', 'initial');
            }
            else {
                $nextCmt.click((e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    $popup.find('.comments .comment .btnThumb').off('click');
                    $popup.find('.btnToggleOptions').off('click');
                    $popup.find('i.fa').off('click');
                    _this._parent.getNextComment(_this.id).display();
                });
            }
            const $btnSpoiler = $text.find('.view-spoiler');
            if ($btnSpoiler.length > 0) {
                $btnSpoiler.click((e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    $(e.currentTarget).prev('span.comment-text').fadeIn();
                    $(e.currentTarget).fadeOut();
                });
            }
            $popup.find('.comments .comment .btnThumb').click((e) => {
                e.stopPropagation();
                e.preventDefault();
                const $btn = jQuery(e.currentTarget);
                const commentId = parseInt($btn.parent().data('commentId'), 10);
                let params = { id: commentId, type: 1, switch: false };
                if ($btn.data('thumbed') == '1') {
                    params.switch = true;
                }
                if ($btn.hasClass('btnDownVote')) {
                    params.type = -1;
                }
                Base.callApi(HTTP_VERBS.POST, 'comments', 'thumb', params)
                    .then((data) => {
                    if (commentId == _this.id) {
                        _this.thumbs = data.comment.thumbs;
                    }
                    else {
                        _this._parent.changeThumbsComment(commentId, data.comment.thumbs);
                    }
                    $btn.attr('data-thumbed', '1');
                });
            });
            $popup.find('.btnToggleOptions').click((e) => {
                e.stopPropagation();
                e.preventDefault();
                jQuery(e.currentTarget).parents('.iv_i3').first()
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
            showPopup();
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
    constructor(data, parent) {
        this.total = parseInt(data.total, 10);
        this.mean = parseInt(data.mean, 10);
        this.user = parseInt(data.user, 10);
        this._parent = parent;
    }
    total;
    mean;
    user;
    _parent;
    getPercentage() {
        return Math.round(((this.mean / 5) * 100) / 10) * 10;
    }
    toString() {
        const votes = 'vote' + (this.total > 1 ? 's' : ''), total = new Intl.NumberFormat('fr-FR', { style: 'decimal', useGrouping: true }).format(this.total), note = this.mean.toFixed(1);
        let toString = `${total} ${votes} : ${note} / 5`;
        if (this.user > 0) {
            toString += `, votre note: ${this.user}`;
        }
        return toString;
    }
    createPopupForVote() {
        const _this = this, $popup = jQuery('#popin-dialog'), $contentHtmlElement = $popup.find(".popin-content-html"), $contentReact = $popup.find('.popin-content-reactmodule'), $title = $contentHtmlElement.find(".title"), $text = $popup.find("p"), $closeButtons = $popup.find("#popin-showClose"), hidePopup = () => {
            $popup.attr('aria-hidden', 'true');
            $popup.find("#popupalertyes").show();
            $popup.find("#popupalertno").show();
            $contentHtmlElement.hide();
            $text.find('.star-svg').off('mouseenter').off('mouseleave').off('click');
        }, showPopup = () => {
            $popup.find("#popupalertyes").hide();
            $popup.find("#popupalertno").hide();
            $contentHtmlElement.show();
            $contentReact.hide();
            $closeButtons.show();
            $popup.attr('aria-hidden', 'false');
        };
        hidePopup();
        let template = '<div style="display: flex; justify-content: center; margin-bottom: 15px;"><div role="button" tabindex="0" class="stars btn-reset">', className;
        for (let i = 1; i <= 5; i++) {
            className = this.user <= i - 1 ? StarTypes.EMPTY : StarTypes.FULL;
            template += `
                <svg viewBox="0 0 100 100" class="star-svg" data-number="${i}" style="width: 30px; height: 30px;">
                    <use xlink:href="#icon-starblue-${className}"></use>
                </svg>`;
        }
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
            $stars.off('mouseenter').off('mouseleave');
            _this._parent.addVote(note)
                .then((result) => {
                hidePopup();
                if (result) {
                    _this._parent.changeTitleNote(true);
                }
                else {
                    Base.notification('Erreur Vote', "Une erreur s'est produite durant le vote");
                }
            })
                .catch(() => hidePopup());
        });
        showPopup();
    }
    renderStars() {
        const $stars = jQuery('.blockInformations__metadatas .js-render-stars .star-svg use');
        const note = Math.round(this.mean);
        let className;
        for (let s = 0; s < 5; s++) {
            className = (note <= s) ? StarTypes.EMPTY : (note < s + 1) ? StarTypes.HALF : StarTypes.FULL;
            $($stars.get(s)).attr('xlink:href', `#icon-star-${className}`);
        }
    }
}

class Next {
    constructor(data) {
        this.id = (data.id !== undefined) ? parseInt(data.id, 10) : null;
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
})(EventTypes = EventTypes || (EventTypes = {}));
var HTTP_VERBS;
(function (HTTP_VERBS) {
    HTTP_VERBS["GET"] = "GET";
    HTTP_VERBS["POST"] = "POST";
    HTTP_VERBS["PUT"] = "PUT";
    HTTP_VERBS["DELETE"] = "DELETE";
    HTTP_VERBS["OPTIONS"] = "OPTIONS";
})(HTTP_VERBS = HTTP_VERBS || (HTTP_VERBS = {}));
class Base {
    static debug = false;
    static cache = null;
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
    static token = null;
    static userKey = null;
    static userId = null;
    static themoviedb_api_user_key = null;
    static counter = 0;
    static serverBaseUrl = '';
    static notification = function () { };
    static userIdentified = function () { };
    static noop = function () { };
    static trans = function (msg, ...args) { };
    static ratings = null;
    static EventTypes = new Array(EventTypes.UPDATE, EventTypes.SAVE);
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
    static callApi(type, resource, action, args, force = false) {
        if (Base.api && Base.api.resources.indexOf(resource) === -1) {
            throw new Error(`Ressource (${resource}) inconnue dans l'API.`);
        }
        if (!Base.token || !Base.userKey) {
            throw new Error('Token and userKey are required');
        }
        let check = false, myHeaders = {
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
        if (Base.cache && !force && type === 'GET' && args && 'id' in args &&
            Base.cache.has(resource, args.id)) {
            return new Promise((resolve) => {
                resolve(Base.cache.get(resource, args.id));
            });
        }
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
                Base.counter++;
                if (Base.debug)
                    console.log('fetch (%s %s) response status: %d', type, uri, response.status);
                response.json().then((data) => {
                    if (Base.debug)
                        console.log('fetch (%s %s) data', type, uri, data);
                    if (data.errors !== undefined && data.errors.length > 0) {
                        const code = data.errors[0].code, text = data.errors[0].text;
                        if (code === 2005 ||
                            (response.status === 400 && code === 0 &&
                                text === "L'utilisateur a déjà marqué cet épisode comme vu.")) {
                            reject('changeStatus');
                        }
                        else if (code == 2001) {
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
                    Base.counter++;
                    if (!resp.ok) {
                        Base.authenticate().then(() => {
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
    constructor(data) {
        if (!(data instanceof Object)) {
            throw new Error("data is not an object");
        }
        this._initListeners();
        return this;
    }
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
                this.comments.push(new CommentBS(data.comments[c], this));
            }
        }
        this.objNote = (data.note) ? new Note(data.note, this) : new Note(data.notes, this);
        this.resource_url = data.resource_url;
        this.title = data.title;
        this.user = new User(data.user);
        this.description = data.description;
        return this;
    }
    _initListeners() {
        this._listeners = {};
        const EvtTypes = this.constructor.EventTypes;
        for (let e = 0; e < EvtTypes.length; e++) {
            this._listeners[EvtTypes[e]] = new Array();
        }
        return this;
    }
    addListener(name, fn) {
        if (this.constructor.EventTypes.indexOf(name) < 0) {
            throw new Error(`${name} ne fait pas partit des events gérés par cette classe`);
        }
        if (this._listeners[name] === undefined) {
            this._listeners[name] = new Array();
        }
        this._listeners[name].push(fn);
        return this;
    }
    removeListener(name, fn) {
        if (this._listeners[name] !== undefined) {
            for (let l = 0; l < this._listeners[name].length; l++) {
                if (this._listeners[name][l] === fn)
                    this._listeners[name].splice(l, 1);
            }
        }
        return this;
    }
    _callListeners(name) {
        if (this._listeners[name] !== undefined) {
            for (let l = 0; l < this._listeners[name].length; l++) {
                this._listeners[name][l].call(this, this);
            }
        }
        return this;
    }
    save() {
        if (Base.cache instanceof CacheUS) {
            Base.cache.set(this.mediaType.plural, this.id, this);
            this._callListeners(EventTypes.SAVE);
        }
        return this;
    }
    get elt() {
        return this._elt;
    }
    set elt(elt) {
        this._elt = elt;
    }
    get nbCharacters() {
        return this.characters.length;
    }
    get nbComments() {
        return this.comments.length;
    }
    decodeTitle() {
        let $elt = this.elt.find('.blockInformations__title'), title = $elt.text();
        if (/&#/.test(title)) {
            $elt.text($('<textarea />').html(title).text());
        }
        return this;
    }
    changeTitleNote(change = true) {
        const $elt = this.elt.find('.js-render-stars');
        if (this.objNote.mean <= 0 || this.objNote.total <= 0) {
            if (change)
                $elt.attr('title', 'Aucun vote');
            return;
        }
        const votes = 'vote' + (this.objNote.total > 1 ? 's' : ''), total = new Intl.NumberFormat('fr-FR', { style: 'decimal', useGrouping: true })
            .format(this.objNote.total), note = this.objNote.mean.toFixed(1);
        let title = `${total} ${votes} : ${note} / 5`;
        if (Base.userIdentified() && this.objNote.user > 0) {
            title += `, votre note: ${this.objNote.user}`;
        }
        if (change) {
            $elt.attr('title', title);
        }
        return title;
    }
    addNumberVoters() {
        const _this = this;
        const votes = $('.stars.js-render-stars');
        let title = this.changeTitleNote(true);
        new MutationObserver((mutationsList) => {
            const changeTitleMutation = () => {
                const upTitle = _this.changeTitleNote(false);
                if (upTitle !== title) {
                    votes.attr('title', upTitle);
                    title = upTitle;
                }
            };
            let mutation;
            for (mutation of mutationsList) {
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
    addVote(note) {
        const _this = this;
        return new Promise((resolve, reject) => {
            Base.callApi(HTTP_VERBS.POST, this.mediaType.plural, 'note', { id: this.id, note: note })
                .then((data) => {
                _this.fill(data[this.mediaType.singular]);
                resolve(true);
            })
                .catch(err => {
                Base.notification('Erreur de vote', 'Une erreur s\'est produite lors de l\'envoi de la note: ' + err);
                reject(err);
            });
        });
    }
    fetchComments(nbpp = 50, since = 0) {
        const _this = this;
        return new Promise((resolve, reject) => {
            let params = {
                type: _this.mediaType.singular,
                id: _this.id,
                nbpp: nbpp,
                replies: 0,
                order: 'desc'
            };
            if (since > 0) {
                params.since_id = since;
            }
            Base.callApi(HTTP_VERBS.GET, 'comments', 'comments', params)
                .then((data) => {
                if (data.comments !== undefined) {
                    if (since <= 0) {
                        _this.comments = new Array();
                    }
                    else {
                        this.comments[this.comments.length - 1].last = false;
                    }
                    for (let c = 0; c < data.comments.length; c++) {
                        data.comments[c].first = data.comments[c].last = false;
                        if (c === 0 && since <= 0)
                            data.comments[c].first = true;
                        if (c === data.comments.length - 1)
                            data.comments[c].last = true;
                        _this.comments.push(new CommentBS(data.comments[c], this));
                    }
                }
                resolve(_this);
            })
                .catch(err => {
                console.warn('fetchComments', err);
                Base.notification('Récupération des commentaires', "Une erreur est apparue durant la récupération des commentaires");
                reject(err);
            });
        });
    }
    getComment(cId) {
        for (let c = 0; c < this.comments.length; c++) {
            if (this.comments[c].id === cId) {
                return this.comments[c];
            }
        }
        return null;
    }
    getPrevComment(cId) {
        for (let c = 0; c < this.comments.length; c++) {
            if (this.comments[c].id === cId && c > 0) {
                return this.comments[c - 1];
            }
        }
        return null;
    }
    getNextComment(cId) {
        const len = this.comments.length;
        for (let c = 0; c < this.comments.length; c++) {
            if (this.comments[c].id === cId && c < len - 1) {
                return this.comments[c + 1];
            }
        }
        return null;
    }
    async fetchRepliesOfComment(commentId) {
        const data = await Base.callApi(HTTP_VERBS.GET, 'comments', 'replies', { id: commentId, order: 'desc' });
        const replies = new Array();
        if (data.comments) {
            for (let c = 0; c < data.comments.length; c++) {
                replies.push(new CommentBS(data.comments[c], this));
            }
        }
        return replies;
    }
    changeThumbsComment(commentId, thumbs) {
        for (let c = 0; c < this.comments.length; c++) {
            if (this.comments[c].id === commentId) {
                this.comments[c].thumbs = thumbs;
                return true;
            }
        }
        return false;
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
    _in_account;
    constructor(data) {
        super(data);
        return this;
    }
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
        this.in_account = data.in_account;
        super.fill(data);
        return this;
    }
    get in_account() {
        return this._in_account;
    }
    set in_account(i) {
        this._in_account = !!i;
    }
    fetchSimilars() {
        return new Promise(resolve => resolve(this));
    }
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
    static EventTypes = new Array(EventTypes.UPDATE, EventTypes.SAVE, EventTypes.ADD, EventTypes.REMOVE);
    static fetch(id, force = false) {
        return new Promise((resolve, reject) => {
            Base.callApi('GET', 'shows', 'display', { id: id }, force)
                .then(data => resolve(new Show(data, jQuery('.blockInformations'))))
                .catch(err => reject(err));
        });
    }
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
    constructor(data, element) {
        super(data);
        this.elt = element;
        return this.fill(data)._init();
    }
    _init() {
        if (this.in_account) {
            this.deleteShowClick();
        }
        else {
            this.addShowClick();
        }
        return this;
    }
    fetch(force = true) {
        return Base.callApi('GET', 'shows', 'display', { id: this.id }, force);
    }
    isEnded() {
        return (this.status.toLowerCase() === 'ended') ? true : false;
    }
    isArchived() {
        return this.user.archived;
    }
    isFavorite() {
        return this.user.favorited;
    }
    addToAccount() {
        const _this = this;
        if (this.in_account)
            return new Promise(resolve => resolve(_this));
        return new Promise((resolve, reject) => {
            Base.callApi('POST', 'shows', 'show', { id: _this.id })
                .then(data => {
                _this.fill(data.show);
                _this._callListeners(EventTypes.ADD);
                _this.save();
                resolve(_this);
            }, err => {
                reject(err);
            });
        });
    }
    removeFromAccount() {
        const _this = this;
        if (!this.in_account)
            return new Promise(resolve => resolve(_this));
        return new Promise((resolve, reject) => {
            Base.callApi('DELETE', 'shows', 'show', { id: _this.id })
                .then(data => {
                _this.fill(data.show);
                _this._callListeners(EventTypes.REMOVE);
                _this.save();
                resolve(this);
            }, err => {
                reject(err);
            });
        });
    }
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
        if (this.user.remaining === 0 && this.in_account) {
            let promise = new Promise(resolve => { return resolve(void 0); });
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
    updateProgressBar() {
        if (Base.debug)
            console.log('updateProgressBar');
        jQuery('.progressBarShow').css('width', this.user.status.toFixed(1) + '%');
    }
    updateNextEpisode(cb = Base.noop) {
        if (Base.debug)
            console.log('updateNextEpisode');
        const $nextEpisode = jQuery('a.blockNextEpisode');
        if ($nextEpisode.length > 0 && this.user.next && !isNaN(this.user.next.id)) {
            if (Base.debug)
                console.log('nextEpisode et show.user.next OK', this.user);
            const $img = $nextEpisode.find('img'), $remaining = $nextEpisode.find('.remaining div'), $parent = $img.parent('div'), height = $img.attr('height'), width = $img.attr('width'), next = this.user.next, src = `${Base.api.url}/pictures/episodes?key=${Base.userKey}&id=${next.id}&width=${width}&height=${height}`;
            $img.remove();
            $parent.append(`<img src="${src}" height="${height}" width="${width}" />`);
            $nextEpisode.find('.titleEpisode').text(`${next.code.toUpperCase()} - ${next.title}`);
            $nextEpisode.attr('href', $nextEpisode.attr('href').replace(/s\d{2}e\d{2}/, next.code.toLowerCase()));
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
    addShowClick(trigEpisode = false) {
        const _this = this;
        const vignettes = $('#episodes .slide__image');
        if (!this.in_account) {
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
            jQuery('#reactjs-show-actions > div > button').off('click').one('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                if (Base.debug)
                    console.groupCollapsed('AddShow');
                const done = function () {
                    changeBtnAdd(_this);
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
            const divs = jQuery('#reactjs-show-actions > div');
            if (divs.length === 1) {
                jQuery('#reactjs-show-actions').remove();
                let $container = jQuery('.blockInformations__actions'), method = 'prepend';
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
                let vignette;
                for (let v = 0; v < vignettes.length; v++) {
                    vignette = $(vignettes.get(v));
                    if (vignette.find('.seen').length <= 0) {
                        vignette.find('img.js-lazy-image').attr('style', 'filter: blur(5px);');
                    }
                }
                const $stars = jQuery('.blockInformations__metadatas .js-render-stars');
                $stars.replaceWith(`
                    <button type="button" class="btn-reset fontSize0">
                        <span class="stars js-render-stars">
                            ${$stars.html()}
                        </span>
                    </button>`);
                _this.elt = $('.blockInformations');
                _this.addNumberVoters();
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
    deleteShowClick() {
        const _this = this;
        let $optionsLinks = $('#dropdownOptions').siblings('.dropdown-menu').children('a.header-navigation-item');
        if (this.in_account && $optionsLinks.length > 2) {
            this.addEventBtnsArchiveAndFavoris();
            $optionsLinks.last().removeAttr('onclick').off('click').on('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                const done = function () {
                    const afterNotif = function () {
                        _this.user.status = 0;
                        _this.user.archived = false;
                        _this.user.favorited = false;
                        _this.user.remaining = 0;
                        _this.user.last = "S00E00";
                        _this.user.next.id = NaN;
                        _this.save();
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
                        $optionsLinks.first().siblings().each((i, e) => { $(e).remove(); });
                        const checks = jQuery('#episodes .slide_flex');
                        let promise, update = false;
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
                        const $stars = jQuery('.blockInformations__metadatas .js-render-stars');
                        $stars.parent().replaceWith(`
                        <span class="stars js-render-stars">
                        ${$stars.html()}
                        </span>`);
                        _this.elt = $('.blockInformations');
                        _this.addNumberVoters();
                        _this.addShowClick();
                    };
                    new PopupAlert({
                        title: Base.trans("popup.delete_show_success.title"),
                        text: Base.trans("popup.delete_show_success.text", { "%title%": _this.title }),
                        yes: Base.trans("popup.delete_show_success.yes"),
                        callback_yes: afterNotif
                    });
                };
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
    addEventBtnsArchiveAndFavoris() {
        const _this = this;
        let $btnArchive = jQuery('#reactjs-show-actions button.btn-archive'), $btnFavoris = jQuery('#reactjs-show-actions button.btn-favoris');
        if ($btnArchive.length === 0 || $btnFavoris.length === 0) {
            $('#reactjs-show-actions button:first').addClass('btn-archive');
            $btnArchive = jQuery('#reactjs-show-actions button.btn-archive');
            $('#reactjs-show-actions button:last').addClass('btn-favoris');
            $btnFavoris = jQuery('#reactjs-show-actions button.btn-favoris');
        }
        $btnArchive.off('click').click((e) => {
            e.stopPropagation();
            e.preventDefault();
            if (Base.debug)
                console.groupCollapsed('show-archive');
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
    addRating() {
        if (Base.debug)
            console.log('addRating');
        if (this.rating) {
            let rating = Base.ratings[this.rating] !== undefined ? Base.ratings[this.rating] : null;
            if (rating !== null) {
                jQuery('.blockInformations__details')
                    .append(`<li id="rating"><strong>Classification</strong>
                        <img src="${rating.img}" title="${rating.title}"/>
                    </li>`);
            }
        }
    }
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
class Movie extends Media {
    static fetch(id, force = false) {
        return new Promise((resolve, reject) => {
            Base.callApi('GET', 'movies', 'movie', { id: id }, force)
                .then(data => resolve(new Movie(data, jQuery('.blockInformations'))))
                .catch(err => reject(err));
        });
    }
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
    constructor(data, element) {
        if (data.user.in_account !== undefined) {
            data.in_account = data.user.in_account;
            delete data.user.in_account;
        }
        super(data);
        this.elt = element;
        return this.fill(data);
    }
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
        return this.save();
    }
    markAsView() {
        return this.changeStatus(MovieStatus.SEEN);
    }
    markToSee() {
        return this.changeStatus(MovieStatus.TOSEE);
    }
    markDontWantToSee() {
        return this.changeStatus(MovieStatus.DONTWANTTOSEE);
    }
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
        if (data.episodes && data.episodes instanceof Array && data.episodes[0] instanceof Episode) {
            this.episodes = data.episodes;
        }
        return this;
    }
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
                    _this.episodes.push(new Episode(data.episodes[e], _this._show, _this));
                }
                resolve(_this);
            }, err => {
                reject(err);
            });
        });
    }
    getEpisode(id) {
        for (let e = 0; e < this.episodes.length; e++) {
            if (this.episodes[e].id === id) {
                return this.episodes[e];
            }
        }
        return null;
    }
    getNbEpisodesSeen() {
        let nbEpisodesSeen = 0;
        for (let e = 0; e < this.episodes.length; e++) {
            if (this.episodes[e].user.seen)
                nbEpisodesSeen++;
        }
        return nbEpisodesSeen;
    }
    getNbEpisodesSpecial() {
        let nbEpisodesSpecial = 0;
        for (let e = 0; e < this.episodes.length; e++) {
            if (this.episodes[e].special)
                nbEpisodesSpecial++;
        }
        return nbEpisodesSpecial;
    }
}
class Episode extends Base {
    _season;
    code;
    date;
    director;
    episode;
    global;
    numSeason;
    platform_links;
    releasesSvod;
    seen_total;
    show;
    special;
    subtitles;
    thetvdb_id;
    watched_by;
    writers;
    youtube_id;
    constructor(data, show, season) {
        super(data);
        this.show = show;
        this._season = season;
        return this.fill(data);
    }
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
        this.subtitles = new Array();
        if (data.subtitles !== undefined) {
            for (let s = 0; s < data.subtitles.length; s++) {
                this.subtitles.push(new Subtitle(data.subtitles[s]));
            }
        }
        this.thetvdb_id = parseInt(data.thetvdb_id, 10);
        this.watched_by = data.watched_by;
        this.writers = data.writers;
        this.youtube_id = data.youtube_id;
        this.mediaType = { singular: MediaType.episode, plural: 'episodes', className: Episode };
        super.fill(data);
        return this.save();
    }
    addAttrTitle() {
        if (this.elt)
            this.elt.find('.slide__title').attr('title', this.title);
        return this;
    }
    initCheckSeen(pos) {
        const $checkbox = this.elt.find('.checkSeen');
        if ($checkbox.length > 0 && this.user.seen) {
            $checkbox.attr('id', 'episode-' + this.id);
            $checkbox.attr('data-id', this.id);
            $checkbox.attr('data-pos', pos);
            $checkbox.attr('data-special', this.special ? '1' : '0');
            $checkbox.attr('title', Base.trans("member_shows.remove"));
            $checkbox.addClass('seen');
        }
        else if ($checkbox.length <= 0 && !this.user.seen && !this.user.hidden) {
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
    updateCheckSeen(pos) {
        const $checkSeen = this.elt.find('.checkSeen');
        let changed = false;
        if ($checkSeen.length > 0 && $checkSeen.attr('id') === undefined) {
            if (Base.debug)
                console.log('ajout de l\'attribut ID à l\'élément "checkSeen"');
            $checkSeen.attr('id', 'episode-' + this.id);
            $checkSeen.data('id', this.id);
            $checkSeen.data('pos', pos);
            $checkSeen.data('special', this.special ? '1' : '0');
        }
        if (this.user.seen && $checkSeen.length > 0 && !$checkSeen.hasClass('seen')) {
            if (Base.debug)
                console.log('Changement du statut (seen) de l\'épisode %s', this.code);
            this.updateRender('seen', false);
            changed = true;
        }
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
    getTitlePopup() {
        return `<span style="color: var(--link_color);">Synopsis épisode ${this.code}</span>`;
    }
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
            for (let v = 0; v < pos; v++) {
                if (!$($vignettes.get(v)).hasClass('seen')) {
                    promise = createPromise();
                    break;
                }
            }
        }
        promise.then((response) => {
            if (method === HTTP_VERBS.POST && !response) {
                args.bulk = false;
            }
            Base.callApi(method, 'episodes', 'watched', args).then((data) => {
                if (Base.debug)
                    console.log('updateStatus %s episodes/watched', method, data);
                if (!(_this.show instanceof Show) && Base.cache.has(DataTypesCache.shows, data.show.id)) {
                    _this.show = Base.cache.get(DataTypesCache.shows, data.show.id);
                }
                if (!_this.show.in_account && data.episode.show.in_account) {
                    _this.show.in_account = true;
                    _this.show.save();
                }
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
                    .save();
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
    updateRender(newStatus, update = true) {
        const _this = this;
        const $elt = this.elt.find('.checkSeen');
        const lenEpisodes = _this._season.episodes.length;
        const lenNotSpecial = lenEpisodes - _this._season.getNbEpisodesSpecial();
        if (Base.debug)
            console.log('changeStatus', { elt: $elt, status: newStatus, update: update });
        if (newStatus === 'seen') {
            $elt.css('background', '');
            $elt.addClass('seen');
            $elt.attr('title', Base.trans("member_shows.remove"));
            $elt.parents('div.slide__image').first().find('img').removeAttr('style');
            $elt.parents('div.slide_flex').first().removeClass('slide--notSeen');
            const moveSeason = function () {
                const slideCurrent = jQuery('#seasons div.slide--current');
                slideCurrent.find('.slide__image').prepend('<div class="checkSeen"></div>');
                slideCurrent
                    .removeClass('slide--notSeen')
                    .addClass('slide--seen');
                if (Base.debug)
                    console.log('Tous les épisodes de la saison ont été vus', slideCurrent);
                if (slideCurrent.next().length > 0) {
                    if (Base.debug)
                        console.log('Il y a une autre saison');
                    slideCurrent.next().trigger('click');
                    let seasonNumber = _this.show.currentSeason.number + 1;
                    _this.show.setCurrentSeason(seasonNumber);
                    slideCurrent.removeClass('slide--current');
                }
            };
            const lenSeen = _this._season.getNbEpisodesSeen();
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
            $elt.css('background', 'rgba(13,21,28,.2)');
            $elt.removeClass('seen');
            $elt.attr('title', Base.trans("member_shows.markas"));
            $elt.parents('div.slide__image').first()
                .find('img')
                .attr('style', 'filter: blur(5px);');
            const contVignette = $elt.parents('div.slide_flex').first();
            if (!contVignette.hasClass('slide--notSeen')) {
                contVignette.addClass('slide--notSeen');
            }
            const lenSeen = _this._season.getNbEpisodesSeen();
            if (lenSeen < lenEpisodes) {
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
    toggleSpinner(display) {
        if (!display) {
            jQuery('.spinner').remove();
            if (Base.debug)
                console.groupEnd();
        }
        else {
            if (Base.debug)
                console.groupCollapsed('episode checkSeen');
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
    fetch(force = true) {
        let action = 'display';
        if (this.mediaType.singular === MediaType.movie) {
            action = 'movie';
        }
        return Base.callApi('GET', this.mediaType.plural, action, { id: this.id }, force);
    }
    addViewed() {
        const $slideImg = this.elt.find('a.slide__image');
        if (this.user.status &&
            ((this.mediaType.singular === MediaType.movie && this.user.status === 1) ||
                (this.mediaType.singular === MediaType.show && this.user.status > 0))) {
            $slideImg.prepend(`<img src="${Base.serverBaseUrl}/img/viewed.png" class="bandViewed"/>`);
        }
        $slideImg
            .attr('data-id', this.id)
            .attr('data-type', this.mediaType.singular);
        return this;
    }
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
            const $dataRes = $('#dialog-resource .data-resource'), html = document.documentElement;
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
    getContentPopup() {
        const _this = this;
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
            template += `<p><label for="seen">Vu</label>
                <input type="radio" class="movie movieSeen" name="movieState" value="1" data-movie="${this.id}" ${this.user.status === 1 ? 'checked' : ''} style="margin-right:5px;vertical-align:middle;"></input>`;
            template += `<label for="mustSee">A voir</label>
                <input type="radio" class="movie movieMustSee" name="movieState" value="0" data-movie="${this.id}" ${this.user.status === 0 ? 'checked' : ''} style="margin-right:5px;vertical-align:middle;"></input>`;
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
    getTitlePopup() {
        let title = this.title;
        if (this.objNote.total > 0) {
            title += ' <span style="font-size: 0.8em;color:#000;">' +
                this.objNote.mean.toFixed(2) + ' / 5</span>';
        }
        return title;
    }
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
    renderStars() {
        this.elt.find('.slide__title').after('<div class="stars-outer"><div class="stars-inner"></div></div>');
        this.updateTitleNote();
        this.elt.find('.stars-inner').width(this.objNote.getPercentage() + '%');
        return this;
    }
    checkImg() {
        const $img = this.elt.find('img.js-lazy-image'), _this = this;
        if ($img.length <= 0) {
            if (this.mediaType.singular === MediaType.show && this.thetvdb_id && this.thetvdb_id > 0) {
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
    addToAccount(state = 0) {
        if (this.in_account)
            return Promise.resolve(this);
        return this.changeState(state);
    }
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
    addVote(note) {
        throw new Error('On ne vote pas pour un similar');
    }
}

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
            this._status = false;
            this._auto = false;
            this._interval = 0;
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
    get status() {
        return this._status;
    }
    set status(status) {
        this._status = status;
        this._save();
    }
    get auto() {
        return this._auto;
    }
    set auto(auto) {
        this._auto = auto;
        this._save();
    }
    get interval() {
        return this._interval;
    }
    set interval(val) {
        this._interval = val;
        this._save();
    }
    changeColorBtn() {
        let color = '#fff';
        if (!this._exist) {
            color = '#6c757d';
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
    delete() {
        this.stop();
        let objUpAuto = UpdateAuto.getValue('objUpAuto', {});
        if (objUpAuto[this._showId] !== undefined) {
            delete objUpAuto[this._showId];
            UpdateAuto.setValue('objUpAuto', objUpAuto);
        }
        return this;
    }
    launch() {
        if (this._status && (!this._auto || this._interval <= 0)) {
            if (Base.debug)
                console.log('close interval updateEpisodeListAuto');
            return this.stop();
        }
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
class Member {
    id;
    fb_id;
    login;
    xp;
    locale;
    cached;
    avatar;
    profile_banner;
    in_account;
    is_admin;
    subscription;
    valid_email;
    screeners;
    twitterLogin;
    stats;
    options;
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
    this.seasons = new Array();
    for (let s = 0; s < data.seasons_details.length; s++) {
        this.seasons.push(new Season(data.seasons_details[s], this));
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
