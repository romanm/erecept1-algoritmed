app.controller('AppCtrl', function($scope, $http, $interval, $filter) {
	var ctrl = this
	ctrl.config = {}
	ctrl.config.asc = true
	ctrl.wInnerHeight = h = window.innerHeight
	ctrl.page_title = 'розробка бак.паспорти ХОЛ'
	initApp($scope, $http)
	ctrl.data_value = {}
	readMicrobes(ctrl)
	readDepartments(ctrl)
})

function readDisks(ctrl) {
	ctrl.disks = []
	ctrl.disksO = {}
	ctrl.disksIndex = []
	ctrl.config.changeSortDisks = function(){
		this.asc = !this.asc
		this.sortDisks()
	}
	ctrl.config.sortDisks = function(){
		if(this.asc){
			ctrl.disksIndex.sort(function(a, b){return a-b})
		}else{
			ctrl.disksIndex.sort(function(a, b){return b-a})
		}
	}
//	sql:"SELECT * FROM string_u WHERE group_id=60",
	readSql({
		sql1:"SELECT * FROM string_u WHERE group_id=60",
		sql:"SELECT * FROM bp_disks ORDER BY name",
		afterRead:function(response){
			angular.forEach(response.data.list, function(v,k){
//				ctrl.disks.push(v.value)
				ctrl.disks.push(v.name)
				ctrl.disksO[v.name] = v
			})
			console.log(ctrl.disks)
			readSql({
				sql:"SELECT column_name FROM information_schema.columns WHERE table_name = 'w18ukr018hol2018'",
				afterRead:function(response){
					var i=0
					angular.forEach(response.data.list, function(v,k){
						var d_n = v.column_name.toUpperCase()
						if(ctrl.disks.indexOf(d_n)>=0){
							ctrl.disksIndex.push(ctrl.disks.indexOf(d_n))
//							console.log(i++,d_n)
						}
					})
					ctrl.config.sortDisks()
					angular.forEach(ctrl.dataMicrobes, function(m){
						var mikrob = m.organism
						angular.forEach(ctrl.disksIndex, function(di){
//							console.log(di,ctrl.disks[di])
							var disk = ctrl.disks[di]
							readDataValue(ctrl, disk, mikrob,)
						})
					})
				}
			})
		}
	})
}

function readDataValue(ctrl,disk, mikrob,) {
	var params = extendSql({
		sql:"SELECT (m*1000/count)::FLOAT/10 mcp, y.*, x.* FROM ( \n" +
		"SELECT *, GREATEST(r,rs,s) m \n" +
		", CASE WHEN s>=rs \n" +
		"THEN CASE WHEN s>=r THEN 's' ELSE 'r' END \n" +
		"ELSE CASE WHEN rs>=r THEN 'rs' ELSE 'r' END END mn \n" +
		"FROM ( \n" +
		"SELECT o, SUM(r) r, SUM(rs) rs, SUM(s) s \n" +
		"FROM ( \n" +
		"SELECT organism o, :disk \n" +
		", CASE WHEN :disk::INT > a.max THEN 1 ELSE 0 END s \n" +
		", CASE WHEN :disk::INT < a.min THEN 1 ELSE 0 END r \n" +
		", CASE WHEN :disk::INT <= a.min AND :disk::INT >= a.max THEN 1 ELSE 0 END rs \n" +
		", a.*, d.* \n" +
		"FROM (:sql2) d \n" +
		", (SELECT min, max FROM bp_disks WHERE name=':disk' AND POSITION(':mikrob' IN organism)>0) a WHERE organism=':mikrob' \n" +
		") x GROUP BY o \n" +
		") x) x \n" +
		", (SELECT COUNT(*) FROM (:sql2) y) y",
		sql2:"SELECT * FROM w18ukr018hol2018 WHERE organism=':mikrob'",
		disk:disk,
		mikrob:mikrob,
		error_fn:function(response){
			console.error(response.data.message)
		},
		afterRead:function(response){
			if(response.data.list[0]){
				ctrl.data_value[mikrob] = {}
				ctrl.data_value[mikrob][disk] = response.data.list[0]
			}
			//console.log(disk, response.data, response.data.list[0])
		},
	})
//	if('PIP_ED30'==disk)
//		console.log(disk, params.sql)
	readSql(params)
}

function readDepartments(ctrl) {
	readSql({
		sql:"SELECT ward_type, ward, COUNT(*) FROM w18ukr018hol2018 GROUP BY ward_type, ward ORDER BY ward_type, COUNT(*) DESC",
		afterRead:function(response){
			ctrl.dataDepartments = response.data.list
			console.log(ctrl.dataDepartments)
			readDisks(ctrl)
		}
	})
}

function readMicrobes(ctrl) {
	readSql({
		sql:"SELECT x.*, z.org_clean FROM ( \n" +
		"SELECT org_type, organism, COUNT(*) FROM w18ukr018hol2018 GROUP BY org_type, organism ORDER BY org_type, organism \n" +
		") x, ( \n" +
		"SELECT org, COUNT(*) cnty, MIN(id) min_id FROM orglist GROUP BY org \n" +
		") y, ( \n" +
		"SELECT * FROM orglist \n" +
		") z WHERE x.organism=y.org AND z.id=min_id ORDER BY org_type, org_clean",
		afterRead:function(response){
			ctrl.dataMicrobes = response.data.list
			console.log(ctrl.dataMicrobes)
		}
	})
}

function b() {
	readSql({
		sql:"SELECT name, count(*) FROM bp_disks GROUP BY name ORDER BY name",
		afterRead:function(response){
			angular.forEach(response.data.list, function(v,k){if(k<1111){
				console.log(v)
				var sql = "INSERT INTO doc (doc_id, parent, doctype) VALUES (:nextDbId1,  123041, 18); \n" +
				"INSERT INTO string_u (string_u_id, group_id, value) VALUES (:nextDbId1, 60, '" +
				v.name +
				"')"
				console.log(sql)
				writeSql({sql : sql,
					dataAfterSave:function(response){
						console.log(response.data)
					}
				})
			}})
		}
	})
}

function a() {
	readSql({
		sql:"SELECT * FROM bp_disks",
		afterRead:function(response){
			var m_o = {}
			var l_o = []
			angular.forEach(response.data.list, function(v){
				angular.forEach(v.organism.split(','), function(v2){
					if(!(l_o.indexOf(v2.trim())>=0))
						l_o.push(v2)
				})
			})
			l_o.sort().splice(0, 1)
			console.log(l_o)
			angular.forEach(l_o, function(v,k){if(k<1){
				var sql = "INSERT INTO doc (doc_id, parent, doctype) VALUES (:nextDbId1, 122959, 18); \n" +
				"INSERT INTO string_u (string_u_id, group_id, value) VALUES (:nextDbId1, 59, '" +
				v +
				"')"
				console.log(sql)
				writeSql({sql : sql,
					dataAfterSave:function(response){
						console.log(response.data)
					}
				})
			}})
		}
	})
}
