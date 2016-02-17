weatherApp.data = (function () {
    var _apiKey = '7aa0e92a8b7be8ed7e420e33de310e0e',
        _brokenWeatherUrl = ['http://api.openweathermap.org/data/2.5/weather?q=', '&units=metric&appid='],
        _brokenSearchUrl = ['http://api.openweathermap.org/data/2.5/find?q=', '&type=like&mode=json&appid=', '&units=metric&appid='];

    function WeatherUrl(city) {
        var fullUrl = _brokenWeatherUrl[0] + city + _brokenWeatherUrl[1] + _apiKey;

        return fullUrl;
    };

    function SearchUrl(search) { //create a api url for the search.
        var fullUrl = _brokenSearchUrl[0] + search + _brokenSearchUrl[1] + _apiKey;

        return fullUrl;
    };

    return {
        WeatherUrl: WeatherUrl,
        SearchUrl: SearchUrl
    };

})();

weatherApp.localStorage = (function () {
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
    }

    function remove(delCity, citysTemplate) {
        var index = _getSavedCitys.indexOf(delCity);

        if (index !== -1) {
            _getSavedCitys.splice(index, 1);
            var newCityArray = JSON.stringify(_getSavedCitys);

            localStorage.setItem('savedCitys', newCityArray);
            document.location.reload(true);
        } else {
            weatherApp.ux.showErr("Sorry, your city isn't deleted. Try again.")
        }
    }
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
            var lenghtOfLocalstorage = JSON.parse(localStorage.getItem(currentValue)).length

            if (lenghtOfLocalstorage <= 0) {
                emtyTemplates.push(currentValue)
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
    }
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
    }
    return {
        one: one,
        all: all,
        data: data
    };
})();
