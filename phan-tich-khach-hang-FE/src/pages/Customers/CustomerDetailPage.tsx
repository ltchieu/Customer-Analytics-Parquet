import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCustomerById } from '../../services/api';
import { CustomerDTO } from '../../model/customer_model';
import { Card } from '../../components/Card';
import { ArrowLeft } from 'lucide-react';

export default function CustomerDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [customer, setCustomer] = useState<CustomerDTO | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCustomer = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const data = await getCustomerById(parseInt(id));
                setCustomer(data);
            } catch (error) {
                console.error('Error fetching customer details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCustomer();
    }, [id]);

    if (loading) {
        return (
            <div className="flex h-screen bg-gray-50 items-center justify-center">
                <div className="text-xl text-gray-600">Đang tải thông tin khách hàng...</div>
            </div>
        );
    }

    if (!customer) {
        return (
            <div className="flex h-screen bg-gray-50 items-center justify-center flex-col gap-4">
                <div className="text-xl text-red-600">Không tìm thấy khách hàng</div>
                <button
                    onClick={() => navigate('/customers')}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Quay lại danh sách
                </button>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50">
            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-7xl mx-auto">
                        <button
                            onClick={() => navigate('/customers')}
                            className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            Quay lại danh sách
                        </button>

                        <div className="mb-6">
                            <h1 className="text-3xl font-extrabold text-gray-900">Chi tiết khách hàng #{customer.id}</h1>
                            <p className="text-gray-600">Thông tin chi tiết và lịch sử hoạt động</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <Card className="p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Thông tin cá nhân</h2>
                                <div className="space-y-3">
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-gray-600">Học vấn:</span>
                                        <span className="font-semibold text-gray-900">{customer.education}</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-gray-600">Tình trạng hôn nhân:</span>
                                        <span className="font-semibold text-gray-900">{customer.maritalStatus}</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-gray-600">Thu nhập:</span>
                                        <span className="font-semibold text-gray-900">
                                            {customer.income ? `$${customer.income.toLocaleString()}` : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-gray-600">Phân khúc:</span>
                                        <span className="font-semibold text-blue-600">Nhóm {customer.segment}</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-gray-600">File nguồn:</span>
                                        <span className="font-semibold text-gray-900">{customer.fileName}</span>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Chi tiêu & Mua sắm</h2>
                                <div className="space-y-3">
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-gray-600">Tổng chi tiêu:</span>
                                        <span className="font-bold text-green-600">
                                            {customer.totalSpending ? `$${customer.totalSpending.toLocaleString()}` : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-gray-600">Rượu vang:</span>
                                        <span className="font-semibold text-gray-900">${customer.mntWines || 0}</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-gray-600">Trái cây:</span>
                                        <span className="font-semibold text-gray-900">${customer.mntFruits || 0}</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-gray-600">Thịt:</span>
                                        <span className="font-semibold text-gray-900">${customer.mntMeatProducts || 0}</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-gray-600">Cá:</span>
                                        <span className="font-semibold text-gray-900">${customer.mntFishProducts || 0}</span>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Kênh mua hàng</h2>
                                <div className="space-y-3">
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-gray-600">Web:</span>
                                        <span className="font-semibold text-gray-900">{customer.numWebPurchases || 0} lần</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-gray-600">Catalog:</span>
                                        <span className="font-semibold text-gray-900">{customer.numCatalogPurchases || 0} lần</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-gray-600">Cửa hàng:</span>
                                        <span className="font-semibold text-gray-900">{customer.numStorePurchases || 0} lần</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-gray-600">Giảm giá:</span>
                                        <span className="font-semibold text-gray-900">{customer.numDealsPurchases || 0} lần</span>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Chiến dịch Marketing</h2>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center border-b pb-2">
                                        <span className="text-gray-600">Chiến dịch 1:</span>
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${customer.acceptedCmp1 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {customer.acceptedCmp1 ? 'Chấp nhận' : 'Từ chối'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center border-b pb-2">
                                        <span className="text-gray-600">Chiến dịch 2:</span>
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${customer.acceptedCmp2 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {customer.acceptedCmp2 ? 'Chấp nhận' : 'Từ chối'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center border-b pb-2">
                                        <span className="text-gray-600">Chiến dịch 3:</span>
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${customer.acceptedCmp3 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {customer.acceptedCmp3 ? 'Chấp nhận' : 'Từ chối'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center border-b pb-2">
                                        <span className="text-gray-600">Chiến dịch 4:</span>
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${customer.acceptedCmp4 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {customer.acceptedCmp4 ? 'Chấp nhận' : 'Từ chối'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center border-b pb-2">
                                        <span className="text-gray-600">Chiến dịch 5:</span>
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${customer.acceptedCmp5 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {customer.acceptedCmp5 ? 'Chấp nhận' : 'Từ chối'}
                                        </span>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
