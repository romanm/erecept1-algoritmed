app.controller('AppCtrl', function($scope, $http, $timeout) {
	var ctrl = this
	ctrl.page_title = 'icpc2-icd10-relation-001'
	initApp($scope, $http, ctrl)
//	readWriteICPC2ICD10_goroch1(ctrl)
	readICPC2ICD10_goroch1(ctrl)
})

var readICPC2ICD10_goroch1 = function(ctrl){
	console.log(1)
	var sql = "SELECT d.*, s2.value icpc2, s10.value icd10 FROM doc d,string s2, string s10 \n" +
	"where parent=320730 \n" +
	"and reference=s2.string_id \n" +
	"and reference2=s10.string_id " +
	"LIMIT 100"
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
	", (SELECT * FROM doc,string where string_id=reference and parent=285597) icpc2 \n" +
	", (SELECT * FROM doc,string where string_id=reference and parent=287138) icd10 \n" +
	"where icpc2.value=icpc_2 \n" +
	"and icd10.value=icd_10 "
	console.log(sql2)
	readSql({ sql:sql2, afterRead:function(r){
		console.log(r.data)
		angular.forEach(r.data.list, function(v,k){
			if(k<1){
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
