//var async = require('async');

module.exports = function(orm, db) {
    var Article = db.define('articles', {

        name: {
            type: 'text',
            required: true
        },
        summary: {
            type: 'text'
        },
        content: {
            type: 'text', big: true
        },
        img_url: {
            type: 'text'
        },
        user_id: {
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
    // creates column 'user_id' in 'articles' table
    Article.hasOne('user', db.models.users, {});
    //Article.hasMany('products', db.models.products, {}, {});

};
