/**
 * 
	Model Properties:	 The supported types are:
		
		text: A text string;
		number: A floating point number. You can specify size: 2|4|8.
		integer: An integer. You can specify size: 2|4|8.
		boolean: A true/false value;
		date: A date object. You can specify time: true
		enum: A value from a list of possible values;
		object: A JSON object;
		point: A N-dimensional point (not generally supported);
		binary: Binary data.
		
	Each type can have additional options:
		
		All types support 'required' (boolean), 'unique' (boolean) and 'defaultValue' (text). 
		Text type also supports maximum 'size' of string (number) and 'big' (boolean - for very long strings). 
		Number type is a float, 'size' (number - byte size) and 'unsigned' (boolean). 
		Date type supports 'time' (boolean).

  	Model Hooks: Currently the following events are supported:
		
		afterLoad : (no parameters) Right after loading and preparing an instance to be used;
		afterAutoFetch : (no parameters) Right after auto-fetching associations (if any), it will trigger regardless of having associations or not;
		beforeSave : (no parameters) Right before trying to save;
		afterSave : (bool success) Right after saving;
		beforeCreate : (no parameters) Right before trying to save a new instance (prior to beforeSave);
		afterCreate : (bool success) Right after saving a new instance;
		beforeRemove : (no parameters) Right before trying to remove an instance;
		afterRemove : (bool success) Right after removing an instance;
		beforeValidation : (no parameters) Before all validations and prior to beforeCreate and beforeSave;
 */

module.exports = function(orm, db){
	var User = db.define('users', {
//		email: {type: 'text', required: true, unique: true},
//		encryptedPassword: {type: 'text'},
//		passwordSalt: {type: 'text'},
//		resetPasswordToken: {type: 'text', unique: true},
//		rememberToken: {type: 'text'},
//		rememberCreatedAt: {type: 'date', time: true},
//		signInCount: {type: 'integer'},
//		currentSignInAt: {type: 'date', time: true},
//		lastSignInAt: {type: 'date', time: true},
//		currentSignInIp: {type: 'text'},
//		lastSignInIp: {type: 'text'},
//		createdAt: {type: 'date', time: true},
//		updatedAt: {type: 'date', required: true, time: true}

		email: {type: 'text', required: true, unique: true},
		encrypted_password: {type: 'text'},
		password_salt: {type: 'text'},
		reset_password_token: {type: 'text', unique: true},
		remember_token: {type: 'text'},
		remember_created_at: {type: 'date', time: true},
		sign_in_count: {type: 'integer'},
		current_sign_in_at: {type: 'date', time: true},
		last_sign_in_at: {type: 'date', time: true},
		current_sign_in_ip: {type: 'text'},
		last_sign_in_ip: {type: 'text'},
		created_at: {type: 'date', time: true},
		updated_at: {type: 'date', required: true, time: true}
		
	}, {
		methods: {
		},
		validations: {
			email : orm.enforce.ranges.length(4, undefined, "Email is more than 4 characters!")
		},
		hooks: {
		      beforeValidation: function () {
		          //this.updatedAt = new Date();
		          this.updated_at = new Date();
		        }
		}
	});

	//User.hasOne('customer', db.models.customer, { required: true, reverse: 'users', autoFetch: true });
};