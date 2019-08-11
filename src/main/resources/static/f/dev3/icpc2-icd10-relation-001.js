app.controller('AppCtrl', function($scope, $http, $timeout) {
	var ctrl = this
	ctrl.page_title = 'icpc2-icd10-relation-001'
	initApp($scope, $http, ctrl)
//	readWriteICPC2ICD10_goroch1(ctrl)
	readICPC2ICD10(ctrl, 320730) // goroch1
})

sql_app.selectICPC2ICD10_icpc2 = function(parentId){
	return "SELECT * FROM ( \n" +
	"SELECT icpc2, count(*) cnt, min(icd10) min_icd10, max(icd10) max_icd10 FROM ( \n" +
	sql_app.selectICPC2ICD10(parentId) +
	") a group by icpc2 \n" +
	") a order by cnt desc" +
	""
}

sql_app.selectICPC2ICD10 = function(parentId){
	return "SELECT d.*, s2u.value icpc2, s10u.value icd10 FROM doc d,string_u s2u, string_u s10u \n" +
	"where parent = " +
	parentId +
	" \n" +
//	"where parent=320730 \n" +
	"and reference=s2u.string_u_id \n" +
	"and reference2=s10u.string_u_id "
}

var readICPC2ICD10 = function(ctrl, parentId){
	console.log(1)
//	var sql = sql_app.selectICPC2ICD10(parentId) +
	var sql = sql_app.selectICPC2ICD10_icpc2(parentId) +
	" LIMIT 100"
	console.log(sql)
	readSql({ sql:sql, afterRead:function(r){
		ctrl.icpc2icd10_goroch = r.data.list
		console.log(r.data)
	}})
}

var parentId_original =  320729 
var parentId_goroch =  320730
var readWriteICPC2ICD10_goroch1 = function(ctrl){
	var sql2 = "SELECT ii.*, icpc2.reference icpc2_id, icd10.reference icd10_id FROM icpc2_icd10 ii \n" +
	", (" + sql_app.select_icpc2_i18n() + ") icpc2 \n" +
	", (SELECT * FROM doc,string where string_id=reference and parent=287138) icd10 \n" +
	"where icpc2.value=icpc_2 \n" +
	"and icd10.value=icd_10 "
	console.log(sql2)
	if(false)
	readSql({ sql:sql2, afterRead:function(r){
		console.log(r.data)
		angular.forEach(r.data.list, function(v,k){
			if(true||k<1){
				var sql = "INSERT INTO doc (parent,reference,reference2) VALUES (320730," +
						v.icpc2_id +
						"," +
						v.icd10_id +
						")"
				console.log(k,v,sql)
				writeSql({sql : sql,
				dataAfterSave:function(response){
					console.log(k)
				}
			})
			}
		})
	}})

}
