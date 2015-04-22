'use strict';

angular.module('frontendApp')
  .factory('forums', ['$http', '$resource', function ($http, $resource) {

    var resource = $resource('/admin/forums/:id',{id:'@id'}, {update: {method: 'PUT'}});

    // Public API here
    return {
        index: function () { //GET
            return resource.query();
        },
        get: function(data, callback){ //GET
            var cb = callback || angular.noop;
            resource.get(data, function(forum){
                //console.log(forum);
                return cb(null, forum);
            }, function(err){
                return cb(err, null);
            });
        },
        update: function(data, callback){ //PUT
            var cb = callback || angular.noop;
            resource.update(data, function( forum){
                return cb(null, forum);
            }, function(err){
                return cb(err, null);
            });
        },
        save: function(data, callback){ //POST
            var cb = callback || angular.noop;
            resource.save(data, function(forum){
                return cb(null, forum);
            }, function(err){
                return cb(err, null);
            });
        },
        remove: function(data){ //DELETE
            return resource.remove(data);
        },
        searchForums: function(conditions, callback){
            var cb = callback || angular.noop;
            //console.log(conditions);
            $http.post('/admin/forums/search', conditions)
                .success(function(data, status, headers, config){
                    //console.log('>> status:'+ status);
                    return cb(null, data);
                }).error(function(data, status, headers, config) {
                    //console.log('>> error data:'+ data);
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                    return cb(status, data);
                });
        },
        addForum: function(conditions, callback){
            var cb = callback || angular.noop;
            //console.log(conditions);
            $http.post('/admin/forums/add', conditions)
                .success(function(data, status, headers, config){
                    //console.log('>> status:'+ status);
                    return cb(null, data);
                }).error(function(data, status, headers, config) {
                    //console.log('>> error data:'+ data);
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                    return cb(status, data);
                });
        },
        rebuildTree: function(callback){
            var cb = callback || angular.noop;
            $http.get('/admin/forums/rebuild_tree')
                .success(function(data, status, headers, config){
                    //console.log('>> status:'+ status);
                    return cb(null, data);
                }).error(function(data, status, headers, config) {
                    //console.log('>> error data:'+ data);
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                    return cb(status, data);
                });
        },
        createRoot: function(callback){
            var cb = callback || angular.noop;
            $http.get('/admin/forums/create_root')
                .success(function(data, status, headers, config){
                    //console.log('>> status:'+ status);
                    return cb(null, data);
                }).error(function(data, status, headers, config) {
                    //console.log('>> error data:'+ data);
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                    return cb(status, data);
                });
        }

    };
  }]);
