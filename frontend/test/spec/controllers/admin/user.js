'use strict';

describe('Controller: AdminUserCtrl', function () {

  // load the controller's module
  beforeEach(module('frontendApp'));

  var AdminUserCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    AdminUserCtrl = $controller('AdminUserCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
