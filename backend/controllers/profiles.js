var log = require('log4js').getLogger("profiles");
var _ = require('underscore');
var path = require('path');
var fs = require('fs');
var async = require('async');
var gm = require('gm');
var mv = require('mv');
var settings = require('../config/settings');

var uploadPath = path.join(settings.upload_path, 'images/');
var thumnailWidth = 150;

module.exports = {
    getProfile: function(req, res, next){
        var Profile = req.models.profiles;
        var Address = req.models.addresses;
        var User = req.models.users;
        var ip = req.connection.remoteAddress;
        var user = JSON.parse(req.cookies.user);
        var profileId = req.params.id || req.body.id;
        //log.debug(profileData);
        //update article with file attachment
        User.one({email: user.email}, function (err, user) {
            if (err || user == null) {
                log.error('Login email does not exist!');
                return next(new Error('Login email does not exist!'));
            }
            log.debug('>>user: ' + JSON.stringify(user));
            Profile.get(profileId, function(err, profile){
                if(err) return res.status(500).json(err);
                log.debug('>>Profile: '+ JSON.stringify(profile));
                return res.status(200).json(profile);
            });
        });
    },

    saveAddress: function(req, res, next) {
        var Profile = req.models.profiles;
        var Address = req.models.addresses;
        var User = req.models.users;
        var ip = req.connection.remoteAddress;
        var user = JSON.parse(req.cookies.user);
        var profileData = req.body;
        log.debug(profileData);
        //update article with file attachment
        User.one({email: user.email}, function (err, user) {
            if (err || user == null) {
                log.error('Login email does not exist!');
                return next(new Error('Login email does not exist!'));
            }
            log.debug('>>user: '+ JSON.stringify(user));

            async.waterfall([
                function(callback){
                    if(user.profile) return callback(null, user.profile);
                    Profile.get(user.profile_id, function(err, profile){
                        if(profile) return callback(null, profile);
                        Profile.create({
                            first_name: '',
                            last_name: ''
                        }, function(err, profile){
                            if(err) return callback(err);
                            user.setProfile(profile, function(err){
                                if(err) return callback(err);
                                return callback(null, profile);
                            })
                        });
                    })
                },
                function(profile, callback){
                    var p = profile;
                    log.debug('>>Profile: '+ JSON.stringify(p));
                    if(!p.address){
                        Address.get(p.address_id, function(err, address){
                            if(err || !address){
                                log.error(err);

                                Address.create({
                                    name: p.first_name + ' ' + p.last_name,
                                    address1: profileData.address.address,
                                    zipcode: profileData.address.zipcode,
                                    mobile: profileData.address.mobile,
                                    phone: profileData.address.phone
                                }, function(err, address1){
                                    if(err) return callback(err);
                                    p.setAddress(address1, function(err){
                                        p.save(function(err, profile){
                                            return callback(null, profile);
                                        });
                                    })
                                })
                            } else {
                                address.save({
                                    name: p.first_name + ' ' + p.last_name,
                                    address1: profileData.address.address,
                                    zipcode: profileData.address.zipcode,
                                    mobile: profileData.address.mobile,
                                    phone: profileData.address.phone
                                }, function(err, address2){
                                    if(err) return callback(err);
                                    return callback(null, p);
                                });
                            }
                        });
                    } else {
                        p.address.save({
                            name: p.first_name + ' ' + p.last_name,
                            address1: profileData.address.address,
                            zipcode: profileData.address.zipcode,
                            mobile: profileData.address.mobile,
                            phone: profileData.address.phone
                        }, function(err, address2){
                            if(err) return callback(err);
                            return callback(null, p);
                        });
                    }
                }
            ], function(err, results){
                if(err) return res.status(500).json(err);
                return res.status(200).json(results); //profile
            });
        });
    }
};