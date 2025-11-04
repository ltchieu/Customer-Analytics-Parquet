// React import not required with new JSX transform
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts'
import ChartCard from '../../components/ChartCard'
import StatCard from '../../components/StatsCard'

const clusterData = [
  { name: 'Nhóm A', value: 1250, percentage: 35, avgSpending: 4500 },
  { name: 'Nhóm B', value: 890, percentage: 25, avgSpending: 3200 },
  { name: 'Nhóm C', value: 756, percentage: 21, avgSpending: 2800 },
  { name: 'Nhóm D', value: 604, percentage: 19, avgSpending: 1950 },
]

const incomeDistribution = [
  { name: 'Thu nhập Thấp', value: 450 },
  { name: 'Thu nhập Trung bình', value: 850 },
  { name: 'Thu nhập Cao', value: 950 },
]

const educationDistribution = [
  { name: 'THCS', value: 300 },
  { name: 'THPT', value: 850 },
  { name: 'Đại học', value: 1800 },
]

const avgSpendingByCluster = [
  { group: 'Nhóm A', spending: 4500 },
  { group: 'Nhóm B', spending: 3200 },
  { group: 'Nhóm C', spending: 2800 },
  { group: 'Nhóm D', spending: 1950 },
]

const campaignResponse = [
  { campaign: 'Chiến dịch 1', positive: 320, negative: 180 },
  { campaign: 'Chiến dịch 2', positive: 290, negative: 210 },
  { campaign: 'Chiến dịch 3', positive: 450, negative: 150 },
  { campaign: 'Chiến dịch 4', positive: 380, negative: 220 },
]

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b']

export default function DashboardPage() {
  const totalCustomers = clusterData.reduce((s, g) => s + g.value, 0)
  const avgSpending = Math.round(clusterData.reduce((s, g) => s + g.avgSpending, 0) / (clusterData.length || 1))
  const marketingResponseRate = Math.round((campaignResponse.reduce((s, c) => s + c.positive, 0) / campaignResponse.reduce((s, c) => s + c.positive + c.negative, 0)) * 100)

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
              <div className="text-sm text-gray-500">Cập nhật: Vừa mới</div>
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
              <ChartCard title="Phản hồi chiến dịch" subtitle="Phản hồi tích cực theo chiến dịch">
                <div style={{ width: '100%', height: 280 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={campaignResponse}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="campaign" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="positive" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>

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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ChartCard title="Tỷ lệ theo thu nhập" subtitle="Phân bổ theo mức thu nhập">
                <div style={{ width: '100%', height: 180 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={incomeDistribution} layout="vertical" margin={{ left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={120} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8b5cf6" radius={[6, 6, 6, 6]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>

              <ChartCard title="Trình độ học vấn" subtitle="Phân bố theo học vấn">
                <div style={{ width: '100%', height: 320, paddingTop: '20px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                      <Pie 
                        data={educationDistribution} 
                        cx="50%" 
                        cy="45%" 
                        outerRadius={90} 
                        dataKey="value"
                        label={(entry: any) => `${entry.name}: ${((entry.value / educationDistribution.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(0)}%`}
                        labelLine={{ stroke: '#999', strokeWidth: 1 }}
                      >
                        {educationDistribution.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>

              <ChartCard title="Tình trạng hôn nhân" subtitle="Phân bố theo tình trạng">
                <div style={{ width: '100%', height: 180 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[{ name: 'Đã kết hôn', value: 520 }, { name: 'Độc thân', value: 380 }, { name: 'Ly hôn', value: 50 }]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#ec4899" radius={[6, 6, 6, 6]} />
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