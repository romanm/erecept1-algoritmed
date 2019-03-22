app.controller('myCtrl', function($scope, $http, $interval, $filter) {
	console.log(123)
	initApp($scope, $http)

	readSql({
		sql:sql_app.read_json_doc(),
		docId:115796,
		afterRead:function(response){
			$scope.eHealth_template = JSON.parse(response.data.list[0].docbody)
			$scope.legal_entitie_template = $scope.eHealth_template.docRoot.children[2].children[0]
			console.log(
					$scope.legal_entitie_template
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
	$scope.editDoc.blur = function(o){
		console.log('blur',o)
	}
	$scope.editDoc.focus = function(o){
		console.log('focus',o)
	}
	$scope.editDoc.change = function(o){
		console.log(o)
	}
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
