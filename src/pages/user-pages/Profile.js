import React, { useEffect, useState } from "react";
import {
  FaUserCircle,
  FaPhoneAlt,
  FaEnvelope,
  FaArrowLeft,
  FaSignOutAlt,
  FaCheck,
  FaTimes,
  FaEdit,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import {
  logoutUser,
  fetchUser,
  updateProfile,
} from "../../slices/authSlice.js";

const Profile = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!user) {
      dispatch(fetchUser())
        .unwrap()
        .catch(() => {
          toast.error(t("profile.login_first"));
          navigate("/login");
        });
    } else {
      setEditedName(user.name);
    }
  }, [dispatch, user, navigate, t]);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success(t("profile.logout_success"));
      navigate("/");
    } catch (error) {
      toast.error(error || t("profile.logout_failed"));
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedName(user.name);
  };

  const handleSaveName = async () => {
    if (!editedName.trim()) {
      toast.error(t("profile.name_empty"));
      return;
    }

    try {
      setIsUpdating(true);
      await dispatch(updateProfile({ name: editedName })).unwrap();
      toast.success(t("profile.update_success"));
      setIsEditing(false);
    } catch (error) {
      toast.error(error || t("profile.update_failed"));
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-lg text-gray-700">{t("profile.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-sans p-4 md:p-6">
      <div className="max-w-md mx-auto bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
        {/* Header with Back Button */}
        <div className="px-6 pt-6 pb-2">
          <button
            onClick={() => navigate("/home")}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 transition-colors group"
          >
            <FaArrowLeft className="transition-transform group-hover:-translate-x-1" />
            <span className="text-sm font-medium">
              {t("profile.back_home")}
            </span>
          </button>
        </div>
        {/* Profile Content */}
        <div className="p-6 pt-0">
          {/* Profile Picture and Name */}
          <div className="text-center mb-6 relative">
            <div className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-full mb-4 shadow-inner">
              <FaUserCircle className="text-4xl md:text-5xl text-indigo-500" />
            </div>

            {isEditing ? (
              <div className="flex items-center justify-center gap-2">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="text-xl md:text-2xl font-semibold text-gray-800 border-b border-indigo-500 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-200 rounded"
                  autoFocus
                />
                <div className="flex gap-1">
                  <button
                    onClick={handleSaveName}
                    disabled={isUpdating}
                    className="p-1 text-green-600 hover:bg-green-100 rounded-full transition-colors"
                  >
                    {isUpdating ? (
                      <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <FaCheck />
                    )}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="p-1 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <h2 className="text-xl md:text-2xl font-semibold text-gray-800">
                  {user.name}
                </h2>
                <button
                  onClick={handleEditClick}
                  className="p-1 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                >
                  <FaEdit className="text-sm" />
                </button>
              </div>
            )}

            <p className="text-xs md:text-sm text-gray-500 mt-1 px-4 py-1 bg-gray-100 rounded-full inline-block">
              {user.role === "ADMIN"
                ? t("profile.role_admin")
                : t("profile.role_user")}
            </p>
          </div>

          {/* Profile Details */}
          <div className="space-y-3 mb-6">
            {/* Phone Number Card */}
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-full flex-shrink-0">
                <FaPhoneAlt className="text-indigo-600 text-sm md:text-base" />
              </div>
              <div className="flex-grow">
                <p className="text-xs text-gray-500">{t("profile.phone")}</p>
                <p className="font-medium text-gray-800 text-sm md:text-base">
                  +91 {user.phone}
                </p>
              </div>
            </div>

            {/* Email Card */}
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-full flex-shrink-0">
                <FaEnvelope className="text-indigo-600 text-sm md:text-base" />
              </div>
              <div className="flex-grow">
                <p className="text-xs text-gray-500">{t("profile.email")}</p>
                <p className="font-medium text-gray-800 text-sm md:text-base break-all">
                  {user.email || t("profile.na")}
                </p>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <div className="flex justify-center">
            <button
              onClick={handleLogout}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-indigo-400 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm md:text-base"
            >
              <FaSignOutAlt className="text-sm" /> {t("profile.logout")}
            </button>
          </div>
        </div>
        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          {" "}
          <p className="text-xs text-gray-500 text-center">
            {t("profile.member_since")}{" "}
            {new Date(user.createdAt).toLocaleDateString()}{" "}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
