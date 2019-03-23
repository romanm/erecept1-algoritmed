package org.algoritmed.er1.controllers;

import java.security.Principal;
import java.util.Map;
import java.util.UUID;

import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;
import javax.servlet.http.HttpServletRequest;

import org.algoritmed.er1.amdb.DbCommon;
import org.algoritmed.er1.amdb.ExecuteSqlBlock;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.PropertySource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@PropertySource(value = "classpath:email.properties", encoding="UTF-8")
public class AccountRest extends DbCommon{
	protected static final Logger logger = LoggerFactory.getLogger(AccountRest.class);
	
	@PostMapping("/r/activateAccount")
	public @ResponseBody Map<String, Object> activateAccount(
			@RequestBody Map<String, Object> data
			,HttpServletRequest request
			,Principal principal
			) {
		logger.info("\n\n-- 33 -- \n"
				+ "/r/activateAccount"
				+ "\n"
				+ data
				);
		return data;
	}
	@PostMapping("/r/send_eMail")
	public @ResponseBody Map<String, Object> send_eMail(
			@RequestBody Map<String, Object> data
			,HttpServletRequest request
			,Principal principal
			) {
		UUID randomUUID = UUID.randomUUID();
		String uuid = randomUUID.toString();
		data.put("uuid", uuid);
		String sql = "INSERT INTO doc (parent, doc_id, doctype) VALUES (122603, :nextDbId1, 18);\n"
				+ "INSERT INTO doc (parent, reference, doctype) VALUES (:nextDbId1, 122608, 18);\n"
				+ "INSERT INTO users (user_id, username, password) VALUES (:nextDbId1, :username, :password);\n"
				+ "INSERT INTO uuid (uuid_id, value) VALUES (:nextDbId1, :uuid);\n";
		data.put("sql", sql);
		data.put("password", "{noop}"+ data.get("password"));
		logger.info("\n\n-- 46 -- \n"
				+ "/r/send_eMail"
				+ "\n sql = "
				+ sql
				+ "\n"
				+ data
				);
		try {
			executeSqlBlock.executeSql(data);
			sendEmail(data);
			return data;
		}catch(Exception ex) {
			System.err.println(ex);
			System.err.println("------39-------------------");
			String spring_mail_username = env.getProperty("spring.mail.username");
			System.err.println(spring_mail_username);
			System.err.println(ex.getMessage());
			data.put("ex", ex.getMessage());
			return data;
		}
//		return data;
	}
	private void sendEmail(Map<String, Object> data) throws MessagingException {
		System.out.println("---67------sendEmail");
		System.out.println(sender);
		MimeMessage message = sender.createMimeMessage();
		System.out.println(70);
		System.out.println(message);
		MimeMessageHelper helper = new MimeMessageHelper(message);
		String email = (String) data.get("email");
		System.out.println(email);
		helper.setTo(email);
//		helper.setTo("roman.mishchenko@gmail.com");
		String algoritmedMailSubjectConfirm = env.getProperty("algoritmed.mail.subject.confirm1");
		System.out.println(algoritmedMailSubjectConfirm);
		helper.setSubject(algoritmedMailSubjectConfirm);
		String algoritmedMailConfirm = env.getProperty("algoritmed.mail.sendText.confirm1");
		System.out.println(algoritmedMailConfirm);
		
		String uuid = (String) data.get("uuid");
		System.out.println(uuid);
		algoritmedMailConfirm = algoritmedMailConfirm.replaceAll(":uuid", uuid);
		System.out.println(algoritmedMailConfirm);
		helper.setText(algoritmedMailConfirm, true);
		System.out.println(84);
		System.out.println(helper);
		sender.send(message);
	}

	@Autowired									private JavaMailSender sender;
	@Autowired @Qualifier("db1ExecuteSqlBlock")	private ExecuteSqlBlock executeSqlBlock;
}
