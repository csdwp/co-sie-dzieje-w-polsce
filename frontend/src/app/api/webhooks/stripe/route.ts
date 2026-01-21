import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClerkClient } from '@clerk/backend';
import { CLERK_CONFIG, STRIPE_CONFIG } from '@/lib/config';

const stripe = new Stripe(STRIPE_CONFIG.secretKey!);
const clerkClient = createClerkClient({
  secretKey: CLERK_CONFIG.secretKey,
});

export async function POST(req: Request) {
  const body = await req.text();
  const sig = (await headers()).get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      STRIPE_CONFIG.webhookSecret!
    );
  } catch (err) {
    console.error('❌ Invalid signature', err);
    return new NextResponse('Invalid signature', { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.clerkUserId;

      if (userId) {
        await clerkClient.users.updateUserMetadata(userId, {
          publicMetadata: {
            subscription_status: 'active',
          },
        });
        console.log('✅ Subscription activated for:', userId);
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.clerkUserId;

      if (userId) {
        await clerkClient.users.updateUserMetadata(userId, {
          publicMetadata: {
            subscription_status: 'canceled',
          },
        });
        console.log('❌ Subscription canceled for:', userId);
      }
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const userId = invoice.metadata?.clerkUserId;

      if (userId) {
        await clerkClient.users.updateUserMetadata(userId, {
          publicMetadata: {
            subscription_status: 'past_due',
          },
        });
        console.log('⚠️ Payment failed for:', userId);
      }
      break;
    }

    default:
      console.log(`Unhandled event: ${event.type}`);
  }

  return new NextResponse('ok', { status: 200 });
}
