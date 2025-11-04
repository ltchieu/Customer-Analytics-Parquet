package com.example.customer_analysis.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
public class PredictionResponse {
    private String predictionId;
    private Integer predictedSegment;
    private String segmentName;
    private String segmentDescription;
    private Double confidence;
    private Map<String, Object> probabilities;
    private Map<String, Double> featureImportance;
    private LocalDateTime predictedAt;
    private String recommendation;

}