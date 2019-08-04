app.controller('AppCtrl', function($scope, $http) {
	var ctrl = this
	ctrl.page_title = 'icp2-001'
	$http
	.get("/f/dev3/ICPC2-ua.json")
	.then(function(r){
		ctrl.icpc2 = r.data
		console.log(ctrl.icpc2)
	})
})

