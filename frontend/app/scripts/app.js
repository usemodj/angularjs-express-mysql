'use strict';

angular.module('frontendApp', 
	['ngCookies', 'ngResource', 'ngSanitize', 'ui.router', 'ui.bootstrap','ui.select2','ui.sortable','ui.tree',
     'frontendApp.router', 'angularFileUpload', 'gettext', 'ngClipboard','markdown'])
    .config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$httpProvider', '$logProvider','ngClipProvider',
        function($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider, $logProvider, ngClipProvider) {
            $logProvider.debugEnabled = true;
            ngClipProvider.setPath("bower_components/zeroclipboard/dist/ZeroClipboard.swf");

            // FIX for trailing slashes. Gracefully "borrowed" from https://github.com/angular-ui/ui-router/issues/50
            $urlRouterProvider.rule(function($injector, $location) {
                if($location.protocol() === 'file')
                    return;

                var path = $location.path()
                // Note: misnomer. This returns a query object, not a search string
                    , search = $location.search()
                    , params
                    ;

                // check to see if the path already ends in '/'
                if (path[path.length - 1] === '/') {
                    return;
                }

                // If there was no search string / query params, return with a `/`
                if (Object.keys(search).length === 0) {
                    return path + '/';
                }
                //console.log('>>search:'+ JSON.stringify(search));
                // Otherwise build the search string and return a `/?` prefix
                params = [];
                angular.forEach(search, function(v, k){
                    params.push(k + '=' + v);
                });
                return path + '/?' + params.join('&');
            });

            // gets rid of the # in urls
            //$locationProvider.html5Mode(false); //.hashPrefix('!');
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
            var interceptor = ['$q', '$location', '$rootScope',function ($q, $location, $rootScope) {
                function success(response) {
                    return response;
                }
                function error(response) {
                    var status = response.status;
                    if (status === 401 || status === 403) {
                        $rootScope.redirect = $location.url(); // save the current url so we can redirect the user back
                        $rootScope.currentUser = null;
                        $location.path('/login');

                    }
                    return $q.reject(response);
                }
                return function (promise) {
                    return promise.then(success, error);
                }
            }];
            $httpProvider.interceptors.push(interceptor);
        }
    ])
    .run(['$rootScope', '$state','$stateParams', 'AuthFactory','gettextCatalog', function ($rootScope, $state, $stateParams, AuthFactory,gettextCatalog) {
        // It's very handy to add references to $state and $stateParams to the $rootScope
        // so that you can access them from any scope within your applications.For example,
        // <li ng-class="{ active: $state.includes('contacts.list') }"> will set the <li>
        // to active whenever 'contacts.list' or one of its decendents is active.
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;

        gettextCatalog.currentLanguage = 'ko';
        gettextCatalog.debug = true;

        $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {
            if (!AuthFactory.authorize(toState.data.access)) {
                $rootScope.error = "Seems like you tried accessing a route you don't have access to...";
                event.preventDefault();
                //console.log('>>fromState.url: %s', fromState.url);
                //if(fromState.url === '^') {
                    if(AuthFactory.isLoggedIn()) {
                        $state.go('user.home');
                    } else {
                        $rootScope.error = null;
                        $state.go('anon.login');
                    }
                //}
            }
        });

    }]);