import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { createPortalSession, createCheckoutSession, getCustomerSubscription, getStripeProducts } from '../../utils/stripeApi';
import './styles.css';

interface SubscriptionPlan {
  id: string;
  productId?: string;
  productName?: string;
  name: string;
  description?: string;
  image?: string | null;
  price: number;
  currency: string;
  interval: 'month' | 'year' | 'one-time';
  priceId: string; // Stripe Price ID (e.g., price_xxxxx)
}

interface CustomerSubscription {
  status: string;
  currentPeriodEnd: number;
  planName?: string;
  cancelAtPeriodEnd?: boolean;
}

const Billing: React.FC = () => {
  const title = 'Billing';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscription, setSubscription] = useState<CustomerSubscription | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [customerEmail, setCustomerEmail] = useState<string | null>(null);
  const [showPortal, setShowPortal] = useState(false);
  const [portalUrl, setPortalUrl] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = `TRASH - ${title}`;

    // Get customer ID and email from localStorage
    const storedCustomerId = localStorage.getItem('stripe_customer_id');
    const storedCustomerEmail = localStorage.getItem('stripe_customer_email');
    
    if (storedCustomerId) {
      setCustomerId(storedCustomerId);
      // Load subscription status
      loadSubscription(storedCustomerId);
    }
    if (storedCustomerEmail) {
      setCustomerEmail(storedCustomerEmail);
    }

    // Check URL params for success/cancel
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      setError(null);
      const sessionId = urlParams.get('session_id');
      // If we have a session ID, we can retrieve customer info
      // For now, we'll rely on localStorage or manual setting
      if (storedCustomerId) {
        // Refresh subscription status after successful payment
        loadSubscription(storedCustomerId);
      }
    }
    if (urlParams.get('canceled') === 'true') {
      setError('Checkout was canceled.');
    }

    // Load plans from Stripe API (dynamic) or environment/config
    loadPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadSubscription = async (id: string) => {
    try {
      setLoading(true);
      const subData = await getCustomerSubscription(id);
      if (subData) {
        setSubscription(subData);
      }
    } catch (err: any) {
      // If subscription doesn't exist, that's okay
      console.log('No active subscription found');
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  const loadPlans = async () => {
    // Auto-detect production URL, fallback to localhost for development
    let serverlessUrl = process.env.REACT_APP_STRIPE_SERVERLESS_URL;
    if (!serverlessUrl && typeof window !== 'undefined') {
      serverlessUrl = `${window.location.origin}/api`;
    }
    if (!serverlessUrl) {
      serverlessUrl = 'http://localhost:3001/api';
    }

    try {
      setLoading(true);
      
      // Try to fetch from Stripe API first (dynamic)
      try {
        const productsData = await getStripeProducts('all');
        if (productsData && productsData.products && productsData.products.length > 0) {
          // Transform Stripe API response to our plan format
          console.log('[BILLING] Raw products data from API:', productsData.products);
          const transformedPlans: SubscriptionPlan[] = productsData.products.map((product: any) => {
            console.log(`[BILLING] Product ${product.productName} - productImage:`, product.productImage);
            return {
              id: product.id,
              productId: product.productId,
              name: product.productName,
              description: product.productDescription,
              image: product.productImage || null,
              price: product.price,
              currency: product.currency,
              interval: product.interval,
              priceId: product.priceId,
            };
          });
          console.log('[BILLING] Transformed plans:', transformedPlans);
          
          console.log('Loaded plans from Stripe API:', transformedPlans);
          setPlans(transformedPlans);
          setLoading(false);
          return;
        }
      } catch (apiError: any) {
        console.warn('Failed to fetch from Stripe API, trying fallback:', apiError);
      }

      // Fallback: Try environment variable configuration
      const plansEnv = process.env.REACT_APP_STRIPE_PLANS;
      if (plansEnv) {
        const parsedPlans = JSON.parse(plansEnv);
        console.log('Loaded plans from environment:', parsedPlans);
        setPlans(parsedPlans);
        setLoading(false);
        return;
      }

      // No plans found
      console.warn('No plans found from API or environment variables');
      setPlans([]);
      setError('No subscription plans found. Please ensure your Stripe products are active and have prices configured, or add REACT_APP_STRIPE_PLANS to your .env file.');
    } catch (err: any) {
      console.error('Error loading plans:', err);
      setError(`Failed to load subscription plans: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!customerId) {
      setError('Customer ID not found. Please contact support.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const url = await createPortalSession(customerId);
      setPortalUrl(url);
      setShowPortal(true);
    } catch (err: any) {
      setError(err.message || 'Failed to open billing portal');
      setLoading(false);
    }
  };

  const handleSubscribe = async (priceId: string) => {
    try {
      setLoading(true);
      setError(null);
      // Create checkout session and redirect to Stripe's hosted checkout page
      const checkoutUrl = await createCheckoutSession(
        priceId,
        customerId || undefined,
        customerEmail || undefined
      );
      // Redirect to Stripe's hosted checkout page
      window.location.href = checkoutUrl;
    } catch (err: any) {
      setError(err.message || 'Failed to start checkout');
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const fadeOut = {
    hidden: {
      opacity: 0,
      y: 200,
    },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        ease: 'easeInOut',
        duration: 1.6,
      },
    },
    exit: {
      opacity: 0,
      y: -200,
      transition: {
        ease: 'easeInOut',
        duration: 1.6,
      },
    },
  };

  return (
    <motion.div
      className="billing-container"
      initial="hidden"
      animate="show"
      exit="exit"
      variants={fadeOut}
    >
      <div className="billing-content">
        <div className="billing-header">
          <h1 className="billing-title">Billing & Subscription</h1>
          <p className="billing-subtitle">Manage your subscription and billing information</p>
        </div>

        {error && (
          <div className="billing-error">
            <p>{error}</p>
            <button onClick={() => setError(null)} className="error-close">×</button>
          </div>
        )}

        {showPortal && portalUrl ? (
          <div className="portal-container">
            <div className="portal-header">
              <h2>Billing Portal</h2>
              <button onClick={() => setShowPortal(false)} className="portal-close">×</button>
            </div>
            <iframe
              src={portalUrl}
              className="portal-iframe"
              title="Stripe Customer Portal"
              onLoad={() => setLoading(false)}
            />
          </div>
        ) : (
          <>
            {subscription && subscription.status === 'active' ? (
              <div className="subscription-status">
                <div className="status-card">
                  <h2>Current Subscription</h2>
                  <div className="status-info">
                    <p>
                      <strong>Status:</strong> <span className={`status-badge ${subscription.status}`}>{subscription.status}</span>
                    </p>
                    {subscription.planName && (
                      <p>
                        <strong>Plan:</strong> {subscription.planName}
                      </p>
                    )}
                    <p>
                      <strong>Current Period Ends:</strong> {formatDate(subscription.currentPeriodEnd)}
                    </p>
                    {subscription.cancelAtPeriodEnd && (
                      <p className="cancel-notice">
                        Your subscription will cancel at the end of the current period.
                      </p>
                    )}
                  </div>
                  <button
                    onClick={handleManageSubscription}
                    disabled={loading}
                    className="manage-button"
                  >
                    {loading ? 'Loading...' : 'Manage Subscription'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="subscription-plans">
                <h2>Choose a Plan</h2>
                {loading && plans.length === 0 ? (
                  <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading plans...</p>
                  </div>
                ) : plans.length > 0 ? (
                  <div className="plans-grid">
                    {plans.map((plan) => (
                      <div key={plan.id} className="plan-card">
                        {plan.image && (
                          <img 
                            src={plan.image} 
                            alt={plan.name}
                            className="plan-image"
                            onError={(e) => {
                              console.error(`[BILLING] Failed to load image for ${plan.name}:`, plan.image);
                              e.currentTarget.style.display = 'none';
                            }}
                            onLoad={() => {
                              console.log(`[BILLING] Successfully loaded image for ${plan.name}:`, plan.image);
                            }}
                            style={{
                              width: '100%',
                              height: '200px',
                              objectFit: 'cover',
                              borderRadius: '8px',
                              marginBottom: '1rem',
                            }}
                          />
                        )}
                        <h3 className="plan-name">{plan.name}</h3>
                        {plan.description && (
                          <p className="plan-description">{plan.description}</p>
                        )}
                        <div className="plan-price">
                          <span className="price-amount">
                            ${(plan.price / 100).toFixed(2)}
                          </span>
                          {plan.interval !== 'one-time' && (
                            <span className="price-interval">/{plan.interval}</span>
                          )}
                        </div>
                        <button
                          onClick={() => handleSubscribe(plan.priceId)}
                          disabled={loading}
                          className="subscribe-button"
                        >
                          {loading ? 'Processing...' : plan.interval === 'one-time' ? 'Purchase' : 'Subscribe'}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-plans">
                    <p>No subscription plans available at this time.</p>
                    <p>Please configure your Stripe Price IDs in the environment variables.</p>
                    <p className="config-help">
                      Add <code>REACT_APP_STRIPE_PLANS</code> to your .env file with your plan configuration.
                      <br />
                      Get Price IDs from Stripe Dashboard → Products → [Your Product] → Pricing
                    </p>
                  </div>
                )}
              </div>
            )}

            {subscription && subscription.status === 'active' && (
              <div className="additional-actions">
                <button
                  onClick={handleManageSubscription}
                  disabled={loading}
                  className="secondary-button"
                >
                  {loading ? 'Loading...' : 'View Invoices & Payment Methods'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
};

export default Billing;

