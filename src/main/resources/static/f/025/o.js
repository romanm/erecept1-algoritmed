app.controller('AppCtrl', function($scope, $http, $interval, $filter) {
	ctrl = this
	initApp($scope, $http)
	console.log($scope.request.parameters)
	exe_fn.jsonTree = new JsonTree($scope, $http)
	exe_fn.daybook = new Daybook($scope, $http)
	console.log(exe_fn.daybook)
	

	$scope.saveDataDocbody = function(colO){
		console.log($scope.elementsMap[$scope.request.parameters.amk])
		var amkPartEl = $scope.elementsMap[$scope.referenceElementPaars[$scope.request.parameters.l1]]
		console.log(colO)
		var amkElId = colO.o.doc_id
		console.log(amkElId)
		console.log($scope.elementsMap[amkElId])
//		logEnvirontment()
		var dataElement = exe_fn.docbook.getDataElement()
		dataElement.docbody = colO.note
		dataElement.reference = amkElId
		if(!amkPartEl){//INSERT part element
			insertWithPartElement(dataElement)
		}else{
			var patientAmkEl = $scope.elementsMap[$scope.referenceElementPaars[amkElId]]
			console.log(patientAmkEl)
			if(patientAmkEl){//UPDATE
				dataElement.docbody_id = patientAmkEl.doc_id
				dataElement.sql = "UPDATE docbody SET docbody=:docbody WHERE docbody_id=:docbody_id"
			}else{//INSERT
				dataElement.parent = amkPartEl.doc_id
			}
			console.log(dataElement)
			writeSql(dataElement)
		}
	}

	$scope.saveDataReference2 = function(o, amkElId){
		console.log(o)
		console.log(amkElId)
		console.log($scope.elementsMap[amkElId])
//		logEnvirontment()
		var dataElement = {
			reference:amkElId,
			reference2:o.doc_id,
			sql:"INSERT INTO doc (doctype, doc_id, parent, reference, reference2) " +
				" VALUES (18, :nextDbId1, :parent, :reference, :reference2); ",
			dataAfterSave:function(response){
				console.log(response)
			}
		}
		var amkPartEl = $scope.elementsMap[$scope.referenceElementPaars[$scope.request.parameters.l1]]
		if(!amkPartEl){
			var dataParentElement = {
				parent:$scope.request.parameters.amk,
				reference:$scope.request.parameters.l1,
				sql:"INSERT INTO doc (doctype, doc_id, parent, reference) VALUES (18, :nextDbId1, :parent, :reference); ",
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
		}else{
			var patientAmkEl = $scope.elementsMap[$scope.referenceElementPaars[amkElId]]
			console.log(patientAmkEl)
			if(patientAmkEl){//UPDATE
				dataElement.doc_id = patientAmkEl.doc_id
				dataElement.sql = "UPDATE doc SET reference2=:reference2 WHERE doc_id=:doc_id"
			}else{//INSERT
				dataElement.parent = amkPartEl.doc_id
			}
			console.log(dataElement)
			writeSql(dataElement)
		}
	}

	var logEnvirontment = function(){
		console.log($scope.referenceElementPaars)
		console.log($scope.referenceElementPaars[85089])
		console.log($scope.elementsMap[$scope.referenceElementPaars[85089]])
		console.log($scope.referenceElementPaars[$scope.request.parameters.l1])
		console.log($scope.elementsMap[$scope.referenceElementPaars[$scope.request.parameters.l1]])
		console.log('амк документ '+ $scope.request.parameters.amk)
		console.log($scope.elementsMap[$scope.request.parameters.amk])
		console.log($scope.elementsMap[85086])
		console.log($scope.elementsMap[$scope.request.parameters.l1])
		console.log('пацієнт')
		console.log($scope.elementsMap[85256])
	}

	readSql({
		sql:sql_amk025.amk025_template(),
		jsonId:5036,
		afterRead:function(response){
			$scope.amk025_dd = JSON.parse(response.data.list[0].docbody)
			console.log($scope.amk025_dd)
			json_elementsMap($scope.amk025_dd.docRoot, $scope.elementsMap, $scope.referencesMap)
		}
	})

	
	readAmk($scope)

})

