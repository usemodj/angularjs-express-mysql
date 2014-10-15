'use strict';

describe('Controller: TopicCtrl', function () {

  // load the controller's module
  beforeEach(module('frontendApp'));

  var TopicCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    TopicCtrl = $controller('TopicCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
