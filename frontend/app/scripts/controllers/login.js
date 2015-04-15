'use strict';

angular.module('frontendApp')
.controller(
    'LoginCtrl', [
        '$scope',
        'AuthFactory',
        '$location',
        '$remember',
        'redirects',
        function($scope, AuthFactory, $location, $remember, redirects) {
            $scope.error = {};
            $scope.user = {};
            $scope.user.rememberMe = false;

            if($remember('email')){
            	$scope.user.rememberMe = true;
            	$scope.user.email = $remember('email');
            	//$scope.user.password = $remember('password');
            }

            function rememberMe(){
            	if($scope.user.rememberMe){
            		$remember('email', $scope.user.email);
            		//$remember('password', {value:$scope.user.password, secure: true});
            	} else {
            		$remember('email', '');
            		//$remember('password', '');
            	}
           }

            $scope.login = function(form) {
            	rememberMe();
                AuthFactory.login('password', {
                    'email': $scope.user.email,
                    'password': $scope.user.password,
                    'rememberMe': $scope.user.rememberMe
                }, function(err) {
                    $scope.errors = {};

                    if (!err) {
                        console.log('>>redirect: '+ $scope.redirect);
                        console.log('>>redirectURL: '+  redirects.getRedirectURL());
                        $location.path( redirects.getRedirectURL()? redirects.getRedirectURL(): '/');
                        //$location.path( $scope.redirect ? $scope.redirect : '/');
                    } else {
                        console.log('>>login controller error:'+ JSON.stringify(err));
                        console.log(err);
                        angular.forEach(err.errors, function(error,
                            field) {
                            form[field].$setValidity('server', false);
                            $scope.errors[field] = error.type;
                        });
                        $scope.error.other = err.message;
                    }
                });
            };
        }
    ]);
