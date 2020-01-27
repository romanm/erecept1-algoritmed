app.controller('AppCtrl', function($scope, $http, $timeout) {
	ctrl = this
	ctrl.page_title = 'Мої налаштування'
	initApp($scope, $http, $timeout)
})
