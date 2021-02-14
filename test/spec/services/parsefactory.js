'use strict';

describe('Service: parseFactory', function () {

  // load the service's module
  beforeEach(module('rehabGuruWebApp20App'));

  // instantiate service
  var parseFactory;
  beforeEach(inject(function (_parseFactory_) {
    parseFactory = _parseFactory_;
  }));

  it('should do something', function () {
    expect(!!parseFactory).toBe(true);
  });

});
