'use strict';

angular.module('frontendApp')
  .controller('PaymentCtrl', ['$scope','$state', 'payments', 'orders', function ($scope, $state, payments, orders) {
    $scope.payment = {};

    $scope.getPaymentMethods = function(){
        payments.getPaymentMethods(function(err, data){
            $scope.payment_methods = data;
            $scope.payment.payment_method = data[0];
            //console.log(data);
        });
    };

    $scope.savePayment = function(){
        orders.savePayment($scope.payment, function(err, order){
            if(!err){
                $state.go('orders.view', {id: order.id});
            } else {
                console.log(err);
            }
        });
    };

    $scope.getPaymentMethods();
  }]);
