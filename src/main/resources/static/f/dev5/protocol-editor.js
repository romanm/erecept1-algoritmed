app.controller('AppCtrl', function($scope, $http, $timeout) {
	var ctrl = this
	ctrl.page_title = 'protocol-editor'
	initApp($scope, $http, ctrl, $timeout)
	initPage(ctrl)
	readProtocol(ctrl)
})

var initPage = function(ctrl){
	ctrl.protocolParts = {}
	ctrl.protocolParts.list = ['Симптоми','Хронологія дій','Діф.діагностика', 'Tex.дані']
	ctrl.protocolParts.openPartNr = function(nr){
		ctrl.protocolParts.openedPart = ctrl.protocolParts.list[nr]
		ctrl.protocolParts.openedPartNr = nr
	}
	ctrl.protocolParts.openPartNr(3)
	ctrl.protocolParts.openPart = function(pp){
		ctrl.protocolParts.openedPart = pp
		ctrl.protocolParts.openedPartNr = ctrl.protocolParts.list.indexOf(pp)
	}
}

var list2tree = function(ctrl, r, objectName){
//	console.log(r.data.list)
	angular.forEach(r.data.list, function(v,k){
		ctrl.elementsMap[v.doc_id] = v
		if(v.reference){
			ctrl.referencesMap[v.reference] = v
		}
		if(0==k){
			ctrl[objectName] = v
		}else if(ctrl.elementsMap[v.parent]){
			if(!ctrl.elementsMap[v.parent].children)
				ctrl.elementsMap[v.parent].children = []
			ctrl.elementsMap[v.parent].children.push(v)
		}else{
			console.error("not tree parent",v)
		}
	})
}
var readProtocol = function(ctrl){
	var sql = sql_app.select_doc_l8_nodes() //+" ORDER BY l "
	var params_dataModel = replaceParams({sql:sql, rootId:285570})
	params_dataModel.sql += " ORDER BY l"
	readSql({ sql:params_dataModel.sql, afterRead:function(r){
		list2tree(ctrl, r, 'protocolDataModel')
		console.log(ctrl.protocolDataModel, ctrl.elementsMap)
	}})
	var params = replaceParams({sql:sql, rootId:ctrl.request.parameters.id})
	params.sql += " ORDER BY l"
//	console.log(params.sql)
	readSql({ sql:params.sql, afterRead:function(r){
		list2tree(ctrl, r, 'protocol')
		var icpc2_list = []
		angular.forEach(r.data.list, function(v,k){
			if(ctrl.elementsMap[v.parent]){
				if(352331==ctrl.elementsMap[v.parent].reference){
					icpc2_list.push(v.reference)
				}
			}
		})
		var sql_icpc2_i18n = "SELECT * FROM doc,string \n" +
		"where string_id=doc_id and parent= 285597 \n" +
		"and reference in " + ctrl.listToInSQL(icpc2_list)
		console.log(icpc2_list, sql_icpc2_i18n)
		readSql({ sql:sql_icpc2_i18n, afterRead:function(r2){
			angular.forEach(r2.data.list, function(v2,k2){
				console.log(v2)
				ctrl.referencesMap[v2.reference] = v2
			})
		}})
		console.log(ctrl.protocol
				, ctrl.referencesMap
				, ctrl.referencesMap[285578]
				)
	}})

}
