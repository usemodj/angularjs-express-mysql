module.exports = function(orm, db) {
    var Product = db.define('products', {

        name: {
            type: 'text'
        },
        description: {
            type: 'text'
        },
        available_on: {
            type: 'date',
            time: false
        },
        deleted_at: {
            type: 'date',
            time: true
        },
        slug: {
            type: 'text'
        },
        meta_description: {
            type: 'text'
        },
        meta_keywords: {
            type: 'text'
        },
        tax_category_id: {
            type: 'serial'
        },
        shipping_category_id: {
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
    // creates column 'customer_id' in 'users' table
    // User.hasOne('customer', db.models.customers, { required: true, reverse:'users', autoFetch: true });
    //Product.hasMany('option_types', db.models.option_types, {reverse:'products', autoFetch:false, autoFetchLimit:1 });
    Product.sync(); //create a join table 'product_option_types'
};