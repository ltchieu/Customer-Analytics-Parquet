import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { predictSegment } from '../../services/api';
import { Card } from '../../components/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { PredictRequest, PredictResponse } from '../../model/predict_model';

export default function PredictionPage() {
    const { register, handleSubmit, formState: { errors } } = useForm<PredictRequest>();
    const [prediction, setPrediction] = useState<PredictResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const onSubmit = async (data: PredictRequest) => {
        try {
            setLoading(true);
            setError(null);
            // Convert string inputs to numbers
            const numericData: PredictRequest = {
                income: Number(data.income),
                mntWines: Number(data.mntWines || 0),
                mntFruits: Number(data.mntFruits || 0),
                mntMeatProducts: Number(data.mntMeatProducts || 0),
                mntFishProducts: Number(data.mntFishProducts || 0),
                mntSweetProducts: Number(data.mntSweetProducts || 0),
                mntGoldProds: Number(data.mntGoldProds || 0),
                numWebPurchases: Number(data.numWebPurchases || 0),
                numCatalogPurchases: Number(data.numCatalogPurchases || 0),
                numStorePurchases: Number(data.numStorePurchases || 0),
                acceptedCmp1: Number(data.acceptedCmp1 || 0),
                acceptedCmp2: Number(data.acceptedCmp2 || 0),
                acceptedCmp3: Number(data.acceptedCmp3 || 0),
                acceptedCmp4: Number(data.acceptedCmp4 || 0),
                acceptedCmp5: Number(data.acceptedCmp5 || 0),
            };

            console.log("Numeric data", numericData);

            const result = await predictSegment(numericData);
            setPrediction(result);
            console.log("Pedict result", prediction);
        } catch (err: any) {
            setError(err.message || 'Có lỗi xảy ra khi dự đoán');
        } finally {
            setLoading(false);
        }
    };

    const probabilityData = prediction?.data?.probabilities?.segments
        ? Object.entries(prediction.data.probabilities.segments).map(([segment, prob]) => ({
            name: `Nhóm ${segment}`,
            prob: (prob * 100).toFixed(1),
            value: prob * 100
        }))
        : [];

    const featureImportanceData = prediction?.data?.featureImportance
        ? Object.entries(prediction.data.featureImportance)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([feature, importance]) => ({
                name: feature,
                value: (importance * 100).toFixed(1)
            }))
        : [];

    return (
        <div className="flex h-screen bg-gray-50">
            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-8">
                            <h1 className="text-3xl font-extrabold text-gray-900">Dự đoán phân khúc khách hàng</h1>
                            <p className="text-gray-600">Nhập thông tin khách hàng để dự đoán phân khúc và nhận khuyến nghị</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Input Form */}
                            <div className="lg:col-span-1">
                                <Card className="p-6">
                                    <h2 className="text-xl font-bold text-gray-900 mb-6">Thông tin khách hàng</h2>
                                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Thu nhập hàng năm ($) *</label>
                                            <input
                                                type="number"
                                                {...register('income', { required: 'Vui lòng nhập thu nhập' })}
                                                className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="VD: 50000"
                                            />
                                            {errors.income && <p className="text-red-500 text-xs mt-1">{errors.income.message}</p>}
                                        </div>

                                        <div className="border-t pt-4">
                                            <h3 className="text-sm font-semibold text-gray-900 mb-3">Chi tiêu sản phẩm ($)</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Rượu</label>
                                                    <input type="number" {...register('mntWines')} className="w-full px-3 py-2 border rounded-md" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Trái cây</label>
                                                    <input type="number" {...register('mntFruits')} className="w-full px-3 py-2 border rounded-md" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Thịt</label>
                                                    <input type="number" {...register('mntMeatProducts')} className="w-full px-3 py-2 border rounded-md" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cá</label>
                                                    <input type="number" {...register('mntFishProducts')} className="w-full px-3 py-2 border rounded-md" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Đồ ngọt</label>
                                                    <input type="number" {...register('mntSweetProducts')} className="w-full px-3 py-2 border rounded-md" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Vàng</label>
                                                    <input type="number" {...register('mntGoldProds')} className="w-full px-3 py-2 border rounded-md" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border-t pt-4">
                                            <h3 className="text-sm font-semibold text-gray-900 mb-3">Số lượng đơn hàng</h3>
                                            <div className="grid grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Web</label>
                                                    <input type="number" {...register('numWebPurchases')} className="w-full px-3 py-2 border rounded-md" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Catalog</label>
                                                    <input type="number" {...register('numCatalogPurchases')} className="w-full px-3 py-2 border rounded-md" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cửa hàng</label>
                                                    <input type="number" {...register('numStorePurchases')} className="w-full px-3 py-2 border rounded-md" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border-t pt-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Chiến dịch đã chấp nhận</label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {[1, 2, 3, 4, 5].map((num) => (
                                                    <label key={num} className="flex items-center space-x-2 text-sm">
                                                        <input
                                                            type="checkbox"
                                                            {...register(`acceptedCmp${num}` as any)}
                                                            value="1"
                                                            className="rounded text-blue-600 focus:ring-blue-500"
                                                        />
                                                        <span>Cmp {num}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            {loading ? 'Đang xử lý...' : 'Dự đoán phân khúc'}
                                        </button>
                                    </form>
                                    {error && (
                                        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                                            {error}
                                        </div>
                                    )}
                                </Card>
                            </div>

                            {/* Results */}
                            <div className="lg:col-span-2">
                                {prediction ? (
                                    <div className="space-y-6">
                                        <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
                                            <div className="flex items-center justify-between mb-4">
                                                <h2 className="text-lg font-semibold text-gray-900">Kết quả dự đoán</h2>
                                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                                    Độ tin cậy: {(prediction.data.confidence * 100).toFixed(1)}%
                                                </span>
                                            </div>
                                            <div className="mb-4">
                                                <p className="text-sm text-gray-500 uppercase tracking-wide">Phân khúc dự đoán</p>
                                                <p className="text-3xl font-bold text-blue-700 mt-1">{prediction.data.segmentName}</p>
                                                <p className="text-gray-600 mt-2">{prediction.data.segmentDescription}</p>
                                            </div>
                                            <div className="pt-4 border-t border-blue-200">
                                                <p className="font-semibold text-gray-900 mb-2">Khuyến nghị hành động:</p>
                                                <p className="text-gray-700 bg-white p-3 rounded-lg border border-blue-100 shadow-sm">
                                                    {prediction.data.recommendation}
                                                </p>
                                            </div>
                                        </Card>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <Card className="p-6">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Xác suất phân khúc</h3>
                                                <div className="h-64">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <BarChart data={probabilityData} layout="vertical">
                                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                                            <XAxis type="number" domain={[0, 100]} />
                                                            <YAxis dataKey="name" type="category" width={80} />
                                                            <Tooltip formatter={(value: any) => [`${value}%`, 'Xác suất']} />
                                                            <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                                                                {probabilityData.map((entry, index) => (
                                                                    <Cell key={`cell-${index}`} fill={entry.name === prediction.data.segmentName ? '#2563eb' : '#93c5fd'} />
                                                                ))}
                                                            </Bar>
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </Card>

                                            <Card className="p-6">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Yếu tố ảnh hưởng chính</h3>
                                                <div className="h-64">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <BarChart data={featureImportanceData} layout="vertical">
                                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                                            <XAxis type="number" />
                                                            <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                                                            <Tooltip />
                                                            <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} />
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </Card>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full flex items-center justify-center bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
                                        <div>
                                            <div className="mx-auto h-12 w-12 text-gray-400">
                                                <svg className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                                </svg>
                                            </div>
                                            <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có kết quả dự đoán</h3>
                                            <p className="mt-1 text-sm text-gray-500">Điền thông tin khách hàng và nhấn "Dự đoán" để xem kết quả phân tích.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
