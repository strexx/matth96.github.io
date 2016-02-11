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
            app.localStorage.init();
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
        },
        data: function (url) {

            // return a Promise object
            return new Promise((resolve, reject) => {
                var request = new XMLHttpRequest();

                request.open('GET', url);
                request.onload = function () {
                    //ony if request is done
                    if (request.status == 200) {

                        // send resolve
                        resolve(request.responseText);
                    } else {
                        // reject the promise
                        reject(new Error('request failed!'));
                    }
                };
                request.send();
            });
        },
    };

    app.render = {
        template: function (target, template, data) {
            app.get.one(target).innerHTML = Mustache.render(template, {
                data: data
            });
        }
    };

    app.localStorage = {
        init: function () {
            if (localStorage.getItem('savedCitys') === null || localStorage.getItem('savedCitys') === undefined) {
                localStorage.setItem('savedCitys', "[]");
            }
        },
        get: function () {
            var savedCitys = localStorage.getItem('savedCitys');
            return JSON.parse(savedCitys)
        },
        add: function (data) {
            var savedCitys = this.get(),
                contains = _.contains(savedCitys, data);

            if (contains === false) {
                savedCitys.push(data);
                var stringifiedData = JSON.stringify(savedCitys);
                localStorage.setItem('savedCitys', stringifiedData);
            } else {
                console.log("bestaat al")
            }
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
            if (location.hash === undefined || location.hash === "") {
                window.location = "#/home"
            }
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

    //define all pages in the app.
    app.page = {
        init: function () {
            location.replace('#/home');
        },
        home: function () {
            app.get.data('./temp/home.mst').then(response => {
                app.get.one('#target').innerHTML = Mustache.render(response);
            }).catch(e => {
                console.error(e);
            });

        },
        search: function () {
            var searchResultsTemplate = "",
                searchField = "",
                searchFuntion = function (searchField) {
                    searchField.addEventListener('input', function () {
                        app.get.data(app.data.SearchUrl(searchField.value))
                            .then(response => {
                                var data = JSON.parse(response).list

                                if (app.get.one(".in-nl").checked === true) {
                                    var rawData = _.filter(data, function (searchData, predicate) {
                                        return searchData.sys.country === "NL";
                                    });
                                } else {
                                    var rawData = _.filter(data, function (searchData) {
                                        return searchData;
                                    });
                                }
                                app.render.template("#searchresults", searchResultsTemplate, rawData);
                                app.get.one(".searchlist").addEventListener("click", function (e) {
                                    if (e.target && e.target.nodeName == "LI") {
                                        app.localStorage.add(e.target.innerHTML)
                                        window.location = "#/citys"
                                    }
                                });
                            });
                    });
                };

            Promise.all([app.get.data('./temp/search.mst'), app.get.data('./temp/searchresults.mst')])
                .then(response => {
                    searchResultsTemplate = response[1]
                    app.render.template("#target", response[0]);
                })
                .then(response => {
                    var searchField = app.get.one('#search');
                    searchFuntion(searchField);
                })
                .catch(err => {
                    console.log(err);
                })
        },
        citys: function () {
            var savedCitysData = [],
                savedCitys = app.localStorage.get()

            app.get.data('./temp/citys.mst').then(response => {
                var data = response;
                return data;
            }).then(response => {
                savedCitys.forEach(function (element, index, array) {
                    app.get.data(app.data.WeatherUrl(savedCitys[index])).then(response => {
                        var data = JSON.parse(response);
                        savedCitysData.push({
                            cityName: data.name,
                            cityNameUrl: data.name.replace(/ /g, '-'),
                            description: data.weather[0].description,
                            temp: data.main.temp,
                        });
                        if (savedCitysData.length === savedCitys.length) {
                            app.get.data('./temp/citys.mst').then(response => {
                                app.render.template("#target", response, savedCitysData)
                            }).catch(e => {
                                // catching all failures!
                                console.error(e);
                            });
                        }
                    }).catch(e => {
                        console.error(e);
                    });
                });
            }).catch(e => {
                console.error(e);
            });
        },
        city: function (cityParam) {
            app.get.data(app.data.WeatherUrl(cityParam))
                .then(response => {
                    var data = JSON.parse(response);
                    return data;
                }).then(response => {
                    var cityData = response;
                    app.get.data('./temp/city.mst')
                        .then(response => {
                            app.render.template("#target", response, {
                                cityName: cityData.name,
                                description: cityData.weather[0].description,
                                minTemp: cityData.main.temp_min,
                                maxTemp: cityData.main.temp_max,
                                temp: cityData.main.temp,
                                clouds: cityData.clouds.all,
                                wind: cityData.wind.speed
                            });
                        }).catch(e => {
                            console.error(e);
                        });
                }).then(response => {

                }).catch(e => {
                    console.error(e);
                });
        }
    };

    //Check if all functions are supported, if not, show an error message at top of the app.
    app.support = {
        init: function () {
            this.onhashchange();
            this.online();
        },
        onhashchange: function () {
            //Check if onhashchange is in the window object if not show a error
            if ("onhashchange" in window) {
                console.log("onhashchange is supported");
            } else {
                app.get.one(".error").classList.add("show-error");
                app.get.one(".error").innerHTML = "The browser isn't supporting this app :(";
            }
        },
        online: function () {
            if (navigator.onLine) {
                return true;
            } else {
                app.get.one(".error").classList.add("show-error");
                app.get.one(".error").innerHTML = "The browser is offline :(";
                return false;
            }
        }
    }

    //Run the app
    app.start.init()
}())
