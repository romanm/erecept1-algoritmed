var app = angular.module('myApp', ['ngSanitize']);
var exe_fn = {}
var initApp = function($scope, $http, ctrl){
	
	exe_fn = new Exe_fn($scope, $http);
	exe_fn.httpGet_j2c_table_db1_params_then_fn = function(params, then_fn){
		return {
			url : '/r/url_sql_read_db1',
			params : params,
			then_fn : then_fn,
			error_fn : params.error_fn,
	}	}
	$scope.elementsMap = {}
	$scope.referencesMap = {}

	$scope.highlight = function(text, search){
		if (!text) return
		if (!search) return text;
		return (''+text).replace(new RegExp(search, 'gi'), '<span class="w3-yellow">$&</span>');
	}
	exe_fn.httpGet({
		url:'/r/principal',
		then_fn:function(response){
			if(response.data.principal){
				$scope.principal = response.data.principal
				$scope.principal.user_id = response.data.list0[0].user_id
				/*
				console.log($scope.principal.name
						,$scope.principal
						,$scope.principal.user_id
						)
				 * */
			}
		},
	})
	build_request($scope)

	if(ctrl){
		$scope.editDoc = {}
		ctrl.editDoc = $scope.editDoc
		ctrl.editDoc.upDowntElementByRefGroup	= function(o, direction,refId){
			// зробити останнім, зробити першим робити тільки в межах групи з одним reference == refId
		}
		ctrl.editDoc.downElementByRefGroup	= function(o,refId){this.upDowntElement(o, 1)}
		ctrl.editDoc.upElementByRefGroup		= function(o,refId){this.upDowntElement(o, -1)}
		ctrl.editDoc.downElement	= function(o){this.upDowntElement(o, 1)}
		ctrl.editDoc.upElement		= function(o){this.upDowntElement(o, -1)}
		ctrl.editDoc.upDowntElement	= function(o, direction){
			var oParent = $scope.elementsMap[o.parent]
			console.log( oParent.children.indexOf(o), oParent)
			var position = oParent.children.indexOf(o)
			if((position +1 == oParent.children.length) && direction == 1){// зробити першим
				var x = oParent.children.splice(position, 1)
				oParent.children.splice(0, 0, x[0])
			}else if((position == 0) && direction == -1){// зробити останнім
				var x = oParent.children.splice(position, 1)
				oParent.children.push(x[0])
			}else{
				var x = oParent.children.splice(position, 1)
				oParent.children.splice(position + direction, 0, x[0])
			}
			angular.forEach(oParent.children, function(v,k){
				v.sort = k
//				var				data = { sort:k, sort_id:v.doc_id, }
				if(v.sort_id)	v.sql = "UPDATE sort SET sort=:sort WHERE sort_id=:doc_id"
				else			v.sql = "INSERT INTO sort (sort,sort_id) VALUES (:sort,:doc_id)"
				writeSql(v)
			})
		}
	}

}

var mapElement = function(element,elementsMap){
	elementsMap[element.doc_id] = element
	angular.forEach(element.children, function(el){
		mapElement(el, elementsMap)
	})
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

function getRandomInt(max) {
	return Math.floor(Math.random() * Math.floor(max));
}

function extendSql(params, extendList){
	if(!extendList){
		extendList = Object.keys(params)
		extendList.splice(extendList.indexOf('sql'),1)
	}
	angular.forEach(extendList, function(v){
		params.sql = params.sql.replace(new RegExp(':'+v,"g"),params[v])
	})
	return params
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

sql_app.read_table_config=function(){
	return "SELECT * FROM doc d, docbody s \n" +
	"WHERE parent = :tableId AND s.docbody_id=d.doc_id AND doctype!=4"
}
sql_app.read_sql_from_docRoot = function(){
	return "SELECT * FROM doc, docbody  WHERE doc_id=docbody_id and doctype=19  AND parent=:jsonId AND reference = :tableId "
}

sql_app.doc_read_elements = function(){
	return "SELECT * FROM doc d1 \n" +
	"LEFT JOIN string ON string_id=d1.doc_id \n" +
	"LEFT JOIN docbody ON docbody_id=d1.doc_id \n" +
	"LEFT JOIN sort ON sort_id=d1.doc_id \n" +
	"LEFT JOIN (SELECT double_id, value vreal FROM double) r ON double_id=d1.doc_id \n" +
	"LEFT JOIN (SELECT doc_id, s.value string_reference FROM doc LEFT JOIN string s ON string_id=doc_id ) d2 ON d2.doc_id=d1.reference \n" +
	"LEFT JOIN (SELECT doc_id, s.value string_reference2, s.i18_value FROM doc LEFT JOIN " +
	"(SELECT s.string_id, s.value, i18.value i18_value FROM doc,string i18, string s " +
	"WHERE doc_id=i18.string_id AND s.string_id=reference AND parent=115924)" +
	" s ON string_id=doc_id ) d3 ON d3.doc_id=d1.reference2 \n" +
	"LEFT JOIN (SELECT inn_id, inn inn_reference2 FROM inn ) n2 ON n2.inn_id=d1.reference2 \n" +
	"WHERE d1.doc_id IN "
}

sql_app.doc_read_parent_elements = function(){
	return sql_app.doc_read_elements() + "(" +
	"SELECT doc_id FROM doc where parent=:parent" +
	")"
}
