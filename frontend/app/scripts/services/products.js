'use strict';

angular.module('frontendApp')
  .factory('products', ['$http', '$resource', function ($http, $resource) {
    // Service logic
    // ...

    var productsResource = $resource('/admin/products/:id',{id:'@id'}, {update: {method: 'PUT'}});

    // Public API here
    return {

      index: function () {
        return productsResource.query();
      },
        get: function(data, callback){ //GET
            var cb = callback || angular.noop;
            productsResource.get(data, function(data){
                return cb(null, data);
            }, function(err){
                return cb(err, null);
            });
        },
        update: function(data, callback){ //PUT
            var cb = callback || angular.noop;
            productsResource.update(data, function( product){
                return cb(null, product);
            }, function(err){
                return cb(err, null);
            });
        },
        save: function(data, callback){ //POST
            var cb = callback || angular.noop;
            productsResource.save(data, function(product){
                return cb(null, product);
            }, function(err){
                return cb(err, null);
            });
        },
      remove: function(data){//DELETE
          return productsResource.remove(data);
      },
      searchProducts: function(conditions, callback){
          var cb = callback || angular.noop;
          //console.log(conditions);
          $http.post('/admin/products/page/'+conditions.page, conditions)
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
      createClone: function(data, callback){
        var cb = callback || angular.noop;
        $http.post('/admin/products/create_clone', data)
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
      listProducts: function(data, callback){
          var cb = callback || angular.noop;
          $http.post('/products/list', data)
              .success(function(data, status, headers, config){
                  //console.log('>> status:'+ status);
                  return cb(null, data);
              }).error(function(data, status, headers, config) {
                  //console.log(data);
                  //console.log(status);
                  // called asynchronously if an error occurs
                  // or server returns response with an error status.
                  return cb(status, data);
              });
      },
      viewProduct: function(data, callback){
          var cb = callback || angular.noop;
          $http.get('/products/'+ data.id)
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
      addToCart: function(data, callback){
          var cb = callback || angular.noop;
          $http.post('/carts/', data)
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
