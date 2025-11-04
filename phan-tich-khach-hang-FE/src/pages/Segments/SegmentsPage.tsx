import { useEffect, useState } from 'react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { getSegments, SegmentDTO } from '../../services/api';
import ChartCard from '../../components/ChartCard';
import { Card } from '../../components/Card';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444'];

export default function SegmentsPage() {
  const [segments, setSegments] = useState<SegmentDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSegments();
  }, []);

  const fetchSegments = async () => {
    try {
      setLoading(true);
      const data = await getSegments();
      setSegments(data);
      setError(null);
    } catch (err) {
      setError('Không thể tải dữ liệu phân khúc khách hàng');
      console.error('Error fetching segments:', err);
    } finally {
      setLoading(false);
    }
  };

  const prepareRadarData = () => {
    if (!segments.length) return [];

    const metrics = ['avgIncome', 'avgSpending', 'avgMntWines', 'avgNumWebPurchases', 'responseRate'];
    
    return metrics.map(metric => {
      const dataPoint: any = { metric: getMetricLabel(metric) };
      segments.forEach(seg => {
        const value = (seg as any)[metric] || 0;
        const normalized = normalizeValue(metric, value);
        dataPoint[seg.segmentName] = normalized;
      });
      return dataPoint;
    });
  };

  const prepareBarData = () => {
    return segments.map(seg => ({
      name: seg.segmentName,
      'Thu nhập TB': Math.round(seg.avgIncome),
      'Chi tiêu TB': Math.round(seg.avgSpending),
      'Mua rượu TB': Math.round(seg.avgMntWines || 0),
      'Mua web TB': seg.avgNumWebPurchases || 0,
    }));
  };

  const normalizeValue = (metric: string, value: number): number => {
    const maxValues: Record<string, number> = {
      avgIncome: 100000,
      avgSpending: 2000,
      avgMntWines: 1000,
      avgNumWebPurchases: 10,
      responseRate: 100,
    };
    return Math.min(100, (value / (maxValues[metric] || 100)) * 100);
  };

  const getMetricLabel = (metric: string): string => {
    const labels: Record<string, string> = {
      avgIncome: 'Thu nhập',
      avgSpending: 'Chi tiêu',
      avgMntWines: 'Mua rượu',
      avgNumWebPurchases: 'Mua web',
      responseRate: 'Tỷ lệ phản hồi',
    };
    return labels[metric] || metric;
  };

  const formatCurrency = (value: number) => `$${value.toLocaleString()}`;
  const formatPercent = (value: number) => `${value.toFixed(1)}%`;

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu phân khúc...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">{error}</p>
          <button
            onClick={fetchSegments}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-extrabold text-gray-900">Phân khúc khách hàng</h1>
              <p className="text-gray-600">Đặc điểm và phân tích của từng nhóm khách hàng sau phân cụm KMeans</p>
            </div>

            {/* Segment Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {segments.map((segment, index) => (
                <Card key={segment.segmentId} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{segment.segmentName}</h3>
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    >
                      {segment.segmentId}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4 min-h-[60px]">{segment.description}</p>
                  
                  <div className="border-t pt-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Số khách hàng:</span>
                      <span className="font-semibold text-gray-900">{segment.customerCount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Thu nhập TB:</span>
                      <span className="font-semibold text-blue-600">{formatCurrency(segment.avgIncome)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Chi tiêu TB:</span>
                      <span className="font-semibold text-green-600">{formatCurrency(segment.avgSpending)}</span>
                    </div>
                    {segment.avgMntWines !== undefined && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Mua rượu TB:</span>
                        <span className="font-semibold text-purple-600">{formatCurrency(segment.avgMntWines)}</span>
                      </div>
                    )}
                    {segment.avgNumWebPurchases !== undefined && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Mua web TB:</span>
                        <span className="font-semibold text-orange-600">{segment.avgNumWebPurchases.toFixed(1)} lần</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Tỷ lệ phản hồi:</span>
                      <span className="font-semibold text-pink-600">{formatPercent(segment.responseRate)}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Comparison Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Radar Chart */}
              <ChartCard title="So sánh đa chiều" subtitle="Biểu đồ Radar so sánh các chỉ số">
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={prepareRadarData()}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    {segments.map((seg, idx) => (
                      <Radar
                        key={seg.segmentId}
                        name={seg.segmentName}
                        dataKey={seg.segmentName}
                        stroke={COLORS[idx % COLORS.length]}
                        fill={COLORS[idx % COLORS.length]}
                        fillOpacity={0.3}
                      />
                    ))}
                    <Legend />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Bar Chart */}
              <ChartCard title="So sánh chi tiêu và thu nhập" subtitle="Biểu đồ cột các chỉ số chính">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={prepareBarData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Thu nhập TB" fill="#3b82f6" />
                    <Bar dataKey="Chi tiêu TB" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
