package com.hireiq.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.base.url:}")
    private String configuredBaseUrl;

    @Value("${RENDER_EXTERNAL_URL:http://localhost:8082}")
    private String renderExternalUrl;

    private String getBaseUrl() {
        if (configuredBaseUrl != null && !configuredBaseUrl.isBlank() && !configuredBaseUrl.contains("localhost")) {
            return configuredBaseUrl;
        }
        if (renderExternalUrl != null && !renderExternalUrl.isBlank() && !renderExternalUrl.contains("localhost")) {
            return renderExternalUrl;
        }
        return "http://localhost:8082";
    }

    @Value("${spring.mail.properties.mail.smtp.from:anusha.c1807@gmail.com}")
    private String fromEmail;

    public void sendActivationEmail(String toEmail, String fullName, String token) {
        String activationUrl = getBaseUrl() + "/api/v1.0/activate?token=" + token;
        
        MimeMessage mimeMessage = mailSender.createMimeMessage();
        try {
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Activate your HireIQ account");

            String content = String.format("""
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #080D18; color: #E8EAF6; padding: 40px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #2E4268;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h2 style="color: #E07B39; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 1px;">HireIQ</h2>
                        <p style="color: #8B96B8; font-size: 14px; margin: 5px 0 0 0;">AI-Powered Smart Recruitment Platform</p>
                    </div>
                    
                    <div style="background-color: #0D1526; padding: 30px; border-radius: 8px; border: 1px solid #2E4268; margin-bottom: 25px;">
                        <h3 style="color: #E8EAF6; margin-top: 0; font-size: 20px;">Hello %s,</h3>
                        <p style="color: #8B96B8; line-height: 1.6; font-size: 15px;">
                            Thank you for registering on HireIQ! Please click the following link to activate your account:
                        </p>
                        
                        <p style="word-break: break-all; font-size: 14px; background-color: #111E33; padding: 16px; border-radius: 6px; border: 1px solid #2E4268; text-align: center; margin: 25px 0;">
                            <a href="%s" style="color: #E07B39; text-decoration: none; font-weight: 600; font-size: 15px;">%s</a>
                        </p>
                        
                        <div style="text-align: center; margin: 25px 0;">
                            <a href="%s" style="background-color: #1E5FA8; color: #ffffff; text-decoration: none; padding: 12px 30px; font-size: 16px; font-weight: 600; border-radius: 6px; display: inline-block; transition: background-color 0.2s;">
                                Activate Account
                            </a>
                        </div>
                    </div>
                    
                    <div style="text-align: center; font-size: 12px; color: #4B5A7E;">
                        <p style="margin: 0;">This email was sent automatically. Please do not reply to it.</p>
                        <p style="margin: 5px 0 0 0;">&copy; 2026 HireIQ. All rights reserved.</p>
                    </div>
                </div>
                """, fullName, activationUrl, activationUrl, activationUrl);

            helper.setText(content, true);
            mailSender.send(mimeMessage);
            log.info("Activation email successfully sent to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to construct or send activation email to {}: ", toEmail, e);
            log.warn("\n========================================================================\n" +
                     "DEVELOPMENT FALLBACK ACTIVATION LINK:\n" +
                     "For user: {}\n" +
                     "Activation Link: {}\n" +
                     "========================================================================\n", toEmail, activationUrl);
            throw new RuntimeException("Failed to send activation email", e);
        }
    }
}
