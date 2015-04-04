//var async = require('async');

module.exports = function(orm, db) {
    var Topic = db.define('topics', {

        name: {
            type: 'text',
            required: true
        },
        forum_id: {
            type: 'integer'
        },
        user_id: {
            type: 'integer'
        },
        views: {
            type: 'integer', defaultValue: 0
        },
        replies: {
            type: 'integer', defaultValue: 0
        },
        last_post_id: {
            type: 'integer'
        },
        last_poster_id: {
            type: 'integer'
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
    Topic.hasOne('user', db.models.users, { });
    //Topic.sync(); //create a join table 'product_taxons'


};
