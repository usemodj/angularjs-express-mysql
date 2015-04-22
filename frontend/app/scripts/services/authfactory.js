'use strict';

var services = angular.module('frontendApp');
services.factory('AuthFactory', ['$cookies','$location', '$rootScope','$cookieStore','SessionFactory', 'UserFactory',
                             'MailFactory',
        function($cookies, $location, $rootScope, $cookieStore, SessionFactory, UserFactory, MailFactory) {
            var accessLevels = routingConfig.accessLevels,
                userRoles = routingConfig.userRoles,
                currentUser = $cookieStore.get('user') || {email:'', role: userRoles.public};

            //$cookieStore.remove('user');

            function changeUser(user){
                angular.extend(currentUser, user);
            }

            return {
                accessLevels: accessLevels,
                userRoles: userRoles,
                user: currentUser,

                authorize: function(accessLevel, role){
                    if(role === undefined){
                        role = currentUser.role;
                    }
                    if(typeof accessLevel === 'string'){
                      accessLevel = accessLevels[accessLevel];
                      //console.log(accessLevel)
                    }
                    $rootScope.currentUser = currentUser;
                    //console.log('>> accessLevel.bit_mask: '+accessLevel.bit_mask + ' & role.bit_mask: '+role.bit_mask + '='+ (accessLevel.bit_mask & role.bit_mask));
                    return accessLevel.bit_mask & role.bit_mask;
                },

                isLoggedIn: function(user){
                    if(user === undefined){
                        user = currentUser;
                    }
                    return user.role.title === userRoles.user.title || user.role.title === userRoles.admin.title;
                },

                login: function(provider, userinfo, callback) {
                    console.log('>> auth login');
                    var cb = callback || angular.noop;
                    SessionFactory.save({
                        provider: provider,
                        email: userinfo.email,
                        password: userinfo.password,
                        rememberMe: userinfo.rememberMe
                    }, function(user) {
                        //console.log('>> authfactory login user:'+JSON.stringify(user));
                        $rootScope.currentUser= user;
                        $cookieStore.put('user', user);
                        changeUser(user);
                        return cb();
                    }, function(err) {
                        console.log('>>authfactory login error:'+ JSON.stringify(err));
                        return cb(err.data);
                    });
                },

                logout: function(callback) {
                    console.log("$cookieStore.get('user'): "); console.log( $cookieStore.get('user'));

                    var cb = callback || angular.noop;
                    SessionFactory.remove( function(res) {
                            console.log(res);
                            $rootScope.currentUser = null;
                            $cookieStore.remove('user');
                            changeUser({
                                email:'',
                                role: userRoles.public
                            });
                            return cb();
                        },
                        function(err) {
                            console.log(err);
                            return cb(err.data);
                        });
                },

                createUser: function(userinfo, callback) {
                    var cb = callback || angular.noop;
                    UserFactory.save(userinfo,
                        function(user) {
                            //$rootScope.currentUser = user;
                            //$cookieStore.put('user', user);
                            //changeUser(user);
                            return cb(null);
                        },
                        function(err) {
                            //console.log('>> authfactory createUser err: ');
                            //console.log(err);
                            return cb(err.data);
                        });
                },

                changeRole: function(user, callback) {
                    var cb = callback || angular.noop;
                    UserFactory.update({
                        id: user.id,
                        email: user.email,
                        role_id: user.role_id,
                        active: user.active
                    }, function(user) {
                        console.log('updateUserRole changed');
                        console.log('>> user: ' + user);
                        changeUser(user);
                        return cb(null);

                    }, function(err) {
                        console.log('>> updateUserRole error: ');
                        console.log(err);
                        return cb(err.data);
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
                        console.log('>> authfactory changePassword: ');
                        console.log(err);
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
