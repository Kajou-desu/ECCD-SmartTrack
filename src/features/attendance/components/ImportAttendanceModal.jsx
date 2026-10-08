import { useState } from "react";
import Modal from "@components/ui/Modal";
import { Loader2, Upload } from "lucide-react";
import { apiClient } from "@api/client.js";
import { useToast } from "@hooks/useToast.js";
import { getErrorMessage } from "@api/errorMessage.js";
import { parseAttendanceCsv, MAX_IMPORT_BYTES } from "../utils/importAttendanceCsv.js";
import { downloadAttendanceImportTemplate } from "../utils/attendanceImportTemplate.js";

// Two steps so nothing is written by surprise: choosing a file asks the server
// to check it (dry run) and shows what would change; "Import" then saves it.
export default function ImportAttendanceModal({ onCancel, onImported }) {
  const showToast = useToast();
  const [rows, setRows] = useState([]);
  const [fileName, setFileName] = useState("");
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);

  const reset = () => {
    setRows([]);
    setPreview(null);
    setResult(null);
    setError("");
  };

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = ""; // so re-choosing the same re-saved file fires onChange
    if (!file) return;
    reset();
    setFileName(file.name);
    try {
      if (file.size > MAX_IMPORT_BYTES) {
        throw new Error("This file is too large to import in one go. Split it into smaller files.");
      }
      const parsed = parseAttendanceCsv(await file.text());
      setChecking(true);
      const check = await apiClient.importAttendance(parsed, true);
      setRows(parsed);
      setPreview(check);
    } catch (err) {
      setRows([]);
      setError(getErrorMessage(err, "Unable to read CSV."));
    } finally {
      setChecking(false);
    }
  };

  const handleImport = async () => {
    if (!rows.length || saving) return;
    setSaving(true);
    setError("");
    try {
      const done = await apiClient.importAttendance(rows, false);
      // The file is cleared either way so a second click can't send it again.
      setRows([]);
      setPreview(null);
      setFileName("");
      setResult(done);
      onImported?.(done);
      const changed = done.created + done.updated;
      showToast(done.failed.length ? "warning" : "success", `${changed} attendance record(s) saved.`);
      if (!done.failed.length) onCancel();
    } catch (err) {
      setError(getErrorMessage(err, "Attendance import failed."));
    } finally {
      setSaving(false);
    }
  };

  const failed = (result ?? preview)?.failed ?? [];
  const canImport = rows.length > 0 && preview && preview.created + preview.updated > 0;

  return (
    <Modal onClose={onCancel} labelledBy="import-attendance-title">
      <div className="p-5 sm:p-6">
        <h2 id="import-attendance-title" className="text-base font-bold text-slate-900">Import Attendance</h2>
        <p className="mt-1 text-sm text-slate-500">Upload a CSV of attendance records for your students.</p>
        <ul className="mt-2 list-disc space-y-0.5 pl-4 text-xs text-slate-500">
          <li>Columns: studentCode, date, status. Other columns (like the name) are ignored, so an attendance export can be re-imported.</li>
          <li>date: YYYY-MM-DD, today or earlier. status: present, absent or excused.</li>
          <li>Records that already match are left unchanged. A differing status replaces the old one.</li>
          <li>Up to 500 records per file. Save from Excel as CSV UTF-8.</li>
        </ul>
        <button type="button" onClick={downloadAttendanceImportTemplate} className="mt-2 text-xs font-semibold text-[#C2570C] underline">Download CSV template</button>
        <label className="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 p-6 text-center hover:bg-slate-50">
          <Upload className="h-6 w-6 text-slate-400" />
          <span className="mt-2 text-sm font-semibold text-slate-700">{fileName || "Choose CSV file"}</span>
          <input type="file" accept=".csv,text/csv" onChange={handleFile} disabled={checking || saving} className="sr-only" />
        </label>
        {checking && <p className="mt-3 text-xs font-semibold text-slate-600">Checking the file...</p>}
        {preview && (
          <p className="mt-3 text-xs font-semibold text-slate-600">
            {preview.created} new, {preview.updated} changed, {preview.unchanged} already up to date
            {failed.length ? `, ${failed.length} with problems` : ""}.
          </p>
        )}
        {result && (
          <p className="mt-3 text-xs font-semibold text-emerald-700">
            Saved: {result.created} new, {result.updated} changed, {result.unchanged} already up to date.
          </p>
        )}
        {error && <p role="alert" className="mt-3 text-xs text-red-600">{error}</p>}
        {failed.length > 0 && (
          <div role="alert" className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
            <p className="font-semibold">{failed.length} row(s) will not be imported. Fix them in the CSV and upload again:</p>
            <ul className="mt-2 max-h-40 list-disc space-y-1 overflow-y-auto pl-4">
              {failed.map((item, index) => (
                <li key={`${item.row}-${index}`}>Row {item.row}: {item.message}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCancel} disabled={saving} className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold">
            {result ? "Close" : "Cancel"}
          </button>
          <button type="button" onClick={handleImport} disabled={!canImport || saving || checking} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#C2570C] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
            {saving && <Loader2 size={15} className="animate-spin" />}
            {saving ? "Importing..." : "Import Attendance"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
