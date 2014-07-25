/*
req.db.
{ validators:
     { required: [Function],
     notEmptyString: [Function],
     rangeNumber: [Function],
     rangeLength: [Function],
     insideList: [Function],
     outsideList: [Function],
     password: [Function],
     patterns:
         { match: [Function],
         hexString: [Function],
         email: [Function],
         ipv4: [Function] },
     equalToProperty: [Function],
     unique: [Function] },
 enforce:
     { security:
         { username: [Function],
         password: [Function],
         creditcard: [Function] },
     patterns:
         { match: [Function],
         hexString: [Function],
         email: [Function],
         ipv4: [Function] },
     ranges: { number: [Function], length: [Function] },
     lists: { inside: [Function], outside: [Function] },
     required: [Function],
     notEmptyString: [Function],
     Enforce: [Function: Enforce],
     equalToProperty: [Function],
     unique: [Function] },
 settings: { set: [Function], get: [Function], unset: [Function] },
 driver_name: 'mysql',

 driver:
     { dialect: 'mysql',
     config:
         { protocol: 'mysql',
         query: {},
         host: '127.0.0.1',
         port: 3306,
         database: 'nodestore',
         user: 'root',
         password: 'root',
         debug: false,
         checkExpirationInterval: 900000,
         expiration: 86400000,
         autoReconnect: true,
         reconnectDelay: 200,
         maxReconnectAttempts: 25,
         timezone: 'local' },
         opts: { debug: false, pool: true, settings: [Object] },
         customTypes: {},

req.db.driver.
     query:
        { escape: [Function],
         escapeId: [Function],
         escapeVal: [Function],
         create: [Function],
         select: [Function],
         insert: [Function],
         update: [Function],
         remove: [Function] },
     db:
         { domain: null,
         _events: [Object],
         _maxListeners: 10,
         config: [Object],
         _socket: undefined,
         _protocol: [Object],
         _connectCalled: false,
         state: 'disconnected',
         threadId: null,
         pool: [Object] },
     aggregate_functions:
         [ 'ABS',
         'CEIL',
         'FLOOR',
         'ROUND',
         'AVG',
         'MIN',
         'MAX',
         'LOG',
         'LOG2',
         'LOG10',
         'EXP',
         'POWER',
         'ACOS',
         'ASIN',
         'ATAN',
         'COS',
         'SIN',
         'TAN',
         'CONV',
         [Object],
         'RADIANS',
         'DEGREES',
         'SUM',
         'COUNT',
         'DISTINCT' ],
     uid: '1598feb39413c03abd68ed47f54fb059' },

req.db.
 tools:
     { between: [Function],
     not_between: [Function],
     like: [Function],
     eq: [Function],
     ne: [Function],
     gt: [Function],
     gte: [Function],
     lt: [Function],
     lte: [Function],
     not_in: [Function] },
 ...

 */

module.exports = {
    //search products POST, GET
    index2: function(req, res, next) {
        //console.log(req);
        var Role = req.models.roles;
        var Product = req.models.products;
        var perPages = 20;
        var page = parseInt(req.params['page']) || 1;
        if( isNaN(page) || page < 1) page = 1;
        console.log('>>req.body:'+ JSON.stringify(req.body));
        console.log('>> page:'+ page);

        var name = req.body.name || "";
        var sku = req.body.sku;
        var deleted = req.body.deleted;

        var conditions = {};
        if(name && name.length !== 0) {
            name = '%'+name+'%';
            conditions.name = req.db.tools.like(name);
        }
        if(sku && sku.length !== 0) {
            sku = '%'+sku+'%';
            conditions.variant = {sku : req.db.tools.like(sku)};
        }

        if(deleted === undefined || deleted === false) conditions.deleted_at = null;
        console.log('>>conditions:'+ JSON.stringify(conditions));
        console.log(conditions);
        Product.find(conditions).order('-id').limit(perPages).offset((page -1)*perPages).run(function(err, products) {
            if (err) {
                console.log(">>error:"+ err);
                return next(err);
            }
            console.log('>>products:'+ JSON.stringify(products));
//            var listUsers = [];
//            async.eachSeries(users, function(user, callback){
//                Role.get(user.role_id, function(err, role){
//                    user.role = role;
//                    listUsers.push(user);
//                    callback();
//                });
//            }, function(err){
//                if(err) return next(err);
//                User.count(conditions, function(err, count){
//                    console.log('>> users.index count:'+ count);
//                    res.json({
//                        users: listUsers,
//                        count: count,
//                        page: page
//                    })
//                });
//
//            });
        });
    },

    index: function(req, res, next) {
        //console.log(req);
        var Query = req.db.driver.query;
        var Role = req.models.roles;
        var Product = req.models.products;
        var perPages = 10;
        var page = parseInt(req.params['page']) || 1;
        if( isNaN(page) || page < 1) page = 1;
        console.log('>>req.body:'+ JSON.stringify(req.body));
        console.log('>> page:'+ page);

        var name = req.body.name || "";
        var sku = req.body.sku;
        var deleted = req.body.deleted;

        var conditions = {};
        if(name && name.length !== 0) {
            name = '%'+Query.escape(name)+'%';
            conditions.name = name;
        }
        if(sku && sku.length !== 0) {
            sku = '%'+ Query.escape(sku)+'%';
            conditions.sku = sku;
        }

        if(deleted === undefined || deleted === false) conditions.deleted_at = 'IS NULL';
        console.log('>>conditions:'+ JSON.stringify(conditions));
        console.log(conditions);
//        Product.find(conditions).order('-id').limit(perPages).offset((page -1)*perPages).run(function(err, products) {
//            if (err) {
//                console.log(">>error:"+ err);
//                return next(err);
//            }
//            console.log('>>products:'+ JSON.stringify(products));
//        });
        var where = '';

        if(conditions.name) {
            where += ' and LOWER(p.name) like '+ Query.escapeVal(conditions.name);
        }
        if(conditions.sku){
            where += ' and LOWER(v.sku) like '+ Query.escapeVal(conditions.sku);
        }
        if(conditions.deleted_at){
            where += ' and p.deleted_at '+ conditions.deleted_at;
        }

        var sql = 'SELECT p.id, p.name, v.id as variant_id, v.sku, v.price, v.cost_price, v.cost_currency FROM products p, variants v '+
            ' WHERE p.id = v.product_id and v.is_master=true '+ where +
            ' ORDER BY v.sku ';
        console.log('>> query:'+ sql);

        req.db.driver.execQuery( sql + ' LIMIT ? OFFSET ?;',[perPages, (page - 1)* perPages]
            , function(err, products){
                if(err) return next(err);
                console.log('>>products:'+ JSON.stringify(products));
                //req.db.driver.execQuery('SELECT FOUND_ROWS() AS cnt;', function(err, row){
                req.db.driver.execQuery('SELECT count(*) AS cnt FROM ('+sql +') p LIMIT 1;', function(err, row){
                    if(err) return next(err);
                    console.log('>>row:'+ JSON.stringify(row));
                    res.json({
                        products: products,
                        count: row[0].cnt,
                        page: page
                    });

                });
            }
        );
    },
    // get '/admin/products/:id?color=red' --> req.params.id, req.query.color
    getProduct: function(req, res, next) {
        var id = req.params.id;
//        req.models.products.get( id,function(err, product) {
//            if (err) return next(err);
//            //console.log('>>get /admin/products/' + req.params.id);
//            console.log('>> product:' + JSON.stringify(product));
//            res.json( product);
//        });
        var sql = 'SELECT p.id, p.name, p.description, p.slug, p.available_on, p.meta_description, p.meta_keywords, p.shipping_category_id, '+
            ' v.id as variant_id, v.sku, v.price, v.cost_price, v.cost_currency, v.weight, v.height, v.width, v.depth '+
            ' FROM products p, variants v '+
            ' WHERE p.id = v.product_id and v.is_master=true and p.id = ? LIMIT 1';

        console.log('>> query:'+ sql);
        req.db.driver.execQuery( sql ,[id]
            , function(err, rows) {
                if (err) return next(err);
                console.log('>>rows:' + JSON.stringify(rows));
                res.json(rows[0])
            });
    },
    product: function(req, res, next) {
        var id = req.params.id;
        req.models.products.get( id,function(err, product) {
            if (err) return next(err);
            req.models.variants.one({product_id: product.id, is_master: true}, function(err, variant){
                if (err) return next(err);
                product.variant = variant;
                console.log('>> product:' + JSON.stringify(product));
                res.json( product);

            });
        });
    },

    updateProduct: function(req, res, next){
       console.log('>>req.body:');
       console.log(req.body);
       console.log(req.models.products);
       var productData = req.body;
       req.models.products.get(productData.id, function(err, product){
          if(err) return res.json(500, err);
          product.save(productData, function(err){
              if(err) return res.json(500, err);
              console.log('>> product data saved!');
              req.models.variants.get(productData.variant.id, function(err, variant){
                 if(err) return res.json(500, err);
                 variant.save(productData.variant, function(err){
                     if(err) return res.json(500, err);
                     console.log('>> variant data saved!');
                     res.json(200, 'product saved!');
                 });
              });
          });
       });

    }


};