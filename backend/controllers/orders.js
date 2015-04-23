var log = require('log4js').getLogger("orders");
var _ = require('underscore');
var async = require('async');

var lineItemSql = ' SELECT DISTINCT li.*, v1.options, va.attachment_file_path FROM  \n' +
    '  (SELECT l.*, p.id AS product_id, p.name FROM line_items l,variants v, products p  \n' +
    '   WHERE l.variant_id = v.id AND v.product_id = p.id AND l.order_id = ? \n' +
    '  ) li   \n' +
    '  INNER JOIN   \n' +
    '  (SELECT sv.id, sv.product_id, GROUP_CONCAT(sv.options) AS options   \n' +
    '   FROM (SELECT v.id, v.product_id, concat(t.presentation,":", o.presentation) AS options   \n' +
    ' 		 FROM variants v, variants_option_values vo, option_values o, option_types t   \n' +
    ' 		 WHERE v.id = vo.variants_id and vo.option_values_id = o.id and o.option_type_id = t.id  \n' +
    ' 	   ) sv  GROUP BY sv.id  \n' +
    '  ) v1 ON li.variant_id = v1.id  \n' +
    '  LEFT JOIN  \n' +
    '  (SELECT a1.* FROM   \n' +
    ' 	(SELECT v.product_id, a.* FROM variants v, assets a WHERE v.id = a.viewable_id AND viewable_type = "Variant" ORDER BY a.position, a.id) a1  \n' +
    '   GROUP BY a1.product_id  \n' +
    '  ) va ON va.product_id = v1.product_id;';

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

            req.db.driver.execQuery(lineItemSql, [order.id], function(err, lineItems){
                if(err) return callback(err);
                order.line_items = lineItems;

                return callback(null, order);
            })
        });
    });
};

var sendConfirmationMail = function(order, transport, callback){
    var html = '<ul>';
    _.each(order.line_items, function(item){
        //log.debug('>>line_item:' + JSON.stringify(item));
        html += '<li>'+ item.name + ': '+ item.price + ' x '+ item.quantity+'('+item.options+') </li>'
    });
    html += '<p>Total: '+ order.item_total + ' + ' + order.shipment_total + '(Shipment) = <b>';
    html += (order.item_total + order.shipment_total) +'</b></p>';

    //var transport = req.transport;
    var message = {};
    message.to = order.email;
    message.subject = 'Order Confirmation Mail';
    message.html = html;

    transport.sendMail(message, function (err) {
        if (err) {
            log.error(err.message);
            return callback(err);
        }
        log.info('Confirm Mail sent successfully!');
        //log.debug(message);
        // if you don't want to use this transport object anymore, uncomment following line
        //transport.close(); // close the connection pool
        return callback(null, message);
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
        //log.debug('>>remoteAddress:'+ req.connection.remoteAddress);

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
                        //number: Order.makeNumber(),
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

    //TODO: debuging cart item list and function of button
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

                log.debug(JSON.stringify(order));
                req.db.driver.execQuery(lineItemSql, [order.id], function(err, lineItems){
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
                                res.status(200).json(order1);
                            });

                        } else {
                            change.created_at = new Date();
                            change.next_state = 'address';
                            change.previous_state = 'cart';
                            change.save(function(err){
                                res.status(200).json(order1);
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
                log.error('Login required!');
                return next(new Error('Login required!'));
            }
            Order.one({user_id: user.id, completed_at: null}, function (err, order) {
                if (err || order == null) return next(err);

                req.db.driver.execQuery('DELETE FROM addresses WHERE id IN (?,?);',[order.bill_address_id,order.ship_address_id],function(err){
                    if(err) return next(err);
                    async.waterfall([
                        function (callback) {
                            delete body.bill_address.id;
                            Address.create(body.bill_address, function (err, billAddr) {
                                if(err) return callback(err);
                                order.setBill_address(billAddr, function(err){
                                    if(err) return callback(err);
                                    callback(null, order);
                                });
                            });
                        },
                        function (order, callback) {
                            delete body.ship_address.id;
                            Address.create(body.ship_address, function (err, shipAddr) {
                                if(err) return callback(err);
                                order.setShip_address(shipAddr, function(err){});
                                callback(null, order);
                            });
                        },
                        function (order, callback) {
                            ShippingMethod.find({deleted_at: null}).order('position').order('id').limit(1).run(function(err, data){
                                if(err || !data || data.length == 0) {
                                    var msg = err ? err: 'Shipping Method is empty!';
                                    return callback(msg);
                                }
                                Shipment.one({order_id: order.id}, function(err, shipment){
                                    if(err || !shipment) {
                                        Shipment.create({number: Shipment.makeNumber(), cost: data[0].amount, order_id: order.id, shipping_method_id: data[0].id}, function(err, shipment){
                                            if(err) return callback(err);
                                            order.shipment_total = shipment.cost;
                                            order.total = order.item_total + order.shipment_total;
                                            callback(null, order);
                                        });
                                    } else {
                                        shipment.save({
                                            cost: data[0].amount,
                                            shipping_method_id: data[0].id
                                        }, function(err, shipment){
                                            if(err) return callback(err);
                                            order.shipment_total = shipment.cost;
                                            order.total = order.item_total + order.shipment_total;
                                            callback(null, order);
                                        });
                                    }
                                })
                            });
                        },
                        function (order, callback) {
                            order.state = 'address';
                            order.save(function (err, order1) {
                                if(err) return callback(err);
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
                                            if(err) return callback(err);
                                            callback(null, order1);
                                        });
                                    } else {
                                        change.created_at = new Date();
                                        change.next_state = 'delivery';
                                        change.previous_state = 'address';
                                        change.save(function (err, change2) {
                                            if(err) return callback(err);
                                            callback(null, order1);
                                        });
                                    }
                                });
                            });
                        }
                    ], function (err, results) {
                        if(err) {
                            log.error(err);
                            return res.status(400).json(err);
                        }
                        res.status(200).json(results);
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
            async.waterfall([
                function (callback) {
                    Shipment.one({order_id: shipment.order_id}, function (err, ship) {
                        if (err || ship == null) {
                            var msg = err ? err : 'Shipment is empty!';
                            return callback(msg);
                        }
                        callback(null, ship);
                    });
                },
                function (ship, callback) {
                    ShippingMethod.get(shipment.shipping_method.id, function(err, shippingMethod) {
                        if (err || shippingMethod == null) {
                            var msg = err ? err : 'Shipping Method is empty!';
                            return callback(err);
                        }
                        ship.setShipping_method(shippingMethod, function (err) {
                            if (err) return callback(err);
                            ship.cost = shippingMethod.amount;
                            ship.save(function (err, data) {
                                if (err) return callback(err);
                                callback(null, data);
                            });
                        });
                    });
                },
                function (ship, callback) {
                    //log.debug('>>Shipment: '+ JSON.stringify(ship));
                    Order.get(ship.order_id, function (err, order) {
                        if(err) return callback(err);

                        order.save({
                            shipment_total: ship.cost,
                            total: order.item_total + ship.cost,
                            state: 'payment'
                        }, function (err, data) {
                            if (err) return callback(err);
                            //log.debug('>>Order: '+ JSON.stringify(data));
                            callback(null, data);
                        });
                    });
                },
                function (order, callback) {
                    StateChange.one({order_id: order.id, previous_state: 'delivery'}, function (err, change) {
                        if (err || change == null) {
                            StateChange.create({
                                created_at: new Date(),
                                name: 'order',
                                next_state: 'payment',
                                previous_state: 'delivery',
                                order_id: order.id,
                                user_id: user.id
                            }, function (err) {
                                if(err) return callback(err);
                                callback(null, order);
                            });
                        } else {
                            change.created_at = new Date();
                            change.next_state = 'payment';
                            change.previous_state = 'delivery';
                            change.save(function (err) {
                                if(err) return callback(err);
                                callback(null, order);
                            });
                        }
                    });
                }
            ], function(err, order) {
                if(err) return res.status(400).json(err);
                res.status(200).json( order); //return order
            });
        });
    },

    savePayment: function(req, res, next) {
        var Order = req.models.orders;
        var Payment = req.models.payments;
        var StateChange = req.models.state_changes;
        var User = req.models.users;

        //var ip = req.connection.remoteAddress;
        var user = JSON.parse(req.cookies.user);
        var body = req.body; //payment
        //log.debug(body);
        User.one({email: user.email}, function(err, user) {
            if (err || user == null) {
                log.error('Login required!');
                return next(new Error('Login required!'));
            }
            async.waterfall([
                function(callback) {
                    if(!body.payment_method) return callback('Payment Method is empty!');

                    Order.one({user_id: user.id, completed_at: null}, function (err, order) {
                        if (err || order == null) return callback(err);

                        Payment.one({order_id: order.id}, function (err, payment) {
                            if (err || payment == null) {
                                Payment.create({
                                    amount: order.total,
                                    order_id: order.id,
                                    payment_method_id: body.payment_method.id,
                                    uncaptured_amount: order.total
                                }, function (err) {
                                    if (err) return callback(err);
                                    callback(null, order);
                                });
                            } else {
                                payment.save({
                                    amount: order.total,
                                    order_id: order.id,
                                    payment_method_id: body.payment_method.id,
                                    uncaptured_amount: order.total
                                }, function (err) {
                                    if (err) return callback(err);
                                    callback(null, order);
                                });
                            }
                        });
                    });
                },
                function(order, callback) {
                    order.state = 'confirm';
                    order.save(function(err, order) {
                        if (err) return callback(err);
                        callback(null, order);
                    });
                },
                function(order, callback) {
                    StateChange.create({
                        created_at: new Date(),
                        name: 'order',
                        next_state: 'confirm',
                        previous_state: 'payment',
                        order_id: order.id,
                        user_id: user.id
                    }, function (err) {
                        if(err) return callback(err);
                        callback(null, order);
                    });
                },
                function(order, callback){
                    StateChange.create({
                        created_at: new Date(),
                        name: 'payment',
                        next_state: 'balance_due',
                        previous_state: null,
                        order_id: order.id,
                        user_id: user.id
                    }, function (err) {
                        if(err) return callback(err);
                        callback(null, order);
                    });
                },
                function(order, callback){
                    StateChange.create({
                        created_at: new Date(),
                        name: 'shipment',
                        next_state: 'pending',
                        previous_state: null,
                        order_id: order.id,
                        user_id: user.id
                    }, function (err) {
                        if(err) return callback(err);
                        callback(null, order);
                    });
                },
                function(order, callback){
                    order.payment_state = 'balance_due';
                    order.shipment_state = 'pending';
                    order.save(function(err){
                        if(err) return callback(err);
                        callback(null, order);
                    });
                }
            ], function(err, order){
                if(err) {
                    log.error(err);
                    return res.status(400).json(err);
                }
                res.status(200).json(order);
            });
        });
    },

    confirmOrder: function(req, res, next) {
        var Order = req.models.orders;
        var StateChange = req.models.state_changes;
        var User = req.models.users;

        //var ip = req.connection.remoteAddress;
        var user = JSON.parse(req.cookies.user);
        var body = req.body; //payment
        //log.debug(body);
        User.one({email: user.email}, function(err, user) {
            if (err || user == null) {
                log.err('Login required!');
                return next(new Error('Login required!'));
            }
            async.waterfall([
                function(callback) {
                    Order.one({user_id: user.id, state: 'confirm', completed_at: null}, function (err, order) {
                        if (err || order == null) {
                            var msg = err ? err: 'There is no user confirm order!'
                            return callback(msg);
                        }
                        order.number = Order.makeNumber();
                        order.state = 'complete';
                        order.completed_at = new Date();
                        order.save(function (err, order) {
                            if (err) return callback(err);
                            callback(null, order);
                        });
                    });
                },
                function(order, callback) {
                    StateChange.create({
                        created_at: new Date(),
                        name: 'order',
                        next_state: 'complete',
                        previous_state: 'confirm',
                        order_id: order.id,
                        user_id: user.id
                    }, function (err) {
                        if(err) return callback(err);
                        callback(null, order);
                    });
                },
                function(order, callback){
                    //TODO: Mail delivery
                    getOrderItems(order.id, req, res,function(err, data){
                        if(err) return callback(err);
                        //log.debug('>>getOrderItems:'+ JSON.stringify(data));
                        sendConfirmationMail(data, req.transport, function(err, message){
                            if(err) {
                                order.confirmation_delivered = false;
                                log.error(">> FAIL : sending confirmation mail!!");
                                log.error(err);
                            }else {
                                order.confirmation_delivered = true;
                            }
                            callback(null, order);
                        });
                    });
                },
            ], function(err, order){
                if(err) {
                    log.error(err);
                    return res.status(400).json(err);
                }
                order.save(function(err){
                    //res.status(200).json('Confirm Order successfully!');
                    module.exports.getOrderById(req, res, next);
                });
            });
        });
    },

    // order of completed_at is null
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
                res.status(200).json(order);
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

    // if the order is not yours, return 403 error
    getUserOrderById: function(req, res, next){
        var Order = req.models.orders;
        var User = req.models.users;
        var Shipment = req.models.shipments;
        var Payment = req.models.payments;

        var user = JSON.parse(req.cookies.user);
        var order_id = req.params.id || req.body.id;

        User.one({email: user.email}, function(err, user) {
            if (err || user == null) {
                log.err('Login required!');
                return next(new Error('Login required!'));
            }

            Order.get(order_id, function (err, order) {
                if (err || order == null) return next(err);
                if(order.user_id !== user.id) return res.status(403).send('This order is not yours!');

                //log.debug(JSON.stringify(order));
                req.db.driver.execQuery(lineItemSql, [order.id], function(err, lineItems){
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

    getOrderById: function(req, res, next){
        var Order = req.models.orders;
        var User = req.models.users;
        var Shipment = req.models.shipments;
        var Payment = req.models.payments;

        var user = JSON.parse(req.cookies.user);
        var order_id = req.params.id || req.body.id;

        User.one({email: user.email}, function(err, user) {
            if (err || user == null) {
                log.err('Login required!');
                return next(new Error('Login required!'));
            }

            Order.get(order_id, function (err, order) {
                if (err || order == null) return next(err);
                //if(order.user_id !== user.id) return res.status(403).send('This order is not yours!');

                //log.debug(JSON.stringify(order));
                req.db.driver.execQuery(lineItemSql, [order.id], function(err, lineItems){
                    if(err) return next(err);
                    order.line_items = lineItems;
                    async.waterfall([
                        function(callback){
                            Shipment.one({order_id: order.id}, function(err, ship){
                                if(err || !ship) return callback(null, order);
                                //log.debug('>>shipment:'+ JSON.stringify(ship));
                                ship.getShipping_method(function(err, data){
                                    order.shipping_method = data;
                                    return callback(null, order);
                                });
                            });
                        },
                        function(order, callback){
                            Payment.one({order_id: order.id}, function(err, pay){
                                if(err || !pay) return callback(null, order);
                                //log.debug('>>payment:'+ JSON.stringify(pay));
                                pay.getPayment_method(function(err, data){
                                    order.payment_method = data;
                                    return callback(null, order);
                                });
                            });
                        }
                    ], function(err, results){
                        return res.status(200).json(results);

                    });

                })
            });
        });
    },

    setPaid: function(req, res, next){
        var Order = req.models.orders;
        var User = req.models.users;
        var StateChange = req.models.state_changes;

        var userData = JSON.parse(req.cookies.user);
        var orderId = req.params.id || req.body.id;

        User.one({email: userData.email}, function(err, user) {
            if (err || user == null) {
                log.err('Login required!');
                return next(new Error('Login required!'));
            }

            Order.get(orderId, function (err, order) {
                if (err || order == null) return next(err);
                order.payment_state = "paid";
                order.shipment_state = "ready";
                order.save(function(err){
                    if(err) return next(err);
                    StateChange.create([{
                        name: 'payment',
                        previous_state: 'balance_due',
                        next_state: order.payment_state,
                        order_id: order.id,
                        user_id: user.id
                    },{
                        name: 'shipment',
                        previous_state: 'pending',
                        next_state: order.shipment_state,
                        order_id: order.id,
                        user_id: user.id
                    }], function(err){
                        if(err) log.error(err);
                        return res.status(200).json(order);
                    });
                });
            });
        });
    },

    setShipped: function(req, res, next){
        var Order = req.models.orders;
        var User = req.models.users;
        var StateChange = req.models.state_changes;

        var userData = JSON.parse(req.cookies.user);
        var orderId = req.params.id || req.body.id;

        User.one({email: userData.email}, function(err, user) {
            if (err || user == null) {
                log.err('Login required!');
                return next(new Error('Login required!'));
            }

            Order.get(orderId, function (err, order) {
                if (err || order == null) return next(err);
                if(order.shipment_state !== 'ready') return res.status(500).send('Shipment state must be "ready"!');

                order.shipment_state = "shipped";
                order.save(function(err){
                    if(err) return next(err);
                    StateChange.create({
                        name: 'shipment',
                        previous_state: 'ready',
                        next_state: order.shipment_state,
                        order_id: order.id,
                        user_id: user.id
                    }, function(err){
                        if(err) log.error(err);
                        return res.status(200).json(order);
                    });
                });
            });
        });
    },

    setOrderState: function(req, res, next){
        var Order = req.models.orders;
        var User = req.models.users;
        var StateChange = req.models.state_changes;

        var userData = JSON.parse(req.cookies.user);
        var orderId = req.params.id || req.body.id;
        var orderState = req.body.state;

        User.one({email: userData.email}, function(err, user) {
            if (err || user == null) {
                log.err('Login required!');
                return next(new Error('Login required!'));
            }

            Order.get(orderId, function (err, order) {
                if (err || order == null) return next(err);
                var previousState = order.state;

                order.state = orderState;
                order.save(function(err){
                    if(err) return next(err);
                    StateChange.create({
                        name: 'order',
                        previous_state: previousState,
                        next_state: order.state,
                        order_id: order.id,
                        user_id: user.id
                    }, function(err){
                        if(err) log.error(err);
                        return res.status(200).json(order);
                    });
                });
            });
        });
    },

    getStateChanges: function(req, res, next){
        var Order = req.models.orders;
        var User = req.models.users;
        var StateChange = req.models.state_changes;

        var userData = JSON.parse(req.cookies.user);
        var orderId = req.params.id || req.body.id;

        User.one({email: userData.email}, function(err, user) {
            if (err || user == null) {
                log.err('Login required!');
                return next(new Error('Login required!'));
            }

            Order.get(orderId, function (err, order) {
                if (err || order == null) return next(err);
                var previousState = order.state;

                StateChange.find({order_id: order.id}).order('-created_at').run(function(err, changes){
                    if(!err) order.stateChanges = changes;
                    async.each(order.stateChanges, function(change, callback){
                        User.get(change.user_id, function(err, user){
                            if(!err) change.user = user;
                            callback();
                        })
                    }, function(err){
                        return res.status(200).json(order);
                    });
                });
            });
        });
    }

};