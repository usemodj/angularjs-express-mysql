//var async = require('async');

module.exports = function(orm, db) {
    var Ticket = db.define('tickets', {

        subject: {
            type: 'text',
            required: true
        },
        status: {
          type: 'enum', values: ['request', 'feedback']
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
        last_reply_id: {
            type: 'integer'
        },
        last_replier_id: {
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
    // creates column 'user_id' in 'topics' table
    Ticket.hasOne('user', db.models.users, { });

};
