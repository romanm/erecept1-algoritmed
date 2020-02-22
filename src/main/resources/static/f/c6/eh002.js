app.controller('AppCtrl', function($scope, $http, $timeout) {
	ctrl = this
	initApp($scope, $http, $timeout)
	initEh002()
	ctrl.page_title = 'ms - ' + ctrl.request.parameters.doc2doc
	console.log(ctrl.request)
	ctrl.doc2doc_ids = ctrl.request.parameters.doc2doc.split(',')

	read_object({doc_id:ctrl.doc2doc_ids[0]})
	read_object({doc_id:ctrl.doc2doc_ids[1]})

	read_mergeList('docs', sql_app.SELECT_obj_with_i18n(ctrl.doc2doc_ids[0]))
	read_mergeList('docs', sql_app.SELECT_obj_with_i18n(ctrl.doc2doc_ids[1]))
	ctrl.choice_data_model_id = ctrl.doc2doc_ids[0]

	var s = sql_app.obj_with_i18n(ctrl.doc2doc_ids[0])
})

var initEh002 = function() {
	ctrl.afterReadObj = function(d){
		if(d.doc_id == ctrl.doc2doc_ids[0]){
			console.log(d)
			ctrl.choice_data_model = ctrl.elementsMap[d.doc_id]
		}
	}
	sql_app.SELECT_with_parent = function(d){
		return sql_app.SELECT_children_with_i18n(d.doc_id)
	}
}
