//Maakt de variable app als globaal object aan. En als er al een variabele app bestaat voegt hij de app var toe. Dit voorkomt conflicten met andere libary's.
var app = app || {};

// use IIFE to avoid global vars
(function () {
    "use strict" //This is a EJS 5 function. If you enable it you can't use undifned varibles and your code will crash if you don't code properly.

    //Start all functions
    app.start = { //Literal opbject
        init: function () { //Start object in this object are all start functions

            app.page.init();
            app.routes.init();
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
            app.page.citys();
        },
        citys: function () {
            var temp, description, wind
            var weatherCity = new HttpClient();

            weatherCity.get(app.data.fullUrl('amsterdam,nl'), function (response) {

                var data = JSON.parse(response);
                var description = data.weather[0].description,
                    temp = description.coord,
                    wind = data;

            });
        }
    }


    app.routes = {
        init: function () {
            var routes = {
                    '/home': this.home,
                    '/citys': this.citys,
                    '/city/:city': this.city
                },
                router = Router(routes);

            router.init();
        },
        home: function () {
            var home = app.select.one('#home').innerHTML,
                rendered = Mustache.render(home, {
                    name: "Luke",
                    power: "force"
                });

            Mustache.parse(home);
            app.select.one('#target').innerHTML = rendered;
        },
        citys: function () {

            var citys = app.select.one('#citys').innerHTML,
                rendered = Mustache.render(citys, {
                    name: "citys",
                    power: "force"
                });

            Mustache.parse(citys);
            app.select.one('#target').innerHTML = rendered;
        }
    };





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
