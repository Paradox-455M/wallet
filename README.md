# wallet
Secure Wallet for file transfering
=======
# Digital Escrow Platform

A secure digital escrow platform that facilitates transactions between buyers and sellers with file transfer capabilities.

## Features

- Secure transaction creation and management
- Stripe payment integration
- AWS S3 file storage
- Real-time transaction status updates
- Automated fund release system

## Tech Stack

### Backend
- Node.js + Express
- PostgreSQL
- Stripe API
- AWS S3

### Frontend
- React
- Chakra UI
- Stripe.js
- Axios

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL
- AWS Account
- Stripe Account

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example` and fill in your credentials:
   ```bash
   cp .env.example .env
   ```

4. Set up the database:
   - Create a PostgreSQL database
   - Run the schema.sql file in the src/models directory

5. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your environment variables:
   ```
   VITE_API_URL=http://localhost:3000
   VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Transactions
- `POST /api/transactions` - Create a new transaction
- `GET /api/transactions/:transactionId` - Get transaction details
- `POST /api/transactions/:transactionId/confirm-payment` - Confirm payment
- `POST /api/transactions/:transactionId/upload` - Upload file
- `GET /api/transactions/:transactionId/download` - Get file download URL

## Security Considerations

- All file transfers are secured through AWS S3 signed URLs
- Payments are processed through Stripe's secure infrastructure
- Environment variables are used for sensitive credentials
- CORS and Helmet middleware for enhanced security

## Deployment

### Backend
- Deploy to Railway or Render
- Set up environment variables
- Configure PostgreSQL database
- Set up AWS S3 bucket with proper permissions

### Frontend
- Deploy to Vercel
- Configure environment variables
- Set up build and deployment settings

## License

MIT
>>>>>>> 235201c (UI done mostly and authentication)
