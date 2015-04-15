'use strict';

describe('Service: redirects', function () {

  // load the service's module
  beforeEach(module('frontendApp'));

  // instantiate service
  var redirects;
  beforeEach(inject(function (_redirects_) {
    redirects = _redirects_;
  }));

  it('should do something', function () {
    expect(!!redirects).toBe(true);
  });

});
