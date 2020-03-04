app.controller('AppCtrl', function($scope, $http, $timeout) {
	ctrl = this
	ctrl.page_title = 'ACHI'
	ctrl.page_title = 'АКМІ'
	initApp($scope, $http, $timeout)
	initAchi()
	console.log('--',ctrl.page_title,'--')
	read_dataObject('seek_achi', sql_app.seek_achi()) 
	read_dataObject('seek_achi_cnt', sql_app.seek_achi_cnt()) 
	read_dataObject('l0', sql_app.l0_sql + " ORDER BY class_nr")
	read_dataObject('l1', sql_app.l1_sql(), 122)
	read_dataObject('l2', sql_app.l2_sql())
	read_dataObject('l3', sql_app.l3_sql(), 1500, true)
//	read_l3(ctrl)
})


function initAchi() {
	ctrl.achi_seek_head = {
		n9:{n:'Код', style:{'width':'100px'}},
		n10:{n:'ACHI'},
	}
	ctrl.l3_head = {
		cnt:{n:'∑', style:{'width':'25px'}},
		n7:{n:'№', style:{'width':'35px'}},
		n8:{n:'Вісь блоків'},
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
		read_dataObject('seek_achi', sql_app.seek_sql) 
		read_dataObject('l1', sql_app.l1_sql(), 122 )
	}
	ctrl.seekLogic.seek_engine = function(){
		//var sql_seek_achi = sql_app.seek_sql 
		var sql_seek_achi = "" +
			"SELECT * FROM (" + sql_app.seek_achi(ctrl) + ") a " +
			" WHERE LOWER(n10) LIKE LOWER('%" + ctrl.seekLogic.seek_value + "%')" +
			" OR LOWER(n9) LIKE LOWER('%" + ctrl.seekLogic.seek_value + "%')" +
					""
		console.log(sql_seek_achi)
		read_dataObject('seek_achi', sql_seek_achi)
		var sql_l1 = "SELECT * FROM (" + sql_app.l1_sql() +
				")a WHERE LOWER(n4) LIKE LOWER('%" + ctrl.seekLogic.seek_value + "%')"
		read_dataObject('l1', sql_l1, 122, true)
		read_dataObject('l2', sql_app.l2_sql(ctrl.seekLogic.seek_value))
	}
	init_l0()
	init_l1()
	init_l2()
	init_l3()
}

sql_app.seek_achi	= function(){
	var sql = sql_app.seek_sql
	var sql1 = ""
	if(ctrl.l1_fn.filters.l1){
		sql1 = " WHERE l1_id = " + ctrl.l1_fn.filters.l1.l1_id
	}else
	if(ctrl.l0_fn.filters.l0){
		sql1 = " WHERE l0_id = " + ctrl.l0_fn.filters.l0.l0_id
	}
	if(ctrl.l2_fn.filters.l2){
		sql1 += sql1.includes("WHERE")?" AND ":" WHERE"
		sql1 += " l2_id = " + ctrl.l2_fn.filters.l2.l2_id
	}
	sql += sql1
	console.log(sql1, '\n', sql)
	return sql
}

sql_app.seek_achi_cnt	= function(){
	var sql = "SELECT count(*) FROM (" + sql_app.seek_achi() +") a"
	return sql
}

sql_app.seek_sql	= "" +
	"SELECT * FROM achi_ukr_eng2_3"
sql_app.l0_sql		= "" +
	"SELECT l0_id, COUNT(*) cnt, MIN(class_nr) class_nr, MIN(n1) l0s, MIN(n2) n2 " +
	"FROM achi_ukr_eng2_3 " +
	"GROUP BY l0_id "

sql_app.l1_sql			= function(seek_value) {
	var sql1 = sql_app.seek_sql
	if(ctrl.l2_fn.filters.l2){
		sql1 += sql1.includes("WHERE")?" AND ":" WHERE"
		sql1 += " l2_id = " + ctrl.l2_fn.filters.l2.l2_id
	}
	var sql ="" +
	"SELECT COUNT(*) cnt, n3, class_nr, MIN(n1) l0s, MIN(l1_id) l1_id, MIN(n4) n4, MIN(l0_id) l0_id " +
	"FROM (" + sql1 + ") a " +
	"GROUP BY n3, class_nr " +
	"ORDER BY n3, class_nr"
	//console.log(sql)

	
	return sql
}

sql_app.l3_sql			= function(seek_value){
	var sql = "" +
	"SELECT COUNT(*) cnt, l3_id, MIN(n7) n7, MIN(n8) n8 FROM " +
	"(SELECT * FROM achi_ukr_eng2_3 WHERE l3_id IS NOT NULL) a " +
	" GROUP BY l3_id " +
	" ORDER BY n7 "
	return sql
}

sql_app.l2_sql			= function(seek_value){
	var sql1 = sql_app.seek_sql
	if(ctrl.l1_fn.filters.l1){
		sql1 += " WHERE l1_id = " + ctrl.l1_fn.filters.l1.l1_id
	}else
	if(ctrl.l0_fn.filters.l0){
		sql1 += " WHERE l0_id = " + ctrl.l0_fn.filters.l0.l0_id
	}
	var sql = "" +
	"SELECT * FROM (" +
	"SELECT *, CASE WHEN n5=0 THEN 100 ELSE n5 END n5s " +
	"FROM (" +
	"SELECT COUNT(*) cnt, l2_id, MIN(n5) n5, MIN(n6) n6 " +
	"FROM (" + sql1 + ") a " +
	"WHERE l2_id IS NOT NULL GROUP BY l2_id" +
	") a" +
	") a " 
	if(seek_value){
		sql += " WHERE LOWER(n6) LIKE LOWER('%" + seek_value + "%')"
	}
	sql +="ORDER BY n5s"
	return sql
}

function init_l3() {
	ctrl.l3_order = ""
	ctrl.l3_click_head = function(h){
		if(!ctrl.l3_order.includes(h)){
			ctrl.l3_order = h
		}else{
			if(!ctrl.l3_order.includes('DESC')){
				ctrl.l3_order += ' DESC'
			}else{
				ctrl.l3_order = h
			}
		}
		var sql = "SELECT * FROM (" + sql_app.l3_sql() + ") a ORDER BY "+ctrl.l3_order
//		console.log(h, ctrl.l0_order.includes(h), sql)
		console.log(ctrl.l3_order)
		read_dataObject('l3', sql) 
	}

}

function init_l2() {
	ctrl.l2_fn = {}
	ctrl.l2_fn.filters = {}
	ctrl.l2_fn.remove_filter = function(){
		console.log(ctrl.l2_fn.filters.l2)
		delete ctrl.l2_fn.filters.l2
		read_dataObject('seek_achi', sql_app.seek_achi()) 
		read_dataObject('seek_achi_cnt', sql_app.seek_achi_cnt())
	}
	ctrl.l2_fn.click_row = function(v){
		if(ctrl.l2_fn.filters.l2 && v.l2_id == ctrl.l2_fn.filters.l2.l2_id){
			ctrl.l2_fn.remove_filter('l2')
			return
		}
		ctrl.l2_fn.filters.l2 = v
		console.log(ctrl.l2_fn.filters)
		read_dataObject('seek_achi', sql_app.seek_achi()) 
		read_dataObject('seek_achi_cnt', sql_app.seek_achi_cnt())
		read_dataObject('l1', sql_app.l1_sql(), 122)
	}
}
function init_l1() {
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
		read_dataObject('seek_achi', sql_app.seek_achi()) 
		read_dataObject('seek_achi_cnt', sql_app.seek_achi_cnt())
		read_dataObject('l2', sql_app.l2_sql(), 122)
	}
	ctrl.l1_fn.remove_filter = function(v){
		delete ctrl[v+'_fn'].filters[v]
		read_dataObject('seek_achi', sql_app.seek_achi()) 
		read_dataObject('seek_achi_cnt', sql_app.seek_achi_cnt())
		read_dataObject('l2', sql_app.l2_sql(), 122)
	}
}

function init_l0() {
	ctrl.l0_fn = {}
	ctrl.l0_fn.filters = {}

	ctrl.l0_click_head = function(h){
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
		console.log(ctrl.l3_order)
		read_dataObject('l0', sql) 
	}

	ctrl.l0_fn.remove_filter = function(v){
		delete ctrl[v+'_fn'].filters[v]
		delete ctrl.l1_fn.filters.l1
		read_dataObject('l1', sql_app.l1_sql())
		read_dataObject('seek_achi', sql_app.seek_achi()) 
		read_dataObject('seek_achi_cnt', sql_app.seek_achi_cnt())
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
		read_dataObject('seek_achi', sql_app.seek_achi()) 
		read_dataObject('seek_achi_cnt', sql_app.seek_achi_cnt())
		console.log('l1\n', sql_app.l1_sql())
		var sql_l1 = "" +
		"SELECT * FROM (" + sql_app.l1_sql() + ")a WHERE l0_id="+l0.l0_id
		read_dataObject('l1', sql_l1)
	}

	ctrl.l0_order = ""
}


var sql_read1 = "SELECT * FROM (" +
"SELECT l0_id , COUNT(*) cnt, MIN(n1) l0 FROM achi_ukr_eng2_3 " +
"WHERE l0_id IS NOT NULL GROUP BY l0_id ) a " +
"WHERE cnt=1"

var sql_read2 = "SELECT * FROM (SELECT l1_id, COUNT(*) cnt, MIN(n4) l1, MIN(l0_id) l0_id " +
	" FROM achi_ukr_eng2_3 WHERE l1_id IS NOT NULL GROUP BY l1_id ) a " +
	" WHERE cnt=1 "
//console.log(sql_read2)

var sql_read_l2 = "" +
	"SELECT * FROM (" +
	"SELECT COUNT(*) cnt, l2_id, MIN(n6) n6 " +
	"FROM achi_ukr_eng2_3 " +
	"WHERE l2_id IS NOT NULL GROUP BY l2_id" +
	") a WHERE cnt=1"

function read_l3(ctrl) {
	var sql = "SELECT * FROM (" +
	"SELECT COUNT(*) cnt, l3_id, MIN(n7) n7, MIN(n8) n8 " +
	"FROM (SELECT * FROM achi_ukr_eng2_3 WHERE l3_id IS NOT NULL " +
	"AND l3_id NOT IN ( " +
	"SELECT l3_id FROM ( " +
	"SELECT count(*) cnt, n7, min(l3_id) l3_id FROM achi_ukr_eng2_3 " +
	"group by n7 " +
	") a where cnt=1" +
	") ) a " +
	"GROUP BY l3_id  ORDER BY n7  LIMIT 1500 " +
	")a where cnt=1"
	console.log(sql)
	readSql({sql: sql, afterRead:function(response){
		ctrl.r1 = response.data.list
		console.log(ctrl.r1)
		angular.forEach(ctrl.r1, function(v,k){ if(k<111){
			console.log(k,v)
			v.k=k
			write_l3_1(ctrl,v)
		}})
	}})
}
function write_l3_1(ctrl,v){
	v.sql = "UPDATE achi_ukr_eng2_3 SET l3_id=:l3_id WHERE n7=:n7"
	console.log(v)
	v.dataAfterSave = function(response){
		console.log(response.data, v.sql)
	}
	writeSql(v)
}

function read_l2(ctrl) {
	readSql({sql: sql_read_l2, afterRead:function(response){
		ctrl.r1 = response.data.list
		console.log(ctrl.r1)
		angular.forEach(ctrl.r1, function(v,k){ if(k<111){
			console.log(k,v)
			v.k=k
			write_l2_1(ctrl,v)
		}})
	}})
}
function write_l2_1(ctrl,v){
	v.n6_1 = v.n6.replace(/'/g,"''")
	v.sql = "UPDATE achi_ukr_eng2_3 SET l2_id=:l2_id WHERE n6=:n6_1"
	console.log(v)
	v.dataAfterSave = function(response){
		console.log(response.data, v.sql)
	}
	writeSql(v)
}
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
	readSql({ sql: sql_read1, afterRead:function(response){
		ctrl.r1 = response.data.list
		console.log(ctrl.r1)
		angular.forEach(ctrl.r1, function(v,k){ if(k==0){
			console.log(k,v)
			v.k=k
			read1_2(ctrl,v)
		}})
	}})
}

function read1_2(ctrl,v){
	console.log(v)
	v.sql = "UPDATE achi_ukr_eng2_3 SET l0_id=:l0_id WHERE l0=:l0"
	v.dataAfterSave = function(response){
		console.log(response.data, v.sql)
	}
	writeSql(v)
}

