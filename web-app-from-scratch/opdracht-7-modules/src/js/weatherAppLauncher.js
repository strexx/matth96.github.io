//Start all functions
weatherApp.start = (function () {
    function init() { //Start object in this object are all start functions
        weatherApp.localStorage.init();
        weatherApp.webWorker.init();
        weatherApp.routes.init();
        weatherApp.support.init();
    }

    return { //return the init function
        init: init
    };
})();
