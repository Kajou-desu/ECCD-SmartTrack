import { Users } from "lucide-react";
import { useParentChild } from "@hooks/useParentChild.js";
import formatStudentName from "@utils/formatStudentName.js";
import Avatar from "@components/shared/Avatar.jsx";

export default function MyChildrenSettings() {
  const { availableChildren, childrenLoading, childrenError, retryChildren } = useParentChild();

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <Users aria-hidden="true" className="h-6 w-6 text-[#C2570C]" />
          <h2 className="text-lg font-bold text-gray-800 sm:text-xl">My Children</h2>
        </div>
        <p className="text-sm text-gray-600">
          The children linked to your account. To add or remove a child, ask your child's teacher.
        </p>
      </div>

      {childrenLoading ? (
        <p className="rounded-xl bg-gray-50 px-4 py-4 text-sm text-gray-500">Loading…</p>
      ) : childrenError ? (
        <div role="alert" className="rounded-xl bg-gray-50 px-4 py-4 text-sm text-gray-600">
          <p>We couldn't load your children.</p>
          <button
            type="button"
            onClick={() => retryChildren()}
            className="mt-2 cursor-pointer font-medium text-[#C2570C] underline"
          >
            Try again
          </button>
        </div>
      ) : availableChildren.length === 0 ? (
        <p className="rounded-xl bg-gray-50 px-4 py-4 text-sm text-gray-500">
          No children are linked to your account yet.
        </p>
      ) : (
        <ul className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-200">
          {availableChildren.map((child) => (
            <li key={child.id} className="flex items-center gap-4 px-4 py-3">
              <Avatar src={child.photo} name={child.name} className="h-12 w-12 rounded-full text-sm" />
              <div className="min-w-0">
                <p className="truncate font-medium text-gray-900">{formatStudentName(child)}</p>
                <p className="text-sm text-gray-500">
                  {child.session ? `${child.session[0].toUpperCase()}${child.session.slice(1)} session` : "Session not set"}
                  {child.teacher ? ` · Teacher: ${child.teacher}` : ""}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
