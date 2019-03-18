package org.algoritmed.er1.amdb;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;

public class ExecuteSqlBlock {
	protected static final Logger logger = LoggerFactory.getLogger(ExecuteSqlBlock.class);
	private NamedParameterJdbcTemplate dbParamJdbcTemplate;
	private JdbcTemplate dbJdbcTemplate;

	ExecuteSqlBlock(JdbcTemplate dbJdbcTemplate, NamedParameterJdbcTemplate dbParamJdbcTemplate){
		this.dbParamJdbcTemplate = dbParamJdbcTemplate;
		this.dbJdbcTemplate = dbJdbcTemplate;
	}
//	private Environment env;
//	@Autowired 
	protected Environment env;
	/**
	 * Генератор наступного ID единого для всієї БД.
	 * @return Наступний ID единий для всієй БД.
	 */
	protected Integer nextDbId() {
		String sql_nextDbId = env.getProperty("sql.nextDbId");
		Integer nextDbId = dbJdbcTemplate.queryForObject(sql_nextDbId, Integer.class);
		return nextDbId;
	}
//	(transactionManager="transactionManager2")
	@Transactional
	public void update_sql_script(Map<String, Object> data, String sql, Environment env) {
		this.env =env;
//	String sql = (String) data.get("sql"); 
		String sql_from_env = env.getProperty(sql);
		logger.info("\n\n-- 62 -- update_sql_script-- "
				+ "\n" + sql_from_env
				+ "\n" + data
				);
//		data.put(sql, sql_from_env);
		System.err.println("-------47-------");
		sql_from_env=prepareSql(sql_from_env, data);
		if(sql_from_env.contains(";")) {
			System.err.println("-------98--------------");
			System.err.println(sql_from_env);
			
			String[] sqls_from_env = sql_from_env.split(";");
			for (int i = 0; i < sqls_from_env.length; i++) {
				String sql_command = sqls_from_env[i].trim();
				System.err.print(sql_command);
				if(sql_command.length()==0)
					continue;
				System.err.print(" - "+i+"->");
				String[] split = sql_command.split(" ");
				String first_word = split[0];
				System.err.println(first_word);
				if("INSERT".equals(first_word)
				|| "UPDATE".equals(first_word)
				|| "DELETE".equals(first_word)
				){
					if("docbody".equals(split[1])) {
						if(data.containsKey("docbodyMap")) {
//							String docbody = objectToString(data.get("docbodyMap"));
//							data.put("docbody", docbody);
							data.put("docbodyMap", data.get("docbodyMap"));
						}
					}
					int update = dbParamJdbcTemplate.update(sql_command, data);
					data.put("update"+i, update);
				}else if(sql_command.split("_var_").length>1) {
					update_vars(data, sql_command);
				}else if("SELECT".equals(first_word)) {
					read_select(data, sql_command, i);
				}
			}
		}else {
			int update = dbParamJdbcTemplate.update(sql_from_env, data);
			data.put("update", update);
		}
	}
	
	private String prepareSql(String sql_from_env, Map<String, Object> data) {
		System.err.println("-------89--------");
		System.err.println(sql_from_env);
		if(sql_from_env.contains(":valueTableName")) {
			String valueTableName = (String) data.get("valueTableName");
			sql_from_env =
				sql_from_env.replaceAll(":valueTableName", valueTableName);
			System.err.println("--------95--------");
			System.err.println(sql_from_env);
		}
		if(data.containsKey("docbodyMap")) {
			@SuppressWarnings("unchecked")
			Map<String,Object> docbodyMap = (Map<String, Object>) data.get("docbodyMap");
//			String docbody = objectToString(docbodyMap);
//			data.put("docbody", docbody);
			data.put("docbodyMap", docbodyMap);
		}
		if(data.containsKey("replace_param")) {
			@SuppressWarnings("unchecked")
			Map<String,String> replace_param = (Map<String, String>) data.get("replace_param");
			for (String key : replace_param.keySet()) {
//				System.err.println(key);
//				System.err.println(replace_param.get(key));
				sql_from_env=sql_from_env.replaceAll(":"+key, ":"+replace_param.get(key));
			}
		}
		updateNewIds(sql_from_env, data, env);
		return sql_from_env;
	}

	public void updateNewIds(String sql, Map<String, Object> data, Environment env) {
		this.env =env;
		String[] split_nextDbId = null;
		try {
			split_nextDbId = sql.split("nextDbId");
		}catch (Exception e) {
			System.err.println(sql);
			System.err.println(data);
			System.err.println(e);
			return;
		}
		System.err.println("nextDbId cnt="+split_nextDbId.length);
		if(split_nextDbId.length > 0) {
			HashMap<Integer, Integer> nextDbMap = new HashMap<>();
			for (int i = 1; i < split_nextDbId.length; i++) {
				String s1 = split_nextDbId[i];
				String s2 = s1.split(" ")[0];
				s2=s2
					.replaceAll(",", "")
					.replaceAll("\\)", "")
					.replaceAll(";", "")
					;
//System.out.println("s2 = "+s2);
//System.out.println("s1 = "+s1);
				int nextDbKey = Integer.parseInt(s2);
				nextDbMap.put(nextDbKey, nextDbKey);
			}
			System.err.println(nextDbMap.keySet());
			System.err.println(nextDbMap.keySet().size());

			System.err.println("----81------------");

			for (Integer key : nextDbMap.keySet())
				data.put("nextDbId"+key, nextDbId());

			if(data.containsKey("uuid")&&data.get("uuid").equals("uuid"))
				data.put("uuid", UUID.randomUUID());
			System.err.println(data);
		}
	}

	protected void read_select(Map<String, Object> data, String sql_command, Integer i) {
		String nr = null==i?"":(""+i);
//		System.err.println(sql_command);
//		System.err.println(sql_command.indexOf("SELECT 'docbody' datatype"));
		if(sql_command.indexOf("SELECT 'docbody' datatype")==0) {
			List<Map<String, Object>> docbodyList = dbParamJdbcTemplate.queryForList(sql_command, data);
			if(docbodyList.size()>0) {
				Map<String, Object> docbodyMap = docbodyList.get(0);
				String docbodyStr = (String) docbodyMap.get("docbody");
				Map<String, Object> docbodyStr2Map = stringToMap(docbodyStr);
				docbodyMap.put("docbody", docbodyStr2Map);
				data.put("docbody"+nr, docbodyMap);
			}
		}else{
			List<Map<String, Object>> list = dbParamJdbcTemplate.queryForList(sql_command, data);
			data.put("list"+nr, list);
		}
	}
	
	private void update_vars(Map<String, Object> data, String sql_command) {
//		System.err.println("-------116---------------");
//		System.err.println(sql_command);
		List<Map<String, Object>> varsList = dbParamJdbcTemplate.queryForList(sql_command, data);
		Map<String, Object> varsMap = varsList.get(0);
		String[] vars = sql_command.split("_var_");
		for (int i = 1; i < vars.length; i++) {
			String varName = vars[i].split(" ")[0];
			System.err.println(varName);
			Object val = varsMap.get("_var_"+varName);
			data.put(varName, val);
			logger.info("----126------- \n"
					+ "\n: " + varName+"="+val
					);
		}
	}
	
	@Autowired protected	ObjectMapper objectMapper;
	@SuppressWarnings("unchecked")
	protected Map<String, Object> stringToMap(String protocolDoc) {
		Map<String, Object> map = null;
		try {
			map = objectMapper.readValue(protocolDoc, Map.class);
		} catch (IOException e) {
			e.printStackTrace();
		}
		if(map==null)
			map = new HashMap<>();
		return map;
	}
	
}
