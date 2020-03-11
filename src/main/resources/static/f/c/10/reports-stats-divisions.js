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
		console.log('read data_model reference', d.doc_id)
		var key_reference = {}
		angular.forEach(d.children, function(v){
			var att_name = v.s1value?v.s1value:v.r1value
			key_reference[att_name] = v.doc_id
			if(v.reference && !ctrl.elementsMap[v.reference]){
				read_element(v.reference, function(response){
					var v2 = response.data.list[0]
					ctrl.elementsMap[v.reference] = v2
					if(v2.cnt_child>0 && v2.cnt_child<20){
						read_element_children(v.reference, function(response){
							v2.children = response.data.list
							console.log('read ',v2.cnt_child, v.reference)
						})
					}
				})
			}
		})
		d.key_reference=key_reference
	}
	ctrl.init_legal_entity_edit_obj = function(){
		console.log(ctrl.elementsMap[115827])
		angular.forEach(ctrl.elementsMap[115827].children, function(v){
//			console.log(v.s1value, v.doctype)
		})
	}
	ctrl.urls = [
		"https://api.ehealth-ukraine.org/api/reports/stats/divisions",
		"https://api.ehealth-ukraine.org/api/reports/stats/divisions?legal_entity_edrpou=37478567",
		"/f/c/10/divisions0010.json",
		"https://api-preprod.ehealth.gov.ua/api/services",
	]
	ctrl.divisions_table = {}
//	ctrl.divisions_table.type = {n:'Тип', w3tiny:true, style:{'width':'77px'}}
	ctrl.divisions_table.name = {n:'Тип, Ім\'я', style:{'width':'25%'}, include_k:true}
	ctrl.divisions_table.legal_entity = {n:'Юр.особа', include_k:true}
}
