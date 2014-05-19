'use strict';

angular.module('frontendApp', 
	['ngCookies', 'ngResource', 'ngSanitize', 'ngRoute','http-auth-interceptor'])
    .config(
        ['$routeProvider', '$locationProvider', '$httpProvider',
            function($routeProvider, $locationProvider, $httpProvider) {
                $routeProvider.when('/', {
                    templateUrl: 'views/main.html',
                    controller: 'MainCtrl'
                }).when('/users/:id', {
                    templateUrl: 'views/user.html',
                    controller: 'UserCtrl'
                }).when('/users', {
                    templateUrl: 'views/user.html',
                    controller: 'UserCtrl'
                }).when('/login', {
                    templateUrl: 'views/partials/login.html',
                    controller: 'LoginCtrl'
                }).when('/signup', {
                    templateUrl: 'views/partials/signup.html',
                    controller: 'SignupCtrl'
                }).when('/password', {
                    templateUrl: 'views/partials/password.html',
                    controller: 'PasswordCtrl'
                }).when('/mail', {
                    templateUrl: 'views/partials/mail.html',
                    controller: 'MailCtrl'
                }).otherwise({
                    redirectTo: '/'
                });

                // gets rid of the # in urls
                $locationProvider.html5Mode(false);

                /*
                 * Set up an interceptor to watch for 401 errors. The
                 * server, rather than redirect to a login page (or
                 * whatever), just returns a 401 error if it receives a
                 * request that should have a user session going. Angular
                 * catches the error below and says what happens - in this
                 * case, we just redirect to a login page. You can get a
                 * little more complex with this strategy, such as queueing
                 * up failed requests and re-trying them once the user logs
                 * in. Read all about it here:
                 * http://www.espeo.pl/2012/02/26/authentication-in-angularjs-application
                 */
                //         var interceptor = ['$q', '$location', '$rootScope',
                //         function ($q, $location, $rootScope) {
                //         function success(response) {
                //         return response;
                //         }
                //         function error(response) {
                //         var status = response.status;
                //         if (status == 401) {
                //         $rootScope.redirect = $location.url(); // save the current url so we can redirect the user back
                //         $rootScope.currentUser = null;
                //         $location.path('/login');
                //         }
                //         return $q.reject(response);
                //         }
                //         return function (promise) {
                //         return promise.then(success, error);
                //         }
                //         }];
                //         $httpProvider.responseInterceptors.push(interceptor);
            }
        ])
    .run([
        '$rootScope',
        '$location',
        'AuthFactory',
        function($rootScope, $location, AuthFactory) {
            $rootScope.$watch('currentUser', function(currentUser) {
                // console.log('>>app currentUser');
                // console.log(currentUser);

                // If no currentUser and on a page that requires
                // authorization then try to update it
                // will trigger 401s if user does not have an valid
                // session
                if (!currentUser && (['/', '/login', '/logout', '/signup']
                    .indexOf($location.path()) === -1)) {
                    AuthFactory.currentUser();
                }
            });

            // ON catching 401 errors, redirect to the login page
            $rootScope.$on('event:auth-loginRequired', function() {
                $location.path('/login');
                return false;
            });
        }
    ]);
