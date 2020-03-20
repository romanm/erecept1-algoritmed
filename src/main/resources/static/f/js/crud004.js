var initCrud004 = function() {
	if(ctrl.request.parameters.doc2doc){
		ctrl.doc2doc_ids = []
		angular.forEach(ctrl.request.parameters.doc2doc.split(','), function(v,k){
			ctrl.doc2doc_ids[k] = 1*v
		})
	}
	initDataModel()
}
var initDataModel = function(){
	ctrl.content_menu = {}

	ctrl.go_up_level = function(edEl_id, parent_id){
		var position = ctrl.doc2doc_ids.indexOf(edEl_id)
		if(!parent_id)
			parent_id = ctrl.eMap[edEl_id].parent
		var doc2doc_ids = ctrl.doc2doc_ids.slice();
//		var doc2doc_ids = ctrl.doc2doc_ids.splice(position,1,parent_id)
		console.log(edEl_id, parent_id, position, doc2doc_ids, ctrl.doc2doc_ids)
		doc2doc_ids[position] = parent_id
		console.log(edEl_id, parent_id, position, doc2doc_ids.toString())
		ctrl.openUrl('?doc2doc='+doc2doc_ids.toString())
	}
	ctrl.click_data_model_close_children = function(el){
		angular.forEach(el.children, function(v,k){
			delete v.open_children
		})
	}

	ctrl.content_menu.downElement = function(el){
		console.log(el)
		upDowntElement(el, 1)
	}

	ctrl.content_menu.upElement = function(el){
		console.log(el)
		upDowntElement(el, -1)
	}

	ctrl.content_menu.minusElement = function(el){
		if(!el.children || (el.children && el.children.length==0)){
			writeSql({sql:"" +
				"DELETE FROM doc WHERE reference = :el_id AND parent in (SELECT doc_id FROM doc where reference = 285596);\n" +
				"DELETE FROM doc WHERE doc_id = :el_id "
			, el_id:el.doc_id
			, dataAfterSave : function(response) {
				var parentEl = ctrl.eMap[el.parent]
				parentEl.children.splice(parentEl.children.indexOf(el), 1)
				delete el
			}})
		}
	}

	ctrl.content_menu.addElement = function(el){
		var so =	{parent:el.doc_id}
		so.sql =	sql_app.INSERT_doc(so)
		so.sql +=	sql_app.SELECT_doc_id()
		so.dataAfterSave = function(response) {
			if(!el.children)
				el.children = []
			el.children.push(response.data.list1[0])
		}
		writeSql(so)
	}

	ctrl.content_menu.typeElement = function(type, el){
		ctrl.content_menu.subSepMenuName = type+'_'+el.doc_id
	}
	
	ctrl.content_menu.typeElement = function(type, el){
		ctrl.content_menu.subSepMenuName = type+'_'+el.doc_id
	}
	
	ctrl.select_tree_item = function(d){
		ctrl.choice_data_model_obj = d
		if(ctrl.choice_data_model_obj.cnt_child && !ctrl.choice_data_model_obj.children){
			console.log(ctrl.choice_data_model_obj)
			read_element_children(ctrl.choice_data_model_obj.doc_id, function(response){
					ctrl.choice_data_model_obj.open_children = true
			})
		}else{
			ctrl.choice_data_model_obj.open_children = 
			!ctrl.choice_data_model_obj.open_children 
		}
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

function read_element_children(doc_id, fn){
	var o = ctrl.eMap[doc_id]
	if(o){
		if(!o.children){
			var sql = sql_app.SELECT_children_with_i18n(doc_id)
			var fn0 = function(response){
				o.children = response.data.list
				angular.forEach(o.children, function(v){
					if(!ctrl.eMap[v.doc_id])
						ctrl.eMap[v.doc_id] = v
				})
				if(fn)		fn(response)
			}
			read_dataObject2fn(sql, function(response){fn0(response)})
		}
	}
}

function read_element(doc_id, fn){
	var o = ctrl.eMap[doc_id]
	if(!o){
		var sql = sql_app.SELECT_obj_with_i18n(doc_id)
		var fn0 = function(response){
//		console.log(response.data)
			var o = response.data.list[0]
			ctrl.eMap[o.doc_id] = o
			if(fn)		fn(response)
		}
		read_dataObject2fn(sql, function(response){fn0(response)})
	}
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

var upDowntElement = function(o, direction){
//	var oParent = this.eMap[o.parent]
		var oParent = ctrl.eMap[o.parent]
		var position = oParent.children.indexOf(o)
		if((position +1 == oParent.children.length) && direction == 1){// зробити першим
			var x = oParent.children.splice(position, 1)
			oParent.children.splice(0, 0, x[0])
		}else if((position == 0) && direction == -1){// зробити останнім
			console.log('зробити останнім')
			var x = oParent.children.splice(position, 1)
			oParent.children.push(x[0])
		}else{
			var x = oParent.children.splice(position, 1)
			oParent.children.splice(position + direction, 0, x[0])
		}
		var so = {sql:''}
		angular.forEach(oParent.children, function(v,k){
			var data = { sort:k+1, sort_id:v.doc_id, }
			if(v.sort_id)
				var sql = sql_app.doc_update_sort()
			else
				var sql = sql_app.doc_insert_sort()
			sql = sql_app.replace_params(sql, data)
			so.sql += sql +';\n'
		})
		so.sql += sql_app.SELECT_children_with_i18n(oParent.doc_id)
//		so.sql += sql_app.SELECT_with_parent(oParent)
		so.dataAfterSave = function(response) {
			angular.forEach(response.data, function(v, k){
				if(k.includes('list')){
					angular.forEach(v, function(v2){
						var v2_old = ctrl.eMap[v2.doc_id]
						if(v2_old && v2_old.children)
							v2.children = v2_old.children
						delete v2_old
						ctrl.eMap[v2.doc_id] = v2
					})
					oParent.children = v
				}
			})
		}
		writeSql(so)
}


sql_app.replace_params = function(sql, data){
	angular.forEach(sql.split(':'), function (v){
		var v1 = v.split(' ')[0]
		.replace(',','')
		.replace(')','').trim()
		if(data[v1]){
			sql = sql.replace(':'+v1, data[v1])
		}
	})
	return sql
}

var writeSql = function(data){
	if(!data.sql)
		sql_app.INSERT_doc(data)
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

sql_app.doc_insert_sort = function(){
	var sql = "INSERT INTO sort (sort, sort_id) VALUES (:sort, :sort_id)"
	return sql
}

sql_app.doc_update_sort = function(){
	var sql = "UPDATE sort SET sort=:sort WHERE sort_id=:sort_id"
	return sql
}

sql_app.INSERT_doc = function(so){
	if(!so.doc_id)		so.doc_id = ':nextDbId1'
	var vars = '', vals = ''
	angular.forEach(['doc_id','parent','reference','reference2','doctype'], function(k){
		var v = so[k]
		if(v){
			if(vars.length>0){
				vars += ', '
					vals += ', '
			}
			vars += k
			if(!Number.isInteger(v) && (!v || v.indexOf(':')==0))
				vals += v
				else
					vals += "'"+v+"'"
		}
	})
	if(vars.length>0){
		so.sql = "INSERT INTO doc (" + vars + ") VALUES (" + vals + ");\n"
	}
	if(so.uuid){
		so.sql += "INSERT INTO uuid (uuid_id, value) VALUES (" +
		so.doc_id + ", '" + so.uuid + "');\n"
	}
	if(so.s1value){
		so.sql += "INSERT INTO string (string_id, value) VALUES (" +
		so.doc_id + ", '" + so.s1value + "');\n"
	}
	return so.sql
}
sql_app.SELECT_doc_id = function(){
	var sql = "SELECT * FROM doc WHERE doc_id=:nextDbId1; \n"
	return sql
}
