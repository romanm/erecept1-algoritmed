var app = angular.module('myApp', ['ngSanitize']);
var ctrl
var initApp = function($scope, $http){
	$scope.elementsMap = {}
	ctrl.elementsMap = $scope.elementsMap
	$scope.referencesMap = {}
	$scope.referenceElementPaars = {}
	build_request($scope)
	$scope.fn = {}
	$scope.fn.getTimestamp = function(ts){
		var d = new Date(ts)
		return d
	}
	exe_fn = new Exe_fn($scope, $http);
	exe_fn.httpGet_j2c_table_db1_params_then_fn = function(params, then_fn){
		return {
			url : '/r/url_sql_read_db1',
			params : params,
			then_fn : then_fn,
	}	}

	json_to_map = function(jsonDoc){
		json_elementsMap(jsonDoc, $scope.elementsMap, $scope.referencesMap)
	}

	$scope.isGender = function (o){
		if($scope.referenceElementPaars[85370]){
			var gender = $scope.elementsMap[$scope.elementsMap[$scope.referenceElementPaars[85370]].reference2]
			if(gender){
				var evl = eval('"'+gender.string + '"=="' +o.children[1].value+'"')
				o.calcIf = evl
				return o.calcIf
			}
		}
	}

	$scope.calcAgeGroup = function (o){
		var age = $scope.getAgeOfPatient()
		var evl = eval(age+o.children[0].value+o.children[1].value)
		o.calcIf = evl
		return o.calcIf
	}

	$scope.getGenderOfPatient = function (){
		var g = $scope.elementsMap[$scope.elementsMap[$scope.referenceElementPaars[85370]].reference2].string
		return g
	}

	$scope.getAgeOfPatient = function (){
		if($scope.referenceElementPaars[85247]){
			var d1 = $scope.elementsMap[$scope.referenceElementPaars[85247]].date
			return $scope.getAge(d1)
		}
	}

	$scope.getAge = function (d1, d2){
		if(d1){
			dd1=new Date(d1)
			d2 = d2 || new Date();
			var diff = d2.getTime() - dd1.getTime();
			return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
		}
	}
	
}

var initEdit_table = function($scope, $http){
	$scope.edit_table = {}
	console.log($scope.edit_table)
	$scope.edit_table.saveEditRow = function(){
//		this.editRow.row_id = this.editRow['row_'+$scope.request.parameters.tableId+'_id']
		//console.log(this)
		//console.log(this.editRow)
		if(this.editRow){
			if(this.editRow.row_id && this.editRow.row_id!=0){
				saveRow(this.editRow)
			}else{//INSERT row
				saveRow(this.editRow, true)
			}
		}
	}

	$scope.edit_table.addRow = function(table_id, table_data){
		var rowAttName = 'row_'+table_id+'_id'
		if(table_data[0][rowAttName]==0){
			this.newRow = table_data[0]
		}else{
			this.newRow = {}
			this.newRow[rowAttName] = 0
			table_data.splice(0,0,this.newRow)
		}
		console.log(this.newRow)
		this.selectedRow = this.newRow
		$scope.edit_table.editRow = this.newRow
//		initEditRow()
	}

	$scope.edit_table.selectRow = function(row){
		this.selectedRow = row
		console.log($scope.edit_table.selectedRow)
	}

	$scope.edit_table.cancelEditRow = function(){
		delete $scope.edit_table.editRow
		delete $scope.edit_table.newRow
	}

	elementData.open_col_85370 = function(o){
		angular.forEach($scope.referencesMap[85367].children, function(v){
			if(v.string == o){
				$scope.edit_table.editRow.gender_id = v.doc_id
			}
		})
	}

	$scope.edit_table.setEditRow = function(table_id){
		console.log(this.selectedRow)
		$scope.edit_table.editRow = this.selectedRow
		angular.forEach($scope.edit_table.editRow, function(v, k){
//			console.log(k, v, elementData)
			if('col_85247'==k){
				$scope.edit_table.editRow.start_col_85247 = v
			}
			if(elementData['open_'+k])
				elementData['open_'+k](v)
		})
	}

	$scope.edit_table.saveEditRow = function(rowParentId){
		this.editRow.row_id = this.editRow['row_'+saveRow.tableId+'_id']
		//console.log(this.editRow)
		if(this.editRow.row_id){
			saveRow.saveRow(this.editRow)
		}else{//INSERT row
			saveRow.saveRow(this.editRow, rowParentId)
		}
	}
}

function readRef($scope){
	console.log('readRef', $scope.referencesMap)
	angular.forEach($scope.referencesMap, function(v,k){
		if(!v){
//			console.log(k, exe_fn)
			exe_fn.jsonTree.readTree(k, null, function(o){
				console.log(o)
				$scope.referencesMap[k] = o
			})
//			console.log(k, sql_amk025.read_obj_from_docRoot())
			readSql({
				sql:sql_amk025.read_obj_from_docRoot(),
				jsonId:k,
				afterRead:function(response){
					if(!$scope.referencesMap[k]){
//						console.log(k)
						if(response.data.list[0]){
							var jsonDoc = JSON.parse(response.data.list[0].docbody)
							console.log(k, jsonDoc)
							json_elementsMap(jsonDoc.docRoot, $scope.elementsMap, $scope.referencesMap)
						}
					}
				}
			})
		}
	})
}

function replaceParams(params){
//	console.log(params.sql)
	angular.forEach(params.sql.split(':'), function(v,k){
		if(k>0){
			var p = v.split(' ')[0].replace(')','').replace(',','').replace(';','').trim()
			var pv = params[p]
//			console.log(p+' = '+pv)
			if(pv){
				params.sql = params.sql.replace(':'+p, "'"+pv+"'")
			}
		}
	})
//	console.log(params.ts_value)
//	console.log(params)
//	console.log(params.sql)
}

function readSql(params, obj){
	replaceParams(params)
	if(!obj) obj = params
	exe_fn.httpGet(exe_fn.httpGet_j2c_table_db1_params_then_fn(
	params,
	function(response) {
		obj.list = response.data.list
		if(obj.afterRead){
			obj.afterRead(response)
		}else if(params.afterRead){
			params.afterRead(response)
		}
	}))
}

var writeSql = function(data){
	replaceParams(data)
	exe_fn.httpPost
	({	url:'/r/url_sql_read_db1',
		then_fn:function(response) {
//			console.log(response.data)
			if(data.dataAfterSave)
				data.dataAfterSave(response)
		},
		data:data,
	})
}

var sql_1c = {}
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
	return "SELECT * FROM doc d1" +
	"\n LEFT JOIN (SELECT value string, string_id FROM string) string ON string_id=doc_id " +
	"\n LEFT JOIN (SELECT value date, date_id FROM date) date ON date_id=doc_id " +
	"\n LEFT JOIN (SELECT value ts, timestamp_id FROM timestamp) timestamp ON timestamp_id=doc_id " +
	"\n LEFT JOIN (SELECT value vinteger, integer_id FROM integer) integer ON integer_id=doc_id " +
	"\n LEFT JOIN (SELECT value vdouble, double_id FROM double) double ON double_id=doc_id " +
	"\n LEFT JOIN docbody ON docbody_id=doc_id " +
	"\n LEFT JOIN (SELECT doc_id, r.value real_reference FROM doc, double r WHERE double_id=doc_id ) r2 ON r2.doc_id=d1.reference " +
	"\n LEFT JOIN (SELECT doc_id, s.value string_reference FROM doc LEFT JOIN string s ON string_id=doc_id ) d2 ON d2.doc_id=d1.reference " +
	"\n LEFT JOIN (SELECT doc_id, s.value string_reference2 FROM doc LEFT JOIN string s ON string_id=doc_id ) d3 ON d3.doc_id=d1.reference2 " +
	"\n LEFT JOIN (SELECT inn_id, inn inn_reference2 FROM inn ) n2 ON n2.inn_id=d1.reference2 " +
	"LEFT JOIN sort ON sort_id=d1.doc_id " +
	"WHERE d1.doc_id IN "
}

readAmk = function($scope){
	console.log(new Date(1548013371088))
	console.log($scope.elementsMap)
	readSql({
		sql:sql_amk025.amk025_template(),
		jsonId:85085,
		afterRead:function(response){
			$scope.amk025_template = JSON.parse(response.data.list[0].docbody)
			console.log('amk_template '+$scope.amk025_template.docRoot.doc_id , $scope.amk025_template)
			json_elementsMap($scope.amk025_template.docRoot, $scope.elementsMap, $scope.referencesMap)
			readRef($scope)
			if($scope.request.parameters.amk){
				console.log('-------amk-------',$scope.request.parameters.amk, $scope)
				exe_fn.jsonTree.readTree($scope.request.parameters.amk, 'doc_'+$scope.request.parameters.amk)
			}
//			console.log($scope.elementsMap)
		}
	})
}

var elementData = {}

function Daybook($scope, $http){

	$scope.elementNoteDialog = {
		elementId:0, style:{display:'none'},
	}
	$scope.elementNoteDialog.remove = function(){
		console.log(this)
		var data = {
			doc_id:this.o.doc_id,
			sql:"DELETE FROM doc WHERE doc_id IN (SELECT d3.doc_id FROM doc d1, doc d2, doc d3 " +
			" WHERE d3.parent = d2.doc_id AND d2.parent = d1.doc_id AND d1.parent = :doc_id);\n " +
			"DELETE FROM doc WHERE doc_id IN (SELECT d2.doc_id FROM doc d1, doc d2 " +
			" WHERE d2.parent = d1.doc_id AND d1.parent = :doc_id);\n " +
			"DELETE FROM docbody WHERE docbody_id = :doc_id;\n " +
			"DELETE FROM doc WHERE :doc_id IN (parent, doc_id);"
		}
		console.log(data)
		writeSql(data)
		
	}
	$scope.elementNoteDialog.save = function(){
		$scope.saveDataDocbody(this)
	}
	$scope.elementNoteDialog.close = function(){
		this.style		= {display:'none'}
	}
	$scope.elementNoteDialog.open = function(o){
		console.log(this)
		this.o				= o
		this.elementId		= o.doc_id
		if(!$scope.elementNoteDialog.docBodyElementId)
			this.style			= {display:'block'}
		var amkElId			= o.doc_id
		var patientAmkEl	= $scope.elementsMap[$scope.referenceElementPaars[amkElId]]
		if(patientAmkEl){
			this.note		= patientAmkEl.docbody
		}else{
			delete this.note
		}
	}

	elementData.init_85357 = function(o,data){
		o.at = {}
		angular.forEach($scope.elementsMap[o.reference].children, function(v){
			angular.forEach(o.children, function(d){
				if(d.reference==v.doc_id){
					o.at[v.doc_id] = d
				}
			})
		})
	}


	elementData.open_86973 = function(o,data){
		console.log(o, $scope.elementsMap[o.reference], data)
	}

	elementData.open_86811 = function(o,data){
		elementData.open_85357(o,data)
	}

	elementData.open_85357 = function(o,data){
		elementData.init_85357(o)
		angular.forEach($scope.elementsMap[o.reference].children, function(v){
			if(o.at[v.doc_id])
				v.int = o.at[v.doc_id].vinteger
		})
	}

	$scope.edit_data_ids = [86973, 86811, 85357]
	$scope.view_data_ids = [85357]

	elementData.save_86811 = function(o,data){
		console.log(o.children, $scope.elementsMap[o.reference].children)
		elementData.save_85357(o,data)
	}

	elementData.save_85357 = function(o,data){
		console.log(o.children, $scope.elementsMap[o.reference].children)
		data.nextDbIdNr 
		elementData.init_85357(o,data)
		angular.forEach($scope.elementsMap[o.reference].children, function(v){
			console.log(v)
			d = o.at[v.doc_id]
			if(d){
				if(v.int){
					data.sql += "UPDATE integer SET value = "+v.int+" WHERE integer_id = "+d.doc_id+"; "
				}else{
					data.sql += "DELETE FROM doc WHERE doc_id = "+d.doc_id+"; "
				}
			}else{
				if(v.int){
					data.sql += "INSERT INTO doc (doc_id, reference, parent) " +
					"VALUES(:nextDbId"+data.nextDbIdNr+", "+v.doc_id+", "+o.doc_id+" ); " +
					"INSERT INTO integer (integer_id, value) " +
					"VALUES (:nextDbId"+data.nextDbIdNr+", "+v.int+"); "
					data.nextDbIdNr++
				}
			}
		})
	}

	var removeElementDayBook = function(o){
		console.log(o)
		var data = o
		data.sql = "DELETE FROM doc WHERE doc_id=:doc_id; "
		writeSql(data)
	}
	$scope.removeElementDayBook = removeElementDayBook

	elementData.save_86973 = function(o,data){// Холестерин загальний
		data.nextDbIdNr++
		data.sql += "INSERT INTO doc (doc_id, parent, reference, reference2) " +
		" VALUES (:nextDbId"+data.nextDbIdNr+", "+data.doc_id+", "+o.reference+", "+$scope.elementsMap[o.reference].children[0].doc_id+" ); "
		data.sql += "\n INSERT INTO double (double_id, value) " +
		" VALUES (:nextDbId"+data.nextDbIdNr+", "+o.real_value+"); "
		console.log(o, data, $scope.elementsMap[o.reference]
		, $scope.elementsMap[o.reference].children[0]
		, data.sql)
	}

	var saveElementDocBody = function(o){
		var data = o
//		data.nextDbIdNr=1
		data.nextDbIdNr=0
		if(data.docbody_id){
			data.sql = "UPDATE docbody SET docbody = :docbody WHERE docbody_id=:doc_id; "
		}else{
			data.sql = "INSERT INTO docbody (docbody_id, docbody) VALUES (:doc_id, :docbody); "
		}
		console.log(o.reference, $scope.elementsMap[o.reference], $scope.elementsMap[o.reference].children[0])
		if(elementData['save_'+o.reference])
			elementData['save_'+o.reference](o,data)
		angular.forEach($scope.elementsMap[o.reference].children, function(v){
			console.log(v.reference)
			if(elementData['save_'+v.reference])
				elementData['save_'+v.reference](v,data)
		})
		writeSql(data)
		delete $scope.elementNoteDialog.docBodyElementId
	}

	$scope.saveElementDocBody = saveElementDocBody

	var editElementDocBody = function(o){
		console.log(o, $scope.elementNoteDialog)
		if(!$scope.elementNoteDialog.docBodyElementId){
			$scope.elementNoteDialog.docBodyElementId = o.doc_id
		}else
		if($scope.elementNoteDialog.docBodyElementId != o.doc_id){
			$scope.elementNoteDialog.docBodyElementId = o.doc_id
		}else{
			delete $scope.elementNoteDialog.docBodyElementId
		}
		if(elementData['open_'+o.reference])
			elementData['open_'+o.reference](o)
	}
	$scope.editElementDocBody = editElementDocBody

	this.getDataElement = function(fnAfterSave){ 
		var o = {
			sql:"INSERT INTO doc (doctype, doc_id, parent, reference) " +
			" VALUES (18, :nextDbId1, :parent, :reference);\n " +
			"INSERT INTO docbody (docbody_id, docbody) VALUES (:nextDbId1, :docbody);\n ",
			dataAfterSave:function(response){
				console.log(response)
			},
		}
		if(fnAfterSave)
			o.dataAfterSave = fnAfterSave

		return o
	}

	$scope.addDaybook = function(fnAfterSave){
		console.log($scope.elementsMap[$scope.request.parameters.amk])
		var l1 = 85116 || $scope.request.parameters.l1
		var daybookDatatypeElement = $scope.elementsMap[$scope.elementsMap[l1].reference]
		console.log(daybookDatatypeElement)
		var amkPartEl = $scope.elementsMap[$scope.referenceElementPaars[l1]]
		//console.log(exe_fn)
		//console.log(exe_fn.daybook)
		var dataElement = exe_fn.daybook.getDataElement(fnAfterSave)
		dataElement.reference = daybookDatatypeElement.doc_id
		dataElement.sql += "INSERT INTO doc (doctype, doc_id, parent, reference) " +
		" VALUES (18, :nextDbId2, :nextDbId1, :reference2);\n " +
		"INSERT INTO timestamp (timestamp_id, value) VALUES (:nextDbId2, :ts_value);\n " +
		"INSERT INTO sort (sort_id, sort) VALUES (:nextDbId1, :sort); "
		console.log(dataElement.sql)
		var ts = new Date()
		dataElement.ts_value = ts.toISOString().substring(0,23).replace('T',' ')
//		dataElement.ts_value = ts.toISOString().replace('T',' ')
		dataElement.sort = ts.getTime()
		dataElement.docbody = ''
		dataElement.reference2 = daybookDatatypeElement.children[0].doc_id
		if(amkPartEl)
			dataElement.parent = amkPartEl.doc_id
		saveDataDocbody2(amkPartEl, dataElement)
	}

}

var saveDataDocbody2 = function(amkPartEl, dataElement){
	if(!amkPartEl){//INSERT part element
		console.log('------INSERT part element----------')
		insertWithPartElement(dataElement)
	}else{
		console.log('------update element----------')
		console.log(amkPartEl)
		console.log(dataElement)
		writeSql(dataElement)
	}
	
}

var insertWithPartElement = function(dataElement){
	var dataParentElement = {
			parent:$scope.request.parameters.amk,
			reference:$scope.request.parameters.l1,
			sql:"INSERT INTO doc (doctype, doc_id, parent, reference) VALUES (18, :nextDbId1, :parent, :reference);",
			dataAfterSave:function(response){
				console.log(response)
				console.log(response.data)
				console.log(response.data.nextDbId1)
				dataElement.parent = response.data.nextDbId1
				writeSql(dataElement)
			},
	}
	console.log(dataParentElement)
	writeSql(dataParentElement)
}

function JsonTree($scope, $http){
	this.readLinks = function(docId, docRootElement){
		readSql({
			docId:docId,
			sql:"SELECT d2.*, value FROM doc d1, doc d2, string" +
			" WHERE d1.parent=:docId " +
			" AND d2.doctype=55" +
			" AND d2.doc_id=string_id" +
			" AND d2.parent=d1.doc_id",
			afterRead:function(response){
				docRootElement.links = []
				angular.forEach(response.data.list, function(v){
					docRootElement.links.push(v)
				})
			}
		})
	}

	this.readTreeLevel = function(level, elementId){
//		console.log(level)
		var thisO = this
		if(sql_1c['doc_read_elements_'+level]){
			readSql({
				sql:sql_1c['doc_read_elements_'+level](),
				docId:elementId,
				afterRead:function(response){
					var list = response.data.list
					angular.forEach(list, function(el){
						el.l = level
						var p = $scope.elementsMap[el.parent]
						if(!p.children) p.children = []
						p.children.push(el)
						thisO.mapElement(el)
					})
					if(list[0]){
						thisO.readTreeLevel(++level, elementId)
					}
				}
			})
		}else{
			console.error('--bad level---------',level, sql_1c['doc_read_elements_'+level] )
			console.error( sql_1c['doc_read_elements_'+level]() )
		}
	}

	this.readDocBody = function(docId){
		var thisO = this
		if(!$scope.elementsMap[docId])
		readSql({
			sql:sql_amk025.amk025_template(),
			jsonId:docId,
			afterRead:function(response){
				var el = response.data.list[0]
				if(el){
					if(el.docbody){
						if(el.docbody.includes('SELECT')){
						}else if(!$scope.elementsMap[docId]){
							try{
								var docbodyDocument = JSON.parse(el.docbody).docRoot
								var docRootDoc = $scope.elementsMap[docId]
								if(!docRootDoc){
									docRootDoc = {doc_id:docId}
								}
								if(!docRootDoc.docRoot){
									docRootDoc.docRoot = docbodyDocument
								}
								$scope.elementsMap[docId] = docRootDoc
								console.log('readDocBody ',docId, docbodyDocument)
								thisO.mapTree(docbodyDocument)
								thisO.readLinks(docId, docbodyDocument)
							}catch(e){
								if (e instanceof SyntaxError) {
									console.error(e)
//								console.log(el)
								} else {
									console.log(e)
								}
			}	}	}	}	}
		})

	}

	this.mapElement = function(element){
		$scope.elementsMap[element.doc_id] = element
		if(element.reference){
//			console.log(element.reference, element)
			$scope.referenceElementPaars[element.reference] = element.doc_id
			this.readDocBody(element.reference)
		}
		if(element.reference2){
//				console.log($scope.referenceElementPaars)
//				console.log("------read reference2 -------------")
//				console.log(element.reference2, element)
			exe_fn.jsonTree.readTree(element.reference2)
		}
	}

	this.mapTree = function(el){
		$scope.elementsMap[el.doc_id] = el
		var thisO = this
		angular.forEach(el.children, function(v){
			thisO.mapTree(v)
		})
	}

	this.readTree = function(elementId, docName, fn){
//		console.log(sql_1c.doc_read_elements()+" (" +elementId +")")
		var thisO = this
		if(!$scope.elementsMap[elementId])
		readSql({
			sql:sql_1c.doc_read_elements()+" (" +elementId +")",
			afterRead:function(response){
				var el = response.data.list[0]
//				console.log('exe_fn.jsonTree.readTree '+el.doc_id, el)
				if(el && !$scope.elementsMap[el.doc_id]){
					thisO.mapElement(el)
					thisO.readTreeLevel(0, elementId)
					if(fn){
						fn(el)
					}
					if(docName){
						$scope[docName] = el
						console.log(elementId,'------readTree--------', el)
					}
				}
			}
		})
//		console.log(sql_1c.doc_read_elements_0())
	}

}


function Exe_fn($scope, $http){
	this.httpGet=function(progr_am){
		if(progr_am.error_fn)
			$http
			.get(progr_am.url, {params:progr_am.params})
			.then(progr_am.then_fn, progr_am.error_fn)
		else
			$http
			.get(progr_am.url, {params:progr_am.params})
			.then(progr_am.then_fn)
	}
	this.httpPost=function(progr_am){
		if(progr_am.error_fn)
			$http.post(progr_am.url, progr_am.data)
			.then(progr_am.then_fn, progr_am.error_fn)
		else
			$http.post(progr_am.url, progr_am.data)
			.then(progr_am.then_fn)
	}
}

function json_elementsMap(json, elementsMap, referencesMap){
	elementsMap[json.doc_id] = json
	if(json.reference){
		referencesMap[json.reference] = null
	}
	angular.forEach(json.children, function(v){
		json_elementsMap(v, elementsMap, referencesMap)
	})
}

function build_request($scope){
	$scope.request={};
	ctrl.request = $scope.request
	console.log($scope.request)
	$scope.request.path = window.location.pathname.split('.html')[0].split('/').reverse()
	$scope.request.parameters={};
	if(window.location.search.split('?')[1]){
		angular.forEach(window.location.search.split('?')[1].split('&'), function(value, index){
			var par = value.split("=");
			$scope.request.parameters[par[0]] = par[1];
		});
	}
}

var sql_amk025 = {}
sql_amk025.read_sql_from_docRoot = function(){
	return "SELECT * FROM doc, docbody  WHERE doc_id=docbody_id and doctype=19  AND parent=:jsonId AND reference = :tableId "
}
sql_amk025.amk025_template = function(){
	return "SELECT * FROM doc d2, doc d1,docbody " +
	"WHERE d1.doc_id=docbody_id AND d2.doc_id=d1.parent AND d2.doctype IN (6,17) AND d1.reference=:jsonId"
}
sql_amk025.read_obj_from_docRoot = function(){
	return "SELECT * FROM doc d2, doc d1,docbody " +
	"WHERE d1.doc_id=docbody_id AND d2.doc_id=d1.parent AND d2.doctype IN (6,17) AND d1.reference " +
	" IN (SELECT parent FROM doc where doc_id=:jsonId)"
}
