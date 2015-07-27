'use strict';

angular.module('frontendApp')
.controller('AdminVariantCtrl', ['$scope', '$filter', '$http','$state', '$stateParams', 'variants', 'products',
    function ($scope, $filter, $http, $state, $stateParams, variants, products) {
        var beforeSort = '';
        var sorted = false;
        $scope.error = '';
        $scope.message = '';

        $scope.deleted = false;
        $scope.data = {};
        $scope.newVariant = {
            option_values:{}
        };

        products.get({id: $stateParams.product_id}, function(err, product){
          if(!err) {
            //console.log('>>product:')
            //console.log(product);
            $scope.data.product = product;
          }
        });

        $scope.sortableOptions = {
            change: function(e, ui) {
                var entry = $scope.data.variants.map(function(item){
                    return item.id;
                }).join(',');
                beforeSort = entry;
            },
            // called after a node is dropped
            stop: function(e, ui) {
                var entry = $scope.data.variants.map(function(item){
                    return item.id;
                }).join(',');
                sorted = entry != beforeSort;
                // IF sorted == true, updatePosition()
                if(sorted){
                    $scope.updatePosition(entry);
                }
            }
        };

        $scope.showVariants = function(deleted){
            $scope.deleted = deleted;
            $scope.searchVariants(deleted);
        };

        $scope.updatePosition = function(entry){
            variants.updatePosition({entry: entry}, function(err, data){

            });
        };

        $scope.searchVariants = function(deleted){
            variants.searchVariants({product_id: $stateParams.product_id, deleted: deleted}, function(err, data){
                $scope.data.variants = data;
                //$filter('orderBy')($scope.data.variants, 'position', false);
            });

        };

        $scope.createVariant = function(form){
            $scope.newVariant.product_id = $stateParams.product_id;
            //console.log(form);
            //console.log($scope.newVariant);
            variants.save($scope.newVariant, function(err, variant){
                if(err){
                    //console.log(err);
                    $scope.error = err.data;
                    return;
                }
                //$state.reload();
                //$state.go('.', {search: true});
                $state.go('admin.products.variants.list',{product_id: variant.product_id}, {reload: true});
                //$state.transitionTo($state.current, $stateParams, { reload: true, inherit: false, notify: true });
            });
        };

        $scope.deleteVariant = function( variant){
            variants.remove({id:variant.id});
            $scope.data.variants.splice($scope.data.variants.indexOf(variant), 1);
        };

        $scope.searchVariants($scope.deleted);
    }])
    .controller('EditVariantCtrl', ['$scope', '$filter', '$state', '$stateParams', 'variants', 'products',
        function ($scope, $filter, $state, $stateParams, variants, products) {
            var beforeSort = '';
            var sorted = false;
            $scope.error = '';
            $scope.message = '';
            $scope.data = {};
            $scope.variant = {
                options: {}
            };

            variants.get({id: $stateParams.id}, function(err, data){
                $scope.variant = data;
                $scope.variant.options = {};

                var optionValues = data.option_values;
                if(optionValues) {
                    for (var i = 0; i < optionValues.length; i++) {
                        $scope.variant.options[optionValues[i].option_type_id] = optionValues[i].id;
                    }
                }

                //console.log('>>variant:');
                //console.log($scope.variant);
            });

            products.get({id: $stateParams.product_id}, function(err, product){
                $scope.data.product = product;
            });
            //$filter('orderBy')($scope.optionType.optionValues, 'position', false);
            //console.log($scope.optionType.optionValues);

            $scope.updatePosition = function(entry){
                optionValues.updatePosition({entry: entry}, function(err, data){

                });
            };


            $scope.updateVariant = function(form){
                //console.log($scope.variant);
                variants.update($scope.variant
                    , function(err, variant){
                        if(err){
                            $scope.error = err.data;
                            return;
                        }
                        $scope.message = 'Variant changed!';

                        $state.go('admin.products.variants.list',{product_id: $stateParams.product_id});
                    });

            };
        }]);
