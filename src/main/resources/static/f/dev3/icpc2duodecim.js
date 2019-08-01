app.controller('AppCtrl', function($scope, $http) {
	var ctrl = this
	ctrl.page_title = 'icp2duodecim'
	$http
	.get("/f/json/icpc2-ebm20190731.json")
	.then(function(r){
		ctrl.icp2duodecim = r.data
		console.log(ctrl.icp2duodecim)
	})
})
