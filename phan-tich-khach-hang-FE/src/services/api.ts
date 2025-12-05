import axios from 'axios';
import { SegmentDTO, ClusterResponse } from '../model/cluster_model';
import { UploadResponse, ClusterRequest } from '../model/file_upload';
import { DashboardDTO } from '../model/dashboard_model';
import { InsightDTO } from '../model/insight_model';
import { CustomerDTO } from '../model/customer_model';
import { TrainModelRequest, TrainModelResponse, PredictRequest, PredictResponse } from '../model/predict_model';
import { ReportGenerationResponse } from '../model/report_model';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const getSegments = async (fileName?: string): Promise<SegmentDTO[]> => {
  try {
    const params: any = {};
    if (fileName) params.fileName = fileName;
    const response = await api.get('/analysis/segments', { params });
    console.log("Segment response: ",response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching segments:', error);
    throw error;
  }
};

export const getInsights = async (fileName?: string): Promise<InsightDTO[]> => {
  try {
    const params: any = {};
    if (fileName) params.fileName = fileName;
    const response = await api.get('/analysis/insights', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching insights:', error);
    throw error;
  }
};

export const getDashboard = async (fileName?: string): Promise<DashboardDTO> => {
  try {
    const params: any = {};
    if (fileName) params.fileName = fileName;
    const response = await api.get('/analysis/dashboard', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    throw error;
  }
};

// Get all customers with optional filters
export const getCustomers = async (segment?: number, maritalStatus?: string, fileName?: string): Promise<CustomerDTO[]> => {
  try {
    const params: any = {};
    if (segment !== undefined) params.segment = segment;
    if (maritalStatus) params.maritalStatus = maritalStatus;
    if (fileName) params.fileName = fileName;
    
    const response = await api.get('/analysis/customers', { params });
    console.log("Customer response: ",response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching customers:', error);
    return [];
  }
};

// Get customer by ID
export const getCustomerById = async (id: number): Promise<CustomerDTO | null> => {
  try {
    const response = await api.get(`/analysis/customers/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching customer:', error);
    return null;
  }
};

// Auth interfaces
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  userId: number;
}

// Login
export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  try {
    const response = await api.post('/auth/login', credentials);
    const { accessToken, refreshToken, userId } = response.data.data;
    
    // Store token
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('userId', userId.toString());
    
    return response.data.data;
  } catch (error: any) {
    console.error('Error logging in:', error);
    throw new Error(error.response?.data?.message || 'Failed to login');
  }
};

// Logout
export const logout = async (): Promise<void> => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.error('Error logging out:', error);
  } finally {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
  }
};

// Refresh token
export const refreshToken = async (): Promise<string> => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await api.post('/auth/refreshtoken', { refreshToken });
    
    const { accessToken, refreshToken: newRefreshToken } = response.data.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', newRefreshToken);
    
    return accessToken;
  } catch (error: any) {
    console.error('Error refreshing token:', error);
    throw new Error(error.response?.data?.message || 'Failed to refresh token');
  }
};

export default api;

// Upload file
export const uploadFile = async (file: File): Promise<UploadResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/analysis/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error: any) {
    console.error('Error uploading file:', error);
    throw new Error(error.response?.data?.message || 'Failed to upload file');
  }
};

// Cluster data
export const clusterData = async (request: ClusterRequest): Promise<ClusterResponse> => {
  try {
    const response = await api.post('/analysis/cluster', null, {
      params: {
        parquetPath: request.filePath,
        numClusters: request.numClusters,
      },
    });
    console.log(response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error clustering data:', error);
    throw new Error(error.response?.data?.message || 'Failed to cluster data');
  }
};


export const getFiles = async (): Promise<string[]> => {
  try {
    const response = await api.get('/analysis/files');
    return response.data;
  } catch (error) {
    console.error('Error fetching files:', error);
    return [];
  }
};



// ML Endpoints
export const trainModel = async (request: TrainModelRequest): Promise<TrainModelResponse> => {
  try {
    const response = await api.post('/ml/train', request);
    return response.data;
  } catch (error: any) {
    console.error('Error training model:', error);
    throw new Error(error.response?.data?.message || 'Failed to train model');
  }
};

export const predictSegment = async (request: PredictRequest): Promise<PredictResponse> => {
  try {
    const response = await api.post('/ml/predict', request);
    console.log("Predict response: ", response.data); 
    return response.data;
  } catch (error: any) {
    console.error('Error predicting segment:', error);
    throw new Error(error.response?.data?.message || 'Failed to predict segment');
  }
};

// Report Endpoints
export const generateReport = async (reportType: string): Promise<ReportGenerationResponse> => {
  try {
    const response = await api.post('/reports/generate', null, {
      params: { reportType }
    });
    return response.data;
  } catch (error: any) {
    console.error('Error generating report:', error);
    throw new Error(error.response?.data?.message || 'Failed to generate report');
  }
};

export const downloadReport = async (reportId: string): Promise<Blob> => {
  try {
    const response = await api.get(`/reports/${reportId}`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error: any) {
    console.error('Error downloading report:', error);
    throw new Error(error.response?.data?.message || 'Failed to download report');
  }
};
