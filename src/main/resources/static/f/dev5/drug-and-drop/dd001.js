var pageApp = {}
app.controller('AppCtrl', function($scope, $http, $timeout) {
	var ctrl = this
	pageApp.ctrl = ctrl
	ctrl.page_title = 'drug-and-drop-001'
	initApp($scope, $http, ctrl, $timeout)
	pageApp.init() 
	$scope.drag = function(ev) {
		ctrl.drag_item = ev.target.title.split(':')[1].trim()
	}

})

function allowDrop(ev) {
	ev.preventDefault();
}

function drag(ev) {
	ev.dataTransfer.setData("text", ev.target.id);
}

pageApp.init = function () {
	var ctrl = pageApp.ctrl
	ctrl.men = [ 'John', 'Jack', 'Mark', 'Ernie' ]
	ctrl.women = [ 'Jane', 'Jill', 'Betty', 'Mary' ]

	pageApp.ctrl.dropTo = function(o){
		var arrayTo = ctrl.women
		if(ctrl.men.indexOf(o.n)>0)
			arrayTo = ctrl.men
		arrayTo.splice(arrayTo.indexOf(o.n), 0, ctrl.drag_item)
		var arrayFrom = ctrl[ctrl.drag_item_array_name]
		if(arrayFrom!=arrayTo){
			arrayFrom.splice(arrayFrom.indexOf(ctrl.drag_item), 1)
		}
		delete ctrl.drag_item
		delete ctrl.drag_item_array_name
	}
}
pageApp.drag = function (ev) {
	pageApp.ctrl.drag_item = ev.target.title.split(':')[1].trim()
	pageApp.ctrl.drag_item_array_name = ev.target.attributes['data-array-name'].nodeValue
}
pageApp.drop = function (ev) {
	ev.preventDefault();
	var data = ev.dataTransfer.getData("text");
	ev.target.appendChild(document.getElementById(data));
}
