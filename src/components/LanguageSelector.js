import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MdLanguage } from "react-icons/md";
import smtLogo from "../assets/images/smt-logo.png";

// Enhanced constants matching the React Native code
const BUILD_VERSION = "1.0.0";
const BUILD_DATE = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

const LANGUAGES = [
  { code: 'en', name: 'English', icon: 'language' },
  { code: 'mr', name: 'मराठी', textIcon: 'म' },
];

const LanguageSelector = ({ onContinue }) => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(null);

  const handleLanguageSelect = async (code) => {
    setSelectedLanguage(code);

    try {
      // Update i18n
      await i18n.changeLanguage(code);
      localStorage.setItem("i18nextLng", code);
      localStorage.setItem("selectedLanguage", code);

      if (onContinue) {
        onContinue();
      } else {
        navigate("/login");
      }
    } catch (error) {
      console.error("Failed to save language preference:", error);
      setSelectedLanguage(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FA] font-['Inter',sans-serif] p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#0066CC] opacity-5 rounded-full blur-3xl"></div>
      
      <div className="w-full max-w-[420px] bg-white rounded-[24px] p-8 md:p-10 flex flex-col items-center shadow-[0_20px_40px_rgba(0,0,0,0.06)] border border-[#E9ECEF] relative z-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
        <img
          src={smtLogo}
          alt="SMT Logo"
          className="w-[150px] h-[150px] object-contain mb-5"
        />

        <h1 className="text-2xl md:text-3xl font-bold text-[#212529] mb-2 text-center tracking-tight">
          Administrative Portal
        </h1>
        <p className="text-base text-[#6C757D] mb-8 text-center leading-relaxed whitespace-pre-line">
          Choose language to continue{"\n"}भाषा निवडा
        </p>

        <div className="w-full space-y-4">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              disabled={selectedLanguage !== null}
              onClick={() => handleLanguageSelect(lang.code)}
              className={`w-full py-4 px-6 rounded-xl flex items-center justify-center text-lg font-semibold border-2 transition-all duration-300 relative overflow-hidden group ${
                selectedLanguage === lang.code
                  ? "bg-[#0066CC] border-[#0066CC] text-white shadow-lg shadow-blue-200 scale-[0.98]"
                  : "bg-white border-[#0066CC] text-[#0066CC] hover:bg-blue-50 hover:border-[#0052A3] active:scale-95"
              } disabled:opacity-70 disabled:cursor-not-allowed`}
            >
              <div className="flex items-center">
                {lang.textIcon ? (
                  <span className={`text-2xl font-bold mr-3 ${selectedLanguage === lang.code ? 'text-white' : 'text-[#0066CC]'}`}>
                    {lang.textIcon}
                  </span>
                ) : (
                  <MdLanguage size={24} className={`mr-3 ${selectedLanguage === lang.code ? 'text-white' : 'text-[#0066CC]'}`} />
                )}
                {lang.name}
              </div>
            </button>
          ))}
        </div>

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
};

export default LanguageSelector;
