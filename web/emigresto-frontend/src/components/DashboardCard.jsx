export default function DashboardCard({ title, value, icon }) {
  return (
    <div className="flex items-center gap-4 p-5 bg-white hover:shadow-lg transition-shadow duration-300 rounded-2xl shadow-md dark:bg-gray-800">
      <div className="text-primary text-4xl">{icon}</div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-semibold text-gray-800 dark:text-white">{value}</p>
      </div>
    </div>
  )
}
