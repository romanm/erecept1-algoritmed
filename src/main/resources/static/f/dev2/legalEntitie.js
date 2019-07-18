app.controller('AppCtrl', function($scope, $http) {
	var ctrl = this
	ctrl.page_title = 'лікувальний заклад'
	initApp($scope, $http, ctrl)
	read_eHealthInUA(ctrl)
})

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
		}
	})
}


