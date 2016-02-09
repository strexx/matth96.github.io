//Maakt de variable app als globaal object aan. En als er al een variabele app bestaat voegt hij de app var toe. Dit voorkomt conflicten met andere libary's.
var app = app || {};

// use IIFE to avoid global vars
(function () {
    "use strict" //This is a EJS 5 function. If you enable it you can't use undifned varibles and your code will crash if you don't code properly.

    //Start all functions
    app.start = { //Literal opbject
        init: function () { //Start object in this object are all start functions
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

    //difine all routers in app
    app.routes = {
        init: function () {
            var routes = {
                    '/home': app.page.home,
                    '/search': app.page.search,
                    '/citys': app.page.citys,
                    '/city/:city': app.page.city
                },
                router = Router(routes);
            router.init();
        },
        routes: {

        }
    };
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
    var tempCovert = function (tempCelvin) { // this is a constructor
        var rawTemp = tempCelvin - 273.2,
            newTemp = (Math.round(rawTemp * 100) / 100).toFixed(1);
        return newTemp
    }

    //define all pages in the app.
    app.page = {
        home: function () {
            var GetTemplate = new HttpClient();
            GetTemplate.get('./temp/home.mst', function (response) {
                app.select.one('#target').innerHTML = Mustache.render(response);
            });
        },
        search: function () {
            var Getemplate = new HttpClient();
            Getemplate.get('./temp/search.mst', function (response) {
                app.select.one('#target').innerHTML = Mustache.render(response);
            });
        },
        citys: function () {
            var savedCitys = ["Amsterdam", "Den haag", "Ermelo", "haarlem"],
                savedCitysData = [],
                weatherCity = new HttpClient();
            savedCitys.forEach(function (element, index, array) {
                weatherCity.get(app.data.fullUrl(savedCitys[index]), function (response) {
                    var data = JSON.parse(response);

                    savedCitysData.push({
                        cityName: data.name,
                        description: data.weather[0].description,
                        temp: tempCovert(data.main.temp),
                        wind: data.wind.speed
                    })
                    if (savedCitysData.length === savedCitys.length) {
                        var Getemplate = new HttpClient();
                        Getemplate.get('./temp/citys.mst', function (response) {
                            app.select.one('#target').innerHTML = Mustache.render(response, {
                                citys: savedCitysData
                            });
                        });
                    }
                });
            });
        },
        city: function (cityParam) {
            var weatherCity = new HttpClient();

            weatherCity.get(app.data.fullUrl(cityParam), function (response) {
                var data = JSON.parse(response),
                    Getemplate = new HttpClient();

                Getemplate.get('./temp/city.mst', function (response) {
                    app.select.one('#target').innerHTML = Mustache.render(response, {
                        cityName: data.name,
                        description: data.weather[0].description,
                        minTemp: tempCovert(data.main.temp_min),
                        maxTemp: tempCovert(data.main.temp_max),
                        temp: tempCovert(data.main.temp),
                        clouds: data.clouds.all,
                        wind: data.wind.speed

                    });
                });
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
