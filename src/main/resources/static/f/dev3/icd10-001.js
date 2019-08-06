app.controller('AppCtrl', function($scope, $http) {
	var ctrl = this
	ctrl.page_title = 'icp2-001'
	initApp($scope, $http, ctrl)
	readICD10_Chapter(ctrl)
})

var readICD10_Chapter = function(ctrl){
	var sql = "SELECT * FROM icd10uatree t, icd i where i.icd_id=icd10uatree_id " +
	"and icd10uatree_id=icd10uatree_parent_id"
	readSql({ sql:sql, afterRead:function(r){
		angular.forEach(r.data.list, function(v){
			console.log(v.icd_code,v.icd_name)
		})
	}})
}
