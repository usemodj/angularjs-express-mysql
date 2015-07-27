'use strict';

describe('Controller: AdminShippingMethodCtrl', function () {

  // load the controller's module
  beforeEach(module('frontendApp'));

  var AdminShippingMethodCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
      AdminShippingMethodCtrl = $controller('AdminShippingMethodCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
