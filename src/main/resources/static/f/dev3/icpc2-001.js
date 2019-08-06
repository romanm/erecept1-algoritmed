app.controller('AppCtrl', function($scope, $http) {
	var ctrl = this
	ctrl.page_title = 'icp2-001'
	initApp($scope, $http, ctrl)

	$http
	.get("/f/dev3/ICPC2-ua.json")
	.then(function(r){
		ctrl.icpc2 = r.data
//		insertICPC2_CODE(ctrl)
//		insertICPC2_GROUP(ctrl)
	})
})

var insertICPC2_CODE2 = function(ctrl, g){
	console.log(ctrl.icpc2Group[g], ctrl.icpc2.group[g])
	var parentId = ctrl.icpc2Group[g].doc_id
	angular.forEach(ctrl.icpc2.group[g].subgroup, function(v,k){
		if(true||'A01'==k){
			var sql = sql_app.insert_ICPC2(parentId, k, v)
			console.log(parentId, sql)
			writeSql({sql : sql,
				dataAfterSave:function(response){
					console.log(response.data)
				}
			})
		}
	})
}

var insertICPC2_CODE = function(ctrl){
	var sql ="SELECT * FROM doc " +
	"LEFT JOIN string ON string_id=doc_id " +
	"WHERE parent=285598 "
	readSql({ sql:sql,
		afterRead:function(response){
			ctrl.icpc2Group = {}
			angular.forEach(response.data.list, function(v,k){
				ctrl.icpc2Group[v.value] = v
				if(true||'A'==v.value){
					insertICPC2_CODE2(ctrl, v.value)
				}
			})
		}
	})
}

sql_app.insert_ICPC2 = function(parentId, k, name){
	return "" +
	"INSERT INTO doc (doc_id,parent,doctype) " +
	"VALUES (:nextDbId1, " + parentId + ", 18);\n" +
	"INSERT INTO string (string_id, value) VALUES (:nextDbId1, '" + k + "');\n" +
	"INSERT INTO doc (doc_id,parent,doctype,reference) " +
	"VALUES (:nextDbId2, 285597, 18, :nextDbId1 );\n" +
	"INSERT INTO string (string_id, value) VALUES (:nextDbId2, '" + name.replace(/'/g,"''") + "');" +
	""
}

var insertICPC2_GROUP = function(ctrl){
//	console.log(ctrl.icpc2.group)
	var sqls = ""
	angular.forEach(ctrl.icpc2.group, function(v,k){
		var sql = sql_app.insert_ICPC2(285598, k, v.name)
		if(true||'A'==k){
			console.log(k,v)
			console.log(sql)
			writeSql({sql : sql,
			dataAfterSave:function(response){
				console.log(response.data)
			}
		})
		}
	})
	console.log(sqls)
}
