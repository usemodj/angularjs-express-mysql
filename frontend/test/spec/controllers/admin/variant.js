'use strict';

describe('Controller: AdminVariantCtrl', function () {

  // load the controller's module
  beforeEach(module('frontendApp'));

  var AdminVariantCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    AdminVariantCtrl = $controller('AdminVariantCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
