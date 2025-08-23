const express = require('express');
const request = require('supertest');

describe('TransactionController encrypted upload/download', () => {
  let app;

  beforeAll(() => {
    process.env.ENCRYPTION_MASTER_KEY = Buffer.from('c'.repeat(32)).toString('base64');
    jest.resetModules();

    // Mock dependencies before requiring controller
    jest.doMock('../../services/transactionService', () => ({
      __esModule: true,
      default: undefined,
      createTransaction: jest.fn(),
      initiatePayment: jest.fn(),
      confirmPaymentReceived: jest.fn(),
      updateFileInfo: jest.fn(),
      getTransaction: jest.fn(async (id) => ({
        id,
        seller_email: 'seller@example.com',
        buyer_email: 'buyer@example.com',
        payment_received: true,
        file_uploaded: true,
        amount: 100,
        status: 'pending',
      })),
      checkAndCompleteTransaction: jest.fn(async (id) => ({
        id,
        seller_email: 'seller@example.com',
        buyer_email: 'buyer@example.com',
        payment_received: true,
        file_uploaded: true,
        amount: 100,
        status: 'pending',
      })),
    }));

    jest.doMock('../../models/Transaction', () => ({
      __esModule: true,
      default: undefined,
      updateFileStatus: jest.fn(async () => ({})),
      findById: jest.fn(),
      hasAccess: jest.fn(),
    }));

    const encryptedParts = {};
    jest.doMock('../../models/TransactionFile', () => ({
      __esModule: true,
      default: undefined,
      create: jest.fn(async (row) => {
        encryptedParts.row = row;
        return { id: 'file-1', transaction_id: row.transactionId };
      }),
      findLatestMetadataByTransactionId: jest.fn(async () => ({ id: 'file-1', filename: 'doc.pdf', mime: 'application/pdf', size_bytes: 11 })),
      getEncryptedParts: jest.fn(async () => ({
        enc_key: encryptedParts.row.encKey,
        enc_iv: encryptedParts.row.encIv,
        enc_tag: encryptedParts.row.encTag,
        enc_blob: encryptedParts.row.encBlob,
        mime: 'application/pdf',
        filename: 'doc.pdf',
        size_bytes: 11,
      })),
    }));

    const TransactionController = require('../transactionController');

    app = express();
    // Fake auth middleware
    app.use((req, _res, next) => {
      // Set seller for upload, buyer can also download
      req.user = { email: req.headers['x-user-email'] || 'seller@example.com' };
      next();
    });

    app.post('/api/transactions/:transactionId/upload', (req, res) => TransactionController.uploadFile(req, res));
    app.get('/api/transactions/:transactionId/download', (req, res) => TransactionController.getDownloadUrl(req, res));
  });

  test('upload encrypts and stores, download decrypts', async () => {
    const plaintext = Buffer.from('hello world');

    // Upload
    const uploadRes = await request(app)
      .post('/api/transactions/tx-1/upload')
      .set('x-user-email', 'seller@example.com')
      .attach('file', plaintext, { filename: 'doc.pdf', contentType: 'application/pdf' });

    expect(uploadRes.status).toBe(200);
    expect(uploadRes.body.message).toMatch(/File uploaded successfully/);

    // Download as buyer
    const downloadRes = await request(app)
      .get('/api/transactions/tx-1/download')
      .set('x-user-email', 'buyer@example.com')
      .buffer()
      .parse((res, cb) => {
        const chunks = [];
        res.on('data', (d) => chunks.push(d));
        res.on('end', () => cb(null, Buffer.concat(chunks)));
      });

    expect(downloadRes.status).toBe(200);
    expect(Buffer.isBuffer(downloadRes.body)).toBe(true);
    expect(Buffer.from(downloadRes.body).equals(plaintext)).toBe(true);
    expect(downloadRes.headers['content-type']).toBe('application/pdf');
    expect(downloadRes.headers['content-disposition']).toMatch(/attachment/);
  });
});