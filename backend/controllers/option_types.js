var async = require('async');
var log = require('log4js').getLogger('option_types');
module.exports = {
    index: function(req, res, next){
        var OptionType = req.models.option_types;
        OptionType.find().order('position').all(function (err, optionTypes) {
            if(err) return next(err);
            res.status(200).json(optionTypes);
        });
    },

    optionType: function(req, res, next){
        //console.log('>> req.params.id:'+ req.params.id);
        var id = req.params.id;
        var OptionType = req.models.option_types;
        var OptionValue = req.models.option_values;
        OptionType.get(id, function(err, optionType){
            if(err) return next(err);
            //optionType.getOption_values();
            log.debug(optionType);
            res.status(200).json(optionType);
            //console.log(optionType.getOptionValues().order('position'));
//            delete optionType.optionValues;
//            OptionValue.find({option_type_id: optionType.id}).order('position').run(function(err, optionValues){
//                log.debug(optionValues);
//                delete optionValues.option_type;
//                optionType['optionValues'] = optionValues;
//                res.status(200).json(optionType);
//            });
        });

    },

    updateOptionType: function(req, res, next){
        var data = req.body;
        console.log(data);
        var OptionType = req.models.option_types;
        OptionType.get(data.id, function(err, optionType) {
            optionType.save({id: data.id, name: data.name, presentation: data.presentation}, function (err) {
                if (err) return next(err);
                console.log('OptionType updated!');
                res.status(200).json('Option type updated!');
            });
        });
    },

    deleteOptionType: function(req, res, next){
        var id = req.params.id;
        var OptionType = req.models.option_types;
        var OptionValue = req.models.option_values;

        OptionType.get(id, function(err, optionType){
            console.log('>> optionType:'+ JSON.stringify(optionType));
            //if(!optionType.optionValues) optionType.optionValues = [];

            async.eachSeries(optionType.optionValues, function(value, callback){
                OptionValue.get(value.id, function(err, optionValue){
                    optionValue.remove(function(err){
                       console.log('>> Option value removed!');
                       callback();
                    });
                });
            }, function(err){
                if(err) return next(err);
                optionType.remove(function(err){
                    console.log('>> Option type removed!');
                    res.status(200).json('Option type removed!');
                });
            });

       });
    },

    create: function(req, res, next){
        console.log(req.body);
        var optionType = req.body;
        var OptionType = req.models.option_types;
        OptionType.create(optionType, function(err, opType){
           if(err) return next(err);
           res.status(200).json(opType);
        });
    },

    updatePosition: function(req, res, next){
        console.log(req.body);
        var entry = req.body.entry;
        var ids = [];
        if(entry) ids = entry.split(',');

        if(ids.length === 0) return next();
        var OptionType = req.models.option_types;
        var i = 1;
        async.eachSeries(ids, function(id, callback){
            OptionType.get(id, function(err, optionType){
                //console.log('>>i:'+i);
                //optionType.position = i++;
                optionType.save({id:optionType.id, position: i++}, function(err){
                    if(err) return next(err);
                    console.log('OptionType updated!');
                    callback();
                });
            })
        }, function(err){
            if(err) return next(err);
            res.status(200).json('The positions of option types updated!');
        });
    }

};