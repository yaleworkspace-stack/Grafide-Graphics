package com.grafide.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@Document(collection = "progress")
public class Progress {

    @Id
    private String id;

    private String userId;
    private String courseId;
    private String courseSlug;

    /**
     * Keys in format "{levelIndex}-{lessonIndex}"
     * e.g. "0-0", "0-1", "1-0"
     */
    private List<String> completedLessons = new ArrayList<>();

    private int currentLevelIndex = 0;
    private int currentLessonIndex = 0;

    private boolean courseCompleted = false;
    private String certificateId; // set when course is completed

    private Instant startedAt  = Instant.now();
    private Instant updatedAt  = Instant.now();
}
