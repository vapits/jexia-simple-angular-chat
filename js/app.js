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

.config(function($routeProvider, $locationProvider, $httpProvider) {

	// If token or credentials are wrong in any request then 
	// send user to login page
	$httpProvider.interceptors.push(['$q', '$location', function($q, $location) {
        return {
            'responseError': function(response) {
                if (response.status === 403) {
                    localStorage.removeItem('username');
					localStorage.removeItem('userId');
					localStorage.removeItem('token');
                    $location.path('/login');
                }

                return $q.reject(response);
            }
        };
    }]);
	
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
