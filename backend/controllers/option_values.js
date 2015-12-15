var async = require('async');
var log = require('log4js').getLogger('option_types');

module.exports = {
    updatePosition: function(req, res, next){
        log.debug(req.body);
        var entry = req.body.entry;
        var ids = [];
        if(entry) ids = entry.split(',');

        if(ids.length === 0) return next();
        var OptionValue = req.models.option_values;
        var i = 1;
        async.eachSeries(ids, function(id, callback){
            OptionValue.get(id, function(err, optionValue){
                //console.log('>>i:'+i);
                //optionValue.position = i++;
                optionValue.save({id:optionValue.id, position: i++}, function(err){
                    if(err) return next(err);
                    log.debug('>> OptionValue updated!');
                    callback();
                });
            })
        }, function(err){
            if(err) return next(err);
            res.status(200).json('The positions of option values updated!');
        });
    },

    deleteOptionValue: function(req, res, next){
        var id = req.params.id;
        var OptionValue = req.models.option_values;
        OptionValue.get(id, function(err, optionValue){
           optionValue.remove(function(err){
               log.debug('>> Option value removed!');
              res.status(200).json('Option value removed!');
           });
        });
    },

    changeOptionValues: function(req, res, next){
        var optionType = req.body;
        var optionValues = optionType.option_values;
        log.debug(optionType);
        var OptionValue = req.models.option_values;
        var updateOptionValue = function(optionValue, optionTypeId, position, callback){
            OptionValue.get(optionValue.id, function(err, data){
                data.save({id:data.id, name:optionValue.name, presentation: optionValue.presentation,
                    option_type_id: optionTypeId, position: position},function(err){
                    if(err) return next(err);
                    log.debug('>> Option value updated!');
                    callback();
                });
            });
        };
        var createOptionValue = function(optionValue, optionTypeId, position, callback){
            OptionValue.exists({name:optionValue.name, option_type_id:optionTypeId}, function(err, exists){
                if(!exists){
                    OptionValue.create({name:optionValue.name, presentation: optionValue.presentation,
                        option_type_id: optionTypeId, position: position},function(err, data){
                        if(err) {
                            log.debug(err);
                            return next(err);
                        }
                        log.debug('>> Option value created!');
                        callback();
                    });
                } else {
                    callback();
                }
            });
        };

        var pos = 1;
        async.eachSeries(optionValues, function(value, callback){
            if(value.id) updateOptionValue(value, optionType.id, pos++, callback);
            else createOptionValue(value, optionType.id, pos++, callback);
        }, function(err){
            if(err) return next(err);
            res.status(200).json('Option values changed!');
        });

    }

}