// const UserRole = typeof UserRole.USER
export const currentUser: User = {
  id: Number("u123"),
  name: "Alex Mukasa",
  email: "alex.m@example.com",
  privilege: "super_admin",
  status: false,
  created_at: "2023-01-15",
  wallet: {
    balance: 2540000,
    id: "ret54",
    // balanceUSD: 1250,
    // linkedMethods: [],
  },
};

export const linkedMethods = [
  {
    id: "m1",
    type: "MOBILE_MONEY",
    name: "MTN MoMo",
    detail: "+256 772 *** 888",
  },
  { id: "m2", type: "CARD", name: "Visa Debit", detail: "**** 4242" },
];

export const adminUser: User = {
  ...currentUser,
  name: "Admin User",
  // role: "ADMIN",
};

// Expanded User List for Admin
export const mockUsers: User[] = [
  currentUser,
  {
    id: Number("u124"),
    name: "Sarah N",
    email: "sarah.n@example.com",
    privilege: "admin",
    status: false,
    created_at: "2023-10-20",
    wallet: { balance: 0, id: "trt" },
  },
  {
    id: Number("u125"),
    name: "John Doe",
    email: "john.d@company.com",
    privilege: "admin",
    status: true,
    created_at: "2023-10-22",
    wallet: { balance: 5000, id: "657t" },
  },
  {
    id: Number("u126"),
    name: "Tech Solutions Ltd",
    email: "billing@techsol.com",
    privilege: "super_admin",
    status: true,
    created_at: "2023-05-10",
    wallet: { balance: 15000000, id: "trt56" },
  },
  {
    id: Number("u127"),
    name: "Grace K",
    email: "grace.k@example.com",
    privilege: "admin",
    status: true,
    created_at: "2023-09-01",
    wallet: { balance: 12000, id: "tytrd" },
  },
];

// Helper to generate additional mock transactions
// Using seeded random to ensure consistent data between server and client
const seededRandom = (seed: number) => {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
};

const generateMockTransactions = (count: number): Transaction[] => {
  const categories = [
    "Transport",
    "Rent",
    "Utilities",
    "Entertainment",
    "Groceries",
    "Shopping",
    "Dining",
    "Business",
  ];
  const methods = [
    "MTN MoMo",
    "Airtel Money",
    "Visa **** 4242",
    "Mastercard **** 8899",
    "Wallet Transfer",
  ];
  const recipients = [
    "Uber",
    "Jumia Food",
    "Shell Station",
    "National Water",
    "Umeme Ltd",
    "Netflix",
    "Shoprite",
    "KFC",
    "Cafe Javas",
    "Total Energies",
  ];

  const random = seededRandom(12345); // Fixed seed for consistency

  return Array.from({ length: count }).map((_, i) => ({
    id: `tx_gen_${i}`,
    date: new Date(
      Date.now() - Math.floor(random() * 60) * 24 * 60 * 60 * 1000,
    ).toISOString(),
    amount: Math.floor(random() * 200000) + 5000,
    currency: random() > 0.9 ? "USD" : "UGX",
    type: random() > 0.7 ? "PAYMENT" : random() > 0.5 ? "DEPOSIT" : "TRANSFER",
    status: random() > 0.9 ? "FAILED" : "COMPLETED",
    recipient: recipients[Math.floor(random() * recipients.length)],
    category: categories[Math.floor(random() * categories.length)],
    method: methods[Math.floor(random() * methods.length)],
  }));
};

const initialTransactions: Transaction[] = [
  {
    id: "tx_001",
    date: "2023-10-25T10:30:00",
    amount: 50000,
    currency: "UGX",
    type: "PAYMENT",
    status: "COMPLETED",
    recipient: "Global Bus Co.",
    category: "Transport",
    method: "MTN MoMo",
  },
  {
    id: "tx_002",
    date: "2023-10-24T14:15:00",
    amount: 1500000,
    currency: "UGX",
    type: "PAYMENT",
    status: "COMPLETED",
    recipient: "Kampala Heights Apts",
    category: "Rent",
    method: "Visa **** 4242",
  },
  {
    id: "tx_003",
    date: "2023-10-23T09:00:00",
    amount: 50,
    currency: "USD",
    type: "SUBSCRIPTION",
    status: "COMPLETED",
    recipient: "Netflix Services",
    category: "Entertainment",
    method: "Direct Wallet",
  },
  {
    id: "tx_004",
    date: "2023-10-22T16:45:00",
    amount: 200000,
    currency: "UGX",
    type: "WITHDRAWAL",
    status: "PENDING",
    recipient: "Airtel Money",
    category: "Withdrawal",
    method: "Wallet Transfer",
  },
  {
    id: "tx_005",
    date: "2023-10-21T11:20:00",
    amount: 500000,
    currency: "UGX",
    type: "TRANSFER",
    status: "DISPUTED",
    recipient: "John Doe",
    category: "P2P",
    method: "Wallet Transfer",
  },
];

export const transactions: Transaction[] = [
  ...initialTransactions,
  ...generateMockTransactions(45),
].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

// Enhanced Revenue Data for Composed Charts (Admin)
export const revenueData = [
  { name: "Mon", revenue: 4200, volume: 145, previous: 3800 },
  { name: "Tue", revenue: 3500, volume: 132, previous: 3600 },
  { name: "Wed", revenue: 5100, volume: 180, previous: 4100 },
  { name: "Thu", revenue: 4800, volume: 170, previous: 4400 },
  { name: "Fri", revenue: 6200, volume: 240, previous: 5100 },
  { name: "Sat", revenue: 7400, volume: 290, previous: 6300 },
  { name: "Sun", revenue: 6900, volume: 265, previous: 6500 },
];

export const monthlyRevenueData = [
  { name: "Week 1", revenue: 28000, volume: 950, previous: 25000 },
  { name: "Week 2", revenue: 32000, volume: 1100, previous: 27000 },
  { name: "Week 3", revenue: 29500, volume: 980, previous: 28500 },
  { name: "Week 4", revenue: 38000, volume: 1350, previous: 31000 },
];

// User Spending Data (User)
export const userSpendingData = [
  { name: "Mon", spend: 45000, income: 150000 },
  { name: "Tue", spend: 23000, income: 0 },
  { name: "Wed", spend: 12000, income: 50000 },
  { name: "Thu", spend: 85000, income: 0 },
  { name: "Fri", spend: 120000, income: 500000 },
  { name: "Sat", spend: 65000, income: 0 },
  { name: "Sun", spend: 34000, income: 0 },
];

export const successRateData = [
  { name: "00:00", rate: 99.2 },
  { name: "04:00", rate: 99.5 },
  { name: "08:00", rate: 98.1 },
  { name: "12:00", rate: 97.5 },
  { name: "16:00", rate: 98.8 },
  { name: "20:00", rate: 99.1 },
  { name: "23:59", rate: 99.4 },
];

export const categoryData = [
  { name: "Transport", value: 400, color: "#4F46E5" },
  { name: "Rent/Housing", value: 300, color: "#10B981" },
  { name: "Utilities", value: 300, color: "#F59E0B" },
  { name: "Entertainment", value: 200, color: "#EF4444" },
  { name: "Groceries", value: 150, color: "#8B5CF6" },
];

// New Data: Hourly Traffic Analysis for Heatmap/Bar
export const hourlyTrafficData = [
  { hour: "6am", transactions: 45 },
  { hour: "8am", transactions: 120 },
  { hour: "10am", transactions: 280 },
  { hour: "12pm", transactions: 350 },
  { hour: "2pm", transactions: 310 },
  { hour: "4pm", transactions: 290 },
  { hour: "6pm", transactions: 410 },
  { hour: "8pm", transactions: 380 },
  { hour: "10pm", transactions: 150 },
];

// New Data: Payment Method Performance
export const paymentMethodStats = [
  { method: "Mobile Money", usage: 65, success: 98, color: "#F59E0B" },
  { method: "Credit Card", usage: 25, success: 94, color: "#4F46E5" },
  { method: "Bank Transfer", usage: 10, success: 91, color: "#10B981" },
];

export const auditLogs: AuditLog[] = [
  {
    id: "log_1",
    action: "Fee Change",
    admin: "SuperAdmin",
    timestamp: "2023-10-25 09:00",
    details: "Changed withdrawal fee from 1.5% to 1.2%",
    ip: "192.168.1.1",
  },
  {
    id: "log_2",
    action: "Refund Approved",
    admin: "SupportLead",
    timestamp: "2023-10-24 16:30",
    details: "Refunded TX #99281 due to double charge",
    ip: "192.168.1.4",
  },
  {
    id: "log_3",
    action: "KYC Override",
    admin: "ComplianceOfficer",
    timestamp: "2023-10-24 11:15",
    details: "Manually verified ID for user u888",
    ip: "192.168.1.2",
  },
  {
    id: "log_4",
    action: "API Key Revoke",
    admin: "System",
    timestamp: "2023-10-23 14:20",
    details: "Revoked compromised key pk_live_...992",
    ip: "10.0.0.1",
  },
  {
    id: "log_5",
    action: "User Suspended",
    admin: "SuperAdmin",
    timestamp: "2023-10-22 09:45",
    details: "Suspended user u991 for suspicious activity",
    ip: "192.168.1.1",
  },
];

const generateUsageHistory = (base: number, variance: number) => {
  const random = seededRandom(54321); // Different seed for variety
  return Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return {
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      count: Math.max(0, base + Math.floor((random() - 0.5) * variance)),
    };
  });
};

export const mockApiKeys: ApiKey[] = [
  {
    id: "key_1",
    name: "Production Web",
    key: "pk_live_8923...9211",
    type: "PUBLIC",
    created: "2023-08-15",
    lastUsed: "Just now",
    masked: true,
    usageToday: 14205,
    rateLimitRemaining: 85795,
    usageHistory: generateUsageHistory(14000, 5000),
  },
  {
    id: "key_2",
    name: "Backend Service",
    key: "sk_live_1122...3344",
    type: "SECRET",
    created: "2023-08-15",
    lastUsed: "2 hours ago",
    masked: true,
    usageToday: 850,
    rateLimitRemaining: 99150,
    usageHistory: generateUsageHistory(800, 300),
  },
  {
    id: "key_3",
    name: "Test Key",
    key: "pk_test_5544...2211",
    type: "PUBLIC",
    created: "2023-09-01",
    lastUsed: "Yesterday",
    masked: true,
    usageToday: 0,
    rateLimitRemaining: 100000,
    usageHistory: generateUsageHistory(0, 50),
  },
];

export const mockWebhooks: WebhookEndpoint[] = [
  {
    id: "wh_1",
    url: "https://api.myshop.com/webhooks/paynow",
    events: ["payment.success", "payment.failed"],
    status: "ACTIVE",
    secret: "whsec_...",
    created: "2023-08-20",
  },
  {
    id: "wh_2",
    url: "https://staging.myshop.com/hooks",
    events: ["*"],
    status: "INACTIVE",
    secret: "whsec_...",
    created: "2023-09-10",
  },
];

export const mockWebhookLogs: WebhookLog[] = [
  {
    id: "wl_1",
    endpointId: "wh_1",
    event: "payment.success",
    status: 200,
    timestamp: "2023-10-25 10:30:05",
    duration: 120,
  },
  {
    id: "wl_2",
    endpointId: "wh_1",
    event: "payment.failed",
    status: 200,
    timestamp: "2023-10-25 09:15:22",
    duration: 95,
  },
  {
    id: "wl_3",
    endpointId: "wh_1",
    event: "payout.processed",
    status: 404,
    timestamp: "2023-10-24 16:40:10",
    duration: 45,
  },
];

export const mockDisputes: Dispute[] = [
  {
    id: "dp_001",
    transactionId: "tx_005",
    user: "John Doe",
    amount: 500000,
    currency: "UGX",
    reason: "Duplicate charge detected",
    status: "OPEN",
    date: "2023-10-21",
    evidence: "Receipt image uploaded",
  },
  {
    id: "dp_002",
    transactionId: "tx_882",
    user: "Sarah N",
    amount: 150000,
    currency: "UGX",
    reason: "Service not received",
    status: "OPEN",
    date: "2023-10-20",
  },
  {
    id: "dp_003",
    transactionId: "tx_771",
    user: "Alex Mukasa",
    amount: 25,
    currency: "USD",
    reason: "Unauthorized transaction",
    status: "RESOLVED",
    date: "2023-10-18",
  },
];

export const mockFees: Fee[] = [
  {
    id: "fee_1",
    name: "Mobile Money Withdrawal",
    type: "PERCENTAGE",
    value: 1.5,
    category: "WITHDRAWAL",
    active: true,
    lastUpdated: "2023-09-01",
  },
  {
    id: "fee_2",
    name: "Card Payment Processing",
    type: "PERCENTAGE",
    value: 2.9,
    category: "PAYMENT",
    active: true,
    lastUpdated: "2023-08-15",
  },
  {
    id: "fee_3",
    name: "Wallet Transfer (P2P)",
    type: "FIXED",
    value: 500,
    currency: "UGX",
    category: "TRANSFER",
    active: true,
    lastUpdated: "2023-01-10",
  },
  {
    id: "fee_4",
    name: "API Call Overage",
    type: "FIXED",
    value: 10,
    currency: "UGX",
    category: "API",
    active: false,
    lastUpdated: "2023-05-20",
  },
];

// Helper to generate notifications
const generateNotifications = (count: number) => {
  const titles = [
    "New Login",
    "Payment Received",
    "Withdrawal Successful",
    "System Update",
    "Policy Change",
    "Security Alert",
  ];
  const messages = [
    "Detected login from new device.",
    "Received UGX 50,000 from Jane.",
    "Your withdrawal has been processed.",
    "Maintenance scheduled for tonight.",
    "Updated privacy policy available.",
    "Suspicious activity detected.",
  ];
  const types = [
    "INFO",
    "SUCCESS",
    "SUCCESS",
    "INFO",
    "INFO",
    "ALERT",
  ] as const;

  return Array.from({ length: count }).map((_, i) => ({
    id: `n_gen_${i}`,
    title: titles[i % titles.length],
    message: messages[i % messages.length],
    time: `${i + 1} ${i === 0 ? "hour" : "hours"} ago`,
    read: i > 2, // First 3 unread
    type: types[i % types.length],
  }));
};

export const mockSystemNotifications: SystemNotification[] = [
  {
    id: "n1",
    title: "High Value Transaction",
    message: "A transaction of UGX 1,500,000 was successfully processed.",
    time: "2 mins ago",
    read: false,
    type: "SUCCESS",
  },
  {
    id: "n2",
    title: "Login Attempt",
    message: "New login detected from Chrome on Windows.",
    time: "1 hour ago",
    read: false,
    type: "INFO",
  },
  {
    id: "n3",
    title: "KYC Update Required",
    message: "Your Tier 2 verification documents need attention.",
    time: "3 hours ago",
    read: true,
    type: "ALERT",
  },
  {
    id: "n4",
    title: "Weekly Report",
    message: "Your weekly transaction summary is ready to view.",
    time: "1 day ago",
    read: true,
    type: "INFO",
  },
  ...generateNotifications(25),
];
