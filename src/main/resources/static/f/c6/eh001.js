app.controller('AppCtrl', function($scope, $http, $timeout) {
	ctrl = this
	ctrl.page_title = 'eh001'
	initApp($scope, $http, $timeout)
	initEh001()
	read_mergeList('docs', sql_app.obj_with_parent(115800))
	read_mergeList('docs', sql_app.obj_with_parent(285594))
	read_mergeList('docs', sql_app.obj_with_doc_id(115920))
//	read_dataObject('docs', sql_app.obj_with_parent(115800))
	ctrl.set_choice_doc({doc_id: 115827, s1value:'legal_entitie'})

//	seek_pologove ()
	
})

var read_data_for_data_editor = function(d) {
	if(ctrl.data_editor_opened()){
		if(!ctrl.menu_list_count)
			ctrl.menu_list_count = {}
		console.log('read_data_for_data_editor', d)
		angular.forEach(d.children, function(v){ if(v.reference){
			var sql = sql_app.obj_with_parent_i18n(v.reference, 115924)
			var sql2 = "SELECT count(*) FROM (" + sql.split("ORDER BY")[0] +") a"
//			console.log(v.reference, sql2)
			read_dataObject2fn(sql2, function(response){ if(response.data.list.length>0){
				ctrl.menu_list_count[v.reference] = response.data.list[0].count
				if(ctrl.menu_list_count[v.reference]>0){
					if(ctrl.menu_list_count[v.reference]<20){
						read_dataObject2fn(sql, function(response2){
							ctrl.elementsMap[v.reference] = response2.data.list
						})
					}
				}
			}})
		}})
		console.log(ctrl.menu_list_count)
	}
}

var initEh001 = function() {
	ctrl.click_data_row = function(d){
		ctrl.data_row = d
		if(!d.children){
			var sql = sql_app.obj_with_parent(d.doc_id)
			//console.log(d, sql)
			read_dataObject2fn(sql , function(response){ if(response.data.list.length>0){
				d.children = response.data.list
				d.cols = {}
				angular.forEach(d.children, function(v){
					d.cols[v.reference] = v
				})
				var data_model = ctrl.elementsMap[d.reference]
				read_data_for_data_editor(data_model)
			}
			})
		}
	}
	ctrl.read_rows_at_reference = function(reference){
		read_dataObject2fn(sql_app.obj_with_reference(reference), function(response){
			ctrl.doc_rows = response.data.list
			if(!ctrl.data_row && ctrl.request.parameters.row){
				angular.forEach(ctrl.doc_rows, function(v){ if(ctrl.request.parameters.row==v.doc_id){
					ctrl.click_data_row(v)
				}})
			}
		})
	}
	ctrl.style ={}
	ctrl.style.model_data_row ={width:'40%'}
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
	ctrl.data_input_valid = {}
	ctrl.data_input_invalid_html = {}
	ctrl.data_input_valid._115791 = function() {//[115791] i edrpou - Код ЄДРПОУ
		if(!ctrl.data_row.cols || !ctrl.data_row.cols[115791])
			return true
		var v = ctrl.data_row.cols[115791].s1value.match(/^[0-9]{8}$/)
//		console.log(ctrl.data_row.cols[115791].s1value, v!=null)
		return v!=null
	}
	ctrl.data_input_invalid_html._115791 = function() {
		return "<span class='w3-tiny am-b w3-text-red'>" +
					"помилка: має бути число з 8 цифр" +
				"</span>"
	}
	ctrl.doc_data_shortView = {}
	ctrl.doc_data_shortView._115827 = [115783]
	ctrl.doc_data_shortView._115856 = [115879]
	sql_app.obj_with_reference = function(reference){
		var sql = "" +
		"SELECT d.* FROM doc d " +
		"WHERE :reference IN (d.reference) "
		sql = sql.replace(':reference', reference)
//		console.log(sql, reference, ctrl.doc_data_shortView)
		var sv = ctrl.doc_data_shortView['_'+reference]
		if(sv){
			var lf_sqls=' doc d \n', lf_cols=' d.* '
			angular.forEach(sv, function(v,k){
//				console.log(v, k)
				lf_cols += ", s" +k+".value s_"+v+"_value "
				lf_sqls += "" +
				"LEFT JOIN doc d" + k + 
				" LEFT JOIN string s" + k + " ON s" + k + ".string_id=d" + k + ".doc_id " +
				" ON d" + k + ".parent = d.doc_id AND d" + k + ".reference = "+v +"\n"
			})
//			console.log(lf_sqls, lf_cols)
			sql = sql.replace(' doc d ', lf_sqls)
			sql = sql.replace(' d.* ', lf_cols)
//			console.log(sql)
		}
		return sql
	}
	ctrl.data_editor_opened = function(){ 
		var data_editor_open = ctrl.data_row && !ctrl.data_row.children_close
		return data_editor_open
	}
	ctrl.children_close = function(d){ 
		if(d.children){
			console.log(d)
			d.children_close = !d.children_close
		}
	}
	ctrl.read_children = function(d){
		ctrl.choice_obj = d
		if(!d.children) {
			if(ctrl.choice_doc.i18n_parent)
				var sql = sql_app.obj_with_parent_i18n(d.doc_id, ctrl.choice_doc.i18n_parent)
				else
					var sql = sql_app.obj_with_parent(d.doc_id)
					
//			console.log(sql)
			read_dataObject2fn(sql, function(response){ if(response.data.list.length>0){
				d.children = response.data.list
			}})
		}
	}
	sql_app.select_i18n= function(left_join_ref, i18n_parent){
		var sql = "" +
		"SELECT reference i18n_ref, doc_id i18n_id, value i18n FROM doc \n" +
		"LEFT JOIN string s1 ON s1.string_id=doc_id \n" +
		"WHERE parent = :i18n_parent "
		if(left_join_ref){
			sql = "LEFT JOIN (" +sql +") i18n ON i18n_ref=:left_join_ref"
			sql = sql.replace(":left_join_ref", left_join_ref)
		}
		if(i18n_parent){
			sql = sql.replace(":i18n_parent", i18n_parent)
		}
		return sql
	}
	sql_app.obj_with_parent_i18n= function(parent, i18n_parent){
		var sql = "\n" +
		"SELECT d1.*, sort, s1.value s1value, i18n, i18n_id FROM doc d1 \n" +
		"LEFT JOIN string s1 ON d1.doc_id = s1.string_id \n" +
		"LEFT JOIN string s2 ON d1.reference = s2.string_id \n" +
		"LEFT JOIN sort o1 ON o1.sort_id = d1.doc_id \n" +
		sql_app.select_i18n("d1.doc_id") + " \n"+
//		"LEFT JOIN (SELECT reference i18n_ref, doc_id i18n_id, value i18n FROM doc \n" +
//		"LEFT JOIN string s1 ON s1.string_id=doc_id \n" +
//		"WHERE parent = :i18n_parent) i18n ON i18n_ref=d1.doc_id \n" +
		"WHERE d1.parent=:parent " +
		"ORDER BY sort "
		sql = sql.replace(':parent', parent).replace(':i18n_parent', i18n_parent)
//		console.log(sql)
		return sql
	}
	sql_app.obj_with_doc_id= function(doc_id){
		var sql = "\n" +
		"SELECT d1.*, sort, s1.value s1value, s1.string_id s1_id FROM doc d1 \n" +
		"LEFT JOIN string s1 ON d1.doc_id = s1.string_id \n" +
		"LEFT JOIN string s2 ON d1.reference = s2.string_id \n" +
		"LEFT JOIN sort o1 ON o1.sort_id = d1.doc_id \n" +
		"WHERE d1.doc_id = :doc_id \n" +
		"ORDER BY sort "
		sql = sql.replace(':doc_id', doc_id)
//		console.log(sql)
		return sql
	}
	sql_app.obj_with_parent= function(parent){
		var sql = "\n" +
		"SELECT d1.*, sort, s1.value s1value, s1.string_id s1_id FROM doc d1 \n" +
		"LEFT JOIN string s1 ON d1.doc_id = s1.string_id \n" +
		"LEFT JOIN string s2 ON d1.reference = s2.string_id \n" +
		"LEFT JOIN sort o1 ON o1.sort_id = d1.doc_id \n" +
		"WHERE d1.parent = :parent \n" +
		"ORDER BY sort "
		sql = sql.replace(':parent', parent)
//		console.log(sql)
		return sql
	}
	ctrl.doc_i18n_parent = {}
	ctrl.doc_i18n_parent._285598 = 285597
	ctrl.doc_i18n_parent._115827 = 367318
	ctrl.doc_i18n_parent._115920 = 115924
	ctrl.set_choice_doc = function(d){
		if(ctrl.doc_i18n_parent['_'+d.doc_id])
			d.i18n_parent = ctrl.doc_i18n_parent['_'+d.doc_id]
		ctrl.choice_doc = d
		ctrl.read_children(d)
		ctrl.read_rows_at_reference(d.doc_id)
		ctrl.elementsMap[d.doc_id] = d
		read_data_for_data_editor(d)
	}
	ctrl.click_edit_obj = function(){
		if(ctrl.edit_obj && ctrl.edit_obj.doc_id == ctrl.choice_obj.doc_id){
			delete ctrl.edit_obj
			return
		}
		ctrl.edit_obj = ctrl.choice_obj
		console.log(ctrl.choice_obj)
	}
	ctrl.update_reference2 = function(d){
		d.sql = "UPDATE doc set reference2=:reference2 where doc_id=:doc_id"
		d.dataAfterSave = function(response) {
			console.log(response)
		}
		console.log(d)
		writeSql(d)
	}
	ctrl.update_data = function(d){if(d && d.doc_id){
		var so = { s1value : d.s1value, string_id : d.doc_id,
		dataAfterSave : function(response) {
			console.log(d, response.data, so)
		},}
		so.sql = "UPDATE string SET value=:s1value WHERE string_id=:string_id"
		console.log(d, so)
		writeSql(so)
	}}
	ctrl.insert_reference_node = function(d){ if(!ctrl.data_row.cols[d.doc_id]){
		console.log(d.doctype, d, ctrl.data_row)
		var so = { parent: ctrl.data_row.doc_id, reference : d.doc_id,
		dataAfterSave : function(response) {
			console.log(d, response.data, so)
			var adn = {}
			adn.doc_id = response.data.nextDbId1
			adn.reference = d.doc_id
			ctrl.data_row.children.push(adn)
			ctrl.data_row.cols[d.doc_id] = adn
		},}
		so.sql = "INSERT INTO doc (doc_id, parent, reference) VALUES (:nextDbId1, :parent, :reference); \n"
		if(d.doctype==22){
			so.sql += "INSERT INTO string (string_id) VALUES (:nextDbId1);\n"
		}
		console.log(so)
		writeSql(so)
	}}
	ctrl.save_model_i18n = function(){
		if(ctrl.edit_obj.i18n_id){
			var so = { i18n : ctrl.edit_obj.i18n, i18n_id : ctrl.edit_obj.i18n_id,
			dataAfterSave : function(response){
				console.log(ctrl.edit_obj, response.data, so)
			},}
			so.sql = "UPDATE string SET value=:i18n WHERE string_id=:i18n_id"
			writeSql(so)
		}else if(ctrl.choice_doc.i18n_parent){
			var so = {parent:ctrl.choice_doc.i18n_parent, reference:ctrl.edit_obj.doc_id, i18n:ctrl.edit_obj.i18n,
			dataAfterSave : function(response){
				console.log(ctrl.edit_obj, response.data, so)
				ctrl.edit_obj.i18n_id = response.data.nextDbId1
			},}
			so.sql = "INSERT INTO doc (doc_id, parent, reference) VALUES (:nextDbId1, :parent, :reference);\n"
			so.sql += "INSERT INTO string (string_id, value) VALUES (:nextDbId1, :i18n);\n"
			console.log(ctrl.edit_obj, so, ctrl.choice_doc, so.sql)
			writeSql(so)
		}
	}
	ctrl.log = function(v){
		console.log(v, '\n -- log')
	}
	ctrl.alert = function(v){
		alert(v+' click')
	}
}


function seek_pologove (){
	ctrl.seek_pologove = {}
	ctrl.seek_pologove.pattern = ':seek_like'
	ctrl.seek_pologove.pattern_keys = function(pattern_list) {
		return Object.keys(pattern_list)
	}
	ctrl.seek_pologove.val = 'O91'
	ctrl.seek_pologove.sql = "" +
		"SELECT COUNT(*) FROM (" +
		"SELECT EXTRACT(year FROM vipisaniy) y, * " +
		"\n FROM pologove2019" +
		") a " +
		"\n WHERE y=2019" +
		" AND (icd10_1 LIKE ':seek_like'" +
		" OR icd10_2 LIKE ':seek_like'" +
		" OR icd10_3 LIKE ':seek_like'" +
		" )"
	ctrl.seek_pologove.seek = function(){
		ctrl.seek_pologove.pattern_list = {}
		var sp_sc = this.sql.split(':')
		console.log(sp_sc)
		angular.forEach(sp_sc, function(v,k){ if(k>0){
			var w = v.split(' ')[0]
			.replace("'",'')
//			.replace("%",'')
			console.log(w, v)
			ctrl.seek_pologove.pattern_list[w] = k
		}})
		console.log(ctrl.seek_pologove.pattern_list
		,		ctrl.seek_pologove.pattern_keys(ctrl.seek_pologove.pattern_list).length
		)
		if(ctrl.seek_pologove.pattern_keys(ctrl.seek_pologove.pattern_list).length==0){
			this.sql1 = this.sql
		}else{
			angular.forEach(ctrl.seek_pologove.pattern_list, function(v,k){
				console.log(k)
				ctrl.seek_pologove.sql1 = ctrl.seek_pologove.sql.split(':'+k).join(ctrl.seek_pologove.val+'%')
			})
		}
		console.log(this.sql1)
		read_dataObject2fn(this.sql1 , function(response){
			ctrl.seek_pologove.result = response.data.list
		})
	}
	ctrl.seek_pologove.seek()
}

