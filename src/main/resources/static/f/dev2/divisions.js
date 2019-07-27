app.controller('AppCtrl', function($scope, $http) {
	var ctrl = this
	ctrl.page_title = 'Підрозділи'
	initApp($scope, $http, ctrl)

}
