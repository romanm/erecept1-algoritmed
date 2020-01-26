app.controller('AppCtrl', function($scope, $http, $timeout) {
	ctrl = this
	ctrl.page_title = 'ЗОЗ'
	initApp($scope, $http, $timeout)
	ctrl.choice_data_model = {i18n_parent:367318}
	read_object({doc_id:367475})
	initZOZ()
})
var initZOZ = function(){
	ctrl.admin_part_ids = {
		_367477:'',
		_367478:'-division',
		_367479:'-employee',
	}
	ctrl.admin_part_id = 367477
	if(ctrl.request.path[0].includes('division')){
		ctrl.admin_part_id = 367478
	}else
	if(ctrl.request.path[0].includes('employee')){
		ctrl.admin_part_id = 367479
	}
}
