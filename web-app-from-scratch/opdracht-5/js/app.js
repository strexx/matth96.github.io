//Maakt de variable app als globaal object aan. En als er al een variabele app bestaat voegt hij de app var toe. Dit voorkomt conflicten met andere libary's.
var app = app || {};

// use IIFE to avoid global vars
(function () {
    "use strict" //This is a EJS 5 function. If you enable it you can't use undifned varibles and your code will crash if you don't code properly.

    //Start all functions
    app.start = { //Literal opbject
        init: function () { //Start object in this object are all start functions

            //Run the function app.routes.init
            app.routes.init();
            app.support.init();
            app.page.init();
            console.log('app started');
        }
    };

    //To easily select something from the DOM
    app.select = {
        one: function (selector) { //This is a method
            return document.querySelector(selector);
        },
        all: function (selector) {
            return document.querySelectorAll(selector);
        }
    }

    //routes function
    app.routes = {
        init: function () {
            this.load(); //this is a closure
            this.hashchange();
        },
        load: function () {
            //If the window is loaded, run app.sections.toggle
            window.addEventListener("load", function () {
                app.sections.toggle(location.hash)
            }, false);
        },
        hashchange: function () {
            //If the hash changes, run app.sections.toggle
            window.addEventListener("hashchange", function () {
                app.sections.toggle(location.hash)
            }, false);
        }
    }

    //Toggle between the sections
    app.sections = {
        toggle: function (route) {
            var sections = app.select.all("main section"); //This is variable hoisting

            //If route is not defined hide all sections except the home section.
            if (!route) {
                this.showCurrent(sections, "#home")
            } else {
                //disable all routes except the current route
                this.showCurrent(sections, route)
            }
        },
        showCurrent: function (sections, route) {
            //hide all sections
            var s = 0;

            for (s; s < sections.length; s++) {
                var idRoute = "#" + sections[s].id

                if (idRoute !== route) {
                    sections[s].classList.add("disabled")
                } else {
                    app.select.one(route).classList.remove("disabled")
                }
            }
        }
    }

    app.data = {
        apiKey: "7aa0e92a8b7be8ed7e420e33de310e0e",
        url: ["http://api.openweathermap.org/data/2.5/weather?q=",
                "&appid="],
        fullUrl: function (city) {
            var fullUrl = app.data.url[0] + city + app.data.url[1] + app.data.apiKey;

            return fullUrl;
        }
    };

    //Source https://stackoverflow.com/questions/247483/http-get-request-in-javascript
    var HttpClient = function () { // this is a constructor
        this.get = function (aUrl, aCallback) {
            var anHttpRequest = new XMLHttpRequest();

            anHttpRequest.onreadystatechange = function () {
                if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200)
                    aCallback(anHttpRequest.responseText);
            }
            anHttpRequest.open("GET", aUrl, true);
            anHttpRequest.send(null);
        }
    }

    app.page = {
        init: function () {
            app.page.weer();
        },
        weer: function () {
            // var temp, description, wind
            var weatherCity = new HttpClient();

            weatherCity.get(app.data.fullUrl('amsterdam,nl'), function (response) {

                var description = response.weather[0].description,
                    temp = description.coord,
                    wind = response;

                //                console.log("alldata" + response)
                console.log("description: " + description)
                    //                console.log("temp: " + temp)
                    //                console.log("wind:" + wind)
            });
        }
    }

    //Check if all functions are supported, if not, show an error message at top of the app.
    app.support = {
        init: function () {
            this.onhashchange()
        },
        onhashchange: function () {
            //Check if onhashchange is in the window object if not show a error
            if ("onhashchange" in window) {
                console.log("onhashchange is supported")
            } else {
                app.select.one(".error").classList.add("show-error")
                app.select.one(".error").innerHTML = "The browser isn't supporting this app :("
            }
        }
    }

    //Run the app
    app.start.init()
}())
