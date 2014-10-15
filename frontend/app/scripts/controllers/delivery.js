'use strict';

angular.module('frontendApp')
.controller('DeliveryCtrl', ['$scope','$state', 'orders', 'shipments','shippingMethods', function ($scope, $state, orders, shipments, shippingMethods) {
    $scope.data = {};
    $scope.data.shipping_methods = shippingMethods.index();

    orders.getOrder(function(err, order){
        shipments.getByOrderId({order_id: order.id}, function(err, shipment){
            $scope.shipment = shipment;
            //console.log(shipment);

        });
    });

    $scope.saveShipment = function(){
        orders.saveShipment($scope.shipment, function(err, data){
            if(!err) {
                $state.go('orders.payment');
            } else {
                console.log(err);
            }
        });
    }

}]);
