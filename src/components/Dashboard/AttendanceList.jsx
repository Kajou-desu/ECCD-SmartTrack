import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, X, AlertCircle, ArrowRight } from "lucide-react";
import { initialRecords } from "../../data/mockData.js";

export function AttendanceList() {
  const [attendanceData, setAttendanceData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAttendanceData(initialRecords);
    }, 150);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col bg-white rounded-2xl border border-gray-200 shadow-sm p-6 gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg h-full">
      <div className="flex items-center flex-nowrap justify-between">
        <h4 className="font-semibold text-lg sm:text-xl text-gray-800">
          Today's Attendance
        </h4>
        <button onClick={() => navigate("/attendance")} className="flex items-center text-sm text-[#C2570C] hover:text-orange-800 cursor-pointer">
          See Attendance
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
      <div className="max-h-80 lg:max-h-none lg:flex-1 lg:min-h-0 overflow-y-auto space-y-2 pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-400">
        {attendanceData.length > 0 ? (
          attendanceData.map((attendance) => (
            <AttendanceListItem key={attendance.id} attendance={attendance} />
          ))
        ) : (
          <div className="flex items-center justify-center h-24">
            <p className="text-sm text-gray-400 italic">
              No attendance records
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function AttendanceListItem({ attendance }) {
  const statusConfig = {
    present: {
      bgColor: "bg-green-50",
      hoverColor: "hover:bg-green-100",
      borderColor: "border-green-200",
      iconBgColor: "bg-green-200",
      iconColor: "text-green-700",
      textHoverColor: "group-hover:text-green-700",
      icon: Check,
    },
    absent: {
      bgColor: "bg-red-50",
      hoverColor: "hover:bg-red-100",
      borderColor: "border-red-200",
      iconBgColor: "bg-red-200",
      iconColor: "text-red-700",
      textHoverColor: "group-hover:text-red-700",
      icon: X,
    },
    excused: {
      bgColor: "bg-yellow-50",
      hoverColor: "hover:bg-yellow-100",
      borderColor: "border-yellow-200",
      iconBgColor: "bg-yellow-200",
      iconColor: "text-yellow-700",
      textHoverColor: "group-hover:text-yellow-700",
      icon: AlertCircle,
    },
  };

  const config = statusConfig[attendance.status] || statusConfig.present;
  const IconComponent = config.icon;

  return (
    <div
      className={`flex items-center justify-between p-3 ${config.bgColor} ${config.hoverColor} rounded-lg transition-colors duration-200 border ${config.borderColor} group`}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className={`p-2 ${config.iconBgColor} rounded-full shrink-0`}>
          <IconComponent className={`h-4 w-4 ${config.iconColor}`} />
        </div>
        <p
          className={`text-sm font-medium text-gray-800 truncate ${config.textHoverColor} transition-colors`}
        >
          {attendance.name}
        </p>
      </div>
      <p className="text-xs text-gray-500 whitespace-nowrap ml-2 shrink-0">
        {attendance.time}
      </p>
    </div>
  );
}
