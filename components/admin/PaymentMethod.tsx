import { paymentMethodStats } from "@/services/mockData";
import { Smartphone, CreditCard, Landmark } from "lucide-react";

const PaymentMethod = () => {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm transition-colors">
      <h3 className="font-bold text-gray-900 dark:text-white mb-2">
        Method Performance
      </h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
        Success rates by provider type
      </p>

      <div className="space-y-6">
        {paymentMethodStats.map((stat) => (
          <div key={stat.method}>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                {stat.method === "Mobile Money" && (
                  <Smartphone
                    size={16}
                    className="text-gray-500 dark:text-gray-400"
                  />
                )}
                {stat.method === "Credit Card" && (
                  <CreditCard
                    size={16}
                    className="text-gray-500 dark:text-gray-400"
                  />
                )}
                {stat.method === "Bank Transfer" && (
                  <Landmark
                    size={16}
                    className="text-gray-500 dark:text-gray-400"
                  />
                )}
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {stat.method}
                </span>
              </div>
              <span
                className={`text-sm font-bold ${stat.success > 95 ? "text-green-600 dark:text-green-400" : "text-orange-500 dark:text-orange-400"}`}
              >
                {stat.success}%
              </span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-2 mb-1">
              <div
                className="h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${stat.usage}%`,
                  backgroundColor: stat.color,
                }}
              ></div>
            </div>
            <div className="text-right text-xs text-gray-400 dark:text-gray-500">
              {stat.usage}% of Volume
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-700">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Total Failed
          </span>
          <span className="text-sm font-mono font-medium text-red-500 dark:text-red-400">
            1.2%
          </span>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethod;
