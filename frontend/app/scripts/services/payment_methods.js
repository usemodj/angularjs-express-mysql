'use strict';

angular.module('frontendApp')
.factory('paymentMethods', ['$http', '$resource', function ($http, $resource) {
    // Service logic
    // ...

    var resource = $resource('/payment_methods/:id',{id:'@id'}, {update: {method: 'PUT'}});

    // Public API here
    return {

        index: function () { //GET
            return resource.query();
        },
        get: function(data, callback){ //GET
            //console.log(data);
            return resource.get(data);
        },
        update: function(data, callback){ //PUT
            var cb = callback || angular.noop;
            resource.update(data, function(paymentMethod){
                return cb(null, paymentMethod);
            }, function(err){
                return cb(err, null);
            });
        },
        save: function(data, callback){ //POST
            var cb = callback || angular.noop;
            resource.save(data, function(paymentMethod){
                return cb(null, paymentMethod);
            }, function(err){
                return cb(err, null);
            });
        },
        remove: function(data){ //DELETE
            return resource.remove(data);
        },

        updatePosition: function(entry, callback){
            //entry: sorted ids = '3,1,2.4,5'
            var cb = callback || angular.noop;
            console.log(entry);
            $http.post('/admin/payment_methods/', entry)
                .success(function(data, status, headers, config){
                    console.log('>> status:'+ status);
                    return cb(null, data);
                }).error(function(data, status, headers, config) {
                    console.log('>> error data:');
                    console.log(data);
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                    return cb(status, data);
                });
        },
        searchPaymentMethods: function(conditions, callback){
            var cb = callback || angular.noop;
            console.log(conditions);
            $http.post('/admin/payment_methods/search', conditions)
                .success(function(data, status, headers, config){
                    console.log('>> status:'+ status);
                    return cb(null, data);
                }).error(function(data, status, headers, config) {
                    console.log('>> error data:');
                    console.log(data);
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                    return cb(status, data);
                });
        }

    };
}]);
