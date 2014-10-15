'use strict';

describe('Controller: AdminTaxonomyCtrl', function () {

  // load the controller's module
  beforeEach(module('frontendApp'));

  var AdminTaxonomyCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    AdminTaxonomyCtrl = $controller('AdminTaxonomyCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
