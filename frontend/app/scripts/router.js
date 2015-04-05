angular.module('frontendApp.router', ['ui.router'])
.config(['$stateProvider', '$urlRouterProvider', '$httpProvider',
    function ($stateProvider,   $urlRouterProvider) {
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
            })
            .state('anon.mail', {
                url: '/mail/',
                templateUrl: '/views/partials/mail.html',
                controller: 'MailCtrl'
            })
            .state('anon.passwordToken', {
                url: '/resetPassword/:passwordToken/',
                templateUrl: '/views/partials/resetPassword.html',
                controller: 'MailCtrl'
            })
            .state('anon.resetPassword', {
                url: '/resetPassword/:passwordToken',
                templateUrl: '/views/partials/resetPassword.html',
                controller: 'MailCtrl'
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
                url:'/profile/',
                templateUrl: '/views/partials/profile.html'
            })
            .state('user.password', {
                url: '/password/',
                templateUrl: '/views/partials/password.html',
                controller: 'PasswordCtrl'
            });

        // Public products controllers
        $stateProvider
            .state('products', {
                abstract: true,
                url: '/products/',
                // Example of loading a template from a file. This is also a top level state,
                // so this template file will be loaded and then inserted into the ui-view
                // within index.html.
                //template: '<ui-view/>',
                templateUrl: 'views/partials/products/layout.html',
                data: {
                    access: access.public
                }
            })
            .state('products.list', {
                url: '',
                templateUrl: 'views/partials/products/products.list.html',
                controller: 'ProductCtrl'
            })
            .state('products.view', {
                url: ':id',
                templateUrl: 'views/partials/products/products.view.html',
                controller: 'ViewProductCtrl'
            })
            ;
        // checkout controllers
        $stateProvider
            .state('orders', {
                abstract: true,
                url: '/orders/',
                // Example of loading a template from a file. This is also a top level state,
                // so this template file will be loaded and then inserted into the ui-view
                // within index.html.
                //template: '<ui-view/>',
                templateUrl: 'views/partials/orders/layout.html',
                data: {
                    access: access.user
                }
            })
            .state('orders.list', {
                url: '',
                templateUrl: 'views/partials/orders/orders.list.html',
                controller: 'OrderCtrl'
            })
            .state('orders.view', {
                url: ':id/',
                templateUrl: 'views/partials/orders/orders.view.html',
                controller: 'ViewOrderCtrl'
            })
            .state('orders.address', {
                url: 'address/',
                templateUrl: 'views/partials/orders/orders.address.html',
                controller: 'AddressCtrl'
            })
            .state('orders.delivery', {
                url: 'delivery/',
                templateUrl: 'views/partials/orders/orders.delivery.html',
                controller: 'DeliveryCtrl'
            })
            .state('orders.payment', {
                url: 'payment/',
                templateUrl: 'views/partials/orders/orders.payment.html',
                controller: 'PaymentCtrl'
            })
            .state('orders.complete', {
                url: 'complete/',
                templateUrl: 'views/partials/orders/orders.complete.html',
                controller: 'CompleteCtrl'
            })
        ;

        // Public Cart controllers
        $stateProvider
            .state('carts', {
                abstract: true,
                url: '/carts/',
                // Example of loading a template from a file. This is also a top level state,
                // so this template file will be loaded and then inserted into the ui-view
                // within index.html.
                template: '<ui-view/>',
                //templateUrl: 'views/partials/products/layout.html',
                data: {
                    access: access.user
                }
            })
            .state('carts.list', {
                url: '',
                templateUrl: 'views/partials/carts/carts.list.html',
                controller: 'CartCtrl'
            })
            .state('carts.view', {
                url: ':id/',
                templateUrl: 'views/partials/carts/carts.edit.html',
                controller: 'EditCartCtrl'
            })
        ;
        //Forum Controllers
        $stateProvider
            .state('forums', {
                abstract: true,
                url: '/forums/',
                // Example of loading a template from a file. This is also a top level state,
                // so this template file will be loaded and then inserted into the ui-view
                // within index.html.
                template: '<ui-view/>',
                //templateUrl: 'views/partials/products/layout.html',
                data: {
                    access: access.public
                }
            })
            .state('forums.list', {
                url: '',
                templateUrl: 'views/partials/forums/forums.list.html',
                controller: 'ForumCtrl'
            })
            .state('forums.topics', {
                abstract: true,
                //url: '',
                template: '<ui-view/>'
            })
            .state('forums.topics.list', {
                url: '/:forum_id/topics',
                templateUrl: 'views/partials/forums/topics/topics.list.html',
                controller: 'TopicCtrl'
            })
            .state('forums.topics.new', {
                url: ':forum_id/topics/new',
                templateUrl: 'views/partials/forums/topics/topics.new.html',
                controller: 'NewTopicCtrl'
            })
            .state('forums.topics.view', {
                url: ':forum_id/topics/:id',
                templateUrl: 'views/partials/forums/topics/topics.view.html',
                controller: 'ViewTopicCtrl'
            })
            .state('forums.topics.edit', {
                url: ':forum_id/topics/:id/edit',
                templateUrl: 'views/partials/forums/topics/topics.edit.html',
                controller: 'ViewTopicCtrl'
            })
        ;

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
                url: '',
                templateUrl: 'views/partials/admin/products/products.list.html',
                controller: 'AdminProductCtrl'
            })
            .state('admin.products.new', {
                url: 'new',
                templateUrl: 'views/partials/admin/products/products.new.html',
                controller: 'NewProductCtrl'
            })
            .state('admin.products.edit', {
                url: ':id/edit',
                templateUrl: 'views/partials/admin/products/products.edit.html',
                controller: 'EditProductCtrl',
                resolve: {
                    product: function(products, $stateParams){
                        return products.get({id: $stateParams.id});
                    },
                    optionTypesData: function(optionTypes){
                        return optionTypes.index();
                    },
                    taxonsData: function(taxons){
                        return taxons.index();
                    }
                }
            })
            .state('admin.products.clone', {
                url: ':id/clone',
                templateUrl: 'views/partials/admin/products/products.clone.html',
                controller: 'CloneProductCtrl',
                resolve: {
                    product: function(products, $stateParams){
                        return products.get({id: $stateParams.id});
                    },
                    optionTypesData: function(optionTypes){
                        return optionTypes.index();
                    },
                    taxonsData: function(taxons){
                        return taxons.index();
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
                url: ':id',
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
                //url: '',
                templateUrl: 'views/partials/admin/taxonomies/taxonomies.list.html',
                controller: 'AdminTaxonomyCtrl'
            })
            .state('admin.products.taxonomies.edit', {
                url: ':id',
                templateUrl: 'views/partials/admin/taxonomies/taxonomies.edit.html',
                controller: 'EditTaxonomyCtrl'
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
                controller: 'AdminTaxonCtrl'
            })
            .state('admin.products.variants', {
                abstract: true,
                url: ':product_id/variants/',
                //template: '<ui-view/>'
                templateUrl: 'views/partials/admin/variants/layout.html'
            })
            .state('admin.products.variants.list', {
                url: '',
                templateUrl: 'views/partials/admin/variants/variants.list.html',
                controller: 'AdminVariantCtrl'
            })
            .state('admin.products.variants.edit', {
                url: ':id/',
                templateUrl: 'views/partials/admin/variants/variants.edit.html',
                controller: 'EditVariantCtrl',
                resolve: {
                    variantData: function(variants, $stateParams){
                        variants.get({id: $stateParams.id}, function(err, data){
                            return data;
                        });
                    }
                }
            })
            .state('admin.products.assets', {
                abstract: true,
                url: ':product_id/assets/',
                //template: '<ui-view/>'
                templateUrl: 'views/partials/admin/assets/layout.html'
            })
            .state('admin.products.assets.list', {
                url: '',
                templateUrl: 'views/partials/admin/assets/assets.list.html',
                controller: 'AdminAssetCtrl'
            })
            .state('admin.products.assets.edit', {
                url: ':id',
                templateUrl: 'views/partials/admin/assets/assets.edit.html',
                controller: 'EditAssetCtrl'
            })

            .state('admin.products.shipping_methods', {
                abstract: true,
                url: 'shipping_methods/',
                template: '<ui-view/>'
                //templateUrl: 'views/partials/admin/products/layout.html'
            })
            .state('admin.products.shipping_methods.list', {
                url: '',
                templateUrl: 'views/partials/admin/shipping_methods/shipping_methods.list.html',
                controller: 'AdminShippingMethodCtrl'
            })
            .state('admin.products.shipping_methods.edit', {
                url: ':id/',
                templateUrl: 'views/partials/admin/shipping_methods/shipping_methods.edit.html',
                controller: 'EditShippingMethodCtrl',
                resolve: {
                    shippingMethod: function(shippingMethods, $stateParams){
                        return shippingMethods.get({id: $stateParams.id});
                    }
                }
            })

            .state('admin.products.payment_methods', {
                abstract: true,
                url: 'payment_methods/',
                template: '<ui-view/>'
                //templateUrl: 'views/partials/admin/products/layout.html'
            })
            .state('admin.products.payment_methods.list', {
                url: '',
                templateUrl: 'views/partials/admin/payment_methods/payment_methods.list.html',
                controller: 'AdminPaymentMethodCtrl'
            })
            .state('admin.products.payment_methods.edit', {
                url: ':id/',
                templateUrl: 'views/partials/admin/payment_methods/payment_methods.edit.html',
                controller: 'EditPaymentMethodCtrl',
                resolve: {
                    paymentMethod: function(paymentMethods, $stateParams){
                        return paymentMethods.get({id: $stateParams.id});
                    }
                }
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
                controller: 'AdminOrderCtrl'
            })

            .state('admin.forums', {
                abstract: true,
                url: '/admin/forums/',
                // Example of loading a template from a file. This is also a top level state,
                // so this template file will be loaded and then inserted into the ui-view
                // within index.html.
                templateUrl: 'views/partials/admin/forums/layout.html'
            })
            .state('admin.forums.list', {
               url: '',
                templateUrl: 'views/partials/admin/forums/forums.list.html',
                controller: 'AdminForumCtrl'
            })
            .state('admin.forums.new', {
                url: ':id/new/',
                templateUrl: 'views/partials/admin/forums/forums.new.html',
                controller: 'NewForumCtrl'
            })
            .state('admin.forums.edit', {
                url: ':id/edit/',
                templateUrl: 'views/partials/admin/forums/forums.edit.html',
                controller: 'EditForumCtrl'
            })
        ;

        $urlRouterProvider.when('', '/products');
        $urlRouterProvider.when('/', '/products');
        $urlRouterProvider.otherwise('/404');

    }
]);
