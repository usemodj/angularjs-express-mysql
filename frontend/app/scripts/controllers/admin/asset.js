'use strict';

angular.module('frontendApp')
  .controller('AdminAssetCtrl',  [ '$scope', '$http', '$timeout', '$upload', '$state', '$stateParams','$location', '$filter', 'assets',
        function($scope, $http, $timeout, $upload, $state, $stateParams, $location, $filter, assets) {
        $scope.fileReaderSupported = window.FileReader != null && (window.FileAPI == null || FileAPI.html5 != false);
        $scope.error = '';
        $scope.message = '';
        $scope.data = {};
        $scope.asset = {
            master_variant: {},
            variants: []
        };

        $scope.product_id = $stateParams.product_id;

        var beforeSort = '';
        var sorted = false;

        $scope.sortableOptions = {
            change: function(e, ui) {
                //console.log("change");

                var entry = $scope.data.assets.map(function(item){
                    return item.id;
                }).join(',');
                beforeSort = entry;
                //console.log('>>beforeSort:'+beforeSort);

            },
            // called after a node is dropped
            stop: function(e, ui) {
                //console.log("stop");

                var entry = $scope.data.assets.map(function(item){
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
            assets.updatePosition({entry: entry}, function(err, data){

            });
        };

        $scope.onFileSelect = function($files) {
            $scope.selectedFiles = [];
            $scope.progress = [];
            if ($scope.upload && $scope.upload.length > 0) {
                for (var i = 0; i < $scope.upload.length; i++) {
                    if ($scope.upload[i] != null) {
                        $scope.upload[i].abort();
                    }
                }
            }
            $scope.upload = [];
            $scope.uploadResult = [];
            $scope.selectedFiles = $files;

            $scope.dataUrls = [];
            for ( var i = 0; i < $files.length; i++) {
                var $file = $files[i];
                if ($scope.fileReaderSupported && $file.type.indexOf('image') > -1) {
                    var fileReader = new FileReader();
                    fileReader.readAsDataURL($files[i]);
                    var loadFile = function(fileReader, index) {
                        fileReader.onload = function(e) {
                            $timeout(function() {
                                $scope.dataUrls[index] = e.target.result;
                            });
                        }
                    }(fileReader, i);
                }
                $scope.progress[i] = -1;
            }
        };

        $scope.start = function(index) {
            $scope.progress[index] = 0;
            $scope.error = null;
            $scope.upload[index] = $upload.upload({
                url: '/admin/products/'+$scope.product_id + '/assets/',
                method: 'POST',
                headers: {'my-header': 'my-header-value'},
                data : {
                    asset : $scope.asset
                },
                file: $scope.selectedFiles[index],
                fileFormDataName: 'file'
            });
            $scope.upload[index].then(function(response) {//resolve
                $timeout(function() {
                    $scope.uploadResult.push(response.data);
                });
                $state.go('admin.products.assets.list',{product_id: $stateParams.product_id}, {reload:true});
            }, function(response) { //reject
                if (response.status > 0) $scope.error = response.status + ': ' + response.data;
            }, function(evt) {//notify
                // Math.min is to fix IE which reports 200% sometimes
                $scope.progress[index] = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
            });
            $scope.upload[index].xhr(function(xhr){
                //xhr.upload.addEventListener('abort', function() {console.log('abort complete')}, false);
            });

        };

        $scope.searchAssets = function(){
            assets.getAssets({product_id: $stateParams.product_id}, function(err, data){
                //console.log(data);
                $scope.data.product = data.product;
                $scope.data.assets = $filter('orderBy')(data.assets, ['position', 'id']);
                $scope.copy = [];

                if($scope.data.assets) {
                    for (var i = 0; i < $scope.data.assets.length; i++) {
                        $scope.copy.push($location.protocol() + '://' + $location.host() + ':' + $location.port() + '/uploads/images/' + $scope.data.assets[i].attachment_file_path);
                    }
                }
                if(data.product && data.product.variants) {
                    for (var i = 0; i < data.product.variants.length; i++) {

                        (data.product.variants[i].is_master == true) ?
                            $scope.asset.master_variant = data.product.variants[i] :
                            $scope.asset.variants.push(data.product.variants[i]);
                    }
                }
                //console.log($scope.master_variant);
            });
        };

        $scope.deleteAsset = function( item){
            assets.remove({id: item.id});
            $scope.data.assets.splice($scope.data.assets.indexOf(item), 1);
        };

        $scope.searchAssets();
    }])
    .controller('EditAssetCtrl',  [ '$scope', '$http', '$timeout', '$upload', '$state', '$stateParams', 'assets', function($scope, $http, $timeout, $upload, $state, $stateParams, assets) {
        $scope.data ={};
        $scope.asset = {
            master_variant: {},
            variants: []
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
                headers: {'my-header': 'my-header-value'},
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
