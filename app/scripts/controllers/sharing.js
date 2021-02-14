'use strict';

/**
 * @ngdoc function
 * @name rehabGuruWebApp20App.controller:SubscriptionCtrl
 * @description
 * # SubscriptionCtrl
 * Controller of the rehabGuruWebApp20App
 */
angular.module('rehabGuruWebApp20App')
	.controller('SharingCtrl', function($mdDialog, $scope, $rootScope, $http, UserService, $loading, $stateParams, cfpLoadingBar, userSubscriptionCheck, $q, $state) {

		// variables
		$scope.currentSubscriptions = Parse.User.current().attributes.programmeSubscriptions || [];
		$scope.currentNavItem = 'account';
		$scope.currentSubNavItem = "Sharing";

		var userAccess = userSubscriptionCheck.checkUser().then(function(userAccess) {
			if(userAccess === 'free') {
				$scope.userAccess = userAccess;
			}
		})

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
					emailVerified: user.attributes.emailVerified,
					shareKey: user.attributes.shareKey,
					currentSubscriptions: user.attributes.programmeSubscriptions
				};
				$loading.finish('loadAccount');
				$scope.$apply();
			});

			var userAccess = userSubscriptionCheck.checkUser().then(function(userAccess) {
				$scope.currentPlan = userAccess;
			});
		};

		$scope.refreshUser();

		$scope.turnOnSharing = function() {
			$loading.start('loadAccount');
			Parse.User.current().fetch()
				.then(function(user) {
					if(user.attributes.shareKey) {
						alert('Already sharing');
					} else {
						Parse.Cloud.run('GenerateShareKey', {})
							.then(function(result) {
								$loading.finish('loadAccount');
								$scope.user.shareKey = result;

							}, function(error) {
								$loading.finish('loadAccount')
							});
					}
				})
		}


		$scope.subscriptionObject = {
			feedId: '',
			niceName: ''
		}

		$scope.subscribeToFeed = function(subscriptionObject) {
			if(subscriptionObject.feedId.length === 0 || subscriptionObject.niceName.length === 0) {
				alert('please complete both input boxes');
				return
			}

			var saveObject = {
				"feedId": subscriptionObject.feedId,
				"niceName": subscriptionObject.niceName
			}
			$loading.start('loadAccount');
			Parse.User.current().fetch()
				.then(function(user) {
					user.addUnique("programmeSubscriptions", saveObject);
					user.save(null, {
						success: function(results) {
							$scope.currentSubscriptions = Parse.User.current().attributes.programmeSubscriptions;
							$loading.finish('loadAccount');
						},
						error: function(error) {
							$loading.finish('loadAccount');
						}
					})
					$mdDialog.show(
						$mdDialog.alert()
						.title('Subscribe')
						.textContent('sharekey added, shared templates  will now be available in the templates page')
						.ariaLabel('success')
						.ok('OK')
					);
					$scope.subscriptionObject = {
						feedId: '',
						niceName: ''
					}
				});
		}

		$scope.removeSubscription = function(removeObject, index) {
			$loading.start('loadAccount');
			var user = Parse.User.current();
			user.remove("programmeSubscriptions", removeObject);
			user.save(null, {
				success: function(result) {
					$scope.currentSubscriptions.splice(index, 1);
					$loading.finish('loadAccount');
				},
				error: function(error) {
					$loading.finish('loadAccount');
				}
			})

		}

		$scope.getAbbr = function(input) {
			// return input.match(/[A-Z]/g).join('');
			var result = input.replace(/(\w)\w*\W*/g, function (_, i) {
			    return i.toUpperCase();
			  }
			)
			return result;
		}
	});
