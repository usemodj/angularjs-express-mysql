'use strict';

angular.module('frontendApp')
.factory('assets', ['$http', '$resource', function ($http, $resource) {
    // Service logic
    // ...

    var resource = $resource('/assets/:id',{id:'@id'}, {update: {method: 'PUT'}});

    // Public API here
    return {

        index: function () { //GET
            return resource.query();
        },
        get: function(data, callback){ //GET
            var cb = callback || angular.noop;
            resource.get(data, function(asset){

                return cb(null, asset);
            }, function(err){
                return cb(err, null);
            });
        },
        update: function(data, callback){ //PUT
            var cb = callback || angular.noop;
            resource.update(data, function(asset){
                return cb(null, asset);
            }, function(err){
                return cb(err, null);
            });
        },
        save: function(data, callback){ //POST
            var cb = callback || angular.noop;
            resource.save(data, function(asset){
                return cb(null, asset);
            }, function(err){
                return cb(err, null);
            });
        },
        remove: function(data, callback){ //DELETE
            var cb = callback || angular.noop;
            resource.remove(data, function(asset){
                return cb(null, asset);
            }, function(err){
                return cb(err);
            });
        },

        updatePosition: function(entry, callback){
            //entry: sorted ids = '3,1,2.4,5'
            var cb = callback || angular.noop;
            //console.log(entry);
            $http.post('/admin/assets/position', entry)
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
        getAsset: function(conditions, callback){
            var cb = callback || angular.noop;
            //console.log(conditions);
            $http.get('/admin/products/' + conditions.product_id + '/assets/'+ conditions.id)
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
        getAssets: function(conditions, callback){
            var cb = callback || angular.noop;
            //console.log(conditions);
            $http.get('/admin/products/'+ conditions.product_id + '/assets')
                .success(function(data, status, headers, config){
                    return cb(null, data);
                }).error(function(data, status, headers, config) {
                    //console.log('>> error data:');
                    //console.log(data);
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                    return cb(data);
                });
        }


    };
}]);
