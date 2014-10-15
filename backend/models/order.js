module.exports = function(orm, db) {
    var Order = db.define('orders', {

        number: {
            type: 'text'
        },
        item_total: {
            type: 'number'
        },
        total: {
            type: 'number'
        },
        state: {
            type: 'text'
        },
        user_id: {
            type: 'serial'
        },
        completed_at: {
            type: 'date',
            time: true
        },
        bill_address_id: {
            type: 'serial'
        },
        ship_address_id: {
            type: 'serial'
        },
        payment_total: {
            type: 'number'
        },
        shipment_state: {
            type: 'text'
        },
        payment_state: {
            type: 'text'
        },
        email: {
            type: 'text'
        },
        special_instructions: {
            type: 'text',
            big: true
        },
        currency: {
            type: 'text'
        },
        last_ip_address: {
            type: 'text'
        },
        created_by_id: {
            type: 'serial'
        },
        shipment_total: {
            type: 'number'
        },
        item_count: {
            type: 'integer'
        },
        approver_id: {
            type: 'serial'
        },
        approved_at: {
            type: 'date',
            time: true
        },
        confirmation_delivered: {
            type: 'boolean'
        },
        considered_risky: {
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
        //cache: false,
        autoFetch: true,
        methods: {
            // Returns a random integer between min (included) and max (excluded)
            // Using Math.round() will give you a non-uniform distribution!
            getRandomInt: function(min, max) {
                return Math.floor(Math.random() * (max - min)) + min;
            },
            makeNumber: function(){
                return 'R'+ this.getRandomInt(1000000000, 10000000000);
            }
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
//    Product.hasMany('option_types', db.models.option_types, {}, { key:true});

    // Returns a random integer between min (included) and max (excluded)
    // Using Math.round() will give you a non-uniform distribution!
    Order.getRandomInt = function(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    };
    Order.makeNumber = function(){
        return 'R'+ this.getRandomInt(1000000000, 10000000000);
    };

    Order.hasOne("bill_address", db.models.addresses, {cascadeRemove: true});
    Order.hasOne("ship_address", db.models.addresses, {cascadeRemove: true});

    Order.sync(); //create a join table 'product_option_types'
};