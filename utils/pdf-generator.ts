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
  doc.text("PayNow", 14, 20);
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
  doc.text("PayNow", 14, 20);
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
