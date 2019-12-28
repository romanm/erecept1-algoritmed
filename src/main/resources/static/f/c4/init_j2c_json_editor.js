var init_j2c_table_editor = function($scope, $http, $filter){
	$scope.cp = {}

	$scope.cp.clickTree = function(el){
		el.isClosedTree = !el.isClosedTree
		console.log(el.parent, el.doc_id, el, el.children)
//		console.log(el.parent, el, $scope.datadictionary.elementsMap[el.parent])
		if(!el.children){
			var sql = sql_1c.doc_read_elements_0() + ' ORDER BY sort LIMIT 200'
			sql = sql.replace(':docId', el.doc_id)
			readSql({ sql:sql, afterRead:function(response){
				console.log(response.data.list.length, response.data.list, el)
				if(response.data.list.length>0){
					angular.forEach(response.data.list, function(v){
						$scope.doc_data_workdata.elementsMap[v.doc_id] = v
					})
					el.children = response.data.list
					el.isClosedTree = false
				}
			}})
		}
	}

	$scope.saveJsonDocBody = function(){
		console.log($scope.doc_data_workdata.tableRoot.docRoot)
	}

	$scope.cp.copy = function(el, data_type){
		el.data_type = data_type
		this.copyEl = el
		console.log(this, this.copyEl)
		var i=0, parentEl = $scope.doc_data_workdata.elementsMap[this.copyEl.parent]
		while(parentEl){
			if(++i>5) break
			if('DataDictionary'==parentEl.value){
				el.data_type = 'DataDictionary'
				break
			}
			parentEl = $scope.doc_data_workdata.elementsMap[parentEl.parent]
		}
		console.log(parentEl)
		if(true) return
		exe_fn.httpPost({url:'/copy',
			data:$scope.cp.copyEl,
			then_fn:function(response) {
				console.log(response.data)
			},
		})
	}

	$scope.cp.cut = function(el, copy_type){
		this.cutEl = el
		if(copy_type)
			this.cutEl.copy_type = copy_type
		console.log(this)
	}

	$scope.cp.paste = function(el){
		console.log(this)
		this.pasteEl = el
		var data = {}
		if(this.pasteEl){
			if(this.pasteEl.folderId){
				console.log(this)
				if(this.cutEl){
					if(true||this.cutEl.folderId){
						data.doc_id = this.cutEl.doc_id,
						data.parent = this.pasteEl.folderId,
						data.sql = sql_1c.doc_cutPaste_elements(),
						console.log(data)
						if(true) return
						writeSql(data)
					}
				}
			}
		}
	}

	$scope.pageVar.openEditRow2=function(o, rowObj){
		this.rowObj = rowObj
		this.openEditRow(o)
	}

	$scope.pageVar.openEditRow=function(o){
		console.log(this)
		this.openModal(o)
		this.rowKeyObj = o.col_links[Object.keys(o.col_links)[0]]
		this.rowKey =
			$scope.request.parameters[this.rowKeyObj.k]
		if(this.rowKey){
			if(!this.rowObj)
			angular.forEach(o.list,function(v){
				if($scope.pageVar.rowKey == v[$scope.pageVar.rowKeyObj.vk]){
					$scope.pageVar.rowObj = v
				}
			})
			console.log($scope.pageVar)
			console.log($scope.pageVar.rowObj)
			angular.forEach($scope.create_tables.colMap,function(v,k){
//			angular.forEach($scope.pageVar.o.colMap,function(v,k){
				if('timestamp' == v.fieldtype){
					var fieldName = 'col_'+v.column_id
					var ds = $scope.pageVar.rowObj[fieldName]
					console.log(ds)
					$scope.pageVar.rowObj[fieldName+'_ed']
					= $filter('date')(ds, 'shortDate')
					+ ' '
					+ $filter('date')(ds, 'HH:mm')
					console.log(k)
					console.log(v)
				}
			})
		}
	}

	$scope.pageVar.addRow=function(o){
		this.openModal(o)
	}
	$scope.pageVar.openModal=function(o){
		console.log(o)
		this.o = o
		this.ngStyleModal = {display:'block'}
		this.rowKey = -1
		$scope.table_types = {}
		readSql({ sql:sql_1c.table_types() }, $scope.table_types)
		console.log(sql_1c.table_types())
		console.log($scope.table_types)
	}


}
var init_j2c_json_editor = function($scope, $http, $filter){
	init_j2c_table_editor($scope, $http, $filter)


$scope.pageVar.config.openDatadictionary = function(){
	$scope.pageVar.config.viewConfigPart='datadictionary'
	console.log($scope.datadictionary)
}

	$scope.cp.paste = function(el){
		this.pasteEl = el
		console.log(this)
		if(false)
		exe_fn.httpGet({url:'/copy',
			then_fn:function(response){
				console.log(response.data)
			},
			error_fn:function(response){
				console.error('-----error-----------')
				console.error(response.data)
			},
		})

		var copyElement = function(copyEl, parent){
			console.log(copyEl)
			var data = {
				parent : parent,
				doctype : copyEl.doctype,
				sql:"INSERT INTO doc (doc_id,parent,doctype) VALUES (:nextDbId1, :parent, :doctype); ",
				dataAfterSave:function(response){
					console.log(response.data)
					angular.forEach(copyEl.children, function(v){
						copyElement(v, response.data.nextDbId1)
					})
				}
			}
			console.log(copyEl.sort+'/'+copyEl.doc_id)
			if(copyEl.sort_id){
				data.sort = copyEl.sort
				data.sql += "\n INSERT INTO sort (sort_id, sort) VALUES (:nextDbId1, :sort); "
			}
			if(copyEl.string_id){
				data.value = copyEl.value
				data.sql += "\n INSERT INTO string (string_id, value) VALUES (:nextDbId1, :value); "
			}
			if(copyEl.reference){
				data.reference = copyEl.reference
				data.sql += "\n UPDATE doc SET reference = :reference WHERE doc_id=:nextDbId1; "
			}
			console.log(data)
			writeSql(data)
		}

		if(this.cutEl){
			var data = {
				doc_id : this.cutEl.doc_id,
				parent : this.pasteEl.doc_id,
			}
			data.sql = "UPDATE doc SET parent = :parent WHERE doc_id = :doc_id"
			console.log(data)
			writeSql(data)
		}else
		if(this.copyEl){
			console.log(this.copyEl)
			if(this.copyEl.data_type=='this_document'){
				console.log(123)
				copyElement(this.copyEl, this.pasteEl.doc_id)
			}else if(this.copyEl.data_type=='DataDictionary'){
				var data = {
					reference : this.copyEl.doc_id,
					doc_id : this.pasteEl.doc_id,
				}
				data.sql = "UPDATE doc SET reference = :reference WHERE doc_id = :doc_id"
				console.log('reference', data)
				writeSql(data)
			}else if(this.copyEl.data_type){
				var data = {
						doc_id : this.pasteEl.doc_id,
				}
				if(this.copyEl.doctype_id){
					var doctype = this.copyEl.doctype_id
					if(this.copyEl.doctype2_id)
						doctype = this.copyEl.doctype2_id
						data.doctype = doctype
						data.sql = sql_1c.doc_update_doctype()
				}else{
					data.reference = this.copyEl.doc_id
					data.sql = sql_1c.doc_update_doc_reference()
				}
				console.log(data)
//				if(true) return
//				writeSql(data)
			}else{// INSERT ELEMENT
				console.log(this)
				copyElement(this.copyEl, this.pasteEl.doc_id)
			}
		}
		
		
	}

$scope.changeElement = {}
$scope.changeElement.changeJSON = function(){
	console.log(this.docbody)
	this.docbodyJSON = JSON.parse(this.docbody)
	console.log(this.docbodyJSON)
}
$scope.changeElement.saveUpdate = function(){
	console.log(this.o)
	console.log(this)
	var data = {
		value:this.name,
		string_id:this.o.doc_id,
		sql:sql_1c.doc_insert_string(),
	}
	if(this.o.string_id){
		data.sql = sql_1c.doc_update_string()
	}
	console.log(data)
	writeSql(data)
}

$scope.changeElement.openDialog = function(o){
	this.ngStyleModal = {display:'block'}
	console.log(o)
	this.o = o
	this.name = o.value
}

$scope.doc_data = {}
$scope.doc_data.addElement=function(o){
	console.log(o)
	var parentId = o.doc_id
	var data = {
		sql : sql_1c.doc_insert_elements(),
		parentId : parentId,
		dataAfterSave:function(){
			console.log(123)
		}
	}
	writeSql(data)
}
$scope.doc_data.downElement = function(o){this.upDowntElement(o, 1)}
$scope.doc_data.upElement = function(o){this.upDowntElement(o, -1)}
$scope.doc_data.upDowntElement = function(o, direction){
//	var oParent = this.elementsMap[o.parent]
		var oParent = $scope.doc_data_workdata.elementsMap[o.parent]
		console.log(o, oParent, $scope.doc_data_workdata.elementsMap)
		var position = oParent.children.indexOf(o)
		console.log(position)
		console.log(direction)
		if((position +1 == oParent.children.length) && direction == 1){// зробити першим
			var x = oParent.children.splice(position, 1)
			console.log(x)
			oParent.children.splice(0, 0, x[0])
		}else if((position == 0) && direction == -1){// зробити останнім
			console.log('зробити останнім')
			var x = oParent.children.splice(position, 1)
			oParent.children.push(x[0])
		}else{
			var x = oParent.children.splice(position, 1)
			oParent.children.splice(position + direction, 0, x[0])
		}
		angular.forEach(oParent.children, function(v,k){
			var data = {
				sort:k,
				sort_id:v.doc_id,
			}
			if(v.sort_id)
				data.sql = sql_1c.doc_update_sort()
			else
				data.sql = sql_1c.doc_insert_sort()
			writeSql(data)
			}
		)
	}
$scope.doc_data.pasteElement=function(o){
		if(this.cutObject){
			var data = {
				sql : sql_1c.doc_cutPaste_elements(),
				parent : o.parent,
				doc_id : this.cutObject.doc_id,
			}
			writeSql(data)
			console.log(data)
		}
	}
$scope.doc_data.cutElement=function(o){
		this.cutObject = o
	}
$scope.doc_data.minusElement=function(o){
		console.log(o)
		var data = {
			sql : sql_1c.remove_doc_record(),
			doc_id : o.doc_id,
		}
		writeSql(data)
	}

$scope.doc_data.readData = function(param, readDocData){
//	console.log(param)
//	console.log(readDocData)
	if(!param.readChildLevel){
		param.readChildLevel = 0
		readDocData.tableRoot = {}
		if($scope.tables)
		if($scope.tables.list[0]){
			readDocData.tableRoot = $scope.tables.list[0]
			readSql({ 
				sql:"SELECT * FROM doc WHERE doctype=47 AND parent="+readDocData.tableRoot.parent,
				afterRead:function(response){
					console.log(response.data)
				}
			})
		}
		readDocData.elementsMap = {}
	}
//	console.log(param.readChildLevel)
	if(sql_1c['doc_read_elements_'+param.readChildLevel]){
		var sql = sql_1c['doc_read_elements_'+param.readChildLevel]()
		sql += ' ORDER BY sort'
		param.sql=sql
		/*
		if($scope.request.parameters.jsonId == readDocData.docId)
			console.log(param.readChildLevel, $scope.request.parameters.jsonId, readDocData.docId, readDocData.doc_id, readDocData)
	console.log($scope.tables.list[0])
	console.log(param_readDoc)
	console.log(param_readDoc.doc_id)
		readSql(param_readDoc, o)
		 */
		readSqlToObjData(param, $scope.doc_data, readDocData, $scope)
	}
}

$scope.doc_data.afterRead=function(response, param, readDocData){
//		console.log(param)
//		console.log($scope.doc_data.tableRoot)
		//console.log($scope.tables)
		readDocData.list = response.data.list
		//console.log(readDocData.list)
		if(0==param.readChildLevel){
//			console.log(readDocData)
			if(!readDocData.list[0] && $scope.tables){
//				this.addElement($scope.tables.list[0])
			}
		}
		if(readDocData.list[0]){
			angular.forEach(readDocData.list, function(v){
				cleanNull(v)
				readDocData.elementsMap[v.doc_id] = v
				if(readDocData.elementsMap[v.parent]){
					if(!readDocData.elementsMap[v.parent].children)
						readDocData.elementsMap[v.parent].children = []
					readDocData.elementsMap[v.parent].children.push(v)
				}
				//console.log($scope.doc_data.tableRoot.docRoot)
				if(0==param.readChildLevel){
					if(v.doctype==18)
						readDocData.tableRoot.docRoot = v
				}
			})
			param.readChildLevel++
//			console.log(this)
			this.readData(param, readDocData)
		}else{
			if(param.readChildLevel > 0){
//				console.log(param.readChildLevel)
				readSql({
					sql:sql_1c.doc_read_docName(),
					doc_id : $scope.request.parameters.jsonId,
					afterRead:function(response){
//						console.log(response.data)
						if(response.data.list[0]){
							$scope.doc_data_workdata.docHead.value = response.data.list[0].value
							$scope.doc_data_workdata.docHead.doctype = response.data.list[0].doctype
							$scope.doc_data_workdata.docHead.folderId = response.data.list[0].parent
							/*
						readDocData.tableRoot.value = response.data.list[0].value
						readDocData.tableRoot.doctype = response.data.list[0].doctype
						readDocData.tableRoot.folderId = response.data.list[0].parent
						console.log(readDocData.tableRoot)
						}
*/
					}
					}
				})
			}
		}
	}

$scope.datadictionary = {}
//console.log($scope.datadictionary)
var ddocId = 5036
$scope.doc_data.readData({docId:ddocId}, $scope.datadictionary)
//	console.log($scope.doc_data)

}
sql_1c.doc_read_docName = function(){
	return "SELECT * FROM doc, string where doc_id=string_id and doc_id=:doc_id"
}
sql_1c.doc_read_elements_7 = function(){
	return this.doc_read_elements() +
	"(SELECT d7.doc_id FROM doc d, doc d0, doc d1, doc d2, doc d3, doc d4, doc d5, doc d6, doc d7 " +
	"WHERE d.doc_id=:docId AND d0.parent=d.doc_id " +
	"AND d1.parent=d0.doc_id " +
	"AND d2.parent=d1.doc_id " +
	"AND d3.parent=d2.doc_id " +
	"AND d4.parent=d3.doc_id " +
	"AND d5.parent=d4.doc_id " +
	"AND d6.parent=d5.doc_id " +
	"AND d7.parent=d6.doc_id " +
	")"
}
sql_1c.doc_read_elements_6 = function(){
	return this.doc_read_elements() +
	"(SELECT d6.doc_id FROM doc d, doc d0, doc d1, doc d2, doc d3, doc d4, doc d5, doc d6 " +
	"WHERE d.doc_id=:docId AND d0.parent=d.doc_id " +
	"AND d1.parent=d0.doc_id " +
	"AND d2.parent=d1.doc_id " +
	"AND d3.parent=d2.doc_id " +
	"AND d4.parent=d3.doc_id " +
	"AND d5.parent=d4.doc_id " +
	"AND d6.parent=d5.doc_id " +
	")"
}
sql_1c.doc_read_elements_5 = function(){
	return this.doc_read_elements() +
	"(SELECT d5.doc_id FROM doc d, doc d0, doc d1, doc d2, doc d3, doc d4, doc d5 " +
	"WHERE d.doc_id=:docId AND d0.parent=d.doc_id " +
	"AND d1.parent=d0.doc_id " +
	"AND d2.parent=d1.doc_id " +
	"AND d3.parent=d2.doc_id " +
	"AND d4.parent=d3.doc_id " +
	"AND d5.parent=d4.doc_id " +
	")"
}
sql_1c.doc_read_elements_4 = function(){
	return this.doc_read_elements() +
	"(SELECT d4.doc_id FROM doc d, doc d0, doc d1, doc d2, doc d3, doc d4 " +
	"WHERE d.doc_id=:docId AND d0.parent=d.doc_id " +
	"AND d1.parent=d0.doc_id " +
	"AND d2.parent=d1.doc_id " +
	"AND d3.parent=d2.doc_id " +
	"AND d4.parent=d3.doc_id " +
	")"
}
sql_1c.doc_read_elements_3 = function(){
	return this.doc_read_elements() +
	"(SELECT d3.doc_id FROM doc d, doc d0, doc d1, doc d2, doc d3 " +
	"WHERE d.doc_id=:docId AND d0.parent=d.doc_id " +
	"AND d1.parent=d0.doc_id " +
	"AND d2.parent=d1.doc_id " +
	"AND d3.parent=d2.doc_id " +
	")"
}
sql_1c.doc_read_elements_2 = function(){
	return this.doc_read_elements() +
	"(SELECT d2.doc_id FROM doc d, doc d0, doc d1, doc d2 " +
	"WHERE d.doc_id=:docId AND d0.parent=d.doc_id " +
	"AND d1.parent=d0.doc_id " +
	"AND d2.parent=d1.doc_id " +
	")"
}
sql_1c.doc_read_elements_1 = function(){
	return this.doc_read_elements() +
	"(SELECT d1.doc_id FROM doc d, doc d0, doc d1 " +
	"WHERE d.doc_id=:docId AND d0.parent=d.doc_id " +
	"AND d1.parent=d0.doc_id " +
	")"
}
sql_1c.doc_read_elements_0 = function(){
	return this.doc_read_elements() +
	"(SELECT d0.doc_id FROM doc d, doc d0 " +
	"WHERE d.doc_id=:docId AND d0.parent=d.doc_id)"
}

sql_1c.doc_read_elements = function(){
	return "SELECT * FROM doc d1 \n" +
	"LEFT JOIN string ON string_id=d1.doc_id \n" +
	"LEFT JOIN (SELECT *, value s_u FROM string_u) string_u ON string_u_id=d1.doc_id \n" +
	"LEFT JOIN docbody ON docbody_id=d1.doc_id \n" +
	"LEFT JOIN sort ON sort_id=d1.doc_id \n" +
	"LEFT JOIN (SELECT double_id, value vreal FROM double) r ON double_id=d1.doc_id \n" +
	"LEFT JOIN (SELECT doc_id, s.value string_reference FROM doc LEFT JOIN string s ON string_id=doc_id ) d2 ON d2.doc_id=d1.reference \n" +
	"LEFT JOIN (SELECT doc_id, s.value s_u_reference FROM doc LEFT JOIN string_u s ON string_u_id=doc_id ) d2u ON d2u.doc_id=d1.reference \n" +
	"LEFT JOIN (SELECT doc_id, s.value string_reference2 FROM doc LEFT JOIN string s ON string_id=doc_id ) d3 ON d3.doc_id=d1.reference2 \n" +
	"LEFT JOIN (SELECT inn_id, inn inn_reference2 FROM inn ) n2 ON n2.inn_id=d1.reference2 \n" +
	"WHERE d1.doc_id IN "
	}
sql_1c.doc_insert_string = function(){
	return "INSERT INTO string (value,string_id) VALUES (:value,:string_id)"
}
sql_1c.doc_update_doctype = function(){
	return "UPDATE doc SET doctype=:doctype " +
	"WHERE doc_id=:doc_id"
}
sql_1c.doc_update_doc_reference = function(){
	return "UPDATE doc SET reference=:reference " +
	"WHERE doc_id=:doc_id"
}
sql_1c.doc_cutPaste_elements = function(){
	return "UPDATE doc SET parent = :parent " +
	"WHERE doc_id=:doc_id"
}
sql_1c.doc_update_string = function(){
	return "UPDATE string SET value=:value WHERE string_id=:string_id"
}
sql_1c.doc_insert_sort = function(){
	return "INSERT INTO sort (sort,sort_id) VALUES (:sort,:sort_id)"
}
sql_1c.doc_update_sort = function(){
	return "UPDATE sort SET sort=:sort WHERE sort_id=:sort_id"
}
sql_1c.doc_insert_elements = function(){
	return "INSERT INTO doc (parent, doctype) VALUES (:parentId, 18)"
}
sql_1c.remove_doc_record = function(){
	return "DELETE FROM doc WHERE doc_id = :doc_id "
}
sql_1c.table_types = function(){
	return "SELECT doc_id fieldtype_id, * FROM doc, string " +
			"WHERE doc_id=string_id and reference is null and doctype=8"
}
sql_1c.table_update = function(){
	return "UPDATE string SET value =:value WHERE string_id=:string_id ;"
}
