'use strict';

/**
 * @ngdoc function
 * @name rehabGuruWebApp20App.controller:ProgrammepreviewCtrl
 * @description
 * # ProgrammepreviewCtrl
 * Controller of the rehabGuruWebApp20App
 */
angular.module('rehabGuruWebApp20App')
	.controller('ProgrammePreviewCtrl', function($scope, $localStorage, $q) {

		// $scope.subHeaderLinks = LinkFactory.subHeaderLinks();
		$scope.$storage = $localStorage;
		$scope.isNumber = angular.isNumber;
		$scope.isCollapsed = true;
		$scope.currentNavItem = "program";
		$scope.currentSubNavItem = "Preview";

		// var editExercise = $modal({
		// 	scope: $scope,
		// 	templateUrl: 'views/modals/editExercise.html',
		// 	show: false
		// });

		// $scope.editExercise = function(exercise) {
		// 	$scope.exercise = exercise;
		// 	editExercise.$promise.then(editExercise.show);
		//
		// };
		//
		// $scope.deleteExercise = function(exercise) {
		// 	$localStorage.Programme.splice($localStorage.Programme.indexOf(exercise), 1);
		// }

	});
