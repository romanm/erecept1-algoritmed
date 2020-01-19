var app = angular.module('myApp', ['ngSanitize']);
var conf = {dataModelList : {}}
var exe_fn = {}
var sql_app = {}
var ctrl
var initApp = function($scope, $http, $timeout){
	ctrl.i18 = {}
	$scope.elementsMap = {}
	ctrl.elementsMap = $scope.elementsMap
	ctrl.referencesMap = {}
	ctrl.new_obj_list = []
	
	build_request($scope)
//	console.log($scope.request.parameters)
	ctrl.request = $scope.request
	$scope.openUrl = function(url){
		console.log(url)
		window.location.href = url;
	}
	exe_fn = new Exe_fn($scope, $http);
	exe_fn.httpGet_j2c_table_db1_params_then_fn = function(params, then_fn){
		return {
			url : '/r/url_sql_read_db1',
			params : params,
			then_fn : then_fn,
			error_fn : params.error_fn,
	}	}
	ctrl.i18_name = function(tE){
		if(ctrl.i18[tE.doc_id])
			return ctrl.i18[tE.doc_id].value
		else
			return (tE.d_s||tE.value) + ' ' + tE.doc_id
	}
	ctrl.isArrayDocNode = function(tE){ return array_doctype().includes(tE.doctype) }

	ctrl.listToInSQL = function(list){
		var inIcpc2 = JSON.stringify(list)
		.replace('[','(')
		.replace(']',')')
		.replace(/"/g,"'")
		.replace(/'(\d)/g,"'-$1")
		.replace(/'(\*)/g,"'-")
//		console.log(list, inIcpc2)
		return inIcpc2
	}

	ctrl.edProtocol = {}
	ctrl.edProtocol.saveName = function(){
		if(ctrl.edProtocol.o.protocol_name_id){
			ctrl.edProtocol.o.sql ="" +
			"UPDATE string SET value = :protocol_name WHERE string_id=:protocol_name_id;"
			replaceParams(ctrl.edProtocol.o)
			writeSql({sql : ctrl.edProtocol.o.sql, dataAfterSave:function(response){
				console.log(response.data)
			}})
		}else{
			ctrl.edProtocol.o.sql = "" +
			"INSERT INTO doc (reference, parent, doc_id) VALUES (285578, :protocol_id, :nextDbId1); \n"+
			"INSERT INTO string (string_id, value) VALUES (:nextDbId1, :protocol_name); \n"
			replaceParams(ctrl.edProtocol.o)
			console.log(ctrl.edProtocol)
			writeSql({sql : ctrl.edProtocol.o.sql, dataAfterSave:function(response){
				console.log(response.data)
				ctrl.edProtocol.o.protocol_name_id = response.data.nextDbId1
			}})
		}
	}
	ctrl.edProtocol.edName = function(o){
		if(ctrl.edProtocol.o == o){
			delete ctrl.edProtocol.o
		}else{
			ctrl.edProtocol.o = o
		}
		console.log(ctrl.edProtocol.o, o)
	}

	ctrl.random = {}
	ctrl.random.edProtocol = {}
	ctrl.random.edProtocol.diapason = 7
	ctrl.random.home2 = {}
	ctrl.random.home2.diapason = 2
	ctrl.random.newValue = function(name, valueName){
		if(!valueName) valueName = 'value'
		this[name][valueName] = getRandomInt(this[name].diapason)
	}
	angular.forEach(ctrl.random, function(v,k){ ctrl.random.newValue(k)})
//	console.log(ctrl.random)

	initSeekLogic(ctrl, $timeout)

}

var initSeekLogic = function(ctrl, $timeout){
	var _timeout_of_seek
	ctrl.seekLogic = {}
	ctrl.seekLogic.seek_value
	ctrl.seekLogic.seek_remove = function(){
		delete ctrl.seekLogic.seek_value
	}
	ctrl.seekLogic.seek_fn = function(){
		if(_timeout_of_seek) $timeout.cancel(_timeout_of_seek);
		_timeout_of_seek = $timeout(function() {
			console.log(ctrl.seekLogic.seek_value)
			if(ctrl.seekLogic.seek_engine)
				ctrl.seekLogic.seek_engine()
		}, 1000)
	}
	ctrl.highlight = function(text, search){
		if (!text) return
		if (!search) return text;
		return (''+text).replace(new RegExp(search, 'gi'), '<span class="w3-yellow">$&</span>');
	}
}

//ctrl.icpc2GroupInSQL = function(){
var fn_icpc2GroupInSQL = function(ctrl){
	var icpc2GroupInSQL = ""
	if(ctrl.db_icpc2){
		if(ctrl.db_icpc2.clickColor){
//				console.log(ctrl.db_icpc2.clickColor)
			if('green' == ctrl.db_icpc2.clickColor){
				icpc2GroupInSQL = " icpc2int<30 "
			}else if('diagnosis' == ctrl.db_icpc2.clickColor){
				icpc2GroupInSQL = " icpc2int>69 "
			}else{
				icpc2GroupInSQL = " icpc2 IN " + 
				ctrl.listToInSQL(ctrl.db_icpc2.color[ctrl.db_icpc2.clickColor].codeList)
			}
		}
		if(ctrl.db_icpc2.clickOrgan){
			if(icpc2GroupInSQL.length>0) icpc2GroupInSQL += " AND "
				icpc2GroupInSQL += " SUBSTRING(icpc2,0,2)='" + ctrl.db_icpc2.clickOrgan + "'"
		}
		if(icpc2GroupInSQL.length>0)
			icpc2GroupInSQL = " WHERE " + icpc2GroupInSQL
	}
//	console.log(icpc2GroupInSQL)
	return icpc2GroupInSQL
}

var readICPC2_MCRDB3 = function(ctrl){
	var sql = "SELECT * FROM docbody where docbody_id=287135"
	readSql({ sql:sql, afterRead:function(response){
		ctrl.db_icpc2 = JSON.parse(response.data.list[0].docbody.replace(/''/g,"'"))
//		console.log(Object.keys(ctrl.db_icpc2.group))
//		console.log(ctrl.db_icpc2)
		ctrl.db_icpc2.groupKeys = Object.keys(ctrl.db_icpc2.group)
		angular.forEach(ctrl.db_icpc2.group, function(v,k){
			ctrl.elementsMap[v.doc_id] = v
			angular.forEach(v.children, function(v2,k2){
				ctrl.elementsMap[v2.doc_id] = v2
			})
		})
//		console.log(ctrl.elementsMap)
		ctrl.click_icpc2_color = function(kc){
		console.log(kc)
			if(ctrl.db_icpc2.clickColor == kc){
				delete ctrl.db_icpc2.clickColor
				delete ctrl.db_icpc2.clickColorObject
			}else{
				ctrl.db_icpc2.clickColor = kc
				ctrl.db_icpc2.clickColorObject = {}
				ctrl.db_icpc2.clickColorObject[kc] = ctrl.db_icpc2.color[kc]
			}
			if(ctrl.seekLogic.seek_engine)
				ctrl.seekLogic.seek_engine()

		}
		ctrl.click_icpc2_organ = function(kg){
			console.log(kg, ctrl.db_icpc2.group[kg])
			if(ctrl.db_icpc2.clickOrgan == kg){
				delete ctrl.db_icpc2.clickOrgan
				delete ctrl.db_icpc2.clickOrganObject
			}else{
				ctrl.db_icpc2.clickOrgan = kg
				ctrl.db_icpc2.clickOrganObject = {}
				ctrl.db_icpc2.clickOrganObject[kg] = ctrl.db_icpc2.group[kg]
			}
			if(ctrl.seekLogic.seek_engine)
				ctrl.seekLogic.seek_engine()
		}
	}})
}
var readICPC2_MCRDB2 = function(ctrl){
	readICPC2_MCRDB3(ctrl)
	ctrl.click_icpc2_organs_sort = function(k){
//		console.log(k, ctrl.icpc2_organs.sort)
		var ascDesc = ctrl.icpc2_organs.sort.substring(0,1)
		if(ctrl.icpc2_organs.sort.includes(k)){
			ascDesc = ascDesc=='-'?'+':'-'
			ctrl.icpc2_organs.sort = ascDesc+ctrl.icpc2_organs.sort.substring(1)
		}else{
			ctrl.icpc2_organs.sort = ascDesc+k
		}
	}
	ctrl.read_icpc2_organs = function(){
		var sql = sql_app.selectICPC2_group_ICD10_count(320730, ctrl)
		console.log(sql, ctrl.db_icpc2.group)
		readSql({ sql:sql, afterRead:function(response){
			if(!ctrl.icpc2_organs){
				ctrl.icpc2_organs = {}
				ctrl.icpc2_organs.sort = '+g'
			}
			ctrl.icpc2_organs.list = response.data.list
			console.log(ctrl.icpc2_organs)
		}})
	}
	ctrl.click_icpc2_organs = function(){
		if(ctrl.icpc2_organs){
			delete ctrl.icpc2_organs
		}else{
			ctrl.read_icpc2_organs()
		}
	}

	ctrl.clickItem_ICD10_with_ICPC2 = function(icd10){
		ctrl.item_ICD10 = icd10
		if(!ctrl.icd10_with_ICPC2){
			delete ctrl.item_ICD10
		}
	}
	ctrl.click_ICD10_with_ICPC2 = function(){
		if(ctrl.icd10_with_ICPC2){
			delete ctrl.icd10_with_ICPC2
			return
		}
//		var sql = sql_app.selectICD10_with_ICPC2() + "ORDER BY l, v"
		var sql = sql_app.selectICD10i18n_with_ICPC2() + "ORDER BY l, v"
//		console.log(sql)
		readSql({ sql:sql, afterRead:function(r){
			ctrl.icd10_with_ICPC2 = {children:[]}
			console.log(r.data)
			angular.forEach(r.data.list, function(v,k,o){
				ctrl.elementsMap[v.id] = v
//				console.log(k,v,ctrl.elementsMap[v.p])
				if(ctrl.elementsMap[v.p]){
					if(!ctrl.elementsMap[v.p].children)
						ctrl.elementsMap[v.p].children = []
					ctrl.elementsMap[v.p].children.push(v)
				}else{
					ctrl.icd10_with_ICPC2.children.push(v)
				}
			})
			console.log(ctrl.icd10_with_ICPC2)
		}})
	}
}

sql_app.selectICD10_code_level = function(){ return "" +
	"SELECT parent p, doc_id id, value v, treelevel l " +
	" FROM string_u, sort, doc where doc_id=sort_id and sort_id=string_u_id and group_id=61"
}
sql_app.selectICD10i18n_with_ICPC2 = function(){ return "" +
	"SELECT a.*, value i18n FROM ( \n" +
	sql_app.selectICD10_with_ICPC2() +
	"\n) a " +
	", (SELECT reference,s.* FROM doc, string s WHERE string_id=doc_id AND parent = 287138) b \n" +
	"WHERE a.id=b.reference "
}
sql_app.selectICD10_with_ICPC2 = function(){ return "" +
	"SELECT v, count(v), min(p) p, min(id) id, min(l) l, min(icpc2), max(icpc2) FROM ( \n" +
	"SELECT l2.*, a.* FROM (SELECT d.*, value icpc2 FROM doc d,string_u where string_u_id=reference and parent = 320730 ) a \n" +
	",(" + sql_app.selectICD10_code_level() + ") l0 \n" +
	",(" + sql_app.selectICD10_code_level() + ") l1 \n" +
	",(" + sql_app.selectICD10_code_level() + ") l2 \n" +
	"WHERE l0.id=a.reference2 \n" +
	"AND l0.p=l1.id \n" +
	"AND l1.p=l2.id \n" +
	"ORDER BY icpc2 \n" +
	") a GROUP BY v "
}

var array_doctype = function(){ return [32,33,34,35,36,37] }

var initDocEditor = function(ctrl){
	
	read_jsonDocBody(ctrl, {
		jsonId:conf.eHealthInUA_id,
		afterRead:function(ctrl){
			ctrl.editDocTemplate = ctrl.elementsMap[conf.dataModelTemplateId]
			console.log(ctrl.editDocTemplate)
			read_i18_ua_of_doc(ctrl, conf.dataModelTemplateId)
		},
	})

	ctrl.db_obj_counter = 100
	ctrl.initEditDoc = function(){
		ctrl.new_obj_counter = 1
		ctrl.template_to_data = {}
		ctrl.changed_data = {}
	}
	ctrl.initEditDoc()
	read_jsonDocBody(ctrl, {
		jsonId:285518,
		afterRead:function(ctrl){
			ctrl.dataModelEditor001 = ctrl.elementsMap[285522]
			console.log(ctrl.dataModelEditor001)
		},
	})
	ctrl.saveEditDoc = function(){
		console.log(ctrl.changed_data)
		angular.forEach(ctrl.changed_data, function(v,k){
			var content_table, sql, val
			var tE = ctrl.elementsMap[v.reference]
			if(v.d_s || 32==tE.doctype){
				content_table = "string"
				val = v.d_s
			}
			var saveV = Object.assign({}, v)
			console.log(tE, saveV)
			if(v.doc_id>ctrl.db_obj_counter){//UPDATE
				if(ctrl.isSelectEl(tE)){
					sql = "UPDATE doc SET reference2=:reference2 WHERE doc_id=:doc_id;"
				}else
				if(val){
					sql = "UPDATE :content_table SET value=:val WHERE :content_table_id=:doc_id; "
					sql = sql
					.replace(new RegExp(":content_table", 'gi'), content_table)
					.replace(new RegExp(":val", 'gi'), "'"+val+"'")
					sql += sql_app.select_content_nodes()+" WHERE doc_id=:doc_id"
				}else{//DELETE
					sql = "DELETE FROM doc WHERE doc_id=:doc_id; "
				}
				console.log(sql, val)
			}else{//INSERT
				if(ctrl.isSelectEl(tE)){
					sql  = "INSERT INTO doc (doc_id, doctype, parent, reference, reference2) " +
					"VALUES (:nextDbId1, 18, :parent, :reference, :reference2); "
					console.log(v, tE, ctrl.isSelectEl(tE), sql)
				}else{
					saveV.val = val
					sql  = "INSERT INTO doc (doc_id, doctype, parent, reference) VALUES (:nextDbId1, 18, :parent, :reference); "
					sql += "INSERT INTO :content_table (:content_table_id, value) VALUES (:nextDbId1, :val); "
					sql += sql_app.select_content_nodes()+" WHERE doc_id=:nextDbId1"
					sql = sql
					.replace(new RegExp(":content_table", 'gi'), content_table)
				}
			}
			saveV.dataAfterSave = function(response){
				console.log(response.data, response.data.nextDbId1, v)
				if(response.data.nextDbId1){
					delete ctrl.elementsMap[v.doc_id]
					v.doc_id = response.data.nextDbId1
					ctrl.elementsMap[v.doc_id] = v
				}
			}
			saveV.sql = sql
			writeSql(saveV)
		})
	}
	ctrl.createDataModelEntity = function(){
		console.log(conf.dataModelList.parentId, conf.dataModelTemplateId)
		ctrl.newDataModelEntity(conf.dataModelList.parentId, conf.dataModelTemplateId)
	}
	ctrl.newDataModelEntity = function(parentId, dataModelId){
		var params = {}
		params.parentId = parentId
		params.dataModelId = dataModelId
		params.sql = "INSERT INTO doc (doc_id, parent,doctype, reference) VALUES (:nextDbId1, :parentId, 18, :dataModelId ); " +
		"SELECT * FROM doc WHERE doc_id=:nextDbId1;"
		if(conf.dataModelList.sql_newEl)
			params.sql = conf.dataModelList.sql_newEl(ctrl)
		console.log(params.sql)
		params.dataAfterSave = function(response){
			console.log(response.data)
			ctrl.setEditDoc(response.data.list1[0])
			ctrl.dataModelList.unshift(ctrl.dataModelEl)
		}
		writeSql(params)
	}
	ctrl.isSelectEl = function(tE){
		return tE.reference && (tE.doctype==18)
	}
	ctrl.addArrayEl = function(tE){
		if(ctrl.isArrayDocNode(tE)){
			console.log(tE.doctype, tE)
			console.log(ctrl.template_to_data[tE.parent])
			var dataEl = create_new_dE(tE)
			dataEl.d_s = ''
			ctrl.changed_data[dataEl.doc_id] = dataEl
		}
	}
	ctrl.isArray = function(tE){
		return tE.doctype>=32 && tE.doctype<=37
	}
	ctrl.change_data_text_field = function(dataEl){
		ctrl.changed_data[dataEl.doc_id] = dataEl
	}
	ctrl.change_text_field = function(tE){
		var dataEl = ctrl.template_to_data[tE.doc_id]
		ctrl.change_data_text_field(dataEl)
	}
	ctrl.disabled_field = function(tE){ 
		return !ctrl.dataModelEl
	}
	var create_new_dE = function(tE){
		var dataEl_parent = ctrl.template_to_data[tE.parent]
		if(!dataEl_parent){
			var tE_parent = ctrl.elementsMap[tE.parent]
			var dataEl_2parent = ctrl.template_to_data[tE_parent.parent]
			dataEl_parent = {}
			dataEl_parent.parent = dataEl_2parent.doc_id
			dataEl_parent.reference = tE.parent
			var saveV = Object.assign({}, dataEl_parent)
			console.log(tE_parent, dataEl_2parent, saveV)
			saveV.sql = "INSERT INTO doc (doc_id, doctype, parent, reference) " +
			"VALUES (:nextDbId1, 18, :parent, :reference); "
			saveV.dataAfterSave = function(response){
				console.log(response.data, response.data.nextDbId1, saveV)
				dataEl_parent.doc_id = response.data.nextDbId1
				ctrl.elementsMap[dataEl_parent.doc_id] = dataEl_parent
		 		ctrl.template_to_data[tE.parent] = dataEl_parent
				console.log(dataEl_parent)
				create_new_dE(tE)
			}
			writeSql(saveV)
		}else{
			var dataEl = {}
			dataEl.parent = dataEl_parent.doc_id
			dataEl.reference = tE.doc_id
			dataEl.doc_id = ctrl.new_obj_counter++
			console.log(dataEl)
			el_to_tree(ctrl, dataEl)
		}
		return dataEl
	}
	ctrl.focus_field = function(tE){
		if(ctrl.template_to_data[tE.doc_id]){
		}else{
			create_new_dE(tE)
		}
	}
	ctrl.setEditDoc = function(dataModelEl){
		console.log(dataModelEl)
		ctrl.initEditDoc()
		ctrl.dataModelEl = dataModelEl
		el_to_tree(ctrl, dataModelEl)
	}
}

function el_to_tree(ctrl, dataEl) {
	//console.log(dataEl.parent, dataEl.reference, ctrl.elementsMap[dataEl.reference], dataEl)
	var tE = ctrl.elementsMap[dataEl.reference]
	if(tE){
		if(ctrl.isArrayDocNode(tE)){
			if(!ctrl.template_to_data[dataEl.reference])
				ctrl.template_to_data[dataEl.reference] = {}
			ctrl.template_to_data[dataEl.reference][dataEl.doc_id] = dataEl
//			console.log(tE.doctype, tE, ctrl.template_to_data[dataEl.reference])
		}else{
			ctrl.template_to_data[dataEl.reference] = dataEl
		}
	}
	el_to_tree0(ctrl, dataEl)
}
function el_to_tree0(ctrl, dataEl) {
	ctrl.elementsMap[dataEl.doc_id] = dataEl
	if(ctrl.elementsMap[dataEl.parent]){
		if(!ctrl.elementsMap[dataEl.parent].children){
			ctrl.elementsMap[dataEl.parent].children = []
			ctrl.elementsMap[dataEl.parent].children_ids = []
		}
		if(!ctrl.elementsMap[dataEl.parent].children_ids.includes(dataEl.doc_id)){
			ctrl.elementsMap[dataEl.parent].children.push(dataEl)
			ctrl.elementsMap[dataEl.parent].children_ids.push(dataEl.doc_id)
		}
	}
}

var writeSql = function(data){
	replaceParams(data)
	exe_fn.httpPost
	({	url:'/r/url_sql_read_db1',
		then_fn:function(response) {
//			console.log(response.data)
			if(data.dataAfterSave)
				data.dataAfterSave(response)
		},
		data:data,
	})
}

function readSql(params, obj){
//	console.log(params)
	replaceParams(params)
	if(!params.error_fn)
		params.error_fn = function(response){
			console.error(response)
			console.error(response.config.params.sql)
		}
	if(!obj) obj = params
	exe_fn.httpGet(exe_fn.httpGet_j2c_table_db1_params_then_fn(
	params,
	function(response) {
//		obj.list = response.data.list
		if(obj.afterRead){
			obj.afterRead(response)
		}else if(params.afterRead){
			params.afterRead(response)
		}
	}))
}

function read_jsonDocBody(ctrl, params) { readSql({
	sql:sql_app.amk025_template(),
	jsonId:params.jsonId,
	afterRead:function(response){
		ctrl.docbodyeHealthInUA = JSON.parse(response.data.list[0].docbody).docRoot
		mapElement(ctrl.docbodyeHealthInUA,ctrl.elementsMap)
		params.afterRead(ctrl)
	}
})}

function read_dataModelList(ctrl, sql){ readSql({
	sql:sql,
	parentId:conf.dataModelList.parentId,
	afterRead:function(response){
		ctrl.dataModelList = response.data.list
		angular.forEach(response.data.list, function(v,k){
			ctrl.elementsMap[v.doc_id] = v
		})
		console.log(ctrl.dataModelList, sql, conf.dataModelList.parentId)
		if(conf.editDocId){
			var clinicEl = ctrl.elementsMap[conf.editDocId]
			if(clinicEl){
				ctrl.setEditDoc(clinicEl)
				//ctrl.readTree(clinicEl)
				read_tree(ctrl, clinicEl.doc_id)
			}
		}
	}
})}

function read_tree(ctrl, rootId) {
	var sql = sql_app.select_doc_l8_nodes() + " ORDER BY l "
	var list_el_to_tree = function(v){
		if(v.doc_id!=rootId){
			el_to_tree(ctrl, v)
		}
	}
	readSql({ sql:sql, rootId:rootId,
		afterRead:function(response){ angular.forEach(response.data.list, list_el_to_tree) }
	})
}

function replaceParams(params){
	angular.forEach(params.sql.split(':'), function(v,k){
		if(k>0){
			var p = v.split(' ')[0].replace(')','').replace(',','').replace(';','').trim()
			var pv = params[p]
			if(pv){
				params.sql = params.sql.replace(':'+p, "'"+pv+"'")
			}
		}
	})
	return params
}

var mapElement = function(element, elementsMap){
	elementsMap[element.doc_id] = element
	angular.forEach(element.children, function(el){
		mapElement(el, elementsMap)
	})
	return elementsMap
}

sql_app.select_icpc2_i18n_values = function(){
	return "SELECT a.*, s.value i18n FROM ( \n" +
	sql_app.select_icpc2_i18n() +
	") a, string s where a.doc_id=s.string_id " +
	""
}
sql_app.select_icpc2_i18n = function(){
	return "SELECT * FROM doc,string where string_id=reference and parent=285597"
}

sql_app.insert_CODE_i18n_sort = function(parentCodeId, code, parentI18nId, i18n, sort, treeLevel){
	return ("" +
	sql_app.insert_CODE_i18n(parentCodeId, code, parentI18nId, i18n) +
	"INSERT INTO sort (sort_id,sort, treeLevel) VALUES (:nextDbId1,:sort,:treeLevel); \n" +
	"").replace(':sort', sort).replace(':treeLevel', treeLevel)
}
sql_app.insert_CODE_i18n = function(parentCodeId, code, parentI18nId, i18n){
	return "" +
	"INSERT INTO doc (doc_id,parent,doctype) " +
	"VALUES (:nextDbId1, " + parentCodeId + ", 18);\n" +
	"INSERT INTO string (string_id, value) VALUES (:nextDbId1, '" + code + "');\n" +
	"INSERT INTO doc (doc_id,parent,doctype,reference) " +
	"VALUES (:nextDbId2, " + parentI18nId + ", 18, :nextDbId1 );\n" +
	"INSERT INTO string (string_id, value) VALUES (:nextDbId2, '" + i18n.replace(/'/g,"''") + "');\n" +
//	"INSERT INTO string (string_id, value) VALUES (:nextDbId2, '" + i18n.replace(/'/g,"\'") + "');\n" +
	""
}

sql_app.select_i18_ua_of_doc = function(){ 
	return sql_app.select_i18_ua() + 
	" AND d1.reference IN (" +
	sql_app.select_doc_id_l8() +
	") "
}

sql_app.select_i18_ua = function(){ 
	return "SELECT d2.value var, d1.* FROM \n" +
	"(SELECT * FROM doc LEFT JOIN string s ON string_id=doc_id) d1, \n" +
	"(SELECT * FROM doc LEFT JOIN string s ON string_id=doc_id) d2 \n" +
	" WHERE d1.parent = 115924 \n" +
	" AND d2.doc_id=d1.reference"
}
sql_app.select_doc_l8_nodes_sort = function(){ 
	return "SELECT * FROM (\n" +
	sql_app.select_doc_l8_sort() +
	") t, (\n" +
	sql_app.select_content_nodes() +
	"\n) n WHERE t.doc_id=n.doc_id"
}
sql_app.select_doc_l8_nodes= function(){ 
	return "SELECT * FROM (\n" +
	sql_app.select_doc_l8() +
	") t, (\n" +
	sql_app.select_content_nodes() +
	"\n) n WHERE t.doc_id=n.doc_id"
}
sql_app.select_content_nodes = function(){ return "" +
	"SELECT doc_id, o.sort, s.value d_s, sr.value d_sr, s.string_id d_s_id, sr2.value d_sr2, su.value d_su, sur.value d_sur \n" +
	"FROM doc d \n" +
	"LEFT JOIN sort o ON d.doc_id=o.sort_id \n" +
	"LEFT JOIN string s ON d.doc_id=s.string_id \n" +
	"LEFT JOIN string_u su ON d.doc_id=su.string_u_id \n" +
	"LEFT JOIN string sr ON d.reference=sr.string_id \n" +
	"LEFT JOIN string sr2 ON d.reference2=sr2.string_id \n" +
	"LEFT JOIN string_u sur ON d.reference=sur.string_u_id "
}
sql_app.select_doc_id_l8 = function(){ 
	return "SELECT doc_id FROM (" + sql_app.select_doc_l8() + ") x"
}

sql_app.select_dd_for_doc_l8 = function(){ 
	return "SELECT * FROM (" +
	sql_app.select_doc_dd_l8() +
	") y left join (" +
	sql_app.select_i18_ua() +
	") x on x.reference=y.doc_id " +
	"order by l"
}
sql_app.select_doc_dd_l8 = function(){ 
	return "SELECT 0 l, * FROM doc WHERE doc_id IN (" +
	sql_app.select_doc_dd_id_l8() +
	") \n" +
	"UNION \n" +
	"SELECT 1 l, d1.* FROM doc d1 WHERE parent IN (" +
	sql_app.select_doc_dd_id_l8() +
	") "
}
sql_app.select_doc_dd_id_l8 = function(){ 
	return "SELECT doc_id FROM doc where parent=115920 " +
	"and doc_id in (SELECT reference FROM (" +
	sql_app.select_doc_l8() +
	")x ) \n"
}

sql_app.select_doc_l8_sort = function(){ 
	return "SELECT * FROM (" +
	sql_app.select_doc_l8() +
	") x LEFT JOIN sort ON doc_id=sort_id " +
	"ORDER BY l, sort"
}

sql_app.select_doc_l8 = function(){ 
	return "SELECT 0 l, * FROM doc WHERE doc_id=:rootId \n" +
	"UNION \n" +
	"SELECT 1 l, d1.* FROM doc d1 WHERE parent=:rootId \n" +
	"UNION \n" +
	"SELECT 2 l, d2.* FROM doc d2, doc d1 WHERE d1.parent=:rootId AND d2.parent=d1.doc_id \n" +
	"UNION \n" +
	"SELECT 3 l, d3.* FROM doc d3, doc d2, doc d1 WHERE d1.parent=:rootId AND d2.parent=d1.doc_id AND d3.parent=d2.doc_id \n" +
	"UNION \n" +
	"SELECT 4 l, d4.* FROM doc d4, doc d3, doc d2, doc d1 " +
	"WHERE d1.parent=:rootId AND d2.parent=d1.doc_id AND d3.parent=d2.doc_id AND d4.parent=d3.doc_id \n" +
	"UNION \n" +
	"SELECT 5 l, d5.* FROM doc d5, doc d4, doc d3, doc d2, doc d1 " +
	"WHERE d1.parent=:rootId AND d2.parent=d1.doc_id AND d3.parent=d2.doc_id AND d4.parent=d3.doc_id AND d5.parent=d4.doc_id \n" +
	"UNION \n" +
	"SELECT 6 l, d6.* FROM doc d6, doc d5, doc d4, doc d3, doc d2, doc d1 " +
	"WHERE d1.parent=:rootId AND d2.parent=d1.doc_id AND d3.parent=d2.doc_id AND d4.parent=d3.doc_id AND d5.parent=d4.doc_id " +
	"AND d6.parent=d5.doc_id \n" +
	"UNION \n" +
	"SELECT 7 l, d7.* FROM doc d7, doc d6, doc d5, doc d4, doc d3, doc d2, doc d1 " +
	"WHERE d1.parent=:rootId AND d2.parent=d1.doc_id AND d3.parent=d2.doc_id AND d4.parent=d3.doc_id AND d5.parent=d4.doc_id " +
	"AND d6.parent=d5.doc_id AND d7.parent=d6.doc_id \n" +
	"UNION \n" +
	"SELECT 8 l, d8.* FROM doc d8, doc d7, doc d6, doc d5, doc d4, doc d3, doc d2, doc d1 " +
	"WHERE d1.parent=:rootId AND d2.parent=d1.doc_id AND d3.parent=d2.doc_id AND d4.parent=d3.doc_id AND d5.parent=d4.doc_id " +
	"AND d6.parent=d5.doc_id AND d7.parent=d6.doc_id AND d8.parent=d7.doc_id "
}

sql_app.read_list_legalEntity = function(){
	return "SELECT * FROM doc row " +
	"LEFT JOIN (" +
	"SELECT * FROM doc, string s2 " +
	"WHERE reference=115783 AND doc_id=string_id " +
	") short_name ON row.doc_id=short_name.parent "
}

sql_app.amk025_template = function(){
	return "SELECT * FROM doc d2, doc d1,docbody " +
	"WHERE d1.doc_id=docbody_id AND d2.doc_id=d1.parent AND d2.doctype IN (6,17) AND d1.reference=:jsonId"
}

sql_app.read_ICPC2_duodecim_protocol_name002 = "" +
"SELECT a.*, b.doc_id protocol_name_id, protocol_name" +
", CASE WHEN b.doc_id IS NULL THEN 0 ELSE 1 END with_name FROM ( \n" +
"SELECT doc_id protocol_id, value ebmname " +
"FROM doc, string_u WHERE string_u_id=doc_id AND parent= 285581 \n" +
") a LEFT JOIN (SELECT d.*, value protocol_name FROM doc d,string " +
"WHERE string_id=doc_id AND reference= 285578 ) b ON b.parent=a.protocol_id \n"

function Exe_fn($scope, $http){
	this.httpGet=function(progr_am){
		if(progr_am.error_fn)
			$http
			.get(progr_am.url, {params:progr_am.params})
			.then(progr_am.then_fn, progr_am.error_fn)
		else
			$http
			.get(progr_am.url, {params:progr_am.params})
			.then(progr_am.then_fn)
	}
	this.httpPost=function(progr_am){
		if(progr_am.error_fn)
			$http.post(progr_am.url, progr_am.data)
			.then(progr_am.then_fn, progr_am.error_fn)
		else
			$http.post(progr_am.url, progr_am.data)
			.then(progr_am.then_fn)
	}
}

function build_request($scope){
	$scope.request={};
//	console.log($scope.request, window.location)
//	console.log($scope.request)
	$scope.request.hostname = window.location.hostname
	$scope.request.getDbConfigHostname = function(){
		if('localhost'!=$scope.request.hostname){
			return $scope.request.hostname
		}else{
			return $scope.request.hostname+':8040'
		}
	}
	$scope.request.path = window.location.pathname.split('.html')[0].split('/').reverse()
	$scope.request.parameters={};
	if(window.location.search.split('?')[1]){
		angular.forEach(window.location.search.split('?')[1].split('&'), function(value, index){
			var par = value.split("=");
			$scope.request.parameters[par[0]] = par[1];
		});
	}
}

function read_i18_ua_of_doc(ctrl, rootId) {
//	var sql = sql_app.select_i18_ua() + " LIMIT 22"
	var sql = sql_app.select_i18_ua_of_doc()
	readSql({
		sql:sql,
		rootId:rootId,
		afterRead:function(response){
			angular.forEach(response.data.list, function(v,k){
				ctrl.i18[v.reference] = v
			})
		}
	})
}

function getRandomInt(max) {
	return Math.floor(Math.random() * Math.floor(max));
}

function read_mergeList(dataObjectName, sql, asFirst, limit, printObject) {
	if(!limit) limit = 100
	sql += " LIMIT "+limit
	readSql({sql:sql, afterRead:function(response){
		if(!ctrl[dataObjectName])
			ctrl[dataObjectName] = []
		if(ctrl.after_mergeList)
			ctrl.after_mergeList(response)
		if(asFirst){
			ctrl[dataObjectName] =  response.data.list.concat(ctrl[dataObjectName])
		}else{
			ctrl[dataObjectName] = ctrl[dataObjectName].concat(response.data.list)
		}
//		console.log(response.data.list, ctrl[dataObjectName])
		if(printObject)
			console.log(dataObjectName,'\n',ctrl[dataObjectName], sql)
	}})
}

function read_dataObject(dataObjectName, sql, limit, printObject) {
	if(!limit) limit = 100
	sql += " LIMIT "+limit
	readSql({sql:sql, afterRead:function(response){
		ctrl[dataObjectName] = response.data.list
		if(printObject)
			console.log(dataObjectName,'\n',ctrl[dataObjectName], sql)
	}})
}

function read_dataObject2fn(sql, afterRead, limit) {
	if(!limit) limit = 100
	sql += " LIMIT "+limit
	readSql({sql:sql, afterRead:function(response){afterRead(response)}})
}
