app.controller('AppCtrl', function($scope, $http, $timeout) {
	ctrl = this
	ctrl.page_title = 'eh001'
	initApp($scope, $http, $timeout)
	initEh001()
	ctrl.set_choice_doc({doc_id: 115827, value:'legal_entitie'})
	read_dataObject('docs', sql_app.obj_with_parent(115800), null, true)
})

sql_app.obj_with_parent	= function(parent){
	var sql = "" +
	"SELECT * FROM doc d1 " +
	"LEFT JOIN string s1 ON d1.doc_id= s1.string_id " +
	"LEFT JOIN sort o1 ON o1.sort_id=d1.doc_id " +
	"WHERE d1.parent=:parent " +
	"ORDER BY sort "
	sql = sql.replace(':parent', parent)
	return sql
}

function initEh001() {
	ctrl.read_children= function(d){
		if(d.children){
			d.children_close = !d.children_close
		}else{
			read_dataObject2(sql_app.obj_with_parent(d.doc_id), function(response){
				if(response.data.list.length>0){
					d.children = response.data.list
				}
			})
		}
	}
	ctrl.set_choice_doc = function(d){
		ctrl.choice_doc = d
		ctrl.read_children(d)
	}
	ctrl.alert = function(v){
		alert(v+' click')
	}
}
