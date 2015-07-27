'use strict';

describe('Service: RoleFactory', function () {

  // load the service's module
  beforeEach(module('frontendApp'));

  // instantiate service
  var RoleFactory;
  beforeEach(inject(function (_RoleFactory_) {
    RoleFactory = _RoleFactory_;
  }));

  it('should do something', function () {
    expect(!!RoleFactory).toBe(true);
  });

});
