'use strict';

angular.module('frontendApp')
    .constant('focusConfig', {
        focusClass: 'focused'
    })
    .directive('onFocus', ['focusConfig',
        function(focusConfig) {
            return {
                restrict: 'A',
                require: 'ngModel',
                link: function(scope, element, attrs, ngModelCtrl) {
                    ngModelCtrl.$focused = false;
                    element
                        .bind('focus', function(evt) {
                            element.addClass(focusConfig.focusClass);
                            scope.$apply(function() {
                                ngModelCtrl.$focused = true;
                            });
                        })
                        .bind('blur', function(evt) {
                            element.removeClass(focusConfig.focusClass);
                            scope.$apply(function() {
                                ngModelCtrl.$focused = false;
                            });
                        });
                }
            };
        }
    ]);
