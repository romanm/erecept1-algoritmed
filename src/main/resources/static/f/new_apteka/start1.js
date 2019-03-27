app.controller('AppCtrl', function($scope, $http, $interval, $filter) {
	initApp($scope, $http)
	var ctrl = this
	ctrl.createNewAptek = function(){
		//122596 - аптеки:bigdata, 115827 - legal_entitie:datamodel, 18 # element,
		//122617 - author.create.
		var sql = "INSERT INTO doc (doc_id,parent,reference,doctype) VALUES (:nextDbId1, 122596,115827, 18);\n" +
		"INSERT INTO doc (doc_id,parent,reference,reference2,doctype) VALUES (:nextDbId2, :nextDbId1, 122617, :user_id, 18);\n"
		sql += sql_mtAptek
		console.log(sql)
		if(ctrl.legal_entitie)
			return
		writeSql({sql : sql,
			user_id:$scope.principal.user_id,
			dataAfterSave:function(response){
				set_legal_entitie(response.data.list2[0])
			}
		})
	}
	
	var sql_mtAptek = "SELECT d1.*,value complex_type FROM doc d1,string,doc d2 " +
	"WHERE d1.reference=string_id AND d1.doc_id=d2.parent AND d2.reference2 = :user_id ;\n"
	
	var set_legal_entitie = function(o){
		ctrl.legal_entitie = o
		console.log('ctrl.legal_entitie',ctrl.legal_entitie)
		$scope.elementsMap[o.doc_id] = o
		$scope.elementsMap[o.reference].value_element = o
//		console.log(ctrl.legal_entitie.doc_id, ctrl.legal_entitie,1111111, $scope.elementsMap[o.reference], o.reference, o.doc_id)
		readSql({
			sql:sql_app.doc_read_parent_elements(),
			parent:ctrl.legal_entitie.doc_id,
			afterRead:function(response){
				ctrl.legal_entitie.children = response.data.list
				angular.forEach(ctrl.legal_entitie.children, function(v){
					mapElement(v, $scope.elementsMap)
//					console.log(v, $scope.elementsMap[v.reference])
					var legal_entitie_template_element = $scope.elementsMap[v.reference]
					if(legal_entitie_template_element){
						if(legal_entitie_template_element.doctype>=32||legal_entitie_template_element.doctype<=37){
							// тип [] - масив елементів поєднання один до багатьох
							if(!$scope.elementsMap[v.reference].value_elements){
								$scope.elementsMap[v.reference].value_elements = []
							}
							$scope.elementsMap[v.reference].value_elements.push(v)
						}else{
							// тип {} - елемент поєднання один до одного
							$scope.elementsMap[v.reference].value_element = v
						}
					}
				})
			},
		})
	}
	
	$scope.$watch('principal',function(){
		if($scope.principal){
//			console.log(sql_mtAptek, $scope.principal.user_id)
			readSql({
				sql: sql_mtAptek,
				user_id:$scope.principal.user_id,
				afterRead:function(response){
					set_legal_entitie(response.data.list[0])
				}
			})
		}
	})

	readSql({
		sql:sql_app.read_json_doc(),
		docId:115796,
		afterRead:function(response){
			$scope.eHealth_template = JSON.parse(response.data.list[0].docbody)
			$scope.legal_entitie_template = $scope.eHealth_template.docRoot.children[2].children[0]
			mapElement($scope.eHealth_template.docRoot, $scope.elementsMap)
			console.log(115789
					, $scope.elementsMap[115789]
			,$scope.elementsMap[115789].reference
			, $scope.elementsMap[$scope.elementsMap[115789].reference]
			)
			if(false)
			console.log(
				$scope.legal_entitie_template,
				$scope.legal_entitie_template.doc_id,
				$scope.elementsMap,
				123,
				$scope.elementsMap[$scope.legal_entitie_template.doc_id]
			)
		}
	})

	$scope.fieldName = function(path){
		var oFieldName = field_names
		var last_path
		angular.forEach(path, function(k){
			last_path = k
			oFieldName = oFieldName[last_path]
		})
		var r = oFieldName||last_path
		r = r.substr(0,1).toUpperCase() + r.substr(1);
		return r
	}
	$scope.editDoc = {}
	ctrl.editDoc = $scope.editDoc
	
	ctrl.editDoc.editForm = {}
	ctrl.elementsMap = $scope.elementsMap
	ctrl.editDoc.addList = function(o){
		ctrl.editDoc.focus(o)
		console.log('ctrl.editDoc.addList',o,ctrl.elementsMap[o.parent])
		o.value_element.reference2 = o.reference
		var sql = insertDocElement1(o) + sql_update_reference2(o)
		writeDocElement1(o,sql)
	}
	
	ctrl.editDoc.focus = function(o){
		if(!o.value_element){
			o.value_element = {reference:o.doc_id, parent:ctrl.elementsMap[o.parent].value_element.doc_id}
		}
		console.log('focus',o.doc_id,o.reference,o.value,!o.value_element,o, $scope.elementsMap[o.parent],o.value_element)
		if(o.reference && !$scope.elementsMap[o.reference]){
			readSelectData(o.reference, o.string_reference)
		}
	}

	var insertDocElement1 = function(o){
		return  "INSERT INTO doc (doc_id,parent,reference,doctype) " +
		"VALUES (:nextDbId1, " + o.value_element.parent + ", " + o.value_element.reference + ", 18);\n"
	}
	var sql_update_reference2 = function(o){
		return "UPDATE doc SET reference2 = " + o.value_element.reference2 + " WHERE doc_id=:nextDbId1;"
	}

	$scope.editDoc.blur_select = function(o){
		console.log('blur_select',o)
		if(o.value_element.doc_id){
			var sql = sql_update_reference2(o).replace(':nextDbId1',o.value_element.doc_id)
			writeDocElement1(o,sql)
		}else{
			var sql = insertDocElement1(o) + sql_update_reference2(o)
			writeDocElement1(o,sql)
		}
	}

	$scope.editDoc.blur = function(o){
		console.log('blur', o.doc_id,o.value,'\n value_element = ',o.value_element)
		if(o.value_element.doc_id){
			var sql = "UPDATE string SET value = '" + o.value_element.value + "' WHERE string_id=" + o.value_element.doc_id + ";"
//			console.log(sql)
			writeDocElement1(o,sql)
		}else{
			if(o.value_element.value){
				var sql = insertDocElement1(o) +
				"INSERT INTO string (string_id,value) " +
				"VALUES (:nextDbId1, '" + o.value_element.value + "');"
//				console.log(sql)
				writeDocElement1(o,sql)
			}
		}
	}

	var writeDocElement1 = function(o,sql){
		writeSql({
			sql:sql,
			dataAfterSave:function(response){
				if(response.data.nextDbId1){
					o.value_element.doc_id = response.data.nextDbId1
				}
				console.log('writeDocElement1 ',response.data, o.value_element)
			}
		})
	}

	var readSelectData = function(reference, string_reference){
		var sql = "SELECT d1.*, s1.value, s2.value value_ua " +
		"FROM doc d1, string s1, doc d2, string s2 \n" +
		"WHERE d1.parent=" + reference +" " +
		"AND d2.reference=d1.doc_id " +
		"AND s1.string_id=d1.doc_id " +
		"AND s2.string_id=d2.doc_id " +
		"AND d2.parent=115924; "
		readSql({
			sql:sql,
			afterRead:function(response){
				var o2 = {doc_id:reference, value:string_reference}
				o2.children = response.data.list
				$scope.elementsMap[reference] = o2
//				console.log(reference, string_reference, o2, sql)
			}
		})
	}

	readSelectData(117239, 'LEGAL_ENTITY_TYPE')
	readSelectData(117018, 'OWNER_PROPERTY_TYPE')
	readSelectData(117301, 'LEGAL_FORM')
	
	
})

var field_names = {
	legal_entitie:{
		name:'назва ГПМД',
		short_name:'коротка назва',
		public_name:'публічне ім´я',
		type: "тип",
		owner_property_type: "тип власності",
		legal_form: "легальна форма",
		edrpou: "ЄДРПОУ",
		email: "еМайл",
		kveds: "КВЕДи",
		addresses: "Адреси",
		phones: "телефони",
		owner: "власник",
		medical_service_provider: "провайдер медичних послуг",
		security: "Інтернет",
		security1: "security?",
		public_offer: "публічна пропозиція",
		children:{
			addresses: {
				type: "тип",
				country: "країна",
				area: "обл.",
				region: "р-н.",
				settlement_type: "тип селеща",
				settlement: "назва",
				settlement_id: "код",
				street_type: "тип вулиці",
				street: "вулиця",
				building: "дім",
				apartment: "кв.",
				zip: "поштовий індекс"
			},
		}
	}
}

sql_app.read_json_doc = function(){
	return "SELECT * FROM doc, docbody  WHERE doc_id=docbody_id and doctype=20 AND reference = :docId "
}
