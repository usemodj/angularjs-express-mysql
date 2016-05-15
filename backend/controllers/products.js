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
var log = require('log4js').getLogger('products');
var markdown = require('markdown').markdown;
var _ = require('underscore');
var async = require('async');

module.exports = {

    //Admin index
    index: function(req, res, next) {
        //console.log(req);
        var Query = req.db.driver.query;
        //var Role = req.models.roles;
        //var Product = req.models.products;
        var perPages = 10;
        var page = parseInt(req.params['page']) || 1;
        if( isNaN(page) || page < 1) page = 1;
        log.debug('>>req.body:'+ JSON.stringify(req.body));
        log.debug('>> page:'+ page);

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
        //console.log('>>conditions:'+ JSON.stringify(conditions));
        //console.log(conditions);

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

        var sql = 'SELECT p.id, p.name, p.deleted_at, p.available_on, v.id as variant_id, v.sku, v.price, v.cost_price, v.cost_currency FROM products p, variants v '+
            ' WHERE p.id = v.product_id and v.is_master=true '+ where +
            ' ORDER BY v.sku ';
        //console.log('>> query:'+ sql);

        req.db.driver.execQuery( sql + ' LIMIT ? OFFSET ?;',[perPages, (page - 1)* perPages]
            , function(err, products){
                if(err) return next(err);
                //console.log('>>products:'+ JSON.stringify(products));
                req.db.driver.execQuery('SELECT count(*) AS cnt FROM ('+sql +') p LIMIT 1;', function(err, row){
                    if(err) return next(err);
                    //console.log('>>row:'+ JSON.stringify(row));
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
//    getProduct: function(req, res, next) {
//        var id = req.params.id;
//        var sql = 'SELECT p.id, p.name, p.description, p.slug, p.available_on, p.meta_description, p.meta_keywords, p.shipping_category_id, '+
//            ' v.id as variant_id, v.sku, v.price, v.cost_price, v.cost_currency, v.weight, v.height, v.width, v.depth '+
//            ' FROM products p, variants v '+
//            ' WHERE p.id = v.product_id and v.is_master=true and p.id = ? LIMIT 1';
//
//        //console.log('>> query:'+ sql);
//        req.db.driver.execQuery( sql ,[id]
//            , function(err, rows) {
//                if (err) return next(err);
//                console.log('>>rows:' + JSON.stringify(rows));
//                res.json(rows[0])
//            });
//    },

    product: function(req, res, next) {
        var Product = req.models.products;
        var OptionType = req.models.option_types;
        var Variant = req.models.variants;
        var id = req.params.id || req.body.id;
        //console.log(req.params);
        Product.get( id,function(err, product) {
            if (err) return next(err);
            log.debug('>> product: ' + JSON.stringify(product));
            //Product.findByVariants({ product_id: product.id, is_master: true}, function(err, variants){
            //    log.debug('>> product variants: ' + JSON.stringify(variants));
            //});
            Variant.one({product_id: product.id, is_master: true}, function(err, variant){
                if (!err) product.variant = variant;
                log.debug('>> variant:'+ JSON.stringify(variant));

                req.db.driver.execQuery('SELECT o.* FROM products p, products_option_types po, option_types o ' +
                      ' WHERE p.id = po.products_id AND po.option_types_id = o.id AND p.id = ? '+
                      ' ORDER BY position ',[product.id], function( err, data){
                //product.getOptionTypes(function(err, data){
                    if(!err) product.option_types = data;
                    log.debug('>> product.option_types: '+ JSON.stringify(product.option_types));
                    async.eachSeries(product.option_types, function(optionType, callback){
                        //console.log(optionType);
                        OptionType.get(optionType.id, function(err, data){
                            if(err) return res.status(500).json(err);
                            data.getOption_values(function(err, values){
                                if(err) return res.status(500).json(err);
                                optionType.option_values = values;
                                callback();
                            });
                        });
                    }, function(err){
                        if(err) return res.status(500).json(err);
                        var taxons_sql= 'SELECT t.* FROM products p, products_taxons pt, taxons t ' +
                            ' WHERE p.id = pt.products_id AND pt.taxons_id = t.id AND p.id = ? ' +
                            ' ORDER BY position; ';
                        req.db.driver.execQuery(taxons_sql, [product.id], function(err, data){
                            if(err) return res.status(500).json(err);
                            product.taxons = data;
                            //console.log('>> product:' + JSON.stringify(product));
                            res.status(200).json( product);
                        })

                    });
                });

            });
        });
    },

    createProduct: function(req, res, next){
        var body = req.body;
        log.debug(body);
        var Product = req.models.products;
        var Variant = req.models.variants;
        var conditions = {
            name: body.name,
            slug: body.slug,
            available_on: body.available_on
        };
        Product.create( conditions, function(err, product){
            if(err) return next(err);
            var variant = body.variant;
            variant.is_master = true;
            variant.product_id = product.id;

            log.debug(variant);
            Variant.create(variant, function(err, data){
                if(err) {
                    product.remove();
                    log.error(err);
                    return next(err);
                }

                res.json(product);
            });

        });
    },

    createClone: function(req, res, next){
        var Product = req.models.products;
        var Taxon = req.models.taxons;
        var OptionType = req.models.option_types;
        var Variant = req.models.variants;

        var productData = req.body;
        var taxon_ids = productData.taxon_ids || [];
        var option_type_ids = productData.option_type_ids || [];
        var conditions = {
            name: productData.name,
            description: productData.description,
            available_on: productData.available_on,
            slug: productData.slug,
            meta_description: productData.meta_description,
            meta_keywords: productData.meta_keywords
        };
        log.debug(productData);

        Product.create(conditions, function(err, product){
            if(err) return next(err);
            log.debug('>> product data saved!');
            productData.variant.is_master = true;
            productData.variant.id = null;

            Variant.create(productData.variant, function(err, variant){
                if(err) return next(err);
                log.debug('>> variant created!');
                product.setVariants(variant, function(err){});
                var optionTypes = [];
                async.eachSeries(option_type_ids, function(option_type_id, callback){
                    OptionType.get(option_type_id, function(err, optionType){
                        optionTypes.push(optionType);
                        callback();
                    });
                }, function(err){
                    product.setOptionTypes(optionTypes);
                    var taxons = [];
                    async.eachSeries(taxon_ids, function(taxon_id, callback){
                        Taxon.get(taxon_id, function(err, taxon){
                            taxons.push(taxon);
                            callback();
                        });
                    }, function(err){
                        product.setTaxons(taxons);
                        product.save();
                        res.status(200).json(product);
                    });
                });

            });
        });
    },

    updateProduct: function(req, res, next){
       var Product = req.models.products;
       var Taxon = req.models.taxons;
       var OptionType = req.models.option_types;
       var Variant = req.models.variants;
       // log.debug('>>req.body:');
        log.debug(req.body);
       //console.log(req.models.products);
       var productData = req.body;
       var taxon_ids = productData.taxon_ids || [];
       var option_type_ids = productData.option_type_ids || [];
       var masterVariant = productData.variant;

       Product.get(productData.id, function(err, product){
          if(err) return res.status(500).json(err);
           productData['option_types'] = [];
           productData['taxons'] = [];
           //log.debug(productData);

           //delete product.option_types;
           //delete product.taxons;
           //delete product.variants;
           //var conditions = {
           //    name: productData.name,
           //    description: productData.description,
           //    available_on: productData.available_on,
           //    slug: productData.slug,
           //    meta_description: productData.meta_description,
           //    meta_keywords: productData.meta_keywords
           //
           //};
           delete productData.created_at;
           delete productData.updated_at;
           product.save(productData, function(err, product){
               if(err) return res.status(500).json(err);
               log.debug('>> product data saved!');
               async.waterfall([
                   function(callback){
                       if(!masterVariant) return callback(null, product);
                       Variant.one({product_id: product.id, is_master: true}, function(err, variant){
                           if(err || !variant) {
                               masterVariant.is_master = true;
                               masterVariant.product_id = product.id;
                               Variant.create(masterVariant, function(err){
                                   if(!err) log.debug('>> variant data created!');
                                   return callback(null, product);
                               });
                           }
                           variant.save( masterVariant, function(err) {
                               if(!err) log.debug('>> variant data saved!');
                               return callback(null, product);
                           });
                       });
                   }, function(product, callback){
                       var optionTypes = [];
                       async.eachSeries(option_type_ids, function(option_type_id, cb){
                           OptionType.get(option_type_id, function(err, optionType){
                               if(!err && optionType) optionTypes.push(optionType);
                               cb();
                           });
                       }, function(err){
                           //log.debug('>> optionTypes: '+ JSON.stringify(optionTypes));
                           product.option_types = optionTypes;
                           product.save(function(err, product){
                               callback(null, product);
                           });
                       });
                   },
                   function(product, callback){
                       var taxons = [];
                       async.eachSeries(taxon_ids, function(taxon_id, cb){
                           Taxon.get(taxon_id, function(err, taxon){
                               if(!err && taxon) taxons.push(taxon);
                               cb();
                           });
                       }, function(err){
                           product.taxons = taxons;
                           product.save(function(err, product){
                               callback(null, product);
                           });
                   });
                   }
               ], function(err, product){
                   //product.save(function(err, product){
                       if(err) return res.status(500).json( err);
                       log.info('>> saved product: '+ JSON.stringify(product));
                       res.status(200).json(product);
                   //});
               });
           });
       });
    },

    deleteProduct: function(req, res, next){
        var Product = req.models.products;
        var product_id = req.params.id;

        Product.get(product_id, function(err, product){
            product.deleted_at = new Date();
            product.save(function(err){
                res.status(200).json('Product removed!');
            });
        });
    },

    // Public search
    listProducts: function(req, res, next){
        var Query = req.db.driver.query;
        var perPages = 10;
        var page = parseInt(req.params.page || req.body.page) || 1;
        if( isNaN(page) || page < 1) page = 1;
        var name = req.body.name || '';
        try {
            name = Query.escape('%' + name + '%').toLowerCase();
        } catch(err){
            log.error(err);
        }

        var sql =  ' SELECT p.id, p.name, p.available_on, va.price, va.asset_id, va.file_path, va.alt \n'+
            ' FROM products p, \n'+
            '		(SELECT v.product_id,v.price, asset.id AS asset_id, asset.file_path, asset.alt \n'+
            '		FROM variants v, \n'+
            '			(SELECT a.id, a.viewable_id, a.viewable_type, a.attachment_file_path AS file_path, a.alt, \n'+
            '			@asset_rank := IF(@current_variant = a.viewable_id, @asset_rank + 1, 1) AS asset_rank, \n'+
            '			@current_variant := a.viewable_id \n'+
            '			FROM assets a WHERE a.viewable_type = "Variant" \n'+
            '			ORDER BY a.position, a.id \n'+
            '			) asset \n'+
            '		WHERE v.id = asset.viewable_id AND asset_rank = 1 \n'+
            '		) va \n'+
            ' WHERE va.product_id = p.id AND (p.deleted_at IS NULL OR p.deleted_at >= NOW()) \n'+
            '   AND p.available_on <= NOW() AND va.price IS NOT NULL \n'+
            '   AND (LOWER(p.name) LIKE ? OR LOWER(p.description) LIKE ?) \n'+
            ' ORDER BY p.available_on DESC ';
        //log.debug(sql);
        req.db.driver.execQuery( sql + ' LIMIT ? OFFSET ?;',[name, name, perPages, (page - 1)* perPages], function(err, products){
            if(err) {
                log.error(err);
                return next(err);
            }
            req.db.driver.execQuery('SELECT count(*) AS cnt FROM ('+sql +') p LIMIT 1;', [name, name], function(err, row){
                if(err) return next(err);
                //console.log('>>row:'+ JSON.stringify(row));
                res.status(200).json({
                    products: products,
                    count: row[0].cnt,
                    page: page
                });
            });
        });
    },
    //public product view
    viewProduct: function(req, res, next){
        var Product = req.models.products;
        //var Variant = req.models.variants;
        //var Asset = req.models.assets;

        var product_id = req.params.id;

        Product.get(product_id, function(err, product){
            if(err) return next(err);
            //-- variants of product
            req.db.driver.execQuery('SELECT va.id, va.price, va.sku, va.product_id, va.position, va.deleted_at, va.is_master, va.cost_price, va.cost_currency, r.options '+
            ' FROM variants va INNER JOIN '+
            ' (SELECT o.id, o.product_id, GROUP_CONCAT(o.options) AS options '+
            ' FROM (SELECT v.id, v.product_id, concat(t.presentation,": ", o.presentation) AS options '+
            ' FROM variants v, variants_option_values vo, option_values o, option_types t '+
            ' WHERE v.id = vo.variants_id and vo.option_values_id = o.id and o.option_type_id = t.id) o '+
            ' GROUP BY o.id) r '+
            ' ON va.id = r.id '+
            ' WHERE va.product_id = ? AND va.deleted_at IS NULL AND va.is_master = false ORDER BY position, id;',[product_id],
            function(err, variants){
                if(err) return next(err);
                // assets of the product
                req.db.driver.execQuery('SELECT a.id, a.attachment_file_path AS file_path, a.alt, a.viewable_id, a.position '+
                ' FROM assets a INNER JOIN variants v ON a.viewable_id = v.id '+
                ' WHERE v.deleted_at IS NULL AND a.viewable_type = "Variant" AND v.product_id = ? '+
                ' ORDER BY a.position, a.id;',[product_id],
                function(err, assets){
                    if(err) return next(err);
                    product.properties = (product.properties != null)? markdown.toHTML(product.properties) : '';
                    product.description = (product.description != null)? markdown.toHTML(product.description) : '';
                    res.json({
                        product: product,
                        variants: variants,
                        assets: assets
                    });
                });
            });
        });
    }
};