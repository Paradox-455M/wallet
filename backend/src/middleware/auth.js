const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token - user not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    return res.status(500).json({ message: 'Token verification failed' });
  }
};

// Middleware to check if user owns the transaction
const checkTransactionOwnership = async (req, res, next) => {
  try {
    const { transactionId } = req.params;
    const userEmail = req.user.email;
    
    const Transaction = require('../models/Transaction');
    const transaction = await Transaction.findById(transactionId);
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    if (transaction.buyer_email !== userEmail && transaction.seller_email !== userEmail) {
      return res.status(403).json({ message: 'Access denied - not your transaction' });
    }
    
    req.transaction = transaction;
    next();
  } catch (error) {
    console.error('Error checking transaction ownership:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  authenticateToken,
  checkTransactionOwnership
};