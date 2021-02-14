'use strict';

/**
 * @ngdoc function
 * @name rehabGuruWebApp20App.controller:ProgramCtrl
 * @description
 * # ProgramCtrl
 * Controller of the rehabGuruWebApp20App
 */
angular.module('rehabGuruWebApp20App')
	.controller('PublisherCtrl', function($scope, $rootScope, ParseFactory, $q, $localStorage, $filter, ExerciseFactory) {

		$scope.isNumber = angular.isNumber;
		var checkProgramme = false;

		$scope.$storage = $localStorage;
		$scope.hasMenu = true;
		$scope.active = true;
		$scope.imageSize = 'small';
		$scope.showImg = true;
		$scope.imageQuality = false;
		$scope.imageStyle = {};
		$scope.message = 'On';
		$scope.qualityMsg = 'Off'
		$scope.fontStyle = {
			title: {
				'font-size': '16px'
			},
			description: {
				'font-size': '10px'
			}
		};

		var checkMod = function() {
			var checkString = '@mod.uk';
			if(Parse.User.current().attributes.email.indexOf(checkString) > -1) {
				return 'mod'
			} else {
				return 'normal'
			}
		}

		$scope.brandingImage = function() {
			var user = checkMod();
			if(user === 'mod') {
				return '_MOD'
			} else {
				return ''
			}
		}

		$scope.brandColour = function() {
			var user = checkMod();
			if(user === 'mod') {
				return 'purple'
			} else {
				return 'orange'
			}
		}

		$scope.print = function() {

			var tempTitle = document.title;
			document.title = $localStorage.Programme.programmeTitle + ".pdf";
			window.print();
			document.title = tempTitle;
			// window.print();
			// return false;
		};

		$scope.getImageQuality = function(quality) {
			if(quality === true) {
				return 'medium'
			} else {
				return 'thumb'
			}
		}

		$scope.changeImageSize = function(size) {
			$scope.imageSize = size;
		}

		// $scope.changeImageSize = function(width, height) {
		// 	$scope.imageStyle.width = width;
		// 	$scope.imageStyle.height = height;
		// };

		$scope.changeFontSize = function(fontSize) {
			$scope.fontStyle.title['font-size'] = (fontSize + 10) + 'px';
			$scope.fontStyle.description['font-size'] = fontSize + 'px';
		};
	});
