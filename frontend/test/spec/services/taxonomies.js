'use strict';

describe('Service: taxonomies', function () {

  // load the service's module
  beforeEach(module('frontendApp'));

  // instantiate service
  var taxonomies;
  beforeEach(inject(function (_taxonomies_) {
    taxonomies = _taxonomies_;
  }));

  it('should do something', function () {
    expect(!!taxonomies).toBe(true);
  });

});
