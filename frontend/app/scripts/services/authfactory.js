'use strict';

var services = angular.module('frontendApp');
services.factory('AuthFactory', ['$location', '$rootScope','$cookieStore','SessionFactory', 'UserFactory',
                             'MailFactory',
        function($location, $rootScope, $cookieStore, SessionFactory, UserFactory, MailFactory) {
            $rootScope.currentUser = $cookieStore.get('user') || null;
            //$cookieStore.remove('user');

            return {

                login: function(provider, user, callback) {
                    var cb = callback || angular.noop;
                    SessionFactory.save({
                        provider: provider,
                        email: user.email,
                        password: user.password,
                        rememberMe: user.rememberMe
                    }, function(user) {
                        //console.log( user);
                        $rootScope.currentUser= user;
                        $cookieStore.put('user', user);
                        return cb();
                    }, function(err) {
                        return cb(err.data);
                    });
                },

                logout: function(callback) {
                    var cb = callback || angular.noop;
                    SessionFactory.delete(function(res) {
                            $rootScope.currentUser = null;
                            $cookieStore.remove('user');
                            return cb();
                        },
                        function(err) {
                            //console.log(err);
                            return cb(err.data);
                        });
                },

                createUser: function(userinfo, callback) {
                    var cb = callback || angular.noop;
                    UserFactory.save(userinfo,
                        function(user) {
                            $rootScope.currentUser = user;
                            $cookieStore.put('user', user);
                            return cb();
                        },
                        function(err) {
                            console.log('>> authfactory createUser err: ');
                            console.log(err);
                            return cb(err.data);
                        });
                },

                currentUser: function() {
                    console.log('>>authfactory currentUser:');

                    SessionFactory.get(function(user) {
                        console.log(user);
                        $rootScope.currentUser = user;
                        $cookieStore.put('user', user);
                    });
                },

                changePassword: function(email, oldPassword, newPassword, retypePassword, callback) {
                    var cb = callback || angular.noop;
                    UserFactory.update({
                        email: email,
                        password: oldPassword,
                        new_password: newPassword,
                        retype_password: retypePassword
                    }, function(user) {
                        console.log('password changed');
                        console.log('>> user: ' + user);
                        return cb();
                    }, function(err) {
                        //console.log('>> authfactory changePassword: ');
                        //console.log(err);
                        return cb(err.data);
                    });
                },

                removeUser: function(email, password, callback) {
                    var cb = callback || angular.noop;
                    UserFactory.delete({
                        email: email,
                        password: password
                    }, function(user) {
                        console.log(user + 'removed');
                        return cb();
                    }, function(err) {
                        return cb(err.data);
                    });
                },

                passwordToken: function(email, callback) {
                  MailFactory.get({email: email}, 
                    function(user){
                	  	console.log('>> passwordToken user:');
                	  	console.log(user);
                      return callback(null, user);
                  }, function(err){
                	  console.log('>> passwordToken error:');
                    return callback(err.data);
                  });
                },

                mailResetPassword: function(email, message, callback) {
                    var cb = callback || angular.noop;
                    MailFactory.save({
                        email: email,
                        message: message
                    }, function(mail) {
                    		console.log('>> authfactory mailPassword success: ');
                    		console.log(mail);
                        return cb();
                    }, function(err) {
                        console.log('>> authfactory mailPassword err: ');
                        console.log(err);
                        return cb(err.data);
                    });
                },
                
                resetPasswordByToken: function(email, resetPasswordToken, password, retypePassword, callback){
                	var cb = callback || angular.noop;
                	MailFactory.update({
                        email: email,
                		reset_password_token: resetPasswordToken,
                		password: password,
                		retype_password: retypePassword
                	}, function(user){
                		console.log(user);
                		return cb();
                	}, function(err){
                		console.log(err);
                		return cb(err.data);
                	});
                }
            };
        }
    ]);
