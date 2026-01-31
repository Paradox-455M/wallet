const Notification = require('../models/Notification');

const TYPES = {
  TRANSACTION_CREATED: 'transaction_created',
  PAYMENT_RECEIVED: 'payment_received',
  FILE_UPLOADED: 'file_uploaded',
  TRANSACTION_COMPLETED: 'transaction_completed',
  PAYMENT_REQUIRED: 'payment_required',
  TRANSACTION_CANCELLED: 'transaction_cancelled',
};

async function notifyTransactionCreated(transactionId, buyerEmail, sellerEmail, amount, itemDescription) {
  const title = 'New transaction created';
  const message = `Transaction for $${amount}: ${itemDescription?.slice(0, 50)}...`;
  await Notification.create({
    userEmail: buyerEmail,
    transactionId,
    type: TYPES.TRANSACTION_CREATED,
    title,
    message,
  });
  await Notification.create({
    userEmail: sellerEmail,
    transactionId,
    type: TYPES.TRANSACTION_CREATED,
    title: 'You have a new transaction',
    message: `Buyer ${buyerEmail} created a transaction for $${amount}`,
  });
}

async function notifyPaymentReceived(transactionId, buyerEmail, sellerEmail, amount) {
  await Notification.create({
    userEmail: sellerEmail,
    transactionId,
    type: TYPES.PAYMENT_RECEIVED,
    title: 'Payment received',
    message: `Payment of $${amount} received. Please upload the file.`,
  });
  await Notification.create({
    userEmail: buyerEmail,
    transactionId,
    type: TYPES.PAYMENT_RECEIVED,
    title: 'Payment confirmed',
    message: 'Your payment has been received. Waiting for seller to upload the file.',
  });
}

async function notifyFileUploaded(transactionId, buyerEmail, sellerEmail, fileName) {
  await Notification.create({
    userEmail: buyerEmail,
    transactionId,
    type: TYPES.FILE_UPLOADED,
    title: 'File uploaded',
    message: fileName ? `Seller uploaded: ${fileName}` : 'Seller has uploaded the file. You can download it now.',
  });
}

async function notifyTransactionCompleted(transactionId, buyerEmail, sellerEmail, amount) {
  const title = 'Transaction completed';
  const message = `Transaction for $${amount} has been completed.`;
  await Notification.create({
    userEmail: buyerEmail,
    transactionId,
    type: TYPES.TRANSACTION_COMPLETED,
    title,
    message,
  });
  await Notification.create({
    userEmail: sellerEmail,
    transactionId,
    type: TYPES.TRANSACTION_COMPLETED,
    title,
    message: `Funds have been released. You received $${amount}.`,
  });
}

async function notifyPaymentRequired(transactionId, buyerEmail, amount) {
  await Notification.create({
    userEmail: buyerEmail,
    transactionId,
    type: TYPES.PAYMENT_REQUIRED,
    title: 'Payment required',
    message: `Please complete your payment of $${amount}.`,
  });
}

async function notifyTransactionCancelled(transactionId, buyerEmail, sellerEmail) {
  const title = 'Transaction cancelled';
  await Notification.create({
    userEmail: buyerEmail,
    transactionId,
    type: TYPES.TRANSACTION_CANCELLED,
    title,
    message: 'This transaction has been cancelled.',
  });
  await Notification.create({
    userEmail: sellerEmail,
    transactionId,
    type: TYPES.TRANSACTION_CANCELLED,
    title,
    message: 'This transaction has been cancelled.',
  });
}

module.exports = {
  notifyTransactionCreated,
  notifyPaymentReceived,
  notifyFileUploaded,
  notifyTransactionCompleted,
  notifyPaymentRequired,
  notifyTransactionCancelled,
  TYPES,
};
