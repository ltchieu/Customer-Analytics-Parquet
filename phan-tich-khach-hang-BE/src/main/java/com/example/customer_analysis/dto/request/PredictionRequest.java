package com.example.customer_analysis.dto.request;

import lombok.Data;

@Data
public class PredictionRequest {
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
}
