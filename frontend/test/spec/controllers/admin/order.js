'use strict';

describe('Controller: AdminOrderCtrl', function () {

  // load the controller's module
  beforeEach(module('frontendApp'));

  var AdminOrderCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    AdminOrderCtrl = $controller('AdminOrderCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
