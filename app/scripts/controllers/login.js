'use strict';

/**
 * @ngdoc function
 * @name rehabGuruWebApp20App.controller:LoginCtrl
 * @description
 * # LoginCtrl
 * Controller of the rehabGuruWebApp20App
 */
angular.module('rehabGuruWebApp20App')
	.controller('LoginCtrl', function($mdDialog, $scope, $rootScope, $state, $localStorage, UserService, Idle) {

		UserService.init();

		$scope.creds = {
			username: "",
			password: ""
		};

		$scope.doLoginAction = function() {
			UserService.login($scope.creds.username, $scope.creds.password)
				.then(function(_response) {
					if($rootScope.linkTarget) {
						$state.go($rootScope.linkTarget, {
							fromCallback: true
						});
						$rootScope.linkTarget = null;
					} else {
						$state.go('program');
					}
					// Start watching for idleness.
					Idle.watch();
				}, function(_error) {
					alert("error logging in " + _error.message);
				})
		};

		$scope.actionRegister = function() { 
			$state.go('register');
		}

		$scope.hide = function() {
			$mdDialog.hide();
		}
		$scope.resetPassword = function(mailAddress) {
			$mdDialog.hide();
			Parse.User.requestPasswordReset(mailAddress, {
				success: function() {
					alert = $mdDialog.alert({
						title: 'Success',
						textContent: 'A password reset has been sent to ' + mailAddress + '. Click on the link in the email to reset your password',
						ok: 'OK'
					});
					$mdDialog
						.show(alert)
						.finally(function() {
							alert = undefined;
						});
				},
				error: function(err) {
					alert = $mdDialog.alert({
						title: 'Error',
						textContent: err.message,
						ok: 'OK'
					});
					$mdDialog
						.show(alert)
						.finally(function() {
							alert = undefined;
						});
				}
			});
		}
		$scope.resetPasswordModal = function(ev) {
			$mdDialog.show({
				locals: {
					thescope: $scope
				},
				controller: function($scope, $mdDialog, thescope) {
					$scope.data = thescope;
				},
				controllerAs: 'ctrl',
				templateUrl: 'views/modals/forgotPassword.html',
				parent: angular.element(document.body),
			});
		}
	});
