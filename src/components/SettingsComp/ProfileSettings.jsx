import { useState, useRef } from "react";
import { useAuth } from "../../hooks/useAuth.js";
import { UserRound, Camera, Mail, Phone } from "lucide-react";

export default function ProfileSettings() {
  const fileInputRef = useRef(null);
  const { user } = useAuth();

  const [profile, setProfile] = useState({
    fullName: user.name,
    email: user.email,
    phone: "+63 9123456789",
    profilePicture: null,
  });

  const [profileEditMode, setProfileEditMode] = useState(false);
  const handleProfilePictureChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfile((prev) => ({
          ...prev,
          profilePicture: event.target?.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileChange = (field, value) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleProfileSave = () => {
    setProfileEditMode(false);
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm space-y-8">
      <div className="flex items-center gap-3 mb-6">
        <UserRound className="h-6 w-6 text-[#C2570C]" />
        <h2 className="text-2xl font-bold text-gray-800">Profile Settings</h2>
      </div>
      <div className="flex flex-col items-center text-center">
        {/* Profile Picture Section */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative group">
            <div className="h-32 w-32 rounded-full bg-linear-to-br from-[#C2570C] to-orange-600 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
              {profile.profilePicture ? (
                <img
                  src={profile.profilePicture}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <UserRound className="h-16 w-16 text-white" />
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-[#C2570C] hover:bg-orange-800 text-white p-3 rounded-full shadow-lg transition-colors"
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
            <h3 className="text-2xl font-bold text-gray-900">
              {profile.fullName}
            </h3>

            <p className="text-sm text-gray-500">{user.role}</p>

            <p className="text-sm text-gray-500">{profile.email}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
            >
              Change Photo
            </button>

            <button
              onClick={() => setProfileEditMode(true)}
              className="px-5 py-2.5 rounded-xl bg-[#C2570C] text-white font-medium hover:bg-orange-800 transition"
            >
              Edit Profile
            </button>
          </div>
        </div>

        <hr className="w-full my-8 border-gray-200" />

        {/* Personal Information */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
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

                <p className="mt-4 text-lg font-semibold text-gray-900">
                  {profile.fullName}
                </p>
              </div>
              <div className="rounded-2xl border border-gray-200 p-5 hover:border-[#C2570C] hover:shadow-md transition-all duration-200">
                <div className="flex items-center gap-2 text-gray-500">
                  <Mail className="h-4 w-4" />
                  <p className="text-xs font-semibold uppercase tracking-wide">
                    Email
                  </p>
                </div>

                <p className="mt-4 text-lg font-semibold text-gray-900 break-all">
                  {profile.email}
                </p>
              </div>
              <div className="rounded-2xl border border-gray-200 p-5 hover:border-[#C2570C] hover:shadow-md transition-all duration-200">
                <div className="flex items-center gap-2 text-gray-500">
                  <Phone className="h-4 w-4" />
                  <p className="text-xs font-semibold uppercase tracking-wide">
                    Phone
                  </p>
                </div>

                <p className="mt-4 text-lg font-semibold text-gray-900">
                  {profile.phone}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-gray-800">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profile.fullName}
                  onChange={(e) =>
                    handleProfileChange("fullName", e.target.value)
                  }
                  className="border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-[#C2570C] focus:ring-1 focus:ring-[#C2570C] transition"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-gray-800">Email</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => handleProfileChange("email", e.target.value)}
                  className="border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-[#C2570C] focus:ring-1 focus:ring-[#C2570C] transition"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-gray-800">Phone</label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => handleProfileChange("phone", e.target.value)}
                  className="border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-[#C2570C] focus:ring-1 focus:ring-[#C2570C] transition"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleProfileSave}
                  className="bg-[#C2570C] hover:bg-orange-800 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors flex-1"
                >
                  Save Profile
                </button>
                <button
                  onClick={() => setProfileEditMode(false)}
                  className="border border-gray-200 text-gray-700 font-semibold py-2.5 px-6 rounded-lg hover:bg-gray-50 transition-colors flex-1"
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
