var log = require('log4js').getLogger("shipments");

module.exports = {
    getByOrderId: function(req, res, next){
        var Shipment = req.models.shipments;
        var orderId = req.body.order_id;

        Shipment.one({order_id: orderId}, function(err, shipment){
            if(err) return next(err);
            shipment.getShipping_method(function(err, shippingMethod){
                log.debug(JSON.stringify(shippingMethod));
                shipment.shipping_method = shippingMethod;
                return res.json(shipment);
            });

        });
    }
}