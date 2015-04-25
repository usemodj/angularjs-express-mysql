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
        var Asset = req.models.assets;
        var Address = req.models.addresses;
        var User = req.models.users;
        //var ip = req.connection.remoteAddress;
        var userData = JSON.parse(req.cookies.user);
        var profileId = req.params.id || req.body.id;
        log.debug('>> profileId: '+ profileId);
        //update article with file attachment
        User.one({email: userData.email}, function (err, user) {
            if (err || user == null) {
                log.error('Login email does not exist!');
                return next(new Error('Login email does not exist!'));
            }
            log.debug('>>user: ' + JSON.stringify(user));
            profileId = profileId || user.profile_id;
            if(!profileId) return res.status(500).json('There is no user profile!');

            Profile.get(profileId, function(err, profile){
                if(err) {
                    log.error(err);
                    return res.status(500).json(err);
                }
                log.debug('>>Profile: '+ JSON.stringify(profile));
                if(!profile.address_id) {
                    Asset.one({viewable_id: profile.id, viewable_type:'Profile'}, function(err, asset){
                        if(!err) profile.asset = asset;
                        return res.status(200).json(profile);
                    });
                } else {
                    Address.get(profile.address_id, function(err, address){
                        if(err) log.error(err);
                        else profile.address = address;
                        Asset.one({viewable_id: profile.id, viewable_type:'Profile'}, function(err, asset){
                            if(err) log.error(err);
                            else profile.asset = asset;
                            log.debug('>> profile return: '+ JSON.stringify(profile));

                            return res.status(200).json(profile);
                        });

                    });
                }

            });
        });
    },

    saveAddress: function(req, res, next) {
        var Profile = req.models.profiles;
        var Asset = req.models.assets;
        var Address = req.models.addresses;
        var User = req.models.users;
        var ip = req.connection.remoteAddress;
        var userData = JSON.parse(req.cookies.user);
        var profileData = req.body;
        log.debug(profileData);
        //update article with file attachment
        User.one({email: userData.email}, function (err, user) {
            if (err || user == null) {
                log.error('Login email does not exist!');
                return next(new Error('Login email does not exist!'));
            }
            log.debug('>>user: '+ JSON.stringify(user));

            async.waterfall([
                function(callback){
                    if(!user.profile_id){
                        Profile.create({
                            first_name: '',
                            last_name: ''
                        }, function(err, profile){
                            if(err) return callback(err);
                            user.save({profile_id: profile.id}, function(err){
                                if(err) return callback(err);
                                return callback(null, profile);
                            })
                        });

                    }else {
                        Profile.get(user.profile_id, function (err, profile) {
                            if (profile) return callback(null, profile);
                            Profile.create({
                                first_name: '',
                                last_name: ''
                            }, function (err, profile) {
                                if (err) return callback(err);
                                user.save({profile_id: profile.id}, function (err) {
                                    if (err) return callback(err);
                                    return callback(null, profile);
                                })
                            });
                        });
                    }
                },
                function(profile, callback){
                    var p = profile;
                    log.debug('>>Profile: '+ JSON.stringify(p));

                    if(p.address_id){
                        Address.get(p.address_id, function(err, address){
                            if(err || !address){
                                Address.create({
                                    name: (p.first_name || '') + ' ' + (p.last_name||''),
                                    address1: profileData.address.address1,
                                    zipcode: profileData.address.zipcode,
                                    mobile: profileData.address.mobile,
                                    phone: profileData.address.phone
                                }, function(err, address1){
                                    if(err) return callback(err);
                                    p.save({address_id: address1.id}, function(err){
                                    //p.setAddress(address1, function(err){
                                        p.save(function(err, profile){
                                            return callback(null, profile);
                                        });
                                    })
                                });
                            } else {
                                address.save({
                                    name: (p.first_name || '') + ' ' + (p.last_name||''),
                                    address1: profileData.address.address1,
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
                        Address.create({
                            name: (p.first_name || '') + ' ' + (p.last_name||''),
                            address1: profileData.address.address1,
                            zipcode: profileData.address.zipcode,
                            mobile: profileData.address.mobile,
                            phone: profileData.address.phone
                        }, function(err, address1){
                            if(err) return callback(err);
                            p.save({address_id: address1.id}, function(err){
                                //p.setAddress(address1, function(err){
                                p.save(function(err, profile){
                                    return callback(null, profile);
                                });
                            })
                        });
                    }
                }
            ], function(err, results){
                if(err) {
                    log.error(err);
                    return res.status(500).json(err);
                }
                log.debug('>>results: '+ JSON.stringify(results));
                Address.get(results.address_id, function(err, address){
                    if(!err) results.address = address;
                    Asset.one({viewable_id: results.id, viewable_type:'Profile'}, function(err, asset){
                        if(!err) results.asset = asset;
                        return res.status(200).json(results); //profile
                    });
                });
            });
        });
    },

    saveProfile: function(req, res, next){
        var Profile = req.models.profiles;
        var Address = req.models.addresses;
        var Asset = req.models.assets;
        var User = req.models.users;

        //var ip = req.connection.remoteAddress;
        var user = JSON.parse(req.cookies.user);
        var body = req.body;
        var profile = JSON.parse(req.body.profile),
            files = req.files.file;

        log.debug(body);
        log.debug(req.files);

        User.one({email: user.email}, function(err, user) {
            if(err || user == null) {
                log.error('Login required!');
                return next(new Error('Login required!'));
            }

            async.waterfall([
                function(callback){
                    if(!user.profile_id){
                        Profile.create({
                            first_name: profile.first_name,
                            last_name: profile.last_name,
                            nickname: profile.nickname,
                            gender: profile.gender,
                            birth_year: profile.birth_year,
                            birth_month: profile.birth_month,
                            birth_day: profile.birth_day
                        }, function (err, profile1) {
                            if (err) return callback(err);
                            //log.debug(JSON.stringify(profile1));
                            user.save({profile_id: profile1.id}, function(err){
                                if(err) return callback(err);
                                return callback(null, profile1);
                            });
                        });
                    } else {
                        Profile.get(user.profile_id, function(err, profile1){
                            if(err){
                                Profile.create({
                                    first_name: profile.first_name,
                                    last_name: profile.last_name,
                                    nickname: profile.nickname,
                                    gender: profile.gender,
                                    birth_year: profile.birth_year,
                                    birth_month: profile.birth_month,
                                    birth_day: profile.birth_day
                                }, function (err, profile2) {
                                    if (err) return callback(err);
                                    //log.debug(JSON.stringify(profile2));
                                    user.save({profile_id: profile2.id}, function(err){
                                        if(err) return callback(err);
                                        return callback(null, profile2);
                                    })
                                });

                            } else {
                                profile1.save({
                                    first_name: profile.first_name,
                                    last_name: profile.last_name,
                                    nickname: profile.nickname,
                                    gender: profile.gender,
                                    birth_year: profile.birth_year,
                                    birth_month: profile.birth_month,
                                    birth_day: profile.birth_day
                                }, function (err, profile2) {
                                    if (err) return callback(err);
                                    //log.debug(JSON.stringify(profile2));
                                    return callback(null, profile2);
                                });
                            }
                        });
                    }
                },
                function(profile, callback) {
                    if(!Array.isArray(files)){
                        files = (files)? [files]: [];
                    }

                    var file = files[0];
                    if(file){
                        Asset.find({viewable_id: profile.id, viewable_type: 'Profile'}).run(function(err, assets){
                            if(!err){
                                async.each(assets, function(asset, cb){
                                    Asset.deleteAssetAndFile(asset, function(err, data){
                                        return cb();
                                    })
                                }, function(err){
                                    log.debug('>> Old asset files deleted!');
                                    module.exports.createThumbnail(req, profile, file, function(err, data){
                                        if(err) return callback(err);
                                        return callback(null, data);//profile with asset
                                    })
                                });
                            }
                        })
                    } else {
                        Asset.one({viewable_id: profile.id, viewable_type: 'Profile'}, function(err, asset){
                            if(!err) profile.asset = asset;
                            return callback(null, profile);
                        });
                    }
                }
            ], function(err, results){
                //log.info('>> completed task');
                if(err) {
                    log.error(err);
                    return res.status(500).json(err);
                }
                Address.get(results.address_id, function(err, address) {
                    if (!err) results.address = address;
                    return res.status(200).json(results); //profile
                });
            });
        });
    },

    createThumbnail: function(req, profile, file, callback){
        var Asset = req.models.assets;
        var viewable_id = profile.id;
        var viewable_type = 'Profile';
        var content_type = file.type;
        var file_name = file.name;
        var file_path = path.join('profiles', path.basename(file.path));
        var destPath = uploadPath + file_path;

        mv( file.path, destPath, {mkdirp:true}, function(err) {
            if (err) {
                log.error(err);
                return callback(err);
            }
            else {
                // Create thumnail
                var readStream = fs.createReadStream(destPath);
                var dot = destPath.lastIndexOf('.');
                var thumbPath = (dot > -1)? destPath.substring(0, dot)+ '-th'+ destPath.substring(dot)
                    : destPath + '-th';

                gm(readStream, 'img.png').options({imageMagick: true}).resize(thumnailWidth)
                    .write(thumbPath, function(err){
                        if(err) {
                            log.error( err);
                            return callback(err);
                        }
                        gm(thumbPath).options({imageMagick: true})
                            .identify(function(err, data){
                                if(err) return callback(err);
                                var file_path = path.join('profiles', path.basename(thumbPath));

                                var conditions = {
                                    attachment_width: data.size.width,
                                    attachment_height: data.size.height,
                                    attachment_file_size: data.Filesize,
                                    position: 0,
                                    attachment_content_type: content_type,
                                    attachment_file_name: file_name,
                                    attachment_file_path: file_path,
                                    //alt: file_alt,
                                    viewable_id: viewable_id,
                                    viewable_type: viewable_type
                                };
                                Asset.create(conditions, function( err, asset){
                                    if(!err) {
                                        log.info('Asset created!');
                                        profile.asset = asset;
                                    }
                                    fs.unlinkSync(destPath);
                                    return callback(null, profile);
                                });

                            });

                    });
            }
        });

    }
};