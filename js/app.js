angular.module('simpleChat', [
	'ngRoute', 
	'luegg.directives',
	'angularMoment'])

.run(function($rootScope, $http){

	// Let's get the configuration data
	// edit them to config.js
	$rootScope.credentials = angular.copy(jexia);

	$http({
		method: 'POST',
		url: $rootScope.credentials.appUrl,
		data: {
			key: $rootScope.credentials.key,
			secret: $rootScope.credentials.secret
		}
	}).then(function(response){

		// Return Bearer with token to use it in every call
		localStorage.setItem('token', response.data.token);

	}, function(error){
		
		// Log the error message
		console.log(error.data.message);

	});
})

.controller('loginCtrl', [ '$scope', '$rootScope', '$location',
	function($scope, $rootScope, $location) {

		var username = localStorage.getItem('username');
		if (username) {
			$location.path('/chat');
		}

		// Scope with username
		$scope.username = '';

		$scope.login = function () {
			if ($scope.username !== '') {
				localStorage.setItem('username', $scope.username);
				$location.path('/chat');
			}
		};
	
}])

.controller('appCtrl', [ '$scope', '$rootScope', '$http', '$location',
	function($scope, $rootScope, $http, $location) {

		var token = localStorage.getItem('token');
		var username = localStorage.getItem('username');

		// Your Jexia Data Set where are msgs stored
		var feedDataSet = 'feed';

		// Let's create a simple call to get latest massages
		function getMsgs() {
			$http({
				method: 'GET',
				url: $rootScope.credentials.appUrl + feedDataSet + '?sort=createdAt DESC',
				headers: {
					'Authorization': 'Bearer ' + token
				}
			}).then(function(response){
				$scope.feed = response.data;
			}, function(error){
				console.log(error);
			});
		}

		// Let's now make the call if user gave us a name 
		// (that's NOT an authorization just a quick example)
		if (!username || username === '') {
			$location.path('/login');
		} else {
			$scope.username = username;
			getMsgs();
		}

		$scope.logout = function() {
			localStorage.removeItem('username');
			$location.path('/login');
		};

		$scope.postMsg = function () {

			if ($scope.msg === '' || $scope.msg === null || 
				$scope.msg.match(/^\s*$/)) {
				return false;	
			}

			$http({
				method: 'POST',
				url: $rootScope.credentials.appUrl + feedDataSet,
				headers: {
					'Authorization': 'Bearer ' + token
				},
				data: {
					'name': username,
					'msg': $scope.msg
				}
			}).then(function(response){
				$scope.msg = '';
			}, function(error){
				console.log(error);
			});
		};

		// Let's have the RTC functionality
		var rtcUrl = 'http://rtc.jexia.com/rtc';

		// Create a new Faye client
	    var client = new Faye.Client(rtcUrl);

	    // We need to make the Faye client send the token 
	    // every time it subscribes to a channel for authorization
	    // reasons
	    client.addExtension({
	        outgoing: function(message, callback) {

	            // optional (but recommended), check that this is a subscription message
	            if (message.channel !== '/meta/subscribe') return callback(message);

	            // convention is to put custom data in message.ext
	            message.ext = message.ext || {};
	            message.ext.token = token;

	            callback(message);
	        }
	    });

	    // RTC channel can be found within RTC tab
	    // in Jexia Data Set page otherwise the channel
	    // is a combination of the following variables
	    var msgsChannel = '/' + $rootScope.credentials.appId + 
	    			'/' + feedDataSet + '/' + $rootScope.credentials.key;

	    // Let's Subscribe to the data set channel, get
	    // any new messages broadcasted and put them to scope.
	    // Don't forget to apply on scope.
	    client.subscribe(msgsChannel, function(msg) {
	    	// Unshift the msg contents to our feed
	        $scope.feed.unshift(msg.data);

	        // Verify that digest is not running to avoid errors
	        if(!$scope.$$phase) {
	        	$scope.$apply();
			}
	    });
	
}])

.config(function($routeProvider, $locationProvider) {
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
