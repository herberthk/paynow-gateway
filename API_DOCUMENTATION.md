# PayNow Gateway API Reference (v1)

This documentation provides details on all available versioned API routes (`/api/v1`) designed for third-party integrations, clients, and agents.

All endpoints require:

- **Method**: `POST`
- **Headers**:
  ```http
  Content-Type: application/json
  ```
- **Authentication**: Simulated authentication by providing the target client's user identifier (`userId`) in the JSON payload body.

- **Payment base URL** - https://pay.connectappbiz.com

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
5. [User Operations](#5-user-operations)
   - [Get User By ID](#get-user-by-id)
   - [Get User By Email](#get-user-by-email)

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
          "id": "f9b3e975-cae6-4178-87f9-8bdffbd5a948",
          "userId": 6172,
          "recipientId": 7614,
          "displayName": "Kavuma Herbert",
          "amount": 250000,
          "currency": "UGX",
          "type": "TRANSFER",
          "status": "COMPLETED",
          "txn_ref": "TX_TS93DZ7VTU6Q",
          "category": "Transfer",
          "method": "Wallet P2P Transfer",
          "reason": "Received UGX 250,000 from Herbert Britol Bruce",
          "receiptUrl": null,
          "fee": 1575,
          "createdAt": "2026-06-03T18:59:31.006Z",
          "updatedAt": "2026-06-03T18:59:31.006Z",
          "deleted_at": null,
          "sender": {
            "name": "Herbert Britol Bruce"
          },
          "recipient": {
            "name": "Kavuma Herbert"
          }
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
        "id": "f9b3e975-cae6-4178-87f9-8bdffbd5a948",
        "userId": 6172,
        "recipientId": 7614,
        "displayName": "Kavuma Herbert",
        "amount": 250000,
        "currency": "UGX",
        "type": "TRANSFER",
        "status": "COMPLETED",
        "txn_ref": "TX_TS93DZ7VTU6Q",
        "category": "Transfer",
        "method": "Wallet P2P Transfer",
        "reason": "Received UGX 250,000 from Herbert Britol Bruce",
        "receiptUrl": null,
        "fee": 1575,
        "createdAt": "2026-06-03T18:59:31.006Z",
        "updatedAt": "2026-06-03T18:59:31.006Z",
        "deleted_at": null,
        "sender": {
          "name": "Herbert Britol Bruce"
        },
        "recipient": {
          "name": "Kavuma Herbert"
        }
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
        "id": "f9b3e975-cae6-4178-87f9-8bdffbd5a948",
        "userId": 6172,
        "recipientId": 7614,
        "displayName": "Kavuma Herbert",
        "amount": 250000,
        "currency": "UGX",
        "type": "TRANSFER",
        "status": "COMPLETED",
        "txn_ref": "TX_TS93DZ7VTU6Q",
        "category": "Transfer",
        "method": "Wallet P2P Transfer",
        "reason": "Received UGX 250,000 from Herbert Britol Bruce",
        "receiptUrl": null,
        "fee": 1575,
        "createdAt": "2026-06-03T18:59:31.006Z",
        "updatedAt": "2026-06-03T18:59:31.006Z",
        "deleted_at": null,
        "sender": {
          "name": "Herbert Britol Bruce"
        },
        "recipient": {
          "name": "Kavuma Herbert"
        }
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
      "amount": 150000,
      "refference": "TX_XVWUG98EXC2P",
      "fee": 6450,
      "currency": "UGX",
      "recipientEmail": "herbertbruce8@gmail.com",
      "recipientName": "Kavuma Herbert",
      "senderEmail": "herberthtk100@gmail.com",
      "senderName": "Herbert Britol Bruce"
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
          "id": "cmpygc0n8000004ibdojzi2h0",
          "fromUserId": 6172,
          "toUserId": 7614,
          "reference": "TX_GZWRX7CVWF8M",
          "amount": 500000,
          "currency": "UGX",
          "paymentMethod": "MOBILE_MONEY",
          "reason": "Mobile Money Support",
          "createdAt": "2026-06-03T19:20:53.060Z",
          "updatedAt": "2026-06-03T19:20:53.060Z",
          "senderName": "Herbert Britol Bruce",
          "senderEmail": "herberthtk100@gmail.com",
          "recipientName": "Kavuma Herbert",
          "recipientEmail": "herbertbruce8@gmail.com",
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

---

## 5. User Operations

### Get User By ID

Retrieve details for a specific user using their user ID.

- **URL**: `/api/v1/users/getUserById`
- **Request Body Parameters**:
  - `userId` (integer, required): Positive ID of the user requesting the lookup (simulated requester auth).
  - `id` (integer, required): Positive ID of the target user to fetch.
- **Example Request**:
  ```json
  {
    "userId": 6172,
    "id": 7614
  }
  ```
- **Response Examples**:
  - **Success (`200 OK`)**:
    ```json
    {
      "success": true,
      "user": {
        "userId": 6172,
        "email": "herberthtk100@gmail.com",
        "tel": "256779159642",
        "name": "Herbert Britol Bruce",
        "profile": "https://firebasestorage.googleapis.com/v0/b/connect-app-1f5ca.appspot.com/o/images%2Fmigrated_1767567819322_5d42ne.png?alt=media&token=92ea5225-4f58-4d34-97ca-16132010e4cd",
        "address": null,
        "ispaid": false,
        "email_verified_at": null,
        "created_at": "2023-11-19T16:04:59.000Z",
        "privilege": "none",
        "is_ghost_user": false
      }
    }
    ```
  - **Error (`404 Not Found` / Requester or Target User not found)**:
    ```json
    {
      "success": false,
      "message": "Target user not found"
    }
    ```

---

### Get User By Email

Retrieve details for a specific user using their email address.

- **URL**: `/api/v1/users/getUserByEmail`
- **Request Body Parameters**:
  - `userId` (integer, required): Positive ID of the user requesting the lookup (simulated requester auth).
  - `email` (string, required): Email address of the target user to fetch.
- **Example Request**:
  ```json
  {
    "userId": 6172,
    "email": "herbertbruce8@gmail.com"
  }
  ```
- **Response Examples**:
  - **Success (`200 OK`)**:
    ```json
    {
      "success": true,
      "user": {
        "userId": 6172,
        "email": "herberthtk100@gmail.com",
        "tel": "256779159642",
        "name": "Herbert Britol Bruce",
        "profile": "https://firebasestorage.googleapis.com/v0/b/connect-app-1f5ca.appspot.com/o/images%2Fmigrated_1767567819322_5d42ne.png?alt=media&token=92ea5225-4f58-4d34-97ca-16132010e4cd",
        "address": null,
        "ispaid": false,
        "email_verified_at": null,
        "created_at": "2023-11-19T16:04:59.000Z",
        "privilege": "none",
        "is_ghost_user": false
      }
    }
    ```
  - **Error (`404 Not Found` / Target User not found)**:
    ```json
    {
      "success": false,
      "message": "Target user not found"
    }
    ```
