module.exports = function(orm, db) {
    var OptionValue = db.define('option_values', {

        name: {
            type: 'text'
        },
        presentation: {
            type: 'text'
        },
        position: {
            type: 'integer',
            required: true,
            defaultValue: 0
        },
        option_type_id: {
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
            afterLoad: function() {

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
    //Variant.hasOne('product', db.models.products, { reverse: 'variants', autoFetch:false, autoFetchLimit:21 });
    OptionValue.hasOne('option_type', db.models.option_types, { reverse: 'values'});
    OptionValue.sync();
};