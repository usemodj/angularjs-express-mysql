'use strict';

angular.module('frontendApp')
    .factory('topics', ['$http', '$resource', function ($http, $resource) {

        var resource = $resource('/forums/:forum_id/topics/:id',{forum_id:'@forum_id', id:'@id'}, {update: {method: 'PUT'}});

        // Public API here
        return {
            index: function () { //GET
                return resource.query();
            },
            get: function (data, callback) { //GET
                var cb = callback || angular.noop;
                resource.get(data, function (topic) {
                    console.log(topic);
                    return cb(null, topic);
                }, function (err) {
                    return cb(err, null);
                });
            },
            update: function (data, callback) { //PUT
                var cb = callback || angular.noop;
                resource.update(data, function (topic) {
                    return cb(null, topic);
                }, function (err) {
                    return cb(err, null);
                });
            },
            save: function (data, callback) { //POST
                var cb = callback || angular.noop;
                resource.save(data, function (topic) {
                    return cb(null, topic);
                }, function (err) {
                    return cb(err, null);
                });
            },
            remove: function (data) { //DELETE
                return resource.remove(data);
            },
            searchTopics: function (conditions, callback) {
                var cb = callback || angular.noop;
                //console.log(conditions);
                $http.post('/forums/topics/search', conditions)
                    .success(function (data, status, headers, config) {
                        console.log('>> status:' + status);
                        return cb(null, data);
                    }).error(function (data, status, headers, config) {
                        console.log('>> error data:' + data);
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        return cb(status, data);
                    });
            },
            addTopic: function (conditions, callback) {
                var cb = callback || angular.noop;
                //console.log(conditions);
                $http.post('/forums/topics/add', conditions)
                    .success(function (data, status, headers, config) {
                        console.log('>> status:' + status);
                        return cb(null, data);
                    }).error(function (data, status, headers, config) {
                        console.log('>> error data:' + data);
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        return cb(status, data);
                    });
            },
            replyPost: function (conditions, callback) {
                var cb = callback || angular.noop;
                //console.log(conditions);
                $http.post('/forums/topics/reply', conditions)
                    .success(function (data, status, headers, config) {
                        console.log('>> status:' + status);
                        return cb(null, data);
                    }).error(function (data, status, headers, config) {
                        console.log('>> error data:' + data);
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        return cb(status, data);
                    });
            },
            deletePost: function (conditions, callback) {
                var cb = callback || angular.noop;
                //console.log(conditions);
                $http.post('/forums/topics/delete_post', conditions)
                    .success(function (data, status, headers, config) {
                        console.log('>> status:' + status);
                        return cb(null, data);
                    }).error(function (data, status, headers, config) {
                        console.log('>> error data:' + data);
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        return cb(status, data);
                    });
            },
            updatePost: function (post, callback) {
                var cb = callback || angular.noop;
                //console.log(conditions);
                $http.post('/forums/topics/post/', post)
                    .success(function (data, status, headers, config) {
                        console.log('>> status:' + status);
                        return cb(null, data);
                    }).error(function (data, status, headers, config) {
                        console.log('>> error data:' + data);
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        return cb(status, data);
                    });
            },
            setSticky: function (conditions, callback) {
                var cb = callback || angular.noop;
                //console.log(conditions);
                $http.post('/forums/topics/sticky', conditions)
                    .success(function (data, status, headers, config) {
                        console.log('>> status:' + status);
                        return cb(null, data);
                    }).error(function (data, status, headers, config) {
                        console.log('>> error data:' + data);
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        return cb(status, data);
                    });
            },
        };
    }]);
