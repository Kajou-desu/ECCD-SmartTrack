import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@hooks/useAuth";
import { apiClient } from "@api/client.js";
import { LoginSchema, PasswordResetSchema } from "@validation/auth.js";
import logo from "@assets/ECCDST_Logo.png";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  // Page Settings ('login' | 'forgot' | 'reset')
  const [viewMode, setViewMode] = useState("login");

  // UI State Controllers
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");

  const devCredentials = {
    email: "teacher@eccd.com",
    password: "TeacherPass123",
    name: "Sample Teacher",
    role: "Teacher",
  };

  const sampleParentCredentials = {
    email: "parent@eccd.com",
    password: "ParentPass123",
    name: "Sample Parent",
    role: "Parent",
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(LoginSchema),
    mode: "onTouched",
  });

  const {
    register: resetRegister,
    handleSubmit: handleResetSubmit,
    formState: { errors: resetErrors },
    reset: resetResetForm,
  } = useForm({
    resolver: zodResolver(PasswordResetSchema),
    mode: "onTouched",
  });

  const onLoginSubmit = async (data) => {
    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const email = data.email.trim().toLowerCase();
      const password = data.password;

      if (
        email === sampleParentCredentials.email.toLowerCase() &&
        password === sampleParentCredentials.password
      ) {
        const loginData = {
          token: "parent-demo-token-",
          user: {
            name: sampleParentCredentials.name,
            email: sampleParentCredentials.email,
            role: sampleParentCredentials.role,
          },
        };

        login(loginData.token, loginData.user);
        setSuccessMessage("✓ Parent portal access granted!");

        // Navigate to parent dashboard after brief delay
        setTimeout(() => {
          navigate("/parent/dashboard", { replace: true });
        }, 500);
        return;
      }

      if (
        email === devCredentials.email.toLowerCase() &&
        password === devCredentials.password
      ) {
        const loginData = {
          token: "dev-token-",
          user: {
            name: devCredentials.name,
            email: devCredentials.email,
            role: devCredentials.role,
          },
        };

        login(loginData.token, loginData.user);
        setSuccessMessage("✓ Educator portal access granted!");

        // Navigate to educator dashboard after brief delay
        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 500);
        return;
      }

      const result = await apiClient.login(email, data.password);
      login(result.token, result.user);
      navigate(from, { replace: true });
    } catch (err) {
      const message = err?.message || "Login failed";
      setError(err?.status === 401 ? "Invalid email or password" : message);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      if (!forgotEmail.trim()) {
        throw new Error("Please enter your email address.");
      }

      const result = await apiClient.requestPasswordReset(forgotEmail);
      setSuccessMessage(result.message || "Verification code sent.");
      setViewMode("reset");
    } catch (err) {
      setError(err?.message || "Failed to dispatch code.");
    } finally {
      setLoading(false);
    }
  };

  const onResetPassword = async (data) => {
    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const result = await apiClient.resetPassword(
        data.email,
        data.otpCode,
        data.newPassword,
      );
      setSuccessMessage(result.message || "Password reset was successful.");
      setViewMode("login");
      resetResetForm();
    } catch (err) {
      setError(err?.message || "Reset rejected.");
    } finally {
      setLoading(false);
    }
  };

  const changeView = (mode) => {
    setError("");
    setSuccessMessage("");
    setViewMode(mode);

    // Clear forgot email when leaving forgot/reset flows
    if (mode === "login") {
      setForgotEmail("");
      resetResetForm();
    }
  };

  // UI Rendering
  return (
    <div className="min-h-screen w-full flex bg-[#f8f9ff] text-slate-800">
      {/* Left panel animation and branding */}
      <style>{`
        @keyframes drift1 { 0%,100% { transform: translate(0,0) rotate(0deg); } 50% { transform: translate(6px,-14px) rotate(6deg); } }
        @keyframes drift2 { 0%,100% { transform: translate(0,0) rotate(0deg); } 50% { transform: translate(-8px,-10px) rotate(-8deg); } }
        @keyframes drift3 { 0%,100% { transform: translate(0,0) rotate(0deg); } 50% { transform: translate(5px,12px) rotate(5deg); } }
        .shape-drift-1 { animation: drift1 6s ease-in-out infinite; }
        .shape-drift-2 { animation: drift2 7.5s ease-in-out infinite; }
        .shape-drift-3 { animation: drift3 5.5s ease-in-out infinite; }
      `}</style>

      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12"
        style={{
          background:
            "linear-gradient(135deg, #F0873D 0%, #C2570C 45%, #8B4A8C 100%)",
        }}
      >
        {/* soft glow accents */}
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-black/10 blur-3xl" />

        {/* floating shape motifs, echoing the Shape Sorting Masterclass card */}
        <div className="absolute top-20 right-16 w-14 h-14 rounded-full bg-emerald-400/90 shadow-lg shape-drift-1" />
        <div className="absolute top-1/2 right-28 w-12 h-12 bg-yellow-300/90 rounded-lg rotate-12 shadow-lg shape-drift-2" />
        <div
          className="absolute bottom-32 right-10 w-0 h-0 shape-drift-3"
          style={{
            borderLeft: "26px solid transparent",
            borderRight: "26px solid transparent",
            borderBottom: "44px solid rgba(248,113,113,0.9)",
            filter: "drop-shadow(0 8px 10px rgba(0,0,0,0.15))",
          }}
        />
        <div className="absolute bottom-16 left-16 w-9 h-9 rounded-full bg-white/20 shape-drift-2" />
        <div className="absolute top-40 left-24 w-6 h-6 rounded-md bg-white/20 rotate-45 shape-drift-1" />

        {/* wordmark */}
        <div className="relative flex items-center">
          <div className="w-20 h-20 rounded-full drop-shadow-lg flex items-center justify-center">
            <img
              src={logo}
              alt="ECCD SmartTrack Logo"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <span className="text-xl font-black tracking-tight text-white">
            ECCD SmartTrack
          </span>
        </div>

        {/* headline copy */}
        <div className="relative max-w-sm">
          <h2 className="text-3xl font-black text-white leading-tight mb-3">
            Every child's day,
            <br />
            organized with care.
          </h2>
          <p className="text-sm text-white/80 leading-relaxed">
            Attendance, milestones, and learning materials — all in one place
            for teachers and parents.
          </p>
        </div>

        <p className="relative text-xs text-white/60">
          ECCD SmartTrack · Early Childhood Care and Development Center
          Management Portal
        </p>
      </div>

      {/* Right panel functional form */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* Wordmark in mobile view */}
        <div className="flex lg:hidden items-center gap-3 mb-8">
          <div className="w-16 h-16 rounded-full drop-shadow-lg flex items-center justify-center">
            <img
              src={logo}
              alt="ECCD SmartTrack Logo"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-900">
            ECCD SmartTrack
          </span>
        </div>

        <div className="p-8 bg-white rounded-2xl shadow-sm w-full max-w-md border border-slate-200">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {viewMode === "login" && "Portal Access"}
              {viewMode === "forgot" && "Account Recovery"}
              {viewMode === "reset" && "Secure Verification"}
            </p>
            <h1 className="text-2xl font-black text-slate-900 mt-0.5">
              {viewMode === "login" && "Sign In"}
              {viewMode === "forgot" && "Reset Your Password"}
              {viewMode === "reset" && "Enter Verification Code"}
            </h1>
          </div>

          {/* Global Feedback Containers */}
          {error && (
            <div className="p-3 mb-5 text-sm text-red-700 bg-red-50 rounded-xl border border-red-200">
              ⚠️ {error}
            </div>
          )}
          {successMessage && (
            <div className="p-3 mb-5 text-sm text-emerald-700 bg-emerald-50 rounded-xl border border-emerald-200">
              ✓ {successMessage}
            </div>
          )}

          {/* Login Form */}
          {viewMode === "login" && (
            <form onSubmit={handleSubmit(onLoginSubmit)}>
              <div className="mb-4">
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="Email Address"
                  {...register("email")}
                  className={`w-full p-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 transition ${
                    errors.email
                      ? "border-red-500 focus:ring-red-500/40 focus:border-red-500"
                      : "border-slate-300 focus:ring-[#C2570C]/40 focus:border-[#C2570C]"
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="mb-2">
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Password"
                  {...register("password")}
                  className={`w-full p-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 transition ${
                    errors.password
                      ? "border-red-500 focus:ring-red-500/40 focus:border-red-500"
                      : "border-slate-300 focus:ring-[#C2570C]/40 focus:border-[#C2570C]"
                  }`}
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="text-right mb-5">
                <button
                  type="button"
                  onClick={() => changeView("forgot")}
                  className="text-xs font-bold text-[#C2570C] hover:text-[#a3480a] transition"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#C2570C] text-white font-semibold p-3 rounded-xl hover:bg-[#a3480a] disabled:bg-slate-300 transition-all shadow-sm"
              >
                {loading ? "Authenticating..." : "Sign In"}
              </button>
            </form>
          )}

          {/* Forgot Password Form */}
          {viewMode === "forgot" && (
            <form onSubmit={handleRequestOtp}>
              <p className="text-sm text-slate-500 mb-5 leading-relaxed">
                Enter your account email address and we'll send a 6-digit
                verification code.
              </p>
              <div className="mb-5">
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1.5">
                  Account Email Address
                </label>
                <input
                  type="email"
                  placeholder="Email Address"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C2570C]/40 focus:border-[#C2570C] transition"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => changeView("login")}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-bold p-3 rounded-xl transition"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-[#C2570C] text-white text-sm font-bold p-3 rounded-xl hover:bg-[#a3480a] disabled:bg-slate-300 transition shadow-sm"
                >
                  {loading ? "Sending Code..." : "Get OTP Code"}
                </button>
              </div>
            </form>
          )}

          {/* Password Reset Form */}
          {viewMode === "reset" && (
            <form
              onSubmit={handleResetSubmit(onResetPassword)}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1.5 text-center">
                  6-Digit Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  {...resetRegister("otpCode")}
                  placeholder="Enter OTP Code"
                  className={`w-full p-3 bg-slate-50 border rounded-xl text-center tracking-[10px] text-xl font-black text-slate-800 focus:outline-none focus:ring-2 transition ${
                    resetErrors.otpCode
                      ? "border-red-500 focus:ring-red-500/40 focus:border-red-500"
                      : "border-slate-300 focus:ring-[#C2570C]/40 focus:border-[#C2570C]"
                  }`}
                />
                {resetErrors.otpCode && (
                  <p className="mt-1 text-xs text-red-600">
                    {resetErrors.otpCode.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="Email Address"
                  {...resetRegister("email")}
                  className={`w-full p-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 transition ${
                    resetErrors.email
                      ? "border-red-500 focus:ring-red-500/40 focus:border-red-500"
                      : "border-slate-300 focus:ring-[#C2570C]/40 focus:border-[#C2570C]"
                  }`}
                />
                {resetErrors.email && (
                  <p className="mt-1 text-xs text-red-600">
                    {resetErrors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  {...resetRegister("newPassword")}
                  className={`w-full p-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 transition ${
                    resetErrors.newPassword
                      ? "border-red-500 focus:ring-red-500/40 focus:border-red-500"
                      : "border-slate-300 focus:ring-[#C2570C]/40 focus:border-[#C2570C]"
                  }`}
                />
                {resetErrors.newPassword && (
                  <p className="mt-1 text-xs text-red-600">
                    {resetErrors.newPassword.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  placeholder="Re-enter new password"
                  {...resetRegister("confirmPassword")}
                  className={`w-full p-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 transition ${
                    resetErrors.confirmPassword
                      ? "border-red-500 focus:ring-red-500/40 focus:border-red-500"
                      : "border-slate-300 focus:ring-[#C2570C]/40 focus:border-[#C2570C]"
                  }`}
                />
                {resetErrors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-600">
                    {resetErrors.confirmPassword.message}
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => changeView("forgot")}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-bold p-3 rounded-xl transition"
                >
                  Change Email
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-[#C2570C] text-white text-sm font-bold p-3 rounded-xl hover:bg-[#a3480a] disabled:bg-slate-300 transition shadow-sm"
                >
                  {loading ? "Saving..." : "Reset Password"}
                </button>
              </div>
            </form>
          )}
        </div>
        {/* Footer */}
        <p className="lg:hidden text-xs text-slate-400 mt-6">
          Early Childhood Care and Development Center Management Portal
        </p>
      </div>
    </div>
  );
}
