'use strict';

/**
 * @ngdoc function
 * @name rehabGuruWebApp20App.controller:ClientsCtrl
 * @description
 * # ClientsCtrl
 * Controller of the rehabGuruWebApp20App
 */
angular.module('rehabGuruWebApp20App')

.controller('ClientsCtrl', function($mdSidenav, $scope, ParseFactory, $localStorage, $loading, ClientFactory, userSubscriptionCheck, $state, $mdDialog, $log) {

	$scope.$storage = $localStorage;
	$scope.currentNavItem = "clients";
	$scope.currentPage = 1;
	$scope.prevPage = 0;
	$scope.nextPage = 0;
	$scope.maxPages = 1;
	$scope.colors = ['#FF2851', '#FF9600','#FF3824', '#8DC73F', '#FFCD00', '#007A85', '#7B2B82'];
	function loadClients() {

		$localStorage.Clients = [];

		if(Parse.User.current()) {
			var query = {
				'userId': Parse.User.current().id
			};
			$loading.start('loadClients');
			ParseFactory.provider('Clients', query).getAll().then(function(rtnDta) {
				var data = rtnDta.data;
				if(data.results) {
					$localStorage.Clients = data.results;
					$scope.Clients = data.results;
					$scope.maxPages = parseInt(($scope.Clients.length - 1) / 7) + 1;
					if ($scope.Clients.length == 0) {
						$scope.maxPages = 1;
					}
					$scope.updatePages();
				} else {
					$localStorage.Clients = [];
					$scope.Clients = $localStorage.Clients;
				}
				$loading.finish('loadClients');
			}).then(function(response) {
				console.log(response);
				$loading.finish('loadClients');
			});
		}
	}

	loadClients();
	$scope.next = function() {
		if ($scope.nextPage > 0) {
			$scope.currentPage = $scope.nextPage;
		}
		$scope.updatePages();
	}
	$scope.prev = function() {
		if ($scope.prevPage > 0) {
			$scope.currentPage = $scope.prevPage;
		}
		$scope.updatePages();
	}
	$scope.selectClient = function(client) {
		$localStorage.Client = client;
	}
	$scope.updatePages = function() {
		$scope.maxPages = parseInt(($scope.Clients.length - 1) / 7) + 1;
		if ($scope.Clients.length == 0) {
			$scope.maxPages = 1;
		}
		if ($scope.maxPages > $scope.currentPage) {
			$scope.nextPage = $scope.currentPage + 1
		} else {
			$scope.nextPage = 0;
		}
		if ($scope.currentPage > 1) {
			$scope.prevPage = $scope.currentPage - 1;
		} else {
			$scope.prevPage = 0;
		}
		$scope.ClientsResult = [];
		var start = $scope.prevPage * 7;
		var last = $scope.currentPage * 7;
		if (last >= $scope.Clients.length) {
			last = $scope.Clients.length;
		}
		for (var i = start; i < last; i++) {
			$scope.ClientsResult.push($scope.Clients[i]);
		}
	}

	$scope.viewClient = function(client) {
		$localStorage.Client = client;
		$state.go('clientDetails');
	}
	$scope.cancel = function() {
		$mdDialog.hide();
	}


	$scope.createClient = function() {

		var userAccess = userSubscriptionCheck.checkUser().then(function(userAccess) {
			console.log(userAccess);

			function checkUserAccess(status) {
				switch(status) {
					case 'mod':
						return true
						break;
					case 'paid':
						return true
						break;
					default:
						return false;
				}
			}
			if(!checkUserAccess(userAccess)) {
				var confirm = $mdDialog.confirm()
					.title('Subscription Required')
					.textContent('To create more than 6 clients you must be a Rehab Guru Pro Member')
					.ok('Sign Up')
					.cancel('Cancel');

				$mdDialog.show(confirm).then(function() {
					$state.go('subscription');
				}, function() {
					return false
				});
			} else {
				$scope.openAddClient();
			}
		});
	};
	$scope.cancel = function() {
		$mdDialog.hide();
		console.log(this);
	}
	$scope.saveClient = function(user) {
		if(!user) {
			$mdDialog.show(
				$mdDialog.alert()
				.title('Error')
				.textContent('Please ensure you have entered all details')
				.ariaLabel('error')
				.ok('OK')
			);
		} else if(user.name === undefined) {
			$mdDialog.show(
				$mdDialog.alert()
				.title('Error')
				.textContent('Please ensure you have entered a Client Name')
				.ariaLabel('error')
				.ok('OK')
			);
		} else if(user.email === undefined) {
			$mdDialog.show(
				$mdDialog.alert()
				.title('Error')
				.textContent('Please ensure you have entered all details')
				.ariaLabel('error')
				.ok('OK')
			);
		} else {
			ClientFactory.addClient(user);
			$mdDialog.hide();
			$timeout(function() {
				loadClients();
			}, 300);
		}
	}
	$scope.openAddClient = function() {
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


	$scope.searchClients = function(term) {
		console.log(term);
		if(term != '') {
			var options = {
				shouldSort: true,
				threshold: 0.4,
				location: 0,
				distance: 100,
				maxPatternLength: 32,
				keys: [
					"name"
				]
			};
			var fuse = new Fuse($localStorage.Clients, options); // "list" is the item array
			$scope.Clients = fuse.search(term);
		} else {
			console.log("empty");
			console.log($localStorage.Clients);
			$scope.Clients = $localStorage.Clients;
		}
		$scope.updatePages();
		$scope.currentPage = 1;
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