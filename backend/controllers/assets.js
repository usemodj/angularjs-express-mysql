var log = require('log4js').getLogger("assets");
var path = require('path');
var settings = require('../config/settings');
var _ = require('underscore');
var gm = require('gm');
var fs = require("fs"),
    rimraf = require("rimraf"),
    mkdirp = require("mkdirp");
//
//var uploadedFilesPath = settings.upload_path + 'images/';
//function onDeleteFile(req, res) {
//    var uuid = req.params.uuid,
//        dirToDelete = uploadedFilesPath + uuid;
//
//    rimraf(dirToDelete, function(error) {
//        if (error) {
//            console.error("Problem deleting file! " + error);
//            res.status(500);
//        }
//
//        res.send();
//    });
//}
//function moveFile(destinationDir, sourceFile, destinationFile, success, failure) {
//    mkdirp(destinationDir, function(error) {
//        var sourceStream, destStream;
//
//        if (error) {
//            console.error("Problem creating directory " + destinationDir + ": " + error);
//            failure();
//        }
//        else {
//            sourceStream = fs.createReadStream(sourceFile);
//            destStream = fs.createWriteStream(destinationFile);
//
//            sourceStream
//                .on("error", function(error) {
//                    console.error("Problem copying file: " + error.stack);
//                    failure();
//                })
//                .on("end", success)
//                .pipe(destStream);
//        }
//    });
//}
//
//function moveUploadedFile(file, uuid, success, failure) {
//    var destinationDir = uploadedFilesPath + uuid + "/",
//        fileDestination = destinationDir + file.name;
//
//    moveFile(destinationDir, file.path, fileDestination, success, failure);
//}

var uploadPath = settings.upload_path + 'images/';

var deleteAssetFile = function(asset_id, req, res, next){
    var Asset = req.models.assets;

    Asset.get(asset_id, function(err, data){
        log.debug('>>Asset:'+ JSON.stringify(data));

        var file_path = data.attachment_file_path;
        var file_pullpath = uploadPath + file_path;
        log.debug('>>file path:'+ file_pullpath);

        fs.exists(file_pullpath, function(exists){
            if(exists){
                fs.unlink( file_pullpath, function(err){
                    if(err){
                        return next(err);
                    }
                })
            }
        });

        data.remove(function(err){
            if(err) return next(err);
            log.info('>> Image file asset removed! '+ file_path);
        })
    })
};

module.exports = {
    index: function(req, res, next){
        var Product = req.models.products;
        var product_id = req.params.product_id;

        Product.get(product_id, function(err, product){
            log.debug(product);
            var variantSql = 'SELECT va.id, va.price, va.sku, va.product_id, va.position, va.is_master, r.options ' +
                ' FROM variants va LEFT JOIN ' +
                ' (SELECT o.id, o.product_id, GROUP_CONCAT(o.options) AS options ' +
                '  FROM (SELECT v.id, v.product_id, concat(t.presentation,":", o.presentation) AS options ' +
                '       FROM variants v, variants_option_values vo, option_values o, option_types t ' +
                '       WHERE v.id = vo.variants_id and vo.option_values_id = o.id and o.option_type_id = t.id) o ' +
                '  GROUP BY o.id) r ' +
                ' ON va.id = r.id WHERE va.deleted_at IS NULL AND va.product_id = ? ORDER BY position, id DESC;';
            req.db.driver.execQuery(variantSql, [product_id], function(err, variants){
                product.variants = variants;
                var assetSql = 'SELECT a.*, v.sku, v.options FROM assets a INNER JOIN ' +
                ' (SELECT va.id, va.price, va.sku, va.product_id, va.position, va.is_master, va.deleted_at, r.options ' +
                ' FROM variants va LEFT JOIN ' +
                ' (SELECT o.id, o.product_id, GROUP_CONCAT(o.options) AS options ' +
                ' FROM (SELECT v.id, v.product_id, concat(t.presentation,":", o.presentation) AS options ' +
                '   FROM variants v, variants_option_values vo, option_values o, option_types t ' +
                '   WHERE v.id = vo.variants_id and vo.option_values_id = o.id and o.option_type_id = t.id) o ' +
                ' GROUP BY o.id) r  ON va.id = r.id) v ' +
                ' ON a.variant_id = v.id ' +
                ' WHERE v.deleted_at IS NULL AND v.product_id = ? ' +
                ' ORDER BY a.position, a.id;';
                req.db.driver.execQuery(assetSql, [product_id], function(err, assets){
                    res.json({
                        product: product,
                        assets: assets
                    });
                });
            });

        });
    },

    /*
     Create file upload

     */
    create : function(req, res, next){
        var Asset = req.models.assets;
        var imageWidth = 340,
            imageHeight = 340;

//        log.debug(req.body);
//        log.debug(req.files);
        var asset = JSON.parse(req.body.asset),
            file = req.files.file;

//        log.debug(file.name); // original name(ie: sunset.png)
//        log.debug(file.path); // tmp path (ie: /tmp/1234-zyz.png)
//        log.debug(file.size);
//        log.debug(file.type);  // image/gif
//        log.debug(uploadPath); // uploads directory(ie: /home/user/data/upload)
        if(!asset.variant) asset.variant = asset.master_variant;
        log.info(asset.variant);
        var variant_id = asset.variant.id;
        var file_alt = asset.alt;
        var content_type = file.type;
        var file_name = file.name;
        var file_path = path.basename(file.path);
        var destPath = uploadPath + file_path;
        //log.debug(variant_id);
        //log.debug(destPath);
        mkdirp(uploadPath, function(err){
            if(err) return next(err);
            var readStream = fs.createReadStream(file.path);
            gm(readStream, 'img.jpg')
                .options({imageMagick: true})
                .resize(imageWidth, imageHeight)
                .write(destPath, function(err){
                    if(err) log.error('Image resizing failed!');
                    else log.info('Image resizing done!');
                    rimraf(file.path, function(err){
                        if(!err) log.info('Temp image removed!');
                    });
                    gm(destPath).options({imageMagick: true})
                        .identify(function(err, data){
                            if(!err) {
                                var conditions = {
                                    attachment_width: data.size.width,
                                    attachment_height: data.size.height,
                                    attachment_file_size: data.Filesize,
                                    position: 0,
                                    attachment_content_type: content_type,
                                    attachment_file_name: file_name,
                                    attachment_file_path: file_path,
                                    alt: file_alt,
                                    variant_id: variant_id
                                };
                                Asset.create(conditions, function( err, asset){
                                   log.info('Asset created!');
                                   res.json(asset);
                                });
                            }
                        });
                });
        });
    },

    updatePosition: function(req, res, next){
        console.log(req.body);
        var entry = req.body.entry;
        var ids = [];
        if(entry) ids = entry.split(',');

        if(ids.length === 0) return next();
        var Asset = req.models.assets;
        var i = 1;
        async.eachSeries(ids, function(id, callback){
            Asset.get(id, function(err, asset){
                //console.log('>>i:'+i);
                asset.save({id:asset.id, position: i++}, function(err){
                    if(err) return next(err);
                    console.log('Asset position updated!');
                    callback();
                });
            })
        }, function(err){
            if(err) return next(err);
            res.status(200).json('The positions of assets updated!');
        });
    },

    getAsset: function(req,res, next){
        var Asset = req.models.assets;
        var Product = req.models.products;

        var asset_id = req.params.id;
        var product_id = req.params.product_id;

        Product.get(product_id, function(err, product){
            product.getVariants(function(err, variants){
                product.variants = variants;
            });
            Asset.get(asset_id, function(err, asset){
                log.debug('>>asset:'+ JSON.stringify(asset));
                res.json({
                    product: product,
                    asset: asset
                });
            });
        });
    },

    updateAsset: function(req, res, next){
        var Asset = req.models.assets;
        var Variant = req.models.variants;

        log.debug(req.body);
        log.debug(req.files);
        var asset = JSON.parse(req.body.asset),
            file = req.files.file;

        if(!asset.variant || asset.variant.id == null) asset.variant = asset.master_variant;
        log.info(asset.variant);
        var variant_id = asset.variant.id;
        var file_alt = asset.alt;
        if(!file){ // update assets table only
            Asset.get(asset.id, function(err, data){
                //log.debug('>> variant_id:'+ variant_id);
                Variant.get(variant_id, function(err, variant){
                    //log.debug('>> variant: '+ JSON.stringify(variant));
                    data.alt = file_alt;
                    data.setVariant(variant, function(err){

                    });
                    res.status(200).json(data);

                });
            });
            return;
        }

        // delete image file asset
        deleteAssetFile(asset.id, req, res, next);

        var content_type = file.type;
        var file_fullpath = file.path;
        var file_name = file.name;
        var file_path = path.basename(file.path);
        var destPath = uploadPath + file_path;
        log.debug(variant_id);
        log.debug(destPath);
        // create image file asset
        mkdirp(uploadPath, function(err){
            if(err) return next(err);
            var readStream = fs.createReadStream(file_fullpath);
            gm(readStream, 'img.jpg')
                .options({imageMagick: true})
                .resize(240, 240)
                .write(destPath, function(err){
                    if(err) log.error('Image resizing failed!');
                    else log.info('Image resizing done!');
                    fs.unlink(file.path, function(err){
                        if(!err) log.info('Image removed!');
                    });
                    gm(destPath).options({imageMagick: true})
                        .identify(function(err, data){
                            if(!err) {
                                 var conditions = {
                                    attachment_width: data.size.width,
                                    attachment_height: data.size.height,
                                    attachment_file_size: data.Filesize,
                                    position: 0,
                                    attachment_content_type: content_type,
                                    attachment_file_name: file_name,
                                    attachment_file_path: file_path,
                                    alt: file_alt,
                                    variant_id: variant_id
                                };
                                Asset.create(conditions, function( err, asset){
                                    res.json(asset);
                                });
                            }
                        });
                });
        });
    },

    deleteAsset: function(req, res, next){
        var asset_id = req.params.id;
        log.debug('>> asset_id:'+ asset_id);

        deleteAssetFile(asset_id, req, res, next);
        res.status(200).json('Asset removed!');
    },



};

