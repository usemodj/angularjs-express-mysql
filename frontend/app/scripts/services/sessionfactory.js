'use strict';

var services = angular.module('frontendApp');
services.factory('SessionFactory', ['$resource', '$http', function($resource, $http) {
            return $resource('/auth/session');
            //var resource = $resource('/auth/session',{ }, {update: {method: 'PUT'}});
            //return {
            //  save: function(data, success, fail){
            //    var success = success || angular.noop;
            //    var fail = fail || angular.noop;
            //    resource.save(data, function (session) {
            //      return success(session);
            //    }, function (err) {
            //      return fail(err);
            //    });
            //  },
            //  remove: function(success, fail){
            //    var success = success || angular.noop;
            //    var fail = fail || angular.noop;
            //    //resource.remove(function (session) {
            //    //  return success(session);
            //    //}, function (err) {
            //    //  return fail(err);
            //    //});
            //    $http.delete('/auth/session')
            //      .success(function (data, status, headers, config) {
            //        console.log('>> status:' + status);
            //        return success( data);
            //      }).error(function (data, status, headers, config) {
            //        console.log('>> headers: '+ JSON.stringify(headers));
            //        console.log('>> error data:' + JSON.stringify(data));
            //        // called asynchronously if an error occurs
            //        // or server returns response with an error status.
            //        return fail( data);
            //      });
            //
            //  }
            //};
        }
    ]);
