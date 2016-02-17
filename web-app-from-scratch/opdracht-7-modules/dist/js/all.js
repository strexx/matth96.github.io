'use strict';

var weatherApp = weatherApp || {}; //Maakt de variable app als globaal object aan. En als er al een variabele app bestaat voegt hij de app var toe. Dit voorkomt conflicten met andere libary's.
'use strict'; //This is a EJS 5 function. If you enable it you can't use undifned varibles and your code will crash if you don't code properly.

//Start all functions
weatherApp.start = function () {
    return {
        init: function init() {
            //Start object in this object are all start functions
            weatherApp.localStorage.init();
            weatherApp.webWorker.init();
            weatherApp.routes.init();
            weatherApp.support.init();
        }
    };
}();

weatherApp.data = function () {
    var _apiKey = '7aa0e92a8b7be8ed7e420e33de310e0e',
        _brokenWeatherUrl = ['http://api.openweathermap.org/data/2.5/weather?q=', '&units=metric&appid='],
        _brokenSearchUrl = ['http://api.openweathermap.org/data/2.5/find?q=', '&type=like&mode=json&appid=', '&units=metric&appid='];

    function WeatherUrl(city) {
        var fullUrl = _brokenWeatherUrl[0] + city + _brokenWeatherUrl[1] + _apiKey;

        return fullUrl;
    };

    function SearchUrl(search) {
        //create a api url for the search.
        var fullUrl = _brokenSearchUrl[0] + search + _brokenSearchUrl[1] + _apiKey;

        return fullUrl;
    };

    return {
        WeatherUrl: WeatherUrl,
        SearchUrl: SearchUrl
    };
}();

weatherApp.localStorage = function () {
    var templates = ['home', 'citys', 'city', 'search', 'searchresults'],
        _getSavedCitys = get('savedCitys');

    function init() {
        //check if savedCitys exists if not create a [];
        templates.forEach(function (currentValue, index) {
            var getCurrent = localStorage.getItem(currentValue);

            if (getCurrent === null || getCurrent === undefined) {
                localStorage.setItem(currentValue, '[]');
            }
        });
        if (_getSavedCitys === null || _getSavedCitys === undefined) {
            localStorage.setItem('savedCitys', '[]');
        }
    };

    function get(key) {
        //get the data from the savedCitys array
        var savedCitys = localStorage.getItem(key);
        return JSON.parse(savedCitys);
    };

    function add(key, data) {
        var savedCitys = get(key),
            contains = _.contains(savedCitys, data);

        if (contains === false) {
            //ceck if the city is already in the array if not add the city to the array
            savedCitys.push(data);
            var stringifiedData = JSON.stringify(savedCitys);

            localStorage.setItem('savedCitys', stringifiedData);
        } else {
            weatherApp.ux.showErr('You already add this one.');
        }
    }

    function remove(delCity, citysTemplate) {
        var index = _getSavedCitys.indexOf(delCity);

        if (index !== -1) {
            _getSavedCitys.splice(index, 1);
            var newCityArray = JSON.stringify(_getSavedCitys);

            localStorage.setItem('savedCitys', newCityArray);
            document.location.reload(true);
        } else {
            weatherApp.ux.showErr("Sorry, your city isn't deleted. Try again.");
        }
    }
    return {
        init: init,
        templates: templates,
        get: get,
        add: add,
        remove: remove
    };
}();

weatherApp.webWorker = function () {
    //define web worker
    function init() {
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

        _start(templateWorker);
    }

    function _ceckTemplates() {
        var emtyTemplates = [];
        //get al names of templates and check them.
        weatherApp.localStorage.templates.forEach(function (currentValue, index) {
            var lenghtOfLocalstorage = JSON.parse(localStorage.getItem(currentValue)).length;

            if (lenghtOfLocalstorage <= 0) {
                emtyTemplates.push(currentValue);
            }
        });
        return emtyTemplates;
    }

    function _start(templateWorker) {
        //send message to worker with templates
        templateWorker.postMessage({
            'cmd': 'start',
            'msg': 'hoi',
            'templates': _ceckTemplates()
        });
    }
    return {
        init: init
    };
}();

//To easily select something from the DOM
weatherApp.get = function () {
    function one(selector) {
        //This is a method
        return document.querySelector(selector);
    };

    function all(selector) {
        return document.querySelectorAll(selector);
    };

    function data(url) {
        // return a Promise object
        return new Promise(function (resolve, reject) {
            var request = new XMLHttpRequest();
            //open an get request
            request.open('GET', url);
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
                } else {
                    // reject the promise if there is a err
                    reject(new Error('request failed!'));
                    weatherApp.ux.showErr('There went something wrong');
                }
            };
            //send the request
            request.send();
        });
    }
    return {
        one: one,
        all: all,
        data: data
    };
}();

//define all pages in the weatherApp.
weatherApp.page = function () {
    var _homeTemplate = weatherApp.localStorage.get('home'),
        _searchresultsTemplate = weatherApp.localStorage.get('searchresults'),
        _searchTemplate = weatherApp.localStorage.get('search'),
        _citysTemplate = weatherApp.localStorage.get('citys'),
        _cityTemplate = weatherApp.localStorage.get('city');

    function home() {
        //render the home template
        weatherApp.render.template('#target', _homeTemplate);
    };

    function search() {
        //define all vars for the search funtion
        var searchFuntion = function searchFuntion() {
            var searchField = weatherApp.get.one('#search');
            //if the input of the searchfield changes run this function
            searchField.addEventListener('input', function () {
                var url = weatherApp.data.SearchUrl(searchField.value);

                //get data from api with the input of the input field
                weatherApp.get.data(url).then(function (response) {
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
                    weatherApp.render.template('#searchresults', _searchresultsTemplate, response);
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

        //render the search  template
        weatherApp.render.template('#target', _searchTemplate);
        searchFuntion();
    };

    function citys() {
        // a emty array with the
        var savedCitysData = [],
            savedCitys = weatherApp.localStorage.get('savedCitys');

        if (savedCitys.length <= 0) {
            window.location = '#/search';
            weatherApp.ux.showErr('Sorry, there\' nothing here, please add a city.');
        } else {
            savedCitys.forEach(function (element) {
                var url = weatherApp.data.WeatherUrl(element),
                    deleteCity = function deleteCity() {
                    var citys = weatherApp.get.one('.citys');
                    citys.addEventListener('click', function (e) {
                        var delCity = e.target.id.toLowerCase();

                        weatherApp.localStorage.remove(delCity, _citysTemplate);
                    });
                };
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
                        weatherApp.render.template('#target', _citysTemplate, savedCitysData);
                        weatherApp.ux.init();
                        deleteCity();
                    }
                }).catch(function (e) {
                    console.error(e);
                    weatherApp.ux.showErr('There was a error :(');
                });
            });
        }
    };

    function city(cityParam) {
        var url = weatherApp.data.WeatherUrl(cityParam);
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
            weatherApp.render.template('#target', _cityTemplate, cityData);
        }).catch(function (e) {
            console.error(e);
            weatherApp.ux.showErr('There was a error :(');
        });
    };
    return {
        home: home,
        search: search,
        citys: citys,
        city: city
    };
}();

weatherApp.render = function () {
    //funtion to render a template.
    function template(target, template, data) {
        //check if template is in localstorage if not reload the page
        if (template === null || template === [] || template.length === 0) {
            setTimeout(function () {
                document.location.reload(true);
            }, 200);
        } else {
            weatherApp.get.one(target).innerHTML = Mustache.render(template, {
                data: data
            });
        }
    };

    function progresbar(show, startVal, EndVal) {
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
    };

    function loading(show) {
        if (show) {
            weatherApp.get.one('.loading').classList.remove('disabled');
        } else {
            //show loading
            setTimeout(function () {
                weatherApp.get.one('.loading').classList.add('disabled');
            }, 300);
        }
    };
    return {
        template: template,
        loading: loading
    };
}();

weatherApp.ux = function () {
    var _errorLocation = weatherApp.get.one('.error');

    function init() {
        var citys = weatherApp.get.one('.citys'),
            hammer = new Hammer(citys);

        _swipeLeft(hammer);
        _swipeRight(hammer);
    };

    function _swipeLeft(hammer) {
        hammer.on('swipeleft', function (ev) {
            var deleteButton = weatherApp.get.one('.' + ev.target.id);

            deleteButton.style.width = '100px';
        });
    };

    function _swipeRight(hammer) {
        hammer.on('swiperight', function (ev) {
            var deleteButton = weatherApp.get.one('.' + ev.target.id);

            deleteButton.style.width = '0px';
        });
    };

    function showErr(errMessage) {
        //show a error on top of the app.
        _errorLocation.classList.add('show-error');
        _errorLocation.innerHTML = errMessage;

        setTimeout(function () {
            _errorLocation.classList.remove('show-error');
            _errorLocation.innerHTML = '';
        }, 4000);
    }
    return {
        init: init,
        showErr: showErr
    };
}();

//difine all routers in app
weatherApp.routes = function () {
    var _routes = {
        '/home': weatherApp.page.home,
        '/search': weatherApp.page.search,
        '/citys': weatherApp.page.citys,
        '/city/:city': weatherApp.page.city
    };

    function _createRoutes() {
        var router = Router(_routes);
        router.init();
    }

    function _ceckRoute() {
        //if the hash is undefined or a '' redirect to #/home
        if (location.hash === undefined || location.hash === '') {
            window.location = '#/home';
        }
    }

    function init() {
        _createRoutes();
        _ceckRoute();
        weatherApp.render.loading(false);
    }
    return {
        init: init
    };
}();

//Check if all functions are supported, if not, show an error message at top of the weatherApp.
weatherApp.support = function () {
    function init() {
        _onhashchange();
        _online();
    };

    function _onhashchange() {
        //Check if onhashchange is in the window object if not show a error
        if ('onhashchange' in window) {
            console.log('onhashchange is supported');
        } else {
            weatherApp.ux.showErr('The browser isn\'t supporting this app :(');
        }
    };
    function _online() {
        //check if the app is online
        if (navigator.onLine) {
            return true;
        } else {
            weatherApp.ux.showErr('Your are offline :(');
            return false;
        }
    };
    return {
        init: init
    };
}();

weatherApp.start.init();