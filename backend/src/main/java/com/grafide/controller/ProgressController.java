package com.grafide.controller;

import com.grafide.model.Progress;
import com.grafide.repository.CourseRepository;
import com.grafide.repository.ProgressRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/progress")
@RequiredArgsConstructor
public class ProgressController {

    private final ProgressRepository progressRepository;
    private final CourseRepository courseRepository;

    /**
     * GET /api/progress
     * All progress records for the logged-in user.
     * Used by the dashboard to render course cards.
     */
    @GetMapping
    public ResponseEntity<List<Progress>> getMyProgress(Authentication auth) {
        String userId = (String) auth.getPrincipal();
        return ResponseEntity.ok(progressRepository.findByUserId(userId));
    }

    /**
     * GET /api/progress/{courseId}
     * Progress for a specific course.
     * Used by the course page to resume from the correct lesson.
     */
    @GetMapping("/{courseId}")
    public ResponseEntity<Progress> getCourseProgress(@PathVariable String courseId,
                                                     Authentication auth) {
        String userId = (String) auth.getPrincipal();
        return ResponseEntity.ok(
            progressRepository
                .findByUserIdAndCourseId(userId, courseId)
                .orElseGet(() -> {
                    Progress empty = new Progress();
                    empty.setUserId(userId);
                    empty.setCourseId(courseId);
                    return empty;
                })
        );
    }

    /**
     * POST /api/progress/complete
     * Mark a lesson as complete. Creates a progress record if this is the first lesson.
     */
    @PostMapping("/complete")
    public ResponseEntity<Progress> completeLesson(@RequestBody CompleteRequest req,
                                                    Authentication auth) {
        String userId = (String) auth.getPrincipal();

        Progress progress = progressRepository
                .findByUserIdAndCourseId(userId, req.getCourseId())
                .orElseGet(() -> {
                    Progress p = new Progress();
                    p.setUserId(userId);
                    p.setCourseId(req.getCourseId());
                    courseRepository.findById(req.getCourseId())
                            .ifPresent(c -> p.setCourseSlug(c.getSlug()));
                    p.setStartedAt(Instant.now());
                    return p;
                });

        String key = req.getLevelIndex() + "-" + req.getLessonIndex();
        if (!progress.getCompletedLessons().contains(key)) {
            progress.getCompletedLessons().add(key);
        }

        progress.setCurrentLevelIndex(req.getLevelIndex());
        progress.setCurrentLessonIndex(req.getLessonIndex());
        progress.setUpdatedAt(Instant.now());

        return ResponseEntity.ok(progressRepository.save(progress));
    }

    @Data
    static class CompleteRequest {
        private String courseId;
        private int levelIndex;
        private int lessonIndex;
    }
}
