package com.example.customer_analysis.controller;

import com.example.customer_analysis.config.MLConfig;
import com.example.customer_analysis.dto.response.ApiResponse;
import com.example.customer_analysis.dto.response.ReportResponse;
import com.example.customer_analysis.service.ReportGenerationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/reports")
@Slf4j
public class ReportController {

    @Autowired
    private ReportGenerationService reportGenerationService;

    @Autowired
    private MLConfig mlConfig;

    @PostMapping("/generate")
    public ResponseEntity<ApiResponse> generateReport(@RequestParam("reportType") String reportType) {
        log.info("Request received to generate report type: {}", reportType);

        try {
            ReportResponse response = reportGenerationService.generatePDFReport(reportType);
            response.setContent(null);

            return ResponseEntity.ok(ApiResponse.builder().data(response).build());

        } catch (Exception e) {
            log.error("Error generating report: {}", e.getMessage(), e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/{reportId}")
    public ResponseEntity<Resource> downloadReport(@PathVariable String reportId) {
        log.info("Request received to download report: {}", reportId);

        try {
            String fileName = "report_" + reportId + ".pdf";
            Path filePath = Paths.get(mlConfig.getReportDir()).resolve(fileName).normalize();

            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                log.warn("File not found or not readable: {}", filePath);
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            // API này dùng để tải về, nên giữ "attachment"
            headers.setContentDispositionFormData("attachment", fileName);

            return new ResponseEntity<>(resource, headers, HttpStatus.OK);

        } catch (MalformedURLException e) {
            log.error("Error forming file URL for report: {}", reportId, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (Exception e) {
            log.error("Error downloading report: {}", reportId, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}