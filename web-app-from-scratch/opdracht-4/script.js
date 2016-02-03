/***
 * cmdaan.js
 *   Bevat functies voor CMDAan stijl geolocation welke uitgelegd
 *   zijn tijdens het techniek college in week 5.
 *
 *   Author: J.P. Sturkenboom <j.p.sturkenboom@hva.nl>
 *   Credit: Dive into html5, geo.js, Nicholas C. Zakas
 *
 *   Copyleft 2012, all wrongs reversed.
 */

var myApp = myApp || {};

(function () {
    "use strict";
    // Variable declaration
    var updateMap, intervalCounter, interval, map, debugId, customDebugging, currentPositionMarker, geo_position_js;
    var positionUpdated = 'POSITION_UPDATED',
        currentPosition = currentPositionMarker = customDebugging = debugId = map = interval = intervalCounter = updateMap = false,
        ET = new EventTarget();

    // Test of GPS beschikbaar is (via geo.js) en vuur een event af
    myApp.gps = {
        init: function init() {
            var gpsAvailable = 'gpsAvailable',
                gpsUnavailable = 'gpsUnavailable';

            myApp.debug.debugMessage("Controleer of GPS beschikbaar is...");
            ET.addListener(gpsAvailable, this.startInterval);
            ET.addListener(gpsUnavailable, function () {
                debugMessage('GPS is niet beschikbaar.')
            });
            (geo_position_js.init()) ? ET.fire(gpsAvailable): ET.fire(gpsUnavailable);
        },
        startInterval: function (event) {
            // Start een interval welke op basis van refreshRate de positie updated
            var refreshRate = 1000;
            this.debugMessage("GPS is beschikbaar, vraag positie.");
            this.updatePosition();
            interval = self.setInterval(this.updatePosition, refreshRate);
            ET.addListener(myApp.positionUpdated, this.checkLocations);
        },
        updatePosition: function () {
            // Vraag de huidige positie aan geo.js, stel een callback in voor het resultaat
            intervalCounter++;
            geo_position_js.getCurrentPosition(this.setPosition, this.geoErrorHandler, {
                enableHighAccuracy: true
            });
        },
        setPosition: function (position) {
            // Callback functie voor het instellen van de huidige positie, vuurt een event af
            myApp.currentPosition = position;
            ET.fire("POSITION_UPDATED");
            this.debugMessage(intervalCounter + " positie lat:" + position.coords.latitude + " long:" + position.coords.longitude);
        },
        checkLocations: function (event) {
            // Controleer de locations en verwijs naar een andere pagina als we op een location zijn
            // Liefst buiten google maps om... maar helaas, ze hebben alle coole functies
            for (var i = 0; i < locations.length; i++) {
                var location = {
                    coords: {
                        latitude: locations[i][3],
                        longitude: locations[i][4]
                    }
                };
                if (this.calculateDistance(location, myApp.currentPosition) < locations[i][2]) {
                    // Controle of we NU op die location zijn, zo niet gaan we naar de betreffende page
                    if (window.location != locations[i][1] && localStorage[locations[i][0]] == "false") {
                        // Probeer local storage, als die bestaat incrementeer de location
                        try {
                            (localStorage[locations[i][0]] == "false") ? localStorage[locations[i][0]] = 1: localStorage[locations[i][0]]++;
                        } catch (error) {
                            this.debugMessage("Localstorage kan niet aangesproken worden: " + error);
                        }

                        // TODO: Animeer de betreffende marker
                        window.location = locations[i][1];
                        this.debugMessage("Speler is binnen een straal van " + locations[i][2] + " meter van " + locations[i][0]);
                    }
                }
            }
        },
        calculateDistance: function (p1, p2) {
            // Bereken het verchil in meters tussen twee punten
            var pos1 = new google.maps.LatLng(p1.coords.latitude, p1.coords.longitude);
            var pos2 = new google.maps.LatLng(p2.coords.latitude, p2.coords.longitude);
            return Math.round(google.maps.geometry.spherical.computeDistanceBetween(pos1, pos2), 0);
        }
    }

    myApp.map = {
        updatePositie: function (event) {
            // use currentPosition to center the map
            var newPos = new google.maps.LatLng(myApp.currentPosition.coords.latitude, myApp.currentPosition.coords.longitude);
            map.setCenter(newPos);
            myApp.gps.setPosition(newPos);
        },
        isNumber: function (n) {
            return !isNaN(parseFloat(n)) && isFinite(n);
        },
        // GOOGLE MAPS FUNCTIES
        /**
         * generate_map(myOptions, canvasId)
         *  roept op basis van meegegeven opties de google maps API aan
         *  om een kaart te genereren en plaatst deze in het HTML element
         *  wat aangeduid wordt door het meegegeven id.
         *
         *  @param myOptions:object - een object met in te stellen opties
         *      voor de aanroep van de google maps API, kijk voor een over-
         *      zicht van mogelijke opties op http://
         *  @param canvasID:string - het id van het HTML element waar de
         *      kaart in ge-rendered moet worden, <div> of <canvas>
         */
        function generate_map(myOptions, canvasId) {
            var linear = "LINEAIR";
            var markerRow = [];
            var routeList = [];
            map = new google.maps.Map(document.getElementById(canvasId), myOptions);

            // TODO: Kan ik hier asynchroon nog de google maps api aanroepen? dit scheelt calls
            myApp.debug.debugMessage("Genereer een Google Maps kaart en toon deze in #" + canvasId)

            // Voeg de markers toe aan de map afhankelijk van het tourtype
            myApp.debug.debugMessage("locations intekenen, tourtype is: " + tourType);
            for (var i = 0; i < locations.length; i++) {
                var markerLatLng = new google.maps.LatLng(locations[i][3], locations[i][4]);
                var marker = new google.maps.Marker({
                    position: markerLatLng,
                    map: map,
                    icon: markerRow[i],
                    title: locations[i][0]
                });

                // Met kudos aan Tomas Harkema, probeer local storage, als het bestaat, voeg de locations toe
                try {
                    (localStorage.visited == undefined || myApp.map.isNumber(localStorage.visited)) ? localStorage[locations[i][0]] = false: null;
                } catch (error) {
                    myApp.debug.debugMessage("Localstorage kan niet aangesproken worden: " + error);
                }
                routeList.push(markerLatLng);
                markerRow[i] = {};
                for (var attr in locationMarker) {
                    markerRow[i][attr] = locationMarker[attr];
                }
                markerRow[i].scale = locations[i][2] / 3;
            }
            // TODO: Kleur aanpassen op het huidige punt van de tour
            if (tourType == linear) {
                // Trek lijnen tussen de punten
                myApp.debug.debugMessage("Route intekenen");
                var route = new google.maps.Polyline({
                    clickable: false,
                    map: map,
                    path: routeList,
                    strokeColor: 'Black',
                    strokeOpacity: .6,
                    strokeWeight: 3
                });
            }

            // Voeg de location van de persoon door
            myApp.currentPositionMarker = new google.maps.Marker({
                position: kaartOpties.center,
                map: map,
                icon: positieMarker,
                title: 'U bevindt zich hier'
            });

            // Zorg dat de kaart geupdated wordt als het POSITION_UPDATED event afgevuurd wordt
            ET.addListener(myApp.positionUpdated, myApp.map.updatePositie);
        }
    };

    myApp.debug = {
        geoErrorHandler: function (code, message) {
            // FUNCTIES VOOR DEBUGGING
            this.debugMessage('geo.js error ' + code + ': ' + message);
        },
        message: function () {

        },
        debugMessage: function (message) {
            (customDebugging && debugId) ? document.getElementById(debugId).innerHTML: console.log(message);
        }
    }
    myApp.gps.init()
})();
