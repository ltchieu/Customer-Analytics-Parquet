package com.example.customer_analysis.controller;

import com.example.customer_analysis.dto.response.*;
import com.example.customer_analysis.entity.Customer;
import com.example.customer_analysis.entity.Segment;
import com.example.customer_analysis.repository.CustomerRepository;
import com.example.customer_analysis.repository.SegmentRepository;
import com.example.customer_analysis.service.ClusteringService;
import com.example.customer_analysis.service.FileService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/analysis")
@AllArgsConstructor
@Slf4j
public class CustomerAnalysisController {

    @Autowired
    private FileService fileService;

    @Autowired
    private ClusteringService clusteringService;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private SegmentRepository segmentRepository;

    // 1. Upload File
    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            UploadResponseDTO response = fileService.processFile(file);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error uploading file", e);

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "File upload failed");
            errorResponse.put("message", extractErrorMessage(e));
            errorResponse.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // 2. Run Clustering
    @PostMapping("/cluster")
    public ResponseEntity<String> runClustering(@RequestParam("parquetPath") String parquetPath) {
        try {
            clusteringService.performClustering(parquetPath);
            return ResponseEntity.ok("Clustering completed successfully");
        } catch (Exception e) {
            log.error("Error during clustering", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Clustering failed: " + e.getMessage());
        }
    }

    // 3. Get Dashboard Data
    @GetMapping("/dashboard")
    public ResponseEntity<DashboardDTO> getDashboard() {
        // Implement dashboard data aggregation
        DashboardDTO dashboard = new DashboardDTO();

        dashboard.setTotalCustomers(customerRepository.count());
        // Tổng số khách hàng
        long totalCustomers = customerRepository.count();
        dashboard.setTotalCustomers(totalCustomers);

        //  Trung bình chi tiêu (avgSpending)
        Double avgSpending = customerRepository.findAverageSpending();
        dashboard.setAvgSpending(avgSpending != null ? avgSpending : 0.0);

        // Tỷ lệ phản hồi chiến dịch marketing (response rate)
        Double responseRate = customerRepository.findAverageResponseRate();
        dashboard.setMarketingResponseRate(responseRate != null ? responseRate : 0.0);

        // Phân bố khách hàng theo segment
        Map<Integer, Long> segmentDistribution = customerRepository.findSegmentDistribution()
                .stream()
                .collect(Collectors.toMap(
                        row -> ((Number) row[0]).intValue(), // segment
                        row -> (Long) row[1]                // count
                ));
        dashboard.setSegmentDistribution(segmentDistribution);

        //Phân bố Income theo Segment (ví dụ nhóm theo khoảng thu nhập)
        Map<String, Map<Integer, Long>> incomeBySegment = customerRepository.findIncomeBySegment()
                .stream()
                .collect(Collectors.groupingBy(
                        row -> (String) row[0], // income range
                        Collectors.toMap(
                                row -> ((Number) row[1]).intValue(), // segment
                                row -> (Long) row[2]
                        )
                ));
        dashboard.setIncomeBySegment(incomeBySegment);

        // Phân bố Education theo Segment
        Map<String, Map<Integer, Long>> educationBySegment = customerRepository.findEducationBySegment()
                .stream()
                .collect(Collectors.groupingBy(
                        row -> (String) row[0], // education level
                        Collectors.toMap(
                                row -> ((Number) row[1]).intValue(),
                                row -> (Long) row[2]
                        )
                ));
        dashboard.setEducationBySegment(educationBySegment);

        // Phân bố Marital Status theo Segment
        Map<String, Map<Integer, Long>> maritalBySegment = customerRepository.findMaritalStatusBySegment()
                .stream()
                .collect(Collectors.groupingBy(
                        row -> (String) row[0], // marital status
                        Collectors.toMap(
                                row -> ((Number) row[1]).intValue(),
                                row -> (Long) row[2]
                        )
                ));
        dashboard.setMaritalStatusBySegment(maritalBySegment);

        //Top segments theo doanh thu trung bình hoặc số lượng khách
        List<Segment> topSegments = segmentRepository.findTop3ByOrderByAvgSpendingDesc();
        List<SegmentDTO> topSegmentDTOs = topSegments.stream()
                .map(segment -> SegmentDTO.builder()
                        .segmentId(segment.getSegmentId())
                        .segmentName(segment.getSegmentName())
                        .avgIncome(segment.getAvgIncome())
                        .avgSpending(segment.getAvgSpending())
                        .customerCount(segment.getCustomerCount())
                        .description(segment.getDescription())
                        .build())
                .collect(Collectors.toList());
        dashboard.setTopSegments(topSegmentDTOs);

        return ResponseEntity.ok(dashboard);
    }

    // 4. Get All Customers
    @GetMapping("/customers")
    public ResponseEntity<List<CustomerDTO>> getCustomers(
            @RequestParam(required = false) Integer segment,
            @RequestParam(required = false) String maritalStatus) {

        List<Customer> customers;
        if (segment != null) {
            customers = customerRepository.findBySegment(segment);
        } else if (maritalStatus != null) {
            customers = customerRepository.findByMaritalStatus(maritalStatus);
        } else {
            customers = customerRepository.findAll();
        }

        List<CustomerDTO> dtos = customers.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    // 5. Get Customer Details
    @GetMapping("/customers/{id}")
    public ResponseEntity<CustomerDTO> getCustomerById(@PathVariable Integer id) {
        return customerRepository.findById(id)
                .map(this::convertToDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 6. Get All Segments
    @GetMapping("/segments")
    public ResponseEntity<List<SegmentDTO>> getSegments() {
        List<Segment> segments = segmentRepository.findAll();
        log.info("Segments found: {}", segments.size());
        List<SegmentDTO> dtos = segments.stream()
                .map(this::convertToSegmentDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // 7. Get Insights
    @GetMapping("/insights")
    public ResponseEntity<List<InsightDTO>> getInsights() {
        List<InsightDTO> insights = new ArrayList<>();
        List<Segment> segments = segmentRepository.findAll();

        for (Segment segment : segments) {
            InsightDTO insight = generateInsight(segment);
            insights.add(insight);
        }

        return ResponseEntity.ok(insights);
    }

    private CustomerDTO convertToDTO(Customer customer) {
        CustomerDTO dto = new CustomerDTO();
        dto.setId(customer.getId());
        dto.setEducation(customer.getEducation());
        dto.setMaritalStatus(customer.getMaritalStatus());
        dto.setIncome(customer.getIncome());
        dto.setSegment(customer.getSegment());
        // ... map other fields
        return dto;
    }

    private SegmentDTO convertToSegmentDTO(Segment segment) {
        SegmentDTO dto = new SegmentDTO();
        dto.setSegmentId(segment.getSegmentId());
        dto.setSegmentName(segment.getSegmentName());
        dto.setDescription(segment.getDescription());
        dto.setCustomerCount(segment.getCustomerCount());
        dto.setAvgIncome(segment.getAvgIncome());
        dto.setAvgSpending(segment.getAvgSpending());
        dto.setResponseRate(segment.getResponseRate());
        return dto;
    }

    private InsightDTO generateInsight(Segment segment) {
        InsightDTO insight = new InsightDTO();
        insight.setSegmentId(segment.getSegmentId());
        insight.setSegmentName(segment.getSegmentName());
        insight.setCharacteristics(segment.getDescription());

        List<String> recommendations = new ArrayList<>();

        // Generate strategy based on segment characteristics
        if (segment.getAvgIncome() > 75000 && segment.getAvgSpending() > 1000) {
            insight.setStrategy("Premium Product Focus");
            recommendations.add("Target with premium product campaigns");
            recommendations.add("Offer exclusive deals and loyalty programs");
            recommendations.add("Focus on quality over price in messaging");
        } else if (segment.getResponseRate() < 8) {
            insight.setStrategy("Re-engagement Campaign");
            recommendations.add("Use stronger promotional discounts");
            recommendations.add("Test different communication channels");
            recommendations.add("Personalize messaging based on past purchases");
        } else {
            insight.setStrategy("Standard Marketing Approach");
            recommendations.add("Continue current marketing strategies");
            recommendations.add("Monitor engagement metrics regularly");
        }

        insight.setRecommendations(recommendations);
        return insight;
    }

    private String extractErrorMessage(Throwable e) {
        // Tìm lỗi gốc (root cause)
        Throwable rootCause = e;
        while (rootCause.getCause() != null) {
            rootCause = rootCause.getCause();
        }

        // Nếu là lỗi "file already exists" thì báo rõ
        if (rootCause instanceof org.apache.hadoop.fs.FileAlreadyExistsException) {
            return "File already exists: " + rootCause.getMessage();
        }

        // Trả về message mặc định
        return rootCause.getClass().getSimpleName() + ": " + rootCause.getMessage();
    }
}
