package org.algoritmed.er1.amdb;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class PrincipalRest extends DbCommon{

	@GetMapping("/r/principal")
	public @ResponseBody Map<String, Object> principal(Principal principal) {
		Map<String, Object> map = new HashMap<>();
				map.put("principal", principal);
		return map;
	}

}
