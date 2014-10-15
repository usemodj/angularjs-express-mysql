var async = require('async');

module.exports = {
    index: function(req, res, next){
        var Taxonomy = req.models.taxonomies;
        Taxonomy.find().order('position').order('-id').all(function (err, taxonomies) {
            if(err) return next(err);
            //console.log('>> taxonomies:'+ JSON.stringify(taxonomies));
            res.json(taxonomies);
        });
    },

    taxonomy: function(req, res, next){
        console.log('>> req.params.id:'+ req.params.id);

        var id = req.params.id;
        var Taxonomy = req.models.taxonomies;
        var Taxon = req.models.taxons;

        Taxonomy.get(id, function(err, taxonomy){
            if(err) return next(err);
            //delete taxonomy.taxons;
            Taxon.find({taxonomy_id: taxonomy.id}).order('position').run(function(err, data){
                taxonomy.taxons = data;
                //console.log('>> taxonomy:'+ JSON.stringify(taxonomy));
                res.status(200).json(taxonomy);
            });
        });

    },

    updateTaxonomy: function(req, res, next){
        var data = req.body;
        console.log(data);

        var Taxonomy = req.models.taxonomies;
        var Taxon = req.models.taxons;
        Taxonomy.get(data.id, function(err, taxonomy) {
            taxonomy.save({id: data.id, name: data.name}, function (err, row) {
                if (err) return next(err);

                req.db.driver.execQuery('DELETE FROM taxons WHERE taxonomy_id = ?;',[row.id], function(err){
                    if (err) return next(err);

                    for(var i = 0; i < data.taxons.length; i++){
                        delete data.taxons[i].children;
                    }

                    var pos = 0;
                    async.eachSeries(data.taxons, function(taxon, callback){
                        taxon.taxonomy_id = row.id;
                        taxon.position = pos++;
                        Taxon.create(taxon,function(err, data){
                            if(err) return next(err);
                            //console.log('>> taxon:'+ JSON.stringify(data));
                            callback();
                        });
                    }, function(err){
                        if(err) return next(err);
                        Taxon.rebuildTreeAll();
                        console.log('Taxonomy updated!');
                        res.status(200).json(taxonomy);
                    });
                });

            });
        });
    },

    deleteTaxonomy: function(req, res, next){
        var id = req.params.id;
        var Taxonomy = req.models.taxonomies;
        var Taxon = req.models.taxons;

        Taxonomy.get(id, function(err, taxonomy){
            //taxonomy.getTaxons();
            //console.log('>> taxonomy:'+ JSON.stringify(taxonomy));

            req.db.driver.execQuery('DELETE FROM taxons WHERE taxonomy_id = ? ',[taxonomy.id],function(err){
                if(err) return next(err);

                taxonomy.remove(function (err) {
                    console.log('>> Taxonomy removed!');
                    res.status(200).json('Taxonomy removed!');
                });
            });

//            async.eachSeries(taxonomy.taxons, function (value, callback) {
//                Taxon.get(value.id, function (err, taxon) {
//                    taxon.remove(function (err) {
//                        console.log('>> Taxon removed!');
//                        callback();
//                    });
//                });
//            }, function (err) {
//                if (err) return next(err);
//                taxonomy.remove(function (err) {
//                    console.log('>> Taxonomy removed!');
//                    res.status(200).json('Taxonomy removed!');
//                });
//            });

       });
    },

    create: function(req, res, next){
        console.log(req.body);
        var taxonomy = req.body;
        var Taxonomy = req.models.taxonomies;
        var Taxon = req.models.taxons;
        Taxonomy.create(taxonomy, function(err, data){
           if(err) return next(err);
           Taxon.create({taxonomy_id: data.id, name: data.name}, function(err, taxon){
               if(err) return next(err);
               res.status(200).json(data);
            });
        });
    },

    updatePosition: function(req, res, next){
        console.log(req.body);
        var entry = req.body.entry;
        var ids = [];
        if(entry) ids = entry.split(',');

        if(ids.length === 0) return next();
        var Taxonomy = req.models.taxonomies;
        var i = 1;
        async.eachSeries(ids, function(id, callback){
            Taxonomy.get(id, function(err, taxonomy){
                //console.log('>>i:'+i);
                //taxonomy.position = i++;
                taxonomy.save({id:taxonomy.id, position: i++}, function(err){
                    if(err) return next(err);
                    console.log('Taxonomy updated!');
                    callback();
                });
            })
        }, function(err){
            if(err) return next(err);
            res.json(200, 'The positions of taxonomy updated!');
        });
    }

};

