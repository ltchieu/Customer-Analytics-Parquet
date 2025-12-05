export interface SegmentDTO {
  segmentId: number;
  segmentName: string;
  description: string;
  customerCount: number;
  avgIncome: number;
  avgSpending: number;
  avgMntWines: number;
  avgNumWebPurchases: number;
  responseRate: number;
  fileName: string;
  characteristics?: Record<string, any>;
}

export interface ClusterResponse {
  message: string;
  numClusters: number;
  totalCustomers: number;
  segments: SegmentDTO[];
  processingTimeMs: number;
}