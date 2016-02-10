//Maakt de variable app als globaal object aan. En als er al een variabele app bestaat voegt hij de app var toe. Dit voorkomt conflicten met andere libary's.
var app = app || {};

// use IIFE to avoid global vars
(function () {
    "use strict" //This is a EJS 5 function. If you enable it you can't use undifned varibles and your code will crash if you don't code properly.

    //Start all functions
    app.start = { //Literal opbject
        init: function () { //Start object in this object are all start functions
            app.support.init();
            app.routes.init();
            localStorage.setItem('savedCitys', "[]");
            console.log('app started');
        }
    };

    //To easily select something from the DOM
    app.get = {
        one: function (selector) { //This is a method
            return document.querySelector(selector);
        },
        all: function (selector) {
            return document.querySelectorAll(selector);
        },
        tempCovert: function (tempCelvin) { // this is a constructor
            var rawTemp = tempCelvin - 273.2,
                newTemp = (Math.round(rawTemp * 100) / 100).toFixed(1);

            return newTemp
        }
    };
    app.localStorage = {
        get: function () {
            var savedCitys = localStorage.getItem('savedCitys');
            return JSON.parse(savedCitys)
        },
        add: function (data) {
            var savedCitys = this.get();
            savedCitys.push(data);
            var stringifiedData = JSON.stringify(savedCitys);
            localStorage.setItem('savedCitys', stringifiedData);
        }
    };

    //difine all routers in app
    app.routes = {
        init: function () {
            var routes = {
                    '/': app.page.init,
                    '/home': app.page.home,
                    '/search': app.page.search,
                    '/citys': app.page.citys,
                    '/city/:city': app.page.city
                },
                router = Router(routes);

            router.init();
        }
    };

    app.data = {
        apiKey: "7aa0e92a8b7be8ed7e420e33de310e0e",
        brokenWeatherUrl: ["http://api.openweathermap.org/data/2.5/weather?q=",
                    "&units=metric&appid="],
        brokenSearchUrl: ["http://api.openweathermap.org/data/2.5/find?q=", "&type=like&mode=json&appid=", "&units=metric&appid="],
        WeatherUrl: function (city) {
            var fullUrl = app.data.brokenWeatherUrl[0] + city + app.data.brokenWeatherUrl[1] + app.data.apiKey;

            return fullUrl;
        },
        SearchUrl: function (search) {
            var fullUrl = app.data.brokenSearchUrl[0] + search + app.data.brokenSearchUrl[1] + app.data.apiKey;

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
        };
    };

    //define all pages in the app.
    app.page = {
        init: function () {
            location.replace('#/home');
        },
        home: function () {
            var GetTemplate = new HttpClient();

            GetTemplate.get('./temp/home.mst', function (response) {
                app.get.one('#target').innerHTML = Mustache.render(response);
            });
        },
        search: function () {
            var Getemplate = new HttpClient();
            Getemplate.get('./temp/search.mst', function (response) {
                var responseTemplate = response;
                app.get.one('#target').innerHTML = Mustache.render(responseTemplate, {
                    searchresult: []

                });
                var searchCity = new HttpClient(),
                    searchQuery = app.get.one('#search');

                searchQuery.addEventListener('input', function () {
                    if (searchQuery.value.length > 2) {
                        searchCity.get(app.data.SearchUrl(searchQuery.value), function (response) {
                            var search = JSON.parse(response).list;

                            app.get.one('#target').innerHTML = Mustache.render(responseTemplate, {
                                searchresult: search
                            });
                            app.get.one(".searchlist").addEventListener("click", function (e) {
                                if (e.target && e.target.nodeName == "LI") {
                                    app.localStorage.add(e.target.innerHTML)
                                }
                            });

                        });
                    }
                });
            });
        },
        citys: function () {
            var savedCitysData = [],
                savedCitys = app.localStorage.get(),
                weatherCity = new HttpClient();

            savedCitys.forEach(function (element, index, array) {
                weatherCity.get(app.data.WeatherUrl(savedCitys[index]), function (response) {
                    var data = JSON.parse(response);

                    savedCitysData.push({
                        cityName: data.name,
                        description: data.weather[0].description,
                        temp: data.main.temp,
                        wind: data.wind.speed
                    })
                    if (savedCitysData.length === savedCitys.length) {
                        var Getemplate = new HttpClient();

                        Getemplate.get('./temp/citys.mst', function (response) {
                            app.get.one('#target').innerHTML = Mustache.render(response, {
                                citys: savedCitysData
                            });
                        });
                    }
                });
            });
        },
        city: function (cityParam) {
            var weatherCity = new HttpClient();

            weatherCity.get(app.data.WeatherUrl(cityParam), function (response) {
                var data = JSON.parse(response),
                    Getemplate = new HttpClient();

                Getemplate.get('./temp/city.mst', function (response) {
                    app.get.one('#target').innerHTML = Mustache.render(response, {
                        cityName: data.name,
                        description: data.weather[0].description,
                        minTemp: data.main.temp_min,
                        maxTemp: data.main.temp_max,
                        temp: data.main.temp,
                        clouds: data.clouds.all,
                        wind: data.wind.speed

                    });
                });
            });
        }
    };

    //Check if all functions are supported, if not, show an error message at top of the app.
    app.support = {
        init: function () {
            this.onhashchange()
            this.online()
        },
        onhashchange: function () {
            //Check if onhashchange is in the window object if not show a error
            if ("onhashchange" in window) {
                console.log("onhashchange is supported")
            } else {
                app.get.one(".error").classList.add("show-error")
                app.get.one(".error").innerHTML = "The browser isn't supporting this app :("
            }
        },
        online: function () {
            if (navigator.onLine) {
                console.log("you are online")
            } else {
                app.get.one(".error").classList.add("show-error")
                app.get.one(".error").innerHTML = "The browser is offline :("
            }
        }
    }

    //Run the app
    app.start.init()
}())
