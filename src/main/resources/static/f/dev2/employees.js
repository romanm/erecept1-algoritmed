conf.eHealthInUA_id = 115796
conf.dataModelTemplateId = 115883
conf.dataModelList.parentId = 285517

app.controller('AppCtrl', function($scope, $http) {
	var ctrl = this
	ctrl.page_title = 'Кадри'
	initApp($scope, $http, ctrl)
	conf.editDocId = ctrl.request.parameters.em
	initDocEditor(ctrl)

	var sql_list = function(){ return "" +
		"SELECT row.* FROM doc row where parent = :parentId "
	}
//	console.log(sql_list().replace(":parentId",conf.dataModelList.parentId))
	read_dataModelList(ctrl, sql_list())


})

