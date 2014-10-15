'use strict';

angular.module('frontendApp')
  .factory('payments', ['$http', '$resource', function ($http, $resource) {
    // Service logic

    // Public API here
    return {
        getPaymentMethods: function(callback){
            var cb = callback || angular.noop;
            $http.get('/orders/payment_methods')
                .success(function(data, status, headers, config){
                    //console.log('>> status:'+ status);
                    return cb(null, data);
                }).error(function(data, status, headers, config) {
                    console.log('>> error data:'+ data);
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                    return cb(status, data);
                });
        }
    };
  }]);
