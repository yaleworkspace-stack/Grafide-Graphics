package com.grafide.service;

import com.sendgrid.*;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.logging.Logger;

@Service
@RequiredArgsConstructor
public class EmailService {

    private static final Logger log = Logger.getLogger(EmailService.class.getName());

    @Value("${grafide.sendgrid.api-key}")
    private String sendGridApiKey;

    @Value("${grafide.sendgrid.from-email}")
    private String fromEmail;

    @Value("${grafide.sendgrid.from-name:Grafide}")
    private String fromName;

    /**
     * Send a plain HTML email via SendGrid.
     */
    public boolean send(String toEmail, String toName, String subject, String htmlBody) {
        Email from = new Email(fromEmail, fromName);
        Email to   = new Email(toEmail, toName);

        Mail mail  = new Mail(from, subject, to, new Content("text/html", htmlBody));

        SendGrid sg     = new SendGrid(sendGridApiKey);
        Request request = new Request();

        try {
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());

            Response response = sg.api(request);

            if (response.getStatusCode() >= 200 && response.getStatusCode() < 300) {
                log.info("Email sent to " + toEmail + " | Subject: " + subject);
                return true;
            } else {
                log.warning("SendGrid error " + response.getStatusCode() + ": " + response.getBody());
                return false;
            }
        } catch (IOException e) {
            log.severe("Failed to send email to " + toEmail + ": " + e.getMessage());
            return false;
        }
    }

    /* ---- Pre-built email templates ---- */

    public boolean sendPasswordReset(String toEmail, String toName, String resetToken) {
        String resetUrl = "http://localhost:5500/pages/reset-password.html?token=" + resetToken;
        String html = """
            <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:560px;margin:0 auto;padding:40px 20px;background:#F2EDE4;">
              <div style="background:#1A1A4E;padding:24px 32px;border-radius:8px 8px 0 0;text-align:center;">
                <h1 style="color:#ffffff;font-size:24px;margin:0;letter-spacing:-0.5px;">◆◆ Grafide</h1>
              </div>
              <div style="background:#ffffff;padding:40px 32px;border-radius:0 0 8px 8px;border:1px solid #D8D2C8;border-top:none;">
                <h2 style="color:#1A1A4E;font-size:22px;margin:0 0 12px;">Password Reset</h2>
                <p style="color:#6B6B8A;line-height:1.7;margin:0 0 24px;">
                  Hi %s,<br/><br/>
                  We received a request to reset your Grafide password.
                  Click the button below to set a new one. This link expires in <strong>1 hour</strong>.
                </p>
                <div style="text-align:center;margin:32px 0;">
                  <a href="%s"
                     style="display:inline-block;background:#1A1A4E;color:#ffffff;
                            text-decoration:none;padding:14px 32px;border-radius:4px;
                            font-weight:600;font-size:15px;letter-spacing:0.5px;">
                    Reset My Password
                  </a>
                </div>
                <p style="color:#9999AA;font-size:13px;line-height:1.6;margin:24px 0 0;">
                  If you didn't request this, you can safely ignore this email.
                  Your password will not be changed.<br/><br/>
                  This link will expire in 1 hour.
                </p>
              </div>
              <p style="text-align:center;color:#9999AA;font-size:12px;margin:20px 0 0;">
                © 2024 Grafide. All rights reserved.
              </p>
            </div>
            """.formatted(toName, resetUrl);

        return send(toEmail, toName, "Reset your Grafide password", html);
    }

    public boolean sendWelcome(String toEmail, String toName) {
        String html = """
            <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:560px;margin:0 auto;padding:40px 20px;background:#F2EDE4;">
              <div style="background:#1A1A4E;padding:24px 32px;border-radius:8px 8px 0 0;text-align:center;">
                <h1 style="color:#ffffff;font-size:24px;margin:0;">◆◆ Grafide</h1>
              </div>
              <div style="background:#ffffff;padding:40px 32px;border-radius:0 0 8px 8px;border:1px solid #D8D2C8;border-top:none;">
                <h2 style="color:#1A1A4E;font-size:22px;margin:0 0 12px;">Welcome, %s.</h2>
                <p style="color:#6B6B8A;line-height:1.7;margin:0 0 24px;">
                  Your Grafide account is ready. You now have access to structured courses
                  in CorelDRAW, Photoshop, Adobe Illustrator, Microsoft Word, and Canva.
                </p>
                <p style="color:#6B6B8A;line-height:1.7;margin:0 0 32px;">
                  Complete each level, pass the assessment, and earn a verified certificate.
                </p>
                <div style="text-align:center;">
                  <a href="http://localhost:5500/index.html"
                     style="display:inline-block;background:#1A1A4E;color:#ffffff;
                            text-decoration:none;padding:14px 32px;border-radius:4px;
                            font-weight:600;font-size:15px;">
                    Start Learning
                  </a>
                </div>
              </div>
              <p style="text-align:center;color:#9999AA;font-size:12px;margin:20px 0 0;">
                © 2024 Grafide. All rights reserved.
              </p>
            </div>
            """.formatted(toName);

        return send(toEmail, toName, "Welcome to Grafide", html);
    }

    public boolean sendContactAck(String toEmail, String toName) {
        String html = """
            <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:560px;margin:0 auto;padding:40px 20px;background:#F2EDE4;">
              <div style="background:#1A1A4E;padding:24px 32px;border-radius:8px 8px 0 0;text-align:center;">
                <h1 style="color:#ffffff;font-size:24px;margin:0;">◆◆ Grafide</h1>
              </div>
              <div style="background:#ffffff;padding:40px 32px;border-radius:0 0 8px 8px;border:1px solid #D8D2C8;border-top:none;">
                <h2 style="color:#1A1A4E;font-size:22px;margin:0 0 12px;">We got your message.</h2>
                <p style="color:#6B6B8A;line-height:1.7;margin:0 0 24px;">
                  Hi %s,<br/><br/>
                  Thanks for reaching out to Grafide. We've received your message
                  and will get back to you within 2 business days.
                </p>
                <p style="color:#9999AA;font-size:13px;margin:24px 0 0;">
                  If your enquiry is urgent, email us directly at hello@grafide.com.
                </p>
              </div>
              <p style="text-align:center;color:#9999AA;font-size:12px;margin:20px 0 0;">
                © 2024 Grafide. All rights reserved.
              </p>
            </div>
            """.formatted(toName);

        return send(toEmail, toName, "We received your message — Grafide", html);
    }

    public boolean sendNewsletterConfirmation(String toEmail) {
        String html = """
            <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:560px;margin:0 auto;padding:40px 20px;background:#F2EDE4;">
              <div style="background:#1A1A4E;padding:24px 32px;border-radius:8px 8px 0 0;text-align:center;">
                <h1 style="color:#ffffff;font-size:24px;margin:0;">◆◆ Grafide</h1>
              </div>
              <div style="background:#ffffff;padding:40px 32px;border-radius:0 0 8px 8px;border:1px solid #D8D2C8;border-top:none;">
                <h2 style="color:#1A1A4E;font-size:22px;margin:0 0 12px;">You're subscribed.</h2>
                <p style="color:#6B6B8A;line-height:1.7;margin:0 0 24px;">
                  You'll receive new lessons, design resources, and platform updates
                  from Grafide. No spam — just things worth reading.
                </p>
                <p style="color:#9999AA;font-size:13px;">
                  To unsubscribe at any time, reply to any newsletter with "unsubscribe"
                  or email hello@grafide.com.
                </p>
              </div>
              <p style="text-align:center;color:#9999AA;font-size:12px;margin:20px 0 0;">
                © 2024 Grafide. All rights reserved.
              </p>
            </div>
            """;

        return send(toEmail, "", "You're subscribed to Grafide", html);
    }
}
