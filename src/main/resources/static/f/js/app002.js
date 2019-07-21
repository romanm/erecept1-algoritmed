var app = angular.module('myApp', ['ngSanitize']);
var exe_fn = {}
var initApp = function($scope, $http, ctrl){
	ctrl.i18 = {}
	$scope.elementsMap = {}
	ctrl.elementsMap = $scope.elementsMap
	ctrl.new_obj_list = []
	
	exe_fn = new Exe_fn($scope, $http);
	exe_fn.httpGet_j2c_table_db1_params_then_fn = function(params, then_fn){
		return {
			url : '/r/url_sql_read_db1',
			params : params,
			then_fn : then_fn,
			error_fn : params.error_fn,
	}	}

	ctrl.i18_name = function(leE){
		if(ctrl.i18[leE.doc_id])
			return ctrl.i18[leE.doc_id].value
		else 
			return leE.value + ' ' + leE.doc_id
	}
}

var initDocEditor = function(ctrl){
	ctrl.new_obj_counter = 1
	ctrl.template_to_data = {}
	ctrl.changed_data = {}
	ctrl.saveEditDoc = function(){
		console.log(ctrl.changed_data)
	}
	ctrl.change_text_field = function(leE){
		var dataEl = ctrl.template_to_data[leE.doc_id]
		ctrl.changed_data[dataEl.doc_id] = dataEl
	}
	ctrl.focus_field = function(leE){
		if(ctrl.template_to_data[leE.doc_id]){
		}else{
			var v = {}
			v.parent = ctrl.template_to_data[leE.parent].doc_id
			v.reference = leE.doc_id
			v.doc_id = ctrl.new_obj_counter++
			el_to_tree(ctrl, v)
		}
	}
	ctrl.setEditDoc = function(clinicEl){
		ctrl.edit_clinic = clinicEl
		el_to_tree(ctrl, clinicEl)
	}
}

function el_to_tree(ctrl, v) {
	ctrl.elementsMap[v.doc_id] = v
	console.log(v.parent, v.reference, ctrl.elementsMap[v.reference], v)
	if(ctrl.elementsMap[v.reference]){
		ctrl.template_to_data[v.reference] = v
	}
	if(ctrl.elementsMap[v.parent]){
		if(!ctrl.elementsMap[v.parent].children){
			ctrl.elementsMap[v.parent].children = []
			ctrl.elementsMap[v.parent].children_ids = []
		}
		if(!ctrl.elementsMap[v.parent].children_ids.includes(v.doc_id)){
			ctrl.elementsMap[v.parent].children.push(v)
			ctrl.elementsMap[v.parent].children_ids.push(v.doc_id)
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
sql_app.select_i18_ua= function(){ 
	return "SELECT d2.value var, d1.* FROM \n" +
	"(SELECT * FROM doc LEFT JOIN string s ON string_id=doc_id) d1, \n" +
	"(SELECT * FROM doc LEFT JOIN string s ON string_id=doc_id) d2 \n" +
	" WHERE d1.parent = 115924 \n" +
	" AND d2.doc_id=d1.reference"
}
sql_app.select_doc_id_l8 = function(){ 
	return "SELECT doc_id FROM (" +
	sql_app.select_doc_l8() +
	") x"
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
sql_app.select_doc_l8= function(){ 
	return "SELECT 0 l, * FROM doc WHERE doc_id=:rootId \n" +
	"UNION \n" +
	"SELECT 1 l, d1.* FROM doc d1 WHERE parent=:rootId \n" +
	"UNION \n" +
	"SELECT 2 l, d2.* FROM doc d2, doc d1 WHERE d1.parent=:rootId AND d2.parent=d1.doc_id \n" +
	"UNION \n" +
	"SELECT 3 l, d3.* FROM doc d3, doc d2, doc d1 WHERE d1.parent=:rootId AND d2.parent=d1.doc_id AND d3.parent=d2.doc_id \n" +
	"UNION \n" +
	"SELECT 4 l, d4.* FROM doc d4, doc d3, doc d2, doc d1 WHERE d1.parent=:rootId AND d2.parent=d1.doc_id AND d3.parent=d2.doc_id AND d4.parent=d3.doc_id \n" +
	"UNION \n" +
	"SELECT 5 l, d5.* FROM doc d5, doc d4, doc d3, doc d2, doc d1 WHERE d1.parent=:rootId AND d2.parent=d1.doc_id AND d3.parent=d2.doc_id AND d4.parent=d3.doc_id AND d5.parent=d4.doc_id \n" +
	"UNION \n" +
	"SELECT 6 l, d6.* FROM doc d6, doc d5, doc d4, doc d3, doc d2, doc d1 WHERE d1.parent=:rootId AND d2.parent=d1.doc_id AND d3.parent=d2.doc_id AND d4.parent=d3.doc_id AND d5.parent=d4.doc_id AND d6.parent=d5.doc_id \n" +
	"UNION \n" +
	"SELECT 7 l, d7.* FROM doc d7, doc d6, doc d5, doc d4, doc d3, doc d2, doc d1 WHERE d1.parent=:rootId AND d2.parent=d1.doc_id AND d3.parent=d2.doc_id AND d4.parent=d3.doc_id AND d5.parent=d4.doc_id AND d6.parent=d5.doc_id AND d7.parent=d6.doc_id \n" +
	"UNION \n" +
	"SELECT 8 l, d8.* FROM doc d8, doc d7, doc d6, doc d5, doc d4, doc d3, doc d2, doc d1 WHERE d1.parent=:rootId AND d2.parent=d1.doc_id AND d3.parent=d2.doc_id AND d4.parent=d3.doc_id AND d5.parent=d4.doc_id AND d6.parent=d5.doc_id AND d7.parent=d6.doc_id AND d8.parent=d7.doc_id "
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
