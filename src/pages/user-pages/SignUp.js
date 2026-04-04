import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { fetchUser } from "../../slices/authSlice.js";
import {
    FaUserPlus,
    FaEye,
    FaEyeSlash,
    FaPhone,
    FaLock,
    FaUser,
} from "react-icons/fa";
// Firebase removed: Google sign-up disabled
import axiosInstance from "../../utils/axiosInstance";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import smtLogo from "../../assets/images/smt-logo.png";

const SignUp = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [form, setForm] = useState({
        name: "",
        phone: "",
        password: "",
        confirm: "",
    });

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const isValid =
        form.name &&
        /^[6-9]\d{9}$/.test(form.phone) &&
        form.password.length >= 6 &&
        form.password === form.confirm;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (!/^[6-9]\d{9}$/.test(form.phone)) {
            toast.error(t("errors.invalid_phone"));
            setIsLoading(false);
            return;
        }

        if (form.password.length < 6) {
            toast.error(t("errors.short_password"));
            setIsLoading(false);
            return;
        }

        if (form.password !== form.confirm) {
            toast.error(t("errors.password_mismatch"));
            setIsLoading(false);
            return;
        }

        try {
            console.log("in Sign up Form Data:", form); // Debugging line
            const res = await axiosInstance.post("/api/auth/register", form);
            console.log(res.data);
            navigate("/home");
            toast.success(t("signup.success"));
        } catch (error) {
            console.log("Error in registerUser in SignUp.js", error.message);
            toast.error(error.response?.data?.message || t("signup.failure"));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md p-8 rounded-xl shadow-2xl transition-all duration-300 hover:shadow-3xl">
                <div className="flex flex-col items-center mb-6">
                    <div className="bg-white p-4 rounded-full mb-4">
                        <img
                            src={smtLogo}
                            alt="Logo"
                            height={180}
                            width={180}
                        />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-1">
                        {t("signup.title")}
                    </h2>
                    <p className="text-gray-500 text-center">
                        {t("signup.subtitle")}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaUser className="text-gray-400" />
                        </div>
                        <input
                            name="name"
                            placeholder={t("signup.name_placeholder")}
                            value={form.name}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            required
                        />
                    </div>

                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaPhone className="text-gray-400" />
                        </div>
                        <input
                            name="phone"
                            placeholder={t("signup.phone_placeholder")}
                            value={form.phone}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            required
                        />
                    </div>

                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaLock className="text-gray-400" />
                        </div>
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder={t("signup.password_placeholder")}
                            value={form.password}
                            onChange={handleChange}
                            className="w-full pl-10 pr-10 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            required
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

                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaLock className="text-gray-400" />
                        </div>
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirm"
                            placeholder={t(
                                "signup.confirm_password_placeholder",
                            )}
                            value={form.confirm}
                            onChange={handleChange}
                            className="w-full pl-10 pr-10 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            required
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                            }
                        >
                            {showConfirmPassword ? (
                                <FaEyeSlash className="text-gray-400 hover:text-gray-600" />
                            ) : (
                                <FaEye className="text-gray-400 hover:text-gray-600" />
                            )}
                        </button>
                    </div>

                    {form.confirm && form.password !== form.confirm && (
                        <p className="text-sm text-red-500 -mt-3">
                            {t("signup.password_mismatch")}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={!isValid || isLoading}
                        className={`w-full py-3 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center ${
                            isValid && !isLoading
                                ? "bg-indigo-600 hover:bg-indigo-700"
                                : "bg-gray-400 cursor-not-allowed"
                        }`}
                    >
                        {isLoading ? (
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
                                {t("common.processing")}
                            </>
                        ) : (
                            <>
                                <FaUserPlus className="mr-2" />
                                {t("signup.sign_up")}
                            </>
                        )}
                    </button>

                    {/* Google sign-up removed */}
                </form>

                <div className="mt-6 text-center text-sm text-gray-500">
                    {t("signup.already_have_account")}{" "}
                    <Link
                        to="/login"
                        className="text-indigo-600 hover:text-indigo-800 font-medium underline hover:no-underline"
                    >
                        {t("signin.sign_in")}
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
