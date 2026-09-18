import { CalendarDays, ClipboardCheck, UserPlus, UsersRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@hooks/useAuth";

const ACTIONS = [
  { label: "Add Student", path: "/student-add", Icon: UserPlus },
  { label: "Attendance", path: "/attendance", Icon: ClipboardCheck },
  { label: "Calendar", path: "/calendar", Icon: CalendarDays },
  { label: "Accounts", path: "/accounts", Icon: UsersRound },
];

export function QuickActions() {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!["Teacher", "Admin"].includes(user?.role)) return null;

  return (
    <section className="w-full rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
      <h2 className="text-base font-bold text-gray-800">Quick Actions</h2>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {ACTIONS.map(({ label, path, Icon }) => (
          <button
            key={path}
            type="button"
            onClick={() => navigate(path)}
            className="flex min-h-20 flex-col items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 p-3 text-xs font-semibold text-gray-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-[#C2570C]"
          >
            <Icon className="h-5 w-5" />
            {label}
          </button>
        ))}
      </div>
    </section>
  );
}
