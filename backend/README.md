# Digital Escrow Platform - Backend

A secure digital escrow platform backend built with Node.js, Express, PostgreSQL, and integrated with Stripe for payments and AWS S3 for file storage.

## Features

- 🔐 **Authentication**: Local registration/login + OAuth (Google, GitHub)
- 💳 **Payments**: Stripe integration for secure payments
- 📁 **File Storage**: AWS S3 for secure file uploads/downloads
- 🔒 **Security**: JWT tokens, input validation, error handling
- 📧 **Notifications**: Email notifications for transaction updates
- 🗄️ **Database**: PostgreSQL with automatic migrations

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: Passport.js + JWT
- **Payments**: Stripe
- **File Storage**: AWS S3
- **Validation**: Express-validator
- **Security**: Helmet, CORS, bcrypt

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── db.js        # Database connection
│   │   ├── passport.js  # Authentication strategies
│   │   ├── stripe.js    # Stripe configuration
│   │   └── s3.js        # AWS S3 configuration
│   ├── controllers/     # Route controllers
│   │   ├── authController.js
│   │   └── transactionController.js
│   ├── middleware/      # Custom middleware
│   │   ├── auth.js      # Authentication middleware
│   │   ├── validation.js # Input validation
│   │   └── errorHandler.js # Error handling
│   ├── migrations/      # Database migrations
│   │   └── 001_create_tables.js
│   ├── models/          # Database models
│   │   ├── User.js
│   │   ├── Transaction.js
│   │   └── schema.sql
│   ├── routes/          # API routes
│   │   ├── authRoutes.js
│   │   └── transactionRoutes.js
│   ├── services/        # Business logic
│   │   ├── transactionService.js
│   │   └── emailService.js
│   └── index.js         # Application entry point
├── .env.example         # Environment variables template
├── package.json
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- AWS Account (for S3)
- Stripe Account
- Google OAuth App (optional)
- GitHub OAuth App (optional)

### 1. Clone and Install

```bash
cd backend
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` with your actual credentials:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=escrow_platform
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# JWT Configuration
JWT_SECRET=your_very_secure_jwt_secret_key_here
JWT_EXPIRES_IN=24h

# Session Configuration
SESSION_SECRET=your_very_secure_session_secret_key_here

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_BUCKET_NAME=your-escrow-bucket

# OAuth Configuration (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Environment
NODE_ENV=development
PORT=3000
```

### 3. Database Setup

Create a PostgreSQL database:

```bash
createdb escrow_platform
```

The application will automatically create the required tables on startup.

### 4. AWS S3 Setup

1. Create an S3 bucket for file storage
2. Set up IAM user with S3 permissions
3. Configure bucket CORS for your frontend domain

### 5. Stripe Setup

1. Create a Stripe account
2. Get your test API keys from the Stripe dashboard
3. Configure webhooks (optional for advanced features)

### 6. Start the Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:3000`

## API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "fullName": "John Doe"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <jwt_token>
```

#### OAuth Login
```http
GET /api/auth/google
GET /api/auth/github
```

### Transaction Endpoints

#### Create Transaction
```http
POST /api/transactions
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "sellerEmail": "seller@example.com",
  "amount": 100.00,
  "itemDescription": "Digital product description"
}
```

#### Get Transaction
```http
GET /api/transactions/:transactionId
```

#### Get User Transactions
```http
GET /api/transactions/my
Authorization: Bearer <jwt_token>
```

#### Confirm Payment
```http
POST /api/transactions/:transactionId/confirm-payment
```

#### Upload File
```http
POST /api/transactions/:transactionId/upload
Content-Type: multipart/form-data
Authorization: Bearer <jwt_token>

file: <file_data>
```

#### Get Download URL
```http
GET /api/transactions/:transactionId/download
```

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **Input Validation**: Express-validator for request validation
- **CORS Protection**: Configured for frontend domain
- **Helmet**: Security headers
- **Rate Limiting**: (Recommended for production)

## Error Handling

The API uses consistent error responses:

```json
{
  "status": "error",
  "message": "Error description",
  "errors": [] // Validation errors if applicable
}
```

## Database Schema

### Users Table
- `id` (UUID, Primary Key)
- `email` (String, Unique)
- `password_hash` (String)
- `full_name` (String)
- `google_id` (String, Unique)
- `github_id` (String, Unique)
- OAuth profile data
- Timestamps

### Transactions Table
- `id` (UUID, Primary Key)
- `buyer_email` (String)
- `seller_email` (String)
- `amount` (Decimal)
- `item_description` (Text)
- `status` (String)
- Stripe integration fields
- File storage fields
- Timestamps and flags

## Deployment

### Environment Variables
Ensure all production environment variables are set securely.

### Database
- Use a managed PostgreSQL service (AWS RDS, Heroku Postgres, etc.)
- Enable SSL connections
- Set up regular backups

### File Storage
- Configure S3 bucket with proper permissions
- Enable versioning and lifecycle policies

### Security
- Use HTTPS in production
- Set secure session cookies
- Implement rate limiting
- Monitor for security vulnerabilities

### Recommended Platforms
- **Railway**: Easy deployment with PostgreSQL addon
- **Render**: Good for Node.js applications
- **Heroku**: Classic choice with many addons
- **AWS**: Full control with EC2/ECS

## Development

### Running Tests
```bash
npm test
```

### Code Quality
- Use ESLint for code linting
- Implement Prettier for code formatting
- Add pre-commit hooks with Husky

### Monitoring
- Implement logging with Winston
- Add health check endpoints
- Monitor API performance and errors

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details