'use strict';

describe('Service: payments', function () {

  // load the service's module
  beforeEach(module('frontendApp'));

  // instantiate service
  var payments;
  beforeEach(inject(function (_payments_) {
    payments = _payments_;
  }));

  it('should do something', function () {
    expect(!!payments).toBe(true);
  });

});
