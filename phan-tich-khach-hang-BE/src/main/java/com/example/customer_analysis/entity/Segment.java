package com.example.customer_analysis.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "Segments")
@Getter
@Setter
public class Segment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private Integer segmentId;
    private String segmentName;
    private String description;
    private Long customerCount;
    private Double avgIncome;
    private Double avgSpending;
    private Double avgMntWines;
    private Integer avgNumWebPurchases;
    private Double responseRate;
    private LocalDateTime updatedAt;
}
