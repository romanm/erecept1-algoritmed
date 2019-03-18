var app = angular.module('myApp', ['ngSanitize']);
var exe_fn = {}
var initApp = function($scope, $http){
	exe_fn = new Exe_fn($scope, $http);
	exe_fn.httpGet_j2c_table_db1_params_then_fn = function(params, then_fn){
		return {
			url : '/r/url_sql_read_db1',
			params : params,
			then_fn : then_fn,
	}	}
	$scope.elementsMap = {}
	$scope.referencesMap = {}

	$scope.highlight = function(text, search){
		if (!text) return
		if (!search) return text;
		return (''+text).replace(new RegExp(search, 'gi'), '<span class="w3-yellow">$&</span>');
	}
}

function replaceParams(params){
//	console.log(params.sql)
	angular.forEach(params.sql.split(':'), function(v,k){
		if(k>0){
			var p = v.split(' ')[0].replace(')','').replace(',','').replace(';','').trim()
			var pv = params[p]
//			console.log(p+' = '+pv)
			if(pv){
				params.sql = params.sql.replace(':'+p, "'"+pv+"'")
			}
		}
	})
//	console.log(params.ts_value)
//	console.log(params)
//	console.log(params.sql)
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

function json_elementsMap(json, elementsMap, referencesMap){
	elementsMap[json.doc_id] = json
	if(json.reference){
		referencesMap[json.reference] = null
	}
	angular.forEach(json.children, function(v){
		json_elementsMap(v, elementsMap, referencesMap)
	})
}
/*
 * */
function isInt(n){
	return Number(n) === n && n % 1 === 0;
}

function isFloat(n){
	return Number(n) === n && n % 1 !== 0;
}

var sql_app = {}
sql_app.amk025_template = function(){
	return "SELECT * FROM doc d2, doc d1,docbody " +
	"WHERE d1.doc_id=docbody_id AND d2.doc_id=d1.parent AND d2.doctype IN (6,17) AND d1.reference=:jsonId"
}

