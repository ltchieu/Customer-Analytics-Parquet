package com.example.customer_analysis.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.Map;

@Data
@Builder
@AllArgsConstructor
public class SegmentDTO {
    private Integer segmentId;
    private String segmentName;
    private String description;
    private Long customerCount;
    private Double avgIncome;
    private Double avgSpending;
    private Double avgMntWines;
    private Integer avgNumWebPurchases;
    private Double responseRate;
    private Map<String, Object> characteristics; // Additional segment stats

    public SegmentDTO() {

    }
}
