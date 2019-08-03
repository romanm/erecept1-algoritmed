app.controller('AppCtrl', function($scope, $http) {
	var ctrl = this
	ctrl.page_title = 'icp2duodecim'
	$http
	.get("/f/json/icpc2-ebm20190731.json")
	.then(function(r){
		ctrl.icp2duodecim = r.data
		console.log(ctrl.icp2duodecim)
		calcProtocolNumbers(ctrl)
	})
	ctrl.clicked = {}
	ctrl.clicICPC2 = function(protocol, icpc2){
		ctrl.clicked.protocol = protocol
		ctrl.clicked.icpc2 = icpc2
		console.log(protocol, icpc2)
	}
})

var otherICPC2 = function(ctrl, protocol, icpc2){
	if(!ctrl.embNrs[protocol])
		ctrl.embNrs[protocol] = []
	if(!ctrl.embNrs[protocol].includes(icpc2))
	ctrl.embNrs[protocol].push(icpc2)
}

var calcProtocolNumbers = function(ctrl){
	console.log(123)
	var i = 0 
	ctrl.embNrs = {}
	angular.forEach(ctrl.icp2duodecim, function(v,icpc2){
		
		angular.forEach(v.primary, function(protocol){
			i++
			otherICPC2(ctrl, protocol, icpc2)
		})
		angular.forEach(v.secondary, function(protocol){
			i++
			otherICPC2(ctrl, protocol, icpc2)
		})
	})
	console.log(i, ctrl.embNrs)
}
