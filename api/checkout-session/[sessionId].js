/**
 * Serverless Function to Retrieve Checkout Session Details
 * Used to get customer ID after successful checkout
 * 
 * Vercel: Place in /api/checkout-session/[sessionId].js
 * Netlify: Place in /netlify/functions/checkout-session.js (and modify to extract sessionId from query params)
 */

// For Vercel
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  const { sessionId } = req.query;

  if (!sessionId) {
    return res.status(400).json({ message: 'Session ID is required' });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['customer', 'subscription'],
    });

    return res.status(200).json({
      customerId: session.customer,
      customerEmail: session.customer_details?.email || session.customer_email,
      subscriptionId: session.subscription,
      paymentStatus: session.payment_status,
      mode: session.mode, // 'payment' for one-time, 'subscription' for recurring
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

// For Netlify Functions (uncomment and use this instead)
/*
exports.handler = async (event, context) => {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method not allowed' }),
    };
  }

  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  const { sessionId } = event.queryStringParameters || {};

  if (!sessionId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Session ID is required' }),
    };
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['customer', 'subscription'],
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        customerId: session.customer,
        customerEmail: session.customer_details?.email || session.customer_email,
        subscriptionId: session.subscription,
        paymentStatus: session.payment_status,
        mode: session.mode, // 'payment' for one-time, 'subscription' for recurring
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message }),
    };
  }
};
*/

