module.exports = function(orm, db) {
    var LineItem = db.define('line_items', {

        variant_id: {
            type: 'serial'
        },
        order_id: {
            type: 'serial'
        },
        quantity: {
            type: 'integer'
        },
        price: {
            type: 'number'
        },
        currency: {
            type: 'text'
        },
        cost_price: {
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
//    Product.hasMany('option_types', db.models.option_types, {}, { key:true});
//    Product.hasMany('taxons', db.models.taxons,{}, { key:true});
    LineItem.hasOne('order', db.models.orders, {reverse: 'line_items'});
    LineItem.sync(); //create a join table 'product_option_types'
};