//Maakt de variable app aanmaken als globaal object. En als er al een varianle app bestaat voegd hij de app var toe. Dit voorkomt conflicten met andere libary's
var app = app || {};

// use IIFE to avoid global vars
(function () {
    "use strict"

    //start all funtions
    app.start = { //litteral opbject
        init: function () { //start object in this object are all start functions

            // run the function app.routes.init.
            app.routes.init();
            app.support.init();
            app.page.weer();
            console.log('app started');
        }
    };

    //To easy select something form the DOM
    app.select = {
        one: function (selector) {
            return document.querySelector(selector);
        },
        all: function (selector) {
            return document.querySelectorAll(selector);
        }
    }

    //routes function
    app.routes = {
        init: function () {
            //if the window is loaded run app.sectons.toggle
            window.addEventListener("load", function () {
                app.sections.toggle(location.hash)

            }, false);
            //if the hash changes run app.sectons.toggle
            window.addEventListener("hashchange", function () {
                app.sections.toggle(location.hash)
            }, false);
        }
    }

    //toggle between the sections
    app.sections = {
        toggle: function (route) {
            var sections = app.select.all("main section");

            //if route is not defined hide all sections except the home section.
            if (!route) {
                this.hideall(sections)
                app.select.one("#home").classList.remove("disabled")
            } else {
                //disable all routes except the current route
                this.hideall(sections)
                app.select.one(route).classList.remove("disabled")
            }
        },
        hideall: function (sections) {
            //hide all sections
            var s = 0;
            for (s; s < sections.length; s++) {
                sections[s].classList.add("disabled")
            }
        }
    }

    //    app.data = {
    //        apiKey: "7aa0e92a8b7be8ed7e420e33de310e0e",
    //        url: ["http://api.openweathermap.org/data/2.5/weather?q=",
    //            "&appid="],
    //        fullUrl: function (city) {
    //            var fullUrl = app.data.url[0] + city + app.data.url[1] + app.data.apiKey;
    //            return fullUrl;
    //        }
    //    };
    //
    //    //source https://stackoverflow.com/questions/247483/http-get-request-in-javascript
    //    var HttpClient = function () {
    //        this.get = function (aUrl, aCallback) {
    //            var anHttpRequest = new XMLHttpRequest();
    //            anHttpRequest.onreadystatechange = function () {
    //                if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200)
    //                    aCallback(anHttpRequest.responseText);
    //            }
    //            anHttpRequest.open("GET", aUrl, true);
    //            anHttpRequest.send(null);
    //        }
    //    }
    //
    //
    //    app.page = {
    //        weer: function () {
    //            var temp, description, wind,
    //                aClient = new HttpClient();
    //            aClient.get(app.data.fullUrl('amsterdam,nl'), function (response) {
    //                console.log(description)
    //            });
    //
    //        }
    //    }

    // check of all functions are supported, if not, show a error message on op of the app.
    app.support = {
        init: function () {
            this.onhashchange()
        },
        onhashchange: function () {
            //check if onhashchange is in the window object if not show a error
            if ("onhashchange" in window) {
                console.log("onhashchange is supported")
            } else {
                app.select.one(".error").classList.add("show-error")
                app.select.one(".error").innerHTML = "The browser isn't supporting this app :("
            }
        }
    }

    //run the app
    app.start.init()
}())
