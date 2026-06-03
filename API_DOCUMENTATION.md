# PayNow Gateway API Reference (v1)

This documentation provides details on all available versioned API routes (`/api/v1`) designed for third-party integrations, clients, and agents.

All endpoints require:
- **Method**: `POST`
- **Headers**:
  ```http
  Content-Type: application/json
  ```
- **Authentication**: Simulated authentication by providing the target client's user identifier (`userId`) in the JSON payload body.

---

## Table of Contents
1. [Wallet Operations](#1-wallet-operations)
   - [Get Wallet Balance](#get-wallet-balance)
   - [Mobile Money Deposit](#mobile-money-deposit)
   - [Stripe Card Deposit (createPaymentIntent)](#stripe-card-deposit-createpaymentintent)
   - [Internal P2P Transfer](#internal-p2p-transfer)
   - [Search Users](#search-users)
2. [Transaction Operations](#2-transaction-operations)
   - [Get Transaction History (Paginated)](#get-transaction-history-paginated)
   - [Get Transaction By Wallet Reference](#get-transaction-by-wallet-reference)
   - [Get Transaction By Reference](#get-transaction-by-reference)
3. [Financial Support Operations](#3-financial-support-operations)
   - [Wallet Balance Support](#wallet-balance-support)
   - [Mobile Money Support](#mobile-money-support)
   - [Get Support History (Paginated)](#get-support-history-paginated)
4. [Utility Operations](#4-utility-operations)
   - [Calculate Transaction Fee](#calculate-transaction-fee)

---

## 1. Wallet Operations

### Get Wallet Balance
Fetch the current available balance for a specified user wallet.

- **URL**: `/api/v1/wallet/getWalletBalance`
- **Request Body Parameters**:
  - `userId` (integer, required): Positive ID of the user.
- **Example Request**:
  ```json
  {
    "userId": 5
  }
  ```
- **Response Examples**:
  - **Success (`200 OK`)**:
    ```json
    {
      "success": true,
      "balance": 250000
    }
    ```
  - **Error (`404 Not Found` / User does not exist)**:
    ```json
    {
      "success": false,
      "message": "User not found"
    }
    ```

---

### Mobile Money Deposit
Initiate and process a simulated Mobile Money deposit.

- **URL**: `/api/v1/wallet/processMobileMoneyDeposit`
- **Request Body Parameters**:
  - `userId` (integer, required): Positive ID of the user depositing.
  - `amount` (number, required): Amount to deposit (minimum `UGX 1000`).
- **Example Request**:
  ```json
  {
    "userId": 5,
    "amount": 50000
  }
  ```
- **Response Examples**:
  - **Success (`200 OK`)**:
    ```json
    {
      "success": true,
      "refference": "TX_1717431234567",
      "message": "Deposit Successful!"
    }
    ```
  - **Validation Error (`400 Bad Request` / Amount too small)**:
    ```json
    {
      "success": false,
      "message": "Validation failed",
      "errors": [
        {
          "path": "amount",
          "message": "Amount must be at least UGX 1000"
        }
      ]
    }
    ```

---

### Stripe Card Deposit (createPaymentIntent)
Initialize a Stripe payment intent context for card top-ups, payments, or supports.

- **URL**: `/api/v1/stripe/createPaymentIntent`
- **Request Body Parameters**:
  - `userId` (integer, required): Positive ID of the initiator.
  - `amount` (number, required): Total charge amount (including system fees, positive).
  - `baseAmount` (number, required): Base deposit amount (minimum `UGX 10000`).
  - `type` (string, required): Transaction reason context. Enum: `["wallet_topup", "payment", "transfer", "support"]`.
  - `toUserId` (integer, optional): Positive ID of the recipient (required for `support`).
  - `fromUserId` (integer, optional): Positive ID of the sender (required for `support`).
- **Example Request**:
  ```json
  {
    "userId": 5,
    "amount": 10500,
    "baseAmount": 10000,
    "type": "wallet_topup"
  }
  ```
- **Response Examples**:
  - **Success (`200 OK`)**:
    ```json
    {
      "success": true,
      "clientSecret": "pi_123456_secret_abcdef",
      "transactionReference": "TX_1717438888888"
    }
    ```

---

### Internal P2P Transfer
Transfer funds internally from one user's wallet to another user's wallet.

- **URL**: `/api/v1/wallet/processP2PTransfer`
- **Request Body Parameters**:
  - `userId` (integer, required): Positive ID of the sender user.
  - `recipientId` (integer, required): Positive ID of the recipient user.
  - `amount` (number, required): Transfer amount (minimum `UGX 500`).
- **Example Request**:
  ```json
  {
    "userId": 5,
    "recipientId": 12,
    "amount": 25000
  }
  ```
- **Response Examples**:
  - **Success (`200 OK`)**:
    ```json
    {
      "success": true,
      "message": "Transfer completed successfully",
      "amount": 25000,
      "refference": "TX_1717439999999",
      "fee": 500,
      "currency": "UGX",
      "recipientEmail": "recipient@example.com",
      "recipientName": "Jane Doe",
      "senderEmail": "sender@example.com",
      "senderName": "John Doe"
    }
    ```
  - **Error (`400 Bad Request` / Insufficient funds)**:
    ```json
    {
      "success": false,
      "message": "Insufficient balance. Available UGX 10,000, Required UGX 25,500"
    }
    ```

---

### Search Users
Query and search users by name, email, or telephone number. Typically used to find recipients for support or P2P transfers.

- **URL**: `/api/v1/wallet/searchUsers`
- **Request Body Parameters**:
  - `userId` (integer, required): Positive ID of the current user (this ID is excluded from search results).
  - `query` (string, required): Non-empty search term.
- **Example Request**:
  ```json
  {
    "userId": 5,
    "query": "Jane"
  }
  ```
- **Response Examples**:
  - **Success (`200 OK`)**:
    ```json
    {
      "success": true,
      "users": [
        {
          "id": 12,
          "name": "Jane Doe",
          "email": "jane@example.com",
          "tel": "+256700000000"
        }
      ]
    }
    ```

---

## 2. Transaction Operations

### Get Transaction History (Paginated)
Fetch transaction history (sent, received, deposited, etc.) for a specified user.

- **URL**: `/api/v1/wallet/getTransactions`
- **Request Body Parameters**:
  - `userId` (integer, required): Positive ID of the user.
  - `page` (integer, optional, default: `1`): Page index.
  - `limit` (integer, optional, default: `10`): Number of transactions per page.
  - `query` (string, optional): Filtering query matching Display Name, Method, Category, or Transaction Reference (starts with `TX_`).
  - `status` (string, optional): Filter status (`"ALL"`, `"PENDING"`, `"COMPLETED"`, `"FAILED"`).
  - `type` (string, optional): Filter transaction type (`"ALL"`, `"DEPOSIT"`, `"WITHDRAWAL"`, `"TRANSFER"`, `"PAYMENT"`, `"SUPPORT"`).
- **Example Request**:
  ```json
  {
    "userId": 5,
    "page": 1,
    "limit": 5,
    "status": "COMPLETED"
  }
  ```
- **Response Examples**:
  - **Success (`200 OK`)**:
    ```json
    {
      "success": true,
      "transactions": [
        {
          "id": "clx...",
          "userId": 5,
          "recipientId": 12,
          "displayName": "Jane Doe",
          "amount": 25000,
          "currency": "UGX",
          "type": "TRANSFER",
          "status": "COMPLETED",
          "category": "Transfer",
          "method": "Wallet P2P Transfer",
          "txn_ref": "TX_1717439999999",
          "fee": 500,
          "reason": "Received UGX 25,000 from John Doe",
          "receiptUrl": "",
          "createdAt": "2026-06-03T14:20:00.000Z",
          "updatedAt": "2026-06-03T14:20:00.000Z"
        }
      ],
      "totalPages": 1,
      "currentPage": 1,
      "totalTransactions": 1
    }
    ```

---

### Get Transaction By Wallet Reference
Lookup a specific transaction context from the wallet perspective by reference token.

- **URL**: `/api/v1/wallet/getTransactionByRef`
- **Request Body Parameters**:
  - `userId` (integer, required): Positive ID of the user.
  - `reference` (string, required): Transaction reference string (e.g. `TX_...`).
- **Example Request**:
  ```json
  {
    "userId": 5,
    "reference": "TX_1717439999999"
  }
  ```
- **Response Examples**:
  - **Success (`200 OK`)**:
    ```json
    {
      "success": true,
      "transaction": {
        "id": "clx...",
        "userId": 5,
        "recipientId": 12,
        "displayName": "Jane Doe",
        "amount": 25000,
        "currency": "UGX",
        "type": "TRANSFER",
        "status": "COMPLETED",
        "category": "Transfer",
        "method": "Wallet P2P Transfer",
        "txn_ref": "TX_1717439999999",
        "fee": 500,
        "reason": "Received UGX 25,000 from John Doe",
        "receiptUrl": "",
        "createdAt": "2026-06-03T14:20:00.000Z",
        "updatedAt": "2026-06-03T14:20:00.000Z"
      }
    }
    ```

---

### Get Transaction By Reference
Lookup a specific transaction details from the transactions context.

- **URL**: `/api/v1/wallet/getTransactionByReference`
- **Request Body Parameters**:
  - `userId` (integer, required): Positive ID of the user.
  - `reference` (string, required): Transaction reference string.
- **Example Request**:
  ```json
  {
    "userId": 5,
    "reference": "TX_1717439999999"
  }
  ```
- **Response Examples**:
  - **Success (`200 OK`)**:
    ```json
    {
      "success": true,
      "transaction": {
        "id": "clx...",
        "userId": 5,
        "recipientId": 12,
        "displayName": "Jane Doe",
        "amount": 25000,
        "currency": "UGX",
        "type": "TRANSFER",
        "status": "COMPLETED",
        "category": "Transfer",
        "method": "Wallet P2P Transfer",
        "txn_ref": "TX_1717439999999",
        "fee": 500,
        "reason": "Received UGX 25,000 from John Doe",
        "receiptUrl": "",
        "createdAt": "2026-06-03T14:20:00.000Z",
        "updatedAt": "2026-06-03T14:20:00.000Z"
      }
    }
    ```

---

## 3. Financial Support Operations

### Wallet Balance Support
Support a recipient user using funds from the sender's existing wallet balance.

- **URL**: `/api/v1/wallet/processWalletSupport`
- **Request Body Parameters**:
  - `userId` (integer, required): Positive ID of the supporting user.
  - `toUserId` (integer, required): Positive ID of the recipient user.
  - `amount` (number, required): Support amount (minimum `UGX 1000`).
- **Example Request**:
  ```json
  {
    "userId": 5,
    "toUserId": 12,
    "amount": 15000
  }
  ```
- **Response Examples**:
  - **Success (`200 OK`)**:
    ```json
    {
      "success": true,
      "message": "Support completed successfully",
      "amount": 15000,
      "refference": "TX_1717439123456",
      "fee": 300,
      "currency": "UGX",
      "recipientEmail": "jane@example.com",
      "recipientName": "Jane Doe",
      "senderEmail": "john@example.com",
      "senderName": "John Doe"
    }
    ```

---

### Mobile Money Support
Support a recipient user using mobile money.

- **URL**: `/api/v1/wallet/processMobileMoneySupport`
- **Request Body Parameters**:
  - `userId` (integer, required): Positive ID of the supporting user.
  - `toUserId` (integer, required): Positive ID of the recipient user.
  - `amount` (number, required): Support amount (minimum `UGX 500`).
- **Example Request**:
  ```json
  {
    "userId": 5,
    "toUserId": 12,
    "amount": 5000
  }
  ```
- **Response Examples**:
  - **Success (`200 OK`)**:
    ```json
    {
      "success": true,
      "refference": "TX_1717439222333",
      "message": "Support Successful!"
    }
    ```

---

### Get Support History (Paginated)
Fetch records of financial support sent or received by a specific user.

- **URL**: `/api/v1/wallet/getSupportHistory`
- **Request Body Parameters**:
  - `userId` (integer, required): Positive ID of the user.
  - `page` (integer, optional, default: `1`): Page index.
  - `pageSize` (integer, optional, default: `10`): Records per page.
- **Example Request**:
  ```json
  {
    "userId": 5,
    "page": 1,
    "pageSize": 10
  }
  ```
- **Response Examples**:
  - **Success (`200 OK`)**:
    ```json
    {
      "success": true,
      "data": [
        {
          "id": "clx...",
          "fromUserId": 5,
          "toUserId": 12,
          "reference": "TX_1717439123456",
          "amount": 15000,
          "currency": "UGX",
          "paymentMethod": "WALLET",
          "reason": "Supported Jane Doe",
          "createdAt": "2026-06-03T14:15:00.000Z",
          "senderName": "John Doe",
          "senderEmail": "john@example.com",
          "recipientName": "Jane Doe",
          "recipientEmail": "jane@example.com",
          "type": "SENT"
        }
      ],
      "pagination": {
        "total": 1,
        "page": 1,
        "pageSize": 10,
        "totalPages": 1
      }
    }
    ```

---

## 4. Utility Operations

### Calculate Transaction Fee
Calculate the expected fee for a transaction type and amount before executing it.

- **URL**: `/api/v1/fees/getTransactionFee`
- **Request Body Parameters**:
  - `userId` (integer, required): Positive ID of the user requesting fee calculation.
  - `amount` (number, required): Target transaction amount.
  - `type` (string, required): Transaction type context. Enum: `["DEPOSIT", "WITHDRAWAL", "TRANSFER", "PAYMENT", "SUPPORT"]`.
- **Example Request**:
  ```json
  {
    "userId": 5,
    "amount": 50000,
    "type": "TRANSFER"
  }
  ```
- **Response Examples**:
  - **Success (`200 OK`)**:
    ```json
    {
      "success": true,
      "amount": 1000
    }
    ```
