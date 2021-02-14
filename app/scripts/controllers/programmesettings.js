'use strict';

/**
 * @ngdoc function
 * @name rehabGuruWebApp20App.controller:ProgrammesettingsCtrl
 * @description
 * # ProgrammesettingsCtrl
 * Controller of the rehabGuruWebApp20App
 */
angular.module('rehabGuruWebApp20App')
    .controller('ProgrammeSettingsCtrl', function($mdDialog, $scope, $localStorage, $filter, ParseFactory) {
        // $scope.subHeaderLinks = LinkFactory.subHeaderLinks();
        $scope.$storage = $localStorage;
        $scope.isNumber = angular.isNumber;
        $scope.currentNavItem = "program";
        $scope.currentSubNavItem = "Settings";
        $scope.exercise = null;
        $scope.moveableIndex = -1;
        $scope.whatClassIsIt= function(index) {
            if(index==$scope.moveableIndex) {
                return 'show-handle';
            } else {
                return 'hidden-handle'
            }
        }
        $scope.changeIndex = function(event, index) {
            if (event.buttons > 0) {
                return;
            }
            $scope.moveableIndex=index;
        }
        if ($localStorage.Programme.exerciseData.length > 0) {
            $scope.exercise = $localStorage.Programme.exerciseData[0];
            for (var i = 0; i < $localStorage.Programme.exerciseData.length; i++) {
                var exercise = $localStorage.Programme.exerciseData[i];
                exercise.currentImage = 0;
            }
        }
        $scope.selectExcersise = function(exercise) {
            $scope.exercise = exercise;
        }
        $scope.addParam = function(index) {
            console.log(index);
        var confirm = $mdDialog.prompt()
            .title('Parameter')
            .textContent('Enter the name for your parameter')
            .placeholder('Write something')
            .ok('OK')
            .cancel('Cancel');

            $mdDialog.show(confirm).then(function(result) {
                if (result === false) return false;
                if (result === '') {
                    swal.showInputError('You need to write something!');
                    return false
                }
                var param = {
                    param: result,
                    childParam: ''
                }
                $localStorage.Programme.exerciseData[index].Params.push(param)
            }, function() {
                $scope.status = 'You didn\'t name your dog.';
            });
        }
        $scope.removeParam = function(exercise, index) {
            var exerciseIndex = $localStorage.Programme.exerciseData.indexOf(exercise);
            $localStorage.Programme.exerciseData[exerciseIndex].Params.splice(index, 1)
        }

        $scope.deleteExercise = function(exercise) {
            $localStorage.Programme.exerciseData.splice($localStorage.Programme.exerciseData.indexOf(exercise), 1);
            if ($localStorage.Programme.exerciseData.length > 0) {
                $scope.exercise = $localStorage.Programme.exerciseData[0];
                for (var i = 0; i < $localStorage.Programme.exerciseData.length; i++) {
                    var exercise = $localStorage.Programme.exerciseData[i];
                    exercise.currentImage = 0;
                }
            }
        }
        $scope.nextImage = function(exercise) {
            exercise.currentImage ++;
            if (exercise.currentImage >= exercise.images.length) {
                exercise.currentImage = exercise.images.length - 1;
            }
        }
        $scope.prevImage = function(exercise) {
            exercise.currentImage --;
            if (exercise.currentImage < 0) {
                exercise.currentImage = 0;
            }
        }
    });
