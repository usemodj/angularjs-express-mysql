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
    'optionTypes', "taxons", 'product','optionTypesData', 'taxonsData',
    function ($scope, $state, $stateParams, orders, optionTypes, taxons, product, optionTypesData, taxonsData) {
        $scope.error = '';
        $scope.message = '';

        $scope.option_types = optionTypesData; //optionTypes.index();
        $scope.taxons = taxonsData; //taxons.index();
        $scope.page = $stateParams.page;

        orders.get({id: $stateParams.id}, function(err, data){
            $scope.currentOrder = data;
            //console.log($scope.currentOrder.taxons);
            if($scope.currentOrder.option_types){
                $scope.currentOrder.option_type_ids = $scope.currentOrder.option_types.map(function(item){
                    return item.id;
                });
            }
            if($scope.currentOrder.taxons){
                $scope.currentOrder.taxon_ids = $scope.currentOrder.taxons.map(function(item){
                    return item.id;
                });
            }
        });


        $scope.updateOrder = function(){
            //console.log('>> currentOrder:');
            //console.log($scope.currentOrder)
            orders.update($scope.currentOrder
                , function(err, product){
                    if(err){
                        $scope.error = err.data;
                        return;
                    }
                    //console.log('>> updated product:');
                    //console.log(product);
                });
        };

        $scope.cancelEdit = function(){
            if($scope.currentOrder && $scope.currentOrder.$get){
                $scope.currentOrder.$get();
            }
            //$scope.currentUser = {};
            $state.go('admin.orders.edit',{id: $scope.currentOrder.id});
        };

        $scope.getOptionTypes = function(){
            $scope.option_types = optionTypes.index();
        };
    }])
