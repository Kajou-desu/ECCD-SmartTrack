import { useState } from "react";
import ProfileSettings from "../../components/settings/ProfileSettings.jsx";
import SecuritySettings from "../../components/settings/SecuritySettings.jsx";
import NotificationSettings from "../../components/settings/NotificationSettings.jsx";
import AccountSettings from "../../components/settings/AccountSettings.jsx";
import ChildrenSection from "../../components/settings/ChildrenSection.jsx";
import EmergencyContacts from "../../components/settings/EmergencyContacts.jsx";
import {
  UserRound,
  Bell,
  Lock,
  CheckCircle,
  AlertCircle,
  Heart,
  Phone,
} from "lucide-react";

export default function ParentSettings() {
  const [message] = useState({ type: "", text: "" });
  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    {
      id: "profile",
      label: "Profile",
      icon: UserRound,
    },
    {
      id: "security",
      label: "Security",
      icon: Lock,
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
    },
    {
      id: "children",
      label: "Children",
      icon: Heart,
    },
    {
      id: "emergency",
      label: "Emergency Contacts",
      icon: Phone,
    },
    {
      id: "account",
      label: "Account",
      icon: UserRound,
    },
  ];

  return (
    <div className="min-h-[calc(100vh-70px)] flex flex-col gap-6 bg-[#f8f9ff] p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage your profile, children, emergency contacts and security
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-2 shadow-sm">
        <div className="flex flex-wrap justify-center items-center gap-2">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200
          ${
            activeTab === id
              ? "bg-[#C2570C] text-white shadow-sm"
              : "text-gray-600 hover:bg-orange-50 hover:text-[#C2570C]"
          }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Message Toast */}
      {message.text && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm flex items-center gap-2 ${
            message.type === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          {message.text}
        </div>
      )}

      {activeTab === "profile" && (
        <div className="w-full">
          {/* Profile Card */}
          <ProfileSettings />
        </div>
      )}

      {activeTab === "security" && (
        <div className="w-full sm:max-w-3xl sm:mx-auto">
          {/* Change Password */}
          <SecuritySettings />
        </div>
      )}

      {activeTab === "notifications" && (
        <div className="w-full sm:mx-auto">
          {/* Notification Settings */}
          <NotificationSettings />
        </div>
      )}

      {activeTab === "children" && (
        <div className="w-full sm:max-w-3xl sm:mx-auto">
          {/* Children Management */}
          <ChildrenSection />
        </div>
      )}

      {activeTab === "emergency" && (
        <div className="w-full sm:max-w-3xl sm:mx-auto">
          {/* Emergency Contacts */}
          <EmergencyContacts />
        </div>
      )}

      {activeTab === "account" && (
        <div className="w-full sm:max-w-3xl sm:mx-auto">
          {/* Account Information */}
          <AccountSettings />
        </div>
      )}
    </div>
  );
}
