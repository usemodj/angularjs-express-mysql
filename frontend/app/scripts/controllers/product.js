'use strict';

angular.module('frontendApp')
.controller('ProductCtrl', ['$scope', '$state', '$stateParams', 'products', function ($scope, $state, $stateParams, products) {
    $scope.data = {};

    $scope.listProducts = function(){
        products.listProducts({},function(err, products){
            $scope.data.products = products;
        });
    };

    $scope.listProducts();
}])
.controller('ViewProductCtrl', ['$scope', '$state', '$stateParams', 'products', function ($scope, $state, $stateParams, products) {
    $scope.data = {};
    $scope.product = {
        quantity: 1
    };
    $scope.mainImage = '';

    products.viewProduct({id: $stateParams.id},function(err, data){
        $scope.data.product = data.product;
        $scope.data.variants = data.variants;
        $scope.data.assets = data.assets;
        $scope.product.shipment_cost = data.product.shipment_cost;
        if(data.assets) $scope.mainImage = '/uploads/images/'+ data.assets[0].file_path;
        if(data.variants) {
            $scope.product.variant = data.variants[0];
        }
        //console.log(data);
    });

    $scope.addToCart = function(){
        console.log($scope.product);
        products.addToCart($scope.product, function(err, data){

        $state.go('carts.list');
        });
    };

    $scope.viewImage = function(path){
        $scope.mainImage = '/uploads/images/' + path;
    };


}]);
