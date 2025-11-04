package com.example.customer_analysis.service;

import com.example.customer_analysis.config.MLConfig;
import com.example.customer_analysis.dto.response.ReportResponse;
import com.example.customer_analysis.entity.Segment;
import com.example.customer_analysis.repository.CustomerRepository;
import com.example.customer_analysis.repository.SegmentRepository;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.io.ByteArrayOutputStream;
import java.io.FileOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.List;

@Service
@Slf4j
public class ReportGenerationService {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private SegmentRepository segmentRepository;

    @Autowired
    private MLConfig mlConfig;

    public ReportResponse generatePDFReport(String reportType) {
        try {
            String reportId = UUID.randomUUID().toString();
            String fileName = "report_" + reportId + ".pdf";
            String filePath = mlConfig.getReportDir() + fileName;

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, baos);
            PdfWriter.getInstance(document, new FileOutputStream(filePath));

            document.open();

            // Title
            Font titleFont = new Font(Font.FontFamily.HELVETICA, 20, Font.BOLD);
            Paragraph title = new Paragraph("Customer Segmentation Analysis Report", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);

            // Date
            Font normalFont = new Font(Font.FontFamily.HELVETICA, 12);
            Paragraph date = new Paragraph("Generated: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")), normalFont);
            date.setAlignment(Element.ALIGN_CENTER);
            date.setSpacingAfter(30);
            document.add(date);

            // Executive Summary
            addSection(document, "Executive Summary");
            long totalCustomers = customerRepository.count();
            List<Segment> segments = segmentRepository.findAll();

            document.add(new Paragraph("Total Customers: " + totalCustomers, normalFont));
            document.add(new Paragraph("Number of Segments: " + segments.size(), normalFont));
            document.add(new Paragraph(" ", normalFont));

            // Segment Details
            addSection(document, "Segment Analysis");

            for (Segment segment : segments) {
                addSegmentDetails(document, segment, normalFont);
            }

            // Segment Distribution Table
            addSection(document, "Segment Distribution");
            addSegmentDistributionTable(document, segments);

            // Recommendations
            addSection(document, "Marketing Recommendations");
            addRecommendations(document, segments, normalFont);

            document.close();

            log.info("✅ PDF report generated: {}", filePath);

            return ReportResponse.builder()
                    .reportId(reportId)
                    .reportType("PDF")
                    .downloadUrl("/reports/" + reportId)
                    .content(baos.toByteArray())
                    .message("Report generated successfully")
                    .build();

        } catch (Exception e) {
            log.error("Error generating PDF report", e);
            throw new RuntimeException("Failed to generate report: " + e.getMessage(), e);
        }
    }

    private void addSection(Document document, String sectionTitle) throws DocumentException {
        Font sectionFont = new Font(Font.FontFamily.HELVETICA, 16, Font.BOLD);
        Paragraph section = new Paragraph(sectionTitle, sectionFont);
        section.setSpacingBefore(20);
        section.setSpacingAfter(10);
        document.add(section);
    }

    private void addSegmentDetails(Document document, Segment segment, Font font) throws DocumentException {
        Font boldFont = new Font(Font.FontFamily.HELVETICA, 12, Font.BOLD);

        document.add(new Paragraph("Segment " + segment.getSegmentId() + ": " + segment.getSegmentName(), boldFont));
        document.add(new Paragraph("Description: " + segment.getDescription(), font));
        document.add(new Paragraph("Customer Count: " + segment.getCustomerCount(), font));
        document.add(new Paragraph("Average Income: $" + String.format("%.2f", segment.getAvgIncome()), font));
        document.add(new Paragraph("Average Spending: $" + String.format("%.2f", segment.getAvgSpending()), font));
        document.add(new Paragraph("Response Rate: " + String.format("%.2f%%", segment.getResponseRate()), font));
        document.add(new Paragraph(" ", font));
    }

    private void addSegmentDistributionTable(Document document, List<Segment> segments) throws DocumentException {
        PdfPTable table = new PdfPTable(5);
        table.setWidthPercentage(100);
        table.setSpacingBefore(10);
        table.setSpacingAfter(10);

        // Headers
        addTableHeader(table, "Segment");
        addTableHeader(table, "Customers");
        addTableHeader(table, "Avg Income");
        addTableHeader(table, "Avg Spending");
        addTableHeader(table, "Response Rate");

        // Data
        for (Segment segment : segments) {
            table.addCell(segment.getSegmentName());
            table.addCell(String.valueOf(segment.getCustomerCount()));
            table.addCell("$" + String.format("%.0f", segment.getAvgIncome()));
            table.addCell("$" + String.format("%.0f", segment.getAvgSpending()));
            table.addCell(String.format("%.1f%%", segment.getResponseRate()));
        }

        document.add(table);
    }

    private void addTableHeader(PdfPTable table, String header) {
        Font headerFont = new Font(Font.FontFamily.HELVETICA, 12, Font.BOLD, BaseColor.WHITE);
        PdfPCell cell = new PdfPCell(new Phrase(header, headerFont));
        cell.setBackgroundColor(BaseColor.DARK_GRAY);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setPadding(5);
        table.addCell(cell);
    }

    private void addRecommendations(Document document, List<Segment> segments, Font font) throws DocumentException {
        for (Segment segment : segments) {
            String recommendation = generateSegmentRecommendation(segment);
            document.add(new Paragraph("• " + segment.getSegmentName() + ": " + recommendation, font));
        }
    }

    private String generateSegmentRecommendation(Segment segment) {
        if (segment.getAvgIncome() > 75000 && segment.getAvgSpending() > 1000) {
            return "Premium segment - focus on high-end products and exclusive offers.";
        } else if (segment.getResponseRate() > 15) {
            return "Highly responsive - increase campaign frequency with personalized messaging.";
        } else if (segment.getResponseRate() < 5) {
            return "Low engagement - implement re-engagement campaigns with strong incentives.";
        } else if (segment.getAvgSpending() < 200) {
            return "Budget-conscious - emphasize value propositions and bundle deals.";
        } else {
            return "Standard segment - maintain regular marketing cadence with tested strategies.";
        }
    }
}
