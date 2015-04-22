var log = require('log4js').getLogger("articles");
var _ = require('underscore');
var path = require('path');
var fs = require('fs');
var async = require('async');
var gm = require('gm');
var mv = require('mv');
var settings = require('../config/settings');

var uploadPath = path.join(settings.upload_path, 'images/');
var thumnailWidth = 300;

module.exports = {
    //public index
    index: function(req, res, next) {
        //console.log(req);
        var Query = req.db.driver.query;
        var orm = req.db.tools;
        //var Role = req.models.roles;
        var Article = req.models.articles;
        var perPages = 12;

        //log.debug(req.cookies);
        var body = req.body;
        var page = body.page || 1;
        if( isNaN(page) || page < 1) page = 1;
        console.log('>>req.body:'+ JSON.stringify(req.body));
        //console.log('>> page:'+ page);
        var name = body.name || "";
        name = '%'+Query.escape(name)+'%';

        Article.count({or: [{name: orm.like(name)}, {summary: orm.like(name)}, {content: orm.like(name)}]},
             function(err, total){
                if(err) return res.status(500).json(err);
                if(total == 0) {
                    return res.status(200).json({
                        articles: [],
                        count: total,
                        page: page
                    });
                }

                Article.find({or: [{name: orm.like(name)}, {summary: orm.like(name)}, {content: orm.like(name)}]})
                    .order('-id').limit(perPages).offset((page - 1) * perPages).run( function(err, articles){
                        if(err) return res.status(500).json(err);
                        return res.status(200).json({
                            articles: articles,
                            count: total,
                            page: page
                        });
                    });
            });

    },

    // Create new article with file attachment
    uploadArticle: function(req, res, next){
        var Article = req.models.articles;
        var Asset = req.models.assets;
        var User = req.models.users;

        var ip = req.connection.remoteAddress;
        var user = JSON.parse(req.cookies.user);
        var body = req.body;
        var article = JSON.parse(req.body.article),
            files = req.files.file;

        log.debug(body);
        log.debug(req.files);

        User.one({email: user.email}, function(err, user) {
            if (err || user == null) {
                log.error('Login required!');
                return next(new Error('Login required!'));
            }

            async.waterfall([
                function(callback){
                    if(article.summary) article.summary = article.summary.substr(0,254);
                    Article.create({
                        name: article.name,
                        summary: article.summary,
                        content: article.content,
                        img_url: article.img_url,
                        user_id: user.id
                    }, function (err, article1) {
                        if (err) return callback(err);
                        //log.debug(JSON.stringify(article1));
                        return callback(null, article1);
                    });
                },
                function(article, callback) {
                    if(!Array.isArray(files)){
                        files = (files)? [files]: [];
                    }
                    var index = 0;
                    async.eachSeries(files, function(file, cb){
                        var viewable_id = article.id;
                        var viewable_type = 'Article';
                        var content_type = file.type;
                        var file_name = file.name;
                        var file_path = path.join('articles', path.basename(file.path));
                        var destPath = uploadPath + file_path;

                        mv( file.path, destPath, {mkdirp:true}, function(err){
                            if(err) {
                                log.error(err);
                                return cb();
                            }
                            else {
                                gm(destPath).options({imageMagick: true})
                                    .identify(function(err, data){
                                        if(!err) {
                                            var conditions = {
                                                attachment_width: data.size.width,
                                                attachment_height: data.size.height,
                                                attachment_file_size: data.Filesize,
                                                position: index++,
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
                                                    if(!article.assets) article.assets = [];
                                                    article.assets.push(asset);
                                                }
                                                // Create thumnail
                                                var readStream = fs.createReadStream(destPath);
                                                var dot = destPath.lastIndexOf('.');
                                                var thumbPath = (dot > -1)? destPath.substring(0, dot)+ '-th'+ destPath.substring(dot)
                                                                : destPath + '-th';

                                                gm(readStream, 'img.jpg').options({imageMagick: true}).resize(thumnailWidth)
                                                    .write(thumbPath, function(err){
                                                        if(err) log.error( err);
                                                        return cb();
                                                    });

                                            });
                                        } else {
                                            return cb();
                                        }
                                    });
                            }

                        });
                    }, function(err){
                        if(err) log.error(err);
                        return callback(null, article);
                    });
                }
            ], function(err, results){
                //log.info('>> completed task');
                if(err) return res.status(500).json(err);
                return res.status(200).json(results); //article
            });
        });
    },

    // Update article with file attachment
    saveArticle: function(req, res, next){
        var Article = req.models.articles;
        var Asset = req.models.assets;
        var User = req.models.users;
        var ip = req.connection.remoteAddress;
        var user = JSON.parse(req.cookies.user);
        var body = req.body;
        var article = JSON.parse(req.body.article),
            files = req.files.file;
        log.debug(body);
        log.debug(req.files);
        //update article with file attachment
        User.one({email: user.email}, function(err, user) {
            if (err || user == null) {
                log.error('Login email does not exist!');
                return next(new Error('Login email does not exist!'));
            }

            async.waterfall([
                function(callback){
                    Article.get(article.id, function (err, article1) {
                        if (err) return callback(err);
                        //log.debug(JSON.stringify(article1));
                        if(article.summary) article.summary = article.summary.substr(0,254);
                        article1.save({
                            name: article.name,
                            summary: article.summary,
                            content: article.content,
                            img_url: article.img_url,
                            user_id: user.id,
                            ipaddress: ip
                        }, function (err, article2) {
                            if (err) {
                                log.warn(err);
                                return callback(err);
                            }
                            return callback(null, article2);
                        });
                    });
                },
                function(article, callback) {
                    if(!Array.isArray(files)){
                        files = (files)? [files]: [];
                    }
                    var index = 0;
                    async.eachSeries(files, function(file, cb){
                        var viewable_id = article.id;
                        var viewable_type = 'Article';
                        var content_type = file.type;
                        var file_name = file.name;
                        var file_path = path.join('articles', path.basename(file.path));
                        var destPath = uploadPath + file_path;

                        mv( file.path, destPath, {mkdirp:true}, function(err){
                            if(err) {
                                log.error(err);
                                return cb();
                            }
                            else {
                                gm(destPath).options({imageMagick: true})
                                    .identify(function(err, data){
                                        if(!err) {
                                            var conditions = {
                                                attachment_width: data.size.width,
                                                attachment_height: data.size.height,
                                                attachment_file_size: data.Filesize,
                                                position: index++,
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
                                                    if(!article.assets) article.assets = [];
                                                    article.assets.push(asset);
                                                }
                                                // Create thumnail
                                                var readStream = fs.createReadStream(destPath);
                                                var dot = destPath.lastIndexOf('.');
                                                var thumbPath = (dot > -1)? destPath.substring(0, dot)+ '-th'+ destPath.substring(dot)
                                                    : destPath + '-th';

                                                gm(readStream, 'img.jpg').options({imageMagick: true}).resize(thumnailWidth)
                                                    .write(thumbPath, function(err){
                                                        if(err) log.error( err);
                                                        return cb();
                                                    });
                                            });
                                        } else {
                                            return cb();
                                        }
                                    });
                            }

                        });
                    }, function(err){
                        if(err) log.error(err);
                        return callback(null, article);
                    });
                }
            ], function(err, results){
                if(err) return res.status(500).json(err);
                log.debug('>> updated article: '+ JSON.stringify(results));
                return res.status(200).json(results); //article
            });
        });
    },

    deleteArticle: function(req, res, next){
        var Article = req.models.articles;
        var Asset = req.models.assets;
        var article_id = req.params.id || req.body.id;
        log.debug(req.params);
        log.debug(req.body);

        Article.get(article_id, function(err, article){
            if(err) return next(err);

            //delete assets and files of the article
            //log.debug('>> article: '+ JSON.stringify(article));
            Asset.find({viewable_id: article.id, viewable_type:'Article'}, function(err, assets){
                if(err) return cb(err);
                //log.debug('>>article assets: '+ JSON.stringify(assets));
                async.eachSeries(assets, function(asset, cb){
                    Asset.deleteAssetAndFile(asset, function(err){
                        if(err) return cb(err);
                        return cb();
                    });
                }, function(err){
                    if(err) {
                        log.error(err);
                        return res.status(500).json(err);
                    }
                    article.remove(function (err) {
                        if(err) {
                            log.error(err);
                            return res.status(500).json(err);
                        }
                        return res.status(200).json('Article Removed!');
                    });
                });
             });
        });
    },

    viewArticle: function(req, res, next){
        var Article = req.models.articles;
        var Asset = req.models.assets;
        var User = req.models.users;
        var article_id = req.params.id;

        //log.debug(body);
            Article.get(article_id, function(err, article){
                if(err) return next(err);
                User.one({id: article.user_id}, function(err, user){
                    if(!err) article.user = user.serialize();
                    Asset.find({viewable_id: article.id, viewable_type:'Article'}, function(err, assets){
                        if(!err) article.assets = assets;
                        log.debug('>>article: '+ JSON.stringify(article));
                        res.status(200).json( article);
                    });
                })
        });
    }

}