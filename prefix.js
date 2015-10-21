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
        prefixTool = {},
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


    prefixTool = {
        /**
         * prefix a block after selector
         * @param data
         */
        prefixBlock: function prefixBlock(data) {
            return data.replace(/{(.*?)}/g, function (all, block) {
                return "{" + prefixTool.prefixProp(block) + "}";
            });
        },
        /**
         * prefix selector when it begin with "@" character
         * @param data
         */
        prefixSelector: function prefixSelector(data) {
            return data.replace(/(@.*?keyframes)|\((.*?)\)/, function (all, keyframes, brackets) {
                if (keyframes) {
                    return "@" + CURRENT_PREFIX + keyframes;
                } else {//do prefix for content in brackets
                    return "(" + prefixTool.prefixProp(brackets) + ")";
                }
            });
        },
        /**
         * prefix each prop for content in a block
         * @param data
         * @param notAddSem
         */
        prefixProp: function prefixProp(data, notAddSem) {
            return data.replace(/([^;]*?):(.*?)(;|$)/g, function (all, prop, value) {
                if (!isCSSSupport(prop, value)) {
                    return "";
                } else {
                    return prop + ":" + value + ( notAddSem ? "" : ";" );
                }
            })
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
            .replace(/(@.*?)({(.+?{.*?})+?})|{(.*?)}/g, function (all, selector, contentWithQuote, content, singleContent) {//do prefix
                if (singleContent) {//when match the pattern after "|"
                    return "{" + prefixTool.prefixProp(singleContent) + "}";
                } else {//when match the pattern before "|"
                    return prefixTool.prefixSelector(selector) + "{" + prefixTool.prefixBlock(content) + "}";
                }
            });

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

    getPrefixPair(function (pair) {
        replaceLinks(pair);
    });
});