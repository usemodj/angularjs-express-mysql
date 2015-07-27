module.exports = function(orm, db) {
    var Payment = db.define('payments', {
        amount: {
            type: 'number'
        },
        order_id: {
            type: 'integer'
        },
        payment_method_id: {
            type: 'integer'
        },
        state: {
            type: 'text'
        },
        response_code: {
            type: 'text'
        },
        avs_response: {
            type: 'text'
        },
        identifier: {
            type: 'text'
        },
        cvv_response_code: {
            type: 'text'
        },
        cvv_response_message: {
            type: 'text'
        },
        uncaptured_amount: {
            type: 'number'
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
        autoFetchLimit: 2,
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
    // creates column 'order_id' in 'payments' table
    Payment.hasOne('order', db.models.orders, {reverse: 'payments'});
    Payment.hasOne('payment_method', db.models.payment_methods);
    //Payment.sync();
};
