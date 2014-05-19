'use strict';

angular.module('frontendApp')
    .controller('PasswordCtrl', ['$rootScope', '$scope', 'AuthFactory', '$location',
        function($rootScope, $scope, AuthFactory, $location) {
            console.log('>>passwordCtrl:');
            console.log($rootScope.currentUser);
            if (!$rootScope.currentUser) return $location.path('/login');

            $scope.user = $rootScope.currentUser;

            $scope.changePassword = function(form) {

                AuthFactory.changePassword(
                    $scope.user.email,
                    $scope.user.password,
                    $scope.user.new_password,
                    $scope.user.retype_password, function(errors) {
                        $scope.errors = {};
                        $scope.success = {};

                        if (!errors) {
                            form['password'].$setValidity('server', true);
                            $scope.success['password'] = 'Password changed.';
                            //$location.path('/');
                        } else {
                            // console.log( err);
                            angular.forEach(errors, function(error) {
                                var msg = error.msg;
                                var field = error.property;
                                if (field === 'encrypted_password') field = 'password';
                                console.log('>> field: ' + field);
                                console.log('>> msg: ' + msg);
                                console.log(form[field]);
                                form[field].$setValidity('server', false);
                                $scope.errors[field] = msg;
                            });
                        }
                    });
            };
        }
    ]);
