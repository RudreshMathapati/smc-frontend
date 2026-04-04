import { useNavigate } from "react-router-dom";
import { FaExclamationTriangle, FaArrowLeft } from "react-icons/fa";

const PageNotFound = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1); // Goes back to previous page
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white w-full max-w-md p-8 rounded-xl shadow-2xl text-center">
        <div className="flex flex-col items-center">
          <div className="bg-red-100 p-4 rounded-full mb-4">
            <FaExclamationTriangle className="text-red-500 text-3xl" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            404 - Page Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The page you're looking for doesn't exist or has been moved.
          </p>

          <button
            onClick={handleGoBack}
            className="flex items-center justify-center w-full mb-4 max-w-xs px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors duration-200"
          >
            <FaArrowLeft className="mr-2" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default PageNotFound;
