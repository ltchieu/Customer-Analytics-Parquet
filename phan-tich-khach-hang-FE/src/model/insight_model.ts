export interface InsightDTO {
  segmentId: number;
  segmentName?: string;
  fileName: string;
  strategy: string;
  characteristics: string;
  recommendations: string[];
  keyMetrics?: Record<string, number>;
}