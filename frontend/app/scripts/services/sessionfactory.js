'use strict';

var services = angular.module('frontendApp');
services.factory('SessionFactory', ['$resource', function($resource) {
            return $resource('/auth/session');
        }
    ]);
