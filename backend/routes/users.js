module.exports = function(app) {

    app.get('/users', function(req, res, next) {
        req.models.users.find().all(function(err, users) {
            if (err)
                return next(err);
            console.log('>>get users:');
            console.log(JSON.stringify(users));
            res.json(users);
        });
    });

    // app.get('/users', function(req, res) {
    // req.db.driver.execQuery('SELECT * FROM users', function(err, users) {
    // console.log(users);
    // res.json(users);
    // });
    // });

    // get '/users/:id?color=red' --> req.params.id, req.query.color
    app.get('/users/:id', function(req, res, next) {
        req.models.users.get(req.params.id, function(err, user) {
            if (err)
                return next(err);
            console.log('>>get /users/' + req.params.id);
            console.log(JSON.stringify(user));
            res.json(user);
        });
    });
    // post signup
    app.post('/users', function(req, res, next) {
        var User = req.models.users;
        var email = req.body.email;
        var password = req.body.password;
        var retype_password = req.body.retype_password;
        console.log(req.body);
        console.log('>> retype_password: ' + retype_password);
        console.log('>> password: ' + password);
        // if(password !== retype_password)
        // 	return res.json(400, [{msg: 'Passwords are a mismatch.', property: 'password'}]);

        User.create({
            email: email,
            encrypted_password: password,
            password_salt: '',
            current_sign_in_ip: req.ip,
            current_sign_in_at: new Date()
        }, function(err, user) {
            if (err) {
                console.log('>> User.create err: ');
                console.log(err);
                return res.json(400, err);
            }
            // Password insert
            var password_salt = user.makeSalt();
            var encrypted_password = user.encryptPassword2(password, password_salt);
            user.save({
                password_salt: password_salt,
                encrypted_password: encrypted_password
            }, function(err) {
                if (err) {
                    user.remove(function(err) {
                        console.log("removed!");
                    });
                    return res.json(400, err);
                }
            });

            req.logIn(user, function(err) {
                if (err)
                    return next(err);
                return res.json(user.serialize());
            });
        });
    });

	//Update Password 
    app.put('/users', ensureAuthenticated,
        function(req, res, next) {
            if (!req.user) return res.json(400, 'Login is required.');
            var password = req.body.password;
            var new_password = req.body.new_password;
            var retype_password = req.body.retype_password;
            var email = req.body.email;

            console.log(req.body);
            req.models.users.findOne({
                email: email,
                password: password
            }, function(err, user) {
                if (err) {
                    //console.log('>> users findOne err:');
                    console.log(err);
                    return res.json(400, err);
                }
                //console.log('>>/users put');
                //console.log(JSON.stringify(user));
                user.save({
                    //email: email,
                    encrypted_password: user.encryptPassword(new_password)
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
        });

    function ensureAuthenticated(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        res.send(401);
    }

};
