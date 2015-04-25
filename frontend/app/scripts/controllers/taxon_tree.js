'use strict';

/**
 * @ngdoc function
 * @name frontendApp.controller:TaxonTreeCtrl
 * @description
 * # TaxonTreeCtrl
 * Controller of the frontendApp
 */
angular.module('frontendApp')
  .controller('TaxonTreeCtrl', ['$scope', '$state', '$stateParams','taxons', function ($scope, $state, $stateParams, taxons) {
    $scope.data = {};
    $scope.page = $stateParams.page;

    $scope.selectNode=function(val){
      //console.log(val);
      if( angular.isObject(val)){
        var taxon = val;
        $state.go('taxons.products', {id: taxon.id});
      }
    };

    $scope.$watch('taxontree.currentNode', function( newObj, oldObj ) {
      //console.log( 'Node Selected!!' );
      //console.log($scope.taxontree);
      if( $scope.taxontree && angular.isObject($scope.taxontree.currentNode) ) {
        //console.log( $scope.taxontree.currentNode );
        var taxon = $scope.taxontree.currentNode;
        $state.go('taxons.products', {id: taxon.id});
      }
    }, false);

    $scope.taxonTree = function(){
      taxons.list(function(err, data){
        if(!err && data){
          //console.log(data);
          $scope.data.taxonTree = makeTree({q: data});
          //console.log($scope.data.taxonTree);
        }
      });
    };

    $scope.taxonTree();
  }])
  .controller('TaxonCtrl', ['$scope', '$state', '$stateParams','taxons', function ($scope, $state, $stateParams, taxons) {
    $scope.data = {};
    $scope.conditions = {};
    $scope.page = $stateParams.page;
    $scope.taxonId = $stateParams.id;

    $scope.taxonProducts = function(){
      $scope.conditions.id = $scope.taxonId;
        $scope.conditions.page = $scope.page;
      taxons.getProducts($scope.conditions, function(err, data){
        if(!err){
          //console.log(data);
          $scope.data.products = data.products;
          $scope.totalItems = data.count;
          $scope.page = data.page;
        }
      });
    };

    $scope.pageChanged = function() {
      $scope.taxonProducts();
      //$state.go('admin.user.home',{page: $scope.page});
      //$location.path('/users/page/'+$scope.page);
    };

    $scope.taxonProducts();
  }]);
