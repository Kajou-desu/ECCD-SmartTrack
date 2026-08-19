import { Loader2 } from "lucide-react";

import { normalizeRole, ROLES } from "../utils/accountUtils.js";

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

export default function AccountForm({
  formData,
  onChange,
  onSubmit,
  onCancel,
  submitLabel,
  loading,
  message,
  isEdit = false,
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
          onChange={onChange}
          className={inputClass}
          required
        >
          {ROLES.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </FormField>

      {isEdit && (
        <>
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
        </>
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
