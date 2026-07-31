import React, { useState } from "react";
import { Camera, Eye, EyeOff, ShieldAlert, Trash2 } from "lucide-react";
import { useAuth } from "../Context/AuthContext";
import { useToast } from "../Context/ToastContext";
import { settingsStyles as s, uiElementStyles as ui } from "../assets/dummyStyles";

export default function SettingsPage() {
  const { user, updateProfile, changePassword, deleteAccount } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState("profile"); // profile | password | danger

  // Profile Form
  const [name, setName] = useState(user?.name || "");
  const [username, setUsername] = useState(user?.username || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Password Form
  const [currentpassword, setCurrentpassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Delete Account
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("username", username);
      formData.append("bio", bio);
      if (avatarFile) formData.append("image", avatarFile);

      await updateProfile(formData);
      showToast("Profile updated successfully!");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update profile", "error");
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!currentpassword || !newPassword) {
      showToast("Please fill in all password fields", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("New passwords do not match", "error");
      return;
    }

    setPasswordLoading(true);
    try {
      await changePassword({ currentpassword, newPassword });
      showToast("Password updated successfully!");
      setCurrentpassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update password", "error");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      await deleteAccount();
      showToast("Account deleted successfully");
    } catch (err) {
      showToast("Failed to delete account", "error");
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className={s.container}>
      <h1 className={s.heading}>Account Settings</h1>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-3 text-xs font-semibold">
        <button
          onClick={() => setActiveTab("profile")}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === "profile"
              ? "bg-zinc-800 text-emerald-400"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Profile Info
        </button>
        <button
          onClick={() => setActiveTab("password")}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === "password"
              ? "bg-zinc-800 text-emerald-400"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Change Password
        </button>
        <button
          onClick={() => setActiveTab("danger")}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === "danger"
              ? "bg-rose-500/15 text-rose-400 border border-rose-500/20"
              : "text-zinc-500 hover:text-rose-400"
          }`}
        >
          Danger Zone
        </button>
      </div>

      {/* Tab 1: Profile Info */}
      {activeTab === "profile" && (
        <form onSubmit={handleProfileSubmit} className={s.section}>
          <div className={s.sectionTitle}>Edit Profile Information</div>

          {/* Avatar Upload */}
          <div className={s.avatarRow}>
            <label className={s.avatarLabel}>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <div className={s.avatarWrapper}>
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt={name}
                    className={s.avatarImage}
                  />
                ) : (
                  <div className={`${s.avatarPlaceholder} ${ui.avatarPlaceholder}`}>
                    {name ? name[0].toUpperCase() : "U"}
                  </div>
                )}
                <div className={s.avatarCameraBadge}>
                  <Camera size={10} />
                </div>
              </div>
            </label>
            <div className={s.avatarInfo}>
              <div className={s.avatarInfoTitle}>Avatar Image</div>
              <div className={s.avatarInfoSub}>Click avatar to choose new photo</div>
            </div>
          </div>

          <div className={s.fieldRow}>
            <div className={s.fieldGroup}>
              <label className={s.label}>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={ui.inputCls}
                required
              />
            </div>
            <div className={s.fieldGroup}>
              <label className={s.label}>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                className={ui.inputCls}
                required
              />
            </div>
          </div>

          <div className={s.fieldGroup}>
            <div className={s.bioRow}>
              <label className={s.label}>Bio</label>
              <span className={s.bioCharCount}>{bio.length}/150</span>
            </div>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 150))}
              placeholder="Write a short bio about yourself..."
              className={`${ui.inputCls} ${s.bioTextarea}`}
            />
          </div>

          <button
            type="submit"
            disabled={profileLoading}
            className={`${ui.btnBase} ${ui.btnPrimary} ${s.saveButton}`}
          >
            {profileLoading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      )}

      {/* Tab 2: Change Password */}
      {activeTab === "password" && (
        <form onSubmit={handlePasswordSubmit} className={s.section}>
          <div className={s.sectionTitle}>Change Account Password</div>

          <div className={s.passwordForm}>
            <div>
              <label className={s.label}>Current Password</label>
              <div className={s.pwWrapper}>
                <input
                  type={showCurrentPw ? "text" : "password"}
                  value={currentpassword}
                  onChange={(e) => setCurrentpassword(e.target.value)}
                  placeholder="••••••••"
                  className={`${ui.inputCls} ${s.pwInput}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPw(!showCurrentPw)}
                  className={s.pwToggle}
                >
                  {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className={s.label}>New Password</label>
              <div className={s.pwWrapper}>
                <input
                  type={showNewPw ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`${ui.inputCls} ${s.pwInput}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw(!showNewPw)}
                  className={s.pwToggle}
                >
                  {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className={s.label}>Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className={ui.inputCls}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={passwordLoading}
            className={`${ui.btnBase} ${ui.btnPrimary} ${s.saveButton}`}
          >
            {passwordLoading ? "Updating..." : "Update Password"}
          </button>
        </form>
      )}

      {/* Tab 3: Danger Zone */}
      {activeTab === "danger" && (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-5 space-y-4">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
            <ShieldAlert size={18} /> Permanently Delete Account
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Deleting your account will permanently remove all your created polls,
            votes, comments, and profile data. This action cannot be undone.
          </p>
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className={`${ui.btnBase} ${ui.btnDanger}`}
          >
            <Trash2 size={14} /> Delete Account
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-sm w-full space-y-4">
            <h3 className="text-base font-bold text-white">Confirm Account Deletion</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Are you completely sure? All your data will be permanently wiped.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className={`${ui.btnBase} ${ui.btnGhost}`}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                className={`${ui.btnBase} ${ui.btnDanger}`}
              >
                {deleteLoading ? "Deleting..." : "Yes, Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
