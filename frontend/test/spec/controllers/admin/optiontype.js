'use strict';

describe('Controller: AdminOptiontypeCtrl', function () {

  // load the controller's module
  beforeEach(module('frontendApp'));

  var AdminOptiontypeCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    AdminOptiontypeCtrl = $controller('AdminOptiontypeCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
