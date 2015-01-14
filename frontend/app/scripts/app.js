'use strict';

angular.module('frontendApp', 
	['ngCookies', 'ngResource', 'ngSanitize', 'ui.router', 'ui.bootstrap','ui.select2','ui.sortable','ui.tree',
     'frontendApp.state', 'angularFileUpload', 'ui.pagedown','gettext', 'ngClipboard'])
    .config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$httpProvider', '$logProvider','ngClipProvider',
        function($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider, $logProvider, ngClipProvider) {
            $logProvider.debugEnabled = true;
            ngClipProvider.setPath("bower_components/zeroclipboard/dist/ZeroClipboard.swf");
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