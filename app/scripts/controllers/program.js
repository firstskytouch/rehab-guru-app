'use strict';

/**
 * @ngdoc function
 * @name rehabGuruWebApp20App.controller:ProgramCtrl
 * @description
 * # ProgramCtrl
 * Controller of the rehabGuruWebApp20App
 */
angular.module('rehabGuruWebApp20App')
	.controller('ProgramCtrl', function($mdSidenav, $mdToast, $mdDialog, $scope, $rootScope, ParseFactory, $localStorage, $loading, $filter, ExerciseFactory) {
		$scope.isNumber = angular.isNumber;
		var checkProgramme = false;
		$scope.$storage = $localStorage;
		$scope.hasMenu = true;
		$scope.active = true;
		$scope.userId = Parse.User.current().id;
		$scope.userAttributes = Parse.User.current().attributes
		$scope.currentNavItem = "program";
		$scope.currentSubNavItem = "Templates";
		$scope.isList = true;
		$scope.isGrid = true;
		$scope.currentPage = 1;
		$scope.prevPage = 0;
		$scope.nextPage = 0;
		$scope.maxPages = 1;
		$scope.isGrid = true;
		$scope.isList = true;
		$scope.tempProgrammes = [];
		$scope.setList = function() {
			$scope.isGrid = false;
		}
		$scope.setGrid = function() {
			$scope.isGrid = true;
		}
		$scope.next = function() {
			if($scope.nextPage > 0) {
				$scope.currentPage = $scope.nextPage;
			}
			$scope.updatePages();
		}
		$scope.prev = function() {
			if($scope.prevPage > 0) {
				$scope.currentPage = $scope.prevPage;
			}
			$scope.updatePages();
		}

		$scope.updatePages = function() {
			$scope.tempProgrammes = [];
			console.log($scope.Programmes.length);
			for (var i = 0; i < $scope.Programmes.length; i++) {
				var prog = $scope.Programmes[i];
				if ($scope.checkIfHidden(prog)) {
					$scope.tempProgrammes.push(prog);
				}
			}
			$scope.maxPages = parseInt(($scope.tempProgrammes.length - 1) / 12) + 1;
			if ($scope.Programmes.length == 0) {
				$scope.maxPages = 1;
			}
			if ($scope.tempProgrammes.length == 0) {
				$scope.maxPages = 1;
			}
			if ($scope.currentPage > $scope.maxPages) {
				$scope.currentPage = $scope.maxPages;
			}
			if ($scope.maxPages > $scope.currentPage) {
				$scope.nextPage = $scope.currentPage + 1;
			} else {
				$scope.nextPage = 0;
			}
			if($scope.currentPage > 1) {
				$scope.prevPage = $scope.currentPage - 1;
			} else {
				$scope.prevPage = 0;
			}
			$scope.ProgrammesResult = [];
			var start = ($scope.prevPage * 12);
			var last = ($scope.currentPage * 12);
			if (last >= $scope.tempProgrammes.length) {
				last = $scope.tempProgrammes.length - 1;
			}
			for (var i = start; i < last; i++) {
				$scope.ProgrammesResult.push($scope.tempProgrammes[i]);
			}
		}

		if(Parse.User.current().attributes.programmeSubscriptions) {
			$scope.programmeSubscriptions = Parse.User.current().attributes.programmeSubscriptions || [];
		}
		$scope.search = {
			term: '',
			guru: true,
			user: true
		};
		$scope.templateFilters = [{
			'niceName': 'Rehab Guru',
			'feedId': 'sItr5GpAPX'
		}, {
			'niceName': 'Saved',
			'feedId': Parse.User.current().id
		}];
		$scope.selection = {
			ids: {
				'sItr5GpAPX': true
			}
		}
		$scope.selection.ids[Parse.User.current().id] = true;

		function createTemplateFilters(collection) {
			for(var i = 0; i < $scope.programmeSubscriptions.length; i++) {
				$scope.templateFilters.push($scope.programmeSubscriptions[i])
			}
		}

		if($scope.programmeSubscriptions) {
			createTemplateFilters();
		}

		$scope.checkIfHidden = function(programme) {
			// console.log("programme.userId", programme.userId);
			if(programme.userId in $scope.selection.ids && $scope.selection.ids[programme.userId] === true) {
				return true
			}
			if(programme.shareKey in $scope.selection.ids && $scope.selection.ids[programme.shareKey] === true) {
				return true
			}
		}
		ExerciseFactory.scafoldProgramme();

		$scope.loadProgrammes = function() {

			$loading.start('templates');

			console.log('running cloud function');
			Parse.Cloud.run('getAllProgrammes', {})
				.then(function(data) {
					$loading.finish('templates');
					$localStorage.Programmes = data;
					$scope.Programmes = data;
					$scope.updatePages();
				}, function(error) {
					console.log(error);
					$loading.finish('templates');
				})
		}

		$scope.loadProgrammes();

		$rootScope.secureUrl = function(url) {
			var newString = url.replace('http://', 'https://s3.amazonaws.com/')
			return newString;
			console.log(newString);
		}

		$scope.popover = {
			'title': 'Help',
			'content': 'Use this page to add exercises using the templates below.'
		};

		var addProgrammeExercisesToProgramme = function(programme) {

			for(var i = 0; i < programme.exerciseData.length; i++) {
				$localStorage.Programme.exerciseData.push(ExerciseFactory.cleanExercise(programme.exerciseData[i]))
			};
			console.log($localStorage.Programme.exerciseData.length);
			$mdToast.show(
				$mdToast.simple()
				.textContent(programme.programmeTitle + ' loaded')
				.position('left top')
				.hideDelay(2000)
			);
		}

		$scope.overwriteExercises = function(programme) {
			console.log(programme.programmeTitle);
			$localStorage.Programme = ExerciseFactory.clearProgramme();
			addProgrammeExercisesToProgramme(programme);
			$localStorage.Programme.programmeTitle = programme.programmeTitle;
			$mdDialog.hide();
		}

		$scope.loadTemplateExercises = function(programme) {
			ExerciseFactory.scafoldProgramme();
			addProgrammeExercisesToProgramme(programme);
			$localStorage.Programme.programmeTitle = programme.programmeTitle;
		}

		$scope.deleteProgramme = function(programme) {
			var confirm = $mdDialog.confirm()
				.title('Delete ' + programme.programmeTitle + '?')
				.textContent('You will not be able to recover this program')
				.ok('Yes, delete it!')
				.cancel('Cancel');

			$mdDialog.show(confirm).then(function() {
				ParseFactory.provider('Programme/').delete(programme.objectId).success(function(data) {
					$mdDialog.show(
						$mdDialog.alert()
						.title('Done!')
						.textContent(programme.programmeTitle + ' deleted')
						.ariaLabel('success')
						.ok('OK')
					);
					$scope.loadProgrammes();
				}).error(function(response) {
					$mdDialog.show(
						$mdDialog.alert()
						.title('Error')
						.textContent(response.error)
						.ariaLabel('error')
						.ok('OK')
					);
				});
			}, function() {
				$mdDialog.show(
					$mdDialog.alert()
					.title('Cancelled')
					.textContent('Your program is safe')
					.ariaLabel('error')
					.ok('OK')
				);
			});
		}
		$scope.guruTemplate = {
			'title': 'Rehab Guru template'
		};

		$scope.shareTemplate = {
			'title': 'Click to share this Template'
		};

		$scope.popover = {
			'title': 'Exercise List',
			'content': 'Hello Popover<br />This is a multiline message!'
		};

		$scope.tooltip = {
			'title': 'Click for Exercise List',
			'checked': false
		};
		// $scope.loadExercisesTooltip = {
		// 	'title': 'Enter any \'Prescribed Program ID\' e.g \'xy6Gu9psQd\' to load the exercises into your collection.',
		// 	'checked': false
		// };
		$scope.loadExercisesTooltip = 'Enter any \'Prescribed Program ID\' e.g \'xy6Gu9psQd\' to load the exercises into your collection.';

		// $scope.templatesTooltip = {
		// 	'title': 'Toggle Program Templates using the checkboxes below.',
		// 	'checked': false
		// };

		$scope.templatesTooltip = 'Toggle Program Templates using the checkboxes below.';

		$scope.addExercisesToProgrammeModal = function(programme, ev) {
			$scope.programme = programme;
			$scope.savedProgramme = {
				title: programme.programmeTitle
			};
			console.log('this is being run');
			$scope.exercisePane = true;
			$scope.settingPane = false;
			$scope.isList = false;
			return;

			// $mdDialog.show({
			// 	locals: {
			// 		thescope: $scope
			// 	},
			// 	controller: function($scope, $mdDialog, thescope) {
			// 		$scope.data = thescope;
			// 	},
			// 	controllerAs: 'ctrl',
			// 	templateUrl: 'views/modals/addTemplateExercises.html',
			// 	targetEvent: ev,
			// 	parent: angular.element(document.body),
			// });
		};


		$scope.hide = function() {
			$scope.isList = true;
		};


		$scope.clearExercises = function() {
			var confirm = $mdDialog.confirm()
				.title('Are you sure?')
				.textContent('This will remove all exericses from your temporary collection!')
				.ok('Yes, clear my program')
				.cancel('Cancel');

			$mdDialog.show(confirm).then(function() {
				ExerciseFactory.scafoldProgramme();
				$localStorage.Programme.exerciseData = [];
			}, function() {
				$scope.status = 'You decided to keep your debt.';
			});
		};

		$scope.addTemplate = function(programmeId) {

			$loading.start('loadExercises');

			var query = {
				'objectId': programmeId
			}

			ParseFactory.provider('PrescribedProgrammes', query).getAll().success(function(data) {
				if(data.results.length > 0) {
					$localStorage.Programme.programmeTitle = data.results[0].prescribedProgrammeTitle;
					$localStorage.Programme.exerciseData = data.results[0].exerciseData;
					$loading.finish('loadExercises');
					$mdDialog.show(
						$mdDialog.alert()
						.title('Success')
						.textContent('All the exercises from ' + data.results[0].prescribedProgrammeTitle + ' have been loaded into your working collection')
						.ariaLabel('success')
						.ok('OK')
					);
					$scope.programmeIdToAdd = '';
				} else {
					$loading.finish('loadExercises');
					$mdDialog.show(
						$mdDialog.alert()
						.title('Error')
						.textContent('Could not find a program with the ID: ' + programmeId)
						.ariaLabel('error')
						.ok('OK')
					);
				}
			}).error(function(response) {
				$loading.finish('loadExercises');
				$mdDialog.show(
					$mdDialog.alert()
					.title('Error')
					.textContent('Unable to load exercises')
					.ariaLabel('error')
					.ok('OK')
				);
			});
		}



		$scope.toggleShareProgramme = function(prog) {
			console.log(prog);
			var params = {
				programmeId: prog.objectId
			};
			console.log(params);

			Parse.Cloud.run('toggleSharedProgramme', params)
				.then(function(success) {
					$scope.programme.shared = success.shared;
					var message;
					if(success.shared === true) {
						message = 'Program Shared'
					}
					if(success.shared === false) {
						message = 'Stopped sharing program'
					}
					$mdDialog.show(
						$mdDialog.alert()
						.parent(angular.element(document.querySelector('#add_templete_excerises')))
						.title('Done!')
						.textContent(message)
						.ariaLabel('success')
						.ok('OK')
					);
				}, function(error) {
					console.log(error);
					$mdDialog.show(
						$mdDialog.alert()
						.parent(angular.element(document.querySelector('#add_templete_excerises')))
						.title('Error')
						.textContent(error.message)
						.ariaLabel('error')
						.ok('OK')
					);
				})
		}


		$scope.exercisePane = true;

		$scope.changePane = function(page) {
			console.log(page);

			if(page === 'settingPane') {
				$scope.exercisePane = false;
				$scope.settingPane = true;
			} else {
				$scope.exercisePane = true;
				$scope.settingPane = false;
			}
		}
		$scope.updateProgramme = function(programme) {

			console.log($scope.savedProgramme.title);

			if($scope.savedProgramme.title.length === 0) {
				$mdDialog.show(
					$mdDialog.alert()
					.parent(angular.element(document.querySelector('#saveProgrammeModal')))
					.title('Error')
					.textContent('You cannot save a programme with a blank title')
					.ariaLabel('error')
					.ok('OK')
				);
			}
			var confirm = $mdDialog.confirm()
				.parent(angular.element(document.querySelector('#saveProgrammeModal')))
				.title('Save program as ' + $scope.savedProgramme.title + '?')
				.textContent('')
				.ok('Save')
				.cancel('Cancel');

			$mdDialog.show(confirm).then(function() {
				var saveProg = angular.copy(programme);
				var programmeACL = new Parse.ACL(Parse.User.current());
				programmeACL.setPublicReadAccess(false);
				programme.ACL = programmeACL;
				saveProg.userId = Parse.User.current().id;

				if(saveProg.programmeTitle != $scope.savedProgramme.title && $scope.savedProgramme.title.length > 0) {
					saveProg.programmeTitle = $scope.savedProgramme.title;
				}

				ParseFactory.provider('Programme/').edit(saveProg.objectId, saveProg).success(function(data) {
					$mdDialog.hide();
					$mdDialog.show(
						$mdDialog.alert()
						.parent(angular.element(document.querySelector('#saveProgrammeModal')))
						.title('Done!')
						.textContent(programme.programmeTitle + ' Saved, you may need to refresh your templates to see the changes')
						.ariaLabel('success')
						.ok('OK')
					);
				}).error(function(response) {
					console.log(response);
					$mdDialog.show(
						$mdDialog.alert()
						.parent(angular.element(document.querySelector('#saveProgrammeModal')))
						.title('Error')
						.textContent(response.error)
						.ariaLabel('error')
						.ok('OK')
					);
				});
			}, function() {

			});
		}
		$scope.toggleLeft = buildToggler('left');

		function buildToggler(navID) {
			return function() {
				$mdSidenav(navID)
					.toggle();
			}
		}
		$scope.closeLeft = function() {
			// Component lookup should always be available since we are not using `ng-if`
			$mdSidenav('left').close()
				.then(function() {

				});
		};


		$scope.searchTemplates = function(term) {
			console.log(term);
			if(term != '') {
				var options = {
					shouldSort: true,
					threshold: 0.4,
					location: 0,
					distance: 100,
					maxPatternLength: 32,
					keys: [
						"programmeTitle"
					]
				};
				var fuse = new Fuse($localStorage.Programmes, options); // "list" is the item array
				$scope.Programmes = fuse.search(term);
			} else {
				$scope.Programmes = $localStorage.Programmes;
			}
			$scope.maxPages = parseInt(($scope.Programmes.length - 1) / 12) + 1;
			$scope.updatePages();
		}
	});