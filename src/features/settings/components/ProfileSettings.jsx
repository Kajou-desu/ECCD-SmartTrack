import { useState, useRef } from "react";
import { useAuth } from "../../../hooks/useAuth.js";
import { apiClient } from "@api/client.js";
import Avatar from "@components/shared/Avatar.jsx";
import {
  isImageFile,
  isFileSizeValid,
  MAX_PHOTO_FILE_SIZE_BYTES,
  formatFileSize,
} from "@features/eventPhotos/utils/photoValidation";
import { SMS_ROLES, PH_MOBILE_HINT, toTenDigitPhone } from "@features/accounts/utils/accountUtils.js";
import { UserRound, Camera, Mail, Phone, Loader2 } from "lucide-react";
import { getErrorMessage } from "@api/errorMessage.js";

const toForm = (user) => ({
  firstName: user.firstName ?? "",
  middleName: user.middleName ?? "",
  lastName: user.lastName ?? "",
  email: user.email,
  phone: user.phone ?? "",
});

export default function ProfileSettings({ onNotify }) {
  const fileInputRef = useRef(null);
  const { user, updateUser } = useAuth();

  // Form state is only a draft: it is seeded from `user` when editing starts,
  // and the read-only view always shows the current `user`.
  const [profile, setProfile] = useState(() => toForm(user));
  const [phoneError, setPhoneError] = useState("");

  const [profileEditMode, setProfileEditMode] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || uploadingPhoto) return;

    if (!isImageFile(file)) {
      onNotify?.("error", "Please choose an image file.");
      return;
    }

    if (!isFileSizeValid(file, MAX_PHOTO_FILE_SIZE_BYTES)) {
      onNotify?.(
        "error",
        `Image is too large. Maximum size is ${formatFileSize(MAX_PHOTO_FILE_SIZE_BYTES)}.`,
      );
      return;
    }

    setUploadingPhoto(true);
    try {
      const updated = await apiClient.uploadMyProfilePhoto(file);
      updateUser({ profilePicture: updated.profilePicture });
      onNotify?.("success", "Profile photo updated.");
    } catch (err) {
      onNotify?.("error", getErrorMessage(err, "Failed to upload photo. Please try again."));
    } finally {
      setUploadingPhoto(false);
    }
  };

  const startEditing = () => {
    setProfile(toForm(user));
    setPhoneError("");
    setProfileEditMode(true);
  };

  const handleProfileChange = (field, value) => {
    if (field === "phone") setPhoneError("");
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // The email is where password-reset codes are sent, so the server asks for
  // the current password before changing it.
  const emailChanged =
    profile.email.trim().toLowerCase() !== (user.email ?? "").trim().toLowerCase();

  const handleProfileSave = async () => {
    if (saving) return;
    if (emailChanged && !currentPassword) {
      onNotify?.("error", "Enter your current password to change your email.");
      return;
    }
    const phone = profile.phone.trim();
    if (
      phone &&
      SMS_ROLES.includes(user.role) &&
      !/^9\d{9}$/.test(toTenDigitPhone(phone))
    ) {
      setPhoneError("Enter a valid Philippine mobile number, e.g. 0917 123 4567.");
      return;
    }
    setSaving(true);

    try {
      const updated = await apiClient.updateMyProfile({
        firstName: profile.firstName.trim(),
        middleName: profile.middleName.trim(),
        lastName: profile.lastName.trim(),
        email: profile.email.trim(),
        // '' clears a saved phone; omit it when there was never one.
        phone: phone || (user.phone ? "" : undefined),
        ...(emailChanged && { currentPassword }),
      });
      setCurrentPassword("");
      updateUser({
        name: updated.name,
        firstName: updated.firstName,
        middleName: updated.middleName,
        lastName: updated.lastName,
        email: updated.email,
        phone: updated.phone,
      });
      setProfileEditMode(false);
      onNotify?.("success", "Profile updated successfully.");
    } catch (err) {
      onNotify?.(
        "error",
        getErrorMessage(err, "Failed to update profile. Please try again."),
      );
    } finally {
      setSaving(false);
    }
  };

  const fullName = [user.firstName, user.middleName, user.lastName]
    .filter(Boolean)
    .join(" ") || user.name;

  return (
    <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm space-y-8">
      <div className="flex items-center gap-3 mb-6">
        <UserRound className="h-6 w-6 text-[#C2570C]" />
        <h2 className="text-xl font-bold text-gray-800">Profile Settings</h2>
      </div>
      <div className="flex flex-col items-center text-center">
        {/* Profile Picture Section */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative group">
            <div className="h-32 w-32 rounded-full bg-linear-to-br from-[#C2570C] to-orange-600 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
              {uploadingPhoto ? (
                <Loader2 className="h-10 w-10 animate-spin text-white" />
              ) : (
                <Avatar
                  src={user.profilePicture}
                  name={fullName}
                  alt={`${fullName}'s profile`}
                  className="h-full w-full text-3xl"
                />
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Change profile photo"
              className="cursor-pointer absolute bottom-0 right-0 bg-[#C2570C] hover:bg-orange-800 text-white p-3 rounded-full shadow-lg transition-colors"
            >
              <Camera className="h-5 w-5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleProfilePictureChange}
              className="hidden"
            />
          </div>
          <div className="text-center space-y-1">
            <h3 className="text-xl font-bold text-gray-900">{fullName}</h3>

            <p className="text-sm text-gray-500">{user.role}</p>

            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
              className="cursor-pointer px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              {uploadingPhoto ? "Uploading..." : "Change Photo"}
            </button>

            <button
              type="button"
              onClick={startEditing}
              className="cursor-pointer px-5 py-2.5 rounded-xl bg-[#C2570C] text-white font-medium hover:bg-orange-800 transition"
            >
              Edit Profile
            </button>
          </div>
        </div>

        <hr className="w-full my-8 border-gray-200" />

        {/* Personal Information */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              Personal Information
            </h3>

            <p className="text-sm text-gray-500">
              View and manage your personal information.
            </p>
          </div>

          {!profileEditMode && (
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
              View Mode
            </span>
          )}

          {profileEditMode && (
            <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-[#C2570C]">
              Editing
            </span>
          )}
        </div>
        <div className="w-full">
          {!profileEditMode ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-gray-200 p-5 hover:border-[#C2570C] hover:shadow-md transition-all duration-200">
                <div className="flex items-center gap-2 text-gray-500">
                  <UserRound className="h-4 w-4" />
                  <p className="text-xs font-semibold uppercase tracking-wide">
                    Full Name
                  </p>
                </div>

                <p className="mt-4 text-base font-semibold text-gray-900">
                  {fullName}
                </p>
              </div>
              <div className="rounded-2xl border border-gray-200 p-5 hover:border-[#C2570C] hover:shadow-md transition-all duration-200">
                <div className="flex items-center gap-2 text-gray-500">
                  <Mail className="h-4 w-4" />
                  <p className="text-xs font-semibold uppercase tracking-wide">
                    Email
                  </p>
                </div>

                <p className="mt-4 text-base font-semibold text-gray-900 break-all">
                  {user.email}
                </p>
              </div>
              <div className="rounded-2xl border border-gray-200 p-5 hover:border-[#C2570C] hover:shadow-md transition-all duration-200">
                <div className="flex items-center gap-2 text-gray-500">
                  <Phone className="h-4 w-4" />
                  <p className="text-xs font-semibold uppercase tracking-wide">
                    Phone
                  </p>
                </div>

                <p className="mt-4 text-base font-semibold text-gray-900">
                  {user.phone || "—"}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="profile-firstname" className="text-sm font-bold text-gray-800">
                    First Name
                  </label>
                  <input
                    id="profile-firstname"
                    type="text"
                    value={profile.firstName}
                    onChange={(e) => handleProfileChange("firstName", e.target.value)}
                    className="border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-[#C2570C] focus:ring-1 focus:ring-[#C2570C] transition"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="profile-middlename" className="text-sm font-bold text-gray-800">
                    Middle Name
                  </label>
                  <input
                    id="profile-middlename"
                    type="text"
                    value={profile.middleName}
                    onChange={(e) => handleProfileChange("middleName", e.target.value)}
                    className="border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-[#C2570C] focus:ring-1 focus:ring-[#C2570C] transition"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="profile-lastname" className="text-sm font-bold text-gray-800">
                    Last Name
                  </label>
                  <input
                    id="profile-lastname"
                    type="text"
                    value={profile.lastName}
                    onChange={(e) => handleProfileChange("lastName", e.target.value)}
                    className="border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-[#C2570C] focus:ring-1 focus:ring-[#C2570C] transition"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="profile-email" className="text-sm font-bold text-gray-800">
                  Email
                </label>
                <input
                  id="profile-email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => handleProfileChange("email", e.target.value)}
                  className="border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-[#C2570C] focus:ring-1 focus:ring-[#C2570C] transition"
                />
              </div>

              {emailChanged && (
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="profile-current-password" className="text-sm font-bold text-gray-800">
                    Current password
                  </label>
                  <input
                    id="profile-current-password"
                    type="password"
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Required to change your email"
                    className="border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-[#C2570C] focus:ring-1 focus:ring-[#C2570C] transition"
                  />
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label htmlFor="profile-phone" className="text-sm font-bold text-gray-800">
                  Phone
                </label>
                <input
                  id="profile-phone"
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => handleProfileChange("phone", e.target.value)}
                  placeholder={SMS_ROLES.includes(user.role) ? "09XX-XXX-XXXX" : undefined}
                  aria-invalid={phoneError ? true : undefined}
                  aria-describedby={
                    [SMS_ROLES.includes(user.role) && "profile-phone-hint", phoneError && "profile-phone-error"]
                      .filter(Boolean)
                      .join(" ") || undefined
                  }
                  className="border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-[#C2570C] focus:ring-1 focus:ring-[#C2570C] transition"
                />
                {SMS_ROLES.includes(user.role) && (
                  <p id="profile-phone-hint" className="text-xs text-gray-500">
                    {PH_MOBILE_HINT}
                  </p>
                )}
                {phoneError && (
                  <p id="profile-phone-error" role="alert" className="text-xs text-red-600">
                    {phoneError}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleProfileSave}
                  disabled={saving || !profile.firstName.trim() || !profile.lastName.trim()}
                  className="cursor-pointer bg-[#C2570C] hover:bg-orange-800 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors flex-1 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <Loader2 size={14} className="animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    "Save Profile"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setProfileEditMode(false);
                    setCurrentPassword("");
                  }}
                  disabled={saving}
                  className="cursor-pointer border border-gray-200 text-gray-700 font-semibold py-2.5 px-6 rounded-lg hover:bg-gray-50 transition-colors flex-1 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
