package org.algoritmed.er1.amdb;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class PrincipalRest {
	protected static final Logger logger = LoggerFactory.getLogger(PrincipalRest.class);
	protected @Autowired @Qualifier("db1ExecuteSqlBlock")	ExecuteSqlBlock executeSqlBlock;

	@GetMapping("/r/principal")
	public @ResponseBody Map<String, Object> principal(Principal principal) {
		Map<String, Object> data = new HashMap<>();
				data.put("principal", principal);
				logger.info(24
						+"\n"+data
						);
				if(principal != null) {
					String username = principal.getName();
					data.put("username", username);
					String sql = "SELECT user_id FROM users WHERE username = :username";
					data.put("sql", sql);
					executeSqlBlock.executeSql(data);
					logger.info(33
							+"\n"+username
							+"\n"+sql 
							+"\n"+data
							);
				}
		return data;
	}

}
