var weatherApp = weatherApp || {};
'use strict';

weatherApp.render = (function () { //funtion to render a template.
     function template(target, template, data) {
         //check if template is in localstorage if not reload the page
         if (template === null || template === [] || template.length === 0) {
             setTimeout(function () {
                 document.location.reload(true);
             }, 200)
         } else {
             weatherApp.get.one(target).innerHTML = Mustache.render(template, {
                 data: data
             });
         }
     };

     function progresbar(show, startVal, EndVal) {
         var progess = weatherApp.get.one('progress')
         if (show) {
             progess.classList.remove('disabled');
             console.log(startVal)
             progess.valueOf(startVal);
         } else {
             setTimeout(function () {
                 progess.classList.add('disabled');
             }, 300)
         }
     };

     function loading(show) {
         if (show) {
             weatherApp.get.one('.loading').classList.remove('disabled')
         } else {
             //show loading
             setTimeout(function () {
                 weatherApp.get.one('.loading').classList.add('disabled')
             }, 300)
         }
     };
     return {
         template: template,
         loading: loading
     };
 })();
