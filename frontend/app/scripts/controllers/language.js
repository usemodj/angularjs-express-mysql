'use strict';

/**
 * @ngdoc function
 * @name frontendApp.controller:LanguageCtrl
 * @description
 * # LanguageCtrl
 * Controller of the frontendApp
 */
angular.module('frontendApp')
  .controller('LanguageCtrl', ['$scope', '$translate', 'languages', function ($scope, $translate, languages) {
    $scope.changeLanguage = function (languageKey) {
      $translate.use(languageKey);
    };

    languages.getAll().then(function (languages) {
      $scope.languages = languages;
    });
  }]);
