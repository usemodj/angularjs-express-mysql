'use strict';

var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy;


module.exports = function(db) {

    var User = db.models.users;

    // Serialize sessions
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.get(id, function(err, user) {
            done(err, user);
        });
    });

    // Use local strategy
    passport.use(new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password'
        },
        function(email, password, done) {
            User.one({
                email: email
            }, function(err, user) {
                if (err) {
                    return done(err);
                }
                if (!user) {
                    return done(null, false, {
                        'errors': {
                            'email': {
                                type: 'Email is not registered.'
                            }
                        }
                    });
                }
                //console.log('>> config pass.js: ');
                console.log('>> user: '); console.log(JSON.stringify(user));
                if (!user.authenticate(password)) {
                    return done(null, false, {
                        'errors': {
                            'password': {
                                type: 'Password is incorrect.'
                            }
                        }
                    });
                }
                return done(null, user);
            });
        }
    ));
};
