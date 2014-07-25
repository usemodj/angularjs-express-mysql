var passport = require('passport');

module.exports = function(app) {
    app.get('/auth/session', ensureAuthenticated,
        function(req, res) {
            console.log('>> routes session user:');
            console.log(JSON.stringify(req.user));
            res.json(req.user.serialize());
        });

    //login post
    app.post('/auth/session',
        function(req, res, next) {
            console.log('>> login post...');
            passport.authenticate('local', function(err, user, info) {
                var error = err || info;
                if (error) return res.json(400, error);
                // Update login info
                console.log(JSON.stringify(user));
                //console.log('>> req.ip: ' + req.ip);
                user.save({
                    current_sign_in_ip: req.ip,
                    current_sign_in_at: new Date(),
                    last_sign_in_ip: user.current_sign_in_ip,
                    last_sign_in_at: user.current_sign_in_at
                }, function(err) {
                    console.log(err);
                    if (err) return next(err);
                });

                req.logIn(user, function(err) {
                    if (err) return next(err);
                    if (req.body.rememberMe) req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 7;
                    //console.log(req.user.serialize());
                    res.json(200, req.user.serialize());
                });
            })(req, res, next);
        });


    app.del('/auth/session', function(req, res) {
        //console.log(req);
        if (req.user) {
            req.logout();
            res.send(200);
        } else {
            res.send(400, 'Not logged in');
        }
    });

    function ensureAuthenticated(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        res.send(401);
    }
}
