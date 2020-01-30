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

conf.addPrincipal = function(){
	var sql = "SELECT d2.* FROM \n" +
	"(SELECT * FROM doc WHERE parent=:user_id) d1, \n" +
	"(SELECT * FROM doc WHERE parent=367476) d2 \n" +
	"WHERE d2.doc_id=d1.reference"
	sql = sql.replace(':user_id', ctrl.principal.user_id)
	console.log(sql, 123)
	read_dataObject2fn(sql, function(response){
		ctrl.zoz = response.data.list[0]
		console.log(ctrl.zoz)
		var sql2 = sql_app.SELECT_with_parent(ctrl.zoz)
		read_dataObject2fn(sql2, function(response2){
			ctrl.zoz.children = response2.data.list
			set_cols_type(ctrl.zoz)
		})
	})
}

var initZOZ = function(){
	conf.init()

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
		so.sql += sql_app.INSERT_doc_parent_ref({'nextDbId':2, reference:':nextDbId1', parent:ctrl.principal.user_id})
		angular.forEach(ctrl.elementsMap[ctrl.zoz_data_model_id].children, function(v,k){
			var s2 = sql_app.INSERT_doc_parent_ref({'nextDbId':3+k, reference:v.doc_id, parent:':nextDbId1'})
			so.sql+= s2
			console.log(s2)
		})
		console.log(ctrl.principal.user_id, ctrl.elementsMap[ctrl.zoz_data_model_id], so.sql)
		writeSql(so)
	}
	ctrl.click_open_dialog_create_zoz = function(){
		ctrl.open_dialog_create_zoz = !ctrl.open_dialog_create_zoz
		read_object({doc_id:ctrl.zoz_data_model_id})
		console.log(ctrl.elementsMap[ctrl.principal.user_id], ctrl.principal.user_id)
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
	console.log(ctrl.admin_part_id)
	read_dataObject2fn("SELECT * FROM doc where doc_id="+ctrl.admin_part_id, function(response){
		var ref = response.data.list[0].reference
		console.log(ref, response.data.list[0])
		set_choice_data_model2({doc_id:ref}, ref)
	})

}
