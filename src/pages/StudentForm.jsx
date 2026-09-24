import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Modal from "@components/ui/Modal";
import { Plus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useFormValidation } from "@hooks/useFormValidation";
import { studentSchema } from "@validation/student.js";
import { apiClient } from "@api/client.js";
import ContactSection from "@features/students/components/form/ContactSection";
import FileUploadField from "@features/students/components/form/FileUploadField";
import FormField from "@features/students/components/form/FormField";
import FormSection from "@features/students/components/form/FormSection";
import SessionSelector from "@features/students/components/form/SessionSelector";
import AddressFields from "@features/students/components/form/AddressFields";
import ListField from "@features/students/components/form/ListField";
import { combineAddress, splitAddress } from "@features/students/utils/address.js";
import { toMedicalList, fromMedicalList } from "@features/students/utils/medicalList.js";
import { compressImage } from "@utils/compressImage.js";

const initialValues = {
  firstName: "",
  middleName: "",
  lastName: "",
  suffix: "",
  birthday: "",
  address: "",
  addressPurok: "",
  addressBarangay: "",
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
  photo: "",
  allergiesList: [],
  dietaryList: [],
  specialNotesList: [],
  documents: [],
};

const MAX_STUDENT_PHOTO_SIZE_BYTES = 5 * 1024 * 1024;

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("Unable to preview the selected image."));
        return;
      }
      resolve(reader.result);
    };
    reader.onerror = () => reject(new Error("Unable to read the selected image."));
    reader.readAsDataURL(file);
  });
}

export default function StudentForm() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = Boolean(studentId);

  const [loading, setLoading] = useState(isEditing);
  const [submitError, setSubmitError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const photoRequestRef = useRef(0);
  // The compressed File is kept separately from form.values.photo (a data URL
  // used only for the live preview): the actual upload goes through the
  // dedicated /api/students/:id/photo endpoint, sent as multipart after the
  // student record itself is created/updated (a new student has no id yet).
  const [photoFile, setPhotoFile] = useState(null);
  // A guardian isn't required on its own — the record just needs at least
  // one of mother/father/guardian name (see studentSchema.superRefine and
  // buildCreateData on the backend) — but most students don't need a
  // guardian distinct from their parents, so the section starts collapsed
  // behind a button and only opens automatically once there's existing
  // guardian data or a validation error on one of its fields.
  const [guardianOpen, setGuardianOpen] = useState(false);

  const handleStudentSubmit = useCallback(
    async (data) => {
      setSubmitError("");

      // photo isn't sent to create/update — it's a preview data URL, not the
      // file, and neither endpoint accepts it. The actual file goes through
      // apiClient.uploadStudentPhoto once the student record has an id.
      const studentFields = { ...data };
      delete studentFields.photo;
      const payload = {
        ...studentFields,
        allergies: fromMedicalList(data.allergiesList),
        dietary: fromMedicalList(data.dietaryList),
        specialNotes: fromMedicalList(data.specialNotesList),
      };

      try {
        let savedId = studentId;
        if (isEditing) {
          await apiClient.updateStudent(studentId, payload);
        } else {
          const created = await apiClient.createStudent(payload);
          savedId = created.id;
        }

        if (photoFile) {
          await apiClient.uploadStudentPhoto(savedId, photoFile);
        }

        // ["students"] is shared by the roster, the dashboard birthday widget,
        // and the upload-work student picker; ["dashboardStats"] backs the
        // "Total Students" card. Both need invalidating or a newly added/edited
        // student won't show up there until the cache's staleTime expires.
        queryClient.invalidateQueries({ queryKey: ["students"] });
        queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });

        navigate("/student-info");
      } catch (error) {
        console.error(error);
        setSubmitError(error?.message || "Unable to save student record.");
      }
    },
    [isEditing, studentId, navigate, queryClient, photoFile],
  );

  const handleDeleteStudent = async () => {
    if (!studentId || deleting) return;
    setDeleting(true);
    setSubmitError("");
    try {
      await apiClient.deleteStudent(studentId);
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      navigate("/student-info");
    } catch (error) {
      setSubmitError(error?.details?.message || "Unable to remove student.");
      setDeleting(false);
    }
  };

  const form = useFormValidation(
    initialValues,
    handleStudentSubmit,
    studentSchema,
  );

  const { setValues } = form;

  const handlePhotoChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    setPhotoError("");
    const requestId = ++photoRequestRef.current;

    if (!file) return;
    if (typeof file.type !== "string" || !file.type.startsWith("image/")) {
      setPhotoError("Please select an image file.");
      return;
    }
    if (file.size > MAX_STUDENT_PHOTO_SIZE_BYTES) {
      setPhotoError("Student picture must be 5 MB or smaller.");
      return;
    }

    try {
      const compressedFile = await compressImage(file);
      const photo = await readFileAsDataUrl(compressedFile);
      if (requestId !== photoRequestRef.current) return;
      setPhotoFile(compressedFile);
      setValues((previous) => ({ ...previous, photo }));
    } catch (error) {
      if (requestId !== photoRequestRef.current) return;
      setPhotoError(error.message || "Unable to read the selected image.");
    }
  };

  useEffect(() => () => {
    photoRequestRef.current += 1;
  }, []);

  // Keeps the student's Purok/Barangay pair in sync with the address string
  // validated and sent to the API.
  const handleAddressChange = (baseKey) => (event) => {
    const { name, value } = event.target;
    form.setValues((prev) => {
      const purok = name === `${baseKey}Purok` ? value : prev[`${baseKey}Purok`];
      const barangay = name === `${baseKey}Barangay` ? value : prev[`${baseKey}Barangay`];
      return { ...prev, [name]: value, [baseKey]: combineAddress(purok, barangay) };
    });
  };

  // Validation errors live on the combined field (e.g. "address"), not on
  // the individual Purok/Barangay inputs, so blurring either half also
  // marks the combined field touched.
  const handleAddressBlur = (baseKey) => (event) => {
    form.handleBlur(event);
    form.handleBlur({ target: { name: baseKey } });
  };

  const updateListItem = (key, index, value) => {
    form.setValues((prev) => {
      const list = [...prev[key]];
      list[index] = value;
      return { ...prev, [key]: list };
    });
  };

  const removeListItem = (key, index) => {
    form.setValues((prev) => ({ ...prev, [key]: prev[key].filter((_, i) => i !== index) }));
  };

  const addListItem = (key) => {
    form.setValues((prev) => ({ ...prev, [key]: [...prev[key], ""] }));
  };

  useEffect(() => {
    if (!isEditing) return;

    let isMounted = true;

    const loadStudent = async () => {
      setLoading(true);
      setSubmitError("");

      try {
        const student = await apiClient.getStudent(studentId);

        if (!isMounted) return;

        const studentAddr = splitAddress(student.address);
        setValues({
          firstName: student.firstName || "",
          middleName: student.middleName || "",
          lastName: student.lastName || "",
          suffix: student.suffix || "",
          birthday: student.birthday || "",
          address: student.address || "",
          addressPurok: studentAddr.purok,
          addressBarangay: studentAddr.barangay,
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
          photo: student.photo || "",
          allergiesList: toMedicalList(student.allergies),
          dietaryList: toMedicalList(student.dietary),
          specialNotesList: toMedicalList(student.specialNotes),
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

  const hasGuardianInfo = Boolean(
    form.values.guardianName ||
      form.values.guardianPhone ||
      form.values.guardianEmail ||
      form.values.guardianAddress,
  );
  const showGuardianForm = guardianOpen || hasGuardianInfo;

  // Auto-open the section if a submit attempt left a validation error on
  // one of its required fields, so the error is actually visible instead
  // of hidden behind the collapsed button. Guarded by !guardianOpen so
  // this only fires once (adjusting state during render, per
  // https://react.dev/learn/you-might-not-need-an-effect), not on every
  // render — an effect would trigger this codebase's
  // react-hooks/set-state-in-effect rule.
  const guardianHasErrors = Boolean(form.errors.guardianName || form.errors.guardianPhone);
  if (guardianHasErrors && !guardianOpen) {
    setGuardianOpen(true);
  }

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
                required
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
                required
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
                required
              />
            </div>

            <div className="mt-4">
              <AddressFields
                label="Address"
                purokName="addressPurok"
                barangayName="addressBarangay"
                purokValue={form.values.addressPurok}
                barangayValue={form.values.addressBarangay}
                onChange={handleAddressChange("address")}
                onBlur={handleAddressBlur("address")}
                error={form.touched.address && form.errors.address}
                required
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
            {showGuardianForm ? (
              <>
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
                    label="Guardian Phone Number"
                    name="guardianPhone"
                    type="tel"
                    value={form.values.guardianPhone}
                    onChange={form.handleChange}
                    onBlur={form.handleBlur}
                    error={form.touched.guardianPhone && form.errors.guardianPhone}
                    placeholder="0912-345-6789"
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
                </div>

                <div className="mt-4">
                  <FormField
                    label="Guardian Address"
                    name="guardianAddress"
                    value={form.values.guardianAddress}
                    onChange={form.handleChange}
                    onBlur={form.handleBlur}
                    error={form.touched.guardianAddress && form.errors.guardianAddress}
                    placeholder="Guardian's full address"
                  />
                </div>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setGuardianOpen(true)}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 py-3 text-sm font-semibold text-slate-600 transition hover:border-[#C2570C]/60 hover:text-[#C2570C]"
              >
                <Plus size={16} />
                Add Guardian Information
              </button>
            )}
          </FormSection>

          <FormSection
            number="04"
            title="Medical Information"
            description="Record important health and dietary information."
          >
            <div className="grid gap-4 lg:grid-cols-2">
              <ListField
                title="Allergies"
                items={form.values.allergiesList}
                placeholder="e.g. Peanuts — severe allergy, avoid all peanut products"
                onChange={(index, value) => updateListItem("allergiesList", index, value)}
                onRemove={(index) => removeListItem("allergiesList", index)}
                onAdd={() => addListItem("allergiesList")}
                addLabel="Add allergy"
              />

              <ListField
                title="Dietary Restrictions"
                items={form.values.dietaryList}
                placeholder="e.g. Vegetarian diet — no meat products"
                onChange={(index, value) => updateListItem("dietaryList", index, value)}
                onRemove={(index) => removeListItem("dietaryList", index)}
                onAdd={() => addListItem("dietaryList")}
                addLabel="Add dietary restriction"
              />
            </div>

            <div className="mt-4">
              <ListField
                title="Special Notes"
                items={form.values.specialNotesList}
                placeholder="e.g. Extra time for written activities"
                onChange={(index, value) => updateListItem("specialNotesList", index, value)}
                onRemove={(index) => removeListItem("specialNotesList", index)}
                onAdd={() => addListItem("specialNotesList")}
                addLabel="Add note"
              />
            </div>
          </FormSection>

          <FormSection
            number="05"
            title="Student Picture"
            description="Upload a clear picture of the student when available."
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              {form.values.photo ? (
                <img
                  src={form.values.photo}
                  alt="Student preview"
                  className="h-28 w-28 rounded-2xl border border-slate-200 object-cover"
                />
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 text-center text-xs text-slate-500">
                  No picture
                </div>
              )}

              <div>
                <label
                  htmlFor="studentPhoto"
                  className="inline-flex cursor-pointer rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-[#C2570C] hover:text-[#C2570C]"
                >
                  {form.values.photo ? "Replace Picture" : "Upload Picture"}
                </label>
                <input
                  id="studentPhoto"
                  name="photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="sr-only"
                />
                <p className="mt-2 text-xs text-slate-500">JPG, PNG, or WEBP up to 5 MB.</p>
                {photoError ? <p role="alert" className="mt-1 text-xs text-red-600">{photoError}</p> : null}
              </div>
            </div>
          </FormSection>

          <FormSection
            number="06"
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
              {isEditing && (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={form.isSubmitting || deleting}
                  className="cursor-pointer rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100 sm:mr-auto"
                >
                  Remove Student
                </button>
              )}

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

      {showDeleteConfirm && (
        <Modal onClose={() => setShowDeleteConfirm(false)} labelledBy="remove-student-title">
          <div className="p-6">
            <h2 id="remove-student-title" className="text-lg font-bold text-slate-900">Remove Student?</h2>
            <p className="mt-2 text-sm text-slate-600">This permanently removes the student record and related records.</p>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setShowDeleteConfirm(false)} disabled={deleting} className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold">Cancel</button>
              <button type="button" onClick={handleDeleteStudent} disabled={deleting} className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{deleting ? "Removing..." : "Remove Student"}</button>
            </div>
          </div>
        </Modal>
      )}
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
