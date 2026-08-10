import calculateAge from "../../utils/calculateAge";
import formatDate from "../../utils/formatDate";
import { getStudentData } from "../../data/mockData";
import {
  AlertCircle,
  FileText,
  CheckCircle2,
  Pencil,
  Upload,
  Phone,
  Mail,
  MapPin,
  User,
  Accessibility,
  Utensils,
} from "lucide-react";

export default function StudentDetail() {
  // Get student data by ID from mockData
  const studentData = getStudentData("POB2-2026-001");

  // Handle case where student is not found
  if (!studentData) {
    return (
      <div className="min-h-[calc(100vh-70px)] bg-[#f8f9ff] p-4 sm:p-6 lg:p-8">
        <div className="bg-white rounded-3xl p-8 border border-gray-200 text-center">
          <p className="text-gray-600">Student not found</p>
        </div>
      </div>
    );
  }

  const { student, guardians, medical, documents } = studentData;

  return (
    <div className="min-h-[calc(100vh-70px)] bg-[#f8f9ff] p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          {student.name}'s Information
        </h1>
        <p className="mt-2 text-sm text-gray-600 max-w-2xl leading-relaxed">
          View your child's profile, guardian contacts, medical records, and
          uploaded documents. All information is kept secure and confidential.
        </p>
      </div>

      {/* Student Profile Card */}
      <StudentHeader student={student} />

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <GuardianContacts guardians={guardians} />
        <MedicalNotes medical={medical} />
      </div>

      {/* Documents Section */}
      <div className="mt-8">
        <RequiredDocuments documents={documents} />
      </div>
    </div>
  );
}

function StudentHeader({ student }) {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm">
      {/* Photo and Header */}
      <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-start">
        {/* Student Photo */}
        <div className="shrink-0">
          <img
            src={student.photo}
            alt={`${student.name}'s profile`}
            className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover border-2 border-gray-100 shadow-md"
          />
        </div>

        {/* Header Info */}
        <div className="flex-1 w-full min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 truncate">
                {student.name}
              </h2>
              <p className="text-gray-500 text-sm mt-1">{student.school}</p>
            </div>

            {/* Status Badge */}
            <span className="px-3 py-1.5 bg-teal-100 text-teal-700 rounded-full text-xs font-semibold whitespace-nowrap shadow-sm">
              {student.status}
            </span>
          </div>

          {/* Student Information Grid */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <InfoItem label="Student ID" value={student.id} />
            <InfoItem label="Session" value={student.session} />
            <InfoItem label="Teacher" value={student.teacher} />
            <InfoItem
              label="Age"
              value={`${calculateAge(student.birthday)} Years Old`}
            />
            <InfoItem label="Birthday" value={formatDate(student.birthday)} />
            <InfoItem label="Address" value={student.address} />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-widest font-semibold text-gray-500">
        {label}
      </p>
      <p
        className="mt-2 text-gray-800 font-medium truncate hover:text-clip"
        title={value}
      >
        {value}
      </p>
    </div>
  );
}

function GuardianContacts({ guardians }) {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold text-gray-800">Guardian Contacts</h2>
        <button
          type="button"
          className="flex items-center gap-2 cursor-pointer text-[#C2570C] hover:text-orange-700 font-semibold text-sm transition-colors px-3 py-2 rounded-lg hover:bg-orange-50"
          aria-label="Edit guardian details"
        >
          <Pencil size={18} />
          <span>Edit Details</span>
        </button>
      </div>

      {/* Guardian Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {guardians && guardians.length > 0 ? (
          guardians.map((guardian) => (
            <GuardianCard key={guardian.id} guardian={guardian} />
          ))
        ) : (
          <div className="col-span-full p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <User size={32} className="mx-auto text-gray-400 mb-2" />
            <p className="text-gray-500 text-sm">
              No guardian information available
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function GuardianCard({ guardian }) {
  return (
    <div className="rounded-2xl border border-orange-100 bg-linear-to-br from-orange-50 to-white p-5 hover:border-orange-300 hover:shadow-md transition-all duration-200">
      {/* Type Badge */}
      <span className="text-xs font-semibold uppercase tracking-wider text-orange-600 bg-orange-100 px-2 py-1 rounded">
        {guardian.type}
      </span>

      {/* Guardian Name */}
      <div className="flex items-start gap-2 mt-3">
        <User size={18} className="text-orange-600 shrink-0 mt-0.5" />
        <h3 className="font-semibold text-gray-800 text-base line-clamp-2">
          {guardian.name}
        </h3>
      </div>

      {/* Contact Details */}
      <div className="space-y-3 mt-4 text-sm text-gray-600">
        <a
          href={`tel:${guardian.phone}`}
          className="flex gap-3 items-center hover:text-[#C2570C] transition-colors group"
          aria-label={`Call ${guardian.name}`}
        >
          <Phone
            size={16}
            className="text-orange-600 shrink-0 group-hover:scale-110 transition-transform"
          />
          <span className="truncate">{guardian.phone}</span>
        </a>

        <a
          href={`mailto:${guardian.email}`}
          className="flex gap-3 items-center hover:text-[#C2570C] transition-colors group"
          aria-label={`Email ${guardian.name}`}
        >
          <Mail
            size={16}
            className="text-orange-600 shrink-0 group-hover:scale-110 transition-transform"
          />
          <span className="truncate">{guardian.email}</span>
        </a>

        <div className="flex gap-3 items-start">
          <MapPin size={16} className="text-orange-600 shrink-0 mt-0.5" />
          <span className="line-clamp-2">{guardian.address}</span>
        </div>
      </div>
    </div>
  );
}

function MedicalNotes({ medical }) {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          Medical & Special Notes
        </h2>
        <button
          type="button"
          className="flex items-center gap-2 cursor-pointer text-[#C2570C] hover:text-orange-700 font-semibold text-sm transition-colors px-3 py-2 rounded-lg hover:bg-orange-50"
          aria-label="Edit Medical Notes"
        >
          <Pencil size={18} />
          <span>Edit Details</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <MedicalCard
          icon={<AlertCircle size={20} className="text-red-600" />}
          colorClass="border-red-200 bg-red-50"
          title="Allergies"
          subtitle={medical.allergies}
          description={medical.allergiesDetail}
        />

        <MedicalCard
          icon={<Utensils size={20} className="text-blue-600" />}
          colorClass="border-blue-200 bg-blue-50"
          title="Dietary Notes"
          subtitle={medical.dietary}
          description={medical.dietaryDetail}
        />

        <div className="lg:col-span-2">
          <MedicalCard
            icon={<Accessibility size={20} className="text-purple-600" />}
            colorClass="border-purple-200 bg-purple-50"
            title="Learning Accommodations"
            subtitle={medical.accommodations}
            description={medical.accommodationsDetail}
          />
        </div>
      </div>
    </div>
  );
}

function MedicalCard({ icon, colorClass, title, subtitle, description }) {
  return (
    <div
      className={`rounded-2xl border p-5 sm:p-6 ${colorClass} transition-all hover:shadow-md`}
    >
      <div className="flex gap-3 items-start">
        {/* Icon */}
        <div className="shrink-0 mt-0.5">{icon}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="uppercase text-xs font-bold tracking-wider text-gray-600">
            {title}
          </p>
          <h3 className="font-semibold text-gray-800 mt-1 text-sm sm:text-base">
            {subtitle || "No information available"}
          </h3>
        </div>
      </div>

      <p className="mt-4 text-sm text-gray-700 leading-relaxed">
        {description || "No additional details provided"}
      </p>
    </div>
  );
}

function RequiredDocuments({ documents }) {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold text-gray-800">Required Documents</h2>
        <button
          type="button"
          className="flex items-center gap-2 cursor-pointer text-[#C2570C] hover:text-orange-700 font-semibold text-sm transition-colors px-3 py-2 rounded-lg hover:bg-orange-50"
          aria-label="Upload documents"
        >
          <Upload size={18} />
          <span>Upload Documents</span>
        </button>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {documents && documents.length > 0 ? (
          documents.map((doc) => <DocumentCard key={doc.id} document={doc} />)
        ) : (
          <div className="col-span-full p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <FileText size={32} className="mx-auto text-gray-400 mb-2" />
            <p className="text-gray-500 text-sm">No documents uploaded yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

function DocumentCard({ document }) {
  return (
    <button
      type="button"
      className="group rounded-xl bg-gray-50 border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all duration-200 p-4 flex items-center gap-3 cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
      aria-label={`Document: ${document.name}${document.verified ? " (verified)" : ""}`}
    >
      {/* Icon */}
      <div className="shrink-0">
        <FileText
          size={24}
          className="text-orange-600 group-hover:scale-110 transition-transform"
        />
      </div>

      {/* Name */}
      <div className="flex-1 min-w-0 text-left">
        <p className="truncate font-medium text-gray-800 text-sm group-hover:text-orange-700 transition-colors">
          {document.name}
        </p>
      </div>

      {/* Verified Badge */}
      {document.verified && (
        <div className="shrink-0">
          <CheckCircle2
            size={20}
            className="text-green-600"
            aria-label="Document verified"
          />
        </div>
      )}
    </button>
  );
}
