import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { STRIPE_CONFIG } from '@/lib/config';

const stripeSecretKey = STRIPE_CONFIG.secretKey;
if (!stripeSecretKey)
  throw new Error('STRIPE_SECRET_KEY environment variable is not set');

const stripe = new Stripe(stripeSecretKey);

interface CreateCheckoutSessionRequest {
  priceId: string;
  userId: string;
}

interface CreateCheckoutSessionResponse {
  sessionId?: string;
  error?: string;
}

export const POST = async (
  request: Request
): Promise<NextResponse<CreateCheckoutSessionResponse>> => {
  const { priceId, userId }: CreateCheckoutSessionRequest =
    await request.json();

  console.log(priceId);

  try {
    const session: Stripe.Checkout.Session =
      await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: `${request.headers.get('origin')}/?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${request.headers.get('origin')}/`,
        metadata: {
          clerkUserId: userId ?? '',
        },
      });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Error creating checkout session' },
      { status: 500 }
    );
  }
};
