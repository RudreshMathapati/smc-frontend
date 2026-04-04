import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaGlobeAmericas, FaArrowRight } from "react-icons/fa";
// import { HiOutlineTranslate } from "react-icons/hi";
import smtLogo from "../assets/images/smt-logo.png";

const LanguageScreen = () => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();

  const handleLanguageSelect = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("selectedLanguage", lang);
    navigate("/login");
  };

  const languages = [
    { code: "en", name: "English", nativeName: "English" },
    { code: "mr", name: "Marathi", nativeName: "मराठी" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white w-full max-w-md p-8 rounded-xl shadow-2xl transition-all duration-300 hover:shadow-3xl">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-white p-4 rounded-full mb-4">
            <img src={smtLogo} alt="N/A" height={180} width={180} />
            {/* <FaBus className="text-indigo-600 text-3xl" /> */}
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Track My Bus</h1>
          <p className="text-gray-500 text-1xl">
            Powered by
          </p>
          <p className="text-gray-500 mt-1">
            Solapur Municipal Corporation
          </p>
        </div>

        {/* Language Selection */}
        <div className="flex flex-col items-center mb-6">
          {/* <div className="bg-indigo-100 p-3 rounded-full mb-3">
            <HiOutlineTranslate className="text-indigo-600 text-2xl" />
          </div> */}
          <h2 className="text-2xl font-bold text-gray-800">
            Choose Your Language
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Select your preferred language
          </p>
        </div>

        {/* Language Buttons */}
        <div className="space-y-4 mb-6">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageSelect(lang.code)}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-between ${
                i18n.language === lang.code
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-800"
              }`}
            >
              <div className="flex items-center">
                <span className="mr-2 text-lg">
                  {lang.code === "en" ? "🇬🇧" : "🇮🇳"}
                </span>
                <span>{lang.name}</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm mr-2 opacity-80">
                  {lang.nativeName}
                </span>
                <FaArrowRight className="text-sm" />
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200 text-center">
          <div className="flex items-center justify-center text-gray-500 text-sm">
            <FaGlobeAmericas className="mr-2 text-indigo-500" />
            <span>Solapur Public Transport System</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguageScreen;
