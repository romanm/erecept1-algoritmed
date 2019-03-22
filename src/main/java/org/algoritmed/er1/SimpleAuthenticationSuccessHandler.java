package org.algoritmed.er1;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.security.core.Authentication;
import org.springframework.security.web.DefaultRedirectStrategy;
import org.springframework.security.web.RedirectStrategy;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.logout.LogoutSuccessHandler;
import org.springframework.stereotype.Component;

@Component
public class SimpleAuthenticationSuccessHandler 
implements AuthenticationSuccessHandler, LogoutSuccessHandler{

	@Override
	public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication arg2)
			throws IOException, ServletException {
//		String url = request.getRequestURL().toString();
//		String queryString = request.getQueryString();
		String pageKey = (String) request.getSession().getAttribute("pageKey");
		String redirectUrl = "/";
		if(pageKey!=null&&!pageKey.equals(""))
			redirectUrl = "/v/"+pageKey;
		System.err.println("--19-- redirectUrl--"+redirectUrl);
		redirectStrategy.sendRedirect(request, response, redirectUrl);
	}

	@Override
	public void onLogoutSuccess(HttpServletRequest request, HttpServletResponse response, Authentication arg2)
			throws IOException, ServletException {
//		String redirectUrl = "/v/login1";
		String redirectUrl = "/f/authentes/login.html";
		System.err.println("--40-- redirectUrl--"+redirectUrl);
		redirectStrategy.sendRedirect(request, response, redirectUrl);
		
	}

	private RedirectStrategy redirectStrategy = new DefaultRedirectStrategy();
	//	http://www.devglan.com/spring-security/spring-boot-security-redirect-after-login
}
