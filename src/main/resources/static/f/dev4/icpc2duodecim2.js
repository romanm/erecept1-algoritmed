app.controller('AppCtrl', function($scope, $http, $timeout) {
	var ctrl = this
	ctrl.page_title = 'icp2duodecim-DB'
	initApp($scope, $http, ctrl, $timeout)

	readDuodecimIcpc2_002(ctrl)
	readICPC2_MCRDB3(ctrl)
	readDuodecim_name_count(ctrl)
	readDuodecim_name_list(ctrl)

	ctrl.click_icpc2_count_sort = function(k){
		ctrl.icpc2_sort = k
		readDuodecimIcpc2_002(ctrl)
	}
	ctrl.seekLogic.seek_engine = function(){
		readDuodecim_name_list(ctrl)
		readDuodecimIcpc2_002(ctrl)
	}

	ctrl.clickICPC2Duodecim = function(i2d, allSeek){
		if(ctrl.clickedI2d && ctrl.clickedI2d.ref_icpc2 == i2d.ref_icpc2){
			delete ctrl.clickedI2d
		}else{
			ctrl.clickedI2d = i2d
			if(i2d.ref_icpc2)
				readDuodecimIcpc2_add001(ctrl, i2d.ref_icpc2)
		}
		var sql = "SELECT "+i2d.protocol_id + " protocol_id "
		if(i2d.icpc2){
			sql = readAllDuodecimForIcpc2_003(ctrl, allSeek)
		}else{
			ctrl.clickedI2dList = [i2d]
		}
		console.log(i2d, sql)
		readAllICPC2ForIcpc2_Duodecim_001(ctrl, sql)
	}

})

sql_app.read_ICPC2_duodecim_all = "" +
"SELECT d1.parent protocol_id, d2.*, s0.value ebmname, s2.value icpc2, i2.value icpc2int \n" +
"FROM doc d1, doc d2, integer i2, string_u s2, string_u s0 \n" +
"WHERE d1.doc_id=d2.parent \n" +
"AND d1.reference = 352331 \n" +
"AND d1.parent=s0.string_u_id \n" +
"AND d2.reference=s2.string_u_id \n" +
"AND d2.reference=i2.integer_id \n"

sql_app.read_ICPC2_in_duodecim = function(ctrl, allSeek){ 
	var sql = sql_app.read_ICPC2_duodecim_all
	if(allSeek)
		return sql
	var icpc2GroupInSQL = fn_icpc2GroupInSQL(ctrl)
	if(icpc2GroupInSQL&&icpc2GroupInSQL.length>0){
		sql = "SELECT * FROM (" +
		sql +
		") a "+icpc2GroupInSQL
	}
	//console.log(ctrl.icpc2_sort , '\n', sql , '\n', icpc2GroupInSQL)
	return sql
}

sql_app.read_ICPC2_i18n_without_seek = function(ctrl){ 
	var sql = "" +
	"SELECT value i18n, reference icpc2_id FROM doc,string s \n" +
	"WHERE string_id=doc_id AND parent= 285597"
	return sql
}
sql_app.read_ICPC2_i18n = function(ctrl){ 
	var sql = sql_app.read_ICPC2_i18n_without_seek(ctrl)
	if(ctrl.seekLogic.seek_value){
		console.log(ctrl.seekLogic.seek_value)
		sql +=" AND LOWER(value) LIKE LOWER('%" +
		ctrl.seekLogic.seek_value +
		"%')"
	}
	return sql
}

sql_app.read_ICPC2_duodecim_all_003 = "" +
"SELECT a.*, i18n FROM ( \n" +
"SELECT d2.reference ref_icpc2, i2.value icpc2int, su2.value icpc2, pn.value protocol_name, su1.value ebmname  " +
"FROM string_u su1, doc d1 \n" +
"LEFT JOIN (SELECT * FROM doc,string WHERE doc_id=string_id and reference= 285578 ) pn " +
"ON pn.parent=d1.parent \n" +
", doc d2, string_u su2, integer i2 \n" +
"WHERE d1.reference=352331 \n" +
"AND d1.doc_id=d2.parent \n" +
"AND su2.string_u_id=d2.reference \n" +
"AND d2.reference=i2.integer_id \n" +
"AND su1.string_u_id=d1.parent \n" +
") a, (SELECT value i18n, reference icpc2_id FROM doc,string s \n" +
"WHERE string_id=doc_id AND parent= 285597) b \n" +
"WHERE b.icpc2_id=a.ref_icpc2 "

sql_app.read_ICPC2_in_duodecim_003 = function(ctrl, allSeek){ 
	var sql = sql_app.read_ICPC2_duodecim_all_003
	if(allSeek)
		return sql
	var icpc2GroupInSQL = fn_icpc2GroupInSQL(ctrl)
	if(icpc2GroupInSQL&&icpc2GroupInSQL.length>0){
		sql = "SELECT * FROM " +
		"(" + sql + ") a "+icpc2GroupInSQL
	}
	if(ctrl.seekLogic.seek_value){
		console.log(ctrl.seekLogic.seek_value)
		sql = "SELECT * FROM " +
		"(" + sql + ") a " +
		"WHERE LOWER(protocol_name||' '||i18n) LIKE LOWER('%" + ctrl.seekLogic.seek_value + "%')"
	}
	//console.log(ctrl.icpc2_sort , '\n', sql , '\n', icpc2GroupInSQL)
	return sql
}

sql_app.read_duodecimIcpc2_003 = function(ctrl, allSeek){ 
	var sql = "" +
	"SELECT icpc2, MIN(ref_icpc2) ref_icpc2, COUNT(*) count, MIN(ebmname), MAX(ebmname), MIN(i18n) i18n \n" +
	"FROM (" + sql_app.read_ICPC2_in_duodecim_003(ctrl, allSeek) + ") a " +
	"GROUP BY icpc2 "
	if(ctrl.icpc2_sort){
		if('cnt'==ctrl.icpc2_sort){
			sql += "ORDER BY count DESC"
		}
	}
	return sql
}

sql_app.read_duodecimIcpc2 = function(ctrl, allSeek){ 
	var sql = "SELECT a.*, i18n FROM ( \n" +
	"SELECT icpc2, MIN(reference) ref_icpc2, COUNT(*) count, MIN(ebmname), MAX(ebmname) " +
	"FROM ( \n" +sql_app.read_ICPC2_in_duodecim(ctrl, allSeek) +") a " +
	"GROUP BY icpc2 \n" +
	") a, (" + sql_app.read_ICPC2_i18n(ctrl) +") b \n" +
	"WHERE b.icpc2_id=a.ref_icpc2 "
	if(ctrl.icpc2_sort){
		if('cnt'==ctrl.icpc2_sort){
			sql += "ORDER BY count DESC"
		}
	}
//	console.log(sql)
	return sql
}

var readDuodecimIcpc2_add001 = function(ctrl, ref_icpc2){
	if(ctrl.icpc2duodecims.ref_icpc2[ref_icpc2])
		return
	//var sql = sql_app.read_duodecimIcpc2(ctrl, true)
	//sql += "AND a.ref_icpc2=" + ref_icpc2
	var sql = sql_app.read_duodecimIcpc2_003(ctrl, true)
	sql = "SELECT * FROM (" + sql +
	") a WHERE a.ref_icpc2 ="+ref_icpc2
	console.log(sql)
	readSql({ sql:sql, afterRead:function(r){
		console.log(r.data)
		var v = r.data.list[0]
		ctrl.icpc2duodecims.list.unshift(v)
		ctrl.icpc2duodecims.ref_icpc2[v.ref_icpc2] = v
	}})
}

var readDuodecimIcpc2_003 = function(ctrl){
	var sql = sql_app.read_duodecimIcpc2(ctrl)
	console.log(sql)
}

var readDuodecimIcpc2_002 = function(ctrl){
	var sql = sql_app.read_duodecimIcpc2_003(ctrl)
	//var sql = sql_app.read_duodecimIcpc2(ctrl)
	//console.log(sql)
	readSql({ sql:sql, afterRead:function(r){
		ctrl.icpc2duodecims = {}
		ctrl.icpc2duodecims.ref_icpc2 = {}
		ctrl.icpc2duodecims.list = r.data.list
		console.log(r.data)
		angular.forEach(ctrl.icpc2duodecims.list, function(v){
			ctrl.icpc2duodecims.ref_icpc2[v.ref_icpc2] = v
		})
	}})
}

var readAllICPC2ForIcpc2_Duodecim_001 = function(ctrl, sql){
//	console.log(sql)
	var sql2 = "" +
	"SELECT a.reference ref_icpc2, * FROM (SELECT reference, count(*), MIN(icpc2) icpc2 " +
	"FROM (SELECT * FROM (" + sql_app.read_ICPC2_duodecim_all +") a " +
	"WHERE protocol_id IN (SELECT protocol_id " +
	"FROM (" + sql + ")a)) a " +
	"GROUP BY reference " +
	")a, (" + sql_app.read_ICPC2_i18n_without_seek(ctrl) + ") b \n" +
	"WHERE a.reference=icpc2_id " +
	"ORDER BY icpc2 "
	console.log(sql2)
	readSql({ sql:sql2, afterRead:function(r){
		console.log(r.data.list)
		ctrl.clickedI2dICPC2List = r.data.list
	}})
}

sql_app.read_ICPC2_duodecim_protocol_name = "" +
"SELECT d.parent, doc_id protocol_name_id, value protocol_name \n" +
"FROM doc d, string " +
"WHERE doc_id=string_id AND reference= 285578 "

sql_app.read_ICPC2_duodecim_protocol_name002 = "" +
"SELECT a.*, b.doc_id protocol_name_id, protocol_name" +
", CASE WHEN b.doc_id IS NULL THEN 0 ELSE 1 END with_name FROM ( \n" +
"SELECT doc_id protocol_id, value ebmname " +
"FROM doc, string_u WHERE string_u_id=doc_id AND parent= 285581 \n" +
") a LEFT JOIN (SELECT d.*, value protocol_name FROM doc d,string " +
"WHERE string_id=doc_id AND reference= 285578 ) b ON b.parent=a.protocol_id \n"

var readDuodecim_name_list = function(ctrl){
	var sql = "" +
	"SELECT * FROM (" +
	sql_app.read_ICPC2_duodecim_protocol_name002 +
	") a WHERE with_name=1 \n"
	if(ctrl.seekLogic.seek_value){
		console.log(ctrl.seekLogic.seek_value)
		sql +=" AND LOWER(protocol_name) LIKE LOWER('%" +
		ctrl.seekLogic.seek_value +
		"%')"
	}
	sql +=" LIMIT 100"
//	console.log(sql)
	readSql({ sql:sql, afterRead:function(r){
//		console.log(r.data.list)
		ctrl.duodecim_name_list = r.data.list
	}})
	
}
var readDuodecim_name_count = function(ctrl){
	var sql = "" +
	"SELECT with_name, COUNT(with_name) FROM ( \n" +
	sql_app.read_ICPC2_duodecim_protocol_name002 +
	") a GROUP BY with_name "
	readSql({ sql:sql, afterRead:function(r){
		ctrl.duodecim_name_count = r.data.list
	}})
}

var readAllDuodecimForIcpc2_003 = function(ctrl, allSeek){
	var sql = "" +
	"SELECT a.*, a.reference ref_icpc2, su2.value ebmname, protocol_name, su1.value icpc2, i1.value icpc2int \n" +
	"FROM string_u su1, integer i1, string_u su2, ( \n" +
	"SELECT d1.*, d2.parent protocol_id FROM \n" +
	"doc d1 , doc d2 \n" +
	"WHERE d1.parent=d2.doc_id \n" +
	") a LEFT JOIN (SELECT d.parent, doc_id protocol_name_id, value protocol_name \n" +
	"FROM doc d, string WHERE doc_id=string_id AND reference= 285578 ) d3 ON d3.parent = a.protocol_id \n" +
	"WHERE su1.string_u_id=a.reference AND i1.integer_id=a.reference \n" +
	"AND su2.string_u_id=a.protocol_id \n" +
	"AND reference=" + ctrl.clickedI2d.ref_icpc2
	console.log(sql)
	readSql({ sql:sql, afterRead:function(r){
		console.log(r.data.list)
		ctrl.clickedI2dList = r.data.list
	}})
	return sql
}

var readAllDuodecimForIcpc2_001 = function(ctrl, allSeek){
	var sql = "SELECT a.reference ref_icpc2, a.*, protocol_name FROM (" + sql_app.read_ICPC2_in_duodecim(ctrl, allSeek) + 
	") a LEFT JOIN (" + sql_app.read_ICPC2_duodecim_protocol_name +
	") d3 ON d3.parent = a.protocol_id \n"
	if(ctrl.clickedI2d){
		sql += "WHERE a.reference = " + ctrl.clickedI2d.ref_icpc2
	}
	console.log(sql)
	readSql({ sql:sql, afterRead:function(r){
		console.log(r.data.list)
		ctrl.clickedI2dList = r.data.list
	}})
	return sql
}

