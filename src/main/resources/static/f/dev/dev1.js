app.controller('myCtrl', function($scope, $http, $interval, $filter) {
	console.log(123)
	initApp($scope, $http)

	splitPakung()

	$scope.drug_list = {}
	$scope.drug_list.openRow = function(row){
		row.open=!row.open
		var sql = "SELECT * FROM doc, uuid, reestr r \n" +
		"WHERE parent=" + row.dtrade_id + " \n" +
		"AND doc_id=uuid_id \n" +
		"AND r.id=value"
		var sql2 = "SELECT d.*, i.*,edfv.value ed_form, edv.value ed, uuid  \n" +
		"FROM (SELECT uuid_id, value uuid FROM doc d0, uuid u where d0.parent=" +
		row.dtrade_id +
		" AND d0.doc_id=uuid_id) u \n" +
		", doc d \n" +
		"LEFT JOIN integer i ON integer_id=d.doc_id \n" +
		", doc edf, string edfv \n" +
		", doc ed, string edv \n" +
		"WHERE d.parent = uuid_id \n" +
		"AND edf.parent = 86991 \n" +
		"AND d.reference = edf.doc_id \n" +
		"AND edfv.string_id = edf.doc_id \n" +
		"AND d.reference2 = ed.doc_id \n" +
		"AND edv.string_id = ed.doc_id"
		console.log(row, sql, sql2)
		readSql({
			sql:sql,
			afterRead:function(response){
				row.reestr = response.data.list
				readSql({
					sql:sql2,
					afterRead:function(response){
						row.reestr2 = response.data.list
					}
				})
			}
		})
	}
	$scope.drug_list.changeSeek = function(){
		console.log(this.seek)
		if(this.seek){
			seek(sql_app.drug_ua_reestr_seek(), '%'+this.seek+'%')
		}
	}

	$scope.drug_list.head = {
		//inn:'препарат',
		//trade:'бренд',
		inn_trade:'препарат (бренд)',
		cnt:'вар.упк.',
	}

	
	function seek (sql, seek){
//		console.log(sql, seek)
		sql += ' LIMIT 100'
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

	seek(sql_app.drug_ua_reestr()
//			+' LIMIT 10'
	)

	// updata drug reestr

	$scope.$watch('drug_list.data',function(newValue, oldValue){
		if(!oldValue){
			console.log(newValue, oldValue)
			//addTrade(newValue)
//			addID(newValue)
		}
	})

})

sql_app.drug_ua_reestr = function(){
	return "SELECT * FROM ( \n" +
	"SELECT i.inn , t.value trade, x.* \n" +
	"FROM ( \n" +
	"SELECT d1.reference2 dinn_id, d2.doc_id dtrade_id, count(*) cnt \n" +
	"FROM doc d1, doc d2 \n" +
	"LEFT JOIN (SELECT parent uuid_parent FROM doc,uuid u where doc_id=uuid_id) u ON uuid_parent=d2.doc_id \n" +
	"WHERE d1.doc_id=d2.parent \n" +
	"AND d1.parent = 87054 \n" +
	"GROUP BY d1.reference2, d2.doc_id \n" +
	") x , inn i, string t \n" +
	"WHERE x.dinn_id=inn_id AND x.dtrade_id=string_id \n" +
	") x \n" +
	"ORDER BY inn, trade "
}
sql_app.drug_ua_reestr3 = function(){
	return "SELECT d1.doc_id dinn_id,i.*, d2.* \n" +
	"FROM inn i, doc d1 \n" +
	"LEFT JOIN (SELECT d2.parent,d2.doc_id dtrade_id, trade.string_id trade_id, trade.value trade, u.* \n" +
	"FROM string trade, doc d2 \n" +
	"LEFT JOIN (SELECT parent uuid_parent, uuid_id,value uuid FROM doc,uuid u where doc_id=uuid_id) u ON uuid_parent=d2.doc_id \n" +
	"WHERE d2.reference2 = trade.string_id ) d2 ON d2.parent=d1.doc_id \n" +
	"WHERE d1.reference2 = inn_id \n" +
	"AND d1.parent = 87054 \n" +
	"ORDER BY inn, trade "
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

function addTrade(newValue){
	var i = 0
	angular.forEach(newValue, function(v){
		if(!v.trade_id){
			if(i<111){
//				console.log(v.inn,v)
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
//							console.log(v, v.dinn_id, v2.n_________, v2)
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
//						console.log(sql, response.data)
						var sql2 = ''
						angular.forEach(response.data.list, function(v2){
							sql2 += "INSERT INTO doc (parent,doc_id,doctype) " +
							"VALUES (" + v.trade_id + ",nextval('dbid'),30); \n" +
							"INSERT INTO uuid (uuid_id, value) " +
							"VALUES (currval('dbid'), '" +v2.id+ "' ); \n"
						})
//						console.log(sql2)
						if(sql2){
						console.log(v.inn, v.trade)
							writeSql({sql : sql2,
								dataAfterSave:function(response){
//									console.log(sql2, response.data)
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

function splitPakung(){
	var sql = "SELECT id,n________5,n_________,n________2, u.* \n" +
	"FROM reestr, uuid u \n" +
	"where value=id \n" +
	"and n________5 like '%таблетк%' \n" +
	"and array_length(regexp_split_to_array(n________5, E' мг'),1)=2"
	readSql({
		sql:sql
		,afterRead:function(response){
			var i = 0
			angular.forEach(response.data.list, function(v){
				if(i<1){
					var mgs = v.n________5.split('мг'),
					mgVal = mgs[0].trim().split(' ').reverse()[0]*1
					var sql2 = "INSERT INTO doc (parent,doc_id,doctype,reference,reference2) " +
					"VALUES (" + v.uuid_id + ",nextval('dbid'),18,112270,112272); \n" +
					"INSERT INTO integer (integer_id, value) " +
					"VALUES (currval('dbid'), '" +mgVal+ "' ); \n"
					console.log(mgVal, Number.isInteger(mgVal), mgs,v, sql2)
				}
				i++
			})
		}
		
	})
}

