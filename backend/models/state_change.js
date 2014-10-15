module.exports = function(orm, db) {
    var StateChange = db.define('state_changes', {

        name: {
            type: 'text'
        },
        previous_state: {
            type: 'text'
        },
        next_state: {
            type: 'text'

        },
        order_id: {
            type: 'serial'
        },
        user_id: {
            type: 'serial'
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
    // creates column 'customer_id' in 'users' table
    // User.hasOne('customer', db.models.customers, { required: true, reverse:'users', autoFetch: true });
    StateChange.hasOne('order', db.models.orders, { reverse: 'stateChanges'});
    //StateChange.hasMany('users', db.models.users, {}, {key:true});
    StateChange.sync();
};