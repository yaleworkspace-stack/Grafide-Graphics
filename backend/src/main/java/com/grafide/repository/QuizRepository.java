package com.grafide.repository;

import com.grafide.model.Quiz;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface QuizRepository extends MongoRepository<Quiz, String> {
    List<Quiz> findByCourseId(String courseId);
    Optional<Quiz> findByCourseIdAndLevelIndex(String courseId, int levelIndex);
}
