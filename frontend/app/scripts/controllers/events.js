'use strict';

/**
 * @ngdoc function
 * @name frontendApp.controller:EventsCtrl
 * @description
 * # EventsCtrl
 * Controller of the frontendApp
 */
angular.module('frontendApp')
  .controller('EventsCtrl', ['$scope', 'Idle', '$modal', '$timeout',function($scope, Idle, $modal, $timeout) {
    $scope.countdown = 60;

    function closeModals() {
      if ($scope.warning) {
        $scope.warning.close();
        //$scope.warning = null;
      }

      if ($scope.timedout) {
        $scope.timedout.close();
        //$scope.timedout = null;
      }
    }

    $scope.$on('SignedIn', function(){
      Idle.watch();
    });
    $scope.$on('SignedOut', function(){
      Idle.unwatch();
    });

    $scope.$on('IdleStart', function() {
      // the user appears to have gone idle
      if(!$scope.Auth.authorize('user')){
        return Idle.watch();
      }
      closeModals();

      $scope.warning = $modal.open({
        templateUrl: 'warning-dialog.html',
        windowClass: 'modal-danger',
        resolve: {
          countdown: function(){
            return $scope.countdown;
          }
        }
      });
      $timeout(function(){
        closeModals();
      }, 15000);

    });

    $scope.$on('IdleWarn', function(e, countdown) {
      // follows after the IdleStart event, but includes a countdown until the user is considered timed out
      // the countdown arg is the number of seconds remaining until then.
      // you can change the title or display a warning dialog from here.
      // you can let them resume their session by calling Idle.watch()
      $scope.countdown = countdown;
      console.log(countdown);
    });

    $scope.$on('IdleTimeout', function() {
      // the user has timed out (meaning idleDuration + timeout has passed without any activity)
      // this is where you'd log them
      if(!$scope.Auth.authorize('user')){
        return Idle.watch();
      }
      closeModals();
      $scope.timedout = $modal.open({
        templateUrl: 'timedout-dialog.html',
        windowClass: 'modal-danger'
      });
      $scope.timedout.result.then(function(selectedItem){
        console.log('model selectedItem');
      }, function(){
        console.log('modal dismisssed');
        //TODO: logout
        $scope.Auth.logout();
      });
    });

    $scope.$on('IdleEnd', function() {
      // the user has come back from AFK and is doing stuff. if you are warning them, you can use this to hide the dialog
      closeModals();
    });

    $scope.$on('Keepalive', function() {
      // do something to keep the user's session alive
    });

  }])
  .config(['IdleProvider', 'KeepaliveProvider', function(IdleProvider, KeepaliveProvider) {
    // configure Idle settings
    IdleProvider.idle(30*60); // in seconds
    IdleProvider.timeout(60); // in seconds
    KeepaliveProvider.interval(2); // in seconds
  }])
  .run(['Idle', function(Idle){
    // start watching when the app runs. also starts the Keepalive service by default.
    Idle.watch();
  }]);
