'use strict';

/**
 * @ngdoc function
 * @name frontendApp.controller:TaxonTreeCtrl
 * @description
 * # TaxonTreeCtrl
 * Controller of the frontendApp
 */
angular.module('frontendApp')
  .controller('TaxonTreeCtrl', ['$scope','taxons', function ($scope, taxons) {
    $scope.data = {};
    $scope.taxonTree = function(){
      taxons.list(function(err, data){
        console.log(data);
        $scope.data.taxonTree = makeTree({q: data});
        console.log($scope.data.taxonTree);
      });
    };

    $scope.$watch( 'taxontree.currentNode', function( newObj, oldObj ) {
      if( $scope.taxontree && angular.isObject($scope.taxontree.currentNode) ) {
        console.log( 'Node Selected!!' );
        console.log( $scope.taxontree.currentNode );
        var taxon = $scope.taxontree.currentNode;
        //TODO: get taxon products
        //taxons.getProducts(taxon, function(err, products){
        //});
      }
    }, false);

    $scope.taxonTree();
  }]);
