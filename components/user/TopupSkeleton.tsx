export default function TopupSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 min-h-screen bg-transparent animate-pulse">
      {/* Header & Step Indicator Placeholder */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="flex items-center gap-5">
          <div className="p-3 w-12 h-12 bg-gray-200 dark:bg-slate-800 rounded-2xl" />
          <div className="space-y-2">
            <div className="h-10 w-48 bg-gray-200 dark:bg-slate-800 rounded-xl" />
            <div className="h-5 w-32 bg-gray-100 dark:bg-slate-800/50 rounded-lg" />
          </div>
        </div>

        {/* Step Indicator Placeholder */}
        <div className="flex items-center gap-3 bg-gray-100/50 dark:bg-slate-800/50 p-1.5 rounded-2xl border border-gray-200/50 dark:border-slate-700/50">
          <div className="h-10 w-28 bg-gray-200 dark:bg-slate-700 rounded-xl" />
          <div className="h-10 w-28 bg-gray-100/50 dark:bg-slate-800/50 rounded-xl" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        {/* Left Column: Form Placeholder */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 lg:p-10 shadow-2xl border border-gray-100 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gray-200 dark:bg-slate-800 rounded-xl" />
              <div className="h-6 w-48 bg-gray-200 dark:bg-slate-800 rounded-lg" />
            </div>

            <div className="space-y-8">
              {/* Method Selection Placeholder */}
              <div>
                <div className="h-4 w-32 bg-gray-200 dark:bg-slate-800 rounded mb-4" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-28 bg-gray-100 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-800" />
                  <div className="h-28 bg-gray-100 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-800" />
                </div>
              </div>

              {/* Amount Input Placeholder */}
              <div className="space-y-4">
                <div className="h-4 w-32 bg-gray-200 dark:bg-slate-800 rounded" />
                <div className="h-24 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border-2 border-gray-100 dark:border-slate-800" />
              </div>

              {/* Button Placeholder */}
              <div className="h-[68px] bg-gray-200 dark:bg-slate-800 rounded-2xl" />
            </div>
          </div>
        </div>

        {/* Right Column: Summary Placeholder */}
        <div className="lg:col-span-2">
          <div className="sticky top-8 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-slate-800">
              <div className="h-6 w-48 bg-gray-200 dark:bg-slate-800 rounded-lg mb-8" />

              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="h-4 w-24 bg-gray-100 dark:bg-slate-800/50 rounded" />
                    <div className="h-4 w-20 bg-gray-200 dark:bg-slate-800 rounded" />
                  </div>
                ))}

                <div className="pt-6 border-t-2 border-dashed border-gray-100 dark:border-slate-800">
                  <div className="flex justify-between items-end">
                    <div className="h-3 w-20 bg-gray-100 dark:bg-slate-800/50 rounded" />
                    <div className="h-8 w-32 bg-gray-200 dark:bg-slate-800 rounded-lg" />
                  </div>
                </div>
              </div>
            </div>

            {/* Support Info Placeholder */}
            <div className="p-6 bg-gray-50 dark:bg-slate-800/30 rounded-3xl border border-gray-100 dark:border-slate-800/50">
              <div className="h-4 w-24 bg-gray-200 dark:bg-slate-800 rounded mb-2" />
              <div className="h-12 w-full bg-gray-100 dark:bg-slate-800/50 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
