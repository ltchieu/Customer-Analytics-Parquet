package com.example.customer_analysis.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "Customers")
@Getter
@Setter
public class Customer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String education;
    private String maritalStatus;
    private Double income;
    private Double mntWines;
    private Double mntFruits;
    private Double mntMeatProducts;
    private Double mntFishProducts;
    private Double mntSweetProducts;
    private Double mntGoldProds;
    private Integer numWebPurchases;
    private Integer numCatalogPurchases;
    private Integer numStorePurchases;
    private Integer acceptedCmp1;
    private Integer acceptedCmp2;
    private Integer acceptedCmp3;
    private Integer acceptedCmp4;
    private Integer acceptedCmp5;
    private Integer segment; // Cluster assignment
    private LocalDateTime createdAt;
}