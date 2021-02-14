'use strict';

/**
 * @ngdoc function
 * @name rehabGuruWebApp20App.controller:CustomiseCtrl
 * @description
 * # CustomiseCtrl
 * Controller of the rehabGuruWebApp20App
 */
angular.module('rehabGuruWebApp20App')
	.controller('CustomiseCtrl', function($mdDialog, $scope, $rootScope, $http, ParseConfiguration, $loading, UserService, $stateParams, cfpLoadingBar, userSubscriptionCheck, $q, $state, $mdMedia, ParseFactory, Upload, $timeout) {
		var ctrl = this;

		/*
			Variable Declaration & Defacult Var settings
		 */
		$scope.currentNavItem = 'account';
		$scope.currentSubNavItem = "Customise";
		$scope.$mdMedia = $mdMedia;
		var previousLogo = '';
		const Logo_Image_Max_File_Size = 1048576; // Max allowed size is 1 MB 

		$scope.customSettings = {};
		$scope.primaryColor = {};
		$scope.secondaryColor = {};
		$scope.hyperLinkColor = {};

		var colorPickerConf = {
			hasBackdrop: true,
			clickOutsideToClose: true,
			openOnInput: true,
			alphaChannel: false,
			history: false,
			defaultTab: 0
		}

		/*
			Set default conf options for color picker 
		 */
		$scope.primaryColor.options = colorPickerConf;
		$scope.secondaryColor.options = colorPickerConf;
		$scope.hyperLinkColor.options = colorPickerConf;


		/**
		 * This method is used for initialize the default configuration or set template 
		 * configuration if user has saved it previously
		 * @param  {object} objCustomTemplateSettings - Contains previously saved template custom conf
		 */
		function initCustomTemplateSettings(objCustomTemplateSettings) {

			$scope.selectedGradientBox = objCustomTemplateSettings.selectedGradientBox || '';
			// TODO : Have to ask simon for provide same default image as screenshot
			$scope.selectedLogo = objCustomTemplateSettings.selectedLogoUrl || '/images/rehabgurulogo.png';

			// Maintaining previous logo image value to identify whether user has done any changes 
			// for selectedLogo model to avoid un-necessary upload.
			previousLogo = $scope.selectedLogo;

			/*
				@Set default color in respective color picker
				Note: If we set default color in options then HEX tab is not selected by default 
					  which giving bad ux to user. This is bug in plugin iteself.
			 */
			$scope.customSettings.primaryColor = objCustomTemplateSettings.primaryColor || '#ff8201';
			$scope.customSettings.secondaryColor = objCustomTemplateSettings.secondaryColor || '#ffab00';
			$scope.customSettings.hyperLinkColor = objCustomTemplateSettings.hyperLinkColor || '#0091ff';

			$scope.customSettings.headerGradient = objCustomTemplateSettings.isGradientHeaderAllowed || false;

			// Set default primary color into headerBackground 
			$scope.headerBackground = {
				background: $scope.customSettings.primaryColor
			};
			$scope.hrefColor = {
				color: $scope.customSettings.hyperLinkColor
			};


			// Initialize gradient color box based on default value of primary color & secondary color
			setGradientColorToBox($scope.customSettings.primaryColor, $scope.customSettings.secondaryColor);

		}


		/**
		 * Update gradient color box when user modify primary color or secondary color
		 */
		$scope.updateGradient = function() {
			setGradientColorToBox($scope.customSettings.primaryColor, $scope.customSettings.secondaryColor);

			// If header gradient is enabled then set selected gradient
			if ($scope.customSettings.headerGradient && $scope.selectedGradientBox) {
				updatePreviewHeader();
			} else {
				$scope.headerBackground = {
					background: $scope.customSettings.primaryColor
				};
			}
		}


		/**
		 *	Select Gradient box and update preview header background 
		 */
		$scope.selectGradient = function(type) {
			// Make sure user has enable header gradient
			if ($scope.customSettings.headerGradient) {
				$scope.selectedGradientBox = type;

				updatePreviewHeader();
			}
		}

		/**
		 *	Apply primary color to preview header when user has disable Gradient header
		 */
		$scope.updateHeaderGradient = function(isHeaderGradientEnable) {
			if (isHeaderGradientEnable === false) {
				$scope.headerBackground = {
					background: $scope.customSettings.primaryColor
				};
				$scope.selectedGradientBox = '';
			}
		}

		/**
		 *	Update all href color in preview container when hyperlink color change 
		 */
		$scope.onHyperLinkColorChange = function() {
			$scope.hrefColor = {
				color: $scope.customSettings.hyperLinkColor
			};
		}

		$scope.removeLogoImage = function() {
			$scope.selectedLogo = '';
		}


		$scope.saveCustomSettings = function() {
			$loading.start('saveSettings');
			var logoName = !!$scope.logoImgFile ? $scope.logoImgFile.name : '';
			var settingsObject = {
				primaryColor: $scope.customSettings.primaryColor,
				secondaryColor: $scope.customSettings.secondaryColor,
				hyperLinkColor: $scope.customSettings.hyperLinkColor,
				isGradientHeaderAllowed: $scope.customSettings.headerGradient,
				selectedLogoUrl: $scope.selectedLogo,
				selectedGradientBox: $scope.selectedGradientBox
			}

			if (previousLogo !== $scope.selectedLogo && logoName) { // User has done some changes in logo image
				// Upload image first to parse then get image url and then make save user custom settings
				var parseFile = new Parse.File(logoName, {
					base64: $scope.selectedLogo
				});
				parseFile.save().then(function(data) {
					// The file has been saved to Parse.
					settingsObject["selectedLogoUrl"] = data._url;
					$scope.selectedLogo = data._url;
					previousLogo = data._url;
					saveUserCustomSettings(settingsObject);
				}, function(error) {
					// The file either could not be read, or could not be saved to Parse.
					console.log(error);
				});
			} else {
				saveUserCustomSettings(settingsObject);
			}

			function saveUserCustomSettings(settings) {
				var config = $scope.user.config || {};
				config["customPageTemplateSettings"] = settings;
				ParseFactory.provider('_User/').edit(Parse.User.current().id, {
					config: config
				}).then(function(data) {
					$mdDialog.show(
						$mdDialog.alert()
						.title('Saved')
						.textContent('Template settings saved successfully.')
						.ariaLabel('success')
						.ok('OK')
					);

					// Set default image when user removed the image and saved the settings
					$scope.selectedLogo = $scope.selectedLogo || '/images/rehabgurulogo.png';
					$loading.finish('saveSettings');
				}, function(error) {
					$mdDialog.show(
						$mdDialog.alert()
						.title('Error')
						.textContent(error.message)
						.ariaLabel('error')
						.ok('OK')
					);
					$loading.finish('saveSettings');
				});
			}
		}


		/**
		 *	Watch logoImgFile model for logo image selection/drop upload, 
		 */
		$scope.$watch('logoImgFile', function() {

			// Make sure logoImgFile is defined properly in-order to call onLogoImageSelected handler
			// First time logoImgFile would be undefined (On first controller run)
			if (!!$scope.logoImgFile) {

				if ($scope.logoImgFile.size > Logo_Image_Max_File_Size) {
					$mdDialog.show(
						$mdDialog.alert()
						.title('Error')
						.textContent('Uploading more then 1 MB image size is not allowed!')
						.ariaLabel('Error')
						.ok('OK')
					);
				} else {
					onLogoImageSelected();
				}

			}
		});


		/**
		 * This method is used to set gradient box based on user selection of primary color and secondary color
		 * @param primaryColor - User selected Primary color 
		 * @param secondaryColor - User selected Secondary color  
		 */
		function setGradientColorToBox(primaryColor, secondaryColor) {

			$scope.gradientRedial = {
				background: primaryColor,
				/* For browsers that do not support gradients */
				background: '-webkit-radial-gradient(circle,' + primaryColor + "," + secondaryColor + ")",
				/* Safari */
				background: '-o-radial-gradient(circle,' + primaryColor + "," + secondaryColor + ")",
				/* Opera 11.6 to 12.0 */
				background: '-moz-radial-gradient(circle,' + primaryColor + "," + secondaryColor + ")",
				/* Firefox 3.6 to 15 */
				background: 'radial-gradient(circle,' + primaryColor + "," + secondaryColor + ")" /* Standard syntax */
			};

			$scope.gradientLeftToRight = {
				background: primaryColor,
				/* For browsers that do not support gradients */
				background: '-webkit-linear-gradient(right,' + primaryColor + "," + secondaryColor + ")",
				/* Safari */
				background: '-o-linear-gradient(right,' + primaryColor + "," + secondaryColor + ")",
				/* Opera 11.6 to 12.0 */
				background: '-moz-linear-gradient(right,' + primaryColor + "," + secondaryColor + ")",
				/* Firefox 3.6 to 15 */
				background: 'linear-gradient(to right,' + primaryColor + "," + secondaryColor + ")" /* Standard syntax */
			};

			$scope.gradientRightToLeft = {
				background: primaryColor,
				/* For browsers that do not support gradients */
				background: '-webkit-linear-gradient(left,' + primaryColor + "," + secondaryColor + ")",
				/* Safari */
				background: '-o-linear-gradient(left,' + primaryColor + "," + secondaryColor + ")",
				/* Opera 11.6 to 12.0 */
				background: '-moz-linear-gradient(left,' + primaryColor + "," + secondaryColor + ")",
				/* Firefox 3.6 to 15 */
				background: 'linear-gradient(to left,' + primaryColor + "," + secondaryColor + ")" /* Standard syntax */
			};
		}

		function updatePreviewHeader() {
			switch ($scope.selectedGradientBox) {
				case 'linearLR':
					$scope.headerBackground = $scope.gradientLeftToRight;
					break;
				case 'redial':
					$scope.headerBackground = $scope.gradientRedial;
					break;
				case 'linearRL':
					$scope.headerBackground = $scope.gradientRightToLeft;
					break;
				default:
					$scope.headerBackground = {
						background: $scope.customSettings.primaryColor
					};
			}
		}

		/**
		 * This method is responsible to show crop image modal
		 */
		function onLogoImageSelected() {
			$mdDialog.show({
				locals: {
					parentScope: $scope
				},
				controller: function($scope, $mdDialog, parentScope) {

					$scope.data = parentScope;
					$scope.croppedImgUrl = '';

					/*
						Set cropper default option here
					 */
					var options = {
						aspectRatio: 16 / 9
					};

					/*
						This method is used to instantiate cropper instance 
						so that Cropper can render and set initial configuration
						over Image, As we have to detect the element render first 
						in order to do this we have created a directive elemReady
					 */
					$scope.initCroper = function() {
						var image = document.getElementById('previewImage');
						// Add load event listent to detect image upload so that 
						// cropeer instantiation can happen successfully
						image.addEventListener('load', function() {
							$scope.cropper = new Cropper(image, options);
						});
					}
					
					/**
					 * Handel zoomIn and ZoomOut function 
					 * @param  {string} byRatio for zoomIn vaule would be 0.1 and for zoomOut -0.1
					 * NOTE: We can also increase the fraction of zoomIn or zoomOut just increase value
					 *       handelZoom parameter from html
					 */
					$scope.handelZoom = function(byRatio){
						$scope.cropper["zoom"](byRatio);
					}



					$scope.cancel = function() {
						$mdDialog.cancel();
					};

					$scope.doneCroping = function() {
						/*
							As we are saving data into Parse in base64 format so we have to query 
							cropper instance getCroppedCanvas method to get data in base64 format
						 */
						$scope.croppedImgUrl = $scope.cropper.getCroppedCanvas().toDataURL('image/png');
						$mdDialog.hide($scope.croppedImgUrl);
					};
				},
				controllerAs: 'ctrl',
				templateUrl: 'views/modals/imageCrop.html',
				parent: angular.element(document.body),
				clickOutsideToClose: true
			}).then(function(cropImageUrl) {
				$scope.selectedLogo = cropImageUrl;
			}).catch(function() {
				// User has cancel cropping so just set previous logo
				$scope.selectedLogo = previousLogo;
			});
		}

		ctrl.data = {
				upload: []
			} // <= upload data get pushed here

		$scope.refreshUser = function() {

			$loading.start('loadAccount');

			return Parse.User.current().fetch()
				.then(function(user) {
					var customPageTemplateSettings = {}; // Will hold template settings
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

					// Check whether customPageTemplateSettings exist or not if not set empty
					// object so that default configuration set for template settings
					customPageTemplateSettings = !!$scope.user.config ? $scope.user.config.customPageTemplateSettings || {} : {};
					initCustomTemplateSettings(customPageTemplateSettings)
					$scope.$apply();

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
			if (Parse.User.current()) {
				$scope.refreshUser().then(function() {
					if ($stateParams.fromCallback) {
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
	}).directive('elemReady', function($parse) {
		return {
			restrict: 'A',
			link: function($scope, elem, attrs) {
				elem.ready(function() {
					$scope.$apply(function() {
						var func = $parse(attrs.elemReady);
						func($scope);
					})
				})
			}
		}
	});