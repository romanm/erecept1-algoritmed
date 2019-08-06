app.controller('AppCtrl', function($scope, $http) {
	var ctrl = this
	ctrl.page_title = 'tree editor'
	initApp($scope, $http, ctrl)
//	var sql = sql_app.select_doc_l8_sort()
	var rootId = $scope.request.parameters.rootId
	var sql = sql_app.select_doc_l8_nodes_sort()
//	console.log(sql.replace(new RegExp(":rootId", 'gi'), rootId))
	readSqlTree(ctrl, rootId, sql)
	
	ctrl.stringifyJsonTree = "-- click my :) --"
	ctrl.saveJson = function(id){
		var d = {docRoot:ctrl.elementsMap[id]}
		var params = {}
//		params.docbody = JSON.stringify(d)
		params.docbody = JSON.stringify(d).replace(/'/g,"''")
		params.rootId = rootId
		params.sql = "UPDATE docbody SET docbody=:docbody WHERE docbody_id IN (" +
		"SELECT doc_id FROM doc WHERE doctype=20 AND reference=:rootId AND parent=:rootId)"
		console.log(params)
		params.dataAfterSave = function(response){
			console.log(response.data)
		}
		writeSql(params)
	}
	ctrl.readJsonCODE = function(id){
		console.log(id)
	}
	ctrl.viewJson = function(id){
		ctrl.stringifyJsonTree = JSON.stringify(ctrl.elementsMap[id], null, 2)
	}
})

var readSqlTree = function(ctrl, rootId, sql){
	readSql({ sql:sql, rootId:rootId,
		afterRead:function(response){
			console.log(response.data.list)
			angular.forEach(response.data.list, list_el_to_tree)
			console.log(ctrl.elementsMap[rootId])
		},
	})
	var list_el_to_tree = function(v){
		el_to_tree0(ctrl, v)
	}

}
