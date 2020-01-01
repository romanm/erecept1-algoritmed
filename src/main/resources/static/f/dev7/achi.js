var app = angular.module('myApp', ['ngSanitize']);
app.controller('AppCtrl', function($scope, $http, $timeout) {
	var ctrl = this
	ctrl.page_title = 'ACHI'
	ctrl.page_title = 'АКМІ'
	initApp($scope, $http, ctrl, $timeout)
	initAchi(ctrl)
	console.log('--',ctrl.page_title,'--')
//	read2(ctrl)
	read_dataObject(ctrl, 'seek_achi', sql_app.seek_achi(ctrl)) 
	read_dataObject(ctrl, 'seek_achi_cnt', sql_app.seek_achi_cnt(ctrl)) 
	read_dataObject(ctrl, 'l0', sql_app.l0_sql + " ORDER BY class_nr")
	read_dataObject(ctrl, 'l1', sql_app.l1_sql, 122, true)
})

function initAchi(ctrl) {
	ctrl.achi_seek_head = {
		n9:{n:'Код', style:{'width':'100px'}},
		n10:{n:'ACHI'},
	}
	ctrl.l2_head = {
		cnt:{n:'∑', style:{'width':'35px'}},
		n5:{n:'№', style:{'width':'25px'}},
		n6:{n:'Вісь процедурної типології'},
	}
	ctrl.l1_head = {
		cnt:{n:'∑', style:{'width':'35px'}},
		l0:{n:'№', style:{'width':'55px'}},
		n3:{n:'№', style:{'width':'25px'}},
		n4:{n:'Вісь анатомічної локалізації'},
	}
	ctrl.l0_head = {
		cnt:{n:'∑', style:{'width':'35px'}},
		class_nr:{n:'№', style:{'width':'55px'}},
		n2:{n:'Клас'},
	}

	ctrl.seek_clean = function(){
		ctrl.seekLogic.seek_value = null
		read_dataObject(ctrl, 'seek_achi', sql_app.seek_sql) 
		read_dataObject(ctrl, 'l1', sql_app.l1_sql, 122, true)
	}
	ctrl.seekLogic.seek_engine = function(){
		//var sql_seek_achi = sql_app.seek_sql 
		var sql_seek_achi = "" +
			"SELECT * FROM (" + sql_app.seek_achi(ctrl) + ") a " +
			" WHERE LOWER(n10) LIKE LOWER('%" + ctrl.seekLogic.seek_value + "%')"
//		console.log(ctrl.seekLogic.seek_value, sql_seek_achi, sql_app.l1_sql)
		console.log(sql_seek_achi)
		read_dataObject(ctrl, 'seek_achi', sql_seek_achi)
		var sql_l1 = "SELECT * FROM (" +
		sql_app.l1_sql +
				")a  WHERE LOWER(n4) LIKE LOWER('%" +
				ctrl.seekLogic.seek_value +
				"%')"
		read_dataObject(ctrl, 'l1', sql_l1, 122, true)
	}
	console.log(sql_app.l1_sql)
	initl0(ctrl)
	initl1(ctrl)
}

sql_app.seek_achi	= function(ctrl){
	var sql = sql_app.seek_sql
	if(ctrl.l1_fn.filters.l1){
		sql += " WHERE l1_id = " + ctrl.l1_fn.filters.l1.l1_id
	}else
	if(ctrl.l0_fn.filters.l0){
		sql += " WHERE l0_id = " + ctrl.l0_fn.filters.l0.l0_id
	}
	return sql
}

sql_app.seek_achi_cnt	= function(ctrl){
	var sql = sql_app.seek_sql
	if(ctrl.l1_fn.filters.l1){
		sql += " WHERE l1_id = " + ctrl.l1_fn.filters.l1.l1_id
	}else
	if(ctrl.l0_fn.filters.l0){
		sql += " WHERE l0_id = " + ctrl.l0_fn.filters.l0.l0_id
	}
	sql = "SELECT count(*) FROM (" +sql +") a"
	return sql
}

sql_app.seek_sql	= "" +
	"SELECT * FROM achi_ukr_eng2_3"
sql_app.l0_sql		= "" +
	"SELECT l0_id, COUNT(*) cnt, MIN(class_nr) class_nr, MIN(n1) l0s, MIN(n2) n2 " +
	"FROM achi_ukr_eng2_3 " +
	"GROUP BY l0_id"
sql_app.l1_sql			= "" +
	"SELECT COUNT(*) cnt, n3, class_nr, MIN(n1) l0s, MIN(l1_id) l1_id, MIN(n4) n4, MIN(l0_id) l0_id " +
	"FROM achi_ukr_eng2_3 " +
	"GROUP BY n3, class_nr " +
	"ORDER BY n3, class_nr"

function initl1(ctrl) {
	ctrl.l1_fn = {}
	ctrl.l1_fn.filters = {}
	ctrl.l1_fn.click_row = function(l1){
		if(ctrl.l1_fn.filters.l1 && l1.l1_id == ctrl.l1_fn.filters.l1.l1_id){
			ctrl.l1_fn.remove_filter('l1')
			return
		}
		ctrl.l1_fn.filters.l1 = l1
		console.log(ctrl.l1_fn, l1)
// seek ACHI with filter
		read_dataObject(ctrl, 'seek_achi', sql_app.seek_achi(ctrl)) 
		read_dataObject(ctrl, 'seek_achi_cnt', sql_app.seek_achi_cnt(ctrl))
	}
	ctrl.l1_fn.remove_filter = function(v){
		delete ctrl[v+'_fn'].filters[v]
		read_dataObject(ctrl, 'seek_achi', sql_app.seek_achi(ctrl)) 
		read_dataObject(ctrl, 'seek_achi_cnt', sql_app.seek_achi_cnt(ctrl))
//		read_dataObject(ctrl, 'seek_achi', sql_seek_achi)
//		read_dataObject(ctrl, 'l1', sql_app.l1_sql)
	}
}

function initl0(ctrl) {
	ctrl.l0_fn = {}
	ctrl.l0_fn.filters = {}

	ctrl.l0_fn.click_head = function(h){
		if(!ctrl.l0_order.includes(h)){
			ctrl.l0_order = h
		}else{
			if(!ctrl.l0_order.includes('DESC')){
				ctrl.l0_order += ' DESC'
			}else{
				ctrl.l0_order = h
			}
		}
		var sql = "SELECT * FROM (" + sql_app.l0_sql + ") a ORDER BY "+ctrl.l0_order
//	console.log(h, ctrl.l0_order.includes(h), sql)
		read_dataObject(ctrl, 'l0', sql) 
	}

	ctrl.l0_fn.remove_filter = function(v){
		delete ctrl[v+'_fn'].filters[v]
		delete ctrl.l1_fn.filters.l1
		read_dataObject(ctrl, 'l1', sql_app.l1_sql)
		read_dataObject(ctrl, 'seek_achi', sql_app.seek_achi(ctrl)) 
		read_dataObject(ctrl, 'seek_achi_cnt', sql_app.seek_achi_cnt(ctrl))
	}

	ctrl.l0_fn.click_row = function(l0){
		delete ctrl.l1_fn.filters.l1
		if(ctrl.l0_fn.filters.l0 && l0.l0_id == ctrl.l0_fn.filters.l0.l0_id){
			ctrl.l0_fn.remove_filter('l0')
			return
		}
		ctrl.l0_fn.filters.l0 = l0
		console.log(ctrl.l0_fn, l0)
// seek ACHI with filter
		read_dataObject(ctrl, 'seek_achi', sql_app.seek_achi(ctrl)) 
		read_dataObject(ctrl, 'seek_achi_cnt', sql_app.seek_achi_cnt(ctrl))
		console.log('l1\n', sql_app.l1_sql)
		var sql_l1 = "" +
		"SELECT * FROM (" + sql_app.l1_sql + ")a WHERE l0_id="+l0.l0_id
		read_dataObject(ctrl, 'l1', sql_l1)
	}

	ctrl.l0_order = ""
}


var sql_read1 = "SELECT * FROM (" +
"SELECT l0_id , COUNT(*) cnt, MIN(n1) l0 FROM achi_ukr_eng2_3 " +
"WHERE l0_id IS NOT NULL GROUP BY l0_id ) a " +
"WHERE cnt=1"

var sql_read2 = "SELECT * FROM (SELECT l1_id , COUNT(*) cnt, MIN(n4) l1, min(l0_id) l0_id " +
	" FROM achi_ukr_eng2_3 WHERE l1_id IS NOT NULL GROUP BY l1_id ) a " +
	" WHERE cnt=1 "
//console.log(sql_read2)

function write2_1(ctrl,v){
	v.l1_1 = v.l1.replace(/'/g,"''")
	console.log(v)
	v.sql = "UPDATE achi_ukr_eng2_3 SET l1_id=:l1_id WHERE n4=:l1_1"
	v.dataAfterSave = function(response){
		console.log(response.data, v.sql)
	}
	writeSql(v)
}

function read2(ctrl) {
	readSql({sql: sql_read2, afterRead:function(response){
		ctrl.r1 = response.data.list
		console.log(ctrl.r1)
		angular.forEach(ctrl.r1, function(v,k){ if(k<20){
			console.log(k,v)
			v.k=k
			write2_1(ctrl,v)
		}})
	}})
}

function read1(ctrl) {
	readSql({
		sql: sql_read1,
		afterRead:function(response){
			ctrl.r1 = response.data.list
			console.log(ctrl.r1)
			angular.forEach(ctrl.r1, function(v,k){
				if(k==0){
					console.log(k,v)
					v.k=k
					read1_2(ctrl,v)
				}
			})
		}
	})
}

function read1_2(ctrl,v){
	console.log(v)
	v.sql = "UPDATE achi_ukr_eng2_3 SET l0_id=:l0_id WHERE l0=:l0"
	v.dataAfterSave = function(response){
		console.log(response.data, v.sql)
	}
	writeSql(v)
}

function read_dataObject(ctrl, dataObjectName, sql, limit, printObject) {
	if(!limit) limit = 100
	sql += " LIMIT "+limit
	readSql({sql:sql, afterRead:function(response){
		ctrl[dataObjectName] = response.data.list
		if(printObject)
			console.log(dataObjectName,'\n',ctrl[dataObjectName], sql)
	}})
}
