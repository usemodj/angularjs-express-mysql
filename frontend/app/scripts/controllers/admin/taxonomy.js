'use strict';

angular.module('frontendApp')
    .controller('AdminTaxonomyCtrl', ['$scope', '$filter', '$http','$state', '$stateParams', 'taxonomies',
        function ($scope, $filter, $http, $state, $stateParams, taxonomies) {
        var beforeSort = '';
        var sorted = false;

        $scope.data = {};
        $scope.newTaxonomy = {};

        $scope.sortableOptions = {
            change: function(e, ui) {
                //console.log("change");
                //console.log(ui);
                var entry = $scope.data.taxonomies.map(function(item){
                    return item.id;
                }).join(',');
                beforeSort = entry;
                //console.log('>>beforeSort:'+beforeSort);

            },
            // called after a node is dropped
            stop: function(e, ui) {
                //console.log("stop");
                var entry = $scope.data.taxonomies.map(function(item){
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

        $scope.updatePosition = function(entry){
            taxonomies.updatePosition({entry: entry}, function(err, data){

            });
        };

        $scope.searchTaxonomies = function(form){
            taxonomies.list(function(err, list){
              if(err){
                console.log(err);
                $scope.error = err;
                return;
              }
              console.log(list);
              $scope.data.taxonomies = list;
              $filter('orderBy')($scope.data.taxonomies, 'position', false);
            });
        };

        $scope.createTaxonomy = function(form){
            taxonomies.save($scope.newTaxonomy, function(err, data){
                if(err){
                    console.log(err);
                    $scope.error = err.data;
                    return;
                }
                $scope.data.taxonomies.unshift(data);
            });
        };

        $scope.deleteTaxonomy = function( taxonomy){
            taxonomies.remove({id:taxonomy.id});
            $scope.data.taxonomies.splice($scope.data.taxonomies.indexOf(taxonomy), 1);
        };

        $scope.searchTaxonomies();
    }])
.controller('EditTaxonomyCtrl', ['$scope', '$filter', '$state', '$stateParams', 'taxonomies',
    function ($scope, $filter, $state, $stateParams, taxonomies) {
//        console.log(
//            makeTree({ q:
//                [
//                    {"id": 123, "parent_id": 0, "name": "Mammals"},
//                    {"id": 456, "parent_id": 123, "name": "Dogs"},
//                    {"id": 214, "parent_id": 456, "name": "Labradors"},
//                    {"id": 810, "parent_id": 456, "name": "Pugs"},
//                    {"id": 919, "parent_id": 456, "name": "Terriers"}
//                ]
//            })
//        );

        $scope.error = '';
        $scope.message = '';
        //$scope.taxonomy = taxonomy;
        taxonomies.get({id: $stateParams.id}, function(err, data){
            $scope.taxonomy = data;
            if($scope.taxonomy.taxons) $scope.taxonomy.nodes = makeTree({q: $scope.taxonomy.taxons})
            console.log( $scope.taxonomy);
            //console.log($scope.taxonomy.nodes);
        });
        //$scope.taxonomy.nodes = makeTree({id:'id', q:$scope.taxonomy.taxons});
        //$filter('orderBy')($scope.optionType.optionValues, 'position', false);

        $scope.newSubItem = function(scope) {
            var nodeData = scope.$modelValue;
            console.log(scope);
            nodeData.children.push({
                id: nodeData.id * 10 + nodeData.children.length,
                name: nodeData.name + '.' + (nodeData.children.length + 1),
                children: []
            });

        };

        $scope.editItem = function(scope) {
            console.log(scope);
            scope.editing = true;
        };

        $scope.cancelEditingItem = function(scope) {
            scope.editing = false;
        };

        $scope.saveItem = function(scope) {
            scope.editing = false;
        };

        var getRootNodesScope = function() {
            return angular.element(document.getElementById("tree-root")).scope();
        };

        $scope.collapseAll = function() {
            var scope = getRootNodesScope();
            scope.collapseAll();
        };

        $scope.expandAll = function() {
            var scope = getRootNodesScope();
            scope.expandAll();
        };

        $scope.updateTaxonomy = function(form){
            $scope.taxonomy.taxons = visitor($scope.taxonomy.nodes);
//            for(var i = 0; i < $scope.taxonomy.taxons.length; i++){
//                delete $scope.taxonomy.taxons[i].children;
//            }
//
            //console.log('>> taxonomy:'+ JSON.stringify($scope.taxonomy));
            console.log($scope.taxonomy);
            taxonomies.update($scope.taxonomy
                , function(err, taxonomy){
                    if(err){
                        $scope.error = err.data;
                        return;
                    }
                    $scope.message = 'Taxonomy changed!';

                    $state.go('admin.products.taxonomies.edit',{id: $scope.taxonomy.id});
                });

        };

        $scope.updatePosition = function(entry){
            optionValues.updatePosition({entry: entry}, function(err, data){

            });
        };

        $scope.addOptionValue = function(){
            $scope.optionType.optionValues.unshift({name:'',presentation:'', position:0});
        };

        $scope.deleteOptionValue = function( optionValue){
            if(optionValue.id) optionValues.remove({id:optionValue.id});
            $scope.optionType.optionValues.splice($scope.optionType.optionValues.indexOf(optionValue), 1);
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
