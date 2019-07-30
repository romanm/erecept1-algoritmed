conf.eHealthInUA_id = 115796
conf.dataModelTemplateId = 115856
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
//	console.log(sql_list().replace(":parentId",conf.dataModelList.parentId))
	read_dataModelList(ctrl, sql_list())

	var sql_le = sql_app.read_list_legalEntity() +
		"WHERE row.doc_id = " + ctrl.request.parameters.le
	readSql({
		sql:sql_le,
		afterRead:function(response){
			ctrl.legalEntityEl = response.data.list[0]
			console.log(ctrl.legalEntityEl, sql_le)
		}
		
	})

})
