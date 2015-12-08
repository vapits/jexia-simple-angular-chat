angular.module('simpleChat', [
	'ngRoute', 
	'luegg.directives',
	'angularMoment',
	'ui.bootstrap'])

.run(function($rootScope, $http){

	// Let's get the configuration data
	// You can edit them to config.js
	$rootScope.credentials = angular.copy(jexia);

})

.config(function($routeProvider, $locationProvider) {
	
	// Now let's set two simple routes for our views
	// a login page and the chat rooom
	$routeProvider
	.when('/login', {
		templateUrl: 'templates/login.html',
		controller: 'loginCtrl'
	})
	.when('/chat', {
		templateUrl: 'templates/chat.html',
		controller: 'appCtrl'
	})
	.otherwise({redirectTo: '/login'});

});
