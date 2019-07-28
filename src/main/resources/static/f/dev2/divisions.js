conf.dataModelList.parentId = 285516
conf.dataModelList.sql_newEl = function(ctrl){ return "" +
	"INSERT INTO doc (doc_id, parent,doctype, reference) " +
	"VALUES (:nextDbId1, :parentId, 18, :dataModelId ); " +
	"SELECT * FROM doc WHERE doc_id=:nextDbId1; " +
	"INSERT INTO doc (doc_id, parent, doctype, reference, reference2) " +
	"VALUES (:nextDbId2, 285515, 18, :nextDbId1, " +
	ctrl.request.parameters.le +
	" );" // ?jsonId=122594
}
conf.eHealthInUA_id = 115796
conf.dataModelTemplateId = 115856

app.controller('AppCtrl', function($scope, $http) {
	var ctrl = this
	ctrl.page_title = 'Підрозділи'
	initApp($scope, $http, ctrl)
	conf.editDocId = ctrl.request.parameters.div
	initDocEditor(ctrl)

	var sql_list = function(){ return "" +
		"SELECT row.*, short_name.* FROM (SELECT * FROM doc WHERE reference2=" +
		ctrl.request.parameters.le +
		") le, doc row " +
		"LEFT JOIN (" +
		"SELECT * FROM doc, string s2 " +
		"WHERE reference = 115879 AND doc_id=string_id " +
		") short_name ON row.doc_id=short_name.parent " +
		"WHERE row.parent=:parentId " +
		"AND row.doc_id = le.reference "
	}
	console.log(sql_list().replace(":parentId",conf.dataModelList.parentId))
	read_dataModelList(ctrl, sql_list())

	read_jsonDocBody(ctrl, {
		jsonId:conf.eHealthInUA_id,
		afterRead:function(ctrl){
			console.log(ctrl)
			ctrl.docDivision = ctrl.elementsMap[conf.dataModelTemplateId]
			ctrl.editDocTemplate = ctrl.elementsMap[conf.dataModelTemplateId]
			console.log(ctrl.editDocTemplate)
			read_i18_ua_of_doc(ctrl, conf.dataModelTemplateId)
		},
	})
})
