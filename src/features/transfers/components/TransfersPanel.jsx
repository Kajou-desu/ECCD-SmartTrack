import { useAnswerTransfer, useStudentTransfers } from "../hooks/useStudentTransfers.js";
import { describeTransfer } from "../utils/transfers.js";

// Pending transfers: students another teacher wants to hand to me (accept or
// decline), and the requests I made (cancel). Shows nothing when there are none.
// An Admin sees every pending request under "Waiting to be accepted".
export default function TransfersPanel() {
  const { data } = useStudentTransfers();
  const answer = useAnswerTransfer();
  if (!data || (data.incoming.length === 0 && data.outgoing.length === 0)) return null;

  const act = (id, action) => {
    if (!answer.isPending) answer.mutate({ id, action });
  };
  const button = "rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-50";

  return (
    <section aria-label="Student transfers" className="rounded-3xl border border-amber-200 bg-amber-50 p-4 sm:p-5">
      {data.incoming.length > 0 && (
        <>
          <h2 className="text-sm font-bold text-amber-900">Waiting to be accepted</h2>
          <ul className="mt-2 divide-y divide-amber-200">
            {data.incoming.map((t) => (
              <li key={t.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 text-sm text-amber-950">
                  <p className="font-semibold">{describeTransfer(t)}</p>
                  <p className="text-xs text-amber-800">
                    Asked by {t.fromTeacher?.name ?? "a teacher"}{t.fromTeacher?.centerName ? ` (${t.fromTeacher.centerName})` : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button type="button" disabled={answer.isPending} onClick={() => act(t.id, "accept")} aria-label={`Accept ${t.student.name}`} className={`${button} bg-[#C2570C] text-white hover:bg-[#a94709]`}>
                    Accept
                  </button>
                  <button type="button" disabled={answer.isPending} onClick={() => act(t.id, "decline")} aria-label={`Decline ${t.student.name}`} className={`${button} bg-white text-slate-700 hover:bg-slate-50`}>
                    Decline
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {data.outgoing.length > 0 && (
        <>
          <h2 className={`text-sm font-bold text-amber-900 ${data.incoming.length > 0 ? "mt-4" : ""}`}>Requests you sent</h2>
          <ul className="mt-2 divide-y divide-amber-200">
            {data.outgoing.map((t) => (
              <li key={t.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="min-w-0 text-sm font-semibold text-amber-950">
                  {describeTransfer(t)} <span className="font-normal text-amber-800">· waiting for them to accept</span>
                </p>
                <button type="button" disabled={answer.isPending} onClick={() => act(t.id, "cancel")} aria-label={`Cancel the request for ${t.student.name}`} className={`${button} bg-white text-slate-700 hover:bg-slate-50`}>
                  Cancel request
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
