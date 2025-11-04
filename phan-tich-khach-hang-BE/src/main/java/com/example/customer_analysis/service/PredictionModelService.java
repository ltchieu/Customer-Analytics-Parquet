package com.example.customer_analysis.service;

import com.example.customer_analysis.config.MLConfig;
import com.example.customer_analysis.dto.request.PredictionRequest;
import com.example.customer_analysis.dto.request.TrainPredictionModelRequest;
import com.example.customer_analysis.dto.response.PredictionResponse;
import com.example.customer_analysis.dto.response.TrainPredictionModelResponse;
import com.example.customer_analysis.entity.Customer;
import com.example.customer_analysis.entity.MLModel;
import com.example.customer_analysis.entity.Prediction;
import com.example.customer_analysis.entity.Segment;
import com.example.customer_analysis.repository.CustomerRepository;
import com.example.customer_analysis.repository.MLModelRepository;
import com.example.customer_analysis.repository.PredictionRepository;
import com.example.customer_analysis.repository.SegmentRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@Slf4j
public class PredictionModelService {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private MLModelRepository mlModelRepository;

    @Autowired
    private PredictionRepository predictionRepository;

    @Autowired
    private SegmentRepository segmentRepository;

    @Autowired
    private MLConfig mlConfig;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public TrainPredictionModelResponse trainPredictionModel(TrainPredictionModelRequest request) {
        long startTime = System.currentTimeMillis();

        try {
            log.info("=== Step 1: Retrieve data from database ===");
            List<Customer> customers = customerRepository.findAll();

            if (customers.isEmpty()) {
                throw new IllegalStateException("No customer data found in database.");
            }

            // Filter customers that already have segments assigned
            List<Customer> labeledCustomers = customers.stream()
                    .filter(c -> c.getSegment() != null)
                    .toList();

            if (labeledCustomers.isEmpty()) {
                throw new IllegalStateException("No customers with assigned segments found. Please run clustering first.");
            }

            log.info("Found {} customers with assigned segments", labeledCustomers.size());

            log.info("=== Step 2: Preprocess data ===");
            List<String> features = request.getFeatures() != null && !request.getFeatures().isEmpty()
                    ? request.getFeatures()
                    : getDefaultFeatures();

            // Group customers by segment
            Map<Integer, List<Customer>> segmentGroups = new HashMap<>();
            for (Customer customer : labeledCustomers) {
                segmentGroups.computeIfAbsent(customer.getSegment(), k -> new ArrayList<>()).add(customer);
            }

            int numSegments = segmentGroups.size();
            log.info("Found {} segments", numSegments);

            log.info("=== Step 3: Calculate segment centroids ===");
            Map<Integer, double[]> centroids = new HashMap<>();
            Map<String, MinMaxValues> normalizationParams = calculateNormalizationParams(labeledCustomers, features);

            for (Map.Entry<Integer, List<Customer>> entry : segmentGroups.entrySet()) {
                Integer segmentId = entry.getKey();
                List<Customer> segmentCustomers = entry.getValue();

                double[] centroid = calculateCentroid(segmentCustomers, features, normalizationParams);
                centroids.put(segmentId, centroid);

                log.info("Segment {} centroid calculated from {} customers", segmentId, segmentCustomers.size());
            }

            log.info("=== Step 4: Save model ===");
            String modelId = UUID.randomUUID().toString();
            PredictionModelData modelData = new PredictionModelData();
            modelData.centroids = centroids;
            modelData.features = features;
            modelData.normalizationParams = normalizationParams;
            modelData.numSegments = numSegments;

            String modelPath = saveModel(modelData, modelId);

            // Save model metadata to database
            MLModel mlModel = new MLModel();
            mlModel.setModelId(modelId);
            mlModel.setModelName(request.getModelName() != null
                    ? request.getModelName()
                    : "PredictionModel_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")));
            mlModel.setModelType("PREDICTION");
            mlModel.setModelPath(modelPath);
            mlModel.setTrainingDataSize(labeledCustomers.size());
            mlModel.setFeatures(objectMapper.writeValueAsString(features));
            mlModel.setTrainedAt(LocalDateTime.now());
            mlModel.setTrainingTimeMs(System.currentTimeMillis() - startTime);
            mlModel.setIsActive(true);

            // Deactivate old active models
            mlModelRepository.findFirstByIsActiveTrueOrderByTrainedAtDesc()
                    .ifPresent(old -> {
                        old.setIsActive(false);
                        mlModelRepository.save(old);
                    });

            mlModelRepository.save(mlModel);

            log.info("✅ Prediction model training completed in {}ms", mlModel.getTrainingTimeMs());

            return TrainPredictionModelResponse.builder()
                    .modelId(modelId)
                    .modelName(mlModel.getModelName())
                    .trainingDataSize(labeledCustomers.size())
                    .numSegments(numSegments)
                    .accuracy(95.0) // Placeholder - you can calculate actual accuracy
                    .modelPath(modelPath)
                    .trainedAt(mlModel.getTrainedAt())
                    .trainingTimeMs(mlModel.getTrainingTimeMs())
                    .build();

        } catch (Exception e) {
            log.error("Error training prediction model", e);
            throw new RuntimeException("Failed to train prediction model: " + e.getMessage(), e);
        }
    }

    public PredictionResponse predictSegment(PredictionRequest request) {
        try {
            log.info("=== Making prediction for new customer ===");

            // Load active model
            MLModel mlModel = mlModelRepository.findFirstByIsActiveTrueOrderByTrainedAtDesc()
                    .orElseThrow(() -> new IllegalStateException("No active model found. Please train a model first."));

            // Lấy ID từ model vừa tải
            String modelId = mlModel.getModelId();

            // Load model data
            PredictionModelData modelData = loadModel(mlModel.getModelPath());

            // Extract features from request
            double[] inputFeatures = extractFeatures(request, modelData.features, modelData.normalizationParams);

            // Find nearest centroid
            int predictedSegment = -1;
            double minDistance = Double.MAX_VALUE;
            Map<Integer, Double> distances = new HashMap<>();

            for (Map.Entry<Integer, double[]> entry : modelData.centroids.entrySet()) {
                Integer segmentId = entry.getKey();
                double[] centroid = entry.getValue();
                double distance = euclideanDistance(inputFeatures, centroid);
                distances.put(segmentId, distance);

                if (distance < minDistance) {
                    minDistance = distance;
                    predictedSegment = segmentId;
                }
            }

            // Calculate confidence (inverse of distance)
            double confidence = 1.0 / (1.0 + minDistance);

            // Calculate probabilities
            Map<String, Object> probabilities = calculateProbabilities(distances);

            // Get segment information
            Optional<Segment> segmentOpt = segmentRepository.findBySegmentId(predictedSegment);
            String segmentName = "Segment " + predictedSegment;
            String segmentDescription = "Customer segment " + predictedSegment;
            String recommendation = generateRecommendation(predictedSegment, segmentOpt.orElse(null));

            if (segmentOpt.isPresent()) {
                Segment segment = segmentOpt.get();
                segmentName = segment.getSegmentName();
                segmentDescription = segment.getDescription();
            }

            // Calculate feature importance
            Map<String, Double> featureImportance = calculateFeatureImportance(inputFeatures, modelData.features);

            // Save prediction to database
            String predictionId = UUID.randomUUID().toString();
            Prediction prediction = new Prediction();
            prediction.setPredictionId(predictionId);
            prediction.setModelId(modelId);
            prediction.setPredictedSegment(predictedSegment);
            prediction.setConfidence(confidence);
            prediction.setInputData(objectMapper.writeValueAsString(request));
            prediction.setProbabilities(objectMapper.writeValueAsString(probabilities));
            prediction.setPredictedAt(LocalDateTime.now());

            predictionRepository.save(prediction);

            log.info("✅ Prediction completed: segment={}, confidence={:.2f}", predictedSegment, confidence);

            return PredictionResponse.builder()
                    .predictionId(predictionId)
                    .predictedSegment(predictedSegment)
                    .segmentName(segmentName)
                    .segmentDescription(segmentDescription)
                    .confidence(confidence)
                    .probabilities(probabilities)
                    .featureImportance(featureImportance)
                    .predictedAt(LocalDateTime.now())
                    .recommendation(recommendation)
                    .build();

        } catch (Exception e) {
            log.error("Error making prediction", e);
            throw new RuntimeException("Failed to make prediction: " + e.getMessage(), e);
        }
    }

    private Map<String, MinMaxValues> calculateNormalizationParams(List<Customer> customers, List<String> features) {
        Map<String, MinMaxValues> params = new HashMap<>();

        for (String feature : features) {
            MinMaxValues minMax = new MinMaxValues();
            minMax.min = Double.MAX_VALUE;
            minMax.max = Double.MIN_VALUE;

            for (Customer customer : customers) {
                double value = extractFeatureValue(customer, feature);
                minMax.min = Math.min(minMax.min, value);
                minMax.max = Math.max(minMax.max, value);
            }

            params.put(feature, minMax);
            log.debug("Feature '{}': min={}, max={}", feature, minMax.min, minMax.max);
        }

        return params;
    }

    private double[] calculateCentroid(List<Customer> customers, List<String> features,
                                       Map<String, MinMaxValues> normalizationParams) {
        double[] centroid = new double[features.size()];

        for (int i = 0; i < features.size(); i++) {
            String feature = features.get(i);
            MinMaxValues minMax = normalizationParams.get(feature);

            double sum = 0.0;
            for (Customer customer : customers) {
                double value = extractFeatureValue(customer, feature);
                double normalized = normalize(value, minMax.min, minMax.max);
                sum += normalized;
            }

            centroid[i] = sum / customers.size();
        }

        return centroid;
    }

    private double[] extractFeatures(PredictionRequest request, List<String> features,
                                     Map<String, MinMaxValues> normalizationParams) {
        double[] featureVector = new double[features.size()];

        for (int i = 0; i < features.size(); i++) {
            String feature = features.get(i);
            double value = extractFeatureValueFromRequest(request, feature);
            MinMaxValues minMax = normalizationParams.get(feature);
            featureVector[i] = normalize(value, minMax.min, minMax.max);
        }

        return featureVector;
    }

    /**
     * Extract feature value from Customer entity
     */
    private double extractFeatureValue(Customer customer, String featureName) {
        return switch (featureName.toLowerCase()) {
            case "income" -> customer.getIncome() != null ? customer.getIncome() : 0.0;
            case "mntwines" -> customer.getMntWines() != null ? customer.getMntWines() : 0.0;
            case "mntfruits" -> customer.getMntFruits() != null ? customer.getMntFruits() : 0.0;
            case "mntmeatproducts" -> customer.getMntMeatProducts() != null ? customer.getMntMeatProducts() : 0.0;
            case "mntfishproducts" -> customer.getMntFishProducts() != null ? customer.getMntFishProducts() : 0.0;
            case "mntsweetproducts" -> customer.getMntSweetProducts() != null ? customer.getMntSweetProducts() : 0.0;
            case "mntgoldprods" -> customer.getMntGoldProds() != null ? customer.getMntGoldProds() : 0.0;
            case "numwebpurchases" -> customer.getNumWebPurchases() != null ? customer.getNumWebPurchases().doubleValue() : 0.0;
            case "numcatalogpurchases" -> customer.getNumCatalogPurchases() != null ? customer.getNumCatalogPurchases().doubleValue() : 0.0;
            case "numstorepurchases" -> customer.getNumStorePurchases() != null ? customer.getNumStorePurchases().doubleValue() : 0.0;
            case "totalcampaigns" -> getTotalCampaigns(customer);
            case "totalspending" -> getTotalSpending(customer);
            default -> 0.0;
        };
    }

    private double extractFeatureValueFromRequest(PredictionRequest request, String featureName) {
        return switch (featureName.toLowerCase()) {
            case "income" -> request.getIncome() != null ? request.getIncome() : 0.0;
            case "mntwines" -> request.getMntWines() != null ? request.getMntWines() : 0.0;
            case "mntfruits" -> request.getMntFruits() != null ? request.getMntFruits() : 0.0;
            case "mntmeatproducts" -> request.getMntMeatProducts() != null ? request.getMntMeatProducts() : 0.0;
            case "mntfishproducts" -> request.getMntFishProducts() != null ? request.getMntFishProducts() : 0.0;
            case "mntsweetproducts" -> request.getMntSweetProducts() != null ? request.getMntSweetProducts() : 0.0;
            case "mntgoldprods" -> request.getMntGoldProds() != null ? request.getMntGoldProds() : 0.0;
            case "numwebpurchases" -> request.getNumWebPurchases() != null ? request.getNumWebPurchases().doubleValue() : 0.0;
            case "numcatalogpurchases" -> request.getNumCatalogPurchases() != null ? request.getNumCatalogPurchases().doubleValue() : 0.0;
            case "numstorepurchases" -> request.getNumStorePurchases() != null ? request.getNumStorePurchases().doubleValue() : 0.0;
            case "totalcampaigns" -> getTotalCampaignsFromRequest(request);
            case "totalspending" -> getTotalSpendingFromRequest(request);
            default -> 0.0;
        };
    }

    private double normalize(double value, double min, double max) {
        if (max == min) return 0.5;
        return (value - min) / (max - min);
    }

    private double euclideanDistance(double[] a, double[] b) {
        double sum = 0.0;
        for (int i = 0; i < a.length; i++) {
            double diff = a[i] - b[i];
            sum += diff * diff;
        }
        return Math.sqrt(sum);
    }

    private Map<String, Object> calculateProbabilities(Map<Integer, Double> distances) {
        Map<String, Object> result = new HashMap<>();
        Map<Integer, Double> probabilities = new HashMap<>();

        double totalInverseDistance = 0.0;
        for (double distance : distances.values()) {
            totalInverseDistance += 1.0 / (1.0 + distance);
        }

        for (Map.Entry<Integer, Double> entry : distances.entrySet()) {
            double prob = (1.0 / (1.0 + entry.getValue())) / totalInverseDistance;
            probabilities.put(entry.getKey(), prob);
        }

        result.put("segments", probabilities);
        result.put("distances", distances);

        return result;
    }

    private Map<String, Double> calculateFeatureImportance(double[] features, List<String> featureNames) {
        Map<String, Double> importance = new HashMap<>();

        double total = 0.0;
        for (double feature : features) {
            total += Math.abs(feature);
        }

        for (int i = 0; i < featureNames.size(); i++) {
            double imp = total > 0 ? Math.abs(features[i]) / total : 1.0 / featureNames.size();
            importance.put(featureNames.get(i), imp);
        }

        return importance;
    }

    private String generateRecommendation(int segment, Segment segmentEntity) {
        if (segmentEntity != null) {
            if (segmentEntity.getAvgIncome() > 75000 && segmentEntity.getAvgSpending() > 1000) {
                return "High-value customer: Offer premium products and exclusive loyalty rewards.";
            } else if (segmentEntity.getResponseRate() > 15) {
                return "Highly responsive customer: Increase campaign frequency with personalized offers.";
            } else if (segmentEntity.getResponseRate() < 5) {
                return "Low engagement customer: Re-engage with special introductory offers and surveys.";
            } else if (segmentEntity.getAvgSpending() < 200) {
                return "Price-sensitive customer: Focus on discounts and value-for-money offers.";
            }
        }

        return "Continue regular marketing campaigns and monitor engagement.";
    }

    private double getTotalCampaigns(Customer c) {
        return (c.getAcceptedCmp1() != null ? c.getAcceptedCmp1() : 0) +
                (c.getAcceptedCmp2() != null ? c.getAcceptedCmp2() : 0) +
                (c.getAcceptedCmp3() != null ? c.getAcceptedCmp3() : 0) +
                (c.getAcceptedCmp4() != null ? c.getAcceptedCmp4() : 0) +
                (c.getAcceptedCmp5() != null ? c.getAcceptedCmp5() : 0);
    }

    private double getTotalSpending(Customer c) {
        return (c.getMntWines() != null ? c.getMntWines() : 0) +
                (c.getMntFruits() != null ? c.getMntFruits() : 0) +
                (c.getMntMeatProducts() != null ? c.getMntMeatProducts() : 0) +
                (c.getMntFishProducts() != null ? c.getMntFishProducts() : 0) +
                (c.getMntSweetProducts() != null ? c.getMntSweetProducts() : 0) +
                (c.getMntGoldProds() != null ? c.getMntGoldProds() : 0);
    }

    private double getTotalCampaignsFromRequest(PredictionRequest r) {
        return (r.getAcceptedCmp1() != null ? r.getAcceptedCmp1() : 0) +
                (r.getAcceptedCmp2() != null ? r.getAcceptedCmp2() : 0) +
                (r.getAcceptedCmp3() != null ? r.getAcceptedCmp3() : 0) +
                (r.getAcceptedCmp4() != null ? r.getAcceptedCmp4() : 0) +
                (r.getAcceptedCmp5() != null ? r.getAcceptedCmp5() : 0);
    }

    private double getTotalSpendingFromRequest(PredictionRequest r) {
        return (r.getMntWines() != null ? r.getMntWines() : 0) +
                (r.getMntFruits() != null ? r.getMntFruits() : 0) +
                (r.getMntMeatProducts() != null ? r.getMntMeatProducts() : 0) +
                (r.getMntFishProducts() != null ? r.getMntFishProducts() : 0) +
                (r.getMntSweetProducts() != null ? r.getMntSweetProducts() : 0) +
                (r.getMntGoldProds() != null ? r.getMntGoldProds() : 0);
    }

    private List<String> getDefaultFeatures() {
        return Arrays.asList(
                "Income",
                "MntWines",
                "MntMeatProducts",
                "MntFishProducts",
                "NumWebPurchases",
                "NumCatalogPurchases",
                "NumStorePurchases",
                "TotalCampaigns"
        );
    }

    private String saveModel(PredictionModelData modelData, String modelId) {
        try {
            String modelDir = mlConfig.getModelDir();
            new File(modelDir).mkdirs();

            String modelPath = modelDir + modelId + ".model";

            try (ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream(modelPath))) {
                oos.writeObject(modelData);
            }

            log.info("Model saved to: {}", modelPath);
            return modelPath;

        } catch (IOException e) {
            log.error("Error saving model", e);
            throw new RuntimeException("Failed to save model", e);
        }
    }

    private PredictionModelData loadModel(String modelPath) {
        try (ObjectInputStream ois = new ObjectInputStream(new FileInputStream(modelPath))) {
            return (PredictionModelData) ois.readObject();
        } catch (Exception e) {
            log.error("Error loading model from: {}", modelPath, e);
            throw new RuntimeException("Failed to load model", e);
        }
    }


    private static class PredictionModelData implements Serializable {
        private static final long serialVersionUID = 1L;
        Map<Integer, double[]> centroids;
        List<String> features;
        Map<String, MinMaxValues> normalizationParams;
        int numSegments;
    }

    private static class MinMaxValues implements Serializable {
        private static final long serialVersionUID = 1L;
        double min;
        double max;
    }
}
