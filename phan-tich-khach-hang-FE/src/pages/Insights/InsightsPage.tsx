import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { getInsights, getSegments, InsightDTO, SegmentDTO } from '../../services/api';
import ChartCard from '../../components/ChartCard';
import { Card } from '../../components/Card';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444'];

export default function InsightsPage() {
  const [insights, setInsights] = useState<InsightDTO[]>([]);
  const [segments, setSegments] = useState<SegmentDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [insightsData, segmentsData] = await Promise.all([
        getInsights(),
        getSegments(),
      ]);
      setInsights(insightsData);
      setSegments(segmentsData);
      setError(null);
    } catch (err) {
      setError('Không thể tải dữ liệu phân tích');
      console.error('Error fetching insights:', err);
    } finally {
      setLoading(false);
    }
  };

  const getHighestSpendingSegment = () => {
    if (!segments.length) return null;
    return segments.reduce((max, seg) => 
      seg.avgSpending > max.avgSpending ? seg : max
    );
  };

  const getBestResponseSegment = () => {
    if (!segments.length) return null;
    return segments.reduce((max, seg) => 
      seg.responseRate > max.responseRate ? seg : max
    );
  };

  const prepareComparisonData = () => {
    return segments.map(seg => ({
      name: seg.segmentName,
      'Chi tiêu': Math.round(seg.avgSpending),
      'Thu nhập': Math.round(seg.avgIncome / 100),
      'Phản hồi (%)': parseFloat(seg.responseRate.toFixed(1)),
      'Số KH': seg.customerCount,
    }));
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu phân tích...</p>
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
            onClick={fetchData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const highestSpending = getHighestSpendingSegment();
  const bestResponse = getBestResponseSegment();

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-extrabold text-gray-900">Phân tích & Chiến lược Marketing</h1>
              <p className="text-gray-600">Phân tích chuyên sâu và đề xuất chiến lược cho từng phân khúc khách hàng</p>
            </div>

            {/* Key Findings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Nhóm chi tiêu cao nhất</h3>
                    {highestSpending && (
                      <>
                        <p className="text-2xl font-bold text-blue-600 mt-2">{highestSpending.segmentName}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Chi tiêu trung bình: <span className="font-semibold">${highestSpending.avgSpending.toLocaleString()}</span>
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Phản hồi tốt nhất</h3>
                    {bestResponse && (
                      <>
                        <p className="text-2xl font-bold text-green-600 mt-2">{bestResponse.segmentName}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Tỷ lệ phản hồi: <span className="font-semibold">{bestResponse.responseRate.toFixed(1)}%</span>
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            </div>

            {/* Comparison Table */}
            <Card className="mb-8 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Bảng so sánh phân khúc</h2>
                <p className="text-sm text-gray-600">So sánh các chỉ số quan trọng giữa các nhóm khách hàng</p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phân khúc</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số KH</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thu nhập TB</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chi tiêu TB</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tỷ lệ phản hồi</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đánh giá</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {segments.map((segment, index) => (
                      <tr key={segment.segmentId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div
                              className="w-3 h-3 rounded-full mr-3"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            ></div>
                            <span className="font-semibold text-gray-900">{segment.segmentName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {segment.customerCount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          ${segment.avgIncome.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">
                          ${segment.avgSpending.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {segment.responseRate.toFixed(1)}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            segment.avgSpending > 1000 ? 'bg-green-100 text-green-800' :
                            segment.avgSpending > 500 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {segment.avgSpending > 1000 ? 'Cao' :
                             segment.avgSpending > 500 ? 'Trung bình' : 'Thấp'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Comparison Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <ChartCard title="So sánh chi tiêu và phản hồi" subtitle="Mối tương quan giữa các chỉ số">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={prepareComparisonData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Chi tiêu" fill="#3b82f6" />
                    <Bar dataKey="Phản hồi (%)" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Xu hướng các chỉ số" subtitle="Biểu đồ đường so sánh">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={prepareComparisonData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="Chi tiêu" stroke="#3b82f6" strokeWidth={2} />
                    <Line type="monotone" dataKey="Thu nhập" stroke="#8b5cf6" strokeWidth={2} />
                    <Line type="monotone" dataKey="Phản hồi (%)" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            {/* Strategy Recommendations */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Chiến lược Marketing được đề xuất</h2>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {insights.map((insight, index) => (
                <Card key={insight.segmentId} className="overflow-hidden">
                  <div 
                    className="h-2"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {insight.segmentName || `Phân khúc ${insight.segmentId}`}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">{insight.characteristics}</p>
                      </div>
                      <div className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-semibold">
                        {insight.strategy}
                      </div>
                    </div>

                    <div className="mt-4">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Đề xuất hành động:
                      </h4>
                      <ul className="space-y-2">
                        {insight.recommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">
                              {idx + 1}
                            </span>
                            <span className="text-gray-700">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {insight.keyMetrics && Object.keys(insight.keyMetrics).length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="font-semibold text-gray-900 mb-3">Chỉ số quan trọng:</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {Object.entries(insight.keyMetrics).map(([key, value]) => (
                            <div key={key} className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-xs text-gray-500 uppercase">{key}</p>
                              <p className="text-lg font-bold text-gray-900">{value.toLocaleString()}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
