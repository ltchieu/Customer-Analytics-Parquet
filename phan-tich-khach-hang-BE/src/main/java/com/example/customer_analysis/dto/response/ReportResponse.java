package com.example.customer_analysis.dto.response;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ReportResponse {
    private String reportId;
    private String reportType; // "PDF" or "DASHBOARD"
    private String downloadUrl;
    private byte[] content; // For PDF
    private String message;
}
