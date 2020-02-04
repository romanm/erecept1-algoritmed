app.controller('AppCtrl', function($scope, $http, $timeout) {
	ctrl = this
	ctrl.page_title = 'ф.003/о'
	initApp($scope, $http, $timeout)
	set_choice_data_model2({doc_id:367496}, 367496)
})
