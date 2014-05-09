'use strict';

angular.module(
		'frontendApp',
		[ 'ngCookies', 'ngResource', 'ngSanitize', 'ngRoute',
				'frontendApp.controllers' ]).config(function($routeProvider) {
	$routeProvider.when('/', {
		templateUrl : 'views/main.html',
		controller : 'MainCtrl'
	}).when('/users/:id', {
		templateUrl : 'views/user.html',
		controller : 'UserCtrl'
	}).when('/users', {
		templateUrl : 'views/user.html',
		controller : 'UserCtrl'
	}).otherwise({
		redirectTo : '/'
	});
});
