app.controller('AppCtrl', function($scope, $http) {
	var ctrl = this
	ctrl.page_title = 'icp2-001'
	ctrl.viewType='dev'
	ctrl.viewType='db'
	initApp($scope, $http, ctrl)

	$http
	.get("/f/dev3/ICPC2-ua.json")
	.then(function(r){
		ctrl.icpc2 = r.data
//		insertICPC2_CODE(ctrl)
//		insertICPC2_GROUP(ctrl)
	})
	readICPC2_MCRDB2(ctrl)
//	readICPC2_MCRDB(ctrl)
})

var convertICPC2_MCRDB = function(ctrl){
	ctrl.db_icpc2 = {}
	ctrl.db_icpc2.group={}
	console.log(ctrl.db.docRoot.children[1].children[0].children[0])
	var refEls = {}
	angular.forEach(ctrl.db.docRoot.children[1].children[0].children[0].children, function(v){
		refEls[v.reference] = v
	})
	console.log(refEls)
	angular.forEach(ctrl.db.docRoot.children[1].children[1].children[0].children, function(v){
		delete v.children_ids
		v.i18n = refEls[v.doc_id].d_s
		ctrl.db_icpc2.group[v.d_s]=v
		angular.forEach(v.children, function(v2){
			v2.i18n = refEls[v2.doc_id].d_s
		})
	})
	delete refEls
	console.log(ctrl.db_icpc2.group)
	ctrl.db_icpc2.color = ctrl.icpc2.color
	console.log(JSON.stringify(ctrl.db_icpc2).replace(/'/g,"''"))
}

var readICPC2_MCRDB2 = function(ctrl){
	var sql = "SELECT * FROM docbody where docbody_id=287135"
		readSql({ sql:sql,
			afterRead:function(response){
				ctrl.db_icpc2 = JSON.parse(response.data.list[0].docbody)
			}
		})
}

var readICPC2_MCRDB = function(ctrl){
	var sql = "SELECT * FROM docbody where docbody_id=287134"
		readSql({ sql:sql,
			afterRead:function(response){
				ctrl.db = JSON.parse(response.data.list[0].docbody)
				convertICPC2_MCRDB(ctrl)
			}
		})
}

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
