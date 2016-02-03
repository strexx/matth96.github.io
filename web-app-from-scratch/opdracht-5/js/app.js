//Maakt de variable app aanmaken als globaal object. En als er al een varianle app bestaat voegd hij de app var toe. Dit voorkomt conflicten met andere libary's
var app = app || {};

// use IIFE to avoid global vars
(function () {
    "use strict"

    app.start = {
        init: function () {
            app.router.init();
            app.sections.toggle();
            console.log('app.init uitgevoerd')
        }
    };
    app.router = {
        init: function () {
            console.log('app.router.init uitgevoerd')
            this.OnHashChange()
        },
        OnHashChange: function (event) {
            onhashchane(function () {
                alert("verandert");
            })


        },
        ChangeHash: function () {
            document.location.hash = "myBookmark";
        }

    }
    app.sections = {
            toggle: function () {
                console.log('app.sections.toggle uitgevoerd')
            }
        }
        //voer de app uit
    app.start.init()
}())
