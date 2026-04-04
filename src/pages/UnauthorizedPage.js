import { FaLock, FaArrowLeft } from "react-icons/fa";

const UnauthorizedPage = () => {
  const handleGoBack = () => {
    window.history.back(); // Goes back to the previous page
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="flex flex-col items-center space-y-4">
          <div className="p-4 text-white bg-red-500 rounded-full">
            <FaLock size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            Unauthorized Access
          </h1>
          <p className="text-gray-600 text-center">
            You don't have permission to access this page. Please contact the
            administrator if you believe this is an error.
          </p>
        </div>

        <button
          onClick={handleGoBack}
          className="flex items-center justify-center w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <FaArrowLeft className="mr-2" />
          Go Back
        </button>

        {/* Optional: Add a link to home page */}
        {/* <div className="text-center">
          <a
            href="/"
            className="text-sm text-blue-500 hover:text-blue-700 hover:underline"
          >
            Or return to home page
          </a>
        </div> */}
      </div>
    </div>
  );
};

export default UnauthorizedPage;
