'use strict';
angular.module('frontendApp.router', ['ui.router'])
.config(['$stateProvider', '$urlRouterProvider',
    function ($stateProvider,   $urlRouterProvider) {
        var access = routingConfig.accessLevels;
        $urlRouterProvider.when('/', '/news/');
        $urlRouterProvider.when('', '/news/');
        $urlRouterProvider.otherwise('/404');

        $stateProvider.state('site', {
          abstract: true,
          views: {
            'navbar@': {
              templateUrl: 'views/partials/navbar/navbar.html',
              controller: 'NavbarCtrl'
            },
          },
          resolve: {
            //authorize: ['AuthFactory',
            //  function (AuthFactory) {
            //    return AuthFactory.authorize();
            //  }
            //],
            translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
              $translatePartialLoader.addPart('global');
              $translatePartialLoader.addPart('language');
              return $translate.refresh();
            }]
          }
        });

        // Public controllers
        $stateProvider
            .state('public', {
                abstract: true,
                parent: 'site',
                //template: "<ui-view/>",
                data: {
                    access: access.public
                }
            })
            .state('public.404', {
                url: '/404/',
                views:{
                  '': {
                    templateUrl: 'views/404.html'
                  }
                }
            });

        // Anonymous controllers
        $stateProvider
            .state('anon', {
                abstract: true,
                parent: 'site',
                views: {
                  'content@': {
                    template: "<ui-view/>"
                  }
                },
                data: {
                    access: access.anon
                }
            })
            .state('anon.login', {
                url: '/login/',
                views: {
                  '': {
                    templateUrl: '/views/partials/login.html',
                    controller: 'LoginCtrl'
                  }
                }
            })
            .state('anon.signup', {
                url: '/signup/',
                views: {
                  '': {
                    templateUrl: '/views/partials/signup.html',
                    controller: 'SignupCtrl'
                  }
                }
            })
            .state('anon.resetMail', {
                url: '/reset_mail/',
                views: {
                  '': {
                    templateUrl: '/views/partials/resetPasswordMail.html',
                    controller: 'MailCtrl'
                  }
                }
            })
            .state('anon.passwordToken', {
                url: '/resetPassword/:passwordToken/',
                views: {
                  '': {
                    templateUrl: '/views/partials/resetPassword.html',
                    controller: 'MailCtrl'
                  }
                }
            })
            .state('anon.resetPassword', {
                url: '/resetPassword/:passwordToken',
                views: {
                  '': {
                    templateUrl: '/views/partials/resetPassword.html',
                    controller: 'MailCtrl'
                  }
                }
            });

        // Regular user controllers
        $stateProvider
          .state('user', {
              abstract: true,
              parent: 'site',
              views: {
                'content@': {
                  template: "<ui-view/>"
                }
              },
              data: {
                  access: access.user
              }
          })
          .state('user.home', {
              url:'/profile/',
            views: {
              '': {
                templateUrl: '/views/partials/users/profile.html',
                controller: 'ProfileCtrl'
              }
            }
          })
          .state('user.password', {
              url: '/password/',
              views: {
                '': {
                  templateUrl: '/views/partials/users/password.html',
                  controller: 'PasswordCtrl'
                }
              }
          })
          .state('user.profile', {
            url:'/profile/',
            views: {
              '': {
                templateUrl: '/views/partials/users/profile.html',
                controller: 'ProfileCtrl'
              }
            }
          });

        // Public products controllers
        $stateProvider
            .state('products', {
                abstract: true,
                parent: 'site',
                url: '/products/',
                // Example of loading a template from a file. This is also a top level state,
                // so this template file will be loaded and then inserted into the ui-view
                // within index.html.
                //template: '<ui-view/>',
                views: {
                  'content@': {
                    templateUrl: 'views/partials/products/layout.html'
                  }
                },
                data: {
                    access: access.public
                }
            })
            .state('products.list', {
                url: '',
                views: {
                  '': {
                    templateUrl: 'views/partials/products/products.list.html',
                    controller: 'ProductCtrl'
                  }
                }
            })
            .state('products.view', {
                url: ':id',
                views: {
                  '': {
                    templateUrl: 'views/partials/products/products.view.html',
                    controller: 'ViewProductCtrl'
                  }
                }
            });
        $stateProvider
          .state('taxons', {
            abstract: true,
            parent: 'site',
            url: '/taxons/',
            views: {
              'content@': {
                templateUrl: 'views/partials/products/layout.html'
              }
            },
            data: {
              access: access.public
            }
          })
          .state('taxons.products', {
            url: ':id/products/:page?',
            views: {
              '': {
                templateUrl: 'views/partials/taxons/taxons.products.html',
                controller: 'TaxonCtrl'
              }
            }
          });
        // checkout controllers
        $stateProvider
            .state('orders', {
                abstract: true,
                parent: 'site',
                url: '/orders/',
                // Example of loading a template from a file. This is also a top level state,
                // so this template file will be loaded and then inserted into the ui-view
                // within index.html.
                views: {
                  'content@': {
                    templateUrl: 'views/partials/orders/layout.html'
                  }
                },
                data: {
                    access: access.user
                }
            })
            .state('orders.list', {
                url: '',
                views: {
                  'content@': {
                    templateUrl: 'views/partials/orders/orders.list.html',
                    controller: 'OrderCtrl'
                  }
                }
            })
            .state('orders.view', {
                url: ':id/',
                views: {
                  '': {
                    templateUrl: 'views/partials/orders/orders.view.html',
                    controller: 'ViewOrderCtrl'
                  }
                }
            })
            .state('orders.address', {
                url: ':id/address/',
                views: {
                  'content@': {
                    templateUrl: 'views/partials/orders/orders.address.html',
                    controller: 'AddressCtrl'
                  }
                }
            })
            .state('orders.delivery', {
                url: ':id/delivery/',
                views: {
                  '': {
                    templateUrl: 'views/partials/orders/orders.delivery.html',
                    controller: 'DeliveryCtrl'
                  }
                }
            })
            .state('orders.payment', {
                url: ':id/payment/',
                views: {
                  '': {
                    templateUrl: 'views/partials/orders/orders.payment.html',
                    controller: 'PaymentCtrl'
                  }
                }
            })
            .state('orders.complete', {
                url: ':id/complete/',
                views: {
                  '': {
                    templateUrl: 'views/partials/orders/orders.complete.html',
                    controller: 'CompleteCtrl'
                  }
                }
            })
        ;

        // Public Cart controllers
        $stateProvider
            .state('carts', {
                abstract: true,
                parent: 'site',
                url: '/carts/',
                // Example of loading a template from a file. This is also a top level state,
                // so this template file will be loaded and then inserted into the ui-view
                // within index.html.
                views: {
                  'content@': {
                    template: '<ui-view/>'
                  }
                },
                //templateUrl: 'views/partials/products/layout.html',
                data: {
                    access: access.user
                }
            })
            .state('carts.list', {
                url: '',
                views: {
                  '': {
                    templateUrl: 'views/partials/carts/carts.list.html',
                    controller: 'CartCtrl'
                  }
                }
            })
            .state('carts.view', {
                url: ':id/',
                views: {
                  '': {
                    templateUrl: 'views/partials/carts/carts.edit.html',
                    controller: 'EditCartCtrl'
                  }
                }
            })
        ;
        //Forum Controllers
        $stateProvider
            .state('forums', {
                abstract: true,
                parent: 'site',
                url: '/forums/',
                // Example of loading a template from a file. This is also a top level state,
                // so this template file will be loaded and then inserted into the ui-view
                // within index.html.
                views: {
                  'content@': {
                    template: '<ui-view/>'
                  }
                },
                data: {
                    access: access.public
                }
            })
            .state('forums.list', {
                url: '',
                views: {
                  '': {
                    templateUrl: 'views/partials/forums/forums.list.html',
                    controller: 'ForumCtrl'
                  }
                }
            })
            .state('forums.topics', {
                abstract: true,
                url: ':forum_id/topics/',
                views: {
                  'content@': {
                    templateUrl: 'views/partials/forums/topics/layout.html'
                  }
                }
            })
            .state('forums.topics.list', {
                url: '',
                views: {
                  '': {
                    templateUrl: 'views/partials/forums/topics/topics.list.html',
                    controller: 'TopicCtrl'
                  }
                }
            })
            .state('forums.topics.new', {
                url: 'new',
                views: {
                  '': {
                    templateUrl: 'views/partials/forums/topics/topics.new.html',
                    controller: 'NewTopicCtrl'
                  }
                }
            })
            .state('forums.topics.view', {
                url: ':id',
                views: {
                  '': {
                    templateUrl: 'views/partials/forums/topics/topics.view.html',
                    controller: 'ViewTopicCtrl'
                  }
                }
            })
            .state('forums.topics.edit', {
                url: ':id/edit',
                views: {
                  '': {
                    templateUrl: 'views/partials/forums/topics/topics.edit.html',
                    controller: 'EditTopicCtrl'
                  }
                }
            });
      //News Controllers
      $stateProvider
        .state('news', {
          abstract: true,
          parent: 'site',
          url: '/news/',
          // Example of loading a template from a file. This is also a top level state,
          // so this template file will be loaded and then inserted into the ui-view
          // within index.html.
          template: '<ui-view/>',
          //templateUrl: 'views/partials/news/layout.html',
          data: {
            access: access.public
          }
        })
        .state('news.list', {
          url: '',
          views: {
            'content@':{
              templateUrl: 'views/partials/news/index.html',
              controller: 'NewsCtrl'
            }
          }
        })
        .state('news.new', {
          url: 'new',
          views: {
            'content@': {
              templateUrl: 'views/partials/news/news.new.html',
              controller: 'NewNewsCtrl'
            }
          },
          data: {
            access: access.editor
          }

        })
        .state('news.view', {
          url: ':id/',
          views: {
            'content@': {
              templateUrl: 'views/partials/news/news.view.html',
              controller: 'ViewNewsCtrl'
            }
          }
        })
        .state('news.edit', {
          url: ':id/edit',
          views: {
            'content@': {
              templateUrl: 'views/partials/news/news.edit.html',
              controller: 'EditNewsCtrl'
            }
          },
          data: {
            access: access.editor
          }
        });
      //Support Controllers
      $stateProvider
        .state('supports', {
          abstract: true,
          parent: 'site',
          url: '/supports/',
          // Example of loading a template from a file. This is also a top level state,
          // so this template file will be loaded and then inserted into the ui-view
          // within index.html.
          template: '<ui-view/>',
          //templateUrl: 'views/partials/news/layout.html',
          data: {
            access: access.user
          }
        })
        .state('supports.list', {
          url: '',
          views: {
            'content@': {
              templateUrl: 'views/partials/supports/tickets.list.html',
              controller: 'SupportCtrl'
            }
          },
          data: {
            access: access.public
          }
        })
        .state('supports.new', {
          url: 'new',
          views: {
            'content@': {
              templateUrl: 'views/partials/supports/tickets.new.html',
              controller: 'NewSupportCtrl'
            }
          }
        })
        .state('supports.view', {
          url: ':id/',
          views: {
            'content@': {
              templateUrl: 'views/partials/supports/tickets.view.html',
              controller: 'ViewSupportCtrl'
            }
          }
        })
        .state('supports.edit', {
          url: ':id/edit',
          views: {
            'content@': {
              templateUrl: 'views/partials/supports/tickets.edit.html',
              controller: 'EditSupportCtrl'
            }
          }
        });

        // Admin controllers
        $stateProvider
            .state('admin', {
                abstract: true,
                parent: 'site',
                views: {
                  'content@': {
                    templateUrl: 'views/partials/admin/layout.html'
                  }
                },
                data: {
                    access: access.admin
                }
            })
            .state('admin.users', {
                abstract: true,
                url: '/users/',
                views: {
                  '': {
                    templateUrl: 'views/partials/admin/users/layout.html'
                  }
                }
            })
            .state('admin.users.list', {
                url: 'list/:page?',
                views: {
                  '': {
                    templateUrl: 'views/partials/admin/users/users.list.html',
                    controller: 'AdminUserCtrl'
                  }
                }
            })
            .state('admin.users.edit', {
                url: ':id',
                views: {
                  '': {
                    templateUrl: 'views/partials/admin/users/users.edit.html',
                    controller: 'UserEditCtrl'
                  }
                },
                resolve: {
                    user: ['UserFactory', '$stateParams', function(UserFactory, $stateParams){
                        return UserFactory.get({id: $stateParams.id});
                    }],
                    roles: ['RoleFactory', function(RoleFactory){
                        return RoleFactory.query();
                    }]
                }
            })
            .state('admin.products', {
                abstract: true,
                url: '/admin/products/',
                // Example of loading a template from a file. This is also a top level state,
                // so this template file will be loaded and then inserted into the ui-view
                // within index.html.
                views: {
                  '': {
                    templateUrl: 'views/partials/admin/products/layout.html'
                  }
                }
            })
            .state('admin.products.list', {
                url: '',
                views: {
                  '': {
                    templateUrl: 'views/partials/admin/products/products.list.html',
                    controller: 'AdminProductCtrl'
                  }
                }
            })
            .state('admin.products.new', {
                url: 'new',
                views: {
                  '': {
                    templateUrl: 'views/partials/admin/products/products.new.html',
                    controller: 'NewProductCtrl'
                  }
                }
            })
            .state('admin.products.edit', {
                url: ':id/edit',
                views: {
                  '': {
                    templateUrl: 'views/partials/admin/products/products.edit.html',
                    controller: 'EditProductCtrl'
                  }
                },
                resolve: {
                    product: ['products', '$stateParams', function(products, $stateParams){
                        return products.get({id: $stateParams.id});
                    }],
                    optionTypesData: ['optionTypes', function(optionTypes){
                        return optionTypes.index();
                    }],
                    taxonsData: ['taxons', function(taxons){
                        return taxons.index();
                    }]
                }
            })
            .state('admin.products.clone', {
                url: ':id/clone',
                views: {
                  '': {
                    templateUrl: 'views/partials/admin/products/products.clone.html',
                    controller: 'CloneProductCtrl'
                  }
                },
                resolve: {
                    product: ['products', '$stateParams', function(products, $stateParams){
                        return products.get({id: $stateParams.id});
                    }],
                    optionTypesData: ['optionTypes', function(optionTypes){
                        return optionTypes.index();
                    }],
                    taxonsData: ['taxons', function(taxons){
                        return taxons.index();
                    }]
                }
            })
            .state('admin.products.option_types', {
                abstract: true,
                url: 'option_types/',
                template: '<ui-view/>'
            })
            .state('admin.products.option_types.list', {
                url: '',
                views: {
                  '': {
                    templateUrl: 'views/partials/admin/option_types/option_types.list.html',
                    controller: 'AdminOptionTypeCtrl'
                  }
                }
            })
            .state('admin.products.option_types.edit', {
                url: ':id',
                views: {
                  '': {
                    templateUrl: 'views/partials/admin/option_types/option_types.edit.html',
                    controller: 'EditOptionTypeCtrl'
                  }
                },
                resolve: {
                    optionType: ['optionTypes', '$stateParams', function(optionTypes, $stateParams){
                        optionTypes.get({id: $stateParams.id}, function(err, data){
                            return data;
                        });
                    }]
                }
            })
            .state('admin.products.taxonomies', {
                abstract: true,
                url: 'taxonomies/',
                template: '<ui-view/>'
            })
            .state('admin.products.taxonomies.list', {
                url: '',
                views: {
                  '': {
                    templateUrl: 'views/partials/admin/taxonomies/taxonomies.list.html',
                    controller: 'AdminTaxonomyCtrl'
                  }
                }
            })
            .state('admin.products.taxonomies.edit', {
                url: ':id',
                views: {
                  '': {
                    templateUrl: 'views/partials/admin/taxonomies/taxonomies.edit.html',
                    controller: 'EditTaxonomyCtrl'
                  }
                }
            })
            .state('admin.products.taxons', {
                abstract: true,
                url: 'taxons/',
                template: '<ui-view/>'
            })
            .state('admin.products.taxons.list', {
                url: '',
                views: {
                  '': {
                    templateUrl: 'views/partials/admin/taxons/taxons.list.html',
                    controller: 'AdminTaxonCtrl'
                  }
                }
            })
            .state('admin.products.variants', {
                abstract: true,
                url: ':product_id/variants/',
                templateUrl: 'views/partials/admin/variants/layout.html'

            })
            .state('admin.products.variants.list', {
                url: '',
                views: {
                  '': {
                    templateUrl: 'views/partials/admin/variants/variants.list.html',
                    controller: 'AdminVariantCtrl'
                  }
                }
            })
            .state('admin.products.variants.edit', {
                url: ':id/',
                views: {
                  '': {
                    templateUrl: 'views/partials/admin/variants/variants.edit.html',
                    controller: 'EditVariantCtrl'
                  }
                },
                resolve: {
                    variantData: ['variants', '$stateParams', function(variants, $stateParams){
                        variants.get({id: $stateParams.id}, function(err, data){
                            return data;
                        });
                    }]
                }
            })
            .state('admin.products.assets', {
                abstract: true,
                url: ':product_id/assets/',
                templateUrl: 'views/partials/admin/assets/layout.html'

            })
            .state('admin.products.assets.list', {
                url: '',
                views: {
                  '': {
                    templateUrl: 'views/partials/admin/assets/assets.list.html',
                    controller: 'AdminAssetCtrl'
                  }
                }
            })
            .state('admin.products.assets.edit', {
                url: ':id',
                views: {
                  '': {
                    templateUrl: 'views/partials/admin/assets/assets.edit.html',
                    controller: 'EditAssetCtrl'
                  }
                }
            })

            .state('admin.products.shipping_methods', {
                abstract: true,
                url: 'shipping_methods/',
                template: '<ui-view/>'
            })
            .state('admin.products.shipping_methods.list', {
                url: '',
                views: {
                  '': {
                    templateUrl: 'views/partials/admin/shipping_methods/shipping_methods.list.html',
                    controller: 'AdminShippingMethodCtrl'
                  }
                }
            })
            .state('admin.products.shipping_methods.edit', {
                url: ':id/',
                views: {
                  '': {
                    templateUrl: 'views/partials/admin/shipping_methods/shipping_methods.edit.html',
                    controller: 'EditShippingMethodCtrl'
                  }
                },
                resolve: {
                    shippingMethod: ['shippingMethods', '$stateParams', function(shippingMethods, $stateParams){
                        return shippingMethods.get({id: $stateParams.id});
                    }]
                }
            })

            .state('admin.products.payment_methods', {
                abstract: true,
                url: 'payment_methods/',
                template: '<ui-view/>'
            })
            .state('admin.products.payment_methods.list', {
                url: '',
                views: {
                  '': {
                    templateUrl: 'views/partials/admin/payment_methods/payment_methods.list.html',
                    controller: 'AdminPaymentMethodCtrl'
                  }
                }
            })
            .state('admin.products.payment_methods.edit', {
                url: ':id/',
                views: {
                  '': {
                    templateUrl: 'views/partials/admin/payment_methods/payment_methods.edit.html',
                    controller: 'EditPaymentMethodCtrl'
                  }
                },
                resolve: {
                    paymentMethod: ['paymentMethods', '$stateParams', function(paymentMethods, $stateParams){
                        return paymentMethods.get({id: $stateParams.id});
                    }]
                }
            })

            .state('admin.orders', {
                abstract: true,
                url: '/admin/orders/',
                templateUrl: 'views/partials/admin/orders/layout.html'

            })
            .state('admin.orders.list', {
                url: '',
                views: {
                  '': {
                    templateUrl: 'views/partials/admin/orders/orders.list.html',
                    controller: 'AdminOrderCtrl'
                  }
                }
            })
            .state('admin.orders.edit', {
              url: ':id',
              views: {
                '': {
                  templateUrl: 'views/partials/admin/orders/orders.edit.html',
                  controller: 'EditOrderCtrl'
                }
              }
            })
            .state('admin.orders.state_changes', {
              url: ':id/state_changes',
              views: {
                '': {
                  templateUrl: 'views/partials/admin/orders/orders.state_changes.html',
                  controller: 'StateChangeCtrl'
                }
              }
            })
            //Admin forums
            .state('admin.forums', {
                abstract: true,
                url: '/admin/forums/',
                templateUrl: 'views/partials/admin/forums/layout.html'

            })
            .state('admin.forums.list', {
                url: '',
                views: {
                  '': {
                    templateUrl: 'views/partials/admin/forums/forums.list.html',
                    controller: 'AdminForumCtrl'
                  }
                }
            })
            .state('admin.forums.new', {
                url: ':id/new/',
                views: {
                  '': {
                    templateUrl: 'views/partials/admin/forums/forums.new.html',
                    controller: 'NewForumCtrl'
                  }
                }
            })
            .state('admin.forums.edit', {
                url: ':id/edit/',
                views: {
                  '': {
                    templateUrl: 'views/partials/admin/forums/forums.edit.html',
                    controller: 'EditForumCtrl'
                  }
                }
            })
          //Admin Support
          .state('admin.supports', {
            abstract: true,
            url: '/admin/supports/',
            template: '<ui-view/>'
           })
          .state('admin.supports.list', {
            url: '',
            views: {
              '': {
                templateUrl: 'views/partials/admin/supports/tickets.list.html',
                controller: 'AdminSupportCtrl'
              }
            }
          })
          .state('admin.supports.view', {
            url: ':id/',
            views: {
              '': {
                templateUrl: 'views/partials/admin/supports/tickets.view.html',
                controller: 'ViewAdminSupportCtrl'
              }
            }
          })
          .state('admin.supports.edit', {
            url: ':id/edit',
            views: {
              '': {
                templateUrl: 'views/partials/admin/supports/tickets.edit.html',
                controller: 'EditAdminSupportCtrl'
              }
            }
          });

    }
]);
