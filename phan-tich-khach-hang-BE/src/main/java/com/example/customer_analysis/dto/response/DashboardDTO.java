package com.example.customer_analysis.dto.response;

import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class DashboardDTO {
    private Long totalCustomers;
    private Double avgSpending;
    private Double marketingResponseRate;
    private Map<Integer, Long> segmentDistribution;
    private Map<String, Map<Integer, Long>> incomeBySegment;
    private Map<String, Map<Integer, Long>> educationBySegment;
    private Map<String, Map<Integer, Long>> maritalStatusBySegment;
    private List<SegmentDTO> topSegments;
}