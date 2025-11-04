import { User } from "lucide-react"

export function Navbar() {
  return (
    <nav className="border-b border-gray-200 px-8 py-4" style={{ backgroundColor: '#27548A' }}>
      <div className="flex items-center justify-between h-16">
        <div className="flex-1">
          <h1 className="text-white font-semibold">Customer Analytics</h1>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 text-white hover:bg-blue-700 rounded-lg">
            <User size={20} />
          </button>
        </div>
      </div>
    </nav>
  )
}
