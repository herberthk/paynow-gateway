"use client";
import React, { useState } from "react";

import { auditLogs as initialLogs } from "@/services/mockData";
import {
  FileText,
  Search,
  Clock,
  Shield,
  Globe,
  ChevronLeft,
  ChevronRight,
  Download,
  ChevronDown,
  ChevronUp,
  Hash,
  Monitor,
  Cpu,
} from "lucide-react";

const AdminAuditLogs: React.FC = () => {
  const [logs] = useState<AuditLog[]>(initialLogs);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const filteredLogs = logs.filter(
    (log) =>
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.admin.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Pagination Logic
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleExport = () => {
    // Simulation of export functionality
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Action,Admin,Details,Timestamp\n" +
      filteredLogs
        .map(
          (row) =>
            `${row.action},${row.admin},"${row.details}",${row.timestamp}`,
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "audit_logs.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            System Audit Logs
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Track all administrative actions and system events.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
              size={18}
            />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 pr-4 py-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none w-64 placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
            />
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 text-sm font-medium transition-colors"
          >
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col min-h-[500px] transition-colors">
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-slate-700/50 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-3">Action</th>
                <th className="px-6 py-3">Admin</th>
                <th className="px-6 py-3">Details</th>
                <th className="px-6 py-3">IP Address</th>
                <th className="px-6 py-3 text-right">Timestamp</th>
                <th className="px-6 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {paginatedLogs.map((log) => {
                // eslint-disable-next-line react-hooks/purity
                const randomId = Math.random().toString(36).substr(2, 9);
                return (
                  <React.Fragment key={log.id}>
                    <tr
                      onClick={() => toggleExpand(log.id)}
                      className={`cursor-pointer transition-all duration-200 group border-l-4 ${
                        expandedId === log.id
                          ? "bg-indigo-50/50 dark:bg-indigo-900/10 border-l-indigo-500"
                          : "hover:bg-gray-50 dark:hover:bg-slate-700/50 border-l-transparent"
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-gray-100 dark:bg-slate-700 rounded text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 transition-colors">
                            <FileText size={16} />
                          </div>
                          <span className="font-medium text-gray-900 dark:text-gray-200">
                            {log.action}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-100 dark:border-purple-800">
                          <Shield size={10} /> {log.admin}
                        </span>
                      </td>
                      <td
                        className="px-6 py-4 text-gray-600 dark:text-gray-400 truncate max-w-xs"
                        title={log.details}
                      >
                        {log.details}
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-500 font-mono text-xs">
                        <div className="flex items-center gap-1.5">
                          <Globe
                            size={12}
                            className="text-gray-400 dark:text-gray-500"
                          />
                          {log.ip || "127.0.0.1"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-gray-500 dark:text-gray-400">
                        <div className="flex items-center justify-end gap-1.5">
                          <Clock
                            size={12}
                            className="text-gray-400 dark:text-gray-500"
                          />
                          {log.timestamp}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-400">
                        {expandedId === log.id ? (
                          <ChevronUp size={20} />
                        ) : (
                          <ChevronDown size={20} />
                        )}
                      </td>
                    </tr>

                    {/* Expanded View */}
                    {expandedId === log.id && (
                      <tr className="bg-gray-50/50 dark:bg-slate-800/50">
                        <td colSpan={6} className="px-6 py-0">
                          <div className="py-6 border-t border-dashed border-gray-200 dark:border-slate-700 animate-fade-in-up">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div>
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                                  Event Details
                                </h4>
                                <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-gray-200 dark:border-slate-700">
                                  <p className="text-sm text-gray-700 dark:text-gray-300 font-mono leading-relaxed">
                                    {log.details}
                                  </p>
                                </div>
                              </div>
                              <div>
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                                  Technical Metadata
                                </h4>
                                <div className="space-y-3">
                                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-slate-700">
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                      <Hash size={16} />
                                      Log ID
                                    </div>
                                    <span className="font-mono text-xs text-gray-900 dark:text-white">
                                      {log.id}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-slate-700">
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                      <Monitor size={16} />
                                      User Agent
                                    </div>
                                    <span className="text-xs text-gray-900 dark:text-white">
                                      Mozilla/5.0 (Macintosh; Intel Mac OS X
                                      10_15_7)
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-slate-700">
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                      <Cpu size={16} />
                                      Session ID
                                    </div>
                                    <span className="font-mono text-xs text-gray-900 dark:text-white">
                                      sess_
                                      {randomId}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {paginatedLogs.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-400 dark:text-gray-500"
                  >
                    No logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {filteredLogs.length > 0 && (
          <div className="bg-gray-50 dark:bg-slate-700/30 border-t border-gray-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredLogs.length)} of{" "}
              {filteredLogs.length} entries
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 border border-gray-300 dark:border-slate-600 rounded hover:bg-white dark:hover:bg-slate-700 disabled:opacity-50 text-gray-600 dark:text-gray-300"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="p-1.5 border border-gray-300 dark:border-slate-600 rounded hover:bg-white dark:hover:bg-slate-700 disabled:opacity-50 text-gray-600 dark:text-gray-300"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAuditLogs;
