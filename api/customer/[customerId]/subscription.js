/**
 * Serverless Function to Get Customer Subscription
 * 
 * Vercel: Place in /api/customer/[customerId]/subscription.js
 * Netlify: Place in /netlify/functions/customer-subscription.js (and modify to extract customerId from path)
 */

// For Vercel
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  const { customerId } = req.query;

  if (!customerId) {
    return res.status(400).json({ message: 'Customer ID is required' });
  }

  try {
    // Get active subscriptions for the customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return res.status(404).json({ message: 'No subscription found' });
    }

    const subscription = subscriptions.data[0];
    
    // Get product/price details
    const priceId = subscription.items.data[0].price.id;
    const price = await stripe.prices.retrieve(priceId);
    const product = await stripe.products.retrieve(price.product);

    return res.status(200).json({
      status: subscription.status,
      currentPeriodEnd: subscription.current_period_end,
      planName: product.name,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

// For Netlify Functions (uncomment and use this instead)
// Note: Netlify doesn't support dynamic routes the same way, so you'd need to pass customerId in the body
/*
exports.handler = async (event, context) => {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method not allowed' }),
    };
  }

  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  const { customerId } = event.queryStringParameters || {};

  if (!customerId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Customer ID is required' }),
    };
  }

  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'No subscription found' }),
      };
    }

    const subscription = subscriptions.data[0];
    const priceId = subscription.items.data[0].price.id;
    const price = await stripe.prices.retrieve(priceId);
    const product = await stripe.products.retrieve(price.product);

    return {
      statusCode: 200,
      body: JSON.stringify({
        status: subscription.status,
        currentPeriodEnd: subscription.current_period_end,
        planName: product.name,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
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



