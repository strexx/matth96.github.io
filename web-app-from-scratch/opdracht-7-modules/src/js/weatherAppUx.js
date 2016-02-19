weatherApp.ux = (function () {
    var _errorLocation = weatherApp.get.one('.error');

    function init() {
        var citys = weatherApp.get.one('.citys'),
            hammer = new Hammer(citys);
        console.log(citys);
        _swipeLeft(hammer);
        _swipeRight(hammer);
    };

    function _swipeLeft(hammer) {
        hammer.on('swipeleft', function (ev) {
            var deleteButton = weatherApp.get.one('.' + ev.target.id);

            deleteButton.style.width = '100px'
        });
    };

    function _swipeRight(hammer) {
        hammer.on('swiperight', function (ev) {
            var deleteButton = weatherApp.get.one('.' + ev.target.id);

            deleteButton.style.width = '0px'
        });
    };

    function showErr(errMessage) { //show a error on top of the app.
        _errorLocation.classList.add('show-error');
        _errorLocation.innerHTML = errMessage;

        setTimeout(function () {
            _errorLocation.classList.remove('show-error');
            _errorLocation.innerHTML = '';
        }, 4000);
    };

    return {
        init: init,
        showErr: showErr
    };

})();
