'use strict';

angular.module('frontendApp')
  .factory('products', ['$http', '$resource', function ($http, $resource) {
    // Service logic
    // ...

    var productsResource = $resource('/products/:id',{id:'@id'}, {update: {method: 'PUT'}});

    // Public API here
    return {

      index: function () {
        return productsResource.query();
      },
      get: function(data){
          return productsResource.get(data);
      },
      update: function(data){
          return productsResource.update(data);
      },
      save: function(data){
          return productsResource.save(data);
      },
      remove: function(data){
          return productsResource.remove(data);
      },
      searchProducts: function(conditions, callback){
          var cb = callback || angular.noop;
          console.log(conditions);
          $http.post('/admin/products/page/'+conditions.page, conditions)
          .success(function(data, status, headers, config){
              console.log('>> status:'+ status);
              return cb(null, data);
          }).error(function(data, status, headers, config) {
              console.log('>> error data:'+ data);
                  // called asynchronously if an error occurs
              // or server returns response with an error status.
              return cb(status, data);
          });
      }

    };
  }]);
