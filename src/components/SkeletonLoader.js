import React from "react";

const SkeletonLoader = ({ type = "full" }) => {
  // Full page skeleton (for initial load)
  if (type === "full") {
    return (
      <div className="flex min-h-screen bg-gray-50 text-gray-800 font-sans">
        {/* Sidebar Skeleton */}
        <aside className="w-64 bg-gray-800 text-white flex flex-col p-4 space-y-2 sticky top-0 h-screen shadow-lg">
          <div className="p-4 mb-4">
            <div className="h-8 w-3/4 bg-gray-700 rounded mb-4 animate-pulse"></div>
            <div className="h-4 w-1/2 bg-gray-700 rounded animate-pulse"></div>
          </div>

          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-10 bg-gray-700 rounded-lg animate-pulse"
            ></div>
          ))}

          <div className="pt-4 border-t border-gray-700 mt-auto">
            <div className="h-10 bg-gray-700 rounded-lg animate-pulse"></div>
          </div>
        </aside>

        {/* Main Content Skeleton */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar Skeleton */}
          <header className="bg-white shadow-sm px-6 py-3 sticky top-0 z-10 flex items-center justify-between">
            <div className="h-6 w-1/4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
          </header>

          {/* Page Content Skeleton */}
          <section className="flex-1 overflow-y-auto p-6 bg-gray-50">
            <div className="bg-white rounded-xl shadow-sm p-6 min-h-[calc(100vh-120px)]">
              {/* Dashboard Title Skeleton */}
              <div className="h-10 w-1/3 bg-gray-200 rounded mb-8 animate-pulse"></div>

              {/* Stat Cards Skeleton */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="h-40 bg-gray-100 rounded-2xl animate-pulse"
                  ></div>
                ))}
              </div>

              {/* Chart Skeleton */}
              <div className="h-80 bg-gray-100 rounded-2xl animate-pulse"></div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  // Content skeleton (for partial loading)
  return (
    <div className="space-y-8">
      {/* Title Skeleton */}
      <div className="h-10 w-1/3 bg-gray-200 rounded animate-pulse"></div>

      {/* Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-40 bg-gray-100 rounded-2xl animate-pulse"
          ></div>
        ))}
      </div>

      {/* Chart Skeleton */}
      <div className="h-80 bg-gray-100 rounded-2xl animate-pulse"></div>
    </div>
  );
};

export default SkeletonLoader;
