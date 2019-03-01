package org.algoritmed.er1.amdb;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.PropertySource;
import org.springframework.core.env.Environment;

@PropertySource("classpath:sql.properties")
public class DbCommon {
	@Autowired protected Environment env;

	protected Map<String, Object> sqlParamToMap( HttpServletRequest request) {
		Map<String, String[]> parameterMap = request.getParameterMap();
		Map<String, Object> map = new HashMap<String, Object>();
		for (String key : parameterMap.keySet()) {
			String[] v = parameterMap.get(key);
			String val = v[0];
			map.put(key, val);
		}
		map.remove("sql");
		return map;
	}

}
