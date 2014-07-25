var _ =           require('underscore')
    , path =      require('path')
    //, passport =  require('passport')
    , userRoles = require('../frontend/app/scripts/common/routingConfig').userRoles
    , accessLevels = require('../frontend/app/scripts/common/routingConfig').accessLevels
    //, User =      require('./models/user')
    , SessionCtrl =  require('./controllers/auth/session')
    , UserCtrl =  require('./controllers/auth/users')
    , RoleCtrl =  require('./controllers/auth/roles')
    , ProductCtrl =  require('./controllers/products')
    , OptionTypeCtrl =  require('./controllers/option_types')
    , OptionValueCtrl =  require('./controllers/option_values')
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
        path: '/users',
        httpMethod: 'POST',
        middleware: [UserCtrl.changeRole],
        accessLevel: accessLevels.admin
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
        path: '/products/:id',
        httpMethod: 'GET',
        middleware: [ProductCtrl.product],
        accessLevel: accessLevels.admin
    },
    {
        path: '/products/:id',
        httpMethod: 'PUT',
        middleware: [ProductCtrl.updateProduct],
        accessLevel: accessLevels.admin
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

    // All other get requests should be handled by AngularJS's client-side routing system
    {
        path: '/*',
        httpMethod: 'GET',
        middleware: [function(req, res) {
            var role = userRoles.public, email = '';
            if(req.user) {
                role = req.user.role;
                email = req.user.email;
            }
            res.cookie('user', JSON.stringify({
                'email': email,
                'role': role
            }));
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
        if (!(accessLevel.bit_mask & role.bit_mask)) return res.send(403);
        return next();
    } else if(req.user) {
        var Role = req.models.roles;
        Role.get(req.user.role_id, function(err, role){
            req.user.role = role;

            if (!(accessLevel.bit_mask & role.bit_mask)) return res.send(403);
            return next();
        });
    }
}
