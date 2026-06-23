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
@Document(collection = "courses")
public class Course {

    @Id
    private String id;

    /** URL-safe slug: coreldraw, photoshop, illustrator, msword, canva */
    @Indexed(unique = true)
    private String slug;

    private String name;
    private String tagline;
    private String category; // e.g. "Vector Design", "Photo Editing"

    private List<Level> levels = new ArrayList<>();

    /**
     * Who created this course.
     * Currently always the admin; when tutor mode launches,
     * this field routes content to the right creator dashboard.
     */
    private String createdBy;       // userId
    private String createdByName;   // display name
    private String createdByRole;   // ADMIN | TUTOR

    private boolean published = false;
    private Instant createdAt = Instant.now();
    private Instant updatedAt = Instant.now();

    /* ---- Nested structures ---- */

    @Data
    @NoArgsConstructor
    public static class Level {
        private String name;       // e.g. "Beginner", "Intermediate", "Advanced"
        private int order;
        private List<Lesson> lessons = new ArrayList<>();
    }

    @Data
    @NoArgsConstructor
    public static class Lesson {
        private String title;
        private int order;

        /** Rich text written by admin/tutor (HTML allowed) */
        private String content;

        /** YouTube or external video URL — converted to embed on frontend */
        private String videoUrl;

        /** External links and resources */
        private List<Resource> resources = new ArrayList<>();

        private boolean published = true;
    }

    @Data
    @NoArgsConstructor
    public static class Resource {
        private String title;
        private String url;
        /** "video", "article", "tool", "reference" */
        private String type;
    }
}
