'use strict';

angular.module('frontendApp')
.directive('passwordMatch', function() {
    return {
        restrict: 'A',
        scope: true,
        require: 'ngModel',
        link: function postLink(scope, element, attrs, ctrl) {
            var checker = function() {
                // get the value of the first password
                var e1 = scope.$eval(attrs.ngModel);
                // get the value of the other password
                var e2 = scope.$eval(attrs.passwordMatch);
                return e1 == e2;
            };
            scope.$watch(checker, function(n) {
                // set the form control to valid if both passwords are
                // the same, else invalid
                ctrl.$setValidity('passwordMatch', n);
            });
        }
    };
});
