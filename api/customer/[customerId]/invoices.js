/**
 * Serverless Function to Get Customer Invoices
 * 
 * Uses Stripe Invoices API: GET /v1/invoices?customer=cus_xxx
 * Reference: https://docs.stripe.com/api/invoices/list
 * 
 * This endpoint:
 * 1. Takes a customer ID (obtained from email lookup)
 * 2. Calls Stripe's Invoices API to list all invoices for that customer
 * 3. Filters for one-time purchases (invoices where subscription === null)
 * 4. Returns formatted invoice data with line items
 * 
 * Vercel: Place in /api/customer/[customerId]/invoices.js
 * Netlify: Place in /netlify/functions/customer-invoices.js (and modify to extract customerId from path)
 */

// For Vercel
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  const { customerId } = req.query;
  const { status, subscription } = req.query; // Optional filters

  if (!customerId) {
    return res.status(400).json({ message: 'Customer ID is required' });
  }

  try {
    console.log(`\n========== [INVOICES API] STARTING FETCH ==========`);
    console.log(`[INVOICES API] Customer ID: ${customerId}`);
    console.log(`[INVOICES API] Filters - status: ${status || 'all'}, subscription: ${subscription || 'all'}`);

    // Build query parameters for Stripe Invoices API
    // Reference: https://docs.stripe.com/api/invoices/list
    // GET /v1/invoices?customer=cus_xxx
    const listParams = {
      customer: customerId,
      limit: 100, // Stripe's max per page
    };

    // Add optional status filter
    if (status) {
      listParams.status = status;
    }

    // List ALL invoices using Stripe Invoices API (handle pagination)
    // Reference: https://docs.stripe.com/api/pagination
    let allInvoices = [];
    let hasMore = true;
    let startingAfter = null;
    
    while (hasMore) {
      const params = { ...listParams };
      if (startingAfter) {
        params.starting_after = startingAfter;
      }
      
      // Call Stripe Invoices API
      const invoices = await stripe.invoices.list(params);
      allInvoices = allInvoices.concat(invoices.data);
      
      hasMore = invoices.has_more;
      if (hasMore && invoices.data.length > 0) {
        startingAfter = invoices.data[invoices.data.length - 1].id;
      }
      
      console.log(`[INVOICES API] Fetched ${invoices.data.length} invoices (total so far: ${allInvoices.length})`);
      
      // Safety limit to prevent infinite loops
      if (allInvoices.length >= 1000) {
        console.warn(`[INVOICES API] Reached safety limit of 1000 invoices, stopping pagination`);
        break;
      }
    }
    
    console.log(`[INVOICES API] Total invoices fetched: ${allInvoices.length}`);
    
    // Log invoice breakdown
    const oneTimeCount = allInvoices.filter(inv => inv.subscription === null).length;
    const subscriptionCount = allInvoices.filter(inv => inv.subscription !== null).length;
    console.log(`[INVOICES API] Breakdown: ${oneTimeCount} one-time purchases, ${subscriptionCount} subscription invoices`);

    // Process invoices to get line items
    // For one-time purchases, we need to fetch line items separately
    // Reference: https://docs.stripe.com/api/invoices/line_items
    const processedInvoices = [];
    
    for (const invoice of allInvoices) {
      // Apply filters
      if (subscription === 'null' && invoice.subscription !== null) {
        continue; // Skip subscription invoices when filtering for one-time
      }
      if (subscription && subscription !== 'all' && subscription !== 'null' && invoice.subscription !== subscription) {
        continue; // Skip invoices that don't match the subscription filter
      }
      
      try {
        // Fetch line items for this invoice
        // Reference: https://docs.stripe.com/api/invoices/line_items
        let lineItemsData = [];
        
        // Check if lines.data is already available (expanded)
        if (invoice.lines && Array.isArray(invoice.lines.data) && invoice.lines.data.length > 0) {
          lineItemsData = invoice.lines.data;
        } else {
          // Fetch line items using the Invoice Line Items API
          const lineItemsResponse = await stripe.invoices.listLineItems(invoice.id, {
            limit: 100,
          });
          lineItemsData = lineItemsResponse.data || [];
        }
        
        // Process line items
        const lineItems = [];
        for (const line of lineItemsData) {
          // Extract price ID (can be string or expanded object)
          const priceId = typeof line.price === 'string' 
            ? line.price 
            : line.price?.id || null;
          
          // Extract product ID (can be string or expanded object)
          let productId = null;
          if (line.price) {
            const productObj = typeof line.price === 'object' ? line.price.product : null;
            productId = typeof productObj === 'string' 
              ? productObj 
              : productObj?.id || null;
          }
          
          lineItems.push({
            description: line.description,
            amount: line.amount,
            quantity: line.quantity,
            priceId: priceId,
            productId: productId,
          });
        }
        
        processedInvoices.push({
          id: invoice.id,
          amount: invoice.amount_paid || invoice.total,
          currency: invoice.currency,
          date: invoice.created,
          status: invoice.status,
          subscription: invoice.subscription, // null for one-time purchases
          invoicePdf: invoice.invoice_pdf,
          hostedInvoiceUrl: invoice.hosted_invoice_url,
          lineItems: lineItems,
        });
      } catch (err) {
        console.error(`[INVOICES API] Error processing invoice ${invoice.id}:`, err.message);
        // Still add the invoice without line items
        processedInvoices.push({
          id: invoice.id,
          amount: invoice.amount_paid || invoice.total,
          currency: invoice.currency,
          date: invoice.created,
          status: invoice.status,
          subscription: invoice.subscription,
          invoicePdf: invoice.invoice_pdf,
          hostedInvoiceUrl: invoice.hosted_invoice_url,
          lineItems: [],
        });
      }
    }
    
    console.log(`[INVOICES API] Processed ${processedInvoices.length} invoices`);

    // Return response in Stripe-like format
    const response = {
      object: 'list',
      url: '/v1/invoices',
      has_more: false,
      data: processedInvoices,
      count: processedInvoices.length,
    };

    console.log(`[INVOICES API] Returning ${processedInvoices.length} invoices`);
    console.log(`========== END INVOICES API ==========\n`);

    return res.status(200).json(response);
  } catch (error) {
    console.error('[INVOICES API] Error fetching invoices:', error);
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
  const { customerId, status, subscription } = event.queryStringParameters || {};

  if (!customerId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Customer ID is required' }),
    };
  }

  try {
    const listParams = {
      customer: customerId,
      limit: 100,
      expand: ['data.lines.data.price.product'],
    };

    if (status) {
      listParams.status = status;
    }

    const invoices = await stripe.invoices.list(listParams);

    let filteredInvoices = invoices.data;
    if (subscription === 'null') {
      filteredInvoices = invoices.data.filter(inv => inv.subscription === null);
    } else if (subscription && subscription !== 'all') {
      filteredInvoices = invoices.data.filter(inv => inv.subscription === subscription);
    }

    const transformedInvoices = filteredInvoices.map(invoice => {
      const lineItems = (invoice.lines?.data || []).map(line => {
        const priceId = typeof line.price === 'string' 
          ? line.price 
          : line.price?.id || null;
        
        const productId = typeof line.price === 'object' && line.price?.product
          ? (typeof line.price.product === 'string' ? line.price.product : line.price.product.id)
          : null;
        
        const productName = typeof line.price === 'object' && line.price?.product
          ? (typeof line.price.product === 'object' && line.price.product.name ? line.price.product.name : null)
          : null;

        return {
          description: line.description,
          amount: line.amount,
          quantity: line.quantity,
          priceId: priceId,
          productId: productId,
          productName: productName,
        };
      });

      return {
        id: invoice.id,
        amount: invoice.amount_paid || invoice.total,
        currency: invoice.currency,
        date: invoice.created,
        status: invoice.status,
        subscription: invoice.subscription,
        invoicePdf: invoice.invoice_pdf,
        hostedInvoiceUrl: invoice.hosted_invoice_url,
        lineItems: lineItems,
      };
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        invoices: transformedInvoices,
        count: transformedInvoices.length,
        total: invoices.data.length,
      }),
    };
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message }),
    };
  }
};
*/

