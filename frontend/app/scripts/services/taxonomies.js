'use strict';

angular.module('frontendApp')
  .factory('taxonomies', ['$http', '$resource', function ($http, $resource) {
    // Service logic
    // ...

    var resource = $resource('/taxonomies/:id',{id:'@id'}, {update: {method: 'PUT'}});

    // Public API here
    return {

        query: function (callback) { //GET
          var cb = callback || angular.noop;
            resource.query(function(list){
              return cb(null, list);
            }, function(err){
              return cb(err);
            });
        },
        get: function(data, callback){ //GET
            var cb = callback || angular.noop;
            resource.get(data, function(taxonomy){
                //console.log(taxonomy);
                return cb(null, taxonomy);
            }, function(err){
                return cb(err, null);
            });
        },
        update: function(data, callback){ //PUT
            var cb = callback || angular.noop;
            resource.update(data, function(taxonomy){
                return cb(null, taxonomy);
            }, function(err){
                return cb(err, null);
            });
        },
        save: function(data, callback){ //POST
            var cb = callback || angular.noop;
            resource.save(data, function(taxonomy){
                return cb(null, taxonomy);
            }, function(err){
                return cb(err, null);
            });
        },
        remove: function(data){ //DELETE
            return resource.remove(data);
        },
        list: function(callback){
          var cb = callback || angular.noop;
          $http.get('/taxonomies/list')
            .success(function(data, status, headers, config){
              return cb(null, data);
            })
            .error(function (data, status, header, config) {
              return cb(data);
            });
        },
        updatePosition: function(entry, callback){
            //entry: sorted ids = '3,1,2.4,5'
            var cb = callback || angular.noop;
            console.log(entry);
            $http.post('/admin/taxonomies/', entry)
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
        searchTaxonomies: function(conditions, callback){
            var cb = callback || angular.noop;
            console.log(conditions);
            $http.post('/admin/taxonomies/search/', conditions)
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
