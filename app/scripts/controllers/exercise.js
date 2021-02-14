'use strict';

/**
 * @ngdoc function
 * @name rehabGuruWebApp20App.controller:ExerciseCtrl
 * @description
 * # ExerciseCtrl
 * Controller of the rehabGuruWebApp20App
 */
angular.module('rehabGuruWebApp20App')
	.controller('ExerciseCtrl', function($mdPanel, $mdDialog, $mdToast, $scope, $localStorage, $http, $state, userSubscriptionCheck, ParseFactory, _, $filter, LinkFactory, ExerciseFactory) {

		var checkProgramme = false;
		$scope.view = 'exercses Controller here';
		$scope.isNumber = angular.isNumber;
		$scope.ActiveFilters = [];
		$scope.searchTerm = '';
		$scope.hasMenu = true;
		$scope.currentNavItem = "program";
		$scope.currentSubNavItem = "Exercises";
		$scope.isOpen = false;

		$scope.search = {
			term: ''
		};
		$scope.subHeaderLinks = LinkFactory.subHeaderLinks();

		$scope.$storage = $localStorage;

		var client = algoliasearch("9POBZ4WVU7", "584eee19732fea93d24fa7f8ca38a74f");
		var index = client.initIndex('exercises');
		var difficultyArray = ["Easy", "Medium", "Hard", "Expert"];

		$scope.runSearch = function(term) {

			var filterContainer = [];

			term = $scope.search.term;

			if($scope.ActiveFilters.length > 0) {
				for(var i = 0; i < $scope.ActiveFilters.length; i++) {
					if(difficultyArray.indexOf($scope.ActiveFilters[i].name) > -1) {
						filterContainer.push("difficulty:" + $scope.ActiveFilters[i].name);
					} else {
						filterContainer.push("tags:" + $scope.ActiveFilters[i].name);
					}
				}
			}
			index.search(term, {
					facets: '*',
					facetFilters: filterContainer
				})
				.then(function searchSuccess(content) {
					$scope.allExercises = content.hits;
					$scope.$apply();
				})
				.catch(function searchError(err) {
					console.error(err);
				});
		}

		$scope.clearSearch = function() {
			$scope.searchTerm = '';
		};


		$scope.showFavourites = function() {
			$scope.allExercises = $localStorage.Favourites;
		}

		$scope.showSavedExercises = function() {
			$scope.allExercises = $localStorage.UserExercises;
		}


		$scope.getExerciseIndex = function(exercise) {
			var index = -1;

			if(!$localStorage.Programme.exerciseData) return index;

			for(var i = 0; i < $localStorage.Programme.exerciseData.length; i++) {
				if($localStorage.Programme.exerciseData[i].objectID !== exercise.objectID) continue;
				index = i;
				break;
			}
			return index;
		};

		$scope.exerciseExists = function(exercise) {
			var index = $scope.getExerciseIndex(exercise);
			return index > -1;
		};

		$scope.toggleExercise = function(exercise) {
			var index = $scope.getExerciseIndex(exercise);

			if(index > -1) {
				$localStorage.Programme.exerciseData.splice(index, 1);

				var toast = $mdToast.simple()
					.textContent(exercise.exerciseName + ' Removed')
					.action('UNDO')
					.highlightAction(true)
					.highlightClass('md-accent') // Accent is used by default, this just demonstrates the usage.
					.position('top left');

				$mdToast.show(toast).then(function(response) {
					if(response == 'ok') {
						$localStorage.Programme.exerciseData.push(ExerciseFactory.cleanExercise(exercise));
						$mdToast.show(
							$mdToast.simple()
							.textContent(exercise.exerciseName + ' Added')
							.position('left top')
							.hideDelay(3000)
						);
					}
				});

			} else {
				$localStorage.Programme.exerciseData.push(ExerciseFactory.cleanExercise(exercise));

				var toast = $mdToast.simple()
					.textContent(exercise.exerciseName + ' Added')
					.action('UNDO')
					.highlightAction(true)
					.highlightClass('md-accent') // Accent is used by default, this just demonstrates the usage.
					.position('top left');

				$mdToast.show(toast).then(function(response) {
					if(response == 'ok') {
						$localStorage.Programme.exerciseData.splice(index, 1);
						$mdToast.show(
							$mdToast.simple()
							.textContent(exercise.exerciseName + ' Removed')
							.position('left top')
							.hideDelay(3000)
						);
					}
				});
			}
		};

		$scope.ActiveFilters = [];

		$http.get('data/filters.json').then(function(data) {
			$scope.Filters = data.data.results;
		});

		$scope.openFilters = function(ev) {
			// var tabs = $scope.Filters;
			// for(var i = 0; i < tabs.length; i++) {
			// 	var tab = tabs[i];
			// 	for(var j = 0; j < tab.filters.length; j++) {
			// 		tab.filters[j].checked = false;
			// 		for(var k = 0; k < $scope.ActiveFilters.length; k++) {
			// 			if(tab.filters[j] == $scope.ActiveFilters[k]) {
			// 				tab.filters[j].checked = true;
			// 				console.log(i, j);
			// 				break;
			// 			}
			// 		};
			// 	};
			// };
			$mdDialog.show({
				locals: {
					thescope: $scope
				},
				controller: function($scope, $mdDialog, thescope) {
					$scope.data = thescope;
				},
				controllerAs: 'ctrl',
				templateUrl: 'views/modals/filterModal.html',
				parent: angular.element(document.body),
			});
			// var position = $mdPanel.newPanelPosition()
			// 		.relativeTo('.demo-menu-open-button')
			// 		.addPanelPosition($mdPanel.xPosition.ALIGN_CENTER, $mdPanel.yPosition.BELOW);

			// $mdPanel.open({
			// 	attachTo: angular.element(document.body),
			// 	locals: {
			// 		thescope: $scope,
			// 		'selected': this.selected,
			// 		'desserts': this.desserts
			// 	},
			// 	controller: function($scope, $mdDialog, thescope) {
			// 		$scope.data = thescope;
			// 	},
			// 	controllerAs: 'ctrl',
			// 	// templateUrl: 'views/modals/filterModal.html',
			// 	template:
			// 		'TestTestTestTestTestTestTestTestTestTestTestTestTestTestTest',
			// 	panelClass: 'demo-menu-example',
			// 	position: position,
			// 	openFrom: ev,
			// 	clickOutsideToClose: true,
			// 	escapeToClose: true,
			// 	focusOnOpen: false,
			// 	zIndex: 2000
			// });
		};


		$scope.newExercise = function() {
			$mdDialog.show({
				locals: {
					thescope: $scope
				},
				controller: function($scope, $mdDialog, thescope) {
					$scope.data = thescope;
				},
				controllerAs: 'ctrl',
				templateUrl: 'views/modals/createExerciseModal.html',
				parent: angular.element(document.body),
				clickOutsideToClose: true
			});
		}

		$scope.uploadFile = function(files) {
			$http.post("https://api.parse.com/1/files/image.jpg", files[0], {
				withCredentials: false,
				headers: {
					'X-Parse-Application-Id': '1TvUIjcdYSCen0LO6MpUU6buaQENVVLdC5q9u0pt',
					'X-Parse-REST-API-Key': '7uQS721mqbPxPhQpP4VXulPiQcvevhMU9xLkJbZ5',
					'Content-Type': 'image/jpeg'
				},
				transformRequest: angular.identity
			}).then(function(data) {
				console.log(data);
				$scope.url = data.url;
			});
		};

		$scope.clearFilters = function() {
			angular.forEach($scope.ActiveFilters, function(filter) {
				filter.checked = false;
			});
			$scope.ActiveFilters = [];
		}

		$scope.ModifyFilter = function(Filter) {
			if(Filter.checked) {
				$scope.ActiveFilters.push(Filter);
			} else {
				var indexz = $scope.ActiveFilters.indexOf(Filter);
				$scope.ActiveFilters.splice(indexz, 1);
			}
		}

		$scope.$watchCollection('ActiveFilters', function(filters) {
			$scope.runSearch();
		});



		$scope.popover = {
			"title": "Exercise List",
			"content": "Hello Popover<br />This is a multiline message!"
		};

		$scope.tooltip = {
			"title": "Click for Exercise List",
			"checked": false
		};


		function loadFavourites(query) {
			if(Parse.User.current()) {
				ParseFactory.provider('Favourites', query).getAll().then(function(data) {
					if(data.results) {
						var flattened = _.extend.apply(_, data.results);
						if(flattened) {
							$localStorage.Favourites = flattened.favourites;
						}
					} else {
						$localStorage.Favourites = [];
					}
				}).then(function(response) {
					console.log(response);
				});
			}
		}

		function loadUserExercises(query) {
			if(Parse.User.current()) {
				ParseFactory.provider('UserExercises', query).getAll().then(function(data) {
					if(data.results) {
						// var flattened = _.extend.apply(_, data.results);
						// if(flattened) {
						// $localStorage.UserExercises = flattened.favourites;
						$localStorage.UserExercises = data.results;
						// }
					} else {
						$localStorage.UserExercises = [];
					}
				}).then(function(response) {
					console.log(response);
				});
			}
		}

		var programmeQuery = {
			"userId": Parse.User.current().id
		}

		loadFavourites(programmeQuery);
		loadUserExercises(programmeQuery);



		$scope.getFavouriteIndex = function(exercise) {
			var index = -1;

			if(!$localStorage.Favourites) return index;

			for(var i = 0; i < $localStorage.Favourites.length; i++) {
				if($localStorage.Favourites[i].objectID !== exercise.objectID) continue;
				index = i;
				break;
			}
			return index;
		};

		$scope.favouriteExists = function(exercise) {
			var index = $scope.getFavouriteIndex(exercise);
			return index > -1;
		};


		$scope.toggleExerciseFavourite = function(exercise) {

			if(!$localStorage.Favourites) {
				$localStorage.Favourites = [];
			}

			var index = $scope.getFavouriteIndex(exercise);

			var userAccess = userSubscriptionCheck.checkUser().then(function(userAccess) {
				if(userAccess === 'free' && $localStorage.Favourites.length > 6 && index === -1) {

					userSubscriptionCheck.openPopup();

				} else {

					if(index === -1) {
						$localStorage.Favourites.push(ExerciseFactory.cleanExercise(exercise));
					} else {
						$localStorage.Favourites.splice(index, 1);
					}

					Parse.Cloud.run('saveFavourites', {
						favourites: $localStorage.Favourites
					}, {
						// Success handler
						success: function(response) {
							console.log('favourite saved successfully');
						},
						// Error handler
						error: function(response) {
							console.log("Error" + response.message);

						}
					});
				}
			});
		};

		$scope.expandExercise = function(exercise) {
			$scope.exercise = exercise;
			$mdDialog.show({
				locals: {
					thescope: $scope
				},
				controller: function($scope, $mdDialog, thescope) {
					$scope.data = thescope;
				},
				controllerAs: 'ctrl',
				templateUrl: 'views/modals/expandExercise.html',
				parent: angular.element(document.body),
			});
		};
		$scope.cancel = function() {
			$mdDialog.cancel();
		}

		$scope.clearExercises = function() {
			var confirm = $mdDialog.confirm()
				.title('Are you sure?')
				.textContent('This will remove all exericses from your temporary collection!')
				.ariaLabel('warning')
				.ok('Yes, clear my program')
				.cancel('Cancel');
			$mdDialog.show(confirm).then(function() {
				ExerciseFactory.scafoldProgramme();
				$localStorage.Programme.exerciseData = [];
			}, function() {

			});
		};
	});
