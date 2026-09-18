import { useState } from "react";

import { useAuth } from "@hooks/useAuth";
import { useStudentsQuery } from "@features/students/hooks/useStudentsQuery.js";
import useAccounts from "@features/accounts/hooks/useAccounts";
import AccountSection from "@features/accounts/components/AccountSection";
import AccountViewModal from "@features/accounts/components/AccountViewModal";
import AccountForm from "@features/accounts/components/AccountForm";
import ConfirmDeleteModal from "@features/accounts/components/ConfirmDeleteModal";
import ConfirmUpdateModal from "@features/accounts/components/ConfirmUpdateModal";
import PageHeader from "@components/shared/PageHeader";

import {
  AlertTriangle,
  Loader2,
  Plus,
  Shield,
  UserRound,
  Users,
} from "lucide-react";

import {
  INITIAL_FORM,
  INITIAL_EDIT_FORM,
  getAccountId,
  getAccountName,
  getAssignableRoles,
} from "@features/accounts/utils/accountUtils.js";

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
  const { user } = useAuth();
  const assignableRoles = getAssignableRoles(user?.role);
  const { data: studentData } = useStudentsQuery();
  const students = studentData?.students ?? studentData ?? [];

  const {
    accounts,
    groupedAccounts,
    loading,
    mutating,
    error,
    retry,
    createAccount,
    updateAccount,
    deleteAccount,
  } = useAccounts();

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState(INITIAL_FORM);
  const [createMessage, setCreateMessage] = useState(null);

  const [viewAccount, setViewAccount] = useState(null);

  const [editAccount, setEditAccount] = useState(null);
  const [editForm, setEditForm] = useState(INITIAL_EDIT_FORM);
  const [editMessage, setEditMessage] = useState(null);
  const [updateConfirmOpen, setUpdateConfirmOpen] = useState(false);

  const [deleteAccountData, setDeleteAccountData] = useState(null);

  const handleCreateChange = (event) => {
    const { name, value } = event.target;

    setCreateForm((current) => ({
      ...current,
      [name]: value,
    }));

    setCreateMessage(null);
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;

    setEditForm((current) => ({
      ...current,
      [name]: value,
    }));

    setEditMessage(null);
  };

  const openCreate = () => {
    setCreateForm(INITIAL_FORM);
    setCreateMessage(null);
    setCreateOpen(true);
  };

  const closeCreate = () => {
    if (mutating) return;

    setCreateOpen(false);
    setCreateMessage(null);
  };

  const handleCreateSubmit = async (event) => {
    event.preventDefault();
    setCreateMessage(null);

    try {
      await createAccount(createForm);

      setCreateMessage({
        text: "Account created successfully.",
        isError: false,
      });

      setCreateForm(INITIAL_FORM);
      setCreateOpen(false);
    } catch (err) {
      setCreateMessage({
        text: err.message || "Failed to create account.",
        isError: true,
      });
    }
  };

  const openEdit = (account) => {
    setEditAccount(account);
    setEditForm({
      ...INITIAL_EDIT_FORM,
      accountId: getAccountId(account),
      firstName: account.firstName || account.firstname || "",
      middleName: account.middleName || account.middlename || "",
      lastName: account.lastName || account.lastname || "",
      email: account.email || "",
      phone: account.phone || "",
      address: account.address || "",
      role: account.role || "Parent",
      studentIds: account.studentIds ?? account.children?.map((child) => child.id) ?? [],
    });
    setEditMessage(null);
    setUpdateConfirmOpen(false);
  };

  const closeEdit = () => {
    if (mutating) return;

    setEditAccount(null);
    setEditMessage(null);
    setUpdateConfirmOpen(false);
  };

  const handleEditSubmit = (event) => {
    event.preventDefault();
    setEditMessage(null);
    setUpdateConfirmOpen(true);
  };

  const handleUpdateConfirm = async () => {
    try {
      await updateAccount(editForm);

      setUpdateConfirmOpen(false);
      setEditAccount(null);
      setEditMessage(null);
    } catch (err) {
      setUpdateConfirmOpen(false);
      setEditMessage({
        text: err.message || "Failed to update account.",
        isError: true,
      });
    }
  };

  const openDelete = (account) => {
    setDeleteAccountData({
      accountId: getAccountId(account),
      accountName: getAccountName(account),
    });
  };

  const closeDelete = () => {
    if (mutating) return;

    setDeleteAccountData(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteAccountData?.accountId) return;

    try {
      await deleteAccount(deleteAccountData.accountId);
      setDeleteAccountData(null);
    } catch {
      // The hook exposes the request error through its error state.
    }
  };

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

  if (error && !accounts.length) {
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
    <div className="space-y-5 sm:space-y-6 p-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Account Management"
          subtitle="Manage registered system accounts and their access roles"
        />

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 sm:w-auto"
        >
          <Plus size={15} />
          New Account
        </button>
      </header>

      {error && accounts.length > 0 && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">
          {error}
        </div>
      )}

      {!accounts.length ? (
        <EmptyAccounts onCreate={openCreate} />
      ) : (
        <div className="space-y-5">
          <AccountSection
            title="System Administrators"
            icon={Shield}
            badgeClass="bg-blue-50 text-blue-600"
            data={groupedAccounts.admins}
            onView={setViewAccount}
            onEdit={openEdit}
            onDelete={openDelete}
            disabled={mutating}
          />

          <AccountSection
            title="Enrolled Teachers"
            icon={UserRound}
            badgeClass="bg-amber-50 text-amber-600"
            data={groupedAccounts.teachers}
            onView={setViewAccount}
            onEdit={openEdit}
            onDelete={openDelete}
            disabled={mutating}
          />

          <AccountSection
            title="Enrolled Guardians"
            icon={Users}
            badgeClass="bg-purple-50 text-purple-600"
            data={groupedAccounts.guardians}
            onView={setViewAccount}
            onEdit={openEdit}
            onDelete={openDelete}
            disabled={mutating}
          />

          <AccountSection
            title="Enrolled Parents"
            icon={Users}
            badgeClass="bg-emerald-50 text-emerald-600"
            data={groupedAccounts.parents}
            onView={setViewAccount}
            onEdit={openEdit}
            onDelete={openDelete}
            disabled={mutating}
          />
        </div>
      )}

      {createOpen && (
        <AccountForm
          formData={createForm}
          message={createMessage}
          loading={mutating}
          onChange={handleCreateChange}
          onSubmit={handleCreateSubmit}
          onCancel={closeCreate}
          submitLabel="Create Account"
          assignableRoles={assignableRoles}
          students={students}
        />
      )}

      {viewAccount && (
        <AccountViewModal
          account={viewAccount}
          onClose={() => setViewAccount(null)}
        />
      )}

      {editAccount && (
        <AccountForm
          formData={editForm}
          message={editMessage}
          loading={mutating}
          onChange={handleEditChange}
          onSubmit={handleEditSubmit}
          onCancel={closeEdit}
          submitLabel="Review Update"
          isEdit
          assignableRoles={assignableRoles}
          students={students}
        />
      )}

      {updateConfirmOpen && (
        <ConfirmUpdateModal
          loading={mutating}
          onConfirm={handleUpdateConfirm}
          onClose={() => setUpdateConfirmOpen(false)}
        />
      )}

      {deleteAccountData && (
        <ConfirmDeleteModal
          accountName={deleteAccountData.accountName}
          loading={mutating}
          onConfirm={handleDeleteConfirm}
          onClose={closeDelete}
        />
      )}
    </div>
  );
}
