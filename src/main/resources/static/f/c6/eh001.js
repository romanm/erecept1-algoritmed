var initEh001 = function() {
	ctrl.click_data_row = function(d){if(!d.children){
		console.log(d)
		read_dataObject2(sql_app.obj_with_parent(d.doc_id), function(response){if(response.data.list.length>0){
			d.children = response.data.list
			d.cols = {}
			angular.forEach(d.children, function(v){
				d.cols[v.reference] = v
			})
		}})
	}}
	ctrl.read_rows_at_reference = function(reference){
		read_dataObject2(sql_app.obj_with_reference(reference), function(response){
			ctrl.doc_rows = response.data.list
		})
	}
	sql_app.obj_with_reference = function(reference){
		var sql = "SELECT * FROM doc where :reference in (reference)"
		sql = sql.replace(':reference', reference)
		return sql
	}
	ctrl.children_close = function(d){
		console.log(d)
		if(d.children){
			d.children_close = !d.children_close
		}
	}
	ctrl.read_children = function(d){
		if(!d.children){
			read_dataObject2(sql_app.obj_with_parent(d.doc_id), function(response){
				if(response.data.list.length>0){
					d.children = response.data.list
				}
			})
		}
	}
	sql_app.obj_with_parent= function(parent){
		var sql = "\n" +
		"SELECT d1.*, sort, s1.value s1value FROM doc d1 \n" +
		"LEFT JOIN string s1 ON d1.doc_id= s1.string_id \n" +
		"LEFT JOIN string s2 ON d1.reference= s2.string_id \n" +
		"LEFT JOIN sort o1 ON o1.sort_id=d1.doc_id \n" +
		"WHERE d1.parent=:parent \n" +
		"ORDER BY sort "
		sql = sql.replace(':parent', parent)
//		console.log(sql)
		return sql
	}
	ctrl.set_choice_doc = function(d){
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
	read_dataObject('docs', sql_app.obj_with_parent(115800), null, true)
	ctrl.set_choice_doc({doc_id: 115827, s1value:'legal_entitie'})
})
