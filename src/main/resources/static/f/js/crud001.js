var set_choice_data_model2 = function(d, data_model_id){
	console.log(d, data_model_id)
	set_doc_i18n_parent(d, data_model_id)
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
	if(ctrl.doc_i18n_parent['_'+data_model_id])
		d.i18n_parent = ctrl.doc_i18n_parent['_'+data_model_id]
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

