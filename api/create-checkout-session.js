/**
 * Serverless Function for Stripe Checkout Sessions
 * Creates a checkout session for subscriptions using Stripe's hosted checkout page
 * Reference: https://docs.stripe.com/payments/checkout
 * 
 * Deploy this to Vercel, Netlify, or any serverless platform
 * 
 * Vercel: Place in /api/create-checkout-session.js
 * Netlify: Place in /netlify/functions/create-checkout-session.js
 */

// For Vercel
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  const { priceId, customerId, customerEmail, successUrl, cancelUrl } = req.body;

  if (!priceId) {
    return res.status(400).json({ message: 'Price ID is required' });
  }

  try {
    // Determine if this is a subscription or one-time payment based on price
    // Check the price type from Stripe
    const price = await stripe.prices.retrieve(priceId);
    const isSubscription = price.type === 'recurring';
    
    const sessionParams = {
      mode: isSubscription ? 'subscription' : 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl || `${req.headers.origin || 'https://yourdomain.com'}/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${req.headers.origin || 'https://yourdomain.com'}/billing?canceled=true`,
    };

    // CRITICAL: Avoid creating guest customers
    // If customerId is provided, always use it (don't try to find by email or create new)
    if (customerId) {
      console.log('[CHECKOUT] Using provided customer ID:', customerId);
      sessionParams.customer = customerId;
    } else if (customerEmail) {
      // No customerId provided - check if customer exists by email
      // IMPORTANT: We must find existing customer to avoid creating guest customers
      console.log('[CHECKOUT] No customerId provided, searching for existing customer by email:', customerEmail);
      
      const customers = await stripe.customers.list({
        email: customerEmail,
        limit: 10, // Get more results to check
      });

      if (customers.data.length > 0) {
        // Find exact match (case-insensitive)
        const exactMatch = customers.data.find(c => 
          c.email && c.email.toLowerCase().trim() === customerEmail.toLowerCase().trim()
        );
        
        const foundCustomer = exactMatch || customers.data[0];
        console.log('[CHECKOUT] Found existing customer:', foundCustomer.id);
        sessionParams.customer = foundCustomer.id;
      } else {
        // Last resort: Check if customer has any purchases/subscriptions by looking at charges/subscriptions
        console.log('[CHECKOUT] No customer found by email, checking purchases/subscriptions...');
        
        // Check recent subscriptions (last 10 minutes) for this email
        const tenMinutesAgo = Math.floor(Date.now() / 1000) - 600;
        const recentSubscriptions = await stripe.subscriptions.list({
          limit: 50,
          created: { gte: tenMinutesAgo },
          status: 'all',
        });

        let foundCustomerId = null;
        for (const sub of recentSubscriptions.data) {
          try {
            const subCustomer = await stripe.customers.retrieve(sub.customer);
            if (subCustomer.email && subCustomer.email.toLowerCase().trim() === customerEmail.toLowerCase().trim()) {
              foundCustomerId = subCustomer.id;
              console.log('[CHECKOUT] Found customer via subscription:', foundCustomerId);
              break;
            }
          } catch (err) {
            console.error('[CHECKOUT] Error retrieving customer for subscription:', err);
          }
        }

        // Also check recent charges (last 10 minutes) for this email
        if (!foundCustomerId) {
          const recentCharges = await stripe.charges.list({
            limit: 50,
            created: { gte: tenMinutesAgo },
          });

          for (const charge of recentCharges.data) {
            if (charge.customer && typeof charge.customer === 'string') {
              try {
                const chargeCustomer = await stripe.customers.retrieve(charge.customer);
                if (chargeCustomer.email && chargeCustomer.email.toLowerCase().trim() === customerEmail.toLowerCase().trim()) {
                  foundCustomerId = chargeCustomer.id;
                  console.log('[CHECKOUT] Found customer via charge:', foundCustomerId);
                  break;
                }
              } catch (err) {
                console.error('[CHECKOUT] Error retrieving customer for charge:', err);
              }
            }
          }
        }

        if (foundCustomerId) {
          sessionParams.customer = foundCustomerId;
          console.log('[CHECKOUT] Using customer ID from purchases/subscriptions:', foundCustomerId);
        } else {
          // This is truly a new user with no purchases/subscriptions
          // Create a new customer (not a guest) by creating customer first, then using their ID
          console.log('[CHECKOUT] No existing customer found - creating new customer (not guest)');
          const newCustomer = await stripe.customers.create({
            email: customerEmail,
          });
          sessionParams.customer = newCustomer.id;
          console.log('[CHECKOUT] Created new customer:', newCustomer.id);
        }
      }
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return res.status(200).json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
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
  const { priceId, customerId, customerEmail, successUrl, cancelUrl } = JSON.parse(event.body);

  if (!priceId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Price ID is required' }),
    };
  }

  try {
    // Determine if this is a subscription or one-time payment based on price
    const price = await stripe.prices.retrieve(priceId);
    const isSubscription = price.type === 'recurring';
    
    const sessionParams = {
      mode: isSubscription ? 'subscription' : 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl || `${event.headers.origin || 'https://yourdomain.com'}/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${event.headers.origin || 'https://yourdomain.com'}/billing?canceled=true`,
    };

    // CRITICAL: Avoid creating guest customers
    // If customerId is provided, always use it (don't try to find by email or create new)
    if (customerId) {
      console.log('[CHECKOUT] Using provided customer ID:', customerId);
      sessionParams.customer = customerId;
    } else if (customerEmail) {
      // No customerId provided - check if customer exists by email
      // IMPORTANT: We must find existing customer to avoid creating guest customers
      console.log('[CHECKOUT] No customerId provided, searching for existing customer by email:', customerEmail);
      
      const customers = await stripe.customers.list({
        email: customerEmail,
        limit: 10, // Get more results to check
      });

      if (customers.data.length > 0) {
        // Find exact match (case-insensitive)
        const exactMatch = customers.data.find(c => 
          c.email && c.email.toLowerCase().trim() === customerEmail.toLowerCase().trim()
        );
        
        const foundCustomer = exactMatch || customers.data[0];
        console.log('[CHECKOUT] Found existing customer:', foundCustomer.id);
        sessionParams.customer = foundCustomer.id;
      } else {
        // Last resort: Check if customer has any purchases/subscriptions by looking at charges/subscriptions
        console.log('[CHECKOUT] No customer found by email, checking purchases/subscriptions...');
        
        // Check recent subscriptions (last 10 minutes) for this email
        const tenMinutesAgo = Math.floor(Date.now() / 1000) - 600;
        const recentSubscriptions = await stripe.subscriptions.list({
          limit: 50,
          created: { gte: tenMinutesAgo },
          status: 'all',
        });

        let foundCustomerId = null;
        for (const sub of recentSubscriptions.data) {
          try {
            const subCustomer = await stripe.customers.retrieve(sub.customer);
            if (subCustomer.email && subCustomer.email.toLowerCase().trim() === customerEmail.toLowerCase().trim()) {
              foundCustomerId = subCustomer.id;
              console.log('[CHECKOUT] Found customer via subscription:', foundCustomerId);
              break;
            }
          } catch (err) {
            console.error('[CHECKOUT] Error retrieving customer for subscription:', err);
          }
        }

        // Also check recent charges (last 10 minutes) for this email
        if (!foundCustomerId) {
          const recentCharges = await stripe.charges.list({
            limit: 50,
            created: { gte: tenMinutesAgo },
          });

          for (const charge of recentCharges.data) {
            if (charge.customer && typeof charge.customer === 'string') {
              try {
                const chargeCustomer = await stripe.customers.retrieve(charge.customer);
                if (chargeCustomer.email && chargeCustomer.email.toLowerCase().trim() === customerEmail.toLowerCase().trim()) {
                  foundCustomerId = chargeCustomer.id;
                  console.log('[CHECKOUT] Found customer via charge:', foundCustomerId);
                  break;
                }
              } catch (err) {
                console.error('[CHECKOUT] Error retrieving customer for charge:', err);
              }
            }
          }
        }

        if (foundCustomerId) {
          sessionParams.customer = foundCustomerId;
          console.log('[CHECKOUT] Using customer ID from purchases/subscriptions:', foundCustomerId);
        } else {
          // This is truly a new user with no purchases/subscriptions
          // Create a new customer (not a guest) by creating customer first, then using their ID
          console.log('[CHECKOUT] No existing customer found - creating new customer (not guest)');
          const newCustomer = await stripe.customers.create({
            email: customerEmail,
          });
          sessionParams.customer = newCustomer.id;
          console.log('[CHECKOUT] Created new customer:', newCustomer.id);
        }
      }
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url, sessionId: session.id }),
    };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message }),
    };
  }
};
*/

