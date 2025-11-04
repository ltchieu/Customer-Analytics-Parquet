package com.example.customer_analysis.dto.request;

import lombok.Data;

@Data
public class CustomerFilterRequest {
    private Integer segment;
    private String maritalStatus;
    private String education;
    private Double minIncome;
    private Double maxIncome;
    private Integer page;
    private Integer size;
}
