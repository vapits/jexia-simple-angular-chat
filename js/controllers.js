angular.module('simpleChat')

.controller('loginCtrl', [ '$scope', '$rootScope', '$location', '$http', 'tokenService',
	function($scope, $rootScope, $location, $http, tokenService) {

		var username = localStorage.getItem('username');
		if (username) {
			$location.path('/chat');
		}

		// Scope with username
		$scope.username = '';

		$scope.login = function () {
			if ($scope.username !== '' || $scope.username.match(/^\s*$/)) {

				tokenService.getToken()
				.then(function(response) {

					// Set token to local storage for further usage
					localStorage.setItem('token', response.data.token);
					var token = localStorage.getItem('token');

					$http({
						method: 'POST',
						url: $rootScope.credentials.appUrl + $rootScope.credentials.usersDataSet,
						headers: {
							'Authorization': 'Bearer ' + token
						},
						data: {
							'username': $scope.username,
							'loggedIn': true
						}
					}).then(function(response){
						localStorage.setItem('username', $scope.username);
						localStorage.setItem('userId', response.data.id);
						$location.path('/chat');
					}, function(error){
						//console.log(error);
					});

				}, function(error) {
					console.log(error.data.message);
				});

			}
		};
	
}])

.controller('appCtrl', [ '$scope', '$rootScope', '$http', '$location',
	function($scope, $rootScope, $http, $location) {

		var token = localStorage.getItem('token');
		var username = localStorage.getItem('username');
		var userId = localStorage.getItem('userId');

		// Let's create a simple call to get latest massages
		function getMsgs() {
			$http({
				method: 'GET',
				url: $rootScope.credentials.appUrl + $rootScope.credentials.feedDataSet + '?sort=createdAt DESC',
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

			$http({
				method: 'PUT',
				url: $rootScope.credentials.appUrl + 
					$rootScope.credentials.usersDataSet + 
					'/' + userId,
				headers: {
					'Authorization': 'Bearer ' + token
				},
				data: {
					'id': userId,
					'loggedIn': false
				}
			}).then(function(response){
				localStorage.removeItem('username');
				localStorage.removeItem('userId');
				localStorage.removeItem('token');
				$location.path('/login');
			}, function(error){
				localStorage.removeItem('username');
				localStorage.removeItem('userId');
				localStorage.removeItem('token');
				$location.path('/login');
			});

		};


		$scope.postMsg = function () {

			if ($scope.msg === '' || $scope.msg === null || 
				$scope.msg.match(/^\s*$/)) {
				return false;	
			}

			$http({
				method: 'POST',
				url: $rootScope.credentials.appUrl + $rootScope.credentials.feedDataSet,
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

	    // Msgs Channel
	    var msgsChannel = '/' + $rootScope.credentials.appId + 
	    			'/' + $rootScope.credentials.feedDataSet + '/' + $rootScope.credentials.key;
	    // Users Channel
	    var usersChannel = '/' + $rootScope.credentials.appId + 
	    			'/' + $rootScope.credentials.usersDataSet + '/' + $rootScope.credentials.key;

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

	    // Now let's listen when a new user enters or left chat room
	    client.subscribe(usersChannel, function(msg) {
	    	// Unshift the msg contents to our feed
	        $scope.feed.unshift(msg.data);

	        // Verify that digest is not running to avoid errors
	        if(!$scope.$$phase) {
	        	$scope.$apply();
			}
	    }).then(null, function(error){
	    	console.log(error);
	    });
	
}])