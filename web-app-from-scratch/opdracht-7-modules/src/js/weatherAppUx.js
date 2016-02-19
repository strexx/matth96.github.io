weatherApp.ux = (function () {
    var _errorLocation = weatherApp.get.one('.error');

    function init() {
        var citys = weatherApp.get.one('.citys'),
            hammer = new Hammer(citys);

        _swipeLeft(hammer);
        _swipeRight(hammer);
    };
    //define swipes
    function _swipeLeft(hammer) {
        hammer.on('swipeleft', function (ev) {
            var deleteButton = weatherApp.get.one('.' + ev.target.id);
            var int = 0;

            setInterval(function () {
                int++;

                if (int < 100) {
                    deleteButton.style.width = int + "px";
                }
            }, 2)

        });
    };
    //define swpipe right
    function _swipeRight(hammer) {
        hammer.on('swiperight', function (ev) {

            var deleteButton = weatherApp.get.one('.' + ev.target.id);
            var int = 100;
            setInterval(function () {
                int--;

                if (int > -1) {
                    deleteButton.style.width = int + "px";
                }
            }, 2)

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
