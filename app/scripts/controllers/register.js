'use strict';

/**
 * @ngdoc function
 * @name rehabGuruWebApp20App.controller:RegisterCtrl
 * @description
 * # RegisterCtrl
 * Controller of the rehabGuruWebApp20App
 */
angular.module('rehabGuruWebApp20App')
    .controller('RegisterCtrl', function($mdDialog, $scope, $rootScope, Idle, UserService, $state) {
        UserService.init();
        $scope.register = function() {
            var registerUser = function() {
                UserService.createUser($scope.creds).then(function(_data) {
                    $scope.user = _data;
                    console.log('Success Creating User Account ');
                    
                    // Start watching for idleness
                    Idle.watch();
                    
                    $state.go('account', {});
                   
                }, function(_error) {
                    $mdDialog.show(
                        $mdDialog.alert()
                            .title('Error')
                            .textContent(_error.message)
                            .ariaLabel('error')
                            .ok('OK')
                    );
                    console.log('Error Creating User Account ' + _error.debug)
                });
            }

            var checkString = '@mod.uk';

            if ($scope.creds.email.indexOf(checkString) > -1) {
                var confirm = $mdDialog.confirm()
                    .title('MOD License!')
                    .textContent('<p>You\'re signing as an MoD user, this means you\'re bound by the both MOD and Rehab Guru user policies.</p><br /><p><small>You may use this service for MoD patients only! Sending volume is monitored, anyone found to be using the system for private practice or personal gain will face disciplinary action.</small></p>')
                    .ok('Agree, register')
                    .cancel('No, cancel');
                $mdDialog.show(confirm).then(function() {
                    registerUser();
                }, function() {
                    $mdDialog.show(
                        $mdDialog.alert()
                            .title('Cancelled')
                            .textContent('no problem, signup when you\'re ready')
                            .ariaLabel('error')
                            .ok('OK')
                    );
                });
            } else {
                registerUser();
            }

        }

        var subscribe = function() {
            Parse.Cloud.run('SubscribeUserToMailingList', {
                    email: $scope.user.email.toLowerCase(),
                    mergevars: {
                        FNAME: $scope.user.firstName,
                        LNAME: $scope.user.lastName
                    }
                })
                .then(function(success) {
                        console.log('Successfully subscribed');
                        // ...
                    },
                    function(error) {
                        console.log('Unable to subscribe');
                        // ...
                    });
        };
        $scope.cancel = function() {
            $state.go('login', {});
        }

    }); //end of controller
