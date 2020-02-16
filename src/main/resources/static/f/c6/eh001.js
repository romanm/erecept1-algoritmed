app.controller('AppCtrl', function($scope, $http, $timeout) {
	ctrl = this
	ctrl.page_title = 'eh001'
	initApp($scope, $http, $timeout)
	initEh001()
	read_mergeList('docs', sql_app.obj_with_parent(115800), true)
	read_mergeList('docs', sql_app.obj_with_doc_id(367496))
	read_mergeList('docs', sql_app.obj_with_doc_id(115920))
	read_mergeList('docs', sql_app.obj_with_doc_id(367550))
	read_mergeList('docs', sql_app.obj_with_doc_id(367563))
	read_mergeList('docs', sql_app.obj_with_doc_id(285598))
	read_mergeList('docs', sql_app.obj_with_parent(115798))
//	read_mergeList('docs', sql_app.obj_with_parent(285594))
	if(ctrl.request.parameters.data){
		read_data(ctrl.request.parameters.data)
	}else{
		if(!ctrl.request.parameters.doc){
			var param_read_docs = [115827]
		}else{
			var param_read_docs = ctrl.request.parameters.doc.split(',')
		}
		ctrl.choice_data_model_id = param_read_docs[0]
	}
})

var read_data = function(edit_data_id) {
	ctrl.edit_data_id = edit_data_id
	console.log(edit_data_id)
	readSql({
		sql:"SELECT * FROM doc WHERE doc_id=:doc_id"
		, doc_id:ctrl.edit_data_id
		, afterRead:function(response){
			var d = response.data.list[0]
			console.log(d)
			ctrl.choice_data_model_id = d.reference
			set_doc_i18n_parent(d, d.reference)
			ctrl.choice_data_model = {i18n_parent:d.i18n_parent}
		}})
}

var initEh001 = function() {
	ctrl.read_obj = function(d){
		read_object(d)
	}
	ctrl.after_mergeList = function (response){
		angular.forEach(response.data.list, function(v){
			if(v.doc_id==ctrl.choice_data_model_id){
				set_choice_data_model(v, v.doc_id)
			}
		})
	}

	ctrl.doc_i18n_parent._285598 = 285597
	ctrl.doc_i18n_parent._115920 = 115924
	ctrl.doc_i18n_parent._367563 = 367566
	ctrl.doc_i18n_parent._115827 = 367318
	ctrl.doc_i18n_parent._367475 = 367318

	ctrl.click_data_model_edit_obj = function(){
		if(ctrl.data_model_edit_obj 
		&& ctrl.data_model_edit_obj.doc_id == ctrl.choice_data_model_obj.doc_id){
			delete ctrl.data_model_edit_obj
			return
		}
		ctrl.data_model_edit_obj = ctrl.choice_data_model_obj
		console.log(ctrl.choice_data_model_obj)
	}

	ctrl.click_data_row = function(d){
		if(d.doc_id!=ctrl.data_row.doc_id){
			delete d.children_close
		}
		if(!d.childern && ctrl.data_row.children && d.doc_id==ctrl.data_row.doc_id){
			d.children=ctrl.data_row.children
		}
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

	conf.init()
	
	ctrl.data_input_valid = {}
	ctrl.data_input_invalid_html = {}
	ctrl.data_input_valid._115791 = function() {//[115791] i edrpou - Код ЄДРПОУ
		if(!ctrl.data_row.cols || !ctrl.data_row.cols[115791])
			return true
		var val = ctrl.elementsMap[ctrl.data_row.cols[115791]]
		if(!val.s1value)
			return true
		var v = val.s1value.match(/^[0-9]{8}$/)
//		console.log(ctrl.data_row.cols[115791].s1value, v!=null)
		return v!=null
	}
	ctrl.data_input_invalid_html._115791 = function() {
		return "<span class='w3-tiny am-b w3-text-red'>" +
					"помилка: має бути число з 8 цифр" +
				"</span>"
	}


	sql_app.obj_with_doc_id= function(doc_id){
		var sql = "\n" +
		"SELECT d1.*, sort" +
		", s1.value s1value, s1.string_id s1_id" +
		", i1.value i1value, i1.integer_id i1_id" +
		", dt1.value dt1value, cnt_child  " +
		"FROM doc d1 \n" +
		"LEFT JOIN string s1 ON d1.doc_id = s1.string_id \n" +
		"LEFT JOIN integer i1 ON d1.doc_id = i1.integer_id \n" +
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

	ctrl.doc_data_parent = {}
	ctrl.doc_data_parent._115827 = 285460
	ctrl.doc_data_parent._367475 = 367476
	ctrl.create_doc = function(){
		var doc_data_parent = ctrl.doc_data_parent['_'+ctrl.choice_data_model.doc_id]
		var so = {parent:doc_data_parent, reference:ctrl.choice_data_model.doc_id,
		dataAfterSave : function(response) {
			console.log(response.data)
		},}
		so.sql = sql_app.INSERT_doc_parent_ref()
		console.log(ctrl.choice_data_model, doc_data_parent, so, so.sql)
		writeSql(so)
	}
	ctrl.insert_reference_node = function(d){ if(!ctrl.data_row.cols[d.doc_id]){
		ctrl.insert_reference_node2(d, ctrl.data_row.cols)
	}}
	ctrl.insert_reference_node2 = function(d, c){
		var cda = ctrl.elementsMap[c.data_id]
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
		so.sql = sql_app.INSERT_doc_parent_ref()
		sql_app.add_INSERT_content(so, d)
		console.log(so, so.sql)
		writeSql(so)
	}}
	sql_app.add_INSERT_content = function(so, doc_model){
		if(doc_model.doctype==26){
			so.sql += "INSERT INTO date (date_id) VALUES (:nextDbId1) ;\n"
		}else
		if(doc_model.doctype==22 || doc_model.doctype==32){
			so.sql += "INSERT INTO string (string_id) VALUES (:nextDbId1) ;\n"
		}
	}
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
	ctrl.delete_empty_list_element = function(c){
		angular.forEach(c.children, function(v, k){
			if(!v.s1value){
				console.log(v, v.s1value, k)
				v.sql = "DELETE FROM doc WHERE doc_id=:doc_id; "
				v.dataAfterSave = function(response){
					console.log(response.data)
					delete v.doc_id
				}
				writeSql(v)
			}
		})
	}

	ctrl.insert_list_element = function(doc_model, c){
		var da = ctrl.elementsMap[ctrl.elementsMap[c.data_id].cols[doc_model.doc_id]]
		var so = {parent:da.doc_id, reference:doc_model.doc_id,
		dataAfterSave : function(response){
			console.log(response.data, so, so.sql)
			if(response.data.list2){
				da.children = response.data.list2
			}else
			if(response.data.list1){
				da.children = response.data.list1
			}
		},}
		so.sql = sql_app.INSERT_doc_parent_ref()
		sql_app.add_INSERT_content(so, doc_model)
		so.sql += sql_app.SELECT_with_parent(da)
		writeSql(so)
	}

	ctrl.save_model_i18n = function(){
		console.log(ctrl.data_model_edit_obj)
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
			so.sql = sql_app.INSERT_doc_parent_ref()
			so.sql += "INSERT INTO string (string_id, value) VALUES (:nextDbId1, :i18n);\n"
			console.log(ctrl.data_model_edit_obj, so, ctrl.choice_data_model, so.sql)
			writeSql(so)
		}
	}
	ctrl.log = function(v){
		console.log(v, '\n -- log')
	}
	ctrl.delete_object = function(t, v){
		var conf = confirm(t)
		if(conf){
			console.log(v)
			v.sql = "DELETE FROM doc WHERE :doc_id IN (doc_id,parent); "
			v.dataAfterSave = function(response){
				console.log(response.data)
				delete v.doc_id
			}
			writeSql(v)
		}
	}
	ctrl.confirm = function(t){
		var conf = confirm(t)
		console.log(conf)
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

