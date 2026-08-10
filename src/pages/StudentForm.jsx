import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useFormValidation } from "../hooks/useFormValidation";
import { studentSchema } from "../validation/student.js";
import { apiClient } from "../api/client.js";

const initialValues = {
  name: "",
  age: "",
  birthday: "",
  guardianName: "",
  guardianPhone: "",
  address: "",
  allergies: "",
  dietary: "",
};

export default function StudentForm() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(studentId);
  const [loading, setLoading] = useState(isEditing);
  const [submitError, setSubmitError] = useState("");

  const handleStudentSubmit = useCallback(
    async (data) => {
      setSubmitError("");

      try {
        if (isEditing) {
          await apiClient.updateStudent(studentId, data);
        } else {
          await apiClient.createStudent(data);
        }
        navigate("/student-info");
      } catch (error) {
        console.error(error);
        setSubmitError(error?.message || "Unable to save student record.");
      }
    },
    [isEditing, studentId, navigate],
  );

  const form = useFormValidation(
    initialValues,
    handleStudentSubmit,
    studentSchema,
  );

  useEffect(() => {
    if (!isEditing) return;

    let isMounted = true;

    // Defer setLoading to avoid synchronous setState inside effect
    Promise.resolve().then(() => {
      if (isMounted) setLoading(true);
    });

    apiClient
      .getStudent(studentId)
      .then((student) => {
        if (!isMounted) return;
        form.setValues({
          name: student.name || "",
          age: student.age || "",
          birthday: student.birthday || "",
          guardianName: student.guardianName || "",
          guardianPhone: student.guardianPhone || "",
          address: student.address || "",
          allergies: student.allergies || "",
          dietary: student.dietary || "",
        });
      })
      .catch((error) => {
        console.error(error);
        if (isMounted) {
          setSubmitError(error?.message || "Unable to load student data.");
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isEditing, studentId, form]);

  if (loading && isEditing) {
    return (
      <div className="min-h-[calc(100vh-70px)] bg-[#f8f9ff] p-6">
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
          <div className="flex flex-col items-center justify-center gap-3 py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-600 border-t-transparent" />
            <p className="text-gray-600">Loading student details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-70px)] bg-[#f8f9ff] p-6">
      <div className="mx-auto max-w-3xl rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-end">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? "Edit Student" : "Add Student"}
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              {isEditing
                ? "Update student information and save changes."
                : "Create a new student record for enrollment tracking."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/student-info")}
            className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
          >
            Back to students
          </button>
        </div>

        {submitError ? (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {submitError}
          </div>
        ) : null}

        <form onSubmit={form.handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              label="Student Name"
              name="name"
              value={form.values.name}
              onChange={form.handleChange}
              onBlur={form.handleBlur}
              error={form.touched.name && form.errors.name}
              placeholder="Enter student name"
            />

            <FormField
              label="Age"
              name="age"
              value={form.values.age}
              onChange={form.handleChange}
              onBlur={form.handleBlur}
              error={form.touched.age && form.errors.age}
              placeholder="4 Years Old"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              label="Birthday"
              name="birthday"
              type="date"
              value={form.values.birthday}
              onChange={form.handleChange}
              onBlur={form.handleBlur}
              error={form.touched.birthday && form.errors.birthday}
            />

            <FormField
              label="Guardian Name"
              name="guardianName"
              value={form.values.guardianName}
              onChange={form.handleChange}
              onBlur={form.handleBlur}
              error={form.touched.guardianName && form.errors.guardianName}
              placeholder="Parent or guardian name"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              label="Guardian Phone"
              name="guardianPhone"
              type="tel"
              value={form.values.guardianPhone}
              onChange={form.handleChange}
              onBlur={form.handleBlur}
              error={form.touched.guardianPhone && form.errors.guardianPhone}
              placeholder="0912-345-6789"
            />

            <FormField
              label="Address"
              name="address"
              value={form.values.address}
              onChange={form.handleChange}
              onBlur={form.handleBlur}
              error={form.touched.address && form.errors.address}
              placeholder="Street address"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <TextAreaField
              label="Allergies"
              name="allergies"
              value={form.values.allergies}
              onChange={form.handleChange}
              onBlur={form.handleBlur}
              placeholder="List any known allergies"
            />

            <TextAreaField
              label="Dietary Restrictions"
              name="dietary"
              value={form.values.dietary}
              onChange={form.handleChange}
              onBlur={form.handleBlur}
              placeholder="List any dietary restrictions"
            />
          </div>

          <div className="flex flex-col gap-3 border-t border-gray-200 pt-6 sm:flex-row">
            <button
              type="button"
              onClick={() => navigate("/student-info")}
              className="flex-1 rounded-xl bg-slate-100 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={form.isSubmitting || loading}
              className="flex-1 rounded-xl bg-[#C2570C] px-5 py-3 font-semibold text-white transition hover:bg-orange-800 disabled:bg-slate-300"
            >
              {form.isSubmitting || loading
                ? "Saving..."
                : isEditing
                  ? "Update Student"
                  : "Add Student"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormField({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  type = "text",
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1.5"
      >
        {label}
      </label>
      <input
        id={name}
        type={type}
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        onBlur={onBlur}
        className={`w-full rounded-xl border px-3 py-3 bg-slate-50 text-sm outline-none transition focus:ring-2 focus:ring-[#C2570C]/40 ${
          error
            ? "border-red-500 focus:border-red-500"
            : "border-slate-300 focus:border-[#C2570C]"
        }`}
      />
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

function TextAreaField({ label, name, value, onChange, onBlur, placeholder }) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1.5"
      >
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        onBlur={onBlur}
        rows={3}
        className="w-full rounded-xl border px-3 py-3 bg-slate-50 text-sm outline-none transition border-slate-300 focus:border-[#C2570C] focus:ring-2 focus:ring-[#C2570C]/40"
      />
    </div>
  );
}
