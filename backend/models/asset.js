//var async = require('async');

module.exports = function(orm, db) {
    var Asset = db.define('assets', {

        viewable_id: {
            type: 'integer'
        },
        viewable_type: {
            type: 'text'
        },
        attachment_width: {
            type: 'integer'
        },
        attachment_height: {
            type: 'integer'
        },
        attachment_file_size: {
            type: 'text'
        },
        position: {
            type: 'integer'
        },
        attachment_content_type: {
            type: 'text'
        },
        attachment_file_name: {
            type: 'text'
        },
        attachment_file_path: {
            type: 'text'
        },
        type: {
            type: 'text'
        },
        attachment_updated_at: {
            type: 'date',
            time: true
        },
        alt: {
            type: 'text', big:true
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
        cache: false,
        autoFetch: true,
        autoFetchLimit: 2,
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
    // creates column 'viewable_id' in 'Asset' table
    Asset.hasOne('viewable', db.models.variants, { reverse:'assets' });
    Asset.hasOne('viewable', db.models.posts, { reverse:'postAssets' });

};