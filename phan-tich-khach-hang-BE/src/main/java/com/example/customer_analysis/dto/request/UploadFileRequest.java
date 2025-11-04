package com.example.customer_analysis.dto.request;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class UploadFileRequest {
    private MultipartFile file;
    private Integer numClusters; // Optional: let user choose number of clusters
    private Boolean autoCluster; // Whether to run clustering immediately after upload
}