const User = require('../models/User');

/**
 * Require the request user to be an admin.
 * Admin = user has is_admin true in DB, or email is in ADMIN_EMAILS env (comma-separated).
 */
async function requireAdmin(req, res, next) {
  if (!req.user || !req.user.email) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  try {
    const adminEmails = (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    if (adminEmails.includes(req.user.email.toLowerCase())) {
      return next();
    }
    const user = await User.findByEmail(req.user.email);
    if (user && user.is_admin === true) {
      return next();
    }
    return res.status(403).json({ error: 'Admin access required' });
  } catch (err) {
    console.error('Admin check error:', err);
    return res.status(500).json({ error: 'Failed to verify admin access' });
  }
}

module.exports = { requireAdmin };
