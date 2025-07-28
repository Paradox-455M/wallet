# Database Setup Guide

## Prerequisites

1. **PostgreSQL** installed and running
2. **Node.js** and **npm** installed
3. **Environment variables** configured in `.env` file

## Environment Variables

Create a `.env` file in the backend directory with:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=escrow_platform
DB_USER=your_username
DB_PASSWORD=your_password

# JWT Secret
JWT_SECRET=your_jwt_secret_key

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=your_s3_bucket_name

# OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

## Database Creation

1. **Create PostgreSQL Database:**
```sql
CREATE DATABASE escrow_platform;
```

2. **Or using psql command:**
```bash
createdb escrow_platform
```

## Running Migrations

### Option 1: Using npm script
```bash
cd backend
npm run migrate
```

### Option 2: Direct execution
```bash
cd backend
node src/migrations/run_migrations.js
```

### Option 3: Setup everything at once
```bash
cd backend
npm run setup-db
```

## Migration Files

The migration system will execute these files in order:

1. **001_create_transactions_table.sql**
   - Creates transactions table with all required fields
   - Adds indexes for performance
   - Creates triggers for automatic timestamp updates

2. **002_create_users_table.sql**
   - Creates users table for authentication
   - Supports local, Google, and GitHub OAuth
   - Adds necessary indexes

3. **003_insert_sample_data.sql**
   - Inserts sample users and transactions
   - Provides test data for dashboard development

## Database Schema

### Transactions Table
```sql
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_email VARCHAR(255) NOT NULL,
    seller_email VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    item_description TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    stripe_payment_intent_id VARCHAR(255),
    stripe_transfer_id VARCHAR(255),
    file_key VARCHAR(255),
    file_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    payment_received BOOLEAN DEFAULT FALSE,
    file_uploaded BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE
);
```

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    full_name VARCHAR(255),
    google_id VARCHAR(255) UNIQUE,
    google_display_name VARCHAR(255),
    google_avatar_url TEXT,
    github_id VARCHAR(255) UNIQUE,
    github_display_name VARCHAR(255),
    github_avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Sample Data

After running migrations, you'll have:

### Sample Users:
- `buyer@example.com` - John Buyer
- `seller@example.com` - Jane Seller  
- `test@example.com` - Test User

### Sample Transactions:
- **Completed transactions** (payment received, file uploaded)
- **Pending payment** (awaiting buyer payment)
- **Pending upload** (payment received, waiting for seller upload)
- **Cancelled transactions** (for testing)

## Verification

To verify the setup:

1. **Check tables exist:**
```sql
\dt
```

2. **Check sample data:**
```sql
SELECT * FROM transactions LIMIT 5;
SELECT * FROM users LIMIT 5;
```

3. **Test API endpoints:**
```bash
# Test buyer data endpoint
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:3000/api/transactions/buyer-data

# Test seller data endpoint  
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:3000/api/transactions/seller-data
```

## Troubleshooting

### Common Issues:

1. **Port 3000 already in use:**
   ```bash
   # Kill existing process
   lsof -ti:3000 | xargs kill -9
   ```

2. **Database connection failed:**
   - Check `.env` file configuration
   - Verify PostgreSQL is running
   - Check database exists

3. **Migration errors:**
   - Ensure PostgreSQL user has CREATE privileges
   - Check if tables already exist (migrations are idempotent)

4. **Permission denied:**
   ```bash
   # Fix file permissions
   chmod +x src/migrations/run_migrations.js
   ```

## Development Workflow

1. **Start fresh:**
   ```bash
   dropdb escrow_platform
   createdb escrow_platform
   npm run migrate
   ```

2. **Add new migration:**
   - Create new file: `004_your_migration.sql`
   - Run: `npm run migrate`

3. **Reset with sample data:**
   ```bash
   npm run setup-db
   ``` 