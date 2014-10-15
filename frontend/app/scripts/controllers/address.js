'use strict';

angular.module('frontendApp')
  .controller('AddressCtrl', ['$scope','$state', 'orders', function ($scope, $state, orders) {
    $scope.order = {};

    $scope.useBillingAddress = function(){
        console.log($scope.order);
        if($scope.order.use_bill_address){
            $scope.order.ship_address = angular.copy($scope.order.bill_address);
        } else {
            $scope.order.ship_address = {};
        }
    };

    $scope.saveAddress = function(){
        orders.saveAddress($scope.order, function(err, data){
            $state.go('orders.delivery');
        });
    }

    $scope.getOrder = function(){
        orders.getOrder(function(err, data){
           $scope.order = data;
            console.log(data);
        });

    };

    $scope.getOrder();
  }]);
