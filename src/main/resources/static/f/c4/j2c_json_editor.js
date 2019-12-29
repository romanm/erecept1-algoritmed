app.controller('myCtrl', function($scope, $http, $interval, $filter) {
	initApp($scope, $http)
	init_j2c_json2table($scope, $http, $filter, $interval)

	$scope.pageVar.pageName = 'j2c JSON Editor'
	$scope.pageVar.pageParent = {}
	$scope.pageVar.pageParent.url = '/f/c4/dm/doc_manager.html'
//		$scope.pageVar.pageParent.url = '/v/create_tables2'
	$scope.pageVar.pageParent.params = function(){
		return "?folderId=" +
		$scope.doc_data_workdata.docHead.folderId +
				""
		//$scope.doc_data_workdata.tableRoot.folderId +
//				return "?tableId=" +
//				$scope.request.parameters.jsonId +
//				""
	}
	init_j2c_json_editor($scope, $http, $filter)

	if($scope.request.parameters.jsonId)
		var docId = $scope.request.parameters.jsonId
	else if($scope.tables.list[0].doc_id)
		var docId = $scope.tables.list[0].doc_id
	$scope.doc_data_workdata = {docId : docId, docHead:{}}
	console.log($scope.doc_data_workdata)
	$scope.doc_data.docId = docId
	console.log(docId)
	$scope.doc_data.readData({docId:docId}, $scope.doc_data_workdata)
	//$scope.doc_data.readData({docId:docId}, $scope.doc_data)
	$scope.doctypes_level2 = {
		sql:sql_1c.read_doctypes_level2(),
		afterRead:function(){
			$scope.doctypes_level2.map = {}
			angular.forEach($scope.doctypes_level2.list, function (v){
				$scope.doctypes_level2.map[v.doctype_id] = v
			})
			//console.log($scope.doctypes_level2.sql)
			delete $scope.doctypes_level2.sql
			delete $scope.doctypes_level2.list
		},
	}
	readSql($scope.doctypes_level2)
	$scope.element_types = readSql({
		sql:sql_1c.read_element_types()
	})
//	console.log(sql_1c.read_element_types())
	$scope.doc_links = readSql({
		sql:sql_1c.read_doc_links(),
		jsonId:$scope.request.parameters.jsonId,
	})
	console.log(sql_1c.read_complex_types())
	$scope.complex_types = readSql({
		sql:sql_1c.read_complex_types(),
		afterRead:function(){
			if(!$scope.complex_types.map)
				$scope.complex_types.map={}
			angular.forEach($scope.complex_types.list, function (v){
				$scope.complex_types.map[v.doc_id] = v
				$scope.doc_data.readData({
					docId:v.parent,
					afterRead:function(){
						if(v.elementsMap[v.doc_id]){
							if(!v.children){
								v.children = v.elementsMap[v.doc_id].children
							}
						}
					},
				}, v)
			})
		}
	})
//	console.log($scope.complex_types)

	$scope.pageVar.config.viewConfigPart='element_type'
})

sql_1c.read_complex_types = function(){
	return "SELECT value complex_type_name, y.* FROM ( \n" +
	"SELECT * FROM doc, string WHERE string_id=doc_id AND parent = 57405 \n" +
	") x LEFT JOIN doc y ON x.doc_id=y.parent AND y.doctype=18"
}
sql_1c.read_doc_links = function(){
	return "SELECT s2.*,d2.parent FROM doc d1, doc d2, string s2 " +
	"WHERE string_id=d2.doc_id AND d2.doctype=55 AND d2.parent=d1.doc_id AND d1.parent=:jsonId"
}
sql_1c.read_doctypes_level2 = function(){
	return "SELECT d.*, p1.doctype p1_doctype, p1.doctype_id p1_doctype_id " +
	"FROM doctype d left join doctype p1 on p1.doctype_id=d.parent_id"
}
sql_1c.read_element_types = function(){
	return "SELECT * FROM (" +
	"SELECT d1.*, d2.doctype doctype2, d2.doctype_id doctype2_id " +
	"FROM doctype d1 LEFT JOIN doctype d2 ON d2.parent_id=d1.doctype_id WHERE d1.parent_id =18 " +
	"UNION SELECT d1.*, null, null FROM doctype d1 where doctype_id=18) x ORDER BY doctype_id, doctype2_id"
}
