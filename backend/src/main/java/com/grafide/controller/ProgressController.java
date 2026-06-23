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

    /** Get all progress for the logged-in user */
    @GetMapping
    public ResponseEntity<List<Progress>> getMyProgress(Authentication auth) {
        String userId = (String) auth.getPrincipal();
        return ResponseEntity.ok(progressRepository.findByUserId(userId));
    }

    /** Get progress for a specific course */
    @GetMapping("/{courseId}")
    public ResponseEntity<?> getCourseProgress(@PathVariable String courseId,
                                                Authentication auth) {
        String userId = (String) auth.getPrincipal();
        return progressRepository.findByUserIdAndCourseId(userId, courseId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.ok(new Progress())); // empty progress if not started
    }

    /** Mark a lesson as complete */
    @PostMapping("/complete")
    public ResponseEntity<?> completeLesson(@RequestBody CompleteRequest req,
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
                    return p;
                });

        String lessonKey = req.getLevelIndex() + "-" + req.getLessonIndex();
        if (!progress.getCompletedLessons().contains(lessonKey)) {
            progress.getCompletedLessons().add(lessonKey);
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
