'use strict';

describe('Service: Assets', function () {

  // load the service's module
  beforeEach(module('frontendApp'));

  // instantiate service
  var assets;
  beforeEach(inject(function (_assets_) {
    assets = _assets_;
  }));

  it('should do something', function () {
    expect(!!assets).toBe(true);
  });

});
