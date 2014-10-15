'use strict';

describe('Service: shipments', function () {

  // load the service's module
  beforeEach(module('frontendApp'));

  // instantiate service
  var shipments;
  beforeEach(inject(function (_shipments_) {
    shipments = _shipments_;
  }));

  it('should do something', function () {
    expect(!!shipments).toBe(true);
  });

});
