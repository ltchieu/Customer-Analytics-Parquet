export interface SegmentDTO {
  segmentId: number;
  segmentName: string;
  description: string;
  customerCount: number;
  avgIncome: number;
  avgSpending: number;
  avgMntWines?: number;
  avgNumWebPurchases?: number;
  responseRate: number;
  characteristics?: Record<string, any>;
}

export interface InsightDTO {
  segmentId: number;
  segmentName?: string;
  strategy: string;
  characteristics: string;
  recommendations: string[];
  keyMetrics?: Record<string, number>;
}

export interface DashboardDTO {
  totalCustomers: number;
  avgSpending: number;
  marketingResponseRate: number;
  segmentDistribution: Record<number, number>;
  incomeBySegment: Record<string, Record<number, number>>;
  educationBySegment: Record<string, Record<number, number>>;
  maritalStatusBySegment: Record<string, Record<number, number>>;
  topSegments: SegmentDTO[];
}

// Mock data
const mockSegments: SegmentDTO[] = [
  {
    segmentId: 0,
    segmentName: "Nhóm Tiết kiệm",
    description: "Khách hàng có thu nhập và chi tiêu thấp, ít tham gia các chương trình marketing",
    customerCount: 245,
    avgIncome: 38500,
    avgSpending: 285,
    avgMntWines: 45,
    avgNumWebPurchases: 2.3,
    responseRate: 8.2,
  },
  {
    segmentId: 1,
    segmentName: "Nhóm Trung lưu",
    description: "Khách hàng có thu nhập và chi tiêu trung bình, phản hồi tốt với các chiến dịch marketing",
    customerCount: 512,
    avgIncome: 52000,
    avgSpending: 650,
    avgMntWines: 180,
    avgNumWebPurchases: 4.5,
    responseRate: 15.4,
  },
  {
    segmentId: 2,
    segmentName: "Nhóm Cao cấp",
    description: "Khách hàng có thu nhập cao, chi tiêu nhiều cho sản phẩm cao cấp",
    customerCount: 189,
    avgIncome: 78000,
    avgSpending: 1450,
    avgMntWines: 520,
    avgNumWebPurchases: 6.8,
    responseRate: 22.5,
  },
  {
    segmentId: 3,
    segmentName: "Nhóm VIP",
    description: "Khách hàng cao cấp nhất với thu nhập và chi tiêu rất cao",
    customerCount: 98,
    avgIncome: 95000,
    avgSpending: 2100,
    avgMntWines: 780,
    avgNumWebPurchases: 8.2,
    responseRate: 28.7,
  },
  {
    segmentId: 4,
    segmentName: "Nhóm Tiềm năng",
    description: "Khách hàng trẻ có thu nhập tốt nhưng chi tiêu thận trọng, có tiềm năng phát triển",
    customerCount: 356,
    avgIncome: 48000,
    avgSpending: 420,
    avgMntWines: 95,
    avgNumWebPurchases: 5.1,
    responseRate: 12.8,
  },
];

const mockInsights: InsightDTO[] = [
  {
    segmentId: 0,
    segmentName: "Nhóm Tiết kiệm",
    strategy: "Giá trị & Ưu đãi",
    characteristics: "Thu nhập thấp, ít chi tiêu, nhạy cảm với giá",
    recommendations: [
      "Tập trung vào các chương trình khuyến mãi và giảm giá",
      "Cung cấp gói sản phẩm giá rẻ với số lượng nhỏ",
      "Email marketing với thông tin ưu đãi hấp dẫn",
      "Xây dựng chương trình tích điểm để tăng lòng trung thành",
    ],
    keyMetrics: {
      "Chi tiêu TB": 285,
      "Phản hồi (%)": 8.2,
      "Số KH": 245,
    },
  },
  {
    segmentId: 1,
    segmentName: "Nhóm Trung lưu",
    strategy: "Cân bằng Giá trị",
    characteristics: "Thu nhập trung bình, chi tiêu ổn định, phản hồi tốt",
    recommendations: [
      "Cung cấp gói combo sản phẩm với giá hợp lý",
      "Marketing đa kênh: email, social media, web",
      "Chương trình khách hàng thân thiết với ưu đãi độc quyền",
      "Cross-selling các sản phẩm bổ sung",
      "Tạo nội dung giáo dục về sản phẩm",
    ],
    keyMetrics: {
      "Chi tiêu TB": 650,
      "Phản hồi (%)": 15.4,
      "Số KH": 512,
    },
  },
  {
    segmentId: 2,
    segmentName: "Nhóm Cao cấp",
    strategy: "Chất lượng Premium",
    characteristics: "Thu nhập cao, chi tiêu nhiều, yêu thích sản phẩm cao cấp",
    recommendations: [
      "Giới thiệu dòng sản phẩm cao cấp và độc quyền",
      "Cung cấp dịch vụ tư vấn cá nhân hóa",
      "Tổ chức sự kiện VIP và wine tasting",
      "Gửi catalog sản phẩm cao cấp qua email",
      "Chương trình ưu đãi cho đơn hàng lớn",
    ],
    keyMetrics: {
      "Chi tiêu TB": 1450,
      "Phản hồi (%)": 22.5,
      "Số KH": 189,
    },
  },
  {
    segmentId: 3,
    segmentName: "Nhóm VIP",
    strategy: "Độc quyền & Đặc biệt",
    characteristics: "Thu nhập rất cao, chi tiêu lớn, khách hàng VIP",
    recommendations: [
      "Cung cấp sản phẩm limited edition và exclusive",
      "Dịch vụ concierge và giao hàng ưu tiên",
      "Mời tham gia câu lạc bộ VIP với nhiều đặc quyền",
      "Tư vấn riêng từ chuyên gia sommelier",
      "Tặng quà cao cấp vào các dịp đặc biệt",
      "Early access cho các sản phẩm mới",
    ],
    keyMetrics: {
      "Chi tiêu TB": 2100,
      "Phản hồi (%)": 28.7,
      "Số KH": 98,
    },
  },
  {
    segmentId: 4,
    segmentName: "Nhóm Tiềm năng",
    strategy: "Phát triển & Giáo dục",
    characteristics: "Trẻ, thu nhập tốt, chi tiêu thận trọng nhưng có tiềm năng",
    recommendations: [
      "Cung cấp nội dung giáo dục về rượu vang và sản phẩm",
      "Tổ chức workshop và tasting session cho người mới",
      "Gói khuyến mãi dùng thử các sản phẩm khác nhau",
      "Marketing qua social media và influencer",
      "Xây dựng community online cho khách hàng trẻ",
    ],
    keyMetrics: {
      "Chi tiêu TB": 420,
      "Phản hồi (%)": 12.8,
      "Số KH": 356,
    },
  },
];

const mockDashboard: DashboardDTO = {
  totalCustomers: 1400,
  avgSpending: 781,
  marketingResponseRate: 17.5,
  segmentDistribution: {
    0: 245,
    1: 512,
    2: 189,
    3: 98,
    4: 356,
  },
  incomeBySegment: {
    "Low": { 0: 180, 1: 85, 2: 20, 3: 5, 4: 110 },
    "Medium": { 0: 50, 1: 320, 2: 45, 3: 10, 4: 200 },
    "High": { 0: 15, 1: 107, 2: 124, 3: 83, 4: 46 },
  },
  educationBySegment: {
    "Basic": { 0: 120, 1: 150, 2: 30, 3: 10, 4: 90 },
    "Graduate": { 0: 100, 1: 280, 2: 100, 3: 45, 4: 200 },
    "Postgrad": { 0: 25, 1: 82, 2: 59, 3: 43, 4: 66 },
  },
  maritalStatusBySegment: {
    "Single": { 0: 80, 1: 180, 2: 50, 3: 25, 4: 165 },
    "Married": { 0: 130, 1: 260, 2: 110, 3: 60, 4: 150 },
    "Other": { 0: 35, 1: 72, 2: 29, 3: 13, 4: 41 },
  },
  topSegments: mockSegments.slice(1, 4),
};

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getSegments = async (): Promise<SegmentDTO[]> => {
  await delay(500);
  return mockSegments;
};

export const getInsights = async (): Promise<InsightDTO[]> => {
  await delay(600);
  return mockInsights;
};

export const getDashboard = async (): Promise<DashboardDTO> => {
  await delay(700);
  return mockDashboard;
};

// Upload related interfaces
export interface UploadResponse {
  success: boolean;
  message: string;
  fileName: string;
  rowCount: number;
  preview: any[];
  parquetPath?: string;
}

export interface ClusterRequest {
  filePath: string;
  numClusters: number;
}

export interface ClusterResponse {
  success: boolean;
  message: string;
  clustersCreated: number;
}

// Upload file (mock)
export const uploadFile = async (file: File): Promise<UploadResponse> => {
  await delay(1500); // Simulate upload time
  
  // Mock preview data
  const mockPreview = [
    { ID: 1, Year_Birth: 1970, Education: "Graduation", Marital_Status: "Married", Income: 58138, Kidhome: 0, Teenhome: 0, Recency: 58, MntWines: 635 },
    { ID: 2, Year_Birth: 1963, Education: "Graduation", Marital_Status: "Single", Income: 46344, Kidhome: 1, Teenhome: 1, Recency: 38, MntWines: 11 },
    { ID: 3, Year_Birth: 1951, Education: "Graduation", Marital_Status: "Married", Income: 71613, Kidhome: 0, Teenhome: 0, Recency: 26, MntWines: 426 },
    { ID: 4, Year_Birth: 1974, Education: "Graduation", Marital_Status: "Married", Income: 26646, Kidhome: 1, Teenhome: 0, Recency: 26, MntWines: 11 },
    { ID: 5, Year_Birth: 1946, Education: "PhD", Marital_Status: "Married", Income: 58293, Kidhome: 1, Teenhome: 0, Recency: 94, MntWines: 173 },
  ];

  return {
    success: true,
    message: "File uploaded and converted to Parquet successfully",
    fileName: file.name,
    rowCount: 2240,
    preview: mockPreview,
    parquetPath: `/data/parquet/${file.name.replace(/\.(csv|json)$/, '.parquet')}`,
  };
};

// Cluster data (mock)
export const clusterData = async (request: ClusterRequest): Promise<ClusterResponse> => {
  await delay(2000); // Simulate clustering time
  
  return {
    success: true,
    message: "Clustering completed successfully",
    clustersCreated: request.numClusters,
  };
};
