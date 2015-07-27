'use strict';

describe('Controller: AdminPaymentMethodCtrl', function () {

  // load the controller's module
  beforeEach(module('frontendApp'));

  var AdminPaymentMethodCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    AdminPaymentMethodCtrl = $controller('AdminPaymentMethodCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
