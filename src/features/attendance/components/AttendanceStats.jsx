import StatCard from "../../../components/shared/StatCard";
import { UsersRound, UserCheck, UserX, Clock } from "lucide-react";

export default function AttendanceStats({ attendanceStats }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
      <StatCard Icon={UsersRound} label="Total Students" value={String(attendanceStats.total)} color="bg-blue-100 text-blue-600" />

      <StatCard Icon={UserCheck} label="Present Today" value={String(attendanceStats.present)} color="bg-green-100 text-green-600" />

      <StatCard Icon={UserX} label="Absent Today" value={String(attendanceStats.absent)} color="bg-red-100 text-red-600" />

      <StatCard Icon={Clock} label="Excused" value={String(attendanceStats.excused)} color="bg-orange-100 text-orange-600" />
    </div>
  );
}
