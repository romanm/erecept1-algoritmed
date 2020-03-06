//https://api.ehealth-ukraine.org/api/reports/stats/divisions?legal_entity_edrpou=37478567
app.controller('AppCtrl', function($scope, $http, $timeout) {
	ctrl = this
	ctrl.page_title = 'reports-stats-divisions'
	initApp($scope, $http, $timeout)
	initDivisions()
	
	exe_fn.httpGet({
		url:ctrl.urls[0],
		url1:'/f/c/9/services.json',
		then_fn:function(response){
			ctrl.api_divisions = response.data.data
			console.log(ctrl.api_divisions)
		}
	})

})

function initDivisions() {
	ctrl.urls = [
		"https://api.ehealth-ukraine.org/api/reports/stats/divisions",
		"https://api.ehealth-ukraine.org/api/reports/stats/divisions?legal_entity_edrpou=37478567"
	]
	ctrl.divisions_table = {}
//	ctrl.divisions_table.type = {n:'Тип', w3tiny:true, style:{'width':'77px'}}
	ctrl.divisions_table.name = {n:'Тип, Ім\'я', style:{'width':'300px'}, include_k:true}
	ctrl.divisions_table.legal_entity = {n:'Юр.особа', include_k:true}
}