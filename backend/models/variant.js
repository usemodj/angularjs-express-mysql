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
        product_id: {
            type: 'serial'
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
            type: 'serial'
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
                //this.created_at = new Date();
            }
        }

    });
    // creates column 'customer_id' in 'users' table
    // User.hasOne('customer', db.models.customers, { required: true, reverse:'users', autoFetch: true });
    Variant.hasOne('product', db.models.products, { reverse: 'variants', autoFetch:false, autoFetchLimit:1 });
    //Variant.hasOne('product', db.models.products, { autoFetch:true, autoFetchLimit:1 });
};