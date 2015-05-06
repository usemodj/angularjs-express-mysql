//var async = require('async');

module.exports = function(orm, db) {
    var Message = db.define('messages', {

        content: {
            type: 'text', big: true,
            required: true
        },
        root: {
            type: 'boolean', defaultValue: false
        },
        user_id: {
            type: 'integer'
        },
        ticket_id: {
            type: 'integer'
        },
        ipaddress: {
            type: 'text'
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
    // creates column 'ticket_id' in 'messages' table
    Message.hasOne('ticket', db.models.tickets, { reverse:'messages', cascadeRemove:true });

};
