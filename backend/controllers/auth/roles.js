
module.exports = {
    //roles GET
    index: function (req, res, next) {
        var Role = req.models.roles;

        Role.find().all(function (err, roles) {
            if (err) return next(err);

            //console.log('>> roles.index:');
            //console.log(JSON.stringify(roles));
            res.json(roles);
        });
    }
};