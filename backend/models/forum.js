var async = require('async');
var log = require('log4js').getLogger("forum model");

module.exports = function(orm, db) {
    var Forum = db.define('forums', {

        parent_id: {
            type: 'integer'
        },
        name: {
            type: 'text',
            required: true
        },
        description: {
            type: 'text'
        },
        display: {
            type: 'integer',
            defaultValue: 0
        },
        lft: {
            type: 'integer'
        },
        rgt: {
            type: 'integer'
        },

        post_count: {
            type: 'integer',defaultValue: 0,required: true
        },
        topic_count: {
            type: 'integer',defaultValue: 0,required: true
        },
        locked: {
            type: 'boolean'
        },
        last_topic_id: {
            type: 'integer'
        },
        last_poster_id: {
            type: 'integer'
        },
        last_post_time: {
            type: 'date', time: true
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
        autoFetch: true,
        autoFetchLimit: 1,
        methods: {
            // How Many Descendants
            descendants: function(){
                return (rgt - lft - 1) / 2;
            }
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

    // creates column 'taxonomy_id' in 'taxons' table
    //Forum.hasOne('taxonomy', db.models.taxonomies, { reverse:'taxons', cascadeRemove:true });
    //Taxon.hasMany('products', db.models.products, {}, {});
    //Forum.sync(function(err){
    //    if(err) log.error(err);
    //    else log.info('Forum table created!');
    //}); //create a join table 'product_taxons'

    Forum.insertNode2 = function(node, callback){
        var sql = 'LOCK TABLES forums WRITE;\n'+
            'UPDATE forums SET rgt = rgt + 2 WHERE rgt >= ?;'+
            'UPDATE forums SET lft = lft + 2 WHERE lft > ?;'+
            'INSERT INTO forums (parent_id, name, description, lft, rgt, created_at, updated_at) VALUES (?,?,?,?,?, now(), now());\n'+
            'UNLOCK TABLES;';
        db.driver.execQuery(sql, [node.rgt, node.rgt, node.id, node.name, node.description, node.rgt, node.rgt + 1],
            function(err, data){
                if(err) return callback(err, null);
                log.debug(JSON.stringify(data));
                return callback(null, data);
            });
    };
    Forum.insertNodeTrx = function(node, callback){
        db.transaction( function(err, trx){
            db.driver.execQuery('UPDATE forums SET rgt = rgt + 2 WHERE rgt >= ?;',[node.rgt], function(err, data){
                if(err){
                    trx.rollback(function(err){
                        if(err) log.warn(err);
                    });
                    return callback(err);
                }
                db.driver.execQuery('UPDATE forums SET lft = lft + 2 WHERE lft > ?;',[node.rgt], function(err, data){
                    if(err){
                        trx.rollback(function(err){
                            if(err) log.warn(err);
                        });
                        return callback(err);
                    }
                    db.driver.execQuery('INSERT INTO forums (parent_id, name, description, lft, rgt, created_at, updated_at) VALUES (?,?,?,?,?, now(), now());',
                        [node.id, node.name, node.description, node.rgt, node.rgt + 1], function(err, forum){

                        if(err){
                            log.warn(err);
                            trx.rollback(function(err){
                                if(err) log.warn(err);
                                else log.info('Rollbacked');
                            });
                            return callback(err, null);
                        }
                        trx.commit(function(err){
                            if(err) log.warn(err);
                            else log.info('Committed');
                        });
                        return callback(null, forum);
                    });
                });
            });
        });
    };

    Forum.insertNode = function(node, callback){
        db.driver.execQuery('UPDATE forums SET rgt = rgt + 2 WHERE rgt >= ?;',[node.rgt], function(err, data){
            if(err){
                return callback(err);
            }
            db.driver.execQuery('UPDATE forums SET lft = lft + 2 WHERE lft > ?;',[node.rgt], function(err, data){
                if(err){
                    return callback(err);
                }
                db.driver.execQuery('INSERT INTO forums (parent_id, name, description, locked, lft, rgt, created_at, updated_at) VALUES (?,?,?,?,?,?, now(), now());',
                    [node.id, node.name, node.description, node.locked, node.rgt, node.rgt + 1], function(err, forum){

                        if(err){
                            log.warn(err);
                            return callback(err, null);
                        }
                        return callback(null, forum);
                    });
            });
        });

    };

    Forum.getNodeLevel = function(id, callback){
      db.driver.execQuery('SELECT n.*, COUNT(*) - 1 AS level \n'+
        ' FROM forums n, forums p \n'+
        ' WHERE n.lft BETWEEN p.lft AND p.rgt AND n.id = ? \n'+
        ' GROUP BY n.lft ORDER BY n.lft;', [id], function(err, forum){
            if(err) return callback(err, null);
            return callback(null, forum);

      });
    };

    Forum.createRoot = function(callback){
        Forum.count(function(err, number){
            if(err || number) return callback('Root node does not created!', null);
            Forum.create({
                name: 'Root',
                description: 'Root Node',
                lft: 1,
                rgt: 2,
                created_at: new Date(),
                updated_at: new Date()
            }, function(err, item){
                if(err) {
                    log.error(err);
                    return callback(err, null);
                }
                return callback(null, item);
            });
        });
    };

    Forum.getRoot = function(callback){
        this.one({lft: 1},
            function(err, forum){
                if(err) return callback(err, null);
                return callback(null, forum);
            });
    };

    /*
     * root - parent - parent - ... - node(id)
     */
    Forum.getAncestors = function(id, callback){
        db.driver.execQuery('SELECT p.* FROM forums n, forums p \n'+
            ' WHERE n.lft BETWEEN p.lft AND p.rgt AND n.id = ? ORDER BY n.lft;',[id],
            function(err, forums){
                if(err) return callback(err, null);
                return callback(null, forums);
            });
    };
    /*
     * the Count of Node and its Descendants
     */
    Forum.getDescendantsCount = function(id, callback){
        var sql = 'SELECT COUNT(*) AS total FROM ( \n'+
            'SELECT o.*, COUNT(p.id)-1 AS level FROM forums AS n, forums AS p, forums AS o \n'+
            ' WHERE o.lft BETWEEN p.lft AND p.rgt AND o.lft BETWEEN n.lft AND n.rgt AND n.id = ? \n'+
            ' GROUP BY o.lft ORDER BY o.lft ) AS t;'
        db.driver.execQuery(sql,[id],
            function(err, count){
                if(err) return callback(err, null);
                return callback(null, count[0].total);
            });
    };
    /*
     * level from sub-tree root
     *  root - parent - parent - node(id) - child[level:1] - child[level:2] - ...
     */
    Forum.getDescendantsLevel = function(id, page, perPages, callback){
        var sql = 'SELECT node.*, (COUNT(parent.id) - (sub_tree.level + 1)) AS level \n'+
        ' FROM forums AS node, forums AS parent, forums AS sub_parent, \n'+
        '  (SELECT node.id, (COUNT(parent.id) - 1) AS level \n'+
        '   FROM forums AS node, forums AS parent \n'+
        '   WHERE node.lft BETWEEN parent.lft AND parent.rgt AND node.id = ? \n'+
        '   GROUP BY node.id ORDER BY node.lft \n'+
        '   )AS sub_tree -- root of sub-tree \n'+
        ' WHERE node.lft BETWEEN parent.lft AND parent.rgt \n'+
        ' AND node.lft BETWEEN sub_parent.lft AND sub_parent.rgt \n'+
        ' AND sub_parent.id = sub_tree.id \n'+
        ' GROUP BY node.id ORDER BY node.lft \n'+
        ' LIMIT ? OFFSET ? ';
        db.driver.execQuery(sql,[id, perPages, ((page-1)*perPages)],
            function(err, forums){
                if(err) return callback(err, null);
                return callback(null, forums);
            });
    };
    /*
     * level from top root
     *  root - parent - parent - node(id)[level:3] - child[level:4] - child[level:5] - ...
     */
    Forum.getDescendants = function(id, callback){
        db.driver.execQuery('SELECT o.*, COUNT(p.id)-1 AS level FROM forums AS n, forums AS p, forums AS o \n'+
                ' WHERE o.lft BETWEEN p.lft AND p.rgt AND o.lft BETWEEN n.lft AND n.rgt AND n.id = ? \n'+
                ' GROUP BY o.lft ORDER BY o.lft;',[id],
            function(err, forums){
                if(err) return callback(err, null);
                return callback(null, forums);
            });
    };

    Forum.getImmediateDescendantsCount = function(id, callback){
        var sql = 'SELECT COUNT(*) AS total FROM ( \n'+
            'SELECT node.* FROM forums AS node, forums AS parent \n'+
            ' WHERE node.lft BETWEEN parent.lft AND parent.rgt -- AND node.lft <> parent.lft \n'+
            ' AND NOT EXISTS -- no middle parent between the parent and node! \n'+
            '  (SELECT * FROM forums AS mid_parent \n'+
            '   WHERE mid_parent.lft BETWEEN parent.lft AND parent.rgt \n'+
            '   AND node.lft BETWEEN mid_parent.lft AND mid_parent.rgt \n'+
            '   AND mid_parent.id NOT IN(node.id, parent.id)) \n'+
            ' AND parent.id = ? \n'+
            ' ) AS t;';
        db.driver.execQuery(sql,[id, page, ((page-1)*perPages)],
            function(err, count){
                if(err) return callback(err, null);
                return callback(null, count[0].total);
            });
    };

    Forum.getImmediateDescendants = function(id, page, perPages, callback){
        var sql = 'SELECT node.* FROM forums AS node, forums AS parent \n'+
        ' WHERE node.lft BETWEEN parent.lft AND parent.rgt -- AND node.lft <> parent.lft \n'+
        ' AND NOT EXISTS -- no middle parent between the parent and node! \n'+
        '  (SELECT * FROM forums AS mid_parent \n'+
        '   WHERE mid_parent.lft BETWEEN parent.lft AND parent.rgt \n'+
        '   AND node.lft BETWEEN mid_parent.lft AND mid_parent.rgt \n'+
        '   AND mid_parent.id NOT IN(node.id, parent.id)) \n'+
        ' AND parent.id = ? \n'+
        ' LIMIT ? OFFSET ? ;';
        db.driver.execQuery(sql,[id, page, ((page-1)*perPages)],
            function(err, forums){
                if(err) return callback(err, null);
                return callback(null, forums);
            });
    };

    Forum.deleteNodeAndDescendantsTrx = function(node, callback){
        db.transaction(function (err, trx) {
            db.driver.execQuery('DELETE FROM forums WHERE lft BETWEEN ? AND ?;',[node.lft, node.rgt],
                function(err, forum){
                    if(err) {
                        trx.rollback(function(err){
                            if(err) log.warn(err);
                        });
                        return callback(err);
                    }
                    db.driver.execQuery('UPDATE forums SET lft=lft - ROUND((? - ? + 1)) WHERE lft > ?;',[node.rgt, node.lft, node.rgt],
                        function(err, data){
                            if(err) {
                                trx.rollback(function(err){
                                    if(err) log.warn(err);
                                });
                                return callback(err);
                            }
                            db.driver.execQuery('UPDATE forums SET rgt=rgt - ROUND((? - ? + 1)) WHERE rgt > ?;',[node.rgt, node.lft, node.rgt],
                                function(err, data){
                                    if(err) {
                                        trx.rollback(function(err){
                                            if(err) log.warn(err);
                                        });
                                        return callback(err);
                                    }
                                    trx.commit(function(err){
                                        if(err) log.warn(err);
                                    });
                                    return callback(null, forum);
                                });
                        });
                });
        });

    };
    Forum.deleteNodeAndDescendants = function(node, callback){

        db.driver.execQuery('DELETE FROM forums WHERE lft BETWEEN ? AND ?;',[node.lft, node.rgt],
            function(err, forum){
            if(err) {
                return callback(err);
            }
            db.driver.execQuery('UPDATE forums SET lft=lft - ROUND((? - ? + 1)) WHERE lft > ?;',[node.rgt, node.lft, node.rgt],
                function(err, data){
                    if(err) {
                        return callback(err);
                    }
                    db.driver.execQuery('UPDATE forums SET rgt=rgt - ROUND((? - ? + 1)) WHERE rgt > ?;',[node.rgt, node.lft, node.rgt],
                        function(err, data){
                            if(err) {
                                return callback(err);
                            }
                            return callback(null, forum);
                        });
                });
        });

    };

    /*
     Automating the Tree Traversal
     Forum.rebuildTree(parent_id, left,cb);
     Forum.rebuildTree(null,0,function(err, data){
     if(err) console.log(err);
     });
     */
    Forum.rebuildTreeAll = function(){
        Forum.rebuildTree(null, 0, function(err, data){
            if(err) {
                log.warn(err);
            }
        });
    };

    Forum.rebuildTree = function(parent_id, left, cb){
        console.log('>> begin parent_id:'+ parent_id);
        // the right value of this node is the left value + 1
        var right = left + 1;
        // get all children of this node
        Forum.find({parent_id: parent_id})/*.only('id', 'parent_id', 'lft', 'rgt')*/.run(function(err, forums){
            //log.debug('>> forums.length: '+ forums.length);
            async.eachSeries(forums, function(forum, callback){

                // recursive execution of this function for each child of this code
                // right is the current right value, which is incremented by the rebuildTree function
                Forum.rebuildTree(forum.id, right, function(err, rgt){
                    if(err) return cb(err, null);
                    right =  rgt;
                    console.log('>> right:'+ right);
                    callback();
                });
            }, function(err){
                if(err) return cb(err, null);
                // we've got the left value, and now that we've processed
                // the children of this node we also know the right value
                console.log('>> parent_id:'+ parent_id);
                var where = (parent_id == null)? 'id IS NULL': 'id = '+ db.driver.query.escapeVal(parent_id);
                db.driver.execQuery('UPDATE forums SET lft = ?, rgt = ? WHERE '+ where,[left, right],
                    function(err, data){
                        return cb(null, right + 1);
                    });

            });
        });
    };

};
