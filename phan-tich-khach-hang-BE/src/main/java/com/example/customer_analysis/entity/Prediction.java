package com.example.customer_analysis.entity;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "Predictions")
@Getter
@Setter
public class Prediction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true)
    private String predictionId;

    @Column(nullable = false)
    private String modelId;

    @Column
    private Integer customerId;

    @Column(nullable = false)
    private Integer predictedSegment;

    @Column
    private Double confidence;

    @Column(columnDefinition = "TEXT")
    private String inputData; // JSON string of input features

    @Column(columnDefinition = "TEXT")
    private String probabilities; // JSON string of class probabilities

    @Column(nullable = false)
    private LocalDateTime predictedAt;
}
