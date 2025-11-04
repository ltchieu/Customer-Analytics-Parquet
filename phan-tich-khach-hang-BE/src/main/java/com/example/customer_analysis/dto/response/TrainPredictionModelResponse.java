package com.example.customer_analysis.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
public class TrainPredictionModelResponse  {
    private String modelId;
    private String modelName;
    private Integer trainingDataSize;
    private Integer numSegments;
    private Double accuracy;
    private String modelPath;
    private LocalDateTime trainedAt;
    private Long trainingTimeMs;

}
