// "use client";
// import React, { useState, useEffect } from "react";
// import { transactions as mockTransactions } from "@/services/mockData";
// import { jsPDF } from "jspdf";
// import {
//   Search,
//   Download,
//   ChevronLeft,
//   ChevronRight,
//   ChevronDown,
//   ChevronUp,
//   Copy,
//   FileText,
//   CheckCircle2,
//   CreditCard,
//   Smartphone,
//   ShieldAlert,
//   MapPin,
//   CornerDownRight,
//   User,
//   ExternalLink,
//   RefreshCcw,
//   Loader2,
// } from "lucide-react";
// import { useNotificationStore } from "@/store";

// interface Transaction {
//   id: string;
//   recipientName: string;
//   amount: number;
//   currency: string;
//   date: string;
//   status: "COMPLETED" | "PENDING" | "FAILED" | "DISPUTED";
//   type: "DEPOSIT" | "WITHDRAWAL" | "TRANSFER" | "PAYMENT" | "SUBSCRIPTION";
//   method: string;
//   category: string;
//   createdAt: string;
// }

// const AdminTransactions: React.FC = () => {
//   const [transactions, setTransactions] = useState<Transaction[]>(
//     mockTransactions as unknown as Transaction[],
//   );
//   const [filter, setFilter] = useState("ALL");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [expandedId, setExpandedId] = useState<string | null>(null);
//   const [copiedId, setCopiedId] = useState<string | null>(null);
//   const [processingId, setProcessingId] = useState<string | null>(null); // For Refund/PDF loading states
//   const itemsPerPage = 8;
//   const notify = useNotificationStore((state) => state.notify);

//   // Filtering Logic
//   const filteredTransactions = transactions.filter((t) => {
//     const matchesFilter = filter === "ALL" || t.status === filter;
//     const matchesSearch =
//       t.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       t.method.toLowerCase().includes(searchTerm.toLowerCase());
//     return matchesFilter && matchesSearch;
//   });

//   // Pagination Logic
//   const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
//   const paginatedTransactions = filteredTransactions.slice(
//     (currentPage - 1) * itemsPerPage,
//     currentPage * itemsPerPage,
//   );

//   useEffect(() => {
//     setCurrentPage(1);
//     setExpandedId(null);
//   }, [filter, searchTerm]);

//   const toggleExpand = (id: string) => {
//     setExpandedId(expandedId === id ? null : id);
//   };

//   const copyToClipboard = (text: string, e: React.MouseEvent) => {
//     e.stopPropagation();
//     navigator.clipboard.writeText(text);
//     setCopiedId(text);
//     setTimeout(() => setCopiedId(null), 2000);
//   };

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case "COMPLETED":
//         return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400";
//       case "PENDING":
//         return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400";
//       case "FAILED":
//         return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400";
//       case "DISPUTED":
//         return "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400";
//       default:
//         return "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300";
//     }
//   };

//   const handleDownloadReceipt = async (tx: Transaction) => {
//     setProcessingId(tx.id);
//     await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate delay

//     try {
//       const doc = new jsPDF();
//       const pageWidth = doc.internal.pageSize.getWidth();

//       // Header
//       doc.setFillColor(31, 41, 55); // Dark Slate
//       doc.rect(0, 0, pageWidth, 40, "F");

//       doc.setTextColor(255, 255, 255);
//       doc.setFontSize(22);
//       doc.setFont("helvetica", "bold");
//       doc.text("PayNow Admin Record", 15, 20);

//       doc.setFontSize(10);
//       doc.setFont("helvetica", "normal");
//       doc.text("Internal Use Only - Confidential", 15, 30);

//       // Info Block
//       doc.setTextColor(0, 0, 0);
//       doc.setFontSize(12);
//       let y = 60;

//       const addLine = (label: string, value: string) => {
//         doc.setFont("helvetica", "bold");
//         doc.text(label, 20, y);
//         doc.setFont("helvetica", "normal");
//         doc.text(value, 80, y);
//         y += 10;
//       };

//       addLine("Transaction ID:", tx.id);
//       addLine("Date & Time:", new Date(tx.createdAt).toLocaleString());
//       addLine("Status:", tx.status);
//       addLine("Type:", tx.type);
//       addLine("Method:", tx.method);

//       y += 10;
//       doc.setDrawColor(200, 200, 200);
//       doc.line(20, y, pageWidth - 20, y);
//       y += 15;

//       doc.setFontSize(14);
//       doc.setFont("helvetica", "bold");
//       doc.text("Financial Breakdown", 20, y);
//       y += 15;

//       doc.setFontSize(12);
//       const fee = tx.amount * 0.025; // Simulated admin fee logic
//       const net = tx.amount - fee;

//       addLine("Gross Amount:", `${tx.currency} ${tx.amount.toLocaleString()}`);
//       addLine("Platform Fee (2.5%):", `${tx.currency} ${fee.toLocaleString()}`);

//       doc.setTextColor(0, 150, 0); // Green
//       doc.setFont("helvetica", "bold");
//       addLine("Net Settlement:", `${tx.currency} ${net.toLocaleString()}`);

//       // Footer
//       doc.setTextColor(150, 150, 150);
//       doc.setFontSize(10);
//       doc.setFont("helvetica", "normal");
//       doc.text(`Generated by Admin: System User`, 20, 280);
//       doc.text(new Date().toString(), 20, 285);

//       doc.save(`Admin_Receipt_${tx.id}.pdf`);

//       if (notify) notify("SUCCESS", "Admin receipt generated successfully.");
//     } catch (e) {
//       console.error(e);
//       if (notify) notify("ALERT", "Failed to generate PDF.");
//     } finally {
//       setProcessingId(null);
//     }
//   };

//   const handleRefund = async (tx: Transaction) => {
//     if (
//       !window.confirm(
//         `Are you sure you want to refund TX ${tx.id}? This action cannot be undone.`,
//       )
//     )
//       return;

//     setProcessingId(tx.id);
//     await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API

//     // Update local state
//     setTransactions((prev) =>
//       prev.map(
//         (t) => (t.id === tx.id ? { ...t, status: "DISPUTED" } : t), // Using Disputed as a proxy for refunded/reversed in this enum
//       ),
//     );

//     if (notify)
//       notify("SUCCESS", `Transaction ${tx.id} has been fully refunded.`);
//     setProcessingId(null);
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//         <div>
//           <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
//             Transaction Management
//           </h2>
//           <p className="text-sm text-gray-500 dark:text-gray-400">
//             Monitor and manage all platform transactions.
//           </p>
//         </div>
//         <div className="flex gap-2">
//           <button
//             onClick={() => {
//               const doc = new jsPDF();
//               doc.text("Full Transaction Report CSV Export Simulation", 10, 10);
//               doc.save("transactions_export.pdf");
//             }}
//             className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
//           >
//             <Download size={16} /> Export Data
//           </button>
//         </div>
//       </div>

//       <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col h-full transition-colors">
//         {/* Header Controls */}
//         <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//           <div className="flex bg-gray-100 dark:bg-slate-700/50 p-1 rounded-lg">
//             {["ALL", "COMPLETED", "PENDING", "FAILED", "DISPUTED"].map((f) => (
//               <button
//                 key={f}
//                 onClick={() => setFilter(f)}
//                 className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
//                   filter === f
//                     ? "bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-400 shadow-sm"
//                     : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
//                 }`}
//               >
//                 {f}
//               </button>
//             ))}
//           </div>

//           <div className="relative">
//             <Search
//               className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
//               size={16}
//             />
//             <input
//               type="text"
//               placeholder="Search by ID, User..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="pl-9 pr-4 py-2 bg-gray-50 dark:bg-slate-700/50 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none w-full sm:w-64 placeholder-gray-500 dark:placeholder-gray-400"
//             />
//           </div>
//         </div>

//         <div className="overflow-x-auto flex-1">
//           <table className="w-full text-sm text-left">
//             <thead className="bg-gray-50 dark:bg-slate-700/50 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-slate-700">
//               <tr>
//                 <th className="px-6 py-4">Transaction Details</th>
//                 <th className="px-6 py-4">User / Recipient</th>
//                 <th className="px-6 py-4">Amount</th>
//                 <th className="px-6 py-4">Date</th>
//                 <th className="px-6 py-4">Status</th>
//                 <th className="px-6 py-4 w-10"></th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
//               {paginatedTransactions.map((tx) => (
//                 <React.Fragment key={tx.id}>
//                   <tr
//                     onClick={() => toggleExpand(tx.id)}
//                     className={`group cursor-pointer transition-all duration-200 border-l-4 ${
//                       expandedId === tx.id
//                         ? "bg-indigo-50/50 dark:bg-indigo-900/10 border-l-indigo-500"
//                         : "hover:bg-gray-50 dark:hover:bg-slate-700/50 border-l-transparent"
//                     }`}
//                   >
//                     <td className="px-6 py-4">
//                       <div className="flex items-center gap-3">
//                         <div className="p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg">
//                           {tx.method.includes("Mobile") ? (
//                             <Smartphone size={16} className="text-gray-500" />
//                           ) : (
//                             <CreditCard size={16} className="text-gray-500" />
//                           )}
//                         </div>
//                         <div>
//                           <div className="flex items-center gap-2">
//                             <span className="font-mono text-xs text-gray-500 dark:text-gray-400">
//                               #{tx.id}
//                             </span>
//                             {tx.type === "DEPOSIT" && (
//                               <span className="text-[10px] bg-green-100 text-green-700 px-1.5 rounded">
//                                 IN
//                               </span>
//                             )}
//                             {tx.type === "WITHDRAWAL" && (
//                               <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 rounded">
//                                 OUT
//                               </span>
//                             )}
//                           </div>
//                           <p className="font-medium text-gray-900 dark:text-white mt-0.5">
//                             {tx.type}
//                           </p>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4">
//                       <div className="flex flex-col">
//                         <span className="font-medium text-gray-900 dark:text-white">
//                           Alex Mukasa
//                         </span>
//                         <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
//                           <CornerDownRight size={10} />
//                           {tx.recipientName}
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4">
//                       <span className="font-bold text-gray-900 dark:text-white">
//                         {tx.currency} {tx.amount.toLocaleString()}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
//                       {new Date(tx.createdAt).toLocaleDateString()}
//                       <div className="text-xs text-gray-400">
//                         {new Date(tx.createdAt).toLocaleTimeString()}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4">
//                       <span
//                         className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(tx.status)}`}
//                       >
//                         {tx.status}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 text-gray-400">
//                       {expandedId === tx.id ? (
//                         <ChevronUp size={20} />
//                       ) : (
//                         <ChevronDown size={20} />
//                       )}
//                     </td>
//                   </tr>

//                   {/* Expanded Admin Details Row */}
//                   {expandedId === tx.id && (
//                     <tr className="bg-gray-50/80 dark:bg-slate-800/80">
//                       <td colSpan={6} className="px-6 py-0">
//                         <div
//                           className="py-6 border-t border-dashed border-gray-200 dark:border-slate-700 animate-fade-in-up cursor-default"
//                           onClick={(e) => e.stopPropagation()}
//                         >
//                           <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
//                             {/* Col 1: Meta Info */}
//                             <div className="space-y-4 lg:col-span-1">
//                               <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-2">
//                                 <FileText size={14} /> Metadata
//                               </h4>
//                               <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-gray-200 dark:border-slate-700 space-y-2">
//                                 <div>
//                                   <p className="text-[10px] text-gray-400 uppercase">
//                                     Gateway Ref
//                                   </p>
//                                   <div className="flex items-center justify-between">
//                                     <code className="text-xs font-mono text-gray-700 dark:text-gray-300">
//                                       gw_
//                                       {Math.random().toString(36).substr(2, 8)}
//                                     </code>
//                                     <button
//                                       onClick={(e) => copyToClipboard(tx.id, e)}
//                                       className="text-gray-400 hover:text-indigo-600"
//                                     >
//                                       {copiedId === tx.id ? (
//                                         <CheckCircle2
//                                           size={12}
//                                           className="text-green-500"
//                                         />
//                                       ) : (
//                                         <Copy size={12} />
//                                       )}
//                                     </button>
//                                   </div>
//                                 </div>
//                                 <div>
//                                   <p className="text-[10px] text-gray-400 uppercase">
//                                     Category
//                                   </p>
//                                   <p className="text-sm font-medium text-gray-900 dark:text-white">
//                                     {tx.category}
//                                   </p>
//                                 </div>
//                                 <div>
//                                   <p className="text-[10px] text-gray-400 uppercase">
//                                     Method
//                                   </p>
//                                   <p className="text-sm font-medium text-gray-900 dark:text-white">
//                                     {tx.method}
//                                   </p>
//                                 </div>
//                               </div>
//                             </div>

//                             {/* Col 2: Party Details */}
//                             <div className="space-y-4 lg:col-span-1">
//                               <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-2">
//                                 <User size={14} /> Party Details
//                               </h4>
//                               <div className="space-y-3">
//                                 <div className="flex items-start gap-3">
//                                   <div className="mt-0.5">
//                                     <p className="text-xs font-semibold text-gray-500">
//                                       Sender
//                                     </p>
//                                     <p className="text-sm font-bold text-gray-900 dark:text-white">
//                                       Alex Mukasa
//                                     </p>
//                                     <p className="text-xs text-gray-500">
//                                       alex.m@example.com
//                                     </p>
//                                     <p className="text-[10px] text-green-600 bg-green-50 dark:bg-green-900/20 px-1 rounded inline-block mt-1">
//                                       KYC Verified
//                                     </p>
//                                   </div>
//                                 </div>
//                                 <div className="border-l-2 border-gray-200 dark:border-slate-700 pl-3">
//                                   <p className="text-xs font-semibold text-gray-500">
//                                     Recipient
//                                   </p>
//                                   <p className="text-sm font-bold text-gray-900 dark:text-white">
//                                     {tx.recipientName}
//                                   </p>
//                                   <p className="text-xs text-gray-500">
//                                     Merchant Account
//                                   </p>
//                                 </div>
//                               </div>
//                             </div>

//                             {/* Col 3: Risk & Financials */}
//                             <div className="space-y-4 lg:col-span-1">
//                               <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-2">
//                                 <ShieldAlert size={14} /> Risk & Finance
//                               </h4>
//                               <div className="grid grid-cols-2 gap-2">
//                                 <div className="bg-white dark:bg-slate-900 p-2 rounded border border-gray-200 dark:border-slate-700">
//                                   <p className="text-[10px] text-gray-400">
//                                     Risk Score
//                                   </p>
//                                   <p className="text-lg font-bold text-green-600">
//                                     Low
//                                   </p>
//                                 </div>
//                                 <div className="bg-white dark:bg-slate-900 p-2 rounded border border-gray-200 dark:border-slate-700">
//                                   <p className="text-[10px] text-gray-400">
//                                     IP Check
//                                   </p>
//                                   <div className="flex items-center gap-1">
//                                     <MapPin
//                                       size={10}
//                                       className="text-gray-400"
//                                     />
//                                     <span className="text-xs">Uganda</span>
//                                   </div>
//                                 </div>
//                               </div>
//                               <div className="bg-gray-100 dark:bg-slate-700 p-3 rounded-lg text-sm">
//                                 <div className="flex justify-between mb-1">
//                                   <span className="text-gray-500 dark:text-gray-400">
//                                     Gross
//                                   </span>
//                                   <span className="font-medium dark:text-white">
//                                     {tx.currency} {tx.amount.toLocaleString()}
//                                   </span>
//                                 </div>
//                                 <div className="flex justify-between mb-1">
//                                   <span className="text-gray-500 dark:text-gray-400">
//                                     Fee (2.5%)
//                                   </span>
//                                   <span className="font-medium text-red-500">
//                                     -{tx.currency}{" "}
//                                     {(tx.amount * 0.025).toLocaleString()}
//                                   </span>
//                                 </div>
//                                 <div className="border-t border-gray-200 dark:border-slate-600 mt-2 pt-2 flex justify-between font-bold">
//                                   <span className="text-gray-700 dark:text-gray-300">
//                                     Net Settlement
//                                   </span>
//                                   <span className="text-green-600">
//                                     {tx.currency}{" "}
//                                     {(tx.amount * 0.975).toLocaleString()}
//                                   </span>
//                                 </div>
//                               </div>
//                             </div>

//                             {/* Col 4: Admin Actions */}
//                             <div className="space-y-3 lg:col-span-1 border-l border-gray-200 dark:border-slate-700 pl-6 flex flex-col justify-center">
//                               <button
//                                 onClick={() => handleDownloadReceipt(tx)}
//                                 disabled={processingId === tx.id}
//                                 className="w-full flex items-center justify-center gap-2 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
//                               >
//                                 {processingId === tx.id ? (
//                                   <Loader2 size={16} className="animate-spin" />
//                                 ) : (
//                                   <FileText size={16} />
//                                 )}
//                                 {processingId === tx.id
//                                   ? "Generating..."
//                                   : "Admin Receipt"}
//                               </button>
//                               <button
//                                 onClick={() => {}}
//                                 // onViewUserProfile && onViewUserProfile("u123")
//                                 className="w-full flex items-center justify-center gap-2 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600 text-gray-700 dark:text-white rounded-lg text-sm font-medium transition-colors"
//                               >
//                                 <ExternalLink size={16} /> View User Profile
//                               </button>
//                               {tx.status === "COMPLETED" && (
//                                 <button
//                                   onClick={() => handleRefund(tx)}
//                                   disabled={processingId === tx.id}
//                                   className="w-full flex items-center justify-center gap-2 py-2 bg-white dark:bg-slate-700 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
//                                 >
//                                   {processingId === tx.id ? (
//                                     <Loader2
//                                       size={16}
//                                       className="animate-spin"
//                                     />
//                                   ) : (
//                                     <RefreshCcw size={16} />
//                                   )}
//                                   {processingId === tx.id
//                                     ? "Refunding..."
//                                     : "Refund Transaction"}
//                                 </button>
//                               )}
//                               {tx.status === "PENDING" && (
//                                 <div className="grid grid-cols-2 gap-2">
//                                   <button className="py-2 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700">
//                                     APPROVE
//                                   </button>
//                                   <button className="py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700">
//                                     DECLINE
//                                   </button>
//                                 </div>
//                               )}
//                             </div>
//                           </div>
//                         </div>
//                       </td>
//                     </tr>
//                   )}
//                 </React.Fragment>
//               ))}
//               {filteredTransactions.length === 0 && (
//                 <tr>
//                   <td
//                     colSpan={6}
//                     className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
//                   >
//                     No transactions found matching your criteria.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* Pagination Footer */}
//         {filteredTransactions.length > 0 && (
//           <div className="bg-gray-50 dark:bg-slate-700/30 border-t border-gray-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
//             <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
//               Showing{" "}
//               <span className="font-medium">
//                 {(currentPage - 1) * itemsPerPage + 1}
//               </span>{" "}
//               to{" "}
//               <span className="font-medium">
//                 {Math.min(
//                   currentPage * itemsPerPage,
//                   filteredTransactions.length,
//                 )}
//               </span>{" "}
//               of{" "}
//               <span className="font-medium">{filteredTransactions.length}</span>{" "}
//               results
//             </span>
//             <div className="flex gap-2">
//               <button
//                 onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
//                 disabled={currentPage === 1}
//                 className="p-1.5 sm:p-2 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 dark:text-gray-300 transition-colors"
//               >
//                 <ChevronLeft size={16} />
//               </button>
//               <button
//                 onClick={() =>
//                   setCurrentPage((p) => Math.min(totalPages, p + 1))
//                 }
//                 disabled={currentPage === totalPages}
//                 className="p-1.5 sm:p-2 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 dark:text-gray-300 transition-colors"
//               >
//                 <ChevronRight size={16} />
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AdminTransactions;
