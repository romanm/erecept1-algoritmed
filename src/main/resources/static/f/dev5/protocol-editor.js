app.controller('AppCtrl', function($scope, $http, $timeout) {
	var ctrl = this
	ctrl.page_title = 'protocol-editor'
	initApp($scope, $http, ctrl, $timeout)
	initPage(ctrl)
	readProtocol(ctrl)
})

var initPage = function(ctrl){

	ctrl.clickICPC2DuodecimOne = function(i2d){
		console.log(i2d)
	}

	ctrl.protocolDataModelR = {}
	ctrl.protocolDataModelR.addElement = function(n){
		if(!ctrl.referencesMap[n.parent]){
			var sql = "INSERT INTO doc (doc_id, reference, parent) " +
			"VALUES (:nextDbId1, " +n.doc_id +", " +ctrl.protocol.doc_id +");\n" +
			"INSERT INTO sort (sort_id, treelevel) VALUES (:nextDbId1, 1);\n"
			sql += "SELECT * FROM (" + sql_app.select_content_nodes() +
			") a, doc d " +
			"WHERE d.doc_id=a.doc_id AND a.doc_id = :nextDbId1 ;"
			writeSql({sql : sql, dataAfterSave:function(r){
				var ne = r.data.list2[0]
				ctrl.protocol.children.unshift(ne)
			}})
		}
	}
	ctrl.protocolDataModelR.openMenu = function(n){
		if(this.openedMenu == n){
			delete this.openedMenu
			return
		}
		this.openedMenu = n
	}
	ctrl.protocolParts = {}
	ctrl.protocolParts.openItem_359215 = function(){
		ctrl.seekLogic.seek_engine = function(){
			console.log(this, ctrl.seekLogic.seek_value)
			readDuodecim_list(ctrl)
		}
	}
	ctrl.protocolParts.clickItem = function(n){
		if(this.openedItem == n){
			delete this.openedItem
			return
		}
		this.openedItem = n
		console.log(n, n.reference)
		if(ctrl.protocolParts['openItem_'+n.reference])
			ctrl.protocolParts['openItem_'+n.reference]()
	}
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

var readDuodecim_list = function(ctrl){
	var sql = "" +
	"SELECT * FROM (" +
	sql_app.read_ICPC2_duodecim_protocol_name002 +
	") a \n"
//	") a WHERE with_name=1 \n"
	if(ctrl.seekLogic.seek_value){
		console.log(ctrl.seekLogic.seek_value)
		sql +=" WHERE (" +
		"LOWER(protocol_name) LIKE LOWER('%" +ctrl.seekLogic.seek_value +"%')" +
		"OR LOWER(ebmname) LIKE LOWER('%" +ctrl.seekLogic.seek_value +"%')" +
		")"
	}
	sql +=" LIMIT 100"
	console.log(sql)
	readSql({ sql:sql, afterRead:function(r){
//		console.log(r.data.list)
		ctrl.duodecim_name_list = r.data.list
	}})
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
