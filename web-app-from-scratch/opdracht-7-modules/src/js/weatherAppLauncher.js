var weatherApp = weatherApp || {}; //Maakt de variable app als globaal object aan. En als er al een variabele app bestaat voegt hij de app var toe. Dit voorkomt conflicten met andere libary's.
'use strict'; //This is a EJS 5 function. If you enable it you can't use undifned varibles and your code will crash if you don't code properly.

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

weatherApp.start.init();
