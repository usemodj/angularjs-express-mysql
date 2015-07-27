'use strict';

describe('Service: variants', function () {

  // load the service's module
  beforeEach(module('frontendApp'));

  // instantiate service
  var variants;
  beforeEach(inject(function (_variants_) {
    variants = _variants_;
  }));

  it('should do something', function () {
    expect(!!variants).toBe(true);
  });

});
