app.controller('AppCtrl', function($scope, $http) {
	var ctrl = this
	ctrl.page_title = 'лікувальний заклад'
	initApp($scope, $http, ctrl)
	read_eHealthInUA(ctrl)
	read_clinic_list(ctrl, 285460)
	read_X(ctrl, 115827)
	
	
/*
	ctrl.change_text_field = function(leE){
		console.log(leE)
	}
 * */	
	ctrl.setEditClinic = function(clinicEl){
		ctrl.edit_clinic = clinicEl
	}
	ctrl.newClinic = function(){
		var params = {}
		params.sql = "INSERT INTO doc (doc_id, parent,doctype, reference) VALUES (:nextDbId1, 285460, 18, 115827 ); " +
		"SELECT * FROM doc WHERE doc_id=:nextDbId1;"
		console.log(params.sql)
		writeSql({sql : params.sql,
			dataAfterSave:function(response){
				console.log(response.data)
				ctrl.setEditClinic(response.data.list1[0])
				ctrl.clinic_list.unshift(ctrl.edit_clinic)
			}
		})
	}
})

function read_clinic_list(ctrl, parentId){
	var sql = "SELECT * FROM doc WHERE parent=:parentId"
	readSql({
		sql:sql,
		parentId:parentId,
		afterRead:function(response){
			ctrl.clinic_list = response.data.list
			console.log(ctrl.clinic_list, response.data, sql)
		}
	})
}
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
//			console.log(response.data.list, ctrl.i18)
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
//			console.log(Object.keys(ctrl.elementsMap))
//			console.log(Object.keys(mapElement(ctrl.docLeagalEntitie,{})))
		}
	})
}


