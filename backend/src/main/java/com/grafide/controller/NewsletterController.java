package com.grafide.controller;

import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/newsletter")
public class NewsletterController {

    @PostMapping("/subscribe")
    public ResponseEntity<?> subscribe(@RequestBody SubscribeRequest req) {
        // TODO: integrate with Mailchimp / SendGrid / etc.
        // For now just acknowledge
        System.out.println("Newsletter subscribe: " + req.getEmail());
        return ResponseEntity.ok(Map.of("message", "Subscribed successfully."));
    }

    @Data
    static class SubscribeRequest {
        private String email;
    }
}
