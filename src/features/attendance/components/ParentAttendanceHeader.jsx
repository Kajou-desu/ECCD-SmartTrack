export default function ParentAttendanceHeader({ childName }) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800">Attendance Record</h1>
      <p className="mt-2 text-sm text-gray-600">
        {childName
          ? `Monitor ${childName}'s attendance throughout the month`
          : "Monitor your child's attendance throughout the month"}
      </p>
    </div>
  );
}
