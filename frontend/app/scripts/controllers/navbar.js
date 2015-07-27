'use strict';

angular.module('frontendApp')
    .controller('NavbarCtrl', ['$scope', 'AuthFactory', '$location',
        function($scope, AuthFactory, $location) {
            $scope.user = AuthFactory.user;
            $scope.userRoles = AuthFactory.userRoles;
            $scope.accessLevels = AuthFactory.accessLevels;

            $scope.logout = function() {
                AuthFactory.logout(function(err) {
                    if (err) {
                        console.log(err);
                    } else {
                        $location.path('/login');
                    }
                });
            };
        }
    ]);
