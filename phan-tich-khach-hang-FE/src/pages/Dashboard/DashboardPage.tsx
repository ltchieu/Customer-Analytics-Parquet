// React import not required with new JSX transform
import { useEffect, useState } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import ChartCard from '../../components/ChartCard'
import StatCard from '../../components/StatsCard'
import { getDashboard, } from '../../services/api'
import { DashboardDTO } from '../../model/dashboard_model'
import { FileFilter } from '../../components/FileFilter'

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981']

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedFile, setSelectedFile] = useState<string | undefined>(undefined)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true)
        const data = await getDashboard(selectedFile)
        console.log("Dashboard response: ", data);
        setDashboardData(data)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [selectedFile])

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-xl text-gray-600">Đang tải dữ liệu...</div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center flex-col gap-4">
        <div className="text-xl text-red-600">Không thể tải dữ liệu</div>
        <FileFilter selectedFile={selectedFile} onFileSelect={setSelectedFile} />
      </div>
    )
  }

  // Transform segment distribution for chart
  const clusterData = Object.entries(dashboardData.segmentDistribution).map(([segmentId, count]) => {
    const segment = dashboardData.topSegments.find(s => s.segmentId === parseInt(segmentId))
    return {
      name: segment?.segmentName || `Nhóm ${segmentId}`,
      value: count,
      percentage: Math.round((count / dashboardData.totalCustomers) * 100),
      avgSpending: segment?.avgSpending || 0,
    }
  })

  // Transform income distribution by segment
  const incomeDistribution = Object.entries(dashboardData.incomeBySegment).map(([range, segments]) => ({
    name: range === 'Low' ? 'Thu nhập Thấp' : range === 'Medium' ? 'Thu nhập Trung bình' : 'Thu nhập Cao',
    value: Object.values(segments).reduce((sum, count) => sum + count, 0),
  }))

  // Transform education distribution
  const educationDistribution = Object.entries(dashboardData.educationBySegment).map(([level, segments]) => ({
    name: level === 'Basic' ? 'THCS' : level === 'Graduate' ? 'Đại học' : 'Sau ĐH',
    value: Object.values(segments).reduce((sum, count) => sum + count, 0),
  }))

  // Transform marital status distribution
  const maritalDistribution = Object.entries(dashboardData.maritalStatusBySegment).map(([status, segments]) => ({
    name: status === 'Married' ? 'Đã kết hôn' : status === 'Single' ? 'Độc thân' : 'Khác',
    value: Object.values(segments).reduce((sum, count) => sum + count, 0),
  }))

  // Average spending by cluster from top segments
  const avgSpendingByCluster = dashboardData.topSegments.map(segment => ({
    group: segment.segmentName,
    spending: Math.round(segment.avgSpending),
  }))

  const totalCustomers = dashboardData.totalCustomers
  const avgSpending = Math.round(dashboardData.avgSpending)
  const marketingResponseRate = Math.round(dashboardData.marketingResponseRate)

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900">Bảng điều khiển - Phân tích khách hàng</h1>
                <p className="text-gray-600">Tổng quan: Phân khúc, doanh thu và hiệu quả marketing</p>
              </div>
              <div className="flex items-center gap-4">
                <FileFilter selectedFile={selectedFile} onFileSelect={setSelectedFile} />
                <div className="text-sm text-gray-500">Cập nhật: Vừa mới</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              <StatCard title="Tổng khách hàng" value={totalCustomers.toLocaleString()} subtitle="" gradient="linear-gradient(135deg,#ffecd2 0%,#fcb69f 100%)" />
              <StatCard title="Chi tiêu trung bình" value={`$${avgSpending.toLocaleString()}`} subtitle="" gradient="linear-gradient(135deg,#d4fc79 0%,#96e6a1 100%)" />
              <StatCard title="Tỉ lệ phản hồi" value={`${marketingResponseRate}%`} subtitle="" gradient="linear-gradient(135deg,#a1c4fd 0%,#c2e9fb 100%)" />
            </div>

            {/* Main Donut Chart - Full Width */}
            <div className="mb-8">
              <ChartCard title="Tỷ lệ nhóm khách hàng" subtitle="Phân bổ theo phân cụm">
                <div className="flex flex-col lg:flex-row items-center justify-center gap-8 p-6">
                  <div className="relative w-full lg:w-auto" style={{ width: '400px', height: '400px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={clusterData}
                          dataKey="value"
                          cx="50%"
                          cy="50%"
                          innerRadius={100}
                          outerRadius={160}
                          paddingAngle={3}
                          strokeWidth={2}
                        >
                          {clusterData.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v: number) => `${v} khách`} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="text-center">
                        <div className="text-sm font-medium text-gray-500 mb-1">Tổng</div>
                        <div className="text-4xl font-bold text-gray-900 mb-1">{totalCustomers.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">Trung bình</div>
                        <div className="text-base font-semibold text-gray-700">${avgSpending.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                  <div className="w-full lg:w-auto lg:min-w-[280px]">
                    <ul className="space-y-4">
                      {clusterData.map((g, i) => (
                        <li key={g.name} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-4">
                            <span
                              className="inline-block w-4 h-4 rounded-full flex-shrink-0"
                              style={{ background: COLORS[i % COLORS.length] }}
                            />
                            <div>
                              <div className="text-base font-semibold text-gray-800">{g.name}</div>
                              <div className="text-sm text-gray-500">{g.value.toLocaleString()} khách</div>
                            </div>
                          </div>
                          <div className="text-lg font-bold text-gray-700 ml-4">{g.percentage}%</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </ChartCard>
            </div>

            {/* Campaign Response and Spending - Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <ChartCard title="Chi tiêu trung bình theo nhóm" subtitle="So sánh mức chi tiêu">
                <div style={{ width: '100%', height: 280 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={avgSpendingByCluster} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="group" />
                      <YAxis />
                      <Tooltip formatter={(v: number) => `$${v}`} />
                      <Bar dataKey="spending" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>

              <ChartCard title="Phân bố theo thu nhập" subtitle="Phân bổ theo mức thu nhập">
                <div style={{ width: '100%', height: 280 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={incomeDistribution} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ChartCard title="Trình độ học vấn" subtitle="Phân bố theo học vấn">
                <div style={{ width: '100%', height: 280 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={educationDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={(entry: any) => `${entry.name}: ${((entry.value / educationDistribution.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(0)}%`}
                        labelLine={{ stroke: '#999', strokeWidth: 1 }}
                      >
                        {educationDistribution.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>

              <ChartCard title="Tình trạng hôn nhân" subtitle="Phân bố theo tình trạng">
                <div style={{ width: '100%', height: 280 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={maritalDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#ec4899" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}