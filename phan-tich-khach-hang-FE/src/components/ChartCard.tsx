import React from 'react'

interface ChartCardProps {
	title: string
	subtitle?: string
	children: React.ReactNode
}

const ChartCard: React.FC<ChartCardProps> = ({ title, subtitle, children }) => {
	return (
		<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
			<div className="mb-4">
				<div className="text-lg font-semibold text-gray-800">{title}</div>
				{subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
			</div>
			<div style={{ height: 300 }} className="flex items-center justify-center">
				{children}
			</div>
		</div>
	)
}

export default ChartCard

