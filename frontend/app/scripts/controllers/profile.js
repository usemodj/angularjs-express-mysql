'use strict';

/**
 * @ngdoc function
 * @name frontendApp.controller:ProfileCtrl
 * @description
 * # ProfileCtrl
 * Controller of the frontendApp
 */
angular.module('frontendApp')
  .controller('ProfileCtrl', ['$scope', '$state', '$stateParams', '$timeout', '$window', '$upload', 'profiles',
    function ($scope, $state, $stateParams, $timeout, $window, $upload, profiles) {
      $scope.profile = { address:{}};
      $scope.files = [];
      $scope.viewAddress = false;
      $scope.viewBasicInfo = false;

      //listen for the file selected event
      $scope.$on("fileSelected", function (event, args) {
        $scope.$apply(function () {
          //add the file object to the scope's files collection
          $scope.files.push(args.file);
        });
      });

      console.log($scope.currentUser)
      //if($scope.currentUser.profile) $scope.profile = $scope.currentUser.profile;
      //if(!$scope.profile.address) $scope.profile.address = {};
      profiles.get({},function(err, profile){
        if(!err) $scope.profile = profile;
        //else {console.log('>>error:');console.log(err);}
      });


      $scope.toggleAddress = function(){
        $scope.viewAddress = !$scope.viewAddress;
        //console.log( $scope.viewAddress);
      };
      $scope.toggleBasicInfo = function(){
        $scope.viewBasicInfo = !$scope.viewBasicInfo;
        //console.log( $scope.viewAddress);
      };

      $scope.saveAddress = function(form){
        //console.log($scope.profile);
        profiles.saveAddress($scope.profile, function(err, data){
          if(err) $scope.error = err;
          else {
            //console.log(data);
            $scope.profile = data;
            $scope.toggleAddress();
          }

        });
      };
    // Create profile with file attachment
      $scope.saveProfile = function(myform) {
        $scope.progress = 0;
        $scope.error = null;
        //console.log($scope.files);
        $scope.upload = $upload.upload({
          url: '/profiles/save_profile',
          method: 'POST',
          data : {
            profile : $scope.profile
          },
          file: ($scope.files != null)? $scope.files: null,
          fileFormDataName: 'file'
        }).progress(function (evt) {
          // Math.min is to fix IE which reports 200% sometimes
          $scope.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
        }).success(function (data, status, headers, config) {
          //console.log(config);
          //console.log('>>success data')
          //console.log(data);
          $scope.profile = data;
          $scope.toggleBasicInfo();
          //$state.go('user.profile', {reload: true});
        });
      };
  }]);
