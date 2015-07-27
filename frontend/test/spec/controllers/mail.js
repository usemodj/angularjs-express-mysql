'use strict';

describe('Controller: MailCtrl', function () {

  // load the controller's module
  beforeEach(module('frontendApp'));

  var MailCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    MailCtrl = $controller('MailCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
