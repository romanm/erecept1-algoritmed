conf.eHealthInUA_id = 115796
conf.dataModelTemplateId = 115883
conf.dataModelList.parentId = 285517

app.controller('AppCtrl', function($scope, $http) {
	var ctrl = this
	ctrl.page_title = 'Кадри'
	initApp($scope, $http, ctrl)
	initDocEditor(ctrl)

})
