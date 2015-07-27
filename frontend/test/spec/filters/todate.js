'use strict';

describe('Filter: toDate', function () {

  // load the filter's module
  beforeEach(module('frontendApp'));

  // initialize a new instance of the filter before each test
  var toDate;
  beforeEach(inject(function ($filter) {
    toDate = $filter('toDate');
  }));

  it('should return the input prefixed with "toDate filter:"', function () {
    var text = 'angularjs';
    expect(toDate(text)).toBe('toDate filter: ' + text);
  });

});
