module.exports = {
    //get reset_password_token
    //app.get('/auth/mail',
    reset_password_token: function (req, res, next) {
        //console.log(req.body);
        //console.log(req.query);
        var email = req.query.email;
        req.models.users.one({email: email}, function (err, user) {
            if (err) {
                //console.log('>> get /auth/mail error:');
                console.log(err);
                return next(err);
            }
            //console.log('>> get /auth/email user:');
            console.log(user);
            if (!user) {
                var errors = [
                    {
                        property: 'email',
                        msg: 'Email does not found!'
                    }
                ];

                return res.json(400, errors);
            }
            user.save({
                //email: email,
                reset_password_token: user.encryptPassword(user.makeSalt())
            }, function (err, user) {
                if (!err) {
                    //console.log('Reset password token!');
                    return res.json(200, user);
                } else {
                    console.log(err);
                    return res.json(400, err);
                }
            });
        });
    },

    //mail password
    //app.post('/auth/mail',
    mail_password: function (req, res, next) {
        var transport = req.transport;
        //console.log(req.body);
        var message = {};
        //message.to = req.body.email;
        message = req.body.message;
        transport.sendMail(message, function (error) {
            if (error) {
                console.log('Error occured');
                console.log(error);
                return next(error);
            }
            console.log('Message sent successfully!');

            // if you don't want to use this transport object anymore, uncomment following line
            //transport.close(); // close the connection pool
            return res.json(200, 'Message sent successfully!');
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
                console.log(err);
                return res.json(400, err);
            }
            console.log('>>/users put');
            console.log(JSON.stringify(user));
            user.save({
                encrypted_password: user.encryptPassword( password),
                reset_password_token: user.encryptPassword(user.makeSalt())
            }, function(err) {
                if (!err) {
                    console.log('Password is updated!');
                    return res.json(200, 'Password is updated!');
                } else {
                    console.log(err);
                    return res.json(400, err);
                }
            });
        });

    }

}
