var _ = require('underscore')
    , path = require('path')
    , userRoles = require('../frontend/app/scripts/common/routingConfig').userRoles
    , accessLevels = require('../frontend/app/scripts/common/routingConfig').accessLevels
    , SessionCtrl =  require('./controllers/auth/sessions')
    , UserCtrl =  require('./controllers/auth/users')
    , RoleCtrl =  require('./controllers/auth/roles')
    , MailCtrl =  require('./controllers/auth/mails')
    , ProductCtrl =  require('./controllers/products')
    , OptionTypeCtrl =  require('./controllers/option_types')
    , OptionValueCtrl =  require('./controllers/option_values')
    , TaxonomyCtrl =  require('./controllers/taxonomies')
    , TaxonCtrl =  require('./controllers/taxons')
    , VariantCtrl =  require('./controllers/variants')
    , AssetCtrl =  require('./controllers/assets')
    , OrderCtrl =  require('./controllers/orders')
    , ShippingMethodCtrl =  require('./controllers/shipping_methods')
    , PaymentMethodCtrl =  require('./controllers/payment_methods')
    , ShipmentCtrl =  require('./controllers/shipments')
    , ForumCtrl =  require('./controllers/forums')
    , TopicCtrl =  require('./controllers/topics')
    , ArticleCtrl =  require('./controllers/articles')
    ;

var routes = [

    // Views
//    {
//        path: '/partials/*',
//        httpMethod: 'GET',
//        middleware: [function (req, res) {
//            var requestedView = path.join('./', req.url);
//            res.render(requestedView);
//        }]
//    },
    // Local Auth
    {
        path: '/auth/session',
        httpMethod: 'POST',
        middleware: [SessionCtrl.login]
    },
    {
        path: '/auth/session',
        httpMethod: 'DELETE',
        middleware: [SessionCtrl.logout]
    },
    {
        path: '/auth/mail',
        httpMethod: 'GET',
        middleware: [MailCtrl.reset_password_token]
    },
    {
        path: '/auth/mail',
        httpMethod: 'POST',
        middleware: [MailCtrl.mail_password]
    },
    {
        path: '/auth/mail',
        httpMethod: 'PUT',
        middleware: [MailCtrl.reset_password]
    },

    // User resource
    {
        path: '/users',
        httpMethod: 'POST',
        middleware: [UserCtrl.createUser]
    },

    {
        path: '/users/page/:page?',
        httpMethod: 'GET',
        middleware: [UserCtrl.index],
        accessLevel: accessLevels.admin
    },
    {   //searchUsers
        path: '/users/page/:page?',
        httpMethod: 'POST',
        middleware: [UserCtrl.index],
        accessLevel: accessLevels.admin
    },

    {   //get user
        path: '/users/:id',
        httpMethod: 'GET',
        middleware: [UserCtrl.user],
        accessLevel: accessLevels.user
    },

    {
        path: '/users',
        httpMethod: 'PUT',
        middleware: [UserCtrl.changePassword],
        accessLevel: accessLevels.user
    },
    {
        path: '/users/:id',
        httpMethod: 'PUT',
        middleware: [UserCtrl.changeRole],
        accessLevel: accessLevels.admin
    },

    // Role resource
    {
        path: '/roles',
        httpMethod: 'GET',
        middleware: [RoleCtrl.index],
        accessLevel: accessLevels.user
    },

    // Product resource
    {   //search Products
        path: '/admin/products/page/:page?',
        httpMethod: 'GET',
        middleware: [ProductCtrl.index],
        accessLevel: accessLevels.admin
    },
    {
        path: '/admin/products/page/:page?',
        httpMethod: 'POST',
        middleware: [ProductCtrl.index],
        accessLevel: accessLevels.admin
    },
    {
        path: '/admin/products/:id/edit',
        httpMethod: 'GET',
        middleware: [ProductCtrl.product],
        accessLevel: accessLevels.admin
    },
    {
        path: '/admin/products/create_clone',
        httpMethod: 'POST',
        middleware: [ProductCtrl.createClone],
        accessLevel: accessLevels.admin
    },
    {
        path: '/admin/products/:id',
        httpMethod: 'GET',
        middleware: [ProductCtrl.product],
        accessLevel: accessLevels.admin
    },
    {
        path: '/admin/products/',
        httpMethod: 'POST',
        middleware: [ProductCtrl.createProduct],
        accessLevel: accessLevels.admin
    },
    {
        path: '/admin/products/:id',
        httpMethod: 'PUT',
        middleware: [ProductCtrl.updateProduct],
        accessLevel: accessLevels.admin
    },
    {
        path: '/admin/products/:id',
        httpMethod: 'DELETE',
        middleware: [ProductCtrl.deleteProduct],
        accessLevel: accessLevels.admin
    },
    // Products public
    {
        path: '/products/list',
        httpMethod: 'POST',
        middleware: [ProductCtrl.listProducts],
        accessLevel: accessLevels.public
    },
    {
        path: '/products/:id',
        httpMethod: 'GET',
        middleware: [ProductCtrl.viewProduct],
        accessLevel: accessLevels.public
    },

    // Orders Resource
    {
        path: '/carts/',
        httpMethod: 'POST',
        middleware: [OrderCtrl.addCart],
        accessLevel: accessLevels.user
    },
    {
        path: '/carts',
        httpMethod: 'GET',
        middleware: [OrderCtrl.getCart],
        accessLevel: accessLevels.user
    },
    {
        path: '/carts/update',
        httpMethod: 'POST',
        middleware: [OrderCtrl.updateCart],
        accessLevel: accessLevels.user
    },
    {
        path: '/orders/address',
        httpMethod: 'GET',
        middleware: [OrderCtrl.updateAddressState],
        accessLevel: accessLevels.user
    },
    {
        path: '/orders/address',
        httpMethod: 'POST',
        middleware: [OrderCtrl.saveAddress],
        accessLevel: accessLevels.user
    },
    {
        path: '/orders/shipment',
        httpMethod: 'POST',
        middleware: [OrderCtrl.saveShipment],
        accessLevel: accessLevels.user
    },
    {
        path: '/orders/payment',
        httpMethod: 'POST',
        middleware: [OrderCtrl.savePayment],
        accessLevel: accessLevels.user
    },
    {
        path: '/orders/confirm',
        httpMethod: 'POST',
        middleware: [OrderCtrl.confirmOrder],
        accessLevel: accessLevels.user
    },
    {
        path: '/orders/payment_methods',
        httpMethod: 'GET',
        middleware: [OrderCtrl.getPaymentMethods],
        accessLevel: accessLevels.user
    },
    {
        path: '/orders/',
        httpMethod: 'GET',
        middleware: [OrderCtrl.getOrder],
        accessLevel: accessLevels.user
    },
    {
        path: '/orders/:id(\\d+)',
        httpMethod: 'GET',
        middleware: [OrderCtrl.getOrderById],
        accessLevel: accessLevels.user
    },
    {
        path: '/orders/list/:page?',
        httpMethod: 'GET',
        middleware: [OrderCtrl.getOrderList],
        accessLevel: accessLevels.user
    },
    {
        path: '/admin/orders/search',
        httpMethod: 'POST',
        middleware: [OrderCtrl.searchOrders],
        accessLevel: accessLevels.admin
    },

    // Shipments resource
    {
        path: '/shipments/get_by_order_id',
        httpMethod: 'POST',
        middleware: [ShipmentCtrl.getByOrderId],
        accessLevel: accessLevels.user
    },

    //OptionTypes Resource
    {
        path: '/option_types',
        httpMethod: 'GET',
        middleware: [OptionTypeCtrl.index],
        accessLevel: accessLevels.admin
    },
    {
        path: '/option_types',
        httpMethod: 'POST',
        middleware: [OptionTypeCtrl.create],
        accessLevel: accessLevels.admin
    },
    {
        path: '/option_types/:id',
        httpMethod: 'GET',
        middleware: [OptionTypeCtrl.optionType],
        accessLevel: accessLevels.admin
    },
    {
        path: '/option_types/:id',
        httpMethod: 'PUT',
        middleware: [OptionTypeCtrl.updateOptionType],
        accessLevel: accessLevels.admin
    },
    {
        path: '/option_types/:id',
        httpMethod: 'DELETE',
        middleware: [OptionTypeCtrl.deleteOptionType],
        accessLevel: accessLevels.admin
    },
    {
        path: '/admin/option_types',
        httpMethod: 'POST',
        middleware: [OptionTypeCtrl.updatePosition],
        accessLevel: accessLevels.admin
    },
    // OptionValues Resource
    {
        path: '/option_values/:id',
        httpMethod: 'DELETE',
        middleware: [OptionValueCtrl.deleteOptionValue],
        accessLevel: accessLevels.admin
    },
    {
        path: '/admin/option_values',
        httpMethod: 'POST',
        middleware: [OptionValueCtrl.updatePosition],
        accessLevel: accessLevels.admin
    },
    {
        path: '/admin/option_values/change',
        httpMethod: 'POST',
        middleware: [OptionValueCtrl.changeOptionValues],
        accessLevel: accessLevels.admin
    },

    //Taxonomies resource
    {
        path: '/taxonomies',
        httpMethod: 'GET',
        middleware: [TaxonomyCtrl.index],
        accessLevel: accessLevels.admin
    },
    {
        path: '/taxonomies',
        httpMethod: 'POST',
        middleware: [TaxonomyCtrl.create],
        accessLevel: accessLevels.admin
    },
    {
        path: '/taxonomies/:id',
        httpMethod: 'GET',
        middleware: [TaxonomyCtrl.taxonomy],
        accessLevel: accessLevels.admin
    },
    {
        path: '/taxonomies/:id',
        httpMethod: 'DELETE',
        middleware: [TaxonomyCtrl.deleteTaxonomy],
        accessLevel: accessLevels.admin
    },
    {
        path: '/taxonomies/:id',
        httpMethod: 'PUT',
        middleware: [TaxonomyCtrl.updateTaxonomy],
        accessLevel: accessLevels.admin
    },
    {
        path: '/admin/taxonomies',
        httpMethod: 'POST',
        middleware: [TaxonomyCtrl.updatePosition],
        accessLevel: accessLevels.admin
    },

    //Taxons resource
    {
        path: '/taxons',
        httpMethod: 'GET',
        middleware: [TaxonCtrl.index],
        accessLevel: accessLevels.public
    },
    {
        path: '/taxons/products',
        httpMethod: 'POST',
        middleware: [TaxonCtrl.products],
        accessLevel: accessLevels.public
    },

    //Shipping Method Resource
    {
        path: '/shipping_methods',
        httpMethod: 'GET',
        middleware: [ShippingMethodCtrl.index],
        accessLevel: accessLevels.admin
    },
    {
        path: '/shipping_methods',
        httpMethod: 'POST',
        middleware: [ShippingMethodCtrl.create],
        accessLevel: accessLevels.admin
    },
    {
        path: '/shipping_methods/:id',
        httpMethod: 'GET',
        middleware: [ShippingMethodCtrl.shippingMethod],
        accessLevel: accessLevels.admin
    },
    {
        path: '/shipping_methods/:id',
        httpMethod: 'PUT',
        middleware: [ShippingMethodCtrl.updateShippingMethod],
        accessLevel: accessLevels.admin
    },
    {
        path: '/shipping_methods/:id',
        httpMethod: 'DELETE',
        middleware: [ShippingMethodCtrl.deleteShippingMethod],
        accessLevel: accessLevels.admin
    },
    {
        path: '/admin/shipping_methods',
        httpMethod: 'POST',
        middleware: [ShippingMethodCtrl.updatePosition],
        accessLevel: accessLevels.admin
    },

    //Payment Method Resource
    {
        path: '/payment_methods',
        httpMethod: 'GET',
        middleware: [PaymentMethodCtrl.index],
        accessLevel: accessLevels.admin
    },
    {
        path: '/payment_methods',
        httpMethod: 'POST',
        middleware: [PaymentMethodCtrl.create],
        accessLevel: accessLevels.admin
    },
    {
        path: '/payment_methods/:id',
        httpMethod: 'GET',
        middleware: [PaymentMethodCtrl.paymentMethod],
        accessLevel: accessLevels.admin
    },
    {
        path: '/payment_methods/:id',
        httpMethod: 'PUT',
        middleware: [PaymentMethodCtrl.updatePaymentMethod],
        accessLevel: accessLevels.admin
    },
    {
        path: '/payment_methods/:id',
        httpMethod: 'DELETE',
        middleware: [PaymentMethodCtrl.deletePaymentMethod],
        accessLevel: accessLevels.admin
    },
    {
        path: '/admin/payment_methods',
        httpMethod: 'POST',
        middleware: [PaymentMethodCtrl.updatePosition],
        accessLevel: accessLevels.admin
    },

    // Variants resource
    {
        path: '/admin/variants/search',
        httpMethod: 'POST',
        middleware: [VariantCtrl.searchVariants],
        accessLevel: accessLevels.admin
    },
    {
        path: '/variants/',
        httpMethod: 'POST',
        middleware: [VariantCtrl.create],
        accessLevel: accessLevels.admin
    },
    {
        path: '/variants/:id',
        httpMethod: 'GET',
        middleware: [VariantCtrl.variant],
        accessLevel: accessLevels.admin
    },
    {
        path: '/variants/:id',
        httpMethod: 'PUT',
        middleware: [VariantCtrl.updateVariant],
        accessLevel: accessLevels.admin
    },
    {
        path: '/variants/:id',
        httpMethod: 'DELETE',
        middleware: [VariantCtrl.deleteVariant],
        accessLevel: accessLevels.admin
    },
    {
        path: '/admin/variants/position',
        httpMethod: 'POST',
        middleware: [VariantCtrl.updatePosition],
        accessLevel: accessLevels.admin
    },

    // Assets Resource
    {
        path: '/admin/assets/position',
        httpMethod: 'POST',
        middleware: [AssetCtrl.updatePosition],
        accessLevel: accessLevels.admin
    },
    {
        path: '/assets/:id',
        httpMethod: 'DELETE',
        middleware: [AssetCtrl.deleteAsset],
        accessLevel: accessLevels.admin
    },
    {
        path: '/admin/products/:product_id/assets/',
        httpMethod: 'POST',
        middleware: [AssetCtrl.createVariantAsset],
        accessLevel: accessLevels.admin
    },
    {
        path: '/admin/products/:product_id/assets/',
        httpMethod: 'GET',
        middleware: [AssetCtrl.productAssets],
        accessLevel: accessLevels.admin
    },
    {
        path: '/admin/products/:product_id/assets/:id',
        httpMethod: 'GET',
        middleware: [AssetCtrl.getProductAsset],
        accessLevel: accessLevels.admin
    },
    {
        path: '/admin/products/:product_id/assets/:id',
        httpMethod: 'POST',
        middleware: [AssetCtrl.updateVariantAsset],
        accessLevel: accessLevels.admin
    },
    //Forums Resource
    {
        path: '/admin/forums/search',
        httpMethod: 'POST',
        middleware: [ForumCtrl.index],
        accessLevel: accessLevels.public
    },
    {
        path: '/admin/forums/add',
        httpMethod: 'POST',
        middleware: [ForumCtrl.add],
        accessLevel: accessLevels.admin
    },
    {
        path: '/admin/forums/:id(\\d+)',
        httpMethod: 'GET',
        middleware: [ForumCtrl.edit],
        accessLevel: accessLevels.admin
    },
    {
        path: '/admin/forums/:id',
        httpMethod: 'PUT',
        middleware: [ForumCtrl.update],
        accessLevel: accessLevels.admin
    },
    {
        path: '/admin/forums/:id(\\d+)',
        httpMethod: 'DELETE',
        middleware: [ForumCtrl.remove],
        accessLevel: accessLevels.admin
    },
    {
        path: '/admin/forums/rebuild_tree',
        httpMethod: 'GET',
        middleware: [ForumCtrl.rebuildTree],
        accessLevel: accessLevels.admin
    },
    {
        path: '/admin/forums/create_root',
        httpMethod: 'GET',
        middleware: [ForumCtrl.createRoot],
        accessLevel: accessLevels.admin
    },

    //Forum Topics Resource
    {
        path: '/forums/topics/search',
        httpMethod: 'POST',
        middleware: [TopicCtrl.index],
        accessLevel: accessLevels.public
    },
    {//add new topics
        path: '/forums/:forum_id/topics',
        httpMethod: 'POST',
        middleware: [TopicCtrl.add],
        accessLevel: accessLevels.user
    },
    {//create topic with file attachment
        path: '/forums/topics/upload',
        httpMethod: 'POST',
        middleware: [TopicCtrl.uploadTopic],
        accessLevel: accessLevels.user
    },
    {//update topic's post with file attachment
        path: '/forums/topics/save_post',
        httpMethod: 'POST',
        middleware: [TopicCtrl.savePost],
        accessLevel: accessLevels.user
    },
    {//view topic
        path: '/forums/:forum_id/topics/:id',
        httpMethod: 'GET',
        middleware: [TopicCtrl.viewTopic],
        accessLevel: accessLevels.public
    },
    {//delete topic
        path: '/forums/:forum_id/topics/:id',
        httpMethod: 'DELETE',
        middleware: [TopicCtrl.deleteTopic],
        accessLevel: accessLevels.user
    },
    {
        path: '/forums/topics/reply',
        httpMethod: 'POST',
        middleware: [TopicCtrl.replyPost],
        accessLevel: accessLevels.user
    },
    {
        path: '/forums/topics/delete_post',
        httpMethod: 'POST',
        middleware: [TopicCtrl.deletePost],
        accessLevel: accessLevels.user
    },
    {
        path: '/forums/topics/post',
        httpMethod: 'POST',
        middleware: [TopicCtrl.updatePost],
        accessLevel: accessLevels.user
    },
    {
        path: '/forums/topics/sticky',
        httpMethod: 'POST',
        middleware: [TopicCtrl.setSticky],
        accessLevel: accessLevels.admin
    },
    {
        path: '/forums/topics/locked',
        httpMethod: 'POST',
        middleware: [TopicCtrl.setLocked],
        accessLevel: accessLevels.user
    },

    //News Article Resource
    {
        path: '/articles/search',
        httpMethod: 'POST',
        middleware: [ArticleCtrl.index],
        accessLevel: accessLevels.public
    },
    {//create article with file attachment
        path: '/articles/upload',
        httpMethod: 'POST',
        middleware: [ArticleCtrl.uploadArticle],
        accessLevel: accessLevels.admin
    },
    {//update article with file attachment
        path: '/articles/save_article',
        httpMethod: 'POST',
        middleware: [ArticleCtrl.saveArticle],
        accessLevel: accessLevels.admin
    },
    {//view article
        path: '/articles/:id(\\d+)',
        httpMethod: 'GET',
        middleware: [ArticleCtrl.viewArticle],
        accessLevel: accessLevels.public
    },
    {//delete article
        path: '/articles/:id(\\d+)',
        httpMethod: 'DELETE',
        middleware: [ArticleCtrl.deleteArticle],
        accessLevel: accessLevels.admin
    },

    // All other get requests should be handled by AngularJS's client-side routing system
    {
        path: '/*',
        httpMethod: 'GET',
        middleware: [function(req, res) {
            var role = userRoles.public, email = '';
            if(req.user) {
                role = req.user.role;
                email = req.user.email;
            
                res.cookie('user', JSON.stringify({
                    'email': email,
                    'role': role
                }));
            }
            res.render('index');
        }]
    }
];

module.exports = function(app) {
    
    _.each(routes, function(route) {
        route.middleware.unshift(ensureAuthorized);
        var args = _.flatten([route.path, route.middleware]);

        switch(route.httpMethod.toUpperCase()) {
            case 'GET':
                app.get.apply(app, args);
                break;
            case 'POST':
                app.post.apply(app, args);
                break;
            case 'PUT':
                app.put.apply(app, args);
                break;
            case 'DELETE':
                app.delete.apply(app, args);
                break;
            default:
                throw new Error('Invalid HTTP method specified for route ' + route.path);
                break;
        }
    });
}

function ensureAuthorized(req, res, next) {
    var role;
    //var accessLevel = _.findWhere(routes, { path: req.route.path, httpMethod: req.route.method.toUpperCase() }).accessLevel || accessLevels.public;
    var accessLevel = _.findWhere(routes, { path: req.route.path, httpMethod: req.method.toUpperCase() }).accessLevel || accessLevels.public;
    if(!req.user) role = userRoles.public;
    else if(req.user.role) role = req.user.role;
    if(role) {
        //console.log('>>ensureAuthorized req.user:');
        //console.log(JSON.stringify(req.user));
        if (!(accessLevel.bit_mask & role.bit_mask)) return res.status(403).end();
        return next();
    } else if(req.user) {
        var Role = req.models.roles;
        Role.get(req.user.role_id, function(err, role){
            req.user.role = role;

            if (!(accessLevel.bit_mask & role.bit_mask)) return res.status(403).end();
            return next();
        });
    }
}
