import AccountCard from "./AccountCard.jsx";
import AccountTable from "./AccountTable.jsx";
import { getAccountId } from "../utils/accountUtils.js";

export default function AccountSection({
  title,
  icon: Icon,
  data,
  badgeClass,
  onView,
  onEdit,
  onDelete,
  disabled = false,
}) {
  if (!data.length) return null;

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Icon size={17} className="shrink-0 text-slate-500" />

          <h3 className="truncate text-sm font-black tracking-tight text-slate-800">
            {title}
          </h3>
        </div>

        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black ${badgeClass}`}
        >
          {data.length} {data.length === 1 ? "Account" : "Accounts"}
        </span>
      </div>

      <div className="grid gap-3 sm:hidden">
        {data.map((account) => (
          <AccountCard
            key={getAccountId(account)}
            account={account}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
            disabled={disabled}
          />
        ))}
      </div>

      <AccountTable
        data={data}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
        disabled={disabled}
      />
    </section>
  );
}
