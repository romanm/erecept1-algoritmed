app.controller('AppCtrl', function($scope, $http, $timeout) {
	ctrl = this
	initApp($scope, $http, $timeout)
	initCrud004()
	ctrl.page_title = 'mc:' + ctrl.request.parameters.doc2doc

	read_element(ctrl.doc2doc_ids[0])
	read_element(ctrl.doc2doc_ids[1])
	
})
