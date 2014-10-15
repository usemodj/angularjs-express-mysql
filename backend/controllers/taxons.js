var async = require('async');

module.exports = {
    index: function(req, res, next){
        console.log(req.query);
        console.log(req.body);
        var Taxon = req.models.taxons;
        Taxon.find().order('taxonomy_id').order('position').run(function (err, taxons) {
            if(err) return next(err);
            //console.log('>> taxons:'+ JSON.stringify(taxons));
            res.json(taxons);
        });
    },

};

