'use strict';

angular.module('frontendApp')
  .directive('markdownEditor', ['$window', function ($window) {
    return {
      restrict: 'A',
      link: function postLink(scope, element, attrs) {
        var hiddenButtons = attrs.mdHiddenButtons ? attrs.mdHiddenButtons.split(","): new Array();
        element.markdown({hiddenButtons: hiddenButtons,
            additionalButtons: [
                [{
                    name:"groupCustom",
                    data: [{
                        name: "cmdHelp",
                        toggle: true,
                        title: "Help",
                        icon: "glyphicon glyphicon-question-sign",
                        callback: function(e){
                            $window.open("http://daringfireball.net/projects/markdown/syntax", "_blank");
                        }
                    }]

                }]
            ]
        });
      }
    };
  }]);
