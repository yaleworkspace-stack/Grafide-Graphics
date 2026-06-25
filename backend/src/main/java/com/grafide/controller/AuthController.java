package com.grafide.controller;

import com.grafide.model.PasswordResetToken;
import com.grafide.model.User;
import com.grafide.repository.PasswordResetTokenRepository;
import com.grafide.repository.UserRepository;
import com.grafide.security.JwtUtil;
import com.grafide.service.EmailService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository              userRepository;
    private final PasswordResetTokenRepository resetTokenRepository;
    private final PasswordEncoder             passwordEncoder;
    private final JwtUtil                     jwtUtil;
    private final EmailService                emailService;

    /* ============================================
       REGISTER
       ============================================ */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {

        if (userRepository.existsByEmail(req.getEmail().toLowerCase().trim())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Email already registered."));
        }

        if (req.getPassword() == null || req.getPassword().length() < 8) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Password must be at least 8 characters."));
        }

        User user = new User();
        user.setName(req.getName().trim());
        user.setEmail(req.getEmail().toLowerCase().trim());
        user.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        user.setRole(User.Role.STUDENT);
        user.setTermsAccepted(req.isTermsAccepted());
        user.setTermsAcceptedAt(req.isTermsAccepted() ? Instant.now() : null);
        userRepository.save(user);

        // Send welcome email (async-ish — fire and don't block)
        try {
            emailService.sendWelcome(user.getEmail(), user.getName());
        } catch (Exception e) {
            // Don't fail registration if email fails
        }

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        return ResponseEntity.ok(buildAuthResponse(token, user));
    }

    /* ============================================
       LOGIN
       ============================================ */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        return userRepository.findByEmail(req.getEmail().toLowerCase().trim())
                .map(user -> {
                    if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
                        return ResponseEntity.status(401)
                                .body(Map.of("message", "Invalid email or password."));
                    }
                    String token = jwtUtil.generateToken(
                            user.getId(), user.getEmail(), user.getRole().name());
                    return ResponseEntity.ok(buildAuthResponse(token, user));
                })
                .orElse(ResponseEntity.status(401)
                        .body(Map.of("message", "Invalid email or password.")));
    }

    /* ============================================
       FORGOT PASSWORD — sends reset email
       ============================================ */
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest req) {
        // Always return 200 — never reveal whether email exists
        String email = req.getEmail().toLowerCase().trim();

        userRepository.findByEmail(email).ifPresent(user -> {
            // Invalidate any existing tokens
            resetTokenRepository.deleteByEmail(email);

            // Create new token
            PasswordResetToken resetToken = PasswordResetToken.create(user.getId(), email);
            resetTokenRepository.save(resetToken);

            // Send email
            try {
                emailService.sendPasswordReset(email, user.getName(), resetToken.getToken());
            } catch (Exception e) {
                // Log but don't surface
            }
        });

        return ResponseEntity.ok(Map.of(
            "message", "If that email is registered, a reset link has been sent."
        ));
    }

    /* ============================================
       VALIDATE RESET TOKEN — frontend checks this
       before showing the new password form
       ============================================ */
    @GetMapping("/reset-password/validate")
    public ResponseEntity<?> validateResetToken(@RequestParam String token) {
        return resetTokenRepository.findByToken(token)
                .map(t -> {
                    if (!t.isValid()) {
                        return ResponseEntity.badRequest()
                                .body(Map.of("valid", false, "message", "Token expired or already used."));
                    }
                    return ResponseEntity.ok(Map.of("valid", true, "email", t.getEmail()));
                })
                .orElse(ResponseEntity.badRequest()
                        .body(Map.of("valid", false, "message", "Invalid token.")));
    }

    /* ============================================
       RESET PASSWORD — sets new password
       ============================================ */
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest req) {
        if (req.getPassword() == null || req.getPassword().length() < 8) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Password must be at least 8 characters."));
        }

        return resetTokenRepository.findByToken(req.getToken())
                .map(resetToken -> {
                    if (!resetToken.isValid()) {
                        return ResponseEntity.badRequest()
                                .body(Map.of("message", "Token expired or already used."));
                    }

                    return userRepository.findById(resetToken.getUserId())
                            .map(user -> {
                                user.setPasswordHash(passwordEncoder.encode(req.getPassword()));
                                user.setUpdatedAt(Instant.now());
                                userRepository.save(user);

                                // Mark token as used
                                resetToken.setUsed(true);
                                resetTokenRepository.save(resetToken);

                                return ResponseEntity.ok(Map.of(
                                    "message", "Password reset successfully. You can now sign in."
                                ));
                            })
                            .orElse(ResponseEntity.badRequest()
                                    .body(Map.of("message", "User not found.")));
                })
                .orElse(ResponseEntity.badRequest()
                        .body(Map.of("message", "Invalid or expired reset token.")));
    }

    /* ============================================
       HELPERS
       ============================================ */
    private Map<String, Object> buildAuthResponse(String token, User user) {
        return Map.of(
            "token", token,
            "user", Map.of(
                "id",    user.getId(),
                "name",  user.getName(),
                "email", user.getEmail(),
                "role",  user.getRole().name()
            )
        );
    }

    /* ---- DTOs ---- */
    @Data static class RegisterRequest {
        private String name;
        private String email;
        private String password;
        private boolean termsAccepted;
    }

    @Data static class LoginRequest {
        private String email;
        private String password;
    }

    @Data static class ForgotPasswordRequest {
        private String email;
    }

    @Data static class ResetPasswordRequest {
        private String token;
        private String password;
    }
}
