package com.grafide.controller;

import com.grafide.model.Certificate;
import com.grafide.model.User;
import com.grafide.repository.CertificateRepository;
import com.grafide.repository.UserRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final CertificateRepository certificateRepository;

    /** All users */
   @GetMapping("/users")
public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
    return ResponseEntity.ok(
        userRepository.findAll().stream().map(u -> {
            Map<String, Object> m = new java.util.LinkedHashMap<>();
            m.put("id",                 u.getId());
            m.put("name",               u.getName());
            m.put("email",              u.getEmail());
            m.put("role",               u.getRole());
            m.put("createdAt",          u.getCreatedAt());
            m.put("earnedCertificates", u.getEarnedCertificates());
            m.put("tutorApproved",      u.isTutorApproved());
            return m;
        }).toList()
    );
}

    /** Update user role — promote to TUTOR or demote to STUDENT */
    @PutMapping("/users/{id}/role")
    public ResponseEntity<?> updateUserRole(@PathVariable String id,
                                             @RequestBody RoleRequest req) {
        return userRepository.findById(id).map(user -> {
            try {
                User.Role newRole = User.Role.valueOf(req.getRole().toUpperCase());
                if (newRole == User.Role.ADMIN) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("message", "Cannot promote to ADMIN via API."));
                }
                user.setRole(newRole);
                if (newRole == User.Role.TUTOR) user.setTutorApproved(true);
                userRepository.save(user);
                return ResponseEntity.ok(Map.of("message", "Role updated to " + newRole));
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid role."));
            }
        }).orElse(ResponseEntity.notFound().build());
    }

    /** All certificates */
    @GetMapping("/certificates")
    public ResponseEntity<List<Certificate>> getAllCertificates() {
        return ResponseEntity.ok(certificateRepository.findAll());
    }

    @Data
    static class RoleRequest {
        private String role;
    }
}
