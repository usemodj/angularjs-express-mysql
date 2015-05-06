'use strict';

/**
 * @ngdoc function
 * @name frontendApp.controller:AdminSupportCtrl
 * @description
 * # AdminSupportCtrl
 * Controller of the frontendApp
 */
angular.module('frontendApp')
  .controller('AdminSupportCtrl', ['$scope', '$state', '$stateParams', 'tickets', function ($scope, $state, $stateParams, tickets) {
    $scope.page = $stateParams.page;
    $scope.data = {};
    $scope.conditions = {};


    $scope.pageChanged = function() {
      $scope.searchTickets();
      //$state.go('admin.user.home',{page: $scope.page});
      //$location.path('/users/page/'+$scope.page);
    };

    $scope.searchTickets = function(form){
      tickets.adminSearch({
        subject: $scope.conditions.subject,
        status: $scope.conditions.status,
        page: $scope.page
      }, function(err, data){
        console.log(data);
        if(!err) {
          $scope.data.tickets = data.tickets;
          $scope.totalItems = data.count;
          $scope.page = data.page;
        }
      });
    };

    $scope.searchTickets();
  }])
  .controller('ViewAdminSupportCtrl', ['$scope', '$state', '$stateParams', '$modal', 'Upload', 'tickets',
    function ($scope, $state, $stateParams, $modal, Upload, tickets) {
      $scope.data = {};
      $scope.newMessage = {status: 'feedback'};
      $scope.files = [];

      //listen for the file selected event
      $scope.$on("fileSelected", function (event, args) {
        $scope.$apply(function () {
          //add the file object to the scope's files collection
          $scope.files.push(args.file);
        });
      });

      $scope.viewTicket = function(form){
        //console.log($rootScope.currentUser);
        //console.log(routingConfig);
        tickets.get({
          id: $stateParams.id
        }, function(err, data){
          console.log(data);
          if(err) {
            $scope.error = err;
          } else {
            $scope.data = data;
          }
        });
      };

      $scope.replyMessage = function(form){
        $scope.newMessage.ticket_id = $stateParams.id;

        $scope.progress = 0;
        $scope.error = null;
        //console.log($scope.files);
        $scope.upload = Upload.upload({
          url: '/tickets/reply',
          method: 'POST',
          fields : {
            message : $scope.newMessage
          },
          file: ($scope.files != null)? $scope.files: null,
          fileFormDataName: 'file'
        }).progress(function (evt) {
          // Math.min is to fix IE which reports 200% sometimes
          $scope.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
        }).success(function (data, status, headers, config) {
          //console.log(config);
          //console.log('>>success data')
          console.log(data); //message with assets
          //$scope.data = data;
          $state.go('admin.supports.view',{id: $stateParams.id}, {reload: true});

        }).success(function (data, status, headers, config) {
          $scope.error = data;
        });
      };

      $scope.editMessage = function(message){
        $scope.data.message = message;
        //console.log(">>message:");console.log($scope.data.message);
        var modalInstance = $modal.open({
          templateUrl: 'views/partials/admin/supports/tickets.edit.html',
          controller: 'EditAdminSupportCtrl',
          resolve: {
            message: function(){
              return $scope.data.message;
            }
          }
        });
        modalInstance.result.then(function(editedMessage){
          //console.log(editedMessage);
          updateMessage(editedMessage); //update message with file attachment
        });

        //$state.go('forums.topics.edit', {forum_id: $stateParams.forum_id, id: $stateParams.id});
      };

      $scope.cancelEdit = function(){
        $state.go('admin.supports.list');
      };
      // Update topic with file attachment
      var updateMessage = function( message) {
        message.ticket_id = $stateParams.id;
        $scope.progress = 0;
        $scope.error = null;
        //console.log($scope.files);
        $scope.upload = Upload.upload({
          url: '/tickets/update_message',
          method: 'POST',
          fields : {
            message : message
          },
          file: (message.files != null)? message.files: null,
          fileFormDataName: 'file'
        }).progress(function (evt) {
          // Math.min is to fix IE which reports 200% sometimes
          $scope.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
        }).success(function (data, status, headers, config) {
          //console.log(config);
          //console.log('>>success data')
          console.log(data); //message with assets
          //$scope.data = data;
          $state.go('admin.supports.view',{id: $stateParams.id}, {reload: true});
        }).success(function (data, status, headers, config) {
          $scope.error = data;
        });
      };

      $scope.viewTicket();
    }])
  .controller('EditAdminSupportCtrl', ['$scope', '$state', 'assets', '$modalInstance', 'message', function ($scope, $state, assets, $modalInstance, message) {
    $scope.data = {};
    var origin = angular.copy(message);
    $scope.data.message = message;
    $scope.files = [];

    //listen for the file selected event
    $scope.$on("fileSelected", function (event, args) {
      $scope.$apply(function () {
        //add the file object to the scope's files collection
        $scope.files.push(args.file);
      });
    });

    $scope.save = function(){
      $scope.data.message.files = $scope.files;
      $modalInstance.close($scope.data.message);
    };

    $scope.cancel = function(){
      $scope.data.message.content = origin.content;
      $modalInstance.dismiss('cancel');
    };

    $scope.removeFile = function(file){
      var files = $scope.data.message.assets;
      if(files){
        assets.remove({id: file.id}, function(err, asset){
          if(!err) files.splice(files.indexOf(file),1);
        });
      }
    };

  }]);
