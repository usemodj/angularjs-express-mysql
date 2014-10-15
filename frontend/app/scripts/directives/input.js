'use strict';

angular.module('frontendApp')
  .directive('input', ['$parse', function ($parse) {
    return {
      restrict: 'E',
        require: '?ngModel',
      link: function postLink(scope, element, attrs) {
        if(attrs.ngModel){
            var val = attrs.value || element.text();
            $parse(attrs.ngModel).assign(scope, val);
        }
      }
    };
  }]);
