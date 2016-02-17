//Start all functions
weatherApp.start = (function () {
    return {
        init: function () { //Start object in this object are all start functions
            weatherApp.localStorage.init();
            weatherApp.webWorker.init();
            weatherApp.routes.init();
            weatherApp.support.init();
        }
    };
})();
