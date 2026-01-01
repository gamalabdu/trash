/**
 * Serverless Function to Get Customer Charges
 * 
 * Uses Stripe Charges API: GET /v1/charges?customer=cus_xxx
 * Reference: https://docs.stripe.com/api/charges/list
 * 
 * This endpoint:
 * 1. Takes a customer ID (obtained from email lookup)
 * 2. Calls Stripe's Charges API to list all charges for that customer
 * 3. Returns formatted charge data with payment details
 * 
 * Vercel: Place in /api/customer/[customerId]/charges.js
 * Netlify: Place in /netlify/functions/customer-charges.js (and modify to extract customerId from path)
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
    console.log(`\n========== [CHARGES API] STARTING FETCH ==========`);
    console.log(`[CHARGES API] Customer ID: ${customerId}`);
    console.log(`[CHARGES API] Filters - status: ${status || 'all'}`);

    // Build query parameters for Stripe Charges API
    // Reference: https://docs.stripe.com/api/charges/list
    // GET /v1/charges?customer=cus_xxx
    const listParams = {
      customer: customerId,
      limit: 100, // Stripe's max per page
    };

    // Add optional status filter (succeeded, pending, failed)
    if (status) {
      // Note: Charges API doesn't have a direct status filter, but we can filter after fetching
      // We'll filter by payment_intent.status or charge status
    }

    // List ALL charges using Stripe Charges API (handle pagination)
    // Reference: https://docs.stripe.com/api/pagination
    let allCharges = [];
    let hasMore = true;
    let startingAfter = null;
    
    while (hasMore) {
      const params = { ...listParams };
      if (startingAfter) {
        params.starting_after = startingAfter;
      }
      
      // Call Stripe Charges API
      const charges = await stripe.charges.list(params);
      allCharges = allCharges.concat(charges.data);
      
      hasMore = charges.has_more;
      if (hasMore && charges.data.length > 0) {
        startingAfter = charges.data[charges.data.length - 1].id;
      }
      
      console.log(`[CHARGES API] Fetched ${charges.data.length} charges (total so far: ${allCharges.length})`);
      
      // Safety limit to prevent infinite loops
      if (allCharges.length >= 1000) {
        console.warn(`[CHARGES API] Reached safety limit of 1000 charges, stopping pagination`);
        break;
      }
    }
    
    console.log(`[CHARGES API] Total charges fetched: ${allCharges.length}`);
    
    // Log charge breakdown
    const succeededCount = allCharges.filter(ch => ch.status === 'succeeded').length;
    const pendingCount = allCharges.filter(ch => ch.status === 'pending').length;
    const failedCount = allCharges.filter(ch => ch.status === 'failed').length;
    console.log(`[CHARGES API] Breakdown: ${succeededCount} succeeded, ${pendingCount} pending, ${failedCount} failed`);
    
    // Log sample charges for debugging
    if (allCharges.length > 0) {
      console.log(`\n[CHARGES API] Sample charges (first 3):`);
      allCharges.slice(0, 3).forEach((ch, idx) => {
        console.log(`  ${idx + 1}. Charge ${ch.id}:`);
        console.log(`     - Status: ${ch.status}`);
        console.log(`     - Amount: ${ch.amount} ${ch.currency}`);
        console.log(`     - Description: ${ch.description || 'N/A'}`);
        console.log(`     - Created: ${new Date(ch.created * 1000).toISOString()}`);
        console.log(`     - Invoice: ${ch.invoice || 'N/A'}`);
        console.log(`     - Payment Intent: ${ch.payment_intent || 'N/A'}`);
      });
    }

    // Process charges to format response
    const processedCharges = [];
    
    for (const charge of allCharges) {
      // Apply status filter if provided
      if (status && charge.status !== status) {
        continue;
      }
      
      // Extract payment intent ID if available
      const paymentIntentId = typeof charge.payment_intent === 'string' 
        ? charge.payment_intent 
        : charge.payment_intent?.id || null;
      
      // Extract invoice ID if available
      const invoiceId = typeof charge.invoice === 'string' 
        ? charge.invoice 
        : charge.invoice?.id || null;
      
      // Extract receipt URL if available
      const receiptUrl = charge.receipt_url || null;
      
      processedCharges.push({
        id: charge.id,
        amount: charge.amount,
        currency: charge.currency,
        date: charge.created,
        status: charge.status,
        description: charge.description,
        receiptUrl: receiptUrl,
        invoiceId: invoiceId,
        paymentIntentId: paymentIntentId,
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
    
    console.log(`[CHARGES API] Processed ${processedCharges.length} charges`);

    // Return response in Stripe-like format
    const response = {
      object: 'list',
      url: '/v1/charges',
      has_more: false,
      data: processedCharges,
      count: processedCharges.length,
    };

    console.log(`[CHARGES API] Returning ${processedCharges.length} charges`);
    console.log(`========== END CHARGES API ==========\n`);

    return res.status(200).json(response);
  } catch (error) {
    console.error('[CHARGES API] Error fetching charges:', error);
    return res.status(500).json({ message: error.message });
  }
}



