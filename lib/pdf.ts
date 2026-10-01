import type { Wallet, Transaction } from "./types";
import { formatCurrency } from "./format";

interface GeneratePDFParams {
  wallets: Wallet[];
  activeWallet?: Wallet | null;
  transactions: Transaction[];
  userEmail?: string | null;
  scope?: "all" | "active";
}

export async function generatePaydayStatement({
  wallets,
  activeWallet,
  transactions,
  userEmail,
  scope = "all",
}: GeneratePDFParams) {
  const { jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Helper to dynamically load font from URL
  const addFontFromUrl = async (
    url: string,
    fontName: string,
    fontStyle: string,
    fileName: string
  ) => {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const buffer = await res.arrayBuffer();

      // Convert ArrayBuffer to Base64
      let binary = "";
      const bytes = new Uint8Array(buffer);
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64 = window.btoa(binary);

      doc.addFileToVFS(fileName, base64);
      doc.addFont(fileName, fontName, fontStyle);
    } catch (err) {
      console.warn(`Could not load custom font ${fontName} (${fontStyle}) from URL: ${url}. Falling back.`, err);
    }
  };

  // Safe font setter helper
  const setSafeFont = (fontName: string, fontStyle: string) => {
    try {
      doc.setFont(fontName, fontStyle);
    } catch {
      doc.setFont("helvetica", fontStyle);
    }
  };

  // Load custom fonts dynamically (with Helvetica fallbacks)
  await Promise.all([
    addFontFromUrl(
      "https://raw.githubusercontent.com/google/fonts/main/ofl/pressstart2p/PressStart2P-Regular.ttf",
      "Press Start 2P",
      "normal",
      "PressStart2P-Regular.ttf"
    ),
    addFontFromUrl(
      "https://raw.githubusercontent.com/google/fonts/main/ofl/pressstart2p/PressStart2P-Regular.ttf",
      "Press Start 2P",
      "bold",
      "PressStart2P-Bold.ttf"
    ),
    addFontFromUrl(
      "https://raw.githubusercontent.com/google/fonts/main/ofl/inter/static/Inter-Regular.ttf",
      "Inter",
      "normal",
      "Inter-Regular.ttf"
    ),
    addFontFromUrl(
      "https://raw.githubusercontent.com/google/fonts/main/ofl/inter/static/Inter-Bold.ttf",
      "Inter",
      "bold",
      "Inter-Bold.ttf"
    ),
  ]);

  console.log("Font List:", doc.getFontList());

  // Color Palette
  const walletColors: [number, number, number][] = [
    [239, 68, 68],    // Red (BPI)
    [34, 197, 94],    // Green (Maya)
    [249, 115, 22],   // Orange (Maribank)
    [14, 165, 233],   // Blue (Gcash)
    [107, 114, 128],  // Grey (Cash)
    [168, 85, 247],   // Purple
    [236, 72, 153],   // Pink
    [234, 179, 8],    // Yellow
    [20, 184, 166],   // Teal
    [99, 102, 241],   // Indigo
  ];

  // Helper to ensure values render cleanly with ₱
  const formatBalanceWithPeso = (val: number): string => {
    const formatted = formatCurrency(val);
    const cleanNumber = formatted.replace(/^[+±₱\s]+/, "");
    return `Php ${cleanNumber}`;
  };

  const formatDMY = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    if (isNaN(d.getTime())) return dateStr;
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  // Determine user's display name
  let userName = "Patrick Meredor";
  if (userEmail) {
    const part = userEmail.split("@")[0];
    userName = part
      .split(/[._\-+]/)
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(" ");
  }

  // Determine scope
  const isAllAccounts = scope === "all" || !activeWallet;
  const targetWallets = isAllAccounts
    ? wallets
    : activeWallet
      ? [activeWallet]
      : wallets;

  const statementTransactions = isAllAccounts
    ? transactions
    : activeWallet
      ? transactions.filter((t) => t.wallet_id === activeWallet.id)
      : transactions;

  // Chronologically sort transactions (newest first)
  const sortedTransactions = [...statementTransactions].sort((a, b) => {
    const timeA = new Date(a.date).getTime();
    const timeB = new Date(b.date).getTime();
    if (timeB !== timeA) return timeB - timeA;
    if (a.created_at && b.created_at) {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    return 0;
  });

  // Date coverage calculation
  let dateCoverageStr = "";
  const txDates = sortedTransactions
    .map((t) => new Date(t.date).getTime())
    .filter((time) => !isNaN(time));

  if (txDates.length > 0) {
    const minDateObj = new Date(Math.min(...txDates));
    const maxDateObj = new Date(Math.max(...txDates));
    dateCoverageStr = `${formatDMY(formatDateISO(minDateObj))} - ${formatDMY(formatDateISO(maxDateObj))}`;
  } else {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    dateCoverageStr = `${formatDMY(formatDateISO(startOfMonth))} - ${formatDMY(formatDateISO(now))}`;
  }

  function formatDateISO(d: Date): string {
    return d.toISOString().slice(0, 10);
  }

  // --- PAGE 1: PROFILE & ACCOUNTS SECTION ---
  // Left Column Details
  setSafeFont("Inter", "bold");
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text(userName, 14, 40);

  setSafeFont("Inter", "normal");
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text(isAllAccounts ? "No. of Accounts: " : "Account: ", 14, 47);
  setSafeFont("Inter", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text(
    isAllAccounts ? String(wallets.length) : (activeWallet?.name || "N/A"),
    isAllAccounts ? 42 : 30,
    47
  );

  setSafeFont("Inter", "normal");
  doc.setTextColor(80, 80, 80);
  doc.text("Date coverage:", 14, 53);
  setSafeFont("Inter", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text(dateCoverageStr, 14, 58);

  // Line below profile details
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(14, 62, 100, 62);

  // Accounts legend list
  const walletListStartY = 68;
  const walletSpacing = 6.5;
  targetWallets.forEach((w, idx) => {
    const walletY = walletListStartY + idx * walletSpacing;
    const originalIdx = wallets.findIndex((item) => item.id === w.id);
    const colorIdx = originalIdx >= 0 ? originalIdx : idx;
    const color = walletColors[colorIdx % walletColors.length];

    // Circle color indicator
    doc.setFillColor(color[0], color[1], color[2]);
    doc.ellipse(17, walletY, 1.5, 1.5, "F");

    // Wallet Name & Balance
    setSafeFont("Inter", "bold");
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text(`${w.name} - ${formatBalanceWithPeso(w.balance)}`, 22, walletY + 1);

    // Thin underline below row
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.15);
    doc.line(14, walletY + 2.5, 60, walletY + 2.5);
  });

  // Right Column: Pie Chart
  const cx = 150;
  const cy = 68;
  const radius = 25;

  if (targetWallets.length === 1) {
    const originalIdx = wallets.findIndex((item) => item.id === targetWallets[0].id);
    const color = walletColors[(originalIdx >= 0 ? originalIdx : 0) % walletColors.length];
    doc.setFillColor(color[0], color[1], color[2]);
    doc.ellipse(cx, cy, radius, radius, "F");
  } else {
    const positiveBalances = targetWallets.map((w) => Math.max(0, w.balance));
    const totalPositive = positiveBalances.reduce((sum, b) => sum + b, 0);

    const proportions = totalPositive > 0
      ? positiveBalances.map((b) => b / totalPositive)
      : targetWallets.map(() => 1 / Math.max(1, targetWallets.length));

    let currentAngle = -Math.PI / 2; // Start at 12 o'clock
    for (let i = 0; i < targetWallets.length; i++) {
      const sliceAngle = proportions[i] * 2 * Math.PI;
      if (sliceAngle <= 0) continue;

      const originalIdx = wallets.findIndex((item) => item.id === targetWallets[i].id);
      const color = walletColors[(originalIdx >= 0 ? originalIdx : i) % walletColors.length];

      const pathOps = [
        { op: "m", c: [cx, cy] }
      ];

      const steps = Math.max(16, Math.ceil(sliceAngle / 0.03));
      for (let j = 0; j <= steps; j++) {
        const angle = currentAngle + sliceAngle * (j / steps);
        const x = cx + radius * Math.cos(angle);
        const y = cy + radius * Math.sin(angle);
        pathOps.push({ op: "l", c: [x, y] });
      }
      pathOps.push({ op: "h", c: [] });

      doc.setFillColor(color[0], color[1], color[2]);
      doc.path(pathOps);
      doc.fill();

      currentAngle += sliceAngle;
    }
  }

  // Calculate dynamic start Y of the Transactions section on Page 1 to avoid overlap
  const walletListEndY = walletListStartY + targetWallets.length * walletSpacing;
  const pieChartEndY = cy + radius;
  const transactionsTitleY = Math.max(112, walletListEndY + 8, pieChartEndY + 8);
  const transactionsLineY = transactionsTitleY + 3;
  const tableStartY = transactionsLineY + 2;

  // Render "Transactions Entries" title on Page 1
  setSafeFont("Inter", "bold");
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  const tableTitle = isAllAccounts
    ? "Transactions Entries"
    : `Transactions Entries (${activeWallet?.name || "Account"})`;
  doc.text(tableTitle, 14, transactionsTitleY);

  // Bold line below title
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(14, transactionsLineY, 196, transactionsLineY);

  // Build rows data
  const txHeaders = [["Transaction date", "Account name", "Category", "Amount", "Description"]];
  const txRows = sortedTransactions.map((t) => {
    const isIncome = t.amount >= 0;
    const cleanAmount = formatBalanceWithPeso(Math.abs(t.amount));
    const formattedAmount = `${isIncome ? "+" : "-"}${cleanAmount}`;
    const walletName = wallets.find((w) => w.id === t.wallet_id)?.name || "N/A";
    return [
      formatDMY(t.date),
      walletName,
      t.category,
      formattedAmount,
      t.description || "",
    ];
  });

  // If there are no transactions, fill with 8 empty rows on Page 1 to match mockup visual design
  if (txRows.length === 0) {
    for (let i = 0; i < 8; i++) {
      txRows.push(["", "", "", "", ""]);
    }
  }

  // Render table
  autoTable(doc, {
    startY: tableStartY,
    head: txHeaders,
    body: txRows,
    theme: "plain",
    margin: { top: 43, bottom: 20, left: 14, right: 14 },
    styles: {
      font: "Inter",
      fontSize: 9,
      textColor: [0, 0, 0],
      cellPadding: 3,
      fillColor: false,
    },
    headStyles: {
      fontStyle: "normal",
      textColor: [0, 0, 0],
    },
    columnStyles: {
      0: { cellWidth: 35, halign: "left" },
      1: { cellWidth: 35, halign: "left" },
      2: { cellWidth: 30, halign: "left" },
      3: { cellWidth: 35, halign: "left" },
      4: { cellWidth: 47, halign: "right" },
    },
    didDrawCell: (data) => {
      // Draw horizontal separator lines at the bottom of headers and cells
      if (data.row.section === "body" || data.row.section === "head") {
        const docObj = data.doc;
        docObj.setDrawColor(200, 200, 200);
        docObj.setLineWidth(0.2);
        docObj.line(
          data.cell.x,
          data.cell.y + data.cell.height,
          data.cell.x + data.cell.width,
          data.cell.y + data.cell.height
        );
      }
    },
  });

  // --- POST-PROCESSING: HEADER & FOOTER ON ALL PAGES ---
  const pageCount = doc.getNumberOfPages();
  const dateObj = new Date();
  const dd = String(dateObj.getDate()).padStart(2, "0");
  const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
  const yyyy = dateObj.getFullYear();
  const dateStr = `Date: ${dd}-${mm}-${yyyy}`;

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    // --- HEADER ---
    // Left: Expense Tracker
    setSafeFont("Press Start 2P", "bold");
    doc.setFontSize(16);
    doc.setTextColor(16, 185, 129); // Green
    doc.text("Expense  Tracker", 14, 18);

    // Right: Statement of Account & Date
    setSafeFont("Inter", "bold");
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    const headerTitle = isAllAccounts
      ? "Statement of Account"
      : `Statement - ${activeWallet?.name || "Account"}`;
    doc.text(headerTitle, 196, 14, { align: "right" });

    setSafeFont("Inter", "normal");
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(dateStr, 196, 19, { align: "right" });

    // Thin divider line below header
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(14, 23, 196, 23);

    // --- FOOTER ---
    // Thin divider line above footer
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.2);
    doc.line(14, 282, 196, 282);

    // Footer text details
    setSafeFont("Inter", "normal");
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text("Thank you for tracking your expenses", 14, 287);
    doc.text(`Page ${i} out of ${pageCount}`, 196, 287, { align: "right" });

    // --- PAGE 2+ TITLE INJECTION ---
    if (i > 1) {
      // Draw Transactions entries header at top of Page 2+
      setSafeFont("Inter", "bold");
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text(tableTitle, 14, 33);

      // Divider line
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.line(14, 36, 196, 36);
    }
  }

  // Save the generated document
  const scopeTag = isAllAccounts
    ? "All_Accounts"
    : (activeWallet?.name || "Account").replace(/[^a-zA-Z0-9_-]/g, "_");
  const filename = `Account_Statement_${scopeTag}_${userName.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}