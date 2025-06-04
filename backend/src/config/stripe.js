const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const createPaymentIntent = async (amount, metadata) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      metadata,
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
  stripe
};