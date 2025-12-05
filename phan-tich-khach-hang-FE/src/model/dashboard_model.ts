import { SegmentDTO } from "./cluster_model";

export interface DashboardDTO {
  fileName: string;
  totalCustomers: number;
  avgSpending: number;
  marketingResponseRate: number;
  segmentDistribution: Record<number, number>;
  incomeBySegment: Record<string, Record<number, number>>;
  educationBySegment: Record<string, Record<number, number>>;
  maritalStatusBySegment: Record<string, Record<number, number>>;
  topSegments: SegmentDTO[];
}