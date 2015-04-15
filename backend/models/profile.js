module.exports = function(orm, db) {
    var Profile = db.define('profiles', {
        first_name: {
            type: 'text', size: 40,
            required: true
        },
        last_name: {
            type: 'text', size: 40,
            required: true
        },
        nickname: {
            type: 'text', size: 40
        },
        gender: {
            type: 'enum', values:['Male', 'Female', 'Other']
        },
        birth_day: {
            type: 'date', time: false
        },
        picture_id: {
            type: 'integer'
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
    //Profile.hasOne('user', db.models.users, {});
    //Profile.hasOne('address', db.models.addresses, {reverse: 'addresses', autoFetch: true});
    Profile.hasMany('addresses', db.models.addresses, {}, {key: true});
    Profile.hasOne('picture', db.models.assets); //picture path
};
