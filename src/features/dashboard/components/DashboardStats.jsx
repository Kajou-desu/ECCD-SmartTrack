import { UsersRound, UserCheck, UserX, CalendarDays } from "lucide-react";
import { DailyThemeCard } from "./DailyThemeCard";
import { AttendanceList } from "./AttendanceList";
import { EventCard } from "./EventCard";

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
    key: "absentToday",
    Icon: UserX,
    label: "Absent Today",
    color: "bg-red-100 text-red-600",
    valueKey: "absentToday",
  },
  {
    key: "schoolDays",
    Icon: CalendarDays,
    label: "School Days",
    color: "bg-orange-100 text-orange-600",
    // static value fallback
    value: "60",
  },
];

export const MAIN_CARDS = [
  { key: "dailyTheme", component: DailyThemeCard, colSpan: 2 },
  { key: "attendance", component: AttendanceList, colSpan: 1 },
  { key: "events", component: EventCard, colSpan: 1 },
];

export default { STAT_CARDS, MAIN_CARDS };
