/**
 * Serverless Function to Get Checkout Sessions for a Customer
 * Filters for checkout sessions where mode === 'payment' (one-time payments)
 * 
 * Reference: https://docs.stripe.com/api/checkout/sessions/list
 * 
 * Vercel: Place in /api/customer/[customerId]/checkout-sessions.js
 * Netlify: Place in /netlify/functions/customer-checkout-sessions.js
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
    console.log(`\n========== [CHECKOUT SESSIONS API] STARTING FETCH ==========`);
    console.log(`[CHECKOUT SESSIONS API] Customer ID: ${customerId}`);

    // Fetch all checkout sessions for this customer
    let allCheckoutSessions = [];
    let hasMore = true;
    let startingAfter = null;
    
    const checkoutSessionParams = {
      customer: customerId,
      limit: 100,
    };
    
    while (hasMore) {
      const params = { ...checkoutSessionParams };
      if (startingAfter) {
        params.starting_after = startingAfter;
      }
      
      const checkoutSessions = await stripe.checkout.sessions.list(params);
      allCheckoutSessions = allCheckoutSessions.concat(checkoutSessions.data);
      
      hasMore = checkoutSessions.has_more;
      if (hasMore && checkoutSessions.data.length > 0) {
        startingAfter = checkoutSessions.data[checkoutSessions.data.length - 1].id;
      }
      
      console.log(`[CHECKOUT SESSIONS API] Fetched ${checkoutSessions.data.length} checkout sessions (total so far: ${allCheckoutSessions.length})`);
      
      if (allCheckoutSessions.length >= 1000) {
        break;
      }
    }
    
    console.log(`[CHECKOUT SESSIONS API] Total checkout sessions fetched: ${allCheckoutSessions.length}`);
    
    // Filter for completed/paid sessions (both payment and subscription modes)
    const completedSessions = allCheckoutSessions.filter(session => 
      session.payment_status === 'paid' || session.status === 'complete'
    );
    
    // Separate by mode for logging
    const paymentSessions = completedSessions.filter(session => session.mode === 'payment');
    const subscriptionSessions = completedSessions.filter(session => session.mode === 'subscription');
    
    console.log(`[CHECKOUT SESSIONS API] Completed sessions: ${completedSessions.length} (${paymentSessions.length} payment, ${subscriptionSessions.length} subscription)`);
    
    // Expand and enrich session data for ALL completed sessions (not just payment)
    const enrichedSessions = [];
    for (const session of completedSessions) {
      try {
        // Retrieve full session with line items
        const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
          expand: ['line_items.data.price.product', 'payment_intent'],
        });
        
        // Get description from line items
        let description = null;
        if (fullSession.line_items && fullSession.line_items.data && fullSession.line_items.data.length > 0) {
          const firstItem = fullSession.line_items.data[0];
          description = firstItem.description || 
            (firstItem.price && typeof firstItem.price === 'object' && firstItem.price.product 
              ? (typeof firstItem.price.product === 'object' ? firstItem.price.product.name : null)
              : null);
        }
        
        enrichedSessions.push({
          id: fullSession.id,
          mode: fullSession.mode,
          amount: fullSession.amount_total || 0,
          currency: fullSession.currency || 'usd',
          date: fullSession.created,
          status: fullSession.payment_status === 'paid' ? 'succeeded' : fullSession.status,
          paymentStatus: fullSession.payment_status,
          description: description,
          customerId: fullSession.customer,
          customerEmail: fullSession.customer_details?.email || fullSession.customer_email,
          paymentIntentId: fullSession.payment_intent 
            ? (typeof fullSession.payment_intent === 'string' ? fullSession.payment_intent : fullSession.payment_intent.id)
            : null,
          invoiceId: fullSession.invoice || null,
          url: fullSession.url,
          successUrl: fullSession.success_url,
          cancelUrl: fullSession.cancel_url,
        });
      } catch (err) {
        console.error(`[CHECKOUT SESSIONS API] Error processing checkout session ${session.id}:`, err.message);
      }
    }
    
    // Sort by date (newest first)
    enrichedSessions.sort((a, b) => b.date - a.date);
    
    // Separate payment and subscription sessions in response
    const paymentModeSessions = enrichedSessions.filter(s => s.mode === 'payment');
    const subscriptionModeSessions = enrichedSessions.filter(s => s.mode === 'subscription');
    
    console.log(`[CHECKOUT SESSIONS API] Returning ${enrichedSessions.length} total checkout sessions (${paymentModeSessions.length} payment, ${subscriptionModeSessions.length} subscription)`);
    console.log(`========== END CHECKOUT SESSIONS API ==========\n`);

    return res.status(200).json({
      object: 'list',
      data: enrichedSessions, // Return all completed sessions
      count: enrichedSessions.length,
      breakdown: {
        payment: paymentModeSessions.length,
        subscription: subscriptionModeSessions.length,
        total: enrichedSessions.length,
      },
    });
  } catch (error) {
    console.error('[CHECKOUT SESSIONS API] Error fetching checkout sessions:', error);
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
  const { customerId } = event.queryStringParameters || {};

  if (!customerId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Customer ID is required' }),
    };
  }

  try {
    // Same implementation as above...
    // (Copy the try block content from above)
  } catch (error) {
    console.error('[CHECKOUT SESSIONS API] Error fetching checkout sessions:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message }),
    };
  }
};
*/

