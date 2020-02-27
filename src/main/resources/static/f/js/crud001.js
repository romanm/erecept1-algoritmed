var initMenu = function() {


	ctrl.children_close = function(d){ 
		if(d.children_close === undefined){
			d.children_close = false
		}else{
			d.children_close = !d.children_close
		}
	}
	
	ctrl.select_tree_item = function(d){ 
		ctrl.choice_data_model_obj = d; 
		ctrl.children_close(d)
		console.log(ctrl.choice_data_model_obj, ctrl.data_model_edit_obj)
	}

	ctrl.click_data_model_close_children = function(el){
		angular.forEach(el.children, function(v,k){
			v.children_close = true
		})
	}
	ctrl.click_data_model_edit_obj = function(el){
		console.log(el, ctrl.choice_data_model_obj)
		if(ctrl.data_model_edit_obj 
				&& ctrl.data_model_edit_obj.doc_id == ctrl.choice_data_model_obj.doc_id){
			console.log(123)
			delete ctrl.data_model_edit_obj
			return
		}
		ctrl.data_model_edit_obj = ctrl.choice_data_model_obj
		console.log(ctrl.choice_data_model_obj)
	}

	ctrl.save_model_s1value = function(el){
		console.log(el)
		if(el.s1_id){
			var so = { s1value: el.s1value, s1_id : el.s1_id,
			dataAfterSave : function(response){
				console.log(el, response.data, so)
			},}
			so.sql = "UPDATE string SET value=:s1value WHERE string_id=:s1_id"
			writeSql(so)
		}else{
			var so = { s1value: el.s1value, s1_id : el.doc_id,
			dataAfterSave : function(response){
				console.log(el, response.data, so)
			},}
			so.sql = "INSERT INTO string (string_id, value) VALUES (:s1_id, :s1value);\n"
			writeSql(so)
		}
	}

	ctrl.save_model_i18n = function(el){
		var i18n_parent = ctrl.doc_i18n_parent['_'+ctrl.choice_data_model.doc_id]
		console.log(el, ctrl.choice_data_model, ctrl.choice_data_model_obj, i18n_parent)
		if(el.i18n_id){
			var so = { i18n : el.i18n, i18n_id : el.i18n_id,
			dataAfterSave : function(response){
				console.log(el, response.data, so)
			},}
			so.sql = "UPDATE string SET value=:i18n WHERE string_id=:i18n_id"
			writeSql(so)
//		}else if(ctrl.choice_data_model.i18n_parent){
		}else if(i18n_parent){
			var so = {parent:i18n_parent, reference:el.doc_id, i18n:el.i18n,
			dataAfterSave : function(response){
				console.log(el, response.data, so)
				el.i18n_id = response.data.nextDbId1
			},}
			console.log(so)
			so.sql = sql_app.INSERT_doc_parent_ref()
			so.sql += "INSERT INTO string (string_id, value) VALUES (:nextDbId1, :i18n);\n"
			console.log(el, so, ctrl.choice_data_model, so.sql)
			writeSql(so)
		}
	}

	if(ctrl.request.parameters.doc2doc){
		ctrl.doc2doc_ids = []
		angular.forEach(ctrl.request.parameters.doc2doc.split(','), function(v,k){
			ctrl.doc2doc_ids[k] = 1*v
		})
	}

	ctrl.initMenu2 = function(){
		if(!ctrl.two_docs_ids&&ctrl.doc2doc_ids){
			ctrl.two_docs_ids = [ctrl.doc2doc_ids[0],ctrl.doc2doc_ids[1]]
		}
	}
	ctrl.content_menu = {}
	ctrl.content_menu.reRead = function(){
		console.log(ctrl.two_docs_ids)
		read_object({doc_id:ctrl.two_docs_ids[0]})
		read_object({doc_id:ctrl.two_docs_ids[1]})
	}
	ctrl.content_menu.typeElement = function(type, el){
		ctrl.content_menu.subSepMenuName = type+'_'+el.doc_id
	}
	ctrl.content_menu.deleteElementReference2 = function(el){
		var so = {doc_id:el.doc_id,
				sql:"UPDATE doc SET reference2 = null WHERE doc_id = :doc_id",
				dataAfterSave:function(response){
					console.log(response)
					delete el.reference2 
				}
		}
		writeSql(so)
	}
	ctrl.content_menu.pasteElementReference2 = function(el){
		console.log(el, ctrl.content_menu.copyObject)
		var so = {reference2:ctrl.content_menu.copyObject.doc_id,
			doc_id:el.doc_id,
			sql:"UPDATE doc SET reference2 = :reference2 WHERE doc_id = :doc_id",
			dataAfterSave:function(response){
				console.log(response)
				el.reference2 = ctrl.content_menu.copyObject.doc_id
			}
		}
		writeSql(so)
	}
	ctrl.content_menu.pasteElementReference1 = function(el){
		console.log(el, ctrl.content_menu.copyObject)
		var so = {reference:ctrl.content_menu.copyObject.doc_id,
			doc_id:el.doc_id,
			sql:"UPDATE doc SET reference = :reference WHERE doc_id = :doc_id",
			dataAfterSave:function(response){
				console.log(response)
				el.reference = ctrl.content_menu.copyObject.doc_id
			}
		}
		writeSql(so)
	}
	ctrl.content_menu.pasteElementContent = function(el){
		console.log(el, ctrl.content_menu.copyObject)
		sql_app.copyElement({parent:el.parent, doc_id:':nextDbId'+1}, el.sort, ctrl.content_menu.copyObject, el)
	}
	sql_app.copyElement = function(so, sort, copyObject, el){
		if(copyObject.reference) so.reference = copyObject.reference
		if(copyObject.reference2) so.reference2 = copyObject.reference2
		if(copyObject.doctype) so.doctype = copyObject.doctype
		so.sql =sql_app.INSERT_doc(so)
		if(sort){
			so.sql += "INSERT INTO sort (sort_id, sort) VALUES (" +
				so.doc_id + ", " + sort + ");\n"
		}
		if(copyObject.s1value){
			so.sql += "INSERT INTO string (string_id, value) VALUES (" +
				so.doc_id + ", '" + copyObject.s1value + "');\n"
		}
		so.sql += sql_app.SELECT_obj_with_i18n(so.doc_id)
		console.log(copyObject, so.sql)
		so.dataAfterSave = function(response){
			var elParent = ctrl.elementsMap[el.parent]
			var indexEl = elParent.children.indexOf(el)
			angular.forEach(response.data, function(v,k){ if(k.indexOf('list')==0){
				var newEl = v[0]
				console.log(v[0], indexEl)
				elParent.children.splice(indexEl, 0, v[0])
			}})
		}
		writeSql(so)
		if(copyObject.children){
			
		}
	}

sql_app.INSERT_doc = function(so){
	console.log(so)
	var vars = '', vals = ''
	angular.forEach(so, function(v,k){
		if(vars.length>0){
			vars += ', '
			vals += ', '
		}
		console.log(v,k)
		vars += k
		if(!Number.isInteger(v) && (!v || v.indexOf(':')==0))
			vals += v
			else
				vals += "'"+v+"'"
	})
	var sql = "INSERT INTO doc (" + vars + ") VALUES (" + vals + "); \n"
	console.log(sql)
	return sql
}
	ctrl.content_menu.pasteElement = function(el){
		console.log(el)
		ctrl.content_menu.typeElement('paste',el)
	}
	ctrl.content_menu.copyElement=function(el){
		ctrl.content_menu.copyObject = el
		el.countWithChildren = countWithChildren(el)
		console.log(ctrl.content_menu.copyObject)
	}
	var countWithChildren = function(el){
		var count = 1
		if(el.children)
			angular.forEach(el.children, function(v){
				count += countWithChildren(v)
			})
		return count
	}
	ctrl.content_menu.cutElement=function(o){
		ctrl.content_menu.cutObject = o
	}
	ctrl.content_menu.addElement = function(el){
		var so = {parent:el.doc_id}
		so.sql = sql_app.INSERT_doc_parent_ref(so)
		so.sql += sql_app.SELECT_doc_id()
		console.log(ctrl.el, so, replaceParams(so))
		so.dataAfterSave = function(response) {
			console.log(response.data)
			if(!el.children)
				el.children = []
			el.children.push(response.data.list1[0])
		}
		writeSql(so)
	}
	ctrl.content_menu.minusElement = function(el){
		if(!el.children || (el.children && el.children.length==0)){
			console.log(el)
			writeSql({sql:"" +
				"DELETE FROM doc WHERE reference = :el_id AND parent in (SELECT doc_id FROM doc where reference = 285596);\n" +
				"DELETE FROM doc WHERE doc_id = :el_id "
			, el_id:el.doc_id
			, dataAfterSave : function(response) {
				var parentEl =  ctrl.elementsMap[el.parent]
				parentEl.children.splice(parentEl.children.indexOf(el), 1)
				console.log(response.data, parentEl.children.indexOf(el))
				delete el
			}})
		}
	}
	ctrl.content_menu.downElement = function(el){
		console.log(el)
		upDowntElement(el, 1)
	}
	ctrl.content_menu.upElement = function(el){
		console.log(el)
		upDowntElement(el, -1)
	}
	//sql_app.replace_params()
}

var upDowntElement = function(o, direction){
//	var oParent = this.elementsMap[o.parent]
		var oParent = ctrl.elementsMap[o.parent]
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
		so.sql += sql_app.SELECT_with_parent(oParent)
		so.dataAfterSave = function(response) {
			angular.forEach(response.data, function(v, k){
				if(k.includes('list')){
					angular.forEach(v, function(v2){
						var v2_old = ctrl.elementsMap[v2.doc_id]
						if(v2_old && v2_old.children)
							v2.children = v2_old.children
						delete v2_old
						ctrl.elementsMap[v2.doc_id] = v2
					})
					oParent.children = v
				}
			})
		}
		writeSql(so)
}

sql_app.doc_insert_sort = function(){
	var sql = "INSERT INTO sort (sort, sort_id) VALUES (:sort, :sort_id)"
	return sql
}

sql_app.doc_update_sort = function(){
	var sql = "UPDATE sort SET sort=:sort WHERE sort_id=:sort_id"
	return sql
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



var set_choice_data_model2 = function(d, data_model_id){
	console.log(d, data_model_id)
	set_doc_i18n_parent(d, data_model_id)
	console.log(d)
	read_model_children(d)
	ctrl.elementsMap[d.doc_id] = d
	ctrl.choice_data_model = d
}

var set_choice_data_model = function(d, data_model_id){
	set_choice_data_model2(d, data_model_id)
//	ctrl.choice_data_model = d
	read_data_for_data_editor2(d)
	read_rows_at_reference(d.doc_id)
}

var read_rows_at_reference = function(reference){
	var sql = sql_app.obj_with_reference(reference)
	console.log(reference, sql)
	read_dataObject2fn(sql, function(response){
		ctrl.doc_rows = response.data.list
		if(!ctrl.data_row.children && ctrl.edit_data_id){
			angular.forEach(ctrl.doc_rows, function(v){ 
				ctrl.elementsMap[v.doc_id] = v
				if(ctrl.edit_data_id == v.doc_id){
					ctrl.click_data_row(v)
				}
			})
		}
	})
}

sql_app.obj_with_reference = function(reference){
	var sql = "" +
	"SELECT d.* FROM doc d " +
	"WHERE :reference IN (d.reference) "
	sql = sql.replace(':reference', reference)
	var sv = ctrl.doc_data_shortView['_'+reference]
//	console.log(sql, reference, ctrl.doc_data_shortView, sv)
	if(sv){
		var lf_sqls=' doc d \n', lf_cols=' d.* '
		angular.forEach(sv, function(v,k){
//			console.log(v, k)
			lf_cols += ", s" +k+".value s_"+v+"_value "
			lf_sqls += "" +
			"LEFT JOIN doc d" + k + 
			" LEFT JOIN string s" + k + " ON s" + k + ".string_id=d" + k + ".doc_id " +
			" ON d" + k + ".parent = d.doc_id AND d" + k + ".reference = "+v +"\n"
		})
//		console.log(lf_sqls, lf_cols)
		sql = sql.replace(' doc d ', lf_sqls)
		sql = sql.replace(' d.* ', lf_cols)
//		console.log(sql)
	}
	return sql
}

var set_doc_i18n_parent = function(d, data_model_id){
	if(ctrl.doc_i18n_parent['_'+data_model_id]){
		d.i18n_parent = ctrl.doc_i18n_parent['_'+data_model_id]
		ctrl.i18n_parent = d.i18n_parent
	}
}

var read_model_children = function(d){
	ctrl.choice_data_model_obj = d
	read_children(d)
}

conf.init = function(){

	ctrl.style ={}
	ctrl.style.model_data_row ={width:'50%'}
	ctrl.style.width_max = function(obj_name){
		console.log(ctrl.style, obj_name)
		var o = ctrl.style[obj_name], v = o.width.replace('%','')
		if(v<80) v = v*1+10
		o.width = v+'%'
	}
	ctrl.style.width_min = function(obj_name){
		var o = ctrl.style[obj_name], v = o.width.replace('%','')
		if(v>20) v -= 10
		o.width = v+'%'
	}

	ctrl.doc_data_shortView = {}
	ctrl.doc_data_shortView._115827 = [115783]
	ctrl.doc_data_shortView._115856 = [115879]

	ctrl.data_row = {}

	ctrl.data_editor_opened = function(){ 
		var data_editor_open = ctrl.data_row.doc_id && !ctrl.data_row.children_close
		return data_editor_open
	}
}

