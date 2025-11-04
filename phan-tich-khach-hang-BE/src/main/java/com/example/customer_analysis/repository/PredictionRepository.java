package com.example.customer_analysis.repository;

import com.example.customer_analysis.entity.Prediction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PredictionRepository extends JpaRepository<Prediction, Integer> {
  Optional<Prediction> findByPredictionId(String predictionId);
  List<Prediction> findByModelId(String modelId);
  List<Prediction> findByCustomerId(Integer customerId);
}