package com.grafide.controller;

import com.grafide.service.EmailService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/contact")
@RequiredArgsConstructor
public class ContactController {

    private static final Logger log = Logger.getLogger(ContactController.class.getName());
    private final EmailService emailService;

    @PostMapping
    public ResponseEntity<?> submitContact(@RequestBody ContactRequest req) {

        if (req.getName() == null || req.getName().isBlank() ||
            req.getEmail() == null || req.getEmail().isBlank() ||
            req.getMessage() == null || req.getMessage().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Name, email, and message are required."));
        }

        log.info(String.format("[CONTACT] From: %s <%s> | Subject: %s",
                req.getName(), req.getEmail(), req.getSubject()));

        // Send notification to Grafide team
        String teamHtml = """
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
              <h2 style="color:#1A1A4E;">New Contact Form Submission</h2>
              <table style="width:100%%;border-collapse:collapse;">
                <tr><td style="padding:8px;font-weight:bold;color:#6B6B8A;width:120px;">Name</td>
                    <td style="padding:8px;">%s</td></tr>
                <tr><td style="padding:8px;font-weight:bold;color:#6B6B8A;">Email</td>
                    <td style="padding:8px;"><a href="mailto:%s">%s</a></td></tr>
                <tr><td style="padding:8px;font-weight:bold;color:#6B6B8A;">Subject</td>
                    <td style="padding:8px;">%s</td></tr>
                <tr><td style="padding:8px;font-weight:bold;color:#6B6B8A;vertical-align:top;">Message</td>
                    <td style="padding:8px;line-height:1.6;">%s</td></tr>
              </table>
            </div>
            """.formatted(
                req.getName(),
                req.getEmail(), req.getEmail(),
                req.getSubject() != null ? req.getSubject() : "General",
                req.getMessage().replace("\n", "<br/>")
        );

        emailService.send("hello@grafide.com", "Grafide Team",
                "Contact: " + (req.getSubject() != null ? req.getSubject() : "General Enquiry"),
                teamHtml);

        // Send acknowledgement to sender
        emailService.sendContactAck(req.getEmail(), req.getName());

        return ResponseEntity.ok(Map.of(
            "message", "Message received. We'll get back to you shortly."
        ));
    }

    @Data
    public static class ContactRequest {
        private String name;
        private String email;
        private String subject;
        private String message;
    }
}
