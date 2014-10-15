'use strict';

describe('Controller: AdminForumCtrl', function () {

  // load the controller's module
  beforeEach(module('frontendApp'));

  var AdminForumCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    AdminForumCtrl = $controller('AdminForumCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
