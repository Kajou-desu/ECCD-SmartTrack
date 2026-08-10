export default function StatCard({ Icon, label, value, color }) {
  
  return (
    <div className="group rounded-2xl bg-white p-4 sm:p-5 border border-gray-200 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div
        className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl ${color}`}
      >
        <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
      </div>

      <p className="mt-4 text-xs sm:text-sm font-medium text-gray-500">
        {label}
      </p>

      <h2 className="mt-1 text-2xl sm:text-3xl font-bold text-gray-800">
        {value}
      </h2>
    </div>
  );
}
