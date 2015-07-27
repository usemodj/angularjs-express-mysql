'use strict';

angular.module('frontendApp')
/**
 * Removes server error when user updates input
 */
.directive('serverError', function() {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, element, attrs, ngModelCtrl) {
            element.on('keydown', function() {
                return ngModelCtrl.$setValidity('server', true);
            });
        }
    };
});
