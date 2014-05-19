'use strict';

angular.module('frontendApp')
    .controller('NavbarCtrl', ['$scope', 'AuthFactory', '$location',
        function($scope, AuthFactory, $location) {

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
