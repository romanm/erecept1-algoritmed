app.controller('AppCtrl', function($scope, $http, $interval, $filter) {
	ctrl = this
	initApp($scope, $http)
	ctrl.newUser = {}
	ctrl.newUser.username = 'qwe'
	ctrl.newUser.equalsPassword = true
	ctrl.newUser.checkEqualsPassword = function(){
		ctrl.newUser.equalsPassword = 
			ctrl.newUser.password==ctrl.newUser.password2
	}
	ctrl.newUser.next1 = function(){
		console.log(ctrl.newUser)
		
		exe_fn.httpPost({
			data:ctrl.newUser,
			url:'/r/send_eMail',
			then_fn:function(response) {
				console.log(response.data)
			},
		})
	}
	ctrl.nextArrow = {}
	ctrl.nextArrow.array = [
		'fa-arrow-circle-o-right','fa-arrow-circle-right'
		,'fa-chevron-right','fa-arrow-right','fa-long-arrow-right'
		,'fa-caret-right','fa-caret-square-o-right'
		,'fa-angle-right','fa-angle-double-right'
		,'fa-hand-o-right']
	ctrl.nextArrow.random3=getRandomInt(10)
})
