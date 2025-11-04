package com.example.customer_analysis.controller;
import com.example.customer_analysis.dto.request.PredictionRequest;
import com.example.customer_analysis.dto.request.TrainPredictionModelRequest;
import com.example.customer_analysis.dto.response.ApiResponse;
import com.example.customer_analysis.dto.response.PredictionResponse;
import com.example.customer_analysis.dto.response.TrainPredictionModelResponse;
import com.example.customer_analysis.service.PredictionModelService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ml")
@Slf4j
public class MLController {

    @Autowired
    private PredictionModelService predictionModelService;

    @PostMapping("/train")
    public ResponseEntity<ApiResponse<TrainPredictionModelResponse>> trainModel(
            @RequestBody TrainPredictionModelRequest request) {
        try {
            log.info("Training prediction model: {}", request.getModelName());
            TrainPredictionModelResponse response = predictionModelService.trainPredictionModel(request);

            ApiResponse<TrainPredictionModelResponse> apiResponse = new ApiResponse<>();
            apiResponse.setCode(HttpStatus.OK.value());
            apiResponse.setMessage("Prediction model trained successfully");
            apiResponse.setData(response);

            return ResponseEntity.ok(apiResponse);
        } catch (Exception e) {
            log.error("Error training model", e);
            ApiResponse<TrainPredictionModelResponse> apiResponse = new ApiResponse<>();
            apiResponse.setCode(HttpStatus.INTERNAL_SERVER_ERROR.value());
            apiResponse.setMessage("Failed to train model: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(apiResponse);
        }
    }


    @PostMapping("/predict")
    public ResponseEntity<ApiResponse<PredictionResponse>> predictSegment(
            @RequestBody PredictionRequest request) {
        try {
            log.info("Making prediction for new customer");
            PredictionResponse response = predictionModelService.predictSegment(request);

            ApiResponse<PredictionResponse> apiResponse = new ApiResponse<>();
            apiResponse.setCode(HttpStatus.OK.value());
            apiResponse.setMessage("Prediction completed successfully");
            apiResponse.setData(response);

            return ResponseEntity.ok(apiResponse);
        } catch (Exception e) {
            log.error("Error making prediction", e);
            ApiResponse<PredictionResponse> apiResponse = new ApiResponse<>();
            apiResponse.setCode(HttpStatus.INTERNAL_SERVER_ERROR.value());
            apiResponse.setMessage("Failed to make prediction: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(apiResponse);
        }
    }
}
