var app = angular.module('myApp', ['ngSanitize']);
app.controller('AppCtrl', function($scope, $http, $timeout) {
	var ctrl = this
	ctrl.page_title = 'ACHI'
	initApp($scope, $http, ctrl, $timeout)
	initAchi(ctrl)
	console.log(123, ctrl.page_title)
	readL1(ctrl)
//	read1(ctrl)
})

function readL1_go(ctrl, sql) {
//	console.log(sql)
	readSql({
		sql:sql,
		afterRead:function(response){
			ctrl.l1 = response.data.list
		}
	})
}

function initAchi(ctrl) {
	ctrl.l1_fn = {}
	ctrl.l1_fn.filters = {}
	ctrl.achi_seek_head = {
		n9:{n:'Код', style:{'width':'100px'}},
		n8:{n:'ACHI'},
	}
	ctrl.l1_head = {
		cnt:{n:'∑', style:{'width':'50px'}},
		l1:{n:'№', style:{'width':'75px'}},
		n2:{n:'Клас'},
	}

	ctrl.seek_sql = "SELECT * FROM achi_ukr_eng2_3"
		ctrl.l1_sql = "SELECT *, split_part(l1s, ' ',2)::int l1 FROM " +
		"(SELECT l0_id , count(*) cnt, min(n1) l1s, min(n2) n2 FROM achi_ukr_eng2_3 group by l0_id) a "
	read_seek(ctrl, ctrl.seek_sql)

	ctrl.seekLogic.seek_engine = function(){
		console.log(ctrl.seekLogic.seek_value)
		var sql = ctrl.seek_sql + " WHERE n10 LIKE '%" +
		ctrl.seekLogic.seek_value +
		"%'"
		console.log(sql)
		read_seek(ctrl, sql)
	}
}

function read_seek(ctrl, sql) {
	sql += " LIMIT 100"
	readSql({sql:sql, afterRead:function(response){
		ctrl.seek_achi = response.data.list
		console.log(ctrl.seek_achi)
	} })
}

function readL1(ctrl) {
	ctrl.l1_fn.remove_filter = function(v){
		delete ctrl[v+'_fn'].filters[v]
	}
	ctrl.l1_fn.click_row = function(l1){
		ctrl.l1_fn.filters.l1 = l1
		console.log(ctrl.l1_fn, l1)
	}
	ctrl.l1_fn.click_head = function(h){
		if(!ctrl.l1_order.includes(h)){
			ctrl.l1_order = h
		}else{
			if(!ctrl.l1_order.includes('DESC')){
				ctrl.l1_order += ' DESC'
			}else{
				ctrl.l1_order = h
			}
		}
		var sql = "SELECT * FROM (" +
		ctrl.l1_sql +
		") a order by "+ctrl.l1_order
//		console.log(h, ctrl.l1_order.includes(h), sql)
		readL1_go(ctrl, sql) 
	}
	ctrl.l1_order = ""
//	ctrl.l1_sql = "SELECT l0_id , count(*) cnt, min(l1) l1, min(n2) n2 FROM achi_ukr_eng2_3 group by l0_id"
	readL1_go(ctrl, ctrl.l1_sql) 
}

function read1(ctrl) {
	readSql({
		sql:"SELECT * FROM (" +
		"SELECT l0_id , COUNT(*) cnt, MIN(n1) l1 FROM achi_ukr_eng2_3 " +
		"WHERE l0_id IS NOT NULL GROUP BY l0_id ) a " +
		"WHERE cnt=1",
		afterRead:function(response){
			ctrl.r1 = response.data.list
			console.log(ctrl.r1)
			angular.forEach(ctrl.r1, function(v,k){
				if(k==0){
					console.log(k,v)
					v.k=k
					read2(ctrl,v)
				}
			})
		}
	})
}

function read2(ctrl,v){
	console.log(v)
	v.sql = "UPDATE achi_ukr_eng2_3 SET l0_id=:l0_id WHERE l1=:l1"
	v.dataAfterSave = function(response){
		console.log(response.data, v.sql)
	}
	writeSql(v)
}
