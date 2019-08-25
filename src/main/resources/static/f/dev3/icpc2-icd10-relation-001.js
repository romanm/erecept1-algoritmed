app.controller('AppCtrl', function($scope, $http, $timeout) {
	var ctrl = this
	ctrl.page_title = 'icpc2-icd10-relation-001'
	initApp($scope, $http, ctrl)
	initICPC2ICD10App(ctrl)
//	readWriteICPC2ICD10_goroch1(ctrl)
	readICPC2_MCRDB2(ctrl)
	ctrl.readICPC2_part = function(){
//		console.log(sql_app.selectICPC2ICD10_icpc2(320730))
		var icpc2GroupInSQL = fn_icpc2GroupInSQL(ctrl)
		readICPC2ICD10(ctrl, 320730, 'icpc2icd10_goroch', icpc2GroupInSQL) // goroch1
		readICPC2ICD10(ctrl, 320729, 'icpc2icd10_original', icpc2GroupInSQL) // original
		if(ctrl.icpc2_organs){
			ctrl.read_icpc2_organs()
		}
	}
	ctrl.readICPC2_part()
})

var readICPC2ICD10 = function(ctrl, parentId, oName, icpc2GroupInSQL){
//	var sql = sql_app.selectICPC2ICD10(parentId) +
	var sql = sql_app.selectICPC2ICD10_icpc2(parentId, ctrl)
//	if(ctrl.db_icpc2 && ctrl.db_icpc2.clickColor){
	if(icpc2GroupInSQL&&icpc2GroupInSQL.length>0){
//		console.log(ctrl.db_icpc2.clickColor,ctrl.db_icpc2.color[ctrl.db_icpc2.clickColor], icpc2GroupInSQL)
		sql += icpc2GroupInSQL
//		sql += "WHERE  icpc2 IN " + icpc2GroupInSQL
	}
	sql += "" +
	" ORDER BY cnt DESC" +
	" LIMIT 100"
	readSql({ sql:sql, afterRead:function(r){
		ctrl[oName] = r.data.list
//		console.log(r.data)
	}})
}

var initICPC2ICD10App = function(ctrl){

	ctrl.clickICPC2ICD10relationTable=function(e){
		if(ctrl.eICPC2ICD10relationTable && ctrl.eICPC2ICD10relationTable.doc_id == e.doc_id){
			delete ctrl.eICPC2ICD10relationTable
			delete ctrl.eICPC2ICD10relationTableICD10
			return
		}
		ctrl.eICPC2ICD10relationTable = e
		console.log(e, ctrl.elementsMap[ctrl.eICPC2ICD10relationTable.doc_id])
		var sql = "SELECT * FROM ( \n" +
		"SELECT d.reference icd10_id, su.value icd10 , s.value i18n FROM doc d,string s, string_u su \n" +
		"WHERE doc_id=string_id \n" +
		"AND reference=string_u_id \n" +
		"AND parent=287138 \n" +
		") a \n" +
		"WHERE icd10_id IN (SELECT d2.reference2 icd10_id FROM doc d1, doc d2 \n" +
		"WHERE d1.doc_id=" + e.doc_id + " \n" +
		"AND d1.reference=d2.reference \n" +
		"AND d1.parent=d2.parent) "
//		console.log(e,sql)
		readSql({ sql:sql, afterRead:function(r){
			ctrl.eICPC2ICD10relationTableICD10 = r.data.list
//		console.log(r.data)
		}})
	}

}

sql_app.selectICPC2ICD10_icpc2 = function(parentId, ctrl){ return "" +
	"SELECT * FROM ( \n" +
	"SELECT icpc2, COUNT(*) cnt, MIN(icpc2int) icpc2int, MIN(doc_id) doc_id, MIN(reference) reference, MIN(icd10) min_icd10, MAX(icd10) max_icd10 " +
	"FROM ( \n" +
	sql_app.selectICPC2ICD10(parentId, ctrl) +
	" \n) a GROUP BY icpc2 \n" +
	") a " +
	""
}

sql_app.selectICPC2_group_ICD10_count = function(parentId, ctrl){ return "" +
	"SELECT g, COUNT(g) cnt, MIN(doc_id) doc_id, MIN(reference) reference, MIN(icd10) min_icd10, MAX(icd10) max_icd10 FROM ( \n" +
	sql_app.selectICPC2_group_ICD10(parentId, ctrl) +
	" ORDER BY icd10 " +
	") a GROUP BY g " +
	" ORDER BY g "
}

sql_app.selectICPC2_group_ICD10 = function(parentId, ctrl){ return "" +
	"SELECT substring(icpc2,1,1) g, * FROM ( \n" +
	sql_app.selectICPC2ICD10(parentId, ctrl) +
	") a "
}

sql_app.selectICPC2ICD10 = function(parentId, ctrl){ 
	
	var sql ="" +
	"SELECT * FROM (" +
	"SELECT d.*, s2u.value icpc2, i2.value icpc2int, s10u.value icd10 " +
	"FROM doc d,string_u s2u, integer i2, string_u s10u \n" +
	"WHERE parent = " + parentId +" \n" +
//	"where parent=320730 \n" +
	"AND reference=s2u.string_u_id \n" +
	"AND integer_id=s2u.string_u_id \n" +
	"AND reference2=s10u.string_u_id " +
	") a "
	var icpc2GroupInSQL = fn_icpc2GroupInSQL(ctrl)
//	console.log(sql, '\n-- :) --\n', icpc2GroupInSQL)
	return sql + icpc2GroupInSQL
//	return sql
}

sql_app.selectICPC2ICD10_stop1 = function(parentId){ return "" +
	"SELECT d.*, s2u.value icpc2, i2.value icpc2int, s10u.value icd10 " +
	"FROM doc d,string_u s2u, integer i2, string_u s10u \n" +
	"WHERE parent = " + parentId +" \n" +
//	"where parent=320730 \n" +
	"AND reference=s2u.string_u_id \n" +
	"AND integer_id=s2u.string_u_id \n" +
	"AND reference2=s10u.string_u_id "
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
