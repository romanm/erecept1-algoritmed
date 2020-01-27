app.controller('AppCtrl', function($scope, $http, $timeout) {
	ctrl = this
	ctrl.page_title = 'ЗОЗ'
	ctrl.zoz_data_id = 367476
	ctrl.zoz_data_model_id = 367475
	initApp($scope, $http, $timeout)
	ctrl.choice_data_model = {i18n_parent:367318}
	read_object({doc_id:367475})
	initZOZ()
})
var initZOZ = function(){
	ctrl.click_create_zoz = function(){
		var so = {reference:ctrl.zoz_data_model_id, parent:ctrl.zoz_data_id,
		dataAfterSave : function(response){
			console.log(response.data)
			angular.forEach(ctrl.elementsMap[ctrl.zoz_data_model_id].children,function(v){
				console.log(v)
			})
		},}
		so.sql = sql_app.INSERT_doc_parent_ref()
		so.sql += sql_app.SELECT_doc_id()
		console.log(ctrl.elementsMap[ctrl.zoz_data_model_id], so.sql)
		writeSql(so)
	}
	ctrl.click_open_dialog_create_zoz = function(){
		ctrl.open_dialog_create_zoz = !ctrl.open_dialog_create_zoz
		read_object({doc_id:ctrl.zoz_data_model_id})
	}
	ctrl.notes = {}
	ctrl.notes.create_zoz = 'Створити ЗОЗ'
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
