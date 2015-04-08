var async = require('async');
var log = require('log4js').getLogger("variants");

module.exports = {

    searchVariants: function(req, res, next){
        log.debug('>>searchVariants:');
        log.debug(req.query);
        log.debug(req.body);
        var product_id = req.body.product_id;
        var deleted = req.body.deleted;
        if(deleted == true){
            deleted = 'IS NOT NULL';
        } else {
            deleted = 'IS NULL';
        }
//        var Variant = req.models.variants;
//        console.log(req.body);
//        Variant.find({product_id: product_id}).order('position').order('-id').run(function( err, variants){
//            if(err) return next(err);
//            res.json(variants);
//        });
        var sql = 'SELECT va.id, va.price, va.sku, va.product_id, va.position, r.options ' +
            ' FROM variants va LEFT JOIN ' +
            ' (SELECT o.id, o.product_id, GROUP_CONCAT(o.options) AS options ' +
            '  FROM (SELECT v.id, v.product_id, concat(t.presentation,":", o.presentation) AS options ' +
            '       FROM variants v, variants_option_values vo, option_values o, option_types t ' +
            '       WHERE v.id = vo.variants_id and vo.option_values_id = o.id and o.option_type_id = t.id) o ' +
            '  GROUP BY o.id) r ' +
            ' ON va.id = r.id WHERE va.product_id = ? AND va.deleted_at ' + deleted +
            ' AND va.is_master = false ORDER BY position, id DESC;';
        req.db.driver.execQuery(sql,[product_id, deleted], function(err, variants){
            if(err) return next(err);
            console.log('>> variants:'+ JSON.stringify(variants));
            res.json(variants);
        });
    },

//    index: function(req, res, next){
//        var Variant = req.models.variants;
//        Variant.find().order('position').all(function (err, variants) {
//            if(err) return next(err);
//            res.json(variants);
//        });
//    },

    create: function(req, res, next){
        console.log(req.body);
        var body = req.body;
        var Variant = req.models.variants;
        var OptionValue = req.models.option_values;
        var conditions = {
            product_id : body.product_id,
            sku: body.sku,
            price: body.price,
            cost_price: body.cost_price,
            weight: body.weight,
            height: body.height,
            width: body.width,
            depth: body.depth,
            position: body.position || 0
        };
        Variant.create( conditions, function(err, variant){
            if(err) return next(err);
            var optionValues = [];
            for(var key in body.option_values) optionValues.push(body.option_values[key]);
            console.log(optionValues);
            delete variant.option_values;
            async.eachSeries(optionValues, function(value, callback){
                OptionValue.get(value, function(err, optionValue){
                    variant.addOptionValues(optionValue, function(err){
                        callback();
                    })
                })
            }, function(err){
                res.json(variant);
            })

        });
    },

    deleteVariant: function(req, res, next){
        var id = req.params.id;
        var Variant = req.models.variants;

        Variant.get(id, function(err, variant){
            console.log('>> Variant:'+ JSON.stringify(variant));
            variant.deleted_at = new Date();
            variant.save( function(err){
                console.log('>> Variant removed!');
                res.status(200).json('Variant removed!');
            });
        });
    },

    updatePosition: function(req, res, next){
        console.log(req.body);
        var entry = req.body.entry;
        var ids = [];
        if(entry) ids = entry.split(',');

        if(ids.length === 0) return next();
        var Variant = req.models.variants;
        var i = 1;
        async.eachSeries(ids, function(id, callback){
            Variant.get(id, function(err, data){
                //console.log('>>i:'+i);
                //optionType.position = i++;
                data.save({id:data.id, position: i++}, function(err){
                    if(err) return next(err);
                    console.log('Variant position updated!');
                    callback();
                });
            })
        }, function(err){
            if(err) return next(err);
            res.status(200).json('The positions of variants updated!');
        });
    },

    // GET request
    variant: function(req, res, next){
        log.debug(req.params );

        var id = req.params.id;
        var Variant = req.models.variants;

        Variant.get(id, function(err, variant){
            if(err) return next(err);
            variant.getOptionValues(function(err, data){
                variant.option_values = data;
                res.json(variant);
            })

        });

    },

    updateVariant: function(req, res, next){
        console.log(req.body);
        var body = req.body;
        var Variant = req.models.variants;
        var OptionValue = req.models.option_values;
        var conditions = {
            product_id : body.product_id,
            sku: body.sku,
            price: body.price,
            cost_price: body.cost_price,
            weight: body.weight,
            height: body.height,
            width: body.width,
            depth: body.depth,
            position: body.position || 0
        };
        Variant.get(body.id, function(err, data){
            if(err) return next(err);
            data.save( conditions, function(err, variant){
                if(err) return next(err);
                var values = [];
                for(var key in body.options) values.push(body.options[key]);
                log.debug(values);
                delete variant.option_values;
                var optionValues = [];
                async.eachSeries(values, function(value, callback){
                    OptionValue.get(value, function(err, optionValue){
                        optionValues.push(optionValue);
                        callback();
                     })
                }, function(err){
                    variant.setOptionValues(optionValues, function(err){
                        res.json(variant);
                    });

                })
            });

        });
    }

}