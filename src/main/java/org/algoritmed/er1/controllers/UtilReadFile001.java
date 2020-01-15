package org.algoritmed.er1.controllers;

import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class UtilReadFile001 {
	@GetMapping(value = "/r/load_protocol/{ebm}")
	public @ResponseBody Map<String, Object>  patients(@PathVariable String ebm) {
		HashMap<String, Object> m = new HashMap<>();
		System.out.println(ebm);
		m.put("ebm", ebm);
		return m;
	}

}
