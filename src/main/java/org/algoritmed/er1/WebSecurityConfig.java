package org.algoritmed.er1;

import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.transaction.annotation.EnableTransactionManagement;


/**
 * Права доступу
 * @author roman
 *
 */
@Configuration
@EnableWebSecurity
@EnableTransactionManagement
public class WebSecurityConfig extends WebSecurityConfigurerAdapter {

	@Override
	protected void configure(HttpSecurity http) throws Exception {
//		CookieCsrfTokenRepository withHttpOnlyFalse = CookieCsrfTokenRepository.withHttpOnlyFalse();
		
		http
		.csrf()
			.disable() /* enable POST */
		.authorizeRequests()
		.antMatchers("/" /* index.html from static */
			, "/v/**" /* view HTML sites*/
			, "/f/**" /* files for sites*/
			, "/r/**" /* read JSON from server*/
			, "/webjars/**" /* CSS&JS from gradle */
		).permitAll()
		.anyRequest()
		.fullyAuthenticated()
//		.authenticated()
		.and()
		.formLogin()
		.successHandler(successHandler)
		.loginPage("/login")
		.permitAll()
		.and()
		.logout()
		.logoutSuccessHandler(successHandler)
		.permitAll();
	}
	@Autowired private SimpleAuthenticationSuccessHandler successHandler;
	@Autowired DataSource dataSourceDb1;

	@Autowired
	public void configureGlobal(AuthenticationManagerBuilder auth) throws Exception {
		/*
		InMemoryUserDetailsManagerConfigurer<AuthenticationManagerBuilder> inMemoryAuthentication = auth
		.inMemoryAuthentication();
		inMemoryAuthentication.withUser("user").password("password").roles("USER");
		inMemoryAuthentication.withUser("test").password("test").roles("USER");
		 * */

		auth.jdbcAuthentication().dataSource(dataSourceDb1)
		.usersByUsernameQuery(
//				"SELECT * FROM users WHERE username=?")
		"SELECT username,password, enabled FROM users WHERE username=?")
		.authoritiesByUsernameQuery(
				"SELECT username, role FROM users,doc,roles "
				+ "WHERE "
				+ "parent=user_id AND reference=role_id "
				+ "AND username=?");
	}

}
