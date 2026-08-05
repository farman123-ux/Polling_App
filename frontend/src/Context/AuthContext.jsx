import { createContext, useContext, useEffect, useState } from "react";
import api from "../Utils/api.js";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ created: 0, voted: 0, bookmarked: 0 });
  const [loading, setLoading] = useState(true);

  // Load current user profile
  const loadMe = async () => {
    try {
      const { data } = await api.get("/auth/me");
      setUser(data.user);
      setStats(data.stats || { created: 0, voted: 0, bookmarked: 0 });
    } catch (error) {
      setUser(null);
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("token")) loadMe();
    else setLoading(false);
  }, []);

  // Save token to localStorage and load user
  const saveToken = async (token, initialUser = null) => {
    localStorage.setItem("token", token);
    if (initialUser) setUser(initialUser);
    await loadMe();
  };

  // Register user
  const register = async (formData) => {
    const { data } = await api.post("/auth/register", formData);
    return data;
  };

  // Verify OTP (saves token if returned)
  const verifyOtp = async (payload) => {
    const { data } = await api.post("/auth/verify-otp", payload);
    if (data.token) {
      await saveToken(data.token, data.user);
    }
    return data;
  };

  // Resend OTP
  const resendOtp = (email) => api.post("/auth/resend-otp", { email });

  // Login user
  const login = async (payload) => {
    const { data } = await api.post("/auth/login", payload);
    if (data.token) {
      await saveToken(data.token, data.user);
    }
    return data;
  };

  // Forgot password flow
  const forgetPassword = (email) => api.post("/auth/forget-password", { email });
  const verifyResetOtp = (payload) => api.post("/auth/verify-reset-otp", payload);
  const resetPassword = (payload) => api.post("/auth/reset-password", payload);

  // Settings page operations
  const updateProfile = async (formData) => {
    const { data } = await api.patch("/auth/profile", formData);
    if (data.user) setUser(data.user);
    return data;
  };

  const changePassword = (payload) => api.patch("/auth/password", payload);

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const deleteAccount = async () => {
    await api.delete("/auth/account");
    logout();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        stats,
        setStats,
        loading,
        Loading: loading,
        register,
        verifyOtp,
        verifOtp: verifyOtp,
        resendOtp,
        login,
        forgetPassword,
        verifyResetOtp,
        resetPassword,
        updateProfile,
        changePassword,
        deleteAccount,
        logout,
        refresh: loadMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}