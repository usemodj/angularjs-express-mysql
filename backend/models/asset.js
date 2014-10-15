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
    Asset.hasOne('variant', db.models.variants, { reverse:'assets' });
    //Taxon.hasMany('products', db.models.products, {}, {});
    Asset.sync(); //create a join table 'product_taxons'

};