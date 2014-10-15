'use strict';

angular.module('frontendApp')
.controller('AdminPaymentMethodCtrl', ['$scope', '$filter', '$http','$state', '$stateParams', 'paymentMethods',
    function ($scope, $filter, $http, $state, $stateParams, paymentMethods) {
        var beforeSort = '';
        var sorted = false;

        $scope.data = {};
        $scope.newPaymentMethod = {active: true};

        $scope.sortableOptions = {
            change: function(e, ui) {
                //console.log("change");
                //console.log(ui);
                var entry = $scope.data.paymentMethods.map(function(item){
                    return item.id;
                }).join(',');
                beforeSort = entry;
                //console.log('>>beforeSort:'+beforeSort);

            },
            // called after a node is dropped
            stop: function(e, ui) {
                //console.log("stop");

                var entry = $scope.data.paymentMethods.map(function(item){
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

        $scope.createPaymentMethod = function(form){
            paymentMethods.save($scope.newPaymentMethod, function(err, paymentMethod){
                if(err){
                    console.log(err);
                    $scope.error = err.data;
                    return;
                }
                $scope.data.paymentMethods.unshift(paymentMethod);
            });
        };

        $scope.updatePosition = function(entry){
            paymentMethods.updatePosition({entry: entry}, function(err, data){

            });
        };

        $scope.deletePaymentMethod = function( paymentMethod){
            paymentMethods.remove({id:paymentMethod.id});
            $scope.data.paymentMethods.splice($scope.data.paymentMethods.indexOf(paymentMethod), 1);
        };

        $scope.searchPaymentMethods = function(form){
            $scope.data.paymentMethods = paymentMethods.index();
            $filter('orderBy')($scope.data.paymentMethods, 'position', false);
        };

        $scope.searchPaymentMethods();
    }])

.controller('EditPaymentMethodCtrl', ['$scope', '$filter', '$state', '$stateParams', 'paymentMethods', 'paymentMethod',
    function ($scope, $filter, $state, $stateParams, paymentMethods, paymentMethod) {
        var beforeSort = '';
        var sorted = false;
        $scope.error = '';
        $scope.message = '';
        $scope.paymentMethod = paymentMethod;

        $scope.updatePaymentMethod = function(form){
            //console.log('>> paymentMethod:'+ JSON.stringify($scope.paymentMethod));
            paymentMethods.update($scope.paymentMethod
                , function(err, data){
                    if(err){
                        $scope.error = err.data;
                        return;
                    }
                    $scope.message = 'Payment Method changed!';

                    $state.go('admin.products.payment_methods.list');
                });

        };

    }]);
