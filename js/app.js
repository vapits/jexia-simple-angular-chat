angular.module('simpleChat', ['ngRoute', 'luegg.directives'])

.run(function($rootScope, $http){
	// Set your Jexia credentials here
	// appUrl = You Jexia Data App Url
	// key = You Access key
	// secret = Acess key secret
	// NOTE: Key & Secret are public here for demostration
	// You should hide them in a server side middleware if your key has write access
	$rootScope.credentials = {
		appId: '47a4ec70-9c47-11e5-be62-df2d328a133b',
		appUrl: 'https://47a4ec70-9c47-11e5-be62-df2d328a133b.app.jexia.com/',
		key: 'ad316b44e3b4349a3bbb325b49b31eab',
		secret: 'cc035a7ccaab5650413db60c73ec2e81c807b8e8890b5d5e'
	};

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
	var dataset = 'feed';

	// Let's create a simple call to get latest massages
	function getMsgs() {
		$http({
			method: 'GET',
			url: $rootScope.credentials.appUrl + dataset + '?sort=createdAt DESC',
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
		if($scope.msg === '') return false;

		$http({
			method: 'POST',
			url: $rootScope.credentials.appUrl + dataset,
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

	var rtcUrl = 'http://rtc.jexia.com/rtc';

    var client = new Faye.Client(rtcUrl);

    // We need to make the Faye client send the token every time it subscribes to a channel
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

    var channel = '/' + $rootScope.credentials.appId + '/' + dataset + '/' + $rootScope.credentials.key;

    // 3. and 4.: Subscribe to the data set channel and get your events
    client.subscribe(channel, function(msg) {
        $scope.feed.unshift(msg.data);
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
