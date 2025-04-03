199: [function(e, t, n) {
    "use strict";
    var r = e("@babel/runtime/helpers/interopRequireDefault")(e("./Sketch"))
      , i = e("../../core/properties")
      , o = e("../../io/shadertoy")
      , a = e("./editorButtons")
      , s = e("./editorTabs")
      , l = e("./editorCode")
      , c = e("./editorControls")
      , u = e("../../controls/cameraControls")
      , h = e("../prompt/prompt")
      , d = e("../prompt/promptData");

    n.init = function() {
        p = document.querySelector(".quant"),
        m = document.querySelector(".quant__intro--minimize"),
        v = document.querySelectorAll(".quant .button__instructions"),
        f = document.querySelectorAll(".quant__nav-mode"),
        a.init(),
        s.init(),
        l.init(),
        c.init(),
        i.onQuantTabChanged.add(_),
        m.addEventListener("click", x);
        for (var e = 0, t = v.length; e < t; e++)
            v[e].addEventListener("click", b);
        for (var n = 0, r = f.length; n < r; n++)
            f[n].addEventListener("change", S);
        (y = localStorage.getItem("quantMinimized")) && (y = !y, x())
    },

    n.show = function() {
        p.classList.add("is-visible"),
        c.syncViewQuality(),
        S()
    },

    n.hide = function() {
        p.classList.remove("is-visible")
    },

    n.initLocalSketches = function() {
        if (null !== i.forkQuantSlotIndex)
            for (var e = 0, t = s.tabs.length; e < t; e++)
                e === i.forkQuantSlotIndex && s.setActiveTab(e);
        for (var n = 0, o = s.tabs.length; n < o; n++) {
            var a = g[n];
            a || ((a = new r.default({
                id: n
            })).init(),
            g.push(a)),
            s.tabs[n].classList.contains("is-active") && (null !== i.forkQuantSlotIndex ? a.importShader(i.currentQuantSketch.shader, i.currentQuantSketch.data) : (i.currentQuantSketch = a).show())
        }
        i.forkQuantSlotIndex = null
    },

    n.resize = w,

    n.update = function(e) {
        c.update()
    };

    var p, f, m, v, g = [], y = (i.currentQuantSketch = null, !1);

    function x(e) {
        y = !y,
        p.classList.toggle("is-minimized", y),
        m.title = y ? "Show Instruction" : "Hide Instruction",
        w(i.width, i.height),
        localStorage.setItem("quantMinimized", y)
    }
    function b() {
        "test-shadertoy" === this.dataset.id ? (h.showInput("Please enter a shadertoy sketch url:", "https://www.shadertoy.com/view/3sySRK", !1, !1),
        h.setOkCallback((function() {
            var e = h.getInputValue()
              , t = e.replace("https://www.shadertoy.com/view/", "");
            t = t.replace("/", ""),
            o.load(t, (function(t) {
                if (t.success)
                    window.open("https://cineshader.com/view/" + e.split("/view/")[1]);
                else {
                    var n = o.ERROR_MESSAGES[t.errorType];
                    h.showMsg(n, !0)
                }
            }
            ))
        }
        ))) : h.showMsg(d[this.dataset.id], !1)
    }
    function _() {
        var e = document.querySelector(".quant__tab.is-active")
          , t = Array.prototype.indexOf.call(s.tabs, e);
        (i.currentQuantSketch = g[t]).show(),
        l.clearHistory()
    }
    function w(e, t) {
        l.resize()
    }
    function S() {
        for (var e = 0, t = f.length; e < t; e++) {
            var n = f[e];
            if (n.checked) {
                u.changeMode(n.value);
                break
            }
        }
    }
}
, {
    "../../controls/cameraControls": 88,
    "../../core/properties": 92,
    "../../io/shadertoy": 112,
    "../prompt/prompt": 157,
    "../prompt/promptData": 158,
    "./Sketch": 132,
    "./editorButtons": 134,
    "./editorCode": 135,
    "./editorControls": 136,
    "./editorTabs": 150,
    "@babel/runtime/helpers/interopRequireDefault": 11
}],
