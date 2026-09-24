import SubmissionListItem from "@features/materials/components/SubmissionListItem";

export default function SubmissionsList({ submissions, activeId, onSelect }) {
  return (
    <section
      aria-label="Students who submitted work"
      className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-1"
    >
      <h2 className="mb-6 text-lg font-bold text-slate-900">Students</h2>

      <ul className="flex flex-col gap-3">
        {submissions.map((submission) => (
          <li key={submission.id}>
            <SubmissionListItem
              submission={submission}
              isActive={submission.id === activeId}
              onSelect={onSelect}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
