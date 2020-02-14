app.controller('myCtrl', function($scope, $http, $interval, $filter) {
	initApp($scope, $http)
	init_j2c_table_editor($scope, $http)

	$scope.pageVar.pageName = 'Конфігуратор БД'
	$scope.pageVar.pageParent = {}
	$scope.pageVar.pageParent.url = '/v/create_tables2'
	$scope.pageVar.pageParent.params = function(){
		var params
		if($scope.request.parameters.folderId){
			params = "?folderId=" +
			$scope.request.parameters.folderId
		}else{
			params = "?tableId=" +
			$scope.request.parameters.tableId
		}
		return params
	}
	$scope.tables = {}
	$scope.tables.folderObjectData={
		table:{
			doctype : 1,
			col_keys:{
				value:'Назва таблиці',
			},
		},
		datadictionary:{
			doctype : 6,
			col_keys:{
				value:'Назва словника даних',
			},
		},
		doc:{
			doctype : 17,
			col_keys:{
				value:'Назва документу',
			},
		},
	}
	$scope.tables.addFolderObjectType=function(folderObjectType){
		console.log(folderObjectType)
		this.folderObjectType=folderObjectType
		console.log(this.folderObjectData[this.folderObjectType])
		console.log(this.col_keys)
		this.col_keys.value = 
			this.folderObjectData[this.folderObjectType].col_keys.value
	}

	$scope.tables.saveUpdate=function(){
		console.log($scope.pageVar.rowObj)
		var folderId
		if($scope.folders.selectedObj){
			folderId = $scope.folders.selectedObj.folderId
		}else 
		if($scope.request.parameters.folderId){
			folderId = $scope.request.parameters.folderId
//		}else 
//		if($scope.pageVar.rowObj&&$scope.pageVar.rowObj.folderId){
		}
		if($scope.pageVar.rowKey == -1){
			var data = {
				sql : sql_1c.table_insert(),
				folderId : folderId*1,
			}
			data.doctype = 1
			if(this.folderObjectType)
				data.doctype = 
					this.folderObjectData[this.folderObjectType].doctype
			if(data.doctype != 1){
				data.sql = sql_1c.doc_insert()
			}
		}else{
			var data = {
				sql : sql_1c.table_update(),
				string_id : $scope.pageVar.rowObj.string_id,
			}
		}
		data.value = $scope.pageVar.rowObj.value
		console.log(data)
		writeSql(data)
	}
	$scope.tables.ngIncludes={
		modalBottonPanel:'/f/am-dev/1c-db-tables2/tables_modalBottonPanel.html',
	}
	$scope.tables.no_edit=['doc_id','doctype']
	$scope.tables.col_keys={
		doc_id:'ІН',
		value:'Назва таблиці/документу',
		doctype:'T',
	}
	$scope.tables.col_links={
		doc_id:{k:'tableId',vk:'doc_id',path:'/f/c4/j2c_table_editor.html'},
	}
	console.log($scope.tables)
	var params_tables = {}
	if($scope.request.parameters.folderId){
		params_tables.folderId = $scope.request.parameters.folderId
		params_tables.sql = sql_1c.tables_of_folder()
	}else{
		params_tables.sql = sql_1c.read_tables()
	}
	params_tables.sql = "SELECT * FROM (" +
	params_tables.sql +
	") a LEFT JOIN sort ON doc_id=sort_id " +
	"ORDER BY sort"
	console.log(params_tables.sql)
	readSql(params_tables, $scope.tables)

	$scope.folders = {}
	$scope.folders.openAllFolders=true
	$scope.folders.openAllFolders2=function(){
		this.openAllFolders = !this.openAllFolders
	}
	$scope.folders.openSubFolders=function(o){
		console.log(o)
		o.openSubFolder = !o.openSubFolder
	}
	$scope.folders.saveUpdate=function(){
		console.log($scope.pageVar.rowObj)
		if($scope.pageVar.rowKey == -1){
			var data = {
				sql : sql_1c.folder_insert(),
				value : $scope.pageVar.rowObj.value,
			}
		}else{
			var data = {
				sql : sql_1c.table_update(),
				string_id : $scope.pageVar.rowObj.string_id,
				value : $scope.pageVar.rowObj.value,
			}
		}
		console.log(data)
		writeSql(data)
	}
	console.log($scope.folders)
	/*
	 * 
	 */
	$scope.folders.no_edit=['folderId','parent'],
	$scope.folders.col_keys = {}
	$scope.folders.col_keys.folderId='ІН'
	$scope.folders.col_keys.value='Папка'
	$scope.folders.col_keys.parent='П'
	$scope.folders.col_links={}
	$scope.folders.col_links.folderId={k:'folderId',vk:'folderId'},
	readSql({ sql:sql_1c.folders() }, $scope.folders)
	console.log(sql_1c.folders())
})
sql_1c.table_insert = function(){
	return "INSERT INTO doc (parent, doc_id, doctype) VALUES (:folderId, :nextDbId1, :doctype) ;" +
	"INSERT INTO string (value,string_id) VALUES (:value, :nextDbId1) ;"
}
sql_1c.doc_insert = function(){
	return this.table_insert() + 
	"INSERT INTO doc (parent, doc_id, doctype) VALUES (:nextDbId1, :nextDbId2, 18);"
}
sql_1c.table_update = function(){
	return "UPDATE string SET value =:value WHERE string_id=:string_id ;"
}
sql_1c.folders = function(){
	return "SELECT string_id folderId, value folderName, * " +
	"FROM string s, doc WHERE doc_id=string_id and doctype=14 " +
	"ORDER BY parent, doc_id"
}
sql_1c.folder_insert = function(){
	return "INSERT INTO doc (doc_id, doctype) VALUES (:nextDbId1, 14);" +
	"INSERT INTO string (value,string_id) VALUES (:value, :nextDbId1);"
}
sql_1c.read_tables = function(){
	return "SELECT d.*, s.* FROM doc d, string s, ( \n" +
	this.folders()+
	"\n) d2 WHERE d2.doc_id=d.parent \n" +
	"AND s.string_id=d.doc_id \n" +
	"AND d.doctype in (1,6,17) "
}
sql_1c.tables_of_folder = function(){
	return "SELECT * FROM (" +
	this.read_tables() +
	") x WHERE parent=:folderId"
}
