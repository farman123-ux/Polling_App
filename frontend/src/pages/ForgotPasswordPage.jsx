import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "../Context/AuthContext";
import { useToast } from "../Context/ToastContext";
import {
  forgotPasswordStyles as s,
  otpStepStyles as otp,
  uiElementStyles as ui,
} from "../assets/dummyStyles";

export default function ForgotPasswordPage() {
  const { forgetPassword, verifyResetOtp, resetPassword } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      await forgetPassword(email);
      showToast("Reset OTP sent to your email!");
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify Reset OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      setError("Please enter the 6-digit OTP.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      await verifyResetOtp({ email, otp: otpCode });
      showToast("OTP verified. Set your new password.");
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired OTP.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword) {
      setError("Please enter a new password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      await resetPassword({ email, otp: otpCode, password: newPassword });
      showToast("Password reset successfully! Please log in.");
      navigate("/login", {
        state: { message: "Password reset successful. Please sign in." },
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Reset your password
        </h2>
        <p className="text-zinc-400 text-xs mt-1">
          {step === 1 && "Enter your email to receive a password reset OTP."}
          {step === 2 && "Enter the 6-digit code sent to your email."}
          {step === 3 && "Create a new strong password for your account."}
        </p>
      </div>

      {/* Step Indicator */}
      <div className={s.stepContainer}>
        <div className={s.stepItemWrapper}>
          <div
            className={`${s.stepCircleBase} ${
              step > 1 ? s.stepCircleDone : step === 1 ? s.stepCircleActive : s.stepCircleInactive
            }`}
          >
            {step > 1 ? <CheckCircle2 size={14} /> : "1"}
          </div>
          <span className="text-xs text-zinc-400">Email</span>
        </div>
        <div
          className={`${s.stepLineBase} ${
            step > 1 ? s.stepLineDone : s.stepLineInactive
          }`}
        />
        <div className={s.stepItemWrapper}>
          <div
            className={`${s.stepCircleBase} ${
              step > 2 ? s.stepCircleDone : step === 2 ? s.stepCircleActive : s.stepCircleInactive
            }`}
          >
            {step > 2 ? <CheckCircle2 size={14} /> : "2"}
          </div>
          <span className="text-xs text-zinc-400">OTP</span>
        </div>
        <div
          className={`${s.stepLineBase} ${
            step > 2 ? s.stepLineDone : s.stepLineInactive
          }`}
        />
        <div className={s.stepItemWrapper}>
          <div
            className={`${s.stepCircleBase} ${
              step === 3 ? s.stepCircleActive : s.stepCircleInactive
            }`}
          >
            3
          </div>
          <span className="text-xs text-zinc-400">Reset</span>
        </div>
      </div>

      {error && (
        <div className={s.errorBox}>
          <AlertCircle size={16} className={s.errorIcon} />
          <span className={s.errorText}>{error}</span>
        </div>
      )}

      {/* Step 1: Email Form */}
      {step === 1 && (
        <form onSubmit={handleSendOtp} className={s.emailForm}>
          <div className={s.emailInputWrapper}>
            <label className={s.label}>Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={ui.inputCls}
              required
            />
          </div>
          <button type="submit" disabled={loading} className={ui.authButton}>
            {loading ? "Sending..." : "Send Reset Code"}
          </button>
        </form>
      )}

      {/* Step 2: OTP Form */}
      {step === 2 && (
        <form onSubmit={handleVerifyOtp} className={otp.form}>
          <div>
            <label className={otp.otpLabel}>Enter 6-Digit OTP</label>
            <input
              type="text"
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
              placeholder="123456"
              className={otp.otpInput}
              autoFocus
            />
          </div>
          <button type="submit" disabled={loading} className={ui.authButton}>
            {loading ? "Verifying..." : "Verify Code"}
          </button>
        </form>
      )}

      {/* Step 3: New Password Form */}
      {step === 3 && (
        <form onSubmit={handleResetPassword} className={s.newPasswordForm}>
          <div className={s.passwordInputWrapper}>
            <label className={s.label}>New Password</label>
            <div className={s.passwordInputWithToggle}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={`${ui.inputCls} ${s.passwordInput}`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={s.toggleButton}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className={s.passwordInputWrapper}>
            <label className={s.label}>Confirm New Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={ui.inputCls}
              required
            />
          </div>

          <button type="submit" disabled={loading} className={ui.authButton}>
            {loading ? "Resetting Password..." : "Reset Password"}
          </button>
        </form>
      )}

      <p className={s.footerLink}>
        Remember your password?{" "}
        <Link to="/login" className={s.link}>
          Back to login
        </Link>
      </p>
    </div>
  );
}
