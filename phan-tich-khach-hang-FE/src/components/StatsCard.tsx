type Props = {
	title: string
	value: string | number
	subtitle?: string
	gradient?: string
}

export default function StatCard({ title, value, subtitle, gradient }: Props) {
	return (
		<div className="rounded-2xl p-4 shadow-md" style={{ background: gradient || 'white' }}>
			<div className="text-sm font-medium text-gray-700">{title}</div>
			<div className="mt-2 text-2xl font-bold">{value}</div>
			{subtitle && <div className="text-xs text-gray-800 mt-1">{subtitle}</div>}
		</div>
	)
}

