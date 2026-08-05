import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, AlertCircle, Info } from "lucide-react";
import { useAuth } from "../Context/AuthContext";
import { useToast } from "../Context/ToastContext";
import { loginStyles as s } from "../assets/dummyStyles";

export default function LoginPage() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const noticeMessage = location.state?.message;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await login({ email, password });
      showToast("Logged in successfully!");
      const from = location.state?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    } catch (err) {
      const data = err.response?.data;
      if (data?.needsVerification) {
        showToast("Account unverified. Redirecting to OTP verification...", "error");
        navigate("/signup", {
          state: { needsVerification: true, email: data.email || email },
        });
      } else if (data?.message) {
        setError(data.message);
      } else if (!err.response || err.code === "ERR_NETWORK" || err.message === "Network Error") {
        setError("Network Error: Unable to connect to the server. Please check your connection or backend status.");
      } else {
        setError("Invalid credentials. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white tracking-tight">Welcome back</h2>
        <p className="text-zinc-400 text-xs mt-1">
          Enter your details to access your account
        </p>
      </div>

      {noticeMessage && (
        <div className={s.notice}>
          <Info size={16} className={s.noticeIcon} />
          <span className={s.noticeText}>{noticeMessage}</span>
        </div>
      )}

      {error && (
        <div className={s.error}>
          <AlertCircle size={16} className={s.errorIcon} />
          <span className={s.errorText}>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className={s.form}>
        <div className={s.field}>
          <label className={s.label}>Email Address</label>
          <div className={s.inputWrapper}>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`${s.input} ${s.inputWithIcon}`}
              required
            />
            <Mail size={16} className={s.icon} />
          </div>
        </div>

        <div className={s.field}>
          <div className={s.passwordRow}>
            <label className={s.label}>Password</label>
            <Link to="/forgot-password" className={s.forgotLink}>
              Forgot password?
            </Link>
          </div>
          <div className={s.inputWrapper}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${s.input} ${s.inputWithIcon}`}
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

        <button type="submit" disabled={loading} className={s.submitButton}>
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <div className={s.divider}>
        <div className={s.dividerLine} />
        <span className={s.dividerText}>Don't have an account?</span>
        <div className={s.dividerLine} />
      </div>

      <Link to="/signup" className={s.signupLink}>
        Create an account
      </Link>
    </div>
  );
}
