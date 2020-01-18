app.controller('AppCtrl', function($scope, $http, $timeout) {
	ctrl = this
	ctrl.page_title = 'eh001'
	initApp($scope, $http, $timeout)
	initEh001()
	read_mergeList('docs', sql_app.obj_with_parent(115800), true)
	read_mergeList('docs', sql_app.obj_with_parent(285594))
	read_mergeList('docs', sql_app.obj_with_doc_id(115920))
	if(ctrl.request.parameters.data){
		read_data()
	}else{
		if(!ctrl.request.parameters.doc){
			var param_read_docs = [115827]
		}else{
			var param_read_docs = ctrl.request.parameters.doc.split(',')
		}
		ctrl.choice_data_model_id = param_read_docs[0]
	}
//	seek_pologove ()
})

var read_data = function() {
	console.log(ctrl.request.parameters.data)
	readSql({
		sql:"SELECT * FROM doc WHERE doc_id=:doc_id"
		, doc_id:ctrl.request.parameters.data
		, afterRead:function(response){
			var d = response.data.list[0]
			console.log(d)
			ctrl.choice_data_model_id = d.reference
			ctrl.data_row = d
			read_children(d)
	}})
}

var read_data_for_data_editor = function(d) {
	if(d && ctrl.data_editor_opened()){
		if(!ctrl.menu_list_count)
			ctrl.menu_list_count = {}
		console.log('read_data_for_data_editor', d, d.children)
		angular.forEach(d.children, function(v){ 
			if(v.reference){
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

var read_children = function(d) {
	if(!d.children) {
		if(ctrl.choice_data_model.i18n_parent)
			var sql = sql_app.obj_with_parent_i18n(d.doc_id, ctrl.choice_data_model.i18n_parent)
			else
				var sql = sql_app.obj_with_parent(d.doc_id)
//				console.log(sql)
		read_dataObject2fn(sql, function(response){ if(response.data.list.length>0){
			d.children = response.data.list
			d.cols = {}
			angular.forEach(d.children, function(v){
				d.cols[v.reference] = v
				if(v.cnt_child>0){
//								console.log(v)
					read_children(v)
				}
			})
			var data_model = ctrl.elementsMap[d.reference]
			read_data_for_data_editor(data_model)
		}})
	}
}

var initEh001 = function() {
	ctrl.after_mergeList = function (response){
		angular.forEach(response.data.list, function(v){
			if(v.doc_id==ctrl.choice_data_model_id){
				set_choice_data_model(v)
			}
		})
	}

	var set_choice_data_model = function(d){
		if(ctrl.doc_i18n_parent['_'+d.doc_id])
			d.i18n_parent = ctrl.doc_i18n_parent['_'+d.doc_id]
		ctrl.choice_data_model = d
		read_model_children(d)
		read_rows_at_reference(d.doc_id)
		return
		ctrl.elementsMap[d.doc_id] = d
		read_data_for_data_editor(d)
	}
	var read_model_children = function(d){
		ctrl.choice_data_model_obj = d
		read_children(d)
	}
	ctrl.click_data_model_edit_obj = function(){
		if(ctrl.data_model_edit_obj 
		&& ctrl.data_model_edit_obj.doc_id == ctrl.choice_data_model_obj.doc_id){
			delete ctrl.data_model_edit_obj
			return
		}
		ctrl.data_model_edit_obj = ctrl.choice_data_model_obj
		console.log(ctrl.choice_data_model_obj)
	}
	ctrl.doc_i18n_parent = {}
	ctrl.doc_i18n_parent._285598 = 285597
	ctrl.doc_i18n_parent._115827 = 367318
	ctrl.doc_i18n_parent._115920 = 115924


	ctrl.click_data_row = function(d){
		ctrl.data_row = d
		read_children(d)
	}
	ctrl.children_close = function(d){ 
		if(d.children_close === undefined){
			d.children_close = false
		}else{
			d.children_close = !d.children_close
		}
	}
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
		var sv = ctrl.doc_data_shortView['_'+reference]
		console.log(sql, reference, ctrl.doc_data_shortView, sv)
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
			console.log(lf_sqls, lf_cols)
			sql = sql.replace(' doc d ', lf_sqls)
			sql = sql.replace(' d.* ', lf_cols)
			console.log(sql)
		}
		return sql
	}
	ctrl.data_editor_opened = function(){ 
		var data_editor_open = ctrl.data_row && !ctrl.data_row.children_close
		return data_editor_open
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
		"SELECT d1.*, sort, s1.value s1value, dt1.value dt1value, i18n, i18n_id, cnt_child  " +
		"FROM doc d1 \n" +
		"LEFT JOIN string s1 ON d1.doc_id = s1.string_id \n" +
		"LEFT JOIN date dt1 ON d1.doc_id = dt1.date_id \n" +
		//"LEFT JOIN string s2 ON d1.reference = s2.string_id \n" +
		sql_app.select_i18n("d1.doc_id") + " \n"+
//		"LEFT JOIN (SELECT reference i18n_ref, doc_id i18n_id, value i18n FROM doc \n" +
//		"LEFT JOIN string s1 ON s1.string_id=doc_id \n" +
//		"WHERE parent = :i18n_parent) i18n ON i18n_ref=d1.doc_id \n" +
		"LEFT JOIN sort o1 ON o1.sort_id = d1.doc_id \n" +
		"LEFT JOIN (SELECT COUNT(*) cnt_child, parent FROM doc GROUP BY parent) d2 ON d2.parent=d1.doc_id \n" +
		"WHERE d1.parent=:parent " +
		"ORDER BY sort "
		sql = sql.replace(':parent', parent).replace(':i18n_parent', i18n_parent)
//		console.log(sql)
		return sql
	}
	sql_app.obj_with_doc_id= function(doc_id){
		var sql = "\n" +
		"SELECT d1.*, sort, s1.value s1value, s1.string_id s1_id, dt1.value dt1value, cnt_child  " +
		"FROM doc d1 \n" +
		"LEFT JOIN string s1 ON d1.doc_id = s1.string_id \n" +
		"LEFT JOIN date dt1 ON d1.doc_id = dt1.date_id \n" +
		//"LEFT JOIN string s2 ON d1.reference = s2.string_id \n" +
		"LEFT JOIN sort o1 ON o1.sort_id = d1.doc_id \n" +
		"LEFT JOIN (SELECT COUNT(*) cnt_child, parent FROM doc GROUP BY parent) d2 ON d2.parent=d1.doc_id \n" +
		"WHERE d1.doc_id = :doc_id \n" +
		"ORDER BY sort "
		sql = sql.replace(':doc_id', doc_id)
//		console.log(sql)
		return sql
	}
	sql_app.obj_with_parent= function(parent){
		var sql = "\n" +
		"SELECT d1.*, sort, s1.value s1value, s1.string_id s1_id, dt1.value dt1value, cnt_child " +
		"FROM doc d1 \n" +
		"LEFT JOIN string s1 ON d1.doc_id = s1.string_id \n" +
		"LEFT JOIN date dt1 ON d1.doc_id = dt1.date_id \n" +
		"LEFT JOIN string s2 ON d1.reference = s2.string_id \n" +
		"LEFT JOIN sort o1 ON o1.sort_id = d1.doc_id \n" +
		"LEFT JOIN (SELECT COUNT(*) cnt_child, parent FROM doc GROUP BY parent) d2 ON d2.parent=d1.doc_id \n" +
		"WHERE d1.parent = :parent \n" +
		"ORDER BY sort "
		sql = sql.replace(':parent', parent)
//		console.log(sql)
		return sql
	}

	var read_rows_at_reference = function(reference){
		console.log(reference)
		read_dataObject2fn(sql_app.obj_with_reference(reference), function(response){
			ctrl.doc_rows = response.data.list
			if(!ctrl.data_row && ctrl.request.parameters.row){
				angular.forEach(ctrl.doc_rows, function(v){ if(ctrl.request.parameters.row==v.doc_id){
					ctrl.click_data_row(v)
				}})
			}
		})
	}

	ctrl.doc_data_parent = {}
	ctrl.doc_data_parent._115827 = 285460
	ctrl.create_doc = function(){
		var doc_data_parent = ctrl.doc_data_parent['_'+ctrl.choice_data_model.doc_id]
		var so = {parent:doc_data_parent, reference:ctrl.choice_data_model.doc_id,
		dataAfterSave : function(response) {
			console.log(response.data)
		},}
		so.sql = "INSERT INTO doc (doc_id, parent, reference) VALUES (:nextDbId1, :parent, :reference)"
		console.log(ctrl.choice_data_model, doc_data_parent, so, so.sql)
		writeSql(so)
	}
	ctrl.insert_reference_node = function(d){ if(!ctrl.data_row.cols[d.doc_id]){
		ctrl.insert_reference_node2(d, ctrl.data_row.cols)
	}}
	ctrl.insert_reference_node2 = function(d, cda){
		console.log(d, cda)
		if(!cda.cols || !cda.cols[d.doc_id]){
		var so = { parent: cda.doc_id, reference : d.doc_id,
		dataAfterSave : function(response) {
			console.log(d, response.data, so)
			var adn = {}
			adn.doc_id = response.data.nextDbId1
			adn.parent = cda.doc_id
			adn.reference = d.doc_id
			if(!cda.children)
				cda.children = []
			cda.children.push(adn)
			if(!cda.cols)
				cda.cols = {}
			cda.cols[d.doc_id] = adn
		},}
		so.sql = "INSERT INTO doc (doc_id, parent, reference) VALUES (:nextDbId1, :parent, :reference); \n"
		if(d.doctype==26){
			so.sql += "INSERT INTO date (date_id) VALUES (:nextDbId1);\n"
		}else
		if(d.doctype==22){
			so.sql += "INSERT INTO string (string_id) VALUES (:nextDbId1);\n"
		}
		console.log(so, so.sql)
		writeSql(so)
	}}
	ctrl.update_reference2 = function(d){
		d.sql = "UPDATE doc set reference2=:reference2 where doc_id=:doc_id"
		d.dataAfterSave = function(response) {
			console.log(response)
		}
		writeSql(d)
	}
	ctrl.update_data_date = function(d){if(d && d.s1value){
		var dt = new Date(Date.parse(d.s1value))
		dt.setDate(dt.getDate()+1)
		d.dt1value = dt.toISOString().split('T')[0]
		console.log(dt.toISOString(), d)
		var so = { dt1value : dt.toISOString(), date_id : d.doc_id,
		dataAfterSave : function(response) {
			console.log(d, response.data, so)
		},}
		so.sql = "UPDATE date SET value=:dt1value WHERE date_id=:date_id"
//		console.log(d, so)
		writeSql(so)
	}}
	ctrl.update_data = function(d){if(d && d.doc_id){
		var so = { s1value : d.s1value, string_id : d.doc_id,
		dataAfterSave : function(response) {
			console.log(d, response.data, so)
		},}
		so.sql = "UPDATE string SET value=:s1value WHERE string_id=:string_id"
		console.log(d, so)
		writeSql(so)
	}}
	ctrl.insert_list_element = function(dt, da){
		console.log(dt, da, dt.doc_id, da.cols[dt.doc_id])
	}
	ctrl.save_model_i18n = function(){
		if(ctrl.data_model_edit_obj.i18n_id){
			var so = { i18n : ctrl.data_model_edit_obj.i18n, i18n_id : ctrl.data_model_edit_obj.i18n_id,
			dataAfterSave : function(response){
				console.log(ctrl.data_model_edit_obj, response.data, so)
			},}
			so.sql = "UPDATE string SET value=:i18n WHERE string_id=:i18n_id"
			writeSql(so)
		}else if(ctrl.choice_data_model.i18n_parent){
			var so = {parent:ctrl.choice_data_model.i18n_parent, reference:ctrl.data_model_edit_obj.doc_id, i18n:ctrl.data_model_edit_obj.i18n,
			dataAfterSave : function(response){
				console.log(ctrl.data_model_edit_obj, response.data, so)
				ctrl.data_model_edit_obj.i18n_id = response.data.nextDbId1
			},}
			so.sql = "INSERT INTO doc (doc_id, parent, reference) VALUES (:nextDbId1, :parent, :reference);\n"
			so.sql += "INSERT INTO string (string_id, value) VALUES (:nextDbId1, :i18n);\n"
			console.log(ctrl.data_model_edit_obj, so, ctrl.choice_data_model, so.sql)
			writeSql(so)
		}
	}
	ctrl.log = function(v){
		console.log(v, '\n -- log')
	}
	ctrl.alert = function(v){
		alert(v+' click')
	}
	ctrl.keys = function(o) {if(o){
		return Object.keys(o)
	}}
}

function seek_pologove (){
	ctrl.seek_pologove = {}
	ctrl.seek_pologove.pattern = ':seek_like'
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

