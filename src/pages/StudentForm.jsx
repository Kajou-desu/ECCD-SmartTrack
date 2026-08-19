import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useFormValidation } from "@hooks/useFormValidation";
import { studentSchema } from "@validation/student.js";
import { apiClient } from "@api/client.js";
import ContactSection from "@features/students/components/form/ContactSection";
import FileUploadField from "@features/students/components/form/FileUploadField";
import FormField from "@features/students/components/form/FormField";
import FormSection from "@features/students/components/form/FormSection";
import SessionSelector from "@features/students/components/form/SessionSelector";
import TextAreaField from "@features/students/components/form/TextAreaField";

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
