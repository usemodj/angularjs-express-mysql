'use strict';

describe('Service: forums', function () {

  // load the service's module
  beforeEach(module('frontendApp'));

  // instantiate service
  var forums;
  beforeEach(inject(function (_forums_) {
    forums = _forums_;
  }));

  it('should do something', function () {
    expect(!!forums).toBe(true);
  });

});
