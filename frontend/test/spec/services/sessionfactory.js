'use strict';

describe('Service: SessionFactory', function () {

  // load the service's module
  beforeEach(module('frontendApp'));

  // instantiate service
  var SessionFactory;
  beforeEach(inject(function (_SessionFactory_) {
    SessionFactory = _SessionFactory_;
  }));

  it('should do something', function () {
    expect(!!SessionFactory).toBe(true);
  });

  it('gets session item', function(){
        SessionFactory.get(function(user) {
          console.log('>>authfactory currentUser:');
          console.log(user);
          //$rootScope.currentUser = user;
        });

  });
});
