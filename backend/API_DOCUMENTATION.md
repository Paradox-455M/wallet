# Dashboard API Documentation

## Authentication Required
All endpoints require JWT token in Authorization header: `Bearer <token>`

## Dashboard Endpoints

### Buyer Dashboard Data
**GET** `/api/transactions/buyer-data`

Returns buyer-specific transactions and statistics.

**Response:**
```json
{
  "transactions": [
    {
      "id": "uuid",
      "buyer_email": "buyer@example.com",
      "seller_email": "seller@example.com",
      "amount": "100.00",
      "item_description": "Product description",
      "status": "pending",
      "payment_received": false,
      "file_uploaded": false,
      "file_name": null,
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2023-01-01T00:00:00Z"
    }
  ],
  "statistics": {
    "totalTransactions": 10,
    "pendingFiles": 2,
    "completedTransactions": 5,
    "totalSpent": 500.00
  }
}
```

### Seller Dashboard Data
**GET** `/api/transactions/seller-data`

Returns seller-specific transactions and statistics.

**Response:**
```json
{
  "transactions": [...],
  "statistics": {
    "totalUploads": 8,
    "totalEarned": 400.00,
    "pendingPayouts": 100.00,
    "downloadsCompleted": 6
  }
}
```

## Transaction Actions

### Process Payment (Simulation)
**POST** `/api/transactions/:transactionId/pay`

Simulates payment processing for testing purposes.

**Response:**
```json
{
  "message": "Payment processed successfully",
  "transaction": { ... }
}
```

### Cancel Transaction
**POST** `/api/transactions/:transactionId/cancel`

Cancels a transaction (only if payment not received).

**Response:**
```json
{
  "message": "Transaction cancelled successfully",
  "transaction": { ... }
}
```

### Upload File (Enhanced)
**POST** `/api/transactions/:transactionId/upload`

Upload file for a transaction. Only the seller can upload.

**Form Data:**
- `file`: File to upload

**Response:**
```json
{
  "message": "File uploaded successfully",
  "transaction": { ... }
}
```

## Transaction Details

### Get Transaction Timeline
**GET** `/api/transactions/:transactionId/timeline`

Returns detailed timeline of transaction events.

**Response:**
```json
{
  "transaction": { ... },
  "timeline": [
    {
      "event": "Transaction Created",
      "timestamp": "2023-01-01T00:00:00Z",
      "description": "Transaction for 'Product' created",
      "status": "completed"
    },
    {
      "event": "Payment Received",
      "timestamp": "2023-01-01T01:00:00Z",
      "description": "Payment has been received and held in escrow",
      "status": "completed"
    }
  ]
}
```

## Transaction Statuses

- `pending`: Transaction created, awaiting payment
- `payment_received`: Payment received, awaiting file upload
- `completed`: File uploaded and funds released
- `cancelled`: Transaction cancelled
- `refunded`: Transaction refunded

## Error Responses

All endpoints return errors in this format:
```json
{
  "error": "Error message"
}
```

Common HTTP status codes:
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error 