app.controller('myCtrl', function($scope, $http, $interval, $filter) {
	console.log(123)
	initApp($scope, $http)
	
	$scope.drug_list = {}
	$scope.drug_list.changeSeek = function(){
		console.log(this.seek)
		if(this.seek){
			seek(sql_app.drug_ua_reestr_seek(), '%'+this.seek+'%')
		}
	}

	$scope.drug_list.head = {
		inn:'препарат',
		trade:'бренд',
		uuid:'id',
	}

	function seek (sql, seek){
//		console.log(sql, seek)
		var params = {
			sql:sql,
			afterRead:function(response){
				$scope.drug_list.data = response.data.list
				console.log($scope.drug_list.data)
			}
		}
		if(seek)
			params.seek = seek
		readSql(params)
	}
	
	function addID(newValue){
		var i = 0
		angular.forEach(newValue, function(v){
			if(!v.uuid_id){
				if(i<1111){
					var sql = "SELECT * FROM reestr " +
					"WHERE n________2='" + v.inn + "'" +
					"AND n_________='" + v.trade.replace(/'/g,"''")+ "'" +
					""
					readSql({
						sql:sql
						,afterRead:function(response){
//							console.log(sql, response.data)
							var sql2 = ''
							angular.forEach(response.data.list, function(v2){
								sql2 += "INSERT INTO doc (parent,doc_id,doctype) " +
								"VALUES (" + v.trade_id + ",nextval('dbid'),30); \n" +
								"INSERT INTO uuid (uuid_id, value) " +
								"VALUES (currval('dbid'), '" +v2.id+ "' ); \n"
							})
//							console.log(sql2)
							if(sql2){
							console.log(v.inn, v.trade)
								writeSql({sql : sql2,
									dataAfterSave:function(response){
//										console.log(sql2, response.data)
									}
								})
							}
						}
					})
				}
				i++
			}
		})
		
	}
	function addTrade(newValue){
		var i = 0
		angular.forEach(newValue, function(v){
			if(!v.trade_id){
				if(i<111){
//					console.log(v.inn,v)
					console.log(v.inn)
					readSql({
						sql:"SELECT * FROM reestr where n________2='" +
						v.inn +
						"'"
						,afterRead:function(response){
							var sql ='', trades = []
							angular.forEach(response.data.list, function(v2){
								var trade = v2.n_________
								trade = trade.replace(/'/g,"''")
								if(!trades .includes(trade)){
									sql += "INSERT INTO doc (parent,doc_id,reference2,doctype) " +
									"VALUES (" + v.dinn_id + ",nextval('dbid'),currval('dbid'),18); \n" +
									"INSERT INTO string (string_id, value) " +
									"VALUES (currval('dbid'), '" +trade+ "' ); \n"
									console.log( v.dinn_id, trade)
//								console.log(v, v.dinn_id, v2.n_________, v2)
									trades.push(trade)
								}
							})
							if(sql){
								writeSql({sql : sql,
									dataAfterSave:function(response){
										console.log(response.data, sql)
									}
								})
							}
						}
					})
				}
				i++
			}
		})
		
	}
	$scope.$watch('drug_list.data',function(newValue, oldValue){
		if(!oldValue){
			console.log(newValue, oldValue)
			//addTrade(newValue)
//			addID(newValue)
		}
	})


	seek(sql_app.drug_ua_reestr()
		+' LIMIT 10'
	)
})

sql_app.drug_ua_reestr = function(){
	return "SELECT d1.doc_id dinn_id,i.*, d2.* \n" +
	"FROM inn i, doc d1 \n" +
	"LEFT JOIN (SELECT d2.parent,d2.doc_id dtrade_id, trade.string_id trade_id, trade.value trade, u.* \n" +
	"FROM string trade, doc d2 \n" +
	"LEFT JOIN (SELECT parent uuid_parent, uuid_id,value uuid FROM doc,uuid u where doc_id=uuid_id) u ON uuid_parent=d2.doc_id \n" +
	"WHERE d2.reference2 = trade.string_id ) d2 ON d2.parent=d1.doc_id \n" +
	"WHERE d1.reference2 = inn_id \n" +
	"AND d1.parent = 87054 \n" +
	"ORDER BY inn, trade"
}
sql_app.drug_ua_reestr2 = function(){
	return "SELECT d1.doc_id dinn_id,i.*, d2.doc_id dtrade_id, trade.string_id trade_id, trade.value trade \n" +
	"FROM inn i, string trade, doc d1, doc d2 \n" +
	"WHERE d2.reference2 = trade.string_id \n" +
	"AND d1.reference2 = inn_id \n" +
	"AND d2.parent = d1.doc_id \n" +
	"AND d1.parent = 87054 \n"
}
sql_app.drug_ua_reestr_seek = function(){
	return "SELECT * FROM ( " +
	sql_app.drug_ua_reestr() +
	") x " +
	"WHERE LOWER(inn) LIKE LOWER(:seek) " +
	"OR LOWER(trade) LIKE LOWER(:seek) "
}
