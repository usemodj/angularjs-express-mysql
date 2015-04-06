'use strict';

angular.module('frontendApp')
    .controller('AdminProductCtrl', ['$scope','$http','$state', '$stateParams', 'products',
        function ($scope, $http, $state, $stateParams, products) {
        $scope.page = $stateParams.page;
        $scope.data = {};
        $scope.conditions = {};

        $scope.pageChanged = function() {

            $scope.searchProducts();
            //$state.go('admin.user.home',{page: $scope.page});
            //$location.path('/users/page/'+$scope.page);
        };

        $scope.searchProducts = function(form){
            products.searchProducts({
                name: $scope.conditions.name,
                sku: $scope.conditions.sku,
                deleted: $scope.conditions.deleted,
                page: $scope.page
            }, function(err, data){
                //console.log('>> data:'+ JSON.stringify(data));
                if(!err && err === null) {
                    $scope.data.products = data.products;
                    $scope.totalItems = data.count;
                    $scope.page = data.page;
                }
            });
        };

        $scope.deleteProduct = function(item){
            products.remove({id: item.id});
            $scope.data.products.splice($scope.data.products.indexOf(item), 1);
        }
//        $scope.searchProducts = function(){
//            $http.post('/admin/products/page/'+$scope.page,{
//                name: $scope.conditions.name,
//                sku: $scope.conditions.sku,
//                deleted: $scope.conditions.deleted
//            }).success(function(data, status, headers, config){
//                console.log('>> status:'+ status);
//                $scope.data.products = data.products;
//                $scope.totalItems = data.count;
//                $scope.page = data.page;
//            }).error(function(data, status, headers, config) {
//                console.log('>> status:'+ status);
//            });
//        };

        $scope.searchProducts();
}])
.controller('EditProductCtrl', ['$scope', '$state', '$stateParams', '$window', 'products',
        'optionTypes', "taxons", 'product','optionTypesData', 'taxonsData',
    function ($scope, $state, $stateParams, $window, products, optionTypes, taxons, product, optionTypesData, taxonsData) {
        $scope.error = '';
        $scope.message = '';

        $scope.option_types = optionTypesData; //optionTypes.index();
        $scope.taxons = taxonsData; //taxons.index();
        $scope.page = $stateParams.page;

        $scope.showSomeHelp = function showSomeHelp() {
            // this is what the default will do
            $window.open("http://daringfireball.net/projects/markdown/syntax", "_blank");
        };

        products.get({id: $stateParams.id}, function(err, data){
            $scope.currentProduct = data;
            //console.log($scope.currentProduct.taxons);
            if($scope.currentProduct.option_types){
                $scope.currentProduct.option_type_ids = $scope.currentProduct.option_types.map(function(item){
                    return item.id;
                });
            }
            if($scope.currentProduct.taxons){
                $scope.currentProduct.taxon_ids = $scope.currentProduct.taxons.map(function(item){
                   return item.id;
                });
            }
        });


        $scope.updateProduct = function(){
            //console.log('>> currentProduct:');
            //console.log($scope.currentProduct)
            products.update($scope.currentProduct
              , function(err, product){
                 if(err){
                     $scope.error = err.data;
                     return;
                 }
                 //console.log('>> updated product:');
                 //console.log(product);
                $scope.message = 'Updated successfully!';
              });
        };

        $scope.cancelEdit = function(){
            if($scope.currentProduct && $scope.currentProduct.$get){
                $scope.currentProduct.$get();
            }
            //$scope.currentUser = {};
            $state.go('admin.products.edit',{id: $scope.currentProduct.id});
        };

        $scope.getOptionTypes = function(){
            $scope.option_types = optionTypes.index();
        };
    }])
.controller('CloneProductCtrl', ['$scope', '$state', '$stateParams', 'products',
    'optionTypes', "taxons", 'product','optionTypesData', 'taxonsData',
    function ($scope, $state, $stateParams, products, optionTypes, taxons, product, optionTypesData, taxonsData) {
        $scope.error = '';
        $scope.message = '';
        $scope.currentProduct = {};
        $scope.option_types = optionTypesData; //optionTypes.index();
        $scope.taxons = taxonsData; //taxons.index();
        $scope.page = $stateParams.page;

        products.get({id: $stateParams.id}, function(err, data){
            $scope.currentProduct = data;
            $scope.currentProduct.name = 'Copy of '+ data.name;
            $scope.currentProduct.slug = 'copy-of-'+ data.slug;
            //console.log($scope.currentProduct);
            if($scope.currentProduct.option_types){
                $scope.currentProduct.option_type_ids = $scope.currentProduct.option_types.map(function(item){
                    return item.id;
                });
            }
            if($scope.currentProduct.taxons){
                $scope.currentProduct.taxon_ids = $scope.currentProduct.taxons.map(function(item){
                    return item.id;
                });
            }
        });


        $scope.createProduct = function(form){
            $scope.currentProduct.id = null;
            //console.log($scope.currentProduct);
            products.createClone($scope.currentProduct, function(err, product){
                if(err) {
                    $scope.error = err.data;
                    return;
                } else {
                    console.log(product);
                    $scope.message = 'Product Created!';
                    $state.go('admin.products.edit',{id: product.id});
                }
            });
        };


        $scope.cancelEdit = function(){
            if($scope.currentProduct && $scope.currentProduct.$get){
                $scope.currentProduct.$get();
            }
            //$scope.currentUser = {};
            $state.go('admin.products.edit',{id: $scope.currentProduct.id});
        };

        $scope.getOptionTypes = function(){
            $scope.option_types = optionTypes.index();
        };
    }])
.controller('NewProductCtrl', ['$scope', '$state', '$stateParams', 'products',
    'variants',
    function ($scope, $state, $stateParams, products, variants) {
        $scope.error = '';
        $scope.message = '';
        $scope.newProduct = {};

        $scope.createProduct = function(form){
          products.save($scope.newProduct, function(err, product){
              if(err) {
                  $scope.error = err.data;
                  return;
              } else {
                  console.log(product);
                  $scope.message = 'Product Created!';
                  $state.go('admin.products.edit',{id: product.id});
              }
          });
        };

        $scope.cancelEdit = function(){
            if($scope.newProduct && $scope.newProduct.$get){
                $scope.newProduct.$get();
            }
            $scope.newProduct = {};
            $state.go('admin.products.new');
        };

    }]);
