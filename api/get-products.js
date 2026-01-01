/**
 * Serverless Function to Get Stripe Products and Prices
 * Fetches all active products and their prices from Stripe
 * 
 * Vercel: Place in /api/get-products.js
 * Netlify: Place in /netlify/functions/get-products.js
 */

// For Vercel
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

  try {
    // Get query parameters for filtering
    const { activeOnly = 'true', type = 'all' } = req.query;
    // type can be: 'all', 'recurring', 'one-time'

    // Fetch all active products
    const products = await stripe.products.list({
      active: activeOnly === 'true',
      limit: 100, // Adjust if you have more products
    });

    // Fetch all prices
    const prices = await stripe.prices.list({
      active: true,
      limit: 100,
    });

    // Create a map of prices by product ID
    const pricesByProduct = {};
    prices.data.forEach(price => {
      if (!pricesByProduct[price.product]) {
        pricesByProduct[price.product] = [];
      }
      pricesByProduct[price.product].push(price);
    });

    // Combine products with their prices
    const productsWithPrices = products.data
      .map(product => {
        const productPrices = pricesByProduct[product.id] || [];
        
        // Filter prices by type if specified
        let filteredPrices = productPrices;
        if (type === 'recurring') {
          filteredPrices = productPrices.filter(p => p.type === 'recurring');
        } else if (type === 'one-time') {
          filteredPrices = productPrices.filter(p => p.type === 'one_time');
        }

        // Return product with all its prices
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
      .filter(item => item.priceId); // Only include products that have prices

    return res.status(200).json({
      products: productsWithPrices,
      count: productsWithPrices.length,
    });
  } catch (error) {
    return res.status(500).json({ 
      message: error.message,
      error: 'Failed to fetch products from Stripe' 
    });
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
  const { activeOnly = 'true', type = 'all' } = event.queryStringParameters || {};

  try {
    const products = await stripe.products.list({
      active: activeOnly === 'true',
      limit: 100,
    });

    const prices = await stripe.prices.list({
      active: true,
      limit: 100,
    });

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

    return {
      statusCode: 200,
      body: JSON.stringify({
        products: productsWithPrices,
        count: productsWithPrices.length,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: error.message,
        error: 'Failed to fetch products from Stripe' 
      }),
    };
  }
};
*/



