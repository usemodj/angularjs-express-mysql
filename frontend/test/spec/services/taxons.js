'use strict';

describe('Service: taxons', function () {

  // load the service's module
  beforeEach(module('frontendApp'));

  // instantiate service
  var taxons;
  beforeEach(inject(function (_taxons_) {
    taxons = _taxons_;
  }));

  it('should do something', function () {
    expect(!!taxons).toBe(true);
  });

});
