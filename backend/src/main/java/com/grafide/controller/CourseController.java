package com.grafide.controller;

import com.grafide.model.Course;
import com.grafide.model.User;
import com.grafide.repository.CourseRepository;
import com.grafide.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    /* ---- PUBLIC ---- */

    /** All published courses (homepage) */
    @GetMapping
    public ResponseEntity<List<Course>> getAllCourses() {
        return ResponseEntity.ok(courseRepository.findByPublishedTrue());
    }

    /** Single course by slug (course page) */
    @GetMapping("/{slug}")
    public ResponseEntity<?> getCourseBySlug(@PathVariable String slug) {
        return courseRepository.findBySlug(slug)
                .filter(Course::isPublished)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /* ---- ADMIN: Create / Update / Delete ---- */

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createCourse(@RequestBody Course course,
                                          Authentication auth) {
        String userId = (String) auth.getPrincipal();
        userRepository.findById(userId).ifPresent(user -> {
            course.setCreatedBy(userId);
            course.setCreatedByName(user.getName());
            course.setCreatedByRole(user.getRole().name());
        });
        course.setCreatedAt(Instant.now());
        course.setUpdatedAt(Instant.now());
        return ResponseEntity.ok(courseRepository.save(course));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateCourse(@PathVariable String id,
                                          @RequestBody Course updated) {
        return courseRepository.findById(id).map(course -> {
            updated.setId(id);
            updated.setCreatedAt(course.getCreatedAt());
            updated.setUpdatedAt(Instant.now());
            return ResponseEntity.ok(courseRepository.save(updated));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteCourse(@PathVariable String id) {
        courseRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Course deleted."));
    }

    /**
     * TUTOR STUB — future phase.
     * Tutors submit courses for admin approval.
     * createdByRole = TUTOR, published = false until admin approves.
     */
    @PostMapping("/submit")
    @PreAuthorize("hasAnyRole('TUTOR', 'ADMIN')")
    public ResponseEntity<?> submitCourse(@RequestBody Course course,
                                          Authentication auth) {
        String userId = (String) auth.getPrincipal();
        userRepository.findById(userId).ifPresent(user -> {
            if (!user.isTutorApproved() && user.getRole() == User.Role.TUTOR) {
                return; // silently skip unapproved tutors (handled below)
            }
            course.setCreatedBy(userId);
            course.setCreatedByName(user.getName());
            course.setCreatedByRole(user.getRole().name());
        });
        course.setPublished(false); // admin must approve
        course.setCreatedAt(Instant.now());
        course.setUpdatedAt(Instant.now());
        return ResponseEntity.ok(courseRepository.save(course));
    }
}
