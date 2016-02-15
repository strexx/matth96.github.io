'use strict';

var dataFunction = {
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

//webworker code form http://www.html5rocks.com/en/tutorials/workers/basics/
self.addEventListener('message', function (e) {
    var data = e.data;
    if (data.cmd === 'start') {
        data.templates.forEach(function (current, index) {
            dataFunction.get('/temp/' + current + '.mst').then(response => {
                var dataRespose = JSON.stringify(response);

                return dataRespose;
            }).then(response => {
                var object = {
                    name: current,
                    template: response,
                };

                return object;
            }).then(response => {
                self.postMessage(
                    response
                );
            }).catch(e => {
                // catching all failures!
                console.error(e);
            });
        });
    }
    if (data.cmd === 'stop') {
        self.postMessage('worker stopped: ' + data.msg)
        self.close(); // Terminates the worker.
    } else {
        self.postMessage('error: ' + data.msg);
    }
}, false);