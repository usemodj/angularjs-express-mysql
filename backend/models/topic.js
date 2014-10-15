//var async = require('async');

module.exports = function(orm, db) {
    var Topic = db.define('topics', {

        name: {
            type: 'text',
            required: true
        },
        forum_id: {
            type: 'serial'
        },
        user_id: {
            type: 'serial'
        },
        views: {
            type: 'integer', defaultValue: 0
        },
        replies: {
            type: 'integer', defaultValue: 0
        },
        last_post_id: {
            type: 'serial'
        },
        last_poster_id: {
            type: 'serial'
        },
        locked: {
            type: 'boolean', defaultValue: 0
        },
        sticky: {
            type: 'boolean', defaultValue: 0
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
    Topic.hasOne('forum', db.models.forums, { cascadeRemove:true });
    //Taxon.hasMany('products', db.models.products, {}, {});
    Topic.sync(); //create a join table 'product_taxons'


};
