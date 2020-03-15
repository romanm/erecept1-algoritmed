var copyDP_oa37 = function(so_tableListEl, data_model_column_element, copyElList){
	var data_model1_tableEl = ctrl.elementsMap[data_model_column_element.reference]
	console.log(so_tableListEl, data_model_column_element, data_model1_tableEl , copyElList)
	sql_app.INSERT_doc(so_tableListEl)
	so_tableListEl.dataAfterSave = function(response){//element - oa37 - table
		angular.forEach(copyElList, function(copyEl){//list of rows in table
			var so1_row = {parent:response.data.nextDbId1, doc_id:':nextDbId1', reference:data_model1_tableEl.doc_id}
			sql_app.INSERT_doc(so1_row)
			console.log(response.data, so1_row)
			so1_row.dataAfterSave = function(response){// cell element
				var parent_id = response.data.nextDbId1
				angular.forEach(data_model1_tableEl.att_name__id, function(att_reference, att_name){
					var att_val = copyEl[att_name]
					if(att_val){
						var so2_cell = {parent:parent_id, doc_id:':nextDbId1',}
						var data_model2_columnEl = ctrl.elementsMap[ctrl.elementsMap[att_reference].reference]
						console.log(att_name,':',att_val, att_reference)
						if(data_model2_columnEl){
							var data_model2_cellValEl = ctrl.elementsMap[data_model2_columnEl.att_name__id[att_val]]
							so2_cell.reference = att_reference
							so2_cell.reference2 = data_model2_cellValEl.doc_id
							console.log(att_name,':',att_val, so2_cell, data_model2_cellValEl)
						}else{
							so2_cell.s1value = att_val
							console.log(att_name,':',att_val)
						}
						sql_app.INSERT_doc(so2_cell)
						writeSql(so2_cell)
					}
				})
			}
			writeSql(so1_row)
		})
	}
	writeSql(so_tableListEl)
}

var initCrud002 = function() {

	ctrl.copyDP_legal_entity = function(copyEl){
		var so = ctrl.so_legal_entity
		so.dataAfterSave = function(response) {
			var data_model_table_element = ctrl.elementsMap[115827]
			
			var att_name__id = data_model_table_element.att_name__id
//			console.log(response.data, copyEl, att_name__id)
			angular.forEach(copyEl, function(att_val, att_name){
				//console.log(att_name)
				if (att_name.indexOf('$')==0) {
				} else{
					var reference = att_name__id[att_name]
					var so1 = {doc_id:':nextDbId1', parent:response.data.nextDbId1, reference:reference, }
					var data_model_column_element = ctrl.elementsMap[data_model_table_element.att_name__id[att_name]]
//					console.log(att_name,':', att_val,'\n', ctrl.isTypeof(att_val), reference, data_model_column_element.reference)
					if(ctrl.isTypeof(att_val) === 'object'){
						if(37==data_model_column_element.doctype){
							if(115789==reference){
								copyDP_oa37(so1, data_model_column_element, att_val)
							}
						}
					}else
					if(ctrl.isTypeof(att_val) === 'string'){
						if(data_model_column_element.reference && ctrl.elementsMap[data_model_column_element.reference].att_name__id){
							var r2 = ctrl.elementsMap[data_model_column_element.reference].att_name__id[att_val]
							so1.reference2 = r2
						}else{
							so1.s1value = att_val
						}
						sql_app.INSERT_doc(so1)
						if(115783==reference){
							console.log(att_name, reference, ctrl.elementsMap[reference].reference, so1)
							writeSql(so1)
						}
					}
//					writeSql(so1)
				}
			})
		}
		ctrl.create_doc(so)
	}

	ctrl.create_doc = function(so){
		if(!so.dataAfterSave){
			so.dataAfterSave = function(response) {
				console.log(response.data)
			}
		}
		so.sql = sql_app.INSERT_doc_parent_ref()
		//console.log(so, so.sql)
		writeSql(so)
	}
	ctrl.so_legal_entity = {parent:285460, reference:115827}
}


sql_app.INSERT_doc = function(so){
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
//		console.log(vars, vals)
//		vars = vars.substring(0,vars.length)
//		vals = vals.substring(0,vals.length)
		so.sql = "INSERT INTO doc (" + vars + ") VALUES (" + vals + ");\n"
//		console.log(vars, vals, so.sql)
	}
	if(so.s1value){
		so.sql += "INSERT INTO string (string_id, value) VALUES (" +
		so.doc_id + ", '" + so.s1value + "');\n"
	}
	return so.sql
}

sql_app.INSERT_doc1 = function(so){
//	console.log(so)
	var vars = '', vals = ''
	angular.forEach(so, function(v,k){
		if(vars.length>0){
			vars += ', '
			vals += ', '
		}
//		console.log(v,k)
		vars += k
		if(!Number.isInteger(v) && (!v || v.indexOf(':')==0))
			vals += v
			else
				vals += "'"+v+"'"
	})
	so.sql = "INSERT INTO doc (" + vars + ") VALUES (" + vals + "); \n"
	if(so.s1value){
		so.sql += "INSERT INTO string (string_id, value) VALUES (" +
			so.doc_id + ", '" + so.s1value + "');\n"
	}
//	console.log(so.sql)
	return so.sql
}


var initMenu = function() {
	ctrl.initTypesList = function(){
		if(!ctrl.typeList){
			var sql = "" +
			"SELECT * FROM (SELECT d1.*, d2.doctype doctype2, d2.doctype_id doctype2_id FROM doctype d1 \n" +
			"LEFT JOIN doctype d2 ON d2.parent_id=d1.doctype_id  \n" +
			"WHERE d1.parent_id =18 \n" +
			"UNION \n" +
			"SELECT d1.*, null, null FROM doctype d1 where doctype_id=18) x ORDER BY doctype_id, doctype2_id"
			readSql({ sql:sql,
				afterRead:function(response){ 
					ctrl.typeList = response.data.list
					console.log(ctrl.typeList)
				}
			})
		}
	}

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
		var s1value = el.s1value.replace("'","''")
		if(el.s1_id){
			var so = { s1value: s1value, s1_id : el.s1_id,
			dataAfterSave : function(response){
				console.log(el, response.data, so)
			},}
			so.sql = "UPDATE string SET value=:s1value WHERE string_id=:s1_id"
			writeSql(so)
		}else{
			var so = { s1value: s1value, s1_id : el.doc_id,
			dataAfterSave : function(response){
				console.log(el, response.data, so)
			},}
			so.sql = "INSERT INTO string (string_id, value) VALUES (:s1_id, :s1value);\n"
			writeSql(so)
		}
	}

	ctrl.save_model_i18n = function(el){
//		var i18n_parent = ctrl.doc_i18n_parent['_'+ctrl.choice_data_model.doc_id]
		var i18n_parent = ctrl.i18n_parent
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
	ctrl.content_menu.setTypeElement = function(typEl, el){
		console.log(typEl, el)
		var doctype_id = typEl.doctype_id
		if(typEl.doctype2_id)
			var doctype_id = typEl.doctype2_id
		var so = {doc_id:el.doc_id, doctype_id:doctype_id,
			sql:"UPDATE doc SET doctype = :doctype_id WHERE doc_id = :doc_id",
			dataAfterSave:function(response){
				console.log(response)
				el.doctype = doctype_id
			}
		}
		writeSql(so)
	}
	ctrl.content_menu.typeElement = function(type, el){
		ctrl.content_menu.subSepMenuName = type+'_'+el.doc_id
	}
	ctrl.content_menu.deleteElementReference1 = function(el){
		var so = {doc_id:el.doc_id,
			sql:"UPDATE doc SET reference = null WHERE doc_id = :doc_id",
			dataAfterSave:function(response){
				console.log(response)
				delete el.reference2 
			}
		}
		writeSql(so)
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
	ctrl.content_menu.pasteElementChildContent = function(el){
		console.log(el)
		if(ctrl.content_menu.cutObject){
			console.log(ctrl.content_menu.cutObject)
			var so = {parent:el.doc_id,
				doc_id:ctrl.content_menu.cutObject.doc_id,
				sql:"UPDATE doc SET parent=:parent WHERE doc_id=:doc_id",
				dataAfterSave:function(response){
					console.log(response.data)
					delete ctrl.content_menu.cutObject
				}
			}
			writeSql(so)
		}
	}
	ctrl.content_menu.pasteElementContent = function(el){
		console.log(el)
		if(ctrl.content_menu.cutObject){
			console.log(ctrl.content_menu.cutObject)
			var so = {parent:el.parent,
				doc_id:ctrl.content_menu.cutObject.doc_id,
				sql:"UPDATE doc SET parent=:parent WHERE doc_id=:doc_id",
				dataAfterSave:function(response){
					console.log(response.data)
					delete ctrl.content_menu.cutObject
				}
			}
			writeSql(so)
		}else if(ctrl.content_menu.copyObject){
			console.log(el, ctrl.content_menu.copyObject)
			sql_app.copyElement({parent:el.parent, doc_id:':nextDbId'+1}, el.sort, {copyObject:ctrl.content_menu.copyObject, el:el})
		}
	}

	sql_app.copyElement = function(so, sort, d){
		if(d.copyObject.reference) so.reference = d.copyObject.reference
		if(d.copyObject.reference2) so.reference2 = d.copyObject.reference2
		if(d.copyObject.doctype) so.doctype = d.copyObject.doctype
		if(d.copyObject.s1value){
			so.s1value = d.copyObject.s1value
		}
		so.sql = sql_app.INSERT_doc(so)
		if(sort){
			so.sql += "INSERT INTO sort (sort_id, sort) VALUES (" +
				so.doc_id + ", " + sort + ");\n"
		}
		so.sql += sql_app.SELECT_obj_with_i18n(so.doc_id)
		console.log(d.copyObject, so.sql)
		so.dataAfterSave = function(response){
			var newEl
			angular.forEach(response.data, function(v,k){ if(k.indexOf('list')==0){
				newEl = v[0]
			}})
			ctrl.elementsMap[newEl.doc_id] = newEl
			if(!d.elParent){
				var elParent = ctrl.elementsMap[d.el.parent]
				var indexEl = elParent.children.indexOf(d.el)
				console.log(newEl, indexEl)
				elParent.children.splice(indexEl, 0, newEl)
			}else{
				d.elParent.children[sort] = newEl
			}
			if(d.copyObject.children){
				newEl.children = []
				angular.forEach(d.copyObject.children, function(v, k_sort){
					console.log(v)
					sql_app.copyElement({parent:newEl.doc_id, doc_id:':nextDbId'+1}, k_sort, {copyObject:v, elParent:newEl})
				})
			}
		}
		writeSql(so)
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
		console.log(o)
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
	//console.log(d)
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

