module.exports = function(orm, db) {
    var PaymentMethod = db.define('payment_methods', {
        name: {
            type: 'text'
        },
        description: {
            type: 'text', big: true
        },
        active: {
            type: 'boolean'
        },
        deleted_at: {
            type: 'date', time:true
        },
        position: {
            type: 'integer'
        },
        display_on: {
            type: 'text'
        },
        auto_capture: {
            type: 'boolean'
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
        autoFetch: true,
        methods: {},
        validations: {},
        hooks: {
            beforeValidation: function() {
                this.updated_at = new Date();
            },
            beforeCreate: function () {
                this.created_at = new Date();
            }

        }
    });
    // creates column 'customer_id' in 'addresses' table
    //Address.hasOne('customer', db.models.customers, {reverse: 'addresses',autoFetch: true});
};
