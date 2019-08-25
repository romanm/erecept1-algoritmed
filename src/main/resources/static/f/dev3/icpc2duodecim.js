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
		var inIcpc2 = ctrl.listToInSQL(ctrl.embNrs[protocol])
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
	var embNrs = Object.keys(ctrl.embNrs)
	var dIcpc2 = Object.keys(ctrl.icp2duodecim)
	console.log(dIcpc2, embNrs)
	//insertembNrs(ctrl)
	insertembNrsICPC2(ctrl)
}

var insertembNrsICPC2 = function(ctrl){
	var sql = "SELECT a.*, d1.doc_id icpc2_id FROM (SELECT d.*, value embname FROM string_u, doc d " +
	"WHERE doc_id=string_u_id AND d.parent = 285581) a \n" +
	"LEFT JOIN (SELECT * FROM doc WHERE reference= 352331) d1 ON d1.parent = a.doc_id ORDER BY embname"
	console.log(sql)
	readSql({ sql:sql, afterRead:function(r){
		console.log(r.data)
		var i = 0
		angular.forEach(r.data.list, function(v){
			if(!v.icpc2_id){
				if(i<100){
					var x = ctrl.embNrs[v.embname]
					var y = ctrl.listToInSQL(x)
					console.log(v, x, y)
					var sql2 = "SELECT * FROM doc, string_u \n" +
					"WHERE reference=string_u_id AND parent= 285597 AND value IN " + 
					ctrl.listToInSQL(ctrl.embNrs[v.embname])
					var sql3 = "INSERT INTO doc (doc_id, reference, parent) " +
					"VALUES (:nextDbId1, 352331, " + v.doc_id + "); \n"
					readSql({ sql:sql2, afterRead:function(r2){
						console.log(r2.data)
						angular.forEach(r2.data.list, function(v2){
							console.log(v2)
							sql3 += "INSERT INTO doc (parent,reference) " +
							"VALUES (:nextDbId1," +
							v2.reference +
							"); \n"
						})
						console.log(sql3)
						writeSql({sql:sql3, dataAfterSave : function(r3){
							console.log(r3.data)
						}})
						
					}})
				}
				i++
			}
		})
	}})
}
var insertembNrs = function(ctrl){
	var embNrs = Object.keys(ctrl.embNrs)
	var sqlAll=""
	angular.forEach(embNrs, function(v, k){
		var nextDbId = k+1
		var sql ="INSERT INTO doc (doc_id,parent) " +
		"VALUES (:nextDbId" +
		nextDbId +
		", 285581);\n" +
		"INSERT INTO string_u (group_id, string_u_id, value) VALUES (63, :nextDbId" +
		nextDbId +
		", '" + v + "');\n"
		sqlAll +=sql
		if(k<2){
			console.log(v,k, sql)
		}
	})
	console.log(sqlAll)
	var params = {}
	params.sql = sqlAll
	params.dataAfterSave = function(response){
		console.log(response.data)
	}
	writeSql(params)
}
