package com.grafide.controller;

import com.grafide.model.Quiz;
import com.grafide.repository.CourseRepository;
import com.grafide.repository.QuizRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/quizzes")
@RequiredArgsConstructor
public class QuizController {

    private final QuizRepository quizRepository;
    private final CourseRepository courseRepository;

    /** All quizzes — admin panel */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Quiz>> getAllQuizzes() {
        return ResponseEntity.ok(quizRepository.findAll());
    }

    /** Quiz for a specific course level — student takes this */
    @GetMapping("/course/{courseId}/level/{levelIndex}")
    public ResponseEntity<?> getQuizForLevel(@PathVariable String courseId,
                                              @PathVariable int levelIndex) {
        return quizRepository.findByCourseIdAndLevelIndex(courseId, levelIndex)
                .map(quiz -> {
                    // Strip correct answers before sending to student
                    quiz.getQuestions().forEach(q -> q.setCorrectIndex(-1));
                    return ResponseEntity.ok(quiz);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /** Submit quiz answers — returns score + pass/fail */
    @PostMapping("/{quizId}/submit")
    public ResponseEntity<?> submitQuiz(@PathVariable String quizId,
                                         @RequestBody SubmitRequest req,
                                         Authentication auth) {
        return quizRepository.findById(quizId).map(quiz -> {
            int correct = 0;
            List<Quiz.Question> questions = quiz.getQuestions();

            for (int i = 0; i < questions.size(); i++) {
                if (i < req.getAnswers().size() &&
                    req.getAnswers().get(i) == questions.get(i).getCorrectIndex()) {
                    correct++;
                }
            }

            int total   = questions.size();
            int score   = total > 0 ? (correct * 100 / total) : 0;
            boolean pass = score >= quiz.getPassMark();

            return ResponseEntity.ok(Map.of(
                "score",      score,
                "correct",    correct,
                "total",      total,
                "passed",     pass,
                "passMark",   quiz.getPassMark(),
                "courseId",   quiz.getCourseId(),
                "levelIndex", quiz.getLevelIndex()
            ));
        }).orElse(ResponseEntity.notFound().build());
    }

    /** Create quiz — admin */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Quiz> createQuiz(@RequestBody Quiz quiz) {
        courseRepository.findById(quiz.getCourseId())
                .ifPresent(c -> quiz.setCourseSlug(c.getSlug()));
        quiz.setCreatedAt(Instant.now());
        quiz.setUpdatedAt(Instant.now());
        return ResponseEntity.ok(quizRepository.save(quiz));
    }

    /** Update quiz — admin */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateQuiz(@PathVariable String id, @RequestBody Quiz updated) {
        return quizRepository.findById(id).map(existing -> {
            updated.setId(id);
            updated.setCreatedAt(existing.getCreatedAt());
            updated.setUpdatedAt(Instant.now());
            return ResponseEntity.ok(quizRepository.save(updated));
        }).orElse(ResponseEntity.notFound().build());
    }

    /** Delete quiz — admin */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteQuiz(@PathVariable String id) {
        quizRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Quiz deleted."));
    }

    @Data
    static class SubmitRequest {
        private List<Integer> answers;
    }
}
