import { useState } from "react";
import { useAuth } from "@hooks/useAuth";
import { apiClient } from "@api/client.js";
import { Lock, ShieldQuestionMark, EyeOff, Eye, Save, Loader2 } from "lucide-react";

export default function SecuritySettings({ onNotify }) {
  const { updateToken } = useAuth();
  const [saving, setSaving] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [password, setPassword] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { level: 0, label: "", color: "" };
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[!@#$%^&*]/.test(pwd)) strength++;

    const levels = [
      { level: 0, label: "", color: "" },
      { level: 1, label: "Weak", color: "text-red-600 bg-red-50" },
      { level: 2, label: "Fair", color: "text-yellow-600 bg-yellow-50" },
      { level: 3, label: "Good", color: "text-blue-600 bg-blue-50" },
      { level: 4, label: "Strong", color: "text-green-600 bg-green-50" },
      { level: 5, label: "Very Strong", color: "text-green-700 bg-green-50" },
    ];
    return levels[strength];
  };
  const passwordStrength = getPasswordStrength(password.new);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPassword((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    if (password.new !== password.confirm) {
      onNotify?.("error", "Passwords do not match.");
      return;
    }
    if (password.new.length < 10) {
      onNotify?.("error", "Password must be at least 10 characters.");
      return;
    }

    setSaving(true);
    try {
      if (!otpSent) {
        await apiClient.requestPasswordChangeOtp();
        setOtpSent(true);
        onNotify?.("success", "Verification code sent to your email.");
        return;
      }
      if (!/^\d{6}$/.test(otpCode)) {
        onNotify?.("error", "Enter the 6-digit verification code.");
        return;
      }
      const result = await apiClient.changeMyPassword(
        password.current,
        password.new,
        otpCode,
      );
      updateToken(result.token);
      setPassword({ current: "", new: "", confirm: "" });
      setOtpCode("");
      setOtpSent(false);
      onNotify?.("success", "Password updated successfully.");
    } catch (err) {
      onNotify?.(
        "error",
        err?.details?.message || "Failed to update password. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const passwordChecks = {
    length: password.new.length >= 10,
    uppercase: /[A-Z]/.test(password.new),
    number: /\d/.test(password.new),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password.new),
  };

  const strengthBarColor = [
    "bg-gray-300",
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-lime-500",
    "bg-green-600",
  ][passwordStrength.level];

  const passwordsMatch =
    password.confirm.length > 0 && password.new === password.confirm;

  const canSubmit =
    password.current &&
    password.new &&
    password.confirm &&
    passwordsMatch &&
    Object.values(passwordChecks).every(Boolean);

  return (
    <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <Lock className="h-6 w-6 text-[#C2570C]" />
        <h2 className="text-2xl font-bold text-gray-800">Change Password</h2>
      </div>

      <div className="mb-8 rounded-2xl border border-orange-100 bg-orange-50 p-5">
        <div className="flex items-start gap-3">
          <ShieldQuestionMark className="mt-0.5 h-5 w-5 text-[#C2570C]" />

          <div>
            <h3 className="font-semibold text-gray-900">
              Keep your account secure
            </h3>

            <p className="mt-1 text-sm text-gray-600">
              Choose a strong password that you don't use on other websites.
              Updating it regularly helps keep your account secure.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handlePasswordSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="current-password"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            Current Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="current-password"
              type={showPasswords.current ? "text" : "password"}
              name="current"
              value={password.current}
              onChange={handlePasswordChange}
              required
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pr-12 text-sm transition focus:border-[#C2570C] focus:outline-none focus:ring-4 focus:ring-[#C2570C]/10"
              placeholder="Enter current password"
            />
            <button
              type="button"
              aria-label={showPasswords.current ? "Hide password" : "Show password"}
              onClick={() =>
                setShowPasswords((prev) => ({
                  ...prev,
                  current: !prev.current,
                }))
              }
              className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-500 transition hover:bg-gray-100 hover:text-[#C2570C]"
            >
              {showPasswords.current ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div>
          <label
            htmlFor="new-password"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            New Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="new-password"
              type={showPasswords.new ? "text" : "password"}
              name="new"
              value={password.new}
              onChange={handlePasswordChange}
              required
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pr-12 text-sm transition focus:border-[#C2570C] focus:outline-none focus:ring-4 focus:ring-[#C2570C]/10"
              placeholder="Enter new password (min 10 characters)"
            />
            <button
              type="button"
              aria-label={showPasswords.new ? "Hide password" : "Show password"}
              onClick={() =>
                setShowPasswords((prev) => ({
                  ...prev,
                  new: !prev.new,
                }))
              }
              className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-500 transition hover:bg-gray-100 hover:text-[#C2570C]"
            >
              {showPasswords.new ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {password.new && (
            <div className="mt-3">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-gray-600">Password Strength</span>

                <span
                  className={`font-semibold ${
                    passwordStrength.level <= 1
                      ? "text-red-500"
                      : passwordStrength.level <= 3
                        ? "text-orange-500"
                        : "text-green-600"
                  }`}
                >
                  {passwordStrength.label}
                </span>
              </div>

              <div className="h-2 w-full rounded-full bg-gray-200">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${strengthBarColor}`}
                  style={{
                    width: `${(passwordStrength.level / 5) * 100}%`,
                  }}
                />
              </div>
              <div className="mt-4 rounded-xl bg-gray-50 p-4">
                <p className="mb-3 text-sm font-semibold text-gray-800">
                  Password Requirements
                </p>

                <ul className="grid gap-2 text-sm">
                  <li
                    className={
                      passwordChecks.length ? "text-green-600" : "text-gray-500"
                    }
                  >
                    {passwordChecks.length ? "✓" : "•"} At least 10 characters
                  </li>

                  <li
                    className={
                      passwordChecks.uppercase
                        ? "text-green-600"
                        : "text-gray-500"
                    }
                  >
                    {passwordChecks.uppercase ? "✓" : "•"} One uppercase letter
                  </li>

                  <li
                    className={
                      passwordChecks.number ? "text-green-600" : "text-gray-500"
                    }
                  >
                    {passwordChecks.number ? "✓" : "•"} One number
                  </li>

                  <li
                    className={
                      passwordChecks.special
                        ? "text-green-600"
                        : "text-gray-500"
                    }
                  >
                    {passwordChecks.special ? "✓" : "•"} One special character
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <div>
          <label
            htmlFor="confirm-password"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            Confirm Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="confirm-password"
              type={showPasswords.confirm ? "text" : "password"}
              name="confirm"
              value={password.confirm}
              onChange={handlePasswordChange}
              required
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pr-12 text-sm transition focus:border-[#C2570C] focus:outline-none focus:ring-4 focus:ring-[#C2570C]/10"
              placeholder="Confirm new password"
            />
            <button
              type="button"
              aria-label={showPasswords.confirm ? "Hide password" : "Show password"}
              onClick={() =>
                setShowPasswords((prev) => ({
                  ...prev,
                  confirm: !prev.confirm,
                }))
              }
              className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-500 transition hover:bg-gray-100 hover:text-[#C2570C]"
            >
              {showPasswords.confirm ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {password.confirm && (
            <p
              className={`mt-2 text-sm font-medium ${
                passwordsMatch ? "text-green-600" : "text-red-500"
              }`}
            >
              {passwordsMatch
                ? "✓ Passwords match"
                : "✕ Passwords do not match"}
            </p>
          )}
        </div>

        {otpSent && (
          <div>
            <label htmlFor="password-change-otp" className="block text-sm font-medium text-gray-700 mb-1.5">
              Email Verification Code
            </label>
            <input
              id="password-change-otp"
              inputMode="numeric"
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-center text-lg tracking-[0.4em]"
              placeholder="000000"
            />
          </div>
        )}

        <div className="pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={!canSubmit || saving}
            className="cursor-pointer flex w-full items-center justify-center gap-2 rounded-xl bg-[#C2570C] py-3 font-semibold text-white transition hover:bg-orange-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {otpSent ? "Verify & Save Password" : "Send Email OTP"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
