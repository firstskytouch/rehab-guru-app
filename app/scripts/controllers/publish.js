'use strict';

/**
 * @ngdoc function
 * @name rehabGuruWebApp20App.controller:PublishCtrl
 * @description
 * # PublishCtrl
 * Controller of the rehabGuruWebApp20App
 */
angular.module('rehabGuruWebApp20App')
	.controller('PublishCtrl', function($mdDialog, $scope, LinkFactory, $localStorage, _, $q, $window, userSubscriptionCheck, ParseConfiguration, ClientFactory, $filter, parsePrescriptionFactory, ParseFactory) {
		$scope.subHeaderLinks = LinkFactory.subHeaderLinks();
		$scope.$storage = $localStorage;
		$scope.currentUser = Parse.User.current();
		$scope.isNumber = angular.isNumber;
		var currentDate = $filter('date')(new Date(), 'dd-MMM-yy');
		$scope.currentDate = currentDate;
		$scope.currentNavItem = "program";
		$scope.currentSubNavItem = "Publish";
		$scope.status = 0;
		if($localStorage.Programme.programmeTitle.length < 1) {
			if($localStorage.Client) {
				$localStorage.Programme.programmeTitle = $localStorage.Client.name.name + ' ' + currentDate;
			} else {
				$localStorage.Programme.programmeTitle = currentDate;
			}
		}
		$scope.getHeaderHeight = function() {
			var height = document.getElementById('header').offsetWidth;
			return height / 1101 * 204;
		}
		$scope.getHeaderWidth = function() {
			return document.getElementById('header').offsetWidth;
		}
		$localStorage.SelectedClients = [];

		function getUserProgrammes() {
			var programmeHolder = [];
			for(var i = 0; i < $localStorage.Programmes.length; i++) {
				if($localStorage.Programmes[i].userId === Parse.User.current().id) {
					programmeHolder.push($localStorage.Programmes[i])
				}
			}
			return programmeHolder
		}

		$scope.userProgrammes = getUserProgrammes();

		$scope.selectedProgramme = [];

		$scope.saveSelect = {
			'select': 'newTemplate'
		};

		$scope.saveProgrammeModal = function() {
			$scope.status == 3 ? $scope.status = 0 : $scope.status = 3;
			$localStorage.SelectedProgramme = [];
		}

		$scope.saveProgramme = function() {
			if($localStorage.Programme.programmeTitle.length < 1) {
				$mdDialog.show(
					$mdDialog.alert()
					.parent(angular.element(document.querySelector('#saveProgrammeModal')))
					.title('Please enter a Program Title')
					.textContent('')
					.ariaLabel('success')
					.ok('OK')
				);
			} else if($localStorage.Programme.exerciseData.length === 0) {
				$mdDialog.show(
					$mdDialog.alert()
					.parent(angular.element(document.querySelector('#saveProgrammeModal')))
					.title('Error')
					.textContent('You cannot save a blank program, add some exercises first.')
					.ariaLabel('error')
					.ok('OK')
				);
			} else {
				$mdDialog.hide();
				var confirm = $mdDialog.confirm()
					.parent(angular.element(document.body))
					// .parent(angular.element(document.querySelector('#saveProgrammeModal')))
					.title('Save Template as ' + $localStorage.Programme.programmeTitle + '?')
					.textContent('')
					.ok('Save')
					.cancel('Cancel');
				$mdDialog.show(confirm).then(function() {
					var programme = $localStorage.Programme;
					var programmeACL = new Parse.ACL(Parse.User.current());
					programmeACL.setPublicReadAccess(false);
					programme.ACL = programmeACL;
					programme.userId = Parse.User.current().id;

					ParseFactory.provider('Programme').create(programme).then(function(data) {
						$mdDialog.hide();
						$mdDialog.show(
							$mdDialog.alert()
							// .parent(angular.element(document.querySelector('#saveProgrammeModal')))
							.title('Done!')
							.textContent(programme.programmeTitle + ' Saved, it is now availible in the template section')
							.ariaLabel('success')
							.ok('OK')
						);
					}).then(function(response) {
						$mdDialog.hide();
						$mdDialog.show(
							$mdDialog.alert()
							// .parent(angular.element(document.querySelector('#saveProgrammeModal')))
							.title('Error')
							.textContent(response.error)
							.ariaLabel('error')
							.ok('OK')
						);
					});
				}, function() {

				});
			}
		}

		$scope.updateProgramme = function() {
			var selectedProgrammeId = $localStorage.SelectedProgramme[0].objectId;
			$mdDialog.hide();
			var confirm = $mdDialog.confirm()
				// .parent(angular.element(document.querySelector('#saveProgrammeModal')))
				.title('Update ' + $localStorage.SelectedProgramme[0].programmeTitle + '?')
				.textContent('This will overwrite the previous program\'s exercises and settings with your current collection.')
				.ok('Save')
				.cancel('Cancel');
			$mdDialog.show(confirm).then(function() {
				var programme = angular.copy($localStorage.Programme);
				programme.programmeTitle = $localStorage.SelectedProgramme[0].programmeTitle;

				var programmeACL = new Parse.ACL(Parse.User.current());
				programmeACL.setPublicReadAccess(false);
				programme.ACL = programmeACL;
				programme.userId = Parse.User.current().id;

				ParseFactory.provider('Programme/').edit(selectedProgrammeId, programme).then(function(data) {
					$mdDialog.show(
						$mdDialog.alert()
						// .parent(angular.element(document.querySelector('#saveProgrammeModal')))
						.title('Done!')
						.textContent(programme.programmeTitle + ' Saved, it is now availible in the template section')
						.ariaLabel('success')
						.ok('OK')
					);
				}).then(function(response) {
					$mdDialog.show(
						$mdDialog.alert()
						// .parent(angular.element(document.querySelector('#saveProgrammeModal')))
						.title('Error')
						.textContent(response.error)
						.ariaLabel('error')
						.ok('OK')
					);
				});
			}, function() {
				$scope.status = 'You decided to keep your debt.';
			});
		}

		$scope.openSendProgramme = function() {
			$mdDialog.show({
				locals: {
					thescope: $scope
				},
				controller: function($scope, $mdDialog, thescope) {
					$scope.data = thescope;
				},
				controllerAs: 'ctrl',
				templateUrl: 'views/modals/sendProgrammeModal.html',
				parent: angular.element(document.body),
				clickOutsideToClose: true
			});
		}
		$scope.onAddChips = function(chip) {
			chip.checked = true;
		}
		$scope.onRemoveChips = function(chip) {
			chip.checked = false;
		}
		$scope.ModifyFilter = function(client) {
			if(client.checked) {
				$scope.$storage.SelectedClients.push(client);
			} else {
				var index = $scope.$storage.SelectedClients.indexOf(client);
				$scope.$storage.SelectedClients.splice(index, 1);
			}
		}
		$scope.sendProgramme = function() {
			var sendList = [];
			if($localStorage.SelectedClients.length === 0) {
				$mdDialog.show(
					$mdDialog.alert()
					.parent(angular.element(document.querySelector('#send_programme_modal')))
					.title('Error')
					.textContent('You do not have any clients selected')
					.ariaLabel('error')
					.ok('OK')
				);
			} else if($localStorage.Programme.exerciseData.length === 0) {
				$mdDialog.show(
					$mdDialog.alert()
					.parent(angular.element(document.querySelector('#send_programme_modal')))
					.title('Error')
					.textContent('You cannot send a blank program')
					.ariaLabel('error')
					.ok('OK')
				);
			} else {
				for(var i = 0; i < $localStorage.SelectedClients.length; i++) {
					parsePrescriptionFactory.prescribeProgramme($localStorage.SelectedClients[i]);
					sendList.push($localStorage.SelectedClients[i].name);
				};
				$mdDialog.show(
					$mdDialog.alert()
					.parent(angular.element(document.querySelector('#send_programme_modal')))
					.title('Success')
					.textContent('Prescriptions sent to: ' + sendList.join(', '))
					.ariaLabel('success')
					.ok('OK')
				);
			}
		};

		// CLIENT FUNCTION

		$scope.loadClients = function() {
			$localStorage.Clients = [];
			if(Parse.User.current()) {
				var query = {
					'userId': Parse.User.current().id
				};
				ParseFactory.provider('Clients', query).getAll().then(function(data) {
					data = data.data;
					console.log(1, data);
					if(data.results) {
						$localStorage.Clients = data.results;
					} else {
						$localStorage.Clients = [];
					}
				});
			}
		}

		$scope.loadClients();

		$scope.user = {
			name: '',
			email: ''
		}

		$scope.createClient = function() {
			var userAccess = userSubscriptionCheck.checkUser().then(function(userAccess) {
				if(userAccess === 'free' && $localStorage.Clients.length > 6) {
					userSubscriptionCheck.openPopup();
				} else {
					$scope.openClient();
				}
			});
		};
		$scope.openClient = function() {
			$scope.newUser = {};
			$mdDialog.show({
				locals: {
					thescope: $scope
				},
				controller: function($scope, $mdDialog, thescope) {
					$scope.data = thescope;
				},
				controllerAs: 'ctrl',
				templateUrl: 'views/modals/createClient.html',
				parent: angular.element(document.body),
				clickOutsideToClose: true
			});
		}
		$scope.saveClient = function(user) {
			if(!user) {
				$mdDialog.show(
					$mdDialog.alert()
					.parent(angular.element(document.querySelector('#create_client')))
					.title('Error')
					.textContent('Please ensure you have entered all details')
					.ariaLabel('error')
					.ok('OK')
				);
			} else if(user.name === undefined) {
				$mdDialog.show(
					$mdDialog.alert()
					.parent(angular.element(document.querySelector('#create_client')))
					.title('Error')
					.textContent('Please ensure you have entered a Client Name')
					.ariaLabel('error')
					.ok('OK')
				);
			} else if(user.email === undefined) {
				$mdDialog.show(
					$mdDialog.alert()
					.parent(angular.element(document.querySelector('#create_client')))
					.title('Error')
					.textContent('Please ensure you have entered all details')
					.ariaLabel('error')
					.ok('OK')
				);
			} else {
				ClientFactory.addClient(user);
				$scope.cancel();
				$scope.loadClients();
			}
		}

		$scope.openPublisher = function() {
			$scope.status == 2 ? $scope.status = 0 : $scope.status = 2;
			// var userAccess = userSubscriptionCheck.checkUser().then(function(userAccess) {
			// 	if(userAccess === 'free') {
			// 		userSubscriptionCheck.openPopup();
			// 	} else {
			// 		// $window.open(ParseConfiguration.siteURL + '/#/publisher', '_blank');
			// 		$window.open('/#/publisher', '_blank');
			// 	}
			// });
		}

		$scope.cancel = function($event) {
			$mdDialog.cancel();
		};

		$scope.isNumber = angular.isNumber;
		var checkProgramme = false;

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
