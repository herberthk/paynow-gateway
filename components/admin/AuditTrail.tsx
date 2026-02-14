import { auditLogs } from "@/services/mockData";
import { FileText } from "lucide-react";

const AuditTrail = () => {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm flex flex-col transition-colors">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <FileText className="text-slate-500 dark:text-slate-400" size={20} />
          Audit Trail
        </h3>
        <button className="text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:underline">
          View Full Log
        </button>
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 dark:bg-slate-700 text-gray-500 dark:text-gray-400 sticky top-0">
            <tr>
              <th className="px-4 py-2">Action</th>
              <th className="px-4 py-2">Admin</th>
              <th className="px-4 py-2 text-right">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
            {auditLogs.map((log) => (
              <tr
                key={log.id}
                className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900 dark:text-gray-200">
                    {log.action}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]">
                    {log.details}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-slate-600 text-gray-800 dark:text-gray-200">
                    {log.admin}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs text-right font-mono">
                  {log.timestamp.split(" ")[1]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditTrail;
