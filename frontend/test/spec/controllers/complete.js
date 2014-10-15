'use strict';

describe('Controller: CompleteCtrl', function () {

  // load the controller's module
  beforeEach(module('frontendApp'));

  var CompleteCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    CompleteCtrl = $controller('CompleteCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
