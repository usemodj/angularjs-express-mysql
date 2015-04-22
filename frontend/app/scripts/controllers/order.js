'use strict';

angular.module('frontendApp')
  .controller('OrderCtrl',['$scope','$state', '$stateParams', 'orders', function ($scope, $state, $stateParams, orders) {
    $scope.data = {};
    $scope.page = $stateParams.page || 1;

    $scope.getOrders = function(){
        orders.getOrders({page: $scope.page}, function(err, data){
            $scope.data.orders = data.orders;
            $scope.totalItems = data.count;
            //console.log(data);
        });
    };

    $scope.pageChanged = function() {
        $scope.getOrders();
    };

    $scope.selectPage = function(page){
        $scope.page = page;
        //$scope.getOrders();
        //console.log('click selectPage')
    };

    $scope.getOrders();
  }])
.controller('ViewOrderCtrl',['$scope','$state', '$stateParams', 'orders', function ($scope, $state, $stateParams, orders) {
    $scope.data = {};

    $scope.confirmOrder = function() {
      orders.confirmOrder({id: $stateParams.id}, function(err, data){
        if(err) $scope.error = err;
        else $scope.data.order = data;
      });
    };
    $scope.getOrder = function(){
        orders.get({id: $stateParams.id}, function(err, data){
            $scope.data.order = data;
            //console.log(data);
        });
    };

    $scope.getOrder();
}]);
