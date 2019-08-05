app.controller('AppCtrl', function($scope, $http) {
	var ctrl = this
	ctrl.page_title = 'icp2-001'
	initApp($scope, $http, ctrl)

	$http
	.get("/f/dev3/ICPC2-ua.json")
	.then(function(r){
		ctrl.icpc2 = r.data
//		insertICPC2_GROUP(ctrl)
	})
})

var insertICPC2_GROUP = function(ctrl){
//	console.log(ctrl.icpc2.group)
	var sqls = ""
	angular.forEach(ctrl.icpc2.group, function(v,k){
		var sql = "" +
		"INSERT INTO doc (doc_id,parent,doctype) " +
		"VALUES (:nextDbId1, 285598, 18);\n" +
		"INSERT INTO string (string_id, value) VALUES (:nextDbId1, '" +
		k +
		"');\n" +
		"INSERT INTO doc (doc_id,parent,doctype,reference) " +
		"VALUES (:nextDbId2,  285597, 18, :nextDbId1 );\n" +
		"INSERT INTO string (string_id, value) VALUES (:nextDbId2, '" +
		v.name.replace(/'/g,"''") +
		"');" +
		""
		if(true||'A'==k){
			console.log(k,v)
			console.log( sql)
			writeSql({sql : sql,
			dataAfterSave:function(response){
				console.log(response.data)
			}
		})
		}
	})
	console.log(sqls)
}