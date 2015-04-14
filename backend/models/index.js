/**
 * 
  Model Properties:  The supported types are:
    
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

var orm = require('orm');
var transaction = require("orm-transaction");

var settings = require('../config/settings');

var connection = null;

function setup(db, cb) {
    require('./user')(orm, db);
    require('./role')(orm, db);
    require('./profile')(orm, db);
    require('./address')(orm, db);
    require('./product')(orm, db);
    require('./variant')(orm, db);
    require('./option_type')(orm, db);
    require('./option_value')(orm, db);
    require('./taxonomy')(orm, db);
    require('./taxon')(orm, db);
    require('./variant')(orm, db);
    require('./asset')(orm, db);
    require('./order')(orm, db);
    require('./line_item')(orm, db);
    require('./state_change')(orm, db);
    require('./payment_method')(orm, db);
    require('./payment')(orm, db);
    require('./shipping_method')(orm, db);
    require('./shipment')(orm, db);
    require('./forum')(orm, db);
    require('./topic')(orm, db);
    require('./post')(orm, db);
    require('./article')(orm, db);

    db.sync(function(err){
        if(err) console.log(err);
        else console.log('Tables created!')
    }); //create tables
    return cb(null, db);
}

/*
 *   cb(err, db)
 */
module.exports = function(cb) {
    if (connection) return cb(null, connection);

    orm.connect(settings.database, function(err, db) {
        if (err) return cb(err);
        db.use(transaction);

        connection = db;
        db.settings.set('instance.returnAllErrors', true);
        db.settings.set("connection.reconnect", true);
        db.settings.set("connection.pool", true);
        db.settings.set("connection.debug", true);

        setup(db, cb);
    });
};
