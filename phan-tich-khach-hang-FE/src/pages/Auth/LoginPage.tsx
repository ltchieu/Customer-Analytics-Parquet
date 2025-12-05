import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, LoginRequest } from '../../services/api';
import { Card } from '../../components/Card';

export default function LoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const credentials: LoginRequest = { email, password };
            await login(credentials);
            // Login successful, redirect to home/dashboard
            // The App component will detect the token change if we trigger a re-render or if we reload,
            // but for a smooth SPA experience, we might need to update a context or state in App.
            // For now, we'll rely on the fact that login() sets localStorage.
            // We can force a window reload or rely on App.tsx checking localStorage on mount/update.
            // A better approach is to pass a callback or use context, but let's stick to the plan of updating App.tsx state.
            // Since App.tsx isn't using a context yet, we'll just navigate. 
            // To ensure the header updates, we might need to dispatch a custom event or use a simple context later.
            // For this step, let's just navigate.
            window.dispatchEvent(new Event('storage')); // Trigger storage event for other tabs/components listening
            navigate('/');
            window.location.reload(); // Simple way to ensure App state updates for now
        } catch (err: any) {
            setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="max-w-md w-full px-6">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Đăng nhập</h1>
                    <p className="mt-2 text-gray-600">Chào mừng trở lại! Vui lòng đăng nhập vào tài khoản của bạn.</p>
                </div>

                <Card className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                                placeholder="name@company.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                                placeholder="••••••••"
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                        </button>
                    </form>
                </Card>
            </div>
        </div>
    );
}
