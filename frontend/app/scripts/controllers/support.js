'use strict';

/**
 * @ngdoc function
 * @name frontendApp.controller:SupportCtrl
 * @description
 * # SupportCtrl
 * Controller of the frontendApp
 */
angular.module('frontendApp')
  .controller('SupportCtrl', ['$scope', '$state', '$stateParams', 'tickets', function ($scope, $state, $stateParams, tickets) {
    $scope.page = $stateParams.page;
    $scope.data = {};
    $scope.conditions = {};

    if(!$scope.Auth.authorize('user')) return $state.go('anon.login');

    $scope.pageChanged = function() {
      $scope.searchTickets();
      //$state.go('admin.user.home',{page: $scope.page});
      //$location.path('/users/page/'+$scope.page);
    };

    $scope.searchTickets = function(form){
      tickets.search({
        subject: $scope.conditions.subject,
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
  .controller('NewSupportCtrl', ['$scope', '$state', '$stateParams', '$timeout', '$window', 'Upload', 'tickets',
    function ($scope, $state, $stateParams, $timeout, $window, Upload, tickets) {
      $scope.newTicket = { status: 'request'};
      $scope.files = [];

      //listen for the file selected event
      $scope.$on("fileSelected", function (event, args) {
        $scope.$apply(function () {
          //add the file object to the scope's files collectionU
          $scope.files.push(args.file);
        });
      });

      // Create topic with file attachment
      $scope.uploadTicket = function(myform) {
        $scope.progress = 0;
        $scope.error = null;
        //console.log($scope.files);
        $scope.upload = Upload.upload({
          url: '/tickets/upload',
          method: 'POST',
          fields : {
            ticket : $scope.newTicket
          },
          file: ($scope.files != null)? $scope.files: null,
          fileFormDataName: 'file'
        }).progress(function (evt) {
          // Math.min is to fix IE which reports 200% sometimes
          var uploading =  parseInt(100.0 * evt.loaded / evt.total);
          $scope.progress = Math.min(100, uploading);
        }).success(function (data, status, headers, config) {
          //console.log(config);
          //console.log('>>success data')
          //console.log(data);
          return $state.go('supports.view',{id: data.id}, {reload: true});
        }).error(function (data, status, headers, config) {
          //console.log(config);
          //console.log('>>success data')
          console.log(data);
          $scope.error = data;
        });

      };

      $scope.cancelEdit = function(){
        $state.go('supports.list');
      };

    }])
  .controller('ViewSupportCtrl', ['$scope', '$state', '$stateParams', '$modal', 'Upload', 'tickets',
    function ($scope, $state, $stateParams, $modal, Upload, tickets) {
      $scope.data = {};
      $scope.newMessage = {status: 'request'};
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

      //$scope.replyMessage = function(form){//without file attachment
      //  tickets.replyMessage({
      //    ticket_id: $stateParams.id,
      //    content: $scope.newMessage.content
      //  }, function(err, data){
      //    //console.log('>> data:'+ JSON.stringify(data));
      //    if(err) {
      //      $scope.error = err;
      //    } else {
      //      $scope.data = data;
      //      $state.go('supports.view',{id: $stateParams.id});
      //    }
      //  });
      //};
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
          $state.go('supports.view',{id: $stateParams.id}, {reload: true});

        }).success(function (data, status, headers, config) {
          $scope.error = data;
        });
      };

      $scope.editMessage = function(message){
        $scope.data.message = message;
        //console.log(">>message:");console.log($scope.data.message);
        var modalInstance = $modal.open({
          templateUrl: 'views/partials/supports/tickets.edit.html',
          controller: 'EditSupportCtrl',
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
        $state.go('supports.list');
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
          $state.go('supports.view',{id: $stateParams.id}, {reload: true});
        }).success(function (data, status, headers, config) {
          $scope.error = data;
        });
      };

      $scope.viewTicket();
    }])
  .controller('EditSupportCtrl', ['$scope', '$state', 'assets', '$modalInstance', 'message', function ($scope, $state, assets, $modalInstance, message) {
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
