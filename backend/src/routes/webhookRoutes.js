const express = require('express');
const router = express.Router();
const TransactionService = require('../services/transactionService');
const { stripe } = require('../config/stripe');

// Stripe webhook endpoint
// Note: This route should be before body parser in index.js
router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // Verify webhook signature
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      // For development/testing without webhook secret
      event = JSON.parse(req.body.toString());
      console.warn('⚠️  Webhook secret not configured - skipping signature verification');
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object);
        break;
      
      case 'payment_intent.canceled':
        await handlePaymentIntentCanceled(event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Return a response to acknowledge receipt of the event
    res.json({ received: true });
  } catch (error) {
    console.error('Error handling webhook event:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

// Handle successful payment
async function handlePaymentIntentSucceeded(paymentIntent) {
  const transactionId = paymentIntent.metadata?.transactionId;
  
  if (!transactionId) {
    console.log('No transaction ID in payment intent metadata');
    return;
  }

  try {
    // Confirm payment received in our system
    const transaction = await TransactionService.confirmPaymentReceived(transactionId);
    
    console.log(`✅ Payment confirmed for transaction ${transactionId}`);
    
    // Check if transaction can be completed
    const checkedTransaction = await TransactionService.checkAndCompleteTransaction(transactionId);
    
    if (checkedTransaction.status === 'completed') {
      console.log(`✅ Transaction ${transactionId} completed automatically`);
    }
  } catch (error) {
    console.error(`Error processing payment for transaction ${transactionId}:`, error);
    throw error;
  }
}

// Handle failed payment
async function handlePaymentIntentFailed(paymentIntent) {
  const transactionId = paymentIntent.metadata?.transactionId;
  
  if (!transactionId) {
    console.log('No transaction ID in payment intent metadata');
    return;
  }

  try {
    const Transaction = require('../models/Transaction');
    const transaction = await Transaction.findById(transactionId);
    
    if (transaction && !transaction.payment_received) {
      // Optionally update transaction status or send notification
      console.log(`❌ Payment failed for transaction ${transactionId}`);
      // You could update transaction status here if needed
    }
  } catch (error) {
    console.error(`Error handling failed payment for transaction ${transactionId}:`, error);
  }
}

// Handle canceled payment
async function handlePaymentIntentCanceled(paymentIntent) {
  const transactionId = paymentIntent.metadata?.transactionId;
  
  if (!transactionId) {
    return;
  }

  try {
    console.log(`⚠️  Payment canceled for transaction ${transactionId}`);
    // Optionally handle cancellation
  } catch (error) {
    console.error(`Error handling canceled payment for transaction ${transactionId}:`, error);
  }
}

module.exports = router;
