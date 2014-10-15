module.exports = function(orm, db) {
    var Taxonomy = db.define('taxonomies', {

        name: {
            type: 'text'
        },
        position: {
            type: 'integer',
            required: true,
            defaultValue: 0
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
            afterLoad: function(){

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
    //Variant.hasOne('product', db.models.products, { reverse: 'variants', autoFetch:false, autoFetchLimit:1 });
    //Variant.hasOne('product', db.models.products, { autoFetch:true, autoFetchLimit:2 });
};