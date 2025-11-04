package com.example.customer_analysis.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class TrainPredictionModelRequest  {
    private String modelName;
    private List<String> features;
}
