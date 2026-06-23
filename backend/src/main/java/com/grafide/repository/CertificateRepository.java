package com.grafide.repository;

import com.grafide.model.Certificate;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface CertificateRepository extends MongoRepository<Certificate, String> {
    Optional<Certificate> findByCertificateId(String certificateId);
    List<Certificate> findByUserId(String userId);
    boolean existsByUserIdAndCourseId(String userId, String courseId);
}
