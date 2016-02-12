//Maakt de variable app als globaal object aan. En als er al een variabele app bestaat voegt hij de app var toe. Dit voorkomt conflicten met andere libary's.
var weatherApp = weatherApp || {};

// use IIFE to avoid global vars
(function () {
    'use strict'; //This is a EJS 5 function. If you enable it you can't use undifned varibles and your code will crash if you don't code properly.

    //Start all functions
    weatherApp.start = { //Literal opbject
        init: function () { //Start object in this object are all start functions
            weatherApp.support.init();
            weatherApp.routes.init();
            weatherApp.localStorage.init();
            weatherApp.webWorker.init();
        }
    };

    //To easily select something from the DOM
    weatherApp.get = {
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
                         weatherApp.support.showErr('There went something wrong');
                    }
                };
                //send the request
                request.send();
            });
        }
    };

    weatherApp.webWorker = { //define web worker
        init: function () {
            var templateWorker = new Worker('js/templateWorker.js');

            templateWorker.addEventListener('message', function (e) {
                if (e.data.name === 'savedCitys' || e.data.name === undefined) {
                    console.log('not in savedCitys');
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

            weatherApp.localStorage.templates.forEach(function (currentValue, index) {
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

    weatherApp.render = { //funtion to render a template.
        template: function (target, template, data) {
            weatherApp.get.one(target).innerHTML = Mustache.render(template, {
                data: data
            });
        }
    };

    weatherApp.localStorage = {
        init: function () { //check if savedCitys exists if not create a [];
            this.templates.forEach(function (currentValue, index) {
                if (localStorage.getItem(currentValue) === null || localStorage.getItem(currentValue) === undefined) {
                    localStorage.setItem(currentValue, '[]');
                }
            });
            if (localStorage.getItem('savedCitys') === null || localStorage.getItem('savedCitys') === undefined) {
                localStorage.setItem('savedCitys', '[]');
            }
        },
        templates: ['home', 'citys', 'city', 'search', 'searchresults'],
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
                weatherApp.support.showErr('You already add this one.');
            }
        }
    };

    //difine all routers in app
    weatherApp.routes = {
        init: function () {
            var routes = {
                    '/home': weatherApp.page.home,
                    '/search': weatherApp.page.search,
                    '/citys': weatherApp.page.citys,
                    '/city/:city': weatherApp.page.city
                },
                router = Router(routes);
            router.init();
            //if the hash is undefined or a '' redirect to #/home
            if (location.hash === undefined || location.hash === '') {
                window.location = '#/home';
            }
        }
    };

    weatherApp.data = {
        apiKey: '7aa0e92a8b7be8ed7e420e33de310e0e',
        brokenWeatherUrl: ['http://api.openweathermap.org/data/2.5/weather?q=',
                    '&units=metric&appid='],
        brokenSearchUrl: ['http://api.openweathermap.org/data/2.5/find?q=', '&type=like&mode=json&appid=', '&units=metric&appid='],
        WeatherUrl: function (city) { //create api url for the wheather of a city
            var fullUrl = this.brokenWeatherUrl[0] + city + this.brokenWeatherUrl[1] + this.apiKey;

            return fullUrl;
        },
        SearchUrl: function (search) { //create a api url for the search.
            var fullUrl = this.brokenSearchUrl[0] + search + this.brokenSearchUrl[1] + this.apiKey;

            return fullUrl;
        }
    };

    //define all pages in the weatherApp.
    weatherApp.page = {
        home: function () { //render the home template
            if (weatherApp.localStorage.get('home') === null) {
                setTimeout(function () {
                    var homeTemplate = weatherApp.localStorage.get('home')
                    weatherApp.render.template('#target', homeTemplate);
                }, 300);
            } else {
                var homeTemplate = weatherApp.localStorage.get('home')
                weatherApp.render.template('#target', homeTemplate);
            }
        },
        search: function () {
            //define all vars for the search funtion
            var searchresultsTemplate = weatherApp.localStorage.get('searchresults'),
                searchTemplate = weatherApp.localStorage.get('search'),
                searchFuntion = function () {
                    var searchField = weatherApp.get.one('#search');
                    //if the input of the searchfield changes run this function
                    searchField.addEventListener('input', function () {
                        //get data from api with the input of the input field
                        weatherApp.get.data(weatherApp.data.SearchUrl(searchField.value))
                            .then(response => {
                                var data = JSON.parse(response).list,
                                    newdata = _.map(data, function (data) {
                                        data.attachedName = data.name.replace(/ /g, '-').toLowerCase();
                                        return data
                                    })

                                //if the checkbox is checked filer the results
                                if (weatherApp.get.one('.in-nl').checked === true) {
                                    var rawData = _.filter(newdata, function (searchData, predicate) {
                                        return searchData.sys.country === 'NL';
                                    });
                                    return rawData;
                                } else {
                                    //if the checkbox is not checked the data is not filterd.
                                    var rawData = newdata;
                                    return rawData;
                                }
                            }).then(response => {
                                weatherApp.render.template('#searchresults', searchresultsTemplate, response);
                                weatherApp.get.one('.searchlist').addEventListener('click', function (e) {
                                    if (e.target && e.target.nodeName == 'LI') {
                                        //add the clicked city to local storage.
                                        weatherApp.localStorage.add('savedCitys', e.target.id);
                                        // go to #/citys
                                        window.location = '#/citys';
                                    }
                                });
                            }).catch(e => {
                                console.error(e);
                            });
                    });
                };

            //get the search and the searchresults templates
            weatherApp.render.template('#target', searchTemplate);
            searchFuntion();
        },
        citys: function () {
            // a emty array with the
            var savedCitysData = [],
                citysTemplate = weatherApp.localStorage.get('citys'),
                savedCitys = weatherApp.localStorage.get('savedCitys');

            if (savedCitys.length <= 0) {
                window.location = '#/search';
                weatherApp.support.showErr('There\' nothing here, please add a city.');
            } else {
                weatherApp.render.template('#target', citysTemplate);
                savedCitys.forEach(function (element) {
                    var url = weatherApp.data.WeatherUrl(element);
                    weatherApp.get.data(url)
                        .then(response => {
                            var data = JSON.parse(response);
                            return data
                        }).then(response => {
                            savedCitysData.push({
                                cityName: response.name,
                                cityNameUrl: response.name.replace(/ /g, '-'),
                                description: response.weather[0].description,
                                temp: response.main.temp,
                            });
                            if (savedCitysData.length === savedCitys.length) {
                                weatherApp.render.template('#target', citysTemplate, savedCitysData);
                            }
                        }).catch(e => {
                            console.error(e);
                        });
                });
            }
        },
        city: function (cityParam) {
            var cityTemplate = weatherApp.localStorage.get('city'),
                url = weatherApp.data.WeatherUrl(cityParam)
            //get the weather data
            weatherApp.get.data(url)
                .then(response => {
                    //parse data
                    var data = JSON.parse(response);
                    return data;
                }).then(response => {
                    var cityData = {
                        cityName: response.name,
                        description: response.weather[0].description,
                        minTemp: response.main.temp_min,
                        maxTemp: response.main.temp_max,
                        temp: response.main.temp,
                        clouds: response.clouds.all,
                        wind: response.wind.speed
                    };
                    //render template with data form api
                    weatherApp.render.template('#target', cityTemplate, cityData);
                }).catch(e => {
                    console.error(e);
                    weatherApp.support.showErr('There was a error :(');
                });
        }
    };

    //Check if all functions are supported, if not, show an error message at top of the weatherApp.
    weatherApp.support = {
        init: function () {
            this.onhashchange();
            this.online();
        },
        onhashchange: function () {
            //Check if onhashchange is in the window object if not show a error
            if ('onhashchange' in window) {
                console.log('onhashchange is supported');
            } else {
                this.showErr('The browser isn\'t supporting this app :(');
            }
        },
        online: function () {
            //check if the app is online
            if (navigator.onLine) {
                return true;
            } else {
                this.showErr('The browser is offline :(');
                return false;
            }
        },
        showErr: function (errMessage) {
            weatherApp.get.one('.error').classList.add('show-error');
            weatherApp.get.one('.error').innerHTML = errMessage;

            setTimeout(function () {
                weatherApp.get.one('.error').classList.remove('show-error');
                weatherApp.get.one('.error').innerHTML = '';
            }, 4000);
        }
    };

    //Run the app
    weatherApp.start.init();
}());
