'use strict';

describe('Service: UserFactory', function () {

  // load the service's module
  beforeEach(module('frontendApp'));

  // instantiate service
  var UserFactory;
  beforeEach(inject(function (_UserFactory_) {
    UserFactory = _UserFactory_;
  }));

  it('should do something', function () {
    expect(!!UserFactory).toBe(true);
  });

});
