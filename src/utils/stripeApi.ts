// Configuration - Set these in your .env file or directly here
// This should be the base URL of your serverless functions (e.g., https://your-project.vercel.app/api)
// In production, automatically uses current origin + /api if not set
const STRIPE_SERVERLESS_BASE_URL = process.env.REACT_APP_STRIPE_SERVERLESS_URL || 
  (typeof window !== 'undefined' ? `${window.location.origin}/api` : '');

/**
 * Creates a Stripe Customer Portal session using a serverless function
 * This allows customers to manage their subscriptions, update payment methods, and view invoices
 */
export const createPortalSession = async (customerId: string): Promise<string> => {
  if (!STRIPE_SERVERLESS_BASE_URL) {
    throw new Error('Stripe serverless function URL not configured. Please set REACT_APP_STRIPE_SERVERLESS_URL');
  }

  try {
    const response = await fetch(`${STRIPE_SERVERLESS_BASE_URL}/create-portal-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerId,
        returnUrl: window.location.origin + '/billing',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create portal session');
    }

    const data = await response.json();
    return data.url;
  } catch (error: any) {
    console.error('Error creating portal session:', error);
    throw new Error(error.message || 'Failed to create portal session');
  }
};

/**
 * Creates a Stripe Checkout Session for subscriptions
 * Uses Stripe's hosted checkout page (prebuilt, Stripe-hosted)
 * Reference: https://docs.stripe.com/payments/checkout
 */
export const createCheckoutSession = async (
  priceId: string,
  customerId?: string,
  customerEmail?: string
): Promise<string> => {
  if (!STRIPE_SERVERLESS_BASE_URL) {
    throw new Error('Stripe serverless function URL not configured. Please set REACT_APP_STRIPE_SERVERLESS_URL');
  }

  try {
    const response = await fetch(`${STRIPE_SERVERLESS_BASE_URL}/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId,
        customerId,
        customerEmail,
        successUrl: window.location.origin + '/billing?success=true&session_id={CHECKOUT_SESSION_ID}',
        cancelUrl: window.location.origin + '/billing?canceled=true',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create checkout session');
    }

    const data = await response.json();
    return data.url;
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    throw new Error(error.message || 'Failed to create checkout session');
  }
};

/**
 * Looks up customer by email and returns customer info with subscription
 */
export const getCustomerByEmail = async (email: string) => {
  if (!STRIPE_SERVERLESS_BASE_URL) {
    throw new Error('Stripe serverless function URL not configured. Please set REACT_APP_STRIPE_SERVERLESS_URL');
  }

  try {
    const url = new URL(`${STRIPE_SERVERLESS_BASE_URL}/customer-by-email`);
    url.searchParams.set('email', email);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null; // No customer found
      }
      const error = await response.json();
      throw new Error(error.message || 'Failed to lookup customer');
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error looking up customer by email:', error);
    throw new Error(error.message || 'Failed to lookup customer by email');
  }
};

/**
 * Gets customer subscription information using Stripe Subscriptions API
 * Reference: https://docs.stripe.com/api/subscriptions
 */
export const getCustomerSubscription = async (customerId: string) => {
  if (!STRIPE_SERVERLESS_BASE_URL) {
    throw new Error('Stripe serverless function URL not configured. Please set REACT_APP_STRIPE_SERVERLESS_URL');
  }

  try {
    const response = await fetch(`${STRIPE_SERVERLESS_BASE_URL}/customer/${customerId}/subscription`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null; // No subscription found
      }
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch subscription');
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error fetching subscription:', error);
    throw new Error(error.message || 'Failed to fetch subscription');
  }
};

/**
 * List all subscriptions for a customer
 * Reference: https://docs.stripe.com/api/subscriptions
 */
export const listCustomerSubscriptions = async (customerId: string) => {
  if (!STRIPE_SERVERLESS_BASE_URL) {
    throw new Error('Stripe serverless function URL not configured. Please set REACT_APP_STRIPE_SERVERLESS_URL');
  }

  try {
    const response = await fetch(`${STRIPE_SERVERLESS_BASE_URL}/customer/${customerId}/subscriptions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to list subscriptions');
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error listing subscriptions:', error);
    throw new Error(error.message || 'Failed to list subscriptions');
  }
};

/**
 * Cancel a subscription
 * Reference: https://docs.stripe.com/api/subscriptions
 */
export const cancelSubscription = async (subscriptionId: string, cancelAtPeriodEnd: boolean = false) => {
  if (!STRIPE_SERVERLESS_BASE_URL) {
    throw new Error('Stripe serverless function URL not configured. Please set REACT_APP_STRIPE_SERVERLESS_URL');
  }

  try {
    const response = await fetch(`${STRIPE_SERVERLESS_BASE_URL}/subscriptions/${subscriptionId}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cancelAtPeriodEnd }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to cancel subscription');
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error canceling subscription:', error);
    throw new Error(error.message || 'Failed to cancel subscription');
  }
};

/**
 * Resume a canceled subscription
 * Reference: https://docs.stripe.com/api/subscriptions
 */
export const resumeSubscription = async (subscriptionId: string) => {
  if (!STRIPE_SERVERLESS_BASE_URL) {
    throw new Error('Stripe serverless function URL not configured. Please set REACT_APP_STRIPE_SERVERLESS_URL');
  }

  try {
    const response = await fetch(`${STRIPE_SERVERLESS_BASE_URL}/subscriptions/${subscriptionId}/resume`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to resume subscription');
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error resuming subscription:', error);
    throw new Error(error.message || 'Failed to resume subscription');
  }
};

/**
 * Gets available products and prices from Stripe
 * Fetches dynamically from Stripe API - no hardcoding needed!
 * 
 * @param type - Filter by type: 'all', 'recurring', or 'one-time'
 */
export const getStripeProducts = async (type: 'all' | 'recurring' | 'one-time' = 'all') => {
  if (!STRIPE_SERVERLESS_BASE_URL) {
    throw new Error('Stripe serverless function URL not configured. Please set REACT_APP_STRIPE_SERVERLESS_URL');
  }

  try {
    const url = new URL(`${STRIPE_SERVERLESS_BASE_URL}/get-products`);
    url.searchParams.set('type', type);
    url.searchParams.set('activeOnly', 'true');

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch products');
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error fetching products:', error);
    throw new Error(error.message || 'Failed to fetch products from Stripe');
  }
};

/**
 * Retrieves checkout session details to get customer ID after successful checkout
 * Reference: https://docs.stripe.com/api/checkout/sessions/retrieve
 */
export const getCheckoutSession = async (sessionId: string) => {
  if (!STRIPE_SERVERLESS_BASE_URL) {
    throw new Error('Stripe serverless function URL not configured. Please set REACT_APP_STRIPE_SERVERLESS_URL');
  }

  try {
    const response = await fetch(`${STRIPE_SERVERLESS_BASE_URL}/checkout-session/${sessionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Check if response is JSON or HTML (404 page)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to retrieve checkout session');
      } else {
        // HTML response (404 page)
        throw new Error(`Server returned ${response.status}. Make sure the server is running and the route /api/checkout-session/:sessionId is registered.`);
      }
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error retrieving checkout session:', error);
    // If it's already an Error with a message, throw it as-is
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(error.message || 'Failed to retrieve checkout session');
  }
};

/**
 * Get charges for a customer using Stripe Charges API
 * Reference: https://docs.stripe.com/api/charges/list
 * 
 * Uses Stripe Charges API: GET /v1/charges?customer=cus_xxx
 * 
 * @param customerId - The Stripe customer ID (obtained from email lookup/subscriptions)
 * @param options - Optional filters
 * @param options.status - Filter by charge status (succeeded, pending, failed)
 * @returns Array of charges with payment details
 */
export const getCustomerCharges = async (
  customerId: string,
  options?: {
    status?: 'succeeded' | 'pending' | 'failed';
  }
) => {
  if (!STRIPE_SERVERLESS_BASE_URL) {
    throw new Error('Stripe serverless function URL not configured. Please set REACT_APP_STRIPE_SERVERLESS_URL');
  }

  try {
    const url = new URL(`${STRIPE_SERVERLESS_BASE_URL}/customer/${customerId}/charges`);
    
    // Add query parameters if provided
    if (options?.status) {
      url.searchParams.set('status', options.status);
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch charges');
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error fetching charges:', error);
    throw new Error(error.message || 'Failed to fetch charges');
  }
};

/**
 * Get one-time purchases (charges) for a customer
 * This is a convenience function that gets all charges for a customer
 * Reference: https://docs.stripe.com/api/charges/list
 * 
 * Uses Stripe Charges API: GET /v1/charges?customer=cus_xxx
 * Charges represent all payments, including one-time purchases
 * 
 * @param customerId - The Stripe customer ID (obtained from email lookup/subscriptions)
 * @returns Array of charges (one-time purchases)
 */
export const getOneTimePurchases = async (customerId: string) => {
  try {
    // Call the charges API endpoint
    // Charges API returns all payments for a customer, including one-time purchases
    const data = await getCustomerCharges(customerId, {
      status: 'succeeded', // Only get successful charges
    });
    
    // Handle different response formats
    // The API returns { data: [...], count: N } format
    if (data && data.data && Array.isArray(data.data)) {
      return data.data;
    }
    
    // Fallback for older format
    if (data && data.charges && Array.isArray(data.charges)) {
      return data.charges;
    }
    
    // If data is already an array, return it
    if (Array.isArray(data)) {
      return data;
    }
    
    return [];
  } catch (error: any) {
    console.error('Error fetching one-time purchases:', error);
    throw error;
  }
};

/**
 * Get all purchases for a customer (both one-time and subscriptions)
 * This endpoint combines Charges API and Invoices API to return all purchases
 * with type information (one-time vs subscription)
 * 
 * Reference: 
 * - Charges API: https://docs.stripe.com/api/charges/list
 * - Invoices API: https://docs.stripe.com/api/invoices/list
 * 
 * @param customerId - The Stripe customer ID (obtained from email lookup/subscriptions)
 * @param options - Optional filters
 * @param options.status - Filter by charge status (succeeded, pending, failed)
 * @returns Object with purchases array and breakdown
 */
export const getAllPurchases = async (
  customerId: string,
  options?: {
    status?: 'succeeded' | 'pending' | 'failed';
  }
) => {
  if (!STRIPE_SERVERLESS_BASE_URL) {
    throw new Error('Stripe serverless function URL not configured. Please set REACT_APP_STRIPE_SERVERLESS_URL');
  }

  try {
    const url = new URL(`${STRIPE_SERVERLESS_BASE_URL}/customer/${customerId}/purchases`);
    
    // Add query parameters if provided
    if (options?.status) {
      url.searchParams.set('status', options.status);
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Check if response is JSON or HTML (404 page)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const error = await response.json();
        throw new Error(error.message || `Failed to fetch purchases: ${response.status}`);
      } else {
        // HTML response (404 page or other error)
        throw new Error(`Server returned ${response.status}. Make sure the server is running and the route /api/customer/:customerId/purchases is registered.`);
      }
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error fetching all purchases:', error);
    // If it's already an Error with a message, throw it as-is
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(error.message || 'Failed to fetch purchases');
  }
};

/**
 * Get checkout sessions for a customer where mode === 'payment' (one-time payments)
 * Reference: https://docs.stripe.com/api/checkout/sessions/list
 * 
 * @param customerId - The Stripe customer ID
 * @returns Object with checkout sessions array
 */
export const getPaymentCheckoutSessions = async (customerId: string) => {
  if (!STRIPE_SERVERLESS_BASE_URL) {
    throw new Error('Stripe serverless function URL not configured. Please set REACT_APP_STRIPE_SERVERLESS_URL');
  }

  try {
    const url = new URL(`${STRIPE_SERVERLESS_BASE_URL}/customer/${customerId}/checkout-sessions`);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const error = await response.json();
        throw new Error(error.message || `Failed to fetch checkout sessions: ${response.status}`);
      } else {
        throw new Error(`Server returned ${response.status}. Make sure the server is running and the route /api/customer/:customerId/checkout-sessions is registered.`);
      }
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error fetching checkout sessions:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(error.message || 'Failed to fetch checkout sessions');
  }
};

