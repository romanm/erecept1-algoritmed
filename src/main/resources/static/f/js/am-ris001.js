var app = angular.module('myApp', ['ngSanitize']);
sql_1c = {}
var initApp = function($scope, $http){
	console.log('initApp')
	build_request($scope)
	$scope.pageVar = {}
//	console.log($scope.pageVar)
	$scope.pageVar.colLink=function(cl,tr){
		var path = '?'
		if(cl.path)
			path = cl.path+'?'
		var l = path+cl.k+'='+tr[cl.vk]
		angular.forEach(cl.add,function(v){
			var vk = tr[v.vk]
			if(v.fn){
				vk = v.fn()
			}
			l += '&'+v.k+'='+vk
		})
		return l
	}
	$scope.pageVar.config = {}
	if($scope.request.parameters.tab1){
		$scope.pageVar.config.viewDocPart=$scope.request.parameters.tab1
	}
	$scope.pageVar.config.viewJson = function(o){
//		console.log('----27---------------')
//		var o2c = o.docRoot
		//cleanNull(o2c)
//		console.log(Object.keys(o.docRoot))
		if(!o.stringify){
			o.stringify = JSON.stringify(o, null, 2)
		}
		return o.stringify
	}

	exe_fn = new Exe_fn($scope, $http);
	exe_fn.httpGet_j2c_table_db1_params_then_fn = function(params, then_fn){
		return {
			url : '/r/url_sql_read_db1',
			params : params,
			then_fn : then_fn,
	}	}
	$scope.highlight = function(text, search){
		if (!text) return
		if (!search) return text;
		return (''+text).replace(new RegExp(search, 'gi'), '<span class="w3-yellow">$&</span>');
}	}

var cleanNull = function(o2c){
	angular.forEach(o2c, function(v,k){
		if(v==null) delete o2c[k]
		else if(typeof v === 'string'){}
		else if(v instanceof String){}
		else if('$$hashKey'==k){}
		else if('children'==k){
			angular.forEach(v, function(v1,k1){
				cleanNull(v1)
			})
		} else if(Object.keys(v).length>0){
			console.log(k)
			console.log(v)
		}
	})
}

var writeSql = function(data){
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

function readSqlToObjData(param, objProgram, objData, $scope){
	if(objProgram.stopDeepRead)
		return
	replaceParams(param)
	if(!objProgram)
		objProgram = param
	exe_fn.httpGet(exe_fn.httpGet_j2c_table_db1_params_then_fn(
	param, function(response) {
		if(response.data.list.length > 100){
			objProgram.stopDeepRead = true
//			if($scope.request.parameters.jsonId == objData.docId)
//				console.log(response.data.list.length, param)
		}
		angular.forEach(response.data.list, function(v){
			$scope.datadictionary.elementsMap[v.doc_id] = v
			if(v.reference == 122593){// bigdata
				objProgram.stopDeepRead = true
			}
		})
//		params.list = response.data.list
		if(param.afterRead)
			param.afterRead(response)
		if(objProgram.afterRead)
			objProgram.afterRead(response, param, objData)
	}))
}

function replaceParams(params){
	angular.forEach(params.sql.split(':'), function(v,k){
		if(k>0){
			var p = v.split(' ')[0].replace(')','')
			var pv = params[p]
//			console.log(p+' = '+pv)
			params.sql = params.sql.replace(':'+p,pv)
		}
	})
//	console.log(params)
//	params.sql = params.sql.replace('\n','')
//	console.log(params.sql)
	return params
}

function readSql(params, obj){
	replaceParams(params)
	if(!obj) obj = params
	exe_fn.httpGet(exe_fn.httpGet_j2c_table_db1_params_then_fn(
	params,
	function(response) {
		obj.list = response.data.list
		if(obj.afterRead)
			obj.afterRead(response)
	}))
	return obj
}

function Exe_fn($scope, $http){
	this.httpGet=function(progr_am){
		$http
		.get(progr_am.url, {params:progr_am.params})
		.then(progr_am.then_fn)
	}
	this.httpPost=function(progr_am){
		$http.post(progr_am.url, progr_am.data)
		.then(progr_am.then_fn)
	}
}

function getRandomInt(max) {
	return Math.floor(Math.random() * Math.floor(max));
}

function build_request($scope){
	$scope.request={};
//	console.log($scope.request)
	$scope.request.pathNameValue = window.location.pathname.split('.html')[0].split('/').reverse()[0]
	console.log($scope.request.pathNameValue)
	$scope.request.parameters={};
	if(window.location.search.split('?')[1]){
		angular.forEach(window.location.search.split('?')[1].split('&'), function(value, index){
			var par = value.split("=");
			$scope.request.parameters[par[0]] = par[1];
		});
	}
}

function build_sqlJ2c_row_insert(rowObj,col_data){
	col_data.sql_row = sql_1c.table_data_row_insert()
	console.log(col_data)
	build_sqlJ2c_row_write(rowObj, col_data,function(v,k,n){
		build_sqlJ2c_cell_write(v,k,n,col_data,rowObj)
	})
	while(col_data.sql_row.indexOf(':row_id')>0){
		col_data.sql_row = col_data.sql_row.replace(':row_id', ':nextDbId1')
	}
	var table_id = col_data[Object.keys(col_data)[0]].table_id
	col_data.table_id = table_id
}

function build_sqlJ2c_row_write(rowObj,col_data,fn){
	angular.forEach(rowObj, function(v,k){
		var n = k.split('col_')[1]
		if(!isNaN(n))
			fn(v,k,n,col_data,rowObj)
	})
}

function build_sqlJ2c_cell_write_parameters(col_data, v, n){
	var cell_v 
	if('string'==col_data[n].fieldtype){
		cell_v = "'"+v+"'"
	}else
	if('timestamp'==col_data[n].fieldtype){
		cell_v = "'"+v+"'"
//		cell_v = "'"+v+":00.0'"
	}else{
		cell_v = v
	}
	col_data.sql = col_data.sql.replace(':value', cell_v)
	col_data.sql = col_data.sql.replace(':fieldtype', col_data[n].fieldtype)
		.replace(':fieldtype', col_data[n].fieldtype)
	col_data.sql_row += col_data.sql
}

function build_sqlJ2c_cell_write(v,k,n,col_data, rowObj){
	console.log(col_data[n])
	var cellId_v = rowObj[k+'_id']
	console.log(k+'/'+v+'/'+cellId_v+'/'+n)
	if(cellId_v){
		col_data.sql = sql_1c.table_data_cell_update()
		col_data.sql = col_data.sql.replace(':cell_id', cellId_v)
		build_sqlJ2c_cell_write_parameters(col_data, v, n)
	}else if(v){
		col_data.sql = sql_1c.table_data_cell_insert()
		col_data.sql = col_data.sql.replace(':column_id', n)
		while(col_data.sql.indexOf(':nextDbId2')>0){
			col_data.sql = col_data.sql.replace(':nextDbId2', ':nextDbId'+col_data.nextDbIdCounter)
		}
		col_data.nextDbIdCounter++
		build_sqlJ2c_cell_write_parameters(col_data, v, n)
	}
}

function str2UaTimestamp(edTs){
	var edTsa = edTs.match(/(\d+)/g)
	var d = new Date()
	var year = edTsa[2]*1
	var addCentury = (year>d.getFullYear()-2000)?1900:2000
	edTsa[2] = year > 1000 ? year : (year + addCentury)
	d.setFullYear(edTsa[2])
	d.setMonth(edTsa[1]*1-1)
	d.setDate(edTsa[0])
	d.setHours(edTsa[3])
//	d.setUTCHours(edTsa[3])
	d.setMinutes(edTsa[4])
	return d
}

sql_1c.table_data_row_insert = function(){
	return "INSERT INTO doc (doc_id, parent, doctype) VALUES (:nextDbId1 , :table_id , 4) ;"
}
sql_1c.table_data_cell_insert = function(){
	return "INSERT INTO doc (doc_id, parent, reference, doctype) VALUES (:nextDbId2, :row_id , :column_id,  5) ;" +
	"INSERT INTO :fieldtype (value,:fieldtype_id) VALUES (:value, :nextDbId2 ) ;"
}
sql_1c.table_data_cell_update = function(){
	return "UPDATE :fieldtype SET value =:value WHERE :fieldtype_id=:cell_id ;"
}
