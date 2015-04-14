var log = require('log4js').getLogger("topics");
var _ = require('underscore');
var path = require('path');
var fs = require('fs');
var async = require('async');
var gm = require('gm');
var mv = require('mv');
var settings = require('../config/settings');

var uploadPath = path.join(settings.upload_path, 'images/');

module.exports = {
    //public index
    index: function(req, res, next) {
        //console.log(req);
        var Query = req.db.driver.query;
        //var Role = req.models.roles;
        var Forum = req.models.forums;
        //var Topic = req.models.topics;
        var perPages = 10;

        log.debug(req.cookies);
        var body = req.body;
        var page = body.page || 1;
        if( isNaN(page) || page < 1) page = 1;
        //console.log('>>req.body:'+ JSON.stringify(req.body));
        //console.log('>> page:'+ page);
        var forum_id = body.forum_id;
        var name = body.name || "";
        var email = body.email || "";
        var conditions = {};
        if(name && name.length !== 0) {
            name = '%'+Query.escape(name)+'%';
            conditions.name = name;
        }
        if(email && email.length !== 0) {
            email = '%'+Query.escape(email)+'%';
            conditions.email = email;
        }

        var where = '';

        if(conditions.name) {
            where += ' AND LOWER(name) like '+ Query.escapeVal(conditions.name);
        }
        if(conditions.email) {
            where += ' AND LOWER(email) like '+ Query.escapeVal(conditions.email);
        }

        Forum.getAncestors(forum_id, function(err, forums){
            var stickySql = ' SELECT DISTINCT t.*, u.email, \n'+
                '     (SELECT u.email FROM users u, topics t0 WHERE t0.last_poster_id = u.id AND t0.id = t.id) AS last_poster, \n'+
                '    (SELECT p.name FROM posts p, topics t1 WHERE t1.last_post_id = p.id  AND t1.id = t.id) AS last_post \n'+
                ' FROM topics t \n'+
                ' LEFT OUTER JOIN users u ON u.id = t.user_id \n'+
                ' LEFT OUTER JOIN posts p ON p.topic_id = t.id \n'+
                ' WHERE t.forum_id = ? AND t.sticky = true \n'+
                ' ORDER BY t.created_at DESC ';

            var sql = 'SELECT  * FROM ( \n'+
            ' SELECT DISTINCT t.*, u.email, \n'+
            '     (SELECT u.email FROM users u, topics t0 WHERE t0.last_poster_id = u.id AND t0.id = t.id) AS last_poster, \n'+
            '    (SELECT p.name FROM posts p, topics t1 WHERE t1.last_post_id = p.id  AND t1.id = t.id) AS last_post \n'+
            ' FROM topics t \n'+
            ' LEFT OUTER JOIN users u ON u.id = t.user_id \n'+
            ' LEFT OUTER JOIN posts p ON p.topic_id = t.id \n'+
            ' WHERE t.forum_id = ? AND t.sticky = false \n'+
            ' ) t0 \n'+
            ' WHERE 1 = 1 ' + where ;

            Forum.getDescendants(forum_id, function(err, childForums){
                log.debug(sql);
                req.db.driver.execQuery(stickySql, [forum_id], function(err, stickyTopics){
                    req.db.driver.execQuery('SELECT COUNT(*) AS total FROM ('+sql+') t1',[forum_id], function(err, data){
                        if(err) return next(err);
                        var total = data[0].total;
                        if(total> 0) {
                            req.db.driver.execQuery(sql + ' ORDER BY created_at DESC LIMIT ? OFFSET ? ;', [forum_id, perPages, (page - 1) * perPages], function (err, data) {
                                if (err) return next(err);
                                    res.json({
                                        forums: forums,
                                        child_forums: childForums,
                                        sticky_topics: stickyTopics,
                                        topics: data,
                                        count: total,
                                        page: page
                                    });
                                });

                        } else {
                            res.json({
                                forums: forums,
                                child_forums: childForums,
                                sticky_topics: stickyTopics,
                                topics: null,
                                count: 0,
                                page: page
                            });

                        }
                    });

                });
            });
        });

    },

    // Add new topic without file attachment
    add: function(req, res, next){
        var Forum = req.models.forums;
        var Topic = req.models.topics;
        var Post = req.models.posts;
        var User = req.models.users;
        var ip = req.connection.remoteAddress;
        var user = JSON.parse(req.cookies.user);
        var body = req.body;
        log.debug(body);

        User.one({email: user.email}, function(err, user) {
            if (err || user == null) {
                log.error('Login required!');
                return next(new Error('Login required!'));
            }

            Topic.create({forum_id: body.forum_id,
                name: body.name,
                user_id: user.id,
                locked: body.locked,
                sticky: body.sticky
            }, function (err, topic) {
                if (err) return next(err);
                //log.debug(JSON.stringify(topic));
                Post.create({
                    forum_id: topic.forum_id,
                    topic_id: topic.id,
                    name: topic.name,
                    content: body.content,
                    root: true,
                    user_id:user.id,
                    ipaddress: ip
                }, function (err, post) {
                    if (err) {
                        log.warn(err);
                        res.status(500).json(err);
                    }
                    topic.save({last_post_id: post.id,
                        last_poster_id: post.user_id}, function(err){});
                    Forum.get(topic.forum_id, function(err, forum){
                       forum.save({topic_count: forum.topic_count + 1}, function(err){});
                    });
                    res.status(200).json(topic);
                });
            });
        });
    },
    // Add new topic with file attachment
    uploadTopic: function(req, res, next){
        var Forum = req.models.forums;
        var Topic = req.models.topics;
        var Post = req.models.posts;
        var Asset = req.models.assets;
        var User = req.models.users;
        var ip = req.connection.remoteAddress;
        var user = JSON.parse(req.cookies.user);
        var body = req.body;
        var topic = JSON.parse(req.body.topic),
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
                    Topic.create({forum_id: topic.forum_id,
                        name: topic.name,
                        user_id: user.id,
                        locked: topic.locked,
                        sticky: topic.sticky
                    }, function (err, topic1) {
                        if (err) return callback(err);
                        //log.debug(JSON.stringify(topic));
                        Post.create({
                            forum_id: topic.forum_id,
                            topic_id: topic1.id,
                            name: topic.name,
                            content: topic.content,
                            root: true,
                            user_id:user.id,
                            ipaddress: ip
                        }, function (err, post) {
                            if (err) {
                                log.warn(err);
                                return callback(err);
                            }
                            topic1.save({last_post_id: post.id,
                                last_poster_id: post.user_id}, function(err){
                                Forum.get(topic1.forum_id, function(err, forum){
                                    forum.save({topic_count: forum.topic_count + 1}, function(err,forum){
                                        return callback(null, forum, topic1, post);
                                    });
                                });
                            });
                        });
                    });
                },
                function(forum, topic, post, callback) {
                    if(!Array.isArray(files)){
                        files = (files)? [files]: [];
                    }
                    var index = 0;
                    async.eachSeries(files, function(file, cb){
                        var viewable_id = post.id;
                        var viewable_type = 'Post';
                        var content_type = file.type;
                        var file_name = file.name;
                        var file_path = path.join('forums', path.basename(file.path));
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
                                                    if(!post.assets) post.assets = [];
                                                    post.assets.push(asset);
                                                }
                                                return cb();
                                            });
                                        } else {
                                            return cb();
                                        }
                                    });
                            }

                        });
                    }, function(err){
                        if(err) log.error(err);
                        return callback(null, topic);
                    });
                }
            ], function(err, results){
                //log.info('>> completed task');
                if(err) return res.status(500).json(err);
                return res.status(200).json(results); //topic
            });
        });
    },

    savePost: function(req, res, next){
        var Post = req.models.posts;
        var Asset = req.models.assets;
        var User = req.models.users;
        var ip = req.connection.remoteAddress;
        var user = JSON.parse(req.cookies.user);
        var body = req.body;
        var post = JSON.parse(req.body.post),
            files = req.files.file;
        log.debug(body);
        log.debug(req.files);
        //TODO: update post with file attachment
        User.one({email: user.email}, function(err, user) {
            if (err || user == null) {
                log.error('Login required!');
                return next(new Error('Login required!'));
            }

            async.waterfall([
                function(callback){
                    Post.get(post.id, function (err, post1) {
                        if (err) return callback(err);
                        //log.debug(JSON.stringify(post1));
                        post1.save({
                            name: post.name,
                            content: post.content,
                            user_id:user.id,
                            ipaddress: ip
                        }, function (err, post2) {
                            if (err) {
                                log.warn(err);
                                return callback(err);
                            }
                            return callback(null, post2);
                        });
                    });
                },
                function(post, callback) {
                    if(!Array.isArray(files)){
                        files = (files)? [files]: [];
                    }
                    var index = 0;
                    async.eachSeries(files, function(file, cb){
                        var viewable_id = post.id;
                        var viewable_type = 'Post';
                        var content_type = file.type;
                        var file_name = file.name;
                        var file_path = path.join('forums', path.basename(file.path));
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
                                                    if(!post.assets) post.assets = [];
                                                    post.assets.push(asset);
                                                }
                                                return cb();
                                            });
                                        } else {
                                            return cb();
                                        }
                                    });
                            }

                        });
                    }, function(err){
                        if(err) log.error(err);
                        return callback(null, post);
                    });
                }
            ], function(err, results){
                if(err) return res.status(500).json(err);
                log.debug('>> updated post: '+ JSON.stringify(post));
                return res.status(200).json(results); //post
            });
        });
    },

    deleteTopic: function(req, res, next){
        var Forum = req.models.forums;
        var Topic = req.models.topics;
        //var Post = req.models.posts;
        var Asset = req.models.assets;
        var topic_id = req.params.id;
        //var forum_id = req.params.forum_id;

        Topic.get(topic_id, function(err, topic){
            if(err) return next(err);

            async.waterfall([
                function(callback){
                    //TODO: delete assets and files of the post
                    log.debug('>>topic: '+ JSON.stringify(topic));
                    async.each(topic.posts, function(post, cb){
                        Asset.find({viewable_id: post.id, viewable_type:'Post'}, function(err, assets){
                           if(err) return cb(err);
                           log.debug('>>post assets: '+ JSON.stringify(assets));
                           async.each(assets, function(asset, cb1){
                              Asset.deleteAssetAndFile(asset, function(err){
                                 if(err) return cb1(err);
                                 return cb1();
                              });
                           }, function(err){
                               if(err) return cb(err);
                               return cb();
                           });
                        });
                    }, function(err){
                        if(err) return callback(err);
                        callback(null);
                    });
                },
                function( callback){
                    req.db.driver.execQuery('DELETE FROM posts WHERE topic_id = ? ', [topic.id], function(err, posts) {
                        if(err) return callback(err);
                        log.info('>> Deleted posts count: '); log.info(posts);
                        topic.remove(function (err) {
                            if(err) return callback(err);

                            Forum.get(topic.forum_id, function(err, forum){
                                forum.topic_count -= 1;
                                forum.post_count -= posts.affectedRows - 1;
                                log.info('>> forum topics: '+ forum.topic_count + ' , posts: '+ forum.post_count);
                                forum.save(function(err){
                                    if(err) {
                                        log.error(err);
                                        return callback(err);
                                    }
                                    return callback(null);
                                });
                            });

                        });

                    });
                }
            ], function(err, results){
                if(err) {
                    log.error(err);
                    return res.status(500).json(err);
                }
                res.status(200).json('Topic deleted!');
            });
        });
    },
    viewTopic: function(req, res, next){
        var Forum = req.models.forums;
        var Topic = req.models.topics;
        var Post = req.models.posts;
        var Asset = req.models.assets;
        var topic_id = req.params.id;
        var forum_id = req.params.forum_id;

        //log.debug(body);
        Forum.getAncestors( forum_id, function(err, forums){
            if(err) return next(err);
            Topic.get(topic_id, function(err, topic){
                if(err) return next(err);
                Post.find({topic_id: topic_id}).run(function(err, posts){
                    if(err) return next(err);
                    topic.save({views: topic.views + 1, updated_at: topic.updated_at}, function(err){});
                    async.each(posts, function( post, callback){
                        Asset.find({viewable_id: post.id, viewable_type:'Post'}, function(err, assets){
                            if(!err) post.assets = assets;
                            callback();
                        });
                    }, function(err){
                        log.debug('>>post: '+ JSON.stringify(posts));
                        res.json({
                            forums: forums,
                            topic: topic,
                            posts: posts
                        });
                    });
                });
            });

        });
    },

    replyPost: function(req, res, next){
        var Forum = req.models.forums;
        var Topic = req.models.topics;
        var Post = req.models.posts;
        var User = req.models.users;
        var ip = req.connection.remoteAddress;
        var user = JSON.parse(req.cookies.user);
        var body = req.body;
        log.debug(body);

        User.one({email: user.email}, function(err, user) {
            if (err || user == null) {
                log.error('Login required!');
                return next(new Error('Login required!'));
            }

            Post.create({
                forum_id: body.forum_id,
                topic_id: body.topic_id,
                name: body.name,
                content: body.content,
                root: false,
                user_id:user.id,
                ipaddress: ip
            }, function (err, post) {
                if (err) {
                    log.warn(err);
                    res.status(500).json(err);
                }
                Topic.get(body.topic_id, function(err, topic){
                    if(err) return next(err);
                    topic.save({
                        last_post_id: post.id,
                        last_poster_id: post.user_id,
                        replies: topic.replies + 1
                    }, function(err, topic){
                        if(err) return next(err);
                        Forum.get(body.forum_id, function(err, forum){
                            forum.save({
                                last_topic_id: topic.id,
                                last_post_id: post.id,
                                last_poster_id: post.user_id,
                                last_post_time: new Date(),
                                post_count: forum.post_count + 1
                            }, function(err){});
                        });
                    });
                });
                return res.json(post);
            });
        });
    },
    deletePost: function(req, res, next) {
        var Forum = req.models.forums;
        var Topic = req.models.topics;
        var Post = req.models.posts;
        var Asset = req.models.assets;
        var User = req.models.users;
        var ip = req.connection.remoteAddress;
        var user = JSON.parse(req.cookies.user);
        var body = req.body;
        log.debug(body);

        User.one({email: user.email}, function (err, user) {
            if (err || user == null) {
                log.error('Login email does not exist!');
                return next(new Error('Login email does not exist!'));
            }
            Post.one({id: body.id, user_id: user.id}, function(err, post){
               if(err || post == null) return next(err);
               async.waterfall([
                   function(callback){
                      Asset.find({viewable_id: post.id, viewable_type: 'Post'}, function(err, assets){
                          async.each(assets, function(asset, cb){
                              Asset.deleteAssetAndFile(asset, function(err){
                                  if(err) return cb(err);
                                  return cb();
                              });
                          }, function(err){
                              if(err) return callback(err);
                              return callback(null, post);
                          });
                      })
                   },
                   function(post, callback){
                       post.remove(function(err){
                           if(err) return callback(err);
                           Topic.get(body.topic_id, function(err, topic){
                               if(err) return callback(err);
                               //log.debug(JSON.stringify(topic));
                               var replies = topic.replies - 1
                               topic.save({
                                   replies: ((replies< 0)? 0: replies)
                               }, function(err){
                                   if(err) log.error(err);
                                   Forum.get(post.forum_id, function(err, forum){
                                       var count = forum.post_count - 1;
                                       forum.save({post_count:((count < 0)? 0: count)}, function(err){
                                           if(err) log.error(err);

                                           return callback(null);
                                       });
                                   })
                               });
                           });

                       });
                   }
               ], function(err, results){
                   if(err) return res.status(500).json(err);
                   return res.status(200).json('Post deleted!');
               });
            });
        });

    },
    updatePost: function(req, res, next) {
        //var Forum = req.models.forums;
        var Topic = req.models.topics;
        var Post = req.models.posts;
        //var User = req.models.users;
        var ip = req.connection.remoteAddress;
        //var user = JSON.parse(req.cookies.user);
        var body = req.body;
        log.debug(body);

        Post.get(body.id, function(err, post){
           post.name = body.name;
           post.content = body.content;
           post.ipaddress = ip;
           post.save(function(err, post){
               if(err) return next(err);
               if(post.root){
                   Topic.get(post.topic_id, function(err, topic){
                       if(err) return next(err);
                       topic.name = post.name;
                       topic.save(function(err){
                           if(err) return next(err);
                           return res.status(200);
                       });
                   })
               }
           });
        });
    },
    setSticky: function(req, res, next){
        var Topic = req.models.topics;
        var body = req.body;

        Topic.get(body.id, function(err, topic){
           topic.save({sticky: body.sticky}, function(err){
               if(err) return  next(err);
               return res.status(200);
           });
        });
    },
    setLocked: function(req, res, next){
        var Topic = req.models.topics;
        var body = req.body;

        Topic.get(body.id, function(err, topic){
            topic.save({locked: body.locked}, function(err){
                if(err) return  next(err);
                return res.status(200);
            });
        });
    }

}