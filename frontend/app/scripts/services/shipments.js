'use strict';

angular.module('frontendApp')
    .factory('shipments', ['$http', '$resource', function ($http, $resource) {
        // Service logic
        // ...

        var resource = $resource('/shipments/:id',{id:'@id'}, {update: {method: 'PUT'}});

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
                resource.update(data, function(shipment){
                    return cb(null, shipment);
                }, function(err){
                    return cb(err, null);
                });
            },
            save: function(data, callback){ //POST
                var cb = callback || angular.noop;
                resource.save(data, function(shipment){
                    return cb(null, shipment);
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
                $http.post('/admin/shipments/', entry)
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
            getByOrderId: function(conditions, callback){
                var cb = callback || angular.noop;
                console.log(conditions);
                $http.post('/shipments/get_by_order_id', conditions)
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
