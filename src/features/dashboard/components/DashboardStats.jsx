import { UsersRound, UserCheck, UserX, CalendarDays, AlarmClock, Clock } from "lucide-react";
import { DailyThemeCard } from "./DailyThemeCard";
import { AttendanceList } from "./AttendanceList";
import { EventCard } from "./EventCard";
import { SCHOOL_DAYS } from "@constants/schoolYear";

// Stat card configuration.
export const STAT_CARDS = [
  {
    key: "totalStudents",
    Icon: UsersRound,
    label: "Total Students",
    color: "bg-blue-100 text-blue-600",
    valueKey: "totalStudents",
  },
  {
    key: "presentToday",
    Icon: UserCheck,
    label: "Present Today",
    color: "bg-green-100 text-green-600",
    valueKey: "presentToday",
  },
  {
    key: "lateToday",
    Icon: AlarmClock,
    label: "Late Today",
    color: "bg-purple-100 text-purple-600",
    valueKey: "lateToday",
  },
  {
    key: "absentToday",
    Icon: UserX,
    label: "Absent Today",
    color: "bg-red-100 text-red-600",
    valueKey: "absentToday",
  },
  {
    key: "excusedToday",
    Icon: Clock,
    label: "Excused Today",
    color: "bg-amber-100 text-amber-600",
    valueKey: "excusedToday",
  },
  {
    key: "schoolDays",
    Icon: CalendarDays,
    label: "School Days",
    color: "bg-orange-100 text-orange-600",
    value: String(SCHOOL_DAYS),
  },
];

export const MAIN_CARDS = [
  { key: "dailyTheme", component: DailyThemeCard, colSpan: 2 },
  { key: "attendance", component: AttendanceList, colSpan: 1 },
  { key: "events", component: EventCard, colSpan: 1 },
];

export default { STAT_CARDS, MAIN_CARDS };
