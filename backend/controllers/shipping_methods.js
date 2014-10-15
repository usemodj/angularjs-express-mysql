var async = require('async');

module.exports = {
    index: function(req, res, next){
        var ShippingMethod = req.models.shipping_methods;
        ShippingMethod.find({deleted_at : null}).order('position').run(function (err, shippingMethod) {
            if(err) return next(err);
            res.json(shippingMethod);
        });
    },

    shippingMethod: function(req, res, next){
        console.log('>> req.params.id:'+ req.params.id);

        var id = req.params.id;
        var ShippingMethod = req.models.shipping_methods;

        ShippingMethod.get(id, function(err, shippingMethod){
            if(err) return next(err);
            res.json(shippingMethod);
        });

    },

    updateShippingMethod: function(req, res, next){
        var data = req.body;
        console.log(data);
        var ShippingMethod = req.models.shipping_methods;
        ShippingMethod.get(data.id, function(err, shippingMethod) {
            shippingMethod.save({id: data.id, name: data.name, amount: data.amount, currency: data.currency}, function (err) {
                if (err) return next(err);
                console.log('Shipping Method updated!');
                res.json(200, 'Shipping Method updated!');
            });
        });
    },

    deleteShippingMethod: function(req, res, next){
        var id = req.params.id;
        var ShippingMethod = req.models.shipping_methods;

        ShippingMethod.get(id, function(err, shippingMethod){
            if(err) return next(err);
            shippingMethod.save({deleted_at: new Date()}, function(err){
                console.log('>> Shipping Method removed!');
                res.json(200, 'Shipping Method removed!');
            });
       });
    },

    create: function(req, res, next){
        console.log(req.body);
        var shippingMethod = req.body;
        var ShippingMethod = req.models.shipping_methods;
        ShippingMethod.create(shippingMethod, function(err, data){
           if(err) return next(err);
           res.json(200, data);
        });
    },

    updatePosition: function(req, res, next){
        console.log(req.body);
        var entry = req.body.entry;
        var ids = [];
        if(entry) ids = entry.split(',');

        if(ids.length === 0) return next();
        var ShippingMethod = req.models.shipping_methods;
        var i = 1;
        async.eachSeries(ids, function(id, callback){
            ShippingMethod.get(id, function(err, shippingMethod){
                //console.log('>>i:'+i);
                //optionType.position = i++;
                shippingMethod.save({id:shippingMethod.id, position: i++}, function(err){
                    if(err) return next(err);
                    console.log('Shipping Method updated!');
                    callback();
                });
            })
        }, function(err){
            if(err) return next(err);
            res.json(200, 'The positions of shipping method updated!');
        });
    }

}