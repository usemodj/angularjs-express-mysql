'use strict';

angular.module('frontendApp')
.controller('AdminOptionTypeCtrl', ['$scope', '$filter', '$http','$state', '$stateParams', 'optionTypes',
    function ($scope, $filter, $http, $state, $stateParams, optionTypes) {
    var beforeSort = '';
    var sorted = false;

    $scope.data = {};
    $scope.newOptionType = {};

    $scope.sortableOptions = {
        change: function(e, ui) {
            var entry = $scope.data.optionTypes.map(function(item){
                return item.id;
            }).join(',');
            beforeSort = entry;
        },
        // called after a node is dropped
        stop: function(e, ui) {
            var entry = $scope.data.optionTypes.map(function(item){
                return item.id;
            }).join(',');
            sorted = entry != beforeSort;
           // IF sorted == true, updatePosition()
            if(sorted){
                $scope.updatePosition(entry);
            }
        }
    };

    $scope.updatePosition = function(entry){
        optionTypes.updatePosition({entry: entry}, function(err, data){

        });
    };

    $scope.searchOptionTypes = function(form){
        $scope.data.optionTypes = optionTypes.index();
      $scope.optionTypes = $filter('orderBy')($scope.data.optionTypes, 'position', false);
//            optionTypes.index( function(err, data){
//                console.log('>> data:'+ JSON.stringify(data));
//                if(!err && err === null) {
//                    $scope.data.optionTypes = data.optionTypes;
//                }
//            });
    };

    $scope.createOptionType = function(form){
        optionTypes.save($scope.newOptionType, function(err, opType){
            if(err){
                //console.log(err);
                $scope.error = err.data;
                return;
            }
            $state.go('admin.products.option_types.edit',{id: opType.id});
        });
    };

    $scope.deleteOptionType = function( optionType){
        optionTypes.remove({id:optionType.id});
        $scope.data.optionTypes.splice($scope.data.optionTypes.indexOf(optionType), 1);
    };

    $scope.searchOptionTypes();
}])
.controller('EditOptionTypeCtrl', ['$scope', '$filter', '$state', '$stateParams', 'optionTypes', 'optionValues', 'optionType',
    function ($scope, $filter, $state, $stateParams, optionTypes, optionValues, optionType) {
    var beforeSort = '';
    var sorted = false;
    $scope.error = '';
    $scope.message = '';
    //$scope.optionType = optionType;
    optionTypes.get({id: $stateParams.id}, function(err, optionType){
        if(err) console.log(err);
        //console.log(optionType);
        $scope.optionType = optionType;

        if($scope.optionType.option_values){
            $scope.optionType.option_values = $filter('orderBy')($scope.optionType.option_values, 'position');
//            $scope.optionType['option_values'].sort(function(a, b){
//                return a.position - b.position;
//            });
        }
    });

//    console.log($scope.optionType.option_values);

    $scope.sortableOptions = {
        change: function(e, ui) {
            //console.log("change");
            //console.log(ui);
            var entry = $scope.optionType.option_values.map(function(item){
                return item.id;
            }).join(',');
            beforeSort = entry;
            //console.log('>>beforeSort:'+beforeSort);

        },
        // called after a node is dropped
        stop: function(e, ui) {
            //console.log("stop");

            var entry = $scope.optionType.option_values.map(function(item){
                return item.id;
            }).join(',');
            sorted = entry != beforeSort;
//            console.log('>>beforeSort:'+ beforeSort);
//            console.log('>>entry:'+ entry);
//            console.log('>>sorted:'+ sorted);
            //IF sorted == true, updatePosition()
            if(sorted){
                //$scope.updatePosition(entry);
            }
        }
    };

    $scope.updatePosition = function(entry){
        optionValues.updatePosition({entry: entry}, function(err, data){

        });
    };

    $scope.addOptionValue = function(){
        $scope.optionType.option_values.unshift({name:'',presentation:'', position:0});
    };

    $scope.deleteOptionValue = function( optionValue){
        if(optionValue.id) optionValues.remove({id:optionValue.id});
        $scope.optionType.option_values.splice($scope.optionType.option_values.indexOf(optionValue), 1);
    };

    $scope.updateOptionType = function(form){
        //console.log('>> optionType:'+ JSON.stringify($scope.optionType));
        optionTypes.update($scope.optionType
            , function(err, optionType){
                if(err){
                    $scope.error = err.data;
                    return;
                }
                $scope.message = 'Option type changed!';
                changeOptionValues($scope.optionType);

                $state.go('admin.products.option_types.edit',{id: $scope.optionType.id});
           });

    };

    var changeOptionValues = function( optionType){
        optionValues.changeOptionValues(optionType, function(err, data){
            if(err){
                $scope.error = err.data;
                return;
            }
            $scope.message = 'Option value changed!';

            $state.go('admin.products.option_types.edit',{id:optionType.id});
        });
    }
}]);
