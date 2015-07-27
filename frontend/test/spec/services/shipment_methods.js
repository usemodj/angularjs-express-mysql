'use strict';

describe('Service: shipmentMethods', function () {

  // load the service's module
  beforeEach(module('frontendApp'));

  // instantiate service
  var shipmentMethods;
  beforeEach(inject(function (_shipmentMethods_) {
    shipmentMethods = _shipmentMethods_;
  }));

  it('should do something', function () {
    expect(!!shipmentMethods).toBe(true);
  });

});
