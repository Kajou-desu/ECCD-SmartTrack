import Avatar from "@components/shared/Avatar.jsx";
import { formatStudentCode } from "@features/students/utils/studentCode.js";
import formatStudentName from "@utils/formatStudentName.js";

function formatTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export default function ChildOverviewCard({ child, arrivalTime, departedTime }) {
  return (
    <div className="bg-linear-to-r from-orange-50 to-orange-100 rounded-3xl border border-orange-200 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
        <Avatar
          src={child.photo}
          name={formatStudentName(child)}
          className="h-24 w-24 rounded-2xl text-3xl"
        />
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-800">{formatStudentName(child)}</h2>
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4 text-sm">
            <div>
              <p className="text-xs uppercase font-semibold text-gray-600">
                Student ID
              </p>
              <p className="font-medium text-orange-700">{formatStudentCode(child)}</p>
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
                Arrival Time
              </p>
              <p className="font-medium text-orange-700">
                {formatTime(arrivalTime ?? child.arrivedAt ?? child.arrivalTime)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase font-semibold text-gray-600">
                Departed Time
              </p>
              <p className="font-medium text-orange-700">
                {formatTime(departedTime ?? child.departedAt ?? child.departedTime)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
