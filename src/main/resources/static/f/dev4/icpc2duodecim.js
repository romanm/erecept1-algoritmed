app.controller('AppCtrl', function($scope, $http) {
	var ctrl = this
	ctrl.page_title = 'icp2duodecim-DB'
	initApp($scope, $http, ctrl)
	readDuodecimIcpc2_001(ctrl)
	ctrl.click_icpc2_count_sort = function(k){
		ctrl.icpc2_sort = k
		readDuodecimIcpc2_002(ctrl)
	}
	ctrl.readICPC2_part = function(){
		console.log(123)
		readDuodecimIcpc2_002(ctrl)
	}
	readICPC2_MCRDB3(ctrl)
})

sql_app.read_ICPC2_i18n = function(){ return "" +
	"SELECT value i18n, reference icpc2_id FROM doc,string s where string_id=doc_id and parent= 285597"
}

sql_app.read_ICPC2_in_duodecim = function(ctrl){ 
	var sql = "" +
	"SELECT d1.doc_id protocol_id, d2.*, s0.value embname, s2.value icpc2 FROM doc d1, doc d2, string_u s2, string_u s0 \n" +
	"WHERE d1.doc_id=d2.parent \n" +
	"AND d1.reference = 352331 \n" +
	"AND d1.parent=s0.string_u_id \n" +
	"AND d2.reference=s2.string_u_id \n"
	var icpc2GroupInSQL = fn_icpc2GroupInSQL(ctrl)
	if(icpc2GroupInSQL&&icpc2GroupInSQL.length>0){
		sql = "SELECT * FROM (" +
		sql +
		") a "+icpc2GroupInSQL
	}
	console.log(ctrl.icpc2_sort
			, '\n', sql
			, '\n', icpc2GroupInSQL
	)
	return sql
}

sql_app.read_duodecimIcpc2 = function(ctrl){ 
	var sql = "SELECT a.*, i18n FROM ( \n" +
	"SELECT icpc2, MIN(reference) ref_icpc2, COUNT(*) count, MIN(embname), MAX(embname) FROM ( \n" +
	sql_app.read_ICPC2_in_duodecim(ctrl) +
	") a GROUP BY icpc2 \n" +
	") a, (" + sql_app.read_ICPC2_i18n() +") b \n" +
	"WHERE b.icpc2_id=a.ref_icpc2 "
	if(ctrl.icpc2_sort){
		if('cnt'==ctrl.icpc2_sort){
			sql += "ORDER BY count DESC"
		}
	}
	return sql
}

var readDuodecimIcpc2_002 = function(ctrl){
	var sql = sql_app.read_duodecimIcpc2(ctrl)
	readSql({ sql:sql, afterRead:function(r){
		ctrl.icpc2duodecims = r.data.list
		console.log(r.data)
	}})
}
var readDuodecimIcpc2_001 = function(ctrl){
	readDuodecimIcpc2_002(ctrl)
	ctrl.clickICPC2Duodecim = function(i2d){
		console.log(i2d)
		if(ctrl.clickedI2d && ctrl.clickedI2d.ref_icpc2 == i2d.ref_icpc2){
			delete ctrl.clickedI2d
		}else{
			ctrl.clickedI2d = i2d
			readAllDuodecimForIcpc2_001(ctrl)
		}
	}
}

var readAllDuodecimForIcpc2_001 = function(ctrl){
	var sql = "SELECT * FROM (" + sql_app.read_ICPC2_in_duodecim(ctrl) +
	") a \n" +
	"WHERE reference = " + ctrl.clickedI2d.ref_icpc2
	console.log(sql)
	readSql({ sql:sql, afterRead:function(r){
		console.log(r.data.list)
		ctrl.clickedI2dList = r.data.list
	}})
}
