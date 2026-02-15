"use client";
const CustomTooltip = ({
  active,
  payload,
  label,
  showCurrency = true,
}: {
  active: boolean;
  payload: {
    name: string;
    value: number;
    color: string;
  }[];
  label: string;
  showCurrency?: boolean;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 p-4 border border-gray-100 dark:border-slate-700 shadow-xl rounded-lg">
        <p className="font-bold text-gray-900 dark:text-white mb-2">{label}</p>
        {payload.map((p, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm mb-1">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: p.color }}
            />
            <span className="text-gray-500 dark:text-gray-400 capitalize">
              {p.name}:
            </span>
            <span className="font-mono font-medium text-gray-900 dark:text-gray-200">
              {showCurrency && "UGX "}
              {p.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default CustomTooltip;
