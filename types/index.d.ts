declare global {
  type UserRole = "USER" | "ADMIN";

  type TransactionStatus = "COMPLETED" | "PENDING" | "FAILED" | "DISPUTED";

  type TransactionType =
    | "DEPOSIT"
    | "WITHDRAWAL"
    | "TRANSFER"
    | "PAYMENT"
    | "SUBSCRIPTION";

  interface Transaction {
    id: string;
    date: string;
    userId: number;
    amount: number;
    currency: "UGX" | "USD";
    type: TransactionType;
    status: TransactionStatus;
    recipient: string;
    category: string; // e.g., 'Transport', 'Rent', 'Utilities'
    method: string; // e.g., 'MTN Mobile Money', 'Visa **** 4242'
    txn_ref?: string;
  }

  interface Wallet {
    balance: number;
    id: string;
    createdAt?: string;
    updatedAt?: string;
    userId?: number;
  }

  type Privilege = "none" | "super_admin" | "admin";

  interface User {
    id: number;
    name: string;
    email: string;
    privilege: Privilege;
    status: boolean;
    wallet?: Wallet;
    created_at: string;
    tel?: string;
    address?: string;
    // kycStatus: "VERIFIED" | "PENDING" | "UNVERIFIED" | "REJECTED";
    // wallet: Wallet;
    // joinDate?: string;
  }

  interface SessionUser {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  }
  interface AnalyticsData {
    name: string;
    value: number;
  }

  interface AuditLog {
    id: string;
    action: string;
    admin: string;
    timestamp: string;
    details: string;
    ip?: string;
  }

  // New Types for Developer Features
  interface ApiKey {
    id: string;
    name: string;
    key: string;
    type: "PUBLIC" | "SECRET";
    created: string;
    lastUsed: string;
    masked: boolean;
    usageToday: number;
    rateLimitRemaining: number;
    usageHistory: { date: string; count: number }[];
  }

  interface WebhookEndpoint {
    id: string;
    url: string;
    events: string[];
    status: "ACTIVE" | "INACTIVE";
    secret: string;
    created: string;
  }

  interface WebhookLog {
    id: string;
    endpointId: string;
    event: string;
    status: number;
    timestamp: string;
    duration: number;
  }

  type NotificationType = "ALERT" | "INFO" | "SUCCESS";

  interface Notifications {
    id: string;
    type: NotificationType;
    message: string;
  }

  interface SystemNotification {
    id: string;
    userId: number;
    title: string;
    message: string;
    type: NotificationType;
    read: boolean;
    createdAt: Date;
    path: string;
  }

  // New Types for Admin Modules
  interface Dispute {
    id: string;
    transactionId: string;
    user: string;
    amount: number;
    currency: Currency;
    reason: string;
    status: "OPEN" | "RESOLVED" | "REJECTED";
    date: string;
    evidence?: string;
  }

  interface Fee {
    id: string;
    name: string;
    type: "PERCENTAGE" | "FIXED";
    value: number;
    currency?: Currency;
    category: "DEPOSIT" | "WITHDRAWAL" | "TRANSFER" | "PAYMENT" | "API";
    active: boolean;
    lastUpdated: string;
  }
  type NotificationFilter = "ALL" | "ALERT" | "INFO" | "SUCCESS";
  interface PaymentModalProps {
    isOpen: boolean;
    type: "deposit" | "withdraw";
  }

  interface StatCardProps {
    title: string;
    value: string;
    subValue?: string;
    icon: LucideIcon;
    trend?: "up" | "down";
    trendValue?: string;
    color?: string;
  }
  type SecurityTab = "profile" | "security";

  type Currency = "UGX" | "USD";
}

// This export is needed to make the file a module
export {};
