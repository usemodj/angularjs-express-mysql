'use strict';

var app = angular.module('frontendApp.controllers', [ 'frontendApp.services' ]);
app.controller('UserCtrl', [ '$scope', 'UserFactory',
		function($scope, UserFactory) {
			$scope.list = function() {
				
				UserFactory.query(null, function(users) { // success
					console.log('>>UserFactory.query: ');
					console.log(users);
					$scope.users = users;
				}, function(httpRes) { // error
					// var msg = HelperService.GetErrorMessage(httpRes);
					// $notification.error('Data Fetch Failed', msg);
					console.log(httpRes);
				});
			};
			
			$scope.show = function(userId){
				console.log('>> userId:');
				console.log(userId);
				UserFactory.get({id: userId}, function(user){ //Success
					//console.log(user);
					$scope.user = user;
				},function(httpRes){ //Error
					console.log(httpRes);
				});
			};
			
			$scope.login = function(){
				console.log($scope.user.email);
				console.log($scope.user.password);
			};
		} ]);
