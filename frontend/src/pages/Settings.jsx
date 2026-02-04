import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Camera,
  Image,
  Lock,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  X,
  AtSign,
} from "lucide-react";

const Settings = () => {
  const { user, loadCurrentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("profile");

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const getUserAvatar = (u) => {
    if (!u) return "/default-avatar.svg";
    if (typeof u.avatar === "string") return u.avatar;
    if (typeof u.avatar === "object" && u.avatar !== null) {
      return u.avatar.url || "/default-avatar.svg";
    }
    return "/default-avatar.svg";
  };

  const getCoverImage = (u) => {
    if (!u) return null;
    if (typeof u.coverImage === "string") return u.coverImage;
    if (typeof u.coverImage === "object" && u.coverImage !== null) {
      return u.coverImage.url || null;
    }
    return null;
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (fullName !== user?.fullName) {
        await api.patch("/api/v1/users/update-account", { 
          fullName, 
          email: user?.email
        });
      }

      if (avatarFile) {
        const fd = new FormData();
        fd.append("avatar", avatarFile);
        await api.patch("/api/v1/users/avatar", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      if (coverFile) {
        const fd = new FormData();
        fd.append("coverImage", coverFile);
        await api.patch("/api/v1/users/cover-image", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      await loadCurrentUser();
      setSuccess("Profile updated successfully!");
      setAvatarFile(null);
      setAvatarPreview(null);
      setCoverFile(null);
      setCoverPreview(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/v1/users/change-password", {
        oldPassword,
        newPassword,
      });
      setSuccess("Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    navigate("/login");
    return null;
  }

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "password", label: "Password", icon: Lock },
  ];

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-400">Manage your account settings</p>
        </div>


        <div className="flex gap-2 mb-8 border-b border-gray-800 pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setError("");
                setSuccess("");
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-indigo-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>


        {success && (
          <div className="flex items-center gap-3 p-4 mb-6 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 animate-fade-in">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <p>{success}</p>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 p-4 mb-6 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 animate-fade-in">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}


        {activeTab === "profile" && (
          <form onSubmit={updateProfile} className="space-y-8">

            <div className="card overflow-hidden">
              <div className="relative h-48 bg-gradient-to-br from-indigo-900 via-purple-900 to-gray-900">
                {(coverPreview || getCoverImage(user)) && (
                  <img
                    src={coverPreview || getCoverImage(user)}
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-black/30" />

                <label className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-sm rounded-lg text-white cursor-pointer hover:bg-black/70 transition-colors">
                  <Image className="w-4 h-4" />
                  Change Cover
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverChange}
                    className="hidden"
                  />
                </label>

                {coverPreview && (
                  <button
                    type="button"
                    onClick={() => {
                      setCoverFile(null);
                      setCoverPreview(null);
                    }}
                    className="absolute top-4 right-4 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                )}
              </div>


              <div className="relative px-6 pb-6">
                <div className="absolute -top-12 left-6">
                  <div className="relative">
                    <img
                      src={avatarPreview || getUserAvatar(user)}
                      alt="Avatar"
                      className="w-24 h-24 rounded-full object-cover ring-4 ring-gray-800"
                    />
                    <label className="absolute bottom-0 right-0 p-2 bg-indigo-600 rounded-full cursor-pointer hover:bg-indigo-500 transition-colors">
                      <Camera className="w-4 h-4 text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="pt-16">
                  <h3 className="font-semibold text-gray-200">
                    {user.fullName || user.username}
                  </h3>
                  <p className="text-gray-500">@{user.username}</p>
                </div>
              </div>
            </div>


            <div className="card p-6 space-y-6">
              <h3 className="text-lg font-semibold text-gray-200">
                Account Details
              </h3>


              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="input-icon">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="input-field input-with-icon"
                  />
                </div>
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Username <span className="text-gray-500 text-xs">(cannot be changed)</span>
                </label>
                <div className="relative">
                  <div className="input-icon">
                    <AtSign className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={user?.username || ""}
                    className="input-field input-with-icon bg-gray-700/50 cursor-not-allowed"
                    disabled
                    readOnly
                  />
                </div>
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email <span className="text-gray-500 text-xs">(cannot be changed)</span>
                </label>
                <div className="relative">
                  <div className="input-icon">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    value={user?.email || ""}
                    className="input-field input-with-icon bg-gray-700/50 cursor-not-allowed"
                    disabled
                    readOnly
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex items-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  Save Changes
                </button>
              </div>
            </div>
          </form>
        )}


        {activeTab === "password" && (
          <form onSubmit={changePassword} className="card p-6 space-y-6">
            <h3 className="text-lg font-semibold text-gray-200">
              Change Password
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Current Password
              </label>
              <div className="relative">
                <div className="input-icon">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="input-field input-with-icon"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                New Password
              </label>
              <div className="relative">
                <div className="input-icon">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-field input-with-icon"
                  minLength={6}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="input-icon">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field input-with-icon"
                  minLength={6}
                  required
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Lock className="w-5 h-5" />
                )}
                Change Password
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Settings;
