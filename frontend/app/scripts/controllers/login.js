'use strict';

angular.module('frontendApp')
.controller(
    'LoginCtrl', [
        '$scope',
        'AuthFactory',
        '$location',
        function($scope, AuthFactory, $location) {
            $scope.error = {};
            $scope.user = {};

            $scope.login = function(form) {
                AuthFactory.login('password', {
                    'email': $scope.user.email,
                    'password': $scope.user.password,
                    'rememberMe': $scope.user.rememberMe
                }, function(err) {
                    $scope.errors = {};

                    if (!err) {
                        $location.path('/');
                    } else {
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
