module.exports = function(orm, db) {
    var Shipment = db.define('shipments', {
        tracking: {
            type: 'text'
        },
        number: {
            type: 'text'
        },
        cost: {
            type: 'number'
        },
        shipped_at: {
            type: 'date', time: true
        },
        order_id: {
            type: 'integer'
        },
        address_id: {
            type: 'integer'
        },
        shipping_method_id: {
            type: 'integer'
        },
        state: {
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

    // Returns a random integer between min (included) and max (excluded)
    // Using Math.round() will give you a non-uniform distribution!
    Shipment.getRandomInt = function(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    };
    Shipment.makeNumber = function(){
        return 'H'+ this.getRandomInt(1000000000, 10000000000);
    };

    // creates column 'order_id' in 'payments' table
    Shipment.hasOne('order', db.models.orders, {reverse: 'shipments'});
    Shipment.hasOne('shipping_method', db.models.shipping_methods);
    //Shipment.hasOne('address', db.models.addresses);
    //Shipment.sync();
};
