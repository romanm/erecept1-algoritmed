app.controller('myCtrl', function($scope, $http, $interval, $filter) {
	initApp($scope, $http)

	console.log(exe_fn)
	
	exe_fn.httpGet({url:'/f/json/getMedicalRequestById.json',
		then_fn:function(response){
			$scope.recept_sample = response.data.data
			console.log($scope.recept_sample)
		}
	})

	exe_fn.httpGet({url:'/f/json/dictionaries.json',
		then_fn:function(response){
			$scope.dictionaries = response.data.data
			console.log($scope.dictionaries)
		}
	})

	readSql({
		sql:sql_app.amk025_template(),
		jsonId:87026,
		afterRead:function(response){
			$scope.recept_template = JSON.parse(response.data.list[0].docbody)
			json_elementsMap($scope.recept_template.docRoot, $scope.elementsMap, $scope.referencesMap)
			console.log($scope.recept_template, $scope.elementsMap, $scope.referencesMap)
			/*
			readRef($scope)
			 */
		}
	})

})
