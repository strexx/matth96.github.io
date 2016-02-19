weatherApp.data = (function () {
    var _apiKey = '3e8927060c51838202729e850a47d737',
        _brokenWeatherUrl = ['http://api.openweathermap.org/data/2.5/weather?q=', '&units=metric&appid='],
        _brokenSearchUrl = ['http://api.openweathermap.org/data/2.5/find?q=', '&type=like&mode=json&appid=', '&units=metric&appid='],
        _brokenGeolocationUrl = ['http://api.openweathermap.org/data/2.5/weather?lat=', '&lon=', '&units=metric&appid='];

    function WeatherUrl(city) {
        var fullUrl = _brokenWeatherUrl[0] + city + _brokenWeatherUrl[1] + _apiKey;

        return fullUrl;
    };

    function SearchUrl(search) { //create a api url for the search.
        var fullUrl = _brokenSearchUrl[0] + search + _brokenSearchUrl[1] + _apiKey;

        return fullUrl;
    };

    function geolocationURL(lat, lon) { //create a api url for the search.
        var fullUrl = _brokenGeolocationUrl[0] + lat + _brokenGeolocationUrl[1] + lon + _brokenGeolocationUrl[2] +  _apiKey;

        return fullUrl;
    };

    return {
        WeatherUrl: WeatherUrl,
        SearchUrl: SearchUrl,
        geolocationURL: geolocationURL
    };

})();

weatherApp.localStorage = (function () {
    var templates = ['home', 'citys', 'city', 'search', 'searchresults'];
    var _getSavedCitys = get('savedCitys');

    function init() {
        //check if savedCitys exists if not create a [];
        templates.forEach(function (currentValue, index) {
            var getCurrent = localStorage.getItem(currentValue);
            // if the value is Undefined  set a [] in the local storage
            if (getCurrent === null || getCurrent === undefined) {
                localStorage.setItem(currentValue, '[]');
            }
        });
        if (_getSavedCitys === null || _getSavedCitys === undefined) {
            localStorage.setItem('savedCitys', '[]');
        }
    };

    function get(key) { //get the data from the savedCitys array
        var savedCitys = localStorage.getItem(key);
        return JSON.parse(savedCitys);
    };

    function add(key, data) {
        var savedCitys = get(key),
            contains = _.contains(savedCitys, data);

        if (contains === false) { //ceck if the city is already in the array if not add the city to the array
            savedCitys.push(data);
            var stringifiedData = JSON.stringify(savedCitys);

            localStorage.setItem('savedCitys', stringifiedData);
        } else {
            weatherApp.ux.showErr('You already add this one.');
        }
    };

    var _citysTemplate = get('citys');

    function _setSavedCitys(newData, savedCitysData, delCity) {
            //set the saved city array
        localStorage.setItem('savedCitys', newData);

        //delete the deleteded array
        var rawData = _.filter(savedCitysData, function (newdata) {
            return newdata.cityNameUrl.toLowerCase() != delCity;
        });
        if (rawData.length === 0) {
            //refresh the page
            document.location.reload(true);
        } else {
            weatherApp.render.template('#target', _citysTemplate, rawData);
        }
    }

    function remove(savedCitysData, delCity) {
        var getSavedCitys = get('savedCitys'),
            index = getSavedCitys.indexOf(delCity);

        //if the array is 1 run _setSavedCitys
        if (getSavedCitys.length === 1) {
            _setSavedCitys('[]', savedCitysData, delCity)
        } else {
            //if more than 1 check if the index is not -1
            if (index !== -1) {
                //splice the data on the index
                getSavedCitys.splice(index, 1);
                var newCityArray = JSON.stringify(getSavedCitys);
                //run _setSavedCitys with the data
                _setSavedCitys(newCityArray, savedCitysData, delCity);

            } else {
                //show a err
                weatherApp.ux.showErr('Sorry, your city isn\'t deleted. Try again.');
            }
        }
    };

    return {
        init: init,
        templates: templates,
        get: get,
        add: add,
        remove: remove
    }
})();


weatherApp.webWorker = (function () { //define web worker
    function init() {
        //create web worker.
        var templateWorker = new Worker('./dist/js/templateWorker.js');

        //lissen to the responses of the webworker.
        templateWorker.addEventListener('message', function (e) {
            if (e.data.name === 'savedCitys' || e.data.name === undefined) {
                console.log('Not in savedCitys');
            } else {
                //set the template in the local storatge
                localStorage.setItem(e.data.name, e.data.template);
            }
        }, false);
        //start the webworker
        _start(templateWorker);
    };

    function _ceckTemplates() {
        var emtyTemplates = [];
        //get al names of templates and check them.
        weatherApp.localStorage.templates.forEach(function (currentValue, index) {
            var lenghtOfLocalstorage = JSON.parse(localStorage.getItem(currentValue)).length

            if (lenghtOfLocalstorage <= 0) {
                emtyTemplates.push(currentValue)
            }
        });
        return emtyTemplates;
    };

    function _start(templateWorker) {
        //send message to worker with templates
        templateWorker.postMessage({
            'cmd': 'start',
            'msg': 'hoi',
            'templates': _ceckTemplates()
        });
    };
    return {
        init: init
    };
})();

//To easily select something from the DOM
weatherApp.get = (function () {
    function one(selector) { //This is a method
        return document.querySelector(selector);
    };

    function all(selector) {
        return document.querySelectorAll(selector);
    };

    function data(url) {
        // return a Promise object
        return new Promise((resolve, reject) => {
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
    };

    return { //return only the funtions that are nesseeriy
        one: one,
        all: all,
        data: data
    };
})();
