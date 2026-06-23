package com.grafide.controller;

import com.grafide.model.Certificate;
import com.grafide.model.Progress;
import com.grafide.repository.CertificateRepository;
import com.grafide.repository.CourseRepository;
import com.grafide.repository.ProgressRepository;
import com.grafide.repository.UserRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/certificates")
@RequiredArgsConstructor
public class CertificateController {

    private final CertificateRepository certificateRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final ProgressRepository progressRepository;

    /** Public certificate verification — grafide.com/verify/{certId} */
    @GetMapping("/verify/{certificateId}")
    public ResponseEntity<?> verifyCertificate(@PathVariable String certificateId) {
        return certificateRepository.findByCertificateId(certificateId)
                .map(cert -> ResponseEntity.ok(Map.of(
                    "valid",       true,
                    "studentName", cert.getUserName(),
                    "courseName",  cert.getCourseName(),
                    "issuedAt",    cert.getIssuedAt().toString(),
                    "verifyUrl",   cert.getVerifyUrl()
                )))
                .orElse(ResponseEntity.ok(Map.of("valid", false, "message", "Certificate not found.")));
    }

    /** Issue a certificate after course completion */
    @PostMapping("/issue")
    public ResponseEntity<?> issueCertificate(@RequestBody IssueRequest req,
                                               Authentication auth) {
        String userId = (String) auth.getPrincipal();

        // Duplicate check
        if (certificateRepository.existsByUserIdAndCourseId(userId, req.getCourseId())) {
            return certificateRepository
                    .findAll().stream()
                    .filter(c -> c.getUserId().equals(userId) && c.getCourseId().equals(req.getCourseId()))
                    .findFirst()
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.badRequest().build());
        }

        var userOpt   = userRepository.findById(userId);
        var courseOpt = courseRepository.findById(req.getCourseId());

        if (userOpt.isEmpty() || courseOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "User or course not found."));
        }

        var user   = userOpt.get();
        var course = courseOpt.get();

        // Verify all lessons completed
        Progress progress = progressRepository
                .findByUserIdAndCourseId(userId, req.getCourseId())
                .orElse(null);

        if (progress == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "No progress found for this course."));
        }

        long totalLessons = course.getLevels().stream()
                .mapToLong(l -> l.getLessons().size()).sum();
        long completedLessons = progress.getCompletedLessons().size();

        if (completedLessons < totalLessons) {
            return ResponseEntity.badRequest().body(Map.of(
                "message", "Course not yet complete.",
                "completed", completedLessons,
                "total", totalLessons
            ));
        }

        Certificate cert = new Certificate();
        cert.setCertificateId(Certificate.generateCertificateId(course.getSlug()));
        cert.setUserId(userId);
        cert.setUserName(user.getName());
        cert.setUserEmail(user.getEmail());
        cert.setCourseId(course.getId());
        cert.setCourseName(course.getName());
        cert.setCourseSlug(course.getSlug());

        certificateRepository.save(cert);

        // Mark progress as completed
        progress.setCourseCompleted(true);
        progress.setCertificateId(cert.getCertificateId());
        progressRepository.save(progress);

        return ResponseEntity.ok(cert);
    }

    /** My certificates */
    @GetMapping("/mine")
    public ResponseEntity<List<Certificate>> myCertificates(Authentication auth) {
        String userId = (String) auth.getPrincipal();
        return ResponseEntity.ok(certificateRepository.findByUserId(userId));
    }

    @Data
    static class IssueRequest {
        private String courseId;
    }
}
