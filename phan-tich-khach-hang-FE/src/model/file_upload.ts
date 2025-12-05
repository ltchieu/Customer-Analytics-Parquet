export interface UploadResponse {
  message: string;
  fileName: string;
  recordsImported: number;
  csvPath: string;
  parquetPath: string;
}

export interface ClusterRequest {
  filePath: string;
  numClusters: number;
}


