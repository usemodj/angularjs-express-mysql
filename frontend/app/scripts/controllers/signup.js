'use strict';

angular.module('frontendApp')
    .controller('SignupCtrl', ['$scope', 'AuthFactory', '$location',
        function($scope, AuthFactory, $location) {
            $scope.register = function(form) {
                AuthFactory.createUser({
                        email: $scope.user.email,
                        password: $scope.user.password,
                        retype_password: $scope.user.retype_password,
                        role: AuthFactory.userRoles.user
                    },
                    function(errors) {
                        $scope.errors = {};

                        if(errors) {
                            //console.log(errors);
                            if(!angular.isArray(errors)) errors = [errors];
                             angular.forEach(errors, function(error) {
                                var msg = error.msg;
                                var field = error.property;
                                if (field === 'encrypted_password') field = 'password';
                                //console.log('>> field: ' + field);
                                //console.log('>> msg: ' + msg);
                                //console.log(form[field]);
                                form[field].$setValidity('server', false);
                                $scope.errors[field] = msg;
                             });

                        } else {
                            $location.path('/login');
                        }

                    }
                );
            };
        }
    ]);
