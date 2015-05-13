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
.controller('ViewOrderCtrl',['$scope','$state', '$stateParams', '$modal', '$window', 'orders', function ($scope, $state, $stateParams, $modal, $window, orders) {
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

    $scope.payNow = function(form){
      //console.log($scope.data.order);
      var modalInstance = $modal.open({
        templateUrl: 'views/partials/orders/orders.paygate.html',
        controller: 'EditPaymentCtrl',
        windowClass: 'center-modal',
        resolve: {
          order: function(){
            return $scope.data.order;
          }
        }
      });
      modalInstance.result.then(function(editedPayment){
        console.log(editedPayment);
        updatePayment(editedPayment);
      }, function(){
        //console.log('cancel');

        $state.go('orders.view',{id: $stateParams.id}, {reload: true});
      });
    };

    var updatePayment = function(payment){

      orders.updatePayment(payment, function(err, data){
        if(err) $scope.error = err;
        $state.go('orders.view',{id: $stateParams.id}, {reload: true});
      });
    };

    $scope.getOrder();
}])
.controller('EditPaymentCtrl', ['$scope', '$state', '$modalInstance', 'order', function ($scope, $state, $modalInstance, order) {
  $scope.order = order;

  $scope.save = function(){
    $scope.payment = {
      order_id: $scope.order.id,
      amount: $scope.unitprice,
      identifier: $scope.cardauthcode,
      cvv_response_code: $scope.replycode,
      cvv_response_message: $scope.replyMsg
    };
    $modalInstance.close($scope.payment);
  };

  $scope.cancel = function(){
    $scope.payment = {};
    $modalInstance.dismiss('cancel');
  };

}]);
