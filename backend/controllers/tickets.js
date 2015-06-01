var log = require('log4js').getLogger("tickets");
var _ = require('underscore');
var path = require('path');
var fs = require('fs');
var async = require('async');
var gm = require('gm');
var mv = require('mv');
var settings = require('../config/settings');
var markdown = require('markdown').markdown;
var uploadPath = path.join(settings.upload_path, 'images/');

function sendFeedbackMail(from, to, subject, content, link, transport, callback){
    content += '\n\n['+ subject +']('+ link +')\n';
    var message = {};
    message.from = from;
    message.to = to;
    message.subject = subject;
    message.html = markdown.toHTML(content);
    log.debug(message);
    transport.sendMail(message, function (err) {
        if (err) {
            log.error(err.message);
            return callback(err);
        }
        log.info('Feedback Mail sent successfully!');
        //log.debug(message);
        // if you don't want to use this transport object anymore, uncomment following line
        //transport.close(); // close the connection pool
        return callback(null, message);
    });

};

module.exports = {
    //public index
    index: function(req, res, next) {
        //console.log(req);
        var Query = req.db.driver.query;
        //var Role = req.models.roles;
        //var Ticket = req.models.tickets;
        var User = req.models.users;

        var perPages = 10;
        var user = JSON.parse(req.cookies.user);

        var body = req.body;
        var page = body.page || 1;
        if( isNaN(page) || page < 1) page = 1;
        log.debug(req.body);
        //console.log('>> page:'+ page);
        var subject = body.subject || "";
        var conditions = {};
        if(subject && subject.length !== 0) {
            subject = '%'+Query.escape(subject)+'%';
            conditions.subject = subject;
        }

        var where = '';

        if(conditions.subject) {
            where += ' AND LOWER(subject) like '+ Query.escapeVal(conditions.subject);
        }

        User.one({email: user.email}, function(err, user) {
            if (err || user == null) {
                log.error('Login required!');
                return res.status(401).send(new Error('Login required!'));
            }

            var sql = 'SELECT  * FROM ( \n'+
            ' SELECT DISTINCT t.*, u.email, \n'+
            '    (SELECT u.email FROM users u, tickets t0 WHERE t0.last_replier_id = u.id AND t0.id = t.id) AS last_replier, \n'+
            '    (SELECT m.created_at FROM messages m, tickets t1 WHERE t1.last_reply_id = m.id  AND t1.id = t.id) AS last_replied_at \n'+
            ' FROM tickets t \n'+
            ' LEFT OUTER JOIN users u ON u.id = t.user_id \n'+
            ' LEFT OUTER JOIN messages m ON m.ticket_id = t.id \n'+
            ' WHERE t.user_id = ? \n'+
            ' ) tt \n'+
            ' WHERE 1 = 1 ' + where ;

            req.db.driver.execQuery('SELECT COUNT(*) AS total FROM ('+sql+') t1',[user.id], function(err, data){
                if(err) return res.status(500).send(err);
                var total = data[0].total;
                if(total> 0) {
                    req.db.driver.execQuery(sql + ' ORDER BY created_at DESC LIMIT ? OFFSET ? ;', [user.id, perPages, (page - 1) * perPages], function (err, data) {
                        if (err) return next(err);
                        return res.status(200).json({
                            tickets: data,
                            count: total,
                            page: page
                        });
                    });

                } else {
                    return res.status(200).json({
                        ticket: null,
                        count: 0,
                        page: page
                    });

                }
            });
        });

    },
    //admin index
    adminSearch: function(req, res, next) {
        //console.log(req);
        var Query = req.db.driver.query;
        //var Role = req.models.roles;
        //var Ticket = req.models.tickets;
        var User = req.models.users;

        var perPages = 10;
        var user = JSON.parse(req.cookies.user);

        var body = req.body;
        var page = body.page || 1;
        if( isNaN(page) || page < 1) page = 1;
        log.debug(req.body);
        //console.log('>> page:'+ page);
        var subject = body.subject || "";
        var status = body.status || "";
        var conditions = {};
        if(subject && subject.length !== 0) {
            subject = '%'+Query.escape(subject)+'%';
            conditions.subject = subject;
        }
        if(status && status.length != 0){
            conditions.status = status;
        }
        var where = '';

        if(conditions.subject) {
            where += ' AND LOWER(subject) like '+ Query.escapeVal(conditions.subject.toLowerCase());
        }
        if(conditions.status) {
            where += ' AND LOWER(status) = '+ Query.escapeVal(conditions.status.toLowerCase());
        }

        User.one({email: user.email}, function(err, user) {
            if (err || user == null) {
                log.error('Login required!');
                return res.status(401).send(new Error('Login required!'));
            }

            var sql = 'SELECT  * FROM ( \n'+
                ' SELECT DISTINCT t.*, u.email, \n'+
                '    (SELECT u.email FROM users u, tickets t0 WHERE t0.last_replier_id = u.id AND t0.id = t.id) AS last_replier, \n'+
                '    (SELECT m.created_at FROM messages m, tickets t1 WHERE t1.last_reply_id = m.id  AND t1.id = t.id) AS last_replied_at \n'+
                ' FROM tickets t \n'+
                ' LEFT OUTER JOIN users u ON u.id = t.user_id \n'+
                ' LEFT OUTER JOIN messages m ON m.ticket_id = t.id \n'+
                ' ) tt \n'+
                ' WHERE 1 = 1 ' + where ;

            req.db.driver.execQuery('SELECT COUNT(*) AS total FROM ('+sql+') t1', function(err, data){
                if(err) return res.status(500).send(err);
                var total = data[0].total;
                if(total> 0) {
                    req.db.driver.execQuery(sql + ' ORDER BY created_at DESC LIMIT ? OFFSET ? ;', [ perPages, (page - 1) * perPages], function (err, data) {
                        if (err) return next(err);
                        return res.status(200).json({
                            tickets: data,
                            count: total,
                            page: page
                        });
                    });

                } else {
                    return res.status(200).json({
                        ticket: null,
                        count: 0,
                        page: page
                    });

                }
            });
        });

    },

    // Add new topic with file attachment
    uploadTicket: function(req, res, next){
        var Ticket = req.models.tickets;
        var Message = req.models.messages;
        var Asset = req.models.assets;
        var User = req.models.users;
        var ip = req.connection.remoteAddress;
        var user = JSON.parse(req.cookies.user);
        var body = req.body;
        var ticket = JSON.parse(req.body.ticket),
            files = req.files.file;

        log.debug(body);
        log.debug(req.files);

        User.one({email: user.email}, function(err, user) {
            if (err || user == null) {
                log.error('Login required!');
                return res.status(401).send(new Error('Login required!'));
            }

            async.waterfall([
                function(callback){
                    Ticket.create({
                        subject: ticket.subject,
                        user_id: user.id,
                        status: ticket.status
                    }, function (err, ticket2) {
                        if (err) return callback(err);
                        //log.debug(JSON.stringify(topic));
                        Message.create({
                            ticket_id: ticket2.id,
                            content: ticket.content,
                            root: true,
                            user_id:user.id,
                            ipaddress: ip
                        }, function (err, message) {
                            if (err) {
                                log.warn(err);
                                return callback(err);
                            }
                            ticket2.save({
                                last_reply_id: message.id,
                                last_replier_id: message.user_id
                            }, function(err){
                                return callback(null, ticket2, message);
                            });
                        });
                    });
                },
                function( ticket, message, callback) {
                    if(!Array.isArray(files)){
                        files = (files)? [files]: [];
                    }
                    var index = 0;
                    async.eachSeries(files, function(file, cb){
                        var viewable_id = message.id;
                        var viewable_type = 'Message';
                        var content_type = file.type;
                        var file_name = file.name;
                        var file_size = file.size;
                        var file_path = path.join('tickets', path.basename(file.path));
                        var destPath = uploadPath + file_path;

                        mv( file.path, destPath, {mkdirp:true}, function(err){
                            if(err) {
                                log.error(err);
                                return cb();
                            }
                            else {
                                if(content_type.indexOf('image') !== -1){//image file
                                    gm(destPath).options({imageMagick: true})
                                        .identify(function (err, data) {
                                            if (!err) {
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
                                                Asset.create(conditions, function (err, asset) {
                                                    if (!err) {
                                                        log.info('Asset created!');
                                                        if (!message.assets) message.assets = [];
                                                        message.assets.push(asset);
                                                        return cb();
                                                    } else {
                                                        log.error(err);
                                                        return cb();
                                                    }

                                                });
                                            } else {
                                                log.error(err);
                                                return cb();
                                            }
                                        });

                                }else {//non-image file
                                    var conditions = {
                                        attachment_file_size: file_size,
                                        position: index++,
                                        attachment_content_type: content_type,
                                        attachment_file_name: file_name,
                                        attachment_file_path: file_path,
                                        //alt: file_alt,
                                        viewable_id: viewable_id,
                                        viewable_type: viewable_type
                                    };
                                    Asset.create(conditions, function (err, asset) {
                                        if (!err) {
                                            log.info('Asset created!');
                                            if (!message.assets) message.assets = [];
                                            message.assets.push(asset);
                                            return cb();
                                        } else {
                                            log.error(err);
                                            return cb();
                                        }

                                    });
                                }
                            }

                        });
                    }, function(err){
                        if(err) log.error(err);
                        ticket.message = message;
                        return callback(null, ticket);
                    });
                }
            ], function(err, results){
                if(err) {
                    log.error(err);
                    return res.status(500).json(err);
                }
                return res.status(200).json(results); //ticket
            });
        });
    },

    viewTicket: function(req, res, next){
        var Ticket = req.models.tickets;
        var Message = req.models.messages;
        var User = req.models.users;
        var Asset = req.models.assets;

        var user = JSON.parse(req.cookies.user);
        var ticket_id = req.params.id;

        log.debug(req.body);
        User.one({email: user.email}, function(err, user) {
            if (err || user == null) {
                log.error('Login required!');
                return res.status(401).send(new Error('Login required!'));
            }

            Ticket.get(ticket_id, function (err, ticket) {
                if (err) return res.status(500).send(err);

                //log.debug('>>ticket.user_id: '+ ticket.user_id + ' == user.id:'+ user.id);
                if(ticket.user_id != user.id && !user.authorize('editor')) return  res.status(500).json('It is not allowed to you!');

                ticket.save({views: ticket.views + 1, updated_at: ticket.updated_at}, function (err) {
                });
                ticket.getMessages(function (err, messages) {
                    if (err) return res.status(500).send(err);
                    async.each(messages, function (message, callback) {
                        User.one({id: message.user_id}, function (err, user) {
                            if (!err) message.user = user.serialize();
                            Asset.find({viewable_id: message.id, viewable_type: 'Message'}, function (err, assets) {
                                if (!err) message.assets = assets;
                                return callback();
                            });
                        });
                    }, function (err) {
                        return res.status(200).json({
                            ticket: ticket
                        });
                    });
                });
            });
        });
        //Ticket.get(ticket_id, function(err, ticket){//use if autoFetch: false
        //    if(err) return res.status(500).send(err);
        //    Message.find({ticket_id: ticket_id}).run(function(err, messages){
        //        if(err) return res.status(500).send(err);
        //        ticket.save({views: ticket.views + 1, updated_at: ticket.updated_at}, function(err){});
        //        async.each( messages, function( message, callback){
        //            User.one({id: message.user_id}, function(err, user){
        //                if(!err) message.user = user.serialize();
        //                Asset.find({viewable_id: message.id, viewable_type:'Message'}, function(err, assets){
        //                    if(!err) message.assets = assets;
        //                    return callback();
        //                });
        //            });
        //        }, function(err){
        //            log.debug('>>messages: '+ JSON.stringify(messages));
        //            ticket.messages = messages;
        //            return res.status(200).json({
        //                ticket: ticket
        //            });
        //        });
        //    });
        //});

    },

    // update message with file attachment
    updateMessage: function(req, res, next){
        var Ticket = req.models.tickets;
        var Message = req.models.messages;
        var Asset = req.models.assets;
        var User = req.models.users;
        var ip = req.connection.remoteAddress;
        var user = JSON.parse(req.cookies.user);
        var body = req.body;
        var message = JSON.parse(req.body.message),
            files = req.files.file;
        log.debug(body);
        log.debug(req.files);
        //update message with file attachment
        User.one({email: user.email}, function(err, user) {
            if (err || user == null) {
                log.error('Login required!');
                return res.status(401).send(new Error('Login required!'));
            }

            async.waterfall([
                function(callback){
                    Message.get(message.id, function (err, message1) {
                        if (err) return callback(err);
                        log.debug(JSON.stringify(message1));
                        message1.save({
                            content: message.content,
                            user_id:user.id,
                            ipaddress: ip
                        }, function (err, message2) {
                            if (err) {
                                log.warn(err);
                                return callback(err);
                            }

                            return callback(null, message2);

                        });
                    });
                },
                function(message, callback) {
                    if(!Array.isArray(files)){
                        files = (files)? [files]: [];
                    }
                    var index = 0;
                    async.eachSeries(files, function(file, cb){
                        var viewable_id = message.id;
                        var viewable_type = 'Message';
                        var content_type = file.type;
                        var file_name = file.name;
                        var file_size = file.size;
                        var file_path = path.join('tickets', path.basename(file.path));
                        var destPath = uploadPath + file_path;

                        mv( file.path, destPath, {mkdirp:true}, function(err){
                            if(err) {
                                log.error(err);
                                return cb();
                            }
                            else {
                                if(content_type.indexOf('image') !== -1){
                                    gm(destPath).options({imageMagick: true})
                                        .identify(function (err, data) {
                                            if (!err) {
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
                                                Asset.create(conditions, function (err, asset) {
                                                    if (!err) {
                                                        log.info('Asset created!');
                                                        if (!message.assets) message.assets = [];
                                                        message.assets.push(asset);
                                                        return cb();
                                                    } else {
                                                        log.error(err);
                                                        return cb();
                                                    }

                                                });
                                            } else {
                                                log.error(err);
                                                return cb();
                                            }
                                        });

                                }else {
                                    var conditions = {
                                        attachment_file_size: file_size,
                                        position: index++,
                                        attachment_content_type: content_type,
                                        attachment_file_name: file_name,
                                        attachment_file_path: file_path,
                                        //alt: file_alt,
                                        viewable_id: viewable_id,
                                        viewable_type: viewable_type
                                    };
                                    Asset.create(conditions, function (err, asset) {
                                        if (!err) {
                                            log.info('Asset created!');
                                            if (!message.assets) message.assets = [];
                                            message.assets.push(asset);
                                            return cb();
                                        } else {
                                            log.error(err);
                                            return cb();
                                        }

                                    });
                                }
                            }

                        });
                    }, function(err){
                        if(err) log.error(err);
                        return callback(null, message);
                    });
                }
            ], function(err, results){
                if(err) {
                    log.error(err);
                    return res.status(500).json(err);
                }
                log.debug('>> updated message: '+ JSON.stringify(message));
                return res.status(200).json(results); //message
            });
        });
    },


    replyMessage: function(req, res, next){
        var Message = req.models.messages;
        var Asset = req.models.assets;
        var User = req.models.users;
        var ip = req.connection.remoteAddress;
        var user = JSON.parse(req.cookies.user);
        var message = JSON.parse(req.body.message),
            files = req.files.file;
        var body = req.body;
        log.debug(body);
        log.debug(req.files);

        User.one({email: user.email}, function(err, user) {
            if (err || user == null) {
                log.error('Login required!');
                return res.status(401).json('Login required!');
            }

            async.waterfall([
                function(callback){
                    Message.create({
                        ticket_id: message.ticket_id,
                        content: message.content,
                        user_id:user.id,
                        ipaddress: ip,
                        created_at: new Date()
                    }, function (err, message2) {
                        if (err) {
                            log.warn(err);
                            return callback(err);
                        }
                        message2.getTicket(function(err, ticket){
                            if(err) callback(err);
                            ticket.status = message.status;
                            ticket.replies += 1;
                            ticket.last_reply_id = message2.id;
                            ticket.last_replier_id= message2.user_id;

                            ticket.save(function(err){
                                return callback(null, ticket, message2);
                            });
                        });

                    });

                },

                function(ticket, message, callback) {
                    if(!Array.isArray(files)){
                        files = (files)? [files]: [];
                    }
                    var index = 0;
                    async.eachSeries(files, function(file, cb){
                        var viewable_id = message.id;
                        var viewable_type = 'Message';
                        var content_type = file.type;
                        var file_name = file.name;
                        var file_size = file.size;
                        var file_path = path.join('tickets', path.basename(file.path));
                        var destPath = uploadPath + file_path;

                        mv( file.path, destPath, {mkdirp:true}, function(err){
                            if(err) {
                                log.error(err);
                                return cb();
                            }
                            else {
                                if(content_type.indexOf('image') !== -1){
                                    gm(destPath).options({imageMagick: true})
                                        .identify(function (err, data) {
                                            if (!err) {
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
                                                Asset.create(conditions, function (err, asset) {
                                                    if (!err) {
                                                        log.info('Asset created!');
                                                        if (!message.assets) message.assets = [];
                                                        message.assets.push(asset);
                                                        return cb();
                                                    } else {
                                                        log.error(err);
                                                        return cb();
                                                    }

                                                });
                                            } else {
                                                log.error(err);
                                                return cb();
                                            }
                                        });

                                }else {
                                    var conditions = {
                                        attachment_file_size: file_size,
                                        position: index++,
                                        attachment_content_type: content_type,
                                        attachment_file_name: file_name,
                                        attachment_file_path: file_path,
                                        //alt: file_alt,
                                        viewable_id: viewable_id,
                                        viewable_type: viewable_type
                                    };
                                    Asset.create(conditions, function (err, asset) {
                                        if (!err) {
                                            log.info('Asset created!');
                                            if (!message.assets) message.assets = [];
                                            message.assets.push(asset);
                                            return cb();
                                        } else {
                                            log.error(err);
                                            return cb();
                                        }

                                    });
                                }
                            }

                        });
                    }, function(err){
                        if(err) log.error(err);
                        return callback(null, ticket, message);
                    });
                },
                function(ticket, message, callback){ //send e-mail
                    if(ticket.status == 'feedback'){
                        ticket.getUser(function(err, user){
                            if(err) return callback(null, message);
                            //to: user.email
                            //ticket.subject
                            //message.content
                            var link = settings.site_url + '/#/supports/' + ticket.id;
                            sendFeedbackMail(settings.postmailer, user.email, ticket.subject, message.content, link, req.transport, function(err){
                                return callback(null, message);
                            });
                        });
                    } else {
                        return callback(null, message);
                    }
                }
            ], function(err, results){
                if(err) {
                    log.error(err);
                    return res.status(500).json(err);
                }
                log.debug('>> updated message: '+ JSON.stringify(message));
                //return res.status(200).json(results); //message
                return res.status(200).end();
            });

        });
    }


}