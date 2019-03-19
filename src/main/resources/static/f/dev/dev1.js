app.controller('myCtrl', function($scope, $http, $interval, $filter) {
	initApp($scope, $http)

	$http.get('/f/json/dictionaries.json')
	.then(function(response){
		console.log(response.data)
		var i1=0
		angular.forEach(response.data.data, function(v){
			if(i1<211){
				console.log(i1, v.name)
				readSql({
					sql:"SELECT * FROM doc,string where string_id=doc_id and parent = 115920 and value = '" +
					v.name +
					"'",
					afterRead:function(response){
						console.log(response.data.list.length,response.data)
						if(response.data.list.length==0){
							var sql = "INSERT INTO doc (parent, doc_id,doctype) VALUES (115920, :nextDbId1, 18);\n"
								sql += "INSERT INTO string (string_id, value) VALUES (:nextDbId1, '" + v.name + "');\n"
								var i = 1
								angular.forEach(v.values, function(v2, k2){
									console.log(k2,v2)
									sql += "INSERT INTO doc (parent,doc_id,doctype) VALUES (:nextDbId1, :nextDbId" + ++i + ", 18);\n"
									sql += "INSERT INTO string (string_id, value) VALUES (:nextDbId" + i + ", '" + k2 + "');\n"
									sql += "INSERT INTO doc (parent,reference,doc_id,doctype) VALUES (115924, :nextDbId" + i + ", :nextDbId" + ++i + ", 18);\n"
									v2 = v2.replace(/'/g,"''")
									v2 = v2.replace(/;/g,":,")
									sql += "INSERT INTO string (string_id, value) VALUES (:nextDbId" + i + ", '" + v2 + "');\n"
								})
								console.log(v.name,v,sql)
								if(true){
									writeSql({sql : sql,
										dataAfterSave:function(response){
											console.log(response.data)
										}
									})
								}
						}
					}
				})
			}
			i1++
		})
	}) 
	splitPakung()

	$scope.drug_list = {}
	$scope.drug_list.openRow = function(row){
		row.open=!row.open
		var sql = "SELECT * FROM doc, uuid, reestr r \n" +
		"WHERE parent=" + row.dtrade_id + " \n" +
		"AND doc_id=uuid_id \n" +
		"AND r.id=value"

		var sql2 = "SELECT d.*, i.*, f.*,edfv.value ed_form, edv.value ed, v2.*, uuid  \n" +
		"FROM (SELECT uuid_id, value uuid FROM doc d0, uuid u where d0.parent=" +
		row.dtrade_id +
		" AND d0.doc_id=uuid_id) u \n" +
		", doc d \n" +
		"LEFT JOIN (SELECT integer_id, value vint FROM integer) i ON integer_id=d.doc_id \n" +
		"LEFT JOIN (SELECT double_id, value vfloat FROM double) f ON double_id=d.doc_id \n" +
		"left join ( \n" +
		"SELECT d2.doc_id v2_id, d2.parent parent2, f2.*, i2.*, edv2.value ed2 FROM  doc d2 \n" +
		"LEFT JOIN (SELECT integer_id, value vint2 FROM integer) i2 ON integer_id=d2.doc_id \n" +
		"LEFT JOIN (SELECT double_id, value vfloat2 FROM double) f2 ON double_id=d2.doc_id \n" +
		", string edv2 \n" +
		"where edv2.string_id = d2.reference2 \n" +
		") v2 ON parent2=d.doc_id \n" +
		", doc edf, string edfv \n" +
		", doc ed, string edv \n" +
		"WHERE d.parent = uuid_id \n" +
		"AND edf.parent = 86991 \n" +
		"AND d.reference = edf.doc_id \n" +
		"AND edfv.string_id = edf.doc_id \n" +
		"AND d.reference2 = ed.doc_id \n" +
		"AND edv.string_id = ed.doc_id"
//		console.log(row)
		console.log(row, sql,'\n', sql2)
		readSql({
			sql:sql,
			afterRead:function(response){
				row.reestr = response.data.list
				readSql({
					sql:sql2,
					afterRead:function(response){
						row.reestr2 = response.data.list
						row.reestr2Map = {}
						angular.forEach(row.reestr2,function(v){
							row.reestr2Map[v.uuid] = v
						})
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

function splitPakung(){//ампул мг мл
	var sql = "SELECT id,n________5,n________3,n_________,n________2, u.*, d.* \n" +
	"FROM reestr, uuid u \n" +
	"left join doc d on parent=uuid_id \n" +
	"where value=id \n" +
	"and n________5 like '%ампул%' \n" +
	"and array_length(regexp_split_to_array(n________3, E' мг/мл по '),1)=2 \n" +
	"order by n________2, n_________"
//	console.log(sql)
	readSql({
		sql:sql
		,afterRead:function(response){
			var i = 0
			angular.forEach(response.data.list, function(v){
				if(i<1){
					var mgs = v.n________3.split('мг/мл по'),
					mgMlVal = mgs[0].trim().split(' ').reverse()[0].replace(',','.')*1,
					mlVal = mgs[1].trim().split(' ')[0].replace(',','.')*1
					var sql2 = "INSERT INTO doc (parent,doc_id,doctype,reference,reference2) " +
					"VALUES (" + v.uuid_id + ", :nextDbId1, 18, 112271, 115779); \n"
					if(isInt(mgMlVal)){
						sql2 += "INSERT INTO integer (integer_id, value) " +
						"VALUES ( :nextDbId1, '" +mgMlVal+ "' ); \n"
					}else{
						sql2 += "INSERT INTO double (double_id, value) " +
						"VALUES ( :nextDbId1, '" +mgMlVal+ "' ); \n"
					}
					if(mlVal){//МУКОСОЛ
						sql2 += "INSERT INTO doc (parent,doc_id,doctype,reference2) " +
						"VALUES ( :nextDbId1, :nextDbId2, 18, 112273); \n"
						if(isInt(mlVal)){
							sql2 += "INSERT INTO integer (integer_id, value) " +
							"VALUES ( :nextDbId2, '" +mlVal+ "' ); \n"
						}else{
							sql2 += "INSERT INTO double (double_id, value) " +
							"VALUES ( :nextDbId2, '" +mlVal+ "' ); \n"
						}	
					}
//					console.log(mgMlVal, mlVal, mgs, v, sql2)
				}
				i++
			})
		}
	})

}

function splitPakungAmpulMgMl(){//ампул мг мл
	var sql = "SELECT id,n________5,n_________,n________2, u.*, d.* \n" +
	"FROM reestr, uuid u \n" +
	"left join doc d on parent=uuid_id \n" +
	"where value=id \n" +
	"and n________5 like '%ампул%' \n" +
	"and n________5 like '% мл %' \n" +
	"and array_length(regexp_split_to_array(n________5, E' мг'),1)=2 \n" +
	"and doc_id is null \n" +
	"order by n________2, n_________"
	console.log(sql)
	readSql({
		sql:sql
		,afterRead:function(response){
			var i = 0
			angular.forEach(response.data.list, function(v){
				if(i<11){
					var mgs = v.n________5.split('мг'),
					mgVal = mgs[0].trim().split(' ').reverse()[0].replace(',','.')*1
					var mls = v.n________5.split('мл'),
					mlVal = mls[0].trim().split(' ').reverse()[0].replace(',','.').replace('(','')*1
					var sql2 = "INSERT INTO doc (parent,doc_id,doctype,reference,reference2) " +
					"VALUES (" + v.uuid_id + ", :nextDbId1, 18, 112271, 112272); \n"
					if(isInt(mgVal)){
						sql2 += "INSERT INTO integer (integer_id, value) " +
						"VALUES ( :nextDbId1, '" +mgVal+ "' ); \n"
					}else{
						sql2 += "INSERT INTO double (double_id, value) " +
						"VALUES ( :nextDbId1, '" +mgVal+ "' ); \n"
					}
					if(mlVal){//АЛПРОСТАН® АМІОКОРДИН®
						sql2 += "INSERT INTO doc (parent,doc_id,doctype,reference2) " +
						"VALUES ( :nextDbId1, :nextDbId2, 18, 112273); \n"
						if(isInt(mlVal)){
							sql2 += "INSERT INTO integer (integer_id, value) " +
							"VALUES ( :nextDbId2, '" +mlVal+ "' ); \n"
						}else{
							sql2 += "INSERT INTO double (double_id, value) " +
							"VALUES ( :nextDbId2, '" +mlVal+ "' ); \n"
						}	
					}
					console.log(mlVal, mgVal, v, sql2)
					/*
					 * */
					writeSql({sql : sql2,
						dataAfterSave:function(response){
							console.log(response.data)
						}
					})
				}
				i++
			})
		}
	})
}

function splitPakungTabletMg(){
	var sql = "SELECT id,n________5,n_________,n________2, u.*, d.* \n" +
	"FROM reestr, uuid u \n" +
	"left join doc d on parent=uuid_id \n" +
	"where value=id \n" +
	"and n________5 like '%таблетк%' \n" +
	"and array_length(regexp_split_to_array(n________5, E' мг'),1)=2 \n" +
	"and doc_id is null \n" +
	"order by n________2, n_________"
	readSql({
		sql:sql
		,afterRead:function(response){
			var i = 0
			angular.forEach(response.data.list, function(v){
				if(i<111){
					var mgs = v.n________5.split('мг'),
					mgVal = mgs[0].trim().split(' ').reverse()[0].replace(',','.')*1
					var sql2 = "INSERT INTO doc (parent,doc_id,doctype,reference,reference2) " +
					"VALUES (" + v.uuid_id + ",nextval('dbid'),18,112270,112272); \n"
					if(isInt(mgVal)){
						sql2 += "INSERT INTO integer (integer_id, value) " +
						"VALUES (currval('dbid'), '" +mgVal+ "' ); \n"
					}else{
						sql2 += "INSERT INTO double (double_id, value) " +
						"VALUES (currval('dbid'), '" +mgVal+ "' ); \n"
					}
					console.log(isInt(mgVal), isFloat(mgVal), '->', mgVal, Number.isInteger(mgVal), mgs,v, sql2,'\n',sql)
					/*
					console.log(mgVal1, mgVal, Number.isInteger(mgVal), mgs,v, sql2,'\n',sql)
					*/
					writeSql({sql : sql2,
						dataAfterSave:function(response){
							console.log(response.data)
						}
					})
				}
				i++
			})
		}
		
	})
}

