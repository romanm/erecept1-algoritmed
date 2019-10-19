app.controller('AppCtrl', function($scope, $http, $timeout) {
	var ctrl = this
	ctrl.page_title = 'protocol-editor'
	initApp($scope, $http, ctrl, $timeout)
	initPage(ctrl)
	readProtocol(ctrl)
})

var startPartNr = 2
var startPartNr = 3

sql_app.insertNode_prl_nr = function(params){ 
	if(!params.nextDbId) params.nextDbId=1
	if(!params.reference2) params.reference2='null'
	var sql = "" +
	"INSERT INTO doc (doc_id, reference, reference2, parent) " +
	"VALUES (:nextDbId, " +params.reference +", " +params.reference2 +", " +params.parent +");\n" 
	if(params.treelevel){
		sql += "INSERT INTO sort (sort_id, treelevel) VALUES (:nextDbId, " + params.treelevel +");\n"
	}
	if(params.d_s){
		sql += "" +
		"INSERT INTO string (string_id, value) " +
		"VALUES (:nextDbId, '" + params.d_s + "');\n"
	}
	sql = sql.replace(/:nextDbId/g,':nextDbId'+params.nextDbId)
	return sql
}
sql_app.insertNode_prl = function(params){ 
	var sql = sql_app.insertNode_prl_nr(params)
	sql += "" +
	"SELECT * FROM (" + sql_app.select_content_nodes() +
	") a, doc d " +
	"WHERE d.doc_id=a.doc_id AND a.doc_id = :nextDbId1 ;"
	return sql
}

var initPage = function(ctrl){

	ctrl.clickICPC2DuodecimOne = function(i2d){
		var sql = sql_app.insertNode_prl({reference:i2d.protocol_id, parent:ctrl.protocolParts.openedItem.doc_id, treelevel:2})
		console.log(i2d, ctrl.protocolParts.openedItem, ctrl.protocolDataModel, sql)
		writeSql({sql : sql, dataAfterSave:function(r){
			var ne = r.data.list2[0]
			if(!ctrl.protocolParts.openedItem.children)
				ctrl.protocolParts.openedItem.children = []
			ctrl.protocolParts.openedItem.children.unshift(ne)
		}})
	}

	var insertNewNode = function(ne, parent_e){
		if(!parent_e.children)
			parent_e.children = []
		parent_e.children.unshift(ne)
	}

	ctrl.protocolDataModelR = {}
	ctrl.protocolDataModelR.addElement_359215 = function(n){
		if(ctrl.protocolParts.openedItem){
			if(ctrl.elementsMap[ctrl.protocolParts.openedItem.parent].reference == n.parent){
				var params = {parent:ctrl.protocolParts.openedItem.doc_id, reference:n.doc_id, treelevel:3}
				var sql = sql_app.insertNode_prl(params)
				console.log(n
						,params
						, ctrl.protocolParts.openedItem 
						, ctrl.referencesMap[n.parent] 
				, ctrl.elementsMap[ctrl.protocolParts.openedItem.parent] 
				)
				writeSql({sql : sql, dataAfterSave:function(r){
					insertNewNode(r.data.list2[0], ctrl.protocolParts.openedItem)
				}})
			}else{
				alert('Вибраний структурний елемент призначений тільки для діф.д/з елемента.')
			}
		}else{
			alert('Не вибраний елемент протоколу для редактування.')
		}
	}
	ctrl.protocolDataModelR.addElement = function(n){
		console.log(n
			, ctrl.referencesMap[n.parent]
		, ctrl.referencesMap[n.doc_id]
		)
		if(ctrl.protocolDataModelR['addElement_'+n.parent]){
			ctrl.protocolDataModelR['addElement_'+n.parent](n)
		}else
//		if(!ctrl.referencesMap[n.doc_id])
		{
//			if(!ctrl.referencesMap[n.parent]){
			var sql = sql_app.insertNode_prl({reference:n.doc_id, parent:ctrl.protocol.doc_id, treelevel:1})
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
	ctrl.protocolParts.saveNodeNoteEl = function(){
		var sql
		if(!ctrl.protocolParts.nodeNoteEl.d_s){
			sql = "DELETE FROM string WHERE string_id="+ctrl.protocolParts.nodeNoteEl.d_s_id+";\n"
		}else{
			if(ctrl.protocolParts.nodeNoteEl.d_s_id){
				sql = "UPDATE string " +
				"SET value = '" + ctrl.protocolParts.nodeNoteEl.d_s + "' " +
				"WHERE string_id="+ctrl.protocolParts.nodeNoteEl.d_s_id+" ;\n"
			}else{
				sql = "INSERT INTO string (string_id, value) \n" +
				"VALUES ("+ctrl.protocolParts.nodeNoteEl.doc_id+", "+"'"+ctrl.protocolParts.nodeNoteEl.d_s+"');\n"
			}
		}
		sql += "SELECT * FROM (\n" +
		""+sql_app.select_content_nodes()+
		"\n) a WHERE doc_id=" + ctrl.protocolParts.nodeNoteEl.doc_id
		console.log(ctrl.protocolParts.nodeNoteEl, sql)
		writeSql({sql : sql, dataAfterSave:function(r){
			console.log(r.data.list1[0].d_s_id)
			ctrl.protocolParts.nodeNoteEl.d_s_id=r.data.list1[0].d_s_id
		}})
	}
	ctrl.protocolParts.addNodeNote = function(el){
		ctrl.protocolParts.nodeNoteEl = el
	}
	ctrl.protocolParts.addTreeNode = function(parent_e){
		var params = {parent:parent_e.doc_id, reference:'null', treelevel:parent_e.l+1}
		var sql = sql_app.insertNode_prl(params)
		console.log(parent_e, params, sql)
		writeSql({sql : sql, dataAfterSave:function(r){
			insertNewNode(r.data.list2[0], parent_e)
		}})
	}
	ctrl.protocolParts.openItem_359260 = function(){
		ctrl.protocolParts.symptomNameInsert = function(){
			var params = {parent:ctrl.protocolParts.openedItem.doc_id, reference:ctrl.protocolParts.openedSymptom.doc_id, treelevel:ctrl.protocolParts.openedItem.l+1}
			console.log(params, ctrl.protocolParts.openedSymptom, ctrl.protocolParts)
			writeSql({sql : sql_app.insertNode_prl(params), dataAfterSave:function(r){
				insertNewNode(r.data.list2[0], ctrl.protocolParts.openedItem)
			}})
		}
		ctrl.protocolParts.symptomNameCopy = function(){
			ctrl.protocolParts.ts = new Date().toISOString().substring(0,19).replace('T',' ')
			ctrl.protocolParts.symptomEdPart = 'copy'
			var params = {parent:ctrl.protocolParts.openedSymptom.doc_id, reference:'null', treelevel:2
				, d_s:ctrl.protocolParts.ts+' '+ctrl.protocolParts.openedSymptom.d_s}
			console.log(params, ctrl.protocolParts.openedSymptom, ctrl.protocolParts)
			var nextDbId = 1
			angular.forEach(ctrl.protocolParts.openedSymptom.children, function(v){
				var params2 = {nextDbId:nextDbId, reference:v.reference}
				if(v.reference2) params2.reference2 = v.reference2
				if(v.d_s) params2.d_s = ctrl.protocolParts.ts+' '+v.d_s
				console.log(params2, v)
				nextDbId++ 
			})
		}
		ctrl.protocolParts.symptomNameEdit = function(){
			ctrl.protocolParts.symptomEdPart = 'edit'
			console.log(ctrl.protocolParts.openedSymptom, ctrl.protocolParts)
		}
		ctrl.protocolParts.symptomNameClick = function(e){
			if(ctrl.protocolParts.openedSymptom == e){
				delete ctrl.protocolParts.openedSymptom
				return
			}
			ctrl.random.newValue('edProtocol','value2')
			ctrl.protocolParts.openedSymptom = e
			var sql = sql_read_node.replace(":parent",e.doc_id)
//			console.log(ctrl.protocolParts.openedSymptom, sql2)
			readSql({ sql:sql, afterRead:function(r){
				e.children = r.data.list
			}})
		}
		ctrl.seekLogic.seek_engine = function(){
//			console.log(this, ctrl.seekLogic.seek_value, sql_read_node)
			readSql({ sql:sql_read_node.replace(":parent","359247"), afterRead:function(r){
//				console.log(r.data.list)
				ctrl.symptom_list = r.data.list
			}})
		}
		var sql_read_node = "" +
		"SELECT * FROM doc d, (" +
		""+sql_app.select_content_nodes()+
		") n \n" +
		"WHERE n.doc_id=d.doc_id AND parent=:parent \n" +
		"order by sort"
	}
	ctrl.protocolParts.openItem_359215 = function(){
		ctrl.seekLogic.seek_engine = function(){
			console.log(this, ctrl.seekLogic.seek_value)
			readDuodecim_list(ctrl)
		}
	}
	ctrl.protocolParts.clickItem = function(n){
		if(this.openedItem == n){
			delete ctrl.protocolParts.openedItem
			return
		}
		ctrl.protocolParts.openedItem = n
		console.log(n, n.reference)
		if(ctrl.protocolParts['openItem_'+n.reference])
			ctrl.protocolParts['openItem_'+n.reference]()
	}
	ctrl.protocolParts.list = ['Симптоми','Хронологія дій','Діф.діагностика', 'Tex.дані']
	ctrl.protocolParts.openPartNr = function(nr){
		ctrl.protocolParts.openedPart = ctrl.protocolParts.list[nr]
		ctrl.protocolParts.openedPartNr = nr
	}
	ctrl.protocolParts.openPartNr(startPartNr)
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


var list2tree = function(ctrl, r, objectName, fn_extra){
//	console.log(r.data.list)
	angular.forEach(r.data.list, function(v,k){
		ctrl.elementsMap[v.doc_id] = v
		if(v.reference){
			ctrl.referencesMap[v.reference] = v
		}
		if(0==k){
			if(objectName)
				ctrl[objectName] = v
		}else if(ctrl.elementsMap[v.parent]){
			if(!ctrl.elementsMap[v.parent].children)
				ctrl.elementsMap[v.parent].children = []
			ctrl.elementsMap[v.parent].children.push(v)
		}else{
			console.error("not tree parent",v)
		}
		if(fn_extra)
			fn_extra(v,k)
	})
}

var readProtocol = function(ctrl){
	var sql = sql_app.select_doc_l8_nodes() //+" ORDER BY l "
	var params_dataModel = replaceParams({sql:sql, rootId:285570})
	params_dataModel.sql += " ORDER BY l, sort"
		//console.log(params_dataModel.sql)
	readSql({ sql:params_dataModel.sql, afterRead:function(r){
		list2tree(ctrl, r, 'protocolDataModel')
//		console.log('protocolDataModel',ctrl.protocolDataModel)
//		console.log(ctrl.protocolDataModel, ctrl.elementsMap, params_dataModel.sql)
	}})
	var params = replaceParams({sql:sql, rootId:ctrl.request.parameters.id})
	params.sql += " ORDER BY l"
	//console.log(params.sql)
	readSql({ sql:params.sql, afterRead:function(r){
		var icpc2_list = [], dif_protocol_list = [], symptom_list = []
		list2tree(ctrl, r, 'protocol', function(v,k){
			if(ctrl.elementsMap[v.parent]){
				if(352331==ctrl.elementsMap[v.parent].reference){
					icpc2_list.push(v.reference)
				}else
				if(359260==ctrl.elementsMap[v.parent].reference){
					symptom_list.push(v.doc_id)
				}else
				if(359215==ctrl.elementsMap[v.parent].reference){
					dif_protocol_list.push(v.reference)
				}
			}
		})
		angular.forEach(symptom_list, function(s_id){
			var params_dataModel = replaceParams({sql:sql_app.select_doc_l8_nodes(), rootId:ctrl.elementsMap[s_id].reference})
			params_dataModel.sql += " ORDER BY l, sort"
			readSql({ sql:params_dataModel.sql, afterRead:function(r){
				list2tree(ctrl, r)
				console.log(
					ctrl.elementsMap[ctrl.elementsMap[s_id].reference]
					, ctrl.elementsMap[s_id].reference
				)
			}})
		})
		var in_dif_protocol = ctrl.listToInSQL(dif_protocol_list)
		if(in_dif_protocol.length > 2){
			var sql_dif_protocol_name = "" +
			"SELECT d1.*, d2.value protocol_name FROM doc d1 \n" +
			"LEFT JOIN string_u ON string_u_id=d1.doc_id \n" +
			"LEFT JOIN (SELECT * FROM doc,string WHERE doc_id=string_id) d2 ON d2.parent=d1.doc_id AND d2.reference=285578 \n" +
			"  WHERE d1.doc_id \n" +
			" IN " + in_dif_protocol
			//console.log(sql_dif_protocol_name, in_dif_protocol, in_dif_protocol.length)
			readSql({ sql:sql_dif_protocol_name, afterRead:function(r2){
				angular.forEach(r2.data.list, function(v2,k2){
					ctrl.referencesMap[v2.doc_id].protocol_name = v2.protocol_name
//				ctrl.referencesMap[v2.reference] = v2
				})
			}})
		}
		var sql_icpc2_i18n = "SELECT * FROM doc,string \n" +
		"WHERE string_id=doc_id AND parent= 285597 \n" +
		"AND reference IN " + ctrl.listToInSQL(icpc2_list)
		//console.log(icpc2_list, sql_icpc2_i18n)
		readSql({ sql:sql_icpc2_i18n, afterRead:function(r2){
			angular.forEach(r2.data.list, function(v2,k2){
				ctrl.referencesMap[v2.reference] = v2
			})
		}})
		console.log(ctrl.protocol
				, ctrl.referencesMap
				, ctrl.referencesMap[285578]
				)
	}})
}

