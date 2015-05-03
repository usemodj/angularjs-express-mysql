var log = require('log4js').getLogger('auth/mail');

module.exports = {
    //get reset_password_token
    //app.get('/auth/mail',
    reset_password_token: function (req, res, next) {
        var User = req.models.users;
        //console.log(req.body);
        //console.log(req.query);
        var email = req.query.email;
        User.one({email: email}, function (err, user) {
            if (err) {
                //console.log('>> get /auth/mail error:');
                log.error(err);
                return next(err);
            }
            //console.log('>> get /auth/email user:');
            log.debug(user);
            if (!user) {
                var errors = [
                    {
                        property: 'email',
                        msg: 'Email does not found!'
                    }
                ];

                return res.status(500).json( errors);
            }
            user.save({
                //email: email,
                reset_password_token: user.encryptPassword(user.makeSalt())
            }, function (err, user) {
                if (!err) {
                    //console.log('Reset password token!');
                    return res.status(200).json(user);
                } else {
                    log.error(err);
                    return res.status(500).json(err);
                }
            });
        });
    },

    //mail password
    //app.post('/auth/mail',
    mail_password: function (req, res, next) {
        var transport = req.transport;
        log.debug(req.body);
        var message = {};
        //message.to = req.body.email;
        message = req.body.message;
        transport.sendMail(message, function (error) {
            if (error) {
                log.error(error);
                return res.status(500).json(error);
            }
            log.info('Mail sent successfully!');

            // if you don't want to use this transport object anymore, uncomment following line
            //transport.close(); // close the connection pool
            return res.status(200).send('Mail sent successfully!');
        });

    },

    // Reset password
    //app.put('/auth/mail',
    reset_password: function(req, res,  next){
        console.log(req.body);
        var email = req.body.email;
        var reset_password_token = req.body.reset_password_token;
        var password = req.body.password;
        //var retype_password = req.body.password;

        req.models.users.findByPasswordToken({
            email: email,
            reset_password_token: reset_password_token
        }, function(err, user) {
            if (err) {
                //console.log('>> users findOne err:');
                log.error(err);
                return res.json(400, err);
            }
            log.debug('>> user: '+ JSON.stringify(user));
            user.save({
                encrypted_password: user.encryptPassword( password),
                reset_password_token: user.encryptPassword(user.makeSalt())
            }, function(err) {
                if (!err) {
                    log.info('Password is updated!');
                    return res.status(200).json('Password is updated!');
                } else {
                    log.error(err);
                    return res.status(500).json(err);
                }
            });
        });

    }

}
