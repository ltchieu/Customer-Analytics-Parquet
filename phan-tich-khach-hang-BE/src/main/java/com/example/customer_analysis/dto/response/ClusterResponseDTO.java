package com.example.customer_analysis.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ClusterResponseDTO {
    private String message;
    private Integer numClusters;
    private Integer totalCustomers;
    private List<SegmentDTO> segments;
    private Long processingTimeMs;
}
