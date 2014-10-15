'use strict';

describe('Controller: AdminAssetCtrl', function () {

  // load the controller's module
  beforeEach(module('frontendApp'));

  var AdminAssetCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    AdminAssetCtrl = $controller('AdminAssetCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
