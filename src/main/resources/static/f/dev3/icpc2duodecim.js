app.controller('AppCtrl', function($scope, $http) {
	var ctrl = this
	ctrl.page_title = 'icp2duodecim'
	initApp($scope, $http, ctrl)
	$http
	.get("/f/json/icpc2-ebm20190731.json")
	.then(function(r){
		ctrl.icp2duodecim = r.data
		console.log(ctrl.icp2duodecim)
		calcProtocolNumbers(ctrl)
	})
	ctrl.clickDuodecimNote = function(protocol, icpc2Key){
		ctrl.clicICPC2(protocol, icpc2Key)
	}
	ctrl.clicked = {}
	ctrl.clicICPC2 = function(protocol, icpc2Key){
		ctrl.clicked.protocol = protocol
		ctrl.clicked.icpc2Key = icpc2Key
		console.log(ctrl.clicked, ctrl.embNrs[protocol])
		var inIcpc2 = JSON.stringify(ctrl.embNrs[protocol])
		.replace('[','(')
		.replace(']',')')
		.replace(/"/g,"'")
		.replace(/'(\d)/g,"'-$1")
		.replace(/'(\*)/g,"'-")
		console.log(inIcpc2)
		var sql = sql_app.select_icpc2_i18n_values() + " AND a.value IN " + inIcpc2
		console.log(sql)
		readSql({ sql:sql, afterRead:function(r){
			console.log(r.data)
			ctrl.clicked.icpc2I18ns = {}
			angular.forEach(r.data.list, function(v){
				ctrl.clicked.icpc2I18ns[v.value] = v
			})
		}})

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
