import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { getCustomerByEmail, getCheckoutSession, createPortalSession, getOneTimePurchases, getAllPurchases, getPaymentCheckoutSessions } from '../../utils/stripeApi';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import './styles.css';

interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  interval: 'month' | 'year' | 'one-time';
  priceId: string;
}

interface CustomerSubscription {
  id: string;
  status: string;
  currentPeriodEnd: number;
  currentPeriodStart: number;
  planName?: string;
  cancelAtPeriodEnd: boolean;
  canceledAt: number | null;
  currency: string;
  customer: string;
  amount?: number; // Amount in cents
  interval?: string | null; // 'month', 'year', etc.
}

interface OneTimePurchase {
  id: string;
  amount: number;
  currency: string;
  date: number;
  status: string;
  description: string | null;
  receiptUrl: string | null;
  invoiceId: string | null;
  paymentIntentId: string | null;
  billingDetails: {
    name: string | null;
    email: string | null;
  } | null;
  paymentMethod: {
    type: string;
    card: {
      brand: string;
      last4: string;
    } | null;
  } | null;
}

interface Purchase {
  id: string;
  type: 'one-time' | 'subscription';
  amount: number;
  currency: string;
  date: number;
  status: string;
  description: string | null;
  receiptUrl: string | null;
  invoiceId: string | null;
  paymentIntentId: string | null;
  subscriptionId: string | null;
  billingDetails: {
    name: string | null;
    email: string | null;
  } | null;
  paymentMethod: {
    type: string;
    card: {
      brand: string;
      last4: string;
    } | null;
  } | null;
}

const SimpleBilling: React.FC = () => {
  const title = 'Billing';
  const navigate = useNavigate();
  const { username } = useParams<{ username: string }>();

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscription, setSubscription] = useState<CustomerSubscription | null>(null);
  const [oneTimePurchases, setOneTimePurchases] = useState<OneTimePurchase[]>([]);
  const [allPurchases, setAllPurchases] = useState<Purchase[]>([]);
  const [checkoutSessions, setCheckoutSessions] = useState<any[]>([]);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [customerEmail, setCustomerEmail] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState<string>('');
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(false);
  const [plansLoaded, setPlansLoaded] = useState<boolean>(false);

  // Helper function to extract username from email
  const getUsernameFromEmail = (email: string): string => {
    return email.split('@')[0];
  };

  // Helper function to get email from username (stored in localStorage)
  const getEmailFromUsername = (username: string): string | null => {
    const storedEmail = localStorage.getItem(`billing_email_${username}`);
    return storedEmail;
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = `TRASH - ${title}`;

    // If we're on /billing/:username route, load customer data
    if (username) {
      // Check URL params for successful checkout first
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('success') === 'true') {
        const sessionId = urlParams.get('session_id');
        if (sessionId) {
          // Remove query params immediately to prevent re-triggering
          window.history.replaceState({}, '', window.location.pathname);
          // Set loading state immediately to prevent glitchy behavior
          setLoading(true);
          setHasSearched(true);
          setIsInitialLoad(true); // Show full-screen loader immediately
          handleCheckoutSuccess(sessionId);
          return; // Exit early - handleCheckoutSuccess will handle loading data
        }
      }

      // Normal load - only if not handling checkout success
      const storedEmail = getEmailFromUsername(username);
      if (storedEmail) {
        setEmailInput(storedEmail);
        setIsInitialLoad(true);
        loadCustomerData(storedEmail);
      } else {
        // No email found, go back to input
        navigate('/billing', { replace: true });
      }
      return;
    }

    // Reset states when on /billing route (no username)
    setHasSearched(false);
    setIsInitialLoad(false);
    setPlansLoaded(false);

    // Check URL params for successful checkout (only on /billing route)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      const sessionId = urlParams.get('session_id');
      if (sessionId) {
        // Remove query params immediately to prevent re-triggering
        window.history.replaceState({}, '', window.location.pathname);
        // Set loading state immediately to prevent showing email form
        setLoading(true);
        setHasSearched(true);
        setIsInitialLoad(true); // Show full-screen loader immediately
        handleCheckoutSuccess(sessionId);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  const loadCustomerData = async (email: string) => {
    try {
      setLoading(true);
      setError(null);
      setHasSearched(true);

      const customerData = await getCustomerByEmail(email.trim());
      
      console.log('\n========== FRONTEND: CUSTOMER DATA RECEIVED ==========');
      console.log('Full customer data received:', customerData);
      console.log('\n[FRONTEND] Customer ID:', customerData?.customerId);
      console.log('[FRONTEND] Customer Email:', customerData?.customerEmail);
      console.log('[FRONTEND] Subscription:', customerData?.subscription);
      if (customerData?.subscription) {
        console.log('[FRONTEND] Subscription amount:', customerData.subscription.amount);
        console.log('[FRONTEND] Subscription interval:', customerData.subscription.interval);
        console.log('[FRONTEND] Subscription currency:', customerData.subscription.currency);
      }
      
      console.log('\n[FRONTEND] oneTimePurchases in response:', customerData?.oneTimePurchases);
      console.log('[FRONTEND] Type of oneTimePurchases:', typeof customerData?.oneTimePurchases);
      console.log('[FRONTEND] Is array?', Array.isArray(customerData?.oneTimePurchases));
      console.log('[FRONTEND] oneTimePurchases length:', customerData?.oneTimePurchases?.length || 0);
      
      // Log ALL products purchased (from debug data)
      if (customerData?.debug?.allProductsPurchased) {
        console.log('\n[FRONTEND] ========== ALL PRODUCTS PURCHASED BY CUSTOMER ==========');
        console.log(`Total unique products: ${customerData.debug.allProductsPurchased.length}`);
        
        customerData.debug.allProductsPurchased.forEach((product: any, index: number) => {
          console.log(`\n${index + 1}. ${product.productName}`);
          console.log(`   Type: ${product.type}`);
          console.log(`   Product ID: ${product.productId}`);
          console.log(`   Price ID: ${product.priceId}`);
          console.log(`   Amount: ${product.priceAmount ? (product.priceAmount / 100).toFixed(2) : 'N/A'} ${product.priceCurrency?.toUpperCase() || ''}`);
          console.log(`   Interval: ${product.interval}`);
          console.log(`   Created: ${new Date(product.created * 1000).toISOString()}`);
        });
        
        console.log(`\n[FRONTEND] One-time products: ${customerData.debug.oneTimeProducts?.length || 0}`);
        customerData.debug.oneTimeProducts?.forEach((p: any) => {
          console.log(`  - ${p.productName} (${p.priceId})`);
        });
        
        console.log(`\n[FRONTEND] Subscription products: ${customerData.debug.subscriptionProducts?.length || 0}`);
        customerData.debug.subscriptionProducts?.forEach((p: any) => {
          console.log(`  - ${p.productName} (${p.priceId})`);
        });
        
        console.log('\n[FRONTEND] ========== END ALL PRODUCTS ==========');
      }
      
      if (customerData?.oneTimePurchases && Array.isArray(customerData.oneTimePurchases) && customerData.oneTimePurchases.length > 0) {
        console.log('\n[FRONTEND] One-time purchases details:');
        customerData.oneTimePurchases.forEach((purchase: any, index: number) => {
          console.log(`\n${index + 1}. Purchase ID: ${purchase.id}`);
          console.log(`   Amount: ${purchase.amount ? (purchase.amount / 100).toFixed(2) : 'N/A'} ${purchase.currency?.toUpperCase() || ''}`);
          console.log(`   Status: ${purchase.status}`);
          console.log(`   Date: ${new Date(purchase.date * 1000).toISOString()}`);
          console.log(`   Description: ${purchase.description || 'N/A'}`);
          console.log(`   Receipt URL: ${purchase.receiptUrl || 'N/A'}`);
          console.log(`   Invoice ID: ${purchase.invoiceId || 'N/A'}`);
          console.log(`   Payment Intent ID: ${purchase.paymentIntentId || 'N/A'}`);
        });
      } else {
        console.log('\n[FRONTEND] No one-time purchases found in response');
      }
      
      console.log('\n========== END FRONTEND DEBUG ==========\n');
      
      if (customerData && customerData.customerId) {
        setCustomerId(customerData.customerId);
        setCustomerEmail(customerData.customerEmail);
        localStorage.setItem('stripe_customer_id', customerData.customerId);
        localStorage.setItem('stripe_customer_email', customerData.customerEmail);
        
        if (customerData.subscription) {
          setSubscription(customerData.subscription);
        } else {
          setSubscription(null);
        }
        
        // Set one-time purchases if available (handle undefined for backwards compatibility)
        let purchases = customerData.oneTimePurchases || [];
        
        // If no one-time purchases in response, fetch them directly using the customer ID
        // This ensures we always get charges using Stripe's Charges API
        // Reference: https://docs.stripe.com/api/charges/list
        if (!purchases || !Array.isArray(purchases) || purchases.length === 0) {
          console.log('[FRONTEND] No one-time purchases in response, fetching directly from charges API...');
          try {
            // Use the customer ID to call the charges API endpoint
            // This calls GET /v1/charges?customer=cus_xxx
            const chargesResponse = await getOneTimePurchases(customerData.customerId);
            if (chargesResponse && Array.isArray(chargesResponse)) {
              purchases = chargesResponse;
              console.log(`[FRONTEND] Fetched ${purchases.length} one-time purchases from charges API`);
            }
          } catch (chargeErr) {
            console.error('[FRONTEND] Error fetching charges directly:', chargeErr);
            // Continue with empty array if fetch fails
            purchases = [];
          }
        }
        
        if (Array.isArray(purchases)) {
          console.log('Loaded one-time purchases:', purchases);
          console.log('One-time purchases count:', purchases.length);
          setOneTimePurchases(purchases);
        } else {
          console.log('No one-time purchases found in response:', customerData.oneTimePurchases);
          setOneTimePurchases([]);
        }
        
        // Fetch ALL purchases (both one-time and subscriptions) using the new endpoint
        try {
          console.log('[FRONTEND] Fetching all purchases (one-time + subscriptions)...');
          const allPurchasesResponse = await getAllPurchases(customerData.customerId, {
            status: 'succeeded', // Only get successful purchases
          });
          
          console.log('[FRONTEND] All purchases response:', allPurchasesResponse);
          
          if (allPurchasesResponse && allPurchasesResponse.data && Array.isArray(allPurchasesResponse.data)) {
            console.log(`[FRONTEND] Fetched ${allPurchasesResponse.data.length} total purchases`);
            console.log(`[FRONTEND] Breakdown: ${allPurchasesResponse.breakdown?.oneTime || 0} one-time, ${allPurchasesResponse.breakdown?.subscription || 0} subscription payments`);
            
            // Log each purchase for debugging
            allPurchasesResponse.data.forEach((purchase: any, index: number) => {
              console.log(`\n[FRONTEND] Purchase ${index + 1}:`);
              console.log(`  - ID: ${purchase.id}`);
              console.log(`  - Type: ${purchase.type}`);
              console.log(`  - Amount: ${purchase.amount ? (purchase.amount / 100).toFixed(2) : 'N/A'} ${purchase.currency?.toUpperCase() || ''}`);
              console.log(`  - Status: ${purchase.status}`);
              console.log(`  - Description: ${purchase.description || 'N/A'}`);
              console.log(`  - Date: ${new Date(purchase.date * 1000).toISOString()}`);
              console.log(`  - Invoice ID: ${purchase.invoiceId || 'N/A'}`);
              console.log(`  - Subscription ID: ${purchase.subscriptionId || 'N/A'}`);
            });
            
            setAllPurchases(allPurchasesResponse.data);
          } else {
            console.log('[FRONTEND] No purchases data in response');
            console.log('[FRONTEND] Response structure:', JSON.stringify(allPurchasesResponse, null, 2));
            setAllPurchases([]);
          }
        } catch (purchasesErr) {
          console.error('[FRONTEND] Error fetching all purchases:', purchasesErr);
          console.error('[FRONTEND] Error details:', purchasesErr);
          // Continue with empty array if fetch fails
          setAllPurchases([]);
        }
        
        // Fetch checkout sessions where mode === 'payment'
        try {
          console.log('[FRONTEND] Fetching payment checkout sessions...');
          const checkoutSessionsResponse = await getPaymentCheckoutSessions(customerData.customerId);
          
          console.log('[FRONTEND] Checkout sessions response:', checkoutSessionsResponse);
          
          if (checkoutSessionsResponse && checkoutSessionsResponse.data && Array.isArray(checkoutSessionsResponse.data)) {
            console.log(`[FRONTEND] Fetched ${checkoutSessionsResponse.data.length} payment checkout sessions`);
            
            // Log each checkout session for debugging
            checkoutSessionsResponse.data.forEach((session: any, index: number) => {
              console.log(`\n[FRONTEND] Checkout Session ${index + 1}:`);
              console.log(`  - ID: ${session.id}`);
              console.log(`  - Mode: ${session.mode}`);
              console.log(`  - Amount: ${session.amount ? (session.amount / 100).toFixed(2) : 'N/A'} ${session.currency?.toUpperCase() || ''}`);
              console.log(`  - Status: ${session.status}`);
              console.log(`  - Payment Status: ${session.paymentStatus || 'N/A'}`);
              console.log(`  - Description: ${session.description || 'N/A'}`);
              console.log(`  - Date: ${new Date(session.date * 1000).toISOString()}`);
            });
            
            setCheckoutSessions(checkoutSessionsResponse.data);
          } else {
            console.log('[FRONTEND] No checkout sessions data in response');
            setCheckoutSessions([]);
          }
        } catch (sessionsErr) {
          console.error('[FRONTEND] Error fetching checkout sessions:', sessionsErr);
          // Continue with empty array if fetch fails
          setCheckoutSessions([]);
        }
        
        // Always load plans (needed for one-time purchases even if subscription exists)
        if (!plansLoaded) {
          await loadPlans();
          setPlansLoaded(true);
        }
      } else {
        setCustomerId(null);
        setCustomerEmail(null);
        setSubscription(null);
        setOneTimePurchases([]);
        setAllPurchases([]);
        setCheckoutSessions([]);
        // Load plans if no customer found
        if (!plansLoaded) {
          await loadPlans();
          setPlansLoaded(true);
        }
      }
    } catch (err: any) {
      console.error('Error looking up customer:', err);
      setError(err.message || 'Failed to lookup customer. Please try again.');
        setCustomerId(null);
        setCustomerEmail(null);
        setSubscription(null);
        setOneTimePurchases([]);
        setAllPurchases([]);
        setCheckoutSessions([]);
        // Load plans even on error
      if (!plansLoaded) {
        await loadPlans();
        setPlansLoaded(true);
      }
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  };

  const handleEmailLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      setError('Please enter your email address');
      return;
    }

    const email = emailInput.trim();
    const usernameFromEmail = getUsernameFromEmail(email);
    
    // Store email mapping before navigation
    localStorage.setItem(`billing_email_${usernameFromEmail}`, email);
    
    // Set loading state before navigation
    setIsInitialLoad(true);
    
    // Navigate to username route
    navigate(`/billing/${usernameFromEmail}`, { replace: true });
  };

  const handleCheckoutSuccess = async (sessionId: string) => {
    try {
      setError(null);
      
      const sessionData = await getCheckoutSession(sessionId);
      const email = sessionData?.customerEmail;
      const isOneTimePurchase = sessionData?.mode === 'payment';
      
      if (!email) {
        // Don't show error, just set email input and let user search
        setLoading(false);
        return;
      }

      // Get username from email
      const usernameFromEmail = getUsernameFromEmail(email);
      
      // Store email mapping for username route BEFORE navigation
      localStorage.setItem(`billing_email_${usernameFromEmail}`, email);
      setEmailInput(email);
      setHasSearched(true);
      
      // For one-time purchases, navigate directly to user page and refresh smoothly
      if (isOneTimePurchase) {
        // Navigate to /billing/:username immediately (if not already there)
        // This prevents showing the email input form
        if (username !== usernameFromEmail) {
          navigate(`/billing/${usernameFromEmail}`, { replace: true });
          // Wait for navigation to complete
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Ensure loading state is set
        setLoading(true);
        setIsInitialLoad(true);
        
        // Small delay to ensure Stripe has processed the payment
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Load customer data to refresh all purchases
        await loadCustomerData(email);
      } else {
        // For subscriptions, use the original flow
        // Ensure loading state is set (might already be set from useEffect)
        setLoading(true);
        
        // Wait for Stripe to finish processing the payment
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Navigate to /billing/:username first (if not already there)
        if (username !== usernameFromEmail) {
          navigate(`/billing/${usernameFromEmail}`, { replace: true });
        }
        
        // Then load customer data to refresh all purchases
        await loadCustomerData(email);
      }
    } catch (err: any) {
      console.error('Error handling checkout success:', err);
      // Don't show error message, just set email input if we have it
      // User can manually search
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!customerId) {
      setError('Customer ID not found. Please contact support.');
      return;
    }

    try {
      setRedirecting(true);
      setError(null);
      
      // Build return URL with username if available
      const returnUrl = username 
        ? `${window.location.origin}/billing/${username}`
        : `${window.location.origin}/billing`;
      
      // We need to update createPortalSession to accept returnUrl
      // For now, we'll use the default behavior and update the API call
      // Auto-detect production URL, fallback to localhost for development
      const serverUrl = process.env.REACT_APP_STRIPE_SERVERLESS_URL || 
        (typeof window !== 'undefined' ? `${window.location.origin}/api` : 'http://localhost:3001/api');
      const response = await fetch(`${serverUrl}/create-portal-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          returnUrl,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create portal session');
      }

      const data = await response.json();
      const portalUrl = data.url;
      
      // Small delay to show loading state, then redirect
      setTimeout(() => {
        window.location.href = portalUrl;
      }, 300);
    } catch (err: any) {
      setError(err.message || 'Failed to open billing portal');
      setRedirecting(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const loadPlans = async () => {
    const serverUrl = process.env.REACT_APP_STRIPE_SERVERLESS_URL || 'http://localhost:3001/api';
    
    try {
      console.log('Loading plans from:', `${serverUrl}/get-products`);
      const response = await fetch(`${serverUrl}/get-products`);
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Plans data received:', data);
      
      if (data.products && data.products.length > 0) {
        const transformedPlans: SubscriptionPlan[] = data.products.map((product: any) => ({
          id: product.id,
          name: product.productName,
          description: product.productDescription,
          price: product.price,
          currency: product.currency,
          interval: product.interval,
          priceId: product.priceId,
        }));
        console.log('Transformed plans:', transformedPlans);
        console.log('Plan priceIds:', transformedPlans.map(p => ({ name: p.name, priceId: p.priceId })));
        setPlans(transformedPlans);
        return;
      }

      // Fallback: Load from environment variable
      const plansEnv = process.env.REACT_APP_STRIPE_PLANS;
      if (plansEnv) {
        const parsedPlans = JSON.parse(plansEnv);
        console.log('Loaded plans from environment:', parsedPlans);
        setPlans(parsedPlans);
      } else {
        console.warn('No plans found in API response or environment variable');
      }
    } catch (err: any) {
      console.error('Error loading plans:', err);
      // Try fallback from environment variable even if API fails
      const plansEnv = process.env.REACT_APP_STRIPE_PLANS;
      if (plansEnv) {
        try {
          const parsedPlans = JSON.parse(plansEnv);
          console.log('Loaded plans from environment (fallback):', parsedPlans);
          setPlans(parsedPlans);
        } catch (parseErr) {
          console.error('Error parsing plans from environment:', parseErr);
        }
      }
    }
  };

  const handleSubscribe = async (priceId: string) => {
    const serverUrl = process.env.REACT_APP_STRIPE_SERVERLESS_URL || 'http://localhost:3001/api';
    
    try {
      setRedirecting(true);
      setError(null);

      // CRITICAL: Avoid creating guest customers
      // If we don't have a customerId in state, check if user has any purchases/subscriptions first
      let finalCustomerId = customerId;
      const emailToCheck = customerEmail || emailInput;
      const trimmedEmail = emailToCheck ? emailToCheck.trim() : null;

      if (!finalCustomerId && trimmedEmail) {
        console.log('[BILLING] No customerId in state, checking for existing purchases/subscriptions...');
        
        try {
          // Check if user has any purchases or subscriptions by looking up customer by email
          const customerData = await getCustomerByEmail(trimmedEmail);
          
          if (customerData && customerData.customerId) {
            // User has existing purchases/subscriptions - use that customer ID
            finalCustomerId = customerData.customerId;
            console.log('[BILLING] Found existing customer ID from purchases/subscriptions:', finalCustomerId);
            
            // Update state to reflect this
            if (finalCustomerId) {
              setCustomerId(finalCustomerId);
              localStorage.setItem('stripe_customer_id', finalCustomerId);
            }
            if (customerData.customerEmail) {
              setCustomerEmail(customerData.customerEmail);
              localStorage.setItem('stripe_customer_email', customerData.customerEmail);
            }
          } else {
            console.log('[BILLING] No existing customer found - this is a new user');
            // This is a new user with no purchases/subscriptions - proceed with current flow
            // (will create a new customer, not a guest)
          }
        } catch (lookupErr) {
          console.error('[BILLING] Error looking up customer:', lookupErr);
          // Continue with checkout - if lookup fails, proceed as new user
        }
      } else if (finalCustomerId) {
        console.log('[BILLING] Using existing customerId from state:', finalCustomerId);
      }

      const response = await fetch(`${serverUrl}/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          customerId: finalCustomerId || undefined, // Only pass if we have it
          customerEmail: (!finalCustomerId && trimmedEmail) ? trimmedEmail : undefined, // Only pass email if we don't have customerId
          successUrl: username 
            ? `${window.location.origin}/billing/${username}?success=true&session_id={CHECKOUT_SESSION_ID}`
            : `${window.location.origin}/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: username 
            ? `${window.location.origin}/billing/${username}?canceled=true`
            : `${window.location.origin}/billing?canceled=true`,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create checkout session');
      }

      const data = await response.json();
      const checkoutUrl = data.url;
      
      // Small delay to show loading state, then redirect
      setTimeout(() => {
        window.location.href = checkoutUrl;
      }, 300);
    } catch (err: any) {
      setError(err.message || 'Failed to start checkout. Make sure your local server is running.');
      setRedirecting(false);
    }
  };

  const fadeOut = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { ease: 'easeOut', duration: 0.5 }
    },
  };

  return (
    <>
      {/* Redirecting Overlay */}
      {redirecting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#1b1c1e',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <div style={{
            textAlign: 'center',
            color: '#F0EEF0',
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              border: '3px solid #3a3a3a',
              borderTopColor: '#f93b3b',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1.5rem',
            }} />
            <p style={{
              fontSize: '1.2rem',
              marginBottom: '0.5rem',
              fontFamily: 'Bebas Neue, sans-serif',
            }}>
              Redirecting to Stripe
            </p>
            <p style={{
              fontSize: '0.9rem',
              color: '#888',
            }}>
              Please wait...
            </p>
          </div>
        </motion.div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      <motion.div
        className="billing-container"
        initial="hidden"
        animate="show"
        variants={fadeOut}
        style={{
          minHeight: '100vh',
          backgroundColor: '#1b1c1e',
          color: '#F0EEF0',
          padding: 0,
          opacity: redirecting ? 0.3 : 1,
          pointerEvents: redirecting ? 'none' : 'auto',
          transition: 'opacity 0.3s',
        }}
      >
      <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%', padding: '0' }}>
        {/* Email Input Form - Show only when not searched */}
        {!hasSearched && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '70vh',
              padding: '4rem 2rem',
            }}
          >
            {/* Main Card Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              style={{
                width: '100%',
                maxWidth: '600px',
                backgroundColor: '#2a2b2d',
                borderRadius: '16px',
                padding: '3.5rem 2.5rem',
                border: '1px solid rgba(249, 59, 59, 0.1)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(249, 59, 59, 0.05)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Decorative accent line */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #f93b3b 0%, #e12d2d 100%)',
              }} />

              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <motion.h1
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  style={{
                    fontSize: '4rem',
                    fontWeight: 'bold',
                    marginBottom: '0.75rem',
                    color: '#F0EEF0',
                    fontFamily: 'Bebas Neue, sans-serif',
                    letterSpacing: '2px',
                    background: 'linear-gradient(135deg, #F0EEF0 0%, #cccccc 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  BILLING
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  style={{
                    fontSize: '1.1rem',
                    color: '#888',
                    fontWeight: '300',
                    letterSpacing: '0.5px',
                  }}
                >
                  Enter your email to access your subscription
                </motion.p>
              </div>
              
              {/* Form */}
              <motion.form
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                onSubmit={handleEmailLookup}
                style={{ width: '100%' }}
              >
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem',
                }}>
                  {/* Input Container */}
                  <div style={{ position: 'relative' }}>
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="your@email.com"
                      required
                      disabled={loading}
                      style={{
                        width: '100%',
                        padding: '1.25rem 1.5rem',
                        backgroundColor: '#1b1c1e',
                        border: '2px solid #3a3a3a',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        color: '#F0EEF0',
                        outline: 'none',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#f93b3b';
                        e.target.style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.3), 0 0 0 3px rgba(249, 59, 59, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#3a3a3a';
                        e.target.style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.3)';
                      }}
                    />
                    {/* Email icon indicator */}
                    <div style={{
                      position: 'absolute',
                      right: '1rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#888',
                      fontSize: '1.2rem',
                      pointerEvents: 'none',
                    }}>
                      ✉
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '1.25rem 2rem',
                      background: loading 
                        ? 'linear-gradient(135deg, #666 0%, #555 100%)'
                        : 'linear-gradient(135deg, #f93b3b 0%, #e12d2d 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontSize: '1rem',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '1.5px',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: loading
                        ? 'none'
                        : '0 4px 15px rgba(249, 59, 59, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2)',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(249, 59, 59, 0.4), 0 4px 6px rgba(0, 0, 0, 0.3)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!loading) {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(249, 59, 59, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2)';
                      }
                    }}
                    onMouseDown={(e) => {
                      if (!loading) {
                        e.currentTarget.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    {loading ? (
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <span style={{
                          display: 'inline-block',
                          width: '16px',
                          height: '16px',
                          border: '2px solid rgba(255, 255, 255, 0.3)',
                          borderTopColor: 'white',
                          borderRadius: '50%',
                          animation: 'spin 0.8s linear infinite',
                        }} />
                        Searching...
                      </span>
                    ) : (
                      'Continue'
                    )}
                  </button>
                </div>
              </motion.form>

              {/* Error Message */}
              {error && hasSearched && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    marginTop: '1.5rem',
                    padding: '1rem 1.25rem',
                    backgroundColor: 'rgba(249, 59, 59, 0.1)',
                    border: '1px solid rgba(249, 59, 59, 0.3)',
                    borderRadius: '8px',
                    color: '#f93b3b',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <span>⚠</span>
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Footer hint */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                style={{
                  marginTop: '2rem',
                  textAlign: 'center',
                  fontSize: '0.85rem',
                  color: '#666',
                  fontStyle: 'italic',
                }}
              >
                Secure access to your billing information
              </motion.p>
            </motion.div>
          </motion.div>
        )}

        {/* After Search Results */}
        {hasSearched && (
          <>
            {/* Loading Screen - Show during initial load */}
            {isInitialLoad && loading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: '#1b1c1e',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 9998,
                }}
              >
                <div style={{
                  textAlign: 'center',
                  color: '#F0EEF0',
                }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    border: '3px solid #3a3a3a',
                    borderTopColor: '#f93b3b',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 1.5rem',
                  }} />
                  <p style={{
                    fontSize: '1.2rem',
                    marginBottom: '0.5rem',
                    fontFamily: 'Bebas Neue, sans-serif',
                  }}>
                    Loading Account Information
                  </p>
                  <p style={{
                    fontSize: '0.9rem',
                    color: '#888',
                  }}>
                    Please wait...
                  </p>
                </div>
              </motion.div>
            ) : (
              <>
            {/* Dashboard Header */}
            <div style={{
              backgroundColor: '#2a2b2d',
              borderBottom: '1px solid #3a3a3a',
              padding: '1.5rem 3rem',
              marginBottom: '0',
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                maxWidth: '1400px',
                margin: '0 auto',
                width: '100%',
              }}>
                <div>
                  <h1 style={{
                    margin: 0,
                    fontSize: '1.75rem',
                    color: '#F0EEF0',
                    fontFamily: 'Bebas Neue, sans-serif',
                    letterSpacing: '1px',
                    marginBottom: '0.25rem',
                  }}>
                    ACCOUNT
                  </h1>
                  <p style={{
                    margin: 0,
                    color: '#888',
                    fontSize: '0.9rem',
                  }}>
                    {customerEmail || emailInput}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setHasSearched(false);
                    setEmailInput('');
                    setCustomerId(null);
                    setCustomerEmail(null);
                    setSubscription(null);
                    setError(null);
                    setIsInitialLoad(false);
                    setPlansLoaded(false);
                    localStorage.removeItem('stripe_customer_id');
                    localStorage.removeItem('stripe_customer_email');
                    if (username) {
                      localStorage.removeItem(`billing_email_${username}`);
                    }
                    navigate('/billing', { replace: true });
                  }}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: 'transparent',
                    border: '1px solid #3a3a3a',
                    borderRadius: '6px',
                    color: '#F0EEF0',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#f93b3b';
                    e.currentTarget.style.color = '#f93b3b';
                    e.currentTarget.style.backgroundColor = 'rgba(249, 59, 59, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#3a3a3a';
                    e.currentTarget.style.color = '#F0EEF0';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  ← Back to Billing
                </button>
              </div>
            </div>

            {/* Main Dashboard Content */}
            <div className="billing-dashboard-grid" style={{
              padding: '2rem 3rem',
              maxWidth: '1400px',
              margin: '0 auto',
              width: '100%',
              display: 'grid',
              gridTemplateColumns: 'repeat(12, 1fr)',
              gap: '2rem',
            }}>

            {error && (
              <div style={{
                padding: '1.25rem 1.5rem',
                backgroundColor: 'rgba(249, 59, 59, 0.1)',
                border: '1px solid #f93b3b',
                borderRadius: '8px',
                color: '#f93b3b',
                fontSize: '0.95rem',
                gridColumn: '1 / -1',
              }}>
                {error}
              </div>
            )}

            {/* Left Column: Current Subscription + Additional Purchases */}
            {!loading && customerId ? (
              <div className="billing-left-column" style={{
                gridColumn: subscription ? 'span 7' : '1 / -1',
                display: 'flex',
                flexDirection: 'column',
                gap: '2rem',
              }}>
                {/* Current Subscription Section */}
                {subscription && (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                  }}>
                    <h2 style={{
                      fontSize: '2rem',
                      marginBottom: 0,
                      color: '#F0EEF0',
                      fontFamily: 'Bebas Neue, sans-serif',
                      letterSpacing: '1px',
                    }}>
                      CURRENT SUBSCRIPTION
                    </h2>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="billing-subscription-card"
                      style={{
                        backgroundColor: '#2a2b2d',
                        padding: '2rem',
                        borderRadius: '12px',
                        border: '1px solid #3a3a3a',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                  {subscription ? (
                    <>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '1.25rem',
                        marginBottom: '1.5rem',
                        flex: '1',
                      }}>
                      <div>
                        <p style={{ color: '#888', fontSize: '0.75rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '500' }}>Status</p>
                        <span style={{
                          padding: '0.5rem 0.75rem',
                          backgroundColor: subscription.status === 'active' ? 'rgba(74, 197, 79, 0.2)' : 'rgba(249, 59, 59, 0.2)',
                          color: subscription.status === 'active' ? '#4ac54f' : '#f93b3b',
                          borderRadius: '6px',
                          textTransform: 'uppercase',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          display: 'inline-block',
                        }}>
                          {subscription.status}
                        </span>
                      </div>
                      
                      {subscription.planName && (
                        <div>
                          <p style={{ color: '#888', fontSize: '0.75rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '500' }}>Plan</p>
                          <p style={{ color: '#F0EEF0', fontSize: '1rem', fontWeight: '500', margin: 0 }}>{subscription.planName}</p>
                        </div>
                      )}
                      
                      {(subscription.amount !== null && subscription.amount !== undefined) && (
                        <div>
                          <p style={{ color: '#888', fontSize: '0.75rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '500' }}>Cost</p>
                          <p style={{ color: '#F0EEF0', fontSize: '1.1rem', fontWeight: '600', margin: 0 }}>
                            ${(subscription.amount / 100).toFixed(2)} {subscription.currency?.toUpperCase() || 'USD'}
                            {subscription.interval && (
                              <span style={{ fontSize: '0.85rem', fontWeight: 'normal', color: '#888', marginLeft: '0.5rem' }}>
                                /{subscription.interval}
                              </span>
                            )}
                          </p>
                        </div>
                      )}
                      
                      {subscription.status === 'active' && (
                        <div style={{ gridColumn: '1 / -1' }}>
                          <p style={{ color: '#888', fontSize: '0.75rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '500' }}>Current Period</p>
                          <p style={{ color: '#F0EEF0', fontSize: '0.95rem', margin: 0 }}>
                            {formatDate(subscription.currentPeriodStart)} - {formatDate(subscription.currentPeriodEnd)}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {subscription.cancelAtPeriodEnd && subscription.status === 'active' && (
                      <div style={{
                        padding: '0.875rem 1rem',
                        backgroundColor: 'rgba(249, 59, 59, 0.1)',
                        border: '1px solid #f93b3b',
                        borderRadius: '8px',
                        color: '#f93b3b',
                        fontSize: '0.85rem',
                        marginBottom: '1.5rem',
                      }}>
                        Your subscription will cancel at the end of the current period ({formatDate(subscription.currentPeriodEnd)}).
                      </div>
                    )}

                    <button
                      onClick={handleManageSubscription}
                      disabled={redirecting || loading}
                      style={{
                        width: '100%',
                        padding: '1rem 1.5rem',
                        backgroundColor: '#f93b3b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: (redirecting || loading) ? 'not-allowed' : 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        transition: 'all 0.2s',
                        opacity: (redirecting || loading) ? 0.7 : 1,
                        marginTop: 'auto',
                      }}
                      onMouseEnter={(e) => {
                        if (!redirecting && !loading) {
                          e.currentTarget.style.backgroundColor = '#e12d2d';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(249, 59, 59, 0.3)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!redirecting && !loading) {
                          e.currentTarget.style.backgroundColor = '#f93b3b';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }
                      }}
                    >
                      {redirecting ? 'Opening Portal...' : loading ? 'Loading...' : 'Manage Subscription & Invoices'}
                    </button>
                  </>
                ) : null}
                    </motion.div>
                  </div>
                )}

                {/* Account Information (when no subscription) */}
                {!subscription && (
                  <>
                    <h2 style={{
                      fontSize: '2rem',
                      marginBottom: '1.5rem',
                      color: '#F0EEF0',
                      fontFamily: 'Bebas Neue, sans-serif',
                      letterSpacing: '1px',
                    }}>
                      ACCOUNT INFORMATION
                    </h2>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        backgroundColor: '#2a2b2d',
                        padding: '2rem',
                        borderRadius: '12px',
                        border: '1px solid #3a3a3a',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <div style={{ marginBottom: '2rem' }}>
                        <p style={{
                          color: '#888',
                          fontSize: '1rem',
                          marginBottom: '1rem',
                          lineHeight: '1.6',
                        }}>
                          You have made purchases with this account. View your invoices and manage your billing information below.
                        </p>
                      </div>

                      <button
                        onClick={handleManageSubscription}
                        disabled={redirecting || loading}
                        style={{
                          width: '100%',
                          padding: '1.25rem 2rem',
                          backgroundColor: '#f93b3b',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: (redirecting || loading) ? 'not-allowed' : 'pointer',
                          fontSize: '1rem',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                          letterSpacing: '1px',
                          transition: 'all 0.2s',
                          opacity: (redirecting || loading) ? 0.7 : 1,
                          marginTop: 'auto',
                        }}
                        onMouseEnter={(e) => {
                          if (!redirecting && !loading) {
                            e.currentTarget.style.backgroundColor = '#e12d2d';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(249, 59, 59, 0.3)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!redirecting && !loading) {
                            e.currentTarget.style.backgroundColor = '#f93b3b';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                          }
                        }}
                      >
                        {redirecting ? 'Opening Portal...' : loading ? 'Loading...' : 'View Invoices & Billing'}
                      </button>
                    </motion.div>
                  </>
                )}

                {/* Additional Purchases Section - Only show if subscription exists */}
                {subscription && !loading && (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                  }}>
                    <div>
                      <h2 style={{
                        fontSize: '2rem',
                        marginBottom: '0.5rem',
                        color: '#F0EEF0',
                        fontFamily: 'Bebas Neue, sans-serif',
                        letterSpacing: '1px',
                      }}>
                        ADDITIONAL PURCHASES
                      </h2>
                      <p style={{
                        fontSize: '1rem',
                        color: '#888',
                        marginBottom: '0',
                      }}>
                        Browse one-time purchases you can add to your account.
                      </p>
                    </div>

                    {loading && plans.length === 0 && !plansLoaded ? (
                      <div style={{
                        textAlign: 'center',
                        padding: '3rem',
                        color: '#888',
                      }}>
                        <LoadingSpinner size="medium" />
                        <p style={{ marginTop: '1rem' }}>Loading plans...</p>
                      </div>
                    ) : plans.length > 0 ? (
                      (() => {
                        const oneTimePlans = plans.filter(plan => plan.interval === 'one-time');
                        
                        if (oneTimePlans.length === 0) return null;
                        
                        const renderPlanCard = (plan: SubscriptionPlan) => {
                          return (
                            <motion.div
                              key={plan.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              style={{
                                backgroundColor: '#2a2b2d',
                                padding: '2rem',
                                borderRadius: '12px',
                                border: '1px solid #3a3a3a',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'all 0.2s',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = '#f93b3b';
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.3)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = '#3a3a3a';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                              }}
                            >
                              <h3 style={{
                                fontSize: '1.5rem',
                                marginBottom: '0.75rem',
                                color: '#F0EEF0',
                                fontFamily: 'Bebas Neue, sans-serif',
                                letterSpacing: '0.5px',
                              }}>
                                {plan.name}
                              </h3>
                              {plan.description && (
                                <p style={{
                                  color: '#888',
                                  marginBottom: '1.5rem',
                                  fontSize: '0.9rem',
                                  lineHeight: '1.6',
                                  flex: '1',
                                }}>
                                  {plan.description}
                                </p>
                              )}
                              <div style={{
                                fontSize: '2.5rem',
                                fontWeight: 'bold',
                                color: '#F0EEF0',
                                marginBottom: '1.5rem',
                                fontFamily: 'Bebas Neue, sans-serif',
                              }}>
                                ${(plan.price / 100).toFixed(2)}
                              </div>
                              <button
                                onClick={() => handleSubscribe(plan.priceId)}
                                disabled={loading || redirecting}
                                style={{
                                  marginTop: 'auto',
                                  padding: '1rem 2rem',
                                  backgroundColor: '#f93b3b',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '8px',
                                  cursor: (loading || redirecting) ? 'not-allowed' : 'pointer',
                                  fontSize: '1rem',
                                  fontWeight: '600',
                                  textTransform: 'uppercase',
                                  letterSpacing: '1px',
                                  transition: 'all 0.2s',
                                  opacity: (loading || redirecting) ? 0.7 : 1,
                                }}
                                onMouseEnter={(e) => {
                                  if (!loading && !redirecting) {
                                    e.currentTarget.style.backgroundColor = '#e12d2d';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(249, 59, 59, 0.3)';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (!loading && !redirecting) {
                                    e.currentTarget.style.backgroundColor = '#f93b3b';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                  }
                                }}
                              >
                                {loading || redirecting ? 'Processing...' : 'Purchase'}
                              </button>
                            </motion.div>
                          );
                        };

                        return (
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                            gap: '1.5rem',
                          }}>
                            {oneTimePlans.map(renderPlanCard)}
                          </div>
                        );
                      })()
                    ) : null}
                  </div>
                )}
              </div>
            ) : null}

            {/* Previous Purchases Section - Right Column */}
            {!loading && customerId && (() => {
              // Get one-time purchases from allPurchases or fallback to oneTimePurchases
              const purchases = allPurchases && allPurchases.length > 0 
                ? allPurchases.filter(p => p.type === 'one-time')
                : oneTimePurchases.map(p => ({ ...p, type: 'one-time' as const }));
              
              if (purchases.length === 0) return null;
              
              // Create maps of payment intent IDs to checkout session data
              const paymentStatusMap = new Map<string, string>();
              const descriptionMap = new Map<string, string>();
              if (checkoutSessions && checkoutSessions.length > 0) {
                checkoutSessions.forEach((session: any) => {
                  if (session.paymentIntentId) {
                    if (session.paymentStatus) {
                      paymentStatusMap.set(session.paymentIntentId, session.paymentStatus);
                    }
                    if (session.description) {
                      descriptionMap.set(session.paymentIntentId, session.description);
                    }
                  }
                });
              }
              
              // Enrich purchases with payment status and description from checkout sessions
              const enrichedPurchases = purchases.map(purchase => {
                const paymentStatus = purchase.paymentIntentId 
                  ? paymentStatusMap.get(purchase.paymentIntentId) 
                  : null;
                
                // Use description from checkout session if purchase doesn't have one
                const description = purchase.description || (purchase.paymentIntentId 
                  ? descriptionMap.get(purchase.paymentIntentId) 
                  : null) || null;
                
                return {
                  ...purchase,
                  description: description,
                  paymentStatus: paymentStatus || null,
                };
              });
              
              // Component to handle scroll detection and indicators
              const PurchasesList = () => {
                const scrollContainerRef = useRef<HTMLDivElement>(null);
                const [showScrollIndicator, setShowScrollIndicator] = useState(false);
                const [isScrolled, setIsScrolled] = useState(false);
                
                useEffect(() => {
                  const container = scrollContainerRef.current;
                  if (!container) return;
                  
                  const checkScroll = () => {
                    const hasScroll = container.scrollHeight > container.clientHeight;
                    const scrolled = container.scrollTop > 0;
                    const canScrollMore = container.scrollTop < (container.scrollHeight - container.clientHeight - 10);
                    
                    setShowScrollIndicator(hasScroll && canScrollMore);
                    setIsScrolled(scrolled);
                  };
                  
                  checkScroll();
                  container.addEventListener('scroll', checkScroll);
                  window.addEventListener('resize', checkScroll);
                  
                  return () => {
                    container.removeEventListener('scroll', checkScroll);
                    window.removeEventListener('resize', checkScroll);
                  };
                }, [enrichedPurchases.length]);
                
                return (
                  <div style={{ position: 'relative' }}>
                    <div 
                      ref={scrollContainerRef}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        overflowY: 'auto',
                        maxHeight: subscription ? '700px' : 'none',
                        paddingRight: '0.75rem',
                        scrollbarWidth: 'thin',
                        scrollbarColor: '#f93b3b #2a2b2d',
                      }}
                      className="purchases-scroll-container"
                    >
                      {enrichedPurchases.map((purchase) => (
                  <motion.div
                    key={purchase.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      backgroundColor: '#2a2b2d',
                      padding: '1.5rem',
                      borderRadius: '12px',
                      border: '1px solid #3a3a3a',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <h3 style={{
                        fontSize: '1rem',
                        color: '#F0EEF0',
                        fontFamily: 'Bebas Neue, sans-serif',
                        margin: 0,
                        letterSpacing: '0.5px',
                      }}>
                        {purchase.description || 'ONE-TIME PURCHASE'}
                      </h3>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        backgroundColor: 'rgba(59, 130, 246, 0.2)',
                        color: '#3b82f6',
                        borderRadius: '4px',
                        textTransform: 'uppercase',
                        fontSize: '0.65rem',
                        fontWeight: '600',
                        letterSpacing: '0.5px',
                      }}>
                        One-Time
                      </span>
                    </div>
                    
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: '0.75rem',
                      marginBottom: '1rem',
                      flex: '1',
                    }}>
                      {/* Amount */}
                      <div>
                        <p style={{ color: '#888', fontSize: '0.7rem', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '500' }}>Amount</p>
                        <p style={{ color: '#F0EEF0', fontSize: '1.1rem', fontWeight: '600', margin: 0 }}>
                          ${(purchase.amount / 100).toFixed(2)} {purchase.currency?.toUpperCase() || 'USD'}
                        </p>
                      </div>
                      
                      {/* Date */}
                      <div>
                        <p style={{ color: '#888', fontSize: '0.7rem', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '500' }}>Date</p>
                        <p style={{ color: '#F0EEF0', fontSize: '0.85rem', margin: 0 }}>{formatDate(purchase.date)}</p>
                      </div>
                      
                      {/* Status */}
                      <div>
                        <p style={{ color: '#888', fontSize: '0.7rem', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '500' }}>Status</p>
                        <span style={{
                          padding: '0.375rem 0.75rem',
                          backgroundColor: purchase.status === 'succeeded' ? 'rgba(74, 197, 79, 0.2)' : 'rgba(249, 59, 59, 0.2)',
                          color: purchase.status === 'succeeded' ? '#4ac54f' : '#f93b3b',
                          borderRadius: '4px',
                          textTransform: 'uppercase',
                          fontSize: '0.7rem',
                          fontWeight: '600',
                          display: 'inline-block',
                        }}>
                          {purchase.status}
                        </span>
                      </div>

                      {/* Payment Method */}
                      {purchase.paymentMethod && purchase.paymentMethod.card && (
                        <div>
                          <p style={{ color: '#888', fontSize: '0.7rem', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '500' }}>Payment</p>
                          <p style={{ color: '#F0EEF0', fontSize: '0.85rem', margin: 0 }}>
                            {purchase.paymentMethod.card.brand.toUpperCase()} •••• {purchase.paymentMethod.card.last4}
                          </p>
                        </div>
                      )}
                    </div>

                    {purchase.receiptUrl && (
                      <button
                        onClick={() => window.open(purchase.receiptUrl || '', '_blank', 'noopener,noreferrer')}
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          backgroundColor: '#f93b3b',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          transition: 'all 0.2s',
                          marginTop: '0.5rem',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#e12d2d';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(249, 59, 59, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#f93b3b';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        View Receipt
                      </button>
                    )}
                  </motion.div>
                      ))}
                    </div>
                    
                    {/* Scroll Indicator - Gradient fade at bottom */}
                    {showScrollIndicator && (
                      <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: '0.75rem',
                        height: '60px',
                        background: 'linear-gradient(to top, rgba(42, 43, 45, 0.95) 0%, rgba(42, 43, 45, 0.7) 50%, transparent 100%)',
                        pointerEvents: 'none',
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'center',
                        paddingBottom: '0.5rem',
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          color: '#888',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}>
                          <span>↓</span>
                          <span>Scroll for more</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Scroll Indicator - Gradient fade at top when scrolled */}
                    {isScrolled && (
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: '0.75rem',
                        height: '40px',
                        background: 'linear-gradient(to bottom, rgba(42, 43, 45, 0.95) 0%, rgba(42, 43, 45, 0.7) 50%, transparent 100%)',
                        pointerEvents: 'none',
                      }} />
                    )}
                  </div>
                );
              };
              
              return (
                <div className="billing-right-column" style={{
                  gridColumn: subscription ? 'span 5' : '1 / -1',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}>
                  <h2 style={{
                    fontSize: '2rem',
                    marginBottom: 0,
                    color: '#F0EEF0',
                    fontFamily: 'Bebas Neue, sans-serif',
                    letterSpacing: '1px',
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '0.75rem',
                  }}>
                    PREVIOUS PURCHASES
                    <span style={{
                      fontSize: '1.25rem',
                      color: '#888',
                      fontWeight: '400',
                      fontFamily: 'inherit',
                    }}>
                      ({enrichedPurchases.length})
                    </span>
                  </h2>
                  <div className="billing-purchases-card" style={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: '#2a2b2d',
                    padding: '2rem',
                    borderRadius: '12px',
                    border: '1px solid #3a3a3a',
                    position: 'relative',
                  }}>
                    <PurchasesList />
                  </div>
                </div>
              );
            })()}
            
            {/* Debug: Show if oneTimePurchases is empty but customerId exists */}
            {!loading && customerId && (!oneTimePurchases || oneTimePurchases.length === 0) && (
              <div style={{ 
                padding: '1rem', 
                backgroundColor: '#2a2b2d', 
                borderRadius: '4px', 
                marginBottom: '2rem',
                color: '#888',
                fontSize: '0.9rem'
              }}>
                Debug: Customer ID exists but no one-time purchases found. Check server logs for charge retrieval.
              </div>
            )}

            {/* Show plans when no subscription - Full width at bottom */}
            {!loading && !subscription && (
              <>
                {!customerId && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      textAlign: 'center',
                      padding: '3rem 2rem',
                      marginBottom: '3rem',
                      gridColumn: '1 / -1',
                    }}
                  >
                    <h2 style={{
                      fontSize: '2rem',
                      marginBottom: '1rem',
                      color: '#F0EEF0',
                      fontFamily: 'Bebas Neue, sans-serif',
                    }}>
                      No Subscriptions Found
                    </h2>
                    <p style={{
                      fontSize: '1.1rem',
                      color: '#888',
                      marginBottom: '2rem',
                    }}>
                      You don't have any active subscriptions. Choose a plan below to get started.
                    </p>
                  </motion.div>
                )}

                {/* Plans Section - Full width when no subscription */}
                <div style={{ gridColumn: '1 / -1' }}>
                  {customerId && !subscription && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        textAlign: 'center',
                        padding: '3rem 2rem',
                        marginBottom: '3rem',
                      }}
                    >
                      <h2 style={{
                        fontSize: '2rem',
                        marginBottom: '1rem',
                        color: '#F0EEF0',
                        fontFamily: 'Bebas Neue, sans-serif',
                      }}>
                        Available Plans
                      </h2>
                      <p style={{
                        fontSize: '1.1rem',
                        color: '#888',
                        marginBottom: '2rem',
                      }}>
                        Browse available subscription plans and one-time purchases below.
                      </p>
                    </motion.div>
                  )}

                  <h2 style={{
                    fontSize: '2rem',
                    marginBottom: '2rem',
                    color: '#F0EEF0',
                    fontFamily: 'Bebas Neue, sans-serif',
                    letterSpacing: '1px',
                  }}>
                    CHOOSE A PLAN
                  </h2>
                  
                    {loading && plans.length === 0 && !plansLoaded ? (
                      <div style={{
                        textAlign: 'center',
                        padding: '3rem',
                        color: '#888',
                      }}>
                        <LoadingSpinner size="medium" />
                        <p style={{ marginTop: '1rem' }}>Loading plans...</p>
                      </div>
                    ) : plans.length > 0 ? (
                      <>
                        {/* Separate plans into subscriptions and one-time */}
                        {(() => {
                          // If user has subscription, only show one-time plans
                          const filteredPlans = subscription 
                            ? plans.filter(plan => plan.interval === 'one-time')
                            : plans;
                          
                          const subscriptionPlans = filteredPlans.filter(plan => plan.interval !== 'one-time');
                          const oneTimePlans = filteredPlans.filter(plan => plan.interval === 'one-time');
                          
                          const renderPlanCard = (plan: SubscriptionPlan) => {
                            return (
                            <motion.div
                              key={plan.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              style={{
                                backgroundColor: '#2a2b2d',
                                padding: '2rem',
                                borderRadius: '12px',
                                border: '1px solid #3a3a3a',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'all 0.2s',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = '#f93b3b';
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.3)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = '#3a3a3a';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                              }}
                            >
                              <h3 style={{
                                fontSize: '1.5rem',
                                marginBottom: '0.75rem',
                                color: '#F0EEF0',
                                fontFamily: 'Bebas Neue, sans-serif',
                                letterSpacing: '0.5px',
                              }}>
                                {plan.name}
                              </h3>
                              {plan.description && (
                                <p style={{
                                  color: '#888',
                                  marginBottom: '1.5rem',
                                  fontSize: '0.9rem',
                                  lineHeight: '1.6',
                                  flex: '1',
                                }}>
                                  {plan.description}
                                </p>
                              )}
                              <div style={{
                                fontSize: '2.5rem',
                                fontWeight: 'bold',
                                color: '#F0EEF0',
                                marginBottom: '1.5rem',
                                fontFamily: 'Bebas Neue, sans-serif',
                              }}>
                                ${(plan.price / 100).toFixed(2)}
                                {plan.interval !== 'one-time' && (
                                  <span style={{
                                    fontSize: '1rem',
                                    color: '#888',
                                    fontWeight: 'normal',
                                    marginLeft: '0.5rem',
                                  }}>
                                    /{plan.interval}
                                  </span>
                                )}
                              </div>
                              <button
                                onClick={() => handleSubscribe(plan.priceId)}
                                disabled={loading || redirecting}
                                style={{
                                  marginTop: 'auto',
                                  padding: '1rem 2rem',
                                  backgroundColor: '#f93b3b',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '8px',
                                  cursor: (loading || redirecting) ? 'not-allowed' : 'pointer',
                                  fontSize: '1rem',
                                  fontWeight: '600',
                                  textTransform: 'uppercase',
                                  letterSpacing: '1px',
                                  transition: 'all 0.2s',
                                  opacity: (loading || redirecting) ? 0.7 : 1,
                                }}
                                onMouseEnter={(e) => {
                                  if (!loading && !redirecting) {
                                    e.currentTarget.style.backgroundColor = '#e12d2d';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(249, 59, 59, 0.3)';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (!loading && !redirecting) {
                                    e.currentTarget.style.backgroundColor = '#f93b3b';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                  }
                                }}
                              >
                                {loading || redirecting ? 'Processing...' : plan.interval === 'one-time' ? 'Purchase' : 'Subscribe'}
                              </button>
                            </motion.div>
                            );
                          };

                          return (
                            <>
                              {/* Subscription Plans - Only show if no subscription */}
                              {!subscription && subscriptionPlans.length > 0 && (
                                <div style={{ marginBottom: '3rem' }}>
                                  <h3 style={{
                                    fontSize: '1.5rem',
                                    marginBottom: '1.5rem',
                                    color: '#888',
                                    fontFamily: 'Bebas Neue, sans-serif',
                                    letterSpacing: '1px',
                                    textTransform: 'uppercase',
                                  }}>
                                    Subscriptions
                                  </h3>
                                  <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                                    gap: '1.5rem',
                                  }}>
                                    {subscriptionPlans.map(renderPlanCard)}
                                  </div>
                                </div>
                              )}

                              {/* One-Time Plans */}
                              {oneTimePlans.length > 0 && (
                                <div>
                                  {!subscription && (
                                    <h3 style={{
                                      fontSize: '1.5rem',
                                      marginBottom: '1.5rem',
                                      color: '#888',
                                      fontFamily: 'Bebas Neue, sans-serif',
                                      letterSpacing: '1px',
                                      textTransform: 'uppercase',
                                    }}>
                                      One-Time Purchases
                                    </h3>
                                  )}
                                  <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                                    gap: '1.5rem',
                                  }}>
                                    {oneTimePlans.map(renderPlanCard)}
                                  </div>
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </>
                    ) : (
                      <div style={{
                        textAlign: 'center',
                        padding: '3rem',
                        color: '#888',
                        backgroundColor: '#2a2b2d',
                        borderRadius: '12px',
                        border: '1px solid #3a3a3a',
                      }}>
                        <p style={{ marginBottom: '1rem' }}>No plans available at this time.</p>
                        <p style={{ fontSize: '0.9rem', color: '#666' }}>
                          Please check that your server is running and Stripe products are configured.
                        </p>
                      </div>
                    )}
                  </div>
              </>
            )}
            </div>
          </>
        )}
        </>
        )}
      </div>
    </motion.div>
    </>
  );
};

export default SimpleBilling;
