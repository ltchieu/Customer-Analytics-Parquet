// React import not required with new JSX transform
import { useState } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { Upload } from 'lucide-react'
import DashboardPage from './pages/Dashboard/DashboardPage'
import CustomersPage from './pages/Customers/CustomersPage'
import SegmentsPage from './pages/Segments/SegmentsPage'
import InsightsPage from './pages/Insights/InsightsPage'
import UploadModal from './components/UploadModal'
import logo from './assets/logo.png'


export default function App(){
const location = useLocation()
const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)

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
<button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">Sign in</button>
</div>
</header>

<UploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} />


<Routes>
<Route path="/" element={<DashboardPage/>} />
<Route path="/customers" element={<CustomersPage/>} />
<Route path="/segments" element={<SegmentsPage/>} />
<Route path="/insights" element={<InsightsPage/>} />
</Routes>
</main>
</div>
)
}