/**
 * Serverless Function to Get All Customer Purchases
 * 
 * This endpoint combines Charges API and Invoices API to return all purchases
 * (both one-time and subscriptions) with type information.
 * 
 * Uses:
 * - Charges API: GET /v1/charges?customer=cus_xxx
 * - Invoices API: GET /v1/invoices?customer=cus_xxx
 * 
 * References:
 * - https://docs.stripe.com/api/charges/list
 * - https://docs.stripe.com/api/invoices/list
 * 
 * Vercel: Place in /api/customer/[customerId]/purchases.js
 * Netlify: Place in /netlify/functions/customer-purchases.js (and modify to extract customerId from path)
 */

// For Vercel
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  const { customerId } = req.query;
  const { status } = req.query; // Optional status filter

  if (!customerId) {
    return res.status(400).json({ message: 'Customer ID is required' });
  }

  try {
    console.log(`\n========== [PURCHASES API] STARTING FETCH ==========`);
    console.log(`[PURCHASES API] Customer ID: ${customerId}`);
    console.log(`[PURCHASES API] Filters - status: ${status || 'all'}`);

    // Step 1: Fetch all charges (includes both one-time and subscription charges)
    // Reference: https://docs.stripe.com/api/charges/list
    // Expand invoice to get subscription info directly if available
    const listParams = {
      customer: customerId,
      limit: 100,
      expand: ['data.invoice'], // Expand invoice to check subscription link
    };

    let allCharges = [];
    let hasMore = true;
    let startingAfter = null;
    
    while (hasMore) {
      const params = { ...listParams };
      if (startingAfter) {
        params.starting_after = startingAfter;
      }
      
      const charges = await stripe.charges.list(params);
      allCharges = allCharges.concat(charges.data);
      
      hasMore = charges.has_more;
      if (hasMore && charges.data.length > 0) {
        startingAfter = charges.data[charges.data.length - 1].id;
      }
      
      console.log(`[PURCHASES API] Fetched ${charges.data.length} charges (total so far: ${allCharges.length})`);
      
      if (allCharges.length >= 1000) {
        console.warn(`[PURCHASES API] Reached safety limit of 1000 charges, stopping pagination`);
        break;
      }
    }
    
    console.log(`[PURCHASES API] Total charges fetched: ${allCharges.length}`);

    // Step 2: Fetch all invoices to check which charges are linked to subscriptions
    // We need this to determine if a charge is from a subscription or one-time purchase
    const invoiceListParams = {
      customer: customerId,
      limit: 100,
    };

    let allInvoices = [];
    hasMore = true;
    startingAfter = null;
    
    while (hasMore) {
      const params = { ...invoiceListParams };
      if (startingAfter) {
        params.starting_after = startingAfter;
      }
      
      const invoices = await stripe.invoices.list(params);
      allInvoices = allInvoices.concat(invoices.data);
      
      hasMore = invoices.has_more;
      if (hasMore && invoices.data.length > 0) {
        startingAfter = invoices.data[invoices.data.length - 1].id;
      }
      
      if (allInvoices.length >= 1000) {
        break;
      }
    }

    // Create a map of invoice ID to subscription ID for quick lookup
    const invoiceToSubscriptionMap = new Map();
    allInvoices.forEach(invoice => {
      if (invoice.subscription) {
        const subscriptionId = typeof invoice.subscription === 'string' 
          ? invoice.subscription 
          : invoice.subscription.id;
        invoiceToSubscriptionMap.set(invoice.id, subscriptionId);
      }
    });

    console.log(`[PURCHASES API] Total invoices fetched: ${allInvoices.length}`);
    console.log(`[PURCHASES API] Invoices with subscriptions: ${invoiceToSubscriptionMap.size}`);

    // Step 2.5: Fetch Checkout Sessions as a primary source (since we're using Checkout)
    // Checkout Sessions have mode property that clearly identifies one-time vs subscription
    // Reference: https://docs.stripe.com/api/checkout/sessions/list
    console.log(`\n[PURCHASES API] Fetching checkout sessions...`);
    let allCheckoutSessions = [];
    hasMore = true;
    startingAfter = null;
    
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
      
      console.log(`[PURCHASES API] Fetched ${checkoutSessions.data.length} checkout sessions (total so far: ${allCheckoutSessions.length})`);
      
      if (allCheckoutSessions.length >= 1000) {
        break;
      }
    }
    
    console.log(`[PURCHASES API] Total checkout sessions fetched: ${allCheckoutSessions.length}`);
    
    // Filter for completed/paid sessions only
    const completedSessions = allCheckoutSessions.filter(session => 
      session.payment_status === 'paid' || session.status === 'complete'
    );
    
    const oneTimeSessions = completedSessions.filter(session => session.mode === 'payment');
    const subscriptionSessions = completedSessions.filter(session => session.mode === 'subscription');
    
    console.log(`[PURCHASES API] Completed sessions: ${completedSessions.length} (${oneTimeSessions.length} one-time, ${subscriptionSessions.length} subscription)`);

    // Step 3: Process charges and determine purchase type
    const processedPurchases = [];
    
    for (const charge of allCharges) {
      // Apply status filter if provided
      if (status && charge.status !== status) {
        continue;
      }
      
      // Extract invoice ID if available (can be string ID or expanded object)
      let invoiceId = null;
      let invoiceSubscriptionId = null;
      
      if (charge.invoice) {
        if (typeof charge.invoice === 'string') {
          invoiceId = charge.invoice;
          // Check if this invoice is in our subscription map
          if (invoiceToSubscriptionMap.has(invoiceId)) {
            invoiceSubscriptionId = invoiceToSubscriptionMap.get(invoiceId);
          }
        } else if (charge.invoice.id) {
          // Expanded invoice object
          invoiceId = charge.invoice.id;
          // Check both the map and the expanded invoice object
          if (charge.invoice.subscription) {
            invoiceSubscriptionId = typeof charge.invoice.subscription === 'string' 
              ? charge.invoice.subscription 
              : charge.invoice.subscription.id;
          } else if (invoiceToSubscriptionMap.has(invoiceId)) {
            invoiceSubscriptionId = invoiceToSubscriptionMap.get(invoiceId);
          }
        }
      }
      
      // Determine purchase type: check if charge is linked to a subscription
      let purchaseType = 'one-time';
      let subscriptionId = null;
      
      if (invoiceSubscriptionId) {
        purchaseType = 'subscription';
        subscriptionId = invoiceSubscriptionId;
      }
      
      // Extract payment intent ID if available
      const paymentIntentId = typeof charge.payment_intent === 'string' 
        ? charge.payment_intent 
        : charge.payment_intent?.id || null;
      
      // Extract receipt URL if available
      const receiptUrl = charge.receipt_url || null;
      
      processedPurchases.push({
        id: charge.id,
        type: purchaseType, // 'one-time' or 'subscription'
        amount: charge.amount,
        currency: charge.currency,
        date: charge.created,
        status: charge.status,
        description: charge.description,
        receiptUrl: receiptUrl,
        invoiceId: invoiceId,
        paymentIntentId: paymentIntentId,
        subscriptionId: subscriptionId, // null for one-time purchases
        // Include billing details if available
        billingDetails: charge.billing_details ? {
          name: charge.billing_details.name,
          email: charge.billing_details.email,
        } : null,
        // Include payment method details
        paymentMethod: charge.payment_method_details ? {
          type: charge.payment_method_details.type,
          card: charge.payment_method_details.card ? {
            brand: charge.payment_method_details.card.brand,
            last4: charge.payment_method_details.card.last4,
          } : null,
        } : null,
      });
    }
    
    // Step 4: Process Checkout Sessions and add to purchases
    // Create a set of payment intent IDs we've already processed to avoid duplicates
    const processedPaymentIntentIds = new Set(processedPurchases.map(p => p.paymentIntentId).filter(Boolean));
    
    console.log(`\n[PURCHASES API] Processing checkout sessions...`);
    
    for (const session of completedSessions) {
      try {
        // Retrieve full session with line items
        const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
          expand: ['line_items.data.price.product', 'payment_intent'],
        });
        
        // Skip if we already have this purchase from charges (check by payment intent)
        if (fullSession.payment_intent) {
          const paymentIntentId = typeof fullSession.payment_intent === 'string' 
            ? fullSession.payment_intent 
            : fullSession.payment_intent.id;
          
          if (processedPaymentIntentIds.has(paymentIntentId)) {
            console.log(`[PURCHASES API] Skipping checkout session ${session.id} - already processed via charge`);
            continue;
          }
        }
        
        // Determine purchase type from session mode
        const purchaseType = session.mode === 'payment' ? 'one-time' : 'subscription';
        
        // Get amount from session
        const amount = fullSession.amount_total || 0;
        const currency = fullSession.currency || 'usd';
        
        // Get description from line items
        let description = null;
        if (fullSession.line_items && fullSession.line_items.data && fullSession.line_items.data.length > 0) {
          const firstItem = fullSession.line_items.data[0];
          description = firstItem.description || 
            (firstItem.price && typeof firstItem.price === 'object' && firstItem.price.product 
              ? (typeof firstItem.price.product === 'object' ? firstItem.price.product.name : null)
              : null);
        }
        
        // Get payment intent ID
        const paymentIntentId = fullSession.payment_intent 
          ? (typeof fullSession.payment_intent === 'string' ? fullSession.payment_intent : fullSession.payment_intent.id)
          : null;
        
        // Get invoice ID if available
        const invoiceId = fullSession.invoice || null;
        
        // Get subscription ID if this is a subscription session
        let subscriptionId = null;
        if (session.mode === 'subscription' && fullSession.subscription) {
          subscriptionId = typeof fullSession.subscription === 'string' 
            ? fullSession.subscription 
            : fullSession.subscription.id;
        }
        
        // Get receipt URL (hosted invoice URL for subscriptions, or receipt URL for one-time)
        const receiptUrl = fullSession.mode === 'subscription' 
          ? fullSession.invoice ? `https://pay.stripe.com/invoices/${fullSession.invoice}` : null
          : fullSession.payment_intent && typeof fullSession.payment_intent === 'object'
            ? fullSession.payment_intent.charges?.data?.[0]?.receipt_url || null
            : null;
        
        processedPurchases.push({
          id: `cs_${session.id}`, // Prefix with 'cs_' to distinguish from charges
          type: purchaseType,
          amount: amount,
          currency: currency,
          date: session.created,
          status: 'succeeded', // Checkout sessions with payment_status='paid' are succeeded
          description: description,
          receiptUrl: receiptUrl,
          invoiceId: invoiceId,
          paymentIntentId: paymentIntentId,
          subscriptionId: subscriptionId,
          checkoutSessionId: session.id, // Keep reference to checkout session
          billingDetails: fullSession.customer_details ? {
            name: fullSession.customer_details.name,
            email: fullSession.customer_details.email,
          } : null,
          paymentMethod: null, // Payment method details not directly available in checkout session
        });
        
        console.log(`[PURCHASES API] Added ${purchaseType} purchase from checkout session ${session.id}: ${amount} ${currency}`);
      } catch (err) {
        console.error(`[PURCHASES API] Error processing checkout session ${session.id}:`, err.message);
      }
    }
    
    console.log(`[PURCHASES API] After adding checkout sessions: ${processedPurchases.length} total purchases`);
    
    // Sort by date (newest first)
    processedPurchases.sort((a, b) => b.date - a.date);
    
    const oneTimeCount = processedPurchases.filter(p => p.type === 'one-time').length;
    const subscriptionCount = processedPurchases.filter(p => p.type === 'subscription').length;
    
    console.log(`[PURCHASES API] Processed ${processedPurchases.length} purchases`);
    console.log(`[PURCHASES API] Breakdown: ${oneTimeCount} one-time purchases, ${subscriptionCount} subscription payments`);
    console.log(`========== END PURCHASES API ==========\n`);

    // Return response
    const response = {
      object: 'list',
      url: '/v1/purchases',
      has_more: false,
      data: processedPurchases,
      count: processedPurchases.length,
      breakdown: {
        oneTime: oneTimeCount,
        subscription: subscriptionCount,
        total: processedPurchases.length,
      },
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('[PURCHASES API] Error fetching purchases:', error);
    return res.status(500).json({ message: error.message });
  }
}

// For Netlify Functions (uncomment and use this instead)
// Note: Netlify doesn't support dynamic routes the same way, so you'd need to pass customerId in the query params
/*
exports.handler = async (event, context) => {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method not allowed' }),
    };
  }

  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  const { customerId, status } = event.queryStringParameters || {};

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
    console.error('[PURCHASES API] Error fetching purchases:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message }),
    };
  }
};
*/

