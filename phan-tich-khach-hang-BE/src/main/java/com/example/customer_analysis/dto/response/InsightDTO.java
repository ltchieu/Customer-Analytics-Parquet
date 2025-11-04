package com.example.customer_analysis.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class InsightDTO {
    private Integer segmentId;
    private String segmentName;
    private String strategy;
    private String characteristics;
    private List<String> recommendations;
    private Map<String, Double> keyMetrics;
}
