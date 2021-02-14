'use strict';

/**
 * @ngdoc function
 * @name rehabGuruWebApp20App.controller:LoginCtrl
 * @description
 * # LoginCtrl
 * Controller of the rehabGuruWebApp20App
 */
angular.module('rehabGuruWebApp20App')
	.controller('HeaderCtrl', function($scope, $mdSidenav, $location) {
		$scope.toggleRight = buildToggler('right');
		$scope.toggleLeft = buildToggler('left');
		$scope.location = $location;
		$scope.onHelp = function() {
			var help = window.open('https://support.rehabguru.com');
			help.focus();
		};

		function buildToggler(navID) {
			return function() {
				$mdSidenav(navID)
					.toggle();
			}
		}

		function hideToggler(navID) {
			$mdSidenav(navID).close().then(function() {
				console.log("close");
			});
		}
		$scope.closeRight = function() {
			// Component lookup should always be available since we are not using `ng-if`
			$mdSidenav('right').close()
				.then(function() {

				});
		};
		$scope.closeLeft = function() {
			// Component lookup should always be available since we are not using `ng-if`
			$mdSidenav('left').close()
				.then(function() {

				});
		};
	});
