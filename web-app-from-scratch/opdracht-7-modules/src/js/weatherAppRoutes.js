var weatherApp = weatherApp || {};
'use strict';

//difine all routers in app
weatherApp.routes = (function () {
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

})();
