module.exports = function(orm, db) {
    var Address = db.define('addresses', {
        name: {
            type: 'text'
        },
        address: {
            type: 'text',
            required: true
        },
        address2: {
            type: 'text'
        },
        zipcode: {
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
        methods: {},
        validations: {},
        hooks: {
            beforeValidation: function() {
                this.updated_at = new Date();
            }
        }
    });
    // creates column 'customer_id' in 'addresses' table
    Address.hasOne('customer', db.models.customers, {
        reverse: 'addresses',
        autoFetch: true
    });
};
