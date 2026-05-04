# Graph Report - paynow-gateway  (2026-05-04)

## Corpus Check
- 228 files · ~158,845 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 466 nodes · 417 edges · 17 communities detected
- Extraction: 70% EXTRACTED · 30% INFERRED · 0% AMBIGUOUS · INFERRED: 124 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]

## God Nodes (most connected - your core abstractions)
1. `getUserSession()` - 43 edges
2. `processP2PTransfer()` - 8 edges
3. `seedDatabase()` - 7 edges
4. `getAdmins()` - 6 edges
5. `VerifyUserOtp()` - 6 edges
6. `sendOtp()` - 6 edges
7. `getTransactionFee()` - 6 edges
8. `finalizeDeposit()` - 6 edges
9. `UserDashboardPage()` - 5 edges
10. `getAdminDashboardStats()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `fetchUser()` --calls--> `getUserSession()`  [INFERRED]
  components\global\ActivityLog.tsx → lib\actions\session.ts
- `getAdminDashboardStats()` --calls--> `getWalletBalanceBeforeDate()`  [INFERRED]
  lib\actions\admin.ts → lib\actions\wallet.ts
- `getUserRecentTransactions()` --calls--> `getUserSession()`  [INFERRED]
  lib\actions\disputes.ts → lib\actions\session.ts
- `getTransactionByReference()` --calls--> `getUserSession()`  [INFERRED]
  lib\actions\transactions.ts → lib\actions\session.ts
- `AuthLayout()` --calls--> `getUserSession()`  [INFERRED]
  app\(auth)\layout.tsx → lib\actions\session.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (28): createSystemUser(), deleteUser(), getAdminDashboardStats(), getAdminIncomeBreakdown(), getPaginatedUsers(), getPeakTrafficData(), getRevenueVolumeData(), getSystemCategoryDistribution() (+20 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (21): getAdmins(), getDashboardStats(), sendDepositEmail(), sendSenderTransferEmail(), sendTransferEmail(), getTransactionFee(), createPaymentIntent(), findUserByEmailOrPhone() (+13 more)

### Community 2 - "Community 2"
Cohesion: 0.1
Nodes (15): gotoReset(), initPasswordReset(), login(), loginNow(), resetPassword(), VerifyUserOtp(), sendOtp(), createSession() (+7 more)

### Community 3 - "Community 3"
Cohesion: 0.09
Nodes (9): deleteAllNotifications(), deleteNotification(), markAllNotificationsAsRead(), markNotificationAsRead(), fetchUser(), handleDelete(), handleMarkAsRead(), handleClear() (+1 more)

### Community 4 - "Community 4"
Cohesion: 0.1
Nodes (10): getAnalyticsData(), getDashboardAnalyticsData(), createP2PTransaction(), getTransactionByReference(), getTransactions(), Analytics(), UserDashboardPage(), Transactions() (+2 more)

### Community 5 - "Community 5"
Cohesion: 0.15
Nodes (10): addTransactionFee(), deleteTransactionFee(), getAllTransactionFees(), toggleTransactionFee(), updateTransactionFee(), deleteFee(), handleAddFee(), handleToggleActive() (+2 more)

### Community 6 - "Community 6"
Cohesion: 0.13
Nodes (10): createTicket(), getAllTickets(), getUserRecentTransactions(), getUserTickets(), resolveTicket(), notifyAdmins(), handleResolve(), Disputes() (+2 more)

### Community 7 - "Community 7"
Cohesion: 0.26
Nodes (10): generateUsageHistory(), seededRandom(), generateTxRef(), seedAuditLogs(), seedDatabase(), seedDisputes(), seedPaymentMethods(), seedSystemNotifications() (+2 more)

### Community 8 - "Community 8"
Cohesion: 0.23
Nodes (7): checkConnectivity(), getLoadingLabel(), getToolInvocations(), handleKeyPress(), handleOffline(), handleOnline(), handleSend()

### Community 9 - "Community 9"
Cohesion: 0.24
Nodes (5): getBalanceSheet(), getIncomeStatement(), BalanceSheetPage(), IncomeStatementPage(), getLastMonthRange()

### Community 10 - "Community 10"
Cohesion: 0.22
Nodes (5): updateSystemUser(), handleDeleteUser(), handleSaveUser(), handleSoftDelete(), handleStatusChange()

### Community 11 - "Community 11"
Cohesion: 0.18
Nodes (2): handleDownloadReceipt(), generateTransactionReceiptPDF()

### Community 12 - "Community 12"
Cohesion: 0.25
Nodes (4): updatePassword(), updateUserInfo(), handleSaveProfile(), handlePasswordUpdate()

### Community 13 - "Community 13"
Cohesion: 0.29
Nodes (4): deleteSession(), logout(), handleLogout(), clearAllStores()

### Community 17 - "Community 17"
Cohesion: 0.5
Nodes (2): menuItems(), Sidebar()

### Community 20 - "Community 20"
Cohesion: 0.5
Nodes (2): ThemeInitializer(), useThemeInitializer()

### Community 21 - "Community 21"
Cohesion: 1.0
Nodes (2): POST(), systemPrompt()

## Knowledge Gaps
- **Thin community `Community 11`** (11 nodes): `TransactionTable.tsx`, `copyToClipboard()`, `getStatusColor()`, `getStatusIcon()`, `handleDownloadReceipt()`, `handlePageChange()`, `toggleExpand()`, `generateBalanceSheetPDF()`, `generateIncomeStatementPDF()`, `generateTransactionReceiptPDF()`, `pdf-generator.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 17`** (4 nodes): `Sidebar.tsx`, `menuItems()`, `menu.ts`, `Sidebar()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 20`** (4 nodes): `ThemeInitializer.tsx`, `ThemeInitializer()`, `theme.ts`, `useThemeInitializer()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 21`** (3 nodes): `route.ts`, `POST()`, `systemPrompt()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getUserSession()` connect `Community 0` to `Community 1`, `Community 3`, `Community 4`, `Community 6`, `Community 9`, `Community 10`, `Community 12`, `Community 13`, `Community 21`?**
  _High betweenness centrality (0.184) - this node is a cross-community bridge._
- **Why does `getTransactionFee()` connect `Community 1` to `Community 4`, `Community 5`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **Why does `processP2PTransfer()` connect `Community 1` to `Community 0`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **Are the 42 inferred relationships involving `getUserSession()` (e.g. with `AuthLayout()` and `POST()`) actually correct?**
  _`getUserSession()` has 42 INFERRED edges - model-reasoned connections that need verification._
- **Are the 6 inferred relationships involving `processP2PTransfer()` (e.g. with `handleConfirmTransfer()` and `getUserSession()`) actually correct?**
  _`processP2PTransfer()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **Are the 5 inferred relationships involving `getAdmins()` (e.g. with `updatePassword()` and `updateUserInfo()`) actually correct?**
  _`getAdmins()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `VerifyUserOtp()` (e.g. with `handleVerifyOtp()` and `verifyOTP()`) actually correct?**
  _`VerifyUserOtp()` has 3 INFERRED edges - model-reasoned connections that need verification._