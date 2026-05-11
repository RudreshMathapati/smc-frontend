import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, clearError } from "../../slices/authSlice.js";
import { useTranslation } from "react-i18next";
import {
    MdPhone,
    MdLock,
    MdVisibility,
    MdVisibilityOff,
    MdArrowBack,
    MdPerson,
    MdLogin,
} from "react-icons/md";
import smtLogo from "../../assets/images/smt-logo.png";

// Enhanced constants matching the React Native code
const BUILD_VERSION = "1.0.0";
const BUILD_DATE = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export default function CommonLogin() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const isMarathi = i18n.language === 'mr';

    const { user, loading, error } = useSelector((state) => state.auth);

    const [form, setForm] = useState({
        username: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({
        username: "",
        password: "",
    });
    const [rememberMe, setRememberMe] = useState(false);

    // Redirect after login
    useEffect(() => {
        if (user) {
            toast.success(t("login.success"));
            if (user.role === "ADMIN") {
                navigate("/admin/dashboard");
            } else {
                navigate("/home");
            }
        }
    }, [user, navigate, t]);

    // Show error from Redux
    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearError());
        }
    }, [error, dispatch]);

    const validateForm = () => {
        let valid = true;
        const newErrors = { username: "", password: "" };

        if (!form.username.trim()) {
            newErrors.username = isMarathi ? "वापरकर्तानाव आवश्यक आहे" : "Username is required";
            valid = false;
        }

        if (!form.password) {
            newErrors.password = t("login.errors.passwordRequired");
            valid = false;
        } else if (form.password.length < 6) {
            newErrors.password = t("login.errors.passwordShort");
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({
            ...form,
            [name]: value,
        });
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: "",
            });
        }
    };

    const handleLogin = (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        dispatch(
            loginUser({
                username: form.username,
                password: form.password,
                rememberMe,
            }),
        );
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f9fa] p-4 relative overflow-hidden font-sans">
            {/* Background decoration matching Language Screen */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#0066CC] opacity-5 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#0066CC] opacity-5 rounded-full blur-3xl"></div>

            <div className="bg-white w-full max-w-[420px] p-8 md:p-10 rounded-[24px] shadow-[0_20px_40px_rgba(0,0,0,0.06)] border border-[#e9ecef] relative z-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
                {/* Header with Back Button */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-[#0066CC] font-semibold hover:opacity-80 transition-opacity"
                    >
                        <MdArrowBack size={24} className="mr-1" />
                        <span>{isMarathi ? "मागे" : "Back"}</span>
                    </button>
                </div>

                <div className="flex flex-col items-center mb-8">
                    <div className="mb-4">
                        <img
                            src={smtLogo}
                            alt="Logo"
                            className="w-[150px] h-[150px] object-contain"
                        />
                    </div>
                    <h2 className="text-[28px] font-bold text-[#495057] tracking-tight">
                        {isMarathi ? "प्रशासक लॉगिन" : "Admin Login"}
                    </h2>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    {/* Username Input */}
                    <div className="space-y-1">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-[#0066CC]">
                                <MdPerson className="text-[#adb5bd]" size={20} />
                            </div>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                placeholder={isMarathi ? "वापरकर्तानाव" : "Username"}
                                className={`w-full pl-11 pr-4 py-3.5 rounded-xl border bg-[#f8f9fa] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0066CC]/20 focus:bg-white ${
                                    errors.username
                                        ? "border-red-500"
                                        : "border-[#e9ecef] focus:border-[#0066CC]"
                                }`}
                                value={form.username}
                                onChange={handleChange}
                            />
                        </div>
                        {errors.username && (
                            <p className="text-red-500 text-sm ml-1">
                                {errors.username}
                            </p>
                        )}
                    </div>

                    {/* Password Input */}
                    <div className="space-y-1">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-[#0066CC]">
                                <MdLock className="text-[#adb5bd]" size={20} />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                placeholder={isMarathi ? "पासवर्ड" : "Password"}
                                className={`w-full pl-11 pr-12 py-3.5 rounded-xl border bg-[#f8f9fa] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0066CC]/20 focus:bg-white ${
                                    errors.password
                                        ? "border-red-500"
                                        : "border-[#e9ecef] focus:border-[#0066CC]"
                                }`}
                                value={form.password}
                                onChange={handleChange}
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#adb5bd] hover:text-[#0066CC] transition-colors"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <MdVisibilityOff size={20} />
                                ) : (
                                    <MdVisibility size={20} />
                                )}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-red-500 text-sm ml-1">
                                {errors.password}
                            </p>
                        )}
                    </div>

                    <div className="flex justify-between items-center text-sm">
                        <label className="inline-flex items-center cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={() => setRememberMe(!rememberMe)}
                                className="form-checkbox h-4 w-4 text-[#0066CC] transition duration-150 ease-in-out rounded border-[#e9ecef] focus:ring-[#0066CC]/20"
                            />
                            <span className="ml-2 text-[#6C757D] group-hover:text-[#495057] transition-colors">
                                {t("login.rememberMe")}
                            </span>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 rounded-xl font-bold text-white transition-all duration-300 shadow-[0_4px_12px_rgba(0,102,204,0.2)] active:scale-[0.98] ${
                            loading
                                ? "bg-[#0066CC]/70 cursor-not-allowed"
                                : "bg-[#0066CC] hover:bg-[#0052A3] hover:shadow-[0_6px_20px_rgba(0,102,204,0.3)]"
                        }`}
                    >
                        {loading ? (
                            <div className="flex items-center justify-center">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                {t("login.loading")}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center">
                                <MdLogin className="mr-2" />
                                {isMarathi ? "साइन इन करा" : "Sign In"}
                            </div>
                        )}
                    </button>
                </form>
            </div>

            <div className="mt-8 flex flex-col items-center">
                <p className="text-[13px] font-medium text-[#6C757D] opacity-80">
                    App Version {BUILD_VERSION} (Build: {BUILD_DATE})
                </p>
                <p className="text-[13px] font-bold text-[#6C757D] mt-1">
                    Powered by MIT Vishwaprayag University, Solapur
                </p>
            </div>
        </div>
    );
}
