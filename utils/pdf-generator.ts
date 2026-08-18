import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Define interface for autoTable to avoid TS errors if types are missing
interface AutoTable extends jsPDF {
  lastAutoTable: { finalY: number };
}

export const generateIncomeStatementPDF = (data: {
  period: { start: Date; end: Date };
  revenues: { name: string; amount: number }[];
  totalRevenue: number;
  expenses: { name: string; amount: number }[];
  totalExpenses: number;
  netIncome: number;
}) => {
  const doc = new jsPDF() as AutoTable;

  // Header
  doc.setFontSize(20);
  doc.text("ConnectPay", 14, 20);
  doc.setFontSize(10);
  doc.text("Generated on: " + new Date().toLocaleDateString(), 14, 26);

  doc.setFontSize(16);
  doc.text("Statement of Comprehensive Income", 14, 40);

  doc.setFontSize(10);
  doc.text(
    `For the period ${new Date(data.period.start).toLocaleDateString()} to ${new Date(
      data.period.end,
    ).toLocaleDateString()}`,
    14,
    46,
  );

  let finalY = 50;

  // Revenue Section
  doc.setFontSize(12);
  doc.text("Revenue", 14, finalY + 10);

  autoTable(doc, {
    startY: finalY + 12,
    head: [["Description", "Amount (UGX)"]],
    body: [
      ...data.revenues.map((r) => [r.name, r.amount.toLocaleString()]),
      [
        { content: "Total Revenue", styles: { fontStyle: "bold" } },
        {
          content: data.totalRevenue.toLocaleString(),
          styles: { fontStyle: "bold", textColor: [22, 163, 74] },
        },
      ], // Green for revenue
    ],
    theme: "striped",
    headStyles: { fillColor: [79, 70, 229] }, // Indigo
  });

  finalY = doc.lastAutoTable.finalY + 10;

  // Expenses Section
  doc.setFontSize(12);
  doc.text("Expenses", 14, finalY + 10);

  autoTable(doc, {
    startY: finalY + 12,
    head: [["Description", "Amount (UGX)"]],
    body: [
      ...data.expenses.map((e) => [e.name, e.amount.toLocaleString()]),
      [
        { content: "Total Expenses", styles: { fontStyle: "bold" } },
        {
          content: `(${data.totalExpenses.toLocaleString()})`,
          styles: { fontStyle: "bold", textColor: [239, 68, 68] },
        },
      ], // Red for expense
    ],
    theme: "striped",
    headStyles: { fillColor: [79, 70, 229] },
  });

  finalY = doc.lastAutoTable.finalY + 15;

  // Net Income Summary
  const isProfit = data.netIncome >= 0;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Net Income", 14, finalY);

  doc.setTextColor(
    isProfit ? 22 : 220,
    isProfit ? 163 : 38,
    isProfit ? 74 : 38,
  ); // Green or Red
  doc.text(`UGX ${data.netIncome.toLocaleString()}`, 150, finalY, {
    align: "right",
  });

  doc.save(`income_statement_${new Date().toISOString().split("T")[0]}.pdf`);
};

export const generateBalanceSheetPDF = (data: {
  asOf: Date;
  assets: { name: string; amount: number }[];
  totalAssets: number;
  liabilities: { name: string; amount: number }[];
  totalLiabilities: number;
  equity: { name: string; amount: number }[];
  totalEquity: number;
}) => {
  const doc = new jsPDF() as AutoTable;

  // Header
  doc.setFontSize(20);
  doc.text("ConnectPay", 14, 20);
  doc.setFontSize(10);
  doc.text("Generated on: " + new Date().toLocaleDateString(), 14, 26);

  doc.setFontSize(16);
  doc.text("Statement of Financial Position", 14, 40);
  doc.setFontSize(10);
  doc.text(`As of ${new Date(data.asOf).toLocaleDateString()}`, 14, 46);

  let finalY = 50;

  // Assets
  doc.setFontSize(12);
  doc.text("Assets", 14, finalY + 10);

  autoTable(doc, {
    startY: finalY + 12,
    head: [["Description", "Amount (UGX)"]],
    body: [
      ...data.assets.map((a) => [a.name, a.amount.toLocaleString()]),
      [
        { content: "Total Assets", styles: { fontStyle: "bold" } },
        {
          content: data.totalAssets.toLocaleString(),
          styles: { fontStyle: "bold", textColor: [37, 99, 235] },
        },
      ], // Blue
    ],
    theme: "striped",
    headStyles: { fillColor: [37, 99, 235] },
  });

  finalY = doc.lastAutoTable.finalY + 10;

  // Liabilities
  doc.setFontSize(12);
  doc.text("Liabilities", 14, finalY + 10);

  autoTable(doc, {
    startY: finalY + 12,
    head: [["Description", "Amount (UGX)"]],
    body: [
      ...(data.liabilities.length > 0
        ? data.liabilities.map((l) => [l.name, l.amount.toLocaleString()])
        : [["No liabilities recorded", "-"]]),
      [
        { content: "Total Liabilities", styles: { fontStyle: "bold" } },
        {
          content: data.totalLiabilities.toLocaleString(),
          styles: { fontStyle: "bold" },
        },
      ],
    ],
    theme: "striped",
    headStyles: { fillColor: [75, 85, 99] }, // Gray
  });

  finalY = doc.lastAutoTable.finalY + 10;

  // Equity
  doc.setFontSize(12);
  doc.text("Equity", 14, finalY + 10);

  autoTable(doc, {
    startY: finalY + 12,
    head: [["Description", "Amount (UGX)"]],
    body: [
      ...data.equity.map((e) => [e.name, e.amount.toLocaleString()]),
      [
        { content: "Total Equity", styles: { fontStyle: "bold" } },
        {
          content: data.totalEquity.toLocaleString(),
          styles: { fontStyle: "bold", textColor: [147, 51, 234] },
        },
      ], // Purple
    ],
    theme: "striped",
    headStyles: { fillColor: [147, 51, 234] },
  });

  finalY = doc.lastAutoTable.finalY + 15;

  // Total check
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Total Liabilities & Equity", 14, finalY);
  doc.text(
    `UGX ${(data.totalLiabilities + data.totalEquity).toLocaleString()}`,
    150,
    finalY,
    { align: "right" },
  );

  doc.save(`balance_sheet_${new Date().toISOString().split("T")[0]}.pdf`);
};

export const generateTransactionReceiptPDF = (tx: Transaction) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  }) as AutoTable;

  // --- Styling Constants ---
  const primaryColor: [number, number, number] = [79, 70, 229]; // Indigo 600
  const secondaryColor: [number, number, number] = [17, 24, 39]; // Gray 900
  const grayColor: [number, number, number] = [107, 114, 128]; // Gray 500
  // const lightGray: [number, number, number] = [249, 250, 251]; // Gray 50

  // --- Header Background ---
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 50, "F");

  // --- Logo / Branding ---
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(26);
  doc.setFont("helvetica", "bold");
  doc.text("ConnectPay", 20, 28);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Enterprise Payment Gateway", 20, 36);

  // --- Receipt Label ---
  doc.setFontSize(14);
  doc.text("TRANSACTION RECEIPT", 190, 28, { align: "right" });
  doc.setFontSize(10);
  doc.text(`#${tx.txn_ref || tx.id}`, 190, 36, { align: "right" });

  // --- Status Badge ---
  const statusColor: [number, number, number] =
    tx.status === "COMPLETED"
      ? [16, 185, 129] // Emerald
      : tx.status === "FAILED"
        ? [239, 68, 68] // Red
        : [245, 158, 11]; // Amber

  doc.setFillColor(...statusColor);
  doc.roundedRect(85, 55, 40, 8, 2, 2, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(tx.status, 105, 60, { align: "center" });

  // --- Main Amount ---
  doc.setTextColor(...primaryColor);
  doc.setFontSize(40);
  doc.setFont("helvetica", "bold");
  const amountString = `${tx.currency} ${tx.amount.toLocaleString()}`;
  doc.text(amountString, 105, 80, { align: "center" });

  doc.setTextColor(...grayColor);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(new Date(tx.createdAt).toLocaleString(), 105, 90, {
    align: "center",
  });

  // --- Transaction Details Table ---
  autoTable(doc, {
    startY: 100,
    head: [["Detail", "Value"]],
    body: [
      ["Transaction Type", tx.type],
      ["Recipient", tx.displayName],
      ["Payment Method", tx.method],
      ["Category", tx.category],
      ["Transaction Reference", tx.txn_ref || "-"],
    ],
    theme: "striped",
    headStyles: { fillColor: primaryColor },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 80 },
      1: { halign: "right" },
    },
    styles: { fontSize: 10, cellPadding: 5 },
  });

  // --- Payment Breakdown ---
  const fee = tx.fee || tx.amount * 0.01;
  const total = tx.amount + fee;

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 10,
    head: [["Description", "Amount"]],
    body: [
      ["Subtotal", `${tx.currency} ${tx.amount.toLocaleString()}`],
      ["Service Fee", `${tx.currency} ${fee.toLocaleString()}`],
      [
        { content: "Total Paid", styles: { fontStyle: "bold", fontSize: 12 } },
        {
          content: `${tx.currency} ${total.toLocaleString()}`,
          styles: { fontStyle: "bold", fontSize: 12, textColor: primaryColor },
        },
      ],
    ],
    theme: "plain",
    headStyles: { fillColor: [255, 255, 255], textColor: secondaryColor },
    columnStyles: {
      1: { halign: "right" },
    },
    styles: { fontSize: 10, cellPadding: 5 },
  });

  // --- Footer ---
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(9);
  doc.setTextColor(...grayColor);
  doc.setFont("helvetica", "normal");

  doc.text("Thank you for using ConnectPay.", 105, pageHeight - 25, {
    align: "center",
  });
  doc.text(
    "For support, please contact support@connectappbiz.com",
    105,
    pageHeight - 20,
    { align: "center" },
  );

  // Bottom branding line
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(1);
  doc.line(0, pageHeight - 5, 210, pageHeight - 5);

  doc.save(`ConnectPay_Receipt_${tx.txn_ref || tx.id}.pdf`);
};
