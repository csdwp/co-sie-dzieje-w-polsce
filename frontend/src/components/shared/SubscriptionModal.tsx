'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { useUser } from '@clerk/nextjs';

interface CheckoutSessionResponse {
  sessionId: string;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: string;
  price_id: string;
}

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

const SubscriptionModal = ({ onClose }: { onClose: () => void }) => {
  const [plans, setPlans] = useState([]);
  const { user } = useUser();

  useEffect(() => {
    fetch('/api/subscription-plans')
      .then(res => res.json())
      .then(data => setPlans(data));
  }, []);

  const handleSubscribe = async (priceId: string): Promise<void> => {
    const stripe = await stripePromise;
    const { sessionId }: CheckoutSessionResponse = await fetch(
      '/api/create-checkout-session',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId, userId: user?.id }),
      }
    ).then(res => res.json());

    if (!stripe) {
      console.error('Stripe failed to load.');
      return;
    }

    const result = await stripe.redirectToCheckout({ sessionId });

    if (result.error) {
      console.error(result.error);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="overflow-auto w-11/12 h-fit lg:w-5/12 lg:h-fit !max-w-[1000px] !max-h-[800px] rounded-3xl flex flex-col gap-6 border-none">
        <DialogHeader className="h-fit">
          <DialogTitle className="text-2xl font-bold leading-tight tracking-tighter text-left">
            Odblokuj pełny dostęp do aktów prawnych – bez ograniczeń!
          </DialogTitle>
          <DialogDescription className="text-base font-light dark:text-neutral-100 md:max-w-4/5 text-left">
            Z subskrypcją zyskasz nielimitowany dostęp do pełnych i skróconych
            aktów prawnych, statystyk, kategorii oraz cennych informacji – bez
            limitu 3 aktów dziennie. Oszczędzaj czas i bądź na bieżąco z prawem!
          </DialogDescription>
        </DialogHeader>
        <ProductsWrapper plans={plans} handleSubscribe={handleSubscribe} />
      </DialogContent>
    </Dialog>
  );
};

const ProductsWrapper = ({}: // plans,
// handleSubscribe,
{
  plans: SubscriptionPlan[];
  handleSubscribe: (priceId: string) => void;
}) => {
  return (
    <div className="flex flex-col gap-4 text-left text-sm">
      <div className="flex gap-4">
        {/* {plans.map(plan => (
          <Product
            key={plan.id}
            plan={plan}
            handleSubscribe={handleSubscribe}
          />
        ))} */}
        <button className="w-fit text-lg px-6 py-3 red-background-gloss font-semibold text-white rounded-lg shadow-none hover:shadow-2xl hover:shadow-red-500/60 focus:shadow-none active:shadow-none transition-shadow duration-300 cursor-pointer">
          <div className="description Box-root text-start">
            <h3>Subskrybuj</h3>
            <p>Subskrypcja odnawia się automatycznie co miesiąc</p>
            <p>Cena: 20 zł / miesiąc</p>
          </div>
        </button>
      </div>

      <label className="flex items-start gap-2 cursor-pointer group">
        <input type="checkbox" required className="hidden peer mt-1" />
        <svg
          className="w-4.5 h-4.5 flex-shrink-0 mt-px text-neutral-600 group-hover:text-neutral-900 peer-checked:text-neutral-900 peer-checked:group-hover:text-neutral-900 dark:text-neutral-500 dark:group-hover:text-neutral-100 dark:peer-checked:text-neutral-100 dark:peer-checked:group-hover:text-neutral-100 opacity-50 peer-checked:opacity-100 group-hover:opacity-100 duration-300 transition-all"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
        <span>
          Wyrażam zgodę na rozpoczęcie świadczenia usługi przed upływem terminu
          odstąpienia i przyjmuję do wiadomości, że tracę prawo do odstąpienia
          od umowy.
        </span>
      </label>

      <p className="text-xs text-neutral-500">
        Subskrypcja odnawia się automatycznie co miesiąc. Możesz anulować w
        dowolnym momencie w ustawieniach swojego konta Stripe. <br />
        <a href="/regulamin" className="underline">
          Regulamin
        </a>{' '}
        |{' '}
        <a href="/polityka-prywatnosci" className="underline">
          Polityka prywatności
        </a>
      </p>
    </div>
  );
};

// Im leaving this because we gonna use it later

// const Product = ({
//   plan,
//   handleSubscribe,
// }: {
//   plan: SubscriptionPlan;
//   handleSubscribe: (priceId: string) => void;
// }) => {
//   return (
//     <button
//       key={plan.id}
//       className="w-fit text-lg px-6 py-3 red-background-gloss font-semibold text-white rounded-lg shadow-none hover:shadow-2xl hover:shadow-red-500/60 focus:shadow-none active:shadow-none transition-shadow duration-300 cursor-pointer"
//       onClick={() => handleSubscribe(plan.price_id)}
//     >
//       <div className="description Box-root text-start">
//         <h3>{plan.name}</h3>
//         <p>{plan.description}</p>
//         <p>
//           Cena: ${plan.price / 100} / {plan.interval}
//         </p>
//       </div>
//     </button>
//   );
// };

export default SubscriptionModal;
