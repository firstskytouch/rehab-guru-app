'use strict';

describe('Controller: ProgrammesettingsCtrl', function () {

  // load the controller's module
  beforeEach(module('rehabGuruWebApp20App'));

  var ProgrammesettingsCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ProgrammesettingsCtrl = $controller('ProgrammesettingsCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
