'use strict';

describe('Controller: ForumCtrl', function () {

  // load the controller's module
  beforeEach(module('frontendApp'));

  var ForumCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ForumCtrl = $controller('ForumCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
