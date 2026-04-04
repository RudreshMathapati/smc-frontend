import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, fetchUser } from "../../slices/authSlice.js";
import { useTranslation } from "react-i18next";
import {
    FaEye,
    FaEyeSlash,
    FaPhone,
    FaLock,
    FaSignInAlt,
    FaUserPlus,
} from "react-icons/fa";
import smtLogo from "../../assets/images/smt-logo.png";
// Firebase removed: Google sign-in disabled

export default function CommonLogin() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const { user, loading, error } = useSelector((state) => state.auth);

    const [form, setForm] = useState({
        phone: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({
        phone: "",
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
        }
    }, [error]);

    const validateForm = () => {
        let valid = true;
        const newErrors = { phone: "", password: "" };

        if (!form.phone.trim()) {
            newErrors.phone = t("login.errors.phoneRequired");
            valid = false;
        } else if (!/^\d{10}$/.test(form.phone)) {
            newErrors.phone = t("login.errors.phoneInvalid");
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
                phone: form.phone,
                password: form.password,
                rememberMe,
            }),
        );
    };

    // Google sign-in removed

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="bg-white w-full max-w-md p-8 rounded-xl shadow-2xl transition-all duration-300 hover:shadow-3xl">
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-white p-4 rounded-full mb-4">
                        <img
                            src={smtLogo}
                            alt="Logo"
                            height={180}
                            width={180}
                        />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800">
                        {t("login.title")}
                    </h2>
                    <p className="text-gray-500 mt-1">{t("login.subtitle")}</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-1">
                        <label
                            htmlFor="phone"
                            className="block text-sm font-medium text-gray-700"
                        >
                            {t("login.phoneLabel")}
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaPhone className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                id="phone"
                                name="phone"
                                placeholder={t("login.phonePlaceholder")}
                                className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                                    errors.phone
                                        ? "border-red-500"
                                        : "border-gray-300"
                                } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                                value={form.phone}
                                onChange={handleChange}
                                maxLength="10"
                            />
                        </div>
                        {errors.phone && (
                            <p className="text-red-500 text-sm">
                                {errors.phone}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700"
                        >
                            {t("login.passwordLabel")}
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaLock className="text-gray-400" />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                placeholder={t("login.passwordPlaceholder")}
                                className={`w-full pl-10 pr-10 py-3 rounded-lg border ${
                                    errors.password
                                        ? "border-red-500"
                                        : "border-gray-300"
                                } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                                value={form.password}
                                onChange={handleChange}
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <FaEyeSlash className="text-gray-400 hover:text-gray-600" />
                                ) : (
                                    <FaEye className="text-gray-400 hover:text-gray-600" />
                                )}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-red-500 text-sm">
                                {errors.password}
                            </p>
                        )}
                    </div>

                    <div className="flex justify-between items-center">
                        <label className="inline-flex items-center">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={() => setRememberMe(!rememberMe)}
                                className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out rounded"
                            />
                            <span className="ml-2 text-sm text-gray-600">
                                {t("login.rememberMe")}
                            </span>
                        </label>
                        <Link
                            to="/forgot-password"
                            className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline"
                        >
                            {t("login.forgotPassword")}
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center ${
                            loading
                                ? "bg-indigo-400 cursor-not-allowed"
                                : "bg-indigo-600 hover:bg-indigo-700"
                        }`}
                    >
                        {loading ? (
                            <>
                                <svg
                                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                                {t("login.loading")}
                            </>
                        ) : (
                            <>
                                <FaSignInAlt className="mr-2" />
                                {t("login.button")}
                            </>
                        )}
                    </button>

                    {/* Google sign-in removed */}
                </form>

                <div className="mt-6 text-center text-sm text-gray-500">
                    {t("login.noAccount")}{" "}
                    <Link
                        to="/register"
                        className="text-indigo-600 hover:text-indigo-800 font-medium underline hover:no-underline"
                    >
                        <FaUserPlus className="inline mr-1" />
                        {t("login.createOne")}
                    </Link>
                </div>
            </div>
        </div>
    );
}
