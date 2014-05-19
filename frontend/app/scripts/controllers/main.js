'use strict';

var app = angular.module('frontendApp');
app.controller('MainCtrl', ['$scope', 'UserFactory', 'AuthFactory',
    function($scope, UserFactory, AuthFactory) {
        $scope.awesomeThings = ['HTML5 Boilerplate', 'AngularJS',
            'Karma'
        ];

        $scope.list = function() {
            UserFactory.query(null, function(users) { // success
                console.log(users);
                $scope.users = users;
            }, function(httpRes) { // error
                // var msg = HelperService.GetErrorMessage(httpRes);
                // $notification.error('Data Fetch Failed', msg);
                console.log(httpRes);
            });
        };

        $scope.currentUser = function() {

            AuthFactory.currentUser();
        }
        //$scope.list();
    }
]);
