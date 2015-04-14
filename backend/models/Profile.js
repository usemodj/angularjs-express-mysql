module.exports = function(orm, db) {
    var Profile = db.define('profiles', {
        first_name: {
            type: 'text',
            required: true
        },
        last_name: {
            type: 'text',
            required: true
        },
        active: {
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
    // creates column 'user_id' in 'customers' table
    Profile.hasOne('user', db.models.users, {
        //required: true,
        reverse: 'profile',
        autoFetch: true
    });
    //Profile.hasOne('address', db.models.addresses, {reverse: 'addresses', autoFetch: true});
    Profile.hasOne('address', db.models.addresses, {reverse: 'addresses'});
};
