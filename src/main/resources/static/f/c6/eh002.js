app.controller('AppCtrl', function($scope, $http, $timeout) {
	ctrl = this
	initApp($scope, $http, $timeout)
	initEh002()
	initInvoice()
	initMenu()
	ctrl.page_title = 'mc:' + ctrl.request.parameters.doc2doc
	console.log(ctrl.request.parameters.doc2doc)

	read_object2({doc_id:ctrl.doc2doc_ids[0]})
	read_object2({doc_id:ctrl.doc2doc_ids[1]})

	angular.forEach(ctrl.doc2doc_ids, function(v){
		read_mergeList('docs', sql_app.SELECT_obj_with_i18n(v))
	})
	ctrl.choice_data_model_id = ctrl.doc2doc_ids[0]

	var s = sql_app.obj_with_i18n(ctrl.doc2doc_ids[0])
	ctrl.doc2doc_fd = {}
	ctrl.doc2doc_fd['_'+ctrl.doc2doc_ids[0]] = {}
	ctrl.doc2doc_fd['_'+ctrl.doc2doc_ids[1]] = {}
	read_to_folder({doc_id:ctrl.doc2doc_ids[0]}, ctrl.doc2doc_ids[0])
	read_to_folder({doc_id:ctrl.doc2doc_ids[1]}, ctrl.doc2doc_ids[1])
})

var read_to_folder = function(d, d_start_id, doc){
	var sql = sql_app.SELECT_obj_with_i18n(d.doc_id)
	readSql({ sql:sql,
		afterRead:function(response){
			var d_r = response.data.list[0]
			if(14==d_r.doctype){
				doc.folder = d_r
				ctrl.doc2doc_fd['_'+d_start_id] = doc
			}else
			if(17==d_r.doctype){
				read_to_folder({doc_id:d_r.parent}, d_start_id, d_r)
			}else{
				read_to_folder({doc_id:d_r.parent}, d_start_id)
			}
		}
	})
}

var initInvoice= function() {
	ctrl.add_row = function(data_table_id){
		var data_table = ctrl.elementsMap[data_table_id]
		var so = {doc_id:':nextDbId1',parent:data_table_id, reference:data_table.reference2}
		console.log(data_table_id, data_table, so)
		writeSql(so)
	}
}
var initEh002 = function() {

	ctrl.afterReadObj = function(d){
		if(d.doc_id == ctrl.doc2doc_ids[0]){
			ctrl.choice_data_model = ctrl.elementsMap[d.doc_id]
		}
		if(ctrl.two_docs_ids){
			var i_old = ctrl.doc2doc_ids.indexOf(d.doc_id),
			i_new = ctrl.two_docs_ids.indexOf(d.doc_id)
			console.log(d
				, i_new
				, ctrl.doc2doc_ids
				, i_old
			)
			ctrl.doc2doc_ids.splice(i_old,1)
			ctrl.doc2doc_ids.splice(i_new,0, d.doc_id)
		}
	}

	sql_app.SELECT_with_parent = function(d){
		return sql_app.SELECT_children_with_i18n(d.doc_id)
	}
}
