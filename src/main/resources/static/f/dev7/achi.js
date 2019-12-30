var app = angular.module('myApp', ['ngSanitize']);
app.controller('AppCtrl', function($scope, $http, $timeout) {
	var ctrl = this
	ctrl.page_title = 'ACHI'
	ctrl.page_title = 'АКМІ'
	initApp($scope, $http, ctrl, $timeout)
	initAchi(ctrl)
	console.log('--',ctrl.page_title,'--')
//	read2(ctrl)
	read_dataObject(ctrl, 'seek_achi', ctrl.seek_sql) 
	read_dataObject(ctrl, 'l0', ctrl.l0_sql)
	read_dataObject(ctrl, 'l1', ctrl.l1_sql, 122, true)
})

function initAchi(ctrl) {
	ctrl.l0_fn = {}
	ctrl.l0_fn.filters = {}
	ctrl.achi_seek_head = {
		n9:{n:'Код', style:{'width':'100px'}},
		n8:{n:'ACHI'},
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
		l0:{n:'№', style:{'width':'55px'}},
		n2:{n:'Клас'},
	}

	ctrl.seekLogic.seek_engine = function(){
		var sql = ctrl.seek_sql 
			+ " WHERE n10 LIKE '%" + ctrl.seekLogic.seek_value + "%'"
		console.log(ctrl.seekLogic.seek_value, sql)
		read_dataObject(ctrl, 'seek_achi', sql)
	}

	ctrl.seek_sql = "SELECT * FROM achi_ukr_eng2_3"
//ctrl.l0_sql = "SELECT l0_id , count(*) cnt, min(l0) l0, min(n2) n2 FROM achi_ukr_eng2_3 group by l0_id"
	ctrl.l0_sql = "SELECT *, SPLIT_PART(l0s, ' ',2)::INT l0 FROM " +
		"(SELECT l0_id , COUNT(*) cnt, MIN(n1) l0s, MIN(n2) n2 FROM achi_ukr_eng2_3 GROUP BY l0_id) a "
	ctrl.l1_sql = "SELECT *, SPLIT_PART(l0s, ' ',2)::INT l0 FROM ( " +
		"SELECT l1_id, COUNT(*) cnt, MIN(n1) l0s, MIN(n3) n3, MIN(n4) n4, MIN(l0_id) l0_id FROM achi_ukr_eng2_3 GROUP BY l1_id" +
		") a"
//	console.log(ctrl.l1_sql)
	initl0(ctrl)
}

function initl0(ctrl) {
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
		var sql = "SELECT * FROM (" + ctrl.l0_sql + ") a ORDER BY "+ctrl.l0_order
//	console.log(h, ctrl.l0_order.includes(h), sql)
		read_dataObject(ctrl, 'l0', sql) 
	}
	ctrl.l0_fn.remove_filter = function(v){
		delete ctrl[v+'_fn'].filters[v]
	}

	ctrl.l0_fn.click_row = function(l0){
		if(ctrl.l0_fn.filters.l0 && l0.l0_id == ctrl.l0_fn.filters.l0.l0_id){
			delete ctrl.l0_fn.filters.l0
			return
		}
		ctrl.l0_fn.filters.l0 = l0
		console.log(ctrl.l0_fn, l0)
// seek ACHI with filter
		console.log(ctrl.seekLogic.seek_value)
		var sql = ctrl.seek_sql + " WHERE l0_id = " + l0.l0_id
		console.log(sql)
		read_dataObject(ctrl, 'seek_achi', sql)
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
			console.log(ctrl[dataObjectName], sql)
	}})
}
