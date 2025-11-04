package com.example.customer_analysis.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class ClusterRequest {
    private String parquetPath;
    private Integer numClusters; // Default: 4
    private List<String> features; // Optional: specify which features to use for clustering
}
