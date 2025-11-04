package com.example.customer_analysis.dto.request;

import lombok.Data;

@Data
public class SegmentFilterRequest {
    private Integer segmentId;
    private Double minAvgIncome;
    private Double maxAvgIncome;
}
