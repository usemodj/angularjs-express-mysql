var log = require('log4js').getLogger("roles model");
var userRoles = require('../../frontend/app/scripts/common/routingConfig').userRoles;
var async = require('async');

module.exports = function(orm, db) {
    var Role = db.define('roles', {
        title: {
            type: 'text'

        },
        bit_mask: {
            type: 'text'
        }
    }, {
        autoFetch: true,
        autoFetchLimit: 2,
        methods: {},
        validations: {},
        hooks: {
            beforeValidation: function() {
                //this.updated_at = new Date();
            }
        }
    });

    Role.loadRoles = function( callback){
        Role.count(function(err, number){
            if(err) return callback(err);
            else if(number !== 0) return callback();

            //for(var title in userRoles) {
            //    log.info('>> title: '+ title + ', userRoles[title][bit_mask]: '+ userRoles[title]['bit_mask'])
            //    Role.create([{
            //        title: title,
            //        bit_mask: userRoles[title]['bit_mask']
            //    }], function(err, item){
            //        if(err) log.error(err);
            //    });
            //}
            var keys = [];
            for(var title in userRoles) {
                keys.push(title);
            }
            async.eachSeries(keys, function( title, cb){
                Role.create([{
                    title: title,
                    bit_mask: userRoles[title]['bit_mask']
                }], function(err, item){
                    if(err) {
                        log.error(err);
                        return cb(err);
                    }
                    return cb();
                });
            }, function(err){
                if(err){
                    log.error(err);
                    return callback(err);
                } else {
                    log.info('>> Roles data created!');
                    return callback()
                }
            });
        });
    }
};
