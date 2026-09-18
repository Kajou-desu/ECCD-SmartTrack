import { useState } from "react";
import Modal from "@components/ui/Modal";
import { Loader2, Upload } from "lucide-react";
import { apiClient } from "@api/client.js";

const REQUIRED = ["firstName", "lastName", "birthday", "address", "guardianName", "guardianPhone"];

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (char === '"' && text[i + 1] === '"' && quoted) {
      cell += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(cell.trim());
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[i + 1] === "\n") i += 1;
      row.push(cell.trim());
      if (row.some((value) => value)) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  row.push(cell.trim());
  if (row.some((value) => value)) rows.push(row);
  if (rows.length < 2) throw new Error("CSV must include a header and at least one student.");

  const headers = rows[0];
  return rows.slice(1).map((values) =>
    headers.reduce((record, header, index) => ({
      ...record,
      [header]: values[index] ?? "",
    }), {}),
  );
}

export default function ImportStudentsModal({ onCancel, onImported }) {
  const [rows, setRows] = useState([]);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError("");
    setFileName(file.name);
    try {
      const parsed = parseCsv(await file.text());
      const missing = REQUIRED.filter((key) => !(key in parsed[0]));
      if (missing.length) throw new Error(`Missing CSV columns: ${missing.join(", ")}`);
      setRows(parsed);
    } catch (err) {
      setRows([]);
      setError(err.message || "Unable to read CSV.");
    }
  };

  const handleImport = async () => {
    if (!rows.length || loading) return;
    setLoading(true);
    setError("");
    try {
      const result = await apiClient.importStudents(rows);
      onImported(result);
      onCancel();
    } catch (err) {
      setError(err?.details?.message || "Student import failed.");
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onCancel} labelledBy="import-students-title">
      <div className="p-5 sm:p-6">
        <h2 id="import-students-title" className="text-lg font-bold text-slate-900">Import Students</h2>
        <p className="mt-1 text-sm text-slate-500">Upload a CSV with student and primary guardian information.</p>
        <label className="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 p-6 text-center hover:bg-slate-50">
          <Upload className="h-6 w-6 text-slate-400" />
          <span className="mt-2 text-sm font-semibold text-slate-700">{fileName || "Choose CSV file"}</span>
          <input type="file" accept=".csv,text/csv" onChange={handleFile} className="sr-only" />
        </label>
        {rows.length > 0 && <p className="mt-3 text-xs font-semibold text-slate-600">{rows.length} student record(s) ready to import.</p>}
        {error && <p role="alert" className="mt-3 text-xs text-red-600">{error}</p>}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCancel} disabled={loading} className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold">Cancel</button>
          <button type="button" onClick={handleImport} disabled={!rows.length || loading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#C2570C] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
            {loading && <Loader2 size={15} className="animate-spin" />}
            {loading ? "Importing..." : "Import Students"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
