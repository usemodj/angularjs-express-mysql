'use strict';

describe('Controller: NewsCtrl', function () {

  // load the controller's module
  beforeEach(module('frontendApp'));

  var NewsCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    NewsCtrl = $controller('NewsCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
