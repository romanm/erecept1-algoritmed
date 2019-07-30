conf.dataModelList.parentId = 285460
conf.eHealthInUA_id = 115796
conf.dataModelTemplateId = 115827

app.controller('AppCtrl', function($scope, $http) {
	var ctrl = this
	ctrl.page_title = 'лікувальний заклад'
	initApp($scope, $http, ctrl)
	conf.editDocId = ctrl.request.parameters.le
	initDocEditor(ctrl)

	var sql_list = sql_app.read_list_legalEntity() +
	"WHERE row.parent=:parentId " //285460
	read_dataModelList(ctrl, sql_list)
	
	read_dd_of_doc(ctrl, conf.dataModelTemplateId)

	ctrl.readTree = function(rootEl){
		console.log('ctrl.readTree rootEl =', rootEl)
		read_tree(ctrl, rootEl.doc_id)
	}

	ctrl.newClinic = function(){
		ctrl.newDataModelEntity(conf.dataModelList.parentId, conf.dataModelTemplateId)
	}

})

function read_dd_of_doc(ctrl, rootId) {
//	console.log(sql_app.select_i18_ua())
	var sql = sql_app.select_doc_dd_l8()
	var sql = sql_app.select_dd_for_doc_l8()
	var params = {
		sql:sql,
		rootId:rootId,
		afterRead:function(response){
			angular.forEach(response.data.list, function(v,k){
				ctrl.elementsMap[v.doc_id] = v
				if(0==v.l){
				}else{
					var vp = ctrl.elementsMap[v.parent]
					if(!vp.children) 
						vp.children = []
					vp.children.push(v)
//					if(vp.doc_id==117239) 
//						console.log(vp)
				}
			})
		}
	}
//	console.log(replaceParams(params))
	readSql(params)
}


