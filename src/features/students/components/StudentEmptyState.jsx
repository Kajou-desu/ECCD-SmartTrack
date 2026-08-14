export default function StudentEmptyState({ message = "No student records found." }) {
  return (
    <div className="p-8 text-center text-sm text-gray-500">{message}</div>
  );
}
