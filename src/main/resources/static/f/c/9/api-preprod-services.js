app.controller('AppCtrl', function($scope, $http, $timeout) {
	ctrl = this
	ctrl.page_title = 'api-preprod-services'
	initApp($scope, $http, $timeout)
	initDpServices()
	
	exe_fn.httpGet({
		url1:'https://api-preprod.ehealth.gov.ua/api/services',
		url:'/f/c/9/services.json',
		then_fn:function(response){
			ctrl.api_services = response.data.data
			console.log(ctrl.api_services)
			angular.forEach(ctrl.api_services, function(v){
				if(v.groups){
					var gg = 0
					angular.forEach(v.groups, function(v2){
						if(v2.groups){
							gg += v2.groups.length
						}
					})
					if(gg>0){
						v.gg_cnt = gg + v.groups.length
					}
				}
			})
		}
	})

})

var initDpServices = function(){
	ctrl.click_service_1 = function(el){
		ctrl.code=el.code
		console.log(el)
		el.open_children = !el.open_children
	}
	console.log(123)
}