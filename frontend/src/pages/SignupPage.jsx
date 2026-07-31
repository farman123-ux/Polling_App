import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Camera, Eye, EyeOff, Mail, Lock, User, AtSign, AlertCircle, RefreshCw, CheckCircle2 } from "lucide-react";
import { useAuth } from "../Context/AuthContext";
import { useToast } from "../Context/ToastContext";
import {
  signupStyles as s,
  otpStepStyles as otp,
  verifyOtpStyles as v,
  uiElementStyles as ui,
} from "../assets/dummyStyles";

export default function SignupPage() {
  const { register, verifyOtp, resendOtp } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Multi-step state
  const [step, setStep] = useState(
    location.state?.needsVerification ? "otp" : "form"
  );

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState(location.state?.email || "");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // OTP State
  const [otpCode, setOtpCode] = useState("");
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Timer effect for OTP resend
  useEffect(() => {
    let interval = null;
    if (step === "otp" && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !username || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("username", username);
      formData.append("password", password);
      if (avatarFile) formData.append("image", avatarFile);

      const res = await register(formData);
      showToast("OTP sent to your email!");
      setStep("otp");
      setTimer(60);
      setCanResend(false);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Registration failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      setError("Please enter the 6-digit OTP code.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await verifyOtp({ email, otp: otpCode });
      showToast("Email verified! Welcome to Pollify.");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    try {
      await resendOtp(email);
      showToast("New OTP sent to your email!");
      setTimer(60);
      setCanResend(false);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to resend OTP", "error");
    }
  };

  // Password Strength
  const getPasswordStrength = () => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };
  const strength = getPasswordStrength();

  if (step === "otp") {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Verify your email
          </h2>
          <p className="text-zinc-400 text-xs mt-1">
            We sent a 6-digit verification code to your email.
          </p>
        </div>

        <div className={otp.emailBadge}>
          <div className={otp.emailIconWrapper}>
            <Mail size={16} />
          </div>
          <div>
            <div className={otp.emailLabel}>Verification Email</div>
            <div className={otp.emailValue}>{email}</div>
          </div>
        </div>

        {error && (
          <div className={`${otp.errorBox} mt-4`}>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleVerifyOtp} className={`${otp.form} mt-5`}>
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
            {loading ? "Verifying..." : "Verify & Continue"}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between">
          <span className={otp.resendText}>
            {timer > 0 ? (
              <>
                Resend in <span className={otp.resendTimer}>{timer}s</span>
              </>
            ) : (
              "Didn't receive code?"
            )}
          </span>
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={!canResend}
            className={otp.resendButton}
          >
            <RefreshCw size={14} /> Resend OTP
          </button>
        </div>

        <p className={v.footerText}>
          Wrong email?{" "}
          <button
            onClick={() => setStep("form")}
            className={`${v.link} underline cursor-pointer`}
          >
            Go back
          </button>
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white tracking-tight">Create an account</h2>
        <p className="text-zinc-400 text-xs mt-1">
          Join Pollify to create, vote, and explore community polls
        </p>
      </div>

      {error && (
        <div className={s.errorBox}>
          <AlertCircle size={16} className={s.errorIcon} />
          <span className={s.errorText}>{error}</span>
        </div>
      )}

      <form onSubmit={handleRegisterSubmit} className={s.form}>
        {/* Avatar Picker */}
        <div className={s.avatarContainer}>
          <label className={s.avatarLabel}>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
            <div className={s.avatarCircle}>
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className={s.avatarImage} />
              ) : (
                <User size={24} className={s.avatarPlaceholder} />
              )}
            </div>
            <div className={s.avatarCamera}>
              <Camera size={10} className={s.avatarCameraIcon} />
            </div>
          </label>
          <div className={s.avatarInfo}>
            <div className={s.avatarInfoTitle}>Profile Photo</div>
            <div className={s.avatarInfoSub}>Optional, JPG/PNG up to 5MB</div>
          </div>
        </div>

        {/* Name */}
        <div className={s.field}>
          <label className={s.label}>Full Name</label>
          <div className={s.inputWrapper}>
            <input
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={ui.inputCls}
              required
            />
          </div>
        </div>

        {/* Email */}
        <div className={s.field}>
          <label className={s.label}>Email Address</label>
          <div className={s.inputWrapper}>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={ui.inputCls}
              required
            />
          </div>
        </div>

        {/* Username */}
        <div className={s.field}>
          <label className={s.label}>Username</label>
          <div className={s.inputWrapper}>
            <input
              type="text"
              placeholder="johndoe"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ""))}
              className={ui.inputCls}
              required
            />
          </div>
        </div>

        {/* Password */}
        <div className={s.field}>
          <label className={s.label}>Password</label>
          <div className={s.inputWrapper}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${ui.inputCls} ${s.inputWithSuffix}`}
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

          {/* Password Strength Indicator */}
          {password && (
            <div className={s.strengthContainer}>
              <div
                className={`${s.strengthBarBase} ${
                  strength >= 1 ? s.strengthWeak : s.strengthInactive
                }`}
              />
              <div
                className={`${s.strengthBarBase} ${
                  strength >= 2 ? s.strengthMedium : s.strengthInactive
                }`}
              />
              <div
                className={`${s.strengthBarBase} ${
                  strength >= 3 ? s.strengthStrong : s.strengthInactive
                }`}
              />
              <div
                className={`${s.strengthBarBase} ${
                  strength >= 4 ? s.strengthVeryStrong : s.strengthInactive
                }`}
              />
            </div>
          )}
        </div>

        <button type="submit" disabled={loading} className={ui.authButton}>
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <p className={s.footerText}>
        Already have an account?{" "}
        <Link to="/login" className={s.footerLink}>
          Sign in
        </Link>
      </p>
    </div>
  );
}
