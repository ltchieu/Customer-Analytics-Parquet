import type React from "react"
import { useLocation, Link } from "react-router-dom"
import { BarChart3, Users, TrendingUp, Upload } from "lucide-react"

interface NavItem {
  name: string
  path: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  { name: "Dashboard", path: "/dashboard", icon: <BarChart3 size={20} /> },
  { name: "Customers", path: "/customers", icon: <Users size={20} /> },
  { name: "Insights", path: "/insights", icon: <TrendingUp size={20} /> },
  { name: "Upload", path: "/upload", icon: <Upload size={20} /> },
]

export function Sidebar() {
  const location = useLocation()

  return (
    <aside className="w-64 bg-white border-r border-gray-200 p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
        <p className="text-sm text-gray-600 mt-1">Customer Segmentation</p>
      </div>
      <nav className="space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                isActive ? "bg-blue-100 text-blue-900" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {item.icon}
              {item.name}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
