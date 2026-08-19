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

export default function AccountTable({
  data,
  onView,
  onEdit,
  onDelete,
  disabled = false,
}) {
  return (
    <div className="hidden overflow-x-auto sm:block">
      <table className="w-full min-w-180 border-collapse text-left">
        <thead>
          <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <th className="w-[25%] pb-3 pr-4">Account Name</th>
            <th className="w-[25%] pb-3 pr-4">Contact Details</th>
            <th className="w-[30%] pb-3 pr-4">Home Address</th>
            <th className="w-[20%] pb-3 text-right">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-50">
          {data.map((account) => {
            const address = account?.address?.trim();

            return (
              <tr
                key={getAccountId(account)}
                className="transition-colors hover:bg-slate-50/60"
              >
                <td className="py-3.5 pr-4 align-top">
                  <div className="flex items-center gap-3">
                    <AccountAvatar account={account} />

                    <div className="min-w-0">
                      <p className="truncate text-xs font-black text-slate-800">
                        {getAccountName(account)}
                      </p>

                      <p className="mt-0.5 truncate text-[10px] font-bold text-slate-400">
                        ID: {getAccountId(account) || "N/A"}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="py-3.5 pr-4 align-top">
                  <p className="max-w-55 break-all text-xs font-bold text-slate-700">
                    {account?.email || "No email provided"}
                  </p>

                  <p className="mt-1 text-[11px] font-mono tracking-wide text-slate-400">
                    {account?.phone || "No phone provided"}
                  </p>
                </td>

                <td className="max-w-60 py-3.5 pr-4 align-top">
                  {address ? (
                    <p className="flex items-start gap-1.5 text-xs font-medium text-slate-700">
                      <MapPin
                        size={13}
                        className="mt-0.5 shrink-0 text-red-400"
                      />

                      <span className="wrap-break-word">{address}</span>
                    </p>
                  ) : (
                    <span className="text-xs font-medium italic text-slate-400">
                      No address provided
                    </span>
                  )}
                </td>

                <td className="py-3.5 text-right align-top">
                  <div className="flex justify-end">
                    <AccountActions
                      account={account}
                      onView={onView}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      disabled={disabled}
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
