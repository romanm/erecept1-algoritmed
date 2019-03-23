app.controller('AppCtrl', function($scope, $http, $interval, $filter) {
	var ctrl = this
	ctrl.page_title = 'Активація логі́н'
	initApp($scope, $http)
	if(!$scope.request.parameters.uuid){
		ctrl.error_text = 'Несанкціоноване звернення до сторінки'
	}else{
		var sql = "UPDATE users SET enabled=true WHERE user_id " +
				"IN (SELECT user_id FROM users,doc LEFT JOIN uuid ON uuid_id=doc_id " +
				"WHERE doc_id=user_id AND value='" + $scope.request.parameters.uuid + "')"
		writeSql({sql : sql,
			dataAfterSave:function(response){
				console.log(response.data)
			}
		})
	}
})
