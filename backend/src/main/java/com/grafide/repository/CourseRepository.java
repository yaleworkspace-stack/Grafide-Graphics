package com.grafide.repository;

import com.grafide.model.Course;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface CourseRepository extends MongoRepository<Course, String> {
    Optional<Course> findBySlug(String slug);
    List<Course> findByPublishedTrue();
}
