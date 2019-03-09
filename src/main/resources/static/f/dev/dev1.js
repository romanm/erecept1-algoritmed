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
	}

	function seek (sql, seek){
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

	seek(sql_app.drug_ua_reestr()+' LIMIT 10')
})

sql_app.drug_ua_reestr = function(){
	return "SELECT d1.doc_id dinn_id,i.*, d2.doc_id dtrade_id, trade.string_id trade_id, trade.value trade " +
	"FROM inn i, string trade, doc d1, doc d2 " +
	"WHERE d2.reference2 = trade.string_id " +
	"AND d1.reference2 = inn_id " +
	"AND d2.parent = d1.doc_id " +
	"AND d1.parent = 87054 "
}
sql_app.drug_ua_reestr_seek = function(){
	return "SELECT * FROM ( " +
	sql_app.drug_ua_reestr() +
	") x " +
	"WHERE LOWER(inn) LIKE LOWER(:seek) " +
	"OR LOWER(trade) LIKE LOWER(:seek) "
}
