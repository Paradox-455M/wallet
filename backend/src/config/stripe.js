const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const createPaymentIntent = async (amount, metadata) => {
  try {
    // Stripe metadata values must be strings
    const stringMetadata = {};
    if (metadata) {
      for (const [k, v] of Object.entries(metadata)) {
        stringMetadata[k] = v == null ? '' : String(v);
      }
    }
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      metadata: stringMetadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });
    return paymentIntent;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

const createRefund = async (paymentIntentId, options = {}) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== 'succeeded') {
      throw new Error('Payment has not succeeded; cannot refund');
    }
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      reason: options.reason || 'requested_by_customer',
      amount: options.amount ? Math.round(options.amount * 100) : undefined, // partial refund in cents
    });
    return refund;
  } catch (error) {
    console.error('Error creating refund:', error);
    throw error;
  }
};

const transferToSeller = async (amount, destination, transferGroup) => {
  try {
    // Calculate platform fee (e.g., 5%)
    const platformFee = Math.round(amount * 0.05);
    const transferAmount = Math.round(amount * 0.95);

    const transfer = await stripe.transfers.create({
      amount: transferAmount,
      currency: 'usd',
      destination,
      transfer_group: transferGroup,
    });

    return transfer;
  } catch (error) {
    console.error('Error transferring to seller:', error);
    throw error;
  }
};

const confirmPaymentIntent = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent.status === 'succeeded';
  } catch (error) {
    console.error('Error confirming payment intent:', error);
    throw error;
  }
};

module.exports = {
  createPaymentIntent,
  transferToSeller,
  confirmPaymentIntent,
  createRefund,
  stripe
};