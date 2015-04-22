'use strict';

/**
 * @ngdoc function
 * @name frontendApp.controller:UploadCtrl
 * @description
 * # UploadCtrl
 * Controller of the frontendApp
 */
angular.module('frontendApp')
.controller('UploadCtrl',  [ '$scope', '$http', '$timeout', '$upload', '$state', '$stateParams', 'assets', function($scope, $http, $timeout, $upload, $state, $stateParams, assets) {
    $scope.data ={};
    $scope.asset = {

    };

    $scope.init = function(viewable_type){
        $scope.asset.viewable_type = viewable_type;

    };

    assets.getAsset({product_id: $stateParams.product_id, id: $stateParams.id}, function(err, data){
        $scope.data.product = data.product;
        $scope.asset = data.asset;
        $scope.asset.variants = [];
        for(var i = 0; i < data.product.variants.length; i++){
            (data.product.variants[i].is_master == true)?
                $scope.asset.master_variant = data.product.variants[i] :
                $scope.asset.variants.push( data.product.variants[i]);
        }
        //console.log($scope.asset);
    });

    $scope.uploadFile = function() {
        $scope.progress = 0;
        $scope.error = null;
        //console.log('>>selectedFiles:');
        //console.log($scope.selectedFiles);
        $scope.upload = $upload.upload({
            url: '/admin/products/'+$stateParams.product_id + '/assets/'+ $stateParams.id,
            method: 'POST',
            //headers: {'my-header': 'my-header-value'},
            data : {
                asset : $scope.asset
            },
            file: ($scope.selectedFiles != null)? $scope.selectedFiles[0]: null,
            fileFormDataName: 'file'
        });
        $scope.upload.then(function(response) {//resolve
            $timeout(function() {
                //console.log(response);
                $scope.uploadResult = response.data;
            });
            //$state.go('admin.products.assets.list',{product_id: $stateParams.product_id}, {reload:true});
        }, function(response) { //reject
            if (response.status > 0) $scope.error = response.status + ': ' + response.data;
        }, function(evt) {//notify
            // Math.min is to fix IE which reports 200% sometimes
            $scope.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
        });
        $scope.upload.xhr(function(xhr){
            //xhr.upload.addEventListener('abort', function() {console.log('abort complete')}, false);
        });
    };

    $scope.onFileSelect = function($files) {
        $scope.selectedFiles = null;
        $scope.progress = 0;
        $scope.upload = null;
        $scope.uploadResult = null;
        $scope.selectedFiles = $files;

        $scope.dataUrls = null;
        if (  $files.length > 0) {
            var $file = $files[0];
            if ($scope.fileReaderSupported && $file.type.indexOf('image') > -1) {
                var fileReader = new FileReader();
                fileReader.readAsDataURL($file);
                var loadFile = function(fileReader, index) {
                    fileReader.onload = function(e) {
                        $timeout(function() {
                            $scope.dataUrls = e.target.result;
                        });
                    }
                }(fileReader, 0);
            }
            $scope.progress = -1;
        }
    };

}]);
