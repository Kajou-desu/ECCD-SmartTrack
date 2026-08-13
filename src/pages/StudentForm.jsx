import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useFormValidation } from "../hooks/useFormValidation";
import { studentSchema } from "../validation/student.js";
import { apiClient } from "../api/client.js";

const initialValues = {
  firstName: "",
  middleName: "",
  lastName: "",
  suffix: "",
  birthday: "",
  address: "",
  session: "morning",
  motherName: "",
  motherAddress: "",
  motherPhone: "",
  motherEmail: "",
  fatherName: "",
  fatherAddress: "",
  fatherPhone: "",
  fatherEmail: "",
  guardianName: "",
  guardianAddress: "",
  guardianPhone: "",
  guardianEmail: "",
  allergies: "",
  dietary: "",
  specialNotes: "",
  documents: [],
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

  const { setValues } = form;

  useEffect(() => {
    if (!isEditing) return;

    let isMounted = true;

    const loadStudent = async () => {
      setLoading(true);
      setSubmitError("");

      try {
        const student = await apiClient.getStudent(studentId);

        if (!isMounted) return;

        setValues({
          firstName: student.firstName || "",
          middleName: student.middleName || "",
          lastName: student.lastName || "",
          suffix: student.suffix || "",
          birthday: student.birthday || "",
          address: student.address || "",
          session: student.session || "morning",
          motherName: student.motherName || "",
          motherAddress: student.motherAddress || "",
          motherPhone: student.motherPhone || "",
          motherEmail: student.motherEmail || "",
          fatherName: student.fatherName || "",
          fatherAddress: student.fatherAddress || "",
          fatherPhone: student.fatherPhone || "",
          fatherEmail: student.fatherEmail || "",
          guardianName: student.guardianName || "",
          guardianAddress: student.guardianAddress || "",
          guardianPhone: student.guardianPhone || "",
          guardianEmail: student.guardianEmail || "",
          allergies: student.allergies || "",
          dietary: student.dietary || "",
          specialNotes: student.specialNotes || "",
          documents: Array.isArray(student.documents) ? student.documents : [],
        });
      } catch (error) {
        console.error(error);

        if (isMounted) {
          setSubmitError(
            error?.message || "Unable to load student information.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadStudent();

    return () => {
      isMounted = false;
    };
  }, [isEditing, studentId, setValues]);

  if (loading && isEditing) {
    return (
      <div className="w-full bg-[#f8f9ff] px-4 py-5 sm:px-6 sm:py-6">
        <div className="mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex min-h-72 flex-col items-center justify-center px-6">
            <div className="h-9 w-9 animate-spin rounded-full border-4 border-orange-600 border-t-transparent" />
            <p className="mt-4 text-sm font-medium text-slate-600">
              Loading student details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#f8f9ff] px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <PageHeader
          isEditing={isEditing}
          onBack={() => navigate("/student-info")}
        />

        {submitError ? (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {submitError}
          </div>
        ) : null}

        <form onSubmit={form.handleSubmit} className="space-y-5">
          <FormSection
            number="01"
            title="Student Information"
            description="Basic details and enrollment session."
          >
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <FormField
                label="First Name"
                name="firstName"
                value={form.values.firstName}
                onChange={form.handleChange}
                onBlur={form.handleBlur}
                error={form.touched.firstName && form.errors.firstName}
                placeholder="First name"
              />

              <FormField
                label="Middle Name"
                name="middleName"
                value={form.values.middleName}
                onChange={form.handleChange}
                onBlur={form.handleBlur}
                error={form.touched.middleName && form.errors.middleName}
                placeholder="Middle name"
              />

              <FormField
                label="Last Name"
                name="lastName"
                value={form.values.lastName}
                onChange={form.handleChange}
                onBlur={form.handleBlur}
                error={form.touched.lastName && form.errors.lastName}
                placeholder="Last name"
              />

              <FormField
                label="Suffix"
                name="suffix"
                value={form.values.suffix}
                onChange={form.handleChange}
                onBlur={form.handleBlur}
                error={form.touched.suffix && form.errors.suffix}
                placeholder="Jr., Sr., III"
              />
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
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
                label="Address"
                name="address"
                value={form.values.address}
                onChange={form.handleChange}
                onBlur={form.handleBlur}
                error={form.touched.address && form.errors.address}
                placeholder="Complete home address"
              />
            </div>

            <SessionSelector
              value={form.values.session}
              onChange={form.handleChange}
            />
          </FormSection>

          <FormSection
            number="02"
            title="Parent Information"
            description="Contact details for the student's parents."
          >
            <div className="grid gap-5 lg:grid-cols-2">
              <ContactSection
                title="Mother"
                prefix="mother"
                values={form.values}
                touched={form.touched}
                errors={form.errors}
                onChange={form.handleChange}
                onBlur={form.handleBlur}
              />

              <ContactSection
                title="Father"
                prefix="father"
                values={form.values}
                touched={form.touched}
                errors={form.errors}
                onChange={form.handleChange}
                onBlur={form.handleBlur}
              />
            </div>
          </FormSection>

          <FormSection
            number="03"
            title="Guardian Information"
            description="Provide the details of the student's primary responsible adult. If both parents are present, enter the primary parent. If only one parent is present, enter that parent. If neither parent is present, enter the student's legal guardian."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                label="Guardian Name"
                name="guardianName"
                value={form.values.guardianName}
                onChange={form.handleChange}
                onBlur={form.handleBlur}
                error={form.touched.guardianName && form.errors.guardianName}
                placeholder="Guardian's full name"
              />

              <FormField
                label="Guardian Email"
                name="guardianEmail"
                type="email"
                value={form.values.guardianEmail}
                onChange={form.handleChange}
                onBlur={form.handleBlur}
                error={form.touched.guardianEmail && form.errors.guardianEmail}
                placeholder="guardian@example.com"
              />

              <FormField
                label="Guardian Address"
                name="guardianAddress"
                value={form.values.guardianAddress}
                onChange={form.handleChange}
                onBlur={form.handleBlur}
                error={
                  form.touched.guardianAddress && form.errors.guardianAddress
                }
                placeholder="Complete home address"
              />

              <FormField
                label="Guardian Phone Number"
                name="guardianPhone"
                type="tel"
                value={form.values.guardianPhone}
                onChange={form.handleChange}
                onBlur={form.handleBlur}
                error={form.touched.guardianPhone && form.errors.guardianPhone}
                placeholder="0912-345-6789"
              />
            </div>
          </FormSection>

          <FormSection
            number="04"
            title="Medical Information"
            description="Record important health and dietary information."
          >
            <div className="grid gap-4 lg:grid-cols-2">
              <TextAreaField
                label="Allergies"
                name="allergies"
                value={form.values.allergies}
                onChange={form.handleChange}
                onBlur={form.handleBlur}
                error={form.touched.allergies && form.errors.allergies}
                placeholder="List any known allergies"
              />

              <TextAreaField
                label="Dietary Restrictions"
                name="dietary"
                value={form.values.dietary}
                onChange={form.handleChange}
                onBlur={form.handleBlur}
                error={form.touched.dietary && form.errors.dietary}
                placeholder="List dietary restrictions or requirements"
              />
            </div>

            <div className="mt-4">
              <TextAreaField
                label="Special Notes"
                name="specialNotes"
                value={form.values.specialNotes}
                onChange={form.handleChange}
                onBlur={form.handleBlur}
                error={form.touched.specialNotes && form.errors.specialNotes}
                placeholder="Additional notes or special requirements"
              />
            </div>
          </FormSection>

          <FormSection
            number="05"
            title="Documents"
            description="Upload supporting student documents when available."
          >
            <FileUploadField
              name="documents"
              value={form.values.documents}
              onChange={form.handleChange}
            />
          </FormSection>

          <div className="sticky bottom-0 border-t border-slate-200 bg-[#f8f9ff]/95 py-4 backdrop-blur">
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => navigate("/student-info")}
                className="cursor-pointer rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:min-w-36"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={form.isSubmitting || loading}
                className="cursor-pointer rounded-xl bg-[#C2570C] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#9f4709] disabled:cursor-not-allowed disabled:bg-slate-300 sm:min-w-44"
              >
                {form.isSubmitting
                  ? "Saving..."
                  : isEditing
                    ? "Save Changes"
                    : "Add Student"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function PageHeader({ isEditing, onBack }) {
  return (
    <div className="mb-5 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#C2570C]">
          Student Records
        </p>

        <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
          {isEditing ? "Edit Student" : "Add New Student"}
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          {isEditing
            ? "Review and update the student's information below."
            : "Enter the student's information to create a new enrollment record."}
        </p>
      </div>

      <button
        type="button"
        onClick={onBack}
        className="cursor-pointer w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
      >
        Back to Students
      </button>
    </div>
  );
}

function FormSection({ number, title, description, children }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-4 py-4 sm:px-6">
        <div className="flex gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-xs font-bold text-[#C2570C]">
            {number}
          </span>

          <div>
            <h2 className="font-bold text-slate-900">{title}</h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              {description}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">{children}</div>
    </section>
  );
}

function ContactSection({
  title,
  prefix,
  values,
  touched,
  errors,
  onChange,
  onBlur,
}) {
  const fieldName = (field) => `${prefix}${field}`;

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
      <h3 className="mb-4 text-sm font-bold text-slate-800">{title}</h3>

      <div className="space-y-4">
        <FormField
          label={`${title} Name`}
          name={fieldName("Name")}
          value={values[fieldName("Name")]}
          onChange={onChange}
          onBlur={onBlur}
          error={touched[fieldName("Name")] && errors[fieldName("Name")]}
          placeholder={`${title}'s full name`}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Phone Number"
            name={fieldName("Phone")}
            type="tel"
            value={values[fieldName("Phone")]}
            onChange={onChange}
            onBlur={onBlur}
            error={touched[fieldName("Phone")] && errors[fieldName("Phone")]}
            placeholder="0912-345-6789"
          />

          <FormField
            label="Email Address"
            name={fieldName("Email")}
            type="email"
            value={values[fieldName("Email")]}
            onChange={onChange}
            onBlur={onBlur}
            error={touched[fieldName("Email")] && errors[fieldName("Email")]}
            placeholder="email@example.com"
          />
        </div>

        <FormField
          label="Address"
          name={fieldName("Address")}
          value={values[fieldName("Address")]}
          onChange={onChange}
          onBlur={onBlur}
          error={touched[fieldName("Address")] && errors[fieldName("Address")]}
          placeholder="Complete home address"
        />
      </div>
    </div>
  );
}

function SessionSelector({ value, onChange }) {
  return (
    <div className="mt-5">
      <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
        Session
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <SessionOption
          label="Morning"
          description="AM session"
          value="morning"
          checked={value === "morning"}
          onChange={onChange}
        />

        <SessionOption
          label="Afternoon"
          description="PM session"
          value="afternoon"
          checked={value === "afternoon"}
          onChange={onChange}
        />
      </div>
    </div>
  );
}

function SessionOption({ label, description, value, checked, onChange }) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${
        checked
          ? "border-[#C2570C] bg-orange-50"
          : "border-slate-200 bg-white hover:border-slate-300"
      }`}
    >
      <input
        type="radio"
        name="session"
        value={value}
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 accent-[#C2570C]"
      />

      <span>
        <span className="block text-sm font-semibold text-slate-800">
          {label}
        </span>
        <span className="block text-xs text-slate-500">{description}</span>
      </span>
    </label>
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
        className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500"
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
        className={`w-full rounded-xl border bg-white px-3 py-3 text-sm text-slate-800 outline-none transition ${
          error
            ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
            : "border-slate-300 focus:border-[#C2570C] focus:ring-2 focus:ring-[#C2570C]/15"
        }`}
      />

      {error ? <p className="mt-1.5 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

function TextAreaField({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  placeholder,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500"
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
        rows={4}
        className={`w-full resize-y rounded-xl border bg-white px-3 py-3 text-sm text-slate-800 outline-none transition ${
          error
            ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
            : "border-slate-300 focus:border-[#C2570C] focus:ring-2 focus:ring-[#C2570C]/15"
        }`}
      />

      {error ? <p className="mt-1.5 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

function FileUploadField({ name, value = [], onChange }) {
  const handleFileChange = (event) => {
    const files = Array.from(event.target.files || []);

    onChange({
      target: {
        name,
        value: files,
      },
    });
  };

  return (
    <div>
      <label
        htmlFor={name}
        className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center transition hover:border-[#C2570C]/50 hover:bg-orange-50/30"
      >
        <input
          id={name}
          type="file"
          name={name}
          multiple
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          onChange={handleFileChange}
          className="sr-only"
        />

        <svg
          className="mb-3 h-10 w-10 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 16V4m0 0-4 4m4-4 4 4M4 20h16"
          />
        </svg>

        <p className="text-sm font-semibold text-slate-700">
          Select documents to upload
        </p>

        <p className="mt-1 text-xs text-slate-500">
          PDF, DOC, DOCX, JPG, or PNG
        </p>
      </label>

      {value.length > 0 ? (
        <div className="mt-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
            Selected Documents ({value.length})
          </p>

          <ul className="space-y-2">
            {value.map((file, index) => {
              const fileName =
                file?.name ||
                file?.filename ||
                file?.originalName ||
                `Document ${index + 1}`;

              return (
                <li
                  key={`${fileName}-${index}`}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600"
                >
                  <span className="text-[#C2570C]">✓</span>
                  <span className="min-w-0 truncate">{fileName}</span>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
