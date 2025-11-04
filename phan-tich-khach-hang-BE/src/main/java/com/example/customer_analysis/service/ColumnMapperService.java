package com.example.customer_analysis.service;

import com.example.customer_analysis.config.ColumnMappingConfig;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import lombok.Builder;
import java.util.*;

@Service
@Slf4j
public class ColumnMapperService {

    public Map<String, String> mapColumns(Set<String> uploadedColumns) {
        Map<String, String> mapping = new HashMap<>();

        for (String uploaded : uploadedColumns) {
            String normalized = uploaded.toLowerCase().trim();

            for (var entry : ColumnMappingConfig.COLUMN_MAPPINGS.entrySet()) {
                String standard = entry.getKey();
                List<String> aliases = new ArrayList<>(entry.getValue());
                aliases.add(standard.toLowerCase()); // bao gồm cả chính tên chuẩn

                if (aliases.contains(normalized)) {
                    mapping.put(uploaded, standard);
                    log.info("Mapped column '{}' to '{}'", uploaded, standard);
                    break;
                }
            }
        }

        return mapping;
    }

    public ValidationResult validateColumns(Set<String> uploadedColumns, Map<String, String> mapping) {
        List<String> missingRequired = new ArrayList<>();
        List<String> detectedColumns = new ArrayList<>();
        List<String> missingOptional = new ArrayList<>();

        Set<String> mappedStandardColumns = new HashSet<>(mapping.values());

        // Check minimum required columns
        for (String required : ColumnMappingConfig.MINIMUM_REQUIRED_COLUMNS) {
            if (!mappedStandardColumns.contains(required)) {
                missingRequired.add(required);
            } else {
                detectedColumns.add(required);
            }
        }

        // Check optional columns
        for (String standardColumn : ColumnMappingConfig.COLUMN_MAPPINGS.keySet()) {
            if (!ColumnMappingConfig.MINIMUM_REQUIRED_COLUMNS.contains(standardColumn)) {
                if (!mappedStandardColumns.contains(standardColumn)) {
                    missingOptional.add(standardColumn);
                } else {
                    detectedColumns.add(standardColumn);
                }
            }
        }

        return ValidationResult.builder()
                .valid(missingRequired.isEmpty())
                .detectedColumns(detectedColumns)
                .missingRequired(missingRequired)
                .missingOptional(missingOptional)
                .build();
    }

    public Map<String, Object> normalizeRow(Map<String, Object> originalRow, Map<String, String> columnMapping) {
        Map<String, Object> normalizedRow = new HashMap<>();

        // Map uploaded columns to standard names
        for (Map.Entry<String, Object> entry : originalRow.entrySet()) {
            String uploadedColumn = entry.getKey();
            String standardColumn = columnMapping.get(uploadedColumn);

            if (standardColumn != null) {
                normalizedRow.put(standardColumn, entry.getValue());
            }
        }

        // Fill in missing columns with default values
        for (Map.Entry<String, Object> defaultEntry : ColumnMappingConfig.DEFAULT_VALUES.entrySet()) {
            String column = defaultEntry.getKey();
            if (!normalizedRow.containsKey(column)) {
                normalizedRow.put(column, defaultEntry.getValue());
                log.debug("Using default value for missing column: {}", column);
            }
        }

        return normalizedRow;
    }

    @Data
    @Builder
    public static class ValidationResult {
        private boolean valid;
        private List<String> detectedColumns;
        private List<String> missingRequired;
        private List<String> missingOptional;

    }
}