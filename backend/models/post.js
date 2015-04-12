//var async = require('async');

module.exports = function(orm, db) {
    var Post = db.define('posts', {

        name: {
            type: 'text',
            required: true
        },
        content: {
            type: 'text', big: true
        },
        root: {
            type: 'boolean', defaultValue: false
        },
        user_id: {
            type: 'integer'
        },
        forum_id: {
            type: 'integer'
        },
        topic_id: {
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
        autoFetch: false,
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
    // creates column 'taxonomy_id' in 'taxons' table
    //Post.hasOne('topic', db.models.topics, { reverse:'posts', cascadeRemove:true });
    Post.hasOne('topic', db.models.topics, { reverse:'posts', cascadeRemove:true });
    //Taxon.hasMany('products', db.models.products, {}, {});
    //Post.sync(); //create a join table 'product_taxons'

};
