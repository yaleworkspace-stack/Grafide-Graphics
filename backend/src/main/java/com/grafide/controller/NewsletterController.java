package com.grafide.controller;

import com.grafide.service.EmailService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/newsletter")
@RequiredArgsConstructor
public class NewsletterController {

    private final EmailService emailService;

    @PostMapping("/subscribe")
    public ResponseEntity<?> subscribe(@RequestBody SubscribeRequest req) {
        if (req.getEmail() == null || req.getEmail().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required."));
        }

        // Send confirmation to subscriber
        emailService.sendNewsletterConfirmation(req.getEmail().trim());

        // Notify team
        emailService.send(
            "hello@grafide.com", "Grafide Team",
            "New Newsletter Subscriber",
            "<p>New subscriber: <strong>" + req.getEmail() + "</strong></p>"
        );

        return ResponseEntity.ok(Map.of("message", "Subscribed successfully."));
    }

    @Data
    static class SubscribeRequest {
        private String email;
    }
}
