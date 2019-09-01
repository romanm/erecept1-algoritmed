app.controller('AppCtrl', function($scope, $http, $timeout) {
	var ctrl = this
	ctrl.page_title = 'protocol-editor'
	initApp($scope, $http, ctrl, $timeout)
	readProtocol(ctrl)
})

var readProtocol = function(ctrl){
	var sql = sql_app.select_doc_l8_nodes() //+" ORDER BY l "
	var params = replaceParams({sql:sql, rootId:ctrl.request.parameters.id})
	params.sql += " ORDER BY l"
//	console.log(params.sql)
	readSql({ sql:params.sql, afterRead:function(r){
		angular.forEach(r.data.list, function(v,k){
			ctrl.elementsMap[v.doc_id] = v
			if(v.reference){
				ctrl.referencesMap[v.reference] = v
			}
			if(0==k){
				ctrl.protocol = v
			}else if(ctrl.elementsMap[v.parent]){
				if(!ctrl.elementsMap[v.parent].children)
					ctrl.elementsMap[v.parent].children = []
				ctrl.elementsMap[v.parent].children.push(v)
			}else{
				console.error("not tree parent",v)
			}
		})
		console.log(ctrl.protocol
				, ctrl.referencesMap
				, ctrl.referencesMap[285578]
				)
	}})

}
