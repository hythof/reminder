// template
function Template(vars) {
    this.vars = vars;
    this.renders = [];
}
Template.prototype.update = function() {
    var value = this.vars[key];
    var len = renders.length;
    for(var i=0; i<len; ++i) {
        var render = renders[i];
        var html = render.convert();
        if(html != render.html) {
            render.dom.InnerHTML = html;
            render.html = html;
        }
        render.dom.InnerHTML = render.convert();
    }
}
Template.prototype.register = function(dom) {
    var template = dom.InnerHTML;
    var xs = this.renders;
    xs[xs.length] = {
        dom: dom,
        html: "",
        convert: function convert() {

        }
    };
}

// application code
function init() {

}
window.addEventListener('load', init)
