import { MapPin } from "lucide-react";

import AccountActions from "./AccountActions.jsx";
import { getAccountId, getAccountName } from "../utils/accountUtils.js";

function AccountAvatar({ account }) {
  const name = getAccountName(account);

  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-xs font-black text-slate-600">
      {name.charAt(0).toUpperCase() || "U"}
    </div>
  );
}

export default function AccountCard({
  account,
  onView,
  onEdit,
  onDelete,
  disabled = false,
}) {
  const address = account?.address?.trim();

  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <AccountAvatar account={account} />

        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-black text-slate-800">
            {getAccountName(account)}
          </p>

          <p className="mt-0.5 truncate text-[10px] font-bold text-slate-400">
            ID: {getAccountId(account) || "N/A"}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4">
        <div>
          <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
            Email
          </p>

          <p className="mt-1 break-all text-xs font-semibold text-slate-700">
            {account?.email || "No email provided"}
          </p>
        </div>

        <div>
          <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
            Phone
          </p>

          <p className="mt-1 text-xs font-semibold text-slate-700">
            {account?.phone || "No phone provided"}
          </p>
        </div>

        <div>
          <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
            Address
          </p>

          {address ? (
            <p className="mt-1 flex items-start gap-1.5 text-xs font-medium text-slate-700">
              <MapPin size={13} className="mt-0.5 shrink-0 text-red-400" />
              <span>{address}</span>
            </p>
          ) : (
            <p className="mt-1 text-xs font-medium italic text-slate-400">
              No address provided
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 border-t border-slate-100 pt-4">
        <AccountActions
          account={account}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          disabled={disabled}
        />
      </div>
    </article>
  );
}
