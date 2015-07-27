'use strict';

describe('Service: profiles', function () {

  // load the service's module
  beforeEach(module('frontendApp'));

  // instantiate service
  var profiles;
  beforeEach(inject(function (_profiles_) {
    profiles = _profiles_;
  }));

  it('should do something', function () {
    expect(!!profiles).toBe(true);
  });

});
