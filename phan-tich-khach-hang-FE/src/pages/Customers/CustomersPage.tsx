import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { getCustomers, getSegments } from "../../services/api";
import { SegmentDTO } from "../../model/cluster_model";
import { CustomerDTO } from "../../model/customer_model";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

import { FileFilter } from '../../components/FileFilter';

const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerDTO[]>([]);
  const [segments, setSegments] = useState<SegmentDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSegment, setSelectedSegment] = useState<number | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFile, setSelectedFile] = useState<string | undefined>(undefined);

  useEffect(() => {
    fetchData();
  }, [selectedSegment, selectedFile]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [customersData, segmentsData] = await Promise.all([
        getCustomers(selectedSegment, undefined, selectedFile),
        getSegments(selectedFile),
      ]);
      setCustomers(customersData);
      setSegments(segmentsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.id.toString().includes(searchTerm) ||
    customer.education.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.maritalStatus.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const barData = {
    labels: segments.map(s => s.segmentName),
    datasets: [
      {
        label: "Số lượng khách hàng",
        data: segments.map(s => s.customerCount),
        backgroundColor: ["#4f46e5", "#06b6d4", "#f97316", "#a855f7", "#10b981"],
        borderRadius: 6,
        barThickness: 35,
      },
    ],
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-xl text-gray-600">Đang tải dữ liệu...</div>
      </div>
    );
  }

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
        <div className="flex gap-3 items-center">
          <FileFilter selectedFile={selectedFile} onFileSelect={setSelectedFile} />
          <input
            className="border rounded-lg px-3 py-2 text-sm"
            placeholder="Tìm kiếm khách hàng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200">
            Xuất CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <select
          className="border rounded-lg px-3 py-2 text-sm"
          value={selectedSegment ?? ''}
          onChange={(e) => setSelectedSegment(e.target.value ? parseInt(e.target.value) : undefined)}
        >
          <option value="">Tất cả nhóm</option>
          {segments.map(segment => (
            <option key={segment.segmentId} value={segment.segmentId}>
              {segment.segmentName}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-md overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left py-3 px-4">ID</th>
              <th className="text-left py-3 px-4">Học vấn</th>
              <th className="text-left py-3 px-4">Tình trạng hôn nhân</th>
              <th className="text-left py-3 px-4">Thu nhập ($)</th>
              <th className="text-left py-3 px-4">Nhóm</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500">
                  Không có dữ liệu khách hàng
                </td>
              </tr>
            ) : (
              filteredCustomers.slice(0, 50).map((customer) => {
                const segment = segments.find(s => s.segmentId === customer.segment);
                return (
                  <tr key={customer.id} className="border-t hover:bg-gray-50 cursor-pointer" onClick={() => window.location.href = `/customers/${customer.id}`}>
                    <td className="py-3 px-4 font-medium text-blue-600 hover:underline">
                      {customer.id}
                    </td>
                    <td className="py-3 px-4">{customer.education}</td>
                    <td className="py-3 px-4">{customer.maritalStatus}</td>
                    <td className="py-3 px-4">${customer.income?.toLocaleString() ?? 'N/A'}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                        {segment?.segmentName || `Nhóm ${customer.segment}`}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        {filteredCustomers.length > 50 && (
          <div className="py-4 px-4 text-center text-sm text-gray-500 border-t">
            Hiển thị 50/{filteredCustomers.length} khách hàng
          </div>
        )}
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
