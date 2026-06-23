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
@Document(collection = "quizzes")
public class Quiz {

    @Id
    private String id;

    private String courseId;
    private String courseSlug;
    private int levelIndex;
    private String title;

    /** Percentage required to pass e.g. 70 */
    private int passMark = 70;

    private List<Question> questions = new ArrayList<>();

    private Instant createdAt = Instant.now();
    private Instant updatedAt = Instant.now();

    @Data
    @NoArgsConstructor
    public static class Question {
        private String text;
        private List<String> options = new ArrayList<>();
        /** Index into options[] that is the correct answer */
        private int correctIndex;
    }
}
