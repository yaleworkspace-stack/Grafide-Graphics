package com.grafide.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.Instant;
import java.util.UUID;

@Data
@NoArgsConstructor
@Document(collection = "password_reset_tokens")
public class PasswordResetToken {

    @Id
    private String id;

    @Indexed(unique = true)
    private String token;

    private String userId;
    private String email;

    /** Tokens expire after 1 hour */
    private Instant expiresAt;

    private boolean used = false;
    private Instant createdAt = Instant.now();

    public static PasswordResetToken create(String userId, String email) {
        PasswordResetToken t = new PasswordResetToken();
        t.setToken(UUID.randomUUID().toString().replace("-", ""));
        t.setUserId(userId);
        t.setEmail(email);
        t.setExpiresAt(Instant.now().plusSeconds(3600)); // 1 hour
        return t;
    }

    public boolean isExpired() {
        return Instant.now().isAfter(expiresAt);
    }

    public boolean isValid() {
        return !used && !isExpired();
    }
}
