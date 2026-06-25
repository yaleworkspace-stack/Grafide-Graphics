package com.grafide.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@Document(collection = "users")
public class User {

    @Id
    private String id;

    private String name;

    @Indexed(unique = true)
    private String email;

    private String passwordHash;

    private Role role = Role.STUDENT;

    private List<String> completedLessons    = new ArrayList<>();
    private List<String> earnedCertificates  = new ArrayList<>();

    /** Terms acceptance — recorded at signup */
    private boolean termsAccepted   = false;
    private Instant termsAcceptedAt = null;

    private Instant createdAt = Instant.now();
    private Instant updatedAt = Instant.now();

    // Tutor-mode fields
    private String  bio            = "";
    private boolean tutorApproved  = false;

    public enum Role {
        STUDENT, TUTOR, ADMIN
    }
}
