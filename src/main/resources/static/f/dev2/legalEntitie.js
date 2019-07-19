app.controller('AppCtrl', function($scope, $http) {
	var ctrl = this
	ctrl.page_title = 'лікувальний заклад'
	initApp($scope, $http, ctrl)
	read_eHealthInUA(ctrl)
	read_X(ctrl, 115827)
})

function read_X(ctrl, rootId) {
//	var sql = sql_app.select_doc_id_l8()
//	var sql = sql_app.select_i18_ua() + " LIMIT 22"
	var sql = sql_app.select_i18_ua_of_doc()
	readSql({
		sql:sql,
		rootId:rootId,
		rootId2:115796,
		afterRead:function(response){
//			console.log(response.data, sql)
			console.log(response.data.list, ctrl.i18)
			angular.forEach(response.data.list, function(v,k){
				ctrl.i18[v.reference] = v
			})
		}
	})
}

function read_eHealthInUA(ctrl) {
	readSql({
		sql:sql_app.amk025_template(),
		jsonId:115796,
		afterRead:function(response){
			ctrl.docbodyeHealthInUA = 
				JSON.parse(response.data.list[0].docbody).docRoot
			mapElement(ctrl.docbodyeHealthInUA,ctrl.elementsMap)
//			console.log(ctrl.docbodyeHealthInUA, ctrl.elementsMap[115827], ctrl.elementsMap)
			ctrl.docLeagalEntitie = 
				ctrl.elementsMap[115827]
			console.log(ctrl.docLeagalEntitie)
			console.log(Object.keys(ctrl.elementsMap))
			console.log(Object.keys(mapElement(ctrl.docLeagalEntitie,{})))
		}
	})
}


