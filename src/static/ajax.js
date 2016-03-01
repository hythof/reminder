var Ajax = {
    onRequest: function(){},
    onResponse: function(){},
    base: { 
        endpoint: '/',
        timeout: 10 * 1000,
        header: {},
    },
    get : function(path, callback, option) {
        return Ajax.request('GET', path, callback, option);
    },
    post : function(path, callback, param, header) {
        return Ajax.request('POST', path, callback, option);
    },
    request : function(method, path, callback, option) {
        // setup parameter
        var opt = option || {};
        var url = (opt.endpoint || Ajax.base.endpoint) + path;
        var timeout = opt.timeout || Ajax.base.timeout;
        var header = {};
        var param = opt.param;
        for(var key in Ajax.base.header) {
            header[key] = Ajax.base.header[key];
        }
        for(var key in opt.header || {}) {
            header[key] = opt.header[key];
        }

        // response setter
        var response = {
            timeout: false,
            status: 0,
            json: {},
            success: false,
            retry: function() {
                return Ajax.request(method, path, callback, opt);
            }
        };
        var success = function(json) {
            response.success = true;
            response.status = 200;
            response.json = json;
            callback(response);
            Ajax.onResponse(response);
        };
        var timeout = function() {
            response.timeout = true;
            callback(response);
            Ajax.onResponse(response);
        }
        var failure = function(status) {
            response.status = status;
            callback(response);
            Ajax.onResponse(response);
        }

        // send XMLHttpRequest
        var xhr = Ajax.xhr();
        xhr.open(method, url, true);
        xhr.onreadystatechange = function() {
            if(xhr.readyState == 4 && xhr.status > 0) {
                if(xhr.status == 200) {
                    var text = xhr.responseText;
                    var type = xhr.getResponseHeader('Content-Type');
                    if(type.indexOf('application/json') == -1) {
                        success(text);
                    } else {
                        var js_obj;
                        if(JSON && JSON.parse) {
                            js_obj = JSON.parse(text);
                        } else {
                            js_obj = eval('(' + text + ')');
                        }
                        success(js_obj);
                    }

                } else {
                    failure(xhr.status);
                }
            }
        }

        for(var key in header) {
            var value = header[key];
            xhr.setRequestHeader(key, value);
        }
        if(param) {
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            var lines = [];
            var i = 0;
            for(var key in param) {
                var value = param[key];
                lines[i] = key + '=' + encodeURIComponent(value);
                ++i;
            }
            xhr.send(lines.join('&'));
        } else {
            xhr.send('');
        }
        Ajax.onRequest({
            method: method,
            path: path,
            option: option
        });

        setTimeout(function() {
            if(xhr.readyState != 4) {
                xhr.abort();
                timeout();
            }
        }, Ajax.base.timeout);
    },
    xhr : function() {
        if (window.XMLHttpRequest) {
            return new XMLHttpRequest();
        } else {
            try {
                return new ActiveXObject('Msxml2.XMLHTTP');
            } catch (e) {
                return new ActiveXObject('Microsoft.XMLHTTP');
            }
        }
    }
} 
