package com.example.customer_analysis.service;

import com.example.customer_analysis.config.ColumnMappingConfig;
import com.example.customer_analysis.dto.response.CustomerDTO;
import com.example.customer_analysis.dto.response.UploadResponseDTO;
import org.apache.parquet.example.data.Group;
import org.apache.parquet.example.data.GroupFactory;
import org.apache.parquet.example.data.simple.SimpleGroupFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import lombok.extern.slf4j.Slf4j;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.parquet.hadoop.ParquetWriter;
import org.apache.parquet.schema.MessageType;
import org.apache.parquet.schema.PrimitiveType;
import org.apache.parquet.hadoop.example.ExampleParquetWriter;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.conf.Configuration;

import static org.apache.parquet.schema.PrimitiveType.PrimitiveTypeName.*;
import static org.apache.parquet.schema.Type.Repetition.*;

@Service
@Slf4j
public class FileService {

    @Autowired
    private ColumnMapperService columnMapperService;

    private static final String UPLOAD_DIR = "uploads/";
    private static final String PARQUET_DIR = "parquet/";

    public UploadResponseDTO processFile(MultipartFile file) throws IOException {

        String originalFileName = file.getOriginalFilename();

        java.nio.file.Path uploadDirectory = Paths.get(UPLOAD_DIR);
        java.nio.file.Path parquetDirectory = Paths.get(PARQUET_DIR);

        try {
            Files.createDirectories(uploadDirectory);
            Files.createDirectories(parquetDirectory);
            log.info("Created directories: {} and {}", uploadDirectory.toAbsolutePath(), parquetDirectory.toAbsolutePath());
        } catch (IOException e) {
            log.error("Failed to create directories", e);
            throw new IOException("Failed to create upload directories", e);
        }

        String uploadPath = UPLOAD_DIR + originalFileName;
        java.nio.file.Path filePath = Paths.get(uploadPath);
        try {
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            log.info("File saved to: {}", filePath.toAbsolutePath());
        } catch (IOException e) {
            log.error("Failed to save file", e);
            throw new IOException("Failed to save uploaded file", e);
        }

        List<Map<String, Object>> rawData;
        if (originalFileName.endsWith(".csv")) {
            rawData = readCSV(uploadPath);
        } else if (originalFileName.endsWith(".json")) {
            rawData = readJSON(uploadPath);
        } else {
            throw new IllegalArgumentException("Unsupported file type. Only CSV and JSON are supported.");
        }

        if (rawData.isEmpty()) {
            throw new IllegalArgumentException("File is empty or contains no valid data");
        }


        Set<String> uploadedColumns = rawData.get(0).keySet();
        // ADD THIS DEBUG LOGGING
        log.info("========================================");
        log.info("Columns found in uploaded file:");
        uploadedColumns.forEach(col -> log.info("  - '{}'", col));
        log.info("========================================");
        Map<String, String> columnMapping = columnMapperService.mapColumns(uploadedColumns);

// ADD THIS DEBUG LOGGING
        log.info("Column mappings:");
        columnMapping.forEach((uploaded, standard) ->
                log.info("  '{}' -> '{}'", uploaded, standard));
        log.info("========================================");
        ColumnMapperService.ValidationResult validation =
                columnMapperService.validateColumns(uploadedColumns, columnMapping);

        if (!validation.isValid()) {
            throw new IllegalArgumentException(
                    "Missing required columns: " + String.join(", ", validation.getMissingRequired()) +
                            ". Please ensure your file contains at least: " +
                            String.join(", ", ColumnMappingConfig.MINIMUM_REQUIRED_COLUMNS)
            );
        }

        // 5. Normalize data with column mapping and default values
        List<Map<String, Object>> normalizedData = rawData.stream()
                .map(row -> columnMapperService.normalizeRow(row, columnMapping))
                .collect(Collectors.toList());

        // 6. Convert to Parquet
        String parquetFileName = originalFileName.replaceFirst("[.][^.]+$", "") + ".parquet";
        String parquetPath = PARQUET_DIR + parquetFileName;
        convertToParquet(normalizedData, parquetPath);

        // 7. Create preview
        List<CustomerDTO> preview = normalizedData.stream()
                .limit(5)
                .map(this::mapToCustomerDTO)
                .collect(Collectors.toList());

        // 8. Build response with detailed information
        return UploadResponseDTO.builder()
                .message("File uploaded and processed successfully")
                .fileName(parquetFileName)
                .originalFileName(originalFileName)
                .totalRecords(normalizedData.size())
                .preview(preview)
                .parquetPath(parquetPath)
                .detectedColumns(validation.getDetectedColumns())
                .missingColumns(validation.getMissingOptional())
                .columnMappings(columnMapping)
                .build();
    }

    private List<Map<String, Object>> readCSV(String filePath) throws IOException {
        List<Map<String, Object>> records = new ArrayList<>();

        char delimiter = detectDelimiter(filePath);

        // Định dạng CSV
        CSVFormat format = CSVFormat.DEFAULT
                .withDelimiter(delimiter)
                .withFirstRecordAsHeader()
                .withIgnoreHeaderCase()
                .withTrim()
                .withIgnoreEmptyLines();

        // Đọc file (xử lý BOM nếu có)
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(new FileInputStream(filePath), StandardCharsets.UTF_8));
             CSVParser csvParser = new CSVParser(reader, format)) {

            //Log thông tin header
            List<String> headers = csvParser.getHeaderNames();
            log.info("Columns detected: {}", headers);

            // Đọc từng dòng
            for (CSVRecord record : csvParser) {
                Map<String, Object> row = new LinkedHashMap<>();
                for (String header : headers) {
                    String value = record.get(header);
                    row.put(header, value != null && !value.trim().isEmpty() ? value.trim() : null);
                }
                records.add(row);
            }

            log.info("Successfully read {} records from CSV file", records.size());
        } catch (IOException e) {
            log.error("Error reading CSV file: {}", filePath, e);
            throw new IOException("Failed to read CSV file: " + e.getMessage(), e);
        }

        return records;
    }

    private List<Map<String, Object>> readJSON(String filePath) throws IOException {
        ObjectMapper mapper = new ObjectMapper();
        try {
            return mapper.readValue(new File(filePath),
                    new TypeReference<List<Map<String, Object>>>() {
                    });
        } catch (Exception e) {
            // Try reading as single object
            Map<String, Object> singleRecord = mapper.readValue(new File(filePath),
                    new TypeReference<Map<String, Object>>() {
                    });
            return Collections.singletonList(singleRecord);
        }
    }

    private void convertToParquet(List<Map<String, Object>> data, String outputPath) throws IOException {
        Files.createDirectories(Paths.get(PARQUET_DIR));

        // Use normalized column names for schema
        MessageType schema = new MessageType("Customer",
                new PrimitiveType(OPTIONAL, INT32, "ID"),
                new PrimitiveType(OPTIONAL, BINARY, "Education"),
                new PrimitiveType(OPTIONAL, BINARY, "Marital_Status"),
                new PrimitiveType(OPTIONAL, DOUBLE, "Income"),
                new PrimitiveType(OPTIONAL, DOUBLE, "MntWines"),
                new PrimitiveType(OPTIONAL, DOUBLE, "MntFruits"),
                new PrimitiveType(OPTIONAL, DOUBLE, "MntMeatProducts"),
                new PrimitiveType(OPTIONAL, DOUBLE, "MntFishProducts"),
                new PrimitiveType(OPTIONAL, DOUBLE, "MntSweetProducts"),
                new PrimitiveType(OPTIONAL, DOUBLE, "MntGoldProds"),
                new PrimitiveType(OPTIONAL, INT32, "NumWebPurchases"),
                new PrimitiveType(OPTIONAL, INT32, "NumCatalogPurchases"),
                new PrimitiveType(OPTIONAL, INT32, "NumStorePurchases"),
                new PrimitiveType(OPTIONAL, INT32, "AcceptedCmp1"),
                new PrimitiveType(OPTIONAL, INT32, "AcceptedCmp2"),
                new PrimitiveType(OPTIONAL, INT32, "AcceptedCmp3"),
                new PrimitiveType(OPTIONAL, INT32, "AcceptedCmp4"),
                new PrimitiveType(OPTIONAL, INT32, "AcceptedCmp5")
        );

        Path path = new Path(outputPath);
        Configuration conf = new Configuration();

        try (ParquetWriter<Group> writer = ExampleParquetWriter.builder(path)
                .withType(schema)
                .withConf(conf)
                .build()) {

            GroupFactory groupFactory = new SimpleGroupFactory(schema);

            for (Map<String, Object> record : data) {
                Group group = groupFactory.newGroup();

                // Safely add each field
                addFieldToGroup(group, "ID", record.get("ID"), Integer.class);
                addFieldToGroup(group, "Education", record.get("Education"), String.class);
                addFieldToGroup(group, "Marital_Status", record.get("Marital_Status"), String.class);
                addFieldToGroup(group, "Income", record.get("Income"), Double.class);
                addFieldToGroup(group, "MntWines", record.get("MntWines"), Double.class);
                addFieldToGroup(group, "MntFruits", record.get("MntFruits"), Double.class);
                addFieldToGroup(group, "MntMeatProducts", record.get("MntMeatProducts"), Double.class);
                addFieldToGroup(group, "MntFishProducts", record.get("MntFishProducts"), Double.class);
                addFieldToGroup(group, "MntSweetProducts", record.get("MntSweetProducts"), Double.class);
                addFieldToGroup(group, "MntGoldProds", record.get("MntGoldProds"), Double.class);
                addFieldToGroup(group, "NumWebPurchases", record.get("NumWebPurchases"), Integer.class);
                addFieldToGroup(group, "NumCatalogPurchases", record.get("NumCatalogPurchases"), Integer.class);
                addFieldToGroup(group, "NumStorePurchases", record.get("NumStorePurchases"), Integer.class);
                addFieldToGroup(group, "AcceptedCmp1", record.get("AcceptedCmp1"), Integer.class);
                addFieldToGroup(group, "AcceptedCmp2", record.get("AcceptedCmp2"), Integer.class);
                addFieldToGroup(group, "AcceptedCmp3", record.get("AcceptedCmp3"), Integer.class);
                addFieldToGroup(group, "AcceptedCmp4", record.get("AcceptedCmp4"), Integer.class);
                addFieldToGroup(group, "AcceptedCmp5", record.get("AcceptedCmp5"), Integer.class);

                writer.write(group);
            }
        }
    }

    private void addFieldToGroup(Group group, String fieldName, Object value, Class<?> type) {
        if (value == null) {
            return; // Skip null values (OPTIONAL fields)
        }

        try {
            if (type == String.class) {
                group.add(fieldName, value.toString());
            } else if (type == Integer.class) {
                if (value instanceof Number) {
                    group.add(fieldName, ((Number) value).intValue());
                } else {
                    group.add(fieldName, Integer.parseInt(value.toString()));
                }
            } else if (type == Double.class) {
                if (value instanceof Number) {
                    group.add(fieldName, ((Number) value).doubleValue());
                } else {
                    group.add(fieldName, Double.parseDouble(value.toString()));
                }
            }
        } catch (Exception e) {
            log.warn("Failed to add field {} with value {}: {}", fieldName, value, e.getMessage());
        }
    }

    private CustomerDTO mapToCustomerDTO(Map<String, Object> row) {
        return CustomerDTO.builder()
                .id(getIntValue(row, "ID"))
                .education(getStringValue(row, "Education"))
                .maritalStatus(getStringValue(row, "Marital_Status"))
                .income(getDoubleValue(row, "Income"))
                .mntWines(getDoubleValue(row, "MntWines"))
                .mntFruits(getDoubleValue(row, "MntFruits"))
                .mntMeatProducts(getDoubleValue(row, "MntMeatProducts"))
                .mntFishProducts(getDoubleValue(row, "MntFishProducts"))
                .mntSweetProducts(getDoubleValue(row, "MntSweetProducts"))
                .mntGoldProds(getDoubleValue(row, "MntGoldProds"))
                .numWebPurchases(getIntValue(row, "NumWebPurchases"))
                .numCatalogPurchases(getIntValue(row, "NumCatalogPurchases"))
                .numStorePurchases(getIntValue(row, "NumStorePurchases"))
                .acceptedCmp1(getIntValue(row, "AcceptedCmp1"))
                .acceptedCmp2(getIntValue(row, "AcceptedCmp2"))
                .acceptedCmp3(getIntValue(row, "AcceptedCmp3"))
                .acceptedCmp4(getIntValue(row, "AcceptedCmp4"))
                .acceptedCmp5(getIntValue(row, "AcceptedCmp5"))
                .build();
    }

    private Integer getIntValue(Map<String, Object> row, String key) {
        Object value = row.get(key);
        if (value == null) return null;
        try {
            if (value instanceof Number) return ((Number) value).intValue();
            return Integer.parseInt(value.toString());
        } catch (Exception e) {
            log.warn("Failed to parse integer from {}: {}", key, value);
            return null;
        }
    }

    private char detectDelimiter(String filePath) throws IOException {
        Map<Character, Integer> delimiterCounts = new HashMap<>();
        char[] candidates = {',', ';', '\t', '|'};
        try (BufferedReader br = new BufferedReader(new InputStreamReader(new FileInputStream(filePath), StandardCharsets.UTF_8))) {
            String header = br.readLine();
            if (header != null) {
                for (char c : candidates) {
                    delimiterCounts.put(c, header.split(Pattern.quote(String.valueOf(c))).length);
                }
            }
        }

        return delimiterCounts.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(',');
    }


    private Double getDoubleValue(Map<String, Object> row, String key) {
        Object value = row.get(key);
        if (value == null) return null;
        try {
            if (value instanceof Number) return ((Number) value).doubleValue();
            return Double.parseDouble(value.toString());
        } catch (Exception e) {
            log.warn("Failed to parse double from {}: {}", key, value);
            return null;
        }
    }

    private String getStringValue(Map<String, Object> row, String key) {
        Object value = row.get(key);
        return value != null ? value.toString() : null;
    }
}
