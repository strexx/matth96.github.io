//Maakt de variable app aanmaken als globaal object. En als er al een varianle app bestaat voegd hij de app var toe. Dit voorkomt conflicten met andere libary's
var app = app || {};

// use IIFE to avoid global vars
(function () {
    "use strict"

    //start all funtions
    app.start = {
        init: function () {
            app.router.init();
            console.log('app started')
        }
    };

    app.html = {
        selector: function (selector) {
            return document.querySelector(selector);
        },
        selectors: function (selector) {
            return document.querySelectorAll(selector);
        }
    }

    //router function
    app.router = {
        init: function () {
            window.addEventListener("load", function () {
                app.sections.toggle(location.hash)
            }, false);
            window.addEventListener("hashchange", function () {
                app.sections.toggle(location.hash)
            }, false);
        }
    }

    //toggle between the sections
    app.sections = {
        toggle: function (route) {
            var sections = app.html.selectors("main section");

            if (!route) {
                this.hideall(sections)
                app.html.selector("#home").classList.remove("none")
            } else {
                this.hideall(sections)
                app.html.selector(route).classList.remove("none")
            }
        },
        hideall: function (sections) {
            var s = 0;
            for (s; s < sections.length; s++) {
                sections[s].classList.add("none")
            }
        }
    }
    app.support = {
        init: function () {
            this.onhashchange()
        },
        onhashchange: function () {
            if ("onhashchange" in window) {
                alert("The browser supports the hashchange event!");
            }
        }
    }

    //voer de app uit
    app.start.init()
}())
