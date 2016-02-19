//define all pages in the weatherApp.
weatherApp.page = (function () {
    //ony private vars
    var _homeTemplate = weatherApp.localStorage.get('home'),
        _searchresultsTemplate = weatherApp.localStorage.get('searchresults'),
        _searchTemplate = weatherApp.localStorage.get('search'),
        _citysTemplate = weatherApp.localStorage.get('citys'),
        _cityTemplate = weatherApp.localStorage.get('city');

    function home() { //render the home template
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                displayPosition,
                displayError, {
                    enableHighAccuracy: true,
                    maximumAge: 0
                }
            );
        }

        function displayPosition(position) {
            var url = weatherApp.data.geolocationURL(position.coords.latitude, position.coords.longitude)

            weatherApp.get.data(url)
                .then(response => {
                    var data = JSON.parse(response);

                    return data
                }).then(response => {
                    var cityData = {
                        cityName: response.name,
                        description: response.weather[0].description,
                        minTemp: response.main.temp_min,
                        maxTemp: response.main.temp_max,
                        humidity: response.main.humidity,
                        pressure: response.main.pressure,
                        temp: response.main.temp,
                        clouds: response.clouds.all,
                        wind: response.wind.speed
                    };

                    return cityData;
                }).then(response => {
                    weatherApp.render.template('#target', _homeTemplate, response);
                }).catch(e => {
                    console.error(e);
                    weatherApp.ux.showErr('The data is gone... ');
                });
        }

        function displayError() {
            weatherApp.ux.showErr('Geolocation is not supported by this browser');
        }
    };

    function search() {
        //define all vars for the search funtion
        var searchFuntion = function () {
            var searchField = weatherApp.get.one('#search');
            //if the input of the searchfield changes run this function
            searchField.addEventListener('input', function () {
                var url = weatherApp.data.SearchUrl(searchField.value);

                //get data from api with the input of the input field
                weatherApp.get.data(url)
                    .then(response => {
                        var data = JSON.parse(response).list,
                            newdata = _.map(data, function (data) {
                                data.attachedName = data.name.replace(/ /g, '-').toLowerCase() + '-' + data.sys.country.toLowerCase();
                                return data
                            });

                        //if the checkbox is checked filer the results
                        if (weatherApp.get.one('.in-nl').checked === true) {
                            var rawData = _.filter(newdata, function (searchData, predicate) {
                                return searchData.sys.country === 'NL';
                            });
                            return rawData;
                        } else {
                            //if the checkbox is not checked the data is not filterd.
                            var rawData = newdata;
                            return rawData;
                        }
                    }).then(response => {
                        weatherApp.render.template('#searchresults', _searchresultsTemplate, response);
                        weatherApp.get.one('.searchlist').addEventListener('click', function (e) {
                            if (e.target && e.target.nodeName == 'LI') {
                                //add the clicked city to local storage.
                                weatherApp.localStorage.add('savedCitys', e.target.id);
                                // go to #/citys
                                window.location = '#/citys';
                            }
                        });
                    }).catch(e => {
                        console.error(e);
                    });
            });
        };

        //render the search  template
        weatherApp.render.template('#target', _searchTemplate);
        searchFuntion();
    };

    function citys() {
        // a emty array with the
        var savedCitysData = [],
            savedCitys = weatherApp.localStorage.get('savedCitys');

        if (savedCitys.length <= 0) {
            window.location = '#/search';
            weatherApp.ux.showErr('Sorry, there\' nothing here, please add a city.');
        } else {
            //loop threu the saved city's
            savedCitys.forEach(function (element) {
                var url = weatherApp.data.WeatherUrl(element),
                    deleteCity = function (savedCitysData) {
                        //divine a event lisner on the showed list
                        var citys = weatherApp.get.one('.citys');
                        citys.addEventListener('click', function (e) {
                            if (e.target && e.target.nodeName == 'BUTTON' || e.target && e.target.nodeName == 'SMALL') {
                                var delCity = e.target.id.toLowerCase();
                                weatherApp.localStorage.remove(savedCitysData, delCity)
                            }
                        });
                    };
                weatherApp.get.data(url)
                    .then(response => {
                        var data = JSON.parse(response);

                        return data
                    }).then(response => {
                        savedCitysData.push({
                            cityName: response.name,
                            cityNameUrl: response.name,
                            icon: response.weather[0].icon,
                            description: response.weather[0].description,
                            temp: response.main.temp,
                        });
                        if (savedCitysData.length === savedCitys.length) {
                            weatherApp.render.template('#target', _citysTemplate, savedCitysData);
                            weatherApp.ux.init();
                            deleteCity(savedCitysData);
                        }
                    }).catch(e => {
                        console.error(e);
                        weatherApp.ux.showErr('There was a error :(');
                    });
            });
        }
    };

    function city(cityParam) {
        var url = weatherApp.data.WeatherUrl(cityParam);
        //get the weather data
        weatherApp.get.data(url)
            .then(response => {
                //parse data
                var data = JSON.parse(response);
                return data;
            }).then(response => {
                var cityData = {
                    cityName: response.name,
                    description: response.weather[0].description,
                    minTemp: response.main.temp_min,
                    maxTemp: response.main.temp_max,
                    temp: response.main.temp,
                    clouds: response.clouds.all,
                    wind: response.wind.speed
                };
                //render template with data form api
                weatherApp.render.template('#target', _cityTemplate, cityData);
            }).catch(e => {
                console.error(e);
                weatherApp.ux.showErr('There was a error :(');
            });
    };
    return {
        home: home,
        search: search,
        citys: citys,
        city: city
    };

})();
