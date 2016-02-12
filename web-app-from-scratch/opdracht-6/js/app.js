//Maakt de variable app als globaal object aan. En als er al een variabele app bestaat voegt hij de app var toe. Dit voorkomt conflicten met andere libary's.
var app = app || {};

// use IIFE to avoid global vars
(function () {
    "use strict"; //This is a EJS 5 function. If you enable it you can't use undifned varibles and your code will crash if you don't code properly.

    //Start all functions
    app.start = { //Literal opbject
        init: function () { //Start object in this object are all start functions
            app.support.init();
            app.routes.init();
            app.localStorage.init();
            app.webWorker.init();
        }
    };

    //    To easily select something from the DOM
    app.get = {
        one: function (selector) { //This is a method
            return document.querySelector(selector);
        },
        all: function (selector) {
            return document.querySelectorAll(selector);
        },
        data: function (url) {
            // return a Promise object
            return new Promise((resolve, reject) => {
                var request = new XMLHttpRequest();
                //open an get request
                request.open('GET', url);
                //if the request is done
                request.onload = function () {
                    //ony if request is done
                    if (request.status == 200) {

                        // send text form request
                        resolve(request.responseText);
                    } else {
                        // reject the promise if there is a err
                        reject(new Error('request failed!'));
                    }
                };
                //send the request
                request.send();
            });
        }
    };

    app.webWorker = { //define web worker
        init: function () {

            var templateWorker = new Worker('js/templateWorker.js');

            templateWorker.addEventListener('message', function (e) {
                //                console.log(e.data);
                if (e.data.name === "savedCitys" || e.data.name === undefined) {
                    console.log("not in savedCitys");
                } else {
                    localStorage.setItem(e.data.name, e.data.template);
                }
            }, false);

            this.start(templateWorker);
        },
        stop: function (templateWorker) {
            templateWorker.postMessage({
                'cmd': 'stop',
                'msg': 'all'
            });
        },
        start: function (templateWorker) {
            var emtyTemplates = [];

            app.localStorage.templates.forEach(function (currentValue, index) {
                var lenghtOfLocalstorage = JSON.parse(localStorage.getItem(currentValue)).length

                if (lenghtOfLocalstorage <= 0) {
                    emtyTemplates.push(currentValue)
                }
            });

            templateWorker.postMessage({
                'cmd': 'start',
                'msg': 'hoi',
                'templates': emtyTemplates
            });
        }
    };

    app.render = { //funtion to render a template.
        template: function (target, template, data) {
            app.get.one(target).innerHTML = Mustache.render(template, {
                data: data
            });
        }
    };

    app.localStorage = {
        init: function () { //check if savedCitys exists if not create a [];
            this.templates.forEach(function (currentValue, index) {
                if (localStorage.getItem(currentValue) === null || localStorage.getItem(currentValue) === undefined) {
                    localStorage.setItem(currentValue, "[]");
                }
            });
            if (localStorage.getItem("savedCitys") === null || localStorage.getItem("savedCitys") === undefined) {
                localStorage.setItem("savedCitys", "[]");
            }
        },
        templates: ["home", "citys", "city", "search", "searchresults"],
        get: function (key) { //get the data from the savedCitys array
            var savedCitys = localStorage.getItem(key);
            return JSON.parse(savedCitys);
        },
        add: function (key, data) { //add a new city to the array
            var savedCitys = this.get(key),
                contains = _.contains(savedCitys, data);

            if (contains === false) { //ceck if the city is already in the array if not add the city to the array
                savedCitys.push(data);
                var stringifiedData = JSON.stringify(savedCitys);
                localStorage.setItem('savedCitys', stringifiedData);
            } else {
                app.support.showErr("Deze heb je al toegevoegd");
            }
        }
    };

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
            //if the hash is undefined or a "" redirect to #/home
            if (location.hash === undefined || location.hash === "") {
                window.location = "#/home";
            }
        }
    };

    app.data = {
        apiKey: "7aa0e92a8b7be8ed7e420e33de310e0e",
        brokenWeatherUrl: ["http://api.openweathermap.org/data/2.5/weather?q=",
                    "&units=metric&appid="],
        brokenSearchUrl: ["http://api.openweathermap.org/data/2.5/find?q=", "&type=like&mode=json&appid=", "&units=metric&appid="],
        WeatherUrl: function (city) { //create api url for the wheather of a city
            var fullUrl = this.brokenWeatherUrl[0] + city + this.brokenWeatherUrl[1] + this.apiKey;

            return fullUrl;
        },
        SearchUrl: function (search) { //create a api url for the search.
            var fullUrl = this.brokenSearchUrl[0] + search + this.brokenSearchUrl[1] + this.apiKey;

            return fullUrl;
        }
    };

    //define all pages in the app.
    app.page = {
        init: function () {
            window.location = "#/home";
        },
        home: function () { //render the home template
            app.render.template("#target", app.localStorage.get("home"));
        },
        search: function () {
            //define all vars for the search funtion
            var searchFuntion = function (searchField) {
                //if the input of the searchfield changes run this function
                searchField.addEventListener('input', function () {
                    //get data from api with the input of the input field
                    app.get.data(app.data.SearchUrl(searchField.value))
                        .then(response => {
                            var data = JSON.parse(response).list;
                            var newdata = _.map(data, function (data) {
                                    data.attachedName = data.name.replace(/ /g, "-").toLowerCase();
                                    return data
                                })
                                //if the checkbox is checked filer the results
                            if (app.get.one(".in-nl").checked === true) {
                                var rawData = _.filter(newdata, function (searchData, predicate) {
                                    return searchData.sys.country === "NL";
                                });
                            } else {
                                //if the checkbox is not checked the data is not filterd.
                                var rawData = newdata;
                            }
                            app.render.template("#searchresults", app.localStorage.get("searchresults"), rawData);
                            app.get.one(".searchlist").addEventListener("click", function (e) {
                                if (e.target && e.target.nodeName == "LI") {
                                    //add the clicked city to local storage.
                                    app.localStorage.add("savedCitys", e.target.id);
                                    // go to #/citys
                                    window.location = "#/citys";
                                }
                            });
                        }).catch(e => {
                            console.error(e);
                        });
                });
            };
            //get the search and the searchresults templates
            app.render.template("#target", app.localStorage.get("search"));
            var searchField = app.get.one('#search');
            searchFuntion(searchField);

        },
        citys: function () {
            // a emty array with the
            var savedCitysData = [],
                savedCitys = app.localStorage.get("savedCitys");

            if (savedCitys.length <= 0) {
                window.location = "#/search";
                app.support.showErr("Er staat hier niks in, voeg een nieuwe stad toe");
            } else {
                app.render.template("#target", app.localStorage.get("citys"));
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
                            app.render.template("#target", app.localStorage.get("citys"), savedCitysData);
                        }
                    }).catch(e => {
                        console.error(e);
                    });
                });

            }
        },
        city: function (cityParam) {
            //get the weather data
            app.get.data(app.data.WeatherUrl(cityParam))
                .then(response => {
                    //parse data
                    var data = JSON.parse(response);
                    return data;
                }).then(response => {
                    var cityData = response;
                    //load template
                    app.get.data('./temp/city.mst')
                        .then(response => {
                            //render template with data form api
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
            //check if the app is online
            if (navigator.onLine) {
                return true;
            } else {
                app.get.one(".error").classList.add("show-error");
                app.get.one(".error").innerHTML = "The browser is offline :(";
                return false;
            }
        },
        showErr: function (errMessage) {
            app.get.one(".error").classList.add("show-error");
            app.get.one(".error").innerHTML = errMessage;

            setTimeout(function () {
                app.get.one(".error").classList.remove("show-error");
                app.get.one(".error").innerHTML = "";
            }, 3000);
        }
    };

    //Run the app
    app.start.init();
}());
