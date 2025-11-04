package com.example.customer_analysis.repository;

import com.example.customer_analysis.entity.MLModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MLModelRepository extends JpaRepository<MLModel, Integer> {
  Optional<MLModel> findByModelId(String modelId);
  Optional<MLModel> findByModelNameAndIsActive(String modelName, Boolean isActive);
  Optional<MLModel> findFirstByIsActiveTrueOrderByTrainedAtDesc();
}