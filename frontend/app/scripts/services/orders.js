'use strict';

angular.module('frontendApp')
.factory('orders', ['$http', '$resource', function ($http, $resource) {
    // Service logic
    // ...

    var resource = $resource('/orders/:id',{id:'@id'}, {update: {method: 'PUT'}});

    // Public API here
    return {
        index: function () { //GET
            return resource.query();
        },
        get: function(data, callback){ //GET
            var cb = callback || angular.noop;
            resource.get(data, function(order){
                console.log(order);
                return cb(null, order);
            }, function(err){
                return cb(err, null);
            });
        },
        update: function(data, callback){ //PUT
            var cb = callback || angular.noop;
            resource.update(data, function( order){
                return cb(null, order);
            }, function(err){
                return cb(err, null);
            });
        },
        save: function(data, callback){ //POST
            var cb = callback || angular.noop;
            resource.save(data, function(order){
                return cb(null, order);
            }, function(err){
                return cb(err, null);
            });
        },
        remove: function(data){ //DELETE
            return resource.remove(data);
        },

        getCart: function(callback){
            var cb = callback || angular.noop;
            $http.get('/orders/cart')
                .success(function(data, status, headers, config){
                    //console.log('>> status:'+ status);
                    return cb(null, data);
                }).error(function(data, status, headers, config) {
                    console.log('>> error data:'+ data);
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                    return cb(status, data);
                });
        },

        updateCart: function(data, callback){
            var cb = callback || angular.noop;
            $http.post('/orders/update', data)
                .success(function(data, status, headers, config){
                    //console.log('>> status:'+ status);
                    return cb(null, data);
                }).error(function(data, status, headers, config) {
                    console.log('>> error data:'+ data);
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                    return cb(status, data);
                });
        },

        updateAddressState: function(callback){
            var cb = callback || angular.noop;
            $http.get('/orders/address')
                .success(function(data, status, headers, config){
                    //console.log('>> status:'+ status);
                    return cb(null, data);
                }).error(function(data, status, headers, config) {
                    console.log('>> error data:'+ data);
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                    return cb(status, data);
                });
        },

        saveAddress: function(data, callback){
            var cb = callback || angular.noop;
            $http.post('/orders/address', data)
                .success(function(data, status, headers, config){
                    //console.log('>> status:'+ status);
                    return cb(null, data);
                }).error(function(data, status, headers, config) {
                    console.log('>> error data:'+ data);
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                    return cb(status, data);
                });
        },

        // complete_at IS NULL
        getOrder: function(callback){
            var cb = callback || angular.noop;
            $http.get('/orders/')
                .success(function(data, status, headers, config){
                    //console.log('>> status:'+ status);
                    return cb(null, data);
                }).error(function(data, status, headers, config) {
                    console.log('>> error data:'+ data);
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                    return cb(status, data);
                });
        },

        saveShipment: function(data, callback){
            var cb = callback || angular.noop;
            $http.post('/orders/shipment', data)
                .success(function(data, status, headers, config){
                    //console.log('>> status:'+ status);
                    return cb(null, data);
                }).error(function(data, status, headers, config) {
                    console.log('>> error data:'+ data);
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                    return cb(status, data);
                });
        },

        savePayment: function(data, callback){
            var cb = callback || angular.noop;
            $http.post('/orders/payment', data)
                .success(function(data, status, headers, config){
                    //console.log('>> status:'+ status);
                    return cb(null, data);
                }).error(function(data, status, headers, config) {
                    console.log('>> error data:'+ data);
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                    return cb(status, data);
                });
        },

        getOrders: function(data, callback){
            var cb = callback || angular.noop;
            $http.get('/orders/list/' + data.page)
                .success(function(data, status, headers, config){
                    //console.log('>> status:'+ status);
                    return cb(null, data);
                }).error(function(data, status, headers, config) {
                    console.log('>> error data:'+ data);
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                    return cb(status, data);
                });
        },

        searchOrders: function(conditions, callback){
            var cb = callback || angular.noop;
            console.log(conditions);
            $http.post('/admin/orders/search', conditions)
                .success(function(data, status, headers, config){
                    console.log('>> status:'+ status);
                    return cb(null, data);
                }).error(function(data, status, headers, config) {
                    console.log('>> error data:'+ data);
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                    return cb(status, data);
                });
        },

    };
  }]);
