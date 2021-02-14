'use strict';

/**
 * @ngdoc function
 * @name rehabGuruWebApp20App.controller:AccountCtrl
 * @description
 * # AccountCtrl
 * Controller of the rehabGuruWebApp20App
 */
angular.module('rehabGuruWebApp20App')
	.controller('AccountCtrl', function($window, $mdDialog, $scope, UserService, ParseFactory, $loading, userSubscriptionCheck, $localStorage, $state) {
		$scope.currentUser = Parse.User.current();
		$scope.currentNavItem = 'account';
		$scope.currentSubNavItem = 'Account';
		$scope.doLogoutAction = function() {
			UserService.logout()
				.then(function(_response) {
					$state.go('login');
					$localStorage.$reset();
				}, function(_error) {
					console.log('error logging out ' + _error.debug);
				})
		};

		$scope.saveUser = function(user) {

			$loading.start('loadAccount');

			if(user.email === Parse.User.current().attributes.email) {

				var editedUser = {
					firstName: user.firstName,
					lastName: user.lastName,
					config: user.config
				}

			} else {

				var editedUser = {
					email: user.email,
					username: user.email,
					firstName: user.firstName,
					lastName: user.lastName,
					config: user.config
				};
			}

			ParseFactory.provider('_User/').edit(Parse.User.current().id, editedUser).success(function(data) {
				$scope.refreshUser();
				$mdDialog.show(
					$mdDialog.alert()
						.title('Saved')
						.textContent('Profile Saved')
						.ariaLabel('success')
						.ok('OK')
				);
				$loading.finish('loadAccount');
			}).error(function(error) {
				$mdDialog.show(
					$mdDialog.alert()
						.title('Error')
						.textContent(error.message)
						.ariaLabel('error')
						.ok('OK')
				);
				$loading.finish('loadAccount');
			});
		};

		$scope.refreshUser = function() {

			$loading.start('loadAccount');

			Parse.User.current().fetch().then(function(user) {

				var config = user.attributes.config || {
					copyPrescription: false
				};

				$scope.user = {
					email: user.attributes.email,
					firstName: user.attributes.firstName,
					lastName: user.attributes.lastName,
					config: config,
					emailVerified: user.attributes.emailVerified
				};

				$scope.$apply();
				$loading.finish('loadAccount');
			});

			var userAccess = userSubscriptionCheck.checkUser().then(function(userAccess) {
				$scope.currentPlan = userAccess;
			});
		};


		$scope.doResetPassword = function() {
			var confirm = $mdDialog.prompt()
				.title('Reset Your Password')
				.textContent('Enter a strong password below and press OK')
				.placeholder('New Password')
				.ariaLabel('password')
				.initialValue('')
				.ok('Ok')
				.cancel('Cancel');
			$mdDialog.show(confirm).then(function(result) {
				if(result === false) return false;
				if(result === '') {
					swal.showInputError('You need to write something!');
					return false
				} else if(result.length < 6) {
					swal.showInputError('Your Password should be more than 6 characters long.');
					return false
				}

				var editedUser = {
					password: result
				}

				ParseFactory.provider('_User/').edit(Parse.User.current().id, editedUser).success(function(data) {
					$scope.refreshUser();
					$mdDialog.show(
		                $mdDialog.alert()
		                    .title('Done')
		                    .textContent('Your new password has been saved')
		                    .ariaLabel('success')
		                    .ok('OK')
		            );
				}).error(function(error) {
					$mdDialog.show(
		                $mdDialog.alert()
		                    .title('Error')
		                    .textContent(error.message)
		                    .ariaLabel('error')
		                    .ok('OK')
		            );
				});

			}, function() {

			});
		}

		$scope.resendEmailVerification = function(user) {
			var emailStore = user.email;
			Parse.User.current().set('email', 'change' + emailStore);

			Parse.User.current().save().then(function() {
				Parse.User.current().set('email', emailStore);

				Parse.User.current().save().then(function(result) {
					$mdDialog.show(
						$mdDialog.alert()
							.clickOutsideToClose(true)
							.title('Done')
							.textContent('verification email sent to ' + result.attributes.email)
							.ariaLabel('success')
							.ok('OK')
					);
				});
			})

		};
		$scope.refreshUser();
	});
