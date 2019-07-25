var app = angular.module('myApp', ['ngSanitize']);
var exe_fn = {}
var initApp = function($scope, $http, ctrl){
	ctrl.i18 = {}
	$scope.elementsMap = {}
	ctrl.elementsMap = $scope.elementsMap
	ctrl.new_obj_list = []
	
	build_request($scope)
	console.log($scope.request.parameters)
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
			return tE.value + ' ' + tE.doc_id
	}
}

var initDocEditor = function(ctrl){
	ctrl.db_obj_counter = 100
	ctrl.initEditDoc = function(){
		ctrl.new_obj_counter = 1
		ctrl.template_to_data = {}
		ctrl.changed_data = {}
	}
	ctrl.initEditDoc()
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
//				saveV.sql = sql
				console.log(sql, val)
//				saveV.dataAfterSave = function(response){
//					console.log(response.data)
//				}
//				writeSql(saveV)
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
				if(response.data.nextDbId1)
					v.doc_id = response.data.nextDbId1
			}
			saveV.sql = sql
			writeSql(saveV)
		})
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
	ctrl.disabled_field = function(tE){ return !ctrl.edit_clinic }
	var array_doctype = function(){ return [32,33,34,35,36,37] }
	ctrl.isArrayDocNode = function(tE){ return array_doctype().includes(tE.doctype) }
	var create_new_dE = function(tE){
		var dataEl = {}
		dataEl.parent = ctrl.template_to_data[tE.parent].doc_id
		dataEl.reference = tE.doc_id
		dataEl.doc_id = ctrl.new_obj_counter++
		el_to_tree(ctrl, dataEl)
		return dataEl
	}
	ctrl.focus_field = function(tE){
		if(ctrl.template_to_data[tE.doc_id]){
		}else{
			create_new_dE(tE)
		}
	}
	ctrl.setEditDoc = function(clinicEl){
		ctrl.initEditDoc()
		ctrl.edit_clinic = clinicEl
		el_to_tree(ctrl, clinicEl)
	}
}

function el_to_tree(ctrl, dataEl) {
	ctrl.elementsMap[dataEl.doc_id] = dataEl
	//console.log(dataEl.parent, dataEl.reference, ctrl.elementsMap[dataEl.reference], dataEl)
	var tE = ctrl.elementsMap[dataEl.reference]
	if(tE){
		if(ctrl.isArrayDocNode(tE)){
			if(!ctrl.template_to_data[dataEl.reference])
				ctrl.template_to_data[dataEl.reference] = {}
			ctrl.template_to_data[dataEl.reference][dataEl.doc_id] = dataEl
			console.log(tE.doctype, tE, ctrl.template_to_data[dataEl.reference])
		}else{
			ctrl.template_to_data[dataEl.reference] = dataEl
		}
	}
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
	if(!obj) obj = params
	exe_fn.httpGet(exe_fn.httpGet_j2c_table_db1_params_then_fn(
	params,
	function(response) {
		obj.list = response.data.list
		if(obj.afterRead){
			obj.afterRead(response)
		}else if(params.afterRead){
			params.afterRead(response)
		}
	}))
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
	return params.sql
}

var mapElement = function(element, elementsMap){
	elementsMap[element.doc_id] = element
	angular.forEach(element.children, function(el){
		mapElement(el, elementsMap)
	})
	return elementsMap
}

var sql_app = {}
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
sql_app.select_doc_l8_nodes= function(){ 
	return "SELECT * FROM (\n" +
	sql_app.select_doc_l8() +
	") t, (\n" +
	sql_app.select_content_nodes() +
	"\n) n WHERE t.doc_id=n.doc_id"
}
sql_app.select_content_nodes = function(){ 
	return "SELECT doc_id, s.value d_s FROM doc d " +
	"LEFT JOIN string s ON d.doc_id=s.string_id "
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

sql_app.amk025_template = function(){
	return "SELECT * FROM doc d2, doc d1,docbody " +
	"WHERE d1.doc_id=docbody_id AND d2.doc_id=d1.parent AND d2.doctype IN (6,17) AND d1.reference=:jsonId"
}

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
//	console.log($scope.request)
	$scope.request.path = window.location.pathname.split('.html')[0].split('/').reverse()
	$scope.request.parameters={};
	if(window.location.search.split('?')[1]){
		angular.forEach(window.location.search.split('?')[1].split('&'), function(value, index){
			var par = value.split("=");
			$scope.request.parameters[par[0]] = par[1];
		});
	}
}

