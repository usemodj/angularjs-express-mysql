'use strict';

describe('Controller: AdminSupportCtrl', function () {

  // load the controller's module
  beforeEach(module('frontendApp'));

  var AdminSupportCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    AdminSupportCtrl = $controller('AdminSupportCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
