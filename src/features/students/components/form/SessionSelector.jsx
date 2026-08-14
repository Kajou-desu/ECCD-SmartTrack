import SessionOption from "./SessionOption";

export default function SessionSelector({ value, onChange }) {
  return (
    <div className="mt-5">
      <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">Session</label>

      <div className="grid gap-3 sm:grid-cols-2">
        <SessionOption label="Morning" description="AM session" value="morning" checked={value === "morning"} onChange={onChange} />
        <SessionOption label="Afternoon" description="PM session" value="afternoon" checked={value === "afternoon"} onChange={onChange} />
      </div>
    </div>
  );
}
