// React import not required with new JSX transform
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import DashboardPage from './pages/Dashboard/DashboardPage'
import CustomersPage from './pages/Customers/CustomersPage'
import logo from './assets/logo.png'


export default function App(){
const location = useLocation()

return (
<div className="min-h-screen flex text-gray-800">
<aside className="w-72 shadow-lg p-4" style={{ backgroundColor: '#6482AD' }}>
<div className="mb-0">
<img src={logo} alt="UniDash" className="h-20 mb-0" />
</div>
<nav className="space-y-2">
<Link to="/" className={`block px-3 py-2 rounded-lg font-medium ${location.pathname === '/' ? 'text-gray-800' : 'text-white hover:bg-gray-600'}`} style={location.pathname === '/' ? { backgroundColor: '#DDDDDD' } : {}}>Dashboard</Link>
<Link to="/customers" className={`block px-3 py-2 rounded-lg font-medium ${location.pathname === '/customers' ? 'text-gray-800' : 'text-white hover:bg-gray-600'}`} style={location.pathname === '/customers' ? { backgroundColor: '#DDDDDD' } : {}}>Customers</Link>
<a className="block px-3 py-2 rounded-lg text-white hover:bg-gray-600">Segments</a>
<a className="block px-3 py-2 rounded-lg text-white hover:bg-gray-600">Reports</a>
</nav>
</aside>


<main className="flex-1 p-6">
<header className="flex items-center justify-between mb-6 px-6 py-4 rounded-lg" style={{ backgroundColor: '#4F709C' }}>
<div className="flex items-center gap-4">
<h1 className="text-2xl font-semibold text-white">Customer Analytics</h1>
</div>
<div className="flex items-center gap-3">
<input className="px-3 py-2 border rounded-lg text-sm" placeholder="Search..." />
<button className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Sign in</button>
</div>
</header>


<Routes>
<Route path="/" element={<DashboardPage/>} />
<Route path="/customers" element={<CustomersPage/>} />
</Routes>
</main>
</div>
)
}