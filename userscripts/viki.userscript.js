// ==UserScript==
// @name         Viki
// @namespace    http://tampermonkey.net/
// @version      0.4
// @description  try to take over the world!
// @author       You
// @match        https://www.viki.com/videos/*
// @match        https://www.viki.com/v1/explore*
// @match        https://www.viki.com/tv/*
// @icon         https://1.viki.io/a/vwk8s/_next/static/images/favicon.892f4c250e5.png
// @noframes
// @grant        GM_notification
// @grant        GM_getValue
// @grant        GM_setValue
// @run-at       document-start
// ==/UserScript==

/* globals BS: false, __NEXT_DATA__: false */
const serverBaseUrl = 'https://localhost:9001/';

unsafeWindow._addEventListener = unsafeWindow.addEventListener;
unsafeWindow.addEventListener = function(a, b, c) {
    // console.log('window.addEventListener', a, this);
   if (c==undefined) c=false;
   unsafeWindow._addEventListener(a,b,c);
   if (! unsafeWindow.eventListenerList) unsafeWindow.eventListenerList = {};
   if (! unsafeWindow.eventListenerList[a]) unsafeWindow.eventListenerList[a] = [];
   unsafeWindow.eventListenerList[a].push({listener:b,options:c});
};
EventTarget.prototype._addEventListener = EventTarget.prototype.addEventListener;

EventTarget.prototype.addEventListener = function(a, b, c) {
    // console.log('EventTarget.addEventListener', a, this);
    if (c==undefined) c=false;
    this._addEventListener(a,b,c);
    if (! unsafeWindow.eventListenerList) unsafeWindow.eventListenerList = {};
    if (! unsafeWindow.eventListenerList[a]) unsafeWindow.eventListenerList[a] = [];
    unsafeWindow.eventListenerList[a].push({listener:b,options:c,elt:this});
};
EventTarget.prototype._removeEventListener = EventTarget.prototype.removeEventListener;

EventTarget.prototype.removeEventListener = function(a, b, c) {
    // console.log('EventTarget.removeEventListener', a, this);
    if (c==undefined) c=false;
    this._removeEventListener(a,b,c);
    if (! unsafeWindow.eventListenerList) unsafeWindow.eventListenerList = {};
    if (! unsafeWindow.eventListenerList[a]) unsafeWindow.eventListenerList[a] = [];

    let i = unsafeWindow.eventListenerList[a].length - 1;
    for (; i >= 0; i--) {
        let event = unsafeWindow.eventListenerList[a][i];
        if (event.listener == b && c == event.options) {
            unsafeWindow.eventListenerList[a].splice(i, 1);
        }
    }
    if (unsafeWindow.eventListenerList[a].length === 0) delete unsafeWindow.eventListenerList[a];
};
EventTarget.prototype._getEventListeners = function(a) {
    if (! unsafeWindow.eventListenerList) unsafeWindow.eventListenerList = {};
    const events = {};
    if (a == undefined)  {

        for (let eventType in unsafeWindow.eventListenerList) {
            for (let event of unsafeWindow.eventListenerList[eventType]) {
                if (event.elt == this) {
                    if (! events[eventType]) events[eventType] = [];
                    events[eventType].push(event);
                }
            }
        }
    } else {
        for (let event of unsafeWindow.eventListenerList[a]) {
            if (event.elt == this) {
                if (! events[a]) events[a] = [];
                events[a].push(event);
            }
        }
    }
    return events;
};
const observers = [];
let fnPageExplore,
    fnPageShow,
    fnPageVideo;
/**
 * Fonction qui sert à gérer un site Single Page
 * Le userscript doit obligatoirement démarrer au stade document-start
 */
(function utilityFunc() {

    const run = (caller, state, title, url) => {
        let loop = 0;
        const getFnFromUrl = (url) => {
            let fn = -1;
            if (/^\/tv\/\d*/.test(url)) {
                fn = {fn: fnPageShow, page: 'show'};
            } else if (/^\/v1\/explore/.test(url)) {
                fn = {fn: fnPageExplore, page: 'explore'};
            } else if (/^\/videos\/\d+/.test(url)) {
                fn = {fn: fnPageVideo, page: 'videos'};
            }
            if (fn !== -1 && loop < 50 && typeof fn.fn !== 'function') {
                loop++;
                setTimeout(getFnFromUrl, 100, url);
            } else {
                console.log('getFnFromUrl loop', loop, fn);
                return fn.fn;
            }
        };
        const fn = getFnFromUrl(url);
        console.log('utilityFunc run (from: %s) URL: %s', caller, url, {title, state, fn});
        if (typeof fn === 'function') {
            for (let o = 0; o < observers.length; o++) {
                observers[o].disconnect();
            }
            observers.splice(0, observers.length);
            fn();
        }
    };

    const pS = unsafeWindow.history.pushState;
    const rS = unsafeWindow.history.replaceState;

    unsafeWindow.history.pushState = function(a, b, url) {
        run('pushState', a, b, url);
        pS.apply(this, arguments);
    };

    unsafeWindow.history.replaceState = function(a, b, url) {
        run('replaceState', a, b, url);
        rS.apply(this, arguments);
    };
})();
// eslint-disable-next-line no-unused-vars
function getCSSSelector(el) {
    let selector = el.tagName.toLowerCase();
    const attrs = el.attributes
    for (let attr of attrs) {
    // for (let i = 0; i < attrs.length; i++) {
        // let attr = attrs.item(i);
        if (attr.name === 'id') { selector += `#${attr.value}`; break; }
        if (attr.name === 'class') selector += '.' + attr.value.trim().split(' ').join('.');
        if (attr.name === 'name') selector += `[${attr.name}=${attr.value}]`;
    }
    return selector;
}
/**
 * Récupère le fichier de configuration et le retourne sous forme d'objet
 * @returns {Promise<object>}
 */
function getConfig() {
    return fetch(`${serverBaseUrl}config/ext/client_bs.json`, {method: 'GET'})
    .then(resp => {
        if (resp.ok) {
            return resp.json();
        }
        return null;
    }).then(data => {
        if (!data) {
            return null;
        }
        return data;
    });
}

const launchScript = function() {
    'use strict';
    const debug = true;
    const Style = {
      base: [
          "color: #fff",
          "background-color: #444",
          "padding: 2px 4px",
          "border-radius: 2px"
      ],
      warning: [
          "color: #eee",
          "background-color: red"
      ],
      success: [
          "background-color: green"
      ]
    };

    let timerUpdate, // ID du timer de mise à jour du currentTime de la video
        attempts = 0, // Nombre de tentatives de requêtes episodes/watched à l'API BS
        pauseManual = false,
        inProgress = false; // Requête episodes/watched en cours

    /*
     *                  PAGE EXPLORE
     */
    fnPageExplore = () => {
        if (debug) console.log('Page exploration des séries');
        let showsWatched = GM_getValue('showsWatched', []),
            added = false;
        const checkShows = function() {
            // div.thumbnail > div.thumbnail-description > div.dropdown-toggle > div.f-delta > ul.dropdown-menu > li:nth-child(1) > a
            const pathLinks = 'div.thumbnail > div.thumbnail-description > div.dropdown-toggle > div.f-delta > ul.dropdown-menu > li:nth-child(1) > a';
            const links = document.querySelectorAll(pathLinks);
            //console.log('section explore, nb links: %d', links.length);
            for (let l = 0; l < links.length; l++) {
                const showId = links[l].parentElement.dataset.watchMarkerCta;
                //console.log('link:', links[l], links[l].attributes.href.value.startsWith('/videos/'));
                if (showsWatched.indexOf(showId) >= 0) {
                    const thumbnail = links[l].parentElement.parentElement.parentElement.parentElement.parentElement.parentElement;
                    const img = thumbnail.querySelector('div.thumbnail-wrapper > a.thumbnail-img > img');
                    img.style.opacity = 0.3;
                }
                else if (links[l].attributes.href.value.startsWith('/videos/')) {
                    console.log('find link[%d]', l+1, links[l]);
                    // Série vue
                    const thumbnail = links[l].parentElement.parentElement.parentElement.parentElement.parentElement.parentElement;
                    if (showsWatched.indexOf(showId) < 0) {
                        showsWatched.push(showId);
                        added = true;
                    }
                    const img = thumbnail.querySelector('div.thumbnail-wrapper > a.thumbnail-img > img');
                    img.style.opacity = 0.3;
                } else {
                    const li = links[l].parentElement.cloneNode(false);
                    li.insertAdjacentHTML('afterbegin', '<a href="#" class="watched">Déjà Vu</a>');
                    links[l].parentElement.parentElement.append(li);
                }
            }
            if (added) {
                GM_setValue('showsWatched', showsWatched);
            }
            const addShow = function(e) {
                e.stopPropagation();
                e.preventDefault();
                const showId = e.currentTarget.parentElement.dataset.watchMarkerCta;
                console.log('addShow', showId, e.currentTarget.parentElement);
                if (showsWatched.indexOf(showId) < 0) {
                    showsWatched.push(showId);
                    GM_setValue('showsWatched', showsWatched);
                }
                const thumbnail = e.currentTarget.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement;
                const img = thumbnail.querySelector('div.thumbnail-wrapper > a.thumbnail-img > img');
                img.style.opacity = 0.3;
                e.currentTarget.parentElement.parentElement.classList.add('hidden');
                const backdrop = e.currentTarget.parentElement.parentElement.nextElementSibling;
                if (backdrop != null) {
                    backdrop.remove();
                }
            };
            const wathcedLinks = document.querySelectorAll('a.watched');
            for (let w = 0; w < wathcedLinks.length; w++) {
                wathcedLinks[w].addEventListener('click', addShow);
            }
        };
        setTimeout(checkShows, 2000);
        const observerExplore = new MutationObserver(mutationsList => {
            for (let mutation of mutationsList) {
                if (mutation.type == 'childList' && mutation.addedNodes.length > 0 && mutation.target.nodeName === 'DIV') {
                    // console.log('Mutation Explore', mutation);
                    for (let node of mutation.addedNodes) {
                        // console.log('ObserverBody node', node);
                        if (node.nodeType === 1 && node.classList.contains('explore-content')) {
                            console.log('Observer Explore node thumbnail added', node);
                            checkShows();
                        }
                    }
                }
            }
        });
        observers.push(observerExplore);
        observerExplore.observe(document.querySelector('#pjaxify-container'), {childList: true, subtree: true, attributes: true});
    };

    /*
     *                      PAGE SERIE
     */
    fnPageShow = () => {

        getConfig().then(data => {
            const betaseries = new BS({
                debug: debug,
                betaseries_api_user_key: data.betaseries_api_user_key,
                getValue: GM_getValue,
                setValue: GM_setValue,
                notification: GM_notification,
                platform: 'viki'
            });
            const showId = __NEXT_DATA__.props.pageProps.containerJson.id;
            let showTitle = __NEXT_DATA__.props.pageProps.containerJson.i18n_title;
            const reg = /\s(\d{1})$/;
            if (reg.test(showTitle)) {
                showTitle = showTitle.replace(reg, '');
            }
            betaseries.getBSUrl(showId, showTitle).then(slug => {
                console.log('getBSUrl', slug);
                if (slug) {
                    const urlBS = 'https://www.betaseries.com/serie/' + slug;
                    let template = `
                    <div class="sc-1qmvf1o-6 bUSeDF">
                        <div class="sc-183ln8e-2 bvDaGW">
                            <div class="sc-183ln8e-1 etaEht">
                                <a class="cEoSot btn dsdYHv" href="${urlBS}" target="_blank" style="background-color:rgb(41, 41, 41);">
                                    <img src="https://www.betaseries.com/images/site/favicon-16x16.png" style="vertical-align: middle;" /> BetaSeries
                                </a>
                            </div>
                        </div>
                    </div>`;
                    document.querySelector('div.sc-1qmvf1o-6.bUSeDF div.sc-183ln8e-2.bvDaGW').parentElement.insertAdjacentHTML('afterend', template);
                }
            });
        });
    };
    /*
     *                      PAGE VIDEOS
     */
    fnPageVideo = () => {
        getConfig().then(data => {
            if (!data) {
                return null;
            }
            const betaseries = new BS({
                debug: debug,
                getValue: GM_getValue,
                setValue: GM_setValue,
                notification: GM_notification,
                betaseries_api_user_key: data.betaseries_api_user_key,
                playerId: 'html5_player_id_Shaka_api',
                getInfosSerie: getInfosSerie,
                platform: 'viki',
                selBtnNext: '.vjs-control-bar button.vkp-next-button'
            });
            unsafeWindow.betaseries = betaseries;
            let videosAd = [];
            let stops = {};

            const loaded = {
                findSerie: false,
                searchVideos: false
            };

            const hideAd = function(e) {
                // console.log('hideAd', {stopAd: stops[e.target.id], event: e});
                if (!stops[e.target.id]) {
                    stops[e.target.id] = true;
                    document.getElementsByClassName('vjs-control-bar')[0].classList.remove('vjs-hidden');
                    // console.log('Ad video set currentTime');
                    const videos = document.querySelectorAll('#html5_player_id_html5_api_ima-ad-container video');
                    for (const vid of videos) {
                        if (vid && vid.onplay == null) {
                            vid.onplay = (e) => {
                                // console.log('vid Ad onplay', {event: e});
                                if (e.target) {
                                    const video = e.target;
                                    video.volume = 0;
                                    if (typeof video.fastSeek === 'function') video.fastSeek(video.duration - 0.2);
                                    else video.currentTime = video.duration - 0.2;
                                }
                            }
                        }
                    }
                    document.getElementById('html5_player_id').focus();
                    //firstVid.focus();
                }
            }
            const fnEnded = (e) => {
                stops[e.target.id] = false;
                console.log('fnEnded', {event: e, stopAd: stops[e.target.id]});
            };
            const observerVid = new MutationObserver(mutationsList => {
                for (let mutation of mutationsList) {
                    if (mutation.oldValue == mutation.target[mutation.attributeName]) {
                        console.warn('observerVid attribute not change', mutation);
                        return;
                    }
                    /*
                                        Video Advertissement
                    */
                    if (mutation.type === 'attributes' && mutation.attributeName === 'src' /*&&
                    typeof mutation.target.onloadedmetadata !== 'function'*/)
                    {
                        console.log('Videos Mutation observed');
                        if (mutation.target.id == null || mutation.target.id == '') {
                            const id = 'videoAd' + videosAd.length.toString();
                            mutation.target.id = id;
                            videosAd.push(id);
                            stops[id] = false;
                            console.log('Ajout ID video Ad: ', id);
                        }
                        if (mutation.target.onended == null) {
                            mutation.target.onended = fnEnded;
                            console.log('Add event onended on mutation.target');
                        }
                        if (mutation.target.onloadedmetadata == null) {
                            mutation.target.onloadedmetadata = hideAd;
                            console.log('Add event onloadedmetadata on mutation.target');
                        }
                        if (mutation.target.onplaying == null) {
                            mutation.target.onplaying = hideAd;
                            console.log('Add event onplaying on mutation.target');
                        }
                    }
                    /*
                                        DIV parent Advertissement
                    */
                    else if (mutation.type === 'attributes' && mutation.attributeName === 'style' &&
                            mutation.target.style.display != 'none')
                    {
                        // console.log('Container Ads style display none', mutation);
                        mutation.target.style.display = 'none';
                        if (!pauseManual) {
                            if (debug) console.log('pause non souhaitée, on relance');
                            document.getElementById(betaseries.settings.playerId).play();
                        }
                        else {
                            if (debug) console.log('pause forcée');
                        }
                        document.getElementsByClassName('vjs-control-bar')[0].classList.remove('vjs-hidden');
                    }
                }
            });
            /**
             * Permet de définir la durée d'intro de la série
             * @param  {Event} e L'évènement déclencheur
             * @return {void}
             */
            const setIntro = (e) => {
                console.log('btnIntro click');
                e.stopPropagation();
                e.preventDefault();
                let result = betaseries.searchSerieById(betaseries.serie.platform.showId);
                const intro = parseFloat(window.prompt("Veuillez indiquer la durée de l'intro", result.intro));
                if (isNaN(intro) || intro == null) return;
                console.log('intro: %d', intro);
                betaseries.serie.intro = intro;
                //console.log('intro searchSerieById', result);
                if (result) {
                    //console.log('intro save serie');
                    betaseries.saveSerie(betaseries.serie.platform.showId, betaseries.serie.showId, result.title, result.alias, intro);
                }
            };
            const pauseForced = function(e) {
                // console.log('pauseForced event', e);
                const allowedKeys = ['space', 'keyn', 'arrowright', 'arrowleft'];
                if (!e || (e.type === 'keydown' && allowedKeys.indexOf(e.code.toLowerCase()) < 0))
                {
                    // console.log('pauseForced exit');
                    return;
                }
                if (e.type === 'keydown' && e.shiftKey && e.key.toLowerCase() === 'n') {
                    console.log('Episode suivant demandé');
                    const btnNext = document.querySelector('.vjs-control-bar button.vkp-next-button');
                    btnNext.click();
                    return;
                }
                // Si event mouse et target video
                // Ou event keydown et target html5_player_id
                if (e && (e.type == 'click' && e.target.id == betaseries.settings.playerId) ||
                (e.type == 'keydown' && e.code.toLowerCase() === 'space' && e.target))
                {
                    const vid = betaseries.getPlayer();
                    if (vid) {
                        pauseManual = !pauseManual;
                        if (pauseManual) {
                            vid.onpause = null;
                            vid.pause();
                            if (vid.onplay == null) {
                                vid.onplay = (e) => {
                                    // console.log('Video main onplay', {pauseManual, event: e});
                                    if (pauseManual) e.target.pause();
                                };
                            }
                        }
                        else {
                            vid.onplay = null;
                            vid.play();
                            if (vid.onpause == null) {
                                vid.onpause = (e) => {
                                    // console.log('Video main onpause', {pauseManual, event: e});
                                    if (!pauseManual) e.target.play();
                                };
                            }
                        }
                    }
                }
                // if (debug && e.type == 'keydown') console.log('pauseForced', {pauseManual, treated, event: e});
            };
            function init(fn) {
                if (debug) console.log('init[%s]', fn);
                if (fn === 'findSerie') {
                    setTimeout(() => {
                        betaseries.findSerie(() => {
                            if (! loaded.searchVideos) {
                                console.error('SearchVideos n\'a pas été lancé, on recharge la page');
                                document.location.reload();
                            }
                            inProgress = false;
                            attempts = 0;
                            betaseries.serie.watched = false;
                            timerUpdate = setInterval(updateTime, 30000);
                            updateTime();
                            console.log('init findSerie complete', loaded);
                        })
                    }, 1);
                } else if (fn === 'searchVideos') {
                    setTimeout(searchVideos, 1);
                }
            }
            const observerBody = new MutationObserver(mutationsList => {
                let found = false;
                for (let mutation of mutationsList) {
                    if (mutation.type == 'childList' && mutation.addedNodes.length > 0) {
                        for (let node of mutation.addedNodes) {
                            //console.log('ObserverBody node', node);
                            if (node.nodeType === 1 && node.nodeName.toLowerCase() === 'video') {
                                let style = Style.base.join(';') + ';';
                                if (!found && node.hasAttribute('title') && node.attributes.title.value == 'Advertisement') {
                                    loaded.searchVideos = true;
                                    style += Style.warning.join(';');
                                    console.log('Body Observer %cAdvertisement', style);
                                    init('searchVideos');
                                    found = true;
                                } else if (node.id === betaseries.settings.playerId) {
                                    loaded.findSerie = true;
                                    style += Style.success.join(';');
                                    console.log('Body Observer %chtml5_player_id_Shaka_api', style);
                                    const playerNode = document.getElementById('html5_player_id');
                                    if (playerNode) {
                                        playerNode.addEventListener('click', pauseForced);
                                        playerNode.addEventListener('keydown', pauseForced, {bubbles: true, cancelable: false});
                                    }
                                    init('findSerie');
                                }
                            }
                        }
                    }
                    else if (mutation.type == 'childList' && mutation.removedNodes.length > 0) {
                        for (let node of mutation.removedNodes) {
                            if (node.id === betaseries.settings.playerId) {
                                if (debug) console.log('ObserverBody removeNodes video');
                                node.removeEventListener('click', pauseForced);
                                loaded.findSerie = false;
                                loaded.searchVideos = false;
                                //break;
                            } else if (node.id === 'html5_player_id') {
                                node.removeEventListener('keydown', pauseForced);
                            } else if (node.id === 'btnIntro') {
                                node.removeEventListener('click', setIntro);
                            } else if (node.id === 'html5_player_id_html5_api_ima-ad-container') {
                                videosAd = [];
                            }
                        }
                    }
                    if (found) break;
                }
            });
            const observerST = new MutationObserver(mutationsList => {
                //console.log('Observer subtitles');
                for (let mutation of mutationsList) {
                    if (mutation.type == 'attributes' && mutation.attributeName == 'class') {
                        let target = mutation.target;
                        if (!target.classList.contains('vkp-toggle-on')) {
                            console.log('Observer subtitles: Trigger click');
                            target.click();
                        }
                    }
                }
            });

            function searchVideos() {
                console.log('searchVideos function');
                const videos = document.querySelectorAll('#html5_player_id_html5_api_ima-ad-container video');
                if (videos.length > 0) {
                    localStorage.setItem('noAdFound', 0);
                    launchObs(videos);
                } else {
                    let loop = parseInt(localStorage.getItem('noAdFound'), 10) || 0;
                    if (loop < 5) {
                        localStorage.setItem('noAdFound', loop+1);
                        GM_notification({
                            title: 'Viki video',
                            text: `La video publicitaire n'a pas été trouvée. Rechargement demandé.`,
                            timeout: 5
                        });
                        document.location.reload();
                    } else {
                        GM_notification({
                            title: 'Viki video',
                            text: `La video publicitaire n'a pas été trouvée. Plus de 5 rechargements effectués.`,
                            timeout: 10
                        });
                    }
                }
            }

            function addSelectSpeed() {
                const menuPlaybackSpeed = `
                    <li class="vkp-menu-item vjs-menu-item vkp-back-item vjs-hidden vjs-playback">
                        <span class="vkp-action vkp-icon-arrow-left"></span>
                        <span class="vkp-title">Vitesses de lecture</span>
                    </li>
                    <li class="vkp-menu-item vjs-menu-item vkp-menu-separator vjs-hidden vjs-playback"></li>
                    <div class="vkp-playback-list vjs-hidden vjs-playback">
                        <ul class="vkp-list">
                            <li class="vkp-speed-item vkp-menu-item">
                                <span class="vkp-action"></span>
                                <span class="vkp-title" data-value="0.5">0.5</span>
                            </li>
                            <li class="vkp-speed-item vkp-menu-item">
                                <span class="vkp-action"></span>
                                <span class="vkp-title" data-value="0.75">0.75</span>
                            </li>
                            <li class="vkp-speed-item vkp-menu-item">
                                <span class="vkp-action"></span>
                                <span class="vkp-title" data-value="1.0">1.0</span>
                            </li>
                            <li class="vkp-speed-item vkp-menu-item">
                                <span class="vkp-action"></span>
                                <span class="vkp-title" data-value="1.25">1.25</span>
                            </li>
                            <li class="vkp-speed-item vkp-menu-item">
                                <span class="vkp-action"></span>
                                <span class="vkp-title" data-value="1.5">1.5</span>
                            </li>
                            <li class="vkp-speed-item vkp-menu-item">
                                <span class="vkp-action"></span>
                                <span class="vkp-title" data-value="1.75">1.75</span>
                            </li>
                            <li class="vkp-speed-item vkp-menu-item">
                                <span class="vkp-action"></span>
                                <span class="vkp-title" data-value="2.0">2.0</span>
                            </li>
                        </ul>
                    </div>
                    <li class="vkp-menu-item vjs-menu-item vjs-menu-playback">
                        <div class="vkp-menu-label">
                            <div class="vkp-menu-title">Playback Speed</div>
                        </div>
                        <div class="vkp-submenu-label">
                            <span class="vkp-submenu-title vjs-playback-val"></span>
                            <i class="vkp-menu-arrow vkp-icon-arrow-right"></i>
                        </div>
                        <div class="vjs-menu" role="presentation">
                            <ul class="vjs-menu-content" role="menu"></ul>
                        </div>
                    </li>`;
                const vid = betaseries.getPlayer();
                /**
                 * Permet de mettre à jour les infos de playbackRate dans le menu
                 * de paramétrage de la vidéo
                 * @return {void}
                 */
                const setPlaybackRate = () => {
                    const actions = document.querySelectorAll('div.vkp-playback-list ul.vkp-list li span.vkp-title');
                    const rate = parseFloat(vid.playbackRate);
                    for (let action of actions) {
                        const val = parseFloat(action.dataset.value);
                        const prev = action.previousElementSibling;
                        if (val == rate && ! prev.classList.contains('vkp-icon-tick')) {
                            prev.classList.add('vkp-icon-tick');
                            if (debug) console.log('setPlaybackRate Action', {action, prev, val});
                        } else if (val != rate && prev.classList.contains('vkp-icon-tick')) {
                            prev.classList.remove('vkp-icon-tick');
                        }
                    }
                    document.querySelector('span.vjs-playback-val').textContent = rate.toFixed(2);
                };
                /**
                 * Permet d'afficher le sous-menu playbackRate dans le menu de paramétrage
                 * @param  {Event} e L'évènement déclencheur
                 * @return {void}
                 */
                const displayMenuPlayback = (e) => {
                    if (debug) console.log('displayMenuPlayback', e);
                    const container = document.querySelector('#playerSettings > div.vjs-menu > ul.vjs-menu-content');
                    for (let c = 0; c < container.children.length; c++) {
                        const classList = container.children[c].classList;
                        if (! classList.contains('vjs-playback')) {
                            classList.add('vjs-hidden');
                        } else {
                            classList.remove('vjs-hidden');
                        }
                    }
                };
                /**
                 * Permet de masquer le sous-menu playbackRate dans le menu de paramétrage
                 * @param  {Event} e L'évènement déclencheur
                 * @return {void}
                 */
                const hideMenuPlayback = (e) => {
                    if (debug) console.log('hideMenuPlayback', e);
                    const container = document.querySelector('#playerSettings > div.vjs-menu > ul.vjs-menu-content');
                    for (let c = 0; c < container.children.length; c++) {
                        const classList = container.children[c].classList;
                        if ((classList.length == 3 && classList.contains('vkp-menu-item') && classList.contains('vjs-menu-item')) ||
                            (classList.length === 4 && classList.contains('vjs-menu-playback')))
                        {
                            classList.remove('vjs-hidden');
                        } else {
                            classList.add('vjs-hidden');
                        }
                    }
                };
                /**
                 * Permet d'afficher/masquer le sous-menu playbackRate dans le menu de paramétrage
                 * @param  {Event} e L'évènement déclencheur
                 * @return {void}
                 */
                const toggleMenuPlayback = (e) => {
                    const menu = document.querySelector('ul.vjs-menu-content > li.vjs-menu-playback');
                    // if (debug) console.log('toggleMenuPlayback', menu);
                    if (! menu.classList.contains('vjs-hidden')) {
                        displayMenuPlayback(e);
                    } else {
                        hideMenuPlayback(e);
                    }
                };
                /**
                 * EventListener pour la sélection d'une valeur playbackRate dans le sous-menu
                 * Modifie le playbackRate de la vidéo, Met à jour les données dans le menu settings
                 * et masque le sous-menu
                 * @param  {Event} e L'évènement déclencheur
                 * @return {void}
                 */
                const selectPlaybackSpeed = (e) => {
                    betaseries.getPlayer().playbackRate = parseFloat(e.currentTarget.querySelector('.vkp-title').dataset.value);
                    setPlaybackRate();
                    hideMenuPlayback(e);
                }
                const selPreviousNode = 'li.vjs-menu-item:nth-child(9)';
                const htmlPlayerId = document.querySelector('#html5_player_id');
                document.querySelector(selPreviousNode)
                    .insertAdjacentHTML('afterend', menuPlaybackSpeed);
                setPlaybackRate();
                document.querySelector('ul.vjs-menu-content > li.vjs-menu-playback')
                    .addEventListener('click', toggleMenuPlayback);
                document.querySelector('li.vkp-back-item.vjs-playback > span.vkp-icon-arrow-left')
                    .addEventListener('click', hideMenuPlayback);
                const vkpSpeedItems = document.querySelectorAll('div.vkp-playback-list > ul > li.vkp-speed-item');
                for (let v = 0; v < vkpSpeedItems.length; v++) {
                    vkpSpeedItems[v].addEventListener('click', selectPlaybackSpeed);
                }
                if (document.querySelector('.popupRate') == null) {
                    const template = `
                        <style>
                            .vkp-timed-rate-overlay-actions {
                                display: -webkit-box;
                                display: -webkit-flex;
                                display: -ms-flexbox;
                                display: flex;
                                flex-direction: row-reverse;
                                flex-wrap: nowrap;
                                font-family: Noto Sans,sans-serif;
                                position: absolute;
                                right: 0;
                                left: 0;
                                bottom: 85px;
                                padding: 2vw;
                                font-size: 1em;
                                pointer-events: none;
                                transition: all 1s ease 0s;
                            }
                            .vkp-timed-rate-message {
                                align-items: flex-end;
                                align-content: flex-end;
                                max-width: 125px;
                                min-width: 120px;
                            }
                            .vkp-timed-rate-message .vkp-message {
                                text-align: center;
                                font-weight: bold;
                            }
                        </style>
                        <div class="vkp-timed-rate-overlay-actions popupRate vjs-hidden">
                            <div class="vkp-timed-rate-message">
                                <div class="vkp-message-body">
                                    <div class="vkp-username">PlaybackRate</div>
                                    <div class="vkp-message"></div>
                                </div>
                            </div>
                        </div>`;
                    htmlPlayerId.insertAdjacentHTML('afterend', template);
                }
                /**
                 * Affiche la valeur de playbackRate dans une infobulle durant 3 secondes
                 * @param  {Number} rate La valeur à afficher
                 * @return {void}
                 */
                const displayRate = (rate) => {
                    const popupRate = document.querySelector('.popupRate');
                    popupRate.querySelector('.vkp-message').innerText = rate.toFixed(2);
                    popupRate.classList.remove('vjs-hidden');
                    setTimeout(() => popupRate.classList.add('vjs-hidden'), 3000);
                };
                let evtWheelRate = false; // Flag permettant d'indiquer si event wheel a déjà été ajouté
                /**
                 * EventListener sur la roue de la souris, pour modifier la valeur de playbackRate
                 * Est utilisé avec l'eventListener sur le clavier, avec la touche "shift"
                 * @param  {MouseEvent} em L'évènement déclencheur
                 * @return {void}
                 */
                const wheelRate = (em) => {
                    // if (debug) console.log('video wheel event', em.deltaY);
                    let scale = vid.playbackRate;
                    if (em.deltaY > 0 && scale > 0.3) {
                        scale -= 0.1;
                    } else if (em.deltaY < 0 && scale <= 2.0) {
                        scale += 0.1;
                    }
                    if (scale != vid.playbackRate) {
                        vid.playbackRate = scale;
                    }
                    // TODO: Ajouter un affichage de la valeur de playbackRate
                    displayRate(scale);
                };
                htmlPlayerId.addEventListener('keydown', (ek) => {
                    // ek.stopPropagation();
                    if (ek.shiftKey) {
                        // if (debug) console.log('video keydown event', ek);
                        if (!evtWheelRate) {
                            evtWheelRate = true;
                            vid.addEventListener('wheel', wheelRate);
                        }
                    }
                });
                htmlPlayerId.addEventListener('keyup', () => {
                    if (evtWheelRate) {
                        vid.removeEventListener('wheel', wheelRate);
                        evtWheelRate = false;
                    }
                });
                /**
                 * Observateur détectant l'ajout/suppression de la classe vjs-lock-showing
                 * sur l'élément Menu settings
                 * @param  {MutationRecord[]} mutationsList Tableau de mutations
                 * @return {[type]}               [description]
                 */
                const observerPlaybck = new MutationObserver(mutationsList => {
                    for (let mutation of mutationsList) {
                        if (mutation.oldValue === mutation.target.className) continue;
                        // if (debug) console.log('MutationObserver Playback', mutation);
                        if (! mutation.target.classList.contains('vjs-lock-showing')) {
                            hideMenuPlayback(new CustomEvent('observer', {detail: mutation}));
                        } else {
                            setPlaybackRate();
                        }
                    }
                });
                observerPlaybck.observe(document.querySelector('#playerSettings > div.vjs-menu'), {attributes: true, attributeOldValue: true, attributeFilter: ['class']});
            }

            function launchObs(videos) {
                console.log('Observers launched');
                observers.push(observerVid);
                observerVid.disconnect();
                const params = {
                    childList: false,
                    attributes: true,
                    attributeOldValue: true,
                    attributeFilter: ['style']
                };
                observerVid.observe(document.getElementById('html5_player_id_html5_api_ima-ad-container'), params);
                params.attributeFilter = ['src'];
                for (let v = 0; v < videos.length; v++) {
                    observerVid.observe(videos[v], params);
                }
                const btnSubtitles = 'li.vjs-menu-item:nth-child(6) > div:nth-child(2)';
                betaseries.waitDomPresent(btnSubtitles, () => {
                    observers.push(observerST);
                    observerST.disconnect();
                    observerST.observe(document.querySelector(btnSubtitles), { attributes: true });
                    const video = betaseries.getPlayer();
                    /*
                    *             Gestion du volume avec la molette de la souris
                    */
                    const volDiv = document.querySelector('div.vjs-volume-menu-button:nth-child(7)');
                    if (volDiv.dataset.init == undefined) {
                        const eventWheel = function(e) {
                            if (e.deltaY > 0 && video.volume > 0.1) {
                                video.volume -= 0.1;
                            } else if (e.deltaY < 0 && video.volume <= 0.9) {
                                video.volume += 0.1;
                            }
                            //console.log('wheel event volume (before: %2f, after: %2f)', volume, video.volume);
                        };
                        const eventVolume = function() {
                            console.log('eventVolume enter');
                            volDiv.onmouseleave = () => {
                                console.log('eventVolume leave');
                                volDiv.removeEventListener('wheel', eventWheel);
                                //volDiv.removeEventListener('mouseenter', eventVolume);
                            };
                            volDiv.addEventListener('wheel', eventWheel );
                        };
                        volDiv.addEventListener('mouseenter', eventVolume);
                        volDiv.dataset.init = true;
                    }

                    /*
                    *                Gestion du bouton de temps d'intro
                    */
                    if (document.getElementById('btnIntro') == null) {
                        const svgClock = `<svg class="vkp-svg" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                            viewBox="0 0 300.988 300.988" style="width:65%;" xml:space="preserve">
                            <g>
                                <path d="M150.494,0.001C67.511,0.001,0,67.512,0,150.495s67.511,150.493,150.494,150.493s150.494-67.511,150.494-150.493
                                        S233.476,0.001,150.494,0.001z M150.494,285.987C75.782,285.987,15,225.206,15,150.495S75.782,15.001,150.494,15.001
                                        s135.494,60.782,135.494,135.493S225.205,285.987,150.494,285.987z"/>
                                <polygon points="142.994,142.995 83.148,142.995 83.148,157.995 157.994,157.995 157.994,43.883 142.994,43.883"/>
                            </g>
                        </svg>`;
                        const btn = `<button id="btnIntro" class="vjs-control vjs-button vkp-forward-button intro" type="button" aria-live="polite" title="Set Intro" aria-disabled="false">
                                        <span class="vjs-control-text"></span>
                                        ${svgClock}
                                    </button>`;
                        document.getElementsByClassName('vkp-control-bar vkp-left-control')[0]
                            .insertAdjacentHTML('beforeend', btn);
                        document.getElementById('btnIntro').addEventListener('click', setIntro);
                    }
                    /*
                    *                  Gestion de la vitesse de lecture
                    */
                    if (document.querySelector('li.vjs-menu-playback') == null) {
                        addSelectSpeed();
                    }
                }, 10, 500);
                //cb();
            }

            function updateTime() {
                // console.log('updateTime');
                const player = betaseries.getPlayer();
                if (player && ! betaseries.serie.watched) {
                    const percent = (player.currentTime / player.duration) * 100;
                    // console.log('Percent video: %d', percent);
                    if (percent >= 90 && attempts < 5 && !inProgress) {
                        if (debug) console.log('Video progress percent:', percent);
                        inProgress = true;
                        if (betaseries.serie.episodeId) {
                            betaseries.callBetaSeries('POST', 'episodes', 'watched', {id: betaseries.serie.episodeId, bulk: false})
                            .then(() => {
                                betaseries.serie.watched = true;
                                attempts = 0;
                                clearInterval(timerUpdate);
                                inProgress = false;
                            })
                            .catch((error) => {
                                if (error === 'alreadyMarked') {
                                    console.warn('L\'épisode a déjà été marqué');
                                    clearInterval(timerUpdate);
                                    inProgress = false;
                                    betaseries.serie.watched = true;
                                    return;
                                }
                                betaseries.serie.watched = false;
                                attempts++;
                                inProgress = false;
                            });
                        }
                    } else if (attempts >= 5 && !inProgress) {
                        console.warn('5 tentatives de requête episodes/watched ont eu lieu sans succès');
                        clearInterval(timerUpdate);
                        inProgress = false;
                    }
                }
            }

            function getInfosSerie() {
                let paramsFetch = {
                    method: 'GET',
                    mode: 'cors',
                    cache: 'no-cache',
                    headers: {'Content-Type': 'application/json'}
                };
                /*
                Appels API:
                - Serie : https://api.viki.io/v4/containers/${showId}.json?token=ex1WB2V6BZE27XDYXV4B4KX777ZHYMK2_2u0058251801uti00m5cga9100000_djA0&t=1655374651&app=100000a
                - Episodes : https://api.viki.io/v4/containers/${showId}/episodes.json?token=ex1WB2V6BZE27XDYXV4B4KX777ZHYMK2_2u0058251801uti00m5cga9100000_djA0&direction=asc&with_upcoming=true&sort=number&blocked=true&only_ids=true&app=100000a
                - Episode : https://api.viki.io/v4/videos/${episodeId}.json?token=ex1WB2V6BZE27XDYXV4B4KX777ZHYMK2_2u0058251801uti00m5cga9100000_djA0&t=1655374651&app=100000a

                __NEXT_DATA__
                - token : props.pageProps.userInfo.token
                - app : props.aggregatedConfig.custom.appID
                - apiUrl : runtimeConfig.apiClientEndpoint
                - showId : props.pageProps.containerApiData.id
                - episodeId : props.pageProps.videoApiData.id (comparer episodeId avec l'ID dans l'URL window.location.path.split('/')[2])
                */
                return new Promise((resolve, reject) => {
                    let infos = betaseries.getSerieBlank();
                    const episodeIdLocation = window.location.path.split('/').pop().replace(/-.*$/, '');
                    if (__NEXT_DATA__ && __NEXT_DATA__.props.pageProps.videoApiData &&
                        __NEXT_DATA__.props.pageProps.videoApiData?.id == episodeIdLocation)
                    {
                        console.log('getInfosSerie use __NEXT_DATA__');
                        const data = __NEXT_DATA__.props.pageProps.videoApiData;
                        infos.title = data.container.i18n_title;
                        infos.saison = 1;
                        const reg = /\s(\d{1})$/;
                        const result = infos.title.match(reg);
                        if (result) {
                            infos.saison = parseInt(result[1], 10);
                            infos.title = infos.title.replace(reg, '');
                        }
                        infos.episode = data.number;
                        infos.country = data.container.origin.country;
                        infos.platform.showId = data.container.id;
                        console.log('getInfosSerie:', infos);
                        resolve(infos);
                        return infos;
                    } else if (__NEXT_DATA__) {
                        console.log('getInfosSerie fetch API');
                        const baseApi = __NEXT_DATA__.runtimeConfig.apiClientProtocol + '://' + __NEXT_DATA__.runtimeConfig.apiClientEndpoint;
                        const token = __NEXT_DATA__.props.pageProps.userInfo.token;
                        const appID = __NEXT_DATA__.props.aggregatedConfig.custom.appID;
                        const time = __NEXT_DATA__.props.aggregatedConfig.timestamp;
                        fetch(`${baseApi}/v4/videos/${episodeIdLocation}.json?token=${token}&t=${time}&app=${appID}`, paramsFetch)
                        .then(resp => {
                            if (!resp.ok) {
                                console.error('Fetch __NEXT_DATA__ response error', resp);
                            } else {
                                return resp.json();
                            }
                        }).then(data => {
                            infos.title = __NEXT_DATA__.props.pageProps.containerJson.i18n_title;
                            infos.saison = 1;
                            const reg = /\s(\d{1})$/;
                            const result = infos.title.match(reg);
                            if (result) {
                                infos.saison = parseInt(result[1], 10);
                                infos.title = infos.title.replace(reg, '');
                            }
                            infos.episode = data.number;
                            infos.country = data.container.origin.country;
                            infos.platform.showId = data.container.id;
                            console.log('getInfosSerie:', infos);
                            resolve(infos);
                        })
                        .catch(function(error) {
                            console.error('Il y a eu un problème avec l\'opération fetch: ' + error.message);
                            reject(error);
                        });
                    } else {
                        console.error('__NEXT_DATA__ not found');
                        reject('__NEXT_DATA__ not found');
                    }
                });
            }
            observers.push(observerBody);
            observerBody.observe(document.body, {childList: true, subtree: true, attributes: false});
        });
    };
};

/**
 * Fonction de chargement dynamique de scripts JS
 * @param   {string}    src         La source du script
 * @param   {Object}    attributes  Les attributs du script
 * @param   {Function}  callback    Fonction de callback après le chargement du script
 * @param   {Function}  onerror     Fonction de callback en cas d'erreur
 * @returns {HTMLScriptElement}     L'objet script
 */
const loadJS = function( src, attributes, callback, onerror ) {
    // Arguments explained:
    // `href` [REQUIRED] is the URL for your CSS file.
    // `before` [OPTIONAL] is the element the script should use as a reference for injecting our stylesheet <link> before
    // By default, loadCSS attempts to inject the link after the last stylesheet or script in the DOM. However, you might desire a more specific location in your document.
    // `media` [OPTIONAL] is the media type or query of the stylesheet. By default it will be 'all'
    // `attributes` [OPTIONAL] is the Object of attribute name/attribute value pairs to set on the stylesheet's DOM Element.
    const doc = window.document;
    const ss = doc.createElement( "script" );
    const refs = ( doc.body || doc.getElementsByTagName( "head" )[ 0 ] ).childNodes;
    const ref = refs[0];

    // Set any of the provided attributes to the stylesheet DOM Element.
    if ( attributes ) {
        for ( let attributeName in attributes ) {
            if ( attributes[attributeName] !== undefined ) {
                ss.setAttribute( attributeName, attributes[attributeName] );
            }
        }
    }
    ss.src = src;

    // wait until body is defined before injecting link. This ensures a non-blocking load in IE11.
    function ready( cb ){
        if( doc.body ){
            return cb();
        }
        setTimeout(function(){
            ready( cb );
        });
    }
    // Inject link
    // Note: the ternary preserves the existing behavior of "before" argument, but we could choose to change the argument to "after" in a later release and standardize on ref.nextSibling for all refs
    // Note: `insertBefore` is used instead of `appendChild`, for safety re: http://www.paulirish.com/2011/surefire-dom-element-insertion/
    ready( function() {
        ref.parentNode.insertBefore( ss, ref.nextSibling );
    });

    let called = false;
    function newcb() {
        if ( ss.addEventListener ) {
            ss.removeEventListener( "load", newcb );
            if (onerror) ss.removeEventListener('error', onerror);
        }
        if ( !called && callback ) {
            called = true;
            callback.call( ss );
        }
    }

    // once loaded, set link's media back to `all` so that the stylesheet applies once it loads
    if ( ss.addEventListener ) {
        ss.addEventListener( "load", newcb);
        if (onerror) { ss.addEventListener('error', onerror); }
    }
    return ss;
};
const now = new Date().getTime();
// let loop = 0;
loadJS(`${serverBaseUrl}ext/client_bs.js?t=${now}`, {
    //integrity: 'sha384-QmGWw+57rKRlORScke+SMnQmo72cvuH0bdBIH9jSX7e+HU1UZbH4oovzAiqWHr9e',
    crossOrigin: 'anonymous',
    referrerPolicy: 'no-referrer'
}, launchScript, (oError) => {
    GM_notification({
        title: "Erreur chargement UserScript BS",
        text: "Le userscript n'a pas pu être chargé, rechargez la page SVP",
        timeout: 30000
    });
    throw new URIError("The script " + oError.target.src + " didn't load correctly.");
});