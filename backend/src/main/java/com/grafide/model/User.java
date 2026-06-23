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

    /**
     * Role-based access:
     *  STUDENT — default, can take courses, earn certs
     *  TUTOR   — can create/upload course content (future phase)
     *  ADMIN   — full access, content management
     */
    private Role role = Role.STUDENT;

    private List<String> completedLessons = new ArrayList<>();
    private List<String> earnedCertificates = new ArrayList<>();

    private Instant createdAt = Instant.now();
    private Instant updatedAt = Instant.now();

    // Tutor-mode fields (populated when role = TUTOR)
    private String bio;
    private boolean tutorApproved = false;

    public enum Role {
        STUDENT, TUTOR, ADMIN
    }
}
