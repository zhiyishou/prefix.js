/**
 * Created by lz on 15/10/13.
 */
!function (factory) {
    if (typeof define === "function") {
        define("prefix", factory);
    } else {
        factory();
    }
}(function () {
    var toolDiv = document.createElement("div"),
        regexpTool = {},
        options = {},
        CURRENT_PREFIX = function () {
            if (navigator.userAgent.indexOf("MSIE") >= 0) {
                return "-ms-";
            } else if (navigator.userAgent.indexOf("Firefox") >= 0) {
                return "-moz-";
            } else if (navigator.userAgent.indexOf("Opera") >= 0) {
                return "-o-";
            } else if (navigator.userAgent.indexOf("Mozilla") >= 0) {
                return "-webkit-";
            }
        }();


    regexpTool = {
        /**
         * prefix a block after selector
         * @param data
         */
        prefixBlock: function prefixBlock(data) {
            return data.replace(/{(.*?)}/g, function (all, block) {
                return "{" + regexpTool.prefixProp(block) + "}";
            });
        },
        /**
         * prefix selector when it begin with "@" character
         * @param data
         */
        prefixSelector: function prefixSelector(data) {
            return data.replace(/(@.*?keyframes)|\((.*?)\)/, function (all, keyframes, brackets) {
                if (keyframes) {
                    return "@" + CURRENT_PREFIX + "keyframes";
                } else {//do prefix for content in brackets
                    return "(" + regexpTool.prefixProp(brackets) + ")";
                }
            });
        },
        /**
         * prefix each prop for content in a block
         * @param data
         * @param notAddSem
         */
        prefixProp: function prefixProp(data, notAddSem) {
            var currentProps = {};

            return data.replace(/([^;]*?):(.*?)(;|$)/g, function (all, prop, value) {
                var needPrefix = false;

                prop = prop.replace(/^(-webkit-|-moz-|-ms-|-o-)?(.*?)$/, function (all, prefix, pureProp) {
                    if (!isCSSSupport(pureProp, value)) {
                        if (isCSSSupport(CURRENT_PREFIX + pureProp, value)) {
                            needPrefix = true;
                        } else {
                            pureProp = "";
                        }
                    }

                    return pureProp;
                });

                if (prop && !(prop in currentProps)) {
                    currentProps[prop] = true;
                    return (needPrefix ? CURRENT_PREFIX : "") + prop + ":" + value + ( notAddSem ? "" : ";");
                } else {
                    return "";
                }
            })
        },
        formatBlock: function (data) {
            return data.replace(/;}|{|;/g, function (all) {
                switch (all.length) {
                    case 2:
                        return all.charAt(0) + "\n" + all.charAt(1) + "\n\n";
                    case 1:
                        return all + "\n\t";
                }
            });
        }
    };

    function getPrefixLinks() {
        var links = document.getElementsByTagName("link"),
            prefixLinks = [],
            i,
            l;

        for (i = 0, l = links.length; i < l; i++) {
            if (links[i].getAttribute("rel") === "stylesheet/prefix") {
                prefixLinks.push(links[i]);
            }
        }

        return prefixLinks;
    }

    function getPrefixPair(callback) {
        var result = {key: getPrefixLinks(), value: []},
            i,
            l;

        for (i = 0, l = result.key.length; i < l; i++) {
            (function (index) {
                doXHR(result.key[index].href, function (data) {
                    if (data) {
                        result.value[index] = doPrefix(data);

                        checkAllDone(result);
                    }
                });
            })(i)
        }

        function checkAllDone(result) {
            var len = 0,
                i = 0,
                l = result.key.length;

            for (; i < l; i++) {
                if (typeof result.value[i] !== "undefined") {
                    len++;
                }
            }

            if (len == l) {
                callback(result);
            }
        }
    }

    function getXMLHttpRequest() {
        if (window.XMLHttpRequest && (window.location.protocol !== "file:" || !window.ActiveXObject)) {
            return new XMLHttpRequest();
        } else {
            try {
                return new ActiveXObject("Microsoft.XMLHTTP");
            } catch (e) {
                console.log("browser doesn't support AJAX.");
                return null;
            }
        }
    }

    function doXHR(url, callback, errback) {
        var xhr = getXMLHttpRequest();

        if (typeof(xhr.overrideMimeType) === 'function') {
            xhr.overrideMimeType('text/css');
        }

        xhr.open('GET', url, true);
        xhr.setRequestHeader('Accept', 'text/css; q=0.9, */*; q=0.5');
        xhr.send(null);

        function handleResponse(xhr, callback, errback) {
            if (xhr.status >= 200 && xhr.status < 300) {
                callback(xhr.responseText,
                    xhr.getResponseHeader("Last-Modified"));
            } else if (typeof(errback) === 'function') {
                errback(xhr.status, url);
            }
        }

        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                handleResponse(xhr, callback, errback);
            }
        };
    }

    function doPrefix(data) {
        data = data
            .replace(/\s*\/\*.*\*\/\s*/g, "")  //clear comments
            .replace(/\s*([\{\}\:\;\,])\s*/g, "$1") //clear spaces
            .replace(/\s+/g, " ") //combine spaces
            .replace(/(@.*?)({((.+?{.*?})+?)})|{(.*?)}/g, function (all, selector, contentWithQuote, content, contentLastMatch, singleContent) {//do prefix
                if (singleContent) {//when match the pattern after "|" (start with @)
                    return "{" + regexpTool.prefixProp(singleContent) + "}";
                } else {//when match the pattern before "|"
                    return regexpTool.prefixSelector(selector) + "{" + regexpTool.prefixBlock(content) + "}";
                }
            });

        if (options.format) {
            data = data.replace(/{[^{}]*?}/g, function (all) {
                //format for {content} formation
                return regexpTool.formatBlock(all);
            }).replace(/{(.*?{(.|\n)*?}\n+)}/g, function (all, content) {
                //format for {{content}} formation
                return "{\n\n\t" + content.replace(/(\n(?=[^$]))/g, "$1\t") + "}\n\n";
            })

        }

        return data;
    }

    function isCSSSupport(prop, value) {
        var support;

        value = typeof value === "undefined" ? "inherit" : value;

        if ("CSS" in window && "supports" in window.CSS) {
            return window.CSS.supports(prop, value);
        }

        if ("supportsCSS" in window) {
            return window.supportsCSS(prop, value);
        }

        support = prop in toolDiv.style;

        toolDiv.style.cssText = prop + ":" + value;

        return support && toolDiv.style[prop] !== "";
    }

    function replaceLinks(pair) {
        var i, l, style, link;

        for (i = 0, l = pair.key.length; i < l; i++) {
            link = pair.key[i];
            style = document.createElement("style");
            style.innerHTML = pair.value[i];
            style.setAttribute("href", link.href);

            link.parentNode.replaceChild(style, link);
        }
    }

    function getCurrentScript() {
        return document.currentScript || (function () {
                var scripts = document.getElementsByName("script");
                return scripts[scripts.length - 1];
            })();
    }

    function init() {
        var script = getCurrentScript();

        options.format = script.getAttribute("format")
    }

    init();
    getPrefixPair(function (pair) {
        replaceLinks(pair);
    });

});