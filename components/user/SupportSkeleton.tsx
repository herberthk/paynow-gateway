export default function SupportSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 min-h-screen bg-transparent animate-pulse">
      {/* Header & Step Indicator Placeholder */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div className="flex items-center gap-5">
          <div className="p-3 w-12 h-12 bg-gray-200 dark:bg-slate-800 rounded-2xl" />
          <div className="space-y-2">
            <div className="h-9 w-52 bg-gray-200 dark:bg-slate-800 rounded-xl" />
            <div className="h-4 w-72 bg-gray-100 dark:bg-slate-800/50 rounded-lg" />
          </div>
        </div>

        {/* Step Indicator & History Placeholder */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-100/50 dark:bg-slate-800/50 p-1.5 rounded-2xl border border-gray-200/50 dark:border-slate-700/50">
            <div className="h-9 w-32 bg-gray-200 dark:bg-slate-700 rounded-xl" />
            <div className="h-9 w-28 bg-gray-100/50 dark:bg-slate-800/50 rounded-xl" />
          </div>
          <div className="h-12 w-24 bg-gray-200 dark:bg-slate-800 rounded-2xl" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        {/* Left Column: Interactive Form Placeholder */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 lg:p-10 shadow-2xl border border-gray-100 dark:border-slate-800">
            {/* Step header */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gray-200 dark:bg-slate-800 rounded-xl" />
              <div className="space-y-1.5">
                <div className="h-5 w-56 bg-gray-200 dark:bg-slate-800 rounded-lg" />
                <div className="h-3 w-40 bg-gray-100 dark:bg-slate-800/50 rounded" />
              </div>
            </div>

            <div className="space-y-6">
              {/* Recipient Search Placeholder */}
              <div>
                <div className="h-4 w-28 bg-gray-200 dark:bg-slate-800 rounded mb-2" />
                <div className="h-14 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border-2 border-gray-100 dark:border-slate-800" />
              </div>

              {/* Payment Method Selector Placeholder (3 columns) */}
              <div>
                <div className="h-4 w-36 bg-gray-200 dark:bg-slate-800 rounded mb-3" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="h-24 bg-gray-50 dark:bg-slate-800/40 rounded-2xl border-2 border-gray-100 dark:border-slate-800" />
                  <div className="h-24 bg-gray-50 dark:bg-slate-800/40 rounded-2xl border-2 border-gray-100 dark:border-slate-800" />
                  <div className="h-24 bg-gray-50 dark:bg-slate-800/40 rounded-2xl border-2 border-gray-100 dark:border-slate-800" />
                </div>
              </div>

              {/* Support Amount Placeholder */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="h-4 w-28 bg-gray-200 dark:bg-slate-800 rounded" />
                  <div className="h-3 w-24 bg-gray-100 dark:bg-slate-800/50 rounded" />
                </div>
                <div className="h-20 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border-2 border-gray-100 dark:border-slate-800" />

                {/* Preset chips */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="h-7 w-16 bg-gray-100 dark:bg-slate-800/60 rounded-xl"
                    />
                  ))}
                </div>
              </div>

              {/* Payer Mobile Money Input Placeholder */}
              <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-slate-800/80">
                <div className="h-4 w-44 bg-gray-200 dark:bg-slate-800 rounded mb-1" />
                <div className="h-14 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border-2 border-gray-100 dark:border-slate-800" />
              </div>

              {/* Submit Button Placeholder */}
              <div className="h-[68px] bg-gray-200 dark:bg-slate-800 rounded-2xl mt-4" />
            </div>
          </div>
        </div>

        {/* Right Column: Summary Placeholder */}
        <div className="lg:col-span-2">
          <div className="sticky top-8 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-slate-800">
              <div className="h-5 w-40 bg-gray-200 dark:bg-slate-800 rounded-lg mb-6" />

              <div className="space-y-4">
                {/* Recipient box */}
                <div className="p-3.5 bg-gray-50 dark:bg-slate-800/60 rounded-2xl border border-gray-100 dark:border-slate-700/60 h-16" />

                {/* Method row */}
                <div className="flex justify-between items-center py-2">
                  <div className="h-4 w-28 bg-gray-100 dark:bg-slate-800/50 rounded" />
                  <div className="h-4 w-24 bg-gray-200 dark:bg-slate-800 rounded" />
                </div>

                {/* Amount row */}
                <div className="flex justify-between items-center py-2">
                  <div className="h-4 w-28 bg-gray-100 dark:bg-slate-800/50 rounded" />
                  <div className="h-4 w-20 bg-gray-200 dark:bg-slate-800 rounded" />
                </div>

                {/* Total row */}
                <div className="pt-4 border-t-2 border-dashed border-gray-100 dark:border-slate-800">
                  <div className="flex justify-between items-end">
                    <div className="h-3 w-20 bg-gray-100 dark:bg-slate-800/50 rounded" />
                    <div className="h-7 w-28 bg-gray-200 dark:bg-slate-800 rounded-lg" />
                  </div>
                </div>

                {/* Shield note placeholder */}
                <div className="h-16 bg-gray-50 dark:bg-slate-800/40 rounded-2xl mt-4" />
              </div>
            </div>

            {/* Empowering Others Card Placeholder */}
            <div className="p-6 bg-gray-50 dark:bg-slate-800/30 rounded-3xl border border-gray-100 dark:border-slate-800/50 space-y-2">
              <div className="h-4 w-32 bg-gray-200 dark:bg-slate-800 rounded" />
              <div className="h-10 w-full bg-gray-100 dark:bg-slate-800/40 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
