'use strict';

describe('Controller: ClientdetailsCtrl', function () {

  // load the controller's module
  beforeEach(module('rehabGuruWebApp20App'));

  var ClientdetailsCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ClientdetailsCtrl = $controller('ClientdetailsCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
