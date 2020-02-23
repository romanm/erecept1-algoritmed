app.controller('AppCtrl', function($scope, $http, $timeout) {
	ctrl = this
	initApp($scope, $http, $timeout)
	initEh002()
	initMenu()
	ctrl.page_title = 'mc:' + ctrl.request.parameters.doc2doc
	console.log(ctrl.request)

	read_object({doc_id:ctrl.doc2doc_ids[0]})
	read_object({doc_id:ctrl.doc2doc_ids[1]})

	angular.forEach(ctrl.doc2doc_ids, function(v){
		read_mergeList('docs', sql_app.SELECT_obj_with_i18n(v))
	})
	ctrl.choice_data_model_id = ctrl.doc2doc_ids[0]

	var s = sql_app.obj_with_i18n(ctrl.doc2doc_ids[0])
})

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
