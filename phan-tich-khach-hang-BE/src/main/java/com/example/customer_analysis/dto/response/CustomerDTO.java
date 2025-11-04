package com.example.customer_analysis.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class CustomerDTO {
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
    private Integer numDealsPurchases;
    private Integer acceptedCmp1;
    private Integer acceptedCmp2;
    private Integer acceptedCmp3;
    private Integer acceptedCmp4;
    private Integer acceptedCmp5;
    private Integer segment;
    private Double totalSpending;
    private Integer totalCampaignAccepted;

    public CustomerDTO() {

    }
}
