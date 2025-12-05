// React import not required with new JSX transform
import { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import { Upload, LogOut, LogIn } from 'lucide-react'
import DashboardPage from './pages/Dashboard/DashboardPage'
import CustomersPage from './pages/Customers/CustomersPage'
import SegmentsPage from './pages/Segments/SegmentsPage'
import InsightsPage from './pages/Insights/InsightsPage'
import CustomerDetailPage from './pages/Customers/CustomerDetailPage'
import PredictionPage from './pages/Prediction/PredictionPage'
import LoginPage from './pages/Auth/LoginPage'
import UploadModal from './components/UploadModal'
import logo from './assets/logo.png'
import { logout } from './services/api'


export default function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('accessToken')
      setIsAuthenticated(!!token)
    }

    checkAuth()

    // Listen for storage events to update auth state across tabs/components
    window.addEventListener('storage', checkAuth)
    return () => window.removeEventListener('storage', checkAuth)
  }, [])

  const handleLogout = async () => {
    await logout()
    setIsAuthenticated(false)
    navigate('/login')
  }

  // If on login page, don't show sidebar/header
  if (location.pathname === '/login') {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    )
  }

  return (
    <div className="min-h-screen flex text-gray-800">
      <aside className="w-72 shadow-lg p-4" style={{ backgroundColor: '#6482AD' }}>
        <div className="mb-0">
          <img src={logo} alt="UniDash" className="h-20 mb-0" />
        </div>
        <nav className="space-y-2">
          <Link to="/" className={`block px-3 py-2 rounded-lg font-medium ${location.pathname === '/' ? 'text-gray-800' : 'text-white hover:bg-gray-600'}`} style={location.pathname === '/' ? { backgroundColor: '#DDDDDD' } : {}}>Dashboard</Link>
          <Link to="/customers" className={`block px-3 py-2 rounded-lg font-medium ${location.pathname === '/customers' ? 'text-gray-800' : 'text-white hover:bg-gray-600'}`} style={location.pathname === '/customers' ? { backgroundColor: '#DDDDDD' } : {}}>Customers</Link>
          <Link to="/segments" className={`block px-3 py-2 rounded-lg font-medium ${location.pathname === '/segments' ? 'text-gray-800' : 'text-white hover:bg-gray-600'}`} style={location.pathname === '/segments' ? { backgroundColor: '#DDDDDD' } : {}}>Segments</Link>
          <Link to="/insights" className={`block px-3 py-2 rounded-lg font-medium ${location.pathname === '/insights' ? 'text-gray-800' : 'text-white hover:bg-gray-600'}`} style={location.pathname === '/insights' ? { backgroundColor: '#DDDDDD' } : {}}>Insights</Link>
          <Link to="/prediction" className={`block px-3 py-2 rounded-lg font-medium ${location.pathname === '/prediction' ? 'text-gray-800' : 'text-white hover:bg-gray-600'}`} style={location.pathname === '/prediction' ? { backgroundColor: '#DDDDDD' } : {}}>Prediction</Link>
        </nav>
      </aside>


      <main className="flex-1 p-6">
        <header className="flex items-center justify-between mb-6 px-6 py-4 rounded-lg" style={{ backgroundColor: '#4F709C' }}>
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-semibold text-white">Customer Analytics</h1>
          </div>
          <div className="flex items-center gap-3">
            <input className="px-3 py-2 border rounded-lg text-sm" placeholder="Search..." />
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Upload size={18} />
              Upload Data
            </button>
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <LogOut size={18} />
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <LogIn size={18} />
                Sign in
              </Link>
            )}
          </div>
        </header>

        <UploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} />


        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/customers/:id" element={<CustomerDetailPage />} />
          <Route path="/segments" element={<SegmentsPage />} />
          <Route path="/insights" element={<InsightsPage />} />
          <Route path="/prediction" element={<PredictionPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </main>
    </div>
  )
}