#!/usr/bin/env node
/**
 * API test script for Digital Escrow Platform.
 * Run: node scripts/api-test.js
 * Requires: backend running on BASE_URL (default http://localhost:3000)
 */

const http = require('http');
const https = require('https');

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const isHttps = url.protocol === 'https:';
    const lib = isHttps ? https : http;
    const bodyStr = body && (method === 'POST' || method === 'PUT')
      ? (typeof body === 'string' ? body : JSON.stringify(body))
      : '';
    const headers = {
      'Content-Type': 'application/json',
      ...(bodyStr ? { 'Content-Length': Buffer.byteLength(bodyStr, 'utf8') } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    const opts = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method,
      headers,
    };
    const req = lib.request(opts, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, data });
        }
      });
    });
    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

const get = (path, token) => request('GET', path, null, token);
const post = (path, body, token) => request('POST', path, body, token);

async function runTests() {
  let passed = 0;
  let failed = 0;
  let token = null;
  let transactionId = null;

  function ok(name, condition, detail = '') {
    if (condition) {
      passed++;
      console.log(`  ✅ ${name}${detail ? ` — ${detail}` : ''}`);
    } else {
      failed++;
      console.log(`  ❌ ${name}${detail ? ` — ${detail}` : ''}`);
    }
  }

  console.log('\n=== API Tests ===\n');
  console.log('Base URL:', BASE_URL);

  // 1. Health
  try {
    const health = await get('/health');
    ok('GET /health', health.status === 200, `status ${health.status}`);
  } catch (e) {
    failed++;
    console.log('  ❌ GET /health —', e.message);
  }

  // 2. Auth: Register
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';
  try {
    const reg = await post('/api/auth/register', {
      email: testEmail,
      password: testPassword,
      fullName: 'Test User',
    });
    ok('POST /api/auth/register', reg.status === 201, `status ${reg.status}`);
    if (reg.data.token) {
      token = reg.data.token;
      ok('  token received', true);
    } else {
      ok('  token received', false, 'no token in response');
    }
  } catch (e) {
    failed++;
    console.log('  ❌ POST /api/auth/register —', e.message);
  }

  // If no token, try login (in case user already exists)
  if (!token) {
    try {
      const login = await post('/api/auth/login', { email: testEmail, password: testPassword });
      if (login.status === 200 && login.data.token) {
        token = login.data.token;
        passed++;
        console.log('  ✅ POST /api/auth/login (fallback) — got token');
      }
    } catch (_) {}
  }

  if (!token) {
    console.log('\n  Skipping authenticated tests (no token).');
    console.log(`  Passed: ${passed}, Failed: ${failed}\n`);
    process.exit(failed > 0 ? 1 : 0);
  }

  // 3. Auth: Me
  try {
    const me = await get('/api/auth/me', token);
    ok('GET /api/auth/me', me.status === 200 && me.data.user, `status ${me.status}`);
  } catch (e) {
    failed++;
    console.log('  ❌ GET /api/auth/me —', e.message);
  }

  // 4. Create transaction
  try {
    const create = await post(
      '/api/transactions',
      {
        sellerEmail: 'seller@example.com',
        amount: 10.5,
        itemDescription: 'Test item for API test',
      },
      token
    );
    ok('POST /api/transactions', create.status === 200, `status ${create.status}`);
    if (create.data.transactionId) {
      transactionId = create.data.transactionId;
      ok('  transactionId + clientSecret', !!create.data.clientSecret);
    } else {
      ok('  transactionId', false);
    }
  } catch (e) {
    failed++;
    console.log('  ❌ POST /api/transactions —', e.message);
  }

  // 5. Get transaction (requires transactionId)
  if (transactionId) {
    try {
      const tx = await get(`/api/transactions/${transactionId}`, token);
      ok('GET /api/transactions/:id', tx.status === 200 && tx.data.id, `status ${tx.status}`);
      ok('  transaction fields', !!(tx.data.buyer_email && tx.data.amount != null));
    } catch (e) {
      failed++;
      console.log('  ❌ GET /api/transactions/:id —', e.message);
    }
  }

  // 6. Buyer data
  try {
    const buyer = await get('/api/transactions/buyer-data', token);
    ok('GET /api/transactions/buyer-data', buyer.status === 200, `status ${buyer.status}`);
    ok('  has transactions or statistics', Array.isArray(buyer.data.transactions) || buyer.data.statistics != null);
  } catch (e) {
    failed++;
    console.log('  ❌ GET /api/transactions/buyer-data —', e.message);
  }

  // 7. Seller data
  try {
    const seller = await get('/api/transactions/seller-data', token);
    ok('GET /api/transactions/seller-data', seller.status === 200, `status ${seller.status}`);
  } catch (e) {
    failed++;
    console.log('  ❌ GET /api/transactions/seller-data —', e.message);
  }

  // 8. Notifications
  try {
    const notif = await get('/api/notifications', token);
    ok('GET /api/notifications', notif.status === 200, `status ${notif.status}`);
    ok('  array response', Array.isArray(notif.data));
  } catch (e) {
    failed++;
    console.log('  ❌ GET /api/notifications —', e.message);
  }

  // 9. Unread count
  try {
    const count = await get('/api/notifications/unread-count', token);
    ok('GET /api/notifications/unread-count', count.status === 200 && typeof count.data.count === 'number', `status ${count.status}`);
  } catch (e) {
    failed++;
    console.log('  ❌ GET /api/notifications/unread-count —', e.message);
  }

  // 10. My transactions
  try {
    const my = await get('/api/transactions/my', token);
    ok('GET /api/transactions/my', my.status === 200 && Array.isArray(my.data), `status ${my.status}`);
  } catch (e) {
    failed++;
    console.log('  ❌ GET /api/transactions/my —', e.message);
  }

  // 11. Unauthenticated access to protected route
  try {
    const noAuth = await get('/api/transactions/my');
    ok('GET /api/transactions/my (no token) returns 401', noAuth.status === 401, `status ${noAuth.status}`);
  } catch (e) {
    ok('GET /api/transactions/my (no token) returns 401', false, e.message);
  }

  // 12. Invalid transaction id
  try {
    const invalid = await get('/api/transactions/00000000-0000-0000-0000-000000000000', token);
    ok('GET /api/transactions/invalid-id returns 404 or 403', invalid.status === 404 || invalid.status === 403, `status ${invalid.status}`);
  } catch (e) {
    ok('GET /api/transactions/invalid-id', false, e.message);
  }

  // 13. Login (existing user)
  try {
    const login = await post('/api/auth/login', { email: testEmail, password: testPassword });
    ok('POST /api/auth/login', login.status === 200 && login.data.token, `status ${login.status}`);
  } catch (e) {
    failed++;
    console.log('  ❌ POST /api/auth/login —', e.message);
  }

  // 14. Cancel transaction (buyer can cancel if not paid)
  if (transactionId) {
    try {
      const cancel = await post(`/api/transactions/${transactionId}/cancel`, {}, token);
      ok('POST /api/transactions/:id/cancel', cancel.status === 200, `status ${cancel.status}`);
    } catch (e) {
      failed++;
      console.log('  ❌ POST /api/transactions/:id/cancel —', e.message);
    }
  }

  // 15. Transaction timeline (use same or new tx id)
  if (transactionId) {
    try {
      const timeline = await get(`/api/transactions/${transactionId}/timeline`, token);
      ok('GET /api/transactions/:id/timeline', timeline.status === 200, `status ${timeline.status}`);
    } catch (e) {
      failed++;
      console.log('  ❌ GET /api/transactions/:id/timeline —', e.message);
    }
  }

  console.log('\n--- Summary ---');
  console.log(`  Passed: ${passed}, Failed: ${failed}\n`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error('Test run failed:', err);
  process.exit(1);
});
