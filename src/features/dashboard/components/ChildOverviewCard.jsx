export default function ChildOverviewCard({ child }) {
  return (
    <div className="bg-linear-to-r from-orange-50 to-orange-100 rounded-3xl border border-orange-200 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
        <img
          src={child.photo}
          alt={child.name}
          className="w-24 h-24 rounded-2xl object-cover shrink-0"
        />
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-800">{child.name}</h2>
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-xs uppercase font-semibold text-gray-600">
                Student ID
              </p>
              <p className="font-medium text-orange-700">{child.id}</p>
            </div>
            <div>
              <p className="text-xs uppercase font-semibold text-gray-600">
                Session
              </p>
              <p className="font-medium text-orange-700">{child.session}</p>
            </div>
            <div>
              <p className="text-xs uppercase font-semibold text-gray-600">
                Teacher
              </p>
              <p className="font-medium text-orange-700">{child.teacher}</p>
            </div>
            <div>
              <p className="text-xs uppercase font-semibold text-gray-600">
                Enrolled Since
              </p>
              <p className="font-medium text-orange-700">
                {child.enrollmentDate}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
