app.controller('AppCtrl', function($scope, $http, $timeout) {
	ctrl = this
	initApp($scope, $http, ctrl)
	ctrl.module_nszu = module_nszu

})
