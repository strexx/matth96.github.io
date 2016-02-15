//  function sayHI() {
//      worker.postMessage({
//          'cmd': 'start',
//          'msg': 'Hi'
//      });
//  }
//
//  function stop() {
//      // worker.terminate() from this script would also stop the worker.
//      worker.postMessage({
//          'cmd': 'stop',
//          'msg': 'Bye'
//      });
//  }
//
//  function unknownCmd() {
//      worker.postMessage({
//          'cmd': 'foobard',
//          'msg': '???'
//      });
//  }
//
//
//  var worker = new Worker('js/apiwork.js');
//
//  worker.addEventListener('message', function (e) {
//      document.getElementById('result').textContent = e.data;
//  }, false);


  //function getApi(url) {
  //    // return a Promise object
  //    return new Promise((resolve, reject) => {
  //        var request = new XMLHttpRequest();
  //
  //        request.open('GET', url);
  //
  //        request.onloadstart = function () {
  //            console.log("show loader")
  //        };
  //        request.onload = function () {
  //            if (request.status == 200) {
  //                console.log("hide loader")
  //                    // fulfill the promise
  //                resolve(request.responseText);
  //            } else {
  //                // reject the promise
  //                reject(new Error('request failed!'));
  //            }
  //        };
  //        request.send();
  //    });
  //}
  //
  //getApi('./temp/home.mst').then(response => {
  //    var data = response;
  //    return data;
  //}).catch(e => {
  //    // catching all failures!
  //    console.error(e);
  //});

  //    app.get.data('./temp/home.mst').then(response => {
  //        var data = response;
  //        return data;
  //
  //    }).then(response => {
  //        console.log('inner data', response);
  //    }).catch(e => {
  //        // console log all errors
  //        console.error(e);
  //    });

  //    Promise.all([app.get.data('./temp/home.mst'), app.get.data('./temp/city.mst')])
  //    .then(response => {
  //        console.log(response);
  //    })
  //    .catch(err => {
  //        console.log(err);
  //    })




  //function timeout(duration) {
  //    return new Promise((resolve, reject) => {
  //        window.setTimeout(resolve, duration);
  //    });
  //};
  //timeout(1000)
  //    .then(response => {
  //        return "hio"
  //    })
  //    .catch(err => {})
  //
  //Promise.all([timeout(1000), timeout(2000)])
  //    .then(response => {
  //        console.log(response);
  //    })
  //    .catch(err => {
  //        console.log(err);
  //    })
  //


  //var data = {
  //    "coord": {
  //        "lon": 4.89,
  //        "lat": 52.37
  //    },
  //    "weather": [{
  //        "id": 521,
  //        "main": "Rain",
  //        "description": "proximity shower rain",
  //        "icon": "09n"
  //                        }],
  //    "base": "stations",
  //    "main": {
  //        "temp": 279.46,
  //        "pressure": 991,
  //        "humidity": 87,
  //        "temp_min": 278.95,
  //        "temp_max": 280.15
  //    },
  //    "visibility": 10000,
  //    "wind": {
  //        "speed": 9.8,
  //        "deg": 210
  //    },
  //    "clouds": {
  //        "all": 40
  //    },
  //    "dt": 1454998251,
  //    "sys": {
  //        "type": 1,
  //        "id": 5204,
  //        "message": 0.0365,
  //        "country": "NL",
  //        "sunrise": 1455001709,
  //        "sunset": 1455036093
  //    },
  //    "id": 2759794,
  //    "name": "Amsterdam",
  //    "cod": 200
  //}
  //
  ////var data = [[{
  ////    "id": 500,
  ////    "main": "Rain",
  ////    "description": "light rain",
  ////    "icon": "10n"
  ////}], {
  ////    "temp": 18.37,
  ////    "pressure": 849.53,
  ////    "humidity": 85,
  ////    "temp_min": 18.37,
  ////    "temp_max": 18.37,
  ////    "sea_level": 1023.79,
  ////    "grnd_level": 849.53
  ////}, "Ermelo"]
  ////
  //////console.log(_.reduce(data.weather, function (value, num) {
  //////    data.weather.id.remove
  //////      return value
  //////}))
  ////
  ////_.omit(data.weather[0], function (value, key, object) {
  ////    return _.isNumber(value);
  ////})
  //
