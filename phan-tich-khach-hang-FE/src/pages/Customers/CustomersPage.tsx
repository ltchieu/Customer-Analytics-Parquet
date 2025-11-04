import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const CustomersPage: React.FC = () => {
  const barData = {
    labels: ["Nhóm A", "Nhóm B", "Nhóm C", "Nhóm D"],
    datasets: [
      {
        label: "Số lượng khách hàng",
        data: [1250, 890, 756, 604],
        backgroundColor: ["#4f46e5", "#06b6d4", "#f97316", "#a855f7"],
        borderRadius: 6,
        barThickness: 35,
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Danh sách khách hàng
          </h1>
          <p className="text-sm text-gray-500">
            Quản lý thông tin và hoạt động của khách hàng
          </p>
        </div>
        <div className="flex gap-3">
          <input
            className="border rounded-lg px-3 py-2 text-sm"
            placeholder="Tìm kiếm khách hàng..."
          />
          <button className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
            + Thêm mới
          </button>
          <button className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200">
            Xuất CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <select className="border rounded-lg px-3 py-2 text-sm">
          <option>Tất cả nhóm</option>
          <option>Nhóm A</option>
          <option>Nhóm B</option>
          <option>Nhóm C</option>
          <option>Nhóm D</option>
        </select>
        <select className="border rounded-lg px-3 py-2 text-sm">
          <option>Tất cả trạng thái</option>
          <option>Hoạt động</option>
          <option>Không hoạt động</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-md overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left py-3 px-4">Tên</th>
              <th className="text-left py-3 px-4">Email</th>
              <th className="text-left py-3 px-4">Nhóm</th>
              <th className="text-left py-3 px-4">Chi tiêu ($)</th>
              <th className="text-left py-3 px-4">Trạng thái</th>
              <th className="text-left py-3 px-4">Ngày tham gia</th>
              <th className="text-center py-3 px-4">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {[
              {
                name: "Nguyễn Văn A",
                email: "a.nguyen@example.com",
                group: "Nhóm A",
                spend: "1,250",
                status: "Hoạt động",
                joined: "2025-10-10",
              },
              {
                name: "Trần Thị B",
                email: "b.tran@example.com",
                group: "Nhóm B",
                spend: "980",
                status: "Không hoạt động",
                joined: "2025-09-21",
              },
              {
                name: "Lê Văn C",
                email: "c.le@example.com",
                group: "Nhóm C",
                spend: "720",
                status: "Hoạt động",
                joined: "2025-09-15",
              },
            ].map((c, i) => (
              <tr key={i} className="border-t hover:bg-gray-50">
                <td className="py-3 px-4 font-medium">{c.name}</td>
                <td className="py-3 px-4">{c.email}</td>
                <td className="py-3 px-4">{c.group}</td>
                <td className="py-3 px-4">{c.spend}</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      c.status === "Hoạt động"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {c.status}
                  </span>
                </td>
                <td className="py-3 px-4">{c.joined}</td>
                <td className="py-3 px-4 text-center">
                  <button className="text-blue-600 hover:underline">
                    Xem
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl p-4 shadow-md">
        <h2 className="text-sm font-medium text-gray-700 mb-3">
          Phân bố khách hàng theo nhóm
        </h2>
        <div style={{ height: 300 }}>
          <Bar
            data={barData}
            options={{
              plugins: { legend: { display: false } },
              responsive: true,
              maintainAspectRatio: false,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default CustomersPage;
