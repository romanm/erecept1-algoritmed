app.controller('AppCtrl', function($scope, $http, $timeout) {
	ctrl = this
	initApp($scope, $http, $timeout)
	ctrl.page_title = 'ms - ' + ctrl.request.parameters.doc2doc
	console.log(ctrl.request)
})
