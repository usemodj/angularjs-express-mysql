'use strict';

angular.module('frontendApp')
.factory('variants', ['$http', '$resource', function ($http, $resource) {
    // Service logic
    // ...

    var resource = $resource('/variants/:id',{id:'@id'}, {update: {method: 'PUT'}});

    // Public API here
    return {

        index: function () { //GET
            return resource.query();
        },
        get: function(data, callback){ //GET
            var cb = callback || angular.noop;
            resource.get(data, function(variant){
                return cb(null, variant);
            }, function(err){
                return cb(err, null);
            });
        },
        update: function(data, callback){ //PUT
            var cb = callback || angular.noop;
            resource.update(data, function( variant){
                return cb(null, variant);
            }, function(err){
                return cb(err, null);
            });
        },
        save: function(data, callback){ //POST
            var cb = callback || angular.noop;
            resource.save(data, function(variant){
                return cb(null, variant);
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
            //console.log(entry);
            $http.post('/admin/variants/position', entry)
                .success(function(data, status, headers, config){
                    //console.log('>> status:'+ status);
                    return cb(null, data);
                }).error(function(data, status, headers, config) {
                    //console.log('>> error data:');
                    //console.log(data);
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                    return cb(status, data);
                });
        },
        searchVariants: function(conditions, callback){
            var cb = callback || angular.noop;
            //console.log(conditions);
            $http.post('/admin/variants/search', conditions)
                .success(function(data, status, headers, config){
                    //console.log('>> status:'+ status);
                    return cb(null, data);
                }).error(function(data, status, headers, config) {
                    //console.log('>> error data:');
                    //console.log(data);
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                    return cb(status, data);
                });
        },

        getProductVariant: function(conditions, callback){
            var cb = callback || angular.noop;
            //console.log(conditions);
            $http.get('/admin/products/'+conditions.product_id+'/variants/'+ conditions.id)
                .success(function(data, status, headers, config){
                    //console.log('>> status:'+ status);
                    return cb(null, data);
                }).error(function(data, status, headers, config) {
                    //console.log('>> error data:');
                    //console.log(data);
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                    return cb(status, data);
                });
        }
    };
}]);
