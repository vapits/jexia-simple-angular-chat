angular.module('simpleChat')

.service('tokenService', ['$http', '$rootScope', function($http, $rootScope){

	this.getToken = function() {
		return $http({
			method: 'POST',
			url: $rootScope.credentials.appUrl,
			data: {
				key: $rootScope.credentials.key,
				secret: $rootScope.credentials.secret
			}
		}).then(function(response){
			return response;
		}, function(error){
			return error;
		});
	};

}]);