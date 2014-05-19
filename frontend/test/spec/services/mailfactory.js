'use strict';

describe('Service: MailFactory', function () {

  // load the service's module
  beforeEach(module('frontendApp'));

  // instantiate service
  var MailFactory;
  beforeEach(inject(function (_MailFactory_) {
    MailFactory = _MailFactory_;
  }));

  it('should do something', function () {
    expect(!!MailFactory).toBe(true);
  });

});
