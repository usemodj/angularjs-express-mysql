var async = require('async');
var log = require('log4js').getLogger("taxons");
var settings = require('../config/settings');

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
    },
    // Public search products by taxon id
    products: function(req, res, next){
        var Query = req.db.driver.query;
        var perPages = 10;
        var page = parseInt(req.params.page || req.body.page) || 1;
        if( isNaN(page) || page < 1) page = 1;
        log.debug('>>req.body:'+ JSON.stringify(req.body));
        log.debug('>> page:'+ page);
        var taxonId = req.body.id || '';
        var name = req.body.name || '';
        try {
            name = Query.escape('%' + name + '%').toLowerCase();
        } catch(err){
            log.error(err);
        }
        var timezone = settings.database.timezone;
        var sql = ' SELECT p.id, p.name, p.available_on, va.price, va.file_path, va.alt \n'+
            ' FROM products_taxons pt, products p, (select convert_tz(now(),@@session.time_zone,"'+ timezone +'") AS now) t, \n'+
            ' 	(SELECT v.product_id,v.price, asset.id AS asset_id, asset.file_path, asset.alt \n'+
            ' 	FROM variants v, \n'+
            ' 			(SELECT a.id, a.viewable_id, a.viewable_type, a.attachment_file_path AS file_path, a.alt, \n'+
            ' 			@asset_rank := IF(@current_variant = a.viewable_id, @asset_rank + 1, 1) AS asset_rank, \n'+
            ' 			@current_variant := a.viewable_id \n'+
            ' 			FROM assets a, (SELECT @asset_rank :=0) r WHERE a.viewable_type = "Variant" \n'+
            ' 			ORDER BY a.position, a.id \n'+
            ' 			) asset \n'+
            ' 	WHERE v.id = asset.viewable_id AND asset_rank = 1 \n'+
            ' 	) va  \n'+
            ' WHERE va.product_id = p.id AND pt.taxons_id = ? AND pt.products_id = p.id \n'+
        ' AND (p.deleted_at IS NULL OR p.deleted_at >= t.now) \n'+
        ' AND p.available_on <= t.now AND va.price IS NOT NULL \n'+
        ' AND (LOWER(p.name) LIKE ? OR LOWER(p.description) LIKE ?) \n'+
        ' ORDER BY p.available_on DESC ';
        //log.debug(sql);

        req.db.driver.execQuery( sql + ' LIMIT ? OFFSET ?;',[taxonId, name, name, perPages, (page - 1)* perPages], function(err, products){
            if(err) return next(err);
            req.db.driver.execQuery('SELECT count(*) AS cnt FROM ('+sql +') p LIMIT 1;', [taxonId, name, name], function(err, row){
                if(err) return next(err);
                //console.log('>>row:'+ JSON.stringify(row));
                res.status(200).json({
                    products: products,
                    count: row[0].cnt,
                    page: page
                });
            });
        });
    }

};

