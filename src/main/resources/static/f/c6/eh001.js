var initEh001 = function() {
	ctrl.click_data_row = function(d){if(!d.children){
		var sql = sql_app.obj_with_parent(d.doc_id)
		console.log(d, sql)
		read_dataObject2fn(sql
				, function(response){ if(response.data.list.length>0){
			d.children = response.data.list
			d.cols = {}
			angular.forEach(d.children, function(v){
				d.cols[v.reference] = v
			})
		}})
	}}
	ctrl.read_rows_at_reference = function(reference){
		read_dataObject2fn(sql_app.obj_with_reference(reference), function(response){
			ctrl.doc_rows = response.data.list
		})
	}
	ctrl.doc_data_shortView = {}
	ctrl.doc_data_shortView._115827 = [115783]
	ctrl.doc_data_shortView._115856 = [115879]
	sql_app.obj_with_reference = function(reference){
		var sql = "" +
		"SELECT d.* FROM doc d " +
		"WHERE :reference IN (d.reference) "
		sql = sql.replace(':reference', reference)
		console.log(sql, reference, ctrl.doc_data_shortView)
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
			console.log(sql)
		}
		return sql
	}
	ctrl.children_close = function(d){
		if(d.children){
			d.children_close = !d.children_close
		}
	}
	ctrl.read_children = function(d){ if(!d.children){
		if(ctrl.choice_doc.i18n_parent)
			var sql = sql_app.obj_with_parent_i18n(d.doc_id, ctrl.choice_doc.i18n_parent)
			else
				var sql = sql_app.obj_with_parent(d.doc_id)
		read_dataObject2fn(sql, function(response){ if(response.data.list.length>0){
			d.children = response.data.list
		}})
	}	}
	sql_app.obj_with_parent_i18n= function(parent, i18n_parent){
		var sql = "\n" +
		"SELECT d1.*, sort, s1.value s1value, i18n, i18n_id FROM doc d1 " +
		"LEFT JOIN string s1 ON d1.doc_id = s1.string_id " +
		"LEFT JOIN string s2 ON d1.reference = s2.string_id " +
		"LEFT JOIN sort o1 ON o1.sort_id = d1.doc_id " +
		"left join (SELECT reference i18n_ref, doc_id i18n_id,  value i18n FROM doc " +
		"left join string s1 on s1.string_id=doc_id " +
		"where parent = :i18n_parent ) i18n on i18n_ref=doc_id " +
		"WHERE d1.parent=:parent " +
		"ORDER BY sort "
		sql = sql.replace(':parent', parent).replace(':i18n_parent', i18n_parent)
		console.log(sql)
		return sql
	}
	sql_app.obj_with_parent= function(parent){
		var sql = "\n" +
		"SELECT d1.*, sort, s1.value s1value FROM doc d1 \n" +
		"LEFT JOIN string s1 ON d1.doc_id = s1.string_id \n" +
		"LEFT JOIN string s2 ON d1.reference = s2.string_id \n" +
		"LEFT JOIN sort o1 ON o1.sort_id = d1.doc_id \n" +
		"WHERE d1.parent=:parent \n" +
		"ORDER BY sort "
		sql = sql.replace(':parent', parent)
		console.log(sql)
		return sql
	}
	ctrl.doc_i18n_parent = {}
	ctrl.doc_i18n_parent._285598 = 285597
	ctrl.set_choice_doc = function(d){
		if(ctrl.doc_i18n_parent['_'+d.doc_id])
			d.i18n_parent = ctrl.doc_i18n_parent['_'+d.doc_id]
		ctrl.choice_doc = d
		ctrl.read_children(d)
		ctrl.read_rows_at_reference(d.doc_id)
	}
	ctrl.alert = function(v){
		alert(v+' click')
	}
}

app.controller('AppCtrl', function($scope, $http, $timeout) {
	ctrl = this
	ctrl.page_title = 'eh001'
	initApp($scope, $http, $timeout)
	initEh001()
	read_mergeList('docs', sql_app.obj_with_parent(115800))
	read_mergeList('docs', sql_app.obj_with_parent(285594))
//	read_dataObject('docs', sql_app.obj_with_parent(115800))
	ctrl.set_choice_doc({doc_id:285598, s1value:'legal_entitie'})
})

