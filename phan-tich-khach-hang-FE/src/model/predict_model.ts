// ML Interfaces
export interface TrainModelRequest {
  modelName: string;
  features: string[];
}

export interface TrainModelResponse {
  code: number;
  message: string;
  data: {
    modelId: string;
    modelName: string;
    trainingDataSize: number;
    numSegments: number;
    accuracy: number;
    modelPath: string;
    trainedAt: string;
    trainingTimeMs: number;
  };
}

export interface PredictRequest {
  income: number;
  mntWines?: number;
  mntFruits?: number;
  mntMeatProducts?: number;
  mntFishProducts?: number;
  mntSweetProducts?: number;
  mntGoldProds?: number;
  numWebPurchases?: number;
  numCatalogPurchases?: number;
  numStorePurchases?: number;
  acceptedCmp1?: number;
  acceptedCmp2?: number;
  acceptedCmp3?: number;
  acceptedCmp4?: number;
  acceptedCmp5?: number;
}

export interface PredictResponse {
  code: number;
  message: string;
  data: {
    predictionId: string;
    predictedSegment: number;
    segmentName: string;
    segmentDescription: string;
    confidence: number;
    probabilities: {
      distances: Record<string, number>;
      segments: Record<string, number>;
    };
    featureImportance: Record<string, number>;
    predictedAt: string;
    recommendation: string;
  };
}