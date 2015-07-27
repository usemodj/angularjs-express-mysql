'use strict';

describe('Service: paymentMethods', function () {

  // load the service's module
  beforeEach(module('frontendApp'));

  // instantiate service
  var paymentMethods;
  beforeEach(inject(function (_paymentMethods_) {
    paymentMethods = _paymentMethods_;
  }));

  it('should do something', function () {
    expect(!!paymentMethods).toBe(true);
  });

});
