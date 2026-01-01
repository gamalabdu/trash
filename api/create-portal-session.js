/**
 * Serverless Function for Stripe Customer Portal
 * 
 * The Stripe Customer Portal automatically shows:
 * - Active subscriptions (manage, cancel, update payment methods)
 * - Payment history/invoices (includes BOTH subscription invoices AND one-time purchase invoices)
 * 
 * To use a custom portal configuration created in Stripe Dashboard:
 * 1. Go to Stripe Dashboard → Settings → Billing → Customer Portal
 * 2. Create or select your custom portal configuration
 * 3. Copy the Configuration ID (starts with bpc_)
 * 4. Pass it as 'configuration' parameter when calling this endpoint
 * 
 * If no configuration is provided, Stripe will use the default portal configuration.
 * 
 * Deploy this to Vercel, Netlify, or any serverless platform
 * 
 * Vercel: Place in /api/create-portal-session.js
 * Netlify: Place in /netlify/functions/create-portal-session.js
 */

// For Vercel
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  const { customerId, returnUrl, configuration } = req.body;

  if (!customerId) {
    return res.status(400).json({ message: 'Customer ID is required' });
  }

  try {
    const sessionParams = {
      customer: customerId,
      return_url: returnUrl || `${req.headers.origin || 'https://yourdomain.com'}/billing`,
    };

    // Use custom portal configuration if provided, otherwise use environment variable or default
    const portalConfig = configuration || process.env.STRIPE_PORTAL_CONFIGURATION_ID;
    if (portalConfig) {
      sessionParams.configuration = portalConfig;
      console.log(`[Portal] Using custom portal configuration: ${portalConfig}`);
    } else {
      console.log('[Portal] Using default portal configuration');
    }

    const session = await stripe.billingPortal.sessions.create(sessionParams);

    return res.status(200).json({ url: session.url });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

// For Netlify Functions (uncomment and use this instead)
/*
exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method not allowed' }),
    };
  }

  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  const { customerId, returnUrl } = JSON.parse(event.body);

  if (!customerId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Customer ID is required' }),
    };
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl || `${event.headers.origin || 'https://yourdomain.com'}/billing`,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message }),
    };
  }
};
*/

