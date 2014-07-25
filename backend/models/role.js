module.exports = function(orm, db) {
    var Role = db.define('roles', {
        title: {
            type: 'text'

        },
        bit_mask: {
            type: 'text'
        }
    }, {
        autoFetch: true,
        autoFetchLimit: 2,
        methods: {},
        validations: {},
        hooks: {
            beforeValidation: function() {
                //this.updated_at = new Date();
            }
        }
    });

};
