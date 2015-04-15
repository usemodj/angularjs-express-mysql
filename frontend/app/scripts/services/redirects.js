'use strict';

/**
 * @ngdoc service
 * @name frontendApp.redirects
 * @description
 * # redirects
 * Factory in the frontendApp.
 */
angular.module('frontendApp')
  .factory('redirects', function () {
    // Service logic
    // ...

    var redirectURL = '';

    // Public API here
    return {
      setRedirectURL: function (url) {
        this.redirectURL = url;
      },
      getRedirectURL: function(){
        return this.redirectURL;
      }
    };
  });
