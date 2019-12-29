package org.algoritmed.er1.amdb;

import java.security.Principal;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class Db1Rest extends DbCommon{
	protected static final Logger logger = LoggerFactory.getLogger(Db1Rest.class);
	protected @Autowired @Qualifier("db1ExecuteSqlBlock")	ExecuteSqlBlock executeSqlBlock;

	@Transactional
	@PostMapping("/r/url_sql_read_db1")
	public @ResponseBody Map<String, Object> url_sql_read_db1(
			@RequestBody Map<String, Object> data
			,HttpServletRequest request
			,Principal principal
		){
		logger.info("\n\n--35----- "
				+ "/r/url_sql_read_db1"
				+ "\n SQL = \n"+data.get("sql")
//				+ "\n" + data
				);
		executeSqlBlock.executeSql(data);
		data.remove("sql");
		return data;
	}

	

	@GetMapping("/r/url_sql_read_db1")
	public @ResponseBody Map<String, Object> url_sql_read_db1(
			@RequestParam(value = "sql", required = true) String sql
			,HttpServletRequest request
		) {
		Map<String, Object> map = sqlParamToMap(request);
//		Map m = new HashMap();
//		m.put("k", "v");
//		m.put("sql", sql);
//		System.out.println(map);
//		System.out.println(sql);
		logger.info("\n--57-- /r/url_sql_read_db1"
				+ " SQL = \n"+sql
//				+ "\n" + data
				);
		List<Map<String, Object>> list = dbParamJdbcTemplate.queryForList(sql, map);
		map.put("list", list);
		return map;
	}

	protected @Autowired @Qualifier("db1ParamJdbcTemplate")	NamedParameterJdbcTemplate dbParamJdbcTemplate;

}
