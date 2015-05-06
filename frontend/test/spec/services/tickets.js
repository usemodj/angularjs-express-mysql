'use strict';

describe('Service: tickets', function () {

  // load the service's module
  beforeEach(module('frontendApp'));

  // instantiate service
  var tickets;
  beforeEach(inject(function (_tickets_) {
    tickets = _tickets_;
  }));

  it('should do something', function () {
    expect(!!tickets).toBe(true);
  });

});
