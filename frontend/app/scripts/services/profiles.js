'use strict';

/**
 * @ngdoc service
 * @name frontendApp.profiles
 * @description
 * # profiles
 * Factory in the frontendApp.
 */
angular.module('frontendApp')
  .factory('profiles', ['$http', '$resource', function ($http, $resource) {

  var resource = $resource('/profiles/:id',{id:'@id'}, {update: {method: 'PUT'}});

  // Public API here
  return {
    index: function () { //GET
      return resource.query();
    },
    get: function (conditions, callback) { //GET
      var cb = callback || angular.noop;
      resource.get(conditions, function (data) {
        console.log(data);
        return cb(null, data);
      }, function (err) {
        return cb(err, null);
      });
    },
    update: function (conditions, callback) { //PUT
      var cb = callback || angular.noop;
      resource.update(conditions, function (data) {
        return cb(null, data);
      }, function (err) {
        return cb(err, null);
      });
    },
    save: function (conditions, callback) { //POST
      var cb = callback || angular.noop;
      resource.save(conditions, function (data) {
        return cb(null, data);
      }, function (err) {
        return cb(err, null);
      });
    },
    remove: function (conditions, callback) { //DELETE
      var cb = callback || angular.noop;
      return resource.remove(conditions, function (data) {
        return cb(null, data);
      }, function (err) {
        return cb(err);
      });
    },

    saveAddress: function (conditions, callback) {
      var cb = callback || angular.noop;
      //console.log(conditions);
      $http.post('/profiles/save_address', conditions)
        .success(function (data, status, headers, config) {
          console.log('>> status:' + status);
          return cb(null, data);
        }).error(function (data, status, headers, config) {
          console.log('>> error data:' + data);
          // called asynchronously if an error occurs
          // or server returns response with an error status.
          return cb(status, data);
        });
    }
  };
}]);

