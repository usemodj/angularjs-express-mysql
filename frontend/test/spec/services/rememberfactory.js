'use strict';

describe('Service: RememberFactory', function () {

  // load the service's module
  beforeEach(module('frontendApp'));

  // instantiate service
  var RememberFactory;
  beforeEach(inject(function (_RememberFactory_) {
    RememberFactory = _RememberFactory_;
  }));

  it('should do something', function () {
    expect(!!RememberFactory).toBe(true);
  });

});
