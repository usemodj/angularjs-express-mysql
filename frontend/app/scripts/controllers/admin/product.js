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
                console.log('>> data:'+ JSON.stringify(data));
                if(!err && err === null) {
                    $scope.data.products = data.products;
                    $scope.totalItems = data.count;
                    $scope.page = data.page;
                }
            });
        };


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
.controller('EditProductCtrl', ['$scope', '$state', '$stateParams', 'products', 'product',
    function ($scope, $state, $stateParams, products, product) {
        $scope.currentProduct = product;
        //$scope.roles = roles;
        $scope.page = $stateParams.page;

        $scope.updateProduct = function(){
            console.log('>> currentProduct:'+ JSON.stringify($scope.currentProduct));
            products.update($scope.currentProduct
              , function(product){
                 console.log('>> updated product:'+ JSON.stringify(product));
                }
              , function(err) {
                    console.log('>> changeRole error: ');
                    console.log(err);
            });
        };

        $scope.cancelEdit = function(){
            if($scope.currentProduct && $scope.currentProduct.$get){
                $scope.currentProduct.$get();
            }
            //$scope.currentUser = {};
            $state.go('admin.products.edit',{id: $scope.currentProduct.id});
        };

    }]);
