import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Modal from "@components/ui/Modal";
import { apiClient } from "@api/client.js";
import { getErrorMessage } from "@api/errorMessage.js";
import { useToast } from "@hooks/useToast.js";
import { useTransferTeachers } from "../hooks/useTransferTeachers.js";
import { refreshAfterTransfer } from "../hooks/useStudentTransfers.js";
import { SESSION_LABELS, teacherOption, transferOutcome, transferPayload, transferProblem } from "../utils/transfers.js";

// Moves a student to the other session, another teacher, or another center. It is
// started by the student's own teacher (an Admin may too); the note under the
// form says whether it applies at once or needs the other teacher to accept.
export default function TransferStudentModal({ student, studentCenterId = null, isAdmin = false, onClose, onDone }) {
  const queryClient = useQueryClient();
  const showToast = useToast();
  const { data: teachers = [], isLoading, isError } = useTransferTeachers(true);
  const [session, setSession] = useState(student.session);
  const [teacherId, setTeacherId] = useState(""); // "" = keep the current teacher
  const [busy, setBusy] = useState(false);

  const problem = transferProblem({ student, teacherId: teacherId || undefined, session });
  const outcome = transferOutcome({ student, teacherId: teacherId || undefined, teachers, studentCenterId, isAdmin });

  const submit = async (event) => {
    event.preventDefault();
    if (busy || problem) return;
    setBusy(true);
    try {
      const transfer = await apiClient.createStudentTransfer(transferPayload({ student, teacherId: teacherId || undefined, session }));
      showToast(
        "success",
        transfer.status === "accepted"
          ? `${student.name} was moved.`
          : `Request sent to ${transfer.toTeacher?.name ?? "the teacher"}. ${student.name} stays with you until it is accepted.`,
      );
      await refreshAfterTransfer(queryClient);
      onDone?.(transfer);
      onClose();
    } catch (err) {
      showToast("error", getErrorMessage(err, "Couldn't start the transfer. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal onClose={busy ? () => {} : onClose} labelledBy="transfer-student-title">
      <form onSubmit={submit} className="flex max-h-[90vh] flex-col overflow-y-auto p-5 sm:p-6">
        <h2 id="transfer-student-title" className="text-base font-bold text-slate-900">
          Transfer {student.name}
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Currently with {student.teacher ?? "no teacher"} in the {SESSION_LABELS[student.session]?.toLowerCase()} session.
          Attendance history stays with the student.
        </p>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-slate-800">Session</legend>
          <div className="mt-2 flex gap-2">
            {Object.entries(SESSION_LABELS).map(([value, label]) => (
              <label
                key={value}
                className={`flex flex-1 cursor-pointer items-center justify-center rounded-lg border px-3 py-2 text-sm font-semibold ${
                  session === value ? "border-[#C2570C] bg-orange-50 text-[#C2570C]" : "border-slate-300 text-slate-700"
                }`}
              >
                <input type="radio" name="session" value={value} checked={session === value} onChange={() => setSession(value)} className="sr-only" />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="mt-5 block text-sm font-semibold text-slate-800" htmlFor="transfer-teacher">
          Teacher
        </label>
        <select
          id="transfer-teacher"
          value={teacherId}
          onChange={(event) => setTeacherId(event.target.value)}
          disabled={isLoading}
          className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
        >
          <option value="">Keep {student.teacher ?? "the current teacher"}</option>
          {teachers.filter((t) => t.id !== student.teacherId).map((t) => (
            <option key={t.id} value={t.id}>{teacherOption(t)}</option>
          ))}
        </select>
        {isError && <p role="alert" className="mt-2 text-sm text-red-700">Couldn't load the teachers. Close this and try again.</p>}

        {!problem && (
          <p role="status" className={`mt-5 rounded-lg px-3 py-2 text-sm ${outcome.kind === "approval" ? "bg-amber-50 text-amber-900" : "bg-slate-50 text-slate-700"}`}>
            {outcome.text}
          </p>
        )}

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} disabled={busy} className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 disabled:opacity-50">
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy || Boolean(problem)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#C2570C] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#a94709] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy && <Loader2 aria-hidden="true" size={15} className="animate-spin" />}
            {outcome.kind === "approval" ? "Send request" : "Transfer student"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
