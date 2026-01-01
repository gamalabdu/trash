/**
 * Local Development Server for Stripe Functions
 * Run this to test Stripe integration locally without deploying
 * 
 * Usage: node server.js
 * Then set REACT_APP_STRIPE_SERVERLESS_URL=http://localhost:3001/api in your .env
 */

// Load environment variables from .env.local first, then .env
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Try multiple possible locations for .env.local
const possiblePaths = [
  path.resolve(__dirname, '.env.local'),
  path.resolve(process.cwd(), '.env.local'),
  '.env.local'
];

let envLocalLoaded = false;
for (const envLocalPath of possiblePaths) {
  if (fs.existsSync(envLocalPath)) {
    console.log(`📁 Found .env.local at: ${envLocalPath}`);
    const result = dotenv.config({ path: envLocalPath, override: true });
    if (result.error) {
      console.error('⚠️  Error loading .env.local:', result.error.message);
    } else {
      console.log('✅ Loaded .env.local');
      if (result.parsed) {
        console.log('   Parsed keys:', Object.keys(result.parsed).join(', '));
        if (result.parsed.STRIPE_SECRET_KEY) {
          console.log('   ✅ STRIPE_SECRET_KEY found in file');
        }
      }
      envLocalLoaded = true;
      break;
    }
  }
}

if (!envLocalLoaded) {
  console.log('⚠️  .env.local not found in any of these locations:');
  possiblePaths.forEach(p => console.log('   -', p));
}

// Only load .env if STRIPE_SECRET_KEY is still not set
if (!process.env.STRIPE_SECRET_KEY) {
  const envPath = path.resolve(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const result = dotenv.config({ path: envPath, override: false });
    if (result.error) {
      console.error('⚠️  Error loading .env:', result.error.message);
    } else {
      console.log('📁 Loaded .env as fallback');
    }
  }
}

const express = require('express');
const cors = require('cors');

// Debug: Show what environment variables were loaded
console.log('\n🔍 Debug: Environment check');
console.log('   STRIPE_SECRET_KEY exists:', !!process.env.STRIPE_SECRET_KEY);
if (process.env.STRIPE_SECRET_KEY) {
  console.log('   STRIPE_SECRET_KEY value:', process.env.STRIPE_SECRET_KEY.substring(0, 20) + '...');
  console.log('   STRIPE_SECRET_KEY length:', process.env.STRIPE_SECRET_KEY.length);
} else {
  console.log('   All env vars:', Object.keys(process.env).filter(k => k.includes('STRIPE')).join(', ') || 'none');
}

// Check if STRIPE_SECRET_KEY is set
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('');
  console.error('❌ ERROR: STRIPE_SECRET_KEY is not set!');
  console.error('');
  console.error('   To fix this:');
  console.error('   1. Make sure .env.local exists in the project root');
  console.error('   2. Add this line (no quotes, no spaces around =):');
  console.error('      STRIPE_SECRET_KEY=sk_test_YOUR_TEST_KEY');
  console.error('   3. Get your test key from: https://dashboard.stripe.com/test/apikeys');
  console.error('   4. Restart the server');
  console.error('');
  console.error('   Example .env.local file content:');
  console.error('   STRIPE_SECRET_KEY=sk_test_51ABC123...');
  console.error('');
  process.exit(1);
}

// Verify the key is actually set and valid
const secretKey = process.env.STRIPE_SECRET_KEY;
if (!secretKey || !secretKey.startsWith('sk_')) {
  console.error('');
  console.error('❌ ERROR: STRIPE_SECRET_KEY is invalid!');
  console.error(`   Current value: ${secretKey ? secretKey.substring(0, 20) + '...' : 'undefined'}`);
  console.error('   Key must start with sk_test_ or sk_live_');
  console.error('');
  process.exit(1);
}

console.log(`✅ STRIPE_SECRET_KEY is set (${secretKey.substring(0, 12)}...)`);

const stripe = require('stripe')(secretKey);

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Stripe API Server Running', status: 'ok' });
});

// Get Products
app.get('/api/get-products', async (req, res) => {
  try {
    console.log('GET /api/get-products - Request received');
    
    // Double-check the key is still available
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_SECRET_KEY.startsWith('sk_')) {
      console.error('STRIPE_SECRET_KEY is not set or invalid!');
      console.error('Current value:', process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.substring(0, 20) + '...' : 'undefined');
      return res.status(500).json({ 
        message: 'STRIPE_SECRET_KEY is not configured',
        error: 'Please set STRIPE_SECRET_KEY in your .env.local file and restart the server'
      });
    }

    const { activeOnly = 'true', type = 'all' } = req.query;
    console.log('Fetching products with params:', { activeOnly, type });

    const products = await stripe.products.list({
      active: activeOnly === 'true',
      limit: 100,
    });

    console.log(`Found ${products.data.length} products`);

    const prices = await stripe.prices.list({
      active: true,
      limit: 100,
    });

    console.log(`Found ${prices.data.length} prices`);

    const pricesByProduct = {};
    prices.data.forEach(price => {
      if (!pricesByProduct[price.product]) {
        pricesByProduct[price.product] = [];
      }
      pricesByProduct[price.product].push(price);
    });

    const productsWithPrices = products.data
      .map(product => {
        const productPrices = pricesByProduct[product.id] || [];
        
        let filteredPrices = productPrices;
        if (type === 'recurring') {
          filteredPrices = productPrices.filter(p => p.type === 'recurring');
        } else if (type === 'one-time') {
          filteredPrices = productPrices.filter(p => p.type === 'one_time');
        }

        return filteredPrices.map(price => ({
          id: `${product.id}_${price.id}`,
          productId: product.id,
          productName: product.name,
          productDescription: product.description || '',
          priceId: price.id,
          price: price.unit_amount,
          currency: price.currency,
          interval: price.type === 'recurring' 
            ? (price.recurring?.interval || 'month')
            : 'one-time',
          intervalCount: price.recurring?.interval_count || 1,
        }));
      })
      .flat()
      .filter(item => item.priceId);

    console.log(`Returning ${productsWithPrices.length} products with prices`);
    
    res.json({
      products: productsWithPrices,
      count: productsWithPrices.length,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ 
      message: error.message,
      error: 'Failed to fetch products from Stripe',
      details: error.toString()
    });
  }
});

// Create Checkout Session
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { priceId, customerId, customerEmail, successUrl, cancelUrl } = req.body;

    if (!priceId) {
      return res.status(400).json({ message: 'Price ID is required' });
    }

    // Determine if this is a subscription or one-time payment
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
      success_url: successUrl || `http://localhost:3000/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `http://localhost:3000/billing?canceled=true`,
    };

    if (customerId) {
      sessionParams.customer = customerId;
    } else if (customerEmail) {
      const customers = await stripe.customers.list({
        email: customerEmail,
        limit: 1,
      });

      if (customers.data.length > 0) {
        sessionParams.customer = customers.data[0].id;
      } else {
        sessionParams.customer_email = customerEmail;
      }
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    res.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create Portal Session
app.post('/api/create-portal-session', async (req, res) => {
  try {
    const { customerId, returnUrl } = req.body;

    if (!customerId) {
      return res.status(400).json({ message: 'Customer ID is required' });
    }

    // Create portal session - Stripe uses your Dashboard configuration
    // The portal will allow whatever you configured in:
    // Stripe Dashboard → Settings → Billing → Customer Portal
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl || 'http://localhost:3000/billing',
    });

    console.log('Portal session created for customer:', customerId);
    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating portal session:', error);
    res.status(500).json({ message: error.message });
  }
});

// Retrieve Checkout Session (to get customer ID after successful checkout)
app.get('/api/checkout-session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    console.log('GET /api/checkout-session/:sessionId - Request received');
    console.log('Session ID:', sessionId);

    if (!sessionId) {
      return res.status(400).json({ message: 'Session ID is required' });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['customer', 'subscription', 'payment_intent', 'invoice', 'line_items'],
    });

    console.log('Full session object keys:', Object.keys(session));
    console.log('Session customer:', session.customer);
    console.log('Session customer_email:', session.customer_email);
    console.log('Session customer_details:', session.customer_details);
    console.log('Session subscription:', session.subscription);
    console.log('Session payment_intent:', session.payment_intent);
    console.log('Session invoice:', session.invoice);
    console.log('Session payment_status:', session.payment_status);
    console.log('Session status:', session.status);

    // Handle customer ID - it might be an object (if expanded) or a string
    let customerId = typeof session.customer === 'string' 
      ? session.customer 
      : session.customer?.id || session.customer;

    // Get customer email from various possible locations
    const customerEmail = session.customer_details?.email 
      || (typeof session.customer === 'object' && session.customer?.email)
      || session.customer_email;

    // If customer ID is not in session but we have a subscription, get it from the subscription
    if (!customerId && session.subscription) {
      const subscriptionId = typeof session.subscription === 'string' 
        ? session.subscription 
        : session.subscription?.id || session.subscription;
      
      if (subscriptionId) {
        try {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          customerId = subscription.customer;
          console.log('Retrieved customer ID from subscription:', customerId);
        } catch (subError) {
          console.error('Error retrieving subscription:', subError);
        }
      }
    }

    // Try to get customer from payment_intent if available
    if (!customerId && session.payment_intent) {
      try {
        const paymentIntentId = typeof session.payment_intent === 'string' 
          ? session.payment_intent 
          : session.payment_intent?.id || session.payment_intent;
        
        if (paymentIntentId) {
          const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
          customerId = paymentIntent.customer;
          if (customerId) {
            console.log('Retrieved customer ID from payment_intent:', customerId);
          }
        }
      } catch (piError) {
        console.error('Error retrieving payment_intent:', piError);
      }
    }

    // Try to get customer from invoice if available
    if (!customerId && session.invoice) {
      try {
        const invoiceId = typeof session.invoice === 'string' 
          ? session.invoice 
          : session.invoice?.id || session.invoice;
        
        if (invoiceId) {
          const invoice = await stripe.invoices.retrieve(invoiceId);
          customerId = invoice.customer;
          console.log('Retrieved customer ID from invoice:', customerId);
        }
      } catch (invoiceError) {
        console.error('Error retrieving invoice:', invoiceError);
      }
    }

    // If still no customer ID but we have email, try to find customer by email
    if (!customerId && customerEmail) {
      try {
        // First, try direct customer lookup by email
        const customers = await stripe.customers.list({
          email: customerEmail,
          limit: 1,
        });
        
        if (customers.data.length > 0) {
          customerId = customers.data[0].id;
          console.log('Found customer ID by email:', customerId);
        } else {
          console.log('No existing customer found with email:', customerEmail);
          
          // If payment is paid, Stripe should have created a customer
          // Wait a moment and retry, or check recent subscriptions
          if (session.payment_status === 'paid') {
            // Small delay to allow Stripe to finish creating the customer
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Retry customer lookup
            const retryCustomers = await stripe.customers.list({
              email: customerEmail,
              limit: 1,
            });
            
            if (retryCustomers.data.length > 0) {
              customerId = retryCustomers.data[0].id;
              console.log('Found customer ID by email (after retry):', customerId);
            } else {
              // Last resort: find customer from recent subscriptions created in last 5 minutes
              console.log('Searching recent subscriptions for customer...');
              const fiveMinutesAgo = Math.floor(Date.now() / 1000) - 300;
              const subscriptions = await stripe.subscriptions.list({
                limit: 20,
                created: { gte: fiveMinutesAgo },
              });
              
              console.log(`Found ${subscriptions.data.length} recent subscriptions`);
              
              for (const sub of subscriptions.data) {
                try {
                  const customer = await stripe.customers.retrieve(sub.customer);
                  if (customer.email && customer.email.toLowerCase() === customerEmail.toLowerCase()) {
                    customerId = customer.id;
                    console.log('Found customer ID from recent subscription:', customerId);
                    break;
                  }
                } catch (err) {
                  console.error('Error retrieving customer for subscription:', err);
                }
              }
            }
          }
        }
      } catch (emailError) {
        console.error('Error searching for customer by email:', emailError);
      }
    }

    console.log('Checkout session retrieved:', {
      customerId: customerId,
      customerEmail: customerEmail,
      subscriptionId: typeof session.subscription === 'string' 
        ? session.subscription 
        : session.subscription?.id || session.subscription,
      paymentStatus: session.payment_status,
      customerType: typeof session.customer,
    });

    // Last resort: If payment is paid and we have email but no customer ID,
    // create a customer (or find the one Stripe just created)
    if (!customerId && customerEmail && session.payment_status === 'paid') {
      try {
        // Wait a bit longer for Stripe to finish processing
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Try one more time to find the customer
        const finalCustomers = await stripe.customers.list({
          email: customerEmail,
          limit: 1,
        });
        
        if (finalCustomers.data.length > 0) {
          customerId = finalCustomers.data[0].id;
          console.log('Found customer ID on final retry:', customerId);
        } else {
          // If still not found, create a customer with this email
          // This should match the one Stripe created during checkout
          console.log('Creating customer with email:', customerEmail);
          const newCustomer = await stripe.customers.create({
            email: customerEmail,
            name: session.customer_details?.name,
          });
          customerId = newCustomer.id;
          console.log('Created new customer:', customerId);
        }
      } catch (createError) {
        console.error('Error in final customer lookup/create:', createError);
      }
    }

    if (!customerId) {
      console.error('No customer ID found in checkout session after all attempts:', {
        customer: session.customer,
        customer_details: session.customer_details,
        subscription: session.subscription,
        payment_status: session.payment_status,
      });
      return res.status(400).json({ 
        message: 'Customer ID not found in checkout session. The session may not be completed yet. Please try refreshing the page in a few moments.' 
      });
    }

    res.json({
      customerId: customerId,
      customerEmail: customerEmail,
      subscriptionId: typeof session.subscription === 'string' 
        ? session.subscription 
        : session.subscription?.id || session.subscription,
      paymentStatus: session.payment_status,
    });
  } catch (error) {
    console.error('Error retrieving checkout session:', error);
    res.status(500).json({ message: error.message });
  }
});

// Debug endpoint: List recent customers (for troubleshooting)
app.get('/api/debug/recent-customers', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const customers = await stripe.customers.list({
      limit: parseInt(String(limit)),
    });

    res.json({
      count: customers.data.length,
      customers: customers.data.map(c => ({
        id: c.id,
        email: c.email,
        created: c.created,
        name: c.name,
      })),
    });
  } catch (error) {
    console.error('Error listing customers:', error);
    res.status(500).json({ message: error.message });
  }
});

// Lookup customer by email and get their subscription
app.get('/api/customer-by-email', async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    console.log('Looking up customer by email:', normalizedEmail);

    // Try multiple times with delays (Stripe might need time to index the customer)
    let customer = null;
    let attempts = 0;
    const maxAttempts = 3;

    while (!customer && attempts < maxAttempts) {
      if (attempts > 0) {
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
      }

      // Try exact email match
      const customers = await stripe.customers.list({
        email: normalizedEmail,
        limit: 10, // Get more results to check
      });

      console.log(`Attempt ${attempts + 1}: Found ${customers.data.length} customers with email search`);

      // Find exact match (case-insensitive)
      customer = customers.data.find(c => 
        c.email && c.email.toLowerCase().trim() === normalizedEmail
      );

      if (!customer && customers.data.length > 0) {
        // If we got results but no exact match, try the first one
        customer = customers.data[0];
        console.log('Using first customer found:', customer.email);
      }

      attempts++;
    }

    // If still not found, try searching recent customers (last 5 minutes)
    if (!customer) {
      console.log('Trying to find customer in recent customers...');
      const fiveMinutesAgo = Math.floor(Date.now() / 1000) - 300;
      const recentCustomers = await stripe.customers.list({
        limit: 100,
        created: { gte: fiveMinutesAgo },
      });

      console.log(`Found ${recentCustomers.data.length} recent customers`);

      // Find by email match
      customer = recentCustomers.data.find(c => 
        c.email && c.email.toLowerCase().trim() === normalizedEmail
      );

      if (customer) {
        console.log('Found customer in recent customers:', customer.id);
      }
    }

    // Last resort: Find customer by looking at recent subscriptions
    if (!customer) {
      console.log('Trying to find customer via recent subscriptions...');
      const tenMinutesAgo = Math.floor(Date.now() / 1000) - 600;
      const recentSubscriptions = await stripe.subscriptions.list({
        limit: 50,
        created: { gte: tenMinutesAgo },
        status: 'all',
      });

      console.log(`Found ${recentSubscriptions.data.length} recent subscriptions`);

      // Check each subscription's customer
      for (const sub of recentSubscriptions.data) {
        try {
          const subCustomer = await stripe.customers.retrieve(sub.customer);
          if (subCustomer.email && subCustomer.email.toLowerCase().trim() === normalizedEmail) {
            customer = subCustomer;
            console.log('Found customer via subscription:', customer.id);
            break;
          }
        } catch (err) {
          console.error('Error retrieving customer for subscription:', err);
        }
      }
    }

    if (!customer) {
      console.log('No customer found after all attempts');
      return res.status(404).json({ 
        message: 'No customer found with this email',
        customerId: null,
        subscription: null,
      });
    }

    const customerId = customer.id;
    console.log('Found customer:', customerId, 'Email:', customer.email);

    // ========== DEBUG: GET ALL PRODUCTS PURCHASED BY CUSTOMER ==========
    console.log('\n========== DEBUG: ALL PRODUCTS PURCHASED BY CUSTOMER ==========');
    
    // Get subscription for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      limit: 10, // Get all subscriptions
    });

    console.log(`\n[SUBSCRIPTIONS] Found ${subscriptions.data.length} subscriptions for customer`);
    
    const allSubscriptionProducts = [];
    for (const sub of subscriptions.data) {
      for (const item of sub.items.data) {
        const priceId = item.price.id;
        const price = await stripe.prices.retrieve(priceId);
        const product = await stripe.products.retrieve(price.product);
        
        allSubscriptionProducts.push({
          type: 'SUBSCRIPTION',
          subscriptionId: sub.id,
          subscriptionStatus: sub.status,
          productId: product.id,
          productName: product.name,
          priceId: priceId,
          priceAmount: price.unit_amount,
          priceCurrency: price.currency,
          interval: price.recurring?.interval || 'one-time',
          created: sub.created,
        });
        
        console.log(`  [SUBSCRIPTION] ${product.name} (${product.id}) - Price: ${priceId} - Status: ${sub.status} - Interval: ${price.recurring?.interval || 'one-time'}`);
      }
    }
    
    console.log(`\n[SUBSCRIPTIONS] Total subscription products: ${allSubscriptionProducts.length}`);

    let subscriptionData = null;
    if (subscriptions.data.length > 0) {
      // Get the most recent active subscription, or the most recent one
      const subscription = subscriptions.data.find(s => s.status === 'active') 
        || subscriptions.data[0];
      
      const subscriptionItem = subscription.items.data[0];
      const priceId = subscriptionItem.price.id;
      const priceItem = subscriptionItem.price;
      const quantity = subscriptionItem.quantity || 1;
      const price = await stripe.prices.retrieve(priceId);
      const product = await stripe.products.retrieve(price.product);

      // Get amount - try from retrieved price, fallback to subscription item price
      // Multiply by quantity to get total amount
      const unitAmount = price.unit_amount || priceItem.unit_amount || null;
      const amount = unitAmount ? unitAmount * quantity : null;
      // Get interval - try from retrieved price, fallback to subscription item price
      const interval = price.recurring?.interval || priceItem.recurring?.interval || null;

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
        amount: amount, // Amount in cents
        interval: interval, // 'month', 'year', etc.
      };

      console.log('Subscription data:', {
        id: subscriptionData.id,
        amount: subscriptionData.amount,
        interval: subscriptionData.interval,
        currency: subscriptionData.currency,
      });

      console.log('Found subscription:', subscriptionData.id, 'Status:', subscriptionData.status);
    }

    // Get one-time purchases - PRIMARY SOURCE: Charges API
    // Stripe charges represent all payments, including one-time purchases
    // Reference: https://docs.stripe.com/api/charges/list
    let validPurchases = [];
    let allCheckoutProducts = [];
    let allChargeProducts = [];
    
    try {
      // ========== PRIMARY: Get charges for one-time purchases ==========
      // Charges API returns all payments for a customer
      // Reference: https://docs.stripe.com/api/charges/list
      const chargesList = await stripe.charges.list({
        customer: customerId,
        limit: 100, // Get more charges
      });

      console.log(`\n[CHARGES API] Found ${chargesList.data.length} charges for customer`);
      
      // Log all charges for debugging
      console.log('\n[CHARGES API] All charges:', chargesList.data.map(ch => ({
        id: ch.id,
        status: ch.status,
        amount: ch.amount,
        currency: ch.currency,
        description: ch.description,
        created: new Date(ch.created * 1000).toISOString(),
        invoice: ch.invoice,
        payment_intent: ch.payment_intent,
      })));
      
      // Filter for successful charges (one-time purchases)
      const successfulCharges = chargesList.data.filter(charge => {
        const isSuccessful = charge.status === 'succeeded';
        return isSuccessful;
      });

      console.log(`\n[CHARGES API] Found ${successfulCharges.length} successful charges (one-time purchases)`);
      
      // Process charges
      const chargePurchases = [];
      
      for (const charge of successfulCharges) {
        try {
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
          
          chargePurchases.push({
            id: charge.id,
            amount: charge.amount,
            currency: charge.currency,
            date: charge.created,
            status: charge.status,
            description: charge.description,
            receiptUrl: receiptUrl,
            invoiceId: invoiceId,
            paymentIntentId: paymentIntentId,
            billingDetails: charge.billing_details ? {
              name: charge.billing_details.name,
              email: charge.billing_details.email,
            } : null,
            paymentMethod: charge.payment_method_details ? {
              type: charge.payment_method_details.type,
              card: charge.payment_method_details.card ? {
                brand: charge.payment_method_details.card.brand,
                last4: charge.payment_method_details.card.last4,
              } : null,
            } : null,
          });
          
          console.log(`[CHARGES API] Added charge ${charge.id} as one-time purchase`);
        } catch (err) {
          console.error(`[CHARGES API] Error processing charge ${charge.id}:`, err);
        }
      }
      
      console.log(`\n[CHARGES API] Processed ${chargePurchases.length} one-time purchases from charges`);
      
      // ========== SECONDARY: Get checkout sessions as backup ==========
      // Get checkout sessions - these have mode ('payment' vs 'subscription') and line items
      const checkoutSessions = await stripe.checkout.sessions.list({
        customer: customerId,
        limit: 100, // Get more sessions
      });

      console.log(`\n[CHECKOUT SESSIONS] Found ${checkoutSessions.data.length} checkout sessions for customer`);
      
      // Log all checkout sessions for debugging
      console.log('\n[CHECKOUT SESSIONS] All checkout sessions:', checkoutSessions.data.map(session => ({
        id: session.id,
        mode: session.mode, // 'payment' = one-time, 'subscription' = subscription
        payment_status: session.payment_status,
        status: session.status,
        amount_total: session.amount_total,
        created: new Date(session.created * 1000).toISOString()
      })));
      
      // Get ALL products from checkout sessions (both subscription and one-time)
      const allCheckoutProducts = [];
      for (const session of checkoutSessions.data) {
        if (session.payment_status === 'paid' || session.status === 'complete') {
          try {
            const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
              expand: ['line_items.data.price.product'],
            });
            
            if (fullSession.line_items && fullSession.line_items.data) {
              for (const item of fullSession.line_items.data) {
                const priceId = typeof item.price === 'string' ? item.price : item.price?.id;
                const productId = typeof item.price === 'object' && item.price?.product
                  ? (typeof item.price.product === 'string' ? item.price.product : item.price.product.id)
                  : null;
                
                if (priceId && productId) {
                  try {
                    const price = await stripe.prices.retrieve(priceId);
                    const product = await stripe.products.retrieve(productId);
                    
                    allCheckoutProducts.push({
                      type: session.mode === 'payment' ? 'ONE-TIME (CHECKOUT)' : 'SUBSCRIPTION (CHECKOUT)',
                      sessionId: session.id,
                      sessionMode: session.mode,
                      paymentStatus: session.payment_status,
                      productId: product.id,
                      productName: product.name,
                      priceId: priceId,
                      priceAmount: item.amount_total,
                      priceCurrency: session.currency,
                      interval: price.recurring?.interval || 'one-time',
                      created: session.created,
                    });
                    
                    console.log(`  [CHECKOUT ${session.mode.toUpperCase()}] ${product.name} (${product.id}) - Price: ${priceId} - Mode: ${session.mode} - Status: ${session.payment_status}`);
                  } catch (err) {
                    console.error(`Error retrieving product/price for checkout session ${session.id}:`, err);
                  }
                }
              }
            }
          } catch (err) {
            console.error(`Error retrieving checkout session ${session.id}:`, err);
          }
        }
      }
      
      console.log(`\n[CHECKOUT SESSIONS] Total products from checkout sessions: ${allCheckoutProducts.length}`);
      
      // Filter for completed one-time payment sessions
      // Stripe tells us it's one-time via mode === 'payment'
      const oneTimeSessions = checkoutSessions.data.filter(session => 
        session.mode === 'payment' && session.payment_status === 'paid'
      );

      console.log(`\n[CHECKOUT SESSIONS] Found ${oneTimeSessions.length} completed one-time payment sessions (mode=payment, payment_status=paid)`);
      
      // Get line items from checkout sessions (they have price IDs)
      // Combine purchases from charges (PRIMARY) and checkout sessions (SECONDARY)
      // Charges API is the definitive source for one-time purchases
      // Checkout sessions are used as backup for purchases not yet in charges
      // Remove duplicates by purchase ID (same purchase might appear in both)
      const chargeIds = new Set(chargePurchases.map(p => p.id));
      const checkoutSessionPurchases = [];
      
      // Get checkout sessions as backup (if needed)
      // For now, we'll primarily use charges, but keep checkout sessions as fallback
      for (const session of oneTimeSessions) {
        try {
          const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
            expand: ['line_items.data.price.product'],
          });
          
          // Only add if not already in charges
          if (!chargeIds.has(`session_${fullSession.id}`)) {
            checkoutSessionPurchases.push({
              id: `session_${fullSession.id}`,
              amount: fullSession.amount_total,
              currency: fullSession.currency,
              date: fullSession.created,
              status: 'succeeded',
              description: fullSession.line_items?.data?.[0]?.description || null,
              receiptUrl: null,
              invoiceId: fullSession.invoice || null,
              paymentIntentId: fullSession.payment_intent || null,
            });
          }
        } catch (err) {
          console.error(`[CHECKOUT SESSIONS] Error retrieving checkout session ${session.id}:`, err);
        }
      }
      
      console.log(`\n[CHECKOUT SESSIONS] Found ${checkoutSessionPurchases.length} additional purchases from checkout sessions`);
      
      // Combine purchases from charges (PRIMARY) and checkout sessions (SECONDARY)
      const allPurchases = [...chargePurchases, ...checkoutSessionPurchases];
      const uniquePurchases = [];
      const seenPurchaseIds = new Set();
      
      for (const purchase of allPurchases) {
        // Use the purchase ID to deduplicate (invoice ID or session ID)
        if (!seenPurchaseIds.has(purchase.id)) {
          seenPurchaseIds.add(purchase.id);
          uniquePurchases.push(purchase);
        }
      }
      
      validPurchases = uniquePurchases;

      console.log(`\n[ONE-TIME PURCHASES] Found ${validPurchases.length} unique one-time purchases:`);
      console.log(`- ${checkoutSessionPurchases.length} from checkout sessions (mode=payment)`);
      console.log(`- ${chargePurchases.length} from charges (status=succeeded)`);
      
      if (validPurchases.length > 0) {
        console.log('\n[ONE-TIME PURCHASES] Sample charges:', JSON.stringify(validPurchases.slice(0, 3).map(p => ({
          id: p.id,
          amount: p.amount,
          currency: p.currency,
          description: p.description,
          status: p.status,
        })), null, 2));
      } else {
        console.log('\n=== NO ONE-TIME PURCHASES FOUND - DEBUGGING INFO ===');
        console.log(`Charges: ${chargesList.data.length} total`);
        console.log(`- Successful charges: ${chargesList.data.filter(ch => ch.status === 'succeeded').length}`);
        console.log(`- Pending charges: ${chargesList.data.filter(ch => ch.status === 'pending').length}`);
        console.log(`- Failed charges: ${chargesList.data.filter(ch => ch.status === 'failed').length}`);
        console.log(`Checkout Sessions: ${checkoutSessions.data.length} total`);
        console.log(`- Sessions with mode=payment: ${checkoutSessions.data.filter(s => s.mode === 'payment').length}`);
        console.log(`- Sessions with payment_status=paid: ${checkoutSessions.data.filter(s => s.payment_status === 'paid').length}`);
        console.log(`- Sessions with mode=payment AND payment_status=paid: ${checkoutSessions.data.filter(s => s.mode === 'payment' && s.payment_status === 'paid').length}`);
        console.log('=== END DEBUGGING INFO ===');
      }
      
      // ========== SUMMARY: ALL PRODUCTS PURCHASED ==========
      console.log('\n========== SUMMARY: ALL PRODUCTS PURCHASED BY CUSTOMER ==========');
      const allProductsPurchased = [
        ...allSubscriptionProducts,
        ...allCheckoutProducts,
        ...allChargeProducts,
      ];
      
      // Deduplicate by productId and priceId combination
      const uniqueProducts = Array.from(
        new Map(
          allProductsPurchased.map(p => [`${p.productId}_${p.priceId}`, p])
        ).values()
      );
      
      console.log(`\nTotal unique products purchased: ${uniqueProducts.length}`);
      console.log('\nAll Products Purchased:');
      uniqueProducts.forEach((product, index) => {
        console.log(`\n${index + 1}. ${product.productName}`);
        console.log(`   Type: ${product.type}`);
        console.log(`   Product ID: ${product.productId}`);
        console.log(`   Price ID: ${product.priceId}`);
        console.log(`   Amount: ${product.priceAmount ? (product.priceAmount / 100).toFixed(2) : 'N/A'} ${product.priceCurrency?.toUpperCase() || ''}`);
        console.log(`   Interval: ${product.interval}`);
        console.log(`   Created: ${new Date(product.created * 1000).toISOString()}`);
      });
      
      // Group by one-time vs subscription
      const oneTimeProducts = uniqueProducts.filter(p => 
        p.interval === 'one-time' || 
        p.type.includes('ONE-TIME') ||
        (p.type.includes('INVOICE') && !p.subscriptionId)
      );
      const subscriptionProducts = uniqueProducts.filter(p => 
        p.interval !== 'one-time' && 
        !p.type.includes('ONE-TIME') &&
        (p.type.includes('SUBSCRIPTION') || p.subscriptionId)
      );
      
      console.log(`\n[SUMMARY] One-time products: ${oneTimeProducts.length}`);
      oneTimeProducts.forEach(p => {
        console.log(`  - ${p.productName} (${p.priceId})`);
      });
      
      console.log(`\n[SUMMARY] Subscription products: ${subscriptionProducts.length}`);
      subscriptionProducts.forEach(p => {
        console.log(`  - ${p.productName} (${p.priceId})`);
      });
      
      console.log('\n========== END SUMMARY ==========\n');
      
      // Always return oneTimePurchases, even if empty array
      const response = {
        customerId: customerId,
        customerEmail: customer.email,
        subscription: subscriptionData,
        oneTimePurchases: validPurchases || [],
        // DEBUG: Include all products purchased for debugging
        debug: {
          allProductsPurchased: uniqueProducts || [],
          oneTimeProducts: oneTimeProducts || [],
          subscriptionProducts: subscriptionProducts || [],
          checkoutSessionProducts: allCheckoutProducts || [],
          chargeProducts: allChargeProducts || [],
          subscriptionProductsList: allSubscriptionProducts || [],
        },
      };
      
      console.log('[RESPONSE] Sending response with oneTimePurchases:', response.oneTimePurchases?.length || 0);
      console.log('[RESPONSE] Type of oneTimePurchases:', typeof response.oneTimePurchases);
      console.log('[RESPONSE] Is array?', Array.isArray(response.oneTimePurchases));
      console.log('[RESPONSE] Sending response with debug.allProductsPurchased:', response.debug.allProductsPurchased.length);
      console.log('[RESPONSE] Full response structure:', JSON.stringify({
        customerId: response.customerId,
        customerEmail: response.customerEmail,
        hasSubscription: !!response.subscription,
        oneTimePurchasesType: typeof response.oneTimePurchases,
        oneTimePurchasesCount: response.oneTimePurchases?.length || 0,
        oneTimePurchasesValue: response.oneTimePurchases,
        debugCount: response.debug.allProductsPurchased.length,
      }, null, 2));
      console.log('[RESPONSE] About to send response, validPurchases value:', validPurchases);
      console.log('[RESPONSE] About to send response, validPurchases type:', typeof validPurchases);
      res.json(response);
    } catch (invoiceError) {
      console.error('Error retrieving invoices:', invoiceError);
      validPurchases = [];
      
      // Return response even on error
      const response = {
        customerId: customerId,
        customerEmail: customer.email,
        subscription: subscriptionData,
        oneTimePurchases: [],
        debug: {
          error: invoiceError.message,
          allProductsPurchased: [],
        },
      };
      
      res.json(response);
    }
    } catch (error) {
      console.error('Error looking up customer by email:', error);
      console.error('Error stack:', error.stack);
      
      // Always return oneTimePurchases, even on error
      res.status(500).json({ 
        message: error.message,
        customerId: null,
        customerEmail: null,
        subscription: null,
        oneTimePurchases: [],
        debug: {
          error: error.message,
          allProductsPurchased: [],
        }
      });
    }
});

// Get Customer Subscription using Subscriptions API
// Reference: https://docs.stripe.com/api/subscriptions
app.get('/api/customer/:customerId/subscription', async (req, res) => {
  try {
    const { customerId } = req.params;

    if (!customerId) {
      return res.status(400).json({ message: 'Customer ID is required' });
    }

    // List subscriptions for customer using Subscriptions API
    // GET /v1/subscriptions?customer=cus_xxx
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return res.status(404).json({ message: 'No subscription found' });
    }

    // Retrieve full subscription details
    // GET /v1/subscriptions/:id
    const subscription = subscriptions.data[0];
    const fullSubscription = await stripe.subscriptions.retrieve(subscription.id);

    // Get product details from subscription items
    const subscriptionItem = fullSubscription.items.data[0];
    const priceId = subscriptionItem.price.id;
    const priceItem = subscriptionItem.price;
    const quantity = subscriptionItem.quantity || 1;
    const price = await stripe.prices.retrieve(priceId);
    const product = await stripe.products.retrieve(price.product);

    // Get amount - try from retrieved price, fallback to subscription item price
    // Multiply by quantity to get total amount
    const unitAmount = price.unit_amount || priceItem.unit_amount || null;
    const amount = unitAmount ? unitAmount * quantity : null;
    // Get interval - try from retrieved price, fallback to subscription item price
    const interval = price.recurring?.interval || priceItem.recurring?.interval || null;

    // Return subscription data using Subscriptions API format
    res.json({
      id: fullSubscription.id,
      status: fullSubscription.status, // active, canceled, past_due, etc.
      currentPeriodEnd: fullSubscription.current_period_end,
      currentPeriodStart: fullSubscription.current_period_start,
      planName: product.name,
      cancelAtPeriodEnd: fullSubscription.cancel_at_period_end,
      canceledAt: fullSubscription.canceled_at,
      currency: fullSubscription.currency,
      customer: fullSubscription.customer,
      amount: amount, // Amount in cents
      interval: interval, // 'month', 'year', etc.
      items: fullSubscription.items.data.map(item => ({
        id: item.id,
        priceId: item.price.id,
        quantity: item.quantity,
      })),
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ message: error.message });
  }
});

// List all subscriptions for a customer
// GET /v1/subscriptions
app.get('/api/customer/:customerId/subscriptions', async (req, res) => {
  try {
    const { customerId } = req.params;

    // List all subscriptions using Subscriptions API
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
    });

    res.json({
      subscriptions: subscriptions.data,
      count: subscriptions.data.length,
    });
  } catch (error) {
    console.error('Error listing subscriptions:', error);
    res.status(500).json({ message: error.message });
  }
});

// Cancel a subscription
// DELETE /v1/subscriptions/:id
app.post('/api/subscriptions/:subscriptionId/cancel', async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { cancelAtPeriodEnd = false } = req.body;

    // Cancel subscription using Subscriptions API
    const subscription = await stripe.subscriptions.cancel(subscriptionId, {
      cancel_at_period_end: cancelAtPeriodEnd,
    });

    res.json({
      id: subscription.id,
      status: subscription.status,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      canceledAt: subscription.canceled_at,
    });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({ message: error.message });
  }
});

// Resume a canceled subscription
// POST /v1/subscriptions/:id/resume
app.post('/api/subscriptions/:subscriptionId/resume', async (req, res) => {
  try {
    const { subscriptionId } = req.params;

    // Resume subscription using Subscriptions API
    const subscription = await stripe.subscriptions.resume(subscriptionId, {
      billing_cycle_anchor: 'now',
    });

    res.json({
      id: subscription.id,
      status: subscription.status,
    });
  } catch (error) {
    console.error('Error resuming subscription:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get charges for a customer using Charges API
// GET /v1/charges?customer=cus_xxx
// Reference: https://docs.stripe.com/api/charges/list
app.get('/api/customer/:customerId/charges', async (req, res) => {
  try {
    const { customerId } = req.params;
    const { status } = req.query; // Optional status filter

    if (!customerId) {
      return res.status(400).json({ message: 'Customer ID is required' });
    }

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

    res.json(response);
  } catch (error) {
    console.error('[CHARGES API] Error fetching charges:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all purchases for a customer (both one-time and subscriptions)
// This combines Charges API to get all payments and checks if they're linked to subscriptions
// GET /api/customer/:customerId/purchases
// Reference: 
// - Charges API: https://docs.stripe.com/api/charges/list
// - Invoices API: https://docs.stripe.com/api/invoices/list
app.get('/api/customer/:customerId/purchases', async (req, res) => {
  try {
    const { customerId } = req.params;
    const { status } = req.query; // Optional status filter

    if (!customerId) {
      return res.status(400).json({ message: 'Customer ID is required' });
    }

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

    // Step 1.5: Also fetch Payment Intents as an alternative source
    // Payment Intents API can sometimes capture transactions that Charges API misses
    // Reference: https://docs.stripe.com/api/payment_intents/list
    let allPaymentIntents = [];
    hasMore = true;
    startingAfter = null;
    
    const paymentIntentParams = {
      customer: customerId,
      limit: 100,
    };
    
    while (hasMore) {
      const params = { ...paymentIntentParams };
      if (startingAfter) {
        params.starting_after = startingAfter;
      }
      
      const paymentIntents = await stripe.paymentIntents.list(params);
      allPaymentIntents = allPaymentIntents.concat(paymentIntents.data);
      
      hasMore = paymentIntents.has_more;
      if (hasMore && paymentIntents.data.length > 0) {
        startingAfter = paymentIntents.data[paymentIntents.data.length - 1].id;
      }
      
      console.log(`[PURCHASES API] Fetched ${paymentIntents.data.length} payment intents (total so far: ${allPaymentIntents.length})`);
      
      if (allPaymentIntents.length >= 1000) {
        break;
      }
    }
    
    console.log(`[PURCHASES API] Total payment intents fetched: ${allPaymentIntents.length}`);
    
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
    // Initialize processedPurchases array first
    const processedPurchases = [];
    
    // Log sample charges for debugging
    console.log(`\n[PURCHASES API] Sample charges (first 5):`);
    allCharges.slice(0, 5).forEach((ch, idx) => {
      const piId = typeof ch.payment_intent === 'string' ? ch.payment_intent : ch.payment_intent?.id;
      console.log(`  ${idx + 1}. Charge ${ch.id}:`);
      console.log(`     - Status: ${ch.status}`);
      console.log(`     - Amount: ${ch.amount} ${ch.currency}`);
      console.log(`     - Description: ${ch.description || 'N/A'}`);
      console.log(`     - Created: ${new Date(ch.created * 1000).toISOString()}`);
      console.log(`     - Invoice: ${ch.invoice || 'N/A'}`);
      console.log(`     - Payment Intent: ${piId || 'N/A'}`);
    });
    
    // Log ALL payment intent IDs from charges
    console.log(`\n[PURCHASES API] All payment intent IDs from charges:`);
    allCharges.forEach((ch, idx) => {
      const piId = typeof ch.payment_intent === 'string' ? ch.payment_intent : ch.payment_intent?.id;
      if (piId) {
        console.log(`  Charge ${ch.id}: ${piId}`);
      }
    });
    
    // Log ALL payment intent IDs from payment intents list
    console.log(`\n[PURCHASES API] All payment intent IDs from payment intents list:`);
    allPaymentIntents.forEach((pi, idx) => {
      console.log(`  ${idx + 1}. ${pi.id} - Status: ${pi.status}, Customer: ${pi.customer}`);
    });
    
    for (const charge of allCharges) {
      // Apply status filter if provided
      if (status && charge.status !== status) {
        console.log(`[PURCHASES API] Skipping charge ${charge.id} - status ${charge.status} doesn't match filter ${status}`);
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
        console.log(`[PURCHASES API] Charge ${charge.id} is linked to subscription ${subscriptionId} via invoice ${invoiceId}`);
      } else if (invoiceId) {
        // Charge has invoice but invoice is not in subscription map - check directly
        try {
          const invoice = await stripe.invoices.retrieve(invoiceId);
          if (invoice.subscription) {
            purchaseType = 'subscription';
            subscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription.id;
            console.log(`[PURCHASES API] Charge ${charge.id} is linked to subscription ${subscriptionId} (checked invoice directly)`);
          } else {
            console.log(`[PURCHASES API] Charge ${charge.id} has invoice ${invoiceId} but invoice is not linked to a subscription (one-time purchase)`);
          }
        } catch (err) {
          console.log(`[PURCHASES API] Charge ${charge.id} has invoice ${invoiceId} but could not retrieve it (assuming one-time):`, err.message);
        }
      } else {
        console.log(`[PURCHASES API] Charge ${charge.id} has no invoice - marking as one-time purchase`);
      }
      
      // Additional check: if description says "Subscription creation", it's definitely a subscription
      if (charge.description && charge.description.toLowerCase().includes('subscription')) {
        if (purchaseType === 'one-time' && invoiceId) {
          console.log(`[PURCHASES API] WARNING: Charge ${charge.id} has description "${charge.description}" and invoice ${invoiceId} but was marked as one-time. Re-checking...`);
          // This is likely a subscription - try to find the subscription
          if (invoiceId) {
            try {
              const invoice = await stripe.invoices.retrieve(invoiceId);
              if (invoice.subscription) {
                purchaseType = 'subscription';
                subscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription.id;
                console.log(`[PURCHASES API] Fixed: Charge ${charge.id} is actually a subscription ${subscriptionId}`);
              }
            } catch (err) {
              // Ignore errors
            }
          }
        }
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
    
    console.log(`\n[PURCHASES API] Processed charges breakdown:`);
    const oneTimeProcessed = processedPurchases.filter(p => p.type === 'one-time');
    const subscriptionProcessed = processedPurchases.filter(p => p.type === 'subscription');
    console.log(`  - One-time: ${oneTimeProcessed.length}`);
    console.log(`  - Subscription: ${subscriptionProcessed.length}`);
    if (oneTimeProcessed.length > 0) {
      console.log(`  One-time purchases:`, oneTimeProcessed.map(p => ({ id: p.id, amount: p.amount, description: p.description })));
    }
    if (subscriptionProcessed.length > 0) {
      console.log(`  Subscription payments:`, subscriptionProcessed.map(p => ({ id: p.id, amount: p.amount, description: p.description })));
    }
    
    // Step 4: Process Checkout Sessions and add to purchases
    // Create a set of charge IDs and payment intent IDs we've already processed to avoid duplicates
    const processedChargeIds = new Set(processedPurchases.map(p => p.id));
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
    
    // Step 4.3: Try to find the specific payment intent by looking up its charge directly
    // Sometimes payment intents aren't linked to customers properly, but charges are
    console.log(`\n[PURCHASES API] Looking for specific payment intent pi_3Sjw1GCesXg2iRo914rc8V0D...`);
    try {
      const targetCharge = await stripe.charges.list({
        payment_intent: 'pi_3Sjw1GCesXg2iRo914rc8V0D',
        limit: 1,
      });
      
      if (targetCharge.data.length > 0) {
        const charge = targetCharge.data[0];
        console.log(`[PURCHASES API] Found charge for target payment intent!`);
        console.log(`  - Charge ID: ${charge.id}`);
        console.log(`  - Customer: ${charge.customer || 'N/A'}`);
        console.log(`  - Status: ${charge.status}`);
        console.log(`  - Amount: ${charge.amount}`);
        console.log(`  - Invoice: ${charge.invoice || 'N/A'}`);
        
        // Check if this charge is already in our processed purchases
        const alreadyProcessed = processedPurchases.find(p => 
          p.paymentIntentId === 'pi_3Sjw1GCesXg2iRo914rc8V0D' || 
          p.id === charge.id
        );
        
        if (!alreadyProcessed && charge.customer === customerId) {
          // Process this charge
          let purchaseType = 'one-time';
          let subscriptionId = null;
          const invoiceId = typeof charge.invoice === 'string' ? charge.invoice : charge.invoice?.id || null;
          
          if (invoiceId) {
            try {
              const invoice = await stripe.invoices.retrieve(invoiceId);
              if (invoice.subscription) {
                purchaseType = 'subscription';
                subscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription.id;
              }
            } catch (err) {
              // Ignore errors
            }
          }
          
          processedPurchases.push({
            id: charge.id,
            type: purchaseType,
            amount: charge.amount,
            currency: charge.currency,
            date: charge.created,
            status: charge.status,
            description: charge.description,
            receiptUrl: charge.receipt_url || null,
            invoiceId: invoiceId,
            paymentIntentId: 'pi_3Sjw1GCesXg2iRo914rc8V0D',
            subscriptionId: subscriptionId,
            billingDetails: charge.billing_details ? {
              name: charge.billing_details.name,
              email: charge.billing_details.email,
            } : null,
            paymentMethod: charge.payment_method_details ? {
              type: charge.payment_method_details.type,
              card: charge.payment_method_details.card ? {
                brand: charge.payment_method_details.card.brand,
                last4: charge.payment_method_details.card.last4,
              } : null,
            } : null,
          });
          
          console.log(`[PURCHASES API] Added ${purchaseType} purchase from target payment intent!`);
        } else if (charge.customer !== customerId) {
          console.log(`[PURCHASES API] Charge belongs to different customer: ${charge.customer} (expected: ${customerId})`);
        } else {
          console.log(`[PURCHASES API] Charge already processed`);
        }
      } else {
        console.log(`[PURCHASES API] No charge found for payment intent pi_3Sjw1GCesXg2iRo914rc8V0D`);
      }
    } catch (err) {
      console.log(`[PURCHASES API] Error looking up charge for payment intent:`, err.message);
    }
    
    // Step 4.5: Process payment intents that don't have charges yet
    // Some payment intents might not have charges created yet, or charges might be filtered out
    console.log(`\n[PURCHASES API] Processing payment intents without charges...`);
    const chargePaymentIntentIds = new Set();
    processedPurchases.forEach(p => {
      if (p.paymentIntentId) chargePaymentIntentIds.add(p.paymentIntentId);
    });
    
    // Create paymentIntentMap if not already created (it should be created earlier)
    if (typeof paymentIntentMap === 'undefined') {
      paymentIntentMap = new Map();
      allPaymentIntents.forEach(pi => {
        paymentIntentMap.set(pi.id, pi);
      });
    }
    
    // DEBUG: Check if our target payment intent is in the list
    const targetPI = paymentIntentMap.get('pi_3Sjw1GCesXg2iRo914rc8V0D');
    if (targetPI) {
      console.log(`\n[PURCHASES API] DEBUG: Found target payment intent!`);
      console.log(`  - ID: ${targetPI.id}`);
      console.log(`  - Status: ${targetPI.status}`);
      console.log(`  - Amount: ${targetPI.amount}`);
      console.log(`  - Customer: ${targetPI.customer}`);
      console.log(`  - Invoice: ${targetPI.invoice || 'N/A'}`);
      console.log(`  - Charges: ${targetPI.charges?.data?.length || 0}`);
    } else {
      console.log(`\n[PURCHASES API] DEBUG: Target payment intent NOT found in payment intents list`);
      console.log(`[PURCHASES API] DEBUG: Payment intents found:`, allPaymentIntents.map(pi => pi.id));
      
      // Try to retrieve it directly to see what customer it belongs to
      try {
        const directPI = await stripe.paymentIntents.retrieve('pi_3Sjw1GCesXg2iRo914rc8V0D');
        console.log(`[PURCHASES API] DEBUG: Retrieved payment intent directly:`);
        console.log(`  - Customer: ${directPI.customer || 'N/A'}`);
        console.log(`  - Status: ${directPI.status}`);
        console.log(`  - Amount: ${directPI.amount}`);
        console.log(`  - Invoice: ${directPI.invoice || 'N/A'}`);
        if (directPI.customer !== customerId) {
          console.log(`[PURCHASES API] DEBUG: Payment intent belongs to different customer! Expected: ${customerId}, Found: ${directPI.customer}`);
        }
      } catch (err) {
        console.log(`[PURCHASES API] DEBUG: Could not retrieve payment intent directly:`, err.message);
      }
    }
    
    for (const pi of allPaymentIntents) {
      // Skip if we already processed this via charges or checkout sessions
      if (chargePaymentIntentIds.has(pi.id)) {
        continue;
      }
      
      // Only process succeeded payment intents
      if (pi.status !== 'succeeded') {
        continue;
      }
      
      // Check if this payment intent has an invoice (subscription) or not (one-time)
      let purchaseType = 'one-time';
      let subscriptionId = null;
      
      if (pi.invoice) {
        const invoiceId = typeof pi.invoice === 'string' ? pi.invoice : pi.invoice.id;
        if (invoiceToSubscriptionMap.has(invoiceId)) {
          purchaseType = 'subscription';
          subscriptionId = invoiceToSubscriptionMap.get(invoiceId);
        } else {
          // Check invoice directly
          try {
            const invoice = await stripe.invoices.retrieve(invoiceId);
            if (invoice.subscription) {
              purchaseType = 'subscription';
              subscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription.id;
            }
          } catch (err) {
            // Ignore errors
          }
        }
      }
      
      // Get charge from payment intent if available
      let charge = null;
      if (pi.charges && pi.charges.data && pi.charges.data.length > 0) {
        charge = pi.charges.data[0];
      } else {
        // Try to retrieve charge
        try {
          const charges = await stripe.charges.list({
            payment_intent: pi.id,
            limit: 1,
          });
          if (charges.data.length > 0) {
            charge = charges.data[0];
          }
        } catch (err) {
          console.log(`[PURCHASES API] Could not retrieve charge for payment intent ${pi.id}:`, err.message);
        }
      }
      
      processedPurchases.push({
        id: charge ? charge.id : `pi_${pi.id}`, // Use charge ID if available, otherwise payment intent ID
        type: purchaseType,
        amount: pi.amount,
        currency: pi.currency,
        date: pi.created,
        status: 'succeeded',
        description: pi.description || charge?.description || null,
        receiptUrl: charge?.receipt_url || null,
        invoiceId: typeof pi.invoice === 'string' ? pi.invoice : pi.invoice?.id || null,
        paymentIntentId: pi.id,
        subscriptionId: subscriptionId,
        billingDetails: charge?.billing_details ? {
          name: charge.billing_details.name,
          email: charge.billing_details.email,
        } : null,
        paymentMethod: charge?.payment_method_details ? {
          type: charge.payment_method_details.type,
          card: charge.payment_method_details.card ? {
            brand: charge.payment_method_details.card.brand,
            last4: charge.payment_method_details.card.last4,
          } : null,
        } : null,
      });
      
      console.log(`[PURCHASES API] Added ${purchaseType} purchase from payment intent ${pi.id} (no charge found)`);
    }
    
    console.log(`[PURCHASES API] After processing payment intents: ${processedPurchases.length} total purchases`);
    
    // Sort by date (newest first)
    processedPurchases.sort((a, b) => b.date - a.date);
    
    const oneTimeCount = processedPurchases.filter(p => p.type === 'one-time').length;
    const subscriptionCount = processedPurchases.filter(p => p.type === 'subscription').length;
    
    // DEBUG: Check if the specific payment intent is in our data
    const targetPaymentIntentId = 'pi_3Sjw1GCesXg2iRo914rc8V0D';
    console.log(`\n[PURCHASES API] DEBUG: Looking for payment intent ${targetPaymentIntentId}...`);
    
    // Check in charges
    const chargeWithPI = allCharges.find(ch => {
      const piId = typeof ch.payment_intent === 'string' ? ch.payment_intent : ch.payment_intent?.id;
      return piId === targetPaymentIntentId;
    });
    if (chargeWithPI) {
      console.log(`[PURCHASES API] DEBUG: Found in charges! Charge ID: ${chargeWithPI.id}, Status: ${chargeWithPI.status}, Invoice: ${chargeWithPI.invoice}`);
    } else {
      console.log(`[PURCHASES API] DEBUG: NOT found in charges`);
    }
    
    // Check in payment intents
    const piFound = allPaymentIntents.find(pi => pi.id === targetPaymentIntentId);
    if (piFound) {
      console.log(`[PURCHASES API] DEBUG: Found in payment intents! Status: ${piFound.status}, Customer: ${piFound.customer}, Invoice: ${piFound.invoice}`);
    } else {
      console.log(`[PURCHASES API] DEBUG: NOT found in payment intents`);
    }
    
    // Check in checkout sessions
    const sessionWithPI = completedSessions.find(session => {
      // We need to check the payment_intent field
      return session.payment_intent === targetPaymentIntentId;
    });
    if (sessionWithPI) {
      console.log(`[PURCHASES API] DEBUG: Found in checkout sessions! Session ID: ${sessionWithPI.id}, Mode: ${sessionWithPI.mode}, Status: ${sessionWithPI.payment_status}`);
    } else {
      console.log(`[PURCHASES API] DEBUG: NOT found in checkout sessions (need to retrieve full session to check)`);
      // Try retrieving full sessions to check
      for (const session of completedSessions.slice(0, 10)) { // Check first 10
        try {
          const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
            expand: ['payment_intent'],
          });
          const piId = typeof fullSession.payment_intent === 'string' 
            ? fullSession.payment_intent 
            : fullSession.payment_intent?.id;
          if (piId === targetPaymentIntentId) {
            console.log(`[PURCHASES API] DEBUG: Found in checkout session ${session.id}! Mode: ${session.mode}`);
            break;
          }
        } catch (err) {
          // Skip errors
        }
      }
    }
    
    // Check in processed purchases
    const purchaseFound = processedPurchases.find(p => p.paymentIntentId === targetPaymentIntentId);
    if (purchaseFound) {
      console.log(`[PURCHASES API] DEBUG: Found in processed purchases! Type: ${purchaseFound.type}, ID: ${purchaseFound.id}`);
    } else {
      console.log(`[PURCHASES API] DEBUG: NOT found in processed purchases`);
    }
    
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

    res.json(response);
  } catch (error) {
    console.error('[PURCHASES API] Error fetching purchases:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get checkout sessions for a customer where mode === 'payment' (one-time payments)
// GET /api/customer/:customerId/checkout-sessions
// Reference: https://docs.stripe.com/api/checkout/sessions/list
app.get('/api/customer/:customerId/checkout-sessions', async (req, res) => {
  try {
    const { customerId } = req.params;

    if (!customerId) {
      return res.status(400).json({ message: 'Customer ID is required' });
    }

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
});

// Debug endpoint to look up a specific payment intent
app.get('/api/debug/payment-intent/:paymentIntentId', async (req, res) => {
  try {
    const { paymentIntentId } = req.params;
    
    console.log(`\n========== [DEBUG] Looking up payment intent ${paymentIntentId} ==========`);
    
    // Retrieve the payment intent
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId, {
      expand: ['charges.data', 'invoice', 'customer'],
    });
    
    console.log(`[DEBUG] Payment Intent Details:`);
    console.log(`  - ID: ${pi.id}`);
    console.log(`  - Status: ${pi.status}`);
    console.log(`  - Amount: ${pi.amount} ${pi.currency}`);
    console.log(`  - Customer: ${pi.customer || 'N/A'}`);
    console.log(`  - Invoice: ${pi.invoice || 'N/A'}`);
    console.log(`  - Charges: ${pi.charges?.data?.length || 0}`);
    
    if (pi.charges && pi.charges.data && pi.charges.data.length > 0) {
      pi.charges.data.forEach((charge, idx) => {
        console.log(`  Charge ${idx + 1}:`);
        console.log(`    - ID: ${charge.id}`);
        console.log(`    - Status: ${charge.status}`);
        console.log(`    - Amount: ${charge.amount} ${charge.currency}`);
        console.log(`    - Invoice: ${charge.invoice || 'N/A'}`);
        console.log(`    - Description: ${charge.description || 'N/A'}`);
      });
    }
    
    // Check if invoice exists and if it's linked to a subscription
    if (pi.invoice) {
      const invoiceId = typeof pi.invoice === 'string' ? pi.invoice : pi.invoice.id;
      try {
        const invoice = await stripe.invoices.retrieve(invoiceId);
        console.log(`  Invoice Details:`);
        console.log(`    - ID: ${invoice.id}`);
        console.log(`    - Subscription: ${invoice.subscription || 'N/A'}`);
        console.log(`    - Status: ${invoice.status}`);
      } catch (err) {
        console.log(`  Could not retrieve invoice: ${err.message}`);
      }
    }
    
    // Check checkout sessions for this payment intent
    if (pi.customer) {
      const customerId = typeof pi.customer === 'string' ? pi.customer : pi.customer.id;
      const sessions = await stripe.checkout.sessions.list({
        customer: customerId,
        limit: 100,
      });
      
      const matchingSession = sessions.data.find(session => {
        return session.payment_intent === paymentIntentId;
      });
      
      if (matchingSession) {
        console.log(`  Checkout Session Found:`);
        console.log(`    - Session ID: ${matchingSession.id}`);
        console.log(`    - Mode: ${matchingSession.mode}`);
        console.log(`    - Payment Status: ${matchingSession.payment_status}`);
        console.log(`    - Status: ${matchingSession.status}`);
      } else {
        console.log(`  No checkout session found for this payment intent`);
      }
    }
    
    console.log(`========== END DEBUG ==========\n`);
    
    res.json({
      paymentIntent: {
        id: pi.id,
        status: pi.status,
        amount: pi.amount,
        currency: pi.currency,
        customer: pi.customer,
        invoice: pi.invoice,
        charges: pi.charges?.data?.map(ch => ({
          id: ch.id,
          status: ch.status,
          amount: ch.amount,
          invoice: ch.invoice,
          description: ch.description,
        })) || [],
      },
    });
  } catch (error) {
    console.error('[DEBUG] Error looking up payment intent:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get invoices for a customer using Invoices API
// GET /v1/invoices?customer=cus_xxx
// Reference: https://docs.stripe.com/api/invoices/list
// Returns raw Stripe response as-is
app.get('/api/customer/:customerId/invoices', async (req, res) => {
  try {
    const { customerId } = req.params;
    const { status, subscription } = req.query; // Optional filters

    if (!customerId) {
      return res.status(400).json({ message: 'Customer ID is required' });
    }

    console.log(`\n========== [INVOICES API] STARTING FETCH ==========`);
    console.log(`[INVOICES API] Fetching invoices for customer: ${customerId}`);
    console.log(`[INVOICES API] Filters - status: ${status || 'all'}, subscription: ${subscription || 'all'}`);

    // Build query parameters for Stripe Invoices API
    // GET /v1/invoices?customer=cus_xxx
    const listParams = {
      customer: customerId,
      limit: 100, // Stripe's max per page
    };

    // Add optional filters
    if (status) {
      listParams.status = status;
    }

    // List ALL invoices using Invoices API (handle pagination)
    let allInvoices = [];
    let hasMore = true;
    let startingAfter = null;
    
    while (hasMore) {
      const params = { ...listParams };
      if (startingAfter) {
        params.starting_after = startingAfter;
      }
      
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
    
    // Log invoice breakdown BEFORE filtering
    const oneTimeCountBefore = allInvoices.filter(inv => inv.subscription === null).length;
    const subscriptionCountBefore = allInvoices.filter(inv => inv.subscription !== null).length;
    console.log(`[INVOICES API] Breakdown BEFORE filtering: ${oneTimeCountBefore} one-time purchases, ${subscriptionCountBefore} subscription invoices`);
    
    // Log sample invoices for debugging
    if (allInvoices.length > 0) {
      console.log(`\n[INVOICES API] Sample invoices (first 3):`);
      allInvoices.slice(0, 3).forEach((inv, idx) => {
        console.log(`  ${idx + 1}. Invoice ${inv.id}:`);
        console.log(`     - Subscription: ${inv.subscription} (${inv.subscription === null ? 'ONE-TIME' : 'SUBSCRIPTION'})`);
        console.log(`     - Status: ${inv.status}`);
        console.log(`     - Amount: ${inv.amount_paid || inv.total} ${inv.currency}`);
        console.log(`     - Created: ${new Date(inv.created * 1000).toISOString()}`);
      });
    }

    // Apply filters
    let filteredInvoices = allInvoices;
    if (subscription === 'null') {
      filteredInvoices = allInvoices.filter(inv => inv.subscription === null);
      console.log(`[INVOICES API] Filtered to ${filteredInvoices.length} invoices with subscription=null (one-time purchases)`);
    } else if (subscription && subscription !== 'all') {
      filteredInvoices = allInvoices.filter(inv => inv.subscription === subscription);
      console.log(`[INVOICES API] Filtered to ${filteredInvoices.length} invoices for subscription ${subscription}`);
    }

    // Process invoices to get line items
    // Reference: https://docs.stripe.com/api/invoices/line_items
    const processedInvoices = [];
    
    console.log(`[INVOICES API] Processing ${filteredInvoices.length} invoices to get line items...`);
    
    for (const invoice of filteredInvoices) {
      try {
        // Fetch line items for this invoice
        let lineItemsData = [];
        
        // Check if lines.data is already available (expanded)
        if (invoice.lines && Array.isArray(invoice.lines.data) && invoice.lines.data.length > 0) {
          lineItemsData = invoice.lines.data;
          console.log(`[INVOICES API] Invoice ${invoice.id}: Using expanded line items (${lineItemsData.length})`);
        } else {
          // Fetch line items using the Invoice Line Items API
          try {
            const lineItemsResponse = await stripe.invoices.listLineItems(invoice.id, {
              limit: 100,
            });
            lineItemsData = lineItemsResponse.data || [];
            console.log(`[INVOICES API] Invoice ${invoice.id}: Fetched ${lineItemsData.length} line items`);
          } catch (lineItemsErr) {
            console.error(`[INVOICES API] Error fetching line items for invoice ${invoice.id}:`, lineItemsErr.message);
            lineItemsData = [];
          }
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
    
    console.log(`[INVOICES API] Processed ${processedInvoices.length} invoices with line items`);

    // Return response in expected format
    const response = {
      object: 'list',
      url: '/v1/invoices',
      has_more: false,
      data: processedInvoices,
      count: processedInvoices.length,
    };

    // Log the response being sent
    console.log(`\n========== [INVOICES API] FINAL RESPONSE BEING SENT ==========`);
    console.log(`[INVOICES API] Response structure:`, JSON.stringify({
      object: response.object,
      url: response.url,
      has_more: response.has_more,
      data_count: response.data.length,
      sample_invoice: response.data[0] || null,
    }, null, 2));
    console.log(`========== END FINAL RESPONSE ==========\n`);

    res.json(response);
  } catch (error) {
    console.error('[INVOICES API] Error fetching invoices:', error);
    res.status(500).json({ message: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Stripe API Server running on http://localhost:${PORT}`);
  console.log(`📝 Make sure STRIPE_SECRET_KEY is set in your environment`);
  console.log(`🔗 Set REACT_APP_STRIPE_SERVERLESS_URL=http://localhost:${PORT}/api in your .env`);
  
  // Check if STRIPE_SECRET_KEY is set
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('⚠️  WARNING: STRIPE_SECRET_KEY is not set!');
    console.error('   Create a .env.local file with: STRIPE_SECRET_KEY=sk_test_YOUR_KEY');
  } else {
    console.log(`✅ STRIPE_SECRET_KEY is set (${process.env.STRIPE_SECRET_KEY.substring(0, 12)}...)`);
  }
});

