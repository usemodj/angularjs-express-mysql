'use strict';

var services = angular.module('frontendApp');
services.factory('MailFactory', ['$resource',
        function($resource) {
            return $resource('/auth/mail/', {});
        }
    ]);
