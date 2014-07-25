'use strict';

describe('Service: optionTypes', function () {

  // load the service's module
  beforeEach(module('frontendApp'));

  // instantiate service
  var optionTypes;
  beforeEach(inject(function (_optionTypes_) {
    optionTypes = _optionTypes_;
  }));

  it('should do something', function () {
    expect(!!optionTypes).toBe(true);
  });

});
