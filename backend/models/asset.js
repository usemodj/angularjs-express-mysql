//var async = require('async');
var log = require('log4js').getLogger('Asset');
var path = require('path');
var fs = require('fs');
var settings = require('../config/settings');

var uploadPath = path.join(settings.upload_path, 'images/');

module.exports = function(orm, db) {
    var Asset = db.define('assets', {

        viewable_id: {
            type: 'integer'
        },
        viewable_type: {
            type: 'text'
        },
        attachment_width: {
            type: 'integer'
        },
        attachment_height: {
            type: 'integer'
        },
        attachment_file_size: {
            type: 'text'
        },
        position: {
            type: 'integer'
        },
        attachment_content_type: {
            type: 'text'
        },
        attachment_file_name: {
            type: 'text'
        },
        attachment_file_path: {
            type: 'text'
        },
        type: {
            type: 'text'
        },
        attachment_updated_at: {
            type: 'date',
            time: true
        },
        alt: {
            type: 'text', big:true
        },
        created_at: {
            type: 'date',
            time: true
        },
        updated_at: {
            type: 'date',
            required: true,
            time: true
        }

    }, {
        //cache: false,
        //autoFetch: true,
        autoFetchLimit: 1,
        methods: {

        },
        validations: {

        },
        hooks: {
            beforeValidation: function () {
                this.updated_at = new Date();
            },
            afterLoad: function () {

            },
            beforeSave: function () {

            },
            beforeCreate: function () {
                this.created_at = new Date();
            }
        }

    });
    // creates column 'viewable_id' in 'Asset' table
    //Asset.hasOne('viewable', db.models.variants, { reverse:'assets' });
    //Asset.hasOne('post', db.models.posts, { reverse:'assets' });
    //Asset.hasOne('viewable', [db.models.variants, db.models.posts], { reverse:'assets' });
    Asset.deleteAssetAndFile = function(asset, callback){
        var pullpath = path.join(uploadPath, asset.attachment_file_path);
        log.debug('>>file path:'+ pullpath);

        fs.exists(pullpath, function(exists){
            if(exists){
                fs.unlink( pullpath, function(err){
                    if(err){
                        return callback(err);
                    }
                    asset.remove(function(err, asset){
                        if(err) return callback(err);
                        log.info('>> File and Asset data removed! '+ pullpath);
                        return callback(null, asset);
                    })
                })
            } else {
                asset.remove(function(err, asset){
                    if(err) return callback(err);
                    log.info('>> Asset data removed! '+ asset.attachment_file_name);
                    return callback(null, asset);
                })

            }
        });
    };
    Asset.deleteFile = function(asset, callback){
        var pullpath = path.join(uploadPath, asset.attachment_file_path);
        log.debug('>>file path:'+ pullpath);

        fs.exists(pullpath, function(exists){
            if(exists){
                fs.unlink( pullpath, function(err){
                    if(err) return callback(err);
                    log.info('>> Asset file removed! '+ pullpath);
                    return callback(null, asset);
                })
            } else {
                return callback(null, asset);
            }
        });
    };

};