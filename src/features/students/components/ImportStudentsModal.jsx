import { useState } from "react";
import Modal from "@components/ui/Modal";
import { Loader2, Upload } from "lucide-react";
import { apiClient } from "@api/client.js";
import { useToast } from "@hooks/useToast.js";
import { getErrorMessage } from "@api/errorMessage.js";
import { downloadStudentImportTemplate, IMPORT_TEMPLATE_HEADERS } from "../utils/importTemplate";
import { parseStudentCsv, MAX_IMPORT_BYTES } from "../utils/importCsv.js";

// Rows per request. The API client gives a request 10 seconds and the server
// creates rows one at a time, so one 500-row request can time out on the
// client while the server carries on saving — and a second click then adds
// every student again. Small requests finish well inside the timeout, and if
// one does fail we know exactly how many rows were confirmed saved.
const CHUNK_SIZE = 50;

// Sends the rows in chunks, in order. Server row numbers are relative to the
// chunk (header = row 1), so they are shifted by the chunk's offset. If a
// request fails, the error carries what had been saved up to that point.
async function importInChunks(rows, onProgress) {
  let imported = 0;
  const failed = [];

  for (let offset = 0; offset < rows.length; offset += CHUNK_SIZE) {
    const chunk = rows.slice(offset, offset + CHUNK_SIZE);
    let result;
    try {
      result = await apiClient.importStudents(chunk);
    } catch (err) {
      err.importProgress = { imported, failed, firstUnknownRow: offset + 2, lastUnknownRow: offset + chunk.length + 1 };
      throw err;
    }
    const chunkFailed = Array.isArray(result?.failed) ? result.failed : [];
    imported += result?.imported ?? chunk.length - chunkFailed.length;
    chunkFailed.forEach((item) => failed.push({ ...item, row: item.row + offset }));
    onProgress?.(Math.min(offset + chunk.length, rows.length));
  }
  return { imported, failed };
}

export default function ImportStudentsModal({ onCancel, onImported, isAdmin = false }) {
  const showToast = useToast();
  const [rows, setRows] = useState([]);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [failedRows, setFailedRows] = useState([]);
  const [progress, setProgress] = useState(0);

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    // Clear the input so choosing the same (re-saved) file again still fires onChange.
    event.target.value = "";
    if (!file) return;
    setError("");
    setFailedRows([]);
    setFileName(file.name);
    try {
      if (file.size > MAX_IMPORT_BYTES) {
        throw new Error("This file is too large to import in one go. Split it into smaller files.");
      }
      setRows(parseStudentCsv(await file.text(), IMPORT_TEMPLATE_HEADERS));
    } catch (err) {
      setRows([]);
      setError(err.message || "Unable to read CSV.");
    }
  };

  const handleImport = async () => {
    if (!rows.length || loading) return;
    setLoading(true);
    setError("");
    setFailedRows([]);
    setProgress(0);
    try {
      const result = await importInChunks(rows, setProgress);
      onImported(result);
      const { failed, imported } = result;
      if (failed.length) {
        // Keep the dialog open so the user can see which rows were rejected.
        // The accepted rows are already saved, so the file is cleared to stop
        // a second click from importing them again.
        setFailedRows(failed);
        setRows([]);
        setFileName("");
        setLoading(false);
        showToast("warning", `${imported} imported, ${failed.length} failed.`);
        return;
      }
      showToast("success", `${imported} student(s) imported successfully.`);
      onCancel();
    } catch (err) {
      const saved = err?.importProgress;
      const definitelyRejected = typeof err?.status === "number" && err.status < 500;
      if (saved && (saved.imported > 0 || saved.failed.length > 0 || !definitelyRejected)) {
        // Part of the file may already be saved, so don't leave the same rows
        // ready to send again: a retry would add those students twice.
        const message = definitelyRejected
          ? `The import stopped. ${saved.imported} student(s) were saved. Rows ${saved.firstUnknownRow} onward were not imported.`
          : `The import was interrupted. ${saved.imported} student(s) were saved, and rows ${saved.firstUnknownRow}-${saved.lastUnknownRow} may or may not have been. The rest were not sent. Check the student list before importing again so nobody is added twice.`;
        onImported({ imported: saved.imported, failed: saved.failed });
        setFailedRows(saved.failed);
        setRows([]);
        setFileName("");
        setError(message);
        showToast("error", message);
      } else {
        const message = getErrorMessage(err, "Student import failed.");
        setError(message);
        showToast("error", message);
      }
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onCancel} labelledBy="import-students-title">
      <div className="p-5 sm:p-6">
        <h2 id="import-students-title" className="text-base font-bold text-slate-900">Import Students</h2>
        <p className="mt-1 text-sm text-slate-500">Upload a CSV with student and primary guardian information.</p>
        <ul className="mt-2 list-disc space-y-0.5 pl-4 text-xs text-slate-500">
          <li>Required columns: firstName, lastName, birthday, gender, address, and at least one of motherName, fatherName or guardianName.</li>
          <li>birthday: YYYY-MM-DD (e.g. 2022-03-15). gender: male, female, other or prefer_not_to_say. session: morning or afternoon. status: active or inactive.</li>
          <li>A blank session imports as morning, and a blank status as active.</li>
          <li>Up to 500 students per file. Save from Excel as CSV UTF-8.</li>
          {isAdmin && (
            <li className="font-semibold text-amber-700">
              Imported students aren&apos;t assigned to a teacher. Teachers can&apos;t see them until you assign one from each student&apos;s Edit page.
            </li>
          )}
        </ul>
        <button type="button" onClick={downloadStudentImportTemplate} className="mt-2 text-xs font-semibold text-[#C2570C] underline">Download CSV template</button>
        <label className="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 p-6 text-center hover:bg-slate-50">
          <Upload className="h-6 w-6 text-slate-400" />
          <span className="mt-2 text-sm font-semibold text-slate-700">{fileName || "Choose CSV file"}</span>
          <input type="file" accept=".csv,text/csv" onChange={handleFile} className="sr-only" />
        </label>
        {rows.length > 0 && <p className="mt-3 text-xs font-semibold text-slate-600">{rows.length} student record(s) ready to import.</p>}
        {error && <p role="alert" className="mt-3 text-xs text-red-600">{error}</p>}
        {failedRows.length > 0 && (
          <div role="alert" className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
            <p className="font-semibold">{failedRows.length} row(s) were not imported. Fix them in the CSV and upload again:</p>
            <ul className="mt-2 max-h-40 list-disc space-y-1 overflow-y-auto pl-4">
              {failedRows.map((item, index) => (
                <li key={`${item.row}-${index}`}>Row {item.row}: {item.message}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCancel} disabled={loading} className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold">Cancel</button>
          <button type="button" onClick={handleImport} disabled={!rows.length || loading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#C2570C] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
            {loading && <Loader2 size={15} className="animate-spin" />}
            {loading ? (progress > 0 ? `Importing... ${progress}/${rows.length}` : "Importing...") : "Import Students"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
