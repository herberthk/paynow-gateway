# PayNow Gateway API Reference (v1)

This documentation provides details on all available versioned API routes (`/api/v1`) designed for third-party integrations, clients, and agents.

All endpoints require:

- **Method**: `POST`
- **Headers**:
  ```http
  Content-Type: application/json
  X-Auth-Token: <AES-256-GCM encrypted token>
  ```

---

## Authentication

All `/api/v1` routes are protected by **AES-256-GCM encrypted token authentication**, enforced by the server.

### How It Works

1. The server holds two secrets in `.env`:
   - `AUTH_TOKEN` — the raw plaintext token (never sent over the wire)
   - `AES_SECRET_KEY` — a 32-byte (64 hex chars) AES-256 key shared with the client

2. The **client** encrypts `AUTH_TOKEN` using AES-256-GCM with the shared `AES_SECRET_KEY` and sends the result as the `X-Auth-Token` header.

3. The **server** decrypts the header value and compares it against the stored `AUTH_TOKEN`. Mismatches or decryption failures return `401 Unauthorized`.

### Token Format

The encrypted token sent in `X-Auth-Token` must follow this format:

```
<iv_hex>:<ciphertext_with_auth_tag_hex>
```

- **`iv_hex`** — 12-byte random IV encoded as 24 hex characters (generated fresh for every request)
- **`ciphertext_with_auth_tag_hex`** — AES-256-GCM encrypted `AUTH_TOKEN` (ciphertext + 16-byte GCM auth tag) encoded as hex

> **Security Note**: A fresh random IV **must** be generated for every request. Reusing an IV with the same key breaks AES-GCM security guarantees.

---

### Client-Side Encryption Examples

You will need two secrets (share these out-of-band with the client securely):

| Variable         | Value                                |
| ---------------- | ------------------------------------ |
| `AUTH_TOKEN`     | The plaintext token from `.env`      |
| `AES_SECRET_KEY` | The 64-character hex key from `.env` |

---

#### Node.js / TypeScript

```typescript
import crypto from "crypto";

function encryptToken(authToken: string, aesKeyHex: string): string {
  const key = Buffer.from(aesKeyHex, "hex"); // 32 bytes
  const iv = crypto.randomBytes(12); // 12-byte random IV

  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(authToken, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag(); // 16-byte GCM auth tag

  // Combine ciphertext + auth tag, then hex-encode both parts
  const ciphertextWithTag = Buffer.concat([encrypted, authTag]);

  return `${iv.toString("hex")}:${ciphertextWithTag.toString("hex")}`;
}

// Usage
const encryptedToken = encryptToken(
  process.env.AUTH_TOKEN!,
  process.env.AES_SECRET_KEY!,
);

// Send in headers
const response = await fetch(
  "https://pay.connectappbiz.com/api/v1/wallet/getWalletBalance",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Auth-Token": encryptedToken,
    },
    body: JSON.stringify({ userId: 7614 }),
  },
);
```

---

#### Python

```python
import os
import secrets
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import requests

def encrypt_token(auth_token: str, aes_key_hex: str) -> str:
    key = bytes.fromhex(aes_key_hex)         # 32 bytes
    iv = secrets.token_bytes(12)             # 12-byte random IV
    aesgcm = AESGCM(key)

    # encrypt() returns ciphertext + 16-byte auth tag appended
    ciphertext_with_tag = aesgcm.encrypt(iv, auth_token.encode("utf-8"), None)

    return f"{iv.hex()}:{ciphertext_with_tag.hex()}"

# Usage
encrypted_token = encrypt_token(
    auth_token=os.environ["AUTH_TOKEN"],
    aes_key_hex=os.environ["AES_SECRET_KEY"],
)

response = requests.post(
    "https://pay.connectappbiz.com/api/v1/wallet/getWalletBalance",
    headers={
        "Content-Type": "application/json",
        "X-Auth-Token": encrypted_token,
    },
    json={"userId": 7614},
)
```

> Install dependency: `pip install cryptography`

---

#### PHP

```php
<?php
function encryptToken(string $authToken, string $aesKeyHex): string {
    $key = hex2bin($aesKeyHex);               // 32 bytes
    $iv  = random_bytes(12);                  // 12-byte random IV

    $ciphertext = openssl_encrypt(
        $authToken,
        'aes-256-gcm',
        $key,
        OPENSSL_RAW_DATA,
        $iv,
        $tag,         // GCM auth tag (output parameter)
        '',
        16            // 16-byte auth tag length
    );

    // Concatenate ciphertext + auth tag, then hex-encode
    $ciphertextWithTag = $ciphertext . $tag;

    return bin2hex($iv) . ':' . bin2hex($ciphertextWithTag);
}

// Usage
$encryptedToken = encryptToken($_ENV['AUTH_TOKEN'], $_ENV['AES_SECRET_KEY']);

$response = file_get_contents(
    'https://pay.connectappbiz.com/api/v1/wallet/getWalletBalance',
    false,
    stream_context_create([
        'http' => [
            'method'  => 'POST',
            'header'  => implode("\r\n", [
                'Content-Type: application/json',
                'X-Auth-Token: ' . $encryptedToken,
            ]),
            'content' => json_encode(['userId' => 7614]),
        ],
    ])
);
```

---

#### Web (Browser — Vanilla JS / React)

Modern browsers support AES-256-GCM natively via the **Web Crypto API** — no libraries needed.

```typescript
// Works in any modern browser: Chrome, Firefox, Safari, Edge
// Also compatible with React, Next.js client-side, and Vite apps

function hexToBytes(hex: string): Uint8Array {
  const buffer = new ArrayBuffer(hex.length / 2);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function encryptToken(
  authToken: string,
  aesKeyHex: string,
): Promise<string> {
  const keyBytes = hexToBytes(aesKeyHex);
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 12-byte random IV

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "AES-GCM" },
    false,
    ["encrypt"],
  );

  // Returns ciphertext with 16-byte GCM auth tag appended
  const ciphertextBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv, tagLength: 128 },
    cryptoKey,
    new TextEncoder().encode(authToken),
  );

  return `${bytesToHex(iv)}:${bytesToHex(new Uint8Array(ciphertextBuffer))}`;
}

// Usage — store secrets in environment variables, never hardcode
const encryptedToken = await encryptToken(
  import.meta.env.VITE_AUTH_TOKEN, // or process.env.NEXT_PUBLIC_AUTH_TOKEN
  import.meta.env.VITE_AES_SECRET_KEY, // or process.env.NEXT_PUBLIC_AES_SECRET_KEY
);

const response = await fetch(
  "https://pay.connectappbiz.com/api/v1/wallet/getWalletBalance",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Auth-Token": encryptedToken,
    },
    body: JSON.stringify({ userId: 7614 }),
  },
);
```

> **Security warning**: Never expose `AUTH_TOKEN` or `AES_SECRET_KEY` in client-side browser code in production. Proxy API calls through your own backend server instead.

---

#### React Native (Expo & Bare Workflow)

React Native does not have the Web Crypto API. Use [`react-native-quick-crypto`](https://github.com/margelo/react-native-quick-crypto) which mirrors the Node.js `crypto` API with native performance.

> Install: `npm install react-native-quick-crypto` then `npx pod-install` (iOS)

```typescript
import crypto from "react-native-quick-crypto";

function encryptToken(authToken: string, aesKeyHex: string): string {
  const key = Buffer.from(aesKeyHex, "hex"); // 32 bytes
  const iv = crypto.randomBytes(12); // 12-byte random IV

  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(authToken, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag(); // 16-byte GCM auth tag

  const ciphertextWithTag = Buffer.concat([encrypted, authTag]);

  return `${iv.toString("hex")}:${ciphertextWithTag.toString("hex")}`;
}

// Usage — load from a secure store (e.g. expo-secure-store), never hardcode
import * as SecureStore from "expo-secure-store";

const authToken = await SecureStore.getItemAsync("AUTH_TOKEN");
const aesKey = await SecureStore.getItemAsync("AES_SECRET_KEY");

const encryptedToken = encryptToken(authToken!, aesKey!);

const response = await fetch(
  "https://pay.connectappbiz.com/api/v1/wallet/getWalletBalance",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Auth-Token": encryptedToken,
    },
    body: JSON.stringify({ userId: 7614 }),
  },
);
```

> For Expo managed workflow, also install `expo-secure-store`: `npx expo install expo-secure-store`

---

### Unauthorized Response (`401`)

Returned when the header is missing, malformed, or the decrypted token does not match:

```json
{
  "success": false,
  "message": "Unauthorized: Invalid or missing X-Auth-Token header"
}
```

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
  - `userId` (integer, required): Positive ID of the target user to fetch.
- **Example Request**:
  ```json
  {
    "userId": 7614
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
  - `email` (string, required): Email address of the target user to fetch.
- **Example Request**:
  ```json
  {
    "email": "[EMAIL_ADDRESS]"
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
