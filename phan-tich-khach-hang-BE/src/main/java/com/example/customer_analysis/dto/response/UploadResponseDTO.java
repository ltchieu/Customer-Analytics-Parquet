package com.example.customer_analysis.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@Builder
@AllArgsConstructor
public class UploadResponseDTO {
    private String message;
    private String fileName;
    private String originalFileName;
    private Integer totalRecords;
    private List<CustomerDTO> preview; // First 5 rows
    private String parquetPath;
    private List<String> detectedColumns; // Show what columns were found
    private List<String> missingColumns; // Show what columns are missing
    private Map<String, String> columnMappings; // Show how columns were mapped

    public UploadResponseDTO() {

    }
}