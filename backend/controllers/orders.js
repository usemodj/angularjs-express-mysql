var log = require('log4js').getLogger("orders");
var _ = require('underscore');
var async = require('async');

var getOrderItems = function(order_id, req, res, callback){

    var Order = req.models.orders;
    var LineItem = req.models.line_items;
    var User = req.models.users;
    var user = JSON.parse(req.cookies.user);
    //log.debug(user);

    User.one({email: user.email}, function(err, user){
        if(err || user == null) {
            log.error('Login required!');
            return callback(new Error('Login required!'));
        };
        Order.get(order_id, function (err, order) {
            if (err || order == null) return callback(err);

            var sql = 'SELECT DISTINCT li.*, sv1.options, a3.attachment_file_path FROM \n'+
                ' (SELECT l.*, p.id AS product_id, p.name, p.shipment_cost FROM line_items l,variants v, products p \n'+
                ' WHERE l.variant_id = v.id AND v.product_id = p.id AND l.order_id = ? \n'+
                ' ) li \n'+
                ' INNER JOIN \n'+
                ' (SELECT sv.id, sv.product_id, GROUP_CONCAT(sv.options) AS options \n'+
                ' FROM (SELECT v.id, v.product_id, concat(t.presentation,":", o.presentation) AS options \n'+
                ' FROM variants v, variants_option_values vo, option_values o, option_types t \n'+
                ' WHERE v.id = vo.variants_id and vo.option_values_id = o.id and o.option_type_id = t.id) sv \n'+
                ' GROUP BY sv.id) sv1 \n'+
                ' ON li.variant_id = sv1.id \n'+
                ' INNER JOIN \n'+
                ' (SELECT a2.*, p.id AS product_id FROM \n'+
                ' (SELECT a1.* FROM \n'+
                ' (SELECT a.variant_id, min(a.id) as min_id \n'+
                ' FROM assets a, variants v WHERE a.variant_id = v.id \n'+
                ' GROUP BY v.product_id \n'+
                ' ) a \n'+
                ' INNER JOIN assets a1 ON a1.variant_id = a.variant_id AND a1.id = a.min_id \n'+
                ' ) a2 \n'+
                ' INNER JOIN variants v \n'+
                ' ON v.id = a2.variant_id \n'+
                ' INNER JOIN products p \n'+
                ' ON p.id = v.product_id \n'+
                ' ) a3 \n'+
                ' ON a3.product_id = sv1.product_id;';

            req.db.driver.execQuery(sql, [order.id], function(err, lineItems){
                if(err) return callback(err);
                order.line_items = lineItems;

                return callback(null, order);
            })
        });
    });
};

var sendConfirmationMail = function(order, transport){
    var html = '<ul>';
    _.each(order.line_items, function(item){
        //log.debug('>>line_item:' + JSON.stringify(item));
        html += '<li>'+ item.name + ': '+ item.price + ' x '+ item.quantity + '</li>'
    });
    html += '<p>Total: '+ order.item_total + ' + ' + order.shipment_total + '(Shipment)</p>';

    //var transport = req.transport;
    var message = {};
    message.to = order.email;
    message.subject = 'Order Confirmation Mail';
    message.html = html;

    transport.sendMail(message, function (error) {
        if (error) {
            console.log('Error occured');
            console.log(error.message);
            return next(error);
        }
        console.log('Message sent successfully!');
        console.log(message);
        // if you don't want to use this transport object anymore, uncomment following line
        //transport.close(); // close the connection pool
        return 'Message sent successfully!';
    });
};

module.exports = {
    searchOrders: function(req, res, next) {
        //console.log(req);
        var Query = req.db.driver.query;
        var Role = req.models.roles;
        var Order = req.models.orders;

        var body = req.body;
        var perPages = 10;
        var page = parseInt(body.page) || 1;
        if( isNaN(page) || page < 1) page = 1;
        console.log('>>req.body:'+ JSON.stringify(req.body));
        console.log('>> page:'+ page);

        var from = body.from;
        var to = body.to;
        var number = body.number;
        var name = body.name;
        var completed = body.completed;
        var state = body.state;
        var email = body.email;

        var conditions = {};
        if(from){
            conditions.from = from;
        }
        if(to){
            conditions.to = to;
        }
        if(number) {
            conditions.number = Query.escape(number);
        }
        if(state){
           conditions.state = state;
        }
        if(name && name.length !== 0) {
            conditions.name = '%'+Query.escape(name)+'%';
        }
        if(email && email.length !== 0) {
            conditions.email = '%'+ Query.escape(email)+'%';
        }

        if(completed === true) conditions.completed_at = 'IS NOT NULL';
        //console.log('>>conditions:'+ JSON.stringify(conditions));
        //console.log(conditions);

        var where = '';

        if(conditions.from){
            where += ' AND DATE(o.completed_at) >= '+ Query.escapeVal(conditions.from);
        }
        if(conditions.to){
            where += ' AND DATE(o.completed_at) <= '+ Query.escapeVal(conditions.to);
        }
        if(conditions.number){
            where += ' AND o.number = '+ Query.escapeVal(number);
        }
        if(conditions.state){
            where += ' AND o.state = '+ Query.escapeVal(state);
        }
        if(conditions.name) {
            where += ' AND LOWER(a.name) like '+ Query.escapeVal(conditions.name);
        }
        if(conditions.email){
            where += ' AND LOWER(o.email) like '+ Query.escapeVal(conditions.email);
        }
        if(conditions.completed_at){
            where += ' AND o.completed_at '+ conditions.completed_at;
        }

        log.debug(where);
        var sql = 'SELECT o.*, a.name FROM orders o LEFT JOIN addresses a ON o.bill_address_id = a.id ' +
                ' WHERE 1 = 1 '+ where +
            ' ORDER BY o.updated_at DESC ';
        //console.log('>> query:'+ sql);

        req.db.driver.execQuery( sql + ' LIMIT ? OFFSET ?;',[perPages, (page - 1)* perPages]
            , function(err, orders){
                if(err) return next(err);
                //console.log('>>products:'+ JSON.stringify(products));

                req.db.driver.execQuery('SELECT count(*) AS cnt FROM ('+sql +') p LIMIT 1;', function(err, row){
                    if(err) return next(err);
                    //console.log('>>row:'+ JSON.stringify(row));
                    res.json({
                        orders: orders,
                        count: row[0].cnt,
                        page: page
                    });

                });
            }
        );
    },

    addCart: function(req, res, next){
        //console.log(req);
        log.debug('>>remoteAddress:'+ req.connection.remoteAddress);

        var Order = req.models.orders;
        var LineItem = req.models.line_items;
        var User = req.models.users;
        var ip = req.connection.remoteAddress;
        var user = JSON.parse(req.cookies.user);
        var body = req.body;
        log.debug(req.cookies);
        log.debug(user);
        log.debug('>>user_id:'+user.id);
        log.debug('>>email:'+user.email);
        log.debug(body);
        User.one({email: user.email}, function(err, user){

            if(err || user == null) {
                log.error('Login required!');
                return next(new Error('Login required!'));
            };

            Order.one({user_id: user.id, completed_at: null}, function(err, order){
                if(err) return next(err);
                //log.debug(order);
                var item_total = body.quantity * body.variant.price;
                var shipment_total = body.shipment_cost || 0;
                if(order == null){
                    Order.create({// create order and lineItem
                        number: Order.makeNumber(),
                        item_total: item_total,
                        total: item_total + shipment_total,
                        state: 'cart',
                        user_id: user.id,
                        email: user.email,
                        shipment_total: shipment_total,
                        item_count: body.quantity,
                        currency: body.variant.cost_currency,
                        last_ip_address: ip
                    }, function(err, order){
                        if(err) return next(err);
                        LineItem.create({
                            variant_id: body.variant.id,
                            order_id: order.id,
                            quantity: body.quantity,
                            price: body.variant.price,
                            currency: body.variant.cost_currency,
                            cost_price: body.variant.cost_price
                        }, function(err, lineItem){
                            if(err) return next(err);
                            res.json(order);
                        })

                    });
                } else {// update order and create lineItem
                    order.item_total += item_total;
                    order.total += item_total;
                    order.item_count += body.quantity;
                    order.last_ip_address = ip;
                    order.save(function(err, data){
                        LineItem.create({
                            variant_id: body.variant.id,
                            order_id: order.id,
                            quantity: body.quantity,
                            price: body.variant.price,
                            currency: body.variant.cost_currency,
                            cost_price: body.variant.cost_price
                        }, function(err, lineItem){
                            if(err) return next(err);
                            res.json(order);
                        });
                    });
                }
            });

        });

    },

    getCart: function(req, res, next) {
        var Order = req.models.orders;
        var LineItem = req.models.line_items;
        var User = req.models.users;
        var user = JSON.parse(req.cookies.user);
        log.debug(user);

        User.one({email: user.email}, function(err, user){
            if(err || user == null) {
                log.error('Login required!');
                return next(new Error('Login required!'));
            };

            Order.one({user_id: user.id, completed_at: null}, function (err, order) {
                if (err || order == null) return next(err);

                var sql = 'SELECT DISTINCT li.*, sv1.options, a3.attachment_file_path FROM \n'+
                    ' (SELECT l.*, p.id AS product_id, p.name, p.shipment_cost FROM line_items l,variants v, products p \n'+
                    ' WHERE l.variant_id = v.id AND v.product_id = p.id AND l.order_id = ? \n'+
                    ' ) li \n'+
                    ' INNER JOIN \n'+
                    ' (SELECT sv.id, sv.product_id, GROUP_CONCAT(sv.options) AS options \n'+
                    ' FROM (SELECT v.id, v.product_id, concat(t.presentation,":", o.presentation) AS options \n'+
                    ' FROM variants v, variants_option_values vo, option_values o, option_types t \n'+
                    ' WHERE v.id = vo.variants_id and vo.option_values_id = o.id and o.option_type_id = t.id) sv \n'+
                    ' GROUP BY sv.id) sv1 \n'+
                    ' ON li.variant_id = sv1.id \n'+
                    ' INNER JOIN \n'+
                    ' (SELECT a2.*, p.id AS product_id FROM \n'+
                    ' (SELECT a1.* FROM \n'+
                    ' (SELECT a.variant_id, min(a.id) as min_id \n'+
                    ' FROM assets a, variants v WHERE a.variant_id = v.id \n'+
                    ' GROUP BY v.product_id \n'+
                    ' ) a \n'+
                    ' INNER JOIN assets a1 ON a1.variant_id = a.variant_id AND a1.id = a.min_id \n'+
                    ' ) a2 \n'+
                    ' INNER JOIN variants v \n'+
                    ' ON v.id = a2.variant_id \n'+
                    ' INNER JOIN products p \n'+
                    ' ON p.id = v.product_id \n'+
                    ' ) a3 \n'+
                    ' ON a3.product_id = sv1.product_id;';


                log.debug(JSON.stringify(order));
                req.db.driver.execQuery(sql, [order.id], function(err, lineItems){
                    order.line_items = lineItems;

                    res.json(order);
                })
            });
        });
    },

    updateCart: function(req, res, next){
        var Order = req.models.orders;
        var LineItem = req.models.line_items;
        var User = req.models.users;

        var ip = req.connection.remoteAddress;
        var user = JSON.parse(req.cookies.user);
        var body = req.body; //order
        log.debug(body);
        log.debug(user);

        User.one({email: user.email}, function(err, user){
           if(err || user == null){
               log.err('Login required!');
               return next(new Error('Login required!'));
           }

           var item_total = 0;
           var item_count = 0;
            _.each(body.line_items, function( item){
                item_total += (item.quantity * item.price);
                item_count += item.quantity;
           });

            Order.one({user_id: user.id, completed_at: null}, function (err, order) {
                if (err || order == null) return next(err);
                order.item_total = item_total;
                order.total = item_total + body.shipment_total;
                order.item_count = item_count;
                order.last_ip_address = ip;
                order.save(function (err, data) {
                    //log.debug('>> order:'+ JSON.stringify(data));

                    req.db.driver.execQuery('DELETE FROM line_items WHERE order_id = ?', [order.id], function(err){

                        async.eachSeries(body.line_items, function(item, callback){
                            LineItem.create({
                                order_id: data.id,
                                currency: data.currency,
                                variant_id: item.variant_id,
                                quantity: item.quantity,
                                price: item.price,
                                cost_price: item.cost_price
                            }, function (err, lineItem) {
                                callback();
                            });

                        }, function(err){
                            res.json(data); //order
                        });
                   });
                });
            });
        });
    },

    updateAddressState: function(req, res, next){
        var Order = req.models.orders;
        var StateChange = req.models.state_changes;
        var User = req.models.users;

        var ip = req.connection.remoteAddress;
        var user = JSON.parse(req.cookies.user);
        var body = req.body; //order
        log.debug(body);
        log.debug(user);

        User.one({email: user.email}, function(err, user){
            if(err || user == null){
                log.err('Login required!');
                return next(new Error('Login required!'));
            }
            Order.one({user_id: user.id, completed_at: null}, function (err, order) {
                if (err || order == null) return next(err);
                order.state = 'address';
                order.save(function(err, order1){
                    if(err) return next(err);
                    StateChange.one({order_id: order.id, previous_state: 'cart'}, function(err, change){
                        if(err || change == null){

                            StateChange.create({
                                name: 'order',
                                next_state: 'address',
                                previous_state: 'cart',
                                order_id: order.id,
                                user_id: user.id
                            }, function(err){
                                res.json(order1);
                            });

                        } else {
                            change.created_at = new Date();
                            change.next_state = 'address';
                            change.previous_state = 'cart';
                            change.save(function(err){
                                res.json(order1);
                            });

                        }
                    })
                })
            });
        });
    },

    saveAddress: function(req, res, next) {
        var Order = req.models.orders;
        var Address = req.models.addresses;
        var Shipment = req.models.shipments;
        var ShippingMethod = req.models.shipping_methods;
        var StateChange = req.models.state_changes;
        var User = req.models.users;

        var ip = req.connection.remoteAddress;
        var user = JSON.parse(req.cookies.user);
        var body = req.body; //order
        log.debug(body);
        User.one({email: user.email}, function(err, user) {
            if (err || user == null) {
                log.err('Login required!');
                return next(new Error('Login required!'));
            }
            Order.one({user_id: user.id, completed_at: null}, function (err, order) {
                if (err || order == null) return next(err);

                req.db.driver.execQuery('DELETE FROM addresses WHERE id IN (?,?);',[order.bill_address_id,order.ship_address_id],function(err){

                    Address.create(body.bill_address, function (err, billAddr) {
                        order.setBill_address(billAddr, function(err){});
                    });

                    Address.create(body.ship_address, function (err, shipAddr) {
                        order.setShip_address(shipAddr, function(err){});
                    });

                    ShippingMethod.find({deleted_at: null}).order('position').order('id').limit(1).run(function(err, data){
                        Shipment.create({number: Shipment.makeNumber(), cost: data[0].amount, order_id: order.id, shipping_method_id: data[0].id}, function(err, shipment){
                            order.shipment_total = shipment.cost;
                            order.total = order.item_total + order.shipment_total;
                        });
                    });

                    order.state = 'address';
                    order.save(function (err, order1) {
                        if(err) return next(err);
                        log.debug('>>order saved')
                        StateChange.one({order_id: order1.id, previous_state: 'address'}, function (err, change) {
                            if (err || change == null) {
                                StateChange.create({
                                    created_at: new Date(),
                                    name: 'order',
                                    next_state: 'delivery',
                                    previous_state: 'address',
                                    order_id: order1.id,
                                    user_id: user.id

                                }, function (err, change1) {
                                    res.json(order1);
                                });
                            } else {

                                change.created_at = new Date();
                                change.next_state = 'delivery';
                                change.previous_state = 'address';
                                change.save(function (err, change2) {

                                    res.json(order1);
                                });
                            }
                        });
                    });

                });
            });
        });
    },

    saveShipment: function(req, res, next){
        var Shipment = req.models.shipments;
        var ShippingMethod = req.models.shipping_methods;
        var Order = req.models.orders;
        var StateChange = req.models.state_changes;
        var User = req.models.users;
        var user = JSON.parse(req.cookies.user);

        //log.debug(user);
        //log.debug(req.body);
        var shipment = req.body;


        User.one({email: user.email}, function(err, user) {
            if (err || user == null) {
                log.err('Login required!');
                return next(new Error('Login required!'));
            }
            Shipment.one({order_id: shipment.order_id}, function (err, ship) {
                if (err || ship == null) return next(err);
                //log.debug(JSON.stringify(ship));

                ShippingMethod.get(shipment.shipping_method.id, function(err, shippingMethod){
                    if (err || shippingMethod == null) return next(err);
                    //log.debug('>>shippingMethod:'+ JSON.stringify(shippingMethod));

                    ship.setShipping_method(shippingMethod, function(err){
                        ship.cost = shippingMethod.amount;

                        ship.save(function (err, data) {
                            //log.info('>>shipment:'+ JSON.stringify(data));

                            Order.get(data.order_id, function (err, order) {

                                order.shipment_total = data.cost;
                                order.total = order.item_total + data.cost;
                                order.state = 'payment';
                                order.save(function (err, order1) {
                                    StateChange.one({order_id: order1.id, previous_state: 'delivery'}, function (err, change) {
                                        if (err || change == null) {
                                            StateChange.create({
                                                created_at: new Date(),
                                                name: 'order',
                                                next_state: 'payment',
                                                previous_state: 'delivery',
                                                order_id: order1.id,
                                                user_id: user.id

                                            }, function (err, change1) {
                                                res.json(order1);
                                            });
                                        } else {

                                            change.created_at = new Date();
                                            change.next_state = 'payment';
                                            change.previous_state = 'delivery';
                                            change.save(function (err, change2) {

                                                res.json(order1);
                                            });
                                        }
                                    });
                                });
                            });
                        });
                    });

                });

            });
        });
    },

    savePayment: function(req, res, next) {
        var Order = req.models.orders;
        var Payment = req.models.payments;
        var StateChange = req.models.state_changes;
        var User = req.models.users;

        var ip = req.connection.remoteAddress;
        var user = JSON.parse(req.cookies.user);
        var body = req.body; //payment
        log.debug(body);
        User.one({email: user.email}, function(err, user) {
            if (err || user == null) {
                log.err('Login required!');
                return next(new Error('Login required!'));
            }
            Order.one({user_id: user.id, completed_at: null}, function (err, order) {
                if (err || order == null) return next(err);

                Payment.one({order_id: order.id}, function(err, payment){
                    if(err || payment == null){
                        Payment.create({
                            amount: order.total,
                            order_id: order.id,
                            payment_method_id: body.payment_method.id,
                            uncaptured_amount: order.total
                        }, function(err){});
                    } else {
                        payment.save({
                            amount: order.total,
                            order_id: order.id,
                            payment_method_id: body.payment_method.id,
                            uncaptured_amount: order.total
                        }, function(err){});
                    }
                });

                order.state = 'complete';
                order.completed_at = new Date();
                order.save(function(err, order){
                    if(err) return next(err);

                    //log.debug(JSON.stringify(order))
                    StateChange.create({
                        created_at: new Date(),
                        name: 'order',
                        next_state: 'complete',
                        previous_state: 'payment',
                        order_id: order.id,
                        user_id: user.id

                    }, function (err) {

                    });
                    StateChange.create({
                        created_at: new Date(),
                        name: 'payment',
                        next_state: 'balance_due',
                        previous_state: null,
                        order_id: order.id,
                        user_id: user.id

                    }, function (err) {

                    });
                    StateChange.create({
                        created_at: new Date(),
                        name: 'shipment',
                        next_state: 'pending',
                        previous_state: null,
                        order_id: order.id,
                        user_id: user.id

                    }, function (err) {

                    });

                    order.payment_state = 'balance_due';
                    order.shipment_state = 'pending';
                    order.save(function(err){ });
                    //TODO: Mail delivery
                    getOrderItems(order.id, req, res,function(err, data){
                        if(err) return next(err);
                        //log.debug('>>getOrderItems:'+ JSON.stringify(data));
                        sendConfirmationMail(data, req.transport);
                        //log.debug(JSON.stringify(order))
                        order.confirmation_delivered = true;
                        order.save(function(err){
                            res.json(order);
                        });

                    });
                });


            });
        });
    },

    getOrder: function(req, res, next){
        var Order = req.models.orders;
        var User = req.models.users;

        var user = JSON.parse(req.cookies.user);

        User.one({email: user.email}, function(err, user) {
            if (err || user == null) {
                log.err('Login required!');
                return next(new Error('Login required!'));
            }
            Order.one({user_id: user.id, completed_at: null}, function (err, order) {
                if (err) return next(err);
                res.json(order);
            });
        });
    },

    getPaymentMethods: function(req, res, next){
        var PaymentMethod = req.models.payment_methods;
        PaymentMethod.find({deleted_at: null, active: true}).run(function(err, methods){
            res.json(methods);
        });
    },

    getOrderList: function(req, res, next){
        var Order = req.models.orders;
        var User = req.models.users;

        var user = JSON.parse(req.cookies.user);

        var perPages = 10;
        var page = parseInt(req.params['page']) || 1;
        if( isNaN(page) || page < 1) page = 1;
        console.log('>> page:'+ page);

        User.one({email: user.email}, function(err, user) {
            if (err || user == null) {
                log.err('Login required!');
                return next(new Error('Login required!'));
            }
            Order.find({user_id: user.id}).where('completed_at IS NOT NULL').order('-completed_at')
                .limit(perPages).offset((page - 1) * perPages).run(function (err, orders) {
                if (err) return next(err);
                req.db.driver.execQuery('SELECT count(*) AS cnt FROM orders WHERE completed_at IS NOT NULL AND user_id = ?',[user.id],
                    function(err, row){
                    console.log(JSON.stringify(row));
                    res.json({
                        orders: orders,
                        count: row[0].cnt
                    });

                });
            });
        });
    },

    getOrderById: function(req, res, next){
        var Order = req.models.orders;
        var User = req.models.users;
        var Shipment = req.models.shipments;
        var Payment = req.models.payments;

        var user = JSON.parse(req.cookies.user);
        var order_id = req.params.id;

        User.one({email: user.email}, function(err, user) {
            if (err || user == null) {
                log.err('Login required!');
                return next(new Error('Login required!'));
            }

            Order.get(order_id, function (err, order) {
                if (err || order == null) return next(err);

                var sql = 'SELECT DISTINCT li.*, sv1.options, a3.attachment_file_path FROM \n'+
                    ' (SELECT l.*, p.id AS product_id, p.name, p.shipment_cost FROM line_items l,variants v, products p \n'+
                    ' WHERE l.variant_id = v.id AND v.product_id = p.id AND l.order_id = ? \n'+
                    ' ) li \n'+
                    ' INNER JOIN \n'+
                    ' (SELECT sv.id, sv.product_id, GROUP_CONCAT(sv.options) AS options \n'+
                    ' FROM (SELECT v.id, v.product_id, concat(t.presentation,":", o.presentation) AS options \n'+
                    ' FROM variants v, variants_option_values vo, option_values o, option_types t \n'+
                    ' WHERE v.id = vo.variants_id and vo.option_values_id = o.id and o.option_type_id = t.id) sv \n'+
                    ' GROUP BY sv.id) sv1 \n'+
                    ' ON li.variant_id = sv1.id \n'+
                    ' INNER JOIN \n'+
                    ' (SELECT a2.*, p.id AS product_id FROM \n'+
                    ' (SELECT a1.* FROM \n'+
                    ' (SELECT a.variant_id, min(a.id) as min_id \n'+
                    ' FROM assets a, variants v WHERE a.variant_id = v.id \n'+
                    ' GROUP BY v.product_id \n'+
                    ' ) a \n'+
                    ' INNER JOIN assets a1 ON a1.variant_id = a.variant_id AND a1.id = a.min_id \n'+
                    ' ) a2 \n'+
                    ' INNER JOIN variants v \n'+
                    ' ON v.id = a2.variant_id \n'+
                    ' INNER JOIN products p \n'+
                    ' ON p.id = v.product_id \n'+
                    ' ) a3 \n'+
                    ' ON a3.product_id = sv1.product_id;';


                log.debug(JSON.stringify(order));
                req.db.driver.execQuery(sql, [order.id], function(err, lineItems){
                    order.line_items = lineItems;
                    Shipment.one({order_id: order.id}, function(err, ship){
                        //log.debug('>>shipment:'+ JSON.stringify(ship));
                        ship.getShipping_method(function(err, data){
                            order.shipping_method = data;
                            Payment.one({order_id: order.id}, function(err, pay){
                                //log.debug('>>payment:'+ JSON.stringify(pay));
                                pay.getPayment_method(function(err, data){
                                    order.payment_method = data;

                                    res.json(order);
                                });
                            });
                        });
                    });

                })
            });
        });
    },


};