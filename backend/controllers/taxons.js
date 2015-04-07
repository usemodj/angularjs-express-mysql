var async = require('async');
var log = require('log4js').getLogger("taxons");
module.exports = {
    index: function(req, res, next){
        log.debug(req.query);
        log.debug(req.body);
        var Taxon = req.models.taxons;
        Taxon.find().order('taxonomy_id').order('position').run(function (err, taxons) {
            if(err) return next(err);
            log.debug('>> taxons:'+ JSON.stringify(taxons));
            res.status(200).json(taxons);
        });
    }

};

