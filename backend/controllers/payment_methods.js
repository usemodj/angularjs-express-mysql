var async = require('async');

module.exports = {
    index: function(req, res, next){
        var PaymentMethod = req.models.payment_methods;
        PaymentMethod.find({deleted_at : null, active: true}).order('position').run(function (err, paymentMethod) {
            if(err) return next(err);
            res.status(200).json(paymentMethod);
        });
    },

    paymentMethod: function(req, res, next){
        console.log('>> req.params.id:'+ req.params.id);

        var id = req.params.id;
        var PaymentMethod = req.models.payment_methods;

        PaymentMethod.get(id, function(err, paymentMethod){
            if(err) return next(err);
            res.status(200).json(paymentMethod);
        });

    },

    updatePaymentMethod: function(req, res, next){
        var data = req.body;
        console.log(data);
        var PaymentMethod = req.models.payment_methods;
        PaymentMethod.get(data.id, function(err, paymentMethod) {
            paymentMethod.save({id: data.id, name: data.name, description: data.description, active: data.active}, function (err) {
                if (err) return next(err);
                console.log('Payment Method updated!');
                res.status(200).json('Payment Method updated!');
            });
        });
    },

    deletePaymentMethod: function(req, res, next){
        var id = req.params.id;
        var PaymentMethod = req.models.payment_methods;

        PaymentMethod.get(id, function(err, paymentMethod){
            if(err) return next(err);
            paymentMethod.save({deleted_at: new Date()}, function(err){
                console.log('>> Payment Method removed!');
                resv.json('Payment Method removed!');
            });
       });
    },

    create: function(req, res, next){
        console.log(req.body);
        var paymentMethod = req.body;
        var PaymentMethod = req.models.payment_methods;
        PaymentMethod.create(paymentMethod, function(err, data){
           if(err) return next(err);
           res.status(200).json(data);
        });
    },

    updatePosition: function(req, res, next){
        console.log(req.body);
        var entry = req.body.entry;
        var ids = [];
        if(entry) ids = entry.split(',');

        if(ids.length === 0) return next();
        var PaymentMethod = req.models.payment_methods;
        var i = 1;
        async.eachSeries(ids, function(id, callback){
            PaymentMethod.get(id, function(err, paymentMethod){
                //console.log('>>i:'+i);
                //optionType.position = i++;
                paymentMethod.save({id:paymentMethod.id, position: i++}, function(err){
                    if(err) return next(err);
                    console.log('Payment Method updated!');
                    callback();
                });
            })
        }, function(err){
            if(err) return next(err);
            res.status(200).json('The positions of payment method updated!');
        });
    }

}