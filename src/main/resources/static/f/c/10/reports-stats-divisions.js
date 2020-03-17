//https://api.ehealth-ukraine.org/api/reports/stats/divisions?legal_entity_edrpou=37478567
app.controller('AppCtrl', function($scope, $http, $timeout) {
	ctrl = this
	ctrl.page_title = 'reports-stats-divisions'
	initApp($scope, $http, $timeout)
	initCrud002()
	initDivisions()
	
	read_object2({doc_id:115827})

	exe_fn.httpGet({
		url:ctrl.urls[2],
		then_fn:function(response){
			ctrl.api_divisions = response.data.data
			console.log(ctrl.api_divisions)
		}
	})

})

function initDivisions() {
	ctrl.afterReadObjChildren = function(d){
		d.att_name__id = {}
		angular.forEach(d.children, function(v){
			ctrl.elementsMap[v.doc_id] = v
			var att_name = v.s1value?v.s1value:v.r1value
			d.att_name__id[att_name] = v.doc_id
			if(v.reference && !ctrl.elementsMap[v.reference]){
				read_element(v.reference, function(response){
					var v2 = response.data.list[0]
					ctrl.elementsMap[v.reference] = v2
					if(v2.cnt_child>0 && v2.cnt_child<20){
						read_element_children(v.reference, function(response){
							v2.children = response.data.list
							ctrl.afterReadObjChildren(v2)
						})
					}
				})
			}
		})
	}
	ctrl.init_legal_entity_edit_obj = function(){
		if(!ctrl.legal_entity_edit_obj)
			return
		console.log(ctrl.elementsMap[115827], ctrl.legal_entity_edit_obj)
		var so = {uuid:ctrl.legal_entity_edit_obj.id}
		so.sql = "SELECT * FROM doc,uuid where doc_id=uuid_id and value=:uuid"
		so.afterRead = function(response){
			console.log(so, response.data)
			if(!response.data.list[0])
				return
			var doc_id = response.data.list[0].parent
			read_element(doc_id, function(response){
				console.log(response.data)
				var db_obj = response.data.list[0]
				ctrl.elementsMap[doc_id] = db_obj
				ctrl.legal_entity_edit_obj.db_obj_doc_id = doc_id
				read_element_children_deep(db_obj)
			})
		}
		var read_element_children_deep = function(o){
			read_element_children(o.doc_id, function(response){
				o.children = response.data.list
				angular.forEach(o.children, function(v){
					ctrl.elementsMap[v.doc_id] = v
					if(v.cnt_child){
						read_element_children_deep(v)
					}
				})
			})
		}
		readSql(so)
	}
	ctrl.urls = [
		"https://api-preprod.ehealth.gov.ua/api/reports/stats/divisions",
		"https://api-preprod.ehealth.gov.ua/api/reports/stats/divisions?legal_entity_edrpou=37478567",
		"/f/c/10/divisions0010.json",
		"https://api-preprod.ehealth.gov.ua/api/services",
		"https://api-preprod.ehealth.gov.ua/api/reports/stats/divisions",
		"https://api.ehealth-ukraine.org/api/reports/stats/divisions",
		"https://api.ehealth-ukraine.org/api/reports/stats/divisions?legal_entity_edrpou=37478567",
	]
	ctrl.divisions_table = {}
//	ctrl.divisions_table.type = {n:'Тип', w3tiny:true, style:{'width':'77px'}}
	ctrl.divisions_table.name = {n:'Тип, Ім\'я', style:{'width':'25%'}, include_k:true}
	ctrl.divisions_table.legal_entity = {n:'Юр.особа', include_k:true}
}
