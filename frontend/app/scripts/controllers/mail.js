'use strict';
var resetPasswordUrl = 'http://localhost:3000/#/resetPassword';
var resetPasswordFrom = 'NodeSoft.co.kr <postmaster@nodesoft.co.kr>';
angular
    .module('frontendApp')
    .controller(
    'MailCtrl',
    [
        '$scope', '$stateParams',
        'AuthFactory',
        function ($scope, $stateParams, AuthFactory) {

            $scope.mailPassword = function (form) {

                var email = $scope.user.email;
                var htmlContent = '<p>패스워드를 재설정하기 위해 아래의 주소를 클릭하세요.</p><br/>';
                var message = {
                    // sender info
                    from: resetPasswordFrom,
                    // Comma separated list of recipients
                    // to: '"Receiver Name"
                    // <nodemailer@disposebox.com>',
                    // Subject of the message
                    subject: '패스워드 재설정을 진행하는 메일 ✔', //
                    headers: {
                        'X-Laziness-level': 1000
                    }
                    // HTML body
                    //, html: '<p><b>Hello</b> to myself <img src="cid:note@node"/></p>'
                    //    + '<p>Here\'s a nyan cat for you as an embedded attachment:<br/><img src="cid:nyan@node"/></p>',
                };

                AuthFactory
                    .passwordToken(
                    email,
                    function (errors, user) {
                        $scope.errors = {};
                        $scope.success = {};
                        if (errors) {
                            console.log(errors);
                            angular
                                .forEach(
                                errors,
                                function (error) {
                                    var msg = error.msg;
                                    var field = error.property;
                                    form[field]
                                        .$setValidity(
                                        'server',
                                        false);
                                    $scope.errors[field] = msg;
                                });
                        } else {
                            //console.log(user);
                            htmlContent += '<a href="'
                                + resetPasswordUrl
                                + '/'
                                + encodeURIComponent(user.reset_password_token)
                                + '">'
                                + resetPasswordUrl
                                + '/'
                                + encodeURIComponent(user.reset_password_token)
                                + '</a>';

                            message.to = email;
                            message.html = htmlContent;

                            AuthFactory
                                .mailResetPassword(
                                email,
                                message,
                                function (errors) {
                                    if (!errors) {
                                        form['email']
                                            .$setValidity(
                                            'server',
                                            true);
                                        $scope.success['email'] = 'Mail Sent for resetting Password to '+ email;
                                        // $location.path('/');
                                    } else {
                                        // console.log(errors);
                                        angular
                                            .forEach(
                                            errors,
                                            function (error) {
                                                var msg = error.msg;
                                                var field = error.property;
                                                form[field]
                                                    .$setValidity(
                                                    'server',
                                                    false);
                                                $scope.errors[field] = msg;
                                            });
                                    }
                                });
                        }
                    });

            };

            $scope.resetPassword = function (form) {
                //console.log('>> passwordToken: ' + $stateParams.passwordToken);
                AuthFactory
                    .resetPasswordByToken(
                    $scope.user.email,
                    $stateParams.passwordToken,
                    $scope.user.password,
                    $scope.user.retype_password,
                    function (errors) {
                        $scope.errors = {};
                        $scope.success = {};

                        if (!errors) {
                            $scope.success['password'] = 'Password resetted successfully.';
                        } else {
                            angular
                                .forEach(
                                errors,
                                function (error) {
                                    var msg = error.msg;
                                    var field = error.property;
                                    if (field === 'encrypted_password')
                                        field = 'new_password';
                                    form[field]
                                        .$setValidity(
                                        'server',
                                        false);
                                    $scope.errors[field] = msg;
                                });
                        }
                    });
            };

        } ]);
