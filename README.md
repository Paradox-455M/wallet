# Digital Escrow Platform

A secure digital escrow platform that lets buyers and sellers complete transactions with file transfer and Stripe payments. Funds are held until the seller uploads the file, then released automatically.

## Features

- **Transactions**: Create escrow transactions between buyer and seller (email-based)
- **Payments**: Stripe integration for secure payments; webhook for confirmation
- **File transfer**: Encrypted file upload by seller, download by buyer
- **Auth**: Register/login, OAuth (Google, GitHub), JWT
- **Dashboard**: View buyer/seller transactions, search, filter, quick actions
- **Notifications**: In-app notifications for payment received, file uploaded, completed
- **Admin**: API-only admin endpoints (list transactions, view, cancel, refund)

## Tech Stack

- **Backend**: Node.js, Express, PostgreSQL, Passport (JWT + OAuth), Stripe
- **Frontend**: React, Chakra UI, Stripe.js, Axios
- **Storage**: Files stored encrypted in DB (no S3 required for MVP)

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Stripe account (test mode is fine)

## Setup

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` with your values:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` or `DB_HOST`/`DB_PORT`/`DB_NAME`/`DB_USER`/`DB_PASSWORD` | PostgreSQL connection |
| `ENCRYPTION_MASTER_KEY` | Base64 32-byte key: `openssl rand -base64 32` |
| `JWT_SECRET` | Secret for JWT signing |
| `STRIPE_SECRET_KEY` | Stripe secret key (test) |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (test) |
| `STRIPE_WEBHOOK_SECRET` | From Stripe Dashboard → Webhooks |
| `FRONTEND_URL` | Frontend origin, e.g. `http://localhost:5173` |
| `ADMIN_EMAILS` | Comma-separated admin emails (optional) |

Create a PostgreSQL database, then start the backend. Tables are created automatically via migrations on startup:

```bash
npm run dev
```

Server runs at `http://localhost:3000`. Health check: `GET /health`.

### 2. Frontend

```bash
cd frontend
npm install
```

Create `.env` or `.env.local`:

```
VITE_API_URL=http://localhost:3000
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

```bash
npm run dev
```

Frontend runs at `http://localhost:5173` (or the port Vite shows).

## Basic User Guide

1. **Sign up / Log in**  
   Use the navbar “Login” or “Start Transaction”. Register with email/password or use Google/GitHub.

2. **Create a transaction**  
   Click “Start Transaction” or go to Create Transaction. Enter seller email, amount (USD), and item description. Submit to create the transaction and get a shareable link.

3. **Buyer: Pay**  
   Open the transaction link (or find it in Dashboard → Buyer Transactions). Click “Pay” and complete payment with Stripe. After success, status moves to “Awaiting File”.

4. **Seller: Upload file**  
   Open the same transaction link. After payment is received, upload the file. Max size and allowed types are shown; common document types are allowed.

5. **Buyer: Download**  
   When the file is uploaded, the buyer sees a “Download File” button. Transaction is marked completed and funds are released to the seller.

6. **Dashboard**  
   Use the Dashboard to see all your transactions (buyer and seller), search by ID or description, filter by status, and use quick actions (Pay, Upload, Download, Copy link).

7. **Profile**  
   Click your avatar to open Profile: view/edit display name, see member since and transaction count.

## API Overview

- **Auth**: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `PUT /api/auth/profile`
- **Transactions**: `POST /api/transactions`, `GET /api/transactions/buyer-data`, `GET /api/transactions/seller-data`, `GET /api/transactions/:id`, `POST /api/transactions/:id/pay`, `POST /api/transactions/:id/upload`, `GET /api/transactions/:id/download`, `POST /api/transactions/:id/cancel`
- **Notifications**: `GET /api/notifications`, `POST /api/notifications/:id/read`
- **Admin** (require admin JWT): `GET /api/admin/transactions`, `GET /api/admin/transactions/:id`, `POST /api/admin/transactions/:id/cancel`, `POST /api/transactions/:id/refund`

See `backend/README.md` for detailed API and env documentation.

## Error Handling & Mobile

- The app uses an **Error Boundary** so uncaught React errors show a “Something went wrong” screen with “Try again” and “Go to home”.
- **Loading states**: Full-page spinner on protected routes; transaction details show a loading spinner and, on fetch error, a clear message with “Try again” and “Back to Dashboard”.
- **Mobile**: Layout is responsive; navbar and dashboard adapt to small screens; tables scroll horizontally; buttons use touch-friendly minimum sizes.

## License

MIT
