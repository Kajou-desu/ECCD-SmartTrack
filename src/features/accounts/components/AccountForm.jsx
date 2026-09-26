import formatStudentName from "@utils/formatStudentName.js";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { normalizeRole } from "../utils/accountUtils.js";
import { formatStudentCode } from "@features/students/utils/studentCode.js";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10";

function FormField({ label, children, required = false }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-black uppercase tracking-wide text-slate-400">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </span>

      {children}
    </label>
  );
}

function StatusMessage({ message }) {
  if (!message?.text) return null;

  return (
    <div
      className={`rounded-xl px-3 py-2.5 text-[11px] font-semibold ${
        message.isError
          ? "bg-red-50 text-red-600"
          : "bg-emerald-50 text-emerald-600"
      }`}
    >
      {message.text}
    </div>
  );
}

// Checkbox group so one Parent/Guardian can be connected to several students.
// Toggling only touches the clicked id, so selections hidden by the search
// filter are kept.
function StudentPicker({ students, selectedIds, onChange }) {
  const [query, setQuery] = useState("");
  const selected = new Set(selectedIds.map(Number));
  const needle = query.trim().toLowerCase();
  const visible = needle
    ? students.filter((student) =>
        `${formatStudentName(student)} ${formatStudentCode(student)}`.toLowerCase().includes(needle),
      )
    : students;

  const toggle = (id) => {
    const next = new Set(selected);
    if (!next.delete(id)) next.add(id);
    onChange({ target: { name: "studentIds", value: [...next] } });
  };

  return (
    <fieldset>
      <legend className="mb-1 block text-[10px] font-black uppercase tracking-wide text-slate-400">
        Connect Students
      </legend>

      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={(event) => event.key === "Enter" && event.preventDefault()}
        placeholder="Search students"
        aria-label="Search students"
        className={inputClass}
      />

      <div className="mt-2 max-h-56 space-y-1 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-2">
        {visible.length === 0 && (
          <p className="px-2 py-2 text-[11px] text-slate-500">No students found.</p>
        )}

        {visible.map((student) => (
          <label
            key={student.id}
            className="flex cursor-pointer items-start gap-3 rounded-lg px-2 py-2 hover:bg-white"
          >
            <input
              type="checkbox"
              checked={selected.has(Number(student.id))}
              onChange={() => toggle(Number(student.id))}
              className="mt-0.5 h-4 w-4 shrink-0 accent-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
            />
            <span className="min-w-0">
              <span className="block text-xs font-semibold text-slate-800">{formatStudentName(student)}</span>
              <span className="block text-[11px] text-slate-500">{formatStudentCode(student)}</span>
            </span>
          </label>
        ))}
      </div>

      <p aria-live="polite" className="mt-1 text-[11px] text-slate-500">
        {selected.size} selected
      </p>
    </fieldset>
  );
}

export default function AccountForm({
  formData,
  onChange,
  onSubmit,
  onCancel,
  submitLabel,
  loading,
  message,
  isEdit = false,
  assignableRoles,
  students = [],
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <FormField label="Last Name" required>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={onChange}
            placeholder="Last Name"
            className={inputClass}
            autoComplete="family-name"
            required
          />
        </FormField>

        <FormField label="First Name" required>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={onChange}
            placeholder="First Name"
            className={inputClass}
            autoComplete="given-name"
            required
          />
        </FormField>

        <FormField label="Middle Name">
          <input
            type="text"
            name="middleName"
            value={formData.middleName}
            onChange={onChange}
            placeholder="Middle Name"
            className={inputClass}
            autoComplete="additional-name"
          />
        </FormField>
      </div>

      <FormField label="Email Address" required>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={onChange}
          placeholder="Email Address"
          className={inputClass}
          autoComplete="email"
          required
        />
      </FormField>

      {!isEdit && (
        <FormField label="Password" required>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={onChange}
            placeholder="••••••••"
            className={inputClass}
            autoComplete="new-password"
            minLength={6}
            required
          />
        </FormField>
      )}

      <FormField label="System Role" required>
        <select
          name="role"
          value={normalizeRole(formData.role)}
          onChange={(event) => {
            onChange(event);
            // Leaving Parent/Guardian: clear the (now-hidden) picker's
            // selection too, so a stale, non-empty studentIds array doesn't
            // ride along on this same submit and get rejected by the
            // backend's "only Parent/Guardian can be connected" check.
            if (!["Parent", "Guardian"].includes(normalizeRole(event.target.value))) {
              onChange({ target: { name: "studentIds", value: [] } });
            }
          }}
          className={inputClass}
          required
        >
          {assignableRoles.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label="Contact Phone" required>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={onChange}
          placeholder="Input phone number"
          className={inputClass}
          autoComplete="tel"
          required
        />
      </FormField>

      <FormField label="Home Address" required>
        <textarea
          name="address"
          value={formData.address}
          onChange={onChange}
          placeholder="Input address"
          rows={3}
          className={`${inputClass} resize-none`}
          autoComplete="street-address"
          required
        />
      </FormField>

      {(normalizeRole(formData.role) === "Parent" ||
        normalizeRole(formData.role) === "Guardian") && (
        <StudentPicker
          students={students}
          selectedIds={formData.studentIds ?? []}
          onChange={onChange}
        />
      )}

      <StatusMessage message={message} />

      <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="w-full rounded-xl bg-slate-100 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className={`inline-flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
            isEdit
              ? "bg-amber-500 hover:bg-amber-600"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading && <Loader2 size={14} className="animate-spin" />}

          {loading ? "Processing..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
