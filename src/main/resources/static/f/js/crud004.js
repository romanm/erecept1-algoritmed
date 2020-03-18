var initCrud004 = function() {
	console.log('initCrud004')

	
	if(ctrl.request.parameters.doc2doc){
		ctrl.doc2doc_ids = []
		angular.forEach(ctrl.request.parameters.doc2doc.split(','), function(v,k){
			ctrl.doc2doc_ids[k] = 1*v
		})
	}

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

function read_dataObject2fn(sql, afterRead, limit) {
	if(!limit){
		if(ctrl.limit){
			limit = ctrl.limit
		}else{
			limit = 100
		}
	}
	sql += " LIMIT "+limit
	readSql({sql:sql, afterRead:function(response){afterRead(response)}})
}

function read_element(doc_id, fn){
	var sql = sql_app.SELECT_obj_with_i18n(doc_id)
	if(!fn){
		fn = function(response){
//			console.log(response.data)
			var o = response.data.list[0]
			ctrl.elementsMap[o.doc_id] = o
		}
	}
	read_dataObject2fn(sql, function(response){fn(response)})
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

