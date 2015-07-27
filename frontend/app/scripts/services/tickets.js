'use strict';

/**
 * @ngdoc service
 * @name frontendApp.tickets
 * @description
 * # tickets
 * Factory in the frontendApp.
 */
angular.module('frontendApp')
  .factory('tickets', ['$http', '$resource', function ($http, $resource) {

    var resource = $resource('/tickets/:id',{id:'@id'}, {update: {method: 'PUT'}});

    // Public API here
    return {
      get: function (data, callback) { //GET
        var cb = callback || angular.noop;
        resource.get(data, function (ticket) {
          //console.log(ticket);
          return cb(null, ticket);
        }, function (err) {
          return cb(err);
        });
      },
      update: function (data, callback) { //PUT
        var cb = callback || angular.noop;
        resource.update(data, function (ticket) {
          return cb(null, ticket);
        }, function (err) {
          return cb(err);
        });
      },
      search: function (conditions, callback) {
        var cb = callback || angular.noop;
        //console.log(conditions);
        $http.post('/tickets/search', conditions)
          .success(function (data, status, headers, config) {
            //console.log('>> status:' + status);
            return cb(null, data);
          }).error(function (data, status, headers, config) {
            //console.log('>> error data:' + data);
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            return cb(status, data);
          });
      },
      replyMessage: function (conditions, callback) {
        var cb = callback || angular.noop;
        //console.log(conditions);
        $http.post('/tickets/reply', conditions)
          .success(function (data, status, headers, config) {
            //console.log('>> status:' + status);
            return cb(null, data);
          }).error(function (data, status, headers, config) {
            //console.log('>> error data:' + data);
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            return cb(status, data);
          });
      },
      adminSearch: function (conditions, callback) {
        var cb = callback || angular.noop;
        //console.log(conditions);
        $http.post('/admin/tickets/search', conditions)
          .success(function (data, status, headers, config) {
            //console.log('>> status:' + status);
            return cb(null, data);
          }).error(function (data, status, headers, config) {
            //console.log('>> error data:' + data);
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            return cb(status, data);
          });
      }
    };
  }]);
