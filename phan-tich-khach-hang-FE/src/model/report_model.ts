export interface ReportGenerationResponse {
  data: {
    reportId: string;
    fileName: string;
    generatedAt: string;
    reportType: string;
    fileSize: number;
    message: string;
  };
}

export type ReportType = 'full' | 'summary' | 'segment';
