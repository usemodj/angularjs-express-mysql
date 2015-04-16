var async = require('async');

module.exports = function(orm, db) {
    var Taxon = db.define('taxons', {

        name: {
            type: 'text',
            required: true
        },
        position: {
            type: 'integer',
            defaultValue: 0
        },
        permalink: {
            type: 'text'
        },
        taxonomy_id: {
            type: 'integer'
        },
        parent_id: {
            type: 'integer'
        },
        lft: {
            type: 'integer'
        },
        rgt: {
            type: 'integer'
        },
        icon_file_name: {
            type: 'text'
        },
        icon_content_type: {
            type: 'text'
        },
        icon_file_size: {
            type: 'integer'
        },
        icon_updated_at: {
            type: 'date',
            time: true
        },
        description: {
            type: 'text'
        },
        meta_title: {
            type: 'text'
        },
        meta_description: {
            type: 'text'
        },
        meta_keywords: {
            type: 'text'
        },
        depth: {
            type: 'integer'
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
    Taxon.hasOne('taxonomy', db.models.taxonomies, { reverse:'taxons', cascadeRemove:true });
    //Taxon.hasMany('products', db.models.products, {}, {});
    //Taxon.sync(); //create a join table 'product_taxons'

    /*
     ref. http://www.sitepoint.com/hierarchical-data-database-2/

     To show the tree structure, children should be indented slightly more than their parent.
     We can do this by keeping a stack of right values.
     Each time you start with the children of a node, you add the right value of
     that node to the stack. You know that all children of that node have a right value
     that is less than the right value of the parent, so by comparing the right value
     of the current node with the last right node in the stack,
     you can see if you’re still displaying the children of that parent.
     When you’re finished displaying a node, you remove its right value from the stack.
     If you count the elements in the stack, you’ll get the level of the current node.
     */
    Taxon.displayTree = function(root_id, callback){
        var tree = [];
        // retrieve the left and right value of the root node
        db.driver.execQuery('SELECT lft, rgt FROM taxons WHERE id = ? LIMIT 1;',[root_id],
            function(err, data){
                if(err) return callback(err, null);
                var root = data[0];
                // start with an empty right stack
                var right = [];
                // now, retrieve all descendants of the root node
                db.driver.execQuery('SELECT id, name, lft, rgt FROM taxons '+
                        ' WHERE lft BETWEEN ? AND ? ORDER BY lft;',[root.lft, root.rgt],
                    function(err, rows){
                        if (err) return callback(err, null);

                        for(var i = 0; i < rows.length; i++) {
                            var row = rows[i];
                            //only check stack if there is one
                            if (right.length > 0) {
                                // check if we should remove a node from the stack
                                while (right[right.length - 1] < row.rgt) {
                                    right.pop();
                                }
                            }
                            // indented node level lvl = right.length
                            row.lvl = right.length;
                            tree.push(row);

                            // add this node to the stack
                            right.push(row.rgt);
                        }

                        return callback(null, tree);
                    });

            });
    };
    /*
     To get this path, we’ll need a list of all ancestors of that node.
     Taxon.get(12, function(err, data){
     Taxon.pathToNode(data, function(err, taxons){
     if(err) console.log(err);
     console.log(JSON.stringify(taxons));
     });
     });
     */
    Taxon.pathToNode = function(node, callback){
        this.find().only('id','name','lft','rgt').where(' lft < ? AND rgt > ?',[node.lft, node.rgt])
            .order('lft').run(function(err, taxons){
                if(err) return callback(err, null);

                return callback(null, taxons);
            });
    };

    /*
     Automating the Tree Traversal
     Taxon.rebuildTree(parent_id, left,depth,cb);
     Taxon.rebuildTree(null,0,-1, function(err, data){
     if(err) console.log(err);
     });
     */
    Taxon.rebuildTreeAll = function( callback){
        Taxon.rebuildTree(null,0,-1, function(err, data){
            if(err) return callback(err);
            return callback(null, data);
        });
    };

    Taxon.rebuildTree = function(parent_id, left, depth, cb){
        console.log('>> begin parent_id:'+ parent_id);
        // the right value of this node is the left value + 1
        var right = left + 1;
        // get all children of this node
        Taxon.find({parent_id: parent_id}).only('id', 'parent_id', 'lft', 'rgt', 'depth').run(function(err, taxons){
            async.eachSeries(taxons, function(taxon, callback){
                // recursive execution of this function for each child of this code
                // right is the current right value, which is incremented by the rebuildTree function
                Taxon.rebuildTree(taxon.id, right, depth + 1, function(err, rgt){
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
                db.driver.execQuery('UPDATE taxons SET lft = ?, rgt = ?, depth = ? WHERE '+ where,[left, right, depth],
                    function(err, data){
                        return cb(null, right + 1);
                    });

            });
        });
    };

    /*
     Adding a Node

     How do we add a node to the tree? There are two approaches:
     you can keep the parent column in your table and just rerun the rebuild_tree() function
     — a simple but not that elegant function; or you can update the left and right values
     of all nodes at the right side of the new node.

     The first option is simple.
     You use the adjacency list method for updating, and the modified preorder tree traversal algorithm for retrieval.
     If you want to add a new node, you just add it to the table and set the parent column.
     Then, you simply rerun the rebuild_tree() function. This is easy,
     but not very efficient with large trees.

     The second way to add, and delete nodes is to update the left and right values of all nodes
     to the right of the new node. Let’s have a look at an example. We want to add a new type
     of fruit, a ‘Strawberry’, as the last node and a child of ‘Red’. First, we’ll have
     to make some space. The right value of ‘Red’ should be changed from 6 to 8,
     the 7-10 ‘Yellow’ node should be changed to 9-12 etc. Updating the ‘Red’ node means that
     we’ll have to add 2 to all left and right values greater than 5.

     We’ll use the query:

     UPDATE tree SET rgt=rgt+2 WHERE rgt>5;

     UPDATE tree SET lft=lft+2 WHERE lft>5;
     Now we can add a new node ‘Strawberry’ to fill the new space. This node has left 6 and right 7.

     INSERT INTO tree SET lft=6, rgt=7, title='Strawberry';

     Food(1:12) -- Fruit(2:11) -- Red(3:6) -- Cherry(4:5)
     |-- Yellow(7:10) -- Banana(8:9)

     Food(1:12) -- Fruit(2:11) -- Red(3:6) -- Cherry(4:5)
     (1:14)         (2:13)|      (3:8)|
     |           |--<<-Strawberry(6:7)
     |-- Yellow(7:10) -- Banana(8:9)
     (9:12) --       (10:11)

     */
};

