'use strict';

/**
 * @ngdoc function
 * @name rehabGuruWebApp20App.controller:SubscriptionCtrl
 * @description
 * # SubscriptionCtrl
 * Controller of the rehabGuruWebApp20App
 */
angular.module('rehabGuruWebApp20App')
	.controller('SubscriptionCtrl', function($mdDialog, $scope, $rootScope, $http, $loading, UserService, $stateParams, cfpLoadingBar, userSubscriptionCheck, $q, $state) {

		console.log($stateParams.sessionToken);
		$scope.currentNavItem = 'account';
		$scope.currentSubNavItem = "Subscription";

		if($stateParams.sessionToken && !Parse.User.current()) {
			Parse.User.become($stateParams.sessionToken).then(function(user) {
				console.log(user);
				$scope.refreshUser();
			}, function(error) {
				console.log(error);
			});
		}

		var getStripeData = function(user) {
			$loading.start('loadAccount');
			var stripeId = user.attributes.stripeCustomerId;
			if(stripeId) {
				return Parse.Cloud.run('getStripeCustomer', {
						stripeId: stripeId
					})
					.then(function(customer) {
						console.log('getStripeData(): ', customer);
						$scope.customer = customer;
						$loading.finish('loadAccount');
						// $scope.$apply();
					}, function(error) {
						console.log(error);
						$mdDialog.show(
							$mdDialog.alert()
							.title('Error')
							.textContent(error.message)
							.ariaLabel('error')
							.ok('OK')
						);
						$loading.finish('loadAccount');
						return null;
					});
			} else {
				console.log('No stripeCustomerId');
				return $q.resolve(null);
			}
		};

		$scope.refreshUser = function() {

			$loading.start('loadAccount');

			return Parse.User.current().fetch()
				.then(function(user) {
					$scope.user = {
						email: user.attributes.email,
						firstName: user.attributes.firstName,
						lastName: user.attributes.lastName,
						config: user.attributes.config || {
							copyPrescription: false
						},
						emailVerified: user.attributes.emailVerified,
						stripeData: user.attributes.stripeSubscriptionObject
					};
					$scope.$apply();
					return getStripeData(user);
				})
				.then(function(customer) {
					return userSubscriptionCheck.checkUser()
				})
				.then(function(userAccess) {
					$loading.finish('loadAccount');
					return $scope.currentPlan = userAccess;
				})
				.fail(function(error) {
					console.log(error);
					$loading.finish('loadAccount');
				});
		};

		var init = function() {
			if(Parse.User.current()) {
				$scope.refreshUser().then(function() {
					if($stateParams.fromCallback) {
						$scope.openCreditCardForm();
					}
				});
			} else {
				$scope.currentPlan = 'free';
			}
		};

		init();
		$scope.hide = function() {
			$mdDialog.hide();
		};

		$scope.openCreditCardForm = function() {
			if(Parse.User.current()) {
				$mdDialog.show({
					locals: {
						thescope: $scope
					},
					controller: function($scope, $mdDialog, thescope) {
						$scope.data = thescope;
						$scope.handleStripe = function(status, response) {
							$scope.data.handleStripe(status, response);
						}
					},
					controllerAs: 'ctrl',
					templateUrl: 'views/modals/addCreditCard.html',
					parent: angular.element(document.body),
				});
			} else {
				$rootScope.linkTarget = $state.current.name;
				$state.go('login', {
					callbackState: 'subscription'
				});
			}
		};

		$scope.handleStripe = function(status, response) {
			console.log('handleStripe');
			$mdDialog.hide();
			var confirm = $mdDialog.confirm()
				.title('Signup to Rehab Guru Pro?')
				.textContent('From this point on you\'ll be charged £10 per month')
				.ariaLabel('info')
				.ok('Signup')
				.cancel('Cancel');
			$mdDialog.show(confirm).then(function() {
				if(response.error) {
					$mdDialog.show(
						$mdDialog.alert()
						.title('Error')
						.textContent(response.error)
						.ariaLabel('error')
						.ok('OK')
					);
				} else {
					// got stripe token, now charge it or smt
					// var token = response.id;

					var stripeDetails = {
						stripeToken: response.id,
					}

					Parse.Cloud.run('stripeSubscription', stripeDetails, {

						// Success handler
						success: function(message) {
							cfpLoadingBar.complete();
							console.log(message);
							$scope.refreshUser();
							addCreditCard.$promise.then(addCreditCard.hide);
							$mdDialog.show(
								$mdDialog.alert()
								.title('Success')
								.textContent('You have successfully signed up for Rehab Guru Pro')
								.ariaLabel('success')
								.ok('OK')
							);	
						},
						// Error handler
						error: function(error) {
							console.log(error);
							$mdDialog.show(
								$mdDialog.alert()
								.title('Error')
								.textContent(error.message)
								.ariaLabel('error')
								.ok('OK')
							);
						}
					});

				}
			}, function() {

			});
		}
	});
