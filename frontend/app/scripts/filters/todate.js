'use strict';

/**
 * @ngdoc filter
 * @name frontendApp.filter:toDate
 * @function
 * @description
 * # toDate
 * Filter in the frontendApp.
 */
angular.module('frontendApp')
  .filter('toDate', function () {
    //var regexIso8601 = /^(\d{4}|\+\d{6})(?:-(\d{2})(?:-(\d{2})(?:T(\d{2}):(\d{2}):(\d{2})\.(\d{1,})(Z|([\-+])(\d{2}):(\d{2}))?)?)?)?$/;
    var re = /^(\d{4})(?:-(\d{2})(?:-(\d{2})(?:\s(\d{2}):(\d{2}):(\d{2}))?)?)?$/;

    return function (input) {
      if(!input) return  null;
      var m = input.match(re);
      if(m) {
        //var milliseconds = Date.parse(m[0])
        //if(!isNaN(milliseconds)) return new Date(milliseconds);
        if(m.length == 4) return new Date(Date.UTC(m[1],m[2]-1,m[3]));
        else if(m.length == 7) return new Date(Date.UTC(m[1],m[2]-1,m[3],m[4],m[5],m[6]));
      }
      return null;
    };
  });
