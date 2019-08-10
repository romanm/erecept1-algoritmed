app.controller('AppCtrl', function($scope, $http, $timeout) {
	var ctrl = this
	ctrl.page_title = 'icd10-001'
	initApp($scope, $http, ctrl)
	
	var _timeout;
	ctrl.seekIcd10 = function(){
		if(_timeout) $timeout.cancel(_timeout);
		_timeout = $timeout(function() {
//			console.log('filtering seek - ', ctrl.seek_icd10_key)
			var seek = "%" + ctrl.seek_icd10_key + "%"
			var sql = ("SELECT * FROM (" + sql_seek +
			") x WHERE LOWER(i18n) LIKE LOWER(:seek) " +
			"OR LOWER(code) LIKE LOWER(:seek) " +
			"ORDER BY treelevel desc, parent, sort")
			.replace(/:seek/g,"'" + seek + "'") 
//			console.log(sql)
			var sql1 = sql + " LIMIT 100"
			readSql({ sql:sql1, afterRead:function(response){
				ctrl.read_seek_icd10 = response.data.list
				console.log(ctrl.read_seek_icd10)
			}})
			_timeout = null;
		}, 1000);
	}
	var sql_seek = "SELECT d1.doc_id, d1.parent, sort, treelevel, s1.value code, s2.value i18n \n" +
	"FROM doc d1, sort, string s1, doc d2, string s2 \n" +
	"WHERE d2.parent = 287138 " +
//			"WHERE d1.parent = " + parentId + " " +
	"AND d1.doc_id=s1.string_id " +
	"AND d2.doc_id=s2.string_id " +
	"AND d1.doc_id=sort_id " +
	"AND d1.doc_id=d2.reference \n" +
	""
//	+ "ORDER BY treelevel, sort "
//	console.log(sql_seek)
	
	var rootIcd10Id = 287136
	ctrl.icd10 = {doc_id:rootIcd10Id, openChildren:true}
	ctrl.elementsMap[rootIcd10Id] = ctrl.icd10
	readICD10(ctrl, rootIcd10Id)
	ctrl.clickTree = function(v){
		ctrl.elementsMap[v.doc_id].openChildren = !ctrl.elementsMap[v.doc_id].openChildren
		console.log(v.doc_id, ctrl.elementsMap[v.doc_id])
		readICD10(ctrl, v.doc_id)
	}
//	readWriteICD10_Chapter(ctrl)
//	readWriteICD10_l4(ctrl)
//	readWriteICD10_l5(ctrl)
//	readWriteICD10_goroch1(ctrl)
//	readWriteICD10_goroch2(ctrl)
})

/*
SELECT * FROM icd b
left join (SELECT * FROM doc,string where string_id=reference and parent=287138) a on b.icd_code=a.value
where doc_id is null
order by icd_code
 * */

var parentI18nId = 287138 //UA_i18n in ICD10 DataDictionary
var readWriteICD10_goroch2 = function(ctrl){
	var sql2 = "SELECT a.*, c.sort_id, treelevel FROM ( \n" +
	"SELECT substring(icd_10,0,4) icd1, i.* FROM icpc2_icd10 i \n" +
	"left join (SELECT * FROM doc,string where string_id=reference and parent=287138) x on value=icd_10 \n" +
	"where value is null \n" +
	") a \n" +
	"left join (SELECT * FROM doc,string, sort where sort_id=reference and string_id=reference and parent=287138) c on value=icd1 \n" +
	"where sort_id is not null \n" +
	"order by icd1, icd_10"
	console.log(sql2)
	readSql({ sql:sql2, afterRead:function(r){
		console.log(r.data)
		angular.forEach(r.data.list, function(v, sort){
			if(true||1>sort){
				var sql = sql_app.insert_CODE_i18n_sort(v.sort_id, v.icd_10, parentI18nId, v.n______icd, sort, v.treelevel+1)
				console.log(sort,v, sql)
				writeSql({sql : sql, dataAfterSave:function(response){
					console.log(response.data)
				}})
			}
		})
	}})
}

var readWriteICD10_goroch1 = function(ctrl){
	var sql2 = "SELECT a.*, c.sort_id, treelevel FROM ( \n" +
	"SELECT substring(icd_10,0,4) icd1, i.* FROM icpc2_icd10 i \n" +
	"left join (SELECT * FROM doc,string where string_id=reference and parent=287138) x on value=icd_10 \n" +
	"where value is null \n" +
	") a \n" +
	"left join (SELECT * FROM icd) b on icd_code=icd_10 \n" +
	"left join (SELECT * FROM doc,string, sort where sort_id=reference and string_id=reference and parent=287138) c on value=icd1 \n" +
	"where icd_id is not null \n" +
	"order by icd1, icd_10"
	console.log(sql2)
	readSql({ sql:sql2, afterRead:function(r){
		console.log(r.data)
		angular.forEach(r.data.list, function(v, sort){
			if(true||1>sort){
				var sql = sql_app.insert_CODE_i18n_sort(v.sort_id, v.icd_10, parentI18nId, v.n______icd, sort, v.treelevel+1)
				console.log(sort,v, sql)
				writeSql({sql : sql, dataAfterSave:function(response){
					console.log(response.data)
				}})
			}
		})
	}})

}
var readWriteICD10_l5 = function(ctrl){
	var sl = "SELECT s.*, icd_id p_id, t.* FROM doc, sort t,string s, icd " +
	"WHERE doc_id=string_id AND value=icd_code and doc_id=sort_id and treelevel=4"
	var sql2 = "SELECT i.*, l.string_id parentId FROM icd10uatree t, icd i \n" +
	", (" +
	sl +
	") l \n" +
	"WHERE i.icd_id=icd10uatree_id AND icd10uatree_id!=icd10uatree_parent_id AND icd10uatree_parent_id = p_id \n" +
	"ORDER BY icd_id"
	console.log(sql2)
	
}
var readWriteICD10_l4 = function(ctrl){
	var sl = "SELECT s.*, icd_id p_id, t.* FROM doc, sort t,string s, icd " +
	"WHERE doc_id=string_id AND value=icd_code and doc_id=sort_id and treelevel=3"
	var sql2 = "SELECT i.*, l.string_id parentId FROM icd10uatree t, icd i \n" +
	", (" +
	sl +
	") l \n" +
	"WHERE i.icd_id=icd10uatree_id AND icd10uatree_id!=icd10uatree_parent_id AND icd10uatree_parent_id = p_id \n" +
	"ORDER BY icd_id"
	console.log(sql2)
	readSql({ sql:sql2, afterRead:function(r){
		angular.forEach(r.data.list, function(v, sort){
			if(true||1>sort){
				console.log(v)
				console.log(sort, v.parentid , v.icd_code,v.icd_name)
				var sql = sql_app.insert_CODE_i18n_sort(v.parentid, v.icd_code, parentI18nId, v.icd_name, sort, 4)
				writeSql({sql : sql, dataAfterSave:function(response){
					console.log(response.data)
				}})
			}
		})
	}})
}

var readWriteICD10_l3 = function(ctrl){
	var sl = "SELECT s.*, icd_id p_id, t.* FROM doc, sort t,string s, icd " +
	"WHERE doc_id=string_id AND value=icd_code and doc_id=sort_id and treelevel=2"
	var sql2 = "SELECT i.*, l.string_id parentId FROM icd10uatree t, icd i \n" +
	", (" +
	sl +
	") l \n" +
	"WHERE i.icd_id=icd10uatree_id AND icd10uatree_id!=icd10uatree_parent_id AND icd10uatree_parent_id = p_id \n" +
	"ORDER BY icd_id"
	console.log(sql2)
	readSql({ sql:sql2, afterRead:function(r){
		angular.forEach(r.data.list, function(v, sort){
			if(true||1>sort){
				console.log(v)
				console.log(sort, v.parentid , v.icd_code,v.icd_name)
				var sql = sql_app.insert_CODE_i18n_sort( v.parentid , v.icd_code, parentI18nId, v.icd_name, sort, 3)
				writeSql({sql : sql, dataAfterSave:function(response){
					console.log(response.data)
				}})
			}
		})
	}})
}
var readWriteICD10_l2 = function(ctrl){
	var sl = "SELECT s.*, icd_id p_id FROM doc,string s, icd WHERE doc_id=string_id AND parent = 287136 AND value=icd_code"
	var sql2 = "SELECT i.*, l.string_id parentId FROM icd10uatree t, icd i \n" +
	", (" +
	sl +
	") l \n" +
	"WHERE i.icd_id=icd10uatree_id AND icd10uatree_id!=icd10uatree_parent_id AND icd10uatree_parent_id = p_id \n" +
	"ORDER BY icd_id"
	console.log(sql2)
	if(false)
	readSql({ sql:sql2, afterRead:function(r){
		angular.forEach(r.data.list, function(v, sort){
			if(false||2>sort){
				console.log(v)
				console.log(sort, v.parentid , v.icd_code,v.icd_name)
				var sql = sql_app.insert_CODE_i18n_sort( v.parentid , v.icd_code, parentI18nId, v.icd_name, sort, 2)
				writeSql({sql : sql, dataAfterSave:function(response){
					console.log(response.data)
				}})
			}
		})
	}})
	
}
var readICD10 = function(ctrl, parentId) {
	var sql = "SELECT d1.doc_id, d1.parent, sort, treelevel, s1.value code, s2.value i18n \n" +
	"FROM doc d1, sort, string s1, doc d2, string s2 \n" +
//	"WHERE d2.parent = 287138 " +
	"WHERE d1.parent = " + parentId + " " +
	"AND d1.doc_id=s1.string_id " +
	"AND d2.doc_id=s2.string_id " +
	"AND d1.doc_id=sort_id " +
	"AND d1.doc_id=d2.reference \n" +
	"ORDER BY treelevel, sort "
//console.log(sql, ctrl.elementsMap[parentId])
	readSql({ sql:sql, afterRead:function(r){
		ctrl.elementsMap[parentId].children = r.data.list
		angular.forEach(r.data.list, function(v){
			ctrl.elementsMap[v.doc_id] = v
		})
	}})
}

var readWriteICD10_Chapter = function(ctrl){
	var sql1 = "SELECT * FROM icd10uatree t, icd i where i.icd_id=icd10uatree_id " +
	"and icd10uatree_id=icd10uatree_parent_id"
	console.log(sql1)
	readSql({ sql:sql1, afterRead:function(r){
		angular.forEach(r.data.list, function(v, sort){
			if(true||2>sort){
				console.log(sort, v.icd_code,v.icd_name)
				var sql = sql_app.insert_CODE_i18n_sort( 287136 , v.icd_code, parentI18nId, v.icd_name, sort, 1)
				console.log(sql)
				writeSql({sql : sql, dataAfterSave:function(response){
					console.log(response.data)
				}})
			}
		})
	}})
}

