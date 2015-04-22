'use strict';

angular.module('frontendApp')
.controller('AdminShippingMethodCtrl', ['$scope', '$filter', '$http','$state', '$stateParams', 'shippingMethods',
    function ($scope, $filter, $http, $state, $stateParams, shippingMethods) {
    var beforeSort = '';
    var sorted = false;

    $scope.data = {};
    $scope.newShippingMethod = {};

    $scope.sortableOptions = {
        change: function(e, ui) {
            //console.log("change");
            //console.log(ui);
            var entry = $scope.data.shippingMethods.map(function(item){
                return item.id;
            }).join(',');
            beforeSort = entry;
            //console.log('>>beforeSort:'+beforeSort);

        },
        // called after a node is dropped
        stop: function(e, ui) {
            //console.log("stop");

            var entry = $scope.data.shippingMethods.map(function(item){
                return item.id;
            }).join(',');
            sorted = entry != beforeSort;
            //console.log('>>beforeSort:'+ beforeSort);
            //console.log('>>entry:'+ entry);
            //console.log('>>sorted:'+ sorted);
            // IF sorted == true, updatePosition()
            if(sorted){
                $scope.updatePosition(entry);
            }
        }
    };

    $scope.createShippingMethod = function(form){
        shippingMethods.save($scope.newShippingMethod, function(err, shippingMethod){
            if(err){
                //console.log(err);
                $scope.error = err.data;
                return;
            }
            $scope.data.shippingMethods.unshift(shippingMethod);
        });
    };

    $scope.updatePosition = function(entry){
        shippingMethods.updatePosition({entry: entry}, function(err, data){

        });
    };

    $scope.deleteShippingMethod = function( shippingMethod){
        shippingMethods.remove({id:shippingMethod.id});
        $scope.data.shippingMethods.splice($scope.data.shippingMethods.indexOf(shippingMethod), 1);
    };

    $scope.searchShippingMethods = function(form){
        $scope.data.shippingMethods = shippingMethods.index();
        $filter('orderBy')($scope.data.shippingMethods, 'position', false);
    };

        $scope.searchShippingMethods();
}])

.controller('EditShippingMethodCtrl', ['$scope', '$filter', '$state', '$stateParams', 'shippingMethods', 'shippingMethod',
    function ($scope, $filter, $state, $stateParams, shippingMethods, shippingMethod) {
        var beforeSort = '';
        var sorted = false;
        $scope.error = '';
        $scope.message = '';
        $scope.shippingMethod = shippingMethod;

        $scope.updateShippingMethod = function(form){
            //console.log('>> shippingMethod:'+ JSON.stringify($scope.shippingMethod));
            shippingMethods.update($scope.shippingMethod
                , function(err, data){
                    if(err){
                        $scope.error = err.data;
                        return;
                    }
                    $scope.message = 'Shipping Method changed!';

                    $state.go('admin.products.shipping_methods.list');
                });

        };

    }]);
