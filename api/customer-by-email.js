/**
 * Serverless Function to Look Up Customer by Email
 * Finds a Stripe customer by email and returns their subscription and purchase info
 * 
 * Vercel: Place in /api/customer-by-email.js
 */

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const normalizedEmail = email.toLowerCase().trim();
    console.log('Looking up customer by email:', normalizedEmail);

    // Try to find customer by email
    let customer = null;
    let attempts = 0;
    const maxAttempts = 3;

    while (!customer && attempts < maxAttempts) {
      if (attempts > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
      }

      const customers = await stripe.customers.list({
        email: normalizedEmail,
        limit: 10,
      });

      customer = customers.data.find(c => 
        c.email && c.email.toLowerCase().trim() === normalizedEmail
      );

      if (!customer && customers.data.length > 0) {
        customer = customers.data[0];
      }

      attempts++;
    }

    // If still not found, try searching recent customers
    if (!customer) {
      const fiveMinutesAgo = Math.floor(Date.now() / 1000) - 300;
      const recentCustomers = await stripe.customers.list({
        limit: 100,
        created: { gte: fiveMinutesAgo },
      });

      customer = recentCustomers.data.find(c => 
        c.email && c.email.toLowerCase().trim() === normalizedEmail
      );
    }

    // Last resort: Find customer via recent subscriptions
    if (!customer) {
      const tenMinutesAgo = Math.floor(Date.now() / 1000) - 600;
      const recentSubscriptions = await stripe.subscriptions.list({
        limit: 50,
        created: { gte: tenMinutesAgo },
        status: 'all',
      });

      for (const sub of recentSubscriptions.data) {
        try {
          const subCustomer = await stripe.customers.retrieve(sub.customer);
          if (subCustomer.email && subCustomer.email.toLowerCase().trim() === normalizedEmail) {
            customer = subCustomer;
            break;
          }
        } catch (err) {
          console.error('Error retrieving customer for subscription:', err);
        }
      }
    }

    if (!customer) {
      // 404 is a valid business state (customer not found), not an error
      // Log for analytics but don't treat as error
      console.log(`[INFO] Customer lookup: No customer found for email: ${normalizedEmail}`);
      
      return res.status(404).json({ 
        success: false,
        error: {
          code: 'CUSTOMER_NOT_FOUND',
          message: 'No customer found with this email',
        },
        data: {
          customerId: null,
          subscription: null,
          oneTimePurchases: [],
        },
      });
    }

    const customerId = customer.id;
    console.log('Found customer:', customerId);

    // Get subscription for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      limit: 10,
    });

    let subscriptionData = null;
    if (subscriptions.data.length > 0) {
      const subscription = subscriptions.data.find(s => s.status === 'active') 
        || subscriptions.data[0];
      
      const subscriptionItem = subscription.items.data[0];
      const priceId = subscriptionItem.price.id;
      const price = await stripe.prices.retrieve(priceId);
      const product = await stripe.products.retrieve(price.product);
      const quantity = subscriptionItem.quantity || 1;
      const unitAmount = price.unit_amount || null;
      const amount = unitAmount ? unitAmount * quantity : null;

      subscriptionData = {
        id: subscription.id,
        status: subscription.status,
        currentPeriodEnd: subscription.current_period_end,
        currentPeriodStart: subscription.current_period_start,
        planName: product.name,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        canceledAt: subscription.canceled_at,
        currency: subscription.currency,
        customer: subscription.customer,
        amount: amount,
        interval: price.recurring?.interval || null,
      };
    }

    // Get one-time purchases (charges)
    let validPurchases = [];
    try {
      const chargesList = await stripe.charges.list({
        customer: customerId,
        limit: 100,
      });

      const successfulCharges = chargesList.data.filter(charge => charge.status === 'succeeded');
      
      validPurchases = successfulCharges.map(charge => ({
        id: charge.id,
        amount: charge.amount,
        currency: charge.currency,
        date: charge.created,
        status: charge.status,
        description: charge.description,
        receiptUrl: charge.receipt_url || null,
        invoiceId: typeof charge.invoice === 'string' ? charge.invoice : charge.invoice?.id || null,
        paymentIntentId: typeof charge.payment_intent === 'string' 
          ? charge.payment_intent 
          : charge.payment_intent?.id || null,
      }));
    } catch (error) {
      console.error('Error retrieving charges:', error);
      validPurchases = [];
    }

    // Success response with consistent structure
    return res.status(200).json({
      success: true,
      data: {
        customerId: customerId,
        customerEmail: customer.email,
        subscription: subscriptionData,
        oneTimePurchases: validPurchases || [],
      },
    });
  } catch (error) {
    // Log actual errors (not 404s) for debugging
    console.error('[ERROR] Customer lookup failed:', {
      email: email,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
    
    return res.status(500).json({ 
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while looking up customer',
        // Only expose detailed error in development
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      data: {
        customerId: null,
        customerEmail: null,
        subscription: null,
        oneTimePurchases: [],
      },
    });
  }
}

