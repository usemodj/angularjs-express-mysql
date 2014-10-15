var log = require('log4js').getLogger("forums");
var _ = require('underscore');
var async = require('async');

module.exports = {
    //Admin index
    index: function(req, res, next) {
        //console.log(req);
        var Query = req.db.driver.query;
        var Role = req.models.roles;
        var Forum = req.models.forums;
        var perPages = 10;
        var body = req.body;
        var page = body.page || 1;
        if( isNaN(page) || page < 1) page = 1;
        console.log('>>req.body:'+ JSON.stringify(req.body));
        console.log('>> page:'+ page);
        var name = body.name || "";
        var conditions = {};
        if(name && name.length !== 0) {
            name = '%'+Query.escape(name)+'%';
            conditions.name = name;
        }

        var where = '';

        if(conditions.name) {
            where += ' and LOWER(f.name) like '+ Query.escapeVal(conditions.name);
        }

        Forum.getRoot(function(err, forum){
            if(err) return next(err);
            Forum.getDescendantsCount(forum.id, function(err, count){
                if(err) return next(err);
                if(count > 0){
                    Forum.getDescendantsLevel(forum.id, page, perPages, function(err, forums){
                        if(err) return next(err);
                        res.json({
                            forums: forums,
                            count: count,
                            page: page
                        })
                    })
                } else {
                    res.json({
                        forums: null,
                        count: count,
                        page: page
                    })
                }
            });
        });
    },

    add: function(req, res, next){
        var Forum = req.models.forums;
        var body = req.body;
        log.debug(body);
        Forum.one({id: body.id}, function(err, data){
            if(err) return next(err);
            data.name = body.name;
            data.description = body.description;
            log.debug(JSON.stringify(data));
            Forum.insertNode(data, function(err, data){
                if(err){
                    log.warn(err);
                    res.status(500).json(err);
                }
                res.json(data);
            });
        });
    },

    edit: function(req, res, next){
        var Forum = req.models.forums;
        var id = req.params.id;
        //log.debug(body);
        Forum.one({id: id}, function(err, data){
            if(err) return next(err);
            res.json(data);
        });
    },
    update: function(req, res, next){
        var Forum = req.models.forums;
        var body = req.body;
        log.debug(body);
        Forum.one({id: body.id}, function(err, data){
            if(err) return next(err);
            log.debug(JSON.stringify(data));
            data.name = body.name;
            data.description = body.description;
            data.locked = body.locked;

            data.save(function(err, data){
                if(err){
                    log.warn(err);
                    res.status(500).json(err);
                }
                res.json(data);
            });
        });
    },

    remove: function(req, res, next){
        var Forum = req.models.forums;
        var body = req.body;
        log.debug(body);
        var id = req.params.id;

        Forum.one({id: id}, function(err, forum){
            if(err) return next(err);
            log.debug(JSON.stringify(forum));
            Forum.getDescendants(forum.id, function(err, children){
                _.each(children, function(child){
                    req.db.driver.execQuery('DELETE FROM posts WHERE forum_id = ? ', [child.id], function(err){
                        req.db.driver.execQuery('DELETE FROM topics WHERE forum_id = ? ', [child.id], function(err){});
                    });
                });
            });
            Forum.deleteNodeAndDescendants(forum, function(err, data){
                if(err){
                    log.warn(err);
                    res.status(500).json(err);
                }
                res.json(data);
            });
        });
    },

    rebuildTree: function(req, res, next){
        var Forum = req.models.forums;
        Forum.rebuildTreeAll();
        return res.status(200);
    }
}