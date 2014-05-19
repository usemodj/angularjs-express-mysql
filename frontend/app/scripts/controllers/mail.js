'use strict';

angular.module('frontendApp').controller('MailCtrl',
		[ '$scope', 'AuthFactory', function($scope, AuthFactory) {
			$scope.mailPassword = function() {
				console.log('>>MailCtrl');
				var email = $scope.user.email;
				var htmlContent = '';
				var message = {
				    // sender info
				    from: 'NodeStoreJS.com <nodesoft.blog@gmail.com>',
				    // Comma separated list of recipients
				    //to: '"Receiver Name" <nodemailer@disposebox.com>',
				    // Subject of the message
				    subject: 'Nodemailer is unicode friendly ✔', //
				    headers: {
				        'X-Laziness-level': 1000
				    },
				    // HTML body
				    html:'<p><b>Hello</b> to myself <img src="cid:note@node"/></p>'+
				         '<p>Here\'s a nyan cat for you as an embedded attachment:<br/><img src="cid:nyan@node"/></p>',
				};
				
				message.to = email;
				message.html = htmlContent;
				
				AuthFactory.mailPassword(email, message, function(errors) {
					$scope.errors = {};

					if (!errors) {
						form['email'].$setValidity('server', true);
						$scope.success['email'] = 'Sent Mail for Password';
						// $location.path('/');
					} else {
						// console.log(errors);
						angular.forEach(errors, function(error) {
							var msg = error.msg;
							var field = error.property;
							if (field === 'encrypted_password')
								field = 'password';
							console.log('>> field: ' + field);
							console.log('>> msg: ' + msg);
							console.log(form[field]);
							form[field].$setValidity('server', false);
							$scope.errors[field] = msg;
						});
					}
				});
			};

		}]);
