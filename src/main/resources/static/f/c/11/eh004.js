app.controller('AppCtrl', function($scope, $http, $timeout) {
	ctrl = this
	initApp($scope, $http, $timeout)
	random_newValue('edProtocol','value2')
	initCrud004()
	ctrl.page_title = 'mc:' + ctrl.request.parameters.doc2doc

	read_element(ctrl.doc2doc_ids[0], function(response){
		read_element_children(ctrl.doc2doc_ids[0], function(response){
			var o = ctrl.eMap[ctrl.doc2doc_ids[0]]
			console.log(o.doc_id)
		})
	})
	read_element(ctrl.doc2doc_ids[1], function(response){
		read_element_children(ctrl.doc2doc_ids[1])
	})
	
})
