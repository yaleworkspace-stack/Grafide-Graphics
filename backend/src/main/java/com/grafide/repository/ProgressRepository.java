package com.grafide.repository;

import com.grafide.model.Progress;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface ProgressRepository extends MongoRepository<Progress, String> {
    Optional<Progress> findByUserIdAndCourseId(String userId, String courseId);
    List<Progress> findByUserId(String userId);
}
