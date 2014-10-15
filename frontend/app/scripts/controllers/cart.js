'use strict';

angular.module('frontendApp')
  .controller('CartCtrl', ['$scope', '$state', '$stateParams', 'orders', function ($scope, $state, $stateParams, orders) {
    $scope.orders = orders;
    $scope.data = {};

    $scope.cart = function(){
      orders.getCart(function(err, order){
          $scope.data.order = order;
          console.log(order);
      });
    };

    $scope.updateCart = function(){
        console.log($scope.data.order);
        orders.updateCart($scope.data.order, function(err, data){
            $scope.data.order = data;
            $state.go('carts.list', {}, {reload: true});
        });
    };

    $scope.deleteLineItem = function(item){
        $scope.data.order.line_items.splice($scope.data.order.line_items.indexOf(item), 1);
    };

    $scope.checkout = function(){
        console.log('>> checkout');
        orders.updateAddressState(function(err, data){
            $state.go('orders.address');
        });
    };

    $scope.cart();
  }]);
