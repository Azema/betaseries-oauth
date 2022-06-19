/*!
 * Lazy Load - JavaScript plugin for lazy loading images
 *
 * Copyright (c) 2007-2019 Mika Tuupola
 *
 * Licensed under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 *
 * Project home:
 *   https://appelsiini.net/projects/lazyload
 *
 * Version: 2.0.0-rc.2
 *
 */

(function (root, factory) {
    if (typeof exports === "object") {
        module.exports = factory(root);
    } else if (typeof define === "function" && define.amd) {
        define([], factory);
    } else {
        root.lazyLoad = factory(root);
    }
}) (typeof global !== "undefined" ? global : this.window || this.global, function (root) {

    "use strict";

    if (typeof define === "function" && define.amd){
        root = window;
    }

    const defaults = {
        src: "data-src",
        srcset: "data-srcset",
        selector: ".lazyload",
        root: null,
        rootMargin: "0px",
        threshold: 0
    };

    function lazyLoad(images, options) {
        this.settings = Object.assign({}, defaults, options || {});
        this.images = images || document.querySelectorAll(this.settings.selector);
        this.observer = null;
        this.init();
    }

    lazyLoad.prototype = {
        init: function() {

            /* Without observers load everything and bail out early. */
            if (!root.IntersectionObserver) {
                this.loadImages();
                return;
            }

            let self = this;
            let observerConfig = {
                root: this.settings.root,
                rootMargin: this.settings.rootMargin,
                threshold: [this.settings.threshold]
            };

            this.observer = new IntersectionObserver(function(entries) {
                Array.prototype.forEach.call(entries, function (entry) {
                    if (entry.isIntersecting) {
                        self.observer.unobserve(entry.target);
                        if ("img" === entry.target.tagName.toLowerCase()) {
                            if (self.settings.attribute) {
                                // console.log('lazyload observer attribute');
                                self.preloadImg(entry.target, self.settings.attribute);
                            }
                            else if (entry.target.getAttribute(self.settings.src)) {
                                // console.log('lazyload observer src');
                                self.preloadImg(entry.target, 'src');
                            }
                            else if (entry.target.getAttribute(self.settings.srcset)) {
                                // console.log('lazyload observer srcset');
                                self.preloadImg(entry.target, 'srcset');
                            }
                        } else {
                            let src;
                            if (self.settings.attribute)
                                src = entry.target.getAttribute(self.settings.attribute);
                            else if (entry.target.getAttribute(self.settings.src)) {
                                src = entry.target.getAttribute(self.settings.src);
                            }
                            if (src) {
                                entry.target.style.backgroundImage = `url(${src})`;
                            }
                        }
                    }
                });
            }, observerConfig);

            Array.prototype.forEach.call(this.images, function (image) {
                // console.log('lazyload init image', image);
                if (! image.classList.contains("js-lazy-image-handled")) {
                    self.observer.observe(image);
                }
            });
        },

        fetchImg: function(urlSrc) {
            return new Promise((resolv, reject) => {
                const n = new Image;
                n.src = urlSrc;
                n.onload = resolv;
                n.onerror = reject;
            });
        },

        applyImg: function(elt, urlSrc, attr) {
            // console.log('applyImg', {urlSrc, attr});
            elt.classList.add("js-lazy-image-handled");
            elt[attr] = urlSrc;
            elt.classList.add("fade-in");
        },

        preloadImg: function(elt, attr) {
            const url = elt.getAttribute(attr);
            if (url && url.length > 0) {
                // console.log('preloadImg URL ok', url);
                const result = this.fetchImg(url);
                result.then(() => this.applyImg(elt, url, attr.replace('data-', '')));
                if (this.settings.onerror && typeof this.settings.onerror === 'function') {
                    // console.log('preloadImg onerror', this.settings.onerror);
                    result.catch((err) => this.settings.onerror(err, elt, url, attr.replace('data-', '')));
                } else {
                    result.catch(() => {});
                }
            }
        },

        loadAndDestroy: function () {
            if (!this.settings) { return; }
            this.loadImages();
            this.destroy();
        },

        loadImages: function () {
            if (! this.settings) { return; }

            let self = this;
            Array.prototype.forEach.call(this.images, function (image) {
                self.observer.unobserve(image);
                let src = image.getAttribute(self.settings.src);
                let srcset = image.getAttribute(self.settings.srcset);
                if ("img" === image.tagName.toLowerCase()) {
                    if (self.settings.attribute) {
                        self.preloadImg(image, self.settings.attribute);
                    }
                    else if (src) {
                        self.preloadImg(image, 'src');
                    }
                    else if (srcset) {
                        self.preloadImg(image, 'srcset');
                    }
                } else {
                    image.style.backgroundImage = `url(${src})`;
                }
            });
        },

        destroy: function () {
            if (!this.settings) { return; }
            this.observer.disconnect();
            this.settings = null;
        }
    };

    root.lazyLoad = function(images, options) {
        return new lazyLoad(images, options);
    };

    if (root.jQuery) {
        const $ = root.jQuery;
        $.fn.lazyload = function (options) {
            options = options || {};
            options.attribute = options.attribute || "data-src";
            new lazyLoad($.makeArray(this), options);
            return this;
        };
    }

    return lazyLoad;
});