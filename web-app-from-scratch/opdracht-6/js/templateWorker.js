"use strict";

var dataFunction = {
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
    },
    get: function (url) {
        // return a  object
        return new Promise(function (resolve, reject) {
            var request = new XMLHttpRequest();
            request.open('GET', url);
            request.onload = function () {
                if (request.status == 200) {
                    resolve(request.responseText);
                } else {
                    reject(new Error('request failed!'));
                }
            };
            request.send();
        });
    }
};

self.addEventListener('message', function (e) {
    var data = e.data;
    if (data.cmd === 'start') {
        data.templates.forEach(function (curent, index) {
            dataFunction.get('/temp/' + curent + '.mst').then(response => {
                var dataRespose = JSON.stringify(response);
                return dataRespose;
            }).then(response => {
                var object = {
                    name: curent,
                    template: response,
                }
                return object
            }).then(response => {
                self.postMessage(
                    response
                );
            }).catch(e => {
                // catching all failures!
                console.error(e);
            });
        })
    }
    if (data.cmd === 'stop') {
        self.postMessage('WORKER STOPPED: ' + data.msg +
            '. (buttons will no longer work)');
        self.close(); // Terminates the worker.
    } else {
        self.postMessage('Unknown command: ' + data.msg);
    }
}, false);
