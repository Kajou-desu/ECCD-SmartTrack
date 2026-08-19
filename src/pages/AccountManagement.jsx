import { useAccounts } from "@feature/accounts/hooks/useAccounts";
import AccountSection from "@feature/accounts/components/AccountSection";
import AccountViewModal from "@feature/accounts/components/AccountViewModal";
import AccountForm from "@feature/accounts/components/AccountForm";
import ConfirmDeleteModal from "@feature/accounts/components/ConfirmDeleteModal";
import ConfirmUpdateModal from "@feature/accounts/components/ConfirmUpdateModal";
import {
  AlertTriangle,
  Loader2,
  Plus,
  Shield,
  UserRound,
  Users,
} from "lucide-react";

function EmptyAccounts({ onCreate }) {
  return (
    <section className="rounded-3xl border border-dashed border-slate-200 bg-white px-5 py-12 text-center shadow-sm">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <Users size={21} />
      </div>

      <h2 className="mt-4 text-sm font-black text-slate-800">
        No accounts found
      </h2>

      <p className="mx-auto mt-1 max-w-sm text-xs font-medium leading-relaxed text-slate-400">
        There are currently no registered accounts in the system directory.
      </p>

      <button
        type="button"
        onClick={onCreate}
        className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-blue-700"
      >
        <Plus size={14} />
        Create First Account
      </button>
    </section>
  );
}

export default function AccountsManagement() {
  const {
    accounts,
    groupedAccounts,
    loading,
    error,
    retry,
    create,
    edit,
    view,
    remove,
  } = useAccounts();

  if (loading) {
    return (
      <div className="flex min-h-48 items-center justify-center px-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Loader2 size={15} className="animate-spin" />
          Loading account directory...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-8 text-center">
        <AlertTriangle size={20} className="mx-auto text-red-500" />

        <p className="mt-2 text-xs font-bold text-red-600">{error}</p>

        <button
          type="button"
          onClick={retry}
          className="mt-4 rounded-xl bg-red-500 px-4 py-2 text-xs font-bold text-white transition hover:bg-red-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Others
          </span>

          <h1 className="mt-0.5 text-xl font-black tracking-tight text-slate-800">
            Account Management
          </h1>

          <p className="mt-1 text-xs font-medium text-slate-400">
            Manage registered system profiles and their access roles.
          </p>
        </div>

        <button
          type="button"
          onClick={create.open}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 sm:w-auto"
        >
          <Plus size={15} />
          New Account
        </button>
      </header>

      {!accounts.length ? (
        <EmptyAccounts onCreate={create.open} />
      ) : (
        <div className="space-y-5">
          <AccountSection
            title="System Administrators"
            icon={Shield}
            data={groupedAccounts.admins}
            onView={view.open}
            onEdit={edit.open}
            onDelete={remove.open}
          />

          <AccountSection
            title="Enrolled Teachers"
            icon={UserRound}
            data={groupedAccounts.teachers}
            onView={view.open}
            onEdit={edit.open}
            onDelete={remove.open}
          />

          <AccountSection
            title="Enrolled Parents"
            icon={Users}
            data={groupedAccounts.parents}
            onView={view.open}
            onEdit={edit.open}
            onDelete={remove.open}
          />
        </div>
      )}

      {create.isOpen && (
        <AccountForm
          mode="create"
          form={create.form}
          message={create.message}
          loading={create.loading}
          onChange={create.change}
          onSubmit={create.submit}
          onCancel={create.close}
        />
      )}

      {view.account && (
        <AccountViewModal account={view.account} onClose={view.close} />
      )}

      {edit.account && (
        <AccountForm
          mode="edit"
          form={edit.form}
          message={edit.message}
          loading={edit.loading}
          onChange={edit.change}
          onSubmit={edit.precheck}
          onCancel={edit.close}
        />
      )}

      {edit.confirmOpen && (
        <ConfirmUpdateModal
          loading={edit.loading}
          onConfirm={edit.confirm}
          onClose={edit.cancelConfirm}
        />
      )}

      {remove.confirmation.isOpen && (
        <ConfirmDeleteModal
          accountName={remove.confirmation.accountName}
          loading={remove.loading}
          onConfirm={remove.confirm}
          onClose={remove.close}
        />
      )}
    </div>
  );
}
