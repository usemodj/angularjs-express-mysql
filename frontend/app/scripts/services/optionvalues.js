'use strict';

angular.module('frontendApp')
.factory('optionValues', ['$http', '$resource', function ($http, $resource) {
    // Service logic
    // ...

    var optionValuesResource = $resource('/option_values/:id',{id:'@id'}, {update: {method: 'PUT'}});

    // Public API here
    return {

        index: function () { //GET
            return optionValuesResource.query();
        },
        get: function(data, callback){ //GET
            //console.log(data);
            return optionValuesResource.get(data);
        },
        update: function(data){ //PUT
            return optionValuesResource.update(data);
        },
        save: function(data, callback){ //POST
            var cb = callback || angular.noop;
            optionValuesResource.save(data, function(optionValue){
                return cb(null, optionValue);
            }, function(err){
                return cb(err, null);
            });
        },
        remove: function(data){ //DELETE
            return optionValuesResource.remove(data);
        },

        updatePosition: function(entry, callback){
            //entry: sorted ids = '3,1,2.4,5'
            var cb = callback || angular.noop;
            console.log(entry);
            $http.post('/admin/option_values/', entry)
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
        searchOptionValues: function(conditions, callback){
            var cb = callback || angular.noop;
            console.log(conditions);
            $http.post('/admin/option_values/', conditions)
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

        changeOptionValues: function(optionValues, callback){
            var cb = callback || angular.noop;
            $http.post('/admin/option_values/change', optionValues)
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
