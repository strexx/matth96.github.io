//Check if all functions are supported, if not, show an error message at top of the weatherApp.
weatherApp.support = (function () {
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

})();
