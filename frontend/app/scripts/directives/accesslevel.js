'use strict';

angular.module('frontendApp')
  .directive('accessLevel', ['AuthFactory', function (AuthFactory) {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        var prevDisp = element.css('display'),
            userRole,
            accessLevel;
        scope.user = AuthFactory.user;
        scope.$watch('user', function(user){
            if(user.role) userRole = user.role;
            updateCSS();
        }, true);

        attrs.$observe('accessLevel', function(al){
            if(al) accessLevel = scope.$eval(al);
            updateCSS();
        });

        function updateCSS(){
            if(userRole && accessLevel){
                if(!AuthFactory.authorize(accessLevel, userRole)){
                    element.css('display', 'none');
                } else {
                    element.css('display', prevDisp);
                }
            }
        }
      }
    };
  }]);
