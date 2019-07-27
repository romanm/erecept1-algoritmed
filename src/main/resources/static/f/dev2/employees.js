app.controller('AppCtrl', function($scope, $http) {
	var ctrl = this
	ctrl.page_title = 'Кадри'
	initApp($scope, $http, ctrl)

})
