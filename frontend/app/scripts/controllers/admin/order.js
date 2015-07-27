'use strict';

angular.module('frontendApp')
.controller('AdminOrderCtrl', ['$scope','$http','$state', '$stateParams', 'orders',
    function ($scope, $http, $state, $stateParams, orders) {
        $scope.page = $stateParams.page;
        $scope.data = {};
        $scope.conditions = {};

        $scope.pageChanged = function() {

            $scope.searchOrders();
            //$state.go('admin.user.home',{page: $scope.page});
            //$location.path('/users/page/'+$scope.page);
        };

        $scope.searchOrders = function(form){
            orders.searchOrders({
                from: $scope.conditions.from,
                to: $scope.conditions.to,
                number: $scope.conditions.number,
                name: $scope.conditions.name,
                completed: $scope.conditions.completed,
                state: $scope.conditions.state,
                email: $scope.conditions.email,
                page: $scope.page
            }, function(err, data){
                //console.log('>> data:'+ JSON.stringify(data));
                if(!err && err === null) {
                    $scope.data.orders = data.orders;
                    $scope.totalItems = data.count;
                    $scope.page = data.page;
                }
            });
        };

        $scope.searchOrders();
    }])
.controller('EditOrderCtrl', ['$scope', '$state', '$stateParams', 'orders',
    function ($scope, $state, $stateParams, orders) {
        $scope.error = '';
        $scope.message = '';
        $scope.data = {};

        orders.getOrderById($stateParams.id, function(err, data){
            if(!err) $scope.data.order = data;
            console.log($scope.data.order);
        });

        $scope.setPaid = function(){
          orders.setPaid({id: $scope.data.order.id}, function(err, data){
            if(err) $scope.error = err;
            $scope.data.order.payment_state = data.payment_state;
            $scope.data.order.shipment_state = data.shipment_state;
          });
        };

        $scope.setShipped = function(){
          orders.setShipped({id: $scope.data.order.id}, function(err, data){
            if(err) $scope.error = err;
            $scope.data.order.shipment_state = data.shipment_state;
          });
        };

        $scope.setOrderState = function(){
          if(!$scope.data.order.newState) return;
          orders.setOrderState({id: $scope.data.order.id, state: $scope.data.order.newState}, function(err, data){
            if(err) $scope.error = err;
            $scope.data.order.state = data.state;
          });
        };

      $scope.updateOrder = function(){
            //console.log('>> data.order:');
            //console.log($scope.data.order)
            orders.update($scope.data.order
                , function(err, order){
                    if(err){
                        $scope.error = err.data;
                        return;
                    }
                    //console.log('>> updated order:');
                    //console.log(order);
                });
        };

        $scope.cancelEdit = function(){
            if($scope.data.order && $scope.data.order.$get){
                $scope.data.order.$get();
            }
            //$scope.currentUser = {};
            $state.go('admin.orders.edit',{id: $scope.data.order.id});
        };

     }])
  .controller('StateChangeCtrl', ['$scope', '$state', '$stateParams', 'orders',
    function ($scope, $state, $stateParams, orders) {
      $scope.error = '';
      $scope.message = '';
      $scope.data = {};

      orders.getStateChanges($stateParams.id, function (err, data) {
        if (!err) $scope.data.order = data;
        console.log($scope.data.order);
      });

    }]);
