var trace = console.log.bind(window.console);
var lazy = function(name, onload) {
    function check(loaded) {
        var obj = window[name];
        if(obj) {
            loaded(obj);
        } else {
            setTimeout(function() {
                check(loaded);
            }, 100);
        }
    }
    return function (loading, loaded) {
        var obj = window[name];
        if(obj) {
            loaded(obj);
        } else {
            loading();
            check(loaded);
        }
    };
};
var vendor = {
    graphviz: lazy('Viz'),
    markdown: lazy('marked', function(marked) {
        marked.setOptions({
            renderer: new marked.Renderer(),
            gfm: true,
            tables: true,
            breaks: false,
            pedantic: false,
            sanitize: true,
            smartLists: true,
            smartypants: false,
            highlight: function (code, lang) {
                return code;
            }
        });
    })
};

var App = function(ui) {
    this.ui = ui;
    this.notes = [];
}
App.prototype.init = function(data) {
    var notes = [];
    var len = data.texts.length;
    var modify = this.ui.modify.bind(this.ui);
    for(var i=0; i<len; ++i) {
        notes[i] = new Note(data.texts[i], modify);
        notes[i].index = i;
    }
    this.notes = notes;
    this.ui.change({
        current: notes[2],
        notes: notes
    });
}

var UI = function() {
    // variable
    var me = this;
    this.state = {
        sidebar: false,
        connection: 0,
        notes: [],
        current: new Note()
    };

    // initialize dom
    this.dom = {
        title: document.getElementById('title'),
        note: document.getElementById('note'),
        loading: document.getElementById('loading'),
        sidebar: document.getElementById('sidebar'),
        sidebar_list: document.getElementById('sidebar_list')
    };

    // register click event
    this._click('menu', function() { me.change({sidebar: !me.state.sidebar}); });

    // keybord shortcut
    keymap({
        'q': function() { me.change({sidebar: false}); },
        191: function() { me.change({sidebar: true}); }, // key of '/'
        'j': function() { me.state.sidebar ? me.change({current: me.nextNote()}) : 0; },
        'k': function() { me.state.sidebar ? me.change({current: me.prevNote()}) : 0; },
        'l': function() { me.change({sidebar: true}); },
        'h': function() { me.change({sidebar: false}); }
    });
}
UI.prototype.change = function(newState) {
    var modify = false;
    for(var key in newState) {
        var value = newState[key];
        var modify = modify || this.state[key] != value;
        this.state[key] = value;
    }
    if(modify) {
        trace("change ui state", newState);
        this.render();
    }
};
UI.prototype.nextNote = function() {
    var notes = this.state.notes;
    var current = this.state.current;
    return current.index < (notes.length - 1) ? notes[current.index + 1] : current;
}
UI.prototype.prevNote = function() {
    var notes = this.state.notes;
    var current = this.state.current;
    return current.index > 0 ? notes[current.index - 1] : current;
}
UI.prototype.modify = function() {
    if(this.render_reserve) {
        return;
    }
    this.render_reserve = true;
    var f = this.render.bind(this);
    setTimeout(f, 1);
};
UI.prototype.render = function() {
    var me = this;
    var state = this.state;
    var current = state.current;
    var dom = this.dom;

    document.title = 'pad | ' + current.title;
    dom.title.innerText = current.title;
    dom.note.innerHTML = current.html;
    dom.loading.style.display = state.connection > 0 ? 'block' : 'none';
    dom.sidebar.style.display = state.sidebar ? 'block' : 'none';
    if(state.sidebar) {
        // todo benchmark
        var notes = state.notes;
        var len = notes.length;
        var ul = document.createElement('ul');
        for(var i=0; i<len; ++i) {
            var note = notes[i];
            var li = document.createElement('li');
            li.className = 'anchor';
            if(note == state.current) {
                li.className += ' current';
            }
            li.innerText = note.title;
            li.addEventListener('click', function(note) {
                return function() {
                    me.change({current: note});
                };
            }(note), false);
            ul.appendChild(li);
        }
        dom.sidebar_list.innerHTML = '';
        dom.sidebar_list.appendChild(ul);
    }
}
UI.prototype._click = function(id, func) {
    var doc = document.getElementById(id);
    if(!doc) {
        trace("not found id=" + id);
        return;
    }
    var me = this;
    doc.addEventListener('click', function() {
        func();
        me.render();
    }, false);
}

var Note = function(text, onModify) {
    if(text) {
        var pos = text.indexOf('\n\n');
        var head = text.slice(0, pos);
        var body = text.slice(pos + 1)
        var header = parse_header(head);

        this.title = header.title || '(no title)';
        this.text = text;
        this.set_html(header.format || 'text', body);
    } else {
        this.title = '(no title)';
        this.text = '';
        this.html = '';
    }
    this.onModify = onModify || function(){};
}
Note.prototype.set_html = function(format, body) {
    var note = this;
    var loading = '<div class="lazy_loading"><pre>' + body + '</pre></div>';
    if(format == 'html') {
        this.html = body;
    } else if(format == 'markdown') {
        vendor.markdown(function(){
            note.html = loading;
        }, function(f){
            note.html = f(body);
            note.onModify();
        });
    } else if(format == 'graphviz') {
        vendor.graphviz(function(){
            note.html = loading;
        }, function(f){
            note.html = f(body);
            note.onModify();
        });
    } else if(format == 'text') {
        this.html = '<pre>' + body + '</pre>';
    } else {
        // fallback
        this.html = '<pre>' + body + '</pre>' + '<span class="warning">unknown format=' + format + '</span>';
    }
}

function init() {
    var ui = new UI();

    window.app = new App(ui);
    Ajax.onRequest = function() {
        ui.change({connection: ui.state.connection + 1});
        ui.render();
    };
    Ajax.onResponse = function() {
        ui.change({connection: ui.state.connection - 1});
        ui.render();
    };
    Ajax.get('api/get', function(response) {
        if(response.success) {
            app.init(response.json);
        } else {
            if(window.confirm('通信がうまくいきませんでした。リトライしますか？')) {
                response.retry();
            }
        }
    });
}
document.addEventListener('DOMContentLoaded', init)

// utility
function parse_header(text) {
    var lines = text.split('\n');
    var len = lines.length;
    var header = {};
    for(var i=0; i<len; ++i) {
        var line = lines[i];
        var pos = line.indexOf(' ');
        var key = line.slice(1, pos);
        var val = line.slice(pos + 1);
        header[key] = val;
    }
    return header;
}

// keyboard shortcut
function keymap(dict) {
    var map = {};
    for(var key in dict) {
        if(key.match(/^\d+$/)) {
            var code = Number(key);
            map[code] = dict[key];
        } else {
            var code = key.toUpperCase().charCodeAt(0);
            if(48 <= code && code <= 57) { // 0 .. 9
                map[code] = dict[key];
            } else if(65 <= code && code <= 122) { // A .. z
                map[code] = dict[key];
            } else {
                trace("keyCode out of range", key);
            }
        }
    }
    window.addEventListener('keyup', function(e) {
        var e = e || window.event;
        var c = keyCode(e);
        var f = map[c];
        if(f) {
            f();
        }
    });
}
function keyCode(e){
    if(document.all) {
        return e.keyCode;
    } else if(document.getElementById) {
        return (e.keyCode)? e.keyCode: e.charCode;
    } else if(document.layers) {
        return e.which;
    }
}
