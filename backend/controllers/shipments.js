var log = require('log4js').getLogger("shipments");

module.exports = {
    getByOrderId: function(req, res, next){
        var Shipment = req.models.shipments;
        var orderId = req.body.order_id;

        Shipment.one({order_id: orderId}, function(err, shipment){
            if(err || !shipment) {
                var msg = err ? err: 'Shipment is empty!';
                return res.status(400).json(msg);
            }
            shipment.getShipping_method(function(err, shippingMethod){
                log.debug(JSON.stringify(shippingMethod));
                shipment.shipping_method = shippingMethod;
                return res.status(200).json(shipment);
            });

        });
    }
};