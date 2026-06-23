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
@Document(collection = "certificates")
public class Certificate {

    @Id
    private String id;

    /**
     * Human-readable verifiable ID shown on the certificate.
     * Format: GRF-{COURSE_SLUG_UPPER}-{SHORT_UUID}
     * Example: GRF-PHOTOSHOP-A3F9C2
     */
    @Indexed(unique = true)
    private String certificateId;

    private String userId;
    private String userName;
    private String userEmail;

    private String courseId;
    private String courseName;
    private String courseSlug;

    private Instant issuedAt = Instant.now();

    /** Verification URL: grafide.com/verify/{certificateId} */
    public String getVerifyUrl() {
        return "https://grafide.com/verify/" + certificateId;
    }

    public static String generateCertificateId(String courseSlug) {
        String shortUuid = UUID.randomUUID().toString()
                               .replace("-", "")
                               .substring(0, 8)
                               .toUpperCase();
        return "GRF-" + courseSlug.toUpperCase() + "-" + shortUuid;
    }
}
