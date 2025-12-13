/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { STRIPE_CONFIG } from '@/lib/config';

// TODO:: typy

const stripeSecretKey = STRIPE_CONFIG.secretKey;
if (!stripeSecretKey)
  throw new Error('STRIPE_SECRET_KEY environment variable is not set');

const stripe = new Stripe(stripeSecretKey);

export async function GET() {
  try {
    const products = await stripe.products.list({ active: true });
    const prices = await stripe.prices.list({
      expand: ['data.product'],
      active: true,
      type: 'recurring',
    });

    const activeProductIds = new Set(products.data.map(p => p.id));
    const filteredPrices = prices.data.filter(price => {
      if (typeof price.product === 'string') return false;
      return activeProductIds.has(price.product.id);
    });

    const plans = filteredPrices.map(price => ({
      id: price.id,
      name: (price.product as any).name,
      description: (price.product as any).description,
      price: price.unit_amount,
      interval: (price.recurring as any).interval,
      price_id: price.id,
    }));

    return NextResponse.json(plans);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Error fetching subscription plans' },
      { status: 500 }
    );
  }
}
