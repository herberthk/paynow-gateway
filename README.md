# PayNow Gateway

A modern, full-featured payment gateway platform built with Next.js, designed for the Ugandan market with support for mobile money, card payments, and bank transfers.

![Next.js](https://img.shields.io/badge/Next.js-16.1.4-black?logo=next.js)
![React](https://img.shields.io/badge/React-19.2.3-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38bdf8?logo=tailwindcss)

## 🌟 Features

### For Users

- **💰 Multi-Currency Wallet** - Manage UGX and USD balances in one place
- **📊 Transaction Dashboard** - Track all your payments, deposits, withdrawals, and transfers
- **📈 Analytics & Insights** - Visualize spending patterns and income trends
- **🔐 KYC Verification** - Secure identity verification system with multiple tiers
- **💳 Multiple Payment Methods** - Support for Mobile Money (MTN, Airtel), Cards, and Bank Transfers
- **🔔 Real-time Notifications** - Stay updated on all account activities
- **🤖 AI Assistant** - Powered by Google Gemini for intelligent support
- **🌓 Dark Mode** - Beautiful dark/light theme with smooth transitions

### For Administrators

- **👥 User Management** - Comprehensive user profiles and KYC oversight
- **💸 Transaction Monitoring** - Real-time transaction tracking and analytics
- **⚖️ Dispute Resolution** - Handle transaction disputes efficiently
- **💵 Fee Management** - Configure and manage transaction fees
- **📋 Audit Logs** - Complete activity tracking for compliance
- **📊 Advanced Analytics** - Revenue tracking, success rates, and payment method performance
- **🔍 System Monitoring** - Hourly traffic analysis and performance metrics

### For Developers

- **🔑 API Key Management** - Generate and manage public/secret API keys
- **📡 Webhook Configuration** - Set up event-driven integrations
- **📈 Usage Analytics** - Track API usage with rate limiting
- **🔒 Secure Authentication** - JWT-based session management
- **📚 Developer Documentation** - Comprehensive API documentation

## 🚀 Tech Stack

- **Framework:** [Next.js 16.1.4](https://nextjs.org/) (App Router)
- **UI Library:** [React 19.2.3](https://react.dev/)
- **Language:** [TypeScript 5](https://www.typescriptlang.org/)
- **Styling:** [TailwindCSS 4](https://tailwindcss.com/)
- **Charts:** [Recharts 3.5.1](https://recharts.org/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **State Management:** [Zustand 5.0.10](https://zustand-demo.pmnd.rs/)
- **AI Integration:** [Google Gemini AI](https://ai.google.dev/)
- **PDF Generation:** [jsPDF 2.5.1](https://github.com/parallax/jsPDF)
- **Authentication:** [jose 6.1.3](https://github.com/panva/jose) (JWT)
- **Markdown:** [react-markdown 9](https://github.com/remarkjs/react-markdown)

## 📋 Prerequisites

- **Node.js** 20.x or higher
- **Bun** (recommended) or npm/yarn/pnpm
- **Google Gemini API Key** (for AI assistant features)

## 🛠️ Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/herberthk/paynow-gateway.git
   cd paynow-gateway
   ```

2. **Install dependencies**

   ```bash
   bun install
   # or
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:

   ```env
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
   SESSION_SECRET=your_session_secret_here
   ```

   - `NEXT_PUBLIC_GEMINI_API_KEY`: Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - `SESSION_SECRET`: Generate a secure random string (minimum 32 characters)

4. **Run the development server**

   ```bash
   bun dev
   # or
   npm run dev
   ```

5. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
paynow-gateway/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Authentication pages
│   │   ├── page.tsx         # Login page
│   │   ├── register/        # Registration
│   │   ├── forgot-password/ # Password recovery
│   │   └── email-sent/      # Email confirmation
│   ├── dashboard/           # Protected dashboard routes
│   │   ├── user/            # User dashboard pages
│   │   │   ├── analytics/
│   │   │   ├── developers/
│   │   │   ├── notifications/
│   │   │   ├── settings/
│   │   │   ├── transactions/
│   │   │   └── wallet/
│   │   └── admin/           # Admin dashboard pages
│   │       ├── analytics/
│   │       ├── disputes/
│   │       ├── kyc/
│   │       ├── logs/
│   │       ├── profile/
│   │       ├── settings/
│   │       └── transactions/
│   ├── api/                 # API routes
│   ├── layout.tsx           # Root layout
│   ├── globals.css          # Global styles
│   └── not-found.tsx        # 404 page
├── components/              # React components
│   ├── ActivityLog.tsx
│   ├── AdminDashboard.tsx
│   ├── AdminTransactions.tsx
│   ├── AdminUsersKYC.tsx
│   ├── AdminDisputes.tsx
│   ├── AdminFeeManagement.tsx
│   ├── AdminAuditLogs.tsx
│   ├── DashboardAssistant.tsx  # AI-powered assistant
│   ├── DashboardCharts.tsx
│   ├── DeveloperHub.tsx
│   ├── Header.tsx
│   ├── KYCModule.tsx
│   ├── NotificationPopup.tsx
│   ├── PaymentModal.tsx
│   ├── Sidebar.tsx
│   ├── StatCard.tsx
│   ├── ThemeInitializer.tsx
│   ├── Toast.tsx
│   ├── TransactionTable.tsx
│   ├── UserAnalytics.tsx
│   ├── UserDashboard.tsx
│   └── WalletView.tsx
├── constants/               # App constants
│   ├── index.ts
│   └── menu.ts             # Navigation menu config
├── context/                # React contexts
├── lib/                    # Utility libraries
│   ├── helpers.ts
│   ├── index.ts
│   └── session.ts          # JWT session management
├── services/               # Business logic
│   └── mockData.ts         # Mock data for development
├── store/                  # Zustand state management
│   ├── app.ts              # App state
│   ├── notification.ts     # Notification state
│   ├── theme.ts            # Theme state
│   └── index.ts
├── types/                  # TypeScript definitions
│   └── index.d.ts          # Global type definitions
├── utils/                  # Helper functions
│   ├── helpers.ts
│   └── index.ts
└── public/                 # Static assets
```

## 🔐 Authentication

The application uses JWT-based authentication with the following features:

- **Session Management:** Secure JWT tokens stored in HTTP-only cookies
- **Role-Based Access:** Separate dashboards for users and administrators
- **Protected Routes:** Automatic redirection for unauthenticated users
- **Password Recovery:** Email-based password reset flow

### Demo Credentials

**User Account:**

- Email: `alex.m@example.com`
- Role: USER
- Features: Wallet, Transactions, Analytics, Developer Tools

**Admin Account:**

- Email: `admin@paynow.com`
- Role: ADMIN
- Features: All user features + User Management, Disputes, Fee Management, Audit Logs

## 💾 Data Management

Currently, the application uses mock data for development purposes (see `services/mockData.ts`). The data includes:

- **Users:** Sample user accounts with different KYC statuses
- **Transactions:** 50+ generated transactions with various types and statuses
- **Wallet Data:** Multi-currency balances and linked payment methods
- **API Keys:** Mock API keys with usage statistics
- **Webhooks:** Sample webhook endpoints and logs
- **Disputes:** Transaction dispute records
- **Fees:** Configurable fee structures

### Integrating a Real Backend

To connect to a real backend:

1. Create API routes in `app/api/`
2. Replace mock data imports with API calls
3. Update authentication to use your backend's auth system
4. Configure environment variables for API endpoints

## 🎨 Theming

The application supports dark and light modes with:

- **Persistent Theme:** Theme preference saved to localStorage
- **System Preference Detection:** Respects OS theme settings
- **Smooth Transitions:** Animated theme switching
- **SSR-Safe:** No flash of unstyled content

Toggle theme using the button in the header.

## 🤖 AI Assistant

The integrated AI assistant powered by Google Gemini provides:

- **Transaction Insights:** Analyze spending patterns
- **Payment Help:** Assistance with payment processes
- **Account Information:** Quick answers about your account
- **Markdown Support:** Rich formatted responses
- **Context-Aware:** Understands your current dashboard context

## 📊 Available Scripts

```bash
# Development
bun dev          # Start development server
npm run dev

# Production
bun run build    # Build for production
bun start        # Start production server
npm run build
npm start

# Linting
bun run lint     # Run ESLint
npm run lint
```

## 🌍 Supported Payment Methods

### Mobile Money

- **MTN Mobile Money** - Uganda's leading mobile money service
- **Airtel Money** - Alternative mobile money provider

### Cards

- **Visa** - Credit and debit cards
- **Mastercard** - Credit and debit cards

### Bank Transfers

- Direct bank account transfers
- Instant bank verification

## 🔒 Security Features

- **JWT Authentication:** Secure token-based authentication
- **Session Management:** Encrypted session storage
- **HTTPS Only:** Production deployment requires HTTPS
- **Rate Limiting:** API rate limiting for abuse prevention
- **Input Validation:** Comprehensive input sanitization
- **CORS Protection:** Configured CORS policies
- **XSS Prevention:** React's built-in XSS protection

## 📈 Analytics & Reporting

### User Analytics

- Spending trends over time
- Income vs. expenses comparison
- Category-wise breakdown
- Transaction history export

### Admin Analytics

- Revenue tracking (daily, weekly, monthly)
- Transaction success rates
- Payment method performance
- Hourly traffic analysis
- User growth metrics

## 🚧 Roadmap

- [ ] Real backend integration
- [ ] Email notifications
- [ ] SMS notifications for transactions
- [ ] Multi-factor authentication (MFA)
- [ ] Advanced fraud detection
- [ ] Recurring payments/subscriptions
- [ ] QR code payments
- [ ] Mobile app (React Native)
- [ ] Internationalization (i18n)
- [ ] Advanced reporting and exports

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Herbert Kavuma**

- GitHub: [@herberthk](https://github.com/herberthk)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Vercel](https://vercel.com/) - Deployment platform
- [Google Gemini](https://ai.google.dev/) - AI capabilities
- [Lucide](https://lucide.dev/) - Beautiful icons
- [Recharts](https://recharts.org/) - Charting library

## 📞 Support

For support, email support@paynow.com or open an issue in the GitHub repository.

---

**Built with ❤️ for the Ugandan fintech ecosystem**
