'use strict';
// Parse.initialize('1TvUIjcdYSCen0LO6MpUU6buaQENVVLdC5q9u0pt', 'uHE7vl87JWWAzBRzEqcUbgcZRp4LqsREcRZQ6AfI');
/**
 * @ngdoc overview
 * @name rehabGuruWebApp20App
 * @description
 * # rehabGuruWebApp20App
 *
 * Main module of the application.
 */
angular
	.module('rehabGuruWebApp20App', [
		'ngAnimate',
		'ngAria',
		'ngCookies',
		'ngMessages',
		'ngResource',
		'ngRoute',
		'ngSanitize',
		'ui.router',
		'ngAnimate',
		'ngStorage',
		'angular-loading-bar',
		'angularjs-dropdown-multiselect',
		'oitozero.ngSweetAlert',
		'angular-sortable-view',
		'underscore',
		'ui.select',
		'uiSwitch',
		'angularPayments',
		'base64',
		'ngIdle',
		'darthwade.dwLoading',
		'ngMaterial',
		'material.components.expansionPanels',
		'mdColorPicker',
		'cropme',
		'ngFileUpload'
	])

.value('ParseConfiguration', {
	serverURL: 'https://api.rehabguru.com/1',
	applicationId: '1TvUIjcdYSCen0LO6MpUU6buaQENVVLdC5q9u0pt',
	siteURL: 'https://beta.rehabguru.com'
})


.config(function($mdIconProvider, $stateProvider, $urlRouterProvider, $httpProvider, $locationProvider, $mdGestureProvider, $mdThemingProvider, IdleProvider, KeepaliveProvider, $qProvider) {

	// $qProvider.errorOnUnhandledRejections(false);
	$locationProvider.hashPrefix('');

	$mdThemingProvider.definePalette('myBluePalette', $mdThemingProvider.extendPalette('light-blue', {
		'400': '2B3D51',
		'contrastDefaultColor': 'light', // whether, by default, text (contrast)
		// on this palette should be dark or light
		'contrastDarkColors': ['50', '100', //hues which contrast should be 'dark' by default
			'200', '300', 'A100'
		],
		'contrastLightColors': undefined
	}));

	$mdThemingProvider.definePalette('myOrangePalette', $mdThemingProvider.extendPalette('orange', {
		'500': 'F6841F',
		'contrastDefaultColor': 'light', // whether, by default, text (contrast)
		// on this palette should be dark or light
		'contrastDarkColors': ['50', '100', //hues which contrast should be 'dark' by default
			'200', '300', 'A100'
		],
		'contrastLightColors': undefined
	}));
	$mdThemingProvider.theme('default')
		.primaryPalette('myOrangePalette', { //#ff8201
			'default': '500', // by default use shade 400 from the pink palette for primary intentions
			'hue-1': '50', // use shade 100 for the <code>md-hue-1</code> class
			'hue-2': '600', // use shade 600 for the <code>md-hue-2</code> class
			'hue-3': 'A100' // use shade A100 for the <code>md-hue-3</code> class
		})
		// If you specify less than all of the keys, it will inherit from the
		// default shades
		.accentPalette('myBluePalette', {
			'default': '400' // use shade 200 for default, and keep all other shades the same
		})
		.backgroundPalette('grey', {
			'default': '50'
		});

	$mdGestureProvider.skipClickHijack();

	IdleProvider.idle(600); // in seconds
	IdleProvider.timeout(10); // in seconds
	KeepaliveProvider.interval(2); // in seconds
	$urlRouterProvider.otherwise('program');
	$stateProvider

		.state('account', {
		url: '/account',
		templateUrl: 'views/account.html',
		controller: 'AccountCtrl',
		resolve: {
			user: function(UserService) {
				var value = UserService.init();
				return value;
			}
		}

	})

	.state('clients', {
		url: '/clients',
		templateUrl: 'views/clients.html',
		controller: 'ClientsCtrl',
		resolve: {
			user: function(UserService) {
				var value = UserService.init();
				return value;
			}
		}

	})

	.state('exercise', {
		url: '/exercise',
		templateUrl: 'views/exercise.html',
		controller: 'ExerciseCtrl',
		resolve: {
			user: function(UserService) {
				var value = UserService.init();
				return value;
			}
		}

	})

	.state('program', {
		url: '/program',
		templateUrl: 'views/program.html',
		controller: 'ProgramCtrl',
		resolve: {
			user: function(UserService) {
				var value = UserService.init();
				return value;
			}
		}

	})

	.state('programmesettings', {
		url: '/programmesettings',
		templateUrl: 'views/programmesettings.html',
		controller: 'ProgrammeSettingsCtrl',
		resolve: {
			user: function(UserService) {
				var value = UserService.init();
				return value;
			}
		}

	})

	.state('programmeschedule', {
		url: '/programmeschedule',
		templateUrl: 'views/programmeschedule.html',
		controller: 'ProgrammeScheduleCtrl',
		resolve: {
			user: function(UserService) {
				var value = UserService.init();
				return value;
			}
		}

	})

	.state('programmepreview', {
		url: '/programmepreview',
		templateUrl: 'views/programmepreview.html',
		controller: 'ProgrammePreviewCtrl',
		resolve: {
			user: function(UserService) {
				var value = UserService.init();
				return value;
			}
		}

	})

	.state('publish', {
		url: '/publish',
		templateUrl: 'views/publish.html',
		controller: 'PublishCtrl',
		resolve: {
			user: function(UserService) {
				var value = UserService.init();
				return value;
			}
		}

	})

	.state('clientDetails', {
		url: '/clientDetails',
		templateUrl: 'views/clientdetails.html',
		controller: 'ClientDetailsCtrl',
		resolve: {
			user: function(UserService) {
				var value = UserService.init();
				return value;
			}
		}

	})

	.state('publisher', {
		url: '/publisher',
		templateUrl: 'views/publisher.html',
		controller: 'PublisherCtrl',
		resolve: {
			user: function(UserService) {
				var value = UserService.init();
				return value;
			}
		}

	})

	.state('sharing', {
		url: '/sharing',
		templateUrl: 'views/sharing.html',
		controller: 'SharingCtrl',
		resolve: {
			user: function(UserService) {
				var value = UserService.init();
				return value;
			}
		}
	})

	.state('subscription', {
		url: '/subscription',
		templateUrl: 'views/subscription.html',
		controller: 'SubscriptionCtrl',
		params: {
			fromCallback: null
		},
		resolve: {
			user: function(UserService) {
				var value = UserService.init();
				return value;
			}
		}
	})

	.state('customise', {
		url: '/customise',
		templateUrl: 'views/customise.html',
		controller: 'CustomiseCtrl',
		params: {
			fromCallback: null
		},
		resolve: {
			user: function(UserService) {
				var value = UserService.init();
				return value;
			}
		}
	})

	.state('login', {
		url: '/login',
		templateUrl: 'views/login.html',
		controller: 'LoginCtrl'
	})

	.state('register', {
		url: '/register',
		templateUrl: 'views/register.html',
		controller: 'RegisterCtrl'
	})
})

.run(function($rootScope, $state, UserService, LinkFactory, $window, Idle, $mdDialog, SweetAlert, $localStorage) {
	FastClick.attach(document.body);

	$rootScope.subHeaderLinks = LinkFactory.subHeaderLinks();
	$rootScope.accountSubHeaderLinks = LinkFactory.accountSubHeaderLinks();

	$rootScope.$on('$stateChangeError',
		function(event, toState, toParams, fromState, fromParams, error) {

			$rootScope.linkTarget = toState.name;

			console.log($rootScope.linkTarget);

			console.log('$stateChangeError ' + error && (error.debug || error.message || error));

			if(error && error.error === "noUser") {
				event.preventDefault();

				$state.go('login', {});
			}
		});

	$rootScope.events = [];

	Idle.watch();

	$rootScope.$on('IdleWarn', function(e, countdown) {
		console.log(countdown);
		if(Parse.User.current()) {
			SweetAlert.swal({
				title: "Inactive Session",
				text: "You have been inactive for 10 minutes and will be logged out in " + countdown + " seconds for security",
				type: "warning",
				showCancelButton: false,
				confirmButtonColor: "#DD6B55",
				confirmButtonText: "Stay Logged In",
			});
		}

	});

	$rootScope.$on('IdleTimeout', function() {
		if(Parse.User.current()) {
			UserService.logout().then(function(_response) {
				$state.go('login');
				SweetAlert.swal("You have been logged out");

			}, function(_error) {
				console.log("error logging out " + _error.debug);
			})
		}
	});
});
