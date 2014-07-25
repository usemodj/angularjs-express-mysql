'use strict';

describe('Service: optionValues', function () {

  // load the service's module
  beforeEach(module('frontendApp'));

  // instantiate service
  var optionValues;
  beforeEach(inject(function (_optionValues_) {
    optionValues = _optionValues_;
  }));

  it('should do something', function () {
    expect(!!optionValues).toBe(true);
  });

});
