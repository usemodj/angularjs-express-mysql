'use strict';

/**
 * @ngdoc service
 * @name frontendApp.articles
 * @description
 * # articles
 * Factory in the frontendApp.
 */
angular.module('frontendApp')
  .factory('articles', ['$http', '$resource', function ($http, $resource) {

    var resource = $resource('/articles/:id',{id:'@id'}, {update: {method: 'PUT'}});

    // Public API here
    return {
      index: function () { //GET
        return resource.query();
      },
      get: function (data, callback) { //GET
        var cb = callback || angular.noop;
        resource.get(data, function (article) {
          //console.log(article);
          return cb(null, article);
        }, function (err) {
          return cb(err);
        });
      },
      update: function (data, callback) { //PUT
        var cb = callback || angular.noop;
        resource.update(data, function (article) {
          return cb(null, article);
        }, function (err) {
          return cb(err);
        });
      },
      save: function (data, callback) { //POST
        var cb = callback || angular.noop;
        resource.save(data, function (article) {
          return cb(null, article);
        }, function (err) {
          return cb(err);
        });
      },
      remove: function (data, callback) { //DELETE
        var cb = callback || angular.noop;
        return resource.remove(data, function(article){
          return cb(null, article);
        }, function(err){
          return cb(err);
        });
      },
      searchArticles: function (conditions, callback) {
        var cb = callback || angular.noop;
        //console.log(conditions);
        $http.post('/articles/search', conditions)
          .success(function (data, status, headers, config) {
            console.log('>> status:' + status);
            return cb(null, data);
          }).error(function (data, status, headers, config) {
            console.log('>> error data:' + data);
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            return cb(status, data);
          });
      }
    };
  }]);
