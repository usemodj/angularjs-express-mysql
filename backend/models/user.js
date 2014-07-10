var crypto = require('crypto');

module.exports = function(orm, db) {
    var User = db.define('users', {

        email: {
            type: 'text',
            required: true,
            unique: true
        },
        encrypted_password: {
            type: 'text'
        },
        password_salt: {
            type: 'text'
        },
        reset_password_token: {
            type: 'text',
            unique: true
        },
        remember_token: {
            type: 'text'
        },
        remember_created_at: {
            type: 'date',
            time: true
        },
        sign_in_count: {
            type: 'integer'
        },
        current_sign_in_at: {
            type: 'date',
            time: true
        },
        last_sign_in_at: {
            type: 'date',
            time: true
        },
        current_sign_in_ip: {
            type: 'text'
        },
        last_sign_in_ip: {
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
        methods: {
            // password : {
            //         set: function(val) {
            //         	this.setAttribute('password_salt', this.makeSalt());
            //             this.setAttribute('encrypted_password', this.encryptPassword( val));
            //         }
            //     },
            serialize: function() {
                return {
                    id: this.id,
                    email: this.email
                };
            },
            /**
             * Authenticate - check if the passwords are the same
             */

            authenticate: function(plainText) {
                return this.encryptPassword(plainText) === this.encrypted_password;
            },

            /**
             * Make salt
             */

            makeSalt: function() {
                return crypto.randomBytes(16).toString('base64');
            },

            /**
             * Encrypt password
             */
            encryptPassword: function(password) {
                if (!password || !this.password_salt) return '';
                var salt = new Buffer(this.password_salt, 'base64');
                return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
            },
            encryptPassword2: function(password, password_salt) {
                if (!password || !password_salt) return '';
                var salt = new Buffer(password_salt, 'base64');
                return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
            },
            randomToken: function() {
                return Math.round((new Date().valueOf() * Math.random())) + '';
            }

        },
        validations: {
            //encrypted_password: orm.validators.equalToProperty(this.retype_password, 'Passwords don't match'),
            //encrypted_password : 
            //	orm.validators.equalToProperty( this.retype_password, 'Passwords don't match.'),
            //orm.validators.rangeLength(5, undefined, 'Password must be at least 5 characters!'),

            email: [
                orm.validators.patterns.email('The specified email is invalid.'),
                orm.validators.unique('The specified email address is already in use.')
            ]
        },
        hooks: {
            beforeValidation: function() {
                this.updated_at = new Date();
            },
            afterLoad: {

            },
            beforeSave: function() {

           },
            beforeCreate: function() {
                this.created_at = new Date();
            }
        }
    });
    // creates column 'customer_id' in 'users' table
    // User.hasOne('customer', db.models.customers, { required: true, reverse:
    // 'users', autoFetch: true });

    User.findOne = function(user, callback) {
        //console.log('>> findOne user:' + JSON.stringify(user));
        // Model.find([ conditions ] [, options ] [, limit ] [, order ] [, cb ])
        //this.find({email: user.email, encrypted_password: this.encryptPassword(user.password)}, 1, callback); // limit 1
        this.one({
            email: user.email
        }, function(err, person) {
            if (err) {
                callback(err);
            } else {
                if (person.encrypted_password == person.encryptPassword(user.password)) {
                //if (person.encrypted_password == person.encryptPassword2(user.password, person.password_salt)) {
                    callback(null, person);
                } else {
                    var errors = [{
                        property: 'encrypted_password',
                        msg: 'Password is incorrect.',
                        value: user.password
                    }];
                    callback(errors);
                }
            }
        });
    }

    User.findByPasswordToken = function(user, callback) {
        this.one({
            email: user.email,
            reset_password_token: user.reset_password_token
        }, function(err, person) {
            if (err) {
                callback(err);
            } else {
            	if(!person){
	                    var errors = [{
	                        property: 'retype_password',
	                        msg: 'Password token is invalid.',
	                        value: user.password
	                    }];
	                    callback(errors);
	             } else {
            		callback(null, person);
            	}
            }
        });
    }

    //	Person.find({ surname: "Doe" }).limit(3).offset(2).only("name", "surname").run(function (err, people) {
    // finds people with surname='Doe', skips first 2 and limits to 3 elements,
    // returning only 'name' and 'surname' properties
};
