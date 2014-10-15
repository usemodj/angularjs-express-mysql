'use strict';

angular.module('frontendApp')
.factory('optionTypes', ['$http', '$resource', function ($http, $resource) {
    // Service logic
    // ...

    var optionTypesResource = $resource('/option_types/:id',{id:'@id'}, {update: {method: 'PUT'}});

    // Public API here
    return {

        index: function () { //GET
            return optionTypesResource.query();
        },
        get: function(data, callback){ //GET
            //console.log(data);
            return optionTypesResource.get(data);
        },
        update: function(data, callback){ //PUT
            var cb = callback || angular.noop;
            optionTypesResource.update(data, function(optionType){
                return cb(null, optionType);
            }, function(err){
                return cb(err, null);
            });
        },
        save: function(data, callback){ //POST
            var cb = callback || angular.noop;
            optionTypesResource.save(data, function(optionType){
                return cb(null, optionType);
            }, function(err){
                return cb(err, null);
            });
        },
        remove: function(data){ //DELETE
            return optionTypesResource.remove(data);
        },

        getOptionType: function(optionType, callback){

        },

        updatePosition: function(entry, callback){
            //entry: sorted ids = '3,1,2.4,5'
            var cb = callback || angular.noop;
            console.log(entry);
            $http.post('/admin/option_types/', entry)
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
        searchOptionTypes: function(conditions, callback){
            var cb = callback || angular.noop;
            console.log(conditions);
            $http.post('/admin/option_types/search', conditions)
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
