'use strict';

/**
 * @ngdoc service
 * @name rehabGuruWebApp20App.factories
 * @description
 * # factories
 * Factory in the rehabGuruWebApp20App.
 */
angular.module('rehabGuruWebApp20App')
	.factory('ParseFactory', ['$http', 'ParseConfiguration', function($http, ParseConfiguration) {

		var baseUrl = ParseConfiguration.serverURL + '/classes/';

		return {
			provider: function(type, query) {
				var masterQuery = {
					'userId': 'sItr5GpAPX'
				};
				return {
					getAll: function() {
						return $http.get(getUrl(type), getParams(query));
					},
					getMasters: function() {
						return $http.get(getUrl(type), getParams(masterQuery));
					},
					get: function(id) {
						return $http.get(getUrl(type) + id, getParams());
					},
					create: function(data) {
						return $http.post(getUrl(type), data, getParams());
					},
					edit: function(id, data) {
						console.log(id, data);
						return $http.put(getUrl(type) + id, data, getParams());
					},
					delete: function(id) {
						return $http.delete(getUrl(type) + id, getParams());
					},
					searchAnalytics: function(data) {
						return $http.post(eventsUrl + 'search', data, getParams());
					},
					registerPush: function(data) {
						return $http.post(installationUrl, data, getParams());
					},
					appOpened: function(data) {
						return $http.post(eventsUrl + 'AppOpened', data, getParams());
					}

				};

				function getUrl(type) {
					return baseUrl + type;
				}

				function getParams(user) {
					if(Parse.User.current()) {
						return {
							timeout: 5000,
							headers: {
								'X-Parse-Application-Id': ParseConfiguration.applicationId,
								// 'X-Parse-REST-API-Key': PARSE_CREDENTIALS.REST_API_KEY,
								'X-Parse-Session-Token': Parse.User.current().getSessionToken(),
								'Content-Type': 'application/json'
							},
							params: {
								where: user,
								limit: 1000

							}
						};
					}
				}
			}
		};
	}])

.factory('ExerciseFactory', function($localStorage, $filter) {
	return {
		cleanExercise: function(exercise) {
			var cleanExercise = {
				exerciseName: exercise.exerciseName,
				images: exercise.images,
				difficulty: exercise.difficulty,
				Params: exercise.Params || [{
					param: 'Sets',
					childParam: '1'
				}, {
					param: 'Reps',
					childParam: '1'
				}],
				exerciseDescription: exercise.exerciseDescription,
				objectID: exercise.objectID,
				tags: exercise.tags
			};
			return cleanExercise;
		},

		scafoldProgramme: function() {
			if(!$localStorage.Programme) {

				var currentDate = $filter('date')(new Date(), 'dd-MMM-yy');

				var programmeScaffold = {
					programmeTitle: currentDate,
					userId: Parse.User.current().id,
					userPointer: {
						'__type': 'Pointer',
						'className': '_User',
						'objectId': Parse.User.current().id
					},
					exerciseData: []
				};

				$localStorage.Programme = programmeScaffold;
				// checkProgramme = true;
			} else if($localStorage.Programme && !$localStorage.Programme.exerciseData) {
				$localStorage.Programme.exerciseData = [];
				// checkProgramme = true;
			} else {
				console.log('LocalStorage Programme Looks Good!');
				// checkProgramme = true;
			}
		},
		clearProgramme: function() {
			var currentDate = $filter('date')(new Date(), 'dd-MMM-yy');

			var programmeScaffold = {
				programmeTitle: currentDate,
				userId: Parse.User.current().id,
				userPointer: {
					"__type": "Pointer",
					"className": "_User",
					"objectId": Parse.User.current().id
				},
				exerciseData: []
			};

			return programmeScaffold;
		}
	};
})

.factory('LinkFactory', function($window) {
	return {

		subHeaderLinks: function() {
			var links = [{
					'linkTitle': 'Templates',
					'linkState': 'program',
					'icon': 'icon_1.svg'
				}, {
					'linkTitle': 'Exercises',
					'linkState': 'exercise',
					'icon': 'stick-man-running-on-a-treadmill.svg'
				}, {
					'linkTitle': 'Settings',
					'linkState': 'programmesettings',
					'icon': 'settings.svg'
				}, {
					'linkTitle': 'Preview',
					'linkState': 'programmepreview',
					'icon': 'preview.svg'
				}, {
					'linkTitle': 'Publish',
					'linkState': 'publish',
					'icon': 'upload-file.svg'
				}
				// , {
				//     'linkTitle': 'Schedule',
				//     'linkState': 'programmeschedule'
				// }
			];
			return links;
		},

		accountSubHeaderLinks: function() {

			var links = [{
				"linkTitle": "Account",
				"linkState": "account",
				'icon': 'key.svg'
			}, {
				"linkTitle": "Subscription",
				"linkState": "subscription",
				'icon': 'invoice.svg'
			}, {
				"linkTitle": "Sharing",
				"linkState": "sharing",
				'icon': 'share.svg'
			}, {
				"linkTitle": "Customise",
				"linkState": "customise",
				'icon': 'settings.svg'
			}]
			return links;
		}
	};
})


.factory('ClientFactory', function($mdDialog, $localStorage, ParseFactory, $rootScope) {

	return {
		addClient: function(client) {

			client.email = client.email.toLowerCase();

			var clientACL = new Parse.ACL(Parse.User.current());
			clientACL.setPublicReadAccess(false);
			client.ACL = clientACL;
			client.userId = Parse.User.current().id;
			ParseFactory.provider('Clients').create(client).success(function(response) {
				client.objectId = response.objectId;
				$mdDialog.show(
					$mdDialog.alert()
						.title('Saved')
						.textContent(client.name + ' saved')
						.ok('OK')
				);
			}).error(function(response) {
				$mdDialog.show(
					$mdDialog.alert()
						.title('Error')
						.textContent(response.error)
						.ok('OK')
				);
			});


		},
		editClient: function(client) {
			ParseFactory.provider('Clients/').edit(client.objectId, client).success(function(data) {
				$mdDialog.show(
					$mdDialog.alert()
						.title('Saved')
						.textContent(client.name + ' saved')
						.ok('OK')
				);
			}).error(function(response) {
				$mdDialog.show(
					$mdDialog.alert()
						.title('Error')
						.textContent(response.error)
						.ok('OK')
				);
			});
		}
	};

})

.service('UserService', ['$q', 'ParseConfiguration',
	function($q, ParseConfiguration) {

		var parseInitialized = false;


		return {

			/**
			 *
			 * @returns {*}
			 */
			init: function() {

				// debugger;
				// if initialized, then return the activeUser
				if(parseInitialized === false) {
					Parse.initialize(ParseConfiguration.applicationId);
					Parse.serverURL = ParseConfiguration.serverURL;
					parseInitialized = true;
				}

				var currentUser = Parse.User.current();
				if(currentUser) {
					return $q.when(currentUser);
				} else {
					return $q.reject({
						error: 'noUser'
					});
				}

			},
			/**
			 *
			 * @param _userParams
			 */
			createUser: function(_userParams) {

				var user = new Parse.User();
				user.set('firstName', _userParams.firstName);
				user.set('lastName', _userParams.lastName);
				user.set('password', _userParams.password);
				user.set('email', _userParams.email.toLowerCase());
				user.set('username', _userParams.email.toLowerCase());
				user.set('platform', {
					'platform': 'Web App'
				});

				// should return a promise
				return user.signUp(null, {});

			},
			/**
			 *
			 * @param _parseInitUser
			 * @returns {Promise}
			 */
			currentUser: function(_parseInitUser) {

				// if there is no user passed in, see if there is already an
				// active user that can be utilized
				_parseInitUser = _parseInitUser ? _parseInitUser : Parse.User.current();

				console.log('_parseInitUser ' + Parse.User.current());
				if(!_parseInitUser) {
					return $q.reject({
						error: 'noUser'
					});
				} else {
					return $q.when(_parseInitUser);
				}
			},
			/**
			 *
			 * @param _user
			 * @param _password
			 * @returns {Promise}
			 */
			login: function(_user, _password) {
				return Parse.User.logIn(_user.toLowerCase(), _password);
			},
			/**
			 *
			 * @returns {Promise}
			 */
			logout: function(_callback) {
				var defered = $q.defer();
				Parse.User.logOut();
				defered.resolve();
				return defered.promise;

			}

		}
	}
])


.factory('userSubscriptionCheck', function($q, $localStorage, $state, $mdDialog) {


	return {

		checkUser: function() {

			var userAccess = "free";

			var deferred = $q.defer();

			if(Parse.User.current()) {

				if(Parse.User.current().attributes.stripeSubscriptionObject && Parse.User.current().attributes.stripeSubscriptionObject.data && Parse.User.current().attributes.stripeSubscriptionObject.data[0]) {
					var userStatus = Parse.User.current().attributes.stripeSubscriptionObject.data[0].status;
				} else {
					userStatus = "free";
				}

				if(Parse.User.current().attributes.username.indexOf('@mod.uk') > -1) {
					userStatus = 'mod';
				}

				switch(userStatus) {
					case "trialing":
						console.log('user is trailing');
						userAccess = "paid";
						deferred.resolve(userAccess);
						break;
					case "active":
						console.log('user is active');
						userAccess = "paid";
						deferred.resolve(userAccess);
						break;
					case "past_due":
						console.log('user is past_due');
						userAccess = "paid";
						deferred.resolve(userAccess);
						break;
					case "cancelled":
						console.log('user is cancelled');
						userAccess = "free";
						deferred.resolve(userAccess);
						break;
					case "unpaid":
						console.log('user is unpaid');
						userAccess = "free";
						deferred.resolve(userAccess);
						break;
					case "mod":
						console.log('user is MOD');
						userAccess = "mod";
						deferred.resolve(userAccess);
						break;
					case "free":
						console.log('user is Free');
						userAccess = "free";
						deferred.resolve(userAccess);
						break;
						// this needs to removed to make the app restricted

						// case undefined:
						//     console.log('App is running in free mode - undefined');
						//     userAccess = "full";
						//     deferred.resolve(userAccess);
						//     break;

						// end of restriction removal
					default:
						console.log('user must be free');
						userAccess = "free";
						deferred.resolve(userAccess);
						break;
				}

				return deferred.promise;
			}
		},
		openPopup: function() {
			var confirm = $mdDialog.confirm()
				.title('Subscription Required')
				.textContent('You must be a Rehab Guru Paid to add unlimited clients, favourites and programs')
				.ok('Sign Up')
				.cancel('Cancel')
			$mdDialog.show(confirm).then(function() {
				$state.go('subscription');
			}, function() {
				return false;
			});
		}
	};
})

.factory('parsePrescriptionFactory', function($http, $localStorage, $rootScope) {
	return {
		prescribeProgramme: function(client) {

			var Prescription = Parse.Object.extend('PrescribedProgrammes');
			var newPrescription = new Prescription();
			var programme = angular.copy($localStorage.Programme);
			var programmeACL = new Parse.ACL(Parse.User.current());

			programmeACL.setPublicReadAccess(true);
			newPrescription.setACL(programmeACL);
			newPrescription.set('prescribedProgrammeTitle', programme.programmeTitle);
			newPrescription.set('programmeId', programme.id);
			newPrescription.set('exerciseData', programme.exerciseData);
			newPrescription.set('clientId', client.objectId);
			newPrescription.set('clientEmail', client.email);
			newPrescription.set('userPointer', {
				__type: "Pointer",
				className: "_User",
				objectId: Parse.User.current().id
			});

			newPrescription.save().then(function(success) {

				var prescription = {
					Email: client.email,
					Name: client.name,
					Message: client.message,
					id: client.objectId,
					ProgrammeId: newPrescription.id,
					exerciseData: programme.exerciseData
				};

				return Parse.Cloud.run('sendUserProgramme', prescription)
					.then(function(success) {
						$localStorage.LastPrescription = newPrescription.id;
					})

			}, function(error) {
				$mdDialog.show(
					$mdDialog.alert()
						.title('Error')
						.textContent(error.message)
						.ok('OK')
				);
			});
		}
	}
});
