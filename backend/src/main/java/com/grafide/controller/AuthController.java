package com.grafide.controller;

import com.grafide.model.User;
import com.grafide.repository.UserRepository;
import com.grafide.security.JwtUtil;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    /* ---- REGISTER ---- */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Email already registered."));
        }

        User user = new User();
        user.setName(req.getName());
        user.setEmail(req.getEmail().toLowerCase().trim());
        user.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        user.setRole(User.Role.STUDENT);
        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        return ResponseEntity.ok(buildAuthResponse(token, user));
    }

    /* ---- LOGIN ---- */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        return userRepository.findByEmail(req.getEmail().toLowerCase().trim())
                .map(user -> {
                    if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
                        return ResponseEntity.status(401)
                                .body(Map.of("message", "Invalid email or password."));
                    }
                    String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name());
                    return ResponseEntity.ok(buildAuthResponse(token, user));
                })
                .orElse(ResponseEntity.status(401)
                        .body(Map.of("message", "Invalid email or password.")));
    }

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

    /* ---- Request DTOs ---- */
    @Data static class RegisterRequest {
        private String name;
        private String email;
        private String password;
    }

    @Data static class LoginRequest {
        private String email;
        private String password;
    }
}
