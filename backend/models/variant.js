module.exports = function(orm, db) {
    var Variant = db.define('variants', {

        sku: {
            type: 'text',
            required: true
        },
        weight: {
            type: 'number'
        },
        height: {
            type: 'number'

        },
        width: {
            type: 'number'
        },
        depth: {
            type: 'number'
        },
        is_master: {
            type: 'boolean'
        },
        deleted_at:{
            type: 'date',
            time: true
        },
        product_id: {
            type: 'integer'
        },
        price: {
            type: 'number'
        },
        cost_price: {
            type: 'number'
        },
        cost_currency: {
            type: 'text'
        },
        position: {
            type: 'integer'
        },
        track_inventory: {
            type: 'boolean'
        },
        tax_category_id: {
            type: 'integer'
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
                //this.created_at = new Date();
            }
        }

    });
    // creates column 'customer_id' in 'users' table
    // User.hasOne('customer', db.models.customers, { required: true, reverse:'users', autoFetch: true });
    Variant.hasOne('product', db.models.products, { reverse: 'variants'});
    Variant.hasMany('option_values', db.models.option_values, {}, {key:true});
    //Variant.sync();
};