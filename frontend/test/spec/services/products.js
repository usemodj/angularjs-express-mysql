'use strict';

describe('Service: products', function () {

  // load the service's module
  beforeEach(module('frontendApp'));

  // instantiate service
  var products;
  beforeEach(inject(function (_products_) {
    products = _products_;
  }));

  it('should do something', function () {
    expect(!!products).toBe(true);
  });

});
