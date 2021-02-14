'use strict';

/**
 * @ngdoc service
 * @name rehabGuruWebApp20App.parseFactory
 * @description
 * # parseFactory
 * Factory in the rehabGuruWebApp20App.
 */
angular.module('rehabGuruWebApp20App')
  .factory('parseFactory', function () {
    // Service logic
    // ...

    var meaningOfLife = 42;

    // Public API here
    return {
      someMethod: function () {
        return meaningOfLife;
      }
    };
  });
