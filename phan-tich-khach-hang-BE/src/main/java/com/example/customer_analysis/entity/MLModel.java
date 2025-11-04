package com.example.customer_analysis.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "MLModels")
@Getter
@Setter
public class MLModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true)
    private String modelId;

    @Column(nullable = false)
    private String modelName;

    @Column(nullable = false)
    private String modelType; // CLASSIFICATION, CLUSTERING

    @Column(nullable = false)
    private String modelPath; // Path to saved model file

    @Column
    private Integer trainingDataSize;

    @Column
    private Double accuracy;

    @Column(columnDefinition = "TEXT")
    private String features; // JSON string of features used

    @Column(columnDefinition = "TEXT")
    private String metrics; // JSON string of model metrics

    @Column(nullable = false)
    private LocalDateTime trainedAt;

    @Column
    private Long trainingTimeMs;

    @Column
    private Boolean isActive = true;
}