'use strict';

/**
 * @ngdoc function
 * @name rehabGuruWebApp20App.controller:ClientdetailsCtrl
 * @description
 * # ClientdetailsCtrl
 * Controller of the rehabGuruWebApp20App
 */
angular.module('rehabGuruWebApp20App')
	.controller('ClientDetailsCtrl', function($scope, ExerciseFactory, ParseFactory, $state, $localStorage, $mdDialog) {

		$scope.$storage = $localStorage;
		$scope.currentNavItem = "clients";

		var getProgrammes = function() {
			var query = {
				'clientId': $localStorage.Client.objectId
			};
			ParseFactory.provider('PrescribedProgrammes/', query).getAll().then(function(rtnDta) {
				var data = rtnDta.data;
				$scope.programmes = data.results;
			}).catch(function(response) {
				$mdDialog.show(
					$mdDialog.alert()
					.title('Error')
					.textContent(response.error)
					.ariaLabel('error')
					.ok('OK')
				);
			});
		};
		$scope.editClient = function(user) {
			$mdDialog.show({
				controller: function($scope, $mdDialog, $localStorage, ClientFactory) {
					$scope.editUser = $localStorage.Client;
					$scope.cancel = function() {
						$mdDialog.hide();
					};
					$scope.saveEditClient = function(client) {
						delete client.updatedAt;
						delete client.createdAt;
						$localStorage.Client = client;
						ClientFactory.editClient(client);
					}
				},
				controllerAs: 'ctrl',
				templateUrl: 'views/modals/editClient.html',
				parent: angular.element(document.body),
			});
		};
		$scope.cancel = function() {
			$mdDialog.cancel();
		}
		$scope.deleteClient = function() {
			var confirm = $mdDialog.confirm()
				.title('Are you sure?')
				.textContent('Are you sure you wish to delete ' + $localStorage.Client.name + '?')
				.ariaLabel('Lucky day')
				.ok('Yes!')
				.cancel('NO');
			$mdDialog.show(confirm).then(function() {
				var a = ParseFactory.provider('Clients/').delete($localStorage.Client.objectId);
				console.log(a);
				ParseFactory.provider('Clients/').delete($localStorage.Client.objectId).then(function() {
					$mdDialog.show(
						$mdDialog.alert()
						.title('Deleted!')
						.textContent('')
						.ariaLabel('success')
						.ok('OK')
					);
					$state.go('clients');
				}).catch(function(response) {
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

		$scope.useAsTemplate = function(programme) {
			ExerciseFactory.scafoldProgramme();
			$localStorage.Programme.exerciseData = programme.exerciseData;
			$mdDialog.show(
				$mdDialog.alert()
				.clickOutsideToClose(true)
				.title('Done')
				.textContent('All exercises have been loaded. Go to the creator to edit your program')
				.ariaLabel('success')
				.ok('OK')
			);
		}

		$scope.deletePrescription = function(programme) {
			var confirm = $mdDialog.confirm()
				.title('Are you sure?')
				.textContent('Are you sure you wish to delete this prescription, this cannot be undone!')
				.ariaLabel('Lucky day')
				.ok('Yes!')
				.cancel('NO');
			$mdDialog.show(confirm).then(function() {
				ParseFactory.provider('PrescribedProgrammes/').delete(programme.objectId).success(function(data) {
					$mdDialog.show(
						$mdDialog.alert()
						.title('Deleted!')
						.textContent('')
						.ariaLabel('success')
						.ok('OK')
					);
					getProgrammes();

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
					.title('Error')
					.textContent(response.error)
					.ariaLabel('error')
					.ok('OK')
				);
			});
		}

		$scope.sendAgain = function(programme) {

			console.log('running');

			var tempClient = $localStorage.Client;

			var client = {
				Email: tempClient.email,
				Name: tempClient.name,
				// Message: client.Message,
				id: tempClient.id,
				ProgrammeId: programme.objectId
			};

			Parse.Cloud.run('sendUserProgramme', client, {
				// Success handler
				success: function(message) {
					$mdDialog.show(
						$mdDialog.alert()
						.title('Success')
						.textContent('Program Sent')
						.ariaLabel('success')
						.ok('OK')
					);
				},
				// Error handler
				error: function(error) {
					$mdDialog.show(
						$mdDialog.alert()
						.title('Error')
						.textContent(error.error)
						.ariaLabel('error')
						.ok('OK')
					);
				}
			});
		};
		getProgrammes();
	});
