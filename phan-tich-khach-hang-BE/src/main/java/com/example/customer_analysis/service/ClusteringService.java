package com.example.customer_analysis.service;

import com.example.customer_analysis.dto.response.ClusterResponseDTO;
import com.example.customer_analysis.dto.response.SegmentDTO;
import com.example.customer_analysis.entity.Customer;
import com.example.customer_analysis.entity.Segment;
import com.example.customer_analysis.repository.CustomerRepository;
import com.example.customer_analysis.repository.SegmentRepository;
import lombok.extern.slf4j.Slf4j;
import org.apache.avro.generic.GenericRecord;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.Path;
import org.apache.parquet.avro.AvroParquetReader;
import org.apache.parquet.hadoop.ParquetReader;
import org.apache.parquet.hadoop.util.HadoopInputFile;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import smile.clustering.CentroidClustering;
import smile.clustering.KMeans;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Slf4j
public class ClusteringService {
    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private SegmentRepository segmentRepository;

    private static final int NUM_CLUSTERS = 4;
    private static final int MAX_ITERATIONS = 100;

    public ClusterResponseDTO performClustering(String parquetPath) throws IOException {
        long startTime = System.currentTimeMillis();

        // 1. Load data from Parquet
        List<Customer> customers = loadFromParquet(parquetPath);

        // 2. Prepare features for clustering
        double[][] features = prepareFeatures(customers);

        // 3. Apply KMeans using Smile
        CentroidClustering<double[], double[]> kmeans = KMeans.fit(features, NUM_CLUSTERS, MAX_ITERATIONS);

        // 4. Assign cluster labels to customers
        for (int i = 0; i < customers.size(); i++) {
            int clusterLabel = kmeans.predict(features[i]); // Use predict() method
            customers.get(i).setSegment(clusterLabel);
        }

        // 5. Save customers with segment info
        customerRepository.saveAll(customers);

        // 6. Calculate and save segment statistics
        List<SegmentDTO> segments = calculateSegmentStatistics(customers);

        long processingTime = System.currentTimeMillis() - startTime;

        log.info("Clustering completed in {}ms. {} customers assigned to {} segments",
                processingTime, customers.size(), NUM_CLUSTERS);

        return ClusterResponseDTO.builder()
                .message("Clustering completed successfully")
                .numClusters(NUM_CLUSTERS)
                .totalCustomers(customers.size())
                .segments(segments)
                .processingTimeMs(processingTime)
                .build();
    }

    private List<Customer> loadFromParquet(String parquetPath) throws IOException {
        List<Customer> customers = new ArrayList<>();
        Path path = new Path(parquetPath);

        try (ParquetReader<GenericRecord> reader = AvroParquetReader
                .<GenericRecord>builder(HadoopInputFile.fromPath(path, new Configuration()))
                .build()) {

            GenericRecord record;
            while ((record = reader.read()) != null) {
                Customer customer = new Customer();
                customer.setEducation(getFieldAsString(record, "Education"));
                customer.setMaritalStatus(getFieldAsString(record, "Marital_Status"));
                customer.setIncome(getFieldAsDouble(record, "Income"));
                customer.setMntWines(getFieldAsDouble(record, "MntWines"));
                customer.setMntFruits(getFieldAsDouble(record, "MntFruits"));
                customer.setMntMeatProducts(getFieldAsDouble(record, "MntMeatProducts"));
                customer.setMntFishProducts(getFieldAsDouble(record, "MntFishProducts"));
                customer.setMntSweetProducts(getFieldAsDouble(record, "MntSweetProducts"));
                customer.setMntGoldProds(getFieldAsDouble(record, "MntGoldProds"));
                customer.setNumWebPurchases(getFieldAsInt(record, "NumWebPurchases"));
                customer.setNumCatalogPurchases(getFieldAsInt(record, "NumCatalogPurchases"));
                customer.setNumStorePurchases(getFieldAsInt(record, "NumStorePurchases"));
                customer.setAcceptedCmp1(getFieldAsInt(record, "AcceptedCmp1"));
                customer.setAcceptedCmp2(getFieldAsInt(record, "AcceptedCmp2"));
                customer.setAcceptedCmp3(getFieldAsInt(record, "AcceptedCmp3"));
                customer.setAcceptedCmp4(getFieldAsInt(record, "AcceptedCmp4"));
                customer.setAcceptedCmp5(getFieldAsInt(record, "AcceptedCmp5"));
                customer.setCreatedAt(LocalDateTime.now());

                customers.add(customer);
            }
        }

        return customers;
    }

    private double[][] prepareFeatures(List<Customer> customers) {
        // Select features for clustering (8 features)
        double[][] features = new double[customers.size()][8];

        // Find min/max for normalization
        double[] mins = new double[8];
        double[] maxs = new double[8];
        Arrays.fill(mins, Double.MAX_VALUE);
        Arrays.fill(maxs, Double.MIN_VALUE);

        // First pass: find min/max
        for (Customer c : customers) {
            double[] values = new double[]{
                    c.getIncome() != null ? c.getIncome() : 0,
                    c.getMntWines() != null ? c.getMntWines() : 0,
                    c.getMntMeatProducts() != null ? c.getMntMeatProducts() : 0,
                    c.getMntFishProducts() != null ? c.getMntFishProducts() : 0,
                    c.getNumWebPurchases() != null ? c.getNumWebPurchases() : 0,
                    c.getNumCatalogPurchases() != null ? c.getNumCatalogPurchases() : 0,
                    c.getNumStorePurchases() != null ? c.getNumStorePurchases() : 0,
                    getTotalAcceptedCampaigns(c)
            };

            for (int j = 0; j < 8; j++) {
                mins[j] = Math.min(mins[j], values[j]);
                maxs[j] = Math.max(maxs[j], values[j]);
            }
        }

        // Second pass: normalize
        for (int i = 0; i < customers.size(); i++) {
            Customer c = customers.get(i);
            double[] values = new double[]{
                    c.getIncome() != null ? c.getIncome() : 0,
                    c.getMntWines() != null ? c.getMntWines() : 0,
                    c.getMntMeatProducts() != null ? c.getMntMeatProducts() : 0,
                    c.getMntFishProducts() != null ? c.getMntFishProducts() : 0,
                    c.getNumWebPurchases() != null ? c.getNumWebPurchases() : 0,
                    c.getNumCatalogPurchases() != null ? c.getNumCatalogPurchases() : 0,
                    c.getNumStorePurchases() != null ? c.getNumStorePurchases() : 0,
                    getTotalAcceptedCampaigns(c)
            };

            for (int j = 0; j < 8; j++) {
                features[i][j] = normalize(values[j], mins[j], maxs[j]);
            }
        }

        return features;
    }

    private double normalize(double value, double min, double max) {
        if (max == min) return 0.5; // Avoid division by zero
        return (value - min) / (max - min);
    }

    private int getTotalAcceptedCampaigns(Customer c) {
        return (c.getAcceptedCmp1() != null ? c.getAcceptedCmp1() : 0) +
                (c.getAcceptedCmp2() != null ? c.getAcceptedCmp2() : 0) +
                (c.getAcceptedCmp3() != null ? c.getAcceptedCmp3() : 0) +
                (c.getAcceptedCmp4() != null ? c.getAcceptedCmp4() : 0) +
                (c.getAcceptedCmp5() != null ? c.getAcceptedCmp5() : 0);
    }

    private List<SegmentDTO> calculateSegmentStatistics(List<Customer> customers) {
        Map<Integer, List<Customer>> segmentMap = customers.stream()
                .collect(Collectors.groupingBy(Customer::getSegment));

        List<SegmentDTO> segments = new ArrayList<>();

        for (Map.Entry<Integer, List<Customer>> entry : segmentMap.entrySet()) {
            Integer segmentId = entry.getKey();
            List<Customer> segmentCustomers = entry.getValue();

            Segment segment = new Segment();
            segment.setSegmentId(segmentId);
            segment.setSegmentName("Segment " + segmentId);
            segment.setCustomerCount((long) segmentCustomers.size());

            // Calculate averages
            segment.setAvgIncome(segmentCustomers.stream()
                    .mapToDouble(c -> c.getIncome() != null ? c.getIncome() : 0)
                    .average().orElse(0));

            segment.setAvgMntWines(segmentCustomers.stream()
                    .mapToDouble(c -> c.getMntWines() != null ? c.getMntWines() : 0)
                    .average().orElse(0));

            segment.setAvgNumWebPurchases((int) segmentCustomers.stream()
                    .mapToInt(c -> c.getNumWebPurchases() != null ? c.getNumWebPurchases() : 0)
                    .average().orElse(0));

            // Calculate total spending
            double avgSpending = segmentCustomers.stream()
                    .mapToDouble(c ->
                            (c.getMntWines() != null ? c.getMntWines() : 0) +
                                    (c.getMntFruits() != null ? c.getMntFruits() : 0) +
                                    (c.getMntMeatProducts() != null ? c.getMntMeatProducts() : 0) +
                                    (c.getMntFishProducts() != null ? c.getMntFishProducts() : 0) +
                                    (c.getMntSweetProducts() != null ? c.getMntSweetProducts() : 0) +
                                    (c.getMntGoldProds() != null ? c.getMntGoldProds() : 0)
                    ).average().orElse(0);
            segment.setAvgSpending(avgSpending);

            // Calculate response rate
            long totalResponses = segmentCustomers.stream()
                    .mapToLong(this::getTotalAcceptedCampaigns)
                    .sum();
            double responseRate = (double) totalResponses / (segmentCustomers.size() * 5) * 100;
            segment.setResponseRate(responseRate);

            // Generate description
            segment.setDescription(generateSegmentDescription(segment));
            segment.setUpdatedAt(LocalDateTime.now());

            segmentRepository.save(segment);

            segments.add(convertToSegmentDTO(segment));
        }

        return segments;
    }

    private String generateSegmentDescription(Segment segment) {
        StringBuilder desc = new StringBuilder();

        if (segment.getAvgIncome() > 75000) {
            desc.append("High-income customers");
        } else if (segment.getAvgIncome() > 40000) {
            desc.append("Mid-income customers");
        } else {
            desc.append("Budget-conscious customers");
        }

        if (segment.getAvgSpending() > 1000) {
            desc.append(", high spenders");
        } else {
            desc.append(", moderate spenders");
        }

        if (segment.getResponseRate() > 15) {
            desc.append(", highly responsive to campaigns");
        } else if (segment.getResponseRate() > 8) {
            desc.append(", moderately responsive to campaigns");
        } else {
            desc.append(", low campaign engagement");
        }

        return desc.toString();
    }

    private SegmentDTO convertToSegmentDTO(Segment segment) {
        return SegmentDTO.builder()
                .segmentId(segment.getSegmentId())
                .segmentName(segment.getSegmentName())
                .description(segment.getDescription())
                .customerCount(segment.getCustomerCount())
                .avgIncome(segment.getAvgIncome())
                .avgSpending(segment.getAvgSpending())
                .avgMntWines(segment.getAvgMntWines())
                .avgNumWebPurchases(segment.getAvgNumWebPurchases())
                .responseRate(segment.getResponseRate())
                .build();
    }

    private String getFieldAsString(GenericRecord record, String field) {
        Object value = record.get(field);
        return value != null ? value.toString() : null;
    }

    private Double getFieldAsDouble(GenericRecord record, String field) {
        Object value = record.get(field);
        if (value == null) return null;
        if (value instanceof Number) return ((Number) value).doubleValue();
        try {
            return Double.parseDouble(value.toString());
        } catch (NumberFormatException e) {
            log.warn("Failed to parse double from field {}: {}", field, value);
            return null;
        }
    }

    private Integer getFieldAsInt(GenericRecord record, String field) {
        Object value = record.get(field);
        if (value == null) return null;
        if (value instanceof Number) return ((Number) value).intValue();
        try {
            return Integer.parseInt(value.toString());
        } catch (NumberFormatException e) {
            log.warn("Failed to parse integer from field {}: {}", field, value);
            return null;
        }
    }
}
