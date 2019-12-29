var app = angular.module('myApp', ['ngSanitize']);
app.controller('AppCtrl', function($scope, $http) {
	var ctrl = this
	ctrl.page_title = 'ACHI'
	initApp($scope, $http, ctrl)
	console.log(123, ctrl.page_title)
	read1(ctrl)
	readN1(ctrl)
})

function read2(ctrl,v){
	console.log(v)
	v.sql = "UPDATE achi_ukr_eng2_3 SET l0_id=:l0_id WHERE n1=:n1"
	v.dataAfterSave = function(response){
		console.log(response.data, v.sql)
	}
	writeSql(v)
}

function readN1_go(ctrl, sql) {
	console.log(sql)
	readSql({
		sql:sql,
		afterRead:function(response){
			ctrl.n1 = response.data.list
			console.log(ctrl.n1)
		}
	})
}

function readN1(ctrl) {
	ctrl.n1_fn = {}
	ctrl.n1_fn.click_head = function(h){
		if(!ctrl.n1_order.includes(h)){
			ctrl.n1_order = h
		}else{
			if(!ctrl.n1_order.includes('DESC')){
				ctrl.n1_order += ' DESC'
			}else{
				ctrl.n1_order = h
			}
		}
		var sql = "SELECT * FROM (" +
		ctrl.n1_sql +
		") a order by "+ctrl.n1_order
		console.log(h, ctrl.n1_order.includes(h), sql)
		readN1_go(ctrl, sql) 
	}
	ctrl.n1_order = ""
//	ctrl.n1_sql = "SELECT l0_id , count(*) cnt, min(n1) n1, min(n2) n2 FROM achi_ukr_eng2_3 group by l0_id"
	ctrl.n1_sql = "SELECT *, split_part(n1s, ' ',2)::int n1 FROM " +
			"(SELECT l0_id , count(*) cnt, min(n1) n1s, min(n2) n2 FROM achi_ukr_eng2_3 group by l0_id) a "
	ctrl.n1_head = {
		cnt:{n:'cnt', style:'width:50px'},
		n1:{n:'Клас №', style:'width:75px'},
		n2:{n:'Назва'},
	}
	readN1_go(ctrl, ctrl.n1_sql) 
}

function read1(ctrl) {
	readSql({
		sql:"SELECT * FROM (" +
		"SELECT l0_id , COUNT(*) cnt, MIN(n1) n1 FROM achi_ukr_eng2_3 " +
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
