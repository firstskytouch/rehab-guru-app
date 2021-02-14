/**
    * @ngdoc directive
    * @name rehabGuruWebApp20App:gradientStyle
    * @restrict A
    * @description -  This directive is used for add gradient style on gradint box
    * @example  - <div class="gradient-box selected" customstyle="{{gradientLeftToRight}}">
**/ 
(function() {
    'use strict';

    angular
        .module('rehabGuruWebApp20App')
        .directive('customstyle', customstyle);

    customstyle.$inject = [];

    function customstyle () {
	    return function(scope, element, attrs){
	        attrs.$observe('customstyle', function(style) {
	   			if(style){ // Makes sure style is not empty
	   				element.css(JSON.parse(style));
	   			}
	        });
	    };
    }
})();

