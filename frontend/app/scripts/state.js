angular.module('frontendApp.state', ['ui.router'])
.config(['$stateProvider', '$urlRouterProvider', '$httpProvider',
    function ($stateProvider,   $urlRouterProvider, $httpProvider) {
        var access = routingConfig.accessLevels;

        // Public controllers
        $stateProvider
            .state('public', {
                abstract: true,
                template: "<ui-view/>",
                data: {
                    access: access.public
                }
            })
            .state('public.404', {
                url: '/404/',
                templateUrl: 'views/404.html'
            })
            .state('public.home', {
                url: '/',
                templateUrl: 'views/main.html',
                controller: 'MainCtrl'
            });
        // Anonymous controllers
        $stateProvider
            .state('anon', {
                abstract: true,
                template: "<ui-view/>",
                data: {
                    access: access.anon
                }
            })
            .state('anon.login', {
                url: '/login/',
                templateUrl: '/views/partials/login.html',
                controller: 'LoginCtrl'
            })
            .state('anon.signup', {
                url: '/signup/',
                templateUrl: '/views/partials/signup.html',
                controller: 'SignupCtrl'
            });

        // Regular user controllers
        $stateProvider
            .state('user', {
                abstract: true,
                template: "<ui-view/>",
                data: {
                    access: access.user
                }
            })
            .state('user.home', {
                url: '/',
                templateUrl: '/views/main.html',
                controller: 'MainCtrl'
            })
            .state('user.password', {
                url: '/password/',
                templateUrl: '/views/partials/password.html',
                controller: 'PasswordCtrl'
            })
            .state('user.mail', {
                url: '/mail/',
                templateUrl: '/views/partials/mail.html',
                controller: 'MailCtrl'
            })
            .state('user.passwordToken', {
                url: '/resetPassword/:passwordToken/',
                templateUrl: '/views/partials/resetPassword.html',
                controller: 'MailCtrl'
            })
            .state('user.resetPassword', {
                url: '/resetPassword/',
                templateUrl: '/views/partials/resetPassword.html',
                controller: 'MailCtrl'
            });


        // Admin controllers
        $stateProvider
            .state('admin', {
                abstract: true,
                templateUrl: 'views/partials/admin/layout.html',
                data: {
                    access: access.admin
                }
            })
            .state('admin.users', {
                abstract: true,
                url: '/users/',
                templateUrl: 'views/partials/admin/users/layout.html'
            })
            .state('admin.users.list', {
                url: 'page/:page',
                templateUrl: 'views/partials/admin/users/users.list.html',
                controller: 'AdminUserCtrl'
            })
            .state('admin.users.edit', {
                url: ':id',
                templateUrl: 'views/partials/admin/users/users.edit.html',
                controller: 'UserEditCtrl',
                resolve: {
                    user: function(UserFactory, $stateParams){
                        return UserFactory.get({id: $stateParams.id});
                    },
                    roles: function(RoleFactory){
                        return RoleFactory.query();
                    }
                }
            })
            .state('admin.products', {
                abstract: true,
                url: '/admin/products/',
                // Example of loading a template from a file. This is also a top level state,
                // so this template file will be loaded and then inserted into the ui-view
                // within index.html.
                templateUrl: 'views/partials/admin/products/layout.html'
            })
            .state('admin.products.list', {
                url: 'page/:page',
                templateUrl: 'views/partials/admin/products/products.list.html',
                controller: 'AdminProductCtrl'
            })
            .state('admin.products.edit', {
                url: ':id/edit',
                templateUrl: 'views/partials/admin/products/products.edit.html',
                controller: 'EditProductCtrl',
                resolve: {
                    product: function(products, $stateParams){
                        return products.get({id: $stateParams.id});
                    }
                }
            })
            .state('admin.products.option_types', {
                abstract: true,
                url: 'option_types/',
                template: '<ui-view/>'
                //templateUrl: 'views/partials/admin/products/layout.html'
            })
            .state('admin.products.option_types.list', {
                url: '',
                templateUrl: 'views/partials/admin/option_types/option_types.list.html',
                controller: 'AdminOptionTypeCtrl'
            })
            .state('admin.products.option_types.edit', {
                url: ':id/',
                templateUrl: 'views/partials/admin/option_types/option_types.edit.html',
                controller: 'EditOptionTypeCtrl',
                resolve: {
                    optionType: function(optionTypes, $stateParams){
                        return optionTypes.get({id: $stateParams.id});
                    }
                }
            })
            .state('admin.products.taxonomies', {
                abstract: true,
                url: 'taxonomies/',
                template: '<ui-view/>'
                //templateUrl: 'views/partials/admin/products/layout.html'
            })
            .state('admin.products.taxonomies.list', {
                url: '',
                templateUrl: 'views/partials/admin/taxonomies/taxonomies.list.html',
                controller: 'AdminProductCtrl'
            })
            .state('admin.products.taxons', {
                abstract: true,
                url: 'taxons/',
                template: '<ui-view/>'
                //templateUrl: 'views/partials/admin/products/layout.html'
            })
            .state('admin.products.taxons.list', {
                url: '',
                templateUrl: 'views/partials/admin/taxons/taxons.list.html',
                controller: 'AdminProductCtrl'
            })
            .state('admin.orders', {
                abstract: true,
                url: '/admin/orders/',
                // Example of loading a template from a file. This is also a top level state,
                // so this template file will be loaded and then inserted into the ui-view
                // within index.html.
                templateUrl: 'views/partials/admin/orders/layout.html'
            })
            .state('admin.orders.list', {
                url: '',
                templateUrl: 'views/partials/admin/orders/orders.list.html',
                controller: 'AdminProductCtrl'
            });


        $urlRouterProvider.otherwise('/404');

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
                    //$rootScope.redirect = $location.url(); // save the current url so we can redirect the user back
                    //$rootScope.currentUser = null;
                    $location.path('/login');
                }
                return $q.reject(response);
            }
            return function (promise) {
                return promise.then(success, error);
            }
        }];
        $httpProvider.responseInterceptors.push(interceptor);
    }
]);