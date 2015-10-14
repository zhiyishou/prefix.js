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
    function getPrefixURL() {
        var links = document.getElementsByTagName("link"),
            prefixLinks = [],
            i,
            l;

        for (i = 0, l = links.length; i < l; i++) {
            if (links[i].getAttribute("rel") === "stylesheet/prefix") {
                prefixLinks.push(links[i].href);
            }
        }

        return prefixLinks;
    }

    function getPrefixFile() {
        var urls = getPrefixURL(),
            i,
            l;

        for (i = 0, l = urls.length; i < l; i++) {
            doXHR(urls[i], function (data) {
                if(data){
                    findAttrs(data);
                }
            });
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

    function findAttrs(data){
        var pattern = new RegExp("[^{};\\s].*?(?=;)","igm"),
            result;

        data = data.replace(pattern,function(word){
            result = word.split(":");
            if(!CSS.supports(result[0],result[1])){
                return "current_attr: " + result[1];
            }else{
                return word;
            }
        });
        console.log(data);
    }

    getPrefixFile();
});