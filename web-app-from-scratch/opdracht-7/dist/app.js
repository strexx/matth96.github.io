'use strict';

//Maakt de variable app als globaal object aan. En als er al een variabele app bestaat voegt hij de app var toe. Dit voorkomt conflicten met andere libary's.
var weatherApp = weatherApp || {};

// use IIFE to avoid global vars
(function () {
    'use strict'; //This is a EJS 5 function. If you enable it you can't use undifned varibles and your code will crash if you don't code properly.

    //Start all functions

    weatherApp.start = { //Literal opbject
        init: function init() {
            //Start object in this object are all start functions
            weatherApp.localStorage.init();
            weatherApp.webWorker.init();
            weatherApp.routes.init();
            weatherApp.support.init();
        }
    };

    //difine all routers in app
    weatherApp.routes = {
        init: function init() {
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
            weatherApp.get.one('.loading').classList.add('disabled');
        }
    };

    //define all pages in the weatherApp.
    weatherApp.page = {
        home: function home() {
            //render the home template
            var homeTemplate = weatherApp.localStorage.get('home');
            weatherApp.render.template('#target', homeTemplate);
        },
        search: function search() {
            //define all vars for the search funtion
            var searchresultsTemplate = weatherApp.localStorage.get('searchresults'),
                searchTemplate = weatherApp.localStorage.get('search'),
                searchFuntion = function searchFuntion() {
                var searchField = weatherApp.get.one('#search');
                //if the input of the searchfield changes run this function
                searchField.addEventListener('input', function () {
                    //get data from api with the input of the input field
                    weatherApp.get.data(weatherApp.data.SearchUrl(searchField.value)).then(function (response) {
                        var data = JSON.parse(response).list,
                            newdata = _.map(data, function (data) {
                            data.attachedName = data.name.replace(/ /g, '-').toLowerCase();
                            return data;
                        });

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
                    }).then(function (response) {
                        weatherApp.render.template('#searchresults', searchresultsTemplate, response);
                        weatherApp.get.one('.searchlist').addEventListener('click', function (e) {
                            if (e.target && e.target.nodeName == 'LI') {
                                //add the clicked city to local storage.
                                weatherApp.localStorage.add('savedCitys', e.target.id);
                                // go to #/citys
                                window.location = '#/citys';
                            }
                        });
                    }).catch(function (e) {
                        console.error(e);
                    });
                });
            };

            //get the search and the searchresults templates
            weatherApp.render.template('#target', searchTemplate);
            searchFuntion();
        },
        citys: function citys() {
            // a emty array with the
            var savedCitysData = [],
                citysTemplate = weatherApp.localStorage.get('citys'),
                savedCitys = weatherApp.localStorage.get('savedCitys'),
                deleteCity = function deleteCity() {
                var citys = document.querySelector('.citys');
                citys.addEventListener('click', function (e) {
                    var delCity = e.target.id.toLowerCase();
                    weatherApp.localStorage.remove(delCity);
                });
            };

            if (savedCitys.length <= 0) {
                window.location = '#/search';
                weatherApp.support.showErr('Sorry, there\' nothing here, please add a city.');
            } else {
                savedCitys.forEach(function (element) {
                    var url = weatherApp.data.WeatherUrl(element);
                    weatherApp.get.data(url).then(function (response) {
                        var data = JSON.parse(response);
                        return data;
                    }).then(function (response) {
                        savedCitysData.push({
                            cityName: response.name,
                            cityNameUrl: response.name,
                            description: response.weather[0].description,
                            temp: response.main.temp
                        });
                        if (savedCitysData.length === savedCitys.length) {
                            weatherApp.render.template('#target', citysTemplate, savedCitysData);
                            weatherApp.ux.init();
                            deleteCity();
                        }
                    }).catch(function (e) {
                        console.error(e);
                    });
                });
            }
        },
        city: function city(cityParam) {
            var cityTemplate = weatherApp.localStorage.get('city'),
                url = weatherApp.data.WeatherUrl(cityParam);
            //get the weather data
            weatherApp.get.data(url).then(function (response) {
                //parse data
                var data = JSON.parse(response);
                return data;
            }).then(function (response) {
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
            }).catch(function (e) {
                console.error(e);
                weatherApp.support.showErr('There was a error :(');
            });
        }
    };

    weatherApp.data = {
        apiKey: '7aa0e92a8b7be8ed7e420e33de310e0e',
        brokenWeatherUrl: ['http://api.openweathermap.org/data/2.5/weather?q=', '&units=metric&appid='],
        brokenSearchUrl: ['http://api.openweathermap.org/data/2.5/find?q=', '&type=like&mode=json&appid=', '&units=metric&appid='],
        WeatherUrl: function WeatherUrl(city) {
            //create api url for the wheather of a city
            var fullUrl = this.brokenWeatherUrl[0] + city + this.brokenWeatherUrl[1] + this.apiKey;

            return fullUrl;
        },
        SearchUrl: function SearchUrl(search) {
            //create a api url for the search.
            var fullUrl = this.brokenSearchUrl[0] + search + this.brokenSearchUrl[1] + this.apiKey;

            return fullUrl;
        }
    };

    //To easily select something from the DOM
    weatherApp.get = {
        one: function one(selector) {
            //This is a method
            return document.querySelector(selector);
        },
        all: function all(selector) {
            return document.querySelectorAll(selector);
        },
        data: function data(url) {
            // return a Promise object
            return new Promise(function (resolve, reject) {
                var request = new XMLHttpRequest();
                //open an get request
                request.open('GET', url);

                //                request.addEventListener("progress", updateProgress);

                //                function updateProgress(oEvent) {
                //                    console.log(oEvent)
                //                    weatherApp.render.progresbar(true, oEvent.loaded, oEvent.total);
                //                }

                request.onloadstart = function () {
                    weatherApp.render.loading(true);
                };
                request.onloadend = function () {
                    weatherApp.render.loading(true);
                };

                //if the request is done
                request.onload = function () {
                    //ony if request is done
                    if (request.status == 200) {
                        weatherApp.render.loading(false);

                        // send text form request
                        resolve(request.responseText);
                        weatherApp.render.progresbar(false);
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

    weatherApp.render = { //funtion to render a template.
        template: function template(target, _template, data) {
            //check if template is in localstorage if not reload the page
            if (_template === null || _template === [] || _template.length === 0) {
                setTimeout(function () {
                    document.location.reload(true);
                }, 200);
            } else {
                weatherApp.get.one(target).innerHTML = Mustache.render(_template, {
                    data: data
                });
            }
        },
        progresbar: function progresbar(show, startVal, EndVal) {
            var progess = weatherApp.get.one('progress');
            if (show) {
                progess.classList.remove('disabled');
                console.log(startVal);
                progess.valueOf(startVal);
            } else {
                setTimeout(function () {
                    progess.classList.add('disabled');
                }, 300);
            }
        },
        loading: function loading(show) {
            if (show) {
                weatherApp.get.one('.loading').classList.remove('disabled');
            } else {
                //show loading
                setTimeout(function () {
                    weatherApp.get.one('.loading').classList.add('disabled');
                }, 300);
            }
        }
    };

    weatherApp.localStorage = {
        init: function init() {
            //check if savedCitys exists if not create a [];
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
        get: function get(key) {
            //get the data from the savedCitys array
            var savedCitys = localStorage.getItem(key);
            return JSON.parse(savedCitys);
        },
        add: function add(key, data) {
            //add a new city to the array
            var savedCitys = this.get(key),
                contains = _.contains(savedCitys, data);

            if (contains === false) {
                //ceck if the city is already in the array if not add the city to the array
                savedCitys.push(data);
                var stringifiedData = JSON.stringify(savedCitys);
                localStorage.setItem('savedCitys', stringifiedData);
            } else {
                weatherApp.support.showErr('You already add this one.');
            }
        },
        remove: function remove(delCity) {
            var citys = this.get('savedCitys'),
                index = citys.indexOf(delCity);
            console.log(index);
            if (index !== -1) {
                citys.splice(index, 1);
                localStorage.setItem('savedCitys', JSON.stringify(citys));
                document.location.reload(true);
            } else {
                weatherApp.support.showErr("Sorry, your city isn't deleted. Try again.");
            }
        }
    };

    weatherApp.webWorker = { //define web worker
        init: function init() {
            //create web worker.
            var templateWorker = new Worker('./dist/templateWorker.js');

            //lissen to the responses of the webworker.
            templateWorker.addEventListener('message', function (e) {
                if (e.data.name === 'savedCitys' || e.data.name === undefined) {
                    console.log('not in savedCitys');
                } else {
                    localStorage.setItem(e.data.name, e.data.template);
                }
            }, false);

            this.start(templateWorker);
        },
        stop: function stop(templateWorker) {
            templateWorker.postMessage({
                'cmd': 'stop',
                'msg': 'all'
            });
        },
        start: function start(templateWorker) {
            var emtyTemplates = [];
            //get al names of templates and check them.
            weatherApp.localStorage.templates.forEach(function (currentValue, index) {
                var lenghtOfLocalstorage = JSON.parse(localStorage.getItem(currentValue)).length;

                if (lenghtOfLocalstorage <= 0) {
                    emtyTemplates.push(currentValue);
                }
            });
            //send message to worker with templates
            templateWorker.postMessage({
                'cmd': 'start',
                'msg': 'hoi',
                'templates': emtyTemplates
            });
        }
    };

    weatherApp.ux = {
        init: function init() {
            var citys = weatherApp.get.one('.citys'),
                hammer = new Hammer(citys);

            this.swipeLeft(citys, hammer);
            this.swipeRight(citys, hammer);
        },
        swipeLeft: function swipeLeft(citys, hammer) {
            hammer.on('swipeleft', function (ev) {
                var deleteButton = weatherApp.get.one('.' + ev.target.id);

                deleteButton.style.width = '100px';
            });
        },
        swipeRight: function swipeRight(citys, hammer) {
            hammer.on('swiperight', function (ev) {
                var deleteButton = weatherApp.get.one('.' + ev.target.id);
                deleteButton.style.width = '0px';
            });
        }
    };
    //Check if all functions are supported, if not, show an error message at top of the weatherApp.
    weatherApp.support = {
        init: function init() {
            this.onhashchange();
            this.online();
        },
        onhashchange: function onhashchange() {
            //Check if onhashchange is in the window object if not show a error
            if ('onhashchange' in window) {
                console.log('onhashchange is supported');
            } else {
                this.showErr('The browser isn\'t supporting this app :(');
            }
        },
        online: function online() {
            //check if the app is online
            if (navigator.onLine) {
                return true;
            } else {
                this.showErr('Your are offline :(');
                return false;
            }
        },
        showErr: function showErr(errMessage) {
            //show a error on top of the app.
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
})();